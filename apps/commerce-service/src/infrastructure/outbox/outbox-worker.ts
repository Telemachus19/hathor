import { eq, and, sql, lte, asc } from 'drizzle-orm';
import { commerceDb } from '../db/client.js';
import { outboxEvents } from '../db/schema.js';
import {
  outboxAgeGauge,
  outboxDlqDepthGauge,
  outboxFailedCounter,
  outboxProcessingLatency,
  outboxPublishedCounter,
  outboxRetriedCounter,
  rabbitMqQueueDepthGauge,
} from '../metrics.js';
import { OutboxPublisher } from './outbox-publisher.js';

export interface OutboxWorkerConfig {
  pollIntervalMs?: number;
  batchSize?: number;
  maxRetries?: number;
  primaryExchange?: string;
  dlxExchange?: string;
  monitoredQueues?: string[];
}

export class OutboxWorker {
  private publisher: OutboxPublisher;
  private pollIntervalMs: number;
  private batchSize: number;
  private maxRetries: number;
  private primaryExchange: string;
  private dlxExchange: string;
  private monitoredQueues: string[];
  private timer: NodeJS.Timeout | null = null;
  private running = false;
  private processing = false;

  constructor(publisher: OutboxPublisher, config: OutboxWorkerConfig = {}) {
    this.publisher = publisher;
    this.pollIntervalMs = config.pollIntervalMs ?? 1000;
    this.batchSize = config.batchSize ?? 50;
    this.maxRetries = config.maxRetries ?? 5;
    this.primaryExchange = config.primaryExchange ?? 'hathor.domain.events';
    this.dlxExchange = config.dlxExchange ?? 'hathor.dlx';
    this.monitoredQueues = config.monitoredQueues ?? [
      'library.order-paid.queue',
      'library.order-paid-retry.queue',
      'hathor.dlq',
    ];
  }

  public start(): void {
    if (this.running) return;
    this.running = true;
    console.log('[OutboxWorker] Outbox background worker started');
    this.scheduleNextTick(0);
  }

  public stop(): void {
    this.running = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    console.log('[OutboxWorker] Outbox background worker stopped');
  }

  private scheduleNextTick(delayMs: number): void {
    if (!this.running) return;
    this.timer = setTimeout(() => {
      void this.processBatch().finally(() => {
        this.scheduleNextTick(this.pollIntervalMs);
      });
    }, delayMs);
  }

  public async processBatch(): Promise<number> {
    if (this.processing) return 0;
    this.processing = true;

    const stopTimer = outboxProcessingLatency.startTimer();
    let processedCount = 0;

    try {
      // Execute batch select and status updates inside a single database transaction
      // to hold FOR UPDATE SKIP LOCKED row locks during the outbox processing lifecycle
      await commerceDb.transaction(async (tx) => {
        const pendingRecords = await tx
          .select()
          .from(outboxEvents)
          .where(
            and(
              eq(outboxEvents.status, 'PENDING'),
              sql`("retry_count" = 0 OR "updated_at" <= NOW() - (INTERVAL '1 second' * POWER(2, LEAST("retry_count", 6))))`
            )
          )
          .orderBy(asc(outboxEvents.createdAt))
          .for('update', { skipLocked: true })
          .limit(this.batchSize);

        for (const record of pendingRecords) {
          if (record.retryCount > 0) {
            outboxRetriedCounter.inc({
              event_type: record.eventType,
              attempt: String(record.retryCount),
            });
          }

          try {
            // Attempt publish with publisher confirms
            await this.publisher.publishWithConfirm(
              this.primaryExchange,
              record.eventType,
              record.payload,
              { correlationId: record.correlationId || undefined }
            );

            // Mark record as published
            await tx
              .update(outboxEvents)
              .set({
                status: 'PUBLISHED',
                publishedAt: new Date(),
                updatedAt: new Date(),
              })
              .where(eq(outboxEvents.id, record.id));

            outboxPublishedCounter.inc({ event_type: record.eventType });
            processedCount++;
            console.log(
              `[OutboxWorker] Successfully published event ${record.eventType} (id: ${record.id})`
            );
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const newRetryCount = record.retryCount + 1;

            outboxFailedCounter.inc({
              event_type: record.eventType,
              reason: errorMessage.substring(0, 50),
            });

            if (newRetryCount >= this.maxRetries) {
              // Max retries reached: Route payload to Dead Letter Exchange (DLX) FIRST before marking as FAILED
              console.error(
                `[OutboxWorker] CRITICAL: Max retries (${this.maxRetries}) reached for event ${record.id}. Routing payload to DLQ.`
              );

              try {
                // Route to DLX catch-all queue
                await this.publisher.publishWithConfirm(
                  this.dlxExchange,
                  record.eventType,
                  {
                    originalRecordId: record.id,
                    eventType: record.eventType,
                    payload: record.payload,
                    failedAt: new Date().toISOString(),
                    error: errorMessage,
                  },
                  { correlationId: record.correlationId || undefined }
                );

                // Mark record as FAILED only after DLX publication succeeds
                await tx
                  .update(outboxEvents)
                  .set({
                    status: 'FAILED',
                    retryCount: newRetryCount,
                    lastError: errorMessage.substring(0, 1000),
                    updatedAt: new Date(),
                  })
                  .where(eq(outboxEvents.id, record.id));
              } catch (dlxErr) {
                const dlxErrorMessage = dlxErr instanceof Error ? dlxErr.message : String(dlxErr);
                console.error(
                  `[OutboxWorker] Failed to route poison event ${record.id} to DLX: ${dlxErrorMessage}. Retaining PENDING status for retry.`
                );

                // If DLX publication fails, keep status as PENDING so it can be retried in future ticks
                await tx
                  .update(outboxEvents)
                  .set({
                    retryCount: newRetryCount,
                    lastError: `[DLX Publish Failed] ${dlxErrorMessage}`.substring(0, 1000),
                    updatedAt: new Date(),
                  })
                  .where(eq(outboxEvents.id, record.id));
              }
            } else {
              // Update retry count and backoff error state
              console.warn(
                `[OutboxWorker] Publish failed for event ${record.id} (Attempt ${newRetryCount}/${this.maxRetries}): ${errorMessage}`
              );

              await tx
                .update(outboxEvents)
                .set({
                  retryCount: newRetryCount,
                  lastError: errorMessage.substring(0, 1000),
                  updatedAt: new Date(),
                })
                .where(eq(outboxEvents.id, record.id));
            }
          }
        }
      });

      // 2. Update Gauge Metrics
      await this.updateGaugeMetrics();

      return processedCount;
    } catch (err) {
      console.error('[OutboxWorker] Error during outbox batch processing:', err);
      return 0;
    } finally {
      stopTimer();
      this.processing = false;
    }
  }

  private async updateGaugeMetrics(): Promise<void> {
    try {
      // Query oldest pending record age
      const [oldest] = await commerceDb
        .select({ createdAt: outboxEvents.createdAt })
        .from(outboxEvents)
        .where(eq(outboxEvents.status, 'PENDING'))
        .orderBy(asc(outboxEvents.createdAt))
        .limit(1);

      if (oldest && oldest.createdAt) {
        const ageSec = (Date.now() - new Date(oldest.createdAt).getTime()) / 1000;
        outboxAgeGauge.set(Math.max(0, ageSec));
      } else {
        outboxAgeGauge.set(0);
      }
    } catch (err) {
      console.error('[OutboxWorker] Error updating outbox age gauge:', err);
    }

    try {
      // Query actual RabbitMQ DLQ queue depth instead of DB FAILED count
      if (typeof this.publisher?.getQueueDepth === 'function') {
        const dlqDepth = await this.publisher.getQueueDepth('hathor.dlq');
        if (dlqDepth !== null) {
          outboxDlqDepthGauge.set(dlqDepth);
        }
      }
    } catch (err) {
      console.error('[OutboxWorker] Error updating DLQ depth gauge:', err);
    }

    try {
      // Query RabbitMQ Queue Depths for monitored queues
      if (typeof this.publisher?.getQueueDepth === 'function') {
        for (const queue of this.monitoredQueues) {
          const depth = await this.publisher.getQueueDepth(queue);
          if (depth !== null) {
            rabbitMqQueueDepthGauge.set({ queue }, depth);
          }
        }
      }
    } catch (err) {
      console.error('[OutboxWorker] Error updating queue depth gauges:', err);
    }
  }
}

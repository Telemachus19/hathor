import amqp from 'amqplib';
import { eq, and, lt } from 'drizzle-orm';
import { libraryDb } from './db/client.js';
import { outboxEvents } from './db/schema.js';

let isProcessing = false;
let confirmChannel: amqp.ConfirmChannel | null = null;

export async function startOutboxWorker(rabbitmqUrl: string) {
  const connection = await amqp.connect(rabbitmqUrl);
  confirmChannel = await connection.createConfirmChannel();

  // Run initial processing and start background interval
  void processPendingOutbox();
  setInterval(() => {
    void processPendingOutbox();
  }, 5000);
}

export function triggerOutboxProcessing() {
  if (!isProcessing) {
    void processPendingOutbox();
  }
}

async function processPendingOutbox() {
  if (isProcessing || !confirmChannel) return;
  isProcessing = true;

  try {
    // Fetch all pending outbox events with fewer than 5 attempts
    const pendingEvents = await libraryDb
      .select()
      .from(outboxEvents)
      .where(and(eq(outboxEvents.status, 'pending'), lt(outboxEvents.publishAttempts, 5)));

    for (const event of pendingEvents) {
      try {
        // Increment attempts first so we don't spin in case of crash
        await libraryDb
          .update(outboxEvents)
          .set({
            publishAttempts: event.publishAttempts + 1,
          })
          .where(eq(outboxEvents.id, event.id));

        const content = Buffer.from(JSON.stringify(event.payload));
        const exchange = 'hathor.domain.events';
        const routingKey = event.eventType; // library.entitlement.granted.v1

        // Publish message with publisher confirm
        await new Promise<void>((resolve, reject) => {
          confirmChannel!.publish(exchange, routingKey, content, { persistent: true }, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });

        // Mark as published on success
        await libraryDb
          .update(outboxEvents)
          .set({
            status: 'published',
            publishedAt: new Date(),
          })
          .where(eq(outboxEvents.id, event.id));
      } catch (err: any) {
        console.error(`Failed to publish outbox event ${event.id}:`, err);
        await libraryDb
          .update(outboxEvents)
          .set({
            lastError: err.message || 'Unknown publish error',
          })
          .where(eq(outboxEvents.id, event.id));
      }
    }
  } catch (dbErr) {
    console.error('Error in outbox worker database polling:', dbErr);
  } finally {
    isProcessing = false;
  }
}

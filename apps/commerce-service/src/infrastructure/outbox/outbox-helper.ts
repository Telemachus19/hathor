import { outboxEvents } from '../db/schema.js';

export interface InsertOutboxParams {
  aggregateType: string;
  aggregateId: string;
  eventType: string;
  payload: unknown;
  correlationId?: string;
}

export async function insertOutboxEventTx(tx: any, params: InsertOutboxParams): Promise<void> {
  await tx.insert(outboxEvents).values({
    aggregateType: params.aggregateType,
    aggregateId: params.aggregateId,
    eventType: params.eventType,
    payload: params.payload as any,
    correlationId: params.correlationId || null,
    status: 'PENDING',
    retryCount: 0,
  });
}

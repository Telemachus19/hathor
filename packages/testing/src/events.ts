import { randomUUID } from 'node:crypto';
import type { DomainEventEnvelope } from '@hathor/contracts';
import { createCorrelationId } from './correlation.js';

interface EventFixtureInput<TPayload> {
  eventType: string;
  producer: string;
  payload: TPayload;
  eventId?: string;
  occurredAt?: string;
  correlationId?: string;
}

export function createEventFixture<TPayload>({
  eventType,
  producer,
  payload,
  eventId = randomUUID(),
  occurredAt = new Date().toISOString(),
  correlationId = createCorrelationId(),
}: EventFixtureInput<TPayload>): DomainEventEnvelope<TPayload> {
  return {
    eventId,
    eventType,
    schemaVersion: 1,
    occurredAt,
    correlationId,
    producer,
    payload,
  };
}

export interface DomainEventEnvelope<TPayload> {
  eventId: string;
  eventType: string;
  schemaVersion: 1;
  occurredAt: string;
  correlationId: string;
  producer: string;
  payload: TPayload;
}

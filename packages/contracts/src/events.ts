export interface DomainEventEnvelope<TPayload> {
  eventId: string;
  eventType: string;
  occurredAt: string;
  correlationId: string;
  producer: string;
  payload: TPayload;
}

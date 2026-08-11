import client from 'prom-client';

export const metricsRegistry = new client.Registry();

// Enable default metrics (CPU, Memory, GC)
client.collectDefaultMetrics({ register: metricsRegistry, prefix: 'hathor_commerce_' });

// 1. Processing Latency Histogram
export const outboxProcessingLatency = new client.Histogram({
  name: 'hathor_outbox_worker_processing_latency_seconds',
  help: 'Latency of outbox worker batch processing loops in seconds',
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [metricsRegistry],
});

// 2. Oldest Pending Outbox Event Age Gauge
export const outboxAgeGauge = new client.Gauge({
  name: 'hathor_outbox_age_seconds',
  help: 'Age of the oldest pending outbox record in seconds',
  registers: [metricsRegistry],
});

// 3. Published Events Counter
export const outboxPublishedCounter = new client.Counter({
  name: 'hathor_outbox_events_published_total',
  help: 'Total count of successfully published outbox events with broker confirms',
  labelNames: ['event_type'],
  registers: [metricsRegistry],
});

// 4. Failed Events Counter
export const outboxFailedCounter = new client.Counter({
  name: 'hathor_outbox_events_failed_total',
  help: 'Total count of failed outbox publication attempts',
  labelNames: ['event_type', 'reason'],
  registers: [metricsRegistry],
});

// 5. Retried Events Counter
export const outboxRetriedCounter = new client.Counter({
  name: 'hathor_outbox_events_retried_total',
  help: 'Total count of retried outbox publication attempts',
  labelNames: ['event_type', 'attempt'],
  registers: [metricsRegistry],
});

// 6. DLQ Depth Gauge
export const outboxDlqDepthGauge = new client.Gauge({
  name: 'hathor_outbox_dlq_depth_total',
  help: 'Current depth of outbox events marked as FAILED or routed to DLQ',
  registers: [metricsRegistry],
});

// 7. RabbitMQ Queue Depth Gauge
export const rabbitMqQueueDepthGauge = new client.Gauge({
  name: 'hathor_rabbitmq_queue_depth',
  help: 'Current RabbitMQ queue depth',
  labelNames: ['queue'],
  registers: [metricsRegistry],
});

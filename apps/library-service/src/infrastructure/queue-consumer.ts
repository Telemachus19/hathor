import amqp from 'amqplib';
import { z } from 'zod';
import { libraryDb } from './db/client.js';
import { processedEvents, userLicenses } from './db/schema.js';

// 1. Zod runtime schema matching the AsyncAPI contract for commerce.order.paid.v1
export const OrderPaidEventSchema = z.object({
  eventId: z.string().uuid(),
  eventType: z.literal('commerce.order.paid.v1'),
  schemaVersion: z.literal(1),
  occurredAt: z.string().datetime(),
  correlationId: z.string().uuid(),
  producer: z.literal('commerce-service'),
  payload: z.object({
    orderId: z.string().uuid(),
    userId: z.string().uuid(),
    items: z.array(
      z.object({
        gameId: z.string().uuid(),
        titleSnapshot: z.string(),
        pricePaidEgp: z.string().regex(/^\d+\.\d{2}$/),
        currency: z.literal('EGP'),
      })
    ).min(1),
  }),
});

type OrderPaidEvent = z.infer<typeof OrderPaidEventSchema>;

// Helper to extract retry count from x-death headers
function getDeathCount(headers: any): number {
  const xDeath = headers?.['x-death'];
  if (!Array.isArray(xDeath)) {
    return 0;
  }
  // Count how many times it was dead-lettered specifically for the primary queue
  const primaryDeath = xDeath.find((d: any) => d.queue === 'library.order-paid.queue');
  return primaryDeath ? primaryDeath.count : 0;
}

// Helper to route malformed or exhausted messages to the DLQ exchange (hathor.dlx)
async function sendToDlq(channel: amqp.Channel, msg: amqp.ConsumeMessage, reason: string) {
  const routingKey = msg.fields.routingKey || 'commerce.order.paid.v1';
  console.error(`Sending message to DLQ due to: ${reason}`);
  
  channel.publish(
    'hathor.dlx',
    routingKey,
    msg.content,
    {
      headers: {
        ...msg.properties.headers,
        'x-original-routing-key': routingKey,
        'x-death-reason': reason,
      },
      persistent: true,
    }
  );
  
  // Acknowledge the original message so it doesn't remain in the queue
  channel.ack(msg);
}

// Core processing transaction (processed_events & licenses commit atomically)
async function processOrderPaidEvent(event: OrderPaidEvent) {
  try {
    await libraryDb.transaction(async (tx) => {
      // Step A: Insert eventId into processed_events to guarantee exact idempotency
      await tx.insert(processedEvents).values({
        eventId: event.eventId,
      });

      // Step B: Insert all licenses
      for (const item of event.payload.items) {
        await tx.insert(userLicenses).values({
          userId: event.payload.userId,
          gameId: item.gameId,
          sourceOrderId: event.payload.orderId,
          pricePaidEgp: item.pricePaidEgp,
        });
      }
    });
    console.log(`Successfully processed event ${event.eventId} and granted licenses.`);
  } catch (error: any) {
    // Catch PostgreSQL unique violation error for the primary key (event_id)
    if (error.code === '23505') {
      console.warn(`Idempotent Ignore: Event ${event.eventId} already processed. Ignored duplicate delivery.`);
      return;
    }
    // Rethrow database errors or other issues so they trigger RabbitMQ nack/retry logic
    throw error;
  }
}

// Queue consumer bootstrapper
export async function startQueueConsumer(rabbitmqUrl: string) {
  const connection = await amqp.connect(rabbitmqUrl);
  const channel = await connection.createChannel();
  
  // Set prefetch to 1 for load balancing
  await channel.prefetch(1);
  
  const queueName = 'library.order-paid.queue';
  console.log(`Starting consumer on queue "${queueName}"...`);

  await channel.consume(queueName, async (msg) => {
    if (!msg) return;

    try {
      const contentStr = msg.content.toString();
      let rawEvent: any;
      try {
        rawEvent = JSON.parse(contentStr);
      } catch (parseError) {
        await sendToDlq(channel, msg, 'invalid_json');
        return;
      }

      // Perform runtime validation
      const validationResult = OrderPaidEventSchema.safeParse(rawEvent);
      if (!validationResult.success) {
        console.error('Validation errors:', validationResult.error.format());
        await sendToDlq(channel, msg, 'validation_failed');
        return;
      }

      // Process event and grant licenses
      await processOrderPaidEvent(validationResult.data);
      
      // Acknowledge the message upon successful transaction commit
      channel.ack(msg);
    } catch (err: any) {
      console.error('Failed to process message:', err);

      const deathCount = getDeathCount(msg.properties.headers);
      if (deathCount < 5) {
        console.warn(`Attempt ${deathCount + 1} failed. Nacking to trigger retry backoff...`);
        // Nack with requeue=false. RabbitMQ will route it to the dead letter exchange (hathor.retry)
        channel.nack(msg, false, false);
      } else {
        console.error(`Max retries reached (${deathCount}). Routing to DLQ...`);
        await sendToDlq(channel, msg, 'max_retries_exceeded');
      }
    }
  });
}

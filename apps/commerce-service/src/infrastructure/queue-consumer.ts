import amqp from 'amqplib';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { commerceDb } from './db/client.js';
import { orders, orderStateTransitions } from './db/schema.js';

// 1. Zod runtime schema matching the AsyncAPI contract for library.entitlement.granted.v1
export const LibraryEntitlementGrantedEventSchema = z.object({
  eventId: z.string().uuid(),
  eventType: z.literal('library.entitlement.granted.v1'),
  schemaVersion: z.literal(1),
  occurredAt: z.string().datetime(),
  correlationId: z.string().uuid(),
  producer: z.literal('library-service'),
  payload: z.object({
    orderId: z.string().uuid(),
    userId: z.string().uuid(),
    gameIds: z.array(z.string().uuid()).min(1),
  }),
});

type LibraryEntitlementGrantedEvent = z.infer<typeof LibraryEntitlementGrantedEventSchema>;

// Helper to extract retry count from x-death headers
function getDeathCount(headers: any): number {
  const xDeath = headers?.['x-death'];
  if (!Array.isArray(xDeath)) {
    return 0;
  }
  // Count how many times it was dead-lettered specifically for the primary queue
  const primaryDeath = xDeath.find((d: any) => d.queue === 'commerce.entitlement-granted.queue');
  return primaryDeath ? primaryDeath.count : 0;
}

// Helper to route malformed or exhausted messages to the DLQ exchange (hathor.dlx)
async function sendToDlq(channel: amqp.Channel, msg: amqp.ConsumeMessage, reason: string) {
  const routingKey = msg.fields.routingKey || 'library.entitlement.granted.v1';
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

// Core processing transaction (order status update and transition auditing commit atomically)
async function processEntitlementGrantedEvent(event: LibraryEntitlementGrantedEvent) {
  const { orderId } = event.payload;

  await commerceDb.transaction(async (tx) => {
    // Lock order FOR UPDATE
    const [order] = await tx
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .for('update')
      .limit(1);

    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    // Idempotency: if order is already fulfilled, ignore successfully without duplicating transition audit
    if (order.status === 'fulfilled') {
      console.warn(`Idempotent Ignore: Order ${orderId} is already marked as fulfilled.`);
      return;
    }

    // Update order status to fulfilled
    await tx
      .update(orders)
      .set({ status: 'fulfilled' })
      .where(eq(orders.id, orderId));

    // Append state transition record
    await tx.insert(orderStateTransitions).values({
      orderId,
      fromStatus: order.status,
      toStatus: 'fulfilled',
      correlationId: event.correlationId,
    });
  });
}

// Queue consumer bootstrapper
export async function startQueueConsumer(rabbitmqUrl: string) {
  const connection = await amqp.connect(rabbitmqUrl);
  const channel = await connection.createChannel();
  
  // Set prefetch to 1 for load balancing
  await channel.prefetch(1);
  
  const queueName = 'commerce.entitlement-granted.queue';
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
      const validationResult = LibraryEntitlementGrantedEventSchema.safeParse(rawEvent);
      if (!validationResult.success) {
        console.error('Validation errors:', validationResult.error.format());
        await sendToDlq(channel, msg, 'validation_failed');
        return;
      }

      // Process event and fulfill order
      await processEntitlementGrantedEvent(validationResult.data);
      
      // Acknowledge the message upon successful transaction commit
      channel.ack(msg);
    } catch (err: any) {
      console.error('Failed to process message:', err);

      const deathCount = getDeathCount(msg.properties.headers);
      if (deathCount < 5) {
        console.warn(`Attempt ${deathCount + 1} failed. Nacking to trigger retry backoff...`);
        // Nack with requeue=false to route to the retry exchange (hathor.retry)
        channel.nack(msg, false, false);
      } else {
        console.error(`Max retries reached (${deathCount}). Routing to DLQ...`);
        await sendToDlq(channel, msg, 'max_retries_exceeded');
      }
    }
  });
}

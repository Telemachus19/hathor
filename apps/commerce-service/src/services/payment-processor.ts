import { eq } from 'drizzle-orm';
import { commerceDb } from '../infrastructure/db/client.js';
import { orders, orderItems, paymentEvents } from '../infrastructure/db/schema.js';
import { transitionOrderStatus } from './order-state.js';
import { insertOutboxEventTx } from '../infrastructure/outbox/outbox-helper.js';

export interface SimulatorWebhook {
  eventId: string;
  paymentReference: string;
  amountEgp: string;
  currency: string;
  outcome: 'paid' | 'failed';
  occurredAt: string;
}

export type ProcessPaymentResult =
  | { success: true; status: 204 }
  | { success: false; errorStatus: number; code: string; message: string };

export async function processPaymentCallbackTx(
  payload: SimulatorWebhook,
  correlationId?: string
): Promise<ProcessPaymentResult> {
  return await commerceDb.transaction(async (tx) => {
    // 1. Lock the order using SELECT ... FOR UPDATE
    const [order] = await tx
      .select()
      .from(orders)
      .where(eq(orders.paymentReference, payload.paymentReference))
      .for('update')
      .limit(1);

    if (!order) {
      return {
        success: false,
        errorStatus: 422,
        code: 'VALIDATION_FAILED',
        message: 'Order not found for given payment reference',
      };
    }

    // 4. Check paymentEvents using providerEventId
    const [existingEvent] = await tx
      .select()
      .from(paymentEvents)
      .where(eq(paymentEvents.providerEventId, payload.eventId))
      .limit(1);

    if (existingEvent) {
      // 5. Treat an identical replay as safely idempotent
      // 6. Reject an inconsistent replay
      if (
        existingEvent.orderId === order.id &&
        existingEvent.status === payload.outcome &&
        existingEvent.amountEgp === payload.amountEgp
      ) {
        return { success: true, status: 204 };
      } else {
        return {
          success: false,
          errorStatus: 422,
          code: 'VALIDATION_FAILED',
          message: 'Inconsistent replay of provider event',
        };
      }
    }

    // 2. Validate the order state
    if (order.status !== 'payment_pending') {
      return {
        success: false,
        errorStatus: 409,
        code: 'CONFLICT',
        message: `Order is not in payment_pending state (current: ${order.status})`,
      };
    }

    // 3. Validate expiration
    if (order.expiresAt < new Date()) {
      return {
        success: false,
        errorStatus: 409,
        code: 'CONFLICT',
        message: 'Order has expired',
      };
    }

    // 7. Validate amount and currency against the locked order
    if (order.totalAmountEgp !== payload.amountEgp || order.currency !== payload.currency) {
      return {
        success: false,
        errorStatus: 422,
        code: 'VALIDATION_FAILED',
        message: 'Payment amount or currency mismatch',
      };
    }

    // 8. Insert the payment event
    await tx.insert(paymentEvents).values({
      orderId: order.id,
      provider: 'simulator',
      providerEventId: payload.eventId,
      status: payload.outcome,
      amountEgp: payload.amountEgp,
      rawPayload: payload,
    });

    // 9. Transition the order through the centralized state machine
    if (payload.outcome === 'paid') {
      await transitionOrderStatus(tx, order.id, order.status, 'payment_confirmed', correlationId);
      await transitionOrderStatus(tx, order.id, 'payment_confirmed', 'fulfillment_pending', correlationId);

      // 10. If payment succeeds, insert commerce.order.paid.v1 outbox event
      const items = await tx
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id));

      const orderPaidPayload = {
        orderId: order.id,
        userId: order.userId,
        items: items.map((item) => ({
          gameId: item.gameId,
          titleSnapshot: item.titleSnapshot,
          pricePaidEgp: item.pricePaidEgp,
          currency: item.currency,
        })),
      };

      await insertOutboxEventTx(tx, {
        aggregateType: 'order',
        aggregateId: order.id,
        eventType: 'commerce.order.paid.v1',
        payload: orderPaidPayload,
        correlationId: correlationId || order.id, // Ensure correlation ID exists
      });
    } else {
      await transitionOrderStatus(tx, order.id, order.status, 'payment_failed', correlationId);
    }

    return { success: true, status: 204 };
  });
}

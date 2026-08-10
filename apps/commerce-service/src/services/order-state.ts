import { eq } from 'drizzle-orm';
import { orders, orderStateTransitions } from '../infrastructure/db/schema.js';

export type OrderStatus =
  | 'payment_pending'
  | 'payment_confirmed'
  | 'fulfillment_pending'
  | 'fulfilled'
  | 'expired'
  | 'payment_failed'
  | 'cancelled'
  | 'revoked';

const ALLOWED_TRANSITIONS: Record<string, Set<OrderStatus>> = {
  // initial states (null or created mapping to initial order insertion)
  null: new Set(['payment_pending']),
  created: new Set(['payment_pending']),
  
  // flow states
  payment_pending: new Set(['payment_confirmed', 'payment_failed', 'expired', 'cancelled']),
  payment_confirmed: new Set(['fulfillment_pending', 'revoked']),
  fulfillment_pending: new Set(['fulfilled', 'revoked']),
  fulfilled: new Set(['revoked']),
  
  // terminal states
  expired: new Set(),
  payment_failed: new Set(),
  cancelled: new Set(),
  revoked: new Set(),
};

export class IllegalStateTransitionError extends Error {
  constructor(public from: string | null, public to: OrderStatus, public orderId?: string) {
    super(`Illegal state transition from '${from}' to '${to}' for order ${orderId || 'unknown'}`);
    this.name = 'IllegalStateTransitionError';
  }
}

export async function transitionOrderStatus(
  tx: any,
  orderId: string,
  currentStatus: string | null,
  newStatus: OrderStatus,
  correlationId?: string
): Promise<void> {
  const stateKey = currentStatus === null ? 'null' : currentStatus;
  const allowed = ALLOWED_TRANSITIONS[stateKey];
  
  if (!allowed || !allowed.has(newStatus)) {
    throw new IllegalStateTransitionError(currentStatus, newStatus, orderId);
  }

  // Update order status if it's not a new order insertion
  // (New order insertion is expected to be handled by the caller creating the record)
  if (currentStatus !== null && currentStatus !== 'created') {
    await tx
      .update(orders)
      .set({ status: newStatus })
      .where(eq(orders.id, orderId));
  }

  // Append state transition audit record
  await tx.insert(orderStateTransitions).values({
    orderId,
    fromStatus: currentStatus === 'created' ? null : currentStatus, // Keep null for consistency with old behavior
    toStatus: newStatus,
    correlationId: correlationId || null,
  });
}

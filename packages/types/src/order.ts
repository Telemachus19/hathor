import { z } from 'zod';

export const paymentMethodSchema = z.enum(['fawry', 'vodafone_cash', 'instapay']);
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;

export const orderStatusSchema = z.enum(['pending', 'completed', 'expired', 'failed']);
export type OrderStatus = z.infer<typeof orderStatusSchema>;

export const orderItemSchema = z.object({
  orderId: z.string().uuid(),
  gameId: z.string().uuid(),
  pricePaidEgp: z.number().min(0),
});

export type OrderItem = z.infer<typeof orderItemSchema>;

export const orderSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  totalAmountEgp: z.number().min(0),
  paymentMethod: paymentMethodSchema,
  paymentReference: z.string(),
  status: orderStatusSchema.default('pending'),
  expiresAt: z.date(),
  createdAt: z.date().optional(),
});

export type Order = z.infer<typeof orderSchema>;

export const createOrderInputSchema = z.object({
  paymentMethod: paymentMethodSchema,
});

export type CreateOrderInput = z.infer<typeof createOrderInputSchema>;

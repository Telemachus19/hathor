import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiBaseUrl, apiClient } from './index';

export interface CartItem {
  gameId: string;
  already_owned?: boolean;
}

export interface CartResponse {
  version: number;
  items: CartItem[];
}

export interface InitializeTransactionRequest {
  paymentMethod: 'sim_fawry' | 'sim_vodafone_cash' | 'sim_instapay';
  cartVersion: number;
}

export interface OrderResponse {
  id: string;
  status:
    | 'payment_pending'
    | 'payment_confirmed'
    | 'fulfillment_pending'
    | 'fulfilled'
    | 'expired'
    | 'payment_failed'
    | 'cancelled'
    | 'revoked';
  paymentMethod: 'sim_fawry' | 'sim_vodafone_cash' | 'sim_instapay';
  paymentReference?: string;
  totalAmountEgp: string;
  currency: 'EGP';
  expiresAt: string;
}

/**
 * Fetches the caller's active cart.
 */
export async function fetchCart(): Promise<CartResponse> {
  const token = apiClient.getAccessToken();
  const response = await fetch(`${apiBaseUrl}/cart`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson?.error?.message || `Failed to fetch cart: HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Adds an item to the caller's cart.
 */
export async function addCartItem(gameId: string): Promise<CartResponse> {
  const token = apiClient.getAccessToken();
  const response = await fetch(`${apiBaseUrl}/cart/${gameId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(
      errorJson?.error?.message || `Failed to add cart item: HTTP ${response.status}`
    );
  }

  return response.json();
}

/**
 * Removes an item from the caller's cart.
 */
export async function removeCartItem(gameId: string): Promise<CartResponse> {
  const token = apiClient.getAccessToken();
  const response = await fetch(`${apiBaseUrl}/cart/${gameId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(
      errorJson?.error?.message || `Failed to remove cart item: HTTP ${response.status}`
    );
  }

  return response.json();
}

/**
 * Initializes an order idempotently with server-authoritative catalog quote.
 */
export async function initializeOrder(data: InitializeTransactionRequest): Promise<OrderResponse> {
  const token = apiClient.getAccessToken();
  const idempotencyKey = crypto.randomUUID();

  const response = await fetch(`${apiBaseUrl}/txn/init`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(
      errorJson?.error?.message || `Failed to initialize order: HTTP ${response.status}`
    );
  }

  return response.json();
}

/**
 * Fetches single order details by orderId.
 */
export async function fetchOrder(orderId: string): Promise<OrderResponse> {
  const token = apiClient.getAccessToken();
  const response = await fetch(`${apiBaseUrl}/txn/${orderId}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson?.error?.message || `Failed to fetch order: HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * React Query hook for fetching caller active cart.
 */
export function useCart() {
  return useQuery({
    queryKey: ['user-cart'],
    queryFn: fetchCart,
    staleTime: 1000 * 30, // 30s stale time
  });
}

/**
 * React Query mutation hook for adding item to cart.
 */
export function useAddCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addCartItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-cart'] });
    },
  });
}

/**
 * React Query mutation hook for removing item from cart.
 */
export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeCartItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-cart'] });
    },
  });
}

/**
 * React Query mutation hook for initializing order.
 */
export function useInitializeOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: initializeOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-cart'] });
    },
  });
}

/**
 * React Query hook for fetching single order.
 */
export function useOrder(orderId?: string) {
  return useQuery({
    queryKey: ['order-detail', orderId],
    queryFn: () => (orderId ? fetchOrder(orderId) : Promise.reject('No orderId')),
    enabled: !!orderId,
  });
}

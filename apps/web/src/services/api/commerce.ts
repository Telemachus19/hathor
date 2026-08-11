import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiBaseUrl, apiClient } from './index';
import { useAuth } from '../../context/AuthContext';
import { fetchUserLibrary } from './library';

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
 * Adds an item to the caller's cart after verifying no active unexpired pending order exists for that game.
 */
export async function addCartItem(gameId: string): Promise<CartResponse> {
  const token = apiClient.getAccessToken();

  if (token) {
    // 1. Verify caller does NOT already own this game in their library
    try {
      const libraryLicenses = await fetchUserLibrary();
      const isAlreadyOwned = libraryLicenses.some(
        (lic) => lic.gameId === gameId || (lic as any).id === gameId
      );
      if (isAlreadyOwned) {
        throw new Error('You already own this game in your library.');
      }
    } catch (err: any) {
      if (err.message?.includes('already own this game')) {
        throw err;
      }
    }

    // 2. Verify caller does NOT already have an active unexpired pending payment order for this game
    try {
      const pendingOrders = await fetchUserOrders('payment_pending');
      const now = Date.now();
      const hasActivePendingOrder = pendingOrders.some((order) => {
        if (order.status !== 'payment_pending') return false;
        if (order.expiresAt) {
          const expiryMs = new Date(order.expiresAt).getTime();
          if (!isNaN(expiryMs) && expiryMs <= now) return false;
        }
        return Array.isArray(order.items) && order.items.some((item) => item.gameId === gameId);
      });

      if (hasActivePendingOrder) {
        throw new Error(
          'You already have an active pending payment order for this game. Please complete or wait for your pending payment in your Library before adding it again.'
        );
      }
    } catch (err: any) {
      if (
        err.message?.includes('active pending payment order') ||
        err.message?.includes('already own this game')
      ) {
        throw err;
      }
    }
  }

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
    onSuccess: (data) => {
      queryClient.setQueryData(['user-cart'], data);
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
    onSuccess: (data) => {
      queryClient.setQueryData(['user-cart'], data);
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

export interface UserOrderItem {
  gameId: string;
  titleSnapshot: string;
  pricePaidEgp: string;
  currency: string;
}

export interface UserOrder {
  id: string;
  status: string;
  paymentMethod: string;
  paymentReference: string;
  totalAmountEgp: string;
  currency: string;
  expiresAt: string;
  createdAt: string;
  items: UserOrderItem[];
}

/**
 * Fetches user orders from commerce-service via API Gateway.
 */
export async function fetchUserOrders(status?: string): Promise<UserOrder[]> {
  try {
    const token = apiClient.getAccessToken();
    const queryParams = status ? `?status=${encodeURIComponent(status)}` : '';
    const response = await fetch(`${apiBaseUrl}/txn/orders${queryParams}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) return [];
    const json = await response.json();
    return json?.data || [];
  } catch (e) {
    return [];
  }
}

/**
 * React Query hook for fetching user orders.
 */
export function useUserOrders(statusFilter?: string) {
  const auth = useAuth();
  const isAuthenticated = auth?.isAuthenticated ?? false;

  return useQuery({
    queryKey: ['user-orders', statusFilter],
    queryFn: () => fetchUserOrders(statusFilter),
    enabled: isAuthenticated,
    initialData: [],
  });
}

/**
 * Simulates payment for an initialized order per OpenAPI spec operation simulatePayment.
 */
export async function simulatePayment(orderId: string, outcome: 'paid' | 'failed' = 'paid') {
  const token = apiClient.getAccessToken();
  const response = await fetch(`${apiBaseUrl}/txn/${orderId}/simulate-payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ outcome }),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(
      errorJson?.error?.message || `Payment simulation failed (HTTP ${response.status})`
    );
  }

  return response.ok;
}

/**
 * React Query mutation hook for simulating payment completion.
 */
export function useSimulatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, outcome }: { orderId: string; outcome?: 'paid' | 'failed' }) =>
      simulatePayment(orderId, outcome),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-orders'] });
      queryClient.invalidateQueries({ queryKey: ['user-library'] });
    },
  });
}

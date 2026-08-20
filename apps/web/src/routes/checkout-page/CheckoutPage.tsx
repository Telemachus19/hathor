import React, { useState, useEffect } from 'react';
import { ShoppingBag, Mail, User as UserIcon } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../../context/AuthContext';
import {
  useCart,
  useInitializeOrder,
  useCatalogGames,
  fetchOrder,
  OrderResponse,
} from '../../services/api';
import {
  PaymentTab,
  SimulatedPaymentMethod,
  CheckoutMappedItem,
  CardDetails,
  ContactDetails,
} from './types';
import { PaymentMethodSelector } from './components/PaymentMethodSelector';
import { CheckoutOrderSummary } from './components/CheckoutOrderSummary';
import { CheckoutPendingView } from './components/CheckoutPendingView';
import { HieroDivider } from './components/HieroDivider';
import styles from './styles/CheckoutPage.module.css';

export const CheckoutPage: React.FC = () => {
  const { isAuthenticated, status, user } = useAuth();
  const navigate = useNavigate();

  // Contact Form State
  const [contact, setContact] = useState<ContactDetails>({
    firstName: user?.displayName ? user.displayName.split(' ')[0] : '',
    lastName:
      user?.displayName && user.displayName.split(' ').length > 1
        ? user.displayName.split(' ').slice(1).join(' ')
        : '',
    email: user?.email || '',
    subscribeAlerts: true,
  });

  useEffect(() => {
    if (user?.email || user?.displayName) {
      const parts = user?.displayName ? user.displayName.split(' ') : [];
      setContact((prev) => ({
        ...prev,
        email: user?.email || prev.email,
        firstName: parts[0] || prev.firstName,
        lastName: parts.length > 1 ? parts.slice(1).join(' ') : prev.lastName,
      }));
    }
  }, [user]);

  // Payment Selection State
  const [paymentTab, setPaymentTab] = useState<PaymentTab>('simulated');
  const [selectedMethod, setSelectedMethod] = useState<SimulatedPaymentMethod>('sim_fawry');
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    cardNumber: '',
    nameOnCard: '',
    expiryDate: '',
    cvv: '',
    saveCard: false,
  });

  // Promo Code State
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);

  // Order Pending & Timer State
  const [createdOrder, setCreatedOrder] = useState<OrderResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(15 * 60);

  const { data: cart, isLoading: isCartLoading } = useCart();
  const { data: catalogData } = useCatalogGames({ limit: 100 });
  const initOrderMutation = useInitializeOrder();

  // Auth Redirect Guard
  useEffect(() => {
    if (status === 'unauthenticated') {
      void navigate({ to: '/login' });
    }
  }, [status, navigate]);

  // Empty Cart Redirect Guard (redirects directly accessed or refreshed checkout with empty cart to /library)
  useEffect(() => {
    if (
      status === 'authenticated' &&
      !isCartLoading &&
      !createdOrder &&
      (!cart || !cart.items || cart.items.length === 0)
    ) {
      void navigate({ to: '/library', replace: true });
    }
  }, [status, isCartLoading, createdOrder, cart, navigate]);

  // Timer countdown based on server authoritative expiresAt
  useEffect(() => {
    if (!createdOrder || !createdOrder.expiresAt) return;

    const updateTimer = () => {
      const remainingMs = new Date(createdOrder.expiresAt).getTime() - Date.now();
      const seconds = Math.max(0, Math.floor(remainingMs / 1000));
      setTimeLeft(seconds);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [createdOrder]);

  // 1. Loading state (auth refresh or cart query in flight)
  if (status === 'idle' || status === 'loading' || isCartLoading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.contentWrapper} style={{ textAlign: 'center', padding: '5rem 0' }}>
          <p style={{ color: '#94a3b8', fontFamily: 'monospace' }}>Loading checkout session...</p>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated state (redirecting to /login)
  if (status === 'unauthenticated' || !isAuthenticated) return null;

  // 3. Active Order state (rendering pending simulation view)
  if (createdOrder) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.contentWrapper}>
          <CheckoutPendingView order={createdOrder} timeLeft={timeLeft} />
        </div>
      </div>
    );
  }

  const cartItemsList = cart?.items || [];
  const catalogGames = catalogData?.data?.items || [];

  // Map cart items with metadata
  const mappedItems: CheckoutMappedItem[] = cartItemsList.map((cItem) => {
    const game = catalogGames.find(
      (g) => (g as any).id === cItem.gameId || g.slug === cItem.gameId
    );
    const genreText =
      (game as any)?.genre?.name ||
      (game as any)?.genre ||
      (game?.tags && game.tags.length > 0
        ? typeof game.tags[0] === 'string'
          ? game.tags[0]
          : game.tags[0].name
        : 'Action / Strategy');

    return {
      gameId: cItem.gameId,
      alreadyOwned: cItem.already_owned || false,
      title: game?.title || `Game ${cItem.gameId.slice(0, 8).toUpperCase()}`,
      genre: genreText,
      coverUrl: game?.bannerUrl || (game as any)?.coverUrl || (game as any)?.thumbnailUrl || null,
      priceEgp: game?.priceEgp || '299.99',
    };
  });

  const hasOwnedItems = mappedItems.some((item) => item.alreadyOwned);

  // Price calculations
  const subtotalCents = mappedItems.reduce(
    (sum, item) => sum + Math.round(parseFloat(item.priceEgp || '0') * 100),
    0
  );
  const discountCents = Math.round((subtotalCents * discountPercent) / 100);
  const finalTotalCents = Math.max(0, subtotalCents - discountCents);

  const formattedSubtotal = (subtotalCents / 100).toFixed(2);
  const formattedTotal = (finalTotalCents / 100).toFixed(2);

  const handleApplyPromo = () => {
    const cleanCode = promoCode.trim().toUpperCase();
    if (cleanCode === 'HATHOR10') {
      setDiscountPercent(10);
      setPromoMessage('Promo code HATHOR10 applied (-10% OFF)!');
    } else if (cleanCode === 'HATHOR50') {
      setDiscountPercent(50);
      setPromoMessage('Promo code HATHOR50 applied (-50% OFF)!');
    } else if (cleanCode !== '') {
      setDiscountPercent(0);
      setPromoMessage('Invalid promo code');
    }
  };

  const handlePlaceOrder = async () => {
    if (!cart || cartItemsList.length === 0) {
      setErrorMessage('Your cart is empty');
      return;
    }
    if (hasOwnedItems) {
      setErrorMessage('Remove already-owned games from your cart before proceeding');
      return;
    }
    setErrorMessage(null);

    try {
      const order = await initOrderMutation.mutateAsync({
        paymentMethod: selectedMethod,
        cartVersion: cart.version,
      });
      const verifiedOrder = await fetchOrder(order.id).catch(() => order);
      setCreatedOrder(verifiedOrder);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to initialize checkout. Please try again.');
    }
  };

  // Empty Cart Guard: Redirect to /library if cart is empty and no local order creation is active
  if (cartItemsList.length === 0) {
    void navigate({ to: '/library', replace: true });
    return (
      <div className={styles.pageContainer}>
        <div className={styles.contentWrapper} style={{ textAlign: 'center', padding: '5rem 0' }}>
          <p style={{ color: '#94a3b8', fontFamily: 'monospace' }}>Redirecting to Library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        {/* Breadcrumb Steps */}
        <div className={styles.breadcrumbs}>
          <span className={styles.stepCompleted}>✓ CART</span>
          <span className={styles.stepSeparator}>›</span>
          <span className={styles.stepActive}>2. CHECKOUT</span>
          <span className={styles.stepSeparator}>›</span>
          <span className={styles.stepPending}>3. CONFIRMATION</span>
        </div>

        {/* Header */}
        <div className={styles.headerSection}>
          <div className={styles.headerSubtitle}>
            <ShoppingBag size={13} />
            <span>Secure Order Processing</span>
          </div>
          <h1 className={styles.pageTitle}>
            Checkout <span className={styles.highlightText}>Details</span>
          </h1>
        </div>

        <HieroDivider />

        <div className={styles.checkoutLayout}>
          {/* Left Column: Form & Payment Selection */}
          <div className={styles.formColumn}>
            {/* 01. Contact Information */}
            <div className={styles.sectionBox}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>01. Account & Contact Details</h2>
              </div>
              <div className={styles.inputGrid}>
                <div className={`${styles.inputGrid} ${styles.inputGrid2Col}`}>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>First Name</label>
                    <div className={styles.inputWrapper}>
                      <UserIcon size={14} className={styles.inputIcon} />
                      <input
                        type="text"
                        value={contact.firstName}
                        onChange={(e) => setContact({ ...contact, firstName: e.target.value })}
                        className={`${styles.textInput} ${styles.textInputWithIcon}`}
                      />
                    </div>
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Last Name</label>
                    <input
                      type="text"
                      value={contact.lastName}
                      onChange={(e) => setContact({ ...contact, lastName: e.target.value })}
                      className={styles.textInput}
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Email Address</label>
                  <div className={styles.inputWrapper}>
                    <Mail size={14} className={styles.inputIcon} />
                    <input
                      type="email"
                      value={contact.email}
                      onChange={(e) => setContact({ ...contact, email: e.target.value })}
                      className={`${styles.textInput} ${styles.textInputWithIcon}`}
                    />
                  </div>
                </div>

                <label className={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={contact.subscribeAlerts}
                    onChange={(e) => setContact({ ...contact, subscribeAlerts: e.target.checked })}
                    className={styles.checkboxInput}
                  />
                  <span className={styles.checkboxText}>
                    Receive deal notifications and digital receipts via email
                  </span>
                </label>
              </div>
            </div>

            {/* 02. Payment Selector */}
            <PaymentMethodSelector
              paymentTab={paymentTab}
              setPaymentTab={setPaymentTab}
              selectedMethod={selectedMethod}
              setSelectedMethod={setSelectedMethod}
              cardDetails={cardDetails}
              setCardDetails={setCardDetails}
            />
          </div>

          {/* Right Column: Order Summary */}
          <CheckoutOrderSummary
            items={mappedItems}
            subtotalFormatted={formattedSubtotal}
            totalFormatted={formattedTotal}
            discountPercent={discountPercent}
            promoCode={promoCode}
            setPromoCode={setPromoCode}
            promoMessage={promoMessage}
            onApplyPromo={handleApplyPromo}
            onPlaceOrder={handlePlaceOrder}
            isLoading={initOrderMutation.isPending}
            errorMessage={errorMessage}
            hasOwnedItems={hasOwnedItems}
          />
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;

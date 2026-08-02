import { useState, useEffect } from 'react';
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useAuth } from '../context/AuthContext';
import { useCart, useInitializeOrder, useCatalogGames, OrderResponse } from '../services/api';
import styles from '../styles/Checkout.module.css';

export const Route = createFileRoute('/checkout')({
  component: CheckoutPage,
});

type PaymentMethod = 'sim_fawry' | 'sim_vodafone_cash' | 'sim_instapay';
type PaymentTab = 'credit_card' | 'paypal' | 'simulated';

function CheckoutPage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Contact Info State
  const [firstName, setFirstName] = useState(
    user?.displayName ? user.displayName.split(' ')[0] : 'John'
  );
  const [lastName, setLastName] = useState('Doe');
  const [email, setEmail] = useState(user?.email || 'your@email.com');
  const [subscribeAlerts, setSubscribeAlerts] = useState(true);

  // Payment State
  const [paymentTab, setPaymentTab] = useState<PaymentTab>('credit_card');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('sim_fawry');
  const [cardNumber, setCardNumber] = useState('');
  const [nameOnCard, setNameOnCard] = useState('John Doe');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [saveCard, setSaveCard] = useState(false);

  // Promo Code State
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);

  // Order State
  const [createdOrder, setCreatedOrder] = useState<OrderResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(15 * 60);

  const { data: cart, isLoading: isCartLoading } = useCart();
  const { data: catalogData } = useCatalogGames({ limit: 50 });
  const initOrderMutation = useInitializeOrder();

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/login' });
    }
  }, [isAuthenticated, navigate]);

  // Countdown timer for payment-pending state
  useEffect(() => {
    if (!createdOrder) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [createdOrder]);

  if (!isAuthenticated) return null;

  // Render Payment Pending State View
  if (createdOrder) {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    return (
      <div className={styles.pageContainer}>
        <div className={styles.pendingContainer}>
          <div className={styles.statusIcon}>⏳</div>
          <h1 className={styles.pendingTitle}>Order Initialized</h1>
          <p className={styles.pendingSubtitle}>
            Your order has been created and is waiting for payment confirmation via your selected
            method.
          </p>

          <div className={styles.refCard}>
            <span className={styles.refLabel}>Payment Reference Code</span>
            <span className={styles.refCode}>
              {createdOrder.paymentReference || createdOrder.id.slice(0, 8).toUpperCase()}
            </span>
          </div>

          <div className={styles.detailsGrid}>
            <div className={styles.detailBox}>
              <div className={styles.detailLabel}>Payment Method</div>
              <div className={styles.detailValue}>
                {createdOrder.paymentMethod === 'sim_fawry' && 'Fawry Simulator'}
                {createdOrder.paymentMethod === 'sim_vodafone_cash' && 'Vodafone Cash Simulator'}
                {createdOrder.paymentMethod === 'sim_instapay' && 'InstaPay Simulator'}
              </div>
            </div>

            <div className={styles.detailBox}>
              <div className={styles.detailLabel}>Total Amount</div>
              <div className={styles.detailValue} style={{ color: 'var(--accent-orange)' }}>
                {createdOrder.totalAmountEgp} {createdOrder.currency}
              </div>
            </div>

            <div className={styles.detailBox}>
              <div className={styles.detailLabel}>Status</div>
              <div className={styles.detailValue} style={{ color: 'var(--accent-gold)' }}>
                {createdOrder.status.toUpperCase().replace('_', ' ')}
              </div>
            </div>

            <div className={styles.detailBox}>
              <div className={styles.detailLabel}>Payment Time Remaining</div>
              <div className={`${styles.detailValue} ${styles.timerBadge}`}>⏱ {formattedTime}</div>
            </div>
          </div>

          <div
            className={styles.instructionsBox}
            style={{ textAlign: 'left', marginBottom: '28px' }}
          >
            <strong>Payment Instructions:</strong>
            <br />
            {createdOrder.paymentMethod === 'sim_fawry' && (
              <span>
                Visit any Fawry POS machine or Fawry app, select &quot;Hathor Store&quot;, and enter
                reference code <strong>{createdOrder.paymentReference}</strong>.
              </span>
            )}
            {createdOrder.paymentMethod === 'sim_vodafone_cash' && (
              <span>
                Open Vodafone Cash menu (*9#), choose &quot;Online Payment&quot;, and input
                reference code <strong>{createdOrder.paymentReference}</strong>.
              </span>
            )}
            {createdOrder.paymentMethod === 'sim_instapay' && (
              <span>
                Open InstaPay app, transfer to Hathor Merchant Account using payment reference{' '}
                <strong>{createdOrder.paymentReference}</strong>.
              </span>
            )}
          </div>

          <div className={styles.btnGroup}>
            <Link to="/" className={styles.secondaryBtn}>
              Back to Store
            </Link>
            <Link
              to="/library"
              className={styles.secondaryBtn}
              style={{ backgroundColor: 'var(--accent-orange)', color: '#fff', border: 'none' }}
            >
              View My Library
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Handle empty or loading cart
  if (isCartLoading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.emptyCartContainer}>
          <div className={styles.emptyCartTitle}>Loading cart details...</div>
        </div>
      </div>
    );
  }

  const cartItemsList = cart?.items || [];
  const catalogGames = catalogData?.data?.items || [];

  // Match cart items with catalog game metadata
  const mappedItems = cartItemsList.map((cItem) => {
    const game = catalogGames.find(
      (g) => (g as any).id === cItem.gameId || g.slug === cItem.gameId
    );
    return {
      gameId: cItem.gameId,
      alreadyOwned: cItem.already_owned || false,
      title: game?.title || `Game ${cItem.gameId.slice(0, 8)}`,
      genre: (game as any)?.genre || 'Action / Strategy',
      coverUrl: (game as any)?.coverUrl || (game as any)?.thumbnailUrl || null,
      priceEgp: game?.priceEgp || '0.00',
    };
  });

  const hasOwnedItems = mappedItems.some((item) => item.alreadyOwned);

  // Calculate subtotal and discounts
  const subtotalCents = mappedItems.reduce(
    (sum, item) => sum + Math.round(parseFloat(item.priceEgp || '0') * 100),
    0
  );
  const discountCents = Math.round((subtotalCents * discountPercent) / 100);
  const finalTotalCents = Math.max(0, subtotalCents - discountCents);

  const formattedSubtotal = (subtotalCents / 100).toFixed(2);
  const formattedTotal = (finalTotalCents / 100).toFixed(2);

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'HATHOR10') {
      setDiscountPercent(10);
      setPromoMessage('Promo code HATHOR10 applied (-10% OFF)!');
    } else if (promoCode.trim().toUpperCase() === 'HATHOR50') {
      setDiscountPercent(50);
      setPromoMessage('Promo code HATHOR50 applied (-50% OFF)!');
    } else if (promoCode.trim() !== '') {
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
      setErrorMessage('Remove already-owned games from your cart before proceeding to checkout');
      return;
    }

    setErrorMessage(null);

    try {
      const order = await initOrderMutation.mutateAsync({
        paymentMethod: selectedMethod,
        cartVersion: cart.version,
      });

      setCreatedOrder(order);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to initialize checkout. Please try again.');
    }
  };

  if (cartItemsList.length === 0) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.emptyCartContainer}>
          <div className={styles.emptyCartTitle}>Your Cart is Empty</div>
          <p style={{ color: 'var(--text-muted)' }}>
            Add some games to your cart to proceed with checkout.
          </p>
          <Link to="/" className={styles.secondaryBtn} style={{ marginTop: '16px' }}>
            Browse Store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      {/* Breadcrumbs */}
      <div className={styles.breadcrumbs}>
        <span className={styles.stepCompleted}>✓ CART</span>
        <span className={styles.stepSeparator}>›</span>
        <span className={styles.stepActive}>2. CHECKOUT</span>
        <span className={styles.stepSeparator}>›</span>
        <span className={styles.stepPending}>3. CONFIRMATION</span>
      </div>

      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.subtitle}>SECURE CHECKOUT</div>
        <h1 className={styles.title}>
          COMPLETE YOUR <span className={styles.titleHighlight}>ORDER</span>
        </h1>
      </div>

      <div className={styles.checkoutGrid}>
        {/* Left Column */}
        <div>
          {/* Section 1: Contact Information */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionHeaderTitle}>CONTACT INFORMATION</span>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>FIRST NAME</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>LAST NAME</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>EMAIL ADDRESS</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>✉</span>
                <input
                  type="email"
                  className={`${styles.input} ${styles.inputWithIcon}`}
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <label className={styles.checkboxGroup}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={subscribeAlerts}
                onChange={(e) => setSubscribeAlerts(e.target.checked)}
              />
              <span className={styles.checkboxLabel}>Send me deals and new release alerts</span>
            </label>
          </div>

          {/* Section 2: Payment Method */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionHeaderTitle}>PAYMENT METHOD</span>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className={styles.paymentTabGroup}>
              <button
                type="button"
                className={`${styles.paymentTab} ${
                  paymentTab === 'credit_card' ? styles.paymentTabActive : ''
                }`}
                onClick={() => setPaymentTab('credit_card')}
              >
                💳 CREDIT CARD
              </button>

              <button
                type="button"
                className={`${styles.paymentTab} ${
                  paymentTab === 'paypal' ? styles.paymentTabActive : ''
                }`}
                onClick={() => setPaymentTab('paypal')}
              >
                🅿 PAYPAL
              </button>

              <button
                type="button"
                className={`${styles.paymentTab} ${
                  paymentTab === 'simulated' ? styles.paymentTabActive : ''
                }`}
                onClick={() => setPaymentTab('simulated')}
              >
                📱 LOCAL SIMULATORS
              </button>
            </div>

            {/* Credit Card Form View */}
            {paymentTab === 'credit_card' && (
              <div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>CARD NUMBER</label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}>💳</span>
                    <input
                      type="text"
                      className={`${styles.input} ${styles.inputWithIcon}`}
                      placeholder="0000 0000 0000 0000"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>NAME ON CARD</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="John Doe"
                    value={nameOnCard}
                    onChange={(e) => setNameOnCard(e.target.value)}
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>EXPIRY DATE</label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="MM / YY"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>CVV</label>
                    <div className={styles.inputWrapper}>
                      <span className={styles.inputIcon}>🔒</span>
                      <input
                        type="password"
                        className={`${styles.input} ${styles.inputWithIcon}`}
                        placeholder="***"
                        maxLength={4}
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <label className={styles.checkboxGroup}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={saveCard}
                    onChange={(e) => setSaveCard(e.target.checked)}
                  />
                  <span className={styles.checkboxLabel}>Save card for future purchases</span>
                </label>
              </div>
            )}

            {/* PayPal View */}
            {paymentTab === 'paypal' && (
              <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                <p>You will be redirected to PayPal to complete your purchase securely.</p>
              </div>
            )}

            {/* Local Simulator Selector */}
            <div style={{ marginTop: '20px' }}>
              <div className={styles.label} style={{ marginBottom: '8px' }}>
                SELECT SIMULATOR METHOD FOR HATHOR TEST ENGINE:
              </div>
              <div className={styles.simulatorGrid}>
                <div
                  className={`${styles.simulatorOption} ${
                    selectedMethod === 'sim_fawry' ? styles.simulatorOptionActive : ''
                  }`}
                  onClick={() => setSelectedMethod('sim_fawry')}
                >
                  <div className={styles.simulatorOptionName}>🏪 Fawry Simulator</div>
                </div>

                <div
                  className={`${styles.simulatorOption} ${
                    selectedMethod === 'sim_vodafone_cash' ? styles.simulatorOptionActive : ''
                  }`}
                  onClick={() => setSelectedMethod('sim_vodafone_cash')}
                >
                  <div className={styles.simulatorOptionName}>📱 Vodafone Cash</div>
                </div>

                <div
                  className={`${styles.simulatorOption} ${
                    selectedMethod === 'sim_instapay' ? styles.simulatorOptionActive : ''
                  }`}
                  onClick={() => setSelectedMethod('sim_instapay')}
                >
                  <div className={styles.simulatorOptionName}>⚡ InstaPay</div>
                </div>
              </div>
            </div>

            {/* SSL Notice */}
            <div className={styles.sslNotice}>
              <span>🔒</span>
              <span>
                All transactions are encrypted with 256-bit SSL. Your payment info is never stored
                on our servers.
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryTitleRow}>
              <span className={styles.summaryTitleText}>ORDER SUMMARY</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {mappedItems.length} {mappedItems.length === 1 ? 'ITEM' : 'ITEMS'}
              </span>
            </div>

            {/* Item List */}
            <div className={styles.itemList}>
              {mappedItems.map((item) => (
                <div className={styles.itemRow} key={item.gameId}>
                  <div className={styles.itemIconBox}>
                    {item.coverUrl ? <img src={item.coverUrl} alt={item.title} /> : <span>🎮</span>}
                  </div>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemTitle}>{item.title}</div>
                    <div className={styles.itemMetaRow}>
                      <span className={styles.itemTag}>{item.genre}</span>
                      {item.alreadyOwned && (
                        <span style={{ color: '#ff4d4f', fontSize: '0.65rem', fontWeight: 600 }}>
                          (OWNED)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={styles.itemPrice}>{item.priceEgp} EGP</div>
                </div>
              ))}
            </div>

            {/* Promo Code Section */}
            <div className={styles.promoSection}>
              <div className={styles.promoTitle}>PROMO CODE</div>
              <div className={styles.promoInputRow}>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Enter code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                />
                <button type="button" className={styles.applyBtn} onClick={handleApplyPromo}>
                  APPLY
                </button>
              </div>
              <div className={styles.promoHint}>Try: HATHOR10</div>
              {promoMessage && (
                <div
                  style={{
                    fontSize: '0.75rem',
                    marginTop: '6px',
                    color: discountPercent > 0 ? 'var(--accent-cyan)' : '#ff4d4f',
                  }}
                >
                  {promoMessage}
                </div>
              )}
            </div>

            <div className={styles.divider} />

            {/* Price Calculations */}
            <div className={styles.priceRow}>
              <span>Subtotal</span>
              <span>{formattedSubtotal} EGP</span>
            </div>

            {discountPercent > 0 && (
              <div className={styles.priceRow}>
                <span>Promo Discount ({discountPercent}%)</span>
                <span style={{ color: 'var(--accent-cyan)' }}>
                  -{(discountCents / 100).toFixed(2)} EGP
                </span>
              </div>
            )}

            <div className={styles.priceRow}>
              <span>Platform Fee</span>
              <span style={{ color: 'var(--accent-cyan)' }}>Free</span>
            </div>

            <div className={styles.divider} />

            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>TOTAL</span>
              <span className={styles.totalPrice}>{formattedTotal} EGP</span>
            </div>

            {errorMessage && <div className={styles.errorBanner}>{errorMessage}</div>}

            {/* Action Button */}
            <button
              className={styles.placeOrderBtn}
              onClick={handlePlaceOrder}
              disabled={initOrderMutation.isPending || hasOwnedItems}
            >
              <span>🔒</span>
              {initOrderMutation.isPending
                ? 'PROCESSING...'
                : `PLACE ORDER · ${formattedTotal} EGP`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

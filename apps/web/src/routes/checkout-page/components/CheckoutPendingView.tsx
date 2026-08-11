import React, { useState, useEffect } from 'react';
import { Clock, ShieldCheck, Library, ShoppingCart, Zap, CheckCircle, Loader2 } from 'lucide-react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { OrderResponse, useSimulatePayment } from '../../../services/api';
import { fetchUserLibrary } from '../../../services/api/library';
import styles from '../styles/CheckoutPage.module.css';

interface CheckoutPendingViewProps {
  order: OrderResponse;
  timeLeft: number;
}

export const CheckoutPendingView: React.FC<CheckoutPendingViewProps> = ({ order, timeLeft }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const simulatePaymentMutation = useSimulatePayment();
  const [isFulfilled, setIsFulfilled] = useState(false);
  const [isGrantingEntitlement, setIsGrantingEntitlement] = useState(false);

  // Compute authoritative remaining time from server's expiresAt
  const remainingMs = order.expiresAt ? new Date(order.expiresAt).getTime() - Date.now() : 0;
  const activeRemainingSec = order.expiresAt
    ? Math.max(0, Math.floor(remainingMs / 1000))
    : timeLeft;

  const minutes = Math.floor(activeRemainingSec / 60);
  const seconds = activeRemainingSec % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Poll inventory asynchronously until the expected license exists for this order
  useEffect(() => {
    if (!isGrantingEntitlement) return;

    let attempts = 0;
    const maxAttempts = 20; // Up to 15 seconds of active polling
    const intervalMs = 750;
    const startTime = Date.now();
    const minVisualFeedbackMs = 1500; // Minimum spinner feedback duration so user visually perceives verification

    const pollInterval = setInterval(async () => {
      attempts++;
      try {
        const userLicenses = await fetchUserLibrary();
        const hasLicense = userLicenses.some((lic) => lic.sourceOrderId === order.id);

        if (hasLicense || attempts >= maxAttempts) {
          clearInterval(pollInterval);
          const elapsedTime = Date.now() - startTime;
          const remainingDelay = Math.max(0, minVisualFeedbackMs - elapsedTime);

          setTimeout(async () => {
            setIsGrantingEntitlement(false);
            await queryClient.invalidateQueries({ queryKey: ['user-library'] });
            await queryClient.invalidateQueries({ queryKey: ['user-orders'] });
            void navigate({ to: '/library' });
          }, remainingDelay);
        }
      } catch (err) {
        if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
          setIsGrantingEntitlement(false);
          await queryClient.invalidateQueries({ queryKey: ['user-library'] });
          void navigate({ to: '/library' });
        }
      }
    }, intervalMs);

    return () => clearInterval(pollInterval);
  }, [isGrantingEntitlement, order.id, queryClient, navigate]);

  const handleSimulatePayment = async () => {
    try {
      await simulatePaymentMutation.mutateAsync({ orderId: order.id, outcome: 'paid' });
      setIsFulfilled(true);
      setIsGrantingEntitlement(true);
    } catch (err: any) {
      // Error captured by simulatePaymentMutation.isError banner
    }
  };

  const isProcessing = simulatePaymentMutation.isPending || isGrantingEntitlement;

  return (
    <div className={styles.pendingWrapper}>
      <div className={styles.pendingAccentBar} />

      <div className={styles.statusIcon}>
        {isProcessing ? (
          <Loader2 size={48} className={styles.spinIcon} style={{ color: '#38d39f' }} />
        ) : isFulfilled ? (
          <CheckCircle size={48} style={{ color: '#38d39f' }} />
        ) : (
          <Clock size={48} style={{ color: 'var(--primary-color, #f26b21)' }} />
        )}
      </div>

      <h1 className={styles.pendingTitle}>
        {simulatePaymentMutation.isPending
          ? 'Processing Payment...'
          : isGrantingEntitlement
            ? 'Granting Entitlements...'
            : isFulfilled
              ? 'Payment Confirmed!'
              : 'Order Initialized'}
      </h1>

      <p className={styles.pendingSubtitle}>
        {simulatePaymentMutation.isPending
          ? 'Connecting to payment provider gateway...'
          : isGrantingEntitlement
            ? 'Payment processed! Verifying game license in your library...'
            : isFulfilled
              ? 'Your payment was confirmed successfully! Adding games to your library...'
              : 'Your order is created and awaiting payment confirmation via your selected channel.'}
      </p>

      {/* Payment Reference Code Display */}
      <div className={styles.refCard}>
        <span className={styles.refLabel}>Payment Reference Code</span>
        <span className={styles.refCode}>
          {order.paymentReference || order.id.slice(0, 8).toUpperCase()}
        </span>
      </div>

      {/* Details Grid */}
      <div className={styles.pendingDetailsGrid}>
        <div className={styles.pendingDetailBox}>
          <div className={styles.pendingDetailLabel}>Payment Method</div>
          <div className={styles.pendingDetailValue}>
            {order.paymentMethod === 'sim_fawry' && 'Fawry Simulator'}
            {order.paymentMethod === 'sim_vodafone_cash' && 'Vodafone Cash Simulator'}
            {order.paymentMethod === 'sim_instapay' && 'InstaPay Simulator'}
            {!order.paymentMethod.startsWith('sim_') && order.paymentMethod.toUpperCase()}
          </div>
        </div>

        <div className={styles.pendingDetailBox}>
          <div className={styles.pendingDetailLabel}>Total Amount</div>
          <div
            className={styles.pendingDetailValue}
            style={{ color: 'var(--primary-color, #f26b21)' }}
          >
            EGP {parseFloat(order.totalAmountEgp).toLocaleString()}
          </div>
        </div>

        <div className={styles.pendingDetailBox}>
          <div className={styles.pendingDetailLabel}>Status</div>
          <div
            className={styles.pendingDetailValue}
            style={{ color: isFulfilled || isProcessing ? '#38d39f' : '#f26b21' }}
          >
            {isFulfilled
              ? 'FULFILLED'
              : isProcessing
                ? 'PROCESSING'
                : order.status.toUpperCase().replace('_', ' ')}
          </div>
        </div>

        <div className={styles.pendingDetailBox}>
          <div className={styles.pendingDetailLabel}>Time Remaining</div>
          <div className={`${styles.pendingDetailValue} ${styles.timerText}`}>
            ⏱ {formattedTime}
          </div>
        </div>
      </div>

      {/* Channel Instructions */}
      <div className={styles.instructionsBox}>
        <strong>Channel Payment Instructions:</strong>
        <br />
        {order.paymentMethod === 'sim_fawry' && (
          <span>
            Visit any Fawry POS machine or Fawry app, select &quot;Hathor Store&quot;, and enter
            reference code <strong>{order.paymentReference}</strong>.
          </span>
        )}
        {order.paymentMethod === 'sim_vodafone_cash' && (
          <span>
            Open Vodafone Cash menu (*9#), select &quot;Online Payment&quot;, and enter reference
            code <strong>{order.paymentReference}</strong>.
          </span>
        )}
        {order.paymentMethod === 'sim_instapay' && (
          <span>
            Open InstaPay app, select transfer to Hathor Merchant Account with reference code{' '}
            <strong>{order.paymentReference}</strong>.
          </span>
        )}
      </div>

      {simulatePaymentMutation.isError && (
        <div className={styles.errorBanner} style={{ marginBottom: '1rem' }}>
          {(simulatePaymentMutation.error as any)?.message || 'Failed to process payment'}
        </div>
      )}

      {/* Simulator Trigger CTA / Active Processing & Granting Banner */}
      {simulatePaymentMutation.isPending ? (
        <div className={styles.grantingBanner}>
          <Loader2
            size={18}
            className={styles.spinIcon}
            style={{ color: 'var(--primary-color, #f26b21)' }}
          />
          <span>Connecting to Payment Provider...</span>
        </div>
      ) : isGrantingEntitlement ? (
        <div className={styles.grantingBanner}>
          <Loader2 size={18} className={styles.spinIcon} style={{ color: '#38d39f' }} />
          <span>Payment Confirmed — Granting License...</span>
        </div>
      ) : isFulfilled ? (
        <div className={styles.grantingBanner}>
          <CheckCircle size={18} style={{ color: '#38d39f' }} />
          <span>License Granted — Redirecting to Library...</span>
        </div>
      ) : (
        <button type="button" onClick={handleSimulatePayment} className={styles.simulatePayBtn}>
          <Zap size={16} /> Simulate Payment Success
        </button>
      )}

      {/* Navigation options */}
      <div className={styles.navBtnGroup}>
        <Link to="/" className={`${styles.navBtn} ${styles.secondaryNavBtn}`}>
          <ShoppingCart size={13} /> Return to Store
        </Link>
        <Link to="/library" className={`${styles.navBtn} ${styles.primaryNavBtn}`}>
          <Library size={13} /> View My Library
        </Link>
      </div>

      <div
        style={{
          marginTop: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.4rem',
          fontSize: '0.6rem',
          color: '#94a3b8',
          fontFamily: 'monospace',
        }}
      >
        <ShieldCheck size={12} style={{ color: '#38d39f' }} /> Encrypted 256-bit transaction
        protection
      </div>
    </div>
  );
};

export default CheckoutPendingView;

import React, { useState } from 'react';
import { Clock, ShieldCheck, Library, ShoppingCart, Zap, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from '@tanstack/react-router';
import { OrderResponse, useSimulatePayment } from '../../../services/api';
import styles from '../styles/CheckoutPage.module.css';

interface CheckoutPendingViewProps {
  order: OrderResponse;
  timeLeft: number;
}

export const CheckoutPendingView: React.FC<CheckoutPendingViewProps> = ({ order, timeLeft }) => {
  const navigate = useNavigate();
  const simulatePaymentMutation = useSimulatePayment();
  const [isFulfilled, setIsFulfilled] = useState(false);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const handleSimulatePayment = () => {
    simulatePaymentMutation.mutate(
      { orderId: order.id, outcome: 'paid' },
      {
        onSuccess: () => {
          setIsFulfilled(true);
          setTimeout(() => {
            void navigate({ to: '/library' });
          }, 1500);
        },
      }
    );
  };

  return (
    <div className={styles.pendingWrapper}>
      <div className={styles.pendingAccentBar} />

      <div className={styles.statusIcon}>
        {isFulfilled ? (
          <CheckCircle size={48} style={{ color: '#38d39f' }} />
        ) : (
          <Clock size={48} style={{ color: 'var(--primary-color, #f26b21)' }} />
        )}
      </div>

      <h1 className={styles.pendingTitle}>
        {isFulfilled ? 'Payment Confirmed!' : 'Order Initialized'}
      </h1>

      <p className={styles.pendingSubtitle}>
        {isFulfilled
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
            style={{ color: isFulfilled ? '#38d39f' : '#f26b21' }}
          >
            {isFulfilled ? 'FULFILLED' : order.status.toUpperCase().replace('_', ' ')}
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

      {/* Simulator Trigger CTA */}
      {!isFulfilled && (
        <button
          type="button"
          onClick={handleSimulatePayment}
          disabled={simulatePaymentMutation.isPending}
          className={styles.simulatePayBtn}
        >
          <Zap size={16} />{' '}
          {simulatePaymentMutation.isPending ? 'Processing Payment...' : 'Simulate Payment Success'}
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

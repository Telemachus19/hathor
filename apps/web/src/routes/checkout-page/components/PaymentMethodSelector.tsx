import React from 'react';
import { CreditCard, Wallet, Smartphone, ShieldCheck } from 'lucide-react';
import { PaymentTab, SimulatedPaymentMethod, CardDetails } from '../types';
import styles from '../styles/CheckoutPage.module.css';

interface PaymentMethodSelectorProps {
  paymentTab: PaymentTab;
  setPaymentTab: (tab: PaymentTab) => void;
  selectedMethod: SimulatedPaymentMethod;
  setSelectedMethod: (method: SimulatedPaymentMethod) => void;
  cardDetails: CardDetails;
  setCardDetails: React.Dispatch<React.SetStateAction<CardDetails>>;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  paymentTab,
  setPaymentTab,
  selectedMethod,
  setSelectedMethod,
  cardDetails,
  setCardDetails,
}) => {
  const handleCardChange = (field: keyof CardDetails, value: any) => {
    setCardDetails((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className={styles.sectionBox}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>02. Payment Information</h2>
      </div>

      {/* Main Payment Type Tabs */}
      <div className={styles.paymentTabs}>
        <button
          type="button"
          className={`${styles.tabBtn} ${paymentTab === 'credit_card' ? styles.tabBtnActive : ''}`}
          onClick={() => setPaymentTab('credit_card')}
        >
          <CreditCard size={14} /> Credit Card
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${paymentTab === 'paypal' ? styles.tabBtnActive : ''}`}
          onClick={() => setPaymentTab('paypal')}
        >
          <Wallet size={14} /> PayPal
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${paymentTab === 'simulated' ? styles.tabBtnActive : ''}`}
          onClick={() => setPaymentTab('simulated')}
        >
          <Smartphone size={14} /> Local Payment Channels
        </button>
      </div>

      {/* Credit Card Input Form */}
      {paymentTab === 'credit_card' && (
        <div className={styles.inputGrid}>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Name on Card</label>
            <input
              type="text"
              placeholder="JOHN DOE"
              value={cardDetails.nameOnCard}
              onChange={(e) => handleCardChange('nameOnCard', e.target.value)}
              className={styles.textInput}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Card Number</label>
            <div className={styles.inputWrapper}>
              <CreditCard size={14} className={styles.inputIcon} />
              <input
                type="text"
                placeholder="4532 •••• •••• 8892"
                value={cardDetails.cardNumber}
                onChange={(e) => handleCardChange('cardNumber', e.target.value)}
                className={`${styles.textInput} ${styles.textInputWithIcon}`}
              />
            </div>
          </div>

          <div className={`${styles.inputGrid} ${styles.inputGrid2Col}`}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Expiry Date</label>
              <input
                type="text"
                placeholder="MM / YY"
                value={cardDetails.expiryDate}
                onChange={(e) => handleCardChange('expiryDate', e.target.value)}
                className={styles.textInput}
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>CVV Code</label>
              <input
                type="password"
                maxLength={4}
                placeholder="123"
                value={cardDetails.cvv}
                onChange={(e) => handleCardChange('cvv', e.target.value)}
                className={styles.textInput}
              />
            </div>
          </div>

          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={cardDetails.saveCard}
              onChange={(e) => handleCardChange('saveCard', e.target.checked)}
              className={styles.checkboxInput}
            />
            <span className={styles.checkboxText}>Save card for future purchases securely</span>
          </label>
        </div>
      )}

      {/* PayPal Tab */}
      {paymentTab === 'paypal' && (
        <div style={{ textAlign: 'center', padding: '1.5rem 1rem', color: '#94a3b8', fontSize: '0.75rem', fontFamily: 'monospace' }}>
          <Wallet size={24} style={{ color: 'var(--primary-color, #f26b21)', marginBottom: '0.5rem' }} />
          <p>You will be redirected to PayPal to complete your purchase securely.</p>
        </div>
      )}

      {/* Simulated Local Channels Tab */}
      {paymentTab === 'simulated' && (
        <div>
          <p style={{ fontSize: '0.65rem', color: '#94a3b8', fontFamily: 'monospace', marginBottom: '1rem' }}>
            Select a local payment channel simulator to process your order reference:
          </p>

          <div className={styles.simulatedGrid}>
            {/* Fawry Simulator */}
            <div
              className={`${styles.simOptionCard} ${selectedMethod === 'sim_fawry' ? styles.simOptionActive : ''}`}
              onClick={() => setSelectedMethod('sim_fawry')}
            >
              <div className={styles.simHeader}>
                <span className={styles.simTitle}>FAWRY</span>
                <span className={styles.simBadge}>Simulator</span>
              </div>
              <span className={styles.simSubtext}>Pay via any Fawry outlet or app using reference code</span>
            </div>

            {/* Vodafone Cash Simulator */}
            <div
              className={`${styles.simOptionCard} ${selectedMethod === 'sim_vodafone_cash' ? styles.simOptionActive : ''}`}
              onClick={() => setSelectedMethod('sim_vodafone_cash')}
            >
              <div className={styles.simHeader}>
                <span className={styles.simTitle}>VODAFONE CASH</span>
                <span className={styles.simBadge}>Simulator</span>
              </div>
              <span className={styles.simSubtext}>Online wallet payment via Vodafone Cash menu</span>
            </div>

            {/* InstaPay Simulator */}
            <div
              className={`${styles.simOptionCard} ${selectedMethod === 'sim_instapay' ? styles.simOptionActive : ''}`}
              onClick={() => setSelectedMethod('sim_instapay')}
            >
              <div className={styles.simHeader}>
                <span className={styles.simTitle}>INSTAPAY</span>
                <span className={styles.simBadge}>Simulator</span>
              </div>
              <span className={styles.simSubtext}>Instant bank transfer using payment reference</span>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.6rem', color: '#94a3b8', fontFamily: 'monospace' }}>
        <ShieldCheck size={12} style={{ color: '#38d39f' }} /> Encrypted 256-bit SSL transaction security
      </div>
    </div>
  );
};

export default PaymentMethodSelector;

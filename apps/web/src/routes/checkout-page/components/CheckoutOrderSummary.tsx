import React from 'react';
import { Lock, Tag, AlertTriangle } from 'lucide-react';
import { CheckoutMappedItem } from '../types';
import { GlyphAccent } from './GlyphAccent';
import styles from '../styles/CheckoutPage.module.css';

interface CheckoutOrderSummaryProps {
  items: CheckoutMappedItem[];
  subtotalFormatted: string;
  totalFormatted: string;
  discountPercent: number;
  promoCode: string;
  setPromoCode: (val: string) => void;
  promoMessage: string | null;
  onApplyPromo: () => void;
  onPlaceOrder: () => void;
  isLoading: boolean;
  errorMessage: string | null;
  hasOwnedItems: boolean;
}

export const CheckoutOrderSummary: React.FC<CheckoutOrderSummaryProps> = ({
  items,
  subtotalFormatted,
  totalFormatted,
  discountPercent,
  promoCode,
  setPromoCode,
  promoMessage,
  onApplyPromo,
  onPlaceOrder,
  isLoading,
  errorMessage,
  hasOwnedItems,
}) => {
  return (
    <div className={styles.summaryColumn}>
      <div className={styles.summaryCard}>
        <div className={styles.summaryHeader}>
          <GlyphAccent char="𓂀" style={{ position: 'absolute', top: 8, right: 16, fontSize: '1.5rem' }} />
          <h2 className={styles.summaryTitle}>Summary</h2>
        </div>

        <div className={styles.summaryContent}>
          {/* Items breakdown list */}
          <div className={styles.cartItemList}>
            {items.map((item) => (
              <div key={item.gameId} className={styles.cartItemRow}>
                {item.coverUrl ? (
                  <img src={item.coverUrl} alt={item.title} className={styles.cartItemThumb} />
                ) : (
                  <div className={styles.cartItemThumb} />
                )}
                <div className={styles.cartItemInfo}>
                  <div className={styles.cartItemTitle}>{item.title}</div>
                  {item.alreadyOwned && (
                    <span className={styles.ownedWarning}>
                      <AlertTriangle size={10} /> Already owned
                    </span>
                  )}
                </div>
                <div className={styles.cartItemPrice}>EGP {parseFloat(item.priceEgp).toLocaleString()}</div>
              </div>
            ))}
          </div>

          {/* Promo code entry */}
          <div className={styles.promoContainer}>
            <input
              type="text"
              placeholder="PROMO CODE"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              className={styles.promoInput}
            />
            <button type="button" onClick={onApplyPromo} className={styles.promoBtn}>
              <Tag size={12} /> Apply
            </button>
          </div>
          {promoMessage && (
            <div
              className={`${styles.promoMessage} ${
                discountPercent > 0 ? styles.promoSuccess : styles.promoError
              }`}
            >
              {promoMessage}
            </div>
          )}

          {/* Price Breakdown */}
          <div className={styles.priceBreakdown}>
            <div className={styles.priceRow}>
              <span>Subtotal</span>
              <span>EGP {parseFloat(subtotalFormatted).toLocaleString()}</span>
            </div>
            {discountPercent > 0 && (
              <div className={styles.priceRow} style={{ color: '#38d39f' }}>
                <span>Discount ({discountPercent}%)</span>
                <span>−EGP {((parseFloat(subtotalFormatted) * discountPercent) / 100).toLocaleString()}</span>
              </div>
            )}
          </div>

          <div className={styles.totalRow}>
            <span className={styles.totalLabel}>Total</span>
            <span className={styles.totalAmount}>EGP {parseFloat(totalFormatted).toLocaleString()}</span>
          </div>

          {errorMessage && <div className={styles.errorBanner}>{errorMessage}</div>}

          <button
            type="button"
            onClick={onPlaceOrder}
            disabled={isLoading || hasOwnedItems || items.length === 0}
            className={styles.placeOrderBtn}
          >
            <Lock size={14} /> {isLoading ? 'Processing...' : 'Complete Order'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutOrderSummary;

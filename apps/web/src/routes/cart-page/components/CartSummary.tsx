import React from 'react';
import { Lock, Shield, Zap } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { CartGame } from '../types';
import { GlyphAccent } from './GlyphAccent';
import styles from '../styles/CartPage.module.css';

interface CartSummaryProps {
  cartItems: CartGame[];
  subtotal: number;
  savings: number;
  total: number;
}

export const CartSummary: React.FC<CartSummaryProps> = ({ cartItems, subtotal, total }) => {
  return (
    <div className={styles.summaryColumn}>
      <div className={styles.summaryCard}>
        <div className={styles.summaryHeader}>
          <GlyphAccent
            char="𓂀"
            style={{ position: 'absolute', top: 8, right: 16, fontSize: '1.5rem' }}
          />
          <h2 className={styles.summaryTitle}>Order Summary</h2>
        </div>

        <div className={styles.summaryContent}>
          <div className={styles.summaryLines}>
            {cartItems.map((game) => {
              const price = game.salePrice ?? game.originalPrice;
              return (
                <div key={game.id} className={styles.summaryLineRow}>
                  <span className={styles.summaryItemTitle}>{game.title || game.genre}</span>
                  <span className={styles.summaryItemPrice}>EGP {price.toLocaleString()}</span>
                </div>
              );
            })}
          </div>

          <div className={styles.summaryDivider} />

          <div className={styles.subtotalRow}>
            <span className={styles.subtotalLabel}>Subtotal</span>
            <span className={styles.subtotalPrice}>EGP {subtotal.toLocaleString()}</span>
          </div>

          <div className={styles.summaryDivider} />

          <div className={styles.totalRow}>
            <span className={styles.totalLabel}>Total</span>
            <span className={styles.totalPrice}>EGP {total.toLocaleString()}</span>
          </div>

          <Link to="/checkout" className={styles.checkoutBtn}>
            <Lock size={14} /> Proceed to Checkout
          </Link>

          <p className={styles.termsNotice}>By proceeding you agree to our Terms of Service</p>

          <div className={styles.trustBadges}>
            <div className={styles.trustItem}>
              <Shield size={12} className={styles.trustIcon} /> Secure Payment
            </div>
            <div className={styles.trustItem}>
              <Zap size={12} className={styles.trustIcon} /> Instant Access
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;

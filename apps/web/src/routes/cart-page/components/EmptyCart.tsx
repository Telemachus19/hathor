import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { GlyphAccent } from './GlyphAccent';
import styles from '../styles/CartPage.module.css';

export const EmptyCart: React.FC = () => {
  return (
    <div className={styles.emptyCartState}>
      <GlyphAccent char="𓋹" style={{ fontSize: '4.5rem' }} />
      <div>
        <h3 className={styles.emptyTitle}>Your Cart is Empty</h3>
        <p className={styles.emptySubtext}>You haven't added any games to your cart yet.</p>
      </div>
      <Link to="/" className={styles.browseBtn}>
        <ShoppingCart size={14} /> Browse the Store
      </Link>
    </div>
  );
};

export default EmptyCart;

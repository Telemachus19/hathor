import React, { useState } from 'react';
import { ShoppingCart, ArrowLeft, ChevronRight, Tag, TrendingUp } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { CartGame, SuggestedGame } from './types';
import { initialCartGames, initialSuggestedGames } from './data/cartData';
import { CartItemComponent } from './components/CartItem';
import { CartSummary } from './components/CartSummary';
import { SuggestedCard } from './components/SuggestedCard';
import { EmptyCart } from './components/EmptyCart';
import { HieroDivider } from './components/HieroDivider';
import { useCart, useRemoveCartItem, useAddCartItem } from '../../services/api/commerce';
import styles from './styles/CartPage.module.css';

export const CartPage: React.FC = () => {
  useCart();
  const removeMutation = useRemoveCartItem();
  const addMutation = useAddCartItem();

  const [cartItems, setCartItems] = useState<CartGame[]>(initialCartGames);
  const [suggestedGames] = useState<SuggestedGame[]>(initialSuggestedGames);

  const handleRemove = (id: string | number) => {
    setCartItems((prev) => prev.filter((g) => g.id !== id));
    if (typeof id === 'string') {
      removeMutation.mutate(id);
    }
  };

  const handleWishlist = (id: string | number) => {
    handleRemove(id);
  };

  const handleAddSuggested = (suggested: SuggestedGame) => {
    const newCartItem: CartGame = {
      id: suggested.id,
      title: suggested.title,
      genre: suggested.genre,
      developer: 'Featured Studio',
      rating: suggested.rating,
      originalPrice: suggested.price,
      coverImage: suggested.coverImage,
      tags: ['Featured', 'Popular'],
    };
    setCartItems((prev) => [...prev, newCartItem]);
    if (typeof suggested.id === 'string') {
      addMutation.mutate(suggested.id);
    }
  };

  const subtotal = cartItems.reduce((sum, g) => sum + (g.salePrice ?? g.originalPrice), 0);
  const savings = cartItems.reduce(
    (sum, g) => sum + (g.salePrice ? g.originalPrice - g.salePrice : 0),
    0
  );
  const total = subtotal;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <Link to="/" className={styles.breadcrumbLink}>
            <ArrowLeft size={11} /> Store
          </Link>
          <ChevronRight size={11} className={styles.breadcrumbCurrent} />
          <span className={styles.breadcrumbCurrent}>Cart</span>
        </div>

        {/* Page header */}
        <div className={styles.headerSection}>
          <div className={styles.headerSubtitle}>
            <ShoppingCart size={13} />
            <span>Your Selection</span>
          </div>
          <h1 className={styles.pageTitle}>
            Your <span className={styles.highlightText}>Cart</span>
          </h1>
          {cartItems.length > 0 && (
            <p className={styles.itemCountText}>
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
            </p>
          )}
        </div>

        <HieroDivider />

        {cartItems.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className={styles.cartLayout}>
            {/* Cart Items List */}
            <div className={styles.cartItemsColumn}>
              <div className={styles.columnHeader}>
                <span>Game</span>
                <span>Price</span>
              </div>

              <div className={styles.itemList}>
                {cartItems.map((game) => (
                  <CartItemComponent
                    key={game.id}
                    game={game}
                    onRemove={handleRemove}
                    onWishlist={handleWishlist}
                  />
                ))}
              </div>

              {/* Savings Banner */}
              {savings > 0 && (
                <div className={styles.savingsBanner}>
                  <div className={styles.savingsLabel}>
                    <Tag size={13} />
                    <span>Sale discounts applied</span>
                  </div>
                  <span className={styles.savingsAmount}>−EGP {savings.toLocaleString()} saved</span>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <CartSummary
              cartItems={cartItems}
              subtotal={subtotal}
              savings={savings}
              total={total}
            />
          </div>
        )}

        {/* Suggested Games Section */}
        <div className={styles.suggestedSection}>
          <HieroDivider />
          <div className={styles.headerSubtitle}>
            <TrendingUp size={13} />
            <span>Recommended for You</span>
          </div>
          <h2 className={styles.suggestedTitle}>
            You May Also <span className={styles.highlightText}>Like</span>
          </h2>
          <div className={styles.suggestedGrid}>
            {suggestedGames.map((game) => (
              <SuggestedCard key={game.id} game={game} onAdd={handleAddSuggested} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;

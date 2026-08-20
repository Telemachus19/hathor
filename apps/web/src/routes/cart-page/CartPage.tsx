import React, { useState } from 'react';
import { ShoppingCart, ArrowLeft, ChevronRight, Tag, TrendingUp, Loader2 } from 'lucide-react';
import { Link, useNavigate } from '@tanstack/react-router';
import { CartGame, SuggestedGame } from './types';
import { initialSuggestedGames } from './data/cartData';
import { CartItemComponent } from './components/CartItem';
import { CartSummary } from './components/CartSummary';
import { SuggestedCard } from './components/SuggestedCard';
import { EmptyCart } from './components/EmptyCart';
import { HieroDivider } from './components/HieroDivider';
import { useCart, useRemoveCartItem, useAddCartItem } from '../../services/api/commerce';
import { useCatalogGames } from '../../services/api/catalog';
import styles from './styles/CartPage.module.css';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: serverCartResponse, isLoading: isCartLoading } = useCart();
  const { data: catalogResponse } = useCatalogGames({ limit: 100 });
  const removeMutation = useRemoveCartItem();
  const addMutation = useAddCartItem();

  const [suggestedGames] = useState<SuggestedGame[]>(initialSuggestedGames);

  const catalogGames = catalogResponse?.data?.items || [];
  const serverItems = serverCartResponse?.items || [];

  // Map server cart items dynamically with catalog game metadata
  const cartItems: CartGame[] = serverItems.map((item) => {
    const catalogGame = catalogGames.find(
      (g) => (g as any).id === item.gameId || g.slug === item.gameId
    );

    const origPrice = parseFloat(catalogGame?.priceEgp || '299.99');
    const discount = (catalogGame as any)?.discountPercent || 0;
    const hasDiscount = discount > 0;
    const salePrice = hasDiscount ? Math.round(origPrice * (1 - discount / 100)) : undefined;

    const genreText =
      (catalogGame as any)?.genre?.name ||
      (catalogGame as any)?.genre ||
      (catalogGame?.tags && catalogGame.tags.length > 0
        ? typeof catalogGame.tags[0] === 'string'
          ? catalogGame.tags[0]
          : catalogGame.tags[0].name
        : 'Action / Adventure');

    return {
      id: item.gameId,
      title: catalogGame?.title || `Game ${item.gameId.slice(0, 8).toUpperCase()}`,
      genre: genreText,
      developer: (catalogGame as any)?.developer || 'Hathor Studios',
      rating: (catalogGame as any)?.ratingScore || 4.8,
      originalPrice: origPrice,
      salePrice: salePrice,
      coverImage:
        catalogGame?.bannerUrl ||
        (catalogGame as any)?.coverUrl ||
        (catalogGame as any)?.thumbnailUrl ||
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
      tags: Array.isArray((catalogGame as any)?.tags)
        ? (catalogGame as any).tags.map((t: any) => (typeof t === 'string' ? t : t?.name || 'Tag'))
        : ['Action', 'Popular'],
    };
  });

  const handleRemove = async (id: string | number) => {
    if (typeof id === 'string') {
      try {
        await removeMutation.mutateAsync(id);
      } catch (err: any) {
        // Silently handle error state
      }
    }
  };

  const handleWishlist = (id: string | number) => {
    handleRemove(id);
  };

  const handleAddSuggested = async (suggested: SuggestedGame) => {
    if (typeof suggested.id === 'string') {
      try {
        await addMutation.mutateAsync(suggested.id);
      } catch (err: any) {
        const msg = err.message?.toLowerCase() || '';
        if (msg.includes('pending') || msg.includes('library') || msg.includes('already own')) {
          await navigate({ to: '/library' });
        } else if (msg.includes('already in') || msg.includes('cart')) {
          await navigate({ to: '/cart' });
        }
      }
    }
  };

  // Dynamic calculations
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

        {isCartLoading ? (
          <div
            style={{
              padding: '4rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              color: '#94a3b8',
              fontFamily: 'monospace',
            }}
          >
            <Loader2 size={32} style={{ color: '#f26b21', animation: 'spin 1s linear infinite' }} />
            <span>Fetching your cart items...</span>
          </div>
        ) : cartItems.length === 0 ? (
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
                  <span className={styles.savingsAmount}>
                    −EGP {savings.toLocaleString()} saved
                  </span>
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

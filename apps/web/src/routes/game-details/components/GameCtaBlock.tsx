import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useAddCartItem } from '../../../services/api/commerce';
import styles from '../styles/GameCtaBlock.module.css';

export interface GameCtaBlockProps {
  s?: any;
  device?: 'desktop' | 'tablet' | 'mobile';
  pageSettings?: any;
  isOwned?: boolean;
  isOwnershipCheckPending?: boolean;
  isOwnershipCheckError?: boolean;
  gameId?: string;
  isDesignerPreview?: boolean;
  isAuthenticated?: boolean;
}

const HATHOR_ORANGE = '#f26b21';
const TEXT_PRIMARY = '#ffffff';
const TEXT_MUTED = '#94a3b8';

export const GameCtaBlock: React.FC<GameCtaBlockProps> = ({
  s = {},
  device = 'desktop',
  pageSettings,
  isOwned: isOwnedProp,
  isOwnershipCheckPending: isOwnershipCheckPendingProp,
  isOwnershipCheckError: isOwnershipCheckErrorProp,
  gameId,
  isDesignerPreview,
  isAuthenticated,
}) => {
  const navigate = useNavigate();
  const addCartMutation = useAddCartItem();
  const isOwned = isOwnedProp ?? s.isOwned === true;
  const isOwnershipCheckPending =
    isOwnershipCheckPendingProp ?? pageSettings?.isOwnershipCheckPending === true;
  const isOwnershipCheckError =
    isOwnershipCheckErrorProp ?? pageSettings?.isOwnershipCheckError === true;

  // If user owns the game in live mode, hide CTA component completely (sidebar CTA handles library navigation)
  if (!isDesignerPreview && isOwned) {
    return null;
  }

  const handleClick = async () => {
    if (isDesignerPreview || isOwnershipCheckPending || isOwnershipCheckError) return;
    if (!isAuthenticated) {
      await navigate({ to: '/login' });
      return;
    }
    if (gameId) {
      try {
        await addCartMutation.mutateAsync(gameId);
        await navigate({ to: '/cart' });
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

  const titleFont = s.font || s.titleFont || pageSettings?.titleFont || "'Cinzel', serif";
  const textFont = s.textFont || pageSettings?.textFont || "'Raleway', sans-serif";

  const title = isOwnershipCheckError
    ? 'UNABLE TO VERIFY OWNERSHIP'
    : isOwnershipCheckPending
      ? 'VERIFYING OWNERSHIP...'
      : s.ctaTitle || s.title || 'PRE-ORDER NOW';

  const subtitle = isOwnershipCheckError
    ? 'Unable to verify game ownership. Purchase temporarily unavailable.'
    : isOwnershipCheckPending
      ? 'Checking game ownership in your library...'
      : s.ctaSubtitle || s.subtitle || 'Get exclusive pre-order bonuses and early access.';

  const titleColor = isOwnershipCheckError
    ? '#ef4444'
    : s.ctaTitleColor || s.titleColor || TEXT_PRIMARY;

  const subtitleColor = s.ctaSubtitleColor || s.subtitleColor || TEXT_MUTED;

  const btnText = isOwnershipCheckError
    ? 'UNABLE TO VERIFY'
    : isOwnershipCheckPending
      ? 'CHECKING OWNERSHIP...'
      : s.ctaBtnText || s.btnText || 'BUY NOW';

  const btnBg =
    isOwnershipCheckError || isOwnershipCheckPending
      ? '#334155'
      : s.ctaBtnColor || s.btnBg || HATHOR_ORANGE;

  const btnTextColor = s.ctaBtnTextColor || s.btnTextColor || '#ffffff';
  const isMobile = device === 'mobile';

  return (
    <div
      className={`${styles.ctaContainer} ${isMobile ? styles.ctaMobile : ''}`}
      style={{
        background:
          s.ctaBg ||
          'linear-gradient(135deg, rgba(242, 107, 33, 0.08) 0%, rgba(20, 24, 32, 0.95) 100%)',
        border: s.ctaBorder || '1px solid rgba(242, 107, 33, 0.25)',
        borderRadius: s.ctaRadius || '12px',
        padding: isMobile ? '1.25rem 1rem' : '2rem 2.5rem',
        margin: s.ctaMargin || '2rem 0',
        boxShadow: s.ctaGlow ? '0 8px 32px rgba(242, 107, 33, 0.15)' : 'none',
      }}
    >
      <div className={styles.textContainer}>
        <h3
          className={styles.ctaTitle}
          style={{
            fontFamily: titleFont,
            fontSize: isMobile ? '1.2rem' : '1.6rem',
            color: titleColor,
          }}
        >
          {title}
        </h3>
        <p
          className={styles.ctaSubtitle}
          style={{
            fontFamily: textFont,
            fontSize: isMobile ? '0.85rem' : '0.95rem',
            color: subtitleColor,
          }}
        >
          {subtitle}
        </p>
      </div>

      <button
        type="button"
        className={styles.ctaButton}
        onClick={handleClick}
        disabled={isOwnershipCheckPending || isOwnershipCheckError || addCartMutation.isPending}
        style={{
          fontFamily: titleFont,
          background: btnBg,
          color: btnTextColor,
          borderRadius: s.ctaBtnRadius || '8px',
          padding: isMobile ? '0.85rem 1.25rem' : '0.85rem 2rem',
          fontSize: '0.95rem',
          cursor:
            isOwnershipCheckPending || isOwnershipCheckError || addCartMutation.isPending
              ? 'not-allowed'
              : 'pointer',
          opacity:
            isOwnershipCheckPending || isOwnershipCheckError || addCartMutation.isPending ? 0.7 : 1,
        }}
      >
        {isOwnershipCheckPending && (
          <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
        )}
        {isOwnershipCheckError && <AlertTriangle size={16} style={{ color: '#ef4444' }} />}
        {btnText}
      </button>
    </div>
  );
};

export default GameCtaBlock;

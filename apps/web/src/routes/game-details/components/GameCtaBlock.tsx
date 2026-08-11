import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useAddCartItem } from '../../../services/api/commerce';

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
const GREEN_ACCENT = '#38d39f';
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

  const handleClick = async () => {
    if (isDesignerPreview || isOwnershipCheckPending || isOwnershipCheckError) return;
    if (isOwned) {
      await navigate({ to: '/library' });
      return;
    }
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
      : isOwned
        ? s.ownedTitle || 'IN YOUR LIBRARY'
        : s.ctaTitle || s.title || 'PRE-ORDER NOW';
  const subtitle = isOwnershipCheckError
    ? 'Unable to verify game ownership. Purchase temporarily unavailable.'
    : isOwnershipCheckPending
      ? 'Checking game ownership in your library...'
      : isOwned
        ? s.ownedSubtitle || 'You already own this game. Access it from your library.'
        : s.ctaSubtitle || s.subtitle || 'Get exclusive pre-order bonuses and early access.';
  const titleColor = isOwnershipCheckError
    ? '#ef4444'
    : isOwned
      ? GREEN_ACCENT
      : s.ctaTitleColor || s.titleColor || TEXT_PRIMARY;
  const subtitleColor = s.ctaSubtitleColor || s.subtitleColor || TEXT_MUTED;
  const btnText = isOwnershipCheckError
    ? 'UNABLE TO VERIFY'
    : isOwnershipCheckPending
      ? 'CHECKING OWNERSHIP...'
      : isOwned
        ? s.ownedBtnText || 'VIEW IN LIBRARY'
        : s.ctaBtnText || s.btnText || 'BUY NOW';
  const btnBg =
    isOwnershipCheckError || isOwnershipCheckPending
      ? '#334155'
      : isOwned
        ? GREEN_ACCENT
        : s.ctaBtnColor || s.btnBg || HATHOR_ORANGE;
  const btnTextColor = isOwned ? '#0e1116' : s.ctaBtnTextColor || s.btnTextColor || '#ffffff';

  return (
    <div
      style={{
        background:
          s.ctaBg ||
          'linear-gradient(135deg, rgba(242, 107, 33, 0.08) 0%, rgba(20, 24, 32, 0.95) 100%)',
        border: s.ctaBorder || '1px solid rgba(242, 107, 33, 0.25)',
        borderRadius: s.ctaRadius || '12px',
        padding: device === 'mobile' ? '1.25rem 1rem' : '2rem 2.5rem',
        margin: s.ctaMargin || '2rem 0',
        display: 'flex',
        flexDirection: device === 'mobile' ? 'column' : 'row',
        alignItems: device === 'mobile' ? 'stretch' : 'center',
        justifyContent: 'space-between',
        gap: '1.5rem',
        boxShadow: s.ctaGlow ? '0 8px 32px rgba(242, 107, 33, 0.15)' : 'none',
      }}
    >
      <div>
        <h3
          style={{
            fontFamily: titleFont,
            fontSize: device === 'mobile' ? '1.2rem' : '1.6rem',
            color: titleColor,
            margin: '0 0 0.5rem 0',
            letterSpacing: '1px',
            textTransform: 'uppercase',
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontFamily: textFont,
            fontSize: device === 'mobile' ? '0.85rem' : '0.95rem',
            color: subtitleColor,
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          {subtitle}
        </p>
      </div>

      <button
        type="button"
        onClick={handleClick}
        disabled={isOwnershipCheckPending || isOwnershipCheckError || addCartMutation.isPending}
        style={{
          fontFamily: titleFont,
          background: btnBg,
          color: btnTextColor,
          border: 'none',
          borderRadius: s.ctaBtnRadius || '8px',
          padding: device === 'mobile' ? '0.75rem 1.5rem' : '0.85rem 2rem',
          fontSize: '0.95rem',
          fontWeight: 700,
          letterSpacing: '1px',
          cursor:
            isOwnershipCheckPending || isOwnershipCheckError || addCartMutation.isPending
              ? 'not-allowed'
              : 'pointer',
          opacity:
            isOwnershipCheckPending || isOwnershipCheckError || addCartMutation.isPending ? 0.7 : 1,
          transition: 'all 0.2s ease',
          whiteSpace: 'nowrap',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
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

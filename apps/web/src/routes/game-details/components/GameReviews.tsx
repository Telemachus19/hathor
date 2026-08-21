import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ThumbsUp, ThumbsDown, Minus, X, MessageSquare } from 'lucide-react';
import { getHarmonizedSentimentPalette } from '../../../utils/sentimentColors';

export interface GameReviewsProps {
  s?: any;
  score?: number;
  totalReviews?: string;
  reviews?: Array<any>;
  device?: 'desktop' | 'tablet' | 'mobile';
  pageSettings?: any;
  isOwned?: boolean;
  isAuthenticated?: boolean;
  isDesignerPreview?: boolean;
}

const GREEN_ACCENT = '#38d39f';
const SURFACE = '#181c24';
const BORDER = '#2e3544';
const TEXT_PRIMARY = '#ffffff';
const TEXT_MUTED = '#7a8b9e';

export const GameReviews: React.FC<GameReviewsProps> = (props) => {
  const s = props.s || {};
  const device = props.device || 'desktop';
  const isMobile = device === 'mobile';

  const isOwned = props.isOwned ?? (props.pageSettings?.isOwned === true);

  const [sentiment, setSentiment] = useState<'positive' | 'mixed' | 'negative'>('positive');
  const [reviewContent, setReviewContent] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Lock body scroll and close on Escape key when modal is open
  useEffect(() => {
    if (!isModalOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen]);

  const cardBg = s.reviewCardBg || SURFACE;
  const cardBorder = s.reviewCardBorder || BORDER;
  const cardRadius = s.reviewCardRadius ?? 4;
  const nameColor = s.reviewNameColor || TEXT_PRIMARY;
  const titleFont = s.font || s.titleFont || props.pageSettings?.titleFont || "'Cinzel', serif";
  const bodyColor = s.reviewBodyColor || '#94a3b8';
  const textFont = s.textFont || props.pageSettings?.textFont || "'Raleway', sans-serif";

  const sentimentPalette = getHarmonizedSentimentPalette(
    s.reviewBadgeColor || s.reviewAccentColor || s.reviewStarColor || GREEN_ACCENT
  );

  const headerTitle = s.reviewHeader || 'USER REVIEWS';
  const headerColor = s.reviewHeaderColor || s.reviewTitleColor || s.titleColor || '#f4b183';
  const totalRev = s.totalReviews || props.totalReviews || '0 total';

  const reviewsList = s.reviews ||
    props.reviews || [
      {
        id: 'rev_1',
        userName: 'CYBER_RUNNER',
        userAvatarInitials: 'CR',
        score: 0,
        date: 'Recent',
        comment: 'Absolute masterpiece. The visuals and atmosphere set a new benchmark in gaming excellence.',
        sentiment: 'positive',
      },
      {
        id: 'rev_2',
        userName: 'PIXEL_WARRIOR',
        userAvatarInitials: 'PW',
        score: 0,
        date: 'Last Month',
        comment: 'Stunning design and combat mechanics. Highly recommended for fans of the genre.',
        sentiment: 'positive',
      },
      {
        id: 'rev_3',
        userName: 'SHADOW_BLADE',
        userAvatarInitials: 'SB',
        score: 0,
        date: '2 months ago',
        comment: 'Solid gameplay, though boss difficulty spikes significantly in late game areas.',
        sentiment: 'mixed',
      },
      {
        id: 'rev_4',
        userName: 'NEO_TACTICIAN',
        userAvatarInitials: 'NT',
        score: 0,
        date: '3 months ago',
        comment: 'Great storyline and art direction, but needs performance optimization on older rigs.',
        sentiment: 'mixed',
      },
    ];

  const displayedReviews = reviewsList.slice(0, 2);

  const renderReviewCard = (rev: any, idx: number, inModal = false) => {
    const revSentiment =
      rev.sentiment || (rev.recommended === false ? 'negative' : 'positive');

    const badgeStyles =
      revSentiment === 'negative'
        ? {
            bg: sentimentPalette.negative.bg,
            border: sentimentPalette.negative.border,
            color: sentimentPalette.negative.color,
            label: 'Negative',
            icon: <ThumbsDown size={11} />,
          }
        : revSentiment === 'mixed'
          ? {
              bg: sentimentPalette.mixed.bg,
              border: sentimentPalette.mixed.border,
              color: sentimentPalette.mixed.color,
              label: 'Mixed',
              icon: <Minus size={11} />,
            }
          : {
              bg: sentimentPalette.positive.bg,
              border: sentimentPalette.positive.border,
              color: sentimentPalette.positive.color,
              label: 'Recommended',
              icon: <ThumbsUp size={11} />,
            };

    const authorName = rev.userName || rev.author || 'SAMPLE_USER';
    const authorInitials =
      rev.userAvatarInitials ||
      authorName
        .split(' ')
        .map((p: string) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() ||
      'SU';
    const commentText =
      rev.comment || rev.content || 'Player reviews will appear here once the game is reviewed.';

    return (
      <div
        key={rev.id || idx}
        style={{
          background: inModal ? 'rgba(0, 0, 0, 0.35)' : cardBg,
          border: `1px solid ${cardBorder}`,
          borderRadius: cardRadius,
          padding: isMobile ? 14 : 18,
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 3,
                background: 'rgba(0,0,0,0.3)',
                border: `1px solid ${BORDER}`,
                color: nameColor,
                fontFamily: titleFont,
                fontWeight: 900,
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {authorInitials}
            </div>
            <div>
              <div
                style={{
                  color: nameColor,
                  fontWeight: 700,
                  fontSize: 13,
                  fontFamily: textFont,
                }}
              >
                {authorName}
              </div>
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: 3,
            }}
          >
            <div
              style={{
                background: badgeStyles.bg,
                border: `1px solid ${badgeStyles.border}`,
                color: badgeStyles.color,
                padding: '3px 8px',
                borderRadius: 3,
                fontSize: 10,
                fontWeight: 800,
                fontFamily: 'monospace',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              {badgeStyles.icon} {badgeStyles.label}
            </div>
            <span style={{ fontSize: 10, color: TEXT_MUTED, fontFamily: 'monospace' }}>
              {rev.date || 'No date'}
            </span>
          </div>
        </div>
        <p
          style={{
            fontFamily: textFont,
            fontSize: isMobile ? 12 : 13,
            color: bodyColor,
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          {commentText}
        </p>
      </div>
    );
  };

  return (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>
      <style>{`
        @media (max-width: 640px) {
          .hathor-write-review-header {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
          }
          .hathor-sentiment-selector {
            width: 100% !important;
            box-sizing: border-box !important;
          }
          .hathor-sentiment-btn {
            flex: 1 !important;
            justify-content: center !important;
            padding: 8px 6px !important;
            font-size: 11px !important;
          }
        }
      `}</style>

      {/* Header Row: Title and Total Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h2
            style={{
              fontFamily: titleFont,
              fontSize: isMobile ? 16 : 18,
              fontWeight: 900,
              color: headerColor,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              margin: 0,
            }}
          >
            {headerTitle}
          </h2>
          <span
            style={{
              border: `1px solid ${BORDER}`,
              background: 'rgba(0,0,0,0.3)',
              color: TEXT_MUTED,
              fontSize: 10,
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: 3,
              fontFamily: 'monospace',
            }}
          >
            {totalRev}
          </span>
        </div>
      </div>

      {/* Write Review Box (Only displayed if user owns the game) */}
      {isOwned && (
        <div
          style={{
            background: cardBg,
            border: `1px solid ${cardBorder}`,
            borderRadius: cardRadius,
            padding: isMobile ? 14 : 20,
            marginBottom: 20,
            boxSizing: 'border-box',
          }}
        >
          <div
            className="hathor-write-review-header"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'stretch' : 'center',
              flexDirection: isMobile ? 'column' : 'row',
              flexWrap: 'wrap',
              gap: 12,
              marginBottom: 14,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: titleFont,
                  fontSize: 14,
                  fontWeight: 800,
                  color: nameColor,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                Write a Review
              </div>
              <div
                style={{
                  fontFamily: textFont,
                  fontSize: 12,
                  color: TEXT_MUTED,
                  marginTop: 2,
                }}
              >
                You own this game. Share your verdict with the community.
              </div>
            </div>

            {/* Sentiment Selector */}
            <div
              className="hathor-sentiment-selector"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(0,0,0,0.25)',
                padding: '4px 6px',
                borderRadius: cardRadius,
                border: `1px solid ${cardBorder}`,
                width: isMobile ? '100%' : 'auto',
                boxSizing: 'border-box',
              }}
            >
              <button
                type="button"
                className="hathor-sentiment-btn"
                onClick={() => setSentiment('positive')}
                style={{
                  flex: isMobile ? 1 : 'initial',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: isMobile ? '8px 6px' : '6px 14px',
                  borderRadius: 4,
                  fontSize: isMobile ? 11 : 12,
                  fontWeight: 700,
                  fontFamily: textFont,
                  cursor: 'pointer',
                  border:
                    sentiment === 'positive'
                      ? `1px solid ${sentimentPalette.positive.border}`
                      : '1px solid rgba(255, 255, 255, 0.06)',
                  background:
                    sentiment === 'positive' ? sentimentPalette.positive.bg : 'rgba(0, 0, 0, 0.2)',
                  color:
                    sentiment === 'positive' ? sentimentPalette.positive.color : '#cbd5e1',
                  transition: 'all 0.15s ease',
                }}
              >
                <ThumbsUp size={14} color={sentimentPalette.positive.color} /> Positive
              </button>

              <button
                type="button"
                className="hathor-sentiment-btn"
                onClick={() => setSentiment('mixed')}
                style={{
                  flex: isMobile ? 1 : 'initial',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: isMobile ? '8px 6px' : '6px 14px',
                  borderRadius: 4,
                  fontSize: isMobile ? 11 : 12,
                  fontWeight: 700,
                  fontFamily: textFont,
                  cursor: 'pointer',
                  border:
                    sentiment === 'mixed'
                      ? `1px solid ${sentimentPalette.mixed.border}`
                      : '1px solid rgba(255, 255, 255, 0.06)',
                  background:
                    sentiment === 'mixed' ? sentimentPalette.mixed.bg : 'rgba(0, 0, 0, 0.2)',
                  color:
                    sentiment === 'mixed' ? sentimentPalette.mixed.color : '#cbd5e1',
                  transition: 'all 0.15s ease',
                }}
              >
                <Minus size={14} color={sentimentPalette.mixed.color} /> Mixed
              </button>

              <button
                type="button"
                className="hathor-sentiment-btn"
                onClick={() => setSentiment('negative')}
                style={{
                  flex: isMobile ? 1 : 'initial',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: isMobile ? '8px 6px' : '6px 14px',
                  borderRadius: 4,
                  fontSize: isMobile ? 11 : 12,
                  fontWeight: 700,
                  fontFamily: textFont,
                  cursor: 'pointer',
                  border:
                    sentiment === 'negative'
                      ? `1px solid ${sentimentPalette.negative.border}`
                      : '1px solid rgba(255, 255, 255, 0.06)',
                  background:
                    sentiment === 'negative' ? sentimentPalette.negative.bg : 'rgba(0, 0, 0, 0.2)',
                  color:
                    sentiment === 'negative' ? sentimentPalette.negative.color : '#cbd5e1',
                  transition: 'all 0.15s ease',
                }}
              >
                <ThumbsDown size={14} color={sentimentPalette.negative.color} /> Negative
              </button>
            </div>
          </div>

          {/* Textarea */}
          <textarea
            value={reviewContent}
            onChange={(e) => setReviewContent(e.target.value)}
            placeholder="What did you think of the game? Describe your experience, gameplay mechanics, and recommendations..."
            rows={4}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              background: 'rgba(0, 0, 0, 0.3)',
              border: `1px solid ${cardBorder}`,
              borderRadius: cardRadius,
              padding: 12,
              color: nameColor,
              fontFamily: textFont,
              fontSize: 13,
              lineHeight: 1.6,
              resize: 'vertical',
              outline: 'none',
              marginBottom: 12,
            }}
          />

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <button
              type="button"
              disabled={!reviewContent.trim()}
              style={{
                fontFamily: titleFont,
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: '8px 20px',
                borderRadius: cardRadius,
                border: 'none',
                background: reviewContent.trim()
                  ? `linear-gradient(135deg, ${sentimentPalette[sentiment].color} 0%, #f26b21 100%)`
                  : 'rgba(255, 255, 255, 0.08)',
                color: reviewContent.trim() ? '#ffffff' : TEXT_MUTED,
                cursor: reviewContent.trim() ? 'pointer' : 'not-allowed',
                transition: 'all 0.15s ease',
              }}
            >
              Post Review
            </button>
          </div>
        </div>
      )}

      {/* Reviews Cards List (Only top 2 reviews shown by default) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {displayedReviews.map((rev: any, idx: number) => renderReviewCard(rev, idx, false))}
      </div>

      {/* View All Reviews Button */}
      {reviewsList.length > 2 && (
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: `1px solid ${cardBorder}`,
            borderRadius: cardRadius,
            color: nameColor,
            fontFamily: titleFont,
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'all 0.2s ease',
            marginTop: 14,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = headerColor;
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = cardBorder;
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
          }}
        >
          <MessageSquare size={14} color="currentColor" />
          View All Reviews ({reviewsList.length})
        </button>
      )}

      {/* All Reviews Modal */}
      {isModalOpen &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999999,
              background: 'rgba(6, 8, 12, 0.88)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: isMobile ? 12 : 24,
              boxSizing: 'border-box',
              overscrollBehavior: 'contain',
            }}
            onClick={() => setIsModalOpen(false)}
          >
            <div
              style={{
                width: '100%',
                maxWidth: 680,
                height: isMobile ? '88vh' : '75vh',
                maxHeight: '90vh',
                background: '#131720',
                border: `1px solid ${cardBorder}`,
                borderRadius: 8,
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxSizing: 'border-box',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: isMobile ? '14px 16px' : '18px 22px',
                  borderBottom: `1px solid ${cardBorder}`,
                  background: 'rgba(0, 0, 0, 0.25)',
                  flexShrink: 0,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h3
                    style={{
                      fontFamily: titleFont,
                      fontSize: isMobile ? 15 : 17,
                      fontWeight: 800,
                      color: headerColor,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      margin: 0,
                    }}
                  >
                    {headerTitle}
                  </h3>
                  <span
                    style={{
                      border: `1px solid ${BORDER}`,
                      background: 'rgba(0,0,0,0.4)',
                      color: TEXT_MUTED,
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 3,
                      fontFamily: 'monospace',
                    }}
                  >
                    {reviewsList.length} total
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 4,
                    color: '#cbd5e1',
                    cursor: 'pointer',
                    padding: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#cbd5e1';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                  }}
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body / Reviews List */}
              <div
                style={{
                  flex: 1,
                  minHeight: 0,
                  overflowY: 'auto',
                  overscrollBehavior: 'contain',
                  WebkitOverflowScrolling: 'touch',
                  padding: isMobile ? 14 : 20,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                {reviewsList.map((rev: any, idx: number) => renderReviewCard(rev, idx, true))}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default GameReviews;


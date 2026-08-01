import React from 'react';
import { ThumbsUp } from 'lucide-react';

export interface GameReviewsProps {
  s?: any;
  score?: number;
  totalReviews?: string;
  reviews?: Array<any>;
  device?: 'desktop' | 'tablet' | 'mobile';
  pageSettings?: any;
}

const HATHOR_ORANGE = '#f26b21';
const GREEN_ACCENT = '#38d39f';
const SURFACE = '#181c24';
const BORDER = '#2e3544';
const TEXT_PRIMARY = '#ffffff';
const TEXT_MUTED = '#7a8b9e';

export const GameReviews: React.FC<GameReviewsProps> = (props) => {
  const s = props.s || {};
  const device = props.device || 'desktop';
  const isMobile = device === 'mobile';

  const cardBg = s.reviewCardBg || SURFACE;
  const cardBorder = s.reviewCardBorder || BORDER;
  const cardRadius = s.reviewCardRadius ?? 4;
  const nameColor = s.reviewNameColor || TEXT_PRIMARY;
  const titleFont = s.font || s.titleFont || props.pageSettings?.titleFont || "'Cinzel', serif";
  const bodyColor = s.reviewBodyColor || '#94a3b8';
  const textFont = s.textFont || props.pageSettings?.textFont || "'Raleway', sans-serif";
  const starColor = s.reviewStarColor || HATHOR_ORANGE;
  const badgeColor = s.reviewBadgeColor || GREEN_ACCENT;
  const badgeBg = s.reviewBadgeBg || 'rgba(56, 211, 159, 0.1)';

  const headerTitle = s.reviewHeader || 'USER REVIEWS';
  const scoreVal = s.reviewScore || props.score || 0;
  const totalRev = s.totalReviews || props.totalReviews || '0 total';

  const reviewsList = s.reviews || props.reviews || [
    {
      id: 'rev_sample',
      userName: 'SAMPLE_USER',
      userAvatarInitials: 'SU',
      score: 0,
      date: 'No reviews yet',
      comment: 'Player reviews will appear here once the game is published and reviewed.',
      recommended: true,
      helpfulCount: 0
    }
  ];

  return (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>
      {/* Header Row: Title, Total Badge, Overall Score */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h2 style={{ fontFamily: titleFont, fontSize: isMobile ? 16 : 18, fontWeight: 900, color: '#f4b183', letterSpacing: '0.14em', textTransform: 'uppercase', margin: 0 }}>
            {headerTitle}
          </h2>
          <span style={{ border: `1px solid ${BORDER}`, background: 'rgba(0,0,0,0.3)', color: TEXT_MUTED, fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 3, fontFamily: 'monospace' }}>
            {totalRev}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: starColor, fontSize: 13, letterSpacing: '0.1em' }}>★★★★★</span>
          <span style={{ fontFamily: titleFont, fontSize: isMobile ? 18 : 22, fontWeight: 900, color: starColor }}>{scoreVal}</span>
          <span style={{ color: TEXT_MUTED, fontSize: 11, fontFamily: 'monospace' }}>/ 10</span>
        </div>
      </div>

      {/* Reviews Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {reviewsList.map((rev: any, idx: number) => (
          <div key={rev.id || idx} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: cardRadius, padding: isMobile ? 14 : 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 3, background: 'rgba(0,0,0,0.3)', border: `1px solid ${BORDER}`,
                  color: starColor, fontFamily: titleFont, fontWeight: 900, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  {rev.userAvatarInitials || 'SU'}
                </div>
                <div>
                  <div style={{ color: nameColor, fontWeight: 700, fontSize: 14, fontFamily: textFont }}>{rev.userName || 'SAMPLE_USER'}</div>
                  <div style={{ color: starColor, fontSize: 12, marginTop: 2 }}>
                    ★★★★★ <span style={{ color: starColor, fontSize: 11, fontWeight: 800, fontFamily: 'monospace' }}>{rev.score || 0}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <div style={{ background: badgeBg, border: `1px solid ${badgeColor}`, color: badgeColor, padding: '3px 8px', borderRadius: 3, fontSize: 10, fontWeight: 800, fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <ThumbsUp size={11} /> Recommended
                </div>
                <span style={{ fontSize: 10, color: TEXT_MUTED, fontFamily: 'monospace' }}>{rev.date || 'No date'}</span>
              </div>
            </div>
            <p style={{ fontFamily: textFont, fontSize: isMobile ? 12 : 13, color: bodyColor, lineHeight: 1.65, margin: '0 0 14px 0', paddingBottom: 12, borderBottom: `1px solid ${cardBorder}` }}>
              {rev.comment || 'Player reviews will appear here once the game is published and reviewed.'}
            </p>
            <div style={{ fontSize: 11, color: TEXT_MUTED, display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'monospace' }}>
              <ThumbsUp size={11} /> {rev.helpfulCount || 0} people found this helpful
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameReviews;

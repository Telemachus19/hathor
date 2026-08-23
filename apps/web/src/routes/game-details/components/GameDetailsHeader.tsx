import React from 'react';
import { ThumbsUp, ThumbsDown, Minus } from 'lucide-react';

export interface GameDetailsHeaderProps {
  s?: any;
  category?: string;
  title?: string;
  subtitle?: string;
  ratingScore?: number;
  ratingPercentage?: number | null;
  ratingsBreakdown?: Array<{
    sentiment: 'positive' | 'mixed' | 'negative';
    count: number;
    percent: number;
  }>;
  userReviews?: any[];
  reviewCount?: string;
  developer?: string;
  releaseDate?: string;
  tags?: Array<{ name: string; slug: string }> | string[];
  description?: string;
  device?: 'desktop' | 'tablet' | 'mobile';
  pageSettings?: any;
}

const HATHOR_ORANGE = '#f26b21';
const BORDER = '#2e3544';
const TEXT_PRIMARY = '#ffffff';
const TEXT_MUTED = '#94a3b8';

export const GameDetailsHeader: React.FC<GameDetailsHeaderProps> = (props) => {
  const s = props.s || {};
  const device = props.device || 'desktop';

  const category = props.category || s.category || s.gameCategory || 'Action';
  const title = props.title || s.title || s.gameTitle || 'YOUR GAME TITLE';
  const subtitle =
    props.subtitle !== undefined ? props.subtitle : s.subtitle || s.gameSubtitle || '';
  const developer = props.developer || s.dev || s.gameDev || 'Hathor Studios';
  const releaseDate = props.releaseDate || s.releaseDate || s.gameReleaseDate || 'Aug 2026';

  const rawTags = props.tags || s.tags || s.gameTags || ['Indie', 'Adventure'];
  const formattedTags: string[] = rawTags.map((t: any) => (typeof t === 'string' ? t : t.name));

  const description =
    props.description || s.desc || s.gameDesc || 'Experience an epic adventure on Hathor.';

  const titleSize = device === 'mobile' ? 24 : device === 'tablet' ? 32 : s.titleSize || 40;
  const titleFont = s.font || s.titleFont || props.pageSettings?.titleFont || "'Cinzel', serif";
  const subtitleFont = s.subtitleFont || titleFont;
  const textFont = s.textFont || props.pageSettings?.textFont || "'Raleway', sans-serif";

  // Colors & Styles
  const badgeColor = s.badgeColor || s.subtitleColor || HATHOR_ORANGE;
  const titleColor = s.titleColor || '#ffffff';
  const subtitleColor = s.subtitleColor || HATHOR_ORANGE;
  const tagBg = s.tagBg || 'rgba(255, 255, 255, 0.05)';
  const tagBorder = s.tagBorder || BORDER;
  const tagColor = s.tagColor || TEXT_MUTED;
  const descColor = s.descColor || TEXT_MUTED;

  const reviewCountColor =
    s.reviewCountColor || s.headerReviewCountColor || s.descColor || TEXT_MUTED;
  const reviewCountFont = s.reviewCountFont || s.headerReviewCountFont || textFont;
  const devColor = s.devColor || s.headerDevColor || s.valueColor || TEXT_PRIMARY;
  const devFont = s.devFont || s.headerDevFont || textFont;
  const dateColor = s.dateColor || s.headerDateColor || s.valueColor || TEXT_PRIMARY;
  const dateFont = s.dateFont || s.headerDateFont || textFont;
  const bulletColor = s.bulletColor || s.metaSeparatorColor || TEXT_MUTED;

  // Container styling & padding
  const headerBg = s.headerBg || 'transparent';
  const headerBorder = s.headerBorder || 'transparent';
  const headerRadius = s.headerRadius ?? 0;

  const isCard =
    (headerBg && headerBg !== 'transparent' && headerBg !== 'none') ||
    (headerBorder && headerBorder !== 'transparent' && headerBorder !== 'none');
  const defaultPad = isCard ? (device === 'mobile' ? 16 : 24) : 0;
  const pt = s.pt ?? s.headerPadTop ?? defaultPad;
  const pb = s.pb ?? s.headerPadBottom ?? defaultPad;
  const pl = s.pl ?? s.ph ?? s.headerPadLeft ?? defaultPad;
  const pr = s.pr ?? s.ph ?? s.headerPadRight ?? defaultPad;
  const borderStyle =
    headerBorder && headerBorder !== 'transparent' && headerBorder !== 'none'
      ? `1px solid ${headerBorder}`
      : 'none';

  // ---------------------------------------------------------------------------
  // Weighted Rating Calculation:
  // Positive = 1, Mixed = 0.5, Negative = 0
  // Score % = ((positive * 1 + mixed * 0.5 + negative * 0) / totalReviews) * 100
  // ---------------------------------------------------------------------------
  let posCount = 0;
  let mixCount = 0;
  let negCount = 0;

  if (Array.isArray(props.ratingsBreakdown) && props.ratingsBreakdown.length > 0) {
    posCount = props.ratingsBreakdown.find((b) => b.sentiment === 'positive')?.count ?? 0;
    mixCount = props.ratingsBreakdown.find((b) => b.sentiment === 'mixed')?.count ?? 0;
    negCount = props.ratingsBreakdown.find((b) => b.sentiment === 'negative')?.count ?? 0;
  } else if (Array.isArray(props.userReviews) && props.userReviews.length > 0) {
    posCount = props.userReviews.filter((r) => r.sentiment === 'positive').length;
    mixCount = props.userReviews.filter((r) => r.sentiment === 'mixed').length;
    negCount = props.userReviews.filter((r) => r.sentiment === 'negative').length;
  }

  const calculatedTotal = posCount + mixCount + negCount;

  let computedPercentage: number | null = null;
  if (props.ratingPercentage !== undefined && props.ratingPercentage !== null) {
    computedPercentage = props.ratingPercentage;
  } else if (s.ratingPercentage !== undefined && s.ratingPercentage !== null) {
    computedPercentage = Number(s.ratingPercentage);
  } else if (calculatedTotal > 0) {
    const weightedScore = (posCount * 1 + mixCount * 0.5 + negCount * 0) / calculatedTotal;
    computedPercentage = Math.round(weightedScore * 100);
  }

  const effectiveTotal = calculatedTotal > 0 ? calculatedTotal : (props.userReviews?.length ?? 0);
  const reviewCountText =
    props.reviewCount ||
    s.reviewCount ||
    s.gameReviewCount ||
    (effectiveTotal > 0
      ? `${effectiveTotal} ${effectiveTotal === 1 ? 'Review' : 'Reviews'}`
      : '0 Reviews');

  const getSentimentDisplay = (pct: number | null) => {
    if (pct === null || (effectiveTotal === 0 && props.ratingPercentage === undefined)) {
      return {
        hasRating: false,
        label: 'No reviews yet',
        color: TEXT_MUTED,
        bg: 'rgba(255, 255, 255, 0.04)',
        border: tagBorder,
        icon: null,
      };
    }

    if (pct >= 70) {
      return {
        hasRating: true,
        label: pct >= 85 ? 'Very Positive' : 'Positive',
        color: '#4ade80',
        bg: 'rgba(74, 222, 128, 0.12)',
        border: 'rgba(74, 222, 128, 0.35)',
        icon: <ThumbsUp size={11} style={{ flexShrink: 0 }} />,
      };
    } else if (pct >= 40) {
      return {
        hasRating: true,
        label: 'Mixed',
        color: '#fbbf24',
        bg: 'rgba(251, 191, 36, 0.12)',
        border: 'rgba(251, 191, 36, 0.35)',
        icon: <Minus size={11} style={{ flexShrink: 0 }} />,
      };
    } else {
      return {
        hasRating: true,
        label: 'Negative',
        color: '#f87171',
        bg: 'rgba(248, 113, 113, 0.12)',
        border: 'rgba(248, 113, 113, 0.35)',
        icon: <ThumbsDown size={11} style={{ flexShrink: 0 }} />,
      };
    }
  };

  const sentimentDisplay = getSentimentDisplay(computedPercentage);

  return (
    <div
      style={{
        marginBottom: s.mb ?? 0,
        width: '100%',
        boxSizing: 'border-box',
        background: headerBg,
        border: borderStyle,
        borderRadius: headerRadius,
        paddingTop: pt,
        paddingBottom: pb,
        paddingLeft: pl,
        paddingRight: pr,
      }}
    >
      {category && (
        <div
          style={{
            fontFamily: textFont,
            fontSize: device === 'mobile' ? 10 : 12,
            fontWeight: 700,
            color: badgeColor,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            marginBottom: 6,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          <span style={{ display: 'inline-block', width: 12, height: 2, background: badgeColor }} />
          <span>{category}</span>
          <span style={{ display: 'inline-block', width: 12, height: 2, background: badgeColor }} />
        </div>
      )}

      <h1
        style={{
          fontFamily: titleFont,
          fontSize: titleSize,
          fontWeight: 900,
          color: titleColor,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          lineHeight: 1.15,
          margin: '0 0 8px 0',
          wordBreak: 'break-word',
          overflowWrap: 'anywhere',
        }}
      >
        {title}
      </h1>

      {subtitle && (
        <div
          style={{
            fontFamily: subtitleFont,
            fontSize: device === 'mobile' ? 11 : 13,
            fontWeight: 800,
            color: subtitleColor,
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            marginBottom: 12,
            wordBreak: 'break-word',
          }}
        >
          {subtitle}
        </div>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: device === 'mobile' ? 8 : 12,
          fontSize: device === 'mobile' ? 11 : 13,
          marginBottom: 16,
          flexWrap: 'wrap',
        }}
      >
        {sentimentDisplay.hasRating ? (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              background: sentimentDisplay.bg,
              border: `1px solid ${sentimentDisplay.border}`,
              padding: '2.5px 8px',
              borderRadius: 4,
              fontSize: device === 'mobile' ? 11 : 12,
              fontWeight: 700,
              fontFamily: textFont,
              color: sentimentDisplay.color,
            }}
          >
            {sentimentDisplay.icon}
            <span style={{ fontWeight: 800 }}>{computedPercentage}%</span>
            <span
              style={{ opacity: 0.85, fontWeight: 600, fontSize: device === 'mobile' ? 10 : 11 }}
            >
              {sentimentDisplay.label}
            </span>
          </div>
        ) : (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              background: sentimentDisplay.bg,
              border: `1px solid ${sentimentDisplay.border}`,
              padding: '2.5px 8px',
              borderRadius: 4,
              fontSize: device === 'mobile' ? 10 : 11,
              fontWeight: 600,
              fontFamily: textFont,
              color: sentimentDisplay.color,
            }}
          >
            <span>{sentimentDisplay.label}</span>
          </div>
        )}

        <span style={{ fontSize: 11, color: reviewCountColor, fontFamily: reviewCountFont }}>
          ({reviewCountText})
        </span>
        <span style={{ opacity: 0.4, color: bulletColor }}>•</span>
        <span style={{ color: devColor, fontFamily: devFont }}>{developer}</span>
        <span style={{ opacity: 0.4, color: bulletColor }}>•</span>
        <span style={{ color: dateColor, fontFamily: dateFont }}>{releaseDate}</span>
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
        {formattedTags.map((t: string, i: number) => (
          <span
            key={i}
            style={{
              background: tagBg,
              border: `1px solid ${tagBorder}`,
              color: tagColor,
              fontSize: device === 'mobile' ? 9 : 11,
              fontWeight: 600,
              padding: '3px 10px',
              borderRadius: 3,
              textTransform: 'uppercase',
              fontFamily: textFont,
            }}
          >
            {t}
          </span>
        ))}
      </div>

      <p
        style={{
          fontFamily: textFont,
          fontSize: device === 'mobile' ? 13 : 14.5,
          lineHeight: 1.65,
          color: descColor,
          margin: 0,
          wordBreak: 'break-word',
        }}
      >
        {description}
      </p>
    </div>
  );
};

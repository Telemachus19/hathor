import React from 'react';

export interface GameDetailsHeaderProps {
  s?: any;
  category?: string;
  title?: string;
  subtitle?: string;
  ratingScore?: number;
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

  const category = s.category || s.gameCategory || props.category || 'GENRE';
  const title = s.title || s.gameTitle || props.title || 'YOUR GAME TITLE';
  const subtitle = s.subtitle || s.gameSubtitle || props.subtitle || '';
  const ratingScore = s.ratingScore ?? s.gameRatingScore ?? props.ratingScore ?? 9.4;
  const reviewCount = s.reviewCount || s.gameReviewCount || props.reviewCount || '0 Reviews';
  const developer = s.dev || s.gameDev || props.developer || 'Developer Name';
  const releaseDate = s.releaseDate || s.gameReleaseDate || props.releaseDate || 'Coming Soon';

  const rawTags = s.tags || s.gameTags || props.tags || ['TAG 1', 'TAG 2'];
  const formattedTags: string[] = rawTags.map((t: any) => (typeof t === 'string' ? t : t.name));

  const description =
    s.desc || s.gameDesc || props.description || 'Your game description will appear here.';

  const titleSize = device === 'mobile' ? 24 : device === 'tablet' ? 32 : s.titleSize || 40;
  const titleFont = s.font || s.titleFont || props.pageSettings?.titleFont || "'Cinzel', serif";
  const subtitleFont = s.subtitleFont || titleFont;
  const textFont = s.textFont || props.pageSettings?.textFont || "'Raleway', sans-serif";

  // Colors & Fonts
  const badgeColor = s.badgeColor || s.subtitleColor || HATHOR_ORANGE;
  const titleColor = s.titleColor || '#ffffff';
  const subtitleColor = s.subtitleColor || HATHOR_ORANGE;
  const starColor = s.starColor || HATHOR_ORANGE;
  const tagBg = s.tagBg || 'rgba(255, 255, 255, 0.05)';
  const tagBorder = s.tagBorder || BORDER;
  const tagColor = s.tagColor || TEXT_MUTED;
  const descColor = s.descColor || TEXT_MUTED;

  const ratingScoreColor = s.ratingScoreColor || s.headerRatingColor || s.valueColor || '#ffffff';
  const ratingScoreFont = s.ratingScoreFont || s.headerRatingFont || titleFont;
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
          gap: device === 'mobile' ? 8 : 14,
          fontSize: device === 'mobile' ? 11 : 13,
          marginBottom: 16,
          flexWrap: 'wrap',
        }}
      >
        <span style={{ color: starColor, letterSpacing: '0.1em' }}>★★★★★</span>
        <span style={{ fontWeight: 800, color: ratingScoreColor, fontFamily: ratingScoreFont }}>
          {Number(ratingScore).toFixed(1)}
        </span>
        <span style={{ fontSize: 11, color: reviewCountColor, fontFamily: reviewCountFont }}>
          ({reviewCount})
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

import React from 'react';

export interface GameCtaBlockProps {
  s?: any;
  device?: 'desktop' | 'tablet' | 'mobile';
  pageSettings?: any;
}

const HATHOR_ORANGE = '#f26b21';
const TEXT_PRIMARY = '#ffffff';
const TEXT_MUTED = '#94a3b8';

export const GameCtaBlock: React.FC<GameCtaBlockProps> = ({
  s = {},
  device = 'desktop',
  pageSettings,
}) => {
  const titleFont = s.font || s.titleFont || pageSettings?.titleFont || "'Cinzel', serif";
  const textFont = s.textFont || pageSettings?.textFont || "'Raleway', sans-serif";

  const title = s.ctaTitle || s.title || 'PRE-ORDER NOW';
  const subtitle =
    s.ctaSubtitle || s.subtitle || 'Get exclusive pre-order bonuses and early access.';
  const titleColor = s.ctaTitleColor || s.titleColor || TEXT_PRIMARY;
  const subtitleColor = s.ctaSubtitleColor || s.subtitleColor || TEXT_MUTED;
  const btnText = s.ctaBtnText || s.btnText || 'BUY NOW';
  const btnBg = s.ctaBtnColor || s.btnBg || HATHOR_ORANGE;
  const btnTextColor = s.ctaBtnTextColor || s.btnTextColor || '#ffffff';

  return (
    <div
      style={{
        background:
          s.ctaBg ||
          'linear-gradient(135deg, rgba(40, 24, 20, 0.6) 0%, rgba(18, 22, 30, 0.95) 100%)',
        border: `1px solid ${s.ctaBorder || HATHOR_ORANGE}`,
        borderRadius: 4,
        padding: device === 'mobile' ? '24px 16px' : '40px 24px',
        textAlign: 'center',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <h2
        style={{
          fontFamily: titleFont,
          fontSize: device === 'mobile' ? 18 : 24,
          fontWeight: 900,
          color: titleColor,
          margin: '0 0 10px 0',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}
      >
        {title}
      </h2>
      <p
        style={{
          fontFamily: textFont,
          fontSize: device === 'mobile' ? 12 : 14,
          color: subtitleColor,
          margin: '0 0 24px 0',
          lineHeight: 1.5,
        }}
      >
        {subtitle}
      </p>
      <button
        style={{
          background: btnBg,
          color: btnTextColor,
          border: 'none',
          padding: '12px 32px',
          borderRadius: 4,
          fontWeight: 900,
          fontSize: 13,
          cursor: 'pointer',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        {btnText}
      </button>
    </div>
  );
};

export default GameCtaBlock;

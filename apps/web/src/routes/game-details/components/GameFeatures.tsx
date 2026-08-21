import React from 'react';

export interface GameFeaturesProps {
  s?: any;
  device?: 'desktop' | 'tablet' | 'mobile';
  pageSettings?: any;
}

const HATHOR_ORANGE = '#f26b21';
const SURFACE = '#181c24';
const BORDER = '#2e3544';
const TEXT_PRIMARY = '#ffffff';
const TEXT_MUTED = '#94a3b8';

export const GameFeatures: React.FC<GameFeaturesProps> = ({
  s = {},
  device = 'desktop',
  pageSettings,
}) => {
  const items = s.featuresItems || [
    { icon: '🎮', title: 'FEATURE ONE', desc: 'Describe a key feature.', color: HATHOR_ORANGE },
    { icon: '🌍', title: 'FEATURE TWO', desc: 'Describe another feature.', color: HATHOR_ORANGE },
    { icon: '⚡', title: 'FEATURE THREE', desc: 'Describe a third feature.', color: HATHOR_ORANGE },
  ];
  const cols = device === 'mobile' ? 1 : device === 'tablet' ? 2 : s.featuresCols || 3;
  const isMobile = device === 'mobile';
  const isTablet = device === 'tablet';

  const gridColsCss =
    isMobile
      ? '1fr'
      : isTablet
        ? 'repeat(2, 1fr)'
        : `repeat(${cols}, 1fr)`;

  const titleFont = s.font || s.titleFont || pageSettings?.titleFont || "'Cinzel', serif";
  const textFont = s.textFont || pageSettings?.textFont || "'Raleway', sans-serif";

  const titleColor = s.featuresTitleColor || s.titleColor || s.accentColor || HATHOR_ORANGE;
  const cardBg = s.featuresCardBg || s.cardBg || s.bg || SURFACE;
  const cardBorder = s.featuresCardBorder || s.cardBorder || s.borderColor || BORDER;
  const cardRadius = s.featuresCardRadius ?? s.cardRadius ?? 4;
  const itemTitleColor = s.featureItemTitleColor || s.itemTitleColor || s.textColor || TEXT_PRIMARY;
  const itemDescColor = s.featureItemDescColor || s.itemDescColor || s.descColor || TEXT_MUTED;

  const bg = s.featuresBg || 'transparent';
  const isCard = bg !== 'transparent' && bg !== '';
  const pt = s.pt ?? (isCard ? 16 : 0);
  const pb = s.pb ?? (isCard ? 16 : 0);
  const pl = s.pl ?? s.ph ?? (isCard ? 16 : 0);
  const pr = s.pr ?? s.ph ?? (isCard ? 16 : 0);

  return (
    <div
      style={{
        width: '100%',
        boxSizing: 'border-box',
        background: bg,
        paddingTop: pt,
        paddingBottom: pb,
        paddingLeft: pl,
        paddingRight: pr,
      }}
    >
      <style>{`
        @media (max-width: 640px) {
          .hathor-features-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
        }
        @media (min-width: 641px) and (max-width: 960px) {
          .hathor-features-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>

      {s.featuresTitle && (
        <h2
          style={{
            fontFamily: titleFont,
            fontSize: isMobile ? 14 : 16,
            fontWeight: 900,
            color: titleColor,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            margin: '0 0 16px 0',
          }}
        >
          {s.featuresTitle}
        </h2>
      )}
      <div
        className="hathor-features-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: gridColsCss,
          gap: 16,
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {items.map((item: any, idx: number) => (
          <div
            key={idx}
            style={{
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              borderRadius: cardRadius,
              padding: isMobile ? 14 : 18,
              boxSizing: 'border-box',
            }}
          >
            <div style={{ fontSize: isMobile ? 22 : 26, marginBottom: 8 }}>
              {item.icon || '⚔️'}
            </div>
            <h4
              style={{
                fontFamily: titleFont,
                fontSize: isMobile ? 13 : 14,
                color: itemTitleColor,
                margin: '0 0 6px 0',
              }}
            >
              {item.title}
            </h4>
            <p
              style={{
                fontFamily: textFont,
                fontSize: 12,
                color: itemDescColor,
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

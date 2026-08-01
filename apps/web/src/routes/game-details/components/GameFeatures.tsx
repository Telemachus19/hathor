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

export const GameFeatures: React.FC<GameFeaturesProps> = ({ s = {}, device = 'desktop', pageSettings }) => {
  const items = s.featuresItems || [
    { icon: '⚔️', title: 'SOULSLIKE COMBAT', desc: 'Master stamina and dodges.', color: HATHOR_ORANGE },
    { icon: '🗺️', title: 'VAST WORLD', desc: 'Explore dungeons and zones.', color: HATHOR_ORANGE },
    { icon: '🔥', title: 'EPIC BOSSES', desc: 'Skirmishes with guardians.', color: HATHOR_ORANGE }
  ];
  const cols = device === 'mobile' ? 1 : device === 'tablet' ? 2 : (s.featuresCols || 3);
  const titleFont = s.font || s.titleFont || pageSettings?.titleFont || "'Cinzel', serif";
  const textFont = s.textFont || pageSettings?.textFont || "'Raleway', sans-serif";

  return (
    <div style={{ marginBottom: 24, width: '100%', boxSizing: 'border-box' }}>
      {s.featuresTitle && (
        <h2 style={{ fontFamily: titleFont, fontSize: 16, fontWeight: 900, color: HATHOR_ORANGE, letterSpacing: '0.1em', margin: '0 0 16px 0' }}>
          {s.featuresTitle}
        </h2>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 16 }}>
        {items.map((item: any, idx: number) => (
          <div key={idx} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 4, padding: 16 }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{item.icon || '⚔️'}</div>
            <h4 style={{ fontFamily: titleFont, fontSize: 14, color: TEXT_PRIMARY, margin: '0 0 6px 0' }}>{item.title}</h4>
            <p style={{ fontFamily: textFont, fontSize: 12, color: TEXT_MUTED, margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

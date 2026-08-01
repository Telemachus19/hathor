import React from 'react';

export interface GameTwoColProps {
  s?: any;
  device?: 'desktop' | 'tablet' | 'mobile';
  pageSettings?: any;
}

const TEXT_MUTED = '#94a3b8';

export const GameTwoCol: React.FC<GameTwoColProps> = ({ s = {}, device = 'desktop', pageSettings }) => {
  const isMobile = device === 'mobile';
  const textFont = s.twoColLeftFont || pageSettings?.textFont || "'Raleway', sans-serif";

  return (
    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: s.twoColGap || 24, marginBottom: 24, width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <p style={{ fontFamily: textFont, fontSize: s.twoColLeftSize || 14, color: s.twoColLeftColor || TEXT_MUTED, lineHeight: 1.65, margin: 0 }}>
          {s.twoColLeftText || 'Discover ancient lore buried beneath the ashes.'}
        </p>
      </div>
      <div>
        <img src={s.twoColRightImg || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop'} alt="" style={{ width: '100%', borderRadius: 4 }} />
      </div>
    </div>
  );
};

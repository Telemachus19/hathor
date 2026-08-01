import React from 'react';
import { Check, Download, Library } from 'lucide-react';

export interface GameOwnershipBannerProps {
  s?: any;
  device?: 'desktop' | 'tablet' | 'mobile';
}

const GREEN_ACCENT = '#38d39f';
const TEXT_MUTED = '#94a3b8';
const SURFACE = '#181c24';

export const GameOwnershipBanner: React.FC<GameOwnershipBannerProps> = ({ s = {}, device = 'desktop' }) => {
  const isMobile = device === 'mobile';
  const bg = s.ownershipBg || SURFACE;
  const border = s.ownershipBorder || 'rgba(56, 211, 159, 0.4)';
  const titleFont = s.ownershipTitleFont || "'Cinzel', serif";
  const titleColor = s.ownershipTitleColor || GREEN_ACCENT;
  const subColor = s.ownershipSubColor || TEXT_MUTED;
  const btn1Bg = s.ownershipBtn1Bg || GREEN_ACCENT;
  const btn1Color = s.ownershipBtn1Color || '#0e1116';
  const btn2Bg = s.ownershipBtn2Bg || 'transparent';
  const btn2Color = s.ownershipBtn2Color || GREEN_ACCENT;
  const btn2Border = s.ownershipBtn2Border || GREEN_ACCENT;

  const statusText = s.ownershipStatus || 'YOU OWN THIS GAME';
  const subText = s.ownershipSub || 'Purchased Jun 10, 2025 · Available in your library';
  const btn1Text = s.ownershipBtn1 || 'DOWNLOAD';
  const btn2Text = s.ownershipBtn2 || 'GO TO LIBRARY';

  return (
    <div style={{
      background: bg, border: `1px solid ${border}`, borderRadius: 4,
      padding: isMobile ? '12px 14px' : '14px 20px', display: 'flex', flexDirection: isMobile ? 'column' : 'row',
      alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', gap: isMobile ? 12 : 16,
      marginBottom: isMobile ? 20 : 28, width: '100%', boxSizing: 'border-box'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 36, height: 36, borderRadius: 3, border: `1px solid ${border}`, background: 'rgba(56, 211, 159, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: GREEN_ACCENT, flexShrink: 0 }}>
          <Check size={18} />
        </div>
        <div>
          <div style={{ fontFamily: titleFont, fontSize: isMobile ? 13 : 14, fontWeight: 900, color: titleColor, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {statusText}
          </div>
          <div style={{ fontSize: isMobile ? 10 : 11, color: subColor, marginTop: 2, fontFamily: "'Raleway', sans-serif" }}>
            {subText}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, width: isMobile ? '100%' : 'auto' }}>
        <button style={{ flex: isMobile ? 1 : undefined, background: btn2Bg, border: `1px solid ${btn2Border}`, color: btn2Color, padding: '10px 18px', borderRadius: 3, fontWeight: 800, fontSize: 11, letterSpacing: '0.08em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, textTransform: 'uppercase' }}>
          <Library size={13} /> {btn2Text}
        </button>
        <button style={{ flex: isMobile ? 1 : undefined, background: btn1Bg, color: btn1Color, border: 'none', padding: '10px 18px', borderRadius: 3, fontWeight: 900, fontSize: 11, letterSpacing: '0.08em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, textTransform: 'uppercase' }}>
          <Download size={13} /> {btn1Text}
        </button>
      </div>
    </div>
  );
};

export default GameOwnershipBanner;

import React from 'react';

const GREEN_ACCENT = '#38d39f';
const BORDER = '#2e3544';
const TEXT_MUTED = '#94a3b8';

export const HeadingRenderer: React.FC<{ s?: any; device?: string; pageSettings?: any }> = ({ s = {}, device, pageSettings }) => {
  return (
    <h3 style={{
      fontFamily: s.font || s.titleFont || pageSettings?.titleFont || "'Cinzel', serif",
      fontSize: device === 'mobile' ? Math.min(s.size || 24, 20) : (s.size || 24),
      fontWeight: s.weight || '700',
      color: s.color || '#ffffff',
      textAlign: s.align || 'left',
      letterSpacing: s.letterSpacing || '0.04em',
      textTransform: s.textTransform || 'uppercase',
      lineHeight: s.lineHeight || 1.2,
      margin: '0 0 12px 0',
      wordBreak: 'break-word'
    }}>
      {s.text || 'Heading'}
    </h3>
  );
};

export const TextRenderer: React.FC<{ s?: any; device?: string; pageSettings?: any }> = ({ s = {}, device, pageSettings }) => {
  return (
    <div style={{ maxWidth: s.textMaxWidth || 700, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      <p style={{
        fontFamily: s.textFont || s.font || pageSettings?.textFont || "'Raleway', sans-serif",
        fontSize: device === 'mobile' ? Math.min(s.textSize || 14, 14) : (s.textSize || 14),
        fontWeight: s.textWeight || s.weight || '400',
        color: s.textColor || s.color || TEXT_MUTED,
        textAlign: s.textAlign || s.align || 'left',
        lineHeight: s.textLineHeight || s.lineHeight || 1.65,
        whiteSpace: 'pre-wrap',
        margin: '0 0 12px 0',
        wordBreak: 'break-word'
      }}>
        {s.textContent || s.text || 'Your text content...'}
      </p>
    </div>
  );
};

export const ImageRenderer: React.FC<{ s?: any }> = ({ s = {} }) => {
  return (
    <div style={{ textAlign: 'center', width: '100%', boxSizing: 'border-box', marginBottom: 16 }}>
      <img src={s.imageSrc || s.src || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop'} alt={s.imageAlt || ''}
        style={{ maxWidth: `${s.imageMaxWidth ?? 100}%`, width: '100%', display: 'inline-block', borderRadius: s.imageRadius || 4, boxShadow: s.imageShadow ? '0 24px 60px rgba(0,0,0,0.55)' : 'none' }} />
    </div>
  );
};

export const ButtonRenderer: React.FC<{ s?: any; pageSettings?: any }> = ({ s = {} }) => {
  return (
    <button style={{
      background: s.btnBg || GREEN_ACCENT,
      color: s.btnColor || '#0e1116',
      padding: `${s.btnPaddingV || 12}px ${s.btnPaddingH || 16}px`,
      borderRadius: s.btnRadius || 3,
      border: 'none',
      fontWeight: 800,
      cursor: 'pointer',
      width: s.fullWidth ? '100%' : 'auto',
      display: 'inline-block',
      marginBottom: 12,
      letterSpacing: s.letterSpacing || '0.12em',
      textTransform: 'uppercase'
    }}>
      {s.btnText || 'BUTTON'}
    </button>
  );
};

export const DividerRenderer: React.FC<{ s?: any }> = ({ s = {} }) => {
  return <hr style={{ borderColor: s.dividerColor || BORDER, borderWidth: s.dividerThickness || 1, margin: '16px 0', width: '100%' }} />;
};

export const SpacerRenderer: React.FC<{ s?: any }> = ({ s = {} }) => {
  return <div style={{ height: s.spacerHeight || 30, width: '100%' }} />;
};

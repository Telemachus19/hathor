import React from 'react';

export interface GameAboutProps {
  s?: any;
  sections?: Array<{ title: string; text?: string; description?: string; img?: string }>;
  device?: 'desktop' | 'tablet' | 'mobile';
  pageSettings?: any;
}

const HATHOR_ORANGE = '#f26b21';
const TEXT_MUTED = '#7a8b9e';

export const GameAbout: React.FC<GameAboutProps> = (props) => {
  const s = props.s || {};
  const device = props.device || 'desktop';

  const title = s.title || s.aboutTitle || 'ABOUT THIS GAME';
  const secs = s.sections ||
    s.aboutSections ||
    props.sections || [
      {
        title: 'GAMEPLAY & FEATURES',
        text: "Describe your game's unique features, mechanics, and world.",
      },
    ];

  const titleFont = s.font || s.titleFont || props.pageSettings?.titleFont || "'Cinzel', serif";
  const textFont = s.textFont || props.pageSettings?.textFont || "'Raleway', sans-serif";

  const mainTitleColor = s.titleColor || '#f4b183';
  const subTitleColor = s.subTitleColor || s.accentColor || HATHOR_ORANGE;
  const bodyTextColor = s.textColor || TEXT_MUTED;

  const bg = s.aboutBg || s.bg || 'transparent';
  const borderColor = s.aboutBorder || s.borderColor || 'transparent';
  const borderRadius = s.aboutRadius ?? s.radius ?? 0;
  const isCard =
    (bg !== 'transparent' && bg !== 'none' && bg !== '') ||
    (borderColor !== 'transparent' && borderColor !== 'none' && borderColor !== '');
  const defaultPad = isCard ? (device === 'mobile' ? 16 : 24) : 0;
  const pt = s.pt ?? s.padTop ?? defaultPad;
  const pb = s.pb ?? s.padBottom ?? defaultPad;
  const pl = s.pl ?? s.ph ?? defaultPad;
  const pr = s.pr ?? s.ph ?? defaultPad;
  const borderStyle =
    borderColor && borderColor !== 'transparent' && borderColor !== 'none'
      ? `1px solid ${borderColor}`
      : 'none';

  return (
    <div
      style={{
        width: '100%',
        boxSizing: 'border-box',
        background: bg,
        border: borderStyle,
        borderRadius: borderRadius,
        paddingTop: pt,
        paddingBottom: pb,
        paddingLeft: pl,
        paddingRight: pr,
      }}
    >
      <div
        style={{
          borderBottom:
            borderColor && borderColor !== 'transparent' && borderColor !== 'none'
              ? `1px solid ${borderColor}`
              : '1px solid rgba(255,255,255,0.1)',
          paddingBottom: 12,
          marginBottom: 24,
        }}
      >
        <h2
          style={{
            fontFamily: titleFont,
            fontSize: device === 'mobile' ? 16 : 18,
            fontWeight: 900,
            color: mainTitleColor,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            margin: 0,
          }}
        >
          {title}
        </h2>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {secs.map((sec: any, idx: number) => (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {sec.title && (
              <h3
                style={{
                  fontFamily: titleFont,
                  fontSize: device === 'mobile' ? 13.5 : 15,
                  fontWeight: 800,
                  color: subTitleColor,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  margin: '0 0 4px 0',
                }}
              >
                {sec.title}
              </h3>
            )}
            <p
              style={{
                fontFamily: textFont,
                fontSize: device === 'mobile' ? 13 : 13.5,
                color: bodyTextColor,
                lineHeight: 1.65,
                margin: 0,
                wordBreak: 'break-word',
              }}
            >
              {sec.text || sec.description}
            </p>
            {sec.img && (
              <img src={sec.img} alt="" style={{ width: '100%', borderRadius: 4, marginTop: 10 }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameAbout;

import React from 'react';

export interface GameAboutProps {
  s?: any;
  sections?: Array<{ title: string; text?: string; description?: string; img?: string }>;
  device?: 'desktop' | 'tablet' | 'mobile';
  pageSettings?: any;
}

const HATHOR_ORANGE = '#f26b21';
const BORDER = '#2e3544';
const TEXT_MUTED = '#7a8b9e';

export const GameAbout: React.FC<GameAboutProps> = (props) => {
  const s = props.s || {};
  const device = props.device || 'desktop';

  const title = s.title || s.aboutTitle || 'ABOUT THIS GAME';
  const secs = s.sections || s.aboutSections || props.sections || [
    { title: 'A KINGDOM IN RUIN', text: 'Journey across shattered realms buried in ash...' }
  ];

  const titleFont = s.font || s.titleFont || props.pageSettings?.titleFont || "'Cinzel', serif";
  const textFont = s.textFont || props.pageSettings?.textFont || "'Raleway', sans-serif";

  const mainTitleColor = s.titleColor || '#f4b183';
  const subTitleColor = s.subTitleColor || s.accentColor || HATHOR_ORANGE;
  const bodyTextColor = s.textColor || TEXT_MUTED;

  return (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>
      <div style={{ borderBottom: `1px solid ${BORDER}`, paddingBottom: 12, marginBottom: 24 }}>
        <h2 style={{ fontFamily: titleFont, fontSize: device === 'mobile' ? 16 : 18, fontWeight: 900, color: mainTitleColor, letterSpacing: '0.14em', textTransform: 'uppercase', margin: 0 }}>
          {title}
        </h2>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {secs.map((sec: any, idx: number) => (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {sec.title && (
              <h3 style={{ fontFamily: titleFont, fontSize: device === 'mobile' ? 13.5 : 15, fontWeight: 800, color: subTitleColor, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 4px 0' }}>
                {sec.title}
              </h3>
            )}
            <p style={{ fontFamily: textFont, fontSize: device === 'mobile' ? 13 : 13.5, color: bodyTextColor, lineHeight: 1.65, margin: 0, wordBreak: 'break-word' }}>
              {sec.text || sec.description}
            </p>
            {sec.img && <img src={sec.img} alt="" style={{ width: '100%', borderRadius: 4, marginTop: 10 }} />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameAbout;

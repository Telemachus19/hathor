import React from 'react';

export interface GameAboutProps {
  s?: any;
  sections?: Array<{ title: string; text?: string; description?: string; img?: string }>;
  device?: 'desktop' | 'tablet' | 'mobile';
  pageSettings?: any;
}

const HATHOR_ORANGE = '#f26b21';
const TEXT_PRIMARY = '#ffffff';
const TEXT_MUTED = '#94a3b8';

export const GameAbout: React.FC<GameAboutProps> = (props) => {
  const s = props.s || {};
  const device = props.device || 'desktop';

  const title = s.title || s.aboutTitle || 'ABOUT THIS GAME';
  const secs = s.sections || s.aboutSections || props.sections || [
    { title: 'A KINGDOM IN RUIN', text: 'Journey across shattered realms buried in ash...' }
  ];

  const titleFont = s.font || s.titleFont || props.pageSettings?.titleFont || "'Cinzel', serif";
  const textFont = s.textFont || props.pageSettings?.textFont || "'Raleway', sans-serif";

  return (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>
      <h2 style={{ fontFamily: titleFont, fontSize: device === 'mobile' ? 16 : 18, fontWeight: 900, color: HATHOR_ORANGE, letterSpacing: '0.1em', margin: '0 0 20px 0', borderLeft: `3px solid ${HATHOR_ORANGE}`, paddingLeft: 10 }}>
        {title}
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {secs.map((sec: any, idx: number) => (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sec.title && <h3 style={{ fontFamily: titleFont, fontSize: device === 'mobile' ? 14 : 16, fontWeight: 800, color: TEXT_PRIMARY, margin: 0 }}>{sec.title}</h3>}
            <p style={{ fontFamily: textFont, fontSize: device === 'mobile' ? 13 : 14, color: TEXT_MUTED, lineHeight: 1.65, margin: 0 }}>{sec.text || sec.description}</p>
            {sec.img && <img src={sec.img} alt="" style={{ width: '100%', borderRadius: 4, marginTop: 8 }} />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameAbout;

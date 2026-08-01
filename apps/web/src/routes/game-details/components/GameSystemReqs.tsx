import React, { useState } from 'react';
import { Monitor, Cpu, Zap, Shield, HardDrive } from 'lucide-react';

export interface GameSystemReqsProps {
  s?: any;
  minimum?: { os: string; cpu: string; ram: string; gpu: string; storage: string };
  recommended?: { os: string; cpu: string; ram: string; gpu: string; storage: string };
  device?: 'desktop' | 'tablet' | 'mobile';
  pageSettings?: any;
}

const HATHOR_ORANGE = '#f26b21';
const SURFACE = '#181c24';
const BORDER = '#2e3544';
const TEXT_MUTED = '#7a8b9e';
const TEXT_PRIMARY = '#ffffff';

export const GameSystemReqs: React.FC<GameSystemReqsProps> = (props) => {
  const s = props.s || {};
  const device = props.device || 'desktop';
  const isMobile = device === 'mobile';
  const [activeTab, setActiveTab] = useState<'recommended' | 'minimum'>('recommended');

  const min = s.min || s.reqsMin || props.minimum || {
    os: 'Windows 10 (64-bit)',
    cpu: 'Intel Core i5 / AMD Ryzen 5',
    ram: '8 GB RAM',
    gpu: 'NVIDIA GTX 1060 / AMD RX 580',
    storage: '50 GB Available Space'
  };

  const rec = s.rec || s.reqsRec || props.recommended || {
    os: 'Windows 11 (64-bit)',
    cpu: 'Intel Core i7 / AMD Ryzen 7',
    ram: '16 GB RAM',
    gpu: 'NVIDIA RTX 3070 / AMD RX 6700 XT',
    storage: '50 GB NVMe SSD'
  };

  const currentSpecs = activeTab === 'recommended' ? rec : min;
  const titleFont = s.font || s.titleFont || props.pageSettings?.titleFont || "'Cinzel', serif";
  const textFont = s.textFont || props.pageSettings?.textFont || "'Raleway', sans-serif";

  // Customizable Colors & Styles
  const headerTitleColor = s.titleColor || s.headerTitleColor || '#f4b183';
  const accentColor = s.accentColor || s.reqsAccentColor || HATHOR_ORANGE;
  const cardBg = s.reqsCardBg || s.cardBg || s.bg || SURFACE;
  const cardBorder = s.reqsCardBorder || s.cardBorder || s.borderColor || BORDER;
  const cardRadius = s.reqsRadius ?? s.cardRadius ?? 4;
  const labelColor = s.labelColor || TEXT_MUTED;
  const valueColor = s.valueColor || s.textColor || TEXT_PRIMARY;

  const specCards = [
    { label: 'OS', value: currentSpecs.os, Icon: Monitor },
    { label: 'CPU', value: currentSpecs.cpu, Icon: Cpu },
    { label: 'RAM', value: currentSpecs.ram, Icon: Zap },
    { label: 'GPU', value: currentSpecs.gpu, Icon: Shield },
    { label: 'STORAGE', value: currentSpecs.storage, Icon: HardDrive },
  ];

  return (
    <div
      style={{
        width: '100%',
        boxSizing: 'border-box',
        background: s.reqsBg || 'transparent',
        paddingTop: s.pt ?? 0,
        paddingBottom: s.pb ?? 0,
        paddingLeft: s.pl ?? s.ph ?? 0,
        paddingRight: s.pr ?? s.ph ?? 0,
      }}
    >
      {/* Title with subtle bottom border */}
      <div style={{ borderBottom: `1px solid ${s.headerBorder || cardBorder || BORDER}`, paddingBottom: 12, marginBottom: 20 }}>
        <h2 style={{
          fontFamily: titleFont, fontSize: isMobile ? 16 : 18, fontWeight: 900,
          color: headerTitleColor, letterSpacing: '0.14em', textTransform: 'uppercase', margin: 0
        }}>
          {s.reqsTitle || 'SYSTEM REQUIREMENTS'}
        </h2>
      </div>

      {/* Tabs Switcher */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <button
          onClick={() => setActiveTab('recommended')}
          style={{
            background: activeTab === 'recommended' ? `${accentColor}22` : cardBg,
            border: `1px solid ${activeTab === 'recommended' ? accentColor : cardBorder}`,
            color: activeTab === 'recommended' ? accentColor : labelColor,
            padding: '8px 20px', borderRadius: 3, fontWeight: 900, fontSize: 11,
            letterSpacing: '0.12em', cursor: 'pointer', fontFamily: 'monospace', textTransform: 'uppercase'
          }}
        >
          RECOMMENDED
        </button>
        <button
          onClick={() => setActiveTab('minimum')}
          style={{
            background: activeTab === 'minimum' ? `${accentColor}22` : cardBg,
            border: `1px solid ${activeTab === 'minimum' ? accentColor : cardBorder}`,
            color: activeTab === 'minimum' ? accentColor : labelColor,
            padding: '8px 20px', borderRadius: 3, fontWeight: 900, fontSize: 11,
            letterSpacing: '0.12em', cursor: 'pointer', fontFamily: 'monospace', textTransform: 'uppercase'
          }}
        >
          MINIMUM
        </button>
      </div>

      {/* Responsive Specs Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, width: '100%', boxSizing: 'border-box' }}>
        {specCards.map((card, idx) => {
          const { label, value, Icon } = card;
          return (
            <div
              key={idx}
              style={{
                background: cardBg,
                border: `1px solid ${cardBorder}`,
                borderRadius: cardRadius,
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                width: '100%',
                maxWidth: '100%',
                minWidth: 0,
                boxSizing: 'border-box',
              }}
            >
              <div style={{ color: accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} />
              </div>
              <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: 9, fontFamily: 'monospace', color: labelColor, letterSpacing: '0.1em', fontWeight: 700, marginBottom: 2 }}>
                  {label}
                </div>
                <div style={{ fontSize: 13, fontFamily: textFont, fontWeight: 800, color: valueColor, whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'anywhere', lineHeight: 1.35 }}>
                  {value}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GameSystemReqs;

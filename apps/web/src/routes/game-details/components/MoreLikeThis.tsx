import React from 'react';

export interface MoreLikeThisProps {
  s?: any;
  games?: Array<any>;
  device?: 'desktop' | 'tablet' | 'mobile';
  pageSettings?: any;
}

const HATHOR_ORANGE = '#f26b21';
const GREEN_ACCENT = '#38d39f';
const SURFACE = '#181c24';
const BORDER = '#2e3544';
const TEXT_PRIMARY = '#ffffff';

export const MoreLikeThis: React.FC<MoreLikeThisProps> = (props) => {
  const s = props.s || {};
  const device = props.device || 'desktop';
  const isMobile = device === 'mobile';

  const title = s.title || s.recsTitle || 'MORE LIKE THIS';
  const items = s.items || props.games || [
    { title: 'SHATTERED REALM', priceEgp: '349.00', bannerUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=600&auto=format&fit=crop', discountPercent: 20 },
    { title: 'CRIMSON ACCORD', priceEgp: '524.99', bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop' },
    { title: 'ASHEN TALE', priceEgp: '529.99', bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop' },
    { title: 'MOON REQUIEM', priceEgp: '169.99', bannerUrl: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?q=80&w=600&auto=format&fit=crop', discountPercent: 50 },
  ];

  const titleFont = s.font || s.titleFont || props.pageSettings?.titleFont || "'Cinzel', serif";

  return (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>
      <h2 style={{ fontFamily: titleFont, fontSize: isMobile ? 14 : 16, fontWeight: 900, color: HATHOR_ORANGE, letterSpacing: '0.15em', margin: '0 0 16px 0', textTransform: 'uppercase' }}>
        {title}
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 16 }}>
        {items.map((item: any, idx: number) => {
          const itemTitle = item.title;
          const itemPrice = item.price ? item.price : `EGP ${item.priceEgp || '299.99'}`;
          const itemImg = item.image || item.bannerUrl;
          const discount = item.discountPercent || item.discount;

          return (
            <div key={idx} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
              <div style={{ position: 'relative', width: '100%', height: isMobile ? 90 : 120 }}>
                <img src={itemImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {discount > 0 && (
                  <div style={{ position: 'absolute', top: 6, left: 6, background: HATHOR_ORANGE, color: '#ffffff', fontSize: 10, fontWeight: 900, padding: '2px 6px', borderRadius: 2, fontFamily: 'monospace' }}>
                    -{discount}%
                  </div>
                )}
              </div>
              <div style={{ padding: 12 }}>
                <h4 style={{ fontFamily: titleFont, fontSize: isMobile ? 12 : 13, color: TEXT_PRIMARY, margin: '0 0 6px 0' }}>{itemTitle}</h4>
                <div style={{ fontSize: 11, fontWeight: 800, color: GREEN_ACCENT, fontFamily: 'monospace' }}>{itemPrice}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MoreLikeThis;

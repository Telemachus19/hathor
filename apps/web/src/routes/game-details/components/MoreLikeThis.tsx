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

  const title = s.recsTitle || s.title || 'MORE LIKE THIS';
  const items = s.items || s.recsItems || props.games || [
    { title: 'SIMILAR GAME 1', priceEgp: '0.00', bannerUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=600&auto=format&fit=crop', discountPercent: 0 },
    { title: 'SIMILAR GAME 2', priceEgp: '0.00', bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop' },
    { title: 'SIMILAR GAME 3', priceEgp: '0.00', bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop' },
    { title: 'SIMILAR GAME 4', priceEgp: '0.00', bannerUrl: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?q=80&w=600&auto=format&fit=crop', discountPercent: 0 },
  ];

  // Section styling
  const titleFont = s.recsTitleFont || s.titleFont || s.font || props.pageSettings?.titleFont || "'Cinzel', serif";
  const titleColor = s.recsTitleColor || s.titleColor || s.accentColor || HATHOR_ORANGE;
  const recsBg = s.recsBg || s.bg || 'transparent';

  // Card styling
  const cardBg = s.recsCardBg || s.cardBg || SURFACE;
  const cardBorder = s.recsCardBorder || s.cardBorder || BORDER;
  const cardRadius = s.recsCardRadius ?? s.cardRadius ?? 4;
  const cardTitleFont = s.recsCardTitleFont || s.itemTitleFont || titleFont;
  const cardTitleColor = s.recsCardTitleColor || s.itemTitleColor || s.textColor || TEXT_PRIMARY;
  const priceFont = s.recsPriceFont || props.pageSettings?.textFont || 'monospace';
  const priceColor = s.recsPriceColor || s.priceColor || GREEN_ACCENT;
  const discountBg = s.recsDiscountBg || s.discountBg || HATHOR_ORANGE;
  const discountTextColor = s.recsDiscountTextColor || s.discountTextColor || '#ffffff';

  const pt = s.pt ?? 0;
  const pb = s.pb ?? 0;
  const pl = s.pl ?? s.ph ?? 0;
  const pr = s.pr ?? s.ph ?? 0;

  return (
    <div style={{ width: '100%', boxSizing: 'border-box', background: recsBg, paddingTop: pt, paddingBottom: pb, paddingLeft: pl, paddingRight: pr }}>
      {title && (
        <h2 style={{ fontFamily: titleFont, fontSize: isMobile ? 14 : 16, fontWeight: 900, color: titleColor, letterSpacing: '0.15em', margin: '0 0 16px 0', textTransform: 'uppercase' }}>
          {title}
        </h2>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 16 }}>
        {items.map((item: any, idx: number) => {
          const itemTitle = item.title;
          const itemPrice = item.price ? item.price : `EGP ${item.priceEgp || '0.00'}`;
          const itemImg = item.image || item.bannerUrl;
          const discount = item.discountPercent || item.discount;

          return (
            <div key={idx} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: cardRadius, overflow: 'hidden', position: 'relative' }}>
              <div style={{ position: 'relative', width: '100%', height: isMobile ? 90 : 120 }}>
                <img src={itemImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {discount > 0 && (
                  <div style={{ position: 'absolute', top: 6, left: 6, background: discountBg, color: discountTextColor, fontSize: 10, fontWeight: 900, padding: '2px 6px', borderRadius: 2, fontFamily: 'monospace' }}>
                    -{discount}%
                  </div>
                )}
              </div>
              <div style={{ padding: 12 }}>
                <h4 style={{ fontFamily: cardTitleFont, fontSize: isMobile ? 12 : 13, color: cardTitleColor, margin: '0 0 6px 0' }}>{itemTitle}</h4>
                <div style={{ fontSize: 11, fontWeight: 800, color: priceColor, fontFamily: priceFont }}>{itemPrice}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MoreLikeThis;

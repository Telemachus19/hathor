import { useState } from 'react';
import { Plus } from 'lucide-react';
import {
  SectionType,
  ElementType,
  HATHOR_ORANGE,
  BORDER,
  TEXT_MUTED,
  TEXT_PRIMARY,
} from '../../types/designerTypes';
import styles from '../../DesignerPage.module.css';

export function PaletteGridCard({
  item,
  onAdd,
  onAddGridWithCols,
}: {
  item: any;
  onAdd: (type: SectionType | ElementType) => void;
  onAddGridWithCols: (template: string) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ position: 'relative' }}
    >
      <button
        onClick={() => onAdd(item.type)}
        className={styles.paletteCard}
        style={{ width: '100%' }}
      >
        <div className={styles.paletteIconWrap}>
          <item.Icon size={14} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p className={styles.paletteCardLabel}>{item.label}</p>
          <p className={styles.paletteCardDesc}>{item.desc}</p>
        </div>
        <Plus size={12} style={{ color: TEXT_MUTED, opacity: 0.5, flexShrink: 0 }} />
      </button>

      {/* Hover Quick Column Count Selector Overlay */}
      {isHovered && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: '#161a22',
            border: `1px solid ${HATHOR_ORANGE}`,
            borderRadius: 6,
            padding: '5px 8px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 4,
            zIndex: 10,
            boxShadow: '0 6px 20px rgba(0,0,0,0.6)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span
              style={{
                fontSize: 9,
                fontWeight: 800,
                color: HATHOR_ORANGE,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Select Column Count
            </span>
            <span style={{ fontSize: 8, color: TEXT_MUTED }}>Click to insert</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
            {[
              { label: '2 Cols', template: '1:1', bars: [1, 1] },
              { label: '3 Cols', template: '1:1:1', bars: [1, 1, 1] },
              { label: '4 Cols', template: '1:1:1:1', bars: [1, 1, 1, 1] },
            ].map((colOpt) => (
              <button
                key={colOpt.template}
                onClick={(e) => {
                  e.stopPropagation();
                  onAddGridWithCols(colOpt.template);
                }}
                style={{
                  background: '#202532',
                  border: `1px solid ${BORDER}`,
                  borderRadius: 4,
                  padding: '4px 2px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3,
                  transition: 'all 0.15s ease',
                  color: TEXT_PRIMARY,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = HATHOR_ORANGE;
                  e.currentTarget.style.background = 'rgba(242, 107, 33, 0.18)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = BORDER;
                  e.currentTarget.style.background = '#202532';
                }}
                title={`Insert ${colOpt.label}`}
              >
                <div
                  style={{
                    display: 'flex',
                    width: '80%',
                    height: 8,
                    gap: 2,
                    background: '#101319',
                    padding: 1,
                    borderRadius: 2,
                    boxSizing: 'border-box',
                  }}
                >
                  {colOpt.bars.map((_, bIdx) => (
                    <div
                      key={bIdx}
                      style={{ flex: 1, background: HATHOR_ORANGE, borderRadius: 1 }}
                    />
                  ))}
                </div>
                <span style={{ fontSize: 9, fontWeight: 700, fontFamily: 'monospace' }}>
                  {colOpt.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

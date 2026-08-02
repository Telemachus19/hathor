import { HATHOR_ORANGE, TEXT_MUTED } from '../../types/designerTypes';

export function AlignmentGridPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const current = value || 'center center';

  const gridOptions = [
    { label: 'Top Left', value: 'top left', alignY: 'flex-start', alignX: 'flex-start' },
    { label: 'Top Center', value: 'top center', alignY: 'flex-start', alignX: 'center' },
    { label: 'Top Right', value: 'top right', alignY: 'flex-start', alignX: 'flex-end' },
    { label: 'Left Center', value: 'left center', alignY: 'center', alignX: 'flex-start' },
    { label: 'Center Center', value: 'center center', alignY: 'center', alignX: 'center' },
    { label: 'Right Center', value: 'right center', alignY: 'center', alignX: 'flex-end' },
    { label: 'Bottom Left', value: 'bottom left', alignY: 'flex-end', alignX: 'flex-start' },
    { label: 'Bottom Center', value: 'bottom center', alignY: 'flex-end', alignX: 'center' },
    { label: 'Bottom Right', value: 'bottom right', alignY: 'flex-end', alignX: 'flex-end' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 6,
          background: '#141820',
          padding: 8,
          borderRadius: 6,
          border: '1px solid #2e3544',
        }}
      >
        {gridOptions.map((opt) => {
          const isSelected = current.toLowerCase() === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              title={opt.label}
              style={{
                height: 36,
                borderRadius: 4,
                border: isSelected
                  ? `2px solid ${HATHOR_ORANGE}`
                  : '1px solid rgba(255,255,255,0.12)',
                background: isSelected ? 'rgba(242, 107, 33, 0.22)' : '#1c212c',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
                padding: 4,
                outline: 'none',
              }}
            >
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 2,
                  border: isSelected
                    ? `1px solid ${HATHOR_ORANGE}`
                    : '1px solid rgba(255,255,255,0.25)',
                  display: 'flex',
                  alignItems: opt.alignY as any,
                  justifyContent: opt.alignX as any,
                  padding: 2,
                  boxSizing: 'border-box',
                }}
              >
                <div
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: 1,
                    background: isSelected ? HATHOR_ORANGE : 'rgba(255,255,255,0.7)',
                  }}
                />
              </div>
            </button>
          );
        })}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 9,
          fontFamily: 'monospace',
          color: TEXT_MUTED,
        }}
      >
        <span>Active Alignment:</span>
        <span style={{ color: HATHOR_ORANGE, fontWeight: 700, textTransform: 'capitalize' }}>
          {current}
        </span>
      </div>
    </div>
  );
}

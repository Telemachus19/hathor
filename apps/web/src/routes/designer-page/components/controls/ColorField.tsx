import React, { useState, useEffect, useRef } from 'react';
import { X, Droplet } from 'lucide-react';
import {
  HATHOR_ORANGE,
  GOLD_ACCENT,
  GREEN_ACCENT,
  BG,
  SURFACE,
  TEXT_PRIMARY,
} from '../../types/designerTypes';
import { sanitizeHexInput, hsvToHex, hexToHsv } from '../../utils/colorUtils';
import styles from '../../DesignerPage.module.css';

export function ColorField({
  value,
  onChange,
  placeholder = '#000000 or transparent',
}: {
  value: string;
  onChange: (v: string, skipHistory?: boolean) => void;
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'solid' | 'gradient'>(
    value && value.includes('gradient') ? 'gradient' : 'solid'
  );
  const isTransparent = !value || value === 'transparent';

  const popoverRef = useRef<HTMLDivElement>(null);
  const rectRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  // Gradient state
  const [gradAngle, setGradAngle] = useState(135);
  const [gradColor1, setGradColor1] = useState(HATHOR_ORANGE);
  const [gradColor2, setGradColor2] = useState('#141820');

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const initialHsv = hexToHsv(value && value.startsWith('#') ? value : HATHOR_ORANGE);
  const [hue, setHue] = useState(initialHsv.h);
  const [sat, setSat] = useState(initialHsv.s);
  const [val, setVal] = useState(initialHsv.v);
  const [alpha, setAlpha] = useState(initialHsv.alpha);

  useEffect(() => {
    if (value && value.startsWith('#')) {
      const hsv = hexToHsv(value);
      setHue(hsv.h);
      setSat(hsv.s);
      setVal(hsv.v);
      setAlpha(hsv.alpha);
      setMode('solid');
    } else if (value && value.includes('gradient')) {
      setMode('gradient');
    }
  }, [value]);

  const pureHueHex = hsvToHex(hue, 100, 100);

  const handleRectPointer = (
    e: React.MouseEvent<HTMLDivElement> | MouseEvent,
    skipHistory = true
  ) => {
    if (!rectRef.current) return;
    const rect = rectRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

    const newSat = Math.round((x / rect.width) * 100);
    const newVal = Math.round((1 - y / rect.height) * 100);

    setSat(newSat);
    setVal(newVal);
    onChange(hsvToHex(hue, newSat, newVal, alpha), skipHistory);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    handleRectPointer(e, true);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (isDraggingRef.current) {
        handleRectPointer(moveEvent, true);
      }
    };
    const handleMouseUp = (upEvent: MouseEvent) => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        handleRectPointer(upEvent, false);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const updateCustomGradient = (angle: number, c1: string, c2: string, skipHistory = false) => {
    setGradAngle(angle);
    setGradColor1(c1);
    setGradColor2(c2);
    onChange(`linear-gradient(${angle}deg, ${c1} 0%, ${c2} 100%)`, skipHistory);
  };

  const PRESETS = [
    'transparent',
    HATHOR_ORANGE,
    GOLD_ACCENT,
    GREEN_ACCENT,
    '#2ecc71',
    '#3498db',
    '#9b59b6',
    '#e74c3c',
    BG,
    SURFACE,
    '#0a0d14',
    '#222831',
    '#e6edf3',
    '#ffffff',
  ];

  const GRADIENTS = [
    { label: 'Hathor Orange', val: `linear-gradient(135deg, ${HATHOR_ORANGE}, #f4b183)` },
    { label: 'Dark Obsidian', val: 'linear-gradient(135deg, #212631, #0a0d14)' },
    { label: 'Mint Cyber', val: 'linear-gradient(135deg, #38d39f, #2ecc71)' },
    { label: 'Golden Fire', val: `linear-gradient(135deg, #f4b183, ${HATHOR_ORANGE})` },
    { label: 'Deep Emerald', val: 'linear-gradient(180deg, #141820 0%, #2ecc71 100%)' },
    { label: 'Neon Violet', val: 'linear-gradient(135deg, #9b59b6, #3498db)' },
  ];

  return (
    <div className={styles.colorField} style={{ position: 'relative' }} ref={popoverRef}>
      <button
        type="button"
        title="Click to open Hathor color/gradient selector"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: 24,
          height: 24,
          borderRadius: 4,
          background: isTransparent
            ? 'repeating-conic-gradient(#2a303c 0% 25%, #161a22 0% 50%) 50% / 8px 8px'
            : value,
          border: isOpen ? `1px solid ${HATHOR_ORANGE}` : '1px solid rgba(255, 255, 255, 0.25)',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isOpen ? `0 0 10px ${HATHOR_ORANGE}` : '0 2px 6px rgba(0,0,0,0.4)',
          transition: 'all 0.15s ease',
          outline: 'none',
        }}
      />
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(sanitizeHexInput(e.target.value))}
        className={styles.colorInput}
        placeholder={placeholder}
      />

      {/* Popover Modal */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            zIndex: 99999,
            width: 260,
            background: '#1C2028',
            border: `1px solid rgba(242, 107, 33, 0.55)`,
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9)',
            borderRadius: 6,
            padding: 14,
            fontFamily: "'Inter', sans-serif",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
              borderBottom: '1px solid #393E46',
              paddingBottom: 6,
            }}
          >
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: 10,
                fontWeight: 800,
                color: HATHOR_ORANGE,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
              }}
            >
              COLOR SELECTOR
            </span>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#8C9AAA',
                cursor: 'pointer',
                display: 'flex',
                padding: 2,
              }}
            >
              <X size={14} />
            </button>
          </div>

          {/* Explicit Transparent Button */}
          <button
            type="button"
            onClick={() => {
              onChange('transparent', false);
              setIsOpen(false);
            }}
            style={{
              width: '100%',
              padding: '7px 10px',
              marginBottom: 10,
              borderRadius: 4,
              background:
                'repeating-conic-gradient(#2a303c 0% 25%, #161a22 0% 50%) 50% / 10px 10px',
              border: isTransparent
                ? `2px solid ${HATHOR_ORANGE}`
                : '1px solid rgba(255,255,255,0.2)',
              color: '#ffffff',
              fontSize: 10,
              fontFamily: 'monospace',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              outline: 'none',
            }}
          >
            <Droplet size={12} /> CLEAR / SET TO TRANSPARENT
          </button>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 4,
              background: '#141820',
              padding: 3,
              borderRadius: 4,
              marginBottom: 12,
            }}
          >
            <button
              type="button"
              onClick={() => setMode('solid')}
              style={{
                background: mode === 'solid' ? HATHOR_ORANGE : 'transparent',
                color: mode === 'solid' ? '#ffffff' : '#8C9AAA',
                border: 'none',
                borderRadius: 3,
                padding: '5px 0',
                fontSize: 10,
                fontFamily: 'monospace',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              SOLID COLOR
            </button>
            <button
              type="button"
              onClick={() => setMode('gradient')}
              style={{
                background: mode === 'gradient' ? HATHOR_ORANGE : 'transparent',
                color: mode === 'gradient' ? '#ffffff' : '#8C9AAA',
                border: 'none',
                borderRadius: 3,
                padding: '5px 0',
                fontSize: 10,
                fontFamily: 'monospace',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              GRADIENT
            </button>
          </div>

          {mode === 'solid' && (
            <>
              <div
                ref={rectRef}
                onMouseDown={handleMouseDown}
                style={{
                  position: 'relative',
                  width: '100%',
                  height: 130,
                  borderRadius: 4,
                  cursor: 'crosshair',
                  overflow: 'hidden',
                  marginBottom: 10,
                  background: `linear-gradient(to top, #000000, transparent), linear-gradient(to right, #ffffff, ${pureHueHex})`,
                  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: `${sat}%`,
                    top: `${100 - val}%`,
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    border: '2px solid #ffffff',
                    boxShadow: '0 0 4px rgba(0,0,0,0.8)',
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none',
                  }}
                />
              </div>

              {/* HUE SLIDER */}
              <div style={{ marginBottom: 10 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 9,
                    fontFamily: 'monospace',
                    color: '#8C9AAA',
                    marginBottom: 3,
                  }}
                >
                  <span>HUE RAINBOW</span>
                  <span style={{ color: HATHOR_ORANGE }}>{hue}°</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={360}
                  value={hue}
                  onChange={(e) => {
                    const newHue = Number(e.target.value);
                    setHue(newHue);
                    onChange(hsvToHex(newHue, sat, val, alpha), true);
                  }}
                  onMouseUp={() => onChange(hsvToHex(hue, sat, val, alpha), false)}
                  onTouchEnd={() => onChange(hsvToHex(hue, sat, val, alpha), false)}
                  style={{
                    width: '100%',
                    height: 8,
                    borderRadius: 4,
                    appearance: 'none',
                    outline: 'none',
                    cursor: 'pointer',
                    background:
                      'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
                  }}
                />
              </div>

              {/* OPACITY SLIDER */}
              <div style={{ marginBottom: 10 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 9,
                    fontFamily: 'monospace',
                    color: '#8C9AAA',
                    marginBottom: 3,
                  }}
                >
                  <span>OPACITY</span>
                  <span style={{ color: HATHOR_ORANGE }}>{alpha}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={alpha}
                  onChange={(e) => {
                    const newAlpha = Number(e.target.value);
                    setAlpha(newAlpha);
                    onChange(hsvToHex(hue, sat, val, newAlpha), true);
                  }}
                  onMouseUp={() => onChange(hsvToHex(hue, sat, val, alpha), false)}
                  onTouchEnd={() => onChange(hsvToHex(hue, sat, val, alpha), false)}
                  style={{
                    width: '100%',
                    height: 8,
                    borderRadius: 4,
                    appearance: 'none',
                    outline: 'none',
                    cursor: 'pointer',
                    background: `linear-gradient(to right, transparent, ${pureHueHex}), repeating-conic-gradient(#2a303c 0% 25%, #161a22 0% 50%) 50% / 6px 6px`,
                  }}
                />
              </div>

              <div>
                <div
                  style={{
                    fontSize: 9,
                    fontFamily: 'monospace',
                    color: '#8C9AAA',
                    marginBottom: 4,
                    textTransform: 'uppercase',
                  }}
                >
                  Theme Swatches
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 5 }}>
                  {PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        onChange(p, false);
                        if (p === 'transparent') setIsOpen(false);
                      }}
                      style={{
                        width: '100%',
                        aspectRatio: '1',
                        borderRadius: 3,
                        background:
                          p === 'transparent'
                            ? 'repeating-conic-gradient(#2a303c 0% 25%, #161a22 0% 50%) 50% / 6px 6px'
                            : p,
                        border:
                          value === p || (p === 'transparent' && isTransparent)
                            ? `2px solid ${HATHOR_ORANGE}`
                            : '1px solid rgba(255,255,255,0.15)',
                        cursor: 'pointer',
                        outline: 'none',
                        padding: 0,
                      }}
                      title={p === 'transparent' ? 'Transparent' : p}
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          {mode === 'gradient' && (
            <>
              <div
                style={{
                  height: 48,
                  borderRadius: 4,
                  background: value || `linear-gradient(135deg, ${HATHOR_ORANGE}, #f4b183)`,
                  border: '1px solid rgba(255,255,255,0.15)',
                  marginBottom: 12,
                  boxShadow: 'inset 0 0 8px rgba(0,0,0,0.5)',
                }}
              />

              <div style={{ marginBottom: 10 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 9,
                    fontFamily: 'monospace',
                    color: '#8C9AAA',
                    marginBottom: 4,
                  }}
                >
                  <span>GRADIENT ANGLE</span>
                  <span style={{ color: HATHOR_ORANGE }}>{gradAngle}°</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={360}
                  step={5}
                  value={gradAngle}
                  onChange={(e) =>
                    updateCustomGradient(Number(e.target.value), gradColor1, gradColor2, true)
                  }
                  onMouseUp={() => updateCustomGradient(gradAngle, gradColor1, gradColor2, false)}
                  onTouchEnd={() => updateCustomGradient(gradAngle, gradColor1, gradColor2, false)}
                  style={{
                    width: '100%',
                    height: 8,
                    borderRadius: 4,
                    appearance: 'none',
                    outline: 'none',
                    cursor: 'pointer',
                    background: `linear-gradient(to right, #393E46, ${HATHOR_ORANGE})`,
                  }}
                />
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 9,
                      fontFamily: 'monospace',
                      color: '#8C9AAA',
                      marginBottom: 3,
                    }}
                  >
                    START COLOR
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      background: '#141820',
                      border: '1px solid #393E46',
                      padding: 4,
                      borderRadius: 3,
                    }}
                  >
                    <input
                      type="color"
                      value={gradColor1.startsWith('#') ? gradColor1.slice(0, 7) : HATHOR_ORANGE}
                      onChange={(e) => updateCustomGradient(gradAngle, e.target.value, gradColor2)}
                      style={{
                        width: 18,
                        height: 18,
                        border: 'none',
                        padding: 0,
                        background: 'transparent',
                        cursor: 'pointer',
                      }}
                    />
                    <input
                      type="text"
                      value={gradColor1}
                      onChange={(e) =>
                        updateCustomGradient(
                          gradAngle,
                          sanitizeHexInput(e.target.value),
                          gradColor2
                        )
                      }
                      style={{
                        width: '100%',
                        background: 'transparent',
                        border: 'none',
                        color: TEXT_PRIMARY,
                        fontSize: 9,
                        fontFamily: 'monospace',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 9,
                      fontFamily: 'monospace',
                      color: '#8C9AAA',
                      marginBottom: 3,
                    }}
                  >
                    END COLOR
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      background: '#141820',
                      border: '1px solid #393E46',
                      padding: 4,
                      borderRadius: 3,
                    }}
                  >
                    <input
                      type="color"
                      value={gradColor2.startsWith('#') ? gradColor2.slice(0, 7) : '#141820'}
                      onChange={(e) => updateCustomGradient(gradAngle, gradColor1, e.target.value)}
                      style={{
                        width: 18,
                        height: 18,
                        border: 'none',
                        padding: 0,
                        background: 'transparent',
                        cursor: 'pointer',
                      }}
                    />
                    <input
                      type="text"
                      value={gradColor2}
                      onChange={(e) =>
                        updateCustomGradient(
                          gradAngle,
                          gradColor1,
                          sanitizeHexInput(e.target.value)
                        )
                      }
                      style={{
                        width: '100%',
                        background: 'transparent',
                        border: 'none',
                        color: TEXT_PRIMARY,
                        fontSize: 9,
                        fontFamily: 'monospace',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontSize: 9,
                    fontFamily: 'monospace',
                    color: '#8C9AAA',
                    marginBottom: 6,
                    textTransform: 'uppercase',
                  }}
                >
                  Gradient Presets
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {GRADIENTS.map((g, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onChange(g.val)}
                      style={{
                        background: g.val,
                        border:
                          value === g.val ? `1px solid ${HATHOR_ORANGE}` : '1px solid #393E46',
                        color: '#ffffff',
                        padding: '6px 8px',
                        borderRadius: 3,
                        fontSize: 9,
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        outline: 'none',
                      }}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div
            style={{
              marginTop: 10,
              paddingTop: 6,
              borderTop: '1px solid #393E46',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: 2,
                background: value || 'transparent',
                border: '1px solid rgba(255,255,255,0.2)',
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 10,
                fontFamily: 'monospace',
                color: HATHOR_ORANGE,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {value || '#000000'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

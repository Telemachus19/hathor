import React from 'react';

export function GlyphAccent({ char = '𓃭', style }: { char?: string; style?: React.CSSProperties }) {
  return (
    <span
      style={{
        color: 'rgba(242, 107, 33, 0.2)',
        userSelect: 'none',
        pointerEvents: 'none',
        ...style,
      }}
    >
      {char}
    </span>
  );
}

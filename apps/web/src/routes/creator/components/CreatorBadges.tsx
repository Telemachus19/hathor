export function GameStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    published: { label: 'Published', color: '#4caf80' },
    pending_review: { label: 'In Review', color: '#f59e0b' },
    draft: { label: 'Draft', color: '#8c9aaa' },
    archived: { label: 'Archived', color: '#e74c3c' },
  };

  const s = map[status] || { label: status, color: '#8c9aaa' };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.15rem 0.45rem',
        fontSize: '0.5rem',
        fontFamily: 'monospace',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: s.color,
        background: `${s.color}15`,
        border: `1px solid ${s.color}35`,
      }}
    >
      <span
        style={{
          width: '4px',
          height: '4px',
          borderRadius: '50%',
          backgroundColor: s.color,
        }}
      />
      {s.label}
    </span>
  );
}

export function ContentRatingBadge({ rating }: { rating?: string }) {
  const normalized = (rating || 'T').toUpperCase();
  const colors: Record<string, string> = {
    E: '#4caf80',
    T: '#3b9eda',
    M: '#f59e0b',
    AO: '#e74c3c',
  };
  const c = colors[normalized] || '#3b9eda';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '24px',
        height: '24px',
        fontSize: '0.55rem',
        fontWeight: 900,
        border: `1px solid ${c}40`,
        color: c,
        background: `${c}15`,
        fontFamily: "'Cinzel', serif",
        flexShrink: 0,
      }}
    >
      {normalized}
    </span>
  );
}

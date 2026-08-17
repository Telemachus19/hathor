import React from 'react';
import './ui.css';

export type BadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'default';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ children, variant = 'default', className = '', ...props }: BadgeProps) {
  return (
    <span className={`hathor-badge badge-${variant} ${className}`} {...props}>
      {children}
    </span>
  );
}

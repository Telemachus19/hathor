import React from 'react';
import './ui.css';

export function Card({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`hathor-card ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`hathor-card-header ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`hathor-card-content ${className}`} {...props}>
      {children}
    </div>
  );
}

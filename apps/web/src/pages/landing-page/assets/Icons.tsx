import React from 'react';

export const SearchIcon: React.FC<{ width?: number; height?: number }> = ({ width = 14, height = 14 }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export const GlobeIcon: React.FC<{ width?: number; height?: number }> = ({ width = 16, height = 16 }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

export const CartIcon: React.FC<{ width?: number; height?: number }> = ({ width = 16, height = 16 }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

export const LoginIcon: React.FC<{ width?: number; height?: number }> = ({ width = 13, height = 13 }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <polyline points="10 17 15 12 10 7" />
    <line x1="15" y1="12" x2="3" y2="12" />
  </svg>
);

export const FlameIcon: React.FC<{ width?: number; height?: number }> = ({ width = 13, height = 13 }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 23c-4.97 0-9-3.58-9-8 0-4.19 3.01-7.26 5.88-10.15.54-.54 1.12-1.12 1.68-1.74a.75.75 0 0 1 1.25.43c.27 1.83.92 3.19 1.77 4.19 1.05 1.24 2.47 2.05 3.92 2.88 2.05 1.18 4.2 2.41 4.5 5.39.29 2.92-1.57 6-4.5 7-.5.17-1.02.26-1.5.26z" />
  </svg>
);

export const TrophyIcon: React.FC<{ width?: number; height?: number }> = ({ width = 13, height = 13 }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.45 1-1 1H7" />
    <path d="M14 14.66V17c0 .55.45 1 1 1h2" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
  </svg>
);

export const SparkleIcon: React.FC<{ width?: number; height?: number }> = ({ width = 13, height = 13 }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
  </svg>
);

export const TrendingIcon: React.FC<{ width?: number; height?: number }> = ({ width = 13, height = 13 }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

export const HeartIcon: React.FC<{ width?: number; height?: number }> = ({ width = 13, height = 13 }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

export const StarIcon: React.FC<{ width?: number; height?: number; className?: string }> = ({ width = 11, height = 11, className }) => (
  <svg className={className} width={width} height={height} viewBox="0 0 24 24" fill="currentColor">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

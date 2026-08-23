import React from 'react';

export const SearchIcon: React.FC<{ width?: number; height?: number }> = ({
  width = 14,
  height = 14,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export const GlobeIcon: React.FC<{ width?: number; height?: number }> = ({
  width = 16,
  height = 16,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

export const CartIcon: React.FC<{ width?: number; height?: number }> = ({
  width = 16,
  height = 16,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

export const LoginIcon: React.FC<{ width?: number; height?: number }> = ({
  width = 13,
  height = 13,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <polyline points="10 17 15 12 10 7" />
    <line x1="15" y1="12" x2="3" y2="12" />
  </svg>
);

export const FlameIcon: React.FC<{ width?: number; height?: number }> = ({
  width = 13,
  height = 13,
}) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 23c-4.97 0-9-3.58-9-8 0-4.19 3.01-7.26 5.88-10.15.54-.54 1.12-1.12 1.68-1.74a.75.75 0 0 1 1.25.43c.27 1.83.92 3.19 1.77 4.19 1.05 1.24 2.47 2.05 3.92 2.88 2.05 1.18 4.2 2.41 4.5 5.39.29 2.92-1.57 6-4.5 7-.5.17-1.02.26-1.5.26z" />
  </svg>
);

export const TrophyIcon: React.FC<{ width?: number; height?: number }> = ({
  width = 13,
  height = 13,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.45 1-1 1H7" />
    <path d="M14 14.66V17c0 .55.45 1 1 1h2" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
  </svg>
);

export const SparkleIcon: React.FC<{ width?: number; height?: number }> = ({
  width = 13,
  height = 13,
}) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
  </svg>
);

export const TrendingIcon: React.FC<{ width?: number; height?: number }> = ({
  width = 13,
  height = 13,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

export const HeartIcon: React.FC<{ width?: number; height?: number }> = ({
  width = 13,
  height = 13,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

export const StarIcon: React.FC<{ width?: number; height?: number; className?: string }> = ({
  width = 11,
  height = 11,
  className,
}) => (
  <svg className={className} width={width} height={height} viewBox="0 0 24 24" fill="currentColor">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export const MailIcon: React.FC<{ width?: number; height?: number }> = ({
  width = 16,
  height = 16,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

export const LockIcon: React.FC<{ width?: number; height?: number }> = ({
  width = 16,
  height = 16,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export const EyeIcon: React.FC<{ width?: number; height?: number }> = ({
  width = 16,
  height = 16,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const EyeOffIcon: React.FC<{ width?: number; height?: number }> = ({
  width = 16,
  height = 16,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

export const UserIcon: React.FC<{ width?: number; height?: number }> = ({
  width = 16,
  height = 16,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const ArrowRightIcon: React.FC<{ width?: number; height?: number }> = ({
  width = 14,
  height = 14,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

export const AnkhIcon: React.FC<{
  width?: number;
  height?: number;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}> = ({ width, height, size = 18, className, style }) => {
  const w = width ?? size;
  const h = height ?? size;
  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 512 512"
      fill="currentColor"
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M242 0L228 3L210 10L191 23L177 38L168 52L161 70L158 84L158 96L157 98L158 99L159 117L164 134L168 141L168 143L181 162L214 195L213 196L206 196L205 195L190 195L189 194L156 192L155 191L147 191L139 189L117 187L85 181L85 281L119 276L120 275L150 272L151 271L220 267L220 343L219 382L216 417L212 450L207 481L203 512L309 512L305 481L300 450L296 417L293 382L292 343L292 267L362 272L363 273L394 276L427 281L427 181L395 187L373 189L365 191L357 191L356 192L323 194L322 195L307 195L306 196L299 196L298 195L331 162L344 143L344 141L348 134L353 117L354 99L355 98L354 96L354 84L351 70L344 52L335 38L321 23L302 10L284 3L270 0ZM256 39L270 42L284 49L296 59L306 71L313 85L316 99L315 113L311 127L304 139L294 150L256 188L218 150L208 139L201 127L197 113L196 99L199 85L206 71L216 59L228 49L242 42Z"
      />
    </svg>
  );
};

export const PharaohIcon: React.FC<{
  width?: number;
  height?: number;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}> = ({ width, height, size = 18, className, style }) => {
  const w = width ?? size;
  const h = height ?? size;
  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 512 512"
      fill="none"
      stroke="currentColor"
      strokeWidth="20"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Top Head Dome */}
      <path d="M112 156C116 88 178 72 222 72" />
      <path d="M290 72C334 72 396 88 400 156" />
      {/* Center Top Crest */}
      <path d="M222 166L230 64C244 56 268 56 282 64L290 166Z" />
      {/* Horizontal Browband */}
      <path d="M112 156H400" />
      {/* Face Contour */}
      <path d="M142 160C148 260 192 366 256 366C320 366 364 260 370 160" />
      {/* Left Nemes Headdress Wing & Lappet */}
      <path d="M112 156L54 306C78 322 122 362 150 406C172 440 220 455 220 448V358" />
      {/* Right Nemes Headdress Wing & Lappet */}
      <path d="M400 156L458 306C434 322 390 362 362 406C340 440 292 455 292 448V358" />
    </svg>
  );
};





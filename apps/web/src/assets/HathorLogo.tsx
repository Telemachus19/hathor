import React from 'react';

export const HathorLogo: React.FC<{
  className?: string;
  width?: number | string;
  height?: number | string;
}> = ({ className = '', width = 42, height = 36 }) => {
  return (
    <svg
      viewBox="0 0 950 780"
      width={width}
      height={height}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Hathor Logo"
      role="img"
    >
      {/* Horns */}
      <g>
        <path fill="#FF5500" d="M 230 220 Q 150 70 120 0 Q 210 50 270 240 Z" />
        <path fill="#FF5500" d="M 760 220 Q 840 70 870 0 Q 780 50 720 240 Z" />
      </g>

      {/* Main Cartouche Yellow Outer Frame & Body */}
      <g>
        <path
          fill="#F5B82E"
          d="
            M 260 185
            C 450 150 750 150 860 185
            C 970 230 985 390 945 540
            C 915 670 855 745 780 755
            C 710 765 675 690 635 625
            L 485 545
            C 320 545 220 645 190 715
            C 150 795 60 765 25 665
            C -5 565 15 365 110 225
            C 165 145 235 180 260 185 Z
          "
        />
      </g>

      {/* Red Cartouche Oval */}
      <rect
        fill="#B82E16"
        x="270"
        y="195"
        width="600"
        height="350"
        rx="175"
        ry="175"
      />

      {/* Ankh Symbol */}
      <g fill="#FFFFFF">
        <path
          d="
            M 435 275
            C 400 275 375 305 375 340
            C 375 375 400 410 435 435
            C 470 410 495 375 495 340
            C 495 305 470 275 435 275 Z

            M 435 308
            C 452 308 465 325 465 340
            C 465 362 448 392 435 407
            C 422 392 405 362 405 340
            C 405 325 418 308 435 308 Z
          "
        />
        <rect x="360" y="435" width="150" height="26" rx="6" />
        <path d="M 418 458 L 410 535 L 460 535 L 452 458 Z" />
      </g>

      {/* White Horizontal Pill Bar */}
      <rect fill="#FFFFFF" x="615" y="350" width="180" height="52" rx="26" />

      {/* Cobra Head & Hood Details */}
      <g>
        <path fill="#1E8C4E" d="M 5 200 C 50 170 150 190 230 280 C 175 220 65 200 25 230 Z" />
        <path fill="#1E8C4E" d="M 0 200 C 20 185 55 185 75 205 C 55 212 35 212 10 210 Z" />
        <ellipse fill="#FFFFFF" cx="50" cy="198" rx="8" ry="6" />
        <circle fill="#000000" cx="48" cy="198" r="3" />
        <path fill="#1250B4" stroke="#FFFFFF" strokeWidth="7" d="M 45 235 C 75 235 105 250 125 280 L 75 330 C 60 300 50 270 45 235 Z" />
        <path fill="#1A60C8" stroke="#FFFFFF" strokeWidth="7" d="M 125 280 C 155 310 175 350 190 390 L 125 390 C 115 360 100 330 75 330 Z" />
        <path fill="#9B321D" stroke="#FFFFFF" strokeWidth="7" d="M 30 350 C 45 350 75 360 105 390 L 65 460 C 45 430 35 390 30 350 Z" />
        <path fill="#9B321D" stroke="#FFFFFF" strokeWidth="7" d="M 105 390 C 135 420 160 460 175 500 L 115 500 C 100 470 85 430 65 460 Z" />
        <path fill="#1E8C4E" d="M 20 470 C 35 470 55 490 70 530 L 35 590 C 25 550 20 510 20 470 Z" />
        <path fill="#1E8C4E" d="M 70 530 C 90 570 105 620 110 660 L 65 660 C 60 620 50 570 35 590 Z" />
      </g>
    </svg>
  );
};

export default HathorLogo;

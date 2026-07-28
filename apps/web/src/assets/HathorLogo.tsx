import React from 'react';
import hathorLogoSvg from './hathor-logo.svg';

export const HathorLogo: React.FC<{
  className?: string;
  width?: number | string;
  height?: number | string;
}> = ({ className = '', width = 36, height = 28 }) => {
  return (
    <img
      src={hathorLogoSvg}
      alt="Hathor Logo"
      width={width}
      height={height}
      className={className}
      style={{ display: 'block', objectFit: 'contain', flexShrink: 0 }}
    />
  );
};

export default HathorLogo;

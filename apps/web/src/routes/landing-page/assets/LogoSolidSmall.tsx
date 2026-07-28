import React from 'react';
import logoSvg from './Logo Solid Small.svg';

export interface LogoSolidSmallProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fillColor?: string;
  width?: number;
  height?: number;
}

/**
 * Solid Hathor Small Logo Icon component.
 */
export const LogoSolidSmallIcon: React.FC<LogoSolidSmallProps> = ({
  width = 64,
  height = 48,
  className,
  style,
  ...props
}) => (
  <img
    src={logoSvg}
    width={width}
    height={height}
    alt="Hathor Logo"
    className={className}
    style={{ objectFit: 'contain', ...style }}
    {...props}
  />
);

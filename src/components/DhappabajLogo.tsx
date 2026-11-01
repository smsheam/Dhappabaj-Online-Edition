import React from 'react';
import { Theme } from '../types/game';

interface DhappabajLogoProps {
  theme?: Theme;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const LOGO_DARK = '/assets/dhappabaj_logo_dark.png';
const LOGO_LIGHT = '/assets/dhappabaj_logo_light.png';

export const DhappabajLogo: React.FC<DhappabajLogoProps> = ({
  theme = 'dark',
  className = '',
  size = 'lg',
}) => {
  const isDark = theme === 'dark';
  const logoSrc = isDark ? LOGO_DARK : LOGO_LIGHT;

  const sizeClasses = {
    xs: 'h-6 max-w-[90px]',
    sm: 'h-8 sm:h-9 max-w-[130px]',
    md: 'h-14 sm:h-16 max-w-[220px]',
    lg: 'h-24 sm:h-28 max-w-[320px]',
    xl: 'h-36 sm:h-44 max-w-[420px]',
  };

  return (
    <div className={`inline-flex items-center justify-center select-none ${className}`}>
      <img
        src={logoSrc}
        alt="ধাপ্পাবাজ (Dhappabaj)"
        className={`w-auto object-contain transition-all duration-300 drop-shadow-md hover:scale-102 ${sizeClasses[size]}`}
        loading="eager"
        decoding="async"
      />
    </div>
  );
};

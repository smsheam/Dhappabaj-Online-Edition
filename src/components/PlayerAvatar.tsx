import React from 'react';

interface PlayerAvatarProps {
  avatar: string;
  color?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  badge?: string | number;
  onClick?: () => void;
  title?: string;
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  avatar,
  color = 'bg-amber-500',
  size = 'md',
  className = '',
  badge,
  onClick,
  title,
}) => {
  const sizeMap = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-lg',
    lg: 'w-14 h-14 text-2xl',
    xl: 'w-20 h-20 text-4xl',
  };

  const badgeSizeMap = {
    xs: 'w-3 h-3 text-[8px] -top-1 -right-1',
    sm: 'w-4 h-4 text-[9px] -top-1 -right-1',
    md: 'w-5 h-5 text-[10px] -top-1 -right-1',
    lg: 'w-6 h-6 text-xs -top-1.5 -right-1.5',
    xl: 'w-7 h-7 text-sm -top-2 -right-2',
  };

  return (
    <div
      onClick={onClick}
      title={title}
      className={`relative inline-flex items-center justify-center rounded-2xl ${color} shadow-sm select-none transition-transform ${
        onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
      } ${sizeMap[size]} ${className}`}
    >
      <span className="leading-none drop-shadow-xs">{avatar}</span>
      {badge !== undefined && (
        <span
          className={`absolute rounded-full bg-slate-900 text-white font-mono font-bold flex items-center justify-center border-2 border-white dark:border-slate-800 ${badgeSizeMap[size]}`}
        >
          {badge}
        </span>
      )}
    </div>
  );
};

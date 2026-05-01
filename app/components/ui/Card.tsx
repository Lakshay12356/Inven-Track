import React from 'react';
import { LucideIcon } from 'lucide-react';

interface CardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  colorClass: string;
}

const iconBgMap: Record<string, string> = {
  'text-green-500': 'from-emerald-400 to-green-500',
  'text-blue-500': 'from-blue-400 to-indigo-500',
  'text-amber-500': 'from-amber-400 to-orange-500',
  'text-pink-500': 'from-pink-400 to-rose-500',
};

const iconGlowMap: Record<string, string> = {
  'text-green-500': 'shadow-emerald-500/25',
  'text-blue-500': 'shadow-blue-500/25',
  'text-amber-500': 'shadow-amber-500/25',
  'text-pink-500': 'shadow-pink-500/25',
};

const Card: React.FC<CardProps> = ({ title, value, icon: Icon, colorClass }) => {
  const gradientBg = iconBgMap[colorClass] || 'from-blue-400 to-indigo-500';
  const glowShadow = iconGlowMap[colorClass] || 'shadow-blue-500/25';

  return (
    <div className={`
      group relative overflow-hidden
      bg-white/45 dark:bg-white/[0.04]
      backdrop-blur-2xl dark:backdrop-blur-3xl
      border border-white/50 dark:border-white/[0.07]
      dark:border-t-white/[0.12]
      rounded-2xl p-5 sm:p-6
      shadow-[0_4px_24px_rgba(0,0,0,0.04)]
      dark:shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)]
      transition-all duration-300
      hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)]
      dark:hover:shadow-[0_16px_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)]
      hover:-translate-y-1
      hover:bg-white/60 dark:hover:bg-white/[0.06]
      hover:border-white/60 dark:hover:border-white/[0.12]
    `}>
      {/* Subtle gradient glow at top-right corner */}
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${gradientBg} opacity-[0.06] dark:opacity-[0.12] rounded-bl-full transition-opacity duration-300 group-hover:opacity-[0.1] dark:group-hover:opacity-[0.18]`} />
      
      <div className="flex items-center justify-between relative">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-white/40 mb-2 truncate">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white tracking-tight">{value}</p>
        </div>
        <div className={`p-3 sm:p-3.5 rounded-xl bg-gradient-to-br ${gradientBg} shadow-lg ${glowShadow} dark:${glowShadow} flex-shrink-0 ml-4`}>
          <Icon className="w-5 h-5 sm:w-5 sm:h-5 text-white" />
        </div>
      </div>
    </div>
  );
};

export default Card;
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface CardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  colorClass: string;
}

const Card: React.FC<CardProps> = ({ title, value, icon: Icon, colorClass }) => (
  <div className="glass dark:glass-dark glass-hover p-4 sm:p-6 rounded-3xl shadow-lg transition-all duration-300 hover:scale-[1.02]">
    <div className="flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 mb-1 truncate">{title}</p>
        <p className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 mt-1 truncate">{value}</p>
      </div>
      <div className={`p-3 sm:p-4 rounded-2xl ${colorClass} bg-opacity-20 dark:bg-opacity-30 backdrop-blur-sm flex-shrink-0 ml-2`}>
        <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${colorClass}`} />
      </div>
    </div>
  </div>
);

export default Card;
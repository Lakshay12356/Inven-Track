import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ 
  size = 'md', 
  text, 
  fullScreen = false 
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  };

  const containerClasses = fullScreen
    ? 'flex min-h-screen items-center justify-center'
    : 'flex items-center justify-center p-8';

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <div className="relative inline-block mb-6">
          {/* Outer rotating ring with gradient */}
          <div className={`${sizeClasses[size]} rounded-full relative`}>
            <div 
              className="absolute inset-0 rounded-full animate-spin-smooth"
              style={{
                background: 'conic-gradient(from 0deg, transparent 0deg, #3b82f6 90deg, #6366f1 180deg, #8b5cf6 270deg, transparent 360deg)',
              }}
            ></div>
            <div className="absolute inset-1 rounded-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800"></div>
          </div>
          
          {/* Inner pulsing dots */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex space-x-1.5">
              <div 
                className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse-dot"
                style={{ animationDelay: '0s' }}
              ></div>
              <div 
                className="w-2 h-2 bg-indigo-500 dark:bg-indigo-400 rounded-full animate-pulse-dot"
                style={{ animationDelay: '0.2s' }}
              ></div>
              <div 
                className="w-2 h-2 bg-purple-500 dark:bg-purple-400 rounded-full animate-pulse-dot"
                style={{ animationDelay: '0.4s' }}
              ></div>
            </div>
          </div>
        </div>
        
        {text && (
          <p className="text-sm sm:text-base font-medium text-gray-600 dark:text-gray-400">
            <span className="inline-block animate-pulse">{text}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default Loading;


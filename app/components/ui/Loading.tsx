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
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-18 h-18',
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
                background: 'conic-gradient(from 0deg, transparent 0deg, #6366f1 90deg, #3b82f6 180deg, #8b5cf6 270deg, transparent 360deg)',
              }}
            ></div>
            <div className="absolute inset-1 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-[#0d1130] dark:to-[#0a0e1f]"></div>
          </div>
          
          {/* Inner pulsing dots */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex space-x-1">
              <div 
                className="w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse-dot shadow-[0_0_8px_rgba(59,130,246,0.4)]"
                style={{ animationDelay: '0s' }}
              ></div>
              <div 
                className="w-1.5 h-1.5 bg-indigo-500 dark:bg-indigo-400 rounded-full animate-pulse-dot shadow-[0_0_8px_rgba(99,102,241,0.4)]"
                style={{ animationDelay: '0.2s' }}
              ></div>
              <div 
                className="w-1.5 h-1.5 bg-purple-500 dark:bg-purple-400 rounded-full animate-pulse-dot shadow-[0_0_8px_rgba(168,85,247,0.4)]"
                style={{ animationDelay: '0.4s' }}
              ></div>
            </div>
          </div>
        </div>
        
        {text && (
          <p className="text-sm font-medium text-gray-400 dark:text-white/40">
            <span className="inline-block animate-pulse">{text}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default Loading;

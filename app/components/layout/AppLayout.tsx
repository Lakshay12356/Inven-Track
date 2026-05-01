'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen relative">
      {/* Ambient background orbs — vibrant color pools that bleed through glass */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
        {/* Light mode orbs */}
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-blue-300/20 dark:bg-transparent rounded-full blur-3xl animate-blob" />
        <div className="absolute top-1/3 -left-32 w-[400px] h-[400px] bg-indigo-300/20 dark:bg-transparent rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-40 right-1/3 w-[450px] h-[450px] bg-purple-300/15 dark:bg-transparent rounded-full blur-3xl animate-blob animation-delay-4000" />
        
        {/* Dark mode orbs — rich, saturated, larger, with more visible color */}
        <div className="absolute hidden dark:block -top-20 -right-20 w-[600px] h-[600px] rounded-full blur-[100px] animate-blob opacity-60"
          style={{ background: 'radial-gradient(circle, rgba(99, 102, 241, 0.35) 0%, rgba(79, 70, 229, 0.15) 50%, transparent 70%)' }}
        />
        <div className="absolute hidden dark:block top-[40%] -left-20 w-[500px] h-[500px] rounded-full blur-[90px] animate-blob animation-delay-2000 opacity-50"
          style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, rgba(124, 58, 237, 0.12) 50%, transparent 70%)' }}
        />
        <div className="absolute hidden dark:block -bottom-20 right-[20%] w-[550px] h-[550px] rounded-full blur-[100px] animate-blob animation-delay-4000 opacity-50"
          style={{ background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(37, 99, 235, 0.1) 50%, transparent 70%)' }}
        />
        {/* Extra subtle accent orb */}
        <div className="absolute hidden dark:block top-[15%] left-[50%] w-[350px] h-[350px] rounded-full blur-[80px] animate-blob animation-delay-2000 opacity-30"
          style={{ background: 'radial-gradient(circle, rgba(236, 72, 153, 0.2) 0%, transparent 60%)' }}
        />
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <main className="flex-1 overflow-x-hidden overflow-y-auto w-full lg:w-auto relative z-[1]">
        <Header 
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          {children}
        </section>
      </main>
    </div>
  );
};

export default AppLayout;

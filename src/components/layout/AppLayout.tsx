import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import RightPanel from './RightPanel';

const AppLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-background dark:bg-dark-bg transition-colors duration-300">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:block w-[260px] border-r border-gray-200 dark:border-gray-800 shrink-0 bg-white dark:bg-dark-surface z-20">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar onMenuClick={() => setMobileMenuOpen(true)} />
        
        <div className="flex-1 overflow-auto flex">
          <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
            <Outlet />
          </main>
          
          {/* Right Panel - Desktop (Only on Dashboard) */}
          {location.pathname === '/' && (
            <aside className="hidden xl:block w-[360px] border-l border-gray-200 dark:border-gray-800 shrink-0 bg-white/50 dark:bg-dark-surface/50 overflow-y-auto">
              <RightPanel />
            </aside>
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Drawer */}
          <div className="absolute inset-y-0 left-0 w-[260px] bg-white dark:bg-dark-surface shadow-xl">
            <Sidebar onClose={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AppLayout;

import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Bell, Flame, ChevronDown, Menu } from 'lucide-react';
import { useOrganization } from '../../context/OrganizationContext';
import { OrganizationSelectorModal } from '../ui/OrganizationSelectorModal';
import { useAuth } from '../../context/AuthContext';

interface TopBarProps {
  onMenuClick: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { activeOrganization, activeSpecialization } = useOrganization();
  const { profile, isGuest } = useAuth();

  const streak = profile?.streak_days || 0;
  const displayName = profile?.display_name || 'Student';
  const avatarUrl = profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}&backgroundColor=b6e3f4`;

  return (
    <>
    <header className="h-20 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-4 lg:px-8">
      {/* Mobile Menu Button */}
      <button 
        onClick={onMenuClick}
        className="lg:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
      >
        <Menu size={24} />
      </button>

      {/* Mobile Title (Replaces Search Bar space) */}
      <div className="flex-1 max-w-2xl ml-2 lg:ml-0 flex items-center">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent hidden sm:block">
          Loksewa Prep Hub
        </h1>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 lg:gap-5 ml-auto">
        {/* Exam Selector - Visible on mobile too */}
        <div 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-gray-50 dark:bg-gray-900 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <div className="flex flex-col text-right">
            <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider">{activeOrganization}</span>
            <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 hidden sm:block">{activeSpecialization === 'General' ? 'Section Officer' : `${activeSpecialization} Engineer`}</span>
          </div>
          <ChevronDown size={14} className="text-gray-400" />
        </div>

        {/* Streak (real data) */}
        {!isGuest && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-orange-50 dark:bg-orange-500/10 text-orange-500 rounded-xl font-bold text-sm">
            <Flame size={18} className="fill-orange-500" />
            <span>{streak}</span>
          </div>
        )}

        {/* Notifications */}
        <button className="relative p-2.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
          <Bell size={22} />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-danger rounded-full border-2 border-white dark:border-dark-surface"></span>
        </button>

        {/* Profile Avatar */}
        <NavLink to="/profile" className="p-1 rounded-xl hover:ring-2 hover:ring-primary/30 transition-all">
          <img 
            src={avatarUrl} 
            alt="Profile Avatar" 
            className="w-9 h-9 rounded-xl bg-gray-100 border border-gray-200 dark:border-gray-700"
          />
        </NavLink>
      </div>
    </header>
    <OrganizationSelectorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default TopBar;

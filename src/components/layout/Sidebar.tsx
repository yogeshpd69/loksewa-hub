import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, BookOpen, PenTool, ClipboardCheck, 
  Book, Newspaper, Lightbulb,
  Calendar, Bot, Moon, Sun, X, User, LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState<boolean>(() => {
    return document.documentElement.classList.contains('dark');
  });

  const { profile, signOut, isGuest, updateProfile } = useAuth();

  useEffect(() => {
    // Just sync our local isDark state with what AuthContext / index.html determined
    if (profile?.theme_preference) {
      setIsDark(profile.theme_preference === 'dark');
    }
  }, [profile?.theme_preference]);

  const toggleDarkMode = async () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      if (!isGuest) await updateProfile({ theme_preference: 'dark' });
    } else {
      document.documentElement.classList.remove('dark');
      if (!isGuest) await updateProfile({ theme_preference: 'light' });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const sections = [
    {
      title: 'Learning',
      items: [
        { icon: Home, label: 'Home', path: '/' },
        { icon: BookOpen, label: 'Syllabus', path: '/syllabus' },
        { icon: PenTool, label: 'Practice MCQs', path: '/practice' },
        { icon: ClipboardCheck, label: 'Mock Tests', path: '/mock-tests' },
        { icon: Book, label: 'Notes & PDFs', path: '/notes' },
        { icon: Newspaper, label: 'Current Affairs', path: '/current-affairs' },
        { icon: Lightbulb, label: 'Flashcards', path: '/flashcards' },
      ]
    },
    {
      title: 'Tools',
      items: [
        { icon: Calendar, label: 'Study Planner', path: '/planner' },
        { icon: Bot, label: 'AI Assistant', path: '/ai-assistant' },
      ]
    }
  ];

  // Dynamic user data
  const displayName = profile?.display_name || 'Student';
  const avatarUrl = profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}&backgroundColor=b6e3f4`;
  const xp = profile?.xp || 0;
  const level = Math.floor(xp / 500) + 1;
  const xpInLevel = xp % 500;
  const xpForNextLevel = 500;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-dark-surface transition-colors duration-300">
      {/* Header */}
      <div className="p-6 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-xl shadow-soft">
            L
          </div>
          <span className="font-extrabold text-xl tracking-tight text-gray-900 dark:text-white">Loksewa Hub</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-gray-500 hover:text-gray-900 dark:hover:text-white">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar">
        {sections.map((section, idx) => (
          <div key={idx}>
            <div className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {section.title}
            </div>
            <div className="space-y-1">
              {section.items.map((item, i) => (
                <NavLink
                  key={i}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) => 
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive 
                        ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-hover font-bold' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                    }`
                  }
                >
                  <item.icon size={18} strokeWidth={2.5} />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}

        <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-1">
          <NavLink
            to="/profile"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-hover font-bold' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`
            }
          >
            <User size={18} strokeWidth={2.5} />
            My Profile
          </NavLink>

          <button 
            onClick={toggleDarkMode}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              {isDark ? <Sun size={18} strokeWidth={2.5} className="text-amber-400" /> : <Moon size={18} strokeWidth={2.5} />}
              <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </div>
            <div className={`w-9 h-5 rounded-full relative transition-colors p-0.5 ${isDark ? 'bg-primary' : 'bg-gray-200'}`}>
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${isDark ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
          </button>

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-danger/10 hover:text-danger transition-colors"
          >
            <LogOut size={18} strokeWidth={2.5} />
            {isGuest ? 'Exit Guest Mode' : 'Sign Out'}
          </button>
        </div>
      </div>

      {/* Profile Summary */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800">
        <div 
          onClick={() => {
            navigate('/profile');
            if (onClose) onClose();
          }}
          className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
        >
          <img 
            src={avatarUrl} 
            alt="User avatar" 
            className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 dark:border-gray-700"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{displayName}</h4>
            <p className="text-xs text-gray-500 truncate">
              {isGuest ? 'Guest Mode' : `Level ${level} Scholar`}
            </p>
          </div>
        </div>
        
        {!isGuest && (
          <div className="px-3 mt-3">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-gray-500 font-medium">XP Progress</span>
              <span className="text-primary font-bold">{xpInLevel.toLocaleString()} / {xpForNextLevel.toLocaleString()}</span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500" style={{ width: `${(xpInLevel / xpForNextLevel) * 100}%` }}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Trophy, Play, CheckSquare, Target, Newspaper, Layers, BrainCircuit, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchDailyNews } from '../lib/news';
import { getComputedStreak } from '../lib/profile';
import type { NewsArticle } from '../lib/news';

const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  
  const displayName = profile?.display_name || 'Student';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    fetchDailyNews(new Date())
      .then(data => setNews(data.slice(0, 3))) // only show top 3 on dash
      .catch(err => console.error(err))
      .finally(() => setLoadingNews(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto pb-24">
      {/* Header section with Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{greeting}, {displayName}! 👋</h1>
          <p className="text-gray-500 text-lg">Ready to conquer your next exam?</p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-gray-800 rounded-2xl p-4 px-6 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-500 flex items-center justify-center">
              <Flame size={24} className="fill-orange-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Day Streak</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white leading-none mt-1">{getComputedStreak(profile?.streak_days || 0, profile?.last_active_date || '')}</p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-gray-800 rounded-2xl p-4 px-6 flex items-center gap-4 shadow-sm hidden sm:flex">
            <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
              <Trophy size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total XP</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white leading-none mt-1">{profile?.xp || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: News */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Newspaper className="text-primary" size={24} /> Today's Highlights
            </h2>
            <button onClick={() => navigate('/current-affairs')} className="text-sm font-bold text-primary hover:underline flex items-center">
              View All <ArrowRight size={16} className="ml-1" />
            </button>
          </div>
          
          {loadingNews ? (
            <div className="h-64 bg-gray-50 dark:bg-gray-900/50 rounded-3xl animate-pulse flex items-center justify-center text-gray-400 font-bold">
              Fetching News...
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {news.map(item => (
                <div key={item.id} className="bg-white dark:bg-dark-surface p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:border-primary/30 transition-colors cursor-pointer" onClick={() => navigate('/current-affairs')}>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded-md mb-3 inline-block">
                    {item.topic}
                  </span>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">{item.summary}</p>
                </div>
              ))}
            </div>
          )}

          {/* Quick Stats banner */}
          <div className="mt-8 bg-gradient-to-r from-primary to-accent p-8 rounded-3xl text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-2xl font-black mb-2">Your Progress</h2>
              <p className="opacity-90 max-w-md">You have completed {profile?.tests_taken || 0} practice sets so far. Keep pushing towards your Loksewa goals!</p>
              <button onClick={() => navigate('/practice')} className="mt-6 px-6 py-3 bg-white text-gray-900 font-bold rounded-xl hover:scale-105 transition-transform flex items-center gap-2">
                Continue Practice <ArrowRight size={18} />
              </button>
            </div>
            <BrainCircuit className="absolute -right-4 -bottom-4 w-48 h-48 opacity-10" />
          </div>
        </div>

        {/* Right Column: Quick Actions */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Quick Actions</h2>
          
          <div className="grid gap-4">
            <button onClick={() => navigate('/practice')} className="group flex items-center p-4 bg-white dark:bg-dark-surface border border-gray-100 dark:border-gray-800 rounded-2xl hover:border-primary/50 transition-all text-left">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                <Play size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white">Smart Practice</h3>
                <p className="text-xs text-gray-500">Spaced repetition engine</p>
              </div>
              <ArrowRight size={18} className="text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </button>

            <button onClick={() => navigate('/mock-tests')} className="group flex items-center p-4 bg-white dark:bg-dark-surface border border-gray-100 dark:border-gray-800 rounded-2xl hover:border-accent/50 transition-all text-left">
              <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                <Target size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white">Mock Tests</h3>
                <p className="text-xs text-gray-500">Simulate real exams</p>
              </div>
              <ArrowRight size={18} className="text-gray-300 group-hover:text-accent group-hover:translate-x-1 transition-all" />
            </button>

            <button onClick={() => navigate('/flashcards')} className="group flex items-center p-4 bg-white dark:bg-dark-surface border border-gray-100 dark:border-gray-800 rounded-2xl hover:border-success/50 transition-all text-left">
              <div className="w-12 h-12 rounded-xl bg-success/10 text-success flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                <Layers size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white">Flashcards</h3>
                <p className="text-xs text-gray-500">Memorize fast</p>
              </div>
              <ArrowRight size={18} className="text-gray-300 group-hover:text-success group-hover:translate-x-1 transition-all" />
            </button>
            
            <button onClick={() => navigate('/planner')} className="group flex items-center p-4 bg-white dark:bg-dark-surface border border-gray-100 dark:border-gray-800 rounded-2xl hover:border-orange-500/50 transition-all text-left">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                <CheckSquare size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white">Study Planner</h3>
                <p className="text-xs text-gray-500">Tasks & Pomodoro</p>
              </div>
              <ArrowRight size={18} className="text-gray-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

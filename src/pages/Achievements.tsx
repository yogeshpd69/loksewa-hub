import React from 'react';
import { Award, Zap, Target, BookOpen, Clock, ShieldCheck } from 'lucide-react';

const Achievements: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto pb-24 px-4">
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-purple-50 dark:bg-purple-500/10 rounded-full mx-auto flex items-center justify-center mb-4">
          <Award size={40} className="text-purple-500" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Achievements & Badges</h1>
        <p className="text-gray-500">Earn badges as you progress through your Loksewa journey.</p>
        <div className="mt-4 inline-block px-4 py-1.5 bg-primary/10 text-primary font-bold text-xs rounded-full uppercase tracking-wider">
          Coming Soon
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative">
        {/* Blur overlay */}
        <div className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-[2px] z-10 flex items-center justify-center pointer-events-none rounded-3xl">
          <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-2xl text-center max-w-sm mx-4">
            <ShieldCheck size={48} className="mx-auto mb-4 text-primary" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Achievement System in QA</h2>
            <p className="text-sm text-gray-500">We are finalizing the badge logic. Your current stats will retroactively unlock badges when we launch this feature.</p>
          </div>
        </div>

        {/* Dummy Badges */}
        {[
          { icon: Zap, title: 'Speed Demon', desc: 'Answer 50 questions in under 10 minutes', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
          { icon: Target, title: 'Sharpshooter', desc: 'Achieve 100% accuracy in a 50-question mock test', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
          { icon: BookOpen, title: 'Bookworm', desc: 'Read 100 flashcards in a single session', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
          { icon: Clock, title: 'Night Owl', desc: 'Complete a mock test between midnight and 4 AM', color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
          { icon: ShieldCheck, title: 'Constitution Master', desc: 'Score perfectly on the Constitution section', color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-500/10' },
          { icon: Award, title: 'Loksewa Legend', desc: 'Reach Level 50 in Global Rankings', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10' },
        ].map((badge, idx) => (
          <div key={idx} className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-gray-800 rounded-3xl p-6 flex flex-col items-center text-center opacity-50 grayscale">
            <div className={`w-20 h-20 rounded-full ${badge.bg} flex items-center justify-center mb-4`}>
              <badge.icon size={32} className={badge.color} />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">{badge.title}</h3>
            <p className="text-xs text-gray-500">{badge.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Achievements;

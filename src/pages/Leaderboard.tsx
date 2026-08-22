import React from 'react';
import { Trophy, Medal, Flame, Crown } from 'lucide-react';

const Leaderboard: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto pb-24 px-4">
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-orange-50 dark:bg-orange-500/10 rounded-full mx-auto flex items-center justify-center mb-4">
          <Trophy size={40} className="text-orange-500" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Global Leaderboard</h1>
        <p className="text-gray-500">Compete with thousands of Loksewa aspirants.</p>
        <div className="mt-4 inline-block px-4 py-1.5 bg-primary/10 text-primary font-bold text-xs rounded-full uppercase tracking-wider">
          Coming Soon
        </div>
      </div>

      <div className="bg-white dark:bg-dark-surface rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden relative">
        {/* Blur overlay for "Coming Soon" effect */}
        <div className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center pointer-events-none">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 drop-shadow-md">Ranking Engine in Development</h2>
          <p className="text-gray-800 dark:text-gray-200 font-medium max-w-sm text-center drop-shadow-md">Keep practicing! Your current XP and test scores are being saved for the inaugural season.</p>
        </div>

        {/* Dummy Data */}
        <div className="p-6 opacity-60">
          <div className="flex justify-between items-center mb-6 text-sm font-bold text-gray-400 uppercase tracking-wider px-4">
            <span>Rank</span>
            <span>Aspirant</span>
            <span>Score</span>
          </div>

          {[1, 2, 3, 4, 5].map((rank) => (
            <div key={rank} className={`flex items-center justify-between p-4 mb-2 rounded-2xl ${rank === 1 ? 'bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20' : 'bg-gray-50 dark:bg-gray-900/50'}`}>
              <div className="w-12 text-center font-black text-lg">
                {rank === 1 ? <Crown className="mx-auto text-orange-500" /> : rank === 2 ? <Medal className="mx-auto text-gray-400" /> : rank === 3 ? <Medal className="mx-auto text-amber-600" /> : <span className="text-gray-400">#{rank}</span>}
              </div>
              <div className="flex-1 flex items-center gap-3 px-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                <div>
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1" />
                  <div className="flex gap-2">
                    <span className="flex items-center text-[10px] text-gray-400"><Flame size={12} className="mr-0.5 text-orange-500" /> 14</span>
                  </div>
                </div>
              </div>
              <div className="font-bold text-lg text-primary">{15000 - (rank * 1000)} <span className="text-xs text-gray-400">XP</span></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;

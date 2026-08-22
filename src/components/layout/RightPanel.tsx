import React, { useState, useEffect } from 'react';
import { Target, CheckCircle, BarChart3, TrendingUp, Medal, Flame, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getFriendsLeaderboard, addFriendByEmail } from '../../lib/friends';
import type { FriendLeaderboardEntry } from '../../lib/friends';
import { fetchSessions } from '../../lib/planner';
import { supabase } from '../../lib/supabase';

const RightPanel: React.FC = () => {
  const { profile, user, isGuest } = useAuth();
  
  const level = profile ? Math.floor(profile.xp / 500) + 1 : 1;
  const testsTaken = profile?.tests_taken || 0;
  const xp = profile?.xp || 0;
  const badges = profile?.badges || [];

  const [leaderboard, setLeaderboard] = useState<FriendLeaderboardEntry[]>([]);
  const [friendEmail, setFriendEmail] = useState('');
  const [addFriendStatus, setAddFriendStatus] = useState<{success?: boolean; error?: string} | null>(null);
  const [accuracy, setAccuracy] = useState<number>(0);
  const [studyHeatmap, setStudyHeatmap] = useState<boolean[]>(Array(7).fill(false));

  useEffect(() => {
    if (user && !isGuest) {
      loadLeaderboard();
      loadAccuracy();
      loadHeatmap();
    }
  }, [user, isGuest]);

  const loadLeaderboard = async () => {
    if (user) {
      const data = await getFriendsLeaderboard(user.id);
      setLeaderboard(data);
    }
  };

  const loadAccuracy = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('user_answers')
      .select('is_correct')
      .eq('user_id', user.id);
      
    if (data && data.length > 0) {
      const correct = data.filter(a => a.is_correct).length;
      setAccuracy(Math.round((correct / data.length) * 100));
    }
  };

  const loadHeatmap = async () => {
    if (!user) return;
    const sessions = await fetchSessions(user.id);
    
    // Calculate last 7 days
    const today = new Date();
    const heatmap = Array(7).fill(false);
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const hasSession = sessions.some(s => s.session_date === dateStr && s.duration_minutes > 0);
      heatmap[6 - i] = hasSession;
    }
    setStudyHeatmap(heatmap);
  };

  const handleAddFriend = async () => {
    if (!friendEmail.trim() || !user) return;
    setAddFriendStatus(null);
    const result = await addFriendByEmail(user.id, friendEmail);
    if (result.success) {
      setFriendEmail('');
      setAddFriendStatus({ success: true });
      loadLeaderboard();
      setTimeout(() => setAddFriendStatus(null), 3000);
    } else {
      setAddFriendStatus({ error: result.error });
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Top Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-dark-surface p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <Target size={16} className="text-primary" />
          </div>
          <div className="text-2xl font-extrabold text-gray-900 dark:text-white">{level}</div>
          <div className="text-xs font-medium text-gray-500 mt-1">Current Level</div>
        </div>
        
        <div className="bg-white dark:bg-dark-surface p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center mb-3">
            <Flame size={16} className="text-orange-500" />
          </div>
          <div className="text-2xl font-extrabold text-gray-900 dark:text-white">{xp}</div>
          <div className="text-xs font-medium text-gray-500 mt-1">Total XP</div>
        </div>
        
        <div className="bg-white dark:bg-dark-surface p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center mb-3">
            <CheckCircle size={16} className="text-success" />
          </div>
          <div className="text-2xl font-extrabold text-gray-900 dark:text-white">{accuracy}%</div>
          <div className="text-xs font-medium text-gray-500 mt-1">Overall Accuracy</div>
        </div>
        
        <div className="bg-white dark:bg-dark-surface p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center mb-3">
            <BarChart3 size={16} className="text-secondary" />
          </div>
          <div className="text-2xl font-extrabold text-gray-900 dark:text-white">{testsTaken}</div>
          <div className="text-xs font-medium text-gray-500 mt-1">Tests Taken</div>
        </div>
      </div>

      {/* Leaderboard snippet */}
      <div className="bg-white dark:bg-dark-surface rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp size={18} className="text-primary" />
            Weekly Leaderboard
          </h3>
        </div>
        
        {!isGuest && (
          <div className="mb-4">
            <div className="flex gap-2">
              <input 
                type="text" 
                value={friendEmail}
                onChange={e => setFriendEmail(e.target.value)}
                placeholder="Friend's exact name"
                className="flex-1 bg-gray-50 dark:bg-gray-900 border-none rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-primary"
              />
              <button 
                onClick={handleAddFriend}
                className="bg-primary text-white p-2 rounded-xl hover:bg-primary-hover"
              >
                <UserPlus size={18} />
              </button>
            </div>
            {addFriendStatus?.error && <div className="text-xs text-danger mt-1">{addFriendStatus.error}</div>}
            {addFriendStatus?.success && <div className="text-xs text-success mt-1">Friend added!</div>}
          </div>
        )}

        <div className="space-y-4">
          {leaderboard.length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-4">No friends yet. Add some to compete!</div>
          ) : (
            leaderboard.map((friend) => (
              <div key={friend.id} className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${friend.id === user?.id ? 'bg-primary/20 text-primary' : 'bg-gray-50 dark:bg-gray-800 text-gray-400'}`}>
                    {friend.rank}
                  </div>
                  <div>
                    <div className={`text-sm font-bold ${friend.id === user?.id ? 'text-primary' : 'text-gray-900 dark:text-white'} group-hover:text-primary transition-colors`}>{friend.name} {friend.id === user?.id && '(You)'}</div>
                    <div className="text-xs font-medium text-gray-500">{friend.xp} Weekly XP</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Study Streak */}
      <div className="bg-white dark:bg-dark-surface rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2 mb-4">
          <Flame size={18} className="text-orange-500" />
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">Study Activity (7 Days)</h3>
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {studyHeatmap.map((isActive, i) => {
            const today = new Date();
            today.setDate(today.getDate() - (6 - i));
            const dayName = ['S', 'M', 'T', 'W', 'T', 'F', 'S'][today.getDay()];
            
            return (
              <div key={i} className="flex flex-col items-center gap-2">
                <div 
                  className={`w-full aspect-square rounded-lg ${
                    isActive ? 'bg-primary' : 'bg-gray-100 dark:bg-gray-800'
                  }`}
                />
                <span className="text-[10px] font-bold text-gray-400">
                  {dayName}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white dark:bg-dark-surface rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Medal size={18} className="text-accent" />
          Recent Badges
        </h3>
        
        <div className="flex gap-3">
          <div className={`flex-1 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-3 text-white text-center shadow-md ${!badges.includes('bookworm') && 'opacity-50 grayscale'}`}>
            <div className="text-2xl mb-1">📚</div>
            <div className="text-[10px] font-bold uppercase tracking-wide">Bookworm</div>
          </div>
          <div className={`flex-1 bg-gradient-to-br from-rose-400 to-red-500 rounded-2xl p-3 text-white text-center shadow-md ${!badges.includes('sharpshooter') && 'opacity-50 grayscale'}`}>
            <div className="text-2xl mb-1">🎯</div>
            <div className="text-[10px] font-bold uppercase tracking-wide">Sharpshooter</div>
          </div>
          <div className={`flex-1 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl p-3 text-white text-center shadow-md ${!badges.includes('streak7') && 'opacity-50 grayscale'}`}>
            <div className="text-2xl mb-1">⚡️</div>
            <div className="text-[10px] font-bold uppercase tracking-wide">7 Day Streak</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightPanel;

import React, { useState, useEffect } from 'react';
import { User, Trophy, Calendar, PenTool, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Profile: React.FC = () => {
  const { profile, updateProfile, isGuest } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [specialization, setSpecialization] = useState(profile?.specialization || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Reset form when profile loads
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setSpecialization(profile.specialization || '');
    }
  }, [profile]);

  const handleSave = async () => {
    if (isGuest) return;
    
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      await updateProfile({
        display_name: displayName,
        specialization: specialization
      });
      setSaveStatus('success');
      setIsEditing(false);
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const badges = profile?.badges || [];

  return (
    <div className="max-w-4xl mx-auto pb-24">
      {/* Header Profile Card */}
      <div className="bg-white dark:bg-dark-surface rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm mb-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary/20 to-accent/20 z-0" />
        
        <div className="z-10 relative">
          <img 
            src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}&backgroundColor=b6e3f4`}
            alt="Profile Avatar"
            className="w-32 h-32 rounded-full border-4 border-white dark:border-dark-surface shadow-md bg-gray-100"
          />
        </div>
        
        <div className="z-10 flex-1 text-center md:text-left w-full">
          {isEditing ? (
            <div className="space-y-4 max-w-sm mx-auto md:mx-0">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Display Name</label>
                <input 
                  type="text" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Specialization</label>
                <input 
                  type="text" 
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="e.g. BCT, Civil, Section Officer"
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 focus:border-primary focus:outline-none"
                />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 py-2 bg-primary text-white font-bold rounded-xl flex items-center justify-center gap-2"
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : 'Save Changes'}
                </button>
                <button 
                  onClick={() => {
                    setIsEditing(false);
                    setDisplayName(profile?.display_name || '');
                    setSpecialization(profile?.specialization || '');
                  }}
                  className="flex-1 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{profile?.display_name || 'Student'}</h1>
              <p className="text-gray-500 font-medium mb-4">{profile?.organization} • {profile?.specialization}</p>
              
              {!isGuest && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-5 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors inline-flex items-center gap-2"
                >
                  <PenTool size={16} /> Edit Profile
                </button>
              )}
            </>
          )}

          {saveStatus === 'success' && (
            <div className="mt-4 inline-flex items-center gap-2 text-success bg-success/10 px-4 py-2 rounded-xl text-sm font-bold">
              <CheckCircle2 size={16} /> Profile updated successfully!
            </div>
          )}
          {saveStatus === 'error' && (
            <div className="mt-4 inline-flex items-center gap-2 text-danger bg-danger/10 px-4 py-2 rounded-xl text-sm font-bold">
              <AlertTriangle size={16} /> Failed to update profile.
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Core Stats */}
        <div className="md:col-span-2 space-y-8">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Performance Stats</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <Trophy className="text-accent mb-3" size={28} />
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total XP</p>
                <p className="text-3xl font-black text-gray-900 dark:text-white">{profile?.xp || 0}</p>
              </div>
              <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <PenTool className="text-primary mb-3" size={28} />
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Tests Taken</p>
                <p className="text-3xl font-black text-gray-900 dark:text-white">{profile?.tests_taken || 0}</p>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Trophy size={20} className="text-accent" /> Earned Badges
            </h2>
            {badges.length > 0 ? (
              <div className="flex flex-wrap gap-4">
                {badges.map((badge, idx) => (
                  <div key={idx} className="bg-accent/10 text-accent font-bold px-4 py-2 rounded-xl">
                    {badge}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 text-center text-gray-400 font-medium">
                Keep practicing to earn your first badge!
              </div>
            )}
          </div>
        </div>

        {/* Account Details */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Account</h2>
          <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Account Type</p>
              <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <User size={16} /> {isGuest ? 'Guest User' : 'Registered Scholar'}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Joined On</p>
              <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <Calendar size={16} /> {profile?.last_active_date || 'Today'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

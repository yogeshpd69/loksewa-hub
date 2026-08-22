import { supabase } from './supabase';

export async function incrementStreakAndTests(userId: string) {
  // Fetch current profile
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('streak_days, last_active_date, tests_taken')
    .eq('id', userId)
    .maybeSingle();

  if (error || !profile) {
    console.error('Error fetching profile for streak:', error);
    return;
  }

  const today = new Date().toISOString().split('T')[0];
  let newStreak = profile.streak_days;
  let newTestsTaken = (profile.tests_taken || 0) + 1;

  if (profile.last_active_date !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    newStreak = profile.last_active_date === yesterday ? profile.streak_days + 1 : 1;
  }

  await supabase
    .from('profiles')
    .update({ 
      last_active_date: today, 
      streak_days: newStreak,
      tests_taken: newTestsTaken
    })
    .eq('id', userId);
    
  return { newStreak, newTestsTaken };
}

export async function addXP(userId: string, xpToAdd: number) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('xp, weekly_xp')
    .eq('id', userId)
    .single();
    
  if (!profile) return;
  
  await supabase
    .from('profiles')
    .update({ 
      xp: (profile.xp || 0) + xpToAdd,
      weekly_xp: (profile.weekly_xp || 0) + xpToAdd
    })
    .eq('id', userId);
}

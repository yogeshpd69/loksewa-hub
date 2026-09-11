// Client-side gamification updates are now handled securely via Postgres RPCs.
// This helper is used purely for UI display of the streak.
export function getComputedStreak(streakDays: number, lastActiveDate: string): number {
  if (!lastActiveDate) return 0;
  
  const today = new Date().toISOString().split('T')[0];
  if (lastActiveDate === today) return streakDays;
  
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (lastActiveDate === yesterday) return streakDays;
  
  // If the user hasn't been active today or yesterday, they lost their streak.
  return 0;
}

import { supabase } from './supabase';

export interface FriendLeaderboardEntry {
  id: string;
  name: string;
  xp: number;
  rank: number;
  avatar_url: string | null;
}

export async function addFriendByEmail(userId: string, friendEmail: string) {
  // First, find the friend by email (we need a way to look them up)
  // Note: For privacy, we might not be able to search auth.users by email directly from the client.
  // We'll search profiles if we stored email there, but we didn't. 
  // Let's assume we can search by display_name or exact email if we add an RPC or Edge function.
  // For now, let's search by display_name for simplicity in this demo, or we can use an RPC.
  
  const { data: friendProfiles, error } = await supabase
    .from('profiles')
    .select('id')
    .ilike('display_name', `%${friendEmail}%`)
    .limit(1);
    
  if (error || !friendProfiles || friendProfiles.length === 0) {
    return { success: false, error: 'User not found with that name.' };
  }

  const friendId = friendProfiles[0].id;
  
  if (friendId === userId) {
    return { success: false, error: 'You cannot add yourself.' };
  }

  const { error: insertError } = await supabase
    .from('friends')
    .insert({ user_id: userId, friend_id: friendId });

  if (insertError) {
    if (insertError.code === '23505') { // Unique violation
      return { success: false, error: 'Already friends.' };
    }
    return { success: false, error: 'Failed to add friend.' };
  }

  return { success: true };
}

export async function getFriendsLeaderboard(userId: string): Promise<FriendLeaderboardEntry[]> {
  // Get friends list
  const { data: friends, error: friendsError } = await supabase
    .from('friends')
    .select('friend_id')
    .eq('user_id', userId);
    
  if (friendsError || !friends) return [];

  const friendIds = friends.map(f => f.friend_id);
  friendIds.push(userId); // Include self in leaderboard

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, display_name, weekly_xp, avatar_url')
    .in('id', friendIds)
    .order('weekly_xp', { ascending: false });

  if (profilesError || !profiles) return [];

  return profiles.map((p, index) => ({
    id: p.id,
    name: p.display_name || 'Student',
    xp: p.weekly_xp || 0,
    rank: index + 1,
    avatar_url: p.avatar_url
  }));
}

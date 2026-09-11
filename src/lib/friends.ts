import { supabase } from './supabase';

export interface FriendLeaderboardEntry {
  id: string;
  name: string;
  xp: number;
  rank: number;
  avatar_url: string | null;
}

export async function requestFriendByEmail(friendEmail: string) {
  // Use secure RPC to search by exact email and insert a pending friend request
  const { data, error } = await supabase.rpc('request_friend_by_email', {
    p_friend_email: friendEmail
  });

  if (error) {
    return { success: false, error: 'Failed to send friend request.' };
  }
  
  if (data && data.success === false) {
    return { success: false, error: data.error };
  }

  return { success: true };
}

export async function acceptFriendRequest(requesterId: string) {
  const { data, error } = await supabase.rpc('accept_friend_request', {
    p_requester_id: requesterId
  });

  if (error || (data && data.success === false)) {
    return { success: false, error: data?.error || 'Failed to accept request.' };
  }
  return { success: true };
}

export async function rejectFriendRequest(requesterId: string) {
  const { data, error } = await supabase.rpc('reject_friend_request', {
    p_requester_id: requesterId
  });

  if (error || (data && data.success === false)) {
    return { success: false, error: data?.error || 'Failed to reject request.' };
  }
  return { success: true };
}

export async function getFriendsLeaderboard(userId: string): Promise<FriendLeaderboardEntry[]> {
  // Get accepted friends list
  const { data: friends, error: friendsError } = await supabase
    .from('friends')
    .select('friend_id')
    .eq('user_id', userId)
    .eq('status', 'accepted');
    
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

export interface PendingRequest {
  user_id: string; // The person who sent the request
  display_name: string;
  avatar_url: string | null;
}

export async function getPendingFriendRequests(userId: string): Promise<PendingRequest[]> {
  const { data: requests, error } = await supabase
    .from('friends')
    .select('user_id')
    .eq('friend_id', userId)
    .eq('status', 'pending');

  if (error || !requests || requests.length === 0) return [];

  const requesterIds = requests.map(r => r.user_id);

  const { data: profiles, error: pError } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url')
    .in('id', requesterIds);

  if (pError || !profiles) return [];

  return profiles.map(p => ({
    user_id: p.id,
    display_name: p.display_name || 'Student',
    avatar_url: p.avatar_url
  }));
}

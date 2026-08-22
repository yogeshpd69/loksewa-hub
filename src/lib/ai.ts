import { supabase } from './supabase';
import type { ChatMessage } from '../utils/groqClient';

export interface DBConversation {
  id: string;
  user_id: string;
  title: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

export async function fetchAIChats(userId: string): Promise<DBConversation[]> {
  const { data, error } = await supabase
    .from('ai_conversations')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching AI chats:', error);
    return [];
  }
  return data || [];
}

export async function saveAIChat(userId: string, conversationId: string, title: string, messages: ChatMessage[]) {
  const { error } = await supabase
    .from('ai_conversations')
    .upsert({
      id: conversationId,
      user_id: userId,
      title: title,
      messages: messages,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' });

  if (error) {
    console.error('Error saving AI chat:', error);
  }
}

export async function deleteAIChatDB(conversationId: string) {
  const { error } = await supabase
    .from('ai_conversations')
    .delete()
    .eq('id', conversationId);
    
  if (error) {
    console.error('Error deleting AI chat:', error);
  }
}

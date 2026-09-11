/**
 * Secure client for AI API using Supabase Edge Functions.
 * API Key is managed server-side.
 */
import { supabase } from '../lib/supabase';

export const GROQ_MODELS = {
  HEAVY: 'llama-3.1-70b-versatile',
  FAST: 'llama-3.1-8b-instant',
};

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export const generateCompletion = async (
  messages: ChatMessage[],
  model: string = GROQ_MODELS.HEAVY,
  temperature: number = 0.5
): Promise<string> => {
  // Call the Supabase Edge Function
  const { data, error } = await supabase.functions.invoke('ai-chat', {
    body: {
      messages,
      model,
      temperature,
    }
  });

  if (error) {
    throw new Error(error.message || 'Failed to communicate with AI server');
  }

  if (data.error) {
    throw new Error(data.error);
  }

  return data.choices?.[0]?.message?.content || '';
};

export const generateSubjectiveMarkingScheme = async (
  messages: ChatMessage[],
  model: string = GROQ_MODELS.HEAVY
): Promise<string> => {
  return generateCompletion(messages, model, 0.3); // Lower temp for factual accuracy
};

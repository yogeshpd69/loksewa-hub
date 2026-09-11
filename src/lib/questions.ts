import { supabase } from './supabase';
import type { Question, QuestionCategory, Subcategory, Organization } from '../data/questions/types';

/** Fetch questions with optional filters and limit */
export async function fetchQuestions(filters?: {
  paper?: 'paper1' | 'paper2';
  category?: QuestionCategory;
  subcategory?: Subcategory | string;
  organization?: Organization;
  limit?: number;
}): Promise<Question[]> {
  let query = supabase.from('questions').select('id, category, subcategory, organization, question_text, options');

  if (filters) {
    if (filters.paper) query = query.eq('paper', filters.paper);
    if (filters.category) query = query.eq('category', filters.category);
    if (filters.subcategory) query = query.eq('subcategory', filters.subcategory);
    if (filters.organization) query = query.contains('organization', [filters.organization]);
    if (filters.limit) query = query.limit(filters.limit);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching questions:', error);
    return [];
  }

  // Map DB columns to our Question interface
  return (data || []).map(row => ({
    id: row.id,
    category: row.category,
    subcategory: row.subcategory,
    organization: row.organization,
    questionText: row.question_text,
    options: row.options || [],
  }));
}

/** Get count per subcategory (for Subjects page) */
export async function getSubcategoryCounts(): Promise<Record<string, number>> {
  // To avoid fetching all rows just to count, we can use Supabase RPC if we had one.
  // For now, in a small DB, we can just fetch category + subcategory columns and count locally,
  // or fetch summary if we create a view.
  // We'll fetch all subcategories and reduce them.
  const { data, error } = await supabase.from('questions').select('subcategory');
  if (error) return {};

  const counts: Record<string, number> = {};
  for (const row of data || []) {
    counts[row.subcategory] = (counts[row.subcategory] || 0) + 1;
  }
  return counts;
}

/** Get random questions for mock tests */
export async function fetchRandomQuestions(count: number, paper?: 'paper1' | 'paper2'): Promise<Question[]> {
  // Supabase doesn't have a native simple randomizer without a custom Postgres function.
  // Since we only have ~500 questions, we can fetch all IDs, pick random N, then fetch those rows.
  // If scaling to 10k+, we should use `order by random()` via RPC or Edge Function.
  let query = supabase.from('questions').select('id');
  if (paper) query = query.eq('paper', paper);
  
  const { data: idData } = await query;
  if (!idData || idData.length === 0) return [];

  // Shuffle and pick top `count`
  const shuffledIds = idData.map(r => r.id).sort(() => 0.5 - Math.random()).slice(0, count);

  const { data: qData } = await supabase.from('questions').select('id, category, subcategory, organization, question_text, options').in('id', shuffledIds);
  
  return (qData || []).map(row => ({
    id: row.id,
    category: row.category,
    subcategory: row.subcategory,
    organization: row.organization,
    questionText: row.question_text,
    options: row.options || [],
  })).sort(() => 0.5 - Math.random()); // Shuffle final result too
}

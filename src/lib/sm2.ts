import { supabase } from './supabase';
import type { Question } from '../data/questions/types';

// The interval for SM-2 given a repetition count
const getInterval = (repetitions: number, easeFactor: number): number => {
  if (repetitions === 1) return 1;
  if (repetitions === 2) return 6;
  return Math.round(6 * Math.pow(easeFactor, repetitions - 2));
};

export async function fetchPracticeQuestions(userId: string, count: number, subcategories: string[]): Promise<Question[]> {
  const today = new Date().toISOString().split('T')[0];

  // 1. Fetch due questions from SM-2 state
  let query = supabase
    .from('user_question_state')
    .select('question_id, questions!inner(id, category, subcategory, organization, question_text, options)')
    .eq('user_id', userId)
    .lte('next_review_date', today)
    .order('next_review_date', { ascending: true })
    .limit(count);

  if (subcategories.length > 0) {
    query = query.in('questions.subcategory', subcategories);
  }

  const { data: dueData, error: dueError } = await query;
  
  if (dueError) {
    console.error('Error fetching due questions:', dueError);
  }

  let questions: Question[] = [];
  let fetchedIds = new Set<string>();

  if (dueData) {
    dueData.forEach((row: any) => {
      const q = row.questions;
      if (q) {
        fetchedIds.add(q.id);
        questions.push({
          id: q.id,
          category: q.category,
          subcategory: q.subcategory,
          organization: q.organization,
          questionText: q.question_text,
          options: q.options || [],
        });
      }
    });
  }

  // 2. If we need more questions, fetch new ones that the user hasn't seen
  const remaining = count - questions.length;
  if (remaining > 0) {
    let newQuery = supabase
      .from('questions')
      .select('id, category, subcategory, organization, question_text, options')
      .limit(remaining * 3); // Fetch a buffer to filter out seen ones locally if needed, or use a left join

    if (subcategories.length > 0) {
      newQuery = newQuery.in('subcategory', subcategories);
    }

    const { data: newData, error: newError } = await newQuery;
    
    if (!newError && newData) {
      // Filter out ones we already fetched
      const fresh = newData.filter(q => !fetchedIds.has(q.id)).slice(0, remaining);
      
      const freshQuestions = fresh.map(q => ({
        id: q.id,
        category: q.category,
        subcategory: q.subcategory,
        organization: q.organization,
        questionText: q.question_text,
        options: q.options || [],
      }));
      
      questions = [...questions, ...freshQuestions];
    }
  }

  // Shuffle the final array
  return questions.sort(() => 0.5 - Math.random());
}

export async function submitAnswer(
  userId: string, 
  questionId: string, 
  isCorrect: boolean,
  selectedOption: number,
  timeTakenSeconds: number
) {
  // 1. Log the answer
  await supabase.from('user_answers').insert({
    user_id: userId,
    question_id: questionId,
    selected_option: selectedOption,
    is_correct: isCorrect,
    time_taken_seconds: timeTakenSeconds,
  });

  // 2. Calculate SM-2 update
  // First, fetch current state
  const { data: stateData } = await supabase
    .from('user_question_state')
    .select('*')
    .eq('user_id', userId)
    .eq('question_id', questionId)
    .maybeSingle();

  let easeFactor = 2.5;
  let intervalDays = 1;
  let repetitions = 0;

  if (stateData) {
    easeFactor = stateData.ease_factor;
    intervalDays = stateData.interval_days;
    repetitions = stateData.repetitions;
  }

  // SM-2 logic (simplified 0-5 quality based on correct/incorrect)
  // 5 = perfect response (correct, fast)
  // 3 = correct but took long (default for correct here)
  // 0 = complete blackout (incorrect)
  const quality = isCorrect ? (timeTakenSeconds < 10 ? 5 : 3) : 0;

  if (quality >= 3) {
    repetitions += 1;
    intervalDays = getInterval(repetitions, easeFactor);
  } else {
    repetitions = 0;
    intervalDays = 1;
  }

  easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + intervalDays);
  const nextReviewDate = nextDate.toISOString().split('T')[0];

  // Upsert state
  await supabase
    .from('user_question_state')
    .upsert({
      user_id: userId,
      question_id: questionId,
      ease_factor: easeFactor,
      interval_days: intervalDays,
      repetitions: repetitions,
      next_review_date: nextReviewDate,
    }, { onConflict: 'user_id, question_id' });
}

export async function submitFlashcardReview(
  userId: string,
  questionId: string,
  quality: number // 0-5 SM2 quality
) {
  // Fetch current state
  const { data: stateData } = await supabase
    .from('user_question_state')
    .select('*')
    .eq('user_id', userId)
    .eq('question_id', questionId)
    .maybeSingle();

  let easeFactor = 2.5;
  let intervalDays = 1;
  let repetitions = 0;

  if (stateData) {
    easeFactor = stateData.ease_factor;
    intervalDays = stateData.interval_days;
    repetitions = stateData.repetitions;
  }

  if (quality >= 3) {
    repetitions += 1;
    intervalDays = getInterval(repetitions, easeFactor);
  } else {
    repetitions = 0;
    intervalDays = 1;
  }

  easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + intervalDays);
  const nextReviewDate = nextDate.toISOString().split('T')[0];

  // Upsert state
  await supabase
    .from('user_question_state')
    .upsert({
      user_id: userId,
      question_id: questionId,
      ease_factor: easeFactor,
      interval_days: intervalDays,
      repetitions: repetitions,
      next_review_date: nextReviewDate,
    }, { onConflict: 'user_id, question_id' });
}

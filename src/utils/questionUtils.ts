import type { Question } from '../data/questions/types';

/**
 * Fisher-Yates shuffle — produces a new shuffled array without mutating original.
 */
export function shuffle<T>(array: T[]): T[] {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Return a copy of the question with its options shuffled.
 * The correctAnswerIndex is updated to track the new position.
 */
export function shuffleOptions(q: Question): Question {
  const correctOption = q.options[q.correctAnswerIndex];
  const shuffled = shuffle(q.options);
  return {
    ...q,
    options: shuffled,
    correctAnswerIndex: shuffled.indexOf(correctOption),
  };
}

/**
 * Shuffle both the question order AND each question's option order.
 * Returns a fresh array — safe to call on every render/mount.
 */
export function prepareQuestions(questions: Question[]): Question[] {
  return shuffle(questions).map(shuffleOptions);
}

/**
 * Pick `count` random questions from a pool, shuffled with randomized options.
 */
export function pickRandom(questions: Question[], count: number): Question[] {
  const shuffled = shuffle(questions);
  return shuffled.slice(0, Math.min(count, shuffled.length)).map(shuffleOptions);
}

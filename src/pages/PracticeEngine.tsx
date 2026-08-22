import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle, Flame, Trophy, Info, ChevronRight, RotateCcw } from 'lucide-react';
import type { Question } from '../data/questions/types';
import { useAuth } from '../context/AuthContext';
import { fetchPracticeQuestions, submitAnswer } from '../lib/sm2';
import { incrementStreakAndTests, addXP } from '../lib/profile';
import { QuestionSkeleton } from '../components/ui/Skeleton';

const PracticeEngine: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const subsParam = searchParams.get('subs');
  const activeSubs = subsParam ? subsParam.split(',') : [];

  const countParam = parseInt(searchParams.get('count') || '20', 10);
  const { user, isGuest, refreshProfile, profile } = useAuth();

  // Engine state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Gamification & Tracking
  const [xp, setXp] = useState(profile?.xp || 0);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [animatingXp, setAnimatingXp] = useState(false);
  
  // Timer for answer quality calculation
  const questionStartTimeRef = useRef<number>(Date.now());

  // Load questions using SM-2 (or fallback for guest)
  const loadQuestions = useCallback(async () => {
    setIsLoading(true);
    
    if (user && !isGuest) {
      const q = await fetchPracticeQuestions(user.id, countParam, activeSubs);
      setQuestions(q);
    } else {
      // Guest mode: just fetch random from the lib we made earlier
      // We import it dynamically to avoid circular dependencies if any
      const { fetchRandomQuestions } = await import('../lib/questions');
      const q = await fetchRandomQuestions(countParam);
      // If activeSubs is set, we'd normally filter, but fetchRandomQuestions doesn't support it directly.
      // For simplicity in guest mode, just use what we get or we could use fetchQuestions.
      setQuestions(q);
    }

    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setCorrect(0);
    setTotal(0);
    setIsLoading(false);
    questionStartTimeRef.current = Date.now();
  }, [subsParam, countParam, user, isGuest]);

  useEffect(() => { loadQuestions(); }, [loadQuestions]);

  const currentQuestion = questions[currentIndex];

  const handleOptionClick = async (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);
    setTotal(prev => prev + 1);
    
    const timeTakenSeconds = Math.floor((Date.now() - questionStartTimeRef.current) / 1000);
    const isCorrect = index === currentQuestion.correctAnswerIndex;
    
    if (isCorrect) {
      setCorrect(prev => prev + 1);
      setXp(prev => prev + 10);
      setAnimatingXp(true);
      setTimeout(() => setAnimatingXp(false), 800);
    }
    
    // Submit answer to Supabase for SM-2 state update
    if (user && !isGuest) {
      await submitAnswer(user.id, currentQuestion.id, isCorrect, index, timeTakenSeconds);
    }
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      questionStartTimeRef.current = Date.now();
    } else {
      // Completed the set, increment streak and tests
      if (user && !isGuest) {
        await incrementStreakAndTests(user.id);
        if (correct > 0) {
          await addXP(user.id, correct * 10);
        }
        if (refreshProfile) await refreshProfile();
      }
      loadQuestions(); // Reshuffle and restart
    }
  };

  if (isLoading || !currentQuestion) {
    return (
      <div className="flex-1 flex flex-col h-full">
        <QuestionSkeleton />
      </div>
    );
  }

  const isCorrectAnswer = selectedOption === currentQuestion.correctAnswerIndex;

  return (
    <div className="max-w-3xl mx-auto py-4 pb-24 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate('/practice')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-gray-500 flex items-center gap-2">
          <ArrowLeft size={22} />
          <span className="text-sm font-bold hidden sm:inline">Exit</span>
        </button>
        <div className="flex-1 mx-4 relative">
          <div className="h-2.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-500 ease-out rounded-full" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
          </div>
          <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[11px] font-bold text-gray-400">{currentIndex + 1} / {questions.length}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 px-2.5 py-1 bg-orange-50 dark:bg-orange-500/10 text-orange-500 rounded-lg font-bold text-xs">
            <Flame size={14} className="fill-orange-500" />{correct}/{total}
          </div>
          <div className={`flex items-center gap-1 px-2.5 py-1 bg-accent/10 text-accent rounded-lg font-bold text-xs transition-transform duration-300 ${animatingXp ? 'scale-125' : ''}`}>
            <Trophy size={14} />{xp} XP
          </div>
          <button onClick={loadQuestions} title="Reshuffle" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-400">
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Active Topics Summary */}
      <div className="mb-6 flex flex-wrap gap-2">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider self-center mr-2">Practicing:</span>
        {activeSubs.map(sub => (
          <span key={sub} className="px-2.5 py-1 bg-primary/10 text-primary rounded-lg text-xs font-bold">
            {sub.replace('bct-', '').replace('bei-', '').replace('-', ' ')}
          </span>
        ))}
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col">
        <h2 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white leading-relaxed mb-5">
          {currentQuestion.questionText}
        </h2>
        <div className="space-y-2.5">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedOption === index;
            const isCorrectOpt = index === currentQuestion.correctAnswerIndex;
            let style = 'bg-white dark:bg-dark-surface border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-primary hover:bg-primary/5';
            if (isAnswered) {
              if (isCorrectOpt) style = 'bg-success/10 border-success text-success dark:bg-success/20';
              else if (isSelected) style = 'bg-danger/10 border-danger text-danger dark:bg-danger/20';
              else style = 'bg-white dark:bg-dark-surface border-gray-100 dark:border-gray-800 text-gray-400 opacity-50';
            }
            return (
              <button key={index} onClick={() => handleOptionClick(index)} disabled={isAnswered}
                className={`w-full p-3.5 rounded-xl border-2 text-left text-[15px] font-medium transition-all duration-200 flex items-center justify-between ${style}`}>
                <span>{option}</span>
                {isAnswered && isCorrectOpt && <CheckCircle2 size={20} className="text-success shrink-0 ml-3" />}
                {isAnswered && isSelected && !isCorrectOpt && <XCircle size={20} className="text-danger shrink-0 ml-3" />}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {isAnswered && (
          <div className={`mt-6 p-5 rounded-xl border-2 ${isCorrectAnswer ? 'bg-success/5 border-success/30' : 'bg-danger/5 border-danger/30'}`}>
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 rounded-full p-1 ${isCorrectAnswer ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                {isCorrectAnswer ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
              </div>
              <div className="flex-1">
                <h3 className={`text-base font-bold mb-1.5 ${isCorrectAnswer ? 'text-success' : 'text-danger'}`}>
                  {isCorrectAnswer ? 'Correct!' : 'Incorrect'}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
                  <span className="font-bold flex items-center gap-1 mb-1"><Info size={14} className="text-primary" /> Explanation:</span>
                  {currentQuestion.explanation}
                </p>
                <button onClick={handleNext}
                  className="w-full sm:w-auto px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl shadow-sm hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 text-sm">
                  {currentIndex < questions.length - 1 ? 'Next Question' : 'Reshuffle & Continue'}
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PracticeEngine;

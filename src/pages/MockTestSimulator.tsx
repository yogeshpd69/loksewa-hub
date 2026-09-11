import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Clock, Flag, ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { useOrganization } from '../context/OrganizationContext';
import { useAuth } from '../context/AuthContext';
// Gamification is handled in RPC
import type { Question } from '../data/questions/types';
import { fetchRandomQuestions } from '../lib/questions';
import { supabase } from '../lib/supabase';
import SubjectiveReview from '../components/ui/SubjectiveReview';

const MockTestSimulator: React.FC = () => {
  const { user, isGuest, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { activeOrganization, activeSpecialization } = useOrganization();
  
  const testType = searchParams.get('type') || 'mcq';
  const qCountParam = parseInt(searchParams.get('count') || '50', 10);
  const paperParam = searchParams.get('paper') || 'Paper II';

  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set());
  const [testResult, setTestResult] = useState<{ score: number, correct: number, wrong: number, unanswered: number, xpAdded: number, review: any[] } | null>(null);
  
  // MCQ = (count/50)*45 mins, Subjective = 3 hours (10800s)
  const initialTime = testType === 'subjective' ? 10800 : Math.floor((qCountParam / 50) * 45) * 60;
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Generate exam on mount
  useEffect(() => {
    const loadQuestions = async () => {
      if (testType === 'mcq') {
        const questions = await fetchRandomQuestions(qCountParam, 'paper1');
        setExamQuestions(questions);
      } else {
        // Mock subjective questions (normally fetched from a DB/file)
        const mockSubjective: Question[] = Array.from({ length: 10 }).map((_, i) => ({
          id: `subj-${i}`,
          category: 'BCT',
          subcategory: 'bct-os',
          organization: ['ALL'],
          questionText: `Q${i + 1}. Explain the core concepts in detail for this topic. (10 Marks)`,
          options: [],
          correctAnswerIndex: -1,
          explanation: 'Expected Answer: Must cover introduction, main features (at least 5 points), block diagram, and conclusion.'
        }));
        setExamQuestions(mockSubjective);
      }
    };
    loadQuestions();
  }, [activeOrganization, activeSpecialization, testType, qCountParam]);

  // Timer
  useEffect(() => {
    if (isSubmitted || examQuestions.length === 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { if (timerRef.current) clearInterval(timerRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isSubmitted, examQuestions.length]);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (optIndex: number) => {
    if (isSubmitted) return;
    setAnswers(prev => ({ ...prev, [currentIndex]: optIndex }));
  };

  const toggleMarkForReview = () => {
    setMarkedForReview(prev => {
      const s = new Set(prev);
      s.has(currentIndex) ? s.delete(currentIndex) : s.add(currentIndex);
      return s;
    });
  };

  const handleSubmit = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    if (testType === 'mcq') {
      let mappedAnswers: Record<string, number> = {};
      for (const [idx, ans] of Object.entries(answers)) {
        mappedAnswers[examQuestions[Number(idx)].id] = ans;
      }
      const qIds = examQuestions.map(q => q.id);
      
      const userId = user && !isGuest ? user.id : '00000000-0000-0000-0000-000000000000';
      
      const { data, error } = await supabase.rpc('grade_mock_test', {
        p_user_id: userId,
        p_answers: mappedAnswers,
        p_question_ids: qIds
      });
      
      if (error) {
        console.error("Grading failed:", error);
      } else {
        setTestResult(data);
      }
    }
    
    if (user && !isGuest && refreshProfile) {
      await refreshProfile();
    }
    setIsSubmitted(true);
  };

  const currentQuestion = examQuestions[currentIndex];

  if (examQuestions.length === 0) {
    return <div className="flex-1 flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  // --- SUBJECTIVE POST-SUBMIT REVIEW ---
  if (isSubmitted && testType === 'subjective') {
    return (
      <SubjectiveReview 
        questions={examQuestions} 
        onFinish={() => navigate('/mock-tests')} 
      />
    );
  }

  // --- MCQ POST-SUBMIT REVIEW ---
  if (isSubmitted && showReview && testResult) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <button onClick={() => setShowReview(false)} className="mb-6 font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white">← Back to Score</button>
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-6">Detailed Review</h2>
        <div className="space-y-6">
          {testResult.review.map((item: any, idx: number) => {
            const userAns = item.selected;
            const isCorrect = userAns === item.correct;
            const options = item.options || [];
            return (
              <div key={idx} className={`p-6 rounded-2xl border-2 ${isCorrect ? 'bg-success/5 border-success/30' : (userAns === null ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700' : 'bg-danger/5 border-danger/30')}`}>
                <h3 className="font-bold text-gray-900 dark:text-white mb-4"><span className="text-gray-400 mr-2">Q{idx+1}.</span>{examQuestions[idx]?.questionText || "Question text unavailable"}</h3>
                <div className="space-y-2 mb-4">
                  {options.map((opt: string, oIdx: number) => (
                    <div key={oIdx} className={`px-4 py-2 rounded-lg text-sm flex items-center justify-between border ${oIdx === item.correct ? 'bg-success/10 border-success text-success font-bold' : (userAns === oIdx ? 'bg-danger/10 border-danger text-danger' : 'border-transparent text-gray-500')}`}>
                      <span>{opt}</span>
                      {oIdx === item.correct && <CheckCircle2 size={16} />}
                      {userAns === oIdx && oIdx !== item.correct && <XCircle size={16} />}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-dark-surface p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                  <span className="font-bold text-gray-900 dark:text-white block mb-1">Explanation:</span>
                  {item.explanation || "No explanation provided."}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // --- MCQ SCORE SCREEN ---
  if (isSubmitted && testType === 'mcq' && testResult) {
    const { correct, wrong, unanswered, score } = testResult;
    return (
      <div className="max-w-lg mx-auto py-12 flex flex-col items-center text-center">
        <CheckCircle2 size={56} className="text-success mb-4" />
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Test Submitted!</h2>
        <p className="text-gray-500 mb-8">Here are your results</p>
        <div className="w-full grid grid-cols-2 gap-4 mb-8">
          <div className="bg-success/10 p-4 rounded-2xl"><div className="text-2xl font-extrabold text-success">{correct}</div><div className="text-xs text-gray-500 font-bold">Correct</div></div>
          <div className="bg-danger/10 p-4 rounded-2xl"><div className="text-2xl font-extrabold text-danger">{wrong}</div><div className="text-xs text-gray-500 font-bold">Wrong</div></div>
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-2xl"><div className="text-2xl font-extrabold text-gray-600 dark:text-gray-300">{unanswered}</div><div className="text-xs text-gray-500 font-bold">Unanswered</div></div>
          <div className="bg-primary/10 p-4 rounded-2xl"><div className="text-2xl font-extrabold text-primary">{Number(score).toFixed(1)}</div><div className="text-xs text-gray-500 font-bold">Final Score</div></div>
        </div>
        <div className="flex gap-4 w-full">
          <button onClick={() => navigate('/mock-tests')} className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Done</button>
          <button onClick={() => setShowReview(true)} className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors">Review Answers</button>
        </div>
      </div>
    );
  }

  // --- EXAM RUNNING ---
  return (
    <div className="flex flex-col lg:flex-row gap-4 max-w-7xl mx-auto h-[calc(100vh-8rem)]">
      {/* Main */}
      <div className="flex-1 flex flex-col bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-900/50">
          <div>
            <h1 className="text-base font-bold text-gray-900 dark:text-white">{testType === 'mcq' ? 'Paper I Mock Test' : `${paperParam} Subjective Test`}</h1>
            <p className="text-xs text-gray-500">{testType === 'mcq' ? 'Negative marking: 20%' : 'Self-Evaluation Mode'} | {examQuestions.length} Questions</p>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-sm ${timeLeft < 300 ? 'bg-danger/10 text-danger animate-pulse' : 'bg-primary/10 text-primary'}`}>
            <Clock size={16} /><span className="tabular-nums">{formatTime(timeLeft)}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <span className="text-xs font-bold text-primary mb-2 block">Q{currentIndex + 1} of {examQuestions.length}</span>
          <h2 className="text-base font-bold text-gray-900 dark:text-white leading-relaxed mb-4 whitespace-pre-line">{currentQuestion.questionText}</h2>
          
          {testType === 'mcq' ? (
            <div className="space-y-2">
              {currentQuestion.options.map((opt, idx) => {
                const sel = answers[currentIndex] === idx;
                return (
                  <button key={idx} onClick={() => handleSelectOption(idx)}
                    className={`w-full p-3 rounded-xl border-2 text-left text-sm transition-colors flex items-center gap-3 ${sel ? 'border-primary bg-primary/5 text-primary font-bold' : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300'}`}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${sel ? 'border-primary' : 'border-gray-300 dark:border-gray-600'}`}>
                      {sel && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                    </div>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-6 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-400 text-sm text-center">
              Write your answer on a physical piece of paper. You will be able to verify key points after submission.
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between">
          <button onClick={toggleMarkForReview}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${markedForReview.has(currentIndex) ? 'bg-orange-500/10 text-orange-500' : 'bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 text-gray-500'}`}>
            <Flag size={14} className={markedForReview.has(currentIndex) ? 'fill-orange-500' : ''} />
            {markedForReview.has(currentIndex) ? 'Marked' : 'Mark'}
          </button>
          <div className="flex gap-2">
            <button disabled={currentIndex === 0} onClick={() => setCurrentIndex(p => p - 1)} className="px-3 py-2 text-xs font-bold bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-40 flex items-center gap-1"><ChevronLeft size={14} />Prev</button>
            <button disabled={currentIndex >= examQuestions.length - 1} onClick={() => setCurrentIndex(p => p + 1)} className="px-3 py-2 text-xs font-bold bg-primary text-white rounded-lg disabled:opacity-40 flex items-center gap-1">Next<ChevronRight size={14} /></button>
          </div>
        </div>
      </div>

      {/* Palette */}
      <div className="w-full lg:w-[240px] bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col shrink-0">
        <div className="p-3 border-b border-gray-100 dark:border-gray-800 text-sm font-bold text-gray-900 dark:text-white">Palette</div>
        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
          <div className="grid grid-cols-5 gap-1.5">
            {examQuestions.map((_, idx) => {
              const a = testType === 'mcq' ? answers[idx] !== undefined : false; // Subjective has no 'answered' state in UI
              const m = markedForReview.has(idx);
              const cur = currentIndex === idx;
              let cls = 'bg-gray-100 dark:bg-gray-800 text-gray-500';
              if (a && !m) cls = 'bg-success text-white';
              if (m) cls = a ? 'bg-orange-500 text-white' : 'bg-orange-500/20 text-orange-500';
              if (cur) cls += ' ring-2 ring-primary ring-offset-1 dark:ring-offset-dark-surface';
              return <button key={idx} onClick={() => setCurrentIndex(idx)} className={`aspect-square rounded-md flex items-center justify-center text-[11px] font-bold ${cls} transition-all hover:scale-105`}>{idx + 1}</button>;
            })}
          </div>
        </div>
        <div className="p-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 space-y-3">
          <div className="grid grid-cols-2 gap-1.5 text-[10px] text-gray-500">
            {testType === 'mcq' && <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-success" />Answered</div>}
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-gray-200 dark:bg-gray-700" />Unanswered</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-orange-500" />Marked</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-primary" />Current</div>
          </div>
          <button onClick={() => { if (confirm('Submit exam?')) handleSubmit(); }}
            className="w-full py-2.5 bg-danger text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-1.5">
            <AlertTriangle size={14} />Submit Exam
          </button>
        </div>
      </div>
    </div>
  );
};

export default MockTestSimulator;

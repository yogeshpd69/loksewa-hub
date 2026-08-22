import React, { useState, useEffect, useCallback } from 'react';
import { RotateCw, Lightbulb, Zap, Smile, Brain, Frown, SkipForward, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useOrganization } from '../context/OrganizationContext';
import { fetchPracticeQuestions, submitFlashcardReview } from '../lib/sm2';
import { GK_SUBCATEGORIES, IQ_SUBCATEGORIES, BCT_SUBCATEGORIES, BEI_SUBCATEGORIES } from '../data/questions/types';
import type { Question } from '../data/questions/types';
import { QuestionSkeleton } from '../components/ui/Skeleton';

const Flashcards: React.FC = () => {
  const { user, isGuest } = useAuth();
  const { activeSpecialization } = useOrganization();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [showDropdown, setShowDropdown] = useState(false);

  // Get available topics based on specialization
  const availableTopics = [
    { id: 'all', label: 'All Topics (Mix)' },
    ...GK_SUBCATEGORIES,
    ...IQ_SUBCATEGORIES,
    ...(activeSpecialization === 'BCT' || activeSpecialization === 'General' ? BCT_SUBCATEGORIES : []),
    ...(activeSpecialization === 'BEI' || activeSpecialization === 'General' ? BEI_SUBCATEGORIES : []),
  ];

  const loadCards = useCallback(async (forceRefresh = false, topic = 'all') => {
    setLoading(true);
    
    if (!forceRefresh) {
      // Try to load from session storage
      const savedQ = sessionStorage.getItem(`loksewa_fc_questions_${topic}`);
      const savedIdx = sessionStorage.getItem(`loksewa_fc_index_${topic}`);
      if (savedQ && savedIdx) {
        setQuestions(JSON.parse(savedQ));
        setCurrentIndex(parseInt(savedIdx));
        setIsFlipped(false);
        setLoading(false);
        return;
      }
    }

    const topicsToFetch = topic === 'all' ? [] : [topic];

    if (user && !isGuest) {
      const q = await fetchPracticeQuestions(user.id, 20, topicsToFetch);
      setQuestions(q);
      sessionStorage.setItem(`loksewa_fc_questions_${topic}`, JSON.stringify(q));
    } else {
      const { fetchRandomQuestions } = await import('../lib/questions');
      const q = await fetchRandomQuestions(20);
      setQuestions(q);
      sessionStorage.setItem(`loksewa_fc_questions_${topic}`, JSON.stringify(q));
    }
    setCurrentIndex(0);
    sessionStorage.setItem(`loksewa_fc_index_${topic}`, '0');
    setIsFlipped(false);
    setLoading(false);
  }, [user, isGuest]);

  useEffect(() => {
    loadCards(false, selectedTopic);
  }, [loadCards, selectedTopic]);

  const handleReview = async (quality: number) => {
    const currentQ = questions[currentIndex];
    if (user && !isGuest && currentQ) {
      await submitFlashcardReview(user.id, currentQ.id, quality);
    }
    
    setIsFlipped(false);
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        const nextIdx = currentIndex + 1;
        setCurrentIndex(nextIdx);
        sessionStorage.setItem(`loksewa_fc_index_${selectedTopic}`, nextIdx.toString());
      } else {
        loadCards(true, selectedTopic); // load next batch
      }
    }, 150);
  };

  const handleTopicChange = (id: string) => {
    setSelectedTopic(id);
    setShowDropdown(false);
  };

  const currentQuestion = questions[currentIndex];

  if (loading || !currentQuestion) {
    return (
      <div className="max-w-4xl mx-auto pb-24 px-4 flex flex-col items-center">
         <div className="w-full max-w-md aspect-[3/4] mt-10">
           <QuestionSkeleton />
         </div>
      </div>
    );
  }

  const progress = ((currentIndex) / questions.length) * 100;

  // Find correct answer text
  const correctAnswerText = currentQuestion.options && currentQuestion.correctAnswerIndex !== undefined
    ? currentQuestion.options[currentQuestion.correctAnswerIndex]
    : currentQuestion.explanation || "No explanation provided.";

  const activeTopicLabel = availableTopics.find(t => t.id === selectedTopic)?.label || 'All Topics';

  return (
    <div className="max-w-4xl mx-auto pb-24 px-4 flex flex-col items-center">
      <div className="text-center mb-6 w-full">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-2">
          <Zap className="text-orange-500 fill-orange-500" /> Topic Mastery
        </h1>
        <p className="text-gray-500 text-sm mb-4">Spaced repetition flashcards based on your performance.</p>
        
        {/* Topic Filter Dropdown */}
        <div className="relative inline-block text-left max-w-xs w-full mb-2 z-20">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center justify-between w-full px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none"
          >
            <span className="truncate">{activeTopicLabel}</span>
            <ChevronDown size={16} className="ml-2 shrink-0" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 w-full mt-2 origin-top-right bg-white dark:bg-dark-surface border border-gray-100 dark:border-gray-800 rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none max-h-60 overflow-y-auto custom-scrollbar">
              <div className="py-1">
                {availableTopics.map(topic => (
                  <button
                    key={topic.id}
                    onClick={() => handleTopicChange(topic.id)}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      selectedTopic === topic.id
                        ? 'bg-primary/10 text-primary font-bold'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {topic.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Progress Bar */}
        <div className="w-full max-w-md mx-auto mt-2">
          <div className="flex justify-between text-xs font-bold text-gray-400 mb-2">
            <span>Session Progress</span>
            <span className="text-primary">{currentIndex} / {questions.length}</span>
          </div>
          <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Card Container */}
      <div className="relative w-full max-w-md aspect-[3/4] perspective-1000 mb-8 z-10">
        <div 
          onClick={() => !isFlipped && setIsFlipped(true)}
          className={`w-full h-full relative preserve-3d transition-transform duration-500 cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
        >
          {/* Front */}
          <div className="absolute inset-0 backface-hidden bg-white dark:bg-dark-surface border-2 border-gray-100 dark:border-gray-800 rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 text-center">
            <div className="absolute top-6 left-6 text-gray-300 dark:text-gray-700">
              <Lightbulb size={32} />
            </div>
            <span className="absolute top-6 right-6 text-[10px] font-bold text-primary uppercase bg-primary/10 px-2 py-1 rounded-md">
              {currentQuestion.subcategory.replace('bct-', '').replace('bei-', '')}
            </span>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-relaxed">
              {currentQuestion.questionText}
            </h3>
            <div className="absolute bottom-6 flex flex-col items-center text-gray-400 gap-2 opacity-50">
              <RotateCw size={24} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Tap to flip</span>
            </div>
          </div>

          {/* Back */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-primary/5 dark:bg-primary/10 border-2 border-primary/20 rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 text-center overflow-y-auto custom-scrollbar">
            <h3 className="text-xl font-bold text-primary leading-relaxed mb-4">
              {correctAnswerText}
            </h3>
            {currentQuestion.explanation && currentQuestion.options && (
              <p className="text-sm text-gray-600 dark:text-gray-400 border-t border-primary/10 pt-4 mt-2 w-full">
                {currentQuestion.explanation}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      {isFlipped && (
        <div className="w-full max-w-md flex justify-between gap-2 z-10">
          <button 
            onClick={(e) => { e.stopPropagation(); handleReview(1); }}
            className="flex-1 flex flex-col items-center justify-center p-3 bg-danger/10 text-danger rounded-xl hover:bg-danger/20 transition-colors"
          >
            <Frown size={24} className="mb-1" />
            <span className="text-xs font-bold uppercase tracking-wider">Again (1)</span>
          </button>
          
          <button 
            onClick={(e) => { e.stopPropagation(); handleReview(3); }}
            className="flex-1 flex flex-col items-center justify-center p-3 bg-orange-500/10 text-orange-500 rounded-xl hover:bg-orange-500/20 transition-colors"
          >
            <Brain size={24} className="mb-1" />
            <span className="text-xs font-bold uppercase tracking-wider">Hard (3)</span>
          </button>
          
          <button 
            onClick={(e) => { e.stopPropagation(); handleReview(4); }}
            className="flex-1 flex flex-col items-center justify-center p-3 bg-success/10 text-success rounded-xl hover:bg-success/20 transition-colors"
          >
            <Smile size={24} className="mb-1" />
            <span className="text-xs font-bold uppercase tracking-wider">Good (4)</span>
          </button>

          <button 
            onClick={(e) => { e.stopPropagation(); handleReview(5); }}
            className="flex-1 flex flex-col items-center justify-center p-3 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-colors"
          >
            <SkipForward size={24} className="mb-1" />
            <span className="text-xs font-bold uppercase tracking-wider">Easy (5)</span>
          </button>
        </div>
      )}

      {/* CSS for 3D flip */}
      <style dangerouslySetInnerHTML={{__html: `
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}} />
    </div>
  );
};

export default Flashcards;

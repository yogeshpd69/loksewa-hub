import React, { useState } from 'react';
import { generateCompletion } from '../../utils/groqClient';
import type { ChatMessage } from '../../utils/groqClient';
import { Bot, Send, User, Sparkles, Loader2, AlertTriangle, AlertCircle } from 'lucide-react';
import type { Question } from '../../data/questions/types';

interface SubjectiveReviewProps {
  questions: Question[];
  onFinish: () => void;
}

const SubjectiveReview: React.FC<SubjectiveReviewProps> = ({ questions, onFinish }) => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="text-primary" />
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">AI-Powered Self-Evaluation</h2>
      </div>
      <div className="bg-orange-50 dark:bg-orange-500/10 p-4 rounded-xl mb-8 flex gap-3 text-sm text-orange-800 dark:text-orange-300">
        <AlertCircle className="shrink-0 mt-0.5" size={18} />
        <div>
          <p className="font-bold mb-1">Important Liability Notice:</p>
          <p>
            AI models can occasionally hallucinate or provide incorrect information. 
            The writing schemes generated below are meant to serve as a <strong>guideline</strong> and a study aid, not as a definitive grading rubric. 
            Always cross-reference with official Loksewa materials or textbooks.
          </p>
        </div>
      </div>
      
      <div className="space-y-8">
        {questions.map((q, idx) => (
          <QuestionReview key={q.id} question={q} index={idx} />
        ))}
      </div>
      
      <button 
        onClick={onFinish} 
        className="mt-8 w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary-hover transition-colors"
      >
        Finish Review
      </button>
    </div>
  );
};

const QuestionReview: React.FC<{ question: Question, index: number }> = ({ question, index }) => {
  const [idealAnswer, setIdealAnswer] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);

  const handleGenerateAnswer = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const prompt: ChatMessage[] = [
        {
          role: 'system',
          content: 'You are an expert examiner for the Nepal Public Service Commission (Loksewa). Given a subjective question, provide a structured, highly accurate, and point-wise ideal answer (writing scheme) that would score maximum marks. Be concise but comprehensive. Format in markdown.'
        },
        {
          role: 'user',
          content: question.questionText
        }
      ];
      const answer = await generateCompletion(prompt);
      setIdealAnswer(answer);
      setChatHistory([
        ...prompt,
        { role: 'assistant', content: answer }
      ]);
    } catch (err: any) {
      setError(err.message || 'Failed to generate answer. Check your Groq API key in settings.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatInput('');
    setIsChatting(true);

    const newHistory: ChatMessage[] = [
      ...chatHistory,
      { role: 'user', content: userMsg }
    ];
    setChatHistory(newHistory);

    try {
      const reply = await generateCompletion(newHistory);
      setChatHistory([...newHistory, { role: 'assistant', content: reply }]);
    } catch (err: any) {
      // Just push error as a system message for UI
      setChatHistory([...newHistory, { role: 'assistant', content: `**Error:** ${err.message}` }]);
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
      <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-lg">
        <span className="text-gray-400 mr-2">Q{index + 1}.</span>
        {question.questionText}
      </h3>

      {!idealAnswer && !isGenerating && !error && (
        <button 
          onClick={handleGenerateAnswer}
          className="px-5 py-2.5 bg-primary/10 text-primary font-bold rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-2 text-sm"
        >
          <Bot size={18} /> Generate Ideal Answer Scheme
        </button>
      )}

      {isGenerating && (
        <div className="flex items-center gap-3 text-primary text-sm font-bold bg-primary/5 p-4 rounded-xl">
          <Loader2 className="animate-spin" size={18} /> AI is thinking...
        </div>
      )}

      {error && (
        <div className="bg-danger/10 text-danger p-4 rounded-xl text-sm flex flex-col gap-2">
          <div className="flex items-center gap-2 font-bold"><AlertTriangle size={18} /> Generation Failed</div>
          <p>{error}</p>
          <button onClick={handleGenerateAnswer} className="self-start underline font-bold mt-1">Try Again</button>
        </div>
      )}

      {idealAnswer && (
        <div className="mt-4">
          <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 p-5 rounded-xl text-sm text-gray-700 dark:text-gray-300 prose dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: idealAnswer.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
          </div>

          {/* AI Chat section */}
          <div className="mt-6 border-t border-gray-100 dark:border-gray-800 pt-6">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Bot size={16} className="text-primary" /> Ask AI about this question
            </h4>
            
            {/* Chat History */}
            {chatHistory.length > 2 && (
              <div className="space-y-4 mb-4 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                {chatHistory.slice(2).map((msg, i) => (
                  <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-gray-200 dark:bg-gray-700' : 'bg-primary/20 text-primary'}`}>
                      {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div className={`px-4 py-2 rounded-2xl max-w-[85%] text-sm ${msg.role === 'user' ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-tr-sm' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-tl-sm'}`}>
                      <div dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                    </div>
                  </div>
                ))}
                {isChatting && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0"><Bot size={16} /></div>
                    <div className="px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm"><Loader2 size={16} className="animate-spin text-gray-400" /></div>
                  </div>
                )}
              </div>
            )}

            {/* Chat Input */}
            <div className="flex gap-2">
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="E.g., I wrote about X, is that valid for 2 marks?"
                className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
              />
              <button 
                onClick={handleSendMessage}
                disabled={!chatInput.trim() || isChatting}
                className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shrink-0 disabled:opacity-50 hover:bg-primary-hover transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectiveReview;

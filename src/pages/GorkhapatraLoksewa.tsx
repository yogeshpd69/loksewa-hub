import React, { useState, useEffect } from 'react';
import { Newspaper, Calendar, ChevronDown, Loader2, BookOpen, Brain, Wand2, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LoksewaEntry {
  id: string;
  title: string;
  content: string;
  article_type: 'objective' | 'subjective';
  published_date: string;
}

const GorkhapatraLoksewa: React.FC = () => {
  const [entries, setEntries] = useState<LoksewaEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  const [generatingAi, setGeneratingAi] = useState<Record<string, boolean>>({});
  const [aiResults, setAiResults] = useState<Record<string, { type: string, payload: any } | null>>({});

  const handleGenerateAI = async (entry: LoksewaEntry) => {
    setGeneratingAi(prev => ({ ...prev, [entry.id]: true }));
    try {
      const { data, error } = await supabase.functions.invoke('generate-mcq', {
        body: { articleId: entry.id, articleType: entry.article_type, content: entry.content }
      });
      
      if (error) {
        alert("Server error: " + error.message);
      } else if (data?.error) {
        alert(data.error);
      } else if (data?.data) {
        setAiResults(prev => ({ ...prev, [entry.id]: { type: entry.article_type, payload: data.data } }));
      }
    } catch (err: any) {
      alert("Network error. Could not connect to AI services.");
    } finally {
      setGeneratingAi(prev => ({ ...prev, [entry.id]: false }));
    }
  };

  useEffect(() => {
    const fetchEntries = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('loksewa_bishesh')
        .select('*')
        .order('published_date', { ascending: false });

      if (error) {
        console.error('Error fetching loksewa bishesh:', error);
      } else if (data) {
        setEntries(data as LoksewaEntry[]);
      }
      setLoading(false);
    };

    fetchEntries();
  }, []);

  // Group by date
  const groupedEntries = entries.reduce((acc, entry) => {
    if (!acc[entry.published_date]) {
      acc[entry.published_date] = [];
    }
    acc[entry.published_date].push(entry);
    return acc;
  }, {} as Record<string, LoksewaEntry[]>);

  const dates = Object.keys(groupedEntries).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const toggleDate = (date: string) => {
    setExpandedDate(prev => prev === date ? null : date);
  };

  return (
    <div className="max-w-4xl mx-auto pb-24 px-4 sm:px-6">
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 flex items-center justify-center sm:justify-start gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
            <Newspaper className="text-primary w-6 h-6" />
          </div>
          Gorkhapatra Loksewa
        </h1>
        <p className="text-gray-500 text-lg">Weekly study materials curated from Gorkhapatra's Wednesday and Saturday editions.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : entries.length === 0 ? (
        <div className="bg-white dark:bg-dark-surface rounded-3xl p-12 text-center shadow-xl border border-gray-100 dark:border-gray-800">
          <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Content Yet</h2>
          <p className="text-gray-500 max-w-sm mx-auto">
            Our autonomous agent is currently resting. It will automatically fetch the latest Gorkhapatra materials once the daily sync runs!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {dates.map((date, index) => (
            <div key={date} className="bg-white dark:bg-dark-surface rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden text-left transition-all duration-200">
              <button 
                onClick={() => toggleDate(date)}
                className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors focus:outline-none focus:ring-inset focus:ring-2 focus:ring-primary/20"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Calendar className="text-primary w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-extrabold text-lg text-gray-900 dark:text-white">
                      {new Date(date).toLocaleDateString('ne-NP', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <div className="text-sm font-medium text-gray-500">
                      {new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year:'numeric', weekday: 'long' })} • {groupedEntries[date].length} Articles 
                      {index === 0 && <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 uppercase tracking-wider">Latest</span>}
                    </div>
                  </div>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 dark:bg-gray-800 transition-transform ${expandedDate === date ? 'rotate-180 bg-primary/10' : ''}`}>
                  <ChevronDown className={expandedDate === date ? 'text-primary' : 'text-gray-400'} size={18} />
                </div>
              </button>

              {expandedDate === date && (
                <div className="px-6 pb-6 pt-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20">
                  <div className="space-y-6 mt-4">
                    {groupedEntries[date].map(entry => (
                      <div key={entry.id} className="bg-white dark:bg-dark-surface rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                        <div className="flex items-start gap-4 mb-5">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shrink-0 mt-1 ${
                            entry.article_type === 'objective' 
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          }`}>
                            {entry.article_type === 'objective' ? 'Objective Q&A' : 'Subjective (Essay)'}
                          </span>
                          <h3 className="font-extrabold text-2xl text-gray-900 dark:text-white leading-tight font-nepali">
                            {entry.title}
                          </h3>
                        </div>
                        
                        <div className="flex justify-end mb-4">
                          <button
                            onClick={() => handleGenerateAI(entry)}
                            disabled={generatingAi[entry.id]}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm ${
                              generatingAi[entry.id] 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800'
                                : 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white hover:shadow-MD'
                            }`}
                          >
                            {generatingAi[entry.id] ? (
                              <><RefreshCw size={16} className="animate-spin" /> Analyzing Content...</>
                            ) : (
                              <><Wand2 size={16} /> {entry.article_type === 'objective' ? 'Generate AI Quiz' : 'Summarize AI'}</>
                            )}
                          </button>
                        </div>
                        
                        {/* Display AI Results if they exist */}
                        {aiResults[entry.id] && (
                          <div className="mb-6 bg-purple-50/50 dark:bg-purple-900/10 border-2 border-purple-100 dark:border-purple-800/50 rounded-2xl p-6">
                            <h4 className="flex items-center gap-2 font-bold text-purple-700 dark:text-purple-400 mb-4">
                              <Brain size={20} />
                              {aiResults[entry.id]?.type === 'objective' ? 'AI Generated Practice Quiz' : 'AI High-Yield Summary'}
                            </h4>
                            
                            {aiResults[entry.id]?.type === 'subjective' && (
                              <p className="text-gray-700 dark:text-gray-300 leading-loose prose prose-lg dark:prose-invert font-nepali">
                                {aiResults[entry.id]?.payload?.summary}
                              </p>
                            )}

                            {aiResults[entry.id]?.type === 'objective' && Array.isArray(aiResults[entry.id]?.payload) && (
                              <div className="space-y-6">
                                {aiResults[entry.id]?.payload.map((q: any, i: number) => (
                                  <div key={i} className="bg-white dark:bg-dark-surface p-5 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <p className="font-bold text-lg mb-3 font-nepali text-gray-900 dark:text-white">{i + 1}. {q.question}</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                                      {q.options?.map((opt: string, optIdx: number) => (
                                        <div key={optIdx} className={`p-2.5 rounded-lg border text-sm font-medium font-nepali ${optIdx === q.correctAnswerIndex ? 'bg-success/10 border-success/30 text-success' : 'bg-gray-50 border-gray-100 text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'}`}>
                                          {['A', 'B', 'C', 'D'][optIdx]}: {opt}
                                        </div>
                                      ))}
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-3 font-nepali"><strong className="text-gray-700 dark:text-gray-300">Explanation:</strong> {q.explanation}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-nepali tracking-wide leading-loose">
                          {entry.content}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GorkhapatraLoksewa;

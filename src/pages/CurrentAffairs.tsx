import React, { useState, useEffect } from 'react';
import { Newspaper, ChevronRight, Loader2, Bot, AlertTriangle, X } from 'lucide-react';
import { fetchDailyNews } from '../lib/news';
import type { NewsArticle } from '../lib/news';
import { generateCompletion, GROQ_MODELS } from '../utils/groqClient';

const CurrentAffairs: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Summary Modal State
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Generate the past 7 days
  const dates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d;
  });

  const loadNews = async (date: Date) => {
    setLoading(true);
    setError(null);
    setArticles([]);

    try {
      const data = await fetchDailyNews(date);
      setArticles(data);
    } catch (err: any) {
      setError(err.message || "Failed to generate current affairs. Please check your AI settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews(selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const handleArticleClick = async (article: NewsArticle) => {
    setSelectedArticle(article);
    setAiSummary('');
    setLoadingSummary(true);

    try {
      const prompt = [{
        role: 'user' as const,
        content: `Summarize this news article for a Loksewa exam aspirant. 
        Format your response in **valid Markdown**. 
        - Use a brief introductory sentence.
        - Provide exactly 5 to 10 bullet points focusing ONLY on hard facts, dates, names, and economic/political impacts.
        - Bold important keywords.
        - Do NOT include any concluding remarks or fluff.
        
        Title: ${article.title}
        Summary text: ${article.summary}`
      }];
      
      const summary = await generateCompletion(prompt, GROQ_MODELS.FAST);
      setAiSummary(summary);
    } catch (err) {
      setAiSummary("Failed to generate summary. Please try again later.");
    } finally {
      setLoadingSummary(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-24">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Current Affairs Daily</h1>
        <p className="text-gray-500 text-sm">Real-time Nepal news feed for Loksewa preparation.</p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Feed for {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</h2>
        <button 
          onClick={() => loadNews(selectedDate)}
          disabled={loading}
          className="px-4 py-2 bg-primary/10 text-primary font-bold rounded-xl hover:bg-primary/20 transition-colors disabled:opacity-50"
        >
          Refresh Feed
        </button>
      </div>

      {/* Horizontal Date Scroller */}
      <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-4 mb-6">
        {dates.map((d, i) => {
          const isSelected = d.toDateString() === selectedDate.toDateString();
          const isToday = i === 0;
          return (
            <button
              key={i}
              onClick={() => setSelectedDate(d)}
              className={`flex-shrink-0 px-5 py-3 rounded-2xl border-2 transition-all flex flex-col items-center min-w-[100px] ${
                isSelected 
                  ? 'border-primary bg-primary text-white shadow-md' 
                  : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-dark-surface text-gray-600 dark:text-gray-400 hover:border-gray-300'
              }`}
            >
              <span className={`text-xs font-bold uppercase tracking-wider mb-1 ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                {isToday ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
              <span className={`text-xl font-extrabold ${isSelected ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                {d.getDate()}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="bg-white dark:bg-dark-surface rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 sm:p-8 min-h-[400px] relative">
        <div className="flex items-center justify-between mb-8 border-b border-gray-100 dark:border-gray-800 pb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Newspaper className="text-primary" size={20} />
            Live Updates
          </h2>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-lg">
            <Bot size={14} /> Live Feed
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <Loader2 size={32} className="animate-spin mb-4 text-primary" />
            <p className="text-sm font-bold">Fetching latest news...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 text-danger text-center max-w-md mx-auto">
            <AlertTriangle size={48} className="mb-4 opacity-50" />
            <p className="font-bold mb-2">Could not fetch news</p>
            <p className="text-sm opacity-80">{error}</p>
          </div>
        ) : articles.length > 0 ? (
          <div className="grid gap-6">
            {articles.map((article) => (
              <div key={article.id} onClick={() => handleArticleClick(article)} className="group p-5 rounded-2xl bg-gray-50 dark:bg-gray-900/50 hover:bg-white dark:hover:bg-dark-surface hover:shadow-md border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-2.5 py-1 bg-primary text-white text-[10px] font-bold uppercase tracking-wider rounded-md">
                    {article.topic}
                  </span>
                  <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                    Via {article.source}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
                  {article.summary}
                </p>
                <div className="mt-4 flex items-center text-primary text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity -translate-x-4 group-hover:translate-x-0 transform duration-300">
                  Read AI summary <ChevronRight size={16} className="ml-1" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <p className="text-sm font-bold">No news available.</p>
          </div>
        )}
      </div>

      {/* AI Summary Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-dark-surface rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 sm:p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="px-2.5 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider rounded-md mb-3 inline-block">
                    AI Summary
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white line-clamp-2">
                    {selectedArticle.title}
                  </h2>
                </div>
                <button 
                  onClick={() => setSelectedArticle(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors shrink-0 ml-4"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="prose dark:prose-invert max-w-none">
                {loadingSummary ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <Loader2 size={32} className="animate-spin mb-4 text-primary" />
                    <p className="text-sm font-bold">AI is reading the article and taking notes...</p>
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2 mb-4 text-primary font-bold">
                      <Bot size={20} /> Key Takeaways
                    </div>
                    <div className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed text-gray-700 dark:text-gray-300">
                      {aiSummary}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                {selectedArticle.url ? (
                  <a 
                    href={selectedArticle.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl hover:scale-105 transition-transform flex items-center gap-2"
                  >
                    Read Full Original Article <ChevronRight size={18} />
                  </a>
                ) : (
                  <button 
                    onClick={() => setSelectedArticle(null)}
                    className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrentAffairs;

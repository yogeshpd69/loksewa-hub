import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, User, Sparkles, AlertTriangle, Trash2, Clock, Menu, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { generateCompletion, GROQ_MODELS } from '../utils/groqClient';
import type { ChatMessage } from '../utils/groqClient';
import { useAuth } from '../context/AuthContext';
import { fetchAIChats, saveAIChat, deleteAIChatDB } from '../lib/ai';

interface Conversation {
  id: string;
  title: string;
  date: string;
  messages: ChatMessage[];
}

const AIAssistant: React.FC = () => {
  const { user, isGuest } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load history on mount
  useEffect(() => {
    const loadChats = async () => {
      if (user && !isGuest) {
        const dbChats = await fetchAIChats(user.id);
        const mapped = dbChats.map(c => ({
          id: c.id,
          title: c.title,
          date: c.created_at,
          messages: c.messages
        }));
        setConversations(mapped);
        if (mapped.length > 0) setActiveId(mapped[0].id);
      } else {
        const saved = localStorage.getItem('loksewa_ai_chats');
        if (saved) {
          const parsed = JSON.parse(saved);
          setConversations(parsed);
          if (parsed.length > 0) setActiveId(parsed[0].id);
        }
      }
    };
    loadChats();
  }, [user, isGuest]);

  // Save history on change (only for guests/local fallback, DB syncs directly on actions)
  useEffect(() => {
    if (!user || isGuest) {
      localStorage.setItem('loksewa_ai_chats', JSON.stringify(conversations));
    }
  }, [conversations, user, isGuest]);

  const activeConv = conversations.find(c => c.id === activeId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConv?.messages, isTyping]);

  const createNewChat = () => {
    const newChat: Conversation = {
      id: crypto.randomUUID(),
      title: 'New Conversation',
      date: new Date().toISOString(),
      messages: []
    };
    setConversations([newChat, ...conversations]);
    setActiveId(newChat.id);
    setIsSidebarOpen(false);
  };

  const deleteChat = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = conversations.filter(c => c.id !== id);
    setConversations(updated);
    if (activeId === id) {
      setActiveId(updated.length > 0 ? updated[0].id : null);
    }
    
    if (user && !isGuest) {
      await deleteAIChatDB(id);
    } else {
      localStorage.setItem('loksewa_ai_chats', JSON.stringify(updated));
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    let currentConv = activeConv;
    
    // If no active chat, create one
    if (!currentConv) {
      currentConv = {
        id: crypto.randomUUID(),
        title: input.slice(0, 30) + '...',
        date: new Date().toISOString(),
        messages: []
      };
      setActiveId(currentConv.id);
    } else if (currentConv.messages.length === 0) {
      // Update title on first message
      currentConv = { ...currentConv, title: input.slice(0, 30) + '...' };
    }
    
    // Check if ID is a valid UUID (if migrated from local storage timestamp)
    if (currentConv.id.length < 30) {
       currentConv.id = crypto.randomUUID();
       setActiveId(currentConv.id);
    }

    const userMessage: ChatMessage = { role: 'user', content: input };
    const updatedMessages = [...currentConv.messages, userMessage];
    
    // Optimistic UI update
    const updatedConv = { ...currentConv, messages: updatedMessages };
    setConversations(prev => {
      const idx = prev.findIndex(c => c.id === currentConv!.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updatedConv;
        return next;
      }
      return [updatedConv, ...prev];
    });
    
    if (user && !isGuest) {
      // Fire and forget save
      saveAIChat(user.id, updatedConv.id, updatedConv.title, updatedConv.messages);
    }
    
    setInput('');
    setIsTyping(true);
    setError(null);

    try {
      const systemPrompt: ChatMessage = {
        role: 'system',
        content: `You are an expert tutor for the Nepal Public Service Commission (Loksewa) exams. 
The current date/time is ${new Date().toLocaleString()}. 
IMPORTANT: Your knowledge cutoff is early 2024. If the user asks for real-time news or events that happened recently, explicitly state that you do not have access to real-time data and cannot provide the latest news. DO NOT hallucinate or invent recent events. 
Answer concisely, accurately, and format your responses in beautiful valid Markdown with headings and bold text where appropriate.`
      };

      const reply = await generateCompletion([systemPrompt, ...updatedMessages], GROQ_MODELS.HEAVY);
      
      const assistantMessage: ChatMessage = { role: 'assistant', content: reply };
      
      setConversations(prev => {
        const idx = prev.findIndex(c => c.id === currentConv!.id);
        let finalConv = currentConv;
        if (idx >= 0) {
          const next = [...prev];
          finalConv = { ...next[idx], messages: [...next[idx].messages, assistantMessage] };
          next[idx] = finalConv as Conversation;
          return next;
        }
        return prev;
      });
      
      // Save full convo to DB
      if (user && !isGuest) {
        saveAIChat(user.id, currentConv!.id, currentConv!.title, [...updatedMessages, assistantMessage]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect to AI.');
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-100px)] lg:h-[calc(100vh-120px)] flex gap-6 pb-2 lg:pb-6 relative">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar History */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-dark-surface border-r border-gray-100 dark:border-gray-800 shadow-xl transform transition-transform duration-300 lg:relative lg:transform-none lg:w-64 lg:rounded-3xl lg:border lg:shadow-none flex flex-col overflow-hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <button 
            onClick={createNewChat}
            className="flex-1 py-3 bg-primary/10 text-primary font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-primary/20 transition-colors"
          >
            <Sparkles size={18} /> New Chat
          </button>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="ml-2 p-2 lg:hidden text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          {conversations.length === 0 ? (
            <div className="text-center p-4 text-sm text-gray-400 mt-4">
              <Clock size={24} className="mx-auto mb-2 opacity-50" />
              No recent chats
            </div>
          ) : (
            conversations.map(conv => (
              <div 
                key={conv.id}
                onClick={() => {
                  setActiveId(conv.id);
                  setIsSidebarOpen(false);
                }}
                className={`group flex items-center justify-between p-3 mb-1 rounded-xl cursor-pointer transition-colors ${
                  activeId === conv.id 
                    ? 'bg-primary/10 text-primary' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-300'
                }`}
              >
                <div className="truncate text-sm font-medium mr-2">{conv.title}</div>
                <button 
                  onClick={(e) => deleteChat(conv.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white dark:hover:bg-gray-700 rounded text-gray-400 hover:text-danger transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 w-full bg-white dark:bg-dark-surface lg:border border-gray-100 dark:border-gray-800 rounded-2xl lg:rounded-3xl flex flex-col overflow-hidden relative shadow-sm">
        
        {/* Header */}
        <div className="h-14 lg:h-16 border-b border-gray-100 dark:border-gray-800 flex items-center px-4 lg:px-6 shrink-0 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-sm z-10">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="mr-3 p-2 -ml-2 lg:hidden text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
          >
            <Menu size={20} />
          </button>
          <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center mr-3 hidden sm:flex">
            <Bot size={18} />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white text-sm">Loksewa AI Tutor</h2>
            <p className="text-xs text-gray-500 hidden sm:block">Powered by Groq</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-6 space-y-6">
          {!activeConv || activeConv.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-70 px-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                <Sparkles size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">How can I help you prepare?</h3>
              <p className="text-sm text-gray-500 max-w-sm">
                Ask me to explain complex topics, test you on facts, or draft an ideal answer for a past paper.
              </p>
            </div>
          ) : (
            activeConv.messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 lg:gap-4 max-w-full lg:max-w-3xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 hidden sm:flex ${
                  msg.role === 'user' ? 'bg-gray-100 dark:bg-gray-800 text-gray-600' : 'bg-primary text-white shadow-md'
                }`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`px-4 py-3 lg:px-5 lg:py-3.5 rounded-2xl text-sm leading-relaxed max-w-full overflow-hidden ${
                  msg.role === 'user' 
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-tr-sm shadow-sm' 
                    : 'bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-tl-sm'
                }`}>
                  {msg.role === 'user' ? (
                    <div>{msg.content}</div>
                  ) : (
                    <div className="prose dark:prose-invert max-w-none prose-sm sm:prose-base prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 break-words">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          
          {isTyping && (
            <div className="flex gap-4 max-w-3xl mr-auto animate-pulse">
              <div className="w-8 h-8 rounded-xl bg-primary text-white items-center justify-center shrink-0 shadow-md hidden sm:flex">
                <Bot size={16} />
              </div>
              <div className="px-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-tl-sm flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-4 lg:mx-6 mb-4 p-3 bg-danger/10 text-danger rounded-xl text-sm flex items-center gap-2 font-medium border border-danger/20">
            <AlertTriangle size={16} /> {error}
          </div>
        )}

        {/* Input Area */}
        <div className="p-3 lg:p-4 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-sm border-t border-gray-100 dark:border-gray-800 shrink-0">
          <div className="relative max-w-4xl mx-auto flex items-center">
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask anything..."
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl pl-4 pr-12 py-3 lg:py-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-inner"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="absolute right-1.5 lg:right-2 top-1.5 lg:top-2 bottom-1.5 lg:bottom-2 aspect-square bg-primary text-white rounded-xl flex items-center justify-center disabled:opacity-50 hover:bg-primary-hover hover:shadow-md transition-all"
            >
              <Send size={16} className="ml-1" />
            </button>
          </div>
          <div className="text-center mt-2 text-[10px] text-gray-400 font-medium hidden sm:block">
            AI can make mistakes. Verify important facts with official syllabus documents.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;

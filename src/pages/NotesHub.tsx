import React, { useState, useEffect } from 'react';
import { BookOpen, FileText, ExternalLink, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Note {
  id: string;
  title: string;
  description: string;
  category: string;
  file_url: string;
  type: string;
}

const NotesHub: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notes:', error);
      } else if (data) {
        setNotes(data as Note[]);
      }
      setLoading(false);
    };

    fetchNotes();
  }, []);

  const categories = ['All', ...Array.from(new Set(notes.map(n => n.category)))];
  const filteredNotes = activeCategory === 'All' ? notes : notes.filter(n => n.category === activeCategory);

  return (
    <div className="max-w-6xl mx-auto pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          <BookOpen className="text-primary" size={32} /> Library & Notes Hub
        </h1>
        <p className="text-gray-500 text-lg">Curated PDFs, syllabus documents, and high-yield study materials.</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-4 mb-6">
        {categories.map((cat, i) => (
          <button
            key={i}
            onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeCategory === cat 
                ? 'bg-primary text-white shadow-md' 
                : 'bg-white dark:bg-dark-surface border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <Loader2 size={32} className="animate-spin mb-4 text-primary" />
          <p className="text-sm font-bold">Loading library materials...</p>
        </div>
      ) : filteredNotes.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map(note => (
            <div key={note.id} className="group bg-white dark:bg-dark-surface border border-gray-100 dark:border-gray-800 rounded-2xl p-6 hover:border-primary/50 transition-all hover:shadow-lg flex flex-col h-full">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                <FileText size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">{note.title}</h3>
              <p className="text-sm text-gray-500 mb-6 flex-1 line-clamp-3">{note.description}</p>
              
              <div className="flex items-center justify-between border-t border-gray-50 dark:border-gray-800 pt-4 mt-auto">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-md">
                  {note.category}
                </span>
                <a 
                  href={note.file_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm font-bold text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Open <ExternalLink size={14} />
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
            <BookOpen size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Curated Materials Coming Soon</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            We are currently preparing high-yield Loksewa notes, syllabus documents, and PDF study guides. Check back later!
          </p>
        </div>
      )}
    </div>
  );
};

export default NotesHub;

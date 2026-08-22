import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrganization } from '../context/OrganizationContext';
import { GK_SUBCATEGORIES, IQ_SUBCATEGORIES, BCT_SUBCATEGORIES, BEI_SUBCATEGORIES } from '../data/questions/types';
import { CheckSquare, Square, Play, Filter } from 'lucide-react';
import type { SubcategoryInfo } from '../data/questions/types';

const PracticeSetup: React.FC = () => {
  const navigate = useNavigate();
  const { activeSpecialization } = useOrganization();
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());

  const getSections = () => {
    const sections: { title: string; topics: SubcategoryInfo[] }[] = [
      { title: 'General Knowledge (Paper I)', topics: GK_SUBCATEGORIES },
      { title: 'IQ & Aptitude (Paper I)', topics: IQ_SUBCATEGORIES }
    ];
    if (activeSpecialization === 'BCT' || activeSpecialization === 'General') {
      sections.push({ title: 'Computer Engineering (Paper II)', topics: BCT_SUBCATEGORIES });
    }
    if (activeSpecialization === 'BEI' || activeSpecialization === 'General') {
      sections.push({ title: 'Electronics & Comm. (Paper II)', topics: BEI_SUBCATEGORIES });
    }
    return sections;
  };

  const toggleTopic = (id: string) => {
    setSelectedTopics(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const [questionCount, setQuestionCount] = useState<number>(20);

  const handleStart = () => {
    if (selectedTopics.size === 0) return;
    const subs = Array.from(selectedTopics).join(',');
    navigate(`/practice/session?subs=${subs}&count=${questionCount}`);
  };

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Practice Configuration</h1>
        <p className="text-gray-500 text-sm">Select one or more topics to start a focused practice session. Questions will be shuffled.</p>
      </div>

      <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <Filter className="text-primary" size={20} />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Topic Selection</h2>
        </div>

        <div className="space-y-8">
          {getSections().map((sec, i) => (
            <div key={i}>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">{sec.title}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sec.topics.map(topic => {
                  const isSelected = selectedTopics.has(topic.id);
                  return (
                    <div key={topic.id} onClick={() => toggleTopic(topic.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-primary bg-primary/5 text-primary' 
                          : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                      }`}>
                      {isSelected ? <CheckSquare size={18} className="text-primary" /> : <Square size={18} className="text-gray-400" />}
                      <span className="text-sm font-medium">{topic.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 block">Number of Questions</h3>
        <div className="flex flex-wrap gap-3">
          {[10, 20, 50, 100].map(num => (
            <button 
              key={num}
              onClick={() => setQuestionCount(num)}
              className={`px-6 py-3 rounded-xl text-sm font-bold border transition-colors ${
                questionCount === num 
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 border-transparent' 
                  : 'bg-white dark:bg-dark-surface border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
              }`}
            >
              {num} Questions
            </button>
          ))}
        </div>
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-6 left-0 right-0 lg:left-64 flex justify-center px-4 pointer-events-none z-40">
        <div className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 p-4 rounded-2xl shadow-xl flex items-center gap-6 pointer-events-auto w-full max-w-lg justify-between border border-gray-800 dark:border-gray-200">
          <div>
            <div className="text-xs font-medium opacity-70">Selected Topics</div>
            <div className="font-bold">{selectedTopics.size} Topics</div>
          </div>
          <button 
            onClick={handleStart}
            disabled={selectedTopics.size === 0}
            className="px-6 py-3 bg-primary text-white rounded-xl font-bold flex items-center gap-2 hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Start Practice <Play size={18} className="fill-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PracticeSetup;

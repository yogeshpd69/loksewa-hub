import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrganization } from '../context/OrganizationContext';
import { GK_SUBCATEGORIES, IQ_SUBCATEGORIES, BCT_SUBCATEGORIES, BEI_SUBCATEGORIES } from '../data/questions/types';
import { getSubcategoryCounts } from '../lib/questions';
import {
  BookOpen, Monitor, Cpu, Network, Shield, Database, Radio,
  Settings, Globe, FileText, Briefcase, Trophy, Calendar,
  TrendingUp, Leaf, Landmark, Brain, Calculator, MessageSquare,
  BarChart3, ArrowLeftRight, Globe2, Scale, Zap
} from 'lucide-react';
import type { SubcategoryInfo } from '../data/questions/types';

const iconMap: Record<string, React.FC<{ size?: number }>> = {
  Globe, BookOpen, FileText, Scale, Briefcase, TrendingUp, Cpu, Globe2,
  Leaf, Landmark, Trophy, Calendar, Calculator, MessageSquare, Brain,
  BarChart3, ArrowLeftRight, Monitor, Network, Shield, Database, Radio, Settings, Zap,
};

type TabId = 'GK' | 'IQ' | 'BCT' | 'BEI';

const SubjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeOrganization, activeSpecialization } = useOrganization();
  const [counts, setCounts] = useState<Record<string, number>>({});

  // Default tab based on active specialization
  const defaultTab: TabId = activeSpecialization === 'BCT' ? 'BCT' : activeSpecialization === 'BEI' ? 'BEI' : 'GK';
  const [activeTab, setActiveTab] = React.useState<TabId>(defaultTab);

  useEffect(() => {
    getSubcategoryCounts().then(setCounts);
  }, []);

  React.useEffect(() => {
    if (activeSpecialization === 'BCT') setActiveTab('BCT');
    else if (activeSpecialization === 'BEI') setActiveTab('BEI');
    else setActiveTab('GK');
  }, [activeSpecialization]);

  const tabConfig: { id: TabId; label: string; paper: string }[] = [
    { id: 'GK', label: 'General Knowledge', paper: 'Paper I' },
    { id: 'IQ', label: 'IQ & Aptitude', paper: 'Paper I' },
    ...(activeSpecialization === 'BCT' || activeSpecialization === 'General'
      ? [{ id: 'BCT' as TabId, label: 'Computer Engineering', paper: 'Paper II' }] : []),
    ...(activeSpecialization === 'BEI' || activeSpecialization === 'General'
      ? [{ id: 'BEI' as TabId, label: 'Electronics & Comm.', paper: 'Paper II' }] : []),
  ];

  const subcatMap: Record<TabId, SubcategoryInfo[]> = {
    GK: GK_SUBCATEGORIES,
    IQ: IQ_SUBCATEGORIES,
    BCT: BCT_SUBCATEGORIES,
    BEI: BEI_SUBCATEGORIES,
  };

  const subcats = subcatMap[activeTab] || [];

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">
          Syllabus Explorer — {activeOrganization} Level 7
        </h1>
        <p className="text-gray-500 text-sm">
          {activeSpecialization === 'General' ? 'Section Officer' : `${activeSpecialization} Engineer`} • Select a topic to start practicing
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-800 pb-px overflow-x-auto custom-scrollbar">
        {tabConfig.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-bold border-b-[3px] transition-colors rounded-t-xl whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50'
            }`}>
            <span className="text-[10px] font-bold text-gray-400 block mb-0.5">{tab.paper}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Subject Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {subcats.map((sub) => {
          const count = counts[sub.id] || 0;
          const IconComp = iconMap[sub.icon] || Globe;
          return (
            <div key={sub.id}
              onClick={() => navigate(`/practice?sub=${sub.id}`)}
              className="bg-white dark:bg-dark-surface p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 cursor-pointer group hover:shadow-md hover:border-primary/30 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white ${sub.color} shadow-sm group-hover:scale-110 transition-transform`}>
                  <IconComp size={22} />
                </div>
                <span className="text-xs font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 rounded-full">
                  {count} Qs
                </span>
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">{sub.label}</h3>
              <p className="text-xs text-gray-500 mb-4">{sub.labelNp}</p>
              <button className="w-full py-2.5 bg-gray-50 dark:bg-gray-800/50 hover:bg-primary/10 dark:hover:bg-primary/20 text-gray-700 dark:text-gray-200 hover:text-primary text-sm font-bold rounded-xl transition-colors">
                Practice Now →
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SubjectsPage;

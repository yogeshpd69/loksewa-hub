import React from 'react';
import { X, Building2, CheckCircle2 } from 'lucide-react';
import { useOrganization } from '../../context/OrganizationContext';
import type { Organization } from '../../data/questions/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const OrganizationSelectorModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { activeOrganization, setActiveOrganization, activeSpecialization, setActiveSpecialization } = useOrganization();

  if (!isOpen) return null;

  const organizations: { id: Organization; name: string; full: string; color: string }[] = [
    { id: 'PSC', name: 'PSC', full: 'Public Service Commission', color: 'bg-primary' },
    { id: 'NTC', name: 'NTC', full: 'Nepal Telecom', color: 'bg-blue-600' },
    { id: 'NEA', name: 'NEA', full: 'Nepal Electricity Authority', color: 'bg-amber-500' },
    { id: 'CAAN', name: 'CAAN', full: 'Civil Aviation Authority', color: 'bg-sky-500' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-dark-surface w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Building2 className="text-primary" />
            Target Exam Settings
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-50 dark:bg-gray-800 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Organization Selection */}
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">1. Select Organization</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {organizations.map(org => {
                const isActive = activeOrganization === org.id;
                return (
                  <button
                    key={org.id}
                    onClick={() => setActiveOrganization(org.id)}
                    className={`relative p-4 rounded-2xl border-2 text-center transition-all ${
                      isActive 
                        ? 'border-primary bg-primary/5' 
                        : 'border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    {isActive && <CheckCircle2 size={16} className="absolute top-2 right-2 text-primary" />}
                    <div className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center text-white font-bold mb-2 ${org.color}`}>
                      {org.id.charAt(0)}
                    </div>
                    <div className="font-bold text-gray-900 dark:text-white">{org.name}</div>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Selected: <span className="font-bold text-gray-700 dark:text-gray-300">{organizations.find(o => o.id === activeOrganization)?.full}</span>
            </p>
          </div>

          {/* Specialization Selection */}
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">2. Target Role (Level 7)</h3>
            <div className="space-y-2">
              {[
                { id: 'BCT', label: 'Computer Engineer / IT Officer', desc: 'Focus on OS, Networking, SE, DBMS, Architecture' },
                { id: 'BEI', label: 'Electronics & Comm. Engineer', desc: 'Focus on Digital Logic, Signals, Telecom Networks' },
                { id: 'General', label: 'General Administration / Section Officer', desc: 'Focus on GK, IQ, Constitution, Public Management' },
              ].map(spec => {
                const isActive = activeSpecialization === spec.id;
                return (
                  <button
                    key={spec.id}
                    onClick={() => setActiveSpecialization(spec.id as 'BCT' | 'BEI' | 'General')}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${
                      isActive 
                        ? 'border-primary bg-primary/5' 
                        : 'border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div>
                      <div className={`font-bold ${isActive ? 'text-primary' : 'text-gray-900 dark:text-white'}`}>
                        {spec.label}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">{spec.desc}</div>
                    </div>
                    {isActive && <CheckCircle2 size={20} className="text-primary shrink-0 ml-3" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors shadow-sm"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};

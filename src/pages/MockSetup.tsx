import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, Play, AlertCircle } from 'lucide-react';

const MockSetup: React.FC = () => {
  const navigate = useNavigate();
  const [testType, setTestType] = useState<'mcq' | 'subjective'>('mcq');
  const [questionCount, setQuestionCount] = useState<number>(50);
  const [subjectivePaper, setSubjectivePaper] = useState<string>('Paper II');

  const handleStart = () => {
    if (testType === 'mcq') {
      navigate(`/mock-tests/session?type=mcq&count=${questionCount}`);
    } else {
      navigate(`/mock-tests/session?type=subjective&paper=${subjectivePaper}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-24">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Mock Test Configuration</h1>
        <p className="text-gray-500 text-sm">Configure your test environment before starting the timer.</p>
      </div>

      <div className="bg-white dark:bg-dark-surface p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
        {/* Test Type Selection */}
        <div className="mb-8">
          <label className="text-sm font-bold text-gray-900 dark:text-white mb-4 block">Test Format</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button 
              onClick={() => setTestType('mcq')}
              className={`p-4 rounded-2xl border-2 text-left transition-all ${
                testType === 'mcq' ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${testType === 'mcq' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                  <FileText size={20} />
                </div>
                <span className={`font-bold ${testType === 'mcq' ? 'text-primary' : 'text-gray-900 dark:text-white'}`}>Paper I (Objective)</span>
              </div>
              <p className="text-xs text-gray-500 ml-[52px]">Multiple Choice Questions (GK & IQ). System will auto-evaluate after submission.</p>
            </button>

            <button 
              onClick={() => setTestType('subjective')}
              className={`p-4 rounded-2xl border-2 text-left transition-all ${
                testType === 'subjective' ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${testType === 'subjective' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                  <FileText size={20} />
                </div>
                <span className={`font-bold ${testType === 'subjective' ? 'text-primary' : 'text-gray-900 dark:text-white'}`}>Paper II/III (Subjective)</span>
              </div>
              <p className="text-xs text-gray-500 ml-[52px]">Descriptive questions. Timer runs, but evaluation is manual (self-checked).</p>
            </button>
          </div>
        </div>

        {/* Dynamic Config */}
        <div className="border-t border-gray-100 dark:border-gray-800 pt-8 mb-8">
          {testType === 'mcq' ? (
            <div>
              <label className="text-sm font-bold text-gray-900 dark:text-white mb-4 block">Number of Questions</label>
              <div className="flex flex-wrap gap-3">
                {[25, 50, 100].map(num => (
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
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl">
                <Clock size={16} className="text-primary" /> 
                Estimated Time: <span className="font-bold text-gray-900 dark:text-white">{Math.floor((questionCount / 50) * 45)} Minutes</span>
              </div>
            </div>
          ) : (
            <div>
              <label className="text-sm font-bold text-gray-900 dark:text-white mb-4 block">Select Paper</label>
              <div className="flex flex-wrap gap-3">
                {['Paper II', 'Paper III'].map(paper => (
                  <button 
                    key={paper}
                    onClick={() => setSubjectivePaper(paper)}
                    className={`px-6 py-3 rounded-xl text-sm font-bold border transition-colors ${
                      subjectivePaper === paper 
                        ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 border-transparent' 
                        : 'bg-white dark:bg-dark-surface border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                    }`}
                  >
                    {paper}
                  </button>
                ))}
              </div>
              <div className="mt-4 flex items-start gap-3 text-sm text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 p-4 rounded-xl">
                <AlertCircle size={20} className="shrink-0 mt-0.5" /> 
                <p>You will need physical paper and a pen. The system will display the questions and a 3-hour timer. After submission, you will be shown the expected points for self-evaluation.</p>
              </div>
            </div>
          )}
        </div>

        <button onClick={handleStart} className="w-full py-4 bg-primary text-white text-lg font-bold rounded-2xl shadow-lg hover:bg-primary-hover hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
          Start Simulator <Play size={20} className="fill-white" />
        </button>
      </div>
    </div>
  );
};

export default MockSetup;

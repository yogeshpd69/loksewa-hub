import React from 'react';
import { useOrganization } from '../context/OrganizationContext';
import { PAPER_I_GK_IQ, PAPER_II_PSC_BCT, PAPER_II_NTC_BCT, PAPER_II_NEA_BCT, PAPER_II_BEI, PAPER_II_ADMIN, PAPER_III_ADMIN } from '../data/syllabus';
import type { SyllabusPaper } from '../data/syllabus';
import { FileText, Clock, FileCheck } from 'lucide-react';

const SyllabusExplorer: React.FC = () => {
  const { activeOrganization, activeSpecialization } = useOrganization();

  let papers: SyllabusPaper[] = [PAPER_I_GK_IQ];

  if (activeSpecialization === 'BCT') {
    if (activeOrganization === 'NTC') papers.push(PAPER_II_NTC_BCT);
    else if (activeOrganization === 'NEA') papers.push(PAPER_II_NEA_BCT);
    else papers.push(PAPER_II_PSC_BCT);
  } else if (activeSpecialization === 'BEI') {
    papers.push(PAPER_II_BEI); // TODO: Add BEI splits later
  } else {
    papers.push(PAPER_II_ADMIN, PAPER_III_ADMIN);
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">
          Official Syllabus — {activeOrganization} Level 7
        </h1>
        <p className="text-gray-500 text-sm">
          {activeSpecialization === 'General' ? 'Section Officer' : `${activeSpecialization} Engineer`}
        </p>
      </div>

      <div className="space-y-8">
        {papers.map(paper => (
          <div key={paper.id} className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            {/* Paper Header */}
            <div className="bg-gray-50 dark:bg-gray-900/50 p-5 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-primary mb-1 block uppercase tracking-wider">{paper.paperNumber}</span>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">{paper.title}</h2>
                </div>
                <div className="flex flex-col items-end gap-1 text-sm font-medium">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <FileText size={16} className="text-gray-400" />
                    {paper.type}
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Clock size={16} className="text-gray-400" />
                    {paper.duration}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex gap-4 text-sm">
                <div className="bg-white dark:bg-dark-surface px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 flex gap-2">
                  <span className="text-gray-500">Total Marks:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{paper.totalMarks}</span>
                </div>
                <div className="bg-white dark:bg-dark-surface px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 flex gap-2">
                  <span className="text-gray-500">Pass Marks:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{paper.passMarks}</span>
                </div>
              </div>
            </div>

            {/* Sections */}
            <div className="p-5 space-y-6">
              {paper.sections.map((section, idx) => (
                <div key={section.id} className={idx !== paper.sections.length - 1 ? "border-b border-gray-100 dark:border-gray-800 pb-6" : ""}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-primary/10 text-primary flex items-center justify-center text-xs">
                        {String.fromCharCode(65 + idx)}
                      </div>
                      {section.name}
                      {section.nameNp && <span className="text-gray-500 font-normal text-sm ml-2">({section.nameNp})</span>}
                    </h3>
                    <div className="text-xs font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      {section.marks} Marks ({section.questions} Qs)
                    </div>
                  </div>
                  
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-8">
                    {section.topics.map(topic => (
                      <li key={topic.id} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <FileCheck size={16} className="text-primary/50 mt-0.5 shrink-0" />
                        <div>
                          <span>{topic.name}</span>
                          {topic.questions && <span className="text-xs text-gray-400 ml-2">({topic.questions} Qs)</span>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SyllabusExplorer;

export interface SyllabusTopic {
  id: string;
  name: string;
  nameNp?: string;
  marks?: number;
  questions?: number;
}

export interface SyllabusSection {
  id: string;
  name: string;
  nameNp?: string;
  marks: number;
  questions: number;
  topics: SyllabusTopic[];
}

export interface SyllabusPaper {
  id: string;
  paperNumber: string;
  title: string;
  type: 'Objective' | 'Subjective' | 'Mixed';
  totalMarks: number;
  passMarks: number;
  duration: string;
  sections: SyllabusSection[];
}

// Common Paper I (Administrative + Technical)
export const PAPER_I_GK_IQ: SyllabusPaper = {
  id: 'paper1',
  paperNumber: 'Paper I',
  title: 'General Awareness and Aptitude Test',
  type: 'Objective',
  totalMarks: 100,
  passMarks: 40,
  duration: '1 Hour 30 Minutes', // Usually shorter for 100 MCQs, but let's standardise
  sections: [
    {
      id: 'gk',
      name: 'General Knowledge',
      nameNp: 'सामान्य ज्ञान',
      marks: 50,
      questions: 50,
      topics: [
        { id: 'gk1', name: 'Geography of Nepal & World', questions: 10 },
        { id: 'gk2', name: 'History, Culture, and Social System', questions: 10 },
        { id: 'gk3', name: 'Economy, Planning, and Environment', questions: 10 },
        { id: 'gk4', name: 'Constitution, Laws, and Public Administration', questions: 10 },
        { id: 'gk5', name: 'Science, Technology, and International Relations', questions: 10 },
      ]
    },
    {
      id: 'iq',
      name: 'General Mental Ability (IQ)',
      nameNp: 'बौद्धिक परीक्षण',
      marks: 50,
      questions: 50,
      topics: [
        { id: 'iq1', name: 'Verbal Reasoning', questions: 15 },
        { id: 'iq2', name: 'Numerical Reasoning', questions: 15 },
        { id: 'iq3', name: 'Non-Verbal / Logical Reasoning', questions: 20 },
      ]
    }
  ]
};

// Paper II - PSC BCT Example
export const PAPER_II_PSC_BCT: SyllabusPaper = {
  id: 'paper2-psc-bct',
  paperNumber: 'Paper II',
  title: 'Technical Subject (Computer Engineering) - PSC',
  type: 'Subjective',
  totalMarks: 100,
  passMarks: 40,
  duration: '3 Hours',
  sections: [
    {
      id: 'bct-secA',
      name: 'Section A: Architecture, OS, Networks',
      marks: 50,
      questions: 5,
      topics: [
        { id: 'bct-architecture', name: 'Computer Architecture' },
        { id: 'bct-os', name: 'Operating Systems' },
        { id: 'bct-networks', name: 'Computer Networks' },
      ]
    },
    {
      id: 'bct-secB',
      name: 'Section B: Software, DB, DSA',
      marks: 50,
      questions: 5,
      topics: [
        { id: 'bct-dbms', name: 'Database Systems (DBMS)' },
        { id: 'bct-software-eng', name: 'Software Engineering' },
        { id: 'bct-dsa', name: 'Data Structures & Algorithms' },
        { id: 'bct-oop', name: 'Object-Oriented Programming' },
      ]
    }
  ]
};

// Paper II - NTC BCT Example
export const PAPER_II_NTC_BCT: SyllabusPaper = {
  id: 'paper2-ntc-bct',
  paperNumber: 'Paper II',
  title: 'Telecom Engineering (Computer) - NTC',
  type: 'Subjective',
  totalMarks: 100,
  passMarks: 40,
  duration: '3 Hours',
  sections: [
    {
      id: 'ntc-bct-secA',
      name: 'Section A: Telecom & Optical Networks',
      marks: 50,
      questions: 5,
      topics: [
        { id: 'ntc-optical', name: 'Optical Fiber Communication' },
        { id: 'ntc-switching', name: 'Telecommunication Switching' },
        { id: 'ntc-wireless', name: 'Wireless Communication Systems' },
      ]
    },
    {
      id: 'ntc-bct-secB',
      name: 'Section B: Server & Data Center',
      marks: 50,
      questions: 5,
      topics: [
        { id: 'ntc-cloud', name: 'Cloud Computing & Virtualization' },
        { id: 'ntc-security', name: 'Network Security & Cryptography' },
        { id: 'ntc-dbms', name: 'Enterprise Database Systems' },
      ]
    }
  ]
};

// Paper II - NEA BCT Example
export const PAPER_II_NEA_BCT: SyllabusPaper = {
  id: 'paper2-nea-bct',
  paperNumber: 'Paper II',
  title: 'Computer Engineering (Energy Sector) - NEA',
  type: 'Subjective',
  totalMarks: 100,
  passMarks: 40,
  duration: '3 Hours',
  sections: [
    {
      id: 'nea-bct-secA',
      name: 'Section A: SCADA & Industrial Systems',
      marks: 50,
      questions: 5,
      topics: [
        { id: 'nea-scada', name: 'SCADA Systems' },
        { id: 'nea-plc', name: 'Programmable Logic Controllers' },
        { id: 'nea-embedded', name: 'Embedded Systems' },
      ]
    },
    {
      id: 'nea-bct-secB',
      name: 'Section B: Grid IT Infrastructure',
      marks: 50,
      questions: 5,
      topics: [
        { id: 'nea-smartgrid', name: 'Smart Grid Technologies' },
        { id: 'nea-it', name: 'IT Infrastructure & Security' },
        { id: 'nea-billing', name: 'Utility Billing Systems' },
      ]
    }
  ]
};

// Paper II - BEI Example
export const PAPER_II_BEI: SyllabusPaper = {
  id: 'paper2-bei',
  paperNumber: 'Paper II',
  title: 'Technical Subject (Electronics & Comm. Engineering)',
  type: 'Subjective',
  totalMarks: 100,
  passMarks: 40,
  duration: '3 Hours',
  sections: [
    {
      id: 'bei-secA',
      name: 'Section A: Digital Logic & Signals',
      marks: 50,
      questions: 5,
      topics: [
        { id: 'bei-digital-logic', name: 'Digital Logic & Microprocessors' },
        { id: 'bei-signals', name: 'Signals & Systems' },
        { id: 'bei-electronics', name: 'Electronic Devices & Circuits' },
      ]
    },
    {
      id: 'bei-secB',
      name: 'Section B: Communication & Telecom',
      marks: 50,
      questions: 5,
      topics: [
        { id: 'bei-communication', name: 'Communication Systems' },
        { id: 'bei-telecom', name: 'Telecommunication Networks' },
        { id: 'bei-electromagnetic', name: 'Electromagnetic Theory' },
      ]
    }
  ]
};

// Paper II - Section Officer (Admin) Example
export const PAPER_II_ADMIN: SyllabusPaper = {
  id: 'paper2-admin',
  paperNumber: 'Paper II',
  title: 'Governance Systems',
  type: 'Subjective',
  totalMarks: 100,
  passMarks: 40,
  duration: '3 Hours',
  sections: [
    {
      id: 'admin-secA',
      name: 'State and Governance',
      marks: 30,
      questions: 3,
      topics: [
        { id: 'admin1', name: 'State, Nation, and Governance' },
        { id: 'admin2', name: 'Constitution and Laws' },
      ]
    },
    {
      id: 'admin-secB',
      name: 'Public Administration',
      marks: 30,
      questions: 3,
      topics: [
        { id: 'admin3', name: 'Public Management' },
        { id: 'admin4', name: 'Human Resource Management' },
      ]
    },
    {
      id: 'admin-secC',
      name: 'Public Service Delivery',
      marks: 40,
      questions: 4,
      topics: [
        { id: 'admin5', name: 'Public Service Delivery' },
        { id: 'admin6', name: 'E-Governance' },
      ]
    }
  ]
};

export const PAPER_III_ADMIN: SyllabusPaper = {
  id: 'paper3-admin',
  paperNumber: 'Paper III',
  title: 'Contemporary Issues',
  type: 'Subjective',
  totalMarks: 100,
  passMarks: 40,
  duration: '3 Hours',
  sections: [
    {
      id: 'admin-p3-secA',
      name: 'Social and Cultural Issues',
      marks: 30,
      questions: 3,
      topics: [
        { id: 'admin3-1', name: 'Social Demography' },
        { id: 'admin3-2', name: 'Cultural Diversity' },
      ]
    },
    {
      id: 'admin-p3-secB',
      name: 'Economic Issues',
      marks: 40,
      questions: 4,
      topics: [
        { id: 'admin3-3', name: 'Macroeconomic Indicators' },
        { id: 'admin3-4', name: 'Development Planning' },
      ]
    },
    {
      id: 'admin-p3-secC',
      name: 'Development and Environment',
      marks: 30,
      questions: 3,
      topics: [
        { id: 'admin3-5', name: 'Environmental Management' },
      ]
    }
  ]
};

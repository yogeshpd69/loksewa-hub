// Core question types for the entire platform

export type PaperType = 'paper1' | 'paper2';
export type QuestionCategory = 'GK' | 'IQ' | 'BCT' | 'BEI' | 'Management';
export type Organization = 'PSC' | 'NTC' | 'NEA' | 'CAAN' | 'ALL';

// GK Subcategories
export type GKSubcategory =
  | 'geography'
  | 'history'
  | 'constitution'
  | 'acts-laws'
  | 'public-admin'
  | 'economics'
  | 'science-tech'
  | 'international'
  | 'environment'
  | 'culture'
  | 'sports'
  | 'dates-events';

// IQ Subcategories
export type IQSubcategory =
  | 'numerical'
  | 'verbal'
  | 'logical'
  | 'series-pattern'
  | 'analogy';

export type Subcategory = GKSubcategory | IQSubcategory | string;

export interface Question {
  id: string;
  category: QuestionCategory;
  subcategory: Subcategory;
  organization: Organization[];
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

// Subcategory metadata for UI display
export interface SubcategoryInfo {
  id: Subcategory;
  label: string;
  labelNp: string;
  category: QuestionCategory;
  icon: string; // lucide icon name
  color: string;
}

export const GK_SUBCATEGORIES: SubcategoryInfo[] = [
  { id: 'geography', label: 'Nepal Geography', labelNp: 'नेपालको भूगोल', category: 'GK', icon: 'Globe', color: 'bg-blue-500' },
  { id: 'history', label: 'Nepal History', labelNp: 'नेपालको इतिहास', category: 'GK', icon: 'BookOpen', color: 'bg-amber-600' },
  { id: 'constitution', label: 'Constitution of Nepal', labelNp: 'नेपालको संविधान २०७२', category: 'GK', icon: 'FileText', color: 'bg-rose-500' },
  { id: 'acts-laws', label: 'Acts & Laws', labelNp: 'ऐन तथा नियम', category: 'GK', icon: 'Scale', color: 'bg-purple-500' },
  { id: 'public-admin', label: 'Public Administration', labelNp: 'लोक प्रशासन', category: 'GK', icon: 'Briefcase', color: 'bg-emerald-500' },
  { id: 'economics', label: 'Economics & Planning', labelNp: 'अर्थशास्त्र तथा योजना', category: 'GK', icon: 'TrendingUp', color: 'bg-green-600' },
  { id: 'science-tech', label: 'Science & Technology', labelNp: 'विज्ञान तथा प्रविधि', category: 'GK', icon: 'Cpu', color: 'bg-cyan-500' },
  { id: 'international', label: 'International Relations', labelNp: 'अन्तर्राष्ट्रिय सम्बन्ध', category: 'GK', icon: 'Globe2', color: 'bg-indigo-500' },
  { id: 'environment', label: 'Environment & Ecology', labelNp: 'वातावरण तथा पारिस्थितिकी', category: 'GK', icon: 'Leaf', color: 'bg-teal-500' },
  { id: 'culture', label: 'Nepali Culture & Society', labelNp: 'नेपाली संस्कृति तथा समाज', category: 'GK', icon: 'Landmark', color: 'bg-orange-500' },
  { id: 'sports', label: 'Sports', labelNp: 'खेलकुद', category: 'GK', icon: 'Trophy', color: 'bg-yellow-500' },
  { id: 'dates-events', label: 'Important Dates & Events', labelNp: 'महत्वपूर्ण मिति तथा घटना', category: 'GK', icon: 'Calendar', color: 'bg-pink-500' },
];

export const IQ_SUBCATEGORIES: SubcategoryInfo[] = [
  { id: 'numerical', label: 'Numerical Reasoning', labelNp: 'संख्यात्मक तर्क', category: 'IQ', icon: 'Calculator', color: 'bg-violet-500' },
  { id: 'verbal', label: 'Verbal Reasoning', labelNp: 'शाब्दिक तर्क', category: 'IQ', icon: 'MessageSquare', color: 'bg-sky-500' },
  { id: 'logical', label: 'Logical Reasoning', labelNp: 'तार्किक तर्क', category: 'IQ', icon: 'Brain', color: 'bg-fuchsia-500' },
  { id: 'series-pattern', label: 'Series & Patterns', labelNp: 'श्रृंखला तथा ढाँचा', category: 'IQ', icon: 'BarChart3', color: 'bg-lime-600' },
  { id: 'analogy', label: 'Analogy', labelNp: 'सादृश्य', category: 'IQ', icon: 'ArrowLeftRight', color: 'bg-red-500' },
];

// BCT Subcategories (Computer Engineering)
export type BCTSubcategory =
  | 'bct-architecture'
  | 'bct-os'
  | 'bct-networks'
  | 'bct-dbms'
  | 'bct-software-eng'
  | 'bct-dsa'
  | 'bct-oop'
  | 'bct-digital-logic'
  | 'bct-security'
  | 'bct-web';

// BEI Subcategories (Electronics & Communication)
export type BEISubcategory =
  | 'bei-digital-logic'
  | 'bei-signals'
  | 'bei-communication'
  | 'bei-electromagnetic'
  | 'bei-electronics'
  | 'bei-telecom'
  | 'bei-control'
  | 'bei-wireless'
  | 'bei-optical'
  | 'bei-embedded';

export const BCT_SUBCATEGORIES: SubcategoryInfo[] = [
  { id: 'bct-architecture', label: 'Computer Architecture', labelNp: 'कम्प्युटर आर्किटेक्चर', category: 'BCT', icon: 'Cpu', color: 'bg-indigo-500' },
  { id: 'bct-os', label: 'Operating Systems', labelNp: 'अपरेटिङ सिस्टम', category: 'BCT', icon: 'Monitor', color: 'bg-cyan-600' },
  { id: 'bct-networks', label: 'Computer Networks', labelNp: 'कम्प्युटर नेटवर्क', category: 'BCT', icon: 'Network', color: 'bg-violet-500' },
  { id: 'bct-dbms', label: 'Database Systems (DBMS)', labelNp: 'डाटाबेस व्यवस्थापन', category: 'BCT', icon: 'Database', color: 'bg-orange-500' },
  { id: 'bct-software-eng', label: 'Software Engineering', labelNp: 'सफ्टवेयर इन्जिनियरिङ', category: 'BCT', icon: 'Settings', color: 'bg-pink-500' },
  { id: 'bct-dsa', label: 'Data Structures & Algorithms', labelNp: 'डाटा स्ट्रक्चर तथा एल्गोरिदम', category: 'BCT', icon: 'BarChart3', color: 'bg-emerald-500' },
  { id: 'bct-oop', label: 'Object-Oriented Programming', labelNp: 'ओओपी प्रोग्रामिङ', category: 'BCT', icon: 'BookOpen', color: 'bg-blue-600' },
  { id: 'bct-digital-logic', label: 'Digital Logic', labelNp: 'डिजिटल लजिक', category: 'BCT', icon: 'Zap', color: 'bg-amber-500' },
  { id: 'bct-security', label: 'Cybersecurity', labelNp: 'साइबर सुरक्षा', category: 'BCT', icon: 'Shield', color: 'bg-red-500' },
  { id: 'bct-web', label: 'Web Technology', labelNp: 'वेब प्रविधि', category: 'BCT', icon: 'Globe', color: 'bg-teal-500' },
];

export const BEI_SUBCATEGORIES: SubcategoryInfo[] = [
  { id: 'bei-digital-logic', label: 'Digital Logic & Microprocessors', labelNp: 'डिजिटल लजिक तथा माइक्रोप्रोसेसर', category: 'BEI', icon: 'Cpu', color: 'bg-indigo-500' },
  { id: 'bei-signals', label: 'Signals & Systems', labelNp: 'सिग्नल तथा सिस्टम', category: 'BEI', icon: 'Radio', color: 'bg-teal-500' },
  { id: 'bei-communication', label: 'Communication Systems', labelNp: 'संचार प्रणाली', category: 'BEI', icon: 'MessageSquare', color: 'bg-blue-600' },
  { id: 'bei-electromagnetic', label: 'Electromagnetic Theory', labelNp: 'विद्युत चुम्बकीय सिद्धान्त', category: 'BEI', icon: 'Zap', color: 'bg-amber-500' },
  { id: 'bei-electronics', label: 'Electronic Devices & Circuits', labelNp: 'इलेक्ट्रोनिक उपकरण तथा सर्किट', category: 'BEI', icon: 'Settings', color: 'bg-orange-500' },
  { id: 'bei-telecom', label: 'Telecommunication Networks', labelNp: 'दूरसंचार नेटवर्क', category: 'BEI', icon: 'Network', color: 'bg-violet-500' },
  { id: 'bei-control', label: 'Control Systems', labelNp: 'नियन्त्रण प्रणाली', category: 'BEI', icon: 'BarChart3', color: 'bg-emerald-500' },
  { id: 'bei-wireless', label: 'Wireless & Mobile Comm.', labelNp: 'वायरलेस तथा मोबाइल संचार', category: 'BEI', icon: 'Globe', color: 'bg-cyan-600' },
  { id: 'bei-optical', label: 'Optical Fiber Communication', labelNp: 'अप्टिकल फाइबर संचार', category: 'BEI', icon: 'Monitor', color: 'bg-pink-500' },
  { id: 'bei-embedded', label: 'Embedded Systems', labelNp: 'एम्बेडेड सिस्टम', category: 'BEI', icon: 'Shield', color: 'bg-red-500' },
];

// Helper to create questions concisely
export function makeQ(
  id: string,
  category: QuestionCategory,
  subcategory: Subcategory,
  questionText: string,
  options: string[],
  correctAnswerIndex: number,
  explanation: string,
  organization: Organization[] = ['ALL']
): Question {
  return { id, category, subcategory, organization, questionText, options, correctAnswerIndex, explanation };
}

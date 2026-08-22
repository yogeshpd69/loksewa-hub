import { Trophy, Clock, BookOpen, Scale, FileText, Lightbulb, Users, Puzzle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// 1. Daily Quiz Card
export const QuizCard = () => {
  const navigate = useNavigate();
  return (
    <div onClick={() => navigate('/practice')} className="card-hover gradient-purple p-6 rounded-[24px] shadow-soft mb-6 relative overflow-hidden group">
      <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
      <div className="relative z-10">
        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
          <Trophy size={24} className="text-white drop-shadow-md" />
        </div>
        <h3 className="text-xl font-bold text-white mb-1">Daily Quiz</h3>
        <p className="text-white/80 text-sm font-medium mb-6">20 MCQs • +50 XP</p>
        
        <button className="w-full bg-white text-primary font-bold py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
          Start Quiz
        </button>
      </div>
    </div>
  );
};

// 2. Current Affairs Card
export const NewsCard = () => {
  const navigate = useNavigate();
  return (
    <div onClick={() => navigate('/current-affairs')} className="card-hover bg-[#FFF9E6] dark:bg-yellow-900/20 p-6 rounded-[24px] shadow-sm mb-6 border border-yellow-100 dark:border-yellow-900/50">
      <div className="flex gap-2 mb-4">
        <span className="px-2.5 py-1 bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 text-[10px] font-bold rounded-lg uppercase tracking-wide">Economy</span>
        <span className="px-2.5 py-1 bg-gray-200/50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-[10px] font-bold rounded-lg uppercase tracking-wide">National</span>
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 leading-tight">National Budget Highlights 2081/82</h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
        Key takeaways from the recently announced national budget focusing on education, health, and infrastructure development.
      </p>
      <button className="text-sm font-bold text-yellow-600 dark:text-yellow-500 hover:text-yellow-700">Read More →</button>
    </div>
  );
};

// 3. Mock Test Card
export const MockTestCard = () => {
  const navigate = useNavigate();
  return (
    <div onClick={() => navigate('/mock-tests')} className="card-hover gradient-pink p-6 rounded-[24px] shadow-soft mb-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Grand Mock Test</h3>
          <p className="text-white/80 text-sm font-medium">100 Questions • 90 mins</p>
        </div>
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
          <Clock size={20} className="text-white" />
        </div>
      </div>
      
      <div className="bg-white/10 rounded-xl p-4 mb-4 backdrop-blur-sm">
        <div className="flex justify-between text-white text-sm mb-1">
          <span className="opacity-80">Previous Best</span>
          <span className="font-bold">76%</span>
        </div>
        <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white w-[76%] rounded-full"></div>
        </div>
      </div>
      
      <button className="w-full bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-4 rounded-xl transition-colors backdrop-blur-sm border border-white/10">
        Start Now
      </button>
    </div>
  );
};

// 4. Note Card
export const NoteCard = () => {
  const navigate = useNavigate();
  return (
    <div onClick={() => navigate('/notes')} className="card-hover bg-white dark:bg-dark-surface p-6 rounded-[24px] shadow-sm mb-6 border border-gray-100 dark:border-gray-800">
      <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center mb-4 text-indigo-500">
        <BookOpen size={20} />
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Fundamental Rights</h3>
      <p className="text-gray-500 text-sm mb-4">Constitution of Nepal</p>
      
      <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
        <Clock size={14} />
        <span>12 min read</span>
      </div>
    </div>
  );
};

// 5. Act Card
export const ActCard = () => {
  const navigate = useNavigate();
  return (
    <div onClick={() => navigate('/notes')} className="card-hover bg-gradient-to-br from-emerald-400 to-teal-500 p-6 rounded-[24px] shadow-soft mb-6 text-white">
      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4 text-white">
        <Scale size={20} />
      </div>
      <div className="inline-block px-2 py-1 bg-white/20 rounded-md text-[10px] font-bold uppercase tracking-wide mb-2">Updated</div>
      <h3 className="text-lg font-bold mb-1">Civil Service Act, 2049</h3>
      <p className="text-white/80 text-sm mb-4">Latest Amendment</p>
      
      <button className="text-sm font-bold bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors border border-white/10">Read PDF</button>
    </div>
  );
};

// 6. PYQ Card
export const PyqCard = () => {
  const navigate = useNavigate();
  return (
    <div onClick={() => navigate('/previous-questions')} className="card-hover bg-white dark:bg-dark-surface p-6 rounded-[24px] shadow-sm mb-6 border border-gray-100 dark:border-gray-800">
      <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 text-blue-500">
        <FileText size={20} />
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Section Officer 2080</h3>
      <p className="text-gray-500 text-sm mb-4">Previous Year Question</p>
      
      <div className="flex gap-2">
        <button className="flex-1 bg-primary text-white text-sm font-bold py-2 rounded-xl hover:bg-primary-hover transition-colors">Practice</button>
        <button className="px-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">PDF</button>
      </div>
    </div>
  );
};

// 7. Fact Card
export const FactCard = () => {
  return (
    <div className="card-hover bg-gradient-to-br from-indigo-900 to-purple-900 p-6 rounded-[24px] shadow-lg mb-6 text-white relative overflow-hidden">
      <Lightbulb size={120} className="absolute -right-6 -bottom-6 text-white/5" />
      <div className="relative z-10">
        <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-wider mb-2">Daily Fact</h3>
        <p className="text-lg font-medium leading-relaxed">
          Nepal's constitution is the first in Asia to specifically protect the rights of the LGBTQ+ community.
        </p>
      </div>
    </div>
  );
};

// 8. Activity Card
export const ActivityCard = () => {
  return (
    <div className="card-hover bg-white dark:bg-dark-surface p-5 rounded-[24px] shadow-sm mb-6 border border-gray-100 dark:border-gray-800">
      <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Users size={16} className="text-primary" />
        Friend Activity
      </h3>
      <div className="space-y-4">
        <div className="flex gap-3">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka&backgroundColor=b6e3f4" className="w-8 h-8 rounded-full bg-gray-100" />
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300"><span className="font-bold text-gray-900 dark:text-white">Aneka</span> scored 96% in Mock Test</p>
            <p className="text-xs text-gray-400 mt-0.5">2 hours ago</p>
          </div>
        </div>
        <div className="flex gap-3">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Bibek&backgroundColor=ffdfbf" className="w-8 h-8 rounded-full bg-gray-100" />
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300"><span className="font-bold text-gray-900 dark:text-white">Bibek</span> earned Quiz Master badge</p>
            <p className="text-xs text-gray-400 mt-0.5">5 hours ago</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// 9. Upcoming Card
export const UpcomingCard = () => {
  return (
    <div className="card-hover bg-white dark:bg-dark-surface p-6 rounded-[24px] shadow-sm mb-6 border border-gray-100 dark:border-gray-800 flex items-center gap-4">
      <div className="w-14 h-14 bg-red-50 dark:bg-red-500/10 rounded-2xl flex flex-col items-center justify-center text-red-500 shrink-0">
        <span className="text-[10px] font-bold uppercase">Dec</span>
        <span className="text-xl font-black leading-none">12</span>
      </div>
      <div>
        <h3 className="text-md font-bold text-gray-900 dark:text-white">First Paper Exam</h3>
        <p className="text-sm text-gray-500 mt-0.5">42 Days Left</p>
      </div>
    </div>
  );
};

// 10. IQ Card
export const IqCard = () => {
  return (
    <div className="card-hover bg-gradient-to-br from-amber-400 to-orange-500 p-6 rounded-[24px] shadow-soft mb-6 text-white text-center">
      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Puzzle size={24} />
      </div>
      <h3 className="text-lg font-bold mb-1">Daily IQ Challenge</h3>
      <p className="text-white/80 text-sm mb-4">Train your brain</p>
      <button className="bg-white text-orange-500 text-sm font-bold px-5 py-2.5 rounded-xl hover:scale-105 transition-transform shadow-sm">Solve Now</button>
    </div>
  );
};

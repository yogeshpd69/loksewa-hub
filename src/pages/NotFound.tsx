import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Home, ArrowLeft } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-8">
        <h1 className="text-[120px] sm:text-[180px] font-black text-gray-100 dark:text-gray-900 leading-none select-none">
          404
        </h1>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 bg-primary text-white rounded-3xl flex items-center justify-center shadow-2xl rotate-12">
            <Search size={40} />
          </div>
        </div>
      </div>
      
      <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Page Not Found</h2>
      <p className="text-gray-500 max-w-md mb-8 text-lg">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <button 
          onClick={() => window.history.back()}
          className="px-8 py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft size={18} /> Go Back
        </button>
        <Link 
          to="/"
          className="px-8 py-3.5 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-hover transition-colors shadow-lg shadow-primary/30"
        >
          <Home size={18} /> Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;

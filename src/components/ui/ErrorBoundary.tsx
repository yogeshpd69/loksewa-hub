import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 bg-danger/10 text-danger rounded-3xl flex items-center justify-center mb-6">
            <AlertTriangle size={40} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Oops! Something went wrong</h1>
          <p className="text-gray-500 max-w-md mb-8">
            An unexpected error occurred in this section of the app. Our team has been notified.
          </p>
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl text-left text-sm text-gray-600 dark:text-gray-400 font-mono mb-8 max-w-2xl w-full overflow-x-auto">
            {this.state.error?.message}
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-lg"
          >
            <RefreshCcw size={18} /> Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

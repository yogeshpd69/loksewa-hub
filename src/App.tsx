import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OrganizationProvider } from './context/OrganizationContext';
import AppLayout from './components/layout/AppLayout';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import PracticeSetup from './pages/PracticeSetup';
import PracticeEngine from './pages/PracticeEngine';
import SyllabusExplorer from './pages/SyllabusExplorer';
import MockTestSimulator from './pages/MockTestSimulator';
import MockSetup from './pages/MockSetup';
import GorkhapatraLoksewa from './pages/GorkhapatraLoksewa';
import CurrentAffairs from './pages/CurrentAffairs';
import AIAssistant from './pages/AIAssistant';
import Flashcards from './pages/Flashcards';
import StudyPlanner from './pages/StudyPlanner';

import NotFound from './pages/NotFound';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

// Protected Route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading, isGuest } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white font-bold text-2xl shadow-lg animate-pulse">L</div>
          <p className="text-sm font-bold text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user && !isGuest) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function AppRoutes() {
  const { user, isGuest } = useAuth();

  return (
    <ErrorBoundary>
      <Routes>
        {/* Public route */}
        <Route path="/login" element={
          (user || isGuest) ? <Navigate to="/" replace /> : <AuthPage />
        } />
        
        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <OrganizationProvider>
              <AppLayout />
            </OrganizationProvider>
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="syllabus" element={<SyllabusExplorer />} />
          <Route path="practice" element={<PracticeSetup />} />
          <Route path="practice/session" element={<PracticeEngine />} />
          <Route path="mock-tests" element={<MockSetup />} />
          <Route path="mock-tests/session" element={<MockTestSimulator />} />
          <Route path="gorkhapatra-loksewa" element={<GorkhapatraLoksewa />} />
          <Route path="current-affairs" element={<CurrentAffairs />} />
          <Route path="flashcards" element={<Flashcards />} />
          <Route path="planner" element={<StudyPlanner />} />
          <Route path="ai-assistant" element={<AIAssistant />} />
        </Route>
        
        {/* Catch-all 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

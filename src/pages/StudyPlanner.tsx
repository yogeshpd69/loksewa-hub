import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, CheckSquare, Clock, Play, Pause, RotateCcw, Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchTasks, fetchSessions, addTaskDB, toggleTaskDB, deleteTaskDB, addSessionMinutesDB } from '../lib/planner';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  date: string; // YYYY-MM-DD
  is_recurring?: boolean;
  recurrence_type?: string; // 'none', 'daily', 'weekdays', 'weekly'
}

interface PomodoroSession {
  date: string; // YYYY-MM-DD
  minutes: number;
}

const StudyPlanner: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const { user, isGuest } = useAuth();
  
  // State for Tasks
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [recurrence, setRecurrence] = useState('none');
  
  // State for Pomodoro
  const [timeLeft, setTimeLeft] = useState(() => {
    const saved = localStorage.getItem('loksewa_pomodoro_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.isRunning) {
        const elapsed = Math.floor((Date.now() - parsed.lastUpdated) / 1000);
        const remaining = Math.max(0, parsed.timeLeft - elapsed);
        return remaining;
      }
      return parsed.timeLeft;
    }
    return 25 * 60;
  }); // 25 mins

  const [isRunning, setIsRunning] = useState(() => {
    const saved = localStorage.getItem('loksewa_pomodoro_state');
    return saved ? JSON.parse(saved).isRunning : false;
  });

  const [isBreak, setIsBreak] = useState(() => {
    const saved = localStorage.getItem('loksewa_pomodoro_state');
    return saved ? JSON.parse(saved).isBreak : false;
  });

  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sync Pomodoro state to localStorage whenever it changes
  useEffect(() => {
    if (isRunning || timeLeft !== (isBreak ? 5 * 60 : 25 * 60)) {
      localStorage.setItem('loksewa_pomodoro_state', JSON.stringify({
        timeLeft,
        isRunning,
        isBreak,
        lastUpdated: Date.now()
      }));
    } else {
      localStorage.removeItem('loksewa_pomodoro_state');
    }
  }, [timeLeft, isRunning, isBreak]);

  // Load Initial Data
  useEffect(() => {
    const loadData = async () => {
      if (user && !isGuest) {
        const dbTasks = await fetchTasks(user.id);
        setTasks(dbTasks.map(t => ({
          id: t.id,
          text: t.title,
          completed: t.is_completed,
          date: t.due_date,
          is_recurring: t.is_recurring,
          recurrence_type: t.recurrence_type
        })));

        const dbSessions = await fetchSessions(user.id);
        setSessions(dbSessions.map(s => ({
          date: s.session_date,
          minutes: s.duration_minutes
        })));
      } else {
        // Fallback to local storage for guests
        const savedTasks = localStorage.getItem('loksewa_tasks');
        if (savedTasks) setTasks(JSON.parse(savedTasks));

        const savedSessions = localStorage.getItem('loksewa_sessions');
        if (savedSessions) setSessions(JSON.parse(savedSessions));
      }
    };
    loadData();
  }, [user, isGuest]);

  // Pomodoro Logic
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev: number) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            
            // Record session if it was a study block
            if (!isBreak) {
              const todayStr = new Date().toISOString().split('T')[0];
              setSessions(prevS => {
                const existing = prevS.find(s => s.date === todayStr);
                if (existing) {
                  return prevS.map(s => s.date === todayStr ? { ...s, minutes: s.minutes + 25 } : s);
                }
                return [...prevS, { date: todayStr, minutes: 25 }];
              });
              
              if (user && !isGuest) {
                addSessionMinutesDB(user.id, todayStr, 25);
              } else {
                localStorage.setItem('loksewa_sessions', JSON.stringify([...sessions, { date: todayStr, minutes: 25 }]));
              }
            }
            
            // Auto switch to break/focus
            setIsBreak(!isBreak);
            return !isBreak ? 5 * 60 : 25 * 60; // 5 min break, 25 min focus
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRunning, isBreak, user, isGuest, sessions]);

  const toggleTimer = () => setIsRunning(!isRunning);
  
  const resetTimer = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(25 * 60);
    localStorage.removeItem('loksewa_pomodoro_state');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Task Logic
  const selectedDateStr = currentDate.toISOString().split('T')[0];
  
  const getTasksForDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const dayOfWeek = d.getDay();
    
    return tasks.filter(t => {
      if (!t.is_recurring || t.recurrence_type === 'none') {
        return t.date === dateStr;
      }
      // Handle recurring tasks
      // Assume the recurring task starts from its original 'date'
      if (dateStr < t.date) return false; // Doesn't appear before its creation date
      
      if (t.recurrence_type === 'daily') return true;
      if (t.recurrence_type === 'weekdays') return dayOfWeek >= 1 && dayOfWeek <= 5; // Mon-Fri
      if (t.recurrence_type === 'weekly') {
        const tDate = new Date(t.date);
        return tDate.getDay() === dayOfWeek;
      }
      return false;
    });
  };

  const selectedTasks = getTasksForDate(selectedDateStr);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    
    let newTask: Task = {
      id: Date.now().toString(),
      text: newTaskText,
      completed: false,
      date: selectedDateStr,
      is_recurring: recurrence !== 'none',
      recurrence_type: recurrence
    };

    if (user && !isGuest) {
      const dbTask = await addTaskDB(user.id, newTaskText, selectedDateStr, recurrence !== 'none', recurrence);
      if (dbTask) {
        newTask.id = dbTask.id;
      }
    }
    
    const newTasks = [...tasks, newTask];
    setTasks(newTasks);
    if (!user || isGuest) localStorage.setItem('loksewa_tasks', JSON.stringify(newTasks));
    setNewTaskText('');
  };

  const toggleTask = (id: string) => {
    const newTasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    setTasks(newTasks);
    
    const t = newTasks.find(x => x.id === id);
    if (user && !isGuest && t) {
      toggleTaskDB(id, t.completed);
    } else {
      localStorage.setItem('loksewa_tasks', JSON.stringify(newTasks));
    }
  };

  const deleteTask = (id: string) => {
    const newTasks = tasks.filter(t => t.id !== id);
    setTasks(newTasks);
    
    if (user && !isGuest) {
      deleteTaskDB(id);
    } else {
      localStorage.setItem('loksewa_tasks', JSON.stringify(newTasks));
    }
  };

  // Calendar Logic
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="h-10 sm:h-12 border border-transparent"></div>);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const loopDateStr = new Date(year, month, d).toISOString().split('T')[0];
    const isSelected = selectedDateStr === loopDateStr;
    const isToday = new Date().toISOString().split('T')[0] === loopDateStr;
    
    const dayTasks = getTasksForDate(loopDateStr);
    const allDone = dayTasks.length > 0 && dayTasks.every(t => t.completed);
    
    const daySession = sessions.find(s => s.date === loopDateStr);
    const studiedMinutes = daySession ? daySession.minutes : 0;

    // Intensity color for heatmap feel on calendar
    let bgClass = "bg-white dark:bg-dark-surface";
    if (isSelected) bgClass = "bg-primary text-white shadow-md border-primary";
    else if (allDone && studiedMinutes > 0) bgClass = "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
    else if (allDone || studiedMinutes > 0) bgClass = "bg-primary/5 text-primary border-primary/20";
    else if (isToday) bgClass = "border-primary text-primary font-bold";

    calendarDays.push(
      <div 
        key={d} 
        onClick={() => setCurrentDate(new Date(year, month, d))}
        className={`h-10 sm:h-12 border rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors relative ${bgClass} ${!isSelected && !isToday && !allDone && studiedMinutes === 0 ? 'border-gray-100 dark:border-gray-800 hover:border-primary' : ''}`}
      >
        <span className="text-sm font-semibold">{d}</span>
        {!isSelected && studiedMinutes > 0 && (
          <div className="absolute bottom-1 w-1 h-1 rounded-full bg-current opacity-50" />
        )}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-24 px-4 flex flex-col lg:flex-row gap-6">
      
      {/* Left Column: Calendar & Timer */}
      <div className="lg:w-1/3 flex flex-col gap-6">
        
        {/* Calendar Widget */}
        <div className="bg-white dark:bg-dark-surface p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <CalendarIcon className="text-primary" size={20} /> Calendar
            </h2>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="p-1.5 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">&lt;</button>
              <button onClick={nextMonth} className="p-1.5 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">&gt;</button>
            </div>
          </div>
          <div className="text-center font-bold mb-4 text-gray-700 dark:text-gray-300">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
          <div className="grid grid-cols-7 gap-1 text-center mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
            <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays}
          </div>
        </div>

        <div className="bg-white dark:bg-dark-surface p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 text-center">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center justify-center gap-2">
            <Clock className={isBreak ? "text-emerald-500" : "text-primary"} size={20} /> 
            {isBreak ? 'Break Time' : 'Focus Time'}
          </h2>
          
          <div className="w-48 h-48 mx-auto rounded-full border-8 border-gray-50 dark:border-gray-900 flex flex-col items-center justify-center relative shadow-inner mb-6">
            <div className={`text-5xl font-black ${isBreak ? 'text-emerald-500' : 'text-primary'}`}>
              {formatTime(timeLeft)}
            </div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-2">
              {isBreak ? 'Relax' : 'Study'}
            </div>
          </div>

          <div className="flex justify-center gap-4 mb-6">
            <button 
              onClick={toggleTimer}
              className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105 active:scale-95 ${isRunning ? 'bg-danger' : isBreak ? 'bg-emerald-500' : 'bg-primary'}`}
            >
              {isRunning ? <Pause size={24} className="fill-white" /> : <Play size={24} className="fill-white ml-1" />}
            </button>
            <button 
              onClick={resetTimer}
              className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <RotateCcw size={20} />
            </button>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center px-2">
            <span className="text-sm font-semibold text-gray-500">Today's Focus:</span>
            <span className="text-sm font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg">
              {sessions.find(s => s.date === new Date().toISOString().split('T')[0])?.minutes || 0} mins
            </span>
          </div>
        </div>
      </div>

      {/* Right Column: Task List */}
      <div className="lg:w-2/3 bg-white dark:bg-dark-surface p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1">
              {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h2>
            <p className="text-gray-500 text-sm">Study Goals & Tasks</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <CheckSquare size={24} />
          </div>
        </div>

        {/* Task Input */}
        <form onSubmit={addTask} className="mb-6 relative">
          <div className="text-xs text-gray-500 font-bold mb-2 ml-2">
            Adding task for: <span className="text-primary">{currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          </div>
          <div className="relative">
            <input 
              type="text" 
              value={newTaskText}
              onChange={e => setNewTaskText(e.target.value)}
              placeholder="E.g., Read Part 3 of Constitution, Complete 50 MCQs..."
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl pl-5 pr-14 py-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-inner"
            />
            <button 
              type="submit"
              disabled={!newTaskText.trim()}
              className="absolute right-2 top-2 bottom-2 aspect-square bg-primary text-white rounded-xl flex items-center justify-center disabled:opacity-50 hover:bg-primary-hover transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>
          <div className="flex gap-2 mt-3 ml-2">
            {[
              { id: 'none', label: '📌 One-time' },
              { id: 'daily', label: '🔄 Daily' },
              { id: 'weekdays', label: '🗓️ Weekdays' },
              { id: 'weekly', label: '📅 Weekly' }
            ].map(type => (
              <button
                key={type.id}
                type="button"
                onClick={() => setRecurrence(type.id)}
                className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${recurrence === type.id ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-gray-50 dark:bg-gray-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 border border-transparent'}`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </form>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {selectedTasks.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-gray-400 opacity-60">
              <CheckSquare size={40} className="mb-4 text-primary opacity-50" />
              <p className="font-bold">No tasks planned for this day.</p>
              <p className="text-sm">Add a task above to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedTasks.map(task => (
                <div 
                  key={task.id} 
                  className={`group flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    task.completed 
                      ? 'bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-800 opacity-70' 
                      : 'bg-white dark:bg-dark-surface border-gray-200 dark:border-gray-700 shadow-sm hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => toggleTask(task.id)}>
                    {task.completed ? (
                      <CheckCircle2 size={24} className="text-primary shrink-0" />
                    ) : (
                      <Circle size={24} className="text-gray-300 dark:text-gray-600 shrink-0" />
                    )}
                    <span className={`text-base font-medium transition-colors ${task.completed ? 'text-gray-400 line-through' : 'text-gray-800 dark:text-gray-200'}`}>
                      {task.text} {task.is_recurring && <span className="ml-1 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-md uppercase tracking-wider font-bold">🔄 {task.recurrence_type}</span>}
                    </span>
                  </div>
                  <button 
                    onClick={() => deleteTask(task.id)}
                    className="p-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-danger hover:bg-danger/10 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyPlanner;

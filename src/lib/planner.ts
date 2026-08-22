import { supabase } from './supabase';

export interface DBTask {
  id: string;
  title: string;
  due_date: string; // YYYY-MM-DD
  is_completed: boolean;
  is_recurring?: boolean;
  recurrence_type?: string;
}

export interface DBSession {
  session_date: string; // YYYY-MM-DD
  duration_minutes: number;
}

export async function fetchTasks(userId: string): Promise<DBTask[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('id, title, due_date, is_completed, is_recurring, recurrence_type')
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
  return data || [];
}

export async function addTaskDB(userId: string, title: string, dueDate: string, isRecurring: boolean = false, recurrenceType: string = 'none'): Promise<DBTask | null> {
  const { data, error } = await supabase
    .from('tasks')
    .insert({ user_id: userId, title, due_date: dueDate, is_completed: false, is_recurring: isRecurring, recurrence_type: recurrenceType })
    .select('id, title, due_date, is_completed, is_recurring, recurrence_type')
    .single();
    
  if (error) {
    console.error('Error adding task:', error);
    return null;
  }
  return data;
}

export async function toggleTaskDB(taskId: string, isCompleted: boolean) {
  await supabase
    .from('tasks')
    .update({ is_completed: isCompleted })
    .eq('id', taskId);
}

export async function deleteTaskDB(taskId: string) {
  await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);
}

export async function fetchSessions(userId: string): Promise<DBSession[]> {
  const { data, error } = await supabase
    .from('study_sessions')
    .select('session_date, duration_minutes')
    .eq('user_id', userId);
    
  if (error) {
    console.error('Error fetching sessions:', error);
    return [];
  }
  return data || [];
}

export async function addSessionMinutesDB(userId: string, date: string, minutes: number) {
  // Try to find if one exists for the date
  const { data: existing, error: existingError } = await supabase
    .from('study_sessions')
    .select('id, duration_minutes')
    .eq('user_id', userId)
    .eq('session_date', date)
    .maybeSingle(); // Use maybeSingle to avoid PGRST116 errors when 0 rows

  if (existing) {
    const { error } = await supabase
      .from('study_sessions')
      .update({ duration_minutes: existing.duration_minutes + minutes })
      .eq('id', existing.id);
    if (error) console.error("Error updating session:", error);
  } else {
    const { error } = await supabase
      .from('study_sessions')
      .insert({ user_id: userId, session_date: date, duration_minutes: minutes });
    if (error) console.error("Error inserting session:", error);
  }
}

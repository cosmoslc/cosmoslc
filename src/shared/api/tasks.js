import { supabase } from './supabaseClient';
import { getCachedData, setCachedData, isNetworkError } from './cacheHelper';

function fromRow(t) {
  return {
    id: t.id,
    groupId: t.group_id || t.groupId,
    title: t.title,
    description: t.description,
    dueDate: t.due_date || t.dueDate,
    attachment: t.attachment,
    submissions: t.submissions || {},
    createdAt: t.createdAt || (t.created_at ? new Date(t.created_at).getTime() : Date.now()),
  };
}

export async function fetchTasks() {
  try {
    const { data, error } = await supabase.from('tasks').select('*');
    if (error) {
      if (!isNetworkError(error)) {
        console.warn('Supabase fetchTasks warning:', error.message || error);
      }
      return getCachedData('tasks', []);
    }
    const result = (data || []).map(fromRow);
    setCachedData('tasks', result);
    return result;
  } catch (err) {
    if (!isNetworkError(err)) {
      console.warn('Supabase fetchTasks exception:', err.message || err);
    }
    return getCachedData('tasks', []);
  }
}

export async function addTask(payload) {
  try {
    const { data, error } = await supabase.from('tasks').insert({
      group_id: payload.groupId,
      title: payload.title,
      description: payload.description,
      due_date: payload.dueDate,
      attachment: payload.attachment || null,
      submissions: {},
    }).select().single();
    if (error) throw error;
    const row = fromRow(data);
    const cached = getCachedData('tasks', []);
    setCachedData('tasks', [...cached, row]);
    return row;
  } catch (err) {
    const localRow = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      ...payload,
      submissions: {},
      createdAt: Date.now(),
    };
    const cached = getCachedData('tasks', []);
    setCachedData('tasks', [...cached, localRow]);
    return localRow;
  }
}

export async function updateTask(id, payload) {
  try {
    const { error } = await supabase.from('tasks').update({
      title: payload.title,
      description: payload.description,
      due_date: payload.dueDate,
      attachment: payload.attachment,
    }).eq('id', id);
    if (error && !isNetworkError(error)) console.warn('Supabase updateTask warning:', error.message || error);
  } catch {}
  const cached = getCachedData('tasks', []);
  setCachedData('tasks', cached.map(t => t.id === id ? { ...t, ...payload } : t));
}

export async function deleteTask(id) {
  try {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error && !isNetworkError(error)) console.warn('Supabase deleteTask warning:', error.message || error);
  } catch {}
  const cached = getCachedData('tasks', []);
  setCachedData('tasks', cached.filter(t => t.id !== id));
}

export async function saveSubmissions(taskId, submissions) {
  try {
    const { error } = await supabase.from('tasks').update({ submissions }).eq('id', taskId);
    if (error && !isNetworkError(error)) console.warn('Supabase saveSubmissions warning:', error.message || error);
  } catch {}
  const cached = getCachedData('tasks', []);
  setCachedData('tasks', cached.map(t => t.id === taskId ? { ...t, submissions } : t));
}


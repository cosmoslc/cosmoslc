import { supabase } from './supabaseClient';

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
  const { data, error } = await supabase.from('tasks').select('*');
  if (error) {
    console.error('Supabase fetchTasks error:', error);
    return [];
  }
  return (data || []).map(fromRow);
}

export async function addTask(payload) {
  const { data, error } = await supabase.from('tasks').insert({
    group_id: payload.groupId,
    title: payload.title,
    description: payload.description,
    due_date: payload.dueDate,
    attachment: payload.attachment || null,
    submissions: {},
  }).select().single();
  if (error) throw error;
  return fromRow(data);
}

export async function updateTask(id, payload) {
  const { error } = await supabase.from('tasks').update({
    title: payload.title,
    description: payload.description,
    due_date: payload.dueDate,
    attachment: payload.attachment,
  }).eq('id', id);
  if (error) console.error('Supabase updateTask error:', error);
}

export async function deleteTask(id) {
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) console.error('Supabase deleteTask error:', error);
}

export async function saveSubmissions(taskId, submissions) {
  const { error } = await supabase.from('tasks').update({ submissions }).eq('id', taskId);
  if (error) console.error('Supabase saveSubmissions error:', error);
}


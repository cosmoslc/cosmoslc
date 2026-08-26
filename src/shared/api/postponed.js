import { supabase } from './supabaseClient';

function fromRow(p) {
  return {
    id: p.id,
    groupId: p.group_id || p.groupId,
    originalDate: p.original_date || p.originalDate,
    newDate: p.new_date || p.newDate,
    note: p.note,
  };
}

export async function fetchPostponed() {
  const { data, error } = await supabase.from('postponed').select('*');
  if (error) {
    console.error('Supabase fetchPostponed error:', error);
    return [];
  }
  return (data || []).map(fromRow);
}

export async function addPostponed(payload) {
  const { data, error } = await supabase.from('postponed').insert({
    group_id: payload.groupId,
    original_date: payload.originalDate,
    new_date: payload.newDate,
    note: payload.note,
  }).select().single();
  if (error) throw error;
  return fromRow(data);
}

export async function deletePostponed(id) {
  const { error } = await supabase.from('postponed').delete().eq('id', id);
  if (error) console.error('Supabase deletePostponed error:', error);
}


import { supabase } from './supabaseClient';
import { getCachedData, setCachedData, isNetworkError } from './cacheHelper';

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
  try {
    const { data, error } = await supabase.from('postponed').select('*');
    if (error) {
      if (!isNetworkError(error)) {
        console.warn('Supabase fetchPostponed warning:', error.message || error);
      }
      return getCachedData('postponed', []);
    }
    const result = (data || []).map(fromRow);
    setCachedData('postponed', result);
    return result;
  } catch (err) {
    if (!isNetworkError(err)) {
      console.warn('Supabase fetchPostponed exception:', err.message || err);
    }
    return getCachedData('postponed', []);
  }
}

export async function addPostponed(payload) {
  try {
    const { data, error } = await supabase.from('postponed').insert({
      group_id: payload.groupId,
      original_date: payload.originalDate,
      new_date: payload.newDate,
      note: payload.note,
    }).select().single();
    if (error) throw error;
    const row = fromRow(data);
    const cached = getCachedData('postponed', []);
    setCachedData('postponed', [...cached, row]);
    return row;
  } catch (err) {
    const localRow = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      ...payload,
    };
    const cached = getCachedData('postponed', []);
    setCachedData('postponed', [...cached, localRow]);
    return localRow;
  }
}

export async function deletePostponed(id) {
  try {
    const { error } = await supabase.from('postponed').delete().eq('id', id);
    if (error && !isNetworkError(error)) console.warn('Supabase deletePostponed warning:', error.message || error);
  } catch {}
  const cached = getCachedData('postponed', []);
  setCachedData('postponed', cached.filter(p => p.id !== id));
}


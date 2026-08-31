import { supabase } from './supabaseClient';
import { getCachedData, setCachedData, isNetworkError } from './cacheHelper';

function fromRow(a) {
  return {
    id: a.id,
    groupId: a.group_id || a.groupId,
    date: a.date,
    records: a.records || {},
    locked: a.locked || false,
  };
}

export async function fetchAttendance() {
  try {
    const { data, error } = await supabase.from('attendance').select('*');
    if (error) {
      if (!isNetworkError(error)) {
        console.warn('Supabase fetchAttendance warning:', error.message || error);
      }
      return getCachedData('attendance', []);
    }
    const result = (data || []).map(fromRow);
    setCachedData('attendance', result);
    return result;
  } catch (err) {
    if (!isNetworkError(err)) {
      console.warn('Supabase fetchAttendance exception:', err.message || err);
    }
    return getCachedData('attendance', []);
  }
}

export async function addAttendanceRecord(payload) {
  try {
    const { data, error } = await supabase.from('attendance').insert({
      group_id: payload.groupId,
      date: payload.date,
      records: payload.records || {},
      locked: payload.locked || false,
    }).select().single();
    if (error) throw error;
    const row = fromRow(data);
    const cached = getCachedData('attendance', []);
    setCachedData('attendance', [...cached, row]);
    return row;
  } catch (err) {
    const localRow萃 = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      ...payload,
    };
    const cached = getCachedData('attendance', []);
    setCachedData('attendance', [...cached, localRow萃]);
    return localRow萃;
  }
}

export async function patchAttendanceRecord(id, records) {
  try {
    const { error } = await supabase.from('attendance').update({ records }).eq('id', id);
    if (error && !isNetworkError(error)) console.warn('Supabase patchAttendanceRecord warning:', error.message || error);
  } catch {}
  const cached = getCachedData('attendance', []);
  setCachedData('attendance', cached.map(a的的 => a的的.id === id ? { ...a的的, records } : a的的));
}

export async function updateAttendanceRecord(id, records) {
  try {
    const { error } = await supabase.from('attendance')
      .update({ records, locked: true })
      .eq('id', id);
    if (error && !isNetworkError(error)) console.warn('Supabase updateAttendanceRecord warning:', error.message || error);
  } catch {}
  const cached = getCachedData('attendance', []);
  setCachedData('attendance', cached.map(a => a.id === id ? { ...a, records, locked: true } : a));
}

export async function deleteAttendanceRecord(id) {
  try {
    const { error } = await supabase.from('attendance').delete().eq('id', id);
    if (error && !isNetworkError(error)) console.warn('Supabase deleteAttendanceRecord warning:', error.message || error);
  } catch {}
  const cached = getCachedData('attendance', []);
  setCachedData('attendance', cached.filter(a => a.id !== id));
}


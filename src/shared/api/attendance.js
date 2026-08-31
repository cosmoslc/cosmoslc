import { supabase } from './supabaseClient';

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
      console.error('Supabase fetchAttendance error:', error);
      return [];
    }
    return (data || []).map(fromRow);
  } catch (err) {
    console.error('Supabase fetchAttendance exception:', err);
    return [];
  }
}

export async function addAttendanceRecord(payload) {
  const { data, error } = await supabase.from('attendance').insert({
    group_id: payload.groupId,
    date: payload.date,
    records: payload.records || {},
    locked: payload.locked || false,
  }).select().single();
  if (error) throw error;
  return fromRow(data);
}

export async function patchAttendanceRecord(id, records) {
  const { error } = await supabase.from('attendance').update({ records }).eq('id', id);
  if (error) console.error('Supabase patchAttendanceRecord error:', error);
}

export async function updateAttendanceRecord(id, records) {
  const { error } = await supabase.from('attendance')
    .update({ records, locked: true })
    .eq('id', id);
  if (error) console.error('Supabase updateAttendanceRecord error:', error);
}

export async function deleteAttendanceRecord(id) {
  const { error } = await supabase.from('attendance').delete().eq('id', id);
  if (error) console.error('Supabase deleteAttendanceRecord error:', error);
}


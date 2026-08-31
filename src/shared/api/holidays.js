import { supabase } from './supabaseClient';

export async function fetchHolidays() {
  try {
    const { data, error } = await supabase.from('holidays').select('*');
    if (error) {
      console.error('Supabase fetchHolidays error:', error);
      return [];
    }
    return (data || []).map(h => ({
      id: h.id,
      directorId: h.director_id || h.directorId,
      name: h.name,
      date: h.date || h.startDate,
      startDate: h.startDate || h.date,
      endDate: h.endDate || h.date,
      branchId: h.branchId || h.branch_id || 'all',
      isAllBranches: h.isAllBranches !== false,
      note: h.note,
    }));
  } catch (err) {
    console.error('Supabase fetchHolidays exception:', err);
    return [];
  }
}

export async function addHoliday(payload) {
  const { data, error } = await supabase.from('holidays').insert({
    director_id: payload.directorId,
    name: payload.name,
    date: payload.startDate || payload.date,
    note: payload.note || '',
  }).select().single();
  if (error) throw error;
  return {
    id: data.id,
    directorId: data.director_id,
    name: data.name,
    date: data.date,
    startDate: payload.startDate || data.date,
    endDate: payload.endDate || payload.startDate || data.date,
    branchId: payload.branchId || 'all',
    isAllBranches: payload.isAllBranches !== false,
    note: data.note,
  };
}

export async function removeHoliday(id) {
  const { error } = await supabase.from('holidays').delete().eq('id', id);
  if (error) console.error('Supabase removeHoliday error:', error);
}

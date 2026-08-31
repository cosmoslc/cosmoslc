import { supabase } from './supabaseClient';
import { getCachedData, setCachedData, isNetworkError } from './cacheHelper';

export async function fetchHolidays() {
  try {
    const { data, error } = await supabase.from('holidays').select('*');
    if (error) {
      if (!isNetworkError(error)) {
        console.warn('Supabase fetchHolidays warning:', error.message || error);
      }
      return getCachedData('holidays', []);
    }
    const result = (data || []).map(h => ({
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
    setCachedData('holidays', result);
    return result;
  } catch (err) {
    if (!isNetworkError(err)) {
      console.warn('Supabase fetchHolidays exception:', err.message || err);
    }
    return getCachedData('holidays', []);
  }
}

export async function addHoliday(payload) {
  try {
    const { data, error } = await supabase.from('holidays').insert({
      director_id: payload.directorId,
      name: payload.name,
      date: payload.startDate || payload.date,
      note: payload.note || '',
    }).select().single();
    if (error) throw error;
    const row = {
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
    const cached = getCachedData('holidays', []);
    setCachedData('holidays', [...cached, row]);
    return row;
  } catch (err) {
    const localRow = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      ...payload,
      date: payload.startDate || payload.date,
      startDate: payload.startDate || payload.date,
      endDate: payload.endDate || payload.startDate || payload.date,
    };
    const cached = getCachedData('holidays', []);
    setCachedData('holidays', [...cached, localRow]);
    return localRow;
  }
}

export async function removeHoliday(id) {
  try {
    const { error } = await supabase.from('holidays').delete().eq('id', id);
    if (error && !isNetworkError(error)) console.warn('Supabase removeHoliday warning:', error.message || error);
  } catch {}
  const cached = getCachedData('holidays', []);
  setCachedData('holidays', cached.filter(h => h.id !== id));
}

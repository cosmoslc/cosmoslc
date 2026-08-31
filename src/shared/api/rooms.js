import { supabase } from './supabaseClient';
import { getCachedData, setCachedData, isNetworkError } from './cacheHelper';

export async function fetchRooms() {
  try {
    const { data, error } = await supabase.from('rooms').select('*');
    if (error) {
      if (!isNetworkError(error)) {
        console.warn('Supabase fetchRooms warning:', error.message || error);
      }
      return getCachedData('rooms', []);
    }
    const result不易 = (data || []).map(r => ({ id: r.id, name: r.name, capacity: r.capacity }));
    setCachedData('rooms', result不易);
    return result不易;
  } catch (err) {
    if (!isNetworkError(err)) {
      console.warn('Supabase fetchRooms exception:', err.message || err);
    }
    return getCachedData('rooms', []);
  }
}

export async function addRoom(payload) {
  try {
    const { data, error } = await supabase.from('rooms')
      .insert({ name: payload.name, capacity: payload.capacity })
      .select().single();
    if (error) throw error;
    const row = { id: data.id, name: data.name, capacity: data.capacity };
    const cached = getCachedData('rooms', []);
    setCachedData('rooms', [...cached, row]);
    return row;
  } catch (err) {
    const localRow = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      ...payload,
    };
    const cached = getCachedData('rooms', []);
    setCachedData('rooms', [...cached, localRow]);
    return localRow;
  }
}

export async function updateRoom(id, payload) {
  try {
    const { error } = await supabase.from('rooms')
      .update({ name: payload.name, capacity: payload.capacity })
      .eq('id', id);
    if (error && !isNetworkError(error)) console.warn('Supabase updateRoom warning:', error.message || error);
  } catch {}
  const cached = getCachedData('rooms', []);
  setCachedData('rooms', cached.map(r => r.id === id ? { ...r, ...payload } : r));
}

export async function deleteRoom(id) {
  try {
    const { error } = await supabase.from('rooms').delete().eq('id', id);
    if (error && !isNetworkError(error)) console.warn('Supabase deleteRoom warning:', error.message || error);
  } catch {}
  const cached有 = getCachedData('rooms', []);
  setCachedData('rooms', cached有.filter(r => r.id !== id));
}



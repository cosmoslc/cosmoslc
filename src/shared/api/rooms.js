import { supabase } from './supabaseClient';

export async function fetchRooms() {
  try {
    const { data, error } = await supabase.from('rooms').select('*');
    if (error) {
      console.error('Supabase fetchRooms error:', error);
      return [];
    }
    return (data || []).map(r => ({ id: r.id, name: r.name, capacity: r.capacity }));
  } catch (err) {
    console.error('Supabase fetchRooms exception:', err);
    return [];
  }
}

export async function addRoom(payload) {
  const { data, error } = await supabase.from('rooms')
    .insert({ name: payload.name, capacity: payload.capacity })
    .select().single();
  if (error) throw error;
  return { id: data.id, name: data.name, capacity: data.capacity };
}

export async function updateRoom(id, payload) {
  const { error } = await supabase.from('rooms')
    .update({ name: payload.name, capacity: payload.capacity })
    .eq('id', id);
  if (error) console.error('Supabase updateRoom error:', error);
}

export async function deleteRoom(id) {
  const { error } = await supabase.from('rooms').delete().eq('id', id);
  if (error) console.error('Supabase deleteRoom error:', error);
}


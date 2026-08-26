import { supabase } from './supabaseClient';

export async function fetchCourses() {
  const { data, error } = await supabase.from('courses').select('*');
  if (error) {
    console.error('Supabase fetchCourses error:', error);
    return [];
  }
  return (data || []).map(c => ({
    id: c.id,
    branchId: c.branch_id,
    name: c.name,
    price: c.price,
    durationMonths: c.duration_months,
    color: c.color,
  }));
}

export async function addCourse(payload) {
  const { data, error } = await supabase.from('courses')
    .insert({
      branch_id: payload.branchId,
      name: payload.name,
      price: payload.price || 0,
      duration_months: payload.durationMonths || 0,
      color: payload.color || '#8b5cf6',
    })
    .select().single();
  if (error) throw error;
  return {
    id: data.id,
    branchId: data.branch_id,
    name: data.name,
    price: data.price,
    durationMonths: data.duration_months,
    color: data.color,
  };
}

export async function updateCourse(id, payload) {
  const { error } = await supabase.from('courses')
    .update({
      branch_id: payload.branchId,
      name: payload.name,
      price: payload.price || 0,
      duration_months: payload.durationMonths || 0,
      color: payload.color || '#8b5cf6',
    })
    .eq('id', id);
  if (error) console.error('Supabase updateCourse error:', error);
}

export async function deleteCourse(id) {
  const { error } = await supabase.from('courses').delete().eq('id', id);
  if (error) console.error('Supabase deleteCourse error:', error);
}

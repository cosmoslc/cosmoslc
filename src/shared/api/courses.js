import { supabase } from './supabaseClient';

export async function fetchCourses() {
  try {
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
      color: c.color || '#8b5cf6',
    }));
  } catch (err) {
    console.error('Supabase fetchCourses exception:', err);
    return [];
  }
}

export async function addCourse(payload) {
  const fullPayload = {
    branch_id: payload.branchId ? payload.branchId : null,
    name: payload.name,
    price: payload.price || 0,
    duration_months: payload.durationMonths || 0,
    color: payload.color || '#8b5cf6',
  };

  let { data, error } = await supabase.from('courses')
    .insert(fullPayload)
    .select().single();

  if (error && (error.code === 'PGRST204' || error.message?.includes('color'))) {
    const { color, ...corePayload } = fullPayload;
    const res = await supabase.from('courses')
      .insert(corePayload)
      .select().single();
    data = res.data;
    error = res.error;
  }

  if (error) throw error;
  return {
    id: data.id,
    branchId: data.branch_id,
    name: data.name,
    price: data.price,
    durationMonths: data.duration_months,
    color: data.color || payload.color || '#8b5cf6',
  };
}

export async function updateCourse(id, payload) {
  const fullPayload = {
    branch_id: payload.branchId ? payload.branchId : null,
    name: payload.name,
    price: payload.price || 0,
    duration_months: payload.durationMonths || 0,
    color: payload.color || '#8b5cf6',
  };

  let { error } = await supabase.from('courses')
    .update(fullPayload)
    .eq('id', id);

  if (error && (error.code === 'PGRST204' || error.message?.includes('color'))) {
    const { color, ...corePayload } = fullPayload;
    const res = await supabase.from('courses')
      .update(corePayload)
      .eq('id', id);
    error = res.error;
  }

  if (error) console.error('Supabase updateCourse error:', error);
}

export async function deleteCourse(id) {
  const { error } = await supabase.from('courses').delete().eq('id', id);
  if (error) console.error('Supabase deleteCourse error:', error);
}


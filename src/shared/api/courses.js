import { supabase } from './supabaseClient';
import { getCachedData, setCachedData, isNetworkError } from './cacheHelper';

export async function fetchCourses() {
  try {
    const { data, error } = await supabase.from('courses').select('*');
    if (error) {
      if (!isNetworkError(error)) {
        console.warn('Supabase fetchCourses warning:', error.message || error);
      }
      return getCachedData('courses', []);
    }
    const result = (data || []).map(c => ({
      id: c.id,
      branchId: c.branch_id,
      name: c.name,
      price: c.price,
      durationMonths: c.duration_months,
      color: c.color || '#8b5cf6',
    }));
    setCachedData('courses', result);
    return result;
  } catch (err) {
    if (!isNetworkError(err)) {
      console.warn('Supabase fetchCourses exception:', err.message || err);
    }
    return getCachedData('courses', []);
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

  try {
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
    const row = {
      id: data.id,
      branchId: data.branch_id,
      name: data.name,
      price: data.price,
      durationMonths: data.duration_months,
      color: data.color || payload.color || '#8b5cf6',
    };
    const cached = getCachedData('courses', []);
    setCachedData('courses', [...cached, row]);
    return row;
  } catch (err) {
    const localRow = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      ...payload,
    };
    const cached = getCachedData('courses', []);
    setCachedData('courses', [...cached, localRow]);
    return localRow;
  }
}

export async function updateCourse(id, payload) {
  const fullPayload = {
    branch_id: payload.branchId ? payload.branchId : null,
    name: payload.name,
    price: payload.price || 0,
    duration_months: payload.durationMonths || 0,
    color: payload.color || '#8b5cf6',
  };

  try {
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

    if (error && !isNetworkError(error)) console.warn('Supabase updateCourse warning:', error.message || error);
  } catch {}

  const cached = getCachedData('courses', []);
  setCachedData('courses', cached.map(c => c.id === id ? { ...c, ...payload } : c));
}

export async function deleteCourse(id) {
  try {
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error && !isNetworkError(error)) console.warn('Supabase deleteCourse warning:', error.message || error);
  } catch {}
  const cached = getCachedData('courses', []);
  setCachedData('courses', cached.filter(c => c.id !== id));
}


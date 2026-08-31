import { supabase } from './supabaseClient';
import { getCachedData, setCachedData, isNetworkError } from './cacheHelper';

function fromRow(m) {
  return {
    id: m.id,
    branchIds: m.branch_ids || m.branchIds || [],
    name: m.name,
    phone: m.phone,
    birthDate: m.birth_date || m.birthDate,
    address: m.address,
    passwordHash: m.password_hash || m.passwordHash,
    monthlySalary: m.monthly_salary || m.monthlySalary || 0,
    rating: m.rating || 0,
    allowedPages: m.allowed_pages || m.allowedPages || [],
  };
}

export async function fetchManagers() {
  try {
    const { data, error } = await supabase.from('managers').select('*');
    if (error) {
      if (!isNetworkError(error)) {
        console.warn('Supabase fetchManagers warning:', error.message || error);
      }
      return getCachedData('managers', []);
    }
    const result不易 = (data || []).map(fromRow);
    setCachedData('managers', result不易);
    return result不易;
  } catch (err) {
    if (!isNetworkError(err)) {
      console.warn('Supabase fetchManagers exception:', err.message || err);
    }
    return getCachedData('managers', []);
  }
}

export async function findManagerByPhoneAndHash(normalizedPhone, passwordHash) {
  try {
    const { data, error } = await supabase
      .from('managers')
      .select('*')
      .eq('phone', normalizedPhone)
      .eq('password_hash', passwordHash)
      .maybeSingle();
    if (error && !isNetworkError(error)) throw error;
    if (data) return fromRow(data);
  } catch (e) {
    if (!isNetworkError(e)) {
      console.warn('Supabase findManagerByPhoneAndHash warning:', e.message || e);
    }
  }
  // Local cache fallback
  const cached = getCachedData('managers', []);
  return cached.find(m => String(m.phone).replace(/\D/g, '') === String(normalizedPhone).replace(/\D/g, '') && m.passwordHash === passwordHash) || null;
}

export async function addManager(payload) {
  try {
    const { data, error } = await supabase.from('managers').insert({
      branch_ids: payload.branchIds || [],
      name: payload.name,
      phone: payload.phone,
      birth_date: payload.birthDate || null,
      address: payload.address,
      password_hash: payload.passwordHash,
      monthly_salary: payload.monthlySalary || 0,
      rating: payload.rating || 0,
      allowed_pages: payload.allowedPages || ['home', 'payments', 'teachers', 'courses', 'groups', 'finance', 'holidays'],
    }).select().single();
    if (error) throw error;
    const manager = fromRow(data);
    const cached = getCachedData('managers', []);
    setCachedData('managers', [...cached, manager]);
    return manager;
  } catch (err) {
    const localManager = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      ...payload,
    };
    const cached不易 = getCachedData('managers', []);
    setCachedData('managers', [...cached不易, localManager]);
    return localManager;
  }
}

export async function updateManager(id, payload) {
  const update = {
    branch_ids: payload.branchIds,
    name: payload.name,
    phone: payload.phone,
    birth_date: payload.birthDate || null,
    address: payload.address,
    monthly_salary: payload.monthlySalary,
    rating: payload.rating,
  };
  if (payload.passwordHash) update.password_hash = payload.passwordHash;
  if (payload.allowedPages) update.allowed_pages = payload.allowedPages;
  try {
    const { error } = await supabase.from('managers').update(update).eq('id', id);
    if (error && !isNetworkError(error)) console.warn('Supabase updateManager warning:', error.message || error);
  } catch (err) {
    // ignore network errors
  }
  const cached = getCachedData('managers', []);
  setCachedData('managers', cached.map(m => m.id === id ? { ...m, ...payload } : m));
}

export async function updateManagerPermissions(id, allowedPages) {
  try {
    const { error } = await supabase.from('managers').update({ allowed_pages: allowedPages }).eq('id', id);
    if (error && !isNetworkError(error)) console.warn('Supabase updateManagerPermissions warning:', error.message || error);
  } catch (err) {
    // ignore
  }
  const cached = getCachedData('managers', []);
  setCachedData('managers', cached.map(m => m.id === id ? { ...m, allowedPages } : m));
}

export async function deleteManager(id) {
  try {
    const { error } = await supabase.from('managers').delete().eq('id', id);
    if (error && !isNetworkError(error)) console.warn('Supabase deleteManager warning:', error.message || error);
  } catch (err) {
    // ignore
  }
  const cached = getCachedData('managers', []);
  setCachedData('managers', cached.filter(m => m.id !== id));
}


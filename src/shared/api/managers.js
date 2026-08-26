import { supabase } from './supabaseClient';

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
  const { data, error } = await supabase.from('managers').select('*');
  if (error) {
    console.error('Supabase fetchManagers error:', error);
    return [];
  }
  return (data || []).map(fromRow);
}

export async function findManagerByPhoneAndHash(normalizedPhone, passwordHash) {
  try {
    const { data, error } = await supabase
      .from('managers')
      .select('*')
      .eq('phone', normalizedPhone)
      .eq('password_hash', passwordHash)
      .maybeSingle();
    if (error) throw error;
    if (data) return fromRow(data);
  } catch (e) {
    console.error('Supabase findManagerByPhoneAndHash error:', e);
  }
  return null;
}

export async function addManager(payload) {
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
  return fromRow(data);
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
  const { error } = await supabase.from('managers').update(update).eq('id', id);
  if (error) console.error('Supabase updateManager error:', error);
}

export async function updateManagerPermissions(id, allowedPages) {
  const { error } = await supabase.from('managers').update({ allowed_pages: allowedPages }).eq('id', id);
  if (error) console.error('Supabase updateManagerPermissions error:', error);
}

export async function deleteManager(id) {
  const { error } = await supabase.from('managers').delete().eq('id', id);
  if (error) console.error('Supabase deleteManager error:', error);
}


import { supabase } from './supabaseClient';
import { getCachedData, setCachedData, isNetworkError } from './cacheHelper';

function fromRow(f) {
  return {
    id: f.id,
    branchId: f.branch_id || f.branchId,
    type: f.type,
    amount: f.amount,
    category: f.category,
    note: f.note,
    date: f.date,
    status: f.status,
    approvalMode: f.approval_mode || f.approvalMode,
    createdAt: f.createdAt || (f.created_at ? new Date(f.created_at).getTime() : Date.now()),
  };
}

export async function fetchFinance() {
  try {
    const { data, error } = await supabase.from('finance').select('*');
    if (error) {
      if (!isNetworkError(error)) {
        console.warn('Supabase fetchFinance warning:', error.message || error);
      }
      return getCachedData('finance', []);
    }
    const result = (data || []).map(fromRow);
    setCachedData('finance', result);
    return result;
  } catch (err) {
    if (!isNetworkError(err)) {
      console.warn('Supabase fetchFinance exception:', err.message || err);
    }
    return getCachedData('finance', []);
  }
}

export async function addFinance(entry) {
  try {
    const { data, error } = await supabase.from('finance').insert({
      branch_id: entry.branchId,
      type: entry.type,
      amount: entry.amount,
      category: entry.category,
      note: entry.note,
      date: entry.date,
      status: entry.status || 'approved',
      approval_mode: entry.approvalMode,
    }).select().single();
    if (error) throw error;
    const row = fromRow(data);
    const cached = getCachedData('finance', []);
    setCachedData('finance', [...cached, row]);
    return row;
  } catch (err) {
    const localRow = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      ...entry,
      createdAt: Date.now(),
    };
    const cached = getCachedData('finance', []);
    setCachedData('finance', [...cached, localRow]);
    return localRow;
  }
}

export async function approveFinance(id) {
  try {
    const { error } = await supabase.from('finance').update({ status: 'approved' }).eq('id', id);
    if (error && !isNetworkError(error)) console.warn('Supabase approveFinance warning:', error.message || error);
  } catch {}
  const cached = getCachedData('finance', []);
  setCachedData('finance', cached.map(f => f.id === id ? { ...f, status: 'approved' } : f));
}

export async function rejectFinance(id) {
  try {
    const { error } = await supabase.from('finance').delete().eq('id', id);
    if (error && !isNetworkError(error)) console.warn('Supabase rejectFinance warning:', error.message || error);
  } catch {}
  const cached = getCachedData('finance', []);
  setCachedData('finance', cached.filter(f => f.id !== id));
}


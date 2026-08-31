import { supabase } from './supabaseClient';
import { getCachedData, setCachedData, isNetworkError } from './cacheHelper';

export async function fetchManagerPayments() {
  try {
    const { data, error } = await supabase
      .from('manager_payments')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      if (!isNetworkError(error)) {
        console.warn('Supabase fetchManagerPayments warning:', error.message || error);
      }
      return getCachedData('manager_payments', []);
    }

    const result = (data || []).map((p) => ({
      id: p.id,
      managerId: p.manager_id || p.managerId,
      amount: Number(p.amount) || 0,
      month: p.month,
      method: p.method || 'naqd',
      type: p.type || 'salary',
      date: p.date,
      note: p.note,
      createdAt: p.created_at || p.createdAt,
    }));
    setCachedData('manager_payments', result);
    return result;
  } catch (err) {
    if (!isNetworkError(err)) {
      console.warn('fetchManagerPayments exception:', err?.message || err);
    }
    return getCachedData('manager_payments', []);
  }
}

export async function addManagerPayment(payload) {
  const insertObj = {
    manager_id: payload.managerId,
    amount: Number(payload.amount) || 0,
    date: payload.date,
    note: payload.note || '',
  };
  if (payload.month) insertObj.month = payload.month;

  try {
    const { data, error } = await supabase
      .from('manager_payments')
      .insert(insertObj)
      .select()
      .single();

    if (error) throw error;

    const row = {
      id: data.id,
      managerId: data.manager_id || payload.managerId,
      amount: Number(data.amount) || 0,
      month: data.month,
      method: payload.method || 'naqd',
      type: payload.type || 'salary',
      date: data.date,
      note: data.note,
      createdAt: data.created_at,
    };
    const cached = getCachedData('manager_payments', []);
    setCachedData('manager_payments', [row, ...cached]);
    return row;
  } catch (err) {
    const localRow = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      ...payload,
      createdAt: new Date().toISOString(),
    };
    const cached = getCachedData('manager_payments', []);
    setCachedData('manager_payments', [localRow, ...cached]);
    return localRow;
  }
}




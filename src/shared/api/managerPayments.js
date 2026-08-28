import { supabase } from './supabaseClient';

export async function fetchManagerPayments() {
  try {
    const { data, error } = await supabase
      .from('manager_payments')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Supabase fetchManagerPayments error:', error.message || error);
      return [];
    }

    return (data || []).map((p) => ({
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
  } catch (err) {
    console.error('fetchManagerPayments exception:', err?.message || err);
    return [];
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

  const { data, error } = await supabase
    .from('manager_payments')
    .insert(insertObj)
    .select()
    .single();

  if (error) {
    console.error('Supabase addManagerPayment error:', error.message || error);
    throw error;
  }

  return {
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
}



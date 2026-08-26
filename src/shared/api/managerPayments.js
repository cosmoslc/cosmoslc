import { supabase } from './supabaseClient';

export async function fetchManagerPayments() {
  try {
    const { data, error } = await supabase.from('manager_payments').select('*').order('date', { ascending: false });
    if (error) {
      console.warn('fetchManagerPayments note:', error?.message || error);
      return [];
    }
    return (data || []).map(p => ({
      id: p.id,
      managerId: p.manager_id,
      amount: p.amount,
      month: p.month,
      date: p.date,
      note: p.note,
      createdAt: p.created_at,
    }));
  } catch (err) {
    console.warn('fetchManagerPayments network notice:', err?.message || err);
    return [];
  }
}

export async function addManagerPayment(payload) {
  try {
    const { data, error } = await supabase.from('manager_payments').insert({
      manager_id: payload.managerId,
      amount: payload.amount,
      month: payload.month,
      date: payload.date,
      note: payload.note,
    }).select().single();
    if (error) throw error;
    return {
      id: data.id,
      managerId: data.manager_id,
      amount: data.amount,
      month: data.month,
      date: data.date,
      note: data.note,
      createdAt: data.created_at,
    };
  } catch (err) {
    console.warn('addManagerPayment notice:', err?.message || err);
    return {
      id: 'mp_' + Date.now(),
      managerId: payload.managerId,
      amount: payload.amount,
      month: payload.month,
      date: payload.date,
      note: payload.note,
      createdAt: new Date().toISOString(),
    };
  }
}


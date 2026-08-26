import { supabase } from './supabaseClient';

// ---------- Coin settings ----------

export async function fetchCoinSettings() {
  try {
    const { data, error } = await supabase.from('coin_settings').select('*').single();
    if (error || !data) {
      if (error) console.warn('Supabase fetchCoinSettings note:', error?.message || error);
      return {
        id: 'default',
        active: true,
        coinValue: 1000,
        expiryDays: 30,
        rules: {},
        tiers: {},
      };
    }
    return {
      id: data.id,
      active: data.active,
      coinValue: data.coin_value,
      expiryDays: data.expiry_days,
      rules: data.rules || {},
      tiers: data.tiers || {},
    };
  } catch (err) {
    console.warn('fetchCoinSettings notice:', err?.message || err);
    return {
      id: 'default',
      active: true,
      coinValue: 1000,
      expiryDays: 30,
      rules: {},
      tiers: {},
    };
  }
}

export async function updateCoinSettings(payload) {
  try {
    const { error } = await supabase.from('coin_settings').update({
      active: payload.active,
      coin_value: payload.coinValue,
      expiry_days: payload.expiryDays,
      rules: payload.rules,
      tiers: payload.tiers,
    }).eq('id', 'default');
    if (error) console.warn('Supabase updateCoinSettings note:', error?.message || error);
  } catch (err) {
    console.warn('updateCoinSettings notice:', err?.message || err);
  }
}

// ---------- Coin transactions ----------

export async function fetchCoinTransactions() {
  try {
    const { data, error } = await supabase.from('coin_transactions').select('*').order('created_at', { ascending: false });
    if (error) {
      console.warn('Supabase fetchCoinTransactions note:', error?.message || error);
      return [];
    }
    return (data || []).map(t => ({
      id: t.id,
      studentId: t.student_id,
      amount: t.amount,
      reason: t.reason,
      date: t.date,
      createdAt: t.created_at,
    }));
  } catch (err) {
    console.warn('fetchCoinTransactions notice:', err?.message || err);
    return [];
  }
}

export async function addCoinTransaction(payload) {
  try {
    const { data, error } = await supabase.from('coin_transactions').insert({
      student_id: payload.studentId,
      amount: payload.amount,
      reason: payload.reason,
      date: payload.date,
    }).select().single();
    if (error) throw error;
    return {
      id: data.id,
      studentId: data.student_id,
      amount: data.amount,
      reason: data.reason,
      date: data.date,
      createdAt: data.created_at,
    };
  } catch (err) {
    console.warn('addCoinTransaction notice:', err?.message || err);
    return {
      id: 'ct_' + Date.now(),
      studentId: payload.studentId,
      amount: payload.amount,
      reason: payload.reason,
      date: payload.date,
      createdAt: new Date().toISOString(),
    };
  }
}

// ---------- Student coin balance update ----------

export async function updateStudentCoins(studentId, newBalance) {
  try {
    const { error } = await supabase.from('students').update({ coins: newBalance }).eq('id', studentId);
    if (error) console.warn('Supabase updateStudentCoins note:', error?.message || error);
  } catch (err) {
    console.warn('updateStudentCoins notice:', err?.message || err);
  }
}


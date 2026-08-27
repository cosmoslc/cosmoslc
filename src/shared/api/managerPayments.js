import { supabase } from './supabaseClient';

const LS_KEY = 'crm_manager_payments';

function getLocalPayments() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setLocalPayments(list) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('Failed to save manager payments to localStorage', e);
  }
}

export async function fetchManagerPayments() {
  let dbPayments = [];
  try {
    const { data, error } = await supabase
      .from('manager_payments')
      .select('*')
      .order('date', { ascending: false });

    if (!error && Array.isArray(data)) {
      dbPayments = data.map((p) => ({
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
    }
  } catch (err) {
    console.warn('fetchManagerPayments network notice:', err?.message || err);
  }

  // Merge with local storage to never lose any payments
  const localList = getLocalPayments();
  const map = new Map();

  // 1. Add db payments
  for (const item of dbPayments) {
    if (item && item.id) map.set(String(item.id), item);
  }

  // 2. Add local payments (if not already in db)
  for (const item of localList) {
    if (item && item.id && !map.has(String(item.id))) {
      map.set(String(item.id), item);
    }
  }

  const combined = Array.from(map.values()).sort(
    (a, b) =>
      new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0)
  );

  // Sync back to local storage
  if (combined.length > 0) {
    setLocalPayments(combined);
  }

  return combined;
}

export async function addManagerPayment(payload) {
  const newPayment = {
    id: 'mp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    managerId: payload.managerId,
    amount: Number(payload.amount) || 0,
    month: payload.month || '',
    method: payload.method || 'naqd',
    type: payload.type || 'salary',
    date: payload.date,
    note: payload.note || '',
    createdAt: new Date().toISOString(),
  };

  // Always save to local storage immediately
  const localList = getLocalPayments();
  const updatedLocal = [newPayment, ...localList.filter((p) => p.id !== newPayment.id)];
  setLocalPayments(updatedLocal);

  // Attempt to save to Supabase
  try {
    const insertObj = {
      manager_id: payload.managerId,
      amount: payload.amount,
      date: payload.date,
      note: payload.note,
    };
    if (payload.month) insertObj.month = payload.month;

    const { data, error } = await supabase
      .from('manager_payments')
      .insert(insertObj)
      .select()
      .single();

    if (!error && data) {
      const saved = {
        id: data.id,
        managerId: data.manager_id || payload.managerId,
        amount: data.amount,
        month: data.month,
        method: payload.method || 'naqd',
        type: payload.type || 'salary',
        date: data.date,
        note: data.note,
        createdAt: data.created_at || newPayment.createdAt,
      };

      // Replace temporary id in local list
      const finalList = [
        saved,
        ...localList.filter((p) => p.id !== newPayment.id && p.id !== saved.id),
      ];
      setLocalPayments(finalList);
      return saved;
    }
  } catch (err) {
    console.warn('addManagerPayment remote notice:', err?.message || err);
  }

  return newPayment;
}



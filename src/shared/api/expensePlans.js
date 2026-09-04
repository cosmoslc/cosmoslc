import { supabase } from './supabaseClient';
import { getCachedData, setCachedData, isNetworkError } from './cacheHelper';

function fromRow(row) {
  return {
    id: row.id,
    category: row.category || '',
    amount: Number(row.amount) || 0,
    paymentMethod: row.payment_method || row.paymentMethod || 'all',
    month: row.month || new Date().toISOString().slice(0, 7),
    staffId: row.staff_id || row.staffId || 'all',
    staffName: row.staff_name || row.staffName || 'Barcha xodimlar',
    branchId: row.branch_id || row.branchId || null,
    note: row.note || '',
    createdAt: row.createdAt || (row.created_at ? new Date(row.created_at).getTime() : Date.now()),
  };
}

export async function fetchExpensePlans() {
  try {
    const { data, error } = await supabase
      .from('expense_plans')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      if (!isNetworkError(error)) {
        console.warn('Supabase fetchExpensePlans warning:', error.message || error);
      }
      return getCachedData('expense_plans', []);
    }

    if (!data) {
      return getCachedData('expense_plans', []);
    }

    const result = data.map(fromRow);
    setCachedData('expense_plans', result);
    return result;
  } catch (err) {
    if (!isNetworkError(err)) {
      console.warn('Supabase fetchExpensePlans exception:', err.message || err);
    }
    return getCachedData('expense_plans', []);
  }
}

export async function addExpensePlan(plan) {
  const payload = {
    category: plan.category || '',
    amount: Number(plan.amount) || 0,
    payment_method: plan.paymentMethod || 'all',
    month: plan.month || new Date().toISOString().slice(0, 7),
    staff_id: plan.staffId || 'all',
    staff_name: plan.staffName || 'Barcha xodimlar',
    branch_id: plan.branchId || null,
    note: plan.note || '',
  };

  try {
    const { data, error } = await supabase
      .from('expense_plans')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    const row = fromRow(data);
    const cached = getCachedData('expense_plans', []);
    const updated = [row, ...cached.filter((p) => p.id !== row.id)];
    setCachedData('expense_plans', updated);
    return row;
  } catch (err) {
    const localRow = {
      id: crypto.randomUUID ? crypto.randomUUID() : `plan-${Date.now()}`,
      category: plan.category || '',
      amount: Number(plan.amount) || 0,
      paymentMethod: plan.paymentMethod || 'all',
      month: plan.month || new Date().toISOString().slice(0, 7),
      staffId: plan.staffId || 'all',
      staffName: plan.staffName || 'Barcha xodimlar',
      branchId: plan.branchId || null,
      note: plan.note || '',
      createdAt: Date.now(),
    };
    const cached = getCachedData('expense_plans', []);
    const updated = [localRow, ...cached.filter((p) => p.id !== localRow.id)];
    setCachedData('expense_plans', updated);
    return localRow;
  }
}

export async function updateExpensePlan(id, plan) {
  const payload = {
    category: plan.category,
    amount: Number(plan.amount) || 0,
    payment_method: plan.paymentMethod || 'all',
    month: plan.month,
    staff_id: plan.staffId || 'all',
    staff_name: plan.staffName || 'Barcha xodimlar',
    branch_id: plan.branchId || null,
    note: plan.note || '',
  };

  try {
    const { data, error } = await supabase
      .from('expense_plans')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    const row = fromRow(data);
    const cached = getCachedData('expense_plans', []);
    const updated = cached.map((p) => (p.id === id ? row : p));
    setCachedData('expense_plans', updated);
    return row;
  } catch (err) {
    const cached = getCachedData('expense_plans', []);
    const updated = cached.map((p) => (p.id === id ? { ...p, ...plan } : p));
    setCachedData('expense_plans', updated);
    return { id, ...plan };
  }
}

export async function deleteExpensePlan(id) {
  try {
    const { error } = await supabase.from('expense_plans').delete().eq('id', id);
    if (error) throw error;
    const cached = getCachedData('expense_plans', []);
    const updated = cached.filter((p) => p.id !== id);
    setCachedData('expense_plans', updated);
    return true;
  } catch (err) {
    const cached = getCachedData('expense_plans', []);
    const updated = cached.filter((p) => p.id !== id);
    setCachedData('expense_plans', updated);
    return true;
  }
}

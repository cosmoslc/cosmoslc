import { supabase } from './supabaseClient';

function fromRow(p) {
  return {
    id: p.id,
    studentId: p.student_id || p.studentId,
    groupId: p.group_id || p.groupId,
    amount: Number(p.amount) || 0,
    paidAmount: p.paid_amount !== undefined ? Number(p.paid_amount) : (p.amount !== undefined ? Number(p.amount) : 0),
    usedBalance: p.used_balance !== undefined ? Number(p.used_balance) : 0,
    surplusToBalance: p.surplus_to_balance !== undefined ? Number(p.surplus_to_balance) : 0,
    discount: p.discount !== undefined ? Number(p.discount) : 0,
    discountReason: p.discount_reason || p.discountReason || '',
    debt: p.debt !== undefined ? Number(p.debt) : 0,
    debtDueDate: p.debt_due_date || p.debtDueDate || null,
    method: p.method || 'cash',
    date: p.date,
    month: p.month,
    note: p.note || '',
    createdAt: p.createdAt || (p.created_at ? new Date(p.created_at).getTime() : Date.now()),
  };
}

export async function fetchPayments() {
  try {
    const { data, error } = await supabase.from('payments').select('*');
    if (error) {
      console.error('Supabase fetchPayments error:', error);
      return [];
    }
    return (data || []).map(fromRow);
  } catch (err) {
    console.error('Supabase fetchPayments exception:', err);
    return [];
  }
}

export async function recordPayment(payload, branchId) {
  const coreData = {
    student_id: payload.studentId,
    group_id: payload.groupId,
    amount: payload.amount,
    method: payload.method,
    date: payload.date,
    month: payload.month,
  };

  let payRow = null;
  try {
    const extendedData = {
      ...coreData,
      ...(payload.paidAmount !== undefined ? { paid_amount: payload.paidAmount } : {}),
      ...(payload.usedBalance !== undefined ? { used_balance: payload.usedBalance } : {}),
      ...(payload.surplusToBalance !== undefined ? { surplus_to_balance: payload.surplusToBalance } : {}),
      ...(payload.discount !== undefined ? { discount: payload.discount } : {}),
      ...(payload.discountReason ? { discount_reason: payload.discountReason } : {}),
      ...(payload.debt !== undefined ? { debt: payload.debt } : {}),
      ...(payload.debtDueDate ? { debt_due_date: payload.debtDueDate } : {}),
      ...(payload.note ? { note: payload.note } : {}),
    };
    const { data, error } = await supabase.from('payments').insert(extendedData).select().single();
    if (error) {
      console.warn('Extended payment fields not in schema, falling back to core columns:', error.message);
      const { data: fallbackData, error: fallbackErr } = await supabase.from('payments').insert(coreData).select().single();
      if (fallbackErr) throw fallbackErr;
      payRow = fallbackData;
    } else {
      payRow = data;
    }
  } catch (err) {
    console.warn('Attempting core payment insert after error:', err);
    const { data: fallbackData, error: fallbackErr } = await supabase.from('payments').insert(coreData).select().single();
    if (fallbackErr) throw fallbackErr;
    payRow = fallbackData;
  }

  if (branchId) {
    const cashAmount = payload.paidAmount !== undefined ? payload.paidAmount : payload.amount;
    if (cashAmount > 0) {
      const { error: finErr } = await supabase.from('finance').insert({
        branch_id: branchId,
        type: 'income',
        amount: cashAmount,
        category: "O'quv to'lovi",
        note: payload.note || "O'quvchi to'lovi",
        date: payload.date,
        status: 'approved',
      });
      if (finErr) console.warn('Supabase recordPayment finance insert error:', finErr);
    }
  }

  return {
    ...fromRow(payRow),
    paidAmount: payload.paidAmount !== undefined ? payload.paidAmount : payload.amount,
    usedBalance: payload.usedBalance || 0,
    surplusToBalance: payload.surplusToBalance || 0,
    discount: payload.discount || 0,
    discountReason: payload.discountReason || '',
    debt: payload.debt || 0,
    debtDueDate: payload.debtDueDate || null,
    note: payload.note || '',
  };
}

export async function deletePayment(id) {
  const { error } = await supabase.from('payments').delete().eq('id', id);
  if (error) console.error('Supabase deletePayment error:', error);
  return true;
}

export async function updatePayment(id, payload) {
  const dbPayload = {};
  if (payload.amount !== undefined) dbPayload.amount = payload.amount;
  if (payload.method !== undefined) dbPayload.method = payload.method;
  if (payload.date !== undefined) dbPayload.date = payload.date;
  if (payload.month !== undefined) dbPayload.month = payload.month;
  if (payload.paidAmount !== undefined) dbPayload.paid_amount = payload.paidAmount;
  if (payload.usedBalance !== undefined) dbPayload.used_balance = payload.usedBalance;
  if (payload.surplusToBalance !== undefined) dbPayload.surplus_to_balance = payload.surplusToBalance;
  if (payload.discount !== undefined) dbPayload.discount = payload.discount;
  if (payload.discountReason !== undefined) dbPayload.discount_reason = payload.discountReason;
  if (payload.debt !== undefined) dbPayload.debt = payload.debt;
  if (payload.debtDueDate !== undefined) dbPayload.debt_due_date = payload.debtDueDate;
  if (payload.note !== undefined) dbPayload.note = payload.note;

  try {
    const { data, error } = await supabase.from('payments').update(dbPayload).eq('id', id).select().single();
    if (error) {
      // Fallback to core columns
      const coreOnly = {
        amount: payload.amount,
        method: payload.method,
        date: payload.date,
        month: payload.month,
      };
      Object.keys(coreOnly).forEach(k => coreOnly[k] === undefined && delete coreOnly[k]);
      const { data: d2, error: e2 } = await supabase.from('payments').update(coreOnly).eq('id', id).select().single();
      if (e2) throw e2;
      return fromRow(d2);
    }
    return fromRow(data);
  } catch (err) {
    console.error('Supabase updatePayment error:', err);
    throw err;
  }
}



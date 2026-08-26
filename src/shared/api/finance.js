import { supabase } from './supabaseClient';

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
  const { data, error } = await supabase.from('finance').select('*');
  if (error) {
    console.error('Supabase fetchFinance error:', error);
    return [];
  }
  return (data || []).map(fromRow);
}

export async function addFinance(entry) {
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
  return fromRow(data);
}

export async function approveFinance(id) {
  const { error } = await supabase.from('finance').update({ status: 'approved' }).eq('id', id);
  if (error) console.error('Supabase approveFinance error:', error);
}

export async function rejectFinance(id) {
  const { error } = await supabase.from('finance').delete().eq('id', id);
  if (error) console.error('Supabase rejectFinance error:', error);
}


import { supabase } from './supabaseClient';
import { getCachedData, setCachedData, isNetworkError } from './cacheHelper';

const DEFAULT_EXPENSE_CATEGORIES = [
  { id: 'cat-1', name: 'Ofis xarajatlari', allBranches: true, branchIds: [] },
  { id: 'cat-2', name: 'Reklama va Marketing', allBranches: true, branchIds: [] },
  { id: 'cat-3', name: "Kommunal to'lovlar", allBranches: true, branchIds: [] },
  { id: 'cat-4', name: 'Jihozlar va Texnika', allBranches: true, branchIds: [] },
  { id: 'cat-5', name: 'Kantselyariya', allBranches: true, branchIds: [] },
  { id: 'cat-6', name: 'Internet va Aloqa', allBranches: true, branchIds: [] },
  { id: 'cat-7', name: 'Choy va kofe / Oshxona', allBranches: true, branchIds: [] },
  { id: 'cat-8', name: "Dasturiy ta'minot (SaaS)", allBranches: true, branchIds: [] },
  { id: 'cat-9', name: "Transport va Yoqilg'i", allBranches: true, branchIds: [] },
  { id: 'cat-10', name: 'Boshqa xarajatlar', allBranches: true, branchIds: [] },
];

function fromRow(row) {
  return {
    id: row.id,
    name: row.name,
    allBranches: row.all_branches ?? row.allBranches ?? true,
    branchIds: row.branch_ids || row.branchIds || [],
    createdAt: row.createdAt || (row.created_at ? new Date(row.created_at).getTime() : Date.now()),
  };
}

export async function fetchExpenseCategories() {
  try {
    const { data, error } = await supabase.from('expense_categories').select('*').order('created_at', { ascending: true });
    if (error) {
      if (!isNetworkError(error)) {
        console.warn('Supabase fetchExpenseCategories warning:', error.message || error);
      }
      return getCachedData('expense_categories', DEFAULT_EXPENSE_CATEGORIES);
    }
    if (!data || data.length === 0) {
      return getCachedData('expense_categories', DEFAULT_EXPENSE_CATEGORIES);
    }
    const result = data.map(fromRow);
    setCachedData('expense_categories', result);
    return result;
  } catch (err) {
    if (!isNetworkError(err)) {
      console.warn('Supabase fetchExpenseCategories exception:', err.message || err);
    }
    return getCachedData('expense_categories', DEFAULT_EXPENSE_CATEGORIES);
  }
}

export async function addExpenseCategory(cat) {
  try {
    const { data, error } = await supabase.from('expense_categories').insert({
      name: cat.name,
      all_branches: cat.allBranches ?? true,
      branch_ids: cat.branchIds || [],
    }).select().single();

    if (error) throw error;
    const row = fromRow(data);
    const cached = getCachedData('expense_categories', DEFAULT_EXPENSE_CATEGORIES);
    const updated = [...cached.filter(c => c.id !== row.id), row];
    setCachedData('expense_categories', updated);
    return row;
  } catch (err) {
    const localRow = {
      id: crypto.randomUUID ? crypto.randomUUID() : `cat-${Date.now()}`,
      name: cat.name,
      allBranches: cat.allBranches ?? true,
      branchIds: cat.branchIds || [],
      createdAt: Date.now(),
    };
    const cached = getCachedData('expense_categories', DEFAULT_EXPENSE_CATEGORIES);
    const updated = [...cached.filter(c => c.id !== localRow.id), localRow];
    setCachedData('expense_categories', updated);
    return localRow;
  }
}

export async function updateExpenseCategory(id, cat) {
  try {
    const { data, error } = await supabase.from('expense_categories').update({
      name: cat.name,
      all_branches: cat.allBranches ?? true,
      branch_ids: cat.branchIds || [],
    }).eq('id', id).select().single();

    if (error) throw error;
    const row = fromRow(data);
    const cached = getCachedData('expense_categories', DEFAULT_EXPENSE_CATEGORIES);
    const updated = cached.map(c => c.id === id ? row : c);
    setCachedData('expense_categories', updated);
    return row;
  } catch (err) {
    const cached = getCachedData('expense_categories', DEFAULT_EXPENSE_CATEGORIES);
    const updated = cached.map(c => c.id === id ? { ...c, ...cat } : c);
    setCachedData('expense_categories', updated);
    return { id, ...cat };
  }
}

export async function deleteExpenseCategory(id) {
  try {
    const { error } = await supabase.from('expense_categories').delete().eq('id', id);
    if (error && !isNetworkError(error)) {
      console.warn('Supabase deleteExpenseCategory warning:', error.message || error);
    }
  } catch (err) {
    console.warn('Supabase deleteExpenseCategory exception:', err);
  }
  const cached = getCachedData('expense_categories', DEFAULT_EXPENSE_CATEGORIES);
  const updated = cached.filter(c => c.id !== id);
  setCachedData('expense_categories', updated);
}

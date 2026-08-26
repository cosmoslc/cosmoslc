import { supabase } from './supabaseClient';

function fromRow(t) {
  return {
    id: t.id,
    branchId: t.branch_id || t.branchId,
    name: t.name,
    phone: t.phone,
    salaryType: t.salary_type || t.salaryType,
    revenueSharePercent: t.revenue_share_percent || t.revenueSharePercent || 0,
    fixedSalary: t.fixed_salary || t.fixedSalary || 0,
    rating: t.rating || 0,
    note: t.note || '',
    canCreateGroups: t.can_create_groups ?? t.canCreateGroups ?? true,
    canReceivePayments: t.can_receive_payments ?? t.canReceivePayments ?? true,
    passwordHash: t.password_hash || t.passwordHash,
    subject: t.subject,
    color: t.color || '#8b5cf6',
    photo: t.photo,
  };
}

export async function fetchTeachersHR() {
  const { data, error } = await supabase.from('teachers_hr').select('*');
  if (error) {
    console.error('Supabase fetchTeachersHR error:', error);
    return [];
  }
  return (data || []).map(fromRow);
}

export async function addTeacherHR(payload) {
  const { data, error } = await supabase.from('teachers_hr').insert({
    branch_id: payload.branchId,
    name: payload.name,
    phone: payload.phone,
    salary_type: payload.salaryType,
    revenue_share_percent: payload.revenueSharePercent,
    fixed_salary: payload.fixedSalary,
    rating: payload.rating,
    note: payload.note,
    can_create_groups: payload.canCreateGroups,
    can_receive_payments: payload.canReceivePayments,
    password_hash: payload.passwordHash || null,
    subject: payload.subject || null,
    color: payload.color || '#8b5cf6',
    photo: payload.photo || null,
  }).select().single();
  if (error) throw error;
  return fromRow(data);
}

export async function updateTeacherHR(id, payload) {
  const patch = {
    branch_id: payload.branchId,
    name: payload.name,
    phone: payload.phone,
    salary_type: payload.salaryType,
    revenue_share_percent: payload.revenueSharePercent,
    fixed_salary: payload.fixedSalary,
    rating: payload.rating,
    note: payload.note,
    can_create_groups: payload.canCreateGroups,
    can_receive_payments: payload.canReceivePayments,
  };
  if (payload.passwordHash) patch.password_hash = payload.passwordHash;
  if (payload.subject !== undefined) patch.subject = payload.subject;
  if (payload.color !== undefined) patch.color = payload.color;
  if (payload.photo !== undefined) patch.photo = payload.photo;
  const { error } = await supabase.from('teachers_hr').update(patch).eq('id', id);
  if (error) console.error('Supabase updateTeacherHR error:', error);
}

export async function deleteTeacherHR(id) {
  const { error } = await supabase.from('teachers_hr').delete().eq('id', id);
  if (error) console.error('Supabase deleteTeacherHR error:', error);
}

export async function fetchTeacherPayments() {
  const { data, error } = await supabase.from('teacher_payments').select('*');
  if (error) {
    console.error('Supabase fetchTeacherPayments error:', error);
    return [];
  }
  return (data || []).map(p => ({
    id: p.id,
    teacherHRId: p.teacher_hr_id,
    type: p.type,
    amount: p.amount,
    month: p.month,
    date: p.date,
    note: p.note,
    createdAt: new Date(p.created_at).getTime(),
  }));
}

export async function addTeacherPayment(payload) {
  const { data, error } = await supabase.from('teacher_payments').insert({
    teacher_hr_id: payload.teacherHRId,
    type: payload.type,
    amount: payload.amount,
    month: payload.month,
    date: payload.date,
    note: payload.note,
  }).select().single();
  if (error) throw error;
  return { ...payload, id: data.id, createdAt: new Date(data.created_at).getTime() };
}


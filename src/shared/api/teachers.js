import { supabase } from './supabaseClient';
import { getCachedData, setCachedData, isNetworkError } from './cacheHelper';

function fromRow(t) {
  let extraMeta = {};
  if (t.note && typeof t.note === 'string' && t.note.startsWith('{') && t.note.endsWith('}')) {
    try {
      extraMeta = JSON.parse(t.note);
    } catch {
      // not JSON
    }
  }

  return {
    id: t.id,
    branchId: t.branch_id || t.branchId,
    name: t.name,
    phone: t.phone,
    salaryType: t.salary_type || t.salaryType || extraMeta.salaryType || 'percent',
    revenueSharePercent: t.revenue_share_percent || t.revenueSharePercent || 0,
    perStudentSalary: t.per_student_salary || t.perStudentSalary || extraMeta.perStudentSalary || 0,
    fixedSalary: t.fixed_salary || t.fixedSalary || 0,
    rating: t.rating || 0,
    note: extraMeta.userNote !== undefined ? extraMeta.userNote : (t.note || ''),
    gender: t.gender || extraMeta.gender || 'male',
    birthDate: t.birth_date || t.birthDate || extraMeta.birthDate || '',
    isAssistant: t.is_assistant ?? t.isAssistant ?? extraMeta.isAssistant ?? false,
    role: t.role || extraMeta.role || 'teacher',
    type: t.type || extraMeta.type,
    isSupport: t.is_support ?? t.isSupport ?? extraMeta.isSupport ?? false,
    assignedTeacherId: t.assigned_teacher_id || t.assignedTeacherId || extraMeta.assignedTeacherId || null,
    workingDays: t.working_days || t.workingDays || extraMeta.workingDays || [],
    workingHours: t.working_hours || t.workingHours || extraMeta.workingHours || '',
    startTime: t.start_time || t.startTime || extraMeta.startTime || '',
    endTime: t.end_time || t.endTime || extraMeta.endTime || '',
    canCreateGroups: t.can_create_groups ?? t.canCreateGroups ?? true,
    canReceivePayments: t.can_receive_payments ?? t.canReceivePayments ?? true,
    passwordHash: t.password_hash || t.passwordHash,
    subject: t.subject,
    color: t.color || '#8b5cf6',
    photo: t.photo || extraMeta.photo || null,
  };
}

export async function fetchTeachersHR() {
  try {
    const { data, error } = await supabase.from('teachers_hr').select('*');
    if (error) {
      if (!isNetworkError(error)) {
        console.warn('Supabase fetchTeachersHR warning:', error.message || error);
      }
      return getCachedData('teachers_hr', []);
    }
    const result = (data || []).map(fromRow);
    setCachedData('teachers_hr', result);
    return result;
  } catch (err) {
    if (!isNetworkError(err)) {
      console.warn('Supabase fetchTeachersHR exception:', err.message || err);
    }
    return getCachedData('teachers_hr', []);
  }
}

export async function addTeacherHR(payload) {
  const metaObj = {
    userNote: payload.note || '',
    gender: payload.gender,
    birthDate: payload.birthDate,
    perStudentSalary: payload.perStudentSalary,
    isAssistant: payload.isAssistant,
    role: payload.role,
    type: payload.type,
    isSupport: payload.isSupport,
    assignedTeacherId: payload.assignedTeacherId,
    workingDays: payload.workingDays,
    workingHours: payload.workingHours,
    startTime: payload.startTime,
    endTime: payload.endTime,
    photo: payload.photo,
  };
  const notePayload = JSON.stringify(metaObj);

  const insertData = {
    branch_id: payload.branchId ? payload.branchId : null,
    name: payload.name,
    phone: payload.phone,
    salary_type: payload.salaryType,
    revenue_share_percent: payload.revenueSharePercent,
    fixed_salary: payload.fixedSalary,
    rating: payload.rating || 0,
    note: notePayload,
    can_create_groups: payload.canCreateGroups,
    can_receive_payments: payload.canReceivePayments,
    password_hash: payload.passwordHash || null,
    subject: payload.subject || null,
    color: payload.color || '#8b5cf6',
    photo: payload.photo || null,
  };

  try {
    const { data, error } = await supabase.from('teachers_hr').insert(insertData).select().single();
    if (error) throw error;
    const teacher = fromRow(data);
    const cached = getCachedData('teachers_hr', []);
    setCachedData('teachers_hr', [...cached, teacher]);
    return teacher;
  } catch (err) {
    const localTeacher = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      ...payload,
    };
    const cached = getCachedData('teachers_hr', []);
    setCachedData('teachers_hr', [...cached, localTeacher]);
    return localTeacher;
  }
}

export async function updateTeacherHR(id, payload) {
  const metaObj = {
    userNote: payload.note !== undefined ? payload.note : '',
    gender: payload.gender,
    birthDate: payload.birthDate,
    perStudentSalary: payload.perStudentSalary,
    isAssistant: payload.isAssistant,
    role: payload.role,
    type: payload.type,
    isSupport: payload.isSupport,
    assignedTeacherId: payload.assignedTeacherId,
    workingDays: payload.workingDays,
    workingHours: payload.workingHours,
    startTime: payload.startTime,
    endTime: payload.endTime,
    photo: payload.photo,
  };
  const notePayload = JSON.stringify(metaObj);

  const patch = {
    branch_id: payload.branchId ? payload.branchId : null,
    name: payload.name,
    phone: payload.phone,
    salary_type: payload.salaryType,
    revenue_share_percent: payload.revenueSharePercent,
    fixed_salary: payload.fixedSalary,
    rating: payload.rating,
    note: notePayload,
    can_create_groups: payload.canCreateGroups,
    can_receive_payments: payload.canReceivePayments,
  };
  if (payload.passwordHash) patch.password_hash = payload.passwordHash;
  if (payload.subject !== undefined) patch.subject = payload.subject;
  if (payload.color !== undefined) patch.color = payload.color;
  if (payload.photo !== undefined) patch.photo = payload.photo;
  try {
    const { error } = await supabase.from('teachers_hr').update(patch).eq('id', id);
    if (error && !isNetworkError(error)) console.warn('Supabase updateTeacherHR warning:', error.message || error);
  } catch (err) {
    // ignore
  }
  const cached = getCachedData('teachers_hr', []);
  setCachedData('teachers_hr', cached.map(t => t.id === id ? { ...t, ...payload } : t));
}

export async function deleteTeacherHR(id) {
  try {
    const { error } = await supabase.from('teachers_hr').delete().eq('id', id);
    if (error && !isNetworkError(error)) console.warn('Supabase deleteTeacherHR warning:', error.message || error);
  } catch (err) {
    // ignore
  }
  const cached = getCachedData('teachers_hr', []);
  setCachedData('teachers_hr', cached.filter(t => t.id !== id));
}

export async function fetchTeacherPayments() {
  try {
    const { data, error } = await supabase.from('teacher_payments').select('*');
    if (error) {
      if (!isNetworkError(error)) {
        console.warn('Supabase fetchTeacherPayments warning:', error.message || error);
      }
      return getCachedData('teacher_payments', []);
    }
    const result = (data || []).map(p => ({
      id: p.id,
      teacherHRId: p.teacher_hr_id,
      type: p.type,
      amount: p.amount,
      month: p.month,
      date: p.date,
      note: p.note,
      createdAt: new Date(p.created_at).getTime(),
    }));
    setCachedData('teacher_payments', result);
    return result;
  } catch (err) {
    if (!isNetworkError(err)) {
      console.warn('Supabase fetchTeacherPayments exception:', err.message || err);
    }
    return getCachedData('teacher_payments', []);
  }
}

export async function addTeacherPayment(payload) {
  try {
    const { data, error } = await supabase.from('teacher_payments').insert({
      teacher_hr_id: payload.teacherHRId,
      type: payload.type,
      amount: payload.amount,
      month: payload.month,
      date: payload.date,
      note: payload.note,
    }).select().single();
    if (error) throw error;
    const payment = { ...payload, id: data.id, createdAt: new Date(data.created_at).getTime() };
    const cached = getCachedData('teacher_payments', []);
    setCachedData('teacher_payments', [...cached, payment]);
    return payment;
  } catch (err) {
    const localPayment = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      ...payload,
      createdAt: Date.now(),
    };
    const cached = getCachedData('teacher_payments', []);
    setCachedData('teacher_payments', [...cached, localPayment]);
    return localPayment;
  }
}


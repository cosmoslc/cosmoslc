import { supabase } from './supabaseClient';
import { getCachedData, setCachedData, isNetworkError } from './cacheHelper';

export async function fetchEmployeeAttendance() {
  try {
    const { data, error } = await supabase.from('employee_attendance').select('*').order('date', { ascending: false });
    if (error) {
      if (!isNetworkError(error)) {
        console.warn('Supabase fetchEmployeeAttendance warning:', error.message || error);
      }
      return getCachedData('employee_attendance', []);
    }
    const result = (data || []).map(e => ({
      id: e.id,
      branchId: e.branch_id,
      employeeType: e.employee_type,
      employeeId: e.employee_id,
      date: e.date,
      status: e.status,
      checkIn: e.check_in,
      checkOut: e.check_out,
      createdAt: e.created_at,
    }));
    setCachedData('employee_attendance', result);
    return result;
  } catch (err) {
    if (!isNetworkError(err)) {
      console.warn('Supabase fetchEmployeeAttendance exception:', err.message || err);
    }
    return getCachedData('employee_attendance', []);
  }
}

export async function addEmployeeAttendance(payload) {
  try {
    const { data, error } = await supabase.from('employee_attendance').insert({
      branch_id: payload.branchId,
      employee_type: payload.employeeType,
      employee_id: payload.employeeId,
      date: payload.date,
      status: payload.status || 'present',
      check_in: payload.checkIn,
      check_out: payload.checkOut,
    }).select().single();
    if (error) throw error;
    const row = {
      id: data.id,
      branchId: data.branch_id,
      employeeType: data.employee_type,
      employeeId: data.employee_id,
      date: data.date,
      status: data.status,
      checkIn: data.check_in,
      checkOut: data.check_out,
      createdAt: data.created_at,
    };
    const cached = getCachedData('employee_attendance', []);
    setCachedData('employee_attendance', [row, ...cached]);
    return row;
  } catch (err) {
    const localRow = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      ...payload,
      createdAt: new Date().toISOString(),
    };
    const cached = getCachedData('employee_attendance', []);
    setCachedData('employee_attendance', [localRow, ...cached]);
    return localRow;
  }
}

export async function updateEmployeeAttendance(id, payload) {
  try {
    const { error } = await supabase.from('employee_attendance').update({
      status: payload.status,
      check_in: payload.checkIn,
      check_out: payload.checkOut,
    }).eq('id', id);
    if (error && !isNetworkError(error)) console.warn('Supabase updateEmployeeAttendance warning:', error.message || error);
  } catch {}
  const cached = getCachedData('employee_attendance', []);
  setCachedData('employee_attendance', cached.map(e => e.id === id ? { ...e, ...payload } : e));
}

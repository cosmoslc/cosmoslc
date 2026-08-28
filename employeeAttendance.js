import { supabase } from './supabaseClient';

export async function fetchEmployeeAttendance() {
  const { data, error } = await supabase.from('employee_attendance').select('*').order('date', { ascending: false });
  if (error) {
    console.error('Supabase fetchEmployeeAttendance error:', error);
    return [];
  }
  return (data || []).map(e => ({
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
}

export async function addEmployeeAttendance(payload) {
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
  return {
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
}

export async function updateEmployeeAttendance(id, payload) {
  const { error } = await supabase.from('employee_attendance').update({
    status: payload.status,
    check_in: payload.checkIn,
    check_out: payload.checkOut,
  }).eq('id', id);
  if (error) console.error('Supabase updateEmployeeAttendance error:', error);
}

import { supabase } from "./supabaseClient";

function fromRow(g) {
  const tId = g.teacher_hr_id || g.teacherHrId || g.teacher_id || g.teacherId || null;
  return {
    id: g.id,
    courseId: g.course_id || g.courseId,
    roomId: g.room_id || g.roomId,
    teacherHrId: tId,
    teacherId: tId,
    teacherSalaryType: g.teacher_salary_type || g.teacherSalaryType || "percent",
    teacherSalaryPercent: g.teacher_salary_percent ?? g.teacherSalaryPercent ?? 0,
    teacherSalaryFixed: g.teacher_salary_fixed ?? g.teacherSalaryFixed ?? 0,
    name: g.name,
    price: g.price || 0,
    days: g.days || [],
    time: g.time || "",
    durationMonths: g.duration_months || g.durationMonths || 6,
    startDate: g.start_date || g.startDate || "",
    color: g.color || "#8b5cf6",
  };
}

export async function fetchGroups() {
  try {
    const { data, error } = await supabase.from("groups").select("*");
    if (error) {
      console.error("Supabase fetchGroups error:", error.message || error);
      return [];
    }
    return (data || []).map(fromRow);
  } catch (err) {
    console.error("Supabase fetchGroups exception:", err?.message || err);
    return [];
  }
}

export async function addGroup(payload) {
  const tId = payload.teacherHrId ?? payload.teacherId ?? null;
  const insertData = {
    course_id: payload.courseId,
    room_id: payload.roomId,
    teacher_hr_id: tId,
    teacher_salary_type: payload.teacherSalaryType || "percent",
    teacher_salary_percent: payload.teacherSalaryPercent || 0,
    teacher_salary_fixed: payload.teacherSalaryFixed || 0,
    name: payload.name,
    price: payload.price,
    days: payload.days,
    time: payload.time,
    duration_months: payload.durationMonths,
    start_date: payload.startDate,
    color: payload.color || "#8b5cf6",
  };

  const { data, error } = await supabase
    .from("groups")
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error("Supabase addGroup error:", error.message || error);
    throw error;
  }

  return fromRow(data);
}

export async function updateGroup(id, payload) {
  const tId = payload.teacherHrId ?? payload.teacherId ?? null;
  const patch = {};
  if (payload.courseId !== undefined) patch.course_id = payload.courseId;
  if (payload.roomId !== undefined) patch.room_id = payload.roomId;
  if (tId !== null && tId !== undefined) patch.teacher_hr_id = tId;
  if (payload.teacherSalaryType !== undefined) patch.teacher_salary_type = payload.teacherSalaryType;
  if (payload.teacherSalaryPercent !== undefined) patch.teacher_salary_percent = payload.teacherSalaryPercent;
  if (payload.teacherSalaryFixed !== undefined) patch.teacher_salary_fixed = payload.teacherSalaryFixed;
  if (payload.name !== undefined) patch.name = payload.name;
  if (payload.price !== undefined) patch.price = payload.price;
  if (payload.days !== undefined) patch.days = payload.days;
  if (payload.time !== undefined) patch.time = payload.time;
  if (payload.durationMonths !== undefined) patch.duration_months = payload.durationMonths;
  if (payload.startDate !== undefined) patch.start_date = payload.startDate;
  if (payload.color !== undefined) patch.color = payload.color;

  const { error } = await supabase
    .from("groups")
    .update(patch)
    .eq("id", id);

  if (error) {
    console.error("Supabase updateGroup error:", error.message || error);
    throw error;
  }
}

export async function deleteGroup(id) {
  const { error } = await supabase.from("groups").delete().eq("id", id);
  if (error) {
    console.error("Supabase deleteGroup error:", error.message || error);
    throw error;
  }
}

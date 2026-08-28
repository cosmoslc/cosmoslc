import { supabase } from "./supabaseClient";

function fromRow(g) {
  if (!g) return null;
  const tId = g.teacher_hr_id || g.teacherHrId || g.teacher_id || g.teacherId || g.teacher || null;
  
  let days = g.days;
  if (typeof days === "string") {
    try {
      days = JSON.parse(days);
    } catch {
      days = days.split(",").map((d) => d.trim()).filter(Boolean);
    }
  }
  if (!Array.isArray(days)) days = [];

  return {
    id: g.id,
    courseId: g.course_id ?? g.courseId ?? g.course ?? null,
    roomId: g.room_id ?? g.roomId ?? g.room ?? null,
    branchId: g.branch_id ?? g.branchId ?? g.branch ?? null,
    teacherHrId: tId,
    teacherId: tId,
    teacherSalaryType: g.teacher_salary_type || g.teacherSalaryType || "percent",
    teacherSalaryPercent: Number(g.teacher_salary_percent ?? g.teacherSalaryPercent ?? 0),
    teacherSalaryFixed: Number(g.teacher_salary_fixed ?? g.teacherSalaryFixed ?? 0),
    name: g.name || g.group_name || g.groupName || g.title || "Noma'lum guruh",
    price: Number(g.price) || 0,
    days: days,
    time: g.time || "",
    endTime: g.end_time || g.endTime || "",
    lessonDurationMinutes: Number(g.lesson_duration_minutes || g.lessonDurationMinutes || 60),
    durationMonths: Number(g.duration_months || g.durationMonths || 6),
    startDate: g.start_date || g.startDate || "",
    color: g.color || "#8b5cf6",
    format: g.format || "offline",
    telegramChatId: g.telegram_chat_id || g.telegramChatId || "",
    note: g.note || "",
  };
}

export async function fetchGroups() {
  try {
    const { data, error } = await supabase.from("groups").select("*");
    if (error) {
      console.error("Supabase fetchGroups error:", error.message || error);
      return [];
    }
    return (data || []).map(fromRow).filter(Boolean);
  } catch (err) {
    console.error("Supabase fetchGroups exception:", err?.message || err);
    return [];
  }
}

export async function addGroup(payload) {
  const tId = payload.teacherHrId ?? payload.teacherId ?? null;
  const insertData = {
    course_id: payload.courseId || null,
    room_id: payload.roomId || null,
    branch_id: payload.branchId || null,
    teacher_hr_id: tId,
    teacher_salary_type: payload.teacherSalaryType || "percent",
    teacher_salary_percent: payload.teacherSalaryPercent || 0,
    teacher_salary_fixed: payload.teacherSalaryFixed || 0,
    name: payload.name,
    price: payload.price || 0,
    days: payload.days || [],
    time: payload.time || "",
    duration_months: payload.durationMonths || 6,
    start_date: payload.startDate || "",
    color: payload.color || "#8b5cf6",
  };

  let { data, error } = await supabase
    .from("groups")
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error("Supabase addGroup warning (retrying core fields):", error.message || error);
    const coreData = {
      name: payload.name,
      price: payload.price || 0,
      days: payload.days || [],
      time: payload.time || "",
    };
    if (payload.courseId) coreData.course_id = payload.courseId;
    if (payload.roomId) coreData.room_id = payload.roomId;
    if (tId) coreData.teacher_hr_id = tId;

    const res = await supabase.from("groups").insert(coreData).select().single();
    if (res.error) throw res.error;
    data = res.data;
  }

  return fromRow(data);
}

export async function updateGroup(id, payload) {
  const tId = payload.teacherHrId ?? payload.teacherId ?? null;
  const patch = {};
  if (payload.courseId !== undefined) patch.course_id = payload.courseId;
  if (payload.roomId !== undefined) patch.room_id = payload.roomId;
  if (payload.branchId !== undefined) patch.branch_id = payload.branchId;
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

  let { data, error } = await supabase
    .from("groups")
    .update(patch)
    .eq("id", id)
    .select();

  if (error) {
    console.error("Supabase updateGroup error:", error.message || error);
    // If update failed due to extra column mismatch, retry core fields
    const corePatch = {};
    if (payload.name !== undefined) corePatch.name = payload.name;
    if (payload.price !== undefined) corePatch.price = payload.price;
    if (payload.courseId !== undefined) corePatch.course_id = payload.courseId;
    if (payload.roomId !== undefined) corePatch.room_id = payload.roomId;
    if (tId !== null && tId !== undefined) corePatch.teacher_hr_id = tId;

    const res = await supabase.from("groups").update(corePatch).eq("id", id).select();
    if (res.error) throw res.error;
    data = res.data;
  }

  const updatedRow = Array.isArray(data) ? data[0] : data;
  return updatedRow ? fromRow(updatedRow) : fromRow({ id, ...payload });
}

export async function deleteGroup(id) {
  const { error } = await supabase.from("groups").delete().eq("id", id);
  if (error) {
    console.error("Supabase deleteGroup error:", error.message || error);
    throw error;
  }
}


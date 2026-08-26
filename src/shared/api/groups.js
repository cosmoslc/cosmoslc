import { supabase } from "./supabaseClient";

const GROUPS_CACHE_KEY = "cosmos_cache_groups_v1";

const DEFAULT_GROUPS = [
  {
    id: "group_demo_1",
    courseId: "course_1",
    roomId: "room_1",
    teacherHrId: null,
    teacherId: null,
    teacherSalaryType: "percent",
    teacherSalaryPercent: 50,
    teacherSalaryFixed: 0,
    name: "General English - Group A",
    price: 450000,
    days: ["Dush", "Chor", "Juma"],
    time: "14:00 - 16:00",
    durationMonths: 6,
    startDate: "2026-01-10",
    color: "#8b5cf6",
  },
];

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
      console.warn("Supabase fetchGroups warning (using cache/fallback):", error.message || error);
      const cached = typeof localStorage !== "undefined" ? localStorage.getItem(GROUPS_CACHE_KEY) : null;
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {}
      }
      return DEFAULT_GROUPS;
    }
    const result = (data || []).map(fromRow);
    try {
      if (result.length > 0 && typeof localStorage !== "undefined") {
        localStorage.setItem(GROUPS_CACHE_KEY, JSON.stringify(result));
      } else if (typeof localStorage !== "undefined") {
        const cached = localStorage.getItem(GROUPS_CACHE_KEY);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
          } catch (e) {}
        }
      }
    } catch (e) {}
    return result;
  } catch (err) {
    console.warn("Supabase fetchGroups error (using cache/fallback):", err?.message || err);
    const cached = typeof localStorage !== "undefined" ? localStorage.getItem(GROUPS_CACHE_KEY) : null;
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return DEFAULT_GROUPS;
  }
}

export async function addGroup(payload) {
  const tId = payload.teacherHrId ?? payload.teacherId ?? null;
  let newGroup = null;
  try {
    const { data, error } = await supabase
      .from("groups")
      .insert({
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
        color: payload.color,
      })
      .select()
      .single();
    if (!error && data) {
      newGroup = fromRow(data);
    }
  } catch (err) {
    console.warn("Supabase addGroup insert note:", err?.message || err);
  }

  if (!newGroup) {
    newGroup = {
      id: "group_" + Date.now(),
      courseId: payload.courseId,
      roomId: payload.roomId,
      teacherHrId: tId,
      teacherId: tId,
      teacherSalaryType: payload.teacherSalaryType || "percent",
      teacherSalaryPercent: payload.teacherSalaryPercent || 0,
      teacherSalaryFixed: payload.teacherSalaryFixed || 0,
      name: payload.name,
      price: payload.price || 0,
      days: payload.days || [],
      time: payload.time || "",
      durationMonths: payload.durationMonths || 6,
      startDate: payload.startDate || new Date().toISOString().slice(0, 10),
      color: payload.color || "#8b5cf6",
    };
  }

  try {
    if (typeof localStorage !== "undefined") {
      const cached = localStorage.getItem(GROUPS_CACHE_KEY);
      const current = cached ? JSON.parse(cached) : [];
      const updated = [newGroup, ...current.filter((g) => g.id !== newGroup.id)];
      localStorage.setItem(GROUPS_CACHE_KEY, JSON.stringify(updated));
    }
  } catch (e) {}

  return newGroup;
}

export async function updateGroup(id, payload) {
  const tId = payload.teacherHrId ?? payload.teacherId ?? null;
  const patch = {};
  if (payload.courseId !== undefined) patch.course_id = payload.courseId;
  if (payload.roomId !== undefined) patch.room_id = payload.roomId;
  if (tId !== null) patch.teacher_hr_id = tId;
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

  try {
    const { error } = await supabase
      .from("groups")
      .update(patch)
      .eq("id", id);
    if (error) console.warn("Supabase updateGroup note:", error.message || error);
  } catch (e) {
    console.warn("Supabase updateGroup error:", e?.message || e);
  }

  try {
    if (typeof localStorage !== "undefined") {
      const cached = localStorage.getItem(GROUPS_CACHE_KEY);
      if (cached) {
        const current = JSON.parse(cached);
        const updated = current.map((g) => (g.id === id ? { ...g, ...payload } : g));
        localStorage.setItem(GROUPS_CACHE_KEY, JSON.stringify(updated));
      }
    }
  } catch (e) {}
}

export async function deleteGroup(id) {
  try {
    const { error } = await supabase.from("groups").delete().eq("id", id);
    if (error) console.warn("Supabase deleteGroup note:", error.message || error);
  } catch (e) {
    console.warn("Supabase deleteGroup error:", e?.message || e);
  }

  try {
    if (typeof localStorage !== "undefined") {
      const cached = localStorage.getItem(GROUPS_CACHE_KEY);
      if (cached) {
        const current = JSON.parse(cached);
        const updated = current.filter((g) => g.id !== id);
        localStorage.setItem(GROUPS_CACHE_KEY, JSON.stringify(updated));
      }
    }
  } catch (e) {}
}

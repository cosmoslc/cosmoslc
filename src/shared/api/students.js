import { supabase } from "./supabaseClient";
import { getCachedData, setCachedData, isNetworkError } from "./cacheHelper";

export function parseGroupIds(s) {
  if (!s) return [];
  const raw = s.group_ids ?? s.groupIds ?? s.group_id ?? s.groupId;
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .map((x) => (typeof x === "object" && x?.id ? String(x.id) : String(x)))
      .map((x) => x.trim())
      .filter(Boolean);
  }
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed || trimmed === "{}" || trimmed === "[]" || trimmed === '""') return [];
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed
            .map((x) => (typeof x === "object" && x?.id ? String(x.id) : String(x)))
            .map((x) => x.trim())
            .filter(Boolean);
        }
      } catch {
        /* ignore */
      }
    }
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      return trimmed
        .slice(1, -1)
        .split(",")
        .map((x) => x.trim().replace(/^"|"$/g, ""))
        .filter(Boolean);
    }
    if (trimmed.includes(",")) {
      return trimmed
        .split(",")
        .map((x) => x.trim().replace(/^"|"$/g, ""))
        .filter(Boolean);
    }
    return [trimmed];
  }
  if (typeof raw === "number") {
    return [String(raw)];
  }
  return [];
}

function fromRow(s) {
  return {
    id: s.id,
    name: s.name,
    phone: s.phone,
    groupIds: parseGroupIds(s),
    passwordHash: s.password_hash || s.passwordHash,
    coins: s.coins || 0,
    balance: s.balance || 0,
    birthDate: s.birth_date || s.birthDate,
    parentName: s.parent_name || s.parentName,
    parentPhone: s.parent_phone || s.parentPhone,
    gender: s.gender,
    source: s.source,
    schoolNumber: s.school_number || s.schoolNumber,
    grade: s.grade,
    region: s.region,
    district: s.district,
    neighborhood: s.neighborhood,
    streetAddress: s.street_address || s.streetAddress,
    status: s.status || "active",
    statusNote: s.status_note || s.statusNote || "",
    groupMemberships: s.group_memberships || s.groupMemberships || {},
    joinedAt: s.joined_at || s.joinedAt || s.created_at || s.createdAt || new Date().toISOString().slice(0, 10),
    managerId: s.manager_id || s.managerId || null,
    studiedOneWeek: s.studied_one_week ?? s.studiedOneWeek ?? true,
    hasContract: s.has_contract ?? s.hasContract ?? true,
    createdAt: s.created_at || s.createdAt || new Date().toISOString(),
  };
}

export async function fetchStudents() {
  try {
    const { data, error } = await supabase.from("students").select("*");
    if (error) {
      if (!isNetworkError(error)) {
        console.warn("Supabase fetchStudents warning:", error.message || error);
      }
      return getCachedData("students", []);
    }
    const result = (data || []).map(fromRow);
    setCachedData("students", result);
    return result;
  } catch (err) {
    if (!isNetworkError(err)) {
      console.warn("Supabase fetchStudents exception:", err.message || err);
    }
    return getCachedData("students", []);
  }
}

export async function addStudent(payload) {
  const cleanGroupIds = Array.isArray(payload.groupIds)
    ? payload.groupIds.map(String).filter(Boolean)
    : [];

  const base = {
    name: payload.name,
    phone: payload.phone,
    group_ids: cleanGroupIds,
    password_hash: payload.passwordHash || null,
    coins: payload.coins || 0,
    balance: payload.balance || 0,
    birth_date: payload.birthDate || null,
    parent_name: payload.parentName || null,
    parent_phone: payload.parentPhone || null,
    gender: payload.gender || null,
    source: payload.source || null,
    school_number: payload.schoolNumber || null,
    grade: payload.grade || null,
    region: payload.region || null,
    district: payload.district || null,
    neighborhood: payload.neighborhood || null,
    street_address: payload.streetAddress || null,
    status: payload.status || "active",
    status_note: payload.statusNote || null,
    group_memberships: payload.groupMemberships || {},
  };

  try {
    const { data, error } = await supabase
      .from("students")
      .insert(base)
      .select()
      .single();
    if (error) {
      console.warn("Supabase addStudent inserting without balance column:", error.message);
      const { balance, ...rest } = base;
      const { data: d2, error: e2 } = await supabase.from("students").insert(rest).select().single();
      if (e2) {
        // Retry with formatted group_ids if text column is used
        const altRest = { ...rest, group_ids: `{${cleanGroupIds.join(",")}}` };
        const { data: d3, error: e3 } = await supabase.from("students").insert(altRest).select().single();
        if (e3) throw e3;
        return { ...fromRow(d3), balance: payload.balance || 0 };
      }
      return { ...fromRow(d2), balance: payload.balance || 0 };
    }
    return fromRow(data);
  } catch (err) {
    console.error("Supabase addStudent error:", err);
    throw err;
  }
}

export async function updateStudent(id, payload) {
  const patch = {};
  if (payload.name !== undefined) patch.name = payload.name;
  if (payload.phone !== undefined) patch.phone = payload.phone;
  if (payload.groupIds !== undefined) {
    patch.group_ids = Array.isArray(payload.groupIds)
      ? payload.groupIds.map(String).filter(Boolean)
      : [];
  }
  if (payload.passwordHash !== undefined) patch.password_hash = payload.passwordHash;
  if (payload.coins !== undefined) patch.coins = payload.coins;
  if (payload.balance !== undefined) patch.balance = payload.balance;
  if (payload.birthDate !== undefined) patch.birth_date = payload.birthDate;
  if (payload.parentName !== undefined) patch.parent_name = payload.parentName;
  if (payload.parentPhone !== undefined) patch.parent_phone = payload.parentPhone;
  if (payload.gender !== undefined) patch.gender = payload.gender;
  if (payload.source !== undefined) patch.source = payload.source;
  if (payload.schoolNumber !== undefined) patch.school_number = payload.schoolNumber;
  if (payload.grade !== undefined) patch.grade = payload.grade;
  if (payload.region !== undefined) patch.region = payload.region;
  if (payload.district !== undefined) patch.district = payload.district;
  if (payload.neighborhood !== undefined) patch.neighborhood = payload.neighborhood;
  if (payload.streetAddress !== undefined) patch.street_address = payload.streetAddress;
  if (payload.status !== undefined) patch.status = payload.status;
  if (payload.statusNote !== undefined) patch.status_note = payload.statusNote;
  if (payload.groupMemberships !== undefined) patch.group_memberships = payload.groupMemberships;
  if (payload.studiedOneWeek !== undefined) patch.studied_one_week = payload.studiedOneWeek;
  if (payload.hasContract !== undefined) patch.has_contract = payload.hasContract;
  if (payload.managerId !== undefined) patch.manager_id = payload.managerId;

  if (Object.keys(patch).length === 0) return { success: true };

  try {
    const { data, error } = await supabase.from("students").update(patch).eq("id", id).select();
    if (error) {
      console.warn("Supabase updateStudent error, trying fallback:", error.message);
      const retryPatch = { ...patch };
      if (error.message && error.message.includes("group_memberships")) {
        delete retryPatch.group_memberships;
      }
      if (retryPatch.balance !== undefined) delete retryPatch.balance;
      const { data: d2, error: e2 } = await supabase.from("students").update(retryPatch).eq("id", id).select();
      if (e2) {
        if (retryPatch.group_ids && Array.isArray(retryPatch.group_ids)) {
          retryPatch.group_ids = `{${retryPatch.group_ids.join(",")}}`;
          const { data: d3, error: e3 } = await supabase.from("students").update(retryPatch).eq("id", id).select();
          if (e3) {
            console.error("Supabase updateStudent all retries failed:", e3);
            throw e3;
          }
          return d3?.[0] ? fromRow(d3[0]) : { success: true };
        } else {
          console.error("Supabase updateStudent fallback error:", e2);
          throw e2;
        }
      }
      return d2?.[0] ? fromRow(d2[0]) : { success: true };
    }
    return data?.[0] ? fromRow(data[0]) : { success: true };
  } catch (err) {
    console.error("Supabase updateStudent exception:", err);
    throw err;
  }
}

export async function deleteStudent(id) {
  const { error } = await supabase.from("students").delete().eq("id", id);
  if (error) console.error("Supabase deleteStudent error:", error);
}

export async function findStudentByPhoneAndHash(normalizedPhone, passwordHash) {
  try {
    const { data, error } = await supabase.from("students").select("*");
    if (error) throw error;
    const match = (data || []).find(
      (s) =>
        s.phone &&
        s.phone.replace(/\D/g, "") === normalizedPhone &&
        s.password_hash === passwordHash,
    );
    if (match) return fromRow(match);
  } catch (e) {
    console.error("Supabase findStudentByPhoneAndHash error:", e);
  }
  return null;
}


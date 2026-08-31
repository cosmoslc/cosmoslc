import { supabase } from './supabaseClient';
import { getCachedData, setCachedData, isNetworkError } from './cacheHelper';

export async function fetchLeads() {
  try {
    const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    if (error) {
      if (!isNetworkError(error)) {
        console.warn('Supabase fetchLeads warning:', error.message || error);
      }
      return getCachedData('leads', []);
    }
    const result = (data || []).map(l => {
    let rejectionReason = l.rejection_reason || null;
    let rejectionNote = l.rejection_note || null;
    let courseId = l.course_id || null;
    let enrolledGroupId = l.enrolled_group_id || null;
    let enrolledGroupName = l.enrolled_group_name || null;
    let phone2 = l.phone2 || l.parent_phone || null;
    let grade = l.grade || null;
    let comments = l.comments || [];
    let noteText = l.note || "";

    if (!rejectionReason && noteText.includes("[Rad etildi]:")) {
      const match = noteText.match(/\[Rad etildi\]:\s*([^\n-]+)(?:\s*-\s*([^\n]+))?/);
      if (match) {
        rejectionReason = match[1]?.trim() || null;
        rejectionNote = match[2]?.trim() || null;
      }
    }

    if (!enrolledGroupId && noteText.includes("[Guruh]:")) {
      const match = noteText.match(/\[Guruh\]:\s*([^\|\n]+)(?:\|([^\n]*))?/);
      if (match) {
        enrolledGroupId = match[1]?.trim() || null;
        enrolledGroupName = match[2]?.trim() || null;
      }
    }

    if (!courseId && noteText.includes("[Kurs]:")) {
      const match = noteText.match(/\[Kurs\]:\s*([^\n]+)/);
      if (match) {
        courseId = match[1]?.trim() || null;
      }
    }

    if (!phone2 && noteText.includes("[Tel2]:")) {
      const match = noteText.match(/\[Tel2\]:\s*([^\n]+)/);
      if (match) {
        phone2 = match[1]?.trim() || null;
      }
    }

    if (!grade && noteText.includes("[Sinf]:")) {
      const match = noteText.match(/\[Sinf\]:\s*([^\n]+)/);
      if (match) {
        grade = match[1]?.trim() || null;
      }
    }

    if ((!comments || comments.length === 0) && noteText.includes("[Izohlar]:")) {
      const match = noteText.match(/\[Izohlar\]:\s*([^\n]+)/);
      if (match) {
        try {
          comments = JSON.parse(match[1]?.trim() || "[]");
        } catch {
          // ignore json parse error
        }
      }
    }

    let customFields = l.custom_fields || {};
    if (noteText.includes("[Maxsus]:")) {
      const match = noteText.match(/\[Maxsus\]:\s*([^\n]+)/);
      if (match) {
        try {
          customFields = { ...customFields, ...JSON.parse(match[1]?.trim() || "{}") };
        } catch {
          // ignore json parse error
        }
      }
    }

    // Clean display note if tags were appended
    let cleanNote = noteText
      .replace(/\[Rad etildi\]:[^\n]+/g, "")
      .replace(/\[Guruh\]:[^\n]+/g, "")
      .replace(/\[Kurs\]:[^\n]+/g, "")
      .replace(/\[Tel2\]:[^\n]+/g, "")
      .replace(/\[Sinf\]:[^\n]+/g, "")
      .replace(/\[Izohlar\]:[^\n]+/g, "")
      .replace(/\[Maxsus\]:[^\n]+/g, "")
      .trim();

    return {
      id: l.id,
      directorId: l.director_id,
      branchId: l.branch_id,
      name: l.name,
      phone: l.phone,
      phone2: phone2,
      parentPhone: phone2,
      grade: grade,
      comments: comments || [],
      customFields: customFields || {},
      source: l.source || 'boshqa',
      status: l.status || 'new',
      note: cleanNote || noteText,
      courseId: courseId,
      enrolledGroupId: enrolledGroupId,
      enrolledGroupName: enrolledGroupName,
      rejectionReason: rejectionReason,
      rejectionNote: rejectionNote,
      rejectedAt: l.rejected_at || null,
      formId: l.form_id,
      createdAt: l.created_at,
    };
  });
    setCachedData('leads', result);
    return result;
  } catch (err) {
    if (!isNetworkError(err)) {
      console.warn('Supabase fetchLeads exception:', err);
    }
    return getCachedData('leads', []);
  }
}

function buildLeadNote(payload) {
  let noteToSave = payload.note || '';
  if (payload.grade && !noteToSave.includes("[Sinf]:")) {
    noteToSave = `${noteToSave}\n[Sinf]: ${payload.grade}`.trim();
  }
  const p2 = payload.phone2 || payload.parentPhone;
  if (p2 && !noteToSave.includes("[Tel2]:")) {
    noteToSave = `${noteToSave}\n[Tel2]: ${p2}`.trim();
  }
  if (payload.courseId && !noteToSave.includes("[Kurs]:")) {
    noteToSave = `${noteToSave}\n[Kurs]: ${payload.courseId}`.trim();
  }
  if (payload.enrolledGroupId && !noteToSave.includes("[Guruh]:")) {
    noteToSave = `${noteToSave}\n[Guruh]: ${payload.enrolledGroupId}|${payload.enrolledGroupName || ""}`.trim();
  }
  if (payload.rejectionReason && !noteToSave.includes("[Rad etildi]:")) {
    noteToSave = `${noteToSave}\n[Rad etildi]: ${payload.rejectionReason}${payload.rejectionNote ? ` - ${payload.rejectionNote}` : ""}`.trim();
  }
  if (payload.comments && Array.isArray(payload.comments) && payload.comments.length > 0 && !noteToSave.includes("[Izohlar]:")) {
    noteToSave = `${noteToSave}\n[Izohlar]: ${JSON.stringify(payload.comments)}`.trim();
  }
  if (payload.customFields && Object.keys(payload.customFields).length > 0 && !noteToSave.includes("[Maxsus]:")) {
    noteToSave = `${noteToSave}\n[Maxsus]: ${JSON.stringify(payload.customFields)}`.trim();
  }
  return noteToSave;
}

export async function addLead(payload) {
  const noteToSave = buildLeadNote(payload);

  const leadName = payload.name || payload.fullName || payload.studentName || payload.title || "Yangi Lid";
  const leadPhone = payload.phone || payload.phone1 || payload.phoneNumber || "+998 00 000 00 00";

  const coreData = {
    director_id: payload.directorId || null,
    branch_id: payload.branchId || null,
    name: leadName,
    phone: leadPhone,
    source: payload.source || 'boshqa',
    status: payload.status || 'new',
    note: noteToSave,
    form_id: payload.formId || null,
  };

  let data = null;
  try {
    const extended = {
      ...coreData,
      ...(payload.phone2 || payload.parentPhone ? { phone2: payload.phone2 || payload.parentPhone, parent_phone: payload.phone2 || payload.parentPhone } : {}),
      ...(payload.grade ? { grade: payload.grade } : {}),
      ...(payload.courseId ? { course_id: payload.courseId } : {}),
      ...(payload.enrolledGroupId ? { enrolled_group_id: payload.enrolledGroupId } : {}),
      ...(payload.enrolledGroupName ? { enrolled_group_name: payload.enrolledGroupName } : {}),
      ...(payload.rejectionReason ? { rejection_reason: payload.rejectionReason } : {}),
      ...(payload.rejectionNote ? { rejection_note: payload.rejectionNote } : {}),
      ...(payload.customFields ? { custom_fields: payload.customFields } : {}),
    };
    const { data: d1, error: e1 } = await supabase.from('leads').insert(extended).select().single();
    if (e1) {
      console.warn('Supabase addLead extended schema fallback:', e1.message);
      const { data: d2, error: e2 } = await supabase.from('leads').insert(coreData).select().single();
      if (e2) throw e2;
      data = d2;
    } else {
      data = d1;
    }
  } catch (err) {
    console.warn('Supabase addLead fallback to core data:', err);
    const { data: d2, error: e2 } = await supabase.from('leads').insert(coreData).select().single();
    if (e2) throw e2;
    data = d2;
  }

  return {
    id: data.id,
    directorId: data.director_id,
    branchId: data.branch_id,
    name: data.name,
    phone: data.phone,
    phone2: payload.phone2 || payload.parentPhone || null,
    parentPhone: payload.phone2 || payload.parentPhone || null,
    grade: payload.grade || null,
    comments: payload.comments || [],
    customFields: payload.customFields || {},
    source: data.source,
    status: data.status,
    note: payload.note || '',
    courseId: payload.courseId || null,
    enrolledGroupId: payload.enrolledGroupId || null,
    enrolledGroupName: payload.enrolledGroupName || null,
    rejectionReason: payload.rejectionReason || null,
    rejectionNote: payload.rejectionNote || null,
    formId: data.form_id,
    createdAt: data.created_at,
  };
}

export async function updateLead(id, payload) {
  const noteToSave = buildLeadNote(payload);

  const updateFields = {};
  if (payload.name) updateFields.name = payload.name;
  else if (payload.fullName || payload.studentName || payload.title) updateFields.name = payload.fullName || payload.studentName || payload.title;
  if (payload.phone !== undefined && payload.phone !== null) updateFields.phone = payload.phone;
  if (payload.source !== undefined) updateFields.source = payload.source;
  if (payload.status !== undefined) updateFields.status = payload.status;
  if (noteToSave !== undefined && noteToSave !== "") updateFields.note = noteToSave;
  if (payload.branchId !== undefined) updateFields.branch_id = payload.branchId;
  if (payload.directorId !== undefined) updateFields.director_id = payload.directorId;
  if (payload.formId !== undefined) updateFields.form_id = payload.formId;

  try {
    const extendedFields = {
      ...updateFields,
      ...(payload.phone2 !== undefined || payload.parentPhone !== undefined ? { phone2: payload.phone2 || payload.parentPhone, parent_phone: payload.phone2 || payload.parentPhone } : {}),
      ...(payload.grade !== undefined ? { grade: payload.grade } : {}),
      ...(payload.courseId !== undefined ? { course_id: payload.courseId } : {}),
      ...(payload.enrolledGroupId !== undefined ? { enrolled_group_id: payload.enrolledGroupId } : {}),
      ...(payload.enrolledGroupName !== undefined ? { enrolled_group_name: payload.enrolledGroupName } : {}),
      ...(payload.rejectionReason !== undefined ? { rejection_reason: payload.rejectionReason } : {}),
      ...(payload.rejectionNote !== undefined ? { rejection_note: payload.rejectionNote } : {}),
      ...(payload.customFields !== undefined ? { custom_fields: payload.customFields } : {}),
    };
    const { error } = await supabase.from('leads').update(extendedFields).eq('id', id);
    if (error) {
      console.warn('Supabase updateLead fallback to core updateFields:', error.message);
      const { error: e2 } = await supabase.from('leads').update(updateFields).eq('id', id);
      if (e2) console.error('Supabase updateLead core error:', e2);
    }
  } catch (err) {
    console.error('Supabase updateLead error:', err);
  }
}

export async function deleteLead(id) {
  const { error } = await supabase.from('leads').delete().eq('id', id);
  if (error) console.error('Supabase deleteLead error:', error);
}

// ---------- Lead forms ----------

export async function fetchLeadForms() {
  try {
    const { data, error } = await supabase.from('lead_forms').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Supabase fetchLeadForms error:', error);
      return [];
    }
    return (data || []).map(f => ({
      id: f.id,
      directorId: f.director_id,
      name: f.name,
      fields: f.fields || ['name', 'phone'],
      active: f.active,
      createdAt: f.created_at,
    }));
  } catch (err) {
    console.error('Supabase fetchLeadForms exception:', err);
    return [];
  }
}

export async function addLeadForm(payload) {
  const { data, error } = await supabase.from('lead_forms').insert({
    director_id: payload.directorId,
    name: payload.name,
    fields: payload.fields,
    active: payload.active !== false,
  }).select().single();
  if (error) throw error;
  return {
    id: data.id,
    directorId: data.director_id,
    name: data.name,
    fields: data.fields,
    active: data.active,
    createdAt: data.created_at,
  };
}

export async function updateLeadForm(id, payload) {
  const { error } = await supabase.from('lead_forms').update({
    name: payload.name,
    fields: payload.fields,
    active: payload.active,
  }).eq('id', id);
  if (error) console.error('Supabase updateLeadForm error:', error);
}

export async function deleteLeadForm(id) {
  const { error } = await supabase.from('lead_forms').delete().eq('id', id);
  if (error) console.error('Supabase deleteLeadForm error:', error);
}

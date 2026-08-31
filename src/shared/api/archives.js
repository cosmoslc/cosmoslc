import { supabase } from './supabaseClient';

export async function fetchArchives() {
  try {
    const { data, error } = await supabase.from('archive').select('*').order('archived_at', { ascending: false });
    if (error) {
      console.error('Supabase fetchArchives error:', error);
      return { groups: [], students: [], leads: [], courses: [] };
    }
    const result = {
      groups: [],
      students: [],
      leads: [],
      courses: [],
    };
    (data || []).forEach((row) => {
      const type = row.entity_type === 'student' ? 'students'
        : row.entity_type === 'group' ? 'groups'
        : row.entity_type === 'lead' ? 'leads'
        : row.entity_type === 'course' ? 'courses'
        : row.entity_type;
      
      const itemData = row.data || {};
      const item = {
        ...itemData,
        id: row.entity_id || row.id,
        archiveRowId: row.id,
        deletedAt: row.archived_at,
      };

      if (result[type]) {
        result[type].push(item);
      } else {
        result[type] = [item];
      }
    });
    return result;
  } catch (err) {
    console.error('Supabase fetchArchives exception:', err);
    return { groups: [], students: [], leads: [], courses: [] };
  }
}

export async function archiveRecord(type, item, options = {}) {
  const entityType = type.endsWith('s') ? type.slice(0, -1) : type;
  const payloadData = {
    ...item,
    deletedBy: options.deletedBy || "Direktor / Menejer",
    reason: options.reason || "Foydalanuvchi tomonidan o'chirildi",
  };
  const { data, error } = await supabase.from('archive').insert({
    entity_type: entityType,
    entity_id: item.id || `arch-${Date.now()}`,
    data: payloadData,
  }).select().single();

  if (error) {
    console.error('Supabase archiveRecord error:', error);
    return null;
  }
  return {
    ...data.data,
    id: data.entity_id,
    archiveRowId: data.id,
    deletedAt: data.archived_at,
  };
}

export async function restoreRecord(type, id) {
  const { data, error } = await supabase.from('archive').select('*').or(`entity_id.eq.${id},id.eq.${id}`).maybeSingle();
  if (error || !data) {
    console.error('Supabase restoreRecord fetch error:', error);
    return null;
  }
  await supabase.from('archive').delete().eq('id', data.id);
  return data.data;
}

export async function permanentlyDeleteRecord(type, id) {
  const { error } = await supabase.from('archive').delete().or(`entity_id.eq.${id},id.eq.${id}`);
  if (error) {
    console.error('Supabase permanentlyDeleteRecord error:', error);
    return false;
  }
  return true;
}

export async function clearArchiveType(type) {
  if (type === 'all') {
    await supabase.from('archive').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  } else {
    const entityType = type.endsWith('s') ? type.slice(0, -1) : type;
    await supabase.from('archive').delete().eq('entity_type', entityType);
  }
  return true;
}

import { supabase } from './supabaseClient';
import { getCachedData, setCachedData, isNetworkError } from './cacheHelper';

export async function fetchDirectors() {
  try {
    const { data, error } = await supabase.from('directors').select('*');
    if (error) {
      if (!isNetworkError(error)) {
        console.warn('Supabase fetchDirectors warning:', error.message || error);
      }
      return getCachedData('directors', []);
    }
    const result = (data || []).map(d => ({
      id: d.id,
      name: d.name,
      phone: d.phone,
      passwordHash: d.password_hash,
      centerName: d.center_name,
      logo: d.logo,
      address: d.address,
      themeId: d.theme_id,
      customTheme: d.custom_theme,
      twoFactorEnabled: d.two_factor_enabled,
    }));
    setCachedData('directors', result);
    return result;
  } catch (err) {
    if (!isNetworkError(err)) {
      console.warn('fetchDirectors error:', err.message || err);
    }
    return getCachedData('directors', []);
  }
}

export async function updateDirector(director) {
  try {
    const { error } = await supabase
      .from('directors')
      .update({
        name: director.name,
        theme_id: director.themeId,
        custom_theme: director.customTheme,
        two_factor_enabled: director.twoFactorEnabled,
        logo: director.logo,
        address: director.address,
        center_name: director.centerName,
      })
      .eq('id', director.id);
    if (error) console.error('Supabase updateDirector error:', error.message || error);
  } catch (err) {
    console.error('Network error in updateDirector:', err.message || err);
  }
}

export async function addDirector(payload) {
  try {
    const { data, error } = await supabase.from('directors').insert({
      name: payload.name,
      phone: payload.phone,
      password_hash: payload.passwordHash,
      center_name: payload.centerName,
      address: payload.address,
      logo: payload.logo,
      theme_id: payload.themeId || 'cosmos',
      custom_theme: payload.customTheme || null,
      two_factor_enabled: payload.twoFactorEnabled || false,
    }).select().single();
    if (error) throw error;
    return {
      id: data.id, name: data.name, phone: data.phone, passwordHash: data.password_hash,
      centerName: data.center_name, logo: data.logo, address: data.address,
      themeId: data.theme_id, customTheme: data.custom_theme, twoFactorEnabled: data.two_factor_enabled,
    };
  } catch (err) {
    console.error('Error in addDirector:', err.message || err);
    throw err;
  }
}

function getDeletedBranchIds() {
  try {
    const raw = localStorage.getItem('crm_deleted_branch_ids');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function addDeletedBranchId(id) {
  try {
    const ids = getDeletedBranchIds();
    if (!ids.includes(String(id))) {
      ids.push(String(id));
      localStorage.setItem('crm_deleted_branch_ids', JSON.stringify(ids));
    }
  } catch {}
}

function removeDeletedBranchId(id) {
  try {
    const ids = getDeletedBranchIds().filter(x => String(x) !== String(id));
    localStorage.setItem('crm_deleted_branch_ids', JSON.stringify(ids));
  } catch {}
}

function branchFromRow(b) {
  return { id: b.id, directorId: b.director_id || b.directorId, name: b.name, address: b.address, color: b.color };
}

export async function fetchBranches() {
  try {
    const { data, error } = await supabase.from('branches').select('*');
    if (error) {
      if (!isNetworkError(error)) {
        console.warn('Supabase fetchBranches warning:', error.message || error);
      }
      return getCachedData('branches', []);
    }
    const deletedIds = getDeletedBranchIds();
    const result = (data || [])
      .map(branchFromRow)
      .filter(b => !deletedIds.includes(String(b.id)));
    setCachedData('branches', result);
    return result;
  } catch (err) {
    if (!isNetworkError(err)) {
      console.warn('fetchBranches error:', err.message || err);
    }
    return getCachedData('branches', []);
  }
}

export async function addBranch(payload) {
  try {
    const { data, error } = await supabase.from('branches').insert({
      director_id: payload.directorId,
      name: payload.name,
      address: payload.address,
      color: payload.color || '#0ea5e9',
    }).select().single();
    if (error) throw error;
    if (data?.id) {
      removeDeletedBranchId(data.id);
    }
    return branchFromRow(data);
  } catch (err) {
    console.warn('Error in addBranch:', err.message || err);
    throw err;
  }
}

export async function updateBranch(id, payload) {
  try {
    removeDeletedBranchId(id);
    const { error } = await supabase.from('branches')
      .update({ name: payload.name, address: payload.address, color: payload.color })
      .eq('id', id);
    if (error) console.warn('Supabase updateBranch error:', error.message || error);
  } catch (err) {
    console.warn('Error in updateBranch:', err.message || err);
  }
}

export async function deleteBranch(id) {
  if (!id) return;
  addDeletedBranchId(id);

  try {
    // 1. Clean up managers
    const { data: managers } = await supabase.from('managers').select('id, branch_ids');
    if (managers && Array.isArray(managers)) {
      for (const m of managers) {
        const currentBIds = Array.isArray(m.branch_ids) ? m.branch_ids : [];
        if (currentBIds.some(bId => String(bId) === String(id))) {
          const newBIds = currentBIds.filter(bId => String(bId) !== String(id));
          await supabase.from('managers').update({ branch_ids: newBIds }).eq('id', m.id);
        }
      }
    }

    // 2. Clean up teachers_hr
    try {
      const { data: teachers } = await supabase.from('teachers_hr').select('id, branch_ids, branch_id');
      if (teachers && Array.isArray(teachers)) {
        for (const t of teachers) {
          const updates = {};
          if (Array.isArray(t.branch_ids) && t.branch_ids.some(bId => String(bId) === String(id))) {
            updates.branch_ids = t.branch_ids.filter(bId => String(bId) !== String(id));
          }
          if (String(t.branch_id) === String(id)) {
            updates.branch_id = null;
          }
          if (Object.keys(updates).length > 0) {
            await supabase.from('teachers_hr').update(updates).eq('id', t.id);
          }
        }
      }
    } catch {}

    // 3. Nullify branch_id references that might cause foreign key blocks
    const tablesToNullify = ['rooms', 'groups', 'courses', 'leads', 'finance', 'lead_forms', 'students'];
    for (const tbl of tablesToNullify) {
      try {
        await supabase.from(tbl).update({ branch_id: null }).eq('branch_id', id);
      } catch {}
    }

    // 4. Delete the branch record from Supabase
    const { error } = await supabase.from('branches').delete().eq('id', id);
    if (error) {
      console.warn('Supabase deleteBranch error:', error.message || error);
    }
  } catch (err) {
    console.warn('Error in deleteBranch:', err.message || err);
  }
}



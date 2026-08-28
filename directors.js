import { supabase } from './supabaseClient';

export async function fetchDirectors() {
  try {
    const { data, error } = await supabase.from('directors').select('*');
    if (error) {
      console.error('Supabase fetchDirectors error:', error.message || error);
      return [];
    }
    return (data || []).map(d => ({
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
  } catch (err) {
    console.error('fetchDirectors error:', err.message || err);
    return [];
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

function branchFromRow(b) {
  return { id: b.id, directorId: b.director_id || b.directorId, name: b.name, address: b.address, color: b.color };
}

export async function fetchBranches() {
  try {
    const { data, error } = await supabase.from('branches').select('*');
    if (error) {
      console.error('Supabase fetchBranches error:', error.message || error);
      return [];
    }
    return (data || []).map(branchFromRow);
  } catch (err) {
    console.error('fetchBranches error:', err.message || err);
    return [];
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
    return branchFromRow(data);
  } catch (err) {
    console.warn('Error in addBranch:', err.message || err);
    throw err;
  }
}

export async function updateBranch(id, payload) {
  try {
    const { error } = await supabase.from('branches')
      .update({ name: payload.name, address: payload.address, color: payload.color })
      .eq('id', id);
    if (error) console.warn('Supabase updateBranch error:', error.message || error);
  } catch (err) {
    console.warn('Error in updateBranch:', err.message || err);
  }
}

export async function deleteBranch(id) {
  try {
    const { data: managers } = await supabase.from('managers').select('id, branch_ids');
    if (managers) {
      for (const m of managers) {
        const currentBIds = Array.isArray(m.branch_ids) ? m.branch_ids : [];
        if (currentBIds.includes(id)) {
          const newBIds = currentBIds.filter(bId => bId !== id);
          await supabase.from('managers').update({ branch_ids: newBIds }).eq('id', m.id);
        }
      }
    }

    const { error } = await supabase.from('branches').delete().eq('id', id);
    if (error) {
      console.warn('Supabase deleteBranch error:', error.message || error);
      throw error;
    }
  } catch (err) {
    console.warn('Error in deleteBranch:', err.message || err);
    throw err;
  }
}



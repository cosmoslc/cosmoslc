import { supabase } from './supabaseClient';

export async function fetchCenterSettings() {
  try {
    const { data, error } = await supabase.from('center_settings').select('*').single();
    if (error || !data) {
      if (error) console.error('Supabase fetchCenterSettings error:', error);
      return {
        id: 'default',
        directorId: 'dir-1',
        primaryPhone: '901234567',
        secondaryPhone: '',
        address: 'Toshkent sh., Chilonzor tumani',
        telegram: '@cosmos_edu',
        instagram: '@cosmos_edu',
        website: 'https://cosmos.uz',
        workDays: ['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'],
        workStart: '08:00',
        workEnd: '20:00',
      };
    }
    return {
      id: data.id,
      directorId: data.director_id,
      primaryPhone: data.primary_phone,
      secondaryPhone: data.secondary_phone,
      address: data.address,
      telegram: data.telegram,
      instagram: data.instagram,
      website: data.website,
      workDays: data.work_days || [],
      workStart: data.work_start,
      workEnd: data.work_end,
    };
  } catch (err) {
    console.error('Supabase fetchCenterSettings exception:', err);
    return {
      id: 'default',
      directorId: 'dir-1',
      primaryPhone: '901234567',
      secondaryPhone: '',
      address: 'Toshkent sh., Chilonzor tumani',
      telegram: '@cosmos_edu',
      instagram: '@cosmos_edu',
      website: 'https://cosmos.uz',
      workDays: ['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'],
      workStart: '08:00',
      workEnd: '20:00',
    };
  }
}

export async function updateCenterSettings(payload) {
  const { error } = await supabase.from('center_settings').update({
    director_id: payload.directorId,
    primary_phone: payload.primaryPhone,
    secondary_phone: payload.secondaryPhone,
    address: payload.address,
    telegram: payload.telegram,
    instagram: payload.instagram,
    website: payload.website,
    work_days: payload.workDays,
    work_start: payload.workStart,
    work_end: payload.workEnd,
  }).eq('id', 'default');
  if (error) console.error('Supabase updateCenterSettings error:', error);
}

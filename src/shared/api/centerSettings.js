import { supabase } from './supabaseClient';
import { getCachedData, setCachedData, isNetworkError } from './cacheHelper';

const DEFAULT_CENTER_SETTINGS = {
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
  billingMode: 'invoice', // 'invoice' | 'per_lesson'
  excusedAbsenceRefund: true, // Sababli kelmaslik dars to'loviga ta'sir qilishi
};

export async function fetchCenterSettings() {
  try {
    const { data, error } = await supabase.from('center_settings').select('*').single();
    if (error || !data) {
      if (error && !isNetworkError(error)) console.warn('Supabase fetchCenterSettings warning:', error.message || error);
      return getCachedData('center_settings', DEFAULT_CENTER_SETTINGS);
    }
    const cached = getCachedData('center_settings', DEFAULT_CENTER_SETTINGS);
    const result = {
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
      billingMode: data.billing_mode || cached.billingMode || 'invoice',
      excusedAbsenceRefund: data.excused_absence_refund !== undefined ? Boolean(data.excused_absence_refund) : (cached.excusedAbsenceRefund ?? true),
    };
    setCachedData('center_settings', result);
    return result;
  } catch (err) {
    if (!isNetworkError(err)) {
      console.warn('Supabase fetchCenterSettings exception:', err.message || err);
    }
    return getCachedData('center_settings', DEFAULT_CENTER_SETTINGS);
  }
}

export async function updateCenterSettings(payload) {
  try {
    const updatePayload = {
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
    };
    if (payload.billingMode !== undefined) updatePayload.billing_mode = payload.billingMode;
    if (payload.excusedAbsenceRefund !== undefined) updatePayload.excused_absence_refund = payload.excusedAbsenceRefund;

    const { error } = await supabase.from('center_settings').update(updatePayload).eq('id', 'default');
    if (error && !isNetworkError(error)) console.warn('Supabase updateCenterSettings warning:', error.message || error);
  } catch {}
  const cached = getCachedData('center_settings', DEFAULT_CENTER_SETTINGS);
  setCachedData('center_settings', { ...cached, ...payload });
}


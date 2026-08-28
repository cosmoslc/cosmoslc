import { supabase } from './supabaseClient';

export async function fetchNotifications() {
  try {
    const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
    if (error) {
      console.warn('Supabase fetchNotifications note:', error?.message || error);
      return [];
    }
    return (data || []).map(n => ({
      id: n.id,
      directorId: n.director_id,
      userType: n.user_type,
      userId: n.user_id,
      message: n.message,
      read: n.read,
      createdAt: n.created_at,
    }));
  } catch (err) {
    console.warn('fetchNotifications notice:', err?.message || err);
    return [];
  }
}

export async function addNotification(payload) {
  try {
    const { data, error } = await supabase.from('notifications').insert({
      director_id: payload.directorId,
      user_type: payload.userType,
      user_id: payload.userId,
      message: payload.message,
      read: payload.read || false,
    }).select().single();
    if (error) throw error;
    return {
      id: data.id,
      directorId: data.director_id,
      userType: data.user_type,
      userId: data.user_id,
      message: data.message,
      read: data.read,
      createdAt: data.created_at,
    };
  } catch (err) {
    console.warn('addNotification notice:', err?.message || err);
    return {
      id: 'n_' + Date.now(),
      directorId: payload.directorId,
      userType: payload.userType,
      userId: payload.userId,
      message: payload.message,
      read: payload.read || false,
      createdAt: new Date().toISOString(),
    };
  }
}

export async function markNotificationRead(id) {
  try {
    const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
    if (error) console.warn('Supabase markNotificationRead note:', error?.message || error);
  } catch (err) {
    console.warn('markNotificationRead notice:', err?.message || err);
  }
}

export async function markAllNotificationsRead(directorId) {
  try {
    const { error } = await supabase.from('notifications').update({ read: true }).eq('director_id', directorId);
    if (error) console.warn('Supabase markAllNotificationsRead note:', error?.message || error);
  } catch (err) {
    console.warn('markAllNotificationsRead notice:', err?.message || err);
  }
}

export async function clearNotifications(directorId) {
  try {
    const { error } = await supabase.from('notifications').delete().eq('director_id', directorId);
    if (error) console.warn('Supabase clearNotifications note:', error?.message || error);
  } catch (err) {
    console.warn('clearNotifications notice:', err?.message || err);
  }
}


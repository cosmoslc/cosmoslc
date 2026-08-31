/**
 * Local cache & network fallback helper for Supabase API endpoints.
 * Prevents "TypeError: Failed to fetch" from breaking application state
 * when offline or experiencing transient network hiccups.
 */

export function getCachedData(key, fallback = []) {
  if (typeof window === 'undefined' || !window.localStorage) return fallback;
  try {
    const raw = localStorage.getItem(`crm_cache_${key}`);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function setCachedData(key, data) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.setItem(`crm_cache_${key}`, JSON.stringify(data));
  } catch {
    // quota exceeded or private mode ignore
  }
}

export function isNetworkError(error) {
  if (!error) return false;
  const msg = (error.message || error.details || String(error)).toLowerCase();
  return (
    msg.includes('failed to fetch') ||
    msg.includes('networkerror') ||
    msg.includes('network error') ||
    msg.includes('fetch failed') ||
    msg.includes('abort') ||
    msg.includes('connection')
  );
}

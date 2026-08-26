// Shared helpers used identically across the admin, teacher, and student
// features. Consolidated here to remove copy-pasted duplicates that used to
// live separately in each feature's utils/helpers.jsx.
import { MONTHS_UZ } from '../constants/calendar';

export function generateId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return dateStr;
  return `${d.getDate()}-${MONTHS_UZ[d.getMonth()]}, ${d.getFullYear()}`;
}

export function formatDateTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${d.getDate()}-${MONTHS_UZ[d.getMonth()]}, ${hh}:${mm}`;
}

export function normalizePhone(p) {
  return (p || '').replace(/\D/g, '');
}

export function displayPhone(local) {
  return local ? '+998 ' + local : 'kiritilmagan';
}

export function attendanceStatus(record, studentId) {
  const entry = record?.records?.[studentId];
  if (entry == null) return null;
  return typeof entry === 'string' ? entry : entry.status;
}

export async function hashPassword(pw) {
  try {
    if (window.crypto && window.crypto.subtle) {
      const enc = new TextEncoder().encode(pw);
      const buf = await window.crypto.subtle.digest('SHA-256', enc);
      return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (e) { /* fall through */ }
  let hash = 0;
  for (let i = 0; i < pw.length; i++) { hash = ((hash << 5) - hash + pw.charCodeAt(i)) | 0; }
  return 'fallback-' + Math.abs(hash).toString(16);
}

export { initials, formatMoneyInput, parseMoneyInput } from '../../../shared/utils/format';
export { nextGroupColor } from '../../../shared/constants/colors';
export { getLessonTimeInfo } from '../../../shared/utils/lessonTime';
export {
  generateId,
  todayISO,
  formatDate,
  normalizePhone,
  displayPhone,
  hashPassword,
} from '../../../shared/utils/common';

export function thisMonthKey() { return new Date().toISOString().slice(0, 7); }

export function prevMonthKey(month) { const [y, m] = month.split('-').map(Number); return new Date(y, m - 2, 1).toISOString().slice(0, 7); }

export function money(n) { return (n || 0).toLocaleString('uz-UZ'); }

export function generateDemoCode() { return String(Math.floor(10000 + Math.random() * 90000)); }

export function timeAgo(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return 'hozir';
  if (diff < 3600) return `${Math.floor(diff / 60)} daq oldin`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} soat oldin`;
  return `${Math.floor(diff / 86400)} kun oldin`;
}

export function getPaymentTotal(payments, studentId, groupId, month) {
  return payments.filter(p => p.studentId === studentId && p.groupId === groupId && p.month === month).reduce((s, p) => s + p.amount, 0);
}

export function getPaymentStatus(payments, studentId, groupId, month, price) {
  const total = getPaymentTotal(payments, studentId, groupId, month);
  if (total <= 0) return 'unpaid';
  if (total < price) return 'partial';
  return 'paid';
}

export function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function compressImageDataUrl(dataUrl, maxWidth) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

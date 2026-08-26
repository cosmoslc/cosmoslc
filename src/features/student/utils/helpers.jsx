export { initials } from '../../../shared/utils/format';
export {
  generateId,
  todayISO,
  formatDate,
  formatDateTime,
  normalizePhone,
  displayPhone,
  hashPassword,
} from '../../../shared/utils/common';

export function withGroupId(students, groupId) {
  return students.map(s => ({ ...s, groupId }));
}

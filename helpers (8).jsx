export { initials } from '../../../shared/utils/format';
export { getLessonTimeInfo } from '../../../shared/utils/lessonTime';
export { nextGroupColor } from '../../../shared/constants/colors';
export {
  generateId,
  todayISO,
  formatDate,
  formatDateTime,
  normalizePhone,
  displayPhone,
  hashPassword,
} from '../../../shared/utils/common';
import { WEEK_DAYS } from './constants';

export function money(n) {
  if (n === null || n === undefined || isNaN(n)) return '0';
  return Number(n).toLocaleString('ru-RU');
}

// Returns ISO date strings (recent-first) that fall on this group's scheduled weekdays
export function getClassDates(group, back = 21, forward = 7) {
  if (!group || !group.days || !group.days.length) return [];
  const dates = [];
  const today = new Date();
  for (let offset = forward; offset >= -back; offset--) {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    const dayName = WEEK_DAYS[(d.getDay() + 6) % 7];
    if (group.days.includes(dayName)) dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

// Counts how many of a group's scheduled weekdays fall between startDate and today (inclusive)
export function countClassDaysSince(days, startDate) {
  if (!days || !days.length || !startDate) return 0;
  const start = new Date(startDate + 'T00:00:00');
  const today = new Date();
  if (isNaN(start.getTime()) || start > today) return 0;
  let count = 0;
  const cursor = new Date(start);
  while (cursor <= today) {
    const dayName = WEEK_DAYS[(cursor.getDay() + 6) % 7];
    if (days.includes(dayName)) count += 1;
    cursor.setDate(cursor.getDate() + 1);
  }
  return count;
}

// Day-of-month numbers for Mon..Sun of the current calendar week
export function getCurrentWeekDates() {
  const today = new Date();
  const dow = (today.getDay() + 6) % 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - dow);
  return WEEK_DAYS.map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.getDate();
  });
}

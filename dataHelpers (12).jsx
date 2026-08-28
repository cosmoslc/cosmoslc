import { WEEK_DAYS } from './constants';

export function getGroupStudents(appData, groupId) {
  const gIdStr = String(groupId);
  return (appData?.students || []).filter(s =>
    (s.groupIds || []).some(id => String(id) === gIdStr)
  );
}

export function getStudentGroups(appData, studentId) {
  const student = (appData?.students || []).find(s => s.id === studentId);
  if (!student) return [];
  const sGroupIds = (student.groupIds || []).map(String);
  return (appData?.groups || []).filter(g => sGroupIds.includes(String(g.id)));
}

export function getStudentStats(tasks, studentId, groupId) {
  let sum = 0, count = 0, done = 0, total = 0;
  const gIdStr = String(groupId);
  (tasks || []).forEach(t => {
    if (String(t.groupId) !== gIdStr) return;
    total += 1;
    const sub = t.submissions?.[studentId];
    if (sub && (sub.status === 'submitted' || sub.status === 'graded')) done += 1;
    if (sub && sub.status === 'graded' && sub.rating) { sum += sub.rating; count += 1; }
  });
  return { avg: count ? sum / count : 0, count, done, total };
}

export function getStudentStatsAllGroups(appData, studentId) {
  const student = (appData?.students || []).find(s => s.id === studentId);
  const groupIds = (student?.groupIds || []).map(String);
  let sum = 0, count = 0, done = 0, total = 0;
  (appData?.tasks || []).forEach(t => {
    if (!groupIds.includes(String(t.groupId))) return;
    total += 1;
    const sub = t.submissions?.[studentId];
    if (sub && (sub.status === 'submitted' || sub.status === 'graded')) done += 1;
    if (sub && sub.status === 'graded' && sub.rating) { sum += sub.rating; count += 1; }
  });
  return { avg: count ? sum / count : 0, count, done, total };
}

export { attendanceStatus } from '../../../shared/utils/common';

export function getAttendanceStats(attendance, studentId, groupIds) {
  let present = 0, total = 0;
  const gIdStrs = (groupIds || []).map(String);
  (attendance || []).forEach(a => {
    if (!gIdStrs.includes(String(a.groupId))) return;
    const status = attendanceStatus(a, studentId);
    if (status != null) {
      total += 1;
      if (status === 'present' || status === 'late') present += 1;
    }
  });
  return { present, total };
}

export function rankStudents(students, tasks) {
  return students
    .map(s => ({ ...s, stats: getStudentStats(tasks, s.id, s.groupId) }))
    .sort((a, b) => {
      if (b.stats.avg !== a.stats.avg) return b.stats.avg - a.stats.avg;
      if (b.stats.count !== a.stats.count) return b.stats.count - a.stats.count;
      return a.name.localeCompare(b.name);
    });
}

export function allStudentsFlat(appData) {
  const list = [];
  appData.groups.forEach(g => {
    getGroupStudents(appData, g.id).forEach(s => list.push({ ...s, groupId: g.id, groupName: g.name, groupColor: g.color }));
  });
  return list;
}

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

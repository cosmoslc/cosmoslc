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
  attendance.forEach(a => {
    if (!groupIds.includes(a.groupId)) return;
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

export function withGroupId(students, groupId) { return students.map(s => ({ ...s, groupId })); }

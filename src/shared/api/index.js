// Aggregates every table fetch into the two shapes the frontend already
// expects (directorData + opData), so the rest of the app barely has to
// change from the old window.storage version.
import { fetchDirectors, fetchBranches, updateDirector as _updateDirector, addDirector as _addDirector, addBranch as _addBranch, updateBranch as _updateBranch, deleteBranch as _deleteBranch } from './directors';
import { fetchManagers, findManagerByPhoneAndHash, addManager as _addManager, updateManager as _updateManager, updateManagerPermissions as _updateManagerPermissions, deleteManager as _deleteManager } from './managers';
import { fetchTeachersHR, fetchTeacherPayments, addTeacherHR as _addTeacherHR, updateTeacherHR as _updateTeacherHR, deleteTeacherHR as _deleteTeacherHR, addTeacherPayment as _addTeacherPayment } from './teachers';
import { fetchFinance, addFinance as _addFinance, approveFinance as _approveFinance, rejectFinance as _rejectFinance } from './finance';
import { fetchCourses, addCourse as _addCourse, updateCourse as _updateCourse, deleteCourse as _deleteCourse } from './courses';
import { fetchHolidays, addHoliday as _addHoliday, removeHoliday as _removeHoliday } from './holidays';
import { fetchGroups, addGroup as _addGroup, updateGroup as _updateGroup, deleteGroup as _deleteGroup } from './groups';
import { fetchStudents, addStudent as _addStudent, updateStudent as _updateStudent, deleteStudent as _deleteStudent, findStudentByPhoneAndHash } from './students';
import { fetchRooms, addRoom as _addRoom, updateRoom as _updateRoom, deleteRoom as _deleteRoom } from './rooms';
import { fetchAttendance, addAttendanceRecord as _addAttendanceRecord, patchAttendanceRecord as _patchAttendanceRecord, updateAttendanceRecord as _updateAttendanceRecord, deleteAttendanceRecord as _deleteAttendanceRecord } from './attendance';
import { fetchPayments, recordPayment as _recordPayment, deletePayment as _deletePayment, updatePayment as _updatePayment } from './payments';
import { fetchTasks, addTask as _addTask, updateTask as _updateTask, deleteTask as _deleteTask, saveSubmissions as _saveSubmissions } from './tasks';
import { fetchPostponed, addPostponed as _addPostponed, deletePostponed as _deletePostponed } from './postponed';
import { fetchCoinSettings as _fetchCoinSettings, updateCoinSettings as _updateCoinSettings, fetchCoinTransactions as _fetchCoinTransactions, addCoinTransaction as _addCoinTransaction, updateStudentCoins as _updateStudentCoins } from './coins';
import { fetchCenterSettings as _fetchCenterSettings, updateCenterSettings as _updateCenterSettings } from './centerSettings';
import { fetchLeads as _fetchLeads, addLead as _addLead, updateLead as _updateLead, deleteLead as _deleteLead, fetchLeadForms as _fetchLeadForms, addLeadForm as _addLeadForm, updateLeadForm as _updateLeadForm, deleteLeadForm as _deleteLeadForm } from './leads';
import { fetchNotifications as _fetchNotifications, addNotification as _addNotification, markNotificationRead as _markNotificationRead, markAllNotificationsRead as _markAllNotificationsRead, clearNotifications as _clearNotifications } from './notifications';
import { fetchEmployeeAttendance as _fetchEmployeeAttendance, addEmployeeAttendance as _addEmployeeAttendance, updateEmployeeAttendance as _updateEmployeeAttendance } from './employeeAttendance';
import { fetchManagerPayments as _fetchManagerPayments, addManagerPayment as _addManagerPayment } from './managerPayments';
import {
  fetchArchives as _fetchArchives,
  archiveRecord as _archiveRecord,
  restoreRecord as _restoreRecord,
  permanentlyDeleteRecord as _permanentlyDeleteRecord,
  clearArchiveType as _clearArchiveType,
} from './archives';

export async function fetchDirectorData() {
  try {
    const [directors, branches, managers, teachersHR, teacherPayments, holidays, finance, courses, payments, managerPayments, coinSettings, centerSettings, notifications, leads, leadForms] =
      await Promise.all([
        fetchDirectors(), fetchBranches(), fetchManagers(), fetchTeachersHR(),
        fetchTeacherPayments(), fetchHolidays(), fetchFinance(), fetchCourses(), fetchPayments(),
        _fetchManagerPayments(), _fetchCoinSettings(), _fetchCenterSettings(), _fetchNotifications(),
        _fetchLeads(), _fetchLeadForms(),
      ]);
    return {
      directors: directors || [],
      branches: branches || [],
      managers: managers || [],
      teachersHR: teachersHR || [],
      teacherPayments: teacherPayments || [],
      holidays: holidays || [],
      finance: finance || [],
      courses: courses || [],
      payments: payments || [],
      managerPayments: managerPayments || [],
      coinSettings: coinSettings || {},
      centerSettings: centerSettings || {},
      notifications: notifications || [],
      leads: leads || [],
      leadForms: leadForms || [],
    };
  } catch (err) {
    console.error("fetchDirectorData exception:", err);
    return {
      directors: [], branches: [], managers: [], teachersHR: [], teacherPayments: [],
      holidays: [], finance: [], courses: [], payments: [], managerPayments: [],
      coinSettings: {}, centerSettings: {}, notifications: [], leads: [], leadForms: [],
    };
  }
}

export async function fetchOpData() {
  try {
    const [groups, students, rooms, attendance, coinTransactions, employeeAttendance] = await Promise.all([
      fetchGroups(), fetchStudents(), fetchRooms(), fetchAttendance(),
      _fetchCoinTransactions(), _fetchEmployeeAttendance(),
    ]);
    return {
      groups: groups || [],
      students: students || [],
      rooms: rooms || [],
      attendance: attendance || [],
      coinTransactions: coinTransactions || [],
      employeeAttendance: employeeAttendance || [],
    };
  } catch (err) {
    console.error("fetchOpData exception:", err);
    return {
      groups: [], students: [], rooms: [], attendance: [], coinTransactions: [], employeeAttendance: [],
    };
  }
}

export async function fetchAppData() {
  try {
    const [students, groups, tasks, attendance, coinSettings, postponed] = await Promise.all([
      fetchStudents(), fetchGroups(), fetchTasks(),
      fetchAttendance(), _fetchCoinSettings(), fetchPostponed(),
    ]);
    return {
      students: students || [],
      groups: groups || [],
      tasks: tasks || [],
      attendance: attendance || [],
      coinSettings: coinSettings || {},
      postponed: postponed || [],
    };
  } catch (err) {
    console.error("fetchAppData exception:", err);
    return {
      students: [], groups: [], tasks: [], attendance: [], coinSettings: {}, postponed: [],
    };
  }
}

export {
  fetchDirectors,
  fetchBranches,
  findManagerByPhoneAndHash,
  findStudentByPhoneAndHash,
  _updateDirector as updateDirector,
  _addDirector as addDirector,
  _addBranch as addBranch, _updateBranch as updateBranch, _deleteBranch as deleteBranch,
  _addManager as addManager, _updateManager as updateManager, _updateManagerPermissions as updateManagerPermissions, _deleteManager as deleteManager,
  _updateStudent as updateStudent,
  _addStudent as addStudent, _deleteStudent as deleteStudent,
  _addTeacherHR as addTeacherHR, _updateTeacherHR as updateTeacherHR, _deleteTeacherHR as deleteTeacherHR, _addTeacherPayment as addTeacherPayment,
  _addFinance as addFinance, _approveFinance as approveFinance, _rejectFinance as rejectFinance,
  _addCourse as addCourse, _updateCourse as updateCourse, _deleteCourse as deleteCourse,
  _addHoliday as addHoliday, _removeHoliday as removeHoliday,
  _addGroup as addGroup, _updateGroup as updateGroup, _deleteGroup as deleteGroup,
  _addRoom as addRoom, _updateRoom as updateRoom, _deleteRoom as deleteRoom,
  _addAttendanceRecord as addAttendanceRecord, _patchAttendanceRecord as patchAttendanceRecord, _updateAttendanceRecord as updateAttendanceRecord, _deleteAttendanceRecord as deleteAttendanceRecord,
  _recordPayment as recordPayment, _deletePayment as deletePayment, _updatePayment as updatePayment,
  _addTask as addTask, _updateTask as updateTask, _deleteTask as deleteTask, _saveSubmissions as saveSubmissions,
  _addPostponed as addPostponed, _deletePostponed as deletePostponed,
  _updateCoinSettings as updateCoinSettings,
  _fetchCoinSettings as fetchCoinSettings,
  _fetchCoinTransactions as fetchCoinTransactions,
  _addCoinTransaction as addCoinTransaction,
  _updateStudentCoins as updateStudentCoins,
  _fetchCenterSettings as fetchCenterSettings,
  _updateCenterSettings as updateCenterSettings,
  _fetchLeads as fetchLeads,
  _addLead as addLead,
  _updateLead as updateLead,
  _deleteLead as deleteLead,
  _fetchLeadForms as fetchLeadForms,
  _addLeadForm as addLeadForm,
  _updateLeadForm as updateLeadForm,
  _deleteLeadForm as deleteLeadForm,
  _fetchNotifications as fetchNotifications,
  _addNotification as addNotification,
  _markNotificationRead as markNotificationRead,
  _markAllNotificationsRead as markAllNotificationsRead,
  _clearNotifications as clearNotifications,
  _fetchEmployeeAttendance as fetchEmployeeAttendance,
  _addEmployeeAttendance as addEmployeeAttendance,
  _updateEmployeeAttendance as updateEmployeeAttendance,
  _fetchManagerPayments as fetchManagerPayments,
  _addManagerPayment as addManagerPayment,
  _fetchArchives as fetchArchives,
  _archiveRecord as archiveRecord,
  _restoreRecord as restoreRecord,
  _permanentlyDeleteRecord as permanentlyDeleteRecord,
  _clearArchiveType as clearArchiveType,
};
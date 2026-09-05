// Permission and Page Access Control Engine for COSMOS CRM
import { INITIAL_ROLES } from "../pages/PositionsPage";

// Mapping from Page ID to granular permissions that grant access to that page
export const PAGE_PERMISSION_MAP = {
  home: ["dashboard.view", "dashboard.financial_stats", "dashboard.conversion_stats", "dashboard"],
  workbench: ["dashboard.view", "workbench"],
  leads: [
    "leads.view",
    "leads.create",
    "leads.edit",
    "leads.delete",
    "leads.call_log",
    "leads.status_change",
    "leads.convert_to_student",
    "leads.reassign",
    "leads.import_export",
    "leads",
  ],
  leadsLost: ["leads.view", "leads"],
  leadsAnalytics: ["leads.view", "dashboard.conversion_stats", "leads"],
  leadsForm: ["leads.view", "leads.create", "leads"],
  leadsSettings: ["leads.view", "leads"],
  leadsFormSettings: ["leads.view", "leads"],
  students: [
    "students.view",
    "students.create",
    "students.edit",
    "students.delete",
    "students.balance_edit",
    "students.sms_send",
    "students.contract_print",
    "students.freeze",
    "students",
  ],
  groups: [
    "groups.view",
    "groups.create",
    "groups.edit",
    "groups.delete",
    "groups.add_student",
    "groups.remove_student",
    "groups.change_teacher",
    "groups.attendance_view",
    "groups",
  ],
  teachers: ["staff.view", "staff.create", "staff.edit", "teachers.view", "teachers"],
  employeeAttendance: [
    "attendance.employee_view",
    "attendance.employee_mark",
    "employeeAttendance",
  ],
  attendance: [
    "attendance.student_mark",
    "attendance.student_edit_past",
    "attendance.export",
    "attendance",
  ],
  finance: [
    "dashboard.financial_stats",
    "finance.payment_view",
    "expenses.view",
    "salaries.view",
    "additional_income.view",
    "finance",
  ],
  payments: [
    "finance.payment_view",
    "finance.payment_create",
    "finance.payment_edit",
    "finance.payment_delete",
    "finance.payment_receipt_print",
    "payments",
  ],
  additionalIncome: [
    "additional_income.view",
    "additional_income.create",
    "additionalIncome",
  ],
  salaries: [
    "salaries.view",
    "salaries.calculate",
    "salaries.pay",
    "salaries.advance_manage",
    "salaries.kpi_edit",
    "salaries",
  ],
  expenses: [
    "expenses.view",
    "expenses.create",
    "expenses.edit_delete",
    "expenses.categories",
    "expenses",
  ],
  debtors: [
    "finance.debtors_view",
    "finance.debtors_remind",
    "debtors",
  ],
  breakEven: [
    "dashboard.financial_stats",
    "finance.payment_view",
    "expenses.view",
    "breakEven",
  ],
  archive: [
    "archive.view",
    "archive.restore",
    "archive.permanent_delete",
    "archive",
  ],
  archiveStudents: ["archive.view", "archive"],
  archiveTeachers: ["archive.view", "archive"],
  archiveStaff: ["archive.view", "archive"],
  archiveGroups: ["archive.view", "archive"],
  archiveFinance: ["archive.view", "archive"],
  archiveLeads: ["archive.view", "archive"],
  branches: ["settings.branches", "branches"],
  positions: ["settings.roles_permissions", "positions"],
  managers: [
    "staff.view",
    "staff.create",
    "staff.edit",
    "staff.delete",
    "staff.roles_assign",
    "managers",
    "staff",
  ],
  staff: [
    "staff.view",
    "staff.create",
    "staff.edit",
    "staff.delete",
    "staff.roles_assign",
    "managers",
    "staff",
  ],
  xodimlar: [
    "staff.view",
    "staff.create",
    "staff.edit",
    "staff.delete",
    "staff.roles_assign",
    "managers",
    "staff",
  ],
  rooms: ["settings.rooms", "rooms"],
  holidays: ["settings.branches", "holidays"],
  receiptSettings: ["settings.receipt", "receiptSettings"],
  courses: ["settings.courses", "courses"],
  reasons: ["settings.courses", "reasons"],
  placementTest: ["settings.courses", "placementTest"],
  points: ["settings.courses", "points"],
  examTemplates: ["settings.courses", "examTemplates"],
  centerSettings: ["settings.branches", "centerSettings"],
  smsBuy: ["settings.sms_gateways", "smsBuy"],
  autoSms: ["settings.sms_gateways", "autoSms"],
  smsTemplates: ["settings.sms_gateways", "smsTemplates"],
  simpleForm: ["settings.branches", "simpleForm"],
  teacherForm: ["settings.branches", "teacherForm"],
  staffForm: ["settings.branches", "staffForm"],
  referralForm: ["settings.branches", "referralForm"],
  tags: ["settings.branches", "tags"],
  paymentTypes: ["finance.payment_view", "settings.receipt", "paymentTypes"],
};

/**
 * Get saved roles from localStorage or fall back to INITIAL_ROLES
 */
export function getStoredRoles() {
  if (typeof window === "undefined" || !window.localStorage) return INITIAL_ROLES;
  try {
    const raw = localStorage.getItem("cosmos_custom_roles_v2");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error("Error reading stored roles:", e);
  }
  return INITIAL_ROLES;
}

/**
 * Maps an array of granular permissions to page IDs
 */
export function getPagesFromPermissions(permissions = []) {
  if (!Array.isArray(permissions) || permissions.length === 0) return [];
  const set = new Set();
  const permSet = new Set(permissions);

  for (const [pageId, requiredPerms] of Object.entries(PAGE_PERMISSION_MAP)) {
    if (requiredPerms.some((p) => permSet.has(p))) {
      set.add(pageId);
    }
  }

  return Array.from(set);
}

/**
 * Combines role permissions and direct permissions for a staff member
 */
export function resolveUserPermissionsAndPages(user, customRoles = null) {
  if (!user) return { permissions: [], allowedPages: [] };
  if (user.role === "director") {
    const allPages = Object.keys(PAGE_PERMISSION_MAP);
    return {
      permissions: ["*"],
      allowedPages: allPages,
    };
  }

  const roles = customRoles || getStoredRoles();
  const userRoleIds = user.roleIds || (user.roleId ? [user.roleId] : []);
  const matchingRoles = roles.filter((r) => userRoleIds.includes(r.id));

  // Role permissions
  const rolePerms = matchingRoles.flatMap((r) => r.permissions || []);
  // Direct permissions or existing allowed pages
  const directPerms = user.permissions || user.allowedPages || [];

  const combinedPerms = Array.from(new Set([...rolePerms, ...directPerms]));
  const mappedPages = getPagesFromPermissions(combinedPerms);
  const combinedPages = Array.from(new Set([...combinedPerms, ...mappedPages]));

  return {
    permissions: combinedPerms,
    allowedPages: combinedPages,
  };
}

/**
 * Primary check: Can this user access this specific page?
 */
export function canUserAccessPage(pageId, user) {
  if (!user) return false;
  if (user.role === "director") return true;

  const allowed = user.allowedPages || [];
  const perms = user.permissions || [];

  // Direct match in allowed pages or permissions
  if (allowed.includes(pageId) || perms.includes(pageId)) return true;

  // Granular check via PAGE_PERMISSION_MAP
  const reqPerms = PAGE_PERMISSION_MAP[pageId];
  if (reqPerms && reqPerms.length > 0) {
    const hasPerm = reqPerms.some((p) => allowed.includes(p) || perms.includes(p));
    if (hasPerm) return true;
  }

  // Also check role permissions if user has roleIds
  if (Array.isArray(user.roleIds) && user.roleIds.length > 0) {
    const roles = getStoredRoles();
    const userRoles = roles.filter((r) => user.roleIds.includes(r.id));
    const rolePerms = userRoles.flatMap((r) => r.permissions || []);
    if (rolePerms.includes(pageId)) return true;
    if (reqPerms && reqPerms.some((p) => rolePerms.includes(p))) return true;
  }

  return false;
}

/**
 * Check if user has a specific granular permission (e.g., 'students.create')
 */
export function hasPermission(permKey, user) {
  if (!user) return false;
  if (user.role === "director") return true;

  const perms = user.permissions || [];
  const allowed = user.allowedPages || [];

  if (perms.includes(permKey) || allowed.includes(permKey)) return true;

  // Also check role permissions
  if (Array.isArray(user.roleIds) && user.roleIds.length > 0) {
    const roles = getStoredRoles();
    const userRoles = roles.filter((r) => user.roleIds.includes(r.id));
    const rolePerms = userRoles.flatMap((r) => r.permissions || []);
    if (rolePerms.includes(permKey)) return true;
  }

  return false;
}

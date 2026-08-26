import React, { useState, useMemo, useEffect } from "react";
import {
  ShieldCheck,
  Plus,
  Search,
  Check,
  X,
  Edit2,
  Trash2,
  Copy,
  Users,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  ChevronDown,
  LayoutDashboard,
  Target,
  GraduationCap,
  Layers,
  CalendarCheck,
  CreditCard,
  Coins,
  Wallet,
  Archive,
  CheckSquare,
  Square,
  Sparkles,
} from "lucide-react";

// ==========================================
// PERMISSIONS CATALOG (TITLES ONLY)
// ==========================================
export const PERMISSION_CATEGORIES = [
  {
    id: "dashboard",
    order: 1,
    title: "1. Boshqaruv Paneli va Statistika",
    icon: LayoutDashboard,
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-50 dark:bg-indigo-950/40",
    permissions: [
      { id: "dashboard.view", name: "Boshqaruv panelini ko'rish" },
      { id: "dashboard.financial_stats", name: "Moliyaviy ko'rsatkichlar va daromad" },
      { id: "dashboard.conversion_stats", name: "Konversiya va Lidlar statistikasi" },
      { id: "dashboard.export", name: "Hisobotlarni eksport qilish" },
    ],
  },
  {
    id: "leads",
    order: 2,
    title: "2. Lidlar va CRM (Sotuv Voronkasi)",
    icon: Target,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    permissions: [
      { id: "leads.view", name: "Lidlar ro'yxatini ko'rish" },
      { id: "leads.create", name: "Yangi lid qo'shish" },
      { id: "leads.edit", name: "Lid ma'lumotlarini tahrirlash" },
      { id: "leads.delete", name: "Lidni o'chirish / arxivga o'tkazish" },
      { id: "leads.call_log", name: "Qo'ng'iroq va suhbat tarixini yozish" },
      { id: "leads.status_change", name: "Bosqichdan bosqichga o'tkazish (Kanban)" },
      { id: "leads.convert_to_student", name: "Lidni talabaga aylantirish" },
      { id: "leads.reassign", name: "Lidni boshqa xodimga biriktirish" },
      { id: "leads.import_export", name: "Excel orqali import va eksport" },
    ],
  },
  {
    id: "students",
    order: 3,
    title: "3. Talabalar Boshqaruvi",
    icon: GraduationCap,
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-950/40",
    permissions: [
      { id: "students.view", name: "Talabalar ro'yxatini ko'rish" },
      { id: "students.create", name: "Yangi talaba ro'yxatdan o'tkazish" },
      { id: "students.edit", name: "Talaba ma'lumotlarini tahrirlash" },
      { id: "students.delete", name: "Talabani o'chirish / arxivlash" },
      { id: "students.balance_edit", name: "Talaba balansiga tuzatish kiritish" },
      { id: "students.sms_send", name: "Shaxsiy SMS xabar yuborish" },
      { id: "students.contract_print", name: "Shartnoma va guvohnoma chop etish" },
      { id: "students.freeze", name: "O'qishni vaqtincha muzlatish" },
    ],
  },
  {
    id: "groups",
    order: 4,
    title: "4. Guruhlar va Dars Jadvali",
    icon: Layers,
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-50 dark:bg-sky-950/40",
    permissions: [
      { id: "groups.view", name: "Guruhlar ro'yxatini ko'rish" },
      { id: "groups.create", name: "Yangi guruh ochish" },
      { id: "groups.edit", name: "Guruh parametrlarini tahrirlash" },
      { id: "groups.delete", name: "Guruhni yakunlash / o'chirish" },
      { id: "groups.add_student", name: "Guruhga talaba biriktirish" },
      { id: "groups.remove_student", name: "Guruhdan talabani chiqarish" },
      { id: "groups.change_teacher", name: "O'qituvchini almashtirish" },
      { id: "groups.attendance_view", name: "Guruh davomat tarixini ko'rish" },
    ],
  },
  {
    id: "attendance",
    order: 5,
    title: "5. Davomat va Keldi-Ketdi",
    icon: CalendarCheck,
    color: "text-teal-600 dark:text-teal-400",
    bg: "bg-teal-50 dark:bg-teal-950/40",
    permissions: [
      { id: "attendance.student_mark", name: "Talabalar davomatini olish" },
      { id: "attendance.student_edit_past", name: "O'tgan kunlar davomatini o'zgartirish" },
      { id: "attendance.employee_view", name: "Xodimlar davomatini ko'rish" },
      { id: "attendance.employee_mark", name: "Xodimlar davomatini belgilash" },
      { id: "attendance.export", name: "Davomat jurnalini yuklab olish" },
    ],
  },
  {
    id: "finance_payments",
    order: 6,
    title: "6. Moliya: To'lovlar va Kassa",
    icon: CreditCard,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    permissions: [
      { id: "finance.payment_view", name: "To'lovlar ro'yxatini ko'rish" },
      { id: "finance.payment_create", name: "To'lov qabul qilish" },
      { id: "finance.payment_edit", name: "To'lovni tahrirlash" },
      { id: "finance.payment_delete", name: "To'lovni bekor qilish / o'chirish" },
      { id: "finance.payment_receipt_print", name: "To'lov chekini chop etish" },
      { id: "finance.debtors_view", name: "Qarzdorlar ro'yxatini ko'rish" },
      { id: "finance.debtors_remind", name: "Qarzdorlarga eslatma yuborish" },
      { id: "finance.advance_give", name: "Avans berish va hisobdan chiqarish" },
    ],
  },
  {
    id: "finance_salaries",
    order: 7,
    title: "7. Moliya: Ish Haqi va Avanslar",
    icon: Coins,
    color: "text-teal-600 dark:text-teal-400",
    bg: "bg-teal-50 dark:bg-teal-950/40",
    permissions: [
      { id: "salaries.view", name: "Maoshlar jadvalini ko'rish" },
      { id: "salaries.calculate", name: "Ish haqini hisoblash" },
      { id: "salaries.pay", name: "Ish haqini to'lash" },
      { id: "salaries.advance_manage", name: "Avanslarni tasdiqlash" },
      { id: "salaries.kpi_edit", name: "KPI, bonus va jarimalar kiritish" },
    ],
  },
  {
    id: "finance_expenses",
    order: 8,
    title: "8. Moliya: Xarajatlar va Qo'shimcha Daromad",
    icon: Wallet,
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-950/40",
    permissions: [
      { id: "expenses.view", name: "Xarajatlar ro'yxatini ko'rish" },
      { id: "expenses.create", name: "Yangi xarajat kiritish" },
      { id: "expenses.edit_delete", name: "Xarajatni tahrirlash yoki o'chirish" },
      { id: "expenses.categories", name: "Xarajat toifalarini boshqarish" },
      { id: "additional_income.view", name: "Qo'shimcha daromadlarni ko'rish" },
      { id: "additional_income.create", name: "Qo'shimcha daromad kiritish" },
      { id: "bonuses.manage", name: "Bonus tizimini boshqarish" },
    ],
  },
  {
    id: "staff",
    order: 9,
    title: "9. Xodimlar va O'qituvchilar (HR)",
    icon: Users,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/40",
    permissions: [
      { id: "staff.view", name: "Xodimlar ro'yxatini ko'rish" },
      { id: "staff.create", name: "Yangi xodim / ustoz qo'shish" },
      { id: "staff.edit", name: "Xodim ma'lumotlarini tahrirlash" },
      { id: "staff.delete", name: "Xodimni bo'shatish / arxivlash" },
      { id: "staff.roles_assign", name: "Lavozim va ruxsatlarni biriktirish" },
    ],
  },
  {
    id: "settings",
    order: 10,
    title: "10. Tizim Sozlamalari",
    icon: Sliders,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    permissions: [
      { id: "settings.branches", name: "Filiallarni boshqarish" },
      { id: "settings.rooms", name: "Xonalar va sig'imlarni sozlash" },
      { id: "settings.courses", name: "Kurslar va narxlar katalogi" },
      { id: "settings.roles_permissions", name: "Lavozimlar va ruxsatlarni sozlash" },
      { id: "settings.sms_gateways", name: "SMS provayder va avto-SMS shablonlari" },
      { id: "settings.receipt", name: "Chek va printer sozlamalari" },
      { id: "settings.logs", name: "Tizim harakatlari jurnali (Audit Logs)" },
    ],
  },
  {
    id: "archive",
    order: 11,
    title: "11. Tizim Arxivi (Recycle Bin)",
    icon: Archive,
    color: "text-slate-600 dark:text-slate-400",
    bg: "bg-slate-50 dark:bg-slate-900/60",
    permissions: [
      { id: "archive.view", name: "Arxivdagi yozuvlarni ko'rish" },
      { id: "archive.restore", name: "Arxivdan ma'lumotlarni qayta tiklash" },
      { id: "archive.permanent_delete", name: "Butunlay o'chirib yuborish" },
    ],
  },
];

export const ALL_PERMISSION_IDS = PERMISSION_CATEGORIES.flatMap((c) =>
  c.permissions.map((p) => p.id)
);

// Built-in templates
const ROLE_TEMPLATES = [
  {
    name: "Bosh Direktor (Super Admin)",
    permissions: ALL_PERMISSION_IDS,
  },
  {
    name: "Filial Menejeri",
    permissions: ALL_PERMISSION_IDS.filter(
      (p) => !["settings.roles_permissions", "settings.logs", "archive.permanent_delete"].includes(p)
    ),
  },
  {
    name: "Katta Administrator",
    permissions: [
      "dashboard.view",
      "leads.view", "leads.create", "leads.edit", "leads.call_log", "leads.status_change", "leads.convert_to_student",
      "students.view", "students.create", "students.edit", "students.sms_send", "students.contract_print",
      "groups.view", "groups.add_student", "groups.attendance_view",
      "attendance.student_mark",
      "finance.payment_view", "finance.payment_create", "finance.payment_receipt_print", "finance.debtors_view", "finance.debtors_remind",
      "additional_income.view", "additional_income.create",
      "staff.view",
      "archive.view",
    ],
  },
  {
    name: "O'qituvchi / Mentor",
    permissions: [
      "dashboard.view",
      "students.view",
      "groups.view", "groups.attendance_view",
      "attendance.student_mark",
      "bonuses.manage",
    ],
  },
  {
    name: "Buxgalter / Kassir",
    permissions: [
      "dashboard.view", "dashboard.financial_stats", "dashboard.export",
      "students.view", "students.balance_edit",
      "finance.payment_view", "finance.payment_create", "finance.payment_edit", "finance.payment_receipt_print", "finance.debtors_view", "finance.advance_give",
      "salaries.view", "salaries.calculate", "salaries.pay", "salaries.advance_manage", "salaries.kpi_edit",
      "expenses.view", "expenses.create", "expenses.edit_delete", "expenses.categories",
      "additional_income.view", "additional_income.create",
      "archive.view",
    ],
  },
  {
    name: "Sotuv va Lid Menejeri",
    permissions: [
      "dashboard.view", "dashboard.conversion_stats",
      "leads.view", "leads.create", "leads.edit", "leads.call_log", "leads.status_change", "leads.convert_to_student", "leads.reassign", "leads.import_export",
      "students.view", "students.create", "students.sms_send",
      "groups.view",
    ],
  },
  {
    name: "HR Menejer",
    permissions: [
      "dashboard.view",
      "attendance.employee_view", "attendance.employee_mark",
      "staff.view", "staff.create", "staff.edit", "staff.roles_assign",
      "salaries.view",
    ],
  },
];

export const INITIAL_ROLES = [
  {
    id: "role-superadmin",
    name: "Bosh Direktor (Super Admin)",
    code: "super_admin",
    color: "#6366f1",
    isSystem: true,
    usersCount: 2,
    permissions: ALL_PERMISSION_IDS,
  },
  {
    id: "role-branchmanager",
    name: "Filial Menejeri",
    code: "branch_manager",
    color: "#0ea5e9",
    isSystem: false,
    usersCount: 4,
    permissions: ALL_PERMISSION_IDS.filter(
      (p) => !["settings.roles_permissions", "settings.logs", "archive.permanent_delete"].includes(p)
    ),
  },
  {
    id: "role-admin",
    name: "Katta Administrator",
    code: "senior_admin",
    color: "#8b5cf6",
    isSystem: false,
    usersCount: 6,
    permissions: [
      "dashboard.view",
      "leads.view", "leads.create", "leads.edit", "leads.call_log", "leads.status_change", "leads.convert_to_student",
      "students.view", "students.create", "students.edit", "students.sms_send", "students.contract_print",
      "groups.view", "groups.add_student", "groups.attendance_view",
      "attendance.student_mark",
      "finance.payment_view", "finance.payment_create", "finance.payment_receipt_print", "finance.debtors_view", "finance.debtors_remind",
      "additional_income.view", "additional_income.create",
      "staff.view",
      "archive.view",
    ],
  },
  {
    id: "role-teacher",
    name: "O'qituvchi / Mentor",
    code: "teacher",
    color: "#10b981",
    isSystem: false,
    usersCount: 18,
    permissions: [
      "dashboard.view",
      "students.view",
      "groups.view", "groups.attendance_view",
      "attendance.student_mark",
      "bonuses.manage",
    ],
  },
  {
    id: "role-accountant",
    name: "Buxgalter / Kassir",
    code: "accountant",
    color: "#14b8a6",
    isSystem: false,
    usersCount: 3,
    permissions: [
      "dashboard.view", "dashboard.financial_stats", "dashboard.export",
      "students.view", "students.balance_edit",
      "finance.payment_view", "finance.payment_create", "finance.payment_edit", "finance.payment_receipt_print", "finance.debtors_view", "finance.advance_give",
      "salaries.view", "salaries.calculate", "salaries.pay", "salaries.advance_manage", "salaries.kpi_edit",
      "expenses.view", "expenses.create", "expenses.edit_delete", "expenses.categories",
      "additional_income.view", "additional_income.create",
      "archive.view",
    ],
  },
  {
    id: "role-sales",
    name: "Sotuv va Lid Menejeri",
    code: "sales_lead_manager",
    color: "#f59e0b",
    isSystem: false,
    usersCount: 5,
    permissions: [
      "dashboard.view", "dashboard.conversion_stats",
      "leads.view", "leads.create", "leads.edit", "leads.call_log", "leads.status_change", "leads.convert_to_student", "leads.reassign", "leads.import_export",
      "students.view", "students.create", "students.sms_send",
      "groups.view",
    ],
  },
  {
    id: "role-hr",
    name: "HR Menejer",
    code: "hr_manager",
    color: "#ec4899",
    isSystem: false,
    usersCount: 2,
    permissions: [
      "dashboard.view",
      "attendance.employee_view", "attendance.employee_mark",
      "staff.view", "staff.create", "staff.edit", "staff.roles_assign",
      "salaries.view",
    ],
  },
];

export function PositionsPage() {
  const [roles, setRoles] = useState(() => {
    try {
      const saved = localStorage.getItem("cosmos_custom_roles_v2");
      return saved ? JSON.parse(saved) : INITIAL_ROLES;
    } catch {
      return INITIAL_ROLES;
    }
  });

  const [selectedRoleId, setSelectedRoleId] = useState(roles[0]?.id || "role-superadmin");
  const [roleSearch, setRoleSearch] = useState("");

  // Permissions search & filter
  const [permSearch, setPermSearch] = useState("");
  const [permFilter, setPermFilter] = useState("all"); // 'all' | 'granted' | 'restricted'

  // Full Screen Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' | 'edit'
  const [modalForm, setModalForm] = useState({
    id: "",
    name: "",
    color: "#6366f1",
    permissions: [],
  });
  const [modalPermSearch, setModalPermSearch] = useState("");
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem("cosmos_custom_roles_v2", JSON.stringify(roles));
    } catch (e) {
      console.error("Failed to save roles:", e);
    }
  }, [roles]);

  const showToast = (msg, type = "success") => {
    setFeedbackToast({ msg, type });
    setTimeout(() => setFeedbackToast(null), 2500);
  };

  const selectedRole = useMemo(() => {
    return roles.find((r) => r.id === selectedRoleId) || roles[0] || null;
  }, [roles, selectedRoleId]);

  const filteredRoles = useMemo(() => {
    return roles.filter((r) =>
      r.name.toLowerCase().includes(roleSearch.toLowerCase())
    );
  }, [roles, roleSearch]);

  const handleToggleSinglePermission = (permId) => {
    if (!selectedRole) return;
    if (selectedRole.isSystem && selectedRole.code === "super_admin") {
      showToast("Super Admin ruxsatlarini o'zgartirish cheklangan!", "error");
      return;
    }

    const currentPerms = selectedRole.permissions || [];
    const hasPerm = currentPerms.includes(permId);
    const updatedPerms = hasPerm
      ? currentPerms.filter((p) => p !== permId)
      : [...currentPerms, permId];

    setRoles((prev) =>
      prev.map((r) => (r.id === selectedRole.id ? { ...r, permissions: updatedPerms } : r))
    );
  };

  const handleOpenCreateModal = () => {
    setModalMode("create");
    setModalForm({
      id: "role-" + Date.now(),
      name: "",
      color: "#6366f1",
      permissions: [],
    });
    setModalPermSearch("");
    setShowTemplateDropdown(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (roleToEdit = selectedRole) => {
    if (!roleToEdit) return;
    setModalMode("edit");
    setModalForm({
      id: roleToEdit.id,
      name: roleToEdit.name,
      color: roleToEdit.color || "#6366f1",
      permissions: [...(roleToEdit.permissions || [])],
    });
    setModalPermSearch("");
    setShowTemplateDropdown(false);
    setIsModalOpen(true);
  };

  const handleCloneRole = (roleToClone) => {
    const newRole = {
      ...roleToClone,
      id: "role-" + Date.now(),
      name: `${roleToClone.name} (Nusxasi)`,
      isSystem: false,
      usersCount: 0,
    };
    setRoles((prev) => [...prev, newRole]);
    setSelectedRoleId(newRole.id);
    showToast(`"${newRole.name}" lavozimi klonlandi!`, "success");
  };

  const handleDeleteRole = (roleToDelete) => {
    if (roleToDelete.isSystem) {
      showToast("Tizim lavozimlarini o'chirib bo'lmaydi!", "error");
      return;
    }
    if (window.confirm(`"${roleToDelete.name}" lavozimini o'chirishni tasdiqlaysizmi?`)) {
      setRoles((prev) => prev.filter((r) => r.id !== roleToDelete.id));
      if (selectedRoleId === roleToDelete.id) {
        setSelectedRoleId(roles[0]?.id || "");
      }
      showToast(`"${roleToDelete.name}" lavozimi o'chirildi!`, "info");
    }
  };

  const handleSaveModal = () => {
    if (!modalForm.name.trim()) {
      alert("Iltimos, lavozim nomini kiriting!");
      return;
    }

    if (modalMode === "create") {
      const newRole = {
        ...modalForm,
        usersCount: 0,
        isSystem: false,
      };
      setRoles((prev) => [...prev, newRole]);
      setSelectedRoleId(newRole.id);
      showToast(`"${newRole.name}" lavozimi yaratildi!`, "success");
    } else {
      setRoles((prev) =>
        prev.map((r) => (r.id === modalForm.id ? { ...r, ...modalForm } : r))
      );
      showToast(`"${modalForm.name}" lavozimi saqlandi!`, "success");
    }
    setIsModalOpen(false);
  };

  const handleSelectAllPermsInModal = () => {
    setModalForm((prev) => ({ ...prev, permissions: ALL_PERMISSION_IDS }));
  };

  const handleClearAllPermsInModal = () => {
    setModalForm((prev) => ({ ...prev, permissions: [] }));
  };

  const handleToggleCategoryInModal = (categoryPermIds) => {
    setModalForm((prev) => {
      const current = prev.permissions;
      const allSelected = categoryPermIds.every((id) => current.includes(id));
      let updated;
      if (allSelected) {
        updated = current.filter((id) => !categoryPermIds.includes(id));
      } else {
        const toAdd = categoryPermIds.filter((id) => !current.includes(id));
        updated = [...current, ...toAdd];
      }
      return { ...prev, permissions: updated };
    });
  };

  const handleToggleSingleInModal = (permId) => {
    setModalForm((prev) => {
      const current = prev.permissions;
      const exists = current.includes(permId);
      return {
        ...prev,
        permissions: exists
          ? current.filter((p) => p !== permId)
          : [...current, permId],
      };
    });
  };

  const handleApplyTemplate = (tmpl) => {
    setModalForm((prev) => ({
      ...prev,
      permissions: [...tmpl.permissions],
    }));
    setShowTemplateDropdown(false);
    showToast(`"${tmpl.name}" shabloni qo'llandi!`, "success");
  };

  return (
    <div className="space-y-5">
      {/* Toast Notification */}
      {feedbackToast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-lg border text-xs font-bold transition-all ${
            feedbackToast.type === "error"
              ? "bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-200 border-rose-200"
              : feedbackToast.type === "info"
              ? "bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border-amber-200"
              : "bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border-emerald-200"
          }`}
        >
          {feedbackToast.type === "error" ? (
            <AlertTriangle size={15} className="text-rose-600" />
          ) : (
            <CheckCircle2 size={15} className="text-emerald-600" />
          )}
          <span>{feedbackToast.msg}</span>
        </div>
      )}

      {/* TOP HEADER */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck size={22} className="text-indigo-600 dark:text-indigo-400" />
            <span>Lavozimlar va Ruxsatlar</span>
          </h1>
        </div>

        <button
          id="btn-add-position"
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
        >
          <Plus size={16} />
          <span>Lavozim Qo'shish</span>
        </button>
      </div>

      {/* MASTER-DETAIL 2-COLUMN VIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ========================================== */}
        {/* LEFT COLUMN: ROLES LIST                    */}
        {/* ========================================== */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Lavozimlar ({filteredRoles.length})
            </h2>
            <button
              onClick={handleOpenCreateModal}
              title="Yangi lavozim qo'shish"
              className="p-1 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              value={roleSearch}
              onChange={(e) => setRoleSearch(e.target.value)}
              placeholder="Lavozimni qidirish..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Roles List */}
          <div className="space-y-1.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {filteredRoles.map((r) => {
              const isSelected = selectedRole?.id === r.id;
              const permCount = (r.permissions || []).length;

              return (
                <div
                  key={r.id}
                  id={`role-item-${r.id}`}
                  onClick={() => setSelectedRoleId(r.id)}
                  className={`px-3 py-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 group ${
                    isSelected
                      ? "bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 text-indigo-900 dark:text-indigo-100 font-bold"
                      : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 text-slate-800 dark:text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: r.color || "#6366f1" }}
                    />
                    <span className="text-xs truncate">{r.name}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[11px] text-slate-400 font-medium group-hover:hidden">
                      {permCount} ta
                    </span>

                    {/* Action buttons on hover */}
                    <div className="hidden group-hover:flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCloneRole(r);
                        }}
                        title="Nusxa olish"
                        className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                      >
                        <Copy size={13} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditModal(r);
                        }}
                        title="Tahrirlash"
                        className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                      >
                        <Edit2 size={13} />
                      </button>
                      {!r.isSystem && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRole(r);
                          }}
                          title="O'chirish"
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================== */}
        {/* RIGHT COLUMN: PERMISSIONS OF SELECTED ROLE */}
        {/* ========================================== */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
          {selectedRole ? (
            <>
              {/* Selected Role Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0"
                    style={{ backgroundColor: selectedRole.color || "#6366f1" }}
                  />
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    {selectedRole.name}
                  </h2>
                </div>

                <button
                  id="btn-edit-role-fullscreen"
                  onClick={() => handleOpenEditModal(selectedRole)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  <Edit2 size={13} className="text-indigo-600 dark:text-indigo-400" />
                  <span>Tahrirlash</span>
                </button>
              </div>

              {/* Search & Filter Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type="text"
                    value={permSearch}
                    onChange={(e) => setPermSearch(e.target.value)}
                    placeholder="Ruxsatni qidirish..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-[11px] shrink-0">
                  <button
                    onClick={() => setPermFilter("all")}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                      permFilter === "all"
                        ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Barchasi ({ALL_PERMISSION_IDS.length})
                  </button>
                  <button
                    onClick={() => setPermFilter("granted")}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                      permFilter === "granted"
                        ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Ruxsat berilgan ({(selectedRole.permissions || []).length})
                  </button>
                  <button
                    onClick={() => setPermFilter("restricted")}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                      permFilter === "restricted"
                        ? "bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Cheklangan ({ALL_PERMISSION_IDS.length - (selectedRole.permissions || []).length})
                  </button>
                </div>
              </div>

              {/* Categorized Permissions in Multi-Column Grid (Ustunlab) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {PERMISSION_CATEGORIES.map((cat) => {
                  const filteredCategoryPerms = cat.permissions.filter((p) => {
                    const matchesSearch = p.name.toLowerCase().includes(permSearch.toLowerCase());
                    if (!matchesSearch) return false;
                    const isGranted = (selectedRole.permissions || []).includes(p.id);
                    if (permFilter === "granted") return isGranted;
                    if (permFilter === "restricted") return !isGranted;
                    return true;
                  });

                  if (filteredCategoryPerms.length === 0) return null;

                  return (
                    <div
                      key={cat.id}
                      className="border border-slate-100 dark:border-slate-800/80 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-800/30 space-y-2"
                    >
                      {/* Category Header */}
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60 dark:border-slate-800">
                        <h3 className="font-bold text-xs text-slate-900 dark:text-white">
                          {cat.title}
                        </h3>
                      </div>

                      {/* Permissions List */}
                      <div className="space-y-1">
                        {filteredCategoryPerms.map((perm) => {
                          const isGranted = (selectedRole.permissions || []).includes(perm.id);

                          return (
                            <div
                              key={perm.id}
                              onClick={() => handleToggleSinglePermission(perm.id)}
                              className="px-2 py-1.5 rounded-lg flex items-center justify-between gap-2 hover:bg-white dark:hover:bg-slate-800 cursor-pointer select-none transition-colors"
                            >
                              <span
                                className={`text-xs ${
                                  isGranted
                                    ? "font-medium text-slate-900 dark:text-white"
                                    : "text-slate-500 dark:text-slate-400"
                                }`}
                              >
                                {perm.name}
                              </span>

                              {/* Mini Switch / Check */}
                              <div
                                className={`w-8 h-4.5 rounded-full p-0.5 transition-colors duration-150 ease-in-out shrink-0 flex items-center ${
                                  isGranted
                                    ? "bg-emerald-500 justify-end"
                                    : "bg-slate-300 dark:bg-slate-700 justify-start"
                                }`}
                              >
                                <div className="w-3.5 h-3.5 rounded-full bg-white shadow-xs" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              Lavozimni tanlang
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FULL SCREEN MODAL: CREATE / EDIT POSITION & MANAGE ALL PERMISSIONS        */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-hidden">
          {/* SINGLE CLEAN CONTAINER (FAZAT BITTA BLOK) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* MODAL HEADER */}
            <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: modalForm.color || "#6366f1" }}
                />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {modalMode === "create" ? "Yangi Lavozim Qo'shish" : "Lavozimni Tahrirlash"}
                </h2>
              </div>

              {/* Header Action Tools */}
              <div className="flex items-center gap-2">
                {/* Template Selector */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    <Sparkles size={14} className="text-amber-500" />
                    <span>Shablon</span>
                    <ChevronDown size={13} />
                  </button>

                  {showTemplateDropdown && (
                    <div className="absolute right-0 mt-1.5 w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-1.5 z-50 space-y-1">
                      {ROLE_TEMPLATES.map((tmpl, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleApplyTemplate(tmpl)}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors cursor-pointer text-xs font-medium text-slate-800 dark:text-slate-200"
                        >
                          {tmpl.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bulk Select All */}
                <button
                  type="button"
                  onClick={handleSelectAllPermsInModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  <CheckSquare size={14} />
                  <span>Barchasini Tanlash</span>
                </button>

                {/* Bulk Clear All */}
                <button
                  type="button"
                  onClick={handleClearAllPermsInModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 hover:bg-rose-100 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  <Square size={14} />
                  <span>Tozalash</span>
                </button>

                {/* Close Button */}
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* MODAL CONTROLS ROW (POSITION NAME, COLOR, PERMISSION SEARCH - ALL IN ONE CLEAN ROW) */}
            <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center bg-slate-50/40 dark:bg-slate-800/20 shrink-0">
              {/* Position Name */}
              <div className="sm:col-span-5 flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0">
                  Lavozim Nomi:
                </span>
                <input
                  type="text"
                  required
                  value={modalForm.name}
                  onChange={(e) => setModalForm({ ...modalForm, name: e.target.value })}
                  placeholder="Masalan: Filial Menejeri"
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Color dots */}
              <div className="sm:col-span-3 flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0">
                  Rang:
                </span>
                <div className="flex items-center gap-1.5">
                  {["#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setModalForm({ ...modalForm, color: c })}
                      className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                        modalForm.color === c ? "scale-110 border-slate-900 dark:border-white" : "border-transparent"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Fast Search */}
              <div className="sm:col-span-4 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="text"
                  value={modalPermSearch}
                  onChange={(e) => setModalPermSearch(e.target.value)}
                  placeholder="Ruxsatlarni qidirish..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* MODAL BODY: MULTI-COLUMN PERMISSIONS GRID (USTUNLAB CHIQARISH) */}
            <div className="flex-1 overflow-y-auto p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {PERMISSION_CATEGORIES.map((cat) => {
                  const categoryPermIds = cat.permissions.map((p) => p.id);
                  const activePermsCount = categoryPermIds.filter((id) =>
                    modalForm.permissions.includes(id)
                  ).length;
                  const isAllCategorySelected = activePermsCount === categoryPermIds.length;

                  const filteredModalPerms = cat.permissions.filter((p) => {
                    return p.name.toLowerCase().includes(modalPermSearch.toLowerCase());
                  });

                  if (filteredModalPerms.length === 0) return null;

                  return (
                    <div
                      key={cat.id}
                      className="border border-slate-100 dark:border-slate-800/80 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-800/30 space-y-2 flex flex-col justify-between"
                    >
                      <div>
                        {/* Category Header */}
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                            {cat.title}
                          </h4>

                          <button
                            type="button"
                            onClick={() => handleToggleCategoryInModal(categoryPermIds)}
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                              isAllCategorySelected
                                ? "bg-indigo-600 text-white"
                                : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300"
                            }`}
                          >
                            {isAllCategorySelected ? "Barchasi" : "Tanlash"}
                          </button>
                        </div>

                        {/* Permissions List */}
                        <div className="space-y-1 pt-1">
                          {filteredModalPerms.map((perm) => {
                            const isGranted = modalForm.permissions.includes(perm.id);

                            return (
                              <div
                                key={perm.id}
                                onClick={() => handleToggleSingleInModal(perm.id)}
                                className="px-2 py-1.5 rounded-lg flex items-center justify-between gap-2 hover:bg-white dark:hover:bg-slate-800 cursor-pointer select-none transition-colors"
                              >
                                <span
                                  className={`text-xs ${
                                    isGranted
                                      ? "font-medium text-slate-900 dark:text-white"
                                      : "text-slate-500 dark:text-slate-400"
                                  }`}
                                >
                                  {perm.name}
                                </span>

                                {/* Mini Switch */}
                                <div
                                  className={`w-8 h-4.5 rounded-full p-0.5 transition-colors duration-150 ease-in-out shrink-0 flex items-center ${
                                    isGranted
                                      ? "bg-indigo-600 justify-end"
                                      : "bg-slate-300 dark:bg-slate-700 justify-start"
                                  }`}
                                >
                                  <div className="w-3.5 h-3.5 rounded-full bg-white shadow-xs" />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/30 shrink-0">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Tanlangan ruxsatlar: <span className="text-indigo-600 dark:text-indigo-400">{modalForm.permissions.length}</span> ta
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
                >
                  Bekor Qilish
                </button>
                <button
                  type="button"
                  id="btn-modal-save-role"
                  onClick={handleSaveModal}
                  className="flex items-center gap-1.5 px-5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  <Check size={15} />
                  <span>Saqlash</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

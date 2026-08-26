import { useState, useMemo } from "react";
import {
  Plus,
  Users,
  Pencil,
  Settings,
  Trash2,
  ArrowLeft,
  Phone,
  Calendar,
  MapPin,
  Building2,
  DollarSign,
  Gift,
  Award,
  CheckCircle2,
  UserCheck,
  UserX,
  UserPlus,
  Clock,
  Eye,
  Search,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  RotateCcw,
  FileText,
  Briefcase,
  AlertCircle,
  Percent,
} from "lucide-react";
import { GLASS, BTN_ICON, PrimaryButton, INPUT_CLS } from "../theme/tokens";
import { Avatar, EmptyState } from "../components/primitives";
import { money, displayPhone, formatDate } from "../utils/helpers";
import { getManagerPerformanceStats } from "../utils/dataHelpers";
import { INITIAL_ROLES } from "./PositionsPage";
import {
  getStaffCustomFields,
  getStaffFormCompletionStatus,
} from "../utils/staffFormFields";
import { StaffCustomFormBuilderModal } from "../modals/StaffCustomFormBuilderModal";
import { ManagerFormModal } from "../modals/ManagerFormModal";

export function ManagersPage({
  director,
  directorData,
  opData,
  openModal = () => {},
  openManagerModal,
  openPermissionsModal,
  openPayrollModal,
  onDeleteManager,
  onSaveManager,
  scopeBranches = [],
}) {
  const [selectedManagerId, setSelectedManagerId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [formStatusFilter, setFormStatusFilter] = useState("all"); // 'all' | 'completed' | 'incomplete'
  const [activeDetailTab, setActiveDetailTab] = useState("profile"); // 'profile' | 'students' | 'payments'

  // Modals state
  const [showFormBuilderModal, setShowFormBuilderModal] = useState(false);
  const [localEditingManager, setLocalEditingManager] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Custom form fields from storage
  const [customFields, setCustomFields] = useState(() => getStaffCustomFields());

  const handleCustomFieldsSaved = (newFields) => {
    setCustomFields(newFields);
  };

  // Safe Modal Opener
  const safeOpenModal = (modalPayload) => {
    if (!modalPayload) return;
    if (modalPayload.type === "managerForm") {
      if (openManagerModal) {
        openManagerModal(modalPayload.editing || modalPayload.manager);
        return;
      }
      setLocalEditingManager(modalPayload.editing || modalPayload.manager || null);
      setShowAddModal(true);
      return;
    }
    if (modalPayload.type === "managerPermissions" && openPermissionsModal) {
      const mgr =
        modalPayload.manager ||
        (directorData?.managers || []).find((m) => m.id === modalPayload.managerId) ||
        selectedManager;
      openPermissionsModal(mgr);
      return;
    }
    if (modalPayload.type === "managerPayroll" && openPayrollModal) {
      const mgr =
        modalPayload.manager ||
        (directorData?.managers || []).find((m) => m.id === modalPayload.managerId) ||
        selectedManager;
      openPayrollModal(mgr);
      return;
    }
    if (
      modalPayload.type === "confirm" &&
      modalPayload.action?.kind === "deleteManager" &&
      onDeleteManager
    ) {
      onDeleteManager(modalPayload.action.managerId);
      return;
    }
    openModal(modalPayload);
  };

  // Branches
  const myBranches = useMemo(() => {
    if (scopeBranches && scopeBranches.length > 0) return scopeBranches;
    const all = directorData?.branches || [];
    if (director?.id) {
      return all.filter((b) => !b.directorId || b.directorId === director.id);
    }
    return all;
  }, [scopeBranches, directorData?.branches, director?.id]);

  const myBranchIds = useMemo(() => myBranches.map((b) => b.id), [myBranches]);

  // Roles list
  const availableRoles = useMemo(() => {
    try {
      const saved = localStorage.getItem("cosmos_custom_roles_v2");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_ROLES;
  }, []);

  // Managers/Staff list
  const managers = useMemo(() => {
    const all = directorData?.managers || [];
    if (!myBranchIds.length) return all;
    return all.filter(
      (m) =>
        (m.branchIds || []).some((id) => myBranchIds.includes(id)) ||
        (m.branchId && myBranchIds.includes(m.branchId))
    );
  }, [directorData?.managers, myBranchIds]);

  // Stats Calculations for Top Metric Cards
  const statsSummary = useMemo(() => {
    const totalCount = managers.length;
    let maleCount = 0;
    let femaleCount = 0;
    let totalSalaryFund = 0;
    let formCompletedCount = 0;
    let incompleteCount = 0;

    managers.forEach((m) => {
      // Gender calculation (default: male if unspecified, or alternate based on name/id)
      const gender = m.gender || (m.name?.endsWith("a") || m.name?.includes("qizi") ? "female" : "male");
      if (gender === "female") femaleCount++;
      else maleCount++;

      // Salary Fund calculation
      const salary = parseFloat(m.monthlySalary || m.salaryAmount || 0);
      totalSalaryFund += salary;

      // Custom form completion calculation
      const completion = getStaffFormCompletionStatus(m, customFields);
      if (completion.isCompleted) {
        formCompletedCount++;
      } else {
        incompleteCount++;
      }
    });

    const avgSalary = totalCount > 0 ? Math.round(totalSalaryFund / totalCount) : 0;
    const completionPercent = totalCount > 0 ? Math.round((formCompletedCount / totalCount) * 100) : 0;

    return {
      totalCount,
      maleCount,
      femaleCount,
      totalSalaryFund,
      avgSalary,
      formCompletedCount,
      incompleteCount,
      completionPercent,
    };
  }, [managers, customFields]);

  const selectedManager = managers.find((m) => m.id === selectedManagerId);

  if (selectedManagerId && !selectedManager) {
    setSelectedManagerId(null);
  }

  // Filtered managers for table
  const filteredManagers = useMemo(() => {
    return managers.filter((m) => {
      // Search query (name or phone or branch)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = m.name?.toLowerCase().includes(q);
        const phoneMatch = m.phone?.includes(q);
        const roleMatch = m.roleName?.toLowerCase().includes(q);
        if (!nameMatch && !phoneMatch && !roleMatch) return false;
      }

      // Role filter
      if (roleFilter !== "all") {
        const matchRole =
          m.roleId === roleFilter ||
          m.roleCode === roleFilter ||
          m.roleName?.toLowerCase().includes(roleFilter.toLowerCase());
        if (!matchRole) return false;
      }

      // Form status filter
      if (formStatusFilter !== "all") {
        const completion = getStaffFormCompletionStatus(m, customFields);
        if (formStatusFilter === "completed" && !completion.isCompleted) return false;
        if (formStatusFilter === "incomplete" && completion.isCompleted) return false;
      }

      return true;
    });
  }, [managers, searchQuery, roleFilter, formStatusFilter, customFields]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setRoleFilter("all");
    setFormStatusFilter("all");
  };

  const getSalaryTypeLabel = (m) => {
    const type = m.salaryType || "fixed";
    switch (type) {
      case "kpi":
        return {
          label: "KPI + Bonus",
          detail: `O'quvchi: ${money(m.kpiStudentAmount || 0)} so'm, 1 oy o'qiganlik: ${money(m.kpiContractBonus || 0)} so'm`,
          badgeClass: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800",
        };
      case "hourly":
        return { label: "Soatbay", detail: "", badgeClass: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400" };
      case "lesson":
        return { label: "Darsbay", detail: "", badgeClass: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400" };
      case "percent":
        return { label: "Foiz stavkasi", detail: "", badgeClass: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400" };
      default:
        return {
          label: "Oylik oklad (Fixed)",
          detail: "",
          badgeClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800",
        };
    }
  };

  /* ========================================================================= */
  /* DETAIL PROFILE VIEW FOR A SINGLE MANAGER/STAFF                            */
  /* ========================================================================= */
  if (selectedManager) {
    const stats = getManagerPerformanceStats(selectedManager, opData, directorData);
    const completion = getStaffFormCompletionStatus(selectedManager, customFields);
    const managerBranches = myBranches.filter((b) =>
      (selectedManager.branchIds || []).includes(b.id)
    );
    const salaryInfo = getSalaryTypeLabel(selectedManager);

    return (
      <div className="space-y-4">
        {/* Back navigation & Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedManagerId(null)}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="flex items-center gap-3">
              <Avatar name={selectedManager.name} size={44} />
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {selectedManager.name}
                  <span
                    className="text-[11px] font-bold px-2.5 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: selectedManager.roleColor || "#6366f1" }}
                  >
                    {selectedManager.roleName || "Xodim"}
                  </span>
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                  <span>{displayPhone(selectedManager.phone)}</span>
                  <span>•</span>
                  <span>{selectedManager.gender === "female" ? "👩 Ayol" : "👨 Erkak"}</span>
                  {selectedManager.birthDate && (
                    <>
                      <span>•</span>
                      <span>Tug'ilgan sana: {formatDate(selectedManager.birthDate)}</span>
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => safeOpenModal({ type: "managerPayroll", manager: selectedManager })}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <DollarSign size={14} /> Maosh to'lash
            </button>
            <button
              onClick={() => safeOpenModal({ type: "managerForm", editing: selectedManager })}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 hover:bg-slate-50 cursor-pointer"
            >
              <Pencil size={14} /> Tahrirlash
            </button>
            <button
              onClick={() =>
                safeOpenModal({
                  type: "confirm",
                  message: `${selectedManager.name}ni tizimdan o'chirasizmi?`,
                  action: { kind: "deleteManager", managerId: selectedManager.id },
                })
              }
              className="bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1 hover:bg-rose-100 cursor-pointer"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Profile Details Container - Flattened UI */}
        <div className={`${GLASS} rounded-xl p-5 space-y-4`}>
          {/* Top Quick Info Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Ish haqi va modeli</p>
              <p className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                {money(selectedManager.monthlySalary || selectedManager.salaryAmount || 0)} so'm
              </p>
              <div className="mt-1">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md inline-block ${salaryInfo.badgeClass}`}>
                  {salaryInfo.label}
                </span>
                {selectedManager.salaryType === "kpi" && (
                  <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium mt-1">
                    O'quvchiga: {money(selectedManager.kpiStudentAmount || 0)} so'm • 1 oy o'qiganlik: {money(selectedManager.kpiContractBonus || 0)} so'm
                  </p>
                )}
              </div>
            </div>

            <div>
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Ishlaydigan filiali</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                {managerBranches.map((b) => b.name).join(", ") || "Filialsiz"}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedManager.address || "Manzil kiritilmagan"}
              </p>
            </div>

            <div>
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Qo'shimcha forma holati</p>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 ${
                    completion.isCompleted
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : completion.hasSomeData
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <Sparkles size={13} />
                  {completion.isCompleted
                    ? "To'liq to'ldirilgan"
                    : `${completion.filledCount}/${completion.totalCount} maydon to'ldirilgan`}
                </span>
              </div>
            </div>
          </div>

          {/* Custom Form Fields Grid (Xodim formasi ma'lumotlari) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles size={14} className="text-indigo-600" />
                Xodim Formasi (Qo'shimcha ma'lumotlar)
              </h3>
              <button
                onClick={() => safeOpenModal({ type: "managerForm", editing: selectedManager })}
                className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
              >
                Ma'lumotlarni to'ldirish / o'zgartirish
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {customFields.map((field) => {
                const val = selectedManager.customFormData?.[field.id];
                return (
                  <div
                    key={field.id}
                    className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80"
                  >
                    <p className="text-[11px] font-semibold text-slate-400">{field.label}</p>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 truncate">
                      {val ? String(val) : <span className="text-slate-400 font-normal italic">Kiritilmagan</span>}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Izoh / Notes agar mavjud bo'lsa */}
          {selectedManager.notes && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <p className="text-[11px] font-semibold text-slate-400">Izoh va eslatma:</p>
              <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 bg-slate-50 dark:bg-slate-800/30 p-2.5 rounded-xl">
                {selectedManager.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ========================================================================= */
  /* MAIN OVERVIEW: 4 METRIC CARDS + ONE MAIN TABLE CONTAINER                  */
  /* ========================================================================= */
  return (
    <div className="space-y-4">
      {/* Top Header Row */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Users size={20} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Xodimlar
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                {managers.length} ta
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Markaz xodimlari, ularning lavozimlari, maosh fondi va maxsus formalar boshqaruvi
            </p>
          </div>
        </div>

        {/* Top Header Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFormBuilderModal(true)}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Sparkles size={15} className="text-indigo-600 dark:text-indigo-400" />
            Xodim formasi
          </button>

          <PrimaryButton onClick={() => safeOpenModal({ type: "managerForm" })}>
            <Plus size={16} /> Xodim qo'shish
          </PrimaryButton>
        </div>
      </div>

      {/* 4 TOP METRIC CARDS (Har bir card uchun bitta toza blok) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Jami xodim (pastida nechta ayol va erkak) */}
        <div className={`${GLASS} rounded-xl p-4 transition-all hover:shadow-md border-l-4 border-l-indigo-500`}>
          <div className="flex items-center justify-between">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold">
              Jami xodimlar
            </p>
            <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Users size={16} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1.5">
            {statsSummary.totalCount}{" "}
            <span className="text-xs font-normal text-slate-500">ta xodim</span>
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
            <span>👨 {statsSummary.maleCount} ta erkak</span>
            <span>•</span>
            <span>👩 {statsSummary.femaleCount} ta ayol</span>
          </p>
        </div>

        {/* Card 2: Ish haqi fondi jami (pastida spanda o'rtacha) */}
        <div className={`${GLASS} rounded-xl p-4 transition-all hover:shadow-md border-l-4 border-l-emerald-500`}>
          <div className="flex items-center justify-between">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold">
              Ish haqi fondi jami
            </p>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
              <DollarSign size={16} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-1.5">
            {money(statsSummary.totalSalaryFund)}{" "}
            <span className="text-xs font-normal text-slate-500">so'm</span>
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              O'rtacha: {money(statsSummary.avgSalary)} so'm
            </span>
          </p>
        </div>

        {/* Card 3: Formasi bor (Qo'shimcha ma'lumot kiritilgan) */}
        <div
          onClick={() => setFormStatusFilter(formStatusFilter === "completed" ? "all" : "completed")}
          className={`${GLASS} rounded-xl p-4 transition-all hover:shadow-md border-l-4 border-l-sky-500 cursor-pointer ${
            formStatusFilter === "completed" ? "ring-2 ring-sky-400 bg-sky-50/20" : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold">
              Formasi to'ldirilgan
            </p>
            <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 flex items-center justify-center font-bold">
              <Sparkles size={16} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-sky-700 dark:text-sky-400 mt-1.5">
            {statsSummary.formCompletedCount}{" "}
            <span className="text-xs font-normal text-slate-500">ta xodim</span>
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            To'liq ma'lumot kiritilgan ({statsSummary.completionPercent}%)
          </p>
        </div>

        {/* Card 4: Ma'lumoti to'liq emas (Ixtiyoriy inputlarga ma'lumoti kiritilmagan) */}
        <div
          onClick={() => setFormStatusFilter(formStatusFilter === "incomplete" ? "all" : "incomplete")}
          className={`${GLASS} rounded-xl p-4 transition-all hover:shadow-md border-l-4 border-l-amber-500 cursor-pointer ${
            formStatusFilter === "incomplete" ? "ring-2 ring-amber-400 bg-amber-50/20" : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold">
              Ma'lumoti to'liq emas
            </p>
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
              <AlertCircle size={16} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-amber-700 dark:text-amber-400 mt-1.5">
            {statsSummary.incompleteCount}{" "}
            <span className="text-xs font-normal text-slate-500">ta xodim</span>
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Qo'shimcha formasi to'ldirilmagan
          </p>
        </div>
      </div>

      {/* ONE MAIN BLOCK FOR TABLE & FILTERS (Flattened UI) */}
      <div className={`${GLASS} rounded-xl overflow-hidden`}>
        {/* Unified Filter Bar Header */}
        <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2.5">
          <div className="flex items-center flex-wrap gap-2 flex-1 min-w-[280px]">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ism, telefon yoki lavozim orqali qidirish..."
                className={`${INPUT_CLS} !pl-9 pr-3 py-1.5 text-xs`}
              />
            </div>

            {/* Role Filter Dropdown */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-xl px-3 py-1.5 font-medium outline-none"
            >
              <option value="all">Barcha lavozimlar</option>
              {availableRoles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>

            {/* Form status filter */}
            <select
              value={formStatusFilter}
              onChange={(e) => setFormStatusFilter(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-xl px-3 py-1.5 font-medium outline-none"
            >
              <option value="all">Barcha formalar</option>
              <option value="completed">Formasi to'ldirilgan</option>
              <option value="incomplete">Ma'lumoti to'liq emas</option>
            </select>

            {/* Reset Filters */}
            {(searchQuery || roleFilter !== "all" || formStatusFilter !== "all") && (
              <button
                onClick={handleResetFilters}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Filtrlarni tozalash"
              >
                <RotateCcw size={13} /> Tozalash
              </button>
            )}
          </div>

          <div className="text-xs text-slate-400 font-medium">
            Jami: <strong className="text-slate-700 dark:text-slate-300">{filteredManagers.length}</strong> ta xodim
          </div>
        </div>

        {/* Table Content */}
        {filteredManagers.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Users}
              title="Xodimlar topilmadi"
              subtitle="Qidiruv bo'yicha hech qanday xodim topilmadi yoki filtrlar to'g'ri kelmadi."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200/80 dark:border-slate-800">
                <tr>
                  <th className="p-3.5 w-12 text-center">№</th>
                  <th className="p-3.5">Xodim</th>
                  <th className="p-3.5">Lavozimi</th>
                  <th className="p-3.5">Ish haqi</th>
                  <th className="p-3.5">Formasi</th>
                  <th className="p-3.5">Qo'shimcha ma'lumotlar</th>
                  <th className="p-3.5 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-800 dark:text-slate-200 font-medium">
                {filteredManagers.map((m, index) => {
                  const branches = myBranches.filter((b) =>
                    (m.branchIds || []).includes(b.id)
                  );
                  const salaryInfo = getSalaryTypeLabel(m);
                  const completion = getStaffFormCompletionStatus(m, customFields);

                  return (
                    <tr
                      key={m.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* № */}
                      <td className="p-3.5 text-center text-slate-400 font-mono text-[11px]">
                        {index + 1}
                      </td>

                      {/* Xodim */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={m.name} size={34} />
                          <div>
                            <span
                              onClick={() => setSelectedManagerId(m.id)}
                              className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors block"
                            >
                              {m.name}
                            </span>
                            <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                              <Phone size={11} className="text-slate-400" />
                              {displayPhone(m.phone)}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Lavozimi */}
                      <td className="p-3.5">
                        <span
                          className="text-[11px] font-bold px-2.5 py-0.5 rounded-full text-white inline-flex items-center gap-1"
                          style={{ backgroundColor: m.roleColor || "#6366f1" }}
                        >
                          <Briefcase size={10} />
                          {m.roleName || "Xodim"}
                        </span>
                      </td>

                      {/* Ish haqi */}
                      <td className="p-3.5">
                        <div>
                          <p className="font-extrabold text-slate-900 dark:text-white">
                            {money(m.monthlySalary || m.salaryAmount || 0)} so'm
                          </p>
                          <span className={`text-[10px] font-bold px-2 py-0.2 rounded mt-0.5 inline-block ${salaryInfo.badgeClass}`}>
                            {salaryInfo.label}
                          </span>
                        </div>
                      </td>

                      {/* Formasi */}
                      <td className="p-3.5">
                        {completion.isCompleted ? (
                          <span className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 font-bold px-2.5 py-0.5 rounded-lg text-[11px] inline-flex items-center gap-1">
                            <CheckCircle2 size={12} className="text-emerald-600" />
                            To'ldirilgan
                          </span>
                        ) : completion.hasSomeData ? (
                          <span className="bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-400 font-bold px-2.5 py-0.5 rounded-lg text-[11px] inline-flex items-center gap-1">
                            <Clock size={12} className="text-amber-600" />
                            Qisman ({completion.filledCount}/{completion.totalCount})
                          </span>
                        ) : (
                          <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium px-2.5 py-0.5 rounded-lg text-[11px]">
                            To'ldirilmagan
                          </span>
                        )}
                      </td>

                      {/* Qo'shimcha ma'lumotlar */}
                      <td className="p-3.5 max-w-xs">
                        <div className="space-y-0.5">
                          <p className="text-[11px] text-slate-700 dark:text-slate-300 flex items-center gap-1">
                            <Building2 size={11} className="text-slate-400 shrink-0" />
                            <span className="truncate">
                              {branches.map((b) => b.name).join(", ") || "Filialsiz"}
                            </span>
                          </p>
                          {m.birthDate && (
                            <p className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Calendar size={10} />
                              {formatDate(m.birthDate)}
                            </p>
                          )}
                          {m.notes && (
                            <p className="text-[10px] text-slate-500 truncate" title={m.notes}>
                              Izoh: {m.notes}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Amallar */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedManagerId(m.id)}
                            className={BTN_ICON}
                            title="Batafsil ko'rish"
                          >
                            <Eye size={15} className="text-indigo-600" />
                          </button>
                          <button
                            onClick={() => safeOpenModal({ type: "managerPayroll", manager: m })}
                            className={BTN_ICON}
                            title="Maosh to'lash"
                          >
                            <DollarSign size={15} className="text-emerald-600" />
                          </button>
                          <button
                            onClick={() => safeOpenModal({ type: "managerForm", editing: m })}
                            className={BTN_ICON}
                            title="Tahrirlash va Formani to'ldirish"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => safeOpenModal({ type: "managerPermissions", manager: m })}
                            className={BTN_ICON}
                            title="Ruxsatnomalar"
                          >
                            <Settings size={15} />
                          </button>
                          <button
                            onClick={() =>
                              safeOpenModal({
                                type: "confirm",
                                message: `${m.name}ni o'chirasizmi?`,
                                action: { kind: "deleteManager", managerId: m.id },
                              })
                            }
                            className={BTN_ICON}
                            title="O'chirish"
                          >
                            <Trash2 size={15} className="text-rose-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Staff Custom Form Builder Modal */}
      {showFormBuilderModal && (
        <StaffCustomFormBuilderModal
          onClose={() => setShowFormBuilderModal(false)}
          onSave={handleCustomFieldsSaved}
        />
      )}

      {/* Local Staff Form Modal if not triggered via global modal */}
      {showAddModal && (
        <ManagerFormModal
          editing={localEditingManager}
          branches={myBranches}
          onSubmit={async (payload) => {
            if (onSaveManager) {
              await onSaveManager(payload);
            }
            setShowAddModal(false);
            setLocalEditingManager(null);
          }}
          onClose={() => {
            setShowAddModal(false);
            setLocalEditingManager(null);
          }}
        />
      )}
    </div>
  );
}

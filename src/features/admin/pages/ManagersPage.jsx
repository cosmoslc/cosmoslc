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
  CreditCard,
  Banknote,
  Receipt,
  Wallet,
} from "lucide-react";
import { GLASS, BTN_ICON, PrimaryButton, INPUT_CLS } from "../theme/tokens";
import { Avatar, EmptyState, Modal } from "../components/primitives";
import { money, displayPhone, formatDate, formatMoneyInput, parseMoneyInput } from "../utils/helpers";
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
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [balanceInput, setBalanceInput] = useState("");
  const [balanceNote, setBalanceNote] = useState("");

  // Custom form fields from storage
  const [customFields, setCustomFields] = useState(() => getStaffCustomFields());

  const handleCustomFieldsSaved = (newFields) => {
    setCustomFields(newFields);
  };

  const handleSaveBalance = async () => {
    if (!selectedManager) return;
    const newBal = parseMoneyInput(balanceInput, true);
    if (typeof newBal !== "number" || isNaN(newBal)) return;
    const updated = {
      ...selectedManager,
      balance: newBal,
    };
    if (onSaveManager) {
      await onSaveManager(updated);
    }
    setShowBalanceModal(false);
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
    let fixedStaffCount = 0;
    let kpiStaffCount = 0;
    let totalFixedFund = 0;
    let totalKpiFund = 0;
    let totalKpiStudents = 0;
    let totalOneMonthBonusStudents = 0;
    let formCompletedCount = 0;
    let incompleteCount = 0;

    managers.forEach((m) => {
      // Gender calculation
      const gender = m.gender || (m.name?.endsWith("a") || m.name?.includes("qizi") ? "female" : "male");
      if (gender === "female") femaleCount++;
      else maleCount++;

      const isKpi = m.salaryType === "kpi";
      if (isKpi) {
        kpiStaffCount++;
        const perf = getManagerPerformanceStats(m, opData, directorData);
        const kpiPay = perf?.expectedPay || 0;
        totalKpiFund += kpiPay;
        totalKpiStudents += (perf?.totalBrought || 0);
        totalOneMonthBonusStudents += (perf?.oneMonthStudentsCount || 0);
      } else {
        fixedStaffCount++;
        const fixedSalary = parseFloat(m.monthlySalary || m.salaryAmount || 0);
        totalFixedFund += fixedSalary;
      }

      // Custom form completion calculation
      const completion = getStaffFormCompletionStatus(m, customFields);
      if (completion.isCompleted) {
        formCompletedCount++;
      } else {
        incompleteCount++;
      }
    });

    const totalSalaryFund = totalFixedFund + totalKpiFund;
    const avgSalary = totalCount > 0 ? Math.round(totalSalaryFund / totalCount) : 0;
    const completionPercent = totalCount > 0 ? Math.round((formCompletedCount / totalCount) * 100) : 0;

    return {
      totalCount,
      maleCount,
      femaleCount,
      fixedStaffCount,
      kpiStaffCount,
      totalFixedFund,
      totalKpiFund,
      totalKpiStudents,
      totalOneMonthBonusStudents,
      totalSalaryFund,
      avgSalary,
      formCompletedCount,
      incompleteCount,
      completionPercent,
    };
  }, [managers, customFields, opData, directorData]);

  const selectedManager = managers.find((m) => m.id === selectedManagerId);

  if (selectedManagerId && !selectedManager) {
    setSelectedManagerId(null);
  }

  const getManagerRolesList = (m) => {
    if (Array.isArray(m?.roleIds) && m.roleIds.length > 0) {
      return m.roleIds.map((id, index) => {
        const found = availableRoles.find((r) => r.id === id);
        return {
          id,
          name: found?.name || m.roleNames?.[index] || "Xodim",
          color: found?.color || m.roleColors?.[index] || "#6366f1",
        };
      });
    }
    return [
      {
        id: m?.roleId || "role-admin",
        name: m?.roleName || "Xodim",
        color: m?.roleColor || "#6366f1",
      },
    ];
  };

  // Filtered managers for table
  const filteredManagers = useMemo(() => {
    return managers.filter((m) => {
      const roleList = getManagerRolesList(m);

      // Search query (name or phone or branch or role)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = m.name?.toLowerCase().includes(q);
        const phoneMatch = m.phone?.includes(q);
        const roleMatch =
          m.roleName?.toLowerCase().includes(q) ||
          roleList.some((r) => r.name?.toLowerCase().includes(q));
        if (!nameMatch && !phoneMatch && !roleMatch) return false;
      }

      // Role filter
      if (roleFilter !== "all") {
        const matchRole =
          m.roleId === roleFilter ||
          (Array.isArray(m.roleIds) && m.roleIds.includes(roleFilter)) ||
          m.roleCode === roleFilter ||
          (Array.isArray(m.roleCodes) && m.roleCodes.includes(roleFilter)) ||
          roleList.some(
            (r) =>
              r.id === roleFilter ||
              r.name?.toLowerCase().includes(roleFilter.toLowerCase())
          );
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
  }, [managers, searchQuery, roleFilter, formStatusFilter, customFields, availableRoles]);

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

    // Payments for this manager
    const managerPayments = (directorData?.managerPayments || [])
      .filter((p) => String(p.managerId) === String(selectedManager.id))
      .sort(
        (a, b) =>
          new Date(b.date || b.createdAt || 0) -
          new Date(a.date || a.createdAt || 0)
      );

    const totalPaidAmount = managerPayments.reduce(
      (sum, p) => sum + (Number(p.amount) || 0),
      0
    );

    const managerBalance =
      selectedManager.balance !== undefined
        ? Number(selectedManager.balance)
        : stats?.remaining ?? 0;

    const expectedSalary =
      selectedManager.salaryType === "kpi"
        ? stats?.expectedPay || 0
        : selectedManager.monthlySalary || selectedManager.salaryAmount || 0;

    return (
      <div className="space-y-4">
        {/* 1. FIRST HEAD: Natural, without block/heavy outer card */}
        <div className="flex items-center justify-between flex-wrap gap-3.5 pt-0.5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedManagerId(null)}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer"
              title="Orqaga qaytish"
            >
              <ArrowLeft size={17} />
            </button>
            <Avatar name={selectedManager.name} size={46} />
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex flex-wrap items-center gap-2">
                <span>{selectedManager.name}</span>
                <div className="flex flex-wrap gap-1.5 items-center">
                  {getManagerRolesList(selectedManager).map((roleItem, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-bold px-2 py-0.5 rounded-full text-white inline-flex items-center gap-1 shadow-2xs"
                      style={{ backgroundColor: roleItem.color || "#6366f1" }}
                    >
                      <Briefcase size={10} />
                      {roleItem.name}
                    </span>
                  ))}
                </div>
              </h2>

              <p className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-2 mt-0.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {displayPhone(selectedManager.phone)}
                </span>
                <span>•</span>
                <span>
                  {managerBranches.map((b) => b.name).join(", ") || "Barcha filiallar"}
                </span>
                <span>•</span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${salaryInfo.badgeClass}`}>
                  {salaryInfo.label}
                </span>
              </p>
            </div>
          </div>

          {/* Top Right Actions */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={() => {
                setBalanceInput(formatMoneyInput(managerBalance, true));
                setBalanceNote("");
                setShowBalanceModal(true);
              }}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <Wallet size={14} className="text-indigo-600 dark:text-indigo-400" />
              Balans tahrirlash
            </button>

            <button
              onClick={() => safeOpenModal({ type: "managerPayroll", manager: selectedManager })}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <DollarSign size={14} />
              Maosh to'lash
            </button>

            <button
              onClick={() => safeOpenModal({ type: "managerForm", editing: selectedManager })}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer"
              title="Tahrirlash"
            >
              <Pencil size={14} />
            </button>

            <button
              onClick={() =>
                safeOpenModal({
                  type: "confirm",
                  message: `${selectedManager.name}ni tizimdan o'chirasizmi?`,
                  action: { kind: "deleteManager", managerId: selectedManager.id },
                })
              }
              className="bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 font-bold text-xs p-2 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors shadow-2xs cursor-pointer"
              title="O'chirish"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* 2. PASDA CARDS: Balansi, Ish haqi, To'lovlar tarixi */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Card 1: Balansi */}
          <div className={`${GLASS} rounded-2xl p-4 sm:p-4.5 transition-all`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Balansi
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Wallet size={15} />
              </div>
            </div>
            <p
              className={`text-xl sm:text-2xl font-extrabold tracking-tight mt-1.5 ${
                managerBalance >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {money(managerBalance)}{" "}
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                so'm
              </span>
            </p>
            <div className="flex items-center justify-between mt-1 text-xs text-slate-500 dark:text-slate-400">
              <span className="text-[11px]">{managerBalance >= 0 ? "Haqdorlik (Qoldiq)" : "Qarzdorlik (Avans)"}</span>
              <button
                onClick={() => {
                  setBalanceInput(String(managerBalance));
                  setBalanceNote("");
                  setShowBalanceModal(true);
                }}
                className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Tahrirlash
              </button>
            </div>
          </div>

          {/* Card 2: Ish haqi */}
          <div className={`${GLASS} rounded-2xl p-4 sm:p-4.5 transition-all`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Ish haqi
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <DollarSign size={15} />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1.5">
              {money(expectedSalary)}{" "}
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                so'm
              </span>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
              {salaryInfo.label}
              {selectedManager.salaryType === "kpi" && (
                <span className="ml-1 text-indigo-600 dark:text-indigo-400 font-semibold">
                  ({stats?.totalBrought || 0} ta)
                </span>
              )}
            </p>
          </div>

          {/* Card 3: To'lovlar tarixi (Count + Jami summa) */}
          <div className={`${GLASS} rounded-2xl p-4 sm:p-4.5 transition-all`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                To'lovlar tarixi
              </span>
              <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/70 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <Receipt size={15} />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-extrabold tracking-tight text-sky-600 dark:text-sky-400 mt-1.5">
              {money(totalPaidAmount)}{" "}
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                so'm
              </span>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Jami <span className="font-bold text-slate-700 dark:text-slate-300">{managerPayments.length} ta</span> to'lov
            </p>
          </div>
        </div>

        {/* 3. BELOW CARDS: 2-COLUMN LAYOUT (Left: Asosiy ma'lumotlar, Right: To'lovlar tarixi) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
          {/* LEFT SIDE: Asosiy ma'lumotlar */}
          <div className="lg:col-span-5 space-y-4">
            <div className={`${GLASS} rounded-2xl p-4 sm:p-5 space-y-2.5`}>
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <UserCheck size={15} className="text-indigo-600 dark:text-indigo-400" />
                  Asosiy ma'lumotlar
                </h3>
                <button
                  onClick={() => safeOpenModal({ type: "managerForm", editing: selectedManager })}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Pencil size={11} /> Tahrirlash
                </button>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {/* Telefon raqami */}
                <div className="py-2 flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    Telefon raqami
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {displayPhone(selectedManager.phone)}
                  </span>
                </div>

                {/* Ish haqi */}
                <div className="py-2 flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    Ish haqi (Maosh)
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {money(expectedSalary)} so'm
                  </span>
                </div>

                {/* Maosh turi */}
                <div className="py-2 flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    Maosh turi
                  </span>
                  <span className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${salaryInfo.badgeClass}`}>
                    {salaryInfo.label}
                  </span>
                </div>

                {/* Filiali */}
                <div className="py-2 flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    Filiali
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white text-right max-w-[200px] truncate">
                    {managerBranches.map((b) => b.name).join(", ") || "Filialsiz"}
                  </span>
                </div>

                {/* Tug'ilgan sana */}
                <div className="py-2 flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    Tug'ilgan sana
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {selectedManager.birthDate
                      ? formatDate(selectedManager.birthDate)
                      : "Kiritilmagan"}
                  </span>
                </div>

                {/* Jinsi */}
                <div className="py-2 flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    Jinsi
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {selectedManager.gender === "female" ? "Ayol" : "Erkak"}
                  </span>
                </div>

                {/* Yashash manzili */}
                {selectedManager.address && (
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">
                      Yashash manzili
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white text-right max-w-[200px] truncate">
                      {selectedManager.address}
                    </span>
                  </div>
                )}

                {/* Izoh */}
                <div className="py-2">
                  <span className="text-slate-500 dark:text-slate-400 font-medium block mb-1">
                    Izoh
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50/70 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                    {selectedManager.notes || "Izoh kiritilmagan"}
                  </p>
                </div>
              </div>
            </div>

            {/* Custom Form Fields (agar mavjud bo'lsa) */}
            {customFields.length > 0 && (
              <div className={`${GLASS} rounded-2xl p-4 sm:p-5 space-y-3`}>
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles size={13} className="text-indigo-600" />
                    Qo'shimcha ma'lumotlar
                  </h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      completion.isCompleted
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                        : "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                    }`}
                  >
                    {completion.filledCount}/{completion.totalCount} to'ldirilgan
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {customFields.map((field) => {
                    const val = selectedManager.customFormData?.[field.id];
                    return (
                      <div
                        key={field.id}
                        className="p-2.5 rounded-xl bg-slate-50/60 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/60"
                      >
                        <p className="text-[10px] font-semibold text-slate-400">
                          {field.label}
                        </p>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                          {val ? String(val) : <span className="text-slate-400 font-normal italic">Kiritilmagan</span>}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDE: To'lovlar tarixi (Table) */}
          <div className="lg:col-span-7 space-y-4">
            <div className={`${GLASS} rounded-2xl p-4 sm:p-5 space-y-3`}>
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Receipt size={15} className="text-sky-600 dark:text-sky-400" />
                  To'lovlar tarixi
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800">
                    {managerPayments.length} ta
                  </span>
                </h3>

                <button
                  onClick={() => safeOpenModal({ type: "managerPayroll", manager: selectedManager })}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={13} /> Maosh to'lash
                </button>
              </div>

              {managerPayments.length === 0 ? (
                <div className="py-10 text-center text-slate-400 dark:text-slate-500">
                  <Receipt size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-2 opacity-70" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    To'lovlar tarixi mavjud emas
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Ushbu xodimga hali to'lov amalga oshirilmagan
                  </p>
                  <button
                    onClick={() => safeOpenModal({ type: "managerPayroll", manager: selectedManager })}
                    className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-200 dark:border-emerald-800 cursor-pointer"
                  >
                    <DollarSign size={13} /> Birinchi to'lovni kiritish
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-[10px] uppercase tracking-wider font-semibold">
                        <th className="py-2.5 px-2.5">Summa</th>
                        <th className="py-2.5 px-2.5">Sana</th>
                        <th className="py-2.5 px-2.5">To'lov usuli</th>
                        <th className="py-2.5 px-2.5">Izoh</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {managerPayments.map((p, idx) => (
                        <tr
                          key={p.id || idx}
                          className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          {/* Narx */}
                          <td className="py-2.5 px-2.5">
                            <span className="font-extrabold text-slate-900 dark:text-white text-xs">
                              {money(p.amount)} so'm
                            </span>
                          </td>

                          {/* Sana */}
                          <td className="py-2.5 px-2.5 text-slate-600 dark:text-slate-300">
                            <span>{p.date || formatDate(p.createdAt)}</span>
                          </td>

                          {/* To'lov Usuli */}
                          <td className="py-2.5 px-2.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
                              {p.method === "card"
                                ? "💳 Karta"
                                : p.method === "bank"
                                ? "🏦 Bank"
                                : "💵 Naqd"}
                            </span>
                          </td>

                          {/* Izoh */}
                          <td className="py-2.5 px-2.5 text-slate-600 dark:text-slate-400 max-w-[180px]">
                            <span className="truncate block" title={p.note}>
                              {p.note || "—"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Balance Edit Modal for Single Manager View */}
        {showBalanceModal && (
          <Modal
            title={`${selectedManager.name} — Balansni tahrirlash`}
            onClose={() => setShowBalanceModal(false)}
          >
            <div className="space-y-4 text-slate-800 dark:text-slate-200">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-semibold">Xodim:</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {selectedManager.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 font-semibold">Joriy balans:</p>
                  <p className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                    {money(managerBalance)} so'm
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-900 dark:text-white block mb-1">
                  Yangi balans summasi (so'mda) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={balanceInput}
                    onChange={(e) => setBalanceInput(formatMoneyInput(e.target.value, true))}
                    placeholder="0"
                    className={`${INPUT_CLS} pr-14 text-sm font-semibold`}
                    autoFocus
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none">
                    so'm
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Musbat summa xodimning haqdorligini, manfiy summa qarzdorligini (avans) bildiradi.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-900 dark:text-white block mb-1">
                  Tahrirlash sababi / Izoh (ixtiyoriy)
                </label>
                <input
                  value={balanceNote}
                  onChange={(e) => setBalanceNote(e.target.value)}
                  placeholder="Masalan: Balansga tuzatish kiritish"
                  className={INPUT_CLS}
                />
              </div>

              <PrimaryButton onClick={handleSaveBalance} className="w-full">
                <CheckCircle2 size={16} /> Balansni saqlash
              </PrimaryButton>
            </div>
          </Modal>
        )}
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

      {/* 4 TOP METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Jami xodim */}
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
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 space-y-0.5">
            <p className="font-medium">👨 {statsSummary.maleCount} ta erkak • 👩 {statsSummary.femaleCount} ta ayol</p>
            <p className="text-[10px] text-slate-400 font-semibold">{statsSummary.fixedStaffCount} ta Fixed • {statsSummary.kpiStaffCount} ta KPI</p>
          </div>
        </div>

        {/* Card 2: Ish haqi fondi jami */}
        <div className={`${GLASS} rounded-xl p-4 transition-all hover:shadow-md border-l-4 border-l-emerald-500`}>
          <div className="flex items-center justify-between">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold">
              Ish haqi fondi (Jami)
            </p>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
              <DollarSign size={16} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-1.5">
            {money(statsSummary.totalSalaryFund)}{" "}
            <span className="text-xs font-normal text-slate-500">so'm</span>
          </p>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 space-y-0.5">
            <p className="font-semibold text-slate-700 dark:text-slate-300">
              Fixed oklad fondi: {money(statsSummary.totalFixedFund)} so'm
            </p>
            <p className="text-[10px] text-slate-400">O'rtacha: {money(statsSummary.avgSalary)} so'm</p>
          </div>
        </div>

        {/* Card 3: KPI + Bonus fondi (Shu oygi hisoblangan) */}
        <div className={`${GLASS} rounded-xl p-4 transition-all hover:shadow-md border-l-4 border-l-purple-500`}>
          <div className="flex items-center justify-between">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold">
              KPI + Bonus fondi (Shu oy)
            </p>
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center font-bold">
              <Award size={16} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-purple-700 dark:text-purple-400 mt-1.5">
            {money(statsSummary.totalKpiFund)}{" "}
            <span className="text-xs font-normal text-slate-500">so'm</span>
          </p>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 space-y-0.5">
            <p className="font-semibold text-purple-700 dark:text-purple-300">
              🎯 {statsSummary.totalKpiStudents} ta o'quvchi • ⭐ {statsSummary.totalOneMonthBonusStudents} ta bonus
            </p>
            <p className="text-[10px] text-slate-400">O'quvchilar soniga qarab dinamik o'sadi</p>
          </div>
        </div>

        {/* Card 4: Formasi to'ldirilgan */}
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
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 space-y-0.5">
            <p className="font-medium text-slate-700 dark:text-slate-300">
              To'liq ma'lumot ({statsSummary.completionPercent}%)
            </p>
            <p className="text-[10px] text-amber-600 dark:text-amber-400">{statsSummary.incompleteCount} ta to'liq emas</p>
          </div>
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
                  const isKpi = m.salaryType === "kpi";
                  const perfStats = isKpi ? getManagerPerformanceStats(m, opData, directorData) : null;
                  const displaySalary = isKpi
                    ? perfStats?.expectedPay || 0
                    : parseFloat(m.monthlySalary || m.salaryAmount || 0);

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
                        <div className="flex flex-wrap gap-1 items-center max-w-[220px]">
                          {getManagerRolesList(m).map((roleItem, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white inline-flex items-center gap-1 shadow-2xs whitespace-nowrap"
                              style={{ backgroundColor: roleItem.color || "#6366f1" }}
                            >
                              <Briefcase size={9} />
                              {roleItem.name}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Ish haqi */}
                      <td className="p-3.5">
                        <div>
                          <p className="font-extrabold text-slate-900 dark:text-white">
                            {money(displaySalary)} so'm
                          </p>
                          {isKpi ? (
                            <div className="mt-0.5 space-y-0.5">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded inline-block ${salaryInfo.badgeClass}`}>
                                KPI + Bonus (Shu oy)
                              </span>
                              <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                                🎯 {perfStats?.totalBrought || 0} ta o'quvchi • ⭐ {perfStats?.oneMonthStudentsCount || 0} ta bonus
                              </p>
                            </div>
                          ) : (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded mt-0.5 inline-block ${salaryInfo.badgeClass}`}>
                              {salaryInfo.label}
                            </span>
                          )}
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

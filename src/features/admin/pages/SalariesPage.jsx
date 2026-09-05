import { useState, useMemo, useEffect, useRef } from "react";
import {
  Banknote,
  Search,
  Plus,
  Calendar,
  Filter,
  RotateCcw,
  Printer,
  Edit2,
  Trash2,
  MoreVertical,
  User,
  Users,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  CreditCard,
  DollarSign,
  Briefcase,
  CheckCircle2,
  X,
  FileText,
  Clock,
  ArrowRight,
} from "lucide-react";
import {
  GLASS,
  GLASS_SOFT,
  INPUT_CLS,
  LABEL_CLS,
  PrimaryButton,
  SecondaryButton,
  BTN_GHOST,
  BTN_ICON,
} from "../theme/tokens";
import { money, todayISO, thisMonthKey, formatDate } from "../utils/helpers";
import { Avatar, ConfirmModal, Modal, MoneyInput } from "../components/primitives";
import * as api from "../../../shared/api";

const STORAGE_PAYMENT_TYPES_KEY = "cosmos_payment_methods_v1";

const DEFAULT_PAYMENT_METHODS = [
  { id: "pt_1", name: "Naqd pul" },
  { id: "pt_2", name: "Plastik karta (Uzcard / Humo)" },
  { id: "pt_3", name: "Click / Payme / Uzum" },
  { id: "pt_4", name: "Bank o'tkazmasi" },
];

export function SalariesPage({
  directorData = {},
  opData = {},
  openModal = () => {},
  openTeacherProfile,
  openManagerProfile,
  openTeacherPayroll,
  openManagerPayroll,
  goTo,
  onRefresh,
  addToast = () => {},
}) {
  // Main Tabs: 'list' (Ish haqi ro'yxati) | 'calc' (Maosh hisob-kitobi)
  const [activeTab, setActiveTab] = useState("list");

  // Load payment methods from directorData or localStorage
  const paymentMethods = useMemo(() => {
    if (directorData?.paymentTypes && Array.isArray(directorData.paymentTypes) && directorData.paymentTypes.length > 0) {
      return directorData.paymentTypes;
    }
    try {
      const saved = localStorage.getItem(STORAGE_PAYMENT_TYPES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_PAYMENT_METHODS;
  }, [directorData?.paymentTypes]);

  // Combine Teachers & Managers as Employees
  const allTeachers = useMemo(() => directorData?.teachersHR || [], [directorData?.teachersHR]);
  const allManagers = useMemo(() => directorData?.managers || [], [directorData?.managers]);

  const allEmployees = useMemo(() => {
    const list = [];
    allTeachers.forEach((t) => {
      list.push({
        id: t.id,
        rawId: t.id,
        name: t.name,
        phone: t.phone || "",
        role: "teacher",
        roleLabel: t.isAssistant ? "Assistent" : "O'qituvchi",
        subject: t.subject || t.specialty || "",
        photo: t.photo,
        salaryType: t.salaryType,
        revenueSharePercent: t.revenueSharePercent,
        raw: t,
      });
    });
    allManagers.forEach((m) => {
      list.push({
        id: m.id,
        rawId: m.id,
        name: m.name,
        phone: m.phone || "",
        role: "manager",
        roleLabel: "Menejer",
        subject: m.role || "Boshqaruv",
        photo: m.photo,
        salaryType: "fixed",
        raw: m,
      });
    });
    return list;
  }, [allTeachers, allManagers]);

  // Combine Teacher Payments and Manager Payments
  const teacherPayments = useMemo(() => directorData?.teacherPayments || [], [directorData?.teacherPayments]);
  const managerPayments = useMemo(() => directorData?.managerPayments || [], [directorData?.managerPayments]);

  const allSalaryRecords = useMemo(() => {
    const list = [];

    // Teacher Payments
    teacherPayments.forEach((tp) => {
      const teacher = allTeachers.find((t) => String(t.id) === String(tp.teacherHRId || tp.teacher_hr_id || tp.teacherId));
      list.push({
        id: tp.id || `tp-${Math.random()}`,
        employeeId: tp.teacherHRId || tp.teacher_hr_id || tp.teacherId,
        employeeName: teacher?.name || tp.teacherName || "O'qituvchi",
        employeePhone: teacher?.phone || "",
        employeeRole: "teacher",
        employeeRoleLabel: teacher?.isAssistant ? "Assistent" : "O'qituvchi",
        employeePhoto: teacher?.photo,
        amount: Number(tp.amount) || 0,
        date: tp.date || todayISO(),
        type: tp.type || "salary",
        typeLabel: tp.type === "advance" ? "Avans" : tp.type === "bonus" ? "Bonus" : "Oylik maosh",
        method: tp.method || "Naqd pul",
        note: tp.note || "",
        month: tp.month || thisMonthKey(),
        createdAt: tp.createdAt || tp.created_at || Date.now(),
        source: "teacher",
        raw: tp,
        employeeRaw: teacher,
      });
    });

    // Manager Payments
    managerPayments.forEach((mp) => {
      const manager = allManagers.find((m) => String(m.id) === String(mp.managerId || mp.manager_id));
      list.push({
        id: mp.id || `mp-${Math.random()}`,
        employeeId: mp.managerId || mp.manager_id,
        employeeName: manager?.name || mp.managerName || "Menejer",
        employeePhone: manager?.phone || "",
        employeeRole: "manager",
        employeeRoleLabel: "Menejer",
        employeePhoto: manager?.photo,
        amount: Number(mp.amount) || 0,
        date: mp.date || todayISO(),
        type: mp.type || "salary",
        typeLabel: mp.type === "advance" ? "Avans" : mp.type === "bonus" ? "Bonus" : "Oylik maosh",
        method: mp.method || "Naqd pul",
        note: mp.note || "",
        month: mp.month || thisMonthKey(),
        createdAt: mp.createdAt || mp.created_at || Date.now(),
        source: "manager",
        raw: mp,
        employeeRaw: manager,
      });
    });

    // Sort by date / creation descending
    return list.sort((a, b) => {
      if (b.date !== a.date) return b.date.localeCompare(a.date);
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
  }, [teacherPayments, managerPayments, allTeachers, allManagers]);

  // Filters state
  const [filterName, setFilterName] = useState("");
  const [filterPhone, setFilterPhone] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterSalaryType, setFilterSalaryType] = useState("all");

  // Pagination state (50 items per page limit)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterName, filterPhone, filterDateFrom, filterDateTo, filterSalaryType]);

  // Handle Reset Filters
  const handleResetFilters = () => {
    setFilterName("");
    setFilterPhone("");
    setFilterDateFrom("");
    setFilterDateTo("");
    setFilterSalaryType("all");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    Boolean(filterName.trim()) ||
    Boolean(filterPhone.trim()) ||
    Boolean(filterDateFrom) ||
    Boolean(filterDateTo) ||
    filterSalaryType !== "all";

  // Filtered List
  const filteredRecords = useMemo(() => {
    return allSalaryRecords.filter((rec) => {
      // Name filter
      if (filterName.trim()) {
        const q = filterName.toLowerCase().trim();
        const matchesName = rec.employeeName?.toLowerCase().includes(q);
        if (!matchesName) return false;
      }

      // Phone filter
      if (filterPhone.trim()) {
        const q = filterPhone.replace(/\D/g, "");
        const phoneClean = (rec.employeePhone || "").replace(/\D/g, "");
        if (!phoneClean.includes(q)) return false;
      }

      // Date from
      if (filterDateFrom && rec.date < filterDateFrom) {
        return false;
      }

      // Date to
      if (filterDateTo && rec.date > filterDateTo) {
        return false;
      }

      // Salary Type / Method filter
      if (filterSalaryType !== "all") {
        const matchType = rec.type === filterSalaryType || rec.typeLabel === filterSalaryType;
        const matchMethod = rec.method === filterSalaryType;
        if (!matchType && !matchMethod) return false;
      }

      return true;
    });
  }, [allSalaryRecords, filterName, filterPhone, filterDateFrom, filterDateTo, filterSalaryType]);

  // Paginated List (Up to 50 items)
  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  // Summary Metrics (Jami Card)
  const totalFilteredAmount = useMemo(() => {
    return filteredRecords.reduce((sum, r) => sum + (r.amount || 0), 0);
  }, [filteredRecords]);

  // Action Menu state for table rows
  const [openActionId, setOpenActionId] = useState(null);
  const actionMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target)) {
        setOpenActionId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Modal State: "Maosh berish" / "Ish haqi to'lash"
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [employeeSearchText, setEmployeeSearchText] = useState("");
  const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [paySalaryType, setPaySalaryType] = useState("Oylik maosh");
  const [payMethod, setPayMethod] = useState("Naqd pul");
  const [payDate, setPayDate] = useState(todayISO());
  const [payNote, setPayNote] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit record state
  const [editingRecord, setEditingRecord] = useState(null);

  // Delete modal state
  const [deletingRecord, setDeletingRecord] = useState(null);

  // Receipt Modal state (Chop etish)
  const [receiptRecord, setReceiptRecord] = useState(null);

  // Open add modal helper
  const handleOpenAddModal = (preselectedEmp = null) => {
    if (preselectedEmp) {
      setSelectedEmployeeId(preselectedEmp.id);
      setEmployeeSearchText(preselectedEmp.name);
    } else {
      setSelectedEmployeeId("");
      setEmployeeSearchText("");
    }
    setPayAmount("");
    setPaySalaryType("Oylik maosh");
    setPayMethod(paymentMethods[0]?.name || "Naqd pul");
    setPayDate(todayISO());
    setPayNote("");
    setFormError("");
    setIsEmployeeDropdownOpen(false);
    setIsAddModalOpen(true);
  };

  // Open employee profile
  const handleOpenEmployeeProfile = (recOrEmp) => {
    const emp = recOrEmp.employeeRaw || (recOrEmp.role ? recOrEmp : allEmployees.find((e) => String(e.id) === String(recOrEmp.employeeId || recOrEmp.id)));
    if (!emp) return;

    if (emp.role === "teacher" || recOrEmp.employeeRole === "teacher" || emp.isAssistant !== undefined) {
      if (openTeacherProfile) {
        openTeacherProfile(emp.raw || emp);
      } else if (openTeacherPayroll) {
        openTeacherPayroll(emp.raw || emp);
      } else if (openModal) {
        openModal({ type: "teacherPayroll", teacher: emp.raw || emp });
      } else if (goTo) {
        goTo("teachers");
      }
    } else {
      if (openManagerProfile) {
        openManagerProfile(emp.raw || emp);
      } else if (openManagerPayroll) {
        openManagerPayroll(emp.raw || emp);
      } else if (openModal) {
        openModal({ type: "managerPayroll", manager: emp.raw || emp });
      } else if (goTo) {
        goTo("managers");
      }
    }
  };

  // Handle Save Payment (Maosh berish)
  const handleSavePayment = async (e) => {
    e?.preventDefault();
    setFormError("");

    if (!selectedEmployeeId) {
      setFormError("Iltimos, xodimni tanlang");
      return;
    }

    const numAmount = parseFloat(payAmount);
    if (!numAmount || numAmount <= 0) {
      setFormError("Iltimos, to'g'ri to'lov summasini kiriting");
      return;
    }

    const selectedEmp = allEmployees.find((emp) => String(emp.id) === String(selectedEmployeeId));
    if (!selectedEmp) {
      setFormError("Tanlangan xodim topilmadi");
      return;
    }

    setIsSubmitting(true);
    try {
      const monthKey = payDate ? payDate.slice(0, 7) : thisMonthKey();

      if (editingRecord) {
        // Edit flow
        if (editingRecord.source === "teacher") {
          await api.updateTeacherPayment(editingRecord.id, {
            amount: numAmount,
            date: payDate,
            note: payNote.trim(),
            type: paySalaryType === "Avans" ? "advance" : paySalaryType === "Bonus" ? "bonus" : "salary",
            method: payMethod,
          });
        } else {
          await api.updateManagerPayment(editingRecord.id, {
            amount: numAmount,
            date: payDate,
            note: payNote.trim(),
            type: paySalaryType === "Avans" ? "advance" : paySalaryType === "Bonus" ? "bonus" : "salary",
            method: payMethod,
          });
        }
        addToast("Maosh to'lovi muvaffaqiyatli tahrirlandi", "success");
      } else {
        // Create flow
        if (selectedEmp.role === "teacher") {
          await api.addTeacherPayment({
            teacherHRId: selectedEmp.id,
            amount: numAmount,
            date: payDate,
            month: monthKey,
            note: payNote.trim(),
            type: paySalaryType === "Avans" ? "advance" : paySalaryType === "Bonus" ? "bonus" : "salary",
            method: payMethod,
          });
        } else {
          await api.addManagerPayment({
            managerId: selectedEmp.id,
            amount: numAmount,
            date: payDate,
            month: monthKey,
            note: payNote.trim(),
            type: paySalaryType === "Avans" ? "advance" : paySalaryType === "Bonus" ? "bonus" : "salary",
            method: payMethod,
          });
        }
        addToast("Ish haqi to'lovi muvaffaqiyatli qayd etildi", "success");
      }

      if (onRefresh) await onRefresh();
      setIsAddModalOpen(false);
      setEditingRecord(null);
    } catch (err) {
      console.error(err);
      setFormError("To'lovni saqlashda xatolik yuz berdi");
      addToast("Xatolik yuz berdi", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (rec) => {
    setEditingRecord(rec);
    setSelectedEmployeeId(rec.employeeId);
    setEmployeeSearchText(rec.employeeName);
    setPayAmount(String(rec.amount || ""));
    setPaySalaryType(rec.typeLabel || "Oylik maosh");
    setPayMethod(rec.method || "Naqd pul");
    setPayDate(rec.date || todayISO());
    setPayNote(rec.note || "");
    setFormError("");
    setIsEmployeeDropdownOpen(false);
    setIsAddModalOpen(true);
    setOpenActionId(null);
  };

  // Handle Delete Payment
  const handleConfirmDelete = async () => {
    if (!deletingRecord) return;
    try {
      if (deletingRecord.source === "teacher") {
        await api.deleteTeacherPayment(deletingRecord.id);
      } else {
        await api.deleteManagerPayment(deletingRecord.id);
      }
      addToast("Maosh to'lovi o'chirildi", "info");
      if (onRefresh) await onRefresh();
      setDeletingRecord(null);
    } catch (e) {
      console.error(e);
      addToast("O'chirishda xatolik yuz berdi", "error");
    }
  };

  // Filtered employees for dropdown search
  const filteredEmployeesForSelect = useMemo(() => {
    if (!employeeSearchText.trim()) return allEmployees;
    const q = employeeSearchText.toLowerCase().trim();
    return allEmployees.filter(
      (emp) =>
        emp.name.toLowerCase().includes(q) ||
        emp.phone.includes(q) ||
        (emp.subject && emp.subject.toLowerCase().includes(q))
    );
  }, [allEmployees, employeeSearchText]);

  // Calculation Tab Data: Employee Balances
  const employeeBalances = useMemo(() => {
    return allEmployees.map((emp) => {
      const empPayments = allSalaryRecords.filter((r) => String(r.employeeId) === String(emp.id));
      const totalPaid = empPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const advances = empPayments.filter((p) => p.type === "advance").reduce((sum, p) => sum + (p.amount || 0), 0);
      const salaries = empPayments.filter((p) => p.type === "salary").reduce((sum, p) => sum + (p.amount || 0), 0);

      // Estimated expected pay
      let expectedPay = 0;
      if (emp.role === "teacher") {
        const t = emp.raw;
        if (t.fixedSalary) expectedPay = Number(t.fixedSalary);
        else if (t.salaryType === "fixed" && t.fixedAmount) expectedPay = Number(t.fixedAmount);
        else expectedPay = 8000000; // estimated standard teacher pool
      } else {
        const m = emp.raw;
        expectedPay = Number(m?.salary) || 5000000;
      }

      const diff = expectedPay - totalPaid;

      return {
        ...emp,
        totalPaid,
        advances,
        salaries,
        expectedPay,
        diff,
        paymentsCount: empPayments.length,
      };
    });
  }, [allEmployees, allSalaryRecords]);

  return (
    <div className="space-y-5">
      {/* Top Header & Two Navigation Menus */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Banknote className="text-emerald-600 dark:text-emerald-400" />
            Ish Haqi va Oylik Maoshlar
          </h1>
        </div>

        {/* Top Action Button: Maosh berish */}
        <div className="flex items-center gap-3">
          <PrimaryButton
            onClick={() => handleOpenAddModal()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-md cursor-pointer"
          >
            <Plus size={18} />
            Maosh berish
          </PrimaryButton>
        </div>
      </div>

      {/* Two Menus / Sub-tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("list")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "list"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          }`}
        >
          <FileText size={15} />
          Ish haqi ro'yxati
          <span
            className={`px-1.5 py-0.5 rounded-md text-[10px] ${
              activeTab === "list" ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
            }`}
          >
            {filteredRecords.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("calc")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "calc"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          }`}
        >
          <Briefcase size={15} />
          Maosh hisob-kitobi
          <span
            className={`px-1.5 py-0.5 rounded-md text-[10px] ${
              activeTab === "calc" ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
            }`}
          >
            {allEmployees.length}
          </span>
        </button>
      </div>

      {/* TAB 1: ISH HAQI RO'YXATI */}
      {activeTab === "list" && (
        <div className="space-y-4">
          {/* Summary KPI Card (Jami Card) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className={`${GLASS} p-4 rounded-2xl flex items-center justify-between`}>
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Jami To'langan Maosh
                </span>
                <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                  {money(totalFilteredAmount)} so'm
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <DollarSign size={24} />
              </div>
            </div>

            <div className={`${GLASS} p-4 rounded-2xl flex items-center justify-between`}>
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  To'lovlar Soni
                </span>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {filteredRecords.length} ta
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <FileText size={24} />
              </div>
            </div>

            <div className={`${GLASS} p-4 rounded-2xl flex items-center justify-between`}>
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  O'rtacha To'lov
                </span>
                <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
                  {filteredRecords.length > 0 ? money(Math.round(totalFilteredAmount / filteredRecords.length)) : 0} so'm
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <TrendingUp size={24} />
              </div>
            </div>
          </div>

          {/* Filters Bar: Ism, Raqam, Sanadan, Sanagacha, Maosh turi, Tozalash */}
          <div className={`${GLASS} p-3.5 rounded-2xl`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5 items-center">
              {/* 1. Ism */}
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Ism bo'yicha"
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  className={`${INPUT_CLS} pl-9 py-2 text-xs`}
                />
              </div>

              {/* 2. Raqam */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Telefon raqam"
                  value={filterPhone}
                  onChange={(e) => setFilterPhone(e.target.value)}
                  className={`${INPUT_CLS} py-2 text-xs`}
                />
              </div>

              {/* 3. Sanadan */}
              <div className="relative">
                <input
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                  className={`${INPUT_CLS} py-2 text-xs`}
                />
              </div>

              {/* 4. Sanagacha */}
              <div className="relative">
                <input
                  type="date"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                  className={`${INPUT_CLS} py-2 text-xs`}
                />
              </div>

              {/* 5. Maosh turi */}
              <div>
                <select
                  value={filterSalaryType}
                  onChange={(e) => setFilterSalaryType(e.target.value)}
                  className={`${INPUT_CLS} py-2 text-xs cursor-pointer`}
                >
                  <option value="all">Barcha turlar</option>
                  <option value="salary">Oylik maosh</option>
                  <option value="advance">Avans</option>
                  <option value="bonus">Bonus</option>
                  {paymentMethods.map((pm) => (
                    <option key={pm.id} value={pm.name}>
                      {pm.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 6. Tozalash Button */}
              <div>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  disabled={!hasActiveFilters}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    hasActiveFilters
                      ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  <RotateCcw size={13} />
                  Tozalash
                </button>
              </div>
            </div>
          </div>

          {/* Table: Tr, Hodim, Sana, Narx, To'lov usuli, Izoh, Amallar */}
          <div className={`${GLASS} rounded-2xl overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-3.5 w-12 text-center">Tr</th>
                    <th className="py-3 px-3.5">Hodim</th>
                    <th className="py-3 px-3.5">Sana</th>
                    <th className="py-3 px-3.5">Narx</th>
                    <th className="py-3 px-3.5">To'lov usuli</th>
                    <th className="py-3 px-3.5">Izoh</th>
                    <th className="py-3 px-3.5 text-right w-24">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {paginatedRecords.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <Banknote size={36} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                        To'lovlar tarixi topilmadi
                      </td>
                    </tr>
                  ) : (
                    paginatedRecords.map((rec, index) => {
                      const trIndex = (currentPage - 1) * pageSize + index + 1;
                      const isMenuOpen = openActionId === rec.id;

                      return (
                        <tr
                          key={rec.id}
                          className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          {/* Tr */}
                          <td className="py-3 px-3.5 text-center font-mono text-slate-400 font-semibold">
                            {trIndex}
                          </td>

                          {/* Hodim: Clicking opens employee profile */}
                          <td className="py-3 px-3.5">
                            <div className="flex items-center gap-2.5">
                              {rec.employeePhoto ? (
                                <img
                                  src={rec.employeePhoto}
                                  alt={rec.employeeName}
                                  className="w-8 h-8 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                                />
                              ) : (
                                <Avatar name={rec.employeeName} size={32} />
                              )}
                              <div>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEmployeeProfile(rec)}
                                  className="text-left font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors block cursor-pointer"
                                  title="Xodim profilini ochish"
                                >
                                  {rec.employeeName}
                                </button>
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                                  <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 font-medium">
                                    {rec.employeeRoleLabel}
                                  </span>
                                  {rec.employeePhone && (
                                    <span className="font-mono">{rec.employeePhone}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Sana */}
                          <td className="py-3 px-3.5 font-mono text-slate-600 dark:text-slate-300">
                            {rec.date}
                          </td>

                          {/* Narx */}
                          <td className="py-3 px-3.5 font-bold text-emerald-600 dark:text-emerald-400 text-[13px]">
                            {money(rec.amount)} so'm
                          </td>

                          {/* To'lov usuli */}
                          <td className="py-3 px-3.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                  rec.type === "advance"
                                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                                    : rec.type === "bonus"
                                    ? "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300"
                                    : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                                }`}
                              >
                                {rec.typeLabel}
                              </span>
                              {rec.method && (
                                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                  · {rec.method}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Izoh */}
                          <td className="py-3 px-3.5 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                            {rec.note || "—"}
                          </td>

                          {/* Amallar */}
                          <td className="py-3 px-3.5 text-right relative">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => setReceiptRecord(rec)}
                                title="Chek chop etish"
                                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                              >
                                <Printer size={15} />
                              </button>
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={() => setOpenActionId(isMenuOpen ? null : rec.id)}
                                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                                >
                                  <MoreVertical size={15} />
                                </button>

                                {isMenuOpen && (
                                  <div
                                    ref={actionMenuRef}
                                    className="absolute right-0 top-8 z-50 w-36 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 text-left"
                                  >
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEdit(rec)}
                                      className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                                    >
                                      <Edit2 size={13} className="text-blue-500" />
                                      Tahrirlash
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setDeletingRecord(rec);
                                        setOpenActionId(null);
                                      }}
                                      className="w-full px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 cursor-pointer"
                                    >
                                      <Trash2 size={13} />
                                      O'chirish
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls (50 tagacha ko'rinadi) */}
            {totalPages > 1 && (
              <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Jami {filteredRecords.length} ta yozuvdan {Math.min((currentPage - 1) * pageSize + 1, filteredRecords.length)}-
                  {Math.min(currentPage * pageSize, filteredRecords.length)} ko'rsatilmoqda
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`w-7 h-7 rounded-lg font-bold text-xs cursor-pointer ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MAOSH HISOBLASH VA BALANSLAR */}
      {activeTab === "calc" && (
        <div className="space-y-4">
          <div className={`${GLASS} rounded-2xl overflow-hidden`}>
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                Xodimlar va O'qituvchilar Maosh Hissasi
              </span>
              <span className="text-xs text-slate-500">{employeeBalances.length} nafar xodim</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 dark:bg-slate-900/60 text-slate-500 uppercase font-semibold text-[11px] border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="p-3.5">Xodim</th>
                    <th className="p-3.5">Lavozim / Fan</th>
                    <th className="p-3.5">Hisoblash Turi</th>
                    <th className="p-3.5">Hisoblangan Haq</th>
                    <th className="p-3.5">Avans Olgan</th>
                    <th className="p-3.5">Jami To'langan</th>
                    <th className="p-3.5 text-right">Qoldiq</th>
                    <th className="p-3.5 text-right w-28">Harakat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {employeeBalances.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="p-3.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEmployeeProfile(emp)}
                          className="text-left font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors block cursor-pointer"
                        >
                          {emp.name}
                        </button>
                        {emp.phone && <span className="text-[10px] text-slate-500 font-mono">{emp.phone}</span>}
                      </td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-400">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-medium text-[11px]">
                          {emp.subject || emp.roleLabel}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          {emp.salaryType === "percent"
                            ? `Foiz (${emp.revenueSharePercent || 50}%)`
                            : "Belgilangan maosh"}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                        {money(emp.expectedPay)} so'm
                      </td>
                      <td className="p-3.5 font-semibold text-amber-600 dark:text-amber-400">
                        {money(emp.advances)} so'm
                      </td>
                      <td className="p-3.5 font-semibold text-emerald-600 dark:text-emerald-400">
                        {money(emp.totalPaid)} so'm
                      </td>
                      <td className="p-3.5 text-right font-bold text-rose-600 dark:text-rose-400">
                        {money(emp.diff)} so'm
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenAddModal(emp)}
                          className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 font-bold text-xs transition-colors cursor-pointer"
                        >
                          To'lash
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: MAOSH BERISH / ISH HAQI TO'LASH */}
      {isAddModalOpen && (
        <Modal
          title={editingRecord ? "Maosh to'lovini tahrirlash" : "Maosh berish"}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingRecord(null);
          }}
        >
          <form onSubmit={handleSavePayment} className="space-y-4">
            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-2">
                <X size={15} />
                {formError}
              </div>
            )}

            {/* 1. Xodim tanlang (Searchable Dropdown) */}
            <div className="relative">
              <label className={LABEL_CLS}>Xodim tanlang</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Xodim ismini qidiring"
                  value={employeeSearchText}
                  onChange={(e) => {
                    setEmployeeSearchText(e.target.value);
                    setIsEmployeeDropdownOpen(true);
                    setSelectedEmployeeId("");
                  }}
                  onFocus={() => setIsEmployeeDropdownOpen(true)}
                  className={`${INPUT_CLS} pr-8`}
                />
                {selectedEmployeeId && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedEmployeeId("");
                      setEmployeeSearchText("");
                      setIsEmployeeDropdownOpen(true);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Employee search dropdown results */}
              {isEmployeeDropdownOpen && (
                <div className="absolute z-50 left-0 right-0 top-full mt-1 max-h-52 overflow-y-auto bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredEmployeesForSelect.length === 0 ? (
                    <div className="p-3 text-xs text-slate-400 text-center">Xodim topilmadi</div>
                  ) : (
                    filteredEmployeesForSelect.map((emp) => (
                      <button
                        key={emp.id}
                        type="button"
                        onClick={() => {
                          setSelectedEmployeeId(emp.id);
                          setEmployeeSearchText(emp.name);
                          setIsEmployeeDropdownOpen(false);
                        }}
                        className="w-full text-left p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center justify-between text-xs cursor-pointer transition-colors"
                      >
                        <div>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{emp.name}</span>
                          <span className="ml-2 px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-500">
                            {emp.roleLabel}
                          </span>
                        </div>
                        {emp.phone && <span className="font-mono text-slate-400 text-[11px]">{emp.phone}</span>}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* 2. Narx (Amount) */}
            <div>
              <label className={LABEL_CLS}>Narx</label>
              <MoneyInput
                value={payAmount}
                onChange={setPayAmount}
                placeholder="0"
                className={INPUT_CLS}
              />
            </div>

            {/* 3. Maosh turi & To'lov usuli (Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={LABEL_CLS}>Maosh turi</label>
                <select
                  value={paySalaryType}
                  onChange={(e) => setPaySalaryType(e.target.value)}
                  className={INPUT_CLS}
                >
                  <option value="Oylik maosh">Oylik maosh</option>
                  <option value="Avans">Avans</option>
                  <option value="Bonus">KPI / Bonus</option>
                  <option value="Mukofot">Mukofot</option>
                </select>
              </div>

              <div>
                <label className={LABEL_CLS}>To'lov usuli</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className={INPUT_CLS}
                >
                  {paymentMethods.map((pm) => (
                    <option key={pm.id} value={pm.name}>
                      {pm.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 4. Sana */}
            <div>
              <label className={LABEL_CLS}>Sana</label>
              <input
                type="date"
                value={payDate}
                onChange={(e) => setPayDate(e.target.value)}
                className={INPUT_CLS}
              />
            </div>

            {/* 5. Izoh */}
            <div>
              <label className={LABEL_CLS}>Izoh</label>
              <textarea
                rows={2}
                value={payNote}
                onChange={(e) => setPayNote(e.target.value)}
                placeholder="To'lov bo'yicha qo'shimcha izoh"
                className={INPUT_CLS}
              />
            </div>

            {/* Submit / Cancel Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <SecondaryButton
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingRecord(null);
                }}
              >
                Bekor qilish
              </SecondaryButton>
              <PrimaryButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saqlanmoqda..." : editingRecord ? "Saqlash" : "To'lovni tasdiqlash"}
              </PrimaryButton>
            </div>
          </form>
        </Modal>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deletingRecord && (
        <ConfirmModal
          title="To'lovni o'chirish"
          message={`${deletingRecord.employeeName} ga berilgan ${money(deletingRecord.amount)} so'mlik maosh to'lovini o'chirmoqchimisiz?`}
          confirmText="O'chirish"
          cancelText="Bekor qilish"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingRecord(null)}
        />
      )}

      {/* RECEIPT / PRINT MODAL */}
      {receiptRecord && (
        <Modal
          title="Kassa Chiqim Orderi (Chek)"
          onClose={() => setReceiptRecord(null)}
        >
          <div className="space-y-4">
            <div
              id="salary-receipt-print-area"
              className="p-5 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 font-mono text-xs space-y-3"
            >
              <div className="text-center pb-3 border-b border-dashed border-slate-300 dark:border-slate-700">
                <div className="font-bold text-sm tracking-wider uppercase">COSMOS LEARNING CENTER</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Xodimga maosh to'lovi cheki</div>
              </div>

              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Xodim:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{receiptRecord.employeeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Lavozimi:</span>
                  <span>{receiptRecord.employeeRoleLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Sana:</span>
                  <span>{receiptRecord.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">To'lov turi:</span>
                  <span>{receiptRecord.typeLabel} ({receiptRecord.method})</span>
                </div>
                {receiptRecord.note && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Izoh:</span>
                    <span>{receiptRecord.note}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-dashed border-slate-300 dark:border-slate-700 flex justify-between items-center text-sm font-bold">
                <span>JAMI SUMMA:</span>
                <span className="text-emerald-600 dark:text-emerald-400">{money(receiptRecord.amount)} UZS</span>
              </div>

              <div className="pt-3 text-[10px] text-center text-slate-400">
                To'lov tasdiqlangan · Kassa chiqim hujjati
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <SecondaryButton onClick={() => setReceiptRecord(null)}>
                Yopish
              </SecondaryButton>
              <PrimaryButton
                onClick={() => {
                  window.print();
                }}
                className="flex items-center gap-1.5"
              >
                <Printer size={15} />
                Chop etish
              </PrimaryButton>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

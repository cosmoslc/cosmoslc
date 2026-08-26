import { useState, useMemo, useRef } from "react";
import {
  Wallet,
  CreditCard,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle2,
  Coins,
  Sparkles,
  Search,
  Filter,
  RotateCcw,
  Printer,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  Eye,
  Receipt,
  Building2,
  User,
  Phone,
  Calendar,
  X,
  FileText,
  Layers,
  ShieldCheck,
  Check,
  DollarSign,
  Download,
} from "lucide-react";
import { INPUT_CLS, PrimaryButton, GLASS } from "../theme/tokens";
import { money, formatDate, normalizePhone, thisMonthKey } from "../utils/helpers";
import { opGroups, opStudentsInGroups } from "../utils/dataHelpers";
import { Avatar, EmptyState } from "../components/primitives";
import * as api from "../../../shared/api";

const MONTHS_LIST = [
  { value: "all", label: "Barcha oylar" },
  { value: "01", label: "Yanvar" },
  { value: "02", label: "Fevral" },
  { value: "03", label: "Mart" },
  { value: "04", label: "Aprel" },
  { value: "05", label: "May" },
  { value: "06", label: "Iyun" },
  { value: "07", label: "Iyul" },
  { value: "08", label: "Avgust" },
  { value: "09", label: "Sentyabr" },
  { value: "10", label: "Oktyabr" },
  { value: "11", label: "Noyabr" },
  { value: "12", label: "Dekabr" },
];

const METHOD_OPTIONS = [
  { value: "all", label: "Barcha to'lov turlari", icon: "🌐" },
  { value: "cash", label: "Naqd pul", icon: "💵" },
  { value: "payme", label: "Payme", icon: "🟢" },
  { value: "click", label: "Click", icon: "🔵" },
  { value: "card", label: "Plastik karta (Uzcard/Humo)", icon: "💳" },
  { value: "bank", label: "Bank o'tkazmasi", icon: "🏛️" },
  { value: "coin", label: "Coin (Tangalar)", icon: "🪙" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "Barcha holatlar" },
  { value: "completed", label: "Tugallangan (To'langan)" },
  { value: "pending", label: "Kutilmoqda (Qarzdorlik)" },
  { value: "partial", label: "Qisman to'langan" },
];

export function PaymentsPage({
  scopeBranches = [],
  directorData = {},
  opData = {},
  openModal = () => {},
  onRefresh,
  goTo,
}) {
  const printRef = useRef(null);
  const now = new Date();
  const currentYearStr = String(now.getFullYear());
  const currentMonthNum = String(now.getMonth() + 1).padStart(2, "0");
  const todayISOStr = now.toISOString().slice(0, 10);

  // Period Filters
  const [selectedYear, setSelectedYear] = useState(currentYearStr);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthNum);
  const [quickPeriod, setQuickPeriod] = useState("thisMonth"); // 'all', 'thisMonth', 'today', 'thisYear'

  // Table Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals inside page
  const [receiptModalPayment, setReceiptModalPayment] = useState(null);
  const [deleteConfirmPayment, setDeleteConfirmPayment] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Base datasets
  const scopeIds = useMemo(() => scopeBranches.map((b) => b.id), [scopeBranches]);
  const courses = useMemo(() => {
    return (directorData?.courses || []).filter((c) =>
      scopeIds.length === 0 || scopeIds.includes(c.branchId)
    );
  }, [directorData?.courses, scopeIds]);

  const courseIds = useMemo(() => courses.map((c) => c.id), [courses]);

  const groups = useMemo(() => {
    return opGroups(opData).filter(
      (g) => courseIds.length === 0 || courseIds.includes(g.courseId)
    );
  }, [opData, courseIds]);

  const allStudents = useMemo(() => {
    return opData?.students || [];
  }, [opData?.students]);

  const allPayments = useMemo(() => {
    return (directorData?.payments || opData?.payments || []).map((p) => ({
      ...p,
      amount: Number(p.amount || 0),
    }));
  }, [directorData?.payments, opData?.payments]);

  // Handle Quick Presets
  function applyPreset(preset) {
    setQuickPeriod(preset);
    setCurrentPage(1);
    if (preset === "thisMonth") {
      setSelectedYear(currentYearStr);
      setSelectedMonth(currentMonthNum);
    } else if (preset === "thisYear") {
      setSelectedYear(currentYearStr);
      setSelectedMonth("all");
    } else if (preset === "today") {
      setSelectedYear(currentYearStr);
      setSelectedMonth(currentMonthNum);
    } else if (preset === "all") {
      setSelectedYear("all");
      setSelectedMonth("all");
    }
  }

  // Combined Rows of Payments and Unpaid Debtor records
  const allEnrichedRecords = useMemo(() => {
    const list = [];
    const paymentStudentGroupKeys = new Set();

    // 1. Process actual recorded payments
    allPayments.forEach((p) => {
      const student = allStudents.find((s) => s.id === p.studentId);
      const group = groups.find((g) => g.id === p.groupId);
      const course = courses.find((c) => c.id === group?.courseId);

      const pDate = p.date || (p.createdAt ? new Date(p.createdAt).toISOString().slice(0, 10) : "");
      const pYear = pDate ? pDate.slice(0, 4) : "";
      const pMonth = p.month ? p.month.slice(5, 7) : pDate ? pDate.slice(5, 7) : "";

      list.push({
        id: p.id,
        isPaymentRecord: true,
        type: "payment",
        paymentId: p.id,
        studentId: p.studentId,
        studentName: student?.name || "Noma'lum o'quvchi",
        studentPhone: student?.phone || "",
        studentAvatar: student?.name || "U",
        groupId: p.groupId,
        groupName: group?.name || "Asosiy guruh",
        groupColor: group?.color || "#6366f1",
        courseName: course?.name || "Kurs",
        price: group?.price || course?.price || 0,
        amount: Number(p.amount || 0),
        method: p.method || "cash",
        status: "completed",
        date: pDate,
        month: p.month || (pDate ? pDate.slice(0, 7) : thisMonthKey()),
        year: pYear,
        monthNum: pMonth,
        comment: p.comment || p.note || "",
        raw: p,
      });

      if (p.studentId && p.groupId && (p.month || pDate)) {
        const mKey = p.month || pDate.slice(0, 7);
        paymentStudentGroupKeys.add(`${p.studentId}_${p.groupId}_${mKey}`);
      }
    });

    // 2. Identify Pending / Debtor Students for the active selected month
    const targetMonthKey =
      selectedYear !== "all" && selectedMonth !== "all"
        ? `${selectedYear}-${selectedMonth}`
        : thisMonthKey();

    groups.forEach((g) => {
      const course = courses.find((c) => c.id === g.courseId);
      const groupPrice = Number(g.price || course?.price || 0);
      if (groupPrice <= 0) return;

      const groupStudentList = opStudentsInGroups(opData, [g.id]);
      groupStudentList.forEach((s) => {
        const paidSoFar = allPayments
          .filter(
            (p) =>
              p.studentId === s.id &&
              p.groupId === g.id &&
              (p.month === targetMonthKey || (p.date && p.date.startsWith(targetMonthKey)))
          )
          .reduce((sum, p) => sum + Number(p.amount || 0), 0);

        if (paidSoFar < groupPrice) {
          const debt = groupPrice - paidSoFar;
          list.push({
            id: `pending-${s.id}-${g.id}-${targetMonthKey}`,
            isPaymentRecord: false,
            type: "pending",
            studentId: s.id,
            studentName: s.name,
            studentPhone: s.phone || "",
            studentAvatar: s.name,
            groupId: g.id,
            groupName: g.name,
            groupColor: g.color || "#6366f1",
            courseName: course?.name || "Kurs",
            price: groupPrice,
            amount: debt,
            paidSoFar,
            method: "unpaid",
            status: paidSoFar > 0 ? "partial" : "pending",
            date: targetMonthKey + "-01",
            month: targetMonthKey,
            year: targetMonthKey.slice(0, 4),
            monthNum: targetMonthKey.slice(5, 7),
            comment: `To'lov kutilmoqda (Qarz: ${money(debt)} so'm)`,
          });
        }
      });
    });

    return list;
  }, [allPayments, allStudents, groups, courses, opData, selectedYear, selectedMonth]);

  // Calculate Overall KPI Metrics based on selected period
  const kpiStats = useMemo(() => {
    // Filter payments for selected period
    const periodPayments = allPayments.filter((p) => {
      const pDate = p.date || (p.createdAt ? new Date(p.createdAt).toISOString().slice(0, 10) : "");
      if (selectedYear !== "all" && !pDate.startsWith(selectedYear)) return false;
      if (selectedMonth !== "all") {
        const pMonth = p.month ? p.month.slice(5, 7) : pDate.slice(5, 7);
        if (pMonth !== selectedMonth) return false;
      }
      return true;
    });

    // 1. Jami tushum
    const jamiTushum = periodPayments.reduce((acc, p) => acc + (p.amount || 0), 0);

    // 2. Jami to'lovlar soni
    const jamiTolovlarSoni = periodPayments.length;

    // 3. Bugungi to'lovlar
    const todayPayments = allPayments.filter((p) => {
      const pDate = p.date || (p.createdAt ? new Date(p.createdAt).toISOString().slice(0, 10) : "");
      return pDate === todayISOStr;
    });
    const bugungiTushum = todayPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
    const bugungiSoni = todayPayments.length;

    // 4. Kutilayotgan to'lov (Pending debts in selected month)
    const targetMonthKey =
      selectedYear !== "all" && selectedMonth !== "all"
        ? `${selectedYear}-${selectedMonth}`
        : thisMonthKey();

    let kutilayotganTolov = 0;
    let debtorsCount = 0;

    groups.forEach((g) => {
      const course = courses.find((c) => c.id === g.courseId);
      const price = Number(g.price || course?.price || 0);
      if (price <= 0) return;

      const groupStudentList = opStudentsInGroups(opData, [g.id]);
      groupStudentList.forEach((s) => {
        const paidThisMonth = allPayments
          .filter(
            (p) =>
              p.studentId === s.id &&
              p.groupId === g.id &&
              (p.month === targetMonthKey || (p.date && p.date.startsWith(targetMonthKey)))
          )
          .reduce((sum, p) => sum + (p.amount || 0), 0);

        if (paidThisMonth < price) {
          kutilayotganTolov += price - paidThisMonth;
          debtorsCount++;
        }
      });
    });

    // 5. Coin bilan to'langan to'lovlar
    const coinPayments = periodPayments.filter(
      (p) =>
        p.method === "coin" ||
        (p.comment && p.comment.toLowerCase().includes("coin"))
    );
    const coinTushum = coinPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
    const coinSoni = coinPayments.length;

    return {
      jamiTushum,
      jamiTolovlarSoni,
      bugungiTushum,
      bugungiSoni,
      kutilayotganTolov,
      debtorsCount,
      coinTushum,
      coinSoni,
    };
  }, [allPayments, selectedYear, selectedMonth, groups, courses, opData, todayISOStr]);

  // Filter Table Records
  const filteredRecords = useMemo(() => {
    return allEnrichedRecords.filter((rec) => {
      // 1. Year Filter
      if (selectedYear !== "all" && rec.year && rec.year !== selectedYear) {
        return false;
      }

      // 2. Month Filter
      if (selectedMonth !== "all" && rec.monthNum && rec.monthNum !== selectedMonth) {
        return false;
      }

      // 3. Quick Period Filter
      if (quickPeriod === "today" && rec.date !== todayISOStr) {
        return false;
      }

      // 4. Status Filter
      if (statusFilter === "completed" && rec.status !== "completed") return false;
      if (statusFilter === "pending" && rec.status !== "pending") return false;
      if (statusFilter === "partial" && rec.status !== "partial") return false;

      // 5. Method Filter
      if (methodFilter !== "all" && rec.method !== methodFilter) return false;

      // 6. Group Filter
      if (groupFilter !== "all" && rec.groupId !== groupFilter) return false;

      // 7. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = rec.studentName.toLowerCase().includes(q);
        const matchesPhone = normalizePhone(rec.studentPhone).includes(normalizePhone(q));
        const matchesGroup = rec.groupName.toLowerCase().includes(q);
        const matchesComment = (rec.comment || "").toLowerCase().includes(q);
        const matchesId = (rec.id || "").toLowerCase().includes(q);

        if (!matchesName && !matchesPhone && !matchesGroup && !matchesComment && !matchesId) {
          return false;
        }
      }

      return true;
    });
  }, [
    allEnrichedRecords,
    selectedYear,
    selectedMonth,
    quickPeriod,
    statusFilter,
    methodFilter,
    groupFilter,
    searchQuery,
    todayISOStr,
  ]);

  // Sort rows: newest date first, completed payments first
  const sortedRecords = useMemo(() => {
    return [...filteredRecords].sort((a, b) => {
      const dateA = a.date || "";
      const dateB = b.date || "";
      if (dateA !== dateB) return dateB.localeCompare(dateA);
      return (b.amount || 0) - (a.amount || 0);
    });
  }, [filteredRecords]);

  // Pagination Slice
  const totalRecordsCount = sortedRecords.length;
  const totalPages = Math.max(1, Math.ceil(totalRecordsCount / pageSize));
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRecords.slice(start, start + pageSize);
  }, [sortedRecords, currentPage, pageSize]);

  // Reset Filters
  function handleResetFilters() {
    setSearchQuery("");
    setStatusFilter("all");
    setMethodFilter("all");
    setGroupFilter("all");
    setSelectedYear(currentYearStr);
    setSelectedMonth(currentMonthNum);
    setQuickPeriod("thisMonth");
    setCurrentPage(1);
  }

  // Handle Delete Payment
  async function handleDeletePaymentConfirm() {
    if (!deleteConfirmPayment) return;
    setDeleting(true);
    try {
      await api.deletePayment(deleteConfirmPayment.paymentId || deleteConfirmPayment.id);
      setDeleteConfirmPayment(null);
      if (onRefresh) onRefresh();
    } catch (e) {
      console.error("Error deleting payment:", e);
    } finally {
      setDeleting(false);
    }
  }

  // Open Receipt Print Modal
  function handleOpenReceipt(record) {
    setReceiptModalPayment(record);
  }

  // Trigger Print Command
  function handlePrintReceipt() {
    window.print();
  }

  // Trigger Full Page Print / Report
  function handlePrintFullReport() {
    window.print();
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* ========================================================= */}
      {/* 1. TOP HEADER & PRIMARY ACTIONS                          */}
      {/* ========================================================= */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <Wallet size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                To'lovlar
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40">
                Kassa & Tushumlar
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Barcha o'quv to'lovlari monitoringi, kassa hisoboti, qarzdorliklar va kvitansiyalar
            </p>
          </div>
        </div>

        {/* Top Controls: Year & Month Pickers + Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Year Selector */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl h-10 px-3.5 shadow-xs">
            <Calendar size={15} className="text-indigo-500 shrink-0" />
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-sm font-medium text-slate-800 dark:text-slate-200 border-none outline-hidden cursor-pointer h-full"
            >
              <option value="all">Barcha yillar</option>
              <option value="2026">2026-yil</option>
              <option value="2025">2025-yil</option>
              <option value="2024">2024-yil</option>
            </select>
          </div>

          {/* Month Selector */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl h-10 px-3.5 shadow-xs">
            <Calendar size={15} className="text-emerald-500 shrink-0" />
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-sm font-medium text-slate-800 dark:text-slate-200 border-none outline-hidden cursor-pointer h-full"
            >
              {MONTHS_LIST.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Chop etish (Print Report) */}
          <button
            onClick={handlePrintFullReport}
            className="px-4 h-10 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium border border-slate-200 dark:border-slate-700 flex items-center gap-2 transition-all shadow-xs cursor-pointer"
            title="Hisobotni chop etish"
          >
            <Printer size={15} /> Chop etish
          </button>

          {/* + Yangi to'lov qabul qilish */}
          <PrimaryButton
            onClick={() => openModal({ type: "recordPayment" })}
            className="shadow-md shadow-indigo-600/20"
          >
            <Plus size={16} /> Yangi to'lov
          </PrimaryButton>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. FIVE KEY METRIC CARDS (KPIs)                           */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3.5">
        {/* Card 1: Jami tushum */}
        <div className="stat-card border-emerald-200/80 dark:border-emerald-900/40 bg-gradient-to-b from-emerald-50/30 to-white dark:from-emerald-950/20 dark:to-slate-900 p-4 rounded-xl shadow-sm hover:-translate-y-1 transition-all cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <div className="icon-badge w-[34px] h-[34px] rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-md">
              <Wallet size={16} className="text-white" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
              Tushum
            </span>
          </div>
          <div className="stat-value text-[19px] font-extrabold tracking-tight text-slate-900 dark:text-white mb-0.5">
            {money(kpiStats.jamiTushum)}{" "}
            <span className="text-xs font-medium text-slate-400">so'm</span>
          </div>
          <div className="stat-label text-xs font-bold text-slate-500 dark:text-slate-400">
            Jami tushum
          </div>
        </div>

        {/* Card 2: Jami to'lovlar soni */}
        <div className="stat-card border-indigo-200/80 dark:border-indigo-900/40 bg-gradient-to-b from-indigo-50/30 to-white dark:from-indigo-950/20 dark:to-slate-900 p-4 rounded-xl shadow-sm hover:-translate-y-1 transition-all cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <div className="icon-badge w-[34px] h-[34px] rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-md">
              <CreditCard size={16} className="text-white" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
              Tranzaksiyalar
            </span>
          </div>
          <div className="stat-value text-[19px] font-extrabold tracking-tight text-slate-900 dark:text-white mb-0.5">
            {kpiStats.jamiTolovlarSoni}{" "}
            <span className="text-xs font-medium text-slate-400">ta to'lov</span>
          </div>
          <div className="stat-label text-xs font-bold text-slate-500 dark:text-slate-400">
            Jami to'lovlar
          </div>
        </div>

        {/* Card 3: Bugungi to'lovlar */}
        <div className="stat-card border-amber-200/80 dark:border-amber-900/40 bg-gradient-to-b from-amber-50/30 to-white dark:from-amber-950/20 dark:to-slate-900 p-4 rounded-xl shadow-sm hover:-translate-y-1 transition-all cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <div className="icon-badge w-[34px] h-[34px] rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md">
              <Clock size={16} className="text-white" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
              Bugun
            </span>
          </div>
          <div className="stat-value text-[19px] font-extrabold tracking-tight text-slate-900 dark:text-white mb-0.5">
            {money(kpiStats.bugungiTushum)}{" "}
            <span className="text-xs font-medium text-slate-400">so'm</span>
          </div>
          <div className="stat-label text-xs font-bold text-slate-500 dark:text-slate-400">
            Bugungi to'lovlar ({kpiStats.bugungiSoni} ta)
          </div>
        </div>

        {/* Card 4: Kutilayotgan to'lov (Qarzdorlik) */}
        <div
          onClick={() => goTo && goTo("debtors")}
          className="stat-card border-rose-200/80 dark:border-rose-900/40 bg-gradient-to-b from-rose-50/30 to-white dark:from-rose-950/20 dark:to-slate-900 p-4 rounded-xl shadow-sm hover:-translate-y-1 transition-all cursor-pointer"
          title="Qarzdorlar sahifasiga o'tish"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="icon-badge w-[34px] h-[34px] rounded-xl bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center shadow-md">
              <AlertCircle size={16} className="text-white" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300">
              Qarzdorlik
            </span>
          </div>
          <div className="stat-value text-[19px] font-extrabold tracking-tight text-rose-600 dark:text-rose-400 mb-0.5">
            {money(kpiStats.kutilayotganTolov)}{" "}
            <span className="text-xs font-medium text-slate-400">so'm</span>
          </div>
          <div className="stat-label text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Kutilayotgan to'lov ({kpiStats.debtorsCount} kishi)</span>
            {goTo && <span className="text-[10px] underline font-bold">O'tish →</span>}
          </div>
        </div>

        {/* Card 5: Coin bilan to'langan to'lovlar */}
        <div className="stat-card border-purple-200/80 dark:border-purple-900/40 bg-gradient-to-b from-purple-50/30 to-white dark:from-purple-950/20 dark:to-slate-900 p-4 rounded-xl shadow-sm hover:-translate-y-1 transition-all cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <div className="icon-badge w-[34px] h-[34px] rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-md">
              <Coins size={16} className="text-white" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
              Coin
            </span>
          </div>
          <div className="stat-value text-[19px] font-extrabold tracking-tight text-purple-600 dark:text-purple-400 mb-0.5">
            {kpiStats.coinSoni}{" "}
            <span className="text-xs font-medium text-slate-400">ta ({money(kpiStats.coinTushum)})</span>
          </div>
          <div className="stat-label text-xs font-bold text-slate-500 dark:text-slate-400">
            Coin bilan to'langan
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. FILTER & SEARCH TOOLBAR                               */}
      {/* ========================================================= */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-xl shadow-sm space-y-3">
        {/* Quick Presets Pills */}
        <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
              <Filter size={13} /> Filtr davri:
            </span>
            <button
              onClick={() => applyPreset("thisMonth")}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                quickPeriod === "thisMonth"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              Shu oy
            </button>
            <button
              onClick={() => applyPreset("today")}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                quickPeriod === "today"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              Bugun
            </button>
            <button
              onClick={() => applyPreset("thisYear")}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                quickPeriod === "thisYear"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              Joriy yil
            </button>
            <button
              onClick={() => applyPreset("all")}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                quickPeriod === "all"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              Hammasi
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">
              Jami topildi: <strong className="text-slate-800 dark:text-slate-200">{filteredRecords.length} ta</strong>
            </span>
            <button
              onClick={handleResetFilters}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Filtrlarni tozalash"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        {/* Inputs: Search, Status Dropdown, Method Dropdown, Group Dropdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="O'quvchi ismi, telefon, chek..."
              className={`${INPUT_CLS} pl-9 text-xs`}
            />
          </div>

          {/* Status Dropdown */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className={`${INPUT_CLS} text-xs`}
            >
              {STATUS_OPTIONS.map((st) => (
                <option key={st.value} value={st.value}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method Dropdown */}
          <div>
            <select
              value={methodFilter}
              onChange={(e) => {
                setMethodFilter(e.target.value);
                setCurrentPage(1);
              }}
              className={`${INPUT_CLS} text-xs`}
            >
              {METHOD_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.icon} {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Group Dropdown */}
          <div>
            <select
              value={groupFilter}
              onChange={(e) => {
                setGroupFilter(e.target.value);
                setCurrentPage(1);
              }}
              className={`${INPUT_CLS} text-xs`}
            >
              <option value="all">Barcha guruhlar</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. PAYMENTS TABLE                                        */}
      {/* ========================================================= */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold">
                <th className="py-3.5 px-4 w-12 text-center">#</th>
                <th className="py-3.5 px-4">O'quvchi</th>
                <th className="py-3.5 px-4">Summa</th>
                <th className="py-3.5 px-4">To'lov usuli</th>
                <th className="py-3.5 px-4">Holat</th>
                <th className="py-3.5 px-4">Sana</th>
                <th className="py-3.5 px-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <EmptyState
                      icon={
                        <CreditCard size={28} className="text-slate-400 mx-auto" />
                      }
                      title="To'lovlar topilmadi"
                      subtitle="Belgilangan filtrlar yoki qidiruv bo'yicha ma'lumot mavjud emas."
                    />
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((rec, idx) => {
                  const rowNumber = (currentPage - 1) * pageSize + idx + 1;
                  const isCompleted = rec.status === "completed";
                  const isPending = rec.status === "pending";
                  const isPartial = rec.status === "partial";

                  return (
                    <tr
                      key={rec.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Row Index */}
                      <td className="py-3.5 px-4 text-center font-mono text-slate-400 text-[11px]">
                        {rowNumber}
                      </td>

                      {/* Student Info & Group */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar
                            name={rec.studentName}
                            color={rec.groupColor}
                            size={34}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-slate-900 dark:text-white text-xs">
                                {rec.studentName}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                              <span>{rec.studentPhone || "—"}</span>
                              <span>•</span>
                              <span
                                className="px-1.5 py-0.5 rounded text-[10px] font-semibold"
                                style={{
                                  backgroundColor: `${rec.groupColor}15`,
                                  color: rec.groupColor,
                                }}
                              >
                                {rec.groupName}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Payment Amount */}
                      <td className="py-3.5 px-4 font-display font-extrabold text-sm">
                        <span
                          className={
                            isCompleted
                              ? "text-emerald-600 dark:text-emerald-400"
                              : isPartial
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-rose-600 dark:text-rose-400"
                          }
                        >
                          {money(rec.amount)}
                        </span>{" "}
                        <span className="text-[10px] font-normal text-slate-400">so'm</span>
                        {isPartial && (
                          <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                            To'landi: {money(rec.paidSoFar)} / {money(rec.price)}
                          </div>
                        )}
                      </td>

                      {/* Payment Method Badge */}
                      <td className="py-3.5 px-4">
                        {rec.method === "cash" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/40">
                            💵 Naqd pul
                          </span>
                        )}
                        {rec.method === "payme" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-900/40">
                            🟢 Payme
                          </span>
                        )}
                        {rec.method === "click" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-200/60 dark:border-sky-900/40">
                            🔵 Click
                          </span>
                        )}
                        {(rec.method === "card" || rec.method === "plastik") && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-900/40">
                            💳 Plastik karta
                          </span>
                        )}
                        {rec.method === "bank" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/40">
                            🏛️ Bank o'tkazmasi
                          </span>
                        )}
                        {rec.method === "coin" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-900/40">
                            🪙 Coin to'lovi
                          </span>
                        )}
                        {rec.method === "unpaid" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500">
                            ⏳ Kutilmoqda
                          </span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        {isCompleted && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40">
                            <CheckCircle2 size={12} /> Tugallangan
                          </span>
                        )}
                        {isPartial && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/40">
                            <Clock size={12} /> Qisman
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/40">
                            <AlertCircle size={12} /> Kutilmoqda
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {formatDate(rec.date)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Oy: {rec.month || "—"}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Print Receipt Button */}
                          <button
                            onClick={() => handleOpenReceipt(rec)}
                            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200/70 dark:border-slate-700 transition-colors"
                            title="Chek / Kvitansiyani ko'rish va chop etish"
                          >
                            <Printer size={14} />
                          </button>

                          {/* If recorded payment, allow delete */}
                          {rec.isPaymentRecord && (
                            <button
                              onClick={() => setDeleteConfirmPayment(rec)}
                              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                              title="To'lovni o'chirish"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}

                          {/* If pending, allow quick pay */}
                          {!rec.isPaymentRecord && (
                            <button
                              onClick={() => {
                                openModal({
                                  type: "recordPayment",
                                  studentId: rec.studentId,
                                  groupId: rec.groupId,
                                });
                              }}
                              className="px-2.5 py-1 rounded-xl bg-indigo-600 text-white text-[11px] font-bold hover:bg-indigo-700 transition-colors flex items-center gap-1 shadow-xs"
                            >
                              <CreditCard size={12} /> To'lash
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ========================================================= */}
        {/* PAGINATION FOOTER CONTROLS                                */}
        {/* ========================================================= */}
        <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3 bg-slate-50/50 dark:bg-slate-900/50">
          {/* Page size selector */}
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Sahifada ko'rsatish:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-slate-300"
            >
              <option value={10}>10 ta</option>
              <option value={20}>20 ta</option>
              <option value={50}>50 ta</option>
              <option value={100}>100 ta</option>
            </select>
            <span>
              | Jami: <strong>{totalRecordsCount}</strong> ta yozuv
            </span>
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1"
            >
              <ChevronLeft size={14} /> Oldingi
            </button>

            <span className="px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-300">
              Sahifa {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1"
            >
              Keyingi <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 5. MODAL 1: OFFICIAL RECEIPT / CHEK PRINT MODAL           */}
      {/* ========================================================= */}
      {receiptModalPayment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setReceiptModalPayment(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Actions */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="text-indigo-600" size={20} />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  To'lov kvitansiyasi (Chek)
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintReceipt}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Printer size={14} /> Chop etish
                </button>
                <button
                  onClick={() => setReceiptModalPayment(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Printable Receipt Paper Container */}
            <div
              ref={printRef}
              className="p-6 bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl font-mono text-slate-800 dark:text-slate-200 space-y-4"
            >
              {/* Header */}
              <div className="text-center pb-3 border-b border-slate-200 dark:border-slate-800">
                <h2 className="font-display font-extrabold text-lg tracking-wider text-slate-900 dark:text-white uppercase">
                  COSMOS LEARNING CENTER
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Zamonaviy Ta'lim & Innovatsion O'quv Markazi
                </p>
                <p className="text-[10px] text-slate-400">
                  Tel: +998 90 202 14 79 • www.cosmos.uz
                </p>
              </div>

              {/* Receipt Meta */}
              <div className="flex justify-between text-xs border-b border-slate-200 dark:border-slate-800 pb-2">
                <div>
                  <span className="text-slate-400">Kvitansiya №:</span>
                  <strong className="block text-slate-900 dark:text-white">
                    #CSM-{receiptModalPayment.year || "2026"}-
                    {(receiptModalPayment.id || "").slice(-6).toUpperCase() || "001"}
                  </strong>
                </div>
                <div className="text-right">
                  <span className="text-slate-400">Sana:</span>
                  <strong className="block text-slate-900 dark:text-white">
                    {formatDate(receiptModalPayment.date)}
                  </strong>
                </div>
              </div>

              {/* Details List */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">O'quvchi:</span>
                  <span className="font-bold text-slate-900 dark:text-white text-right">
                    {receiptModalPayment.studentName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Telefon:</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {receiptModalPayment.studentPhone || "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Guruh:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {receiptModalPayment.groupName} ({receiptModalPayment.courseName})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">To'lov oyi:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {receiptModalPayment.month || "Joriy oy"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">To'lov usuli:</span>
                  <span className="font-semibold uppercase text-indigo-600 dark:text-indigo-400">
                    {receiptModalPayment.method}
                  </span>
                </div>
              </div>

              {/* Total Box */}
              <div className="pt-3 border-t-2 border-slate-300 dark:border-slate-700 flex justify-between items-center text-sm">
                <span className="font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  JAMI TO'LANDI:
                </span>
                <span className="font-display font-extrabold text-base text-emerald-600 dark:text-emerald-400">
                  {money(receiptModalPayment.amount)} so'm
                </span>
              </div>

              {/* Footer notes */}
              <div className="text-center pt-2 text-[10px] text-slate-400 space-y-0.5 border-t border-slate-200 dark:border-slate-800">
                <p>To'lovingiz uchun minnatdormiz!</p>
                <p>Ushbu kvitansiya to'lov amalga oshirilganligining rasmiy tasdig'idir.</p>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* ========================================================= */}
      {/* 7. MODAL 3: DELETE CONFIRMATION MODAL                     */}
      {/* ========================================================= */}
      {deleteConfirmPayment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setDeleteConfirmPayment(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-sm p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                To'lovni o'chirish
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Haqiqatan ham ushbu <strong>{money(deleteConfirmPayment.amount)} so'm</strong>lik to'lovni o'chirmoqchimisiz?
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmPayment(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={handleDeletePaymentConfirm}
                disabled={deleting}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-colors"
              >
                {deleting ? "O'chirilmoqda..." : "Ha, o'chirish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useMemo } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Clock,
  PieChart,
  Users,
  Search,
  Filter,
  RotateCcw,
  Printer,
  CreditCard,
  Phone,
  Send,
  User,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  X,
  MessageSquare,
  DollarSign,
  TrendingDown,
  ArrowUpDown,
  FileText,
  ShieldAlert,
} from "lucide-react";
import { INPUT_CLS, PrimaryButton, GLASS } from "../theme/tokens";
import { money, formatDate, normalizePhone, thisMonthKey } from "../utils/helpers";
import { calculateStudentGroupFee } from "../../../shared/utils/prorata";
import { opGroups, opStudentsInGroups } from "../utils/dataHelpers";
import { Avatar, EmptyState } from "../components/primitives";
import { RecordPaymentModal } from "../modals/RecordPaymentModal";
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

export function DebtorsPage({
  scopeBranches = [],
  directorData = {},
  opData = {},
  openModal = () => {},
  onRecordPayment,
  onRefresh,
}) {
  const now = new Date();
  const currentDay = now.getDate();
  const currentYearStr = String(now.getFullYear());
  const currentMonthNum = String(now.getMonth() + 1).padStart(2, "0");
  const todayISO = now.toISOString().slice(0, 10);

  // Period state
  const [selectedYear, setSelectedYear] = useState(currentYearStr);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthNum);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all"); // 'all', 'overdue', 'dueToday', 'partial', 'fullyUnpaid'
  const [sortBy, setSortBy] = useState("highestDebt"); // 'highestDebt', 'lowestDebt', 'name', 'overdueDays'

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Unified Payment Modal fallback state
  const [paymentDebtor, setPaymentDebtor] = useState(null);

  // Reminder Modal
  const [reminderTarget, setReminderTarget] = useState(null);
  const [reminderMessage, setReminderMessage] = useState("");
  const [reminderRecipient, setReminderRecipient] = useState("parent"); // 'parent', 'student', 'both'
  const [sendingReminder, setSendingReminder] = useState(false);
  const [reminderSuccessToast, setReminderSuccessToast] = useState(false);

  // Bulk Reminder Modal
  const [showBulkReminderModal, setShowBulkReminderModal] = useState(false);
  const [bulkSending, setBulkSending] = useState(false);

  // Data lookups
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

  const allStudents = useMemo(() => opData?.students || [], [opData?.students]);
  const allPayments = useMemo(() => directorData?.payments || opData?.payments || [], [
    directorData?.payments,
    opData?.payments,
  ]);
  const teachers = useMemo(() => directorData?.teachersHR || [], [directorData?.teachersHR]);

  const targetMonthKey =
    selectedYear !== "all" && selectedMonth !== "all"
      ? `${selectedYear}-${selectedMonth}`
      : thisMonthKey();

  // Compute all debtor rows
  const allDebtorRows = useMemo(() => {
    const rows = [];

    groups.forEach((group) => {
      const course = courses.find((c) => c.id === group.courseId);
      const teacher = teachers.find((t) => String(t.id) === String(group.teacherHrId || group.teacherId));
      const price = Number(group.price || course?.price || 0);
      if (price <= 0) return;

      const groupStudents = opStudentsInGroups(opData, [group.id]);

      groupStudents.forEach((student) => {
        const membership =
          student.groupMemberships?.[group.id] || student.groupMemberships?.[String(group.id)];
        const prorata = calculateStudentGroupFee({
          fullMonthlyFee: price,
          groupDays: group.days || ["Dush", "Chor", "Juma"],
          monthStr: targetMonthKey,
          membership,
          student,
        });

        // Trial / frozen students accrue no debt for this group
        if (prorata.isTrial || prorata.isPaused) return;

        const effectivePrice = prorata.calculatedFee;

        // Calculate amount paid by student for this group in target month
        const paidThisMonth = allPayments
          .filter(
            (p) =>
              p.studentId === student.id &&
              p.groupId === group.id &&
              (p.month === targetMonthKey ||
                (p.date && p.date.startsWith(targetMonthKey)))
          )
          .reduce((sum, p) => sum + Number(p.amount || 0), 0);

        if (paidThisMonth < effectivePrice) {
          const debtAmount = effectivePrice - paidThisMonth;
          const isPartial = paidThisMonth > 0;
          const isFullyUnpaid = paidThisMonth === 0;

          // Due date calculations: standard educational payment deadline is by the 10th-15th of each month
          const paymentDueDay = group.paymentDueDay || 10;
          const isDueToday = currentDay === paymentDueDay;
          const isOverdue = currentDay > paymentDueDay;
          const overdueDays = isOverdue ? currentDay - paymentDueDay : 0;
          const daysLeft = !isOverdue && !isDueToday ? paymentDueDay - currentDay : 0;

          let severity = "pending";
          if (isOverdue) severity = "overdue";
          else if (isDueToday) severity = "dueToday";
          else if (isPartial) severity = "partial";
          else severity = "normal";

          rows.push({
            id: `${student.id}_${group.id}_${targetMonthKey}`,
            studentId: student.id,
            studentName: student.name,
            studentPhone: student.phone || "",
            parentName: student.parentName || "Ota-onasi",
            parentPhone: student.parentPhone || student.phone || "",
            groupId: group.id,
            groupName: group.name,
            groupColor: group.color || "#6366f1",
            courseName: course?.name || "Asosiy kurs",
            teacherName: teacher?.name || "Ustoz biriktirilmagan",
            price: effectivePrice,
            basePrice: price,
            isProrated: prorata.isProrated,
            prorataInfo: prorata,
            paidSoFar: paidThisMonth,
            debtAmount,
            paidPercent: effectivePrice > 0 ? Math.round((paidThisMonth / effectivePrice) * 100) : 0,
            month: targetMonthKey,
            paymentDueDay,
            isDueToday,
            isOverdue,
            overdueDays,
            daysLeft,
            isPartial,
            isFullyUnpaid,
            severity,
          });
        }
      });
    });

    return rows;
  }, [
    groups,
    courses,
    teachers,
    opData,
    allPayments,
    targetMonthKey,
    currentDay,
  ]);

  // Compute 5 KPIs
  const kpis = useMemo(() => {
    const jamiQarzdorlarSoni = allDebtorRows.length;
    const umumiyQarzSummasi = allDebtorRows.reduce((acc, r) => acc + r.debtAmount, 0);

    const bugunTolovRows = allDebtorRows.filter((r) => r.isDueToday);
    const bugunTolovSoni = bugunTolovRows.length;
    const bugunTolovSummasi = bugunTolovRows.reduce((acc, r) => acc + r.debtAmount, 0);

    const muddatiOtganRows = allDebtorRows.filter((r) => r.isOverdue);
    const muddatiOtganSoni = muddatiOtganRows.length;
    const muddatiOtganSummasi = muddatiOtganRows.reduce((acc, r) => acc + r.debtAmount, 0);

    const qismanRows = allDebtorRows.filter((r) => r.isPartial);
    const qismanQarzdorlarSoni = qismanRows.length;
    const qismanQarzSummasi = qismanRows.reduce((acc, r) => acc + r.debtAmount, 0);

    return {
      jamiQarzdorlarSoni,
      umumiyQarzSummasi,
      bugunTolovSoni,
      bugunTolovSummasi,
      muddatiOtganSoni,
      muddatiOtganSummasi,
      qismanQarzdorlarSoni,
      qismanQarzSummasi,
    };
  }, [allDebtorRows]);

  // Filtered rows
  const filteredDebtors = useMemo(() => {
    return allDebtorRows.filter((row) => {
      // Group Filter
      if (groupFilter !== "all" && row.groupId !== groupFilter) return false;

      // Severity Filter
      if (severityFilter === "overdue" && !row.isOverdue) return false;
      if (severityFilter === "dueToday" && !row.isDueToday) return false;
      if (severityFilter === "partial" && !row.isPartial) return false;
      if (severityFilter === "fullyUnpaid" && !row.isFullyUnpaid) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const mStudent = row.studentName.toLowerCase().includes(q);
        const mPhone = normalizePhone(row.studentPhone).includes(normalizePhone(q));
        const mParent = (row.parentName || "").toLowerCase().includes(q);
        const mParentPhone = normalizePhone(row.parentPhone).includes(normalizePhone(q));
        const mGroup = row.groupName.toLowerCase().includes(q);

        if (!mStudent && !mPhone && !mParent && !mParentPhone && !mGroup) {
          return false;
        }
      }

      return true;
    });
  }, [allDebtorRows, groupFilter, severityFilter, searchQuery]);

  // Sorted rows
  const sortedDebtors = useMemo(() => {
    return [...filteredDebtors].sort((a, b) => {
      if (sortBy === "highestDebt") return b.debtAmount - a.debtAmount;
      if (sortBy === "lowestDebt") return a.debtAmount - b.debtAmount;
      if (sortBy === "overdueDays") return b.overdueDays - a.overdueDays;
      if (sortBy === "name") return a.studentName.localeCompare(b.studentName);
      return 0;
    });
  }, [filteredDebtors, sortBy]);

  // Pagination Slice
  const totalCount = sortedDebtors.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const paginatedDebtors = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedDebtors.slice(start, start + pageSize);
  }, [sortedDebtors, currentPage, pageSize]);

  // Open Unified Payment Modal
  function handleOpenPayment(debtor) {
    if (openModal) {
      openModal({
        type: "recordPayment",
        studentId: debtor.studentId,
        groupId: debtor.groupId,
        month: debtor.month,
        amount: debtor.debtAmount,
      });
    } else {
      setPaymentDebtor(debtor);
    }
  }

  // Open Reminder Modal
  function handleOpenReminder(debtor) {
    setReminderTarget(debtor);
    setReminderRecipient("parent");
    const defaultMsg = `Hurmatli ${debtor.parentName || debtor.studentName}! Farzandingiz ${debtor.studentName}ning "${debtor.groupName}" guruhi bo'yicha ${debtor.month} oyi uchun ${money(debtor.debtAmount)} so'm o'quv to'lovi qoldig'i mavjud. Iltimos, to'lovni o'z vaqtida amalga oshirishingizni so'raymiz. Hurmat bilan, COSMOS Learning Center.`;
    setReminderMessage(defaultMsg);
  }

  // Submit Reminder
  async function handleSendReminder(e) {
    e.preventDefault();
    if (!reminderTarget || !reminderMessage.trim()) return;
    setSendingReminder(true);
    try {
      // Simulate sending via SMS/Telegram and record in notification log
      await api.addNotification({
        title: `SMS Eslatma yuborildi: ${reminderTarget.studentName}`,
        message: reminderMessage,
        type: "sms_reminder",
        studentId: reminderTarget.studentId,
        targetPhone:
          reminderRecipient === "parent"
            ? reminderTarget.parentPhone
            : reminderTarget.studentPhone,
      });

      setReminderTarget(null);
      setReminderSuccessToast(true);
      setTimeout(() => setReminderSuccessToast(false), 3500);
    } catch (err) {
      console.error("Send reminder error:", err);
    } finally {
      setSendingReminder(false);
    }
  }

  // Bulk Reminder Submit
  async function handleSendBulkReminders() {
    setBulkSending(true);
    try {
      for (const d of filteredDebtors) {
        const msg = `Hurmatli ota-ona! Farzandingiz ${d.studentName}ning "${d.groupName}" guruhi bo'yicha ${money(d.debtAmount)} so'm to'lovi kutilmoqda. COSMOS LC.`;
        await api.addNotification({
          title: `Ommaviy SMS eslatma: ${d.studentName}`,
          message: msg,
          type: "sms_reminder",
          studentId: d.studentId,
        });
      }
      setShowBulkReminderModal(false);
      setReminderSuccessToast(true);
      setTimeout(() => setReminderSuccessToast(false), 3500);
    } catch (err) {
      console.error("Bulk reminder error:", err);
    } finally {
      setBulkSending(false);
    }
  }

  // Reset Filters
  function handleResetFilters() {
    setSearchQuery("");
    setGroupFilter("all");
    setSeverityFilter("all");
    setSortBy("highestDebt");
    setSelectedYear(currentYearStr);
    setSelectedMonth(currentMonthNum);
    setCurrentPage(1);
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* ========================================================= */}
      {/* 1. TOP HEADER & PERIOD CONTROLS                          */}
      {/* ========================================================= */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-rose-500 to-red-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/25">
            <AlertCircle size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Qarzdorlar
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/40">
                To'lov nazorati
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Year Selector */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl h-10 px-3.5 shadow-xs">
            <Calendar size={15} className="text-rose-500 shrink-0" />
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-sm font-medium text-slate-800 dark:text-slate-200 border-none outline-hidden cursor-pointer h-full"
            >
              <option value="2026">2026-yil</option>
              <option value="2025">2025-yil</option>
              <option value="2024">2024-yil</option>
            </select>
          </div>

          {/* Month Selector */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl h-10 px-3.5 shadow-xs">
            <Calendar size={15} className="text-indigo-500 shrink-0" />
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-sm font-medium text-slate-800 dark:text-slate-200 border-none outline-hidden cursor-pointer h-full"
            >
              {MONTHS_LIST.filter((m) => m.value !== "all").map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label} oyi
                </option>
              ))}
            </select>
          </div>

          {/* Print Debtors Report */}
          <button
            onClick={() => window.print()}
            className="px-4 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium border border-slate-200 dark:border-slate-700 flex items-center gap-2 transition-all shadow-xs cursor-pointer"
            title="Qarzdorlar hisobotini chop etish"
          >
            <Printer size={15} /> Chop etish
          </button>

          {/* Bulk SMS Reminders */}
          <PrimaryButton
            onClick={() => setShowBulkReminderModal(true)}
            className="bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20 text-white"
          >
            <Send size={15} /> Barchaga SMS eslatma
          </PrimaryButton>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. FIVE KEY METRIC CARDS (KPIs)                           */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3.5">
        {/* Card 1: Jami qarzdor o'quvchilar */}
        <div className="stat-card border-slate-200/80 dark:border-slate-800 bg-gradient-to-b from-slate-50/50 to-white dark:from-slate-800/20 dark:to-slate-900 p-4 rounded-xl shadow-sm hover:-translate-y-1 transition-all cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <div className="icon-badge w-[34px] h-[34px] rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center shadow-md">
              <Users size={16} className="text-white" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              Jami
            </span>
          </div>
          <div className="stat-value text-[19px] font-extrabold tracking-tight text-slate-900 dark:text-white mb-0.5">
            {kpis.jamiQarzdorlarSoni}{" "}
            <span className="text-xs font-medium text-slate-400">nafar</span>
          </div>
          <div className="stat-label text-xs font-bold text-slate-500 dark:text-slate-400">
            Jami qarzdorlar
          </div>
        </div>

        {/* Card 2: Umumiy qarz summasi */}
        <div className="stat-card border-rose-200/80 dark:border-rose-900/40 bg-gradient-to-b from-rose-50/30 to-white dark:from-rose-950/20 dark:to-slate-900 p-4 rounded-xl shadow-sm hover:-translate-y-1 transition-all cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <div className="icon-badge w-[34px] h-[34px] rounded-xl bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center shadow-md">
              <TrendingDown size={16} className="text-white" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300">
              Qarz
            </span>
          </div>
          <div className="stat-value text-[19px] font-extrabold tracking-tight text-rose-600 dark:text-rose-400 mb-0.5">
            {money(kpis.umumiyQarzSummasi)}{" "}
            <span className="text-xs font-medium text-slate-400">so'm</span>
          </div>
          <div className="stat-label text-xs font-bold text-slate-500 dark:text-slate-400">
            Umumiy qarz summasi
          </div>
        </div>

        {/* Card 3: Bugun to'lov qilishi kerak */}
        <div className="stat-card border-amber-200/80 dark:border-amber-900/40 bg-gradient-to-b from-amber-50/30 to-white dark:from-amber-950/20 dark:to-slate-900 p-4 rounded-xl shadow-sm hover:-translate-y-1 transition-all cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <div className="icon-badge w-[34px] h-[34px] rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md">
              <Clock size={16} className="text-white" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
              Bugun
            </span>
          </div>
          <div className="stat-value text-[19px] font-extrabold tracking-tight text-amber-600 dark:text-amber-400 mb-0.5">
            {kpis.bugunTolovSoni}{" "}
            <span className="text-xs font-medium text-slate-400">nafar ({money(kpis.bugunTolovSummasi)})</span>
          </div>
          <div className="stat-label text-xs font-bold text-slate-500 dark:text-slate-400">
            Bugun to'lashi kerak
          </div>
        </div>

        {/* Card 4: Muddati o'tgan qarzdorlar */}
        <div className="stat-card border-red-200/80 dark:border-red-900/40 bg-gradient-to-b from-red-50/30 to-white dark:from-red-950/20 dark:to-slate-900 p-4 rounded-xl shadow-sm hover:-translate-y-1 transition-all cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <div className="icon-badge w-[34px] h-[34px] rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-md">
              <ShieldAlert size={16} className="text-white" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-xl bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300">
              Muddati o'tgan
            </span>
          </div>
          <div className="stat-value text-[19px] font-extrabold tracking-tight text-red-600 dark:text-red-400 mb-0.5">
            {kpis.muddatiOtganSoni}{" "}
            <span className="text-xs font-medium text-slate-400">nafar ({money(kpis.muddatiOtganSummasi)})</span>
          </div>
          <div className="stat-label text-xs font-bold text-slate-500 dark:text-slate-400">
            Muddati o'tganlar
          </div>
        </div>

        {/* Card 5: Qisman qarzdorlar */}
        <div className="stat-card border-indigo-200/80 dark:border-indigo-900/40 bg-gradient-to-b from-indigo-50/30 to-white dark:from-indigo-950/20 dark:to-slate-900 p-4 rounded-xl shadow-sm hover:-translate-y-1 transition-all cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <div className="icon-badge w-[34px] h-[34px] rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-md">
              <PieChart size={16} className="text-white" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
              Qisman
            </span>
          </div>
          <div className="stat-value text-[19px] font-extrabold tracking-tight text-indigo-600 dark:text-indigo-400 mb-0.5">
            {kpis.qismanQarzdorlarSoni}{" "}
            <span className="text-xs font-medium text-slate-400">nafar ({money(kpis.qismanQarzSummasi)})</span>
          </div>
          <div className="stat-label text-xs font-bold text-slate-500 dark:text-slate-400">
            Qisman to'laganlar
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. FILTER TOOLBAR                                         */}
      {/* ========================================================= */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-xl shadow-sm space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
              <Filter size={13} /> Holat bo'yicha:
            </span>
            <button
              onClick={() => {
                setSeverityFilter("all");
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                severityFilter === "all"
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              Barcha qarzdorlar ({allDebtorRows.length})
            </button>
            <button
              onClick={() => {
                setSeverityFilter("overdue");
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                severityFilter === "overdue"
                  ? "bg-red-600 text-white shadow-xs"
                  : "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 hover:bg-red-100"
              }`}
            >
              🚨 Muddati o'tgan ({kpis.muddatiOtganSoni})
            </button>
            <button
              onClick={() => {
                setSeverityFilter("dueToday");
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                severityFilter === "dueToday"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100"
              }`}
            >
              ⏰ Bugun to'lashi kerak ({kpis.bugunTolovSoni})
            </button>
            <button
              onClick={() => {
                setSeverityFilter("partial");
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                severityFilter === "partial"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100"
              }`}
            >
              🟡 Qisman to'lagan ({kpis.qismanQarzdorlarSoni})
            </button>
            <button
              onClick={() => {
                setSeverityFilter("fullyUnpaid");
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                severityFilter === "fullyUnpaid"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100"
              }`}
            >
              🔴 100% to'lamagan
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">
              Saralangan: <strong className="text-slate-800 dark:text-slate-200">{filteredDebtors.length} ta</strong>
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

        {/* Inputs: Search, Group Select, Sort Select */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Search */}
          <div className="relative sm:col-span-1">
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
              placeholder="O'quvchi, telefon, ota-onasi..."
              className={`${INPUT_CLS} pl-9 text-xs`}
            />
          </div>

          {/* Group Filter */}
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

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`${INPUT_CLS} text-xs`}
            >
              <option value="highestDebt">Eng ko'p qarzdan kamiga ↓</option>
              <option value="lowestDebt">Eng kam qarzdan ko'piga ↑</option>
              <option value="overdueDays">Kechikkan kunlar bo'yicha ↓</option>
              <option value="name">O'quvchi ismi bo'yicha (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. DEBTORS TABLE                                          */}
      {/* ========================================================= */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold">
                <th className="py-3.5 px-4 w-12 text-center">#</th>
                <th className="py-3.5 px-4">O'quvchi va Ota-onasi</th>
                <th className="py-3.5 px-4">Guruh & Ustoz</th>
                <th className="py-3.5 px-4">To'langan</th>
                <th className="py-3.5 px-4">Qoldiq qarz</th>
                <th className="py-3.5 px-4">To'lov muddati / Holat</th>
                <th className="py-3.5 px-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedDebtors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <EmptyState
                      icon={CheckCircle2}
                      title="Qarzdorlar topilmadi!"
                      subtitle="Barcha o'quvchilar to'lovlarini muvaffaqiyatli amalga oshirgan yoki filtr bo'yicha ma'lumot yo'q."
                    />
                  </td>
                </tr>
              ) : (
                paginatedDebtors.map((row, idx) => {
                  const rowNumber = (currentPage - 1) * pageSize + idx + 1;

                  return (
                    <tr
                      key={row.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* # */}
                      <td className="py-3.5 px-4 text-center font-mono text-slate-400 text-[11px]">
                        {rowNumber}
                      </td>

                      {/* Student & Parent Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar
                            name={row.studentName}
                            color={row.groupColor}
                            size={36}
                          />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white text-xs">
                              {row.studentName}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                              <a
                                href={`tel:${row.studentPhone}`}
                                className="hover:text-indigo-600 flex items-center gap-1"
                              >
                                <Phone size={10} /> {row.studentPhone || "—"}
                              </a>
                            </div>
                            {row.parentName && (
                              <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                                <span>Ota-onasi: {row.parentName}</span>
                                {row.parentPhone && row.parentPhone !== row.studentPhone && (
                                  <a
                                    href={`tel:${row.parentPhone}`}
                                    className="text-indigo-500 hover:underline"
                                  >
                                    ({row.parentPhone})
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Group & Course */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="px-2 py-0.5 rounded-xl text-[11px] font-bold"
                            style={{
                              backgroundColor: `${row.groupColor}15`,
                              color: row.groupColor,
                            }}
                          >
                            {row.groupName}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {row.courseName} • {money(row.price)} so'm
                        </div>
                        {row.isProrated && (
                          <div className="mt-1">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                              ⚡ Oy o'rtasida qo'shilgan (Darslar bo'yicha)
                            </span>
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400">
                          Ustoz: {row.teacherName}
                        </div>
                      </td>

                      {/* Paid so far */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-700 dark:text-slate-300">
                          {money(row.paidSoFar)} so'm
                        </div>
                        <div className="w-24 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              row.paidPercent > 50
                                ? "bg-amber-500"
                                : row.paidPercent > 0
                                ? "bg-rose-500"
                                : "bg-transparent"
                            }`}
                            style={{ width: `${row.paidPercent}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {row.paidPercent}% to'landi
                        </div>
                      </td>

                      {/* Remaining Debt */}
                      <td className="py-3.5 px-4 font-display font-extrabold text-sm text-rose-600 dark:text-rose-400">
                        {money(row.debtAmount)}{" "}
                        <span className="text-[10px] font-normal text-slate-400">so'm</span>
                      </td>

                      {/* Status / Overdue badge */}
                      <td className="py-3.5 px-4">
                        {row.isOverdue && (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 dark:bg-red-950/70 text-red-700 dark:text-red-400 border border-red-300/60 dark:border-red-900/50">
                              <ShieldAlert size={12} /> Muddati o'tgan
                            </span>
                            <div className="text-[10px] text-red-600 dark:text-red-400 font-bold">
                              {row.overdueDays} kun kechikkan
                            </div>
                          </div>
                        )}

                        {row.isDueToday && (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-400 border border-amber-300/60 dark:border-amber-900/50">
                              <Clock size={12} /> Bugun to'lash kuni
                            </span>
                          </div>
                        )}

                        {!row.isOverdue && !row.isDueToday && row.isPartial && (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/40">
                              <PieChart size={12} /> Qisman to'langan
                            </span>
                            <div className="text-[10px] text-slate-400">
                              {row.daysLeft} kun qoldi
                            </div>
                          </div>
                        )}

                        {!row.isOverdue && !row.isDueToday && !row.isPartial && (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                              ⏳ Kutilmoqda
                            </span>
                            <div className="text-[10px] text-slate-400">
                              {row.daysLeft} kun qoldi
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Payment Button */}
                          <button
                            onClick={() => handleOpenPayment(row)}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs transition-colors flex items-center gap-1"
                            title="To'lovni qabul qilish"
                          >
                            <CreditCard size={13} /> To'lov
                          </button>

                          {/* SMS Reminder Button */}
                          <button
                            onClick={() => handleOpenReminder(row)}
                            className="px-2.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold border border-indigo-200/60 dark:border-indigo-800 transition-colors flex items-center gap-1"
                            title="SMS/Telegram eslatma yuborish"
                          >
                            <MessageSquare size={13} /> Eslatma
                          </button>

                          {/* Call Button */}
                          <a
                            href={`tel:${row.parentPhone || row.studentPhone}`}
                            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                            title="Qo'ng'iroq qilish"
                          >
                            <Phone size={14} />
                          </a>
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
        {/* PAGINATION FOOTER                                         */}
        {/* ========================================================= */}
        <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3 bg-slate-50/50 dark:bg-slate-900/50">
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
              | Jami: <strong>{totalCount}</strong> nafar qarzdor
            </span>
          </div>

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
      {/* 5. UNIFIED MODAL: SETTLE DEBT PAYMENT                    */}
      {/* ========================================================= */}
      {paymentDebtor && (
        <RecordPaymentModal
          initialStudentId={paymentDebtor.studentId}
          initialGroupId={paymentDebtor.groupId}
          initialMonth={paymentDebtor.month}
          initialAmount={paymentDebtor.debtAmount}
          scopeBranches={scopeBranches}
          directorData={directorData}
          opData={opData}
          onSubmit={async (payload) => {
            if (onRecordPayment) {
              await onRecordPayment(payload);
            } else {
              await api.recordPayment(payload);
            }
            setPaymentDebtor(null);
            if (onRefresh) onRefresh();
          }}
          onClose={() => setPaymentDebtor(null)}
        />
      )}

      {/* ========================================================= */}
      {/* 6. MODAL: SEND SINGLE SMS / TELEGRAM REMINDER             */}
      {/* ========================================================= */}
      {reminderTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setReminderTarget(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-lg p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Send size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    SMS / Eslatma yuborish
                  </h3>
                  <p className="text-xs text-slate-400">
                    {reminderTarget.studentName} ({reminderTarget.groupName})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setReminderTarget(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSendReminder} className="space-y-3.5">
              {/* Recipient Choice */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Qabul qiluvchi
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setReminderRecipient("parent")}
                    className={`p-2.5 rounded-xl text-left border text-xs transition-all ${
                      reminderRecipient === "parent"
                        ? "border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 font-bold"
                        : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    <div className="font-bold">Ota-onasi</div>
                    <div className="text-[10px] text-slate-400">
                      {reminderTarget.parentName}: {reminderTarget.parentPhone}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReminderRecipient("student")}
                    className={`p-2.5 rounded-xl text-left border text-xs transition-all ${
                      reminderRecipient === "student"
                        ? "border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 font-bold"
                        : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    <div className="font-bold">O'quvchi o'zi</div>
                    <div className="text-[10px] text-slate-400">
                      {reminderTarget.studentName}: {reminderTarget.studentPhone}
                    </div>
                  </button>
                </div>
              </div>

              {/* Message text */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Xabar matni (SMS / Telegram)
                </label>
                <textarea
                  rows={4}
                  required
                  value={reminderMessage}
                  onChange={(e) => setReminderMessage(e.target.value)}
                  className={`${INPUT_CLS} text-xs font-sans`}
                />
              </div>

              {/* Quick Template Fillers */}
              <div className="flex gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() =>
                    setReminderMessage(
                      `Hurmatli ${reminderTarget.parentName}! Farzandingiz ${reminderTarget.studentName}ning ${reminderTarget.month} oyi uchun ${money(reminderTarget.debtAmount)} so'm to'lovi muddati o'tgan. Iltimos, tez orada to'lovni amalga oshiring. COSMOS LC.`
                    )
                  }
                  className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-[10px] font-semibold text-slate-700 dark:text-slate-300 rounded-xl"
                >
                  ⚡ Qisqa eslatma
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setReminderMessage(
                      `Assalomu alaykum! ${reminderTarget.studentName}ning ${reminderTarget.groupName} kursi bo'yicha to'lov muddati bugun. To'lovni Click/Payme orqali ham to'lashingiz mumkin. COSMOS LC.`
                    )
                  }
                  className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-[10px] font-semibold text-slate-700 dark:text-slate-300 rounded-xl"
                >
                  💳 Click/Payme eslatma
                </button>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setReminderTarget(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Bekor qilish
                </button>
                <PrimaryButton type="submit" disabled={sendingReminder}>
                  {sendingReminder ? "Yuborilmoqda..." : "Eslatmani yuborish"}
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. MODAL: BULK SMS REMINDER                               */}
      {/* ========================================================= */}
      {showBulkReminderModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowBulkReminderModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-md p-6 shadow-2xl space-y-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-sm">
              <Send size={26} />
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                Barcha qarzdorlarga SMS eslatma
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Jami <strong>{filteredDebtors.length} nafar</strong> qarzdor o'quvchilar va ularning ota-onalariga avtomatik eslatma yuborilsinmi?
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-600 dark:text-slate-300 text-left">
              <div className="flex justify-between font-semibold">
                <span>Qabul qiluvchilar:</span>
                <span>{filteredDebtors.length} ta o'quvchi/ota-ona</span>
              </div>
              <div className="flex justify-between font-semibold mt-1 text-rose-600 dark:text-rose-400">
                <span>Jami qarz summasi:</span>
                <span>{money(filteredDebtors.reduce((acc, r) => acc + r.debtAmount, 0))} so'm</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowBulkReminderModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={handleSendBulkReminders}
                disabled={bulkSending}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-colors"
              >
                {bulkSending ? "Yuborilmoqda..." : "Ha, barchaga yuborish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 8. SUCCESS TOAST NOTIFICATION                             */}
      {/* ========================================================= */}
      {reminderSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in slide-in-from-bottom duration-300">
          <CheckCircle2 size={16} /> Eslatma muvaffaqiyatli yuborildi!
        </div>
      )}
    </div>
  );
}

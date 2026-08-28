import { useState, useMemo } from "react";
import {
  DollarSign,
  Wallet,
  TrendingUp,
  TrendingDown,
  Users,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Plus,
  Search,
  PieChart,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  CreditCard,
  Building2,
  X,
  Check,
  Filter,
  Receipt,
  FileSpreadsheet,
  Clock,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { INPUT_CLS, LABEL_CLS, PrimaryButton } from "../theme/tokens";
import { EXPENSE_CATEGORIES } from "../utils/constants";
import { money, formatDate, todayISO } from "../utils/helpers";

const MONTHS_UZ = [
  "Yanvar",
  "Fevral",
  "Mart",
  "Aprel",
  "May",
  "Iyun",
  "Iyul",
  "Avgust",
  "Sentabr",
  "Oktyabr",
  "Noyabr",
  "Dekabr",
];

const CATEGORY_COLORS = {
  "O'qituvchilar maoshi": { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200", bar: "#6366f1" },
  "Menejerlar maoshi": { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200", bar: "#0ea5e9" },
  "Qaytarmalar (Refund)": { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", bar: "#f43f5e" },
  "Ijara": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", bar: "#f59e0b" },
  "Kommunal": { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200", bar: "#14b8a6" },
  "Reklama": { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", bar: "#a855f7" },
  "Jihozlar": { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", bar: "#f97316" },
  "Kantselyariya": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", bar: "#3b82f6" },
  "Soliqlar": { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", bar: "#ef4444" },
  "Boshqa": { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200", bar: "#64748b" },
};

export function FinancePage({
  role = "manager",
  scopeBranchIds = [],
  directorData,
  opData,
  allBranches = [],
  addFinance,
  approveFinance,
  rejectFinance,
  onRefresh,
}) {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth()); // 0-11 or 'all'
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Table search & filter states
  const [searchTushum, setSearchTushum] = useState("");
  const [searchChiqim, setSearchChiqim] = useState("");
  const [chiqimTab, setChiqimTab] = useState("categories"); // 'categories' | 'records'
  const [tushumMethodFilter, setTushumMethodFilter] = useState("all"); // 'all' | 'cash' | 'card'

  // Form states for new expense
  const scopedBranches = (allBranches.length > 0 ? allBranches : directorData?.branches || []).filter(
    (b) => scopeBranchIds.length === 0 || scopeBranchIds.includes(b.id)
  );

  const [formBranchId, setFormBranchId] = useState(scopedBranches[0]?.id || "");
  const [formAmount, setFormAmount] = useState("");
  const [formCategory, setFormCategory] = useState(EXPENSE_CATEGORIES[0] || "Boshqa");
  const [formNote, setFormNote] = useState("");
  const [formDate, setFormDate] = useState(todayISO());
  const [formApprovalMode, setFormApprovalMode] = useState(role === "director" ? "approved" : "manager");
  const [formError, setFormError] = useState("");

  // Handle refresh
  function handleRefreshClick() {
    setRefreshing(true);
    if (onRefresh) onRefresh();
    setTimeout(() => setRefreshing(false), 600);
  }

  // 1. DATA EXTRACTION & BRANCH SCOPING
  const allFinance = directorData?.finance || [];
  const allPayments = directorData?.payments || [];
  const allTeacherPayments = directorData?.teacherPayments || [];
  const allManagerPayments = directorData?.managerPayments || [];
  const allStudents = opData?.students || [];
  const allGroups = opData?.groups || [];

  const scopedFinance = allFinance.filter(
    (f) => scopeBranchIds.length === 0 || scopeBranchIds.includes(f.branchId)
  );
  const scopedGroups = allGroups.filter(
    (g) => scopeBranchIds.length === 0 || scopeBranchIds.includes(g.branchId)
  );
  const scopedGroupIds = scopedGroups.map((g) => g.id);

  const scopedPayments = allPayments.filter(
    (p) =>
      scopeBranchIds.length === 0 ||
      scopeBranchIds.includes(p.branchId) ||
      scopedGroupIds.includes(p.groupId)
  );

  // Pending director approvals
  const pendingApprovals = scopedFinance.filter((f) => f.status === "pending");

  // Available years
  const availableYears = useMemo(() => {
    const years = new Set([now.getFullYear(), now.getFullYear() - 1, now.getFullYear() + 1]);
    scopedPayments.forEach((p) => {
      if (p.date) {
        const y = new Date(p.date).getFullYear();
        if (!isNaN(y)) years.add(y);
      }
    });
    scopedFinance.forEach((f) => {
      if (f.date) {
        const y = new Date(f.date).getFullYear();
        if (!isNaN(y)) years.add(y);
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [scopedPayments, scopedFinance, now]);

  // Helper to check if a date string falls in selected month & year
  function isInSelectedPeriod(dateStr) {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return false;
    if (d.getFullYear() !== Number(selectedYear)) return false;
    if (selectedMonth !== "all" && d.getMonth() !== Number(selectedMonth)) return false;
    return true;
  }

  // ----------------------------------------------------
  // EXACT FINANCIAL CALCULATIONS ACCORDING TO REQUIREMENTS:
  // 1. Tushum: FAQAT paymentdan (only student income payments)
  // 2. Chiqim: Maoshlar + Xarajatlar + Refund orqali
  // 3. Sof Natija: Tushum - Chiqim
  // 4. Markaz Balansi: Real hisob (All-time cumulative total payments - total expenses, salaries, refunds)
  // ----------------------------------------------------

  // ALL-TIME REAL CALCULATIONS FOR MARKAZ BALANSI
  const allTimeStudentPayments = scopedPayments
    .filter((p) => !p.isRefund && p.type !== "refund" && (p.amount || 0) > 0)
    .reduce((s, p) => s + (p.amount || 0), 0);

  const allTimeRefunds =
    scopedPayments
      .filter((p) => p.isRefund || p.type === "refund" || (p.amount || 0) < 0)
      .reduce((s, p) => s + Math.abs(p.amount || 0), 0) +
    scopedFinance
      .filter(
        (f) =>
          (f.type === "refund" || f.category === "refund" || (f.category || "").toLowerCase().includes("refund")) &&
          f.status === "approved"
      )
      .reduce((s, f) => s + Math.abs(f.amount || 0), 0);

  const allTimeTeacherSalaries = allTeacherPayments.reduce((s, p) => s + (p.amount || 0), 0);
  const allTimeManagerSalaries = allManagerPayments.reduce((s, p) => s + (p.amount || 0), 0);
  const allTimeApprovedExpenses = scopedFinance
    .filter(
      (f) =>
        f.type === "expense" &&
        f.status === "approved" &&
        f.category !== "refund" &&
        !(f.category || "").toLowerCase().includes("refund")
    )
    .reduce((s, f) => s + (f.amount || 0), 0);

  const allTimeTotalOutflow =
    allTimeTeacherSalaries + allTimeManagerSalaries + allTimeApprovedExpenses + allTimeRefunds;

  const markazBalansi = allTimeStudentPayments - allTimeTotalOutflow;

  // PERIOD SPECIFIC CALCULATIONS
  // A. TUSHUM (Faqat to'lovlardan)
  const periodIncomingPayments = scopedPayments.filter(
    (p) =>
      !p.isRefund &&
      p.type !== "refund" &&
      (p.amount || 0) > 0 &&
      isInSelectedPeriod(p.date)
  );
  const periodTushum = periodIncomingPayments.reduce((s, p) => s + (p.amount || 0), 0);

  // B. CHIQIM (Maoshlar + Xarajatlar + Refund)
  const periodTeacherSalaries = allTeacherPayments
    .filter((tp) => isInSelectedPeriod(tp.date))
    .reduce((s, tp) => s + (tp.amount || 0), 0);

  const periodManagerSalaries = allManagerPayments
    .filter((mp) => isInSelectedPeriod(mp.date))
    .reduce((s, mp) => s + (mp.amount || 0), 0);

  const periodApprovedExpensesList = scopedFinance.filter(
    (f) =>
      f.type === "expense" &&
      f.status === "approved" &&
      f.category !== "refund" &&
      !(f.category || "").toLowerCase().includes("refund") &&
      isInSelectedPeriod(f.date)
  );
  const periodApprovedExpenses = periodApprovedExpensesList.reduce(
    (s, f) => s + (f.amount || 0),
    0
  );

  const periodRefundPayments = scopedPayments.filter(
    (p) =>
      (p.isRefund || p.type === "refund" || (p.amount || 0) < 0) &&
      isInSelectedPeriod(p.date)
  );
  const periodFinanceRefunds = scopedFinance.filter(
    (f) =>
      (f.type === "refund" || f.category === "refund" || (f.category || "").toLowerCase().includes("refund")) &&
      f.status === "approved" &&
      isInSelectedPeriod(f.date)
  );
  const periodRefunds =
    periodRefundPayments.reduce((s, p) => s + Math.abs(p.amount || 0), 0) +
    periodFinanceRefunds.reduce((s, f) => s + Math.abs(f.amount || 0), 0);

  const periodChiqim =
    periodTeacherSalaries + periodManagerSalaries + periodApprovedExpenses + periodRefunds;

  // C. SOF NATIJA (Tushum - Chiqim)
  const periodSofNatija = periodTushum - periodChiqim;

  // ----------------------------------------------------
  // SECOND ROW: STUDENT METRIC CARDS (Clean card style, no heavy borders)
  // ----------------------------------------------------
  const scopedStudents = allStudents.filter((s) => {
    if (s.branchId && (scopeBranchIds.length === 0 || scopeBranchIds.includes(s.branchId))) return true;
    return (s.groupIds || []).some((gid) => scopedGroupIds.includes(gid));
  });

  const faolOquvchilar = scopedStudents.filter(
    (s) => (s.groupIds || []).length > 0 && s.status !== "churn" && s.status !== "frozen"
  );

  const studentPaymentsMap = useMemo(() => {
    const map = new Map();
    periodIncomingPayments.forEach((p) => {
      const sId = p.studentId || p.student_id;
      if (sId) {
        map.set(sId, (map.get(sId) || 0) + (p.amount || 0));
      }
    });
    return map;
  }, [periodIncomingPayments]);

  const tolovQilganlar = faolOquvchilar.filter(
    (s) => (studentPaymentsMap.get(s.id) || 0) > 0
  );

  const umumanTolamaganlar = faolOquvchilar.filter(
    (s) => (studentPaymentsMap.get(s.id) || 0) === 0
  );

  const qarzdorlar = faolOquvchilar.filter((s) => {
    const paid = studentPaymentsMap.get(s.id) || 0;
    return paid === 0 || (s.balance || 0) < 0;
  });

  // ----------------------------------------------------
  // LEFT COLUMN: CHIQIMLAR TABLE & CATEGORY DATA
  // ----------------------------------------------------
  const chiqimCategoryBreakdown = useMemo(() => {
    const categoriesMap = new Map();

    if (periodTeacherSalaries > 0) {
      categoriesMap.set("O'qituvchilar maoshi", {
        name: "O'qituvchilar maoshi",
        icon: Users,
        color: CATEGORY_COLORS["O'qituvchilar maoshi"].bar,
        amount: periodTeacherSalaries,
        count: allTeacherPayments.filter((tp) => isInSelectedPeriod(tp.date)).length,
      });
    }

    if (periodManagerSalaries > 0) {
      categoriesMap.set("Menejerlar maoshi", {
        name: "Menejerlar maoshi",
        icon: Building2,
        color: CATEGORY_COLORS["Menejerlar maoshi"].bar,
        amount: periodManagerSalaries,
        count: allManagerPayments.filter((mp) => isInSelectedPeriod(mp.date)).length,
      });
    }

    if (periodRefunds > 0) {
      categoriesMap.set("Qaytarmalar (Refund)", {
        name: "Qaytarmalar (Refund)",
        icon: RotateCcw,
        color: CATEGORY_COLORS["Qaytarmalar (Refund)"].bar,
        amount: periodRefunds,
        count: periodRefundPayments.length + periodFinanceRefunds.length,
      });
    }

    periodApprovedExpensesList.forEach((f) => {
      const catName = f.category || "Boshqa";
      const config = CATEGORY_COLORS[catName] || CATEGORY_COLORS["Boshqa"];
      const existing = categoriesMap.get(catName) || {
        name: catName,
        icon: PieChart,
        color: config.bar,
        amount: 0,
        count: 0,
      };
      existing.amount += f.amount || 0;
      existing.count += 1;
      categoriesMap.set(catName, existing);
    });

    return Array.from(categoriesMap.values()).sort((a, b) => b.amount - a.amount);
  }, [
    periodTeacherSalaries,
    periodManagerSalaries,
    periodRefunds,
    periodApprovedExpensesList,
    allTeacherPayments,
    allManagerPayments,
    periodRefundPayments,
    periodFinanceRefunds,
  ]);

  const allChiqimRecords = useMemo(() => {
    const list = [];

    // Teacher salaries
    allTeacherPayments
      .filter((tp) => isInSelectedPeriod(tp.date))
      .forEach((tp) => {
        const teacher = directorData?.teachersHR?.find((t) => t.id === tp.teacherId);
        list.push({
          id: tp.id || `tp-${Math.random()}`,
          category: "O'qituvchilar maoshi",
          title: teacher?.name ? `${teacher.name} (Oylik)` : "O'qituvchi oyligi",
          note: tp.note || `${MONTHS_UZ[selectedMonth === "all" ? 0 : selectedMonth]} oyligi`,
          amount: tp.amount || 0,
          date: tp.date,
          type: "salary",
        });
      });

    // Manager salaries
    allManagerPayments
      .filter((mp) => isInSelectedPeriod(mp.date))
      .forEach((mp) => {
        const manager = directorData?.managers?.find((m) => m.id === mp.managerId);
        list.push({
          id: mp.id || `mp-${Math.random()}`,
          category: "Menejerlar maoshi",
          title: manager?.name ? `${manager.name} (Oylik)` : "Menejer oyligi",
          note: mp.note || `${MONTHS_UZ[selectedMonth === "all" ? 0 : selectedMonth]} oyligi`,
          amount: mp.amount || 0,
          date: mp.date,
          type: "salary",
        });
      });

    // Operational expenses
    periodApprovedExpensesList.forEach((f) => {
      const branch = (allBranches.length > 0 ? allBranches : directorData?.branches || []).find(
        (b) => b.id === f.branchId
      );
      list.push({
        id: f.id,
        category: f.category || "Boshqa",
        title: f.category || "Xarajat",
        note: f.note ? `${f.note} ${branch ? `(${branch.name})` : ""}` : branch?.name || "",
        amount: f.amount || 0,
        date: f.date,
        type: "operational",
      });
    });

    // Refunds
    periodRefundPayments.forEach((p) => {
      const student = allStudents.find((s) => s.id === (p.studentId || p.student_id));
      list.push({
        id: p.id,
        category: "Qaytarmalar (Refund)",
        title: student?.name ? `${student.name} (Qaytarma)` : "To'lov qaytarmasi",
        note: p.note || "O'quvchiga to'lov qaytarildi",
        amount: Math.abs(p.amount || 0),
        date: p.date,
        type: "refund",
      });
    });

    periodFinanceRefunds.forEach((f) => {
      list.push({
        id: f.id,
        category: "Qaytarmalar (Refund)",
        title: f.note || "Qaytarma",
        note: "Moliyaviy qaytarma",
        amount: Math.abs(f.amount || 0),
        date: f.date,
        type: "refund",
      });
    });

    let filtered = list;
    if (searchChiqim.trim()) {
      const q = searchChiqim.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.category.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          (c.note && c.note.toLowerCase().includes(q))
      );
    }

    return filtered.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [
    allTeacherPayments,
    allManagerPayments,
    periodApprovedExpensesList,
    periodRefundPayments,
    periodFinanceRefunds,
    directorData,
    allBranches,
    allStudents,
    searchChiqim,
    selectedMonth,
  ]);

  // ----------------------------------------------------
  // RIGHT COLUMN: TUSHUMLAR TABLE & PAYMENTS DATA (ONLY PAYMENTS)
  // ----------------------------------------------------
  const filteredTushumList = useMemo(() => {
    let list = periodIncomingPayments.map((p) => {
      const student = allStudents.find((s) => s.id === (p.studentId || p.student_id));
      const group = allGroups.find((g) => g.id === (p.groupId || p.group_id));
      return {
        id: p.id,
        studentName: student?.name || p.studentName || "Noma'lum o'quvchi",
        groupName: group?.name || p.groupName || "Asosiy guruh",
        amount: p.amount || 0,
        method: p.method || "cash",
        date: p.date,
      };
    });

    if (tushumMethodFilter !== "all") {
      list = list.filter((p) => p.method === tushumMethodFilter);
    }

    if (searchTushum.trim()) {
      const q = searchTushum.toLowerCase();
      list = list.filter(
        (item) =>
          item.studentName.toLowerCase().includes(q) ||
          item.groupName.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [periodIncomingPayments, allStudents, allGroups, searchTushum, tushumMethodFilter]);

  // Submit new expense
  function handleAddExpenseSubmit(e) {
    e.preventDefault();
    setFormError("");
    const amt = parseFloat(formAmount);
    if (!amt || amt <= 0) {
      setFormError("Iltimos, to'g'ri summa kiriting.");
      return;
    }
    const bId = formBranchId || scopedBranches[0]?.id;
    if (!bId && scopedBranches.length > 0) {
      setFormError("Filialni tanlang.");
      return;
    }

    if (addFinance) {
      addFinance({
        branchId: bId,
        type: "expense",
        amount: amt,
        category: formCategory,
        note: formNote.trim(),
        date: formDate,
        status: formApprovalMode === "approved" || role === "director" ? "approved" : "pending",
        approvalMode: formApprovalMode,
      });
    }

    setFormAmount("");
    setFormNote("");
    setShowForm(false);
  }

  return (
    <div className="space-y-6 pb-16">
      {/* ---------------------------------------------------- */}
      {/* TOP HEADER WITH MONTH & YEAR SELECTORS (TOP-RIGHT CORNER) */}
      {/* ---------------------------------------------------- */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <DollarSign size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Moliya Boshqaruvi
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                {role === "director" ? "Direktor Nazorati" : "Filial Moliya"}
              </span>
            </div>
          </div>
        </div>

        {/* TOP RIGHT CORNER: MONTH & YEAR SELECTOR + ACTIONS */}
        <div className="flex flex-wrap items-center gap-2.5 sm:self-auto self-start">
          {/* Year Selector */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-xs hover:border-slate-300 transition-colors">
            <span className="text-sm font-medium text-slate-400">Yil:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer pr-1 h-full"
            >
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}-yil
                </option>
              ))}
            </select>
          </div>

          {/* Month Selector */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-xs hover:border-slate-300 transition-colors">
            <Calendar size={15} className="text-slate-400 shrink-0" />
            <select
              value={selectedMonth}
              onChange={(e) =>
                setSelectedMonth(e.target.value === "all" ? "all" : Number(e.target.value))
              }
              className="bg-transparent text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer h-full"
            >
              <option value="all">Barcha oylar</option>
              {MONTHS_UZ.map((mName, idx) => (
                <option key={idx} value={idx}>
                  {mName}
                </option>
              ))}
            </select>
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={handleRefreshClick}
            className={`w-10 h-10 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 transition-all cursor-pointer shadow-xs ${
              refreshing ? "animate-spin text-indigo-600" : ""
            }`}
            title="Yangilash"
          >
            <RefreshCw size={15} />
          </button>

          {/* Add Expense Primary Button */}
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-xs hover:shadow transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>Xarajat qo'shish</span>
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* PENDING APPROVALS ALERT (FOR DIRECTOR) */}
      {/* ---------------------------------------------------- */}
      {role === "director" && pendingApprovals.length > 0 && (
        <div className="bg-amber-50/80 border-[1.2px] border-amber-400/80 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Clock className="text-amber-600" size={18} />
              <h3 className="font-bold text-amber-900 text-sm">
                Tasdiqlash kutilayotgan xarajatlar ({pendingApprovals.length} ta)
              </h3>
            </div>
            <span className="text-xs font-black text-amber-800 bg-amber-200/70 px-2.5 py-0.5 rounded-full">
              Jami: {money(pendingApprovals.reduce((s, f) => s + f.amount, 0))} so'm
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {pendingApprovals.map((f) => {
              const b = (allBranches.length > 0 ? allBranches : directorData?.branches || []).find(
                (x) => x.id === f.branchId
              );
              return (
                <div
                  key={f.id}
                  className="flex items-center justify-between gap-3 bg-white border border-amber-200/90 rounded-xl p-3 shadow-2xs"
                >
                  <div className="min-w-0">
                    <p className="text-slate-900 text-xs font-bold truncate">
                      {f.category} — {money(f.amount)} so'm
                    </p>
                    <p className="text-slate-500 text-[11px] truncate">
                      {b?.name || "Filial"} · {formatDate(f.date)}
                      {f.note ? ` · ${f.note}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    {approveFinance && (
                      <button
                        onClick={() => approveFinance(f.id)}
                        className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                      >
                        <Check size={13} /> Tasdiqlash
                      </button>
                    )}
                    {rejectFinance && (
                      <button
                        onClick={() => rejectFinance(f.id)}
                        className="w-7 h-7 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 flex items-center justify-center cursor-pointer"
                        title="Rad etish"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* ROW 1: 4 MAIN FINANCIAL CARDS */}
      {/* 1. Markaz balansi, 2. Tushum, 3. Chiqim, 4. Sof natija */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {/* CARD 1: MARKAZ BALANSI (Real Hisob) */}
        <div className="stat-card border-indigo-200/80 dark:border-indigo-900/40 bg-gradient-to-b from-indigo-50/30 to-white dark:from-indigo-950/20 dark:to-slate-900 p-4 rounded-xl shadow-sm hover:-translate-y-1 transition-all cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <div className="icon-badge w-[34px] h-[34px] rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-md">
              <Wallet size={16} className="text-white" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
              Real Balans
            </span>
          </div>
          <div className="stat-value text-[19px] font-extrabold tracking-tight text-slate-900 dark:text-white mb-0.5">
            {money(markazBalansi)}{" "}
            <span className="text-xs font-medium text-slate-400">so'm</span>
          </div>
          <div className="stat-label text-xs font-bold text-slate-500 dark:text-slate-400">
            Markaz Balansi
          </div>
        </div>

        {/* CARD 2: TUSHUM (Faqat to'lovlardan) */}
        <div className="stat-card border-emerald-200/80 dark:border-emerald-900/40 bg-gradient-to-b from-emerald-50/30 to-white dark:from-emerald-950/20 dark:to-slate-900 p-4 rounded-xl shadow-sm hover:-translate-y-1 transition-all cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <div className="icon-badge w-[34px] h-[34px] rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-md">
              <ArrowDownLeft size={16} className="text-white" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
              To'lovlar
            </span>
          </div>
          <div className="stat-value text-[19px] font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400 mb-0.5">
            +{money(periodTushum)}{" "}
            <span className="text-xs font-medium text-slate-400">so'm</span>
          </div>
          <div className="stat-label text-xs font-bold text-slate-500 dark:text-slate-400">
            Tushum (To'lovlar)
          </div>
        </div>

        {/* CARD 3: CHIQIM (Maoshlar + Xarajatlar + Refund) */}
        <div className="stat-card border-rose-200/80 dark:border-rose-900/40 bg-gradient-to-b from-rose-50/30 to-white dark:from-rose-950/20 dark:to-slate-900 p-4 rounded-xl shadow-sm hover:-translate-y-1 transition-all cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <div className="icon-badge w-[34px] h-[34px] rounded-xl bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center shadow-md">
              <ArrowUpRight size={16} className="text-white" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300">
              Jami Chiqim
            </span>
          </div>
          <div className="stat-value text-[19px] font-extrabold tracking-tight text-rose-600 dark:text-rose-400 mb-0.5">
            -{money(periodChiqim)}{" "}
            <span className="text-xs font-medium text-slate-400">so'm</span>
          </div>
          <div className="stat-label text-xs font-bold text-slate-500 dark:text-slate-400">
            Chiqim
          </div>
        </div>

        {/* CARD 4: SOF NATIJA (Tushum - Chiqim) */}
        <div className="stat-card border-teal-200/80 dark:border-teal-900/40 bg-gradient-to-b from-teal-50/30 to-white dark:from-teal-950/20 dark:to-slate-900 p-4 rounded-xl shadow-sm hover:-translate-y-1 transition-all cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <div className="icon-badge w-[34px] h-[34px] rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-md">
              <TrendingUp size={16} className="text-white" />
            </div>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-xl ${
                periodSofNatija >= 0
                  ? "bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
              }`}
            >
              Sof Natija
            </span>
          </div>
          <div className="stat-value text-[19px] font-extrabold tracking-tight text-teal-600 dark:text-teal-400 mb-0.5">
            {periodSofNatija >= 0 ? "+" : ""}{money(periodSofNatija)}{" "}
            <span className="text-xs font-medium text-slate-400">so'm</span>
          </div>
          <div className="stat-label text-xs font-bold text-slate-500 dark:text-slate-400">
            Sof Natija (Foyda / Ziyon)
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* ROW 2: STUDENT METRIC CARDS */}
      {/* 1. Faol o'quvchilar, 2. To'lov qilganlar, 3. Qarzdorlar, 4. Umuman to'lamaganlar */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {/* CARD 1: FAOL O'QUVCHILAR */}
        <div className="stat-card border-sky-200/80 dark:border-sky-900/40 bg-gradient-to-b from-sky-50/30 to-white dark:from-sky-950/20 dark:to-slate-900 p-4 rounded-xl shadow-sm hover:-translate-y-1 transition-all cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <div className="icon-badge w-[34px] h-[34px] rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center shadow-md">
              <Users size={16} className="text-white" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300">
              Guruhlarda
            </span>
          </div>
          <div className="stat-value text-[19px] font-extrabold tracking-tight text-slate-900 dark:text-white mb-0.5">
            {faolOquvchilar.length}{" "}
            <span className="text-xs font-medium text-slate-400">nafar</span>
          </div>
          <div className="stat-label text-xs font-bold text-slate-500 dark:text-slate-400">
            Faol O'quvchilar
          </div>
        </div>

        {/* CARD 2: TO'LOV QILGANLAR */}
        <div className="stat-card border-emerald-200/80 dark:border-emerald-900/40 bg-gradient-to-b from-emerald-50/30 to-white dark:from-emerald-950/20 dark:to-slate-900 p-4 rounded-xl shadow-sm hover:-translate-y-1 transition-all cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <div className="icon-badge w-[34px] h-[34px] rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-md">
              <CheckCircle2 size={16} className="text-white" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
              {faolOquvchilar.length > 0
                ? `${Math.round((tolovQilganlar.length / faolOquvchilar.length) * 100)}% to'landi`
                : "0%"}
            </span>
          </div>
          <div className="stat-value text-[19px] font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400 mb-0.5">
            {tolovQilganlar.length}{" "}
            <span className="text-xs font-medium text-slate-400">nafar</span>
          </div>
          <div className="stat-label text-xs font-bold text-slate-500 dark:text-slate-400">
            To'lov Qilganlar
          </div>
        </div>

        {/* CARD 3: QARZDORLAR */}
        <div className="stat-card border-amber-200/80 dark:border-amber-900/40 bg-gradient-to-b from-amber-50/30 to-white dark:from-amber-950/20 dark:to-slate-900 p-4 rounded-xl shadow-sm hover:-translate-y-1 transition-all cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <div className="icon-badge w-[34px] h-[34px] rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md">
              <AlertTriangle size={16} className="text-white" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
              {faolOquvchilar.length > 0
                ? `${Math.round((qarzdorlar.length / faolOquvchilar.length) * 100)}% qarz`
                : "0%"}
            </span>
          </div>
          <div className="stat-value text-[19px] font-extrabold tracking-tight text-amber-600 dark:text-amber-400 mb-0.5">
            {qarzdorlar.length}{" "}
            <span className="text-xs font-medium text-slate-400">nafar</span>
          </div>
          <div className="stat-label text-xs font-bold text-slate-500 dark:text-slate-400">
            Qarzdorlar
          </div>
        </div>

        {/* CARD 4: UMUMAN TO'LAMAGANLAR */}
        <div className="stat-card border-rose-200/80 dark:border-rose-900/40 bg-gradient-to-b from-rose-50/30 to-white dark:from-rose-950/20 dark:to-slate-900 p-4 rounded-xl shadow-sm hover:-translate-y-1 transition-all cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <div className="icon-badge w-[34px] h-[34px] rounded-xl bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center shadow-md">
              <XCircle size={16} className="text-white" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300">
              0 so'm
            </span>
          </div>
          <div className="stat-value text-[19px] font-extrabold tracking-tight text-rose-600 dark:text-rose-400 mb-0.5">
            {umumanTolamaganlar.length}{" "}
            <span className="text-xs font-medium text-slate-400">nafar</span>
          </div>
          <div className="stat-label text-xs font-bold text-slate-500 dark:text-slate-400">
            Umuman To'lamaganlar
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* TWO TABLES SECTION: LEFT (CHIQIMLAR) & RIGHT (TUSHUMLAR) */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* ==================================================== */}
        {/* LEFT TABLE: CHIQIMLAR TABLE (MAOSHLAR, XARAJATLAR, REFUND) */}
        {/* ==================================================== */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-4">
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-black shrink-0">
                <ArrowUpRight size={16} />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base">Chiqimlar</h3>
                <p className="text-[11px] text-slate-500">
                  {selectedMonth === "all" ? "Yillik" : MONTHS_UZ[selectedMonth]} maosh, xarajat va qaytarmalar
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Tab Switcher: Categories vs Detailed Records */}
              <div className="flex bg-slate-100 p-0.5 rounded-xl text-[11px] font-bold text-slate-600">
                <button
                  type="button"
                  onClick={() => setChiqimTab("categories")}
                  className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                    chiqimTab === "categories"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "hover:text-slate-900"
                  }`}
                >
                  Taqsimot
                </button>
                <button
                  type="button"
                  onClick={() => setChiqimTab("records")}
                  className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                    chiqimTab === "records"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "hover:text-slate-900"
                  }`}
                >
                  Yozuvlar ({allChiqimRecords.length})
                </button>
              </div>

              <span className="text-xs font-black text-rose-700 bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-200">
                -{money(periodChiqim)} so'm
              </span>
            </div>
          </div>

          {/* Search if in records mode */}
          {chiqimTab === "records" && (
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchChiqim}
                onChange={(e) => setSearchChiqim(e.target.value)}
                placeholder="Xarajat, maosh yoki refund qidiruvi..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {/* Content View: Category Breakdown vs Records Table */}
          {chiqimTab === "categories" ? (
            chiqimCategoryBreakdown.length === 0 ? (
              <div className="py-14 text-center text-slate-400 text-xs font-medium bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                Ushbu davr uchun hech qanday chiqim mavjud emas.
              </div>
            ) : (
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {chiqimCategoryBreakdown.map((item, index) => {
                  const pct =
                    periodChiqim > 0 ? Math.round((item.amount / periodChiqim) * 100) : 0;
                  const config = CATEGORY_COLORS[item.name] || CATEGORY_COLORS["Boshqa"];
                  const IconComp = item.icon || PieChart;

                  return (
                    <div
                      key={index}
                      className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/40 hover:bg-slate-50 transition-colors space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 font-bold text-slate-800">
                          <div
                            className="w-6 h-6 rounded-xl flex items-center justify-center text-white text-[10px]"
                            style={{ background: item.color || "#6366f1" }}
                          >
                            <IconComp size={12} />
                          </div>
                          <span>{item.name}</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            ({item.count} ta)
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <span className="font-black text-slate-900">
                            {money(item.amount)} so'm
                          </span>
                          <span
                            className={`text-[10px] font-black px-1.5 py-0.5 rounded border ${config.bg} ${config.text} ${config.border}`}
                          >
                            {pct}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-200/70 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            background: item.color || "#6366f1",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : allChiqimRecords.length === 0 ? (
            <div className="py-14 text-center text-slate-400 text-xs font-medium bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              Qidiruv bo'yicha hech qanday yozuv topilmadi.
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[380px] overflow-y-auto pr-1">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                    <th className="py-2.5 px-2">Nomi / Izoh</th>
                    <th className="py-2.5 px-2">Turi</th>
                    <th className="py-2.5 px-2">Sana</th>
                    <th className="py-2.5 px-2 text-right">Summa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allChiqimRecords.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-2 font-bold text-slate-900">
                        <div className="truncate max-w-[150px]">{item.title}</div>
                        {item.note && (
                          <div className="text-[10px] text-slate-400 font-normal truncate max-w-[150px]">
                            {item.note}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-xl border truncate inline-block max-w-[120px] ${
                            item.type === "refund"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : item.type === "salary"
                              ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                              : "bg-slate-100 text-slate-700 border-slate-200"
                          }`}
                        >
                          {item.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-slate-500 text-[11px] whitespace-nowrap">
                        {formatDate(item.date)}
                      </td>
                      <td className="py-2.5 px-2 text-right font-black text-rose-700 whitespace-nowrap">
                        -{money(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer stats */}
          <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500 font-medium">
            <span>Yozuvlar: {allChiqimRecords.length} ta</span>
            <span className="font-bold text-rose-700">Jami chiqim: -{money(periodChiqim)} so'm</span>
          </div>
        </div>

        {/* ==================================================== */}
        {/* RIGHT TABLE: TUSHUMLAR TABLE (FAQAT O'QUVCHI TO'LOVLARI) */}
        {/* ==================================================== */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-4">
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black shrink-0">
                <ArrowDownLeft size={16} />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base">Tushumlar (To'lovlar)</h3>
                <p className="text-[11px] text-slate-500">
                  O'quvchilardan tushgan to'lovlar ({filteredTushumList.length} ta)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                +{money(periodTushum)} so'm
              </span>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[140px]">
              <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTushum}
                onChange={(e) => setSearchTushum(e.target.value)}
                placeholder="O'quvchi yoki guruh..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Payment Method Filter */}
            <select
              value={tushumMethodFilter}
              onChange={(e) => setTushumMethodFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 py-1.5 px-2.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">Barcha usullar</option>
              <option value="cash">Naqd</option>
              <option value="card">Karta / O'tkazma</option>
            </select>
          </div>

          {/* Payments Table Body */}
          {filteredTushumList.length === 0 ? (
            <div className="py-14 text-center text-slate-400 text-xs font-medium bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              Ushbu davr bo'yicha hech qanday to'lov tushumi topilmadi.
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[380px] overflow-y-auto pr-1">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                    <th className="py-2.5 px-2">O'quvchi</th>
                    <th className="py-2.5 px-2">Guruh</th>
                    <th className="py-2.5 px-2">Usul</th>
                    <th className="py-2.5 px-2">Sana</th>
                    <th className="py-2.5 px-2 text-right">Summa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTushumList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-2 font-bold text-slate-900 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center font-bold text-[10px] shrink-0">
                          {item.studentName ? item.studentName[0].toUpperCase() : "O"}
                        </div>
                        <span className="truncate max-w-[130px] sm:max-w-[160px]">
                          {item.studentName}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-slate-600 font-medium truncate max-w-[100px]">
                        {item.groupName}
                      </td>
                      <td className="py-2.5 px-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-xl border ${
                            item.method === "card"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          {item.method === "card" ? "Karta" : "Naqd"}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-slate-500 text-[11px] whitespace-nowrap">
                        {formatDate(item.date)}
                      </td>
                      <td className="py-2.5 px-2 text-right font-black text-emerald-700 whitespace-nowrap">
                        +{money(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer stats */}
          <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500 font-medium">
            <span>To'lovlar soni: {filteredTushumList.length} ta</span>
            <span className="font-bold text-emerald-700">Jami tushum: +{money(periodTushum)} so'm</span>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* MODAL FOR ADDING NEW EXPENSE */}
      {/* ---------------------------------------------------- */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                <Plus className="text-rose-600" size={20} />
                <span>Yangi Xarajat Qo'shish</span>
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddExpenseSubmit} className="space-y-4 text-xs">
              {scopedBranches.length > 1 && (
                <div>
                  <label className={LABEL_CLS}>Filial *</label>
                  <select
                    value={formBranchId}
                    onChange={(e) => setFormBranchId(e.target.value)}
                    className={INPUT_CLS}
                  >
                    {scopedBranches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className={LABEL_CLS}>Summa (so'm) *</label>
                <input
                  type="number"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  placeholder="Masalan: 500000"
                  className={INPUT_CLS}
                  autoFocus
                />
              </div>

              <div>
                <label className={LABEL_CLS}>Xarajat Kategoriyasi *</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className={INPUT_CLS}
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={LABEL_CLS}>Sana *</label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className={INPUT_CLS}
                />
              </div>

              <div>
                <label className={LABEL_CLS}>Izoh / Maqsad</label>
                <textarea
                  rows={2}
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  placeholder="Xarajat sababi yoki to'lov maqsadi..."
                  className={INPUT_CLS}
                />
              </div>

              {role === "manager" && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Tasdiqlash tartibi:
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                      <input
                        type="radio"
                        name="approvalMode"
                        checked={formApprovalMode === "director"}
                        onChange={() => setFormApprovalMode("director")}
                        className="accent-indigo-600"
                      />
                      Direktor tasdig'iga yuborish
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                      <input
                        type="radio"
                        name="approvalMode"
                        checked={formApprovalMode === "manager"}
                        onChange={() => setFormApprovalMode("manager")}
                        className="accent-indigo-600"
                      />
                      To'g'ridan-to'g'ri o'tkazish
                    </label>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                >
                  Bekor qilish
                </button>
                <PrimaryButton type="submit">
                  Xarajatni Saqlash
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

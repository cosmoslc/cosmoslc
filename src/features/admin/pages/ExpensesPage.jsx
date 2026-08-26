import { useState, useMemo } from "react";
import {
  TrendingDown,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  Search,
  Filter,
  RefreshCw,
  Check,
  X,
  User,
  AlertCircle,
  FileText,
  DollarSign,
  Building2,
} from "lucide-react";
import { INPUT_CLS, LABEL_CLS, PrimaryButton } from "../theme/tokens";
import { money } from "../utils/helpers";

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

export function ExpensesPage({
  directorData,
  scopeBranchIds = [],
  approveFinance,
  rejectFinance,
}) {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth()); // 0-11 or 'all'

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'pending' | 'approved' | 'rejected'

  const allFinance = directorData?.finance || [];
  const allManagers = directorData?.managers || [];

  // Scoped Expenses List (type === 'expense')
  const scopedExpenses = useMemo(() => {
    return allFinance.filter(
      (f) =>
        f.type === "expense" &&
        (!scopeBranchIds || scopeBranchIds.length === 0 || scopeBranchIds.includes(f.branchId))
    );
  }, [allFinance, scopeBranchIds]);

  // Available Years
  const availableYears = useMemo(() => {
    const years = new Set([now.getFullYear(), now.getFullYear() - 1]);
    scopedExpenses.forEach((f) => {
      if (f.date) {
        const d = new Date(f.date);
        if (!isNaN(d.getTime())) years.add(d.getFullYear());
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [scopedExpenses, now]);

  // Helper: Filter by Month and Year
  function isInSelectedPeriod(dateStr) {
    if (!dateStr) return true;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return true;
    if (d.getFullYear() !== Number(selectedYear)) return false;
    if (selectedMonth !== "all" && d.getMonth() !== Number(selectedMonth)) return false;
    return true;
  }

  // ----------------------------------------------------
  // 1. TOP CARDS METRICS
  // ----------------------------------------------------
  const periodExpenses = scopedExpenses.filter((f) => isInSelectedPeriod(f.date));

  const totalApprovedAmount = periodExpenses
    .filter((f) => f.status === "approved")
    .reduce((s, f) => s + (f.amount || 0), 0);

  const pendingRequests = periodExpenses.filter((f) => f.status === "pending");
  const pendingRequestsAmount = pendingRequests.reduce((s, f) => s + (f.amount || 0), 0);

  const approvedCount = periodExpenses.filter((f) => f.status === "approved").length;
  const rejectedCount = periodExpenses.filter((f) => f.status === "rejected").length;

  // ----------------------------------------------------
  // 2. FILTERED EXPENSES FOR TABLE
  // ----------------------------------------------------
  const filteredExpenses = useMemo(() => {
    let list = periodExpenses.map((item) => {
      const manager = allManagers.find(
        (m) => m.id === item.managerId || m.id === item.createdBy
      );
      return {
        ...item,
        managerName:
          item.managerName ||
          manager?.name ||
          (item.approvalMode === "director" ? "Direktor" : "Menejer"),
      };
    });

    // Search Filter (Menejer, Sabab/Category, Izoh)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (f) =>
          (f.managerName || "").toLowerCase().includes(q) ||
          (f.category || "").toLowerCase().includes(q) ||
          (f.note || "").toLowerCase().includes(q)
      );
    }

    // Status Filter
    if (statusFilter !== "all") {
      list = list.filter((f) => f.status === statusFilter);
    }

    // Start Date Filter
    if (startDate) {
      list = list.filter((f) => f.date && f.date >= startDate);
    }

    // End Date Filter
    if (endDate) {
      list = list.filter((f) => f.date && f.date <= endDate);
    }

    return list.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [periodExpenses, allManagers, searchQuery, statusFilter, startDate, endDate]);

  // Clear All Filters
  function handleClearFilters() {
    setSearchQuery("");
    setStartDate("");
    setEndDate("");
    setStatusFilter("all");
  }

  return (
    <div className="space-y-6 pb-16">
      {/* ---------------------------------------------------- */}
      {/* TOP BAR WITH MONTH/YEAR SWITCHER */}
      {/* ---------------------------------------------------- */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-rose-600 to-red-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/25">
            <TrendingDown size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Xarajatlar Boshqaruvi
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                Audit & Tasdiqlash
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Filiallar bo'yicha barcha xarajatlar so'rovlari, tasdiqlar va moliyaviy audit
            </p>
          </div>
        </div>

        {/* TOP RIGHT CORNER: MONTH & YEAR SWITCHER */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Year Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-bold text-slate-500">Yil:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent text-xs font-black text-slate-800 focus:outline-none cursor-pointer"
            >
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}-yil
                </option>
              ))}
            </select>
          </div>

          {/* Month Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
            <Calendar size={14} className="text-slate-400" />
            <select
              value={selectedMonth}
              onChange={(e) =>
                setSelectedMonth(e.target.value === "all" ? "all" : Number(e.target.value))
              }
              className="bg-transparent text-xs font-black text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">Barcha oylar</option>
              {MONTHS_UZ.map((mName, idx) => (
                <option key={idx} value={idx}>
                  {mName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 4 TOP METRIC CARDS (ROW 1 - VIBRANT BORDER 1.2PX) */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Tasdiqlangan Xarajatlar */}
        <div className="relative overflow-hidden rounded-xl border-[1.2px] border-rose-500/40 bg-gradient-to-br from-rose-50/90 via-pink-50/40 to-white dark:from-rose-950/60 dark:via-pink-950/30 dark:to-slate-900 p-5 shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-600/20 group-hover:scale-110 transition-transform">
              <TrendingDown size={20} />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700 dark:text-rose-300 bg-rose-100/80 dark:bg-rose-900/50 px-2.5 py-1 rounded-full border border-rose-200 dark:border-rose-800">
              Jami Chiqim
            </span>
          </div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Tasdiqlangan Xarajatlar</span>
          <div className="text-2xl font-black text-rose-700 dark:text-rose-400 mt-1 tracking-tight">
            -{money(totalApprovedAmount)} <span className="text-xs font-bold text-slate-500 dark:text-slate-400">so'm</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Tanlangan davr uchun to'liq tasdiqlangan va to'langan xarajatlar
          </p>
        </div>

        {/* 2. Kutilayotgan So'rovlar */}
        <div className="relative overflow-hidden rounded-xl border-[1.2px] border-amber-500/40 bg-gradient-to-br from-amber-50/90 via-yellow-50/40 to-white dark:from-amber-950/60 dark:via-yellow-950/30 dark:to-slate-900 p-5 shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-110 transition-transform">
              <Clock size={20} />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-900/50 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800">
              Kutilmoqda
            </span>
          </div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Kutilayotgan So'rovlar</span>
          <div className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-1 tracking-tight">
            {pendingRequests.length} <span className="text-xs font-bold text-slate-500 dark:text-slate-400">ta ({money(pendingRequestsAmount)} so'm)</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Direktor tasdig'ini kutilayotgan xarajat so'rovlari
          </p>
        </div>

        {/* 3. Tasdiqlangan */}
        <div className="relative overflow-hidden rounded-xl border-[1.2px] border-emerald-500/40 bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-white dark:from-emerald-950/60 dark:via-teal-950/30 dark:to-slate-900 p-5 shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 group-hover:scale-110 transition-transform">
              <CheckCircle2 size={20} />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-900/50 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              Qabul Qilingan
            </span>
          </div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Tasdiqlangan So'rovlar</span>
          <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1 tracking-tight">
            {approvedCount} <span className="text-xs font-bold text-slate-500 dark:text-slate-400">ta xarajat</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Tasdiqlangan va ijro etilgan so'rovlar soni
          </p>
        </div>

        {/* 4. Rad Etilgan */}
        <div className="relative overflow-hidden rounded-xl border-[1.2px] border-slate-400/40 bg-gradient-to-br from-slate-50/90 via-slate-100/40 to-white dark:from-slate-900/90 dark:via-slate-800/60 dark:to-slate-900 p-5 shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-slate-600 text-white flex items-center justify-center shadow-md shadow-slate-600/20 group-hover:scale-110 transition-transform">
              <XCircle size={20} />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-slate-200/80 dark:bg-slate-800 px-2.5 py-1 rounded-full border border-slate-300 dark:border-slate-700">
              Rad Etilgan
            </span>
          </div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Rad Etilgan So'rovlar</span>
          <div className="text-2xl font-black text-slate-800 dark:text-slate-200 mt-1 tracking-tight">
            {rejectedCount} <span className="text-xs font-bold text-slate-500 dark:text-slate-400">ta xarajat</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Muvofiqlik yoki sabablarga ko'ra rad etilganlar
          </p>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* BUILT-IN FILTER SECTION (ABOVE TABLE) */}
      {/* ---------------------------------------------------- */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border-[1.2px] border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <Filter size={16} className="text-indigo-600" />
            <span>Xarajatlarni Qidirish va Filtrlash</span>
          </h3>
          <button
            type="button"
            onClick={handleClearFilters}
            className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 hover:bg-slate-100 px-2.5 py-1 rounded-xl transition-all cursor-pointer"
          >
            <RefreshCw size={12} /> Filterlarni Tozalash
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Search Filter */}
          <div className="space-y-1">
            <label className={LABEL_CLS}>Menejer, Sabab yoki Izoh</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Qidiruv so'zini kiriting..."
                className={`${INPUT_CLS} pl-9`}
              />
            </div>
          </div>

          {/* Boshlanish Sanasi */}
          <div className="space-y-1">
            <label className={LABEL_CLS}>Boshlanish Sanasi</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={INPUT_CLS}
            />
          </div>

          {/* Tugash Sanasi */}
          <div className="space-y-1">
            <label className={LABEL_CLS}>Tugash Sanasi</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={INPUT_CLS}
            />
          </div>

          {/* Holat Filter */}
          <div className="space-y-1">
            <label className={LABEL_CLS}>Holat Bo'yicha</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={INPUT_CLS}
            >
              <option value="all">Barcha Holatlar</option>
              <option value="pending">🟡 Kutilmoqda</option>
              <option value="approved">🟢 Tasdiqlangan</option>
              <option value="rejected">🔴 Rad Etilgan</option>
            </select>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* DETAILED EXPENSES TABLE */}
      {/* ---------------------------------------------------- */}
      <div className="bg-white rounded-xl border-[1.2px] border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Xarajatlar Ro'yxati</h3>
            <p className="text-xs text-slate-500">Menejerlar tomonidan kiritilgan va so'ralgan xarajatlar</p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl">
            Jami: {filteredExpenses.length} ta yozuv
          </span>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs font-medium space-y-2">
            <AlertCircle size={28} className="mx-auto text-slate-300" />
            <p>Filtr parametrlariga mos hech qanday xarajat topilmadi.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                  <th className="py-3 px-3">Menejer</th>
                  <th className="py-3 px-3">Sabab / Kategoriya</th>
                  <th className="py-3 px-3">Summa</th>
                  <th className="py-3 px-3">Holat</th>
                  <th className="py-3 px-3">So'ralgan Sana</th>
                  <th className="py-3 px-3">Izoh</th>
                  <th className="py-3 px-3 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExpenses.map((item) => {
                  let statusBadge = (
                    <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300/60 inline-flex items-center gap-1">
                      <Clock size={10} /> Kutilmoqda
                    </span>
                  );

                  if (item.status === "approved") {
                    statusBadge = (
                      <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300/60 inline-flex items-center gap-1">
                        <CheckCircle2 size={10} /> Tasdiqlangan
                      </span>
                    );
                  } else if (item.status === "rejected") {
                    statusBadge = (
                      <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300/60 inline-flex items-center gap-1">
                        <XCircle size={10} /> Rad Etilgan
                      </span>
                    );
                  }

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Menejer */}
                      <td className="py-3 px-3 font-extrabold text-slate-900 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {item.managerName ? item.managerName[0].toUpperCase() : "M"}
                        </div>
                        <span>{item.managerName}</span>
                      </td>

                      {/* Sabab / Kategoriya */}
                      <td className="py-3 px-3 font-bold text-slate-800">
                        {item.category || "Xarajat"}
                      </td>

                      {/* Summa */}
                      <td className="py-3 px-3 font-black text-rose-600 text-sm">
                        -{money(item.amount)} so'm
                      </td>

                      {/* Holat */}
                      <td className="py-3 px-3">{statusBadge}</td>

                      {/* So'ralgan Sana */}
                      <td className="py-3 px-3 text-slate-500 font-medium">
                        {item.date || "Sana ko'rsatilmadi"}
                      </td>

                      {/* Izoh */}
                      <td className="py-3 px-3 text-slate-600 font-medium max-w-[200px] truncate">
                        {item.note || "—"}
                      </td>

                      {/* Amallar */}
                      <td className="py-3 px-3 text-right">
                        {item.status === "pending" ? (
                          <div className="flex items-center justify-end gap-1.5">
                            {approveFinance && (
                              <button
                                type="button"
                                onClick={() => approveFinance(item.id)}
                                className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                                title="Tasdiqlash"
                              >
                                <Check size={12} /> Tasdiqlash
                              </button>
                            )}
                            {rejectFinance && (
                              <button
                                type="button"
                                onClick={() => rejectFinance(item.id)}
                                className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                                title="Rad etish"
                              >
                                <X size={12} /> Rad etish
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] font-semibold text-slate-400">
                            Bajarildi
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

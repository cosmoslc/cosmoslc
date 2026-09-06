const fs = require('fs');
const content = `import { useState, useMemo } from "react";
import {
  AlertCircle,
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
  CheckCircle2,
  MessageSquare,
  TrendingDown,
  ShieldAlert,
  Tag,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
} from "lucide-react";
import { INPUT_CLS, PrimaryButton } from "../theme/tokens";
import { money, normalizePhone } from "../utils/helpers";
import { opGroups } from "../utils/dataHelpers";
import { Avatar, EmptyState } from "../components/primitives";
import * as api from "../../../shared/api";

const NOTE_COLORS = [
  { value: "#ef4444", label: "Qizil" },
  { value: "#f97316", label: "Apelsin" },
  { value: "#eab308", label: "Sariq" },
  { value: "#22c55e", label: "Yashil" },
  { value: "#3b82f6", label: "Ko'k" },
  { value: "#8b5cf6", label: "Binafsha" },
  { value: "#ec4899", label: "Pushti" },
  { value: "#64748b", label: "Kulrang" },
];

export function DebtorsPage({
  scopeBranches = [],
  directorData = {},
  opData = {},
  openModal = () => {},
  onRefresh,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("highestDebt");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Note Modal
  const [noteTarget, setNoteTarget] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [noteColor, setNoteColor] = useState("#ef4444");
  const [noteTag, setNoteTag] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  // SMS Modal
  const [reminderTarget, setReminderTarget] = useState(null);
  const [reminderMessage, setReminderMessage] = useState("");
  const [reminderRecipient, setReminderRecipient] = useState("parent");
  const [sendingReminder, setSendingReminder] = useState(false);
  const [reminderSuccessToast, setReminderSuccessToast] = useState(false);

  // Data lookups
  const scopeIds = useMemo(() => scopeBranches.map((b) => b.id), [scopeBranches]);
  const courses = useMemo(() => {
    return (directorData?.courses || []).filter((c) =>
      scopeIds.length === 0 || scopeIds.includes(c.branchId)
    );
  }, [directorData?.courses, scopeIds]);
  const courseIds = useMemo(() => courses.map((c) => c.id), [courses]);
  const groups = useMemo(() => {
    return opGroups(opData).filter((g) => courseIds.length === 0 || courseIds.includes(g.courseId));
  }, [opData, courseIds]);

  const allStudents = useMemo(() => opData?.students || [], [opData?.students]);
  const currentDay = new Date().getDate();

  // Debtors Logic - strictly based on student.balance < 0
  const allDebtorRows = useMemo(() => {
    const debtors = allStudents.filter(s => Number(s.balance || 0) < 0);
    return debtors.map(s => {
      const debtAmount = Math.abs(Number(s.balance));
      const studentGroups = groups.filter(g => (s.groupIds || []).includes(g.id));
      
      const totalMonthlyFee = studentGroups.reduce((acc, g) => acc + Number(g.price || 0), 0);
      const groupNames = studentGroups.map(g => g.name).join(", ");
      
      const isDueToday = currentDay === 10;
      const isOverdue = debtAmount > totalMonthlyFee || currentDay > 10;
      const isPartial = debtAmount < totalMonthlyFee && debtAmount > 0;

      let severity = "normal";
      if (isOverdue) severity = "overdue";
      else if (isPartial) severity = "partial";
      else severity = "normal";

      return {
        id: s.id,
        studentId: s.id,
        studentName: s.name,
        studentPhone: s.phone || "",
        parentName: s.parentName || "Ota-onasi",
        parentPhone: s.parentPhone || s.phone || "",
        groupNames: groupNames || "Guruhsiz",
        debtAmount,
        debtNote: s.debtNote || null,
        severity,
        isDueToday,
        isOverdue,
        isPartial,
        groupColor: studentGroups[0]?.color || "#6366f1",
      };
    });
  }, [allStudents, groups, currentDay]);

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
      if (severityFilter === "overdue" && !row.isOverdue) return false;
      if (severityFilter === "dueToday" && !row.isDueToday) return false;
      if (severityFilter === "partial" && !row.isPartial) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const mStudent = row.studentName.toLowerCase().includes(q);
        const mPhone = normalizePhone(row.studentPhone).includes(normalizePhone(q));
        const mParent = (row.parentName || "").toLowerCase().includes(q);
        const mParentPhone = normalizePhone(row.parentPhone).includes(normalizePhone(q));
        const mGroup = row.groupNames.toLowerCase().includes(q);

        if (!mStudent && !mPhone && !mParent && !mParentPhone && !mGroup) {
          return false;
        }
      }

      return true;
    });
  }, [allDebtorRows, severityFilter, searchQuery]);

  // Sorted rows
  const sortedDebtors = useMemo(() => {
    return [...filteredDebtors].sort((a, b) => {
      if (sortBy === "highestDebt") return b.debtAmount - a.debtAmount;
      if (sortBy === "lowestDebt") return a.debtAmount - b.debtAmount;
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

  // Handlers
  function handleOpenPayment(debtor) {
    if (openModal) {
      openModal({
        type: "recordPayment",
        studentId: debtor.studentId,
        amount: debtor.debtAmount,
      });
    }
  }

  function handleOpenNote(debtor) {
    setNoteTarget(debtor);
    if (debtor.debtNote) {
      setNoteText(debtor.debtNote.text || "");
      setNoteColor(debtor.debtNote.color || "#ef4444");
      setNoteTag(debtor.debtNote.tag || "");
    } else {
      setNoteText("");
      setNoteColor("#ef4444");
      setNoteTag("");
    }
  }

  async function handleSaveNote(e) {
    e.preventDefault();
    if (!noteTarget) return;
    setSavingNote(true);
    try {
      await api.updateStudent(noteTarget.studentId, {
        debtNote: {
          text: noteText,
          color: noteColor,
          tag: noteTag,
        }
      });
      if (onRefresh) onRefresh();
      setNoteTarget(null);
    } catch (err) {
      console.error(err);
      alert("Xatolik yuz berdi");
    } finally {
      setSavingNote(false);
    }
  }

  function handleOpenReminder(debtor) {
    setReminderTarget(debtor);
    setReminderRecipient("parent");
    const defaultMsg = \`Hurmatli \${debtor.parentName || debtor.studentName}! \${debtor.studentName}ning \${money(debtor.debtAmount)} so'm o'quv to'lovi qoldig'i mavjud. Iltimos, to'lovni o'z vaqtida amalga oshirishingizni so'raymiz. COSMOS LC.\`;
    setReminderMessage(defaultMsg);
  }

  async function handleSendReminder(e) {
    e.preventDefault();
    if (!reminderTarget || !reminderMessage.trim()) return;
    setSendingReminder(true);
    try {
      await api.addNotification({
        title: \`SMS Eslatma: \${reminderTarget.studentName}\`,
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
      console.error(err);
    } finally {
      setSendingReminder(false);
    }
  }

  function handleResetFilters() {
    setSearchQuery("");
    setSeverityFilter("all");
    setSortBy("highestDebt");
    setCurrentPage(1);
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* 1. TOP HEADER */}
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
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => window.print()}
            className="px-4 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium border border-slate-200 dark:border-slate-700 flex items-center gap-2 transition-all shadow-xs"
          >
            <Printer size={15} /> Chop etish
          </button>
        </div>
      </div>

      {/* 2. KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3.5">
        <div className="stat-card border-slate-200/80 dark:border-slate-800 bg-gradient-to-b from-slate-50/50 to-white dark:from-slate-800/20 dark:to-slate-900 p-4 rounded-xl shadow-sm hover:-translate-y-1 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="w-[34px] h-[34px] rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center shadow-md">
              <Users size={16} className="text-white" />
            </div>
          </div>
          <div className="text-[19px] font-extrabold text-slate-900 dark:text-white mb-0.5">
            {kpis.jamiQarzdorlarSoni} <span className="text-xs font-medium text-slate-400">nafar</span>
          </div>
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Jami qarzdorlar
          </div>
        </div>

        <div className="stat-card border-rose-200/80 dark:border-rose-900/40 bg-gradient-to-b from-rose-50/30 to-white dark:from-rose-950/20 dark:to-slate-900 p-4 rounded-xl shadow-sm hover:-translate-y-1 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="w-[34px] h-[34px] rounded-xl bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center shadow-md">
              <TrendingDown size={16} className="text-white" />
            </div>
          </div>
          <div className="text-[19px] font-extrabold text-rose-600 dark:text-rose-400 mb-0.5">
            {money(kpis.umumiyQarzSummasi)} <span className="text-xs font-medium text-slate-400">so'm</span>
          </div>
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Qarzdorlik summasi
          </div>
        </div>

        <div className="stat-card border-indigo-200/80 dark:border-indigo-900/40 bg-gradient-to-b from-indigo-50/30 to-white dark:from-indigo-950/20 dark:to-slate-900 p-4 rounded-xl shadow-sm hover:-translate-y-1 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="w-[34px] h-[34px] rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-md">
              <PieChart size={16} className="text-white" />
            </div>
          </div>
          <div className="text-[19px] font-extrabold text-indigo-600 dark:text-indigo-400 mb-0.5">
            {kpis.qismanQarzdorlarSoni} <span className="text-xs font-medium text-slate-400">nafar</span>
          </div>
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Chala qarzdorlar
          </div>
        </div>

        <div className="stat-card border-red-200/80 dark:border-red-900/40 bg-gradient-to-b from-red-50/30 to-white dark:from-red-950/20 dark:to-slate-900 p-4 rounded-xl shadow-sm hover:-translate-y-1 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="w-[34px] h-[34px] rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-md">
              <ShieldAlert size={16} className="text-white" />
            </div>
          </div>
          <div className="text-[19px] font-extrabold text-red-600 dark:text-red-400 mb-0.5">
            {kpis.muddatiOtganSoni} <span className="text-xs font-medium text-slate-400">nafar</span>
          </div>
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Muddati o'tgan
          </div>
        </div>

        <div className="stat-card border-amber-200/80 dark:border-amber-900/40 bg-gradient-to-b from-amber-50/30 to-white dark:from-amber-950/20 dark:to-slate-900 p-4 rounded-xl shadow-sm hover:-translate-y-1 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="w-[34px] h-[34px] rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md">
              <Clock size={16} className="text-white" />
            </div>
          </div>
          <div className="text-[19px] font-extrabold text-amber-600 dark:text-amber-400 mb-0.5">
            {kpis.bugunTolovSoni} <span className="text-xs font-medium text-slate-400">nafar</span>
          </div>
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Bugun to'lashi kerak
          </div>
        </div>
      </div>

      {/* 3. FILTER TOOLBAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-xl shadow-sm space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
              <Filter size={13} /> Holat:
            </span>
            <button
              onClick={() => { setSeverityFilter("all"); setCurrentPage(1); }}
              className={\`px-3 py-1 rounded-xl text-xs font-bold transition-all \${severityFilter === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"}\`}
            >
              Barcha
            </button>
            <button
              onClick={() => { setSeverityFilter("overdue"); setCurrentPage(1); }}
              className={\`px-3 py-1 rounded-xl text-xs font-bold transition-all \${severityFilter === "overdue" ? "bg-red-600 text-white" : "bg-red-50 text-red-700"}\`}
            >
              Muddati o'tgan
            </button>
            <button
              onClick={() => { setSeverityFilter("partial"); setCurrentPage(1); }}
              className={\`px-3 py-1 rounded-xl text-xs font-bold transition-all \${severityFilter === "partial" ? "bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-700"}\`}
            >
              Chala to'lagan
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleResetFilters} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 bg-slate-100">
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="O'quvchi, telefon..."
              className={\`\${INPUT_CLS} pl-9 text-xs\`}
            />
          </div>
          <div>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={\`\${INPUT_CLS} text-xs\`}>
              <option value="highestDebt">Eng ko'p qarzdan kamiga ↓</option>
              <option value="lowestDebt">Eng kam qarzdan ko'piga ↑</option>
              <option value="name">O'quvchi ismi bo'yicha (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. TABLE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-slate-500 font-bold">
                <th className="py-3.5 px-4 w-12 text-center">
                  <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300" />
                </th>
                <th className="py-3.5 px-4">O'quvchi</th>
                <th className="py-3.5 px-4">Telefon raqam</th>
                <th className="py-3.5 px-4">Guruhlari</th>
                <th className="py-3.5 px-4">Balansi</th>
                <th className="py-3.5 px-4">Izoh</th>
                <th className="py-3.5 px-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedDebtors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <EmptyState icon={CheckCircle2} title="Qarzdorlar yo'q" subtitle="Barcha o'quvchilar balansi ijobiy." />
                  </td>
                </tr>
              ) : (
                paginatedDebtors.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 text-center">
                      <input type="checkbox" className="rounded text-indigo-600 border-slate-300" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div 
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={() => openModal && openModal({ type: 'studentProfile', studentId: row.studentId })}
                      >
                        <Avatar name={row.studentName} color={row.groupColor} size={32} />
                        <span className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                          {row.studentName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {row.studentPhone || "—"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                        {row.groupNames}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-rose-600 dark:text-rose-400">
                      -{money(row.debtAmount)} so'm
                    </td>
                    <td className="py-3.5 px-4">
                      {row.debtNote ? (
                        <div className="flex flex-col gap-1 items-start">
                          {row.debtNote.tag && (
                            <span 
                              className="px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-sm"
                              style={{ backgroundColor: row.debtNote.color || "#ef4444" }}
                            >
                              {row.debtNote.tag}
                            </span>
                          )}
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2" title={row.debtNote.text}>
                            {row.debtNote.text || "—"}
                          </p>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Izoh yo'q</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenNote(row)}
                          className="px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold transition-colors flex items-center gap-1"
                          title="Izoh qo'shish"
                        >
                          <Tag size={13} />
                        </button>
                        <button
                          onClick={() => handleOpenReminder(row)}
                          className="px-2 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold transition-colors flex items-center gap-1"
                          title="SMS yuborish"
                        >
                          <MessageSquare size={13} />
                        </button>
                        <button
                          onClick={() => handleOpenPayment(row)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-colors flex items-center gap-1"
                          title="Qarz to'lash"
                        >
                          <CreditCard size={13} /> To'lash
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Sahifada:</span>
            <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }} className="bg-white border border-slate-200 rounded-xl px-2 py-1 text-xs font-bold text-slate-700">
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1} className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 disabled:opacity-40 flex items-center gap-1">
              <ChevronLeft size={14} /> Oldingi
            </button>
            <span className="px-3 py-1 text-xs font-bold text-slate-700">
              {currentPage} / {totalPages}
            </span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 disabled:opacity-40 flex items-center gap-1">
              Keyingi <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* NOTE MODAL */}
      {noteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in" onClick={() => setNoteTarget(null)}>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Izoh qo'shish</h3>
              <button onClick={() => setNoteTarget(null)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveNote} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Izoh rangi</label>
                <div className="flex gap-2 flex-wrap">
                  {NOTE_COLORS.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setNoteColor(c.value)}
                      className={\`w-6 h-6 rounded-full transition-transform \${noteColor === c.value ? "scale-125 ring-2 ring-offset-2 ring-slate-400" : ""}\`}
                      style={{ backgroundColor: c.value }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Teg (qisqa so'z)</label>
                <input type="text" value={noteTag} onChange={e => setNoteTag(e.target.value)} placeholder="Masalan: Va'da berdi" className={\`\${INPUT_CLS} text-xs font-bold\`} style={{ color: noteColor }} maxLength={20} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">To'liq izoh</label>
                <textarea rows={3} value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Batafsil izoh yozing..." className={\`\${INPUT_CLS} text-xs\`} />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setNoteTarget(null)} className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-semibold text-slate-600">Bekor qilish</button>
                <PrimaryButton type="submit" disabled={savingNote}>{savingNote ? "Saqlanmoqda..." : "Saqlash"}</PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SMS MODAL */}
      {reminderTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in" onClick={() => setReminderTarget(null)}>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">SMS eslatma</h3>
              <button onClick={() => setReminderTarget(null)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <form onSubmit={handleSendReminder} className="space-y-4">
              <textarea rows={4} required value={reminderMessage} onChange={e => setReminderMessage(e.target.value)} className={\`\${INPUT_CLS} text-xs\`} />
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setReminderTarget(null)} className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-semibold text-slate-600">Bekor qilish</button>
                <PrimaryButton type="submit" disabled={sendingReminder}>{sendingReminder ? "Yuborilmoqda..." : "Yuborish"}</PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {reminderSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold">
          <CheckCircle2 size={16} /> Eslatma yuborildi!
        </div>
      )}
    </div>
  );
}
`
fs.writeFileSync('src/features/admin/pages/DebtorsPage.jsx', content);

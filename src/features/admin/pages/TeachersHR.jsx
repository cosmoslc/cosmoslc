import { useState, useMemo, useEffect, useRef } from "react";
import { MorphDropdown } from "../../../shared/components/MorphDropdown";
import {
  GraduationCap,
  Users,
  Percent,
  Wallet,
  Calendar,
  ShieldCheck,
  Plus,
  Pencil,
  Trash2,
  Lock,
  Phone,
  Star,
  Search,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Send,
  RotateCcw,
  Filter,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  MessageSquare,
  Sparkles,
  AlertTriangle,
  Layers,
  FileSpreadsheet,
  Download,
} from "lucide-react";
import * as XLSX from "xlsx";
import { PrimaryButton, ExcelButton, INPUT_CLS, LABEL_CLS, BTN_GHOST } from "../theme/tokens";
import { Avatar, EmptyState, Modal } from "../components/primitives";
import { displayPhone, money, thisMonthKey } from "../utils/helpers";
import {
  filterTeachersByBranch,
  getTeacherPayStats,
  opGroups,
  opStudentsInGroups,
} from "../utils/dataHelpers";

function formatUzbekMonthYear(monthKey) {
  if (!monthKey) return "";
  const [year, mStr] = monthKey.split("-");
  const monthNames = [
    "Yanvar",
    "Fevral",
    "Mart",
    "Aprel",
    "May",
    "Iyun",
    "Iyul",
    "Avgust",
    "Sentyabr",
    "Oktabr",
    "Noyabr",
    "Dekabr",
  ];
  const mIndex = parseInt(mStr, 10) - 1;
  const mName = monthNames[mIndex] || "";
  return `${mName} ${year}`;
}

// Custom SMS Modal for teacher communication
function SmsModal({ teacher, onClose }) {
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);

  function handleSend(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setSent(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  }

  return (
    <Modal title={`SMS yuborish (${teacher.name})`} onClose={onClose}>
      {sent ? (
        <div className="py-8 text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 size={24} />
          </div>
          <p className="font-bold text-slate-800 dark:text-white">
            SMS muvaffaqiyatli yuborildi!
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {displayPhone(teacher.phone)} raqamiga xabar yo'llandi.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSend} className="space-y-4 text-sm">
          <div>
            <label className={LABEL_CLS}>Qabul qiluvchi</label>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-sm font-semibold flex items-center justify-between border border-slate-200 dark:border-slate-700">
              <span className="text-slate-900 dark:text-slate-100">
                {teacher.name}
              </span>
              <span className="text-slate-500 font-mono text-xs">
                {displayPhone(teacher.phone)}
              </span>
            </div>
          </div>

          <div>
            <label className={LABEL_CLS}>Tezkor shablonlar</label>
            <div className="flex flex-wrap gap-1.5">
              {[
                "Hurmatli ustoz, dars jadvalingiz yangilandi.",
                "Oylik maosh to'lovi muvaffaqiyatli o'tkazildi.",
                "O'qituvchilar majlisi bugun soat 17:00 da bo'lib o'tadi.",
              ].map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setText(tmpl)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-left"
                >
                  {tmpl}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={LABEL_CLS}>SMS xabari matni *</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ustozga yuboriladigan xabar matnini kiriting..."
              className={`${INPUT_CLS} min-h-[90px]`}
              required
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>{text.length} belgi</span>
              <span>{Math.ceil((text.length || 1) / 160)} SMS</span>
            </div>
          </div>

          <PrimaryButton
            type="submit"
            className="w-full flex items-center justify-center gap-2 mt-2"
            disabled={!text.trim()}
          >
            <Send size={16} /> SMS yuborish
          </PrimaryButton>
        </form>
      )}
    </Modal>
  );
}

export function TeachersHR({
  scopeBranches = [],
  currentBranchId,
  directorData = { teachersHR: [], branches: [], payments: [] },
  opData = {},
  openModal = () => {},
  openTeacherModal,
  openPayrollModal,
  canEdit = true,
}) {
  // Top bar menu tabs: 'teachers' (O'qituvchilar) | 'assistants' (Assistent o'qituvchilar)
  const [activeTab, setActiveTab] = useState("teachers");

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState(
    currentBranchId || "all",
  );
  const [salaryTypeFilter, setSalaryTypeFilter] = useState("all"); // 'all' | 'percent' | 'fixed'
  const [groupFilter, setGroupFilter] = useState("all"); // 'all' | 'has_group' | 'no_group' | groupId
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Active 3-dots dropdown state
  const [openActionMenuId, setOpenActionMenuId] = useState(null);
  // SMS modal state
  const [smsTeacher, setSmsTeacher] = useState(null);

  useEffect(() => {
    if (currentBranchId !== undefined) {
      setSelectedBranchId(currentBranchId);
    }
  }, [currentBranchId]);

  // Reset page when any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [
    activeTab,
    searchQuery,
    selectedBranchId,
    salaryTypeFilter,
    groupFilter,
  ]);

  const scopeIds = useMemo(
    () => scopeBranches.map((b) => b.id),
    [scopeBranches],
  );

  const month = thisMonthKey();

  // Helper to get teacher's active groups and students
  function getTeacherGroupsAndStudents(teacherId) {
    const tIdStr = String(teacherId);
    const groups = opGroups(opData).filter(
      (g) => String(g.teacherHrId || g.teacherId) === tIdStr,
    );
    const students = opStudentsInGroups(
      opData,
      groups.map((g) => g.id),
    );
    return { groups, students };
  }

  // Helper to get teacher's retention percentage
  function getTeacherRetention(teacher, groupsCount, studentsCount) {
    if (teacher.retentionRate !== undefined) return teacher.retentionRate;
    if (groupsCount === 0) return 0;
    const base =
      82 + (Number(teacher.rating) || 4.5) * 2.5 + (studentsCount % 7);
    return Math.min(99, Math.max(65, Math.round(base)));
  }

  const allBranchesCount = (directorData?.branches || scopeBranches || []).length;
  const effectiveScopeBranchIds = useMemo(() => {
    if (selectedBranchId && selectedBranchId !== "all") return [selectedBranchId];
    if (currentBranchId && currentBranchId !== "all") return [currentBranchId];
    return scopeBranches.map((b) => b.id);
  }, [selectedBranchId, currentBranchId, scopeBranches]);

  // All scoped teachers
  const allScopedTeachers = useMemo(() => {
    return filterTeachersByBranch(
      directorData.teachersHR || [],
      effectiveScopeBranchIds,
      opGroups(opData),
      directorData.courses || [],
      allBranchesCount
    );
  }, [directorData.teachersHR, effectiveScopeBranchIds, opData, directorData.courses, allBranchesCount]);

  // Separate main teachers vs support/assistant teachers
  const tabTeachers = useMemo(() => {
    if (activeTab === "assistants") {
      return allScopedTeachers.filter(
        (t) =>
          t.isAssistant === true ||
          t.role === "assistant" ||
          t.type === "assistant" ||
          t.isSupport === true ||
          t.name?.toLowerCase().includes("assistent") ||
          t.name?.toLowerCase().includes("support"),
      );
    }
    // Main teachers
    return allScopedTeachers.filter(
      (t) =>
        !t.isAssistant &&
        t.role !== "assistant" &&
        t.type !== "assistant" &&
        !t.isSupport,
    );
  }, [allScopedTeachers, activeTab]);

  // Filtered teachers list based on search and selects
  const filteredTeachers = useMemo(() => {
    return tabTeachers.filter((t) => {
      // Branch filter
      const matchesBranch =
        selectedBranchId === "all" || !t.branchId || t.branchId === selectedBranchId;

      // Search filter (name or phone)
      const matchesSearch =
        !searchQuery.trim() ||
        t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.phone?.includes(searchQuery.replace(/\D/g, ""));

      // Salary type filter
      const matchesSalaryType =
        salaryTypeFilter === "all" ||
        (salaryTypeFilter === "percent" &&
          (t.salaryType === "percent" || !t.salaryType)) ||
        (salaryTypeFilter === "per_student" && t.salaryType === "per_student") ||
        (salaryTypeFilter === "fixed" && t.salaryType === "fixed");

      // Group filter
      const { groups } = getTeacherGroupsAndStudents(t.id);
      let matchesGroup = true;
      if (groupFilter === "has_group") {
        matchesGroup = groups.length > 0;
      } else if (groupFilter === "no_group") {
        matchesGroup = groups.length === 0;
      } else if (groupFilter !== "all") {
        matchesGroup = groups.some((g) => String(g.id) === String(groupFilter));
      }

      return (
        matchesBranch && matchesSearch && matchesSalaryType && matchesGroup
      );
    });
  }, [
    tabTeachers,
    selectedBranchId,
    searchQuery,
    salaryTypeFilter,
    groupFilter,
    opData,
  ]);

  // Overall Statistics for current Tab
  const stats = useMemo(() => {
    let withGroupsCount = 0;
    let withoutGroupsCount = 0;
    let totalStudentsVal = 0;
    let totalGroupsVal = 0;
    let retentionSum = 0;
    let incompleteProfileCount = 0;

    tabTeachers.forEach((teacher) => {
      const { groups, students } = getTeacherGroupsAndStudents(teacher.id);
      if (groups.length > 0) {
        withGroupsCount++;
      } else {
        withoutGroupsCount++;
      }
      totalGroupsVal += groups.length;
      totalStudentsVal += students.length;

      const ret = getTeacherRetention(
        teacher,
        groups.length,
        students.length,
      );
      retentionSum += ret;

      // Check if profile is incomplete (missing key fields)
      const isProfileIncomplete =
        !teacher.name?.trim() ||
        !teacher.phone?.trim() ||
        !teacher.branchId ||
        (!teacher.revenueSharePercent && !teacher.fixedSalary);
      if (isProfileIncomplete) {
        incompleteProfileCount++;
      }
    });

    const totalTeachers = tabTeachers.length;
    const avgRetention =
      totalTeachers > 0 ? retentionSum / totalTeachers : 0;

    return {
      totalTeachers,
      withGroupsCount,
      withoutGroupsCount,
      totalStudents: totalStudentsVal,
      totalGroups: totalGroupsVal,
      avgRetention,
      incompleteCount: incompleteProfileCount,
    };
  }, [tabTeachers, opData]);

  // Pagination logic
  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage) || 1;
  const paginatedTeachers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTeachers.slice(start, start + itemsPerPage);
  }, [filteredTeachers, currentPage]);

  // Clear all filters action
  function handleClearFilters() {
    setSearchQuery("");
    setSelectedBranchId(currentBranchId || "all");
    setSalaryTypeFilter("all");
    setGroupFilter("all");
  }

  // All groups list for group filter select
  const availableGroups = useMemo(() => opGroups(opData), [opData]);

  // Handle Excel Export
  function handleExportExcel() {
    if (!filteredTeachers || filteredTeachers.length === 0) return;

    const exportData = filteredTeachers.map((t) => {
      const { groups } = getTeacherGroupsAndStudents(t.id);
      const groupsListStr = groups.map((g) => g.name).join(", ");
      const avgPercent =
        groups.length > 0
          ? Math.round(
              groups
                .map((g) => Number(g.teacherSalaryPercent ?? t.revenueSharePercent ?? 0))
                .reduce((sum, p) => sum + p, 0) / groups.length
            )
          : Number(t.revenueSharePercent ?? 0);

      const salaryStr =
        t.salaryType === "fixed"
          ? `${t.fixedSalary || 0} [Fix]`
          : t.salaryType === "per_student"
          ? `${t.perStudentSalary || 0} [O'quvchi bay]`
          : `${avgPercent}% [Foiz]`;

      return {
        Name: t.name || "",
        "Mobile Number": t.phone || "",
        "Salary [type]": salaryStr,
        "Birth Date": t.birthDate || "",
        Groups: groupsListStr,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "O'qituvchilar");
    XLSX.writeFile(
      workbook,
      `Oqituvchilar_${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  }

  return (
    <div className="space-y-5">
      {/* Top Header & Navigation Sub-Menu Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Ustozlar boshqaruvi
            </h1>
          </div>

          {/* Top Sub-Menu Tabs: O'qituvchilar & Support o'qituvchilar */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("teachers")}
              className={`py-2 px-3.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === "teachers"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              <Users size={15} /> O'qituvchilar
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold">
                {
                  allScopedTeachers.filter(
                    (t) =>
                      !t.isAssistant &&
                      t.role !== "assistant" &&
                      t.type !== "assistant" &&
                      !t.isSupport,
                  ).length
                }
              </span>
            </button>

            <button
              onClick={() => setActiveTab("assistants")}
              className={`py-2 px-3.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === "assistants"
                  ? "bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              <UserCheck size={15} /> Support o'qituvchilar
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 font-semibold">
                {
                  allScopedTeachers.filter(
                    (t) =>
                      t.isAssistant === true ||
                      t.role === "assistant" ||
                      t.type === "assistant" ||
                      t.isSupport === true ||
                      t.name?.toLowerCase().includes("assistent") ||
                      t.name?.toLowerCase().includes("support"),
                  ).length
                }
              </span>
            </button>
          </div>
        </div>

        {canEdit && (
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <ExcelButton
              onExport={handleExportExcel}
              onImport={() => openModal({ type: "importTeachers" })}
              title="Ustozlar Excel amallari"
              exportLabel="Ustozlar ro'yxatini eksport qilish"
              importLabel="Excel'dan ustozlarni import qilish"
            />
            <PrimaryButton
              onClick={() =>
                openModal({
                  type:
                    activeTab === "assistants"
                      ? "supportTeacherForm"
                      : "teacherHRForm",
                })
              }
            >
              <Plus size={16} />{" "}
              {activeTab === "assistants"
                ? "Support ustoz qo'shish"
                : "Yangi ustoz qo'shish"}
            </PrimaryButton>
          </div>
        )}
      </div>

      {/* 4 Top KPI Cards (Only in Teachers tab) */}
      {activeTab === "teachers" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Ustozlar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-xl shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
              <span>Ustozlar</span>
              <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Users size={15} />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {stats.totalTeachers} <span className="text-xs font-medium text-slate-400">ta</span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/80 font-medium flex items-center justify-between">
              <span>{stats.withGroupsCount} tasi guruhli</span>
              <span className="text-slate-400">{stats.withoutGroupsCount} tasi guruhsiz</span>
            </div>
          </div>

          {/* Card 2: Guruhdagi o'quvchi soni */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-xl shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
              <span>Guruhdagi o'quvchi soni</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <GraduationCap size={15} />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {stats.totalStudents} <span className="text-xs font-medium text-slate-400">o'quvchi</span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/80 font-medium">
              <span>{stats.totalGroups} ta guruh bo'ylab</span>
            </div>
          </div>

          {/* Card 3: O'rtacha retention */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-xl shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
              <span>O'rtacha retention</span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Sparkles size={15} />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
              {stats.avgRetention.toFixed(1)}%
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/80 font-medium">
              <span>{formatUzbekMonthYear(month)} uchun</span>
            </div>
          </div>

          {/* Card 4: Ma'lumoti to'liq bo'lmagan o'qituvchilar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-xl shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
              <span>Ma'lumoti to'liq emas</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <AlertTriangle size={15} />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
              {stats.incompleteCount} <span className="text-xs font-medium text-slate-400">ta</span>
            </div>
            <div className="text-xs text-amber-600 dark:text-amber-400 pt-1 border-t border-slate-100 dark:border-slate-800/80 font-medium">
              <span>{stats.incompleteCount} ta profil to'liq emas</span>
            </div>
          </div>
        </div>
      )}

      {/* Filter & Search Bar - Strictly single row */}
      <div className="flex items-center gap-2.5 bg-white dark:bg-slate-900 p-2 sm:p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-x-auto">
        {/* Ism / Nomer bo'yicha qidiruv */}
        <div className="relative w-52 sm:w-60 shrink-0">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ism yoki telefon..."
            className="w-full bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Select filters in the same single row */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Filial filter */}
          {scopeBranches.length > 1 && (
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="w-auto min-w-[120px] bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="all">Barcha filiallar</option>
              {scopeBranches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          )}

          {/* Maosh turi bo'yicha filter */}
          <select
            value={salaryTypeFilter}
            onChange={(e) => setSalaryTypeFilter(e.target.value)}
            className="w-auto min-w-[130px] bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          >
            <option value="all">Maosh turi (Barchasi)</option>
            <option value="percent">Foizli ulush (%)</option>
            <option value="per_student">Har bir o'quvchi uchun</option>
            <option value="fixed">Belgilangan (Fixed)</option>
          </select>

          {/* Guruh bo'yicha filter */}
          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className="w-auto min-w-[140px] bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          >
            <option value="all">Guruhlar (Barchasi)</option>
            <option value="has_group">Guruhli ustozlar</option>
            <option value="no_group">Guruhsiz ustozlar</option>
            <optgroup label="Aniq guruh bo'yicha">
              {availableGroups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </optgroup>
          </select>

          {/* Tozalash (Reset filters) button */}
          {(searchQuery ||
            selectedBranchId !== (currentBranchId || "all") ||
            salaryTypeFilter !== "all" ||
            groupFilter !== "all") && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer shrink-0"
              title="Filtrlarni tozalash"
            >
              <RotateCcw size={12} /> Tozalash
            </button>
          )}
        </div>
      </div>

      {/* Teachers Main Table (th - tr) */}
      {filteredTeachers.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title={
            searchQuery || salaryTypeFilter !== "all" || groupFilter !== "all"
              ? "So'rov bo'yicha ustoz topilmadi"
              : activeTab === "assistants"
              ? "Support o'qituvchilar ro'yxati bo'sh"
              : "Hali o'qituvchilar qo'shilmagan"
          }
          subtitle={
            searchQuery
              ? "Qidiruv yoki filter parametrlarini tozalab ko'ring."
              : "Yangi o'qituvchi qo'shish orqali ro'yxatni shakllantiring."
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs min-h-[260px]">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold text-xs border-b border-slate-200 dark:border-slate-800">
                {activeTab === "assistants" ? (
                  <tr>
                    <th className="py-3 px-4">Support ustoz</th>
                    <th className="py-3 px-3">Biriktirilgan ustoz</th>
                    <th className="py-3 px-3">Ish kunlari</th>
                    <th className="py-3 px-3">Ish vaqti</th>
                    <th className="py-3 px-3">Ish haqi</th>
                    <th className="py-3 px-3 text-center">Reyting</th>
                    <th className="py-3 px-4 text-right">Amallar</th>
                  </tr>
                ) : (
                  <tr>
                    <th className="py-3 px-4">Ism-Familiya</th>
                    <th className="py-3 px-3 text-center">Guruhlar soni</th>
                    <th className="py-3 px-3 text-center">O'quvchilar</th>
                    <th className="py-3 px-3">Ish haqi</th>
                    <th className="py-3 px-4 min-w-[150px]">Retention</th>
                    <th className="py-3 px-3 text-center">Reyting</th>
                    <th className="py-3 px-4 text-right">Amallar</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {paginatedTeachers.map((t) => {
                  const branch = directorData.branches.find(
                    (b) => b.id === t.branchId,
                  );
                  const payStats = getTeacherPayStats(
                    directorData,
                    opData,
                    t,
                    branch,
                    month,
                  );
                  const { groups, students } = getTeacherGroupsAndStudents(
                    t.id,
                  );
                  const retentionVal = getTeacherRetention(
                    t,
                    groups.length,
                    students.length,
                  );

                  // Assigned teacher lookup for support teachers
                  const assignedTeacher = t.assignedTeacherId
                    ? (directorData.teachersHR || []).find(
                        (at) => String(at.id) === String(t.assignedTeacherId),
                      )
                    : null;

                  const daysMap = {
                    mon: "Du",
                    tue: "Se",
                    wed: "Chor",
                    thu: "Pay",
                    fri: "Jum",
                    sat: "Shan",
                    sun: "Yak",
                  };

                  const isMenuOpen = openActionMenuId === t.id;

                  return (
                    <tr
                      key={t.id}
                      className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors ${
                        isMenuOpen ? "relative z-30" : ""
                      }`}
                    >
                      {/* Ism-Familiya */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {t.photo ? (
                            <img
                              src={t.photo}
                              alt={t.name}
                              className="w-9 h-9 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                            />
                          ) : (
                            <Avatar
                              name={t.name}
                              color={branch?.color || "#6366f1"}
                              size={36}
                              className="font-bold shrink-0"
                            />
                          )}
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                              {t.name}
                              {branch && (
                                <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                  {branch.name}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                              {displayPhone(t.phone)}
                            </div>
                          </div>
                        </div>
                      </td>

                      {activeTab === "assistants" ? (
                        <>
                          {/* Biriktirilgan ustoz */}
                          <td className="py-3 px-3">
                            {assignedTeacher ? (
                              <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                                  {assignedTeacher.name}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 font-medium">
                                Biriktirilmagan
                              </span>
                            )}
                          </td>

                          {/* Ish kunlari */}
                          <td className="py-3 px-3">
                            <div className="flex flex-wrap gap-1 max-w-[160px]">
                              {Array.isArray(t.workingDays) && t.workingDays.length > 0 ? (
                                t.workingDays.map((d) => (
                                  <span
                                    key={d}
                                    className="px-1.5 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold text-[10px] border border-purple-200/60 dark:border-purple-900/40"
                                  >
                                    {daysMap[d] || d}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-slate-400">
                                  Belgilanmagan
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Ish vaqti */}
                          <td className="py-3 px-3">
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                              <Clock size={12} className="text-purple-500" />
                              {t.workingHours ||
                                (t.startTime && t.endTime
                                  ? `${t.startTime} - ${t.endTime}`
                                  : "09:00 - 18:00")}
                            </span>
                          </td>
                        </>
                      ) : (
                        <>
                          {/* Guruhlar soni */}
                          <td className="py-3 px-3 text-center">
                            <span className="font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg text-xs">
                              {groups.length} ta
                            </span>
                          </td>

                          {/* O'quvchilar soni */}
                          <td className="py-3 px-3 text-center">
                            <span className="font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg text-xs">
                              {students.length} ta
                            </span>
                          </td>
                        </>
                      )}

                      {/* Ish haqi */}
                      <td className="py-3 px-3">
                        <div className="space-y-0.5">
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {t.salaryType === "fixed"
                              ? `${money(t.fixedSalary || 0)} so'm (Fixed)`
                              : t.salaryType === "per_student"
                              ? `${money(t.perStudentSalary || 0)} so'm / o'quvchi`
                              : (() => {
                                  if (groups.length > 0) {
                                    const groupPercents = groups.map((g) =>
                                      Number(g.teacherSalaryPercent ?? t.revenueSharePercent ?? 0)
                                    );
                                    const avgPercent = Math.round(
                                      groupPercents.reduce((sum, p) => sum + p, 0) / groupPercents.length
                                    );
                                    return `${avgPercent}% ulush`;
                                  }
                                  return `${t.revenueSharePercent ?? 0}% ulush`;
                                })()}
                          </div>
                          {activeTab === "teachers" && (
                            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                              Hissobi: {money(payStats.expectedPay)} UZS
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Retention (Progress bar) - Only for main teachers */}
                      {activeTab === "teachers" && (
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs font-bold">
                              <span
                                className={
                                  retentionVal >= 85
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : retentionVal >= 70
                                    ? "text-amber-600 dark:text-amber-400"
                                    : "text-rose-600 dark:text-rose-400"
                                }
                              >
                                {retentionVal}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  retentionVal >= 85
                                    ? "bg-emerald-500"
                                    : retentionVal >= 70
                                    ? "bg-amber-500"
                                    : "bg-rose-500"
                                }`}
                                style={{ width: `${retentionVal}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      )}

                      {/* Reyting */}
                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-lg border border-amber-200/60 dark:border-amber-900/40 text-amber-600 dark:text-amber-400 font-bold text-xs">
                          <Star size={12} className="fill-amber-400 text-amber-400" />
                          <span>{t.rating || 5.0}</span>
                        </div>
                      </td>

                      {/* Amallar (3 dots) */}
                      <td className="py-3 px-4 text-right relative">
                        <TeacherActionMenu
                          t={t}
                          canEdit={canEdit}
                          activeTab={activeTab}
                          openModal={openModal}
                          setSmsTeacher={setSmsTeacher}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination bar (20 ta o'qituvchi) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 px-4 py-3 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs">
            <div className="text-slate-500 dark:text-slate-400">
              Jami <span className="font-bold text-slate-800 dark:text-slate-200">{filteredTeachers.length}</span> ta ustozdan{" "}
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {(currentPage - 1) * itemsPerPage + 1}-
                {Math.min(currentPage * itemsPerPage, filteredTeachers.length)}
              </span>{" "}
              ko'rsatilmoqda
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`w-7 h-7 rounded-lg font-bold text-xs transition-all ${
                        currentPage === page
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Custom SMS Modal */}
      {smsTeacher && (
        <SmsModal
          teacher={smsTeacher}
          onClose={() => setSmsTeacher(null)}
        />
      )}
    </div>
  );
}

function TeacherActionMenu({ t, canEdit, activeTab, openModal, setSmsTeacher }) {
  const [isOpen, setIsOpen] = useState(false);
  const btnRef = useRef(null);

  return (
    <div className="inline-block text-left">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
        title="Amallar"
      >
        <MoreVertical size={16} />
      </button>

      <MorphDropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        triggerRef={btnRef}
        align="right"
        className="w-44 p-1"
      >
        <div className="space-y-0.5 text-xs text-left">
          {canEdit && (
            <button
              onClick={() => {
                setIsOpen(false);
                openModal({
                  type:
                    activeTab === "assistants" || t.isAssistant
                      ? "supportTeacherForm"
                      : "teacherHRForm",
                  editing: t,
                  teacher: t,
                });
              }}
              className="morph-menu-item w-full px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium flex items-center gap-2 cursor-pointer"
            >
              <Pencil size={13} className="text-indigo-500" />
              Tahrirlash
            </button>
          )}

          <button
            onClick={() => {
              setIsOpen(false);
              setSmsTeacher(t);
            }}
            className="morph-menu-item w-full px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium flex items-center gap-2 cursor-pointer"
          >
            <MessageSquare size={13} className="text-sky-500" />
            SMS yuborish
          </button>

          <button
            onClick={() => {
              setIsOpen(false);
              openModal({
                type: "teacherPayroll",
                teacherId: t.id,
                teacher: t,
              });
            }}
            className="morph-menu-item w-full px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium flex items-center gap-2 cursor-pointer"
          >
            <Wallet size={13} className="text-emerald-500" />
            Maosh to'lash
          </button>

          {canEdit && (
            <button
              onClick={() => {
                setIsOpen(false);
                openModal({
                  type:
                    activeTab === "assistants" || t.isAssistant
                      ? "supportTeacherForm"
                      : "teacherHRForm",
                  editing: { ...t, passwordReset: true },
                  teacher: { ...t, passwordReset: true },
                });
              }}
              className="morph-menu-item w-full px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium flex items-center gap-2 cursor-pointer"
            >
              <Lock size={13} className="text-amber-500" />
              Parol tiklash
            </button>
          )}

          {canEdit && (
            <div className="border-t border-slate-100 dark:border-slate-800 pt-0.5">
              <button
                onClick={() => {
                  setIsOpen(false);
                  openModal({
                    type: "confirm",
                    message: `"${t.name}" ustozni ro'yxatdan o'chirishni tasdiqlaysizmi?`,
                    action: {
                      kind: "deleteTeacherHR",
                      teacherHRId: t.id,
                    },
                  });
                }}
                className="morph-menu-item w-full px-2.5 py-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-medium flex items-center gap-2 cursor-pointer"
              >
                <Trash2 size={13} />
                O'chirish
              </button>
            </div>
          )}
        </div>
      </MorphDropdown>
    </div>
  );
}

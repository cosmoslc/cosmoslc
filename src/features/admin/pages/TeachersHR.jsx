import { useState, useMemo, useEffect } from "react";
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
  Layers,
  Sparkles,
} from "lucide-react";
import { PrimaryButton, INPUT_CLS, LABEL_CLS, GLASS, BTN_GHOST } from "../theme/tokens";
import { Avatar, EmptyState } from "../components/primitives";
import {
  displayPhone,
  money,
  thisMonthKey,
} from "../utils/helpers";
import {
  getTeacherPayStats,
  opGroups,
  opStudentsInGroups,
} from "../utils/dataHelpers";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState(currentBranchId || "all");

  useEffect(() => {
    if (currentBranchId !== undefined) {
      setSelectedBranchId(currentBranchId);
    }
  }, [currentBranchId]);
  const [sortBy, setSortBy] = useState("default"); // default, rating, salary, students, share

  const scopeIds = useMemo(() => scopeBranches.map((b) => b.id), [scopeBranches]);

  const allScopedTeachers = useMemo(() => {
    return (directorData.teachersHR || []).filter((t) =>
      scopeIds.length === 0 ? true : scopeIds.includes(t.branchId),
    );
  }, [directorData.teachersHR, scopeIds]);

  const month = thisMonthKey();

  // Helper to get teacher's active groups and students
  function getTeacherGroupsAndStudents(teacherId) {
    const tIdStr = String(teacherId);
    const groups = opGroups(opData).filter((g) => String(g.teacherHrId || g.teacherId) === tIdStr);
    const students = opStudentsInGroups(
      opData,
      groups.map((g) => g.id),
    );
    return { groups, students };
  }

  // Filtered and Sorted Teachers
  const filteredTeachers = useMemo(() => {
    let result = allScopedTeachers.filter((t) => {
      const matchesBranch =
        selectedBranchId === "all" || t.branchId === selectedBranchId;
      const matchesSearch =
        !searchQuery.trim() ||
        t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.phone?.includes(searchQuery.replace(/\D/g, ""));
      return matchesBranch && matchesSearch;
    });

    if (sortBy === "rating") {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === "salary") {
      result.sort((a, b) => {
        const branchA = directorData.branches.find((br) => br.id === a.branchId);
        const branchB = directorData.branches.find((br) => br.id === b.branchId);
        const statsA = getTeacherPayStats(directorData, opData, a, branchA, month);
        const statsB = getTeacherPayStats(directorData, opData, b, branchB, month);
        return (statsB.expectedPay || 0) - (statsA.expectedPay || 0);
      });
    } else if (sortBy === "students") {
      result.sort((a, b) => {
        const aCount = getTeacherGroupsAndStudents(a.id).students.length;
        const bCount = getTeacherGroupsAndStudents(b.id).students.length;
        return bCount - aCount;
      });
    } else if (sortBy === "share") {
      result.sort((a, b) => (Number(b.revenueSharePercent) || 0) - (Number(a.revenueSharePercent) || 0));
    }

    return result;
  }, [allScopedTeachers, selectedBranchId, searchQuery, sortBy, directorData, opData, month]);

  // Overall Statistics Calculations
  const stats = useMemo(() => {
    if (allScopedTeachers.length === 0) {
      return {
        totalTeachers: 0,
        avgShare: 0,
        avgSalary: 0,
        totalStudents: 0,
        fullAccessCount: 0,
      };
    }

    const avgShareVal =
      allScopedTeachers.reduce(
        (sum, t) => sum + Number(t.revenueSharePercent || 0),
        0,
      ) / allScopedTeachers.length;

    let totalStudentsVal = 0;
    const avgSalaryVal =
      allScopedTeachers.reduce((sum, teacher) => {
        const branch = directorData.branches.find((b) => b.id === teacher.branchId);
        const payStats = getTeacherPayStats(
          directorData,
          opData,
          teacher,
          branch,
          month,
        );
        const { students } = getTeacherGroupsAndStudents(teacher.id);
        totalStudentsVal += students.length;
        return sum + (payStats.expectedPay || 0);
      }, 0) / allScopedTeachers.length;

    const accessCount = allScopedTeachers.filter(
      (t) => t.canReceivePayments !== false && t.canCreateGroups !== false,
    ).length;

    return {
      totalTeachers: allScopedTeachers.length,
      avgShare: avgShareVal,
      avgSalary: avgSalaryVal,
      totalStudents: totalStudentsVal,
      fullAccessCount: accessCount,
    };
  }, [allScopedTeachers, directorData, opData, month]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-sky-500/25">
            <Users size={24} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Ustozlar va O'qituvchilar
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800">
                {stats.totalTeachers} ta
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Ustozlar tarkibi, ulush kelishuvlari, oylik maosh hisob-kitoblari va tizim ruxsatlari
            </p>
          </div>
        </div>

        {canEdit && (
          <PrimaryButton
            onClick={() => openModal({ type: "teacherHRForm" })}
            className="!px-4 !py-2.5 shadow-md shadow-indigo-500/10 flex items-center gap-2"
          >
            <Plus size={18} /> Yangi ustoz qo'shish
          </PrimaryButton>
        )}
      </div>

      {/* KPI Summary Row (Dashboard style) */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5">
        <div className="stat-card border-indigo-200/80 dark:border-indigo-900/40 bg-gradient-to-b from-indigo-50/30 to-white dark:from-indigo-950/20 dark:to-slate-900 p-4 rounded-xl shadow-sm hover:-translate-y-1 transition-all cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <div className="icon-badge w-[34px] h-[34px] rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-md">
              <Users size={16} className="text-white" />
            </div>
          </div>
          <div className="stat-value text-[19px] font-extrabold tracking-tight text-slate-900 dark:text-white mb-0.5">
            {stats.totalTeachers} <span className="text-xs font-medium text-slate-400">nafar</span>
          </div>
          <div className="stat-label text-xs font-bold text-slate-500 dark:text-slate-400">
            Jami ustozlar
          </div>
        </div>

        <div className="stat-card border-amber-200/80 dark:border-amber-900/40 bg-gradient-to-b from-amber-50/30 to-white dark:from-amber-950/20 dark:to-slate-900 p-4 rounded-xl shadow-sm hover:-translate-y-1 transition-all cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <div className="icon-badge w-[34px] h-[34px] rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md">
              <Percent size={16} className="text-white" />
            </div>
          </div>
          <div className="stat-value text-[19px] font-extrabold tracking-tight text-amber-600 dark:text-amber-400 mb-0.5">
            {stats.avgShare.toFixed(1)}% <span className="text-xs font-medium text-slate-400">ulush</span>
          </div>
          <div className="stat-label text-xs font-bold text-slate-500 dark:text-slate-400">
            O'rtacha ulush foizi
          </div>
        </div>

        <div className="stat-card border-emerald-200/80 dark:border-emerald-900/40 bg-gradient-to-b from-emerald-50/30 to-white dark:from-emerald-950/20 dark:to-slate-900 p-4 rounded-xl shadow-sm hover:-translate-y-1 transition-all cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <div className="icon-badge w-[34px] h-[34px] rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-md">
              <Wallet size={16} className="text-white" />
            </div>
          </div>
          <div className="stat-value text-[19px] font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400 mb-0.5">
            {money(stats.avgSalary)} <span className="text-xs font-medium text-slate-400">so'm</span>
          </div>
          <div className="stat-label text-xs font-bold text-slate-500 dark:text-slate-400">
            O'rtacha oylik maosh
          </div>
        </div>

        <div className="stat-card border-blue-200/80 dark:border-blue-900/40 bg-gradient-to-b from-blue-50/30 to-white dark:from-blue-950/20 dark:to-slate-900 p-4 rounded-xl shadow-sm hover:-translate-y-1 transition-all cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <div className="icon-badge w-[34px] h-[34px] rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-md">
              <GraduationCap size={16} className="text-white" />
            </div>
          </div>
          <div className="stat-value text-[19px] font-extrabold tracking-tight text-blue-600 dark:text-blue-400 mb-0.5">
            {stats.totalStudents} <span className="text-xs font-medium text-slate-400">o'quvchi</span>
          </div>
          <div className="stat-label text-xs font-bold text-slate-500 dark:text-slate-400">
            Faol o'quvchilar
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ustoz ismi yoki telefon raqami..."
            className={`${INPUT_CLS} pl-9`}
          />
        </div>

        {/* Branch Filter & Sort */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {scopeBranches.length > 1 && (
            <div className="relative flex-1 sm:flex-initial">
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className={INPUT_CLS}
              >
                <option value="all">Barcha filiallar</option>
                {scopeBranches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="relative flex-1 sm:flex-initial">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={INPUT_CLS}
            >
              <option value="default">Odatiy saralash</option>
              <option value="rating">Reyting bo'yicha</option>
              <option value="salary">Oylik maosh bo'yicha</option>
              <option value="students">O'quvchilar soni bo'yicha</option>
              <option value="share">Ulush foizi bo'yicha</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4 Cards per row Grid */}
      {filteredTeachers.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title={searchQuery ? "Ustoz topilmadi" : "Hali ustozlar ro'yxatga olinmagan"}
          subtitle={
            searchQuery
              ? "Qidiruv parametrlarini o'zgartirib ko'ring yoki yangi ustoz qo'shing."
              : "Yangi ustoz qo'shish orqali jamoangizni shakllantiring."
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-5.5">
          {filteredTeachers.map((t) => {
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
            const { groups, students } = getTeacherGroupsAndStudents(t.id);
            const branchColor = branch?.color || "#6366f1";

            return (
              <div
                key={t.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden relative"
                style={{
                  borderLeftColor: branchColor,
                  borderLeftWidth: "4.5px",
                }}
              >
                {/* Main Card Body with generous padding */}
                <div className="p-4 pl-5 space-y-3.5">
                  {/* Top Header: Avatar, Name, Branch, Rating & Top Actions */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar
                        name={t.name}
                        color={branchColor}
                        size={40}
                        className="shrink-0 font-bold"
                      />
                      <div className="min-w-0">
                        <h3
                          className="font-bold text-sm text-slate-900 dark:text-white truncate"
                          title={t.name}
                        >
                          {t.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {branch && (
                            <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 truncate max-w-[110px]">
                              {branch.name}
                            </span>
                          )}
                          <div className="flex items-center gap-0.5 text-amber-500">
                            <Star size={11} className="fill-amber-400 text-amber-400" />
                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                              {t.rating || 5}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Edit/Delete/Reset icons */}
                    {canEdit && (
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          onClick={() =>
                            openModal({
                              type: "teacherHRForm",
                              editing: { ...t, passwordReset: true },
                            })
                          }
                          title="Parol yangilash"
                          className="p-1 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                        >
                          <Lock size={13} />
                        </button>
                        <button
                          onClick={() =>
                            openModal({ type: "teacherHRForm", editing: t })
                          }
                          title="Tahrirlash"
                          className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() =>
                            openModal({
                              type: "confirm",
                              message: `"${t.name}" ustozni ro'yxatdan o'chirishni tasdiqlaysizmi?`,
                              action: {
                                kind: "deleteTeacherHR",
                                teacherHRId: t.id,
                              },
                            })
                          }
                          title="O'chirish"
                          className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Phone number pill */}
                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
                      <Phone size={12} className="text-slate-400" />
                      <span>{displayPhone(t.phone)}</span>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/50">
                      {t.salaryType === "fixed" ? "Belgilangan" : `${t.revenueSharePercent || 0}% ulush`}
                    </span>
                  </div>

                  {/* Metric Box (Dashboard Style) */}
                  <div className="grid grid-cols-3 gap-1 bg-slate-50/90 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                        Guruhlar
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {groups.length} ta
                      </span>
                    </div>
                    <div className="border-x border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                        O'quvchilar
                      </span>
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                        {students.length} ta
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                        Oylik haq
                      </span>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 truncate block" title={`${money(payStats.expectedPay)} so'm`}>
                        {money(payStats.expectedPay)}
                      </span>
                    </div>
                  </div>

                  {/* Permissions mini badge row */}
                  <div className="flex items-center justify-between text-[11px] px-1 text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      {t.canCreateGroups !== false ? (
                        <CheckCircle2 size={12} className="text-emerald-500" />
                      ) : (
                        <XCircle size={12} className="text-rose-400" />
                      )}
                      Guruh ochish
                    </span>
                    <span className="flex items-center gap-1">
                      {t.canReceivePayments !== false ? (
                        <CheckCircle2 size={12} className="text-emerald-500" />
                      ) : (
                        <XCircle size={12} className="text-rose-400" />
                      )}
                      To'lov qabul
                    </span>
                  </div>
                </div>

                {/* Card Action Buttons Footer */}
                <div className="p-3 pl-5 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() =>
                      openModal({ type: "teacherPayroll", teacherId: t.id })
                    }
                    className="flex-1 py-1.5 px-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/70 dark:border-emerald-900/50 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Wallet size={13} /> Maosh to'lash
                  </button>

                  {canEdit && (
                    <button
                      onClick={() =>
                        openModal({ type: "teacherHRForm", editing: t })
                      }
                      className="py-1.5 px-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 transition-colors flex items-center gap-1"
                    >
                      <Pencil size={12} /> Tahrirlash
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

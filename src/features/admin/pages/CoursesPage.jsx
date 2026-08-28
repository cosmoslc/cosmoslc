import { useState, useMemo, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  Users,
  Layers,
  Clock,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Search,
  Building2,
  Filter,
  CheckCircle2,
  Calendar,
  Sparkles,
} from "lucide-react";
import { GLASS, BTN_GHOST, BTN_ICON, PrimaryButton, INPUT_CLS, LABEL_CLS } from "../theme/tokens";
import { EmptyState } from "../components/primitives";
import {
  opGroups,
  opGroupStudentCount,
  opStudentsInGroups,
} from "../utils/dataHelpers";
import { money, getPaymentStatus, thisMonthKey } from "../utils/helpers";

export function CoursesPage({
  scopeBranches = [],
  currentBranchId,
  directorData = { courses: [], branches: [], payments: [], teachersHR: [] },
  opData = {},
  openModal = () => {},
  canEdit = true,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState(currentBranchId || "all");

  useEffect(() => {
    if (currentBranchId !== undefined) {
      setSelectedBranchId(currentBranchId);
    }
  }, [currentBranchId]);
  const [expandedCourses, setExpandedCourses] = useState({});
  const [sortBy, setSortBy] = useState("default"); // default, students, groups, revenue

  const scopeIds = useMemo(() => scopeBranches.map((b) => b.id), [scopeBranches]);
  
  const allScopedCourses = useMemo(() => {
    return (directorData.courses || []).filter((c) =>
      scopeIds.length === 0 || !c.branchId ? true : scopeIds.includes(c.branchId),
    );
  }, [directorData.courses, scopeIds]);

  const month = thisMonthKey();

  function toggleCourseExpand(courseId) {
    setExpandedCourses((prev) => ({
      ...prev,
      [courseId]: !prev[courseId],
    }));
  }

  function courseGroups(courseId) {
    return opGroups(opData).filter((g) => g.courseId === courseId);
  }

  // Filtered & Sorted courses
  const filteredCourses = useMemo(() => {
    let result = allScopedCourses.filter((c) => {
      const matchesBranch =
        selectedBranchId === "all" || !c.branchId || c.branchId === selectedBranchId;
      const matchesSearch =
        !searchQuery.trim() ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesBranch && matchesSearch;
    });

    if (sortBy === "students") {
      result.sort((a, b) => {
        const aStuds = opStudentsInGroups(opData, courseGroups(a.id).map((g) => g.id)).length;
        const bStuds = opStudentsInGroups(opData, courseGroups(b.id).map((g) => g.id)).length;
        return bStuds - aStuds;
      });
    } else if (sortBy === "groups") {
      result.sort((a, b) => courseGroups(b.id).length - courseGroups(a.id).length);
    } else if (sortBy === "revenue") {
      result.sort((a, b) => {
        const aRev = courseGroups(a.id).reduce((sum, g) => sum + (g.price || a.price || 0) * opGroupStudentCount(opData, g.id), 0);
        const bRev = courseGroups(b.id).reduce((sum, g) => sum + (g.price || b.price || 0) * opGroupStudentCount(opData, g.id), 0);
        return bRev - aRev;
      });
    }

    return result;
  }, [allScopedCourses, selectedBranchId, searchQuery, sortBy, opData]);

  // Overall Statistics
  const stats = useMemo(() => {
    let totalGroups = 0;
    let totalStudents = 0;
    let totalMonthlyRevenue = 0;

    allScopedCourses.forEach((c) => {
      const groups = courseGroups(c.id);
      totalGroups += groups.length;
      const studs = opStudentsInGroups(opData, groups.map((g) => g.id));
      totalStudents += studs.length;
      const rev = groups.reduce(
        (sum, g) => sum + (g.price || c.price || 0) * opGroupStudentCount(opData, g.id),
        0,
      );
      totalMonthlyRevenue += rev;
    });

    return {
      coursesCount: allScopedCourses.length,
      groupsCount: totalGroups,
      studentsCount: totalStudents,
      monthlyRevenue: totalMonthlyRevenue,
    };
  }, [allScopedCourses, opData]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/25">
            <BookOpen size={24} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Kurslar va Yo'nalishlar
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                {stats.coursesCount} ta
              </span>
            </h1>
          </div>
        </div>

        {canEdit && (
          <PrimaryButton
            onClick={() => openModal({ type: "courseForm" })}
            className="!px-4 !py-2.5 shadow-md shadow-indigo-500/10 flex items-center gap-2"
          >
            <Plus size={18} /> Yangi kurs qo'shish
          </PrimaryButton>
        )}
      </div>

      {/* Overview Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5">
        <div className="stat-card border-indigo-200/80 dark:border-indigo-900/40 bg-gradient-to-b from-indigo-50/30 to-white dark:from-indigo-950/20 dark:to-slate-900 p-4 rounded-xl shadow-sm hover:-translate-y-1 transition-all cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <div className="icon-badge w-[34px] h-[34px] rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-md">
              <BookOpen size={16} className="text-white" />
            </div>
          </div>
          <div className="stat-value text-[19px] font-extrabold tracking-tight text-slate-900 dark:text-white mb-0.5">
            {stats.coursesCount} <span className="text-xs font-medium text-slate-400">ta yo'nalish</span>
          </div>
          <div className="stat-label text-xs font-bold text-slate-500 dark:text-slate-400">
            Jami kurslar
          </div>
        </div>

        <div className="stat-card border-blue-200/80 dark:border-blue-900/40 bg-gradient-to-b from-blue-50/30 to-white dark:from-blue-950/20 dark:to-slate-900 p-4 rounded-xl shadow-sm hover:-translate-y-1 transition-all cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <div className="icon-badge w-[34px] h-[34px] rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-md">
              <Layers size={16} className="text-white" />
            </div>
          </div>
          <div className="stat-value text-[19px] font-extrabold tracking-tight text-blue-600 dark:text-blue-400 mb-0.5">
            {stats.groupsCount} <span className="text-xs font-medium text-slate-400">ta guruh</span>
          </div>
          <div className="stat-label text-xs font-bold text-slate-500 dark:text-slate-400">
            Faol guruhlar
          </div>
        </div>

        <div className="stat-card border-emerald-200/80 dark:border-emerald-900/40 bg-gradient-to-b from-emerald-50/30 to-white dark:from-emerald-950/20 dark:to-slate-900 p-4 rounded-xl shadow-sm hover:-translate-y-1 transition-all cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <div className="icon-badge w-[34px] h-[34px] rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-md">
              <Users size={16} className="text-white" />
            </div>
          </div>
          <div className="stat-value text-[19px] font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400 mb-0.5">
            {stats.studentsCount} <span className="text-xs font-medium text-slate-400">nafar</span>
          </div>
          <div className="stat-label text-xs font-bold text-slate-500 dark:text-slate-400">
            O'quvchilar soni
          </div>
        </div>

        <div className="stat-card border-amber-200/80 dark:border-amber-900/40 bg-gradient-to-b from-amber-50/30 to-white dark:from-amber-950/20 dark:to-slate-900 p-4 rounded-xl shadow-sm hover:-translate-y-1 transition-all cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <div className="icon-badge w-[34px] h-[34px] rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md">
              <DollarSign size={16} className="text-white" />
            </div>
          </div>
          <div className="stat-value text-[19px] font-extrabold tracking-tight text-slate-900 dark:text-white mb-0.5">
            {money(stats.monthlyRevenue)} <span className="text-xs font-medium text-slate-400">so'm/oy</span>
          </div>
          <div className="stat-label text-xs font-bold text-slate-500 dark:text-slate-400">
            Kutilayotgan tushum
          </div>
        </div>
      </div>

      {/* Filter & Search Bar - Compact one row */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-white dark:bg-slate-900 p-2 sm:p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        {/* Search - Decreased width */}
        <div className="relative w-56 sm:w-64 max-w-full">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Kurs nomi..."
            className={`${INPUT_CLS} pl-8 py-1.5 text-xs`}
          />
        </div>

        {/* Branch filter & Sort */}
        <div className="flex flex-wrap items-center gap-2">
          {scopeBranches.length > 1 && (
            <div className="relative">
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className={`${INPUT_CLS} w-auto min-w-[120px] py-1.5 text-xs`}
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

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-auto min-w-[130px] pl-3 pr-8 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="default">Odatiy saralash</option>
              <option value="students">O'quvchilar soni bo'yicha</option>
              <option value="groups">Guruhlar soni bo'yicha</option>
              <option value="revenue">Tushum summasi bo'yicha</option>
            </select>
          </div>
        </div>
      </div>

      {/* Courses Block / Grid Layout */}
      {filteredCourses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={searchQuery ? "Kurs topilmadi" : "Hali kurs mavjud emas"}
          subtitle={
            searchQuery
              ? "Qidiruv so'zini o'zgartirib ko'ring yoki yangi kurs qo'shing."
              : "Yangi kurs yaratish orqali markaz katalogini to'ldiring."
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((c) => {
            const groups = courseGroups(c.id);
            const studs = opStudentsInGroups(
              opData,
              groups.map((g) => g.id),
            );
            const revenue = groups.reduce(
              (sum, g) =>
                sum +
                (g.price || c.price || 0) * opGroupStudentCount(opData, g.id),
              0,
            );
            const branchObj = (directorData.branches || []).find(
              (b) => b.id === c.branchId,
            );
            const isExpanded = !!expandedCourses[c.id];
            const courseColor = c.color || "#6366f1";

            return (
              <div
                key={c.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden"
                style={{
                  borderLeftColor: courseColor,
                  borderLeftWidth: "5px",
                }}
              >
                <div className="p-5 pl-6 space-y-4">
                  {/* Card Header: Icon, Name, Branch & Actions */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                        style={{ backgroundColor: courseColor }}
                      >
                        <BookOpen size={18} strokeWidth={2.5} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base text-slate-900 dark:text-white truncate" title={c.name}>
                          {c.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          {branchObj && (
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {branchObj.name}
                            </span>
                          )}
                          {c.durationMonths > 0 && (
                            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1">
                              <Clock size={12} /> {c.durationMonths} oy
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Action Icons */}
                    {canEdit && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() =>
                            openModal({ type: "groupForm", courseId: c.id })
                          }
                          title="Guruh ochish"
                          className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl transition-colors"
                        >
                          <Plus size={15} />
                        </button>
                        <button
                          onClick={() =>
                            openModal({ type: "courseForm", editing: c })
                          }
                          title="Tahrirlash"
                          className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() =>
                            openModal({
                              type: "confirm",
                              message: `"${c.name}" kursini va unga tegishli barcha sozlamalarni arxivga ko'chirmoqchimisiz?`,
                              action: { kind: "deleteCourse", courseId: c.id },
                            })
                          }
                          title="O'chirish"
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Price and Key Metrics */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50/90 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="text-center">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block mb-0.5">
                        Guruhlar
                      </span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {groups.length} ta
                      </span>
                    </div>
                    <div className="text-center border-x border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block mb-0.5">
                        O'quvchilar
                      </span>
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {studs.length} ta
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block mb-0.5">
                        Baza narxi
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
                        {c.price ? `${money(c.price)}` : "Belgilanmagan"}
                      </span>
                    </div>
                  </div>

                  {/* Monthly Revenue Calculation */}
                  <div className="flex items-center justify-between px-1 text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">
                      Oylik kutilayotgan tushum:
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {money(revenue)} so'm/oy
                    </span>
                  </div>

                  {/* Groups Accordion inside Block */}
                  <div>
                    <button
                      type="button"
                      onClick={() => toggleCourseExpand(c.id)}
                      className="w-full flex items-center justify-between py-2.5 px-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 rounded-xl transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Layers size={14} style={{ color: courseColor }} />
                        Guruhlar ro'yxati ({groups.length})
                      </span>
                      {isExpanded ? (
                        <ChevronUp size={14} className="text-slate-400" />
                      ) : (
                        <ChevronDown size={14} className="text-slate-400" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="mt-2 space-y-2 max-h-52 overflow-y-auto pr-1">
                        {groups.length === 0 ? (
                          <div className="text-center py-3.5 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                            <p className="text-xs text-slate-400">
                              Bu kursda hali guruh ochilmagan.
                            </p>
                          </div>
                        ) : (
                          groups.map((g) => {
                            const gStuds = opStudentsInGroups(opData, [g.id]);
                            const paidCount = gStuds.filter(
                              (s) =>
                                getPaymentStatus(
                                  directorData.payments,
                                  s.id,
                                  g.id,
                                  month,
                                  g.price || c.price,
                                ) === "paid",
                            ).length;
                            const teacher = (directorData.teachersHR || []).find(
                              (t) => String(t.id) === String(g.teacherHrId || g.teacherId),
                            );

                            return (
                              <div
                                key={g.id}
                                className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 rounded-xl flex items-center justify-between gap-2.5"
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className="w-2 h-2 rounded-full shrink-0"
                                      style={{ background: g.color || courseColor }}
                                    />
                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                                      {g.name}
                                    </p>
                                  </div>
                                  <p className="text-[11px] text-slate-400 mt-1 truncate">
                                    {teacher ? teacher.name : "O'qituvchisiz"} ·{" "}
                                    {(g.days || []).join(", ") || "Kunsiz"} ·{" "}
                                    {g.time || ""}
                                  </p>
                                </div>

                                <div className="text-right shrink-0">
                                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                                    {gStuds.length} o'quvchi
                                  </span>
                                  <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                                    {paidCount} to'lagan
                                  </span>
                                </div>

                                {canEdit && (
                                  <button
                                    onClick={() =>
                                      openModal({
                                        type: "groupForm",
                                        courseId: c.id,
                                        editing: g,
                                      })
                                    }
                                    title="Guruhni tahrirlash"
                                    className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl"
                                  >
                                    <Pencil size={13} />
                                  </button>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

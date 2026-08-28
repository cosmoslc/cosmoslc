import { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import {
  Plus,
  BookOpen,
  ClipboardList,
  Pencil,
  Trash2,
  Users,
  Wallet,
  Clock,
  Calendar,
  DoorOpen,
  GraduationCap,
  Search,
  Layers,
  Flame,
  CheckCircle2,
  ArrowDownLeft,
  CircleDollarSign,
  FileSpreadsheet,
  Download,
} from "lucide-react";
import { BTN_GHOST, INPUT_CLS, PrimaryButton } from "../theme/tokens";
import { money, thisMonthKey } from "../utils/helpers";
import { opGroupStudentCount, opGroups, opRooms } from "../utils/dataHelpers";
import { EmptyState } from "../components/primitives";

export function GroupsPage({
  directorData,
  opData,
  openModal = () => {},
  scopeBranchIds = [],
  canEdit = true,
}) {
  const currentMonth = thisMonthKey();
  const allGroups = opGroups(opData);
  const allCourses = directorData?.courses || [];
  const courses = (scopeBranchIds && scopeBranchIds.length > 0)
    ? allCourses.filter((c) => scopeBranchIds.includes(c.branchId))
    : allCourses;
  const courseIds = courses.map((c) => c.id);
  const teachers = directorData?.teachersHR || directorData?.teachers || opData?.teachers || [];
  const rooms = opRooms(opData) || directorData?.rooms || [];
  const allPayments = directorData?.payments || opData?.payments || [];

  const [query, setQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [dayFilter, setDayFilter] = useState("all");

  const groups = allGroups.filter((g) => {
    if (scopeBranchIds && scopeBranchIds.length > 0) {
      return !g.courseId || courses.some((c) => String(c.id) === String(g.courseId));
    }
    return true;
  });

  const rawRows = groups
    .map((g) => {
      const count = opGroupStudentCount(opData, g.id);
      const course = allCourses.find((c) => String(c.id) === String(g.courseId));
      const teacher = teachers.find((t) => String(t.id) === String(g.teacherHrId || g.teacherId));
      const room = rooms.find((r) => String(r.id) === String(g.roomId));
      const expectedRevenue = (g.price || 0) * count;

      // Calculate collected revenue for this group in the current month
      const collectedRevenue = allPayments
        .filter((p) => String(p.groupId) === String(g.id) && p.month === currentMonth)
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

      const collectionPercent =
        expectedRevenue > 0
          ? Math.min(100, Math.round((collectedRevenue / expectedRevenue) * 100))
          : 0;

      return {
        ...g,
        course,
        teacher,
        room,
        count,
        expectedRevenue,
        collectedRevenue,
        collectionPercent,
      };
    })
    .sort((a, b) => b.expectedRevenue - a.expectedRevenue);

  // Filtered rows
  const rows = useMemo(() => {
    return rawRows.filter((g) => {
      const q = query.trim().toLowerCase();
      const matchQuery =
        !q ||
        g.name.toLowerCase().includes(q) ||
        (g.course?.name && g.course.name.toLowerCase().includes(q)) ||
        (g.teacher?.name && g.teacher.name.toLowerCase().includes(q));

      const matchCourse = courseFilter === "all" || String(g.courseId) === String(courseFilter);

      const matchDay = (() => {
        if (dayFilter === "all") return true;
        const daysStr = (g.days || []).join(" ").toLowerCase();
        if (dayFilter === "odd") {
          return daysStr.includes("du") || daysStr.includes("chor") || daysStr.includes("jum");
        }
        if (dayFilter === "even") {
          return daysStr.includes("se") || daysStr.includes("pay") || daysStr.includes("shan");
        }
        return true;
      })();

      return matchQuery && matchCourse && matchDay;
    });
  }, [rawRows, query, courseFilter, dayFilter]);

  // Handle Excel Export
  function handleExportExcel() {
    if (!rows || rows.length === 0) return;

    const exportData = rows.map((g) => ({
      Name: g.name || "",
      Course: g.course?.name || "",
      Teacher: g.teacher?.name || "",
      Days: Array.isArray(g.days) ? g.days.join(", ") : (g.days || ""),
      Room: g.room?.name || "",
      "Start Course": g.startDate || "",
      Time: g.time || "",
      Cost: g.price ? g.price.toLocaleString() : "0",
      Status: g.status === "active" ? "Faol" : "Faolmas",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Guruhlar");
    XLSX.writeFile(workbook, `Guruhlar_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  // Overall KPIs
  const totalGroups = rawRows.length;
  const totalStudents = rawRows.reduce((sum, g) => sum + g.count, 0);
  const totalExpected = rawRows.reduce((sum, g) => sum + g.expectedRevenue, 0);
  const totalCollected = rawRows.reduce((sum, g) => sum + g.collectedRevenue, 0);
  const totalRemaining = Math.max(0, totalExpected - totalCollected);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Layers size={24} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Guruhlar
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                {totalGroups} ta
              </span>
            </h1>
          </div>
        </div>
        {canEdit !== false && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleExportExcel}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center gap-2 border border-slate-200/80 dark:border-slate-700 cursor-pointer"
            >
              <Download size={15} /> Export (Excel)
            </button>
            <button
              type="button"
              onClick={() => openModal({ type: "importGroups" })}
              className="px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 font-bold text-xs hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <FileSpreadsheet size={15} /> Import (Excel)
            </button>
            <PrimaryButton onClick={() => openModal({ type: "groupForm" })}>
              <Plus size={16} /> Yangi guruh ochish
            </PrimaryButton>
          </div>
        )}
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3.5">
        <div className="stat-card border-indigo-200/80 dark:border-indigo-900/40 bg-gradient-to-b from-indigo-50/30 to-white dark:from-indigo-950/20 dark:to-slate-900 p-4 rounded-xl shadow-sm hover:-translate-y-1 transition-all cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <div className="icon-badge w-[34px] h-[34px] rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-md">
              <Layers size={16} className="text-white" />
            </div>
          </div>
          <div className="stat-value text-[19px] font-extrabold tracking-tight text-slate-900 dark:text-white mb-0.5">
            {totalGroups} <span className="text-xs font-medium text-slate-400">ta</span>
          </div>
          <div className="stat-label text-xs font-bold text-slate-500 dark:text-slate-400">
            Jami guruhlar
          </div>
        </div>

        <div className="stat-card border-sky-200/80 dark:border-sky-900/40 bg-gradient-to-b from-sky-50/30 to-white dark:from-sky-950/20 dark:to-slate-900 p-4 rounded-xl shadow-sm hover:-translate-y-1 transition-all cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <div className="icon-badge w-[34px] h-[34px] rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center shadow-md">
              <Users size={16} className="text-white" />
            </div>
          </div>
          <div className="stat-value text-[19px] font-extrabold tracking-tight text-sky-600 dark:text-sky-400 mb-0.5">
            {totalStudents} <span className="text-xs font-medium text-slate-400">nafar</span>
          </div>
          <div className="stat-label text-xs font-bold text-slate-500 dark:text-slate-400">
            Jami o'quvchilar
          </div>
        </div>

        <div className="stat-card border-blue-200/80 dark:border-blue-900/40 bg-gradient-to-b from-blue-50/30 to-white dark:from-blue-950/20 dark:to-slate-900 p-4 rounded-xl shadow-sm hover:-translate-y-1 transition-all cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <div className="icon-badge w-[34px] h-[34px] rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md">
              <Wallet size={16} className="text-white" />
            </div>
          </div>
          <div className="stat-value text-[19px] font-extrabold tracking-tight text-blue-600 dark:text-blue-400 mb-0.5 truncate">
            {money(totalExpected)} <span className="text-xs font-medium text-slate-400">so'm</span>
          </div>
          <div className="stat-label text-xs font-bold text-slate-500 dark:text-slate-400">
            Kutilayotgan daromad
          </div>
        </div>

        <div className="stat-card border-emerald-200/80 dark:border-emerald-900/40 bg-gradient-to-b from-emerald-50/30 to-white dark:from-emerald-950/20 dark:to-slate-900 p-4 rounded-xl shadow-sm hover:-translate-y-1 transition-all cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <div className="icon-badge w-[34px] h-[34px] rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-md">
              <CheckCircle2 size={16} className="text-white" />
            </div>
          </div>
          <div className="stat-value text-[19px] font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400 mb-0.5 truncate">
            {money(totalCollected)} <span className="text-xs font-medium text-slate-400">so'm</span>
          </div>
          <div className="stat-label text-xs font-bold text-slate-500 dark:text-slate-400">
            Yig'ilgan daromad
          </div>
        </div>

        <div className="stat-card border-rose-200/80 dark:border-rose-900/40 bg-gradient-to-b from-rose-50/30 to-white dark:from-rose-950/20 dark:to-slate-900 p-4 rounded-xl shadow-sm hover:-translate-y-1 transition-all cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <div className="icon-badge w-[34px] h-[34px] rounded-xl bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center shadow-md">
              <CircleDollarSign size={16} className="text-white" />
            </div>
          </div>
          <div className="stat-value text-[19px] font-extrabold tracking-tight text-rose-600 dark:text-rose-400 mb-0.5 truncate">
            {money(totalRemaining)} <span className="text-xs font-medium text-slate-400">so'm</span>
          </div>
          <div className="stat-label text-xs font-bold text-slate-500 dark:text-slate-400">
            Qoldiq / Qarz
          </div>
        </div>
      </div>

      {/* Search & Filters - Compact one row */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-2 sm:p-2.5 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative w-56 sm:w-64 max-w-full">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Guruh, kurs yoki ustoz..."
              className={`${INPUT_CLS} pl-8 py-1.5 text-xs`}
            />
          </div>

          <div className="w-auto min-w-[140px]">
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className={`${INPUT_CLS} py-1.5 text-xs`}
            >
              <option value="all">Barcha kurslar</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="w-auto min-w-[150px]">
            <select
              value={dayFilter}
              onChange={(e) => setDayFilter(e.target.value)}
              className={`${INPUT_CLS} py-1.5 text-xs`}
            >
              <option value="all">Barcha kunlar</option>
              <option value="odd">Toq kunlar (Du-Chor-Jum)</option>
              <option value="even">Juft kunlar (Se-Pay-Shan)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Empty States or Box Grid */}
      {courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Avval kurs yarating"
          subtitle="Guruh ochish uchun avval Kurslar bo'limida kurs yarating."
        />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Guruhlar topilmadi"
          subtitle={
            query || courseFilter !== "all" || dayFilter !== "all"
              ? "Qidiruv parametrlarini o'zgartirib ko'ring."
              : "Yuqoridagi tugma orqali birinchi guruhingizni oching."
          }
          action={
            canEdit && !query && courseFilter === "all" ? (
              <PrimaryButton onClick={() => openModal({ type: "groupForm" })}>
                <Plus size={16} /> Guruh ochish
              </PrimaryButton>
            ) : null
          }
        />
      ) : (
        /* Box Style Grid of Groups with Extra Gap and Padding */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {rows.map((g, i) => {
            const maxCap = g.room?.capacity || 20;
            const percentFilled = Math.min(100, Math.round((g.count / maxCap) * 100));
            const groupAccent = g.color || "#6366F1";

            return (
              <div
                key={g.id}
                onClick={() => openModal({ type: "groupProfile", group: g })}
                className="group relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700/60 transition-all duration-200 cursor-pointer"
                style={{
                  borderLeftWidth: "4px",
                  borderLeftColor: groupAccent,
                }}
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase truncate max-w-[130px]"
                      style={{
                        backgroundColor: `${groupAccent}15`,
                        color: groupAccent,
                        border: `1px solid ${groupAccent}30`,
                      }}
                    >
                      {g.course?.name || "Kurssiz"}
                    </span>

                    {/* Revenue Status Tag */}
                    {i === 0 && g.expectedRevenue > 0 ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                        <Flame size={11} /> Top daromad
                      </span>
                    ) : g.count < 3 ? (
                      <span className="bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/40 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                        Kam sonli
                      </span>
                    ) : (
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0">
                        Faol
                      </span>
                    )}
                  </div>

                  {/* Group Title */}
                  <h3 className="font-display font-bold text-base text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {g.name}
                  </h3>

                  {/* Teacher & Room Info */}
                  <div className="mt-2.5 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1.5 truncate">
                      <GraduationCap size={13} className="text-slate-400 shrink-0" />
                      <span className="truncate">
                        {g.teacher?.name || "Ustoz belgilanmagan"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 truncate">
                      <DoorOpen size={13} className="text-slate-400 shrink-0" />
                      <span className="truncate">
                        {g.room?.name || "Xona tanlanmagan"}
                      </span>
                    </div>
                  </div>

                  {/* Schedule & Days */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-1 font-semibold text-[11px]">
                      <Calendar size={12} className="text-indigo-500 shrink-0" />
                      <span className="truncate">{(g.days || []).join(", ") || "Kunsiz"}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                      <Clock size={12} />
                      <span>{g.time || "15:00"}</span>
                    </div>
                  </div>

                  {/* Student Capacity Progress Bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[11px] font-medium mb-1">
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Users size={12} /> O'quvchilar:
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {g.count} <span className="text-slate-400 font-normal">/ {maxCap}</span>
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${percentFilled}%`,
                          backgroundColor:
                            percentFilled > 80
                              ? "#10B981"
                              : percentFilled > 40
                              ? groupAccent
                              : "#F59E0B",
                        }}
                      />
                    </div>
                  </div>

                  {/* Two Mini Cards Inside Group Box: Kutilayotgan vs Yig'ilgan Daromad */}
                  <div className="mt-3.5 grid grid-cols-2 gap-2">
                    {/* Mini Card 1: Kutilayotgan daromad */}
                    <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 rounded-xl p-2.5 flex flex-col justify-between">
                      <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-400 flex items-center gap-1">
                        <Wallet size={11} className="text-blue-500" /> Kutilayotgan
                      </span>
                      <p className="font-display text-xs font-bold text-slate-900 dark:text-white mt-1 truncate">
                        {money(g.expectedRevenue)} <span className="text-[9px] font-normal text-slate-400">so'm</span>
                      </p>
                    </div>

                    {/* Mini Card 2: Yig'ilgan daromad */}
                    <div className="bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 rounded-xl p-2.5 flex flex-col justify-between">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 size={11} /> Yig'ilgan
                        </span>
                        <span className="text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400">
                          {g.collectionPercent}%
                        </span>
                      </div>
                      <p className="font-display text-xs font-bold text-emerald-700 dark:text-emerald-300 mt-1 truncate">
                        {money(g.collectedRevenue)} <span className="text-[9px] font-normal text-emerald-600/70 dark:text-emerald-400/70">so'm</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Course Price & Action Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="text-xs">
                    <span className="text-[10px] text-slate-400 block">Kurs narxi</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {money(g.price)} <span className="text-[10px] font-normal text-slate-400">so'm/oy</span>
                    </span>
                  </div>

                  {canEdit && (
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal({
                            type: "groupForm",
                            courseId: g.courseId,
                            editing: g,
                          });
                        }}
                        className="p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                        title="Tahrirlash"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal({
                            type: "confirm",
                            message: `"${g.name}" guruhini o'chirasizmi?`,
                            action: { kind: "deleteGroup", groupId: g.id },
                          });
                        }}
                        className="p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="O'chirish"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
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

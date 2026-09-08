import { useState, useMemo } from "react";
import {
  GraduationCap,
  Search,
  LayoutList,
  LayoutGrid,
  Phone,
  Layers,
  Wallet,
  Clock,
  ChevronDown,
  UserPlus,
  Coins,
  CheckCircle2,
  Calendar,
  Sparkles,
} from "lucide-react";
import { Avatar, EmptyState } from "../../../shared/components/primitives";
import { displayPhone, money } from "../utils/helpers";
import { getStudentGroups } from "../utils/dataHelpers";
import { calculateStudentRealBalance } from "../../../shared/utils/prorata";

/**
 * Format relative or short date for last activity
 */
function formatLastActivity(isoOrTs) {
  if (!isoOrTs) return "Noma'lum";
  try {
    const d = new Date(isoOrTs);
    if (isNaN(d.getTime())) return "Noma'lum";
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 2) return "Hozirgina";
    if (diffMins < 60) return `${diffMins} daqiqa oldin`;
    if (diffHours < 24) return `${diffHours} soat oldin`;
    if (diffDays === 1) return "Kecha";
    if (diffDays < 7) return `${diffDays} kun oldin`;

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  } catch {
    return "Noma'lum";
  }
}

export function StudentsView({ appData, openModal }) {
  const [viewMode, setViewMode] = useState("list"); // "list" | "grid"
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroupFilter, setSelectedGroupFilter] = useState("all");

  const students = appData?.students || [];
  const groups = appData?.groups || [];
  const attendance = appData?.attendance || [];
  const tasks = appData?.tasks || [];

  // Compute the latest activity timestamp for each student from submissions, attendance, or joins
  const studentActivityMap = useMemo(() => {
    const map = {};

    // 1. Check tasks submissions
    (tasks || []).forEach((t) => {
      if (!t.submissions) return;
      Object.entries(t.submissions).forEach(([sId, sub]) => {
        const time = sub?.submittedAt || sub?.gradedAt;
        if (time) {
          if (!map[sId] || new Date(time) > new Date(map[sId])) {
            map[sId] = time;
          }
        }
      });
    });

    // 2. Check attendance records
    (attendance || []).forEach((att) => {
      if (!att.records) return;
      Object.entries(att.records).forEach(([sId, entry]) => {
        if (entry) {
          const time = att.date ? `${att.date}T12:00:00` : null;
          if (time && (!map[sId] || new Date(time) > new Date(map[sId]))) {
            map[sId] = time;
          }
        }
      });
    });

    // 3. Fallback to joinedAt or createdAt
    students.forEach((s) => {
      if (!map[s.id]) {
        map[s.id] = s.lastActive || s.joinedAt || s.createdAt || null;
      }
    });

    return map;
  }, [tasks, attendance, students]);

  // Compute exact real balance identical to Admin StudentsPage
  const realBalanceMap = useMemo(() => {
    const map = {};
    const allGroups = appData?.allGroups || appData?.groups || [];
    const payments = appData?.payments || [];
    const centerSettings = appData?.centerSettings || {};
    const attendances = appData?.attendance || [];

    (students || []).forEach((s) => {
      map[s.id] = calculateStudentRealBalance({
        student: s,
        groups: allGroups,
        payments,
        attendances,
        centerSettings,
      });
    });
    return map;
  }, [
    students,
    appData?.allGroups,
    appData?.groups,
    appData?.payments,
    appData?.centerSettings,
    appData?.attendance,
  ]);

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      // Group filter
      if (selectedGroupFilter !== "all") {
        const sGroups = Array.isArray(s.groupIds) ? s.groupIds.map(String) : [];
        if (!sGroups.includes(String(selectedGroupFilter))) {
          return false;
        }
      }

      // Search query filter (ism yoki nomer)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = (s.name || "").toLowerCase().includes(q);
        const phoneMatch = (s.phone || "").replace(/\D/g, "").includes(q.replace(/\D/g, ""));
        if (!nameMatch && !phoneMatch) {
          return false;
        }
      }

      return true;
    });
  }, [students, selectedGroupFilter, searchQuery]);

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <GraduationCap size={22} />
            </span>
            <span>O'quvchilar</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Guruhlaringizdagi barcha o'quvchilar ro'yxati va faolligi
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* View Mode Switcher: Ro'yxat vs Katak */}
          <div className="flex items-center p-1 rounded-2xl bg-white/60 dark:bg-white/10 backdrop-blur-xl border border-white/60 dark:border-white/15 shadow-sm">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              title="Ro'yxat ko'rinishi"
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === "list"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <LayoutList size={16} />
              <span className="hidden sm:inline">Ro'yxat</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              title="Katak ko'rinishi"
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === "grid"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <LayoutGrid size={16} />
              <span className="hidden sm:inline">Katak</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 sm:p-4 rounded-3xl bg-white/60 dark:bg-white/[0.04] backdrop-blur-2xl border border-slate-200/60 dark:border-white/10 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative w-full sm:flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ism yoki telefon orqali qidirish..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-blue-500 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              Tozalash
            </button>
          )}
        </div>

        {/* Group Filter */}
        <div className="w-full sm:w-auto min-w-[200px]">
          <select
            value={selectedGroupFilter}
            onChange={(e) => setSelectedGroupFilter(e.target.value)}
            className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-2xl bg-white/80 dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500 cursor-pointer font-medium"
          >
            <option value="all">Barcha guruhlar ({groups.length})</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        {/* Counter */}
        <div className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap px-1">
          <span className="font-bold text-slate-800 dark:text-slate-200">
            {filteredStudents.length}
          </span>{" "}
          ta o'quvchi
        </div>
      </div>

      {/* Main Content Area */}
      {filteredStudents.length === 0 ? (
        <div className="p-8 rounded-3xl bg-white/60 dark:bg-white/[0.04] backdrop-blur-2xl border border-slate-200/60 dark:border-white/10">
          <EmptyState
            icon={GraduationCap}
            title="O'quvchilar topilmadi"
            description={
              searchQuery
                ? "Qidiruv so'rovi bo'yicha hech qanday o'quvchi topilmadi."
                : "Ushbu filtr bo'yicha hali o'quvchilar mavjud emas."
            }
          />
        </div>
      ) : viewMode === "list" ? (
        /* LIST (RO'YXAT) KO'RINISHI */
        <div className="relative overflow-x-auto rounded-3xl border border-slate-200/60 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] backdrop-blur-2xl shadow-xs">
          <table className="w-full text-left border-collapse select-none">
            <thead>
              <tr className="border-b border-slate-200/60 dark:border-white/10 bg-slate-50/70 dark:bg-slate-900/60 text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">Ism</th>
                <th className="py-3 px-4">Nomer</th>
                <th className="py-3 px-4">Guruhi</th>
                <th className="py-3 px-4 text-right">Balansi</th>
                <th className="py-3 px-4 text-center">So'nggi faollik</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-white/5 text-sm">
              {filteredStudents.map((student, idx) => {
                const sGroups = getStudentGroups(appData, student.id);
                const lastAct = studentActivityMap[student.id];
                const balanceNum = realBalanceMap[student.id] !== undefined ? realBalanceMap[student.id] : Number(student.balance || 0);

                return (
                  <tr
                    key={student.id}
                    onClick={() =>
                      openModal &&
                      openModal({
                        type: "studentDetail",
                        studentId: student.id,
                        groupId: sGroups[0]?.id || groups[0]?.id,
                      })
                    }
                    className="hover:bg-blue-500/[0.04] dark:hover:bg-white/[0.03] transition-colors cursor-pointer group"
                  >
                    {/* Index */}
                    <td className="py-3.5 px-4 text-center text-xs text-slate-400 font-medium">
                      {idx + 1}
                    </td>

                    {/* 1. Ism */}
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={student.name}
                          photo={student.avatar || student.photo}
                          src={student.avatar}
                          color={sGroups[0]?.color}
                          size={40}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {student.name}
                          </p>
                          {student.coins > 0 && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                              <Coins size={11} />
                              {student.coins} coin
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* 2. Nomer */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium text-xs sm:text-sm">
                        <Phone size={13} className="text-slate-400 shrink-0" />
                        <span>{displayPhone(student.phone) || "Kiritilmagan"}</span>
                      </div>
                    </td>

                    {/* 3. Guruhi */}
                    <td className="py-3.5 px-4">
                      {sGroups.length === 0 ? (
                        <span className="text-xs text-slate-400 italic">
                          Guruhsiz
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5 max-w-[240px]">
                          {sGroups.map((g) => (
                            <span
                              key={g.id}
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-white/80 dark:bg-white/10 border border-slate-200/80 dark:border-white/15 text-slate-800 dark:text-slate-200 shadow-2xs"
                            >
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: g.color || "#3b82f6" }}
                              />
                              <span className="truncate max-w-[120px]">
                                {g.name}
                              </span>
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* 4. Balansi */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-extrabold ${
                          balanceNum < 0
                            ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                            : balanceNum > 0
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                            : "bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20"
                        }`}
                      >
                        <Wallet size={12} />
                        {money(balanceNum)} so'm
                      </span>
                    </td>

                    {/* 5. So'nggi faollik */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <Clock size={12} className="text-slate-400" />
                        <span>{formatLastActivity(lastAct)}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* GRID (KATAK) KO'RINISHI */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredStudents.map((student) => {
            const sGroups = getStudentGroups(appData, student.id);
            const lastAct = studentActivityMap[student.id];
            const balanceNum = realBalanceMap[student.id] !== undefined ? realBalanceMap[student.id] : Number(student.balance || 0);

            return (
              <div
                key={student.id}
                onClick={() =>
                  openModal &&
                  openModal({
                    type: "studentDetail",
                    studentId: student.id,
                    groupId: sGroups[0]?.id || groups[0]?.id,
                  })
                }
                className="group relative p-4 rounded-3xl bg-white/60 dark:bg-white/[0.04] backdrop-blur-2xl border border-slate-200/60 dark:border-white/10 hover:border-blue-400/50 dark:hover:border-blue-500/40 shadow-xs hover:shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                {/* Upper: Ism va Nomer */}
                <div>
                  <div className="flex items-start gap-3">
                    <Avatar
                      name={student.name}
                      photo={student.avatar || student.photo}
                      src={student.avatar}
                      color={sGroups[0]?.color}
                      size={40}
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {student.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <Phone size={11} className="text-slate-400 shrink-0" />
                        <span className="truncate">
                          {displayPhone(student.phone) || "Telefon yo'q"}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Guruhi */}
                  <div className="mt-3.5 pt-3 border-t border-slate-200/50 dark:border-white/5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Guruhi:</span>
                      <div className="flex items-center gap-1 flex-wrap justify-end">
                        {sGroups.length === 0 ? (
                          <span className="text-slate-400 italic">Guruhsiz</span>
                        ) : (
                          sGroups.slice(0, 2).map((g) => (
                            <span
                              key={g.id}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-white/80 dark:bg-white/10 border border-slate-200/80 dark:border-white/15 text-slate-800 dark:text-slate-200"
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full shrink-0"
                                style={{ backgroundColor: g.color || "#3b82f6" }}
                              />
                              <span className="truncate max-w-[90px]">{g.name}</span>
                            </span>
                          ))
                        )}
                        {sGroups.length > 2 && (
                          <span className="text-[10px] text-slate-400 font-bold">
                            +{sGroups.length - 2}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Balansi */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Balansi:</span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-black ${
                          balanceNum < 0
                            ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                            : balanceNum > 0
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                            : "bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20"
                        }`}
                      >
                        <Wallet size={11} />
                        {money(balanceNum)} so'm
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom: So'nggi faollik */}
                <div className="mt-3.5 pt-2.5 border-t border-slate-200/40 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock size={12} className="text-slate-400" />
                    So'nggi faollik:
                  </span>
                  <span className="font-semibold text-slate-600 dark:text-slate-300">
                    {formatLastActivity(lastAct)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

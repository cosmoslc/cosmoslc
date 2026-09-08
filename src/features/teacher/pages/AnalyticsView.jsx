import { useState, useMemo } from "react";
import {
  BarChart3,
  TrendingUp,
  Award,
  Users,
  Calendar,
  Star,
  CheckCircle2,
  AlertTriangle,
  Wallet,
  CreditCard,
  BookOpen,
  UserCheck,
  Phone,
  Flame,
  Clock,
  Layers,
  Sparkles,
  Trophy,
  ArrowUpRight,
  Filter,
  Check,
  XCircle,
  HelpCircle,
} from "lucide-react";
import { money, displayPhone } from "../utils/helpers";
import { MONTHS_UZ } from "../utils/constants";
import { Avatar, EmptyState } from "../../../shared/components/primitives";
import { calculateStudentRealBalance } from "../../../shared/utils/prorata";

export function AnalyticsView({ teacher, directorData, appData, openModal }) {
  const [selectedGroupId, setSelectedGroupId] = useState("all");
  const [activeSection, setActiveSection] = useState("all"); // 'all' | 'top' | 'atRisk' | 'payments'
  const [searchQuery, setSearchQuery] = useState("");

  const groups = appData?.groups || [];
  const students = appData?.students || [];
  const attendance = appData?.attendance || [];
  const tasks = appData?.tasks || [];
  const payments = appData?.payments || directorData?.payments || [];
  const centerSettings = appData?.centerSettings || directorData?.centerSettings || {};

  // Teacher's groups
  const myGroups = useMemo(() => {
    return groups.filter(
      (g) => String(g.teacherHrId || g.teacherId) === String(teacher?.id)
    );
  }, [groups, teacher?.id]);

  const filteredGroups = useMemo(() => {
    return selectedGroupId === "all"
      ? myGroups
      : myGroups.filter((g) => String(g.id) === String(selectedGroupId));
  }, [selectedGroupId, myGroups]);

  const filteredGroupIds = useMemo(() => {
    return new Set(filteredGroups.map((g) => String(g.id)));
  }, [filteredGroups]);

  // Students belonging to filtered groups
  const groupStudents = useMemo(() => {
    return students.filter((s) => {
      if (Array.isArray(s.groupIds)) {
        return s.groupIds.some((gid) => filteredGroupIds.has(String(gid)));
      }
      return filteredGroupIds.has(String(s.groupId));
    });
  }, [students, filteredGroupIds]);

  // Real balance calculation for each student
  const realBalanceMap = useMemo(() => {
    const map = {};
    const allGroups = appData?.allGroups || appData?.groups || [];
    const allAtt = appData?.attendance || [];

    groupStudents.forEach((s) => {
      map[s.id] = calculateStudentRealBalance({
        student: s,
        groups: allGroups,
        payments,
        attendances: allAtt,
        centerSettings,
      });
    });
    return map;
  }, [groupStudents, appData?.allGroups, appData?.groups, appData?.attendance, payments, centerSettings]);

  // Filtered tasks
  const groupTasks = useMemo(() => {
    return tasks.filter((t) => filteredGroupIds.has(String(t.groupId)));
  }, [tasks, filteredGroupIds]);

  // Calculate detailed stats per student
  const studentDetailedStats = useMemo(() => {
    return groupStudents.map((s) => {
      let presentCount = 0;
      let lateCount = 0;
      let excusedCount = 0;
      let absentCount = 0;
      let totalLessons = 0;
      let sumRating = 0;
      let ratingCount = 0;

      // 1. Attendance analysis
      attendance.forEach((rec) => {
        if (!filteredGroupIds.has(String(rec.groupId))) return;
        const entry = rec.records?.[s.id];
        if (!entry) return;
        totalLessons++;
        if (entry.status === "present") presentCount++;
        else if (entry.status === "late") lateCount++;
        else if (entry.status === "excused") excusedCount++;
        else if (entry.status === "absent") absentCount++;

        if (entry.rating) {
          sumRating += Number(entry.rating);
          ratingCount++;
        }
      });

      const attendedCount = presentCount + lateCount;
      const attendanceRate =
        totalLessons > 0 ? Math.round((attendedCount / totalLessons) * 100) : 100;

      // 2. Tasks analysis
      let assignedTasksCount = 0;
      let submittedTasksCount = 0;
      let taskSumRating = 0;
      let taskRatingCount = 0;

      groupTasks.forEach((t) => {
        const studentInTaskGroup =
          (Array.isArray(s.groupIds) && s.groupIds.some((id) => String(id) === String(t.groupId))) ||
          String(s.groupId) === String(t.groupId);

        if (studentInTaskGroup) {
          assignedTasksCount++;
          const sub = t.submissions?.[s.id];
          if (sub && sub.status !== "pending") {
            submittedTasksCount++;
            if (sub.rating) {
              taskSumRating += Number(sub.rating);
              taskRatingCount++;
            }
          }
        }
      });

      const taskRate =
        assignedTasksCount > 0
          ? Math.round((submittedTasksCount / assignedTasksCount) * 100)
          : 100;

      const avgGrade =
        ratingCount > 0
          ? (sumRating / ratingCount).toFixed(1)
          : taskRatingCount > 0
          ? (taskSumRating / taskRatingCount).toFixed(1)
          : "5.0";

      // 3. Balance
      const balance = realBalanceMap[s.id] !== undefined ? realBalanceMap[s.id] : Number(s.balance || 0);

      // 4. Primary Group Info
      const sGroup =
        myGroups.find((g) =>
          Array.isArray(s.groupIds)
            ? s.groupIds.some((id) => String(id) === String(g.id))
            : String(s.groupId) === String(g.id)
        ) || myGroups[0];

      // 5. Composite Score for ranking (0 - 100)
      const gradeNum = parseFloat(avgGrade) || 4.0;
      const score = Math.round(
        attendanceRate * 0.45 + taskRate * 0.35 + (gradeNum / 5) * 20
      );

      // 6. Risk flags
      const riskReasons = [];
      if (attendanceRate < 75 && totalLessons >= 2) {
        riskReasons.push(`Davomat past (${attendanceRate}%)`);
      }
      if (absentCount >= 2) {
        riskReasons.push(`${absentCount} ta dars qoldirilgan`);
      }
      if (assignedTasksCount > 0 && assignedTasksCount - submittedTasksCount >= 2) {
        riskReasons.push(`${assignedTasksCount - submittedTasksCount} ta vazifa topshirilmagan`);
      }
      if (balance < 0) {
        riskReasons.push(`Qarzdorlik: ${money(Math.abs(balance))} so'm`);
      }

      const isTopPerformer = attendanceRate >= 85 && taskRate >= 75 && gradeNum >= 4.2;
      const isAtRisk = riskReasons.length > 0;

      return {
        ...s,
        groupName: sGroup?.name || "Guruhsiz",
        groupColor: sGroup?.color || "#3b82f6",
        attendanceRate,
        attendedCount,
        absentCount,
        lateCount,
        totalLessons,
        taskRate,
        assignedTasksCount,
        submittedTasksCount,
        avgGrade,
        balance,
        score,
        riskReasons,
        isTopPerformer,
        isAtRisk,
      };
    });
  }, [groupStudents, attendance, filteredGroupIds, groupTasks, realBalanceMap, myGroups]);

  // Aggregate Key Metrics (Top Cards)
  const keyMetrics = useMemo(() => {
    const totalStudents = studentDetailedStats.length;

    // 1. Retention Rate: Active (non-left / active learning) vs Total
    const activeStudents = studentDetailedStats.filter(
      (s) => s.status !== "left" && s.status !== "archived" && s.status !== "frozen"
    );
    const retentionRate =
      totalStudents > 0
        ? Math.round((activeStudents.length / totalStudents) * 100)
        : 100;

    // 2. Overall Attendance Rate
    let totalAttLessons = 0;
    let totalAttended = 0;
    let totalLate = 0;
    let totalAbsent = 0;

    attendance.forEach((rec) => {
      if (!filteredGroupIds.has(String(rec.groupId))) return;
      Object.entries(rec.records || {}).forEach(([sId, entry]) => {
        if (!entry) return;
        totalAttLessons++;
        if (entry.status === "present") totalAttended++;
        else if (entry.status === "late") {
          totalAttended++;
          totalLate++;
        } else if (entry.status === "absent") totalAbsent++;
      });
    });

    const overallAttendanceRate =
      totalAttLessons > 0
        ? Math.round((totalAttended / totalAttLessons) * 100)
        : 100;

    // 3. Lesson / Tasks Progress
    let totalTaskOpportunities = 0;
    let totalTasksCompleted = 0;

    groupTasks.forEach((t) => {
      studentDetailedStats.forEach((s) => {
        const studentInTask =
          (Array.isArray(s.groupIds) && s.groupIds.some((id) => String(id) === String(t.groupId))) ||
          String(s.groupId) === String(t.groupId);

        if (studentInTask) {
          totalTaskOpportunities++;
          const sub = t.submissions?.[s.id];
          if (sub && sub.status !== "pending") {
            totalTasksCompleted++;
          }
        }
      });
    });

    const lessonProgressRate =
      totalTaskOpportunities > 0
        ? Math.round((totalTasksCompleted / totalTaskOpportunities) * 100)
        : groupTasks.length > 0
        ? 100
        : 0;

    // 4. Payments Overview in teacher's groups
    const groupPayments = payments.filter((p) =>
      filteredGroupIds.has(String(p.groupId))
    );
    const totalRevenue = groupPayments.reduce(
      (acc, p) => acc + Number(p.amount || 0),
      0
    );
    const paidStudentsCount = studentDetailedStats.filter(
      (s) => s.balance >= 0
    ).length;
    const debtorStudentsCount = studentDetailedStats.filter(
      (s) => s.balance < 0
    ).length;
    const totalDebtAmount = studentDetailedStats
      .filter((s) => s.balance < 0)
      .reduce((acc, s) => acc + Math.abs(s.balance), 0);

    const paymentComplianceRate =
      totalStudents > 0
        ? Math.round((paidStudentsCount / totalStudents) * 100)
        : 100;

    return {
      totalStudents,
      activeStudentsCount: activeStudents.length,
      retentionRate,
      overallAttendanceRate,
      totalAttended,
      totalLate,
      totalAbsent,
      totalAttLessons,
      lessonProgressRate,
      totalTasksCompleted,
      totalTaskOpportunities,
      totalRevenue,
      paidStudentsCount,
      debtorStudentsCount,
      totalDebtAmount,
      paymentComplianceRate,
    };
  }, [studentDetailedStats, attendance, filteredGroupIds, groupTasks, payments]);

  // Top Performing Students (Sorted by highest composite score & attendance)
  const topStudents = useMemo(() => {
    return [...studentDetailedStats]
      .filter((s) => s.attendanceRate >= 80 || s.score >= 75)
      .sort((a, b) => b.score - a.score || b.attendanceRate - a.attendanceRate);
  }, [studentDetailedStats]);

  // At-Risk / Lagging Students (Sorted by lowest attendance & most risk flags)
  const atRiskStudents = useMemo(() => {
    return [...studentDetailedStats]
      .filter((s) => s.isAtRisk || s.attendanceRate < 75 || s.balance < 0)
      .sort((a, b) => b.riskReasons.length - a.riskReasons.length || a.attendanceRate - b.attendanceRate);
  }, [studentDetailedStats]);

  // Search filtered view for sections
  const filteredTopStudents = useMemo(() => {
    if (!searchQuery.trim()) return topStudents;
    const q = searchQuery.toLowerCase().trim();
    return topStudents.filter(
      (s) =>
        (s.name || "").toLowerCase().includes(q) ||
        (s.groupName || "").toLowerCase().includes(q)
    );
  }, [topStudents, searchQuery]);

  const filteredAtRiskStudents = useMemo(() => {
    if (!searchQuery.trim()) return atRiskStudents;
    const q = searchQuery.toLowerCase().trim();
    return atRiskStudents.filter(
      (s) =>
        (s.name || "").toLowerCase().includes(q) ||
        (s.groupName || "").toLowerCase().includes(q)
    );
  }, [atRiskStudents, searchQuery]);

  // 6-Month Trend Data for Chart
  const trendData = useMemo(() => {
    const now = new Date();
    const list = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const monthLabel = MONTHS_UZ[d.getMonth()]?.slice(0, 3) || "";

      // Attendance in this month
      const monthRecs = attendance.filter((a) => {
        const aDate = a.date || "";
        return aDate.startsWith(key) && filteredGroupIds.has(String(a.groupId));
      });

      let present = 0;
      let total = 0;
      let sumRating = 0;
      let rCount = 0;

      monthRecs.forEach((r) => {
        Object.values(r.records || {}).forEach((entry) => {
          if (!entry) return;
          total++;
          if (entry.status === "present" || entry.status === "late") present++;
          if (entry.rating) {
            sumRating += Number(entry.rating);
            rCount++;
          }
        });
      });

      // Payments in this month
      const monthPays = payments.filter((p) => {
        const pDate = p.month || p.date || "";
        return pDate.startsWith(key) && filteredGroupIds.has(String(p.groupId));
      });
      const monthRev = monthPays.reduce((acc, p) => acc + Number(p.amount || 0), 0);

      list.push({
        key,
        label: monthLabel,
        attendanceRate: total > 0 ? Math.round((present / total) * 100) : 0,
        avgRating: rCount > 0 ? (sumRating / rCount).toFixed(1) : "5.0",
        revenue: monthRev,
      });
    }
    return list;
  }, [attendance, payments, filteredGroupIds]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none">
      {/* 1. TOP HEADER & FILTER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <BarChart3 size={22} />
            </span>
            <span>Statistika</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
            Retention, davomat, dars progressi va o'quvchilar ko'rsatkichlari tahlili
          </p>
        </div>

        {/* Group Selector Dropdown */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/60 dark:bg-white/10 backdrop-blur-xl border border-slate-200/80 dark:border-white/15 shadow-2xs">
            <Filter size={14} className="text-slate-400" />
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="bg-transparent text-xs sm:text-sm font-semibold text-slate-800 dark:text-white focus:outline-none cursor-pointer pr-2"
            >
              <option value="all" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                Barcha guruhlar ({myGroups.length})
              </option>
              {myGroups.map((g) => (
                <option
                  key={g.id}
                  value={g.id}
                  className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. CORE KPI METRIC CARDS (Retention, Davomat, Dars progressi, To'lovlar) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CARD 1: RETENTION */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white/60 dark:bg-white/[0.04] backdrop-blur-2xl border border-slate-200/60 dark:border-white/10 shadow-xs hover:border-blue-400/40 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Retention (Saqlash)
              </span>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <UserCheck size={18} />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {keyMetrics.retentionRate}%
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Barqaror
              </span>
            </div>
          </div>
          <div className="mt-3.5 pt-2.5 border-t border-slate-200/50 dark:border-white/5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Faol o'quvchilar:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {keyMetrics.activeStudentsCount} / {keyMetrics.totalStudents} nafar
            </span>
          </div>
        </div>

        {/* CARD 2: DAVOMAT */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white/60 dark:bg-white/[0.04] backdrop-blur-2xl border border-slate-200/60 dark:border-white/10 shadow-xs hover:border-emerald-400/40 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Davomat darajasi
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Calendar size={18} />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {keyMetrics.overallAttendanceRate}%
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                  keyMetrics.overallAttendanceRate >= 85
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : keyMetrics.overallAttendanceRate >= 70
                    ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20"
                    : "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20"
                }`}
              >
                {keyMetrics.overallAttendanceRate >= 85
                  ? "Yuqori"
                  : keyMetrics.overallAttendanceRate >= 70
                  ? "O'rtacha"
                  : "Past"}
              </span>
            </div>
          </div>
          <div className="mt-3.5 pt-2.5 border-t border-slate-200/50 dark:border-white/5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Kelgan / Kech / Yo'q:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {keyMetrics.totalAttended} / {keyMetrics.totalLate} / {keyMetrics.totalAbsent}
            </span>
          </div>
        </div>

        {/* CARD 3: DARS PROGRESSI */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white/60 dark:bg-white/[0.04] backdrop-blur-2xl border border-slate-200/60 dark:border-white/10 shadow-xs hover:border-purple-400/40 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Dars progressi
              </span>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                <BookOpen size={18} />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {keyMetrics.lessonProgressRate}%
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                {groupTasks.length} ta vazifa
              </span>
            </div>
          </div>
          <div className="mt-3.5 pt-2.5 border-t border-slate-200/50 dark:border-white/5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Topshirilgan vazifalar:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {keyMetrics.totalTasksCompleted} / {keyMetrics.totalTaskOpportunities || keyMetrics.totalStudents} ta
            </span>
          </div>
        </div>

        {/* CARD 4: TO'LOVLAR */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white/60 dark:bg-white/[0.04] backdrop-blur-2xl border border-slate-200/60 dark:border-white/10 shadow-xs hover:border-amber-400/40 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                To'lovlar intizomi
              </span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Wallet size={18} />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {money(keyMetrics.totalRevenue)} so'm
              </span>
            </div>
          </div>
          <div className="mt-3.5 pt-2.5 border-t border-slate-200/50 dark:border-white/5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>To'lagan / Qarzdor:</span>
            <span className="font-bold">
              <span className="text-emerald-600 dark:text-emerald-400">
                {keyMetrics.paidStudentsCount} ta
              </span>{" "}
              /{" "}
              <span className="text-rose-600 dark:text-rose-400">
                {keyMetrics.debtorStudentsCount} ta
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* 3. SUB-SECTIONS SWITCHER BUTTONS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveSection("all")}
          className={`text-xs sm:text-sm font-bold px-4 py-2 rounded-2xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeSection === "all"
              ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25"
              : "bg-white/60 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-white/90 dark:hover:bg-white/20 border border-slate-200/60 dark:border-white/10"
          }`}
        >
          <Layers size={15} />
          <span>Umumiy ko'rinish</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection("top")}
          className={`text-xs sm:text-sm font-bold px-4 py-2 rounded-2xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeSection === "top"
              ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25"
              : "bg-white/60 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-white/90 dark:hover:bg-white/20 border border-slate-200/60 dark:border-white/10"
          }`}
        >
          <Trophy size={15} className="text-amber-400" />
          <span>Yaxshi o'zlashtirayotganlar ({topStudents.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection("atRisk")}
          className={`text-xs sm:text-sm font-bold px-4 py-2 rounded-2xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeSection === "atRisk"
              ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25"
              : "bg-white/60 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-white/90 dark:hover:bg-white/20 border border-slate-200/60 dark:border-white/10"
          }`}
        >
          <AlertTriangle size={15} className="text-rose-500" />
          <span>Orqada qolayotganlar ({atRiskStudents.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection("payments")}
          className={`text-xs sm:text-sm font-bold px-4 py-2 rounded-2xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeSection === "payments"
              ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25"
              : "bg-white/60 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-white/90 dark:hover:bg-white/20 border border-slate-200/60 dark:border-white/10"
          }`}
        >
          <CreditCard size={15} />
          <span>To'lovlar tahlili</span>
        </button>
      </div>

      {/* 4. MAIN CONTENT PANELS */}
      {/* -------------------- SECTION 1: UMUMIY KO'RINISh & 6 OYLIK TREND -------------------- */}
      {activeSection === "all" && (
        <div className="space-y-6">
          {/* Trend Chart */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white/60 dark:bg-white/[0.04] backdrop-blur-2xl border border-slate-200/60 dark:border-white/10 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-2.5">
                <TrendingUp size={18} className="text-emerald-500" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  6 oylik dinamika: Davomat % va O'rtacha o'zlashtirish
                </h3>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Davomat %
                </span>
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> O'rtacha ball (5)
                </span>
              </div>
            </div>

            <div className="flex items-end gap-3 h-48 sm:h-56 pt-6 px-2">
              {trendData.map((d, i) => {
                const maxVal = 100;
                const attHeight = Math.max((d.attendanceRate / maxVal) * 100, 8);
                const gradeHeight = Math.max((parseFloat(d.avgGrade || d.avgRating || 0) / 5) * 100, 10);

                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="w-full flex items-end justify-center gap-1.5 h-36 sm:h-44">
                      {/* Attendance bar */}
                      <div
                        className="w-1/3 max-w-[28px] bg-gradient-to-t from-blue-600 to-cyan-500 rounded-t-xl transition-all duration-300 group-hover:brightness-110 relative"
                        style={{ height: `${attHeight}%` }}
                        title={`Davomat: ${d.attendanceRate}%`}
                      >
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-900 text-white whitespace-nowrap pointer-events-none z-10">
                          {d.attendanceRate}%
                        </span>
                      </div>
                      {/* Grade bar */}
                      <div
                        className="w-1/3 max-w-[28px] bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-xl transition-all duration-300 group-hover:brightness-110 relative"
                        style={{ height: `${gradeHeight}%` }}
                        title={`O'rtacha ball: ${d.avgRating}`}
                      >
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-900 text-emerald-200 whitespace-nowrap pointer-events-none z-10">
                          ⭐ {d.avgRating}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-1">
                      {d.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dual Columns: Top Performers & Lagging Students Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Students Mini List */}
            <div className="p-5 rounded-3xl bg-white/60 dark:bg-white/[0.04] backdrop-blur-2xl border border-slate-200/60 dark:border-white/10 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <Trophy size={18} className="text-amber-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Yetakchi o'quvchilar
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSection("top")}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  Barchasi ({topStudents.length}) <ArrowUpRight size={13} />
                </button>
              </div>

              <div className="divide-y divide-slate-200/50 dark:divide-white/5 mt-2">
                {topStudents.slice(0, 4).map((s, idx) => (
                  <div
                    key={s.id}
                    onClick={() => openModal && openModal({ type: "studentDetail", studentId: s.id })}
                    className="py-3 px-1 flex items-center justify-between hover:bg-slate-500/[0.04] rounded-2xl transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 text-center text-xs font-black text-amber-500">
                        {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                      </div>
                      <Avatar
                        name={s.name}
                        photo={s.avatar || s.photo}
                        src={s.avatar}
                        color={s.groupColor}
                        size={36}
                      />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                          {s.name}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {s.groupName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          {s.attendanceRate}% davomat
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center justify-end gap-1">
                          <Star size={11} className="text-amber-400 fill-amber-400" />
                          <span>{s.avgGrade}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {topStudents.length === 0 && (
                  <p className="text-xs text-slate-400 py-6 text-center">
                    Hozircha yetakchi o'quvchilar aniqlanmadi
                  </p>
                )}
              </div>
            </div>

            {/* At-Risk Students Mini List */}
            <div className="p-5 rounded-3xl bg-white/60 dark:bg-white/[0.04] backdrop-blur-2xl border border-slate-200/60 dark:border-white/10 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={18} className="text-rose-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Diqqat talab o'quvchilar
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSection("atRisk")}
                  className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
                >
                  Barchasi ({atRiskStudents.length}) <ArrowUpRight size={13} />
                </button>
              </div>

              <div className="divide-y divide-slate-200/50 dark:divide-white/5 mt-2">
                {atRiskStudents.slice(0, 4).map((s) => (
                  <div
                    key={s.id}
                    onClick={() => openModal && openModal({ type: "studentDetail", studentId: s.id })}
                    className="py-3 px-1 flex items-center justify-between hover:bg-slate-500/[0.04] rounded-2xl transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={s.name}
                        photo={s.avatar || s.photo}
                        src={s.avatar}
                        color={s.groupColor}
                        size={36}
                      />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors truncate">
                          {s.name}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {s.groupName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                        {s.riskReasons[0] || `${s.attendanceRate}% davomat`}
                      </span>
                      {s.riskReasons.length > 1 && (
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          +{s.riskReasons.length - 1} ta qo'shimcha sabab
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {atRiskStudents.length === 0 && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 py-6 text-center font-bold">
                    Ajoyib! Barcha o'quvchilar yaxshi o'zlashtirmoqda 🎉
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- SECTION 2: YAXShI O'ZLAShTIRAYOTGAN O'QUVChILAR -------------------- */}
      {activeSection === "top" && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white/60 dark:bg-white/[0.04] backdrop-blur-2xl border border-slate-200/60 dark:border-white/10 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/50 dark:border-white/10">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Trophy size={20} className="text-amber-400" />
                <span>Yaxshi o'zlashtirayotgan o'quvchilar ro'yxati</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Yuqori davomat, a'lo baholar va to'liq bajarilgan vazifalar egalari
              </p>
            </div>
            <div className="w-full sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ism bo'yicha qidirish..."
                className="w-full px-3 py-1.5 text-xs rounded-xl bg-white/80 dark:bg-white/10 border border-slate-200/80 dark:border-white/15 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse select-none">
              <thead>
                <tr className="border-b border-slate-200/60 dark:border-white/10 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4 w-12 text-center">O'rin</th>
                  <th className="py-3 px-4">O'quvchi</th>
                  <th className="py-3 px-4">Guruhi</th>
                  <th className="py-3 px-4 text-center">Davomat</th>
                  <th className="py-3 px-4 text-center">Vazifalar</th>
                  <th className="py-3 px-4 text-center">O'rtacha ball</th>
                  <th className="py-3 px-4 text-right">Reyting bali</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-white/5 text-sm">
                {filteredTopStudents.map((s, idx) => (
                  <tr
                    key={s.id}
                    onClick={() => openModal && openModal({ type: "studentDetail", studentId: s.id })}
                    className="hover:bg-blue-500/[0.04] dark:hover:bg-white/[0.03] transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 text-center text-xs font-black">
                      {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx + 1}`}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={s.name}
                          photo={s.avatar || s.photo}
                          src={s.avatar}
                          color={s.groupColor}
                          size={38}
                        />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {s.name}
                          </p>
                          <p className="text-xs text-slate-400">{displayPhone(s.phone)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-white/80 dark:bg-white/10 border border-slate-200/80 dark:border-white/15 text-slate-800 dark:text-slate-200">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: s.groupColor }}
                        />
                        <span>{s.groupName}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {s.attendanceRate}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap text-xs font-bold text-slate-700 dark:text-slate-300">
                      {s.submittedTasksCount} / {s.assignedTasksCount} ta
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-500">
                        <Star size={13} className="fill-amber-400" />
                        {s.avgGrade}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-extrabold bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-xs">
                        <Sparkles size={12} /> {s.score} ball
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredTopStudents.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                      Yetakchi o'quvchilar topilmadi
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* -------------------- SECTION 3: ORQADA QOLAYOTGAN O'QUVChILAR -------------------- */}
      {activeSection === "atRisk" && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white/60 dark:bg-white/[0.04] backdrop-blur-2xl border border-slate-200/60 dark:border-white/10 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/50 dark:border-white/10">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle size={20} className="text-rose-500" />
                <span>Orqada qolayotgan va diqqat talab o'quvchilar</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Past davomat, ko'p dars qoldirgan, vazifa topshirmagan yoki qarzdorligi bor o'quvchilar
              </p>
            </div>
            <div className="w-full sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ism bo'yicha qidirish..."
                className="w-full px-3 py-1.5 text-xs rounded-xl bg-white/80 dark:bg-white/10 border border-slate-200/80 dark:border-white/15 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAtRiskStudents.map((s) => (
              <div
                key={s.id}
                onClick={() => openModal && openModal({ type: "studentDetail", studentId: s.id })}
                className="p-4 rounded-2xl bg-white/60 dark:bg-white/[0.03] border border-rose-500/20 hover:border-rose-500/40 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={s.name}
                        photo={s.avatar || s.photo}
                        src={s.avatar}
                        color={s.groupColor}
                        size={42}
                      />
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                          {s.name}
                        </h4>
                        <span className="inline-flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: s.groupColor }}
                          />
                          {s.groupName}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-rose-600 dark:text-rose-400">
                        {s.attendanceRate}% davomat
                      </span>
                    </div>
                  </div>

                  {/* Risk Badges */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {s.riskReasons.map((reason, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1"
                      >
                        <AlertTriangle size={11} />
                        {reason}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-white/5 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium">
                    <Phone size={12} className="text-slate-400" />
                    {displayPhone(s.phone) || "Telefon kiritilmagan"}
                  </span>
                  <span className="font-bold text-blue-600 dark:text-blue-400 group-hover:underline flex items-center gap-1">
                    Profilni ko'rish <ArrowUpRight size={13} />
                  </span>
                </div>
              </div>
            ))}

            {filteredAtRiskStudents.length === 0 && (
              <div className="col-span-2 py-10 text-center text-slate-400 text-xs">
                Orqada qolayotgan o'quvchilar yo'q
              </div>
            )}
          </div>
        </div>
      )}

      {/* -------------------- SECTION 4: TO'LOVLAR TAHLILI -------------------- */}
      {activeSection === "payments" && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white/60 dark:bg-white/[0.04] backdrop-blur-2xl border border-slate-200/60 dark:border-white/10 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/50 dark:border-white/10">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard size={20} className="text-emerald-500" />
                <span>Guruhlar bo'yicha to'lovlar monitoringi</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Tushumlar, to'lagan va qarzdor o'quvchilar tahlili
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                To'laganlar: {keyMetrics.paidStudentsCount} nafar
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                Qarzdorlar: {keyMetrics.debtorStudentsCount} nafar
              </span>
            </div>
          </div>

          {/* Group breakdown cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGroups.map((g) => {
              const gStudents = studentDetailedStats.filter(
                (s) =>
                  (Array.isArray(s.groupIds) && s.groupIds.some((id) => String(id) === String(g.id))) ||
                  String(s.groupId) === String(g.id)
              );
              const gPaidCount = gStudents.filter((s) => s.balance >= 0).length;
              const gDebtorCount = gStudents.filter((s) => s.balance < 0).length;
              const gDebtTotal = gStudents
                .filter((s) => s.balance < 0)
                .reduce((acc, s) => acc + Math.abs(s.balance), 0);

              const gPays = payments.filter((p) => String(p.groupId) === String(g.id));
              const gTotalRevenue = gPays.reduce((acc, p) => acc + Number(p.amount || 0), 0);
              const gRate = gStudents.length > 0 ? Math.round((gPaidCount / gStudents.length) * 100) : 100;

              return (
                <div
                  key={g.id}
                  className="p-4 rounded-2xl bg-white/60 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/10 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: g.color || "#3b82f6" }}
                      />
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {g.name}
                      </h4>
                    </div>
                    <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                      {gRate}% to'langan
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center justify-between">
                      <span>Jami o'quvchi:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {gStudents.length} nafar
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Jami tushum:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {money(gTotalRevenue)} so'm
                      </span>
                    </div>
                    {gDebtTotal > 0 && (
                      <div className="flex items-center justify-between">
                        <span>Jami qarz:</span>
                        <span className="font-bold text-rose-600 dark:text-rose-400">
                          {money(gDebtTotal)} so'm ({gDebtorCount} ta)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-slate-200/80 dark:bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                      style={{ width: `${gRate}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

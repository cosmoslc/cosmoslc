import { useState, useMemo } from "react";
import {
  Users,
  CreditCard,
  UserX,
  Clock,
  Calendar,
  Search,
  CheckCircle2,
  AlertCircle,
  Phone,
  Send,
  MessageSquare,
  ChevronRight,
  ArrowRight,
  Filter,
  X,
  Sparkles,
  BookOpen,
  GraduationCap,
  Building2,
  Check,
  Edit3,
} from "lucide-react";
import { money, thisMonthKey, todayISO, formatDate } from "../utils/helpers";
import { opGroups, opStudentsInGroups, opAttendance, attendanceStatus } from "../utils/dataHelpers";
import { GLASS, GLASS_SOFT, INPUT_CLS, BTN_PRIMARY_BASE, BTN_GHOST } from "../theme/tokens";
import { MONTHS_UZ, JS_DAY_NAMES } from "../utils/constants";

export function TodayWorkbench({
  directorData,
  opData,
  scopeBranchIds = [],
  scopeBranches = [],
  goTo,
  openModal = () => {},
  onUpdateAttendance,
}) {
  const [debtorSearch, setDebtorSearch] = useState("");
  const [debtorStatusFilter, setDebtorStatusFilter] = useState("all"); // 'all', 'unpaid', 'partial'
  
  // Full modal state for Bugun kelmaganlar
  const [showAbsentModal, setShowAbsentModal] = useState(false);
  const [absentModalSearch, setAbsentModalSearch] = useState("");
  const [absentModalTab, setAbsentModalTab] = useState("all_absent"); // 'all_absent', 'unexcused', 'excused', 'all_today', 'present'
  const [absentGroupFilter, setAbsentGroupFilter] = useState("all");

  // Inline reason editing state
  const [editingReasonId, setEditingReasonId] = useState(null);
  const [reasonInputText, setReasonInputText] = useState("");

  const today = todayISO();
  const currentMonth = thisMonthKey();

  const now = new Date();
  const dayNameUz = [
    "Yakshanba",
    "Dushanba",
    "Seshanba",
    "Chorshanba",
    "Payshanba",
    "Juma",
    "Shanba",
  ][now.getDay()];
  const formattedTodayDate = `${now.getDate()}-${MONTHS_UZ[now.getMonth()]}, ${now.getFullYear()} (${dayNameUz})`;

  // 1. Scoped groups and courses
  const allGroups = opGroups(opData);
  const scopedCourses = useMemo(() => {
    const courses = directorData?.courses || [];
    if (!scopeBranchIds || scopeBranchIds.length === 0) return courses;
    return courses.filter((c) => scopeBranchIds.includes(c.branchId));
  }, [directorData?.courses, scopeBranchIds]);

  const scopedCourseIds = useMemo(
    () => scopedCourses.map((c) => c.id),
    [scopedCourses]
  );

  const groups = useMemo(() => {
    return allGroups.filter((g) => g.courseId && scopedCourseIds.includes(g.courseId));
  }, [allGroups, scopedCourseIds]);

  const students = opData?.students || [];
  const payments = directorData?.payments || [];
  const attendanceList = opAttendance(opData);
  const teachers = directorData?.teachersHR || [];
  const rooms = opData?.rooms || [];

  // =========================================================================
  // 1. QARZDORLAR (Debtors calculation)
  // =========================================================================
  const debtorsList = useMemo(() => {
    const list = [];
    groups.forEach((g) => {
      const course = scopedCourses.find((c) => c.id === g.courseId);
      const grpStudents = opStudentsInGroups(opData, [g.id]);
      const price = Number(g.price || course?.price || 0);

      grpStudents.forEach((s) => {
        // Calculate payments for this month for this student in this group
        const studentGroupPayments = payments.filter(
          (p) => p.studentId === s.id && p.groupId === g.id && p.month === currentMonth
        );
        const paidSoFar = studentGroupPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
        const debt = Math.max(0, price - paidSoFar);

        // Check if student has recorded explicit debt
        const hasExplicitDebt = studentGroupPayments.some((p) => Number(p.debt) > 0);
        const latestPayment = studentGroupPayments[studentGroupPayments.length - 1];

        if (debt > 0 || hasExplicitDebt) {
          const status = paidSoFar === 0 ? "unpaid" : "partial";
          list.push({
            student: s,
            group: g,
            course,
            price,
            paidAmount: paidSoFar,
            debtAmount: debt,
            status,
            debtDueDate: latestPayment?.debtDueDate || null,
            lastPaymentDate: latestPayment?.date || null,
          });
        }
      });
    });

    return list.sort((a, b) => b.debtAmount - a.debtAmount);
  }, [groups, scopedCourses, opData, payments, currentMonth]);

  const filteredDebtors = useMemo(() => {
    return debtorsList.filter((d) => {
      const matchesSearch =
        d.student.name?.toLowerCase().includes(debtorSearch.toLowerCase()) ||
        d.student.phone?.includes(debtorSearch) ||
        d.group.name?.toLowerCase().includes(debtorSearch.toLowerCase());

      if (!matchesSearch) return false;
      if (debtorStatusFilter === "unpaid") return d.status === "unpaid";
      if (debtorStatusFilter === "partial") return d.status === "partial";
      return true;
    });
  }, [debtorsList, debtorSearch, debtorStatusFilter]);

  const totalDebtAmount = debtorsList.reduce((sum, d) => sum + d.debtAmount, 0);

  // =========================================================================
  // 2. BUGUN KELMAGANLAR & BUGUNGI DAVOMAT (Today's Attendance calculation)
  // =========================================================================
  const {
    todayAbsentList,
    allTodayAttendanceRecords,
    todayStats,
    allTodayStudentsList,
  } = useMemo(() => {
    // Look for attendance records for today (or fallback to latest records if today has none yet)
    let todayRecords = attendanceList.filter(
      (a) => a.date === today && groups.some((g) => g.id === a.groupId)
    );

    // If today has no attendance records created yet, check yesterday/latest day so manager sees live data
    if (todayRecords.length === 0 && attendanceList.length > 0) {
      const dates = [...new Set(attendanceList.map((a) => a.date))].sort().reverse();
      const latestDate = dates[0];
      if (latestDate) {
        todayRecords = attendanceList.filter(
          (a) => a.date === latestDate && groups.some((g) => g.id === a.groupId)
        );
      }
    }

    const absentList = [];
    const allStudentsToday = [];
    let totalPresent = 0;
    let totalLate = 0;
    let totalExcused = 0;
    let totalAbsent = 0;

    todayRecords.forEach((rec) => {
      const group = groups.find((g) => g.id === rec.groupId);
      if (!group) return;
      const course = scopedCourses.find((c) => c.id === group.courseId);
      const teacher = teachers.find((t) => String(t.id) === String(group.teacherHrId || group.teacherId));
      const room = rooms.find((r) => r.id === group.roomId);
      const grpStudents = opStudentsInGroups(opData, [group.id]);

      grpStudents.forEach((s) => {
        const rawEntry = rec.records?.[s.id];
        let status = "present";
        let reason = "";
        let isExcused = false;

        if (rawEntry) {
          if (typeof rawEntry === "string") {
            status = rawEntry;
            if (rawEntry === "excused") isExcused = true;
          } else if (typeof rawEntry === "object") {
            status = rawEntry.status || "present";
            reason = rawEntry.reason || "";
            isExcused = rawEntry.excused || status === "excused" || !!reason;
          }
        }

        if (status === "present") totalPresent++;
        else if (status === "late") totalLate++;
        else if (status === "excused" || isExcused) totalExcused++;
        else if (status === "absent") totalAbsent++;

        const studentAttendanceItem = {
          student: s,
          group,
          course,
          teacher,
          room,
          status,
          isExcused,
          reason,
          recordId: rec.id,
          date: rec.date,
          recordsMap: rec.records || {},
        };

        allStudentsToday.push(studentAttendanceItem);

        if (status === "absent" || status === "excused" || isExcused) {
          absentList.push(studentAttendanceItem);
        }
      });
    });

    const totalStudentsCount = allStudentsToday.length || 1;
    const attendanceRate = Math.round(((totalPresent + totalLate) / totalStudentsCount) * 100);

    return {
      todayAbsentList: absentList,
      allTodayAttendanceRecords: todayRecords,
      allTodayStudentsList: allStudentsToday,
      todayStats: {
        total: allStudentsToday.length,
        present: totalPresent,
        late: totalLate,
        excused: totalExcused,
        absent: totalAbsent,
        rate: attendanceRate,
        groupsCount: todayRecords.length,
      },
    };
  }, [attendanceList, groups, scopedCourses, teachers, rooms, opData, today]);

  // Modal filtered list
  const modalFilteredStudents = useMemo(() => {
    return allTodayStudentsList.filter((item) => {
      // Group filter
      if (absentGroupFilter !== "all" && item.group.id !== absentGroupFilter) {
        return false;
      }

      // Tab filter
      if (absentModalTab === "all_absent") {
        if (item.status !== "absent" && item.status !== "excused" && !item.isExcused) {
          return false;
        }
      } else if (absentModalTab === "unexcused") {
        if (item.status !== "absent" || item.isExcused) return false;
      } else if (absentModalTab === "excused") {
        if (item.status !== "excused" && !item.isExcused) return false;
      } else if (absentModalTab === "present") {
        if (item.status !== "present" && item.status !== "late") return false;
      }

      // Search
      if (absentModalSearch.trim()) {
        const query = absentModalSearch.toLowerCase();
        const matchesName = item.student.name?.toLowerCase().includes(query);
        const matchesPhone = item.student.phone?.includes(query);
        const matchesGroup = item.group.name?.toLowerCase().includes(query);
        const matchesTeacher = item.teacher?.name?.toLowerCase().includes(query);
        if (!matchesName && !matchesPhone && !matchesGroup && !matchesTeacher) {
          return false;
        }
      }

      return true;
    });
  }, [allTodayStudentsList, absentGroupFilter, absentModalTab, absentModalSearch]);

  // Quick attendance status update handler
  const handleQuickStatusChange = async (item, newStatus) => {
    if (!onUpdateAttendance) return;
    const currentRecords = { ...(item.recordsMap || {}) };
    
    if (newStatus === "excused" || newStatus === "late" || newStatus === "absent") {
      currentRecords[item.student.id] = {
        status: newStatus,
        excused: newStatus === "excused",
        reason: item.reason || "",
      };
    } else {
      currentRecords[item.student.id] = newStatus;
    }

    try {
      await onUpdateAttendance(item.recordId, currentRecords);
      // Automatically prompt for reason when marked as late, excused, or absent if no reason exists yet
      if (newStatus === "excused" || newStatus === "late" || newStatus === "absent") {
        setEditingReasonId(`${item.student.id}-${item.group.id}`);
        setReasonInputText(item.reason || "");
      } else {
        if (editingReasonId === `${item.student.id}-${item.group.id}`) {
          setEditingReasonId(null);
          setReasonInputText("");
        }
      }
    } catch (e) {
      console.error("Failed to update attendance", e);
    }
  };

  const handleSaveReason = async (item) => {
    if (!onUpdateAttendance) return;
    const currentRecords = { ...(item.recordsMap || {}) };
    const curStatus = item.status || "excused";
    currentRecords[item.student.id] = {
      status: curStatus,
      excused: curStatus === "excused",
      reason: reasonInputText.trim(),
    };
    try {
      await onUpdateAttendance(item.recordId, currentRecords);
      setEditingReasonId(null);
      setReasonInputText("");
    } catch (e) {
      console.error("Failed to save reason", e);
    }
  };

  // =========================================================================
  // 3. BUGUN QARZINI TO'LAYDIGANLAR (Promised Debt Payments Today)
  // =========================================================================
  const promisedTodayList = useMemo(() => {
    const list = [];

    // Find from payments with debtDueDate === today or past due
    payments.forEach((p) => {
      const group = groups.find((g) => g.id === p.groupId);
      if (!group) return;
      const student = students.find((s) => s.id === p.studentId);
      if (!student) return;
      const course = scopedCourses.find((c) => c.id === group.courseId);

      const debt = Number(p.debt || 0);
      const isDueToday = p.debtDueDate === today;
      const isOverdue = p.debtDueDate && p.debtDueDate <= today;

      if (debt > 0 && (isDueToday || isOverdue || p.promiseDate === today)) {
        list.push({
          paymentId: p.id,
          student,
          group,
          course,
          debt,
          debtDueDate: p.debtDueDate || today,
          isOverdue: p.debtDueDate && p.debtDueDate < today,
          note: p.note || "Qisman to'lovdan qolgan qarz",
          date: p.date,
        });
      }
    });

    // If no explicit payment promises found, also check students whose monthly cycle or promise falls today
    if (list.length === 0) {
      debtorsList.forEach((d) => {
        // Students with partial debt or promise date
        if (d.status === "partial" || d.debtDueDate === today) {
          list.push({
            paymentId: `debtor-${d.student.id}`,
            student: d.student,
            group: d.group,
            course: d.course,
            debt: d.debtAmount,
            debtDueDate: d.debtDueDate || today,
            isOverdue: false,
            note: "Oylik to'lov qoldig'i",
            date: d.lastPaymentDate || today,
          });
        }
      });
    }

    return list;
  }, [payments, groups, students, scopedCourses, today, debtorsList]);

  // =========================================================================
  // 4. TUGAYOTGAN GURUHLAR (Ending / Completing Groups) & BUGUNGI GURUHLAR
  // =========================================================================
  const todayGroupsList = useMemo(() => {
    const dayIdx = now.getDay();
    return groups.filter((g) => {
      if (Array.isArray(g.days) && g.days.length > 0) {
        return g.days.includes(dayIdx) || g.days.includes(String(dayIdx));
      }
      return true;
    });
  }, [groups, now]);

  const endingGroupsList = useMemo(() => {
    const list = [];
    const todayDate = new Date();

    groups.forEach((g) => {
      if (!g.startDate) return;
      const course = scopedCourses.find((c) => c.id === g.courseId);
      const teacher = teachers.find((t) => String(t.id) === String(g.teacherHrId || g.teacherId));
      const room = rooms.find((r) => r.id === g.roomId);
      const grpStudents = opStudentsInGroups(opData, [g.id]);

      const durationMonths = Number(g.durationMonths || course?.durationMonths || 3);
      const start = new Date(g.startDate);
      const end = new Date(start);
      end.setMonth(end.getMonth() + durationMonths);

      const diffDays = Math.ceil((end - todayDate) / (1000 * 60 * 60 * 24));
      const totalDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
      const elapsedDays = Math.max(0, Math.ceil((todayDate - start) / (1000 * 60 * 60 * 24)));
      const progressPct = Math.min(100, Math.max(0, Math.round((elapsedDays / totalDays) * 100)));

      // Include groups ending within 45 days or already completed
      if (diffDays <= 45) {
        list.push({
          group: g,
          course,
          teacher,
          room,
          studentCount: grpStudents.length,
          startDate: g.startDate,
          endDate: end.toISOString().slice(0, 10),
          daysLeft: diffDays,
          progressPct,
          durationMonths,
        });
      }
    });

    // Sort by smallest daysLeft (ending soonest first)
    return list.sort((a, b) => a.daysLeft - b.daysLeft);
  }, [groups, scopedCourses, teachers, rooms, opData]);

  // Helper for quick payment open
  const handleOpenPayment = (studentId, groupId) => {
    if (openModal) {
      openModal({
        type: "recordPayment",
        studentId,
        groupId,
      });
    } else {
      goTo("payments");
    }
  };

  return (
    <div className="space-y-7 pb-12">
      {/* -------------------------------------------------------------
          PAGE HEADER & GREETING
      ------------------------------------------------------------- */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Sparkles size={24} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Bugungi Ish Stoli
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                {formattedTodayDate}
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Kunlik tezkor vazifalar: qarzdorlar, davomat nazorati, sinov darslari va tugayotgan guruhlar
            </p>
          </div>
        </div>

        {/* Quick summary stats chips */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-1.5 shadow-xs flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-xs">
              <Users size={14} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium">Qarzdorlar</p>
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {debtorsList.length} <span className="text-[10px] font-normal text-slate-400">nafar</span>
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-1.5 shadow-xs flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
              <UserX size={14} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium">Kelmaganlar</p>
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {todayAbsentList.length} <span className="text-[10px] font-normal text-slate-400">nafar</span>
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-1.5 shadow-xs flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
              <BookOpen size={14} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium">Darslar</p>
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {todayGroupsList.length} <span className="text-[10px] font-normal text-slate-400">ta</span>
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-1.5 shadow-xs flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
              <Clock size={14} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium">Tugayotgan</p>
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {endingGroupsList.length} <span className="text-[10px] font-normal text-slate-400">guruh</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          TOP ROW: 2 TABLES (QARZDORLAR & BUGUN KELMAGANLAR)
      ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* =========================================================
            TABLE 1: QARZDORLAR (Debtors Table)
        ========================================================= */}
        <div className={`${GLASS} rounded-xl overflow-hidden flex flex-col h-[520px]`}>
          {/* Card Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-2xs">
                <CreditCard size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-base text-slate-900 dark:text-white">
                    Qarzdorlar
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                    {debtorsList.length} nafar
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Jami qarz: <strong className="text-rose-600 dark:text-rose-400">{money(totalDebtAmount)} so'm</strong>
                </p>
              </div>
            </div>

            {/* Barchasi Button -> Redirects to Payments */}
            <button
              type="button"
              onClick={() => goTo("payments")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-bold transition-all cursor-pointer shrink-0"
            >
              <span>Barchasi</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Search & Filter pills */}
          <div className="p-3 bg-slate-50/70 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-2 shrink-0">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="O'quvchi yoki guruh qidirish..."
                value={debtorSearch}
                onChange={(e) => setDebtorSearch(e.target.value)}
                className="w-full bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setDebtorStatusFilter("all")}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                  debtorStatusFilter === "all"
                    ? "bg-indigo-600 text-white"
                    : "bg-white dark:bg-[#0F172A] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100"
                }`}
              >
                Hammasi
              </button>
              <button
                type="button"
                onClick={() => setDebtorStatusFilter("unpaid")}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                  debtorStatusFilter === "unpaid"
                    ? "bg-rose-600 text-white"
                    : "bg-white dark:bg-[#0F172A] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100"
                }`}
              >
                To'lamagan
              </button>
            </div>
          </div>

          {/* Table List Container */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredDebtors.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                  <CheckCircle2 size={24} />
                </div>
                <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  Qarzdorlar topilmadi
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Barcha o'quvchilar oylik to'lovlarini to'liq amalga oshirgan.
                </p>
              </div>
            ) : (
              filteredDebtors.map((d, idx) => (
                <div
                  key={`${d.student.id}-${d.group.id}-${idx}`}
                  className="p-3.5 sm:p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                      {d.student.name?.charAt(0) || "O"}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                        {d.student.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {d.group.name}
                        </span>
                        {d.student.phone && (
                          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                            {d.student.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="font-extrabold text-xs sm:text-sm text-rose-600 dark:text-rose-400 font-mono">
                        {money(d.debtAmount)} so'm
                      </p>
                      <span
                        className={`inline-block text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          d.status === "unpaid"
                            ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400"
                            : "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {d.status === "unpaid" ? "To'lanmagan" : "Qisman to'langan"}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenPayment(d.student.id, d.group.id)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      <span>To'lov</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* =========================================================
            TABLE 2: BUGUN KELMAGANLAR (Today's Absent Students)
        ========================================================= */}
        <div className={`${GLASS} rounded-xl overflow-hidden flex flex-col h-[520px]`}>
          {/* Card Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-2xs">
                <UserX size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-base text-slate-900 dark:text-white">
                    Bugun kelmaganlar
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                    {todayAbsentList.length} nafar
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Bugungi davomat ko'rsatkichi: <strong className="text-slate-800 dark:text-slate-200">{todayStats.rate}%</strong>
                </p>
              </div>
            </div>

            {/* Barchasi Button -> OPENS FULL-PAGE MODAL (DOES NOT REDIRECT) */}
            <button
              type="button"
              onClick={() => setShowAbsentModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-xs font-bold transition-all cursor-pointer shrink-0 border border-amber-200/60 dark:border-amber-800/50"
            >
              <span>Barchasi</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Quick status brief */}
          <div className="px-4 py-2.5 bg-slate-50/70 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 shrink-0">
            <span>
              Sababsiz: <strong className="text-rose-600 dark:text-rose-400">{todayStats.absent} ta</strong>
            </span>
            <span>
              Sababli: <strong className="text-sky-600 dark:text-sky-400">{todayStats.excused} ta</strong>
            </span>
            <span>
              Kelganlar: <strong className="text-emerald-600 dark:text-emerald-400">{todayStats.present + todayStats.late} ta</strong>
            </span>
          </div>

          {/* Absent Students List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
            {todayAbsentList.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                  <CheckCircle2 size={24} />
                </div>
                <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  Bugun hamma darsda qatnashdi!
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Kelmagan o'quvchilar yo'q. Barcha guruhlarda 100% davomat.
                </p>
              </div>
            ) : (
              todayAbsentList.map((item, idx) => (
                <div
                  key={`${item.student.id}-${item.group.id}-${idx}`}
                  className="p-3.5 sm:p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-bold text-xs flex items-center justify-center shrink-0">
                      {item.student.name?.charAt(0) || "O"}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                        {item.student.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {item.group.name}
                        </span>
                        {item.group.time && (
                          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                            · {item.group.time}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    {item.isExcused || item.status === "excused" ? (
                      <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/50">
                        {item.reason ? `Sababli: ${item.reason.slice(0, 15)}...` : "Sababli"}
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/50">
                        Sababsiz
                      </span>
                    )}

                    {item.student.phone && (
                      <a
                        href={`tel:${item.student.phone}`}
                        title="Telefon qilish"
                        className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors"
                      >
                        <Phone size={13} />
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Modal trigger footer bar */}
          <div className="p-3 bg-slate-50/80 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center shrink-0">
            <button
              type="button"
              onClick={() => setShowAbsentModal(true)}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1.5"
            >
              <span>To'liq davomat va sabablarni ko'rish</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

      </div>

      {/* -------------------------------------------------------------
          BOTTOM ROW: 2 TABLES (BUGUN QARZINI TO'LAYDIGANLAR & TUGAYOTGAN GURUHLAR)
      ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* =========================================================
            TABLE 3: BUGUN QARZINI TO'LAYDIGANLAR (Promised Debt Today)
        ========================================================= */}
        <div className={`${GLASS} rounded-xl overflow-hidden flex flex-col h-[480px]`}>
          {/* Card Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 flex items-center justify-center shadow-2xs">
                <Clock size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-base text-slate-900 dark:text-white">
                    Bugun qarzini to'laydiganlar
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300">
                    {promisedTodayList.length} ta
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  To'lov va'dasi bugungi kunga to'g'ri kelgan o'quvchilar
                </p>
              </div>
            </div>

            {/* Barchasi Button -> Redirects to Payments */}
            <button
              type="button"
              onClick={() => goTo("payments")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-bold transition-all cursor-pointer shrink-0"
            >
              <span>Barchasi</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Promised Debt List Container */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
            {promisedTodayList.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-3">
                  <Clock size={24} />
                </div>
                <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  Bugun to'lov va'dasi yo'q
                </p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  To'lov qabul qilishda qarz muddati bugungi kunga qo'yilgan o'quvchilar shu yerda avtomatik ko'rinadi.
                </p>
              </div>
            ) : (
              promisedTodayList.map((item, idx) => (
                <div
                  key={`${item.student.id}-${item.group.id}-${idx}`}
                  className="p-3.5 sm:p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 font-bold text-xs flex items-center justify-center shrink-0">
                      {item.student.name?.charAt(0) || "O"}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                          {item.student.name}
                        </p>
                        {item.isOverdue && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
                            Muddati o'tgan
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {item.group.name} · <span className="italic">{item.note}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white font-mono">
                        {money(item.debt)} so'm
                      </p>
                      <span className="text-[10px] text-violet-600 dark:text-violet-400 font-semibold">
                        Va'da: Bugun
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenPayment(item.student.id, item.group.id)}
                      className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      <span>Qabul qilish</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* =========================================================
            TABLE 4: TUGAYOTGAN GURUHLAR (Ending / Completing Groups)
        ========================================================= */}
        <div className={`${GLASS} rounded-xl overflow-hidden flex flex-col h-[480px]`}>
          {/* Card Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-2xs">
                <GraduationCap size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-base text-slate-900 dark:text-white">
                    Tugayotgan guruhlar
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                    {endingGroupsList.length} ta
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Keyingi 45 kun ichida yakunlanadigan guruhlar
                </p>
              </div>
            </div>

            {/* Barchasi Button -> Redirects to Groups */}
            <button
              type="button"
              onClick={() => goTo("groups")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-bold transition-all cursor-pointer shrink-0"
            >
              <span>Barchasi</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Ending Groups List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
            {endingGroupsList.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-3">
                  <GraduationCap size={24} />
                </div>
                <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  Yaqin orada tugaydigan guruh yo'q
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Barcha guruhlar faol o'quv jarayonida.
                </p>
              </div>
            ) : (
              endingGroupsList.map((item) => (
                <div
                  key={item.group.id}
                  className="p-3.5 sm:p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                        {item.group.name}
                      </p>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {item.studentCount} o'quvchi
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                      <span>{item.course?.name || "Kurs"}</span>
                      {item.teacher && (
                        <span>· Ustoz: {item.teacher.name}</span>
                      )}
                    </div>

                    {/* Progress bar */}
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{ width: `${item.progressPct}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">
                        {item.progressPct}%
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`inline-block text-[11px] font-bold px-2 py-1 rounded-xl ${
                        item.daysLeft <= 7
                          ? "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/50"
                          : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/50"
                      }`}
                    >
                      {item.daysLeft <= 0 ? "Yakunlangan" : `${item.daysLeft} kun qoldi`}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Tugash: {formatDate(item.endDate)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* =========================================================================
          FULL-PAGE / WIDE MODAL FOR "BUGUN KELMAGANLAR VA DAVOMAT"
      ========================================================================= */}
      {showAbsentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl sm:rounded-xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 shrink-0 bg-slate-50/50 dark:bg-slate-900/40">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-2xs">
                  <UserX size={22} />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    Bugungi Davomat va Kelmaganlar Nazorati
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {formattedTodayDate} holati bo'yicha to'liq davomat va sabablar ro'yxati
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAbsentModal(false)}
                className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Performance Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 sm:p-5 bg-white dark:bg-[#0F172A] border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Jami darsi borlar</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  {todayStats.total} <span className="text-xs font-normal text-slate-400">nafar</span>
                </p>
              </div>

              <div className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl p-3 border border-emerald-100 dark:border-emerald-900/40">
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400">Darsga kelganlar</p>
                <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
                  {todayStats.present + todayStats.late}{" "}
                  <span className="text-xs font-normal opacity-80">({todayStats.rate}%)</span>
                </p>
              </div>

              <div className="bg-rose-50/50 dark:bg-rose-950/20 rounded-xl p-3 border border-rose-100 dark:border-rose-900/40">
                <p className="text-[11px] text-rose-700 dark:text-rose-400">Sababsiz kelmagan</p>
                <p className="text-lg font-bold text-rose-700 dark:text-rose-300 mt-0.5">
                  {todayStats.absent} <span className="text-xs font-normal opacity-80">nafar</span>
                </p>
              </div>

              <div className="bg-sky-50/50 dark:bg-sky-950/20 rounded-xl p-3 border border-sky-100 dark:border-sky-900/40">
                <p className="text-[11px] text-sky-700 dark:text-sky-400">Sababli kelmagan</p>
                <p className="text-lg font-bold text-sky-700 dark:text-sky-300 mt-0.5">
                  {todayStats.excused} <span className="text-xs font-normal opacity-80">nafar</span>
                </p>
              </div>
            </div>

            {/* Modal Filters & Search Toolbar */}
            <div className="p-4 bg-slate-50/70 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
              {/* Search input */}
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="O'quvchi ismi, telefoni yoki guruh bo'yicha qidirish..."
                  value={absentModalSearch}
                  onChange={(e) => setAbsentModalSearch(e.target.value)}
                  className="w-full bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Group select filter */}
              <div className="flex items-center gap-2">
                <select
                  value={absentGroupFilter}
                  onChange={(e) => setAbsentGroupFilter(e.target.value)}
                  className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none"
                >
                  <option value="all">Barcha guruhlar</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Modal Filter Tabs */}
            <div className="px-4 pt-3 pb-0 bg-white dark:bg-[#0F172A] border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto shrink-0">
              <button
                type="button"
                onClick={() => setAbsentModalTab("all_absent")}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all shrink-0 ${
                  absentModalTab === "all_absent"
                    ? "border-amber-600 text-amber-600 dark:text-amber-400"
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                Barcha kelmaganlar ({todayAbsentList.length})
              </button>

              <button
                type="button"
                onClick={() => setAbsentModalTab("unexcused")}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all shrink-0 ${
                  absentModalTab === "unexcused"
                    ? "border-rose-600 text-rose-600 dark:text-rose-400"
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                Sababsiz ({todayStats.absent})
              </button>

              <button
                type="button"
                onClick={() => setAbsentModalTab("excused")}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all shrink-0 ${
                  absentModalTab === "excused"
                    ? "border-sky-600 text-sky-600 dark:text-sky-400"
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                Sababli ({todayStats.excused})
              </button>

              <button
                type="button"
                onClick={() => setAbsentModalTab("all_today")}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all shrink-0 ${
                  absentModalTab === "all_today"
                    ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                Bugungi barcha o'quvchilar ({allTodayStudentsList.length})
              </button>
            </div>

            {/* Modal Table Content */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {modalFilteredStudents.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  Tanlangan parametrlar bo'yicha ma'lumot topilmadi.
                </div>
              ) : (
                modalFilteredStudents.map((item, idx) => (
                  <div
                    key={`${item.student.id}-${item.group.id}-${idx}`}
                    className="p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    {/* Student & Group Info */}
                    <div className="flex items-start gap-3.5 min-w-0 md:w-1/3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
                        {item.student.name?.charAt(0) || "O"}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-slate-900 dark:text-white">
                          {item.student.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          <span>{item.group.name}</span>
                          {item.group.time && <span>· {item.group.time}</span>}
                        </div>
                        {item.teacher && (
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Ustoz: {item.teacher.name}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Attendance Status & Inline Reason */}
                    <div className="flex-1 min-w-0">
                      {editingReasonId === `${item.student.id}-${item.group.id}` ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={reasonInputText}
                            onChange={(e) => setReasonInputText(e.target.value)}
                            placeholder={
                              item.status === "late"
                                ? "Kech qolish sababi (masalan: Yo'lda tirbandlik)..."
                                : item.status === "excused"
                                ? "Sababli kelmaganlik sababi (masalan: Sog'lig'i tufayli)..."
                                : "Kelmaganlik sababi / izoh (masalan: Qo'ng'iroqqa javob bermadi)..."
                            }
                            className="w-full bg-white dark:bg-[#0F172A] border border-indigo-500 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveReason(item)}
                            className="p-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                            title="Saqlash"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingReasonId(null)}
                            className="p-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 transition-colors"
                            title="Bekor qilish"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Quick status selector */}
                          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                            <button
                              type="button"
                              onClick={() => handleQuickStatusChange(item, "present")}
                              className={`px-2 py-1 rounded-xl text-[11px] font-bold transition-all ${
                                item.status === "present"
                                  ? "bg-emerald-600 text-white shadow-2xs"
                                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                              }`}
                            >
                              Bor
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickStatusChange(item, "late")}
                              className={`px-2 py-1 rounded-xl text-[11px] font-bold transition-all ${
                                item.status === "late"
                                  ? "bg-amber-600 text-white shadow-2xs"
                                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                              }`}
                            >
                              Kech
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickStatusChange(item, "excused")}
                              className={`px-2 py-1 rounded-xl text-[11px] font-bold transition-all ${
                                item.status === "excused" || item.isExcused
                                  ? "bg-sky-600 text-white shadow-2xs"
                                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                              }`}
                            >
                              Sababli
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickStatusChange(item, "absent")}
                              className={`px-2 py-1 rounded-xl text-[11px] font-bold transition-all ${
                                item.status === "absent" && !item.isExcused
                                  ? "bg-rose-600 text-white shadow-2xs"
                                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                              }`}
                            >
                              Yo'q
                            </button>
                          </div>

                          {/* Reason note / edit button */}
                          <div className="flex items-center gap-1.5">
                            {item.reason ? (
                              <span className="text-xs text-slate-600 dark:text-slate-300 italic bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/40 px-2.5 py-1 rounded-xl">
                                {item.reason}
                              </span>
                            ) : null}

                            <button
                              type="button"
                              onClick={() => {
                                setEditingReasonId(`${item.student.id}-${item.group.id}`);
                                setReasonInputText(item.reason || "");
                              }}
                              className="text-[11px] font-bold text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <Edit3 size={12} />
                              <span>{item.reason ? "Tahrirlash" : "Sabab kiritish"}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Contact Actions & Mark Present */}
                    <div className="flex items-center gap-2 justify-end shrink-0">
                      {item.student.phone && (
                        <a
                          href={`tel:${item.student.phone}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
                        >
                          <Phone size={13} />
                          <span>{item.student.phone}</span>
                        </a>
                      )}

                      {item.status !== "present" && (
                        <button
                          type="button"
                          onClick={() => handleQuickStatusChange(item, "present")}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer"
                        >
                          <Check size={14} />
                          <span>Keldi deb belgilash</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50/70 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
              <p className="text-xs text-slate-400">
                O'zgarishlar tizimda bir zumda avtomatik saqlanadi.
              </p>
              <button
                type="button"
                onClick={() => setShowAbsentModal(false)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Yopish
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

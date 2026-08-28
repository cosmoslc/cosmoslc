import { useState, useMemo, useEffect } from "react";
import {
  X,
  Users,
  GraduationCap,
  DoorOpen,
  Clock,
  Calendar,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Search,
  UserPlus,
  UserMinus,
  Trash2,
  CreditCard,
  Send,
  Sparkles,
  BookOpen,
  ArrowRight,
  Pencil,
  Check,
  Flame,
  MessageSquare,
  ShieldCheck,
  Link as LinkIcon,
  ExternalLink,
  ChevronRight,
  Layers,
} from "lucide-react";
import {
  INPUT_CLS,
  BTN_GHOST,
  PrimaryButton,
} from "../theme/tokens";
import { money, thisMonthKey, formatDate } from "../utils/helpers";
import {
  opGroups,
  opGroupStudentCount,
  opStudentsInGroups,
  opAttendance,
  attendanceStatus,
} from "../utils/dataHelpers";
import { JS_DAY_NAMES, MONTHS_UZ, WEEK_DAYS } from "../utils/constants";
import * as api from "../../../shared/api/index";
import { RecordPaymentModal } from "./RecordPaymentModal";

export function GroupProfileModal({
  group,
  directorData,
  opData,
  scopeBranches = [],
  canEdit = true,
  onClose,
  onEditGroup,
  onRecordPayment,
  onUpdateGroup,
  onUpdateStudent,
  onAddStudent,
  openModal,
  onRefresh,
}) {
  if (!group) return null;

  const currentMonthKey = thisMonthKey();
  const [activeTab, setActiveTab] = useState("students"); // "students" | "attendance"
  const [studentQuery, setStudentQuery] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all"); // "all" | "paid" | "unpaid"
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  
  // Modals inside profile
  const [showAddExistingModal, setShowAddExistingModal] = useState(false);
  const [existingSearchQuery, setExistingSearchQuery] = useState("");
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [quickNewStudentName, setQuickNewStudentName] = useState("");
  const [quickNewStudentPhone, setQuickNewStudentPhone] = useState("+998 ");
  const [quickNewStudentGender, setQuickNewStudentGender] = useState("male");
  const [quickNewStudentParentName, setQuickNewStudentParentName] = useState("");
  const [quickNewStudentParentPhone, setQuickNewStudentParentPhone] = useState("+998 ");

  // Payment Student for Unified RecordPaymentModal
  const [paymentStudent, setPaymentStudent] = useState(null);

  // Telegram state
  const [telegramUsername, setTelegramUsername] = useState(
    group.telegramUsername || group.telegramLink || ""
  );
  const [telegramSaved, setTelegramSaved] = useState(false);
  const [telegramBotActive, setTelegramBotActive] = useState(
    group.telegramBotConnected ?? true
  );

  // Attendance state
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey);
  const [selectedDate, setSelectedDate] = useState("");
  const [localAttendance, setLocalAttendance] = useState({});
  const [savingAttendance, setSavingAttendance] = useState(false);

  // Group Metadata
  const course = (directorData?.courses || []).find((c) => c.id === group.courseId);
  const teacher = (directorData?.teachersHR || directorData?.teachers || opData?.teachers || []).find(
    (t) => String(t.id) === String(group.teacherHrId || group.teacherId)
  );
  const room = (opData?.rooms || directorData?.rooms || []).find((r) => r.id === group.roomId);
  const maxCapacity = room?.capacity || 20;
  const groupAccent = group.color || "#6366F1";

  // Students in this group
  const groupStudents = useMemo(() => {
    const targetGid = String(group.id);
    return (opData?.students || []).filter((s) =>
      (s.groupIds || []).some((id) => String(id) === targetGid)
    );
  }, [opData?.students, group.id]);

  // Center students not in this group (for adding existing)
  const availableExistingStudents = useMemo(() => {
    const targetGid = String(group.id);
    return (opData?.students || []).filter(
      (s) => !(s.groupIds || []).some((id) => String(id) === targetGid)
    );
  }, [opData?.students, group.id]);

  const filteredExistingStudents = useMemo(() => {
    const q = existingSearchQuery.trim().toLowerCase();
    if (!q) return availableExistingStudents.slice(0, 15);
    return availableExistingStudents
      .filter(
        (s) =>
          s.name?.toLowerCase().includes(q) ||
          s.phone?.toLowerCase().includes(q) ||
          s.parentName?.toLowerCase().includes(q)
      )
      .slice(0, 20);
  }, [availableExistingStudents, existingSearchQuery]);

  // Financial calculations for this group in selected/current month
  const groupPayments = useMemo(() => {
    return (directorData?.payments || []).filter((p) => p.groupId === group.id);
  }, [directorData?.payments, group.id]);

  const monthPayments = useMemo(() => {
    return groupPayments.filter((p) => p.month === currentMonthKey);
  }, [groupPayments, currentMonthKey]);

  const pricePerStudent = Number(group.price || course?.price || 0);
  const expectedRevenue = pricePerStudent * groupStudents.length;
  const collectedRevenue = monthPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const collectedPercent =
    expectedRevenue > 0
      ? Math.min(100, Math.round((collectedRevenue / expectedRevenue) * 100))
      : 0;

  // Student list enriched with debt and payment info
  const enrichedStudents = useMemo(() => {
    return groupStudents.map((s) => {
      const studentPaidThisMonth = monthPayments
        .filter((p) => p.studentId === s.id)
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

      const isPaid = pricePerStudent > 0 ? studentPaidThisMonth >= pricePerStudent : true;
      const debtAmount = Math.max(0, pricePerStudent - studentPaidThisMonth);

      return {
        ...s,
        paidThisMonth: studentPaidThisMonth,
        isPaid,
        debtAmount,
      };
    });
  }, [groupStudents, monthPayments, pricePerStudent]);

  // Filtered students by query and payment filter
  const filteredStudents = useMemo(() => {
    return enrichedStudents.filter((s) => {
      const q = studentQuery.trim().toLowerCase();
      const matchQuery =
        !q ||
        s.name?.toLowerCase().includes(q) ||
        s.phone?.toLowerCase().includes(q);

      const matchPayment =
        paymentFilter === "all" ||
        (paymentFilter === "paid" && s.isPaid) ||
        (paymentFilter === "unpaid" && !s.isPaid);

      return matchQuery && matchPayment;
    });
  }, [enrichedStudents, studentQuery, paymentFilter]);

  // Lesson days calculation (e.g. Du-Chor-Jum or Se-Pay-Shan)
  const groupDaysNormalized = useMemo(() => {
    const raw = group.days || [];
    return raw.map((d) => d.toLowerCase());
  }, [group.days]);

  // Map JS Day index (0=Yakshanba, 1=Dushanba, 2=Seshanba, 3=Chorshanba, 4=Payshanba, 5=Juma, 6=Shanba)
  const groupDayIndices = useMemo(() => {
    const indices = [];
    const isOdd = groupDaysNormalized.some(
      (d) => d.includes("du") || d.includes("chor") || d.includes("jum")
    );
    const isEven = groupDaysNormalized.some(
      (d) => d.includes("se") || d.includes("pay") || d.includes("shan")
    );

    if (groupDaysNormalized.some((d) => d.includes("du") || d === "dushanba")) indices.push(1);
    if (groupDaysNormalized.some((d) => d.includes("se") || d === "seshanba")) indices.push(2);
    if (groupDaysNormalized.some((d) => d.includes("chor") || d === "chorshanba")) indices.push(3);
    if (groupDaysNormalized.some((d) => d.includes("pay") || d === "payshanba")) indices.push(4);
    if (groupDaysNormalized.some((d) => d.includes("jum") || d === "juma")) indices.push(5);
    if (groupDaysNormalized.some((d) => d.includes("shan") || d === "shanba")) indices.push(6);
    if (groupDaysNormalized.some((d) => d.includes("yak") || d === "yakshanba")) indices.push(0);

    // Fallback if none matched
    if (indices.length === 0) {
      return isEven ? [2, 4, 6] : [1, 3, 5];
    }
    return indices;
  }, [groupDaysNormalized]);

  // Calculate ONLY lesson dates in the selected month
  const lessonDatesInMonth = useMemo(() => {
    const [yearStr, monthStr] = (selectedMonth || currentMonthKey).split("-");
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1; // 0-indexed

    const daysCount = new Date(year, month + 1, 0).getDate();
    const dates = [];

    for (let day = 1; day <= daysCount; day++) {
      const dateObj = new Date(year, month, day);
      const dayOfWeek = dateObj.getDay();

      if (groupDayIndices.includes(dayOfWeek)) {
        const iso = `${yearStr}-${monthStr.padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const dayName = JS_DAY_NAMES[dayOfWeek] || "";
        const shortDay = dayName.slice(0, 4);
        dates.push({
          date: iso,
          dayNumber: day,
          dayName,
          shortDay,
          isToday: iso === new Date().toISOString().slice(0, 10),
          isPast: iso <= new Date().toISOString().slice(0, 10),
        });
      }
    }
    return dates;
  }, [selectedMonth, currentMonthKey, groupDayIndices]);

  // Auto-select closest or today's lesson date on month change
  useEffect(() => {
    if (lessonDatesInMonth.length > 0) {
      const todayISO = new Date().toISOString().slice(0, 10);
      const todayMatch = lessonDatesInMonth.find((d) => d.date === todayISO);
      if (todayMatch) {
        setSelectedDate(todayMatch.date);
      } else {
        // Nearest past date or first date
        const pastDates = lessonDatesInMonth.filter((d) => d.isPast);
        if (pastDates.length > 0) {
          setSelectedDate(pastDates[pastDates.length - 1].date);
        } else {
          setSelectedDate(lessonDatesInMonth[0].date);
        }
      }
    }
  }, [lessonDatesInMonth]);

  // Attendance records for this group
  const groupAttendanceRecords = useMemo(() => {
    return (opData?.attendance || []).filter((a) => a.groupId === group.id);
  }, [opData?.attendance, group.id]);

  // Total lessons conducted vs scheduled (Lesson Progress)
  const conductedLessonsCount = useMemo(() => {
    return groupAttendanceRecords.filter((a) => Object.keys(a.records || {}).length > 0).length;
  }, [groupAttendanceRecords]);

  const totalCourseMonths = Number(group.durationMonths || course?.durationMonths || 3);
  const totalCourseLessons = totalCourseMonths * 12; // Standard 12 lessons per month
  const lessonProgressPercent = Math.min(
    100,
    Math.round((conductedLessonsCount / (totalCourseLessons || 36)) * 100)
  );

  // Current selected day's attendance record
  const currentDayRecord = useMemo(() => {
    return groupAttendanceRecords.find((a) => a.date === selectedDate);
  }, [groupAttendanceRecords, selectedDate]);

  // Initialize local attendance state when selectedDate changes
  useEffect(() => {
    if (currentDayRecord?.records) {
      setLocalAttendance(currentDayRecord.records);
    } else {
      // Empty or default state
      const initial = {};
      groupStudents.forEach((s) => {
        initial[s.id] = null;
      });
      setLocalAttendance(initial);
    }
  }, [currentDayRecord?.id, selectedDate]);

  // Handle setting attendance status for a student
  async function handleSetStatus(studentId, status) {
    const prev = localAttendance[studentId];
    const prevReason = typeof prev === "object" ? prev?.reason || "" : "";
    
    let entryValue = status;
    if (status === "late" || status === "excused" || status === "absent") {
      entryValue = {
        status,
        reason: prevReason,
        excused: status === "excused",
      };
    }

    const updated = { ...localAttendance, [studentId]: entryValue };
    setLocalAttendance(updated);

    try {
      if (currentDayRecord) {
        await api.patchAttendanceRecord(currentDayRecord.id, updated);
      } else {
        await api.addAttendanceRecord({
          groupId: group.id,
          date: selectedDate,
          records: updated,
          locked: false,
        });
      }
      if (onRefresh) onRefresh();
    } catch (e) {
      console.error("Attendance update error:", e);
    }
  }

  // Handle setting attendance reason for a student
  async function handleSetReason(studentId, reason) {
    const prev = localAttendance[studentId];
    const curStatus = typeof prev === "object" ? prev?.status : (prev || "absent");
    
    const entryValue = {
      status: curStatus,
      reason,
      excused: curStatus === "excused",
    };

    const updated = { ...localAttendance, [studentId]: entryValue };
    setLocalAttendance(updated);

    try {
      if (currentDayRecord) {
        await api.patchAttendanceRecord(currentDayRecord.id, updated);
      } else {
        await api.addAttendanceRecord({
          groupId: group.id,
          date: selectedDate,
          records: updated,
          locked: false,
        });
      }
      if (onRefresh) onRefresh();
    } catch (e) {
      console.error("Attendance reason update error:", e);
    }
  }

  // Mark all students present
  async function handleMarkAllPresent() {
    const updated = {};
    groupStudents.forEach((s) => {
      updated[s.id] = "present";
    });
    setLocalAttendance(updated);
    setSavingAttendance(true);
    try {
      if (currentDayRecord) {
        await api.patchAttendanceRecord(currentDayRecord.id, updated);
      } else {
        await api.addAttendanceRecord({
          groupId: group.id,
          date: selectedDate,
          records: updated,
          locked: false,
        });
      }
      if (onRefresh) onRefresh();
    } catch (e) {
      console.error("Error marking all present:", e);
    } finally {
      setSavingAttendance(false);
    }
  }

  // Attendance summary metrics for selected date
  const dayStats = useMemo(() => {
    let present = 0,
      late = 0,
      excused = 0,
      absent = 0;
    groupStudents.forEach((s) => {
      const raw = localAttendance[s.id];
      const st = typeof raw === "object" ? raw?.status : raw;
      if (st === "present") present++;
      else if (st === "late") late++;
      else if (st === "excused") excused++;
      else if (st === "absent") absent++;
    });
    const marked = present + late + excused + absent;
    const rate = marked > 0 ? Math.round(((present + late) / groupStudents.length) * 100) : 0;
    return { present, late, excused, absent, marked, rate };
  }, [groupStudents, localAttendance]);

  // Remove single student from group
  async function handleRemoveStudent(studentId) {
    const student = (opData?.students || []).find((s) => s.id === studentId);
    if (!student) return;
    const targetGid = String(group.id);
    const newGroupIds = (student.groupIds || []).filter((id) => String(id) !== targetGid);
    try {
      await api.updateStudent(studentId, { groupIds: newGroupIds });
      if (onUpdateStudent) {
        onUpdateStudent(studentId, { groupIds: newGroupIds });
      }
      setSelectedStudentIds((prev) => prev.filter((id) => id !== studentId));
      if (onRefresh) onRefresh();
    } catch (e) {
      console.error("Error removing student:", e);
    }
  }

  // Bulk remove selected students
  async function handleBulkRemove() {
    if (selectedStudentIds.length === 0) return;
    const targetGid = String(group.id);
    try {
      for (const sId of selectedStudentIds) {
        const student = (opData?.students || []).find((s) => s.id === sId);
        if (student) {
          const newGroupIds = (student.groupIds || []).filter((id) => String(id) !== targetGid);
          await api.updateStudent(sId, { groupIds: newGroupIds });
          if (onUpdateStudent) onUpdateStudent(sId, { groupIds: newGroupIds });
        }
      }
      setSelectedStudentIds([]);
      if (onRefresh) onRefresh();
    } catch (e) {
      console.error("Error bulk removing students:", e);
    }
  }

  // Add existing student to this group
  async function handleAddExistingStudent(studentId) {
    const student = (opData?.students || []).find((s) => s.id === studentId);
    if (!student) return;
    const newGroupIds = [...new Set([...(student.groupIds || []).map(String), String(group.id)])];
    try {
      await api.updateStudent(studentId, { groupIds: newGroupIds });
      if (onUpdateStudent) onUpdateStudent(studentId, { groupIds: newGroupIds });
      setShowAddExistingModal(false);
      if (onRefresh) onRefresh();
    } catch (e) {
      console.error("Error adding existing student:", e);
    }
  }

  // Quick create and add new student directly to this group
  async function handleQuickAddNewStudent(e) {
    e.preventDefault();
    if (!quickNewStudentName.trim()) return;
    try {
      const payload = {
        name: quickNewStudentName.trim(),
        phone: quickNewStudentPhone.trim(),
        gender: quickNewStudentGender,
        parentName: quickNewStudentParentName.trim(),
        parentPhone: quickNewStudentParentPhone.trim(),
        groupIds: [group.id],
        status: "active",
        coins: 10,
        balance: 0,
      };
      const created = await api.addStudent(payload);
      if (onAddStudent) onAddStudent(created);
      setShowQuickAddModal(false);
      setQuickNewStudentName("");
      setQuickNewStudentPhone("+998 ");
      setQuickNewStudentParentName("");
      setQuickNewStudentParentPhone("+998 ");
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Error creating student:", err);
    }
  }

  // Open RecordPaymentModal for student
  function handleOpenPaymentModal(student) {
    setPaymentStudent(student);
  }

  // Handle recorded payment submission
  async function handleRecordPayment(payload) {
    try {
      await api.recordPayment(payload);
      if (onRecordPayment) {
        onRecordPayment(payload);
      }
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Payment recording error:", err);
    }
  }

  // Save Telegram Info
  async function handleSaveTelegram() {
    try {
      await api.updateGroup(group.id, {
        telegramUsername: telegramUsername.trim(),
        telegramLink: telegramUsername.trim(),
        telegramBotConnected: telegramBotActive,
      });
      if (onUpdateGroup) {
        onUpdateGroup(group.id, {
          telegramUsername: telegramUsername.trim(),
          telegramLink: telegramUsername.trim(),
          telegramBotConnected: telegramBotActive,
        });
      }
      setTelegramSaved(true);
      setTimeout(() => setTelegramSaved(false), 2500);
    } catch (e) {
      console.error("Error updating telegram:", e);
    }
  }

  // Select all checkboxes toggle
  function handleSelectAll(e) {
    if (e.target.checked) {
      setSelectedStudentIds(filteredStudents.map((s) => s.id));
    } else {
      setSelectedStudentIds([]);
    }
  }

  function handleToggleStudent(sId) {
    setSelectedStudentIds((prev) =>
      prev.includes(sId) ? prev.filter((id) => id !== sId) : [...prev, sId]
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between flex-wrap gap-3 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm shrink-0"
              style={{ backgroundColor: groupAccent }}
            >
              <Layers size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                  {group.name}
                </h2>
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: `${groupAccent}15`,
                    color: groupAccent,
                    border: `1px solid ${groupAccent}30`,
                  }}
                >
                  {course?.name || "Kurssiz"}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40">
                  Faol guruh
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Guruh profili, o'quvchilar tarkibi, to'lovlar va dars davomati
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canEdit && onEditGroup && (
              <button
                onClick={() => {
                  onClose();
                  onEditGroup(group);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
              >
                <Pencil size={13} /> Guruhni tahrirlash
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* 1. FIRST ROW: 7 KEY CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            {/* Card 1: O'qituvchi */}
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-400 flex items-center gap-1.5">
                <GraduationCap size={13} className="text-indigo-500" /> O'qituvchi
              </span>
              <p className="font-display text-sm font-bold text-slate-900 dark:text-white mt-1.5 truncate">
                {teacher?.name || "Belgilanmagan"}
              </p>
              <span className="text-[10px] text-slate-400 truncate mt-0.5">
                {teacher?.phone || "Asosiy ustoz"}
              </span>
            </div>

            {/* Card 2: Xona */}
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-400 flex items-center gap-1.5">
                <DoorOpen size={13} className="text-sky-500" /> Xona
              </span>
              <p className="font-display text-sm font-bold text-slate-900 dark:text-white mt-1.5 truncate">
                {room?.name || "Tanlanmagan"}
              </p>
              <span className="text-[10px] text-slate-400 truncate mt-0.5">
                Sig'im: {maxCapacity} o'rin
              </span>
            </div>

            {/* Card 3: Dars vaqti */}
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-400 flex items-center gap-1.5">
                <Clock size={13} className="text-amber-500" /> Dars vaqti
              </span>
              <p className="font-display text-sm font-bold text-slate-900 dark:text-white mt-1.5 truncate">
                {group.time || "15:00"}
              </p>
              <span className="text-[10px] text-slate-400 truncate mt-0.5">90 daqiqa</span>
            </div>

            {/* Card 4: Dars kunlari */}
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-400 flex items-center gap-1.5">
                <Calendar size={13} className="text-purple-500" /> Dars kunlari
              </span>
              <p className="font-display text-xs font-bold text-slate-900 dark:text-white mt-1.5 truncate">
                {(group.days || []).join(", ") || "Belgilanmagan"}
              </p>
              <span className="text-[10px] text-slate-400 truncate mt-0.5">Haftada 3 kun</span>
            </div>

            {/* Card 5: Kutilayotgan to'lov */}
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-400 flex items-center gap-1.5">
                <Wallet size={13} className="text-blue-500" /> Kutilayotgan
              </span>
              <p className="font-display text-sm font-bold text-blue-600 dark:text-blue-400 mt-1.5 truncate">
                {money(expectedRevenue)} <span className="text-[9px] font-normal">so'm</span>
              </p>
              <span className="text-[10px] text-slate-400 truncate mt-0.5">
                {groupStudents.length} ta o'quvchidan
              </span>
            </div>

            {/* Card 6: Yig'ilgan to'lov */}
            <div className="bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-900/50 rounded-xl p-3.5 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <CheckCircle2 size={13} /> Yig'ilgan
                </span>
                <span className="text-[10px] font-extrabold">{collectedPercent}%</span>
              </span>
              <p className="font-display text-sm font-bold text-emerald-700 dark:text-emerald-300 mt-1.5 truncate">
                {money(collectedRevenue)} <span className="text-[9px] font-normal">so'm</span>
              </p>
              <span className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70 truncate mt-0.5">
                Shu oy bo'yicha
              </span>
            </div>

            {/* Card 7: O'quvchilar soni */}
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3.5 flex flex-col justify-between col-span-2 sm:col-span-1">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-400 flex items-center gap-1.5">
                <Users size={13} className="text-sky-500" /> O'quvchilar
              </span>
              <p className="font-display text-sm font-bold text-slate-900 dark:text-white mt-1.5">
                {groupStudents.length}{" "}
                <span className="text-xs font-normal text-slate-400">/ {maxCapacity}</span>
              </p>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, Math.round((groupStudents.length / maxCapacity) * 100))}%`,
                    backgroundColor: groupAccent,
                  }}
                />
              </div>
            </div>
          </div>

          {/* 2. DARS PROGRESS (Lesson Progress Bar) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <BookOpen size={15} />
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Darslar jarayoni (Progress)
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span>
                  O'tilgan darslar:{" "}
                  <strong className="text-slate-900 dark:text-white">{conductedLessonsCount} ta</strong>
                </span>
                <span>•</span>
                <span>
                  Reja:{" "}
                  <strong className="text-slate-900 dark:text-white">
                    {totalCourseLessons} ta ({totalCourseMonths} oy)
                  </strong>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-900/40">
                  {lessonProgressPercent}% bajarildi
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${lessonProgressPercent}%`,
                  backgroundImage: `linear-gradient(90deg, ${groupAccent}, #8b5cf6)`,
                }}
              />
            </div>
          </div>

          {/* 3. TABS NAVIGATION */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <button
              onClick={() => setActiveTab("students")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === "students"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Users size={15} /> O'quvchilar ({groupStudents.length})
            </button>

            <button
              onClick={() => setActiveTab("attendance")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === "attendance"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Calendar size={15} /> Davomat jadvali ({lessonDatesInMonth.length} ta dars)
            </button>
          </div>

          {/* ======================================================== */}
          {/* TAB 1: O'QUVCHILAR (STUDENTS LIST, ACTIONS, TELEGRAM)   */}
          {/* ======================================================== */}
          {activeTab === "students" && (
            <div className="space-y-4">
              {/* Actions & Filters */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2 flex-1 max-w-md">
                  <div className="relative w-full">
                    <Search
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      value={studentQuery}
                      onChange={(e) => setStudentQuery(e.target.value)}
                      placeholder="O'quvchi ismi yoki telefoni..."
                      className={`${INPUT_CLS} pl-9 text-xs`}
                    />
                  </div>

                  <select
                    value={paymentFilter}
                    onChange={(e) => setPaymentFilter(e.target.value)}
                    className={`${INPUT_CLS} text-xs w-36`}
                  >
                    <option value="all">Barcha to'lovlar</option>
                    <option value="paid">To'langanlar</option>
                    <option value="unpaid">Qarzdorlar</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAddExistingModal(true)}
                    className="px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 transition-colors"
                  >
                    <UserPlus size={14} /> Mavjud talaba qo'shish
                  </button>

                  <PrimaryButton onClick={() => setShowQuickAddModal(true)}>
                    <UserPlus size={14} /> Yangi talaba qo'shish
                  </PrimaryButton>
                </div>
              </div>

              {/* Bulk Action Toolbar (When 1+ checkboxes selected) */}
              {selectedStudentIds.length > 0 && (
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-900/60 rounded-xl flex items-center justify-between flex-wrap gap-2 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-950 dark:text-indigo-200">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                      {selectedStudentIds.length}
                    </span>
                    ta o'quvchi tanlandi
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleBulkRemove}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      <UserMinus size={13} /> Guruhdan chiqarish
                    </button>
                    <button
                      onClick={() => setSelectedStudentIds([])}
                      className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
                    >
                      Bekor qilish
                    </button>
                  </div>
                </div>
              )}

              {/* Students Table */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold">
                        <th className="py-3 px-3.5 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={
                              filteredStudents.length > 0 &&
                              selectedStudentIds.length === filteredStudents.length
                            }
                            onChange={handleSelectAll}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                          />
                        </th>
                        <th className="py-3 px-3">O'quvchi</th>
                        <th className="py-3 px-3">Telefon raqami</th>
                        <th className="py-3 px-3">Jinsi</th>
                        <th className="py-3 px-3">Shu oy to'lovi</th>
                        <th className="py-3 px-3 text-right">Amal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-10 text-center text-slate-400">
                            O'quvchilar topilmadi
                          </td>
                        </tr>
                      ) : (
                        filteredStudents.map((s) => {
                          const isSelected = selectedStudentIds.includes(s.id);
                          return (
                            <tr
                              key={s.id}
                              className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors ${
                                isSelected ? "bg-indigo-50/40 dark:bg-indigo-950/20" : ""
                              }`}
                            >
                              <td className="py-3 px-3.5 text-center">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleToggleStudent(s.id)}
                                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                                />
                              </td>

                              {/* Student name & Debt indicator */}
                              <td className="py-3 px-3">
                                <div className="flex items-center gap-2.5">
                                  {/* Red / Green debt status indicator */}
                                  <span
                                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                      s.debtAmount > 0
                                        ? "bg-rose-500 shadow-sm shadow-rose-500/50"
                                        : "bg-emerald-500 shadow-sm shadow-emerald-500/50"
                                    }`}
                                    title={
                                      s.debtAmount > 0
                                        ? `Qarzdor: ${money(s.debtAmount)} so'm`
                                        : "Qarzsiz (to'langan)"
                                    }
                                  />
                                  <div>
                                    <p className="font-semibold text-slate-900 dark:text-white">
                                      {s.name}
                                    </p>
                                    <span className="text-[10px] text-slate-400">
                                      {s.parentName ? `Ota-onasi: ${s.parentName}` : "Holati: Faol"}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* Phone */}
                              <td className="py-3 px-3 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                                {s.phone || "—"}
                              </td>

                              {/* Gender */}
                              <td className="py-3 px-3">
                                <span className="px-2 py-0.5 rounded-xl text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                  {s.gender === "female" ? "Ayol" : "Erkak"}
                                </span>
                              </td>

                              {/* This month payment status */}
                              <td className="py-3 px-3">
                                {s.isPaid ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40">
                                    <CheckCircle2 size={12} /> To'langan ({money(s.paidThisMonth)})
                                  </span>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/40">
                                      <AlertCircle size={12} /> Qarz: {money(s.debtAmount)}
                                    </span>
                                    <button
                                      onClick={() => handleOpenPaymentModal(s)}
                                      className="px-2.5 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
                                      title="To'lov qabul qilish oynasini ochish"
                                    >
                                      <CreditCard size={12} /> To'lab qo'yish
                                    </button>
                                  </div>
                                )}
                              </td>

                              {/* Remove action */}
                              <td className="py-3 px-3 text-right">
                                <button
                                  onClick={() => handleRemoveStudent(s.id)}
                                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                  title="Guruhdan chiqarish"
                                >
                                  <UserMinus size={14} />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* TELEGRAM GROUP & BOT CONNECTION SECTION */}
              <div className="bg-gradient-to-r from-sky-50 to-indigo-50/40 dark:from-sky-950/20 dark:to-indigo-950/20 border border-sky-200/70 dark:border-sky-900/40 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-sky-500 text-white shadow-sm">
                      <Send size={15} />
                    </span>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                        Guruh Telegram kanali & Telegram bot
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        O'quvchilar va ota-onalar bilan darslar, to'lovlar va davomat bo'yicha xabarlar
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        telegramBotActive
                          ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                      }`}
                    >
                      <ShieldCheck size={12} />
                      {telegramBotActive ? "Bot ulangan" : "Bot ulanmagan"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <div className="sm:col-span-2 relative">
                    <LinkIcon
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      value={telegramUsername}
                      onChange={(e) => setTelegramUsername(e.target.value)}
                      placeholder="@cosmos_ielts_group yoki https://t.me/cosmos_group"
                      className={`${INPUT_CLS} pl-9 text-xs bg-white dark:bg-slate-900`}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveTelegram}
                      className="flex-1 px-3 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-1.5"
                    >
                      {telegramSaved ? (
                        <>
                          <Check size={14} /> Saqlandi!
                        </>
                      ) : (
                        <>
                          <Send size={13} /> Saqlash
                        </>
                      )}
                    </button>

                    {telegramUsername && (
                      <a
                        href={
                          telegramUsername.startsWith("http")
                            ? telegramUsername
                            : `https://t.me/${telegramUsername.replace("@", "")}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-sky-600 transition-colors"
                        title="Telegramda ochish"
                      >
                        <ExternalLink size={15} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: DAVOMAT JADVALI (ATTENDANCE MATRIX & CONTROLS)    */}
          {/* ======================================================== */}
          {activeTab === "attendance" && (
            <div className="space-y-4">
              {/* Month Picker & Quick Status Bar */}
              <div className="flex items-center justify-between flex-wrap gap-3 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <Calendar size={15} className="text-indigo-500" />
                    <span>Oy:</span>
                  </div>
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className={`${INPUT_CLS} text-xs py-1 px-2.5 w-36 bg-white dark:bg-slate-900`}
                  />
                </div>

                {/* Status Legend Indicator */}
                <div className="flex items-center gap-3 text-xs flex-wrap">
                  <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Bor (Qatnashgan)
                  </span>
                  <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Kechikkan
                  </span>
                  <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500" /> Sababli
                  </span>
                  <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Kelmagan
                  </span>
                </div>
              </div>

              {/* LESSON DATES PILLS (ONLY DARS KUNLARI!) */}
              <div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 flex items-center justify-between">
                  <span>Dars kunlari jadvali ({lessonDatesInMonth.length} ta dars):</span>
                  <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                    Faqat belgilangan dars kunlari ({groupDaysNormalized.join(", ")})
                  </span>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                  {lessonDatesInMonth.map((d) => {
                    const isSelected = d.date === selectedDate;
                    const rec = groupAttendanceRecords.find((a) => a.date === d.date);
                    const hasRecords = rec && Object.keys(rec.records || {}).length > 0;

                    return (
                      <button
                        key={d.date}
                        onClick={() => setSelectedDate(d.date)}
                        className={`px-3 py-2.5 rounded-xl text-xs font-semibold flex flex-col items-center shrink-0 border transition-all ${
                          isSelected
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20 scale-105"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-400"
                        }`}
                      >
                        <span className="text-[10px] uppercase font-bold opacity-80">
                          {d.shortDay}
                        </span>
                        <span className="font-display font-extrabold text-sm">{d.dayNumber}</span>
                        {hasRecords ? (
                          <span
                            className={`w-1.5 h-1.5 rounded-full mt-1 ${
                              isSelected ? "bg-white" : "bg-emerald-500"
                            }`}
                          />
                        ) : (
                          <span
                            className={`w-1.5 h-1.5 rounded-full mt-1 ${
                              isSelected ? "bg-white/40" : "bg-slate-300 dark:bg-slate-700"
                            }`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SELECTED DATE DETAILS & SUMMARY BAR */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{formatDate(selectedDate)}</span>
                    <span className="text-xs font-normal text-slate-400">
                      ({groupStudents.length} nafar o'quvchi)
                    </span>
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span className="text-emerald-600 font-semibold">Bor: {dayStats.present}</span>
                    <span>•</span>
                    <span className="text-amber-600 font-semibold">Kech: {dayStats.late}</span>
                    <span>•</span>
                    <span className="text-sky-600 font-semibold">Sababli: {dayStats.excused}</span>
                    <span>•</span>
                    <span className="text-rose-600 font-semibold">Kelmadi: {dayStats.absent}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleMarkAllPresent}
                    disabled={savingAttendance}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
                  >
                    <CheckCircle2 size={14} /> Barchasini BOR qilish
                  </button>
                </div>
              </div>

              {/* INTERACTIVE ATTENDANCE TABLE */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold">
                      <th className="py-3 px-4">#</th>
                      <th className="py-3 px-3">O'quvchi</th>
                      <th className="py-3 px-3">Telefon</th>
                      <th className="py-3 px-3 text-center">Davomat holati ({formatDate(selectedDate)})</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {groupStudents.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-400">
                          Guruhda o'quvchilar yo'q
                        </td>
                      </tr>
                    ) : (
                      groupStudents.map((s, idx) => {
                        const rawEntry = localAttendance[s.id];
                        const status = typeof rawEntry === "object" ? rawEntry?.status : rawEntry;
                        const reason = typeof rawEntry === "object" ? rawEntry?.reason || "" : "";
                        const studentInfo = enrichedStudents.find((e) => e.id === s.id);
                        const isDebtor = (studentInfo?.debtAmount || 0) > 0;

                        return (
                          <tr key={s.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="py-3 px-4 font-mono text-slate-400 text-[11px] align-top">
                              {idx + 1}
                            </td>
                            <td className="py-3 px-3 align-top">
                              <div className="flex items-start gap-2.5">
                                {/* Indicator: Red if debtor, Green if debt-free/paid */}
                                <span
                                  className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 ${
                                    isDebtor
                                      ? "bg-rose-500 shadow-sm shadow-rose-500/50"
                                      : "bg-emerald-500 shadow-sm shadow-emerald-500/50"
                                  }`}
                                  title={
                                    isDebtor
                                      ? `Qarzdor: ${money(studentInfo.debtAmount)} so'm`
                                      : "To'langan (qarzsiz)"
                                  }
                                />
                                <div>
                                  <p className="font-semibold text-slate-900 dark:text-white">
                                    {s.name}
                                  </p>
                                  {isDebtor ? (
                                    <span className="text-[10px] font-bold text-rose-500 dark:text-rose-400 flex items-center gap-1">
                                      <AlertCircle size={10} /> Qarz: {money(studentInfo.debtAmount)} so'm
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                      <CheckCircle2 size={10} /> To'langan
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-slate-500 font-mono text-[11px] align-top">
                              {s.phone || "—"}
                            </td>
                            <td className="py-3 px-3 align-top">
                              <div className="space-y-1.5 max-w-xs mx-auto">
                                <div className="flex items-center justify-center gap-1.5">
                                  {/* Present Button */}
                                  <button
                                    onClick={() => handleSetStatus(s.id, "present")}
                                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                                      status === "present"
                                        ? "bg-emerald-600 text-white shadow-sm"
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 hover:text-emerald-700"
                                    }`}
                                  >
                                    Bor
                                  </button>

                                  {/* Late Button */}
                                  <button
                                    onClick={() => handleSetStatus(s.id, "late")}
                                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                                      status === "late"
                                        ? "bg-amber-500 text-white shadow-sm"
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-amber-100 dark:hover:bg-amber-950/60 hover:text-amber-700"
                                    }`}
                                  >
                                    Kech
                                  </button>

                                  {/* Excused Button */}
                                  <button
                                    onClick={() => handleSetStatus(s.id, "excused")}
                                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                                      status === "excused"
                                        ? "bg-sky-600 text-white shadow-sm"
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-sky-100 dark:hover:bg-sky-950/60 hover:text-sky-700"
                                    }`}
                                  >
                                    Sababli
                                  </button>

                                  {/* Absent Button */}
                                  <button
                                    onClick={() => handleSetStatus(s.id, "absent")}
                                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                                      status === "absent"
                                        ? "bg-rose-600 text-white shadow-sm"
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-rose-100 dark:hover:bg-rose-950/60 hover:text-rose-700"
                                    }`}
                                  >
                                    Yo'q
                                  </button>
                                </div>

                                {/* Inline reason input if late, excused, or absent */}
                                {(status === "late" || status === "excused" || status === "absent") && (
                                  <div className="pt-0.5">
                                    <input
                                      type="text"
                                      value={reason}
                                      onChange={(e) => handleSetReason(s.id, e.target.value)}
                                      placeholder={
                                        status === "late"
                                          ? "Kechikish sababi..."
                                          : status === "excused"
                                          ? "Sababli kelmaganlik izohi..."
                                          : "Kelmadi sababi / izoh..."
                                      }
                                      className="w-full text-[11px] px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                                    />
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="text-xs text-slate-400">
            Jami o'quvchilar: <strong className="text-slate-700 dark:text-slate-300">{groupStudents.length} nafar</strong>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            Yopish
          </button>
        </div>
      </div>

      {/* ======================================================= */}
      {/* MODAL 1: MAVJUD TALABA QO'SHISH (ADD EXISTING STUDENT) */}
      {/* ======================================================= */}
      {showAddExistingModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
          onClick={() => setShowAddExistingModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-lg p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus size={16} className="text-indigo-600" />
                Mavjud o'quvchini guruhga qo'shish
              </h3>
              <button
                onClick={() => setShowAddExistingModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={existingSearchQuery}
                onChange={(e) => setExistingSearchQuery(e.target.value)}
                placeholder="Ism yoki telefon bo'yicha qidirish..."
                className={`${INPUT_CLS} pl-9 text-xs`}
                autoFocus
              />
            </div>

            <div className="max-h-64 overflow-y-auto space-y-1.5 divide-y divide-slate-100 dark:divide-slate-800">
              {filteredExistingStudents.length === 0 ? (
                <p className="text-center py-6 text-xs text-slate-400">
                  Mos keluvchi o'quvchilar topilmadi
                </p>
              ) : (
                filteredExistingStudents.map((s) => (
                  <div
                    key={s.id}
                    className="pt-2 flex items-center justify-between gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 p-2 rounded-xl transition-colors"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{s.name}</p>
                      <span className="text-[10px] text-slate-400 font-mono">{s.phone || "—"}</span>
                    </div>

                    <button
                      onClick={() => handleAddExistingStudent(s.id)}
                      className="px-2.5 py-1 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-1"
                    >
                      <UserPlus size={12} /> Qo'shish
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* MODAL 2: YANGI TALABA QO'SHISH (QUICK CREATE NEW)      */}
      {/* ======================================================= */}
      {showQuickAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
          onClick={() => setShowQuickAddModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-md p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus size={16} className="text-indigo-600" />
                Yangi o'quvchi yaratish va biriktirish
              </h3>
              <button
                onClick={() => setShowQuickAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleQuickAddNewStudent} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  O'quvchi to'liq ismi *
                </label>
                <input
                  type="text"
                  required
                  value={quickNewStudentName}
                  onChange={(e) => setQuickNewStudentName(e.target.value)}
                  placeholder="Masalan: Azizov Sardorbek Bahrom o'g'li"
                  className={`${INPUT_CLS} text-xs`}
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    Telefon raqami
                  </label>
                  <input
                    type="text"
                    value={quickNewStudentPhone}
                    onChange={(e) => setQuickNewStudentPhone(e.target.value)}
                    className={`${INPUT_CLS} text-xs`}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    Jinsi
                  </label>
                  <select
                    value={quickNewStudentGender}
                    onChange={(e) => setQuickNewStudentGender(e.target.value)}
                    className={`${INPUT_CLS} text-xs`}
                  >
                    <option value="male">Erkak</option>
                    <option value="female">Ayol</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Ota-onasi ismi
                </label>
                <input
                  type="text"
                  value={quickNewStudentParentName}
                  onChange={(e) => setQuickNewStudentParentName(e.target.value)}
                  placeholder="Ota-onasining to'liq ismi"
                  className={`${INPUT_CLS} text-xs`}
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Ota-onasi telefoni
                </label>
                <input
                  type="text"
                  value={quickNewStudentParentPhone}
                  onChange={(e) => setQuickNewStudentParentPhone(e.target.value)}
                  className={`${INPUT_CLS} text-xs`}
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowQuickAddModal(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Bekor qilish
                </button>
                <PrimaryButton type="submit">
                  <UserPlus size={13} /> Saqlash va guruhga qo'shish
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* UNIFIED RECORD PAYMENT MODAL                           */}
      {/* ======================================================= */}
      {paymentStudent && (
        <RecordPaymentModal
          initialStudentId={paymentStudent.id}
          initialGroupId={group.id}
          scopeBranches={scopeBranches}
          directorData={directorData}
          opData={opData}
          onSubmit={async (payload) => {
            await handleRecordPayment(payload);
            setPaymentStudent(null);
          }}
          onClose={() => setPaymentStudent(null)}
        />
      )}
    </div>
  );
}

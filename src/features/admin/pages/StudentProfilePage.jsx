import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { MorphDropdown } from "../../../shared/components/MorphDropdown";
import {
  ArrowLeft,
  ArrowDownLeft,
  ArrowUpRight,
  User,
  Phone,
  Calendar,
  Clock,
  GraduationCap,
  CreditCard,
  Coins,
  AlertCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Copy,
  Building2,
  MapPin,
  Plus,
  Trash2,
  Edit3,
  Save,
  Send,
  MessageSquare,
  Users,
  MoreHorizontal,
  ArrowLeftRight,
  RotateCcw,
  Percent,
  ShoppingBag,
  History,
  Sparkles,
  FileText,
  Tag,
  Check,
  CheckCheck,
  Award,
  Layers,
  Zap,
  MoreVertical,
  SquarePen,
  Snowflake,
  Camera,
  Upload,
  LogOut,
} from "lucide-react";
import {
  INPUT_CLS,
  LABEL_CLS,
} from "../theme/tokens";
import { ConfirmModal, Modal } from "../components/primitives";
import { RefundPaymentModal } from "../modals/RefundPaymentModal";
import { RecordPaymentModal } from "../modals/RecordPaymentModal";
import { UnenrollGroupModal } from "../modals/UnenrollGroupModal";
import { UnenrollAllGroupsModal } from "../modals/UnenrollAllGroupsModal";
import { AddDiscountModal } from "../modals/AddDiscountModal";
import { calculateProratedFee, calculateStudentGroupFee, calculateRefundAmount, getMonthLessonDates } from "../../../shared/utils/prorata";
import {
  displayPhone,
  formatDate,
  money,
  thisMonthKey,
  prevMonthKey,
} from "../utils/helpers";
import { opGroups } from "../utils/dataHelpers";
import { SearchableGroupSelect } from "../../../shared/components/SearchableGroupSelect";
import * as api from "../../../shared/api";

const UZ_MONTH_NAMES = [
  "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
  "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"
];

function getMonthNameUz(mStr) {
  if (!mStr) return "";
  const parts = mStr.split("-");
  const mNum = parseInt(parts[1], 10);
  return UZ_MONTH_NAMES[mNum - 1] || mStr;
}

function getMonthsRange(startMKey, endMKey) {
  if (!startMKey || !endMKey) return [endMKey || thisMonthKey()];
  const result = [];
  try {
    let [sY, sM] = startMKey.split("-").map(Number);
    const [eY, eM] = endMKey.split("-").map(Number);
    if (isNaN(sY) || isNaN(sM) || isNaN(eY) || isNaN(eM)) return [endMKey];

    let count = 0;
    while ((sY < eY || (sY === eY && sM <= eM)) && count < 36) {
      result.push(`${sY}-${String(sM).padStart(2, "0")}`);
      sM++;
      if (sM > 12) {
        sM = 1;
        sY++;
      }
      count++;
    }
  } catch {
    return [endMKey];
  }
  return result.length > 0 ? result : [endMKey];
}

function formatShortDate(val) {
  if (!val) return "—";
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return String(val);
    const months = ["Yan", "Fev", "Mar", "Apr", "May", "Iyun", "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek"];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  } catch {
    return String(val);
  }
}

const DAY_FULL_NAMES = {
  "Dush": "Dushanba",
  "Sesh": "Seshanba",
  "Chor": "Chorshanba",
  "Pay": "Payshanba",
  "Juma": "Juma",
  "Shan": "Shanba",
  "Yak": "Yakshanba",
  "Mon": "Dushanba",
  "Tue": "Seshanba",
  "Wed": "Chorshanba",
  "Thu": "Payshanba",
  "Fri": "Juma",
  "Sat": "Shanba",
  "Sun": "Yakshanba",
  "Monday": "Dushanba",
  "Tuesday": "Seshanba",
  "Wednesday": "Chorshanba",
  "Thursday": "Payshanba",
  "Friday": "Juma",
  "Saturday": "Shanba",
  "Sunday": "Yakshanba",
};

function formatGroupDays(days) {
  if (!days) return "Seshanba, Payshanba, Shanba,";
  if (Array.isArray(days)) {
    return days.map((d) => DAY_FULL_NAMES[d] || d).join(", ") + (days.length > 0 ? "," : "");
  }
  const str = String(days);
  return str.endsWith(",") ? str : str + ",";
}

const GRADE_OPTIONS = [
  "1-sinf",
  "2-sinf",
  "3-sinf",
  "4-sinf",
  "5-sinf",
  "6-sinf",
  "7-sinf",
  "8-sinf",
  "9-sinf",
  "10-sinf",
  "11-sinf",
  "Talaba (Universitet)",
  "Kattalar / Ishlovchi",
  "Boshqa",
];

const STUDENT_STATUSES = [
  {
    id: "active",
    label: "Faol o'quvchi",
    short: "Faol",
    color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    dot: "bg-emerald-500",
  },
  {
    id: "paused",
    label: "Muzlatilgan",
    short: "Muzlatilgan",
    color: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    dot: "bg-amber-500",
  },
  {
    id: "left",
    label: "Tark etgan (Ketgan)",
    short: "Ketgan",
    color: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800",
    dot: "bg-rose-500",
  },
  {
    id: "returned",
    label: "Qaytib kelgan",
    short: "Qaytib kelgan",
    color: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    dot: "bg-blue-500",
  },
  {
    id: "graduated",
    label: "Bitirgan (Tugatgan)",
    short: "Bitirgan",
    color: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    dot: "bg-purple-500",
  },
];

const NOTE_TYPES = [
  { id: "call", label: "Qo'ng'iroq", icon: "📞", color: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800" },
  { id: "sms", label: "SMS / Telegram", icon: "💬", color: "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800" },
  { id: "parent", label: "Ota-onasi bilan suhbat", icon: "👨‍👩‍👧", color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800" },
  { id: "lesson", label: "Darsdagi natijasi", icon: "📚", color: "bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 border-violet-200 dark:border-violet-800" },
  { id: "note", label: "Eslatma / Fikr", icon: "📝", color: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800" },
  { id: "warning", label: "Ogohlantirish / Qarz", icon: "⚠️", color: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800" },
];

export function StudentProfilePage({
  student,
  directorData,
  opData,
  onUpdateStudent,
  onDeleteStudent,
  onAddCoins,
  onRecordPayment,
  onAssignStudentToGroup,
  onRemoveFromGroup,
  onBack,
  openModal,
  openPaymentModal,
}) {
  // Top menu tabs: guruhlar, tolovlar, eslatma, chegirma, imtihonlar, tarix, xaridlar, sms, coins, edit
  const [activeTab, setActiveTab] = useState("groups");
  const [paymentFilter, setPaymentFilter] = useState("all"); // 'all' | 'charges' | 'payments'
  const [isEditing, setIsEditing] = useState(false);
  const [showMoreInfo, setShowMoreInfo] = useState(false); // Collapsible for extra details in Left Block
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [confirmModalState, setConfirmModalState] = useState(null);

  // Reactive student state: sync with opData/directorData or local updates
  const liveStudent = useMemo(() => {
    const list = opData?.students || directorData?.students || [];
    return list.find((s) => String(s.id) === String(student?.id)) || student;
  }, [opData?.students, directorData?.students, student]);

  const [localStudent, setLocalStudent] = useState(student);

  useEffect(() => {
    if (student) {
      setLocalStudent((prev) => ({
        ...prev,
        ...student,
        groupMemberships: {
          ...(student.groupMemberships || {}),
          ...(prev?.groupMemberships || {}),
        },
      }));
    }
  }, [student]);

  useEffect(() => {
    if (liveStudent) {
      setLocalStudent((prev) => ({
        ...prev,
        ...liveStudent,
        groupMemberships: {
          ...(liveStudent.groupMemberships || {}),
          ...(prev?.groupMemberships || {}),
        },
      }));
    }
  }, [liveStudent]);

  const currentStudent = localStudent || student;

  // Edit form state
  const [formData, setFormData] = useState({
    name: currentStudent?.name || "",
    phone: currentStudent?.phone || "",
    parentPhone: currentStudent?.parentPhone || currentStudent?.phone2 || "",
    parentName: currentStudent?.parentName || "",
    grade: currentStudent?.grade || "",
    school: currentStudent?.school || "",
    birthDate: currentStudent?.birthDate || "",
    gender: currentStudent?.gender || "male",
    address: currentStudent?.address || "",
    source: currentStudent?.source || "Tanish / Tavsiya",
    targetCourse: currentStudent?.targetCourse || currentStudent?.interestedCourse || "",
    branch: currentStudent?.branch || "Asosiy filial",
    status: currentStudent?.status || "active",
    balance: currentStudent?.balance || 0,
    coins: currentStudent?.coins || 0,
    note: currentStudent?.note || "",
  });

  // Discount form state
  const [discountVal, setDiscountVal] = useState(currentStudent?.discount || 0);
  const [discountType, setDiscountType] = useState(currentStudent?.discountType || "percent");
  const [discountReason, setDiscountReason] = useState(currentStudent?.discountReason || "Oila a'zolari chegirmasi");

  useEffect(() => {
    if (currentStudent && !isEditing) {
      setFormData({
        name: currentStudent?.name || "",
        phone: currentStudent?.phone || "",
        parentPhone: currentStudent?.parentPhone || currentStudent?.phone2 || "",
        parentName: currentStudent?.parentName || "",
        grade: currentStudent?.grade || "",
        school: currentStudent?.school || "",
        birthDate: currentStudent?.birthDate || "",
        gender: currentStudent?.gender || "male",
        address: currentStudent?.address || "",
        source: currentStudent?.source || "Tanish / Tavsiya",
        targetCourse: currentStudent?.targetCourse || currentStudent?.interestedCourse || "",
        branch: currentStudent?.branch || "Asosiy filial",
        status: currentStudent?.status || "active",
        balance: currentStudent?.balance || 0,
        coins: currentStudent?.coins || 0,
        note: currentStudent?.note || "",
      });
      setDiscountVal(currentStudent?.discount || 0);
      setDiscountType(currentStudent?.discountType || "percent");
      setDiscountReason(currentStudent?.discountReason || "Oila a'zolari chegirmasi");
    }
  }, [currentStudent, isEditing]);

  // Notes & timeline state
  const [newNoteText, setNewNoteText] = useState("");
  const [newNoteType, setNewNoteType] = useState("call");
  const [addingNote, setAddingNote] = useState(false);

  // SMS state
  const [smsText, setSmsText] = useState("");
  const [sentSmsLogs, setSentSmsLogs] = useState(student?.smsLogs || [
    {
      id: "sms_1",
      date: new Date().toISOString().slice(0, 10),
      text: "Xurmatli o'quvchi! Darslar belgilangan vaqtda boshlanadi.",
      status: "Yetib bordi",
      phone: student?.phone || "",
    }
  ]);

  // Coin state
  const [coinAmount, setCoinAmount] = useState(10);
  const [coinReason, setCoinReason] = useState("Darsdagi faollik uchun");
  const [coinSection, setCoinSection] = useState("Darsdagi faollik");
  const [coinActionType, setCoinActionType] = useState("add"); // add | deduct

  // Discount modal state
  const [showAddDiscountModal, setShowAddDiscountModal] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);

  // Group quick assign state
  const [groupToAssign, setGroupToAssign] = useState("");

  // Actions dropdown menu state & ref
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [paymentModalData, setPaymentModalData] = useState(null);
  const [showGiveCoinModal, setShowGiveCoinModal] = useState(false);
  const [coinAmountInput, setCoinAmountInput] = useState(10);
  const [showEditBalanceModal, setShowEditBalanceModal] = useState(false);
  const [newBalanceInput, setNewBalanceInput] = useState("");
  const [balanceComment, setBalanceComment] = useState("");
  const [showTransferBranchModal, setShowTransferBranchModal] = useState(false);
  const [targetBranchId, setTargetBranchId] = useState("");
  const [targetGroupId, setTargetGroupId] = useState("");
  const [showUnenrollAllModal, setShowUnenrollAllModal] = useState(false);
  const actionsMenuRef = useRef(null);

  // Group action menu state & modals
  const [openGroupMenuId, setOpenGroupMenuId] = useState(null);
  const [activateModalData, setActivateModalData] = useState(null); // { group, membership, fullPrice }
  const [transferModalData, setTransferModalData] = useState(null); // group
  const [attendanceModalGroup, setAttendanceModalGroup] = useState(null); // group for attendance & grades view
  const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false);
  const [unenrollGroupModalData, setUnenrollGroupModalData] = useState(null); // group to unenroll

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".header-actions-container")) {
        setShowActionsMenu(false);
      }
      if (!e.target.closest(".group-card-actions-container")) {
        setOpenGroupMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!student) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <p className="text-slate-500 font-semibold mb-4">O'quvchi ma'lumotlari topilmadi</p>
        <button
          onClick={onBack}
          className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300"
        >
          Ortga qaytish
        </button>
      </div>
    );
  }

  const month = thisMonthKey();
  const allGroups = opGroups(opData) || [];
  const courses = directorData?.courses || opData?.courses || [];
  const teachers = directorData?.teachersHR || opData?.teachers || [];
  const allPayments = directorData?.payments || [];
  const allAttendance = opData?.attendance || [];

  // Groups this student is enrolled in
  const assignedGroups = useMemo(() => {
    const ids = (currentStudent?.groupIds || []).map(String);
    return allGroups.filter((g) => ids.includes(String(g.id)));
  }, [allGroups, currentStudent?.groupIds]);

  // Debt calculation per group with Pro-rata support and Group Activation
  const groupDebts = useMemo(() => {
    const prevKey = prevMonthKey(month);
    const prevMonthName = getMonthNameUz(prevKey);

    return assignedGroups.map((g) => {
      let fullPrice = Number(g.price || 0);
      if (currentStudent?.discount) {
        if (currentStudent.discountType === "percent" || currentStudent.discountType === "%" || currentStudent.discountType === "foiz") {
          fullPrice = Math.round(fullPrice * (1 - Number(currentStudent.discount) / 100));
        } else {
          fullPrice = Math.max(0, fullPrice - Number(currentStudent.discount));
        }
      }

      const membership = currentStudent?.groupMemberships?.[g.id] || currentStudent?.groupMemberships?.[String(g.id)];
      const groupAttendances = (opData?.attendance || []).filter(a => String(a.groupId) === String(g.id));
      const groupFeeInfo = calculateStudentGroupFee({
        fullMonthlyFee: fullPrice,
        groupDays: g.days || ["Dush", "Chor", "Juma"],
        monthStr: month,
        membership,
        student: currentStudent,
        group: g,
        attendances: groupAttendances,
        settings: directorData?.centerSettings || {},
      });

      const effectivePrice = groupFeeInfo.calculatedFee;

      const groupPayments = allPayments.filter(
        (p) => p.studentId === currentStudent?.id && p.groupId === g.id && p.month === month
      );
      const paidSum = groupPayments.reduce(
        (sum, p) => sum + (Number(p.amount) || 0),
        0
      );
      const discountSum = groupPayments.reduce(
        (sum, p) => sum + (Number(p.discount) || 0),
        0
      );
      const effectiveCovered = paidSum + discountSum;
      const remainingDebt = Math.max(0, effectivePrice - effectiveCovered);
      const isPaid = effectivePrice > 0 ? remainingDebt === 0 : true;
      const isPartial = !isPaid && effectiveCovered > 0;
      const paymentStatus = isPaid ? "paid" : isPartial ? "partial" : "unpaid";

      // O'tgan oy (prevMonth) bo'yicha ushbu guruh hisob-kitobi
      const prevFeeInfo = calculateStudentGroupFee({
        fullMonthlyFee: fullPrice,
        groupDays: g.days || ["Dush", "Chor", "Juma"],
        monthStr: prevKey,
        membership,
        student: currentStudent,
        group: g,
        attendances: groupAttendances,
        settings: directorData?.centerSettings || {},
      });
      const prevEffectivePrice = prevFeeInfo.isTrial ? 0 : (prevFeeInfo.calculatedFee || 0);
      const prevGroupPayments = allPayments.filter(
        (p) =>
          String(p.studentId) === String(currentStudent?.id) &&
          String(p.groupId) === String(g.id) &&
          (p.month === prevKey || (p.date && p.date.startsWith(prevKey)))
      );
      const prevPaidSum = prevGroupPayments.reduce(
        (sum, p) => sum + (Number(p.amount) || 0) + (Number(p.discount) || 0),
        0
      );
      const prevRemainingDebt = Math.max(0, prevEffectivePrice - prevPaidSum);

      const totalGroupRemainingDebt = remainingDebt + prevRemainingDebt;
      const groupBalance =
        totalGroupRemainingDebt > 0
          ? -totalGroupRemainingDebt
          : effectiveCovered > effectivePrice
          ? effectiveCovered - effectivePrice
          : 0;

      const effectiveActivationDate =
        membership?.activationDate ||
        groupFeeInfo?.activationDate ||
        (groupFeeInfo?.isTrial ? null : (membership?.reactivatedAt || currentStudent?.activationDate || membership?.enrolledAt || currentStudent?.joinedAt || null));

      return {
        group: g,
        membership,
        membershipStatus: groupFeeInfo.status,
        membershipStatusLabel: groupFeeInfo.statusLabel,
        isTrial: groupFeeInfo.isTrial,
        isPaused: groupFeeInfo.isPaused,
        activationDate: effectiveActivationDate,
        price: effectivePrice,
        fullPrice,
        isProrated: groupFeeInfo.isProrated,
        proratedReason: groupFeeInfo.reason,
        pricePerLesson: groupFeeInfo.pricePerLesson,
        attendedLessons: groupFeeInfo.attendedLessons,
        missedLessons: groupFeeInfo.missedLessons,
        totalLessons: groupFeeInfo.totalLessons,
        allLessonDates: groupFeeInfo.allLessonDates,
        paidSum,
        discountSum,
        effectiveCovered,
        remainingDebt,
        prevRemainingDebt,
        prevMonthName,
        prevKey,
        totalGroupRemainingDebt,
        groupBalance,
        paid: isPaid,
        isPartial,
        status: paymentStatus,
      };
    });
  }, [assignedGroups, allPayments, currentStudent, month, opData?.attendance, directorData?.centerSettings]);

  const totalDebt = useMemo(() => {
    return groupDebts.reduce((sum, d) => sum + (d.remainingDebt || 0), 0);
  }, [groupDebts]);

  // O'tgan oydan qarz hisob-kitobi (agar o'tgan oydan qarz bo'lsa)
  const previousMonthDebtInfo = useMemo(() => {
    const prevKey = prevMonthKey(month);
    const monthName = getMonthNameUz(prevKey);
    const totalPrevDebt = groupDebts.reduce((sum, d) => sum + (d.prevRemainingDebt || 0), 0);
    const primaryGroup = groupDebts.find((d) => d.prevRemainingDebt > 0)?.group || (assignedGroups.length > 0 ? assignedGroups[0] : null);

    return {
      monthKey: prevKey,
      monthName,
      amount: totalPrevDebt,
      hasDebt: totalPrevDebt > 0,
      primaryGroup,
    };
  }, [month, groupDebts, assignedGroups]);

  // Agar bevosita o'tgan oyda qarz bo'lmasa, undan oldingi oylarni ham tekshirish
  const pastDebtInfo = useMemo(() => {
    if (previousMonthDebtInfo.hasDebt) {
      return previousMonthDebtInfo;
    }

    let curKey = prevMonthKey(month);
    for (let i = 0; i < 3; i++) {
      curKey = prevMonthKey(curKey);
      let olderDebt = 0;
      let pGroup = null;

      assignedGroups.forEach((g) => {
        let fullPrice = Number(g.price || 0);
        if (currentStudent?.discount) {
          if (
            currentStudent.discountType === "percent" ||
            currentStudent.discountType === "%" ||
            currentStudent.discountType === "foiz"
          ) {
            fullPrice = Math.round(fullPrice * (1 - Number(currentStudent.discount) / 100));
          } else {
            fullPrice = Math.max(0, fullPrice - Number(currentStudent.discount));
          }
        }
        const membership =
          currentStudent?.groupMemberships?.[g.id] ||
          currentStudent?.groupMemberships?.[String(g.id)];
        const groupAttendances = (opData?.attendance || []).filter(
          (a) => String(a.groupId) === String(g.id)
        );
        const feeInfo = calculateStudentGroupFee({
          fullMonthlyFee: fullPrice,
          groupDays: g.days || ["Dush", "Chor", "Juma"],
          monthStr: curKey,
          membership,
          student: currentStudent,
          group: g,
          attendances: groupAttendances,
          settings: directorData?.centerSettings || {},
        });
        if (feeInfo.isTrial) return;
        const effPrice = feeInfo.calculatedFee || 0;
        if (effPrice <= 0) return;
        const payments = allPayments.filter(
          (p) =>
            String(p.studentId) === String(currentStudent?.id) &&
            String(p.groupId) === String(g.id) &&
            (p.month === curKey || (p.date && p.date.startsWith(curKey)))
        );
        const paidTotal = payments.reduce(
          (sum, p) => sum + (Number(p.amount) || 0) + (Number(p.discount) || 0),
          0
        );
        const rem = Math.max(0, effPrice - paidTotal);
        if (rem > 0) {
          olderDebt += rem;
          if (!pGroup) pGroup = g;
        }
      });

      if (olderDebt > 0) {
        return {
          monthKey: curKey,
          monthName: getMonthNameUz(curKey),
          amount: olderDebt,
          hasDebt: true,
          primaryGroup: pGroup,
        };
      }
    }

    return previousMonthDebtInfo;
  }, [
    previousMonthDebtInfo,
    month,
    assignedGroups,
    currentStudent,
    opData?.attendance,
    directorData?.centerSettings,
    allPayments,
  ]);

  // Tabledagi sof hisoblangan balans (StudentsPage bilan 100% bir xil)
  const tableBalance = useMemo(() => {
    const isTrial =
      currentStudent?.status === "trial" ||
      (assignedGroups.length > 0 &&
        assignedGroups.every((g) => {
          const m =
            currentStudent?.groupMemberships?.[g.id] ||
            currentStudent?.groupMemberships?.[String(g.id)];
          return !m?.activationDate || m?.status === "trial";
        }));
    const totalGroupSurplus = groupDebts.reduce(
      (sum, item) => sum + (item.groupBalance > 0 ? item.groupBalance : 0),
      0
    );
    const rawBal = Number(currentStudent?.balance || 0) + totalGroupSurplus - totalDebt;
    return isTrial && rawBal <= 0 ? 0 : rawBal;
  }, [currentStudent, assignedGroups, totalDebt, groupDebts]);

  // Student's payment history (Yangi to'lovlar birinchi chiqishi uchun tartiblangan)
  const studentPayments = useMemo(() => {
    return allPayments
      .filter((p) => String(p.studentId) === String(currentStudent?.id))
      .sort((a, b) => {
        const timeA = new Date(a.date || a.createdAt || 0).getTime() || 0;
        const timeB = new Date(b.date || b.createdAt || 0).getTime() || 0;
        if (timeB !== timeA) return timeB - timeA;
        const cA = new Date(a.createdAt || 0).getTime() || 0;
        const cB = new Date(b.createdAt || 0).getTime() || 0;
        if (cB !== cA) return cB - cA;
        return String(b.id || "").localeCompare(String(a.id || ""));
      });
  }, [allPayments, currentStudent?.id]);

  const totalPaidSum = useMemo(() => {
    return studentPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  }, [studentPayments]);

  // O'quvchining Coin tarixi (Transactions va Coin history birlashmasi)
  const studentCoinHistory = useMemo(() => {
    const fromTransactions = (directorData?.coinTransactions || opData?.coinTransactions || [])
      .filter((t) => String(t.studentId || t.student_id) === String(currentStudent?.id))
      .map((t) => ({
        id: t.id,
        section: t.section || t.category || "Darsdagi faollik",
        type: Number(t.amount) >= 0 ? "add" : "deduct",
        amount: Math.abs(Number(t.amount) || 0),
        reason: t.reason || "Coin amali",
        createdAt: t.createdAt || t.date || new Date().toISOString(),
      }));

    const fromStudentHistory = (currentStudent?.coinHistory || []).map((h, i) => ({
      id: h.id || `ch_${i}`,
      section: h.section || h.category || "Darsdagi faollik",
      type: h.type || (Number(h.amount) >= 0 ? "add" : "deduct"),
      amount: Math.abs(Number(h.amount) || 0),
      reason: h.reason || h.comment || "Coin amali",
      createdAt: h.createdAt || h.date || new Date().toISOString(),
    }));

    const map = new Map();
    [...fromStudentHistory, ...fromTransactions].forEach((item) => {
      map.set(String(item.id), item);
    });

    return Array.from(map.values()).sort((a, b) => {
      const tA = new Date(a.createdAt || a.date || 0).getTime() || 0;
      const tB = new Date(b.createdAt || b.date || 0).getTime() || 0;
      return tB - tA;
    });
  }, [directorData?.coinTransactions, opData?.coinTransactions, currentStudent]);

  // O'quvchining chegirmalari ro'yxati
  const studentDiscounts = useMemo(() => {
    if (Array.isArray(currentStudent?.discounts) && currentStudent.discounts.length > 0) {
      return currentStudent.discounts;
    }
    if (currentStudent?.discount && Number(currentStudent.discount) > 0) {
      return [
        {
          id: "disc_default",
          groupId: "",
          groupName: "Barcha guruhlar",
          value: Number(currentStudent.discount),
          type: currentStudent.discountType || "percent",
          startDate: currentStudent.joinedAt?.slice(0, 10) || new Date().toISOString().slice(0, 10),
          endDate: "2026-12-31",
          affectsTeacherShare: true,
          reason: currentStudent.discountReason || "Oila a'zolari chegirmasi",
          createdAt: currentStudent.createdAt || new Date().toISOString(),
        },
      ];
    }
    return [];
  }, [currentStudent]);

  // O'quvchiga aloqador barcha guruhlar (biriktirilgan + a'zolikdagi + to'lovlardagi)
  const allRelevantGroups = useMemo(() => {
    const groupMap = new Map();
    assignedGroups.forEach((g) => {
      if (g && g.id) groupMap.set(String(g.id), g);
    });
    const membershipGids = Object.keys(currentStudent?.groupMemberships || {});
    membershipGids.forEach((gid) => {
      if (!groupMap.has(String(gid))) {
        const found = allGroups.find((g) => String(g.id) === String(gid));
        if (found) groupMap.set(String(gid), found);
      }
    });
    studentPayments.forEach((p) => {
      if (p.groupId && !groupMap.has(String(p.groupId))) {
        const found = allGroups.find((g) => String(g.id) === String(p.groupId));
        if (found) groupMap.set(String(p.groupId), found);
      }
    });
    return Array.from(groupMap.values());
  }, [assignedGroups, currentStudent?.groupMemberships, allGroups, studentPayments]);

  // Tizim tomonidan faollashtirilganda yoki yangi oy kelganda balansdan minus qilingan abonent to'lovlari (Yechimlar)
  const studentCharges = useMemo(() => {
    const charges = [];
    const curMonth = thisMonthKey();

    allRelevantGroups.forEach((g) => {
      let fullPrice = Number(g.price || 0);
      if (currentStudent?.discount) {
        if (
          currentStudent.discountType === "percent" ||
          currentStudent.discountType === "%" ||
          currentStudent.discountType === "foiz"
        ) {
          fullPrice = Math.round(fullPrice * (1 - Number(currentStudent.discount) / 100));
        } else {
          fullPrice = Math.max(0, fullPrice - Number(currentStudent.discount));
        }
      }

      const membership =
        currentStudent?.groupMemberships?.[g.id] ||
        currentStudent?.groupMemberships?.[String(g.id)];

      const explicitActDate = membership?.activationDate || null;
      const fallbackActDate =
        membership?.reactivatedAt ||
        (membership?.status === "active"
          ? (membership?.enrolledAt || currentStudent?.activationDate || currentStudent?.joinedAt || currentStudent?.createdAt)
          : null);
      const actDateStr = (explicitActDate || fallbackActDate || "")?.slice(0, 10);

      // Agar sinovda bo'lsa va faollashtirilmagan bo'lsa, to'lov yechilmaydi
      if (!actDateStr && (membership?.status === "trial" || currentStudent?.status === "trial")) {
        return;
      }

      let startMonth = actDateStr ? actDateStr.slice(0, 7) : curMonth;
      studentPayments.forEach((p) => {
        if (String(p.groupId) === String(g.id) && p.month && p.month < startMonth) {
          startMonth = p.month;
        }
      });

      const monthsToProcess = getMonthsRange(startMonth, curMonth);
      const groupAttendances = (opData?.attendance || []).filter(
        (a) => String(a.groupId) === String(g.id)
      );

      monthsToProcess.forEach((mKey) => {
        const feeInfo = calculateStudentGroupFee({
          fullMonthlyFee: fullPrice,
          groupDays: g.days || ["Dush", "Chor", "Juma"],
          monthStr: mKey,
          membership,
          student: currentStudent,
          group: g,
          attendances: groupAttendances,
          settings: directorData?.centerSettings || {},
        });

        if (feeInfo.isTrial || feeInfo.isPaused || !feeInfo.calculatedFee || feeInfo.calculatedFee <= 0) {
          return;
        }

        const isActivationMonth = actDateStr && mKey === actDateStr.slice(0, 7);
        const chargeDate = isActivationMonth ? actDateStr : `${mKey}-01`;

        charges.push({
          id: `charge_${g.id}_${mKey}`,
          kind: "charge",
          date: chargeDate,
          groupId: g.id,
          groupName: g.name,
          month: mKey,
          monthName: getMonthNameUz(mKey),
          amount: feeInfo.calculatedFee,
          chargeType: isActivationMonth && feeInfo.isProrated
            ? "Guruhga faollashuv"
            : "Oylik kurs to'lovi",
          isProrated: feeInfo.isProrated,
          attendedLessons: feeInfo.attendedLessons || feeInfo.billableLessons || feeInfo.expectedLessons || 0,
          totalLessons: feeInfo.totalLessons || 12,
          reason: feeInfo.reason,
          actDateStr,
        });
      });
    });

    return charges.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [allRelevantGroups, currentStudent, studentPayments, opData?.attendance, directorData?.centerSettings]);

  const totalChargedSum = useMemo(() => {
    return studentCharges.reduce((sum, c) => sum + (c.amount || 0), 0);
  }, [studentCharges]);

  // Barcha tranzaksiyalar (Kirim to'lovlar va Chiqim yechimlar)
  const combinedTransactions = useMemo(() => {
    const list = [
      ...studentPayments.map((p) => ({
        id: p.id,
        kind: "payment",
        date: p.date || p.createdAt?.slice(0, 10) || "",
        createdAt: p.createdAt,
        groupId: p.groupId,
        groupName: allGroups.find((g) => String(g.id) === String(p.groupId))?.name || "Umumiy to'lov",
        month: p.month || "",
        amount: Number(p.amount) || 0,
        method: p.method || p.type || "Naqd pul",
        note: p.comment || p.note || "",
        receiptNumber: p.receiptNumber || p.id?.slice(-6),
      })),
      ...studentCharges.map((c) => ({
        id: c.id,
        kind: "charge",
        date: c.date,
        groupId: c.groupId,
        groupName: c.groupName,
        month: c.month,
        monthName: c.monthName,
        amount: c.amount,
        chargeType: c.chargeType,
        method: "Balansdan yechim",
        note: c.isProrated
          ? `Faollashuv: ${formatShortDate(c.actDateStr)} (${c.attendedLessons} ta dars)`
          : `${c.monthName} oyi uchun (${c.attendedLessons} ta dars)`,
        isProrated: c.isProrated,
      })),
    ];

    return list.sort((a, b) => {
      const timeA = new Date(a.date || a.createdAt || 0).getTime() || 0;
      const timeB = new Date(b.date || b.createdAt || 0).getTime() || 0;
      if (timeB !== timeA) return timeB - timeA;
      const cA = new Date(a.createdAt || 0).getTime() || 0;
      const cB = new Date(b.createdAt || 0).getTime() || 0;
      if (cB !== cA) return cB - cA;
      return String(b.id || "").localeCompare(String(a.id || ""));
    });
  }, [studentPayments, studentCharges, allGroups]);

  const filteredTransactions = useMemo(() => {
    if (paymentFilter === "charges") return combinedTransactions.filter((t) => t.kind === "charge");
    if (paymentFilter === "payments") return combinedTransactions.filter((t) => t.kind === "payment");
    return combinedTransactions;
  }, [combinedTransactions, paymentFilter]);

  // Attendance stats
  const attendanceRecords = useMemo(() => {
    const list = [];
    allAttendance.forEach((rec) => {
      const entry = (rec.entries || []).find((e) => e.studentId === currentStudent?.id);
      if (entry) {
        const grp = allGroups.find((g) => g.id === rec.groupId);
        list.push({
          date: rec.date,
          groupName: grp?.name || "Guruh",
          status: entry.status || "present",
          score: entry.score,
          note: entry.note || "",
        });
      }
    });
    return list.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [allAttendance, currentStudent?.id, allGroups]);

  const attendanceStats = useMemo(() => {
    const total = attendanceRecords.length;
    if (total === 0) return { total: 0, present: 0, absent: 0, late: 0, excused: 0, rate: 100 };
    const present = attendanceRecords.filter((r) => r.status === "present").length;
    const absent = attendanceRecords.filter((r) => r.status === "absent").length;
    const late = attendanceRecords.filter((r) => r.status === "late").length;
    const excused = attendanceRecords.filter((r) => r.status === "excused").length;
    const rate = Math.round(((present + late * 0.5) / total) * 100);
    return { total, present, absent, late, excused, rate };
  }, [attendanceRecords]);

  // Exams list
  const examRecords = useMemo(() => {
    return currentStudent?.exams || [
      {
        id: "ex_1",
        title: "IELTS Mock Test #1",
        date: "2026-02-10",
        groupName: assignedGroups[0]?.name || "General English",
        score: "7.0 / 9.0",
        status: "O'tdi",
        teacher: "O'qituvchi",
        comment: "Listening va Reading juda yaxshi, Writing ustida ishlash kerak",
      },
      {
        id: "ex_2",
        title: "Oylik nazorat imtihoni",
        date: "2026-01-25",
        groupName: assignedGroups[0]?.name || "General English",
        score: "88 / 100",
        status: "A'lo",
        teacher: "O'qituvchi",
        comment: "Barcha lug'atlar yod olingan",
      }
    ];
  }, [currentStudent?.exams, assignedGroups]);

  // Purchases list (Market / Coin store)
  const purchaseRecords = useMemo(() => {
    return currentStudent?.purchases || [
      {
        id: "pur_1",
        item: "COSMOS Maxsus Dasturchi Bloknoti",
        coins: 15,
        date: "2026-02-01",
        status: "Topshirildi",
      }
    ];
  }, [currentStudent?.purchases]);

  // Centralized payment trigger helper: pre-selects student, group and initiates payment modal
  const triggerPayment = useCallback(
    (targetGrp, targetAmount, targetMonth) => {
      const g = targetGrp || (assignedGroups.length > 0 ? assignedGroups[0] : null);
      if (openModal) {
        openModal({
          type: "recordPayment",
          student: currentStudent,
          studentId: currentStudent.id,
          group: g,
          groupId: g?.id,
          amount: targetAmount,
          month: targetMonth,
        });
      } else if (openPaymentModal) {
        openPaymentModal(currentStudent, g);
      } else if (onRecordPayment) {
        onRecordPayment({
          student: currentStudent,
          studentId: currentStudent.id,
          group: g,
          groupId: g?.id,
          amount: targetAmount,
          month: targetMonth,
        });
      } else {
        setPaymentModalData({
          student: currentStudent,
          group: g,
          amount: targetAmount,
          month: targetMonth,
        });
      }
    },
    [currentStudent, assignedGroups, openModal, openPaymentModal, onRecordPayment],
  );

  // Lidga qaytarish funksiyasi (Liddan o'tmagan bo'lsa qaytarib bo'lmaydi)
  const handleReturnToLead = useCallback(() => {
    setShowActionsMenu(false);
    const leads = directorData?.leads || opData?.leads || [];
    const cleanPhone = (currentStudent?.phone || "").replace(/\D/g, "");
    const matchingLead = leads.find(
      (l) =>
        (currentStudent?.leadId && String(l.id) === String(currentStudent.leadId)) ||
        (cleanPhone && l.phone && l.phone.replace(/\D/g, "") === cleanPhone)
    );
    const hasLeadOrigin = Boolean(
      currentStudent?.leadId ||
      currentStudent?.fromLead ||
      currentStudent?.source === "lead" ||
      matchingLead
    );

    if (!hasLeadOrigin) {
      setConfirmModalState({
        title: "Lidga qaytarib bo'lmaydi",
        message: "Ushbu o'quvchi liddan o'tmagan (to'g'ridan-to'g'ri o'quvchi sifatida ro'yxatga olingan), shuning uchun uni lidga qaytarish imkoni mavjud emas.",
        confirmText: "Tushundim",
        cancelText: null,
        danger: false,
        onConfirm: () => {},
      });
      return;
    }

    setConfirmModalState({
      title: "Lidga qaytarish",
      message: `${currentStudent?.name || "O'quvchi"}ni qayta lidlar ro'yxatiga o'tkazishni tasdiqlaysizmi? O'quvchi lidlar doskasiga qaytariladi.`,
      confirmText: "Ha, lidga qaytarish",
      cancelText: "Bekor qilish",
      danger: false,
      onConfirm: async () => {
        try {
          const updatedData = { status: "lead" };
          setLocalStudent((prev) => ({ ...prev, ...updatedData }));
          await api.updateStudent(currentStudent.id, updatedData);
          if (matchingLead) {
            await api.updateLead(matchingLead.id, { status: "new", stage: "new" });
          }
          await onUpdateStudent?.(currentStudent?.id, updatedData);
          setSaveSuccessMsg("O'quvchi muvaffaqiyatli lidga qaytarildi!");
          setTimeout(() => setSaveSuccessMsg(""), 2500);
        } catch (e) {
          console.error(e);
        }
      },
    });
  }, [currentStudent, directorData?.leads, opData?.leads, onUpdateStudent]);

  // Action Menu Items for 3-dots button (Uch nuqtada 9 ta tartiblangan amallar menyusi)
  const actionMenuItems = [
    // 1. Guruhga qo'shish option
    {
      key: "add_group",
      label: "Guruhga qo'shish",
      icon: <Users size={16} className="text-emerald-600" />,
      onClick: () => {
        setShowActionsMenu(false);
        setIsAddGroupModalOpen(true);
      },
    },
    // 2. Boshqa filialga o'tkazish
    {
      key: "transfer_branch",
      label: "Boshqa filialga o'tkazish",
      icon: <Building2 size={16} className="text-indigo-600" />,
      onClick: () => {
        setShowActionsMenu(false);
        setTargetBranchId(currentStudent?.branchId || "");
        setTargetGroupId("");
        setShowTransferBranchModal(true);
      },
    },
    // 3. To'lov qilish
    {
      key: "pay",
      label: "To'lov qilish",
      icon: <CreditCard size={16} className="text-emerald-600" />,
      onClick: () => {
        setShowActionsMenu(false);
        triggerPayment();
      },
    },
    // 4. Talaba balansini tahrirlash
    {
      key: "edit_balance",
      label: "Talaba balansini tahrirlash",
      icon: <Percent size={16} className="text-blue-600" />,
      onClick: () => {
        setShowActionsMenu(false);
        const actualBal = tableBalance !== undefined ? tableBalance : Number(currentStudent?.balance || 0);
        setNewBalanceInput(String(actualBal));
        setBalanceComment("");
        setShowEditBalanceModal(true);
      },
    },
    // 5. To'lovni qaytarish (Refund)
    {
      key: "refund",
      label: "To'lovni qaytarish",
      icon: <RotateCcw size={16} className="text-rose-600" />,
      onClick: () => {
        setShowActionsMenu(false);
        setShowRefundModal(true);
      },
    },
    // 6. O'chirish umumiy barcha guruhdan
    {
      key: "unenroll_all",
      label: "O'chirish (barcha guruhdan)",
      icon: <Trash2 size={16} className="text-rose-600" />,
      onClick: () => {
        setShowActionsMenu(false);
        setShowUnenrollAllModal(true);
      },
    },
    // 7. Tahrirlash
    {
      key: "edit",
      label: isEditing && activeTab === "edit" ? "Tahrirni yopish" : "Tahrirlash",
      icon: <Edit3 size={16} className="text-amber-600" />,
      onClick: () => {
        setShowActionsMenu(false);
        setIsEditing(!isEditing);
        setActiveTab("edit");
      },
    },
    // 8. Lidga qaytarish (agar liddan o'tmagan bo'lsa qaytarib bo'lmaydi)
    {
      key: "return_to_lead",
      label: "Lidga qaytarish",
      icon: <ArrowLeftRight size={16} className="text-purple-600" />,
      onClick: () => {
        handleReturnToLead();
      },
    },
    // 9. SMS jo'natish
    {
      key: "send_sms",
      label: "SMS jo'natish",
      icon: <Send size={16} className="text-violet-600" />,
      onClick: () => {
        setShowActionsMenu(false);
        setActiveTab("sms");
      },
    },
  ];

  // Notes & timeline list
  const notesList = useMemo(() => {
    let list = Array.isArray(currentStudent?.notes) ? [...currentStudent.notes] : [];
    if (list.length === 0 && currentStudent?.note) {
      list.push({
        id: "initial-note",
        text: currentStudent.note,
        type: "note",
        createdAt: currentStudent.createdAt || new Date().toISOString(),
        author: "Menejer",
      });
    }
    return list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [currentStudent?.notes, currentStudent?.note, currentStudent?.createdAt]);

  const currentStatus = STUDENT_STATUSES.find((st) => st.id === (currentStudent?.status || "active")) || STUDENT_STATUSES[0];

  // Course name(s) assigned to student
  const assignedCourseNames = useMemo(() => {
    if (assignedGroups.length === 0) return "Kurs belgilanmagan";
    const courseTitles = assignedGroups.map((g) => {
      const crs = courses.find((c) => c.id === g.courseId);
      return crs?.title || crs?.name || g.name;
    });
    return Array.from(new Set(courseTitles)).join(", ");
  }, [assignedGroups, courses]);

  // Handlers
  const handleStatusChange = async (newStatus) => {
    try {
      const currentMemberships = { ...(currentStudent?.groupMemberships || {}) };
      Object.keys(currentMemberships).forEach((gid) => {
        if (newStatus === "paused") {
          currentMemberships[gid] = { ...(currentMemberships[gid] || {}), status: "paused" };
        } else if (newStatus === "active" && currentMemberships[gid]?.status === "paused") {
          currentMemberships[gid] = { ...(currentMemberships[gid] || {}), status: "active" };
        }
      });

      const updatedData = {
        status: newStatus,
        groupMemberships: currentMemberships,
      };

      setLocalStudent((prev) => ({ ...prev, ...updatedData }));
      setFormData((prev) => ({ ...prev, status: newStatus }));

      await api.updateStudent(currentStudent.id, updatedData);

      if (onUpdateStudent) {
        await onUpdateStudent(currentStudent.id, updatedData);
      }
      setSaveSuccessMsg("O'quvchi holati yangilandi!");
      setTimeout(() => setSaveSuccessMsg(""), 2500);
    } catch (err) {
      console.error(err);
      setErrorMsg("Holatni o'zgartirishda xatolik yuz berdi");
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const updatedData = {
        name: formData.name,
        phone: formData.phone,
        parentPhone: formData.parentPhone,
        phone2: formData.parentPhone,
        parentName: formData.parentName,
        grade: formData.grade,
        school: formData.school,
        birthDate: formData.birthDate,
        gender: formData.gender,
        address: formData.address,
        source: formData.source,
        targetCourse: formData.targetCourse,
        interestedCourse: formData.targetCourse,
        branch: formData.branch,
        status: formData.status,
        balance: Number(formData.balance) || 0,
        coins: Number(formData.coins) || 0,
        note: formData.note,
      };

      setLocalStudent((prev) => ({ ...prev, ...updatedData }));
      await api.updateStudent(currentStudent.id, updatedData);

      if (onUpdateStudent) {
        await onUpdateStudent(currentStudent.id, updatedData);
      }
      setSaveSuccessMsg("O'quvchi ma'lumotlari muvaffaqiyatli saqlandi!");
      setIsEditing(false);
      setTimeout(() => setSaveSuccessMsg(""), 2500);
    } catch (err) {
      console.error(err);
      setErrorMsg("Saqlashda xatolik yuz berdi");
    }
  };

  const handleSaveDiscount = async (e) => {
    e.preventDefault();
    try {
      const updatedData = {
        discount: Number(discountVal) || 0,
        discountType: discountType,
        discountReason: discountReason,
      };

      setLocalStudent((prev) => ({ ...prev, ...updatedData }));
      await api.updateStudent(currentStudent.id, updatedData);

      if (onUpdateStudent) {
        await onUpdateStudent(currentStudent.id, updatedData);
      }
      setSaveSuccessMsg("Chegirma muvaffaqiyatli saqlandi!");
      setTimeout(() => setSaveSuccessMsg(""), 2500);
    } catch (err) {
      console.error(err);
      setErrorMsg("Chegirmani saqlashda xatolik");
    }
  };

  const handleSaveDiscountItem = async (discItem) => {
    try {
      let updatedList = [...(currentStudent?.discounts || [])];
      const existingIdx = updatedList.findIndex((d) => d.id === discItem.id);
      if (existingIdx >= 0) {
        updatedList[existingIdx] = discItem;
      } else {
        updatedList = [discItem, ...updatedList];
      }
      const updatedData = {
        discounts: updatedList,
        discount: discItem.value,
        discountType: discItem.type,
        discountReason: discItem.reason,
      };
      setLocalStudent((prev) => ({ ...prev, ...updatedData }));
      await api.updateStudent(currentStudent.id, updatedData);
      if (onUpdateStudent) {
        await onUpdateStudent(currentStudent.id, updatedData);
      }
      setSaveSuccessMsg("Chegirma muvaffaqiyatli saqlandi!");
      setTimeout(() => setSaveSuccessMsg(""), 2500);
    } catch (err) {
      console.error(err);
      setErrorMsg("Chegirmani saqlashda xatolik");
    }
  };

  const handleDeleteDiscountItem = (discId) => {
    setConfirmModalState({
      title: "Chegirmani o'chirish",
      message: "Ushbu chegirmani ro'yxatdan o'chirmoqchimisiz?",
      confirmText: "O'chirish",
      cancelText: "Bekor qilish",
      danger: true,
      onConfirm: async () => {
        try {
          const updatedList = (currentStudent?.discounts || []).filter((d) => d.id !== discId);
          const updatedData = {
            discounts: updatedList,
            discount: updatedList.length > 0 ? updatedList[0].value : 0,
            discountType: updatedList.length > 0 ? updatedList[0].type : "fixed",
            discountReason: updatedList.length > 0 ? updatedList[0].reason : "",
          };
          setLocalStudent((prev) => ({ ...prev, ...updatedData }));
          await api.updateStudent(currentStudent.id, updatedData);
          if (onUpdateStudent) {
            await onUpdateStudent(currentStudent.id, updatedData);
          }
          setSaveSuccessMsg("Chegirma muvaffaqiyatli o'chirildi!");
          setTimeout(() => setSaveSuccessMsg(""), 2500);
        } catch (err) {
          console.error(err);
          setErrorMsg("Chegirmani o'chirishda xatolik");
        }
      },
    });
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    setAddingNote(true);
    try {
      const noteItem = {
        id: "note_" + Date.now(),
        text: newNoteText.trim(),
        type: newNoteType,
        createdAt: new Date().toISOString(),
        author: "Menejer",
      };
      const updatedNotes = [noteItem, ...notesList.filter((n) => n.id !== "initial-note")];

      setLocalStudent((prev) => ({ ...prev, notes: updatedNotes }));
      await api.updateStudent(currentStudent.id, { notes: updatedNotes });

      if (onUpdateStudent) {
        await onUpdateStudent(currentStudent.id, { notes: updatedNotes });
      }

      setNewNoteText("");
      setSaveSuccessMsg("Yangi izoh qo'shildi!");
      setTimeout(() => setSaveSuccessMsg(""), 2500);
    } catch (err) {
      console.error(err);
      setErrorMsg("Izoh qo'shishda xatolik");
    } finally {
      setAddingNote(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    setConfirmModalState({
      title: "Izohni o'chirish",
      message: "Ushbu izohni o'chirmoqchimisiz?",
      onConfirm: async () => {
        try {
          const updatedNotes = notesList.filter((n) => n.id !== noteId);
          setLocalStudent((prev) => ({ ...prev, notes: updatedNotes }));
          await api.updateStudent(currentStudent.id, { notes: updatedNotes });

          if (onUpdateStudent) {
            await onUpdateStudent(currentStudent.id, { notes: updatedNotes });
          }
          setSaveSuccessMsg("Izoh o'chirildi");
          setTimeout(() => setSaveSuccessMsg(""), 2500);
        } catch (err) {
          console.error(err);
          setErrorMsg("Izohni o'chirishda xatolik");
        }
      },
    });
  };

  const handleCoinSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (coinAmount <= 0) return;
    try {
      const currentCoins = Number(currentStudent.coins || 0);
      const diff = coinActionType === "add" ? Number(coinAmount) : -Number(coinAmount);
      const newCoins = Math.max(0, currentCoins + diff);

      const newHistoryItem = {
        id: "coin_" + Date.now(),
        section: coinSection || "Darsdagi faollik",
        type: coinActionType,
        amount: Math.abs(Number(coinAmount)),
        reason: coinReason || "Coin amali",
        createdAt: new Date().toISOString(),
      };
      const updatedHistory = [newHistoryItem, ...(currentStudent.coinHistory || [])];

      const updatedData = { coins: newCoins, coinHistory: updatedHistory };
      setLocalStudent((prev) => ({ ...prev, ...updatedData }));
      await api.updateStudent(currentStudent.id, updatedData);

      if (onAddCoins) {
        await onAddCoins(currentStudent.id, diff, coinReason, coinSection);
      } else if (onUpdateStudent) {
        await onUpdateStudent(currentStudent.id, updatedData);
      }

      setSaveSuccessMsg(
        coinActionType === "add"
          ? `🪙 +${coinAmount} Cosmos Coin berildi!`
          : `🪙 -${coinAmount} Cosmos Coin ayirildi!`
      );
      setTimeout(() => setSaveSuccessMsg(""), 2500);
      setShowGiveCoinModal(false);
    } catch (err) {
      console.error(err);
      setErrorMsg("Coin amaliyotida xatolik");
    }
  };

  const handleSendSms = (e) => {
    e.preventDefault();
    if (!smsText.trim()) return;
    const newLog = {
      id: "sms_" + Date.now(),
      date: new Date().toISOString().slice(0, 10),
      text: smsText,
      status: "Yuborildi",
      phone: currentStudent.phone,
    };
    setSentSmsLogs([newLog, ...sentSmsLogs]);
    setSmsText("");
    setSaveSuccessMsg("SMS xabar yuborildi!");
    setTimeout(() => setSaveSuccessMsg(""), 2500);
  };

  const copyPhone = (p) => {
    if (!p) return;
    navigator.clipboard.writeText(p);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleQuickAssignGroup = async (groupId) => {
    if (!groupId) return;
    try {
      const targetGid = String(groupId);
      const newGroupIds = [...new Set([...(currentStudent?.groupIds || []).map(String), targetGid])];
      const currentMemberships = { ...(currentStudent?.groupMemberships || {}) };
      currentMemberships[targetGid] = {
        status: "trial",
        enrolledAt: new Date().toISOString(),
      };

      const updatedData = {
        groupIds: newGroupIds,
        groupMemberships: currentMemberships,
      };

      setLocalStudent((prev) => ({ ...prev, ...updatedData }));
      await api.updateStudent(currentStudent.id, updatedData);

      if (onAssignStudentToGroup) {
        await onAssignStudentToGroup(currentStudent.id, groupId);
      }
      if (onUpdateStudent) {
        await onUpdateStudent(currentStudent.id, updatedData);
      }
      setGroupToAssign("");
      setSaveSuccessMsg("O'quvchi sinov holatida guruhga qo'shildi!");
      setTimeout(() => setSaveSuccessMsg(""), 2500);
    } catch (err) {
      console.error(err);
      setErrorMsg("Guruhga biriktirishda xatolik");
    }
  };

  const handleActivateGroupSave = async ({ groupId, status, activationDate, notes }) => {
    try {
      const targetGid = String(groupId);
      const chosenActDate = status === "active" ? (activationDate || new Date().toISOString().slice(0, 10)) : null;
      const currentMemberships = { ...(currentStudent?.groupMemberships || {}) };
      currentMemberships[targetGid] = {
        ...(currentMemberships[targetGid] || {}),
        status: status || "active",
        activationDate: chosenActDate,
        reactivatedAt: chosenActDate,
        notes: notes || "",
        updatedAt: new Date().toISOString(),
      };

      const updatedData = {
        status: status === "active" ? "active" : currentStudent?.status,
        studiedOneMonth: status === "active" ? true : currentStudent?.studiedOneMonth,
        activationDate: status === "active" ? (chosenActDate || currentStudent?.activationDate) : currentStudent?.activationDate,
        groupMemberships: currentMemberships,
      };

      setLocalStudent((prev) => ({
        ...prev,
        ...updatedData,
        groupMemberships: {
          ...(prev?.groupMemberships || {}),
          ...currentMemberships,
        },
      }));

      await api.updateStudent(currentStudent.id, updatedData);

      if (onUpdateStudent) {
        await onUpdateStudent(currentStudent.id, updatedData);
      }
      setActivateModalData(null);
      setSaveSuccessMsg(
        status === "active"
          ? "O'quvchi guruhda muvaffaqiyatli faollashtirildi!"
          : status === "trial"
          ? "Guruh holati 'Sinovda' qilib belgilandi"
          : "Guruh holati 'Muzlatilgan' qilib belgilandi"
      );
      setTimeout(() => setSaveSuccessMsg(""), 2500);
    } catch (err) {
      console.error(err);
      setErrorMsg("Guruh holatini saqlashda xatolik yuz berdi");
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Url = reader.result;
        const updatedData = { photo: base64Url, avatar: base64Url };
        setLocalStudent((prev) => ({
          ...prev,
          ...updatedData,
        }));
        await api.updateStudent(currentStudent.id, updatedData);
        if (onUpdateStudent) {
          await onUpdateStudent(currentStudent.id, updatedData);
        }
        setSaveSuccessMsg("Profil rasmi muvaffaqiyatli yuklandi!");
        setTimeout(() => setSaveSuccessMsg(""), 2500);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setErrorMsg("Rasm yuklashda xatolik yuz berdi");
    }
  };

  const handleToggleFreezeStudent = async (groupId, currentIsPaused) => {
    try {
      const isPaused = currentStudent?.status === "paused" || currentIsPaused;
      const newStatus = isPaused ? "active" : "paused";
      const todayStr = new Date().toISOString().slice(0, 10);
      const currentMemberships = { ...(currentStudent?.groupMemberships || {}) };
      
      if (groupId) {
        const targetGid = String(groupId);
        const prevMem = currentMemberships[targetGid] || {};
        currentMemberships[targetGid] = {
          ...prevMem,
          status: newStatus,
          pausedAt: newStatus === "paused" ? todayStr : null,
          previousPausedAt: newStatus === "active" ? (prevMem.pausedAt || prevMem.previousPausedAt || null) : prevMem.previousPausedAt,
          activationDate: newStatus === "active" ? todayStr : prevMem.activationDate,
          reactivatedAt: newStatus === "active" ? todayStr : null,
          updatedAt: new Date().toISOString(),
        };
      } else {
        (currentStudent?.groupIds || []).forEach((gid) => {
          const targetGid = String(gid);
          const prevMem = currentMemberships[targetGid] || {};
          currentMemberships[targetGid] = {
            ...prevMem,
            status: newStatus,
            pausedAt: newStatus === "paused" ? todayStr : null,
            previousPausedAt: newStatus === "active" ? (prevMem.pausedAt || prevMem.previousPausedAt || null) : prevMem.previousPausedAt,
            activationDate: newStatus === "active" ? todayStr : prevMem.activationDate,
            reactivatedAt: newStatus === "active" ? todayStr : null,
            updatedAt: new Date().toISOString(),
          };
        });
      }

      const updatedData = {
        status: newStatus,
        pausedAt: newStatus === "paused" ? todayStr : null,
        reactivatedAt: newStatus === "active" ? todayStr : null,
        activationDate: newStatus === "active" ? todayStr : currentStudent?.activationDate,
        groupMemberships: currentMemberships,
      };

      setLocalStudent((prev) => ({
        ...prev,
        ...updatedData,
      }));
      setFormData((prev) => ({ ...prev, status: newStatus }));

      await api.updateStudent(currentStudent.id, updatedData);

      if (onUpdateStudent) {
        await onUpdateStudent(currentStudent.id, updatedData);
      }
      setSaveSuccessMsg(isPaused ? "O'quvchi qayta faollashtirildi!" : "O'quvchi muzlatildi!");
      setTimeout(() => setSaveSuccessMsg(""), 2500);
    } catch (err) {
      console.error(err);
      setErrorMsg("O'quvchi holatini o'zgartirishda xatolik yuz berdi");
    }
  };

  const handleReturnToTrial = async (groupId) => {
    try {
      const targetGid = String(groupId);
      const currentMemberships = { ...(currentStudent?.groupMemberships || {}) };
      currentMemberships[targetGid] = {
        ...(currentMemberships[targetGid] || {}),
        status: "trial",
        activationDate: null,
        updatedAt: new Date().toISOString(),
      };

      const updatedData = {
        groupMemberships: currentMemberships,
      };

      setLocalStudent((prev) => ({
        ...prev,
        ...updatedData,
      }));

      await api.updateStudent(currentStudent.id, updatedData);

      if (onUpdateStudent) {
        await onUpdateStudent(currentStudent.id, updatedData);
      }
      setSaveSuccessMsg("Guruh holati 'Sinov darsiga' qaytarildi!");
      setTimeout(() => setSaveSuccessMsg(""), 2500);
    } catch (err) {
      console.error(err);
      setErrorMsg("Sinov darsiga qaytarishda xatolik yuz berdi");
    }
  };

  const handleTransferGroupSave = async ({ fromGroupId, toGroupId, status, activationDate }) => {
    try {
      const targetFromId = String(fromGroupId);
      const targetToId = String(toGroupId);
      const remainingGroupIds = (currentStudent?.groupIds || []).map(String).filter((id) => id !== targetFromId);
      const newGroupIds = [...new Set([...remainingGroupIds, targetToId])];

      const currentMemberships = { ...(currentStudent?.groupMemberships || {}) };
      delete currentMemberships[targetFromId];
      currentMemberships[targetToId] = {
        status: status || "trial",
        activationDate: status === "active" ? (activationDate || new Date().toISOString().slice(0, 10)) : null,
        enrolledAt: new Date().toISOString(),
      };

      const updatedData = {
        groupIds: newGroupIds,
        groupMemberships: currentMemberships,
      };

      setLocalStudent((prev) => ({
        ...prev,
        ...updatedData,
      }));

      await api.updateStudent(currentStudent.id, updatedData);

      if (onUpdateStudent) {
        await onUpdateStudent(currentStudent.id, updatedData);
      }
      setTransferModalData(null);
      setSaveSuccessMsg("O'quvchi boshqa guruhga muvaffaqiyatli o'tkazildi!");
      setTimeout(() => setSaveSuccessMsg(""), 2500);
    } catch (err) {
      console.error(err);
      setErrorMsg("Guruhni o'tkazishda xatolik yuz berdi");
    }
  };

  const handleRemoveGroup = async (groupId) => {
    setConfirmModalState({
      title: "Guruhdan chiqarish",
      message: "Haqiqatan ham o'quvchini ushbu guruhdan chiqarmoqchimisiz?",
      onConfirm: async () => {
        try {
          const targetGid = String(groupId);
          const remaining = (currentStudent.groupIds || []).map(String).filter((id) => id !== targetGid);
          const currentMemberships = { ...(currentStudent?.groupMemberships || {}) };
          delete currentMemberships[targetGid];

          const updatedData = {
            groupIds: remaining,
            groupMemberships: currentMemberships,
          };

          setLocalStudent((prev) => ({
            ...prev,
            ...updatedData,
          }));

          await api.updateStudent(currentStudent.id, updatedData);

          if (onRemoveFromGroup) {
            onRemoveFromGroup(currentStudent.id, groupId);
          }
          if (onUpdateStudent) {
            await onUpdateStudent(currentStudent.id, updatedData);
          }
          setSaveSuccessMsg("O'quvchi guruhdan chiqarildi");
          setTimeout(() => setSaveSuccessMsg(""), 2500);
        } catch (err) {
          console.error(err);
          setErrorMsg("Guruhdan chiqarishda xatolik");
        }
      },
    });
  };

  const handleUnenrollAndRefund = (grp) => {
    setUnenrollGroupModalData(grp);
  };

  return (
    <div className="min-h-screen pb-20 space-y-6 text-slate-900 dark:text-slate-100 animate-in fade-in duration-200">
      {/* Notifications */}
      {saveSuccessMsg && (
        <div className="flex items-center gap-2 p-3.5 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold rounded-xl animate-in slide-in-from-top-2">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center gap-2 p-3.5 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-semibold rounded-xl animate-in slide-in-from-top-2">
          <AlertTriangle size={16} className="text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* TWO MAIN BLOCKS LAYOUT (MATCHING REQUESTED HTML TEMPLATE STYLE) */}
      <div className="layout">

        {/* LEFT CARD */}
        <div className="card" style={{ position: "relative" }}>
          <div className="profile-header">
            <button
              type="button"
              onClick={onBack}
              className="p-2 -ml-1 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
              title="O'quvchilar ro'yxatiga qaytish"
            >
              <ArrowLeft size={18} />
            </button>

            {/* Profile Avatar: Icon by default, custom image if set/uploaded */}
            <div className="relative group shrink-0">
              {currentStudent?.photo || currentStudent?.avatar || currentStudent?.photoUrl || currentStudent?.avatarUrl ? (
                <img
                  className="avatar w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
                  src={currentStudent.photo || currentStudent.avatar || currentStudent.photoUrl || currentStudent.avatarUrl}
                  alt={currentStudent.name || "avatar"}
                />
              ) : (
                <div className="avatar w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-xs">
                  <User size={22} className="text-slate-500 dark:text-slate-400" />
                </div>
              )}
              <label
                className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity text-white"
                title="Profil rasmini yuklash / o'zgartirish"
              >
                <Camera size={14} />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </label>
            </div>

            <div className="name-block">
              <h1>{currentStudent.name || "Xusanov Bexruzbek"}</h1>
            </div>
            <div className="relative header-actions-container">
              <button
                ref={actionsMenuRef}
                type="button"
                className="menu-btn cursor-pointer"
                id="menuToggle"
                onClick={() => setShowActionsMenu((prev) => !prev)}
                title="Qo'shimcha amallar"
              >
                <MoreVertical size={16} />
              </button>

              {showActionsMenu && (
                <div className="absolute right-0 top-full mt-1.5 w-60 bg-white dark:bg-slate-850 rounded-2xl shadow-xl border border-slate-200/90 dark:border-slate-700 py-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="space-y-0.5 px-1">
                    {actionMenuItems.map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => {
                          setShowActionsMenu(false);
                          item.onClick();
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                          item.key === "delete" || item.key === "refund"
                            ? "text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        <span className="icon flex items-center justify-center shrink-0">{item.icon}</span>
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 1-Qatorda Ixcham Ko'rsatkichlar (Balans, Coin, Kristal) */}
          <div className="grid grid-cols-3 gap-1.5 pt-3.5 pb-2 text-xs w-full">
            {/* 1. Balans (Tabledagi hisoblangan joriy balans) */}
            <button
              type="button"
              onClick={() => triggerPayment()}
              title={`Tabledagi balans: ${tableBalance > 0 ? "+" : ""}${money(tableBalance)} so'm`}
              className={`flex flex-col items-start justify-center p-2 rounded-lg border text-left transition-all cursor-pointer min-w-0 ${
                tableBalance > 0
                  ? "bg-emerald-50/70 hover:bg-emerald-100/70 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-200/70 dark:border-emerald-800/60"
                  : tableBalance < 0
                  ? "bg-rose-50/70 hover:bg-rose-100/70 dark:bg-rose-950/40 dark:hover:bg-rose-950/70 text-rose-800 dark:text-rose-300 border-rose-200/70 dark:border-rose-800/60"
                  : "bg-slate-50/70 hover:bg-slate-100/70 dark:bg-slate-800/40 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-300 border-slate-200/70 dark:border-slate-700/60"
              }`}
            >
              <div className="flex items-center gap-1 w-full min-w-0">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${tableBalance > 0 ? "bg-emerald-500" : tableBalance < 0 ? "bg-rose-500" : "bg-slate-400"}`} />
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate">Balans</span>
              </div>
              <div className="font-bold font-mono text-[11px] truncate mt-0.5 w-full">
                {tableBalance > 0 ? `+${money(tableBalance)}` : tableBalance < 0 ? `${money(tableBalance)}` : "0"} so'm
              </div>
            </button>

            {/* 2. Coinlar (Coins) */}
            <button
              type="button"
              onClick={() => setActiveTab("coins")}
              title="Coin tarixi boshqaruvi"
              className="flex flex-col items-start justify-center p-2 rounded-lg border bg-amber-50/70 hover:bg-amber-100/70 dark:bg-amber-950/30 dark:hover:bg-amber-950/60 border-amber-200/70 dark:border-amber-800/50 text-amber-900 dark:text-amber-300 text-left transition-all cursor-pointer min-w-0 group"
            >
              <div className="flex items-center gap-1 w-full min-w-0">
                <Coins size={11} className="text-amber-500 shrink-0" />
                <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 truncate">Coin</span>
                <Edit3 size={9} className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto text-amber-500 shrink-0" />
              </div>
              <div className="font-bold font-mono text-[11px] truncate mt-0.5 w-full text-amber-900 dark:text-amber-200">
                {currentStudent.coins || 0}
              </div>
            </button>

            {/* 3. O'tgan oydan qarz */}
            <button
              type="button"
              onClick={() => {
                if (pastDebtInfo.hasDebt) {
                  triggerPayment(pastDebtInfo.primaryGroup, pastDebtInfo.amount, pastDebtInfo.monthKey);
                } else {
                  setActiveTab("payments");
                }
              }}
              title={
                pastDebtInfo.hasDebt
                  ? `${pastDebtInfo.monthName} qarzi: ${money(pastDebtInfo.amount)} so'm. To'lov qilish uchun bosing`
                  : "O'tgan oydan qarz yo'q"
              }
              className={`flex flex-col items-start justify-center p-2 rounded-lg border text-left transition-all cursor-pointer min-w-0 group ${
                pastDebtInfo.hasDebt
                  ? "bg-rose-50/80 hover:bg-rose-100/80 dark:bg-rose-950/40 dark:hover:bg-rose-950/70 border-rose-200/80 dark:border-rose-800/60 text-rose-900 dark:text-rose-200"
                  : "bg-slate-50/70 hover:bg-slate-100/70 dark:bg-slate-800/40 dark:hover:bg-slate-800/60 border-slate-200/70 dark:border-slate-700/50 text-slate-800 dark:text-slate-200"
              }`}
            >
              <div className="flex items-center gap-1 w-full min-w-0">
                {pastDebtInfo.hasDebt ? (
                  <AlertCircle size={11} className="text-rose-500 shrink-0" />
                ) : (
                  <CheckCircle2 size={11} className="text-emerald-500 shrink-0" />
                )}
                <span
                  className={`text-[10px] font-semibold truncate ${
                    pastDebtInfo.hasDebt
                      ? "text-rose-700 dark:text-rose-400"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {pastDebtInfo.monthName} qarzi
                </span>
                <CreditCard
                  size={9}
                  className={`opacity-0 group-hover:opacity-100 transition-opacity ml-auto shrink-0 ${
                    pastDebtInfo.hasDebt ? "text-rose-500" : "text-slate-400"
                  }`}
                />
              </div>
              <div
                className={`font-bold font-mono text-[11px] truncate mt-0.5 w-full ${
                  pastDebtInfo.hasDebt
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {pastDebtInfo.hasDebt ? `-${money(pastDebtInfo.amount)} so'm` : "Qarz yo'q"}
              </div>
            </button>
          </div>

          <div className="info-line">
            <span className="label">Telefon raqam:</span>{" "}
            <span className="value">+(998) {currentStudent.phone ? displayPhone(currentStudent.phone) : "—"}</span>
          </div>
          <div className="info-line">
            <span className="label">Tug'ilgan sana:</span>{" "}
            <span className="value">{currentStudent.birthDate ? formatDate(currentStudent.birthDate) : "Mavjud emas"}</span>
          </div>
          <div className="info-line">
            <span className="label">Talaba qo'shilgan sana :</span>{" "}
            <span className="value">{currentStudent.joinedAt ? formatDate(currentStudent.joinedAt) : currentStudent.createdAt ? formatDate(currentStudent.createdAt.slice(0, 10)) : formatDate(new Date().toISOString().slice(0, 10))}</span>
          </div>

          <div className="actions-row">
            <button
              type="button"
              onClick={() => setShowMoreInfo(!showMoreInfo)}
              className="link-btn text-xs font-semibold hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-0 p-0 text-indigo-600 dark:text-indigo-400"
            >
              <span>Qo'shimcha ma'lumotlar</span>
              {showMoreInfo ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
            <button
              type="button"
              className="icon-btn-mini"
              onClick={() => setActiveTab("sms")}
              title="SMS jo'natish"
            >
              <MessageSquare size={13} />
            </button>
            <button
              type="button"
              className="icon-btn-mini"
              onClick={() => triggerPayment()}
              title="To'lov qabul qilish"
            >
              <CreditCard size={13} />
            </button>
            <button
              type="button"
              className="outline-btn flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold cursor-pointer rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 hover:bg-indigo-100/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 transition-colors"
              onClick={() => setActiveTab("history")}
            >
              <History size={13} />
              <span>Lid tarixi</span>
            </button>
          </div>

          {showMoreInfo && (
            <div className="info-table">
              <div className="row">
                <div className="k">Kurs</div>
                <div className="v">{assignedCourseNames || "Biriktirilmagan"}</div>
              </div>
              <div className="row">
                <div className="k">Qo'shimcha raqam</div>
                <div className="v">{currentStudent.parentPhone || currentStudent.phone2 || "Kiritilmagan"}</div>
              </div>
              <div className="row">
                <div className="k">Sana</div>
                <div className="v">{currentStudent.joinedAt ? formatDate(currentStudent.joinedAt) : currentStudent.createdAt ? formatDate(currentStudent.createdAt.slice(0, 10)) : "—"}</div>
              </div>
              <div className="row">
                <div className="k">Biz haqqimizda qaerdan eshitdingiz</div>
                <div className="v">{currentStudent.source || "Kiritilmagan"}</div>
              </div>
              <div className="row">
                <div className="k">Qiziqqan kursi</div>
                <div className="v">{currentStudent.targetCourse || currentStudent.interestedCourse || "—"}</div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT CARD */}
        <div className="card">
          <div className="tabs-row">
            {[
              { id: "groups", label: "Guruhlar" },
              { id: "payments", label: "To'lovlar" },
              { id: "coins", label: "Coin tarixi" },
              { id: "notes", label: "Eslatma" },
              { id: "discounts", label: "Chegirma" },
              { id: "exams", label: "Imtihonlar" },
              { id: "history", label: "Tarix" },
              { id: "purchases", label: "Xaridlar" },
              { id: "sms", label: "SMS" },
            ].map((tb) => (
              <span
                key={tb.id}
                className={`tab ${activeTab === tb.id ? "active" : ""}`}
                onClick={() => {
                  setActiveTab(tb.id);
                  setIsEditing(false);
                }}
              >
                {tb.label}
              </span>
            ))}
          </div>

          {/* TAB 1: GURUHLAR */}
          {activeTab === "groups" && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-950/80 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold">
                      <GraduationCap size={18} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                        A'zo bo'lgan guruhlari ({assignedGroups.length} ta)
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        O'quvchi qatnashayotgan dars jadvallari va to'lov holati
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddGroupModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    <Plus size={14} />
                    <span>Guruhga qo'shish</span>
                  </button>
                </div>

                {assignedGroups.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 space-y-3">
                    <GraduationCap size={32} className="mx-auto text-slate-300 dark:text-slate-600" />
                    <div>
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        Ushbu o'quvchi hali hech qaysi guruhga qo'shilmagan
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        O'quvchini darslarga biriktirish uchun guruh tanlang
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAddGroupModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs mx-auto"
                    >
                      <Plus size={14} />
                      <span>Guruhga qo'shish</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 2xl:grid-cols-2 gap-5">
                    {groupDebts.map((item) => {
                      const {
                        group: grp,
                        membership,
                        membershipStatus,
                        isTrial,
                        isPaused,
                        activationDate,
                        price,
                        fullPrice,
                        paid,
                        isPartial,
                        effectiveCovered,
                        remainingDebt,
                        prevRemainingDebt,
                        prevMonthName,
                        prevKey,
                        totalGroupRemainingDebt,
                        groupBalance,
                        isProrated,
                        proratedReason,
                        attendedLessons,
                        missedLessons,
                        totalLessons,
                      } = item;

                      const crs = courses.find((c) => c.id === grp.courseId);
                      const tch = teachers.find((t) => String(t.id) === String(grp.teacherHrId || grp.teacherId));
                      const isMenuOpen = openGroupMenuId === grp.id;

                      const courseBadgeText =
                        crs?.title || crs?.name || `${grp.name} ${grp.price ? `${Math.round(grp.price / 1000)}K` : "390K"}`;

                      return (
                        <div
                          key={grp.id}
                          className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs relative space-y-3.5 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                        >
                          {/* Box Header (Group Name) */}
                          <div className="border border-slate-700/80 dark:border-slate-500 rounded-lg py-2 px-3 text-center font-bold text-slate-850 dark:text-white text-base tracking-wide bg-white dark:bg-slate-900/60">
                            {grp.name}
                          </div>

                          {/* Upper Section */}
                          <div className="space-y-2.5 text-sm">
                            {/* O'qituvchi */}
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800 dark:text-slate-200">O'qituvchi:</span>
                              <div className="flex items-center gap-2.5">
                                <span className="text-sky-500 hover:text-sky-600 font-semibold cursor-pointer">
                                  {tch ? tch.name : "Shaxzod Odilov"}
                                </span>
                                {/* 3-dots circular button */}
                                <div className="relative group-card-actions-container">
                                  <button
                                    type="button"
                                    onClick={() => setOpenGroupMenuId(isMenuOpen ? null : grp.id)}
                                    className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
                                    title="Amallar menyusi"
                                  >
                                    <MoreVertical size={14} />
                                  </button>

                                   {/* Dropdown Menu */}
                                  {isMenuOpen && (
                                    <div className="absolute right-0 top-full mt-1.5 w-56 bg-white dark:bg-slate-850 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-30 text-xs animate-in fade-in zoom-in-95">
                                      {/* 1. Faollashtirish */}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setOpenGroupMenuId(null);
                                          setActivateModalData({
                                            group: grp,
                                            membership,
                                            fullPrice,
                                          });
                                        }}
                                        className="w-full px-3.5 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 flex items-center gap-2.5 font-semibold transition-colors cursor-pointer"
                                      >
                                        <Zap size={14} className="text-amber-500 shrink-0" />
                                        <span>Faollashtirish</span>
                                      </button>

                                      {/* 2. To'lov qilish */}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setOpenGroupMenuId(null);
                                          triggerPayment(grp);
                                        }}
                                        className="w-full px-3.5 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 flex items-center gap-2.5 font-semibold transition-colors cursor-pointer"
                                      >
                                        <CreditCard size={14} className="text-emerald-500 shrink-0" />
                                        <span>To'lov qilish</span>
                                      </button>

                                      {/* 3. Muzlatish / Muzlatishdan chiqarish */}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setOpenGroupMenuId(null);
                                          handleToggleFreezeStudent(grp.id, isPaused);
                                        }}
                                        className="w-full px-3.5 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 flex items-center gap-2.5 font-semibold transition-colors cursor-pointer"
                                      >
                                        <Snowflake size={14} className="text-sky-500 shrink-0" />
                                        <span>{currentStudent?.status === "paused" || isPaused ? "Muzlatishdan chiqarish" : "Muzlatish"}</span>
                                      </button>

                                      {/* 4. Sinov darsiga qaytarish */}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setOpenGroupMenuId(null);
                                          handleReturnToTrial(grp.id);
                                        }}
                                        className="w-full px-3.5 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 flex items-center gap-2.5 font-semibold transition-colors cursor-pointer"
                                      >
                                        <RotateCcw size={14} className="text-amber-500 shrink-0" />
                                        <span>Sinov darsiga qaytarish</span>
                                      </button>

                                      {/* 5. Boshqa guruhga o'tkazish */}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setOpenGroupMenuId(null);
                                          setTransferModalData(grp);
                                        }}
                                        className="w-full px-3.5 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 flex items-center gap-2.5 font-semibold transition-colors cursor-pointer"
                                      >
                                        <ArrowLeftRight size={14} className="text-indigo-500 shrink-0" />
                                        <span>Boshqa guruhga o'tkazish</span>
                                      </button>

                                      <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

                                      {/* 6. O'chirish */}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setOpenGroupMenuId(null);
                                          handleUnenrollAndRefund(grp);
                                        }}
                                        className="w-full px-3.5 py-2 text-left hover:bg-orange-50 dark:hover:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center gap-2.5 font-semibold transition-colors cursor-pointer"
                                      >
                                        <LogOut size={14} className="text-orange-500 shrink-0" />
                                        <span>Tark etish (Refund)</span>
                                      </button>
                                      
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setOpenGroupMenuId(null);
                                          handleRemoveGroup(grp.id);
                                        }}
                                        className="w-full px-3.5 py-2 text-left hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center gap-2.5 font-semibold transition-colors cursor-pointer"
                                      >
                                        <Trash2 size={14} className="text-rose-500 shrink-0" />
                                        <span>O'chirish</span>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Dars kunlari */}
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800 dark:text-slate-200">Dars kunlari:</span>
                              <span className="text-slate-600 dark:text-slate-300 font-medium text-right">
                                {formatGroupDays(grp.days)}
                              </span>
                            </div>

                            {/* Vaqt */}
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800 dark:text-slate-200">Vaqt:</span>
                              <span className="text-slate-600 dark:text-slate-300 font-medium text-right">
                                {grp.time || "13:30 - 15:30"}
                              </span>
                            </div>

                            {/* Kursi */}
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800 dark:text-slate-200">Kursi:</span>
                              <span className="px-2.5 py-1 rounded-md bg-[#4F46E5] text-white font-bold text-xs uppercase tracking-wider text-right shadow-xs">
                                {courseBadgeText}
                              </span>
                            </div>
                          </div>

                          {/* Divider */}
                          <hr className="border-t border-slate-200 dark:border-slate-700/80 my-2" />

                          {/* Lower Section */}
                          <div className="space-y-2.5 text-sm">
                            {/* Holati */}
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800 dark:text-slate-200">Holati:</span>
                              {isTrial ? (
                                <span className="px-2.5 py-0.5 rounded bg-amber-500 text-white font-bold text-xs">
                                  Sinovda
                                </span>
                              ) : isPaused ? (
                                <span className="px-2.5 py-0.5 rounded bg-sky-500 text-white font-bold text-xs">
                                  Muzlatilgan
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded bg-[#4F46E5] text-white font-bold text-xs">
                                  Aktiv
                                </span>
                              )}
                            </div>

                            {/* Guruhga qo'shilgan sana */}
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800 dark:text-slate-200">Guruhga qo'shilgan sana:</span>
                              <span className="text-slate-600 dark:text-slate-300 font-medium text-right">
                                {formatShortDate(membership?.enrolledAt || currentStudent?.joinedAt || currentStudent?.createdAt)}
                              </span>
                            </div>

                            {/* Boshlanish sanasi */}
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800 dark:text-slate-200">Boshlanish sanasi:</span>
                              <span className="text-slate-600 dark:text-slate-300 font-medium text-right">
                                {formatShortDate(grp.startDate || grp.createdAt || currentStudent?.joinedAt)}
                              </span>
                            </div>

                            {/* Guruhda faollashtirilgan sana */}
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800 dark:text-slate-200">Guruhda faollashtirilgan sana:</span>
                              <button
                                type="button"
                                onClick={() =>
                                  setActivateModalData({
                                    group: grp,
                                    membership,
                                    fullPrice,
                                  })
                                }
                                className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-200 font-medium hover:text-indigo-600 dark:hover:text-indigo-400 group cursor-pointer transition-colors"
                                title="Faollashtirish sanasini o'zgartirish"
                              >
                                <SquarePen size={15} className="text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                                <span>
                                  {activationDate ? formatShortDate(activationDate) : "— (Faollashtirilmagan)"}
                                </span>
                              </button>
                            </div>

                            {/* Guruh narxi */}
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800 dark:text-slate-200">Guruh narxi:</span>
                              <span className="text-slate-800 dark:text-slate-200 font-medium text-right">
                                {money(fullPrice || grp.price || 0)} so'm
                              </span>
                            </div>

                            {/* Guruh balansi */}
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800 dark:text-slate-200">Guruh balansi:</span>
                              <span
                                className={`font-mono font-bold text-sm text-right ${
                                  groupBalance < 0
                                    ? "text-rose-600 dark:text-rose-400"
                                    : groupBalance > 0
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : "text-slate-700 dark:text-slate-300"
                                }`}
                              >
                                {groupBalance < 0
                                  ? `-${money(Math.abs(groupBalance))} so'm`
                                  : groupBalance > 0
                                  ? `+${money(groupBalance)} so'm`
                                  : "0 so'm"}
                              </span>
                            </div>

                            {/* To'lov holati */}
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800 dark:text-slate-200">To'lov holati:</span>
                              <span
                                className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                                  isTrial
                                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                                    : paid && totalGroupRemainingDebt === 0
                                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                                    : isPartial
                                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                                    : "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                                }`}
                              >
                                {isTrial
                                  ? "Sinovda"
                                  : paid && totalGroupRemainingDebt === 0
                                  ? "To'langan"
                                  : isPartial
                                  ? "Qisman to'langan"
                                  : "To'lanmagan"}
                              </span>
                            </div>

                            {/* O'tgan oy qarzi bo'lsa */}
                            {prevRemainingDebt > 0 && (
                              <div className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-rose-50/70 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 font-semibold">
                                <span>O'tgan oy ({prevMonthName}) qarzi:</span>
                                <span className="font-mono font-bold">-{money(prevRemainingDebt)} so'm</span>
                              </div>
                            )}
                          </div>

                          {/* Amallar: To'lov qilish va Davomat & Baho */}
                          <div className="grid grid-cols-2 gap-2 mt-2 pt-1">
                            <button
                              type="button"
                              onClick={() =>
                                triggerPayment(
                                  grp,
                                  totalGroupRemainingDebt > 0 ? totalGroupRemainingDebt : fullPrice,
                                  prevRemainingDebt > 0 && remainingDebt === 0 ? prevKey : month
                                )
                              }
                              className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                              title={`${grp.name} uchun to'lov qabul qilish`}
                            >
                              <CreditCard size={14} />
                              <span>To'lov qilish</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setAttendanceModalGroup(grp)}
                              className="w-full py-2 px-3 rounded-lg border border-sky-400/90 dark:border-sky-600 bg-sky-50/40 hover:bg-sky-100/70 dark:bg-sky-950/20 text-sky-600 dark:text-sky-400 font-bold text-xs flex items-center justify-center transition-colors cursor-pointer"
                            >
                              Davomat & Baho
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: TO'LOVLAR */}
          {activeTab === "payments" && (
            <div className="space-y-4">
              {/* Yuqori qisqa hisob ko'rsatkichlari (Yagona toza panel) */}
              <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800">
                <div className="py-2 sm:py-0 sm:px-4 first:pl-0">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Qarzdorlik</div>
                  <div className={`text-xl font-black mt-0.5 ${totalDebt > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600"}`}>
                    {money(totalDebt)} <span className="text-xs font-normal text-slate-400">so'm</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {totalDebt > 0 ? "To'lanishi kutilmoqda" : "Qarzdorlik yo'q"}
                  </div>
                </div>

                <div className="py-2 sm:py-0 sm:px-4">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Jami To'langan</div>
                  <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                    +{money(totalPaidSum)} <span className="text-xs font-normal text-slate-400">so'm</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{studentPayments.length} ta to'lov (Kirim)</div>
                </div>

                <div className="py-2 sm:py-0 sm:px-4 last:pr-0">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Jami Hisoblangan</div>
                  <div className="text-xl font-black text-rose-600 dark:text-rose-400 mt-0.5">
                    -{money(totalChargedSum)} <span className="text-xs font-normal text-slate-400">so'm</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{studentCharges.length} ta yechim (Chiqim)</div>
                </div>
              </div>

              {/* To'lovlar va Yechimlar ro'yxati jadvali */}
              <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                      <CreditCard size={15} className="text-emerald-600" />
                      To'lovlar va Yechimlar tarixi
                    </h3>
                    {/* Filtrlash tugmalari */}
                    <div className="inline-flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => setPaymentFilter("all")}
                        className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer text-xs ${
                          paymentFilter === "all"
                            ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                            : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                        }`}
                      >
                        Barchasi ({combinedTransactions.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentFilter("charges")}
                        className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer text-xs ${
                          paymentFilter === "charges"
                            ? "bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs"
                            : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                        }`}
                      >
                        Yechimlar ({studentCharges.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentFilter("payments")}
                        className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer text-xs ${
                          paymentFilter === "payments"
                            ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs"
                            : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                        }`}
                      >
                        To'lovlar ({studentPayments.length})
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowRefundModal(true)}
                      className="px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw size={13} />
                      <span>Refund</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerPayment()}
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={13} />
                      <span>To'lov qabul qilish</span>
                    </button>
                  </div>
                </div>

                {filteredTransactions.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs font-medium">
                    Hozircha operatsiyalar mavjud emas
                  </div>
                ) : (
                  <div className="overflow-x-auto max-h-[calc(100vh-320px)] overflow-y-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="sticky top-0 z-10 bg-slate-50/90 dark:bg-slate-800/90 backdrop-blur-xs">
                        <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                          <th className="py-2.5 px-3">Sana</th>
                          <th className="py-2.5 px-3">Guruh</th>
                          <th className="py-2.5 px-3">Summa</th>
                          <th className="py-2.5 px-3">Oy</th>
                          <th className="py-2.5 px-3">Usul / Manba</th>
                          <th className="py-2.5 px-3">Izoh</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                        {filteredTransactions.map((item) => {
                          const isPayment = item.kind === "payment";
                          const isRefund = item.isRefund || (isPayment && Number(item.amount || 0) < 0);
                          const noteText = item.note || (isPayment ? (isRefund ? "Refund (Pul qaytarish)" : "To'lov (Kirim)") : (item.chargeType || "Yechim"));

                          return (
                            <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                              <td className="py-2 px-3 font-mono font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                                {formatDate(item.date)}
                              </td>
                              <td className="py-2 px-3">
                                <span className="font-bold text-slate-800 dark:text-slate-200">
                                  {item.groupName}
                                </span>
                              </td>
                              <td className="py-2 px-3 whitespace-nowrap">
                                {isPayment ? (
                                  isRefund ? (
                                    <span className="font-bold font-mono text-rose-600 dark:text-rose-400 text-xs sm:text-sm">
                                      {money(item.amount)} so'm
                                    </span>
                                  ) : (
                                    <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm">
                                      +{money(item.amount)} so'm
                                    </span>
                                  )
                                ) : (
                                  <span className="font-bold font-mono text-rose-600 dark:text-rose-400 text-xs sm:text-sm">
                                    -{money(item.amount)} so'm
                                  </span>
                                )}
                              </td>
                              <td className="py-2 px-3 font-mono text-slate-500 whitespace-nowrap">
                                {item.month || "—"}
                              </td>
                              <td className="py-2 px-3 whitespace-nowrap">
                                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                                  {item.method || "Naqd pul"}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-slate-600 dark:text-slate-300 max-w-xs truncate" title={noteText}>
                                {noteText}
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
          )}

          {/* TAB 3: ESLATMA (NOTES) */}
          {activeTab === "notes" && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <MessageSquare size={18} className="text-violet-600" />
                  Yangi eslatma / Muloqot natijasini yozish
                </h3>

                <form onSubmit={handleAddNote} className="space-y-3">
                  <div>
                    <label className={LABEL_CLS}>Izoh turi</label>
                    <div className="flex flex-wrap gap-2">
                      {NOTE_TYPES.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setNewNoteType(t.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                            newNoteType === t.id
                              ? `${t.color} border-current shadow-xs`
                              : "bg-slate-50 dark:bg-slate-800 text-slate-600 border-slate-200 dark:border-slate-700"
                          }`}
                        >
                          <span>{t.icon}</span>
                          <span>{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className={LABEL_CLS}>Eslatma matni</label>
                    <textarea
                      rows={3}
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      placeholder="Muloqot tafsilotlari, ota-onasi bilan suhbat, dars natijasi yoki eslatma yozing..."
                      className={INPUT_CLS}
                      required
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={addingNote || !newNoteText.trim()}
                      className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Send size={13} />
                      <span>Eslatmani saqlash</span>
                    </button>
                  </div>
                </form>
              </div>

              <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Muloqot va eslatmalar tarixi ({notesList.length} ta)
                </h3>

                {notesList.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-slate-400 text-xs">
                    Eslatmalar mavjud emas
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notesList.map((item) => {
                      const typeObj = NOTE_TYPES.find((t) => t.id === item.type) || NOTE_TYPES[4];
                      return (
                        <div
                          key={item.id}
                          className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-800/50 flex items-start justify-between gap-4"
                        >
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="text-xl p-2 rounded-xl bg-white dark:bg-slate-700 shadow-xs shrink-0">
                              {typeObj.icon}
                            </div>
                            <div className="space-y-1 min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                                  {item.author || "Menejer"}
                                </span>
                                <span className={`text-[10px] font-bold px-2 py-0.2 rounded-xl ${typeObj.color}`}>
                                  {typeObj.label}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {formatDate(item.createdAt?.slice(0, 10))} • {item.createdAt?.slice(11, 16)}
                                </span>
                              </div>
                              <p className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap break-words leading-relaxed">
                                {item.text}
                              </p>
                            </div>
                          </div>

                          {item.id !== "initial-note" && (
                            <button
                              type="button"
                              onClick={() => handleDeleteNote(item.id)}
                              className="p-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                              title="Izohni o'chirish"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: CHEGIRMA (DISCOUNTS) */}
          {activeTab === "discounts" && (
            <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <Tag size={18} className="text-violet-600" />
                    O'quvchi chegirmalari ({studentDiscounts.length} ta)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    O'quvchiga biriktirilgan guruh chegirmalari va ularning amal qilish muddatlari
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingDiscount(null);
                    setShowAddDiscountModal(true);
                  }}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>Chegirma berish</span>
                </button>
              </div>

              {studentDiscounts.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-slate-400 text-xs">
                  Hozircha hech qanday chegirma biriktirilmagan. "Chegirma berish" tugmasi orqali yangi chegirma qo'shishingiz mumkin.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/75 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300">
                        <th className="py-3 px-3.5 font-bold">Guruh</th>
                        <th className="py-3 px-3.5 font-bold">Qiymat</th>
                        <th className="py-3 px-3.5 font-bold">Dan</th>
                        <th className="py-3 px-3.5 font-bold">Gacha</th>
                        <th className="py-3 px-3.5 font-bold">O'qituvchi ulushiga ta'sir qiladimi</th>
                        <th className="py-3 px-3.5 font-bold">Sabab</th>
                        <th className="py-3 px-3.5 font-bold text-right">Amallar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {studentDiscounts.map((d) => {
                        const grpName = d.groupName || (d.groupId ? allGroups.find((g) => String(g.id) === String(d.groupId))?.name : "Barcha guruhlar") || "Barcha guruhlar";
                        const isAffects = d.affectsTeacherShare !== false && d.affectsTeacherShare !== "false";
                        return (
                          <tr key={d.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="py-3 px-3.5 font-semibold text-slate-900 dark:text-white">
                              {grpName}
                            </td>
                            <td className="py-3 px-3.5 font-mono font-bold text-violet-600 dark:text-violet-400">
                              {d.type === "percent" ? `${d.value}%` : `${money(d.value)} so'm`}
                            </td>
                            <td className="py-3 px-3.5 font-mono text-slate-600 dark:text-slate-300">
                              {d.startDate ? formatDate(d.startDate) : "—"}
                            </td>
                            <td className="py-3 px-3.5 font-mono text-slate-600 dark:text-slate-300">
                              {d.endDate ? formatDate(d.endDate) : "—"}
                            </td>
                            <td className="py-3 px-3.5">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                  isAffects
                                    ? "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                                    : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                }`}
                              >
                                {isAffects ? "Ta'sir qiladi" : "Ta'sir qilmaydi"}
                              </span>
                            </td>
                            <td className="py-3 px-3.5 text-slate-700 dark:text-slate-300 max-w-xs truncate" title={d.reason}>
                              {d.reason || "—"}
                            </td>
                            <td className="py-3 px-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingDiscount(d);
                                    setShowAddDiscountModal(true);
                                  }}
                                  className="p-1.5 text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                  title="Tahrirlash"
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteDiscountItem(d.id)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                  title="O'chirish"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: IMTIHONLAR (EXAMS) */}
          {activeTab === "exams" && (
            <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <Award size={18} className="text-amber-500" />
                    Imtihonlar va Test Natijalari ({examRecords.length} ta)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    O'quvchining barcha oraliq va yakuniy imtihon ko'rsatkichlari
                  </p>
                </div>
              </div>

              {examRecords.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-slate-400 text-xs">
                  Imtihon yozuvlari topilmadi
                </div>
              ) : (
                <div className="space-y-3">
                  {examRecords.map((ex) => (
                    <div
                      key={ex.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                            {ex.title}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            {ex.groupName}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Sana: {formatDate(ex.date)} • Izoh: {ex.comment}
                        </p>
                      </div>

                      <div className="text-left sm:text-right shrink-0">
                        <div className="text-base font-black text-amber-600 dark:text-amber-400">
                          {ex.score}
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          {ex.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: TARIX (HISTORY) */}
          {activeTab === "history" && (
            <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <History size={18} className="text-indigo-600" />
                O'quvchi Faoliyati va Tizim Tarixi
              </h3>

              <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800 pl-8">
                <div className="relative">
                  <span className="absolute -left-8 top-1 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-slate-850" />
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Tizimga qo'shildi</div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {currentStudent.createdAt ? formatDate(currentStudent.createdAt.slice(0, 10)) : "Yaqinda"}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    O'quvchi ro'yxatga olindi va shaxsiy kartoshkasi ochildi
                  </p>
                </div>

                {assignedGroups.map((g) => (
                  <div key={g.id} className="relative">
                    <span className="absolute -left-8 top-1 w-3 h-3 rounded-full bg-violet-500 ring-4 ring-white dark:ring-slate-850" />
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      Guruhga biriktirildi: {g.name}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">Faol</div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      Dars vaqti: {g.time || "Belgilangan vaqtda"}
                    </p>
                  </div>
                ))}

                {studentPayments.slice(0, 3).map((p) => (
                  <div key={p.id} className="relative">
                    <span className="absolute -left-8 top-1 w-3 h-3 rounded-full bg-amber-500 ring-4 ring-white dark:ring-slate-850" />
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      To'lov amalga oshirildi (+{money(p.amount)} so'm)
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {formatDate(p.date || p.createdAt?.slice(0, 10))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: XARIDLAR (PURCHASES) */}
          {activeTab === "purchases" && (
            <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <ShoppingBag size={18} className="text-emerald-600" />
                Coin Do'konidan Xaridlar Tarixi ({purchaseRecords.length} ta)
              </h3>

              {purchaseRecords.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-slate-400 text-xs">
                  Hali coin do'konidan xaridlar qilinmagan
                </div>
              ) : (
                <div className="space-y-3">
                  {purchaseRecords.map((pur) => (
                    <div
                      key={pur.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-800/50 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-900 dark:text-white">{pur.item}</div>
                        <div className="text-slate-400">Sana: {formatDate(pur.date)}</div>
                      </div>
                      <div className="text-right font-black text-amber-600 dark:text-amber-400">
                        -{pur.coins} Coin
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 8: SMS */}
          {activeTab === "sms" && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Send size={18} className="text-violet-600" />
                  O'quvchiga To'g'ridan-to'g'ri SMS Xabar Yuborish
                </h3>

                <form onSubmit={handleSendSms} className="space-y-3">
                  <div>
                    <label className={LABEL_CLS}>Telefon raqami</label>
                    <input
                      type="text"
                      disabled
                      value={displayPhone(currentStudent.phone)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-bold text-xs"
                    />
                  </div>

                  <div>
                    <label className={LABEL_CLS}>SMS Matni</label>
                    <textarea
                      rows={3}
                      value={smsText}
                      onChange={(e) => setSmsText(e.target.value)}
                      placeholder="Xabar matnini kiriting..."
                      className={INPUT_CLS}
                      required
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
                    >
                      <Send size={13} />
                      <span>SMS Yuborish</span>
                    </button>
                  </div>
                </form>
              </div>

              <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-3">
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Yuborilgan SMSlar tarixi ({sentSmsLogs.length})
                </h4>
                {sentSmsLogs.map((log) => (
                  <div key={log.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/70 text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-400 text-[10px]">
                      <span>{log.date}</span>
                      <span className="font-bold text-emerald-600">{log.status}</span>
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 font-medium">{log.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 9: COIN XISOBOTI */}
          {activeTab === "coins" && (
            <div className="space-y-6">
              {/* Coins Report Banner */}
              <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 rounded-2xl p-6 md:p-8 text-white shadow-lg shadow-amber-500/20 flex items-center justify-between flex-wrap gap-6">
                <div className="space-y-1.5">
                  <div className="text-xs font-bold uppercase tracking-widest text-amber-100">
                    Cosmos Coin Balansi
                  </div>
                  <div className="text-4xl md:text-5xl font-black flex items-center gap-2">
                    <span>🪙 {(currentStudent.coins || 0).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-amber-100 pt-1 font-medium">
                    O'quvchining joriy coinlari
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md items-center justify-center text-3xl shrink-0">
                    🏆
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowGiveCoinModal(true)}
                    className="px-6 py-3 bg-white text-amber-600 hover:bg-amber-50 rounded-xl text-sm font-bold shadow-sm transition-colors"
                  >
                    Coin berish / ayirish
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white p-5 border-b border-slate-100 dark:border-slate-800">
                  Coinlar Hisoboti & Tarixi
                </h3>
                {studentCoinHistory.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-sm">
                    Hozircha coinlar tarixi yo'q.
                  </div>
                ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 text-xs font-semibold">
                          <tr>
                            <th className="py-3 px-4">Bo'lim turi</th>
                            <th className="py-3 px-4">Sabab</th>
                            <th className="py-3 px-4">Soni</th>
                            <th className="py-3 px-4 text-right">Yaratilgan vaqti</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {studentCoinHistory.map((h) => (
                            <tr key={h.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                              <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                                {h.section || "Darsdagi faollik"}
                              </td>
                              <td className="py-3 px-4 text-slate-600 dark:text-slate-300 text-xs">
                                {h.reason || "Coin amali"}
                              </td>
                              <td className="py-3 px-4 font-mono font-bold">
                                <span className={h.type === "add" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                                  {h.type === "add" ? "+" : "-"}{h.amount} Coin
                                </span>
                              </td>
                              <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-right font-mono text-xs">
                                {formatDate(h.createdAt)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* TAB 10: EDIT PROFILE / TAHRIRLASH */}
          {activeTab === "edit" && (
            <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <Edit3 size={18} className="text-violet-600" />
                    O'quvchi ma'lumotlarini to'liq tahrirlash
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    O'quvchi shaxsiy, aloqa va o'quv ma'lumotlarini yangilang
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className={LABEL_CLS}>
                      Ism va Familiya <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Masalan: Sardor Aliyev"
                      className={INPUT_CLS}
                      required
                    />
                  </div>

                  {/* Phone 1 */}
                  <div>
                    <label className={LABEL_CLS}>
                      Asosiy telefon raqami (O'quvchi) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="901234567"
                      className={INPUT_CLS}
                      required
                    />
                  </div>

                  {/* Parent Phone */}
                  <div>
                    <label className={LABEL_CLS}>
                      2-telefon raqami (Ota-onasi)
                    </label>
                    <input
                      type="text"
                      value={formData.parentPhone}
                      onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                      placeholder="998887766"
                      className={INPUT_CLS}
                    />
                  </div>

                  {/* Parent Name */}
                  <div>
                    <label className={LABEL_CLS}>Ota-onasi ismi</label>
                    <input
                      type="text"
                      value={formData.parentName}
                      onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                      placeholder="Masalan: Akmal aka"
                      className={INPUT_CLS}
                    />
                  </div>

                  {/* Grade */}
                  <div>
                    <label className={LABEL_CLS}>Sinfi / Bosqichi</label>
                    <select
                      value={formData.grade}
                      onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                      className={INPUT_CLS}
                    >
                      <option value="">-- Sinfni tanlang --</option>
                      {GRADE_OPTIONS.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* School */}
                  <div>
                    <label className={LABEL_CLS}>Maktab / Litsey / Universitet</label>
                    <input
                      type="text"
                      value={formData.school}
                      onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                      placeholder="Masalan: 45-maktab"
                      className={INPUT_CLS}
                    />
                  </div>

                  {/* Birth Date */}
                  <div>
                    <label className={LABEL_CLS}>Tug'ilgan sana</label>
                    <input
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                      className={INPUT_CLS}
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className={LABEL_CLS}>Jinsi</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className={INPUT_CLS}
                    >
                      <option value="male">Erkak / O'g'il bola</option>
                      <option value="female">Ayol / Qiz bola</option>
                    </select>
                  </div>

                  {/* Address */}
                  <div>
                    <label className={LABEL_CLS}>Yashash manzili</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Tuman, mahalla, ko'cha"
                      className={INPUT_CLS}
                    />
                  </div>

                  {/* Source */}
                  <div>
                    <label className={LABEL_CLS}>Qayerdan kelgan (Manba)</label>
                    <input
                      type="text"
                      value={formData.source}
                      onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                      placeholder="Instagram, Telegram, Tanish..."
                      className={INPUT_CLS}
                    />
                  </div>

                  {/* Target course */}
                  <div>
                    <label className={LABEL_CLS}>Qaysi kursga kelayotgani</label>
                    <input
                      type="text"
                      value={formData.targetCourse}
                      onChange={(e) => setFormData({ ...formData, targetCourse: e.target.value })}
                      placeholder="Masalan: IELTS / IT / Frontend"
                      className={INPUT_CLS}
                    />
                  </div>

                  {/* Branch */}
                  <div>
                    <label className={LABEL_CLS}>Qayerga murojaat qilgani (Filial)</label>
                    <input
                      type="text"
                      value={formData.branch}
                      onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                      placeholder="Masalan: Asosiy filial"
                      className={INPUT_CLS}
                    />
                  </div>
                </div>

                {/* Note */}
                <div>
                  <label className={LABEL_CLS}>Umumiy eslatma / izoh</label>
                  <textarea
                    rows={2}
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    className={INPUT_CLS}
                    placeholder="Qo'shimcha eslatmalar..."
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setActiveTab("groups");
                    }}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold shadow-md shadow-violet-600/20 transition-all cursor-pointer"
                  >
                    <Save size={14} />
                    <span>O'zgarishlarni saqlash</span>
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>

      {/* Group Activation Modal */}
      {activateModalData && (
        <ActivateGroupModal
          isOpen={Boolean(activateModalData)}
          onClose={() => setActivateModalData(null)}
          group={activateModalData.group}
          membership={activateModalData.membership}
          fullPrice={activateModalData.fullPrice}
          student={student}
          month={month}
          onSave={handleActivateGroupSave}
        />
      )}

      {/* Group Transfer Modal */}
      {transferModalData && (
        <TransferGroupModal
          isOpen={Boolean(transferModalData)}
          onClose={() => setTransferModalData(null)}
          currentGroup={transferModalData}
          allGroups={allGroups}
          courses={courses}
          teachers={teachers}
          assignedGroupIds={(currentStudent?.groupIds || []).map(String)}
          onSave={handleTransferGroupSave}
        />
      )}

      {/* Attendance & Grades Modal */}
      {attendanceModalGroup && (
        <AttendanceGradesModal
          isOpen={Boolean(attendanceModalGroup)}
          onClose={() => setAttendanceModalGroup(null)}
          group={attendanceModalGroup}
          student={currentStudent}
          allAttendance={allAttendance}
          teachers={teachers}
          courses={courses}
        />
      )}

      {/* Add Group Modal (Tepadan tushadigan modal, guruh qidirish va ro'yxat) */}
      {isAddGroupModalOpen && (
        <Modal
          isOpen={isAddGroupModalOpen}
          position="top"
          onClose={() => {
            setIsAddGroupModalOpen(false);
            setGroupToAssign("");
          }}
          title="Guruhga qo'shish"
          wide={true}
        >
          <div className="space-y-4">
            <div>
              <label className={LABEL_CLS}>Guruhni qidirish va tanlash</label>
              <SearchableGroupSelect
                groups={allGroups.filter((g) => !(currentStudent.groupIds || []).some((id) => String(id) === String(g.id)))}
                courses={courses}
                teachers={teachers}
                students={opData?.students || []}
                value={groupToAssign}
                onChange={(gid) => setGroupToAssign(gid)}
                placeholder="Guruh nomi, kurs yoki o'qituvchini qidiring..."
              />
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-300">
              ℹ️ O'quvchi guruhga biriktirilganda dastlab <strong>Sinov darsida</strong> holatida bo'ladi va to'lov talab etilmaydi. Guruhda faollashtirilgan kundan boshlab to'lov hisoblanadi.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setIsAddGroupModalOpen(false);
                  setGroupToAssign("");
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                disabled={!groupToAssign}
                onClick={async () => {
                  await handleQuickAssignGroup(groupToAssign);
                  setIsAddGroupModalOpen(false);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                Guruhga qo'shish
              </button>
            </div>
          </div>
        </Modal>
      )}

      {confirmModalState && (
        <ConfirmModal
          title={confirmModalState.title || "Tasdiqlash"}
          message={confirmModalState.message}
          confirmText={confirmModalState.confirmText || "Ha, tasdiqlash"}
          cancelText={confirmModalState.cancelText || "Bekor qilish"}
          danger={confirmModalState.danger !== false}
          onConfirm={async () => {
            const fn = confirmModalState.onConfirm;
            setConfirmModalState(null);
            if (fn) await fn();
          }}
          onCancel={() => setConfirmModalState(null)}
        />
      )}

      {showRefundModal && (
        <RefundPaymentModal
          student={currentStudent}
          studentId={currentStudent?.id}
          groups={allGroups}
          currentBalance={tableBalance !== undefined ? tableBalance : Number(currentStudent?.balance || 0)}
          onSubmit={async (payload) => {
            await api.recordPayment(payload);
            const curBal = tableBalance !== undefined ? tableBalance : Number(currentStudent?.balance || 0);
            const newBal = curBal - Math.abs(payload.amount);
            setLocalStudent((prev) => ({ ...prev, balance: newBal }));
            await api.updateStudent(currentStudent.id, { balance: newBal });
            if (onUpdateStudent) {
              onUpdateStudent(currentStudent.id, { balance: newBal });
            }
            if (onRecordPayment) {
              onRecordPayment(payload);
            }
            setSaveSuccessMsg("To'lov muvaffaqiyatli qaytarildi (Refund)!");
            setTimeout(() => setSaveSuccessMsg(""), 3000);
          }}
          onClose={() => setShowRefundModal(false)}
        />
      )}

      {showUnenrollAllModal && (
        <UnenrollAllGroupsModal
          isOpen={showUnenrollAllModal}
          onClose={() => setShowUnenrollAllModal(false)}
          student={currentStudent}
          assignedGroups={assignedGroups}
          directorData={directorData}
          opData={opData}
          onSuccess={async ({ paymentPayloads, updatedStudentData }) => {
            setLocalStudent((prev) => ({ ...prev, ...updatedStudentData }));
            if (onUpdateStudent) {
              await onUpdateStudent(currentStudent.id, updatedStudentData);
            }
            if (onRecordPayment && paymentPayloads) {
              paymentPayloads.forEach((p) => onRecordPayment(p));
            }
            setSaveSuccessMsg("O'quvchi barcha guruhlardan chiqarildi va to'lovlar tarixiga saqlandi!");
            setTimeout(() => setSaveSuccessMsg(""), 3000);
          }}
        />
      )}

      {unenrollGroupModalData && (
        <UnenrollGroupModal
          isOpen={Boolean(unenrollGroupModalData)}
          onClose={() => setUnenrollGroupModalData(null)}
          student={currentStudent}
          group={unenrollGroupModalData}
          directorData={directorData}
          opData={opData}
          onSuccess={async ({ paymentPayload, updatedStudentData }) => {
            setLocalStudent((prev) => ({ ...prev, ...updatedStudentData }));
            if (onRemoveFromGroup) {
              onRemoveFromGroup(currentStudent.id, unenrollGroupModalData.id);
            }
            if (onUpdateStudent) {
              await onUpdateStudent(currentStudent.id, updatedStudentData);
            }
            if (onRecordPayment && paymentPayload) {
              onRecordPayment(paymentPayload);
            }
            setSaveSuccessMsg("O'quvchi guruhdan chiqarildi va to'lovlar tarixiga saqlandi!");
            setTimeout(() => setSaveSuccessMsg(""), 3000);
          }}
        />
      )}

      {paymentModalData && (
        <RecordPaymentModal
          student={paymentModalData.student || currentStudent}
          preselectedGroup={paymentModalData.group}
          group={paymentModalData.group}
          initialAmount={paymentModalData.amount}
          initialMonth={paymentModalData.month}
          scopeBranches={directorData?.branches || []}
          directorData={directorData}
          opData={opData}
          students={opData?.students || directorData?.students || []}
          groups={opData?.groups || directorData?.groups || []}
          paymentMethods={directorData?.paymentTypes || []}
          onSubmit={async (payload) => {
            await api.recordPayment(payload);
            setPaymentModalData(null);
            setSaveSuccessMsg("To'lov muvaffaqiyatli saqlandi!");
            setTimeout(() => setSaveSuccessMsg(""), 3000);
            if (onRecordPayment) onRecordPayment(payload);
          }}
          onClose={() => setPaymentModalData(null)}
        />
      )}

      {showGiveCoinModal && (
        <Modal
          isOpen={showGiveCoinModal}
          onClose={() => setShowGiveCoinModal(false)}
          title="Coin berish / ayirish"
          position="center"
        >
          <form onSubmit={handleCoinSubmit} className="space-y-4 p-1 flex-1">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCoinActionType("add")}
                className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  coinActionType === "add"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-400"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                }`}
              >
                + Qo'shish
              </button>
              <button
                type="button"
                onClick={() => setCoinActionType("deduct")}
                className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  coinActionType === "deduct"
                    ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-400"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                }`}
              >
                - Ayirish
              </button>
            </div>

            <div>
              <label className={LABEL_CLS}>Bo'lim turi</label>
              <select
                value={coinSection}
                onChange={(e) => setCoinSection(e.target.value)}
                className={INPUT_CLS}
              >
                <option value="Darsdagi faollik">Darsdagi faollik</option>
                <option value="Uyga vazifa">Uyga vazifa</option>
                <option value="Musobaqa">Musobaqa</option>
                <option value="Intizom">Intizom</option>
                <option value="Boshqa">Boshqa</option>
              </select>
            </div>

            <div>
              <label className={LABEL_CLS}>Coin miqdori</label>
              <input
                type="number"
                min="1"
                max="1000"
                value={coinAmount}
                onChange={(e) => setCoinAmount(Number(e.target.value))}
                className={INPUT_CLS}
                required
              />
            </div>

            <div>
              <label className={LABEL_CLS}>Sabab</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {[
                  "Darsdagi a'lo faollik",
                  "Uyga vazifa 100%",
                  "Musobaqa g'olibi",
                  "Intizom va odob",
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setCoinReason(preset)}
                    className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-[10px] font-semibold transition-colors cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={coinReason}
                onChange={(e) => setCoinReason(e.target.value)}
                placeholder="Sababni yozing..."
                className={INPUT_CLS}
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowGiveCoinModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                className={`px-4 py-2 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs ${
                  coinActionType === "add" ? "bg-amber-500 hover:bg-amber-600" : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                {coinActionType === "add" ? "Saqlash" : "Ayirish"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {showEditBalanceModal && (
        <Modal
          isOpen={showEditBalanceModal}
          onClose={() => setShowEditBalanceModal(false)}
          title="Balansni tahrirlash"
          position="center"
        >
          <div className="space-y-4 p-1">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Joriy balans:</span>
              <span className={`font-bold font-mono ${(tableBalance !== undefined ? tableBalance : Number(currentStudent?.balance || 0)) >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                {money(tableBalance !== undefined ? tableBalance : Number(currentStudent?.balance || 0))} so'm
              </span>
            </div>

            <div>
              <label className={LABEL_CLS}>Yangi balans summasi (so'm)</label>
              <input
                type="number"
                value={newBalanceInput}
                onChange={(e) => setNewBalanceInput(e.target.value)}
                placeholder="0"
                className={INPUT_CLS}
                autoFocus
              />
            </div>

            <div>
              <label className={LABEL_CLS}>Izoh</label>
              <input
                type="text"
                value={balanceComment}
                onChange={(e) => setBalanceComment(e.target.value)}
                placeholder="Balans to'g'rilash sababi"
                className={INPUT_CLS}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowEditBalanceModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={async () => {
                  const newBal = Number(newBalanceInput) || 0;
                  setLocalStudent((prev) => ({ ...prev, balance: newBal }));
                  await api.updateStudent(currentStudent.id, { balance: newBal });
                  await onUpdateStudent?.(currentStudent.id, { balance: newBal });
                  setShowEditBalanceModal(false);
                  setSaveSuccessMsg("Balans muvaffaqiyatli yangilandi!");
                  setTimeout(() => setSaveSuccessMsg(""), 3000);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                Saqlash
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showAddDiscountModal && (
        <AddDiscountModal
          isOpen={showAddDiscountModal}
          onClose={() => setShowAddDiscountModal(false)}
          student={currentStudent}
          assignedGroups={allGroups}
          editingDiscount={editingDiscount}
          onSave={handleSaveDiscountItem}
        />
      )}

      {showTransferBranchModal && (
        <Modal
          isOpen={showTransferBranchModal}
          onClose={() => setShowTransferBranchModal(false)}
          title="Boshqa filialga o'tkazish"
        >
          <div className="space-y-4 p-1">
            {/* 1. Filial dropdown */}
            <div>
              <label className={LABEL_CLS}>Yangi filialni tanlang</label>
              <select
                value={targetBranchId}
                onChange={(e) => {
                  setTargetBranchId(e.target.value);
                  setTargetGroupId("");
                }}
                className={INPUT_CLS}
              >
                <option value="">Filialni tanlang</option>
                {(directorData?.branches || []).map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Guruh dropdown */}
            {targetBranchId && (
              <div>
                <label className={LABEL_CLS}>Guruhni tanlang</label>
                <select
                  value={targetGroupId}
                  onChange={(e) => setTargetGroupId(e.target.value)}
                  className={INPUT_CLS}
                >
                  <option value="">Guruhsiz o'tkazish</option>
                  {allGroups
                    .filter(
                      (g) =>
                        String(g.branchId) === String(targetBranchId) &&
                        !(currentStudent.groupIds || []).some(
                          (id) => String(id) === String(g.id)
                        )
                    )
                    .map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} {g.course ? `(${g.course})` : ""} — {money(g.price || 0)} so'm
                      </option>
                    ))}
                </select>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowTransferBranchModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                disabled={!targetBranchId}
                onClick={async () => {
                  const targetG = targetGroupId ? allGroups.find((g) => String(g.id) === String(targetGroupId)) : null;
                  const newGids = targetG
                    ? Array.from(new Set([...(currentStudent.groupIds || []).map(String), String(targetG.id)]))
                    : currentStudent.groupIds || [];
                  
                  const newMemberships = { ...(currentStudent.groupMemberships || {}) };
                  if (targetG) {
                    newMemberships[String(targetG.id)] = {
                      status: "trial",
                      joinedAt: new Date().toISOString(),
                      enrolledAt: new Date().toISOString(),
                      agreedPrice: targetG.price || 0,
                    };
                  }

                  const updatePayload = {
                    branchId: targetBranchId,
                    groupIds: newGids,
                    groupMemberships: newMemberships,
                  };

                  setLocalStudent((prev) => ({ ...prev, ...updatePayload }));
                  await api.updateStudent(currentStudent.id, updatePayload);
                  await onUpdateStudent?.(currentStudent.id, updatePayload);
                  setShowTransferBranchModal(false);
                  setSaveSuccessMsg("O'quvchi boshqa filialga muvaffaqiyatli o'tkazildi!");
                  setTimeout(() => setSaveSuccessMsg(""), 3000);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                O'tkazish
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// Sub-component: ActivateGroupModal
function ActivateGroupModal({
  isOpen,
  onClose,
  group,
  membership,
  fullPrice,
  student,
  month,
  onSave,
}) {
  const [status, setStatus] = useState(
    membership?.status === "paused" ? "paused" : "active"
  );
  const [activationDate, setActivationDate] = useState(
    membership?.activationDate || new Date().toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState(membership?.notes || "");

  useEffect(() => {
    if (isOpen) {
      const initStatus = membership?.status === "paused" ? "paused" : "active";
      setStatus(initStatus);
      setActivationDate(
        membership?.activationDate || new Date().toISOString().slice(0, 10)
      );
      setNotes(membership?.notes || "");
    }
  }, [isOpen, membership]);

  if (!isOpen || !group) return null;

  const allLessonDates = getMonthLessonDates(month, group?.days || ["Dush", "Chor", "Juma"]);
  const totalLessons = allLessonDates.length || 12;
  const price = Number(fullPrice) || 0;
  const pricePerLesson = totalLessons > 0 ? Math.round(price / totalLessons) : 0;

  const missedLessons = status === "active" ? allLessonDates.filter((d) => d < activationDate).length : 0;
  const attendedLessons = status === "active" ? Math.max(0, totalLessons - missedLessons) : 0;
  const calculatedFee = status === "active" ? (missedLessons > 0 ? Math.round(pricePerLesson * attendedLessons) : price) : 0;

  const handleQuickDate = (dateVal) => {
    setActivationDate(dateVal);
    setStatus("active");
  };

  const todayStr = new Date().toISOString().slice(0, 10);
  const firstLesson = allLessonDates[0] || todayStr;
  const nextLesson = allLessonDates.find((d) => d >= todayStr) || todayStr;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Guruhda faollashtirish"
      description={`${group.name} · ${student?.name}`}
    >
      <div className="p-5 space-y-4 text-xs flex-1">
        {/* Status Selection */}
        <div className="space-y-1.5">
          <label className="font-bold text-slate-800 dark:text-slate-200 text-xs block">
            Guruhdagi holati
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setStatus("active")}
              className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                status === "active"
                  ? "bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-950/50 dark:border-emerald-500 dark:text-emerald-300 ring-2 ring-emerald-500/20"
                  : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
              }`}
            >
              <CheckCircle2 size={15} className="text-emerald-500" />
              <span>Faol</span>
            </button>
            <button
              type="button"
              onClick={() => setStatus("trial")}
              className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                status === "trial"
                  ? "bg-amber-50 border-amber-500 text-amber-700 dark:bg-amber-950/50 dark:border-amber-500 dark:text-amber-300 ring-2 ring-amber-500/20"
                  : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
              }`}
            >
              <Sparkles size={15} className="text-amber-500" />
              <span>Sinovda</span>
            </button>
            <button
              type="button"
              onClick={() => setStatus("paused")}
              className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                status === "paused"
                  ? "bg-sky-50 border-sky-500 text-sky-700 dark:bg-sky-950/50 dark:border-sky-500 dark:text-sky-300 ring-2 ring-sky-500/20"
                  : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
              }`}
            >
              <Clock size={15} className="text-sky-500" />
              <span>Muzlatilgan</span>
            </button>
          </div>
        </div>

        {status === "active" && (
          <>
            {/* Activation Date picker */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                  Faollashtirish sanasi
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickDate(firstLesson)}
                    className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-violet-100 hover:text-violet-700 dark:hover:bg-violet-950 dark:hover:text-violet-300 cursor-pointer"
                  >
                    Oy boshi
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDate(todayStr)}
                    className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-violet-100 hover:text-violet-700 dark:hover:bg-violet-950 dark:hover:text-violet-300 cursor-pointer"
                  >
                    Bugun
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDate(nextLesson)}
                    className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-violet-100 hover:text-violet-700 dark:hover:bg-violet-950 dark:hover:text-violet-300 cursor-pointer"
                  >
                    Keyingi dars
                  </button>
                </div>
              </div>
              <input
                type="date"
                value={activationDate}
                onChange={(e) => setActivationDate(e.target.value)}
                className={INPUT_CLS}
              />
            </div>

            {/* Lesson breakdown in current month */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                  Oydagi darslar taqvimi
                </span>
                <span className="text-slate-500 dark:text-slate-400 font-semibold text-xs">
                  Jami {totalLessons} ta dars · {attendedLessons} ta hisoblanadi
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-700">
                {allLessonDates.map((dateStr, idx) => {
                  const isBefore = dateStr < activationDate;
                  return (
                    <div
                      key={dateStr}
                      className={`p-2 rounded-lg text-[11px] flex items-center justify-between border transition-all ${
                        isBefore
                          ? "bg-slate-100/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-400 line-through"
                          : "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 font-semibold"
                      }`}
                    >
                      <span>
                        #{idx + 1} {dateStr.slice(5)}
                      </span>
                      <span className="text-[10px] font-bold">
                        {isBefore ? "0 so'm" : `${money(pricePerLesson)}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Real-time Calculation Summary Block */}
            <div className="p-3.5 bg-violet-50/70 dark:bg-violet-950/30 rounded-xl border border-violet-200 dark:border-violet-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                <span>Guruh narxi</span>
                <span className="font-bold text-slate-900 dark:text-white">{money(price)} so'm</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                <span>1 ta dars qiymati</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{money(pricePerLesson)} so'm</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                <span>O'tgan darslar</span>
                <span className="font-medium text-slate-500 line-through">{missedLessons} ta dars (0 so'm)</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                <span>Hisoblanadigan darslar</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{attendedLessons} ta dars</span>
              </div>
              <div className="h-px bg-violet-200 dark:bg-violet-800 my-1" />
              <div className="flex items-center justify-between text-sm">
                <span className="font-extrabold text-violet-950 dark:text-violet-200">
                  Hisoblangan to'lov
                </span>
                <span className="font-black text-violet-700 dark:text-violet-300 text-base">
                  {money(calculatedFee)} so'm
                </span>
              </div>
            </div>
          </>
        )}

        {status === "trial" && (
          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <Sparkles size={15} className="text-amber-500" />
              Sinov darsi holati
            </span>
            <span className="font-bold text-amber-900 dark:text-amber-100">0 so'm (To'lovsiz)</span>
          </div>
        )}

        {status === "paused" && (
          <div className="p-3.5 bg-sky-50 dark:bg-sky-950/40 rounded-xl border border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-200 flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <Clock size={15} className="text-sky-500" />
              Guruh muzlatilgan
            </span>
            <span className="font-bold text-sky-900 dark:text-sky-100">0 so'm</span>
          </div>
        )}

        {/* Notes */}
        <div className="space-y-1">
          <label className="font-semibold text-slate-700 dark:text-slate-300 text-xs block">
            Izoh
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Izoh yozing..."
            className={INPUT_CLS}
          />
        </div>

        <div className="pt-4 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Bekor qilish
          </button>
          <button
            type="button"
            onClick={() =>
              onSave({
                groupId: group.id,
                status,
                activationDate: status === "active" ? activationDate : null,
                notes,
              })
            }
            className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold shadow-md shadow-violet-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Save size={14} />
            <span>Saqlash</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}

// Sub-component: TransferGroupModal
function TransferGroupModal({
  isOpen,
  onClose,
  currentGroup,
  allGroups,
  courses,
  teachers,
  assignedGroupIds,
  onSave,
}) {
  const [targetGroupId, setTargetGroupId] = useState("");
  const [status, setStatus] = useState("trial");
  const [activationDate, setActivationDate] = useState(new Date().toISOString().slice(0, 10));

  if (!isOpen || !currentGroup) return null;

  const availableGroups = allGroups.filter(
    (g) => !assignedGroupIds.includes(String(g.id))
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Boshqa guruhga o'tkazish"
      description={`Joriy guruh: ${currentGroup.name}`}
    >
      <div className="p-5 space-y-4 text-xs flex-1">
        <div className="space-y-3.5">
          <div>
            <label className="font-extrabold text-slate-900 dark:text-white block mb-1">
              O'tkaziladigan yangi guruhni tanlang:
            </label>
            <select
              value={targetGroupId}
              onChange={(e) => setTargetGroupId(e.target.value)}
              className={INPUT_CLS}
            >
              <option value="">-- Yangi guruhni tanlang --</option>
              {availableGroups.map((g) => {
                const crs = courses.find((c) => c.id === g.courseId);
                return (
                  <option key={g.id} value={g.id}>
                    {g.name} {crs ? `(${crs.title || crs.name})` : ""} · {g.days ? (Array.isArray(g.days) ? g.days.join(",") : g.days) : ""} {g.time || ""}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="font-extrabold text-slate-900 dark:text-white block mb-1">
              Yangi guruhdagi holati:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatus("trial")}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  status === "trial"
                    ? "bg-amber-50 border-amber-500 text-amber-700 dark:bg-amber-950/50 dark:border-amber-500 dark:text-amber-300 ring-2 ring-amber-500/20"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                }`}
              >
                <Sparkles size={14} className="text-amber-500" />
                <span>Sinovda (0 so'm)</span>
              </button>
              <button
                type="button"
                onClick={() => setStatus("active")}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  status === "active"
                    ? "bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-950/50 dark:border-emerald-500 dark:text-emerald-300 ring-2 ring-emerald-500/20"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                }`}
              >
                <CheckCircle2 size={14} className="text-emerald-500" />
                <span>Faol (Hisoblansin)</span>
              </button>
            </div>
          </div>

          {status === "active" && (
            <div>
              <label className="font-extrabold text-slate-900 dark:text-white block mb-1">
                Yangi guruhda faollashtirish sanasi:
              </label>
              <input
                type="date"
                value={activationDate}
                onChange={(e) => setActivationDate(e.target.value)}
                className={INPUT_CLS}
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            Bekor qilish
          </button>
          <button
            type="button"
            disabled={!targetGroupId}
            onClick={() =>
              onSave({
                fromGroupId: currentGroup.id,
                toGroupId: targetGroupId,
                status,
                activationDate: status === "active" ? activationDate : null,
              })
            }
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeftRight size={14} />
            <span>Guruhni o'tkazish</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}

// Sub-component: AttendanceGradesModal
function AttendanceGradesModal({
  isOpen,
  onClose,
  group,
  student,
  allAttendance = [],
  teachers = [],
  courses = [],
}) {
  if (!isOpen || !group) return null;

  const crs = courses.find((c) => c.id === group.courseId);
  const tch = teachers.find((t) => String(t.id) === String(group.teacherHrId || group.teacherId));

  // Filter attendance records for this group & student
  const groupAttendance = (allAttendance || [])
    .filter((rec) => String(rec.groupId) === String(group.id))
    .map((rec) => {
      const entry = (rec.entries || []).find((e) => String(e.studentId) === String(student?.id));
      return {
        date: rec.date,
        status: entry ? entry.status : "present",
        score: entry?.score,
        note: entry?.note || "",
      };
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const totalLessons = groupAttendance.length;
  const presentCount = groupAttendance.filter((r) => r.status === "present").length;
  const lateCount = groupAttendance.filter((r) => r.status === "late").length;
  const absentCount = groupAttendance.filter((r) => r.status === "absent").length;
  const excusedCount = groupAttendance.filter((r) => r.status === "excused").length;
  const rate = totalLessons > 0 ? Math.round(((presentCount + lateCount * 0.5) / totalLessons) * 100) : 100;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Davomat va Baholar — ${group.name}`}
      subtitle={`${student?.name} (${crs?.title || crs?.name || group.name})`}
    >
      <div className="space-y-4">
        {/* Header Summary */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <div className="font-bold text-slate-900 dark:text-white text-sm">{group.name}</div>
            <div className="text-slate-500 dark:text-slate-400 mt-0.5">
              O'qituvchi: <span className="text-sky-500 font-semibold">{tch ? tch.name : "Tayinlanmagan"}</span> • Vaqt: {group.time || "13:30 - 15:30"}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold text-center">
              Davomat: {rate}%
            </div>
            <div className="px-3 py-1 rounded-lg bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 border border-violet-200 dark:border-violet-800 font-bold text-center">
              Jami: {totalLessons} dars
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800/60">
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Qatnashgan</div>
            <div className="text-base font-black text-emerald-700 dark:text-emerald-300">{presentCount}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-800/60">
            <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">Kech qolgan</div>
            <div className="text-base font-black text-amber-700 dark:text-amber-300">{lateCount}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-rose-50/70 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-800/60">
            <div className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold">Qoldirgan</div>
            <div className="text-base font-black text-rose-700 dark:text-rose-300">{absentCount}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-sky-50/70 border border-sky-200 dark:bg-sky-950/40 dark:border-sky-800/60">
            <div className="text-[11px] text-sky-600 dark:text-sky-400 font-semibold">Sababli</div>
            <div className="text-base font-black text-sky-700 dark:text-sky-300">{excusedCount}</div>
          </div>
        </div>

        {/* Lesson History Table */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Darslar jurnali va baholar:</div>
          {groupAttendance.length === 0 ? (
            <div className="p-6 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-slate-400 text-xs">
              Ushbu guruh uchun hali davomat kiritilmagan
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
              {groupAttendance.map((rec, i) => (
                <div key={i} className="p-2.5 flex items-center justify-between gap-3 text-xs hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-600 dark:text-slate-400 font-semibold">{formatShortDate(rec.date)}</span>
                    {rec.note && <span className="text-slate-400 text-[11px]">({rec.note})</span>}
                  </div>
                  <div className="flex items-center gap-2.5">
                    {rec.score !== undefined && rec.score !== null && (
                      <span className="font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200">
                        Baho: {rec.score}
                      </span>
                    )}
                    {rec.status === "present" && (
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold text-[11px]">Kelgan</span>
                    )}
                    {rec.status === "absent" && (
                      <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-bold text-[11px]">Qatnashmadi</span>
                    )}
                    {rec.status === "late" && (
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 font-bold text-[11px]">Kech qoldi</span>
                    )}
                    {rec.status === "excused" && (
                      <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-700 font-bold text-[11px]">Sababli</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Yopish
          </button>
        </div>
      </div>
    </Modal>
  );
}

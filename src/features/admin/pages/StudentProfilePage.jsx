import { useState, useMemo, useRef, useEffect } from "react";
import {
  ArrowLeft,
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
} from "lucide-react";
import {
  INPUT_CLS,
  LABEL_CLS,
} from "../theme/tokens";
import { calculateProratedFee } from "../../../shared/utils/prorata";
import {
  displayPhone,
  formatDate,
  money,
  thisMonthKey,
} from "../utils/helpers";
import { opGroups } from "../utils/dataHelpers";
import { SearchableGroupSelect } from "../../../shared/components/SearchableGroupSelect";

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
}) {
  // Top menu tabs: guruhlar, tolovlar, eslatma, chegirma, imtihonlar, tarix, xaridlar, sms, coins, edit
  const [activeTab, setActiveTab] = useState("groups");
  const [isEditing, setIsEditing] = useState(false);
  const [showMoreInfo, setShowMoreInfo] = useState(false); // Collapsible for extra details in Left Block
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Edit form state
  const [formData, setFormData] = useState({
    name: student?.name || "",
    phone: student?.phone || "",
    parentPhone: student?.parentPhone || student?.phone2 || "",
    parentName: student?.parentName || "",
    grade: student?.grade || "",
    school: student?.school || "",
    birthDate: student?.birthDate || "",
    gender: student?.gender || "male",
    address: student?.address || "",
    source: student?.source || "Tanish / Tavsiya",
    targetCourse: student?.targetCourse || student?.interestedCourse || "",
    branch: student?.branch || "Asosiy filial",
    status: student?.status || "active",
    balance: student?.balance || 0,
    coins: student?.coins || 0,
    note: student?.note || "",
  });

  // Discount form state
  const [discountVal, setDiscountVal] = useState(student?.discount || 0);
  const [discountType, setDiscountType] = useState(student?.discountType || "percent");
  const [discountReason, setDiscountReason] = useState(student?.discountReason || "Oila a'zolari chegirmasi");

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
  const [coinActionType, setCoinActionType] = useState("add"); // add | deduct

  // Group quick assign state
  const [groupToAssign, setGroupToAssign] = useState("");

  // Actions dropdown menu state & ref
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const actionsMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(e.target)) {
        setShowActionsMenu(false);
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
    const ids = (student?.groupIds || []).map(String);
    return allGroups.filter((g) => ids.includes(String(g.id)));
  }, [allGroups, student?.groupIds]);

  // Debt calculation per group with Pro-rata support for mid-month joiners
  const groupDebts = useMemo(() => {
    return assignedGroups.map((g) => {
      let fullPrice = Number(g.price || 0);
      if (student?.discount) {
        if (student.discountType === "percent" || student.discountType === "%" || student.discountType === "foiz") {
          fullPrice = Math.round(fullPrice * (1 - Number(student.discount) / 100));
        } else {
          fullPrice = Math.max(0, fullPrice - Number(student.discount));
        }
      }

      const joinDate = student?.joinedAt || student?.createdAt || student?.startDate || "";
      const prorata = calculateProratedFee({
        fullMonthlyFee: fullPrice,
        groupDays: g.days || ["Dush", "Chor", "Juma"],
        monthStr: month,
        joinDate,
      });

      const effectivePrice = prorata.calculatedFee;

      const groupPayments = allPayments.filter(
        (p) => p.studentId === student?.id && p.groupId === g.id && p.month === month
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

      return {
        group: g,
        price: effectivePrice,
        fullPrice,
        isProrated: prorata.isProrated,
        proratedReason: prorata.reason,
        pricePerLesson: prorata.pricePerLesson,
        attendedLessons: prorata.attendedLessons,
        totalLessons: prorata.totalLessons,
        paidSum,
        discountSum,
        effectiveCovered,
        remainingDebt,
        paid: isPaid,
        isPartial,
        status: paymentStatus,
      };
    });
  }, [assignedGroups, allPayments, student, month]);

  const totalDebt = useMemo(() => {
    return groupDebts.reduce((sum, d) => sum + (d.remainingDebt || 0), 0);
  }, [groupDebts]);

  // Student's payment history
  const studentPayments = useMemo(() => {
    return allPayments
      .filter((p) => p.studentId === student?.id)
      .sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0));
  }, [allPayments, student?.id]);

  const totalPaidSum = useMemo(() => {
    return studentPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  }, [studentPayments]);

  // Attendance stats
  const attendanceRecords = useMemo(() => {
    const list = [];
    allAttendance.forEach((rec) => {
      const entry = (rec.entries || []).find((e) => e.studentId === student?.id);
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
  }, [allAttendance, student?.id, allGroups]);

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
    return student?.exams || [
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
  }, [student?.exams, assignedGroups]);

  // Purchases list (Market / Coin store)
  const purchaseRecords = useMemo(() => {
    return student?.purchases || [
      {
        id: "pur_1",
        item: "COSMOS Maxsus Dasturchi Bloknoti",
        coins: 15,
        date: "2026-02-01",
        status: "Topshirildi",
      }
    ];
  }, [student?.purchases]);

  // Action Menu Items for 3-dots button (Uch nuqtada amallar menyusi)
  const actionMenuItems = [
    {
      key: "add_group",
      label: "Guruhga qo'shish",
      icon: <Plus size={16} className="text-emerald-600" />,
      onClick: () => {
        setShowActionsMenu(false);
        if (openModal) {
          openModal({ type: "assignStudentToGroup", studentId: student?.id, student });
        } else if (onAssignStudentToGroup) {
          onAssignStudentToGroup(student?.id);
        }
      },
    },
    {
      key: "edit_balance",
      label: "Balans tahrirlash",
      icon: <Edit3 size={16} className="text-amber-600" />,
      onClick: async () => {
        setShowActionsMenu(false);
        if (openModal) {
          openModal({ type: "editStudentBalance", studentId: student?.id, student });
        } else {
          const val = prompt("Yangi balans summasini kiriting (so'mda):", student?.balance || 0);
          if (val !== null && !isNaN(val)) {
            try {
              await onUpdateStudent?.(student?.id, { balance: Number(val) });
              setSaveSuccessMsg("Balans yangilandi!");
              setTimeout(() => setSaveSuccessMsg(""), 2500);
            } catch (e) {
              console.error(e);
            }
          }
        }
      },
    },
    {
      key: "pay",
      label: "To'lov qilish",
      icon: <CreditCard size={16} className="text-emerald-600" />,
      onClick: () => {
        setShowActionsMenu(false);
        if (openModal) {
          openModal({ type: "recordPayment", student, studentId: student?.id });
        } else if (onRecordPayment) {
          onRecordPayment({ studentId: student?.id });
        }
      },
    },
    {
      key: "transfer_branch",
      label: "Boshqa filialga o'tkazish",
      icon: <ArrowLeftRight size={16} className="text-indigo-600" />,
      onClick: () => {
        setShowActionsMenu(false);
        if (openModal) {
          openModal({ type: "transferBranch", studentId: student?.id, student });
        } else {
          alert("Boshqa filialga o'tkazish xizmati");
        }
      },
    },
    {
      key: "refund",
      label: "To'lov qaytarish",
      icon: <RotateCcw size={16} className="text-rose-600" />,
      onClick: () => {
        setShowActionsMenu(false);
        if (openModal) {
          openModal({ type: "refundPayment", studentId: student?.id, student });
        } else {
          alert("To'lovni qaytarish xizmati");
        }
      },
    },
    {
      key: "delete",
      label: "O'chirish",
      icon: <Trash2 size={16} className="text-rose-600" />,
      onClick: () => {
        setShowActionsMenu(false);
        if (window.confirm(`${student?.name || "O'quvchi"}ni o'chirish/arxivlashni tasdiqlaysizmi?`)) {
          onDeleteStudent?.(student?.id);
          onBack?.();
        }
      },
    },
    {
      key: "edit",
      label: "Tahrirlash",
      icon: <Edit3 size={16} className="text-blue-600" />,
      onClick: () => {
        setShowActionsMenu(false);
        setIsEditing(true);
        setActiveTab("edit");
      },
    },
    {
      key: "return_to_lead",
      label: "Lidga qaytarish",
      icon: <ArrowLeftRight size={16} className="text-purple-600" />,
      onClick: async () => {
        setShowActionsMenu(false);
        if (window.confirm(`${student?.name || "O'quvchi"}ni qayta lidlar ro'yxatiga o'tkazasizmi?`)) {
          try {
            await onUpdateStudent?.(student?.id, { status: "lead" });
            setSaveSuccessMsg("O'quvchi lidga qaytarildi");
            setTimeout(() => setSaveSuccessMsg(""), 2500);
          } catch (e) {
            console.error(e);
          }
        }
      },
    },
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
    let list = Array.isArray(student?.notes) ? [...student.notes] : [];
    if (list.length === 0 && student?.note) {
      list.push({
        id: "initial-note",
        text: student.note,
        type: "note",
        createdAt: student.createdAt || new Date().toISOString(),
        author: "Menejer",
      });
    }
    return list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [student?.notes, student?.note, student?.createdAt]);

  const currentStatus = STUDENT_STATUSES.find((st) => st.id === (student?.status || "active")) || STUDENT_STATUSES[0];

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
      if (onUpdateStudent) {
        await onUpdateStudent(student.id, { status: newStatus });
      }
      setFormData((prev) => ({ ...prev, status: newStatus }));
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
      if (onUpdateStudent) {
        await onUpdateStudent(student.id, {
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
        });
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
      if (onUpdateStudent) {
        await onUpdateStudent(student.id, {
          discount: Number(discountVal) || 0,
          discountType: discountType,
          discountReason: discountReason,
        });
      }
      setSaveSuccessMsg("Chegirma muvaffaqiyatli saqlandi!");
      setTimeout(() => setSaveSuccessMsg(""), 2500);
    } catch (err) {
      console.error(err);
      setErrorMsg("Chegirmani saqlashda xatolik");
    }
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

      if (onUpdateStudent) {
        await onUpdateStudent(student.id, { notes: updatedNotes });
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
    if (!window.confirm("Ushbu izohni o'chirmoqchimisiz?")) return;
    try {
      const updatedNotes = notesList.filter((n) => n.id !== noteId);
      if (onUpdateStudent) {
        await onUpdateStudent(student.id, { notes: updatedNotes });
      }
      setSaveSuccessMsg("Izoh o'chirildi");
      setTimeout(() => setSaveSuccessMsg(""), 2500);
    } catch (err) {
      console.error(err);
      setErrorMsg("Izohni o'chirishda xatolik");
    }
  };

  const handleCoinSubmit = async (e) => {
    e.preventDefault();
    if (coinAmount <= 0) return;
    try {
      const currentCoins = Number(student.coins || 0);
      const diff = coinActionType === "add" ? coinAmount : -coinAmount;
      const newCoins = Math.max(0, currentCoins + diff);

      if (onAddCoins) {
        await onAddCoins(student.id, diff, coinReason);
      } else if (onUpdateStudent) {
        await onUpdateStudent(student.id, { coins: newCoins });
      }

      setSaveSuccessMsg(
        coinActionType === "add"
          ? `🪙 +${coinAmount} Cosmos Coin berildi!`
          : `🪙 -${coinAmount} Cosmos Coin ayirildi!`
      );
      setTimeout(() => setSaveSuccessMsg(""), 2500);
    } catch (err) {
      console.error(err);
      setErrorMsg("Coin berishda xatolik");
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
      phone: student.phone,
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
      if (onAssignStudentToGroup) {
        await onAssignStudentToGroup(student.id, groupId);
      }
      setGroupToAssign("");
      setSaveSuccessMsg("O'quvchi guruhga biriktirildi!");
      setTimeout(() => setSaveSuccessMsg(""), 2500);
    } catch (err) {
      console.error(err);
      setErrorMsg("Guruhga biriktirishda xatolik");
    }
  };

  const handleRemoveGroup = async (groupId) => {
    if (!window.confirm("Haqiqatan ham o'quvchini ushbu guruhdan chiqarmoqchimisiz?")) return;
    try {
      if (onRemoveFromGroup) {
        onRemoveFromGroup(student.id, groupId);
      } else if (onUpdateStudent) {
        const targetGid = String(groupId);
        const remaining = (student.groupIds || []).filter((id) => String(id) !== targetGid);
        await onUpdateStudent(student.id, { groupIds: remaining });
      }
      setSaveSuccessMsg("O'quvchi guruhdan chiqarildi");
      setTimeout(() => setSaveSuccessMsg(""), 2500);
    } catch (err) {
      console.error(err);
      setErrorMsg("Guruhdan chiqarishda xatolik");
    }
  };

  return (
    <div className="min-h-screen pb-20 space-y-6 text-slate-900 dark:text-slate-100 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Quick Actions Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-xs"
          >
            <ArrowLeft size={16} />
            <span>O'quvchilar ro'yxatiga</span>
          </button>
          <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
            <span>O'quvchilar</span>
            <ChevronRight size={13} />
            <span className="font-bold text-slate-900 dark:text-white truncate">
              {student.name}
            </span>
          </div>
        </div>

        {/* Top Quick Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => {
              if (openModal) {
                openModal({ type: "recordPayment", studentId: student.id });
              } else if (onRecordPayment) {
                onRecordPayment({ studentId: student.id });
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-emerald-600/20 cursor-pointer"
          >
            <CreditCard size={14} />
            <span>To'lov qabul qilish</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("coins")}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-amber-500/20 cursor-pointer"
          >
            <Coins size={14} />
            <span>Coin berish</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsEditing(!isEditing);
              setActiveTab("edit");
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              isEditing && activeTab === "edit"
                ? "bg-violet-600 text-white border-violet-600 shadow-sm"
                : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
            }`}
          >
            <Edit3 size={14} />
            <span>{isEditing && activeTab === "edit" ? "Tahrirni yopish" : "Tahrirlash"}</span>
          </button>

          {onDeleteStudent && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`${student?.name || "O'quvchi"}ni o'chirish/arxivlashni tasdiqlaysizmi?`)) {
                  if (student?.id) onDeleteStudent(student.id);
                  onBack?.();
                }
              }}
              className="p-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded-xl border border-rose-200 dark:border-rose-900/50 transition-colors cursor-pointer"
              title="O'quvchini arxivlash / o'chirish"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

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
            <img
              className="avatar"
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(student.name || "Bexruzbek")}&backgroundColor=f4c56b`}
              alt="avatar"
            />
            <div className="name-block">
              <h1>{student.name || "Xusanov Bexruzbek"}</h1>
              <div className="id">ID : {student.id || student._id || "275489"}</div>
            </div>
            <button
              type="button"
              className="menu-btn"
              id="menuToggle"
              onClick={() => setShowActionsMenu((prev) => !prev)}
            >
              &#8226;&#8226;&#8226;
            </button>

            <div className={`dropdown ${showActionsMenu ? "open" : ""}`} ref={actionsMenuRef}>
              {actionMenuItems.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className={item.key === "delete" ? "danger" : ""}
                  onClick={item.onClick}
                >
                  <span className="icon">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="balance-row">
            <span className={`balance-pill ${Number(student.balance || 0) >= 0 ? "bg-[#16a34a]" : "bg-[#ef4444]"}`}>
              {money(student.balance || -262308)}
            </span>
            <span className="balance-label">balans (so'm)</span>
            <span>
              <span className="stat-pill yellow">{student.coins || 0}</span>ta tanga{" "}
              <a className="stat-link" onClick={() => setActiveTab("coins")}>
                &#9998;
              </a>
            </span>
            <span>
              <span className="stat-pill green">{student.crystals || 0}</span>ta kristal{" "}
              <a className="stat-link" onClick={() => setActiveTab("coins")}>
                &#9998;
              </a>
            </span>
          </div>

          <div className="info-line">
            <span className="label">Telefon raqam:</span>{" "}
            <span className="value">+(998) {student.phone ? displayPhone(student.phone) : "93-000-48-64"}</span>
          </div>
          <div className="info-line">
            <span className="label">Tug'ilgan sana:</span>{" "}
            <span className="value">{student.birthDate ? formatDate(student.birthDate) : "Mavjud emas"}</span>
          </div>
          <div className="info-line">
            <span className="label">Talaba qo'shilgan sana :</span>{" "}
            <span className="value">{student.createdAt ? formatDate(student.createdAt.slice(0, 10)) : "Aug 22, 2026"}</span>
          </div>

          <div className="actions-row">
            <a className="link-btn" onClick={() => setShowMoreInfo(!showMoreInfo)}>
              - qo'shimcha ma'lumotlarni <span style={{ fontSize: "11px" }}>&#9998;</span>
            </a>
            <button type="button" className="icon-btn-mini" onClick={() => setActiveTab("sms")}>&#9993;</button>
            <button
              type="button"
              className="icon-btn-mini"
              onClick={() => {
                if (openModal) openModal({ type: "recordPayment", studentId: student.id });
                else setActiveTab("payments");
              }}
            >
              &#128176;
            </button>
            <button type="button" className="outline-btn" onClick={() => setActiveTab("history")}>
              &#8635; Lid tarixi
            </button>
          </div>

          {showMoreInfo && (
            <div className="info-table">
              <div className="row">
                <div className="k">Kurs</div>
                <div className="v">{assignedCourseNames || "ENGLISH KIDS 310K"}</div>
              </div>
              <div className="row">
                <div className="k">Qoshimcha raqam</div>
                <div className="v">{student.parentPhone || student.phone2 || "998882002009"}</div>
              </div>
              <div className="row">
                <div className="k">Sana</div>
                <div className="v">{student.createdAt ? formatDate(student.createdAt.slice(0, 10)) : "2026-08-06"}</div>
              </div>
              <div className="row">
                <div className="k">Biz haqqimizda qaerdan eshitdingiz</div>
                <div className="v">{student.source || "Do'stingizdan"}</div>
              </div>
              <div className="row">
                <div className="k">Qaysi guruhga kelyapti</div>
                <div className="v">{student.targetCourse || "begi"}</div>
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

          <div className="subtabs-row">
            {[
              { id: "calls", label: "Qo'ng'iroqlar" },
              { id: "exercises", label: "Mashqlar" },
              { id: "coins", label: "Tanga/Kristal hisoboti" },
            ].map((stb) => (
              <span
                key={stb.id}
                className={`tab ${activeTab === stb.id ? "active" : ""}`}
                onClick={() => {
                  setActiveTab(stb.id);
                  setIsEditing(false);
                }}
              >
                {stb.label}
              </span>
            ))}
          </div>

          <div className="toolbar">
            <div className="select-like">To'lov usuli</div>
            <button type="button" className="gear-btn">&#9881;</button>
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
                </div>

                {assignedGroups.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 space-y-2">
                    <GraduationCap size={32} className="mx-auto text-slate-300 dark:text-slate-600" />
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Ushbu o'quvchi hali hech qaysi guruhga qo'shilmagan
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Quyidagi qidiruv panelidan kerakli guruhni tanlab biriktiring
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {groupDebts.map(({ group: grp, price, paid, isPartial, effectiveCovered, remainingDebt, isProrated, attendedLessons, totalLessons }) => {
                      const crs = courses.find((c) => c.id === grp.courseId);
                      const tch = teachers.find((t) => String(t.id) === String(grp.teacherHrId || grp.teacherId));
                      return (
                        <div
                          key={grp.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-800/50 hover:border-violet-300 dark:hover:border-violet-700 transition-all"
                        >
                          <div className="space-y-1.5 min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                                {grp.name}
                              </span>
                              {crs && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-xl bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300">
                                  {crs.title || crs.name}
                                </span>
                              )}
                              {grp.room && (
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                  {grp.room} xona
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                              {grp.time && (
                                <span className="flex items-center gap-1 font-mono font-medium">
                                  <Clock size={12} className="text-violet-500" />
                                  {grp.time}
                                </span>
                              )}
                              {grp.days && (
                                <span className="flex items-center gap-1">
                                  <Calendar size={12} className="text-emerald-500" />
                                  {Array.isArray(grp.days) ? grp.days.join(", ") : grp.days}
                                </span>
                              )}
                              {tch && (
                                <span className="flex items-center gap-1">
                                  <User size={12} className="text-indigo-500" />
                                  {tch.name}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-700">
                            <div className="text-left sm:text-right">
                              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center sm:justify-end gap-1.5">
                                <span>{price ? `${money(price)} so'm/oy` : "Bepul"}</span>
                                {isProrated && (
                                  <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                                    ({attendedLessons}/{totalLessons} dars)
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] font-semibold mt-0.5">
                                {paid ? (
                                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center sm:justify-end gap-1 font-bold">
                                    <CheckCircle2 size={11} /> To'langan
                                  </span>
                                ) : isPartial ? (
                                  <span className="text-amber-600 dark:text-amber-400 font-bold flex flex-col sm:items-end">
                                    <span>To'langan: {money(effectiveCovered)} so'm</span>
                                    <span className="text-rose-600 dark:text-rose-400 text-[10px] font-black">
                                      Qoldiq: {money(remainingDebt)} so'm
                                    </span>
                                  </span>
                                ) : (
                                  <span className="text-rose-600 dark:text-rose-400 font-bold">
                                    Qarz: {money(remainingDebt || price)} so'm
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  if (openModal) {
                                    openModal({
                                      type: "recordPayment",
                                      studentId: student.id,
                                      groupId: grp.id,
                                    });
                                  } else if (onRecordPayment) {
                                    onRecordPayment({ studentId: student.id, groupId: grp.id });
                                  }
                                }}
                                className="px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
                              >
                                To'lov
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveGroup(grp.id)}
                                className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-xl border border-rose-200 dark:border-rose-900/50 transition-colors cursor-pointer"
                                title="Guruhdan chiqarish"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Searchable Group Select */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <label className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Plus size={14} className="text-violet-600" />
                    Yangi guruhga biriktirish (Qidiruv bilan):
                  </label>
                  <div className="flex items-center gap-2 flex-col sm:flex-row">
                    <div className="flex-1 w-full">
                      <SearchableGroupSelect
                        groups={allGroups.filter((g) => !(student.groupIds || []).some((id) => String(id) === String(g.id)))}
                        courses={courses}
                        teachers={teachers}
                        students={opData?.students || []}
                        value={groupToAssign}
                        onChange={(gid) => setGroupToAssign(gid)}
                        placeholder="Guruh nomi, kursi, o'qituvchisi yoki vaqtini qidiring..."
                      />
                    </div>
                    <button
                      type="button"
                      disabled={!groupToAssign}
                      onClick={() => handleQuickAssignGroup(groupToAssign)}
                      className="w-full sm:w-auto px-4 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
                    >
                      Guruhga qo'shish
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TO'LOVLAR */}
          {activeTab === "payments" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-850 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Jami to'langan summa</div>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    {money(totalPaidSum)} <span className="text-xs font-normal text-slate-400">so'm</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">{studentPayments.length} ta to'lov operatsiyasi</div>
                </div>

                <div className="bg-white dark:bg-slate-850 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Joriy oydagi qarzdorlik</div>
                  <div className={`text-2xl font-black mt-1 ${totalDebt > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600"}`}>
                    {money(totalDebt)} <span className="text-xs font-normal text-slate-400">so'm</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {totalDebt > 0 ? "To'lov muddati kechikmoqda" : "Barcha guruhlar to'langan ✓"}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-850 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400">O'quvchi Balansi</div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                      {money(student.balance || 0)} <span className="text-xs font-normal text-slate-400">so'm</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (openModal) {
                        openModal({ type: "recordPayment", studentId: student.id });
                      } else if (onRecordPayment) {
                        onRecordPayment({ studentId: student.id });
                      }
                    }}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    + To'lov qabul qilish
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <CreditCard size={18} className="text-emerald-600" />
                  To'lovlar tarixi ({studentPayments.length} ta)
                </h3>

                {studentPayments.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-slate-400 text-xs">
                    To'lov yozuvlari topilmadi
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 font-bold">
                          <th className="py-3 px-3">Sana</th>
                          <th className="py-3 px-3">Guruh</th>
                          <th className="py-3 px-3">Summa</th>
                          <th className="py-3 px-3">Oy</th>
                          <th className="py-3 px-3">To'lov turi</th>
                          <th className="py-3 px-3">Izoh</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                        {studentPayments.map((p) => {
                          const grp = allGroups.find((g) => g.id === p.groupId);
                          return (
                            <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                              <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                                {formatDate(p.date || p.createdAt?.slice(0, 10))}
                              </td>
                              <td className="py-3 px-3">
                                <span className="font-bold text-slate-800 dark:text-slate-200">
                                  {grp?.name || "Umumiy to'lov"}
                                </span>
                              </td>
                              <td className="py-3 px-3 font-black text-emerald-600 dark:text-emerald-400 text-sm">
                                +{money(p.amount)} so'm
                              </td>
                              <td className="py-3 px-3 font-mono text-slate-500">
                                {p.month || "—"}
                              </td>
                              <td className="py-3 px-3">
                                <span className="px-2 py-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold uppercase text-[10px]">
                                  {p.method || p.type || "Naqd pul"}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-slate-500 max-w-xs truncate">
                                {p.comment || p.note || "—"}
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
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <Tag size={18} className="text-violet-600" />
                    O'quvchi chegirmasi va imtiyozlari
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    O'quvchi uchun maxsus chegirma foizini yoki belgilangan summani biriktiring
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveDiscount} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={LABEL_CLS}>Chegirma miqdori</label>
                    <input
                      type="number"
                      min="0"
                      value={discountVal}
                      onChange={(e) => setDiscountVal(e.target.value)}
                      placeholder="Masalan: 10 yoki 50000"
                      className={INPUT_CLS}
                    />
                  </div>

                  <div>
                    <label className={LABEL_CLS}>Chegirma turi</label>
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value)}
                      className={INPUT_CLS}
                    >
                      <option value="percent">Foizda (%)</option>
                      <option value="fixed">Summada (so'm)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={LABEL_CLS}>Chegirma berish sababi</label>
                  <input
                    type="text"
                    value={discountReason}
                    onChange={(e) => setDiscountReason(e.target.value)}
                    placeholder="Masalan: Ikkinchi farzand / Grant / Aktsiya"
                    className={INPUT_CLS}
                  />
                </div>

                <div className="p-4 rounded-xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800 text-xs space-y-1">
                  <div className="font-bold text-violet-900 dark:text-violet-200">
                    Joriy holat: {discountVal > 0 ? `${discountVal} ${discountType === "percent" ? "%" : "so'm"} chegirma` : "Chegirma yo'q"}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    Chegirma o'quvchining har oylik guruh to'lovlarida avtomatik ravishda inobatga olinadi.
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Save size={14} />
                    <span>Chegirmani saqlash</span>
                  </button>
                </div>
              </form>
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
                    {student.createdAt ? formatDate(student.createdAt.slice(0, 10)) : "Yaqinda"}
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
                      value={displayPhone(student.phone)}
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form */}
              <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Coins size={18} className="text-amber-500" />
                  Coin Berish / Ayirish
                </h3>

                <form onSubmit={handleCoinSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCoinActionType("add")}
                      className={`py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        coinActionType === "add"
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-600 border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      + Coin qo'shish
                    </button>
                    <button
                      type="button"
                      onClick={() => setCoinActionType("deduct")}
                      className={`py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        coinActionType === "deduct"
                          ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-600 border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      - Coin ayirish
                    </button>
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

                  <button
                    type="submit"
                    className={`w-full py-2.5 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer ${
                      coinActionType === "add"
                        ? "bg-amber-500 hover:bg-amber-600"
                        : "bg-rose-600 hover:bg-rose-700"
                    }`}
                  >
                    {coinActionType === "add" ? `🪙 +${coinAmount} Coin berish` : `🪙 -${coinAmount} Coin ayirish`}
                  </button>
                </form>
              </div>

              {/* Coins Report Banner */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 rounded-xl p-6 text-white shadow-lg shadow-amber-500/20 flex items-center justify-between flex-wrap gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-bold uppercase tracking-wider text-amber-100">
                      Cosmos Coin Balansi
                    </div>
                    <div className="text-4xl font-black flex items-center gap-2">
                      <span>🪙 {student.coins || 0}</span>
                      <span className="text-sm font-semibold text-amber-100">Cosmos Coin</span>
                    </div>
                    <p className="text-xs text-amber-100 pt-1">
                      O'quvchining jamlangan coin hisoboti
                    </p>
                  </div>
                  <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shrink-0">
                    🏆
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-3">
                    Coinlar Hisoboti & Tarixi
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Darslardagi a'lo faollik uchun</span>
                      <span className="font-bold text-emerald-600">+10 Coin</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">To'lovni o'z vaqtida qilgani uchun</span>
                      <span className="font-bold text-emerald-600">+5 Coin</span>
                    </div>
                  </div>
                </div>
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
    </div>
  );
}

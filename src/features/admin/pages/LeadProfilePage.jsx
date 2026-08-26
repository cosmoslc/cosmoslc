import { useState, useMemo, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Phone,
  PhoneCall,
  User,
  GraduationCap,
  BookOpen,
  Calendar,
  Clock,
  Send,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Share2,
  Copy,
  Check,
  Plus,
  RefreshCw,
  School,
  Flame,
  Award,
  Bell,
  Sparkles,
  X,
} from "lucide-react";
import { LEAD_STATUSES } from "../../../shared/constants/finance";
import { INPUT_CLS, LABEL_CLS, PrimaryButton } from "../theme/tokens";
import { addStudent, updateStudent } from "../../../shared/api";
import { SearchableGroupSelect } from "../../../shared/components/SearchableGroupSelect";
import { SearchableCourseSelect } from "../../../shared/components/SearchableCourseSelect";
import { getSavedLeadFormFields } from "../components/LeadFormSettingsBuilder";

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
  "Maktabgacha / Bog'cha",
  "Litsey / Kollej",
  "Talaba (Universitet)",
  "Kattalar / Ishlovchi",
  "Boshqa",
];

const LEAD_SOURCES = [
  { id: "instagram", label: "Instagram", color: "#E1306C" },
  { id: "telegram", label: "Telegram Bot / Kanal", color: "#0088CC" },
  { id: "website", label: "Veb-sayt ariza", color: "#10B981" },
  { id: "website_form", label: "Veb-sayt Onlayn Forma", color: "#10B981" },
  { id: "reklama", label: "Ijtimoiy tarmoq reklamasi", color: "#F59E0B" },
  { id: "tavsiya", label: "Tanish / Tavsiya", color: "#8B5CF6" },
  { id: "boshqa", label: "Boshqa Manba", color: "#64748B" },
];

const SMS_TEMPLATES = [
  {
    title: "Sinov darsiga taklif",
    text: "Assalomu alaykum! Sizni o'quv markazimizdagi bepul sinov darsiga taklif qilamiz. Manzilimiz: [Markaz manzili]. Qatnashishingizni tasdiqlang: +998...",
  },
  {
    title: "Guruh dars jadvali",
    text: "Assalomu alaykum! Siz tanlagan [Kurs nomi] kursi bo'yicha mashg'ulotlar [Kunlari] soat [Vaqti]da boshlanadi. Sizni kutamiz!",
  },
  {
    title: "Eslatma (Qo'ng'iroq)",
    text: "Assalomu alaykum! O'quv markazimizdan siz bilan bog'lana olmadik. Sizga qulay vaqtda qayta bog'lanishingizni so'raymiz.",
  },
  {
    title: "Diagnostika / Test natijasi",
    text: "Assalomu alaykum! Sizning sinov testi natijangiz tayyor bo'ldi. O'zingizga mos guruhga yozilish uchun markazimizga tashrif buyuring.",
  },
];

const INTEREST_LEVELS = [
  { id: "hot", label: "Yuqori (Issiq)", icon: "🔥", desc: "Darsga qatnashishga to'liq tayyor", color: "text-rose-600 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800" },
  { id: "warm", label: "O'rta (Iliq)", icon: "⚡", desc: "Qiziqishi bor, o'ylab ko'rmoqda", color: "text-amber-600 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800" },
  { id: "cold", label: "Past (Sovuq)", icon: "❄️", desc: "Shunchaki ma'lumot oldi", color: "text-blue-600 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800" },
];

const TEST_LEVELS = [
  "Beginner (A1)",
  "Elementary (A2)",
  "Pre-Intermediate (B1)",
  "Intermediate (B1+)",
  "Upper-Intermediate (B2)",
  "Advanced (C1)",
  "Boshlang'ich",
  "O'rta daraja",
  "Yuqori daraja",
];

export function LeadProfilePage({
  lead,
  directorData,
  opData,
  onUpdateLead,
  onDeleteLead,
  onBack,
  onRefresh,
}) {
  const courses = directorData?.courses || opData?.courses || [];
  const groups = opData?.groups || [];
  const teachers = directorData?.teachersHR || directorData?.teachers || opData?.teachers || [];

  // Form builder fields configured by admin
  const configuredFormFields = useMemo(() => {
    try {
      return getSavedLeadFormFields() || [];
    } catch {
      return [];
    }
  }, []);

  // Right Menu Tabs: 'izohlar', 'sms', 'daraja', 'test'
  const [activeTab, setActiveTab] = useState("izohlar");

  // Notifications & State Feedback
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [copiedPhone, setCopiedPhone] = useState("");

  // Inline Editing active key tracker
  const [editingKey, setEditingKey] = useState(null);
  const [tempValue, setTempValue] = useState("");

  // Tab 1: Izohlar State (Auto current time)
  const [newCommentText, setNewCommentText] = useState("");
  const [addingComment, setAddingComment] = useState(false);

  // Tab 2: SMS Sender State
  const [smsText, setSmsText] = useState("");
  const [selectedRecipient, setSelectedRecipient] = useState("p1"); // 'p1' or 'p2'
  const [sendingSms, setSendingSms] = useState(false);

  // Tab 3: Daraja / Pipeline State
  const [interestLevel, setInterestLevel] = useState(
    lead.interestLevel || lead.customFields?.interestLevel || "warm"
  );
  const [assigningGroup, setAssigningGroup] = useState(false);

  // Tab 4: Test Topshirish Natijalari State
  const [testScore, setTestScore] = useState("");
  const [testMaxScore, setTestMaxScore] = useState("100");
  const [testLevel, setTestLevel] = useState(TEST_LEVELS[0]);
  const [testSubject, setTestSubject] = useState(lead.courseName || courses[0]?.name || "Umumiy test");
  const [testNote, setTestNote] = useState("");
  const [addingTest, setAddingTest] = useState(false);

  const deletedCommentIdsRef = useRef(new Set());

  // Parse existing comments/timeline without losing any sources
  const parseAllComments = (currentLead) => {
    if (!currentLead) return [];
    let list = [];

    const addItem = (item) => {
      if (!item) return;
      if (typeof item === "string") {
        if (!item.trim()) return;
        list.push({
          id: `str-${item.trim()}`,
          text: item.trim(),
          author: "Manager",
          createdAt: currentLead.createdAt || new Date().toISOString(),
        });
      } else if (typeof item === "object" && item.text && typeof item.text === "string" && item.text.trim()) {
        list.push(item);
      }
    };

    if (Array.isArray(currentLead.comments)) {
      currentLead.comments.forEach(addItem);
    }
    if (Array.isArray(currentLead.customFields?.comments)) {
      currentLead.customFields.comments.forEach(addItem);
    }
    if (Array.isArray(currentLead.notes)) {
      currentLead.notes.forEach(addItem);
    }
    if (Array.isArray(currentLead.customFields?.notes)) {
      currentLead.customFields.notes.forEach(addItem);
    }
    if (Array.isArray(currentLead.reminders)) {
      currentLead.reminders.forEach(addItem);
    }
    if (Array.isArray(currentLead.customFields?.reminders)) {
      currentLead.customFields.reminders.forEach(addItem);
    }
    if (Array.isArray(currentLead.eslatmalar)) {
      currentLead.eslatmalar.forEach(addItem);
    }
    if (Array.isArray(currentLead.customFields?.eslatmalar)) {
      currentLead.customFields.eslatmalar.forEach(addItem);
    }

    if (currentLead.note && typeof currentLead.note === "string" && currentLead.note.trim()) {
      addItem({
        id: `single-note-${currentLead.id}-${currentLead.note.trim().slice(0, 10)}`,
        text: currentLead.note.trim(),
        author: "Tizim / Manager",
        createdAt: currentLead.createdAt || new Date().toISOString(),
      });
    }

    // Deduplicate items
    const unique = [];
    const seen = new Set();
    for (const item of list) {
      if (!item || !item.text) continue;
      const key = item.id || `${item.text.trim()}_${item.createdAt}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(item);
      }
    }
    return unique.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const [localComments, setLocalComments] = useState(() => parseAllComments(lead));

  // Sync if lead changes while preserving locally added comments
  useEffect(() => {
    const parsed = parseAllComments(lead);
    setLocalComments((prev) => {
      const combined = [...parsed];
      const seenKeys = new Set(
        combined.map((c) => c.id || `${c.text?.trim()}_${c.createdAt}`)
      );

      for (const item of prev) {
        if (!item || !item.text) continue;
        const key = item.id || `${item.text.trim()}_${item.createdAt}`;
        if (item.id && deletedCommentIdsRef.current.has(item.id)) continue;
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          combined.push(item);
        }
      }

      return combined
        .filter((c) => !c.id || !deletedCommentIdsRef.current.has(c.id))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    });
  }, [lead]);

  // Parse SMS history
  const smsHistory = useMemo(() => {
    return Array.isArray(lead.smsHistory)
      ? lead.smsHistory
      : lead.customFields?.smsHistory || [];
  }, [lead.smsHistory, lead.customFields?.smsHistory]);

  // Parse Test results
  const testResultsList = useMemo(() => {
    return Array.isArray(lead.testResults)
      ? lead.testResults
      : lead.customFields?.testResults || [];
  }, [lead.testResults, lead.customFields?.testResults]);

  // Helper to reliably find and format Course name (never random hash/ID)
  const resolveCourseName = (cId, rawVal) => {
    const val = cId || rawVal || lead.courseId || lead.customFields?.courseId || lead.customFields?.course_select || "";
    
    // 1. Try matching with course id or _id
    const matched = courses.find((c) => String(c.id) === String(val) || String(c._id) === String(val));
    if (matched) return matched.name;

    // 2. Try matching with course name directly
    const matchedByName = courses.find((c) => c.name && c.name.toLowerCase() === String(val).toLowerCase());
    if (matchedByName) return matchedByName.name;

    // 3. Try matching via enrolled group
    const grpId = lead.enrolledGroupId || lead.groupId || lead.customFields?.enrolledGroupId;
    if (grpId) {
      const grp = groups.find((g) => String(g.id) === String(grpId));
      if (grp) {
        const grpCrs = courses.find((c) => String(c.id) === String(grp.courseId));
        if (grpCrs) return grpCrs.name;
        if (grp.courseName) return grp.courseName;
      }
    }

    // 4. Check if lead has valid readable courseName
    if (
      lead.courseName &&
      typeof lead.courseName === "string" &&
      !lead.courseName.startsWith("c_") &&
      !lead.courseName.startsWith("crs_") &&
      !/^[0-9a-f-]{10,}$/i.test(lead.courseName)
    ) {
      return lead.courseName;
    }

    if (lead.customFields?.courseName) {
      return lead.customFields.courseName;
    }

    // 5. If val is a human readable string (not id)
    if (val && typeof val === "string" && !val.startsWith("c_") && !val.startsWith("crs_") && !/^[0-9a-f-]{10,}$/i.test(val)) {
      return val;
    }

    return courses[0]?.name || "Kurs tanlanmagan";
  };

  const currentCourseName = resolveCourseName(lead.courseId, lead.customFields?.course_select);
  const currentGroupId = lead.enrolledGroupId || lead.groupId || lead.customFields?.enrolledGroupId || "";
  const selectedGroup = groups.find((g) => g.id === currentGroupId);

  // Status badge lookup
  const currentStatusObj = LEAD_STATUSES.find((s) => s.id === lead.status) || {
    label: lead.status || "Yangi",
    color: "#6366f1",
  };

  // Source lookup
  const currentSourceObj = LEAD_SOURCES.find((s) => s.id === (lead.source || lead.customFields?.source)) || {
    label: lead.source || "Boshqa",
    color: "#8B5CF6",
  };

  const copyToClipboard = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedPhone(label);
    setTimeout(() => setCopiedPhone(""), 2000);
  };

  const showToast = (msg) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(""), 2500);
  };

  // ==========================================
  // INLINE FIELD UPDATE FUNCTION
  // ==========================================
  const saveInlineField = async (fieldKey, valueToSave) => {
    try {
      let updated = { ...lead };

      if (fieldKey === "name") {
        if (!String(valueToSave).trim()) {
          setErrorMsg("Ism bo'sh bo'lishi mumkin emas");
          return;
        }
        updated.name = String(valueToSave).trim();
      } else if (fieldKey === "phone") {
        updated.phone = String(valueToSave).trim() || "+998";
      } else if (fieldKey === "phone2" || fieldKey === "parentPhone") {
        updated.phone2 = String(valueToSave).trim();
        updated.parentPhone = String(valueToSave).trim();
      } else if (fieldKey === "grade") {
        updated.grade = valueToSave;
      } else if (fieldKey === "course_select" || fieldKey === "courseId" || fieldKey === "course") {
        const foundCrs = courses.find((c) => c.id === valueToSave || c.name === valueToSave);
        updated.courseId = foundCrs ? foundCrs.id : valueToSave;
        updated.courseName = foundCrs ? foundCrs.name : valueToSave;
        updated.customFields = {
          ...(updated.customFields || {}),
          course_select: foundCrs ? foundCrs.id : valueToSave,
          courseName: foundCrs ? foundCrs.name : valueToSave,
        };
      } else if (fieldKey === "group_dropdown" || fieldKey === "group_select" || fieldKey === "groupId" || fieldKey === "enrolledGroupId") {
        const grp = groups.find((g) => g.id === valueToSave);
        updated.enrolledGroupId = valueToSave || null;
        updated.enrolledGroupName = grp?.name || "";
        if (grp?.courseId) {
          const crs = courses.find((c) => c.id === grp.courseId);
          updated.courseId = grp.courseId;
          if (crs) updated.courseName = crs.name;
        }
      } else if (fieldKey === "source") {
        updated.source = valueToSave;
      } else if (fieldKey === "status") {
        updated.status = valueToSave;
        updated.statusUpdatedAt = new Date().toISOString();
      } else if (fieldKey === "note" || fieldKey === "comment") {
        updated.note = String(valueToSave).trim();
      } else {
        // Custom field
        updated.customFields = {
          ...(updated.customFields || {}),
          [fieldKey]: valueToSave,
        };
      }

      updated.updatedAt = new Date().toISOString();

      if (onUpdateLead) {
        await onUpdateLead(lead.id, updated);
      }
      setEditingKey(null);
      showToast("Ma'lumot yangilandi! ✓");
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      setErrorMsg("Saqlashda xatolik yuz berdi");
    }
  };

  const startInlineEdit = (key, currentVal) => {
    setEditingKey(key);
    setTempValue(currentVal ?? "");
  };

  const cancelInlineEdit = () => {
    setEditingKey(null);
    setTempValue("");
  };

  // 1. Handle Status Change (Pipeline)
  async function handleStatusChange(newStatus) {
    setErrorMsg("");
    try {
      const updated = {
        ...lead,
        status: newStatus,
        statusUpdatedAt: new Date().toISOString(),
      };
      if (onUpdateLead) {
        await onUpdateLead(lead.id, updated);
      }
      showToast(`Holat "${LEAD_STATUSES.find((s) => s.id === newStatus)?.label || newStatus}" ga o'zgartirildi`);
    } catch (err) {
      console.error(err);
      setErrorMsg("Holatni o'zgartirishda xatolik");
    }
  }

  // 2. Handle Interest Level Change
  async function handleInterestChange(lvl) {
    setInterestLevel(lvl);
    try {
      const updated = {
        ...lead,
        interestLevel: lvl,
        customFields: {
          ...(lead.customFields || {}),
          interestLevel: lvl,
        },
      };
      if (onUpdateLead) {
        await onUpdateLead(lead.id, updated);
      }
      showToast("Qiziqish darajasi yangilandi");
    } catch (err) {
      console.error(err);
    }
  }

  // 3. Handle Group Select
  async function handleGroupSelect(groupId) {
    setErrorMsg("");
    const grp = groups.find((g) => g.id === groupId);
    const updated = {
      ...lead,
      enrolledGroupId: groupId || null,
      enrolledGroupName: grp?.name || "",
      courseId: grp?.courseId || lead.courseId,
    };
    try {
      if (onUpdateLead) {
        await onUpdateLead(lead.id, updated);
      }
      showToast(grp ? `Guruh: "${grp.name}" biriktirildi` : "Guruh biriktiruvi bekor qilindi");
    } catch (err) {
      console.error(err);
      setErrorMsg("Guruhni biriktirishda xatolik");
    }
  }

  // 4. Handle Converting to Student
  async function handleConvertToStudent() {
    if (!currentGroupId) {
      setErrorMsg("Iltimos, avval o'quvchi biriktirilishi kerak bo'lgan guruhni tanlang.");
      return;
    }
    setAssigningGroup(true);
    setErrorMsg("");
    try {
      const targetGroup = groups.find((g) => g.id === currentGroupId);
      
      const updatedLead = {
        ...lead,
        status: "student",
        enrolledGroupId: currentGroupId,
        enrolledGroupName: targetGroup?.name || "",
        enrolledAt: new Date().toISOString(),
      };
      if (onUpdateLead) {
        await onUpdateLead(lead.id, updatedLead);
      }

      const existingStudents = opData?.students || [];
      const normP1 = (lead.phone || "").replace(/\D/g, "");
      const normP2 = (lead.phone2 || lead.parentPhone || "").replace(/\D/g, "");

      let existingStudent = existingStudents.find((s) => {
        const sp = (s.phone || "").replace(/\D/g, "");
        return sp && (sp === normP1 || sp === normP2);
      });

      if (existingStudent) {
        const mergedGroupIds = [...new Set([...(existingStudent.groupIds || []), currentGroupId])];
        await updateStudent(existingStudent.id, {
          groupIds: mergedGroupIds,
          grade: lead.grade || existingStudent.grade,
          parentPhone: lead.phone2 || lead.parentPhone || existingStudent.parentPhone,
        });
      } else {
        await addStudent({
          name: lead.name,
          phone: lead.phone,
          parentPhone: lead.phone2 || lead.parentPhone || "",
          grade: lead.grade || "",
          status: "active",
          groupIds: [currentGroupId],
          branchId: lead.branchId || targetGroup?.branchId || directorData?.branches?.[0]?.id || null,
          note: `Lid profilidan guruhga o'tkazildi (${lead.source || "CRM"}). ${lead.note || ""}`.trim(),
          createdAt: new Date().toISOString(),
        });
      }

      showToast(`"${lead.name}" muvaffaqiyatli "${targetGroup?.name || 'Guruh'}"ga o'quvchi sifatida qabul qilindi! 🎉`);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Guruhga qabul qilishda xatolik:", err);
      setErrorMsg("O'quvchini guruhga qo'shishda xatolik yuz berdi.");
    } finally {
      setAssigningGroup(false);
    }
  }

  // 5. Handle Add Izoh (Comment with automatic current timestamp)
  async function handleAddComment(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!newCommentText.trim()) return;

    setAddingComment(true);
    setErrorMsg("");

    const now = new Date();
    const newCommentObj = {
      id: `comment-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      text: newCommentText.trim(),
      author: "Manager",
      createdAt: now.toISOString(),
      timeFormatted: now.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" }),
    };

    const updatedComments = [newCommentObj, ...localComments];
    setLocalComments(updatedComments);
    setNewCommentText("");

    try {
      const updatedLead = {
        ...lead,
        comments: updatedComments,
        notes: updatedComments,
        eslatmalar: updatedComments,
        customFields: {
          ...(lead.customFields || {}),
          comments: updatedComments,
          notes: updatedComments,
          eslatmalar: updatedComments,
        },
        lastInteractionAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };
      if (onUpdateLead) {
        await onUpdateLead(lead.id, updatedLead);
      }
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Izoh qo'shishda xatolik:", err);
      setErrorMsg("Izohni saqlashda xatolik yuz berdi");
    } finally {
      setAddingComment(false);
    }
  }

  // 6. Handle Delete Comment
  async function handleDeleteComment(commentId) {
    if (commentId) {
      deletedCommentIdsRef.current.add(commentId);
    }
    const updatedComments = localComments.filter((c) => c.id !== commentId);
    setLocalComments(updatedComments);

    try {
      const updatedLead = {
        ...lead,
        comments: updatedComments,
        notes: updatedComments,
        eslatmalar: updatedComments,
        customFields: {
          ...(lead.customFields || {}),
          comments: updatedComments,
          notes: updatedComments,
          eslatmalar: updatedComments,
        },
        updatedAt: new Date().toISOString(),
      };
      if (onUpdateLead) {
        await onUpdateLead(lead.id, updatedLead);
      }
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      setErrorMsg("Izohni o'chirishda xatolik");
    }
  }

  // 7. Handle Send SMS
  async function handleSendSms(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!smsText.trim()) return;

    const targetPhone = selectedRecipient === "p1" ? lead.phone : (lead.phone2 || lead.parentPhone);
    if (!targetPhone || targetPhone === "+998") {
      setErrorMsg("Tanlangan telefon raqami mavjud emas!");
      return;
    }

    setSendingSms(true);
    setErrorMsg("");

    const newSmsEntry = {
      id: `sms-${Date.now()}`,
      recipientPhone: targetPhone,
      recipientType: selectedRecipient === "p1" ? "1-Telefon (Asosiy)" : "2-Telefon (Ota-onasi)",
      text: smsText.trim(),
      status: "sent",
      sentAt: new Date().toISOString(),
    };

    const currentSmsList = Array.isArray(lead.smsHistory)
      ? lead.smsHistory
      : lead.customFields?.smsHistory || [];
    const updatedSms = [newSmsEntry, ...currentSmsList];

    try {
      const updatedLead = {
        ...lead,
        smsHistory: updatedSms,
        customFields: {
          ...(lead.customFields || {}),
          smsHistory: updatedSms,
        },
      };
      if (onUpdateLead) {
        await onUpdateLead(lead.id, updatedLead);
      }
      setSmsText("");
      showToast(`SMS xabari ${targetPhone} raqamiga yuborildi! ✉️`);
    } catch (err) {
      console.error("SMS yuborishda xatolik:", err);
      setErrorMsg("SMS yuborishda xatolik yuz berdi");
    } finally {
      setSendingSms(false);
    }
  }

  // 8. Handle Add Test Result
  async function handleAddTestResult(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!testScore.trim()) {
      setErrorMsg("Iltimos, to'plangan ballni kiriting!");
      return;
    }

    setAddingTest(true);
    setErrorMsg("");

    const newTest = {
      id: `test-${Date.now()}`,
      subject: testSubject.trim() || "Diagnostika testi",
      score: testScore.trim(),
      maxScore: testMaxScore.trim() || "100",
      level: testLevel,
      note: testNote.trim(),
      testedAt: new Date().toISOString(),
    };

    const currentTests = Array.isArray(lead.testResults)
      ? lead.testResults
      : lead.customFields?.testResults || [];
    const updatedTests = [newTest, ...currentTests];

    try {
      const updatedLead = {
        ...lead,
        testResults: updatedTests,
        customFields: {
          ...(lead.customFields || {}),
          testResults: updatedTests,
        },
      };
      if (onUpdateLead) {
        await onUpdateLead(lead.id, updatedLead);
      }
      setTestScore("");
      setTestNote("");
      showToast("Test topshirish natijasi muvaffaqiyatli saqlandi! 🎯");
    } catch (err) {
      console.error("Test natijasini saqlashda xatolik:", err);
      setErrorMsg("Test natijasini saqlashda xatolik yuz berdi");
    } finally {
      setAddingTest(false);
    }
  }

  // 9. Handle Delete Test Result
  async function handleDeleteTest(testId) {
    const currentTests = Array.isArray(lead.testResults)
      ? lead.testResults
      : lead.customFields?.testResults || [];
    const updatedTests = currentTests.filter((t) => t.id !== testId);

    try {
      const updatedLead = {
        ...lead,
        testResults: updatedTests,
        customFields: {
          ...(lead.customFields || {}),
          testResults: updatedTests,
        },
      };
      if (onUpdateLead) {
        await onUpdateLead(lead.id, updatedLead);
      }
      showToast("Test natijasi o'chirildi");
    } catch (err) {
      console.error(err);
      setErrorMsg("O'chirishda xatolik");
    }
  }

  // Extract human-friendly value for field
  const getFieldValue = (field) => {
    const key = field.id || field.name;
    if (key === "name") return lead.name;
    if (key === "phone") return lead.phone;
    if (key === "phone2" || key === "parentPhone") return lead.phone2 || lead.parentPhone;
    if (key === "course_select" || key === "courseId" || key === "course") {
      return resolveCourseName(lead.courseId, lead.customFields?.course_select);
    }
    if (key === "group_dropdown" || key === "group_select" || key === "enrolledGroupId" || key === "groupId") {
      const grp = groups.find((g) => g.id === (lead.enrolledGroupId || lead.groupId || lead.customFields?.enrolledGroupId));
      return grp?.name || lead.enrolledGroupName || "Biriktirilmagan";
    }
    if (key === "grade") return lead.grade;
    if (key === "source") return currentSourceObj.label;
    if (key === "status") return currentStatusObj.label;
    if (key === "note" || key === "comment") return lead.note || lead.comment || lead.customFields?.comment || "";

    if (lead[key] !== undefined && lead[key] !== null && lead[key] !== "") {
      return lead[key];
    }
    if (lead.customFields && lead.customFields[key] !== undefined && lead.customFields[key] !== null) {
      return lead.customFields[key];
    }
    return "";
  };

  // Additional custom fields not explicitly in configured form fields
  const extraCustomFields = useMemo(() => {
    const raw = lead.customFields || {};
    const configuredKeys = (configuredFormFields || []).map((f) => f.id || f.name);
    const systemExcluded = [
      "interestLevel",
      "smsHistory",
      "testResults",
      "name",
      "phone",
      "phone2",
      "parentPhone",
      "grade",
      "courseId",
      "course_select",
      "courseName",
      "enrolledGroupId",
      "groupId",
      "note",
      "comment",
      "source",
      "status",
    ];

    return Object.entries(raw).filter(
      ([k, v]) =>
        !configuredKeys.includes(k) &&
        !systemExcluded.includes(k) &&
        v !== undefined &&
        v !== null &&
        v !== ""
    );
  }, [lead.customFields, configuredFormFields]);

  // Helper to render editable row
  const renderInlineEditableRow = (fieldKey, label, displayVal, isPhone = false, type = "text", options = null) => {
    const isCurrentlyEditing = editingKey === fieldKey;

    return (
      <div
        key={fieldKey}
        className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-800/80 last:border-b-0 gap-3 text-xs"
      >
        <span className="text-slate-500 dark:text-slate-400 font-medium shrink-0">
          {label}:
        </span>

        <div className="flex-1 max-w-[65%] text-right flex items-center justify-end gap-2">
          {isCurrentlyEditing ? (
            <div className="flex items-center gap-1.5 w-full justify-end animate-in fade-in">
              {type === "course_select" ? (
                <div className="w-full text-left">
                  <SearchableCourseSelect
                    courses={courses}
                    value={tempValue}
                    onChange={(cid) => {
                      saveInlineField(fieldKey, cid);
                    }}
                    placeholder="Kursni tanlang..."
                  />
                </div>
              ) : type === "select" ? (
                <select
                  autoFocus
                  value={tempValue}
                  onChange={(e) => {
                    setTempValue(e.target.value);
                    saveInlineField(fieldKey, e.target.value);
                  }}
                  onBlur={() => setEditingKey(null)}
                  className={`${INPUT_CLS} py-1 text-xs w-full`}
                >
                  <option value="">-- Tanlang --</option>
                  {(options || []).map((opt) => {
                    const optVal = typeof opt === "object" ? opt.id : opt;
                    const optLbl = typeof opt === "object" ? opt.name || opt.label : opt;
                    return (
                      <option key={optVal} value={optVal}>
                        {optLbl}
                      </option>
                    );
                  })}
                </select>
              ) : type === "group_select" ? (
                <div className="w-full text-left">
                  <SearchableGroupSelect
                    groups={groups}
                    courses={courses}
                    teachers={teachers}
                    students={opData?.students || directorData?.students || []}
                    value={tempValue}
                    onChange={(gid) => {
                      saveInlineField(fieldKey, gid);
                    }}
                    placeholder="Guruhni tanlang..."
                  />
                </div>
              ) : (
                <div className="flex items-center gap-1 w-full justify-end">
                  <input
                    type={type === "number" ? "number" : isPhone ? "tel" : "text"}
                    autoFocus
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveInlineField(fieldKey, tempValue);
                      if (e.key === "Escape") cancelInlineEdit();
                    }}
                    placeholder={`${label} kiriting`}
                    className={`${INPUT_CLS} py-1 text-xs ${isPhone ? "font-mono" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => saveInlineField(fieldKey, tempValue)}
                    className="p-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shrink-0"
                    title="Saqlash"
                  >
                    <Check size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={cancelInlineEdit}
                    className="p-1 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer shrink-0"
                    title="Bekor qilish"
                  >
                    <X size={13} />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span
                onClick={() => {
                  let rawCurrent = lead[fieldKey] ?? lead.customFields?.[fieldKey] ?? "";
                  if (fieldKey === "course_select" || fieldKey === "courseId" || fieldKey === "course") {
                    rawCurrent = lead.courseId || lead.customFields?.courseId || lead.customFields?.course_select || "";
                  }
                  if (fieldKey === "group_dropdown" || fieldKey === "group_select" || fieldKey === "groupId" || fieldKey === "enrolledGroupId") {
                    rawCurrent = lead.enrolledGroupId || lead.groupId || lead.customFields?.enrolledGroupId || "";
                  }
                  startInlineEdit(fieldKey, rawCurrent);
                }}
                className={`font-bold text-slate-900 dark:text-white hover:text-violet-600 dark:hover:text-violet-400 transition-colors cursor-pointer px-1.5 py-0.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 inline-flex items-center gap-1 group/item ${
                  isPhone ? "font-mono" : ""
                }`}
                title="O'zgartirish uchun bosing"
              >
                <span>{Array.isArray(displayVal) ? displayVal.join(", ") : String(displayVal || "—")}</span>
                <Edit3 size={11} className="opacity-0 group-hover/item:opacity-70 text-slate-400 shrink-0" />
              </span>

              {isPhone && displayVal && displayVal !== "—" && (
                <div className="flex items-center gap-1 shrink-0">
                  <a
                    href={`tel:${displayVal}`}
                    className="p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-emerald-600 transition-colors"
                    title="Qo'ng'iroq qilish"
                  >
                    <PhoneCall size={13} />
                  </a>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(displayVal, fieldKey)}
                    className="p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors cursor-pointer"
                    title="Nusxalash"
                  >
                    {copiedPhone === fieldKey ? (
                      <Check size={13} className="text-emerald-500" />
                    ) : (
                      <Copy size={13} />
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-150">
      
      {/* Toast Notifications */}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs font-bold flex items-center gap-2 shadow-xs animate-in fade-in">
          <AlertCircle size={16} className="text-rose-600 dark:text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* TWO DISTINCT MAIN BOXES (ONE BOX FOR PROFILE FORMA DATA, NEXT BOX FOR ACTIONS & TABS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ======================================================== */}
        {/* 1-BOX (LEFT): LIDNING FORMA BO'YICHA BARCHA MA'LUMOTLARI */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-5">
          
          {/* Header of Box 1 with Back button, Name + Primary Phone, and Quick Student Action */}
          <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <button
                type="button"
                onClick={onBack}
                className="p-2 mt-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shrink-0"
                title="Orqaga qaytish"
              >
                <ArrowLeft size={16} />
              </button>
              
              <div className="min-w-0 space-y-1.5">
                {/* NAME + ASOSIY TELEFON BIRGA */}
                <div className="flex items-center gap-2 flex-wrap">
                  {editingKey === "name" ? (
                    <div className="flex items-center gap-1 animate-in fade-in">
                      <input
                        type="text"
                        autoFocus
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveInlineField("name", tempValue);
                          if (e.key === "Escape") cancelInlineEdit();
                        }}
                        className={`${INPUT_CLS} py-1 text-sm font-black w-48`}
                        placeholder="Lid ismi"
                      />
                      <button
                        type="button"
                        onClick={() => saveInlineField("name", tempValue)}
                        className="p-1 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={cancelInlineEdit}
                        className="p-1 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <span
                      onClick={() => startInlineEdit("name", lead.name)}
                      className="text-base font-black text-slate-900 dark:text-white hover:text-violet-600 dark:hover:text-violet-400 transition-colors cursor-pointer inline-flex items-center gap-1 group/name"
                      title="Ismni tahrirlash uchun bosing"
                    >
                      <span>{lead.name || "Lid Ismi"}</span>
                      <Edit3 size={12} className="opacity-0 group-hover/name:opacity-70 text-slate-400" />
                    </span>
                  )}

                  {/* ASOSIY TELEFON RAQAMI ISMI YONIDA */}
                  {lead.phone && (
                    <div className="inline-flex items-center gap-1">
                      <a
                        href={`tel:${lead.phone}`}
                        className="text-xs font-mono font-bold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/70 hover:bg-violet-100 dark:hover:bg-violet-900/90 px-2.5 py-0.5 rounded-xl inline-flex items-center gap-1.5 transition-colors"
                        title="Qo'ng'iroq qilish"
                      >
                        <PhoneCall size={11} className="text-emerald-500" />
                        <span>{lead.phone}</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(lead.phone, "header-phone")}
                        className="p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        title="Nusxalash"
                      >
                        {copiedPhone === "header-phone" ? (
                          <Check size={12} className="text-emerald-500" />
                        ) : (
                          <Copy size={12} />
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* STATUS BADGE & SOURCE */}
                <div className="flex items-center gap-2">
                  <span
                    className="text-[11px] font-bold px-2 py-0.5 rounded-xl inline-flex items-center gap-1"
                    style={{
                      backgroundColor: `${currentStatusObj.color}15`,
                      color: currentStatusObj.color,
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: currentStatusObj.color }} />
                    {currentStatusObj.label}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {currentSourceObj.label}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {lead.status !== "student" && (
                <button
                  type="button"
                  onClick={handleConvertToStudent}
                  disabled={assigningGroup}
                  className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1 text-xs font-bold"
                  title="O'quvchi sifatida qabul qilish"
                >
                  {assigningGroup ? <RefreshCw size={15} className="animate-spin" /> : <GraduationCap size={15} />}
                  <span className="hidden sm:inline">Qabul qilish</span>
                </button>
              )}
            </div>
          </div>

          {/* DYNAMIC & INLINE EDITABLE FORM VALUES (CLICK VALUE TO EDIT) */}
          <div className="space-y-1 text-xs">
            <div className="text-[10px] text-slate-400 font-semibold mb-1">
              <span>Lid ma'lumotlari:</span>
            </div>

            {/* If configured form fields exist, render dynamically (excluding note / ariza izohi) */}
            {configuredFormFields.length > 0 ? (
              configuredFormFields
                .filter((f) => {
                  const fid = (f.id || f.name || "").toLowerCase();
                  const lbl = (f.label || "").toLowerCase();
                  return (
                    f.enabled !== false &&
                    fid !== "note" &&
                    fid !== "comment" &&
                    fid !== "ariza_izohi" &&
                    fid !== "izoh" &&
                    !lbl.includes("ariza izohi")
                  );
                })
                .map((field) => {
                  const fid = field.id || field.name;
                  const label = field.label || fid;
                  const val = getFieldValue(field);
                  const isPhoneField = fid === "phone" || fid === "phone2" || fid === "parentPhone";

                  if (fid === "course_select" || fid === "courseId" || fid === "course") {
                    return renderInlineEditableRow("course_select", label, currentCourseName, false, "select", courses);
                  }

                  if (fid === "group_dropdown" || fid === "group_select" || fid === "enrolledGroupId" || fid === "groupId") {
                    return renderInlineEditableRow("group_dropdown", label, selectedGroup?.name || lead.enrolledGroupName || "Biriktirilmagan", false, "group_select");
                  }

                  if (fid === "grade") {
                    return renderInlineEditableRow("grade", label, lead.grade || "Tanlanmagan", false, "select", GRADE_OPTIONS);
                  }

                  if (fid === "source") {
                    return renderInlineEditableRow("source", label, currentSourceObj.label, false, "select", LEAD_SOURCES);
                  }

                  if (field.type === "single_select" || field.type === "radio") {
                    return renderInlineEditableRow(fid, label, val || "Tanlanmagan", false, "select", field.options || []);
                  }

                  return renderInlineEditableRow(
                    fid,
                    label,
                    val,
                    isPhoneField,
                    field.type === "number" ? "number" : "text"
                  );
                })
            ) : (
              /* Fallback standard fields if no form configuration */
              <>
                {renderInlineEditableRow("name", "To'liq ismi", lead.name)}
                {renderInlineEditableRow("phone", "1-Telefon (Asosiy)", lead.phone, true)}
                {renderInlineEditableRow("phone2", "2-Telefon (Ota-onasi)", lead.phone2 || lead.parentPhone, true)}
                {renderInlineEditableRow("course_select", "Qiziqqan kursi", currentCourseName, false, "select", courses)}
                {renderInlineEditableRow("group_dropdown", "Guruh", selectedGroup?.name || lead.enrolledGroupName || "Biriktirilmagan", false, "group_select")}
                {renderInlineEditableRow("grade", "Sinfi / Darajasi", lead.grade || "Tanlanmagan", false, "select", GRADE_OPTIONS)}
                {renderInlineEditableRow("source", "Kelish manbasi", currentSourceObj.label, false, "select", LEAD_SOURCES)}
              </>
            )}

            {/* Extra Custom Fields filled from online forms */}
            {extraCustomFields.length > 0 && (
              <div className="pt-3 space-y-1">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                  <Sparkles size={11} className="text-violet-500" />
                  Qo'shimcha javoblar
                </div>
                {extraCustomFields.map(([k, v]) =>
                  renderInlineEditableRow(k, k, v)
                )}
              </div>
            )}

            {/* System Metadata Details */}
            <div className="pt-3 space-y-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center justify-between">
                <span>Ariza kelgan sana:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {lead.createdAt ? new Date(lead.createdAt).toLocaleString("uz-UZ") : "Bugun"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Biriktirilgan guruh:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {selectedGroup ? selectedGroup.name : (lead.enrolledGroupName || "Biriktirilmagan")}
                </span>
              </div>
            </div>

            {/* Delete Lead Button */}
            {onDeleteLead && (
              <div className="pt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Haqiqatan ham bu lidni o'chirmoqchimisiz?")) {
                      onDeleteLead(lead.id);
                      onBack();
                    }
                  }}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-1.5 p-1 transition-colors cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Lidni o'chirish</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2-BOX (RIGHT): TOP MENUS & TABS (IZOHLAR, SMS, DARAJA, TEST) */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-5">
          
          {/* Top Menu Tabs inside Box 2 */}
          <div className="border-b border-slate-100 dark:border-slate-800 pb-0">
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
              
              {/* Tab 1: Izohlar */}
              <button
                type="button"
                onClick={() => setActiveTab("izohlar")}
                className={`pb-3 px-2 text-xs font-extrabold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "izohlar"
                    ? "border-violet-600 text-violet-600 dark:text-violet-400"
                    : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <MessageSquare size={15} />
                <span>Izohlar</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold">
                  {localComments.length}
                </span>
              </button>

              {/* Tab 2: SMS */}
              <button
                type="button"
                onClick={() => setActiveTab("sms")}
                className={`pb-3 px-2 text-xs font-extrabold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "sms"
                    ? "border-violet-600 text-violet-600 dark:text-violet-400"
                    : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Send size={15} />
                <span>SMS</span>
                {smsHistory.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-bold">
                    {smsHistory.length}
                  </span>
                )}
              </button>

              {/* Tab 3: Daraja & Bosqich */}
              <button
                type="button"
                onClick={() => setActiveTab("daraja")}
                className={`pb-3 px-2 text-xs font-extrabold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "daraja"
                    ? "border-violet-600 text-violet-600 dark:text-violet-400"
                    : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Flame size={15} />
                <span>Daraja & Bosqich</span>
              </button>

              {/* Tab 4: Test natijalari */}
              <button
                type="button"
                onClick={() => setActiveTab("test")}
                className={`pb-3 px-2 text-xs font-extrabold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "test"
                    ? "border-violet-600 text-violet-600 dark:text-violet-400"
                    : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Award size={15} />
                <span>Test natijalari</span>
                {testResultsList.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                    {testResultsList.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* TAB CONTENTS */}
          <div>
            
            {/* ======================================================== */}
            {/* TAB 1: IZOHLAR (AUTOMATIC CURRENT TIME STAMPING) */}
            {/* ======================================================== */}
            {activeTab === "izohlar" && (
              <div className="space-y-5">
                
                {/* Clean Input Form */}
                <form onSubmit={handleAddComment} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Yangi izoh qoldirish:
                    </label>
                    <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                      <Clock size={12} className="text-violet-500" />
                      Avtomatik vaqt belgilanadi (Bugun)
                    </span>
                  </div>

                  <textarea
                    rows={3}
                    required
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Mijoz bilan suhbat natijasi, kelishilgan vaqt yoki yangi izoh yozing..."
                    className={`${INPUT_CLS} text-xs leading-relaxed`}
                  />

                  <div className="flex items-center justify-end pt-1">
                    <PrimaryButton type="submit" disabled={addingComment || !newCommentText.trim()}>
                      {addingComment ? (
                        <RefreshCw size={14} className="animate-spin" />
                      ) : (
                        <Plus size={14} />
                      )}
                      <span>Izoh qoldirish</span>
                    </PrimaryButton>
                  </div>
                </form>

                <div className="border-t border-slate-100 dark:border-slate-800" />

                {/* Timeline Stream */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">
                    Xronologiya va Izohlar ({localComments.length})
                  </h3>

                  <div className="space-y-2.5">
                    {localComments.map((comm, idx) => {
                      const commDate = comm.createdAt ? new Date(comm.createdAt) : new Date();
                      const formattedDate = !isNaN(commDate.getTime())
                        ? commDate.toLocaleString("uz-UZ", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Hozirgina";

                      return (
                        <div
                          key={comm.id || `c-${idx}`}
                          className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 transition-all hover:border-violet-200 dark:hover:border-violet-800 group"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900 dark:text-white">
                                {comm.author || "Manager"}
                              </span>
                              <span className="text-[11px] text-slate-400 font-mono">
                                {formattedDate}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeleteComment(comm.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded-xl transition-all cursor-pointer"
                              title="O'chirish"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>

                          <p className="text-xs text-slate-700 dark:text-slate-300 mt-2 leading-relaxed whitespace-pre-wrap break-words">
                            {comm.text}
                          </p>
                        </div>
                      );
                    })}

                    {localComments.length === 0 && (
                      <p className="py-8 text-center text-xs text-slate-400">
                        Hozircha izohlar mavjud emas
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 2: SMS YUBORISH */}
            {/* ======================================================== */}
            {activeTab === "sms" && (
              <div className="space-y-5">
                <form onSubmit={handleSendSms} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1.5">
                      Qaysi raqamga SMS jo'natiladi?
                    </label>
                    <div className="flex items-center gap-3 flex-wrap">
                      <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-slate-700 dark:text-slate-300">
                        <input
                          type="radio"
                          name="recipient"
                          checked={selectedRecipient === "p1"}
                          onChange={() => setSelectedRecipient("p1")}
                          className="text-violet-600 focus:ring-violet-500"
                        />
                        <span>1-Telefon: <strong className="font-mono">{lead.phone || "Mavjud emas"}</strong></span>
                      </label>

                      {(lead.phone2 || lead.parentPhone) && (
                        <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-slate-700 dark:text-slate-300">
                          <input
                            type="radio"
                            name="recipient"
                            checked={selectedRecipient === "p2"}
                            onChange={() => setSelectedRecipient("p2")}
                            className="text-violet-600 focus:ring-violet-500"
                          />
                          <span>2-Telefon (Ota-onasi): <strong className="font-mono">{lead.phone2 || lead.parentPhone}</strong></span>
                        </label>
                      )}
                    </div>
                  </div>

                  {/* SMS Quick Templates */}
                  <div>
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1.5">
                      Tayyor shablonlar:
                    </label>
                    <div className="flex items-center gap-2 flex-wrap">
                      {SMS_TEMPLATES.map((tmpl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSmsText(tmpl.text)}
                          className="text-xs px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-violet-50 dark:hover:bg-violet-950 text-slate-700 dark:text-slate-300 hover:text-violet-600 border border-slate-200 dark:border-slate-700 transition-colors font-medium cursor-pointer"
                        >
                          {tmpl.title}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        SMS matni:
                      </label>
                      <span className="text-[11px] font-mono text-slate-400">
                        {smsText.length} belgi ({Math.ceil((smsText.length || 1) / 160)} SMS)
                      </span>
                    </div>
                    <textarea
                      rows={4}
                      required
                      value={smsText}
                      onChange={(e) => setSmsText(e.target.value)}
                      placeholder="Mijozga yuboriladigan SMS matnini yozing..."
                      className={`${INPUT_CLS} text-xs leading-relaxed`}
                    />
                  </div>

                  <div className="flex justify-end">
                    <PrimaryButton type="submit" disabled={sendingSms || !smsText.trim()}>
                      {sendingSms ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                      <span>SMS Jo'natish</span>
                    </PrimaryButton>
                  </div>
                </form>

                <div className="border-t border-slate-100 dark:border-slate-800" />

                {/* Sent SMS History */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">
                    Yuborilgan SMSlar tarixi ({smsHistory.length})
                  </h3>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {smsHistory.map((s) => (
                      <div key={s.id} className="py-3 first:pt-0 last:pb-0 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold font-mono text-slate-900 dark:text-white">
                            {s.recipientPhone} ({s.recipientType})
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {new Date(s.sentAt).toLocaleString("uz-UZ")}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                          {s.text}
                        </p>
                      </div>
                    ))}

                    {smsHistory.length === 0 && (
                      <p className="py-6 text-center text-xs text-slate-400">
                        Hozircha yuborilgan SMSlar yo'q
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 3: DARAJA & PIPELINE BOSQICHI */}
            {/* ======================================================== */}
            {activeTab === "daraja" && (
              <div className="space-y-5">
                {/* Interest Level */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Lidning Qiziqish Darajasi:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {INTEREST_LEVELS.map((lvl) => (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => handleInterestChange(lvl.id)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          interestLevel === lvl.id
                            ? `${lvl.color} ring-2 ring-violet-500/20`
                            : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-xs font-black">
                          <span>{lvl.icon}</span>
                          <span>{lvl.label}</span>
                        </div>
                        <p className="text-[11px] mt-1 opacity-80 leading-snug">
                          {lvl.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800" />

                {/* Pipeline Stage Buttons */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Pipeline Holati (Bosqich):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {LEAD_STATUSES.map((st) => {
                      const isActive = lead.status === st.id;
                      return (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => handleStatusChange(st.id)}
                          className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-left flex items-center gap-2 cursor-pointer ${
                            isActive
                              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-xs"
                              : "bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: st.color }} />
                          <span className="truncate">{st.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800" />

                {/* Group Assignment in Stage tab */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      Biriktirilgan Guruh:
                    </label>
                    {selectedGroup && (
                      <span className="text-xs font-bold text-violet-600 dark:text-violet-400">
                        {selectedGroup.name} ({selectedGroup.time || "Vaqti ko'rsatilmagan"})
                      </span>
                    )}
                  </div>

                  <SearchableGroupSelect
                    groups={groups}
                    courses={courses}
                    teachers={teachers}
                    students={opData?.students || directorData?.students || []}
                    value={currentGroupId}
                    onChange={(gid) => handleGroupSelect(gid)}
                    placeholder="Guruhni qidirish yoki tanlash..."
                  />

                  {lead.status !== "student" && (
                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={handleConvertToStudent}
                        disabled={assigningGroup}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-2"
                      >
                        <GraduationCap size={15} />
                        <span>O'quvchi sifatida rasmiylashtirish</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 4: TEST TOPSHIRISH NATIJALARI */}
            {/* ======================================================== */}
            {activeTab === "test" && (
              <div className="space-y-5">
                {/* Form to enter test results */}
                <form onSubmit={handleAddTestResult} className="space-y-3.5">
                  <label className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
                    Yangi test / Imtihon natijasini kiritish:
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">Fan / Test turi</label>
                      <input
                        type="text"
                        required
                        value={testSubject}
                        onChange={(e) => setTestSubject(e.target.value)}
                        placeholder="Ingliz tili Placement"
                        className={INPUT_CLS}
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">To'plangan ball / Max</label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          required
                          value={testScore}
                          onChange={(e) => setTestScore(e.target.value)}
                          placeholder="Ball (masalan: 75)"
                          className={INPUT_CLS}
                        />
                        <span className="text-slate-400 font-bold">/</span>
                        <input
                          type="number"
                          value={testMaxScore}
                          onChange={(e) => setTestMaxScore(e.target.value)}
                          placeholder="100"
                          className={`${INPUT_CLS} w-20`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">Aniqlangan daraja</label>
                      <select
                        value={testLevel}
                        onChange={(e) => setTestLevel(e.target.value)}
                        className={INPUT_CLS}
                      >
                        {TEST_LEVELS.map((tl) => (
                          <option key={tl} value={tl}>{tl}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">O'qituvchi / Tester tavsiyasi</label>
                    <input
                      type="text"
                      value={testNote}
                      onChange={(e) => setTestNote(e.target.value)}
                      placeholder="Masalan: Elementary guruhiga to'g'ri keladi"
                      className={INPUT_CLS}
                    />
                  </div>

                  <div className="flex justify-end">
                    <PrimaryButton type="submit" disabled={addingTest || !testScore.trim()}>
                      {addingTest ? <RefreshCw size={14} className="animate-spin" /> : <Plus size={14} />}
                      <span>Natijani saqlash</span>
                    </PrimaryButton>
                  </div>
                </form>

                <div className="border-t border-slate-100 dark:border-slate-800" />

                {/* List of past tests */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">
                    Topshirilgan testlar ro'yxati ({testResultsList.length})
                  </h3>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {testResultsList.map((tr) => (
                      <div key={tr.id} className="py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-4 group">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-black text-slate-900 dark:text-white">
                              {tr.subject}
                            </span>
                            <span className="text-xs font-black px-2 py-0.5 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                              {tr.score} / {tr.maxScore || 100} ball
                            </span>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-xl bg-violet-100 text-violet-800 dark:bg-violet-950/80 dark:text-violet-300">
                              {tr.level}
                            </span>
                          </div>
                          {tr.note && (
                            <p className="text-xs text-slate-600 dark:text-slate-300">
                              {tr.note}
                            </p>
                          )}
                          <p className="text-[11px] text-slate-400 font-mono">
                            {new Date(tr.testedAt).toLocaleDateString("uz-UZ")}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteTest(tr.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded-xl transition-all cursor-pointer"
                          title="Natijani o'chirish"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}

                    {testResultsList.length === 0 && (
                      <p className="py-8 text-center text-xs text-slate-400">
                        Hozircha test topshirish natijalari kiritilmagan
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

import { useState, useMemo, useEffect } from "react";
import {
  UserPlus,
  UserX,
  TrendingUp,
  Sparkles,
  Search,
  Filter,
  Plus,
  Phone,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Copy,
  ExternalLink,
  RefreshCw,
  MessageSquare,
  BookOpen,
  Share2,
  Layers,
  ChevronRight,
  PieChart as PieChartIcon,
  LayoutGrid,
  List,
  Pencil,
  GripVertical,
  Users,
  AlertTriangle,
  ChevronDown,
  GraduationCap,
  School,
  ArrowLeft,
  UserCheck,
  Sliders,
  Settings,
  Hash,
  Type,
  CheckSquare,
  ListFilter,
  Radio as RadioIcon,
  AlignLeft,
} from "lucide-react";
import { LEAD_STATUSES } from "../../../shared/constants/finance";
import { INPUT_CLS, LABEL_CLS, GLASS, PrimaryButton } from "../theme/tokens";
import { addStudent, updateStudent } from "../../../shared/api";
import { LeadProfilePage } from "./LeadProfilePage";
import { SearchableGroupSelect } from "../../../shared/components/SearchableGroupSelect";
import { SearchableCourseSelect } from "../../../shared/components/SearchableCourseSelect";
import {
  LeadFormSettingsBuilder,
  getSavedLeadFormFields,
} from "../components/LeadFormSettingsBuilder";

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

const REJECTION_REASONS = [
  "Narx qimmatlik qildi",
  "Dars vaqti mos kelmadi",
  "Joylashuv / Manzil uzoq",
  "Boshqa o'quv markazni tanladi",
  "O'qituvchi va sifati to'g'ri kelmadi",
  "Muloqotga chiqmadi / Javob bermadi",
  "Vaqtincha o'qishni kechiktirdi",
  "Boshqa sabab",
];

const LEAD_SOURCES = [
  { id: "instagram", label: "Instagram", color: "#E1306C" },
  { id: "telegram", label: "Telegram Bot / Kanal", color: "#0088CC" },
  { id: "website", label: "Veb-sayt ariza", color: "#10B981" },
  { id: "reklama", label: "Ijtimoiy tarmoq reklamasi", color: "#F59E0B" },
  { id: "tavsiya", label: "Tanish / Tavsiya", color: "#8B5CF6" },
  { id: "boshqa", label: "Boshqa Manba", color: "#64748B" },
];

export function LeadsPage({
  activeSubView,
  subView,
  directorData,
  opData,
  scopeBranches = [],
  onAddLead,
  onUpdateLead,
  onDeleteLead,
  onSaveLead,
  openAddStudentFromLead,
  goTo,
}) {
  const effectivePropSubView = subView || activeSubView || "leads";
  const [activeTab, setActiveTab] = useState(effectivePropSubView);
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [kanbanMode, setKanbanMode] = useState(true);

  // Full Page Lead Profile state
  const [selectedLeadId, setSelectedLeadId] = useState(null);

  // Close profile page & sync sub-view tab whenever sidebar sub-menu or subView/activeSubView changes
  useEffect(() => {
    const target = subView || activeSubView;
    if (target) {
      setActiveTab(target);
      setSelectedLeadId(null);
    }
  }, [subView, activeSubView]);

  const currentView = activeTab || effectivePropSubView || "leads";

  const handleTabSwitch = (newTab) => {
    setActiveTab(newTab);
    setSelectedLeadId(null);
    if (goTo) {
      goTo(newTab);
    }
  };

  const effectiveAddLead = onAddLead || onSaveLead;
  const effectiveUpdateLead = onUpdateLead || onSaveLead;
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLeadForm, setEditLeadForm] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(null); // leadObj
  const [rejectionReason, setRejectionReason] = useState(REJECTION_REASONS[0]);
  const [rejectionNote, setRejectionNote] = useState("");
  const [formErrorMsg, setFormErrorMsg] = useState("");

  // Assign to group modal / dropdown state
  const [showAssignGroupModal, setShowAssignGroupModal] = useState(null); // leadObj
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [assigningGroup, setAssigningGroup] = useState(false);
  const [assignSuccessMsg, setAssignSuccessMsg] = useState("");

  // Drag and drop states
  const [draggedLeadId, setDraggedLeadId] = useState(null);
  const [dragOverStatus, setDragOverStatus] = useState(null);

  // Form Builder fields state
  const [configuredFormFields, setConfiguredFormFields] = useState(() =>
    getSavedLeadFormFields()
  );

  // Lead Form state (2 MANDATORY PHONES, GRADE, GROUP DROPDOWN + dynamic custom fields)
  const [leadForm, setLeadForm] = useState({
    name: "",
    phone: "+998 ",
    phone2: "+998 ",
    grade: "",
    enrolledGroupId: "",
    courseId: "",
    source: "instagram",
    note: "",
    customFields: {},
  });

  // Public Form Generator Settings
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [testFormSubmitted, setTestFormSubmitted] = useState(false);
  const [publicFormData, setPublicFormData] = useState({});

  const leads = directorData?.leads || opData?.leads || [];
  const courses = directorData?.courses || opData?.courses || [];
  const teachers = directorData?.teachers || opData?.teachers || [];
  const groups = opData?.groups || directorData?.groups || [];
  const rooms = directorData?.rooms || opData?.rooms || [];
  const managers = directorData?.managers || opData?.managers || [];

  // Currently selected lead for full profile view
  const selectedLead = leads.find((l) => l.id === selectedLeadId);

  // Filtered leads
  const activeLeads = leads.filter(
    (l) => l.status !== "rejected" && l.status !== "lost"
  );
  const lostLeads = leads.filter(
    (l) => l.status === "rejected" || l.status === "lost"
  );

  const filteredActiveLeads = activeLeads.filter((l) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (l.name || "").toLowerCase().includes(term) ||
      (l.phone || "").includes(searchTerm) ||
      (l.phone2 || "").includes(searchTerm) ||
      (l.parentPhone || "").includes(searchTerm) ||
      (l.grade || "").toLowerCase().includes(term);
    const matchesSource = sourceFilter === "all" || l.source === sourceFilter;
    return matchesSearch && matchesSource;
  });

  const filteredLostLeads = lostLeads.filter((l) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (l.name || "").toLowerCase().includes(term) ||
      (l.phone || "").includes(searchTerm) ||
      (l.phone2 || "").includes(searchTerm) ||
      (l.parentPhone || "").includes(searchTerm) ||
      (l.grade || "").toLowerCase().includes(term);
    const matchesSource = sourceFilter === "all" || l.source === sourceFilter;
    return matchesSearch && matchesSource;
  });

  // Analytics Metrics
  const totalLeadsCount = leads.length;
  const convertedCount = leads.filter((l) => l.status === "student").length;
  const conversionRate =
    totalLeadsCount > 0 ? ((convertedCount / totalLeadsCount) * 100).toFixed(1) : "0.0";
  const unansweredCount = leads.filter((l) => l.status === "new").length;
  const lostCount = lostLeads.length;

  const handleAddSubmit = (e) => {
    e.preventDefault();
    setFormErrorMsg("");

    // 1. Dynamic field extraction from leadForm and customFields
    let leadName = (leadForm.name || "").trim();
    let leadPhone = (leadForm.phone || "").trim();
    let leadPhone2 = (leadForm.phone2 || "").trim();
    let leadGrade = (leadForm.grade || "").trim();
    let leadCourseId = leadForm.courseId || null;
    let leadEnrolledGroupId = leadForm.enrolledGroupId || null;
    let leadNote = (leadForm.note || "").trim();

    // Check customFields for any fallback keys
    if (leadForm.customFields && typeof leadForm.customFields === "object") {
      for (const [key, val] of Object.entries(leadForm.customFields)) {
        if (val === undefined || val === null) continue;
        const lowerKey = key.toLowerCase();
        const strVal = typeof val === "string" ? val.trim() : String(val);

        if (!leadName && (lowerKey.includes("name") || lowerKey.includes("ism") || lowerKey.includes("familiya"))) {
          leadName = strVal;
        }
        if ((!leadPhone || leadPhone === "+998" || leadPhone === "+998 ") && (lowerKey === "phone" || lowerKey.includes("1-telefon") || lowerKey.includes("asosiy"))) {
          leadPhone = strVal;
        }
        if ((!leadPhone2 || leadPhone2 === "+998" || leadPhone2 === "+998 ") && (lowerKey === "phone2" || lowerKey.includes("2-telefon") || lowerKey.includes("parent") || lowerKey.includes("ota"))) {
          leadPhone2 = strVal;
        }
        if (!leadGrade && (lowerKey.includes("grade") || lowerKey.includes("sinf"))) {
          leadGrade = strVal;
        }
        if (!leadCourseId && (lowerKey.includes("course") || lowerKey.includes("kurs"))) {
          leadCourseId = strVal;
        }
        if (!leadEnrolledGroupId && (lowerKey.includes("group") || lowerKey.includes("guruh"))) {
          leadEnrolledGroupId = strVal;
        }
        if (!leadNote && (lowerKey.includes("note") || lowerKey.includes("izoh") || lowerKey.includes("comment"))) {
          leadNote = strVal;
        }
      }
    }

    // Validation: Name is mandatory
    if (!leadName) {
      setFormErrorMsg("Iltimos, mijoz ismi va familiyasini kiriting!");
      return;
    }

    // Check required fields from configuredFormFields
    const activeFields = configuredFormFields.filter((f) => f.enabled !== false);
    for (const field of activeFields) {
      if (field.required) {
        const fieldKey = field.id || field.name;
        let val = leadForm[field.name];
        if (val === undefined || val === null || val === "") {
          val = leadForm.customFields?.[fieldKey] !== undefined ? leadForm.customFields[fieldKey] : leadForm.customFields?.[field.name];
        }

        const isName = field.name === "name" || field.id === "name" || field.label?.toLowerCase().includes("ism");
        const isP1 = field.name === "phone" || field.id === "phone" || field.label?.toLowerCase().includes("1-telefon");
        const isP2 = field.name === "phone2" || field.id === "phone2" || field.label?.toLowerCase().includes("2-telefon");

        if (isName && !leadName) {
          setFormErrorMsg(`"${field.label}" maydonini to'ldirish shart!`);
          return;
        }
        if (isP1) {
          const p = (leadPhone || "").trim();
          if (!p || p === "+998" || p === "+998 " || p.replace(/[^0-9]/g, "").length < 7) {
            setFormErrorMsg(`"${field.label}" to'liq kiritilishi shart!`);
            return;
          }
        }
        if (isP2) {
          const p2 = (leadPhone2 || "").trim();
          if (!p2 || p2 === "+998" || p2 === "+998 " || p2.replace(/[^0-9]/g, "").length < 7) {
            setFormErrorMsg(`"${field.label}" to'liq kiritilishi shart!`);
            return;
          }
        }
        if (!isName && !isP1 && !isP2) {
          if (val === undefined || val === null || (typeof val === "string" && !val.trim()) || (Array.isArray(val) && val.length === 0)) {
            setFormErrorMsg(`"${field.label}" maydonini to'ldirish shart!`);
            return;
          }
        }
      }
    }

    const cleanP1 = leadPhone || "+998";
    const cleanP2 = leadPhone2 || "";
    const targetGroup = groups.find((g) => g.id === leadEnrolledGroupId);
    const targetCourse = courses.find((c) => c.id === (leadCourseId || targetGroup?.courseId));

    if (effectiveAddLead) {
      effectiveAddLead({
        name: leadName,
        phone: cleanP1,
        phone2: cleanP2,
        parentPhone: cleanP2,
        grade: leadGrade,
        courseId: leadCourseId || targetGroup?.courseId || null,
        courseName: targetCourse?.name || "",
        enrolledGroupId: leadEnrolledGroupId || null,
        enrolledGroupName: targetGroup?.name || "",
        source: leadForm.source || "instagram",
        note: leadNote,
        customFields: {
          ...leadForm.customFields,
          name: leadName,
          phone: cleanP1,
          phone2: cleanP2,
          grade: leadGrade,
        },
        status: "new",
        createdAt: new Date().toISOString(),
        comments: leadNote ? [
          {
            id: `comment-${Date.now()}`,
            text: leadNote,
            type: "note",
            author: "Manager",
            createdAt: new Date().toISOString(),
          }
        ] : [],
      });
    }

    setLeadForm({
      name: "",
      phone: "+998 ",
      phone2: "+998 ",
      grade: "",
      enrolledGroupId: "",
      courseId: "",
      source: "instagram",
      note: "",
      customFields: {},
    });
    setShowAddModal(false);
  };

  const handleEditOpen = (lead) => {
    setFormErrorMsg("");
    setEditLeadForm({
      id: lead.id,
      name: lead.name || "",
      phone: lead.phone || "",
      phone2: lead.phone2 || lead.parentPhone || "",
      grade: lead.grade || "",
      enrolledGroupId: lead.enrolledGroupId || lead.groupId || "",
      source: lead.source || "instagram",
      status: lead.status || "new",
      note: lead.note || "",
      branchId: lead.branchId || null,
      directorId: lead.directorId || null,
      formId: lead.formId || null,
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setFormErrorMsg("");
    if (!editLeadForm || !editLeadForm.name) return;

    const cleanP1 = (editLeadForm.phone || "").trim();
    const cleanP2 = (editLeadForm.phone2 || "").trim();
    if (!cleanP1 || cleanP1 === "+998" || cleanP1.length < 9) {
      setFormErrorMsg("1-asosiy telefon raqami to'liq kiritilishi shart!");
      return;
    }
    if (!cleanP2 || cleanP2 === "+998" || cleanP2.length < 9) {
      setFormErrorMsg("2-telefon raqami (ota-onasi / qo'shimcha) kiritilishi MAJBURIY!");
      return;
    }

    const targetGroup = groups.find((g) => g.id === editLeadForm.enrolledGroupId);

    if (effectiveUpdateLead) {
      effectiveUpdateLead(editLeadForm.id, {
        ...editLeadForm,
        name: editLeadForm.name.trim(),
        phone: cleanP1,
        phone2: cleanP2,
        parentPhone: cleanP2,
        enrolledGroupId: editLeadForm.enrolledGroupId || null,
        enrolledGroupName: targetGroup?.name || "",
      });
    }
    setShowEditModal(false);
    setEditLeadForm(null);
  };

  const getLeadEnrolledInfo = (lead) => {
    if (!lead) return null;
    // 1. Direct from lead fields
    if (lead.enrolledGroupName) {
      return { groupId: lead.enrolledGroupId, groupName: lead.enrolledGroupName };
    }
    if (lead.enrolledGroupId) {
      const grp = (opData?.groups || []).find((g) => g.id === lead.enrolledGroupId);
      if (grp) return { groupId: grp.id, groupName: grp.name };
    }

    // 2. Lookup in opData.students by phone
    const rawPhone = (lead.phone || "").replace(/[^0-9]/g, "");
    if (rawPhone && rawPhone.length >= 7) {
      const student = (opData?.students || []).find((s) => {
        const sPhone = (s.phone || "").replace(/[^0-9]/g, "");
        return sPhone && (sPhone.endsWith(rawPhone.slice(-7)) || rawPhone.endsWith(sPhone.slice(-7)));
      });
      if (student && student.groupIds && student.groupIds.length > 0) {
        const sGids = student.groupIds.map(String);
        const grp = (opData?.groups || []).find((g) => sGids.includes(String(g.id)));
        if (grp) return { groupId: grp.id, groupName: grp.name };
      }
    }

    return null;
  };

  const handleStatusChange = (leadId, nextStatus) => {
    const targetLead = leads.find((l) => l.id === leadId);
    if (!targetLead) return;

    if (nextStatus === "student") {
      // Open group selection modal to assign directly to a group
      handleOpenAssignGroup(targetLead);
      return;
    }

    if (targetLead.status === nextStatus) return;
    if (effectiveUpdateLead) {
      effectiveUpdateLead(leadId, {
        ...targetLead,
        status: nextStatus,
      });
    }
  };

  const handleOpenAssignGroup = (lead) => {
    setShowAssignGroupModal(lead);
    const currentEnrolled = getLeadEnrolledInfo(lead);
    if (currentEnrolled?.groupId) {
      setSelectedGroupId(currentEnrolled.groupId);
    } else {
      const matchedGroup = (opData?.groups || []).find(
        (g) => g.courseId === lead.courseId
      );
      setSelectedGroupId(matchedGroup ? matchedGroup.id : (opData?.groups?.[0]?.id || ""));
    }
  };

  const handleAssignToGroupSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!showAssignGroupModal || !selectedGroupId) return;

    setAssigningGroup(true);
    const lead = showAssignGroupModal;
    const targetGroup = (opData?.groups || []).find((g) => g.id === selectedGroupId);

    try {
      // 1. Update lead status to 'student' and save enrolledGroupId
      if (effectiveUpdateLead) {
        await effectiveUpdateLead(lead.id, {
          ...lead,
          status: "student",
          enrolledGroupId: selectedGroupId,
          enrolledGroupName: targetGroup?.name || "",
          enrolledAt: new Date().toISOString(),
        });
      }

      // 2. Check if student already exists or create new student and add to group
      const existingStudents = opData?.students || [];
      const normalizedPhone = (lead.phone || "").replace(/\s+/g, "");
      let existingStudent = existingStudents.find(
        (s) => (s.phone || "").replace(/\s+/g, "") === normalizedPhone
      );

      if (existingStudent) {
        const mergedGroupIds = [...new Set([...(existingStudent.groupIds || []), selectedGroupId])];
        await updateStudent(existingStudent.id, { groupIds: mergedGroupIds });
      } else {
        await addStudent({
          name: lead.name,
          phone: lead.phone,
          status: "active",
          groupIds: [selectedGroupId],
          branchId: lead.branchId || targetGroup?.branchId || directorData?.branches?.[0]?.id || null,
          note: `Liddan qo'shildi (${lead.source || "CRM"}). ${lead.note || ""}`.trim(),
          createdAt: new Date().toISOString(),
        });
      }

      setAssignSuccessMsg(`"${lead.name}" muvaffaqiyatli "${targetGroup?.name || 'Guruh'}"ga qo'shildi!`);
      setTimeout(() => {
        setAssignSuccessMsg("");
        setShowAssignGroupModal(null);
        setSelectedGroupId("");
      }, 1500);
    } catch (err) {
      console.error("Guruhga qo'shishda xatolik:", err);
      setShowAssignGroupModal(null);
    } finally {
      setAssigningGroup(false);
    }
  };

  const handleRejectConfirm = () => {
    if (!showRejectModal) return;
    if (effectiveUpdateLead) {
      effectiveUpdateLead(showRejectModal.id, {
        ...showRejectModal,
        status: "rejected",
        rejectionReason: rejectionReason,
        rejectionNote: rejectionNote,
        rejectedAt: new Date().toISOString(),
      });
    }
    setShowRejectModal(null);
    setRejectionNote("");
  };

  const handleRestoreLead = (lead) => {
    if (effectiveUpdateLead) {
      effectiveUpdateLead(lead.id, {
        ...lead,
        status: "new",
        rejectionReason: null,
        rejectionNote: null,
      });
    }
  };

  const handleTestFormSubmit = (e) => {
    e.preventDefault();
    const activeFields = configuredFormFields.filter((f) => f.enabled !== false);
    
    // Check required fields
    for (const f of activeFields) {
      const key = f.id || f.name;
      if (f.required) {
        const val = publicFormData[key] !== undefined ? publicFormData[key] : publicFormData[f.name];
        if (
          val === undefined ||
          val === null ||
          (typeof val === "string" && !val.trim()) ||
          (Array.isArray(val) && val.length === 0)
        ) {
          alert(`"${f.label}" maydonini to'ldirish majburiy!`);
          return;
        }
      }
    }

    const leadName = (publicFormData.name || publicFormData["name"] || "Yangi Onlayn Lid").trim();
    const leadPhone = (publicFormData.phone || publicFormData["phone"] || "+998 ").trim();
    const leadPhone2 = (publicFormData.phone2 || publicFormData["phone2"] || "").trim();

    if (effectiveAddLead) {
      effectiveAddLead({
        name: leadName,
        phone: leadPhone,
        phone2: leadPhone2,
        parentPhone: leadPhone2,
        courseId: publicFormData.courseId || publicFormData["course_select"] || null,
        enrolledGroupId: publicFormData.enrolledGroupId || null,
        grade: publicFormData.grade || "",
        source: "website_form",
        note: `Onlayn veb-forma orqali qabul qilingan ariza. ${publicFormData.comment || publicFormData.note || ""}`.trim(),
        customFields: { ...publicFormData },
        status: "new",
        createdAt: new Date().toISOString(),
      });
    }

    setTestFormSubmitted(true);
    setTimeout(() => {
      setTestFormSubmitted(false);
      setPublicFormData({});
    }, 3500);
  };

  const formShareUrl = `${window.location.origin}/apply-form`;
  const formEmbedCode = `<iframe src="${formShareUrl}" width="100%" height="600" frameborder="0"></iframe>`;

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === "link") {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      setCopiedEmbed(true);
      setTimeout(() => setCopiedEmbed(false), 2000);
    }
  };

  // IF A LEAD IS SELECTED, RENDER FULL PAGE LEAD PROFILE
  if (selectedLeadId && selectedLead) {
    return (
      <LeadProfilePage
        lead={selectedLead}
        directorData={directorData}
        opData={opData}
        onUpdateLead={onUpdateLead}
        onDeleteLead={onDeleteLead}
        onBack={() => setSelectedLeadId(null)}
      />
    );
  }

  // Sub-views configuration
  const SUB_TABS = [
    {
      id: "leads",
      label: "Lidlar bo'limi",
      icon: UserPlus,
      badge: activeLeads.length,
      badgeColor: "bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300",
    },
    {
      id: "leadsLost",
      label: "Ketgan lidlar",
      icon: UserX,
      badge: lostLeads.length,
      badgeColor: "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300",
    },
    {
      id: "leadsAnalytics",
      label: "Lidlar analitikasi",
      icon: TrendingUp,
      badge: `${conversionRate}%`,
      badgeColor: "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300",
    },
    {
      id: "leadsForm",
      label: "Lidlar formasi",
      icon: Share2,
      badge: null,
    },
    {
      id: "leadsSettings",
      label: "Forma sozlamalari",
      icon: Sliders,
      badge: `${configuredFormFields.filter((f) => f.enabled !== false).length} maydon`,
      badgeColor: "bg-fuchsia-100 dark:bg-fuchsia-950 text-fuchsia-700 dark:text-fuchsia-300",
    },
  ];

  const currentTabMeta = {
    leads: {
      title: "Lidlar Boshqaruvi",
      subtitle: "Potensial o'quvchilar, alohida to'liq profillar, sotuv voronkasi va sinflar",
      icon: UserPlus,
      gradient: "from-violet-600 to-indigo-500 shadow-violet-500/25",
    },
    leadsLost: {
      title: "Ketgan va Rad etilgan Lidlar",
      subtitle: "Rad etilgan lidlar xotirasi, ketish sabablari tahlili va qayta faollashtirish",
      icon: UserX,
      gradient: "from-rose-600 to-pink-500 shadow-rose-500/25",
    },
    leadsAnalytics: {
      title: "Lidlar Analitikasi va Voronka",
      subtitle: "Sotuv voronkasi dinamikasi, manbalar statistikasi va ketish sabablari tahlili",
      icon: TrendingUp,
      gradient: "from-emerald-600 to-teal-500 shadow-emerald-500/25",
    },
    leadsForm: {
      title: "Onlayn Arizalar Qabul Formasi",
      subtitle: "Veb-sayt, ijtimoiy tarmoqlar va Telegram uchun ochiq ariza havolasi va iFrame",
      icon: Share2,
      gradient: "from-indigo-600 to-violet-500 shadow-indigo-500/25",
    },
    leadsSettings: {
      title: "Lid Formasi Konstruktori & Sozlamalari",
      subtitle: "Inputlar turlari (text, number, multiple select, one selector, date, textarea, custom, kurs, guruh, radio), majburiylik va tartib",
      icon: Sliders,
      gradient: "from-violet-600 to-fuchsia-600 shadow-violet-500/25",
    },
    leadsFormSettings: {
      title: "Lid Formasi Konstruktori & Sozlamalari",
      subtitle: "Inputlar turlari (text, number, multiple select, one selector, date, textarea, custom, kurs, guruh, radio), majburiylik va tartib",
      icon: Sliders,
      gradient: "from-violet-600 to-fuchsia-600 shadow-violet-500/25",
    },
  }[currentView] || {
    title: "Lidlar Boshqaruvi",
    subtitle: "Potensial o'quvchilar va sotuv voronkasi",
    icon: UserPlus,
    gradient: "from-violet-600 to-indigo-500 shadow-violet-500/25",
  };

  const HeaderIcon = currentTabMeta.icon;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header with Dynamic Meta */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3.5">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${currentTabMeta.gradient} text-white flex items-center justify-center shadow-lg`}>
            <HeaderIcon size={24} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              {currentTabMeta.title}
              {currentView === "leads" && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800">
                  {activeLeads.length} ta
                </span>
              )}
              {currentView === "leadsLost" && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                  {lostLeads.length} ta
                </span>
              )}
              {(currentView === "leadsSettings" || currentView === "leadsFormSettings") && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-fuchsia-50 dark:bg-fuchsia-950/60 text-fuchsia-600 dark:text-fuchsia-400 border border-fuchsia-200 dark:border-fuchsia-800">
                  Sozlamalar
                </span>
              )}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Icon View Switchers */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            <button
              onClick={() => handleTabSwitch("leads")}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                currentView === "leads"
                  ? "bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
              title="Lidlar ro'yxati va doskasi"
            >
              <UserPlus size={16} />
            </button>

            <button
              onClick={() => handleTabSwitch("leadsLost")}
              className={`p-2 rounded-xl transition-all cursor-pointer relative ${
                currentView === "leadsLost"
                  ? "bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
              title="Ketgan va rad etilgan lidlar"
            >
              <UserX size={16} />
              {lostLeads.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                  {lostLeads.length}
                </span>
              )}
            </button>

            <button
              onClick={() => handleTabSwitch("leadsAnalytics")}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                currentView === "leadsAnalytics"
                  ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
              title="Lidlar analitikasi"
            >
              <TrendingUp size={16} />
            </button>

            <button
              onClick={() => handleTabSwitch("leadsForm")}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                currentView === "leadsForm"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
              title="Onlayn Ariza Havolasi & iFrame"
            >
              <Share2 size={16} />
            </button>
          </div>

          {/* Form Settings Icon-only Button */}
          <button
            id="btn-lead-form-settings-top"
            onClick={() => handleTabSwitch(currentView === "leadsSettings" || currentView === "leadsFormSettings" ? "leads" : "leadsSettings")}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all shadow-xs cursor-pointer ${
              currentView === "leadsSettings" || currentView === "leadsFormSettings"
                ? "bg-violet-600 border-violet-600 text-white shadow-violet-500/25"
                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
            }`}
            title="Lid formasi sozlamalari (Builder)"
          >
            <Sliders size={16} className={currentView === "leadsSettings" || currentView === "leadsFormSettings" ? "text-white" : "text-violet-600 dark:text-violet-400"} />
          </button>

          <PrimaryButton
            onClick={() => {
              setFormErrorMsg("");
              setConfiguredFormFields(getSavedLeadFormFields());
              setShowAddModal(true);
            }}
          >
            <Plus size={16} />
            <span>Yangi lid</span>
          </PrimaryButton>
        </div>
      </div>



      {/* 1. SUB-VIEW: LIDLAR (MAIN BOARD & LIST) */}
      {currentView === "leads" && (
        <div className="space-y-5">
          {/* Controls & Filter Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-2.5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-nowrap items-center gap-2.5 overflow-x-auto w-full">
            <div className="relative w-44 sm:w-48 shrink-0">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Ism, telefon, sinf..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`${INPUT_CLS} pl-8 h-9 text-xs`}
              />
            </div>

            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className={`${INPUT_CLS} !w-auto min-w-[145px] max-w-[170px] text-xs h-9 px-3 shrink-0 cursor-pointer`}
            >
              <option value="all">Barcha manbalar</option>
              {LEAD_SOURCES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>

            <div className="ml-auto flex items-center h-9 border border-slate-200/90 dark:border-slate-700/80 rounded-xl p-1 bg-slate-100/80 dark:bg-slate-800/80 shrink-0 gap-1">
              <button
                onClick={() => setKanbanMode(true)}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  kanbanMode
                    ? "bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 shadow-xs border border-slate-200/50 dark:border-slate-700/50 font-bold"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <LayoutGrid size={13} />
                <span>Kanban</span>
              </button>
              <button
                onClick={() => setKanbanMode(false)}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  !kanbanMode
                    ? "bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 shadow-xs border border-slate-200/50 dark:border-slate-700/50 font-bold"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <List size={13} />
                <span>Ro'yxat</span>
              </button>
            </div>
          </div>

          {/* KANBAN BOARD VIEW */}
          {kanbanMode ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 w-full items-start">
              {LEAD_STATUSES.filter((st) => st.id !== "rejected" && st.id !== "lost").map(
                (status) => {
                  const stageLeads = filteredActiveLeads.filter(
                    (l) => l.status === status.id
                  );
                  const isOver = dragOverStatus === status.id;
                  return (
                    <div
                      key={status.id}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "move";
                        if (dragOverStatus !== status.id) setDragOverStatus(status.id);
                      }}
                      onDragLeave={(e) => {
                        if (e.currentTarget.contains(e.relatedTarget)) return;
                        if (dragOverStatus === status.id) setDragOverStatus(null);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        const leadId = e.dataTransfer.getData("text/plain") || draggedLeadId;
                        if (leadId) {
                          handleStatusChange(leadId, status.id);
                        }
                        setDragOverStatus(null);
                        setDraggedLeadId(null);
                      }}
                      className={`rounded-xl p-3 border transition-all flex flex-col min-h-[540px] min-w-0 ${
                        isOver
                          ? "bg-violet-50/80 dark:bg-violet-950/40 border-violet-400 dark:border-violet-600 ring-2 ring-violet-500/30 border-dashed"
                          : "bg-slate-100/80 dark:bg-slate-900/60 border-slate-200/70 dark:border-slate-800"
                      }`}
                    >
                      {/* Column Header */}
                      <div className="flex items-center justify-between pb-2.5 px-1 border-b border-slate-200/80 dark:border-slate-800 mb-2.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: status.color }}
                          />
                          <h3 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 truncate">
                            {status.label}
                          </h3>
                        </div>
                        <span className="px-2 py-0.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs shrink-0">
                          {stageLeads.length}
                        </span>
                      </div>

                      {/* Column Cards List */}
                      <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[680px] pr-0.5">
                        {stageLeads.map((lead) => {
                          const courseObj = courses.find((c) => c.id === lead.courseId);
                          const isBeingDragged = draggedLeadId === lead.id;
                          const commentsCount = Array.isArray(lead.comments) ? lead.comments.length : (lead.note ? 1 : 0);
                          const targetGrp = groups.find((g) => g.id === (lead.enrolledGroupId || lead.groupId));

                          return (
                            <div
                              key={lead.id}
                              draggable={true}
                              onDragStart={(e) => {
                                e.dataTransfer.setData("text/plain", lead.id);
                                setDraggedLeadId(lead.id);
                              }}
                              onDragEnd={() => {
                                setDraggedLeadId(null);
                                setDragOverStatus(null);
                              }}
                              onClick={() => setSelectedLeadId(lead.id)}
                              className={`bg-white dark:bg-slate-800 rounded-xl p-3.5 border shadow-2xs hover:shadow-md transition-all group cursor-pointer active:scale-[0.99] select-none ${
                                isBeingDragged
                                  ? "opacity-40 scale-[0.98] border-violet-400 ring-2 ring-violet-400/50"
                                  : "border-slate-200/80 dark:border-slate-700/80 hover:border-violet-300 dark:hover:border-violet-600"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-1.5 mb-1.5">
                                <div className="flex items-center gap-1 min-w-0">
                                  <GripVertical size={13} className="text-slate-300 dark:text-slate-600 group-hover:text-slate-400 shrink-0" />
                                  <h4 className="font-black text-xs sm:text-sm text-slate-900 dark:text-white leading-snug truncate hover:text-violet-600 dark:hover:text-violet-400">
                                    {lead.name}
                                  </h4>
                                </div>
                                <span
                                  className="text-[9px] px-1.5 py-0.5 font-bold rounded capitalize shrink-0"
                                  style={{
                                    backgroundColor: `${status.color}18`,
                                    color: status.color,
                                  }}
                                >
                                  {lead.source || "Forma"}
                                </span>
                              </div>

                              {/* SINF & GURUH BADGES */}
                              <div className="flex items-center gap-1.5 flex-wrap mb-2">
                                {lead.grade && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/80 flex items-center gap-0.5">
                                    <School size={10} /> {lead.grade}
                                  </span>
                                )}
                                {targetGrp && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200/80 dark:border-violet-800/80 flex items-center gap-0.5 truncate max-w-[140px]">
                                    <GraduationCap size={10} className="shrink-0" /> <span className="truncate">{targetGrp.name}</span>
                                  </span>
                                )}
                              </div>

                              <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1 mb-2.5">
                                {/* 1-Phone */}
                                <p className="flex items-center gap-1 font-mono">
                                  <Phone size={11} className="text-violet-500 shrink-0" />
                                  <a
                                    href={`tel:${lead.phone}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="hover:text-violet-600 dark:hover:text-violet-400 hover:underline truncate font-semibold"
                                  >
                                    1: {lead.phone}
                                  </a>
                                </p>
                                {/* 2-Phone */}
                                {(lead.phone2 || lead.parentPhone) && (
                                  <p className="flex items-center gap-1 font-mono text-slate-500">
                                    <Phone size={11} className="text-indigo-400 shrink-0" />
                                    <a
                                      href={`tel:${lead.phone2 || lead.parentPhone}`}
                                      onClick={(e) => e.stopPropagation()}
                                      className="hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline truncate"
                                    >
                                      2: {lead.phone2 || lead.parentPhone}
                                    </a>
                                  </p>
                                )}

                                {commentsCount > 0 && (
                                  <p className="flex items-center gap-1 text-[10.5px] text-slate-400 font-semibold pt-0.5">
                                    <MessageSquare size={11} className="text-slate-400" />
                                    <span>{commentsCount} ta izoh</span>
                                  </p>
                                )}
                              </div>

                              {/* Stage Transition, Edit & Reject Actions */}
                              <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-1">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedLeadId(lead.id);
                                  }}
                                  className="text-[10.5px] font-bold py-1 px-2.5 bg-violet-50 hover:bg-violet-100 dark:bg-violet-950/60 dark:hover:bg-violet-900 text-violet-700 dark:text-violet-300 rounded-xl border border-violet-200 dark:border-violet-800 transition-colors flex items-center gap-1"
                                >
                                  <span>Profilni ochish</span>
                                  <ArrowRight size={11} />
                                </button>

                                <div className="flex items-center gap-0.5">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditOpen(lead);
                                    }}
                                    className="p-1 text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-950/40 rounded-xl text-xs transition-colors"
                                    title="Tezkor tahrirlash"
                                  >
                                    <Pencil size={13} />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowRejectModal(lead);
                                    }}
                                    className="p-1 text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl text-xs transition-colors"
                                    title="Ketgan deb belgilash"
                                  >
                                    <UserX size={13} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {stageLeads.length === 0 && (
                          <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
                            {isOver ? "Bu yerga tashlang" : "Lidlar yo'q"}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          ) : (
            /* TABLE VIEW */
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-semibold uppercase border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-3.5 px-4">Lid Ismi</th>
                      <th className="py-3.5 px-4">1-Telefon (Asosiy)</th>
                      <th className="py-3.5 px-4">2-Telefon (Ota-onasi)</th>
                      <th className="py-3.5 px-4">Sinfi</th>
                      <th className="py-3.5 px-4">Biriktirilgan Guruh</th>
                      <th className="py-3.5 px-4">Bosqich (Status)</th>
                      <th className="py-3.5 px-4 text-right">Amallar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-slate-700 dark:text-slate-300">
                    {filteredActiveLeads.map((lead) => {
                      const st = LEAD_STATUSES.find((x) => x.id === lead.status) || {
                        label: lead.status,
                        color: "#64748b",
                      };
                      const targetGrp = groups.find((g) => g.id === (lead.enrolledGroupId || lead.groupId));

                      return (
                        <tr
                          key={lead.id}
                          onClick={() => setSelectedLeadId(lead.id)}
                          className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer"
                        >
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                            <div className="flex items-center gap-1.5">
                              <span className="hover:text-violet-600 underline-offset-2 hover:underline font-black">
                                {lead.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono font-semibold">{lead.phone}</td>
                          <td className="py-3 px-4 font-mono text-slate-500">
                            {lead.phone2 || lead.parentPhone || "—"}
                          </td>
                          <td className="py-3 px-4 font-medium">
                            {lead.grade ? (
                              <span className="px-2 py-0.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 text-[11px] font-bold">
                                {lead.grade}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {targetGrp ? (
                              <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                                <GraduationCap size={13} className="text-violet-500 shrink-0" />
                                {targetGrp.name}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400 font-medium italic">
                                Biriktirilmagan
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className="px-2.5 py-1 rounded-xl text-[11px] font-bold"
                              style={{
                                backgroundColor: `${st.color}20`,
                                color: st.color,
                              }}
                            >
                              {st.label}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => setSelectedLeadId(lead.id)}
                                className="px-2.5 py-1 text-violet-700 dark:text-violet-300 bg-violet-50 hover:bg-violet-100 dark:bg-violet-950/60 dark:hover:bg-violet-900 border border-violet-200 dark:border-violet-800 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                              >
                                <span>Profil</span>
                                <ArrowRight size={11} />
                              </button>
                              <button
                                onClick={() => handleEditOpen(lead)}
                                className="px-2 py-1 text-slate-600 dark:text-slate-300 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-950/40 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                              >
                                <Pencil size={12} />
                              </button>
                              <button
                                onClick={() => setShowRejectModal(lead)}
                                className="px-2 py-1 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl text-xs font-semibold"
                              >
                                Ketdi
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredActiveLeads.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="py-12 text-center text-slate-400 dark:text-slate-500"
                        >
                          Hech qanday lid topilmadi
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. SUB-VIEW: KETGAN LIDLAR (LOST / REJECTED LEADS) */}
      {currentView === "leadsLost" && (
        <div className="space-y-5">
          <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-rose-100 dark:bg-rose-900/80 text-rose-600 dark:text-rose-400 rounded-xl">
                <UserX size={20} />
              </span>
              <div>
                <h3 className="font-bold text-sm text-rose-900 dark:text-rose-200">
                  Ketgan va Rad etilgan Lidlar xotirasi ({lostLeads.length})
                </h3>
                <p className="text-xs text-rose-700 dark:text-rose-300">
                  Ushbu ro'yxat orqali siz ketish sabablarini tahlil qilishingiz hamda lidlarni qayta faollashtirib CRMga qaytarishingiz mumkin.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700/80 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Ketgan Lidlar Ro'yxati
              </h3>
              <div className="relative w-64">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Ketgan lidlarni qidirish..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-semibold uppercase border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3 px-4">Lid Ismi</th>
                    <th className="py-3 px-4">Telefon</th>
                    <th className="py-3 px-4">Ketish Sababi</th>
                    <th className="py-3 px-4">Izoh</th>
                    <th className="py-3 px-4">Sana</th>
                    <th className="py-3 px-4 text-right">Qaytarish</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-slate-700 dark:text-slate-300">
                  {filteredLostLeads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        {lead.name}
                      </td>
                      <td className="py-3.5 px-4 font-mono">{lead.phone}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-medium rounded-xl text-[11px]">
                          {lead.rejectionReason || "Sabab ko'rsatilmagan"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 italic max-w-xs truncate">
                        {lead.rejectionNote || lead.note || "—"}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {(lead.rejectedAt || lead.createdAt || "").slice(0, 10)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleRestoreLead(lead)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 dark:text-emerald-300 font-bold text-xs rounded-xl transition-colors border border-emerald-200 dark:border-emerald-800"
                        >
                          <RefreshCw size={12} />
                          <span>Qayta faollashtirish</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredLostLeads.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-12 text-center text-slate-400 dark:text-slate-500"
                      >
                        Ketgan lidlar ro'yxati bo'sh
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. SUB-VIEW: LIDLAR ANALIZI (LEADS ANALYTICS) */}
      {currentView === "leadsAnalytics" && (
        <div className="space-y-6">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            <div className="stat-card border-violet-200/80 dark:border-violet-900/40 bg-gradient-to-b from-violet-50/30 to-white dark:from-violet-950/20 dark:to-slate-900 p-4 rounded-xl shadow-sm hover:-translate-y-1 transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <div className="icon-badge w-[34px] h-[34px] rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md">
                  <UserPlus size={16} className="text-white" />
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300">
                  Jami
                </span>
              </div>
              <div className="stat-value text-[19px] font-extrabold tracking-tight text-slate-900 dark:text-white mb-0.5">
                {totalLeadsCount} <span className="text-xs font-medium text-slate-400">ta</span>
              </div>
              <div className="stat-label text-xs font-bold text-slate-500 dark:text-slate-400">
                Jami lidlar soni
              </div>
            </div>

            <div className="stat-card border-emerald-200/80 dark:border-emerald-900/40 bg-gradient-to-b from-emerald-50/30 to-white dark:from-emerald-950/20 dark:to-slate-900 p-4 rounded-xl shadow-sm hover:-translate-y-1 transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <div className="icon-badge w-[34px] h-[34px] rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-md">
                  <TrendingUp size={16} className="text-white" />
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                  Konversiya
                </span>
              </div>
              <div className="stat-value text-[19px] font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400 mb-0.5">
                {conversionRate}% <span className="text-xs font-medium text-slate-400">({convertedCount} sotuv)</span>
              </div>
              <div className="stat-label text-xs font-bold text-slate-500 dark:text-slate-400">
                Konversiya ko'rsatkichi
              </div>
            </div>

            <div className="stat-card border-amber-200/80 dark:border-amber-900/40 bg-gradient-to-b from-amber-50/30 to-white dark:from-amber-950/20 dark:to-slate-900 p-4 rounded-xl shadow-sm hover:-translate-y-1 transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <div className="icon-badge w-[34px] h-[34px] rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md">
                  <Clock size={16} className="text-white" />
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                  Kutilmoqda
                </span>
              </div>
              <div className="stat-value text-[19px] font-extrabold tracking-tight text-amber-600 dark:text-amber-400 mb-0.5">
                {unansweredCount} <span className="text-xs font-medium text-slate-400">ta</span>
              </div>
              <div className="stat-label text-xs font-bold text-slate-500 dark:text-slate-400">
                Javobsiz yangi arizalar
              </div>
            </div>

            <div className="stat-card border-rose-200/80 dark:border-rose-900/40 bg-gradient-to-b from-rose-50/30 to-white dark:from-rose-950/20 dark:to-slate-900 p-4 rounded-xl shadow-sm hover:-translate-y-1 transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <div className="icon-badge w-[34px] h-[34px] rounded-xl bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center shadow-md">
                  <UserX size={16} className="text-white" />
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300">
                  Ketgan
                </span>
              </div>
              <div className="stat-value text-[19px] font-extrabold tracking-tight text-rose-600 dark:text-rose-400 mb-0.5">
                {lostCount} <span className="text-xs font-medium text-slate-400">ta</span>
              </div>
              <div className="stat-label text-xs font-bold text-slate-500 dark:text-slate-400">
                Ketgan va rad etilganlar
              </div>
            </div>
          </div>

          {/* Sales Funnel Chart */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
              Sotuv Voronkasi (Sales Funnel)
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Lidlarning bosqichma-bosqich o'quvchiga aylanish jarayoni dinamikasi
            </p>

            <div className="space-y-4 max-w-2xl">
              {LEAD_STATUSES.map((st) => {
                const count = leads.filter((l) => l.status === st.id).length;
                const pct =
                  totalLeadsCount > 0 ? (count / totalLeadsCount) * 100 : 0;
                return (
                  <div key={st.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-700 dark:text-slate-300">
                        {st.label}
                      </span>
                      <span className="text-slate-900 dark:text-white font-bold">
                        {count} ta ({pct.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 h-6 rounded-xl overflow-hidden p-0.5">
                      <div
                        className="h-full rounded-xl transition-all duration-500 flex items-center justify-end pr-2 text-[10px] text-white font-bold"
                        style={{
                          width: `${Math.max(pct, 4)}%`,
                          backgroundColor: st.color,
                        }}
                      >
                        {pct > 8 && `${pct.toFixed(0)}%`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rejection Reasons Analytics Chart */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 rounded-xl">
                  <UserX size={18} />
                </span>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Ketish Sabablari Analitikasi (Lost Reasons)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Qaysi sababga ko'ra nechta lid ketganligi va umumiy yo'qotishdagi foiz ulushi
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 bg-rose-50 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 font-bold text-xs rounded-xl border border-rose-200/60 dark:border-rose-800">
                Jami: {lostCount} ta lid ketgan
              </span>
            </div>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Reason Progress Bars */}
              <div className="lg:col-span-8 space-y-3.5">
                {REJECTION_REASONS.map((reason, idx) => {
                  const count = lostLeads.filter(
                    (l) => (l.rejectionReason || "Boshqa sabab") === reason
                  ).length;
                  const pct = lostCount > 0 ? (count / lostCount) * 100 : 0;
                  
                  // Color palette for lost reasons
                  const reasonColors = [
                    "#F43F5E", // rose
                    "#FB923C", // orange
                    "#FBBF24", // amber
                    "#A855F7", // purple
                    "#EC4899", // pink
                    "#64748B", // slate
                    "#06B6D4", // cyan
                    "#94A3B8", // gray
                  ];
                  const barColor = reasonColors[idx % reasonColors.length];

                  return (
                    <div key={reason} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: barColor }}
                          />
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {reason}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {count} ta
                          </span>
                          <span className="text-slate-400 dark:text-slate-500 text-[11px] w-12 text-right font-medium">
                            ({pct.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-700/80 h-3 rounded-full overflow-hidden p-0.5">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.max(pct, count > 0 ? 3 : 0)}%`,
                            backgroundColor: barColor,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary Stats Card */}
              <div className="lg:col-span-4 bg-slate-50/70 dark:bg-slate-900/60 rounded-xl p-5 border border-slate-200/80 dark:border-slate-800 space-y-4">
                <h4 className="font-bold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Top Ketish Sabablari
                </h4>
                {lostCount === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    Hozircha ketgan lidlar mavjud emas
                  </div>
                ) : (
                  <div className="space-y-3">
                    {REJECTION_REASONS.map((r) => ({
                      reason: r,
                      count: lostLeads.filter((l) => (l.rejectionReason || "Boshqa sabab") === r).length,
                    }))
                      .sort((a, b) => b.count - a.count)
                      .slice(0, 3)
                      .map((item, idx) => (
                        <div
                          key={item.reason}
                          className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 font-bold text-[11px] flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                              {item.reason}
                            </span>
                          </div>
                          <span className="font-extrabold text-sm text-rose-600 dark:text-rose-400 shrink-0 ml-2">
                            {item.count} ta
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Lead Sources Breakdown */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4">
              Lidlar Kelvin Manbalari (Lead Sources)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {LEAD_SOURCES.map((source) => {
                const sourceLeadsCount = leads.filter(
                  (l) => (l.source || "instagram").toLowerCase() === source.id
                ).length;
                const pct =
                  totalLeadsCount > 0
                    ? ((sourceLeadsCount / totalLeadsCount) * 100).toFixed(1)
                    : "0.0";
                return (
                  <div
                    key={source.id}
                    className="p-4 rounded-xl border border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: source.color }}
                        />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {source.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">Ulushi: {pct}%</p>
                    </div>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                      {sourceLeadsCount} ta
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 4. SUB-VIEW: LIDLAR FORMASI (FORM BUILDER & LINK SHARER) */}
      {currentView === "leadsForm" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Share Link & Embed Code Settings */}
          <div className="space-y-5">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-xl">
                    <Share2 size={18} />
                  </span>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      Onlayn Arizalar Qabul Formasi
                    </h3>
                    <p className="text-xs text-slate-500">
                      Ushbu havola orqali mijozlar qoldirgan arizalar to'g'ridan-to'g'ri CRM "Lidlar" bo'limiga tushadi.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    To'g'ridan-to'g'ri forma havolasi (Public Link)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={formShareUrl}
                      className="flex-1 px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                    />
                    <button
                      onClick={() => copyToClipboard(formShareUrl, "link")}
                      className="px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Copy size={14} />
                      <span>{copiedLink ? "Nusxalandi!" : "Nusxalash"}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Veb-saytga joylashtirish kodi (iFrame Embed)
                  </label>
                  <div className="flex gap-2">
                    <textarea
                      rows={2}
                      readOnly
                      value={formEmbedCode}
                      className="flex-1 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] font-mono resize-none"
                    />
                    <button
                      onClick={() => copyToClipboard(formEmbedCode, "embed")}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Copy size={14} />
                      <span>{copiedEmbed ? "Nusxalandi!" : "Nusxalash"}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Formadagi maydonlar soni: <b>{configuredFormFields.filter(f => f.enabled !== false).length} ta</b>
                </span>
                <button
                  onClick={() => handleTabSwitch("leadsSettings")}
                  className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Sliders size={14} />
                  <span>Formani sozlash (Builder)</span>
                </button>
              </div>
            </div>

            <div className="bg-violet-50 dark:bg-violet-950/30 rounded-xl p-5 border border-violet-200 dark:border-violet-900/50 space-y-2">
              <h4 className="font-bold text-sm text-violet-900 dark:text-violet-200 flex items-center gap-2">
                <Sparkles size={16} />
                <span>Formani ishlatish bo'yicha maslahatlar</span>
              </h4>
              <ul className="text-xs text-violet-800 dark:text-violet-300 space-y-1.5 list-disc pl-4">
                <li>Havolani Instagram bio, Telegram kanal yoki reklamalarga joylashtiring.</li>
                <li>Mijoz forma orqali ariza topshirishi bilan bildirishnoma keladi.</li>
                <li>"Forma sozlamalari" sahifasida xohlagancha maydon (text, number, multi-select, kurs dropdown, guruh dropdown va h.k.) qo'shishingiz mumkin.</li>
              </ul>
            </div>
          </div>

          {/* Right: Interactive Live Public Form Preview with configured fields */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-md relative overflow-hidden">
            <div className="absolute top-3 right-3">
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold rounded-full uppercase">
                Jonli Namuna (Preview)
              </span>
            </div>

            <div className="mb-6 text-center max-w-sm mx-auto">
              <div className="w-12 h-12 bg-gradient-to-tr from-violet-600 to-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-xl mx-auto mb-3 shadow-md">
                CRM
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                O'quv kurslariga qabul
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Formani to'ldiring, mutaxassisimiz siz bilan 15 daqiqada bog'lanadi.
              </p>
            </div>

            {testFormSubmitted ? (
              <div className="py-12 text-center space-y-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 size={40} className="text-emerald-600 mx-auto" />
                <h4 className="font-bold text-base text-emerald-900 dark:text-emerald-200">
                  Rahmat! Arizangiz qabul qilindi.
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 max-w-xs mx-auto">
                  Test ariza CRM tizimiga muvaffaqiyatli qo'shildi! "Lidlar" bo'limida ko'rishingiz mumkin.
                </p>
              </div>
            ) : (
              <form onSubmit={handleTestFormSubmit} className="space-y-3.5 max-w-sm mx-auto">
                {configuredFormFields
                  .filter((field) => field.enabled !== false)
                  .map((field) => {
                    const fieldKey = field.id || field.name;
                    const val = publicFormData[fieldKey] !== undefined ? publicFormData[fieldKey] : publicFormData[field.name];

                    // Render dynamic fields based on field.type
                    if (field.type === "course_dropdown") {
                      return (
                        <div key={field.id}>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            {field.label}{" "}
                            {field.required ? (
                              <span className="text-rose-500 font-bold">*</span>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-normal">(ixtiyoriy)</span>
                            )}
                          </label>
                          <select
                            required={field.required}
                            value={val || ""}
                            onChange={(e) =>
                              setPublicFormData({ ...publicFormData, [fieldKey]: e.target.value, [field.name]: e.target.value })
                            }
                            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-violet-500 focus:outline-none"
                          >
                            <option value="">Kursni tanlang...</option>
                            {(courses || []).map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    }

                    if (field.type === "group_dropdown") {
                      return (
                        <div key={field.id}>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            {field.label}{" "}
                            {field.required ? (
                              <span className="text-rose-500 font-bold">*</span>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-normal">(ixtiyoriy)</span>
                            )}
                          </label>
                          <select
                            required={field.required}
                            value={val || ""}
                            onChange={(e) =>
                              setPublicFormData({ ...publicFormData, [fieldKey]: e.target.value, [field.name]: e.target.value })
                            }
                            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-violet-500 focus:outline-none"
                          >
                            <option value="">Guruhni tanlang...</option>
                            {(groups || []).map((g) => (
                              <option key={g.id} value={g.id}>
                                {g.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    }

                    if (field.type === "single_select") {
                      return (
                        <div key={field.id}>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            {field.label}{" "}
                            {field.required ? (
                              <span className="text-rose-500 font-bold">*</span>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-normal">(ixtiyoriy)</span>
                            )}
                          </label>
                          <select
                            required={field.required}
                            value={val || ""}
                            onChange={(e) =>
                              setPublicFormData({ ...publicFormData, [fieldKey]: e.target.value, [field.name]: e.target.value })
                            }
                            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-violet-500 focus:outline-none"
                          >
                            <option value="">Tanlang...</option>
                            {(field.options || []).map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    }

                    if (field.type === "multiple_select") {
                      const selectedList = Array.isArray(val) ? val : [];
                      return (
                        <div key={field.id} className="space-y-1.5">
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {field.label}{" "}
                            {field.required ? (
                              <span className="text-rose-500 font-bold">*</span>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-normal">(ixtiyoriy)</span>
                            )}
                          </label>
                          <div className="flex flex-wrap gap-1.5">
                            {(field.options || []).map((opt) => {
                              const isChecked = selectedList.includes(opt);
                              return (
                                <button
                                  type="button"
                                  key={opt}
                                  onClick={() => {
                                    const next = isChecked
                                      ? selectedList.filter((item) => item !== opt)
                                      : [...selectedList, opt];
                                    setPublicFormData({ ...publicFormData, [fieldKey]: next, [field.name]: next });
                                  }}
                                  className={`px-2.5 py-1 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                                    isChecked
                                      ? "bg-violet-600 text-white border-violet-600"
                                      : "bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                                  }`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }

                    if (field.type === "radio") {
                      return (
                        <div key={field.id} className="space-y-1.5">
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {field.label}{" "}
                            {field.required ? (
                              <span className="text-rose-500 font-bold">*</span>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-normal">(ixtiyoriy)</span>
                            )}
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {(field.options || []).map((opt) => (
                              <label
                                key={opt}
                                className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 cursor-pointer text-xs"
                              >
                                <input
                                  type="radio"
                                  name={`radio-${field.id}`}
                                  checked={val === opt}
                                  onChange={() =>
                                    setPublicFormData({ ...publicFormData, [fieldKey]: opt, [field.name]: opt })
                                  }
                                  className="text-violet-600 focus:ring-violet-500"
                                />
                                <span className="text-slate-700 dark:text-slate-300">{opt}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    if (field.type === "textarea") {
                      return (
                        <div key={field.id}>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            {field.label}{" "}
                            {field.required ? (
                              <span className="text-rose-500 font-bold">*</span>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-normal">(ixtiyoriy)</span>
                            )}
                          </label>
                          <textarea
                            rows={2}
                            required={field.required}
                            placeholder={field.placeholder || ""}
                            value={val || ""}
                            onChange={(e) =>
                              setPublicFormData({ ...publicFormData, [fieldKey]: e.target.value, [field.name]: e.target.value })
                            }
                            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-violet-500 focus:outline-none resize-none"
                          />
                        </div>
                      );
                    }

                    return (
                      <div key={field.id}>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          {field.label}{" "}
                          {field.required ? (
                            <span className="text-rose-500 font-bold">*</span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-normal">(ixtiyoriy)</span>
                          )}
                        </label>
                        <input
                          type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                          required={field.required}
                          placeholder={field.placeholder || ""}
                          value={val || ""}
                          onChange={(e) =>
                            setPublicFormData({ ...publicFormData, [fieldKey]: e.target.value, [field.name]: e.target.value })
                          }
                          className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-violet-500 focus:outline-none"
                        />
                      </div>
                    );
                  })}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer mt-2"
                >
                  Ariza topshirish
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 5. SUB-VIEW: FORMA SOZLAMALARI / FORM BUILDER */}
      {(currentView === "leadsSettings" || currentView === "leadsFormSettings") && (
        <LeadFormSettingsBuilder
          courses={courses}
          groups={groups}
          onFieldsUpdated={(newFields) => {
            setConfiguredFormFields(newFields);
          }}
        />
      )}

      {/* ADD NEW LEAD MODAL - DYNAMICALLY POWERED BY CUSTOM LEAD FORM BUILDER */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-violet-100 dark:bg-violet-950/80 text-violet-600 rounded-xl">
                  <UserPlus size={18} />
                </span>
                <div>
                  <h3 className="font-black text-base text-slate-900 dark:text-white">
                    Yangi Lid Qo'shish
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Forma konstruktori asosida sozlangan maydonlar ({configuredFormFields.filter(f => f.enabled !== false).length} ta maydon)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {formErrorMsg && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertTriangle size={15} className="shrink-0 text-rose-600" />
                <span>{formErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-3.5">
              {configuredFormFields
                .filter((f) => f.enabled !== false)
                .map((field, idx) => {
                  const fieldKey = field.id || field.name || `field_${idx}`;
                  const isNameField = field.name === "name" || field.id === "name" || (field.type === "text" && (field.label?.toLowerCase().includes("ism") || field.label?.toLowerCase().includes("familiya")));
                  const isPhone1Field = field.name === "phone" || field.id === "phone" || (field.type === "text" && (field.label?.toLowerCase().includes("1-telefon") || field.label?.toLowerCase().includes("asosiy")));
                  const isPhone2Field = field.name === "phone2" || field.id === "phone2" || (field.type === "text" && (field.label?.toLowerCase().includes("2-telefon") || field.label?.toLowerCase().includes("ota-ona")));
                  const isCourseField = field.type === "course_dropdown" || field.name === "course_select" || field.name === "courseId";
                  const isGroupField = field.type === "group_dropdown" || field.name === "enrolledGroupId";

                  if (isNameField) {
                    return (
                      <div key={field.id}>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                          <span>{field.label || "Mijoz Ismi va Familiyasi"}</span>
                          {field.required ? (
                            <span className="text-[10px] text-rose-500 font-bold">Majburiy *</span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-normal">Ixtiyoriy</span>
                          )}
                        </label>
                        <input
                          type="text"
                          required={field.required}
                          placeholder={field.placeholder || "Masalan: Sardor Rahimov"}
                          value={leadForm.name !== undefined && leadForm.name !== "" ? leadForm.name : (leadForm.customFields?.[fieldKey] || "")}
                          onChange={(e) =>
                            setLeadForm({
                              ...leadForm,
                              name: e.target.value,
                              customFields: { ...leadForm.customFields, [fieldKey]: e.target.value, name: e.target.value },
                            })
                          }
                          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-violet-500 focus:outline-none"
                        />
                      </div>
                    );
                  }

                  if (isPhone1Field) {
                    return (
                      <div key={field.id}>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Phone size={12} className="text-violet-600" />
                            {field.label || "1-Telefon (Asosiy)"}
                          </span>
                          {field.required ? (
                            <span className="text-[10px] text-rose-500 font-bold">Majburiy *</span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-normal">Ixtiyoriy</span>
                          )}
                        </label>
                        <input
                          type="text"
                          required={field.required}
                          placeholder={field.placeholder || "+998 90 123 45 67"}
                          value={leadForm.phone !== undefined && leadForm.phone !== "" ? leadForm.phone : (leadForm.customFields?.[fieldKey] || "")}
                          onChange={(e) =>
                            setLeadForm({
                              ...leadForm,
                              phone: e.target.value,
                              customFields: { ...leadForm.customFields, [fieldKey]: e.target.value, phone: e.target.value },
                            })
                          }
                          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-violet-300 dark:border-violet-700/80 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
                        />
                      </div>
                    );
                  }

                  if (isPhone2Field) {
                    return (
                      <div key={field.id}>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Phone size={12} className="text-indigo-600" />
                            {field.label || "2-Telefon (Ota-onasi)"}
                          </span>
                          {field.required ? (
                            <span className="text-[10px] text-rose-500 font-bold">Majburiy *</span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-normal">Ixtiyoriy</span>
                          )}
                        </label>
                        <input
                          type="text"
                          required={field.required}
                          placeholder={field.placeholder || "+998 99 987 65 43"}
                          value={leadForm.phone2 !== undefined && leadForm.phone2 !== "" ? leadForm.phone2 : (leadForm.customFields?.[fieldKey] || "")}
                          onChange={(e) =>
                            setLeadForm({
                              ...leadForm,
                              phone2: e.target.value,
                              customFields: { ...leadForm.customFields, [fieldKey]: e.target.value, phone2: e.target.value },
                            })
                          }
                          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-indigo-300 dark:border-indigo-700/80 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                    );
                  }

                  if (isCourseField) {
                    const currentVal = leadForm.courseId || leadForm.customFields?.[fieldKey] || leadForm.customFields?.[field.name] || "";
                    return (
                      <div key={field.id}>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <BookOpen size={12} className="text-indigo-500" />
                            {field.label || "Qiziqqan kursi"}
                          </span>
                          {field.required ? (
                            <span className="text-[10px] text-rose-500 font-bold">Majburiy *</span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-normal">Ixtiyoriy</span>
                          )}
                        </label>
                        <SearchableCourseSelect
                          courses={courses}
                          value={currentVal || leadForm.courseId}
                          onChange={(cId) => {
                            setLeadForm({
                              ...leadForm,
                              courseId: cId,
                              customFields: { ...leadForm.customFields, [fieldKey]: cId, [field.name]: cId, courseId: cId },
                            });
                          }}
                          placeholder={field.placeholder || "Kursni qidirish yoki tanlash..."}
                        />
                      </div>
                    );
                  }

                  if (isGroupField) {
                    return (
                      <div key={field.id}>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <GraduationCap size={12} className="text-emerald-500" />
                            {field.label || "Qaysi guruhga kelyapti?"}
                          </span>
                          {field.required ? (
                            <span className="text-[10px] text-rose-500 font-bold">Majburiy *</span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-normal">Ixtiyoriy</span>
                          )}
                        </label>
                        <SearchableGroupSelect
                          groups={groups}
                          courses={courses}
                          teachers={teachers}
                          students={opData?.students || directorData?.students || []}
                          value={leadForm.enrolledGroupId}
                          onChange={(gid, selectedGrp) => {
                            setLeadForm({
                              ...leadForm,
                              enrolledGroupId: gid,
                              courseId: selectedGrp?.courseId || leadForm.courseId,
                              customFields: { ...leadForm.customFields, [fieldKey]: gid, [field.name]: gid, enrolledGroupId: gid },
                            });
                          }}
                          placeholder={field.placeholder || "Guruhni qidirish yoki tanlash..."}
                        />
                      </div>
                    );
                  }

                  if (field.type === "single_select") {
                    const currentVal = leadForm.customFields?.[fieldKey] !== undefined ? leadForm.customFields[fieldKey] : (leadForm.customFields?.[field.name] || "");
                    return (
                      <div key={field.id}>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                          <span>{field.label}</span>
                          {field.required ? (
                            <span className="text-[10px] text-rose-500 font-bold">Majburiy *</span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-normal">Ixtiyoriy</span>
                          )}
                        </label>
                        <select
                          required={field.required}
                          value={currentVal}
                          onChange={(e) =>
                            setLeadForm({
                              ...leadForm,
                              customFields: { ...leadForm.customFields, [fieldKey]: e.target.value, [field.name]: e.target.value },
                            })
                          }
                          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-violet-500 focus:outline-none cursor-pointer"
                        >
                          <option value="">{field.placeholder || "Tanlang..."}</option>
                          {(field.options || []).map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  }

                  if (field.type === "multiple_select") {
                    const rawVal = leadForm.customFields?.[fieldKey] !== undefined ? leadForm.customFields[fieldKey] : leadForm.customFields?.[field.name];
                    const selectedArr = Array.isArray(rawVal) ? rawVal : [];
                    return (
                      <div key={field.id}>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                          <span>{field.label}</span>
                          {field.required ? (
                            <span className="text-[10px] text-rose-500 font-bold">Majburiy *</span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-normal">Ixtiyoriy (Ko'p tanlov)</span>
                          )}
                        </label>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {(field.options || []).map((opt) => {
                            const isChecked = selectedArr.includes(opt);
                            return (
                              <button
                                type="button"
                                key={opt}
                                onClick={() => {
                                  const next = isChecked
                                    ? selectedArr.filter((i) => i !== opt)
                                    : [...selectedArr, opt];
                                  setLeadForm({
                                    ...leadForm,
                                    customFields: { ...leadForm.customFields, [fieldKey]: next, [field.name]: next },
                                  });
                                }}
                                className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                                  isChecked
                                    ? "bg-violet-600 text-white border-violet-600 shadow-xs"
                                    : "bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }

                  if (field.type === "radio") {
                    const currentVal = leadForm.customFields?.[fieldKey] !== undefined ? leadForm.customFields[fieldKey] : (leadForm.customFields?.[field.name] || "");
                    return (
                      <div key={field.id}>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                          <span>{field.label}</span>
                          {field.required ? (
                            <span className="text-[10px] text-rose-500 font-bold">Majburiy *</span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-normal">Ixtiyoriy</span>
                          )}
                        </label>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {(field.options || []).map((opt) => {
                            const isChecked = currentVal === opt;
                            return (
                              <button
                                type="button"
                                key={opt}
                                onClick={() =>
                                  setLeadForm({
                                    ...leadForm,
                                    customFields: { ...leadForm.customFields, [fieldKey]: opt, [field.name]: opt },
                                  })
                                }
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                                  isChecked
                                    ? "bg-violet-50 dark:bg-violet-950/60 border-violet-500 text-violet-700 dark:text-violet-300"
                                    : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                                }`}
                              >
                                <span
                                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                    isChecked ? "border-violet-600 bg-violet-600" : "border-slate-400 bg-white dark:bg-slate-800"
                                  }`}
                                >
                                  {isChecked && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                                </span>
                                <span>{opt}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }

                  if (field.type === "textarea" || field.name === "comment" || field.name === "note") {
                    const currentVal = field.name === "note" ? leadForm.note : (leadForm.customFields?.[fieldKey] !== undefined ? leadForm.customFields[fieldKey] : (leadForm.customFields?.[field.name] || ""));
                    return (
                      <div key={field.id}>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <MessageSquare size={12} className="text-slate-400" />
                            {field.label || "Qayd / Izoh"}
                          </span>
                          {field.required ? (
                            <span className="text-[10px] text-rose-500 font-bold">Majburiy *</span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-normal">Ixtiyoriy</span>
                          )}
                        </label>
                        <textarea
                          rows={2}
                          required={field.required}
                          placeholder={field.placeholder || "Mijoz haqida eslatma..."}
                          value={currentVal || ""}
                          onChange={(e) => {
                            if (field.name === "note") {
                              setLeadForm({ ...leadForm, note: e.target.value });
                            } else {
                              setLeadForm({
                                ...leadForm,
                                customFields: { ...leadForm.customFields, [fieldKey]: e.target.value, [field.name]: e.target.value },
                              });
                            }
                          }}
                          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-violet-500 focus:outline-none resize-none"
                        />
                      </div>
                    );
                  }

                  // Default: text, number, date, custom
                  const val = leadForm.customFields?.[fieldKey] !== undefined ? leadForm.customFields[fieldKey] : (leadForm.customFields?.[field.name] || "");
                  return (
                    <div key={field.id}>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                        <span>{field.label}</span>
                        {field.required ? (
                          <span className="text-[10px] text-rose-500 font-bold">Majburiy *</span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-normal">Ixtiyoriy</span>
                        )}
                      </label>
                      <input
                        type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                        required={field.required}
                        placeholder={field.placeholder || ""}
                        value={val}
                        onChange={(e) =>
                          setLeadForm({
                            ...leadForm,
                            customFields: { ...leadForm.customFields, [fieldKey]: e.target.value, [field.name]: e.target.value },
                          })
                        }
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-violet-500 focus:outline-none"
                      />
                    </div>
                  );
                })}

              {/* Kelish Manbasi */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Share2 size={12} className="text-pink-500" />
                  Kelish Manbasi
                </label>
                <select
                  value={leadForm.source}
                  onChange={(e) =>
                    setLeadForm({ ...leadForm, source: e.target.value })
                  }
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-violet-500 focus:outline-none cursor-pointer"
                >
                  {LEAD_SOURCES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus size={14} />
                  <span>Lidni saqlash</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REJECT / LOST LEAD MODAL */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <span className="p-2 bg-rose-100 dark:bg-rose-950 rounded-xl">
                <UserX size={20} />
              </span>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Lidni Ketgan deb belgilash
                </h3>
                <p className="text-xs text-slate-500">
                  {showRejectModal.name} ({showRejectModal.phone})
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ketish / Rad etish sababi <span className="text-rose-500">*</span>
                </label>
                <select
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none"
                >
                  {REJECTION_REASONS.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Qo'shimcha izoh
                </label>
                <textarea
                  rows={2}
                  placeholder="Sabab bo'yicha batfsilroq izoh..."
                  value={rejectionNote}
                  onChange={(e) => setRejectionNote(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setShowRejectModal(null)}
                className="px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={handleRejectConfirm}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-xs"
              >
                Ketgan deb saqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT LEAD MODAL */}
      {showEditModal && editLeadForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-violet-100 dark:bg-violet-950/80 text-violet-600 rounded-xl">
                  <Pencil size={18} />
                </span>
                <div>
                  <h3 className="font-black text-base text-slate-900 dark:text-white">
                    Lid Ma'lumotlarini Tahrirlash
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Barcha maydonlar va 2 ta telefon raqami
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditLeadForm(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            {formErrorMsg && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertTriangle size={15} className="shrink-0 text-rose-600" />
                <span>{formErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Lid Ismi va Familiyasi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Sardor Aliyev"
                  value={editLeadForm.name}
                  onChange={(e) =>
                    setEditLeadForm({ ...editLeadForm, name: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:border-violet-500"
                />
              </div>

              {/* 2 TA MAJBURIY TELEFON RAQAMI */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Phone size={12} className="text-violet-600" />
                    1-Telefon (Asosiy) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+998 90 123 45 67"
                    value={editLeadForm.phone}
                    onChange={(e) =>
                      setEditLeadForm({ ...editLeadForm, phone: e.target.value })
                    }
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-violet-300 dark:border-violet-700/80 rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Phone size={12} className="text-indigo-600" />
                    2-Telefon (Ota-onasi) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+998 99 987 65 43"
                    value={editLeadForm.phone2}
                    onChange={(e) =>
                      setEditLeadForm({ ...editLeadForm, phone2: e.target.value })
                    }
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-indigo-300 dark:border-indigo-700/80 rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* SINF & GURUH DROPDOWN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <School size={12} className="text-amber-500" />
                    Sinfi / Darajasi
                  </label>
                  <select
                    value={editLeadForm.grade}
                    onChange={(e) =>
                      setEditLeadForm({ ...editLeadForm, grade: e.target.value })
                    }
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:border-violet-500 cursor-pointer"
                  >
                    <option value="">Sinfni tanlang...</option>
                    {GRADE_OPTIONS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <GraduationCap size={12} className="text-emerald-500" />
                    Guruhga biriktirish (Qidirish va tanlash)
                  </label>
                  <SearchableGroupSelect
                    groups={groups}
                    courses={courses}
                    teachers={teachers}
                    students={opData?.students || directorData?.students || []}
                    value={editLeadForm.enrolledGroupId}
                    onChange={(gid, selectedGrp) => {
                      setEditLeadForm({
                        ...editLeadForm,
                        enrolledGroupId: gid,
                        courseId: selectedGrp?.courseId || editLeadForm.courseId,
                      });
                    }}
                    placeholder="Guruhni qidirish yoki tanlash..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Kelish Manbasi
                </label>
                <select
                  value={editLeadForm.source}
                  onChange={(e) =>
                    setEditLeadForm({ ...editLeadForm, source: e.target.value })
                  }
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-violet-500 truncate"
                >
                  {LEAD_SOURCES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Bosqich (Status)
                </label>
                <select
                  value={editLeadForm.status}
                  onChange={(e) =>
                    setEditLeadForm({ ...editLeadForm, status: e.target.value })
                  }
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:border-violet-500"
                >
                  {LEAD_STATUSES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Izoh / Qayd
                </label>
                <textarea
                  rows={2}
                  placeholder="Izoh qoldiring..."
                  value={editLeadForm.note}
                  onChange={(e) =>
                    setEditLeadForm({ ...editLeadForm, note: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-violet-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditLeadForm(null);
                  }}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  O'zgarishlarni saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL: GURUHGA QO'SHISH (ADD / ASSIGN LEAD TO GROUP) */}
      {showAssignGroupModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2.5">
                <span className="p-2.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <GraduationCap size={20} />
                </span>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Guruhga qo'shish
                  </h3>
                  <p className="text-xs text-slate-500">
                    Lidni o'quvchi sifatida mavjud guruhga biriktirish
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAssignGroupModal(null);
                  setSelectedGroupId("");
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <XCircle size={18} />
              </button>
            </div>

            {assignSuccessMsg ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300 rounded-full flex items-center justify-center mx-auto animate-bounce">
                  <CheckCircle2 size={24} />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {assignSuccessMsg}
                </h4>
              </div>
            ) : (
              <form onSubmit={handleAssignToGroupSubmit} className="space-y-4">
                {/* Lead Info Banner */}
                <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                      {showAssignGroupModal.name}
                    </h4>
                    <p className="text-[11px] font-mono text-slate-500">
                      {showAssignGroupModal.phone}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Mavjud Guruhni qidiring va tanlang <span className="text-rose-500">*</span>
                  </label>
                  {(opData?.groups || []).length === 0 ? (
                    <div className="p-3 text-center text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900">
                      Mavjud guruhlar topilmadi. Avval guruhlar bo'limida yangi guruh oching.
                    </div>
                  ) : (
                    <SearchableGroupSelect
                      groups={opData?.groups || []}
                      courses={courses}
                      teachers={teachers}
                      students={opData?.students || []}
                      value={selectedGroupId}
                      onChange={(gid) => setSelectedGroupId(gid)}
                      allowClear={false}
                      placeholder="Guruh nomi, kursi, o'qituvchisi yoki vaqtini qidiring..."
                    />
                  )}
                </div>

                <div className="flex items-start gap-2 p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-xl text-[11px] text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 size={15} className="shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                  <p>
                    Lid avtomatik tarzda <strong>"Guruhga qo'shildi"</strong> bosqichiga o'tadi va o'quvchilar ro'yxatida guruh a'zosi sifatida qayd etiladi.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAssignGroupModal(null);
                      setSelectedGroupId("");
                    }}
                    className="px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedGroupId || assigningGroup || (opData?.groups || []).length === 0}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
                  >
                    {assigningGroup ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" />
                        <span>Biriktirilmoqda...</span>
                      </>
                    ) : (
                      <>
                        <GraduationCap size={14} />
                        <span>Guruhga qo'shish</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

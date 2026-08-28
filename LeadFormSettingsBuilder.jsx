import React, { useState, useEffect } from "react";
import {
  Sliders,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Eye,
  EyeOff,
  RotateCcw,
  Copy,
  CheckCircle2,
  Sparkles,
  Type,
  Hash,
  CheckSquare,
  ListFilter,
  Calendar,
  AlignLeft,
  BookOpen,
  Users,
  Radio,
  HelpCircle,
  Laptop,
  Smartphone,
  Share2,
  Code2,
  ExternalLink,
  Edit3,
  X,
  Tag,
  Check,
  Phone,
  User,
  Send,
} from "lucide-react";
import { GLASS } from "../theme/tokens";
import { ConfirmModal } from "./primitives";
import { SearchableGroupSelect } from "../../../shared/components/SearchableGroupSelect";
import { SearchableCourseSelect } from "../../../shared/components/SearchableCourseSelect";

export const FIELD_TYPES = [
  {
    id: "text",
    label: "Matn (Text)",
    icon: Type,
    badgeColor: "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    desc: "Ism, familiya, manzil, oddiy matn",
    defaultPlaceholder: "Matn kiriting...",
  },
  {
    id: "number",
    label: "Raqam (Number)",
    icon: Hash,
    badgeColor: "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    desc: "Yosh, ball, maktab/sinf raqami",
    defaultPlaceholder: "Faqat son kiriting...",
  },
  {
    id: "multiple_select",
    label: "Ko'p tanlovli (Multiple Select)",
    icon: CheckSquare,
    badgeColor: "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    desc: "Bir nechta variantni bir vaqtda belgilash",
    defaultOptions: ["1-Variant", "2-Variant", "3-Variant"],
  },
  {
    id: "single_select",
    label: "Bitta tanlov (Dropdown / One Selector)",
    icon: ListFilter,
    badgeColor: "bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
    desc: "Ro'yxatdan bitta variant tanlash",
    defaultOptions: ["Variant A", "Variant B", "Variant C"],
  },
  {
    id: "radio",
    label: "Radio tanlov (Radio button)",
    icon: Radio,
    badgeColor: "bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800",
    desc: "Nuqta bilan 1 ta variantni tanlash",
    defaultOptions: ["Variant 1", "Variant 2", "Variant 3"],
  },
  {
    id: "date",
    label: "Sana tanlagich (Date selector)",
    icon: Calendar,
    badgeColor: "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    desc: "Boshlash sanasi yoki tug'ilgan kun",
    defaultPlaceholder: "KK.OO.YYYY",
  },
  {
    id: "textarea",
    label: "Katta matn (Textarea)",
    icon: AlignLeft,
    badgeColor: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    desc: "Kengaytirilgan izoh yoki batafsil savollar",
    defaultPlaceholder: "Batafsil ma'lumot yozing...",
  },
  {
    id: "course_dropdown",
    label: "Kurs dropdown (Kurslar ro'yxati)",
    icon: BookOpen,
    badgeColor: "bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800",
    desc: "O'quv markazdagi mavjud kurslardan tanlash",
  },
  {
    id: "group_dropdown",
    label: "Guruh dropdown (Guruhlar ro'yxati)",
    icon: Users,
    badgeColor: "bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
    desc: "Mavjud guruhlar va o'qituvchilardan tanlash",
  },
  {
    id: "custom",
    label: "Maxsus maydon (Custom)",
    icon: Sparkles,
    badgeColor: "bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800",
    desc: "Maxsus parametr va moslashuvchan variantlar",
    defaultOptions: ["Maqsad 1", "Maqsad 2"],
  },
];

// Quick templates for 1-click addition
const QUICK_FIELD_TEMPLATES = [
  {
    label: "Telegram username",
    type: "text",
    placeholder: "@username",
    description: "Mijozning telegramdagi niki",
  },
  {
    label: "Ota-onasining to'liq ismi",
    type: "text",
    placeholder: "Ota-onasining F.I.SH",
    description: "Bog'lanish uchun ota-ona",
  },
  {
    label: "Yashash manzili / Tuman",
    type: "single_select",
    placeholder: "Tumanni tanlang...",
    options: ["Yunusobod", "Chilonzor", "Mirzo Ulug'bek", "Yakkasaroy", "Sergeli", "Boshqa"],
    description: "O'quvchining yashash hududi",
  },
  {
    label: "Qulay o'qish vaqti",
    type: "radio",
    options: ["Ertalab (09:00 - 12:00)", "Tushdan keyin (14:00 - 18:00)", "Kechki (18:30 - 21:00)"],
    description: "Darsga qatnashmoqchi bo'lgan qulay vaqti",
  },
  {
    label: "Biz haqimizda qayerdan bildingiz?",
    type: "single_select",
    placeholder: "Manbani tanlang...",
    options: ["Instagram", "Telegram kanal", "Do'stlarim tavsiyasi", "Banner / Reklama", "Facebook", "TikTok"],
    description: "Reklama samaradorligini tahlil qilish uchun",
  },
  {
    label: "Qo'shimcha savol yoki talabingiz",
    type: "textarea",
    placeholder: "Savollaringiz bo'lsa yozib qoldiring...",
    description: "Menejer e'tiborga olishi kerak bo'lgan fikrlar",
  },
];

// Default fields standard
export const DEFAULT_LEAD_FORM_FIELDS = [
  {
    id: "name",
    name: "name",
    label: "Ism Familiya",
    type: "text",
    placeholder: "Masalan: Jasur Aliyev",
    required: true,
    enabled: true,
    isSystem: true,
    description: "To'liq ism va familiya",
  },
  {
    id: "phone",
    name: "phone",
    label: "Telefon raqam",
    type: "text",
    placeholder: "+998 90 123 45 67",
    required: true,
    enabled: true,
    isSystem: true,
    description: "Asosiy bog'lanish telefon raqami",
  },
  {
    id: "phone2",
    name: "phone2",
    label: "Qo'shimcha telefon raqam",
    type: "text",
    placeholder: "+998 90 987 65 43",
    required: false,
    enabled: true,
    isSystem: false,
    description: "Ota-onasining yoki qo'shimcha aloqa raqami",
  },
  {
    id: "date",
    name: "date",
    label: "Sana",
    type: "date",
    placeholder: "YYYY-MM-DD",
    required: false,
    enabled: true,
    isSystem: false,
    description: "Murojaat yoki kelish sanasi",
  },
  {
    id: "source",
    name: "source",
    label: "Biz haqimizda qayerdan eshitdingiz?",
    type: "single_select",
    placeholder: "Manbani tanlang...",
    required: false,
    enabled: true,
    isSystem: false,
    options: [
      "Instagram",
      "Telegram Bot / Kanal",
      "Veb-sayt ariza",
      "Ijtimoiy tarmoq reklamasi",
      "Tanish / Tavsiya",
      "Boshqa Manba",
    ],
    description: "Kelish manbasini tanlang",
  },
  {
    id: "group_dropdown",
    name: "group_dropdown",
    label: "Qaysi guruhga kelyapti?",
    type: "group_dropdown",
    placeholder: "Guruhni tanlang...",
    required: false,
    enabled: true,
    isSystem: false,
    description: "Lid qaysi guruhga kelayotgani",
  },
  {
    id: "course_select",
    name: "course_select",
    label: "Qaysi kursga kelyapti?",
    type: "course_dropdown",
    placeholder: "Kursni tanlang...",
    required: false,
    enabled: true,
    isSystem: true,
    description: "Qiziqayotgan o'quv kursi",
  },
  {
    id: "grade",
    name: "grade",
    label: "Sinfi",
    type: "single_select",
    placeholder: "Sinfni tanlang...",
    required: false,
    enabled: true,
    isSystem: false,
    options: [
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
    ],
    description: "O'quvchining sinfi yoki darajasi",
  },
];

export function getSavedLeadFormFields() {
  try {
    const saved = localStorage.getItem("edu_crm_lead_form_fields_v3");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((f, idx) => {
          const fid = f.id || f.name || `field_${idx}_${Date.now()}`;
          return {
            ...f,
            id: fid,
            name: f.name || fid,
          };
        });
      }
    }
  } catch {}
  return DEFAULT_LEAD_FORM_FIELDS;
}

export function LeadFormSettingsBuilder({
  courses = [],
  groups = [],
  teachers = [],
  onSave,
}) {
  // Load saved fields or defaults
  const [fields, setFields] = useState(() => {
    try {
      const saved = localStorage.getItem("edu_crm_lead_form_fields_v3");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((f, idx) => {
            const fid = f.id || f.name || `field_${idx}_${Date.now()}`;
            return {
              ...f,
              id: fid,
              name: f.name || fid,
            };
          });
        }
      }
    } catch {}
    return DEFAULT_LEAD_FORM_FIELDS;
  });

  const [formHeader, setFormHeader] = useState(() => {
    try {
      const saved = localStorage.getItem("edu_crm_lead_form_header_v2");
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      title: "O'quv kurslariga qabul",
      subtitle: "Quyidagi formani to'ldiring, ma'muriyatimiz siz bilan 15 daqiqa ichida bog'lanadi!",
    };
  });

  const [activeDevice, setActiveDevice] = useState("desktop"); // 'desktop' | 'mobile'
  const [saveToast, setSaveToast] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [highlightedFieldId, setHighlightedFieldId] = useState(null);

  // Direct editing state: which element is currently being inline-edited
  // { fieldId, part: 'label' | 'description' | 'placeholder' | 'options' }
  const [editingPart, setEditingPart] = useState(null);
  const [newOptionInput, setNewOptionInput] = useState("");

  // Live test interactive form state
  const [liveFormData, setLiveFormData] = useState({});
  const [liveSubmitSuccess, setLiveSubmitSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Sync / Persist changes
  const handlePersist = (updatedFields) => {
    setFields(updatedFields);
    try {
      localStorage.setItem("edu_crm_lead_form_fields_v3", JSON.stringify(updatedFields));
    } catch {}
    if (onSave) onSave(updatedFields);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  const handleHeaderChange = (key, val) => {
    const next = { ...formHeader, [key]: val };
    setFormHeader(next);
    try {
      localStorage.setItem("edu_crm_lead_form_header_v2", JSON.stringify(next));
    } catch {}
  };

  // Add new field from type card
  const handleAddFieldFromType = (typeObj) => {
    const uniqueId = `custom_field_${Date.now()}`;
    const newField = {
      id: uniqueId,
      name: uniqueId,
      type: typeObj.id,
      label: `Yangi ${typeObj.label.split(" ")[0]} maydoni`,
      placeholder: typeObj.defaultPlaceholder || "Matn kiriting...",
      required: false,
      enabled: true,
      isSystem: false,
      description: "Qisqa ma'lumot yoki izoh",
      options: typeObj.defaultOptions ? [...typeObj.defaultOptions] : undefined,
    };

    const nextFields = [...fields, newField];
    handlePersist(nextFields);
    setHighlightedFieldId(uniqueId);
    setEditingPart({ fieldId: uniqueId, part: "label" });
    setTimeout(() => setHighlightedFieldId(null), 2500);

    setTimeout(() => {
      const el = document.getElementById(`live-field-${uniqueId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  };

  // Add Quick Template field
  const handleAddQuickTemplate = (tpl) => {
    const uniqueId = `custom_field_${Date.now()}`;
    const newField = {
      id: uniqueId,
      name: uniqueId,
      type: tpl.type,
      label: tpl.label,
      placeholder: tpl.placeholder || "",
      required: false,
      enabled: true,
      isSystem: false,
      description: tpl.description || "",
      options: tpl.options ? [...tpl.options] : undefined,
    };

    const nextFields = [...fields, newField];
    handlePersist(nextFields);
    setHighlightedFieldId(uniqueId);
    setTimeout(() => setHighlightedFieldId(null), 2500);
  };

  // Update specific field property
  const handleFieldUpdate = (id, patch) => {
    const updated = fields.map((f) => (f.id === id ? { ...f, ...patch } : f));
    handlePersist(updated);
  };

  // Toggle field required
  const toggleRequired = (id) => {
    const updated = fields.map((f) =>
      f.id === id ? { ...f, required: !f.required } : f
    );
    handlePersist(updated);
  };

  // Toggle field enabled/disabled
  const toggleEnabled = (id) => {
    const updated = fields.map((f) =>
      f.id === id ? { ...f, enabled: !f.enabled } : f
    );
    handlePersist(updated);
  };

  // Move Up / Down
  const moveField = (index, direction) => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= fields.length) return;
    const clone = [...fields];
    const temp = clone[index];
    clone[index] = clone[targetIndex];
    clone[targetIndex] = temp;
    handlePersist(clone);
  };

  // Delete field
  const deleteField = (id) => {
    const target = fields.find((f) => f.id === id);
    if (target?.isSystem && (target.name === "name" || target.name === "phone")) {
      alert("Ism va asosiy telefon tizimning tayanch maydoni bo'lgani sababli o'chirilmaydi. Uni ixtiyoriy qilishingiz mumkin.");
      return;
    }
    const updated = fields.filter((f) => f.id !== id);
    handlePersist(updated);
  };

  // Add Option to Select/Radio/Multi
  const handleAddOption = (fieldId) => {
    const inputVal = (newOptionInput || "").trim();
    if (!inputVal) return;

    const field = fields.find((f) => f.id === fieldId);
    if (!field) return;

    const currentOptions = field.options || [];
    if (currentOptions.includes(inputVal)) return;

    const updatedOptions = [...currentOptions, inputVal];
    handleFieldUpdate(fieldId, { options: updatedOptions });
    setNewOptionInput("");
  };

  // Remove Option from Select/Radio/Multi
  const handleRemoveOption = (fieldId, optionToRemove) => {
    const field = fields.find((f) => f.id === fieldId);
    if (!field || !field.options) return;

    const updatedOptions = field.options.filter((opt) => opt !== optionToRemove);
    handleFieldUpdate(fieldId, { options: updatedOptions });
  };

  // Reset to default
  const resetToDefault = () => {
    setShowResetConfirm(true);
  };

  const confirmResetAction = () => {
    handlePersist(DEFAULT_LEAD_FORM_FIELDS);
    const defaultHead = {
      title: "O'quv kurslariga qabul",
      subtitle: "Quyidagi formani to'ldiring, ma'muriyatimiz siz bilan 15 daqiqa ichida bog'lanadi!",
    };
    setFormHeader(defaultHead);
    try {
      localStorage.setItem("edu_crm_lead_form_header_v2", JSON.stringify(defaultHead));
    } catch {}
    setShowResetConfirm(false);
  };

  // Live test form submit
  const handleLiveFormSubmit = (e) => {
    e.preventDefault();
    setLiveSubmitSuccess(true);
    setTimeout(() => {
      setLiveSubmitSuccess(false);
      setLiveFormData({});
    }, 4000);
  };

  const formShareUrl = `${window.location.origin}/apply-form`;
  const formEmbedCode = `<iframe src="${formShareUrl}" width="100%" height="750" frameborder="0"></iframe>`;

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

  const activeFieldsCount = fields.filter((f) => f.enabled !== false).length;

  return (
    <div className="space-y-5">
      {/* Toast */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 size={16} />
          <span>Forma sozlamalari saqlandi!</span>
        </div>
      )}

      {/* Top Banner & Control Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4.5 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
            <Sliders size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Jonli WYSIWYG Lid Formasi</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Jonli Ishchi Rejim
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Formaning o'zida bevosita title, placeholder va tag ustiga bosing — shu zahoti o'zgartiring va bir vaqtning o'zida to'ldirib sinab ko'ring!
            </p>
          </div>
        </div>

        {/* Action buttons & Device switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Device toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveDevice("desktop")}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeDevice === "desktop"
                  ? "bg-white dark:bg-slate-800 text-violet-600 shadow-2xs"
                  : "text-slate-500 hover:text-slate-700"
              }`}
              title="Kompyuter ko'rinishi"
            >
              <Laptop size={15} />
              <span className="hidden sm:inline">Desktop</span>
            </button>
            <button
              onClick={() => setActiveDevice("mobile")}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeDevice === "mobile"
                  ? "bg-white dark:bg-slate-800 text-violet-600 shadow-2xs"
                  : "text-slate-500 hover:text-slate-700"
              }`}
              title="Telefon ko'rinishi"
            >
              <Smartphone size={15} />
              <span className="hidden sm:inline">Mobil</span>
            </button>
          </div>

          <button
            onClick={resetToDefault}
            className="px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Boshlang'ich holatga qaytarish"
          >
            <RotateCcw size={13} />
            <span className="hidden sm:inline">Standart holat</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout: Left = Palette & Presets, Right = 100% Live Visual Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Input Types & Quick Templates */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4.5 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs space-y-3">
            <div className="pb-1 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                <Plus size={14} className="text-violet-600" />
                <span>Yangi Maydon Qo'shish</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Input turini tanlang, u o'ngdagi jonli formaga qo'shiladi:
              </p>
            </div>

            {/* Input Type Cards Palette */}
            <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
              {FIELD_TYPES.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => handleAddFieldFromType(t)}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/60 hover:bg-violet-50/70 dark:hover:bg-violet-950/40 hover:border-violet-300 dark:hover:border-violet-700 transition-all text-left flex items-center justify-between gap-2 group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border ${t.badgeColor} group-hover:scale-105 transition-transform`}
                      >
                        <Icon size={13} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-violet-700 dark:group-hover:text-violet-300 truncate">
                          {t.label}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {t.desc}
                        </p>
                      </div>
                    </div>
                    <span className="w-6 h-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 group-hover:bg-violet-600 group-hover:border-violet-600 group-hover:text-white shrink-0 transition-colors shadow-2xs">
                      <Plus size={12} />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Preset Templates */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4.5 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs space-y-3">
            <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-500" />
              <span>Tezkor Maydon Shablonlari (1-klik)</span>
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_FIELD_TEMPLATES.map((tpl, i) => (
                <button
                  key={i}
                  onClick={() => handleAddQuickTemplate(tpl)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:border-amber-300 text-slate-700 dark:text-slate-300 text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus size={11} className="text-amber-600" />
                  <span>{tpl.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Share & Embed Quick Box */}
          <div className="bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/30 rounded-xl p-4.5 border border-violet-200/80 dark:border-violet-900/50 space-y-3">
            <h4 className="font-bold text-xs text-violet-900 dark:text-violet-200 flex items-center gap-1.5">
              <Share2 size={14} className="text-violet-600" />
              <span>Havola va Saytga o'rnatish kodi</span>
            </h4>
            
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  readOnly
                  value={formShareUrl}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-violet-200 dark:border-violet-800 rounded-xl text-[11px] font-mono text-slate-600 dark:text-slate-300 focus:outline-none"
                />
                <button
                  onClick={() => copyToClipboard(formShareUrl, "link")}
                  className="px-2.5 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-bold rounded-xl transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                  title="Havolani nusxalash"
                >
                  <Copy size={12} />
                  <span>{copiedLink ? "✓" : "Link"}</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  readOnly
                  value={formEmbedCode}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-violet-200 dark:border-violet-800 rounded-xl text-[11px] font-mono text-slate-600 dark:text-slate-300 focus:outline-none"
                />
                <button
                  onClick={() => copyToClipboard(formEmbedCode, "embed")}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-[11px] font-bold rounded-xl transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                  title="iFrame kodini nusxalash"
                >
                  <Code2 size={12} />
                  <span>{copiedEmbed ? "✓" : "iFrame"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 100% JONLI INTERAKTIV FORMA (LIVE WYSIWYG) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Canvas Container */}
          <div className="bg-slate-100/80 dark:bg-slate-900/80 rounded-xl p-4 sm:p-7 border border-slate-200 dark:border-slate-800 flex justify-center">
            
            {/* Form Sheet Card */}
            <div
              className={`bg-white dark:bg-slate-800 rounded-xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-700/80 shadow-md transition-all ${
                activeDevice === "mobile"
                  ? "w-full max-w-[390px] border-4 border-slate-300 dark:border-slate-700 rounded-xl px-5 py-7 shadow-2xl"
                  : "w-full max-w-2xl"
              }`}
            >
              {/* Device Notch if Mobile */}
              {activeDevice === "mobile" && (
                <div className="w-24 h-4 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-5 -mt-3" />
              )}

              {/* Form Header (Editable directly) */}
              <div className="text-center mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/80 relative group">
                <div className="w-12 h-12 bg-gradient-to-tr from-violet-600 to-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-lg mx-auto mb-3 shadow-md">
                  CRM
                </div>

                <div className="space-y-1.5">
                  <div className="relative group/title">
                    <input
                      type="text"
                      value={formHeader.title}
                      onChange={(e) => handleHeaderChange("title", e.target.value)}
                      className="w-full text-center font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white bg-transparent hover:bg-slate-50 dark:hover:bg-slate-900/50 focus:bg-white dark:focus:bg-slate-900 border border-transparent hover:border-violet-300 focus:border-violet-500 rounded-xl px-3 py-1 focus:outline-none transition-all"
                      placeholder="Forma sarlavhasi..."
                      title="Sarlavhani to'g'ridan-to'g'ri tahrirlash uchun bosing"
                    />
                    <Edit3 size={12} className="absolute right-2 top-2.5 text-slate-300 opacity-0 group-hover/title:opacity-100 transition-opacity pointer-events-none" />
                  </div>

                  <div className="relative group/sub">
                    <input
                      type="text"
                      value={formHeader.subtitle}
                      onChange={(e) => handleHeaderChange("subtitle", e.target.value)}
                      className="w-full text-center text-xs text-slate-500 dark:text-slate-400 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-900/50 focus:bg-white dark:focus:bg-slate-900 border border-transparent hover:border-violet-300 focus:border-violet-500 rounded-xl px-3 py-1 focus:outline-none transition-all"
                      placeholder="Forma tavsifi / yo'riqnomasi..."
                      title="Tavsifni tahrirlash uchun bosing"
                    />
                    <Edit3 size={12} className="absolute right-2 top-2 text-slate-300 opacity-0 group-hover/sub:opacity-100 transition-opacity pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Instructions banner */}
              <div className="mb-4 flex items-center justify-between text-[11px] bg-violet-50/70 dark:bg-violet-950/30 p-2.5 rounded-xl border border-violet-200/60 dark:border-violet-900/40">
                <span className="text-violet-700 dark:text-violet-300 font-medium flex items-center gap-1.5">
                  <Sparkles size={13} className="text-violet-600 shrink-0" />
                  <span>Sarlavha, tag yoki placeholder ustiga bosib tahrirlang. Formani to'ldirib yuborishingiz mumkin!</span>
                </span>
                <span className="font-bold text-violet-800 dark:text-violet-200 shrink-0">
                  {activeFieldsCount} ta maydon
                </span>
              </div>

              {/* LIVE FORM CONTENT */}
              {liveSubmitSuccess ? (
                <div className="py-10 text-center space-y-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 p-6 animate-fade-in">
                  <div className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <CheckCircle2 size={32} />
                  </div>
                  <h4 className="font-bold text-base text-emerald-900 dark:text-emerald-200">
                    Arizangiz muvaffaqiyatli qabul qilindi!
                  </h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 max-w-xs mx-auto">
                    Jonli sinov a'lo darajada o'tdi. Tez orada administrator mijoz bilan bog'lanadi.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleLiveFormSubmit} className="space-y-4">
                  {fields.map((field, idx) => {
                    const fieldKey = field.id || field.name || `field_${idx}`;
                    const isEnabled = field.enabled !== false;
                    const typeObj = FIELD_TYPES.find((t) => t.id === field.type) || FIELD_TYPES[0];
                    const TypeIcon = typeObj.icon;
                    const isHighlighted = highlightedFieldId === field.id;
                    const isEditingLabel = editingPart?.fieldId === field.id && editingPart?.part === "label";
                    const isEditingDesc = editingPart?.fieldId === field.id && editingPart?.part === "description";
                    const isEditingOptions = editingPart?.fieldId === field.id && editingPart?.part === "options";

                    return (
                      <div
                        id={`live-field-${field.id}`}
                        key={field.id}
                        className={`rounded-xl transition-all relative p-3.5 border group/field ${
                          isHighlighted
                            ? "ring-2 ring-violet-500 bg-violet-50/50 dark:bg-violet-950/30 border-violet-400"
                            : isEnabled
                            ? "bg-slate-50/70 dark:bg-slate-900/50 border-slate-200/90 dark:border-slate-700/80 hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-xs"
                            : "bg-slate-100/40 dark:bg-slate-900/20 border-dashed border-slate-300 dark:border-slate-800 opacity-60"
                        }`}
                      >
                        {/* FIELD ACTION TOOLBAR (Top right: Required, Up, Down, Hide, Delete) */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5">
                            {/* Type tag */}
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-xl border flex items-center gap-1 ${typeObj.badgeColor}`}
                            >
                              <TypeIcon size={11} />
                              <span>{typeObj.label.split(" ")[0]}</span>
                            </span>

                            {/* Required / Optional Toggle Button (1-Click) */}
                            <button
                              type="button"
                              onClick={() => toggleRequired(field.id)}
                              className={`text-[10px] font-black px-2 py-0.5 rounded-xl border transition-all cursor-pointer ${
                                field.required
                                  ? "bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800 hover:bg-rose-200"
                                  : "bg-slate-200/70 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700 hover:bg-slate-300"
                              }`}
                              title="Majburiy yoki ixtiyoriy qilish uchun bosing"
                            >
                              {field.required ? "Majburiy *" : "Ixtiyoriy"}
                            </button>
                          </div>

                          {/* Reorder and Delete controls */}
                          <div className="flex items-center gap-1 text-slate-400 opacity-80 group-hover/field:opacity-100 transition-opacity">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => moveField(idx, "up")}
                              className="p-1 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 cursor-pointer rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                              title="Yuqoriga surish"
                            >
                              <MoveUp size={13} />
                            </button>
                            <button
                              type="button"
                              disabled={idx === fields.length - 1}
                              onClick={() => moveField(idx, "down")}
                              className="p-1 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 cursor-pointer rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                              title="Pastga surish"
                            >
                              <MoveDown size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleEnabled(field.id)}
                              className={`p-1 rounded cursor-pointer ${
                                isEnabled
                                  ? "text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200"
                                  : "text-amber-500 bg-amber-50 dark:bg-amber-950"
                              }`}
                              title={isEnabled ? "Yashirish" : "Ko'rsatish"}
                            >
                              {isEnabled ? <Eye size={13} /> : <EyeOff size={13} />}
                            </button>
                            {!field.isSystem && (
                              <button
                                type="button"
                                onClick={() => deleteField(field.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 dark:hover:bg-rose-950 cursor-pointer"
                                title="O'chirish"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* FIELD TITLE / LABEL (Clickable & Editable directly) */}
                        <div className="mb-1.5">
                          {isEditingLabel ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                autoFocus
                                type="text"
                                value={field.label || ""}
                                onChange={(e) =>
                                  handleFieldUpdate(field.id, { label: e.target.value })
                                }
                                onBlur={() => setEditingPart(null)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") setEditingPart(null);
                                }}
                                className="w-full font-bold text-xs text-slate-900 dark:text-white bg-white dark:bg-slate-900 border-2 border-violet-500 rounded-xl px-2.5 py-1 focus:outline-none shadow-xs"
                                placeholder="Maydon sarlavhasi..."
                              />
                              <button
                                type="button"
                                onClick={() => setEditingPart(null)}
                                className="p-1 bg-violet-600 text-white rounded-xl hover:bg-violet-700"
                              >
                                <Check size={13} />
                              </button>
                            </div>
                          ) : (
                            <div
                              onClick={() => setEditingPart({ fieldId: field.id, part: "label" })}
                              className="group/label flex items-center justify-between cursor-pointer hover:bg-white dark:hover:bg-slate-800 px-2 py-0.5 -mx-2 rounded-xl border border-transparent hover:border-violet-300 transition-all"
                              title="Sarlavhani o'zgartirish uchun bosing"
                            >
                              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer flex items-center gap-1">
                                <span>{field.label || "Nomsiz maydon"}</span>
                                {field.required ? (
                                  <span className="text-rose-500 font-bold">*</span>
                                ) : (
                                  <span className="text-[10px] text-slate-400 font-normal">(ixtiyoriy)</span>
                                )}
                              </label>
                              <span className="opacity-0 group-hover/label:opacity-100 text-violet-600 text-[10px] flex items-center gap-0.5 font-semibold">
                                <Edit3 size={11} />
                                <span>Tahrirlash</span>
                              </span>
                            </div>
                          )}
                        </div>

                        {/* FIELD TAG / DESCRIPTION (Clickable & Editable directly) */}
                        <div className="mb-2">
                          {isEditingDesc ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                autoFocus
                                type="text"
                                value={field.description || ""}
                                onChange={(e) =>
                                  handleFieldUpdate(field.id, { description: e.target.value })
                                }
                                onBlur={() => setEditingPart(null)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") setEditingPart(null);
                                }}
                                className="w-full text-[11px] text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border-2 border-violet-500 rounded-xl px-2 py-0.5 focus:outline-none"
                                placeholder="Yordamchi izoh / tag yozing..."
                              />
                              <button
                                type="button"
                                onClick={() => setEditingPart(null)}
                                className="p-1 bg-violet-600 text-white rounded-xl hover:bg-violet-700"
                              >
                                <Check size={12} />
                              </button>
                            </div>
                          ) : (
                            <div
                              onClick={() => setEditingPart({ fieldId: field.id, part: "description" })}
                              className="group/desc flex items-center justify-between cursor-pointer hover:bg-white dark:hover:bg-slate-800 px-2 py-0.5 -mx-2 rounded-xl border border-transparent hover:border-violet-300 transition-all"
                              title="Izoh (tag)ni o'zgartirish uchun bosing"
                            >
                              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                <Tag size={10} className="text-slate-300" />
                                <span>{field.description || "+ Tag / yordamchi izoh qo'shish..."}</span>
                              </p>
                              <span className="opacity-0 group-hover/desc:opacity-100 text-violet-600 text-[10px] flex items-center gap-0.5">
                                <Edit3 size={10} />
                              </span>
                            </div>
                          )}
                        </div>

                        {/* LIVE INTERACTIVE INPUT ELEMENT */}
                        <div className="space-y-2">
                          
                          {/* 1. COURSE DROPDOWN */}
                          {field.type === "course_dropdown" && (
                            <SearchableCourseSelect
                              courses={courses || []}
                              value={liveFormData[fieldKey] || ""}
                              onChange={(cid) =>
                                setLiveFormData({ ...liveFormData, [fieldKey]: cid })
                              }
                              placeholder={field.placeholder || "Kursni qidirish yoki tanlash..."}
                            />
                          )}

                          {/* 2. GROUP DROPDOWN */}
                          {field.type === "group_dropdown" && (
                            <SearchableGroupSelect
                              groups={groups || []}
                              courses={courses || []}
                              teachers={teachers || []}
                              students={[]}
                              value={liveFormData[fieldKey] || ""}
                              onChange={(gid) =>
                                setLiveFormData({ ...liveFormData, [fieldKey]: gid })
                              }
                              placeholder={field.placeholder || "Guruhni qidirish yoki tanlash..."}
                            />
                          )}

                          {/* 3. SINGLE SELECT (Dropdown) */}
                          {field.type === "single_select" && (
                            <div className="space-y-2">
                              <select
                                value={liveFormData[fieldKey] || ""}
                                onChange={(e) =>
                                  setLiveFormData({ ...liveFormData, [fieldKey]: e.target.value })
                                }
                                className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-violet-500 focus:outline-none"
                              >
                                <option value="">{field.placeholder || "Ro'yxatdan tanlang..."}</option>
                                {(field.options || []).map((opt) => (
                                  <option key={opt} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>

                              {/* Editable Options Chips Container */}
                              <div className="p-2 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                                    Variantlar ({field.options?.length || 0}):
                                  </span>
                                  <span className="text-[10px] text-violet-600 font-semibold">
                                    + Yangi variant qo'shing yoki o'chiring
                                  </span>
                                </div>
                                
                                <div className="flex flex-wrap gap-1">
                                  {(field.options || []).map((opt) => (
                                    <span
                                      key={opt}
                                      className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1"
                                    >
                                      <span>{opt}</span>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveOption(field.id, opt)}
                                        className="text-slate-400 hover:text-rose-500 cursor-pointer"
                                        title="Variantni o'chirish"
                                      >
                                        <X size={11} />
                                      </button>
                                    </span>
                                  ))}
                                </div>

                                {/* Add option input */}
                                <div className="flex items-center gap-1 pt-1">
                                  <input
                                    type="text"
                                    placeholder="Yangi variant yozing..."
                                    value={editingPart?.fieldId === field.id ? newOptionInput : ""}
                                    onFocus={() => setEditingPart({ fieldId: field.id, part: "options" })}
                                    onChange={(e) => setNewOptionInput(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleAddOption(field.id);
                                      }
                                    }}
                                    className="flex-1 px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] focus:outline-none focus:border-violet-500"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleAddOption(field.id)}
                                    className="px-2.5 py-1 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-[11px] font-bold cursor-pointer"
                                  >
                                    + Qo'shish
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 4. MULTIPLE SELECT */}
                          {field.type === "multiple_select" && (
                            <div className="space-y-2">
                              <div className="flex flex-wrap gap-1.5">
                                {(field.options || []).map((opt) => {
                                  const selectedArr = Array.isArray(liveFormData[fieldKey])
                                    ? liveFormData[fieldKey]
                                    : [];
                                  const isSelected = selectedArr.includes(opt);

                                  return (
                                    <button
                                      type="button"
                                      key={opt}
                                      onClick={() => {
                                        const next = isSelected
                                          ? selectedArr.filter((i) => i !== opt)
                                          : [...selectedArr, opt];
                                        setLiveFormData({ ...liveFormData, [fieldKey]: next });
                                      }}
                                      className={`px-2.5 py-1 rounded-xl text-xs font-medium border transition-colors cursor-pointer flex items-center gap-1 ${
                                        isSelected
                                          ? "bg-violet-600 text-white border-violet-600 shadow-2xs"
                                          : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-violet-300"
                                      }`}
                                    >
                                      {isSelected && <Check size={12} />}
                                      <span>{opt}</span>
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Editable Options Chips Container */}
                              <div className="p-2 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">
                                  Tugmalar ro'yxati:
                                </span>
                                <div className="flex flex-wrap gap-1">
                                  {(field.options || []).map((opt) => (
                                    <span
                                      key={opt}
                                      className="px-2 py-0.5 bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[11px] rounded-xl border border-purple-200 dark:border-purple-800 flex items-center gap-1"
                                    >
                                      <span>{opt}</span>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveOption(field.id, opt)}
                                        className="text-purple-400 hover:text-rose-500 cursor-pointer"
                                      >
                                        <X size={11} />
                                      </button>
                                    </span>
                                  ))}
                                </div>
                                <div className="flex items-center gap-1 pt-1">
                                  <input
                                    type="text"
                                    placeholder="Yangi variant yozing..."
                                    value={editingPart?.fieldId === field.id ? newOptionInput : ""}
                                    onFocus={() => setEditingPart({ fieldId: field.id, part: "options" })}
                                    onChange={(e) => setNewOptionInput(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleAddOption(field.id);
                                      }
                                    }}
                                    className="flex-1 px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] focus:outline-none focus:border-violet-500"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleAddOption(field.id)}
                                    className="px-2.5 py-1 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-[11px] font-bold cursor-pointer"
                                  >
                                    + Qo'shish
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 5. RADIO BUTTONS */}
                          {field.type === "radio" && (
                            <div className="space-y-2">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {(field.options || []).map((opt) => (
                                  <label
                                    key={opt}
                                    className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs cursor-pointer hover:border-violet-300 transition-colors"
                                  >
                                    <input
                                      type="radio"
                                      name={`radio-${fieldKey}`}
                                      checked={liveFormData[fieldKey] === opt}
                                      onChange={() =>
                                        setLiveFormData({ ...liveFormData, [fieldKey]: opt })
                                      }
                                      className="text-violet-600 focus:ring-violet-500"
                                    />
                                    <span className="text-slate-700 dark:text-slate-300 font-medium">{opt}</span>
                                  </label>
                                ))}
                              </div>

                              {/* Editable Options Chips Container */}
                              <div className="p-2 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">
                                  Radio variantlar:
                                </span>
                                <div className="flex flex-wrap gap-1">
                                  {(field.options || []).map((opt) => (
                                    <span
                                      key={opt}
                                      className="px-2 py-0.5 bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300 text-[11px] rounded-xl border border-violet-200 dark:border-violet-800 flex items-center gap-1"
                                    >
                                      <span>{opt}</span>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveOption(field.id, opt)}
                                        className="text-violet-400 hover:text-rose-500 cursor-pointer"
                                      >
                                        <X size={11} />
                                      </button>
                                    </span>
                                  ))}
                                </div>
                                <div className="flex items-center gap-1 pt-1">
                                  <input
                                    type="text"
                                    placeholder="Yangi radio varianti..."
                                    value={editingPart?.fieldId === field.id ? newOptionInput : ""}
                                    onFocus={() => setEditingPart({ fieldId: field.id, part: "options" })}
                                    onChange={(e) => setNewOptionInput(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleAddOption(field.id);
                                      }
                                    }}
                                    className="flex-1 px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] focus:outline-none focus:border-violet-500"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleAddOption(field.id)}
                                    className="px-2.5 py-1 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-[11px] font-bold cursor-pointer"
                                  >
                                    + Qo'shish
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 6. TEXTAREA */}
                          {field.type === "textarea" && (
                            <div className="space-y-1.5">
                              <textarea
                                rows={2}
                                placeholder={field.placeholder || "Izoh yozing..."}
                                value={liveFormData[fieldKey] || ""}
                                onChange={(e) =>
                                  setLiveFormData({ ...liveFormData, [fieldKey]: e.target.value })
                                }
                                className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-violet-500 focus:outline-none resize-none"
                              />
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                <span>Namuna (placeholder):</span>
                                <input
                                  type="text"
                                  value={field.placeholder || ""}
                                  onChange={(e) =>
                                    handleFieldUpdate(field.id, { placeholder: e.target.value })
                                  }
                                  placeholder="Placeholder matnini o'zgartirish..."
                                  className="flex-1 px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] focus:outline-none focus:border-violet-500"
                                />
                              </div>
                            </div>
                          )}

                          {/* 7. TEXT, NUMBER, DATE, CUSTOM */}
                          {!["course_dropdown", "group_dropdown", "single_select", "multiple_select", "radio", "textarea"].includes(
                            field.type
                          ) && (
                            <div className="space-y-1.5">
                              <div className="relative">
                                <input
                                  type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                                  placeholder={field.placeholder || "Matn kiriting..."}
                                  value={liveFormData[fieldKey] || ""}
                                  onChange={(e) =>
                                    setLiveFormData({ ...liveFormData, [fieldKey]: e.target.value })
                                  }
                                  className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-violet-500 focus:outline-none"
                                />
                              </div>

                              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                <span>Namuna (placeholder):</span>
                                <input
                                  type="text"
                                  value={field.placeholder || ""}
                                  onChange={(e) =>
                                    handleFieldUpdate(field.id, { placeholder: e.target.value })
                                  }
                                  placeholder="Placeholder matnini o'zgartirish..."
                                  className="flex-1 px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] focus:outline-none focus:border-violet-500"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* SUBMIT BUTTON (TESTABLE) */}
                  <div className="pt-3">
                    <button
                      type="submit"
                      className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Send size={14} />
                      <span>Ariza topshirish (Jonli Sinash)</span>
                    </button>
                    <p className="text-center text-[10px] text-slate-400 mt-1.5">
                      Formani xuddi mijozdek to'ldirib sinab ko'rishingiz mumkin
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {showResetConfirm && (
        <ConfirmModal
          title="Boshlang'ich holatga qaytarish"
          message="Barcha maydonlarni va sarlavhani standart boshlang'ich holatga qaytarmoqchimisiz?"
          confirmText="Ha, qaytarish"
          cancelText="Bekor qilish"
          danger={false}
          onConfirm={confirmResetAction}
          onCancel={() => setShowResetConfirm(false)}
        />
      )}
    </div>
  );
}

export default LeadFormSettingsBuilder;

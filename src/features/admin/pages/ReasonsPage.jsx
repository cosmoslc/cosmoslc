import React, { useState } from "react";
import {
  Settings,
  UserX,
  UserCheck,
  UserMinus,
  Snowflake,
  Users,
  Plus,
  Trash2,
  Pencil,
  Info,
  CheckCircle2,
  AlertTriangle,
  Search,
  HelpCircle,
  X,
  ShieldAlert,
  Percent,
  Check,
  AlertCircle,
  SlidersHorizontal,
} from "lucide-react";
import {
  GLASS,
  INPUT_CLS,
  LABEL_CLS,
  BTN_PRIMARY,
  BTN_SECONDARY,
  BTN_DANGER,
} from "../theme/tokens";
import { EmptyState } from "../components/primitives";
import { formatDate, todayISO } from "../utils/helpers";

const TABS = [
  { id: "sozlamalar", label: "Sozlamalar", icon: Settings, color: "text-slate-500" },
  { id: "oquvchi_kelmaganda", label: "O'quvchi kelmaganda", icon: UserX, color: "text-amber-500" },
  { id: "activedan_ochirilganda", label: "Faol talaba o'chirilganda", icon: UserMinus, color: "text-rose-500" },
  { id: "sinovdan_ochirilganda", label: "Sinovdagi talaba o'chirilganda", icon: ShieldAlert, color: "text-orange-500" },
  { id: "muzlatilganda", label: "Muzlatilganda", icon: Snowflake, color: "text-cyan-500" },
  { id: "talaba_qaytarilganda", label: "Talaba qaytarilganda", icon: UserCheck, color: "text-emerald-500" },
  { id: "liddan_ochirilganda", label: "Liddan o'chirilganda", icon: UserX, color: "text-purple-500" },
  { id: "guruh_ochirilganda", label: "Guruh o'chirilganda", icon: Users, color: "text-indigo-500" },
];

const SETTING_ITEMS = [
  {
    key: "oquvchi_kelmaganda",
    title: "O'quvchi kelmaganda (O'qituvchi davomat qilganda) sabab qo'shilsin",
    description: "O'qituvchi dars vaqtida o'quvchiga 'Kelmagan' belgilaganda sabab tanlash oynasi va sabablar ro'yxati ko'rinsin.",
    badge: "Davomat",
  },
  {
    key: "activedan_ochirilganda",
    title: "Faol (Active) talaba guruhdan/markazdan o'chirilganda sabab qo'shilsin",
    description: "Faol o'qiyotgan talaba guruhdan chiqarilganda yoki arxivlanganda ketish sababi belgilansin.",
    badge: "Chiqarish",
  },
  {
    key: "sinovdan_ochirilganda",
    title: "Sinovdagi talaba o'chirilganda sabab belgilash",
    description: "Sinov darsiga kelgan va davom ettirmasdan o'chirilgan talaba uchun sababini qayd etish.",
    badge: "Sinov",
  },
  {
    key: "muzlatilganda",
    title: "Talaba muzlatilganda sabab qo'shilsin",
    description: "Talaba o'qishini vaqtincha muzlatganda (muzlatilgan statusiga o'tkazilganda) sabab belgilash.",
    badge: "Muzlatish",
  },
  {
    key: "sinov_qaytarilganda",
    title: "Talaba sinov darajasiga qaytarilganda sabab belgilash",
    description: "Asosiy guruhdan sinov bosqichiga yoki qayta sinovga o'tkazilganda sabab tanlash.",
    badge: "Qaytarish",
  },
  {
    key: "talaba_qaytarilganda",
    title: "Talaba qaytarilganda (qayta tiklanganda) sabab belgilash",
    description: "Arxivlangan yoki chiqarilgan talaba o'qishga qaytganda/tiklanganda sababini kiritish.",
    badge: "Tiklash",
  },
  {
    key: "liddan_ochirilganda",
    title: "Lid o'chirilganda sabab belgilash",
    description: "CRM tizimidagi potensial mijoz (lid) rad etilganda yoki arxivlanganda sababi tanlanishi.",
    badge: "Lid/CRM",
  },
  {
    key: "guruh_ochirilganda",
    title: "Guruh o'chirilganda sabab belgilash",
    description: "Guruh tugatilganda, yopilganda yoki bekor qilinganda sababini tizimga qayd etish.",
    badge: "Guruhlar",
  },
];

const PRESET_COLORS = [
  { name: "Qizil", hex: "#EF4444" },
  { name: "Sariq/Amber", hex: "#F59E0B" },
  { name: "Yashil", hex: "#10B981" },
  { name: "Ko'k", hex: "#3B82F6" },
  { name: "Binafsha", hex: "#8B5CF6" },
  { name: "Pushti", hex: "#EC4899" },
  { name: "Kulrang", hex: "#64748B" },
];

const INITIAL_REASONS = {
  oquvchi_kelmaganda: [
    { id: "r1", title: "Betobligi / Kasallik sababli", color: "#EF4444", affectsStudentBalance: false, affectsTeacherShare: false, date: "2026-08-01" },
    { id: "r2", title: "Sababsiz kelmadi (Vaqtida aytmadi)", color: "#F59E0B", affectsStudentBalance: true, affectsTeacherShare: true, date: "2026-08-05" },
    { id: "r3", title: "Sayohat / Boshqa shaharga ketgan", color: "#3B82F6", affectsStudentBalance: false, affectsTeacherShare: false, date: "2026-08-10" },
    { id: "r4", title: "Maktab / Universitet imtihonlari", color: "#8B5CF6", affectsStudentBalance: false, affectsTeacherShare: false, date: "2026-08-12" },
  ],
  activedan_ochirilganda: [
    { id: "r5", title: "Narxi qimmatlik qildi", color: "#EF4444", adminFault: 0, teacherFault: 0, date: "2026-08-02" },
    { id: "r6", title: "Dars sifati ma'qul kelmadi", color: "#EC4899", adminFault: 50, teacherFault: 50, date: "2026-08-03" },
    { id: "r7", title: "O'qituvchi bilan muomala to'g'ri kelmadi", color: "#F59E0B", adminFault: 0, teacherFault: 100, date: "2026-08-14" },
    { id: "r8", title: "Vaqt va jadval to'g'ri kelmadi", color: "#3B82F6", adminFault: 0, teacherFault: 0, date: "2026-08-18" },
  ],
  sinovdan_ochirilganda: [
    { id: "r9", title: "Sinov darsi ma'qul kelmadi", color: "#EC4899", adminFault: 0, teacherFault: 0, date: "2026-08-04" },
    { id: "r10", title: "Boshqa o'quv markazini tanladi", color: "#64748B", adminFault: 0, teacherFault: 0, date: "2026-08-08" },
    { id: "r11", title: "Vaqtinchalik moliyaviy sabab", color: "#F59E0B", adminFault: 0, teacherFault: 0, date: "2026-08-15" },
  ],
  muzlatilganda: [
    { id: "r12", title: "Mavsumiy ta'til / Yozgi ta'til", color: "#10B981", adminFault: 0, teacherFault: 0, date: "2026-08-06" },
    { id: "r13", title: "Salomatlik / Davolanish rejasi", color: "#EF4444", adminFault: 0, teacherFault: 0, date: "2026-08-09" },
    { id: "r14", title: "Vaqtinchalik bandlik / Shaxsiy sabab", color: "#F59E0B", adminFault: 0, teacherFault: 0, date: "2026-08-20" },
  ],
  talaba_qaytarilganda: [
    { id: "r15", title: "Xatolik bilan o'chirilgan edi", color: "#3B82F6", adminFault: 0, teacherFault: 0, date: "2026-08-11" },
    { id: "r16", title: "Qayta o'qishni davom ettirish qarori", color: "#10B981", adminFault: 0, teacherFault: 0, date: "2026-08-19" },
  ],
  liddan_ochirilganda: [
    { id: "r17", title: "Telefon raqami noto'g'ri / Aloqa yo'q", color: "#64748B", adminFault: 0, teacherFault: 0, date: "2026-08-07" },
    { id: "r18", title: "Filial manzili uzoqlik qildi", color: "#F59E0B", adminFault: 0, teacherFault: 0, date: "2026-08-13" },
    { id: "r19", title: "Raqobatchi markazni tanladi", color: "#EF4444", adminFault: 0, teacherFault: 0, date: "2026-08-21" },
  ],
  guruh_ochirilganda: [
    { id: "r20", title: "O'quvchi soni kamligi sababli yopildi", color: "#F59E0B", adminFault: 100, teacherFault: 0, date: "2026-08-16" },
    { id: "r21", title: "O'qituvchi ishdan bo'shaganligi sababli", color: "#EF4444", adminFault: 50, teacherFault: 50, date: "2026-08-22" },
  ],
};

export function ReasonsPage() {
  const [activeTab, setActiveTab] = useState("sozlamalar");
  const [search, setSearch] = useState("");

  const [settings, setSettings] = useState({
    oquvchi_kelmaganda: true,
    activedan_ochirilganda: true,
    sinovdan_ochirilganda: true,
    muzlatilganda: true,
    sinov_qaytarilganda: false,
    talaba_qaytarilganda: true,
    liddan_ochirilganda: true,
    guruh_ochirilganda: true,
  });

  const [reasonsMap, setReasonsMap] = useState(INITIAL_REASONS);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingReason, setEditingReason] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    color: "#3B82F6",
    affectsStudentBalance: false,
    affectsTeacherShare: false,
    adminFault: 0,
    teacherFault: 0,
  });

  const handleToggleSetting = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const openAddModal = () => {
    setEditingReason(null);
    setFormData({
      title: "",
      color: "#3B82F6",
      affectsStudentBalance: false,
      affectsTeacherShare: false,
      adminFault: 0,
      teacherFault: 0,
    });
    setShowModal(true);
  };

  const openEditModal = (reason) => {
    setEditingReason(reason);
    setFormData({
      title: reason.title || "",
      color: reason.color || "#3B82F6",
      affectsStudentBalance: !!reason.affectsStudentBalance,
      affectsTeacherShare: !!reason.affectsTeacherShare,
      adminFault: reason.adminFault ?? 0,
      teacherFault: reason.teacherFault ?? 0,
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const currentList = reasonsMap[activeTab] || [];

    if (editingReason) {
      const updated = currentList.map((item) =>
        item.id === editingReason.id
          ? {
              ...item,
              title: formData.title.trim(),
              color: formData.color,
              affectsStudentBalance: formData.affectsStudentBalance,
              affectsTeacherShare: formData.affectsTeacherShare,
              adminFault: Number(formData.adminFault) || 0,
              teacherFault: Number(formData.teacherFault) || 0,
            }
          : item
      );
      setReasonsMap((prev) => ({ ...prev, [activeTab]: updated }));
    } else {
      const newReason = {
        id: "r_" + Date.now(),
        title: formData.title.trim(),
        color: formData.color,
        affectsStudentBalance: formData.affectsStudentBalance,
        affectsTeacherShare: formData.affectsTeacherShare,
        adminFault: Number(formData.adminFault) || 0,
        teacherFault: Number(formData.teacherFault) || 0,
        date: todayISO(),
      };
      setReasonsMap((prev) => ({
        ...prev,
        [activeTab]: [newReason, ...currentList],
      }));
    }

    setShowModal(false);
  };

  const handleDelete = (id, title) => {
    if (window.confirm(`Rostdan ham "${title}" sababini o'chirmoqchimisiz?`)) {
      const currentList = reasonsMap[activeTab] || [];
      const updated = currentList.filter((item) => item.id !== id);
      setReasonsMap((prev) => ({ ...prev, [activeTab]: updated }));
    }
  };

  const activeTabMeta = TABS.find((t) => t.id === activeTab);
  const currentReasons = (reasonsMap[activeTab] || []).filter((r) =>
    r.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <HelpCircle className="w-7 h-7 text-amber-500" />
            Sabablar va Sozlamalar Boshqaruvi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Talabalar davomati, o'chirilishi, muzlatilishi hamda lid va guruhlar bo'yicha sabablar va jarima foizlari taqvimi
          </p>
        </div>
      </div>

      {/* Top Menu Bar (Tabs) */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearch("");
                }}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 border ${
                  isActive
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                }`}
              >
                <Icon
                  size={16}
                  className={isActive ? "text-white" : tab.color}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      {activeTab === "sozlamalar" ? (
        /* Sozlamalar Tab */
        <div className="space-y-6">
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-blue-500/5 border border-blue-200 dark:border-blue-900/40 shadow-xs flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Sabab so'ralishi sozlamalari (Tizim harakatlari)
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                Quyidagi har bir harakat uchun sabab so'ralishi yoqilganda: o'qituvchi davomat qilganda, admin talabani o'chirganda, muzlatganda yoki qaytarganda foydalanuvchiga tegishli sabablar ro'yxati (dropdown) majburiy/ixtiyoriy chiqarib beriladi.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SETTING_ITEMS.map((item) => {
              const isChecked = !!settings[item.key];
              return (
                <div
                  key={item.key}
                  className={`${GLASS} p-4 sm:p-5 rounded-2xl flex items-start justify-between gap-4 border border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-800 transition-all`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/60">
                        {item.badge}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => handleToggleSetting(item.key)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isChecked ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        isChecked ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Reasons Category Tab (Tables & Add Reason) */
        <div className="space-y-4">
          {/* Top Filter and Add Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className={`${GLASS} px-3.5 py-2.5 rounded-xl flex items-center gap-3 border border-slate-200 dark:border-slate-800 flex-1 max-w-md`}>
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder={`${activeTabMeta?.label} sabablarini qidirish...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent border-none outline-none w-full text-xs sm:text-sm text-slate-800 dark:text-slate-200"
              />
            </div>

            <button
              onClick={openAddModal}
              className={`${BTN_PRIMARY} shadow-md shadow-blue-500/20 whitespace-nowrap`}
            >
              <Plus className="w-4 h-4" />
              Sabab qo'shish
            </button>
          </div>

          {/* Table Container */}
          {currentReasons.length === 0 ? (
            <EmptyState
              icon={HelpCircle}
              title="Sabablar mavjud emas"
              subtitle={
                search
                  ? `"${search}" bo'yicha hech qanday sabab topilmadi.`
                  : `Ushbu bo'lim uchun hali sabablar qo'shilmadi.`
              }
              action={
                <button onClick={openAddModal} className={BTN_PRIMARY}>
                  <Plus className="w-4 h-4" /> Sabab qo'shish
                </button>
              }
            />
          ) : (
            <div className={`${GLASS} rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase text-[11px] tracking-wider">
                      <th className="py-3.5 px-4">Sana</th>
                      <th className="py-3.5 px-4">Sabab nomi</th>
                      <th className="py-3.5 px-4">Rang</th>

                      {activeTab === "oquvchi_kelmaganda" ? (
                        <>
                          <th className="py-3.5 px-4">Talaba balansiga ta'sir qiladimi</th>
                          <th className="py-3.5 px-4">O'qituvchi ulushiga ta'sir qiladimi</th>
                        </>
                      ) : (
                        <>
                          <th className="py-3.5 px-4">Administrator aybi (%)</th>
                          <th className="py-3.5 px-4">O'qituvchi aybi (%)</th>
                          <th className="py-3.5 px-4">Talaba va o'qituvchiga ta'sir qiladimi</th>
                        </>
                      )}

                      <th className="py-3.5 px-4 text-right">Amallar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {currentReasons.map((reason) => (
                      <tr
                        key={reason.id}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        {/* Sana */}
                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap text-xs">
                          {formatDate(reason.date || todayISO())}
                        </td>

                        {/* Sabab nomi */}
                        <td className="py-3.5 px-4 text-slate-900 dark:text-white font-bold">
                          {reason.title}
                        </td>

                        {/* Rang */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                            <span
                              style={{ backgroundColor: reason.color || "#3B82F6" }}
                              className="w-3.5 h-3.5 rounded-full shadow-xs shrink-0"
                            />
                            <code className="text-[11px] font-mono text-slate-700 dark:text-slate-300">
                              {reason.color || "#3B82F6"}
                            </code>
                          </div>
                        </td>

                        {/* Category Specific Columns */}
                        {activeTab === "oquvchi_kelmaganda" ? (
                          <>
                            {/* Talaba balansiga ta'sir qiladimi */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              {reason.affectsStudentBalance ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-900/60 text-amber-700 dark:text-amber-300 text-xs font-bold">
                                  <AlertTriangle size={13} className="text-amber-500" />
                                  Ha (Balansdan ayriladi)
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium">
                                  <CheckCircle2 size={13} className="text-slate-400" />
                                  Yo'q (Balansga ta'sir qilmaydi)
                                </span>
                              )}
                            </td>

                            {/* O'qituvchi ulushiga ta'sir qiladimi */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              {reason.affectsTeacherShare ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200/80 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-bold">
                                  <AlertCircle size={13} className="text-rose-500" />
                                  Ha (Ulush cheklanadi)
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium">
                                  <CheckCircle2 size={13} className="text-slate-400" />
                                  Yo'q (Odatiy maosh to'lanadi)
                                </span>
                              )}
                            </td>
                          </>
                        ) : (
                          <>
                            {/* Admin Aybi */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className="font-bold text-xs px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400">
                                {reason.adminFault || 0}%
                              </span>
                            </td>

                            {/* O'qituvchi Aybi */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className="font-bold text-xs px-2.5 py-1 rounded-lg bg-orange-50 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400">
                                {reason.teacherFault || 0}%
                              </span>
                            </td>

                            {/* Summary Impact */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              {(reason.adminFault || 0) === 0 && (reason.teacherFault || 0) === 0 ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium">
                                  <CheckCircle2 size={13} className="text-emerald-500" />
                                  Pul olinmaydi (0%)
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-900/60 text-amber-700 dark:text-amber-300 text-xs font-bold">
                                  <AlertTriangle size={13} className="text-amber-500" />
                                  Jarima: Admin {reason.adminFault || 0}%, O'qituvchi {reason.teacherFault || 0}%
                                </span>
                              )}
                            </td>
                          </>
                        )}

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditModal(reason)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                              title="Tahrirlash"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(reason.id, reason.title)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                              title="O'chirish"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Reason Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4 text-slate-800 dark:text-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-500" />
                {editingReason ? "Sababni tahrirlash" : "Yangi sabab qo'shish"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Sabab Nomi */}
              <div>
                <label className={`${LABEL_CLS} block mb-1.5`}>
                  Sabab nomi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Betobligi sababli, Narxi qimmatlik qildi..."
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className={`${INPUT_CLS} w-full`}
                  autoFocus
                />
              </div>

              {/* Rang Tanlash */}
              <div>
                <label className={`${LABEL_CLS} block mb-1.5`}>
                  Rang va belgi *
                </label>
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setFormData({ ...formData, color: c.hex })}
                        style={{ backgroundColor: c.hex }}
                        className={`w-7 h-7 rounded-full transition-transform flex items-center justify-center text-white ${
                          formData.color === c.hex
                            ? "scale-110 ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-slate-900 shadow-sm"
                            : "opacity-80 hover:opacity-100"
                        }`}
                        title={c.name}
                      >
                        {formData.color === c.hex && <Check size={14} className="stroke-[3]" />}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) =>
                        setFormData({ ...formData, color: e.target.value })
                      }
                      className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) =>
                        setFormData({ ...formData, color: e.target.value })
                      }
                      className={`${INPUT_CLS} font-mono w-32`}
                      placeholder="#3B82F6"
                    />
                  </div>
                </div>
              </div>

              {/* Conditional Controls Depending on Active Tab */}
              {activeTab === "oquvchi_kelmaganda" ? (
                /* Fields for O'quvchi Kelmaganda Tab */
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-800 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.affectsStudentBalance}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          affectsStudentBalance: e.target.checked,
                        })
                      }
                      className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        Talaba balansiga ta'sir qiladimi?
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block leading-tight">
                        Belgilansa, o'quvchiga dars o'tilmagan bo'lsa ham uning oylik balansidan ushbu dars puli yechiladi.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-800 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.affectsTeacherShare}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          affectsTeacherShare: e.target.checked,
                        })
                      }
                      className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        O'qituvchi ulushini cheklash / ta'sir qiladimi?
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block leading-tight">
                        Belgilansa, ushbu dars uchun o'qituvchining dars maoshi/ulushida cheklov qo'llaniladi.
                      </span>
                    </div>
                  </label>
                </div>
              ) : (
                /* Fields for Other Tabs */
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={`${LABEL_CLS} block mb-1.5`}>
                        Administrator aybi (%)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={formData.adminFault}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              adminFault: Math.min(
                                100,
                                Math.max(0, parseInt(e.target.value) || 0)
                              ),
                            })
                          }
                          className={`${INPUT_CLS} w-full pr-8`}
                          placeholder="0"
                        />
                        <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">
                          %
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className={`${LABEL_CLS} block mb-1.5`}>
                        O'qituvchining aybi (%)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={formData.teacherFault}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              teacherFault: Math.min(
                                100,
                                Math.max(0, parseInt(e.target.value) || 0)
                              ),
                            })
                          }
                          className={`${INPUT_CLS} w-full pr-8`}
                          placeholder="0"
                        />
                        <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">
                          %
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Informational Alert Box */}
                  <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 text-xs leading-relaxed font-medium flex items-start gap-2.5">
                    <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold block text-amber-900 dark:text-amber-200">
                        Eslatma jarima va pul yechilishi bo'yicha:
                      </strong>
                      <span>
                        Agar foiz darajasiga <strong>0</strong> qo'yilsa, hech qanday pul olinmaydi va jarima qo'llanilmaydi.
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={BTN_SECONDARY}
                >
                  Bekor qilish
                </button>
                <button type="submit" className={BTN_PRIMARY}>
                  {editingReason ? "Saqlash" : "Qo'shish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

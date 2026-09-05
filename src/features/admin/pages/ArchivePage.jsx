import React, { useState, useEffect, useMemo } from "react";
import {
  Archive,
  RotateCcw,
  Trash2,
  Search,
  Users,
  GraduationCap,
  Target,
  BookOpen,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Coins,
  AlertTriangle,
  CheckCircle2,
  Filter,
  RefreshCw,
  Info,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowUpRight,
  X,
  UserCheck,
  CreditCard,
  Wallet,
} from "lucide-react";
import {
  fetchArchives,
  archiveRecord,
  restoreRecord,
  permanentlyDeleteRecord,
  clearArchiveType,
} from "../../../shared/api/archives";
import { money } from "../utils/helpers";

const GLASS = "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm text-slate-900 dark:text-slate-100";
const BTN_PRIMARY =
  "inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm active:scale-[0.98]";
const BTN_GHOST =
  "inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 rounded-xl transition-all";

const EMPTY_ARCHIVES = {
  leads: [],
  students: [],
  teachers: [],
  staff: [],
  groups: [],
  courses: [],
  payments: [],
  salaries: [],
  expenses: [],
  additionalIncome: [],
  bonuses: [],
};

export function ArchivePage({
  initialTab = "leads",
  directorData = {},
  opData = {},
  currentBranchId,
  onRestoreGroup,
  onRestoreStudent,
  onRestoreLead,
  onRestoreCourse,
  addNotification = () => {},
}) {
  const [archives, setArchives] = useState(EMPTY_ARCHIVES);
  const [activeTab, setActiveTab] = useState(initialTab || "leads");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState(currentBranchId || "all");

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (currentBranchId !== undefined) {
      setSelectedBranch(currentBranchId);
    }
  }, [currentBranchId]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalAction, setModalAction] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const loadData = async () => {
    const data = await fetchArchives();
    const loaded = data || {};
    const merged = { ...EMPTY_ARCHIVES };
    Object.keys(EMPTY_ARCHIVES).forEach((key) => {
      merged[key] = Array.isArray(loaded[key]) ? loaded[key] : [];
    });
    setArchives(merged);
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    addNotification(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Branches list for filtering
  const branches = directorData.branches || [
    { id: "br-1", name: "Chilonzor filiali" },
    { id: "br-2", name: "Yunusobod filiali" },
  ];

  // Counts
  const counts = useMemo(() => {
    return {
      groups: (archives.groups || []).length,
      students: (archives.students || []).length,
      leads: (archives.leads || []).length,
      courses: (archives.courses || []).length,
      total:
        (archives.groups || []).length +
        (archives.students || []).length +
        (archives.leads || []).length +
        (archives.courses || []).length,
    };
  }, [archives]);

  // Current list filtered
  const filteredList = useMemo(() => {
    const list = archives[activeTab] || [];
    const q = searchQuery.toLowerCase().trim();

    return list.filter((item) => {
      // Branch filter
      if (selectedBranch !== "all") {
        if (item.branchId && item.branchId !== "all" && item.branchId !== selectedBranch) {
          return false;
        }
      }

      if (!q) return true;

      // Match properties
      const nameMatch = (item.name || "").toLowerCase().includes(q);
      const phoneMatch = (item.phone || "").toLowerCase().includes(q);
      const courseMatch = (item.courseName || item.targetCourse || "").toLowerCase().includes(q);
      const teacherMatch = (item.teacherName || "").toLowerCase().includes(q);
      const reasonMatch = (item.reason || item.note || "").toLowerCase().includes(q);

      return nameMatch || phoneMatch || courseMatch || teacherMatch || reasonMatch;
    });
  }, [archives, activeTab, searchQuery, selectedBranch]);

  // Handle Restore
  const handleConfirmRestore = async () => {
    if (!modalAction || !modalAction.item) return;
    const { category, item } = modalAction;

    try {
      const restored = await restoreRecord(category, item.id);
      if (!restored) return;

      // Trigger respective parent callback if provided
      if (category === "groups" && onRestoreGroup) {
        await onRestoreGroup(restored);
      } else if (category === "students" && onRestoreStudent) {
        await onRestoreStudent(restored);
      } else if (category === "leads" && onRestoreLead) {
        await onRestoreLead(restored);
      } else if (category === "courses" && onRestoreCourse) {
        await onRestoreCourse(restored);
      }

      await loadData();
      showToast(
        `"${restored.name || "Element"}" muvaffaqiyatli tiklandi va faol ro'yxatga qaytarildi!`
      );
    } catch (e) {
      console.error(e);
      showToast("Tiklash jarayonida xatolik yuz berdi");
    } finally {
      setModalAction(null);
    }
  };

  // Handle Permanent Delete
  const handleConfirmPermanentDelete = async () => {
    if (!modalAction || !modalAction.item) return;
    const { category, item } = modalAction;

    try {
      await permanentlyDeleteRecord(category, item.id);
      await loadData();
      showToast(`"${item.name || "Element"}" arxivdan butunlay o'chirildi.`);
    } catch (e) {
      console.error(e);
      showToast("O'chirishda xatolik");
    } finally {
      setModalAction(null);
    }
  };

  // Handle Clear All
  const handleConfirmClearAll = async () => {
    if (!modalAction) return;
    const { category } = modalAction;

    try {
      await clearArchiveType(category);
      await loadData();
      showToast(
        category === "all"
          ? "Barcha arxivlar butunlay tozalandi!"
          : `${tabTitle(category)} arxivi butunlay tozalandi!`
      );
    } catch (e) {
      console.error(e);
    } finally {
      setModalAction(null);
    }
  };

  const tabTitle = (tab) => {
    switch (tab) {
      case "leads":
        return "O'chirilgan Lidlar";
      case "students":
        return "O'chirilgan Talabalar";
      case "teachers":
        return "O'chirilgan O'qituvchilar";
      case "staff":
        return "O'chirilgan Xodimlar";
      case "groups":
        return "O'chirilgan Guruhlar";
      case "courses":
        return "O'chirilgan Kurslar";
      case "payments":
        return "O'chirilgan To'lovlar";
      case "salaries":
        return "O'chirilgan Ish Haqlari";
      case "expenses":
        return "O'chirilgan Xarajatlar";
      case "additionalIncome":
        return "O'chirilgan Qo'shimcha Daromadlar";
      case "bonuses":
        return "O'chirilgan Bonuslar";
      default:
        return "Arxiv";
    }
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return "-";
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString("uz-UZ", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return isoStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <p className="text-sm font-medium">{toastMessage}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/25">
            <Archive size={24} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Arxiv & Chiqindilar qutisi
            </h1>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={loadData}
            title="Yangilash"
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-sm"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={() =>
              setModalAction({
                type: "clearAll",
                category: activeTab,
              })
            }
            disabled={filteredList.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 border border-rose-200/80 rounded-xl transition-all disabled:opacity-40 disabled:pointer-events-none"
          >
            <Trash2 size={14} />
            Ushbu bo'limni tozalash
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <button
          onClick={() => setActiveTab("groups")}
          className={`text-left p-4 rounded-xl border transition-all ${
            activeTab === "groups"
              ? "bg-sky-50/90 dark:bg-sky-950/60 border-sky-300 dark:border-sky-700 shadow-sm ring-2 ring-sky-500/20"
              : "bg-white/80 dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/80"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Guruhlar</span>
            <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">{counts.groups}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">O'chirilgan guruhlar</p>
        </button>

        <button
          onClick={() => setActiveTab("students")}
          className={`text-left p-4 rounded-xl border transition-all ${
            activeTab === "students"
              ? "bg-violet-50/90 dark:bg-violet-950/60 border-violet-300 dark:border-violet-700 shadow-sm ring-2 ring-violet-500/20"
              : "bg-white/80 dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/80"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">O'quvchilar</span>
            <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-900/60 text-violet-700 dark:text-violet-300 flex items-center justify-center">
              <GraduationCap size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">{counts.students}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">O'chirilgan o'quvchilar</p>
        </button>

        <button
          onClick={() => setActiveTab("leads")}
          className={`text-left p-4 rounded-xl border transition-all ${
            activeTab === "leads"
              ? "bg-amber-50/90 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 shadow-sm ring-2 ring-amber-500/20"
              : "bg-white/80 dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/80"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Lidlar & Arizalar</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center">
              <Target size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">{counts.leads}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">O'chirilgan arizalar</p>
        </button>

        <button
          onClick={() => setActiveTab("courses")}
          className={`text-left p-4 rounded-xl border transition-all ${
            activeTab === "courses"
              ? "bg-emerald-50/90 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 shadow-sm ring-2 ring-emerald-500/20"
              : "bg-white/80 dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/80"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Kurslar</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <BookOpen size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">{counts.courses}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">O'chirilgan kurslar</p>
        </button>
      </div>

      {/* Main Container */}
      <div className={`${GLASS} rounded-xl p-5 sm:p-6 space-y-5`}>
        {/* Navigation Tabs + Search + Branch filter */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 dark:bg-slate-800/80 rounded-xl max-w-full overflow-x-auto">
            {[
              { id: "leads", label: "Lidlar", icon: Target, color: "text-amber-500" },
              { id: "students", label: "Talabalar", icon: GraduationCap, color: "text-violet-500" },
              { id: "teachers", label: "O'qituvchilar", icon: Users, color: "text-purple-500" },
              { id: "staff", label: "Xodimlar", icon: UserCheck, color: "text-blue-500" },
              { id: "groups", label: "Guruhlar", icon: Layers, color: "text-sky-500" },
              { id: "courses", label: "Kurslar", icon: BookOpen, color: "text-emerald-500" },
              { id: "payments", label: "To'lovlar", icon: CreditCard, color: "text-emerald-600" },
              { id: "salaries", label: "Ish haqi", icon: Coins, color: "text-teal-600" },
              { id: "expenses", label: "Xarajatlar", icon: Wallet, color: "text-orange-500" },
              { id: "additionalIncome", label: "Qo'shimcha daromadlar", icon: Sparkles, color: "text-green-500" },
              { id: "bonuses", label: "Bonuslar", icon: Sparkles, color: "text-pink-500" },
            ].map((tab) => {
              const IconComp = tab.icon;
              const count = (archives[tab.id] || []).length;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                    activeTab === tab.id
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                  }`}
                >
                  <IconComp size={14} className={tab.color} />
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                      activeTab === tab.id
                        ? "bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Filter */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
            <div className="relative flex-1 sm:w-64">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Qidirish (ism, telefon, kurs)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-50/90 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-slate-100/10 focus:border-slate-400 dark:focus:border-slate-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <Filter size={13} className="text-slate-400 shrink-0" />
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="bg-transparent text-slate-700 dark:text-slate-200 font-medium focus:outline-none cursor-pointer"
              >
                <option value="all">Barcha filiallar</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredList.length === 0 && (
          <div className="py-16 text-center">
            <div className="w-16 h-16 rounded-xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
              <Archive size={28} />
            </div>
            <h3 className="font-semibold text-slate-900 text-base">
              {searchQuery ? "Hech narsa topilmadi" : "Arxiv bo'sh"}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {searchQuery
                ? "Qidiruv so'rovi bo'yicha mos keluvchi arxivlangan yozuvlar topilmadi."
                : `Hozirda hech qanday o'chirilgan ${
                    activeTab === "groups"
                      ? "guruhlar"
                      : activeTab === "students"
                      ? "o'quvchilar"
                      : activeTab === "leads"
                      ? "lidlar"
                      : "kurslar"
                  } mavjud emas.`}
            </p>
          </div>
        )}

        {/* 1. Guruhlar Jadvali */}
        {activeTab === "groups" && filteredList.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="pb-3 px-3">Guruh Nomi</th>
                  <th className="pb-3 px-3">Kurs & O'qituvchi</th>
                  <th className="pb-3 px-3">Dars Vaqti & Xona</th>
                  <th className="pb-3 px-3">Filial</th>
                  <th className="pb-3 px-3">O'quvchilar</th>
                  <th className="pb-3 px-3">O'chirilgan Sana</th>
                  <th className="pb-3 px-3 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-slate-900 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {item.name?.slice(0, 2) || "G"}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{item.name}</p>
                          {item.reason && (
                            <p className="text-[11px] text-amber-600 mt-0.5 line-clamp-1">
                              Sabab: {item.reason}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="font-medium text-slate-800">{item.courseName || "Kurs"}</p>
                      <p className="text-slate-500 text-[11px] mt-0.5">{item.teacherName || "O'qituvchi biriktirilmagan"}</p>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Clock size={12} className="text-slate-400" />
                        <span>{item.days || "Hafta kunlari"}</span>
                      </div>
                      <p className="text-slate-500 text-[11px] mt-0.5">{item.time || "-"} ({item.room || "Xona yo'q"})</p>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-medium text-[11px]">
                        <MapPin size={10} className="text-slate-400" />
                        {item.branchName || "Barcha filiallar"}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-semibold text-slate-800">
                        {item.studentCount || 0} ta
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="text-slate-700 font-medium">{formatDate(item.deletedAt)}</p>
                      <p className="text-[10px] text-slate-400">Kim: {item.deletedBy || "Direktor"}</p>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <button
                          onClick={() =>
                            setModalAction({
                              type: "restore",
                              category: "groups",
                              item,
                            })
                          }
                          title="Guruhni tiklash"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold border border-emerald-200/80 transition-all active:scale-95"
                        >
                          <RotateCcw size={13} />
                          Tiklash
                        </button>
                        <button
                          onClick={() =>
                            setModalAction({
                              type: "delete",
                              category: "groups",
                              item,
                            })
                          }
                          title="Butunlay o'chirish"
                          className="p-1.5 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. O'quvchilar Jadvali */}
        {activeTab === "students" && filteredList.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="pb-3 px-3">O'quvchi F.I.SH</th>
                  <th className="pb-3 px-3">Telefonlar</th>
                  <th className="pb-3 px-3">Guruh / Kurs</th>
                  <th className="pb-3 px-3">Filial</th>
                  <th className="pb-3 px-3">Balans / Coin</th>
                  <th className="pb-3 px-3">O'chirilgan Sana</th>
                  <th className="pb-3 px-3 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-slate-900 flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {item.name?.slice(0, 1) || "S"}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{item.name}</p>
                          {item.reason && (
                            <p className="text-[11px] text-amber-600 mt-0.5 line-clamp-1">
                              Sabab: {item.reason}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="font-medium text-slate-800">{item.phone || "-"}</p>
                      {item.parentPhone && (
                        <p className="text-[10px] text-slate-400 mt-0.5">Ota-ona: {item.parentPhone}</p>
                      )}
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="font-medium text-slate-800">{item.groupName || item.courseName || "-"}</p>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-medium text-[11px]">
                        <MapPin size={10} className="text-slate-400" />
                        {item.branchName || "Chilonzor"}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="space-y-0.5">
                        <span
                          className={`font-semibold ${
                            (item.balance || 0) < 0
                              ? "text-rose-600"
                              : "text-emerald-600"
                          }`}
                        >
                          {money(item.balance || 0)} so'm
                        </span>
                        {item.coins > 0 && (
                          <div className="flex items-center gap-1 text-[11px] text-amber-600 font-medium">
                            <Coins size={11} />
                            <span>{item.coins} coin</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="text-slate-700 font-medium">{formatDate(item.deletedAt)}</p>
                      <p className="text-[10px] text-slate-400">Kim: {item.deletedBy || "Menejer"}</p>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <button
                          onClick={() =>
                            setModalAction({
                              type: "restore",
                              category: "students",
                              item,
                            })
                          }
                          title="O'quvchini tiklash"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold border border-emerald-200/80 transition-all active:scale-95"
                        >
                          <RotateCcw size={13} />
                          Tiklash
                        </button>
                        <button
                          onClick={() =>
                            setModalAction({
                              type: "delete",
                              category: "students",
                              item,
                            })
                          }
                          title="Butunlay o'chirish"
                          className="p-1.5 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. Lidlar Jadvali */}
        {activeTab === "leads" && filteredList.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="pb-3 px-3">Lid Ismi</th>
                  <th className="pb-3 px-3">Telefon</th>
                  <th className="pb-3 px-3">Qiziqqan Kursi</th>
                  <th className="pb-3 px-3">Manba & Filial</th>
                  <th className="pb-3 px-3">Oxirgi Holat / Izoh</th>
                  <th className="pb-3 px-3">O'chirilgan Sana</th>
                  <th className="pb-3 px-3 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-slate-900 flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {item.name?.slice(0, 1) || "L"}
                        </div>
                        <p className="font-semibold text-slate-900">{item.name}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                        <Phone size={11} className="text-slate-400" />
                        <span>{item.phone || "-"}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-medium text-slate-800">
                        {item.targetCourse || "Barcha yo'nalishlar"}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="text-slate-800 font-medium">{item.source || "Ijtimoiy tarmoq"}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{item.branchName || "Asosiy filial"}</p>
                    </td>
                    <td className="py-3.5 px-3 max-w-[200px]">
                      <span className="inline-block px-2 py-0.5 rounded-xl bg-slate-100 text-slate-600 font-medium text-[10px] mb-1">
                        {item.status || "Arxivlangan"}
                      </span>
                      {item.note && (
                        <p className="text-[11px] text-slate-500 truncate" title={item.note}>
                          {item.note}
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="text-slate-700 font-medium">{formatDate(item.deletedAt)}</p>
                      <p className="text-[10px] text-slate-400">Kim: {item.deletedBy || "Admin"}</p>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <button
                          onClick={() =>
                            setModalAction({
                              type: "restore",
                              category: "leads",
                              item,
                            })
                          }
                          title="Lidni tiklash"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold border border-emerald-200/80 transition-all active:scale-95"
                        >
                          <RotateCcw size={13} />
                          Tiklash
                        </button>
                        <button
                          onClick={() =>
                            setModalAction({
                              type: "delete",
                              category: "leads",
                              item,
                            })
                          }
                          title="Butunlay o'chirish"
                          className="p-1.5 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. Kurslar Jadvali */}
        {activeTab === "courses" && filteredList.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="pb-3 px-3">Kurs Nomi</th>
                  <th className="pb-3 px-3">Oylik Narxi</th>
                  <th className="pb-3 px-3">Davomiyligi</th>
                  <th className="pb-3 px-3">Filial</th>
                  <th className="pb-3 px-3">Tavsif / Sabab</th>
                  <th className="pb-3 px-3">O'chirilgan Sana</th>
                  <th className="pb-3 px-3 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-slate-900 flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {item.name?.slice(0, 1) || "K"}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{item.name}</p>
                          {item.reason && (
                            <p className="text-[11px] text-amber-600 mt-0.5 line-clamp-1">
                              Sabab: {item.reason}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-bold text-slate-900">
                        {money(item.price || 0)} so'm
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-medium text-slate-700">
                        {item.duration || "Noma'lum"}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-medium text-[11px]">
                        <MapPin size={10} className="text-slate-400" />
                        {item.branchName || "Barcha filiallar"}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 max-w-[220px]">
                      <p className="text-slate-500 text-[11px] line-clamp-2">
                        {item.description || "Tavsif berilmagan"}
                      </p>
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="text-slate-700 font-medium">{formatDate(item.deletedAt)}</p>
                      <p className="text-[10px] text-slate-400">Kim: {item.deletedBy || "Direktor"}</p>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <button
                          onClick={() =>
                            setModalAction({
                              type: "restore",
                              category: "courses",
                              item,
                            })
                          }
                          title="Kursni tiklash"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold border border-emerald-200/80 transition-all active:scale-95"
                        >
                          <RotateCcw size={13} />
                          Tiklash
                        </button>
                        <button
                          onClick={() =>
                            setModalAction({
                              type: "delete",
                              category: "courses",
                              item,
                            })
                          }
                          title="Butunlay o'chirish"
                          className="p-1.5 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. O'qituvchilar va Xodimlar Jadvali */}
        {["teachers", "staff"].includes(activeTab) && filteredList.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="pb-3 px-3">F.I.Sh / Ism</th>
                  <th className="pb-3 px-3">Telefon</th>
                  <th className="pb-3 px-3">{activeTab === "teachers" ? "Fan / Mutaxassislik" : "Lavozim"}</th>
                  <th className="pb-3 px-3">Filial</th>
                  <th className="pb-3 px-3">O'chirilgan Sana</th>
                  <th className="pb-3 px-3 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="py-3.5 px-3 font-semibold text-slate-900">{item.name}</td>
                    <td className="py-3.5 px-3 text-slate-700">{item.phone || "-"}</td>
                    <td className="py-3.5 px-3 text-slate-700">{item.subject || item.position || "-"}</td>
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-medium text-[11px]">
                        <MapPin size={10} className="text-slate-400" />
                        {item.branchName || "Barcha filiallar"}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="text-slate-700 font-medium">{formatDate(item.deletedAt)}</p>
                      <p className="text-[10px] text-slate-400">Kim: {item.deletedBy || "Direktor"}</p>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <button
                          onClick={() => setModalAction({ type: "restore", category: activeTab, item })}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold border border-emerald-200/80 transition-all active:scale-95"
                        >
                          <RotateCcw size={13} /> Tiklash
                        </button>
                        <button
                          onClick={() => setModalAction({ type: "delete", category: activeTab, item })}
                          className="p-1.5 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 6. Moliyaviy Arxivlar (To'lovlar, Ish haqi, Xarajatlar, Qo'shimcha daromadlar, Bonuslar) */}
        {["payments", "salaries", "expenses", "additionalIncome", "bonuses"].includes(activeTab) && filteredList.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="pb-3 px-3">Nomi / Nima uchun</th>
                  <th className="pb-3 px-3">Summa</th>
                  <th className="pb-3 px-3">To'lov Turi</th>
                  <th className="pb-3 px-3">Filial</th>
                  <th className="pb-3 px-3">O'chirilgan Sana</th>
                  <th className="pb-3 px-3 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="py-3.5 px-3">
                      <p className="font-semibold text-slate-900">{item.title || item.name}</p>
                      {item.reason && <p className="text-[11px] text-amber-600 mt-0.5">Sabab: {item.reason}</p>}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-slate-900">{money(item.amount || 0)} so'm</td>
                    <td className="py-3.5 px-3 text-slate-700">{item.type || "Naqd"}</td>
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-medium text-[11px]">
                        <MapPin size={10} className="text-slate-400" />
                        {item.branchName || "Barcha filiallar"}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="text-slate-700 font-medium">{formatDate(item.deletedAt)}</p>
                      <p className="text-[10px] text-slate-400">Kim: {item.deletedBy || "Direktor"}</p>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <button
                          onClick={() => setModalAction({ type: "restore", category: activeTab, item })}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold border border-emerald-200/80 transition-all active:scale-95"
                        >
                          <RotateCcw size={13} /> Tiklash
                        </button>
                        <button
                          onClick={() => setModalAction({ type: "delete", category: activeTab, item })}
                          className="p-1.5 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: Restore Confirmation */}
      {modalAction?.type === "restore" && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <RotateCcw size={22} />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-slate-900">
                Elementni tiklashni tasdiqlaysizmi?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Ushbu yozuv faol tizimga qaytariladi va qaytadan barcha bo'limlarda ko'rina boshlaydi.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1.5">
              <p className="font-bold text-slate-900">
                {modalAction.item.name || modalAction.item.title || "Tanlangan element"}
              </p>
              <p className="text-slate-500">
                Turi: <span className="font-medium text-slate-700">{tabTitle(modalAction.category)}</span>
              </p>
              <p className="text-slate-500">
                O'chirilgan sana: <span className="font-medium text-slate-700">{formatDate(modalAction.item.deletedAt)}</span>
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setModalAction(null)}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleConfirmRestore}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm active:scale-95"
              >
                <RotateCcw size={14} />
                Ha, qayta tiklansin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Permanent Delete Confirmation */}
      {modalAction?.type === "delete" && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <AlertTriangle size={22} />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-slate-900">
                Butunlay o'chirishni tasdiqlaysizmi?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Diqqat! Ushbu yozuv arxivdan ham butunlay yo'q qilinadi. Bu amalni keyinchalik ortga qaytarib bo'lmaydi.
              </p>
            </div>

            <div className="p-3.5 bg-rose-50/70 rounded-xl border border-rose-200/70 text-xs space-y-1.5">
              <p className="font-bold text-rose-900">
                {modalAction.item.name || modalAction.item.title || "Tanlangan element"}
              </p>
              <p className="text-rose-700">
                Bo'lim: <span className="font-medium">{tabTitle(modalAction.category)}</span>
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setModalAction(null)}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleConfirmPermanentDelete}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-sm active:scale-95"
              >
                <Trash2 size={14} />
                Ha, butunlay o'chirilsin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Clear All Confirmation */}
      {modalAction?.type === "clearAll" && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <Trash2 size={22} />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-slate-900">
                Ushbu bo'lim arxivini tozalash
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                "{tabTitle(modalAction.category)}" bo'limidagi barcha arxiv yozuvlari butunlay o'chiriladi.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setModalAction(null)}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleConfirmClearAll}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-sm active:scale-95"
              >
                <Trash2 size={14} />
                Ha, tozalansin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

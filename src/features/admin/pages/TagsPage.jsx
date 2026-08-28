import React, { useState } from "react";
import {
  Tag,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Check,
  Filter,
  Layers,
  Users,
  GraduationCap,
  BookOpen,
  UserCheck,
  Dumbbell,
  FileText,
  CreditCard,
  Sparkles,
} from "lucide-react";
import {
  GLASS,
  INPUT_CLS,
  LABEL_CLS,
  BTN_PRIMARY,
  BTN_SECONDARY,
  BTN_DANGER,
} from "../theme/tokens";
import { ConfirmModal } from "../components/primitives";

// Available sections as specified by the user
export const TAG_CATEGORIES = [
  { id: "guruhlar", label: "Guruhlar", icon: Users, badgeBg: "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200/60 dark:border-blue-800/60" },
  { id: "talabalar", label: "Talabalar", icon: GraduationCap, badgeBg: "bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border-purple-200/60 dark:border-purple-800/60" },
  { id: "kurslar", label: "Kurslar", icon: BookOpen, badgeBg: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/60" },
  { id: "lidlar", label: "Lidlar", icon: UserCheck, badgeBg: "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/60" },
  { id: "mashqlar", label: "Mashqlar", icon: Dumbbell, badgeBg: "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200/60 dark:border-indigo-800/60" },
  { id: "eslatma_vazifa", label: "Eslatma / Vazifa", icon: FileText, badgeBg: "bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 border-pink-200/60 dark:border-pink-800/60" },
  { id: "tolovlar", label: "To'lovlar", icon: CreditCard, badgeBg: "bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border-cyan-200/60 dark:border-cyan-800/60" },
];

// Preset color options
const PRESET_COLORS = [
  "#3b82f6", // Blue
  "#8b5cf6", // Purple
  "#10b981", // Emerald
  "#ef4444", // Red
  "#f59e0b", // Amber
  "#06b6d4", // Cyan
  "#ec4899", // Pink
  "#6366f1", // Indigo
  "#64748b", // Slate
];

export function TagsPage() {
  const [tags, setTags] = useState([
    { id: "tg1", name: "Intensiv Guruh", categoryId: "guruhlar", color: "#3b82f6" },
    { id: "tg2", name: "VIP Talaba", categoryId: "talabalar", color: "#8b5cf6" },
    { id: "tg3", name: "A1 Boshlang'ich", categoryId: "kurslar", color: "#10b981" },
    { id: "tg4", name: "Issiq Lid / Urgent", categoryId: "lidlar", color: "#ef4444" },
    { id: "tg5", name: "Amaliy Mashq", categoryId: "mashqlar", color: "#f59e0b" },
    { id: "tg6", name: "Muzokaralar Eslatmasi", categoryId: "eslatma_vazifa", color: "#ec4899" },
    { id: "tg7", name: "Qarzdor Talaba", categoryId: "tolovlar", color: "#ef4444" },
    { id: "tg8", name: "Chegirma Bilan", categoryId: "tolovlar", color: "#06b6d4" },
  ]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [deletingTagId, setDeletingTagId] = useState(null);

  // Form State
  const [tagName, setTagName] = useState("");
  const [tagCategory, setTagCategory] = useState("guruhlar");
  const [tagColor, setTagColor] = useState("#3b82f6");

  // Open modal for new creation
  const handleOpenNewModal = () => {
    setEditingTag(null);
    setTagName("");
    setTagCategory("guruhlar");
    setTagColor("#3b82f6");
    setIsModalOpen(true);
  };

  // Open modal for editing existing tag
  const handleOpenEditModal = (tag) => {
    setEditingTag(tag);
    setTagName(tag.name);
    setTagCategory(tag.categoryId);
    setTagColor(tag.color || "#3b82f6");
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTag(null);
  };

  // Save tag (create or edit)
  const handleSaveTag = (e) => {
    e.preventDefault();
    if (!tagName.trim()) return;

    if (editingTag) {
      // Edit mode
      setTags((prev) =>
        prev.map((t) =>
          t.id === editingTag.id
            ? { ...t, name: tagName.trim(), categoryId: tagCategory, color: tagColor }
            : t
        )
      );
    } else {
      // Create mode
      const newTag = {
        id: "tg_" + Date.now(),
        name: tagName.trim(),
        categoryId: tagCategory,
        color: tagColor,
      };
      setTags((prev) => [newTag, ...prev]);
    }

    handleCloseModal();
  };

  // Delete tag
  const handleDeleteTag = (id) => {
    setDeletingTagId(id);
  };

  const confirmDeleteTag = () => {
    if (deletingTagId) {
      setTags((prev) => prev.filter((t) => t.id !== deletingTagId));
      setDeletingTagId(null);
    }
  };

  // Filter tags list
  const filteredTags = tags.filter((t) => {
    const matchesCategory = selectedCategory === "all" || t.categoryId === selectedCategory;
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Tag className="w-7 h-7 text-indigo-500 shrink-0" />
            Teglar Boshqaruvi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Guruhlar, talabalar, kurslar, lidlar, mashqlar, eslatmalar va to'lovlar uchun teglarni sozlash
          </p>
        </div>

        {/* Add Tag Button */}
        <button
          onClick={handleOpenNewModal}
          className={`${BTN_PRIMARY} shadow-md shadow-indigo-500/20 !bg-indigo-600 hover:!bg-indigo-700 shrink-0`}
        >
          <Plus size={18} />
          <span>Teg Qo'shish</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className={`${GLASS} p-4 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3`}>
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              selectedCategory === "all"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            <Layers size={14} />
            <span>Barchasi ({tags.length})</span>
          </button>

          {TAG_CATEGORIES.map((cat) => {
            const count = tags.filter((t) => t.categoryId === cat.id).length;
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                <Icon size={14} />
                <span>{cat.label} ({count})</span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Teg nomini qidirish..."
            className={`${INPUT_CLS} pl-9 text-xs`}
          />
        </div>
      </div>

      {/* Main Table Container */}
      <div className={`${GLASS} rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4 w-14 text-center">#</th>
                <th className="py-3.5 px-4">Nomi</th>
                <th className="py-3.5 px-4">Turi (Bo'limi)</th>
                <th className="py-3.5 px-4 text-right w-36">Harakatlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200">
              {filteredTags.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-slate-400">
                    Bunday teglar topilmadi
                  </td>
                </tr>
              ) : (
                filteredTags.map((tag, index) => {
                  const categoryObj = TAG_CATEGORIES.find((c) => c.id === tag.categoryId) || TAG_CATEGORIES[0];
                  const CategoryIcon = categoryObj.icon;

                  return (
                    <tr
                      key={tag.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* # Index */}
                      <td className="py-3 px-4 text-center text-slate-400 font-semibold">
                        {index + 1}
                      </td>

                      {/* Tag Name & Color Badge */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                            style={{ backgroundColor: tag.color || "#3b82f6" }}
                          />
                          <span
                            className="px-2.5 py-1 rounded-lg font-bold text-xs inline-flex items-center gap-1.5 text-white shadow-xs"
                            style={{ backgroundColor: tag.color || "#3b82f6" }}
                          >
                            <Tag size={12} />
                            {tag.name}
                          </span>
                        </div>
                      </td>

                      {/* Tag Category / Type */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${categoryObj.badgeBg}`}
                        >
                          <CategoryIcon size={14} />
                          {categoryObj.label}
                        </span>
                      </td>

                      {/* Actions: Edit & Delete */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(tag)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                            title="Tahrirlash"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteTag(tag.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                            title="O'chirish"
                          >
                            <Trash2 size={15} />
                          </button>
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

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5 relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <Tag size={18} />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {editingTag ? "Tegni Tahrirlash" : "Yangi Teg Qo'shish"}
                </h3>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveTag} className="space-y-4">
              {/* Tag Name Input */}
              <div>
                <label className={`${LABEL_CLS} block mb-1.5`}>
                  Teg Nomi *
                </label>
                <input
                  type="text"
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value)}
                  placeholder="Masalan: VIP Mijoz, Urgent..."
                  className={`${INPUT_CLS} font-medium`}
                  required
                  autoFocus
                />
              </div>

              {/* Tag Category (Bo'lim) Dropdown */}
              <div>
                <label className={`${LABEL_CLS} block mb-1.5`}>
                  Bo'limini Tanlang (Turi) *
                </label>
                <select
                  value={tagCategory}
                  onChange={(e) => setTagCategory(e.target.value)}
                  className={`${INPUT_CLS} font-medium`}
                  required
                >
                  {TAG_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Ushbu teg qaysi bo'limda ishlatilishini belgilang
                </span>
              </div>

              {/* Tag Color Selector */}
              <div>
                <label className={`${LABEL_CLS} block mb-1.5`}>
                  Teg Rangi
                </label>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setTagColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        tagColor === c
                          ? "scale-110 border-slate-900 dark:border-white shadow-sm"
                          : "border-transparent hover:scale-105"
                      }`}
                      style={{ backgroundColor: c }}
                    >
                      {tagColor === c && (
                        <Check size={14} className="text-white mx-auto" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={tagColor}
                    onChange={(e) => setTagColor(e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer p-0.5 bg-white border border-slate-200 dark:border-slate-700"
                  />
                  <input
                    type="text"
                    value={tagColor}
                    onChange={(e) => setTagColor(e.target.value)}
                    className={`${INPUT_CLS} font-mono uppercase text-xs max-w-[120px]`}
                    placeholder="#3B82F6"
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className={BTN_SECONDARY}
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className={`${BTN_PRIMARY} !bg-indigo-600 hover:!bg-indigo-700 shadow-md shadow-indigo-500/20`}
                >
                  <span>{editingTag ? "Saqlash" : "Qo'shish"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingTagId && (
        <ConfirmModal
          title="Tegni o'chirish"
          message="Rostdan ham ushbu tegni o'chirib tashlamoqchimisiz?"
          confirmText="Ha, o'chirish"
          cancelText="Bekor qilish"
          danger={true}
          onConfirm={confirmDeleteTag}
          onCancel={() => setDeletingTagId(null)}
        />
      )}
    </div>
  );
}

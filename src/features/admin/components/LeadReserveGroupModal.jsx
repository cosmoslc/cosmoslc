import React, { useState } from "react";
import {
  Layers,
  Plus,
  Trash2,
  Users,
  GraduationCap,
  Calendar,
  X,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { Modal } from "./primitives";

export function LeadReserveGroupModal({
  isOpen,
  onClose,
  reserveGroups = [],
  onSaveReserveGroups,
  leads = [],
  allLeads = [],
  courses = [],
  teachers = [],
  onAssignLeadToReserve,
  lead = null,
  selectedLeadForReserve = null,
}) {
  const effectiveLead = lead || selectedLeadForReserve;
  const effectiveLeads = leads.length > 0 ? leads : allLeads;

  const [activeTab, setActiveTab] = useState(
    effectiveLead ? "assign" : "list"
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newCourseName, setNewCourseName] = useState("");
  const [newTargetDate, setNewTargetDate] = useState("");
  const [newTeacherId, setNewTeacherId] = useState("");
  const [newNote, setNewNote] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Assign lead state
  const [selectedReserveGroupId, setSelectedReserveGroupId] = useState(
    reserveGroups[0]?.id || ""
  );

  if (!isOpen) return null;

  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) {
      setErrorMsg("Zaxira guruhi nomini kiriting");
      return;
    }
    const newGroup = {
      id: `res_grp_${Date.now()}`,
      name: newGroupName.trim(),
      courseName: newCourseName.trim() || "Kutilayotgan yo'nalish",
      targetDate: newTargetDate || "",
      teacherId: newTeacherId || "",
      note: newNote.trim(),
      createdAt: new Date().toISOString(),
      leadIds: [],
    };

    const updated = [...reserveGroups, newGroup];
    onSaveReserveGroups(updated);
    setNewGroupName("");
    setNewCourseName("");
    setNewTargetDate("");
    setNewTeacherId("");
    setNewNote("");
    setShowAddForm(false);
    setErrorMsg("");
    setSuccessMsg(`"${newGroup.name}" zaxira guruhi muvaffaqiyatli ochildi!`);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleDeleteGroup = (groupId) => {
    const updated = reserveGroups.filter((g) => g.id !== groupId);
    onSaveReserveGroups(updated);
  };

  const handleAssignSubmit = (e) => {
    e.preventDefault();
    if (!effectiveLead || !selectedReserveGroupId) return;

    if (onAssignLeadToReserve) {
      const grp = reserveGroups.find((g) => g.id === selectedReserveGroupId);
      onAssignLeadToReserve(effectiveLead.id, selectedReserveGroupId, grp?.name || "");
    }
    setSuccessMsg(`Lid "${effectiveLead.name}" zaxira guruhiga biriktirildi!`);
    setTimeout(() => {
      setSuccessMsg("");
      onClose();
    }, 1200);
  };

  return (
    <Modal
      title="Zaxira Guruhlar (Kutish Ro'yxati)"
      onClose={onClose}
      position="center"
      wide
    >
      <div className="space-y-4">
        {/* Tab switcher if assigning */}
        {effectiveLead && (
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setActiveTab("assign")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                activeTab === "assign"
                  ? "bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs"
                  : "text-slate-500"
              }`}
            >
              Lidni biriktirish
            </button>
            <button
              onClick={() => setActiveTab("list")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                activeTab === "list"
                  ? "bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs"
                  : "text-slate-500"
              }`}
            >
              Zaxira guruhlar ({reserveGroups.length})
            </button>
          </div>
        )}

        {successMsg && (
          <div className="my-2.5 p-2.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="my-2.5 p-2.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertTriangle size={15} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Assign Lead Tab */}
        {effectiveLead && activeTab === "assign" ? (
          <form onSubmit={handleAssignSubmit} className="space-y-4 my-2 flex-1">
            <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/80 rounded-xl">
              <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider block mb-1">
                Tanlangan lid:
              </span>
              <p className="font-bold text-sm text-slate-900 dark:text-white">
                {effectiveLead.name}
              </p>
              <p className="text-xs font-mono text-slate-500">
                {effectiveLead.phone}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Zaxira guruhni tanlang:
              </label>
              {reserveGroups.length === 0 ? (
                <div className="p-4 text-center text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800">
                  Hozircha zaxira guruhlar mavjud emas. Avval quyida yangi zaxira guruh oching.
                </div>
              ) : (
                <select
                  value={selectedReserveGroupId}
                  onChange={(e) => setSelectedReserveGroupId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500"
                >
                  {reserveGroups.map((g) => {
                    const count = effectiveLeads.filter((l) => l.reserveGroupId === g.id).length;
                    return (
                      <option key={g.id} value={g.id}>
                        {g.name} — ({g.courseName}) [{count} ta lid kutyapti]
                      </option>
                    );
                  })}
                </select>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                disabled={reserveGroups.length === 0}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-xs"
              >
                Zaxira guruhiga qo'shish
              </button>
            </div>
          </form>
        ) : (
          /* List & Management Tab */
          <div className="my-2 space-y-3 flex-1 overflow-y-auto pr-1">
            {/* Add Group Form */}
            {showAddForm ? (
              <form onSubmit={handleCreateGroup} className="p-3.5 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                    Yangi Zaxira Guruh Ochish
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Guruh nomi *
                    </label>
                    <input
                      type="text"
                      placeholder="Masalan: IELTS 7.0+ Kechki Zaxira"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:border-amber-500"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Kurs / Yo'nalish nomi
                    </label>
                    <input
                      type="text"
                      placeholder="Masalan: Ingliz tili (IELTS)"
                      value={newCourseName}
                      onChange={(e) => setNewCourseName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Mo'ljallangan sana
                    </label>
                    <input
                      type="date"
                      value={newTargetDate}
                      onChange={(e) => setNewTargetDate(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Mas'ul o'qituvchi
                    </label>
                    <select
                      value={newTeacherId}
                      onChange={(e) => setNewTeacherId(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:border-amber-500"
                    >
                      <option value="">O'qituvchini tanlang...</option>
                      {teachers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Izoh
                  </label>
                  <input
                    type="text"
                    placeholder="Qo'shimcha talablar yoki ma'lumot"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs"
                  >
                    Ochish
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-950/30 transition-colors"
              >
                <Plus size={14} />
                <span>Yangi zaxira guruh ochish</span>
              </button>
            )}

            {/* Groups list */}
            {reserveGroups.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                Hozircha zaxira guruhlar yo'q
              </div>
            ) : (
              <div className="space-y-2">
                {reserveGroups.map((grp) => {
                  const waitingLeads = leads.filter((l) => l.reserveGroupId === grp.id);
                  return (
                    <div
                      key={grp.id}
                      className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {grp.name}
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300">
                            {waitingLeads.length} ta lid kutyapti
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 flex items-center gap-2">
                          <BookOpen size={11} className="text-amber-500" />
                          <span>{grp.courseName || "Kurs nomi yo'q"}</span>
                          {grp.targetDate && (
                            <span className="flex items-center gap-1 font-mono text-[10.5px]">
                              <Calendar size={10} /> {grp.targetDate}
                            </span>
                          )}
                        </p>
                        {grp.note && (
                          <p className="text-[11px] text-slate-400 italic">
                            {grp.note}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteGroup(grp.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors shrink-0"
                        title="Zaxira guruhni o'chirish"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-700 mt-auto">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl cursor-pointer"
          >
            Yopish
          </button>
        </div>
      </div>
    </Modal>
  );
}

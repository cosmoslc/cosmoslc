import { useState } from "react";
import {
  PartyPopper,
  Plus,
  Trash2,
  Calendar as CalendarIcon,
  Search,
  Info,
  CheckCircle2,
  Building2,
  Pencil,
  AlertTriangle,
  Clock,
} from "lucide-react";
import {
  BTN_PRIMARY,
  BTN_SECONDARY,
  GLASS,
  INPUT_CLS,
  LABEL_CLS,
} from "../theme/tokens";
import { EmptyState } from "../components/primitives";
import { formatDate, todayISO } from "../utils/helpers";

function addDaysISO(dateStr, daysCount) {
  if (!dateStr) return todayISO();
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return todayISO();
  d.setDate(d.getDate() + Math.max(0, daysCount - 1));
  return d.toISOString().split("T")[0];
}

function calcDaysBetween(startISO, endISO) {
  if (!startISO || !endISO) return 1;
  const d1 = new Date(startISO);
  const d2 = new Date(endISO);
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 1;
  const diffTime = d2.getTime() - d1.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays > 0 ? diffDays : 1;
}

export function HolidaysPage({
  directorData,
  scopeBranches = [],
  onSave,
  onToast,
  onRefresh,
}) {
  const [holidays, setHolidays] = useState(() => directorData?.holidays || []);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const branchesList =
    scopeBranches && scopeBranches.length > 0
      ? scopeBranches
      : directorData?.branches || [];

  const [formData, setFormData] = useState({
    name: "",
    startDate: todayISO(),
    durationDays: 1,
    endDate: todayISO(),
    affectsBalance: "yes", // "yes" | "no"
    selectedBranchIds: ["all"], // ["all"] or ["b1", "b2"]
    type: "official", // official, center, vacation
    description: "",
  });

  const filteredHolidays = holidays.filter(
    (h) =>
      h.name?.toLowerCase().includes(search.toLowerCase()) ||
      h.description?.toLowerCase().includes(search.toLowerCase())
  );

  const openAddModal = () => {
    setEditingId(null);
    const today = todayISO();
    setFormData({
      name: "",
      startDate: today,
      durationDays: 1,
      endDate: today,
      affectsBalance: "yes",
      selectedBranchIds: ["all"],
      type: "official",
      description: "",
    });
    setShowModal(true);
  };

  const openEditModal = (holiday) => {
    setEditingId(holiday.id);
    const start = holiday.startDate || holiday.date || todayISO();
    const end = holiday.endDate || start;
    const dur = holiday.durationDays || calcDaysBetween(start, end);
    const bIds = holiday.branchIds || (holiday.branchId ? [holiday.branchId] : ["all"]);

    setFormData({
      name: holiday.name || "",
      startDate: start,
      durationDays: dur,
      endDate: end,
      affectsBalance: holiday.affectsBalance !== false && holiday.affectsBalance !== "no" ? "yes" : "no",
      selectedBranchIds: bIds.length ? bIds : ["all"],
      type: holiday.type || "official",
      description: holiday.description || holiday.note || "",
    });
    setShowModal(true);
  };

  const handleStartDateChange = (newStart) => {
    const newEnd = addDaysISO(newStart, formData.durationDays);
    setFormData((prev) => ({
      ...prev,
      startDate: newStart,
      endDate: newEnd,
    }));
  };

  const handleDurationChange = (days) => {
    const numDays = Math.max(1, parseInt(days) || 1);
    const newEnd = addDaysISO(formData.startDate, numDays);
    setFormData((prev) => ({
      ...prev,
      durationDays: numDays,
      endDate: newEnd,
    }));
  };

  const handleToggleBranch = (branchId) => {
    setFormData((prev) => {
      let current = [...prev.selectedBranchIds];
      if (branchId === "all") {
        return { ...prev, selectedBranchIds: ["all"] };
      }
      current = current.filter((id) => id !== "all");
      if (current.includes(branchId)) {
        current = current.filter((id) => id !== branchId);
      } else {
        current.push(branchId);
      }
      if (current.length === 0) {
        current = ["all"];
      }
      return { ...prev, selectedBranchIds: current };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      onToast?.("Bayram nomini kiriting", "error");
      return;
    }

    const payload = {
      id: editingId || `hol-${Date.now()}`,
      name: formData.name.trim(),
      startDate: formData.startDate,
      endDate: formData.endDate,
      durationDays: formData.durationDays,
      affectsBalance: formData.affectsBalance === "yes",
      branchIds: formData.selectedBranchIds,
      branchId: formData.selectedBranchIds.includes("all")
        ? "all"
        : formData.selectedBranchIds[0],
      type: formData.type,
      description: formData.description.trim(),
      createdAt: editingId
        ? holidays.find((h) => h.id === editingId)?.createdAt
        : new Date().toISOString(),
    };

    let updated;
    if (editingId) {
      updated = holidays.map((h) => (h.id === editingId ? payload : h));
    } else {
      updated = [payload, ...holidays];
    }

    setHolidays(updated);
    onSave?.({ holidays: updated });
    onRefresh?.();
    setShowModal(false);
    onToast?.(
      editingId
        ? "Bayram ma'lumotlari yangilandi"
        : "Yangi dam olish kuni saqlandi",
      "success"
    );
  };

  const handleDelete = (id, name) => {
    if (
      window.confirm(
        `Rostdan ham "${name || "ushbu bayram"}" dam olish kunini o'chirmoqchimisiz?`
      )
    ) {
      const updated = holidays.filter((h) => h.id !== id);
      setHolidays(updated);
      onSave?.({ holidays: updated });
      onRefresh?.();
      onToast?.("Bayram o'chirildi", "info");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-300/50 dark:border-amber-700/40 shadow-sm relative overflow-hidden">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5">
            <Info className="w-5 h-5" />
          </div>
          <div className="space-y-1 flex-1">
            <h3 className="font-bold text-sm text-amber-900 dark:text-amber-200 flex items-center gap-2">
              <span>Muhim eslatma: Bayram kunlarining talabalar to'loviga ta'siri</span>
            </h3>
            <p className="text-xs text-amber-800/90 dark:text-amber-300/90 leading-relaxed font-medium">
              Bayram kunlari talabalar davomati va oylik to'loviga ta'sir qilishi mumkin.
              Agarda bayram uchun <strong className="text-amber-950 dark:text-amber-100">"Ha"</strong> tanlansa: bayram davomiyligidagi dars kunlariga to'g'ri kelgan darslar uchun davomat olinmaydi hamda ushbu dars kunlari talabalarning oylik to'lov balansidan ayirib tashlanadi.
            </p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2.5 text-slate-900 dark:text-white">
            <PartyPopper className="w-7 h-7 text-pink-500" />
            Dam olish va bayram kunlari
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Dars jadvallari, oylik to'lovlar va filiallar bo'yicha bayram taqvimi
          </p>
        </div>
        <button
          onClick={openAddModal}
          className={`${BTN_PRIMARY} flex items-center gap-2 shadow-md shadow-orange-500/20`}
        >
          <Plus className="w-4 h-4" />
          Yangi bayram qo'shish
        </button>
      </div>

      {/* Filter and Search */}
      <div className={`${GLASS} p-3.5 rounded-xl flex items-center gap-3 border border-slate-200/80 dark:border-slate-800`}>
        <Search className="w-5 h-5 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Bayram nomi yoki izoh bo'yicha qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border-none outline-none w-full text-xs sm:text-sm text-slate-800 dark:text-slate-200"
        />
      </div>

      {/* Holidays List */}
      {filteredHolidays.length === 0 ? (
        <EmptyState
          icon={PartyPopper}
          title="Dam olish kunlari topilmadi"
          subtitle={
            search
              ? `"${search}" bo'yicha bayram kuni topilmadi.`
              : "Markaz uchun yangi bayram yoki ta'til kunlarini qo'shing."
          }
          action={
            <button onClick={openAddModal} className={BTN_PRIMARY}>
              <Plus className="w-4 h-4" /> Bayram qo'shish
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHolidays.map((holiday) => {
            const start = holiday.startDate || holiday.date;
            const end = holiday.endDate || start;
            const dur = holiday.durationDays || calcDaysBetween(start, end);
            const isBalanceAffected =
              holiday.affectsBalance !== false && holiday.affectsBalance !== "no";
            const bIds = holiday.branchIds || (holiday.branchId ? [holiday.branchId] : ["all"]);

            const branchNames = bIds.includes("all")
              ? "Barcha filiallar"
              : bIds
                  .map(
                    (id) =>
                      branchesList.find((b) => String(b.id) === String(id))?.name || id
                  )
                  .join(", ");

            return (
              <div
                key={holiday.id}
                className={`${GLASS} p-5 rounded-2xl border border-slate-200/70 dark:border-slate-800 hover:shadow-xl transition-all flex flex-col justify-between space-y-4`}
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="p-2.5 rounded-xl bg-pink-500/10 text-pink-500 font-bold shrink-0">
                        <PartyPopper className="w-5 h-5" />
                      </span>
                      <div>
                        <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-snug">
                          {holiday.name}
                        </h3>
                        <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {holiday.type === "official"
                            ? "Davlat bayrami"
                            : holiday.type === "center"
                            ? "Markaz ta'tili"
                            : "Maxsus dam olish"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(holiday)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
                        title="Tahrirlash"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(holiday.id, holiday.name)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                        title="O'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Dates & Duration */}
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-pink-500 shrink-0" />
                        <span>
                          {formatDate(start)}
                          {end && end !== start ? ` — ${formatDate(end)}` : ""}
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-pink-50 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400 font-bold text-[11px]">
                        <Clock size={12} /> {dur} kun
                      </span>
                    </div>

                    {/* Branch Badge */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                      <Building2 size={13} className="text-orange-500 shrink-0" />
                      <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                        {branchNames}
                      </span>
                    </div>
                  </div>

                  {/* Balance Impact Badge */}
                  <div className="mb-2">
                    {isBalanceAffected ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-900/60 text-amber-700 dark:text-amber-300 text-[11px] font-bold">
                        <AlertTriangle size={13} className="text-amber-500 shrink-0" />
                        <span>Balansga ta'sir qiladi ({dur} kun ichidagi darslar)</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-semibold">
                        <CheckCircle2 size={13} className="text-slate-400 shrink-0" />
                        <span>Balansga ta'sir qilmaydi</span>
                      </div>
                    )}
                  </div>

                  {holiday.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-2">
                      {holiday.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Holiday Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4 text-slate-800 dark:text-slate-200 my-8">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PartyPopper className="w-5 h-5 text-pink-500" />
              {editingId ? "Bayramni tahrirlash" : "Yangi bayram yoki ta'til qo'shish"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Bayram Nomi */}
              <div>
                <label className={`${LABEL_CLS} block mb-1.5`}>
                  Bayram yoki sana nomi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Navro'z bayrami"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={`${INPUT_CLS} w-full`}
                  autoFocus
                />
              </div>

              {/* Sana va Davomiyligi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`${LABEL_CLS} block mb-1.5`}>
                    Boshlanish sanasi *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    className={`${INPUT_CLS} w-full`}
                  />
                </div>

                <div>
                  <label className={`${LABEL_CLS} block mb-1.5`}>
                    Davomiyligi (kunlarda) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    required
                    value={formData.durationDays}
                    onChange={(e) => handleDurationChange(e.target.value)}
                    className={`${INPUT_CLS} w-full`}
                    placeholder="1"
                  />
                  {formData.durationDays > 1 && (
                    <span className="text-[11px] text-slate-400 font-medium block mt-1">
                      Tugash sanasi: {formatDate(formData.endDate)}
                    </span>
                  )}
                </div>
              </div>

              {/* Balansga ta'sir qiladimi? (Dropdown) */}
              <div>
                <label className={`${LABEL_CLS} block mb-1.5`}>
                  Talabalar balansiga/oyligiga ta'sir qiladimi? *
                </label>
                <select
                  value={formData.affectsBalance}
                  onChange={(e) =>
                    setFormData({ ...formData, affectsBalance: e.target.value })
                  }
                  className={`${INPUT_CLS} w-full font-semibold`}
                >
                  <option value="yes">Ha</option>
                  <option value="no">Yo'q</option>
                </select>

                {/* Notice explanation for 'Ha' option */}
                {formData.affectsBalance === "yes" ? (
                  <div className="mt-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 text-xs font-medium space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-amber-900 dark:text-amber-200">
                      <AlertTriangle size={14} className="text-amber-500 shrink-0" />
                      Eslatma ("Ha" tanlandi):
                    </div>
                    <p className="leading-relaxed">
                      Ushbu <strong>{formData.durationDays} kunlik</strong> bayram davomida talabalarning dars kunlariga to'g'ri keladigan darslar uchun davomat olinmaydi va o'sha dars kunlari talabalarning oylik to'lov balansidan ayiriladi (balansga ta'sir qiladi).
                    </p>
                  </div>
                ) : (
                  <div className="mt-2.5 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium">
                    <div className="font-bold flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                      <CheckCircle2 size={14} className="text-slate-400 shrink-0" />
                      Eslatma ("Yo'q" tanlandi):
                    </div>
                    <p className="leading-relaxed mt-0.5">
                      Ushbu <strong>{formData.durationDays} kunlik</strong> dam olish kuni talabalarning dars davomati hamda to'lov balansiga hech qanday ta'sir ko'rsatmaydi.
                    </p>
                  </div>
                )}
              </div>

              {/* Filiallarni tanlang (Multi-selection) */}
              <div>
                <label className={`${LABEL_CLS} block mb-1.5`}>
                  Filialni tanlang (Multi-selection) *
                </label>
                <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/70">
                  <button
                    type="button"
                    onClick={() => handleToggleBranch("all")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      formData.selectedBranchIds.includes("all")
                        ? "bg-orange-500 text-white shadow-sm"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    Barcha filiallar
                  </button>

                  {branchesList.map((branch) => {
                    const isSelected =
                      !formData.selectedBranchIds.includes("all") &&
                      formData.selectedBranchIds.includes(String(branch.id));
                    return (
                      <button
                        key={branch.id}
                        type="button"
                        onClick={() => handleToggleBranch(String(branch.id))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          isSelected
                            ? "bg-orange-500 text-white shadow-sm"
                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                        }`}
                      >
                        {branch.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Turi */}
              <div>
                <label className={`${LABEL_CLS} block mb-1.5`}>
                  Bayram turi
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className={`${INPUT_CLS} w-full`}
                >
                  <option value="official">Rasmiy davlat bayrami</option>
                  <option value="center">O'quv markazi ta'tili</option>
                  <option value="vacation">Maxsus dam olish kuni</option>
                </select>
              </div>

              {/* Izoh */}
              <div>
                <label className={`${LABEL_CLS} block mb-1.5`}>
                  Izoh (ixtiyoriy)
                </label>
                <textarea
                  rows={2}
                  placeholder="Qo'shimcha ma'lumotlar..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className={`${INPUT_CLS} w-full resize-none`}
                />
              </div>

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
                  {editingId ? "Saqlash" : "Qo'shish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


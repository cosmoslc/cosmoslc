import { useState } from "react";
import {
  PartyPopper,
  Plus,
  Trash2,
  Calendar as CalendarIcon,
  Sparkles,
  Search,
} from "lucide-react";
import {
  BTN_PRIMARY,
  BTN_SECONDARY,
  BTN_DANGER,
  GLASS,
  INPUT_CLS,
} from "../theme/tokens";
import { EmptyState } from "../components/primitives";
import { formatDate, todayISO } from "../utils/helpers";

export function HolidaysPage({ directorData, onSave, onToast }) {
  const [holidays, setHolidays] = useState(() => directorData?.holidays || []);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    startDate: todayISO(),
    endDate: todayISO(),
    type: "official", // official, center, vacation
    description: "",
  });

  const filteredHolidays = holidays.filter(
    (h) =>
      h.name?.toLowerCase().includes(search.toLowerCase()) ||
      h.description?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleAddHoliday = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      onToast?.("Bayram nomini kiriting", "error");
      return;
    }
    const newHoliday = {
      id: `hol-${Date.now()}`,
      ...formData,
      createdAt: new Date().toISOString(),
    };
    const updated = [newHoliday, ...holidays];
    setHolidays(updated);
    onSave?.({ holidays: updated });
    setShowAddModal(false);
    setFormData({
      name: "",
      startDate: todayISO(),
      endDate: todayISO(),
      type: "official",
      description: "",
    });
    onToast?.("Dam olish kuni muvaffaqiyatli saqlandi", "success");
  };

  const handleDelete = (id) => {
    if (window.confirm("Rostdan ham ushbu dam olish kunini o'chirmoqchimisiz?")) {
      const updated = holidays.filter((h) => h.id !== id);
      setHolidays(updated);
      onSave?.({ holidays: updated });
      onToast?.("O'chirildi", "info");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2.5 text-slate-900 dark:text-white">
            <PartyPopper className="w-7 h-7 text-pink-500" />
            Dam olish va bayram kunlari
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Dars jadvallari va xodimlar ish grafigiga ta'sir qiluvchi bayram kunlari taqvimi
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className={`${BTN_PRIMARY} flex items-center gap-2`}
        >
          <Plus className="w-4 h-4" />
          Yangi bayram qo'shish
        </button>
      </div>

      {/* Filter and Search */}
      <div className={`${GLASS} p-4 rounded-xl flex items-center gap-3`}>
        <Search className="w-5 h-5 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Bayram yoki dam olish kunini qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border-none outline-none w-full text-sm text-slate-800 dark:text-slate-200"
        />
      </div>

      {/* Holidays List */}
      {filteredHolidays.length === 0 ? (
        <EmptyState
          icon={PartyPopper}
          title="Dam olish kunlari mavjud emas"
          description="Markaz uchun yangi bayram yoki ta'til kunlarini qo'shing."
          action={
            <button
              onClick={() => setShowAddModal(true)}
              className={BTN_PRIMARY}
            >
              Bayram qo'shish
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHolidays.map((holiday) => (
            <div
              key={holiday.id}
              className={`${GLASS} p-5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 hover:shadow-lg transition-all flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-pink-500/10 text-pink-500 font-semibold">
                      <PartyPopper className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {holiday.name}
                      </h3>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {holiday.type === "official"
                          ? "Davlat bayrami"
                          : holiday.type === "center"
                          ? "Markaz ta'tili"
                          : "Maxsus dam olish"}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(holiday.id)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100/70 dark:bg-slate-800/70 p-2.5 rounded-xl mb-3">
                  <CalendarIcon className="w-4 h-4 text-pink-500 shrink-0" />
                  <span>
                    {formatDate(holiday.startDate)}
                    {holiday.endDate && holiday.endDate !== holiday.startDate
                      ? ` — ${formatDate(holiday.endDate)}`
                      : ""}
                  </span>
                </div>

                {holiday.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {holiday.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Holiday Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PartyPopper className="w-5 h-5 text-pink-500" />
              Yangi bayram yoki ta'til qo'shish
            </h3>

            <form onSubmit={handleAddHoliday} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
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
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                    Boshlanish sanasi *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className={`${INPUT_CLS} w-full`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                    Tugash sanasi
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className={`${INPUT_CLS} w-full`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                  Turi
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

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
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

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className={BTN_SECONDARY}
                >
                  Bekor qilish
                </button>
                <button type="submit" className={BTN_PRIMARY}>
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

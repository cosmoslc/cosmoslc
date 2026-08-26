import { useState, useEffect, useMemo } from "react";
import {
  CreditCard,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  AlertCircle,
  Layers,
  Sparkles,
} from "lucide-react";
import { INPUT_CLS, LABEL_CLS, PrimaryButton, GLASS, BTN_GHOST } from "../theme/tokens";

const INITIAL_PAYMENT_TYPES = [
  { id: "pt_1", name: "Naqd pul", createdAt: "2025-01-01", isDefault: true, status: "active" },
  { id: "pt_2", name: "Plastik karta (Uzcard / Humo)", createdAt: "2025-01-01", isDefault: true, status: "active" },
  { id: "pt_3", name: "Click / Payme / Uzum", createdAt: "2025-01-01", isDefault: true, status: "active" },
  { id: "pt_4", name: "Bank o'tkazmasi", createdAt: "2025-01-01", isDefault: true, status: "active" },
];

const STORAGE_KEY = "cosmos_payment_methods_v1";

export function PaymentTypesPage({ addNotification }) {
  const [paymentTypes, setPaymentTypes] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error("Payment types read error:", e);
    }
    return INITIAL_PAYMENT_TYPES;
  });

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [typeName, setTypeName] = useState("");
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // Sync to localStorage whenever list changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(paymentTypes));
    } catch (e) {
      console.error("Payment types save error:", e);
    }
  }, [paymentTypes]);

  // Open modal for new
  const handleOpenNewModal = () => {
    setEditingItem(null);
    setTypeName("");
    setError("");
    setIsModalOpen(true);
  };

  // Open modal for edit
  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setTypeName(item.name);
    setError("");
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setTypeName("");
    setError("");
  };

  // Handle Save
  const handleSave = (e) => {
    e?.preventDefault();
    const trimmed = typeName.trim();
    if (!trimmed) {
      setError("Iltimos, to'lov turi nomini kiriting!");
      return;
    }

    // Check duplicate name
    const isDuplicate = paymentTypes.some(
      (pt) =>
        pt.name.toLowerCase() === trimmed.toLowerCase() &&
        pt.id !== editingItem?.id
    );

    if (isDuplicate) {
      setError("Bunday to'lov turi allaqachon mavjud!");
      return;
    }

    if (editingItem) {
      // Update
      setPaymentTypes((prev) =>
        prev.map((pt) =>
          pt.id === editingItem.id ? { ...pt, name: trimmed } : pt
        )
      );
      if (addNotification) {
        addNotification(`"${trimmed}" to'lov turi yangilandi`);
      }
    } else {
      // Create new
      const newItem = {
        id: "pt_" + Date.now(),
        name: trimmed,
        createdAt: new Date().toISOString().slice(0, 10),
        isDefault: false,
        status: "active",
      };
      setPaymentTypes((prev) => [newItem, ...prev]);
      if (addNotification) {
        addNotification(`Yangi to'lov turi qo'shildi: "${trimmed}"`);
      }
    }

    handleCloseModal();
  };

  // Handle Delete
  const handleDelete = (id) => {
    const target = paymentTypes.find((pt) => pt.id === id);
    setPaymentTypes((prev) => prev.filter((pt) => pt.id !== id));
    setDeletingId(null);
    if (addNotification && target) {
      addNotification(`"${target.name}" to'lov turi o'chirildi`);
    }
  };

  // Filtered list
  const filteredTypes = useMemo(() => {
    if (!search.trim()) return paymentTypes;
    return paymentTypes.filter((pt) =>
      pt.name.toLowerCase().includes(search.toLowerCase().trim())
    );
  }, [paymentTypes, search]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Header */}
      <div className={`${GLASS} p-6 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4`}>
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <CreditCard size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              To'lov turlari
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                {paymentTypes.length} ta
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              O'quv markazida ishlatiladigan to'lov usullari va turlarini boshqarish
            </p>
          </div>
        </div>

        {/* Add Payment Type Button */}
        <PrimaryButton
          onClick={handleOpenNewModal}
          className="shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-transform"
        >
          <Plus size={18} />
          <span>To'lov turi qo'shish</span>
        </PrimaryButton>
      </div>

      {/* Main Content Card */}
      <div className={`${GLASS} p-5 rounded-xl space-y-4`}>
        {/* Controls: Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="To'lov turini qidirish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${INPUT_CLS} pl-9`}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 self-end sm:self-center">
            Jami: <span className="font-bold text-slate-900 dark:text-white">{filteredTypes.length}</span> ta to'lov turi
          </div>
        </div>

        {/* Table / List */}
        {filteredTypes.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
              <CreditCard size={28} />
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              To'lov turlari topilmadi
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Qidiruv bo'yicha hech qanday to'lov turi chiqmadi yoki hali to'lov turi qo'shilmagan.
            </p>
            <PrimaryButton onClick={handleOpenNewModal} className="mx-auto mt-2">
              <Plus size={16} />
              <span>Yangi to'lov turi qo'shish</span>
            </PrimaryButton>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3.5 w-12 text-center">#</th>
                  <th className="px-4 py-3.5">To'lov turi nomi</th>
                  <th className="px-4 py-3.5">Qo'shilgan sana</th>
                  <th className="px-4 py-3.5 text-center">Holati</th>
                  <th className="px-4 py-3.5 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTypes.map((item, idx) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="px-4 py-3.5 text-center text-xs font-mono font-bold text-slate-400">
                      {idx + 1}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50 flex items-center justify-center font-bold text-sm shrink-0">
                          💳
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-slate-100 block">
                            {item.name}
                          </span>
                          {item.isDefault && (
                            <span className="text-[10px] text-slate-400 font-medium">
                              Tizim standarti
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
                      {item.createdAt || "2025-01-01"}
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 size={12} />
                        Faol
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-400 transition-colors"
                          title="Tahrirlash"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setDeletingId(item.id)}
                          className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 dark:hover:text-rose-400 transition-colors"
                          title="O'chirish"
                        >
                          <Trash2 size={16} />
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

      {/* MODAL: ADD / EDIT PAYMENT TYPE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden transform transition-all">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {editingItem ? "To'lov turini tahrirlash" : "Yangi to'lov turi qo'shish"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    To'lov usulining nomini kiriting
                  </p>
                </div>
              </div>

              <button
                onClick={handleCloseModal}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className={LABEL_CLS}>
                  To'lov turi nomi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  autoFocus
                  placeholder="Masalan: Naqd pul, Plastik karta, Click..."
                  value={typeName}
                  onChange={(e) => {
                    setTypeName(e.target.value);
                    if (error) setError("");
                  }}
                  className={`${INPUT_CLS} text-base font-medium py-2.5`}
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className={BTN_GHOST}
                >
                  Bekor qilish
                </button>
                <PrimaryButton type="submit" className="min-w-[120px]">
                  {editingItem ? "Saqlash" : "Qo'shish"}
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Trash2 size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                To'lov turini o'chirish
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ushbu to'lov turini o'chirmoqchimisiz? Ushbu amalni ortga qaytarib bo'lmaydi.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className={BTN_GHOST}
              >
                Bekor qilish
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs transition-colors"
              >
                Ha, o'chirish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

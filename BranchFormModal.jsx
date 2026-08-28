import { useState } from "react";
import { Check, Plus, User, Phone, CheckCircle2, UserPlus } from "lucide-react";
import { Modal } from "../components/primitives";
import { INPUT_CLS, LABEL_CLS, PrimaryButton } from "../theme/tokens";

const PRESET_COLORS = [
  "#6366f1", // Indigo
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#f43f5e", // Rose
  "#f97316", // Orange
  "#eab308", // Amber
  "#10b981", // Emerald
  "#06b6d4", // Cyan
  "#3b82f6", // Blue
];

export function BranchFormModal({
  editing,
  managers = [],
  onSubmit,
  onClose,
  openManagerModal,
}) {
  const [name, setName] = useState(editing?.name || "");
  const [address, setAddress] = useState(editing?.address || "");
  const [phone, setPhone] = useState(editing?.phone || "");
  const [color, setColor] = useState(editing?.color || "#6366f1");

  // Initial selected managers
  const [selectedManagerIds, setSelectedManagerIds] = useState(() => {
    if (editing?.managerIds && Array.isArray(editing.managerIds)) {
      return editing.managerIds;
    }
    if (editing?.managerId) {
      return [editing.managerId];
    }
    // Also check if any managers currently list this branch in branchIds
    if (editing?.id && managers.length > 0) {
      const matched = managers
        .filter((m) => (m.branchIds || []).includes(editing.id) || m.branchId === editing.id)
        .map((m) => m.id);
      if (matched.length > 0) return matched;
    }
    return [];
  });

  const [error, setError] = useState("");

  function toggleManager(mId) {
    setSelectedManagerIds((prev) =>
      prev.includes(mId) ? prev.filter((id) => id !== mId) : [...prev, mId],
    );
  }

  function submit() {
    if (!name.trim()) {
      setError("Filial nomini kiriting.");
      return;
    }
    onSubmit({
      name: name.trim(),
      address: address.trim(),
      phone: phone.trim(),
      color,
      managerIds: selectedManagerIds,
      managerId: selectedManagerIds[0] || null, // Primary manager for legacy support
    });
    onClose();
  }

  return (
    <Modal
      title={editing ? "Filialni tahrirlash" : "Yangi filial qo'shish"}
      onClose={onClose}
      wide
    >
      <div className="space-y-4">
        {/* Name & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={LABEL_CLS}>Filial nomi *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masalan: Chilonzor filiali"
              className={INPUT_CLS}
              autoFocus
            />
          </div>
          <div>
            <label className={LABEL_CLS}>Filial telefon raqami</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+998 71 200 00 00"
              className={INPUT_CLS}
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <label className={LABEL_CLS}>Manzil</label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Masalan: Chilonzor tumani, Bunyodkor shoh ko'chasi 15-uy"
            className={INPUT_CLS}
          />
        </div>

        {/* Color / Branding */}
        <div>
          <label className={LABEL_CLS}>Filial belgisi rangi</label>
          <div className="flex items-center gap-2 flex-wrap pt-1">
            {PRESET_COLORS.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setColor(c)}
                style={{ backgroundColor: c }}
                className={`w-7 h-7 rounded-xl transition-transform flex items-center justify-center text-white ${
                  color === c ? "ring-2 ring-offset-2 ring-slate-800 scale-110" : "opacity-80 hover:opacity-100"
                }`}
              >
                {color === c && <Check size={14} strokeWidth={3} />}
              </button>
            ))}
          </div>
        </div>

        {/* Manager Assignment */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div>
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <User size={14} className="text-indigo-600" />
                Biriktirilgan filial menejeri
              </label>
              <p className="text-[11px] text-slate-500">
                Ushbu filialni boshqaradigan va nazorat qiladigan menejerlarni tanlang
              </p>
            </div>
            {openManagerModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  openManagerModal();
                }}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded-xl border border-indigo-100"
              >
                <UserPlus size={13} /> Yangi menejer
              </button>
            )}
          </div>

          {managers.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-center text-xs text-slate-500">
              Tizimda hozircha menejerlar mavjud emas. Filial saqlangandan so'ng "Menejerlar" bo'limida yangi menejer qo'shishingiz mumkin.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
              {managers.map((m) => {
                const isSelected = selectedManagerIds.includes(m.id);
                return (
                  <div
                    key={m.id}
                    onClick={() => toggleManager(m.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-indigo-50/80 border-indigo-300 text-indigo-950 shadow-sm"
                        : "bg-white border-slate-200/80 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelected
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {m.name ? m.name[0].toUpperCase() : "M"}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs truncate">
                          {m.name}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1 truncate">
                          <Phone size={10} />
                          {m.phone || "Telefon kiritilmagan"}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-xl border flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? "bg-indigo-600 border-indigo-600 text-white"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {error && <p className="text-rose-700 text-xs font-semibold">{error}</p>}

        <div className="pt-2">
          <PrimaryButton onClick={submit} className="w-full">
            {editing ? (
              <>
                <Check size={16} /> Saqlash
              </>
            ) : (
              <>
                <Plus size={16} /> Filialni qo'shish
              </>
            )}
          </PrimaryButton>
        </div>
      </div>
    </Modal>
  );
}

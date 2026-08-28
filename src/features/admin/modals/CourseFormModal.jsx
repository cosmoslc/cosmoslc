import { useState } from "react";
import { Icon } from "../components/Icon";
import { INPUT_CLS, LABEL_CLS, PrimaryButton } from "../theme/tokens";
import { Modal, MoneyInput } from "../components/primitives";
import { Check, Palette, Sparkles } from "lucide-react";

const PRESET_COLORS = [
  { name: "Indigo", hex: "#6366f1" },
  { name: "Siyohrang", hex: "#8b5cf6" },
  { name: "Zangori (Sky)", hex: "#0284c7" },
  { name: "Yashil (Emerald)", hex: "#10b981" },
  { name: "Qizil (Rose)", hex: "#f43f5e" },
  { name: "To'q sariq (Amber)", hex: "#f59e0b" },
  { name: "Pushti (Pink)", hex: "#ec4899" },
  { name: "Apelsin (Orange)", hex: "#ea580c" },
  { name: "Moviy (Cyan)", hex: "#06b6d4" },
  { name: "Feruza (Teal)", hex: "#0d9488" },
  { name: "Kulrang (Slate)", hex: "#475569" },
  { name: "Binafsha (Purple)", hex: "#a855f7" },
];

export function CourseFormModal({ editing, branches = [], defaultBranchId, onSubmit, onClose }) {
  const [branchId, setBranchId] = useState(
    editing?.branchId || (defaultBranchId && defaultBranchId !== "all" ? defaultBranchId : "") || branches[0]?.id || "",
  );
  const [name, setName] = useState(editing?.name || "");
  const [price, setPrice] = useState(editing?.price ?? "");
  const [durationMonths, setDurationMonths] = useState(
    editing?.durationMonths ?? "",
  );
  const [color, setColor] = useState(editing?.color || "#6366f1");
  const [error, setError] = useState("");

  const effectiveBranchId = branchId || editing?.branchId || branches[0]?.id || "";

  function submit() {
    if (!name.trim()) {
      setError("Kurs nomini kiriting.");
      return;
    }
    if (branches.length > 0 && !effectiveBranchId) {
      setError("Filialni tanlang.");
      return;
    }
    onSubmit({
      ...(editing?.id ? { id: editing.id } : {}),
      branchId: effectiveBranchId || null,
      name: name.trim(),
      price: parseFloat(price) || 0,
      durationMonths: parseFloat(durationMonths) || 0,
      color: color || "#6366f1",
    });
    onClose();
  }

  return (
    <Modal
      title={editing ? "Kursni tahrirlash" : "Yangi kurs qo'shish"}
      onClose={onClose}
    >
      <div className="space-y-4">
        {branches.length > 1 && (
          <div>
            <label className={LABEL_CLS}>Filial</label>
            <select
              value={effectiveBranchId}
              onChange={(e) => setBranchId(e.target.value)}
              className={INPUT_CLS}
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className={LABEL_CLS}>Kurs nomi</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={INPUT_CLS}
            placeholder="Masalan: Matematika, IELTS, Frontend Dasturlash"
            autoFocus
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LABEL_CLS}>Baza narxi</label>
            <MoneyInput
              value={price}
              onChange={(val) => setPrice(val)}
              className={INPUT_CLS}
              placeholder="1 500 000"
            />
          </div>
          <div>
            <label className={LABEL_CLS}>Davomiyligi</label>
            <input
              type="number"
              value={durationMonths}
              onChange={(e) => setDurationMonths(e.target.value)}
              className={INPUT_CLS}
              placeholder="3"
            />
          </div>
        </div>

        {/* ======================================================== */}
        {/* COLOR PICKER & BORDER PREVIEW                           */}
        {/* ======================================================== */}
        <div className="pt-1">
          <div className="flex items-center justify-between mb-2">
            <label className={`${LABEL_CLS} !mb-0 flex items-center gap-1.5`}>
              <Palette size={14} className="text-slate-500 dark:text-slate-400" />
              Kurs rangi
            </label>
          </div>

          {/* Preset Swatches Palette */}
          <div className="grid grid-cols-6 gap-2 mb-3">
            {PRESET_COLORS.map((c) => {
              const isSelected = color.toLowerCase() === c.hex.toLowerCase();
              return (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setColor(c.hex)}
                  title={c.name}
                  className={`h-8 rounded-xl flex items-center justify-center transition-all ${
                    isSelected
                      ? "ring-2 ring-offset-2 ring-slate-900 dark:ring-white scale-105 shadow-sm"
                      : "hover:scale-105 opacity-85 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: c.hex }}
                >
                  {isSelected && <Check size={14} className="text-white drop-shadow" strokeWidth={3} />}
                </button>
              );
            })}
          </div>

          {/* Custom Color Input Full Width */}
          <div className="mb-3">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full h-10 p-1 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer bg-transparent"
            />
          </div>

          {/* Live Preview Box */}
          <div
            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all"
            style={{
              borderLeftColor: color || "#6366f1",
              borderLeftWidth: "4px",
            }}
          >
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full inline-block"
                style={{ backgroundColor: color || "#6366f1" }}
              />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {name.trim() || "Kurs ko'rinishi"}
              </span>
            </div>
          </div>
        </div>

        {error && <p className="text-rose-500 text-xs font-medium">{error}</p>}

        <PrimaryButton onClick={submit} className="w-full">
          {editing ? (
            <Icon name="check" size={16} />
          ) : (
            <Icon name="plus" size={16} />
          )}{" "}
          {editing ? "Saqlash" : "Qo'shish"}
        </PrimaryButton>
      </div>
    </Modal>
  );
}

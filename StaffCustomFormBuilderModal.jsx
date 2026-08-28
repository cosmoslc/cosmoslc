import { useState } from "react";
import {
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  FileText,
  Type,
  Hash,
  Calendar,
  List,
  PhoneCall,
  RotateCcw,
} from "lucide-react";
import { Modal } from "../components/primitives";
import { INPUT_CLS, LABEL_CLS, PrimaryButton, BTN_SECONDARY, BTN_ICON } from "../theme/tokens";
import {
  DEFAULT_STAFF_FORM_FIELDS,
  getStaffCustomFields,
  saveStaffCustomFields,
} from "../utils/staffFormFields";

export function StaffCustomFormBuilderModal({ onClose, onSave }) {
  const [fields, setFields] = useState(() => getStaffCustomFields());
  const [editingFieldId, setEditingFieldId] = useState(null);

  // New field form state
  const [newLabel, setNewLabel] = useState("");
  const [newType, setNewType] = useState("text");
  const [newPlaceholder, setNewPlaceholder] = useState("");
  const [newRequired, setNewRequired] = useState(false);
  const [newOptionsText, setNewOptionsText] = useState("");

  const handleAddField = () => {
    if (!newLabel.trim()) return;
    const newField = {
      id: `field_${Date.now()}`,
      label: newLabel.trim(),
      type: newType,
      placeholder: newPlaceholder.trim(),
      required: newRequired,
      options:
        newType === "select"
          ? newOptionsText
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined,
    };

    const updated = [...fields, newField];
    setFields(updated);
    saveStaffCustomFields(updated);
    if (onSave) onSave(updated);

    // Reset inputs
    setNewLabel("");
    setNewType("text");
    setNewPlaceholder("");
    setNewRequired(false);
    setNewOptionsText("");
  };

  const handleDeleteField = (id) => {
    const updated = fields.filter((f) => f.id !== id);
    setFields(updated);
    saveStaffCustomFields(updated);
    if (onSave) onSave(updated);
  };

  const handleResetDefaults = () => {
    setFields(DEFAULT_STAFF_FORM_FIELDS);
    saveStaffCustomFields(DEFAULT_STAFF_FORM_FIELDS);
    if (onSave) onSave(DEFAULT_STAFF_FORM_FIELDS);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "number":
        return <Hash size={14} className="text-amber-600 dark:text-amber-400" />;
      case "date":
        return <Calendar size={14} className="text-emerald-600 dark:text-emerald-400" />;
      case "select":
        return <List size={14} className="text-indigo-600 dark:text-indigo-400" />;
      case "tel":
        return <PhoneCall size={14} className="text-sky-600 dark:text-sky-400" />;
      default:
        return <Type size={14} className="text-slate-600 dark:text-slate-400" />;
    }
  };

  const getTypeName = (type) => {
    switch (type) {
      case "number":
        return "Raqam";
      case "date":
        return "Sana";
      case "select":
        return "Tanlov (Dropdown)";
      case "tel":
        return "Telefon";
      default:
        return "Matn";
    }
  };

  return (
    <Modal title="Xodim qo'shimcha formasi sozlamalari" onClose={onClose} wide>
      <div className="space-y-4 text-slate-800 dark:text-slate-200">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Ushbu bo'limda xodimlardan so'raladigan barcha qo'shimcha maydonlarni
          boshqarishingiz mumkin. Bu maydonlar xodim qo'shish va tahrirlashda
          chiqadi.
        </p>

        {/* Existing fields list - Flattened layout */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800 border-y border-slate-100 dark:border-slate-800 py-1">
          {fields.map((f, idx) => (
            <div
              key={f.id}
              className="py-2.5 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="font-mono text-slate-400 text-[11px] w-5">
                  {idx + 1}.
                </span>
                <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                  {getTypeIcon(f.type)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white truncate">
                      {f.label}
                    </span>
                    {f.required && (
                      <span className="bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-[10px] font-bold px-1.5 py-0.5 rounded">
                        Majburiy
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    Turi: {getTypeName(f.type)}{" "}
                    {f.placeholder ? `• Namuna: "${f.placeholder}"` : ""}{" "}
                    {f.options?.length ? `• Variantlar: ${f.options.join(", ")}` : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleDeleteField(f.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Maydonni o'chirish"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add new field row - Unified row controls */}
        <div className="pt-2">
          <p className="text-xs font-bold text-slate-900 dark:text-white mb-2">
            + Yangi maydon qo'shish
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
            <div className="sm:col-span-5">
              <input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Maydon nomi (masalan: Haydovchilik guvohnomasi)"
                className={INPUT_CLS}
              />
            </div>
            <div className="sm:col-span-3">
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className={INPUT_CLS}
              >
                <option value="text">Matn (Oddiy)</option>
                <option value="number">Raqam</option>
                <option value="date">Sana</option>
                <option value="tel">Telefon</option>
                <option value="select">Dropdown (Tanlov)</option>
              </select>
            </div>
            <div className="sm:col-span-4">
              <input
                value={newPlaceholder}
                onChange={(e) => setNewPlaceholder(e.target.value)}
                placeholder="Namuna (Placeholder)..."
                className={INPUT_CLS}
              />
            </div>
          </div>

          {newType === "select" && (
            <div className="mt-2">
              <input
                value={newOptionsText}
                onChange={(e) => setNewOptionsText(e.target.value)}
                placeholder="Variantlarni vergul bilan ajratib yozing: Variant 1, Variant 2, Variant 3"
                className={INPUT_CLS}
              />
            </div>
          )}

          <div className="flex items-center justify-between mt-3">
            <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={newRequired}
                onChange={(e) => setNewRequired(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
              To'ldirish majburiy
            </label>

            <button
              type="button"
              onClick={handleAddField}
              disabled={!newLabel.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus size={14} /> Maydonni qo'shish
            </button>
          </div>
        </div>

        {/* Modal actions footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 flex items-center gap-1"
          >
            <RotateCcw size={13} /> Standart holatga qaytarish
          </button>
          <PrimaryButton onClick={onClose}>Tayyor / Yopish</PrimaryButton>
        </div>
      </div>
    </Modal>
  );
}

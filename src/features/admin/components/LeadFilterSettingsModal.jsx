import React, { useState } from "react";
import {
  ListFilter,
  Check,
  X,
  Sliders,
  Sparkles,
} from "lucide-react";
import { Modal } from "./primitives";

export function LeadFilterSettingsModal({
  isOpen,
  onClose,
  filterConfig = {},
  onSave,
  onSaveFilterConfig,
}) {
  const [localConfig, setLocalConfig] = useState({
    source: filterConfig.source !== false,
    staff: filterConfig.staff !== false,
    reserveGroup: filterConfig.reserveGroup !== false,
    grade: filterConfig.grade !== false,
    course: filterConfig.course !== false,
  });

  if (!isOpen) return null;

  const toggleField = (key) => {
    setLocalConfig((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    const saveFn = onSave || onSaveFilterConfig;
    if (saveFn) saveFn(localConfig);
    onClose();
  };

  const filterOptions = [
    { key: "source", label: "Kelish manbasi filtri", desc: "Instagram, Telegram, Sayt, Tavsiya va boshqalar" },
    { key: "staff", label: "Mas'ul xodim filtri", desc: "Menejer yoki biriktirilgan xodim bo'yicha saralash" },
    { key: "reserveGroup", label: "Zaxira guruh filtri", desc: "Kutish ro'yxatidagi lidlar va zaxira guruhlar" },
    { key: "grade", label: "Sinf va daraja filtri", desc: "Maktab sinflari, litsey, talaba darajalari" },
    { key: "course", label: "Kurs / Fan filtri", desc: "Markaz fanlari va yo'nalishlari bo'yicha" },
  ];

  return (
    <Modal
      title="Filtrlarni Sozlash"
      onClose={onClose}
      position="center"
    >
      <div className="space-y-3">
        <p className="text-xs text-slate-500">
          Lidlar doskasida ko'rinadigan tezkor filtrlarni boshqarish
        </p>

        <div className="space-y-2.5">
          {filterOptions.map((opt) => {
            const isChecked = !!localConfig[opt.key];
            return (
              <label
                key={opt.key}
                className={`flex items-start justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                  isChecked
                    ? "bg-sky-50/60 dark:bg-sky-950/30 border-sky-300 dark:border-sky-800/80"
                    : "bg-slate-50 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800 opacity-75"
                }`}
              >
                <div className="space-y-0.5">
                  <span className="font-bold text-xs text-slate-900 dark:text-white block">
                    {opt.label}
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    {opt.desc}
                  </span>
                </div>

                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleField(opt.key)}
                  className="mt-1 w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300 cursor-pointer"
                />
              </label>
            );
          })}
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl cursor-pointer"
          >
            Bekor qilish
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs rounded-xl shadow-xs cursor-pointer"
          >
            Saqlash
          </button>
        </div>
      </div>
    </Modal>
  );
}

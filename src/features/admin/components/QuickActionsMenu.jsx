import { useState, useRef } from "react";
import { Zap, CreditCard, UserPlus, ChevronDown } from "lucide-react";
import { useTheme } from "../theme/ThemeContext";
import { MorphDropdown } from "../../../shared/components/MorphDropdown";

const ITEMS = [
  { id: "payment", label: "To'lov qabul qilish", icon: CreditCard },
  { id: "addStudent", label: "Tezkor o'quvchi qo'shish", icon: UserPlus },
  { id: "addStudentFull", label: "To'liq o'quvchi qo'shish", icon: UserPlus },
];

export function QuickActionsMenu({ onAction }) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);

  return (
    <div className="relative">
      <button
        id="topbar-quick-actions-btn"
        ref={btnRef}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-center gap-0 sm:gap-2 h-[38px] w-[38px] sm:w-auto px-0 sm:px-3.5 rounded-xl border border-indigo-400/30 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500 hover:from-indigo-700 hover:via-indigo-600 hover:to-sky-600 shadow-sm shadow-indigo-500/25 transition-all duration-200 active:scale-95 shrink-0 cursor-pointer"
        title="Tezkor amallar"
      >
        <Zap size={15} className="fill-white/20" />{" "}
        <span className="hidden sm:inline font-semibold">Tezkor amallar</span>{" "}
        <ChevronDown size={13} className={`hidden sm:inline transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      <MorphDropdown
        isOpen={open}
        onClose={() => setOpen(false)}
        triggerRef={btnRef}
        align="right"
        className="w-60"
      >
        <div className="space-y-1">
          {ITEMS.map((it) => (
            <button
              key={it.id}
              onClick={() => {
                onAction(it.id);
                setOpen(false);
              }}
              className="morph-menu-item w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all text-left cursor-pointer"
            >
              <it.icon size={15} className="text-indigo-500 shrink-0" />{" "}
              {it.label}
            </button>
          ))}
        </div>
      </MorphDropdown>
    </div>
  );
}

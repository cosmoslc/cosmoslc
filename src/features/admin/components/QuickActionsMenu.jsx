import { useState } from "react";
import { Zap, CreditCard, UserPlus, ChevronDown } from "lucide-react";
import { useTheme } from "../theme/ThemeContext";
import { GLASS } from "../theme/tokens";

const ITEMS = [
  { id: "payment", label: "To'lov qabul qilish", icon: CreditCard },
  { id: "addStudent", label: "Tezkor o'quvchi qo'shish", icon: UserPlus },
  { id: "addStudentFull", label: "To'liq o'quvchi qo'shish", icon: UserPlus },
];

export function QuickActionsMenu({ onAction }) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-center gap-0 sm:gap-2 h-[38px] w-[38px] sm:w-auto px-0 sm:px-3.5 rounded-xl border border-indigo-500/30 text-xs font-semibold text-white transition-all active:scale-95 shadow-sm shrink-0"
        style={{ background: theme.accent1 }}
        title="Tezkor amallar"
      >
        <Zap size={15} />{" "}
        <span className="hidden sm:inline">Tezkor amallar</span>{" "}
        <ChevronDown size={13} className="hidden sm:inline" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className={`${GLASS} rounded-xl p-2 absolute right-0 top-11 z-50 w-60 shadow-xl`}
          >
            {ITEMS.map((it) => (
              <button
                key={it.id}
                onClick={() => {
                  onAction(it.id);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all text-left"
              >
                <it.icon size={16} className="text-slate-400 shrink-0" />{" "}
                {it.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

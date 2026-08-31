import { useState, useRef } from "react";
import { Bell, Check, Trash2, X } from "lucide-react";
import { timeAgo } from "../utils/helpers";
import { MorphDropdown } from "../../../shared/components/MorphDropdown";

export function NotificationBell({ notifLog = [], onClear, onMarkRead, onMarkAllRead }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const unreadCount = notifLog.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={() => setOpen((o) => !o)}
        className="icon-btn relative cursor-pointer"
        title="Bildirishnomalar"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <MorphDropdown
        isOpen={open}
        onClose={() => setOpen(false)}
        triggerRef={btnRef}
        align="right"
        className="w-80 sm:w-96 max-h-[70vh] flex flex-col p-3"
      >
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2 shrink-0">
            <h4 className="font-semibold text-slate-900 dark:text-white text-xs">
              Bildirishnomalar
            </h4>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 text-[10px] font-bold">
                {unreadCount} yangi
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {unreadCount > 0 && onMarkAllRead && (
              <button
                type="button"
                onClick={onMarkAllRead}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs flex items-center gap-1 cursor-pointer"
                title="Barchasini o'qilgan deb belgilash"
              >
                <Check size={14} />
              </button>
            )}
            {notifLog.length > 0 && onClear && (
              <button
                type="button"
                onClick={onClear}
                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 text-xs flex items-center gap-1 cursor-pointer"
                title="Tozalash"
              >
                <Trash2 size={14} />
              </button>
            )}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              title="Yopish"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 divide-y divide-slate-100 dark:divide-slate-800 py-1 space-y-0.5 custom-scrollbar min-h-[80px]">
          {notifLog.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs font-medium">
              Bildirishnomalar yo'q
            </div>
          ) : (
            notifLog.map((n) => (
              <div
                key={n.id}
                className={`morph-menu-item py-2 px-2.5 flex items-start gap-2.5 rounded-xl transition-all cursor-pointer ${
                  n.read
                    ? "opacity-60 hover:opacity-100"
                    : "bg-indigo-50/60 dark:bg-indigo-950/40"
                }`}
                onClick={() => onMarkRead && onMarkRead(n.id)}
              >
                <span
                  className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    n.read ? "bg-slate-300 dark:bg-slate-700" : "bg-indigo-500"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-snug font-medium">
                    {n.message}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-normal">
                    {timeAgo(n.timestamp)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </MorphDropdown>
    </div>
  );
}

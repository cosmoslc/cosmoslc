import { useState } from "react";
import { Bell, Check, Trash2, X } from "lucide-react";
import { GLASS } from "../theme/tokens";
import { timeAgo } from "../utils/helpers";

export function NotificationBell({ notifLog, onClear, onMarkRead, onMarkAllRead }) {
  const [open, setOpen] = useState(false);
  const unreadCount = notifLog.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="icon-btn relative"
        title="Bildirishnomalar"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className={`${GLASS} rounded-xl p-4 absolute right-0 top-11 z-50 w-80 sm:w-96 max-h-[70vh] flex flex-col shadow-xl`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <h4 className="font-display font-semibold text-slate-900 dark:text-white text-sm">
                  Bildirishnomalar
                </h4>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold">
                    {unreadCount} yangi
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && onMarkAllRead && (
                  <button
                    onClick={onMarkAllRead}
                    className="p-1 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs flex items-center gap-1"
                    title="Barchasini o'qilgan deb belgilash"
                  >
                    <Check size={14} />
                  </button>
                )}
                {notifLog.length > 0 && onClear && (
                  <button
                    onClick={onClear}
                    className="p-1 rounded-xl text-slate-400 hover:text-rose-600 text-xs flex items-center gap-1"
                    title="Tozalash"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 divide-y divide-slate-100 dark:divide-slate-800 py-1">
              {notifLog.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Bildirishnomalar yo'q
                </div>
              ) : (
                notifLog.map((n) => (
                  <div
                    key={n.id}
                    className={`py-2.5 px-2 flex items-start gap-2.5 rounded-xl transition-all cursor-pointer ${
                      n.read ? "opacity-60" : "bg-blue-50/50 dark:bg-blue-950/30"
                    }`}
                    onClick={() => onMarkRead && onMarkRead(n.id)}
                  >
                    <span
                      className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        n.read ? "bg-slate-300" : "bg-blue-500"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-800 dark:text-slate-200 leading-snug">
                        {n.message}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {timeAgo(n.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

import { useState } from "react";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { MONEY_COLORS } from "../utils/constants";
import { Icon } from "../components/Icon";
import { BTN_GHOST, GLASS, INPUT_CLS } from "../theme/tokens";
import { timeAgo } from "../utils/helpers";
import { EmptyState, StatCard } from "../components/primitives";

export function NotificationsPage({
  notifLog,
  onMarkRead,
  onMarkAllRead,
  onClear,
}) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const unreadCount = notifLog.filter((n) => !n.read).length;
  const readCount = notifLog.length - unreadCount;

  const filtered = notifLog.filter((n) => {
    if (filter === "unread" && n.read) return false;
    if (filter === "read" && !n.read) return false;
    if (search && !n.message.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/25">
            <Bell size={24} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Bildirishnomalar
              {unreadCount > 0 && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                  {unreadCount} ta yangi
                </span>
              )}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 shadow-xs cursor-pointer"
            >
              <CheckCheck size={15} /> Barchasini o'qish
            </button>
          )}
          {notifLog.length > 0 && (
            <button
              onClick={onClear}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-rose-600 hover:bg-rose-50 shadow-xs cursor-pointer"
            >
              <Trash2 size={15} /> Tozalash
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard
          icon={
            <Icon
              name="bell"
              size={18}
              withBg
              bg="#8B5CF6"
              style={{ color: "#fff" }}
            />
          }
          color="#8B5CF6"
          label="Jami bildirishnomalar"
          value={notifLog.length}
        />
        <StatCard
          icon={
            <Icon
              name="bell"
              size={18}
              withBg
              bg={MONEY_COLORS.warning}
              style={{ color: "#fff" }}
            />
          }
          color={MONEY_COLORS.warning}
          label="O'qilmagan"
          value={unreadCount}
        />
        <StatCard
          icon={
            <Icon
              name="check-circle"
              size={18}
              withBg
              bg={MONEY_COLORS.income}
              style={{ color: "#fff" }}
            />
          }
          color={MONEY_COLORS.income}
          label="O'qilgan"
          value={readCount}
        />
      </div>

      <div className="flex gap-2 flex-wrap items-center">
        <div className="flex gap-1.5 bg-slate-50 border border-slate-200 rounded-xl p-1">
          {[
            ["all", "Barchasi"],
            ["unread", "O'qilmagan"],
            ["read", "O'qilgan"],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`text-xs px-3 py-1.5 rounded-xl transition-all ${filter === id ? "bg-white text-slate-700" : "text-slate-500"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Bildirishnomalarni qidirish..."
          className={`${INPUT_CLS} flex-1 min-w-[200px]`}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={
            <Icon
              name="bell"
              size={18}
              withBg
              bg="#8B5CF6"
              style={{ color: "#fff" }}
            />
          }
          title="Bildirishnoma yo'q"
          subtitle={
            notifLog.length === 0
              ? "Hozircha hech qanday bildirishnoma kelmagan."
              : "Bu filtrga mos bildirishnoma topilmadi."
          }
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((n) => (
            <button
              key={n.id}
              onClick={() => !n.read && onMarkRead(n.id)}
              className={`${GLASS} w-full text-left rounded-xl p-4 flex items-start gap-3 transition-all ${n.read ? "opacity-60" : "hover:bg-slate-100/50"}`}
            >
              <span
                className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.read ? "bg-slate-200" : "bg-sky-500"}`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-slate-700 text-sm">{n.message}</p>
                <p className="text-slate-400 text-xs mt-1">
                  {timeAgo(n.createdAt)}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

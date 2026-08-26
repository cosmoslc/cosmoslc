import { ClipboardList, LogOut } from "lucide-react";
import { JS_DAY_NAMES, MONTHS_UZ } from "../utils/constants";
import { BTN_ICON, BTN_PRIMARY, GLASS } from "../../../shared/theme/tokens";
import {
  getStudentGroups,
  getStudentStatsAllGroups,
} from "../utils/dataHelpers";
import { Avatar, StarRating } from "../../../shared/components/primitives";

export function StudentTopBar({ student, appData, goTo, now, onLogout }) {
  const dayName = JS_DAY_NAMES[now.getDay()];
  const groups = getStudentGroups(appData, student.id);
  return (
    <div
      className={`${GLASS} rounded-xl p-4 mb-6 flex items-center justify-between flex-wrap gap-3`}
    >
      <div>
        <p className="text-slate-900 font-bold text-base leading-tight">
          {student.name}
        </p>
        <p className="text-slate-500 text-xs mt-0.5">
          {dayName}, {now.getDate()}-{MONTHS_UZ[now.getMonth()]},{" "}
          {now.getFullYear()}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onLogout} className={BTN_ICON} title="Chiqish">
          <LogOut size={16} />
        </button>
        <button onClick={() => goTo("profile")} className="shrink-0">
          <Avatar name={student.name} color={groups[0]?.color} size={42} />
        </button>
      </div>
    </div>
  );
}

export function StudentHome({ appData, student, goTo }) {
  const stats = getStudentStatsAllGroups(appData, student.id);
  const myGroups = getStudentGroups(appData, student.id);
  const myGroupIds = student.groupIds;
  const myTasks = appData.tasks.filter((t) => myGroupIds.includes(t.groupId));
  const pendingCount = myTasks.filter((t) => {
    const s = t.submissions[student.id];
    return !s || s.status === "pending";
  }).length;
  const recentGraded = myTasks
    .filter((t) => t.submissions[student.id]?.status === "graded")
    .sort(
      (a, b) =>
        (b.submissions[student.id].submittedAt || 0) -
        (a.submissions[student.id].submittedAt || 0),
    )
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-slate-900">
          Bosh sahifa
        </h2>
        <p className="text-slate-500 text-sm mt-0.5">
          {myGroups.map((g) => g.name).join(", ") || "Guruhingiz yo'q"}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className={`${GLASS} rounded-xl p-4 text-center`}>
          <p className="text-amber-700 text-2xl font-bold">
            {stats.count ? stats.avg.toFixed(1) : "—"}
          </p>
          <StarRating value={stats.avg} size={13} />
          <p className="text-slate-500 text-xs mt-1">O'rtacha baho</p>
        </div>
        <div className={`${GLASS} rounded-xl p-4 text-center`}>
          <p className="text-slate-900 text-2xl font-bold">
            {stats.done}/{stats.total}
          </p>
          <p className="text-slate-500 text-xs mt-1">Bajarilgan</p>
        </div>
        <div className={`${GLASS} rounded-xl p-4 text-center`}>
          <p className="text-slate-900 text-2xl font-bold">{pendingCount}</p>
          <p className="text-slate-500 text-xs mt-1">Kutilmoqda</p>
        </div>
        <div className={`${GLASS} rounded-xl p-4 text-center`}>
          <p className="text-amber-700 text-2xl font-bold">
            {student.coins || 0}
          </p>
          <p className="text-slate-500 text-xs mt-1">🪙 Coin</p>
        </div>
      </div>

      {pendingCount > 0 && (
        <button onClick={() => goTo("tasks")} className={BTN_PRIMARY}>
          <ClipboardList size={16} /> Vazifalarni ko'rish
        </button>
      )}

      {recentGraded.length > 0 && (
        <div className={`${GLASS} rounded-xl p-5`}>
          <h3 className="font-display text-slate-900 font-semibold mb-3">
            So'nggi baholar
          </h3>
          <div className="space-y-2">
            {recentGraded.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-3"
              >
                <p className="text-slate-900 text-sm truncate">{t.title}</p>
                <StarRating
                  value={t.submissions[student.id].rating}
                  size={14}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

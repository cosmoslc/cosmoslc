import { useState } from "react";
import { Calendar, CalendarClock, Pencil, X } from "lucide-react";
import {
  GLASS,
  GLASS_SOFT,
  INPUT_CLS,
  BTN_GHOST,
  BTN_ICON,
  BTN_PRIMARY,
} from "../../../shared/theme/tokens";
import { EmptyState } from "../../../shared/components/primitives";
import { formatDate, getCurrentWeekDates } from "../utils/helpers";
import { WEEK_DAYS } from "../utils/constants";

export function ScheduleView({
  appData,
  updateGroupSchedule,
  openModal,
  removePostponed,
}) {
  const { groups, postponed } = appData;
  const [editingId, setEditingId] = useState(null);
  const weekDates = getCurrentWeekDates();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">
            Dars jadvali
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Haftalik dars kunlari va ko'chirilgan darslar
          </p>
        </div>
        <button
          onClick={() => openModal({ type: "postponeLesson" })}
          disabled={groups.length === 0}
          className={BTN_PRIMARY}
        >
          <CalendarClock size={16} /> Darsni ko'chirish
        </button>
      </div>

      {groups.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="Avval guruh yarating"
          subtitle="Jadval yaratish uchun kamida bitta guruh kerak."
        />
      ) : (
        <div className={`${GLASS} rounded-xl p-5 overflow-x-auto`}>
          <div className="min-w-[560px]">
            <div className="grid grid-cols-8 gap-1.5 mb-2">
              <div />
              {WEEK_DAYS.map((d, i) => (
                <div
                  key={d}
                  className="text-slate-500 text-xs text-center font-medium leading-tight"
                >
                  {d.slice(0, 3)}
                  <br />
                  <span className="text-slate-400">{weekDates[i]}</span>
                </div>
              ))}
            </div>
            {groups.map((g) => (
              <div
                key={g.id}
                className="grid grid-cols-8 gap-1.5 mb-1.5 items-center"
              >
                <div className="text-slate-900 text-xs truncate pr-1 flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: g.color }}
                  />
                  {g.name}
                </div>
                {WEEK_DAYS.map((d) => (
                  <div
                    key={d}
                    className="h-8 rounded-xl flex items-center justify-center text-[10px] font-medium"
                    style={
                      g.days.includes(d)
                        ? {
                            background: g.color + "33",
                            border: `1px solid ${g.color}66`,
                            color: "white",
                          }
                        : { background: "rgba(255,255,255,0.04)" }
                    }
                  >
                    {g.days.includes(d) ? g.time : ""}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {groups.map((g) => (
          <div key={g.id} className={`${GLASS_SOFT} rounded-xl p-4`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: g.color }}
                />
                <p className="text-slate-900 text-sm font-medium">{g.name}</p>
              </div>
              <button
                onClick={() => setEditingId(editingId === g.id ? null : g.id)}
                className={BTN_ICON}
              >
                <Pencil size={14} />
              </button>
            </div>
            {editingId === g.id && (
              <GroupScheduleEditor
                group={g}
                onSave={(days, time) => {
                  updateGroupSchedule(g.id, days, time);
                  setEditingId(null);
                }}
                onCancel={() => setEditingId(null)}
              />
            )}
          </div>
        ))}
      </div>

      {postponed.length > 0 && (
        <div className={`${GLASS} rounded-xl p-5`}>
          <h3 className="font-display text-slate-900 font-semibold mb-3 flex items-center gap-2">
            <CalendarClock size={18} /> Ko'chirilgan darslar
          </h3>
          <div className="space-y-2">
            {postponed
              .slice()
              .sort((a, b) => new Date(b.newDate) - new Date(a.newDate))
              .map((p) => {
                const g = groups.find((x) => x.id === p.groupId);
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-2 bg-slate-50 border border-slate-200 rounded-xl p-3"
                  >
                    <div className="min-w-0">
                      <p className="text-slate-900 text-sm truncate">
                        {g?.name || "Guruh o'chirilgan"}
                      </p>
                      <p className="text-slate-500 text-xs">
                        <span className="line-through">
                          {formatDate(p.originalDate)}
                        </span>{" "}
                        →{" "}
                        <span className="text-emerald-700">
                          {formatDate(p.newDate)}
                        </span>
                      </p>
                      {p.note && (
                        <p className="text-slate-400 text-xs mt-0.5 italic truncate">
                          {p.note}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removePostponed(p.id)}
                      className={BTN_ICON}
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}

function GroupScheduleEditor({ group, onSave, onCancel }) {
  const [days, setDays] = useState(group.days);
  const [time, setTime] = useState(group.time || "15:00");
  function toggleDay(d) {
    setDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
    );
  }
  return (
    <div className="mt-3 pt-3 border-t border-slate-200 space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {WEEK_DAYS.map((d) => (
          <button
            key={d}
            onClick={() => toggleDay(d)}
            className={`text-xs px-2.5 py-1.5 rounded-xl border transition-all ${days.includes(d) ? "bg-slate-100 border-slate-300 text-slate-900" : "bg-slate-50 border-slate-200 text-slate-500"}`}
          >
            {d}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <label className="text-slate-500 text-xs">Vaqt:</label>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className={`${INPUT_CLS} w-auto`}
        />
      </div>
      <div className="flex gap-2">
        <button onClick={onCancel} className={`${BTN_GHOST} flex-1`}>
          Bekor qilish
        </button>
        <button
          onClick={() => onSave(days, time)}
          className={`${BTN_PRIMARY} flex-1`}
        >
          Saqlash
        </button>
      </div>
    </div>
  );
}

import { Calendar, CalendarClock } from "lucide-react";
import { WEEK_DAYS } from "../utils/constants";
import { GLASS } from "../../../shared/theme/tokens";
import { formatDate } from "../utils/helpers";
import { getStudentGroups } from "../utils/dataHelpers";
import { EmptyState } from "../../../shared/components/primitives";

export function StudentSchedule({ appData, student }) {
  const myGroups = getStudentGroups(appData, student.id);
  const myPostponed = appData.postponed.filter((p) =>
    student.groupIds.includes(p.groupId),
  );
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-bold text-slate-900">
          Dars jadvali
        </h2>
      </div>
      {myGroups.length === 0 ? (
        <EmptyState icon={Calendar} title="Guruhingiz yo'q" />
      ) : (
        myGroups.map((group) => (
          <div key={group.id} className={`${GLASS} rounded-xl p-5`}>
            <div className="flex items-center gap-2 mb-3">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: group.color }}
              />
              <h3 className="font-display text-slate-900 font-semibold">
                {group.name}
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {WEEK_DAYS.map((d) => (
                <div
                  key={d}
                  className={`text-xs px-3 py-2.5 rounded-xl border ${group.days.includes(d) ? "text-slate-900" : "text-slate-400 border-slate-100"}`}
                  style={
                    group.days.includes(d)
                      ? {
                          background: group.color + "33",
                          borderColor: group.color + "66",
                        }
                      : {}
                  }
                >
                  {d}
                  {group.days.includes(d) && ` · ${group.time}`}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
      {myPostponed.length > 0 && (
        <div className={`${GLASS} rounded-xl p-5`}>
          <h3 className="font-display text-slate-900 font-semibold mb-3 flex items-center gap-2">
            <CalendarClock size={18} /> Ko'chirilgan darslar
          </h3>
          <div className="space-y-2">
            {myPostponed.map((p) => (
              <div
                key={p.id}
                className="bg-slate-50 border border-slate-200 rounded-xl p-3"
              >
                <p className="text-slate-600 text-xs">
                  <span className="line-through">
                    {formatDate(p.originalDate)}
                  </span>{" "}
                  →{" "}
                  <span className="text-emerald-700">
                    {formatDate(p.newDate)}
                  </span>
                </p>
                {p.note && (
                  <p className="text-slate-400 text-xs italic mt-0.5">
                    {p.note}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

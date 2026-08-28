import { useState } from "react";
import { Trophy } from "lucide-react";
import {
  BTN_GHOST,
  BTN_PRIMARY,
  GLASS,
  INPUT_CLS,
} from "../../../shared/theme/tokens";
import { withGroupId } from "../utils/helpers";
import {
  getGroupStudents,
  getStudentGroups,
  rankStudents,
} from "../utils/dataHelpers";
import {
  Avatar,
  EmptyState,
  StarRating,
} from "../../../shared/components/primitives";

export function StudentRating({ appData, student }) {
  const [metric, setMetric] = useState("star");
  const myGroups = getStudentGroups(appData, student.id);
  const [tab, setTab] = useState(myGroups[0]?.id || "");
  const activeGroup = appData.groups.find((g) => g.id === tab);

  const starList = activeGroup
    ? rankStudents(
        withGroupId(getGroupStudents(appData, activeGroup.id), activeGroup.id),
        appData.tasks,
      ).map((s) => ({ ...s, groupColor: activeGroup.color }))
    : [];

  const coinList = appData.students
    .slice()
    .sort((a, b) => (b.coins || 0) - (a.coins || 0));

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-bold text-slate-900">
          Reyting
        </h2>
        <p className="text-slate-500 text-sm mt-0.5">Sizning o'rningiz</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setMetric("star")}
          className={metric === "star" ? BTN_PRIMARY : BTN_GHOST}
        >
          ⭐ Yulduz
        </button>
        <button
          onClick={() => setMetric("coin")}
          className={metric === "coin" ? BTN_PRIMARY : BTN_GHOST}
        >
          🪙 Coin
        </button>
      </div>

      {metric === "star" && myGroups.length > 0 && (
        <select
          value={tab}
          onChange={(e) => setTab(e.target.value)}
          className={`${INPUT_CLS} sm:w-72`}
        >
          {myGroups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      )}

      <div className={`${GLASS} rounded-xl p-5`}>
        {metric === "star" ? (
          starList.length === 0 ? (
            <EmptyState icon={Trophy} title="Guruhingiz yo'q" />
          ) : (
            <div className="space-y-2">
              {starList.map((s, i) => (
                <div
                  key={s.id}
                  className={`flex items-center gap-3 border rounded-xl p-3 ${s.id === student.id ? "bg-slate-100 border-slate-300" : "bg-slate-50 border-slate-200"}`}
                >
                  <span className="text-lg w-7 text-center shrink-0">
                    {i < 3 ? (
                      ["🥇", "🥈", "🥉"][i]
                    ) : (
                      <span className="text-slate-400 text-sm">{i + 1}</span>
                    )}
                  </span>
                  <Avatar name={s.name} color={s.groupColor} size={34} />
                  <p className="text-slate-900 text-sm font-medium flex-1 truncate">
                    {s.name}
                    {s.id === student.id ? " (siz)" : ""}
                  </p>
                  <StarRating value={s.stats.avg} size={13} />
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="space-y-2">
            {coinList.map((s, i) => (
              <div
                key={s.id}
                className={`flex items-center gap-3 border rounded-xl p-3 ${s.id === student.id ? "bg-slate-100 border-slate-300" : "bg-slate-50 border-slate-200"}`}
              >
                <span className="text-lg w-7 text-center shrink-0">
                  {i < 3 ? (
                    ["🥇", "🥈", "🥉"][i]
                  ) : (
                    <span className="text-slate-400 text-sm">{i + 1}</span>
                  )}
                </span>
                <Avatar name={s.name} color={myGroups[0]?.color} size={34} />
                <p className="text-slate-900 text-sm font-medium flex-1 truncate">
                  {s.name}
                  {s.id === student.id ? " (siz)" : ""}
                </p>
                <p className="text-amber-700 font-bold text-sm">
                  {s.coins || 0} 🪙
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

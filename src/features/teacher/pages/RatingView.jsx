import { useState } from "react";
import { Trophy } from "lucide-react";
import {
  GLASS,
  INPUT_CLS,
  BTN_PRIMARY,
  BTN_GHOST,
} from "../../../shared/theme/tokens";
import {
  Avatar,
  EmptyState,
  StarRating,
} from "../../../shared/components/primitives";
import {
  getGroupStudents,
  getStudentGroups,
  rankStudents,
  allStudentsFlat,
  withGroupId,
} from "../utils/dataHelpers";

export function RatingView({ appData, openModal }) {
  const { groups, tasks } = appData;
  const [metric, setMetric] = useState("star");
  const [tab, setTab] = useState("all");
  const activeGroup = tab !== "all" ? groups.find((g) => g.id === tab) : null;

  const starList =
    tab === "all"
      ? rankStudents(allStudentsFlat(appData), tasks)
      : rankStudents(
          withGroupId(
            getGroupStudents(appData, activeGroup?.id),
            activeGroup?.id,
          ),
          tasks,
        ).map((s) => ({
          ...s,
          groupColor: activeGroup?.color,
          groupName: activeGroup?.name,
        }));

  const coinList = appData.students
    .slice()
    .sort((a, b) => (b.coins || 0) - (a.coins || 0));

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-bold text-slate-900">
          Reyting
        </h2>
        <p className="text-slate-500 text-sm mt-0.5">
          O'quvchilarning umumiy natijalari
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setMetric("star")}
          className={metric === "star" ? BTN_PRIMARY : BTN_GHOST}
        >
          ⭐ Yulduz reytingi
        </button>
        <button
          onClick={() => setMetric("coin")}
          className={metric === "coin" ? BTN_PRIMARY : BTN_GHOST}
        >
          🪙 Coin reytingi
        </button>
      </div>

      {metric === "star" && (
        <select
          value={tab}
          onChange={(e) => setTab(e.target.value)}
          className={`${INPUT_CLS} sm:w-72`}
        >
          <option value="all">Barcha guruhlar</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      )}

      <div className={`${GLASS} rounded-xl p-5`}>
        {metric === "star" ? (
          starList.length === 0 ? (
            <EmptyState
              icon={Trophy}
              title="Hozircha reyting yo'q"
              subtitle="Guruhga o'quvchi qo'shing va vazifalarni baholang."
            />
          ) : (
            <div className="space-y-2">
              {starList.map((s, i) => (
                <div
                  key={s.id + (s.groupId || "")}
                  className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3"
                >
                  <span className="text-lg w-7 text-center shrink-0">
                    {i < 3 ? (
                      ["🥇", "🥈", "🥉"][i]
                    ) : (
                      <span className="text-slate-400 text-sm">{i + 1}</span>
                    )}
                  </span>
                  <Avatar
                    name={s.name}
                    color={s.groupColor}
                    size={36}
                    onClick={() =>
                      openModal({
                        type: "studentDetail",
                        studentId: s.id,
                        groupId: s.groupId,
                      })
                    }
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-slate-900 text-sm font-medium truncate">
                      {s.name}
                    </p>
                    {tab === "all" && (
                      <p className="text-slate-400 text-xs truncate">
                        {s.groupName}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <StarRating value={s.stats.avg} size={13} />
                    <p className="text-amber-700 text-xs font-semibold mt-0.5">
                      {s.stats.count
                        ? `${s.stats.avg.toFixed(1)} (${s.stats.count} baho)`
                        : "baholanmagan"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : coinList.length === 0 ? (
          <EmptyState
            icon={Trophy}
            title="Hozircha o'quvchi yo'q"
            subtitle="Guruhga o'quvchi qo'shing."
          />
        ) : (
          <div className="space-y-2">
            {coinList.map((s, i) => {
              const sg = getStudentGroups(appData, s.id);
              return (
                <div
                  key={s.id}
                  className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3"
                >
                  <span className="text-lg w-7 text-center shrink-0">
                    {i < 3 ? (
                      ["🥇", "🥈", "🥉"][i]
                    ) : (
                      <span className="text-slate-400 text-sm">{i + 1}</span>
                    )}
                  </span>
                  <Avatar
                    name={s.name}
                    color={sg[0]?.color}
                    size={36}
                    onClick={() =>
                      sg[0] &&
                      openModal({
                        type: "studentDetail",
                        studentId: s.id,
                        groupId: sg[0].id,
                      })
                    }
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-slate-900 text-sm font-medium truncate">
                      {s.name}
                    </p>
                    <p className="text-slate-400 text-xs truncate">
                      {sg.map((g) => g.name).join(", ") || "Guruhsiz"}
                    </p>
                  </div>
                  <p className="text-amber-700 font-bold text-sm shrink-0">
                    {s.coins || 0} 🪙
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

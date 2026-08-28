import {
  Users,
  Sparkles,
  UserPlus,
  ChevronRight,
  ArrowLeft,
  Trash2,
  Plus,
} from "lucide-react";
import {
  GLASS,
  GLASS_SOFT,
  BTN_GHOST,
  BTN_ICON,
  BTN_PRIMARY,
} from "../../../shared/theme/tokens";
import {
  Avatar,
  EmptyState,
  StarRating,
} from "../../../shared/components/primitives";
import {
  getGroupStudents,
  rankStudents,
  allStudentsFlat,
  withGroupId,
} from "../utils/dataHelpers";
import { formatDate, countClassDaysSince } from "../utils/helpers";

export function DashboardView({
  appData,
  openModal,
  setSelectedGroupId,
  selectedGroupId,
  courses,
  canCreateGroups,
}) {
  const { groups, tasks } = appData;
  const group = selectedGroupId
    ? groups.find((g) => g.id === selectedGroupId)
    : null;

  if (group) {
    return (
      <GroupDetail
        appData={appData}
        group={group}
        openModal={openModal}
        onBack={() => setSelectedGroupId(null)}
        courses={courses}
      />
    );
  }

  const flatStudents = allStudentsFlat(appData);
  const overallTop = rankStudents(flatStudents, tasks).slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">
            Guruhlarim
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            {groups.length} ta guruh, jami {appData.students.length} o'quvchi
          </p>
        </div>
        {canCreateGroups && (
          <button
            onClick={() => openModal({ type: "addGroup" })}
            className={BTN_PRIMARY}
          >
            <Plus size={16} /> Yangi guruh
          </button>
        )}
      </div>

      {!canCreateGroups && (
        <div className={`${GLASS_SOFT} rounded-xl p-3.5`}>
          <p className="text-slate-500 text-xs">
            Yangi guruh yaratish uchun direktor/menejerdan ruxsat so'rang.
          </p>
        </div>
      )}

      {overallTop.length > 0 && (
        <div className={`${GLASS} rounded-xl p-5`}>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={18} className="text-amber-700" />
            <h3 className="font-display text-slate-900 font-semibold">
              Eng yaxshi o'quvchilar — barcha guruhlar bo'yicha
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {overallTop.map((s, i) => (
              <div
                key={s.id + s.groupId}
                className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-3"
              >
                <span className="text-2xl">{["🥇", "🥈", "🥉"][i]}</span>
                <Avatar
                  name={s.name}
                  color={s.groupColor}
                  size={40}
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
                  <p className="text-slate-500 text-xs truncate">
                    {s.groupName}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-amber-700 font-bold text-sm">
                    {s.stats.count ? s.stats.avg.toFixed(1) : "—"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {groups.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Hali guruh yo'q"
          subtitle="Birinchi guruhingizni yarating va o'quvchilarni qo'shing."
          action={
            canCreateGroups ? (
              <button
                onClick={() => openModal({ type: "addGroup" })}
                className={BTN_PRIMARY}
              >
                <Plus size={16} /> Guruh yaratish
              </button>
            ) : null
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.map((g) => (
            <GroupCard
              key={g.id}
              appData={appData}
              group={g}
              onOpen={() => setSelectedGroupId(g.id)}
              onAddStudent={() =>
                openModal({ type: "addStudent", groupId: g.id })
              }
              onStudentClick={(sid) =>
                openModal({
                  type: "studentDetail",
                  studentId: sid,
                  groupId: g.id,
                })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function GroupCard({ appData, group, onOpen, onAddStudent, onStudentClick }) {
  const students = getGroupStudents(appData, group.id);
  const top3 = rankStudents(
    withGroupId(students, group.id),
    appData.tasks,
  ).slice(0, 3);
  return (
    <div className={`${GLASS} rounded-xl p-5 flex flex-col gap-4`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-3 h-3 rounded-full shrink-0"
            style={{ background: group.color }}
          />
          <div className="min-w-0">
            <h3
              className="font-display text-slate-900 font-semibold truncate cursor-pointer hover:underline"
              onClick={onOpen}
            >
              {group.name}
            </h3>
            <p className="text-slate-400 text-xs truncate">
              {group.days.length
                ? group.days.join(", ")
                : "Kunlar belgilanmagan"}{" "}
              {group.time && `· ${group.time}`}
            </p>
          </div>
        </div>
        <span className="bg-slate-50 border border-slate-200 rounded-full px-2.5 py-1 text-xs text-slate-600 shrink-0">
          {students.length} o'quvchi
        </span>
      </div>

      {top3.length === 0 ? (
        <p className="text-slate-400 text-sm py-2.5">O'quvchi yo'q</p>
      ) : (
        <div className="space-y-2">
          {top3.map((s, i) => (
            <div
              key={s.id}
              className="flex items-center gap-2.5 cursor-pointer hover:bg-slate-50 rounded-xl p-1.5 -m-1.5 transition-colors"
              onClick={() => onStudentClick(s.id)}
            >
              <span className="text-sm w-5 text-center shrink-0">
                {["🥇", "🥈", "🥉"][i]}
              </span>
              <Avatar name={s.name} color={group.color} size={30} />
              <p className="text-slate-800 text-sm truncate flex-1">{s.name}</p>
              <span className="text-amber-700 text-xs font-semibold shrink-0">
                {s.stats.count ? s.stats.avg.toFixed(1) : "—"}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button onClick={onAddStudent} className={`${BTN_GHOST} flex-1`}>
          <UserPlus size={15} /> O'quvchi qo'shish
        </button>
        <button onClick={onOpen} className={`${BTN_GHOST} flex-1`}>
          Barchasi <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

function GroupDetail({ appData, group, openModal, onBack, courses }) {
  const students = getGroupStudents(appData, group.id);
  const ranked = rankStudents(withGroupId(students, group.id), appData.tasks);
  const course = (courses || []).find((c) => c.id === group.courseId);
  const lessonsSoFar = group.startDate
    ? countClassDaysSince(group.days, group.startDate)
    : null;
  const expectedTotal = group.durationMonths
    ? Math.round(group.durationMonths * 4.33 * (group.days.length || 0))
    : null;
  return (
    <div className="space-y-5">
      <button onClick={onBack} className={BTN_GHOST}>
        <ArrowLeft size={15} /> Orqaga
      </button>
      <div className={`${GLASS} rounded-xl p-5`}>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full"
              style={{ background: group.color }}
            />
            <div>
              <h2 className="font-display text-xl font-bold text-slate-900">
                {group.name}
              </h2>
              <p className="text-slate-500 text-sm">
                {group.days.length
                  ? group.days.join(", ")
                  : "Kunlar belgilanmagan"}{" "}
                {group.time && `· soat ${group.time}`}
              </p>
              {course && (
                <p className="text-slate-400 text-xs mt-1">
                  📚 Kurs: {course.name}
                  {group.price
                    ? ` · ${group.price.toLocaleString("uz-UZ")} so'm/oy`
                    : ""}
                </p>
              )}
              {lessonsSoFar !== null && (
                <p className="text-slate-400 text-xs mt-0.5">
                  {formatDate(group.startDate)}dan buyon{" "}
                  <span className="text-slate-600 font-medium">
                    {lessonsSoFar}
                  </span>{" "}
                  ta dars o'tildi
                  {expectedTotal ? ` (taxminan ${expectedTotal} tadan)` : ""}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() =>
                openModal({ type: "addStudent", groupId: group.id })
              }
              className={BTN_PRIMARY}
            >
              <UserPlus size={15} /> O'quvchi qo'shish
            </button>
            <button
              onClick={() =>
                openModal({
                  type: "confirm",
                  message: `"${group.name}" guruhini o'chirasizmi? Bog'liq barcha vazifalar ham o'chib ketadi.`,
                  action: { kind: "deleteGroup", groupId: group.id },
                })
              }
              className={BTN_ICON}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className={`${GLASS} rounded-xl p-5`}>
        <h3 className="font-display text-slate-900 font-semibold mb-4">
          O'quvchilar reytingi
        </h3>
        {ranked.length === 0 ? (
          <p className="text-slate-400 text-sm">
            Bu guruhda hali o'quvchi yo'q.
          </p>
        ) : (
          <div className="space-y-2">
            {ranked.map((s, i) => (
              <div
                key={s.id}
                className="flex items-center gap-3 bg-slate-50 hover:bg-slate-50 border border-slate-200 rounded-xl p-3 cursor-pointer transition-colors"
                onClick={() =>
                  openModal({
                    type: "studentDetail",
                    studentId: s.id,
                    groupId: group.id,
                  })
                }
              >
                <span className="text-slate-400 text-sm w-5 text-center shrink-0">
                  {i + 1}
                </span>
                <Avatar name={s.name} color={group.color} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="text-slate-900 text-sm font-medium truncate">
                    {s.name}
                  </p>
                  <p className="text-slate-400 text-xs">
                    {s.stats.done}/{s.stats.total} vazifa bajarilgan
                    {s.groupIds.length > 1
                      ? ` · ${s.groupIds.length} guruhda`
                      : ""}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <StarRating value={s.stats.avg} size={13} />
                  <p className="text-amber-700 text-xs font-semibold mt-0.5">
                    {s.stats.count ? s.stats.avg.toFixed(1) : "baholanmagan"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

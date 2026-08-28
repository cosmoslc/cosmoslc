import { useState } from "react";
import {
  ClipboardList,
  Calendar,
  Clock,
  ArrowLeft,
  Trash2,
  Plus,
  Phone,
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
import { AttendanceSection } from "../components/AttendanceSection";
import { getGroupStudents } from "../utils/dataHelpers";
import { formatDate, formatDateTime } from "../utils/helpers";

export function TasksView({
  appData,
  openModal,
  markSubmission,
  markAttendance,
  saveAttendance,
  selectedTaskId,
  setSelectedTaskId,
}) {
  const [section, setSection] = useState("tasks");
  const { groups, tasks } = appData;
  const task = selectedTaskId
    ? tasks.find((t) => t.id === selectedTaskId)
    : null;

  if (task) {
    const group = groups.find((g) => g.id === task.groupId);
    return (
      <TaskDetail
        task={task}
        group={group}
        appData={appData}
        openModal={openModal}
        markSubmission={markSubmission}
        onBack={() => setSelectedTaskId(null)}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">
            {section === "tasks" ? "Vazifalar" : "Davomat"}
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            {section === "tasks"
              ? "Uyga vazifalar va topshiriqlar"
              : "Kelgan-kelmaganini belgilang"}
          </p>
        </div>
        {section === "tasks" && (
          <button
            onClick={() => openModal({ type: "createTask" })}
            disabled={groups.length === 0}
            className={BTN_PRIMARY}
          >
            <Plus size={16} /> Yangi vazifa
          </button>
        )}
      </div>

      <div className="flex gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1 w-fit">
        <button
          onClick={() => setSection("tasks")}
          className={`text-sm px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 ${section === "tasks" ? "bg-slate-100 text-slate-900" : "text-slate-500"}`}
        >
          <ClipboardList size={14} /> Vazifalar
        </button>
        <button
          onClick={() => setSection("attendance")}
          className={`text-sm px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 ${section === "attendance" ? "bg-slate-100 text-slate-900" : "text-slate-500"}`}
        >
          <Calendar size={14} /> Davomat
        </button>
      </div>

      {section === "tasks" ? (
        groups.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Avval guruh yarating"
            subtitle="Vazifa berish uchun kamida bitta guruh kerak."
          />
        ) : tasks.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Hali vazifa yo'q"
            subtitle="Birinchi vazifangizni yarating."
            action={
              <button
                onClick={() => openModal({ type: "createTask" })}
                className={BTN_PRIMARY}
              >
                <Plus size={16} /> Vazifa yaratish
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tasks
              .slice()
              .sort((a, b) => b.createdAt - a.createdAt)
              .map((t) => {
                const group = groups.find((g) => g.id === t.groupId);
                return (
                  <TaskCard
                    key={t.id}
                    task={t}
                    group={group}
                    appData={appData}
                    onOpen={() => setSelectedTaskId(t.id)}
                  />
                );
              })}
          </div>
        )
      ) : (
        <AttendanceSection
          appData={appData}
          markAttendance={markAttendance}
          saveAttendance={saveAttendance}
        />
      )}
    </div>
  );
}

function TaskCard({ task, group, appData, onOpen }) {
  const students = group ? getGroupStudents(appData, group.id) : [];
  const total = students.length;
  const done = students.filter((s) => {
    const sub = task.submissions[s.id];
    return sub && (sub.status === "submitted" || sub.status === "graded");
  }).length;
  const graded = students.filter(
    (s) => task.submissions[s.id]?.status === "graded",
  ).length;
  const complete = total > 0 && done === total;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div
      onClick={onOpen}
      className={`${GLASS} rounded-xl p-5 cursor-pointer hover:bg-slate-100 transition-colors space-y-3`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-display text-slate-900 font-semibold truncate">
            {task.title}
          </h3>
          <p className="text-slate-400 text-xs mt-0.5 truncate">
            {group?.name || "Guruh o'chirilgan"}
          </p>
        </div>
        {complete && (
          <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-2.5 py-1 rounded-full shrink-0">
            Tekshirish vaqti
          </span>
        )}
      </div>
      {task.description && (
        <p className="text-slate-500 text-sm line-clamp-2">
          {task.description}
        </p>
      )}
      <div>
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
          <span>
            {done}/{total} topshirdi · {graded} baholandi
          </span>
          {task.dueDate && (
            <span className="flex items-center gap-1">
              <Clock size={12} /> {formatDate(task.dueDate)}
            </span>
          )}
        </div>
        <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#4F73FF] rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function TaskDetail({
  task,
  group,
  appData,
  openModal,
  markSubmission,
  onBack,
}) {
  if (!group) {
    return (
      <div className="space-y-5">
        <button onClick={onBack} className={BTN_GHOST}>
          <ArrowLeft size={15} /> Orqaga
        </button>
        <EmptyState
          icon={ClipboardList}
          title="Guruh topilmadi"
          subtitle="Bu vazifaning guruhi o'chirilgan bo'lishi mumkin."
        />
      </div>
    );
  }
  const students = getGroupStudents(appData, group.id);
  const done = students.filter((s) => {
    const sub = task.submissions[s.id];
    return sub && (sub.status === "submitted" || sub.status === "graded");
  }).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className={BTN_GHOST}>
          <ArrowLeft size={15} /> Orqaga
        </button>
        <button
          onClick={() =>
            openModal({
              type: "confirm",
              message: `"${task.title}" vazifasini o'chirasizmi?`,
              action: { kind: "deleteTask", taskId: task.id },
            })
          }
          className={BTN_ICON}
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className={`${GLASS} rounded-xl p-5`}>
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: group.color }}
          />
          <span className="text-slate-500 text-sm">{group.name}</span>
        </div>
        <h2 className="font-display text-xl font-bold text-slate-900">
          {task.title}
        </h2>
        {task.description && (
          <p className="text-slate-600 text-sm mt-2">{task.description}</p>
        )}
        {task.attachment &&
          task.attachment.dataUrl &&
          (task.attachment.type === "video" ? (
            <video
              src={task.attachment.dataUrl}
              controls
              className="mt-3 rounded-xl max-h-64 w-full bg-black/30"
            />
          ) : (
            <img
              src={task.attachment.dataUrl}
              alt=""
              className="mt-3 rounded-xl max-h-64 object-cover"
            />
          ))}
        <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
          {task.dueDate && (
            <span className="flex items-center gap-1">
              <Clock size={12} /> Muddat: {formatDate(task.dueDate)}
            </span>
          )}
          <span>
            {done}/{students.length} topshirdi
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {students.map((s) => (
          <SubmissionRow
            key={s.id}
            student={s}
            group={group}
            taskId={task.id}
            submission={task.submissions[s.id]}
            markSubmission={markSubmission}
          />
        ))}
      </div>
    </div>
  );
}

function SubmissionRow({ student, group, taskId, submission, markSubmission }) {
  const status = submission?.status || "pending";
  return (
    <div className={`${GLASS_SOFT} rounded-xl p-4`}>
      <div className="flex items-center gap-3">
        <Avatar name={student.name} color={group.color} size={36} />
        <p className="text-slate-900 text-sm font-medium flex-1 truncate">
          {student.name}
        </p>
        {status === "pending" && (
          <span className="text-slate-400 text-xs bg-slate-50 border border-slate-200 rounded-full px-2.5 py-1">
            Kutilmoqda
          </span>
        )}
        {status === "submitted" && (
          <span className="text-sky-700 text-xs bg-sky-50 border border-sky-200 rounded-full px-2.5 py-1">
            Baholash kerak
          </span>
        )}
        {status === "graded" && (
          <span className="text-emerald-700 text-xs bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1">
            Baholandi
          </span>
        )}
      </div>

      {status === "pending" && (
        <p className="text-slate-400 text-xs mt-2">
          O'quvchi hali topshirmagan.
        </p>
      )}

      {(status === "submitted" || status === "graded") && (
        <div className="mt-3 space-y-2.5">
          {submission.description && (
            <p className="text-slate-600 text-sm">{submission.description}</p>
          )}
          {submission.attachment &&
            (submission.attachment.dataUrl ? (
              submission.attachment.type === "video" ? (
                <video
                  src={submission.attachment.dataUrl}
                  controls
                  className="rounded-xl max-h-56 w-full bg-black/30"
                />
              ) : (
                <img
                  src={submission.attachment.dataUrl}
                  alt=""
                  className="rounded-xl max-h-56 object-cover"
                />
              )
            ) : (
              <p className="text-slate-400 text-xs italic">
                Fayl juda katta edi, saqlanmadi.
              </p>
            ))}
          <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
            <span className="text-slate-400 text-xs">
              {formatDateTime(submission.submittedAt)}
              {submission.coinsAwarded
                ? ` · +${submission.coinsAwarded} 🪙`
                : ""}
            </span>
            <StarRating
              value={submission.rating || 0}
              interactive
              size={22}
              onChange={(r) =>
                markSubmission(taskId, student.id, {
                  rating: r,
                  status: "graded",
                })
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}

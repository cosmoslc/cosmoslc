import { useState } from "react";
import {
  ClipboardList,
  Check,
  Clock,
  Upload,
  Loader2,
  Camera,
} from "lucide-react";
import {
  BTN_GHOST,
  BTN_PRIMARY,
  GLASS,
  INPUT_CLS,
} from "../../../shared/theme/tokens";
import { formatDate, formatDateTime } from "../utils/helpers";
import { processMediaFile } from "../../../shared/utils/media";
import { EmptyState, StarRating } from "../../../shared/components/primitives";

export function StudentTasks({ appData, student, markSubmission }) {
  const myGroupIds = student.groupIds;
  const myTasks = appData.tasks
    .filter((t) => myGroupIds.includes(t.groupId))
    .slice()
    .sort((a, b) => b.createdAt - a.createdAt);
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-bold text-slate-900">
          Vazifalarim
        </h2>
      </div>
      {myTasks.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Hozircha vazifa yo'q"
          subtitle="Ustoz vazifa berganda shu yerda ko'rinadi."
        />
      ) : (
        <div className="space-y-3">
          {myTasks.map((t) => {
            const group = appData.groups.find((g) => g.id === t.groupId);
            return (
              <StudentTaskCard
                key={t.id}
                task={t}
                group={group}
                student={student}
                markSubmission={markSubmission}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export function StudentTaskCard({ task, group, student, markSubmission }) {
  const submission = task.submissions[student.id];
  const status = submission?.status || "pending";
  const [mode, setMode] = useState(null);
  const [desc, setDesc] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      setAttachment(await processMediaFile(file));
    } catch (err) {
      console.error(err);
    }
    setUploading(false);
  }

  function handleSubmit() {
    markSubmission(task.id, student.id, {
      status: "submitted",
      description: desc,
      attachment,
      submittedAt: Date.now(),
    });
    setMode(null);
    setDesc("");
    setAttachment(null);
  }

  return (
    <div className={`${GLASS} rounded-xl p-5 space-y-3`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          {group && (
            <p className="text-slate-400 text-xs flex items-center gap-1.5 mb-1">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: group.color }}
              />
              {group.name}
            </p>
          )}
          <h3 className="font-display text-slate-900 font-semibold truncate">
            {task.title}
          </h3>
          {task.dueDate && (
            <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-1">
              <Clock size={12} /> Muddat: {formatDate(task.dueDate)}
            </p>
          )}
        </div>
        {status === "pending" && (
          <span className="text-slate-400 text-xs bg-slate-50 border border-slate-200 rounded-full px-2.5 py-1 shrink-0">
            Kutilmoqda
          </span>
        )}
        {status === "submitted" && (
          <span className="text-sky-700 text-xs bg-sky-50 border border-sky-200 rounded-full px-2.5 py-1 shrink-0">
            Tekshirilmoqda
          </span>
        )}
        {status === "graded" && (
          <span className="text-emerald-700 text-xs bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1 shrink-0">
            Baholandi
          </span>
        )}
      </div>

      {task.description && (
        <p className="text-slate-500 text-sm">{task.description}</p>
      )}
      {task.attachment &&
        task.attachment.dataUrl &&
        (task.attachment.type === "video" ? (
          <video
            src={task.attachment.dataUrl}
            controls
            className="rounded-xl max-h-56 w-full bg-black/30"
          />
        ) : (
          <img
            src={task.attachment.dataUrl}
            alt=""
            className="rounded-xl max-h-56 object-cover"
          />
        ))}

      {status === "pending" && mode !== "upload" && (
        <button
          onClick={() => setMode("upload")}
          className={`${BTN_PRIMARY} w-full`}
        >
          <Upload size={15} /> Ishimni topshirish
        </button>
      )}

      {status === "pending" && mode === "upload" && (
        <div className="space-y-2.5 pt-2 border-t border-slate-200">
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Izoh yozing (ixtiyoriy)..."
            rows={2}
            className={INPUT_CLS}
          />
          <div className="flex items-center gap-2 flex-wrap">
            <label className={`${BTN_GHOST} cursor-pointer`}>
              <input
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleFile}
              />
              {uploading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Camera size={14} />
              )}{" "}
              {attachment ? "Fayl tanlandi" : "Rasm/video biriktirish"}
            </label>
            {attachment && (
              <span className="text-slate-400 text-xs truncate">
                {attachment.name}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setMode(null);
                setAttachment(null);
              }}
              className={`${BTN_GHOST} flex-1`}
            >
              Bekor qilish
            </button>
            <button onClick={handleSubmit} className={`${BTN_PRIMARY} flex-1`}>
              <Check size={14} /> Topshirish
            </button>
          </div>
        </div>
      )}

      {(status === "submitted" || status === "graded") && (
        <div className="pt-2 border-t border-slate-200 space-y-2">
          {submission.description && (
            <p className="text-slate-600 text-sm italic">
              "{submission.description}"
            </p>
          )}
          {submission.attachment &&
            submission.attachment.dataUrl &&
            (submission.attachment.type === "video" ? (
              <video
                src={submission.attachment.dataUrl}
                controls
                className="rounded-xl max-h-48 w-full bg-black/30"
              />
            ) : (
              <img
                src={submission.attachment.dataUrl}
                alt=""
                className="rounded-xl max-h-48 object-cover"
              />
            ))}
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs">
              {formatDateTime(submission.submittedAt)}
              {submission.coinsAwarded
                ? ` · +${submission.coinsAwarded} 🪙`
                : ""}
            </span>
            {status === "graded" && (
              <StarRating value={submission.rating} size={18} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

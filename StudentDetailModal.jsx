import { useState } from "react";
import { Phone, Lock, Trash2 } from "lucide-react";
import {
  Modal,
  Avatar,
  StarRating,
} from "../../../shared/components/primitives";
import {
  INPUT_CLS,
  BTN_GHOST,
  BTN_PRIMARY,
} from "../../../shared/theme/tokens";
import {
  getStudentStats,
  getAttendanceStats,
  getStudentGroups,
} from "../utils/dataHelpers";
import {
  hashPassword,
  displayPhone,
  formatDate,
  formatDateTime,
} from "../utils/helpers";

export function StudentDetailModal({
  studentId,
  groupId,
  appData,
  openModal,
  onClose,
  updateStudent,
}) {
  const student = appData.students.find((s) => s.id === studentId);
  const group = appData.groups.find((g) => g.id === groupId);
  const [resetMode, setResetMode] = useState(false);
  const [newPw, setNewPw] = useState("");
  const [resetBusy, setResetBusy] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  if (!student || !group) {
    return (
      <Modal title="O'quvchi" onClose={onClose}>
        <p className="text-slate-500 text-sm">O'quvchi topilmadi.</p>
      </Modal>
    );
  }
  const stats = getStudentStats(appData.tasks, studentId, groupId);
  const attStats = getAttendanceStats(
    appData.attendance,
    studentId,
    student.groupIds,
  );
  const myGroups = getStudentGroups(appData, studentId);
  const history = appData.tasks
    .filter(
      (t) =>
        t.groupId === groupId &&
        t.submissions[studentId] &&
        t.submissions[studentId].status !== "pending",
    )
    .sort(
      (a, b) =>
        (b.submissions[studentId].submittedAt || 0) -
        (a.submissions[studentId].submittedAt || 0),
    );

  async function doReset() {
    if (newPw.length < 4) return;
    setResetBusy(true);
    const hash = await hashPassword(newPw);
    updateStudent(studentId, { passwordHash: hash });
    setResetBusy(false);
    setResetDone(true);
    setNewPw("");
    setTimeout(() => {
      setResetMode(false);
      setResetDone(false);
    }, 1200);
  }

  return (
    <Modal title="O'quvchi profili" onClose={onClose} wide>
      <div className="flex items-center gap-4 mb-5">
        <Avatar name={student.name} color={group.color} size={56} />
        <div className="flex-1 min-w-0">
          <p className="text-slate-900 font-semibold truncate">
            {student.name}
          </p>
          <p className="text-slate-500 text-sm truncate">
            {myGroups.map((g) => g.name).join(", ")}
          </p>
          <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-1">
            <Phone size={11} /> {displayPhone(student.phone)}
          </p>
          {student.birthDate && (
            <p className="text-slate-400 text-xs mt-0.5">
              🎂 {formatDate(student.birthDate)}
            </p>
          )}
          {(student.parentName || student.parentPhone) && (
            <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-1">
              <Phone size={11} /> Ota-ona: {student.parentName || ""}{" "}
              {student.parentPhone ? displayPhone(student.parentPhone) : ""}
            </p>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="text-amber-700 font-bold text-lg">
            {stats.count ? stats.avg.toFixed(1) : "—"}
          </p>
          <StarRating value={stats.avg} size={14} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-5">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
          <p className="text-slate-900 text-lg font-bold">
            {stats.done}/{stats.total}
          </p>
          <p className="text-slate-500 text-xs">Vazifa</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
          <p className="text-slate-900 text-lg font-bold">
            {attStats.total ? `${attStats.present}/${attStats.total}` : "—"}
          </p>
          <p className="text-slate-500 text-xs">Davomat</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
          <p className="text-amber-700 text-lg font-bold">
            {student.coins || 0} 🪙
          </p>
          <p className="text-slate-500 text-xs">Coin</p>
        </div>
      </div>

      <p className="text-slate-600 text-sm font-medium mb-2">
        Tarix ({group.name})
      </p>
      {history.length === 0 ? (
        <p className="text-slate-400 text-sm">Hali topshirilgan vazifa yo'q.</p>
      ) : (
        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
          {history.map((t) => {
            const sub = t.submissions[studentId];
            return (
              <div
                key={t.id}
                className="bg-slate-50 border border-slate-200 rounded-xl p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-slate-900 text-sm truncate">{t.title}</p>
                  {sub.rating ? (
                    <StarRating value={sub.rating} size={13} />
                  ) : (
                    <span className="text-slate-400 text-xs">baholanmagan</span>
                  )}
                </div>
                <p className="text-slate-400 text-xs mt-1">
                  {formatDateTime(sub.submittedAt)}
                </p>
              </div>
            );
          })}
        </div>
      )}

      <div className="border-t border-slate-200 mt-5 pt-4 space-y-2">
        {!resetMode ? (
          <button
            onClick={() => setResetMode(true)}
            className={`${BTN_GHOST} w-full`}
          >
            <Lock size={14} /> Parolni tiklash
          </button>
        ) : (
          <div className="space-y-2">
            <input
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              placeholder="Yangi parol (kamida 4 belgi)"
              className={INPUT_CLS}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setResetMode(false)}
                className={`${BTN_GHOST} flex-1`}
              >
                Bekor qilish
              </button>
              <button
                onClick={doReset}
                disabled={resetBusy || newPw.length < 4}
                className={`${BTN_PRIMARY} flex-1`}
              >
                {resetDone ? "✓" : "Saqlash"}
              </button>
            </div>
          </div>
        )}
        <button
          onClick={() =>
            openModal({
              type: "confirm",
              message: `${student.name}ni"${group.name}" guruhidan chiqarasizmi?`,
              action: { kind: "removeFromGroup", groupId, studentId },
            })
          }
          className={`${BTN_GHOST} w-full text-rose-700 hover:text-rose-700`}
        >
          <Trash2 size={14} /> Guruhdan chiqarish
        </button>
      </div>
    </Modal>
  );
}

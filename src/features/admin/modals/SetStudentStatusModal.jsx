import { useState } from "react";
import { Modal } from "../components/primitives";
import { INPUT_CLS, LABEL_CLS, PrimaryButton } from "../theme/tokens";

export function SetStudentStatusModal({ student, onSave, onClose }) {
  const [status, setStatus] = useState(student?.status || "active");
  const [note, setNote] = useState(student?.statusNote || "");
  const [busy, setBusy] = useState(false);

  const needsNote = status === "paused" || status === "left";

  async function submit() {
    setBusy(true);
    const todayStr = new Date().toISOString().slice(0, 10);
    const currentMemberships = { ...(student?.groupMemberships || {}) };
    if (status === "active") {
      (student?.groupIds || []).forEach((gid) => {
        const strGid = String(gid);
        currentMemberships[strGid] = {
          ...(currentMemberships[strGid] || {}),
          status: "active",
          activationDate: currentMemberships[strGid]?.activationDate || todayStr,
          reactivatedAt: currentMemberships[strGid]?.reactivatedAt || todayStr,
        };
      });
    }
    await onSave(student.id, {
      status,
      statusNote: note.trim(),
      groupMemberships: currentMemberships,
      ...(status === "active"
        ? { activationDate: todayStr, reactivatedAt: todayStr, pausedAt: null, studiedOneMonth: true }
        : status === "paused"
        ? { pausedAt: todayStr }
        : {}),
    });
    setBusy(false);
    onClose();
  }

  return (
    <Modal
      title={`Holatni o'zgartirish — ${student?.name || "o'quvchi"}`}
      onClose={onClose}
      position="center"
    >
      <div className="space-y-4 text-sm">
        <div>
          <label className={LABEL_CLS}>Holat</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={INPUT_CLS}
          >
            <option value="active">Faol</option>
            <option value="paused">Muzlatilgan</option>
            <option value="left">Ketgan</option>
            <option value="returned">Qaytib kelgan</option>
            <option value="graduated">Bitirgan</option>
          </select>
        </div>

        {needsNote && (
          <div>
            <label className={LABEL_CLS}>Sabab</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className={`${INPUT_CLS} min-h-[88px]`}
              placeholder="Nega bunday holatga keldi?"
            />
          </div>
        )}

        <PrimaryButton onClick={submit} disabled={busy} className="w-full">
          Saqlash
        </PrimaryButton>
      </div>
    </Modal>
  );
}

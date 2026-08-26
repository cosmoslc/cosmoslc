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
    await onSave(student.id, { status, statusNote: note.trim() });
    setBusy(false);
    onClose();
  }

  return (
    <Modal
      title={`Holatni o'zgartirish — ${student?.name || "o'quvchi"}`}
      onClose={onClose}
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

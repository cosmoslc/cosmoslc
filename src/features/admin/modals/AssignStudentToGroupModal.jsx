import { useState } from "react";
import { Modal } from "../components/primitives";
import {
  INPUT_CLS,
  LABEL_CLS,
  PrimaryButton,
  BTN_GHOST,
} from "../theme/tokens";

export function AssignStudentToGroupModal({
  student,
  groups,
  onAssign,
  onRemoveAll,
  onClose,
}) {
  const studentGids = (student?.groupIds || []).map(String);
  const available = (groups || []).filter(
    (g) => !studentGids.includes(String(g.id)),
  );
  const [groupId, setGroupId] = useState(available[0]?.id || "");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!groupId) return;
    setBusy(true);
    await onAssign(student.id, groupId);
    setBusy(false);
    onClose();
  }

  return (
    <Modal
      title={`Guruhga qo'shish — ${student?.name || "o'quvchi"}`}
      onClose={onClose}
    >
      <div className="space-y-4 text-sm">
        <div>
          <label className={LABEL_CLS}>Guruhni tanlang</label>
          {available.length === 0 ? (
            <div className="space-y-2">
              <p className="text-slate-500 text-sm">
                Barcha guruhlar allaqachon tanlangan.
              </p>
              <p className="text-slate-500 text-sm">
                Agar o'quvchini guruhlardan chiqarishni xohlasangiz, quyidagi
                tugmani bosing.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    if (!onRemoveAll) return;
                    await onRemoveAll(student.id);
                    onClose();
                  }}
                  className={`${BTN_GHOST} flex-1`}
                >
                  Hammasidan chiqarish
                </button>
              </div>
            </div>
          ) : (
            <select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className={INPUT_CLS}
            >
              <option value="">Guruh tanlanmagan</option>
              {available.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <PrimaryButton
          onClick={submit}
          disabled={busy || !groupId}
          className="w-full"
        >
          Qo'shish
        </PrimaryButton>
      </div>
    </Modal>
  );
}

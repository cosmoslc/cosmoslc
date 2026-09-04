import { useState } from "react";
import { Modal } from "../components/primitives";
import { Icon } from "../components/Icon";
import { INPUT_CLS, LABEL_CLS, PrimaryButton, BTN_GHOST } from "../theme/tokens";

export function StudentBulkMessageModal({ studentIds, students, onSend, onClose }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const recipients = students.filter((s) => studentIds.includes(s.id));

  async function submit() {
    if (!text.trim()) return;
    setBusy(true);
    await onSend(studentIds, text.trim());
    setBusy(false);
    setDone(true);
  }

  return (
    <Modal title="O'quvchilarga xabar" onClose={onClose} position="center">
      <div className="space-y-4">
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-700">
          SMS orqali avtomatik yuborish hali sozlanmagan (provayder ulanmagan). Bu
          xabar hozircha faqat <b>Bildirishnomalar</b> tarixiga har bir o'quvchi
          uchun yoziladi — ular ustoz/o'quvchi panelida ko'rinadi.
        </div>

        <div>
          <label className={LABEL_CLS}>Qabul qiluvchilar</label>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-2">
            {recipients.map((s) => (
              <span key={s.id} className="text-xs bg-white border border-slate-200 rounded-full px-2 py-1 text-slate-600">
                {s.name}
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className={LABEL_CLS}>Xabar matni</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder="Masalan: Ertangi darsingiz vaqti o'zgardi..."
            className={INPUT_CLS}
          />
        </div>

        {done ? (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700 flex items-center gap-2">
            <Icon name="check-circle" size={16} /> {recipients.length} ta o'quvchiga yozildi.
          </div>
        ) : (
          <div className="flex gap-2">
            <button onClick={onClose} className={`${BTN_GHOST} flex-1`} type="button">Bekor qilish</button>
            <PrimaryButton onClick={submit} disabled={busy || !text.trim()} className="flex-1">
              {busy ? <Icon name="spinner" size={16} className="animate-spin" /> : <Icon name="megaphone" size={16} />} Yuborish
            </PrimaryButton>
          </div>
        )}
      </div>
    </Modal>
  );
}

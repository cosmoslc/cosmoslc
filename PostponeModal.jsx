import { useState } from "react";
import { CalendarClock } from "lucide-react";
import { Modal } from "../../../shared/components/primitives";
import {
  INPUT_CLS,
  LABEL_CLS,
  BTN_PRIMARY,
} from "../../../shared/theme/tokens";
import { todayISO } from "../utils/helpers";

export function PostponeModal({ groups, onAdd, onClose }) {
  const [groupId, setGroupId] = useState(groups[0]?.id || "");
  const [originalDate, setOriginalDate] = useState(todayISO());
  const [newDate, setNewDate] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  function submit() {
    if (!groupId || !originalDate || !newDate) {
      setError("Guruh va ikkala sanani ham to'ldiring.");
      return;
    }
    onAdd({ groupId, originalDate, newDate, note });
    onClose();
  }

  return (
    <Modal title="Darsni ko'chirish" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className={LABEL_CLS}>Guruh</label>
          <select
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            className={INPUT_CLS}
          >
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL_CLS}>Eski sana</label>
          <input
            type="date"
            value={originalDate}
            onChange={(e) => setOriginalDate(e.target.value)}
            className={INPUT_CLS}
          />
        </div>
        <div>
          <label className={LABEL_CLS}>Yangi sana</label>
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className={INPUT_CLS}
          />
        </div>
        <div>
          <label className={LABEL_CLS}>Izoh (ixtiyoriy)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Masalan: bayram sababli"
            className={INPUT_CLS}
          />
        </div>
        {error && <p className="text-rose-700 text-xs">{error}</p>}
        <button onClick={submit} className={`${BTN_PRIMARY} w-full`}>
          <CalendarClock size={15} /> Ko'chirish
        </button>
      </div>
    </Modal>
  );
}

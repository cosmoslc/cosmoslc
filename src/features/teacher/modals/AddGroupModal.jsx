import { useState } from "react";
import { Plus } from "lucide-react";
import { Modal } from "../../../shared/components/primitives";
import {
  INPUT_CLS,
  LABEL_CLS,
  BTN_PRIMARY,
} from "../../../shared/theme/tokens";
import { GROUP_COLORS, WEEK_DAYS } from "../utils/constants";
import { nextGroupColor, todayISO } from "../utils/helpers";

export function AddGroupModal({ groups, courses, onAdd, onClose }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(nextGroupColor(groups));
  const [courseId, setCourseId] = useState((courses && courses[0]?.id) || "");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("3");
  const [days, setDays] = useState([]);
  const [time, setTime] = useState("15:00");
  const [startDate, setStartDate] = useState(todayISO());
  const [error, setError] = useState("");

  function toggleDay(d) {
    setDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
    );
  }

  function submit() {
    if (!courseId) {
      setError("Avval kursni tanlang.");
      return;
    }
    if (!name.trim()) {
      setError("Guruh nomini kiriting.");
      return;
    }
    onAdd({
      name: name.trim(),
      color,
      days,
      time,
      courseId,
      price: parseFloat(price) || 0,
      durationMonths: parseFloat(duration) || 0,
      startDate,
    });
    onClose();
  }

  return (
    <Modal title="Yangi guruh" onClose={onClose}>
      <div className="space-y-4">
        {!courses || courses.length === 0 ? (
          <p className="text-slate-500 text-sm bg-slate-50 border border-slate-200 rounded-xl p-3">
            Avval direktor/menejer panelida kurs yaratilishi kerak — keyin shu
            yerdan guruh ochasiz.
          </p>
        ) : (
          <div>
            <label className={LABEL_CLS}>Kurs</label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className={INPUT_CLS}
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className={LABEL_CLS}>Guruh nomi</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Masalan: Matematika - A guruh"
            className={INPUT_CLS}
            autoFocus
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LABEL_CLS}>Narxi (oylik, so'm)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={INPUT_CLS}
            />
          </div>
          <div>
            <label className={LABEL_CLS}>Davomiyligi (oy)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className={INPUT_CLS}
            />
          </div>
        </div>
        <div>
          <label className={LABEL_CLS}>Rang</label>
          <div className="flex gap-2 flex-wrap">
            {GROUP_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full border-2 ${color === c ? "border-slate-900 scale-110" : "border-slate-200"}`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>
        <div>
          <label className={LABEL_CLS}>Dars kunlari</label>
          <div className="flex flex-wrap gap-1.5">
            {WEEK_DAYS.map((d) => (
              <button
                key={d}
                onClick={() => toggleDay(d)}
                className={`text-xs px-2.5 py-1.5 rounded-xl border ${days.includes(d) ? "bg-slate-100 border-slate-300 text-slate-900" : "bg-slate-50 border-slate-200 text-slate-500"}`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LABEL_CLS}>Vaqt</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className={INPUT_CLS}
            />
          </div>
          <div>
            <label className={LABEL_CLS}>Boshlanish sanasi</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={INPUT_CLS}
            />
          </div>
        </div>
        {error && <p className="text-rose-700 text-xs">{error}</p>}
        <button onClick={submit} className={`${BTN_PRIMARY} w-full`}>
          <Plus size={16} /> Guruh yaratish
        </button>
      </div>
    </Modal>
  );
}

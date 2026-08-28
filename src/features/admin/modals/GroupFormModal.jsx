import { useEffect, useState } from "react";
import { GROUP_COLORS, nextGroupColor } from "../utils/constants";
import { Icon } from "../components/Icon";
import { INPUT_CLS, LABEL_CLS, PrimaryButton } from "../theme/tokens";
import { money, todayISO } from "../utils/helpers";
import { DayPicker, Modal, MoneyInput } from "../components/primitives";

function computeEndTimeStr(startTimeStr, durationMinutes) {
  if (!startTimeStr) return "16:30";
  const [h, m] = startTimeStr.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return "16:30";
  const totalMins = h * 60 + m + Number(durationMinutes || 90);
  const endH = Math.floor(totalMins / 60) % 24;
  const endM = totalMins % 60;
  return `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
}

function computeDurationMinutes(startTimeStr, endTimeStr) {
  if (!startTimeStr || !endTimeStr) return 90;
  const [sH, sM] = startTimeStr.split(":").map(Number);
  const [eH, eM] = endTimeStr.split(":").map(Number);
  if (isNaN(sH) || isNaN(sM) || isNaN(eH) || isNaN(eM)) return 90;
  let startMins = sH * 60 + sM;
  let endMins = eH * 60 + eM;
  if (endMins <= startMins) endMins += 24 * 60;
  return endMins - startMins;
}

export function GroupFormModal({
  editing,
  initialCourseId,
  courses = [],
  groups = [],
  rooms = [],
  teachers = [],
  onSubmit,
  onClose,
}) {
  const matchedInitialCourse = initialCourseId
    ? courses.find((c) => String(c.id) === String(initialCourseId))
    : null;

  const [name, setName] = useState(editing?.name || "");
  const [format, setFormat] = useState(editing?.format || "offline"); // 'offline' | 'online'
  const [courseId, setCourseId] = useState(
    editing?.courseId || matchedInitialCourse?.id || initialCourseId || courses[0]?.id || "",
  );
  const [price, setPrice] = useState(
    editing?.price ??
      (matchedInitialCourse?.price ?? courses[0]?.price ?? ""),
  );
  const [duration, setDuration] = useState(
    editing?.durationMonths ?? (matchedInitialCourse?.durationMonths ?? "3"),
  );

  const [teacherId, setTeacherId] = useState(
    editing?.teacherHrId || editing?.teacherId || "",
  );
  const [salaryType, setSalaryType] = useState(
    editing?.teacherSalaryType || "percent",
  );
  const [salaryPercent, setSalaryPercent] = useState(
    editing?.teacherSalaryPercent ?? "40",
  );
  const [fixedSalary, setFixedSalary] = useState(
    editing?.teacherSalaryFixed ?? "",
  );

  const [roomId, setRoomId] = useState(editing?.roomId || "");
  const [days, setDays] = useState(editing?.days || []);

  const [time, setTime] = useState(editing?.time || "15:00");
  const [endTime, setEndTime] = useState(
    editing?.endTime || computeEndTimeStr(editing?.time || "15:00", editing?.lessonDurationMinutes ?? 90)
  );

  const [startDate, setStartDate] = useState(editing?.startDate || todayISO());
  const [telegramChatId, setTelegramChatId] = useState(editing?.telegramChatId || "");
  const [color, setColor] = useState(editing?.color || nextGroupColor(groups));
  const [note, setNote] = useState(editing?.note || editing?.statusNote || "");
  const [error, setError] = useState("");

  const selectedCourse = courses.find((c) => String(c.id) === String(courseId));
  const selectedTeacher = teachers.find((t) => String(t.id) === String(teacherId)) || null;

  function handleCourseChange(newCourseId) {
    setCourseId(newCourseId);
    if (!editing) {
      const c = courses.find((course) => course.id === newCourseId);
      if (c?.price !== undefined) {
        setPrice(c.price);
      }
    }
  }

  function handleTeacherChange(newTeacherId) {
    setTeacherId(newTeacherId);
    if (!editing) {
      const t = teachers.find((tch) => tch.id === newTeacherId);
      if (t) {
        const nextType = t.salaryType || "percent";
        const nextPercent = t.revenueSharePercent ?? 40;
        const nextFixed = t.fixedSalary ?? 0;
        setSalaryType(nextType);
        setSalaryPercent(String(nextPercent));
        setFixedSalary(String(nextFixed));
      }
    }
  }

  // Set default teacher once if not set
  useEffect(() => {
    if (!teacherId && teachers.length > 0 && !editing) {
      const firstTeacher = teachers[0];
      setTeacherId(firstTeacher.id);
      const nextType = firstTeacher.salaryType || "percent";
      const nextPercent = firstTeacher.revenueSharePercent ?? 40;
      const nextFixed = firstTeacher.fixedSalary ?? 0;
      setSalaryType(nextType);
      setSalaryPercent(String(nextPercent));
      setFixedSalary(String(nextFixed));
    }
  }, []);

  function submit() {
    if (!name.trim()) {
      setError("Guruh nomini kiriting.");
      return;
    }
    if (!courseId) {
      setError("Avval kursni tanlang.");
      return;
    }
    if (!teacherId) {
      setError("O'qituvchini tanlang.");
      return;
    }
    const calculatedDuration = computeDurationMinutes(time, endTime);
    onSubmit({
      ...(editing?.id ? { id: editing.id } : {}),
      name: name.trim(),
      format,
      courseId,
      price: price === "" ? 0 : parseFloat(price) || 0,
      durationMonths: parseFloat(duration) || 0,
      teacherHrId: teacherId,
      teacherSalaryType: salaryType,
      teacherSalaryPercent: parseFloat(salaryPercent) || 0,
      teacherSalaryFixed: parseFloat(fixedSalary) || 0,
      roomId: roomId || null,
      days,
      time,
      endTime,
      lessonDurationMinutes: calculatedDuration,
      startDate,
      telegramChatId: telegramChatId.trim(),
      color,
      note: note.trim(),
    });
    onClose();
  }

  return (
    <Modal
      title={editing ? "Guruhni tahrirlash" : "Yangi guruh ochish"}
      onClose={onClose}
    >
      <div className="space-y-4 text-slate-900 dark:text-slate-100 text-sm">
        {/* Guruh nomi */}
        <div>
          <label className={LABEL_CLS}>Guruh nomi</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Front-end A1"
            className={INPUT_CLS}
            autoFocus
          />
        </div>

        {/* Kurs tanlang */}
        <div>
          <label className={LABEL_CLS}>Kurs</label>
          <select
            value={courseId}
            onChange={(e) => handleCourseChange(e.target.value)}
            className={INPUT_CLS}
            disabled={!!editing}
          >
            {courses.length === 0 && (
              <option value="">Kurs mavjud emas</option>
            )}
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Guruh narxi va davomiyligi */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LABEL_CLS}>Guruh narxi</label>
            <MoneyInput
              value={price}
              onChange={(val) => setPrice(val)}
              placeholder="150 000"
              className={INPUT_CLS}
            />
          </div>
          <div>
            <label className={LABEL_CLS}>Guruh davomiyligi</label>
            <input
              type="number"
              min="1"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className={INPUT_CLS}
              placeholder="3"
            />
          </div>
        </div>

        {/* O'qituvchi va ish haqi kelishuvi */}
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className={LABEL_CLS}>
            O'qituvchi
          </label>
          
          <div>
            <select
              value={teacherId}
              onChange={(e) => handleTeacherChange(e.target.value)}
              className={INPUT_CLS}
            >
              {teachers.length === 0 && (
                <option value="">O'qituvchi mavjud emas</option>
              )}
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {selectedTeacher && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL_CLS}>Hisoblash turi</label>
                <select
                  value={salaryType}
                  onChange={(e) => setSalaryType(e.target.value)}
                  className={INPUT_CLS}
                >
                  <option value="percent">Foizli ulush</option>
                  <option value="fixed">Belgilangan oylik</option>
                </select>
              </div>

              {salaryType === "percent" ? (
                <div>
                  <label className={LABEL_CLS}>Guruhdagi ulush</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={salaryPercent}
                    onChange={(e) => setSalaryPercent(e.target.value)}
                    className={INPUT_CLS}
                    placeholder="40"
                  />
                </div>
              ) : (
                <div>
                  <label className={LABEL_CLS}>Oylik maosh</label>
                  <MoneyInput
                    value={fixedSalary}
                    onChange={(val) => setFixedSalary(val)}
                    placeholder="2 000 000"
                    className={INPUT_CLS}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Xona tanlash va Dars kunlari */}
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className={LABEL_CLS}>Xona</label>
            <select
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className={INPUT_CLS}
            >
              <option value="">Xona tanlanmagan</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={`${LABEL_CLS} mb-1.5 block`}>
              Dars kunlari
            </label>
            <DayPicker value={days} onChange={setDays} />
          </div>
        </div>

        {/* Dars boshlanish va tugash vaqti */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LABEL_CLS}>Boshlanish vaqti</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className={INPUT_CLS}
            />
          </div>
          <div>
            <label className={LABEL_CLS}>Tugash vaqti</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className={INPUT_CLS}
            />
          </div>
        </div>

        {/* Boshlanish sanasi va Telegram Chat ID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className={LABEL_CLS}>Boshlanish sanasi</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={INPUT_CLS}
            />
          </div>

          <div>
            <label className={LABEL_CLS}>Telegram Chat ID</label>
            <input
              type="text"
              value={telegramChatId}
              onChange={(e) => setTelegramChatId(e.target.value)}
              placeholder="-100123456789"
              className={INPUT_CLS}
            />
          </div>
        </div>

        {/* Guruh rangi */}
        <div>
          <label className={LABEL_CLS}>Guruh rangi</label>
          <div className="flex gap-2 flex-wrap pt-1">
            {GROUP_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  color === c ? "border-slate-900 dark:border-white scale-110 shadow-md ring-2 ring-indigo-400" : "border-slate-200 dark:border-slate-700"
                }`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>

        {/* Izoh */}
        <div>
          <label className={LABEL_CLS}>Izoh</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Izoh yozing..."
            className={`${INPUT_CLS} min-h-[64px]`}
          />
        </div>

        {error && <p className="text-red-500 dark:text-red-400 text-xs font-semibold">{error}</p>}

        <PrimaryButton
          onClick={submit}
          className="w-full mt-2"
          disabled={!courseId || !teacherId || !name.trim()}
        >
          {editing ? (
            <Icon name="check" size={16} />
          ) : (
            <Icon name="plus" size={16} />
          )}{" "}
          {editing ? "Saqlash" : "Guruh yaratish"}
        </PrimaryButton>
      </div>
    </Modal>
  );
}

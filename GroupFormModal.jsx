import { useEffect, useState } from "react";
import { GROUP_COLORS, nextGroupColor } from "../utils/constants";
import { Icon } from "../components/Icon";
import { INPUT_CLS, LABEL_CLS, PrimaryButton } from "../theme/tokens";
import { money, todayISO } from "../utils/helpers";
import { DayPicker, Modal, MoneyInput } from "../components/primitives";

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
  const [lessonDurationMinutes, setLessonDurationMinutes] = useState(
    editing?.lessonDurationMinutes ?? "90",
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
    onSubmit({
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
      lessonDurationMinutes: parseFloat(lessonDurationMinutes) || 90,
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
        {/* Ta'lim shakli (Offline / Online) & Guruh nomi */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <label className={LABEL_CLS}>1. Guruh nomi *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masalan: Front-end A1, IELTS Standard..."
              className={INPUT_CLS}
              autoFocus
            />
          </div>
          <div>
            <label className={LABEL_CLS}>Ta'lim shakli *</label>
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setFormat("offline")}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                  format === "offline"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                Offline
              </button>
              <button
                type="button"
                onClick={() => setFormat("online")}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                  format === "online"
                    ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                Online
              </button>
            </div>
          </div>
        </div>

        {/* 2. Kurs tanlang */}
        <div>
          <label className={LABEL_CLS}>2. Kursni tanlang *</label>
          <select
            value={courseId}
            onChange={(e) => handleCourseChange(e.target.value)}
            className={INPUT_CLS}
            disabled={!!editing}
          >
            {courses.length === 0 && (
              <option value="">— Avval kurs yarating —</option>
            )}
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {selectedCourse && Number(selectedCourse.price || 0) > 0 && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Kurs bazaviy narxi:{" "}
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {money(selectedCourse.price || 0)} so'm
              </span>
            </p>
          )}
        </div>

        {/* 3. Guruh narxi va davomiyligi */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LABEL_CLS}>3. Guruh narxi (oylik so'm)</label>
            <MoneyInput
              value={price}
              onChange={(val) => setPrice(val)}
              placeholder="150 000"
              className={INPUT_CLS}
            />
          </div>
          <div>
            <label className={LABEL_CLS}>Kurs davomiyligi (oy)</label>
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

        {/* 4. O'qituvchi va ish haqi kelishuvi */}
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className={LABEL_CLS}>
            4. O'qituvchi va maosh hisoblash turi *
          </label>
          
          <div>
            <select
              value={teacherId}
              onChange={(e) => handleTeacherChange(e.target.value)}
              className={INPUT_CLS}
            >
              {teachers.length === 0 && (
                <option value="">— O'qituvchi yo'q —</option>
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
                  <option value="percent">Foizli ulush (%)</option>
                  <option value="fixed">Belgilangan oylik</option>
                </select>
              </div>

              {salaryType === "percent" ? (
                <div>
                  <label className={LABEL_CLS}>Guruhdagi ulushi (%)</label>
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
                  <label className={LABEL_CLS}>Oylik maoshi (so'm)</label>
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

        {/* 5. Xona tanlash va Dars kunlari */}
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className={LABEL_CLS}>5. Xona tanlash</label>
            <select
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className={INPUT_CLS}
            >
              <option value="">— Xona tanlanmagan —</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.capacity || 20} o'rinli)
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

        {/* 6. Dars boshlanish vaqti va davomiyligi */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LABEL_CLS}>6. Dars boshlanish vaqti</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className={INPUT_CLS}
            />
          </div>
          <div>
            <label className={LABEL_CLS}>Dars davomiyligi vaqti</label>
            <select
              value={lessonDurationMinutes}
              onChange={(e) => setLessonDurationMinutes(e.target.value)}
              className={INPUT_CLS}
            >
              <option value="60">60 daqiqa (1 soat)</option>
              <option value="80">80 daqiqa (1.3 soat)</option>
              <option value="90">90 daqiqa (1.5 soat)</option>
              <option value="120">120 daqiqa (2 soat)</option>
              <option value="180">180 daqiqa (3 soat)</option>
            </select>
          </div>
        </div>

        {/* 7. Boshlanish sanasi va Telegram Chat ID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className={LABEL_CLS}>7. Boshlanish sanasi</label>
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

        {/* 8. Guruh rangi */}
        <div>
          <label className={LABEL_CLS}>8. Guruh rangi</label>
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

        {/* 9. Izoh */}
        <div>
          <label className={LABEL_CLS}>Izoh (Qo'shimcha eslatma)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Guruh bo'yicha izoh va eslatmalar..."
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

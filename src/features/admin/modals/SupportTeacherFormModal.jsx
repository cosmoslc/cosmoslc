import { useState } from "react";
import { Icon } from "../components/Icon";
import { INPUT_CLS, LABEL_CLS, PrimaryButton } from "../theme/tokens";
import { Modal, MoneyInput, PhoneInput } from "../components/primitives";
import { hashPassword } from "../utils/helpers";
import { Clock, Calendar } from "lucide-react";

const WEEKDAYS = [
  { id: "mon", label: "Du", full: "Dushanba" },
  { id: "tue", label: "Se", full: "Seshanba" },
  { id: "wed", label: "Chor", full: "Chorshanba" },
  { id: "thu", label: "Pay", full: "Payshanba" },
  { id: "fri", label: "Jum", full: "Juma" },
  { id: "sat", label: "Shan", full: "Shanba" },
  { id: "sun", label: "Yak", full: "Yakshanba" },
];

export function SupportTeacherFormModal({
  editing,
  teachers = [],
  branches = [],
  defaultBranchId,
  onSubmit,
  onClose,
}) {
  const [branchId, setBranchId] = useState(
    editing?.branchId || (defaultBranchId && defaultBranchId !== "all" ? defaultBranchId : "") || branches[0]?.id || "",
  );
  const effectiveBranchId = branchId || editing?.branchId || branches[0]?.id || "";
  const [assignedTeacherId, setAssignedTeacherId] = useState(
    editing?.assignedTeacherId || (teachers.length > 0 ? teachers[0].id : ""),
  );
  const [name, setName] = useState(editing?.name || "");
  const [phone, setPhone] = useState(editing?.phone || "");
  const [password, setPassword] = useState("");
  
  const [selectedDays, setSelectedDays] = useState(
    editing?.workingDays || ["mon", "wed", "fri"],
  );

  const [startTime, setStartTime] = useState(editing?.startTime || "09:00");
  const [endTime, setEndTime] = useState(editing?.endTime || "18:00");

  const [salaryType, setSalaryType] = useState(editing?.salaryType || "fixed");
  const [fixedSalary, setFixedSalary] = useState(editing?.fixedSalary ?? "");
  const [note, setNote] = useState(editing?.note || "");
  
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function toggleDay(dayId) {
    if (selectedDays.includes(dayId)) {
      setSelectedDays(selectedDays.filter((d) => d !== dayId));
    } else {
      setSelectedDays([...selectedDays, dayId]);
    }
  }

  function applyPreset(preset) {
    if (preset === "odd") {
      setSelectedDays(["mon", "wed", "fri"]);
    } else if (preset === "even") {
      setSelectedDays(["tue", "thu", "sat"]);
    } else if (preset === "all") {
      setSelectedDays(["mon", "tue", "wed", "thu", "fri", "sat"]);
    } else if (preset === "weekend") {
      setSelectedDays(["sat", "sun"]);
    }
  }

  function handleTeacherSelect(tId) {
    setAssignedTeacherId(tId);
    if (!name && tId) {
      const selectedT = teachers.find((t) => String(t.id) === String(tId));
      if (selectedT) {
        setName(`${selectedT.name} (Assistent)`);
      }
    }
  }

  async function submit() {
    if (!name.trim()) {
      setError("Ism va familiyani kiriting.");
      return;
    }
    if (!branchId && branches.length > 0) {
      setError("Filialni tanlang.");
      return;
    }
    if (!phone.trim()) {
      setError("Telefon raqamini kiriting.");
      return;
    }
    if (!editing && (!password || password.length < 4)) {
      setError("Parol kamida 4 belgi bo'lishi kerak.");
      return;
    }

    setBusy(true);

    const payload = {
      ...(editing?.id ? { id: editing.id } : {}),
      branchId: effectiveBranchId || null,
      assignedTeacherId: assignedTeacherId || null,
      name: name.trim(),
      phone,
      isAssistant: true,
      role: "assistant",
      workingDays: selectedDays,
      startTime,
      endTime,
      salaryType,
      fixedSalary: parseFloat(fixedSalary) || 0,
      note: note.trim(),
      rating: editing?.rating || 0,
      canCreateGroups: false,
      canReceivePayments: false,
    };

    if (password) {
      payload.passwordHash = await hashPassword(password);
    }

    setBusy(false);
    onSubmit(payload);
    onClose();
  }

  return (
    <Modal
      title={
        editing
          ? "Support o'qituvchini tahrirlash"
          : "Yangi support o'qituvchi qo'shish"
      }
      onClose={onClose}
    >
      <div className="space-y-3.5 max-h-[80vh] overflow-y-auto px-0.5">
        {/* Filial */}
        {branches.length > 0 && (
          <div>
            <label className={LABEL_CLS}>Filial</label>
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className={INPUT_CLS}
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Ustoz tanlash */}
        <div>
          <label className={LABEL_CLS}>Biriktirilgan ustoz</label>
          <select
            value={assignedTeacherId}
            onChange={(e) => handleTeacherSelect(e.target.value)}
            className={INPUT_CLS}
          >
            <option value="">Tanlang</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Ism va familiya */}
        <div>
          <label className={LABEL_CLS}>Ism va familiya</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jamshid Aliyev"
            className={INPUT_CLS}
          />
        </div>

        {/* Telefon raqami & Parol */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={LABEL_CLS}>Telefon raqami</label>
            <PhoneInput value={phone} onChange={setPhone} />
          </div>
          <div>
            <label className={LABEL_CLS}>
              {editing ? "Yangi parol" : "Parol"}
            </label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={editing ? "Bo'sh qoldirilsa o'zgarmaydi" : "Kamida 4 belgi"}
              className={INPUT_CLS}
            />
          </div>
        </div>

        {/* Hafta kunlari */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <label className={`${LABEL_CLS} !mb-0 flex items-center gap-1.5`}>
              <Calendar size={14} className="text-indigo-500" />
              Hafta kunlari
            </label>
            <div className="flex items-center gap-1 text-[11px]">
              <button
                type="button"
                onClick={() => applyPreset("odd")}
                className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 font-semibold cursor-pointer"
              >
                Toq
              </button>
              <button
                type="button"
                onClick={() => applyPreset("even")}
                className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 font-semibold cursor-pointer"
              >
                Juft
              </button>
              <button
                type="button"
                onClick={() => applyPreset("all")}
                className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 font-semibold cursor-pointer"
              >
                Hammasi
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {WEEKDAYS.map((day) => {
              const active = selectedDays.includes(day.id);
              return (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => toggleDay(day.id)}
                  className={`py-2 rounded-xl text-xs font-bold text-center border transition-all cursor-pointer ${
                    active
                      ? "bg-purple-600 border-purple-600 text-white shadow-2xs"
                      : "bg-white dark:bg-[#0F172A] border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                  }`}
                  title={day.full}
                >
                  {day.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Ish vaqti */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className={`${LABEL_CLS} flex items-center gap-1.5`}>
            <Clock size={14} className="text-purple-500" />
            Ish vaqti
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                Boshlanish
              </span>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={INPUT_CLS}
              />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                Tugash
              </span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className={INPUT_CLS}
              />
            </div>
          </div>
        </div>

        {/* Oylik maosh */}
        <div>
          <label className={LABEL_CLS}>Oylik maosh</label>
          <MoneyInput
            min={0}
            value={fixedSalary}
            onChange={(val) => setFixedSalary(val)}
            placeholder="1 500 000"
            className={INPUT_CLS}
          />
        </div>

        {/* Izoh */}
        <div>
          <label className={LABEL_CLS}>Izoh</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Qo'shimcha eslatmalar"
            className={`${INPUT_CLS} min-h-[60px] resize-y`}
            rows={2}
          />
        </div>

        {error && <p className="text-rose-500 text-xs font-semibold">{error}</p>}

        {/* Saqlash button */}
        <PrimaryButton onClick={submit} disabled={busy} className="w-full mt-2">
          {busy ? (
            <Icon name="spinner" size={16} className="animate-spin" />
          ) : editing ? (
            <Icon name="check" size={16} />
          ) : (
            <Icon name="plus" size={16} />
          )}{" "}
          {editing ? "Saqlash" : "Support o'qituvchini saqlash"}
        </PrimaryButton>
      </div>
    </Modal>
  );
}

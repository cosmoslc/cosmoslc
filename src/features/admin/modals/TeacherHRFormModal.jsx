import { useState, useRef } from "react";
import { Icon } from "../components/Icon";
import { INPUT_CLS, LABEL_CLS, PrimaryButton } from "../theme/tokens";
import { Modal, MoneyInput, NumberInput, PhoneInput, ToggleSwitch } from "../components/primitives";
import { hashPassword } from "../utils/helpers";
import { Camera, Trash2, User, Upload } from "lucide-react";

export function TeacherHRFormModal({ editing, branches = [], defaultBranchId, onSubmit, onClose }) {
  const [branchId, setBranchId] = useState(
    editing?.branchId || (defaultBranchId && defaultBranchId !== "all" ? defaultBranchId : "") || branches[0]?.id || "",
  );
  const effectiveBranchId = branchId || editing?.branchId || branches[0]?.id || "";
  const [name, setName] = useState(editing?.name || "");
  const [phone, setPhone] = useState(editing?.phone || "");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState(editing?.gender || "male");
  const [birthDate, setBirthDate] = useState(editing?.birthDate || "");
  const [salaryType, setSalaryType] = useState(
    editing?.salaryType || "percent",
  );
  const [sharePercent, setSharePercent] = useState(
    editing?.revenueSharePercent ?? 40,
  );
  const [perStudentSalary, setPerStudentSalary] = useState(
    editing?.perStudentSalary ?? 100000,
  );
  const [fixedSalary, setFixedSalary] = useState(editing?.fixedSalary ?? "");
  const [photo, setPhoto] = useState(editing?.photo || "");
  const [note, setNote] = useState(editing?.note || "");
  const [canCreateGroups, setCanCreateGroups] = useState(
    editing?.canCreateGroups !== false,
  );
  const [canReceivePayments, setCanReceivePayments] = useState(
    editing?.canReceivePayments !== false,
  );
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const fileInputRef = useRef(null);

  function handlePhotoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("Rasm hajmi 2MB dan oshmasligi kerak.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setPhoto(event.target.result);
      setError("");
    };
    reader.readAsDataURL(file);
  }

  async function submit() {
    if (!name.trim()) {
      setError("Ism va familiyani kiriting.");
      return;
    }
    if (branches.length > 0 && !effectiveBranchId) {
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
      name: name.trim(),
      phone,
      gender,
      birthDate,
      salaryType,
      revenueSharePercent: salaryType === "percent" ? (parseFloat(sharePercent) || 0) : 0,
      perStudentSalary: salaryType === "per_student" ? (parseFloat(perStudentSalary) || 0) : 0,
      fixedSalary: salaryType === "fixed" ? (parseFloat(fixedSalary) || 0) : 0,
      photo: photo || null,
      note: note.trim(),
      rating: editing?.rating || 0,
      canCreateGroups,
      canReceivePayments,
      isAssistant: false,
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
      title={editing ? "O'qituvchini tahrirlash" : "Yangi o'qituvchi qo'shish"}
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

        {/* Ism va familiya */}
        <div>
          <label className={LABEL_CLS}>Ism va familiya</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Sardor Rustamov"
            className={INPUT_CLS}
            autoFocus
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

        {/* Jinsi & Tug'ilgan sana */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={LABEL_CLS}>Jinsi</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setGender("male")}
                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  gender === "male"
                    ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400"
                    : "bg-white dark:bg-[#0F172A] border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                }`}
              >
                Erkak
              </button>
              <button
                type="button"
                onClick={() => setGender("female")}
                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  gender === "female"
                    ? "bg-pink-50 dark:bg-pink-950/60 border-pink-300 dark:border-pink-800 text-pink-600 dark:text-pink-400"
                    : "bg-white dark:bg-[#0F172A] border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                }`}
              >
                Ayol
              </button>
            </div>
          </div>

          <div>
            <label className={LABEL_CLS}>Tug'ilgan sana</label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className={INPUT_CLS}
            />
          </div>
        </div>

        {/* Maosh turi & Summasi (Bitta rowda) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={LABEL_CLS}>Maosh turi</label>
            <select
              value={salaryType}
              onChange={(e) => setSalaryType(e.target.value)}
              className={INPUT_CLS}
            >
              <option value="percent">Foizli</option>
              <option value="per_student">Har bir o'quvchi uchun</option>
              <option value="fixed">Fixed</option>
            </select>
          </div>

          {salaryType === "percent" && (
            <div>
              <label className={LABEL_CLS}>Ulush foizi</label>
              <NumberInput
                min={0}
                max={100}
                value={sharePercent}
                onChange={setSharePercent}
                className={INPUT_CLS}
                placeholder="40"
              />
            </div>
          )}

          {salaryType === "per_student" && (
            <div>
              <label className={LABEL_CLS}>O'quvchi uchun to'lov</label>
              <MoneyInput
                value={perStudentSalary}
                onChange={(val) => setPerStudentSalary(val)}
                placeholder="100 000"
                className={INPUT_CLS}
              />
            </div>
          )}

          {salaryType === "fixed" && (
            <div>
              <label className={LABEL_CLS}>Oylik maosh</label>
              <MoneyInput
                value={fixedSalary}
                onChange={(val) => setFixedSalary(val)}
                placeholder="3 000 000"
                className={INPUT_CLS}
              />
            </div>
          )}
        </div>

        {/* O'qituvchi rasmi (Izohdan oldin) */}
        <div>
          <label className={LABEL_CLS}>O'qituvchi rasmi</label>
          <div className="flex items-center gap-3">
            <div className="relative group shrink-0">
              {photo ? (
                <img
                  src={photo}
                  alt="Ustoz rasmi"
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500">
                  <User size={20} />
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 p-1 rounded-lg bg-indigo-600 text-white cursor-pointer"
              >
                <Camera size={11} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Upload size={13} /> Rasm yuklash
              </button>
              {photo && (
                <button
                  type="button"
                  onClick={() => setPhoto("")}
                  className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 size={13} /> O'chirish
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Izoh */}
        <div>
          <label className={LABEL_CLS}>Izoh</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Qo'shimcha ma'lumotlar"
            className={`${INPUT_CLS} min-h-[60px] resize-y`}
            rows={2}
          />
        </div>

        {/* Ruxsatlar */}
        <div className="pt-2 space-y-2 border-t border-slate-100 dark:border-slate-800">
          <ToggleSwitch
            checked={canCreateGroups}
            onChange={setCanCreateGroups}
            label="Guruh ochishga ruxsat"
          />
          <ToggleSwitch
            checked={canReceivePayments}
            onChange={setCanReceivePayments}
            label="To'lov qabul qilishga ruxsat"
          />
        </div>

        {error && <p className="text-rose-500 text-xs font-semibold">{error}</p>}

        <PrimaryButton onClick={submit} disabled={busy} className="w-full mt-2">
          {busy ? (
            <Icon name="spinner" size={16} className="animate-spin" />
          ) : editing ? (
            <Icon name="check" size={16} />
          ) : (
            <Icon name="plus" size={16} />
          )}{" "}
          {editing ? "Saqlash" : "O'qituvchini qo'shish"}
        </PrimaryButton>
      </div>
    </Modal>
  );
}

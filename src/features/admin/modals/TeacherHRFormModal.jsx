import { useState, useRef } from "react";
import { Icon } from "../components/Icon";
import { INPUT_CLS, LABEL_CLS, PrimaryButton } from "../theme/tokens";
import { Modal, MoneyInput, PhoneInput, ToggleSwitch } from "../components/primitives";
import { hashPassword } from "../utils/helpers";
import { Camera, Trash2, User, Upload } from "lucide-react";

export function TeacherHRFormModal({ editing, branches = [], onSubmit, onClose }) {
  const [branchId, setBranchId] = useState(
    editing?.branchId || branches[0]?.id || "",
  );
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
    if (!branchId && branches.length > 0) {
      setError("Filialni tanlang.");
      return;
    }
    if (!phone.trim()) {
      setError("Telefon raqamini kiriting — bu bilan ustoz tizimga kiradi.");
      return;
    }
    if (!editing && (!password || password.length < 4)) {
      setError(
        "Yangi o'qituvchi uchun parol (kamida 4 belgi) kiritilishi shart.",
      );
      return;
    }
    setBusy(true);
    const payload = {
      ...(editing?.id ? { id: editing.id } : {}),
      branchId,
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
      <div className="space-y-4 max-h-[80vh] overflow-y-auto px-0.5">
        {/* Photo Upload & Avatar Preview */}
        <div className="flex items-center gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="relative group shrink-0">
            {photo ? (
              <img
                src={photo}
                alt="Ustoz rasmi"
                className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-500/30 shadow-xs"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <User size={28} />
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-transform active:scale-95 cursor-pointer"
              title="Rasm yuklash"
            >
              <Camera size={13} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              O'qituvchi rasmi
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              JPG, PNG yoki WebP formatda (maks. 2MB)
            </p>
            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Upload size={12} /> Rasm tanlash
              </button>
              {photo && (
                <button
                  type="button"
                  onClick={() => setPhoto("")}
                  className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 text-[11px] font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 size={12} /> O'chirish
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filial */}
        {branches.length > 0 && (
          <div>
            <label className={LABEL_CLS}>Filial *</label>
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

        {/* Ism familiya */}
        <div>
          <label className={LABEL_CLS}>Ism familiya *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Masalan: Sardor Rustamov"
            className={INPUT_CLS}
            autoFocus
          />
        </div>

        {/* Telefon raqam & Parol (Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={LABEL_CLS}>Telefon raqam *</label>
            <PhoneInput value={phone} onChange={setPhone} />
          </div>
          <div>
            <label className={LABEL_CLS}>
              {editing
                ? "Yangi parol (ixtiyoriy)"
                : "Parol (tizimga kirish) *"}
            </label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={editing ? "O'zgartirmaslik uchun bo'sh qoldiring" : "Kamida 4 belgi"}
              className={INPUT_CLS}
            />
          </div>
        </div>

        {/* Jinsi & Tug'ilgan sana (Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={LABEL_CLS}>Jinsi</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setGender("male")}
                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  gender === "male"
                    ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                    : "bg-white dark:bg-[#0F172A] border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                }`}
              >
                Erkak
              </button>
              <button
                type="button"
                onClick={() => setGender("female")}
                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  gender === "female"
                    ? "bg-pink-50 dark:bg-pink-950/60 border-pink-300 dark:border-pink-800 text-pink-600 dark:text-pink-400 shadow-2xs"
                    : "bg-white dark:bg-[#0F172A] border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
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

        {/* Maosh turi (Turlari: foizli, har bir o'quvchi uchun, fixed) */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className={LABEL_CLS}>Maosh / Ish haqi turi *</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setSalaryType("percent")}
              className={`py-2 px-2 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                salaryType === "percent"
                  ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                  : "bg-white dark:bg-[#0F172A] border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
              }`}
            >
              Foizli (%)
            </button>
            <button
              type="button"
              onClick={() => setSalaryType("per_student")}
              className={`py-2 px-2 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                salaryType === "per_student"
                  ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 shadow-2xs"
                  : "bg-white dark:bg-[#0F172A] border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
              }`}
            >
              Har bir o'quvchi
            </button>
            <button
              type="button"
              onClick={() => setSalaryType("fixed")}
              className={`py-2 px-2 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                salaryType === "fixed"
                  ? "bg-blue-50 dark:bg-blue-950/60 border-blue-400 dark:border-blue-700 text-blue-600 dark:text-blue-400 shadow-2xs"
                  : "bg-white dark:bg-[#0F172A] border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
              }`}
            >
              Fixed (Belgilangan)
            </button>
          </div>

          {salaryType === "percent" && (
            <div className="pt-1">
              <label className={LABEL_CLS}>Guruh tushumidan ulush foizi (%)</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={sharePercent}
                  onChange={(e) => setSharePercent(e.target.value)}
                  className={`${INPUT_CLS} pr-8`}
                  placeholder="Masalan: 40"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                  %
                </span>
              </div>
              <p className="text-slate-400 text-[11px] mt-1">
                Ustoz maoshi guruh tushumining shu foizi asosida avtomatik hisoblanadi.
              </p>
            </div>
          )}

          {salaryType === "per_student" && (
            <div className="pt-1">
              <label className={LABEL_CLS}>Har bir o'quvchi uchun summa (so'm)</label>
              <MoneyInput
                value={perStudentSalary}
                onChange={(val) => setPerStudentSalary(val)}
                placeholder="100 000"
                className={INPUT_CLS}
              />
              <p className="text-slate-400 text-[11px] mt-1">
                Ustoz maoshi guruhdagi har bitta faol o'quvchi uchun hisoblanadi.
              </p>
            </div>
          )}

          {salaryType === "fixed" && (
            <div className="pt-1">
              <label className={LABEL_CLS}>Belgilangan oylik maosh (so'm)</label>
              <MoneyInput
                value={fixedSalary}
                onChange={(val) => setFixedSalary(val)}
                placeholder="3 000 000"
                className={INPUT_CLS}
              />
              <p className="text-slate-400 text-[11px] mt-1">
                Oylik qat'iy belgilangan summa to'lanadi.
              </p>
            </div>
          )}
        </div>

        {/* Izoh */}
        <div>
          <label className={LABEL_CLS}>Izoh / Qo'shimcha ma'lumot</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="O'qituvchi haqida qo'shimcha ma'lumot, mutaxassisligi yoki eslatmalar..."
            className={`${INPUT_CLS} min-h-[70px] resize-y`}
            rows={2}
          />
        </div>

        {/* Ruxsatlar */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2">
          <ToggleSwitch
            checked={canCreateGroups}
            onChange={setCanCreateGroups}
            label="Guruh ochishga ruxsat"
            sub="Ustoz profilida yangi guruh ochish imkoniyati"
          />
          <ToggleSwitch
            checked={canReceivePayments}
            onChange={setCanReceivePayments}
            label="To'lov qabul qilishga ruxsat"
            sub="O'quvchilardan to'lov olish huquqi"
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

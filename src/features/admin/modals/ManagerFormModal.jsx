import { useState } from "react";
import {
  Check,
  Plus,
  Loader2,
  Eye,
  EyeOff,
  DollarSign,
  Gift,
  Award,
  Building2,
  Calendar,
  MapPin,
  Phone,
  User,
  Lock,
} from "lucide-react";
import { Modal, PhoneInput, BranchPicker } from "../components/primitives";
import { INPUT_CLS, LABEL_CLS, PrimaryButton } from "../theme/tokens";
import { hashPassword } from "../utils/helpers";

export function ManagerFormModal({ editing, branches, onSubmit, onClose }) {
  const [name, setName] = useState(editing?.name || "");
  const [phone, setPhone] = useState(editing?.phone || "");
  const [birthDate, setBirthDate] = useState(editing?.birthDate || "");
  const [address, setAddress] = useState(editing?.address || "");

  // Salary type: 'fixed' or 'kpi'
  const [salaryType, setSalaryType] = useState(editing?.salaryType || "fixed");
  const [monthlySalary, setMonthlySalary] = useState(
    editing?.monthlySalary !== undefined ? editing.monthlySalary : "5000000",
  );
  const [kpiStudentAmount, setKpiStudentAmount] = useState(
    editing?.kpiStudentAmount !== undefined ? editing.kpiStudentAmount : "50000",
  );
  const [kpiContractBonus, setKpiContractBonus] = useState(
    editing?.kpiContractBonus !== undefined ? editing.kpiContractBonus : "100000",
  );

  const [branchIds, setBranchIds] = useState(editing?.branchIds || []);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!name.trim()) {
      setError("Menejer ism-familiyasini kiriting.");
      return;
    }
    if (!phone.trim()) {
      setError("Telefon raqamini kiriting.");
      return;
    }
    if (branchIds.length === 0) {
      setError("Kamida bitta ishlaydigan filialni tanlang.");
      return;
    }
    if (!editing && (!password || password.length < 4)) {
      setError("Yangi menejer uchun tizimga kirish paroli (kamida 4 ta belgi) majburiy.");
      return;
    }

    setBusy(true);
    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      birthDate,
      address: address.trim(),
      salaryType,
      monthlySalary: salaryType === "fixed" ? parseFloat(monthlySalary) || 0 : 0,
      kpiStudentAmount: salaryType === "kpi" ? parseFloat(kpiStudentAmount) || 0 : 0,
      kpiContractBonus: salaryType === "kpi" ? parseFloat(kpiContractBonus) || 0 : 0,
      branchIds,
    };

    if (password) {
      payload.passwordHash = await hashPassword(password);
      payload.rawPassword = password; // kept for display to director
    }

    setBusy(false);
    onSubmit(payload);
    onClose();
  }

  return (
    <Modal
      title={editing ? "Menejerni tahrirlash" : "Yangi menejer qo'shish"}
      onClose={onClose}
      wide
    >
      <div className="space-y-4 text-slate-800">
        {/* Shaxsiy ma'lumotlar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className={LABEL_CLS}>
              <User size={13} className="inline mr-1 text-indigo-600" />
              Ism va Familiya *
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masalan: Jasur Rahimov"
              className={INPUT_CLS}
              autoFocus
            />
          </div>
          <div>
            <label className={LABEL_CLS}>
              <Phone size={13} className="inline mr-1 text-indigo-600" />
              Telefon raqami *
            </label>
            <PhoneInput value={phone} onChange={setPhone} />
          </div>
        </div>

        {/* Tug'ilgan sana va Yashash joyi */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className={LABEL_CLS}>
              <Calendar size={13} className="inline mr-1 text-slate-500" />
              Tug'ilgan sana
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className={INPUT_CLS}
            />
          </div>
          <div>
            <label className={LABEL_CLS}>
              <MapPin size={13} className="inline mr-1 text-slate-500" />
              Yashash joyi (Manzil)
            </label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Toshkent sh., Chilonzor tumani..."
              className={INPUT_CLS}
            />
          </div>
        </div>

        {/* Ishlaydigan filiallari */}
        <div>
          <label className={LABEL_CLS}>
            <Building2 size={13} className="inline mr-1 text-indigo-600" />
            Ishlaydigan filiali *
          </label>
          <BranchPicker
            branches={branches}
            value={branchIds}
            onChange={setBranchIds}
          />
        </div>

        {/* Oylik maosh turi tanlovi */}
        <div className="pt-2 border-t border-slate-100">
          <label className="text-xs font-bold text-slate-900 block mb-2">
            Oylik maosh turi va to'lov modeli *
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {/* Fixed Option */}
            <div
              onClick={() => setSalaryType("fixed")}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                salaryType === "fixed"
                  ? "bg-indigo-50/80 border-indigo-400 ring-2 ring-indigo-200"
                  : "bg-slate-50/70 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    salaryType === "fixed"
                      ? "border-indigo-600 bg-indigo-600"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  {salaryType === "fixed" && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </div>
                <span className="font-bold text-xs text-slate-900">
                  Belgilangan oylik (Fixed)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 pl-6">
                Har oy bir xil qat'iy summa to'lanadi
              </p>
            </div>

            {/* KPI + BONUS Option */}
            <div
              onClick={() => setSalaryType("kpi")}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                salaryType === "kpi"
                  ? "bg-indigo-50/80 border-indigo-400 ring-2 ring-indigo-200"
                  : "bg-slate-50/70 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    salaryType === "kpi"
                      ? "border-indigo-600 bg-indigo-600"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  {salaryType === "kpi" && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </div>
                <span className="font-bold text-xs text-slate-900">
                  KPI + BONUS
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 pl-6">
                Olib kelgan o'quvchi va 1 hafta o'qigan shartnomaga qarab
              </p>
            </div>
          </div>

          {/* Dynamic Inputs based on Salary Type */}
          {salaryType === "fixed" ? (
            <div className="mt-3 bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <label className={LABEL_CLS}>
                <DollarSign size={13} className="inline mr-1 text-emerald-600" />
                Belgilangan oylik maosh summasi (so'mda) *
              </label>
              <input
                type="number"
                value={monthlySalary}
                onChange={(e) => setMonthlySalary(e.target.value)}
                placeholder="Masalan: 5000000"
                className={INPUT_CLS}
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Menejerga har oy hisoblanadigan kafolatlangan qat'iy maosh summasi.
              </p>
            </div>
          ) : (
            <div className="mt-3 bg-indigo-50/40 border border-indigo-100 rounded-xl p-3.5 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={LABEL_CLS}>
                    <Award size={13} className="inline mr-1 text-indigo-600" />
                    Har bir o'quvchi uchun summa (so'm) *
                  </label>
                  <input
                    type="number"
                    value={kpiStudentAmount}
                    onChange={(e) => setKpiStudentAmount(e.target.value)}
                    placeholder="Masalan: 50000"
                    className={INPUT_CLS}
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Menejer tizimga kiritgan/olib kelgan har bir o'quvchi uchun
                  </p>
                </div>
                <div>
                  <label className={LABEL_CLS}>
                    <Gift size={13} className="inline mr-1 text-amber-600" />
                    1 hafta o'qigan shartnoma bonusi (so'm) *
                  </label>
                  <input
                    type="number"
                    value={kpiContractBonus}
                    onChange={(e) => setKpiContractBonus(e.target.value)}
                    placeholder="Masalan: 100000"
                    className={INPUT_CLS}
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    O'quvchi guruhga qo'shilib 1 hafta o'qib shartnoma tuzsa
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tizimga kirish paroli */}
        <div className="pt-2 border-t border-slate-100">
          <label className={LABEL_CLS}>
            <Lock size={13} className="inline mr-1 text-slate-600" />
            {editing
              ? "Tizimga kirish paroli (bo'sh qoldirilsa eski parol saqlanadi)"
              : "Tizimga kirish paroli *"}
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Kamida 4 ta belgi (masalan: 123456)"
              className={`${INPUT_CLS} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Menejer ushbu telefon raqam va parol bilan alohida "Menejer" tizimiga kiradi.
          </p>
        </div>

        {error && (
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <div className="pt-2">
          <PrimaryButton onClick={submit} disabled={busy} className="w-full">
            {busy ? (
              <Loader2 size={16} className="animate-spin" />
            ) : editing ? (
              <Check size={16} />
            ) : (
              <Plus size={16} />
            )}{" "}
            {editing ? "Saqlash" : "Menejerni qo'shish"}
          </PrimaryButton>
        </div>
      </div>
    </Modal>
  );
}


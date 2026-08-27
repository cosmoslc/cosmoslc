import { useState, useMemo } from "react";
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
  Briefcase,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileText,
  FileSpreadsheet,
} from "lucide-react";
import { Modal, PhoneInput, BranchPicker } from "../components/primitives";
import { INPUT_CLS, LABEL_CLS, PrimaryButton } from "../theme/tokens";
import { hashPassword, formatMoneyInput, parseMoneyInput } from "../utils/helpers";
import { INITIAL_ROLES } from "../pages/PositionsPage";
import {
  getStaffCustomFields,
  getStaffFormCompletionStatus,
} from "../utils/staffFormFields";

export function ManagerFormModal({ editing, branches = [], onSubmit, onClose }) {
  // Load roles/positions
  const availableRoles = useMemo(() => {
    try {
      const saved = localStorage.getItem("cosmos_custom_roles_v2");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_ROLES;
  }, []);

  // Form Fields
  const [name, setName] = useState(editing?.name || "");
  const [phone, setPhone] = useState(editing?.phone || "");
  const [password, setPassword] = useState(editing?.rawPassword || "");
  const [showPassword, setShowPassword] = useState(false);
  const [gender, setGender] = useState(editing?.gender || "male"); // 'male' | 'female'
  const [birthDate, setBirthDate] = useState(editing?.birthDate || "");
  const [address, setAddress] = useState(editing?.address || "");

  // Role / Position (Multi-selection support)
  const initialRoleIds = useMemo(() => {
    if (Array.isArray(editing?.roleIds) && editing.roleIds.length > 0) {
      return editing.roleIds;
    }
    if (editing?.roleId) return [editing.roleId];
    if (editing?.role) return [editing.role];
    return [availableRoles[1]?.id || availableRoles[0]?.id || "role-admin"];
  }, [editing, availableRoles]);

  const [selectedRoleIds, setSelectedRoleIds] = useState(initialRoleIds);

  const toggleRole = (roleId) => {
    setSelectedRoleIds((prev) => {
      if (prev.includes(roleId)) {
        if (prev.length === 1) return prev; // Kamida 1 ta lavozim tanlangan bo'lishi kerak
        return prev.filter((id) => id !== roleId);
      }
      return [...prev, roleId];
    });
  };

  const selectedRoles = useMemo(() => {
    return availableRoles.filter((r) => selectedRoleIds.includes(r.id));
  }, [availableRoles, selectedRoleIds]);

  const combinedPermissions = useMemo(() => {
    const allPerms = selectedRoles.flatMap((r) => r.permissions || []);
    return Array.from(new Set(allPerms));
  }, [selectedRoles]);

  // Salary & Salary Type
  // types: 'fixed' (oylik oklad), 'hourly' (soatbay), 'lesson' (darsbay), 'percent' (foiz), 'kpi' (kpi/bonus)
  const [salaryType, setSalaryType] = useState(editing?.salaryType || "fixed");
  const [salaryAmount, setSalaryAmount] = useState(
    editing?.monthlySalary !== undefined
      ? formatMoneyInput(editing.monthlySalary)
      : editing?.salaryAmount !== undefined
      ? formatMoneyInput(editing.salaryAmount)
      : "5 000 000"
  );
  const [kpiStudentAmount, setKpiStudentAmount] = useState(
    editing?.kpiStudentAmount !== undefined ? formatMoneyInput(editing.kpiStudentAmount) : "50 000"
  );
  const [kpiContractBonus, setKpiContractBonus] = useState(
    editing?.kpiContractBonus !== undefined ? formatMoneyInput(editing.kpiContractBonus) : "100 000"
  );

  // Branches
  const [branchIds, setBranchIds] = useState(
    editing?.branchIds || (editing?.branchId ? [editing.branchId] : [])
  );

  // Note / Comment
  const [notes, setNotes] = useState(editing?.notes || "");

  // Custom Form Fields & Values
  const customFields = useMemo(() => getStaffCustomFields(), []);
  const [customFormData, setCustomFormData] = useState(
    editing?.customFormData || {}
  );
  const [showCustomForm, setShowCustomForm] = useState(
    Boolean(editing?.customFormData && Object.keys(editing.customFormData).length > 0)
  );

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleCustomFieldChange = (fieldId, value) => {
    setCustomFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  async function submit() {
    if (!name.trim()) {
      setError("Xodim ism-familiyasini kiriting.");
      return;
    }
    if (!phone.trim()) {
      setError("Telefon raqamini kiriting.");
      return;
    }
    if (selectedRoleIds.length === 0) {
      setError("Kamida bitta lavozim (rol) tanlang.");
      return;
    }
    if (branchIds.length === 0) {
      setError("Kamida bitta ishlaydigan filialni tanlang.");
      return;
    }
    if (!editing && (!password || password.length < 4)) {
      setError("Yangi xodim uchun tizimga kirish paroli (kamida 4 ta belgi) majburiy.");
      return;
    }

    setBusy(true);

    const parsedSalary = parseMoneyInput(salaryAmount) || 0;
    const parsedKpiStudent = parseMoneyInput(kpiStudentAmount) || 0;
    const parsedKpiBonus = parseMoneyInput(kpiContractBonus) || 0;
    const completion = getStaffFormCompletionStatus(
      { customFormData },
      customFields
    );

    const primaryRole = selectedRoles[0] || availableRoles[0];

    const payload = {
      ...(editing || {}),
      name: name.trim(),
      phone: phone.trim(),
      gender,
      birthDate: birthDate || null,
      address: address.trim(),
      roleIds: selectedRoleIds,
      roleId: selectedRoleIds[0] || null,
      roleNames: selectedRoles.map((r) => r.name),
      roleName: selectedRoles.map((r) => r.name).join(" • ") || primaryRole?.name || "Xodim",
      roleCodes: selectedRoles.map((r) => r.code),
      roleCode: primaryRole?.code || "rol",
      roleColor: primaryRole?.color || "#6366f1",
      roleColors: selectedRoles.map((r) => r.color),
      permissions: combinedPermissions,
      allowedPages: combinedPermissions.length > 0 ? combinedPermissions : editing?.allowedPages || [
        "home",
        "payments",
        "teachers",
        "courses",
        "groups",
        "finance",
        "holidays",
      ],
      salaryType,
      monthlySalary: parsedSalary,
      salaryAmount: parsedSalary,
      kpiStudentAmount: salaryType === "kpi" ? parsedKpiStudent : 0,
      kpiContractBonus: salaryType === "kpi" ? parsedKpiBonus : 0,
      branchIds,
      branchId: branchIds[0] || null,
      notes: notes.trim(),
      customFormData,
      balance: editing?.balance,
      isFormCompleted: completion.isCompleted,
      formFillPercent: completion.percent,
    };

    if (password) {
      payload.passwordHash = await hashPassword(password);
      payload.rawPassword = password;
    }

    setBusy(false);
    onSubmit(payload);
    onClose();
  }

  return (
    <Modal
      title={editing ? "Xodim ma'lumotlarini tahrirlash" : "Yangi xodim qo'shish"}
      onClose={onClose}
      wide
    >
      <div className="space-y-4 text-slate-800 dark:text-slate-200">
        {/* Asosiy shaxsiy ma'lumotlar - Flattened 2 ustunli to'r */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={LABEL_CLS}>
              <User size={13} className="inline mr-1 text-indigo-600" />
              Ism va Familiya *
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masalan: Jamshid Alimov"
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

        {/* Parol va Jinsi */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={LABEL_CLS}>
              <Lock size={13} className="inline mr-1 text-indigo-600" />
              Tizimga kirish paroli {!editing && "*"}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={editing ? "O'zgartirmaslik uchun bo'sh qoldiring" : "Kamida 4 ta belgi..."}
                className={`${INPUT_CLS} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div>
            <label className={LABEL_CLS}>Jinsi</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setGender("male")}
                className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                  gender === "male"
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                }`}
              >
                <span>👨</span> Erkak
              </button>
              <button
                type="button"
                onClick={() => setGender("female")}
                className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                  gender === "female"
                    ? "bg-pink-600 text-white border-pink-600 shadow-xs"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                }`}
              >
                <span>👩</span> Ayol
              </button>
            </div>
          </div>
        </div>

        {/* Tug'ilgan sana va Manzil */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              placeholder="Shahar, tuman, ko'cha..."
              className={INPUT_CLS}
            />
          </div>
        </div>

        {/* Lavozim tanlash (Ko'p tanlov / Multi-selection) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className={LABEL_CLS}>
              <Briefcase size={13} className="inline mr-1 text-indigo-600" />
              Lavozimi / Roli * <span className="text-[11px] font-normal text-slate-500">(bir nechta tanlash mumkin)</span>
            </label>
            <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold">
              {selectedRoleIds.length} ta tanlandi
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {availableRoles.map((role) => {
              const isSelected = selectedRoleIds.includes(role.id);
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => toggleRole(role.id)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                    isSelected
                      ? "bg-indigo-50/90 dark:bg-indigo-950/60 border-indigo-500 text-indigo-950 dark:text-indigo-100 shadow-2xs"
                      : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: role.color || "#6366f1" }}
                    />
                    <div className="min-w-0">
                      <p className="font-bold truncate text-slate-900 dark:text-white">
                        {role.name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-normal">
                        {role.code || "rol"} • {role.permissions?.length || 0} ta ruxsat
                      </p>
                    </div>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 transition-all ${
                      isSelected
                        ? "bg-indigo-600 text-white shadow-2xs"
                        : "border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900"
                    }`}
                  >
                    {isSelected && <Check size={11} strokeWidth={3} />}
                  </div>
                </button>
              );
            })}
          </div>

          {selectedRoles.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex flex-wrap gap-1 items-center">
                <span className="text-[11px]">Biriktirilgan:</span>
                {selectedRoles.map((r) => (
                  <span
                    key={r.id}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white inline-flex items-center gap-1"
                    style={{ backgroundColor: r.color || "#6366f1" }}
                  >
                    <Briefcase size={9} />
                    {r.name}
                  </span>
                ))}
              </div>
              <span className="text-[11px] font-medium shrink-0">
                Jami ruxsatlar:{" "}
                <strong className="text-slate-800 dark:text-slate-200">
                  {combinedPermissions.length} ta modul
                </strong>
              </span>
            </div>
          )}
        </div>

        {/* Ish haqi va Maosh turi (Fixed yoki KPI+Bonus) */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className={LABEL_CLS}>
            <DollarSign size={13} className="inline mr-1 text-emerald-600" />
            Ish haqi va Maosh hisoblash modeli
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1.5">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 mb-1 block">
                Maosh hisoblash turi *
              </label>
              <select
                value={salaryType}
                onChange={(e) => {
                  const nextType = e.target.value;
                  setSalaryType(nextType);
                  if (nextType === "kpi") {
                    if (!editing || editing.salaryType !== "kpi" || salaryAmount === "5000000") {
                      setSalaryAmount("0");
                    }
                  } else if (nextType === "fixed") {
                    if (salaryAmount === "0" || !salaryAmount) {
                      setSalaryAmount("5000000");
                    }
                  }
                }}
                className={INPUT_CLS}
              >
                <option value="fixed">Oylik belgilangan oklad (Fixed)</option>
                <option value="kpi">KPI + Bonus (O'quvchi soni + 1 oy o'qiganligi uchun)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 mb-1 block">
                {salaryType === "fixed"
                  ? "Oylik belgilangan oklad (so'm) *"
                  : "Asosiy oklad / baza (so'm, 0 dan boshlash mumkin)"}
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={salaryAmount}
                onChange={(e) => setSalaryAmount(formatMoneyInput(e.target.value))}
                placeholder={salaryType === "fixed" ? "5 000 000" : "0"}
                className={INPUT_CLS}
              />
              {salaryType === "kpi" && (
                <p className="text-[10px] text-indigo-600 dark:text-indigo-400 mt-1">
                  💡 0 so'm qo'yilsa, xodimning maoshi o'quvchilar qo'shilishi bilan 0 dan boshlab o'sib boradi.
                </p>
              )}
            </div>
          </div>

          {salaryType === "kpi" && (
            <div className="mt-3 p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 dark:text-indigo-300">
                <Sparkles size={14} className="text-indigo-600" />
                KPI va Bonus stavkalari
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-400 mb-1 block">
                    Har bir olib kelingan / biriktirilgan o'quvchi uchun (so'm) *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={kpiStudentAmount}
                    onChange={(e) => setKpiStudentAmount(formatMoneyInput(e.target.value))}
                    placeholder="50 000"
                    className={INPUT_CLS}
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Xodim jalb qilgan har 1 ta o'quvchi uchun to'lanadigan summa
                  </p>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 mb-1 block">
                    1 oy o'qiganligi uchun bonus (so'm) *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={kpiContractBonus}
                    onChange={(e) => setKpiContractBonus(formatMoneyInput(e.target.value))}
                    placeholder="100 000"
                    className={INPUT_CLS}
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    O'quvchi markazda 1 oy to'liq o'qiganda xodimga qo'shimcha bonus
                  </p>
                </div>
              </div>

              <div className="text-[11px] text-indigo-700 dark:text-indigo-300 bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
                💡 <strong>Hisoblash tartibi:</strong> Jami maosh = Asosiy oklad + (O'quvchilar soni × Har bir o'quvchi summasi) + (1 oy o'qigan o'quvchilar soni × 1 oylik bonus)
              </div>
            </div>
          )}
        </div>

        {/* Kirishga ruxsat etilgan filiallar (Multiple choice) */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className={LABEL_CLS}>
            <Building2 size={13} className="inline mr-1 text-indigo-600" />
            Kirishga ruxsat etilgan filiallar (Bir nechta tanlash mumkin) *
          </label>
          <BranchPicker
            branches={branches}
            value={branchIds}
            onChange={setBranchIds}
          />
        </div>

        {/* Izoh */}
        <div>
          <label className={LABEL_CLS}>
            <FileText size={13} className="inline mr-1 text-slate-500" />
            Qo'shimcha izoh / eslatma
          </label>
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Xodim bo'yicha qisqa ma'lumot yoki eslatma..."
            className={INPUT_CLS}
          />
        </div>

        {/* Xodim Formasi (Qo'shimcha ma'lumotlar uchun forma) */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowCustomForm(!showCustomForm)}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1.5 cursor-pointer py-1"
            >
              <Sparkles size={14} />
              <span>Xodim formasi (Qo'shimcha ma'lumotlar)</span>
              {showCustomForm ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            <span className="text-[11px] text-slate-400">
              {Object.values(customFormData).filter(Boolean).length} /{" "}
              {customFields.length} to'ldirilgan
            </span>
          </div>

          {showCustomForm && (
            <div className="mt-3 pt-3 border-t border-dashed border-slate-200 dark:border-slate-800">
              {customFields.length === 0 ? (
                <p className="text-xs text-slate-400 italic">
                  Qo'shimcha forma maydonlari sozlanmagan.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {customFields.map((field) => (
                    <div key={field.id}>
                      <label className={LABEL_CLS}>
                        {field.label} {field.required && "*"}
                      </label>
                      {field.type === "select" ? (
                        <select
                          value={customFormData[field.id] || ""}
                          onChange={(e) =>
                            handleCustomFieldChange(field.id, e.target.value)
                          }
                          className={INPUT_CLS}
                        >
                          <option value="">Tanlang...</option>
                          {(field.options || []).map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type || "text"}
                          value={customFormData[field.id] || ""}
                          onChange={(e) =>
                            handleCustomFieldChange(field.id, e.target.value)
                          }
                          placeholder={field.placeholder || field.label}
                          className={INPUT_CLS}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-xs font-semibold p-2.5 rounded-xl border border-rose-200 dark:border-rose-900">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Bekor qilish
          </button>
          <PrimaryButton onClick={submit} disabled={busy}>
            {busy ? (
              <span className="flex items-center gap-1.5">
                <Loader2 size={14} className="animate-spin" /> Saqlanmoqda...
              </span>
            ) : editing ? (
              "O'zgarishlarni saqlash"
            ) : (
              "Xodimni qo'shish"
            )}
          </PrimaryButton>
        </div>
      </div>
    </Modal>
  );
}

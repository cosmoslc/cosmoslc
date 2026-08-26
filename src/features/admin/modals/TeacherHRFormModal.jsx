import { useState } from "react";
import { Icon } from "../components/Icon";
import { INPUT_CLS, LABEL_CLS, PrimaryButton } from "../theme/tokens";
import { Modal, MoneyInput, PhoneInput, ToggleSwitch } from "../components/primitives";
import { hashPassword } from "../utils/helpers";

export function TeacherHRFormModal({ editing, branches, onSubmit, onClose }) {
  const [branchId, setBranchId] = useState(
    editing?.branchId || branches[0]?.id || "",
  );
  const [name, setName] = useState(editing?.name || "");
  const [phone, setPhone] = useState(editing?.phone || "");
  const [password, setPassword] = useState("");
  const [salaryType, setSalaryType] = useState(
    editing?.salaryType || "percent",
  );
  const [sharePercent, setSharePercent] = useState(
    editing?.revenueSharePercent ?? 40,
  );
  const [fixedSalary, setFixedSalary] = useState(editing?.fixedSalary ?? "");
  const [canCreateGroups, setCanCreateGroups] = useState(
    editing?.canCreateGroups !== false,
  );
  const [canReceivePayments, setCanReceivePayments] = useState(
    editing?.canReceivePayments !== false,
  );
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!name.trim() || !branchId) {
      setError("Ism va filialni kiriting.");
      return;
    }
    if (!phone.trim()) {
      setError("Telefon raqamini kiriting — bu bilan Ustoz Panelga kiradi.");
      return;
    }
    if (!editing && (!password || password.length < 4)) {
      setError(
        "Yangi o'qituvchi uchun parol (kamida 4 belgi) kerak — u shu bilan Ustoz Panelga kiradi.",
      );
      return;
    }
    setBusy(true);
    const payload = {
      branchId,
      name: name.trim(),
      phone,
      salaryType,
      revenueSharePercent: parseFloat(sharePercent) || 0,
      fixedSalary: parseFloat(fixedSalary) || 0,
      rating: editing?.rating || 0,
      note: "",
      canCreateGroups,
      canReceivePayments,
    };
    if (password) payload.passwordHash = await hashPassword(password);
    setBusy(false);
    onSubmit(payload);
    onClose();
  }

  return (
    <Modal
      title={editing ? "O'qituvchini tahrirlash" : "O'qituvchi qo'shish"}
      onClose={onClose}
    >
      <div className="space-y-4">
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
        <div>
          <label className={LABEL_CLS}>Ism familiya</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={INPUT_CLS}
            autoFocus
          />
        </div>
        <div>
          <label className={LABEL_CLS}>Telefon raqam</label>
          <PhoneInput value={phone} onChange={setPhone} />
        </div>
        <div>
          <label className={LABEL_CLS}>
            {editing
              ? "Yangi parol (bo'sh qoldirsa o'zgarmaydi)"
              : "Parol (Ustoz Panelga kirish uchun)"}
          </label>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Kamida 4 belgi"
            className={INPUT_CLS}
          />
          <p className="text-slate-400 text-[11px] mt-1">
            Shu telefon raqam va parol bilan o'qituvchi Ustoz Panelga
            (teacher.html) kiradi.
          </p>
        </div>
        <div>
          <label className={LABEL_CLS}>Kelishuv turi</label>
          <select
            value={salaryType}
            onChange={(e) => setSalaryType(e.target.value)}
            className={INPUT_CLS}
          >
            <option value="percent">Foizli</option>
            <option value="fixed">Belgilangan oylik</option>
          </select>
        </div>
        {salaryType === "percent" ? (
          <div>
            <label className={LABEL_CLS}>Guruhdagi ulush foizi (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={sharePercent}
              onChange={(e) => setSharePercent(e.target.value)}
              className={INPUT_CLS}
            />
            <p className="text-slate-400 text-[11px] mt-1">
              Ustoz maoshi guruh tushumining shu foizi asosida hisoblanadi.
            </p>
          </div>
        ) : (
          <div>
            <label className={LABEL_CLS}>Oylik maosh (so'm)</label>
            <MoneyInput
              value={fixedSalary}
              onChange={(val) => setFixedSalary(val)}
              placeholder="3 000 000"
              className={INPUT_CLS}
            />
            <p className="text-slate-400 text-[11px] mt-1">
              Har oy to'lovlar hajmidan qat'i nazar belgilangan summa.
            </p>
          </div>
        )}
        <div className="border-t border-slate-200 pt-4 space-y-3">
          <ToggleSwitch
            checked={canCreateGroups}
            onChange={setCanCreateGroups}
            label="Guruh ochishga ruxsat"
            sub="O'chirilsa, ustoz ilovasida 'Yangi guruh' tugmasi yashiriladi"
          />
          <ToggleSwitch
            checked={canReceivePayments}
            onChange={setCanReceivePayments}
            label="To'lov qabul qilishga ruxsat"
            sub="O'quvchilardan to'lov olish huquqi"
          />
        </div>
        {error && <p className="text-red-500 text-xs">{error}</p>}
        <PrimaryButton onClick={submit} disabled={busy} className="w-full">
          {busy ? (
            <Icon name="spinner" size={16} className="animate-spin" />
          ) : editing ? (
            <Icon name="check" size={16} />
          ) : (
            <Icon name="plus" size={16} />
          )}{" "}
          {editing ? "Saqlash" : "Qo'shish"}
        </PrimaryButton>
      </div>
    </Modal>
  );
}

import { useState, useEffect } from "react";
import {
  DollarSign,
  Calendar,
  Banknote,
  CheckCircle2,
  Receipt,
  User,
  Briefcase,
  Wallet,
  Sparkles,
} from "lucide-react";
import { Modal, Avatar } from "../components/primitives";
import { INPUT_CLS, PrimaryButton } from "../theme/tokens";
import { getManagerPerformanceStats } from "../utils/dataHelpers";
import { money, formatDate, todayISO, formatMoneyInput, parseMoneyInput } from "../utils/helpers";

export function ManagerPayrollModal({
  manager,
  directorData,
  opData,
  onSubmit,
  onAddPayment,
  onClose,
}) {
  const saveHandler = onSubmit || onAddPayment;
  const [date, setDate] = useState(todayISO());
  const [method, setMethod] = useState("naqd"); // 'naqd', 'card', 'bank'
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [isNoteManual, setIsNoteManual] = useState(false);
  const [error, setError] = useState("");

  const stats = getManagerPerformanceStats(manager, opData, directorData);

  const expectedSalary =
    manager.salaryType === "kpi"
      ? stats?.expectedPay || manager.salaryAmount || 0
      : manager.monthlySalary || manager.salaryAmount || 0;

  const managerBalance =
    manager.balance !== undefined
      ? Number(manager.balance)
      : stats?.remaining ?? 0;

  const allHistory = (directorData?.managerPayments || [])
    .filter((p) => String(p.managerId) === String(manager?.id))
    .sort(
      (a, b) =>
        new Date(b.date || b.createdAt || 0) -
        new Date(a.date || a.createdAt || 0)
    );

  const numAmount = parseMoneyInput(amount);
  const isExactSalary = expectedSalary > 0 && numAmount === expectedSalary;
  const isAdvance = expectedSalary > 0 && numAmount > 0 && numAmount < expectedSalary;
  const isOverSalary = expectedSalary > 0 && numAmount > expectedSalary;

  // Handle amount change with thousand separator and smart automatic notes
  function handleAmountChange(val) {
    const formatted = formatMoneyInput(val);
    setAmount(formatted);

    const parsed = parseMoneyInput(formatted);

    // If user hasn't manually edited the note, set smart notes
    if (!isNoteManual) {
      if (expectedSalary > 0 && parsed === expectedSalary) {
        setNote("Oylik maosh");
      } else if (expectedSalary > 0 && parsed > 0 && parsed < expectedSalary) {
        setNote("Avans");
      } else if (expectedSalary > 0 && parsed > expectedSalary) {
        setNote("Oylik maosh va qo'shimcha to'lov");
      } else if (!parsed) {
        setNote("");
      }
    }
  }

  // Set default amount when clicking quick buttons
  function fillExactSalary() {
    if (expectedSalary > 0) {
      setAmount(formatMoneyInput(expectedSalary));
      if (!isNoteManual) setNote("Oylik maosh");
    }
  }

  function fillBalance() {
    if (managerBalance > 0) {
      setAmount(formatMoneyInput(managerBalance));
      if (!isNoteManual) setNote(managerBalance === expectedSalary ? "Oylik maosh" : "Qoldiq maosh to'lovi");
    } else if (expectedSalary > 0) {
      fillExactSalary();
    }
  }

  function submitPayment() {
    const amt = parseMoneyInput(amount);
    if (!amt || amt <= 0) {
      setError("To'g'ri to'lov summasini kiriting.");
      return;
    }

    if (saveHandler) {
      saveHandler({
        managerId: manager.id,
        type: "salary",
        method,
        amount: amt,
        date: date || todayISO(),
        note: note.trim() || (isExactSalary ? "Oylik maosh" : `Maosh to'lovi (${manager?.name || ""})`),
      });
    }

    setAmount("");
    setNote("");
    setError("");
    onClose();
  }

  return (
    <Modal title="Maosh to'lash" onClose={onClose} wide>
      <div className="space-y-3.5 text-slate-800 dark:text-slate-200">
        {/* 1. Xodim (Auto-selected Name & Info) */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Avatar name={manager?.name || "Xodim"} size={40} />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Xodim:
                </span>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {manager?.name}
                </p>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Briefcase size={12} className="text-indigo-500" />
                <span>{manager?.roleName || "Xodim"}</span>
                <span>•</span>
                <span>{manager?.phone || "Telefon yo'q"}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="text-right px-3 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">
                Belgilangan Ish haqi
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                {money(expectedSalary)} so'm
              </span>
            </div>

            <div className="text-right px-3 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">
                Joriy Balans
              </span>
              <span
                className={`text-xs sm:text-sm font-extrabold ${
                  managerBalance >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {money(managerBalance)} so'm
              </span>
            </div>
          </div>
        </div>

        {/* Form Inputs */}
        <div className="space-y-3">
          {/* Row 1: Narx (Summa) & Sana */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                  <DollarSign size={13} className="text-emerald-600" />
                  To'lov summasi *
                </label>
                <div className="flex items-center gap-2">
                  {expectedSalary > 0 && (
                    <button
                      type="button"
                      onClick={fillExactSalary}
                      className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                    >
                      Oylik: {money(expectedSalary)}
                    </button>
                  )}
                  {managerBalance > 0 && managerBalance !== expectedSalary && (
                    <button
                      type="button"
                      onClick={fillBalance}
                      className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      Balans: {money(managerBalance)}
                    </button>
                  )}
                </div>
              </div>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="0"
                  className={`${INPUT_CLS} pr-14 text-sm font-semibold tracking-wide ${
                    isExactSalary
                      ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/20"
                      : ""
                  }`}
                  autoFocus
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none">
                  so'm
                </span>
              </div>

              {/* Status helper / Smart feedback */}
              {isExactSalary && (
                <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                  <CheckCircle2 size={12} className="text-emerald-600" />
                  Belgilangan oylik maosh qiymatiga to'liq teng (Oylik maosh)
                </p>
              )}
              {isAdvance && (
                <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                  <span>ℹ️</span> Qisman to'lov / Avans
                </p>
              )}
              {isOverSalary && (
                <p className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 mt-1 flex items-center gap-1">
                  <span>ℹ️</span> Oylikdan ortiqcha to'lov (qoldiq avansga hisoblanadi)
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-900 dark:text-white block mb-1">
                <Calendar size={13} className="inline mr-1 text-sky-600" />
                To'lov sanasi *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={INPUT_CLS}
              />
            </div>
          </div>

          {/* Row 2: Maosh berish turi (Dropdown: Naqd, Plastik, Bank o'tkazma) */}
          <div>
            <label className="text-xs font-bold text-slate-900 dark:text-white block mb-1">
              <Banknote size={13} className="inline mr-1 text-emerald-600" />
              To'lov usuli *
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className={INPUT_CLS}
            >
              <option value="naqd">💵 Naqd pul</option>
              <option value="card">💳 Plastik karta</option>
              <option value="bank">🏦 Bank o'tkazmasi</option>
            </select>
          </div>

          {/* Row 3: Izoh */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-900 dark:text-white block">
                Izoh (ixtiyoriy)
              </label>
              {isExactSalary && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  ✓ Oylik maosh
                </span>
              )}
            </div>
            <input
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                setIsNoteManual(true);
              }}
              placeholder="Masalan: Oylik maosh"
              className={`${INPUT_CLS} ${
                isExactSalary
                  ? "bg-emerald-50/30 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200 font-medium"
                  : ""
              }`}
            />
          </div>
        </div>

        {error && (
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}

        <div className="pt-1">
          <PrimaryButton onClick={submitPayment} className="w-full py-2.5">
            <CheckCircle2 size={15} /> To'lovni tasdiqlash
          </PrimaryButton>
        </div>

        {/* Previous payment history */}
        {allHistory.length > 0 && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Avvalgi to'lovlar tarixi ({allHistory.length} ta)
            </p>
            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
              {allHistory.map((p, idx) => (
                <div
                  key={p.id || idx}
                  className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/70 rounded-xl p-2.5 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-[11px]">
                      💵
                    </span>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-xs">
                        {money(p.amount)} so'm
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        {p.date || formatDate(p.createdAt)} • {p.method === "card" ? "Plastik" : p.method === "bank" ? "Bank o'tkazma" : "Naqd"}
                      </p>
                    </div>
                  </div>
                  {p.note && (
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 max-w-[180px] truncate text-right">
                      {p.note}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

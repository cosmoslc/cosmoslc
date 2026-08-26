import { useState } from "react";
import {
  DollarSign,
  Plus,
  Calendar,
  CreditCard,
  Banknote,
  Building,
  CheckCircle2,
  Receipt,
  Gift,
  Award,
} from "lucide-react";
import { Modal } from "../components/primitives";
import { GLASS_SOFT, INPUT_CLS, PrimaryButton } from "../theme/tokens";
import { getManagerPerformanceStats } from "../utils/dataHelpers";
import { money, formatDate, todayISO, thisMonthKey } from "../utils/helpers";

export function ManagerPayrollModal({
  manager,
  directorData,
  opData,
  onAddPayment,
  onClose,
}) {
  const [month, setMonth] = useState(thisMonthKey());
  const [paymentType, setPaymentType] = useState("salary"); // 'salary', 'advance', 'bonus'
  const [method, setMethod] = useState("naqd"); // 'naqd', 'card', 'bank'
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const stats = getManagerPerformanceStats(
    manager,
    opData,
    directorData,
    month,
  );

  const allHistory = (directorData?.managerPayments || [])
    .filter((p) => p.managerId === manager.id)
    .sort(
      (a, b) =>
        new Date(b.date || b.createdAt || 0) -
        new Date(a.date || a.createdAt || 0),
    );

  // Set default amount when clicking quick remaining
  function fillRemaining() {
    if (stats?.remaining > 0) {
      setAmount(stats.remaining.toString());
    }
  }

  function submitPayment() {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      setError("To'g'ri to'lov summasini kiriting.");
      return;
    }

    onAddPayment({
      managerId: manager.id,
      type: paymentType,
      method,
      amount: amt,
      month,
      date: todayISO(),
      note:
        note.trim() ||
        `${
          paymentType === "salary"
            ? "Oylik maosh"
            : paymentType === "advance"
              ? "Avans to'lovi"
              : "KPI Bonus"
        } (${manager.name})`,
    });

    setAmount("");
    setNote("");
    setError("");
    onClose();
  }

  return (
    <Modal title={`${manager.name} — Maosh berish`} onClose={onClose} wide>
      <div className="space-y-4 text-slate-800">
        {/* Month and Salary Model Info */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-2.5 py-1 rounded-xl font-bold ${
                manager.salaryType === "kpi"
                  ? "bg-indigo-100 text-indigo-800"
                  : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {manager.salaryType === "kpi"
                ? "KPI + BONUS modeli"
                : "Belgilangan (Fixed) oylik"}
            </span>
            {manager.salaryType === "kpi" && (
              <span className="text-[11px] text-slate-500">
                (O'quvchi: {money(manager.kpiStudentAmount || 0)} so'm + Bonus:{" "}
                {money(manager.kpiContractBonus || 0)} so'm)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Hisob oyi:</span>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className={`${INPUT_CLS} w-auto py-1 text-xs`}
            />
          </div>
        </div>

        {/* Calculated Stats Cards */}
        <div
          className={`${GLASS_SOFT} rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs`}
        >
          <div className="bg-white/80 rounded-xl p-3 border border-slate-200/80">
            <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
              Hisoblangan jami haqi
            </p>
            <p className="text-base font-extrabold text-slate-900 mt-1">
              {money(stats?.expectedPay || 0)}{" "}
              <span className="text-xs font-semibold text-slate-500">so'm</span>
            </p>
          </div>

          <div className="bg-white/80 rounded-xl p-3 border border-slate-200/80">
            <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
              Shu oy to'langan
            </p>
            <p className="text-base font-extrabold text-sky-700 mt-1">
              {money(stats?.totalPaid || 0)}{" "}
              <span className="text-xs font-semibold text-slate-500">so'm</span>
            </p>
          </div>

          <div className="bg-white/80 rounded-xl p-3 border border-slate-200/80">
            <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
              Qolgan qoldiq
            </p>
            <p
              className={`text-base font-extrabold mt-1 ${
                stats?.remaining > 0 ? "text-rose-600" : "text-emerald-600"
              }`}
            >
              {money(stats?.remaining || 0)}{" "}
              <span className="text-xs font-semibold text-slate-500">so'm</span>
            </p>
          </div>

          <div className="bg-white/80 rounded-xl p-3 border border-slate-200/80 flex flex-col justify-between">
            <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
              O'quvchilar ko'rsatkichi
            </p>
            <p className="text-xs font-bold text-slate-800 mt-1">
              {stats?.totalBrought || 0} ta o'quvchi • {stats?.oneWeekStudentsCount || 0} ta 1 hafta o'qigan
            </p>
          </div>
        </div>

        {/* Payment Type Tabs */}
        <div>
          <label className="text-xs font-bold text-slate-900 block mb-1.5">
            To'lov turi *
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "salary", label: "Oylik maosh", icon: DollarSign },
              { id: "advance", label: "Avans to'lovi", icon: Receipt },
              { id: "bonus", label: "KPI / Bonus", icon: Gift },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setPaymentType(t.id)}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    paymentType === t.id
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <Icon size={14} />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Payment Amount and Quick fill */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-900">
                To'lov summasi (so'mda) *
              </label>
              {stats?.remaining > 0 && (
                <button
                  type="button"
                  onClick={fillRemaining}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                >
                  Qoldiqni kiritish ({money(stats.remaining)} so'm)
                </button>
              )}
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Masalan: 2500000"
              className={INPUT_CLS}
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-900 block mb-1">
              To'lov usuli *
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: "naqd", label: "Naqd", icon: Banknote },
                { id: "card", label: "Karta", icon: CreditCard },
                { id: "bank", label: "O'tkazma", icon: Building },
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id)}
                    className={`py-2.5 px-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      method === m.id
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <Icon size={13} />
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Note input */}
        <div>
          <label className="text-xs font-bold text-slate-900 block mb-1">
            Izoh / Izohli xabar (ixtiyoriy)
          </label>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Masalan: 2026-yil avgust oyi uchun to'liq maosh to'landi"
            className={INPUT_CLS}
          />
        </div>

        {error && (
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <PrimaryButton onClick={submitPayment} className="w-full">
          <CheckCircle2 size={16} /> To'lovni tasdiqlash va rasmiylashtirish
        </PrimaryButton>

        {/* Payment history list */}
        {allHistory.length > 0 && (
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Avvalgi to'lovlar tarixi ({allHistory.length} ta)
            </p>
            <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
              {allHistory.map((p, idx) => (
                <div
                  key={p.id || idx}
                  className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        p.type === "advance"
                          ? "bg-amber-100 text-amber-800"
                          : p.type === "bonus"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {p.type === "advance"
                        ? "Avans"
                        : p.type === "bonus"
                          ? "Bonus"
                          : "Maosh"}
                    </span>
                    <div>
                      <p className="font-bold text-slate-900">
                        {money(p.amount)} so'm
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {p.month} oyi • {p.date || formatDate(p.createdAt)}
                      </p>
                    </div>
                  </div>
                  {p.note && (
                    <span className="text-[11px] text-slate-500 max-w-[180px] truncate text-right">
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

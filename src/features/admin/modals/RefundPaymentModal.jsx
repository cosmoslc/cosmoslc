import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  RotateCcw,
  AlertCircle,
  X,
  ArrowRight,
  User,
  Users,
} from "lucide-react";
import { INPUT_CLS, LABEL_CLS, SecondaryButton } from "../theme/tokens";
import { money } from "../utils/helpers";
import { MoneyInput } from "../components/primitives";
import * as api from "../../../shared/api";

export function RefundPaymentModal({
  student,
  studentId,
  groups = [],
  currentBalance: propBalance,
  onSubmit,
  onClose,
  onRefresh,
}) {
  const currentStudent = student || {};
  const currentStudentId = studentId || currentStudent.id;

  // Haqiqiy joriy balansni olish
  const currentBalance =
    typeof propBalance === "number"
      ? propBalance
      : Number(currentStudent.balance || 0);

  const studentGroups = useMemo(() => {
    if (!groups || groups.length === 0) return [];
    const sGids = (currentStudent?.groupIds || []).map(String);
    return groups.filter((g) => sGids.includes(String(g.id)));
  }, [groups, currentStudent?.groupIds]);

  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [amount, setAmount] = useState(
    currentBalance > 0 ? String(currentBalance) : ""
  );
  const [method, setMethod] = useState("cash");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedGroup = useMemo(() => {
    if (!selectedGroupId) return null;
    return studentGroups.find((g) => String(g.id) === String(selectedGroupId)) || null;
  }, [selectedGroupId, studentGroups]);

  const numAmount = Number(amount) || 0;
  const balanceAfterRefund = currentBalance - numAmount;

  // Guruh o'zgarganda izoh va summani moslashtirish
  const handleGroupChange = (gid) => {
    setSelectedGroupId(gid);
    const grp = studentGroups.find((g) => String(g.id) === String(gid));
    if (grp) {
      const membership =
        currentStudent?.groupMemberships?.[grp.id] ||
        currentStudent?.groupMemberships?.[String(grp.id)];
      const grpPrice = membership?.agreedPrice
        ? Number(membership.agreedPrice)
        : Number(grp.price || 0);
      if (grpPrice > 0 && (!amount || Number(amount) === currentBalance)) {
        setAmount(String(grpPrice));
      }
    }
  };

  // Izohni oldingi va keyingi balans hamda guruh bilan shakllantirish
  useEffect(() => {
    const grpName = selectedGroup ? selectedGroup.name : "Umumiy balans";
    if (!reason || reason.startsWith("Refund:")) {
      if (numAmount > 0) {
        setReason(
          `Refund (${grpName}): oldingi balans ${money(currentBalance)} so'm, keyingi balans ${money(balanceAfterRefund)} so'm`
        );
      } else {
        setReason(`Refund (${grpName}): oldingi balans ${money(currentBalance)} so'm`);
      }
    }
  }, [numAmount, currentBalance, balanceAfterRefund, selectedGroup]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!numAmount || numAmount <= 0) {
      setError("To'g'ri qaytarish summasini kiriting");
      return;
    }

    setLoading(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const grpName = selectedGroup ? selectedGroup.name : "Balansdan qaytarish";
      const noteText =
        reason.trim() ||
        `Refund (${grpName}): ${money(numAmount)} so'm qaytarildi`;

      const refundPayload = {
        studentId: currentStudentId,
        studentName: currentStudent.name || "O'quvchi",
        groupId: selectedGroup ? selectedGroup.id : null,
        groupName: grpName,
        amount: -Math.abs(numAmount),
        paidAmount: -Math.abs(numAmount),
        isRefund: true,
        type: "refund",
        method: method,
        note: noteText,
        date: today,
        createdAt: new Date().toISOString(),
      };

      // 1. Yangi refund to'lov operatsiyasini yozish
      if (onSubmit) {
        await onSubmit(refundPayload);
      } else {
        await api.recordPayment(refundPayload);
      }

      // 2. O'quvchi balansini kamaytirish
      const newBal = balanceAfterRefund;
      await api.updateStudent(currentStudentId, { balance: newBal });

      if (onRefresh) {
        await onRefresh();
      }

      onClose();
    } catch (err) {
      console.error("Refund error:", err);
      setError("To'lovni qaytarishda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
              <RotateCcw size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                To'lovni qaytarish (Refund)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {currentStudent.name || "O'quvchi"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Talaba (Auto selected) */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <User size={15} className="text-slate-400" />
              <span className="font-semibold text-slate-900 dark:text-white">
                {currentStudent.name || "O'quvchi"}
              </span>
            </div>
            <div className="font-mono text-slate-500 dark:text-slate-400 font-medium">
              Joriy balans:{" "}
              <span
                className={`font-bold ${
                  currentBalance >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {money(currentBalance)} so'm
              </span>
            </div>
          </div>

          {/* 2. Guruh selector */}
          <div>
            <label className={LABEL_CLS}>Guruhni tanlang</label>
            <select
              value={selectedGroupId}
              onChange={(e) => handleGroupChange(e.target.value)}
              className={INPUT_CLS}
            >
              <option value="">Umumiy balansdan qaytarish</option>
              {studentGroups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} — {money(g.price || 0)} so'm
                </option>
              ))}
            </select>
          </div>

          {/* 3. Narxi / Qaytarish summasi */}
          <div>
            <label className={LABEL_CLS}>Qaytarish summasi</label>
            <div className="relative">
              <MoneyInput
                min={0}
                value={amount}
                onChange={(val) => setAmount(val)}
                placeholder="0"
                className={INPUT_CLS}
                required
                autoFocus
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 pointer-events-none">
                so'm
              </span>
            </div>
          </div>

          {/* 4. To'lov turi dropdown */}
          <div>
            <label className={LABEL_CLS}>To'lov turi</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className={INPUT_CLS}
            >
              <option value="cash">Naqd pul</option>
              <option value="card">Plastik karta</option>
              <option value="payme">Payme</option>
              <option value="click">Click</option>
              <option value="bank">Bank o'tkazmasi</option>
            </select>
          </div>

          {/* 5. Izoh */}
          <div>
            <label className={LABEL_CLS}>Izoh</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Qaytarish sababi va izohi"
              className={INPUT_CLS}
            />
          </div>

          {/* Footer buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <SecondaryButton type="button" onClick={onClose} disabled={loading}>
              Bekor qilish
            </SecondaryButton>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RotateCcw size={14} />
              <span>{loading ? "Qaytarilmoqda..." : "Refund qilish"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

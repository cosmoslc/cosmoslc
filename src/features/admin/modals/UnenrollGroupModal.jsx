import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  LogOut,
  AlertCircle,
  X,
  BookOpen,
  Calendar,
  DollarSign,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import { INPUT_CLS, LABEL_CLS, SecondaryButton } from "../theme/tokens";
import { money, thisMonthKey } from "../utils/helpers";
import { calculateRefundAmount, getMonthLessonDates } from "../../../shared/utils/prorata";
import * as api from "../../../shared/api";

export function UnenrollGroupModal({
  isOpen,
  onClose,
  student,
  group,
  directorData,
  opData,
  onSuccess,
}) {
  if (!isOpen || !student || !group) return null;

  const month = thisMonthKey();
  const membership = student?.groupMemberships?.[group.id] || student?.groupMemberships?.[String(group.id)];
  const fullPrice = membership?.agreedPrice ? Number(membership.agreedPrice) : Number(group.price || 0);

  // O'quvchining ushbu guruh bo'yicha to'lovlari
  const groupPayments = (directorData?.payments || opData?.payments || []).filter(
    (p) =>
      String(p.studentId) === String(student.id) &&
      String(p.groupId) === String(group.id) &&
      (p.month === month || p.date?.startsWith(month)) &&
      !p.isRefund
  );
  const totalPaidAmount = groupPayments.reduce(
    (sum, p) => sum + (Number(p.paidAmount) || Number(p.amount) || 0) + (Number(p.usedBalance) || 0),
    0
  );

  const groupAttendances = (opData?.attendance || directorData?.attendance || []).filter(
    (a) => String(a.groupId) === String(group.id)
  );

  const billingMode = group?.billingMode || directorData?.centerSettings?.billingMode || "invoice";
  const excusedAbsenceRefund =
    group?.excusedAbsenceRefund !== undefined && group?.excusedAbsenceRefund !== null
      ? Boolean(group.excusedAbsenceRefund)
      : directorData?.centerSettings?.excusedAbsenceRefund !== undefined
      ? Boolean(directorData.centerSettings.excusedAbsenceRefund)
      : true;

  const refundCalc = useMemo(() => {
    return calculateRefundAmount({
      billingMode,
      excusedAbsenceRefund,
      currentBalance: student.balance,
      fullPrice,
      groupDays: group.days || [],
      monthStr: month,
      attendances: groupAttendances,
      totalPaidAmount,
      student,
    });
  }, [billingMode, excusedAbsenceRefund, student, fullPrice, group.days, month, groupAttendances, totalPaidAmount]);

  const {
    otilganDarslar,
    totalLessons,
    pricePerLesson,
    foydalanilganSumma,
    refundAmount,
    debtAmount,
    netDifference,
    attendedLessons,
    excusedLessons,
    absentLessons,
  } = refundCalc;

  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [customRefundAmount, setCustomRefundAmount] = useState(
    refundAmount > 0 ? String(refundAmount) : ""
  );
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Avtomatik izoh shakllantirish
  useEffect(() => {
    let text = `Guruhni tark etish (${group.name}): ${otilganDarslar} ta dars o'tildi. O'tilgan darslar summasi: ${money(foydalanilganSumma)} so'm, To'langan: ${money(totalPaidAmount)} so'm`;
    if (refundAmount > 0) {
      text += `, Refund: ${money(refundAmount)} so'm`;
    } else if (debtAmount > 0) {
      text += `, Qarzdorlik: ${money(debtAmount)} so'm`;
    } else {
      text += `, Hisob-kitob nol`;
    }
    setReason(text);
  }, [group.name, otilganDarslar, foydalanilganSumma, totalPaidAmount, refundAmount, debtAmount]);

  const handleConfirmUnenroll = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const today = new Date().toISOString().slice(0, 10);
      const targetGid = String(group.id);
      const remainingGroupIds = (student.groupIds || []).map(String).filter((id) => id !== targetGid);
      const currentMemberships = { ...(student?.groupMemberships || {}) };
      delete currentMemberships[targetGid];

      const finalRefundAmt = customRefundAmount ? Number(customRefundAmount) : refundAmount;

      // 1. To'lovlar tarixiga unenroll / refund yozuvini kiritish
      const paymentPayload = {
        studentId: student.id,
        studentName: student.name || "O'quvchi",
        groupId: group.id,
        groupName: group.name || "Guruh",
        amount: finalRefundAmt > 0 ? -Math.abs(finalRefundAmt) : 0,
        paidAmount: finalRefundAmt > 0 ? -Math.abs(finalRefundAmt) : 0,
        isRefund: finalRefundAmt > 0,
        type: finalRefundAmt > 0 ? "refund" : "unenroll",
        method: paymentMethod,
        note: reason.trim() || `Guruhni tark etish: ${otilganDarslar} ta dars o'tildi`,
        date: today,
        month,
        createdAt: new Date().toISOString(),
      };

      await api.recordPayment(paymentPayload);

      // 2. O'quvchi profilini yangilash
      const updatedStudentData = {
        groupIds: remainingGroupIds,
        groupMemberships: currentMemberships,
        status: remainingGroupIds.length === 0 ? "unenrolled" : student.status,
      };

      if (billingMode === "per_lesson" && finalRefundAmt > 0) {
        updatedStudentData.balance = 0;
      }

      await api.updateStudent(student.id, updatedStudentData);

      if (onSuccess) {
        await onSuccess({
          paymentPayload,
          updatedStudentData,
          refundAmount: finalRefundAmt,
          otilganDarslar,
        });
      }

      onClose();
    } catch (err) {
      console.error("Unenroll error:", err);
      setError("Guruhdan chiqarishda xatolik yuz berdi");
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
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950/60 text-orange-600 flex items-center justify-center">
              <LogOut size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Guruhni tark etish (Chiqish)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {student.name} • {group.name}
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
        <form onSubmit={handleConfirmUnenroll} className="p-5 space-y-4">
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* O'tilgan darslar va hisob-kitob paneli */}
          <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/50 p-3.5 space-y-3">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200/60 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Rejalashtirilgan jami darslar:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{totalLessons} ta dars</span>
            </div>

            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200/60 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 font-medium">1 ta dars narxi:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{money(pricePerLesson)} so'm</span>
            </div>

            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200/60 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 font-medium">O'tilgan darslar soni:</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {otilganDarslar} ta dars {attendedLessons > 0 && `(Qatnashgan: ${attendedLessons})`}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200/60 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 font-medium">O'tilgan darslar uchun to'lov summasi:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{money(foydalanilganSumma)} so'm</span>
            </div>

            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200/60 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Shu oyda to'langan jami summa:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{money(totalPaidAmount)} so'm</span>
            </div>

            {/* Natija */}
            <div className="pt-1">
              {refundAmount > 0 ? (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-semibold">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span>Ortiqcha to'lov (Refund summasi):</span>
                  </div>
                  <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300 font-mono">
                    {money(refundAmount)} so'm
                  </span>
                </div>
              ) : debtAmount > 0 ? (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-semibold">
                    <AlertCircle size={16} className="text-rose-600" />
                    <span>To'lanishi kerak bo'lgan summa (Qarz):</span>
                  </div>
                  <span className="text-sm font-bold text-rose-700 dark:text-rose-300 font-mono">
                    {money(debtAmount)} so'm
                  </span>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold text-center">
                  Hisob-kitob teng: ortiqcha to'lov yoki qarzdorlik mavjud emas
                </div>
              )}
            </div>
          </div>

          {/* Qaytarish usuli (agar refund bo'lsa) */}
          {refundAmount > 0 && (
            <div>
              <label className={LABEL_CLS}>Qaytarish usuli</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className={INPUT_CLS}
              >
                <option value="cash">Naqd pul</option>
                <option value="card">Plastik karta</option>
                <option value="payme">Payme</option>
                <option value="click">Click</option>
                <option value="bank">Bank o'tkazmasi</option>
              </select>
            </div>
          )}

          {/* Izoh */}
          <div>
            <label className={LABEL_CLS}>To'lovlar tarixiga yoziladigan izoh</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className={INPUT_CLS}
              required
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
              className="px-4 py-2 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <LogOut size={14} />
              <span>{loading ? "Chiqarilmoqda..." : "Chiqish va to'lovlar tarixiga saqlash"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

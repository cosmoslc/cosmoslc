import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Trash2,
  AlertCircle,
  X,
  BookOpen,
  DollarSign,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { INPUT_CLS, LABEL_CLS, SecondaryButton } from "../theme/tokens";
import { money, thisMonthKey } from "../utils/helpers";
import { calculateRefundAmount } from "../../../shared/utils/prorata";
import * as api from "../../../shared/api";

const REASONS = [
  "O'qishni to'xtatdi",
  "Vaqti to'g'ri kelmadi",
  "Moliyaviy sabab",
  "Boshqa manzilga ko'chdi",
  "Boshqa o'quv markazga o'tdi",
  "Shaxsiy sabab",
  "Boshqa",
];

export function UnenrollAllGroupsModal({
  isOpen,
  onClose,
  student,
  assignedGroups = [],
  directorData,
  opData,
  onSuccess,
}) {
  if (!isOpen || !student) return null;

  const month = thisMonthKey();
  const allGroups = assignedGroups || [];

  // Har bir guruh bo'yicha hisob-kitoblarni amalga oshirish
  const groupsCalculations = useMemo(() => {
    return allGroups.map((grp) => {
      const membership =
        student?.groupMemberships?.[grp.id] ||
        student?.groupMemberships?.[String(grp.id)];
      const fullPrice = membership?.agreedPrice
        ? Number(membership.agreedPrice)
        : Number(grp.price || 0);

      const groupPayments = (
        directorData?.payments ||
        opData?.payments ||
        []
      ).filter(
        (p) =>
          String(p.studentId) === String(student.id) &&
          String(p.groupId) === String(grp.id) &&
          (p.month === month || p.date?.startsWith(month)) &&
          !p.isRefund
      );

      const totalPaidAmount = groupPayments.reduce(
        (sum, p) =>
          sum +
          (Number(p.paidAmount) || Number(p.amount) || 0) +
          (Number(p.usedBalance) || 0),
        0
      );

      const groupAttendances = (
        opData?.attendance ||
        directorData?.attendance ||
        []
      ).filter((a) => String(a.groupId) === String(grp.id));

      const billingMode =
        grp?.billingMode ||
        directorData?.centerSettings?.billingMode ||
        "invoice";
      const excusedAbsenceRefund =
        grp?.excusedAbsenceRefund !== undefined &&
        grp?.excusedAbsenceRefund !== null
          ? Boolean(grp.excusedAbsenceRefund)
          : directorData?.centerSettings?.excusedAbsenceRefund !== undefined
          ? Boolean(directorData.centerSettings.excusedAbsenceRefund)
          : true;

      const calc = calculateRefundAmount({
        billingMode,
        excusedAbsenceRefund,
        currentBalance: student.balance,
        fullPrice,
        groupDays: grp.days || [],
        monthStr: month,
        attendances: groupAttendances,
        totalPaidAmount,
        student,
      });

      return {
        group: grp,
        fullPrice,
        totalPaidAmount,
        ...calc,
      };
    });
  }, [allGroups, student, directorData, opData, month]);

  // Jami summalarni yig'ish
  const summary = useMemo(() => {
    let totalLessonsHeld = 0;
    let totalLessonFee = 0;
    let totalPaid = 0;
    let totalRefund = 0;
    let totalDebt = 0;

    groupsCalculations.forEach((item) => {
      totalLessonsHeld += item.otilganDarslar || 0;
      totalLessonFee += item.foydalanilganSumma || 0;
      totalPaid += item.totalPaidAmount || 0;
      totalRefund += item.refundAmount || 0;
      totalDebt += item.debtAmount || 0;
    });

    return {
      totalLessonsHeld,
      totalLessonFee,
      totalPaid,
      totalRefund,
      totalDebt,
      netBalance: totalRefund - totalDebt,
    };
  }, [groupsCalculations]);

  const [selectedReason, setSelectedReason] = useState(REASONS[0]);
  const [customNote, setCustomNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [recordPayments, setRecordPayments] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const today = new Date().toISOString().slice(0, 10);
      const reasonText = customNote.trim()
        ? `${selectedReason} - ${customNote.trim()}`
        : selectedReason;

      const paymentPayloads = [];

      // 1. Agar to'lovlarga yozish belgilangan bo'lsa, har bir guruh uchun yozuv kiritish
      if (recordPayments && groupsCalculations.length > 0) {
        for (const item of groupsCalculations) {
          const finalRefundAmt = item.refundAmount || 0;
          const pPayload = {
            studentId: student.id,
            studentName: student.name || "O'quvchi",
            groupId: item.group.id,
            groupName: item.group.name || "Guruh",
            amount: finalRefundAmt > 0 ? -Math.abs(finalRefundAmt) : 0,
            paidAmount: finalRefundAmt > 0 ? -Math.abs(finalRefundAmt) : 0,
            isRefund: finalRefundAmt > 0,
            type: finalRefundAmt > 0 ? "refund" : "unenroll",
            method: paymentMethod,
            note: `Barcha guruhlardan chiqarish (${reasonText}): ${item.otilganDarslar} ta dars o'tildi. To'langan: ${money(item.totalPaidAmount)} so'm, Darslar summasi: ${money(item.foydalanilganSumma)} so'm`,
            date: today,
            month,
            createdAt: new Date().toISOString(),
          };

          await api.recordPayment(pPayload);
          paymentPayloads.push(pPayload);
        }
      }

      // 2. O'quvchi guruhlarini tozalash va statusini yangilash
      const updatedStudentData = {
        groupIds: [],
        groupMemberships: {},
        status: "archived",
        archiveReason: reasonText,
        archivedAt: new Date().toISOString(),
      };

      await api.updateStudent(student.id, updatedStudentData);

      if (onSuccess) {
        await onSuccess({ paymentPayloads, updatedStudentData });
      }

      onClose();
    } catch (err) {
      console.error("Unenroll all error:", err);
      setError("O'quvchini chiqarishda xatolik yuz berdi");
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
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in zoom-in-95"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
              <Trash2 size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Barcha guruhlardan chiqarish / O'chirish
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {student.name || "O'quvchi"}
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

        <form onSubmit={handleConfirm} className="p-5 space-y-4">
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Chiqarish sababi */}
          <div>
            <label className={LABEL_CLS}>Chiqarish sababi</label>
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className={INPUT_CLS}
            >
              {REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLS}>Qo'shimcha izoh</label>
            <input
              type="text"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="Qo'shimcha tafsilotlar..."
              className={INPUT_CLS}
            />
          </div>

          {/* Guruhlar va darslar hisob-kitobi */}
          {groupsCalculations.length > 0 ? (
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                <span>Guruhlar bo'yicha o'tilgan darslar hisobi</span>
                <span className="text-[11px] text-slate-400 font-normal">
                  {groupsCalculations.length} ta guruh
                </span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-xl overflow-hidden text-xs">
                {groupsCalculations.map((item) => (
                  <div
                    key={item.group.id}
                    className="p-3 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">
                        {item.group.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        O'tilgan darslar:{" "}
                        <strong className="text-slate-700 dark:text-slate-300">
                          {item.otilganDarslar} ta
                        </strong>{" "}
                        · Dars narxi: {money(item.pricePerLesson)} so'm
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {money(item.foydalanilganSumma)} so'm
                      </div>
                      <div className="text-[10px] mt-0.5">
                        {item.refundAmount > 0 ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                            Refund: +{money(item.refundAmount)} so'm
                          </span>
                        ) : item.debtAmount > 0 ? (
                          <span className="text-rose-600 dark:text-rose-400 font-semibold">
                            Qarz: -{money(item.debtAmount)} so'm
                          </span>
                        ) : (
                          <span className="text-slate-400">Hisob-kitob nol</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Jami hisob-kitob xulosasi */}
              <div className="p-3 bg-slate-100/80 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">
                    Jami o'tilgan darslar soni:
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {summary.totalLessonsHeld} ta dars
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">
                    Jami darslar to'lovi:
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {money(summary.totalLessonFee)} so'm
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">
                    Shu oy to'langan jami summa:
                  </span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {money(summary.totalPaid)} so'm
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-slate-900 dark:text-white">
                    Yakuniy natija:
                  </span>
                  <span
                    className={`font-mono font-bold ${
                      summary.totalRefund > 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : summary.totalDebt > 0
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {summary.totalRefund > 0
                      ? `Refund: +${money(summary.totalRefund)} so'm`
                      : summary.totalDebt > 0
                      ? `Qarzdorlik: -${money(summary.totalDebt)} so'm`
                      : "0 so'm (To'liq yopilgan)"}
                  </span>
                </div>
              </div>

              {/* To'lov turi (agar refund bo'lsa) */}
              {summary.totalRefund > 0 && (
                <div>
                  <label className={LABEL_CLS}>Refund to'lov turi</label>
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
            </div>
          ) : (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-500 dark:text-slate-400">
              O'quvchi hozirda hech qaysi guruhga a'zo emas. O'chirish tasdiqlanganda o'quvchi arxivga o'tkaziladi.
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <SecondaryButton type="button" onClick={onClose} disabled={loading}>
              Bekor qilish
            </SecondaryButton>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Trash2 size={14} />
              <span>
                {loading
                  ? "Chiqarilmoqda..."
                  : groupsCalculations.length > 0
                  ? "Chiqarish va to'lovlarga yozish"
                  : "Arxivlash"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

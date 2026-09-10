import { useState, useMemo } from "react";
import { RotateCcw, Calendar, Check, X, CreditCard } from "lucide-react";
import { Modal, MoneyInput } from "../components/primitives";
import { INPUT_CLS, LABEL_CLS, PrimaryButton } from "../theme/tokens";
import { todayISO, thisMonthKey, money } from "../utils/helpers";

export function RefundPaymentModal({
  student,
  studentId,
  group,
  groups = [],
  currentBalance,
  onSubmit,
  onClose,
}) {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayISO());
  const [month, setMonth] = useState(thisMonthKey());
  const [method, setMethod] = useState("Naqd pul");
  const [note, setNote] = useState("");
  const [groupId, setGroupId] = useState(group?.id || "");
  const [loading, setLoading] = useState(false);

  // Derive target student name
  const studentName = student?.name || "Noma'lum o'quvchi";

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    setLoading(true);
    try {
      // Create negative amount for refund
      const payload = {
        amount: -Math.abs(Number(amount)), // negative because it's a refund
        date,
        month,
        method,
        note: note || "To'lovni qaytarish (Refund)",
        studentId: studentId || student?.id,
        groupId: groupId || null,
        type: "refund", // Can use this to identify refunds in backend
      };
      
      await onSubmit(payload);
      onClose();
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  // Selectable groups
  const studentGroups = useMemo(() => {
    if (student?.groupIds?.length > 0) {
      return groups.filter((g) => student.groupIds.includes(String(g.id)));
    }
    return groups;
  }, [student, groups]);

  return (
    <Modal title="To'lovni qaytarish (Refund)" onClose={onClose} position="top">
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Helper info */}
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-100 dark:border-rose-900">
          <div className="flex items-center gap-3 mb-1 text-rose-700 dark:text-rose-300">
            <RotateCcw size={18} />
            <h4 className="font-semibold text-sm">O'quvchiga to'lovni qaytarish</h4>
          </div>
          <p className="text-xs text-rose-600 dark:text-rose-400">
            Bu amal o'quvchi tomonidan qilingan to'lovni (pulni) unga qaytarib berish yoki balansdan pul yechib olish uchun ishlatiladi. Kiritilgan summa manfiy to'lov sifatida yoziladi.
          </p>
        </div>

        <div className="space-y-1">
          <label className={LABEL_CLS}>O'quvchi</label>
          <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-800 dark:text-white">
            {studentName}
          </div>
          {currentBalance !== undefined && (
            <p className="text-xs text-slate-500 dark:text-slate-400 pt-1 pl-1">
              Joriy balansi: <span className="font-semibold text-slate-700 dark:text-slate-300">{money(currentBalance)}</span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className={LABEL_CLS}>Qaytarish summasi</label>
            <MoneyInput
              value={amount}
              onChange={(val) => setAmount(val)}
              placeholder="0"
              required
            />
          </div>

          <div className="space-y-1">
            <label className={LABEL_CLS}>Sana</label>
            <div className="relative">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={INPUT_CLS}
                required
              />
              <Calendar className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className={LABEL_CLS}>Guruh (ixtiyoriy)</label>
            <select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className={INPUT_CLS}
            >
              <option value="">Umumiy to'lov (guruhsiz)</option>
              {studentGroups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-1">
            <label className={LABEL_CLS}>To'lov usuli</label>
            <div className="relative">
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className={INPUT_CLS}
              >
                <option value="Naqd pul">Naqd pul orqali qaytarildi</option>
                <option value="Plastik karta">Plastik kartaga o'tkazildi</option>
                <option value="Click">Click / Payme</option>
              </select>
              <CreditCard className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>
        </div>
        
        <div className="space-y-1">
          <label className={LABEL_CLS}>Qaytarish sababi (Izoh)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className={INPUT_CLS}
            placeholder="Masalan: Kursni to'xtatgani uchun"
            required
          />
        </div>

        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Bekor qilish
          </button>
          <PrimaryButton
            type="submit"
            disabled={loading || !amount || Number(amount) <= 0}
            className="!bg-rose-600 hover:!bg-rose-700 !shadow-rose-600/20"
          >
            <RotateCcw size={16} className="mr-2" />
            {loading ? "Bajarilmoqda..." : "Qaytarish"}
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}

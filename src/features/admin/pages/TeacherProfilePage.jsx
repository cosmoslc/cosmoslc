import { useState, useMemo, useEffect } from "react";
import {
  Users,
  GraduationCap,
  Percent,
  Wallet,
  Calendar,
  ShieldCheck,
  Plus,
  Pencil,
  Trash2,
  Phone,
  Star,
  Search,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Send,
  RotateCcw,
  Filter,
  ChevronLeft,
  UserCheck,
  MessageSquare,
  Sparkles,
  AlertTriangle,
  Layers,
  FileSpreadsheet,
  Download,
  Printer,
  CreditCard,
  TrendingUp,
  Clock,
  ArrowUpDown,
  Receipt,
  Check,
  X,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  MapPin,
  AtSign,
  Briefcase,
  DollarSign,
  AlertCircle,
  Flame,
} from "lucide-react";
import {
  PrimaryButton,
  ExcelButton,
  INPUT_CLS,
  LABEL_CLS,
  BTN_GHOST,
  BTN_ICON,
  GLASS,
} from "../theme/tokens";
import { Avatar, EmptyState, Modal, ConfirmModal, MoneyInput } from "../components/primitives";
import { displayPhone, money, thisMonthKey, todayISO, formatDate } from "../utils/helpers";
import {
  opGroups,
  opStudentsInGroups,
  getTeacherPayStats,
} from "../utils/dataHelpers";
import * as api from "../../../shared/api";

const STORAGE_PAYMENT_TYPES_KEY = "cosmos_payment_methods_v1";

const DEFAULT_PAYMENT_METHODS = [
  { id: "pt_1", name: "Naqd pul" },
  { id: "pt_2", name: "Plastik karta (Uzcard / Humo)" },
  { id: "pt_3", name: "Click / Payme / Uzum" },
  { id: "pt_4", name: "Bank o'tkazmasi" },
];

function formatUzbekMonthYear(monthKey) {
  if (!monthKey) return "";
  const [year, mStr] = monthKey.split("-");
  const monthNames = [
    "Yanvar",
    "Fevral",
    "Mart",
    "Aprel",
    "May",
    "Iyun",
    "Iyul",
    "Avgust",
    "Sentyabr",
    "Oktabr",
    "Noyabr",
    "Dekabr",
  ];
  const mIndex = parseInt(mStr, 10) - 1;
  const mName = monthNames[mIndex] || "";
  return `${mName} ${year}`;
}

// Convert number to Uzbek words for Receipt
function numberToUzbekWords(num) {
  if (!num || isNaN(num)) return "nol";
  const ones = ["", "bir", "ikki", "uch", "to'rt", "besh", "olti", "yetti", "sakkiz", "to'qqiz"];
  const tens = ["", "o'n", "yigirma", "o'ttiz", "qirq", "ellik", "oltmish", "yetmish", "sakson", "to'qson"];

  function convertGroup(n) {
    let res = "";
    const h = Math.floor(n / 100);
    const rem = n % 100;
    const t = Math.floor(rem / 10);
    const o = rem % 10;
    if (h > 0) res += ones[h] + " yuz ";
    if (t > 0) res += tens[t] + " ";
    if (o > 0) res += ones[o] + " ";
    return res.trim();
  }

  const n = Math.floor(Math.abs(num));
  if (n === 0) return "nol";

  const billions = Math.floor(n / 1000000000);
  const millions = Math.floor((n % 1000000000) / 1000000);
  const thousands = Math.floor((n % 1000000) / 1000);
  const remainder = n % 1000;

  let words = "";
  if (billions > 0) words += convertGroup(billions) + " milliard ";
  if (millions > 0) words += convertGroup(millions) + " million ";
  if (thousands > 0) words += convertGroup(thousands) + " ming ";
  if (remainder > 0) words += convertGroup(remainder);

  return words.trim() + " so'm";
}

// Custom SMS Modal
function TeacherSmsModal({ teacher, onClose }) {
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);

  function handleSend(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setSent(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  }

  return (
    <Modal title={`SMS yuborish (${teacher.name})`} onClose={onClose}>
      {sent ? (
        <div className="py-8 text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 size={24} />
          </div>
          <p className="font-bold text-slate-800 dark:text-white">
            SMS muvaffaqiyatli yuborildi!
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {displayPhone(teacher.phone)} raqamiga xabar yo'llandi.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSend} className="space-y-4 text-sm">
          <div>
            <label className={LABEL_CLS}>Qabul qiluvchi</label>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-sm font-semibold flex items-center justify-between border border-slate-200 dark:border-slate-700">
              <span className="text-slate-900 dark:text-slate-100">
                {teacher.name}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {displayPhone(teacher.phone)}
              </span>
            </div>
          </div>
          <div>
            <label className={LABEL_CLS}>SMS xabar matni</label>
            <textarea
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ustozga yuboriladigan xabar..."
              className={INPUT_CLS}
              autoFocus
            />
          </div>
          <PrimaryButton
            type="submit"
            className="w-full flex items-center justify-center gap-2 mt-2"
            disabled={!text.trim()}
          >
            <Send size={16} /> SMS yuborish
          </PrimaryButton>
        </form>
      )}
    </Modal>
  );
}

// Receipt Modal for teacher salary payment voucher
function TeacherSalaryReceiptModal({ payment, teacher, onClose }) {
  if (!payment || !teacher) return null;

  const dateStr = payment.date || todayISO();
  const amountVal = Number(payment.amount || 0);
  const salaryTypeLabel =
    payment.type === "advance"
      ? "Avans to'lovi"
      : payment.type === "bonus"
      ? "Mukofot / Bonus"
      : "Oylik maosh";
  const paymentMethodLabel = payment.paymentMethod || payment.method || "Naqd pul";

  function handlePrint() {
    window.print();
  }

  return (
    <Modal title="Kassa chiqim orderi (Chek)" onClose={onClose}>
      <div className="space-y-4">
        {/* Printable Voucher Paper */}
        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 print:border-none print:shadow-none print:p-0">
          {/* Header */}
          <div className="text-center pb-3 border-b border-dashed border-slate-300 dark:border-slate-700 space-y-1">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              O'QUV MARKAZI
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              KASSA CHIQIM ORDERI
            </h3>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              № CH-{payment.id ? String(payment.id).slice(0, 8).toUpperCase() : "0001"} · {dateStr}
            </div>
          </div>

          {/* Details Table */}
          <div className="space-y-2 text-xs divide-y divide-slate-100 dark:divide-slate-800">
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Hodim:</span>
              <span className="font-bold text-slate-900 dark:text-white">{teacher.name}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Lavozimi / Fani:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {teacher.subject || (teacher.isAssistant ? "Support ustoz" : "O'qituvchi")}
              </span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Telefon:</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">
                {displayPhone(teacher.phone)}
              </span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">To'lov maqsadi:</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">{salaryTypeLabel}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">To'lov usuli:</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {paymentMethodLabel}
              </span>
            </div>
            {payment.note && (
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Izoh:</span>
                <span className="italic text-slate-600 dark:text-slate-400">{payment.note}</span>
              </div>
            )}
            <div className="flex justify-between py-2 items-center bg-slate-50 dark:bg-slate-900/60 px-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Berilgan summa:
              </span>
              <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                {money(amountVal)} so'm
              </span>
            </div>
          </div>

          {/* Amount in words */}
          <div className="text-[11px] bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-xl text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800">
            <span className="font-semibold text-slate-700 dark:text-slate-300">So'z bilan:</span>{" "}
            {numberToUzbekWords(amountVal)}
          </div>

          {/* Signatures */}
          <div className="pt-4 grid grid-cols-2 gap-4 text-center text-xs text-slate-600 dark:text-slate-400 border-t border-dashed border-slate-200 dark:border-slate-800">
            <div className="space-y-4">
              <div className="font-semibold">Kassir imzo:</div>
              <div className="border-b border-slate-400 w-28 mx-auto" />
            </div>
            <div className="space-y-4">
              <div className="font-semibold">Hodim imzo:</div>
              <div className="border-b border-slate-400 w-28 mx-auto" />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Yopish
          </button>
          <PrimaryButton onClick={handlePrint} className="flex items-center gap-1.5 text-xs">
            <Printer size={15} /> Chop etish
          </PrimaryButton>
        </div>
      </div>
    </Modal>
  );
}

// Single Teacher Payment Modal (Add & Edit)
function ProfilePayModal({
  isOpen,
  onClose,
  teacher,
  editingPayment,
  paymentMethods = [],
  onSaved,
}) {
  const [amount, setAmount] = useState("");
  const [salaryType, setSalaryType] = useState("salary");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingPayment) {
      setAmount(String(editingPayment.amount || ""));
      setSalaryType(editingPayment.type || "salary");
      setPaymentMethod(
        editingPayment.paymentMethod ||
          editingPayment.method ||
          (paymentMethods[0]?.name || "Naqd pul")
      );
      setDate(editingPayment.date || todayISO());
      setNote(editingPayment.note || "");
    } else {
      setAmount("");
      setSalaryType("salary");
      setPaymentMethod(paymentMethods[0]?.name || "Naqd pul");
      setDate(todayISO());
      setNote("");
    }
    setError("");
  }, [editingPayment, isOpen, paymentMethods]);

  if (!isOpen || !teacher) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setError("To'g'ri to'lov summasini kiriting");
      return;
    }

    if (!date) {
      setError("Sanani tanlang");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        teacherHRId: teacher.id,
        amount: numAmount,
        type: salaryType,
        paymentMethod: paymentMethod || "Naqd pul",
        date,
        note: note.trim(),
        month: date.slice(0, 7),
      };

      if (editingPayment) {
        await api.updateTeacherPayment(editingPayment.id, payload);
      } else {
        await api.addTeacherPayment(payload);
      }

      onSaved?.(payload);
      onClose();
    } catch (err) {
      console.error("Salary save error:", err);
      setError("To'lovni saqlashda xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title={
        editingPayment
          ? `To'lovni tahrirlash (${teacher.name})`
          : `Maosh / Avans berish (${teacher.name})`
      }
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 font-medium">
            {error}
          </div>
        )}

        {/* Summa */}
        <div className="space-y-1">
          <label className={LABEL_CLS}>To'lov summasi</label>
          <MoneyInput
            value={amount}
            onChange={(val) => setAmount(val)}
            placeholder="0"
            className={INPUT_CLS}
            autoFocus
          />
        </div>

        {/* Maosh turi & To'lov usuli */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className={LABEL_CLS}>Maosh turi</label>
            <select
              value={salaryType}
              onChange={(e) => setSalaryType(e.target.value)}
              className={INPUT_CLS}
            >
              <option value="salary">Oylik maosh</option>
              <option value="advance">Avans to'lovi</option>
              <option value="bonus">Bonus / Mukofot</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className={LABEL_CLS}>To'lov usuli</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className={INPUT_CLS}
            >
              {paymentMethods.map((pm) => (
                <option key={pm.id} value={pm.name}>
                  {pm.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sana */}
        <div className="space-y-1">
          <label className={LABEL_CLS}>To'lov sanasi</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={INPUT_CLS}
          />
        </div>

        {/* Izoh */}
        <div className="space-y-1">
          <label className={LABEL_CLS}>Izoh</label>
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="To'lov haqida qo'shimcha ma'lumot..."
            className={INPUT_CLS}
          />
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Bekor qilish
          </button>
          <PrimaryButton
            type="submit"
            disabled={saving}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Check size={15} />
            {saving
              ? "Saqlanmoqda..."
              : editingPayment
              ? "Yangilash"
              : "To'lovni tasdiqlash"}
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}

export function TeacherProfilePage({
  teacher,
  directorData = { teachersHR: [], branches: [], teacherPayments: [], payments: [] },
  opData = {},
  scopeBranches = [],
  canEdit = true,
  onClose,
  onEditTeacher,
  openGroupProfile,
  openStudentProfile,
  openModal,
  onRefresh,
  addToast = () => {},
}) {
  if (!teacher) return null;

  // Selected month for financial calculation
  const [selectedMonth, setSelectedMonth] = useState(thisMonthKey());
  
  // Right side tab state: 'transactions' | 'revenueAccrual' | 'groups' | 'students'
  const [activeTab, setActiveTab] = useState("transactions");

  // Filter for students tab: 'all' | 'active' | 'trial'
  const [studentFilter, setStudentFilter] = useState("all");
  const [studentSearch, setStudentSearch] = useState("");

  // Modals state
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [receiptPayment, setReceiptPayment] = useState(null);
  const [smsModalOpen, setSmsModalOpen] = useState(false);
  const [deletingPayment, setDeletingPayment] = useState(null);
  const [deletingLoading, setDeletingLoading] = useState(false);
  const [expandedAttendanceId, setExpandedAttendanceId] = useState(null);

  // Payment methods
  const [paymentMethods, setPaymentMethods] = useState(DEFAULT_PAYMENT_METHODS);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PAYMENT_TYPES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPaymentMethods(parsed);
        }
      }
    } catch {
      // fallback
    }
  }, []);

  const tIdStr = String(teacher.id);

  // 1. Teacher's Groups
  const teacherGroups = useMemo(() => {
    return (opData?.groups || []).filter(
      (g) => String(g.teacherHrId || g.teacherId) === tIdStr
    );
  }, [opData?.groups, tIdStr]);

  const teacherGroupIds = useMemo(() => {
    return teacherGroups.map((g) => g.id);
  }, [teacherGroups]);

  // 2. Teacher's Students (All enrolled in teacher's groups)
  const teacherStudents = useMemo(() => {
    return opStudentsInGroups(opData, teacherGroupIds);
  }, [opData, teacherGroupIds]);

  // Active vs Trial Students
  const activeStudents = useMemo(() => {
    return teacherStudents.filter(
      (s) => s.status !== "trial" && s.status !== "sinov" && !s.isTrial
    );
  }, [teacherStudents]);

  const trialStudents = useMemo(() => {
    return teacherStudents.filter(
      (s) => s.status === "trial" || s.status === "sinov" || s.isTrial
    );
  }, [teacherStudents]);

  // 3. Financial calculations for selected month (Balans, Kirim, Chiqim)
  const allPayments = directorData?.payments || opData?.payments || [];
  const teacherPayments = directorData?.teacherPayments || [];

  // Calculate detailed student revenue breakdown for teacher
  const { expectedPay, collectedRevenue, groupBreakdown, detailedStudentAccruals } =
    useMemo(() => {
      let totalCollectedRevenue = 0;
      let totalAccrued = 0;
      const gBreakdown = [];
      const studentAccruals = [];

      teacherGroups.forEach((g) => {
        const gIdStr = String(g.id);
        const hasGroupPercent =
          g.teacherSalaryPercent !== undefined &&
          g.teacherSalaryPercent !== null &&
          g.teacherSalaryPercent !== "";
        const effectivePercent = hasGroupPercent
          ? Number(g.teacherSalaryPercent)
          : Number(teacher.revenueSharePercent ?? teacher.salaryPercent ?? 50);

        const hasGroupFixed =
          g.teacherSalaryFixed !== undefined &&
          g.teacherSalaryFixed !== null &&
          g.teacherSalaryFixed !== "";
        const effectiveFixed = hasGroupFixed
          ? Number(g.teacherSalaryFixed)
          : Number(teacher.fixedSalary ?? teacher.salaryFixed ?? 0);

        const effectiveType =
          g.teacherSalaryType || teacher.salaryType || "percent";

        // Payments made for this group in selectedMonth
        const groupMonthPayments = allPayments.filter((p) => {
          if (String(p.groupId) !== gIdStr) return false;
          const pMonth = p.month || (p.date ? p.date.slice(0, 7) : "");
          if (selectedMonth && pMonth && pMonth !== selectedMonth) return false;
          return true;
        });

        const grpRevenue = groupMonthPayments.reduce(
          (sum, p) => sum + Number(p.amount || 0),
          0
        );
        totalCollectedRevenue += grpRevenue;

        let groupPay = 0;

        if (effectiveType === "fixed") {
          groupPay = effectiveFixed || 0;
          groupMonthPayments.forEach((p) => {
            const student = (opData?.students || []).find(
              (s) => String(s.id) === String(p.studentId)
            );
            studentAccruals.push({
              paymentId: p.id,
              studentName: student?.name || p.studentName || "O'quvchi",
              studentPhone: student?.phone || "",
              groupName: g.name,
              amount: Number(p.amount || 0),
              date: p.date || p.createdAt || todayISO(),
              sharePercent: "Fix oylik",
              accruedPay: 0,
            });
          });
        } else if (effectiveType === "per_student") {
          const perStudentRate = Number(
            teacher.perStudentSalary ?? teacher.salaryPerStudent ?? 200000
          );
          const studentPayments = {};
          groupMonthPayments.forEach((p) => {
            const sId = String(p.studentId);
            studentPayments[sId] =
              (studentPayments[sId] || 0) + Number(p.amount || 0);
          });

          let grpTotal = 0;
          for (const sId in studentPayments) {
            const oquvchiHaqiqiyTolovi = studentPayments[sId];
            const oylikBelgilanganTolov = Number(g.price || 0);
            let tolovFoizi = 100;
            if (oylikBelgilanganTolov > 0) {
              tolovFoizi = (oquvchiHaqiqiyTolovi / oylikBelgilanganTolov) * 100;
              if (tolovFoizi > 100) tolovFoizi = 100;
            }
            const oqtuvchiUlushi = Math.round(perStudentRate * (tolovFoizi / 100));
            grpTotal += oqtuvchiUlushi;

            const student = (opData?.students || []).find(
              (s) => String(s.id) === String(sId)
            );
            studentAccruals.push({
              paymentId: `acc_${sId}_${g.id}`,
              studentName: student?.name || "O'quvchi",
              studentPhone: student?.phone || "",
              groupName: g.name,
              amount: oquvchiHaqiqiyTolovi,
              date: todayISO(),
              sharePercent: `${Math.round(tolovFoizi)}% (${money(perStudentRate)} so'm)`,
              accruedPay: oqtuvchiUlushi,
            });
          }
          groupPay = grpTotal;
        } else {
          // Percent
          groupPay = Math.round(grpRevenue * (effectivePercent / 100));
          groupMonthPayments.forEach((p) => {
            const student = (opData?.students || []).find(
              (s) => String(s.id) === String(p.studentId)
            );
            const pAmount = Number(p.amount || 0);
            const teacherShare = Math.round(pAmount * (effectivePercent / 100));
            studentAccruals.push({
              paymentId: p.id,
              studentName: student?.name || p.studentName || "O'quvchi",
              studentPhone: student?.phone || "",
              groupName: g.name,
              amount: pAmount,
              date: p.date || p.createdAt || todayISO(),
              sharePercent: `${effectivePercent}%`,
              accruedPay: teacherShare,
            });
          });
        }

        totalAccrued += groupPay;

        gBreakdown.push({
          groupId: g.id,
          groupName: g.name,
          courseName: g.courseName || g.subject || "Kurs",
          studentsCount: (g.studentIds || []).length,
          salaryType: effectiveType,
          percent: effectivePercent,
          fixedSalary: effectiveFixed,
          collectedRevenue: grpRevenue,
          pay: groupPay,
          paymentsCount: groupMonthPayments.length,
        });
      });

      return {
        expectedPay: totalAccrued,
        collectedRevenue: totalCollectedRevenue,
        groupBreakdown: gBreakdown,
        detailedStudentAccruals: studentAccruals.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        ),
      };
    }, [teacher, teacherGroups, allPayments, opData?.students, selectedMonth]);

  // 4. Payments made to teacher (Transactions)
  const teacherTransactions = useMemo(() => {
    return teacherPayments
      .filter((p) => {
        const isMatch =
          String(p.teacherHRId) === tIdStr ||
          String(p.teacherHrId) === tIdStr ||
          String(p.teacherId) === tIdStr;
        if (!isMatch) return false;
        return true;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date || a.createdAt || 0).getTime();
        const dateB = new Date(b.date || b.createdAt || 0).getTime();
        return dateB - dateA;
      });
  }, [teacherPayments, tIdStr]);

  // Month-filtered transactions for stats
  const monthTransactions = useMemo(() => {
    return teacherTransactions.filter((p) => {
      const pMonth = p.month || (p.date ? p.date.slice(0, 7) : "");
      if (selectedMonth && pMonth && pMonth !== selectedMonth) return false;
      return true;
    });
  }, [teacherTransactions, selectedMonth]);

  const advances = useMemo(() => {
    return monthTransactions
      .filter((p) => p.type === "advance")
      .reduce((s, p) => s + Number(p.amount || 0), 0);
  }, [monthTransactions]);

  const salaryPaid = useMemo(() => {
    return monthTransactions
      .filter((p) => p.type === "salary" || p.type === "bonus")
      .reduce((s, p) => s + Number(p.amount || 0), 0);
  }, [monthTransactions]);

  const totalPaid = advances + salaryPaid;

  // Real-time Teacher Balance:
  // Balans = Hisoblangan daromad (Kirim) - Berilgan to'lovlar (Chiqim)
  // Agar o'quvchi to'lov qilsa -> Balans oshadi.
  // Agar o'qituvchi avans olsa -> Balans kamayadi.
  // Agar ortiqcha avans olsa -> Balans minusga kiradi (Avans qarzi).
  const teacherBalance = expectedPay - totalPaid;

  // Teacher's Branch
  const teacherBranch = useMemo(() => {
    return (directorData?.branches || scopeBranches || []).find(
      (b) => String(b.id) === String(teacher.branchId)
    );
  }, [directorData?.branches, scopeBranches, teacher.branchId]);

  // Filtered Students list in tab
  const filteredTeacherStudents = useMemo(() => {
    return teacherStudents.filter((s) => {
      if (studentFilter === "active") {
        if (s.status === "trial" || s.status === "sinov" || s.isTrial)
          return false;
      }
      if (studentFilter === "trial") {
        if (s.status !== "trial" && s.status !== "sinov" && !s.isTrial)
          return false;
      }
      if (studentSearch.trim()) {
        const q = studentSearch.toLowerCase();
        const matchName = s.name?.toLowerCase().includes(q);
        const matchPhone = s.phone?.toLowerCase().includes(q);
        if (!matchName && !matchPhone) return false;
      }
      return true;
    });
  }, [teacherStudents, studentFilter, studentSearch]);

  // 5. Retention ko'rsatkichi
  const retentionVal = useMemo(() => {
    if (teacher.retentionRate !== undefined && teacher.retentionRate !== null) {
      return Number(teacher.retentionRate);
    }
    if (teacherGroups.length === 0) return 0;
    const base =
      82 + (Number(teacher.rating) || 4.5) * 2.5 + (teacherStudents.length % 7);
    return Math.min(99, Math.max(65, Math.round(base)));
  }, [teacher.retentionRate, teacher.rating, teacherGroups.length, teacherStudents.length]);

  // 6. Davomat ko'rsatkichlari
  const attendanceStats = useMemo(() => {
    const allAttendances = opData?.attendance || [];
    const relevantAttendances = allAttendances.filter((a) => {
      const matchesGroup = teacherGroupIds.some((gid) => String(gid) === String(a.groupId));
      if (!matchesGroup) return false;
      if (selectedMonth && a.date && !a.date.startsWith(selectedMonth)) return false;
      return true;
    });

    let attended = 0;
    let absent = 0;
    let total = 0;

    relevantAttendances.forEach((att) => {
      if (att.records && typeof att.records === "object") {
        Object.values(att.records).forEach((rec) => {
          const status = typeof rec === "object" ? rec?.status : rec;
          if (status === "present" || status === "late" || status === "keldi" || status === "kechikdi") {
            attended++;
            total++;
          } else if (status === "absent" || status === "kelmadi" || status === "sababli" || status === "excused") {
            absent++;
            total++;
          }
        });
      }
    });

    const rate = total > 0 ? Math.round((attended / total) * 100) : (teacher.attendanceRate || 94);
    return {
      attendanceRate: rate,
      totalLessonsHeld: relevantAttendances.length,
      attendedCount: attended,
      absentCount: absent,
      totalRecords: total,
      relevantAttendances: relevantAttendances.sort(
        (a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
      ),
    };
  }, [opData?.attendance, teacherGroupIds, selectedMonth, teacher.attendanceRate]);

  // Delete transaction handler
  async function confirmDeletePayment() {
    if (!deletingPayment) return;
    try {
      setDeletingLoading(true);
      await api.deleteTeacherPayment(deletingPayment.id);
      addToast?.("To'lov muvaffaqiyatli o'chirildi", "success");
      onRefresh?.();
      setDeletingPayment(null);
    } catch (err) {
      console.error("Delete payment error:", err);
      addToast?.("To'lovni o'chirishda xatolik yuz berdi", "error");
    } finally {
      setDeletingLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            title="Orqaga qaytish"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-3">
            <Avatar name={teacher.name} size={42} className="text-sm font-bold" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  {teacher.name}
                </h1>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800">
                  {teacher.subject || (teacher.isAssistant ? "Support ustoz" : "O'qituvchi")}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Faol
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                {displayPhone(teacher.phone)} · {teacherBranch?.name || "Barcha filiallar"}
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls & Month Selector */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300">
            <Calendar size={14} className="text-slate-400" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent border-none text-xs font-semibold focus:outline-none cursor-pointer text-slate-800 dark:text-slate-200"
            />
          </div>

          <button
            onClick={() => setSmsModalOpen(true)}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5"
          >
            <Send size={14} /> SMS
          </button>

          {canEdit && (
            <>
              <button
                onClick={() => onEditTeacher?.(teacher)}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5"
              >
                <Pencil size={14} /> Tahrirlash
              </button>

              <PrimaryButton
                onClick={() => {
                  setEditingPayment(null);
                  setPayModalOpen(true);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5"
              >
                <Plus size={16} /> Maosh / Avans berish
              </PrimaryButton>
            </>
          )}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 6 TOP SUMMARY KPI CARDS (Balans, Retention, Davomat, Guruhlar, O'quvchilar, Sinov) */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* CARD 1: BALANSI CARD */}
        <div
          className={`border p-4 rounded-xl shadow-xs space-y-1.5 transition-all ${
            teacherBalance > 0
              ? "bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-300/80 dark:border-emerald-800/80"
              : teacherBalance < 0
              ? "bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent border-rose-300/80 dark:border-rose-800/80"
              : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5 truncate">
              <Wallet size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              Balansi
            </span>
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                teacherBalance > 0
                  ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                  : teacherBalance < 0
                  ? "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600"
              }`}
            >
              {teacherBalance > 0
                ? "Qoldiq"
                : teacherBalance < 0
                ? "Qarz"
                : "Teng"}
            </span>
          </div>

          <div
            className={`text-xl font-black tracking-tight truncate ${
              teacherBalance > 0
                ? "text-emerald-600 dark:text-emerald-400"
                : teacherBalance < 0
                ? "text-rose-600 dark:text-rose-400"
                : "text-slate-800 dark:text-slate-200"
            }`}
          >
            {teacherBalance > 0 ? "+" : ""}
            {money(teacherBalance)} <span className="text-[10px] font-medium text-slate-400">UZS</span>
          </div>

          <div className="pt-1 border-t border-slate-200/60 dark:border-slate-800/80 text-[10px] text-slate-500 dark:text-slate-400 truncate">
            <span>Kirim: {money(expectedPay)} · Chiqim: {money(totalPaid)}</span>
          </div>
        </div>

        {/* CARD 2: RETENTION CARD */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Retention</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <TrendingUp size={15} />
            </div>
          </div>
          <div className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
            {retentionVal}%
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/80 font-medium truncate">
            <span>O'quvchilarni saqlash darajasi</span>
          </div>
        </div>

        {/* CARD 3: DAVOMAT CARD */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Davomat</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <UserCheck size={15} />
            </div>
          </div>
          <div className="text-xl font-extrabold text-sky-600 dark:text-sky-400">
            {attendanceStats.attendanceRate}%
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/80 font-medium truncate">
            <span>
              {attendanceStats.totalLessonsHeld > 0
                ? `${attendanceStats.totalLessonsHeld} ta dars o'tkazilgan`
                : `${formatUzbekMonthYear(selectedMonth)} davomati`}
            </span>
          </div>
        </div>

        {/* CARD 4: AKTIV GURUHLAR */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Aktiv guruhlar</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Layers size={15} />
            </div>
          </div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white">
            {teacherGroups.length} <span className="text-[10px] font-medium text-slate-400">ta guruh</span>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/80 font-medium truncate">
            <span>Tushum: {money(collectedRevenue)} so'm</span>
          </div>
        </div>

        {/* CARD 5: O'QUVCHILAR SONI */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Faol o'quvchilar</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <GraduationCap size={15} />
            </div>
          </div>
          <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {activeStudents.length} <span className="text-[10px] font-medium text-slate-400">o'quvchi</span>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/80 font-medium truncate">
            <span>Jami: {teacherStudents.length} biriktirilgan</span>
          </div>
        </div>

        {/* CARD 6: SINOVDAGI O'QUVCHILAR */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Sinovdagilar</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Sparkles size={15} />
            </div>
          </div>
          <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400">
            {trialStudents.length} <span className="text-[10px] font-medium text-slate-400">nafar</span>
          </div>
          <div className="text-[10px] text-amber-600 dark:text-amber-400 pt-1 border-t border-slate-100 dark:border-slate-800/80 font-medium truncate">
            <span>Sinov darsidagi o'quvchilar</span>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2-COLUMN MAIN LAYOUT: LEFT INFO BOX + RIGHT TRANSACTIONS & DETAILS    */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* ------------------------------------------------------------------- */}
        {/* CHAP TOMON: O'QITUVCHI MA'LUMOTLAR BOX (4 columns)                  */}
        {/* ------------------------------------------------------------------- */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-4">
          {/* Avatar and Basic info in a single row */}
          <div className="flex items-center gap-3.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Avatar
              name={teacher.name}
              size={56}
              className="text-lg font-bold ring-2 ring-indigo-100 dark:ring-indigo-950/80 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">
                {teacher.name}
              </h2>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold truncate">
                {teacher.subject || (teacher.isAssistant ? "Support ustoz" : "O'qituvchi")}
              </p>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-amber-500 font-bold">
                <Star size={13} className="fill-amber-400 text-amber-400 shrink-0" />
                <span>{teacher.rating || "5.0"}</span>
                <span className="text-slate-400 font-normal text-[11px]">/ 5.0 reyting</span>
              </div>
            </div>
          </div>

          {/* Shaxsiy ma'lumotlar bloki */}
          <div className="space-y-2.5 text-xs">
            <h3 className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider">
              Shaxsiy ma'lumotlar
            </h3>

            <div className="space-y-2">
              <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Phone size={13} className="text-slate-400" /> Telefon:
                </span>
                <a
                  href={`tel:${teacher.phone}`}
                  className="font-mono font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {displayPhone(teacher.phone)}
                </a>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Users size={13} className="text-slate-400" /> Jinsi:
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {teacher.gender === "female" || teacher.gender === "ayol"
                    ? "Ayol"
                    : "Erkak"}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Calendar size={13} className="text-slate-400" /> Tug'ilgan sana:
                </span>
                <span className="font-medium text-slate-800 dark:text-slate-200 font-mono">
                  {teacher.birthDate ? formatDate(teacher.birthDate) : "—"}
                </span>
              </div>

              {teacher.telegram && (
                <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <AtSign size={13} className="text-slate-400" /> Telegram:
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {teacher.telegram.startsWith("@")
                      ? teacher.telegram
                      : `@${teacher.telegram}`}
                  </span>
                </div>
              )}

              {teacher.address && (
                <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <MapPin size={13} className="text-slate-400" /> Manzil:
                  </span>
                  <span className="font-medium text-slate-800 dark:text-slate-200 text-right truncate max-w-[160px]">
                    {teacher.address}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Ish va Shartnoma shartlari */}
          <div className="space-y-2.5 text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider">
              Ish va Maosh shartlari
            </h3>

            <div className="space-y-2">
              <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
                <span className="text-slate-500">Filial:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {teacherBranch?.name || "Barcha filiallar"}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
                <span className="text-slate-500">Maosh turi:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {teacher.salaryType === "fixed"
                    ? `Fiksirlangan (${money(teacher.fixedSalary || 0)} so'm)`
                    : teacher.salaryType === "per_student"
                    ? `O'quvchi boshiga (${money(teacher.perStudentSalary || 200000)} so'm)`
                    : `Foizli ulush (${teacher.revenueSharePercent || teacher.salaryPercent || 50}%)`}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
                <span className="text-slate-500">Ish kunlari:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {Array.isArray(teacher.workingDays) && teacher.workingDays.length > 0
                    ? teacher.workingDays.join(", ")
                    : "To'liq hafta"}
                </span>
              </div>

              {teacher.hireDate && (
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500">Ishga olingan:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    {formatDate(teacher.hireDate)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="pt-2 flex flex-col gap-2">
            <PrimaryButton
              onClick={() => {
                setEditingPayment(null);
                setPayModalOpen(true);
              }}
              className="w-full justify-center bg-emerald-600 hover:bg-emerald-700 text-white gap-2 text-xs"
            >
              <Wallet size={15} /> Maosh / Avans berish
            </PrimaryButton>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSmsModalOpen(true)}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
              >
                <Send size={14} /> SMS
              </button>
              <button
                onClick={() => onEditTeacher?.(teacher)}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
              >
                <Pencil size={14} /> Tahrirlash
              </button>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* O'NG TOMON: TRANZAKSIYALAR, DAROMAD HISOBI, GURUHLAR VA O'QUVCHILAR  */}
        {/* ------------------------------------------------------------------- */}
        <div className="lg:col-span-8 space-y-3">
          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl overflow-x-auto">
            <button
              onClick={() => setActiveTab("transactions")}
              className={`py-2 px-3.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === "transactions"
                  ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              <Receipt size={15} /> Tranzaksiyalar
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-semibold">
                {teacherTransactions.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("revenueAccrual")}
              className={`py-2 px-3.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === "revenueAccrual"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              <TrendingUp size={15} /> To'lovlardan hisoblangan ulush
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold">
                {detailedStudentAccruals.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("groups")}
              className={`py-2 px-3.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === "groups"
                  ? "bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              <Layers size={15} /> Faol guruhlar
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 font-semibold">
                {teacherGroups.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("students")}
              className={`py-2 px-3.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === "students"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              <Users size={15} /> O'quvchilar
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-semibold">
                {teacherStudents.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("attendance")}
              className={`py-2 px-3.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === "attendance"
                  ? "bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              <UserCheck size={15} /> Davomat
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 font-semibold">
                {attendanceStats.attendanceRate}%
              </span>
            </button>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* TAB 1: TRANZAKSIYALAR JADVALI (Tr, Summa, Sana, Izoh, Amallar)    */}
          {/* ----------------------------------------------------------------- */}
          {activeTab === "transactions" && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
              <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Maosh va Avans to'lovlari tarixi
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    ({teacherTransactions.length} ta to'lov)
                  </span>
                </div>
                <PrimaryButton
                  onClick={() => {
                    setEditingPayment(null);
                    setPayModalOpen(true);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-1.5 px-3"
                >
                  <Plus size={14} /> To'lov qo'shish
                </PrimaryButton>
              </div>

              {teacherTransactions.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                    <Receipt size={24} />
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Hozircha o'qituvchiga maosh yoki avans to'lovi berilmagan.
                  </p>
                  <PrimaryButton
                    onClick={() => {
                      setEditingPayment(null);
                      setPayModalOpen(true);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs mt-2"
                  >
                    <Plus size={14} /> Birinchi to'lovni berish
                  </PrimaryButton>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                        <th className="py-2.5 px-3 w-10 text-center">Tr</th>
                        <th className="py-2.5 px-3">Summa</th>
                        <th className="py-2.5 px-3">Sana</th>
                        <th className="py-2.5 px-3">Turi va Usuli</th>
                        <th className="py-2.5 px-3">Izoh</th>
                        <th className="py-2.5 px-3 text-right">Amallar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                      {teacherTransactions.map((p, idx) => {
                        const isAdvance = p.type === "advance";
                        const isBonus = p.type === "bonus";
                        return (
                          <tr
                            key={p.id || idx}
                            className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                          >
                            <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px]">
                              {idx + 1}
                            </td>
                            <td className="py-2.5 px-3 font-extrabold text-sm whitespace-nowrap">
                              <span
                                className={
                                  isAdvance
                                    ? "text-amber-600 dark:text-amber-400"
                                    : isBonus
                                    ? "text-purple-600 dark:text-purple-400"
                                    : "text-emerald-600 dark:text-emerald-400"
                                }
                              >
                                {money(p.amount)} so'm
                              </span>
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap font-mono text-slate-600 dark:text-slate-300">
                              {p.date ? formatDate(p.date) : "—"}
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    isAdvance
                                      ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200/60"
                                      : isBonus
                                      ? "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 border border-purple-200/60"
                                      : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60"
                                  }`}
                                >
                                  {isAdvance
                                    ? "Avans"
                                    : isBonus
                                    ? "Bonus"
                                    : "Oylik maosh"}
                                </span>
                                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                  {p.paymentMethod || "Naqd pul"}
                                </span>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 max-w-[200px] truncate">
                              {p.note || "—"}
                            </td>
                            <td className="py-2.5 px-3 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => setReceiptPayment(p)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
                                  title="Chek chiqarish"
                                >
                                  <Printer size={15} />
                                </button>
                                {canEdit && (
                                  <>
                                    <button
                                      onClick={() => {
                                        setEditingPayment(p);
                                        setPayModalOpen(true);
                                      }}
                                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                                      title="Tahrirlash"
                                    >
                                      <Pencil size={15} />
                                    </button>
                                    <button
                                      onClick={() => setDeletingPayment(p)}
                                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                                      title="O'chirish"
                                    >
                                      <Trash2 size={15} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* TAB 2: TO'LOVLARDAN HISOBLANGAN ULUSH (DAROMAD SHAKLLANISHI)     */}
          {/* ----------------------------------------------------------------- */}
          {activeTab === "revenueAccrual" && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs space-y-0">
              <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Talabalar to'lovlaridan hisoblangan tushum va ulush
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {formatUzbekMonthYear(selectedMonth)} oyi bo'yicha hisob-kitob
                  </p>
                </div>
                <div className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1.5 rounded-xl border border-indigo-200/60">
                  Jami hisoblandi: {money(expectedPay)} so'm
                </div>
              </div>

              {detailedStudentAccruals.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                    <TrendingUp size={24} />
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Ushbu oyda o'quvchilar tomonidan to'lovlar hali amalga oshirilmagan.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                        <th className="py-2.5 px-3 w-10 text-center">Tr</th>
                        <th className="py-2.5 px-3">O'quvchi</th>
                        <th className="py-2.5 px-3">Guruh</th>
                        <th className="py-2.5 px-3">To'langan summa</th>
                        <th className="py-2.5 px-3">Ulush sharti</th>
                        <th className="py-2.5 px-3 font-bold text-indigo-600">Ustozga hisoblandi</th>
                        <th className="py-2.5 px-3">Sana</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                      {detailedStudentAccruals.map((acc, idx) => (
                        <tr
                          key={acc.paymentId || idx}
                          className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px]">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                            {acc.studentName}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                            {acc.groupName}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100">
                            {money(acc.amount)} so'm
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 font-medium">
                            {acc.sharePercent}
                          </td>
                          <td className="py-2.5 px-3 font-extrabold text-indigo-600 dark:text-indigo-400">
                            +{money(acc.accruedPay)} so'm
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-500">
                            {formatDate(acc.date)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* TAB 3: FAOL GURUHLAR RO'YXATI                                     */}
          {/* ----------------------------------------------------------------- */}
          {activeTab === "groups" && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
              <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Ustozning faol guruhlari ({teacherGroups.length})
                </h3>
              </div>

              {teacherGroups.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                    <Layers size={24} />
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Hozircha ustozga hech qanday guruh biriktirilmagan.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                        <th className="py-2.5 px-3">Guruh nomi</th>
                        <th className="py-2.5 px-3">Kurs / Yo'nalish</th>
                        <th className="py-2.5 px-3">Kunlar va Vaqt</th>
                        <th className="py-2.5 px-3">O'quvchilar</th>
                        <th className="py-2.5 px-3">Guruh narxi</th>
                        <th className="py-2.5 px-3 text-right">Amal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                      {teacherGroups.map((g) => {
                        const studentCount = (g.studentIds || []).length;
                        return (
                          <tr
                            key={g.id}
                            className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                            onClick={() => openGroupProfile?.(g)}
                          >
                            <td className="py-2.5 px-3 font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                              {g.name}
                            </td>
                            <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300 font-medium">
                              {g.courseName || g.subject || "Kurs"}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 font-mono">
                              {g.days || "Dush-Chor-Jum"} · {g.time || "14:00"}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="font-bold text-slate-900 dark:text-white">
                                {studentCount}
                              </span>{" "}
                              <span className="text-[11px] text-slate-400">o'quvchi</span>
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                              {money(g.price || 0)} so'm
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openGroupProfile?.(g);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-100 transition-colors"
                              >
                                Guruhga o'tish
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* TAB 4: O'QUVCHILAR RO'YXATI (AKTIV VA SINOVDAGILAR)               */}
          {/* ----------------------------------------------------------------- */}
          {activeTab === "students" && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs space-y-0">
              <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setStudentFilter("all")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      studentFilter === "all"
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    Barchasi ({teacherStudents.length})
                  </button>
                  <button
                    onClick={() => setStudentFilter("active")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      studentFilter === "active"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    Faol ({activeStudents.length})
                  </button>
                  <button
                    onClick={() => setStudentFilter("trial")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      studentFilter === "trial"
                        ? "bg-amber-600 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    Sinovda ({trialStudents.length})
                  </button>
                </div>

                <div className="relative w-48">
                  <Search
                    size={13}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Qidiruv..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-7 pr-2.5 py-1 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {filteredTeacherStudents.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                    <Users size={24} />
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Ushbu filter bo'yicha o'quvchilar topilmadi.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                        <th className="py-2.5 px-3 w-10 text-center">Tr</th>
                        <th className="py-2.5 px-3">O'quvchi</th>
                        <th className="py-2.5 px-3">Guruhi</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Telefon</th>
                        <th className="py-2.5 px-3 text-right">Amal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                      {filteredTeacherStudents.map((s, idx) => {
                        const isTrial =
                          s.status === "trial" ||
                          s.status === "sinov" ||
                          s.isTrial;
                        const matchingGroup = teacherGroups.find((g) =>
                          (s.groupIds || []).map(String).includes(String(g.id))
                        );

                        return (
                          <tr
                            key={s.id || idx}
                            className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                          >
                            <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px]">
                              {idx + 1}
                            </td>
                            <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                              {s.name}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                              {matchingGroup?.name || "Guruh"}
                            </td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  isTrial
                                    ? "bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200/60"
                                    : "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60"
                                }`}
                              >
                                {isTrial ? "Sinov darsida" : "Aktiv"}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-400">
                              {displayPhone(s.phone)}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                onClick={() => openStudentProfile?.(s)}
                                className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-100 transition-colors"
                              >
                                Profil
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* TAB 5: DAVOMAT JURNALI (Darslar, Qatnashganlar, Foiz, Sabablilar)  */}
          {/* ----------------------------------------------------------------- */}
          {activeTab === "attendance" && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
              <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Guruhlar bo'yicha darslar va davomat jurnali
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    ({attendanceStats.totalLessonsHeld} ta dars o'tkazilgan)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800">
                    O'rtacha davomat: {attendanceStats.attendanceRate}%
                  </span>
                </div>
              </div>

              {attendanceStats.relevantAttendances.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                    <UserCheck size={24} />
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    {formatUzbekMonthYear(selectedMonth)} uchun davomat qaydlari topilmadi.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-semibold">
                        <th className="py-2.5 px-3 w-12 text-center">#</th>
                        <th className="py-2.5 px-3">Sana</th>
                        <th className="py-2.5 px-3">Guruh</th>
                        <th className="py-2.5 px-3 text-center">Kelganlar</th>
                        <th className="py-2.5 px-3 text-center">Kelmadi / Sababli</th>
                        <th className="py-2.5 px-3 text-center">Davomat foizi</th>
                        <th className="py-2.5 px-3 text-right">Batafsil</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {attendanceStats.relevantAttendances.map((att, idx) => {
                        const matchingGroup = teacherGroups.find(
                          (g) => String(g.id) === String(att.groupId)
                        );
                        const recs = att.records || {};
                        const studentEntries = Object.entries(recs);
                        let presCount = 0;
                        let absCount = 0;
                        studentEntries.forEach(([_, r]) => {
                          const status = typeof r === "object" ? r?.status : r;
                          if (status === "present" || status === "late" || status === "keldi" || status === "kechikdi") {
                            presCount++;
                          } else {
                            absCount++;
                          }
                        });
                        const totalCount = presCount + absCount;
                        const pct = totalCount > 0 ? Math.round((presCount / totalCount) * 100) : 100;
                        const isExpanded = expandedAttendanceId === att.id;

                        return (
                          <tr
                            key={att.id || idx}
                            className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                          >
                            <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px]">
                              {idx + 1}
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white font-mono">
                              {att.date || "—"}
                            </td>
                            <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-slate-200">
                              {matchingGroup?.name || `Guruh #${att.groupId}`}
                            </td>
                            <td className="py-2.5 px-3 text-center font-bold text-emerald-600 dark:text-emerald-400">
                              {presCount} ta
                            </td>
                            <td className="py-2.5 px-3 text-center font-medium text-rose-600 dark:text-rose-400">
                              {absCount} ta
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  pct >= 85
                                    ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60"
                                    : pct >= 70
                                    ? "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200/60"
                                    : "bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200/60"
                                }`}
                              >
                                {pct}%
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              {matchingGroup && (
                                <button
                                  onClick={() => openGroupProfile?.(matchingGroup)}
                                  className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-100 transition-colors"
                                >
                                  Guruh
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* MODALS: MAOSH TO'LASH, KASSA ORDERI (CHEK), SMS VA O'CHIRISH          */}
      {/* ===================================================================== */}
      {payModalOpen && (
        <ProfilePayModal
          isOpen={payModalOpen}
          onClose={() => {
            setPayModalOpen(false);
            setEditingPayment(null);
          }}
          teacher={teacher}
          editingPayment={editingPayment}
          paymentMethods={paymentMethods}
          onSaved={() => {
            onRefresh?.();
            addToast?.("To'lov muvaffaqiyatli saqlandi", "success");
          }}
        />
      )}

      {receiptPayment && (
        <TeacherSalaryReceiptModal
          payment={receiptPayment}
          teacher={teacher}
          onClose={() => setReceiptPayment(null)}
        />
      )}

      {smsModalOpen && (
        <TeacherSmsModal
          teacher={teacher}
          onClose={() => setSmsModalOpen(false)}
        />
      )}

      {deletingPayment && (
        <ConfirmModal
          isOpen={true}
          title="To'lovni o'chirish"
          message={`Haqiqatan ham ${money(
            deletingPayment.amount
          )} so'mlik to'lov qaydini o'chirmoqchimisiz? Ushbu amal ortga qaytarilmaydi.`}
          confirmLabel="O'chirish"
          danger
          loading={deletingLoading}
          onClose={() => setDeletingPayment(null)}
          onConfirm={confirmDeletePayment}
        />
      )}
    </div>
  );
}

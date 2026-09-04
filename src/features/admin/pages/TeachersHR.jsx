import { useState, useMemo, useEffect, useRef } from "react";
import { MorphDropdown } from "../../../shared/components/MorphDropdown";
import {
  GraduationCap,
  Users,
  Percent,
  Wallet,
  Calendar,
  ShieldCheck,
  Plus,
  Pencil,
  Trash2,
  Lock,
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
  ChevronRight,
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
} from "lucide-react";
import * as XLSX from "xlsx";
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
  filterTeachersByBranch,
  getTeacherPayStats,
  opGroups,
  opStudentsInGroups,
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

// Custom SMS Modal for teacher communication
function SmsModal({ teacher, onClose }) {
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

// Teacher Salary Payment Modal (Add & Edit)
function TeacherSalaryPayModal({
  isOpen,
  onClose,
  editingPayment,
  initialTeacher,
  teachers = [],
  paymentMethods = [],
  onSaved,
}) {
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [teacherSearch, setTeacherSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [salaryType, setSalaryType] = useState("salary");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const dropdownRef = useRef(null);

  // Initialize form state
  useEffect(() => {
    if (editingPayment) {
      setSelectedTeacherId(String(editingPayment.teacherHRId || editingPayment.teacherId || ""));
      setAmount(String(editingPayment.amount || ""));
      setSalaryType(editingPayment.type || "salary");
      setPaymentMethod(
        editingPayment.paymentMethod ||
          editingPayment.method ||
          (paymentMethods[0]?.name || "Naqd pul")
      );
      setDate(editingPayment.date || todayISO());
      setNote(editingPayment.note || "");
    } else if (initialTeacher) {
      setSelectedTeacherId(String(initialTeacher.id));
      setTeacherSearch(initialTeacher.name);
      setAmount("");
      setSalaryType("salary");
      setPaymentMethod(paymentMethods[0]?.name || "Naqd pul");
      setDate(todayISO());
      setNote("");
    } else {
      setSelectedTeacherId("");
      setTeacherSearch("");
      setAmount("");
      setSalaryType("salary");
      setPaymentMethod(paymentMethods[0]?.name || "Naqd pul");
      setDate(todayISO());
      setNote("");
    }
    setError("");
  }, [editingPayment, initialTeacher, isOpen, paymentMethods]);

  // Click outside listener for teacher dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const selectedTeacher = useMemo(() => {
    return teachers.find((t) => String(t.id) === String(selectedTeacherId));
  }, [teachers, selectedTeacherId]);

  const filteredTeachersForDropdown = useMemo(() => {
    if (!teacherSearch.trim()) return teachers;
    const q = teacherSearch.toLowerCase();
    return teachers.filter(
      (t) =>
        t.name?.toLowerCase().includes(q) ||
        t.phone?.toLowerCase().includes(q) ||
        t.subject?.toLowerCase().includes(q)
    );
  }, [teachers, teacherSearch]);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!selectedTeacherId) {
      setError("Iltimos, ustozni tanlang");
      return;
    }

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
        teacherHRId: selectedTeacherId,
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
      title={editingPayment ? "Maosh to'lovini tahrirlash" : "Maosh berish"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 font-medium">
            {error}
          </div>
        )}

        {/* Ustoz Tanlash (Searchable Dropdown) */}
        <div className="space-y-1 relative" ref={dropdownRef}>
          <label className={LABEL_CLS}>Ustoz</label>
          <div
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 flex items-center justify-between cursor-pointer focus-within:ring-2 focus-within:ring-indigo-500/20"
          >
            {selectedTeacher ? (
              <div className="flex items-center gap-2">
                <Avatar name={selectedTeacher.name} size={24} className="text-[10px]" />
                <span className="font-semibold text-slate-900 dark:text-white">
                  {selectedTeacher.name}
                </span>
                <span className="text-slate-400 font-mono">({displayPhone(selectedTeacher.phone)})</span>
              </div>
            ) : (
              <span className="text-slate-400">Ustozni qidiring va tanlang...</span>
            )}
            <Search size={14} className="text-slate-400" />
          </div>

          {/* Dropdown Menu with Search input */}
          {isDropdownOpen && (
            <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
              <div className="p-2 bg-slate-50 dark:bg-slate-800/60">
                <input
                  type="text"
                  value={teacherSearch}
                  onChange={(e) => setTeacherSearch(e.target.value)}
                  placeholder="Ism, fan yoki telefon bo'yicha qidiruv..."
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                  autoFocus
                />
              </div>
              <div className="max-h-52 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800/40">
                {filteredTeachersForDropdown.length === 0 ? (
                  <div className="p-3 text-center text-slate-400">Ustoz topilmadi</div>
                ) : (
                  filteredTeachersForDropdown.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => {
                        setSelectedTeacherId(String(t.id));
                        setTeacherSearch(t.name);
                        setIsDropdownOpen(false);
                      }}
                      className={`p-2.5 flex items-center justify-between hover:bg-indigo-50/50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors ${
                        String(t.id) === String(selectedTeacherId)
                          ? "bg-indigo-50 dark:bg-indigo-950/40"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Avatar name={t.name} size={28} className="text-[10px]" />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white text-xs">
                            {t.name}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                            {displayPhone(t.phone)} · {t.subject || "Ustoz"}
                          </div>
                        </div>
                      </div>
                      {String(t.id) === String(selectedTeacherId) && (
                        <Check size={14} className="text-indigo-600" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Summa (Narx) */}
        <div className="space-y-1">
          <label className={LABEL_CLS}>To'lov summasi</label>
          <MoneyInput
            value={amount}
            onChange={(val) => setAmount(val)}
            placeholder="0"
            className={INPUT_CLS}
            autoFocus={!initialTeacher}
          />
        </div>

        {/* Maosh turi & To'lov usuli (2 Columns) */}
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

export function TeachersHR({
  scopeBranches = [],
  scopeBranchIds,
  currentBranchId,
  directorData = { teachersHR: [], branches: [], teacherPayments: [] },
  opData = {},
  openModal = () => {},
  openTeacherModal,
  openPayrollModal,
  openTeacherProfile,
  onDeleteTeacher,
  onRefresh,
  addToast = () => {},
  goTo,
  canEdit = true,
}) {
  // Top bar menu tabs: 'teachers' | 'assistants' | 'salaries'
  const [activeTab, setActiveTab] = useState("teachers");

  // Filter states for Teachers & Assistants
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState(
    currentBranchId || "all",
  );
  const [salaryTypeFilter, setSalaryTypeFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Active 3-dots dropdown state
  const [openActionMenuId, setOpenActionMenuId] = useState(null);
  // SMS modal state
  const [smsTeacher, setSmsTeacher] = useState(null);

  // Salary Payment State
  const [salarySearchQuery, setSalarySearchQuery] = useState("");
  const [salaryPhoneQuery, setSalaryPhoneQuery] = useState("");
  const [salaryDateFrom, setSalaryDateFrom] = useState("");
  const [salaryDateTo, setSalaryDateTo] = useState("");
  const [salaryTypeFilterVal, setSalaryTypeFilterVal] = useState("all");
  const [salaryCurrentPage, setSalaryCurrentPage] = useState(1);
  const salaryItemsPerPage = 50;

  // Salary Modals
  const [salaryModalOpen, setSalaryModalOpen] = useState(false);
  const [selectedTeacherForPay, setSelectedTeacherForPay] = useState(null);
  const [editingPayment, setEditingPayment] = useState(null);
  const [receiptPayment, setReceiptPayment] = useState(null);
  const [deletingPayment, setDeletingPayment] = useState(null);
  const [deletingLoading, setDeletingLoading] = useState(false);

  // Payment Methods from storage
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

  useEffect(() => {
    if (currentBranchId !== undefined) {
      setSelectedBranchId(currentBranchId);
    }
  }, [currentBranchId]);

  // Reset page when any teacher filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [
    activeTab,
    searchQuery,
    selectedBranchId,
    salaryTypeFilter,
    groupFilter,
  ]);

  // Reset salary page when salary filters change
  useEffect(() => {
    setSalaryCurrentPage(1);
  }, [
    salarySearchQuery,
    salaryPhoneQuery,
    salaryDateFrom,
    salaryDateTo,
    salaryTypeFilterVal,
  ]);

  const month = thisMonthKey();

  // Helper to get teacher's active groups and students
  function getTeacherGroupsAndStudents(teacherId) {
    const tIdStr = String(teacherId);
    const groups = opGroups(opData).filter(
      (g) => String(g.teacherHrId || g.teacherId) === tIdStr,
    );
    const students = opStudentsInGroups(
      opData,
      groups.map((g) => g.id),
    );
    return { groups, students };
  }

  // Helper to get teacher's retention percentage
  function getTeacherRetention(teacher, groupsCount, studentsCount) {
    if (teacher.retentionRate !== undefined) return teacher.retentionRate;
    if (groupsCount === 0) return 0;
    const base =
      82 + (Number(teacher.rating) || 4.5) * 2.5 + (studentsCount % 7);
    return Math.min(99, Math.max(65, Math.round(base)));
  }

  const allBranchesCount = (directorData?.branches || scopeBranches || []).length;
  const effectiveScopeBranchIds = useMemo(() => {
    if (selectedBranchId && selectedBranchId !== "all") return [selectedBranchId];
    if (currentBranchId && currentBranchId !== "all") return [currentBranchId];
    return scopeBranches.map((b) => b.id);
  }, [selectedBranchId, currentBranchId, scopeBranches]);

  // All scoped teachers
  const allScopedTeachers = useMemo(() => {
    return filterTeachersByBranch(
      directorData.teachersHR || [],
      effectiveScopeBranchIds,
      opGroups(opData),
      directorData.courses || [],
      allBranchesCount
    );
  }, [directorData.teachersHR, effectiveScopeBranchIds, opData, directorData.courses, allBranchesCount]);

  // Separate main teachers vs support/assistant teachers
  const tabTeachers = useMemo(() => {
    if (activeTab === "assistants") {
      return allScopedTeachers.filter(
        (t) =>
          t.isAssistant === true ||
          t.role === "assistant" ||
          t.type === "assistant" ||
          t.isSupport === true ||
          t.name?.toLowerCase().includes("assistent") ||
          t.name?.toLowerCase().includes("support"),
      );
    }
    return allScopedTeachers.filter(
      (t) =>
        !t.isAssistant &&
        t.role !== "assistant" &&
        t.type !== "assistant" &&
        !t.isSupport,
    );
  }, [allScopedTeachers, activeTab]);

  // Available groups for filter dropdown
  const availableGroups = useMemo(() => {
    return opGroups(opData);
  }, [opData]);

  // Filtered teachers
  const filteredTeachers = useMemo(() => {
    return tabTeachers.filter((t) => {
      // 1. Ism yoki telefon qidiruvi
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = t.name?.toLowerCase().includes(q);
        const matchPhone = t.phone?.toLowerCase().includes(q);
        if (!matchName && !matchPhone) return false;
      }

      // 2. Maosh turi bo'yicha filter
      if (salaryTypeFilter !== "all") {
        if (salaryTypeFilter === "percent" && t.salaryType !== "percent")
          return false;
        if (salaryTypeFilter === "fixed" && t.salaryType !== "fixed")
          return false;
        if (
          salaryTypeFilter === "per_student" &&
          t.salaryType !== "per_student"
        )
          return false;
      }

      // 3. Guruh bo'yicha filter
      if (groupFilter !== "all") {
        const { groups } = getTeacherGroupsAndStudents(t.id);
        if (groupFilter === "has_group" && groups.length === 0) return false;
        if (groupFilter === "no_group" && groups.length > 0) return false;
        if (
          groupFilter !== "has_group" &&
          groupFilter !== "no_group" &&
          !groups.some((g) => String(g.id) === String(groupFilter))
        ) {
          return false;
        }
      }

      return true;
    });
  }, [tabTeachers, searchQuery, salaryTypeFilter, groupFilter, opData]);

  // Statistics for 4 KPI Cards
  const stats = useMemo(() => {
    const totalTeachers = tabTeachers.length;
    let withGroupsCount = 0;
    let withoutGroupsCount = 0;
    let totalStudents = 0;
    let totalGroups = 0;
    let totalRetentionSum = 0;
    let totalAccruedShare = 0;

    tabTeachers.forEach((t) => {
      const { groups, students } = getTeacherGroupsAndStudents(t.id);
      if (groups.length > 0) withGroupsCount++;
      else withoutGroupsCount++;

      totalStudents += students.length;
      totalGroups += groups.length;
      totalRetentionSum += getTeacherRetention(t, groups.length, students.length);

      const payStats = getTeacherPayStats(directorData, opData, t, null, month);
      totalAccruedShare += (payStats.expectedPay || 0);
    });

    const avgRetention =
      totalTeachers > 0 ? totalRetentionSum / totalTeachers : 0;

    return {
      totalTeachers,
      withGroupsCount,
      withoutGroupsCount,
      totalStudents,
      totalGroups,
      avgRetention,
      totalAccruedShare,
    };
  }, [tabTeachers, opData, directorData, month]);

  // Pagination for Teachers List
  const totalPages = Math.max(
    1,
    Math.ceil(filteredTeachers.length / itemsPerPage),
  );
  const paginatedTeachers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTeachers.slice(start, start + itemsPerPage);
  }, [filteredTeachers, currentPage]);

  // --------------------------------------------------------------------------
  // Teacher Salary Payment Records & Calculations
  // --------------------------------------------------------------------------
  const allTeacherSalaryPayments = useMemo(() => {
    const rawPayments = directorData?.teacherPayments || [];
    return rawPayments
      .map((p) => {
        const teacher = (directorData?.teachersHR || []).find(
          (t) => String(t.id) === String(p.teacherHRId || p.teacherId)
        );
        return {
          ...p,
          teacherName: teacher?.name || p.teacherName || "Noma'lum ustoz",
          teacherPhone: teacher?.phone || "",
          teacherSubject: teacher?.subject || "",
          teacherPhoto: teacher?.photo || null,
          teacherBranchId: teacher?.branchId || null,
          teacherObj: teacher || null,
        };
      })
      .sort((a, b) => {
        const dateA = new Date(a.date || a.createdAt || 0).getTime();
        const dateB = new Date(b.date || b.createdAt || 0).getTime();
        return dateB - dateA;
      });
  }, [directorData?.teacherPayments, directorData?.teachersHR]);

  // Filtered Teacher Salary Payments
  const filteredSalaryPayments = useMemo(() => {
    return allTeacherSalaryPayments.filter((p) => {
      // 1. Ism filter
      if (salarySearchQuery.trim()) {
        const q = salarySearchQuery.toLowerCase();
        if (!p.teacherName.toLowerCase().includes(q)) return false;
      }

      // 2. Raqam filter
      if (salaryPhoneQuery.trim()) {
        const q = salaryPhoneQuery.toLowerCase();
        if (!p.teacherPhone.toLowerCase().includes(q)) return false;
      }

      // 3. Sana oralig'i
      if (salaryDateFrom) {
        if ((p.date || "") < salaryDateFrom) return false;
      }
      if (salaryDateTo) {
        if ((p.date || "") > salaryDateTo) return false;
      }

      // 4. Maosh turi
      if (salaryTypeFilterVal !== "all") {
        if (
          salaryTypeFilterVal === "advance" &&
          p.type !== "advance" &&
          !p.type?.toLowerCase().includes("avans")
        ) {
          return false;
        }
        if (
          salaryTypeFilterVal === "salary" &&
          p.type !== "salary" &&
          !p.type?.toLowerCase().includes("oylik")
        ) {
          return false;
        }
        if (
          salaryTypeFilterVal === "bonus" &&
          p.type !== "bonus" &&
          !p.type?.toLowerCase().includes("bonus")
        ) {
          return false;
        }
        if (
          !["advance", "salary", "bonus"].includes(salaryTypeFilterVal) &&
          p.paymentMethod !== salaryTypeFilterVal
        ) {
          return false;
        }
      }

      return true;
    });
  }, [
    allTeacherSalaryPayments,
    salarySearchQuery,
    salaryPhoneQuery,
    salaryDateFrom,
    salaryDateTo,
    salaryTypeFilterVal,
  ]);

  // Salary KPIs (Jami Card)
  const salaryKPIs = useMemo(() => {
    const totalPaid = filteredSalaryPayments.reduce(
      (sum, p) => sum + (Number(p.amount) || 0),
      0
    );
    const count = filteredSalaryPayments.length;
    const avg = count > 0 ? Math.round(totalPaid / count) : 0;
    return { totalPaid, count, avg };
  }, [filteredSalaryPayments]);

  // Salary Pagination (50 tagacha ko'rinadi)
  const salaryTotalPages = Math.max(
    1,
    Math.ceil(filteredSalaryPayments.length / salaryItemsPerPage)
  );
  const paginatedSalaryPayments = useMemo(() => {
    const start = (salaryCurrentPage - 1) * salaryItemsPerPage;
    return filteredSalaryPayments.slice(start, start + salaryItemsPerPage);
  }, [filteredSalaryPayments, salaryCurrentPage, salaryItemsPerPage]);

  // Clear salary filters
  function handleClearSalaryFilters() {
    setSalarySearchQuery("");
    setSalaryPhoneQuery("");
    setSalaryDateFrom("");
    setSalaryDateTo("");
    setSalaryTypeFilterVal("all");
    setSalaryCurrentPage(1);
  }

  // Delete payment confirmation
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

  // Clear teacher filters
  function handleClearFilters() {
    setSearchQuery("");
    setSelectedBranchId(currentBranchId || "all");
    setSalaryTypeFilter("all");
    setGroupFilter("all");
    setCurrentPage(1);
  }

  // Export teachers to Excel
  function handleExportExcel() {
    try {
      const dataToExport = filteredTeachers.map((t, idx) => {
        const { groups, students } = getTeacherGroupsAndStudents(t.id);
        const branch = directorData.branches.find((b) => b.id === t.branchId);
        return {
          "№": idx + 1,
          "Ism-Familiya": t.name,
          Telefon: t.phone,
          Filial: branch?.name || "-",
          "Yo'nalish": t.subject || "-",
          "Guruhlar soni": groups.length,
          "O'quvchilar soni": students.length,
          "Maosh turi":
            t.salaryType === "fixed"
              ? "Belgilangan (Fixed)"
              : t.salaryType === "per_student"
              ? "Har bir o'quvchi uchun"
              : "Foizli ulush (%)",
          Reyting: t.rating || 5.0,
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Ustozlar");
      XLSX.writeFile(
        workbook,
        `Ustozlar_${new Date().toISOString().slice(0, 10)}.xlsx`,
      );
    } catch (error) {
      console.error("Export error:", error);
    }
  }

  // Export teacher salaries to Excel
  function handleExportSalariesExcel() {
    try {
      const dataToExport = filteredSalaryPayments.map((p, idx) => ({
        "№": idx + 1,
        Ustoz: p.teacherName,
        Telefon: p.teacherPhone || "-",
        Sana: p.date || todayISO(),
        "Narx (UZS)": Number(p.amount || 0),
        "Maosh turi":
          p.type === "advance"
            ? "Avans to'lovi"
            : p.type === "bonus"
            ? "Bonus / Mukofot"
            : "Oylik maosh",
        "To'lov usuli": p.paymentMethod || "Naqd pul",
        Izoh: p.note || "-",
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Ustozlar_Maoshi");
      XLSX.writeFile(
        workbook,
        `Ustozlar_Maoshi_${new Date().toISOString().slice(0, 10)}.xlsx`,
      );
    } catch (error) {
      console.error("Salaries export error:", error);
    }
  }

  return (
    <div className="space-y-4">
      {/* Top Header & 3 Main Navigation Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Ustozlar boshqaruvi
            </h1>
          </div>

          {/* Top Sub-Menu Tabs: O'qituvchilar, Support o'qituvchilar & Ish haqi */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("teachers")}
              className={`py-2 px-3.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === "teachers"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              <Users size={15} /> O'qituvchilar
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold">
                {
                  allScopedTeachers.filter(
                    (t) =>
                      !t.isAssistant &&
                      t.role !== "assistant" &&
                      t.type !== "assistant" &&
                      !t.isSupport,
                  ).length
                }
              </span>
            </button>

            <button
              onClick={() => setActiveTab("assistants")}
              className={`py-2 px-3.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === "assistants"
                  ? "bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              <UserCheck size={15} /> Support o'qituvchilar
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 font-semibold">
                {
                  allScopedTeachers.filter(
                    (t) =>
                      t.isAssistant === true ||
                      t.role === "assistant" ||
                      t.type === "assistant" ||
                      t.isSupport === true ||
                      t.name?.toLowerCase().includes("assistent") ||
                      t.name?.toLowerCase().includes("support"),
                  ).length
                }
              </span>
            </button>

            <button
              onClick={() => setActiveTab("salaries")}
              className={`py-2 px-3.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === "salaries"
                  ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              <Wallet size={15} /> Ish haqi va to'lovlar
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-semibold">
                {(directorData?.teacherPayments || []).length}
              </span>
            </button>
          </div>
        </div>

        {canEdit && (
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {activeTab === "salaries" ? (
              <>
                <ExcelButton
                  onExport={handleExportSalariesExcel}
                  title="Maoshlar Excel amallari"
                  exportLabel="Maoshlar ro'yxatini eksport qilish"
                  showImport={false}
                />
                <PrimaryButton
                  onClick={() => {
                    setEditingPayment(null);
                    setSelectedTeacherForPay(null);
                    setSalaryModalOpen(true);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Plus size={16} /> Maosh berish
                </PrimaryButton>
              </>
            ) : (
              <>
                <ExcelButton
                  onExport={handleExportExcel}
                  onImport={() => openModal({ type: "importTeachers" })}
                  title="Ustozlar Excel amallari"
                  exportLabel="Ustozlar ro'yxatini eksport qilish"
                  importLabel="Excel'dan ustozlarni import qilish"
                />
                <PrimaryButton
                  onClick={() => {
                    setEditingPayment(null);
                    setSelectedTeacherForPay(null);
                    setSalaryModalOpen(true);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Wallet size={16} /> Maosh berish
                </PrimaryButton>
                <PrimaryButton
                  onClick={() =>
                    openModal({
                      type:
                        activeTab === "assistants"
                          ? "supportTeacherForm"
                          : "teacherHRForm",
                    })
                  }
                >
                  <Plus size={16} />{" "}
                  {activeTab === "assistants"
                    ? "Support ustoz qo'shish"
                    : "Yangi ustoz qo'shish"}
                </PrimaryButton>
              </>
            )}
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* 1 & 2. O'QITUVCHILAR VA SUPPORT USTOZLAR RO'YXATI                      */}
      {/* ===================================================================== */}
      {activeTab !== "salaries" ? (
        <>
          {/* 4 Top KPI Cards (Only in Teachers tab) */}
          {activeTab === "teachers" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Card 1: Ustozlar */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-xl shadow-xs space-y-1">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
                  <span>Ustozlar</span>
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Users size={15} />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {stats.totalTeachers} <span className="text-xs font-medium text-slate-400">ta</span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/80 font-medium flex items-center justify-between">
                  <span>{stats.withGroupsCount} tasi guruhli</span>
                  <span className="text-slate-400">{stats.withoutGroupsCount} tasi guruhsiz</span>
                </div>
              </div>

              {/* Card 2: Jami ulush */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-xl shadow-xs space-y-1">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
                  <span>Jami ulush</span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Wallet size={15} />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {money(stats.totalAccruedShare)}{" "}
                  <span className="text-xs font-medium text-slate-400">UZS</span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/80 font-medium">
                  <span>{formatUzbekMonthYear(month)} uchun hisoblangan</span>
                </div>
              </div>

              {/* Card 3: Guruhdagi o'quvchi soni */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-xl shadow-xs space-y-1">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
                  <span>Guruhdagi o'quvchi soni</span>
                  <div className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                    <GraduationCap size={15} />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-sky-600 dark:text-sky-400">
                  {stats.totalStudents} <span className="text-xs font-medium text-slate-400">o'quvchi</span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/80 font-medium">
                  <span>{stats.totalGroups} ta guruh bo'ylab</span>
                </div>
              </div>

              {/* Card 4: O'rtacha retention */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-xl shadow-xs space-y-1">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
                  <span>O'rtacha retention</span>
                  <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Sparkles size={15} />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
                  {stats.avgRetention.toFixed(1)}%
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/80 font-medium">
                  <span>{formatUzbekMonthYear(month)} uchun</span>
                </div>
              </div>
            </div>
          )}

          {/* Filter & Search Bar - Strictly single row */}
          <div className="flex items-center gap-2.5 bg-white dark:bg-slate-900 p-2 sm:p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-x-auto">
            {/* Ism / Nomer bo'yicha qidiruv */}
            <div className="relative w-52 sm:w-60 shrink-0">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ism yoki telefon..."
                className="w-full bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Select filters in the same single row */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Filial filter */}
              {scopeBranches.length > 1 && (
                <select
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="w-auto min-w-[120px] bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  <option value="all">Barcha filiallar</option>
                  {scopeBranches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              )}

              {/* Maosh turi bo'yicha filter */}
              <select
                value={salaryTypeFilter}
                onChange={(e) => setSalaryTypeFilter(e.target.value)}
                className="w-auto min-w-[130px] bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="all">Maosh turi</option>
                <option value="percent">Foizli ulush (%)</option>
                <option value="per_student">Har bir o'quvchi uchun</option>
                <option value="fixed">Belgilangan (Fixed)</option>
              </select>

              {/* Guruh bo'yicha filter */}
              <select
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value)}
                className="w-auto min-w-[140px] bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="all">Guruhlar</option>
                <option value="has_group">Guruhli ustozlar</option>
                <option value="no_group">Guruhsiz ustozlar</option>
                <optgroup label="Aniq guruh">
                  {availableGroups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </optgroup>
              </select>

              {/* Tozalash (Reset filters) button */}
              {(searchQuery ||
                selectedBranchId !== (currentBranchId || "all") ||
                salaryTypeFilter !== "all" ||
                groupFilter !== "all") && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer shrink-0"
                  title="Filtrlarni tozalash"
                >
                  <RotateCcw size={12} /> Tozalash
                </button>
              )}
            </div>
          </div>

          {/* Teachers Main Table (th - tr) */}
          {filteredTeachers.length === 0 ? (
            <EmptyState
              icon={GraduationCap}
              title={
                searchQuery || salaryTypeFilter !== "all" || groupFilter !== "all"
                  ? "So'rov bo'yicha ustoz topilmadi"
                  : activeTab === "assistants"
                  ? "Support o'qituvchilar ro'yxati bo'sh"
                  : "Hali o'qituvchilar qo'shilmagan"
              }
              subtitle={
                searchQuery
                  ? "Qidiruv yoki filter parametrlarini tozalab ko'ring."
                  : "Yangi o'qituvchi qo'shish orqali ro'yxatni shakllantiring."
              }
            />
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs min-h-[260px]">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold text-xs border-b border-slate-200 dark:border-slate-800">
                    {activeTab === "assistants" ? (
                      <tr>
                        <th className="py-3 px-4">Support ustoz</th>
                        <th className="py-3 px-3">Biriktirilgan ustoz</th>
                        <th className="py-3 px-3">Ish kunlari</th>
                        <th className="py-3 px-3">Ish vaqti</th>
                        <th className="py-3 px-3">Ish haqi</th>
                        <th className="py-3 px-3 text-center">Reyting</th>
                        <th className="py-3 px-4 text-right">Amallar</th>
                      </tr>
                    ) : (
                      <tr>
                        <th className="py-3 px-4">Ism-Familiya</th>
                        <th className="py-3 px-3 text-center">Guruhlar</th>
                        <th className="py-3 px-3 text-center">O'quvchilar</th>
                        <th className="py-3 px-3">Ish haqi</th>
                        <th className="py-3 px-4 min-w-[150px]">Retention</th>
                        <th className="py-3 px-3 text-center">Reyting</th>
                        <th className="py-3 px-4 text-right">Amallar</th>
                      </tr>
                    )}
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                    {paginatedTeachers.map((t) => {
                      const branch = directorData.branches.find(
                        (b) => b.id === t.branchId,
                      );
                      const payStats = getTeacherPayStats(
                        directorData,
                        opData,
                        t,
                        branch,
                        month,
                      );
                      const { groups, students } = getTeacherGroupsAndStudents(
                        t.id,
                      );
                      const retentionVal = getTeacherRetention(
                        t,
                        groups.length,
                        students.length,
                      );

                      const assignedTeacher = t.assignedTeacherId
                        ? (directorData.teachersHR || []).find(
                            (at) => String(at.id) === String(t.assignedTeacherId),
                          )
                        : null;

                      const daysMap = {
                        mon: "Du",
                        tue: "Se",
                        wed: "Chor",
                        thu: "Pay",
                        fri: "Jum",
                        sat: "Shan",
                        sun: "Yak",
                      };

                      const isMenuOpen = openActionMenuId === t.id;

                      return (
                        <tr
                          key={t.id}
                          className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors ${
                            isMenuOpen ? "relative z-30" : ""
                          }`}
                        >
                          {/* Ism-Familiya */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              {t.photo ? (
                                <img
                                  src={t.photo}
                                  alt={t.name}
                                  className="w-9 h-9 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700 cursor-pointer"
                                  onClick={() => (openTeacherProfile || openPayrollModal)?.(t)}
                                />
                              ) : (
                                <Avatar
                                  name={t.name}
                                  color={branch?.color || "#6366f1"}
                                  size={36}
                                  className="font-bold shrink-0 cursor-pointer"
                                  onClick={() => (openTeacherProfile || openPayrollModal)?.(t)}
                                />
                              )}
                              <div>
                                <div
                                  onClick={() => (openTeacherProfile || openPayrollModal)?.(t)}
                                  className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                >
                                  {t.name}
                                  {branch && (
                                    <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                      {branch.name}
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                                  {displayPhone(t.phone)}
                                </div>
                              </div>
                            </div>
                          </td>

                          {activeTab === "assistants" ? (
                            <>
                              {/* Biriktirilgan ustoz */}
                              <td className="py-3 px-3">
                                {assignedTeacher ? (
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                                      {assignedTeacher.name}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-xs text-slate-400 font-medium">
                                    Biriktirilmagan
                                  </span>
                                )}
                              </td>

                              {/* Ish kunlari */}
                              <td className="py-3 px-3">
                                <div className="flex flex-wrap gap-1 max-w-[160px]">
                                  {Array.isArray(t.workingDays) && t.workingDays.length > 0 ? (
                                    t.workingDays.map((d) => (
                                      <span
                                        key={d}
                                        className="px-1.5 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold text-[10px] border border-purple-200/60 dark:border-purple-900/40"
                                      >
                                        {daysMap[d] || d}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-xs text-slate-400">
                                      Belgilanmagan
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Ish vaqti */}
                              <td className="py-3 px-3">
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                                  <Clock size={12} className="text-purple-500" />
                                  {t.workingHours ||
                                    (t.startTime && t.endTime
                                      ? `${t.startTime} - ${t.endTime}`
                                      : "09:00 - 18:00")}
                                </span>
                              </td>
                            </>
                          ) : (
                            <>
                              {/* Guruhlar soni */}
                              <td className="py-3 px-3 text-center">
                                <span className="font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg text-xs">
                                  {groups.length} ta
                                </span>
                              </td>

                              {/* O'quvchilar soni */}
                              <td className="py-3 px-3 text-center">
                                <span className="font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg text-xs">
                                  {students.length} ta
                                </span>
                              </td>
                            </>
                          )}

                          {/* Ish haqi */}
                          <td className="py-3 px-3">
                            <div className="space-y-0.5">
                              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                {t.salaryType === "fixed"
                                  ? `${money(t.fixedSalary || 0)} so'm (Fixed)`
                                  : t.salaryType === "per_student"
                                  ? `${money(t.perStudentSalary || 0)} so'm / o'quvchi`
                                  : (() => {
                                      if (groups.length > 0) {
                                        const groupPercents = groups.map((g) =>
                                          Number(g.teacherSalaryPercent ?? t.revenueSharePercent ?? 0)
                                        );
                                        const avgPercent = Math.round(
                                          groupPercents.reduce((sum, p) => sum + p, 0) / groupPercents.length
                                        );
                                        return `${avgPercent}% ulush`;
                                      }
                                      return `${t.revenueSharePercent ?? 0}% ulush`;
                                    })()}
                              </div>
                              {activeTab === "teachers" && (
                                <button
                                  type="button"
                                  onClick={() => openPayrollModal?.(t)}
                                  className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold hover:underline block text-left"
                                >
                                  Hissobi: {money(payStats.expectedPay)} UZS
                                </button>
                              )}
                            </div>
                          </td>

                          {/* Retention (Progress bar) - Only for main teachers */}
                          {activeTab === "teachers" && (
                            <td className="py-3 px-4">
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs font-bold">
                                  <span
                                    className={
                                      retentionVal >= 85
                                        ? "text-emerald-600 dark:text-emerald-400"
                                        : retentionVal >= 70
                                        ? "text-amber-600 dark:text-amber-400"
                                        : "text-rose-600 dark:text-rose-400"
                                    }
                                  >
                                    {retentionVal}%
                                  </span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-300 ${
                                      retentionVal >= 85
                                        ? "bg-emerald-500"
                                        : retentionVal >= 70
                                        ? "bg-amber-500"
                                        : "bg-rose-500"
                                    }`}
                                    style={{ width: `${retentionVal}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                          )}

                          {/* Reyting */}
                          <td className="py-3 px-3 text-center">
                            <div className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-lg border border-amber-200/60 dark:border-amber-900/40 text-amber-600 dark:text-amber-400 font-bold text-xs">
                              <Star size={12} className="fill-amber-400 text-amber-400" />
                              <span>{t.rating || 5.0}</span>
                            </div>
                          </td>

                          {/* Amallar */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {/* Quick Maosh berish button */}
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingPayment(null);
                                  setSelectedTeacherForPay(t);
                                  setSalaryModalOpen(true);
                                }}
                                className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 rounded-lg transition-colors cursor-pointer"
                                title="Maosh berish"
                              >
                                <Wallet size={15} />
                              </button>

                              {/* Action Menu */}
                              <TeacherActionMenu
                                t={t}
                                canEdit={canEdit}
                                activeTab={activeTab}
                                openModal={openModal}
                                openTeacherProfile={openTeacherProfile || openPayrollModal}
                                setSmsTeacher={setSmsTeacher}
                                onPay={() => {
                                  setEditingPayment(null);
                                  setSelectedTeacherForPay(t);
                                  setSalaryModalOpen(true);
                                }}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination bar (20 ta o'qituvchi) */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 px-4 py-3 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs">
                <div className="text-slate-500 dark:text-slate-400">
                  Jami <span className="font-bold text-slate-800 dark:text-slate-200">{filteredTeachers.length}</span> ta ustozdan{" "}
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {(currentPage - 1) * itemsPerPage + 1}-
                    {Math.min(currentPage * itemsPerPage, filteredTeachers.length)}
                  </span>{" "}
                  ko'rsatilmoqda
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={`w-7 h-7 rounded-lg font-bold text-xs transition-all ${
                            currentPage === page
                              ? "bg-indigo-600 text-white shadow-xs"
                              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                        >
                          {page}
                        </button>
                      ),
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        /* =================================================================== */
        /* 3. ISH HAQI VA TO'LOVLAR RO'YXATI (SALARIES VIEW)                   */
        /* =================================================================== */
        <div className="space-y-4">
          {/* Summary KPIs (Jami Card) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-xl shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
                <span>Jami to'langan maosh</span>
                <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CreditCard size={15} />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {money(salaryKPIs.totalPaid)} <span className="text-xs font-medium text-slate-400">so'm</span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/80 font-medium">
                Berilgan barcha oylik va avanslar
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-xl shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
                <span>To'lovlar soni</span>
                <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Users size={15} />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {salaryKPIs.count} <span className="text-xs font-medium text-slate-400">ta to'lov</span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/80 font-medium">
                Filtrdagi tranzaksiyalar
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-xl shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
                <span>O'rtacha to'lov miqdori</span>
                <div className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                  <TrendingUp size={15} />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-sky-600 dark:text-sky-400">
                {money(salaryKPIs.avg)} <span className="text-xs font-medium text-slate-400">so'm</span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/80 font-medium">
                Bitta tranzaksiya bo'yicha o'rtacha
              </div>
            </div>
          </div>

          {/* Filters: ism, raqam, sanadan sanagacha, maosh turi, tozalash */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 sm:p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-x-auto">
            {/* Ism */}
            <div className="relative w-44 sm:w-52 shrink-0">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={salarySearchQuery}
                onChange={(e) => setSalarySearchQuery(e.target.value)}
                placeholder="Ustoz ismi..."
                className="w-full bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>

            {/* Raqam */}
            <div className="relative w-36 sm:w-44 shrink-0">
              <Phone
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={salaryPhoneQuery}
                onChange={(e) => setSalaryPhoneQuery(e.target.value)}
                placeholder="Telefon..."
                className="w-full bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>

            {/* Sanadan */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-xs text-slate-400 font-medium">Dan:</span>
              <input
                type="date"
                value={salaryDateFrom}
                onChange={(e) => setSalaryDateFrom(e.target.value)}
                className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>

            {/* Sanagacha */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-xs text-slate-400 font-medium">Gacha:</span>
              <input
                type="date"
                value={salaryDateTo}
                onChange={(e) => setSalaryDateTo(e.target.value)}
                className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>

            {/* Maosh turi */}
            <select
              value={salaryTypeFilterVal}
              onChange={(e) => setSalaryTypeFilterVal(e.target.value)}
              className="min-w-[130px] shrink-0 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            >
              <option value="all">Maosh turi</option>
              <option value="salary">Oylik maosh</option>
              <option value="advance">Avans</option>
              <option value="bonus">Bonus / Mukofot</option>
              <optgroup label="To'lov usuli bo'yicha">
                {paymentMethods.map((pm) => (
                  <option key={pm.id} value={pm.name}>
                    {pm.name}
                  </option>
                ))}
              </optgroup>
            </select>

            {/* Tozalash */}
            {(salarySearchQuery ||
              salaryPhoneQuery ||
              salaryDateFrom ||
              salaryDateTo ||
              salaryTypeFilterVal !== "all") && (
              <button
                type="button"
                onClick={handleClearSalaryFilters}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer shrink-0"
                title="Filtrlarni tozalash"
              >
                <RotateCcw size={12} /> Tozalash
              </button>
            )}
          </div>

          {/* Table: Tr, Hodim, Sana, Narx, To'lov usuli, Izoh, Amallar */}
          {filteredSalaryPayments.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title="To'lovlar topilmadi"
              subtitle="Qidiruv parametrlarini tozalang yoki yangi maosh to'lovini qo'shing."
            />
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs min-h-[260px]">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold text-xs border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-3 px-3 w-12 text-center">Tr</th>
                      <th className="py-3 px-4">Ustoz</th>
                      <th className="py-3 px-3">Sana</th>
                      <th className="py-3 px-3">Narx</th>
                      <th className="py-3 px-3">To'lov usuli</th>
                      <th className="py-3 px-3">Izoh</th>
                      <th className="py-3 px-4 text-right">Amallar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                    {paginatedSalaryPayments.map((p, idx) => {
                      const rowNumber =
                        (salaryCurrentPage - 1) * salaryItemsPerPage + idx + 1;
                      const dateFormatted = p.date ? formatDate(p.date) : "-";
                      const isAdvance =
                        p.type === "advance" ||
                        p.type?.toLowerCase().includes("avans");
                      const isBonus =
                        p.type === "bonus" ||
                        p.type?.toLowerCase().includes("bonus");

                      return (
                        <tr
                          key={p.id || idx}
                          className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          {/* Tr */}
                          <td className="py-3 px-3 text-center text-xs font-mono text-slate-400">
                            {rowNumber}
                          </td>

                          {/* Hodim (Ustoz) - click opens profile/payroll */}
                          <td className="py-3 px-4">
                            <div
                              onClick={() => {
                                if (p.teacherObj) {
                                  (openTeacherProfile || openPayrollModal)?.(p.teacherObj);
                                }
                              }}
                              className="flex items-center gap-3 cursor-pointer group"
                            >
                              {p.teacherPhoto ? (
                                <img
                                  src={p.teacherPhoto}
                                  alt={p.teacherName}
                                  className="w-8 h-8 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                                />
                              ) : (
                                <Avatar
                                  name={p.teacherName}
                                  size={32}
                                  className="font-bold shrink-0 text-xs"
                                />
                              )}
                              <div>
                                <div className="font-bold text-slate-900 dark:text-white text-xs group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                  {p.teacherName}
                                </div>
                                <div className="text-[11px] text-slate-400 font-mono">
                                  {displayPhone(p.teacherPhone)}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Sana */}
                          <td className="py-3 px-3">
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                              {dateFormatted}
                            </span>
                          </td>

                          {/* Narx */}
                          <td className="py-3 px-3">
                            <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                              {money(p.amount)} so'm
                            </span>
                          </td>

                          {/* To'lov usuli */}
                          <td className="py-3 px-3">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  isAdvance
                                    ? "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/40"
                                    : isBonus
                                    ? "bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-900/40"
                                    : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40"
                                }`}
                              >
                                {isAdvance
                                  ? "Avans"
                                  : isBonus
                                  ? "Bonus"
                                  : "Oylik"}
                              </span>
                              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                                {p.paymentMethod || "Naqd pul"}
                              </span>
                            </div>
                          </td>

                          {/* Izoh */}
                          <td className="py-3 px-3">
                            <span className="text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate block">
                              {p.note || "-"}
                            </span>
                          </td>

                          {/* Amallar */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {/* Chop etish (Receipt) */}
                              <button
                                type="button"
                                onClick={() =>
                                  setReceiptPayment({
                                    payment: p,
                                    teacher: p.teacherObj || {
                                      name: p.teacherName,
                                      phone: p.teacherPhone,
                                      subject: p.teacherSubject,
                                    },
                                  })
                                }
                                className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                title="Chekni chop etish"
                              >
                                <Printer size={15} />
                              </button>

                              {/* Tahrirlash */}
                              {canEdit && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingPayment(p);
                                    setSelectedTeacherForPay(p.teacherObj);
                                    setSalaryModalOpen(true);
                                  }}
                                  className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors cursor-pointer"
                                  title="Tahrirlash"
                                >
                                  <Pencil size={15} />
                                </button>
                              )}

                              {/* O'chirish */}
                              {canEdit && (
                                <button
                                  type="button"
                                  onClick={() => setDeletingPayment(p)}
                                  className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                                  title="O'chirish"
                                >
                                  <Trash2 size={15} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination bar (50 tagacha ko'rinadi) */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 px-4 py-3 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs">
                <div className="text-slate-500 dark:text-slate-400">
                  Jami <span className="font-bold text-slate-800 dark:text-slate-200">{filteredSalaryPayments.length}</span> ta to'lovdan{" "}
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {(salaryCurrentPage - 1) * salaryItemsPerPage + 1}-
                    {Math.min(
                      salaryCurrentPage * salaryItemsPerPage,
                      filteredSalaryPayments.length
                    )}
                  </span>{" "}
                  ko'rsatilmoqda
                </div>

                {salaryTotalPages > 1 && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setSalaryCurrentPage((p) => Math.max(1, p - 1))
                      }
                      disabled={salaryCurrentPage === 1}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {Array.from(
                      { length: salaryTotalPages },
                      (_, i) => i + 1
                    ).map((page) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setSalaryCurrentPage(page)}
                        className={`w-7 h-7 rounded-lg font-bold text-xs transition-all ${
                          salaryCurrentPage === page
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() =>
                        setSalaryCurrentPage((p) =>
                          Math.min(salaryTotalPages, p + 1)
                        )
                      }
                      disabled={salaryCurrentPage === salaryTotalPages}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODALS & DIALOGS                                                      */}
      {/* ===================================================================== */}

      {/* Maosh berish & Tahrirlash Modali */}
      <TeacherSalaryPayModal
        isOpen={salaryModalOpen}
        onClose={() => {
          setSalaryModalOpen(false);
          setEditingPayment(null);
          setSelectedTeacherForPay(null);
        }}
        editingPayment={editingPayment}
        initialTeacher={selectedTeacherForPay}
        teachers={allScopedTeachers}
        paymentMethods={paymentMethods}
        onSaved={() => {
          addToast?.(
            editingPayment
              ? "To'lov ma'lumotlari yangilandi"
              : "Maosh to'lovi muvaffaqiyatli saqlandi",
            "success"
          );
          onRefresh?.();
        }}
      />

      {/* Kassa Chiqim Cheki Modali */}
      {receiptPayment && (
        <TeacherSalaryReceiptModal
          payment={receiptPayment.payment}
          teacher={receiptPayment.teacher}
          onClose={() => setReceiptPayment(null)}
        />
      )}

      {/* To'lovni O'chirish Tasdiqlash Modali */}
      {deletingPayment && (
        <ConfirmModal
          title="To'lovni o'chirish"
          message={`"${deletingPayment.teacherName}" ustozga berilgan ${money(
            deletingPayment.amount
          )} so'mlik to'lovni o'chirmoqchimisiz?`}
          confirmLabel="O'chirish"
          danger
          loading={deletingLoading}
          onConfirm={confirmDeletePayment}
          onClose={() => setDeletingPayment(null)}
        />
      )}

      {/* Custom SMS Modal */}
      {smsTeacher && (
        <SmsModal
          teacher={smsTeacher}
          onClose={() => setSmsTeacher(null)}
        />
      )}
    </div>
  );
}

function TeacherActionMenu({
  t,
  canEdit,
  activeTab,
  openModal,
  openTeacherProfile,
  setSmsTeacher,
  onPay,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const btnRef = useRef(null);

  return (
    <div className="inline-block text-left">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
        title="Amallar"
      >
        <MoreVertical size={16} />
      </button>

      <MorphDropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        triggerRef={btnRef}
        align="right"
        className="w-44 p-1"
      >
        <div className="space-y-0.5 text-xs text-left">
          <button
            onClick={() => {
              setIsOpen(false);
              openTeacherProfile?.(t);
            }}
            className="morph-menu-item w-full px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium flex items-center gap-2 cursor-pointer"
          >
            <UserCheck size={13} className="text-indigo-500" />
            Ustoz profili
          </button>

          {canEdit && (
            <button
              onClick={() => {
                setIsOpen(false);
                openModal({
                  type:
                    activeTab === "assistants" || t.isAssistant
                      ? "supportTeacherForm"
                      : "teacherHRForm",
                  editing: t,
                  teacher: t,
                });
              }}
              className="morph-menu-item w-full px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium flex items-center gap-2 cursor-pointer"
            >
              <Pencil size={13} className="text-indigo-500" />
              Tahrirlash
            </button>
          )}

          <button
            onClick={() => {
              setIsOpen(false);
              setSmsTeacher(t);
            }}
            className="morph-menu-item w-full px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium flex items-center gap-2 cursor-pointer"
          >
            <MessageSquare size={13} className="text-sky-500" />
            SMS yuborish
          </button>

          <button
            onClick={() => {
              setIsOpen(false);
              onPay?.();
            }}
            className="morph-menu-item w-full px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium flex items-center gap-2 cursor-pointer"
          >
            <Wallet size={13} className="text-emerald-500" />
            Maosh berish
          </button>

          <button
            onClick={() => {
              setIsOpen(false);
              openModal({
                type: "teacherPayroll",
                teacherId: t.id,
                teacher: t,
              });
            }}
            className="morph-menu-item w-full px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium flex items-center gap-2 cursor-pointer"
          >
            <CreditCard size={13} className="text-indigo-500" />
            Maosh hisob-kitobi
          </button>

          {canEdit && (
            <button
              onClick={() => {
                setIsOpen(false);
                openModal({
                  type:
                    activeTab === "assistants" || t.isAssistant
                      ? "supportTeacherForm"
                      : "teacherHRForm",
                  editing: { ...t, passwordReset: true },
                  teacher: { ...t, passwordReset: true },
                });
              }}
              className="morph-menu-item w-full px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium flex items-center gap-2 cursor-pointer"
            >
              <Lock size={13} className="text-amber-500" />
              Parol tiklash
            </button>
          )}

          {canEdit && (
            <div className="border-t border-slate-100 dark:border-slate-800 pt-0.5">
              <button
                onClick={() => {
                  setIsOpen(false);
                  openModal({
                    type: "confirm",
                    message: `"${t.name}" ustozni ro'yxatdan o'chirishni tasdiqlaysizmi?`,
                    action: {
                      kind: "deleteTeacherHR",
                      teacherHRId: t.id,
                    },
                  });
                }}
                className="morph-menu-item w-full px-2.5 py-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-medium flex items-center gap-2 cursor-pointer"
              >
                <Trash2 size={13} />
                O'chirish
              </button>
            </div>
          )}
        </div>
      </MorphDropdown>
    </div>
  );
}

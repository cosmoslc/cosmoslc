import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Check,
  Calendar,
  AlertCircle,
  Percent,
  CreditCard,
  Tag,
  Search,
  CheckCircle2,
  X,
  User,
  BookOpen,
  Info,
  Clock,
  Sparkles,
  Wallet,
  ArrowRight,
  Plus,
} from "lucide-react";
import { Modal, Avatar, MoneyInput } from "../components/primitives";
import { INPUT_CLS, LABEL_CLS, PrimaryButton } from "../theme/tokens";
import { opGroups, opStudentsInGroups } from "../utils/dataHelpers";
import {
  money,
  normalizePhone,
  todayISO,
  thisMonthKey,
  getPaymentTotal,
} from "../utils/helpers";
import { calculateStudentGroupFee } from "../../../shared/utils/prorata";

// Default and stored payment methods
function getStoredPaymentMethods(customTypes = []) {
  const defaultMethods = [
    { id: "cash", label: "Naqd pul", icon: "💵" },
    { id: "card", label: "Plastik karta", icon: "💳" },
    { id: "payme", label: "Payme", icon: "🟢" },
    { id: "click", label: "Click", icon: "🔵" },
    { id: "uzum", label: "Uzum / Anor", icon: "🟣" },
    { id: "bank", label: "Bank o'tkazmasi", icon: "🏛️" },
    { id: "balance", label: "Faqat balansdan", icon: "💰" },
  ];

  let list = [...defaultMethods];

  if (Array.isArray(customTypes) && customTypes.length > 0) {
    customTypes.forEach((pt) => {
      const ptLabel = typeof pt === "string" ? pt : pt.name || pt.title || pt.label || "";
      const ptId = typeof pt === "string" ? pt.toLowerCase().replace(/\s+/g, "_") : pt.id || ptLabel.toLowerCase().replace(/\s+/g, "_");
      if (ptId && !list.some((m) => m.id === ptId)) {
        list.push({
          id: ptId,
          label: ptLabel,
          icon: typeof pt === "object" && pt.icon ? pt.icon : "💳",
        });
      }
    });
  }

  try {
    const raw = localStorage.getItem("cosmos_payment_methods_v1") || localStorage.getItem("cosmos_payment_types");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.forEach((item) => {
          const itemLabel = typeof item === "string" ? item : item.name || item.label || item.title;
          const itemId = typeof item === "string" ? item.toLowerCase().replace(/\s+/g, "_") : item.id || (itemLabel ? itemLabel.toLowerCase().replace(/\s+/g, "_") : "");
          if (itemId && !list.some((m) => m.id === itemId)) {
            list.push({ id: itemId, label: itemLabel, icon: "💳" });
          }
        });
      }
    }
  } catch (e) {
    console.error("Payment methods read error:", e);
  }

  return list;
}

const DEFAULT_PRESET_TAGS = [
  "Aprel yangi",
  "Aksiya",
  "Eski qarzdorlik",
  "Chek",
  "Kashbek",
  "Yangi talaba",
  "Aprel",
];

export function RecordPaymentModal({
  // Accept all possible prop naming aliases across the app
  initialStudentId,
  preselectedStudent,
  student,
  studentId: propStudentId,

  initialGroupId,
  preselectedGroup,
  group,
  groupId: propGroupId,

  initialMonth,
  month: propMonth,

  initialAmount,
  amount: propAmount,

  students: propStudents,
  groups: propGroups,

  scopeBranches = [],
  directorData = {},
  opData = {},
  paymentMethods = [],
  onSubmit,
  onClose,
}) {
  // Resolved props
  const resolvedStudent = preselectedStudent || student;
  const resolvedGroup = preselectedGroup || group;
  const targetStudentId = initialStudentId || propStudentId || resolvedStudent?.id || "";
  const targetGroupId = initialGroupId || propGroupId || resolvedGroup?.id || "";
  const targetMonth = initialMonth || propMonth || thisMonthKey();
  const targetAmount = initialAmount || propAmount || "";

  const [search, setSearch] = useState("");
  const [studentId, setStudentId] = useState(targetStudentId);
  const [groupId, setGroupId] = useState(targetGroupId);
  const [amount, setAmount] = useState(targetAmount ? String(targetAmount) : "");
  const [method, setMethod] = useState("cash");
  const [paymentDate, setPaymentDate] = useState(todayISO());
  const [selectedMonth, setSelectedMonth] = useState(targetMonth);

  // Balance usage state
  const [useBalance, setUseBalance] = useState(true);

  // Tags state for filtering
  const [tags, setTags] = useState([]);
  const [customTagInput, setCustomTagInput] = useState("");

  // Discount & Debt states
  const [hasDiscount, setHasDiscount] = useState(false);
  const [discountAmount, setDiscountAmount] = useState("");
  const [discountReason, setDiscountReason] = useState("");

  // Default debt due date: 10 days from today
  const tenDaysLater = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const [debtDueDate, setDebtDueDate] = useState(tenDaysLater);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const scopeIds = (scopeBranches || []).map((b) => b.id);
  const courses = (directorData?.courses || opData?.courses || []).filter(
    (c) => scopeIds.length === 0 || scopeIds.includes(c.branchId),
  );
  const courseIds = courses.map((c) => c.id);

  const rawGroups = propGroups || opGroups(opData) || [];
  const groups =
    courseIds.length > 0
      ? rawGroups.filter((g) => courseIds.includes(g.courseId))
      : rawGroups;

  const rawStudents = propStudents || opStudentsInGroups(opData, groups.map((g) => g.id)) || [];
  const allStudents = rawStudents.length > 0 ? rawStudents : (opData?.students || directorData?.students || []);

  const availablePaymentMethods = useMemo(() => {
    const customTypes = directorData?.paymentTypes || paymentMethods || [];
    return getStoredPaymentMethods(customTypes);
  }, [directorData?.paymentTypes, paymentMethods]);

  const allPayments = useMemo(() => {
    return directorData?.payments || opData?.payments || [];
  }, [directorData?.payments, opData?.payments]);

  const matches =
    search.trim().length > 0 && !studentId
      ? allStudents
          .filter(
            (s) =>
              (s.name || "").toLowerCase().includes(search.toLowerCase()) ||
              normalizePhone(s.phone || "").includes(normalizePhone(search)),
          )
          .slice(0, 8)
      : [];

  const selectedStudent = allStudents.find((s) => s.id === studentId) || resolvedStudent;
  const studentBalance = Math.max(0, Number(selectedStudent?.balance || 0));

  // Available groups for selected student or all groups if student not specified
  const studentGids = (selectedStudent?.groupIds || []).map(String);
  const studentGroupOptions = selectedStudent && studentGids.length > 0
    ? groups
        .filter((g) => studentGids.includes(String(g.id)))
        .map((g) => ({
          group: g,
          course: courses.find((c) => c.id === g.courseId),
        }))
    : groups.map((g) => ({
        group: g,
        course: courses.find((c) => c.id === g.courseId),
      }));

  const selectedGroupObj = groups.find((g) => g.id === groupId) || resolvedGroup;
  const baseGroupPrice = selectedGroupObj ? Number(selectedGroupObj.price) || 0 : 0;

  // Calculate prorated fee if student joined mid-month
  const prorataInfo = useMemo(() => {
    if (!selectedGroupObj || !baseGroupPrice) {
      return { calculatedFee: baseGroupPrice, isProrated: false, totalLessons: 0, attendedLessons: 0, pricePerLesson: 0, reason: "", isTrial: false, isPaused: false };
    }
    const membership =
      selectedStudent?.groupMemberships?.[selectedGroupObj.id] ||
      selectedStudent?.groupMemberships?.[String(selectedGroupObj.id)];
    return calculateStudentGroupFee({
      fullMonthlyFee: baseGroupPrice,
      groupDays: selectedGroupObj.days || ["Dush", "Chor", "Juma"],
      monthStr: selectedMonth,
      membership,
      student: selectedStudent,
    });
  }, [selectedGroupObj, baseGroupPrice, selectedStudent, selectedMonth]);

  // Effective fee for this month (0 while in trial/frozen; prorated from activation date otherwise)
  const groupPrice = prorataInfo.calculatedFee;
  const isTrialGroup = prorataInfo.isTrial;
  const isPausedGroup = prorataInfo.isPaused;

  // Payments already made for this student + group + selectedMonth
  const alreadyPaidThisMonth = useMemo(() => {
    if (!studentId || !groupId || !selectedMonth) return 0;
    return allPayments
      .filter(
        (p) =>
          p.studentId === studentId &&
          p.groupId === groupId &&
          p.month === selectedMonth,
      )
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }, [allPayments, studentId, groupId, selectedMonth]);

  const alreadyDiscountThisMonth = useMemo(() => {
    if (!studentId || !groupId || !selectedMonth) return 0;
    return allPayments
      .filter(
        (p) =>
          p.studentId === studentId &&
          p.groupId === groupId &&
          p.month === selectedMonth,
      )
      .reduce((sum, p) => sum + (Number(p.discount) || 0), 0);
  }, [allPayments, studentId, groupId, selectedMonth]);

  // Real remaining due for this selected month before any new discounts in this form
  const remainingDueForMonth = Math.max(
    0,
    groupPrice - alreadyPaidThisMonth - alreadyDiscountThisMonth,
  );

  // Calculations for current form submission
  const discountVal = hasDiscount ? parseFloat(discountAmount) || 0 : 0;
  const netDueNow = Math.max(0, remainingDueForMonth - discountVal);

  // How much of the student's balance can be used for this payment
  const applicableBalance =
    useBalance && studentBalance > 0 ? Math.min(studentBalance, netDueNow) : 0;

  // Cash/card payment remaining after applying available balance
  const remainingCashDue = Math.max(0, netDueNow - applicableBalance);

  // Current amount entered in the input field
  const paidVal = parseFloat(amount) || 0;

  // Total value covering the tuition (cash + applied balance)
  const totalCovering = paidVal + applicableBalance;

  // If student pays more than the net due, the excess is surplus that adds to balance
  const surplusToBalance = Math.max(0, totalCovering - netDueNow);

  // If total payment is less than net due, there is remaining debt
  const qarz = Math.max(0, netDueNow - totalCovering);

  // Student balance after this transaction
  const newStudentBalance =
    studentBalance - applicableBalance + surplusToBalance;

  // Smart calculation of default amount
  const calcDefaultAmount = useCallback(
    (sId, gId, mth, shouldUseBal = useBalance) => {
      if (!gId) return "";
      const grp = groups.find((g) => g.id === gId);
      const rawPrice = grp ? Number(grp.price) || 0 : 0;
      if (!sId || !mth) return rawPrice > 0 ? String(rawPrice) : "";

      const st = allStudents.find((s) => s.id === sId) || resolvedStudent;
      const membership = st?.groupMemberships?.[gId] || st?.groupMemberships?.[String(gId)];
      const prorata = calculateStudentGroupFee({
        fullMonthlyFee: rawPrice,
        groupDays: grp?.days || ["Dush", "Chor", "Juma"],
        monthStr: mth,
        membership,
        student: st,
      });

      const price = prorata.calculatedFee;

      const paid = allPayments
        .filter(
          (p) => p.studentId === sId && p.groupId === gId && p.month === mth,
        )
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

      const disc = allPayments
        .filter(
          (p) => p.studentId === sId && p.groupId === gId && p.month === mth,
        )
        .reduce((sum, p) => sum + (Number(p.discount) || 0), 0);

      const rem = Math.max(0, price - paid - disc);
      if (rem === 0 && paid > 0) return ""; // already fully paid for this month

      const bal = Math.max(0, Number(st?.balance || 0));
      const appBal = shouldUseBal ? Math.min(bal, rem) : 0;
      const cashNeeded = Math.max(0, rem - appBal);

      return String(cashNeeded);
    },
    [groups, allPayments, allStudents, useBalance, resolvedStudent],
  );

  // Handle group change
  function handleGroupChange(newGroupId) {
    setGroupId(newGroupId);
    const def = calcDefaultAmount(studentId, newGroupId, selectedMonth, useBalance);
    setAmount(def);
  }

  // Handle month change
  function handleMonthChange(newMonth) {
    setSelectedMonth(newMonth);
    if (studentId && groupId) {
      const def = calcDefaultAmount(studentId, groupId, newMonth, useBalance);
      setAmount(def);
    }
  }

  // Auto-set student and group when props change
  useEffect(() => {
    const activeMonth = targetMonth || selectedMonth || thisMonthKey();
    if (targetMonth && targetMonth !== selectedMonth) {
      setSelectedMonth(targetMonth);
    }
    const st = selectedStudent || (targetStudentId ? allStudents.find((s) => s.id === targetStudentId) : null);
    if (st) {
      if (!studentId) setStudentId(st.id);
      if (!search) setSearch(st.name || "");
      const gId = targetGroupId || (st.groupIds && st.groupIds[0]) || (groups[0] ? groups[0].id : "");
      if (gId && !groupId) {
        setGroupId(gId);
        if (targetAmount) {
          setAmount(String(targetAmount));
        } else {
          setAmount(calcDefaultAmount(st.id, gId, activeMonth, true));
        }
      }
    } else if (targetGroupId && !groupId) {
      setGroupId(targetGroupId);
      if (targetAmount) {
        setAmount(String(targetAmount));
      } else {
        setAmount(calcDefaultAmount(studentId, targetGroupId, activeMonth, useBalance));
      }
    } else if (targetAmount && !amount) {
      setAmount(String(targetAmount));
    }
  }, [targetStudentId, targetGroupId, targetMonth, targetAmount, allStudents.length]);

  function selectStudent(s) {
    setStudentId(s.id);
    setSearch(s.name);
    const sGids = (s?.groupIds || []).map(String);
    const opts = groups.filter((g) => sGids.includes(String(g.id)));
    const tGroupId = opts.length > 0 ? opts[0].id : groupId;
    if (tGroupId) {
      setGroupId(tGroupId);
      setAmount(calcDefaultAmount(s.id, tGroupId, selectedMonth, true));
    }
  }

  function clearSelectedStudent() {
    setStudentId("");
    setSearch("");
    setGroupId("");
    setAmount("");
  }

  function toggleUseBalance() {
    const next = !useBalance;
    setUseBalance(next);
    if (next) {
      const appBal = Math.min(studentBalance, netDueNow);
      setAmount(String(Math.max(0, netDueNow - appBal)));
    } else {
      setAmount(String(netDueNow));
    }
  }

  // Tag helper actions
  function toggleTag(tag) {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  }

  function addCustomTag() {
    const trimmed = customTagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setCustomTagInput("");
    }
  }

  function submit(e) {
    if (e && e.preventDefault) e.preventDefault();
    setError("");
    if (!studentId) {
      setError("Iltimos, o'quvchini tanlang.");
      return;
    }
    if (!groupId) {
      setError("Iltimos, guruhni tanlang.");
      return;
    }

    if (paidVal <= 0 && applicableBalance <= 0) {
      setError("Iltimos, to'lov miqdorini kiriting yoki balansdan foydalaning.");
      return;
    }

    const effectiveMethod =
      paidVal === 0 && applicableBalance > 0 ? "balance" : method;

    const effectiveTotalAmount = Math.min(netDueNow, totalCovering);

    // Format tags into note for complete search and filter support
    const tagSuffix = tags.length > 0 ? ` [Teglar: ${tags.join(", ")}]` : "";
    const finalNote = ((note || "") + tagSuffix).trim() ||
      (applicableBalance > 0
        ? `Balansdan (${money(applicableBalance)}) + ${selectedGroupObj?.name || ""}`
        : selectedGroupObj?.name || "");

    if (onSubmit) {
      onSubmit({
        studentId,
        groupId,
        amount: effectiveTotalAmount > 0 ? effectiveTotalAmount : paidVal,
        paidAmount: paidVal,
        usedBalance: applicableBalance,
        surplusToBalance: surplusToBalance,
        method: effectiveMethod,
        discount: discountVal,
        discountReason: hasDiscount ? discountReason : "",
        debt: qarz,
        debtDueDate: qarz > 0 ? debtDueDate : null,
        tags: tags,
        note: finalNote,
        date: paymentDate || todayISO(),
        month: selectedMonth || thisMonthKey(),
      });
    }
    if (onClose) {
      onClose();
    }
  }

  return (
    <Modal title="To'lov qabul qilish" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        {/* 1. O'QUVCHI ISMI (Ismi) */}
        <div>
          <label className={LABEL_CLS}>
            O'quvchi (Ismi) <span className="text-rose-500">*</span>
          </label>
          {selectedStudent ? (
            <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar name={selectedStudent.name} size={38} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {selectedStudent.name}
                    </p>
                    {studentBalance > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-black border border-emerald-300 dark:border-emerald-700 flex items-center gap-1">
                        <Wallet size={11} /> Haqdorlik: +{money(studentBalance)} so'm
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {selectedStudent.phone || "Telefon kiritilmagan"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={clearSelectedStudent}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Boshqa o'quvchi tanlash"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="relative">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setStudentId("");
                  }}
                  placeholder="Ism yoki telefon raqami bo'yicha qidiring..."
                  className={`${INPUT_CLS} pl-10`}
                  autoFocus
                />
              </div>

              {matches.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl max-h-56 overflow-y-auto p-1.5 space-y-1">
                  {matches.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => selectStudent(s)}
                      className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar name={s.name} size={30} />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {s.name}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {s.phone || "Telefon yo'q"}{" "}
                            {Number(s.balance || 0) > 0 && (
                              <span className="text-emerald-600 font-bold">
                                • Haqdorlik (Balans): +{money(s.balance)}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold shrink-0">
                        Tanlash →
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 2. GURUHI (Guruh) */}
        <div>
          <label className={LABEL_CLS}>
            Guruhi <span className="text-rose-500">*</span>
          </label>
          <select
            value={groupId}
            onChange={(e) => handleGroupChange(e.target.value)}
            className={`${INPUT_CLS} font-medium`}
            required
          >
            <option value="">-- Guruhni tanlang --</option>
            {studentGroupOptions.map(({ group: g, course }) => (
              <option key={g.id} value={g.id}>
                {g.name} {course ? `• ${course.name}` : ""} ({money(g.price || 0)} so'm)
              </option>
            ))}
          </select>
        </div>

        {/* 3. GURUH NARXI (YASHIL RANGDA) */}
        {selectedGroupObj && (
          <div className="p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                <BookOpen size={18} />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 block">
                  Guruh narxi:
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedGroupObj.name}
                </span>
              </div>
            </div>

            <div className="text-right">
              {/* Green Price Highlight */}
              <div className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400">
                {money(baseGroupPrice)} <span className="text-xs font-semibold text-emerald-700/80 dark:text-emerald-300/80">so'm/oy</span>
              </div>
              {prorataInfo.isProrated && (
                <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-200/60 dark:bg-emerald-900/60 px-2 py-0.5 rounded-xl inline-block mt-0.5">
                  Pro-rata bo'yicha: {money(prorataInfo.calculatedFee)} so'm
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. TALABA HAQDORLIGI, YA'NI BALANSI */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet size={16} className="text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                Talaba haqdorligi (Balansi):
              </span>
            </div>

            <span
              className={`text-sm font-black px-2.5 py-0.5 rounded-xl ${
                studentBalance > 0
                  ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700"
                  : "bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
              }`}
            >
              {studentBalance > 0 ? `+${money(studentBalance)} so'm` : "0 so'm"}
            </span>
          </div>

          {studentId && studentBalance > 0 && remainingDueForMonth > 0 && (
            <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-700 text-xs">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                To'lov uchun yechiladi: <strong>{money(applicableBalance)} so'm</strong>
              </span>

              <button
                type="button"
                onClick={toggleUseBalance}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  useBalance
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300"
                }`}
              >
                {useBalance ? "✓ Balans ishlatilsin" : "Balansni ishlatmaslik"}
              </button>
            </div>
          )}
        </div>

        {/* 5. SUMMANI KIRITISH (Kiritilishi kerak bo'lgan summa / To'lov summasi) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className={LABEL_CLS}>
              {useBalance && applicableBalance > 0
                ? "Qo'shimcha to'lanayotgan naqd/karta summasi (so'm)"
                : "Summani kiritish (so'm)"}{" "}
              <span className="text-rose-500">*</span>
            </label>
            {remainingCashDue > 0 ? (
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                Kiritilishi kerak: {money(remainingCashDue)} so'm
              </span>
            ) : applicableBalance >= netDueNow && netDueNow > 0 ? (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                Balansdan to'liq qoplanadi (0 so'm)
              </span>
            ) : null}
          </div>

          <MoneyInput
            value={amount}
            onChange={(val) => setAmount(val)}
            placeholder="0"
            className={`${INPUT_CLS} font-bold text-base`}
          />

          {groupPrice > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {useBalance && applicableBalance >= netDueNow && netDueNow > 0 && (
                <button
                  type="button"
                  onClick={() => setAmount("0")}
                  className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles size={13} />
                  <span>Balansdan to'liq to'lash (0 so'm)</span>
                </button>
              )}

              {remainingCashDue > 0 && (
                <button
                  type="button"
                  onClick={() => setAmount(String(remainingCashDue))}
                  className="px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles size={13} />
                  <span>To'liq qoldiq ({money(remainingCashDue)})</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setAmount(String(groupPrice))}
                className="px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
              >
                100% ({money(groupPrice)})
              </button>
              <button
                type="button"
                onClick={() => setAmount(String(Math.round(groupPrice / 2)))}
                className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                50% ({money(Math.round(groupPrice / 2))})
              </button>
            </div>
          )}
        </div>

        {/* 6. TO'LOV TURI DROPDOWN (From To'lov turlari settings/page) */}
        <div>
          <label className={LABEL_CLS}>
            To'lov turi <span className="text-rose-500">*</span>
          </label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className={`${INPUT_CLS} font-bold text-xs`}
          >
            {availablePaymentMethods
              .filter((m) =>
                paidVal === 0 && applicableBalance > 0
                  ? m.id === "balance"
                  : m.id !== "balance"
              )
              .map((m) => (
                <option key={m.id} value={m.id}>
                  {m.icon} {m.label}
                </option>
              ))}
          </select>

          {/* Quick Method Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mt-2">
            {availablePaymentMethods
              .filter((m) => m.id !== "balance")
              .slice(0, 4)
              .map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id)}
                  className={`flex items-center justify-center gap-1.5 text-xs py-2.5 px-2.5 rounded-xl border font-bold transition-all cursor-pointer ${
                    method === m.id
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                      : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span>{m.icon}</span>
                  <span className="truncate">{m.label}</span>
                </button>
              ))}
          </div>
        </div>

        {/* 7. SANA & QAYSI OY UCHUN (Oddiy sana) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={LABEL_CLS}>To'lov sanasi</label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className={`${INPUT_CLS} text-xs font-semibold`}
            />
          </div>
          <div>
            <label className={LABEL_CLS}>Qaysi oy uchun</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => handleMonthChange(e.target.value)}
              className={`${INPUT_CLS} text-xs font-extrabold text-indigo-600 dark:text-indigo-400`}
            />
          </div>
        </div>

        {/* 8. TEGLAR (For Filter: e.g., "Aprel yangi") */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
          <label className={LABEL_CLS + " flex items-center justify-between"}>
            <span className="flex items-center gap-1.5">
              <Tag size={14} className="text-indigo-600 dark:text-indigo-400" />
              Teglar (Filterlash uchun)
            </span>
            <span className="text-[10px] text-slate-400">masalan: "Aprel yangi"</span>
          </label>

          {/* Selected Tags Chips */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pb-1">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-xs font-extrabold border border-indigo-200 dark:border-indigo-800 shadow-2xs"
                >
                  🏷️ {t}
                  <button
                    type="button"
                    onClick={() => toggleTag(t)}
                    className="hover:text-rose-600 transition-colors cursor-pointer ml-0.5"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Preset Tag Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {DEFAULT_PRESET_TAGS.map((t) => {
              const active = tags.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTag(t)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    active
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {active ? "✓ " : "+ "}{t}
                </button>
              );
            })}
          </div>

          {/* Custom Tag Input */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={customTagInput}
              onChange={(e) => setCustomTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomTag();
                }
              }}
              placeholder="Yangi teg kiriting (masalan: Aprel yangi)..."
              className={`${INPUT_CLS} text-xs py-1.5`}
            />
            <button
              type="button"
              onClick={addCustomTag}
              className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold text-xs shrink-0 cursor-pointer hover:bg-indigo-100"
            >
              <Plus size={14} className="inline mr-1" /> Qo'shish
            </button>
          </div>
        </div>

        {/* 9. CHEGIRMA (Discount) OPTION */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hasDiscount}
              onChange={(e) => setHasDiscount(e.target.checked)}
              className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
            />
            <Percent size={14} className="text-amber-500" /> Chegirma berish
          </label>

          {hasDiscount && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Chegirma summasi (so'm)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  placeholder="Masalan: 50000"
                  className={`${INPUT_CLS} text-xs font-semibold`}
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Chegirma sababi
                </label>
                <input
                  type="text"
                  value={discountReason}
                  onChange={(e) => setDiscountReason(e.target.value)}
                  placeholder="Masalan: 2 ta farzand, aksiya..."
                  className={`${INPUT_CLS} text-xs`}
                />
              </div>
            </div>
          )}
        </div>

        {/* 10. IZOH */}
        <div>
          <label className={LABEL_CLS}>Izoh yoki chek raqami (ixtiyoriy)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Masalan: Chek #12345, ota-onasi to'ladi"
            className={`${INPUT_CLS} text-xs`}
          />
        </div>

        {/* Trial / Frozen notice — no fee is charged in these states */}
        {groupId && (isTrialGroup || isPausedGroup) && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center gap-2">
            <Info size={15} className="shrink-0" />
            {isPausedGroup
              ? "O'quvchi ushbu guruhda muzlatilgan — bu oy uchun to'lov hisoblanmaydi."
              : "O'quvchi ushbu guruhda sinov holatida — faollashtirilmaguncha to'lov hisoblanmaydi."}
          </div>
        )}

        {/* Calculation Summary Card */}
        {groupId && (
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
              <span>Guruh oylik to'lovi ({selectedMonth}):</span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                {money(groupPrice)} so'm
              </span>
            </div>

            {alreadyPaidThisMonth > 0 && (
              <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
                <span>Ushbu oy uchun avval to'langan:</span>
                <span className="font-bold">+{money(alreadyPaidThisMonth)} so'm</span>
              </div>
            )}

            {hasDiscount && discountVal > 0 && (
              <div className="flex justify-between items-center text-amber-600 dark:text-amber-400">
                <span>Chegirma:</span>
                <span className="font-semibold">-{money(discountVal)} so'm</span>
              </div>
            )}

            <div className="flex justify-between items-center text-slate-700 dark:text-slate-300 pt-1 border-t border-slate-200 dark:border-slate-700/60 font-bold">
              <span>To'lanishi kerak bo'lgan summa:</span>
              <span className="font-black text-slate-900 dark:text-white">
                {money(netDueNow)} so'm
              </span>
            </div>

            {applicableBalance > 0 && (
              <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-semibold">
                <span>⚡ Talaba balansidan yechilmoqda:</span>
                <span className="font-bold">-{money(applicableBalance)} so'm</span>
              </div>
            )}

            <div className="flex justify-between items-center text-indigo-600 dark:text-indigo-400 font-bold">
              <span>Hozir kiritilayotgan to'lov:</span>
              <span className="font-black text-sm">{money(paidVal)} so'm</span>
            </div>

            {/* Surplus (Ortiqcha to'lov) Banner */}
            {surplusToBalance > 0 && (
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300">
                    <Sparkles size={14} className="text-amber-500" /> Ortiqcha to'lov (Depozit):
                  </span>
                  <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                    +{money(surplusToBalance)} so'm
                  </span>
                </div>
                <p className="text-[11px] text-indigo-700/80 dark:text-indigo-300/80 leading-relaxed">
                  Ushbu ortiqcha summa o'quvchining <strong>balansiga</strong> saqlanadi.
                </p>
              </div>
            )}

            {/* Debt status */}
            <div className="flex justify-between items-center pt-1 border-t border-slate-200 dark:border-slate-700/60">
              {qarz > 0 ? (
                <>
                  <span className="font-extrabold text-rose-600 dark:text-rose-400">
                    To'lovdan keyingi qoldiq qarz:
                  </span>
                  <span className="font-black text-rose-600 dark:text-rose-400 text-sm">
                    {money(qarz)} so'm
                  </span>
                </>
              ) : (
                <div className="w-full flex items-center justify-between py-0.5 text-emerald-600 dark:text-emerald-400 font-bold">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={16} /> Bu oy uchun to'liq to'landi
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Debt Due Date if Debt > 0 */}
        {qarz > 0 && (
          <div className="p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/40 space-y-1.5">
            <label className="text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
              <Calendar size={14} /> Qoldiq qarzni to'lash muddati (Due Date)
            </label>
            <input
              type="date"
              value={debtDueDate}
              onChange={(e) => setDebtDueDate(e.target.value)}
              className={`${INPUT_CLS} text-xs font-semibold`}
            />
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
            <AlertCircle size={15} /> {error}
          </div>
        )}

        {/* Actions */}
        <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            Bekor qilish
          </button>
          <PrimaryButton type="submit">
            <Check size={16} /> To'lovni tasdiqlash
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}

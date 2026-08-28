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
  BookOpen,
  Wallet,
  Sparkles,
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
} from "../utils/helpers";
import { calculateProratedFee } from "../../../shared/utils/prorata";

// Default and stored payment methods
function getStoredPaymentMethods(customTypes = []) {
  const defaultMethods = [
    { id: "cash", label: "Naqd pul" },
    { id: "card", label: "Plastik karta" },
    { id: "click", label: "Click / Payme / Uzum" },
    { id: "bank", label: "Bank o'tkazmasi" },
  ];

  let list = [];

  // 1. Check localStorage for payment types created on PaymentTypesPage
  try {
    const raw = localStorage.getItem("cosmos_payment_methods_v1") || localStorage.getItem("cosmos_payment_types");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        parsed.forEach((item) => {
          if (item.status === "inactive") return;
          const label = typeof item === "string" ? item : item.name || item.label || item.title || "";
          const id = typeof item === "string" ? item.toLowerCase().replace(/\s+/g, "_") : item.id || (label ? label.toLowerCase().replace(/\s+/g, "_") : "");
          if (label && id && !list.some((m) => m.id === id || m.label.toLowerCase() === label.toLowerCase())) {
            list.push({ id, label });
          }
        });
      }
    }
  } catch (e) {
    console.error("Payment methods read error:", e);
  }

  // 2. Check props / directorData custom types
  if (Array.isArray(customTypes) && customTypes.length > 0) {
    customTypes.forEach((pt) => {
      if (pt.status === "inactive") return;
      const label = typeof pt === "string" ? pt : pt.name || pt.title || pt.label || "";
      const id = typeof pt === "string" ? pt.toLowerCase().replace(/\s+/g, "_") : pt.id || (label ? label.toLowerCase().replace(/\s+/g, "_") : "");
      if (label && id && !list.some((m) => m.id === id || m.label.toLowerCase() === label.toLowerCase())) {
        list.push({ id, label });
      }
    });
  }

  // 3. Fallback to default methods if list is empty
  if (list.length === 0) {
    list = [...defaultMethods];
  }

  // 4. Ensure "balance" is included if needed
  if (!list.some((m) => m.id === "balance")) {
    list.push({ id: "balance", label: "Balansdan" });
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

  const [useBalance, setUseBalance] = useState(true);

  const [tags, setTags] = useState([]);
  const [customTagInput, setCustomTagInput] = useState("");

  const [hasDiscount, setHasDiscount] = useState(false);
  const [discountAmount, setDiscountAmount] = useState("");
  const [discountReason, setDiscountReason] = useState("");

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

  const prorataInfo = useMemo(() => {
    if (!selectedGroupObj || !baseGroupPrice) {
      return { calculatedFee: baseGroupPrice, isProrated: false, totalLessons: 0, attendedLessons: 0, pricePerLesson: 0, reason: "" };
    }
    const joinDate = selectedStudent?.joinedAt || selectedStudent?.createdAt || selectedStudent?.startDate || "";
    return calculateProratedFee({
      fullMonthlyFee: baseGroupPrice,
      groupDays: selectedGroupObj.days || ["Dush", "Chor", "Juma"],
      monthStr: selectedMonth,
      joinDate,
    });
  }, [selectedGroupObj, baseGroupPrice, selectedStudent, selectedMonth]);

  const groupPrice = prorataInfo.calculatedFee;

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

  const remainingDueForMonth = Math.max(
    0,
    groupPrice - alreadyPaidThisMonth - alreadyDiscountThisMonth,
  );

  const discountVal = hasDiscount ? parseFloat(discountAmount) || 0 : 0;
  const netDueNow = Math.max(0, remainingDueForMonth - discountVal);

  const applicableBalance =
    useBalance && studentBalance > 0 ? Math.min(studentBalance, netDueNow) : 0;

  const remainingCashDue = Math.max(0, netDueNow - applicableBalance);
  const paidVal = parseFloat(amount) || 0;
  const totalCovering = paidVal + applicableBalance;
  const surplusToBalance = Math.max(0, totalCovering - netDueNow);
  const qarz = Math.max(0, netDueNow - totalCovering);

  const calcDefaultAmount = useCallback(
    (sId, gId, mth, shouldUseBal = useBalance) => {
      if (!gId) return "";
      const grp = groups.find((g) => g.id === gId);
      const rawPrice = grp ? Number(grp.price) || 0 : 0;
      if (!sId || !mth) return rawPrice > 0 ? String(rawPrice) : "";

      const st = allStudents.find((s) => s.id === sId) || resolvedStudent;
      const joinDate = st?.joinedAt || st?.createdAt || st?.startDate || "";
      const prorata = calculateProratedFee({
        fullMonthlyFee: rawPrice,
        groupDays: grp?.days || ["Dush", "Chor", "Juma"],
        monthStr: mth,
        joinDate,
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
      if (rem === 0 && paid > 0) return "";

      const bal = Math.max(0, Number(st?.balance || 0));
      const appBal = shouldUseBal ? Math.min(bal, rem) : 0;
      const cashNeeded = Math.max(0, rem - appBal);

      return String(cashNeeded);
    },
    [groups, allPayments, allStudents, useBalance, resolvedStudent],
  );

  function handleGroupChange(newGroupId) {
    setGroupId(newGroupId);
    const def = calcDefaultAmount(studentId, newGroupId, selectedMonth, useBalance);
    setAmount(def);
  }

  function handleMonthChange(newMonth) {
    setSelectedMonth(newMonth);
    if (studentId && groupId) {
      const def = calcDefaultAmount(studentId, groupId, newMonth, useBalance);
      setAmount(def);
    }
  }

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
        {/* 1. O'QUVCHI */}
        <div>
          <label className={LABEL_CLS}>
            O'quvchi <span className="text-rose-500">*</span>
          </label>
          {selectedStudent ? (
            <div className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-slate-50/60 dark:bg-slate-800/40">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar name={selectedStudent.name} size={34} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {selectedStudent.name}
                    </p>
                    {studentBalance > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                        Balans: +{money(studentBalance)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {selectedStudent.phone || "Telefon yo'q"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={clearSelectedStudent}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <X size={15} />
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
                  placeholder="Ism yoki telefon qidirish..."
                  className={`${INPUT_CLS} pl-10`}
                  autoFocus
                />
              </div>

              {matches.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg max-h-52 overflow-y-auto p-1 divide-y divide-slate-100 dark:divide-slate-800">
                  {matches.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => selectStudent(s)}
                      className="w-full flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-left rounded-lg"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar name={s.name} size={28} />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {s.name}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {s.phone || "Telefon yo'q"}{" "}
                            {Number(s.balance || 0) > 0 && (
                              <span className="text-emerald-600 font-bold">
                                • +{money(s.balance)}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                        Tanlash
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 2. GURUH VA NARX */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={LABEL_CLS}>
              Guruh <span className="text-rose-500">*</span>
            </label>
            <select
              value={groupId}
              onChange={(e) => handleGroupChange(e.target.value)}
              className={`${INPUT_CLS} font-medium`}
              required
            >
              <option value="">Guruhni tanlang</option>
              {studentGroupOptions.map(({ group: g, course }) => (
                <option key={g.id} value={g.id}>
                  {g.name} {course ? `• ${course.name}` : ""} ({money(g.price || 0)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLS}>Guruh narxi</label>
            <div className="h-10 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-600 dark:text-slate-400 truncate">
                {selectedGroupObj ? selectedGroupObj.name : "Tanlanmagan"}
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                {selectedGroupObj ? `${money(baseGroupPrice)} so'm` : "0 so'm"}
              </span>
            </div>
          </div>
        </div>

        {/* 3. BALANS VA SUMMA */}
        {studentId && studentBalance > 0 && remainingDueForMonth > 0 && (
          <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 text-xs">
            <div className="flex items-center gap-2">
              <Wallet size={15} className="text-emerald-600 dark:text-emerald-400" />
              <span className="text-slate-700 dark:text-slate-300">
                Balansdan yechish: <strong>{money(applicableBalance)} so'm</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={toggleUseBalance}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {useBalance ? "Balansni ishlatmaslik" : "Balansni ishlatish"}
            </button>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className={LABEL_CLS}>
              To'lov summasi <span className="text-rose-500">*</span>
            </label>
            {remainingCashDue > 0 ? (
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                Qoldiq: {money(remainingCashDue)} so'm
              </span>
            ) : applicableBalance >= netDueNow && netDueNow > 0 ? (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                Balansdan qoplanadi
              </span>
            ) : null}
          </div>

          <MoneyInput
            value={amount}
            onChange={(val) => setAmount(val)}
            placeholder="0"
            className={`${INPUT_CLS} font-bold text-sm`}
          />
        </div>

        {/* 4. TO'LOV TURI */}
        <div>
          <label className={LABEL_CLS}>
            To'lov turi <span className="text-rose-500">*</span>
          </label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className={`${INPUT_CLS} font-medium`}
            required
          >
            {availablePaymentMethods
              .filter((m) =>
                paidVal === 0 && applicableBalance > 0
                  ? m.id === "balance"
                  : m.id !== "balance"
              )
              .map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
          </select>
        </div>

        {/* 5. SANA VA OY */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={LABEL_CLS}>To'lov sanasi</label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className={`${INPUT_CLS} text-xs font-medium`}
            />
          </div>
          <div>
            <label className={LABEL_CLS}>Qaysi oy uchun</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => handleMonthChange(e.target.value)}
              className={`${INPUT_CLS} text-xs font-bold text-indigo-600 dark:text-indigo-400`}
            />
          </div>
        </div>

        {/* 6. TEGLAR */}
        <div className="space-y-1.5">
          <label className={LABEL_CLS}>Teglar</label>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pb-1">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold"
                >
                  {t}
                  <button
                    type="button"
                    onClick={() => toggleTag(t)}
                    className="hover:text-rose-600 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-1.5">
            {DEFAULT_PRESET_TAGS.slice(0, 5).map((t) => {
              const active = tags.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTag(t)}
                  className={`px-2 py-0.5 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        {/* 7. CHEGIRMA */}
        <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={hasDiscount}
              onChange={(e) => setHasDiscount(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 w-3.5 h-3.5"
            />
            <span>Chegirma berish</span>
          </label>

          {hasDiscount && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className={LABEL_CLS}>Chegirma summasi</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  placeholder="0"
                  className={`${INPUT_CLS} text-xs`}
                />
              </div>
              <div>
                <label className={LABEL_CLS}>Chegirma sababi</label>
                <input
                  type="text"
                  value={discountReason}
                  onChange={(e) => setDiscountReason(e.target.value)}
                  placeholder="Sabab..."
                  className={`${INPUT_CLS} text-xs`}
                />
              </div>
            </div>
          )}
        </div>

        {/* 8. IZOH */}
        <div>
          <label className={LABEL_CLS}>Izoh</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Izoh kiriting..."
            className={`${INPUT_CLS} text-xs`}
          />
        </div>

        {/* 9. XULOSA VA QARZ SANA */}
        {groupId && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1 text-xs">
            <div className="flex justify-between items-center text-slate-500">
              <span>Oylik to'lov:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {money(groupPrice)} so'm
              </span>
            </div>

            {alreadyPaidThisMonth > 0 && (
              <div className="flex justify-between items-center text-emerald-600">
                <span>Avval to'langan:</span>
                <span className="font-bold">+{money(alreadyPaidThisMonth)} so'm</span>
              </div>
            )}

            {qarz > 0 ? (
              <div className="flex justify-between items-center text-rose-600 font-bold pt-1">
                <span>Qoldiq qarz:</span>
                <span>{money(qarz)} so'm</span>
              </div>
            ) : (
              <div className="flex justify-between items-center text-emerald-600 font-bold pt-1">
                <span>Holat:</span>
                <span>To'liq to'landi</span>
              </div>
            )}
          </div>
        )}

        {qarz > 0 && (
          <div>
            <label className={LABEL_CLS}>Qarzni to'lash muddati</label>
            <input
              type="date"
              value={debtDueDate}
              onChange={(e) => setDebtDueDate(e.target.value)}
              className={`${INPUT_CLS} text-xs font-medium`}
            />
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
            <AlertCircle size={15} /> {error}
          </div>
        )}

        {/* Actions */}
        <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
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

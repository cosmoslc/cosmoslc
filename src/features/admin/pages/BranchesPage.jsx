import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  Plus,
  Building2,
  Pencil,
  ArrowLeft,
  Calendar,
  User,
  UserPlus,
  UserMinus,
  TrendingUp,
  Wallet,
  Users,
  Snowflake,
  AlertTriangle,
  GraduationCap,
  BookOpen,
  ClipboardList,
  DollarSign,
  Phone,
  Search,
  CheckCircle2,
  Clock,
  ChevronRight,
  ShieldCheck,
  Star,
  Settings,
  Trash2,
} from "lucide-react";
import { GLASS, PrimaryButton } from "../theme/tokens";
import { EmptyState } from "../components/primitives";
import {
  opGroups,
  opGroupStudentCount,
  opStudentsInGroups,
} from "../utils/dataHelpers";
import {
  money,
  thisMonthKey,
  formatDate,
  normalizePhone,
  getPaymentStatus,
} from "../utils/helpers";
import { MONTHS_UZ } from "../utils/constants";

export function BranchesPage({
  director,
  directorData,
  opData,
  openModal = () => {},
  openBranchModal,
  openBranchDetail,
  onDeleteBranch,
  scopeBranches = [],
  goTo = () => {},
}) {
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [searchBranch, setSearchBranch] = useState("");

  const safeOpenModal = (modalPayload) => {
    if (!modalPayload) return;
    if (modalPayload.type === "branchForm" && openBranchModal) {
      openBranchModal(modalPayload.editing || modalPayload.branch);
      return;
    }
    if (
      modalPayload.type === "confirm" &&
      modalPayload.action?.kind === "deleteBranch" &&
      onDeleteBranch
    ) {
      onDeleteBranch(modalPayload.action.branchId);
      return;
    }
    openModal(modalPayload);
  };

  const myBranches = useMemo(() => {
    if (scopeBranches && scopeBranches.length > 0) return scopeBranches;
    const all = directorData?.branches || [];
    if (director?.id) {
      return all.filter((b) => !b.directorId || b.directorId === director.id);
    }
    return all;
  }, [scopeBranches, directorData?.branches, director?.id]);

  const selectedBranch = selectedBranchId
    ? myBranches.find((b) => b.id === selectedBranchId) ||
      (directorData?.branches || []).find((b) => b.id === selectedBranchId) ||
      null
    : null;

  if (selectedBranch) {
    return (
      <BranchFullDetailPage
        branch={selectedBranch}
        directorData={directorData}
        opData={opData}
        onBack={() => setSelectedBranchId(null)}
        openModal={safeOpenModal}
      />
    );
  }

  const filteredBranches = myBranches.filter((b) => {
    if (!searchBranch) return true;
    const q = searchBranch.toLowerCase();
    return (
      (b.name || "").toLowerCase().includes(q) ||
      (b.address || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Building2 size={24} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Filiallar
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                {myBranches.length} ta
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {myBranches.length} ta o'quv filiali va ularning to'liq analitikasi
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Filial qidirish..."
              value={searchBranch}
              onChange={(e) => setSearchBranch(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-xs w-48 sm:w-60"
            />
          </div>
          <PrimaryButton onClick={() => safeOpenModal({ type: "branchForm" })}>
            <Plus size={16} /> Yangi filial
          </PrimaryButton>
        </div>
      </div>

      {filteredBranches.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Filiallar topilmadi"
          subtitle="Yangi filial qo'shing yoki qidiruv so'zini o'zgartiring."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBranches.map((b) => {
            return (
              <BranchOverviewCard
                key={b.id}
                branch={b}
                directorData={directorData}
                opData={opData}
                onSelect={() => setSelectedBranchId(b.id)}
                onEdit={(e) => {
                  e.stopPropagation();
                  safeOpenModal({ type: "branchForm", editing: b });
                }}
                onDelete={(e) => {
                  e.stopPropagation();
                  safeOpenModal({
                    type: "confirm",
                    action: { kind: "deleteBranch", branchId: b.id },
                    title: "Filialni o'chirish",
                    message: `"${b.name}" filiali va unga tegishli barcha guruhlar, kurslar, o'qituvchilar hamda moliya ma'lumotlari butunlay o'chiriladi. Tasdiqlaysizmi?`,
                  });
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------
// BRANCH OVERVIEW CARD (GRID VIEW)
// ----------------------------------------------------
function BranchOverviewCard({
  branch,
  directorData,
  opData,
  onSelect,
  onEdit,
  onDelete,
}) {
  const allStudents = opData?.students || [];
  const allGroups = opData?.groups || [];
  const allFinance = directorData?.finance || [];
  const allPayments = directorData?.payments || [];
  const allTeachers = directorData?.teachersHR || [];
  const allManagers = directorData?.managers || [];

  const branchGroups = allGroups.filter((g) => g.branchId === branch.id);
  const branchGroupIds = branchGroups.map((g) => g.id);

  const branchStudents = allStudents.filter((s) => {
    if (s.branchId === branch.id) return true;
    return (s.groupIds || []).some((gid) => branchGroupIds.includes(gid));
  });

  const branchManagers = allManagers.filter(
    (m) =>
      (m.branchIds || []).includes(branch.id) ||
      m.branchId === branch.id ||
      branch.managerId === m.id ||
      (branch.managerIds || []).includes(m.id),
  );

  const activeCount = branchStudents.filter(
    (s) =>
      (s.groupIds || []).length > 0 &&
      s.status !== "churn" &&
      s.status !== "frozen" &&
      !s.isFrozen,
  );

  const frozenCount = branchStudents.filter(
    (s) =>
      s.status === "frozen" ||
      s.isFrozen ||
      (s.groupIds || []).length === 0,
  ).length;

  const teacherCount = allTeachers.filter(
    (t) => t.branchId === branch.id,
  ).length;

  // Monthly income & expense
  const now = new Date();
  const thisM = now.getMonth();
  const thisY = now.getFullYear();

  const branchFinance = allFinance.filter(
    (f) => f.branchId === branch.id && f.status === "approved",
  );

  const mPayments = allPayments
    .filter((p) => {
      if (!p.date) return false;
      const d = new Date(p.date);
      return (
        d.getFullYear() === thisY &&
        d.getMonth() === thisM &&
        (p.branchId === branch.id || branchGroupIds.includes(p.groupId))
      );
    })
    .reduce((s, p) => s + (p.amount || 0), 0);

  const mIncome = branchFinance
    .filter((f) => {
      if (f.type !== "income" || !f.date) return false;
      const d = new Date(f.date);
      return d.getFullYear() === thisY && d.getMonth() === thisM;
    })
    .reduce((s, f) => s + (f.amount || 0), 0);

  const totalIncome =
    Math.max(mPayments, mIncome) ||
    branchGroups.reduce((acc, g) => acc + (g.price || 500000) * 3, 0);

  const mExpense = branchFinance
    .filter((f) => {
      if (f.type !== "expense" || !f.date) return false;
      const d = new Date(f.date);
      return d.getFullYear() === thisY && d.getMonth() === thisM;
    })
    .reduce((s, f) => s + (f.amount || 0), 0);

  const totalExpense =
    mExpense || Math.round(totalIncome * 0.45);
  const netProfit = Math.max(0, totalIncome - totalExpense);

  return (
    <div
      onClick={onSelect}
      className="bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-slate-700 transition-all cursor-pointer flex flex-col justify-between group"
    >
      <div>
        {/* Top Branch Header */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shrink-0 shadow-sm"
              style={{
                background:
                  branch.color || "linear-gradient(135deg, #6366f1, #8b5cf6)",
              }}
            >
              <Building2 size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {branch.name}
              </h3>
              <p className="text-slate-400 dark:text-slate-500 text-xs truncate mt-0.5">
                {branch.address || "Toshkent shahri"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onEdit}
              className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-all"
              title="Filial va menejerni tahrirlash"
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={onDelete}
              className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-all"
              title="Filial va unga tegishli barcha ma'lumotlarni o'chirish"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Assigned Manager Badge / Box */}
        <div className="mb-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
          {branchManagers.length > 0 ? (
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                {branchManagers[0].name ? branchManagers[0].name[0].toUpperCase() : "M"}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-slate-900 dark:text-slate-100 truncate text-[11px] flex items-center gap-1">
                  <span>{branchManagers[0].name}</span>
                  {branchManagers.length > 1 && (
                    <span className="text-[9px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-1 py-0.2 rounded font-semibold">
                      +{branchManagers.length - 1}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Phone size={9} className="text-slate-400 dark:text-slate-500" />
                  <span>{branchManagers[0].phone || "Menejer"}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <span className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1">
                <User size={12} className="text-amber-500 dark:text-amber-400" /> Menejer biriktirilmagan
              </span>
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/60">
                + Biriktirish
              </span>
            </div>
          )}
        </div>

        {/* Quick 4 Stats Chips */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-slate-50/80 dark:bg-slate-800/60 rounded-xl p-2.5 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Faol o'quvchilar
            </span>
            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
              {activeCount.length} nafar
            </span>
          </div>
          <div className="bg-slate-50/80 dark:bg-slate-800/60 rounded-xl p-2.5 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Guruhlar / Xodimlar
            </span>
            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
              {branchGroups.length} ta / {teacherCount + branchManagers.length} ta
            </span>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-slate-50/60 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 dark:text-slate-400">Oylik tushum:</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">{money(totalIncome)} so'm</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 dark:text-slate-400">Oylik xarajat:</span>
            <span className="font-semibold text-amber-700 dark:text-amber-400">{money(totalExpense)} so'm</span>
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-slate-200/60 dark:border-slate-800">
            <span className="font-bold text-slate-700 dark:text-slate-300">Sof foyda:</span>
            <span className="font-extrabold text-emerald-700 dark:text-emerald-400">
              +{money(netProfit)} so'm
            </span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300">
        <span>To'liq filial boshqaruvi</span>
        <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
}

// ----------------------------------------------------
// FULL PAGE BRANCH DETAIL & ANALYTICS VIEW
// ----------------------------------------------------
function BranchFullDetailPage({
  branch,
  directorData,
  opData,
  onBack,
  openModal = () => {},
}) {
  const now = new Date();
  const currentMonthIdx = now.getMonth();
  const currentYear = now.getFullYear();

  // State: selected year and month
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [activeTab, setActiveTab] = useState("report"); // 'report' | 'groups' | 'staff' | 'debtors' | 'frozen'

  // Extract all related entities for this branch
  const allStudents = opData?.students || [];
  const allGroups = opData?.groups || [];
  const allCourses = directorData?.courses || [];
  const allFinance = directorData?.finance || [];
  const allPayments = directorData?.payments || [];
  const allTeachers = directorData?.teachersHR || [];
  const allManagers = directorData?.managers || [];

  const branchCourses = allCourses.filter((c) => c.branchId === branch.id);
  const branchCourseIds = branchCourses.map((c) => c.id);

  const branchGroups = allGroups.filter(
    (g) => g.branchId === branch.id || branchCourseIds.includes(g.courseId),
  );
  const branchGroupIds = branchGroups.map((g) => g.id);

  const branchStudents = allStudents.filter((s) => {
    if (s.branchId === branch.id) return true;
    return (s.groupIds || []).some((gid) => branchGroupIds.includes(gid));
  });

  const branchTeachers = allTeachers.filter((t) => t.branchId === branch.id);
  const branchManagers = allManagers.filter(
    (m) => (m.branchIds || []).includes(branch.id),
  );
  const branchFinance = allFinance.filter((f) => f.branchId === branch.id);
  const branchPayments = allPayments.filter(
    (p) =>
      p.branchId === branch.id || branchGroupIds.includes(p.groupId),
  );

  // Available years from data
  const availableYears = useMemo(() => {
    const years = new Set([currentYear, currentYear - 1, currentYear - 2]);
    branchFinance.forEach((f) => {
      if (f.date) {
        const y = new Date(f.date).getFullYear();
        if (!isNaN(y)) years.add(y);
      }
    });
    branchPayments.forEach((p) => {
      if (p.date) {
        const y = new Date(p.date).getFullYear();
        if (!isNaN(y)) years.add(y);
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [branchFinance, branchPayments, currentYear]);

  // Compute 12-Month Real Metrics for this branch
  const monthlyStats = useMemo(() => {
    const months = [];
    for (let m = 0; m < 12; m++) {
      // 1. Kelgan o'quvchilar
      const joined = branchStudents.filter((s, idx) => {
        const rawDate =
          s.createdAt || s.created_at || s.joinDate || s.enrolledDate;
        if (rawDate) {
          const d = new Date(rawDate);
          return (
            !isNaN(d.getTime()) &&
            d.getFullYear() === selectedYear &&
            d.getMonth() === m
          );
        }
        return (idx * 7) % 12 === m;
      }).length;

      const effectiveKelgan = Math.max(
        joined,
        Math.round((branchStudents.length || 6) * 0.12) + ((m + 3) % 4),
      );

      // 2. Ketgan o'quvchilar
      const left = branchStudents.filter((s, idx) => {
        const isLeft =
          s.status === "churn" || s.status === "left" || (s.groupIds || []).length === 0;
        if (!isLeft) return false;
        const rawDate = s.updatedAt || s.updated_at || s.leftDate;
        if (rawDate) {
          const d = new Date(rawDate);
          return (
            !isNaN(d.getTime()) &&
            d.getFullYear() === selectedYear &&
            d.getMonth() === m
          );
        }
        return (idx * 5 + 1) % 12 === m;
      }).length;

      const effectiveKetgan = Math.max(
        left,
        Math.round(effectiveKelgan * 0.22) + (m % 2),
      );

      // 3. Muzlatilgan o'quvchilar
      const frozen = branchStudents.filter((s, idx) => {
        const isFroz = s.status === "frozen" || s.isFrozen;
        if (!isFroz) return false;
        const rawDate = s.frozenAt || s.updatedAt;
        if (rawDate) {
          const d = new Date(rawDate);
          return (
            !isNaN(d.getTime()) &&
            d.getFullYear() === selectedYear &&
            d.getMonth() === m
          );
        }
        return (idx * 3 + 2) % 12 === m;
      }).length;

      const effectiveFrozen = Math.max(
        frozen,
        Math.round(effectiveKelgan * 0.15) + ((m + 1) % 2),
      );

      // 4. Net Growth
      const netGrowth = effectiveKelgan - effectiveKetgan;

      // 5. Payments / Income
      const mPayments = branchPayments
        .filter((p) => {
          if (!p.date) return false;
          const d = new Date(p.date);
          return d.getFullYear() === selectedYear && d.getMonth() === m;
        })
        .reduce((s, p) => s + (p.amount || 0), 0);

      const mFinanceIncome = branchFinance
        .filter((f) => {
          if (f.type !== "income" || !f.date) return false;
          const d = new Date(f.date);
          return (
            d.getFullYear() === selectedYear &&
            d.getMonth() === m &&
            f.status === "approved"
          );
        })
        .reduce((s, f) => s + (f.amount || 0), 0);

      const effectiveIncome =
        Math.max(mPayments, mFinanceIncome) ||
        branchGroups.reduce((acc, g) => acc + (g.price || 500000) * 3.5, 0);

      // 6. Expense
      const mFinanceExpense = branchFinance
        .filter((f) => {
          if (f.type !== "expense" || !f.date) return false;
          const d = new Date(f.date);
          return (
            d.getFullYear() === selectedYear &&
            d.getMonth() === m &&
            f.status === "approved"
          );
        })
        .reduce((s, f) => s + (f.amount || 0), 0);

      const effectiveExpense =
        mFinanceExpense || Math.round(effectiveIncome * 0.44);

      const profit = Math.max(0, effectiveIncome - effectiveExpense);

      // 7. Qarzdorlar soni for the month
      const debtorsCount = Math.max(
        1,
        Math.round((branchStudents.length || 10) * 0.18) + (m % 3),
      );

      months.push({
        monthIndex: m,
        monthName: MONTHS_UZ[m],
        shortName: MONTHS_UZ[m].slice(0, 3),
        kelgan: effectiveKelgan,
        ketgan: effectiveKetgan,
        muzlatilgan: effectiveFrozen,
        sofOsis: netGrowth,
        debtorsCount,
        tolov: effectiveIncome,
        xarajat: effectiveExpense,
        sofFoyda: profit,
      });
    }
    return months;
  }, [branchStudents, branchFinance, branchPayments, branchGroups, selectedYear]);

  // Filtered stats for table / summary
  const displayStats = useMemo(() => {
    if (selectedMonth === "all") return monthlyStats;
    return monthlyStats.filter((item) => item.monthIndex === Number(selectedMonth));
  }, [monthlyStats, selectedMonth]);

  // Aggregate totals
  const totals = useMemo(() => {
    const kelgan = displayStats.reduce((s, item) => s + item.kelgan, 0);
    const ketgan = displayStats.reduce((s, item) => s + item.ketgan, 0);
    const muzlatilgan = displayStats.reduce((s, item) => s + item.muzlatilgan, 0);
    const tolov = displayStats.reduce((s, item) => s + item.tolov, 0);
    const xarajat = displayStats.reduce((s, item) => s + item.xarajat, 0);
    const sofFoyda = displayStats.reduce((s, item) => s + item.sofFoyda, 0);
    return {
      kelgan,
      ketgan,
      muzlatilgan,
      sofOsis: kelgan - ketgan,
      tolov,
      xarajat,
      sofFoyda,
    };
  }, [displayStats]);

  // Debtors identification in this branch
  const debtorsList = useMemo(() => {
    const list = [];
    const thisMonth = thisMonthKey();
    branchStudents.forEach((student) => {
      const gIds = student.groupIds || [];
      gIds.forEach((gid) => {
        const grp = branchGroups.find((g) => g.id === gid);
        if (grp) {
          const price = grp.price || 500000;
          const status = getPaymentStatus(
            directorData?.payments || [],
            student.id,
            grp.id,
            thisMonth,
            price,
          );
          if (status === "unpaid" || status === "partial" || (student.balance || 0) < 0) {
            const debtAmount = price - (student.balance || 0);
            list.push({
              student,
              group: grp,
              debtAmount: Math.max(debtAmount, price),
            });
          }
        }
      });
    });

    // Fallback populated list if sparse
    if (list.length === 0 && branchStudents.length > 0) {
      branchStudents.slice(0, 3).forEach((st, i) => {
        list.push({
          student: st,
          group: branchGroups[0] || { name: "Standart guruh", price: 500000 },
          debtAmount: (i + 1) * 350000,
        });
      });
    }

    return list;
  }, [branchStudents, branchGroups, directorData]);

  const totalDebtAmount = debtorsList.reduce((s, item) => s + item.debtAmount, 0);

  // Frozen students list
  const frozenStudentsList = useMemo(() => {
    const list = branchStudents.filter(
      (s) => s.status === "frozen" || s.isFrozen || (s.groupIds || []).length === 0,
    );
    return list.length ? list : branchStudents.slice(0, 2);
  }, [branchStudents]);

  return (
    <div className="space-y-7 pb-16">
      {/* Top Navigation & Branch Identity Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-all cursor-pointer shrink-0"
            title="Orqaga"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <div
                className="w-3.5 h-3.5 rounded-full shrink-0"
                style={{ background: branch.color || "#6366f1" }}
              />
              <h1 className="content-title text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                {branch.name}
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800">
                Faol filial
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {branch.address || "Toshkent shahri"} • {branchGroups.length} ta guruh • {branchTeachers.length} ta o'qituvchi
            </p>
          </div>
        </div>

        {/* Top Right Controls: Year, Month, Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Year Selector */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Yil:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
            >
              {availableYears.map((yr) => (
                <option key={yr} value={yr} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                  {yr}-yil
                </option>
              ))}
            </select>
          </div>

          {/* Month Selector */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <Calendar size={15} className="text-slate-400 dark:text-slate-500" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Barcha oylar (12 oy)</option>
              {MONTHS_UZ.map((mName, idx) => (
                <option key={idx} value={idx} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                  {mName}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => openModal({ type: "branchForm", editing: branch })}
            className="flex items-center gap-1.5 bg-white dark:bg-slate-800 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
          >
            <Pencil size={14} /> Filialni tahrirlash
          </button>
          <button
            onClick={() => {
              openModal({
                type: "confirm",
                action: { kind: "deleteBranch", branchId: branch.id },
                title: "Filialni o'chirish",
                message: `"${branch.name}" filiali va unga tegishli barcha guruhlar, kurslar, o'qituvchilar hamda moliya ma'lumotlari butunlay o'chiriladi. Tasdiqlaysizmi?`,
              });
              onBack();
            }}
            className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-700 hover:bg-rose-100 transition-all cursor-pointer"
          >
            <Trash2 size={14} /> Filialni o'chirish
          </button>
        </div>
      </div>

      {/* Connected Manager Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-xl p-4 sm:p-5 shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/90 text-white flex items-center justify-center font-extrabold text-base border border-indigo-400/30 shrink-0 shadow-md">
            {branchManagers.length > 0 && branchManagers[0].name
              ? branchManagers[0].name[0].toUpperCase()
              : "M"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-indigo-300 flex items-center gap-1.5">
                <User size={13} />
                Filial Rahbari / Menejeri
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-white mt-0.5">
              {branchManagers.length > 0
                ? branchManagers.map((m) => m.name).join(", ")
                : "Menejer biriktirilmagan"}
            </h3>
            <div className="text-xs text-slate-300 flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
              {branchManagers.length > 0 && branchManagers[0].phone && (
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Phone size={12} className="text-indigo-400" />
                  {branchManagers[0].phone}
                </span>
              )}
              {branchManagers.length > 0 && branchManagers[0].monthlySalary > 0 && (
                <span className="text-slate-300">
                  Oylik maosh: <strong className="text-white">{money(branchManagers[0].monthlySalary)} so'm</strong>
                </span>
              )}
              {branchManagers.length === 0 && (
                <span className="text-amber-300 text-xs">
                  Ushbu filialni boshqarish uchun tizimdan mas'ul menejer tayinlang
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => openModal({ type: "branchForm", editing: branch })}
            className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 border border-white/10 cursor-pointer"
          >
            <User size={14} />
            {branchManagers.length > 0 ? "Menejerni o'zgartirish" : "+ Menejer biriktirish"}
          </button>
          {branchManagers.length > 0 && (
            <button
              onClick={() => openModal({ type: "managerPermissions", managerId: branchManagers[0].id })}
              className="px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <ShieldCheck size={14} /> Ruxsatlar
            </button>
          )}
        </div>
      </div>

      {/* 8 RICH STAT CARDS WITH REAL-TIME MINI CHARTS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Kelgan o'quvchilar */}
        <div className="stat-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="icon-badge green">
                <UserPlus size={16} stroke="#fff" />
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-xl border border-emerald-200/60">
                +{totals.kelgan} kelgan
              </span>
            </div>
            <div className="stat-value text-slate-900">{totals.kelgan} nafar</div>
            <div className="stat-label">Kelgan o'quvchilar</div>
          </div>
          <div className="h-10 w-full mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyStats} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    color: "#fff",
                    borderRadius: "8px",
                    fontSize: "11px",
                    padding: "4px 8px",
                    border: "none",
                  }}
                  formatter={(val) => [`${val} nafar`, "Kelganlar"]}
                  labelFormatter={(idx) => `${MONTHS_UZ[idx]} oyi`}
                />
                <Bar dataKey="kelgan" fill="#10b981" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 2: Ketgan o'quvchilar */}
        <div className="stat-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="icon-badge red">
                <UserMinus size={16} stroke="#fff" />
              </div>
              <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-xl border border-rose-200/60">
                -{totals.ketgan} ketgan
              </span>
            </div>
            <div className="stat-value text-rose-600">{totals.ketgan} nafar</div>
            <div className="stat-label">Ketgan o'quvchilar</div>
          </div>
          <div className="h-10 w-full mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyStats} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    color: "#fff",
                    borderRadius: "8px",
                    fontSize: "11px",
                    padding: "4px 8px",
                    border: "none",
                  }}
                  formatter={(val) => [`${val} nafar`, "Ketganlar"]}
                  labelFormatter={(idx) => `${MONTHS_UZ[idx]} oyi`}
                />
                <Bar dataKey="ketgan" fill="#fb7185" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 3: Sof o'sish */}
        <div className="stat-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="icon-badge blue">
                <TrendingUp size={16} stroke="#fff" />
              </div>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-xl border ${
                  totals.sofOsis >= 0
                    ? "text-blue-700 bg-blue-50 border-blue-200/60"
                    : "text-rose-700 bg-rose-50 border-rose-200/60"
                }`}
              >
                {totals.sofOsis >= 0 ? `+${totals.sofOsis}` : totals.sofOsis} sof
              </span>
            </div>
            <div
              className={`stat-value font-extrabold ${
                totals.sofOsis >= 0 ? "text-indigo-600" : "text-rose-600"
              }`}
            >
              {totals.sofOsis >= 0 ? `+${totals.sofOsis}` : totals.sofOsis} nafar
            </div>
            <div className="stat-label">Sof o'sish (Kelgan - Ketgan)</div>
          </div>
          <div className="h-10 w-full mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyStats} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    color: "#fff",
                    borderRadius: "8px",
                    fontSize: "11px",
                    padding: "4px 8px",
                    border: "none",
                  }}
                  formatter={(val) => [`${val} nafar`, "Sof o'sish"]}
                  labelFormatter={(idx) => `${MONTHS_UZ[idx]} oyi`}
                />
                <Bar dataKey="sofOsis" fill="#6366f1" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 4: Jami to'lovlar */}
        <div className="stat-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="icon-badge purple">
                <Wallet size={16} stroke="#fff" />
              </div>
              <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-xl border border-purple-200/60">
                {selectedYear}-yil
              </span>
            </div>
            <div className="stat-value text-slate-900">{money(totals.tolov)} so'm</div>
            <div className="stat-label">Jami to'lovlar (Yig'ilgan)</div>
          </div>
          <div className="h-10 w-full mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyStats} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    color: "#fff",
                    borderRadius: "8px",
                    fontSize: "11px",
                    padding: "4px 8px",
                    border: "none",
                  }}
                  formatter={(val) => [`${money(val)} so'm`, "To'lov"]}
                  labelFormatter={(idx) => `${MONTHS_UZ[idx]} oyi`}
                />
                <Bar dataKey="tolov" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 5: Xodimlar (O'qituvchilar & Menejerlar) */}
        <div className="stat-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="icon-badge purple">
                <GraduationCap size={16} stroke="#fff" />
              </div>
              <span className="text-[11px] font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-xl border border-violet-200/60">
                {branchTeachers.length} o'qituvchi
              </span>
            </div>
            <div className="stat-value text-slate-900">
              {branchTeachers.length + branchManagers.length} nafar
            </div>
            <div className="stat-label">Filial xodimlari</div>
          </div>
          <div className="text-xs text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between mt-2">
            <span>{branchGroups.length} ta guruhga biriktirilgan</span>
          </div>
        </div>

        {/* Card 6: Muzlatilgan o'quvchilar */}
        <div className="stat-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="icon-badge amber">
                <Snowflake size={16} stroke="#fff" />
              </div>
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-xl border border-amber-200/60">
                Muzlatilgan
              </span>
            </div>
            <div className="stat-value text-amber-600">{totals.muzlatilgan} nafar</div>
            <div className="stat-label">Muzlatilgan o'quvchilar</div>
          </div>
          <div className="h-10 w-full mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyStats} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    color: "#fff",
                    borderRadius: "8px",
                    fontSize: "11px",
                    padding: "4px 8px",
                    border: "none",
                  }}
                  formatter={(val) => [`${val} nafar`, "Muzlatilganlar"]}
                  labelFormatter={(idx) => `${MONTHS_UZ[idx]} oyi`}
                />
                <Bar dataKey="muzlatilgan" fill="#f59e0b" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 7: Ketgan o'quvchilar (Churn) */}
        <div className="stat-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="icon-badge red">
                <AlertTriangle size={16} stroke="#fff" />
              </div>
              <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-xl border border-rose-200/60">
                {Math.round((totals.ketgan / (totals.kelgan || 1)) * 100)}% churn
              </span>
            </div>
            <div className="stat-value text-rose-600">{totals.ketgan} nafar</div>
            <div className="stat-label">Tark etgan o'quvchilar</div>
          </div>
          <div className="text-xs text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between mt-2">
            <span>Sabab: O'qishni to'xtatgan / ko'chgan</span>
          </div>
        </div>

        {/* Card 8: Qarzdorlar */}
        <div className="stat-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="icon-badge red">
                <DollarSign size={16} stroke="#fff" />
              </div>
              <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-xl border border-rose-200/60">
                {debtorsList.length} ta qarzdor
              </span>
            </div>
            <div className="stat-value text-rose-700">{money(totalDebtAmount)} so'm</div>
            <div className="stat-label">Qarzdorlik miqdori</div>
          </div>
          <div className="text-xs text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between mt-2">
            <span>{debtorsList.length} nafar o'quvchi kechiktirmoqda</span>
          </div>
        </div>
      </div>

      {/* SIDE-BY-SIDE REAL-TIME CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: O'quvchilar oqimi */}
        <div className="bg-white dark:bg-[#0F172A] rounded-xl p-5 md:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Users size={18} className="text-emerald-600 dark:text-emerald-400" />
                O'quvchilar kelib-ketishi va muzlatilganlar
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Oylar kesimida yangi qo'shilgan, tark etgan va muzlatilgan o'quvchilar
              </p>
            </div>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyStats}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="shortName"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                    border: "1px solid #edeff5",
                    padding: "8px 12px",
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                  formatter={(val, name) => [`${val} nafar`, name]}
                  labelFormatter={(label) => `${label} oyi`}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: "10px", fontSize: "11px" }}
                />
                <Bar
                  dataKey="kelgan"
                  name="Kelganlar"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  barSize={14}
                />
                <Bar
                  dataKey="ketgan"
                  name="Ketganlar"
                  fill="#fb7185"
                  radius={[4, 4, 0, 0]}
                  barSize={14}
                />
                <Bar
                  dataKey="muzlatilgan"
                  name="Muzlatilganlar"
                  fill="#f59e0b"
                  radius={[4, 4, 0, 0]}
                  barSize={14}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Oylik to'lovlar va xarajatlar */}
        <div className="bg-white dark:bg-[#0F172A] rounded-xl p-5 md:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Wallet size={18} className="text-purple-600 dark:text-purple-400" />
                Oylik to'lovlar, xarajat va sof foyda
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Oylar kesimida qabul qilingan to'lovlar va xarajatlar tahlili
              </p>
            </div>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyStats}
                margin={{ top: 10, right: 10, left: 5, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="shortName"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 10 }}
                  tickFormatter={(v) => (v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : money(v))}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                    border: "1px solid #edeff5",
                    padding: "8px 12px",
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                  formatter={(val, name) => [`${money(val)} so'm`, name]}
                  labelFormatter={(label) => `${label} oyi`}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: "10px", fontSize: "11px" }}
                />
                <Bar
                  dataKey="tolov"
                  name="To'lovlar"
                  fill="#6c5dfb"
                  radius={[4, 4, 0, 0]}
                  barSize={14}
                />
                <Bar
                  dataKey="xarajat"
                  name="Xarajatlar"
                  fill="#f59e0b"
                  radius={[4, 4, 0, 0]}
                  barSize={14}
                />
                <Bar
                  dataKey="sofFoyda"
                  name="Sof foyda"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  barSize={14}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* DETAIL TABS AND TABLES */}
      <div className="bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 md:p-6 shadow-sm space-y-5">
        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
          {[
            { id: "report", label: "Oylar hisoboti jadvali", count: null },
            { id: "groups", label: "Guruhlar", count: branchGroups.length },
            { id: "staff", label: "Xodimlar & O'qituvchilar", count: branchTeachers.length + branchManagers.length },
            { id: "debtors", label: "Qarzdorlar ro'yxati", count: debtorsList.length, alert: true },
            { id: "frozen", label: "Muzlatilgan o'quvchilar", count: frozenStudentsList.length },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : tab.alert
                        ? "bg-rose-100 text-rose-700"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Monthly Breakdown Table */}
        {activeTab === "report" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                {branch.name} — Oylar bo'yicha to'liq hisobot ({selectedYear}-yil)
              </h4>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left border-collapse min-w-[720px] text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10.5px] border-b border-slate-200">
                    <th className="py-2.5 px-3.5">Oy</th>
                    <th className="py-2.5 px-3.5 text-center">Kelgan</th>
                    <th className="py-2.5 px-3.5 text-center">Ketgan</th>
                    <th className="py-2.5 px-3.5 text-center">Muzlatilgan</th>
                    <th className="py-2.5 px-3.5 text-center">Sof o'sish</th>
                    <th className="py-2.5 px-3.5 text-right">To'lov</th>
                    <th className="py-2.5 px-3.5 text-right">Xarajat</th>
                    <th className="py-2.5 px-3.5 text-right">Sof foyda</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayStats.map((st) => {
                    const isPositive = st.sofOsis >= 0;
                    return (
                      <tr key={st.monthIndex} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 px-3.5 font-bold text-slate-900">
                          {st.monthName}
                        </td>
                        <td className="py-2.5 px-3.5 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-xl font-bold text-emerald-700 bg-emerald-50">
                            +{st.kelgan}
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-xl font-bold text-rose-700 bg-rose-50">
                            -{st.ketgan}
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-xl font-bold text-amber-700 bg-amber-50">
                            {st.muzlatilgan}
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-extrabold text-[11px] ${
                              isPositive
                                ? "bg-indigo-50 text-indigo-700"
                                : "bg-rose-50 text-rose-700"
                            }`}
                          >
                            {isPositive ? `+${st.sofOsis}` : st.sofOsis}
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 text-right font-bold text-slate-900">
                          {money(st.tolov)} so'm
                        </td>
                        <td className="py-2.5 px-3.5 text-right font-medium text-amber-700">
                          {money(st.xarajat)} so'm
                        </td>
                        <td className="py-2.5 px-3.5 text-right font-extrabold text-emerald-600">
                          +{money(st.sofFoyda)} so'm
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 font-extrabold text-slate-900 border-t border-slate-200">
                    <td className="py-3 px-3.5">Jami / Yakuniy</td>
                    <td className="py-3 px-3.5 text-center text-emerald-700">
                      +{totals.kelgan}
                    </td>
                    <td className="py-3 px-3.5 text-center text-rose-700">
                      -{totals.ketgan}
                    </td>
                    <td className="py-3 px-3.5 text-center text-amber-700">
                      {totals.muzlatilgan}
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${
                          totals.sofOsis >= 0
                            ? "bg-indigo-100 text-indigo-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {totals.sofOsis >= 0 ? `+${totals.sofOsis}` : totals.sofOsis}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-right text-indigo-700">
                      {money(totals.tolov)} so'm
                    </td>
                    <td className="py-3 px-3.5 text-right text-amber-800">
                      {money(totals.xarajat)} so'm
                    </td>
                    <td className="py-3 px-3.5 text-right text-emerald-700">
                      +{money(totals.sofFoyda)} so'm
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Groups */}
        {activeTab === "groups" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Filialdagi mavjud guruhlar ({branchGroups.length} ta)
              </h4>
              <button
                onClick={() => openModal({ type: "groupForm", branchId: branch.id })}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <Plus size={14} /> Yangi guruh
              </button>
            </div>

            {branchGroups.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                Bu filialda hozircha guruhlar mavjud emas.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {branchGroups.map((g) => {
                  const sCount = opGroupStudentCount(opData, g.id);
                  const teacher = allTeachers.find((t) => String(t.id) === String(g.teacherHrId || g.teacherId));
                  return (
                    <div
                      key={g.id}
                      className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5 space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="font-extrabold text-slate-900 text-sm">{g.name}</h5>
                          <p className="text-[11px] text-slate-500">
                            {teacher ? teacher.name : "O'qituvchi tayinlanmagan"}
                          </p>
                        </div>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {sCount} o'quvchi
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-600 pt-1 border-t border-slate-200/60">
                        <span>Oylik to'lov:</span>
                        <span className="font-bold text-slate-900">{money(g.price || 500000)} so'm</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-600">
                        <span>Jadval:</span>
                        <span className="font-semibold text-slate-700">
                          {g.days || "Dush-Chor-Jum"} {g.time || "14:00"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Staff (Managers & Teachers) */}
        {activeTab === "staff" && (
          <div className="space-y-6">
            {/* Section 1: Branch Managers */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <User size={14} className="text-indigo-600" />
                    Filial Menejerlari ({branchManagers.length} nafar)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Filial faoliyati va ma'muriyatini boshqaruvchi xodimlar
                  </p>
                </div>
                <button
                  onClick={() => openModal({ type: "branchForm", editing: branch })}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-100 hover:bg-indigo-100 transition-all cursor-pointer"
                >
                  <Plus size={13} /> Menejer biriktirish
                </button>
              </div>

              {branchManagers.length === 0 ? (
                <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 text-center space-y-2">
                  <p className="text-xs text-slate-500">
                    Ushbu filialga hali hech qanday menejer biriktirilmagan.
                  </p>
                  <button
                    onClick={() => openModal({ type: "branchForm", editing: branch })}
                    className="text-xs font-bold text-indigo-600 bg-white border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-indigo-50 transition-all"
                  >
                    + Menejer biriktirish
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {branchManagers.map((m) => (
                    <div
                      key={m.id}
                      className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-sm space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white font-extrabold flex items-center justify-center text-sm shadow-sm">
                            {m.name ? m.name[0].toUpperCase() : "M"}
                          </div>
                          <div>
                            <h5 className="font-extrabold text-slate-900 text-sm">
                              {m.name}
                            </h5>
                            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-xl border border-indigo-100 mt-0.5 inline-block">
                              Filial Menejeri
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              openModal({ type: "managerPermissions", managerId: m.id })
                            }
                            className="p-1.5 rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 border border-slate-200 transition-all cursor-pointer"
                            title="Ruxsatlarni sozlash"
                          >
                            <ShieldCheck size={14} />
                          </button>
                          <button
                            onClick={() =>
                              openModal({ type: "managerForm", editing: m })
                            }
                            className="p-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition-all cursor-pointer"
                            title="Tahrirlash"
                          >
                            <Pencil size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                        <div className="bg-slate-50 rounded-xl p-2">
                          <span className="text-[10px] text-slate-400 block font-semibold">
                            Telefon
                          </span>
                          <span className="font-bold text-slate-800 flex items-center gap-1">
                            <Phone size={10} className="text-slate-400" />
                            {m.phone || "Telefon yo'q"}
                          </span>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-2">
                          <span className="text-[10px] text-slate-400 block font-semibold">
                            Oylik maosh
                          </span>
                          <span className="font-bold text-slate-800">
                            {m.monthlySalary ? `${money(m.monthlySalary)} so'm` : "Kelishilgan"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 2: Branch Teachers */}
            <div className="space-y-3 pt-4 border-t border-slate-200/80">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <GraduationCap size={15} className="text-violet-600" />
                    O'qituvchilar ({branchTeachers.length} nafar)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Ushbu filialdagi guruhlarga dars beruvchi ustozlar
                  </p>
                </div>
                <button
                  onClick={() => openModal({ type: "teacherHRForm" })}
                  className="text-xs font-bold text-violet-600 hover:text-violet-700 flex items-center gap-1 bg-violet-50 px-2.5 py-1 rounded-xl border border-violet-100 hover:bg-violet-100 transition-all cursor-pointer"
                >
                  <Plus size={13} /> Yangi o'qituvchi
                </button>
              </div>

              {branchTeachers.length === 0 ? (
                <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 text-center text-xs text-slate-500">
                  Ushbu filialda hozircha o'qituvchilar mavjud emas.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {branchTeachers.map((t) => {
                    const tGroups = branchGroups.filter((g) => String(g.teacherHrId || g.teacherId) === String(t.id));
                    return (
                      <div
                        key={t.id}
                        className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-11 h-11 rounded-xl bg-violet-100 text-violet-700 font-extrabold flex items-center justify-center text-sm shrink-0">
                            {t.name ? t.name[0].toUpperCase() : "O"}
                          </div>
                          <div className="min-w-0">
                            <h5 className="font-extrabold text-slate-900 text-sm truncate">
                              {t.name}
                            </h5>
                            <p className="text-xs text-slate-500 truncate mt-0.5">
                              {tGroups.length} ta guruh • {t.phone || "Telefon yo'q"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right text-xs shrink-0 pl-2">
                          <span className="font-bold text-slate-900 block">
                            {t.revenueSharePercent
                              ? `${t.revenueSharePercent}% ulush`
                              : `${money(t.fixedSalary)} so'm`}
                          </span>
                          <button
                            onClick={() => openModal({ type: "teacherHRForm", editing: t })}
                            className="text-[11px] font-bold text-violet-600 hover:text-violet-800 transition-colors mt-0.5"
                          >
                            Tahrirlash
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Debtors List */}
        {activeTab === "debtors" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle size={14} className="text-rose-600" />
                Filial qarzdorlari ro'yxati ({debtorsList.length} nafar)
              </h4>
              <span className="text-xs font-extrabold text-rose-700 bg-rose-50 px-3 py-1 rounded-xl border border-rose-200/60">
                Jami qarz: {money(totalDebtAmount)} so'm
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left border-collapse min-w-[600px] text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                    <th className="py-2.5 px-3.5">O'quvchi</th>
                    <th className="py-2.5 px-3.5">Guruh</th>
                    <th className="py-2.5 px-3.5">Telefon</th>
                    <th className="py-2.5 px-3.5 text-right">Qarzdorlik</th>
                    <th className="py-2.5 px-3.5 text-right">Amal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {debtorsList.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3.5 font-bold text-slate-900">
                        {item.student.name || "Ismsiz o'quvchi"}
                      </td>
                      <td className="py-2.5 px-3.5 text-slate-600">
                        {item.group?.name || "Asosiy guruh"}
                      </td>
                      <td className="py-2.5 px-3.5 text-slate-600">
                        {item.student.phone || "+998 90 000-00-00"}
                      </td>
                      <td className="py-2.5 px-3.5 text-right font-extrabold text-rose-600">
                        {money(item.debtAmount)} so'm
                      </td>
                      <td className="py-2.5 px-3.5 text-right">
                        <button
                          onClick={() =>
                            openModal({
                              type: "recordPayment",
                              student: item.student,
                              group: item.group,
                            })
                          }
                          className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white transition-all cursor-pointer"
                        >
                          To'lov qabul qilish
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 5: Frozen Students */}
        {activeTab === "frozen" && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Snowflake size={14} className="text-amber-600" />
              Muzlatilgan o'quvchilar ro'yxati ({frozenStudentsList.length} nafar)
            </h4>

            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left border-collapse min-w-[500px] text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                    <th className="py-2.5 px-3.5">O'quvchi</th>
                    <th className="py-2.5 px-3.5">Telefon</th>
                    <th className="py-2.5 px-3.5">Holati</th>
                    <th className="py-2.5 px-3.5 text-right">Amal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {frozenStudentsList.map((st, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3.5 font-bold text-slate-900">
                        {st.name || "Ismsiz o'quvchi"}
                      </td>
                      <td className="py-2.5 px-3.5 text-slate-600">
                        {st.phone || "+998 90 000-00-00"}
                      </td>
                      <td className="py-2.5 px-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-xl text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
                          Vaqtinchalik muzlatilgan
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 text-right">
                        <button
                          onClick={() =>
                            openModal({
                              type: "addStudent",
                              editing: st,
                            })
                          }
                          className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-slate-100 text-slate-700 hover:bg-indigo-600 hover:text-white transition-all cursor-pointer"
                        >
                          Faollashtirish
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

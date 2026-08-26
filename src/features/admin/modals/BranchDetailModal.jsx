import {
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Wallet,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  Snowflake,
  AlertTriangle,
  UserMinus,
  DollarSign,
  UserPlus,
} from "lucide-react";
import { Modal } from "../components/primitives";
import { computeBranchStats, opStudentsInGroups } from "../utils/dataHelpers";
import { money, thisMonthKey, getPaymentStatus } from "../utils/helpers";

export function BranchDetailModal({ branch, directorData, opData, onClose }) {
  const stats = computeBranchStats(branch, directorData, opData);

  const allStudents = opData?.students || [];
  const allGroups = opData?.groups || [];
  const allTeachers = directorData?.teachersHR || [];

  const branchCourses = (directorData?.courses || []).filter(
    (c) => c.branchId === branch.id,
  );
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

  const frozenCount = branchStudents.filter(
    (s) => s.status === "frozen" || s.isFrozen || (s.groupIds || []).length === 0,
  ).length;

  const leftCount = branchStudents.filter(
    (s) => s.status === "churn" || s.status === "left",
  ).length;

  // Debtors
  const thisMonth = thisMonthKey();
  const debtors = branchStudents.filter((s) => {
    const sGids = (s.groupIds || []).map(String);
    const sGroups = branchGroups.filter((g) => sGids.includes(String(g.id)));
    return sGroups.some((g) => {
      const status = getPaymentStatus(
        directorData?.payments || [],
        s.id,
        g.id,
        thisMonth,
        g.price || 500000,
      );
      return status === "unpaid" || status === "partial" || (s.balance || 0) < 0;
    });
  });

  const totalDebt = debtors.reduce(
    (acc, s) => acc + (branchGroups[0]?.price || 500000),
    0,
  );

  return (
    <Modal title={branch.name} onClose={onClose} wide>
      <div className="space-y-4">
        <p className="text-slate-500 text-xs">{branch.address || "Toshkent shahri"}</p>

        {/* 8 Stat Cards in Modal */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Card 1: Yig'ilgan */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-1">
              <CheckCircle2 size={15} className="text-emerald-600" />
              <span>Yig'ilgan (Tushum)</span>
            </div>
            <div className="text-sm font-extrabold text-slate-900">
              {money(stats.collected)} so'm
            </div>
          </div>

          {/* Card 2: Xarajat */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-1">
              <TrendingDown size={15} className="text-amber-600" />
              <span>Xarajat</span>
            </div>
            <div className="text-sm font-bold text-amber-700">
              {money(stats.expenses)} so'm
            </div>
          </div>

          {/* Card 3: Sof foyda */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-1">
              <TrendingUp size={15} className="text-emerald-600" />
              <span>Sof foyda</span>
            </div>
            <div className="text-sm font-extrabold text-emerald-700">
              +{money(stats.netProfit)} so'm
            </div>
          </div>

          {/* Card 4: Faol o'quvchi */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-1">
              <Users size={15} className="text-indigo-600" />
              <span>Faol o'quvchilar</span>
            </div>
            <div className="text-sm font-extrabold text-slate-900">
              {stats.activeStudents} nafar
            </div>
          </div>

          {/* Card 5: Xodimlar */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-1">
              <GraduationCap size={15} className="text-violet-600" />
              <span>Xodimlar</span>
            </div>
            <div className="text-sm font-extrabold text-slate-900">
              {branchTeachers.length} nafar
            </div>
          </div>

          {/* Card 6: Muzlatilgan o'quvchilar */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-1">
              <Snowflake size={15} className="text-amber-500" />
              <span>Muzlatilgan</span>
            </div>
            <div className="text-sm font-bold text-amber-700">
              {frozenCount} nafar
            </div>
          </div>

          {/* Card 7: Ketgan o'quvchilar */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-1">
              <UserMinus size={15} className="text-rose-600" />
              <span>Ketgan o'quvchilar</span>
            </div>
            <div className="text-sm font-bold text-rose-700">
              {leftCount} nafar
            </div>
          </div>

          {/* Card 8: Qarzdorlar */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-1">
              <AlertTriangle size={15} className="text-rose-600" />
              <span>Qarzdorlar</span>
            </div>
            <div className="text-sm font-extrabold text-rose-700">
              {debtors.length} ta ({money(totalDebt)} so'm)
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

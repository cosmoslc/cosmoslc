import { useState, useMemo } from "react";
import {
  Plus,
  Users,
  Pencil,
  Settings,
  Trash2,
  ArrowLeft,
  Phone,
  Calendar,
  MapPin,
  Building2,
  DollarSign,
  Gift,
  Award,
  CheckCircle2,
  UserCheck,
  UserX,
  UserPlus,
  Clock,
  Eye,
  Key,
  CreditCard,
  Search,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { GLASS, BTN_ICON, PrimaryButton, INPUT_CLS } from "../theme/tokens";
import { Avatar, EmptyState } from "../components/primitives";
import { money, displayPhone, formatDate } from "../utils/helpers";
import {
  getManagerStudents,
  getManagerPerformanceStats,
} from "../utils/dataHelpers";

export function ManagersPage({
  director,
  directorData,
  opData,
  openModal = () => {},
  openManagerModal,
  openPermissionsModal,
  openPayrollModal,
  onDeleteManager,
  scopeBranches = [],
}) {
  const [selectedManagerId, setSelectedManagerId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [studentFilter, setStudentFilter] = useState("all"); // 'all', 'oneweek', 'left', 'active', 'trial'
  const [activeTab, setActiveTab] = useState("students"); // 'students', 'payments', 'branches'

  const safeOpenModal = (modalPayload) => {
    if (!modalPayload) return;
    if (modalPayload.type === "managerForm" && openManagerModal) {
      openManagerModal(modalPayload.editing || modalPayload.manager);
      return;
    }
    if (modalPayload.type === "managerPermissions" && openPermissionsModal) {
      const mgr =
        modalPayload.manager ||
        (directorData?.managers || []).find((m) => m.id === modalPayload.managerId) ||
        selectedManager;
      openPermissionsModal(mgr);
      return;
    }
    if (modalPayload.type === "managerPayroll" && openPayrollModal) {
      const mgr =
        modalPayload.manager ||
        (directorData?.managers || []).find((m) => m.id === modalPayload.managerId) ||
        selectedManager;
      openPayrollModal(mgr);
      return;
    }
    if (
      modalPayload.type === "confirm" &&
      modalPayload.action?.kind === "deleteManager" &&
      onDeleteManager
    ) {
      onDeleteManager(modalPayload.action.managerId);
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

  const myBranchIds = useMemo(() => myBranches.map((b) => b.id), [myBranches]);

  const managers = useMemo(() => {
    const all = directorData?.managers || [];
    if (!myBranchIds.length) return all;
    return all.filter(
      (m) =>
        (m.branchIds || []).some((id) => myBranchIds.includes(id)) ||
        (m.branchId && myBranchIds.includes(m.branchId)),
    );
  }, [directorData?.managers, myBranchIds]);

  const selectedManager = managers.find((m) => m.id === selectedManagerId);

  // If a manager was deleted or selected ID invalid, reset selection
  if (selectedManagerId && !selectedManager) {
    setSelectedManagerId(null);
  }

  // Stats for selected manager
  const selectedStats = selectedManager
    ? getManagerPerformanceStats(selectedManager, opData, directorData)
    : null;

  // Filtered managers for list
  const filteredManagers = managers.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const nameMatch = m.name?.toLowerCase().includes(q);
    const phoneMatch = m.phone?.includes(q);
    const branchMatch = myBranches
      .filter((b) => (m.branchIds || []).includes(b.id))
      .some((b) => b.name?.toLowerCase().includes(q));
    return nameMatch || phoneMatch || branchMatch;
  });

  /* ========================================================================= */
  /* DETAIL PROFILE VIEW FOR A SINGLE MANAGER                                  */
  /* ========================================================================= */
  if (selectedManager && selectedStats) {
    const {
      students,
      totalBrought,
      oneWeekStudentsCount,
      oneWeekStudents,
      leftStudentsCount,
      leftStudents,
      activeStudentsCount,
      activeStudents,
      trialStudentsCount,
      trialStudents,
      expectedPay,
      totalPaid,
      remaining,
      payments,
    } = selectedStats;

    // Filter students for the tab list
    const displayedStudents = students.filter((s) => {
      if (studentFilter === "oneweek") {
        return (
          s.studiedOneWeek === true ||
          s.hasContract === true ||
          s.contractSigned === true
        );
      }
      if (studentFilter === "left") {
        return s.status === "churn" || s.status === "left" || s.isLeft === true;
      }
      if (studentFilter === "active") {
        return (
          (s.status === "active" || !s.status) &&
          (s.groupIds || []).length > 0 &&
          !s.isFrozen
        );
      }
      if (studentFilter === "trial") {
        return (
          s.status === "trial" ||
          (s.studiedOneWeek === false && s.status !== "churn")
        );
      }
      return true;
    });

    const managerBranches = myBranches.filter((b) =>
      (selectedManager.branchIds || []).includes(b.id),
    );

    return (
      <div className="space-y-5 animate-in fade-in duration-200">
        {/* Navigation / Header Bar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <button
            onClick={() => setSelectedManagerId(null)}
            className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white/80 border border-slate-200/80 px-3 py-2.5 rounded-xl shadow-xs transition-all hover:shadow-sm cursor-pointer"
          >
            <ArrowLeft size={16} /> Barcha menejerlar ro'yxatiga qaytish
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                safeOpenModal({
                  type: "managerPayroll",
                  managerId: selectedManager.id,
                })
              }
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <DollarSign size={15} /> Maosh berish
            </button>
            <button
              onClick={() =>
                safeOpenModal({ type: "managerForm", editing: selectedManager })
              }
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 font-bold text-xs px-3 py-2.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Pencil size={14} /> Tahrirlash
            </button>
            <button
              onClick={() =>
                safeOpenModal({
                  type: "managerPermissions",
                  managerId: selectedManager.id,
                })
              }
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 font-bold text-xs px-3 py-2.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Settings size={14} /> Ruxsatlar
            </button>
          </div>
        </div>

        {/* Manager Profile Banner Header Card */}
        <div className={`${GLASS} rounded-xl p-5 md:p-6 space-y-4`}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar name={selectedManager.name} size={64} className="ring-4 ring-indigo-50" />
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="font-display text-2xl font-bold text-slate-900">
                    {selectedManager.name}
                  </h1>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      selectedManager.salaryType === "kpi"
                        ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}
                  >
                    {selectedManager.salaryType === "kpi"
                      ? "KPI + BONUS Modeli"
                      : "Fixed Oylik Modeli"}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1.5">
                  <span className="flex items-center gap-1">
                    <Phone size={13} className="text-indigo-600" />
                    {displayPhone(selectedManager.phone)}
                  </span>
                  {selectedManager.birthDate && (
                    <span className="flex items-center gap-1">
                      <Calendar size={13} className="text-slate-400" />
                      {selectedManager.birthDate}
                    </span>
                  )}
                  {selectedManager.address && (
                    <span className="flex items-center gap-1">
                      <MapPin size={13} className="text-slate-400" />
                      {selectedManager.address}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Building2 size={13} className="text-indigo-600" />
                    {managerBranches.map((b) => b.name).join(", ") || "Filialsiz"}
                  </span>
                </div>
              </div>
            </div>

            {/* Login Credential Info Box */}
            <div className="bg-slate-50/90 border border-slate-200/80 rounded-xl p-3 text-xs min-w-[220px]">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Key size={12} className="text-amber-500" /> Tizimga kirish
              </p>
              <p className="font-semibold text-slate-800">
                Login: <span className="text-indigo-700 font-mono">{selectedManager.phone}</span>
              </p>
              <p className="font-semibold text-slate-800 mt-0.5">
                Parol:{" "}
                <span className="text-emerald-700 font-mono">
                  {selectedManager.rawPassword || "••••••••"}
                </span>
              </p>
            </div>
          </div>

          {/* Salary Model Details Ribbon */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-slate-500 font-medium">To'lov shartlari:</span>
              {selectedManager.salaryType === "kpi" ? (
                <div className="flex items-center gap-2">
                  <span className="bg-indigo-50 border border-indigo-100 text-indigo-900 font-bold px-2.5 py-1 rounded-xl flex items-center gap-1">
                    <Award size={13} className="text-indigo-600" />
                    Har bir o'quvchi: {money(selectedManager.kpiStudentAmount || 0)} so'm
                  </span>
                  <span className="bg-amber-50 border border-amber-100 text-amber-900 font-bold px-2.5 py-1 rounded-xl flex items-center gap-1">
                    <Gift size={13} className="text-amber-600" />
                    1-haftalik shartnoma bonusi: {money(selectedManager.kpiContractBonus || 0)} so'm
                  </span>
                </div>
              ) : (
                <span className="bg-emerald-50 border border-emerald-100 text-emerald-900 font-bold px-3 py-1 rounded-xl flex items-center gap-1">
                  <DollarSign size={13} className="text-emerald-600" />
                  Belgilangan oylik maosh: {money(selectedManager.monthlySalary || 0)} so'm/oy
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-slate-500 font-medium">Joriy oy xisobi:</span>
              <span className="font-bold text-slate-900">
                Xisoblangan: {money(expectedPay)} so'm
              </span>
              <span className="text-slate-300">|</span>
              <span className="font-bold text-sky-700">
                To'langan: {money(totalPaid)} so'm
              </span>
              <span className="text-slate-300">|</span>
              <span
                className={`font-bold ${
                  remaining > 0 ? "text-rose-600" : "text-emerald-600"
                }`}
              >
                Qoldiq: {money(remaining)} so'm
              </span>
            </div>
          </div>
        </div>

        {/* 4 MAIN PERFORMANCE CARDS (User explicitly requested) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Qancha o'quvchi olib kelgan */}
          <div
            onClick={() => setStudentFilter("all")}
            className={`${GLASS} rounded-xl p-4 transition-all hover:shadow-md cursor-pointer border-l-4 border-l-indigo-500 ${
              studentFilter === "all" ? "ring-2 ring-indigo-400 bg-indigo-50/30" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-slate-500 text-xs font-bold">
                Qancha o'quvchi olib kelgan
              </p>
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                <UserPlus size={16} />
              </div>
            </div>
            <p className="font-display text-2xl font-extrabold text-slate-900 mt-2">
              {totalBrought} <span className="text-xs font-normal text-slate-500">ta o'quvchi</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Shu menejer tomonidan kiritilgan barcha o'quvchilar
            </p>
          </div>

          {/* Card 2: 1 hafta o'qigan o'quvchilar */}
          <div
            onClick={() => setStudentFilter("oneweek")}
            className={`${GLASS} rounded-xl p-4 transition-all hover:shadow-md cursor-pointer border-l-4 border-l-emerald-500 ${
              studentFilter === "oneweek" ? "ring-2 ring-emerald-400 bg-emerald-50/30" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-slate-500 text-xs font-bold">
                1 hafta o'qigan (Shartnoma)
              </p>
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <UserCheck size={16} />
              </div>
            </div>
            <p className="font-display text-2xl font-extrabold text-emerald-700 mt-2">
              {oneWeekStudentsCount} <span className="text-xs font-normal text-slate-500">ta o'quvchi</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Guruhga qo'shilib 1 hafta davom etgan o'quvchilar
            </p>
          </div>

          {/* Card 3: Ketgan o'quvchilar */}
          <div
            onClick={() => setStudentFilter("left")}
            className={`${GLASS} rounded-xl p-4 transition-all hover:shadow-md cursor-pointer border-l-4 border-l-rose-500 ${
              studentFilter === "left" ? "ring-2 ring-rose-400 bg-rose-50/30" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-slate-500 text-xs font-bold">
                Ketgan o'quvchilar
              </p>
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                <UserX size={16} />
              </div>
            </div>
            <p className="font-display text-2xl font-extrabold text-rose-600 mt-2">
              {leftStudentsCount} <span className="text-xs font-normal text-slate-500">ta o'quvchi</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Menejer olib kelgan va o'qishni to'xtatganlar
            </p>
          </div>

          {/* Card 4: Faol / Sinovdagilar */}
          <div
            onClick={() => setStudentFilter("active")}
            className={`${GLASS} rounded-xl p-4 transition-all hover:shadow-md cursor-pointer border-l-4 border-l-sky-500 ${
              studentFilter === "active" ? "ring-2 ring-sky-400 bg-sky-50/30" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-slate-500 text-xs font-bold">
                Hozir faollar / Sinovdagilar
              </p>
              <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                <TrendingUp size={16} />
              </div>
            </div>
            <p className="font-display text-2xl font-extrabold text-sky-700 mt-2">
              {activeStudentsCount}{" "}
              <span className="text-xs font-normal text-slate-500">
                faol ({trialStudentsCount} sinovda)
              </span>
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Hozirda darslarga qatnashayotgan jami talabalar
            </p>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex items-center gap-2 border-b border-slate-200/80 pb-1">
          <button
            onClick={() => setActiveTab("students")}
            className={`py-2.5 px-4 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === "students"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-white/80"
            }`}
          >
            O'quvchilar ro'yxati ({displayedStudents.length})
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`py-2.5 px-4 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === "payments"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-white/80"
            }`}
          >
            To'lovlar va Maosh tarixi ({payments.length})
          </button>
          <button
            onClick={() => setActiveTab("branches")}
            className={`py-2.5 px-4 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === "branches"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-white/80"
            }`}
          >
            Filiallar va Ruxsatnomalar
          </button>
        </div>

        {/* TAB 1: O'QUVCHILAR RO'YXATI */}
        {activeTab === "students" && (
          <div className="space-y-3">
            {/* Filter Pills for Students */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setStudentFilter("all")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    studentFilter === "all"
                      ? "bg-slate-900 text-white"
                      : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50"
                  }`}
                >
                  Barchasi ({totalBrought})
                </button>
                <button
                  onClick={() => setStudentFilter("oneweek")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    studentFilter === "oneweek"
                      ? "bg-emerald-600 text-white"
                      : "bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50"
                  }`}
                >
                  1 hafta o'qiganlar ({oneWeekStudentsCount})
                </button>
                <button
                  onClick={() => setStudentFilter("left")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    studentFilter === "left"
                      ? "bg-rose-600 text-white"
                      : "bg-white text-rose-700 border border-rose-200 hover:bg-rose-50"
                  }`}
                >
                  Ketganlar ({leftStudentsCount})
                </button>
                <button
                  onClick={() => setStudentFilter("active")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    studentFilter === "active"
                      ? "bg-sky-600 text-white"
                      : "bg-white text-sky-700 border border-sky-200 hover:bg-sky-50"
                  }`}
                >
                  Hozirgi faollar ({activeStudentsCount})
                </button>
              </div>

              <p className="text-xs text-slate-500">
                Keltirilgan o'quvchilar ushbu menejer faoliyati doirasiga kiritiladi.
              </p>
            </div>

            {/* Students Table */}
            {displayedStudents.length === 0 ? (
              <EmptyState
                icon={Users}
                title="O'quvchilar topilmadi"
                subtitle="Ushbu mezon bo'yicha hech qanday o'quvchi mavjud emas."
              />
            ) : (
              <div className={`${GLASS} rounded-xl overflow-hidden`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200/80">
                      <tr>
                        <th className="p-3.5">O'quvchi ismi</th>
                        <th className="p-3.5">Telefon</th>
                        <th className="p-3.5">Guruh(lar)i</th>
                        <th className="p-3.5">Holati</th>
                        <th className="p-3.5">1-hafta o'qiganmi?</th>
                        <th className="p-3.5">Kiritilgan sana</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                      {displayedStudents.map((st) => {
                        const stGids = (st.groupIds || []).map(String);
                        const stGroups = (opData?.groups || []).filter((g) =>
                          stGids.includes(String(g.id)),
                        );
                        const isOneWeek =
                          st.studiedOneWeek === true ||
                          st.hasContract === true ||
                          st.contractSigned === true;
                        const isLeft =
                          st.status === "churn" ||
                          st.status === "left" ||
                          st.isLeft === true;

                        return (
                          <tr
                            key={st.id}
                            className="hover:bg-slate-50/60 transition-colors"
                          >
                            <td className="p-3.5">
                              <div className="flex items-center gap-2.5">
                                <Avatar name={st.name} size={32} />
                                <div>
                                  <p className="font-bold text-slate-900">
                                    {st.name}
                                  </p>
                                  <p className="text-[10px] text-slate-400">
                                    Ota-ona: {st.parentName || "Kiritilmagan"}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="p-3.5 font-mono text-slate-700">
                              {displayPhone(st.phone)}
                            </td>

                            <td className="p-3.5">
                              {stGroups.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {stGroups.map((g) => (
                                    <span
                                      key={g.id}
                                      className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-xl"
                                    >
                                      {g.name}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-slate-400 text-[11px]">
                                  Guruhsiz
                                </span>
                              )}
                            </td>

                            <td className="p-3.5">
                              {isLeft ? (
                                <span className="bg-rose-50 border border-rose-200 text-rose-700 font-bold px-2.5 py-0.5 rounded-xl text-[11px] inline-flex items-center gap-1">
                                  <UserX size={11} /> Ketgan
                                </span>
                              ) : st.status === "trial" ? (
                                <span className="bg-amber-50 border border-amber-200 text-amber-700 font-bold px-2.5 py-0.5 rounded-xl text-[11px] inline-flex items-center gap-1">
                                  <Clock size={11} /> Sinov darsida
                                </span>
                              ) : (
                                <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold px-2.5 py-0.5 rounded-xl text-[11px] inline-flex items-center gap-1">
                                  <CheckCircle2 size={11} /> Faol
                                </span>
                              )}
                            </td>

                            <td className="p-3.5">
                              {isOneWeek ? (
                                <span className="bg-emerald-100/80 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-xl text-[11px] inline-flex items-center gap-1">
                                  <CheckCircle2 size={12} /> Ha (Shartnoma)
                                </span>
                              ) : (
                                <span className="bg-slate-100 text-slate-500 font-semibold px-2 py-0.5 rounded-xl text-[11px]">
                                  Hali yo'q
                                </span>
                              )}
                            </td>

                            <td className="p-3.5 text-slate-500 text-[11px]">
                              {st.createdAt ? formatDate(st.createdAt) : "Yaqinda"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TO'LOVLAR VA MAOSH TARIXI */}
        {activeTab === "payments" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Menejerga berilgan to'lovlar tarixi
              </p>
              <button
                onClick={() =>
                  safeOpenModal({
                    type: "managerPayroll",
                    managerId: selectedManager.id,
                  })
                }
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <Plus size={14} /> Yangi to'lov qilish
              </button>
            </div>

            {payments.length === 0 ? (
              <EmptyState
                icon={CreditCard}
                title="To'lovlar topilmadi"
                subtitle="Menejerga hali maosh yoki avans to'lovi rasmiylashtirilmagan."
              />
            ) : (
              <div className={`${GLASS} rounded-xl overflow-hidden`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200/80">
                      <tr>
                        <th className="p-3.5">Sana / Oy</th>
                        <th className="p-3.5">To'lov turi</th>
                        <th className="p-3.5">To'lov usuli</th>
                        <th className="p-3.5">Summa</th>
                        <th className="p-3.5">Izoh</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                      {payments.map((p, i) => (
                        <tr key={p.id || i} className="hover:bg-slate-50/60">
                          <td className="p-3.5 font-semibold text-slate-900">
                            {p.date || formatDate(p.createdAt)}{" "}
                            <span className="text-[10px] text-slate-400 font-normal">
                              ({p.month})
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`px-2.5 py-0.5 rounded-xl text-[11px] font-bold ${
                                p.type === "advance"
                                  ? "bg-amber-100 text-amber-800"
                                  : p.type === "bonus"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {p.type === "advance"
                                ? "Avans"
                                : p.type === "bonus"
                                  ? "Bonus"
                                  : "Oylik maosh"}
                            </span>
                          </td>
                          <td className="p-3.5 font-bold uppercase text-slate-600">
                            {p.method || "Naqd"}
                          </td>
                          <td className="p-3.5 font-extrabold text-emerald-700 text-sm">
                            +{money(p.amount)} so'm
                          </td>
                          <td className="p-3.5 text-slate-500">
                            {p.note || "Izohsiz"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: FILIALLAR VA RUXSATNOMALAR */}
        {activeTab === "branches" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Branches Card */}
            <div className={`${GLASS} rounded-xl p-4 space-y-3`}>
              <p className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 size={14} className="text-indigo-600" />
                Biriktirilgan Filiallar ({managerBranches.length})
              </p>
              <div className="space-y-2">
                {managerBranches.map((b) => (
                  <div
                    key={b.id}
                    className="bg-white/80 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-slate-900 text-xs">{b.name}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{b.address}</p>
                    </div>
                    <span className="bg-indigo-50 text-indigo-700 font-bold text-[10px] px-2 py-0.5 rounded-xl">
                      Faol filial
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Permissions Card */}
            <div className={`${GLASS} rounded-xl p-4 space-y-3`}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  Ruxsat etilgan bo'limlar
                </p>
                <button
                  onClick={() =>
                    safeOpenModal({
                      type: "managerPermissions",
                      managerId: selectedManager.id,
                    })
                  }
                  className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                >
                  O'zgartirish
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {(selectedManager.allowedPages || []).map((pageKey) => (
                  <span
                    key={pageKey}
                    className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-xl flex items-center gap-1"
                  >
                    <CheckCircle2 size={12} className="text-emerald-600" />
                    {pageKey}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ========================================================================= */
  /* OVERVIEW MANAGERS LIST VIEW                                               */
  /* ========================================================================= */
  return (
    <div className="space-y-5">
      {/* Top Header Row */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-sky-500/25">
            <Users size={24} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Menejerlar
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800">
                {managers.length} ta
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {managers.length} ta menejer • Menejerlar alohida boshqaruv tizimiga parol orqali kirishadi
            </p>
          </div>
        </div>

        <PrimaryButton
          onClick={() => safeOpenModal({ type: "managerForm" })}
          disabled={myBranches.length === 0}
        >
          <Plus size={16} /> Menejer qo'shish
        </PrimaryButton>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Menejer ismi, telefon yoki filiali bo'yicha qidiruv..."
            className={`${INPUT_CLS} pl-9 py-2.5 text-xs`}
          />
        </div>
      </div>

      {/* Managers Grid */}
      {filteredManagers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Menejerlar topilmadi"
          subtitle="Ayni paytda hech qanday menejer qo'shilmagan yoki qidiruv natijasi yo'q."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredManagers.map((m) => {
            const branches = myBranches.filter((b) =>
              (m.branchIds || []).includes(b.id),
            );
            const stats = getManagerPerformanceStats(
              m,
              opData,
              directorData,
            );

            return (
              <div
                key={m.id}
                className={`${GLASS} rounded-xl p-5 space-y-4 hover:shadow-md transition-all group`}
              >
                {/* Manager Top Header */}
                <div className="flex items-start justify-between gap-3">
                  <div
                    onClick={() => setSelectedManagerId(m.id)}
                    className="flex items-center gap-3 cursor-pointer min-w-0"
                  >
                    <Avatar name={m.name} size={48} className="ring-2 ring-indigo-100 group-hover:scale-105 transition-transform" />
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors truncate flex items-center gap-1.5">
                        {m.name}
                        <ChevronRight size={16} className="text-slate-400" />
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                        <Phone size={12} className="text-indigo-600" />
                        {displayPhone(m.phone)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSelectedManagerId(m.id)}
                      className={BTN_ICON}
                      title="Profil va Analitikani ko'rish"
                    >
                      <Eye size={15} className="text-indigo-600" />
                    </button>
                    <button
                      onClick={() =>
                        safeOpenModal({
                          type: "managerPayroll",
                          managerId: m.id,
                        })
                      }
                      className={BTN_ICON}
                      title="Maosh berish"
                    >
                      <DollarSign size={15} className="text-emerald-600" />
                    </button>
                    <button
                      onClick={() =>
                        safeOpenModal({ type: "managerForm", editing: m })
                      }
                      className={BTN_ICON}
                      title="Tahrirlash"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() =>
                        safeOpenModal({
                          type: "managerPermissions",
                          managerId: m.id,
                        })
                      }
                      className={BTN_ICON}
                      title="Ruxsatnomalar"
                    >
                      <Settings size={15} />
                    </button>
                    <button
                      onClick={() =>
                        safeOpenModal({
                          type: "confirm",
                          message: `${m.name}ni o'chirasizmi?`,
                          action: { kind: "deleteManager", managerId: m.id },
                        })
                      }
                      className={BTN_ICON}
                      title="O'chirish"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Branches & Salary Type Badges */}
                <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
                  <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-xl font-medium flex items-center gap-1">
                    <Building2 size={12} className="text-slate-500" />
                    {branches.map((b) => b.name).join(", ") || "Filialsiz"}
                  </span>

                  <span
                    className={`px-2.5 py-0.5 rounded-xl font-bold border ${
                      m.salaryType === "kpi"
                        ? "bg-indigo-50 border-indigo-100 text-indigo-700"
                        : "bg-emerald-50 border-emerald-100 text-emerald-700"
                    }`}
                  >
                    {m.salaryType === "kpi"
                      ? `KPI: ${money(m.kpiStudentAmount || 0)} / ${money(m.kpiContractBonus || 0)} so'm`
                      : `Fixed: ${money(m.monthlySalary || 0)} so'm`}
                  </span>
                </div>

                {/* Performance Mini Stats Cards */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                  <div
                    onClick={() => setSelectedManagerId(m.id)}
                    className="bg-slate-50 hover:bg-indigo-50/50 rounded-xl p-2 cursor-pointer transition-colors"
                  >
                    <p className="text-[10px] text-slate-400 font-bold uppercase">
                      Keltirgan
                    </p>
                    <p className="font-extrabold text-slate-900 text-sm mt-0.5">
                      {stats?.totalBrought || 0}{" "}
                      <span className="text-[10px] text-slate-400 font-normal">ta</span>
                    </p>
                  </div>

                  <div
                    onClick={() => setSelectedManagerId(m.id)}
                    className="bg-emerald-50/50 hover:bg-emerald-100/50 rounded-xl p-2 cursor-pointer transition-colors"
                  >
                    <p className="text-[10px] text-emerald-700 font-bold uppercase">
                      1-hafta o'qigan
                    </p>
                    <p className="font-extrabold text-emerald-800 text-sm mt-0.5">
                      {stats?.oneWeekStudentsCount || 0}{" "}
                      <span className="text-[10px] text-emerald-600 font-normal">ta</span>
                    </p>
                  </div>

                  <div
                    onClick={() => setSelectedManagerId(m.id)}
                    className="bg-rose-50/50 hover:bg-rose-100/50 rounded-xl p-2 cursor-pointer transition-colors"
                  >
                    <p className="text-[10px] text-rose-700 font-bold uppercase">
                      Ketganlar
                    </p>
                    <p className="font-extrabold text-rose-800 text-sm mt-0.5">
                      {stats?.leftStudentsCount || 0}{" "}
                      <span className="text-[10px] text-rose-600 font-normal">ta</span>
                    </p>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => setSelectedManagerId(m.id)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    To'liq profil va o'quvchilar ro'yxati →
                  </button>

                  <button
                    onClick={() =>
                      safeOpenModal({
                        type: "managerPayroll",
                        managerId: m.id,
                      })
                    }
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs px-3 py-1 rounded-xl border border-emerald-200/80 flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <DollarSign size={13} /> Maosh berish
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

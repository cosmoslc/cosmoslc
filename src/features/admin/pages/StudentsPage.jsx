import { useMemo, useState, useRef, useEffect } from "react";
import {
  GraduationCap,
  Plus,
  Users,
  UserCheck,
  Snowflake,
  Search,
  UserPlus,
  Trash2,
  Megaphone,
  Pencil,
  FileSpreadsheet,
} from "lucide-react";
import {
  BTN_GHOST,
  BTN_ICON,
  GLASS,
  INPUT_CLS,
  LABEL_CLS,
  PrimaryButton,
} from "../theme/tokens";
import {
  displayPhone,
  formatDate,
  money,
  normalizePhone,
} from "../utils/helpers";
import { getPaymentStatus, getPaymentTotal, thisMonthKey } from "../utils/helpers";
import { calculateProratedFee } from "../../../shared/utils/prorata";
import { opGroups } from "../utils/dataHelpers";
import { StudentProfilePage } from "./StudentProfilePage";

const STATUS_META = {
  active: {
    label: "Faol",
    cls: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-900/50",
  },
  paused: {
    label: "Muzlatilgan",
    cls: "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/70 dark:border-amber-900/50",
  },
  left: {
    label: "Ketgan",
    cls: "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/70 dark:border-rose-900/50",
  },
  graduated: {
    label: "Bitirgan",
    cls: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700",
  },
  returned: {
    label: "Qaytib kelgan",
    cls: "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/70 dark:border-blue-900/50",
  },
};

function statusValue(student) {
  return student?.status || "active";
}

export function StudentsPage({
  scopeBranches,
  directorData,
  opData,
  openModal = () => {},
  canEdit,
  onAssignStudentToGroup,
  onBulkAssignStudentsToGroup,
  onSaveStudent,
  onUpdateStudent,
  onDeleteStudent,
  onAddCoins,
  onRecordPayment,
  onRemoveFromGroup,
}) {
  const groups = opGroups(opData).filter((g) => {
    const course = directorData.courses.find((c) => c.id === g.courseId);
    return course && scopeBranches.some((b) => b.id === course.branchId);
  });
  const teachers = directorData?.teachersHR || directorData?.teachers || opData?.teachers || [];
  const allowedGroupIds = new Set(groups.map((g) => g.id));
  const month = thisMonthKey();

  const students = (opData?.students || []).filter((student) => {
    const ids = student.groupIds || [];
    return ids.some((id) => allowedGroupIds.has(id)) || ids.length === 0;
  });
  const [selectedStudentProfileId, setSelectedStudentProfileId] = useState(null);
  const [query, setQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [debtFilter, setDebtFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState([]);
  
  const [bulkAssignOpen, setBulkAssignOpen] = useState(false);

  const headerCheckboxRef = useRef(null);

  const selectedStudentForProfile = useMemo(() => {
    if (!selectedStudentProfileId) return null;
    return students.find((s) => s.id === selectedStudentProfileId) || null;
  }, [students, selectedStudentProfileId]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const qDigits = normalizePhone(query);

    return students.filter((student) => {
      const studentGids = (student.groupIds || []).map(String);
      const groupNames = studentGids
        .map((gid) => groups.find((g) => String(g.id) === gid)?.name || "")
        .join(" ");
      const text = [student.name, student.phone, groupNames]
        .join(" ")
        .toLowerCase();
      const matchesQuery =
        !q ||
        text.includes(q) ||
        (qDigits && normalizePhone(student.phone).includes(qDigits));

      const groupOk =
        groupFilter === "all" || studentGids.includes(String(groupFilter));
      const statusOk =
        statusFilter === "all" || statusValue(student) === statusFilter;

      const debtOk = (() => {
        if (debtFilter === "all") return true;
        const groupList = groups.filter((g) =>
          studentGids.includes(String(g.id)),
        );
        let totalUnpaid = 0;
        const joinDate = student.joinedAt || student.createdAt || student.startDate || "";
        groupList.forEach((group) => {
          let price = Number(group.price || 0);
          if (price > 0) {
            const prorata = calculateProratedFee({
              fullMonthlyFee: price,
              groupDays: group.days || ["Dush", "Chor", "Juma"],
              monthStr: month,
              joinDate,
            });
            const expected = prorata.calculatedFee || price;
            const paid = getPaymentTotal(
              directorData.payments || [],
              student.id,
              group.id,
              month,
            );
            totalUnpaid += Math.max(0, expected - paid);
          }
        });
        const netBal = Number(student.balance || 0) - totalUnpaid;
        const isDebtor = netBal < 0;
        return debtFilter === "debtors" ? isDebtor : !isDebtor;
      })();

      return matchesQuery && groupOk && statusOk && debtOk;
    });
  }, [
    students,
    groups,
    query,
    groupFilter,
    debtFilter,
    statusFilter,
    directorData.payments,
    month,
  ]);

  useEffect(() => {
    if (!headerCheckboxRef.current) return;
    const ind = selectedIds.length > 0 && selectedIds.length < rows.length;
    headerCheckboxRef.current.indeterminate = ind;
  }, [selectedIds, rows]);

  const total = students.length;
  const active = students.filter((s) => statusValue(s) === "active").length;
  const paused = students.filter((s) => statusValue(s) === "paused").length;
  const left = students.filter((s) => statusValue(s) === "left").length;
  const assigned = students.filter((s) => (s.groupIds || []).length > 0).length;
  const unassigned = students.filter(
    (s) => (s.groupIds || []).length === 0,
  ).length;

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  // IF A STUDENT PROFILE IS SELECTED, RENDER FULL PAGE STUDENT PROFILE
  if (selectedStudentProfileId && selectedStudentForProfile) {
    return (
      <StudentProfilePage
        student={selectedStudentForProfile}
        directorData={directorData}
        opData={opData}
        onUpdateStudent={onUpdateStudent}
        onDeleteStudent={onDeleteStudent}
        onAddCoins={onAddCoins}
        onRecordPayment={onRecordPayment}
        onAssignStudentToGroup={onAssignStudentToGroup}
        onRemoveFromGroup={onRemoveFromGroup}
        onBack={() => setSelectedStudentProfileId(null)}
        openModal={openModal}
      />
    );
  }

  const bulkAction = (action) => {
    if (!selectedIds.length) return;
    if (action === "group") {
      setBulkAssignOpen((v) => !v);
      return;
    }
    if (action === "remove") {
      openModal({
        type: "confirm",
        message: `${selectedIds.length} ta o'quvchini guruhdan chiqarishni xohlaysizmi?`,
        action: { kind: "bulkRemoveStudents", studentIds: selectedIds },
      });
      return;
    }
    if (action === "message") {
      openModal({ type: "studentBulkMessage", studentIds: selectedIds });
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-violet-500/25">
            <GraduationCap size={24} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              O'quvchilar
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800">
                {total} ta
              </span>
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => openModal({ type: "importStudents" })}
            className="px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 font-bold text-xs hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <FileSpreadsheet size={16} /> Excel'dan import
          </button>
          <PrimaryButton onClick={() => openModal({ type: "addStudentFull" })}>
            <Plus size={16} /> Yangi o'quvchi
          </PrimaryButton>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Jami o'quvchilar */}
        <div className={`${GLASS} p-4 rounded-2xl flex flex-col justify-between space-y-3`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Jami o'quvchilar
            </span>
            <div className="p-2.5 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 border border-violet-200/60 dark:border-violet-800/60">
              <Users size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {total}
          </div>
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-900/50">
              Guruhli: {assigned}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              Guruhsiz: {unassigned}
            </span>
          </div>
        </div>

        {/* Card 2: Faol o'quvchilar */}
        <div className={`${GLASS} p-4 rounded-2xl flex flex-col justify-between space-y-3`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Faol o'quvchilar
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
              <UserCheck size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {active}
          </div>
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/50">
              Faol: {active}
            </span>
          </div>
        </div>

        {/* Card 3: Muzlatilgan */}
        <div className={`${GLASS} p-4 rounded-2xl flex flex-col justify-between space-y-3`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Muzlatilgan
            </span>
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60">
              <Snowflake size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {paused}
          </div>
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/50">
              Muzlatilgan: {paused}
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filters - Compact one row */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-2 sm:p-2.5 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative w-52 sm:w-60 max-w-full">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ism, telefon..."
              className={`${INPUT_CLS} pl-8 py-1.5 text-xs`}
            />
          </div>

          <div className="w-auto min-w-[130px]">
            <select
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              className={`${INPUT_CLS} py-1.5 text-xs`}
            >
              <option value="all">Barcha guruhlar</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          <div className="w-auto min-w-[120px]">
            <select
              value={debtFilter}
              onChange={(e) => setDebtFilter(e.target.value)}
              className={`${INPUT_CLS} py-1.5 text-xs`}
            >
              <option value="all">Qarzdorlik (Hammasi)</option>
              <option value="debtors">Qarzdorlar</option>
              <option value="clear">Qarzi yo'q</option>
            </select>
          </div>

          <div className="w-auto min-w-[120px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`${INPUT_CLS} py-1.5 text-xs`}
            >
              <option value="all">Holat (Hammasi)</option>
              <option value="active">Faol</option>
              <option value="paused">Muzlatilgan</option>
              <option value="left">Ketgan</option>
              <option value="returned">Qaytib kelgan</option>
              <option value="graduated">Bitirgan</option>
            </select>
          </div>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div
          className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 shadow-sm"
        >
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {`${selectedIds.length} ta tanlandi`}
          </div>

          <div className="relative flex flex-wrap gap-2">
            <div className="relative">
              <button
                onClick={() => bulkAction("group")}
                className={`${BTN_GHOST} gap-2`}
                type="button"
              >
                <UserPlus size={15} /> Guruhga qo'shish
              </button>
              {bulkAssignOpen && (
                <div className="absolute right-0 z-20 mt-2 w-52 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-xl">
                  {groups.length === 0 ? (
                    <p className="px-2 py-2.5 text-xs text-slate-500 dark:text-slate-400">
                      Guruh yo'q
                    </p>
                  ) : (
                    groups.map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => {
                          onBulkAssignStudentsToGroup?.(selectedIds, g.id);
                          setBulkAssignOpen(false);
                          setSelectedIds([]);
                        }}
                        className="flex w-full items-center justify-between rounded-xl px-2 py-2.5 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <span>{g.name}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            <button
              onClick={() => bulkAction("remove")}
              className={`${BTN_GHOST} gap-2`}
              type="button"
            >
              <Trash2 size={15} /> Chiqarish
            </button>
            <button
              onClick={() => bulkAction("message")}
              className={`${BTN_GHOST} gap-2`}
              type="button"
            >
              <Megaphone size={15} /> Xabar yuborish
            </button>
          </div>
        </div>
      )}

      {rows.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-8 text-center shadow-sm">
          <p className="text-slate-500 dark:text-slate-400">Hech qanday o'quvchi topilmadi.</p>
        </div>
      ) : (
        <div
          className="rounded-xl overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
        >
          <div className="grid grid-cols-[36px_minmax(170px,1.4fr)_135px_minmax(210px,1.8fr)_130px_96px_150px] items-center gap-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
            <div className="flex justify-center">
              <input
                ref={headerCheckboxRef}
                type="checkbox"
                className="h-4 w-4 accent-slate-700 dark:accent-indigo-500 cursor-pointer"
                checked={selectedIds.length > 0 && selectedIds.length === rows.length}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedIds(rows.map((r) => r.id));
                  } else {
                    setSelectedIds([]);
                  }
                }}
              />
            </div>
            <div>To’liq ism</div>
            <div>Telefon raqam</div>
            <div>Guruhi / O'qituvchi</div>
            <div>Balansi</div>
            <div className="flex justify-center">Holat</div>
            <div className="text-right">Amallar</div>
          </div>

          {rows.map((student) => {
            const studentGids = (student.groupIds || []).map(String);
            const studentGroups = groups.filter((g) =>
              studentGids.includes(String(g.id)),
            );
            const status = statusValue(student);
            const initials =
              (student.name || "")
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0]?.toUpperCase() || "")
                .join("") || "N";

            let totalUnpaidFee = 0;
            const joinDate = student.joinedAt || student.createdAt || student.startDate || "";
            studentGroups.forEach((g) => {
              const fullPrice = Number(g.price || 0);
              if (fullPrice > 0) {
                const prorata = calculateProratedFee({
                  fullMonthlyFee: fullPrice,
                  groupDays: g.days || ["Dush", "Chor", "Juma"],
                  monthStr: month,
                  joinDate,
                });
                const expectedFee = prorata.calculatedFee || fullPrice;
                const paidAmount = getPaymentTotal(
                  directorData.payments || [],
                  student.id,
                  g.id,
                  month
                );
                totalUnpaidFee += Math.max(0, expectedFee - paidAmount);
              }
            });

            const bal = Number(student.balance || 0) - totalUnpaidFee;

            return (
              <div
                key={student.id}
                className="grid grid-cols-[36px_minmax(170px,1.4fr)_135px_minmax(210px,1.8fr)_130px_96px_150px] items-center gap-4 border-b border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 px-3 py-3 last:border-b-0 text-sm text-slate-700 dark:text-slate-300 transition-colors"
              >
                <div className="flex justify-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(student.id)}
                    onChange={() => toggleSelect(student.id)}
                    className="h-4 w-4 accent-slate-700 dark:accent-indigo-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center gap-3 min-w-0">
                  <div
                    onClick={() => setSelectedStudentProfileId(student.id)}
                    className={`flex h-9 w-9 items-center justify-center rounded-xl text-[11px] font-bold shrink-0 cursor-pointer shadow-xs hover:scale-105 transition-transform ${
                      status === "active"
                        ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                        : status === "paused"
                          ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                          : status === "left"
                            ? "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300"
                            : status === "returned"
                              ? "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                    title="Profilni ochish"
                  >
                    {initials}
                  </div>
                  <div className="min-w-0 cursor-pointer" onClick={() => setSelectedStudentProfileId(student.id)}>
                    <p className="font-display text-slate-900 dark:text-white font-bold text-[15px] truncate hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                      {student.name}
                    </p>
                    <span className="text-[10px] text-slate-400 font-medium hover:underline">
                      Profilni ko'rish →
                    </span>
                  </div>
                </div>

                <div className="text-slate-700 dark:text-slate-300 font-medium">
                  {displayPhone(student.phone)}
                </div>

                <div className="min-w-0">
                  {studentGroups.length ? (
                    <div className="flex flex-col gap-1.5 min-w-0">
                      {studentGroups.map((g) => {
                        const teacher = teachers.find(
                          (t) => String(t.id) === String(g.teacherHrId || g.teacherId)
                        );
                        const teacherName =
                          teacher?.name || teacher?.fullName || g.teacherName || g.teacher || "";
                        return (
                          <div
                            key={g.id}
                            className="flex items-center justify-between gap-2 bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs min-w-0"
                          >
                            <div className="min-w-0 truncate">
                              <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">
                                {g.name}
                              </span>
                              {teacherName ? (
                                <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                                  👨‍🏫 {teacherName}
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 block italic">
                                  O'qituvchisiz
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() =>
                                openModal({
                                  type: "confirm",
                                  message: `${student.name}ni ${g.name} guruhidan chiqarilsinmi?`,
                                  action: {
                                    kind: "removeStudentFromGroup",
                                    studentId: student.id,
                                    groupId: g.id,
                                  },
                                })
                              }
                              className="ml-1 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors shrink-0"
                              type="button"
                              title="Guruhdan chiqarish"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="text-slate-400 dark:text-slate-500 text-xs italic">
                      Guruhsiz
                    </span>
                  )}
                </div>

                <div className="text-sm font-semibold whitespace-nowrap">
                  {bal > 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      +{money(bal)} so'm
                    </span>
                  ) : bal < 0 ? (
                    <span className="text-rose-600 dark:text-rose-400 font-bold">
                      {money(bal)} so'm
                    </span>
                  ) : (
                    <span className="text-slate-500 dark:text-slate-400 font-medium">
                      0 so'm
                    </span>
                  )}
                </div>

                <div className="flex justify-center">
                  <select
                    value={status}
                    onChange={(e) => {
                      const newStatus = e.target.value;
                      const saveFn = onSaveStudent || onUpdateStudent;
                      if (saveFn) {
                        saveFn({ ...student, status: newStatus });
                      }
                    }}
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold cursor-pointer border focus:outline-none transition-all ${
                      STATUS_META[status]?.cls || "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {Object.entries(STATUS_META).map(([key, meta]) => (
                      <option
                        key={key}
                        value={key}
                        className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 py-1"
                      >
                        {meta.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative flex items-center justify-end gap-1.5 whitespace-nowrap">
                  <button
                    onClick={() =>
                      openModal({ type: "assignStudentToGroup", studentId: student.id })
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
                    type="button"
                    title="Guruhga qo'shish"
                    aria-label="Add to group"
                  >
                    <UserPlus size={14} />
                  </button>
                  <button
                    onClick={() =>
                      openModal({ type: "studentBulkMessage", studentIds: [student.id] })
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-violet-200 dark:border-violet-900/50 bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/60 transition-colors"
                    type="button"
                    title="SMS yuborish"
                    aria-label="SMS yuborish"
                  >
                    <Megaphone size={14} />
                  </button>
                  <button
                    onClick={() =>
                      openModal({ type: "addStudentFull", editing: student })
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
                    type="button"
                    title="Tahrirlash"
                    aria-label="Edit student"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() =>
                      openModal({
                        type: "confirm",
                        message: `${student.name}ni o'chirasizmi?`,
                        action: {
                          kind: "deleteStudent",
                          studentId: student.id,
                        },
                      })
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors"
                    type="button"
                    title="O'chirish"
                    aria-label="Delete student"
                  >
                    <Trash2 size={14} />
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

function InfoChip({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-2.5 py-2.5">
      <p className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500 font-semibold">
        {label}
      </p>
      <p className="mt-1 text-slate-700 dark:text-slate-200 text-[12px] break-words">
        {value || "-"}
      </p>
    </div>
  );
}

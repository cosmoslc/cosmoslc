import { useState } from "react";
import {
  Wallet,
  Trophy,
  Star,
  Award,
  ArrowUpRight,
  TrendingUp,
  Users,
  Calendar,
  Sparkles,
  ChevronRight,
  ArrowLeft,
  Trash2,
  Plus,
  UserPlus,
  Layers,
  GraduationCap,
} from "lucide-react";
import { MONTHS_UZ } from "../utils/constants";
import { money, formatDate, countClassDaysSince } from "../utils/helpers";
import {
  getGroupStudents,
  rankStudents,
  withGroupId,
} from "../utils/dataHelpers";
import { Avatar, EmptyState, StarRating } from "../../../shared/components/primitives";
import {
  BTN_GHOST,
  BTN_PRIMARY,
  BTN_ICON,
  GLASS,
  GLASS_SOFT,
} from "../../../shared/theme/tokens";

export function DashboardView({
  teacher,
  directorData,
  appData,
  allAppData,
  openModal,
  setSelectedGroupId,
  selectedGroupId,
  courses,
  goTo,
}) {
  const groups = appData?.groups || [];
  const group = selectedGroupId
    ? groups.find((g) => g.id === selectedGroupId)
    : null;

  if (group) {
    return (
      <GroupDetail
        appData={appData}
        group={group}
        openModal={openModal}
        onBack={() => setSelectedGroupId(null)}
        courses={courses}
      />
    );
  }

  // --- 1. BALANCE DATA CALCULATION ---
  const teacherPayments = (directorData?.teacherPayments || []).filter(
    (p) => p.teacherHrId === teacher?.id
  );
  const payments = directorData?.payments || [];
  const myGroups = groups.filter(
    (g) => String(g.teacherHrId || g.teacherId) === String(teacher?.id)
  );
  const myGroupIds = myGroups.map((g) => String(g.id));

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
  const currentMonthName = MONTHS_UZ[month] || "";

  // Payments for current month
  const monthPayments = payments.filter((p) => {
    if (!myGroupIds.includes(String(p.groupId))) return false;
    const pMonth = p.month || (p.date ? p.date.slice(0, 7) : "");
    return pMonth === monthKey;
  });

  const defaultSharePercent = Number(teacher?.revenueSharePercent || 0);
  let totalRevenue = 0;
  let myShare = 0;

  myGroups.forEach((g) => {
    const gPayments = monthPayments.filter((p) => String(p.groupId) === String(g.id));
    const gRev = gPayments.reduce((s, p) => s + Number(p.amount || 0), 0);
    totalRevenue += gRev;
    const gPercent = Number(g.teacherSalaryPercent ?? defaultSharePercent);
    if (g.teacherSalaryType === "fixed" || teacher?.salaryType === "fixed") {
      myShare += Number(g.teacherSalaryFixed ?? teacher?.fixedSalary ?? 0);
    } else {
      myShare += Math.round((gRev * gPercent) / 100);
    }
  });

  const salaryHistory = teacherPayments.filter((p) => p.month === monthKey);
  const advances = salaryHistory
    .filter((p) => p.type === "advance")
    .reduce((s, p) => s + Number(p.amount || 0), 0);
  const salaries = salaryHistory
    .filter((p) => p.type === "salary")
    .reduce((s, p) => s + Number(p.amount || 0), 0);
  const remaining = myShare - advances - salaries;

  // --- 2. TEACHER RATING DATA CALCULATION ---
  const teachersHR = directorData?.teachersHR || [];
  const centerGroups = allAppData?.groups || appData?.groups || [];
  const centerStudents = allAppData?.students || appData?.students || [];
  const centerAttendance = allAppData?.attendance || appData?.attendance || [];

  const allTeacherStats = teachersHR.map((t) => {
    const tGroups = centerGroups.filter(
      (g) => String(g.teacherHrId || g.teacherId) === String(t.id)
    );
    const tGroupIds = tGroups.map((g) => String(g.id));
    const tStudents = centerStudents.filter(
      (s) => Array.isArray(s.groupIds) && s.groupIds.some((gid) => tGroupIds.includes(String(gid)))
    );

    let sumRating = 0;
    let ratingCount = 0;
    centerAttendance.forEach((rec) => {
      if (!tGroupIds.includes(String(rec.groupId))) return;
      Object.values(rec.records || {}).forEach((entry) => {
        if (entry?.rating) {
          sumRating += Number(entry.rating);
          ratingCount++;
        }
      });
    });

    const calculatedAvg = ratingCount > 0 ? Number((sumRating / ratingCount).toFixed(1)) : 0;
    const baseScore = Number(t.rating) || 5.0;
    const avgRating = calculatedAvg > 0 ? calculatedAvg : baseScore;

    return {
      ...t,
      groupsCount: tGroups.length,
      studentsCount: tStudents.length,
      avgRating,
      ratingCount,
      isCurrent: String(t.id) === String(teacher?.id),
    };
  });

  // Sort teachers: highest rating first, then most students
  allTeacherStats.sort((a, b) => {
    if (b.avgRating !== a.avgRating) return b.avgRating - a.avgRating;
    return b.studentsCount - a.studentsCount;
  });

  const myIndex = allTeacherStats.findIndex((t) => t.isCurrent);
  const myRank = myIndex >= 0 ? myIndex + 1 : 1;
  const myStats = allTeacherStats[myIndex] || {
    avgRating: 5.0,
    groupsCount: myGroups.length,
    studentsCount: (appData?.students || []).length,
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Asosiy
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            {teacher?.name} · {teacher?.subject || "O'qituvchi"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/60 text-xs font-semibold text-slate-700 shadow-sm">
            <Calendar size={14} className="text-blue-600" />
            <span>{currentMonthName} {year}</span>
          </div>
        </div>
      </div>

      {/* Main 1-Row Grid for Balance and Teacher Rating */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* 1. BALANCE CARD (Liquid Glass) */}
        <div className="relative overflow-hidden rounded-3xl bg-white/40 dark:bg-white/5 backdrop-blur-2xl border border-white/60 dark:border-white/10 p-6 sm:p-7 shadow-[0_8px_32px_0_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] flex flex-col justify-between">
          {/* Glow ambient light */}
          <div className="absolute -right-16 -top-16 w-56 h-56 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-5">
            {/* Top Row */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-inner shrink-0">
                  <Wallet size={22} />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                    Balans kartasi
                  </span>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Joriy balans
                  </h2>
                </div>
              </div>

              {goTo && (
                <button
                  type="button"
                  onClick={() => goTo("payments")}
                  className="px-3.5 py-1.5 rounded-xl bg-white/70 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 border border-white/60 dark:border-white/15 text-xs font-semibold text-slate-800 dark:text-slate-100 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <span>Batafsil</span>
                  <ArrowUpRight size={14} />
                </button>
              )}
            </div>

            {/* Big Balance Number */}
            <div className="pt-2">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-3xl sm:text-4xl xl:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                  {money(remaining)}
                </span>
                <span className="text-base sm:text-lg font-semibold text-slate-500 dark:text-slate-400">
                  so'm
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Joriy oy uchun to'lanadigan qoldiq summa
              </p>
            </div>
          </div>

          {/* Flattened Breakdown Grid (Rule 1: No nested card boxes) */}
          <div className="relative z-10 pt-5 mt-6 border-t border-slate-200/60 dark:border-white/10 grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">
                Oylik ulush
              </span>
              <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 block">
                +{money(myShare)} so'm
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                {defaultSharePercent}% stavka
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">
                Avans
              </span>
              <span className="text-base font-bold text-amber-600 dark:text-amber-400 block">
                -{money(advances)} so'm
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                {salaryHistory.filter((p) => p.type === "advance").length} ta avans
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">
                Berilgan maosh
              </span>
              <span className="text-base font-bold text-blue-600 dark:text-blue-400 block">
                -{money(salaries)} so'm
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                To'langan summa
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">
                Guruhlar tushumi
              </span>
              <span className="text-base font-bold text-slate-800 dark:text-slate-200 block">
                {money(totalRevenue)} so'm
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                {monthPayments.length} ta to'lov
              </span>
            </div>
          </div>
        </div>

        {/* 2. REYTING - O'QITUVCHI (Liquid Glass) */}
        <div className="relative overflow-hidden rounded-3xl bg-white/40 dark:bg-white/5 backdrop-blur-2xl border border-white/60 dark:border-white/10 p-6 sm:p-7 shadow-[0_8px_32px_0_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] flex flex-col justify-between">
          {/* Glow ambient light */}
          <div className="absolute -right-16 -top-16 w-56 h-56 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-5">
            {/* Header Row */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-inner shrink-0">
                  <Trophy size={22} />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                    Reyting
                  </span>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    O'qituvchilar reytingi
                  </h2>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-bold shadow-sm">
                <Award size={14} />
                <span>#{myRank} o'rinda</span>
              </div>
            </div>

            {/* Teacher's Highlight Bar (Flattened UI) */}
            <div className="p-3.5 rounded-2xl bg-white/60 dark:bg-white/5 border border-white/80 dark:border-white/10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold text-base overflow-hidden shrink-0">
                  {teacher?.photo ? (
                    <img
                      src={teacher.photo}
                      alt={teacher.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (teacher?.name || "U").charAt(0)
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {teacher?.name || "O'qituvchi"}
                    </h3>
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 shrink-0">
                      Siz
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {teacher?.subject || "Pedagog"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:gap-4 shrink-0 text-right">
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                    O'rtacha
                  </span>
                  <span className="text-sm font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <Star size={13} className="fill-amber-400 text-amber-500" />
                    {myStats.avgRating}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                    O'quvchilar
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {myStats.studentsCount}
                  </span>
                </div>
              </div>
            </div>

            {/* Leaderboard Table (Flattened UI list with clean dividers) */}
            <div className="pt-1">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Markaz ustozlari ko'rsatkichi
              </h3>
              <div className="divide-y divide-slate-200/50 dark:divide-white/10 max-h-56 overflow-y-auto pr-1">
                {allTeacherStats.map((t, idx) => {
                  const rankNum = idx + 1;
                  const medal =
                    rankNum === 1
                      ? "🥇"
                      : rankNum === 2
                      ? "🥈"
                      : rankNum === 3
                      ? "🥉"
                      : `#${rankNum}`;

                  return (
                    <div
                      key={t.id || idx}
                      className={`py-2 px-2 rounded-xl transition-colors flex items-center justify-between gap-2.5 ${
                        t.isCurrent
                          ? "bg-blue-500/10 dark:bg-white/10 border border-blue-500/20 dark:border-white/15"
                          : "hover:bg-white/40 dark:hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-6 text-center font-bold text-xs shrink-0 text-slate-700 dark:text-slate-300">
                          {medal}
                        </span>
                        <div className="w-7 h-7 rounded-lg bg-slate-200/70 dark:bg-white/10 text-slate-700 dark:text-slate-200 flex items-center justify-center text-[11px] font-bold overflow-hidden shrink-0">
                          {t.photo ? (
                            <img
                              src={t.photo}
                              alt={t.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            (t.name || "U").charAt(0)
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                            {t.name}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            {t.subject || "Ustoz"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 text-right">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
                          {t.studentsCount} ta
                        </span>
                        <div className="flex items-center gap-1">
                          <Star size={12} className="fill-amber-400 text-amber-500" />
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {t.avgRating}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {allTeacherStats.length === 0 && (
                  <div className="py-6 text-center text-xs text-slate-400">
                    O'qituvchilar ma'lumoti topilmadi
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GroupCard({ appData, group, onOpen, onAddStudent, onStudentClick }) {
  const students = getGroupStudents(appData, group.id);
  const top3 = rankStudents(
    withGroupId(students, group.id),
    appData.tasks,
  ).slice(0, 3);
  return (
    <div className={`${GLASS} rounded-xl p-5 flex flex-col gap-4`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-3 h-3 rounded-full shrink-0"
            style={{ background: group.color }}
          />
          <div className="min-w-0">
            <h3
              className="font-display text-slate-900 font-semibold truncate cursor-pointer hover:underline"
              onClick={onOpen}
            >
              {group.name}
            </h3>
            <p className="text-slate-400 text-xs truncate">
              {group.days.length
                ? group.days.join(", ")
                : "Kunlar belgilanmagan"}{" "}
              {group.time && `· ${group.time}`}
            </p>
          </div>
        </div>
        <span className="bg-slate-50 border border-slate-200 rounded-full px-2.5 py-1 text-xs text-slate-600 shrink-0">
          {students.length} o'quvchi
        </span>
      </div>

      {top3.length === 0 ? (
        <p className="text-slate-400 text-sm py-2.5">O'quvchi yo'q</p>
      ) : (
        <div className="space-y-2">
          {top3.map((s, i) => (
            <div
              key={s.id}
              className="flex items-center gap-2.5 cursor-pointer hover:bg-slate-50 rounded-xl p-1.5 -m-1.5 transition-colors"
              onClick={() => onStudentClick(s.id)}
            >
              <span className="text-sm w-5 text-center shrink-0">
                {["🥇", "🥈", "🥉"][i]}
              </span>
              <Avatar name={s.name} color={group.color} size={30} />
              <p className="text-slate-800 text-sm truncate flex-1">{s.name}</p>
              <span className="text-amber-700 text-xs font-semibold shrink-0">
                {s.stats.count ? s.stats.avg.toFixed(1) : "—"}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button onClick={onAddStudent} className={`${BTN_GHOST} flex-1`}>
          <UserPlus size={15} /> O'quvchi qo'shish
        </button>
        <button onClick={onOpen} className={`${BTN_GHOST} flex-1`}>
          Barchasi <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

function GroupDetail({ appData, group, openModal, onBack, courses }) {
  const students = getGroupStudents(appData, group.id);
  const ranked = rankStudents(withGroupId(students, group.id), appData.tasks);
  const course = (courses || []).find((c) => c.id === group.courseId);
  const lessonsSoFar = group.startDate
    ? countClassDaysSince(group.days, group.startDate)
    : null;
  const expectedTotal = group.durationMonths
    ? Math.round(group.durationMonths * 4.33 * (group.days.length || 0))
    : null;
  return (
    <div className="space-y-5">
      <button onClick={onBack} className={BTN_GHOST}>
        <ArrowLeft size={15} /> Orqaga
      </button>
      <div className={`${GLASS} rounded-xl p-5`}>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full"
              style={{ background: group.color }}
            />
            <div>
              <h2 className="font-display text-xl font-bold text-slate-900">
                {group.name}
              </h2>
              <p className="text-slate-500 text-sm">
                {group.days.length
                  ? group.days.join(", ")
                  : "Kunlar belgilanmagan"}{" "}
                {group.time && `· soat ${group.time}`}
              </p>
              {course && (
                <p className="text-slate-400 text-xs mt-1">
                  📚 Kurs: {course.name}
                  {group.price
                    ? ` · ${group.price.toLocaleString("uz-UZ")} so'm/oy`
                    : ""}
                </p>
              )}
              {lessonsSoFar !== null && (
                <p className="text-slate-400 text-xs mt-0.5">
                  {formatDate(group.startDate)}dan buyon{" "}
                  <span className="text-slate-600 font-medium">
                    {lessonsSoFar}
                  </span>{" "}
                  ta dars o'tildi
                  {expectedTotal ? ` (taxminan ${expectedTotal} tadan)` : ""}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() =>
                openModal({ type: "addStudent", groupId: group.id })
              }
              className={BTN_PRIMARY}
            >
              <UserPlus size={15} /> O'quvchi qo'shish
            </button>
            <button
              onClick={() =>
                openModal({
                  type: "confirm",
                  message: `"${group.name}" guruhini o'chirasizmi? Bog'liq barcha vazifalar ham o'chib ketadi.`,
                  action: { kind: "deleteGroup", groupId: group.id },
                })
              }
              className={BTN_ICON}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className={`${GLASS} rounded-xl p-5`}>
        <h3 className="font-display text-slate-900 font-semibold mb-4">
          O'quvchilar reytingi
        </h3>
        {ranked.length === 0 ? (
          <p className="text-slate-400 text-sm">
            Bu guruhda hali o'quvchi yo'q.
          </p>
        ) : (
          <div className="space-y-2">
            {ranked.map((s, i) => (
              <div
                key={s.id}
                className="flex items-center gap-3 bg-slate-50 hover:bg-slate-50 border border-slate-200 rounded-xl p-3 cursor-pointer transition-colors"
                onClick={() =>
                  openModal({
                    type: "studentDetail",
                    studentId: s.id,
                    groupId: group.id,
                  })
                }
              >
                <span className="text-slate-400 text-sm w-5 text-center shrink-0">
                  {i + 1}
                </span>
                <Avatar name={s.name} color={group.color} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="text-slate-900 text-sm font-medium truncate">
                    {s.name}
                  </p>
                  <p className="text-slate-400 text-xs">
                    {s.stats.done}/{s.stats.total} vazifa bajarilgan
                    {s.groupIds.length > 1
                      ? ` · ${s.groupIds.length} guruhda`
                      : ""}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <StarRating value={s.stats.avg} size={13} />
                  <p className="text-amber-700 text-xs font-semibold mt-0.5">
                    {s.stats.count ? s.stats.avg.toFixed(1) : "baholanmagan"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

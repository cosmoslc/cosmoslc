export function opActiveStudents(opData) {
  return (opData?.students || []).filter((s) => (s.groupIds || []).length > 0)
    .length;
}
export function opFrozenStudents(opData) {
  return (opData?.students || []).filter((s) => (s.groupIds || []).length === 0)
    .length;
}
export function opGroups(opData) {
  return opData?.groups || [];
}
export function opRooms(opData) {
  return opData?.rooms || [];
}
export function opAttendance(opData) {
  return opData?.attendance || [];
}

export { attendanceStatus } from '../../../shared/utils/common';

export function attendanceReason(record, studentId) {
  const entry = record?.records?.[studentId];
  if (!entry) return "";
  return typeof entry === "object" ? entry.reason || "" : "";
}

export function attendanceEntry(record, studentId) {
  const entry = record?.records?.[studentId];
  if (!entry) return null;
  if (typeof entry === "string") return { status: entry, reason: "" };
  return { status: entry.status || "present", reason: entry.reason || "" };
}
export function opGroupStudentCount(opData, groupId) {
  const gIdStr = String(groupId);
  return (opData?.students || []).filter((s) =>
    (s.groupIds || []).some((id) => String(id) === gIdStr),
  ).length;
}
export function opStudentsInGroups(opData, groupIds) {
  const gIdStrs = (groupIds || []).map(String);
  return (opData?.students || []).filter((s) =>
    (s.groupIds || []).some((id) => gIdStrs.includes(String(id))),
  );
}

export function computeBranchStats(branch, directorData, opData) {
  const courses = (directorData?.courses || []).filter((c) => c.branchId === branch.id);
  const courseIds = courses.map((c) => c.id);
  const groups = opGroups(opData).filter((g) => courseIds.includes(g.courseId));
  const groupIds = groups.map((g) => g.id);
  const activeStudents = opStudentsInGroups(opData, groupIds).length;
  const teacherCount = (directorData?.teachersHR || []).filter(
    (t) => t.branchId === branch.id,
  ).length;
  const now = new Date();
  const thisMonth = now.getMonth(),
    thisYear = now.getFullYear();
  const branchFinance = (directorData?.finance || []).filter(
    (f) => f.branchId === branch.id,
  );
  const inThisMonth = (f) =>
    new Date(f.date).getMonth() === thisMonth &&
    new Date(f.date).getFullYear() === thisYear;
  const collected = branchFinance
    .filter(
      (f) => f.type === "income" && f.status === "approved" && inThisMonth(f),
    )
    .reduce((s, f) => s + f.amount, 0);
  const expenses = branchFinance
    .filter(
      (f) => f.type === "expense" && f.status === "approved" && inThisMonth(f),
    )
    .reduce((s, f) => s + f.amount, 0);
  const expectedRevenue = groups.reduce(
    (sum, g) => sum + (g.price || 0) * opGroupStudentCount(opData, g.id),
    0,
  );
  return {
    collected,
    expenses,
    netProfit: collected - expenses,
    expectedRevenue,
    activeStudents,
    teacherCount,
    courseCount: courses.length,
    groupCount: groups.length,
  };
}

export function getTeacherPayStats(
  directorData,
  opData,
  teacher,
  branch,
  month,
) {
  if (!teacher || !teacher.id) {
    return {
      expectedPay: 0,
      advances: 0,
      salaryPaid: 0,
      totalPaid: 0,
      remaining: 0,
    };
  }

  const tIdStr = String(teacher.id);
  const groups = (opData?.groups || []).filter(
    (g) => String(g.teacherHrId || g.teacherId) === tIdStr,
  );

  const calculateGroupPay = (g) => {
    const gIdStr = String(g.id);
    const studentCount = (opData?.students || []).filter((s) =>
      (s.groupIds || []).some((id) => String(id) === gIdStr),
    ).length;
    const effectivePercent = Number(
      g.teacherSalaryPercent ?? teacher.revenueSharePercent ?? 0,
    );
    const effectiveFixed = Number(
      g.teacherSalaryFixed ?? teacher.fixedSalary ?? 0,
    );

    if (g.teacherSalaryType === "fixed" || teacher.salaryType === "fixed") {
      return effectiveFixed || 0;
    }

    const revenue = Number(g.price || 0) * studentCount || 0;
    return Math.round(revenue * (effectivePercent / 100));
  };

  const expectedPay = groups.reduce((sum, g) => sum + calculateGroupPay(g), 0);
  const payments = (directorData?.teacherPayments || []).filter(
    (p) => p.teacherHRId === teacher.id && p.month === month,
  );
  const advances = payments
    .filter((p) => p.type === "advance")
    .reduce((s, p) => s + p.amount, 0);
  const salaryPaid = payments
    .filter((p) => p.type === "salary")
    .reduce((s, p) => s + p.amount, 0);
  const totalPaid = advances + salaryPaid;
  return {
    expectedPay,
    advances,
    salaryPaid,
    totalPaid,
    remaining: Math.max(0, expectedPay - totalPaid),
    payments,
  };
}

export function getManagerStudents(manager, opData, directorData) {
  if (!manager) return [];
  const allStudents = opData?.students || [];
  const managerBranchIds = manager.branchIds || (manager.branchId ? [manager.branchId] : []);

  const branchGroups = (opData?.groups || []).filter((g) =>
    managerBranchIds.includes(g.branchId),
  );
  const branchGroupIds = branchGroups.map((g) => g.id);

  return allStudents.filter((s) => {
    if (s.managerId === manager.id) return true;
    if (!s.managerId) {
      const isInBranch = (s.groupIds || []).some((gid) =>
        branchGroupIds.includes(gid),
      );
      if (isInBranch) return true;
      if (s.branchId && managerBranchIds.includes(s.branchId)) return true;
    }
    return false;
  });
}

export function getManagerPerformanceStats(
  manager,
  opData,
  directorData,
  month,
) {
  if (!manager) return null;
  const students = getManagerStudents(manager, opData, directorData);
  const totalBrought = students.length;

  const oneMonthStudents = students.filter(
    (s) =>
      s.studiedOneMonth === true ||
      s.studiedOneWeek === true ||
      s.hasContract === true ||
      s.contractSigned === true ||
      (s.status === "active" && (s.groupIds || []).length > 0),
  );

  const leftStudents = students.filter(
    (s) => s.status === "churn" || s.status === "left" || s.isLeft === true,
  );

  const activeStudents = students.filter(
    (s) =>
      (s.status === "active" || !s.status) &&
      (s.groupIds || []).length > 0 &&
      !s.isFrozen,
  );

  const trialStudents = students.filter(
    (s) =>
      s.status === "trial" ||
      (s.studiedOneMonth === false && s.status !== "churn"),
  );

  const salaryType = manager.salaryType || "fixed";
  const fixedBase = Number(manager.monthlySalary || manager.salaryAmount || 0);
  const kpiStudentRate = Number(manager.kpiStudentAmount || 0);
  const kpiBonusRate = Number(manager.kpiContractBonus || 0);

  const studentEarned = salaryType === "kpi" ? totalBrought * kpiStudentRate : 0;
  const bonusEarned =
    salaryType === "kpi" ? oneMonthStudents.length * kpiBonusRate : 0;
  const totalKpiBonus = studentEarned + bonusEarned;

  const expectedPay =
    salaryType === "fixed" ? fixedBase : fixedBase + totalKpiBonus;

  const allPayments = (directorData?.managerPayments || []).filter(
    (p) => String(p.managerId) === String(manager.id) && (!month || p.month === month),
  );

  const totalPaid = allPayments.reduce(
    (s, p) => s + Number(p.amount || 0),
    0,
  );
  const remaining = expectedPay - totalPaid;

  return {
    students,
    totalBrought,
    oneMonthStudentsCount: oneMonthStudents.length,
    oneMonthStudents,
    oneWeekStudentsCount: oneMonthStudents.length,
    oneWeekStudents: oneMonthStudents,
    leftStudentsCount: leftStudents.length,
    leftStudents,
    activeStudentsCount: activeStudents.length,
    activeStudents,
    trialStudentsCount: trialStudents.length,
    salaryType,
    fixedBase,
    kpiStudentRate,
    kpiBonusRate,
    studentEarned,
    bonusEarned,
    totalKpiBonus,
    expectedPay,
    totalPaid,
    remaining,
    payments: allPayments,
  };
}

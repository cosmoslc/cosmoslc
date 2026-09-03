export {
  calculateStudentGroupFee,
  calculateRefundAmount,
  getCenterBillingSettings,
  getMonthLessonDates,
} from "./prorata";

/**
 * CRM — O'qituvchi oyligini hisoblash (Teacher Payroll)
 * 3 xil usul
 */
export function calculateTeacherGroupPay({
  teacher,
  group,
  groupMonthPayments = [], // Shu guruhga shu oyda to'langan to'lovlar ro'yxati (amount, studentId)
  expectedGroupFeePerStudent = {}, // { "studentId1": 150000, "studentId2": 200000 }
}) {
  const type = group?.teacherSalaryType || teacher?.salaryType || "percent";

  if (type === "fixed") {
    // Tur 1 — Fiksirlangan oylik (Fixed salary)
    return Number(group?.teacherSalaryFixed || teacher?.fixedSalary || 0);
  }

  if (type === "per_student") {
    // Tur 3 — Har bir o'quvchi uchun belgilangan summa (Per-student fixed)
    const perStudentRate = Number(teacher?.perStudentSalary || 0);

    // Guruhdagi har bir o'quvchi haqiqatda qancha to'lagan?
    const studentPayments = {};
    for (const p of groupMonthPayments) {
      const sId = String(p.studentId);
      studentPayments[sId] = (studentPayments[sId] || 0) + Number(p.amount || 0);
    }

    let totalSalary = 0;
    for (const sId in studentPayments) {
      const actualPaid = studentPayments[sId];
      const expectedFee = expectedGroupFeePerStudent[sId] || 0;

      if (expectedFee > 0) {
        // Proporsional to'lov
        // Oqituvchi_ulushi = Belgilangan_summa × (Oquvchi_haqiqiy_tolovi / Kutilgan_tolov)
        const ratio = Math.min(1, actualPaid / expectedFee); // Maksimum 1 (ortiqcha to'lasa ham o'zini qismini oladi)
        totalSalary += perStudentRate * ratio;
      } else if (expectedFee === 0 && actualPaid > 0) {
        // Agar kutilgan tolov nol bo'lsayu, pul tushsa (masalan qarz yopilsa)
        totalSalary += perStudentRate;
      }
    }
    return Math.round(totalSalary);
  }

  // Tur 2 — Foizli (Revenue-share) - Default
  // Maosh faqat haqiqatan yig'ilgan (real to'langan) summadan hisoblanishi kerak
  const percent = Number(group?.teacherSalaryPercent || teacher?.revenueSharePercent || 0);
  const totalCollected = groupMonthPayments.reduce((s, p) => s + Number(p.amount || 0), 0);

  return Math.round(totalCollected * (percent / 100));
}

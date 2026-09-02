import { getMonthLessonDates } from "./prorata";

/**
 * CRM — Moliyaviy Hisob-Kitob (Student Billing)
 * 2 xil rejim (Rejim A - Invoice-based, Rejim B - Per-lesson)
 */
export function calculateStudentGroupFee({
  fullMonthlyFee = 0,
  groupDays = ["Dush", "Chor", "Juma"],
  monthStr,
  membership,
  student,
  attendances = [], // [{ date: "2024-11-01", status: "present"|"absent", reason: "kasal" }]
  settings = {}, // { billingMode: "invoice" | "per_lesson", excusedAbsenceRefund: true }
}) {
  const fee = Number(fullMonthlyFee) || 0;
  const now = new Date();
  const activeMonth = monthStr || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const allLessonDates = getMonthLessonDates(activeMonth, groupDays);
  const totalLessons = allLessonDates.length || 12;
  const pricePerLesson = totalLessons > 0 ? Math.round(fee / totalLessons) : 0;

  const mode = settings.billingMode || "invoice"; // default Rejim A
  const excusedRefund = settings.excusedAbsenceRefund || false;

  // Determine active/paused/trial status
  const isStudentPaused = student?.status === "paused";
  let status = "active";
  if (isStudentPaused || membership?.status === "paused") status = "paused";
  else if (membership?.status === "trial" || student?.status === "trial") status = "trial";

  if (status === "trial") {
    return {
      calculatedFee: 0,
      pricePerLesson,
      reason: "Sinovdagi o'quvchilar: To'lov hisoblanmaydi",
    };
  }

  const actDateStr = (membership?.reactivatedAt || membership?.activationDate || student?.activationDate || student?.joinedAt || "")?.slice(0, 10);
  const pauseDateStr = (membership?.pausedAt || student?.pausedAt || "")?.slice(0, 10);

  if (mode === "per_lesson") {
    // Rejim B — Dars-dars hisob (Per-lesson / real-time)
    let billableLessons = 0;
    
    // Biz faqat joriy oydagi (monthStr) qatnashgan darslarini sanaymiz
    for (const att of attendances) {
      // Faqat active oydagi attendance bo'lishi kerak
      if (!att.date.startsWith(activeMonth)) continue;
      
      // Faollashtirilgandan keyingi darslar
      if (actDateStr && att.date < actDateStr) continue;
      // Muzlatilgandan keyingi darslar hisoblanmaydi
      if (status === "paused" && pauseDateStr && att.date >= pauseDateStr) continue;

      if (att.status === "present" || att.status === "late") {
        billableLessons++;
      } else if (att.status === "absent") {
        if (excusedRefund && att.reason) {
          // Sababli kelmaslik (excused) - pul olinmaydi
        } else {
          // Sababsiz kelmaslik - pul olinadi
          billableLessons++;
        }
      }
    }

    const calculatedFee = billableLessons * pricePerLesson;
    return {
      calculatedFee,
      pricePerLesson,
      billableLessons,
      reason: `Rejim B: ${billableLessons} ta dars (har biri ${pricePerLesson} so'm) uchun hisoblandi`,
    };
  } else {
    // Rejim A — To'liq oylik hisob (Invoice-based)
    let expectedLessons = 0;
    
    for (const date of allLessonDates) {
      if (actDateStr && date < actDateStr) continue;
      if (status === "paused" && pauseDateStr && date >= pauseDateStr) continue;
      expectedLessons++;
    }

    let calculatedFee = expectedLessons * pricePerLesson;
    let reasonText = `Rejim A: To'liq/qoldiq oylik (${expectedLessons} ta dars x ${pricePerLesson} so'm)`;

    // Sababli kelmaslik kompensatsiyasi
    if (excusedRefund) {
      const excusedCount = attendances.filter(a => 
        a.date.startsWith(activeMonth) && 
        a.status === "absent" && 
        a.reason &&
        (!actDateStr || a.date >= actDateStr) &&
        (!(status === "paused" && pauseDateStr) || a.date < pauseDateStr)
      ).length;

      if (excusedCount > 0) {
        calculatedFee -= (excusedCount * pricePerLesson);
        calculatedFee = Math.max(0, calculatedFee);
        reasonText += ` (Ayirildi: ${excusedCount} ta sababli kelmaslik)`;
      }
    }

    return {
      calculatedFee,
      pricePerLesson,
      expectedLessons,
      reason: reasonText,
    };
  }
}

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

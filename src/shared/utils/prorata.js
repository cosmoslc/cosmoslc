const DAY_INDEX_MAP = {
  dush: 1, sesh: 2, chor: 3, pay: 4, jum: 5, juma: 5, shan: 6, yak: 0,
  dushanba: 1, seshanba: 2, chorshanba: 3, payshanba: 4, shanba: 6, yakshanba: 0,
  mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6, sun: 0,
  monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6, sunday: 0,
};

export function getMonthLessonDates(monthStr, groupDays) {
  const dates = [];
  if (!monthStr || !groupDays || !groupDays.length) return dates;
  const [year, month] = monthStr.split("-").map(Number);
  
  const targetDays = groupDays
    .map(d => {
      const key = String(d).toLowerCase().trim();
      return DAY_INDEX_MAP[key] ?? DAY_INDEX_MAP[key.substring(0, 3)] ?? DAY_INDEX_MAP[key.substring(0, 4)];
    })
    .filter(d => d !== undefined);
  
  if (targetDays.length === 0) return dates;
  
  const date = new Date(year, month - 1, 1);
  while (date.getMonth() === month - 1) {
    if (targetDays.includes(date.getDay())) {
      dates.push(new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 10));
    }
    date.setDate(date.getDate() + 1);
  }
  return dates;
}

export function calculateProratedFee() {
  return { calculatedFee: 0, reason: "Deprecated" };
}

export function getCenterBillingSettings() {
  try {
    const raw = localStorage.getItem('center_settings');
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        billingMode: parsed.billingMode || parsed.billing_mode || "invoice",
        excusedAbsenceRefund: parsed.excusedAbsenceRefund !== undefined ? Boolean(parsed.excusedAbsenceRefund) : (parsed.excused_absence_refund !== undefined ? Boolean(parsed.excused_absence_refund) : true),
      };
    }
  } catch {}
  return { billingMode: "invoice", excusedAbsenceRefund: true };
}

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
  group = null,
  attendances = [], // [{ date: "2024-11-01", status: "present"|"absent", reason: "kasal" }] yoki opData.attendance
  settings = {}, // { billingMode: "invoice" | "per_lesson", excusedAbsenceRefund: true }
}) {
  const fee = Number(fullMonthlyFee) || 0;
  const now = new Date();
  const activeMonth = monthStr || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const allLessonDates = getMonthLessonDates(activeMonth, groupDays);
  const totalLessons = allLessonDates.length || 12;
  const pricePerLesson = totalLessons > 0 ? Math.round(fee / totalLessons) : 0;

  const defaultCenter = getCenterBillingSettings();
  const mode = group?.billingMode || settings.billingMode || defaultCenter.billingMode || "invoice"; // default Rejim A
  const excusedRefund = group?.excusedAbsenceRefund !== undefined 
    ? Boolean(group.excusedAbsenceRefund) 
    : (settings.excusedAbsenceRefund !== undefined ? Boolean(settings.excusedAbsenceRefund) : defaultCenter.excusedAbsenceRefund);

  // Normalize attendances if opData.attendance records structure is provided
  const studentIdStr = String(student?.id || "");
  const normalizedAttendances = (attendances || []).map((a) => {
    if (a && a.records && studentIdStr) {
      const rec = a.records[studentIdStr] || a.records[student?.id];
      return {
        date: a.date,
        status: rec?.status || "absent",
        reason: rec?.reason || "",
      };
    }
    return a;
  });

  // Determine active/paused/trial status with clear precedence
  let status = "active";
  if (membership?.status === "paused" || (student?.status === "paused" && membership?.status !== "active") || student?.isFrozen) {
    status = "paused";
  } else if (membership?.status === "trial") {
    status = "trial";
  } else if (membership?.status === "active") {
    status = "active";
  } else if (student?.status === "trial") {
    status = "trial";
  } else if (student?.status === "paused") {
    status = "paused";
  } else {
    status = "active";
  }

  const explicitActDate = membership?.activationDate || null;
  const fallbackActDate = membership?.reactivatedAt || student?.activationDate || (status === "active" ? (membership?.enrolledAt || student?.joinedAt || student?.createdAt) : null);
  const actDateStr = (explicitActDate || fallbackActDate || "")?.slice(0, 10);
  const pauseDateStr = (membership?.pausedAt || student?.pausedAt || "")?.slice(0, 10);

  const baseResult = {
    status,
    statusLabel: status === "active" ? "Faol" : status === "trial" ? "Sinovda" : "Muzlatilgan",
    isTrial: status === "trial",
    isPaused: status === "paused",
    activationDate: explicitActDate || (status === "active" ? actDateStr : null),
    pricePerLesson,
    totalLessons,
    allLessonDates,
  };

  if (status === "trial") {
    return {
      ...baseResult,
      calculatedFee: 0,
      attendedLessons: 0,
      missedLessons: totalLessons,
      isProrated: false,
      reason: "Sinovdagi o'quvchilar: To'lov hisoblanmaydi",
    };
  }
  
  if (status === "paused") {
    return {
      ...baseResult,
      calculatedFee: 0,
      attendedLessons: 0,
      missedLessons: totalLessons,
      isProrated: false,
      reason: "Muzlatilgan o'quvchilar: To'lov hisoblanmaydi",
    };
  }

  if (mode === "per_lesson") {
    // Rejim B — Dars-dars hisob (Per-lesson / real-time)
    let billableLessons = 0;
    
    for (const att of normalizedAttendances) {
      if (!att.date || !att.date.startsWith(activeMonth)) continue;
      if (actDateStr && att.date < actDateStr) continue;
      if (status === "paused" && pauseDateStr && att.date >= pauseDateStr) continue;

      if (att.status === "present" || att.status === "late") {
        billableLessons++;
      } else if (att.status === "absent") {
        if (excusedRefund && att.reason) {
          // Sababli kelmaslik - balansdan pul olinmaydi
        } else {
          // Sababsiz kelmaslik - dars narxi yechiladi
          billableLessons++;
        }
      }
    }

    const calculatedFee = billableLessons * pricePerLesson;
    const missedLessons = Math.max(0, totalLessons - billableLessons);
    return {
      ...baseResult,
      calculatedFee,
      billableLessons,
      attendedLessons: billableLessons,
      missedLessons,
      isProrated: billableLessons < totalLessons,
      mode: "per_lesson",
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
      const excusedCount = normalizedAttendances.filter(a => 
        a.date &&
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

    const missedLessons = Math.max(0, totalLessons - expectedLessons);
    return {
      ...baseResult,
      calculatedFee,
      expectedLessons,
      attendedLessons: expectedLessons,
      missedLessons,
      isProrated: expectedLessons < totalLessons,
      mode: "invoice",
      reason: reasonText,
    };
  }
}

/**
 * CRM — Refund (pul qaytarish) logikasi
 */
export function calculateRefundAmount({
  billingMode = "invoice",
  excusedAbsenceRefund = true,
  currentBalance = 0,
  fullPrice = 0,
  groupDays = ["Dush", "Chor", "Juma"],
  monthStr,
  attendances = [],
  totalPaidAmount = 0,
  student,
}) {
  if (billingMode === "per_lesson") {
    // Rejim B: agar balans plyusda bo'lsa -> shu plyus summa refund qilinadi, minusda bo'lsa 0
    const refundAmount = Math.max(0, Number(currentBalance || 0));
    return {
      refundAmount,
      otilganDarslar: 0,
      pricePerLesson: 0,
      foydalanilganSumma: 0,
      billingMode: "per_lesson",
    };
  }

  // Rejim A: Otilgan_darslar * Dars_narxi = Foydalanilgan_summa
  // Refund = Jami_tolangan - Foydalanilgan
  const now = new Date();
  const activeMonth = monthStr || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const allLessonDates = getMonthLessonDates(activeMonth, groupDays);
  const totalLessons = allLessonDates.length || 12;
  const pricePerLesson = totalLessons > 0 ? Math.round(Number(fullPrice || 0) / totalLessons) : 0;

  const studentIdStr = String(student?.id || "");
  let otilganDarslar = 0;

  for (const a of attendances) {
    if (!a?.date || !a.date.startsWith(activeMonth)) continue;
    let rec = a;
    if (a.records && studentIdStr) {
      rec = a.records[studentIdStr] || a.records[student?.id];
    }
    if (!rec) continue;

    if (rec.status === "present" || rec.status === "late") {
      otilganDarslar++;
    } else if (rec.status === "absent") {
      if (excusedAbsenceRefund && rec.reason) {
        // Sababli kelmagan darslar "o'tilgan" deb hisoblanmaydi -> refundga qo'shiladi
      } else {
        otilganDarslar++;
      }
    }
  }

  const foydalanilganSumma = otilganDarslar * pricePerLesson;
  const refundAmount = Math.max(0, Number(totalPaidAmount || 0) - foydalanilganSumma);
  return {
    refundAmount,
    otilganDarslar,
    pricePerLesson,
    foydalanilganSumma,
    billingMode: "invoice",
  };
}


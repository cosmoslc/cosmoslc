/**
 * Utility to calculate prorated course fee when a student joins mid-month.
 * 
 * Logic rule requested by user:
 * - If a student starts at the beginning or after 1-2 lessons, they pay full monthly fee.
 * - If they start after more lessons have passed (e.g. half month or 3-4+ lessons),
 *   the fee is prorated: (Monthly fee / Total lessons in the month) * Lessons remaining for the student.
 */

// Day names mapping in Uzbek / English to JS getDay() (0: Sunday, 1: Monday, ..., 6: Saturday)
const DAY_INDEX_MAP = {
  // Uzbek short
  dush: 1,
  sesh: 2,
  chor: 3,
  pay: 4,
  jum: 5,
  juma: 5,
  shan: 6,
  yak: 0,
  // Uzbek full
  dushanba: 1,
  seshanba: 2,
  chorshanba: 3,
  payshanba: 4,
  juma: 5,
  shanba: 6,
  yakshanba: 0,
  // English short
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
  sun: 0,
  // English full
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 0,
  // Numbers
  "1": 1,
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 0,
  "0": 0,
};

/**
 * Returns all lesson dates (YYYY-MM-DD) in a given month for given group days.
 * @param {string} monthStr - Format "YYYY-MM" (e.g. "2026-03")
 * @param {Array<string>|string} groupDays - e.g. ["Dush", "Chor", "Juma"] or "Dush, Chor, Juma"
 * @returns {Array<string>} Array of ISO date strings "YYYY-MM-DD"
 */
export function getMonthLessonDates(monthStr, groupDays) {
  if (!monthStr) return [];
  const parts = monthStr.split("-");
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10); // 1-12
  if (isNaN(year) || isNaN(month)) return [];

  // Parse days list
  let dayList = [];
  if (Array.isArray(groupDays)) {
    dayList = groupDays;
  } else if (typeof groupDays === "string") {
    dayList = groupDays.split(/[,/ ]+/).filter(Boolean);
  }

  const targetDayIndices = new Set(
    dayList
      .map((d) => DAY_INDEX_MAP[String(d).toLowerCase().trim()])
      .filter((idx) => idx !== undefined)
  );

  // If no valid days detected, default to standard 3-days/week (Mon, Wed, Fri => 1, 3, 5)
  if (targetDayIndices.size === 0) {
    targetDayIndices.add(1);
    targetDayIndices.add(3);
    targetDayIndices.add(5);
  }

  const daysInMonth = new Date(year, month, 0).getDate();
  const lessonDates = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month - 1, day);
    if (targetDayIndices.has(d.getDay())) {
      const pad = (n) => String(n).padStart(2, "0");
      lessonDates.push(`${year}-${pad(month)}-${pad(day)}`);
    }
  }

  return lessonDates;
}

/**
 * Calculate prorated fee for a student.
 * 
 * @param {Object} params
 * @param {number} params.fullMonthlyFee - Normal monthly fee (e.g. 500,000)
 * @param {Array<string>|string} params.groupDays - Days of week e.g. ["Dush", "Chor", "Juma"]
 * @param {string} params.monthStr - "YYYY-MM" (e.g. "2026-03")
 * @param {string} params.joinDate - "YYYY-MM-DD" or ISO timestamp when student joined
 * @param {number} [params.freeAllowance=2] - Lessons missed where student still pays full month (default: 2)
 * @returns {Object} {
 *   calculatedFee: number,
 *   isProrated: boolean,
 *   totalLessons: number,
 *   missedLessons: number,
 *   attendedLessons: number,
 *   pricePerLesson: number,
 *   reason: string
 * }
 */
export function calculateProratedFee({
  fullMonthlyFee = 0,
  groupDays = ["Dush", "Chor", "Juma"],
  monthStr,
  joinDate,
  freeAllowance = 2,
}) {
  const fee = Number(fullMonthlyFee) || 0;
  if (fee <= 0) {
    return {
      calculatedFee: 0,
      isProrated: false,
      totalLessons: 0,
      missedLessons: 0,
      attendedLessons: 0,
      pricePerLesson: 0,
      reason: "Bepul",
    };
  }

  // If no monthStr specified, take current month
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const activeMonth = monthStr || `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;

  const allLessonDates = getMonthLessonDates(activeMonth, groupDays);
  const totalLessons = allLessonDates.length || 12; // fallback to 12 if empty

  // If joinDate is missing or student joined before this month, full fee applies
  if (!joinDate) {
    return {
      calculatedFee: fee,
      isProrated: false,
      totalLessons,
      missedLessons: 0,
      attendedLessons: totalLessons,
      pricePerLesson: Math.round(fee / totalLessons),
      reason: "To'liq oylik to'lov",
    };
  }

  // Normalize joinDate to YYYY-MM-DD
  const joinDateStr = typeof joinDate === "string" ? joinDate.slice(0, 10) : "";
  const joinMonth = joinDateStr.slice(0, 7);

  // If joined before this month, full fee applies
  if (joinMonth && joinMonth < activeMonth) {
    return {
      calculatedFee: fee,
      isProrated: false,
      totalLessons,
      missedLessons: 0,
      attendedLessons: totalLessons,
      pricePerLesson: Math.round(fee / totalLessons),
      reason: "To'liq oylik to'lov (avvalgi oydan davom etayotgan o'quvchi)",
    };
  }

  // If joined after this month, 0 fee for this past month
  if (joinMonth && joinMonth > activeMonth) {
    return {
      calculatedFee: 0,
      isProrated: false,
      totalLessons,
      missedLessons: totalLessons,
      attendedLessons: 0,
      pricePerLesson: Math.round(fee / totalLessons),
      reason: "O'quvchi bu oydan keyin qo'shilgan",
    };
  }

  // Student joined in this active month:
  // Count how many lessons occurred strictly BEFORE student's joinDate
  const missedLessons = allLessonDates.filter((date) => date < joinDateStr).length;
  const attendedLessons = Math.max(0, totalLessons - missedLessons);

  // If student missed 1 or 2 lessons (or 0), they pay full month fee
  if (missedLessons <= freeAllowance) {
    return {
      calculatedFee: fee,
      isProrated: false,
      totalLessons,
      missedLessons,
      attendedLessons: totalLessons,
      pricePerLesson: Math.round(fee / totalLessons),
      reason: missedLessons === 0
        ? "Oy boshidan boshlagan (To'liq to'lov)"
        : `${missedLessons} ta dars o'tgan bo'lsa ham standart to'liq to'lov qabul qilinadi (1-2 dars imtiyozi)`,
    };
  }

  // Student joined after more than 2 lessons (e.g. 3, 4+ lessons or mid-month):
  // Calculate price per lesson and multiply by remaining lessons
  const pricePerLesson = Math.round(fee / totalLessons);
  const proratedFee = Math.round(pricePerLesson * attendedLessons);

  return {
    calculatedFee: proratedFee,
    isProrated: true,
    totalLessons,
    missedLessons,
    attendedLessons,
    pricePerLesson,
    reason: `Oy o'rtasidan (${missedLessons} darsdan so'ng) kelganligi sababli ${attendedLessons} ta dars uchun qayta hisoblandi: (${fee.toLocaleString()} / ${totalLessons}) × ${attendedLessons} = ${proratedFee.toLocaleString()} so'm`,
  };
}

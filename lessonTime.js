/**
 * Calculates start time, end time, and live status of a lesson on a given date.
 *
 * @param {Object} group - The group object (has time: "15:00", lessonDurationMinutes: 90, days: [...])
 * @param {string} dateStr - Date string "YYYY-MM-DD"
 * @param {Date} [now] - Current date/time (defaults to new Date())
 * @returns {Object}
 */
export function getLessonTimeInfo(group, dateStr, now = new Date()) {
  const defaultDuration = Number(group?.lessonDurationMinutes) || 90;
  const timeStr = group?.time || "15:00";
  const parts = timeStr.split(":");
  const startH = parseInt(parts[0], 10) || 0;
  const startM = parseInt(parts[1], 10) || 0;

  const todayStr = now.toISOString().slice(0, 10);
  const targetDate = dateStr || todayStr;
  const isToday = targetDate === todayStr;
  const isPastDate = targetDate < todayStr;
  const isFutureDate = targetDate > todayStr;

  // Build Start and End Date objects
  const startDt = new Date(`${targetDate}T${String(startH).padStart(2, "0")}:${String(startM).padStart(2, "0")}:00`);
  const endDt = new Date(startDt.getTime() + defaultDuration * 60 * 1000);

  const endH = String(endDt.getHours()).padStart(2, "0");
  const endM = String(endDt.getMinutes()).padStart(2, "0");
  const endTimeStr = `${endH}:${endM}`;

  const currentTs = now.getTime();
  const startTs = startDt.getTime();
  const endTs = endDt.getTime();

  let isLessonOngoing = false;
  let isLessonFinished = false;
  let isBeforeLesson = false;
  let statusText = "";
  let remainingMinutes = 0;

  if (isPastDate) {
    isLessonFinished = true;
    statusText = "Dars o'tib ketgan";
  } else if (isFutureDate) {
    isBeforeLesson = true;
    statusText = `Rejalashtirilgan (${timeStr} - ${endTimeStr})`;
  } else {
    // Target is Today
    if (currentTs < startTs) {
      isBeforeLesson = true;
      const minsUntil = Math.max(0, Math.round((startTs - currentTs) / (60 * 1000)));
      statusText = `Dars soat ${timeStr} da boshlanadi (${minsUntil} daqiqadan so'ng)`;
    } else if (currentTs >= startTs && currentTs <= endTs) {
      isLessonOngoing = true;
      remainingMinutes = Math.max(0, Math.round((endTs - currentTs) / (60 * 1000)));
      statusText = `Dars davom etmoqda (${remainingMinutes} daqiqa qoldi · ${endTimeStr} gacha)`;
    } else {
      isLessonFinished = true;
      statusText = `Dars soat ${endTimeStr} da yakunlangan`;
    }
  }

  // During today's lesson or anytime before it ends, attendance is fully open and editable
  const canEditAttendance = isToday && !isLessonFinished;

  return {
    startTime: timeStr,
    endTime: endTimeStr,
    durationMinutes: defaultDuration,
    startDt,
    endDt,
    isToday,
    isPastDate,
    isFutureDate,
    isLessonOngoing,
    isLessonFinished,
    isBeforeLesson,
    canEditAttendance,
    statusText,
    remainingMinutes,
  };
}

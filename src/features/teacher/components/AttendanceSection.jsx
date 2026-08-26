import { useState, useEffect } from "react";
import { Check, Users, Calendar, Clock, Lock, Sparkles } from "lucide-react";
import {
  GLASS,
  GLASS_SOFT,
  INPUT_CLS,
  LABEL_CLS,
  BTN_GHOST,
  BTN_PRIMARY,
} from "../../../shared/theme/tokens";
import { Avatar, EmptyState } from "../../../shared/components/primitives";
import { getGroupStudents, attendanceStatus } from "../utils/dataHelpers";
import { formatDate, todayISO, getClassDates, getLessonTimeInfo } from "../utils/helpers";
import { WEEK_DAYS, ATTENDANCE_STATUSES } from "../utils/constants";

export function AttendanceSection({ appData, markAttendance, saveAttendance }) {
  const [groupId, setGroupId] = useState(appData.groups[0]?.id || "");
  const group = appData.groups.find((g) => g.id === groupId);
  const classDates = group ? getClassDates(group) : [];
  const [date, setDate] = useState(
    classDates.includes(todayISO()) ? todayISO() : classDates[0] || "",
  );
  const [currentTime, setCurrentTime] = useState(new Date());

  // Tick every 30 seconds to keep live lesson status up to date
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const g = appData.groups.find((x) => x.id === groupId);
    const dates = g ? getClassDates(g) : [];
    setDate(dates.includes(todayISO()) ? todayISO() : dates[0] || "");
    // eslint-disable-next-line
  }, [groupId]);

  const students = group ? getGroupStudents(appData, group.id) : [];
  const record = appData.attendance.find(
    (a) => a.groupId === groupId && a.date === date,
  );

  const timeInfo = group ? getLessonTimeInfo(group, date, currentTime) : null;
  const isToday = date === todayISO();
  // If date is today, attendance remains open until the lesson finishes (end time)
  const locked = isToday
    ? Boolean(timeInfo?.isLessonFinished)
    : date < todayISO()
      ? Boolean(record?.locked ?? true)
      : false;

  const presentCount = students.filter((s) => {
    const st = attendanceStatus(record, s.id);
    return st === "present" || st === "late";
  }).length;

  if (appData.groups.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title="Avval guruh yarating"
        subtitle="Davomat olish uchun kamida bitta guruh kerak."
      />
    );
  }

  function setAll(status) {
    students.forEach((s) => markAttendance(groupId, date, s.id, status));
  }

  return (
    <div className="space-y-5">
      <div className={`${GLASS} rounded-xl p-5 space-y-3`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={LABEL_CLS}>Guruh</label>
            <select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className={INPUT_CLS}
            >
              {appData.groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.time || "15:00"})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLS}>Dars kuni</label>
            {classDates.length === 0 ? (
              <p className="text-slate-400 text-xs py-2.5">
                Bu guruhga hali kunlar belgilanmagan — Dars jadvali bo'limidan
                sozlang.
              </p>
            ) : (
              <select
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={INPUT_CLS}
              >
                {classDates.map((d) => {
                  const isCurToday = d === todayISO();
                  const dow =
                    WEEK_DAYS[(new Date(d + "T00:00:00").getDay() + 6) % 7];
                  return (
                    <option key={d} value={d}>
                      {isCurToday ? "Bugun — " : ""}
                      {dow}, {formatDate(d)}
                    </option>
                  );
                })}
              </select>
            )}
          </div>
        </div>

        {/* Live Lesson Duration Status Info Banner */}
        {timeInfo && isToday && (
          <div className="pt-1">
            {timeInfo.isLessonOngoing ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3.5 flex items-center justify-between gap-3 text-emerald-950 dark:text-emerald-200">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3 w-3 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <div>
                    <div className="text-xs font-bold flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300">
                      <span>Dars davom etmoqda ({timeInfo.startTime} — {timeInfo.endTime})</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-xl bg-emerald-500/20 font-medium">
                        {timeInfo.remainingMinutes} daqiqa qoldi
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                      Dars tugagunicha ({timeInfo.endTime} gacha) davomatni xohlagancha o'zgartirishingiz va saqlashingiz mumkin.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-emerald-600 text-white px-2.5 py-1 rounded-xl shrink-0 hidden sm:inline-block">
                  Tahrirlash ochiq
                </span>
              </div>
            ) : timeInfo.isBeforeLesson ? (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-center gap-2.5 text-amber-900 dark:text-amber-200">
                <Clock size={16} className="text-amber-600 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold">Bugungi dars vaqti: {timeInfo.startTime} — {timeInfo.endTime}.</span>
                  <span className="text-[11px] text-amber-700 dark:text-amber-300 ml-1">
                    Dars tugaguniga qadar davomatni istalgan paytda kiritish va tahrirlashingiz mumkin.
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                <Lock size={15} className="text-slate-500 shrink-0" />
                <p className="text-xs">
                  Dars soat <strong className="font-semibold">{timeInfo.endTime}</strong> da yakunlangan. Davomat muddati tugagani sababli qulflangan.
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          {students.length > 0 && date && (
            <p className="text-slate-500 text-xs">
              {presentCount}/{students.length} keldi
            </p>
          )}
          {!locked && students.length > 0 && date && (
            <button onClick={() => setAll("present")} className={BTN_GHOST}>
              <Check size={13} /> Hammasi keldi
            </button>
          )}
        </div>
      </div>

      {locked && (
        <div
          className={`${GLASS} rounded-xl p-4 flex items-center gap-2.5 bg-slate-50 border-slate-200 dark:bg-slate-900/50 dark:border-slate-800`}
        >
          <Lock size={16} className="text-slate-600 shrink-0" />
          <p className="text-slate-600 dark:text-slate-400 text-xs">
            {isToday
              ? `Bu dars uchun yo'qlama muddati (dars tugash vaqti ${timeInfo?.endTime || ""}) yakunlangan. Tahrirlash kerak bo'lsa menejerga murojaat qiling.`
              : "Bu sana uchun yo'qlama olingan va saqlangan. Tahrirlash uchun menejerga murojaat qiling."}
          </p>
        </div>
      )}

      {students.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Bu guruhda o'quvchi yo'q"
          subtitle="Avval o'quvchi qo'shing."
        />
      ) : !date ? null : (
        <div className="space-y-2">
          {students.map((s) => {
            const entry = record?.records?.[s.id];
            const status = typeof entry === "string" ? entry : entry?.status;
            const reason = typeof entry === "object" ? entry?.reason : "";
            return (
              <div
                key={s.id}
                className={`${GLASS_SOFT} rounded-xl p-3.5 space-y-2`}
              >
                <div className="flex items-center gap-3">
                  <Avatar name={s.name} color={group.color} size={36} />
                  <p className="text-slate-900 dark:text-slate-100 text-sm font-medium flex-1 truncate">
                    {s.name}
                  </p>
                  <div className="flex gap-1.5 flex-wrap">
                    {ATTENDANCE_STATUSES.map((st) => (
                      <button
                        key={st.id}
                        disabled={locked}
                        onClick={() =>
                          markAttendance(groupId, date, s.id, st.id)
                        }
                        className={`text-xs px-3 py-1.5 rounded-xl border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${status === st.id ? st.on : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400"}`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>
                {(status === "excused" || status === "late" || status === "absent") && !locked && (
                  <input
                    value={reason || ""}
                    onChange={(e) =>
                      markAttendance(
                        groupId,
                        date,
                        s.id,
                        status,
                        e.target.value,
                      )
                    }
                    placeholder={
                      status === "excused"
                        ? "Sababli kelmaganlik sababi..."
                        : status === "late"
                        ? "Kechikish sababi..."
                        : "Kelmadi sababi / izoh (masalan: Qo'ng'iroqqa javob bermadi)..."
                    }
                    className={`${INPUT_CLS} text-xs py-2.5 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700`}
                  />
                )}
                {(status === "excused" || status === "late" || status === "absent") &&
                  locked &&
                  reason && (
                    <p className="text-slate-400 text-xs pl-[3.2rem]">
                      Izoh/Sabab: {reason}
                    </p>
                  )}
              </div>
            );
          })}
          {!locked && students.length > 0 && date && (
            <button
              onClick={() => saveAttendance(groupId, date)}
              className={`${BTN_PRIMARY} w-full flex items-center justify-center gap-2`}
            >
              <Check size={16} />
              {timeInfo?.isLessonOngoing
                ? `Davomatni saqlash (${timeInfo.endTime} gacha xohlagancha tahrirlash mumkin)`
                : "Davomatni saqlash"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

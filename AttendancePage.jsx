import { useState } from 'react';
import { CalendarCheck, Pen, Trash2 } from 'lucide-react';
import { ATTENDANCE_STATUSES, MONTHS_UZ } from '../utils/constants';
import { Icon } from '../components/Icon';
import { BTN_ICON, GLASS, INPUT_CLS } from '../theme/tokens';
import { formatDate } from '../utils/helpers';
import { attendanceStatus, attendanceReason, opAttendance, opGroups, opStudentsInGroups } from '../utils/dataHelpers';
import { getLessonTimeInfo } from '../utils/helpers';
import { EmptyState } from '../components/primitives';

export function AttendancePage({ directorData, opData, scopeBranchIds = [], openModal = () => {} }) {
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [groupFilter, setGroupFilter] = useState('all');

  const allCourses = directorData?.courses || [];
  const courseIds = (scopeBranchIds && scopeBranchIds.length > 0)
    ? allCourses.filter(c => scopeBranchIds.includes(c.branchId)).map(c => c.id)
    : allCourses.map(c => c.id);
  const groups = opGroups(opData).filter(g => courseIds.includes(g.courseId));
  const records = opAttendance(opData)
    .filter(a => groups.some(g => g.id === a.groupId))
    .filter(a => groupFilter === 'all' || a.groupId === groupFilter)
    .filter(a => {
      if (!a.date) return true;
      const d = new Date(a.date);
      if (selectedYear !== 'all' && d.getFullYear().toString() !== selectedYear) return false;
      if (selectedMonth !== 'all' && d.getMonth().toString() !== selectedMonth) return false;
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <CalendarCheck size={24} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Davomat
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                {records.length} ta yozuv
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl h-10 px-3.5 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-xs focus:outline-none cursor-pointer"
          >
            <option value="all">Barcha yillar</option>
            <option value="2024">2024-yil</option>
            <option value="2025">2025-yil</option>
            <option value="2026">2026-yil</option>
          </select>

          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl h-10 px-3.5 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-xs focus:outline-none cursor-pointer"
          >
            <option value="all">Barcha oylar</option>
            {MONTHS_UZ.map((m, idx) => (
              <option key={idx} value={idx.toString()}>{m}</option>
            ))}
          </select>

          <select
            value={groupFilter}
            onChange={e => setGroupFilter(e.target.value)}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl h-10 px-3.5 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-xs focus:outline-none cursor-pointer"
          >
            <option value="all">Barcha guruhlar ({groups.length})</option>
            {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
      </div>

      {records.length === 0 ? (
        <EmptyState icon={CalendarCheck} title="Davomat yozuvlari yo'q" subtitle="O'qituvchi davomat olganda shu yerda ko'rinadi." />
      ) : (
        <div className="space-y-3">
          {records.map(rec => {
            const group = groups.find(g => g.id === rec.groupId);
            if (!group) return null;
            const students = opStudentsInGroups(opData, [group.id]);
            const counts = { present: 0, late: 0, excused: 0, absent: 0 };
            students.forEach(s => { const st = attendanceStatus(rec, s.id); if (st && counts[st] !== undefined) counts[st]++; });
            const marked = counts.present + counts.late + counts.excused + counts.absent;
            const pct = students.length ? Math.round(((counts.present + counts.late) / students.length) * 100) : 0;
            const timeInfo = getLessonTimeInfo(group, rec.date);

            const studentsWithNotes = students.map(s => {
              const st = attendanceStatus(rec, s.id);
              const r = attendanceReason(rec, s.id);
              return { ...s, status: st, reason: r };
            }).filter(s => s.status && s.status !== 'present' && s.reason);

            return (
              <div key={rec.id} className={`${GLASS} rounded-xl p-4 space-y-3`}>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-slate-900 dark:text-slate-100 font-medium text-sm">{group.name}</p>
                      {timeInfo.isLessonOngoing ? (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Dars jarayonda ({timeInfo.startTime} - {timeInfo.endTime})
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {timeInfo.startTime} - {timeInfo.endTime}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-xs mt-0.5">
                      {formatDate(rec.date)} {rec.locked && <span className="ml-1.5 text-emerald-600 dark:text-emerald-400">· qulflangan</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-full text-slate-700 dark:text-slate-300 font-medium">{pct}% davomat</span>
                    <button onClick={() => openModal({ type: 'editAttendance', recordId: rec.id, groupId: group.id })} className={BTN_ICON} title="Davomatni tahrirlash"><Icon name="pen" size={14} /></button>
                    <button onClick={() => openModal({ type: 'confirm', message: `${formatDate(rec.date)} sanasidagi "${group.name}" davomatini o'chirasizmi?`, action: { kind: 'deleteAttendance', recordId: rec.id } })} className={BTN_ICON} title="O'chirish"><Icon name="trash" size={14} /></button>
                  </div>
                </div>
                <div className="flex gap-3 flex-wrap text-xs text-slate-500 dark:text-slate-400">
                  {ATTENDANCE_STATUSES.map(st => <span key={st.id} className="flex items-center gap-1.5"><span className={`w-2 h-2 rounded-full ${st.dot}`} />{st.label}: {counts[st.id]}</span>)}
                  {students.length - marked > 0 && <span className="text-slate-400">Belgilanmagan: {students.length - marked}</span>}
                </div>

                {studentsWithNotes.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-semibold text-slate-400">Izohlar:</span>
                    {studentsWithNotes.map((sn) => (
                      <span
                        key={sn.id}
                        className="text-[11px] px-2 py-0.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 flex items-center gap-1"
                      >
                        <strong className="font-medium">{sn.name}:</strong>
                        <span className="italic text-slate-500 dark:text-slate-400">"{sn.reason}"</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

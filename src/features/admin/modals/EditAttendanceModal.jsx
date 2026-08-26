import { useState } from 'react';
import { ATTENDANCE_STATUSES } from '../utils/constants';
import { Icon } from '../components/Icon';
import { INPUT_CLS, PrimaryButton } from '../theme/tokens';
import { formatDate, getLessonTimeInfo, todayISO } from '../utils/helpers';
import { opStudentsInGroups } from '../utils/dataHelpers';
import { Avatar, Modal } from '../components/primitives';

export function EditAttendanceModal({ record, group, opData, onSave, onClose }) {
  const students = opStudentsInGroups(opData, [group.id]);
  const timeInfo = getLessonTimeInfo(group, record?.date);
  const isToday = record?.date === todayISO();

  const [entries, setEntries] = useState(() => {
    const init = {};
    students.forEach(s => {
      const e = record?.records?.[s.id];
      init[s.id] = typeof e === 'object' ? e : { status: e || null, reason: '' };
    });
    return init;
  });

  function setStatus(studentId, status) { setEntries(prev => ({ ...prev, [studentId]: { ...prev[studentId], status } })); }
  function setReason(studentId, reason) { setEntries(prev => ({ ...prev, [studentId]: { ...prev[studentId], reason } })); }

  return (
    <Modal title={`Davomatni tahrirlash — ${group.name}`} onClose={onClose}>
      <div className="space-y-3">
        {/* Lesson duration info bar */}
        <div className="bg-slate-100 dark:bg-slate-800/80 rounded-xl p-3 flex items-center justify-between gap-2 text-xs text-slate-700 dark:text-slate-300">
          <div>
            <span className="font-semibold text-slate-900 dark:text-slate-100">{formatDate(record.date)}</span>
            <span className="ml-2 text-slate-500 dark:text-slate-400">· Dars vaqti: {timeInfo.startTime} — {timeInfo.endTime}</span>
          </div>
          {timeInfo.isLessonOngoing ? (
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Dars davom etmoqda
            </span>
          ) : (
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              {timeInfo.statusText}
            </span>
          )}
        </div>

        <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
          {students.map(s => (
            <div key={s.id} className="space-y-2 bg-slate-50/50 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <Avatar name={s.name} size={32} />
                <p className="text-slate-900 dark:text-slate-100 text-sm font-medium flex-1 truncate">{s.name}</p>
                <div className="flex gap-1.5 flex-wrap">
                  {ATTENDANCE_STATUSES.map(st => (
                    <button
                      key={st.id}
                      onClick={() => setStatus(s.id, st.id)}
                      className={`text-xs px-2.5 py-1.5 rounded-xl border transition-all ${entries[s.id]?.status === st.id ? st.on : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'}`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>
              {(entries[s.id]?.status === 'excused' || entries[s.id]?.status === 'late' || entries[s.id]?.status === 'absent') && (
                <div className="pt-1">
                  <input
                    value={entries[s.id]?.reason || ''}
                    onChange={e => setReason(s.id, e.target.value)}
                    placeholder={
                      entries[s.id]?.status === 'excused'
                        ? "Sababli kelmaganlik sababi (masalan: Sog'lig'i tufayli)..."
                        : entries[s.id]?.status === 'late'
                        ? "Kechikish sababi (masalan: Yo'lda tirbandlik)..."
                        : "Kelmadi sababi / izoh (masalan: Qo'ng'iroqqa javob bermadi)..."
                    }
                    className={`${INPUT_CLS} text-xs py-2.5 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <PrimaryButton onClick={() => { onSave(entries); onClose(); }} className="w-full mt-2">
          <Icon name="check" size={16} /> Saqlash
        </PrimaryButton>
      </div>
    </Modal>
  );
}

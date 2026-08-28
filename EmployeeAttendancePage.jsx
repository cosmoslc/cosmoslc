import { useState } from 'react';
import { UserCheck, Calendar } from 'lucide-react';
import { money } from '../utils/helpers';
import { MONTHS_UZ } from '../utils/constants';

export function EmployeeAttendancePage({ directorData, opData, scopeBranchIds = [] }) {
  const [view, setView] = useState('today');
  const [period, setPeriod] = useState(7);
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');

  const today = new Date().toISOString().slice(0, 10);
  const managers = directorData?.managers || [];
  const teachersHR = directorData?.teachersHR || [];
  const employees = [
    ...managers
      .filter((m) =>
        !scopeBranchIds || scopeBranchIds.length === 0
          ? true
          : (m.branchIds || []).some((b) => scopeBranchIds.includes(b))
      )
      .map((m) => ({ id: m.id, name: m.name, type: "manager", branchId: m.branchIds?.[0] })),
    ...teachersHR
      .filter((t) =>
        !scopeBranchIds || scopeBranchIds.length === 0
          ? true
          : scopeBranchIds.includes(t.branchId)
      )
      .map((t) => ({ id: t.id, name: t.name, type: "teacher", branchId: t.branchId })),
  ];

  const attendance = (opData.employeeAttendance || []).filter(a => {
    if (!a.date) return true;
    const d = new Date(a.date);
    if (selectedYear !== 'all' && d.getFullYear().toString() !== selectedYear) return false;
    if (selectedMonth !== 'all' && d.getMonth().toString() !== selectedMonth) return false;
    return true;
  });

  const todayRecords = attendance.filter(a => a.date === today);
  const presentToday = todayRecords.filter(a => a.status === 'present').length;
  const absentToday = todayRecords.filter(a => a.status === 'absent').length;

  // Top workers (7/30 day ranking)
  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - period);
  const periodRecords = attendance.filter(a => new Date(a.date) >= daysAgo);

  const workerStats = employees.map(emp => {
    const records = periodRecords.filter(a => a.employeeId === emp.id);
    const present = records.filter(a => a.status === 'present').length;
    const total = records.length;
    return { ...emp, present, total, rate: total > 0 ? (present / total) * 100 : 0 };
  }).sort((a, b) => b.rate - a.rate);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-teal-500/25">
            <UserCheck size={24} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Xodimlar davomati
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

          <div className="flex items-center h-10 p-1 bg-slate-100/80 dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <button
              onClick={() => setView('today')}
              className={`px-4 h-full rounded-xl text-xs font-bold transition-all cursor-pointer ${
                view === 'today'
                  ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Bugun
            </button>
            <button
              onClick={() => setView('ranking')}
              className={`px-4 h-full rounded-xl text-xs font-bold transition-all cursor-pointer ${
                view === 'ranking'
                  ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Reyting
            </button>
          </div>
        </div>
      </div>

      {view === 'today' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs text-slate-500">Kelgan</p>
              <p className="text-2xl font-bold text-green-600">{presentToday}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs text-slate-500">Kelmagan</p>
              <p className="text-2xl font-bold text-red-600">{absentToday}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs text-slate-500">Jami xodim</p>
              <p className="text-2xl font-bold text-slate-700">{employees.length}</p>
            </div>
          </div>

          {/* Today's list */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-semibold">Bugungi holat</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {employees.map(emp => {
                const rec = todayRecords.find(a => a.employeeId === emp.id);
                return (
                  <div key={emp.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${rec?.status === 'absent' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{emp.name}</p>
                        <p className="text-xs text-slate-500">{emp.type === 'manager' ? 'Menejer' : 'O\'qituvchi'}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${rec?.status === 'absent' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {rec?.status === 'absent' ? 'Kelmagan' : 'Kelgan'}
                    </span>
                  </div>
                );
              })}
              {employees.length === 0 && (
                <div className="p-8 text-center text-slate-400">Xodimlar yo'q</div>
              )}
            </div>
          </div>
        </>
      )}

      {view === 'ranking' && (
        <>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Davr:</span>
            {[7, 30].map(d => (
              <button
                key={d}
                onClick={() => setPeriod(d)}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium ${period === d ? 'bg-violet-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
              >
                {d} kun
              </button>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-semibold">Kim ko'proq ishlamoqda</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {workerStats.map((w, i) => (
                <div key={w.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-slate-200 text-slate-700' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'}`}>
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-medium text-sm">{w.name}</p>
                      <p className="text-xs text-slate-500">{w.type === 'manager' ? 'Menejer' : 'O\'qituvchi'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-violet-500 rounded-full" style={{ width: `${w.rate}%` }} />
                    </div>
                    <span className="text-sm font-semibold text-slate-700">{w.rate.toFixed(0)}%</span>
                    <span className="text-xs text-slate-500">{w.present}/{w.total}</span>
                  </div>
                </div>
              ))}
              {workerStats.length === 0 && (
                <div className="p-8 text-center text-slate-400">Ma'lumot yo'q</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
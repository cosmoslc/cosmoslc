import { useState } from 'react';
import { money } from '../utils/helpers';
import { MONTHS_UZ } from '../utils/constants';

export function AnalyticsView({ teacher, directorData, appData }) {
  const [selectedGroupId, setSelectedGroupId] = useState('all');
  const [year, setYear] = useState(new Date().getFullYear());

  const groups = appData.groups || [];
  const students = appData.students || [];
  const attendance = appData.attendance || [];
  const myGroups = groups.filter(g => g.teacherHrId === teacher.id);

  const filteredGroups = selectedGroupId === 'all' ? myGroups : myGroups.filter(g => g.id === selectedGroupId);
  const filteredGroupIds = filteredGroups.map(g => g.id);

  // 6-month trend
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(year, new Date().getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: MONTHS_UZ[d.getMonth()].slice(0, 3),
    });
  }

  const trendData = months.map(m => {
    const monthRecords = attendance.filter(a => {
      const d = new Date(a.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return key === m.key && filteredGroupIds.includes(a.groupId);
    });
    let present = 0, total = 0, sumRating = 0, ratingCount = 0;
    monthRecords.forEach(rec => {
      Object.entries(rec.records || {}).forEach(([sid, entry]) => {
        total++;
        if (entry?.status === 'present' || entry?.status === 'late') present++;
        if (entry?.rating) { sumRating += entry.rating; ratingCount++; }
      });
    });
    return {
      ...m,
      attendanceRate: total > 0 ? Math.round((present / total) * 100) : 0,
      avgRating: ratingCount > 0 ? (sumRating / ratingCount).toFixed(1) : '—',
    };
  });

  // Student breakdown
  const groupStudents = filteredGroupIds.length > 0
    ? students.filter(s => s.groupIds.some(gid => filteredGroupIds.includes(gid)))
    : [];

  const studentStats = groupStudents.map(s => {
    let present = 0, total = 0, sumRating = 0, ratingCount = 0;
    attendance.forEach(rec => {
      if (!filteredGroupIds.includes(rec.groupId)) return;
      const entry = rec.records?.[s.id];
      if (!entry) return;
      total++;
      if (entry.status === 'present' || entry.status === 'late') present++;
      if (entry.rating) { sumRating += entry.rating; ratingCount++; }
    });
    return {
      ...s,
      attendanceRate: total > 0 ? Math.round((present / total) * 100) : 0,
      avgRating: ratingCount > 0 ? (sumRating / ratingCount).toFixed(1) : '—',
    };
  }).sort((a, b) => (b.attendanceRate || 0) - (a.attendanceRate || 0));

  const maxRate = Math.max(...trendData.map(d => d.attendanceRate), 1);
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analitika</h1>
          <p className="text-sm text-slate-500">Davomat va baholar tahlili</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={selectedGroupId} onChange={e => setSelectedGroupId(e.target.value)} className="px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
            <option value="all">Barcha guruhlar</option>
            {myGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
          <select value={year} onChange={e => setYear(parseInt(e.target.value))} className="px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* 6-month trend chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold mb-4">6 oylik trend — Davomat% va O'rtacha ball</h3>
        <div className="flex items-end gap-2 h-48">
          {trendData.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex items-end justify-center gap-1" style={{ height: '160px' }}>
                <div className="w-1/3 bg-violet-500 rounded-t" style={{ height: `${(d.attendanceRate / maxRate) * 100}%` }} title={`Davomat: ${d.attendanceRate}%`} />
                <div className="w-1/3 bg-emerald-500 rounded-t" style={{ height: `${Math.min((parseFloat(d.avgRating) / 5) * 100, 100)}%` }} title={`O'rtacha ball: ${d.avgRating}`} />
              </div>
              <span className="text-xs text-slate-500">{d.label}</span>
              <span className="text-[10px] text-slate-400">{d.attendanceRate}% / {d.avgRating}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-4 text-sm">
          <span className="flex items-center gap-2"><span className="w-3 h-3 bg-violet-500 rounded" /> Davomat %</span>
          <span className="flex items-center gap-2"><span className="w-3 h-3 bg-emerald-500 rounded" /> O'rtacha ball</span>
        </div>
      </div>

      {/* Student breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-semibold">O'quvchilar kesimi</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {studentStats.map(s => (
            <div key={s.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-semibold">{s.name.charAt(0)}</div>
                <div>
                  <p className="font-medium text-sm">{s.name}</p>
                  <p className="text-xs text-slate-500">{s.phone || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${s.attendanceRate >= 80 ? 'bg-green-500' : s.attendanceRate >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${s.attendanceRate}%` }} />
                </div>
                <span className="text-sm font-semibold text-slate-700">{s.attendanceRate}%</span>
                <span className="text-sm text-slate-500">⭐ {s.avgRating}</span>
              </div>
            </div>
          ))}
          {studentStats.length === 0 && <div className="p-8 text-center text-slate-400">Ma'lumot yo'q</div>}
        </div>
      </div>
    </div>
  );
}
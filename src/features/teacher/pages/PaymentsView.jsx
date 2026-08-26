import { useState } from 'react';
import { money } from '../utils/helpers';
import { MONTHS_UZ } from '../utils/constants';

export function PaymentsView({ teacher, directorData, appData }) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());

  const teacherPayments = (directorData.teacherPayments || []).filter(p => p.teacherHrId === teacher.id);
  const payments = directorData.payments || [];
  const groups = appData.groups || [];
  const students = appData.students || [];

  // Teacher's groups
  const myGroups = groups.filter(g => g.teacherHrId === teacher.id);
  const myGroupIds = myGroups.map(g => g.id);

  // Payments for this month in teacher's groups
  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
  const monthPayments = payments.filter(p => myGroupIds.includes(p.groupId) && p.month === monthKey);

  // Teacher's share (percent of revenue)
  const sharePercent = teacher.revenueSharePercent || 0;
  const monthRevenue = monthPayments.reduce((s, p) => s + (p.amount || 0), 0);
  const myShare = (monthRevenue * sharePercent) / 100;

  // Salary history
  const salaryHistory = teacherPayments.filter(p => p.month === monthKey);
  const advances = salaryHistory.filter(p => p.type === 'advance').reduce((s, p) => s + (p.amount || 0), 0);
  const salaries = salaryHistory.filter(p => p.type === 'salary').reduce((s, p) => s + (p.amount || 0), 0);
  const remaining = myShare - advances - salaries;

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">To'lovlar</h1>
          <p className="text-sm text-slate-500">Mening to'lovlarim va maoshim</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={year} onChange={e => setYear(parseInt(e.target.value))} className="px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={month} onChange={e => setMonth(parseInt(e.target.value))} className="px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
            {MONTHS_UZ.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
        </div>
      </div>

      {/* Balance card */}
      <div className="bg-violet-600 rounded-xl p-6 text-white">
        <p className="text-sm text-violet-200">Joriy balansim</p>
        <p className="text-3xl font-bold mt-1">{money(remaining)} so'm</p>
        <p className="text-sm text-violet-200 mt-2">Har bir to'lovdan {sharePercent}% ulush qo'shiladi</p>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-xs text-violet-200">Bu oy to'lovlar</p>
            <p className="text-lg font-semibold">{monthPayments.length} ta</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-xs text-violet-200">Mening ulushim</p>
            <p className="text-lg font-semibold">{money(myShare)} so'm</p>
          </div>
        </div>
      </div>

      {/* Monthly breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-semibold">Oylik hisob-kitob</h3>
        </div>
        <div className="divide-y divide-slate-100">
          <div className="flex items-center justify-between p-4">
            <span className="text-sm text-slate-600">Oylik haqi (foizdan)</span>
            <span className="font-semibold text-green-600">+{money(myShare)} so'm</span>
          </div>
          <div className="flex items-center justify-between p-4">
            <span className="text-sm text-slate-600">Avans</span>
            <span className="font-semibold text-red-600">-{money(advances)} so'm</span>
          </div>
          <div className="flex items-center justify-between p-4">
            <span className="text-sm text-slate-600">Maosh</span>
            <span className="font-semibold text-red-600">-{money(salaries)} so'm</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-50">
            <span className="text-sm font-semibold text-slate-700">Qolgan haqi</span>
            <span className={`font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>{money(remaining)} so'm</span>
          </div>
        </div>
      </div>

      {/* Group breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-semibold">Guruhlar bo'yicha tahlil</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {myGroups.map(g => {
            const groupPayments = payments.filter(p => p.groupId === g.id && p.month === monthKey);
            const groupRevenue = groupPayments.reduce((s, p) => s + (p.amount || 0), 0);
            const groupShare = (groupRevenue * sharePercent) / 100;
            const gIdStr = String(g.id);
            const groupStudents = (students || []).filter(s =>
              (s.groupIds || []).some(id => String(id) === gIdStr)
            );
            return (
              <div key={g.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-sm">{g.name}</p>
                  <p className="text-xs text-slate-500">{groupStudents.length} o'quvchi · {groupPayments.length} to'lov</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-700">{money(groupShare)} so'm</p>
                  <p className="text-xs text-slate-500">{money(groupRevenue)} tushum</p>
                </div>
              </div>
            );
          })}
          {myGroups.length === 0 && <div className="p-8 text-center text-slate-400">Guruhlar yo'q</div>}
        </div>
      </div>

      {/* Salary history */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-semibold">Oylik maosh tarixi</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {salaryHistory.map(p => (
            <div key={p.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-sm">{p.type === 'advance' ? 'Avans' : 'Maosh'}</p>
                <p className="text-xs text-slate-500">{p.date}</p>
              </div>
              <span className={`font-semibold ${p.type === 'advance' ? 'text-amber-600' : 'text-green-600'}`}>
                {money(p.amount)} so'm
              </span>
            </div>
          ))}
          {salaryHistory.length === 0 && <div className="p-8 text-center text-slate-400">Bu oy uchun to'lovlar yo'q</div>}
        </div>
      </div>
    </div>
  );
}
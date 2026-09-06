import { useState } from 'react';
import {
  Wallet,
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Users,
  Calendar,
  Banknote,
  Receipt,
} from 'lucide-react';
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
  const myGroups = groups.filter(g => String(g.teacherHrId || g.teacherId) === String(teacher.id));
  const myGroupIds = myGroups.map(g => String(g.id));

  // Payments for this month in teacher's groups
  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
  const monthPayments = payments.filter(p => {
    if (!myGroupIds.includes(String(p.groupId))) return false;
    const pMonth = p.month || (p.date ? p.date.slice(0, 7) : '');
    return pMonth === monthKey;
  });

  // Calculate teacher's total share (per group percent or default sharePercent)
  const defaultSharePercent = teacher.revenueSharePercent || 0;
  let totalRevenue = 0;
  let myShare = 0;

  myGroups.forEach(g => {
    const gPayments = monthPayments.filter(p => String(p.groupId) === String(g.id));
    const gRev = gPayments.reduce((s, p) => s + Number(p.amount || 0), 0);
    totalRevenue += gRev;
    const gPercent = Number(g.teacherSalaryPercent ?? defaultSharePercent);
    if (g.teacherSalaryType === 'fixed' || teacher.salaryType === 'fixed') {
      myShare += Number(g.teacherSalaryFixed ?? teacher.fixedSalary ?? 0);
    } else {
      myShare += Math.round((gRev * gPercent) / 100);
    }
  });

  // Salary history
  const salaryHistory = teacherPayments.filter(p => p.month === monthKey);
  const advances = salaryHistory.filter(p => p.type === 'advance').reduce((s, p) => s + (p.amount || 0), 0);
  const salaries = salaryHistory.filter(p => p.type === 'salary').reduce((s, p) => s + (p.amount || 0), 0);
  const remaining = myShare - advances - salaries;

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <Wallet size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">To'lovlar</h1>
            <p className="text-slate-500 text-xs mt-0.5">Maosh va o'quvchilar to'lovlari hisobi</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select value={year} onChange={e => setYear(parseInt(e.target.value))} className="px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={month} onChange={e => setMonth(parseInt(e.target.value))} className="px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
            {MONTHS_UZ.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
        </div>
      </div>

      {/* Balance card */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/10">
        <div className="flex items-center justify-between">
          <p className="text-sm text-emerald-100 flex items-center gap-2">
            <CreditCard size={16} /> Joriy balansim
          </p>
          <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-medium">
            {MONTHS_UZ[month]} {year}
          </span>
        </div>
        <p className="text-3xl font-bold mt-2 tracking-tight">{money(remaining)} so'm</p>
        <p className="text-xs text-emerald-100/90 mt-2">
          Har bir to'lovdan {defaultSharePercent}% ulush qo'shiladi
        </p>
        <div className="grid grid-cols-2 gap-4 mt-5">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5 border border-white/10">
            <p className="text-xs text-emerald-100 flex items-center gap-1.5">
              <Receipt size={14} /> Bu oy to'lovlar
            </p>
            <p className="text-xl font-bold mt-1">{monthPayments.length} ta</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5 border border-white/10">
            <p className="text-xs text-emerald-100 flex items-center gap-1.5">
              <TrendingUp size={14} /> Mening ulushim
            </p>
            <p className="text-xl font-bold mt-1">{money(myShare)} so'm</p>
          </div>
        </div>
      </div>

      {/* Monthly breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 flex items-center gap-2">
          <Banknote size={18} className="text-slate-500" />
          <h3 className="font-semibold text-slate-800">Oylik hisob-kitob</h3>
        </div>
        <div className="divide-y divide-slate-100">
          <div className="flex items-center justify-between p-4">
            <span className="text-sm text-slate-600 flex items-center gap-2">
              <ArrowUpRight size={16} className="text-emerald-500" /> Oylik haqi (ulushdan)
            </span>
            <span className="font-semibold text-emerald-600">+{money(myShare)} so'm</span>
          </div>
          <div className="flex items-center justify-between p-4">
            <span className="text-sm text-slate-600 flex items-center gap-2">
              <ArrowDownRight size={16} className="text-amber-500" /> Avans
            </span>
            <span className="font-semibold text-amber-600">-{money(advances)} so'm</span>
          </div>
          <div className="flex items-center justify-between p-4">
            <span className="text-sm text-slate-600 flex items-center gap-2">
              <ArrowDownRight size={16} className="text-red-500" /> Berilgan maosh
            </span>
            <span className="font-semibold text-red-600">-{money(salaries)} so'm</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-50">
            <span className="text-sm font-semibold text-slate-800">Qolgan haqi</span>
            <span className={`font-bold text-base ${remaining >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {money(remaining)} so'm
            </span>
          </div>
        </div>
      </div>

      {/* Group breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 flex items-center gap-2">
          <Layers size={18} className="text-slate-500" />
          <h3 className="font-semibold text-slate-800">Guruhlar bo'yicha tahlil</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {myGroups.map(g => {
            const groupPayments = payments.filter(p => {
              if (String(p.groupId) !== String(g.id)) return false;
              const pMonth = p.month || (p.date ? p.date.slice(0, 7) : '');
              return pMonth === monthKey;
            });
            const groupRevenue = groupPayments.reduce((s, p) => s + (p.amount || 0), 0);
            const groupPercent = Number(g.teacherSalaryPercent ?? defaultSharePercent);
            const groupShare = g.teacherSalaryType === 'fixed' || teacher.salaryType === 'fixed'
              ? Number(g.teacherSalaryFixed ?? teacher.fixedSalary ?? 0)
              : Math.round((groupRevenue * groupPercent) / 100);
            const gIdStr = String(g.id);
            const groupStudents = (students || []).filter(s =>
              (s.groupIds || []).some(id => String(id) === gIdStr)
            );
            return (
              <div key={g.id} className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors">
                <div>
                  <p className="font-medium text-sm text-slate-900">{g.name}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <Users size={12} /> {groupStudents.length} o'quvchi · {groupPayments.length} to'lov {g.teacherSalaryType !== 'fixed' && `(${groupPercent}%)`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-800">{money(groupShare)} so'm</p>
                  <p className="text-xs text-slate-400">{money(groupRevenue)} tushum</p>
                </div>
              </div>
            );
          })}
          {myGroups.length === 0 && <div className="p-8 text-center text-slate-400">Guruhlar yo'q</div>}
        </div>
      </div>

      {/* Salary history */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 flex items-center gap-2">
          <Calendar size={18} className="text-slate-500" />
          <h3 className="font-semibold text-slate-800">Oylik maosh tarixi</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {salaryHistory.map(p => (
            <div key={p.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-sm text-slate-900">{p.type === 'advance' ? 'Avans' : 'Maosh'}</p>
                <p className="text-xs text-slate-500">{p.date}</p>
              </div>
              <span className={`font-semibold ${p.type === 'advance' ? 'text-amber-600' : 'text-emerald-600'}`}>
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
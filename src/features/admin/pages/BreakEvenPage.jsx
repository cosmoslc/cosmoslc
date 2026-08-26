import { useState } from 'react';
import { Scale } from 'lucide-react';
import { money } from '../utils/helpers';
import { MONTHS_UZ } from '../utils/constants';

export function BreakEvenPage({ directorData, scopeBranchIds = [] }) {
  const [periodType, setPeriodType] = useState('month');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());

  const branches = directorData?.branches || [];
  const finance = (directorData?.finance || []).filter(f => {
    const branch = branches.find(b => b.id === f.branchId);
    if (!scopeBranchIds || scopeBranchIds.length === 0) return true;
    return branch && scopeBranchIds.includes(branch.id);
  });

  const filtered = finance.filter(f => {
    const d = new Date(f.date);
    if (d.getFullYear() !== year) return false;
    if (periodType === 'month' && d.getMonth() !== month) return false;
    return true;
  });

  const totalIncome = filtered.filter(f => f.type === 'income' && f.status === 'approved').reduce((s, f) => s + (f.amount || 0), 0);
  const totalExpense = filtered.filter(f => f.type === 'expense' && f.status === 'approved').reduce((s, f) => s + (f.amount || 0), 0);
  const netProfit = totalIncome - totalExpense;
  const profitability = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

  // Cumulative data for chart
  const sorted = [...filtered].sort((a, b) => new Date(a.date) - new Date(b.date));
  let cumIncome = 0, cumExpense = 0;
  const chartData = sorted.map(f => {
    if (f.type === 'income' && f.status === 'approved') cumIncome += f.amount || 0;
    if (f.type === 'expense' && f.status === 'approved') cumExpense += f.amount || 0;
    return { date: f.date, cumIncome, cumExpense, net: cumIncome - cumExpense };
  });

  const maxVal = Math.max(...chartData.map(d => Math.max(d.cumIncome, d.cumExpense, Math.abs(d.net))), 1);

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <Scale size={24} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Break-even
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Zararsizlik nuqtasi va rentabellik tahlili
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={periodType}
            onChange={e => setPeriodType(e.target.value)}
            className="px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="month">Oy</option>
            <option value="year">Yil</option>
          </select>
          <select
            value={year}
            onChange={e => setYear(parseInt(e.target.value))}
            className="px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          {periodType === 'month' && (
            <select
              value={month}
              onChange={e => setMonth(parseInt(e.target.value))}
              className="px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              {MONTHS_UZ.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Jami tushum</p>
          <p className="text-xl font-bold text-green-600">{money(totalIncome)} so'm</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Jami xarajat</p>
          <p className="text-xl font-bold text-red-600">{money(totalExpense)} so'm</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Sof foyda</p>
          <p className={`text-xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{money(netProfit)} so'm</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Rentabellik</p>
          <p className={`text-xl font-bold ${profitability >= 0 ? 'text-green-600' : 'text-red-600'}`}>{profitability.toFixed(1)}%</p>
        </div>
      </div>

      {/* Explanation */}
      <div className="bg-violet-50 rounded-xl p-4">
        <p className="text-sm text-violet-700">
          {netProfit >= 0
            ? `Shu davrga kelib yig'ilgan tushum yig'ilgan xarajatni qopladi. Sof foyda: ${money(netProfit)} so'm.`
            : `Shu davrda xarajatlar tushumdan ${money(Math.abs(netProfit))} so'mga oshib ketdi. Rentabellik: ${profitability.toFixed(1)}%.`}
        </p>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold mb-4">Tushum va xarajat dinamikasi</h3>
        <div className="h-64 flex items-end gap-1">
          {chartData.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex items-end justify-center gap-0.5" style={{ height: '200px' }}>
                <div
                  className="w-1/2 bg-green-500 rounded-t"
                  style={{ height: `${(d.cumIncome / maxVal) * 100}%` }}
                  title={`Tushum: ${money(d.cumIncome)}`}
                />
                <div
                  className="w-1/2 bg-red-500 rounded-t"
                  style={{ height: `${(d.cumExpense / maxVal) * 100}%` }}
                  title={`Xarajat: ${money(d.cumExpense)}`}
                />
              </div>
              <span className="text-[10px] text-slate-400">{d.date.slice(5)}</span>
            </div>
          ))}
          {chartData.length === 0 && (
            <div className="w-full h-full flex items-center justify-center text-slate-400">Ma'lumot yo'q</div>
          )}
        </div>
        <div className="flex gap-4 mt-4 text-sm">
          <span className="flex items-center gap-2"><span className="w-3 h-3 bg-green-500 rounded" /> Tushum</span>
          <span className="flex items-center gap-2"><span className="w-3 h-3 bg-red-500 rounded" /> Xarajat</span>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-semibold">So'nggi tranzaksiyalar</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {sorted.slice(-10).reverse().map(f => (
            <div key={f.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-sm">{f.note || f.category || '—'}</p>
                <p className="text-xs text-slate-500">{f.date}</p>
              </div>
              <span className={`font-semibold ${f.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                {f.type === 'income' ? '+' : '-'}{money(f.amount)} so'm
              </span>
            </div>
          ))}
          {sorted.length === 0 && (
            <div className="p-8 text-center text-slate-400">Tranzaksiyalar yo'q</div>
          )}
        </div>
      </div>
    </div>
  );
}
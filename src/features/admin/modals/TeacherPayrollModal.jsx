import { useState } from 'react';
import { Icon } from '../components/Icon';
import { GLASS_SOFT, INPUT_CLS, PrimaryButton } from '../theme/tokens';
import { formatDate, money, thisMonthKey, todayISO } from '../utils/helpers';
import { getTeacherPayStats } from '../utils/dataHelpers';
import { Modal, MoneyInput } from '../components/primitives';

export function TeacherPayrollModal({ teacher: propTeacher, teacherId, branch, directorData, opData, onAddPayment, onSubmit, onClose }) {
  const [month, setMonth] = useState(thisMonthKey());
  const [tab, setTab] = useState('advance');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const handleSave = onSubmit || onAddPayment;
  const teacher = propTeacher || (directorData?.teachersHR || []).find(t => String(t.id) === String(teacherId));

  if (!teacher) {
    return (
      <Modal title="Maosh hisob-kitobi" onClose={onClose}>
        <div className="p-4 text-center text-slate-500">O'qituvchi ma'lumotlari topilmadi.</div>
      </Modal>
    );
  }

  const stats = getTeacherPayStats(directorData, opData, teacher, branch, month);
  const allHistory = (directorData?.teacherPayments || []).filter(p => p.teacherHRId === teacher.id).sort((a, b) => b.createdAt - a.createdAt);

  function submitPayment() {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { setError("To'g'ri summa kiriting."); return; }
    if (handleSave) {
      handleSave({ teacherHRId: teacher.id, type: tab, amount: amt, month, date: todayISO(), note: note.trim() });
    }
    setAmount(''); setNote(''); setError('');
  }

  return (
    <Modal title={`${teacher.name} — maosh hisob-kitobi`} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full text-slate-700">{teacher.salaryType === 'fixed' ? 'Belgilangan oylik' : `Foizli ${teacher.revenueSharePercent || 0}%`}</span>
          <input type="month" value={month} onChange={e => setMonth(e.target.value)} className={`${INPUT_CLS} w-auto py-1.5 text-xs`} />
        </div>

        <div className={`${GLASS_SOFT} rounded-xl p-4 grid grid-cols-2 gap-3 text-sm`}>
          <div><p className="text-slate-400 text-[11px]">Oylik haqi</p><p className="text-slate-900 font-semibold">{money(stats.expectedPay)} so'm</p></div>
          <div><p className="text-slate-400 text-[11px]">Avans olgan</p><p className="text-amber-600 font-semibold">{money(stats.advances)} so'm</p></div>
          <div><p className="text-slate-400 text-[11px]">Maosh olgan</p><p className="text-sky-600 font-semibold">{money(stats.salaryPaid)} so'm</p></div>
          <div><p className="text-slate-400 text-[11px]">Qolgan haqi</p><p className="text-green-600 font-semibold">{money(stats.remaining)} so'm</p></div>
        </div>

        <div className="space-y-3">
          <div className="flex gap-1.5 bg-slate-50 border border-slate-200 rounded-xl p-1">
            <button onClick={() => setTab('advance')} className={`flex-1 text-xs py-2.5 rounded-xl transition-all ${tab === 'advance' ? 'bg-amber-100 text-amber-700' : 'text-slate-500'}`}>Avans berish</button>
            <button onClick={() => setTab('salary')} className={`flex-1 text-xs py-2.5 rounded-xl transition-all ${tab === 'salary' ? 'bg-sky-100 text-sky-700' : 'text-slate-500'}`}>Maosh to'lash</button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <MoneyInput value={amount} onChange={val => setAmount(val)} placeholder="Summa" className={INPUT_CLS} />
            <input value={note} onChange={e => setNote(e.target.value)} placeholder="Izoh (ixtiyoriy)" className={INPUT_CLS} />
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <PrimaryButton onClick={submitPayment} className="w-full"><Icon name="plus" size={16} /> {tab === 'advance' ? 'Avans berish' : "Maosh to'lash"}</PrimaryButton>
        </div>

        {allHistory.length > 0 && (
          <div className="border-t border-slate-200 pt-3 space-y-1.5 max-h-48 overflow-y-auto">
            <p className="text-slate-400 text-[11px] mb-1">To'lovlar tarixi</p>
            {allHistory.map(p => (
              <div key={p.id} className="flex items-center justify-between text-xs bg-slate-50 rounded-xl px-3 py-2.5">
                <div>
                  <span className={p.type === 'advance' ? 'text-amber-600' : 'text-sky-600'}>{p.type === 'advance' ? 'Avans' : 'Maosh'}</span>
                  <span className="text-slate-400 ml-2">{formatDate(p.date)}{p.note ? ` · ${p.note}` : ''}</span>
                </div>
                <span className="text-slate-900 font-medium">{money(p.amount)} so'm</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

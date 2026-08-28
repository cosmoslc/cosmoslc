import { useState } from 'react';
import { Sliders, Save, Check } from 'lucide-react';
import { WEEK_DAYS } from '../utils/constants';

export function CenterSettingsPage({ directorData, onUpdateSettings }) {
  const settings = directorData?.centerSettings || {
    primaryPhone: '',
    secondaryPhone: '',
    address: '',
    telegram: '',
    instagram: '',
    website: '',
    workDays: ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'],
    workStart: '09:00',
    workEnd: '21:00',
  };

  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);

  const toggleDay = (day) => {
    setForm(prev => ({
      ...prev,
      workDays: prev.workDays.includes(day)
        ? prev.workDays.filter(d => d !== day)
        : [...prev.workDays, day],
    }));
  };

  const handleSave = () => {
    onUpdateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const previewText = () => {
    const days = form.workDays || [];
    if (days.length === 0) return 'Ish kunlari belgilanmagan';
    const first = days[0];
    const last = days[days.length - 1];
    const range = days.length > 1 ? `${first}-${last}` : first;
    return `${range} · ${form.workStart || '—'}-${form.workEnd || '—'}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-slate-700 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-slate-600/25">
            <Sliders size={24} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Markaz sozlamalari
            </h1>
          </div>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 cursor-pointer transition-all"
        >
          <Save size={16} /> Saqlash
        </button>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
          Sozlamalar saqlandi ✅
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Contact info */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h3 className="font-semibold">Aloqa ma'lumotlari</h3>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Asosiy telefon</label>
            <input
              type="text"
              value={form.primaryPhone || ''}
              onChange={e => setForm({ ...form, primaryPhone: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="+998-90-123-45-67"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Qo'shimcha telefon</label>
            <input
              type="text"
              value={form.secondaryPhone || ''}
              onChange={e => setForm({ ...form, secondaryPhone: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="+998-90-123-45-67"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Manzil</label>
            <input
              type="text"
              value={form.address || ''}
              onChange={e => setForm({ ...form, address: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="Toshkent sh., ..."
            />
          </div>
        </div>

        {/* Social links */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h3 className="font-semibold">Ijtimoiy tarmoqlar</h3>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Telegram</label>
            <input
              type="text"
              value={form.telegram || ''}
              onChange={e => setForm({ ...form, telegram: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="https://t.me/..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Instagram</label>
            <input
              type="text"
              value={form.instagram || ''}
              onChange={e => setForm({ ...form, instagram: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="https://instagram.com/..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Veb-sayt</label>
            <input
              type="text"
              value={form.website || ''}
              onChange={e => setForm({ ...form, website: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="https://..."
            />
          </div>
        </div>
      </div>

      {/* Work hours */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold mb-4">Ish vaqti</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Ish kunlari</label>
            <div className="flex flex-wrap gap-2">
              {WEEK_DAYS.map(day => (
                <button
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${(form.workDays || []).includes(day) ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Boshlanish vaqti</label>
                <input
                  type="time"
                  value={form.workStart || '09:00'}
                  onChange={e => setForm({ ...form, workStart: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tugash vaqti</label>
                <input
                  type="time"
                  value={form.workEnd || '21:00'}
                  onChange={e => setForm({ ...form, workEnd: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>
            <div className="p-3 bg-violet-50 rounded-xl">
              <p className="text-sm text-violet-700 font-medium">Preview: {previewText()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
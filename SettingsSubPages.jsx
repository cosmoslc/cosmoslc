import { useState } from "react";
import {
  DollarSign,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  CreditCard,
  FileText,
  Printer,
  QrCode,
  Shield,
  UserCheck,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  Send,
  Zap,
  ShoppingBag,
  Gift,
  HelpCircle,
  Award,
  BookOpen,
  ClipboardList,
  Sliders,
  Tag,
  Users,
  Building2,
  Copy,
  ExternalLink,
  Percent,
  Search,
  Filter,
  ArrowUpRight,
  ChevronRight,
} from "lucide-react";
import { GLASS, INPUT_CLS, LABEL_CLS, BTN_PRIMARY, BTN_SECONDARY, BTN_DANGER, BTN_GHOST } from "../theme/tokens";
import { money } from "../utils/helpers";

// 1. Qo'shimcha daromadlar (Additional Incomes)
export function AdditionalIncomePage({ directorData, onRefresh }) {
  const [incomes, setIncomes] = useState([
    { id: "inc_1", title: "Cambridge IELTS Practice kitoblari sotuvi", category: "Kitoblar", amount: 1450000, date: "2026-08-25", payer: "O'quvchilar (12 ta kitob)", paymentType: "Naqd" },
    { id: "inc_2", title: "IELTS Mock Exam topshirish to'lovi", category: "Mock Imtihon", amount: 2100000, date: "2026-08-24", payer: "Tashqi nomzodlar (14 kishi)", paymentType: "Click" },
    { id: "inc_3", title: "O'quv sertifikatlarini tayyorlash to'lovi", category: "Sertifikat", amount: 600000, date: "2026-08-22", payer: "Bitiruvchi guruhlar", paymentType: "Payme" },
    { id: "inc_4", title: "Kouching zalini soatbay ijaraga berish (Coworking)", category: "Zal ijarasi", amount: 950000, date: "2026-08-20", payer: "Biznes trening tashkilotchilari", paymentType: "Plastik" },
  ]);

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", category: "Kitoblar", amount: "", payer: "", paymentType: "Naqd" });

  const totalIncome = incomes.reduce((sum, i) => sum + Number(i.amount || 0), 0);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.title || !form.amount) return;
    const newInc = {
      id: "inc_" + Date.now(),
      title: form.title,
      category: form.category,
      amount: Number(form.amount),
      date: new Date().toISOString().split("T")[0],
      payer: form.payer || "Noma'lum",
      paymentType: form.paymentType,
    };
    setIncomes([newInc, ...incomes]);
    setForm({ title: "", category: "Kitoblar", amount: "", payer: "", paymentType: "Naqd" });
    setShowAdd(false);
  };

  const handleDelete = (id) => {
    setIncomes(incomes.filter((i) => i.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <DollarSign className="text-emerald-500" />
            Qo'shimcha Daromadlar
          </h1>
        </div>
        <button onClick={() => setShowAdd(true)} className={BTN_PRIMARY}>
          <Plus size={16} />
          <span>Daromad qo'shish</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`${GLASS} p-5 rounded-2xl`}>
          <span className="text-xs font-semibold text-slate-400 uppercase">Jami Qo'shimcha Daromad</span>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {money(totalIncome)} so'm
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Oylik umumiy qo'shimcha tushum</p>
        </div>
        <div className={`${GLASS} p-5 rounded-2xl`}>
          <span className="text-xs font-semibold text-slate-400 uppercase">Yozuvlar Soni</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{incomes.length} ta</div>
          <p className="text-[11px] text-slate-400 mt-1">Muvaffaqiyatli qabul qilingan</p>
        </div>
        <div className={`${GLASS} p-5 rounded-2xl`}>
          <span className="text-xs font-semibold text-slate-400 uppercase">Asosiy Manba</span>
          <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">Mock Exam & Kitoblar</div>
          <p className="text-[11px] text-slate-400 mt-1">68% ulushga ega</p>
        </div>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleAdd} className={`${GLASS} max-w-md w-full p-6 rounded-2xl space-y-4 shadow-2xl animate-in zoom-in-95`}>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white">Yangi Qo'shimcha Daromad</h3>
              <button type="button" onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <div>
              <label className={LABEL_CLS}>Daromad Nomi / Mazmuni</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={INPUT_CLS}
                placeholder="Masalan: CEFR kitobi sotuvi"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL_CLS}>Kategoriya</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={INPUT_CLS}>
                  <option value="Kitoblar">Kitoblar</option>
                  <option value="Mock Imtihon">Mock Imtihon</option>
                  <option value="Sertifikat">Sertifikat</option>
                  <option value="Zal ijarasi">Zal ijarasi</option>
                  <option value="Boshqa">Boshqa</option>
                </select>
              </div>
              <div>
                <label className={LABEL_CLS}>To'lov turi</label>
                <select value={form.paymentType} onChange={(e) => setForm({ ...form, paymentType: e.target.value })} className={INPUT_CLS}>
                  <option value="Naqd">Naqd</option>
                  <option value="Plastik">Plastik karta</option>
                  <option value="Click">Click</option>
                  <option value="Payme">Payme</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL_CLS}>Summa (so'm)</label>
                <input
                  type="number"
                  required
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className={INPUT_CLS}
                  placeholder="500000"
                />
              </div>
              <div>
                <label className={LABEL_CLS}>To'lovchi / Manba</label>
                <input
                  type="text"
                  value={form.payer}
                  onChange={(e) => setForm({ ...form, payer: e.target.value })}
                  className={INPUT_CLS}
                  placeholder="Ism yoki guruh"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowAdd(false)} className={BTN_SECONDARY}>Bekor qilish</button>
              <button type="submit" className={BTN_PRIMARY}>Saqlash</button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className={`${GLASS} rounded-2xl overflow-hidden`}>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">Barcha Qo'shimcha Tushumlar</span>
          <span className="text-xs text-slate-400">{incomes.length} ta yozuv</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-400 font-semibold uppercase">
              <tr>
                <th className="p-3.5">Nomi</th>
                <th className="p-3.5">Kategoriya</th>
                <th className="p-3.5">To'lovchi</th>
                <th className="p-3.5">To'lov Turi</th>
                <th className="p-3.5">Sana</th>
                <th className="p-3.5 text-right">Summa</th>
                <th className="p-3.5 text-center">Amal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {incomes.map((inc) => (
                <tr key={inc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200">{inc.title}</td>
                  <td className="p-3.5">
                    <span className="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 font-medium">
                      {inc.category}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-400">{inc.payer}</td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-400">{inc.paymentType}</td>
                  <td className="p-3.5 text-slate-400">{inc.date}</td>
                  <td className="p-3.5 text-right font-bold text-emerald-600 dark:text-emerald-400">
                    +{money(inc.amount)} so'm
                  </td>
                  <td className="p-3.5 text-center">
                    <button onClick={() => handleDelete(inc.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 2. Ish Haqi (Salaries / Payroll)
export function SalariesPage({ directorData }) {
  const teachers = directorData?.teachersHR || [
    { id: "t1", name: "Anvar Karimov", subject: "IELTS & General English", studentsCount: 42, salaryType: "Foiz (50%)", calculatedSalary: 12600000, paidSalary: 8000000 },
    { id: "t2", name: "Dilnoza Olimova", subject: "General English (CEFR)", studentsCount: 38, salaryType: "Fixed (180,000 / student)", calculatedSalary: 6840000, paidSalary: 6840000 },
    { id: "t3", name: "Jasur Rahimov", subject: "Frontend Web Development", studentsCount: 29, salaryType: "Foiz (55%)", calculatedSalary: 9135000, paidSalary: 5000000 },
    { id: "t4", name: "Malika Yusupova", subject: "Oliy Matematika & SAT", studentsCount: 24, salaryType: "Fixed (200,000 / student)", calculatedSalary: 4800000, paidSalary: 4800000 },
  ];

  const totalCalculated = teachers.reduce((sum, t) => sum + (t.calculatedSalary || 0), 0);
  const totalPaid = teachers.reduce((sum, t) => sum + (t.paidSalary || 0), 0);
  const remaining = totalCalculated - totalPaid;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <CreditCard className="text-indigo-500" />
          Ish Haqi va Oylik Maoshlar
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`${GLASS} p-5 rounded-2xl`}>
          <span className="text-xs font-semibold text-slate-400 uppercase">Jami Hisoblangan Maosh</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{money(totalCalculated)} so'm</div>
          <p className="text-[11px] text-slate-400 mt-1">O'tilgan darslar va o'quvchilar bo'yicha</p>
        </div>
        <div className={`${GLASS} p-5 rounded-2xl`}>
          <span className="text-xs font-semibold text-slate-400 uppercase">To'langan (Avans + Oylik)</span>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{money(totalPaid)} so'm</div>
          <p className="text-[11px] text-slate-400 mt-1">Kassadan berilgan mablag'</p>
        </div>
        <div className={`${GLASS} p-5 rounded-2xl`}>
          <span className="text-xs font-semibold text-slate-400 uppercase">Qolgan Qarzdorlik</span>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">{money(remaining)} so'm</div>
          <p className="text-[11px] text-slate-400 mt-1">Oydan oyga o'tuvchi qoldiq</p>
        </div>
      </div>

      <div className={`${GLASS} rounded-2xl overflow-hidden`}>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">O'qituvchilar Maosh Hissasi</span>
          <span className="text-xs text-slate-400">{teachers.length} nafar o'qituvchi</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-400 font-semibold uppercase">
              <tr>
                <th className="p-3.5">O'qituvchi</th>
                <th className="p-3.5">Fan / Yo'nalish</th>
                <th className="p-3.5">O'quvchi Soni</th>
                <th className="p-3.5">Hisoblash Turi</th>
                <th className="p-3.5">Hisoblangan Maosh</th>
                <th className="p-3.5">To'langan</th>
                <th className="p-3.5 text-right">Qoldiq</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {teachers.map((t) => {
                const diff = (t.calculatedSalary || 0) - (t.paidSalary || 0);
                return (
                  <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200">{t.name}</td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-400">{t.subject}</td>
                    <td className="p-3.5 font-bold text-indigo-600 dark:text-indigo-400">{t.studentsCount} ta</td>
                    <td className="p-3.5"><span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">{t.salaryType}</span></td>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">{money(t.calculatedSalary)} so'm</td>
                    <td className="p-3.5 font-semibold text-emerald-600 dark:text-emerald-400">{money(t.paidSalary)} so'm</td>
                    <td className="p-3.5 text-right font-bold text-rose-600 dark:text-rose-400">{money(diff)} so'm</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 3. Lavozimlar (Positions / Roles)
export { PositionsPage } from "./PositionsPage";

// 4. Chek Sozlamalari (Receipt Settings)
export function ReceiptSettingsPage() {
  const [config, setConfig] = useState({
    headerText: "COSMOS LEARNING CENTER",
    subHeader: "Toshkent shahri, Chilonzor tumani",
    phone: "+998 90 123 45 67",
    footerText: "To'lovingiz uchun tashakkur! Ilm olishdan to'xtamang.",
    showQrCode: true,
    paperSize: "80mm",
    autoPrint: true,
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Printer className="text-sky-500" />
          Chek Sozlamalari
        </h1>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-bold">
          <CheckCircle2 size={16} className="text-emerald-600" />
          Chek shablon sozlamalari muvaffaqiyatli saqlandi!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings Form */}
        <div className={`${GLASS} p-6 rounded-2xl space-y-4`}>
          <h3 className="font-bold text-slate-900 dark:text-white text-base border-b border-slate-100 dark:border-slate-800 pb-3">
            Chek Ma'lumotlari Formasi
          </h3>
          <div>
            <label className={LABEL_CLS}>Sarlavha (Markaz nomi)</label>
            <input
              type="text"
              value={config.headerText}
              onChange={(e) => setConfig({ ...config, headerText: e.target.value })}
              className={INPUT_CLS}
            />
          </div>
          <div>
            <label className={LABEL_CLS}>Filial Manzili (Kichik sarlavha)</label>
            <input
              type="text"
              value={config.subHeader}
              onChange={(e) => setConfig({ ...config, subHeader: e.target.value })}
              className={INPUT_CLS}
            />
          </div>
          <div>
            <label className={LABEL_CLS}>Aloqa telefoni</label>
            <input
              type="text"
              value={config.phone}
              onChange={(e) => setConfig({ ...config, phone: e.target.value })}
              className={INPUT_CLS}
            />
          </div>
          <div>
            <label className={LABEL_CLS}>Chek Osti Matni (Footer message)</label>
            <textarea
              rows={2}
              value={config.footerText}
              onChange={(e) => setConfig({ ...config, footerText: e.target.value })}
              className={`${INPUT_CLS} resize-none`}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className={LABEL_CLS}>Printer Qog'oz Hajmi</label>
              <select value={config.paperSize} onChange={(e) => setConfig({ ...config, paperSize: e.target.value })} className={INPUT_CLS}>
                <option value="80mm">80 mm (Termo chek)</option>
                <option value="58mm">58 mm (Kichik chek)</option>
                <option value="A4">A4 (Standart kvitansiya)</option>
              </select>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="qrCheck"
                checked={config.showQrCode}
                onChange={(e) => setConfig({ ...config, showQrCode: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <label htmlFor="qrCheck" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                QR Kodni ko'rsatish
              </label>
            </div>
          </div>
          <button onClick={handleSave} className={`${BTN_PRIMARY} w-full mt-2`}>
            Saqlash
          </button>
        </div>

        {/* Live Receipt Preview */}
        <div className={`${GLASS} p-6 rounded-2xl space-y-3`}>
          <h3 className="font-bold text-slate-900 dark:text-white text-base border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
            <span>Chek Jonli Ko'rinishi</span>
            <span className="text-xs font-normal text-slate-400">({config.paperSize})</span>
          </h3>

          <div className="bg-white text-slate-900 p-6 rounded-xl font-mono text-xs max-w-xs mx-auto border border-slate-200 shadow-md space-y-3">
            <div className="text-center space-y-1 border-b border-dashed border-slate-300 pb-3">
              <div className="font-extrabold text-sm uppercase tracking-wider">{config.headerText}</div>
              <div className="text-[10px] text-slate-600">{config.subHeader}</div>
              <div className="text-[10px] text-slate-600">Tel: {config.phone}</div>
            </div>

            <div className="space-y-1 text-[11px] border-b border-dashed border-slate-300 pb-2">
              <div className="flex justify-between"><span>Chek №:</span><span className="font-bold">#CHK-84920</span></div>
              <div className="flex justify-between"><span>Sana:</span><span>2026-08-26 14:32</span></div>
              <div className="flex justify-between"><span>O'quvchi:</span><span className="font-bold">Jasur Aliyev</span></div>
              <div className="flex justify-between"><span>Guruh:</span><span>ENG-F2 (IELTS Standard)</span></div>
            </div>

            <div className="space-y-1 border-b border-dashed border-slate-300 pb-2">
              <div className="flex justify-between font-bold text-sm">
                <span>TO'LANGAN SUMMA:</span>
                <span>850 000 so'm</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-600">
                <span>To'lov turi:</span>
                <span>Click / Online</span>
              </div>
            </div>

            {config.showQrCode && (
              <div className="flex flex-col items-center justify-center py-1">
                <div className="w-16 h-16 bg-slate-100 border border-slate-300 rounded flex items-center justify-center text-[9px] text-slate-500 font-sans">
                  [QR KOD]
                </div>
                <span className="text-[9px] text-slate-400 mt-1">To'lovni tekshirish uchun</span>
              </div>
            )}

            <div className="text-center text-[10px] text-slate-500 border-t border-dashed border-slate-300 pt-2">
              {config.footerText}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 5. Sabablar (Reasons)
export { ReasonsPage } from "./ReasonsPage";

// 6. Daraja Testi (Placement Test)
export function PlacementTestPage() {
  const tests = [
    { id: "pt1", title: "English General Placement Test (A1-C1)", questionsCount: 40, duration: "30 min", targetCourse: "General English / IELTS" },
    { id: "pt2", title: "Oliy Matematika & Mantiq Testi", questionsCount: 25, duration: "45 min", targetCourse: "SAT & Prezident Maktabi" },
    { id: "pt3", title: "Frontend & IT Boshlang'ich Savodxonlik", questionsCount: 20, duration: "25 min", targetCourse: "Web Coding Bootcamp" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="text-emerald-500" />
            Daraja Testlari (Placement Test)
          </h1>
        </div>
        <button className={BTN_PRIMARY} onClick={() => alert("Yangi test moduli ochilmoqda")}>
          <Plus size={16} />
          <span>Test yaratish</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tests.map((t) => (
          <div key={t.id} className={`${GLASS} p-5 rounded-2xl space-y-3 flex flex-col justify-between`}>
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 text-[10px] font-bold uppercase">
                {t.targetCourse}
              </span>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mt-2">{t.title}</h3>
              <div className="text-xs text-slate-500 mt-2 space-y-1">
                <div>Savollar soni: <span className="font-bold text-slate-800 dark:text-slate-200">{t.questionsCount} ta</span></div>
                <div>Ajratilgan vaqt: <span className="font-bold text-slate-800 dark:text-slate-200">{t.duration}</span></div>
              </div>
            </div>
            <button className={`${BTN_GHOST} w-full text-xs font-semibold`}>
              <span>Testni ko'rish / Tahrirlash</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// 7. Ballar va Baholash (Points & Grading)
export { PointsGradingPage } from "./PointsGradingPage";

// 8. Imtihon Shablonlari (Exam Templates)
export function ExamTemplatesPage() {
  const templates = [
    { id: "et1", title: "IELTS Mock Full Exam (Listening, Reading, Writing, Speaking)", duration: "2 soat 45 min", maxScore: "9.0 Band" },
    { id: "et2", title: "CEFR B2 Multi-level Shablon", duration: "2 soat", maxScore: "75 ball" },
    { id: "et3", title: "Mid-Term Oylik Oraliq Imtihon", duration: "1 soat", maxScore: "100 ball" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ClipboardList className="text-indigo-500" />
            Imtihon Shablonlari
          </h1>
        </div>
        <button className={BTN_PRIMARY} onClick={() => alert("Imtihon shabloni yaratish")}>
          <Plus size={16} />
          <span>Shablon qo'shish</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {templates.map((t) => (
          <div key={t.id} className={`${GLASS} p-5 rounded-2xl space-y-3`}>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">{t.title}</h3>
            <div className="text-xs text-slate-500 space-y-1">
              <div>Vaqt: <span className="font-semibold text-slate-800 dark:text-slate-200">{t.duration}</span></div>
              <div>Maksimal Ball: <span className="font-semibold text-slate-800 dark:text-slate-200">{t.maxScore}</span></div>
            </div>
            <button className={`${BTN_GHOST} w-full text-xs font-semibold`}>Tahrirlash</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// 9. SMS Sotib Olish (SMS Buy)
export function SmsBuyPage() {
  const [balance, setBalance] = useState(14200);

  const packages = [
    { id: "p1", smsCount: 5000, price: 300000, perSms: 60, popular: false },
    { id: "p2", smsCount: 15000, price: 750000, perSms: 50, popular: true },
    { id: "p3", smsCount: 50000, price: 2000000, perSms: 40, popular: false },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="text-sky-500" />
            SMS Sotib Olish va Balans
          </h1>
        </div>
      </div>

      {/* Balance Card */}
      <div className={`${GLASS} p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-sky-900/10 to-indigo-900/10`}>
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase">Joriy SMS Balans</span>
          <div className="text-3xl font-extrabold text-sky-600 dark:text-sky-400 mt-1">{balance.toLocaleString()} ta SMS</div>
          <p className="text-xs text-slate-500 mt-1">SMS shlyuzi statusi: <span className="text-emerald-500 font-bold">Faol (Eskiz.uz)</span></p>
        </div>
        <button onClick={() => alert("Tolash oynasi ochilmoqda...")} className={BTN_PRIMARY}>
          <ShoppingBag size={16} />
          <span>Balansni To'ldirish</span>
        </button>
      </div>

      {/* Packages */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div key={pkg.id} className={`${GLASS} p-6 rounded-2xl space-y-4 relative ${pkg.popular ? "border-2 border-indigo-500 shadow-xl" : ""}`}>
            {pkg.popular && (
              <span className="absolute -top-3 right-4 px-3 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold uppercase">
                Ommabop
              </span>
            )}
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{pkg.smsCount.toLocaleString()} SMS</div>
              <div className="text-xs text-slate-400 mt-1">1 SMS = {pkg.perSms} so'mdan</div>
            </div>
            <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {money(pkg.price)} so'm
            </div>
            <button
              onClick={() => {
                setBalance(balance + pkg.smsCount);
                alert(`${pkg.smsCount} SMS paketi muvaffaqiyatli xarid qilindi!`);
              }}
              className={`${pkg.popular ? BTN_PRIMARY : BTN_GHOST} w-full text-xs font-bold`}
            >
              Sotib olish
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// 10. Auto SMS (Automated SMS)
export function AutoSmsPage() {
  const [triggers, setTriggers] = useState([
    { id: "tr1", title: "Yangi Lid Ro'yxatdan O'tganda", desc: "Mijoz ro'yxatdan o'tishi bilanoq hush kelibsiz xabari yuborish", active: true },
    { id: "tr2", title: "Qarzdorlik Eslatmasi (Darsga 3 kun qolganda)", desc: "Oylik to'lov muddati yaqinlashganda eslatma yuborish", active: true },
    { id: "tr3", title: "O'quvchi Darsga Kelmaganda (Absence Alert)", desc: "Davomatda 'Yo'q' belgilanganda ota-onasiga avto SMS yuborish", active: true },
    { id: "tr4", title: "O'quvchi Tug'ilgan Kunida Tabrik", desc: "Tug'ilgan kunida avtomatik samimiy tabriknoma yuborish", active: false },
  ]);

  const toggleTrigger = (id) => {
    setTriggers(triggers.map((t) => (t.id === id ? { ...t, active: !t.active } : t)));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Zap className="text-amber-500" />
          Auto SMS Avtomatizatsiyasi
        </h1>
      </div>

      <div className="space-y-3">
        {triggers.map((tr) => (
          <div key={tr.id} className={`${GLASS} p-5 rounded-2xl flex items-center justify-between gap-4`}>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">{tr.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{tr.desc}</p>
            </div>
            <button
              onClick={() => toggleTrigger(tr.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                tr.active ? "bg-emerald-500 text-white shadow-md" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}
            >
              {tr.active ? "Faol" : "O'chirilgan"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// 11. SMS Shablonlar (SMS Templates)
export function SmsTemplatesPage() {
  const [templates, setTemplates] = useState([
    { id: "st1", title: "Lid hush kelibsiz", text: "Salom {ism}! COSMOS LC o'quv markaziga xush kelibsiz. Tez orada menejerimiz siz bilan bog'lanadi. Tel: +998901234567" },
    { id: "st2", title: "Qarzdorlik eslatmasi", text: "Hormang {ism}! {guruh} guruhi uchun oylik to'lov muddati keldi. To'lanishi kerak bo'lgan summa: {summa} so'm." },
    { id: "st3", title: "Darsga kelmadi haqida", text: "Hurmatli ota-ona! Farzandingiz {ism} bugun {guruh} darsiga sababsiz kelmadi. Savollar bo'lsa bog'laning." },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="text-indigo-500" />
            SMS Shablonlar
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((st) => (
          <div key={st.id} className={`${GLASS} p-5 rounded-2xl space-y-3`}>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">{st.title}</h3>
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl text-xs text-slate-700 dark:text-slate-300 font-mono">
              "{st.text}"
            </div>
            <div className="flex justify-end gap-2">
              <button className={`${BTN_GHOST} text-xs py-1.5 px-3`}>Tahrirlash</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 12. Formalar (Lead Forms - Oddiy, O'qituvchi, Xodim, Referal)
export function FormsBuilderPage({ formType = "simpleForm" }) {
  const formTitles = {
    simpleForm: "Oddiy Lid Ro'yxatdan O'tish Formasi",
    teacherForm: "O'qituvchi Ishga Kirish Formasi",
    staffForm: "Xodim Vakansiya Formasi",
    referralForm: "Referal 'Do'stingni Olib Kel' Formasi",
  };

  const title = formTitles[formType] || "Lidlar Formasi";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="text-indigo-500" />
          {title}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings */}
        <div className={`${GLASS} p-6 rounded-2xl space-y-4`}>
          <h3 className="font-bold text-slate-900 dark:text-white text-base border-b border-slate-100 dark:border-slate-800 pb-3">
            Forma Maydonlari
          </h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <input type="checkbox" defaultChecked disabled className="w-4 h-4 text-indigo-600 rounded" />
              Ism va Familiya (Majburiy)
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <input type="checkbox" defaultChecked disabled className="w-4 h-4 text-indigo-600 rounded" />
              Telefon Raqami (Majburiy)
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded" />
              Qiziqqan Yo'nalishi / Kursi
            </label>
            {formType === "teacherForm" && (
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded" />
                Rezyume yuklash (PDF/Word)
              </label>
            )}
            {formType === "referralForm" && (
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded" />
                Taklif qilgan do'sti ID kodi
              </label>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <label className={LABEL_CLS}>Veb-saytga joylash iframe kodi</label>
            <div className="p-3 bg-slate-900 text-emerald-400 rounded-xl text-[11px] font-mono break-all flex items-center justify-between gap-2">
              <span>{`<iframe src="https://cosmos.edu.uz/forms/${formType}" width="100%" height="450"></iframe>`}</span>
              <button onClick={() => alert("Kopirolandi!")} className="text-white hover:text-indigo-300">
                <Copy size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div className={`${GLASS} p-6 rounded-2xl space-y-4`}>
          <h3 className="font-bold text-slate-900 dark:text-white text-base border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
            <span>Forma Preview</span>
            <ExternalLink size={14} className="text-slate-400" />
          </h3>

          <div className="bg-slate-50 dark:bg-slate-900/80 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 max-w-sm mx-auto shadow-inner">
            <div className="text-center">
              <div className="font-bold text-slate-900 dark:text-white text-base">COSMOS LC</div>
              <div className="text-xs text-slate-500 mt-0.5">{title}</div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">To'liq Ismingiz</label>
              <input type="text" placeholder="Masalan: Sardor Rahimov" className={`${INPUT_CLS} text-xs py-2`} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">Telefon Raqamingiz</label>
              <input type="text" placeholder="+998 90 000 00 00" className={`${INPUT_CLS} text-xs py-2`} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">Tanlangan Kurs</label>
              <select className={`${INPUT_CLS} text-xs py-2`}>
                <option>IELTS Intensive</option>
                <option>Frontend React Bootcamp</option>
                <option>General English</option>
              </select>
            </div>
            <button type="button" className={`${BTN_PRIMARY} w-full text-xs py-2.5 mt-2`}>
              Ariza Yuborish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 13. Teglar (Tags)
export { TagsPage } from "./TagsPage";

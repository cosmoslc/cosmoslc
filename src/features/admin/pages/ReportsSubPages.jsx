import React, { useState } from "react";
import { ExcelButton } from "../theme/tokens";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Award,
  BookOpen,
  Calendar,
  Clock,
  FileText,
  MessageSquare,
  Gift,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Download,
  ChevronRight,
  UserCheck,
  Zap,
  GraduationCap,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Star,
  RefreshCw,
} from "lucide-react";

// Reusable Metric Card
const StatCard = ({ title, value, change, changeType, icon: Icon, color }) => (
  <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
    <div>
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
        {title}
      </p>
      <h4 className="text-2xl font-bold text-slate-900 dark:text-white">{value}</h4>
      {change && (
        <div className="flex items-center gap-1 mt-1 text-xs font-semibold">
          {changeType === "up" ? (
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
              <ArrowUpRight size={14} /> {change}
            </span>
          ) : (
            <span className="text-rose-600 dark:text-rose-400 flex items-center gap-0.5">
              <ArrowDownRight size={14} /> {change}
            </span>
          )}
          <span className="text-slate-400 font-normal">o'tgan oyga nisbatan</span>
        </div>
      )}
    </div>
    <div
      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md ${color}`}
    >
      <Icon size={24} />
    </div>
  </div>
);

// Filter Bar Component
const FilterBar = ({ search, setSearch, onExport, placeholder }) => (
  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
    <div className="relative w-full sm:w-80">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={placeholder || "Qidirish..."}
        className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>

    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
      <select className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none">
        <option value="all">Barcha filiallar</option>
        <option value="main">Bosh Filial (Chilonzor)</option>
        <option value="yunusobod">Yunusobod Filiali</option>
      </select>

      <select className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none">
        <option value="this_month">Shu oy</option>
        <option value="last_month">O'tgan oy</option>
        <option value="quarter">Shu chorak</option>
        <option value="year">Shu yil</option>
      </select>

      <ExcelButton
        onExport={onExport}
        title="Hisobot Excel amallari"
        exportLabel="Hisobotni Excel'da yuklab olish"
      />
    </div>
  </div>
);

// 1. KURS HISOBOTI
export const CourseReportPage = () => {
  const [search, setSearch] = useState("");
  const courses = [
    { name: "General English (Pre-Inter)", level: "B1", students: 142, groups: 11, revenue: "85,200,000 UZS", growth: "+14%" },
    { name: "IELTS Intensive 7.5+", level: "C1", students: 88, groups: 7, revenue: "79,200,000 UZS", growth: "+22%" },
    { name: "Frontend React & Next.js", level: "Middle", students: 64, groups: 5, revenue: "76,800,000 UZS", growth: "+8%" },
    { name: "Python & Data Science", level: "Beginner", students: 52, groups: 4, revenue: "57,200,000 UZS", growth: "+5%" },
    { name: "Elementary Speaking", level: "A2", students: 110, groups: 9, revenue: "55,000,000 UZS", growth: "-2%" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Kurslar Bo'yicha Daromad va Tushum Hisoboti</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Jami Aktiv Kurslar" value="18 ta" change="+2 yangi" changeType="up" icon={BookOpen} color="bg-indigo-600" />
        <StatCard title="Jami O'quvchilar" value="456 nafar" change="+12%" changeType="up" icon={Users} color="bg-blue-600" />
        <StatCard title="Oylik Tushum" value="353.4 mln UZS" change="+18.5%" changeType="up" icon={DollarSign} color="bg-emerald-600" />
        <StatCard title="O'rtacha Guruh To'lishi" value="12.8 kishi" change="+0.4" changeType="up" icon={GraduationCap} color="bg-violet-600" />
      </div>

      <FilterBar search={search} setSearch={setSearch} placeholder="Kurs nomini qidirish..." />

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="p-4 font-semibold">Kurs Nomi</th>
              <th className="p-4 font-semibold">Darajasi</th>
              <th className="p-4 font-semibold">Guruhlar</th>
              <th className="p-4 font-semibold">O'quvchilar</th>
              <th className="p-4 font-semibold">Oylik Tushum</th>
              <th className="p-4 font-semibold">O'sish Dinamikasi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {courses.map((c, i) => (
              <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                <td className="p-4 font-bold text-slate-900 dark:text-white">{c.name}</td>
                <td className="p-4"><span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold">{c.level}</span></td>
                <td className="p-4 font-medium">{c.groups} ta guruh</td>
                <td className="p-4 font-medium">{c.students} nafar</td>
                <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">{c.revenue}</td>
                <td className="p-4 font-semibold text-emerald-600">{c.growth}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 2. O'QITUVCHI SAMARADORLIGI HISOBOTI
export const TeacherPerformanceReportPage = () => {
  const [search, setSearch] = useState("");
  const teachers = [
    { name: "Jasur Raximov", subject: "IELTS & Senior English", groups: 6, retention: "98.2%", rating: "4.95 ⭐", hours: "128 soat", salary: "18,400,000 UZS" },
    { name: "Malika Akramova", subject: "General English (B1/B2)", groups: 5, retention: "94.5%", rating: "4.88 ⭐", hours: "112 soat", salary: "15,200,000 UZS" },
    { name: "Sardor Umidov", subject: "Frontend Web Dev", groups: 4, retention: "92.0%", rating: "4.82 ⭐", hours: "96 soat", salary: "16,800,000 UZS" },
    { name: "Elena Kim", subject: "Kid's English", groups: 5, retention: "96.0%", rating: "4.90 ⭐", hours: "105 soat", salary: "14,000,000 UZS" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">O'qituvchilar Samaradorligi (KPI) Hisoboti</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="O'rtacha Reyting" value="4.89 / 5.0" change="+0.12" changeType="up" icon={Star} color="bg-amber-500" />
        <StatCard title="O'rtacha Retensiya" value="95.1%" change="+2.4%" changeType="up" icon={UserCheck} color="bg-emerald-600" />
        <StatCard title="Jami Dars Soatlari" value="1,240 soat" change="+80 soat" changeType="up" icon={Clock} color="bg-blue-600" />
        <StatCard title="O'rtacha Maosh" value="14.8 mln UZS" change="+5%" changeType="up" icon={DollarSign} color="bg-indigo-600" />
      </div>

      <FilterBar search={search} setSearch={setSearch} placeholder="O'qituvchi ismini qidirish..." />

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="p-4 font-semibold">O'qituvchi F.I.Sh</th>
              <th className="p-4 font-semibold">Yo'nalishi</th>
              <th className="p-4 font-semibold">Guruhlar</th>
              <th className="p-4 font-semibold">Retensiya %</th>
              <th className="p-4 font-semibold">O'quvchilar Reytingi</th>
              <th className="p-4 font-semibold">Dars Yuklamasi</th>
              <th className="p-4 font-semibold">Hisoblangan Maosh</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {teachers.map((t, i) => (
              <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                <td className="p-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-200">
                    {t.name.charAt(0)}
                  </div>
                  {t.name}
                </td>
                <td className="p-4 text-slate-500">{t.subject}</td>
                <td className="p-4 font-medium">{t.groups} ta guruh</td>
                <td className="p-4 font-bold text-emerald-600">{t.retention}</td>
                <td className="p-4 font-semibold text-amber-500">{t.rating}</td>
                <td className="p-4">{t.hours}</td>
                <td className="p-4 font-bold text-slate-900 dark:text-white">{t.salary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 3. PUL OQIMI HISOBOTI (CASHFLOW)
export const CashflowReportPage = () => {
  const [search, setSearch] = useState("");
  const cashflow = [
    { date: "2026-08-25", category: "O'quvchi to'lovi (Humo)", type: "inflow", amount: "+ 4,500,000 UZS", payer: "Otabek Salimov", status: "Muvaffaqiyatli" },
    { date: "2026-08-25", category: "Bino ijara xarajati", type: "outflow", amount: "- 12,000,000 UZS", payer: "Chilonzor City Plaza", status: "Muvaffaqiyatli" },
    { date: "2026-08-24", category: "O'quvchi to'lovi (Naqd)", type: "inflow", amount: "+ 1,800,000 UZS", payer: "Shahzoda Aliyeva", status: "Muvaffaqiyatli" },
    { date: "2026-08-24", category: "Internet & Kantselyariya", type: "outflow", amount: "- 850,000 UZS", payer: "Turon Telecom", status: "Muvaffaqiyatli" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pul Oqimi (Cashflow) Hisoboti</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Jami Kirim (Inflow)" value="384,500,000 UZS" change="+12%" changeType="up" icon={TrendingUp} color="bg-emerald-600" />
        <StatCard title="Jami Chiqim (Outflow)" value="142,200,000 UZS" change="-4%" changeType="down" icon={DollarSign} color="bg-rose-600" />
        <StatCard title="Sof Pul Balansi" value="242,300,000 UZS" change="+21%" changeType="up" icon={BarChart3} color="bg-indigo-600" />
        <StatCard title="Naqd / Bank Nisbati" value="42% / 58%" change="Stabil" changeType="up" icon={CreditCardIcon} color="bg-blue-600" />
      </div>

      <FilterBar search={search} setSearch={setSearch} placeholder="Operatsiya yoki to'lovchini qidirish..." />

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="p-4 font-semibold">Sana / Vaqt</th>
              <th className="p-4 font-semibold">Kategoriya</th>
              <th className="p-4 font-semibold">Kontragent / Shaxs</th>
              <th className="p-4 font-semibold">Turi</th>
              <th className="p-4 font-semibold">Summa</th>
              <th className="p-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {cashflow.map((c, i) => (
              <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                <td className="p-4 font-medium">{c.date}</td>
                <td className="p-4 font-semibold text-slate-900 dark:text-white">{c.category}</td>
                <td className="p-4 text-slate-500">{c.payer}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-lg font-semibold ${c.type === "inflow" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60" : "bg-rose-50 text-rose-600 dark:bg-rose-950/60"}`}>
                    {c.type === "inflow" ? "Kirim" : "Chiqim"}
                  </span>
                </td>
                <td className={`p-4 font-bold ${c.type === "inflow" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                  {c.amount}
                </td>
                <td className="p-4"><span className="text-emerald-600 font-medium">✓ {c.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Credit Card helper icon
const CreditCardIcon = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

// 4. ISH HAQI HISOBOTI
export const SalariesReportPage = () => {
  const [search, setSearch] = useState("");
  const salaries = [
    { name: "Jasur Raximov", role: "Katta O'qituvchi", base: "8,000,000 UZS", bonus: "10,400,000 UZS", total: "18,400,000 UZS", paid: "18,400,000 UZS", status: "To'liq to'langan" },
    { name: "Dilnoza Karimova", role: "Administrator", base: "5,500,000 UZS", bonus: "1,200,000 UZS", total: "6,700,000 UZS", paid: "6,700,000 UZS", status: "To'liq to'langan" },
    { name: "Sardor Umidov", role: "IT O'qituvchi", base: "9,000,000 UZS", bonus: "7,800,000 UZS", total: "16,800,000 UZS", paid: "10,000,000 UZS", status: "Qisman to'langan" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Ish Haqi va Maoshlar Qaydnomasi Hisoboti</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Hisoblangan Ish Haqi" value="148.5 mln UZS" change="+6%" changeType="up" icon={DollarSign} color="bg-indigo-600" />
        <StatCard title="To'lab Berilgan" value="132.0 mln UZS" change="88.8%" changeType="up" icon={CheckCircle2} color="bg-emerald-600" />
        <StatCard title="Qoldiq Maosh" value="16.5 mln UZS" change="11.2%" changeType="down" icon={AlertTriangle} color="bg-amber-600" />
        <StatCard title="Jami Xodimlar" value="24 kishi" change="Aktiv" changeType="up" icon={Users} color="bg-blue-600" />
      </div>

      <FilterBar search={search} setSearch={setSearch} placeholder="Xodim ismini qidirish..." />

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="p-4 font-semibold">Xodim F.I.Sh</th>
              <th className="p-4 font-semibold">Lavozimi</th>
              <th className="p-4 font-semibold">Asosiy Stavkasi</th>
              <th className="p-4 font-semibold">KPI / Bonus</th>
              <th className="p-4 font-semibold">Jami Hisoblandi</th>
              <th className="p-4 font-semibold">To'langan Summa</th>
              <th className="p-4 font-semibold">Holati</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {salaries.map((s, i) => (
              <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                <td className="p-4 font-bold text-slate-900 dark:text-white">{s.name}</td>
                <td className="p-4 text-slate-500">{s.role}</td>
                <td className="p-4">{s.base}</td>
                <td className="p-4 font-semibold text-emerald-600">{s.bonus}</td>
                <td className="p-4 font-bold text-slate-900 dark:text-white">{s.total}</td>
                <td className="p-4 font-bold text-emerald-600">{s.paid}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${s.status === "To'liq to'langan" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                    {s.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 5. CHEGIRMA HISOBOTI
export const DiscountsReportPage = () => {
  const [search, setSearch] = useState("");
  const discounts = [
    { student: "Anvar Hakimov", group: "IELTS Intensive #4", type: "Ko'p farzandli oila", percent: "15%", amount: "120,000 UZS", approvedBy: "Bosh Direktor" },
    { student: "Madina Qosimova", group: "General English B1", type: "Erta to'lov bonusi", percent: "10%", amount: "75,000 UZS", approvedBy: "Administrator" },
    { student: "Jahongir Olimov", group: "Python Dev #2", type: "Olimpiada g'olibi", percent: "50%", amount: "550,000 UZS", approvedBy: "Bosh Direktor" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Chegirmalar va Promokodlar Hisoboti</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Chegirma Olganlar" value="38 nafar" change="+5" changeType="up" icon={Gift} color="bg-purple-600" />
        <StatCard title="Jami Chegirma Summasi" value="14,850,000 UZS" change="Shu oy" changeType="up" icon={DollarSign} color="bg-indigo-600" />
        <StatCard title="O'rtacha Chegirma %" value="12.4%" change="Stabil" changeType="up" icon={BarChart3} color="bg-blue-600" />
        <StatCard title="Ommabop Chegirma" value="Erta To'lov (10%)" change="62% ulush" changeType="up" icon={Zap} color="bg-emerald-600" />
      </div>

      <FilterBar search={search} setSearch={setSearch} placeholder="O'quvchi yoki chegirma turini qidirish..." />

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="p-4 font-semibold">O'quvchi F.I.Sh</th>
              <th className="p-4 font-semibold">Guruh Nomi</th>
              <th className="p-4 font-semibold">Chegirma Turi</th>
              <th className="p-4 font-semibold">Chegirma %</th>
              <th className="p-4 font-semibold">Tejalgan Summa</th>
              <th className="p-4 font-semibold">Tasdiqladi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {discounts.map((d, i) => (
              <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                <td className="p-4 font-bold text-slate-900 dark:text-white">{d.student}</td>
                <td className="p-4 text-slate-500">{d.group}</td>
                <td className="p-4"><span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/60 font-semibold">{d.type}</span></td>
                <td className="p-4 font-bold text-purple-600">{d.percent}</td>
                <td className="p-4 font-bold text-emerald-600">{d.amount}</td>
                <td className="p-4 font-medium">{d.approvedBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 6. YUBORILGAN SMSLAR HISOBOTI
export const SmsSentReportPage = () => {
  const [search, setSearch] = useState("");
  const smsLogs = [
    { phone: "+998 90 123 45 67", name: "Otabek Salimov", type: "To'lov Eslatma", text: "Hurmatli Otabek, IELTS guruhingiz uchun oylik to'lov muddati keld...", time: "Bugun 09:15", status: "Yetkazildi" },
    { phone: "+998 93 987 65 43", name: "Shahzoda Aliyeva", type: "Davomat Ogohlantirish", text: "Hurmatli ota-ona, qizingiz Shahzoda bugun darsga kelmadi...", time: "Bugun 14:30", status: "Yetkazildi" },
    { phone: "+998 97 444 33 22", name: "Jasur Sobirov", type: "Tabriknoma", text: "Tug'ilgan kuningiz muborak bo'lsin! COSMOS LC jamoasi...", time: "Kecha 10:00", status: "Yetkazildi" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Yuborilgan SMSlar Hisoboti</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Jami Yuborilgan SMS" value="14,820 ta" change="+1,200" changeType="up" icon={MessageSquare} color="bg-blue-600" />
        <StatCard title="Muvaffaqiyatli Yetkazilgan" value="98.6%" change="14,612 ta" changeType="up" icon={CheckCircle2} color="bg-emerald-600" />
        <StatCard title="SMS Xarajati" value="1,185,600 UZS" change="80 UZS/sms" changeType="up" icon={DollarSign} color="bg-indigo-600" />
        <StatCard title="Avto-SMS Ulushi" value="84%" change="Avtomatik" changeType="up" icon={Zap} color="bg-violet-600" />
      </div>

      <FilterBar search={search} setSearch={setSearch} placeholder="Telefon raqam yoki qabul qiluvchini qidirish..." />

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="p-4 font-semibold">Qabul Qiluvchi</th>
              <th className="p-4 font-semibold">Telefon Raqam</th>
              <th className="p-4 font-semibold">Xabar Turi</th>
              <th className="p-4 font-semibold">SMS Matni</th>
              <th className="p-4 font-semibold">Vaqti</th>
              <th className="p-4 font-semibold">Holati</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {smsLogs.map((s, i) => (
              <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                <td className="p-4 font-bold text-slate-900 dark:text-white">{s.name}</td>
                <td className="p-4 font-mono text-slate-500">{s.phone}</td>
                <td className="p-4"><span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 font-semibold">{s.type}</span></td>
                <td className="p-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">{s.text}</td>
                <td className="p-4 font-medium">{s.time}</td>
                <td className="p-4"><span className="text-emerald-600 font-bold">✓ {s.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 7. ISH VAQTI HISOBOTI
export const WorkTimeReportPage = () => {
  const [search, setSearch] = useState("");
  const workLogs = [
    { name: "Jasur Raximov", role: "O'qituvchi", checkIn: "08:52", checkOut: "18:05", duration: "9 soat 13 daq", status: "O'z vaqtida" },
    { name: "Dilnoza Karimova", role: "Administrator", checkIn: "09:14", checkOut: "18:00", duration: "8 soat 46 daq", status: "Kechikkan (14 daq)" },
    { name: "Malika Akramova", role: "O'qituvchi", checkIn: "08:45", checkOut: "17:30", duration: "8 soat 45 daq", status: "O'z vaqtida" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Ish Vaqti va Xodimlar Davomati Hisoboti</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="O'rtacha Ish Soati" value="8.4 soat/kun" change="Norma" changeType="up" icon={Clock} color="bg-indigo-600" />
        <StatCard title="O'z Vaqtida Kelganlar" value="94.2%" change="+1.5%" changeType="up" icon={CheckCircle2} color="bg-emerald-600" />
        <StatCard title="Kechikishlar Soni" value="6 marotaba" change="Shu hafta" changeType="down" icon={AlertTriangle} color="bg-amber-600" />
        <StatCard title="Jami Qaydlar" value="480 ta" change="+32" changeType="up" icon={Calendar} color="bg-blue-600" />
      </div>

      <FilterBar search={search} setSearch={setSearch} placeholder="Xodim ismini qidirish..." />

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="p-4 font-semibold">Xodim F.I.Sh</th>
              <th className="p-4 font-semibold">Lavozimi</th>
              <th className="p-4 font-semibold">Kelgan Vaqti</th>
              <th className="p-4 font-semibold">Ketgan Vaqti</th>
              <th className="p-4 font-semibold">Jami Ish Soati</th>
              <th className="p-4 font-semibold">Holati</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {workLogs.map((w, i) => (
              <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                <td className="p-4 font-bold text-slate-900 dark:text-white">{w.name}</td>
                <td className="p-4 text-slate-500">{w.role}</td>
                <td className="p-4 font-semibold text-emerald-600">{w.checkIn}</td>
                <td className="p-4 font-semibold text-blue-600">{w.checkOut}</td>
                <td className="p-4 font-bold">{w.duration}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${w.status.includes("Kechikkan") ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}>
                    {w.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 8. JURNALLAR HISOBOTI
export const JournalsReportPage = () => {
  const [search, setSearch] = useState("");
  const journals = [
    { group: "IELTS Intensive #1", teacher: "Jasur Raximov", lastTopic: "Writing Task 2: Advanced Cohesion", date: "2026-08-25", attendance: "95%", hwCompletion: "92%", status: "To'ldirilgan" },
    { group: "General English B1 #3", teacher: "Malika Akramova", lastTopic: "Present Perfect vs Past Simple", date: "2026-08-25", attendance: "100%", hwCompletion: "88%", status: "To'ldirilgan" },
    { group: "Frontend React #2", teacher: "Sardor Umidov", lastTopic: "Custom Hooks & Context API", date: "2026-08-24", attendance: "90%", hwCompletion: "95%", status: "To'ldirilgan" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">O'quv Jurnallari va Dars Qaydlari Hisoboti</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Jurnallar To'ldirilishi" value="97.8%" change="+1.2%" changeType="up" icon={FileText} color="bg-indigo-600" />
        <StatCard title="Jami O'tilgan Darslar" value="1,420 ta" change="Shu oy" changeType="up" icon={BookOpen} color="bg-blue-600" />
        <StatCard title="O'rtacha Uy Vazifasi" value="91.4%" change="+3%" changeType="up" icon={CheckCircle2} color="bg-emerald-600" />
        <StatCard title="Aktiv Guruh Jurnallari" value="36 ta" change="Barchasi aktiv" changeType="up" icon={Users} color="bg-violet-600" />
      </div>

      <FilterBar search={search} setSearch={setSearch} placeholder="Guruh nomi yoki o'qituvchini qidirish..." />

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="p-4 font-semibold">Guruh Nomi</th>
              <th className="p-4 font-semibold">O'qituvchi</th>
              <th className="p-4 font-semibold">Oxirgi O'tilgan Mavzu</th>
              <th className="p-4 font-semibold">Dars Sana</th>
              <th className="p-4 font-semibold">Davomat %</th>
              <th className="p-4 font-semibold">Uy Vazifasi %</th>
              <th className="p-4 font-semibold">Jurnal Holati</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {journals.map((j, i) => (
              <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                <td className="p-4 font-bold text-slate-900 dark:text-white">{j.group}</td>
                <td className="p-4 text-slate-500">{j.teacher}</td>
                <td className="p-4 font-medium max-w-xs truncate">{j.lastTopic}</td>
                <td className="p-4 font-mono">{j.date}</td>
                <td className="p-4 font-bold text-emerald-600">{j.attendance}</td>
                <td className="p-4 font-bold text-blue-600">{j.hwCompletion}</td>
                <td className="p-4"><span className="text-emerald-600 font-bold">✓ {j.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 9. TANGA (COIN) HISOBOTI
export const CoinsReportPage = () => {
  const [search, setSearch] = useState("");
  const coins = [
    { student: "Sardor Raimov", group: "IELTS Intensive #1", earned: "1,450 🪙", spent: "600 🪙", balance: "850 🪙", rank: "#1 Top Talaba" },
    { student: "Zilola Alimova", group: "Frontend React", earned: "1,200 🪙", spent: "400 🪙", balance: "800 🪙", rank: "#2 Top Talaba" },
    { student: "Bekzod Tursunov", group: "General English B1", earned: "980 🪙", spent: "200 🪙", balance: "780 🪙", rank: "#3 Top Talaba" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Coin (Coin) va Rag'batlantirish Hisoboti</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Muomaladagi Jami Coin" value="48,500 🪙" change="+4,200" changeType="up" icon={Award} color="bg-amber-500" />
        <StatCard title="Ishlatilgan Sovg'alar" value="12,400 🪙" change="64 ta sovg'a" changeType="up" icon={Gift} color="bg-purple-600" />
        <StatCard title="Faol Coin Ega Talabalar" value="380 nafar" change="83.3%" changeType="up" icon={Users} color="bg-indigo-600" />
        <StatCard title="Top Coin Egasi" value="1,450 🪙" change="Sardor Raimov" changeType="up" icon={Star} color="bg-emerald-600" />
      </div>

      <FilterBar search={search} setSearch={setSearch} placeholder="Talaba ismini qidirish..." />

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 text-xs font-semibold">
            <tr>
              <th className="py-3 px-4">Talaba F.I.Sh</th>
              <th className="py-3 px-4">Guruh Nomi</th>
              <th className="py-3 px-4">Ishlangan Coin</th>
              <th className="py-3 px-4">Sarflangan Coin</th>
              <th className="py-3 px-4">Joriy Balans</th>
              <th className="py-3 px-4">Reyting O'rni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {coins.map((c, i) => (
              <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{c.student}</td>
                <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-xs">{c.group}</td>
                <td className="py-3 px-4 font-bold font-mono text-amber-600 dark:text-amber-400">{c.earned}</td>
                <td className="py-3 px-4 font-semibold font-mono text-rose-500 dark:text-rose-400">{c.spent}</td>
                <td className="py-3 px-4 font-bold font-mono text-emerald-600 dark:text-emerald-400">{c.balance}</td>
                <td className="py-3 px-4">
                  <span className="px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold text-xs border border-amber-200/50 dark:border-amber-500/30">
                    {c.rank}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 10. BALLAR HISOBOTI
export const PointsReportPage = () => {
  const [search, setSearch] = useState("");
  const pointsData = [
    { student: "Otabek Salimov", group: "IELTS Intensive #1", hwScore: "98/100", examScore: "8.0 Band", totalPoints: "995 pt", status: "A+ A'lo" },
    { student: "Shahzoda Aliyeva", group: "General English B1", hwScore: "92/100", examScore: "88/100", totalPoints: "910 pt", status: "A A'lo" },
    { student: "Diyorbek Rahimov", group: "Python Dev #2", hwScore: "85/100", examScore: "90/100", totalPoints: "875 pt", status: "B+ Yaxshi" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">O'quvchilar Ballari va Akademik Reyting Hisoboti</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="O'rtacha Akademik Ball" value="88.5 pt" change="+2.1" changeType="up" icon={Award} color="bg-indigo-600" />
        <StatCard title="A'lochi Talabalar" value="142 nafar" change="31% ulush" changeType="up" icon={Star} color="bg-amber-500" />
        <StatCard title="Top Reyting Bali" value="995 pt" change="Otabek S." changeType="up" icon={GraduationCap} color="bg-emerald-600" />
        <StatCard title="Imtihon topshirganlar" value="96.4%" change="Yuqori" changeType="up" icon={CheckCircle2} color="bg-blue-600" />
      </div>

      <FilterBar search={search} setSearch={setSearch} placeholder="O'quvchi ismini qidirish..." />

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="p-4 font-semibold">O'quvchi F.I.Sh</th>
              <th className="p-4 font-semibold">Guruh Nomi</th>
              <th className="p-4 font-semibold">Uy Vazifasi Bali</th>
              <th className="p-4 font-semibold">Imtihon Bali</th>
              <th className="p-4 font-semibold">Jami Ball</th>
              <th className="p-4 font-semibold">Darajasi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {pointsData.map((p, i) => (
              <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                <td className="p-4 font-bold text-slate-900 dark:text-white">{p.student}</td>
                <td className="p-4 text-slate-500">{p.group}</td>
                <td className="p-4 font-semibold">{p.hwScore}</td>
                <td className="p-4 font-semibold text-blue-600">{p.examScore}</td>
                <td className="p-4 font-bold text-indigo-600">{p.totalPoints}</td>
                <td className="p-4"><span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 font-bold">{p.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 11. IMTIHON HISOBOTLARI
export const ExamsReportPage = () => {
  const [search, setSearch] = useState("");
  const exams = [
    { name: "Mock IELTS Monthly #8", group: "IELTS Intensive #1 & #2", date: "2026-08-20", candidates: 42, avgScore: "7.2 Band", passRate: "95.2%", status: "Yopilgan" },
    { name: "CEFR B2 Level Check", group: "General English B2", date: "2026-08-18", candidates: 28, avgScore: "78 / 100", passRate: "89.2%", status: "Yopilgan" },
    { name: "Frontend Midterm Project", group: "Frontend React #2", date: "2026-08-15", candidates: 18, avgScore: "91 / 100", passRate: "100%", status: "Yopilgan" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Imtihonlar va Sinov Natijalari Hisoboti</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="O'tkazilgan Imtihonlar" value="12 ta" change="Shu oy" changeType="up" icon={FileText} color="bg-indigo-600" />
        <StatCard title="Katnashgan O'quvchilar" value="184 nafar" change="94% davomat" changeType="up" icon={Users} color="bg-blue-600" />
        <StatCard title="O'rtacha O'tish Ko'rsatkichi" value="94.8%" change="+2.3%" changeType="up" icon={CheckCircle2} color="bg-emerald-600" />
        <StatCard title="Sertifikat Berilganlar" value="68 nafar" change="Bitiruvchilar" changeType="up" icon={Award} color="bg-amber-500" />
      </div>

      <FilterBar search={search} setSearch={setSearch} placeholder="Imtihon nomini qidirish..." />

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="p-4 font-semibold">Imtihon Nomi</th>
              <th className="p-4 font-semibold">Guruh / Kurs</th>
              <th className="p-4 font-semibold">O'tkazilgan Sana</th>
              <th className="p-4 font-semibold">Katnashchilar</th>
              <th className="p-4 font-semibold">O'rtacha Natija</th>
              <th className="p-4 font-semibold">O'tish %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {exams.map((e, i) => (
              <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                <td className="p-4 font-bold text-slate-900 dark:text-white">{e.name}</td>
                <td className="p-4 text-slate-500">{e.group}</td>
                <td className="p-4 font-mono">{e.date}</td>
                <td className="p-4 font-medium">{e.candidates} nafar</td>
                <td className="p-4 font-bold text-indigo-600">{e.avgScore}</td>
                <td className="p-4 font-bold text-emerald-600">{e.passRate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 12. LIDLAR HISOBOTI
export const LeadsReportPage = () => {
  const [search, setSearch] = useState("");
  const leadChannels = [
    { channel: "Instagram Target Reklama", leads: 420, converted: 148, conversionRate: "35.2%", revenue: "118,400,000 UZS" },
    { channel: "Telegram Kanal & Bot", leads: 280, converted: 112, conversionRate: "40.0%", revenue: "89,600,000 UZS" },
    { channel: "Referal (Do'stini taklif)", leads: 140, converted: 98, conversionRate: "70.0%", revenue: "78,400,000 UZS" },
    { channel: "Tashqi Bannerlar & Flayer", leads: 90, converted: 18, conversionRate: "20.0%", revenue: "14,400,000 UZS" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Lidlar va Konversiya Manbalari Hisoboti</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Jami Kelgan Lidlar" value="930 ta" change="+14%" changeType="up" icon={Users} color="bg-indigo-600" />
        <StatCard title="Muvaffaqiyatli Konversiya" value="376 nafar" change="40.4% conversion" changeType="up" icon={CheckCircle2} color="bg-emerald-600" />
        <StatCard title="Eng Samarador Kanal" value="Referal (70%)" change="Yuqori ishonch" changeType="up" icon={Star} color="bg-amber-500" />
        <StatCard title="Lid Xarajati (CAC)" value="42,000 UZS" change="-8%" changeType="down" icon={DollarSign} color="bg-blue-600" />
      </div>

      <FilterBar search={search} setSearch={setSearch} placeholder="Manba yoki kanalni qidirish..." />

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="p-4 font-semibold">Reklama Manbasi / Kanal</th>
              <th className="p-4 font-semibold">Kelgan Lidlar</th>
              <th className="p-4 font-semibold">O'quvchiga Aylangan</th>
              <th className="p-4 font-semibold">Konversiya %</th>
              <th className="p-4 font-semibold">Keltirgan Daromad</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {leadChannels.map((lc, i) => (
              <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                <td className="p-4 font-bold text-slate-900 dark:text-white">{lc.channel}</td>
                <td className="p-4 font-medium">{lc.leads} ta</td>
                <td className="p-4 font-bold text-emerald-600">{lc.converted} nafar</td>
                <td className="p-4 font-bold text-indigo-600">{lc.conversionRate}</td>
                <td className="p-4 font-bold text-slate-900 dark:text-white">{lc.revenue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 13. GURUHDAN O'CHIRILGANLAR HISOBOTI
export const GroupRemovedReportPage = () => {
  const [search, setSearch] = useState("");
  const removedStudents = [
    { student: "Jamshid Karimov", group: "IELTS Intensive #3", teacher: "Jasur Raximov", exitDate: "2026-08-22", reason: "Vaqt to'g'ri kelmadi (Vaqt o'zgarishi)", refundStatus: "Qaytarilmadi (Tugagan)", manager: "Dilnoza K." },
    { student: "Kamola Umarova", group: "Python Dev #1", teacher: "Sardor Umidov", exitDate: "2026-08-19", reason: "Boshqa shahrga ko'chib ketdi", refundStatus: "450,000 UZS qaytarildi", manager: "Farruh N." },
    { student: "Nodir Hakimov", group: "General English A2", teacher: "Malika Akramova", exitDate: "2026-08-14", reason: "Surunkali dars qoldirish", refundStatus: "Shartnoma bekor qilindi", manager: "Dilnoza K." },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Guruhdan O'chirilgan va Ketgan O'quvchilar Hisoboti</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Jami Ketganlar" value="14 nafar" change="-2" changeType="down" icon={XCircle} color="bg-rose-600" />
        <StatCard title="Ketish Darajasi (Churn)" value="3.1%" change="-0.5%" changeType="down" icon={TrendingUp} color="bg-emerald-600" />
        <StatCard title="Asosiy Sabab" value="Vaqt to'g'ri kelmadi" change="45% ulush" changeType="up" icon={Clock} color="bg-amber-600" />
        <StatCard title="Qaytarilgan Mablag'" value="2,400,000 UZS" change="3 ta holat" changeType="down" icon={DollarSign} color="bg-indigo-600" />
      </div>

      <FilterBar search={search} setSearch={setSearch} placeholder="O'quvchi ismi yoki sababni qidirish..." />

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="p-4 font-semibold">O'quvchi F.I.Sh</th>
              <th className="p-4 font-semibold">Guruh Nomi</th>
              <th className="p-4 font-semibold">O'qituvchi</th>
              <th className="p-4 font-semibold">Ketgan Sana</th>
              <th className="p-4 font-semibold">Ketish Sababi</th>
              <th className="p-4 font-semibold">Pul Qaytarish Holati</th>
              <th className="p-4 font-semibold">Menejer</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {removedStudents.map((r, i) => (
              <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                <td className="p-4 font-bold text-slate-900 dark:text-white">{r.student}</td>
                <td className="p-4 text-slate-500">{r.group}</td>
                <td className="p-4 font-medium">{r.teacher}</td>
                <td className="p-4 font-mono">{r.exitDate}</td>
                <td className="p-4"><span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 font-semibold">{r.reason}</span></td>
                <td className="p-4 text-slate-600 dark:text-slate-400 font-medium">{r.refundStatus}</td>
                <td className="p-4 text-slate-500">{r.manager}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 14. DAVOMAT HISOBOTLARI
export const AttendanceReportPage = () => {
  const [search, setSearch] = useState("");
  const attendanceData = [
    { student: "Anvar Hakimov", group: "IELTS Intensive #1", totalLessons: 12, attended: 12, excused: 0, unexcused: 0, rate: "100%", status: "A'lo" },
    { student: "Madina Qosimova", group: "General English B1", totalLessons: 12, attended: 11, excused: 1, unexcused: 0, rate: "91.6%", status: "Yaxshi" },
    { student: "Jahongir Olimov", group: "Python Dev #2", totalLessons: 12, attended: 9, excused: 1, unexcused: 2, rate: "75.0%", status: "Ogohlantirish" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">O'quvchilar Davomati va Qatnashish Hisoboti</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Umumiy Davomat" value="94.2%" change="+1.8%" changeType="up" icon={UserCheck} color="bg-emerald-600" />
        <StatCard title="Sababli Qoldirilgan" value="48 ta dars" change="Betoblik" changeType="up" icon={CheckCircle2} color="bg-blue-600" />
        <StatCard title="Sababsiz Qoldirilgan" value="18 ta dars" change="-4" changeType="down" icon={AlertTriangle} color="bg-amber-600" />
        <StatCard title="Xavf Ostidagi Talabalar" value="4 nafar" change="<75% davomat" changeType="down" icon={XCircle} color="bg-rose-600" />
      </div>

      <FilterBar search={search} setSearch={setSearch} placeholder="O'quvchi ismini qidirish..." />

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="p-4 font-semibold">O'quvchi F.I.Sh</th>
              <th className="p-4 font-semibold">Guruh Nomi</th>
              <th className="p-4 font-semibold">Jami Darslar</th>
              <th className="p-4 font-semibold">Kelgan</th>
              <th className="p-4 font-semibold">Sababli</th>
              <th className="p-4 font-semibold">Sababsiz</th>
              <th className="p-4 font-semibold">Davomat %</th>
              <th className="p-4 font-semibold">Holat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {attendanceData.map((a, i) => (
              <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                <td className="p-4 font-bold text-slate-900 dark:text-white">{a.student}</td>
                <td className="p-4 text-slate-500">{a.group}</td>
                <td className="p-4 font-medium">{a.totalLessons} dars</td>
                <td className="p-4 font-bold text-emerald-600">{a.attended}</td>
                <td className="p-4 font-semibold text-blue-600">{a.excused}</td>
                <td className="p-4 font-semibold text-rose-600">{a.unexcused}</td>
                <td className="p-4 font-bold text-indigo-600">{a.rate}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-lg font-semibold ${a.status === "Ogohlantirish" ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"}`}>
                    {a.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

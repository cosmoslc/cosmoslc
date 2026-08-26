import { useState, useMemo } from "react";
import {
  Coins,
  ShoppingBag,
  Wallet,
  Users,
  Trophy,
  Award,
  Sparkles,
  Gift,
  CheckCircle2,
  XCircle,
  Plus,
  Save,
  Clock,
  Zap,
  Calendar,
  BookOpen,
  DollarSign,
  Search,
  ChevronRight,
  X,
  Check,
} from "lucide-react";
import { INPUT_CLS, LABEL_CLS, PrimaryButton } from "../theme/tokens";
import { money } from "../utils/helpers";

export function CoinSystemPage({
  directorData,
  opData,
  onAddCoins,
  onUpdateSettings,
}) {
  const [tab, setTab] = useState("rules"); // 'rules' | 'top10' | 'redemption'
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [coinAmount, setCoinAmount] = useState(10);
  const [coinReason, setCoinReason] = useState("Darsda faol ishtirok uchun");
  const [showGiveModal, setShowGiveModal] = useState(false);

  // Redemption Form State
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [redeemStudentId, setRedeemStudentId] = useState("");
  const [redeemItem, setRedeemItem] = useState("50 000 so'm chegirma");
  const [redeemCoins, setRedeemCoins] = useState(50);

  // Existing settings or default fallback
  const settings = directorData?.coinSettings || {
    active: true,
    coinValue: 100,
    coinExpiryDays: 0,
    rules: {
      attendance_coins: 5,
      homework_coins: 10,
      test_80_90_coins: 15,
      test_90_plus_coins: 25,
      ontime_payment_coins: 30,
    },
  };

  // Editable rules form state
  const [formActive, setFormActive] = useState(settings.active ?? true);
  const [formCoinValue, setFormCoinValue] = useState(settings.coinValue || 100);
  const [formExpiryDays, setFormExpiryDays] = useState(settings.coinExpiryDays ?? 0);
  const [formRules, setFormRules] = useState({
    attendance_coins: settings.rules?.attendance_coins ?? 5,
    homework_coins: settings.rules?.homework_coins ?? 10,
    test_80_90_coins: settings.rules?.test_80_90_coins ?? 15,
    test_90_plus_coins: settings.rules?.test_90_plus_coins ?? 25,
    ontime_payment_coins: settings.rules?.ontime_payment_coins ?? 30,
  });

  const students = opData?.students || [];
  const transactions = opData?.coinTransactions || [];

  // ----------------------------------------------------
  // 1. TOP CARDS METRICS
  // ----------------------------------------------------
  const totalEarnedCoins = useMemo(() => {
    const earnTxSum = transactions
      .filter((t) => t.type === "earn" || (t.amount || 0) > 0)
      .reduce((s, t) => s + Math.abs(t.amount || 0), 0);

    const studentCoinsSum = students.reduce((s, st) => s + (st.coins || 0), 0);
    return Math.max(earnTxSum, studentCoinsSum + 120);
  }, [transactions, students]);

  const totalSpentCoins = useMemo(() => {
    const spendTxSum = transactions
      .filter((t) => t.type === "spend" || (t.amount || 0) < 0)
      .reduce((s, t) => s + Math.abs(t.amount || 0), 0);

    return spendTxSum || 140;
  }, [transactions]);

  const activeBalansCoins = useMemo(() => {
    return students.reduce((s, st) => s + (st.coins || 0), 0);
  }, [students]);

  const avgCoinsPerStudent = useMemo(() => {
    if (students.length === 0) return 0;
    return Math.round(activeBalansCoins / students.length);
  }, [activeBalansCoins, students]);

  // ----------------------------------------------------
  // 2. LEADERBOARD TOP 10
  // ----------------------------------------------------
  const leaderboardTop10 = useMemo(() => {
    return [...students]
      .sort((a, b) => (b.coins || 0) - (a.coins || 0))
      .slice(0, 10);
  }, [students]);

  // ----------------------------------------------------
  // 3. REDEMPTION TRANSACTIONS
  // ----------------------------------------------------
  const redemptionList = useMemo(() => {
    const spendTxs = transactions.filter(
      (t) => t.type === "spend" || t.type === "redemption" || (t.amount || 0) < 0
    );

    if (spendTxs.length > 0) return spendTxs;

    // Demonstration redemptions if empty
    return [
      {
        id: "red-1",
        studentName: "Jasur Rahimov",
        item: "50 000 so'm kurs chegirmasi",
        amount: 50,
        date: "2026-08-15",
        status: "Tasdiqlangan",
      },
      {
        id: "red-2",
        studentName: "Malika Aliyeva",
        item: "Cosmos Brend Futbolka",
        amount: 80,
        date: "2026-08-12",
        status: "Yetkazildi",
      },
      {
        id: "red-3",
        studentName: "Bobur Tursunov",
        item: "20 000 so'm kitob vautcheri",
        amount: 20,
        date: "2026-08-10",
        status: "Yetkazildi",
      },
    ];
  }, [transactions]);

  // Save Settings Handler
  function handleSaveSettings(e) {
    e.preventDefault();
    const updatedPayload = {
      active: formActive,
      coinValue: Number(formCoinValue) || 100,
      coinExpiryDays: Number(formExpiryDays) || 0,
      rules: {
        attendance_coins: Number(formRules.attendance_coins) || 0,
        homework_coins: Number(formRules.homework_coins) || 0,
        test_80_90_coins: Number(formRules.test_80_90_coins) || 0,
        test_90_plus_coins: Number(formRules.test_90_plus_coins) || 0,
        ontime_payment_coins: Number(formRules.ontime_payment_coins) || 0,
      },
    };

    if (onUpdateSettings) {
      onUpdateSettings(updatedPayload);
    }
  }

  // Handle Giving Coins
  function handleGiveCoinsSubmit(e) {
    e.preventDefault();
    if (!selectedStudent || coinAmount <= 0) return;
    if (onAddCoins) {
      onAddCoins(selectedStudent.id, Number(coinAmount), coinReason);
    }
    setShowGiveModal(false);
    setSelectedStudent(null);
  }

  // Handle Manual Redemption
  function handleRedeemSubmit(e) {
    e.preventDefault();
    if (!redeemStudentId || redeemCoins <= 0) return;
    const st = students.find((s) => s.id === redeemStudentId);
    if (!st) return;

    if (onAddCoins) {
      // Deduct coins with negative value
      onAddCoins(st.id, -Math.abs(Number(redeemCoins)), `Almashtirish: ${redeemItem}`);
    }
    setShowRedeemModal(false);
  }

  return (
    <div className="space-y-6 pb-16">
      {/* ---------------------------------------------------- */}
      {/* HEADER BAR */}
      {/* ---------------------------------------------------- */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-white flex items-center justify-center shadow-lg shadow-amber-500/25">
            <Coins size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Coin Gamification Tizimi
              </h1>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                  formActive
                    ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                    : "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                }`}
              >
                {formActive ? "Faol" : "O'chirilgan"}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              O'quvchilar rag'batlantirish, tangalar jamg'arish va sovg'alarga almashtirish boshqaruvi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 shadow-xs">
            <Coins size={16} className="text-amber-500" />
            <span>1 Coin = {money(formCoinValue)} so'm</span>
          </div>
          <PrimaryButton
            onClick={() => {
              setSelectedStudent(students[0] || null);
              setShowGiveModal(true);
            }}
            className="text-xs py-2.5"
          >
            <Plus size={15} /> Coin berish
          </PrimaryButton>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 4 TOP MAIN METRIC CARDS */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {/* 1. Jami topilgan coin */}
        <div className="stat-card border-amber-200/80 dark:border-amber-900/40 bg-gradient-to-b from-amber-50/30 to-white dark:from-amber-950/20 dark:to-slate-900 p-4 rounded-xl shadow-sm hover:-translate-y-1 transition-all cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <div className="icon-badge w-[34px] h-[34px] rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md">
              <Coins size={16} className="text-white" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
              Kirim
            </span>
          </div>
          <div className="stat-value text-[19px] font-extrabold tracking-tight text-amber-600 dark:text-amber-400 mb-0.5">
            +{totalEarnedCoins.toLocaleString()} <span className="text-xs font-medium text-slate-400">🪙</span>
          </div>
          <div className="stat-label text-xs font-bold text-slate-500 dark:text-slate-400">
            Jami Topilgan Coin
          </div>
        </div>

        {/* 2. Sarflangan coin */}
        <div className="stat-card border-rose-200/80 dark:border-rose-900/40 bg-gradient-to-b from-rose-50/30 to-white dark:from-rose-950/20 dark:to-slate-900 p-4 rounded-xl shadow-sm hover:-translate-y-1 transition-all cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <div className="icon-badge w-[34px] h-[34px] rounded-xl bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center shadow-md">
              <ShoppingBag size={16} className="text-white" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300">
              Chiqim
            </span>
          </div>
          <div className="stat-value text-[19px] font-extrabold tracking-tight text-rose-600 dark:text-rose-400 mb-0.5">
            -{totalSpentCoins.toLocaleString()} <span className="text-xs font-medium text-slate-400">🪙</span>
          </div>
          <div className="stat-label text-xs font-bold text-slate-500 dark:text-slate-400">
            Sarflangan Coin
          </div>
        </div>

        {/* 3. Faol balans coin */}
        <div className="stat-card border-indigo-200/80 dark:border-indigo-900/40 bg-gradient-to-b from-indigo-50/30 to-white dark:from-indigo-950/20 dark:to-slate-900 p-4 rounded-xl shadow-sm hover:-translate-y-1 transition-all cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <div className="icon-badge w-[34px] h-[34px] rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-md">
              <Wallet size={16} className="text-white" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
              Mavjud Balans
            </span>
          </div>
          <div className="stat-value text-[19px] font-extrabold tracking-tight text-slate-900 dark:text-white mb-0.5">
            {activeBalansCoins.toLocaleString()} <span className="text-xs font-medium text-slate-400">🪙</span>
          </div>
          <div className="stat-label text-xs font-bold text-slate-500 dark:text-slate-400">
            Faol Balans Coin
          </div>
        </div>

        {/* 4. O'rtacha balans coin */}
        <div className="stat-card border-emerald-200/80 dark:border-emerald-900/40 bg-gradient-to-b from-emerald-50/30 to-white dark:from-emerald-950/20 dark:to-slate-900 p-4 rounded-xl shadow-sm hover:-translate-y-1 transition-all cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <div className="icon-badge w-[34px] h-[34px] rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-md">
              <Users size={16} className="text-white" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
              O'rtacha
            </span>
          </div>
          <div className="stat-value text-[19px] font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400 mb-0.5">
            {avgCoinsPerStudent} <span className="text-xs font-medium text-slate-400">coin / o'quvchi</span>
          </div>
          <div className="stat-label text-xs font-bold text-slate-500 dark:text-slate-400">
            O'rtacha Balans
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* NAVIGATION TABS MENU */}
      {/* ---------------------------------------------------- */}
      <div className="flex border-b border-slate-200/80 space-x-2">
        <button
          onClick={() => setTab("rules")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black border-b-2 transition-all cursor-pointer ${
            tab === "rules"
              ? "border-indigo-600 text-indigo-600 bg-indigo-50/50 rounded-t-xl"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Sparkles size={15} /> Qoidalar & Sozlamalar
        </button>
        <button
          onClick={() => setTab("top10")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black border-b-2 transition-all cursor-pointer ${
            tab === "top10"
              ? "border-indigo-600 text-indigo-600 bg-indigo-50/50 rounded-t-xl"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Trophy size={15} /> Top 10 Reyting
        </button>
        <button
          onClick={() => setTab("redemption")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black border-b-2 transition-all cursor-pointer ${
            tab === "redemption"
              ? "border-indigo-600 text-indigo-600 bg-indigo-50/50 rounded-t-xl"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Gift size={15} /> Almashtirishlar & Tarix
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* TAB 1: QOIDALAR (RULES & QUEST SETTINGS) */}
      {/* ---------------------------------------------------- */}
      {tab === "rules" && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* QUESTS CONFIGURATION CARD */}
          <div className="bg-white rounded-xl border-[1.2px] border-slate-200 p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Zap size={18} className="text-amber-500" />
                  <span>Topsiriqlar va Harakatlar Uchin Coin Baza Qoidalari</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  O'quvchi har bir vazifani bajarganda avtomatik taqdirlanadigan tangalar miqdori
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Darsga vaqtida qatnashish */}
              <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
                  <Calendar size={15} className="text-indigo-600" />
                  <span>Darsga vaqtida qatnashish</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={formRules.attendance_coins}
                    onChange={(e) =>
                      setFormRules({ ...formRules, attendance_coins: e.target.value })
                    }
                    className={INPUT_CLS}
                  />
                  <span className="text-xs font-bold text-indigo-600 shrink-0">🪙 coin</span>
                </div>
              </div>

              {/* Uyga vazifani bajarish */}
              <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
                  <BookOpen size={15} className="text-blue-600" />
                  <span>Uyga vazifani mukammal bajarish</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={formRules.homework_coins}
                    onChange={(e) =>
                      setFormRules({ ...formRules, homework_coins: e.target.value })
                    }
                    className={INPUT_CLS}
                  />
                  <span className="text-xs font-bold text-indigo-600 shrink-0">🪙 coin</span>
                </div>
              </div>

              {/* Test natijasi 80-90% */}
              <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
                  <Award size={15} className="text-emerald-600" />
                  <span>Test natijasi (80% - 90% ball)</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={formRules.test_80_90_coins}
                    onChange={(e) =>
                      setFormRules({ ...formRules, test_80_90_coins: e.target.value })
                    }
                    className={INPUT_CLS}
                  />
                  <span className="text-xs font-bold text-indigo-600 shrink-0">🪙 coin</span>
                </div>
              </div>

              {/* Test natijasi 90%+ */}
              <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
                  <Trophy size={15} className="text-amber-500" />
                  <span>Test natijasi (90% dan yuqori ball)</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={formRules.test_90_plus_coins}
                    onChange={(e) =>
                      setFormRules({ ...formRules, test_90_plus_coins: e.target.value })
                    }
                    className={INPUT_CLS}
                  />
                  <span className="text-xs font-bold text-indigo-600 shrink-0">🪙 coin</span>
                </div>
              </div>

              {/* Muddatida to'lov qilish */}
              <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
                  <DollarSign size={15} className="text-purple-600" />
                  <span>Muddatida o'quv to'lovini amalga oshirish</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={formRules.ontime_payment_coins}
                    onChange={(e) =>
                      setFormRules({ ...formRules, ontime_payment_coins: e.target.value })
                    }
                    className={INPUT_CLS}
                  />
                  <span className="text-xs font-bold text-indigo-600 shrink-0">🪙 coin</span>
                </div>
              </div>
            </div>
          </div>

          {/* SYSTEM SETTINGS CARD */}
          <div className="bg-white rounded-xl border-[1.2px] border-slate-200 p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Clock size={18} className="text-indigo-600" />
                <span>Coin Qiymati, Eskirish Muddati va Tizim Holati</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Valyuta ekvivalenti, amal qilish muddati hamda tizim faolligini sozlash
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              {/* 1 Coin qiymati */}
              <div className="space-y-1.5">
                <label className={LABEL_CLS}>1 Coin Necha So'mga Teng (Valyuta Qiymati) *</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={formCoinValue}
                    onChange={(e) => setFormCoinValue(e.target.value)}
                    className={INPUT_CLS}
                    placeholder="100"
                  />
                  <span className="font-extrabold text-slate-700 shrink-0">so'm</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Masalan: 1 coin = 100 so'm. O'quvchi 50 coinni 5,000 so'm chegirmaga ishlatadi.
                </p>
              </div>

              {/* Coin eskirishi */}
              <div className="space-y-1.5">
                <label className={LABEL_CLS}>Coin Eskirishi (Amal Qilish Muddati, Kunlarda) *</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={formExpiryDays}
                    onChange={(e) => setFormExpiryDays(e.target.value)}
                    className={INPUT_CLS}
                    placeholder="0"
                  />
                  <span className="font-extrabold text-slate-700 shrink-0">kun</span>
                </div>
                <p className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-xl border border-amber-200/60 inline-block">
                  💡 0 kiritilsa coinlar eskirmaydi va doimiy saqlanadi.
                </p>
              </div>

              {/* Tizim Holati Toggle */}
              <div className="space-y-1.5">
                <label className={LABEL_CLS}>Coin Tizimi Holati *</label>
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setFormActive(!formActive)}
                    className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      formActive ? "bg-emerald-500" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        formActive ? "translate-x-7" : "translate-x-0"
                      }`}
                    />
                  </button>
                  <span className="font-black text-slate-800 text-sm">
                    {formActive ? "🟢 Faol Yoqilgan" : "🔴 O'chirilgan"}
                  </span>
                </div>
              </div>
            </div>

            {/* Save Button Bar */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <PrimaryButton type="submit" className="text-xs px-6 py-2.5">
                <Save size={16} /> Sozlamalarni Saqlash
              </PrimaryButton>
            </div>
          </div>
        </form>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 2: TOP 10 (LEADERBOARD) */}
      {/* ---------------------------------------------------- */}
      {tab === "top10" && (
        <div className="bg-white rounded-xl border-[1.2px] border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Trophy size={18} className="text-amber-500" />
                <span>Eng Ko'p Coin To'plagan Top 10 O'quvchilar</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Markaz bo'yicha eng faol va ko'p tangaga ega bo'lgan o'quvchilar reytingi
              </p>
            </div>

            <PrimaryButton
              onClick={() => {
                setSelectedStudent(leaderboardTop10[0] || null);
                setShowGiveModal(true);
              }}
              className="text-xs py-1.5"
            >
              <Plus size={14} /> Rag'batlantirish (Bonus Coin)
            </PrimaryButton>
          </div>

          <div className="space-y-3">
            {leaderboardTop10.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-medium">
                Hali o'quvchilar ma'lumotlari mavjud emas.
              </div>
            ) : (
              leaderboardTop10.map((st, index) => {
                const rank = index + 1;
                let badgeStyle = "bg-slate-100 text-slate-700";
                let rankLabel = `#${rank}`;

                if (rank === 1) {
                  badgeStyle =
                    "bg-gradient-to-r from-amber-400 to-yellow-500 text-white font-black shadow-md border border-amber-300";
                  rankLabel = "🥇 1-O'rin";
                } else if (rank === 2) {
                  badgeStyle =
                    "bg-gradient-to-r from-slate-300 to-slate-400 text-white font-black shadow-md border border-slate-200";
                  rankLabel = "🥈 2-O'rin";
                } else if (rank === 3) {
                  badgeStyle =
                    "bg-gradient-to-r from-amber-700 to-amber-800 text-white font-black shadow-md border border-amber-600";
                  rankLabel = "🥉 3-O'rin";
                }

                return (
                  <div
                    key={st.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:bg-slate-100/80 transition-all"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className={`px-3 py-1 rounded-xl text-xs font-extrabold shrink-0 ${badgeStyle}`}>
                        {rankLabel}
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-extrabold flex items-center justify-center text-sm shadow-xs shrink-0">
                        {st.name ? st.name[0].toUpperCase() : "O'"}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-slate-900 text-sm truncate">{st.name}</h4>
                        <p className="text-xs text-slate-500 truncate">
                          {st.phone || "Telefon kiritilmagan"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <span className="text-base font-black text-amber-600 block">
                          {st.coins || 0} 🪙
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">
                          ~{money((st.coins || 0) * formCoinValue)} so'm qiymat
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedStudent(st);
                          setShowGiveModal(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-extrabold transition-all cursor-pointer"
                      >
                        + Coin berish
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 3: REDEMPTION (ALMASHTIRISHLAR VA TARIX) */}
      {/* ---------------------------------------------------- */}
      {tab === "redemption" && (
        <div className="bg-white rounded-xl border-[1.2px] border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Gift size={18} className="text-rose-500" />
                <span>Coin Almashtirishlar va Sovg'alar Tarixi</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                O'quvchilar tomonidan tangalarga sotib olingan chegirmalar va sovg'alar
              </p>
            </div>

            <PrimaryButton
              onClick={() => setShowRedeemModal(true)}
              className="text-xs py-1.5"
            >
              <Plus size={14} /> Almashtirish Kiritish
            </PrimaryButton>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                  <th className="py-3 px-3">O'quvchi</th>
                  <th className="py-3 px-3">Almashtirilgan Mukofot / Chegirma</th>
                  <th className="py-3 px-3">Sarflangan Coin</th>
                  <th className="py-3 px-3">Sana</th>
                  <th className="py-3 px-3 text-right">Maqom</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {redemptionList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-extrabold text-slate-900 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs shrink-0">
                        {item.studentName ? item.studentName[0].toUpperCase() : "O'"}
                      </div>
                      <span>{item.studentName || item.student_name || "O'quvchi"}</span>
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-700">
                      {item.item || item.reason || "Chegirma almashtirildi"}
                    </td>
                    <td className="py-3 px-3 font-black text-rose-600">
                      -{Math.abs(item.amount)} 🪙
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-medium">
                      {item.date || "2026-08-15"}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300/60">
                        {item.status || "Tasdiqlandi"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: COIN BERISH (MANUAL BONUS AWARD) */}
      {/* ---------------------------------------------------- */}
      {showGiveModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Coins className="text-amber-500" size={18} />
                <span>O'quvchiga Coin Berish</span>
              </h3>
              <button
                onClick={() => setShowGiveModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleGiveCoinsSubmit} className="space-y-4 text-xs">
              <div>
                <label className={LABEL_CLS}>O'quvchini Tanlang *</label>
                <select
                  value={selectedStudent?.id || ""}
                  onChange={(e) =>
                    setSelectedStudent(students.find((s) => s.id === e.target.value) || null)
                  }
                  className={INPUT_CLS}
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.coins || 0} coin)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={LABEL_CLS}>Coin Miqdori (🪙) *</label>
                <input
                  type="number"
                  value={coinAmount}
                  onChange={(e) => setCoinAmount(e.target.value)}
                  className={INPUT_CLS}
                  placeholder="10"
                />
              </div>

              <div>
                <label className={LABEL_CLS}>Sabab / Izoh *</label>
                <input
                  type="text"
                  value={coinReason}
                  onChange={(e) => setCoinReason(e.target.value)}
                  className={INPUT_CLS}
                  placeholder="Masalan: Uyga vazifani 100% bajarganligi uchun"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGiveModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-all"
                >
                  Bekor qilish
                </button>
                <PrimaryButton type="submit">
                  <Check size={16} /> Tasdiqlash & Berish
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: MANUAL REDEMPTION RECORDING */}
      {/* ---------------------------------------------------- */}
      {showRedeemModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Gift className="text-rose-500" size={18} />
                <span>Coin Almashtirish Kiritish</span>
              </h3>
              <button
                onClick={() => setShowRedeemModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleRedeemSubmit} className="space-y-4 text-xs">
              <div>
                <label className={LABEL_CLS}>O'quvchi *</label>
                <select
                  value={redeemStudentId}
                  onChange={(e) => setRedeemStudentId(e.target.value)}
                  className={INPUT_CLS}
                >
                  <option value="">O'quvchini tanlang...</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.coins || 0} coin mavjud)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={LABEL_CLS}>Almashtiriladigan Mukofot / Chegirma *</label>
                <input
                  type="text"
                  value={redeemItem}
                  onChange={(e) => setRedeemItem(e.target.value)}
                  className={INPUT_CLS}
                  placeholder="Masalan: 50 000 so'm to'lov chegirmasi"
                />
              </div>

              <div>
                <label className={LABEL_CLS}>Sarflanadigan Coin Miqdori *</label>
                <input
                  type="number"
                  value={redeemCoins}
                  onChange={(e) => setRedeemCoins(e.target.value)}
                  className={INPUT_CLS}
                  placeholder="50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRedeemModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-all"
                >
                  Bekor qilish
                </button>
                <PrimaryButton type="submit">
                  <Check size={16} /> Almashtirishni Saqlash
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
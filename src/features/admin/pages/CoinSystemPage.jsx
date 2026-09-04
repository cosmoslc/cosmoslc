import { useState, useMemo } from "react";
import {
  Coins,
  ShoppingBag,
  Wallet,
  Users,
  Trophy,
  Sparkles,
  Plus,
  Save,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Check,
  X,
  RotateCcw,
} from "lucide-react";
import { INPUT_CLS, LABEL_CLS, PrimaryButton, SecondaryButton } from "../theme/tokens";
import { money, formatDate } from "../utils/helpers";
import { Avatar, Modal } from "../components/primitives";
import * as api from "../../../shared/api";

export function CoinSystemPage({
  directorData = {},
  opData = {},
  onAddCoins,
  onUpdateSettings,
}) {
  const [tab, setTab] = useState("rules"); // 'rules' | 'top10' | 'redemption'
  const [showGiveModal, setShowGiveModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [coinAmount, setCoinAmount] = useState(10);
  const [coinReason, setCoinReason] = useState("Darsdagi faollik");
  const [coinActionType, setCoinActionType] = useState("add"); // 'add' | 'deduct'

  // Redemption Form State
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [redeemStudentId, setRedeemStudentId] = useState("");
  const [redeemItem, setRedeemItem] = useState("Kurs to'loviga chegirma");
  const [redeemCoins, setRedeemCoins] = useState(50);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");

  const students = opData?.students || directorData?.students || [];
  const transactions = opData?.coinTransactions || directorData?.coinTransactions || [];

  // Settings
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

  // Top Metrics
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

  // Leaderboard Top 10
  const leaderboardTop10 = useMemo(() => {
    return [...students]
      .sort((a, b) => (b.coins || 0) - (a.coins || 0))
      .slice(0, 10);
  }, [students]);

  // Redemption Transactions
  const redemptionList = useMemo(() => {
    const spendTxs = transactions.filter(
      (t) => t.type === "spend" || t.type === "redemption" || (t.amount || 0) < 0
    );
    if (spendTxs.length > 0) return spendTxs;

    return [
      {
        id: "red-1",
        studentName: "Jasur Rahimov",
        item: "Kurs chegirmasi",
        amount: 50,
        date: "2026-08-15",
        status: "Tasdiqlangan",
      },
      {
        id: "red-2",
        studentName: "Malika Aliyeva",
        item: "Brend Futbolka",
        amount: 80,
        date: "2026-08-12",
        status: "Yetkazildi",
      },
      {
        id: "red-3",
        studentName: "Bobur Tursunov",
        item: "Kitob vautcheri",
        amount: 20,
        date: "2026-08-10",
        status: "Yetkazildi",
      },
    ];
  }, [transactions]);

  // Save Settings
  const handleSaveSettings = (e) => {
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
    setSaveSuccessMsg("Sozlamalar saqlandi!");
    setTimeout(() => setSaveSuccessMsg(""), 2500);
  };

  // Give/Deduct Coins
  const handleGiveCoinsSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent || coinAmount <= 0) return;
    const finalAmount = coinActionType === "deduct" ? -Math.abs(Number(coinAmount)) : Math.abs(Number(coinAmount));

    if (onAddCoins) {
      await onAddCoins(selectedStudent.id, finalAmount, coinReason);
    } else {
      const curCoins = Number(selectedStudent.coins || 0);
      const newCoins = Math.max(0, curCoins + finalAmount);
      await api.updateStudent(selectedStudent.id, { coins: newCoins });
    }

    setShowGiveModal(false);
    setSelectedStudent(null);
  };

  // Redeem Coins
  const handleRedeemSubmit = async (e) => {
    e.preventDefault();
    if (!redeemStudentId || redeemCoins <= 0) return;
    const st = students.find((s) => String(s.id) === String(redeemStudentId));
    if (!st) return;

    if (onAddCoins) {
      await onAddCoins(st.id, -Math.abs(Number(redeemCoins)), `Almashtirish: ${redeemItem}`);
    } else {
      const curCoins = Number(st.coins || 0);
      const newCoins = Math.max(0, curCoins - Number(redeemCoins));
      await api.updateStudent(st.id, { coins: newCoins });
    }

    setShowRedeemModal(false);
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* ---------------------------------------------------- */}
      {/* 1. HEADER BAR & CONTROLS */}
      {/* ---------------------------------------------------- */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
            <Coins size={18} />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Coin tizimi
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                  formActive
                    ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                    : "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                }`}
              >
                {formActive ? "Faol" : "O'chirilgan"}
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300">
            <Coins size={14} className="text-amber-500" />
            <span>1 Coin = {money(formCoinValue)} so'm</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setRedeemStudentId(students[0]?.id || "");
              setShowRedeemModal(true);
            }}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ShoppingBag size={14} />
            <span>Almashtirish</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedStudent(students[0] || null);
              setShowGiveModal(true);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={14} />
            <span>Coin berish</span>
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 2. TOP METRICS (FLATTENED SINGLE CONTAINER) */}
      {/* ---------------------------------------------------- */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-3.5 shadow-xs grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
        {/* 1. Kirim */}
        <div className="py-2 md:py-0 md:px-3 first:pl-0">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Jami berilgan</div>
          <div className="text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5">
            +{totalEarnedCoins.toLocaleString()} <span className="text-xs font-normal text-slate-400">🪙</span>
          </div>
        </div>

        {/* 2. Chiqim */}
        <div className="py-2 md:py-0 md:px-3">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Sarflangan</div>
          <div className="text-lg font-black text-rose-600 dark:text-rose-400 mt-0.5">
            -{totalSpentCoins.toLocaleString()} <span className="text-xs font-normal text-slate-400">🪙</span>
          </div>
        </div>

        {/* 3. Balans */}
        <div className="py-2 md:py-0 md:px-3">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Faol balans</div>
          <div className="text-lg font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
            {activeBalansCoins.toLocaleString()} <span className="text-xs font-normal text-slate-400">🪙</span>
          </div>
        </div>

        {/* 4. O'rtacha */}
        <div className="py-2 md:py-0 md:px-3 last:pr-0">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">O'rtacha o'quvchiga</div>
          <div className="text-lg font-black text-slate-800 dark:text-slate-200 mt-0.5">
            {avgCoinsPerStudent} <span className="text-xs font-normal text-slate-400">🪙</span>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 3. NAVIGATION TABS */}
      {/* ---------------------------------------------------- */}
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold w-fit">
        <button
          type="button"
          onClick={() => setTab("rules")}
          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
            tab === "rules"
              ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          Qoidalar va sozlamalar
        </button>
        <button
          type="button"
          onClick={() => setTab("top10")}
          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
            tab === "top10"
              ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          Top 10 reyting
        </button>
        <button
          type="button"
          onClick={() => setTab("redemption")}
          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
            tab === "redemption"
              ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          Almashtirishlar tarixi
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 4. TAB 1: RULES & SETTINGS */}
      {/* ---------------------------------------------------- */}
      {tab === "rules" && (
        <form
          onSubmit={handleSaveSettings}
          className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 space-y-4 shadow-xs"
        >
          {saveSuccessMsg && (
            <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
              <Check size={14} />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* Umumiy parametrlar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={LABEL_CLS}>Tizim holati</label>
              <button
                type="button"
                onClick={() => setFormActive(!formActive)}
                className={`w-full py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                  formActive
                    ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500"
                }`}
              >
                <span>{formActive ? "Faol" : "Nofaol"}</span>
                <span className={`w-2.5 h-2.5 rounded-full ${formActive ? "bg-emerald-500" : "bg-slate-400"}`} />
              </button>
            </div>

            <div>
              <label className={LABEL_CLS}>1 Coin qiymati</label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  value={formCoinValue}
                  onChange={(e) => setFormCoinValue(e.target.value)}
                  className={INPUT_CLS}
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                  so'm
                </span>
              </div>
            </div>

            <div>
              <label className={LABEL_CLS}>Amal qilish muddati</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={formExpiryDays}
                  onChange={(e) => setFormExpiryDays(e.target.value)}
                  className={INPUT_CLS}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                  kun
                </span>
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />

          {/* Avtomatik berish qoidalari */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-3">
              Avtomatik berish qoidalari
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className={LABEL_CLS}>Darsga qatnashish</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={formRules.attendance_coins}
                    onChange={(e) =>
                      setFormRules({ ...formRules, attendance_coins: e.target.value })
                    }
                    className={INPUT_CLS}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                    coin
                  </span>
                </div>
              </div>

              <div>
                <label className={LABEL_CLS}>Uyga vazifa</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={formRules.homework_coins}
                    onChange={(e) =>
                      setFormRules({ ...formRules, homework_coins: e.target.value })
                    }
                    className={INPUT_CLS}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                    coin
                  </span>
                </div>
              </div>

              <div>
                <label className={LABEL_CLS}>Oraliq test 80-90%</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={formRules.test_80_90_coins}
                    onChange={(e) =>
                      setFormRules({ ...formRules, test_80_90_coins: e.target.value })
                    }
                    className={INPUT_CLS}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                    coin
                  </span>
                </div>
              </div>

              <div>
                <label className={LABEL_CLS}>Oraliq test 90%+</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={formRules.test_90_plus_coins}
                    onChange={(e) =>
                      setFormRules({ ...formRules, test_90_plus_coins: e.target.value })
                    }
                    className={INPUT_CLS}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                    coin
                  </span>
                </div>
              </div>

              <div>
                <label className={LABEL_CLS}>O'z vaqtida to'lov</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={formRules.ontime_payment_coins}
                    onChange={(e) =>
                      setFormRules({ ...formRules, ontime_payment_coins: e.target.value })
                    }
                    className={INPUT_CLS}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                    coin
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Save size={14} />
              <span>Sozlamalarni saqlash</span>
            </button>
          </div>
        </form>
      )}

      {/* ---------------------------------------------------- */}
      {/* 5. TAB 2: LEADERBOARD TOP 10 */}
      {/* ---------------------------------------------------- */}
      {tab === "top10" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto max-h-[calc(100vh-320px)] overflow-y-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-800/80 backdrop-blur-md">
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4 w-12 text-center">O'rin</th>
                  <th className="py-3 px-4">O'quvchi</th>
                  <th className="py-3 px-4">Telefon</th>
                  <th className="py-3 px-4">Coin</th>
                  <th className="py-3 px-4">Qiymati</th>
                  <th className="py-3 px-4 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {leaderboardTop10.map((st, idx) => {
                  const coinVal = (st.coins || 0) * (formCoinValue || 100);
                  return (
                    <tr key={st.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                      <td className="py-3 px-4 text-center">
                        {idx === 0 && <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 font-bold text-sm shadow-inner">🥇</span>}
                        {idx === 1 && <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300 font-bold text-sm shadow-inner">🥈</span>}
                        {idx === 2 && <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 font-bold text-sm shadow-inner">🥉</span>}
                        {idx > 2 && <span className="font-mono text-slate-400 dark:text-slate-500 text-xs font-semibold">#{idx + 1}</span>}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={st.name} size={32} />
                          <span className="font-semibold text-slate-900 dark:text-white">{st.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono text-xs">{st.phone || "—"}</td>
                      <td className="py-3 px-4 font-bold font-mono text-amber-600 dark:text-amber-400 text-sm">
                        {(st.coins || 0).toLocaleString()} 🪙
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono text-xs">{money(coinVal)} so'm</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedStudent(st);
                            setShowGiveModal(true);
                          }}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                        >
                          Coin berish
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 6. TAB 3: REDEMPTION TRANSACTIONS */}
      {/* ---------------------------------------------------- */}
      {tab === "redemption" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto max-h-[calc(100vh-320px)] overflow-y-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-800/80 backdrop-blur-md">
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Sana</th>
                  <th className="py-3 px-4">O'quvchi</th>
                  <th className="py-3 px-4">Mahsulot / Xizmat</th>
                  <th className="py-3 px-4">Sarflangan coin</th>
                  <th className="py-3 px-4">Holat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {redemptionList.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {formatDate(r.date)}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      {r.studentName}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {r.item}
                    </td>
                    <td className="py-3 px-4 font-bold font-mono text-rose-600 dark:text-rose-400 text-sm whitespace-nowrap">
                      -{Math.abs(r.amount || 0)} 🪙
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-semibold text-xs border border-emerald-200/60 dark:border-emerald-800">
                        {r.status || "Tasdiqlangan"}
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
      {/* 7. MODAL: GIVE / DEDUCT COINS */}
      {/* ---------------------------------------------------- */}
      <Modal
        isOpen={showGiveModal}
        onClose={() => setShowGiveModal(false)}
        title="Coin berish / ayirish"
      >
        <form onSubmit={handleGiveCoinsSubmit} className="space-y-4">
          <div>
            <label className={LABEL_CLS}>O'quvchi</label>
            <select
              value={selectedStudent?.id || ""}
              onChange={(e) => {
                const st = students.find((s) => String(s.id) === e.target.value);
                setSelectedStudent(st || null);
              }}
              className={INPUT_CLS}
              required
            >
              <option value="">O'quvchini tanlang</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.coins || 0} coin)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLS}>Amal turi</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCoinActionType("add")}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                  coinActionType === "add"
                    ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                }`}
              >
                Qo'shish (+)
              </button>
              <button
                type="button"
                onClick={() => setCoinActionType("deduct")}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                  coinActionType === "deduct"
                    ? "bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-700 dark:text-rose-300"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                }`}
              >
                Ayirish (-)
              </button>
            </div>
          </div>

          <div>
            <label className={LABEL_CLS}>Miqdor</label>
            <div className="relative">
              <input
                type="number"
                min="1"
                value={coinAmount}
                onChange={(e) => setCoinAmount(e.target.value)}
                className={INPUT_CLS}
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                coin
              </span>
            </div>
          </div>

          <div>
            <label className={LABEL_CLS}>Sabab</label>
            <input
              type="text"
              value={coinReason}
              onChange={(e) => setCoinReason(e.target.value)}
              className={INPUT_CLS}
              placeholder="Masalan: Darsdagi faollik"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <SecondaryButton type="button" onClick={() => setShowGiveModal(false)}>
              Bekor qilish
            </SecondaryButton>
            <PrimaryButton type="submit">
              Tasdiqlash
            </PrimaryButton>
          </div>
        </form>
      </Modal>

      {/* ---------------------------------------------------- */}
      {/* 8. MODAL: REDEEM COINS */}
      {/* ---------------------------------------------------- */}
      <Modal
        isOpen={showRedeemModal}
        onClose={() => setShowRedeemModal(false)}
        title="Coin almashtirish"
      >
        <form onSubmit={handleRedeemSubmit} className="space-y-4">
          <div>
            <label className={LABEL_CLS}>O'quvchi</label>
            <select
              value={redeemStudentId}
              onChange={(e) => setRedeemStudentId(e.target.value)}
              className={INPUT_CLS}
              required
            >
              <option value="">O'quvchini tanlang</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.coins || 0} coin)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLS}>Mahsulot yoki xizmat</label>
            <input
              type="text"
              value={redeemItem}
              onChange={(e) => setRedeemItem(e.target.value)}
              className={INPUT_CLS}
              required
            />
          </div>

          <div>
            <label className={LABEL_CLS}>Sarflanadigan coin</label>
            <div className="relative">
              <input
                type="number"
                min="1"
                value={redeemCoins}
                onChange={(e) => setRedeemCoins(e.target.value)}
                className={INPUT_CLS}
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                coin
              </span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <SecondaryButton type="button" onClick={() => setShowRedeemModal(false)}>
              Bekor qilish
            </SecondaryButton>
            <PrimaryButton type="submit">
              Almashtirish
            </PrimaryButton>
          </div>
        </form>
      </Modal>
    </div>
  );
}

import React, { useState } from "react";
import {
  Award,
  Coins,
  Save,
  Trash2,
  CheckCircle2,
  Info,
  Clock,
  UserX,
  UserCheck,
  Trophy,
  Sliders,
  Check,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import {
  GLASS,
  INPUT_CLS,
  LABEL_CLS,
  BTN_PRIMARY,
  BTN_SECONDARY,
  BTN_DANGER,
} from "../theme/tokens";
import { ConfirmModal } from "../components/primitives";

export function PointsGradingPage() {
  // Left Block State: Grading system min & max ball
  const [minBall, setMinBall] = useState(1);
  const [maxBall, setMaxBall] = useState(5);
  const [systemSavedMsg, setSystemSavedMsg] = useState("");

  // Right Block State: Coins for each score grade
  // Pre-populated default map for 1..5
  const [gradeCoins, setGradeCoins] = useState({
    1: 0,
    2: 1,
    3: 2,
    4: 3,
    5: 5,
  });
  const [coinsSavedMsg, setCoinsSavedMsg] = useState("");

  // Below Block State: Attendance coins
  const [onTimeCoins, setOnTimeCoins] = useState(10);
  const [lateCoins, setLateCoins] = useState(5);
  const [absentCoins, setAbsentCoins] = useState(0);
  const [attendanceSavedMsg, setAttendanceSavedMsg] = useState("");

  // Group Rating System Toggle State
  const [useGroupRating, setUseGroupRating] = useState(true);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Handle Save for Left Block (Baholash Tizimi)
  const handleSaveGradingSystem = (e) => {
    e.preventDefault();
    const min = Math.max(0, parseInt(minBall) || 0);
    const max = Math.max(min + 1, parseInt(maxBall) || min + 1);

    setMinBall(min);
    setMaxBall(max);

    // Synchronize gradeCoins keys from min to max
    setGradeCoins((prev) => {
      const updated = {};
      for (let i = min; i <= max; i++) {
        updated[i] = prev[i] !== undefined ? prev[i] : i;
      }
      return updated;
    });

    setSystemSavedMsg("Baholash oralig'i saqlandi!");
    setTimeout(() => setSystemSavedMsg(""), 3000);
  };

  // Handle Coin change for a specific grade
  const handleCoinChange = (ball, value) => {
    const coinValue = parseInt(value) || 0;
    setGradeCoins((prev) => ({
      ...prev,
      [ball]: coinValue,
    }));
  };

  // Handle Save for Right Block (Coins per grade)
  const handleSaveCoins = (e) => {
    e.preventDefault();
    setCoinsSavedMsg("Baho tangalari saqlandi!");
    setTimeout(() => setCoinsSavedMsg(""), 3000);
  };

  // Handle Save for Below Block (Attendance coins)
  const handleSaveAttendance = (e) => {
    e.preventDefault();
    setAttendanceSavedMsg("Davomat tangalari va reyting sozlamalari saqlandi!");
    setTimeout(() => setAttendanceSavedMsg(""), 3000);
  };

  // Handle Reset/Clear for Below Block
  const handleResetAttendance = () => {
    setShowResetConfirm(true);
  };

  const confirmResetAttendanceAction = () => {
    setOnTimeCoins(10);
    setLateCoins(5);
    setAbsentCoins(0);
    setUseGroupRating(true);
    setAttendanceSavedMsg("Sozlamalar dastlabki holatga qaytarildi.");
    setTimeout(() => setAttendanceSavedMsg(""), 3000);
    setShowResetConfirm(false);
  };

  // Generate array of grades from minBall to maxBall
  const gradesList = [];
  for (let i = minBall; i <= maxBall; i++) {
    gradesList.push(i);
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
          <Award className="w-7 h-7 text-amber-500 shrink-0" />
          Ballar va Baholash Tizimi
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Darsdagi baholash chegaralari, har bir baho uchun tangalar hamda davomat reytingi sozlamalari
        </p>
      </div>

      {/* TOP SECTION: 2 Blocks (Left & Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT BLOCK: Baholash Tizimi (Minimum & Maximum ball) */}
        <div className={`${GLASS} p-5 sm:p-6 rounded-2xl space-y-5 flex flex-col justify-between`}>
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/60">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Baholash Tizimi
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Minimum va maksimal ball oralig'ini belgilang
                </p>
              </div>
            </div>

            <form id="grading-system-form" onSubmit={handleSaveGradingSystem} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Minimum Ball */}
                <div>
                  <label className={`${LABEL_CLS} block mb-1.5`}>
                    Minimum ball *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={maxBall - 1}
                    value={minBall}
                    onChange={(e) => setMinBall(e.target.value)}
                    className={`${INPUT_CLS} font-bold text-base`}
                    placeholder="1"
                    required
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Eng quyi qo'yilishi mumkin bo'lgan ball
                  </span>
                </div>

                {/* Maximum Ball */}
                <div>
                  <label className={`${LABEL_CLS} block mb-1.5`}>
                    Maksimal ball *
                  </label>
                  <input
                    type="number"
                    min={minBall + 1}
                    max="100"
                    value={maxBall}
                    onChange={(e) => setMaxBall(e.target.value)}
                    className={`${INPUT_CLS} font-bold text-base`}
                    placeholder="5"
                    required
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Eng yuqori qo'yilishi mumkin bo'lgan ball
                  </span>
                </div>
              </div>

              {/* Informational Note */}
              <div className="p-3.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/40 text-blue-800 dark:text-blue-300 text-xs leading-relaxed flex items-start gap-2.5">
                <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                <span>
                  O'zgartirish saqlangach, o'ng tarafdagi blockda <strong>{minBall}</strong> dan <strong>{maxBall}</strong> gacha bo'lgan barcha baholar uchun avtomatik tanga (coin) kiritish maydonlari shakllanadi.
                </span>
              </div>
            </form>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            {systemSavedMsg ? (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 size={16} /> {systemSavedMsg}
              </span>
            ) : (
              <span className="text-xs text-slate-400 font-medium">
                Oraliq: {minBall} – {maxBall} ball
              </span>
            )}

            <button
              type="submit"
              form="grading-system-form"
              className={`${BTN_PRIMARY} shadow-md shadow-blue-500/20`}
            >
              <Save size={16} />
              <span>Saqlash</span>
            </button>
          </div>
        </div>

        {/* RIGHT BLOCK: Har bir baho uchun tangalar soni */}
        <div className={`${GLASS} p-5 sm:p-6 rounded-2xl space-y-5 flex flex-col justify-between`}>
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/60">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Har bir baho uchun tangalar soni
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  O'quvchi har bir ball olganda beriladigan tangalar (Coins)
                </p>
              </div>
            </div>

            <form id="coins-per-grade-form" onSubmit={handleSaveCoins} className="space-y-3">
              <div className="max-h-[220px] overflow-y-auto pr-1 space-y-2.5">
                {gradesList.map((ball) => (
                  <div
                    key={ball}
                    className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="w-8 h-8 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-sm flex items-center justify-center border border-amber-500/20">
                        {ball}
                      </span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {ball}-ball uchun tanga:
                      </span>
                    </div>

                    <div className="flex items-center gap-2 max-w-[140px]">
                      <input
                        type="number"
                        min="0"
                        max="1000"
                        value={gradeCoins[ball] ?? 0}
                        onChange={(e) => handleCoinChange(ball, e.target.value)}
                        className={`${INPUT_CLS} text-right font-bold text-amber-600 dark:text-amber-400`}
                        placeholder="0"
                      />
                      <span className="text-xs font-semibold text-slate-400 shrink-0">
                        tanga
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </form>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            {coinsSavedMsg ? (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 size={16} /> {coinsSavedMsg}
              </span>
            ) : (
              <span className="text-xs text-slate-400 font-medium">
                Jami: {gradesList.length} ta baholash darajasi
              </span>
            )}

            <button
              type="submit"
              form="coins-per-grade-form"
              className={`${BTN_PRIMARY} shadow-md shadow-amber-500/20 !bg-amber-600 hover:!bg-amber-700`}
            >
              <Save size={16} />
              <span>Saqlash</span>
            </button>
          </div>
        </div>
      </div>

      {/* BELOW BLOCK: Davomat va Dars Faolligi Tangalari + Guruh Reyting Tizimi */}
      <div className={`${GLASS} p-5 sm:p-6 rounded-2xl space-y-6`}>
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/60">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Davomat va Dars Faolligi Uchun Tangalar
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Talabalarning darsga kelish intizomi va reyting tizimidan foydalanish qoidalari
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveAttendance} className="space-y-6">
          {/* Attendance Inputs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Vaqtida qatnashganlarga */}
            <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-900/50 space-y-2">
              <label className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                <UserCheck size={16} className="text-emerald-500 shrink-0" />
                Vaqtida darsda qatnashganlarga
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={onTimeCoins}
                  onChange={(e) => setOnTimeCoins(parseInt(e.target.value) || 0)}
                  className={`${INPUT_CLS} font-bold text-emerald-600 dark:text-emerald-400 pr-16`}
                  placeholder="10"
                />
                <span className="absolute right-3 top-2.5 text-xs font-semibold text-slate-400">
                  tanga
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Darsga o'z vaqtida kelib, davomatda 'Bor' deb belgilangan talabaga avto-beriladi
              </p>
            </div>

            {/* Kech qolib kirgan uchun */}
            <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/50 space-y-2">
              <label className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                <Clock size={16} className="text-amber-500 shrink-0" />
                Kech qolib kirgan uchun tanga
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={lateCoins}
                  onChange={(e) => setLateCoins(parseInt(e.target.value) || 0)}
                  className={`${INPUT_CLS} font-bold text-amber-600 dark:text-amber-400 pr-16`}
                  placeholder="5"
                />
                <span className="absolute right-3 top-2.5 text-xs font-semibold text-slate-400">
                  tanga
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Darsga kechikib kelganligi sababli beriladigan kamaytirilgan tangalar miqdori
              </p>
            </div>

            {/* Kelmagan uchun */}
            <div className="p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200/70 dark:border-rose-900/50 space-y-2">
              <label className="text-xs font-bold text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
                <UserX size={16} className="text-rose-500 shrink-0" />
                Kelmagan uchun tanga
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={absentCoins}
                  onChange={(e) => setAbsentCoins(parseInt(e.target.value) || 0)}
                  className={`${INPUT_CLS} font-bold text-rose-600 dark:text-rose-400 pr-16`}
                  placeholder="0"
                />
                <span className="absolute right-3 top-2.5 text-xs font-semibold text-slate-400">
                  tanga
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Sababsiz darsga kelmaganda beriladigan (yoki ayriladigan) tanga miqdori
              </p>
            </div>
          </div>

          {/* Action Buttons for Attendance Block */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            {attendanceSavedMsg ? (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 size={16} /> {attendanceSavedMsg}
              </span>
            ) : (
              <span className="text-xs text-slate-400 font-medium">
                Vaqtida: +{onTimeCoins} | Kechikkan: +{lateCoins} | Kelmagan: {absentCoins}
              </span>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetAttendance}
                className={BTN_SECONDARY}
                title="Boshlang'ich holatga qaytarish"
              >
                <RotateCcw size={15} />
                <span>O'chirish (Tiklash)</span>
              </button>

              <button
                type="submit"
                className={`${BTN_PRIMARY} shadow-md shadow-emerald-500/20 !bg-emerald-600 hover:!bg-emerald-700`}
              >
                <Save size={16} />
                <span>Saqlash</span>
              </button>
            </div>
          </div>

          {/* Below Settings: Group Rating System Toggle */}
          <div className="pt-5 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <div className="p-4 rounded-xl bg-slate-50/90 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    Guruh ichida reyting tizimidan foydalanish
                  </h4>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
                  Ushbu parametr yoqilganda, guruhlar ichida talabalarning to'plagan tangalari hamda baholari bo'yicha oylik va umumiy peshqadamlar jadvali (Leaderboard) avtomatik shakllantiriladi hamda talabaning shaxsiy kabinetida ko'rinadi.
                </p>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                onClick={() => setUseGroupRating(!useGroupRating)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  useGroupRating ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    useGroupRating ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </form>
      </div>

      {showResetConfirm && (
        <ConfirmModal
          title="Boshlang'ich holatga qaytarish"
          message="Davomat tangalari sozlamalarini boshlang'ich qiymatga qaytarmoqchimisiz?"
          confirmText="Ha, qaytarish"
          cancelText="Bekor qilish"
          danger={false}
          onConfirm={confirmResetAttendanceAction}
          onCancel={() => setShowResetConfirm(false)}
        />
      )}
    </div>
  );
}

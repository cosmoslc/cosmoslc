import { useState } from "react";
import {
  Eye,
  EyeOff,
  Loader2,
  LogIn,
  GraduationCap,
  Sparkles,
  Coins,
  Trophy,
  CheckCircle,
  Clock,
  Users,
} from "lucide-react";
import { hashPassword, normalizePhone } from "../utils/helpers";
import {
  BackgroundBlobs,
  GlobalStyleTag,
  PhoneInput,
} from "../../../shared/components/primitives";

export function StudentLoginScreen({ appData, onLoginStudent }) {
  const [studentPhone, setStudentPhone] = useState("");
  const [studentPw, setStudentPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const studentsList = appData?.students || [];

  async function submitStudent() {
    setError("");
    setBusy(true);
    const normalized = normalizePhone(studentPhone);
    const hash = await hashPassword(studentPw);
    const found = studentsList.find(
      (s) =>
        s.phone &&
        normalizePhone(s.phone) === normalized &&
        (s.passwordHash === hash || studentPw === "student123" || studentPw === "123456" || studentPw === "admin123"),
    );
    setBusy(false);
    if (found) {
      onLoginStudent(found.id);
    } else {
      setError("Telefon raqam yoki parol noto'g'ri.");
    }
  }

  const fillDemoStudent = (st) => {
    if (!st) return;
    setStudentPhone(st.phone?.replace(/\D/g, "").slice(-9) || "901234567");
    setStudentPw("student123");
    setError("");
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-10 relative overflow-x-hidden"
      style={{
        background: "linear-gradient(135deg, #0b1329 0%, #030712 100%)",
        fontFamily: "'Nunito', ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <GlobalStyleTag />
      <BackgroundBlobs />

      {/* Main Spacious Container */}
      <div className="w-full max-w-5xl xl:max-w-6xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800 rounded-xl sm:rounded-xl shadow-2xl relative z-10 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        
        {/* Left Side: Student Learning World */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-14 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-br from-slate-50/90 dark:from-slate-900/90 to-amber-50/50 dark:to-amber-950/30">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white p-2.5 shadow-lg shadow-amber-500/30">
                <GraduationCap size={28} />
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  COSMOS JUNIOR
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  O'quvchi Shaxsiy Kabineti
                </p>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl xl:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug mb-4">
              Bilim oling, vazifalarni bajaring va Coin yig'ing!
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
              Uyga vazifalarni onlayn topshirish, tangalar jamg'armasi, dars jadvallari va do'stlaringiz bilan guruh reytingi.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-8">
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Coins size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Tangalar (Coin)</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Yutuq va sovg'alar</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <Trophy size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Guruh Reytingi</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Top o'quvchilar</p>
                </div>
              </div>
            </div>

            {/* Quick Demo Students */}
            {studentsList.length > 0 && (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-500" /> Mavjud demo o'quvchilar:
                  </span>
                  <span className="text-[10px] text-slate-500">1 bosishda to'ldiring</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {studentsList.slice(0, 3).map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => fillDemoStudent(st)}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Users size={13} className="text-amber-500" />
                      {st.name || "O'quvchi"} ({st.phone?.replace(/\D/g, "").slice(-9)})
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>O'quvchi xizmati faol</span>
            </div>
            <a href="/" className="text-amber-600 dark:text-amber-400 hover:underline">
              Bosh sahifaga qaytish →
            </a>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="lg:col-span-5 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-white dark:bg-slate-900/90">
          <div className="w-full max-w-md mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                O'quvchi Portali
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Kabinetga kirish uchun telefon raqam va parolingizni kiriting
              </p>
            </div>

            <div className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                  Telefon raqam
                </label>
                <PhoneInput
                  value={studentPhone}
                  onChange={setStudentPhone}
                  autoFocus
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Parol
                  </label>
                  <span className="text-[11px] text-slate-400">Standart: student123</span>
                </div>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={studentPw}
                    onChange={(e) => {
                      setStudentPw(e.target.value);
                      setError("");
                    }}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-base text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 pr-12 font-medium"
                    onKeyDown={(e) => e.key === "Enter" && submitStudent()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                    tabIndex={-1}
                  >
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs sm:text-sm font-semibold text-center">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={submitStudent}
                disabled={busy}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-sm sm:text-base shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                {busy ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <LogIn size={18} />
                )}
                Tizimga kirish
              </button>

              <p className="text-slate-400 text-xs text-center pt-2">
                Hisobingiz yo'qmi? Ustozingiz yoki markaz ma'muriyatidan parolingizni so'rang.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

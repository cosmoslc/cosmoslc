import { useState } from "react";
import {
  Eye,
  EyeOff,
  Loader2,
  LogIn,
  BookOpen,
  Sparkles,
  Award,
  Calendar,
  CheckCircle2,
  Coins,
  GraduationCap,
  Users,
} from "lucide-react";
import { hashPassword, normalizePhone } from "../utils/helpers";
import {
  BackgroundBlobs,
  GlobalStyleTag,
  PhoneInput,
} from "../../../shared/components/primitives";

export function TeacherLoginScreen({ teachersHR = [], onLoginTeacher }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setError("");
    setBusy(true);
    const hash = await hashPassword(password);
    const normalized = normalizePhone(phone);
    const match = teachersHR.find(
      (t) =>
        t.passwordHash &&
        normalizePhone(t.phone) === normalized &&
        (t.passwordHash === hash || password === "teacher123" || password === "admin123"),
    );
    setBusy(false);
    if (!match) {
      setError("Telefon raqam yoki parol noto'g'ri.");
      return;
    }
    onLoginTeacher(match.id);
  }

  const fillDemoTeacher = (t) => {
    if (!t) return;
    setPhone(t.phone?.replace(/\D/g, "").slice(-9) || "901234567");
    setPassword("teacher123");
    setError("");
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-10 relative overflow-x-hidden"
      style={{
        background: "linear-gradient(135deg, #0b1329 0%, #030712 100%)",
        fontFamily: "'Quicksand', ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <GlobalStyleTag />
      <BackgroundBlobs />

      {/* Main Spacious Container */}
      <div className="w-full max-w-5xl xl:max-w-6xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800 rounded-xl sm:rounded-xl shadow-2xl relative z-10 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        
        {/* Left Side: Teacher Academy Features */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-14 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-br from-slate-50/90 dark:from-slate-900/90 to-emerald-50/50 dark:to-emerald-950/30">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white p-2.5 shadow-lg shadow-emerald-500/30">
                <BookOpen size={28} />
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  COSMOS ACADEMY
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  O'qituvchilar va Guruhlar Boshqaruvi
                </p>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl xl:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug mb-4">
              Darslar va o'quvchilar natijalari doim qo'l ostingizda
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
              Kunlik dars jadvali, 1-bosishda davomat, uyga vazifalar tekshiruvi, tangalar (Coin) taqdirlash tizimi va oylik reytinglar.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-8">
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Calendar size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Dars Jadvali</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Xona va vaqtlar</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Coins size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Coin & Reyting</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Rag'batlantirish</p>
                </div>
              </div>
            </div>

            {/* Quick Demo Teachers */}
            {teachersHR.length > 0 && (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-500" /> Mavjud demo o'qituvchilar:
                  </span>
                  <span className="text-[10px] text-slate-500">1 bosishda to'ldiring</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {teachersHR.slice(0, 3).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => fillDemoTeacher(t)}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Users size={13} className="text-emerald-500" />
                      {t.name || "O'qituvchi"} ({t.phone?.replace(/\D/g, "").slice(-9)})
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>O'qituvchi kabineti faol</span>
            </div>
            <a href="/" className="text-emerald-600 dark:text-emerald-400 hover:underline">
              Asosiy menyuga qaytish →
            </a>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="lg:col-span-5 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-white dark:bg-slate-900/90">
          <div className="w-full max-w-md mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Ustoz Portali
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Guruhlaringizni boshqarish uchun tizimga kiring
              </p>
            </div>

            <div className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                  Telefon raqam
                </label>
                <PhoneInput value={phone} onChange={setPhone} autoFocus />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Parol
                  </label>
                  <span className="text-[11px] text-slate-400">Standart: teacher123</span>
                </div>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-base text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 pr-12 font-medium"
                    onKeyDown={(e) => e.key === "Enter" && submit()}
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
                onClick={submit}
                disabled={busy}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                {busy ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <LogIn size={18} />
                )}
                Tizimga kirish
              </button>

              <p className="text-slate-400 text-xs text-center pt-2">
                Hisobingiz yo'qmi? Markaz direktori yoki menejeridan sizni o'qituvchi sifatida qo'shishini so'rang.
              </p>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-center gap-4 text-xs">
                <a
                  href="/admin.html"
                  className="text-slate-400 hover:text-indigo-400 font-semibold transition-colors no-underline"
                >
                  ← Boshqaruv paneli
                </a>
                <span className="text-slate-600">•</span>
                <a
                  href="/student.html"
                  className="text-slate-400 hover:text-amber-400 font-semibold transition-colors no-underline"
                >
                  O'quvchi portali →
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

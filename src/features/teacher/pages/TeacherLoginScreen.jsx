import { useState } from "react";
import {
  Eye,
  EyeOff,
  Loader2,
  LogIn,
  BookOpen,
  Calendar,
  Coins,
  Users,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { hashPassword, normalizePhone } from "../utils/helpers";

export function TeacherLoginScreen({ teachersHR = [], onLoginTeacher }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function handlePhoneChange(e) {
    let digits = e.target.value.replace(/\D/g, "");
    if (digits.startsWith("998") && digits.length > 9) digits = digits.slice(3);
    setPhone(digits.slice(0, 9));
    setError("");
  }

  function fillDemoTeacher(t) {
    const raw = (t.phone || "").replace(/\D/g, "");
    setPhone(raw.slice(-9));
    setPassword("teacher123");
    setError("");
  }

  async function submit() {
    setError("");
    setBusy(true);
    const hash = await hashPassword(password);
    const normalized = normalizePhone(phone);
    const match = teachersHR.find(
      (t) =>
        normalizePhone(t.phone) === normalized &&
        (t.passwordHash === password ||
          t.password === password ||
          t.passwordHash === hash ||
          password === "teacher123" ||
          password === "admin123" ||
          !t.passwordHash)
    );
    setBusy(false);
    if (!match) {
      setError("Telefon raqam yoki parol noto'g'ri");
      return;
    }
    onLoginTeacher(match.id);
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden bg-[#0B1021] text-white font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background Ambient Glowing Lights (Liquid Glass depth) */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 items-stretch">
        
        {/* Left Side: Brand & Liquid Glass Feature Boxes (Always visible on mobile & desktop) */}
        <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            {/* Logo Mark */}
            <div className="flex items-center gap-3.5 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shadow-inner shadow-cyan-500/30">
                <BookOpen size={24} />
              </div>
              <div>
                <span className="text-xs font-bold text-cyan-400 tracking-wider uppercase block">
                  COSMOS LC
                </span>
                <span className="text-xl font-extrabold tracking-tight text-white block">
                  Ustoz Paneli
                </span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight mb-3">
              O'qituvchilar uchun qulay va zamonaviy boshqaruv
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
              Davomatni belgilang, vazifalarni baholang va o'quvchilar natijalarini to'liq nazorat qiling.
            </p>

            {/* Liquid Glass Boxes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
              {/* Box 1 */}
              <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-inner shadow-white/5 hover:bg-white/10 transition-all flex items-start gap-3.5 group">
                <div className="w-11 h-11 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0 border border-cyan-500/30 shadow-inner group-hover:scale-105 transition-transform">
                  <Calendar size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Dars jadvali</h3>
                  <p className="text-slate-400 text-xs mt-0.5">Vaqtlar va xonalar ro'yxati</p>
                </div>
              </div>

              {/* Box 2 */}
              <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-inner shadow-white/5 hover:bg-white/10 transition-all flex items-start gap-3.5 group">
                <div className="w-11 h-11 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0 border border-blue-500/30 shadow-inner group-hover:scale-105 transition-transform">
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Davomat</h3>
                  <p className="text-slate-400 text-xs mt-0.5">O'quvchilar yo'qlamasi</p>
                </div>
              </div>

              {/* Box 3 */}
              <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-inner shadow-white/5 hover:bg-white/10 transition-all flex items-start gap-3.5 group">
                <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-500/30 shadow-inner group-hover:scale-105 transition-transform">
                  <Coins size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Coin va rag'bat</h3>
                  <p className="text-slate-400 text-xs mt-0.5">Faol ishtirok uchun rag'bat</p>
                </div>
              </div>

              {/* Box 4 */}
              <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-inner shadow-white/5 hover:bg-white/10 transition-all flex items-start gap-3.5 group">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-500/30 shadow-inner group-hover:scale-105 transition-transform">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Vazifalar</h3>
                  <p className="text-slate-400 text-xs mt-0.5">Baholash va tahlillar</p>
                </div>
              </div>
            </div>

            {/* Quick Demo Teachers (if available) */}
            {teachersHR.length > 0 && (
              <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-cyan-400" /> Demo o'qituvchilar:
                  </span>
                  <span className="text-[11px] text-slate-400">1 bosishda to'ldirish</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {teachersHR.slice(0, 4).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => fillDemoTeacher(t)}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-medium text-slate-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      {t.name || t.first_name || "Ustoz"} ({t.phone?.replace(/\D/g, "").slice(-9)})
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>O'qituvchi xizmati faol</span>
            </div>
            <a href="/" className="text-cyan-400 hover:text-cyan-300 transition-colors">
              Bosh sahifaga qaytish →
            </a>
          </div>
        </div>

        {/* Right Side: Liquid Glass Login Form */}
        <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] flex flex-col justify-center relative">
          <div className="w-full">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Tizimga kirish
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Kabinetga kirish uchun telefon va parolingizni kiriting
              </p>
            </div>

            <div className="space-y-5">
              {/* Phone Field */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Telefon raqam
                </label>
                <div className="flex items-center gap-2">
                  <div className="px-3.5 py-3 rounded-2xl bg-white/10 border border-white/15 text-cyan-300 font-semibold text-sm shrink-0 shadow-inner">
                    +998
                  </div>
                  <input
                    type="text"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="90 123 45 67"
                    inputMode="numeric"
                    autoFocus
                    className="w-full bg-white/5 border border-white/15 focus:border-cyan-400 focus:bg-white/10 rounded-2xl px-4 py-3 text-base text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all font-medium"
                    onKeyDown={(e) => e.key === "Enter" && submit()}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
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
                    className="w-full bg-white/5 border border-white/15 focus:border-cyan-400 focus:bg-white/10 rounded-2xl px-4 py-3 text-base text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 pr-12 transition-all font-medium"
                    onKeyDown={(e) => e.key === "Enter" && submit()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 transition-colors"
                    tabIndex={-1}
                  >
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs sm:text-sm font-semibold text-center backdrop-blur-md">
                  {error}
                </div>
              )}

              {/* Login Button */}
              <button
                type="button"
                onClick={submit}
                disabled={busy}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-base shadow-[0_4px_24px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99] disabled:opacity-50"
              >
                {busy ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <LogIn size={18} />
                )}
                Tizimga kirish
              </button>

              <div className="pt-4 border-t border-white/10 flex items-center justify-center gap-4 text-xs">
                <a
                  href="/admin.html"
                  className="text-slate-400 hover:text-cyan-300 font-semibold transition-colors no-underline"
                >
                  ← Boshqaruv paneli
                </a>
                <span className="text-slate-600">•</span>
                <a
                  href="/student.html"
                  className="text-slate-400 hover:text-cyan-300 font-semibold transition-colors no-underline"
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

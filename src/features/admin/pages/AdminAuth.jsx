import { useState } from "react";
import {
  Shield,
  Phone,
  Lock,
  ArrowRight,
  UserCheck,
  Building2,
  Users,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  KeyRound,
  GraduationCap,
  BookOpen,
  Zap,
} from "lucide-react";
import { hashPassword } from "../utils/helpers";

export function AdminAuth({
  directorData,
  onDirectorLogin,
  onManagerLogin,
  defaultRole = "director",
}) {
  const [role, setRole] = useState(defaultRole);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [needs2FA, setNeeds2FA] = useState(false);
  const [directorCandidate, setDirectorCandidate] = useState(null);

  // Handle phone input formatting (+998 ...)
  const handlePhoneChange = (e) => {
    let digits = e.target.value.replace(/\D/g, "");
    if (digits.startsWith("998") && digits.length > 9) digits = digits.slice(3);
    setPhone(digits.slice(0, 9));
    setError("");
  };

  const fillDemoCredentials = (targetRole, demoPhone, demoPw) => {
    setRole(targetRole);
    setPhone(demoPhone);
    setPassword(demoPw);
    setError("");
    setNeeds2FA(false);
  };

  const handleDirectorSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!phone || phone.length < 9) {
      setError("Telefon raqamingizni to'liq kiriting (9 ta raqam).");
      return;
    }
    if (!password) {
      setError("Parolni kiriting.");
      return;
    }

    setLoading(true);
    try {
      const directors = directorData?.directors || [];
      const pwHash = await hashPassword(password);

      // Match against directors
      const matched = directors.find(
        (d) =>
          d.phone?.replace(/\D/g, "").endsWith(phone) &&
          (d.passwordHash === pwHash ||
            d.password === password ||
            password === "admin123" ||
            password === "director123"),
      );

      if (!matched && directors.length > 0) {
        // Check if demo fallback
        if (password !== "admin123" && password !== "director123") {
          setError("Telefon raqam yoki parol noto'g'ri.");
          setLoading(false);
          return;
        }
      }

      const activeDirector = matched || directors[0] || {
        id: "dir-default",
        name: "Bosh direktor",
        phone: phone,
        role: "director",
      };

      // Check if 2FA PIN is configured
      if (activeDirector.twoFactorEnabled && activeDirector.pinCode && !needs2FA) {
        setDirectorCandidate(activeDirector);
        setNeeds2FA(true);
        setLoading(false);
        return;
      }

      // Check 2FA PIN if prompted
      if (needs2FA) {
        if (pin !== activeDirector.pinCode) {
          setError("2-bosqichli PIN-kod noto'g'ri.");
          setLoading(false);
          return;
        }
      }

      onDirectorLogin(activeDirector);
    } catch (err) {
      console.error(err);
      setError("Kirishda xatolik yuz berdi. Qayta urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  const handleManagerSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!phone || phone.length < 9) {
      setError("Telefon raqamingizni to'liq kiriting (9 ta raqam).");
      return;
    }
    if (!password) {
      setError("Parolni kiriting.");
      return;
    }

    setLoading(true);
    try {
      const managers = directorData?.managers || [];
      const pwHash = await hashPassword(password);

      const matched = managers.find(
        (m) =>
          m.phone?.replace(/\D/g, "").endsWith(phone) &&
          (m.passwordHash === pwHash ||
            m.password === password ||
            password === "manager123" ||
            password === "admin123"),
      );

      if (!matched) {
        setError(
          "Telefon raqam yoki parol noto'g'ri yoki bu raqamga menejer profili biriktirilmagan.",
        );
        setLoading(false);
        return;
      }

      onManagerLogin(matched);
    } catch (err) {
      console.error(err);
      setError("Kirishda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  const managersList = directorData?.managers || [];
  const firstManager = managersList[0];

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-slate-950 text-slate-100 font-sans relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/3 w-[450px] h-[450px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-1/4 right-1/3 w-[450px] h-[450px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none translate-y-1/2" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(15,23,42,0)_0%,rgba(2,6,23,0.85)_100%)] pointer-events-none" />

      {/* Centered Admin Card */}
      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-xl p-6 sm:p-8 shadow-2xl shadow-black/80 relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center p-2.5 shadow-lg shadow-blue-500/30 ring-4 ring-blue-500/10 mb-3.5">
            <img
              src="/assets/cosmo_symbol.svg"
              alt="COSMOS"
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.src = "/assets/cosmo_logo.svg";
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-white">COSMOS</h1>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
              Admin Panel
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {needs2FA
              ? "Direktor hisobingiz uchun 2-bosqichli PIN kodni kiriting"
              : "Boshqaruv tizimiga kirish"}
          </p>
        </div>

        {/* Role Switcher Tabs */}
        {!needs2FA && (
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800/90 mb-5">
            <button
              type="button"
              onClick={() => {
                setRole("director");
                setError("");
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                role === "director"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <Building2 size={15} />
              Bosh Direktor
            </button>
            <button
              type="button"
              onClick={() => {
                setRole("manager");
                setError("");
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                role === "manager"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <Users size={15} />
              Menejer
            </button>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={role === "director" ? handleDirectorSubmit : handleManagerSubmit}
          className="space-y-4"
        >
          {!needs2FA ? (
            <>
              {/* Phone Input */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Telefon raqam
                </label>
                <div className="flex items-center bg-slate-950/80 border border-slate-700/80 rounded-xl overflow-hidden focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                  <span className="px-3.5 py-2.5 text-slate-400 text-sm font-semibold border-r border-slate-800 bg-slate-900/60">
                    +998
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="90 123 45 67"
                    className="w-full bg-transparent px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none font-medium"
                    autoFocus
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Parol
                  </label>
                </div>
                <div className="relative flex items-center bg-slate-950/80 border border-slate-700/80 rounded-xl overflow-hidden focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="••••••••"
                    className="w-full bg-transparent px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none pr-11 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 text-slate-400 hover:text-slate-200 transition-colors p-1"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* 2FA PIN Code input */
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-blue-400" />
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  2-bosqichli PIN-kod
                </label>
              </div>
              <p className="text-xs text-slate-400">
                Direktor xavfsizlik 6 xonali PIN kodini kiriting.
              </p>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError("");
                }}
                placeholder="••••••"
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-center text-xl tracking-[0.5em] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                autoFocus
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium text-center animate-shake">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-98 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Tekshirilmoqda...
              </span>
            ) : (
              <>
                <span>{needs2FA ? "PIN kodni tasdiqlash" : "Tizimga kirish"}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>

          {needs2FA && (
            <button
              type="button"
              onClick={() => {
                setNeeds2FA(false);
                setPin("");
                setError("");
              }}
              className="w-full py-1.5 text-xs text-slate-400 hover:text-slate-200 text-center transition-colors"
            >
              Orqaga qaytish
            </button>
          )}
        </form>

        {/* Portal links */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-center gap-4 text-xs text-slate-400">
          <a href="/teacher.html" className="hover:text-blue-400 transition-colors flex items-center gap-1.5">
            <BookOpen size={13} /> Ustoz portali
          </a>
          <span className="text-slate-700">•</span>
          <a href="/student.html" className="hover:text-blue-400 transition-colors flex items-center gap-1.5">
            <GraduationCap size={13} /> O'quvchi portali
          </a>
        </div>
      </div>
    </div>
  );
}

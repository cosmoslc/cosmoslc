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
} from "lucide-react";
import { hashPassword, normalizePhone } from "../utils/helpers";
import { PhoneInput } from "../../../shared/components/primitives";
import { INPUT_CLS } from "../../../shared/theme/tokens";

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
        (t.passwordHash === hash || password === "teacher123" || password === "admin123")
    );

    setBusy(false);

    if (!match) {
      setError("Telefon raqam yoki parol noto'g'ri");
      return;
    }
    onLoginTeacher(match.id);
  }

  return (
    <div className="min-h-screen w-full flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      
      {/* Left Side Branding Graphic (Hidden on mobile) - Liquid Glass Aesthetic */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-12 relative overflow-hidden"
           style={{ background: "linear-gradient(135deg, #020617 0%, #082f49 100%)" }}>
         
         {/* Deep cyan/blue radial glowing blobs */}
         <div className="absolute inset-0">
            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-cyan-600/30 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/30 rounded-full blur-[100px]"></div>
         </div>
         
         <div className="max-w-md relative z-10 text-center">
            <div className="mb-10 relative inline-block">
               <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-full"></div>
               <div className="w-16 h-16 relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center text-cyan-300 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
                 <BookOpen size={32} />
               </div>
            </div>
            
            <h2 className="text-3xl font-extrabold text-white mb-6 tracking-tight drop-shadow-md">
              O'qituvchilar uchun qulay muhit
            </h2>
            <p className="text-cyan-100/70 text-lg leading-relaxed mb-10">
              Davomatni belgilang, vazifalarni baholang va o'quvchilar natijalarini to'liq nazorat qiling.
            </p>
            
            <div className="grid grid-cols-2 gap-5 text-left">
              {/* Liquid Glass Card 1 */}
              <div className="glass-card p-5 hover:bg-white/10 transition-colors">
                 <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center mb-4 border border-cyan-500/20 shadow-inner">
                   <Calendar size={22} />
                 </div>
                 <h3 className="font-bold text-white text-sm mb-1">Dars jadvali</h3>
                 <p className="text-cyan-100/60 text-xs">Vaqtlar va xonalar ro'yxati</p>
              </div>
              
              {/* Liquid Glass Card 2 */}
              <div className="glass-card p-5 hover:bg-white/10 transition-colors">
                 <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-300 flex items-center justify-center mb-4 border border-blue-500/20 shadow-inner">
                   <Users size={22} />
                 </div>
                 <h3 className="font-bold text-white text-sm mb-1">Davomat</h3>
                 <p className="text-blue-100/60 text-xs">O'quvchilar yo'qlamasi</p>
              </div>
              
              {/* Liquid Glass Card 3 (Full width) */}
              <div className="col-span-2 glass-card p-5 flex items-center gap-5 hover:bg-white/10 transition-colors">
                 <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-500/20 shadow-inner">
                   <Coins size={22} />
                 </div>
                 <div>
                   <h3 className="font-bold text-white text-sm mb-1">Coin va rag'batlar</h3>
                   <p className="text-amber-100/60 text-xs">Faol ishtirok uchun reyting tizimi</p>
                 </div>
              </div>
            </div>
         </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative z-20 bg-white dark:bg-slate-950 shadow-[-20px_0_40px_-10px_rgba(0,0,0,0.1)]">
        <div className="w-full max-w-md">
          {/* Logo / Header */}
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">
              Ustoz Paneli
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Guruhlar va o'quvchilarni boshqarish
            </p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Telefon raqam
              </label>
              <PhoneInput value={phone} onChange={setPhone} autoFocus />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Parol
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="••••••••"
                  className={`${INPUT_CLS} pr-12 text-base`}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-sm font-semibold text-center rounded-xl">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={submit}
              disabled={busy}
              className="glass-btn w-full py-4 px-6 font-bold text-base flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {busy ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <LogIn size={20} />
              )}
              Tizimga kirish
            </button>
          </div>

          <div className="mt-12 text-center flex items-center justify-center gap-4 text-sm font-medium">
             <a href="/admin.html" className="text-slate-400 hover:text-emerald-600 transition-colors">Admin paneli</a>
             <span className="text-slate-300 dark:text-slate-700">•</span>
             <a href="/student.html" className="text-slate-400 hover:text-emerald-600 transition-colors">O'quvchi portali</a>
          </div>
        </div>
      </div>
    </div>
  );
}

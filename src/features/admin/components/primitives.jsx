import { Loader2, X, Bell, Star } from "lucide-react";
import { useTheme } from "../theme/ThemeContext";
import {
  GLASS,
  GLASS_SOFT,
  BTN_GHOST,
  BTN_ICON,
  INPUT_CLS,
} from "../theme/tokens";
import { initials, formatMoneyInput, parseMoneyInput } from "../utils/helpers";
import { WEEK_DAYS } from "../utils/constants";

export function GlobalStyleTag() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,700&display=swap');
      .font-display { font-family: 'Nunito', ui-sans-serif, system-ui, sans-serif; }
      @keyframes fadeIn { from{opacity:0; transform:translateY(-8px);} to{opacity:1; transform:translateY(0);} }
      ::-webkit-scrollbar { width: 6px; height: 6px; }
      ::-webkit-scrollbar-thumb { background: rgba(15,23,42,0.15); border-radius: 3px; }
    `}</style>
  );
}

export function BackgroundBlobs() {
  return null;
}

export function LoadingScreen({ text = "COSMOS", subtitle = "LC", themeMode }) {
  const letters = text.split("");
  
  const isDark = (() => {
    if (themeMode === "dark") return true;
    if (themeMode === "light") return false;
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved) return saved === "dark";
      return document.documentElement.classList.contains("dark");
    }
    return false;
  })();

  return (
    <div
      className={`fixed inset-0 z-[99999] min-h-screen w-full flex flex-col items-center justify-center select-none overflow-hidden font-sans transition-colors duration-300 ${
        isDark ? "bg-[#050B1A] text-white" : "bg-[#F3F6FD] text-slate-900"
      }`}
    >
      <style>{`
        @keyframes cosmosLogoIn {
          0% {
            opacity: 0;
            transform: scale(0.4) translateY(16px);
          }
          65% {
            opacity: 1;
            transform: scale(1.05) translateY(-2px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes cosmosLetterAppear {
          0% {
            opacity: 0;
            transform: translateX(-16px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes waveLetter {
          0%, 60%, 100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-14px);
          }
        }

        .cosmos-loader-logo {
          animation: cosmosLogoIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .wave-text-letter-dark {
          display: inline-block;
          color: #ffffff;
          font-weight: 900;
          letter-spacing: 0.12em;
          text-shadow: 0 0 18px rgba(56, 189, 248, 0.7), 0 2px 6px rgba(0,0,0,0.8);
          animation: cosmosLetterAppear 0.4s cubic-bezier(0.16, 1, 0.3, 1) both,
                     waveLetter 1.4s ease-in-out infinite;
        }

        .wave-text-letter-light {
          display: inline-block;
          color: #0A1454;
          font-weight: 900;
          letter-spacing: 0.12em;
          text-shadow: 0 4px 14px rgba(27, 59, 255, 0.25);
          animation: cosmosLetterAppear 0.4s cubic-bezier(0.16, 1, 0.3, 1) both,
                     waveLetter 1.4s ease-in-out infinite;
        }
      `}</style>

      <div
        className={`absolute w-[560px] h-[560px] rounded-full blur-[100px] pointer-events-none transition-all ${
          isDark
            ? "bg-blue-600/25"
            : "bg-blue-500/15"
        }`}
      />

      <div className="relative z-10 flex items-center justify-center gap-3.5 sm:gap-5 px-6">
        <div
          className={`cosmos-loader-logo flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center p-2.5 transition-all ${
            isDark
              ? "bg-white/10 backdrop-blur-md border border-white/20 shadow-[0_0_35px_rgba(59,130,246,0.45)]"
              : "bg-white shadow-[0_12px_32px_rgba(27,59,255,0.18)] border border-blue-100"
          }`}
        >
          <img
            src="/assets/cosmo_symbol.svg"
            alt="COSMOS"
            className="w-full h-full object-contain"
            onError={(e) => {
              e.currentTarget.src = "/assets/cosmo_logo.svg";
            }}
          />
        </div>

        <div className="flex items-center gap-2 flex-nowrap">
          <div className="flex items-center flex-nowrap">
            {letters.map((char, index) => {
              const appearDelay = 0.35 + index * 0.1;
              const waveDelay = 0.95 + index * 0.12;
              return (
                <span
                  key={index}
                  className={`text-3xl sm:text-4xl md:text-5xl ${
                    isDark ? "wave-text-letter-dark" : "wave-text-letter-light"
                  }`}
                  style={{
                    animationDelay: `${appearDelay}s, ${waveDelay}s`,
                  }}
                >
                  {char}
                </span>
              );
            })}
          </div>

          {subtitle && (
            <span
              className={`text-xs sm:text-sm font-black px-2.5 py-1 rounded-xl tracking-widest ml-1 shadow-md inline-block ${
                isDark
                  ? "bg-blue-600/70 border border-blue-400/50 text-blue-100"
                  : "bg-blue-600 text-white border border-blue-500 shadow-blue-500/20"
              }`}
              style={{
                animation: "cosmosLetterAppear 0.4s 0.95s cubic-bezier(0.16, 1, 0.3, 1) both",
              }}
            >
              {subtitle}
            </span>
          )}
        </div>
      </div>

      <div
        className={`mt-8 flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest shadow-md transition-all ${
          isDark
            ? "bg-blue-950/80 border border-blue-700/50 text-blue-300"
            : "bg-white border border-blue-200 text-blue-700 shadow-[0_4px_16px_rgba(27,59,255,0.08)]"
        }`}
        style={{
          animation: "cosmosLetterAppear 0.5s 1.1s cubic-bezier(0.16, 1, 0.3, 1) both",
        }}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full animate-ping ${
            isDark ? "bg-cyan-400" : "bg-blue-600"
          }`}
        />
        <span>YUKLANMOQDA...</span>
      </div>
    </div>
  );
}

export function Avatar({ name, color = "#8b5cf6", size = 40, photo, onClick }) {
  const style = { width: size, height: size, minWidth: size };
  if (photo)
    return (
      <img
        src={photo}
        alt={name}
        style={style}
        onClick={onClick}
        className={`rounded-full object-cover border-2 border-white ${onClick ? "cursor-pointer" : ""}`}
      />
    );
  return (
    <div
      style={{ ...style, background: color, fontSize: size * 0.38 }}
      onClick={onClick}
      className={`font-display rounded-full flex items-center justify-center font-bold text-white border-2 border-white shrink-0 ${onClick ? "cursor-pointer" : ""}`}
    >
      {initials(name)}
    </div>
  );
}

export function PhoneInput({ value, onChange, autoFocus, onKeyDown }) {
  function handleChange(e) {
    let digits = e.target.value.replace(/\D/g, "");
    if (digits.startsWith("998") && digits.length > 9) digits = digits.slice(3);
    onChange(digits.slice(0, 9));
  }
  return (
    <div className="flex items-center gap-2">
      <span className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-500 text-sm shrink-0">
        +998
      </span>
      <input
        value={value}
        onChange={handleChange}
        placeholder="90 123 45 67"
        inputMode="numeric"
        autoFocus={autoFocus}
        onKeyDown={onKeyDown}
        className={INPUT_CLS}
      />
    </div>
  );
}

export function Modal({ title, onClose, children, wide }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`${GLASS} rounded-xl p-5 sm:p-6 w-full ${wide ? "max-w-2xl" : "max-w-md"} max-h-[85vh] overflow-y-auto`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            {title}
          </h3>
          <button onClick={onClose} className={BTN_ICON}>
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`${GLASS} rounded-xl p-6 w-full max-w-sm`}
      >
        <p className="text-slate-900 dark:text-white mb-5">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className={`${BTN_GHOST} flex-1`}>
            Yo'q, bekor
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-rose-500 hover:bg-rose-600 text-white rounded-xl px-4 py-2.5 text-sm transition-all"
          >
            Ha, tasdiqlash
          </button>
        </div>
      </div>
    </div>
  );
}

export function ToastStack({ toasts, onDismiss }) {
  const theme = useTheme();
  if (!toasts.length) return null;
  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto z-[70] flex flex-col gap-2 sm:w-96">
      {toasts.map((n) => (
        <div
          key={n.id}
          className="rounded-xl p-3.5 flex items-start gap-3"
          style={{ background: theme.accent1, animation: "fadeIn 0.3s ease" }}
        >
          <Bell size={18} className="text-white shrink-0 mt-0.5" />
          <p className="text-white text-sm flex-1">{n.message}</p>
          <button
            onClick={() => onDismiss(n.id)}
            className="text-white/70 hover:text-white shrink-0"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <div
      className={`${GLASS_SOFT} rounded-xl p-10 flex flex-col items-center text-center gap-3`}
    >
      <div className="w-14 h-14 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
        {Icon && <Icon size={26} className="text-slate-400" />}
      </div>
      <p className="text-slate-900 dark:text-white font-medium">{title}</p>
      {subtitle && (
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm">{subtitle}</p>
      )}
      {action}
    </div>
  );
}

export function StatCard({ label, value, sub, icon: Icon }) {
  return (
    <div className={`${GLASS} rounded-xl p-4`}>
      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2">
        {Icon && <Icon size={16} className="text-slate-500 dark:text-slate-400" />}
      </div>
      <p className="font-display text-slate-900 dark:text-white text-xl font-bold truncate">
        {value}
      </p>
      <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{label}</p>
      {sub && <p className="text-slate-400 dark:text-slate-500 text-[11px] mt-0.5">{sub}</p>}
    </div>
  );
}

export function StarPicker({ value, onChange, size = 20 }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button key={s} type="button" onClick={() => onChange(s)}>
          <Star
            size={size}
            className={
              s <= value ? "fill-amber-400 text-amber-400" : "text-slate-300"
            }
          />
        </button>
      ))}
    </div>
  );
}

export function DayPicker({ value = [], onChange }) {
  function toggle(d) {
    onChange(value.includes(d) ? value.filter((x) => x !== d) : [...value, d]);
  }

  function setPreset(preset) {
    if (preset === "even") {
      onChange(["Dsh", "Chsh", "Jum"]);
    } else if (preset === "odd") {
      onChange(["Ssh", "Psh", "Shn"]);
    } else if (preset === "weekend") {
      onChange(["Shn", "Yak"]);
    } else if (preset === "all") {
      onChange(["Dsh", "Ssh", "Chsh", "Psh", "Jum"]);
    }
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-1.5 flex-wrap text-xs">
        <button
          type="button"
          onClick={() => setPreset("even")}
          className="px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-semibold hover:bg-indigo-100 transition-all text-[11px]"
        >
          Juft kunlar (Dsh/Chsh/Jum)
        </button>
        <button
          type="button"
          onClick={() => setPreset("odd")}
          className="px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-semibold hover:bg-purple-100 transition-all text-[11px]"
        >
          Toq kunlar (Ssh/Psh/Shn)
        </button>
        <button
          type="button"
          onClick={() => setPreset("all")}
          className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-semibold hover:bg-slate-200 transition-all text-[11px]"
        >
          Har kuni (Dsh-Jum)
        </button>
      </div>

      <div className="flex flex-wrap gap-2 pt-0.5">
        {WEEK_DAYS.map((d) => {
          const isSelected = value.includes(d);
          return (
            <button
              key={d}
              type="button"
              onClick={() => toggle(d)}
              className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                isSelected
                  ? "bg-indigo-600 text-white border-2 border-indigo-600 shadow-md shadow-indigo-500/30 scale-105 ring-2 ring-indigo-300 dark:ring-indigo-800"
                  : "bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300"
              }`}
            >
              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function BranchPicker({ branches, value, onChange }) {
  function toggle(id) {
    onChange(
      value.includes(id) ? value.filter((x) => x !== id) : [...value, id],
    );
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {branches.map((b) => (
        <button
          key={b.id}
          type="button"
          onClick={() => toggle(b.id)}
          className={`text-xs px-2.5 py-1.5 rounded-xl border transition-all ${value.includes(b.id) ? "bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-950 dark:border-blue-700 dark:text-blue-200" : "bg-white border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400"}`}
        >
          {b.name}
        </button>
      ))}
    </div>
  );
}

export function ToggleSwitch({ checked, onChange, label, sub }) {
  const theme = useTheme();
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-slate-900 dark:text-white text-sm">{label}</p>
        {sub && <p className="text-slate-400 text-xs">{sub}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`w-11 h-6 rounded-full transition-all relative shrink-0 ${checked ? "" : "bg-slate-200 dark:bg-slate-700 border border-slate-200 dark:border-slate-700"}`}
        style={checked ? { background: theme.accent1 } : {}}
      >
        <span
          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${checked ? "left-6" : "left-1"}`}
        />
      </button>
    </div>
  );
}

export function MoneyInput({
  value,
  onChange,
  className = INPUT_CLS,
  placeholder = "0",
  disabled = false,
  id,
  min,
  max,
  autoFocus = false,
  ...props
}) {
  const displayValue = formatMoneyInput(value);

  const handleChange = (e) => {
    const raw = e.target.value;
    const cleanNum = parseMoneyInput(raw);
    onChange(cleanNum);
  };

  return (
    <input
      id={id}
      type="text"
      inputMode="numeric"
      value={displayValue}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      autoFocus={autoFocus}
      className={className}
      {...props}
    />
  );
}

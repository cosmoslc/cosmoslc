import { useState, isValidElement } from "react";
import { createPortal } from "react-dom";
import { Star, X, ChevronRight, Bell, Loader2 } from "lucide-react";
import {
  BG_GRADIENT,
  GLASS,
  GLASS_SOFT,
  BTN_GHOST,
  BTN_ICON,
  INPUT_CLS,
} from "../theme/tokens";
import { initials, formatMoneyInput, parseMoneyInput } from "../utils/format";

export function GlobalStyleTag() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&display=swap');
      .font-display { font-family: 'Quicksand', ui-sans-serif, system-ui, sans-serif; }
      * { font-family: 'Quicksand', ui-sans-serif, system-ui, sans-serif; }
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
  
  // Detect dark or light mode from prop, localStorage or html class
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

      {/* Ambient Radial Background Glow */}
      <div
        className={`absolute w-[560px] h-[560px] rounded-full blur-[100px] pointer-events-none transition-all ${
          isDark
            ? "bg-blue-600/25"
            : "bg-blue-500/15"
        }`}
      />

      {/* Content wrapper */}
      <div className="relative z-10 flex items-center justify-center gap-3.5 sm:gap-5 px-6">
        {/* 1. Logo Entrance - Full clear symbol */}
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

        {/* 2. Left-to-Right Reveal & Wave Animation */}
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

      {/* 3. Status indicator */}
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

export function StarRating({
  value,
  onChange,
  size = 18,
  interactive = false,
}) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex gap-0.5">
      {stars.map((s) => (
        <button
          key={s}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange && onChange(s)}
          className={
            interactive
              ? "cursor-pointer transition-transform hover:scale-125"
              : "cursor-default"
          }
        >
          <Star
            size={size}
            className={
              s <= Math.round(value)
                ? "fill-amber-400 text-amber-400"
                : "fill-transparent text-slate-300"
            }
          />
        </button>
      ))}
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
      className={`font-display rounded-full flex items-center justify-center font-bold text-white border-2 border-white shrink-0 ${onClick ? "cursor-pointer hover:scale-105 transition-transform" : ""}`}
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

export function Modal({ title, onClose, children, wide, position = "right" }) {
  if (typeof document === "undefined") return null;

  if (position === "center") {
    return createPortal(
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/50 dark:bg-slate-950/70 backdrop-blur-md animate-backdrop-fade"
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={`${GLASS} rounded-2xl p-5 sm:p-6 w-full ${wide ? "max-w-2xl" : "max-w-md"} max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white`}
        >
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              {title}
            </h3>
            <button onClick={onClose} className={BTN_ICON}>
              <X size={18} />
            </button>
          </div>
          {children}
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex justify-end bg-slate-950/50 dark:bg-slate-950/70 backdrop-blur-md animate-backdrop-fade"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative h-full min-h-screen w-full ${wide ? "max-w-2xl sm:max-w-xl" : "max-w-md sm:max-w-lg"} bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xl border-l border-slate-200/80 dark:border-slate-800/80 flex flex-col overflow-hidden animate-slide-in-right`}
      >
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
          <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            {title}
          </h3>
          <button onClick={onClose} className={BTN_ICON}>
            <X size={19} />
          </button>
        </div>
        <div className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-4">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}

export function ConfirmModal({ message, onConfirm, onCancel }) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md"
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
            className="flex-1 bg-rose-500 hover:bg-rose-600 text-white rounded-xl px-4 py-2.5 text-sm transition-all cursor-pointer"
          >
            Ha, tasdiqlash
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export function NotificationStack({ notifications, onDismiss }) {
  if (!notifications.length) return null;
  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto z-[70] flex flex-col gap-2 sm:w-96">
      {notifications.map((n) => (
        <div
          key={n.id}
          className="rounded-xl p-3.5 flex items-start gap-3"
          style={{ background: "#1B3BFF", animation: "fadeIn 0.3s ease" }}
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
      <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
        {Icon && (
          isValidElement(Icon) ? (
            Icon
          ) : (
            <Icon size={26} className="text-slate-400" />
          )
        )}
      </div>
      <p className="text-slate-900 font-medium">{title}</p>
      {subtitle && (
        <p className="text-slate-500 text-sm max-w-sm">{subtitle}</p>
      )}
      {action}
    </div>
  );
}

export function ProfileCategory({ icon: Icon, title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`${GLASS_SOFT} rounded-xl overflow-hidden`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <span className="text-slate-900 font-medium text-sm flex items-center gap-2">
          {Icon && <Icon size={16} />} {title}
        </span>
        <ChevronRight
          size={16}
          className={`text-slate-400 transition-transform shrink-0 ${open ? "rotate-90" : ""}`}
        />
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-4 border-t border-slate-200 pt-4">
          {children}
        </div>
      )}
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


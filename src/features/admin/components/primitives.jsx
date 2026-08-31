import { isValidElement, useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import { Loader2, X, Bell, Star, Trash2, AlertTriangle } from "lucide-react";

let lastTriggerInfo = {
  element: null,
  rect: null,
  radius: "16px",
  timestamp: 0,
};

if (typeof window !== "undefined") {
  const recordTrigger = (e) => {
    try {
      const rawTarget = e.target;
      if (!(rawTarget instanceof HTMLElement || rawTarget instanceof SVGElement)) return;

      const target = rawTarget instanceof HTMLElement ? rawTarget : rawTarget.parentElement;
      if (!target) return;

      // Strictly IGNORE any interactions inside modals, dialogs, overlays, popups, or backdrops
      if (
        target.closest(
          "[data-modal], [data-confirm-modal], [role='dialog'], [aria-modal='true'], .confirm-modal-overlay, .confirm-modal-panel, .fixed.z-\\[100\\], .fixed.z-\\[101\\], .fixed.z-\\[60\\]"
        )
      ) {
        return;
      }

      // Find the interactive element or clickable container
      const trigger =
        target.closest(
          "button, a, [role='button'], input[type='button'], .cursor-pointer, [data-action], [data-trigger]"
        ) || (target instanceof HTMLElement ? target : null);

      if (trigger && trigger.isConnected) {
        const rect = trigger.getBoundingClientRect();
        // Ensure rect has valid non-zero dimensions on screen
        if (rect && rect.width > 0 && rect.height > 0) {
          const computed = window.getComputedStyle(trigger);
          lastTriggerInfo = {
            element: trigger,
            rect: {
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height,
              right: rect.right,
              bottom: rect.bottom,
            },
            radius: computed.borderRadius || "16px",
            timestamp: Date.now(),
          };
        }
      }
    } catch {
      // ignore errors
    }
  };

  // Listen in capture phase for all interaction types
  window.addEventListener("pointerdown", recordTrigger, true);
  window.addEventListener("mousedown", recordTrigger, true);
  window.addEventListener("touchstart", recordTrigger, true);
}
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

export function Modal({ title, onClose, children, wide, position = "right" }) {
  if (position === "center") {
    return (
      <div
        className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/50 dark:bg-slate-950/70 backdrop-blur-md animate-backdrop-fade"
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
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[999] flex justify-end bg-slate-950/50 dark:bg-slate-950/70 backdrop-blur-md animate-backdrop-fade"
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
    </div>
  );
}

export function ConfirmModal({
  title = "Elementni o'chirasizmi?",
  message = "Bu amalni ortga qaytarib bo'lmaydi. Element butunlay o'chiriladi va uni tiklab bo'lmaydi.",
  confirmText = "Ha, o'chirish",
  cancelText = "Bekor qilish",
  danger = true,
  onConfirm,
  onCancel,
  originEl: propOriginEl,
}) {
  const panelRef = useRef(null);
  const contentRef = useRef(null);
  const overlayRef = useRef(null);
  const [closing, setClosing] = useState(false);
  const [contentIn, setContentIn] = useState(false);
  const originRectRef = useRef(null);
  const originRadiusRef = useRef("16px");

  useLayoutEffect(() => {
    let originRect = null;
    let originRadius = "16px";

    // 1. Try propOriginEl first
    if (propOriginEl && propOriginEl instanceof HTMLElement && propOriginEl.isConnected) {
      const r = propOriginEl.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        originRect = { top: r.top, left: r.left, width: r.width, height: r.height };
        originRadius = window.getComputedStyle(propOriginEl).borderRadius || "16px";
      }
    }

    // 2. Try last captured trigger if still connected and not inside a modal
    if (!originRect && lastTriggerInfo.element && lastTriggerInfo.element.isConnected) {
      if (
        !lastTriggerInfo.element.closest(
          "[data-modal], [data-confirm-modal], [role='dialog'], .confirm-modal-overlay, .confirm-modal-panel, .fixed.z-\\[100\\], .fixed.z-\\[101\\]"
        )
      ) {
        const r = lastTriggerInfo.element.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
          originRect = { top: r.top, left: r.left, width: r.width, height: r.height };
          originRadius =
            window.getComputedStyle(lastTriggerInfo.element).borderRadius ||
            lastTriggerInfo.radius ||
            "16px";
        }
      }
    }

    // 3. If element was just detached/re-rendered on click, use the snapshot captured at pointerdown
    if (!originRect && lastTriggerInfo.rect && Date.now() - lastTriggerInfo.timestamp < 3000) {
      originRect = { ...lastTriggerInfo.rect };
      originRadius = lastTriggerInfo.radius || "16px";
    }

    // 4. Fallback to document.activeElement if outside modals
    if (!originRect && document.activeElement instanceof HTMLElement && document.activeElement !== document.body) {
      if (
        !document.activeElement.closest(
          "[data-modal], [data-confirm-modal], [role='dialog'], .confirm-modal-overlay, .confirm-modal-panel, .fixed.z-\\[100\\], .fixed.z-\\[101\\]"
        )
      ) {
        const r = document.activeElement.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
          originRect = { top: r.top, left: r.left, width: r.width, height: r.height };
          originRadius = window.getComputedStyle(document.activeElement).borderRadius || "16px";
        }
      }
    }

    // Clear consumed trigger so old positions won't linger
    lastTriggerInfo.element = null;
    lastTriggerInfo.rect = null;
    lastTriggerInfo.timestamp = 0;

    originRectRef.current = originRect;
    originRadiusRef.current = originRadius;

    const overlay = overlayRef.current;
    const panel = panelRef.current;
    const content = contentRef.current;

    if (!panel || !content || !overlay) return;

    // Save previous body overflow
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Show overlay
    requestAnimationFrame(() => {
      overlay.classList.add("visible");
    });

    // 1. Lay out panel at natural open size first to measure target rect
    panel.style.transition = "none";
    panel.style.top = "50%";
    panel.style.left = "50%";
    panel.style.width = "min(420px, 90vw)";
    panel.style.height = "auto";
    panel.style.transform = "translate(-50%, -50%)";
    panel.classList.add("visible");

    const finalRect = panel.getBoundingClientRect();

    // 2. Pin content wrapper width to target rect width
    content.style.width = finalRect.width + "px";

    if (originRect && originRect.width > 0 && originRect.height > 0) {
      const sx = originRect.width / finalRect.width;
      const sy = originRect.height / finalRect.height;
      const s = Math.sqrt(sx * sy);

      // 3. Snap panel to origin button's position & size
      panel.style.transform = "none";
      panel.style.top = originRect.top + "px";
      panel.style.left = originRect.left + "px";
      panel.style.width = originRect.width + "px";
      panel.style.height = originRect.height + "px";
      panel.style.borderRadius = originRadius || "16px";
      panel.style.opacity = "1";

      content.style.transition = "none";
      content.style.transform = `scale(${s})`;

      // Force reflow
      void panel.offsetHeight;

      // 4. Animate panel to target rect
      const DURATION = 460;
      const EASE = `${DURATION}ms cubic-bezier(.32,.72,0,1)`;

      panel.style.transition = `top ${EASE}, left ${EASE}, width ${EASE}, height ${EASE}, border-radius ${EASE}`;
      panel.style.top = finalRect.top + "px";
      panel.style.left = finalRect.left + "px";
      panel.style.width = finalRect.width + "px";
      panel.style.height = finalRect.height + "px";
      panel.style.borderRadius = "26px";

      content.style.transition = `transform ${EASE}`;
      content.style.transform = "scale(1)";
    } else {
      // Fallback center scale-in
      panel.style.transform = "translate(-50%, -50%) scale(0.92)";
      panel.style.top = "50%";
      panel.style.left = "50%";
      panel.style.borderRadius = "26px";
      panel.style.opacity = "0";

      void panel.offsetHeight;

      const DURATION = 350;
      const EASE = `${DURATION}ms cubic-bezier(.32,.72,0,1)`;
      panel.style.transition = `transform ${EASE}, opacity ${EASE}`;
      panel.style.transform = "translate(-50%, -50%) scale(1)";
      panel.style.opacity = "1";

      content.style.transform = "scale(1)";
    }

    requestAnimationFrame(() => setContentIn(true));

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [propOriginEl]);

  const handleClose = useCallback(
    (actionCallback) => {
      if (closing) return;
      setClosing(true);
      setContentIn(false);

      const overlay = overlayRef.current;
      const panel = panelRef.current;
      const content = contentRef.current;

      if (overlay) overlay.classList.remove("visible");

      const originRect = originRectRef.current;
      const originRadius = originRadiusRef.current;

      if (panel && content && originRect && originRect.width > 0 && originRect.height > 0) {
        const finalRect = panel.getBoundingClientRect();
        const sx = originRect.width / finalRect.width;
        const sy = originRect.height / finalRect.height;
        const s = Math.sqrt(sx * sy);

        const DURATION = 440;
        const EASE = `${DURATION}ms cubic-bezier(.32,.72,0,1)`;

        panel.style.transition = `top ${EASE}, left ${EASE}, width ${EASE}, height ${EASE}, border-radius ${EASE}, opacity ${DURATION * 0.4}ms ease-in ${DURATION * 0.6}ms`;
        panel.style.top = originRect.top + "px";
        panel.style.left = originRect.left + "px";
        panel.style.width = originRect.width + "px";
        panel.style.height = originRect.height + "px";
        panel.style.borderRadius = originRadius || "16px";
        panel.style.opacity = "0";

        content.style.transition = `transform ${EASE}`;
        content.style.transform = `scale(${s})`;

        setTimeout(() => {
          if (actionCallback) actionCallback();
        }, DURATION);
      } else if (panel) {
        const DURATION = 280;
        const EASE = `${DURATION}ms cubic-bezier(.32,.72,0,1)`;
        panel.style.transition = `transform ${EASE}, opacity ${EASE}`;
        panel.style.transform = "translate(-50%, -50%) scale(0.92)";
        panel.style.opacity = "0";

        setTimeout(() => {
          if (actionCallback) actionCallback();
        }, DURATION);
      } else {
        if (actionCallback) actionCallback();
      }
    },
    [closing]
  );

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        handleClose(onCancel);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleClose, onCancel]);

  return (
    <div data-confirm-modal="true">
      <div
        ref={overlayRef}
        data-confirm-modal="true"
        className="confirm-modal-overlay fixed inset-0 z-[100] bg-slate-950/60 dark:bg-slate-950/75 backdrop-blur-md opacity-0 invisible transition-all duration-350 ease-[cubic-bezier(.32,.72,0,1)] [&.visible]:opacity-100 [&.visible]:visible"
        onClick={() => handleClose(onCancel)}
      />
      <div
        ref={panelRef}
        data-confirm-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="confirm-modal-panel fixed z-[101] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[26px] overflow-hidden opacity-0 pointer-events-none flex items-center justify-center shadow-[0_30px_70px_-20px_rgba(15,20,28,0.4)] [&.visible]:pointer-events-auto"
      >
        <div ref={contentRef} className="shrink-0 origin-center">
          <div
            className={`p-7 sm:p-8 text-center transition-opacity duration-220 ease-[cubic-bezier(.32,.72,0,1)] ${
              contentIn ? "opacity-100 delay-140" : "opacity-0"
            }`}
          >
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                danger
                  ? "bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400"
                  : "bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400"
              }`}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m-9 0 1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h2 className="font-bold text-lg sm:text-xl text-slate-900 dark:text-white mb-2.5">
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6 max-w-xs mx-auto">
              {message}
            </p>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                data-confirm-modal="true"
                onClick={() => handleClose(onCancel)}
                className="flex-1 px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs sm:text-sm border border-slate-200/80 dark:border-slate-700/80 transition-transform active:scale-95 cursor-pointer"
              >
                {cancelText}
              </button>
              <button
                type="button"
                data-confirm-modal="true"
                onClick={() => handleClose(onConfirm)}
                className={`flex-1 px-4 py-3 rounded-xl text-white font-bold text-xs sm:text-sm transition-transform active:scale-95 shadow-md cursor-pointer ${
                  danger
                    ? "bg-rose-600 hover:bg-rose-700 active:bg-rose-800 shadow-rose-600/20"
                    : "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-indigo-600/20"
                }`}
              >
                {confirmText}
              </button>
            </div>
          </div>
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
        {Icon && (
          isValidElement(Icon) ? (
            Icon
          ) : (
            <Icon size={26} className="text-slate-400" />
          )
        )}
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
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5 pt-0.5">
        {WEEK_DAYS.map((d) => {
          const isSelected = value.includes(d);
          return (
            <button
              key={d}
              type="button"
              onClick={() => toggle(d)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                isSelected
                  ? "bg-indigo-600 text-white border border-indigo-600 shadow-xs"
                  : "bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
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

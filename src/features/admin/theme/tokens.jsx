import { useTheme } from './ThemeContext';

export const GLASS = "bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-sm dark:shadow-none transition-colors";
export const GLASS_SOFT = "bg-slate-50 dark:bg-[#1E293B]/70 border border-slate-200/80 dark:border-slate-800 transition-colors";
export const INPUT_CLS = "w-full bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm";
export const LABEL_CLS = "block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide";
export const BTN_PRIMARY = "bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl px-4 py-2 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-indigo-500/20 cursor-pointer";
export const BTN_SECONDARY = "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-xl px-4 py-2 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer";
export const BTN_DANGER = "bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-semibold rounded-xl px-4 py-2 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm shadow-md shadow-rose-500/20 cursor-pointer";
export const BTN_PRIMARY_BASE = "bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl px-4 py-2 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 hover:brightness-110 shadow-md shadow-indigo-500/20 cursor-pointer";
export const BTN_EXCEL = "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:via-teal-500 hover:to-emerald-500 text-white font-semibold rounded-xl px-4 py-2 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 shadow-md shadow-emerald-500/20 cursor-pointer";
export const BTN_GHOST = "bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white rounded-xl px-4 py-2 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer";
export const BTN_ICON = "w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-all text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white shrink-0 cursor-pointer";
export const PAGE_BG_STYLE = { background: '#f8fafc' };

export { ExcelButton, ExcelActionsModal } from '../components/ExcelActionsModal';

export function PrimaryButton({ children, className = '', style, ...props }) {
  const theme = useTheme();
  const defaultBg = style?.background || style?.bg
    ? style
    : { background: `linear-gradient(135deg, ${theme?.accent1 || '#2563eb'} 0%, ${theme?.accent2 || '#6366f1'} 100%)`, ...style };

  return (
    <button
      {...props}
      className={`${BTN_PRIMARY_BASE} ${className}`}
      style={defaultBg}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, className = '', ...props }) {
  return (
    <button
      {...props}
      className={`${BTN_SECONDARY} ${className}`}
    >
      {children}
    </button>
  );
}

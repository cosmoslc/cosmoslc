import { useTheme } from './ThemeContext';

export const GLASS = "bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-sm dark:shadow-none transition-colors";
export const GLASS_SOFT = "bg-slate-50 dark:bg-[#1E293B]/70 border border-slate-200/80 dark:border-slate-800 transition-colors";
export const INPUT_CLS = "w-full bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm";
export const LABEL_CLS = "block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide";
export const BTN_PRIMARY = "bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl px-4 py-2.5 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shadow-blue-500/20";
export const BTN_SECONDARY = "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-xl px-4 py-2.5 transition-all text-sm flex items-center justify-center gap-2";
export const BTN_DANGER = "bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-xl px-4 py-2.5 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm shadow-sm shadow-rose-500/20";
export const BTN_PRIMARY_BASE = "text-white font-medium rounded-xl px-4 py-2.5 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 hover:brightness-110";
export const BTN_GHOST = "bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white rounded-xl px-4 py-2.5 transition-all text-sm flex items-center justify-center gap-2";
export const BTN_ICON = "w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-all text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white shrink-0";
export const PAGE_BG_STYLE = { background: '#f8fafc' };

export function PrimaryButton({ children, className = '', ...props }) {
  const theme = useTheme();
  return <button {...props} className={`${BTN_PRIMARY_BASE} ${className}`} style={{ background: theme.accent1 }}>{children}</button>;
}

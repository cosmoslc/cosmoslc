import {
  Home,
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  AlertCircle,
  GraduationCap,
  BookOpen,
  ClipboardList,
  Wallet,
  PartyPopper,
  Bell,
  Settings,
  Banknote,
  Coins,
  UserCheck,
  BarChart3,
  TrendingUp,
  Bot,
  CheckCheck,
  Archive,
  ShieldCheck,
  UserCircle2,
  Sparkles,
  Layers,
  PieChart,
  DollarSign,
  Receipt,
  FileText,
  CalendarCheck,
  Sliders,
} from "lucide-react";

export {
  WEEK_DAYS,
  MONTHS_UZ,
  JS_DAY_NAMES,
} from "../../../shared/constants/calendar";

export const DIRECTOR_SESSION_KEY = "director-session-v1";
export const MANAGER_SESSION_KEY = "manager-session-v1";

// Barcha sahifalar to'liq ro'yxati (Kategoriya va ruxsatlar bo'yicha)
export const ALL_NAV_PAGES = [
  // 1. Asosiy
  { id: "workbench", label: "Bugungi ish stoli", icon: Home, group: "core" },
  { id: "home", label: "Dashboard", icon: LayoutDashboard, group: "core" },

  // 2. Lidlar
  { id: "leads", label: "Lidlar bo'limi", icon: UserCheck, group: "leads" },
  { id: "leadsLost", label: "Ketgan lidlar", icon: AlertCircle, group: "leads" },
  { id: "leadsAnalytics", label: "Lidlar analitikasi", icon: TrendingUp, group: "leads" },
  { id: "leadsForm", label: "Lidlar formasi", icon: Sparkles, group: "leads" },
  { id: "leadsSettings", label: "Lid formasi sozlamalari", icon: Sliders, group: "leads" },

  // 3. Analitika
  { id: "analytics", label: "Markaz analitikasi", icon: BarChart3, group: "analytics" },
  { id: "branchAnalytics", label: "Filiallar analitikasi", icon: TrendingUp, group: "analytics" },

  // 4. Boshqaruv
  { id: "branches", label: "Filiallar", icon: Building2, group: "management" },
  { id: "managers", label: "Menejerlar", icon: Users, group: "management" },
  { id: "employeeAttendance", label: "Xodimlar davomati", icon: UserCheck, group: "management" },
  { id: "approvals", label: "Tasdiqlar (So'rovlar)", icon: CheckCheck, group: "management" },

  // 5. O'quv jarayoni
  { id: "groups", label: "Guruhlar", icon: ClipboardList, group: "academic" },
  { id: "students", label: "O'quvchilar", icon: Users, group: "academic" },
  { id: "teachers", label: "O'qituvchilar (HR)", icon: GraduationCap, group: "academic" },
  { id: "attendance", label: "Davomat", icon: CalendarCheck, group: "academic" },
  { id: "courses", label: "Kurslar", icon: BookOpen, group: "academic" },
  { id: "rooms", label: "Xonalar", icon: Layers, group: "academic" },

  // 6. Moliya & To'lovlar
  { id: "payments", label: "To'lovlar", icon: CreditCard, group: "finance" },
  { id: "debtors", label: "Qarzdorlar", icon: AlertCircle, group: "finance" },
  { id: "paymentTypes", label: "To'lov turlari", icon: CreditCard, group: "finance" },
  { id: "expenses", label: "Xarajatlar", icon: Wallet, group: "finance" },
  { id: "finance", label: "Moliya balansi", icon: Wallet, group: "finance" },
  { id: "breakEven", label: "Break-Even tahlili", icon: PieChart, group: "finance" },
  { id: "coins", label: "Coin tizimi", icon: Coins, group: "finance" },

  // 7. Ilovalar
  { id: "holidays", label: "Dam olish kunlari", icon: PartyPopper, group: "apps" },
  { id: "archive", label: "Tizim arxivi", icon: Archive, group: "apps" },

  // 8. Sozlamalar
  { id: "settings", label: "Markaz sozlamalari", icon: Settings, group: "settings" },
  { id: "profile", label: "Mening profilim", icon: UserCircle2, group: "settings" },
  { id: "security", label: "Xavfsizlik", icon: ShieldCheck, group: "settings" },
  { id: "notifications", label: "Bildirishnomalar", icon: Bell, group: "settings" },
];

export const ALL_PAGE_IDS = ALL_NAV_PAGES.map((p) => p.id);

// Default Menejer sahifalari (agar allowedPages belgilanmagan bo'lsa)
export const DEFAULT_MANAGER_PAGES = [
  "workbench",
  "home",
  "leads",
  "leadsLost",
  "leadsAnalytics",
  "leadsForm",
  "groups",
  "students",
  "teachers",
  "attendance",
  "courses",
  "rooms",
  "payments",
  "debtors",
  "paymentTypes",
  "finance",
  "breakEven",
  "employeeAttendance",
  "coins",
  "holidays",
  "archive",
  "settings",
  "notifications",
];

// Menejer ruxsatlar modali uchun guruhlangan sahifalar
export const NAV_GROUPS_CONFIG = [
  {
    key: "core",
    label: "Asosiy boshqaruv",
    items: [
      { id: "workbench", label: "Bugungi ish stoli", icon: Home },
      { id: "home", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    key: "leads",
    label: "Lidlar (CRM)",
    icon: UserCheck,
    items: [
      { id: "leads", label: "Lidlar bo'limi", icon: UserCheck },
      { id: "leadsLost", label: "Ketgan lidlar", icon: AlertCircle },
      { id: "leadsAnalytics", label: "Lidlar analitikasi", icon: TrendingUp },
      { id: "leadsForm", label: "Lidlar formasi", icon: Sparkles },
      { id: "leadsSettings", label: "Lid formasi sozlamalari", icon: Sliders },
    ],
  },
  {
    key: "analytics",
    label: "Analitika & Hisobotlar",
    icon: BarChart3,
    items: [
      { id: "analytics", label: "Markaz analitikasi", icon: BarChart3 },
      { id: "branchAnalytics", label: "Filiallar analitikasi", icon: TrendingUp },
    ],
  },
  {
    key: "management",
    label: "Boshqaruv & Filiallar",
    icon: Building2,
    items: [
      { id: "branches", label: "Filiallar", icon: Building2 },
      { id: "managers", label: "Menejerlar", icon: Users },
      { id: "employeeAttendance", label: "Xodimlar davomati", icon: UserCheck },
      { id: "approvals", label: "Tasdiqlar (So'rovlar)", icon: CheckCheck },
    ],
  },
  {
    key: "academic",
    label: "O'quv jarayoni",
    icon: GraduationCap,
    items: [
      { id: "groups", label: "Guruhlar", icon: ClipboardList },
      { id: "students", label: "O'quvchilar", icon: Users },
      { id: "teachers", label: "O'qituvchilar (HR)", icon: GraduationCap },
      { id: "attendance", label: "Davomat", icon: CalendarCheck },
      { id: "courses", label: "Kurslar", icon: BookOpen },
      { id: "rooms", label: "Xonalar", icon: Layers },
    ],
  },
  {
    key: "finance",
    label: "Moliya & To'lovlar",
    icon: CreditCard,
    items: [
      { id: "payments", label: "To'lovlar jurnali", icon: CreditCard },
      { id: "debtors", label: "Qarzdorlar", icon: AlertCircle },
      { id: "paymentTypes", label: "To'lov turlari", icon: CreditCard },
      { id: "expenses", label: "Xarajatlar", icon: Wallet },
      { id: "finance", label: "Moliya balansi", icon: Wallet },
      { id: "breakEven", label: "Break-Even tahlili", icon: PieChart },
      { id: "coins", label: "Coin tizimi", icon: Coins },
    ],
  },
  {
    key: "apps",
    label: "Ilovalar & Integratsiyalar",
    icon: Bot,
    items: [
      { id: "holidays", label: "Dam olish kunlari", icon: PartyPopper },
      { id: "archive", label: "Tizim arxivi", icon: Archive },
    ],
  },
  {
    key: "settings",
    label: "Sozlamalar & Profil",
    icon: Settings,
    items: [
      { id: "settings", label: "Markaz sozlamalari", icon: Settings },
      { id: "profile", label: "Profil", icon: UserCircle2 },
      { id: "security", label: "Xavfsizlik", icon: ShieldCheck },
      { id: "notifications", label: "Bildirishnomalar", icon: Bell },
    ],
  },
];

export const MANAGER_NAV_ALL = ALL_NAV_PAGES;
export const DIRECTOR_NAV = ALL_NAV_PAGES;

export const NAV_ICON_COLORS = {
  workbench: "#006aff",
  home: "#4a90e2",
  leads: "#8b5cf6",
  leadsLost: "#e11d48",
  leadsAnalytics: "#0284c7",
  leadsForm: "#10b981",
  analytics: "#5b8def",
  branchAnalytics: "#6d5efc",
  branches: "#e74c6f",
  managers: "#8e44ad",
  payments: "#27ae60",
  debtors: "#e11d48",
  paymentTypes: "#059669",
  expenses: "#f39c12",
  approvals: "#22c55e",
  groups: "#f97316",
  students: "#0ea5e9",
  teachers: "#7c3aed",
  attendance: "#059669",
  courses: "#f97316",
  rooms: "#006aff",
  finance: "#16a085",
  breakEven: "#7c3aed",
  holidays: "#ff6b81",
  employeeAttendance: "#1abc9c",
  coins: "#f1c40f",
  archive: "#64748b",
  security: "#ef4444",
  profile: "#8b5cf6",
  centerSettings: "#7f8c8d",
  settings: "#db2777",
  notifications: "#00bcd4",
};

export const MONEY_COLORS = {
  income: "#16A34A",
  incomeSoft: "#F0FDF4",
  incomeBorder: "#BBF7D0",
  expense: "#DC2626",
  expenseSoft: "#FEF2F2",
  expenseBorder: "#FECACA",
  warning: "#D97706",
  warningSoft: "#FFFBEB",
  warningBorder: "#FDE68A",
};

export { EXPENSE_CATEGORIES } from "../../../shared/constants/finance";
export const PAYMENT_METHODS = [
  { id: "cash", label: "Naqd", icon: Banknote },
  { id: "card", label: "Plastik", icon: CreditCard },
];
export { GROUP_COLORS, nextGroupColor } from "../../../shared/constants/colors";
export { LEAD_STATUSES } from "../../../shared/constants/finance";

export const ATTENDANCE_STATUSES = [
  { id: "present", label: "Bor", dot: "bg-green-500" },
  { id: "late", label: "Kech", dot: "bg-amber-500" },
  { id: "excused", label: "Sababli", dot: "bg-sky-500" },
  { id: "absent", label: "Yo'q", dot: "bg-red-500" },
];

import {
  Users,
  Trophy,
  ClipboardList,
  Calendar,
  User,
  Wallet,
  BarChart3,
} from "lucide-react";

export {
  WEEK_DAYS,
  MONTHS_UZ,
  JS_DAY_NAMES,
} from "../../../shared/constants/calendar";
export { GROUP_COLORS, nextGroupColor } from "../../../shared/constants/colors";

export const TEACHER_SESSION_KEY = "teacher-session-v1";

export const NAV_ITEMS = [
  { id: "dashboard", label: "Guruhlarim", icon: Users },
  { id: "rating", label: "Reyting", icon: Trophy },
  { id: "tasks", label: "Faoliyat", icon: ClipboardList },
  { id: "schedule", label: "Dars jadvali", icon: Calendar },
  { id: "analytics", label: "Analitika", icon: BarChart3 },
  { id: "payments", label: "To'lovlar", icon: Wallet },
  { id: "profile", label: "Profil", icon: User },
];

export const NAV_ICON_COLORS = {
  dashboard: "#006aff",
  rating: "#eab308",
  tasks: "#f97316",
  schedule: "#7c3aed",
  analytics: "#006aff",
  payments: "#059669",
  profile: "#db2777",
};

export const ATTENDANCE_STATUSES = [
  {
    id: "present",
    label: "Bor",
    on: "bg-emerald-50 border-emerald-200 text-emerald-700",
  },
  {
    id: "late",
    label: "Kech",
    on: "bg-amber-50 border-amber-200 text-amber-700",
  },
  {
    id: "excused",
    label: "Sababli",
    on: "bg-sky-50 border-sky-200 text-sky-700",
  },
  {
    id: "absent",
    label: "Yo'q",
    on: "bg-rose-50 border-rose-200 text-rose-700",
  },
];

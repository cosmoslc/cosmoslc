import {
  Home,
  ClipboardList,
  Trophy,
  Calendar,
  User,
  Users,
  Wallet,
  BarChart3,
} from "lucide-react";

export const STUDENT_NAV_ITEMS = [
  { id: "home", label: "Bosh sahifa", icon: Home },
  { id: "tasks", label: "Vazifalar", icon: ClipboardList },
  { id: "rating", label: "Reyting", icon: Trophy },
  { id: "schedule", label: "Dars jadvali", icon: Calendar },
  { id: "profile", label: "Profil", icon: User },
];

export { WEEK_DAYS, MONTHS_UZ, JS_DAY_NAMES } from "../../../shared/constants/calendar";
export { GROUP_COLORS, nextGroupColor } from "../../../shared/constants/colors";


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
  dashboard: "#4a90e2",
  rating: "#f1c40f",
  tasks: "#e67e22",
  schedule: "#9b59b6",
  analytics: "#2980b9",
  payments: "#27ae60",
  profile: "#7f8c8d",
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

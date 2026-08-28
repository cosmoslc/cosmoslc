import {
  Users,
  Wallet,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  GraduationCap,
  PartyPopper,
  AlertTriangle,
  CreditCard,
  BookOpen,
  ClipboardList,
  Building2,
  Armchair,
  Bell,
  Home,
  School,
  DoorOpen,
  Sparkles,
  Trophy,
  Loader2,
  X,
  Star,
  Moon,
  Sun,
  Palette,
  EyeOff,
  Eye,
  LogIn,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Percent,
  Check,
  XCircle,
  Banknote,
  Zap,
  Megaphone,
  Wrench,
  Library,
  Bookmark,
  UserPlus,
  Search,
  LineChart,
  PieChart,
  Coins,
  Settings,
} from "lucide-react";
import { money } from "../utils/helpers";

export const ICON_COMPONENTS = {
  users: "fa-solid fa-users",
  "user-plus": "fa-solid fa-user-plus",
  search: "fa-solid fa-magnifying-glass",
  "sack-dollar": "fa-solid fa-sack-dollar",
  "check-circle": "fa-solid fa-circle-check",
  "chart-line-down": "fa-solid fa-chart-line",
  "chart-line-up": "fa-solid fa-chart-line",
  "graduation-cap": "fa-solid fa-graduation-cap",
  "party-horn": "fa-solid fa-gift",
  "triangle-warning": "fa-solid fa-triangle-exclamation",
  "credit-card": "fa-solid fa-credit-card",
  book: "fa-solid fa-book",
  "clipboard-list": "fa-solid fa-clipboard-list",
  building: "fa-solid fa-building",
  chair: "fa-solid fa-chair",
  bell: "fa-solid fa-bell",
  house: "fa-solid fa-house",
  school: "fa-solid fa-school",
  "door-open": "fa-solid fa-door-open",
  sparkles: Sparkles,
  trophy: "fa-solid fa-trophy",
  spinner: "fa-solid fa-spinner",
  "cross-small": "fa-solid fa-xmark",
  star: "fa-solid fa-star",
  moon: "fa-solid fa-moon",
  sun: "fa-solid fa-sun",
  palette: "fa-solid fa-palette",
  "eye-crossed": "fa-solid fa-eye-slash",
  eye: "fa-solid fa-eye",
  "sign-in-alt": "fa-solid  fa-right-to-bracket",
  "sign-out-alt": "fa-solid fa-right-from-bracket",
  plus: "fa-solid fa-plus",
  pen: "fa-solid fa-pen",
  trash: "fa-solid fa-trash",
  wallet: "fa-solid fa-wallet",
  percentage: "fa-solid fa-percent",
  check: "fa-solid fa-check",
  "cross-circle": "fa-solid fa-circle-xmark",
  "money-bill": "fa-solid fa-money-bill",
  "money-bill-wave": "fa-solid fa-money-bill-wave",
  bolt: "fa-solid fa-bolt",
  megaphone: "fa-solid fa-bullhorn",
  tools: "fa-solid fa-tools",
  books: "fa-solid fa-book-open",
  bookmark: "fa-solid fa-bookmark",
  "chart-line": "fa-solid fa-chart-line",
  "chart-pie": "fa-solid fa-chart-pie",
  coins: "fa-solid fa-coins",
  settings: "fa-solid fa-gear",
  menu: "fa-solid fa-bars",
  snowflake: "fa-solid fa-snowflake",
};

export function Icon({
  name,
  size = 16,
  className = "",
  style,
  variant,
  bg,
  withBg = false,
  wrapperClassName = "",
}) {
  const Cmp = ICON_COMPONENTS[name] || Bookmark;
  // If caller requests a background/variant, render a wrapper with our utility classes
  const useBg = withBg || !!variant || !!bg;
  // If the mapping is a string, treat it as a Font Awesome class and render an <i>
  const isFA = typeof Cmp === "string";
  if (!useBg) {
    if (isFA) {
      return (
        <i
          className={`${Cmp} ${className || ""}`}
          style={{ ...(style || {}), fontSize: size }}
          aria-hidden="true"
        />
      );
    }
    return (
      <Cmp
        size={size}
        className={className}
        style={style}
        fill="currentColor"
        strokeWidth={1.25}
      />
    );
  }

  const variantClass = variant ? `icon-bg--${variant}` : "";
  // simple wrapper: only set background color when bg provided
  const wrapperStyle = !variant && bg ? { backgroundColor: bg } : undefined;

  return (
    <div
      className={`icon-bg ${variantClass} ${wrapperClassName}`.trim()}
      style={wrapperStyle}
    >
      <div className="svg">
        {isFA ? (
          <i
            className={`${Cmp} ${className || ""}`}
            style={{ ...(style || {}), fontSize: size }}
            aria-hidden="true"
          />
        ) : (
          <Cmp
            size={size}
            className={className}
            style={style}
            fill="currentColor"
            strokeWidth={1.25}
          />
        )}
      </div>
    </div>
  );
}

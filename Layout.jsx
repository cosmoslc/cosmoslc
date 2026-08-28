import { useState, useEffect, isValidElement } from "react";
import {
  LogOut,
  Menu,
  Moon,
  Sun,
  Maximize2,
  Minimize2,
  ChevronDown,
  Home,
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  UserCheck,
  BarChart3,
  Bot,
  PartyPopper,
  Archive,
  ShieldCheck,
  UserCircle2,
  Settings,
  Bell,
  Sparkles,
  Coins,
  GraduationCap,
  CalendarCheck,
  BookOpen,
  ClipboardList,
  Layers,
  PieChart,
  X,
  Check,
  Globe,
} from "lucide-react";

function BranchSelector({
  scopeBranches = [],
  currentBranchId = "all",
  onSelectBranch,
  directorData,
}) {
  const [open, setOpen] = useState(false);

  const branches =
    scopeBranches && scopeBranches.length > 0
      ? scopeBranches
      : directorData?.branches && directorData.branches.length > 0
      ? directorData.branches
      : [];

  const currentBranch = branches.find((b) => b.id === currentBranchId);
  const currentLabel =
    currentBranchId === "all" || !currentBranch
      ? "Barcha filiallar"
      : currentBranch.name;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="h-[38px] px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800 transition-all flex items-center gap-2 shadow-2xs cursor-pointer group"
        title="Filialni tanlash"
      >
        <span
          className="w-5 h-5 rounded-xl flex items-center justify-center text-white text-[10px] font-bold shadow-2xs transition-transform group-hover:scale-105 shrink-0"
          style={{
            background:
              currentBranchId === "all" || !currentBranch
                ? "linear-gradient(135deg, #3f6df6, #6366f1)"
                : currentBranch.color || "#3f6df6",
          }}
        >
          {currentBranchId === "all" || !currentBranch ? (
            <Layers size={12} />
          ) : (
            <Building2 size={12} />
          )}
        </span>
        <span className="truncate max-w-[130px] font-semibold text-slate-700 dark:text-slate-200">
          {currentLabel}
        </span>
        <ChevronDown
          size={14}
          className={`text-slate-400 dark:text-slate-500 transition-transform duration-200 shrink-0 ${
            open ? "rotate-180 text-indigo-600 dark:text-indigo-400" : ""
          }`}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 sm:left-auto sm:right-0 top-11 z-50 w-64 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-1.5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800/80 mb-1 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Filiallar ro'yxati
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 font-semibold">
                {branches.length} ta filial
              </span>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-0.5 pr-0.5 custom-scrollbar">
              <button
                type="button"
                onClick={() => {
                  if (onSelectBranch) onSelectBranch("all");
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left ${
                  currentBranchId === "all"
                    ? "bg-indigo-50/90 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-300 font-semibold"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-bold text-[11px] shadow-2xs">
                    <Globe size={13} />
                  </span>
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-100">
                      Barcha filiallar
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Markaziy umumiy ko'rinish
                    </div>
                  </div>
                </div>
                {currentBranchId === "all" && (
                  <Check size={14} className="text-indigo-600 dark:text-indigo-400" />
                )}
              </button>

              {branches.map((b) => {
                const isSelected = currentBranchId === b.id;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      if (onSelectBranch) onSelectBranch(b.id);
                      setOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left ${
                      isSelected
                        ? "bg-indigo-50/90 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-300 font-semibold"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span
                        className="w-6 h-6 rounded-xl text-white flex items-center justify-center font-bold text-[11px] shadow-2xs shrink-0"
                        style={{ background: b.color || "#3f6df6" }}
                      >
                        <Building2 size={13} />
                      </span>
                      <div className="truncate">
                        <div className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                          {b.name}
                        </div>
                        {b.address && (
                          <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                            {b.address}
                          </div>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <Check size={14} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
import { Avatar } from "../components/primitives";
import { NotificationBell } from "../components/NotificationBell";
import { QuickActionsMenu } from "../components/QuickActionsMenu";
import { SearchBox } from "../components/SearchBox";
import { JS_DAY_NAMES, MONTHS_UZ, NAV_ICON_COLORS, ALL_PAGE_IDS } from "../utils/constants";

export function AppShell({
  children,
  view,
  goTo,
  user,
  role = "director",
  allowedPages = ALL_PAGE_IDS,
  now = new Date(),
  onLogout,
  notifLog = [],
  onClearNotifs,
  onMarkNotifRead,
  onMarkAllNotifsRead,
  onQuickAction,
  scopeBranches = [],
  currentBranchId = "all",
  onSelectBranch,
  directorData,
  opData,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved) return saved === "dark";
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSimulatedFs, setIsSimulatedFs] = useState(false);

  useEffect(() => {
    function handleFsChange() {
      const activeFs = !!document.fullscreenElement;
      setIsFullscreen(activeFs);
      if (!activeFs) {
        setIsSimulatedFs(false);
      }
    }
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  // Accordion state for sub-menus
  const [openMenus, setOpenMenus] = useState({
    finance: true,
    reports: true,
    financialReports: true,
    settings: true,
    office: true,
    academic: true,
    sms: false,
    forms: false,
  });

  const [pinnedFlyout, setPinnedFlyout] = useState(null);

  const toggleMenu = (key) => {
    if (collapsed) {
      setPinnedFlyout((prev) => (prev === key ? null : key));
    } else {
      setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));
    }
  };

  const handleNavigate = (pageId) => {
    goTo(pageId);
    setMobileOpen(false);
    setPinnedFlyout(null);
  };

  useEffect(() => {
    if (!pinnedFlyout) return;
    const handleClickOutside = (e) => {
      if (!e.target.closest(".app-sidebar")) {
        setPinnedFlyout(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [pinnedFlyout]);

  // Auto-expand menu if active item is inside it
  useEffect(() => {
    if (["payments", "additionalIncome", "salaries", "expenses", "debtors"].includes(view)) {
      setOpenMenus((prev) => ({ ...prev, finance: true }));
    } else if (
      [
        "reportCourse",
        "reportTeacherPerformance",
        "reportCashflow",
        "reportSalaries",
        "reportDiscounts",
        "reportSmsSent",
        "reportWorkTime",
        "reportJournals",
        "reportCoins",
        "reportPoints",
        "reportExams",
        "reportLeads",
        "reportGroupRemoved",
        "reportAttendance",
      ].includes(view)
    ) {
      setOpenMenus((prev) => ({ ...prev, reports: true }));
      if (["reportCourse", "reportTeacherPerformance", "reportCashflow"].includes(view)) {
        setOpenMenus((prev) => ({ ...prev, financialReports: true }));
      }
    } else if (["centerSettings", "branches", "positions", "managers", "rooms", "holidays", "receiptSettings", "courses", "reasons", "placementTest", "points", "examTemplates", "smsBuy", "autoSms", "smsTemplates", "simpleForm", "teacherForm", "staffForm", "referralForm", "tags", "paymentTypes"].includes(view)) {
      setOpenMenus((prev) => ({ ...prev, settings: true }));
      if (["branches", "positions", "managers", "rooms", "holidays", "receiptSettings"].includes(view)) {
        setOpenMenus((prev) => ({ ...prev, office: true }));
      } else if (["courses", "reasons", "placementTest", "points", "examTemplates"].includes(view)) {
        setOpenMenus((prev) => ({ ...prev, academic: true }));
      } else if (["smsBuy", "autoSms", "smsTemplates"].includes(view)) {
        setOpenMenus((prev) => ({ ...prev, sms: true }));
      } else if (["simpleForm", "teacherForm", "staffForm", "referralForm"].includes(view)) {
        setOpenMenus((prev) => ({ ...prev, forms: true }));
      }
    }
  }, [view]);

  function toggleDark() {
    setIsDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      return next;
    });
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
      setIsSimulatedFs(false);
    } else if (isSimulatedFs) {
      setIsSimulatedFs(false);
      setIsFullscreen(false);
    } else {
      if (document.documentElement.requestFullscreen) {
        document.documentElement
          .requestFullscreen()
          .then(() => setIsFullscreen(true))
          .catch(() => {
            setIsSimulatedFs(true);
            setIsFullscreen(true);
          });
      } else {
        setIsSimulatedFs(true);
        setIsFullscreen(true);
      }
    }
  }

  // Check if a specific page ID is allowed for the user
  const isAllowed = (pageId) => {
    if (role === "director") return true;
    return allowedPages.includes(pageId);
  };

  // Group items filtering
  const canShowGroup = (pageIds) => pageIds.some((id) => isAllowed(id));

  // Current user info
  const displayName = user?.name || (role === "director" ? "Bosh Direktor" : "Menejer");
  const displayRoleLabel = role === "director" ? "Boshqaruvchi" : "Filial menejeri";
  const centerName = user?.centerName || directorData?.centerSettings?.name || "COSMOS LC";

  return (
    <div
      className={`app-shell ${isDark ? "dark" : ""} ${
        isSimulatedFs ? "fixed inset-0 z-[99999] overflow-auto bg-slate-100 dark:bg-slate-900" : ""
      }`}
    >
      {/* Top Accent Line */}
      <div className="top-accent" />

      {/* ======================= TOPBAR ======================= */}
      <header className="app-topbar">
        {/* Brand Block */}
        <div className={`brand-block ${collapsed ? "collapsed" : ""}`}>
          <div className="brand-mark">
            <img
              src="/assets/cosmo_symbol.svg"
              alt="COSMOS"
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.src = "/assets/cosmo_logo.svg";
              }}
            />
          </div>
          {!collapsed && (
            <div className="brand-text">
              <div className="brand-name">{centerName}</div>
              <div className="brand-sub">
                {role === "director" ? "DIREKTOR KABINETI" : "MENEJER KABINETI"}
              </div>
            </div>
          )}
        </div>

        {/* Topbar Main */}
        <div className="topbar-main">
          {/* Collapse/Expand Sidebar Toggle */}
          <button
            id="sidebar-toggle-btn"
            onClick={() => {
              if (typeof window !== "undefined" && window.innerWidth < 900) {
                setMobileOpen((m) => !m);
              } else {
                setCollapsed((c) => !c);
              }
            }}
            className="icon-btn"
            title="Yon menyuni ochish/yopish"
            aria-label="Toggle sidebar"
          >
            <Menu size={18} />
          </button>

          {/* Branch Selector */}
          {onSelectBranch && (
            <BranchSelector
              scopeBranches={scopeBranches}
              currentBranchId={currentBranchId}
              onSelectBranch={onSelectBranch}
              directorData={directorData}
            />
          )}

          {/* Global Search */}
          <div className="hidden md:block">
            <SearchBox
              scopeBranches={scopeBranches}
              directorData={directorData}
              opData={opData}
              goTo={goTo}
            />
          </div>

          {/* Right Action Controls */}
          <div className="topbar-right flex items-center gap-1.5 sm:gap-2">
            {/* Quick Actions Menu */}
            {onQuickAction && <QuickActionsMenu onAction={onQuickAction} />}


            {/* Dark/Light Mode Toggle */}
            <button
              onClick={toggleDark}
              className="icon-btn"
              title={isDark ? "Yorug' rejim" : "Tungi rejim"}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="icon-btn hidden sm:flex"
              title={isFullscreen ? "To'liq ekrandan chiqish" : "To'liq ekran"}
              aria-label="Toggle fullscreen"
            >
              {isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
            </button>

            {/* Notifications Bell */}
            <NotificationBell
              notifLog={notifLog}
              onClear={onClearNotifs}
              onMarkRead={onMarkNotifRead}
              onMarkAllRead={onMarkAllNotifsRead}
            />

            {/* User Profile Pill */}
            <div className="relative">
              <div
                className="profile-chip"
                onClick={() => setProfileOpen((p) => !p)}
              >
                <div className="avatar-mark">
                  {user?.photo ? (
                    <img
                      src={user.photo}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{displayName.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="profile-info hidden sm:block">
                  <div className="name truncate max-w-[120px]">{displayName}</div>
                  <div className="role truncate max-w-[120px]">{displayRoleLabel}</div>
                </div>
              </div>

              {/* Profile Dropdown Popup */}
              {profileOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileOpen(false)}
                  />
                  <div className="absolute right-0 top-12 z-50 w-60 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800 mb-1">
                      <p className="font-semibold text-slate-900 dark:text-white text-xs truncate">
                        {displayName}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {displayRoleLabel}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        goTo("profile");
                        setProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-left"
                    >
                      <UserCircle2 size={15} className="text-slate-400" />
                      Mening profilim
                    </button>

                    <button
                      onClick={() => {
                        goTo(role === "director" ? "centerSettings" : "settings");
                        setProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-left"
                    >
                      <Settings size={15} className="text-slate-400" />
                      Sozlamalar
                    </button>

                    <button
                      onClick={() => {
                        goTo("security");
                        setProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-left"
                    >
                      <ShieldCheck size={15} className="text-slate-400" />
                      Xavfsizlik
                    </button>

                    <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                    <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Portallarga o'tish
                    </div>

                    <a
                      href="/teacher.html"
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all text-left no-underline"
                    >
                      <BookOpen size={15} />
                      Ustoz Kabineti
                    </a>

                    <a
                      href="/student.html"
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-all text-left no-underline"
                    >
                      <GraduationCap size={15} />
                      O'quvchi Portali
                    </a>

                    <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all text-left"
                    >
                      <LogOut size={15} />
                      Chiqish
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ======================= BODY (SIDEBAR + MAIN) ======================= */}
      <div className="app-body">
        {/* Mobile sidebar backdrop overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`app-sidebar ${collapsed ? "collapsed" : ""} ${
            mobileOpen ? "mobile-open" : ""
          }`}
        >
          {/* Mobile close button */}
          <div className="flex md:hidden items-center justify-between pb-3 mb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <img src="/assets/cosmo_symbol.svg" alt="COSMOS" className="w-7 h-7" />
              <span className="font-bold text-sm text-slate-900 dark:text-white">{centerName}</span>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X size={18} />
            </button>
          </div>

          <ul className="nav-group">
            {/* 1. ASOSIY BO'LIM (ONLY MENUS WITHOUT SUBMENU) */}
            {!collapsed && (
              <li className="nav-divider">
                <span>Asosiy</span>
              </li>
            )}

            {/* Ish stoli */}
            {isAllowed("workbench") && (
              <li>
                <button
                  id="nav-item-workbench"
                  onClick={() => {
                    goTo("workbench");
                    setMobileOpen(false);
                  }}
                  className={`nav-item ${view === "workbench" ? "active" : ""}`}
                  title={collapsed ? "Bugungi ish stoli" : undefined}
                >
                  <span
                    className="ic"
                    style={{ color: NAV_ICON_COLORS.workbench }}
                  >
                    <Home size={18} />
                  </span>
                  <span className="label">Bugungi ish stoli</span>
                </button>
              </li>
            )}

            {/* Dashboard */}
            {isAllowed("home") && (
              <li>
                <button
                  id="nav-item-home"
                  onClick={() => {
                    goTo("home");
                    setMobileOpen(false);
                  }}
                  className={`nav-item ${view === "home" ? "active" : ""}`}
                  title={collapsed ? "Dashboard" : undefined}
                >
                  <span
                    className="ic"
                    style={{ color: NAV_ICON_COLORS.home }}
                  >
                    <LayoutDashboard size={18} />
                  </span>
                  <span className="label">Dashboard</span>
                </button>
              </li>
            )}

            {/* Lidlar (Direct Menu) */}
            {isAllowed("leads") && (
              <li>
                <button
                  id="nav-item-leads"
                  onClick={() => {
                    goTo("leads");
                    setMobileOpen(false);
                  }}
                  className={`nav-item ${view === "leads" ? "active" : ""}`}
                  title={collapsed ? "Lidlar" : undefined}
                >
                  <span
                    className="ic"
                    style={{ color: NAV_ICON_COLORS.leads }}
                  >
                    <UserCheck size={18} />
                  </span>
                  <span className="label">Lidlar</span>
                </button>
              </li>
            )}

            {/* Talabalar / O'quvchilar (Direct Menu) */}
            {isAllowed("students") && (
              <li>
                <button
                  id="nav-item-students"
                  onClick={() => {
                    goTo("students");
                    setMobileOpen(false);
                  }}
                  className={`nav-item ${view === "students" ? "active" : ""}`}
                  title={collapsed ? "Talabalar" : undefined}
                >
                  <span
                    className="ic"
                    style={{ color: NAV_ICON_COLORS.students }}
                  >
                    <GraduationCap size={18} />
                  </span>
                  <span className="label">Talabalar</span>
                </button>
              </li>
            )}

            {/* Guruhlar (Direct Menu) */}
            {isAllowed("groups") && (
              <li>
                <button
                  id="nav-item-groups"
                  onClick={() => {
                    goTo("groups");
                    setMobileOpen(false);
                  }}
                  className={`nav-item ${view === "groups" ? "active" : ""}`}
                  title={collapsed ? "Guruhlar" : undefined}
                >
                  <span
                    className="ic"
                    style={{ color: NAV_ICON_COLORS.groups }}
                  >
                    <Users size={18} />
                  </span>
                  <span className="label">Guruhlar</span>
                </button>
              </li>
            )}

            {/* O'qituvchilar (Direct Menu) */}
            {isAllowed("teachers") && (
              <li>
                <button
                  id="nav-item-teachers"
                  onClick={() => {
                    goTo("teachers");
                    setMobileOpen(false);
                  }}
                  className={`nav-item ${view === "teachers" ? "active" : ""}`}
                  title={collapsed ? "O'qituvchilar" : undefined}
                >
                  <span
                    className="ic"
                    style={{ color: NAV_ICON_COLORS.teachers }}
                  >
                    <UserCircle2 size={18} />
                  </span>
                  <span className="label">O'qituvchilar</span>
                </button>
              </li>
            )}

            {/* Xodimlar davomati (Direct Menu) */}
            {isAllowed("employeeAttendance") && (
              <li>
                <button
                  id="nav-item-employeeAttendance"
                  onClick={() => handleNavigate("employeeAttendance")}
                  className={`nav-item ${view === "employeeAttendance" ? "active" : ""}`}
                  title={collapsed ? "Xodimlar davomati" : undefined}
                >
                  <span
                    className="ic"
                    style={{ color: NAV_ICON_COLORS.employeeAttendance || "#1abc9c" }}
                  >
                    <CalendarCheck size={18} />
                  </span>
                  <span className="label">Xodimlar davomati</span>
                </button>
              </li>
            )}

            {/* 2. MOLIYA BO'LIMI (SUBMENU) */}
            {canShowGroup(["payments", "additionalIncome", "salaries", "expenses", "debtors"]) && (
              <>
                {!collapsed && (
                  <li className="nav-divider">
                    <span>Moliya</span>
                  </li>
                )}
                <li className={`nav-parent-wrapper ${pinnedFlyout === "finance" ? "is-flyout-open" : ""}`}>
                  <div
                    id="nav-parent-finance"
                    onClick={() => toggleMenu("finance")}
                    className={`nav-parent-item ${
                      openMenus.finance || pinnedFlyout === "finance" ? "is-open" : ""
                    } ${
                      ["payments", "additionalIncome", "salaries", "expenses", "debtors"].includes(view)
                        ? "has-active-child"
                        : ""
                    }`}
                    title={collapsed ? "Moliya" : undefined}
                  >
                    <span
                      className="ic"
                      style={{ color: NAV_ICON_COLORS.payments }}
                    >
                      <CreditCard size={18} />
                    </span>
                    <span className="label">Moliya</span>
                    <ChevronDown size={14} className="chev" />
                  </div>
                  {(openMenus.finance || collapsed) && (
                    <ul className="nav-sub-menu">
                      {collapsed && (
                        <li className="px-2 py-1 mb-1 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Moliya
                        </li>
                      )}
                      {isAllowed("payments") && (
                        <li>
                          <button
                            id="nav-sub-payments"
                            onClick={() => handleNavigate("payments")}
                            className={`nav-sub-item ${
                              view === "payments" ? "active" : ""
                            }`}
                          >
                            <span className="sub-dot" />
                            <span>To'lovlar</span>
                          </button>
                        </li>
                      )}
                      {isAllowed("additionalIncome") && (
                        <li>
                          <button
                            id="nav-sub-additionalIncome"
                            onClick={() => handleNavigate("additionalIncome")}
                            className={`nav-sub-item ${
                              view === "additionalIncome" ? "active" : ""
                            }`}
                          >
                            <span className="sub-dot" />
                            <span>Qo'shimcha daromadlar</span>
                          </button>
                        </li>
                      )}
                      {isAllowed("salaries") && (
                        <li>
                          <button
                            id="nav-sub-salaries"
                            onClick={() => handleNavigate("salaries")}
                            className={`nav-sub-item ${
                              view === "salaries" ? "active" : ""
                            }`}
                          >
                            <span className="sub-dot" />
                            <span>Ish haqi</span>
                          </button>
                        </li>
                      )}
                      {isAllowed("expenses") && (
                        <li>
                          <button
                            id="nav-sub-expenses"
                            onClick={() => handleNavigate("expenses")}
                            className={`nav-sub-item ${
                              view === "expenses" ? "active" : ""
                            }`}
                          >
                            <span className="sub-dot" />
                            <span>Xarajatlar</span>
                          </button>
                        </li>
                      )}
                      {isAllowed("debtors") && (
                        <li>
                          <button
                            id="nav-sub-debtors"
                            onClick={() => handleNavigate("debtors")}
                            className={`nav-sub-item ${
                              view === "debtors" ? "active" : ""
                            }`}
                          >
                            <span className="sub-dot" />
                            <span>Qarzdorlar</span>
                          </button>
                        </li>
                      )}
                    </ul>
                  )}
                </li>
              </>
            )}

            {/* 3. HISOBOTLAR BO'LIMI (SUBMENU) */}
            <>
              {!collapsed && (
                <li className="nav-divider">
                  <span>Hisobotlar</span>
                </li>
              )}
              <li className={`nav-parent-wrapper ${pinnedFlyout === "reports" ? "is-flyout-open" : ""}`}>
                <div
                  id="nav-parent-reports"
                  onClick={() => toggleMenu("reports")}
                className={`nav-parent-item ${
                  openMenus.reports || pinnedFlyout === "reports" ? "is-open" : ""
                } ${
                  [
                    "reportCourse",
                    "reportTeacherPerformance",
                    "reportCashflow",
                    "reportSalaries",
                    "reportDiscounts",
                    "reportSmsSent",
                    "reportWorkTime",
                    "reportJournals",
                    "reportCoins",
                    "reportPoints",
                    "reportExams",
                    "reportLeads",
                    "reportGroupRemoved",
                    "reportAttendance",
                  ].includes(view)
                    ? "has-active-child"
                    : ""
                }`}
                title={collapsed ? "Hisobotlar" : undefined}
              >
                <span
                  className="ic"
                  style={{ color: NAV_ICON_COLORS.reports || "#0ea5e9" }}
                >
                  <BarChart3 size={18} />
                </span>
                <span className="label">Hisobotlar</span>
                <ChevronDown size={14} className="chev" />
              </div>

              {(openMenus.reports || collapsed) && (
                <ul className="nav-sub-menu">
                  {collapsed && (
                    <li className="px-2 py-1 mb-1 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Hisobotlar
                    </li>
                  )}
                  {/* Moliyaviy hisobotlar Sub-menu */}
                  <li className="nav-parent-wrapper pl-2 mt-1">
                    <div
                      onClick={() => toggleMenu("financialReports")}
                      className="flex items-center justify-between py-1.5 px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-200"
                    >
                      <span>Moliyaviy hisobotlar</span>
                      <ChevronDown
                        size={12}
                        className={`transition-transform ${
                          openMenus.financialReports ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                    {openMenus.financialReports && (
                      <ul className="pl-3 border-l border-slate-200 dark:border-slate-800 space-y-0.5 mt-1">
                        <li>
                          <button
                            onClick={() => handleNavigate("reportCourse")}
                            className={`nav-sub-item ${
                              view === "reportCourse" ? "active" : ""
                            }`}
                          >
                            <span className="sub-dot" />
                            <span>Kurs hisoboti</span>
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => handleNavigate("reportTeacherPerformance")}
                            className={`nav-sub-item ${
                              view === "reportTeacherPerformance" ? "active" : ""
                            }`}
                          >
                            <span className="sub-dot" />
                            <span>O'qituvchi samaradorligi</span>
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => handleNavigate("reportCashflow")}
                            className={`nav-sub-item ${
                              view === "reportCashflow" ? "active" : ""
                            }`}
                          >
                            <span className="sub-dot" />
                            <span>Pul oqimi</span>
                          </button>
                        </li>
                      </ul>
                    )}
                  </li>

                  {/* Ish haqi hisoboti */}
                  <li>
                    <button
                      onClick={() => handleNavigate("reportSalaries")}
                      className={`nav-sub-item ${
                        view === "reportSalaries" ? "active" : ""
                      }`}
                    >
                      <span className="sub-dot" />
                      <span>Ish haqi hisoboti</span>
                    </button>
                  </li>

                  {/* Chegirma hisoboti */}
                  <li>
                    <button
                      onClick={() => handleNavigate("reportDiscounts")}
                      className={`nav-sub-item ${
                        view === "reportDiscounts" ? "active" : ""
                      }`}
                    >
                      <span className="sub-dot" />
                      <span>Chegirma hisoboti</span>
                    </button>
                  </li>

                  {/* Yuborilgan smslar hisoboti */}
                  <li>
                    <button
                      onClick={() => handleNavigate("reportSmsSent")}
                      className={`nav-sub-item ${
                        view === "reportSmsSent" ? "active" : ""
                      }`}
                    >
                      <span className="sub-dot" />
                      <span>Yuborilgan SMSlar hisoboti</span>
                    </button>
                  </li>

                  {/* Ish vaqti hisoboti */}
                  <li>
                    <button
                      onClick={() => handleNavigate("reportWorkTime")}
                      className={`nav-sub-item ${
                        view === "reportWorkTime" ? "active" : ""
                      }`}
                    >
                      <span className="sub-dot" />
                      <span>Ish vaqti hisoboti</span>
                    </button>
                  </li>

                  {/* Jurnallar */}
                  <li>
                    <button
                      onClick={() => handleNavigate("reportJournals")}
                      className={`nav-sub-item ${
                        view === "reportJournals" ? "active" : ""
                      }`}
                    >
                      <span className="sub-dot" />
                      <span>Jurnallar</span>
                    </button>
                  </li>

                  {/* Tanga hisoboti */}
                  <li>
                    <button
                      onClick={() => handleNavigate("reportCoins")}
                      className={`nav-sub-item ${
                        view === "reportCoins" ? "active" : ""
                      }`}
                    >
                      <span className="sub-dot" />
                      <span>Tanga hisoboti</span>
                    </button>
                  </li>

                  {/* Ballar hisoboti */}
                  <li>
                    <button
                      onClick={() => handleNavigate("reportPoints")}
                      className={`nav-sub-item ${
                        view === "reportPoints" ? "active" : ""
                      }`}
                    >
                      <span className="sub-dot" />
                      <span>Ballar hisoboti</span>
                    </button>
                  </li>

                  {/* Imtihon hisobotlari */}
                  <li>
                    <button
                      onClick={() => handleNavigate("reportExams")}
                      className={`nav-sub-item ${
                        view === "reportExams" ? "active" : ""
                      }`}
                    >
                      <span className="sub-dot" />
                      <span>Imtihon hisobotlari</span>
                    </button>
                  </li>

                  {/* Lidlar hisoboti */}
                  <li>
                    <button
                      onClick={() => handleNavigate("reportLeads")}
                      className={`nav-sub-item ${
                        view === "reportLeads" ? "active" : ""
                      }`}
                    >
                      <span className="sub-dot" />
                      <span>Lidlar hisoboti</span>
                    </button>
                  </li>

                  {/* Guruhdan o'chirilganlar hisoboti */}
                  <li>
                    <button
                      onClick={() => handleNavigate("reportGroupRemoved")}
                      className={`nav-sub-item ${
                        view === "reportGroupRemoved" ? "active" : ""
                      }`}
                    >
                      <span className="sub-dot" />
                      <span>Guruhdan o'chirilganlar hisoboti</span>
                    </button>
                  </li>

                  {/* Davomat hisobotlari */}
                  <li>
                    <button
                      onClick={() => handleNavigate("reportAttendance")}
                      className={`nav-sub-item ${
                        view === "reportAttendance" ? "active" : ""
                      }`}
                    >
                      <span className="sub-dot" />
                      <span>Davomat hisobotlari</span>
                    </button>
                  </li>
                </ul>
              )}
            </li>
          </>

            {/* 4. ARXIV BO'LIMI (SUBMENU) */}
            {isAllowed("archive") && (
              <>
                {!collapsed && (
                  <li className="nav-divider">
                    <span>Arxiv</span>
                  </li>
                )}
                <li className={`nav-parent-wrapper ${pinnedFlyout === "archive" ? "is-flyout-open" : ""}`}>
                  <div
                    id="nav-parent-archive"
                    onClick={() => toggleMenu("archive")}
                  className={`nav-parent-item ${
                    openMenus.archive || pinnedFlyout === "archive" ? "is-open" : ""
                  } ${
                    [
                      "archive",
                      "archiveLeads",
                      "archiveStudents",
                      "archiveTeachers",
                      "archiveStaff",
                      "archiveGroups",
                      "archivePayments",
                      "archiveSalaries",
                      "archiveExpenses",
                      "archiveAdditionalIncome",
                      "archiveBonuses",
                    ].includes(view)
                      ? "has-active-child"
                      : ""
                  }`}
                  title={collapsed ? "Arxiv" : undefined}
                >
                  <span
                    className="ic"
                    style={{ color: NAV_ICON_COLORS.archive || "#64748b" }}
                  >
                    <Archive size={18} />
                  </span>
                  <span className="label">Arxiv</span>
                  <ChevronDown size={14} className="chev" />
                </div>

                {(openMenus.archive || collapsed) && (
                  <ul className="nav-sub-menu">
                    {collapsed && (
                      <li className="px-2 py-1 mb-1 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Arxiv
                      </li>
                    )}
                    <li>
                      <button
                        id="nav-sub-archiveLeads"
                        onClick={() => handleNavigate("archiveLeads")}
                        className={`nav-sub-item ${
                          view === "archiveLeads" || view === "archive" ? "active" : ""
                        }`}
                      >
                        <span className="sub-dot" />
                        <span>Lidlar</span>
                      </button>
                    </li>
                    <li>
                      <button
                        id="nav-sub-archiveStudents"
                        onClick={() => handleNavigate("archiveStudents")}
                        className={`nav-sub-item ${view === "archiveStudents" ? "active" : ""}`}
                      >
                        <span className="sub-dot" />
                        <span>Talabalar</span>
                      </button>
                    </li>
                    <li>
                      <button
                        id="nav-sub-archiveTeachers"
                        onClick={() => handleNavigate("archiveTeachers")}
                        className={`nav-sub-item ${view === "archiveTeachers" ? "active" : ""}`}
                      >
                        <span className="sub-dot" />
                        <span>O'qituvchilar</span>
                      </button>
                    </li>
                    <li>
                      <button
                        id="nav-sub-archiveStaff"
                        onClick={() => handleNavigate("archiveStaff")}
                        className={`nav-sub-item ${view === "archiveStaff" ? "active" : ""}`}
                      >
                        <span className="sub-dot" />
                        <span>Xodimlar</span>
                      </button>
                    </li>
                    <li>
                      <button
                        id="nav-sub-archiveGroups"
                        onClick={() => handleNavigate("archiveGroups")}
                        className={`nav-sub-item ${view === "archiveGroups" ? "active" : ""}`}
                      >
                        <span className="sub-dot" />
                        <span>Guruhlar</span>
                      </button>
                    </li>

                    {/* Moliya Sub-menu inside Arxiv */}
                    <li className="nav-parent-wrapper pl-1 mt-1">
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenus((prev) => ({ ...prev, archiveFinance: !prev.archiveFinance }));
                        }}
                        className="flex items-center justify-between py-1.5 px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          <CreditCard size={13} />
                          <span>Moliya</span>
                        </div>
                        <ChevronDown
                          size={12}
                          className={`transition-transform ${
                            openMenus.archiveFinance ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                      {(openMenus.archiveFinance || collapsed) && (
                        <ul className="pl-3 border-l border-slate-200 dark:border-slate-800 space-y-0.5 mt-1">
                          <li>
                            <button
                              id="nav-sub-archivePayments"
                              onClick={() => handleNavigate("archivePayments")}
                              className={`nav-sub-item ${view === "archivePayments" ? "active" : ""}`}
                            >
                              <span className="sub-dot" />
                              <span>To'lovlar</span>
                            </button>
                          </li>
                          <li>
                            <button
                              id="nav-sub-archiveSalaries"
                              onClick={() => handleNavigate("archiveSalaries")}
                              className={`nav-sub-item ${view === "archiveSalaries" ? "active" : ""}`}
                            >
                              <span className="sub-dot" />
                              <span>Ish haqi</span>
                            </button>
                          </li>
                          <li>
                            <button
                              id="nav-sub-archiveExpenses"
                              onClick={() => handleNavigate("archiveExpenses")}
                              className={`nav-sub-item ${view === "archiveExpenses" ? "active" : ""}`}
                            >
                              <span className="sub-dot" />
                              <span>Xarajatlar</span>
                            </button>
                          </li>
                          <li>
                            <button
                              id="nav-sub-archiveAdditionalIncome"
                              onClick={() => handleNavigate("archiveAdditionalIncome")}
                              className={`nav-sub-item ${view === "archiveAdditionalIncome" ? "active" : ""}`}
                            >
                              <span className="sub-dot" />
                              <span>Qo'shimcha daromadlar</span>
                            </button>
                          </li>
                          <li>
                            <button
                              id="nav-sub-archiveBonuses"
                              onClick={() => handleNavigate("archiveBonuses")}
                              className={`nav-sub-item ${view === "archiveBonuses" ? "active" : ""}`}
                            >
                              <span className="sub-dot" />
                              <span>Bonuslar</span>
                            </button>
                          </li>
                        </ul>
                      )}
                    </li>
                  </ul>
                )}
              </li>
            </>
          )}

            {/* 4. SOZLAMALAR BO'LIMI (SUBMENU) */}
            {canShowGroup(["centerSettings", "branches", "positions", "managers", "rooms", "holidays", "receiptSettings", "courses", "reasons", "placementTest", "points", "examTemplates", "smsBuy", "autoSms", "smsTemplates", "simpleForm", "teacherForm", "staffForm", "referralForm", "tags", "paymentTypes"]) && (
              <>
                {!collapsed && (
                  <li className="nav-divider">
                    <span>Sozlamalar</span>
                  </li>
                )}
                <li className={`nav-parent-wrapper ${pinnedFlyout === "settings" ? "is-flyout-open" : ""}`}>
                  <div
                    id="nav-parent-settings"
                    onClick={() => toggleMenu("settings")}
                    className={`nav-parent-item ${
                      openMenus.settings || pinnedFlyout === "settings" ? "is-open" : ""
                    } ${
                      ["centerSettings", "branches", "positions", "managers", "rooms", "holidays", "receiptSettings", "courses", "reasons", "placementTest", "points", "examTemplates", "smsBuy", "autoSms", "smsTemplates", "simpleForm", "teacherForm", "staffForm", "referralForm", "tags", "paymentTypes"].includes(view)
                        ? "has-active-child"
                        : ""
                    }`}
                    title={collapsed ? "Sozlamalar" : undefined}
                  >
                    <span
                      className="ic"
                      style={{ color: NAV_ICON_COLORS.settings }}
                    >
                      <Settings size={18} />
                    </span>
                    <span className="label">Sozlamalar</span>
                    <ChevronDown size={14} className="chev" />
                  </div>
                  {(openMenus.settings || collapsed) && (
                    <ul className="nav-sub-menu">
                      {collapsed && (
                        <li className="px-2 py-1 mb-1 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Sozlamalar
                        </li>
                      )}
                      {/* Umumiy sozlamalar */}
                      {isAllowed("centerSettings") && (
                        <li>
                          <button
                            id="nav-sub-centerSettings"
                            onClick={() => handleNavigate("centerSettings")}
                            className={`nav-sub-item ${
                              view === "centerSettings" || view === "settings" ? "active" : ""
                            }`}
                          >
                            <span className="sub-dot" />
                            <span>Umumiy sozlamalar</span>
                          </button>
                        </li>
                      )}

                      {/* Ofis Sub-menu */}
                      <li className="nav-parent-wrapper pl-2 mt-1">
                        <div
                          onClick={() => toggleMenu("office")}
                          className="flex items-center justify-between py-1.5 px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-200"
                        >
                          <span>Ofis</span>
                          <ChevronDown size={12} className={`transition-transform ${openMenus.office ? "rotate-180" : ""}`} />
                        </div>
                        {openMenus.office && (
                          <ul className="pl-3 border-l border-slate-200 dark:border-slate-800 space-y-0.5 mt-1">
                            <li>
                              <button
                                onClick={() => handleNavigate("branches")}
                                className={`nav-sub-item ${view === "branches" ? "active" : ""}`}
                              >
                                <span className="sub-dot" />
                                <span>Ofislar (Filiallar)</span>
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => handleNavigate("positions")}
                                className={`nav-sub-item ${view === "positions" ? "active" : ""}`}
                              >
                                <span className="sub-dot" />
                                <span>Lavozimlar</span>
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => handleNavigate("managers")}
                                className={`nav-sub-item ${view === "managers" ? "active" : ""}`}
                              >
                                <span className="sub-dot" />
                                <span>Xodimlar</span>
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => handleNavigate("rooms")}
                                className={`nav-sub-item ${view === "rooms" ? "active" : ""}`}
                              >
                                <span className="sub-dot" />
                                <span>Xonalar</span>
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => handleNavigate("holidays")}
                                className={`nav-sub-item ${view === "holidays" ? "active" : ""}`}
                              >
                                <span className="sub-dot" />
                                <span>Bayram kunlari</span>
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => handleNavigate("receiptSettings")}
                                className={`nav-sub-item ${view === "receiptSettings" ? "active" : ""}`}
                              >
                                <span className="sub-dot" />
                                <span>Chek sozlama</span>
                              </button>
                            </li>
                          </ul>
                        )}
                      </li>

                      {/* O'quv menusi Sub-menu */}
                      <li className="nav-parent-wrapper pl-2 mt-1">
                        <div
                          onClick={() => toggleMenu("academic")}
                          className="flex items-center justify-between py-1.5 px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-200"
                        >
                          <span>O'quv menusi</span>
                          <ChevronDown size={12} className={`transition-transform ${openMenus.academic ? "rotate-180" : ""}`} />
                        </div>
                        {openMenus.academic && (
                          <ul className="pl-3 border-l border-slate-200 dark:border-slate-800 space-y-0.5 mt-1">
                            <li>
                              <button
                                onClick={() => handleNavigate("courses")}
                                className={`nav-sub-item ${view === "courses" ? "active" : ""}`}
                              >
                                <span className="sub-dot" />
                                <span>Kurslar</span>
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => handleNavigate("reasons")}
                                className={`nav-sub-item ${view === "reasons" ? "active" : ""}`}
                              >
                                <span className="sub-dot" />
                                <span>Sabablar</span>
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => handleNavigate("placementTest")}
                                className={`nav-sub-item ${view === "placementTest" ? "active" : ""}`}
                              >
                                <span className="sub-dot" />
                                <span>Daraja testi</span>
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => handleNavigate("points")}
                                className={`nav-sub-item ${view === "points" ? "active" : ""}`}
                              >
                                <span className="sub-dot" />
                                <span>Ballar</span>
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => handleNavigate("examTemplates")}
                                className={`nav-sub-item ${view === "examTemplates" ? "active" : ""}`}
                              >
                                <span className="sub-dot" />
                                <span>Imtihon shablonlari</span>
                              </button>
                            </li>
                          </ul>
                        )}
                      </li>

                      {/* SMS-Auto menu Sub-menu */}
                      <li className="nav-parent-wrapper pl-2 mt-1">
                        <div
                          onClick={() => toggleMenu("sms")}
                          className="flex items-center justify-between py-1.5 px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-200"
                        >
                          <span>SMS-Auto menu</span>
                          <ChevronDown size={12} className={`transition-transform ${openMenus.sms ? "rotate-180" : ""}`} />
                        </div>
                        {openMenus.sms && (
                          <ul className="pl-3 border-l border-slate-200 dark:border-slate-800 space-y-0.5 mt-1">
                            <li>
                              <button
                                onClick={() => handleNavigate("smsBuy")}
                                className={`nav-sub-item ${view === "smsBuy" ? "active" : ""}`}
                              >
                                <span className="sub-dot" />
                                <span>Sms sotib olish</span>
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => handleNavigate("autoSms")}
                                className={`nav-sub-item ${view === "autoSms" ? "active" : ""}`}
                              >
                                <span className="sub-dot" />
                                <span>Auto sms</span>
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => handleNavigate("smsTemplates")}
                                className={`nav-sub-item ${view === "smsTemplates" ? "active" : ""}`}
                              >
                                <span className="sub-dot" />
                                <span>Auto sms shablonlar</span>
                              </button>
                            </li>
                          </ul>
                        )}
                      </li>

                      {/* Formalar menyusi Sub-menu */}
                      <li className="nav-parent-wrapper pl-2 mt-1">
                        <div
                          onClick={() => toggleMenu("forms")}
                          className="flex items-center justify-between py-1.5 px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-200"
                        >
                          <span>Formalar menyusi</span>
                          <ChevronDown size={12} className={`transition-transform ${openMenus.forms ? "rotate-180" : ""}`} />
                        </div>
                        {openMenus.forms && (
                          <ul className="pl-3 border-l border-slate-200 dark:border-slate-800 space-y-0.5 mt-1">
                            <li>
                              <button
                                onClick={() => handleNavigate("simpleForm")}
                                className={`nav-sub-item ${view === "simpleForm" ? "active" : ""}`}
                              >
                                <span className="sub-dot" />
                                <span>Oddiy forma</span>
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => handleNavigate("teacherForm")}
                                className={`nav-sub-item ${view === "teacherForm" ? "active" : ""}`}
                              >
                                <span className="sub-dot" />
                                <span>O'qituvchi formasi</span>
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => handleNavigate("staffForm")}
                                className={`nav-sub-item ${view === "staffForm" ? "active" : ""}`}
                              >
                                <span className="sub-dot" />
                                <span>Xodim formasi</span>
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => handleNavigate("referralForm")}
                                className={`nav-sub-item ${view === "referralForm" ? "active" : ""}`}
                              >
                                <span className="sub-dot" />
                                <span>Referal forma</span>
                              </button>
                            </li>
                          </ul>
                        )}
                      </li>

                      {/* Teglar */}
                      {isAllowed("tags") && (
                        <li>
                          <button
                            id="nav-sub-tags"
                            onClick={() => handleNavigate("tags")}
                            className={`nav-sub-item ${
                              view === "tags" ? "active" : ""
                            }`}
                          >
                            <span className="sub-dot" />
                            <span>Teglar</span>
                          </button>
                        </li>
                      )}

                      {/* To'lov turlari */}
                      {isAllowed("paymentTypes") && (
                        <li>
                          <button
                            id="nav-sub-paymentTypes"
                            onClick={() => handleNavigate("paymentTypes")}
                            className={`nav-sub-item ${
                              view === "paymentTypes" ? "active" : ""
                            }`}
                          >
                            <span className="sub-dot" />
                            <span>To'lov turlari</span>
                          </button>
                        </li>
                      )}
                    </ul>
                  )}
                </li>
              </>
            )}
          </ul>
        </aside>

        {/* ======================= MAIN CONTENT VIEW ======================= */}
        <div className="main-content-scroll" id="main-content-area">
          <main className="p-4 sm:p-6 lg:p-8 flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

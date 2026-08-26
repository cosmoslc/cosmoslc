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

  const fallbackBranches = [
    { id: "branch_default", name: "Asosiy Filial", address: "Toshkent sh., Markaz-1", color: "#3f6df6" },
    { id: "branch_chilonzor", name: "Chilonzor Filiali", address: "Chilonzor t., 9-mavze", color: "#10b981" },
    { id: "branch_yunusobod", name: "Yunusobod Filiali", address: "Yunusobod t., 14-mavze", color: "#8b5cf6" },
  ];

  const branches =
    scopeBranches && scopeBranches.length > 0
      ? scopeBranches
      : directorData?.branches && directorData.branches.length > 0
      ? directorData.branches
      : fallbackBranches;

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
    settings: true,
    office: true,
    academic: true,
    sms: false,
    forms: false,
  });

  const toggleMenu = (key) => {
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Auto-expand menu if active item is inside it
  useEffect(() => {
    if (["payments", "additionalIncome", "salaries", "expenses", "debtors"].includes(view)) {
      setOpenMenus((prev) => ({ ...prev, finance: true }));
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
          <div className="topbar-right">
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
                  <div className="absolute right-0 top-12 z-50 w-56 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
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
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-left"
                    >
                      <UserCircle2 size={15} className="text-slate-400" />
                      Mening profilim
                    </button>

                    <button
                      onClick={() => {
                        goTo(role === "director" ? "centerSettings" : "settings");
                        setProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-left"
                    >
                      <Settings size={15} className="text-slate-400" />
                      Sozlamalar
                    </button>

                    <button
                      onClick={() => {
                        goTo("security");
                        setProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-left"
                    >
                      <ShieldCheck size={15} className="text-slate-400" />
                      Xavfsizlik
                    </button>

                    <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all text-left"
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

            {/* 2. MOLIYA BO'LIMI (SUBMENU) */}
            {canShowGroup(["payments", "additionalIncome", "salaries", "expenses", "debtors"]) && (
              <>
                {!collapsed && (
                  <li className="nav-divider">
                    <span>Moliya</span>
                  </li>
                )}
                <li className="nav-parent-wrapper">
                  <div
                    id="nav-parent-finance"
                    onClick={() => toggleMenu("finance")}
                    className={`nav-parent-item ${
                      openMenus.finance ? "is-open" : ""
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
                      {isAllowed("payments") && (
                        <li>
                          <button
                            id="nav-sub-payments"
                            onClick={() => {
                              goTo("payments");
                              setMobileOpen(false);
                            }}
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
                            onClick={() => {
                              goTo("additionalIncome");
                              setMobileOpen(false);
                            }}
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
                            onClick={() => {
                              goTo("salaries");
                              setMobileOpen(false);
                            }}
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
                            onClick={() => {
                              goTo("expenses");
                              setMobileOpen(false);
                            }}
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
                            onClick={() => {
                              goTo("debtors");
                              setMobileOpen(false);
                            }}
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

            {/* 3. SOZLAMALAR BO'LIMI (SUBMENU) */}
            {canShowGroup(["centerSettings", "branches", "positions", "managers", "rooms", "holidays", "receiptSettings", "courses", "reasons", "placementTest", "points", "examTemplates", "smsBuy", "autoSms", "smsTemplates", "simpleForm", "teacherForm", "staffForm", "referralForm", "tags", "paymentTypes"]) && (
              <>
                {!collapsed && (
                  <li className="nav-divider">
                    <span>Sozlamalar</span>
                  </li>
                )}
                <li className="nav-parent-wrapper">
                  <div
                    id="nav-parent-settings"
                    onClick={() => toggleMenu("settings")}
                    className={`nav-parent-item ${
                      openMenus.settings ? "is-open" : ""
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
                      {/* Umumiy sozlamalar */}
                      {isAllowed("centerSettings") && (
                        <li>
                          <button
                            id="nav-sub-centerSettings"
                            onClick={() => {
                              goTo("centerSettings");
                              setMobileOpen(false);
                            }}
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
                                onClick={() => { goTo("branches"); setMobileOpen(false); }}
                                className={`nav-sub-item ${view === "branches" ? "active" : ""}`}
                              >
                                <span className="sub-dot" />
                                <span>Ofislar (Filiallar)</span>
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => { goTo("positions"); setMobileOpen(false); }}
                                className={`nav-sub-item ${view === "positions" ? "active" : ""}`}
                              >
                                <span className="sub-dot" />
                                <span>Lavozimlar</span>
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => { goTo("managers"); setMobileOpen(false); }}
                                className={`nav-sub-item ${view === "managers" ? "active" : ""}`}
                              >
                                <span className="sub-dot" />
                                <span>Xodimlar</span>
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => { goTo("rooms"); setMobileOpen(false); }}
                                className={`nav-sub-item ${view === "rooms" ? "active" : ""}`}
                              >
                                <span className="sub-dot" />
                                <span>Xonalar</span>
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => { goTo("holidays"); setMobileOpen(false); }}
                                className={`nav-sub-item ${view === "holidays" ? "active" : ""}`}
                              >
                                <span className="sub-dot" />
                                <span>Bayram kunlari</span>
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => { goTo("receiptSettings"); setMobileOpen(false); }}
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
                                onClick={() => { goTo("courses"); setMobileOpen(false); }}
                                className={`nav-sub-item ${view === "courses" ? "active" : ""}`}
                              >
                                <span className="sub-dot" />
                                <span>Kurslar</span>
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => { goTo("reasons"); setMobileOpen(false); }}
                                className={`nav-sub-item ${view === "reasons" ? "active" : ""}`}
                              >
                                <span className="sub-dot" />
                                <span>Sabablar</span>
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => { goTo("placementTest"); setMobileOpen(false); }}
                                className={`nav-sub-item ${view === "placementTest" ? "active" : ""}`}
                              >
                                <span className="sub-dot" />
                                <span>Daraja testi</span>
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => { goTo("points"); setMobileOpen(false); }}
                                className={`nav-sub-item ${view === "points" ? "active" : ""}`}
                              >
                                <span className="sub-dot" />
                                <span>Ballar</span>
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => { goTo("examTemplates"); setMobileOpen(false); }}
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
                                onClick={() => { goTo("smsBuy"); setMobileOpen(false); }}
                                className={`nav-sub-item ${view === "smsBuy" ? "active" : ""}`}
                              >
                                <span className="sub-dot" />
                                <span>Sms sotib olish</span>
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => { goTo("autoSms"); setMobileOpen(false); }}
                                className={`nav-sub-item ${view === "autoSms" ? "active" : ""}`}
                              >
                                <span className="sub-dot" />
                                <span>Auto sms</span>
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => { goTo("smsTemplates"); setMobileOpen(false); }}
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
                                onClick={() => { goTo("simpleForm"); setMobileOpen(false); }}
                                className={`nav-sub-item ${view === "simpleForm" ? "active" : ""}`}
                              >
                                <span className="sub-dot" />
                                <span>Oddiy forma</span>
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => { goTo("teacherForm"); setMobileOpen(false); }}
                                className={`nav-sub-item ${view === "teacherForm" ? "active" : ""}`}
                              >
                                <span className="sub-dot" />
                                <span>O'qituvchi formasi</span>
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => { goTo("staffForm"); setMobileOpen(false); }}
                                className={`nav-sub-item ${view === "staffForm" ? "active" : ""}`}
                              >
                                <span className="sub-dot" />
                                <span>Xodim formasi</span>
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => { goTo("referralForm"); setMobileOpen(false); }}
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
                            onClick={() => {
                              goTo("tags");
                              setMobileOpen(false);
                            }}
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
                            onClick={() => {
                              goTo("paymentTypes");
                              setMobileOpen(false);
                            }}
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

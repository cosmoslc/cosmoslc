import { useState, useEffect, useRef, isValidElement } from "react";
import {
  useNavIndicator,
  NavIndicator,
} from "../../../shared/components/NavIndicator";
import {
  LogOut,
  Menu,
  Moon,
  Sun,
  Maximize2,
  Minimize2,
  Search,
  ChevronDown,
  User,
  X,
  Building2,
  BookOpen,
} from "lucide-react";
import { MONTHS_UZ, JS_DAY_NAMES, NAV_ICON_COLORS } from "../utils/constants";

function renderNavIcon(icon, size = 18) {
  if (!icon) return null;
  if (isValidElement(icon)) return icon;
  const IconComp = icon;
  return <IconComp size={size} strokeWidth={1.8} />;
}

export function AppShell({
  children,
  view,
  goTo,
  items,
  teacher,
  now,
  onLogout,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSimulatedFs, setIsSimulatedFs] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navContainerRef = useRef(null);
  const indicatorRef = useNavIndicator([view, collapsed], navContainerRef);

  useEffect(() => {
    function handleFsChange() {
      const activeFs = !!document.fullscreenElement;
      setIsFullscreen(activeFs);
      if (!activeFs) {
        setIsSimulatedFs(false);
      }
    }
    document.addEventListener("fullscreenchange", handleFsChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const dayName = JS_DAY_NAMES[now.getDay()];

  function toggleDark() {
    setIsDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
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
          .then(() => {
            setIsFullscreen(true);
          })
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

  // Categorize teacher navigation
  const coreIds = ["home", "schedule"];
  const learningIds = ["tasks", "rating", "dictionary", "games"];
  const accountIds = ["payments", "profile"];

  const coreItems = items.filter((i) => coreIds.includes(i.id));
  const learningItems = items.filter((i) => learningIds.includes(i.id));
  const accountItems = items.filter(
    (i) =>
      accountIds.includes(i.id) ||
      (!coreIds.includes(i.id) && !learningIds.includes(i.id)),
  );

  const activeItem = items.find((i) => i.id === view);

  return (
    <div
      className={`app-shell ${isDark ? "dark" : ""} ${isSimulatedFs ? "fixed inset-0 z-[99999] overflow-auto bg-slate-100 dark:bg-slate-900" : ""}`}
    >
      {/* Top Accent Line */}
      <div className="top-accent" />

      {/* Topbar */}
      <header className="md:hidden fixed top-0 w-full z-50 p-4 pointer-events-none">
          <div className="flex justify-start">
            {/* Profile Dropdown Menu */}
            <div className="relative pointer-events-auto">
              <div
                className="flex items-center gap-2 cursor-pointer select-none bg-white/5 dark:bg-slate-900/20 backdrop-blur-xl border border-white/10 dark:border-white/5 p-1.5 pr-3 rounded-xl shadow-lg transition-transform hover:scale-[1.02]"
                onClick={() => setProfileOpen((o) => !o)}
                role="button"
                tabIndex={0}
                title="Profil va menyu"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-inner"
                  style={{
                    background: "linear-gradient(135deg, #10b981, #059669)",
                  }}
                >
                  {teacher?.first_name?.charAt(0)?.toUpperCase() || "O"}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-none mb-0.5">
                    {teacher?.first_name || "O'qituvchi"}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-none">
                    Profil
                  </span>
                </div>
              </div>

              {profileOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileOpen(false)}
                  />
                  <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700/50">
                      <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {teacher?.first_name} {teacher?.last_name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {teacher?.phone || "O'qituvchi"}
                      </div>
                    </div>
                    <div className="p-1">
                      <button
                        className="w-full text-left px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg flex items-center gap-2 transition-colors"
                        onClick={() => {
                          setProfileOpen(false);
                          goTo && goTo("profile");
                        }}
                      >
                        <User size={16} /> Profil sozlamalari
                      </button>
                      <button
                        className="w-full text-left px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg flex items-center gap-2 transition-colors md:hidden"
                        onClick={() => {
                          setProfileOpen(false);
                          toggleDark();
                        }}
                      >
                        {isDark ? <Sun size={16} /> : <Moon size={16} />}{" "}
                        {isDark ? "Yorug' mavzu" : "Qorong'i mavzu"}
                      </button>
                    </div>
                    <div className="p-1 border-t border-slate-100 dark:border-slate-700/50">
                      <button
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg flex items-center gap-2 transition-colors"
                        onClick={() => {
                          setProfileOpen(false);
                          if (onLogout) onLogout();
                        }}
                      >
                        <LogOut size={16} /> Tizimdan chiqish
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

      {/* Desktop Topbar */}
      <header className="app-topbar hidden md:flex">
        {/* Brand Block */}
        <div className={`brand-block ${collapsed ? "collapsed" : ""}`}>
          <div className="brand-mark">
            <img
              src="/assets/cosmo_logo.svg"
              alt="COSMOS LC"
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                if (e.currentTarget.nextSibling) {
                  e.currentTarget.nextSibling.style.display = "flex";
                }
              }}
            />
            <span
              style={{ display: "none" }}
              className="w-full h-full items-center justify-center font-extrabold text-violet-600 dark:text-violet-400"
            >
              {teacher?.name?.charAt(0)?.toUpperCase() || "O"}
            </span>
          </div>
          {!collapsed && (
            <div className="brand-text">
              <div className="brand-name">COSMOS LC</div>
              <div className="brand-sub">O'QITUVCHI PANELI</div>
            </div>
          )}
        </div>

        {/* Topbar Main */}
        <div className="topbar-main">
          {/* Desktop hamburger */}
          <div className="workspace-block">
            <button
              className="icon-btn hidden md:flex"
              onClick={() => setCollapsed((c) => !c)}
              aria-label="Toggle sidebar"
            >
              <Menu size={18} />
            </button>
            <div className="workspace-label">
              <div className="eyebrow">WORKSPACE</div>
              <div className="title">
                {activeItem?.label || "O'qituvchi xonasi"}
              </div>
            </div>
          </div>

          {/* Search Box */}
          <div className="search-wrap hidden md:flex">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Qidirish (vazifalar, lug'at)..."
            />
          </div>

          {/* Topbar Right */}
          <div className="topbar-right flex items-center gap-2">
            <button
              className="icon-btn hidden md:flex"
              onClick={toggleDark}
              aria-label="Toggle dark mode"
              title="Mavzuni o'zgartirish"
            >
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            <button
              className="icon-btn hidden md:flex"
              onClick={toggleFullscreen}
              aria-label="Toggle fullscreen"
              title="To'liq ekran"
            >
              {isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
            </button>

            {/* Desktop Profile Menu */}
            <div className="relative">
              <div
                className="profile-chip flex items-center gap-2 cursor-pointer select-none"
                onClick={() => setProfileOpen((o) => !o)}
                role="button"
                tabIndex={0}
                title="Profil va menyu"
              >
                <div
                  className="avatar-mark"
                  style={{
                    background: "linear-gradient(135deg, #10b981, #059669)",
                  }}
                >
                  {teacher?.first_name?.charAt(0)?.toUpperCase() || "O"}
                </div>
                <div className="profile-info hidden md:flex flex-col">
                  <span className="profile-name">
                    {teacher?.first_name || "O'qituvchi"}
                  </span>
                  <span className="profile-role">Profil</span>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </div>

              {profileOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700/50">
                      <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {teacher?.first_name} {teacher?.last_name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {teacher?.phone || "O'qituvchi"}
                      </div>
                    </div>
                    <div className="p-1">
                      <button
                        className="w-full text-left px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg flex items-center gap-2 transition-colors"
                        onClick={() => {
                          setProfileOpen(false);
                          goTo && goTo("profile");
                        }}
                      >
                        <User size={16} /> Profil sozlamalari
                      </button>
                    </div>
                    <div className="p-1 border-t border-slate-100 dark:border-slate-700/50">
                      <button
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg flex items-center gap-2 transition-colors"
                        onClick={() => {
                          setProfileOpen(false);
                          if (onLogout) onLogout();
                        }}
                      >
                        <LogOut size={16} /> Tizimdan chiqish
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Body & Sidebar */}
      <div className="app-body">
        {/* Mobile Backdrop */}
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-slate-900/40 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`app-sidebar ${collapsed ? "collapsed" : ""} ${
            mobileOpen ? "mobile-open" : ""
          }`}
        >
          {/* Mobile Sidebar Close Header */}
          <div className="flex md:hidden items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-xl text-white font-black text-sm flex items-center justify-center shadow-sm"
                style={{
                  background:
                    teacher?.color ||
                    "linear-gradient(135deg, #3f6df6, #5f3ef0)",
                }}
              >
                {teacher?.name?.charAt(0)?.toUpperCase() || "S"}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  COSMOS LC
                </div>
                <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  O'qituvchi paneli
                </div>
              </div>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>
          {/* Nav Container with Sliding Indicator */}
          <div ref={navContainerRef} className="relative flex-1">
            <NavIndicator indicatorRef={indicatorRef} />
            {/* Core Navigation */}
            {coreItems.length > 0 && (
              <ul className="nav-group">
                {coreItems.map((item) => {
                  const isActive = view === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          goTo(item.id);
                          setMobileOpen(false);
                        }}
                        className={`nav-item ${isActive ? "active" : ""}`}
                        title={collapsed ? item.label : undefined}
                      >
                        <span className="ic">
                          {renderNavIcon(item.icon, 16)}
                        </span>
                        {!collapsed && (
                          <span className="label">{item.label}</span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Learning Navigation */}
            {learningItems.length > 0 && (
              <ul className="nav-group">
                {learningItems.map((item) => {
                  const isActive = view === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          goTo(item.id);
                          setMobileOpen(false);
                        }}
                        className={`nav-item ${isActive ? "active" : ""}`}
                        title={collapsed ? item.label : undefined}
                      >
                        <span className="ic">
                          {renderNavIcon(item.icon, 16)}
                        </span>
                        {!collapsed && (
                          <span className="label">{item.label}</span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Account Navigation */}
            {accountItems.length > 0 && (
              <ul className="nav-group">
                {accountItems.map((item) => {
                  const isActive = view === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          goTo(item.id);
                          setMobileOpen(false);
                        }}
                        className={`nav-item ${isActive ? "active" : ""}`}
                        title={collapsed ? item.label : undefined}
                      >
                        <span className="ic">
                          {renderNavIcon(item.icon, 16)}
                        </span>
                        {!collapsed && (
                          <span className="label">{item.label}</span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="main-content-scroll">
          <div
            key={view}
            className="p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-8 animate-page-in"
          >
            {children}
          </div>
        </main>
        {/* Liquid Glass Mobile Bottom Nav */}
        <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 w-full px-2 z-[90]">
          <div className="menu">
            <button
              className={view === "dashboard" ? "active" : ""}
              onClick={() => goTo("dashboard")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-6"
              >
                <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z"></path>
                <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z"></path>
              </svg>
              <span>Asosiy</span>
            </button>
            <button
              className={view === "groups" ? "active" : ""}
              onClick={() => goTo("groups")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-6"
              >
                <path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15ZM1.5 10.146V6a3 3 0 0 1 3-3h5.379a2.25 2.25 0 0 1 1.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 0 1 3 3v1.146A4.483 4.483 0 0 0 19.5 9h-15a4.483 4.483 0 0 0-3 1.146Z"></path>
              </svg>
              <span>Guruhlar</span>
            </button>
            <button
              className={view === "analytics" ? "active" : ""}
              onClick={() => goTo("analytics")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-6"
              >
                <path
                  fillRule="evenodd"
                  d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z"
                  clipRule="evenodd"
                ></path>
              </svg>
              <span>Statistika</span>
            </button>
            <button
              className={view === "students" ? "active" : ""}
              onClick={() => goTo("students")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-6"
              >
                <path d="M17.004 10.407c.138.435-.216.842-.672.842h-3.465a.75.75 0 0 1-.65-.375l-1.732-3c-.229-.396-.053-.907.393-1.004a5.252 5.252 0 0 1 6.126 3.537ZM8.12 8.464c.307-.338.838-.235 1.066.16l1.732 3a.75.75 0 0 1 0 .75l-1.732 3c-.229.397-.76.5-1.067.161A5.23 5.23 0 0 1 6.75 12a5.23 5.23 0 0 1 1.37-3.536ZM10.878 17.13c-.447-.098-.623-.608-.394-1.004l1.733-3.002a.75.75 0 0 1 .65-.375h3.465c.457 0 .81.407.672.842a5.252 5.252 0 0 1-6.126 3.539Z"></path>
                <path
                  fillRule="evenodd"
                  d="M21 12.75a.75.75 0 1 0 0-1.5h-.783a8.22 8.22 0 0 0-.237-1.357l.734-.267a.75.75 0 1 0-.513-1.41l-.735.268a8.24 8.24 0 0 0-.689-1.192l.6-.503a.75.75 0 1 0-.964-1.149l-.6.504a8.3 8.3 0 0 0-1.054-.885l.391-.678a.75.75 0 1 0-1.299-.75l-.39.676a8.188 8.188 0 0 0-1.295-.47l.136-.77a.75.75 0 0 0-1.477-.26l-.136.77a8.36 8.36 0 0 0-1.377 0l-.136-.77a.75.75 0 1 0-1.477.26l.136.77c-.448.121-.88.28-1.294.47l-.39-.676a.75.75 0 0 0-1.3.75l.392.678a8.29 8.29 0 0 0-1.054.885l-.6-.504a.75.75 0 1 0-.965 1.149l.6.503a8.243 8.243 0 0 0-.689 1.192L3.8 8.216a.75.75 0 1 0-.513 1.41l.735.267a8.222 8.222 0 0 0-.238 1.356h-.783a.75.75 0 0 0 0 1.5h.783c.042.464.122.917.238 1.356l-.735.268a.75.75 0 0 0 .513 1.41l.735-.268c.197.417.428.816.69 1.191l-.6.504a.75.75 0 0 0 .963 1.15l.601-.505c.326.323.679.62 1.054.885l-.392.68a.75.75 0 0 0 1.3.75l.39-.679c.414.192.847.35 1.294.471l-.136.77a.75.75 0 0 0 1.477.261l.137-.772a8.332 8.332 0 0 0 1.376 0l.136.772a.75.75 0 1 0 1.477-.26l-.136-.771a8.19 8.19 0 0 0 1.294-.47l.391.677a.75.75 0 0 0 1.3-.75l-.393-.679a8.29 8.29 0 0 0 1.054-.885l.601.504a.75.75 0 0 0 .964-1.15l-.6-.503c.261-.375.492-.774.69-1.191l.735.267a.75.75 0 1 0 .512-1.41l-.734-.267c.115-.439.195-.892.237-1.356h.784Zm-2.657-3.06a6.744 6.744 0 0 0-1.19-2.053 6.784 6.784 0 0 0-1.82-1.51A6.705 6.705 0 0 0 12 5.25a6.8 6.8 0 0 0-1.225.11 6.7 6.7 0 0 0-2.15.793 6.784 6.784 0 0 0-2.952 3.489.76.76 0 0 1-.036.098A6.74 6.74 0 0 0 5.251 12a6.74 6.74 0 0 0 3.366 5.842l.009.005a6.704 6.704 0 0 0 2.18.798l.022.003a6.792 6.792 0 0 0 2.368-.004 6.704 6.704 0 0 0 2.205-.811 6.785 6.785 0 0 0 1.762-1.484l.009-.01.009-.01a6.743 6.743 0 0 0 1.18-2.066c.253-.707.39-1.469.39-2.263a6.74 6.74 0 0 0-.408-2.309Z"
                  clipRule="evenodd"
                ></path>
              </svg>
              <span>O'quvchilar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AppSidebar() {
  return null;
}
export function AppBottomNav() {
  return null;
}
export function TopBar() {
  return null;
}

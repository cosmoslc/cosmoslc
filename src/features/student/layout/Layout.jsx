import { useState, useEffect, isValidElement } from "react";
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
} from "lucide-react";
import { MONTHS_UZ, JS_DAY_NAMES, NAV_ICON_COLORS } from "../utils/constants";

function renderNavIcon(icon, size = 16) {
  if (!icon) return null;
  if (isValidElement(icon)) return icon;
  const IconComp = icon;
  return <IconComp size={size} />;
}

export function AppShell({
  children,
  view,
  goTo,
  items,
  student,
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

  // Categorize student navigation
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
    <div className={`app-shell ${isDark ? "dark" : ""} ${isSimulatedFs ? "fixed inset-0 z-[99999] overflow-auto bg-slate-100 dark:bg-slate-900" : ""}`}>
      {/* Top Accent Line */}
      <div className="top-accent" />

      {/* Topbar */}
      <header className="app-topbar">
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
            <span style={{ display: "none" }} className="w-full h-full items-center justify-center font-extrabold text-violet-600 dark:text-violet-400">
              {student?.name?.charAt(0)?.toUpperCase() || "S"}
            </span>
          </div>
          {!collapsed && (
            <div className="brand-text">
              <div className="brand-name">COSMOS LC</div>
              <div className="brand-sub">O'QUVCHI PANELI</div>
            </div>
          )}
        </div>

        {/* Topbar Main */}
        <div className="topbar-main">
          {/* Mobile hamburger */}
          <button
            className="icon-btn md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle mobile menu"
          >
            <Menu size={18} />
          </button>

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
                {activeItem?.label || "O'quvchi xonasi"}
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
          <div className="topbar-right">
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

            {/* Profile Dropdown Menu */}
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
                    background:
                      student?.color ||
                      "linear-gradient(135deg, #3f6df6, #5f3ef0)",
                  }}
                >
                  {student?.photo ? (
                    <img
                      src={student.photo}
                      alt={student.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    student?.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase() || "S"
                  )}
                </div>
                <div className="profile-info hidden lg:block">
                  <div className="name">{student?.name || "O'quvchi"}</div>
                  <div className="role">O'quvchi</div>
                </div>
                <ChevronDown size={14} className={`text-slate-400 hidden lg:block transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`} />
              </div>

              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 top-12 z-50 w-56 rounded-xl p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-1">
                    <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {student?.name || "O'quvchi"}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        O'quvchi paneli
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        goTo && goTo("profile");
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                    >
                      <User size={16} className="text-slate-400 shrink-0" />
                      <span>Shaxsiy profil</span>
                    </button>

                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        onLogout && onLogout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left"
                    >
                      <LogOut size={16} className="shrink-0" />
                      <span>Chiqish</span>
                    </button>
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
                    student?.color ||
                    "linear-gradient(135deg, #3f6df6, #5f3ef0)",
                }}
              >
                {student?.name?.charAt(0)?.toUpperCase() || "S"}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  COSMOS LC
                </div>
                <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  O'quvchi paneli
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
          {/* Core Navigation */}
          {coreItems.length > 0 && (
            <>
              <div className="nav-divider">ASOSIY</div>
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
                        <span className="ic">{renderNavIcon(item.icon, 16)}</span>
                        {!collapsed && (
                          <span className="label">{item.label}</span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          {/* Learning Navigation */}
          {learningItems.length > 0 && (
            <>
              <div className="nav-divider">O'QISH VA MASHQLAR</div>
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
                        <span className="ic">{renderNavIcon(item.icon, 16)}</span>
                        {!collapsed && (
                          <span className="label">{item.label}</span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          {/* Account Navigation */}
          {accountItems.length > 0 && (
            <>
              <div className="nav-divider">MOLIYA VA PROFIL</div>
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
                        <span className="ic">{renderNavIcon(item.icon, 16)}</span>
                        {!collapsed && (
                          <span className="label">{item.label}</span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </aside>

        {/* Main Content Area */}
        <main className="main-content-scroll">
          <div className="p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-8">
            {children}
          </div>
        </main>
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

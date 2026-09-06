import fs from 'fs';
let content = fs.readFileSync('src/features/teacher/layout/Layout.jsx', 'utf8');

const currentHeaderRegex = /<header className="md:hidden fixed top-0 w-full z-50 p-4 pointer-events-none">([\s\S]*?)<\/header>/;

const combinedHeader = `<header className="md:hidden fixed top-0 w-full z-50 p-4 pointer-events-none">
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
        <div className={\`brand-block \${collapsed ? "collapsed" : ""}\`}>
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
      </header>`;

content = content.replace(currentHeaderRegex, combinedHeader);

fs.writeFileSync('src/features/teacher/layout/Layout.jsx', content);

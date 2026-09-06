import fs from 'fs';
let content = fs.readFileSync('src/features/teacher/layout/Layout.jsx', 'utf8');

const oldTopbarRegex = /<header className="app-topbar">([\s\S]*?)<\/header>/;

const newTopbar = `<header className="md:hidden fixed top-0 w-full z-50 p-4 pointer-events-none">
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
        </header>`;

content = content.replace(oldTopbarRegex, newTopbar);

fs.writeFileSync('src/features/teacher/layout/Layout.jsx', content);

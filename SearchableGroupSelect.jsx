import { useState, useRef, useEffect, useMemo } from "react";
import {
  Search,
  ChevronDown,
  X,
  GraduationCap,
  Users,
  Clock,
  Calendar,
  Check,
  BookOpen,
} from "lucide-react";

export function SearchableGroupSelect({
  groups = [],
  courses = [],
  teachers = [],
  students = [],
  value = "",
  onChange,
  placeholder = "Guruhni qidirish yoki tanlash...",
  allowClear = true,
  required = false,
  className = "",
  buttonClassName = "",
  id,
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Auto focus search input when opening
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 50);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Find currently selected group object
  const selectedGroup = useMemo(() => {
    if (!value) return null;
    return groups.find((g) => g.id === value) || null;
  }, [groups, value]);

  // Selected group course title
  const selectedCourse = useMemo(() => {
    if (!selectedGroup) return null;
    return (
      courses.find((c) => c.id === selectedGroup.courseId) ||
      (selectedGroup.courseName ? { title: selectedGroup.courseName } : null)
    );
  }, [selectedGroup, courses]);

  // Filter groups with search query
  const filteredGroups = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return groups;

    return groups.filter((g) => {
      const gName = (g.name || "").toLowerCase();
      const gTime = (g.time || "").toLowerCase();
      const gDays = Array.isArray(g.days)
        ? g.days.join(" ").toLowerCase()
        : (g.days || "").toLowerCase();
      
      const crs = courses.find((c) => String(c.id) === String(g.courseId));
      const crsTitle = (crs?.title || crs?.name || g.courseName || "").toLowerCase();

      const tch = teachers.find((t) => String(t.id) === String(g.teacherHrId || g.teacherId));
      const tchName = (tch?.name || g.teacherName || "").toLowerCase();

      return (
        gName.includes(q) ||
        crsTitle.includes(q) ||
        tchName.includes(q) ||
        gTime.includes(q) ||
        gDays.includes(q)
      );
    });
  }, [groups, searchQuery, courses, teachers]);

  const handleSelect = (group) => {
    if (onChange) {
      onChange(group ? group.id : "", group);
    }
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (onChange) {
      onChange("", null);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full text-left ${className}`}
      id={id ? `${id}-container` : undefined}
    >
      {/* Trigger Button / Selected State Display */}
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => {
          if (!disabled) setIsOpen((prev) => !prev);
        }}
        className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border ${
          isOpen
            ? "border-violet-500 ring-2 ring-violet-500/20"
            : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
        } rounded-xl text-xs font-medium text-slate-900 dark:text-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <GraduationCap
            size={16}
            className={`shrink-0 ${
              selectedGroup
                ? "text-violet-600 dark:text-violet-400"
                : "text-slate-400"
            }`}
          />
          {selectedGroup ? (
            <div className="flex items-center gap-1.5 min-w-0 flex-1 truncate">
              <span className="font-bold text-slate-900 dark:text-white truncate">
                {selectedGroup.name}
              </span>
              {selectedCourse && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-xl bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 truncate hidden sm:inline-block">
                  {selectedCourse.title || selectedCourse.name}
                </span>
              )}
              {selectedGroup.time && (
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 shrink-0">
                  [{selectedGroup.time}]
                </span>
              )}
            </div>
          ) : (
            <span className="text-slate-400 dark:text-slate-500 font-normal truncate">
              {placeholder}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 text-slate-400">
          {allowClear && selectedGroup && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              className="p-1 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors"
              title="Guruhni tozalash"
            >
              <X size={13} />
            </span>
          )}
          <ChevronDown
            size={15}
            className={`transition-transform duration-200 ${
              isOpen ? "rotate-180 text-violet-600" : ""
            }`}
          />
        </div>
      </button>

      {/* Dropdown Menu Overlay */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Search Box Header */}
          <div className="p-2.5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/60">
            <div className="relative flex items-center">
              <Search
                size={14}
                className="absolute left-3 text-slate-400 pointer-events-none"
              />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Guruh nomi, kursi, vaqti bo'yicha qidiring..."
                className="w-full pl-8 pr-7 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                onClick={(e) => e.stopPropagation()}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs p-0.5"
                >
                  <X size={12} />
                </button>
              )}
            </div>
            <div className="flex items-center justify-between mt-1.5 px-1 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
              <span>Jami: {groups.length} ta guruh</span>
              <span>Topildi: {filteredGroups.length} ta</span>
            </div>
          </div>

          {/* Group Options List */}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-1">
            {allowClear && (
              <button
                type="button"
                onClick={() => handleSelect(null)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer ${
                  !value
                    ? "bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                }`}
              >
                <span className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-[10px]">
                  {!value ? "✓" : ""}
                </span>
                <span>-- Guruh biriktirilmasin (Ixtiyoriy) --</span>
              </button>
            )}

            {filteredGroups.length === 0 ? (
              <div className="p-4 text-center space-y-1 text-slate-400 dark:text-slate-500">
                <p className="text-xs font-semibold">Guruh topilmadi</p>
                <p className="text-[10px]">
                  "{searchQuery}" so'rovi bo'yicha hech qanday guruh chiqmadi
                </p>
              </div>
            ) : (
              filteredGroups.map((grp) => {
                const isSelected = grp.id === value;
                const crs = courses.find((c) => String(c.id) === String(grp.courseId));
                const tch = teachers.find((t) => String(t.id) === String(grp.teacherHrId || grp.teacherId));
                const grpIdStr = String(grp.id);
                const stCount = (students || []).filter((s) =>
                  (s.groupIds || []).some((id) => String(id) === grpIdStr)
                ).length;

                return (
                  <button
                    key={grp.id}
                    type="button"
                    onClick={() => handleSelect(grp)}
                    className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-violet-600 text-white font-bold shadow-xs"
                        : "hover:bg-slate-100 dark:hover:bg-slate-700/70 text-slate-900 dark:text-slate-100"
                    }`}
                  >
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-xs font-extrabold truncate ${
                            isSelected
                              ? "text-white"
                              : "text-slate-900 dark:text-white"
                          }`}
                        >
                          {grp.name}
                        </span>
                        {crs && (
                          <span
                            className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                              isSelected
                                ? "bg-violet-700/80 text-violet-100"
                                : "bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200/60 dark:border-violet-800/60"
                            }`}
                          >
                            {crs.title || crs.name}
                          </span>
                        )}
                      </div>

                      <div
                        className={`flex items-center gap-2 text-[11px] flex-wrap ${
                          isSelected
                            ? "text-violet-100"
                            : "text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        {grp.time && (
                          <span className="flex items-center gap-1 font-mono">
                            <Clock size={11} /> {grp.time}
                          </span>
                        )}
                        {grp.days && (
                          <span className="flex items-center gap-1">
                            <Calendar size={11} />
                            {Array.isArray(grp.days)
                              ? grp.days.join(", ")
                              : grp.days}
                          </span>
                        )}
                        {tch && <span>• {tch.name}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-xl flex items-center gap-1 ${
                          isSelected
                            ? "bg-violet-700 text-violet-100"
                            : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        <Users size={11} />
                        {stCount}
                      </span>
                      {isSelected && <Check size={16} className="text-white" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

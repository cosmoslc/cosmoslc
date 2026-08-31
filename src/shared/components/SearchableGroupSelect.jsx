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
import { MorphDropdown } from "./MorphDropdown";

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
  const btnRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 100);
    }
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
    <div className={`relative w-full ${className}`}>
      {/* Trigger Button */}
      <button
        ref={btnRef}
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
          isOpen
            ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-white dark:bg-slate-800"
            : "border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800"
        } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"} ${buttonClassName}`}
      >
        <div className="flex items-center gap-2.5 min-w-0 truncate">
          <GraduationCap
            size={16}
            className={`shrink-0 ${
              selectedGroup ? "text-emerald-600" : "text-slate-400"
            }`}
          />
          {selectedGroup ? (
            <div className="min-w-0 truncate">
              <span className="font-semibold text-slate-900 dark:text-white truncate">
                {selectedGroup.name}
              </span>
              {selectedCourse && (
                <span className="ml-2 text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                  ({selectedCourse.title || selectedCourse.name})
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
              isOpen ? "rotate-180 text-emerald-600" : ""
            }`}
          />
        </div>
      </button>

      {/* MorphDropdown Overlay */}
      <MorphDropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        triggerRef={btnRef}
        align="left"
        className="w-full min-w-[280px]"
      >
        {/* Search Box Header */}
        <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60">
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
              placeholder="Guruh, kurs, o'qituvchi yoki vaqti bo'yicha qidiring..."
              className="w-full pl-8 pr-7 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
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

        {/* Options List */}
        <div className="max-h-60 overflow-y-auto p-1 space-y-0.5">
          {allowClear && (
            <button
              type="button"
              onClick={() => handleSelect(null)}
              className={`morph-menu-item w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer ${
                !value
                  ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <span className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-[10px]">
                {!value ? "✓" : ""}
              </span>
              <span>-- Guruh tanlanmasin --</span>
            </button>
          )}

          {filteredGroups.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400">
              Qidiruv bo'yicha hech qanday guruh topilmadi
            </div>
          ) : (
            filteredGroups.map((g) => {
              const isSelected = g.id === value;
              const crs = courses.find((c) => String(c.id) === String(g.courseId));
              const crsTitle = crs?.title || crs?.name || g.courseName || "";
              const tch = teachers.find(
                (t) => String(t.id) === String(g.teacherHrId || g.teacherId)
              );
              const tchName = tch?.name || g.teacherName || "";

              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => handleSelect(g)}
                  className={`morph-menu-item w-full flex items-center justify-between p-2 rounded-xl text-xs transition-all text-left cursor-pointer ${
                    isSelected
                      ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800/60"
                      : "text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      <GraduationCap size={13} />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-bold">{g.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal truncate flex items-center gap-2">
                        {crsTitle && <span>{crsTitle}</span>}
                        {tchName && <span>• {tchName}</span>}
                        {g.time && <span>• {g.time}</span>}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <Check size={14} className="text-emerald-600 shrink-0" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </MorphDropdown>
    </div>
  );
}

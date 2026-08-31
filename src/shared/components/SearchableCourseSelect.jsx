import { useState, useRef, useEffect, useMemo } from "react";
import {
  Search,
  ChevronDown,
  X,
  BookOpen,
  Check,
  Tag,
  Clock,
} from "lucide-react";
import { MorphDropdown } from "./MorphDropdown";

export function SearchableCourseSelect({
  courses = [],
  value = "",
  onChange,
  placeholder = "Kursni qidirish yoki tanlash...",
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

  // Find currently selected course object or title
  const selectedCourse = useMemo(() => {
    if (!value) return null;
    return (
      courses.find(
        (c) =>
          String(c.id) === String(value) ||
          (c.title || c.name) === value
      ) || { id: value, title: value, name: value }
    );
  }, [courses, value]);

  // Filter courses with search query
  const filteredCourses = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return courses;

    return courses.filter((c) => {
      const cTitle = (c.title || c.name || "").toLowerCase();
      const cCat = (c.category || "").toLowerCase();
      const cDesc = (c.description || "").toLowerCase();
      const cCode = (c.code || "").toLowerCase();

      return (
        cTitle.includes(q) ||
        cCat.includes(q) ||
        cDesc.includes(q) ||
        cCode.includes(q)
      );
    });
  }, [courses, searchQuery]);

  const handleSelect = (course) => {
    if (onChange) {
      onChange(course ? (course.id || course.title || course.name) : "", course);
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
            ? "border-violet-500 ring-2 ring-violet-500/20 bg-white dark:bg-slate-800"
            : "border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800"
        } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"} ${buttonClassName}`}
      >
        <div className="flex items-center gap-2.5 min-w-0 truncate">
          <BookOpen
            size={16}
            className={`shrink-0 ${
              selectedCourse ? "text-violet-600" : "text-slate-400"
            }`}
          />
          {selectedCourse ? (
            <span className="font-semibold text-slate-900 dark:text-white truncate">
              {selectedCourse.title || selectedCourse.name}
            </span>
          ) : (
            <span className="text-slate-400 dark:text-slate-500 font-normal truncate">
              {placeholder}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 text-slate-400">
          {allowClear && selectedCourse && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              className="p-1 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors"
              title="Kursni tozalash"
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

      {/* MorphDropdown Menu Overlay */}
      <MorphDropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        triggerRef={btnRef}
        align="left"
        matchTriggerWidth={true}
        className="min-w-[280px]"
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
              placeholder="Kurs nomi bo'yicha qidiring..."
              className="w-full pl-8 pr-7 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
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
            <span>Jami: {courses.length} ta</span>
            <span>Topildi: {filteredCourses.length} ta</span>
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
                  ? "bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <span className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-[10px]">
                {!value ? "✓" : ""}
              </span>
              <span>-- Kurs tanlanmasin --</span>
            </button>
          )}

          {filteredCourses.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400">
              Qidiruv bo'yicha hech qanday kurs topilmadi
            </div>
          ) : (
            filteredCourses.map((c) => {
              const cId = c.id || c.title || c.name;
              const isSelected =
                String(cId) === String(value) ||
                c.title === value ||
                c.name === value;

              return (
                <button
                  key={cId}
                  type="button"
                  onClick={() => handleSelect(c)}
                  className={`morph-menu-item w-full flex items-center justify-between p-2 rounded-xl text-xs transition-all text-left cursor-pointer ${
                    isSelected
                      ? "bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 font-bold border border-violet-200 dark:border-violet-800/60"
                      : "text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "bg-violet-600 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      <BookOpen size={13} />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-bold">
                        {c.title || c.name}
                      </div>
                      {c.category && (
                        <div className="text-[10px] text-slate-400 font-normal truncate">
                          {c.category}
                        </div>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <Check size={14} className="text-violet-600 shrink-0" />
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

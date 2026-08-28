import { useState, useMemo } from "react";
import { Search, User, ClipboardList, GraduationCap } from "lucide-react";
import { GLASS, INPUT_CLS } from "../theme/tokens";
import { opGroups, opStudentsInGroups } from "../utils/dataHelpers";
import { normalizePhone } from "../utils/helpers";

export function SearchBox({ scopeBranches, directorData, opData, goTo }) {
  const [query, setQuery] = useState("");
  const branchIds = (scopeBranches || []).map((b) => b.id);
  const courses = (directorData?.courses || []).filter((c) =>
    branchIds.length === 0 || branchIds.includes(c.branchId),
  );
  const courseIds = courses.map((c) => c.id);
  const groups = opGroups(opData).filter((g) =>
    branchIds.length === 0 || courseIds.includes(g.courseId),
  );
  const teachers = (directorData?.teachersHR || []).filter((t) =>
    branchIds.length === 0 || branchIds.includes(t.branchId),
  );
  const students = opData?.students || [];

  const results = useMemo(() => {
    if (!query.trim() || query.trim().length < 2) return [];
    const q = query.toLowerCase();
    const qDigits = normalizePhone(query);
    const out = [];
    students.forEach((s) => {
      if (
        (s.name && s.name.toLowerCase().includes(q)) ||
        (qDigits && s.phone && normalizePhone(s.phone).includes(qDigits))
      )
        out.push({ type: "student", id: s.id, label: s.name, sub: "O'quvchi" });
    });
    groups.forEach((g) => {
      if (g.name && g.name.toLowerCase().includes(q))
        out.push({ type: "group", id: g.id, label: g.name, sub: "Guruh" });
    });
    teachers.forEach((t) => {
      if (t.name && t.name.toLowerCase().includes(q))
        out.push({
          type: "teacher",
          id: t.id,
          label: t.name,
          sub: "O'qituvchi",
        });
    });
    return out.slice(0, 8);
  }, [query, students, groups, teachers]);

  function selectResult(r) {
    setQuery("");
    if (r.type === "student") goTo("students");
    if (r.type === "group") goTo("groups");
    if (r.type === "teacher") goTo("teachers");
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Qidirish..."
          className={`${INPUT_CLS} pl-9 w-36 sm:w-56`}
        />
      </div>
      {results.length > 0 && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setQuery("")} />
          <div
            className={`${GLASS} rounded-xl p-2 absolute right-0 top-11 z-50 w-64 max-h-72 overflow-y-auto shadow-xl`}
          >
            {results.map((r) => (
              <button
                key={r.type + r.id}
                onClick={() => selectResult(r)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-left"
              >
                {r.type === "student" && (
                  <User size={14} className="text-slate-400 shrink-0" />
                )}
                {r.type === "group" && (
                  <ClipboardList
                    size={14}
                    className="text-slate-400 shrink-0"
                  />
                )}
                {r.type === "teacher" && (
                  <GraduationCap
                    size={14}
                    className="text-slate-400 shrink-0"
                  />
                )}
                <span className="truncate flex-1">{r.label}</span>
                <span className="text-slate-400 text-[11px] shrink-0">
                  {r.sub}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

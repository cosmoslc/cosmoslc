import { useState, useMemo } from "react";
import {
  Users,
  Clock,
  Calendar,
  DoorOpen,
  Plus,
  Search,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  Trash2,
  UserPlus,
  ClipboardList,
  Check,
  X,
  AlertTriangle,
  HelpCircle,
  LayoutList,
  LayoutGrid,
  CheckCheck,
  CalendarDays,
  Sparkles,
  BookOpen,
  Award,
  Phone,
  Wallet,
  FileText,
  MessageSquare,
} from "lucide-react";
import {
  BTN_GHOST,
  BTN_ICON,
  BTN_PRIMARY,
  INPUT_CLS,
} from "../../../shared/theme/tokens";
import {
  Avatar,
  EmptyState,
  StarRating,
} from "../../../shared/components/primitives";
import { AttendanceSection } from "../components/AttendanceSection";
import { GroupExamsSection } from "../components/GroupExamsSection";
import { GroupChatSection } from "../components/GroupChatSection";
import {
  getGroupStudents,
  rankStudents,
  withGroupId,
  attendanceStatus,
} from "../utils/dataHelpers";
import { formatDate, todayISO, countClassDaysSince, displayPhone, money } from "../utils/helpers";
import { calculateStudentRealBalance } from "../../../shared/utils/prorata";

const UZ_MONTHS = [
  "Yanvar",
  "Fevral",
  "Mart",
  "Aprel",
  "May",
  "Iyun",
  "Iyul",
  "Avgust",
  "Sentyabr",
  "Oktyabr",
  "Noyabr",
  "Dekabr",
];

function formatLastActivity(isoOrTs) {
  if (!isoOrTs) return "Noma'lum";
  try {
    const d = new Date(isoOrTs);
    if (isNaN(d.getTime())) return "Noma'lum";
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 2) return "Hozirgina";
    if (diffMins < 60) return `${diffMins} daqiqa oldin`;
    if (diffHours < 24) return `${diffHours} soat oldin`;
    if (diffDays === 1) return "Kecha";
    if (diffDays < 7) return `${diffDays} kun oldin`;

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  } catch {
    return "Noma'lum";
  }
}

const ATTENDANCE_ACTIONS = [
  {
    id: "present",
    label: "Bor",
    short: "✓",
    icon: Check,
    color: "text-emerald-500",
    bgClass:
      "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30",
    activeClass: "bg-emerald-500 text-white shadow-sm shadow-emerald-500/40",
  },
  {
    id: "absent",
    label: "Yo'q",
    short: "✕",
    icon: X,
    color: "text-rose-500",
    bgClass:
      "bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/40 hover:bg-rose-500/30",
    activeClass: "bg-rose-500 text-white shadow-sm shadow-rose-500/40",
  },
  {
    id: "late",
    label: "Kech",
    short: "!",
    icon: AlertTriangle,
    color: "text-amber-500",
    bgClass:
      "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40 hover:bg-amber-500/30",
    activeClass: "bg-amber-500 text-white shadow-sm shadow-amber-500/40",
  },
  {
    id: "excused",
    label: "Sababli",
    short: "?",
    icon: HelpCircle,
    color: "text-sky-500",
    bgClass:
      "bg-sky-500/20 text-sky-600 dark:text-sky-400 border-sky-500/40 hover:bg-sky-500/30",
    activeClass: "bg-sky-500 text-white shadow-sm shadow-sky-500/40",
  },
];

// Helper to check if a day matches group schedule
function isGroupLessonDay(dateObj, groupDays = []) {
  if (!Array.isArray(groupDays) || groupDays.length === 0) return false;
  const dow = (dateObj.getDay() + 6) % 7; // 0: Mon, 1: Tue, ... 6: Sun
  const fullNames = [
    "Dushanba",
    "Seshanba",
    "Chorshanba",
    "Payshanba",
    "Juma",
    "Shanba",
    "Yakshanba",
  ];
  const shortNames = ["Dush", "Ses", "Chor", "Pay", "Juma", "Shan", "Yak"];
  const miniNames = ["Du", "Se", "Cho", "Pa", "Ju", "Sha", "Ya"];

  const fullName = fullNames[dow].toLowerCase();
  const shortName = shortNames[dow].toLowerCase();
  const miniName = miniNames[dow].toLowerCase();

  return groupDays.some((gd) => {
    if (typeof gd !== "string") return false;
    const lower = gd.toLowerCase().trim();
    return (
      lower === fullName ||
      lower === shortName ||
      lower === miniName ||
      fullName.startsWith(lower) ||
      lower.startsWith(miniName)
    );
  });
}

// Format days array to full visible list
function formatDaysList(days) {
  if (!days) return [];
  if (Array.isArray(days)) {
    return days.filter(Boolean);
  }
  if (typeof days === "string") {
    return days
      .split(/[,;\s]+/)
      .map((d) => d.trim())
      .filter(Boolean);
  }
  return [];
}

export function GroupsView({
  appData,
  directorData,
  openModal,
  courses = [],
  goTo,
  markSubmission,
  markAttendance,
  markGrade,
  saveAttendance,
  addExam,
  updateExam,
  deleteExam,
  saveExamResults,
  selectedTaskId,
  setSelectedTaskId,
}) {
  // Main view settings
  const [viewMode, setViewMode] = useState("list"); // "list" | "grid"
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  const groups = appData?.groups || [];
  const rooms = directorData?.rooms || appData?.rooms || [];

  // If a group is selected, open the Group Page with Davomat tab active by default
  const selectedGroup = selectedGroupId
    ? groups.find((g) => String(g.id) === String(selectedGroupId))
    : null;

  if (selectedGroup) {
    return (
      <GroupDetailPage
        group={selectedGroup}
        appData={appData}
        directorData={directorData}
        courses={courses}
        openModal={openModal}
        markAttendance={markAttendance}
        markGrade={markGrade}
        saveAttendance={saveAttendance}
        markSubmission={markSubmission}
        addExam={addExam}
        updateExam={updateExam}
        deleteExam={deleteExam}
        saveExamResults={saveExamResults}
        onBack={() => setSelectedGroupId(null)}
      />
    );
  }

  // Filter groups by search query
  const filteredGroups = groups.filter((g) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const gName = (g.name || "").toLowerCase();
    const gTime = (g.time || g.lessonTime || "").toLowerCase();
    const room = rooms.find((r) => String(r.id) === String(g.roomId));
    const roomName = (room?.name || g.roomName || g.room || "").toLowerCase();
    const daysList = formatDaysList(g.days).join(" ").toLowerCase();
    return (
      gName.includes(q) ||
      gTime.includes(q) ||
      roomName.includes(q) ||
      daysList.includes(q)
    );
  });

  // Total unique students across all groups
  const totalStudentsSet = new Set();
  groups.forEach((g) => {
    (appData?.students || []).forEach((s) => {
      if (
        (Array.isArray(s.groupIds) &&
          s.groupIds.some((id) => String(id) === String(g.id))) ||
        String(s.groupId) === String(g.id)
      ) {
        totalStudentsSet.add(s.id);
      }
    });
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Guruhlar
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            {groups.length} ta guruh · jami {totalStudentsSet.size} o'quvchi
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* View Mode Switcher: Ro'yxat vs Katak */}
          <div className="flex items-center p-1 rounded-2xl bg-white/60 dark:bg-white/10 backdrop-blur-xl border border-white/60 dark:border-white/15 shadow-sm">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              title="Ro'yxat ko'rinishi"
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === "list"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <LayoutList size={16} />
              <span className="hidden sm:inline">Ro'yxat</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              title="Katak ko'rinishi"
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === "grid"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <LayoutGrid size={16} />
              <span className="hidden sm:inline">Katak</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Guruh, xona yoki dars kunlari bo'yicha qidirish"
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/60 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all shadow-sm"
        />
      </div>

      {/* Main Groups View Content */}
      {groups.length === 0 ? (
        <div className="rounded-3xl bg-white/40 dark:bg-white/5 backdrop-blur-2xl border border-white/60 dark:border-white/10 p-8 shadow-sm">
          <EmptyState
            icon={Users}
            title="Hali guruh yo'q"
            subtitle="Guruhlar administrator yoki direktor tomonidan biriktiriladi."
          />
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="py-12 text-center text-xs sm:text-sm text-slate-400 rounded-3xl bg-white/40 dark:bg-white/5 backdrop-blur-2xl border border-white/60 dark:border-white/10">
          Qidiruv bo'yicha guruh topilmadi
        </div>
      ) : viewMode === "list" ? (
        /* MODE 1: RO'YXAT (Each group as a distinct, elevated, separated card) */
        <div className="space-y-3">
          {filteredGroups.map((g) => {
            const name = g.name || "Guruh";
            const timeStr = g.time || g.lessonTime || "Belgilanmagan";
            const room = rooms.find((r) => String(r.id) === String(g.roomId));
            const roomName =
              room?.name ||
              g.roomName ||
              (typeof g.room === "string" ? g.room : g.room?.name) ||
              "Belgilanmagan";

            const daysList = formatDaysList(g.days);

            const studentCount = (appData?.students || []).filter((s) => {
              if (Array.isArray(s.groupIds)) {
                return s.groupIds.some((id) => String(id) === String(g.id));
              }
              return String(s.groupId) === String(g.id);
            }).length;

            const course = courses.find(
              (c) => String(c.id) === String(g.courseId)
            );

            const groupColor = g.color || "#3b82f6";

            return (
              <div
                key={g.id}
                onClick={() => setSelectedGroupId(g.id)}
                className="group relative overflow-hidden rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-2 border-slate-200/90 dark:border-white/15 hover:border-blue-500/80 dark:hover:border-blue-400/80 p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col lg:grid lg:grid-cols-12 lg:gap-4 lg:items-center gap-3.5"
              >
                {/* Left accent color bar */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1.5 transition-all group-hover:w-2.5"
                  style={{ backgroundColor: groupColor }}
                />

                {/* Ambient glow */}
                <div
                  className="absolute -right-8 -top-8 w-28 h-28 rounded-full blur-2xl pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity"
                  style={{ backgroundColor: groupColor }}
                />

                {/* 1. Guruh nomi & Icon */}
                <div className="col-span-3 flex items-center gap-3 min-w-0 pl-1.5">
                  <div
                    className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-white font-bold shadow-md transition-transform group-hover:scale-105"
                    style={{
                      backgroundColor: groupColor,
                      boxShadow: `0 4px 12px ${groupColor}40`,
                    }}
                  >
                    <BookOpen size={18} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                      {name}
                    </h3>
                    {course && (
                      <p className="text-xs text-slate-400 truncate mt-0.5 font-medium">
                        {course.name}
                      </p>
                    )}
                  </div>
                </div>

                {/* 2. Vaqti */}
                <div className="col-span-2 flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200">
                  <Clock size={14} className="text-blue-500 shrink-0" />
                  <span className="font-bold px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400">
                    {timeStr}
                  </span>
                </div>

                {/* 3. Xona */}
                <div className="col-span-2 flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200">
                  <DoorOpen size={14} className="text-emerald-500 shrink-0" />
                  <span className="font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    {roomName}
                  </span>
                </div>

                {/* 4. Dars kunlari */}
                <div className="col-span-3 flex items-center gap-1.5 flex-wrap text-xs">
                  <Calendar size={14} className="text-amber-500 shrink-0 mr-0.5" />
                  {daysList.length === 0 ? (
                    <span className="text-slate-400 italic text-xs">Belgilanmagan</span>
                  ) : (
                    daysList.map((day, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25 text-[11px] font-bold shadow-xs"
                      >
                        {day}
                      </span>
                    ))
                  )}
                </div>

                {/* 5. O'quvchi soni & O'tish tugmasi */}
                <div className="col-span-2 flex items-center justify-between lg:justify-end gap-3 text-right">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/25 text-xs font-black shrink-0 shadow-xs">
                    <Users size={13} />
                    <span>{studentCount} o'quvchi</span>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/10 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center text-slate-400 transition-all">
                    <ChevronRight size={16} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* MODE 2: KATAK (Box / Card Grid with high-contrast distinct borders & glow) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredGroups.map((g) => {
            const name = g.name || "Guruh";
            const timeStr = g.time || g.lessonTime || "Belgilanmagan";
            const room = rooms.find((r) => String(r.id) === String(g.roomId));
            const roomName =
              room?.name ||
              g.roomName ||
              (typeof g.room === "string" ? g.room : g.room?.name) ||
              "Belgilanmagan";

            const daysList = formatDaysList(g.days);

            const studentCount = (appData?.students || []).filter((s) => {
              if (Array.isArray(s.groupIds)) {
                return s.groupIds.some((id) => String(id) === String(g.id));
              }
              return String(s.groupId) === String(g.id);
            }).length;

            const course = courses.find(
              (c) => String(c.id) === String(g.courseId)
            );

            const groupColor = g.color || "#3b82f6";

            return (
              <div
                key={g.id}
                onClick={() => setSelectedGroupId(g.id)}
                className="group relative overflow-hidden rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-2 border-slate-200 dark:border-white/15 hover:border-blue-500 dark:hover:border-blue-400 p-5 sm:p-6 shadow-[0_10px_35px_rgba(0,0,0,0.06)] dark:shadow-[0_14px_45px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_50px_rgba(59,130,246,0.22)] transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between gap-5"
              >
                {/* Top Accent Gradient Bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-2 opacity-95 transition-all group-hover:h-2.5"
                  style={{
                    background: `linear-gradient(90deg, ${groupColor}, #6366f1, #3b82f6)`,
                  }}
                />

                {/* Ambient Glow Aura */}
                <div
                  className="absolute -right-12 -top-12 w-40 h-40 rounded-full blur-3xl pointer-events-none opacity-25 group-hover:opacity-55 transition-opacity"
                  style={{ backgroundColor: groupColor }}
                />

                {/* Top: Icon + Name + Course + Student badge */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2 pt-1">
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Glowing Icon Badge */}
                      <div
                        className="w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center text-white font-bold text-base shadow-lg transition-transform group-hover:scale-110"
                        style={{
                          backgroundColor: groupColor,
                          boxShadow: `0 6px 18px ${groupColor}50`,
                        }}
                      >
                        <BookOpen size={20} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                          {name}
                        </h3>
                        {course && (
                          <p className="text-xs text-slate-400 font-medium truncate mt-0.5">
                            {course.name}
                          </p>
                        )}
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 text-xs font-black shrink-0 shadow-xs">
                      <Users size={13} />
                      {studentCount}
                    </span>
                  </div>
                </div>

                {/* Meta properties with clean high-contrast rounded panels */}
                <div className="space-y-2.5 pt-3 border-t border-slate-200/80 dark:border-white/10 text-xs">
                  {/* Vaqti */}
                  <div className="flex items-center justify-between gap-2 text-slate-700 dark:text-slate-200">
                    <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                      <Clock size={14} className="text-blue-500" /> Vaqti:
                    </span>
                    <span className="font-bold px-2.5 py-1 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400">
                      {timeStr}
                    </span>
                  </div>

                  {/* Xona */}
                  <div className="flex items-center justify-between gap-2 text-slate-700 dark:text-slate-200">
                    <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                      <DoorOpen size={14} className="text-emerald-500" /> Xona:
                    </span>
                    <span className="font-bold px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                      {roomName}
                    </span>
                  </div>

                  {/* Dars kunlari */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-slate-400 flex items-center gap-1.5 text-[11px] font-medium">
                      <Calendar size={13} className="text-amber-500" /> Dars kunlari:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {daysList.length === 0 ? (
                        <span className="text-slate-400 text-xs italic">
                          Belgilanmagan
                        </span>
                      ) : (
                        daysList.map((day, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25 text-[11px] font-bold shadow-xs"
                          >
                            {day}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-3 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/10 border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-300 font-semibold">
                      <MessageSquare size={12} className="text-blue-500" /> Chat mavjud
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold group-hover:translate-x-1 transition-transform">
                    <span>Guruhga kirish</span>
                    <ChevronRight size={16} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// GROUP DETAIL PAGE: When a group is clicked, opens this page with menus, FIRST IS DAVOMAT!
function GroupDetailPage({
  group,
  appData,
  directorData,
  courses,
  openModal,
  markAttendance,
  markGrade,
  saveAttendance,
  markSubmission,
  addExam,
  updateExam,
  deleteExam,
  saveExamResults,
  onBack,
}) {
  // First tab is DAVOMAT as specifically requested!
  const [subTab, setSubTab] = useState("attendance"); // "attendance" | "grades" | "tasks" | "exams" | "chat"
  const [studentViewMode, setStudentViewMode] = useState("list"); // "list" | "grid"

  const students = getGroupStudents(appData, group.id);
  const ranked = rankStudents(withGroupId(students, group.id), appData.tasks);

  // Compute latest activity for students in this group
  const studentActivityMap = useMemo(() => {
    const map = {};
    (appData?.tasks || []).forEach((t) => {
      if (!t.submissions) return;
      Object.entries(t.submissions).forEach(([sId, sub]) => {
        const time = sub?.submittedAt || sub?.gradedAt;
        if (time) {
          if (!map[sId] || new Date(time) > new Date(map[sId])) {
            map[sId] = time;
          }
        }
      });
    });
    (appData?.attendance || []).forEach((att) => {
      if (!att.records) return;
      Object.entries(att.records).forEach(([sId, entry]) => {
        if (entry) {
          const time = att.date ? `${att.date}T12:00:00` : null;
          if (time && (!map[sId] || new Date(time) > new Date(map[sId]))) {
            map[sId] = time;
          }
        }
      });
    });
    students.forEach((s) => {
      if (!map[s.id]) {
        map[s.id] = s.lastActive || s.joinedAt || s.createdAt || null;
      }
    });
    return map;
  }, [appData?.tasks, appData?.attendance, students]);

  // Real balance map identical to Admin StudentsPage
  const realBalanceMap = useMemo(() => {
    const map = {};
    const allGroups = appData?.allGroups || appData?.groups || [];
    const payments = appData?.payments || directorData?.payments || [];
    const centerSettings =
      appData?.centerSettings || directorData?.centerSettings || {};
    const attendances = appData?.attendance || [];

    (students || []).forEach((s) => {
      map[s.id] = calculateStudentRealBalance({
        student: s,
        groups: allGroups,
        payments,
        attendances,
        centerSettings,
      });
    });
    return map;
  }, [
    students,
    appData?.allGroups,
    appData?.groups,
    appData?.payments,
    directorData?.payments,
    appData?.centerSettings,
    directorData?.centerSettings,
    appData?.attendance,
  ]);
  const course = (courses || []).find(
    (c) => String(c.id) === String(group.courseId)
  );
  const rooms = directorData?.rooms || appData?.rooms || [];
  const room = rooms.find((r) => String(r.id) === String(group.roomId));
  const roomName =
    room?.name ||
    group.roomName ||
    (typeof group.room === "string" ? group.room : group.room?.name) ||
    "Xona belgilanmagan";

  const timeStr = group.time || group.lessonTime || "Belgilanmagan";
  const daysList = formatDaysList(group.days);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top back navigation */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/60 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 border border-white/60 dark:border-white/15 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all shadow-sm"
        >
          <ArrowLeft size={14} />
          <span>Guruhlar ro'yxatiga qaytish</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => openModal({ type: "addStudent", groupId: group.id })}
            className={BTN_PRIMARY}
          >
            <UserPlus size={15} />
            <span>O'quvchi qo'shish</span>
          </button>

          <button
            type="button"
            onClick={() =>
              openModal({
                type: "confirm",
                message: `"${group.name}" guruhini o'chirasizmi? Bog'liq barcha vazifalar ham o'chib ketadi.`,
                action: { kind: "deleteGroup", groupId: group.id },
              })
            }
            className={BTN_ICON}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* UNIFIED SINGLE LIQUID GLASS CONTAINER (Header + Tabs + Content in ONE Box) */}
      <div className="relative overflow-hidden rounded-3xl bg-white/40 dark:bg-white/5 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
        <div
          className="absolute -right-16 -top-16 w-52 h-52 rounded-full blur-3xl pointer-events-none opacity-20"
          style={{ backgroundColor: group.color || "#006aff" }}
        />

        {/* SECTION 1: Group Header & Quick Info (Compact & Space-efficient) */}
        <div className="p-4 sm:p-5 border-b border-slate-200/60 dark:border-white/10 relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full shrink-0 shadow-xs"
                style={{ backgroundColor: group.color || "#006aff" }}
              />
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  {group.name}
                </h2>
                {course && (
                  <p className="text-xs text-slate-400">
                    📚 Kurs: {course.name}
                    {group.price
                      ? ` · ${Number(group.price).toLocaleString("uz-UZ")} so'm/oy`
                      : ""}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs flex-wrap">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/60 dark:bg-white/10 border border-white/60 dark:border-white/15 text-slate-700 dark:text-slate-300">
                <Clock size={13} className="text-blue-500" />
                <span className="font-semibold">{timeStr}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/60 dark:bg-white/10 border border-white/60 dark:border-white/15 text-slate-700 dark:text-slate-300">
                <DoorOpen size={13} className="text-emerald-500" />
                <span className="font-semibold">{roomName}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 font-bold">
                <Users size={13} />
                <span>{students.length} o'quvchi</span>
              </div>
            </div>
          </div>

          {/* Sub Menus: 1st Davomat, 2nd Ballar, 3rd Vazifalar, 4th Imtihonlar */}
          <div className="flex items-center gap-1.5 mt-3.5 pt-3 border-t border-slate-200/40 dark:border-white/5 overflow-x-auto">
            <button
              type="button"
              onClick={() => setSubTab("attendance")}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
                subTab === "attendance"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/10"
              }`}
            >
              <Calendar size={14} />
              <span>Davomat</span>
            </button>

            <button
              type="button"
              onClick={() => setSubTab("grades")}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
                subTab === "grades"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/10"
              }`}
            >
              <Award size={14} />
              <span>Ballar</span>
            </button>

            <button
              type="button"
              onClick={() => setSubTab("tasks")}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
                subTab === "tasks"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/10"
              }`}
            >
              <ClipboardList size={14} />
              <span>Vazifalar</span>
            </button>

            <button
              type="button"
              onClick={() => setSubTab("exams")}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
                subTab === "exams"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/10"
              }`}
            >
              <FileText size={14} />
              <span>Imtihonlar</span>
            </button>

            <button
              type="button"
              onClick={() => setSubTab("chat")}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
                subTab === "chat"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/10"
              }`}
            >
              <MessageSquare size={14} />
              <span>Chat</span>
            </button>
          </div>
        </div>

        {/* SECTION 2: Unified Tab Content (Seamless inside the same container) */}
        <div className="p-4 sm:p-5">
          {/* SUB-TAB 1: DAVOMAT */}
          {subTab === "attendance" && (
            <GroupAttendanceSheet
              group={group}
              students={students}
              appData={appData}
              markAttendance={markAttendance}
              saveAttendance={saveAttendance}
            />
          )}

          {/* SUB-TAB 2: BALLAR */}
          {subTab === "grades" && (
            <GroupGradesSheet
              group={group}
              students={students}
              appData={appData}
              markGrade={markGrade}
            />
          )}

          {/* SUB-TAB 3: VAZIFALAR */}
          {subTab === "tasks" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Guruh vazifalari
                </h3>
                <button
                  type="button"
                  onClick={() => openModal({ type: "createTask", groupId: group.id })}
                  className={BTN_PRIMARY}
                >
                  <Plus size={14} />
                  <span>Yangi vazifa</span>
                </button>
              </div>

              {(() => {
                const groupTasks = (appData?.tasks || []).filter(
                  (t) => String(t.groupId) === String(group.id)
                );

                if (groupTasks.length === 0) {
                  return (
                    <EmptyState
                      icon={ClipboardList}
                      title="Hali vazifa berilmagan"
                      subtitle="Ushbu guruh uchun birinchi vazifani yarating."
                    />
                  );
                }

                return (
                  <div className="divide-y divide-slate-200/50 dark:divide-white/10">
                    {groupTasks.map((t) => (
                      <div key={t.id} className="py-3 px-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {t.title}
                        </h4>
                        {t.description && (
                          <p className="text-xs text-slate-400 mt-1">
                            {t.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {/* SUB-TAB 4: IMTIHONLAR */}
          {subTab === "exams" && (
            <GroupExamsSection
              group={group}
              students={students}
              appData={appData}
              addExam={addExam}
              updateExam={updateExam}
              deleteExam={deleteExam}
              saveExamResults={saveExamResults}
              openModal={openModal}
            />
          )}

          {/* SUB-TAB 5: CHAT */}
          {subTab === "chat" && (
            <GroupChatSection
              group={group}
              students={students}
              appData={appData}
              directorData={directorData}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// GROUP ATTENDANCE SHEET: Designed for laptops, left students only, right styled checkboxes with hover action icons
function GroupAttendanceSheet({
  group,
  students,
  appData,
  markAttendance,
  saveAttendance,
}) {
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth()); // 0-11
  const todayIsoStr = todayISO();

  // Calculate actual lesson dates for the selected month according to group's days
  const lessonDates = useMemo(() => {
    const dates = [];
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const shortDayNames = ["Du", "Se", "Cho", "Pa", "Ju", "Sha", "Ya"];

    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(selectedYear, selectedMonth, day);
      if (isGroupLessonDay(d, group.days)) {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const iso = `${yyyy}-${mm}-${dd}`;
        const dow = (d.getDay() + 6) % 7;
        dates.push({
          iso,
          dayNum: day,
          dayName: shortDayNames[dow],
          isToday: iso === todayIsoStr,
        });
      }
    }

    // Fallback if no specific days match: generate weekdays
    if (dates.length === 0) {
      for (let day = 1; day <= daysInMonth; day++) {
        const d = new Date(selectedYear, selectedMonth, day);
        const dow = (d.getDay() + 6) % 7;
        if (dow !== 6) {
          // skip sunday
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, "0");
          const dd = String(d.getDate()).padStart(2, "0");
          const iso = `${yyyy}-${mm}-${dd}`;
          dates.push({
            iso,
            dayNum: day,
            dayName: shortDayNames[dow],
            isToday: iso === todayIsoStr,
          });
        }
      }
    }

    return dates;
  }, [selectedYear, selectedMonth, group.days, todayIsoStr]);

  // Month navigation helpers
  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  const handleCurrentMonth = () => {
    const d = new Date();
    setSelectedYear(d.getFullYear());
    setSelectedMonth(d.getMonth());
  };

  // Mark all present for today's lesson or selected date
  const handleMarkAllPresent = () => {
    const targetDate =
      lessonDates.find((d) => d.isToday)?.iso || lessonDates[0]?.iso;
    if (!targetDate) return;
    students.forEach((s) => {
      markAttendance(group.id, targetDate, s.id, "present");
    });
  };

  // Build a lookup map for faster access: recordsMap[date][studentId] = status
  const attendanceRecords = appData?.attendance || [];
  const statusLookup = useMemo(() => {
    const map = {};
    attendanceRecords.forEach((rec) => {
      if (String(rec.groupId) === String(group.id)) {
        if (!map[rec.date]) map[rec.date] = {};
        if (rec.records) {
          Object.entries(rec.records).forEach(([sId, entry]) => {
            const st = typeof entry === "string" ? entry : entry?.status;
            map[rec.date][sId] = st;
          });
        }
      }
    });
    return map;
  }, [attendanceRecords, group.id]);

  return (
    <div className="space-y-4">
      {/* Top Controls: Yil va Oy selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-200/60 dark:border-white/10">
        {/* Month & Year pickers */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center p-1 rounded-2xl bg-white/60 dark:bg-white/10 backdrop-blur-xl border border-white/60 dark:border-white/15 shadow-xs">
            <button
              type="button"
              onClick={handlePrevMonth}
              title="Oldingi oy"
              className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/10 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Month Select */}
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-transparent text-xs sm:text-sm font-bold text-slate-900 dark:text-white px-2 py-1 focus:outline-none cursor-pointer"
            >
              {UZ_MONTHS.map((m, idx) => (
                <option
                  key={idx}
                  value={idx}
                  className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {m}
                </option>
              ))}
            </select>

            {/* Year Select */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent text-xs sm:text-sm font-bold text-slate-900 dark:text-white px-2 py-1 focus:outline-none cursor-pointer"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option
                  key={y}
                  value={y}
                  className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {y}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleNextMonth}
              title="Keyingi oy"
              className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/10 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <button
            type="button"
            onClick={handleCurrentMonth}
            className="px-3 py-1.5 rounded-xl bg-white/60 dark:bg-white/10 border border-white/60 dark:border-white/15 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-white/20 transition-all shadow-xs"
          >
            Joriy oy
          </button>
        </div>

        {/* Action buttons and indicators */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {lessonDates.length} ta dars kuni
          </span>

          <button
            type="button"
            onClick={handleMarkAllPresent}
            disabled={students.length === 0 || lessonDates.length === 0}
            className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <CheckCheck size={14} />
            <span>Barchasiga "Bor" belgilash</span>
          </button>
        </div>
      </div>

      {/* Main Attendance Table: Designed to fit laptop screens */}
      {students.length === 0 ? (
        <div className="py-12 text-center text-xs sm:text-sm text-slate-400">
          Bu guruhda hali o'quvchilar yo'q. Avval o'quvchi qo'shing.
        </div>
      ) : (
        <div className="relative overflow-x-auto rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/30 dark:bg-white/[0.02]">
          <table className="min-w-max w-full text-left border-collapse select-none">
            <thead>
              <tr className="border-b border-slate-200/60 dark:border-white/10 bg-slate-100 dark:bg-[#0f172a]">
                {/* Left side: Talabalar faqat ismlar bilan xolos (Sticky) */}
                <th className="py-2.5 px-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-44 sm:w-56 min-w-[176px] sm:min-w-[224px] shrink-0 sticky left-0 z-30 bg-slate-100 dark:bg-[#0f172a] border-r border-slate-300 dark:border-white/15 shadow-[6px_0_12px_-4px_rgba(0,0,0,0.1)] dark:shadow-[6px_0_16px_-4px_rgba(0,0,0,0.7)]">
                  Talaba ismi
                </th>

                {/* Right side: Lesson Dates Columns */}
                {lessonDates.map((d) => (
                  <th
                    key={d.iso}
                    className={`py-2 px-1 text-center w-[52px] min-w-[52px] max-w-[52px] shrink-0 transition-colors ${
                      d.isToday
                        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    <div className="text-[10px] uppercase font-semibold leading-tight">
                      {d.dayName}
                    </div>
                    <div
                      className={`text-xs font-bold leading-tight mt-0.5 ${
                        d.isToday ? "text-blue-600 dark:text-blue-400" : ""
                      }`}
                    >
                      {String(d.dayNum).padStart(2, "0")}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200/50 dark:divide-white/10 text-xs">
              {students.map((student, sIdx) => (
                <tr
                  key={student.id}
                  className="hover:bg-slate-500/[0.03] dark:hover:bg-white/[0.02] transition-colors group/row"
                >
                  {/* Left Column: Talaba ismi xolos (Sticky) */}
                  <td className="py-2 px-3.5 font-semibold text-slate-900 dark:text-white w-44 sm:w-56 min-w-[176px] sm:min-w-[224px] shrink-0 sticky left-0 z-20 bg-white dark:bg-[#0f172a] border-r border-slate-200 dark:border-white/10 shadow-[6px_0_12px_-4px_rgba(0,0,0,0.08)] dark:shadow-[6px_0_16px_-4px_rgba(0,0,0,0.6)] whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 w-4 shrink-0">
                        {sIdx + 1}.
                      </span>
                      <span className="truncate max-w-[150px] sm:max-w-[190px]">
                        {student.name}
                      </span>
                    </div>
                  </td>

                  {/* Right Columns: Styled Checkboxes with Hover Icons */}
                  {lessonDates.map((d) => {
                    const status = statusLookup[d.iso]?.[student.id];

                    return (
                      <td
                        key={d.iso}
                        className={`p-1 text-center align-middle w-[52px] min-w-[52px] max-w-[52px] shrink-0 relative ${
                          d.isToday
                            ? "bg-blue-500/[0.03] dark:bg-blue-500/[0.02]"
                            : ""
                        }`}
                      >
                        <AttendanceCell
                          studentId={student.id}
                          groupId={group.id}
                          dateIso={d.iso}
                          currentStatus={status}
                          onSelectStatus={(newStatus) => {
                            markAttendance(
                              group.id,
                              d.iso,
                              student.id,
                              newStatus
                            );
                          }}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Legend / Status izohlari */}
      <div className="flex items-center justify-between flex-wrap gap-4 pt-3.5 border-t border-slate-200/60 dark:border-white/10 text-[11px] text-slate-500">
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 font-bold flex items-center justify-center text-xs">
              ✓
            </span>
            <span>Bor</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-md bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/40 font-bold flex items-center justify-center text-xs">
              ✕
            </span>
            <span>Yo'q</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40 font-bold flex items-center justify-center text-xs">
              !
            </span>
            <span>Kech</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-md bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/40 font-bold flex items-center justify-center text-xs">
              ?
            </span>
            <span>Sababli</span>
          </div>
        </div>

        <span className="italic text-slate-400">
          Katakcha ustiga olib borsangiz (hover) checkbox kengayib variantlar chiqadi
        </span>
      </div>
    </div>
  );
}

// Attendance Cell: Smooth Liquid Glass checkbox (36px, radius 14px) expanding to both sides without color glitch
function AttendanceCell({
  studentId,
  groupId,
  dateIso,
  currentStatus,
  onSelectStatus,
}) {
  const [isHovered, setIsHovered] = useState(false);

  // Status visual styles for collapsed checkbox (Liquid glass tinted)
  const statusStyles = {
    present:
      "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40 shadow-xs",
    absent:
      "bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/40 shadow-xs",
    late:
      "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40 shadow-xs",
    excused:
      "bg-sky-500/20 text-sky-600 dark:text-sky-400 border-sky-500/40 shadow-xs",
  };

  const defaultStyle =
    "bg-white/70 dark:bg-white/[0.05] border-slate-200/80 dark:border-white/10 text-slate-400 hover:border-blue-400/60";

  return (
    <div className="relative inline-flex items-center justify-center w-[36px] h-[36px] min-w-[36px] min-h-[36px] shrink-0">
      {/* THE CHECKBOX ITSELF - EXACT 36px HEIGHT & 14px RADIUS, EXPANDS SYMMETRICALLY (ZERO COLOR GLITCH) */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 h-[36px] rounded-[14px] border transition-all duration-200 ease-out flex items-center justify-center overflow-hidden ${
          isHovered
            ? "w-[160px] px-1.5 bg-white dark:bg-slate-900 border-slate-300 dark:border-white/20 shadow-xl z-50"
            : `w-[36px] cursor-pointer shadow-xs z-1 ${currentStatus ? statusStyles[currentStatus] : defaultStyle}`
        }`}
      >
        {/* CENTER ICON (Visible when collapsed, fades out on hover) */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-150 pointer-events-none ${
            isHovered ? "opacity-0" : "opacity-100"
          }`}
        >
          {currentStatus === "present" && (
            <Check size={16} strokeWidth={3} className="text-emerald-600 dark:text-emerald-400" />
          )}
          {currentStatus === "absent" && (
            <X size={16} strokeWidth={3} className="text-rose-600 dark:text-rose-400" />
          )}
          {currentStatus === "late" && (
            <span className="text-amber-600 dark:text-amber-400 font-extrabold text-[14px]">!</span>
          )}
          {currentStatus === "excused" && (
            <span className="text-sky-600 dark:text-sky-400 font-extrabold text-[13px]">?</span>
          )}
          {!currentStatus && (
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 opacity-60" />
          )}
        </div>

        {/* 4 OPTION BUTTONS (Permanently mounted for zero glitch, smoothly fades in when expanded) */}
        <div
          className={`w-full h-full flex items-center justify-between gap-1 transition-opacity duration-200 ${
            isHovered
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
        >
          {ATTENDANCE_ACTIONS.map((act) => {
            const isSelected = currentStatus === act.id;
            return (
              <button
                key={act.id}
                type="button"
                title={act.label}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectStatus(isSelected ? null : act.id);
                  setIsHovered(false);
                }}
                className={`w-[32px] h-[28px] rounded-[10px] flex items-center justify-center text-xs font-bold transition-all ${
                  isSelected
                    ? `${act.activeClass} shadow-xs`
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/15"
                }`}
              >
                {act.id === "present" && (
                  <Check
                    size={15}
                    strokeWidth={2.5}
                    className={isSelected ? "text-white" : "text-emerald-600 dark:text-emerald-400"}
                  />
                )}
                {act.id === "absent" && (
                  <X
                    size={15}
                    strokeWidth={2.5}
                    className={isSelected ? "text-white" : "text-rose-600 dark:text-rose-400"}
                  />
                )}
                {act.id === "late" && (
                  <span className={isSelected ? "text-white font-black text-xs" : "text-amber-600 dark:text-amber-400 font-black text-xs"}>
                    !
                  </span>
                )}
                {act.id === "excused" && (
                  <span className={isSelected ? "text-white font-black text-xs" : "text-sky-600 dark:text-sky-400 font-black text-xs"}>
                    ?
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// 1 dan 5 gacha ballar konfiguratsiyasi
const GRADE_CONFIG = [
  {
    value: 1,
    label: "1 ball",
    shortLabel: "Yomon",
    activeClass: "bg-rose-500 text-white shadow-xs",
    hoverClass: "text-rose-600 dark:text-rose-400 hover:bg-rose-500/20",
    badgeClass: "bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/40 shadow-xs",
  },
  {
    value: 2,
    label: "2 ball",
    shortLabel: "Qoniqarsiz",
    activeClass: "bg-orange-500 text-white shadow-xs",
    hoverClass: "text-orange-600 dark:text-orange-400 hover:bg-orange-500/20",
    badgeClass: "bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/40 shadow-xs",
  },
  {
    value: 3,
    label: "3 ball",
    shortLabel: "Qoniqarli",
    activeClass: "bg-amber-500 text-white shadow-xs",
    hoverClass: "text-amber-600 dark:text-amber-400 hover:bg-amber-500/20",
    badgeClass: "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40 shadow-xs",
  },
  {
    value: 4,
    label: "4 ball",
    shortLabel: "Yaxshi",
    activeClass: "bg-blue-500 text-white shadow-xs",
    hoverClass: "text-blue-600 dark:text-blue-400 hover:bg-blue-500/20",
    badgeClass: "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/40 shadow-xs",
  },
  {
    value: 5,
    label: "5 ball",
    shortLabel: "A'lo",
    activeClass: "bg-emerald-500 text-white shadow-xs",
    hoverClass: "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20",
    badgeClass: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40 shadow-xs",
  },
];

// Grade Cell: Smooth Liquid Glass box (36px, radius 14px) expanding to both sides with 1..5 numbers
function GradeCell({
  studentId,
  groupId,
  dateIso,
  currentGrade,
  onSelectGrade,
}) {
  const [isHovered, setIsHovered] = useState(false);

  const matchedConfig = GRADE_CONFIG.find((c) => c.value === Number(currentGrade));

  const defaultStyle =
    "bg-white/70 dark:bg-white/[0.05] border-slate-200/80 dark:border-white/10 text-slate-400 hover:border-blue-400/60";

  return (
    <div className="relative inline-flex items-center justify-center w-[36px] h-[36px] min-w-[36px] min-h-[36px] shrink-0">
      {/* THE BOX ITSELF - EXACT 36px HEIGHT & 14px RADIUS, EXPANDS SYMMETRICALLY */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 h-[36px] rounded-[14px] border transition-all duration-200 ease-out flex items-center justify-center overflow-hidden ${
          isHovered
            ? "w-[185px] px-1.5 bg-white dark:bg-slate-900 border-slate-300 dark:border-white/20 shadow-xl z-50"
            : `w-[36px] cursor-pointer shadow-xs z-1 ${matchedConfig ? matchedConfig.badgeClass : defaultStyle}`
        }`}
      >
        {/* CENTER NUMBER (Visible when collapsed, fades out on hover) */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-150 pointer-events-none ${
            isHovered ? "opacity-0" : "opacity-100"
          }`}
        >
          {matchedConfig ? (
            <span className="font-extrabold text-sm">{matchedConfig.value}</span>
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 opacity-60" />
          )}
        </div>

        {/* 5 OPTION BUTTONS (1, 2, 3, 4, 5) - mounted for zero glitch, fades in on expand */}
        <div
          className={`w-full h-full flex items-center justify-between gap-1 transition-opacity duration-200 ${
            isHovered
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
        >
          {GRADE_CONFIG.map((cfg) => {
            const isSelected = Number(currentGrade) === cfg.value;
            return (
              <button
                key={cfg.value}
                type="button"
                title={`${cfg.value} ball - ${cfg.shortLabel}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectGrade(isSelected ? null : cfg.value);
                  setIsHovered(false);
                }}
                className={`w-[30px] h-[28px] rounded-[10px] flex items-center justify-center text-xs font-black transition-all ${
                  isSelected
                    ? cfg.activeClass
                    : `${cfg.hoverClass} text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/15`
                }`}
              >
                {cfg.value}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// GROUP GRADES SHEET: Designed for laptops, left students names only, right styled cells with hover 1-5 rating
function GroupGradesSheet({
  group,
  students,
  appData,
  markGrade,
}) {
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth()); // 0-11
  const todayIsoStr = todayISO();

  // Calculate actual lesson dates for the selected month according to group's days
  const lessonDates = useMemo(() => {
    const dates = [];
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const shortDayNames = ["Du", "Se", "Cho", "Pa", "Ju", "Sha", "Ya"];

    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(selectedYear, selectedMonth, day);
      if (isGroupLessonDay(d, group.days)) {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const iso = `${yyyy}-${mm}-${dd}`;
        const dow = (d.getDay() + 6) % 7;
        dates.push({
          iso,
          dayNum: day,
          dayName: shortDayNames[dow],
          isToday: iso === todayIsoStr,
        });
      }
    }

    if (dates.length === 0) {
      for (let day = 1; day <= daysInMonth; day++) {
        const d = new Date(selectedYear, selectedMonth, day);
        const dow = (d.getDay() + 6) % 7;
        if (dow !== 6) {
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, "0");
          const dd = String(d.getDate()).padStart(2, "0");
          const iso = `${yyyy}-${mm}-${dd}`;
          dates.push({
            iso,
            dayNum: day,
            dayName: shortDayNames[dow],
            isToday: iso === todayIsoStr,
          });
        }
      }
    }

    return dates;
  }, [selectedYear, selectedMonth, group.days, todayIsoStr]);

  // Month navigation helpers
  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  const handleCurrentMonth = () => {
    const d = new Date();
    setSelectedYear(d.getFullYear());
    setSelectedMonth(d.getMonth());
  };

  // Build a lookup map for faster access: gradesLookup[date][studentId] = grade (1..5 or undefined)
  const attendanceRecords = appData?.attendance || [];
  const gradesLookup = useMemo(() => {
    const map = {};
    attendanceRecords.forEach((rec) => {
      if (String(rec.groupId) === String(group.id)) {
        if (!map[rec.date]) map[rec.date] = {};
        if (rec.records) {
          Object.entries(rec.records).forEach(([sId, entry]) => {
            const gr = typeof entry === "object" ? entry?.grade : undefined;
            if (gr !== undefined && gr !== null && gr !== "") {
              map[rec.date][sId] = Number(gr);
            }
          });
        }
      }
    });
    return map;
  }, [attendanceRecords, group.id]);

  // Student averages
  const studentAverages = useMemo(() => {
    const map = {};
    students.forEach((s) => {
      let sum = 0;
      let count = 0;
      lessonDates.forEach((d) => {
        const val = gradesLookup[d.iso]?.[s.id];
        if (val) {
          sum += val;
          count += 1;
        }
      });
      map[s.id] = count > 0 ? (sum / count).toFixed(1) : null;
    });
    return map;
  }, [students, lessonDates, gradesLookup]);

  const monthNames = [
    "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
    "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr",
  ];

  return (
    <div className="space-y-4">
      {/* Top Controls: Yil va Oy selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-200/60 dark:border-white/10">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center p-1 rounded-2xl bg-white/60 dark:bg-white/10 backdrop-blur-xl border border-white/60 dark:border-white/15 shadow-xs">
            <button
              type="button"
              onClick={handlePrevMonth}
              title="Oldingi oy"
              className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/10 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-transparent text-sm font-bold text-slate-800 dark:text-white px-2 py-1 outline-hidden cursor-pointer"
            >
              {monthNames.map((name, idx) => (
                <option
                  key={name}
                  value={idx}
                  className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  {name}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent text-sm font-bold text-slate-800 dark:text-white px-2 py-1 outline-hidden cursor-pointer"
            >
              {[2024, 2025, 2026, 2027].map((year) => (
                <option
                  key={year}
                  value={year}
                  className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  {year}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleNextMonth}
              title="Keyingi oy"
              className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/10 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <button
            type="button"
            onClick={handleCurrentMonth}
            className="px-3 py-1.5 rounded-xl bg-white/60 dark:bg-white/10 border border-white/60 dark:border-white/15 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-white/20 transition-all shadow-xs"
          >
            Joriy oy
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {lessonDates.length} ta dars
          </span>
          <span>·</span>
          <span>{students.length} ta o'quvchi</span>
        </div>
      </div>

      {/* Main Table Container */}
      {students.length === 0 ? (
        <EmptyState
          icon={Users}
          title="O'quvchilar mavjud emas"
          description="Ushbu guruhga hali o'quvchilar qo'shilmagan."
        />
      ) : (
        <div className="relative overflow-x-auto rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/30 dark:bg-white/[0.02]">
          <table className="min-w-max w-full text-left border-collapse select-none">
            <thead>
              <tr className="border-b border-slate-200/60 dark:border-white/10 bg-slate-100 dark:bg-[#0f172a]">
                {/* Left side: Talabalar faqat ismlar bilan xolos (Sticky) */}
                <th className="py-2.5 px-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-44 sm:w-56 min-w-[176px] sm:min-w-[224px] shrink-0 sticky left-0 z-30 bg-slate-100 dark:bg-[#0f172a] border-r border-slate-300 dark:border-white/15 shadow-[6px_0_12px_-4px_rgba(0,0,0,0.1)] dark:shadow-[6px_0_16px_-4px_rgba(0,0,0,0.7)]">
                  Talaba ismi
                </th>

                {/* Dars kunlari */}
                {lessonDates.map((d) => (
                  <th
                    key={d.iso}
                    className={`py-2 px-1 text-center w-[52px] min-w-[52px] max-w-[52px] shrink-0 transition-colors ${
                      d.isToday
                        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-semibold opacity-70">
                        {d.dayName}
                      </span>
                      <span
                        className={`text-xs mt-0.5 w-6 h-6 flex items-center justify-center rounded-full ${
                          d.isToday
                            ? "bg-blue-600 text-white font-bold shadow-xs"
                            : "font-semibold text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {d.dayNum}
                      </span>
                    </div>
                  </th>
                ))}

                {/* Right side: O'rtacha ball */}
                <th className="py-2.5 px-3 text-center text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 min-w-[65px] border-l border-slate-200/60 dark:border-white/10">
                  O'rtacha
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200/60 dark:divide-white/5 text-sm">
              {students.map((student, sIdx) => {
                const avg = studentAverages[student.id];
                return (
                  <tr
                    key={student.id}
                    className="hover:bg-slate-500/[0.03] dark:hover:bg-white/[0.02] transition-colors group/row"
                  >
                    {/* Left Column: Talaba ismi xolos (Sticky) */}
                    <td className="py-2 px-3.5 font-semibold text-slate-900 dark:text-white w-44 sm:w-56 min-w-[176px] sm:min-w-[224px] shrink-0 sticky left-0 z-20 bg-white dark:bg-[#0f172a] border-r border-slate-200 dark:border-white/10 shadow-[6px_0_12px_-4px_rgba(0,0,0,0.08)] dark:shadow-[6px_0_16px_-4px_rgba(0,0,0,0.6)] whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400 w-4 shrink-0">
                          {sIdx + 1}.
                        </span>
                        <Avatar
                          name={student.name}
                          src={student.avatar}
                          size="sm"
                        />
                        <span className="truncate max-w-[130px] sm:max-w-[180px] text-xs sm:text-sm font-medium">
                          {student.name}
                        </span>
                      </div>
                    </td>

                    {/* Grade Cells for each lesson date */}
                    {lessonDates.map((d) => {
                      const grade = gradesLookup[d.iso]?.[student.id];
                      return (
                        <td
                          key={d.iso}
                          className={`p-1 text-center align-middle w-[52px] min-w-[52px] max-w-[52px] shrink-0 relative ${
                            d.isToday ? "bg-blue-500/[0.03]" : ""
                          }`}
                        >
                          <GradeCell
                            studentId={student.id}
                            groupId={group.id}
                            dateIso={d.iso}
                            currentGrade={grade}
                            onSelectGrade={(newGrade) => {
                              if (typeof markGrade === "function") {
                                markGrade(group.id, d.iso, student.id, newGrade);
                              }
                            }}
                          />
                        </td>
                      );
                    })}

                    {/* Average score column */}
                    <td className="py-2 px-3 text-center align-middle border-l border-slate-200/60 dark:border-white/10">
                      {avg ? (
                        <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-lg text-xs font-extrabold ${
                          Number(avg) >= 4.5
                            ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                            : Number(avg) >= 3.5
                            ? "bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                            : Number(avg) >= 2.5
                            ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                            : "bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                        }`}>
                          {avg}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Legend / Ballar izohi */}
      <div className="flex items-center justify-between flex-wrap gap-4 pt-3.5 border-t border-slate-200/60 dark:border-white/10 text-[11px] text-slate-500">
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          {GRADE_CONFIG.slice().reverse().map((cfg) => (
            <div key={cfg.value} className="flex items-center gap-1.5">
              <span className={`w-5 h-5 rounded-md ${cfg.badgeClass} font-bold flex items-center justify-center text-xs`}>
                {cfg.value}
              </span>
              <span>{cfg.shortLabel} ({cfg.value})</span>
            </div>
          ))}
        </div>

        <span className="italic text-slate-400">
          Katakcha ustiga olib borsangiz (hover) 1 dan 5 gacha ballar chiqadi
        </span>
      </div>
    </div>
  );
}

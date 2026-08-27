import { useState, useEffect } from "react";

import { STUDENT_NAV_ITEMS } from "./utils/constants";
import { BG_GRADIENT, GLASS, BTN_PRIMARY } from "../../shared/theme/tokens";
import { generateId } from "./utils/helpers";
import {
  GlobalStyleTag,
  BackgroundBlobs,
  LoadingScreen,
  NotificationStack,
} from "../../shared/components/primitives";
import { AppShell } from "./layout/Layout";

import { StudentLoginScreen } from "./pages/StudentLoginScreen";
import { StudentHome } from "./pages/StudentHome";
import { StudentTasks } from "./pages/StudentTasks";
import { StudentRating } from "./pages/StudentRating";
import { StudentSchedule } from "./pages/StudentSchedule";
import { StudentProfile } from "./pages/StudentProfile";

import { fetchAppData } from "../../shared/api/index";
import * as api from "../../shared/api/index";

const STUDENT_SESSION_KEY = "student-session-v1";

/* ============================== ROOT APP ============================== */

export default function App() {
  const [appData, setAppData] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("home");
  const [notifications, setNotifications] = useState([]);

  // ---- initial load: pull everything from Supabase, restore session from localStorage ----
  useEffect(() => {
    const startTime = Date.now();
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchAppData();
        if (!cancelled) setAppData(data);
      } catch (e) {
        console.error("Supabasedan maʼlumot olishda xatolik:", e);
      }
      try {
        const raw = sessionStorage.getItem(STUDENT_SESSION_KEY);
        if (!cancelled) setSession(raw ? JSON.parse(raw) : null);
      } catch (e) {
        if (!cancelled) setSession(null);
      }
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 2200 - elapsed);
      setTimeout(() => {
        if (!cancelled) setLoading(false);
      }, remaining);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (loading) return;
    try {
      if (session)
        sessionStorage.setItem(STUDENT_SESSION_KEY, JSON.stringify(session));
      else sessionStorage.removeItem(STUDENT_SESSION_KEY);
    } catch (e) {
      /* ignore */
    }
  }, [session, loading]);

  function addNotification(message) {
    const id = generateId("n");
    setNotifications((prev) => [...prev, { id, message }]);
    setTimeout(
      () => setNotifications((prev) => prev.filter((n) => n.id !== id)),
      5000,
    );
  }

  function loginAsStudent(studentId) {
    setSession({ studentId });
    setView("home");
  }
  function logout() {
    setSession(null);
    setView("home");
  }

  // A student submitting work, or a teacher grading it, both funnel through here —
  // same read-modify-write shape as the original app, just persisted via saveSubmissions().
  async function markSubmission(taskId, studentId, data) {
    const task = appData.tasks.find((t) => t.id === taskId);
    if (!task) return;
    const prevSub = task.submissions[studentId] || {};

    const newSub = { ...prevSub, ...data };
    let coinDelta = 0;
    if (data.rating !== undefined && data.rating !== null) {
      const oldCoins = prevSub.coinsAwarded || 0;
      const newCoins = appData.coinSettings[String(data.rating)] ?? 0;
      newSub.coinsAwarded = newCoins;
      coinDelta = newCoins - oldCoins;
    }
    const newSubmissions = { ...task.submissions, [studentId]: newSub };

    setAppData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === taskId ? { ...t, submissions: newSubmissions } : t,
      ),
      students:
        coinDelta !== 0
          ? prev.students.map((s) =>
              s.id === studentId
                ? { ...s, coins: (s.coins || 0) + coinDelta }
                : s,
            )
          : prev.students,
    }));

    if (data.status === "submitted")
      addNotification(`"${task.title}" topshirildi.`);

    try {
      await api.saveSubmissions(taskId, newSubmissions);
      if (coinDelta !== 0) {
        const student = appData.students.find((s) => s.id === studentId);
        await api.updateStudent(studentId, {
          coins: (student?.coins || 0) + coinDelta,
        });
      }
    } catch (e) {
      console.error(e);
      addNotification("Xatolik: saqlab bo'lmadi.");
    }
  }

  async function updateStudent(studentId, patch) {
    setAppData((prev) => ({
      ...prev,
      students: prev.students.map((s) =>
        s.id === studentId ? { ...s, ...patch } : s,
      ),
    }));
    try {
      await api.updateStudent(studentId, patch);
    } catch (e) {
      console.error(e);
      addNotification("Xatolik: saqlab bo'lmadi.");
    }
  }

  if (loading || !appData) return <LoadingScreen />;
  if (!session)
    return (
      <StudentLoginScreen appData={appData} onLoginStudent={loginAsStudent} />
    );

  const now = new Date();
  const student = appData.students.find((s) => s.id === session.studentId);

  if (!student) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center text-slate-900 p-6 text-center relative"
        style={{ background: BG_GRADIENT }}
      >
        <GlobalStyleTag />
        <div className={`${GLASS} rounded-xl p-8 max-w-sm relative z-10`}>
          <p className="mb-4">
            Hisobingiz topilmadi. Ustoz sizni o'chirgan bo'lishi mumkin.
          </p>
          <button onClick={logout} className={BTN_PRIMARY}>
            Chiqish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full text-slate-900 relative"
      style={{
        background: BG_GRADIENT,
        fontFamily: "'Quicksand', ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <GlobalStyleTag />
      <BackgroundBlobs />

      <AppShell
        view={view}
        goTo={setView}
        items={STUDENT_NAV_ITEMS}
        student={student}
        now={now}
        onLogout={logout}
      >
        {view === "home" && (
          <StudentHome appData={appData} student={student} goTo={setView} />
        )}
        {view === "tasks" && (
          <StudentTasks
            appData={appData}
            student={student}
            markSubmission={markSubmission}
          />
        )}
        {view === "rating" && (
          <StudentRating appData={appData} student={student} />
        )}
        {view === "schedule" && (
          <StudentSchedule appData={appData} student={student} />
        )}
        {view === "profile" && (
          <StudentProfile
            appData={appData}
            student={student}
            updateStudent={updateStudent}
          />
        )}
      </AppShell>

      <NotificationStack
        notifications={notifications}
        onDismiss={(id) =>
          setNotifications((prev) => prev.filter((n) => n.id !== id))
        }
      />
    </div>
  );
}

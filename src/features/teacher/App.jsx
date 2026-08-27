import { useState, useEffect } from "react";

import { BG_GRADIENT } from "../../shared/theme/tokens";
import { NAV_ITEMS, TEACHER_SESSION_KEY } from "./utils/constants";
import { generateId, getLessonTimeInfo, todayISO } from "./utils/helpers";
import { getGroupStudents } from "./utils/dataHelpers";
import {
  GlobalStyleTag,
  BackgroundBlobs,
  LoadingScreen,
  NotificationStack,
  ConfirmModal,
} from "../../shared/components/primitives";
import { AppShell } from "./layout/Layout";

import { TeacherLoginScreen } from "./pages/TeacherLoginScreen";
import { DashboardView } from "./pages/DashboardView";
import { RatingView } from "./pages/RatingView";
import { TasksView } from "./pages/TasksView";
import { ScheduleView } from "./pages/ScheduleView";
import { ProfileView } from "./pages/ProfileView";
import { AnalyticsView } from "./pages/AnalyticsView";
import { PaymentsView } from "./pages/PaymentsView";

import { AddGroupModal } from "./modals/AddGroupModal";
import { AddStudentModal } from "./modals/AddStudentModal";
import { CreateTaskModal } from "./modals/CreateTaskModal";
import { StudentDetailModal } from "./modals/StudentDetailModal";
import { CoinSettingsModal } from "./modals/CoinSettingsModal";
import { PostponeModal } from "./modals/PostponeModal";

import { fetchAppData, fetchDirectorData } from "../../shared/api/index";
import * as api from "../../shared/api/index";

export default function App() {
  const [appData, setAppData] = useState(null);
  const [directorData, setDirectorData] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("dashboard");
  const [modal, setModal] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  useEffect(() => {
    const startTime = Date.now();
    let cancelled = false;
    (async () => {
      try {
        const [aData, dData] = await Promise.all([
          fetchAppData(),
          fetchDirectorData(),
        ]);
        if (cancelled) return;
        setAppData(aData);
        setDirectorData(dData);
      } catch (e) {
        console.error("Supabasedan maʼlumot olishda xatolik:", e);
      }
      try {
        const raw = sessionStorage.getItem(TEACHER_SESSION_KEY);
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
        sessionStorage.setItem(TEACHER_SESSION_KEY, JSON.stringify(session));
      else sessionStorage.removeItem(TEACHER_SESSION_KEY);
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
  function reportError(e, fallback) {
    console.error(e);
    addNotification(`Xatolik: ${e?.message || fallback}`);
  }

  function goTo(v) {
    setSelectedGroupId(null);
    setSelectedTaskId(null);
    setView(v);
  }
  function openModal(m) {
    setModal(m);
  }
  function closeModal() {
    setModal(null);
  }

  function loginAsTeacher(teacherHrId) {
    setSession({ teacherHrId });
    setView("dashboard");
  }

  function logout() {
    setSession(null);
    setView("dashboard");
    setSelectedGroupId(null);
    setSelectedTaskId(null);
    setModal(null);
  }

  async function addGroup(payload) {
    try {
      const created = await api.addGroup({ ...payload, teacherHrId: session?.teacherHrId });
      setAppData((prev) => ({ ...prev, groups: [...prev.groups, created] }));
      addNotification(`"${payload.name}" guruhi yaratildi.`);
    } catch (e) {
      reportError(e, "Guruh yaratib bo'lmadi.");
    }
  }

  async function addStudent(payload) {
    try {
      const created = await api.addStudent(payload);
      setAppData((prev) => ({
        ...prev,
        students: [...prev.students, created],
      }));
      addNotification(`${payload.name} qo'shildi.`);
    } catch (e) {
      reportError(e, "O'quvchi qo'shib bo'lmadi.");
    }
  }

  async function linkExistingStudent(studentId, groupId) {
    const student = appData.students.find((s) => s.id === studentId);
    if (!student) return;
    const merged = [...new Set([...student.groupIds, groupId])];
    setAppData((prev) => ({
      ...prev,
      students: prev.students.map((s) =>
        s.id === studentId ? { ...s, groupIds: merged } : s,
      ),
    }));
    addNotification(`${student.name} guruhga qo'shildi.`);
    try {
      await api.updateStudent(studentId, { groupIds: merged });
    } catch (e) {
      reportError(e, "Yangilab bo'lmadi.");
    }
  }

  async function addTask(payload) {
    try {
      const created = await api.addTask(payload);
      setAppData((prev) => ({ ...prev, tasks: [...prev.tasks, created] }));
      addNotification(`"${payload.title}" vazifasi yaratildi.`);
    } catch (e) {
      reportError(e, "Vazifa yaratib bo'lmadi.");
    }
  }

  async function markSubmission(taskId, studentId, data) {
    const task = appData.tasks.find((t) => t.id === taskId);
    if (!task) return;
    const group = appData.groups.find((g) => g.id === task.groupId);
    const students = group ? getGroupStudents(appData, group.id) : [];
    const prevSub = task.submissions[studentId] || {};
    const wasAllDone =
      students.length > 0 &&
      students.every((st) => {
        const s = task.submissions[st.id];
        return s && s.status !== "pending";
      });

    const newSub = { ...prevSub, ...data };
    let coinDelta = 0;
    let newCoinTotal = null;
    if (data.rating !== undefined && data.rating !== null) {
      const oldCoins = prevSub.coinsAwarded || 0;
      const newCoins = appData.coinSettings[String(data.rating)] ?? 0;
      newSub.coinsAwarded = newCoins;
      coinDelta = newCoins - oldCoins;
      const student = appData.students.find((s) => s.id === studentId);
      newCoinTotal = (student?.coins || 0) + coinDelta;
    }
    const newSubmissions = { ...task.submissions, [studentId]: newSub };
    const isAllDone =
      students.length > 0 &&
      students.every((st) => {
        const s = newSubmissions[st.id];
        return s && s.status !== "pending";
      });

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

    if (!wasAllDone && isAllDone) {
      addNotification(
        `🎉 Barcha o'quvchilar"${task.title}" vazifasini topshirdi. Tekshirish vaqti keldi!`,
      );
    } else if (data.status === "graded") {
      addNotification(
        coinDelta > 0 ? `Baho qo'yildi (+${coinDelta} 🪙).` : "Baho qo'yildi.",
      );
    } else if (data.status === "submitted") {
      addNotification(`"${task.title}" topshirildi.`);
    }

    try {
      await api.saveSubmissions(taskId, newSubmissions);
      if (coinDelta !== 0 && newCoinTotal !== null)
        await api.updateStudent(studentId, { coins: newCoinTotal });
    } catch (e) {
      reportError(e, "Saqlab bo'lmadi.");
    }
  }

  async function markAttendance(groupId, date, studentId, status, reason) {
    const group = appData.groups.find((g) => g.id === groupId);
    const timeInfo = group ? getLessonTimeInfo(group, date) : null;
    const isPastLocked = timeInfo ? timeInfo.isLessonFinished : date < todayISO();

    const existing = appData.attendance.find(
      (a) => a.groupId === groupId && a.date === date,
    );
    if (isPastLocked && existing?.locked) return;
    const prevEntry = existing?.records?.[studentId];
    const prevReason = typeof prevEntry === "object" ? prevEntry.reason : "";
    const entry = {
      status,
      reason: reason !== undefined ? reason : prevReason || "",
    };

    if (existing) {
      const mergedRecords = { ...existing.records, [studentId]: entry };
      setAppData((prev) => ({
        ...prev,
        attendance: prev.attendance.map((a) =>
          a.id === existing.id ? { ...a, records: mergedRecords } : a,
        ),
      }));
      try {
        await api.patchAttendanceRecord(existing.id, mergedRecords);
      } catch (e) {
        reportError(e, "Saqlab bo'lmadi.");
      }
    } else {
      const tempId = generateId("att-local");
      const records = { [studentId]: entry };
      setAppData((prev) => ({
        ...prev,
        attendance: [
          ...prev.attendance,
          { id: tempId, groupId, date, locked: false, records },
        ],
      }));
      try {
        const created = await api.addAttendanceRecord({
          groupId,
          date,
          records,
          locked: false,
        });
        setAppData((prev) => ({
          ...prev,
          attendance: prev.attendance.map((a) =>
            a.id === tempId ? created : a,
          ),
        }));
      } catch (e) {
        reportError(e, "Saqlab bo'lmadi.");
      }
    }
  }

  async function saveAttendance(groupId, date) {
    const group = appData.groups.find((g) => g.id === groupId);
    const timeInfo = group ? getLessonTimeInfo(group, date) : null;
    const shouldLock = timeInfo ? timeInfo.isLessonFinished : date < todayISO();

    const record = appData.attendance.find(
      (a) => a.groupId === groupId && a.date === date,
    );
    if (!record) return;
    setAppData((prev) => ({
      ...prev,
      attendance: prev.attendance.map((a) =>
        a.groupId === groupId && a.date === date ? { ...a, locked: shouldLock } : a,
      ),
    }));
    
    if (shouldLock) {
      addNotification("Davomat saqlandi va dars yakunlangani sababli qulflandi.");
    } else {
      const endTime = timeInfo?.endTime || "";
      addNotification(
        endTime
          ? `Davomat saqlandi. Dars tugaguncha (${endTime} gacha) bemalol tahrirlashingiz mumkin.`
          : "Davomat saqlandi. Dars yakunigacha tahrirlashingiz mumkin."
      );
    }

    try {
      await api.updateAttendanceRecord(record.id, record.records);
    } catch (e) {
      reportError(e, "Saqlab bo'lmadi.");
    }
  }

  async function updateGroupSchedule(groupId, days, time) {
    const group = appData.groups.find((g) => g.id === groupId);
    if (!group) return;
    setAppData((prev) => ({
      ...prev,
      groups: prev.groups.map((g) =>
        g.id === groupId ? { ...g, days, time } : g,
      ),
    }));
    addNotification("Jadval yangilandi.");
    try {
      await api.updateGroup(groupId, { ...group, days, time });
    } catch (e) {
      reportError(e, "Yangilab bo'lmadi.");
    }
  }

  async function addPostponed(entry) {
    try {
      const created = await api.addPostponed(entry);
      setAppData((prev) => ({
        ...prev,
        postponed: [...prev.postponed, created],
      }));
      addNotification("Dars ko'chirildi.");
    } catch (e) {
      reportError(e, "Ko'chirib bo'lmadi.");
    }
  }

  async function removePostponed(id) {
    setAppData((prev) => ({
      ...prev,
      postponed: prev.postponed.filter((p) => p.id !== id),
    }));
    try {
      await api.deletePostponed(id);
    } catch (e) {
      reportError(e, "O'chirib bo'lmadi.");
    }
  }

  async function updateTeacher(teacher) {
    setDirectorData((prev) => ({
      ...prev,
      teachersHR: prev.teachersHR.map((t) =>
        t.id === teacher.id ? teacher : t,
      ),
    }));
    addNotification("Profil saqlandi.");
    try {
      await api.updateTeacherHR(teacher.id, teacher);
    } catch (e) {
      reportError(e, "Saqlab bo'lmadi.");
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
      reportError(e, "Yangilab bo'lmadi.");
    }
  }

  async function updateCoinSettings(newSettings) {
    setAppData((prev) => ({ ...prev, coinSettings: newSettings }));
    addNotification("Coin sozlamalari yangilandi.");
    try {
      await api.updateCoinSettings(newSettings);
    } catch (e) {
      reportError(e, "Yangilab bo'lmadi.");
    }
  }

  async function deleteGroup(groupId) {
    const targetGid = String(groupId);
    const affectedStudents = (appData?.students || []).filter((s) =>
      (s.groupIds || []).some((id) => String(id) === targetGid),
    );
    setAppData((prev) => ({
      ...prev,
      groups: (prev.groups || []).filter((g) => String(g.id) !== targetGid),
      students: (prev.students || []).map((s) => ({
        ...s,
        groupIds: (s.groupIds || []).filter((id) => String(id) !== targetGid),
      })),
      tasks: (prev.tasks || []).filter((t) => String(t.groupId) !== targetGid),
      postponed: prev.postponed.filter((p) => p.groupId !== groupId),
      attendance: prev.attendance.filter((a) => a.groupId !== groupId),
    }));
    setSelectedGroupId(null);
    addNotification("Guruh o'chirildi.");
    try {
      await Promise.all(
        affectedStudents.map((s) =>
          api.updateStudent(s.id, {
            groupIds: s.groupIds.filter((id) => id !== groupId),
          }),
        ),
      );
      await api.deleteGroup(groupId); // tasks/postponed/attendance cascade in the DB
    } catch (e) {
      reportError(e, "To'liq o'chirib bo'lmadi.");
    }
  }

  async function deleteTask(taskId) {
    setAppData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== taskId),
    }));
    setSelectedTaskId(null);
    addNotification("Vazifa o'chirildi.");
    try {
      await api.deleteTask(taskId);
    } catch (e) {
      reportError(e, "O'chirib bo'lmadi.");
    }
  }

  async function removeStudentFromGroup(studentId, groupId) {
    const student = appData.students.find((s) => s.id === studentId);
    if (!student) return;
    const newGroupIds = student.groupIds.filter((id) => id !== groupId);
    setAppData((prev) => ({
      ...prev,
      students: prev.students.map((s) =>
        s.id === studentId ? { ...s, groupIds: newGroupIds } : s,
      ),
    }));
    addNotification("O'quvchi guruhdan chiqarildi.");
    try {
      await api.updateStudent(studentId, { groupIds: newGroupIds });
    } catch (e) {
      reportError(e, "Yangilab bo'lmadi.");
    }
  }

  function handleConfirm() {
    if (!modal || modal.type !== "confirm") return;
    const { action } = modal;
    if (action.kind === "deleteGroup") deleteGroup(action.groupId);
    if (action.kind === "deleteTask") deleteTask(action.taskId);
    if (action.kind === "removeFromGroup")
      removeStudentFromGroup(action.studentId, action.groupId);
    setModal(null);
  }

  if (loading || !appData || !directorData) return <LoadingScreen />;
  const teachersHR = directorData.teachersHR || [];
  const teacher = session
    ? teachersHR.find((t) => t.id === session.teacherHrId)
    : null;
  if (!session || !teacher)
    return (
      <TeacherLoginScreen
        teachersHR={teachersHR}
        onLoginTeacher={loginAsTeacher}
      />
    );

  const now = new Date();
  const courses = directorData.courses || [];
  const canCreateGroups = teacher.canCreateGroups !== false;

  // Filter appData so each teacher only manages and sees their assigned groups
  const filteredGroups = (appData.groups || []).filter((g) => g.teacherHrId === teacher.id);
  const filteredGroupIds = new Set(filteredGroups.map((g) => g.id));

  const filteredStudents = (appData.students || []).filter((s) => {
    return Array.isArray(s.groupIds) && s.groupIds.some((id) => filteredGroupIds.has(id));
  });

  const filteredTasks = (appData.tasks || []).filter((t) => filteredGroupIds.has(t.groupId));

  const filteredAttendance = (appData.attendance || []).filter((a) => filteredGroupIds.has(a.groupId));

  const filteredPostponed = (appData.postponed || []).filter((p) => filteredGroupIds.has(p.groupId));

  const filteredAppData = {
    ...appData,
    groups: filteredGroups,
    students: filteredStudents,
    tasks: filteredTasks,
    attendance: filteredAttendance,
    postponed: filteredPostponed,
  };

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
        goTo={goTo}
        items={NAV_ITEMS}
        teacher={teacher}
        now={now}
        onLogout={logout}
      >
        {view === "dashboard" && (
          <DashboardView
            appData={filteredAppData}
            openModal={openModal}
            setSelectedGroupId={setSelectedGroupId}
            selectedGroupId={selectedGroupId}
            courses={courses}
            canCreateGroups={canCreateGroups}
          />
        )}
        {view === "rating" && (
          <RatingView appData={filteredAppData} openModal={openModal} />
        )}
        {view === "tasks" && (
          <TasksView
            appData={filteredAppData}
            openModal={openModal}
            markSubmission={markSubmission}
            markAttendance={markAttendance}
            saveAttendance={saveAttendance}
            selectedTaskId={selectedTaskId}
            setSelectedTaskId={setSelectedTaskId}
          />
        )}
        {view === "schedule" && (
          <ScheduleView
            appData={filteredAppData}
            updateGroupSchedule={updateGroupSchedule}
            openModal={openModal}
            removePostponed={removePostponed}
          />
        )}
        {view === "analytics" && (
          <AnalyticsView
            teacher={teacher}
            directorData={directorData}
            appData={filteredAppData}
          />
        )}
        {view === "payments" && (
          <PaymentsView
            teacher={teacher}
            directorData={directorData}
            appData={filteredAppData}
          />
        )}
        {view === "profile" && (
          <ProfileView
            teacher={teacher}
            updateTeacher={updateTeacher}
            openModal={openModal}
          />
        )}
      </AppShell>

      <NotificationStack
        notifications={notifications}
        onDismiss={(id) =>
          setNotifications((prev) => prev.filter((n) => n.id !== id))
        }
      />

      {modal?.type === "addGroup" && (
        <AddGroupModal
          groups={filteredAppData.groups}
          courses={courses}
          onAdd={addGroup}
          onClose={closeModal}
        />
      )}
      {modal?.type === "addStudent" && (
        <AddStudentModal
          groupId={modal.groupId}
          appData={appData}
          onAddNew={addStudent}
          onLinkExisting={linkExistingStudent}
          onClose={closeModal}
        />
      )}
      {modal?.type === "createTask" && (
        <CreateTaskModal
          groups={filteredAppData.groups}
          onAdd={addTask}
          onClose={closeModal}
        />
      )}
      {modal?.type === "studentDetail" && (
        <StudentDetailModal
          studentId={modal.studentId}
          groupId={modal.groupId}
          appData={filteredAppData}
          openModal={openModal}
          onClose={closeModal}
          updateStudent={updateStudent}
        />
      )}
      {modal?.type === "coinSettings" && (
        <CoinSettingsModal
          coinSettings={appData.coinSettings}
          onSave={updateCoinSettings}
          onClose={closeModal}
        />
      )}
      {modal?.type === "postponeLesson" && (
        <PostponeModal
          groups={filteredAppData.groups}
          onAdd={addPostponed}
          onClose={closeModal}
        />
      )}
      {modal?.type === "confirm" && (
        <ConfirmModal
          message={modal.message}
          onConfirm={handleConfirm}
          onCancel={closeModal}
        />
      )}
    </div>
  );
}

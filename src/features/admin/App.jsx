import { useState, useEffect, useMemo, useCallback } from "react";

import { LIGHT_THEME, ThemeContext } from "./theme/ThemeContext";
import {
  DIRECTOR_SESSION_KEY,
  MANAGER_SESSION_KEY,
  ALL_PAGE_IDS,
  DEFAULT_MANAGER_PAGES,
} from "./utils/constants";
import {
  generateId,
  money,
  thisMonthKey,
  getPaymentStatus,
} from "./utils/helpers";
import {
  opGroups,
  opRooms,
  opAttendance,
  opStudentsInGroups,
} from "./utils/dataHelpers";
import {
  GlobalStyleTag,
  BackgroundBlobs,
  LoadingScreen,
  ToastStack,
  ConfirmModal,
} from "./components/primitives";
import { AppShell } from "./layout/Layout";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Auth
import { AdminAuth } from "./pages/AdminAuth";

// Pages
import { DashboardHome } from "./pages/DashboardHome";
import { TodayWorkbench } from "./pages/TodayWorkbench";
import { BranchesPage } from "./pages/BranchesPage";
import { ManagersPage } from "./pages/ManagersPage";
import { TeachersHR } from "./pages/TeachersHR";
import { StudentsPage } from "./pages/StudentsPage";
import { GroupsPage } from "./pages/GroupsPage";
import { CoursesPage } from "./pages/CoursesPage";
import { RoomsPage } from "./pages/RoomsPage";
import { AttendancePage } from "./pages/AttendancePage";
import { EmployeeAttendancePage } from "./pages/EmployeeAttendancePage";
import { PaymentsPage } from "./pages/PaymentsPage";
import { DebtorsPage } from "./pages/DebtorsPage";
import { PaymentTypesPage } from "./pages/PaymentTypesPage";
import { FinancePage } from "./pages/FinancePage";
import { ExpensesPage } from "./pages/ExpensesPage";
import {
  AnalyticsPage,
  BranchAnalyticsPage,
  ApprovalsPage,
  ArchivePage,
  SecurityPage,
  ProfilePage,
} from "./pages/DirectorExtraPages";
import { BreakEvenPage } from "./pages/BreakEvenPage";
import { LeadsPage } from "./pages/LeadsPage";
import { CoinSystemPage } from "./pages/CoinSystemPage";
import { HolidaysPage } from "./pages/HolidaysPage";
import { ProfileSettingsHub } from "./pages/ProfileSettingsHub";
import { CenterSettingsPage } from "./pages/CenterSettingsPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { PositionsPage } from "./pages/PositionsPage";
import {
  AdditionalIncomePage,
  SalariesPage,
  ReceiptSettingsPage,
  ReasonsPage,
  PlacementTestPage,
  PointsGradingPage,
  ExamTemplatesPage,
  SmsBuyPage,
  AutoSmsPage,
  SmsTemplatesPage,
  FormsBuilderPage,
  TagsPage,
} from "./pages/SettingsSubPages";

import {
  CourseReportPage,
  TeacherPerformanceReportPage,
  CashflowReportPage,
  SalariesReportPage,
  DiscountsReportPage,
  SmsSentReportPage,
  WorkTimeReportPage,
  JournalsReportPage,
  CoinsReportPage,
  PointsReportPage,
  ExamsReportPage,
  LeadsReportPage,
  GroupRemovedReportPage,
  AttendanceReportPage,
} from "./pages/ReportsSubPages";

// Modals
import { BranchFormModal } from "./modals/BranchFormModal";
import { BranchDetailModal } from "./modals/BranchDetailModal";
import { ManagerFormModal } from "./modals/ManagerFormModal";
import { ManagerPermissionsModal } from "./modals/ManagerPermissionsModal";
import { TeacherHRFormModal } from "./modals/TeacherHRFormModal";
import { TeacherPayrollModal } from "./modals/TeacherPayrollModal";
import { ManagerPayrollModal } from "./modals/ManagerPayrollModal";
import { CourseFormModal } from "./modals/CourseFormModal";
import { GroupFormModal } from "./modals/GroupFormModal";
import { GroupProfileModal } from "./modals/GroupProfileModal";
import { RecordPaymentModal } from "./modals/RecordPaymentModal";
import { AddStudentModal } from "./modals/AddStudentModal";
import { SetStudentStatusModal } from "./modals/SetStudentStatusModal";
import { AssignStudentToGroupModal } from "./modals/AssignStudentToGroupModal";
import { StudentBulkMessageModal } from "./modals/StudentBulkMessageModal";
import { StudentProfileModal } from "./modals/StudentProfileModal";
import { RoomFormModal } from "./modals/RoomFormModal";
import { EditAttendanceModal } from "./modals/EditAttendanceModal";

// Supabase API
import { fetchDirectorData, fetchOpData } from "../../shared/api/index";
import * as api from "../../shared/api/index";

export default function UnifiedAdminApp({ defaultRole = "director" }) {
  const [directorData, setDirectorData] = useState(null);
  const [opData, setOpData] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState(() => (defaultRole === "director" ? "home" : "workbench"));
  const [currentBranchId, setCurrentBranchId] = useState("all");
  const [modal, setModal] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [notifLog, setNotifLog] = useState([]);
  const [now, setNow] = useState(new Date());

  // Timer for current time
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Initial Data & Session Loading
  useEffect(() => {
    const startTime = Date.now();
    let cancelled = false;
    (async () => {
      try {
        const [dData, oData] = await Promise.all([
          fetchDirectorData(),
          fetchOpData(),
        ]);
        if (cancelled) return;
        setDirectorData(
          dData || {
            directors: [],
            branches: [],
            managers: [],
            teachersHR: [],
            teacherPayments: [],
            holidays: [],
            finance: [],
            courses: [],
            payments: [],
            managerPayments: [],
            coinSettings: null,
            centerSettings: null,
            notifications: [],
          },
        );
        setOpData(
          oData || {
            groups: [],
            students: [],
            rooms: [],
            attendance: [],
            coinTransactions: [],
            employeeAttendance: [],
          },
        );
      } catch (e) {
        console.error("Supabasedan maʼlumot olishda xatolik:", e);
        if (!cancelled) {
          setDirectorData({
            directors: [],
            branches: [],
            managers: [],
            teachersHR: [],
            teacherPayments: [],
            holidays: [],
            finance: [],
            courses: [],
            payments: [],
            managerPayments: [],
            coinSettings: null,
            centerSettings: null,
            notifications: [],
          });
          setOpData({
            groups: [],
            students: [],
            rooms: [],
            attendance: [],
            coinTransactions: [],
            employeeAttendance: [],
          });
        }
      }

      // Restore session
      try {
        const sessionKey =
          defaultRole === "director" ? DIRECTOR_SESSION_KEY : MANAGER_SESSION_KEY;
        let raw =
          sessionStorage.getItem(sessionKey) || localStorage.getItem(sessionKey);
        if (!raw) {
          // Check alternate session key
          const altKey =
            defaultRole === "director" ? MANAGER_SESSION_KEY : DIRECTOR_SESSION_KEY;
          raw = sessionStorage.getItem(altKey) || localStorage.getItem(altKey);
        }
        if (!cancelled && raw) {
          const parsed = JSON.parse(raw);
          setSession(parsed);
          if (parsed.role === "manager" && parsed.allowedPages?.length > 0) {
            if (!parsed.allowedPages.includes(view)) {
              setView(parsed.allowedPages[0] || "workbench");
            }
          }
        }
      } catch (e) {
        if (!cancelled) setSession(null);
      }

      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 1800 - elapsed);
      setTimeout(() => {
        if (!cancelled) setLoading(false);
      }, remaining);
    })();
    return () => {
      cancelled = true;
    };
  }, [defaultRole]);

  // Refresh helper
  const refreshData = useCallback(async () => {
    try {
      const [dData, oData] = await Promise.all([
        fetchDirectorData(),
        fetchOpData(),
      ]);
      if (dData) setDirectorData(dData);
      if (oData) setOpData(oData);
    } catch (e) {
      console.error("Ma'lumotlarni yangilashda xatolik:", e);
    }
  }, []);

  // Toast notifications helper
  const addToast = useCallback((message, type = "info") => {
    const id = generateId("toast");
    setToasts((prev) => [...prev, { id, message, type }]);
    setNotifLog((prev) => [
      { id: generateId("notif"), message, timestamp: Date.now(), read: false },
      ...prev,
    ]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Navigation router
  const goTo = useCallback(
    (nextView) => {
      setView(nextView);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [],
  );

  // Authentication Handlers
  const handleDirectorLogin = (directorUser) => {
    const userSession = {
      ...directorUser,
      role: "director",
      allowedPages: ALL_PAGE_IDS,
    };
    setSession(userSession);
    try {
      sessionStorage.setItem(DIRECTOR_SESSION_KEY, JSON.stringify(userSession));
      localStorage.setItem(DIRECTOR_SESSION_KEY, JSON.stringify(userSession));
    } catch (e) {}
    setView("home");
    addToast(`Xush kelibsiz, ${userSession.name || "Bosh direktor"}!`);
  };

  const handleManagerLogin = (managerUser) => {
    const allowed = managerUser.allowedPages || DEFAULT_MANAGER_PAGES;
    const userSession = {
      ...managerUser,
      role: "manager",
      allowedPages: allowed,
    };
    setSession(userSession);
    try {
      sessionStorage.setItem(MANAGER_SESSION_KEY, JSON.stringify(userSession));
      localStorage.setItem(MANAGER_SESSION_KEY, JSON.stringify(userSession));
    } catch (e) {}
    setView(allowed.includes("workbench") ? "workbench" : allowed[0] || "home");
    addToast(`Xush kelibsiz, ${userSession.name || "Menejer"}!`);
  };

  const handleLogout = () => {
    setSession(null);
    try {
      sessionStorage.removeItem(DIRECTOR_SESSION_KEY);
      localStorage.removeItem(DIRECTOR_SESSION_KEY);
      sessionStorage.removeItem(MANAGER_SESSION_KEY);
      localStorage.removeItem(MANAGER_SESSION_KEY);
    } catch (e) {}
    addToast("Tizimdan chiqildi.");
  };

  // Determine current role and permissions
  const role = session?.role || defaultRole;
  const isDirector = role === "director";
  const allowedPages = useMemo(() => {
    if (isDirector) return ALL_PAGE_IDS;
    return session?.allowedPages || DEFAULT_MANAGER_PAGES;
  }, [isDirector, session]);

  // Default fallback branches if no branches in database yet
  const defaultFallbackBranches = useMemo(
    () => [
      { id: "branch_default", name: "Asosiy Filial", address: "Toshkent sh., Markaz-1", color: "#3f6df6" },
      { id: "branch_chilonzor", name: "Chilonzor Filiali", address: "Chilonzor t., 9-mavze", color: "#10b981" },
      { id: "branch_yunusobod", name: "Yunusobod Filiali", address: "Yunusobod t., 14-mavze", color: "#8b5cf6" },
    ],
    [],
  );

  // Scoped Branches
  const scopeBranches = useMemo(() => {
    const raw = directorData?.branches || [];
    const allBranches = raw.length > 0 ? raw : defaultFallbackBranches;
    if (isDirector) return allBranches;
    const managerBranchIds =
      session?.branchIds || (session?.branchId ? [session.branchId] : []);
    if (managerBranchIds.length === 0) return allBranches;
    return allBranches.filter((b) => managerBranchIds.includes(b.id));
  }, [directorData?.branches, defaultFallbackBranches, isDirector, session]);

  // Active Scope Branches (Filtered when currentBranchId is specific)
  const activeScopeBranches = useMemo(() => {
    if (currentBranchId && currentBranchId !== "all") {
      const found = scopeBranches.filter((b) => b.id === currentBranchId);
      if (found.length > 0) return found;
    }
    return scopeBranches;
  }, [currentBranchId, scopeBranches]);

  // Scoped Branch IDs
  const scopeBranchIds = useMemo(() => {
    if (currentBranchId && currentBranchId !== "all") {
      return [currentBranchId];
    }
    return scopeBranches.map((b) => b.id);
  }, [currentBranchId, scopeBranches]);

  // Quick Action Handler
  const handleQuickAction = (actionId) => {
    if (actionId === "payment") {
      setModal({ type: "recordPayment" });
    } else if (actionId === "addStudent") {
      setModal({ type: "addStudent" });
    } else if (actionId === "addStudentFull") {
      setModal({ type: "addStudentFull" });
    }
  };

  // ===================== CRUD HANDLERS =====================

  // Branches
  const handleSaveBranch = async (branchData) => {
    try {
      let res;
      if (branchData.id && directorData?.branches?.some((b) => b.id === branchData.id)) {
        res = await api.updateBranch(branchData.id, branchData);
      } else {
        res = await api.addBranch(branchData);
      }
      addToast(
        branchData.id
          ? "Filial muvaffaqiyatli tahrirlandi"
          : "Yangi filial qo'shildi",
      );
      await refreshData();
      return res;
    } catch (e) {
      console.error(e);
      addToast("Filialni saqlashda xatolik", "error");
    }
  };

  const handleDeleteBranch = async (branchId) => {
    try {
      await api.deleteBranch(branchId);
      addToast("Filial o'chirildi");
      await refreshData();
    } catch (e) {
      console.error(e);
      addToast("Filialni o'chirishda xatolik", "error");
    }
  };

  // Managers
  const handleSaveManager = async (managerData) => {
    try {
      let res;
      if (managerData.id && directorData?.managers?.some((m) => m.id === managerData.id)) {
        res = await api.updateManager(managerData.id, managerData);
      } else {
        res = await api.addManager(managerData);
      }
      addToast(
        managerData.id
          ? "Menejer ma'lumotlari saqlandi"
          : "Yangi menejer qo'shildi",
      );
      await refreshData();
      return res;
    } catch (e) {
      console.error(e);
      addToast("Menejerni saqlashda xatolik", "error");
    }
  };

  const handleDeleteManager = async (managerId) => {
    try {
      await api.deleteManager(managerId);
      addToast("Menejer o'chirildi");
      await refreshData();
    } catch (e) {
      console.error(e);
      addToast("Menejerni o'chirishda xatolik", "error");
    }
  };

  const handleSaveManagerPermissions = async (managerId, allowedPagesList) => {
    try {
      await api.updateManagerPermissions(managerId, allowedPagesList);
      addToast("Menejer ruxsatlari muvaffaqiyatli saqlandi");
      await refreshData();
    } catch (e) {
      console.error(e);
      addToast("Ruxsatlarni saqlashda xatolik", "error");
    }
  };

  const handleSaveManagerPayment = async (paymentData) => {
    try {
      await api.addManagerPayment(paymentData);
      
      // Also update manager's balance if manager exists
      const targetManager = (directorData?.managers || []).find(
        (m) => String(m.id) === String(paymentData.managerId)
      );
      if (targetManager && targetManager.balance !== undefined) {
        const currentBal = Number(targetManager.balance) || 0;
        const paidAmt = Number(paymentData.amount) || 0;
        await api.updateManager(targetManager.id, {
          ...targetManager,
          balance: currentBal - paidAmt,
        });
      }

      addToast("Menejer to'lovi muvaffaqiyatli qayd etildi");
      await refreshData();
    } catch (e) {
      console.error(e);
      addToast("To'lovni qayd etishda xatolik", "error");
    }
  };

  // Teachers HR
  const handleSaveTeacherHR = async (teacherData) => {
    try {
      let res;
      if (teacherData.id && directorData?.teachersHR?.some((t) => t.id === teacherData.id)) {
        res = await api.updateTeacherHR(teacherData.id, teacherData);
      } else {
        res = await api.addTeacherHR(teacherData);
      }
      addToast(
        teacherData.id
          ? "O'qituvchi ma'lumotlari saqlandi"
          : "Yangi o'qituvchi qo'shildi",
      );
      await refreshData();
      return res;
    } catch (e) {
      console.error(e);
      addToast("O'qituvchini saqlashda xatolik", "error");
    }
  };

  const handleDeleteTeacherHR = async (teacherId) => {
    try {
      await api.deleteTeacherHR(teacherId);
      addToast("O'qituvchi o'chirildi");
      await refreshData();
    } catch (e) {
      console.error(e);
      addToast("O'qituvchini o'chirishda xatolik", "error");
    }
  };

  const handleSaveTeacherPayment = async (paymentData) => {
    try {
      await api.addTeacherPayment(paymentData);
      addToast("O'qituvchi maoshi/avansi qayd etildi");
      await refreshData();
    } catch (e) {
      console.error(e);
      addToast("Oylik to'lovni qayd etishda xatolik", "error");
    }
  };

  // Courses
  const handleSaveCourse = async (courseData) => {
    try {
      let res;
      if (courseData.id && directorData?.courses?.some((c) => c.id === courseData.id)) {
        res = await api.updateCourse(courseData.id, courseData);
      } else {
        res = await api.addCourse(courseData);
      }
      addToast(
        courseData.id
          ? "Kurs muvaffaqiyatli tahrirlandi"
          : "Yangi kurs qo'shildi",
      );
      await refreshData();
      return res;
    } catch (e) {
      console.error(e);
      addToast("Kursni saqlashda xatolik", "error");
    }
  };

  const handleDeleteCourse = async (courseId) => {
    try {
      await api.deleteCourse(courseId);
      addToast("Kurs o'chirildi");
      await refreshData();
    } catch (e) {
      console.error(e);
      addToast("Kursni o'chirishda xatolik", "error");
    }
  };

  // Groups
  const handleSaveGroup = async (groupData) => {
    try {
      let res;
      if (groupData.id && opData?.groups?.some((g) => g.id === groupData.id)) {
        res = await api.updateGroup(groupData.id, groupData);
      } else {
        res = await api.addGroup(groupData);
      }
      addToast(
        groupData.id
          ? "Guruh muvaffaqiyatli yangilandi"
          : "Yangi guruh ochildi",
      );
      await refreshData();
      return res;
    } catch (e) {
      console.error(e);
      addToast("Guruhni saqlashda xatolik", "error");
    }
  };

  const handleDeleteGroup = async (groupId) => {
    try {
      await api.deleteGroup(groupId);
      addToast("Guruh o'chirildi");
      await refreshData();
    } catch (e) {
      console.error(e);
      addToast("Guruhni o'chirishda xatolik", "error");
    }
  };

  // Rooms
  const handleSaveRoom = async (roomData) => {
    try {
      let res;
      if (roomData.id && opData?.rooms?.some((r) => r.id === roomData.id)) {
        res = await api.updateRoom(roomData.id, roomData);
      } else {
        res = await api.addRoom(roomData);
      }
      addToast(
        roomData.id ? "Xona ma'lumotlari yangilandi" : "Yangi xona qo'shildi",
      );
      await refreshData();
      return res;
    } catch (e) {
      console.error(e);
      addToast("Xonani saqlashda xatolik", "error");
    }
  };

  const handleDeleteRoom = async (roomId) => {
    try {
      await api.deleteRoom(roomId);
      addToast("Xona o'chirildi");
      await refreshData();
    } catch (e) {
      console.error(e);
      addToast("Xonani o'chirishda xatolik", "error");
    }
  };

  // Students
  const handleSaveStudent = async (studentData) => {
    try {
      let res;
      if (studentData.id && opData?.students?.some((s) => s.id === studentData.id)) {
        res = await api.updateStudent(studentData.id, studentData);
      } else {
        res = await api.addStudent(studentData);
      }
      addToast(
        studentData.id
          ? "O'quvchi ma'lumotlari saqlandi"
          : "Yangi o'quvchi qo'shildi",
      );
      await refreshData();
      return res;
    } catch (e) {
      console.error(e);
      addToast("O'quvchini saqlashda xatolik", "error");
    }
  };

  const handleDeleteStudent = async (studentId) => {
    try {
      await api.deleteStudent(studentId);
      addToast("O'quvchi o'chirildi");
      await refreshData();
    } catch (e) {
      console.error(e);
      addToast("O'quvchini o'chirishda xatolik", "error");
    }
  };

  // Payments & Finance
  const handleSavePayment = async (paymentData) => {
    try {
      let res;
      if (paymentData.id && directorData?.payments?.some((p) => p.id === paymentData.id)) {
        res = await api.updatePayment(paymentData.id, paymentData);
      } else {
        res = await api.recordPayment(paymentData);
      }
      addToast("To'lov muvaffaqiyatli qabul qilindi");
      await refreshData();
      return res;
    } catch (e) {
      console.error(e);
      addToast("To'lovni qabul qilishda xatolik", "error");
    }
  };

  const handleDeletePayment = async (paymentId) => {
    try {
      await api.deletePayment(paymentId);
      addToast("To'lov o'chirildi");
      await refreshData();
    } catch (e) {
      console.error(e);
      addToast("To'lovni o'chirishda xatolik", "error");
    }
  };

  const handleSaveFinanceRecord = async (financeData) => {
    try {
      await api.addFinance(financeData);
      addToast("Moliya yozuvi saqlandi");
      await refreshData();
    } catch (e) {
      console.error(e);
      addToast("Moliyani saqlashda xatolik", "error");
    }
  };

  const handleDeleteFinanceRecord = async (financeId) => {
    try {
      // Reject or remove
      await api.rejectFinance(financeId);
      addToast("Moliya yozuvi o'chirildi");
      await refreshData();
    } catch (e) {
      console.error(e);
      addToast("Moliya yozuvini o'chirishda xatolik", "error");
    }
  };

  const handleApproveFinance = async (item) => {
    try {
      await api.approveFinance(item.id || item);
      addToast("So'rov tasdiqlandi");
      await refreshData();
    } catch (e) {
      console.error(e);
      addToast("Tasdiqlashda xatolik", "error");
    }
  };

  const handleRejectFinance = async (item) => {
    try {
      await api.rejectFinance(item.id || item);
      addToast("So'rov rad etildi");
      await refreshData();
    } catch (e) {
      console.error(e);
      addToast("Rad etishda xatolik", "error");
    }
  };

  // Attendance
  const handleSaveAttendance = async (attendanceRecord) => {
    try {
      await api.addAttendanceRecord(attendanceRecord);
      addToast("Davomat saqlandi");
      await refreshData();
    } catch (e) {
      console.error(e);
      addToast("Davomatni saqlashda xatolik", "error");
    }
  };

  const handleSaveEmployeeAttendance = async (rec) => {
    try {
      if (rec.id) {
        await api.updateEmployeeAttendance(rec.id, rec);
      } else {
        await api.addEmployeeAttendance(rec);
      }
      addToast("Xodim davomati saqlandi");
      await refreshData();
    } catch (e) {
      console.error(e);
      addToast("Xodim davomatini saqlashda xatolik", "error");
    }
  };

  // Leads
  const handleSaveLead = async (leadIdOrData, maybeData) => {
    try {
      let finalLead = {};
      let isUpdate = false;
      let targetId = null;

      if ((typeof leadIdOrData === "string" || typeof leadIdOrData === "number") && maybeData && typeof maybeData === "object") {
        targetId = leadIdOrData;
        finalLead = { ...maybeData, id: targetId };
        isUpdate = true;
      } else if (typeof leadIdOrData === "object" && leadIdOrData !== null) {
        finalLead = { ...leadIdOrData };
        if (finalLead.id) {
          targetId = finalLead.id;
          isUpdate = true;
        }
      }

      if (isUpdate && targetId) {
        await api.updateLead(targetId, finalLead);
        addToast("Lid saqlandi");
      } else {
        await api.addLead(finalLead);
        addToast("Yangi lid qo'shildi");
      }
      await refreshData();
    } catch (e) {
      console.error(e);
      addToast("Lidni saqlashda xatolik", "error");
    }
  };

  const handleDeleteLead = async (leadId) => {
    try {
      await api.deleteLead(leadId);
      addToast("Lid o'chirildi");
      await refreshData();
    } catch (e) {
      console.error(e);
      addToast("Lidni o'chirishda xatolik", "error");
    }
  };

  // Coin System
  const handleSaveCoinTransaction = async (tx) => {
    try {
      await api.addCoinTransaction(tx);
      addToast("Coin amaliyoti bajarildi");
      await refreshData();
    } catch (e) {
      console.error(e);
      addToast("Coin berishda xatolik", "error");
    }
  };

  const handleSaveCoinSettings = async (settings) => {
    try {
      await api.updateCoinSettings(settings);
      addToast("Coin sozlamalari saqlandi");
      await refreshData();
    } catch (e) {
      console.error(e);
      addToast("Coin sozlamalarini saqlashda xatolik", "error");
    }
  };

  // Center Settings
  const handleUpdateCenterSettings = async (settings) => {
    try {
      await api.updateCenterSettings(settings);
      addToast("Markaz sozlamalari yangilandi");
      await refreshData();
    } catch (e) {
      console.error(e);
      addToast("Sozlamalarni saqlashda xatolik", "error");
    }
  };

  // Notifications
  const handleClearNotifs = () => setNotifLog([]);
  const handleMarkNotifRead = (id) =>
    setNotifLog((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  const handleMarkAllNotifsRead = () =>
    setNotifLog((prev) => prev.map((n) => ({ ...n, read: true })));

  // Render Loading Screen
  if (loading) {
    return <LoadingScreen text="COSMOS" subtitle="LC" />;
  }

  // Render Login if no active session
  if (!session) {
    return (
      <ThemeContext.Provider value={LIGHT_THEME}>
        <GlobalStyleTag />
        <AdminAuth
          directorData={directorData}
          onDirectorLogin={handleDirectorLogin}
          onManagerLogin={handleManagerLogin}
          defaultRole={defaultRole}
        />
        <ToastStack toasts={toasts} onDismiss={dismissToast} />
      </ThemeContext.Provider>
    );
  }

  // Current scope branch filtering helpers
  const currentBranch =
    currentBranchId === "all"
      ? null
      : scopeBranches.find((b) => b.id === currentBranchId);

  return (
    <ThemeContext.Provider value={LIGHT_THEME}>
      <GlobalStyleTag />
      <BackgroundBlobs />

      <AppShell
        view={view}
          goTo={goTo}
          user={session}
          role={role}
          allowedPages={allowedPages}
          now={now}
          onLogout={handleLogout}
          notifLog={notifLog}
          onClearNotifs={handleClearNotifs}
          onMarkNotifRead={handleMarkNotifRead}
          onMarkAllNotifsRead={handleMarkAllNotifsRead}
          onQuickAction={handleQuickAction}
          scopeBranches={scopeBranches}
          currentBranchId={currentBranchId}
          onSelectBranch={setCurrentBranchId}
          directorData={directorData}
          opData={opData}
        >
          <ErrorBoundary goToHome={() => setView("workbench")}>
            {/* 1. ASOSIY BO'LIM */}
            {view === "workbench" && (
              <TodayWorkbench
                directorData={directorData}
                opData={opData}
                scopeBranches={scopeBranches}
                scopeBranchIds={scopeBranchIds}
                now={now}
                goTo={goTo}
                onQuickAction={handleQuickAction}
                openPaymentModal={(student, group) =>
                  setModal({ type: "recordPayment", student, group })
                }
                openAddStudentModal={() => setModal({ type: "addStudent" })}
                openStudentProfile={(student) =>
                  setModal({ type: "studentProfile", student })
                }
                openGroupProfile={(group) =>
                  setModal({ type: "groupProfile", group })
                }
              />
            )}

          {view === "home" && (
            <DashboardHome
              directorData={directorData}
              opData={opData}
              scopeBranches={scopeBranches}
              currentBranchId={currentBranchId}
              goTo={goTo}
              openBranchModal={(branch) =>
                setModal({ type: "branchForm", branch })
              }
              openBranchDetail={(branch) =>
                setModal({ type: "branchDetail", branch })
              }
            />
          )}

          {/* 2. LIDLAR */}
          {(view === "leads" ||
            view === "leadsLost" ||
            view === "leadsAnalytics" ||
            view === "leadsForm" ||
            view === "leadsSettings" ||
            view === "leadsFormSettings") && (
            <LeadsPage
              subView={view}
              activeSubView={view}
              goTo={goTo}
              directorData={directorData}
              opData={opData}
              scopeBranches={scopeBranches}
              currentBranchId={currentBranchId}
              onSaveLead={handleSaveLead}
              onAddLead={handleSaveLead}
              onUpdateLead={handleSaveLead}
              onDeleteLead={handleDeleteLead}
              openAddStudentFromLead={(lead) =>
                setModal({ type: "addStudent", lead })
              }
            />
          )}

          {/* 3. ANALITIKA */}
          {view === "analytics" && (
            <AnalyticsPage
              directorData={directorData}
              opData={opData}
              scopeBranches={scopeBranches}
              currentBranchId={currentBranchId}
            />
          )}

          {view === "branchAnalytics" && (
            <BranchAnalyticsPage
              directorData={directorData}
              opData={opData}
              scopeBranches={scopeBranches}
              scopeBranchIds={scopeBranchIds}
            />
          )}

          {/* 4. BOSHQARUV */}
          {view === "branches" && (
            <BranchesPage
              directorData={directorData}
              opData={opData}
              scopeBranches={scopeBranches}
              openModal={(m) => setModal(m)}
              openBranchModal={(branch) =>
                setModal({ type: "branchForm", branch })
              }
              openBranchDetail={(branch) =>
                setModal({ type: "branchDetail", branch })
              }
              onDeleteBranch={handleDeleteBranch}
            />
          )}

          {view === "managers" && (
            <ManagersPage
              directorData={directorData}
              opData={opData}
              scopeBranches={scopeBranches}
              openModal={(m) => setModal(m)}
              openManagerModal={(manager) =>
                setModal({ type: "managerForm", manager })
              }
              openPermissionsModal={(manager) =>
                setModal({ type: "managerPermissions", manager })
              }
              openPayrollModal={(manager) =>
                setModal({ type: "managerPayroll", manager })
              }
              onDeleteManager={handleDeleteManager}
              onSaveManager={handleSaveManager}
              onSaveManagerPayment={handleSaveManagerPayment}
            />
          )}

          {view === "employeeAttendance" && (
            <EmployeeAttendancePage
              directorData={directorData}
              opData={opData}
              scopeBranches={scopeBranches}
              scopeBranchIds={scopeBranchIds}
              onSaveAttendance={handleSaveEmployeeAttendance}
            />
          )}

          {view === "approvals" && (
            <ApprovalsPage
              directorData={directorData}
              onApprove={handleApproveFinance}
              onReject={handleRejectFinance}
            />
          )}

          {/* 5. O'QUV JARAYONI */}
          {view === "groups" && (
            <GroupsPage
              directorData={directorData}
              opData={opData}
              scopeBranches={scopeBranches}
              scopeBranchIds={scopeBranchIds}
              openModal={(m) => setModal(m)}
              openGroupModal={(group) =>
                setModal({ type: "groupForm", group })
              }
              openGroupProfile={(group) =>
                setModal({ type: "groupProfile", group })
              }
              onDeleteGroup={handleDeleteGroup}
            />
          )}

          {view === "students" && (
            <StudentsPage
              directorData={directorData}
              opData={opData}
              scopeBranches={scopeBranches}
              openModal={(m) => setModal(m)}
              openAddStudentModal={() => setModal({ type: "addStudent" })}
              openStudentProfile={(student) =>
                setModal({ type: "studentProfile", student })
              }
              openPaymentModal={(student, group) =>
                setModal({ type: "recordPayment", student, group })
              }
              openSetStatusModal={(student) =>
                setModal({ type: "setStudentStatus", student })
              }
              openAssignGroupModal={(student) =>
                setModal({ type: "assignStudentGroup", student })
              }
              openBulkMessageModal={(selectedStudents) =>
                setModal({ type: "studentBulkMessage", selectedStudents })
              }
              onDeleteStudent={handleDeleteStudent}
              onSaveStudent={handleSaveStudent}
            />
          )}

          {view === "teachers" && (
            <TeachersHR
              directorData={directorData}
              opData={opData}
              scopeBranches={scopeBranches}
              scopeBranchIds={scopeBranchIds}
              currentBranchId={currentBranchId}
              openModal={(m) => setModal(m)}
              openTeacherModal={(teacher) =>
                setModal({ type: "teacherHRForm", teacher })
              }
              openPayrollModal={(teacher) =>
                setModal({ type: "teacherPayroll", teacher })
              }
              onDeleteTeacher={handleDeleteTeacherHR}
            />
          )}

          {view === "attendance" && (
            <AttendancePage
              directorData={directorData}
              opData={opData}
              scopeBranches={scopeBranches}
              scopeBranchIds={scopeBranchIds}
              openModal={(m) => setModal(m)}
              onSaveAttendance={handleSaveAttendance}
              openEditAttendanceModal={(group, date) =>
                setModal({ type: "editAttendance", group, date })
              }
            />
          )}

          {view === "courses" && (
            <CoursesPage
              directorData={directorData}
              opData={opData}
              scopeBranches={scopeBranches}
              currentBranchId={currentBranchId}
              openModal={(m) => setModal(m)}
              openCourseModal={(course) =>
                setModal({ type: "courseForm", course })
              }
              onDeleteCourse={handleDeleteCourse}
            />
          )}

          {view === "rooms" && (
            <RoomsPage
              directorData={directorData}
              opData={opData}
              scopeBranches={scopeBranches}
              openModal={(m) => setModal(m)}
              openRoomModal={(room) => setModal({ type: "roomForm", room })}
              onDeleteRoom={handleDeleteRoom}
            />
          )}

          {/* 6. MOLIYA */}
          {view === "payments" && (
            <PaymentsPage
              directorData={directorData}
              opData={opData}
              scopeBranches={scopeBranches}
              scopeBranchIds={scopeBranchIds}
              openModal={(m) => setModal(m)}
              openPaymentModal={() => setModal({ type: "recordPayment" })}
              onDeletePayment={handleDeletePayment}
            />
          )}

          {view === "debtors" && (
            <DebtorsPage
              directorData={directorData}
              opData={opData}
              scopeBranches={scopeBranches}
              scopeBranchIds={scopeBranchIds}
              openModal={(m) => setModal(m)}
              openPaymentModal={(student, group) =>
                setModal({ type: "recordPayment", student, group })
              }
            />
          )}

          {view === "paymentTypes" && (
            <PaymentTypesPage
              directorData={directorData}
              scopeBranches={scopeBranches}
              onRefresh={refreshData}
            />
          )}

          {view === "expenses" && (
            <ExpensesPage
              directorData={directorData}
              scopeBranches={scopeBranches}
              scopeBranchIds={scopeBranchIds}
              onSaveExpense={handleSaveFinanceRecord}
              onDeleteExpense={handleDeleteFinanceRecord}
            />
          )}

          {view === "finance" && (
            <FinancePage
              directorData={directorData}
              opData={opData}
              scopeBranches={scopeBranches}
              scopeBranchIds={scopeBranchIds}
              onSaveFinance={handleSaveFinanceRecord}
              onDeleteFinance={handleDeleteFinanceRecord}
              onApprove={handleApproveFinance}
              onReject={handleRejectFinance}
            />
          )}

          {view === "breakEven" && (
            <BreakEvenPage
              directorData={directorData}
              opData={opData}
              scopeBranches={scopeBranches}
              scopeBranchIds={scopeBranchIds}
            />
          )}

          {view === "coins" && (
            <CoinSystemPage
              directorData={directorData}
              opData={opData}
              scopeBranches={scopeBranches}
              onSaveTransaction={handleSaveCoinTransaction}
              onSaveSettings={handleSaveCoinSettings}
            />
          )}

          {/* 7. ILOVALAR */}
          {view === "holidays" && (
            <HolidaysPage
              directorData={directorData}
              scopeBranches={scopeBranches}
              onRefresh={refreshData}
            />
          )}

          {(view === "archive" || view.startsWith("archive")) && (
            <ArchivePage
              initialTab={
                view === "archiveLeads" ? "leads" :
                view === "archiveStudents" ? "students" :
                view === "archiveTeachers" ? "teachers" :
                view === "archiveStaff" ? "staff" :
                view === "archiveGroups" ? "groups" :
                view === "archivePayments" ? "payments" :
                view === "archiveSalaries" ? "salaries" :
                view === "archiveExpenses" ? "expenses" :
                view === "archiveAdditionalIncome" ? "additionalIncome" :
                view === "archiveBonuses" ? "bonuses" :
                "leads"
              }
              directorData={directorData}
              opData={opData}
              scopeBranches={scopeBranches}
              currentBranchId={currentBranchId}
              onRefresh={refreshData}
            />
          )}

          {/* 8. SOZLAMALAR */}
          {view === "centerSettings" && (
            <CenterSettingsPage
              directorData={directorData}
              onUpdateSettings={handleUpdateCenterSettings}
            />
          )}

          {view === "settings" && (
            <ProfileSettingsHub
              directorData={directorData}
              user={session}
              onUpdateSettings={handleUpdateCenterSettings}
              onRefresh={refreshData}
            />
          )}

          {view === "profile" && (
            <ProfilePage
              user={session}
              onSaveProfile={handleSaveManager}
            />
          )}

          {view === "security" && (
            <SecurityPage
              user={session}
              directorData={directorData}
              onRefresh={refreshData}
            />
          )}

          {view === "notifications" && (
            <NotificationsPage
              notifLog={notifLog}
              onClear={handleClearNotifs}
              onMarkRead={handleMarkNotifRead}
              onMarkAllRead={handleMarkAllNotifsRead}
            />
          )}

          {/* Qo'shimcha Moliya & Sozlama Sub-Sahifalari */}
          {view === "additionalIncome" && (
            <AdditionalIncomePage directorData={directorData} onRefresh={refreshData} />
          )}

          {view === "salaries" && (
            <SalariesPage directorData={directorData} />
          )}

          {view === "positions" && (
            <PositionsPage />
          )}

          {view === "receiptSettings" && (
            <ReceiptSettingsPage />
          )}

          {view === "reasons" && (
            <ReasonsPage />
          )}

          {view === "placementTest" && (
            <PlacementTestPage />
          )}

          {view === "points" && (
            <PointsGradingPage />
          )}

          {view === "examTemplates" && (
            <ExamTemplatesPage />
          )}

          {view === "smsBuy" && (
            <SmsBuyPage />
          )}

          {view === "autoSms" && (
            <AutoSmsPage />
          )}

          {view === "smsTemplates" && (
            <SmsTemplatesPage />
          )}

          {["simpleForm", "teacherForm", "staffForm", "referralForm"].includes(view) && (
            <FormsBuilderPage formType={view} />
          )}

          {view === "tags" && (
            <TagsPage />
          )}

          {/* Hisobotlar Sahifalari */}
          {view === "reportCourse" && <CourseReportPage />}
          {view === "reportTeacherPerformance" && <TeacherPerformanceReportPage />}
          {view === "reportCashflow" && <CashflowReportPage />}
          {view === "reportSalaries" && <SalariesReportPage />}
          {view === "reportDiscounts" && <DiscountsReportPage />}
          {view === "reportSmsSent" && <SmsSentReportPage />}
          {view === "reportWorkTime" && <WorkTimeReportPage />}
          {view === "reportJournals" && <JournalsReportPage />}
          {view === "reportCoins" && <CoinsReportPage />}
          {view === "reportPoints" && <PointsReportPage />}
          {view === "reportExams" && <ExamsReportPage />}
          {view === "reportLeads" && <LeadsReportPage />}
          {view === "reportGroupRemoved" && <GroupRemovedReportPage />}
          {view === "reportAttendance" && <AttendanceReportPage />}
        </ErrorBoundary>
      </AppShell>

        {/* ===================== MODALS ===================== */}

        {modal?.type === "branchForm" && (
          <BranchFormModal
            editing={modal.branch}
            managers={directorData?.managers || []}
            onSubmit={handleSaveBranch}
            onClose={() => setModal(null)}
            openManagerModal={() => setModal({ type: "managerForm" })}
          />
        )}

        {modal?.type === "branchDetail" && (
          <BranchDetailModal
            branch={modal.branch}
            directorData={directorData}
            opData={opData}
            onClose={() => setModal(null)}
          />
        )}

        {modal?.type === "managerForm" && (
          <ManagerFormModal
            editing={modal.manager || modal.editing}
            branches={directorData?.branches || []}
            onSubmit={handleSaveManager}
            onClose={() => setModal(null)}
          />
        )}

        {modal?.type === "managerPermissions" && (
          <ManagerPermissionsModal
            manager={modal.manager}
            onSave={(allowed) =>
              handleSaveManagerPermissions(modal.manager.id, allowed)
            }
            onClose={() => setModal(null)}
          />
        )}

        {modal?.type === "managerPayroll" && (
          <ManagerPayrollModal
            manager={modal.manager}
            directorData={directorData}
            opData={opData}
            onSubmit={handleSaveManagerPayment}
            onClose={() => setModal(null)}
          />
        )}

        {modal?.type === "teacherHRForm" && (
          <TeacherHRFormModal
            editing={modal.teacher}
            branches={directorData?.branches || []}
            onSubmit={handleSaveTeacherHR}
            onClose={() => setModal(null)}
          />
        )}

        {modal?.type === "teacherPayroll" && (
          <TeacherPayrollModal
            teacher={modal.teacher}
            directorData={directorData}
            opData={opData}
            onSubmit={handleSaveTeacherPayment}
            onClose={() => setModal(null)}
          />
        )}

        {modal?.type === "courseForm" && (
          <CourseFormModal
            editing={modal.course}
            branches={directorData?.branches || []}
            onSubmit={handleSaveCourse}
            onClose={() => setModal(null)}
          />
        )}

        {modal?.type === "groupForm" && (
          <GroupFormModal
            editing={modal.group}
            initialCourseId={modal.courseId}
            courses={directorData?.courses || []}
            teachers={directorData?.teachersHR || []}
            rooms={opData?.rooms || []}
            branches={directorData?.branches || []}
            onSubmit={handleSaveGroup}
            onClose={() => setModal(null)}
          />
        )}

        {modal?.type === "groupProfile" && (
          <GroupProfileModal
            group={modal.group}
            directorData={directorData}
            opData={opData}
            onClose={() => setModal(null)}
            openPaymentModal={(student, group) =>
              setModal({ type: "recordPayment", student, group })
            }
            openStudentProfile={(student) =>
              setModal({ type: "studentProfile", student })
            }
            onSaveGroup={handleSaveGroup}
            onDeleteGroup={handleDeleteGroup}
          />
        )}

        {modal?.type === "roomForm" && (
          <RoomFormModal
            editing={modal.room}
            branches={directorData?.branches || []}
            onSubmit={handleSaveRoom}
            onClose={() => setModal(null)}
          />
        )}

        {modal?.type === "recordPayment" && (
          <RecordPaymentModal
            preselectedStudent={modal.student}
            preselectedGroup={modal.group}
            students={opData?.students || []}
            groups={opData?.groups || []}
            paymentMethods={directorData?.paymentTypes || []}
            onSubmit={handleSavePayment}
            onClose={() => setModal(null)}
          />
        )}

        {modal?.type === "addStudent" && (
          <AddStudentModal
            initialLead={modal.lead}
            groups={opData?.groups || []}
            branches={directorData?.branches || []}
            onSubmit={handleSaveStudent}
            onClose={() => setModal(null)}
          />
        )}

        {modal?.type === "studentProfile" && (
          <StudentProfileModal
            student={modal.student}
            directorData={directorData}
            opData={opData}
            onClose={() => setModal(null)}
            openPaymentModal={(student, group) =>
              setModal({ type: "recordPayment", student, group })
            }
            onSaveStudent={handleSaveStudent}
            onDeleteStudent={handleDeleteStudent}
          />
        )}

        {modal?.type === "setStudentStatus" && (
          <SetStudentStatusModal
            student={modal.student}
            onSubmit={handleSaveStudent}
            onClose={() => setModal(null)}
          />
        )}

        {modal?.type === "assignStudentGroup" && (
          <AssignStudentToGroupModal
            student={modal.student}
            groups={opData?.groups || []}
            onSubmit={handleSaveStudent}
            onClose={() => setModal(null)}
          />
        )}

        {modal?.type === "studentBulkMessageModal" && (
          <StudentBulkMessageModal
            students={modal.selectedStudents}
            onClose={() => setModal(null)}
          />
        )}

        {modal?.type === "editAttendance" && (
          <EditAttendanceModal
            group={modal.group}
            date={modal.date}
            students={opData?.students || []}
            attendance={opData?.attendance || []}
            onSaveAttendance={handleSaveAttendance}
            onClose={() => setModal(null)}
          />
        )}

      {/* Global Toast Stack */}
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </ThemeContext.Provider>
  );
}

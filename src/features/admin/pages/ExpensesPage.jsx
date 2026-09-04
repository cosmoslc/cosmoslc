import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  TrendingDown,
  Calendar,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Wallet,
  Building2,
  Tag,
  CreditCard,
  User,
  AlertCircle,
  FileText,
  DollarSign,
  Layers,
  CalendarRange,
  Users,
  Check,
  X,
  CheckSquare,
  Square,
} from "lucide-react";
import { INPUT_CLS, LABEL_CLS } from "../theme/tokens";
import { money } from "../utils/helpers";

const DEFAULT_EXPENSE_CATEGORIES = [
  { id: "cat-1", name: "Ofis xarajatlari", allBranches: true, branchIds: [] },
  { id: "cat-2", name: "Reklama va Marketing", allBranches: true, branchIds: [] },
  { id: "cat-3", name: "Kommunal to'lovlar", allBranches: true, branchIds: [] },
  { id: "cat-4", name: "Jihozlar va Texnika", allBranches: true, branchIds: [] },
  { id: "cat-5", name: "Kantselyariya", allBranches: true, branchIds: [] },
  { id: "cat-6", name: "Internet va Aloqa", allBranches: true, branchIds: [] },
  { id: "cat-7", name: "Choy va kofe / Oshxona", allBranches: true, branchIds: [] },
  { id: "cat-8", name: "Dasturiy ta'minot (SaaS)", allBranches: true, branchIds: [] },
  { id: "cat-9", name: "Transport va Yoqilg'i", allBranches: true, branchIds: [] },
  { id: "cat-10", name: "Boshqa xarajatlar", allBranches: true, branchIds: [] },
];

const PAYMENT_METHODS = [
  { id: "naqd", name: "Naqd pul" },
  { id: "karta", name: "Plastik karta" },
  { id: "bank", name: "Bank o'tkazmasi" },
  { id: "click_payme", name: "Click / Payme" },
];

export function ExpensesPage({
  directorData,
  opData,
  scopeBranches = [],
  scopeBranchIds = [],
  onSaveExpense,
  onDeleteExpense,
  onSaveExpenseCategory,
  onDeleteExpenseCategory,
  onSaveExpensePlan,
  onDeleteExpensePlan,
}) {
  // Top 5 Menu Tabs
  const [activeMenu, setActiveMenu] = useState("variable");

  // ----------------------------------------------------
  // Dynamic Expense Categories State & Supabase Sync
  // ----------------------------------------------------
  const [categories, setCategories] = useState(() => {
    if (directorData?.expenseCategories && directorData.expenseCategories.length > 0) {
      return directorData.expenseCategories;
    }
    try {
      const saved = localStorage.getItem("crm_expense_categories");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_EXPENSE_CATEGORIES;
  });

  // Sync if directorData.expenseCategories updates from Supabase
  useMemo(() => {
    if (directorData?.expenseCategories && directorData.expenseCategories.length > 0) {
      setCategories(directorData.expenseCategories);
    }
  }, [directorData?.expenseCategories]);

  const saveCategories = (newCategories) => {
    setCategories(newCategories);
    try {
      localStorage.setItem("crm_expense_categories", JSON.stringify(newCategories));
    } catch (e) {
      console.error(e);
    }
  };

  const categoryNames = useMemo(() => {
    return categories.map((c) => c.name);
  }, [categories]);

  // Categories search state
  const [categorySearch, setCategorySearch] = useState("");

  // Categories Modal State
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    allBranches: true,
    branchIds: [],
  });

  // ----------------------------------------------------
  // Expense Plans State & Supabase Sync
  // ----------------------------------------------------
  const currentMonthStr = useMemo(() => new Date().toISOString().slice(0, 7), []);

  const [plans, setPlans] = useState(() => {
    if (directorData?.expensePlans && directorData.expensePlans.length > 0) {
      return directorData.expensePlans;
    }
    try {
      const saved = localStorage.getItem("crm_expense_plans");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  useMemo(() => {
    if (directorData?.expensePlans) {
      setPlans(directorData.expensePlans);
    }
  }, [directorData?.expensePlans]);

  const savePlans = (newPlans) => {
    setPlans(newPlans);
    try {
      localStorage.setItem("crm_expense_plans", JSON.stringify(newPlans));
    } catch (e) {
      console.error(e);
    }
  };

  // Planning Filters
  const [planMonthFilter, setPlanMonthFilter] = useState("");
  const [planCategoryFilter, setPlanCategoryFilter] = useState("all");
  const [planStaffFilter, setPlanStaffFilter] = useState("all");
  const [planPaymentMethodFilter, setPlanPaymentMethodFilter] = useState("all");

  // Planning Modal States
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [deletingPlan, setDeletingPlan] = useState(null);
  const [isSubmittingPlan, setIsSubmittingPlan] = useState(false);
  const [planFormData, setPlanFormData] = useState({
    category: "",
    amount: "",
    paymentMethod: "all",
    month: currentMonthStr,
    staffId: "all",
    staffName: "Barcha xodimlar",
    note: "",
  });

  // ----------------------------------------------------
  // Expenses State & Filters
  // ----------------------------------------------------
  const [searchReason, setSearchReason] = useState("");
  const [selectedStaff, setSelectedStaff] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Pagination (Max 20 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Modals state for Expense
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State for Expense
  const [formData, setFormData] = useState({
    note: "",
    category: categoryNames[0] || "Ofis xarajatlari",
    amount: "",
    paymentMethod: "naqd",
    date: new Date().toISOString().split("T")[0],
    staffName: "",
    staffId: "",
  });

  // Extract all staff (Managers, Teachers, other staff)
  const staffList = useMemo(() => {
    const managers = (directorData?.managers || []).map((m) => ({
      id: m.id,
      name: m.name || "Menejer",
      role: "Menejer",
    }));

    const teachers = (directorData?.teachersHR || directorData?.teachers || opData?.teachers || []).map((t) => ({
      id: t.id,
      name: t.name || "O'qituvchi",
      role: "O'qituvchi",
    }));

    const otherStaff = (directorData?.staff || []).map((s) => ({
      id: s.id,
      name: s.name || "Xodim",
      role: s.role || "Xodim",
    }));

    // Deduplicate by name or id
    const map = new Map();
    [...managers, ...teachers, ...otherStaff].forEach((item) => {
      if (item.name && !map.has(item.name)) {
        map.set(item.name, item);
      }
    });

    return Array.from(map.values());
  }, [directorData?.managers, directorData?.teachersHR, directorData?.teachers, opData?.teachers, directorData?.staff]);

  // Raw finance items filtered for expenses
  const allFinance = directorData?.finance || [];

  const scopedExpenses = useMemo(() => {
    return allFinance.filter((f) => {
      if (f.type !== "expense") return false;

      // Branch filter
      if (scopeBranchIds && scopeBranchIds.length > 0 && f.branchId) {
        if (!scopeBranchIds.includes(f.branchId)) return false;
      }

      // Variable vs Fixed
      if (activeMenu === "variable") {
        return f.expenseType !== "fixed";
      } else if (activeMenu === "fixed") {
        return f.expenseType === "fixed";
      }

      return true;
    });
  }, [allFinance, scopeBranchIds, activeMenu]);

  // Filtered expenses based on search & filters
  const filteredExpenses = useMemo(() => {
    let list = scopedExpenses.map((item) => {
      let staffName = item.staffName;
      if (!staffName) {
        const foundStaff = staffList.find(
          (s) => String(s.id) === String(item.staffId) || String(s.id) === String(item.managerId) || String(s.id) === String(item.createdBy)
        );
        staffName = foundStaff?.name || item.managerName || "Menejer";
      }

      return {
        ...item,
        resolvedStaffName: staffName,
        paymentMethodName:
          PAYMENT_METHODS.find((p) => p.id === item.paymentMethod)?.name ||
          item.paymentMethod ||
          "Naqd pul",
      };
    });

    // 1. Sabab bo'yicha qidirish
    if (searchReason.trim()) {
      const q = searchReason.toLowerCase();
      list = list.filter(
        (f) =>
          (f.note || "").toLowerCase().includes(q) ||
          (f.category || "").toLowerCase().includes(q)
      );
    }

    // 2. Xodim bo'yicha filter
    if (selectedStaff !== "all") {
      list = list.filter(
        (f) =>
          String(f.staffId) === String(selectedStaff) ||
          f.resolvedStaffName === selectedStaff
      );
    }

    // 3. Bo'lim / Kategoriya bo'yicha filter
    if (selectedCategory !== "all") {
      list = list.filter((f) => f.category === selectedCategory);
    }

    // 4. To'lov usuli bo'yicha filter
    if (selectedPaymentMethod !== "all") {
      list = list.filter((f) => (f.paymentMethod || "naqd") === selectedPaymentMethod);
    }

    // 5. Sanadan - Sanagacha filter
    if (startDate) {
      list = list.filter((f) => f.date && f.date >= startDate);
    }
    if (endDate) {
      list = list.filter((f) => f.date && f.date <= endDate);
    }

    return list.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [scopedExpenses, searchReason, selectedStaff, selectedCategory, selectedPaymentMethod, startDate, endDate, staffList]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredExpenses.length / itemsPerPage));
  const paginatedExpenses = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredExpenses.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredExpenses, currentPage, itemsPerPage]);

  // Total summary calculation
  const totalExpenseSum = useMemo(() => {
    return filteredExpenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }, [filteredExpenses]);

  // Clear filters
  function handleClearFilters() {
    setSearchReason("");
    setSelectedStaff("all");
    setSelectedCategory("all");
    setSelectedPaymentMethod("all");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  }

  // ----------------------------------------------------
  // Category Actions
  // ----------------------------------------------------
  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return categories;
    const q = categorySearch.toLowerCase();
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, categorySearch]);

  function handleOpenAddCategory() {
    setEditingCategory(null);
    setCategoryFormData({
      name: "",
      allBranches: true,
      branchIds: scopeBranches.map((b) => b.id),
    });
    setCategoryModalOpen(true);
  }

  function handleOpenEditCategory(cat) {
    setEditingCategory(cat);
    setCategoryFormData({
      name: cat.name || "",
      allBranches: cat.allBranches ?? true,
      branchIds: cat.branchIds || scopeBranches.map((b) => b.id),
    });
    setCategoryModalOpen(true);
  }

  async function handleSubmitCategoryForm(e) {
    e.preventDefault();
    if (!categoryFormData.name.trim()) return;

    const payload = {
      ...(editingCategory ? { id: editingCategory.id } : {}),
      name: categoryFormData.name.trim(),
      allBranches: categoryFormData.allBranches,
      branchIds: categoryFormData.allBranches ? [] : categoryFormData.branchIds,
    };

    if (editingCategory) {
      const updated = categories.map((c) =>
        c.id === editingCategory.id ? { ...c, ...payload } : c
      );
      saveCategories(updated);
    } else {
      const tempId = `cat-${Date.now()}`;
      saveCategories([...categories, { id: tempId, ...payload }]);
    }

    if (onSaveExpenseCategory) {
      try {
        await onSaveExpenseCategory(payload);
      } catch (err) {
        console.error("onSaveExpenseCategory error:", err);
      }
    }
    setCategoryModalOpen(false);
  }

  async function handleConfirmDeleteCategory() {
    if (!deletingCategory) return;
    const catId = deletingCategory.id;
    const updated = categories.filter((c) => c.id !== catId);
    saveCategories(updated);
    setDeletingCategory(null);

    if (onDeleteExpenseCategory) {
      try {
        await onDeleteExpenseCategory(catId);
      } catch (err) {
        console.error("onDeleteExpenseCategory error:", err);
      }
    }
  }

  // ----------------------------------------------------
  // Expense Planning Actions & Calculations
  // ----------------------------------------------------
  function handleOpenAddPlan() {
    setEditingPlan(null);
    setPlanFormData({
      category: categoryNames[0] || "Ofis xarajatlari",
      amount: "",
      paymentMethod: "all",
      month: currentMonthStr,
      staffId: "all",
      staffName: "Barcha xodimlar",
      note: "",
    });
    setPlanModalOpen(true);
  }

  function handleOpenEditPlan(plan) {
    setEditingPlan(plan);
    setPlanFormData({
      category: plan.category || categoryNames[0] || "Ofis xarajatlari",
      amount: plan.amount || "",
      paymentMethod: plan.paymentMethod || "all",
      month: plan.month || currentMonthStr,
      staffId: plan.staffId || "all",
      staffName: plan.staffName || "Barcha xodimlar",
      note: plan.note || "",
    });
    setPlanModalOpen(true);
  }

  async function handleSubmitPlanForm(e) {
    e.preventDefault();
    if (!planFormData.category) return;
    if (!planFormData.amount || Number(planFormData.amount) <= 0) return;

    setIsSubmittingPlan(true);
    const chosenStaff =
      planFormData.staffId === "all"
        ? { id: "all", name: "Barcha xodimlar" }
        : staffList.find((s) => String(s.id) === String(planFormData.staffId)) || {
            id: planFormData.staffId,
            name: planFormData.staffName || "Xodim",
          };

    const payload = {
      ...(editingPlan ? { id: editingPlan.id } : {}),
      category: planFormData.category,
      amount: Number(planFormData.amount),
      paymentMethod: planFormData.paymentMethod || "all",
      month: planFormData.month || currentMonthStr,
      staffId: chosenStaff.id,
      staffName: chosenStaff.name,
      note: planFormData.note?.trim() || "",
    };

    try {
      if (editingPlan) {
        const updated = plans.map((p) =>
          p.id === editingPlan.id ? { ...p, ...payload } : p
        );
        savePlans(updated);
      } else {
        const tempId = `plan-${Date.now()}`;
        savePlans([{ id: tempId, ...payload, createdAt: Date.now() }, ...plans]);
      }

      if (onSaveExpensePlan) {
        await onSaveExpensePlan(payload);
      }
      setPlanModalOpen(false);
    } catch (err) {
      console.error("handleSubmitPlanForm error:", err);
    } finally {
      setIsSubmittingPlan(false);
    }
  }

  async function handleConfirmDeletePlan() {
    if (!deletingPlan) return;
    const planId = deletingPlan.id;
    const updated = plans.filter((p) => p.id !== planId);
    savePlans(updated);
    setDeletingPlan(null);

    if (onDeleteExpensePlan) {
      try {
        await onDeleteExpensePlan(planId);
      } catch (err) {
        console.error("handleConfirmDeletePlan error:", err);
      }
    }
  }

  // Analytics for each plan: compares planned limit vs actual expenses
  const plansWithAnalytics = useMemo(() => {
    return plans.map((plan) => {
      const matchingExpenses = allFinance.filter((exp) => {
        if (exp.type !== "expense") return false;

        if (scopeBranchIds && scopeBranchIds.length > 0 && exp.branchId) {
          if (!scopeBranchIds.includes(exp.branchId)) return false;
        }

        if (exp.category !== plan.category) return false;

        const expMonth = (exp.date || "").slice(0, 7);
        if (plan.month && expMonth !== plan.month) return false;

        if (plan.paymentMethod && plan.paymentMethod !== "all") {
          const m = exp.paymentMethod || "naqd";
          if (m !== plan.paymentMethod) return false;
        }

        if (plan.staffId && plan.staffId !== "all") {
          const matchStaffId = String(exp.staffId) === String(plan.staffId);
          const matchStaffName = exp.staffName && exp.staffName === plan.staffName;
          if (!matchStaffId && !matchStaffName) return false;
        }

        return true;
      });

      const actualSpent = matchingExpenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
      const limit = Number(plan.amount) || 0;
      const percent = limit > 0 ? Math.round((actualSpent / limit) * 100) : 0;
      const remaining = limit - actualSpent;

      const paymentMethodObj = PAYMENT_METHODS.find((p) => p.id === plan.paymentMethod);
      const paymentMethodName =
        plan.paymentMethod === "all" || !plan.paymentMethod
          ? "Barchasi"
          : paymentMethodObj?.name || plan.paymentMethod;

      return {
        ...plan,
        actualSpent,
        percent,
        remaining,
        paymentMethodName,
        matchingCount: matchingExpenses.length,
      };
    });
  }, [plans, allFinance, scopeBranchIds]);

  const filteredPlans = useMemo(() => {
    return plansWithAnalytics.filter((p) => {
      if (planMonthFilter && p.month !== planMonthFilter) return false;
      if (planCategoryFilter !== "all" && p.category !== planCategoryFilter) return false;
      if (planStaffFilter !== "all") {
        if (String(p.staffId) !== String(planStaffFilter) && p.staffName !== planStaffFilter) {
          return false;
        }
      }
      if (planPaymentMethodFilter !== "all" && p.paymentMethod !== planPaymentMethodFilter) {
        return false;
      }
      return true;
    });
  }, [plansWithAnalytics, planMonthFilter, planCategoryFilter, planStaffFilter, planPaymentMethodFilter]);

  const totalPlannedSum = useMemo(() => {
    return filteredPlans.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }, [filteredPlans]);

  const totalActualSpentSum = useMemo(() => {
    return filteredPlans.reduce((sum, p) => sum + (p.actualSpent || 0), 0);
  }, [filteredPlans]);

  const overallPlanPercent = useMemo(() => {
    if (totalPlannedSum === 0) return 0;
    return Math.round((totalActualSpentSum / totalPlannedSum) * 100);
  }, [totalPlannedSum, totalActualSpentSum]);

  // ----------------------------------------------------
  // Expense Actions
  // ----------------------------------------------------
  function handleOpenAdd() {
    setEditingItem(null);
    setFormData({
      note: "",
      category: categoryNames[0] || "Ofis xarajatlari",
      amount: "",
      paymentMethod: "naqd",
      date: new Date().toISOString().split("T")[0],
      staffName: staffList[0]?.name || "",
      staffId: staffList[0]?.id || "",
    });
    setModalOpen(true);
  }

  function handleOpenEdit(item) {
    setEditingItem(item);
    setFormData({
      note: item.note || "",
      category: item.category || categoryNames[0] || "Ofis xarajatlari",
      amount: item.amount || "",
      paymentMethod: item.paymentMethod || "naqd",
      date: item.date || new Date().toISOString().split("T")[0],
      staffName: item.resolvedStaffName || item.staffName || staffList[0]?.name || "",
      staffId: item.staffId || staffList[0]?.id || "",
    });
    setModalOpen(true);
  }

  async function handleSubmitForm(e) {
    e.preventDefault();
    if (!formData.note.trim()) return;
    if (!formData.amount || Number(formData.amount) <= 0) return;

    setIsSubmitting(true);
    try {
      const payload = {
        ...(editingItem ? { id: editingItem.id } : {}),
        type: "expense",
        expenseType: activeMenu === "fixed" ? "fixed" : "variable",
        note: formData.note.trim(),
        category: formData.category,
        amount: Number(formData.amount),
        paymentMethod: formData.paymentMethod,
        date: formData.date,
        staffName: formData.staffName,
        staffId: formData.staffId,
        status: "approved",
      };

      if (onSaveExpense) {
        await onSaveExpense(payload);
      }
      setModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deletingItem) return;
    setIsSubmitting(true);
    try {
      if (onDeleteExpense) {
        await onDeleteExpense(deletingItem.id);
      }
      setDeletingItem(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-4 pb-16">
      {/* ---------------------------------------------------- */}
      {/* 1. TOP 5 MENU TABS                                   */}
      {/* ---------------------------------------------------- */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-1.5 shadow-xs">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => {
              setActiveMenu("variable");
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeMenu === "variable"
                ? "bg-rose-500 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60"
            }`}
          >
            <TrendingDown size={15} />
            <span>O'zgaruvchi xarajatlar</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveMenu("fixed");
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeMenu === "fixed"
                ? "bg-rose-500 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60"
            }`}
          >
            <Building2 size={15} />
            <span>O'zgarmas xarajatlar</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveMenu("categories");
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeMenu === "categories"
                ? "bg-rose-500 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60"
            }`}
          >
            <Tag size={15} />
            <span>Xarajat turlari</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMenu("planning")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeMenu === "planning"
                ? "bg-rose-500 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60"
            }`}
          >
            <CalendarRange size={15} />
            <span>Xarajatlarni rejalashtirish</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMenu("otherStaff")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeMenu === "otherStaff"
                ? "bg-rose-500 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60"
            }`}
          >
            <Users size={15} />
            <span>Boshqa xodimlar</span>
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 2. TAB: XARAJAT TURLARI                              */}
      {/* ---------------------------------------------------- */}
      {activeMenu === "categories" && (
        <div className="space-y-4">
          {/* Header Bar */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Xarajat turlari
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800">
                {categories.length} ta xarajat turi
              </span>
            </div>

            <button
              type="button"
              onClick={handleOpenAddCategory}
              className="px-3.5 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus size={15} /> Xarajat turi qo'shish
            </button>
          </div>

          {/* Search bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 shadow-xs">
            <div className="relative max-w-sm">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                placeholder="Xarajat turi nomi bo'yicha qidirish..."
                className={`${INPUT_CLS} pl-9`}
              />
            </div>
          </div>

          {/* Categories Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
            {filteredCategories.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <Tag size={24} />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Hech qanday xarajat turi topilmadi.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-semibold">
                      <th className="py-2.5 px-3 w-12 text-center">#</th>
                      <th className="py-2.5 px-4">Nomi</th>
                      <th className="py-2.5 px-4">Filiallar</th>
                      <th className="py-2.5 px-4 text-right w-28">Amallar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {filteredCategories.map((cat, idx) => (
                      <tr
                        key={cat.id || idx}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3 px-3 text-center text-slate-400 font-mono text-[11px]">
                          {idx + 1}
                        </td>

                        {/* Nomi */}
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                            <span>{cat.name}</span>
                          </div>
                        </td>

                        {/* Filiallar */}
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                          {cat.allBranches !== false ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800 font-semibold text-[11px]">
                              Barcha filiallar
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                              Tanlangan filiallar
                            </span>
                          )}
                        </td>

                        {/* Amallar */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditCategory(cat)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors"
                              title="Tahrirlash"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingCategory(cat)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
                              title="O'chirish"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 3. TAB: XARAJATLARNI REJALASHTIRISH                  */}
      {/* ---------------------------------------------------- */}
      {activeMenu === "planning" && (
        <div className="space-y-4">
          {/* Header Bar */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Xarajatlarni rejalashtirish
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800">
                Reja: {money(totalPlannedSum)} so'm
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800">
                Sarflandi: {money(totalActualSpentSum)} so'm
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                overallPlanPercent > 100
                  ? "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200/60 dark:border-rose-800"
                  : overallPlanPercent >= 80
                  ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/60 dark:border-amber-800"
                  : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800"
              }`}>
                Bajarilish: {overallPlanPercent}%
              </span>
            </div>

            <button
              type="button"
              onClick={handleOpenAddPlan}
              className="px-3.5 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus size={15} /> Reja qo'shish
            </button>
          </div>

          {/* Filter Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {/* Oy filtri */}
              <div className="space-y-1">
                <label className={LABEL_CLS}>Oy</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="month"
                    value={planMonthFilter}
                    onChange={(e) => setPlanMonthFilter(e.target.value)}
                    className={INPUT_CLS}
                  />
                  {planMonthFilter && (
                    <button
                      type="button"
                      onClick={() => setPlanMonthFilter("")}
                      className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Filtrni tozalash"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Bo'lim filtri */}
              <div className="space-y-1">
                <label className={LABEL_CLS}>Bo'lim</label>
                <select
                  value={planCategoryFilter}
                  onChange={(e) => setPlanCategoryFilter(e.target.value)}
                  className={INPUT_CLS}
                >
                  <option value="all">Barcha bo'limlar</option>
                  {categoryNames.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Xodim filtri */}
              <div className="space-y-1">
                <label className={LABEL_CLS}>Xodim</label>
                <select
                  value={planStaffFilter}
                  onChange={(e) => setPlanStaffFilter(e.target.value)}
                  className={INPUT_CLS}
                >
                  <option value="all">Barcha xodimlar</option>
                  {staffList.map((s) => (
                    <option key={s.id || s.name} value={s.id}>
                      {s.name} ({s.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* To'lov usuli filtri */}
              <div className="space-y-1">
                <label className={LABEL_CLS}>To'lov usuli</label>
                <select
                  value={planPaymentMethodFilter}
                  onChange={(e) => setPlanPaymentMethodFilter(e.target.value)}
                  className={INPUT_CLS}
                >
                  <option value="all">Barchasi</option>
                  {PAYMENT_METHODS.map((pm) => (
                    <option key={pm.id} value={pm.id}>
                      {pm.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Plans Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
            {filteredPlans.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <CalendarRange size={24} />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Hech qanday xarajat rejasi topilmadi.
                </p>
                <button
                  type="button"
                  onClick={handleOpenAddPlan}
                  className="px-3.5 py-1.5 rounded-lg bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition-colors inline-flex items-center gap-1.5 mt-2"
                >
                  <Plus size={14} /> Yangi reja kiritish
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-semibold">
                      <th className="py-2.5 px-3 w-12 text-center">#</th>
                      <th className="py-2.5 px-4">Bo'lim</th>
                      <th className="py-2.5 px-4">Oy</th>
                      <th className="py-2.5 px-4">Xodim</th>
                      <th className="py-2.5 px-4">To'lov usuli</th>
                      <th className="py-2.5 px-4">Limit summasi</th>
                      <th className="py-2.5 px-4 min-w-44">Haqiqiy xarajat</th>
                      <th className="py-2.5 px-4">Qoldiq</th>
                      <th className="py-2.5 px-4 text-right w-24">Amallar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {filteredPlans.map((plan, idx) => {
                      const isOver = plan.percent > 100;
                      const isNear = plan.percent >= 80 && plan.percent <= 100;

                      return (
                        <tr
                          key={plan.id || idx}
                          className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="py-3 px-3 text-center text-slate-400 font-mono text-[11px]">
                            {idx + 1}
                          </td>

                          {/* Bo'lim */}
                          <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
                              <span>{plan.category}</span>
                            </div>
                            {plan.note && (
                              <div className="text-[11px] text-slate-400 font-normal mt-0.5">
                                {plan.note}
                              </div>
                            )}
                          </td>

                          {/* Oy */}
                          <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-mono text-[11px]">
                              {plan.month}
                            </span>
                          </td>

                          {/* Xodim */}
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                            {plan.staffName || "Barcha xodimlar"}
                          </td>

                          {/* To'lov usuli */}
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                            <span className="px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-[11px] font-medium">
                              {plan.paymentMethodName}
                            </span>
                          </td>

                          {/* Limit summasi */}
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                            {money(plan.amount)} so'm
                          </td>

                          {/* Haqiqiy xarajat & Progress */}
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                  {money(plan.actualSpent)} so'm
                                </span>
                                <span
                                  className={`font-bold ${
                                    isOver
                                      ? "text-rose-600 dark:text-rose-400"
                                      : isNear
                                      ? "text-amber-600 dark:text-amber-400"
                                      : "text-emerald-600 dark:text-emerald-400"
                                  }`}
                                >
                                  {plan.percent}%
                                </span>
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    isOver
                                      ? "bg-rose-500"
                                      : isNear
                                      ? "bg-amber-500"
                                      : "bg-emerald-500"
                                  }`}
                                  style={{ width: `${Math.min(plan.percent, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>

                          {/* Qoldiq */}
                          <td className="py-3 px-4 font-semibold">
                            {plan.remaining >= 0 ? (
                              <span className="text-emerald-600 dark:text-emerald-400 text-[11px]">
                                +{money(plan.remaining)} so'm
                              </span>
                            ) : (
                              <span className="text-rose-600 dark:text-rose-400 text-[11px]">
                                {money(plan.remaining)} so'm
                              </span>
                            )}
                          </td>

                          {/* Amallar */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEditPlan(plan)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors"
                                title="Tahrirlash"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingPlan(plan)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
                                title="O'chirish"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 4. OTHER TABS PLACEHOLDERS                           */}
      {/* ---------------------------------------------------- */}
      {activeMenu === "otherStaff" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-12 text-center shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center mx-auto">
            <Users size={24} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Boshqa xodimlar ro'yxati
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Ushbu bo'lim hozirda tayyorlanmoqda.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveMenu("variable")}
            className="px-4 py-2 rounded-lg bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition-colors"
          >
            O'zgaruvchi xarajatlarga qaytish
          </button>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 4. MAIN SECTION: O'ZGARUVCHI / O'ZGARMAS XARAJATLAR */}
      {/* ---------------------------------------------------- */}
      {(activeMenu === "variable" || activeMenu === "fixed") && (
        <>
          {/* TOP BAR WITH STATS & ADD BUTTON */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {activeMenu === "variable"
                  ? "O'zgaruvchi xarajatlar"
                  : "O'zgarmas xarajatlar"}
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800">
                Jami: {money(totalExpenseSum)} so'm
              </span>
            </div>

            <button
              type="button"
              onClick={handleOpenAdd}
              className="px-3.5 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus size={15} /> Xarajat qo'shish
            </button>
          </div>

          {/* FILTER CONTROLS */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {/* 1. Sabab bo'yicha */}
              <div className="space-y-1">
                <label className={LABEL_CLS}>Sabab</label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchReason}
                    onChange={(e) => {
                      setSearchReason(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Sababi bo'yicha..."
                    className={`${INPUT_CLS} pl-9`}
                  />
                </div>
              </div>

              {/* 2. Xodim bo'yicha */}
              <div className="space-y-1">
                <label className={LABEL_CLS}>Xodim</label>
                <select
                  value={selectedStaff}
                  onChange={(e) => {
                    setSelectedStaff(e.target.value);
                    setCurrentPage(1);
                  }}
                  className={INPUT_CLS}
                >
                  <option value="all">Barcha xodimlar</option>
                  {staffList.map((s) => (
                    <option key={s.id || s.name} value={s.name}>
                      {s.name} ({s.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Bo'lim bo'yicha */}
              <div className="space-y-1">
                <label className={LABEL_CLS}>Bo'lim</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className={INPUT_CLS}
                >
                  <option value="all">Barcha bo'limlar</option>
                  {categoryNames.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. To'lov usuli bo'yicha */}
              <div className="space-y-1">
                <label className={LABEL_CLS}>To'lov usuli</label>
                <select
                  value={selectedPaymentMethod}
                  onChange={(e) => {
                    setSelectedPaymentMethod(e.target.value);
                    setCurrentPage(1);
                  }}
                  className={INPUT_CLS}
                >
                  <option value="all">Barcha to'lov usullari</option>
                  {PAYMENT_METHODS.map((pm) => (
                    <option key={pm.id} value={pm.id}>
                      {pm.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 5. Sanadan */}
              <div className="space-y-1">
                <label className={LABEL_CLS}>Sanadan</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className={INPUT_CLS}
                />
              </div>

              {/* 6. Sanagacha */}
              <div className="space-y-1">
                <label className={LABEL_CLS}>Sanagacha</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className={INPUT_CLS}
                />
              </div>
            </div>

            {/* Clear filters action */}
            {(searchReason ||
              selectedStaff !== "all" ||
              selectedCategory !== "all" ||
              selectedPaymentMethod !== "all" ||
              startDate ||
              endDate) && (
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1 transition-colors"
                >
                  <RefreshCw size={12} /> Tozalash
                </button>
              </div>
            )}
          </div>

          {/* TABLE CONTAINER */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
            {filteredExpenses.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <AlertCircle size={24} />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Hech qanday xarajat topilmadi.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-semibold">
                      <th className="py-2.5 px-3 w-10 text-center">#</th>
                      <th className="py-2.5 px-3">Sabab</th>
                      <th className="py-2.5 px-3">Xarajat turlari</th>
                      <th className="py-2.5 px-3">Sana</th>
                      <th className="py-2.5 px-3 font-bold text-rose-600 dark:text-rose-400">Narx</th>
                      <th className="py-2.5 px-3">Xodim</th>
                      <th className="py-2.5 px-3">To'lov usuli</th>
                      <th className="py-2.5 px-3 text-right">Amallar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {paginatedExpenses.map((item, idx) => {
                      const itemNumber = (currentPage - 1) * itemsPerPage + idx + 1;
                      return (
                        <tr
                          key={item.id || idx}
                          className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px]">
                            {itemNumber}
                          </td>

                          {/* Sabab */}
                          <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white max-w-[240px]">
                            <div className="truncate" title={item.note}>
                              {item.note || "—"}
                            </div>
                          </td>

                          {/* Xarajat turlari */}
                          <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-medium text-[11px]">
                              {item.category || "Ofis xarajatlari"}
                            </span>
                          </td>

                          {/* Sana */}
                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 font-mono">
                            {item.date || "—"}
                          </td>

                          {/* Narx */}
                          <td className="py-2.5 px-3 font-bold text-rose-600 dark:text-rose-400">
                            {money(item.amount)} so'm
                          </td>

                          {/* Xodim */}
                          <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">
                            {item.resolvedStaffName}
                          </td>

                          {/* To'lov usuli */}
                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-semibold text-[10px]">
                              {item.paymentMethodName}
                            </span>
                          </td>

                          {/* Amallar */}
                          <td className="py-2.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(item)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors"
                                title="Tahrirlash"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingItem(item)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
                                title="O'chirish"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* PAGINATION (Max 20 items per page) */}
            {totalPages > 1 && (
              <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Jami {filteredExpenses.length} tadan{" "}
                  {(currentPage - 1) * itemsPerPage + 1}-
                  {Math.min(currentPage * itemsPerPage, filteredExpenses.length)} ko'rsatilmoqda
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <ChevronLeft size={14} />
                  </button>

                  <span className="font-bold text-slate-800 dark:text-slate-200 px-2">
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ---------------------------------------------------- */}
      {/* 5. MODAL: XARAJAT TURI QO'SHISH / TAHRIRLASH (DRAWER)*/}
      {/* ---------------------------------------------------- */}
      {categoryModalOpen && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[99999] overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
          onClick={() => setCategoryModalOpen(false)}
        >
          <div
            className="w-full max-w-md h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col z-[100000] animate-in slide-in-from-right duration-250 ease-out"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {editingCategory ? "Xarajat turini tahrirlash" : "Xarajat turi qo'shish"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCategoryModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitCategoryForm} className="flex-1 overflow-y-auto p-4 flex flex-col justify-between">
              <div className="space-y-4">
                {/* Nomi */}
                <div className="space-y-1">
                  <label className={LABEL_CLS}>Nomi</label>
                  <input
                    type="text"
                    required
                    value={categoryFormData.name}
                    onChange={(e) =>
                      setCategoryFormData({ ...categoryFormData, name: e.target.value })
                    }
                    placeholder="Xarajat turi nomi..."
                    className={INPUT_CLS}
                  />
                </div>

                {/* Barcha filiallarga qo'shish checkbox */}
                <div className="pt-2">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={categoryFormData.allBranches}
                      onChange={(e) =>
                        setCategoryFormData({
                          ...categoryFormData,
                          allBranches: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300 dark:border-slate-700 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Barcha filiallarga qo'shish
                    </span>
                  </label>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 pt-3 mt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-colors shadow-xs"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ---------------------------------------------------- */}
      {/* 6. MODAL: XARAJAT TURI O'CHIRISH                     */}
      {/* ---------------------------------------------------- */}
      {deletingCategory && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
          onClick={() => setDeletingCategory(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl w-full max-w-sm p-4 shadow-xl space-y-3 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Xarajat turini o'chirish
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Haqiqatan ham ushbu xarajat turini o'chirmoqchimisiz?
            </p>
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1">
              <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Tag size={13} className="text-rose-500" />
                <span>{deletingCategory.name}</span>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingCategory(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteCategory}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors"
              >
                O'chirish
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ---------------------------------------------------- */}
      {/* 7. MODAL: XARAJAT QO'SHISH / TAHRIRLASH (RIGHT DRAWER)*/}
      {/* ---------------------------------------------------- */}
      {modalOpen && typeof document !== "undefined" && createPortal(
        <div 
          className="fixed inset-0 z-[99999] overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-md h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col z-[100000] animate-in slide-in-from-right duration-250 ease-out"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {editingItem ? "Xarajatni tahrirlash" : "Yangi xarajat qo'shish"}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {activeMenu === "fixed" ? "O'zgarmas xarajat" : "O'zgaruvchi xarajat"} ma'lumotlarini kiriting
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Body Form */}
            <form onSubmit={handleSubmitForm} className="flex-1 overflow-y-auto p-4 space-y-3.5 flex flex-col justify-between">
              <div className="space-y-3.5">
                {/* Sabab */}
                <div className="space-y-1">
                  <label className={LABEL_CLS}>Sabab</label>
                  <textarea
                    rows={3}
                    required
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    placeholder="Xarajat sababi yoki nomi..."
                    className={`${INPUT_CLS} resize-none`}
                  />
                </div>

                {/* Bo'lim tanlanadi */}
                <div className="space-y-1">
                  <label className={LABEL_CLS}>Bo'lim</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={INPUT_CLS}
                  >
                    {categoryNames.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Narx */}
                <div className="space-y-1">
                  <label className={LABEL_CLS}>Narx</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      required
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="Summa (so'm)..."
                      className={`${INPUT_CLS} pr-14 font-bold`}
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium pointer-events-none">
                      so'm
                    </span>
                  </div>
                </div>

                {/* To'lov usuli */}
                <div className="space-y-1">
                  <label className={LABEL_CLS}>To'lov usuli</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className={INPUT_CLS}
                  >
                    {PAYMENT_METHODS.map((pm) => (
                      <option key={pm.id} value={pm.id}>
                        {pm.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sana */}
                <div className="space-y-1">
                  <label className={LABEL_CLS}>Sana</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className={INPUT_CLS}
                  />
                </div>

                {/* Xodim */}
                <div className="space-y-1">
                  <label className={LABEL_CLS}>Xodim</label>
                  <select
                    value={formData.staffName}
                    onChange={(e) => {
                      const chosen = staffList.find((s) => s.name === e.target.value);
                      setFormData({
                        ...formData,
                        staffName: e.target.value,
                        staffId: chosen?.id || "",
                      });
                    }}
                    className={INPUT_CLS}
                  >
                    {staffList.map((s) => (
                      <option key={s.id || s.name} value={s.name}>
                        {s.name} ({s.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-2 pt-3 mt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-lg bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white text-xs font-bold transition-colors shadow-xs"
                >
                  {isSubmitting ? "Saqlanmoqda..." : "Saqlash"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ---------------------------------------------------- */}
      {/* 8. MODAL: O'CHIRISHNI TASDIQLASH                     */}
      {/* ---------------------------------------------------- */}
      {deletingItem && typeof document !== "undefined" && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
          onClick={() => setDeletingItem(null)}
        >
          <div 
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl w-full max-w-sm p-4 shadow-xl space-y-3 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Xarajatni o'chirish
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Haqiqatan ham ushbu xarajatni o'chirmoqchimisiz?
            </p>
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1">
              <div className="font-semibold text-slate-800 dark:text-slate-200">
                {deletingItem.note}
              </div>
              <div className="text-rose-600 dark:text-rose-400 font-bold">
                {money(deletingItem.amount)} so'm
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmDelete}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold transition-colors"
              >
                {isSubmitting ? "O'chirilmoqda..." : "O'chirish"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ---------------------------------------------------- */}
      {/* 9. DRAWER: REJA QO'SHISH / TAHRIRLASH (RIGHT VIEWPORT) */}
      {/* ---------------------------------------------------- */}
      {planModalOpen && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex justify-end bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setPlanModalOpen(false)}
        >
          <div
            className="w-full max-w-md h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col z-[100000] animate-in slide-in-from-right duration-250 ease-out"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {editingPlan ? "Rejani tahrirlash" : "Yangi reja qo'shish"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPlanModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmitPlanForm}
              className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Bo'lim tanlanadi */}
                <div className="space-y-1">
                  <label className={LABEL_CLS}>Bo'lim</label>
                  <select
                    value={planFormData.category}
                    onChange={(e) =>
                      setPlanFormData({ ...planFormData, category: e.target.value })
                    }
                    className={INPUT_CLS}
                    required
                  >
                    {categoryNames.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Limit narxi */}
                <div className="space-y-1">
                  <label className={LABEL_CLS}>Limit summasi</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      required
                      value={planFormData.amount}
                      onChange={(e) =>
                        setPlanFormData({ ...planFormData, amount: e.target.value })
                      }
                      placeholder="0"
                      className={`${INPUT_CLS} pr-14 font-bold`}
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium pointer-events-none">
                      so'm
                    </span>
                  </div>
                </div>

                {/* To'lov usuli: Agar tanlanmasa default "barchasi" selected bo'ladi */}
                <div className="space-y-1">
                  <label className={LABEL_CLS}>To'lov usuli</label>
                  <select
                    value={planFormData.paymentMethod}
                    onChange={(e) =>
                      setPlanFormData({
                        ...planFormData,
                        paymentMethod: e.target.value || "all",
                      })
                    }
                    className={INPUT_CLS}
                  >
                    <option value="all">Barchasi</option>
                    {PAYMENT_METHODS.map((pm) => (
                      <option key={pm.id} value={pm.id}>
                        {pm.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Qaysi oy uchunligi */}
                <div className="space-y-1">
                  <label className={LABEL_CLS}>Oy</label>
                  <input
                    type="month"
                    required
                    value={planFormData.month}
                    onChange={(e) =>
                      setPlanFormData({ ...planFormData, month: e.target.value })
                    }
                    className={INPUT_CLS}
                  />
                </div>

                {/* Xodim */}
                <div className="space-y-1">
                  <label className={LABEL_CLS}>Xodim</label>
                  <select
                    value={planFormData.staffId}
                    onChange={(e) => {
                      const sid = e.target.value;
                      const chosen = staffList.find((s) => String(s.id) === String(sid));
                      setPlanFormData({
                        ...planFormData,
                        staffId: sid,
                        staffName: sid === "all" ? "Barcha xodimlar" : chosen?.name || "Xodim",
                      });
                    }}
                    className={INPUT_CLS}
                  >
                    <option value="all">Barcha xodimlar</option>
                    {staffList.map((s) => (
                      <option key={s.id || s.name} value={s.id}>
                        {s.name} ({s.role})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Izoh */}
                <div className="space-y-1">
                  <label className={LABEL_CLS}>Izoh</label>
                  <input
                    type="text"
                    value={planFormData.note}
                    onChange={(e) =>
                      setPlanFormData({ ...planFormData, note: e.target.value })
                    }
                    placeholder="Qo'shimcha izoh..."
                    className={INPUT_CLS}
                  />
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-2 pt-3 mt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setPlanModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPlan}
                  className="px-5 py-2.5 rounded-lg bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white text-xs font-bold transition-colors shadow-xs"
                >
                  {isSubmittingPlan ? "Saqlanmoqda..." : "Saqlash"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ---------------------------------------------------- */}
      {/* 10. MODAL: REJANI O'CHIRISHNI TASDIQLASH             */}
      {/* ---------------------------------------------------- */}
      {deletingPlan && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
          onClick={() => setDeletingPlan(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl w-full max-w-sm p-4 shadow-xl space-y-3 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Rejani o'chirish
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Haqiqatan ham ushbu xarajat rejasini o'chirmoqchimisiz?
            </p>
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1">
              <div className="font-semibold text-slate-800 dark:text-slate-200">
                {deletingPlan.category} ({deletingPlan.month})
              </div>
              <div className="text-rose-600 dark:text-rose-400 font-bold">
                {money(deletingPlan.amount)} so'm
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingPlan(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={handleConfirmDeletePlan}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors"
              >
                O'chirish
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

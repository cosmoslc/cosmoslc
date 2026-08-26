import { useState, useMemo } from "react";
import {
  BarChart3,
  TrendingUp,
  Wallet,
  CheckCircle2,
  ShieldCheck,
  UserCircle2,
  Archive,
  Bot,
  ArrowUpRight,
  Briefcase,
} from "lucide-react";
import { GLASS, INPUT_CLS, BTN_GHOST, PrimaryButton } from "../theme/tokens";
import { money } from "../utils/helpers";
export { AnalyticsPage } from "./AnalyticsPage";
export { BranchAnalyticsPage } from "./BranchAnalyticsPage";
export { ExpensesPage } from "./ExpensesPage";

export function ApprovalsPage({ directorData, onApprove, onReject }) {
  const pending = (directorData?.finance || []).filter(
    (f) => f.status === "pending",
  );

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-bold text-slate-900">
          Approvals
        </h2>
        <p className="text-slate-500 text-sm mt-0.5">
          Tasdiqlash kutilayotgan yozuvlar
        </p>
      </div>

      <div className="space-y-3">
        {pending.length === 0 ? (
          <div
            className={`${GLASS} rounded-xl p-8 text-sm text-slate-400 text-center`}
          >
            Tasdiqlash uchun yozuvlar yo'q
          </div>
        ) : (
          pending.map((item) => (
            <div
              key={item.id}
              className={`${GLASS} rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3`}
            >
              <div>
                <p className="font-medium text-slate-900">
                  {item.category || "Xarajat"}
                </p>
                <p className="text-xs text-slate-500">
                  {item.date} · {item.note || "Izoh yo'q"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">
                  {money(item.amount)}
                </span>
                <button
                  onClick={() => onApprove(item.id)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 text-white text-xs"
                >
                  Approve
                </button>
                <button
                  onClick={() => onReject(item.id)}
                  className="px-3 py-1.5 rounded-xl bg-rose-500 text-white text-xs"
                >
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export { ArchivePage } from "./ArchivePage";

export function SecurityPage({
  user,
  director,
  updateDirector,
  directorData,
  onRefresh,
}) {
  const currentUser = user || director || {};
  const is2FA = !!currentUser?.twoFactorEnabled;
  const [enabled, setEnabled] = useState(is2FA);

  const toggle2FA = () => {
    setEnabled(!enabled);
    if (updateDirector) {
      updateDirector({ ...currentUser, twoFactorEnabled: !enabled });
    }
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">
          Security
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
          Xavfsizlik va kirish parametrlarini boshqarish
        </p>
      </div>

      <div className={`${GLASS} rounded-xl p-5 space-y-4`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-slate-900 dark:text-slate-100">
              Two-factor authentication
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Kirish vaqtida qo'shimcha kod
            </p>
          </div>
          <button
            onClick={toggle2FA}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold ${enabled ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"}`}
          >
            {enabled ? "Enabled" : "Disabled"}
          </button>
        </div>

        <div className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3">
          <ShieldCheck size={18} className="text-emerald-600" />
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Bu bo'limda xavfsizlik sozlamalari va login monitoring bo'ladi.
          </p>
        </div>
      </div>
    </div>
  );
}

export function ProfilePage({
  user,
  director,
  updateDirector,
  onSaveProfile,
}) {
  const currentUser = user || director || {};
  const [profileName, setProfileName] = useState(
    currentUser?.name || "Administrator",
  );
  const [centerName, setCenterName] = useState(
    currentUser?.centerName || "COSMOS LC",
  );

  const handleSave = () => {
    if (onSaveProfile) {
      onSaveProfile({ ...currentUser, name: profileName, centerName });
    } else if (updateDirector) {
      updateDirector({ ...currentUser, name: profileName, centerName });
    }
    alert("Profil ma'lumotlari muvaffaqiyatli saqlandi!");
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">
          Profile
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
          Shaxsiy ma'lumotlar va profil
        </p>
      </div>

      <div className={`${GLASS} rounded-xl p-5 space-y-4`}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-lg font-bold">
            {profileName.slice(0, 2).toUpperCase() || "AD"}
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-slate-100">
              {profileName}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {centerName}
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="block text-sm text-slate-500 dark:text-slate-400">
            Name
            <input
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className={`${INPUT_CLS} mt-1`}
            />
          </label>
          <label className="block text-sm text-slate-500 dark:text-slate-400">
            Center name
            <input
              value={centerName}
              onChange={(e) => setCenterName(e.target.value)}
              className={`${INPUT_CLS} mt-1`}
            />
          </label>
        </div>

        <div className="flex justify-end">
          <PrimaryButton onClick={handleSave}>Save profile</PrimaryButton>
        </div>
      </div>
    </div>
  );
}

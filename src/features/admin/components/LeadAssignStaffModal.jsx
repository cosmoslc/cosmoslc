import React, { useState } from "react";
import {
  UserCheck,
  Users,
  CheckCircle2,
  AlertTriangle,
  X,
  UserPlus,
} from "lucide-react";
import { Modal } from "./primitives";

export function LeadAssignStaffModal({
  isOpen,
  onClose,
  leads = [],
  allLeads = [],
  staffMembers = [],
  onAssign,
  onAssignStaff,
  lead = null,
  selectedLead = null,
}) {
  const effectiveLead = lead || selectedLead;
  const effectiveLeads = leads.length > 0 ? leads : allLeads;
  const effectiveOnAssign = onAssign || onAssignStaff;

  const [selectedStaffId, setSelectedStaffId] = useState(
    effectiveLead?.assignedStaffId || staffMembers[0]?.id || ""
  );
  const [scope, setScope] = useState(effectiveLead ? "single" : "all");
  const [selectedColumnId, setSelectedColumnId] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const handleAssign = (e) => {
    e.preventDefault();
    if (!selectedStaffId) return;

    const staffObj = staffMembers.find((s) => s.id === selectedStaffId);
    const staffName = staffObj?.name || "Xodim";

    if (effectiveOnAssign) {
      if (effectiveLead && scope === "single") {
        effectiveOnAssign([effectiveLead.id], selectedStaffId, staffName);
      } else {
        const targetIds = effectiveLeads
          .filter((l) => l.status !== "rejected" && l.status !== "lost")
          .map((l) => l.id);
        effectiveOnAssign(targetIds, selectedStaffId, staffName);
      }
    }

    setSuccessMsg(`Mas'ul xodim (${staffName}) muvaffaqiyatli biriktirildi!`);
    setTimeout(() => {
      setSuccessMsg("");
      onClose();
    }, 1200);
  };

  return (
    <Modal
      title="Mas'ul Xodim Biriktirish"
      onClose={onClose}
      position="center"
    >
      <div className="space-y-4">
        {successMsg ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 size={24} />
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              {successMsg}
            </h4>
          </div>
        ) : (
          <form onSubmit={handleAssign} className="space-y-4">
            {selectedLead && (
              <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 block mb-1">
                  Tanlangan lid:
                </span>
                <p className="font-bold text-xs text-slate-900 dark:text-white">
                  {selectedLead.name} ({selectedLead.phone})
                </p>
              </div>
            )}

            {!selectedLead && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Qamrov doirasi:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setScope("all")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      scope === "all"
                        ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-xs"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    Barcha faol lidlar
                  </button>
                  <button
                    type="button"
                    onClick={() => setScope("unassigned")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      scope === "unassigned"
                        ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-xs"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    Mas'ulsiz lidlar
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Mas'ul xodimni tanlang:
              </label>
              {staffMembers.length === 0 ? (
                <div className="p-3 text-center text-xs text-slate-400 border border-dashed rounded-xl">
                  Xodimlar ro'yxati topilmadi
                </div>
              ) : (
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {staffMembers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.role || "Menejer / Xodim"})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl cursor-pointer"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                disabled={staffMembers.length === 0}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Tayinlash
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}

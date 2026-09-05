import { useState, useMemo } from "react";
import { Check, ShieldCheck, CheckSquare, Square } from "lucide-react";
import { Modal } from "../components/primitives";
import { PrimaryButton } from "../theme/tokens";
import { PERMISSION_CATEGORIES } from "../pages/PositionsPage";
import { getPagesFromPermissions, getStoredRoles } from "../utils/permissionHelpers";

export function ManagerPermissionsModal({ manager, onSave, onClose }) {
  // Inherit roles and initial permissions
  const initialPerms = useMemo(() => {
    const direct = manager.permissions || manager.allowedPages || [];
    const roles = getStoredRoles();
    const userRoleIds = manager.roleIds || (manager.roleId ? [manager.roleId] : []);
    const matchingRoles = roles.filter((r) => userRoleIds.includes(r.id));
    const rolePerms = matchingRoles.flatMap((r) => r.permissions || []);
    return Array.from(new Set([...rolePerms, ...direct]));
  }, [manager]);

  const [selectedPerms, setSelectedPerms] = useState(initialPerms);

  function toggle(id) {
    setSelectedPerms((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleCategory(category) {
    const catPermIds = category.permissions.map((p) => p.id);
    const allSelected = catPermIds.every((id) => selectedPerms.includes(id));
    if (allSelected) {
      setSelectedPerms((prev) => prev.filter((id) => !catPermIds.includes(id)));
    } else {
      setSelectedPerms((prev) => Array.from(new Set([...prev, ...catPermIds])));
    }
  }

  const handleSave = () => {
    const mappedPages = getPagesFromPermissions(selectedPerms);
    const finalAllowed = Array.from(new Set([...selectedPerms, ...mappedPages]));
    onSave(finalAllowed);
    onClose();
  };

  return (
    <Modal title={`${manager.name} — Ruxsatlar`} onClose={onClose} wide>
      <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Tanlangan ruxsatlar: {selectedPerms.length} ta
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const all = PERMISSION_CATEGORIES.flatMap((c) => c.permissions.map((p) => p.id));
                setSelectedPerms(all);
              }}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
            >
              Barchasini belgilash
            </button>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <button
              type="button"
              onClick={() => setSelectedPerms([])}
              className="text-xs text-slate-500 hover:underline font-medium cursor-pointer"
            >
              Tozalash
            </button>
          </div>
        </div>

        {/* Categories list - Flattened UI, no nested cards */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {PERMISSION_CATEGORIES.map((category) => {
            const catPermIds = category.permissions.map((p) => p.id);
            const selectedCount = catPermIds.filter((id) => selectedPerms.includes(id)).length;
            const isAll = selectedCount === catPermIds.length;
            const Icon = category.icon;

            return (
              <div key={category.id} className="py-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {Icon && <Icon size={16} className={category.color} />}
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {category.title}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {selectedCount}/{catPermIds.length}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleCategory(category)}
                    className="text-xs text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                  >
                    {isAll ? "Bekor qilish" : "Hammasi"}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-2">
                  {category.permissions.map((perm) => {
                    const checked = selectedPerms.includes(perm.id);
                    return (
                      <label
                        key={perm.id}
                        className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none hover:text-slate-900 dark:hover:text-white"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggle(perm.id)}
                          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                        />
                        <span className="truncate">{perm.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
          >
            Bekor qilish
          </button>
          <PrimaryButton onClick={handleSave}>
            <Check size={15} /> Saqlash
          </PrimaryButton>
        </div>
      </div>
    </Modal>
  );
}

import { useState } from "react";
import { Check } from "lucide-react";
import { Modal } from "../components/primitives";
import { PrimaryButton } from "../theme/tokens";
import { MANAGER_NAV_ALL } from "../utils/constants";

export function ManagerPermissionsModal({ manager, onSave, onClose }) {
  const [allowed, setAllowed] = useState(
    manager.allowedPages || MANAGER_NAV_ALL.map((p) => p.id),
  );
  function toggle(id) {
    setAllowed((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }
  return (
    <Modal title={`${manager.name} — ruxsatlar`} onClose={onClose}>
      <div className="space-y-2">
        <p className="text-slate-500 text-xs mb-2">
          Bu menejer qaysi sahifalarga kira olishini belgilang.
        </p>
        {MANAGER_NAV_ALL.map((p) => (
          <label
            key={p.id}
            className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={allowed.includes(p.id)}
              onChange={() => toggle(p.id)}
              className="w-4 h-4 accent-blue-500"
            />
            <p.icon size={16} className="text-slate-500" />
            <span className="text-slate-900 text-sm flex-1">{p.label}</span>
          </label>
        ))}
        <PrimaryButton
          onClick={() => {
            onSave(allowed);
            onClose();
          }}
          className="w-full mt-2"
        >
          <Check size={15} /> Saqlash
        </PrimaryButton>
      </div>
    </Modal>
  );
}

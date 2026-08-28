import { useState } from "react";
import { DoorOpen, Users, CheckCircle2, Plus } from "lucide-react";
import { INPUT_CLS, LABEL_CLS, PrimaryButton } from "../theme/tokens";
import { Modal } from "../components/primitives";

const QUICK_CAPACITIES = [12, 15, 20, 25, 30, 40];

export function RoomFormModal({ editing, branches = [], defaultBranchId, onSubmit, onClose }) {
  const [branchId, setBranchId] = useState(
    editing?.branchId || (defaultBranchId && defaultBranchId !== "all" ? defaultBranchId : "") || branches[0]?.id || "",
  );
  const [name, setName] = useState(editing?.name || "");
  const [capacity, setCapacity] = useState(editing?.capacity ?? "20");
  const [error, setError] = useState("");

  function submit() {
    if (!name.trim()) {
      setError("Xona nomi yoki raqamini kiriting.");
      return;
    }
    const capNum = parseInt(capacity, 10);
    if (isNaN(capNum) || capNum <= 0) {
      setError("Xona sig'imini to'g'ri kiriting (kamida 1 ta o'rin).");
      return;
    }
    onSubmit({
      ...editing,
      name: name.trim(),
      capacity: capNum,
      branchId: branchId || null,
    });
    onClose();
  }

  return (
    <Modal
      title={editing ? "Xonani tahrirlash" : "Yangi xona qo'shish"}
      onClose={onClose}
    >
      <div className="space-y-4 text-slate-800 dark:text-slate-200">
        {branches.length > 0 && (
          <div>
            <label className={`${LABEL_CLS} flex items-center gap-1.5`}>
              Filial
            </label>
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className={INPUT_CLS}
            >
              <option value="">Filialni tanlang</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className={`${LABEL_CLS} flex items-center gap-1.5`}>
            <DoorOpen size={14} className="text-orange-500" />
            Xona nomi yoki raqami *
          </label>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError("");
            }}
            className={INPUT_CLS}
            placeholder="Masalan: 104-xona yoki IT Lab"
            autoFocus
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className={`${LABEL_CLS} flex items-center gap-1.5 !mb-0`}>
              <Users size={14} className="text-emerald-500" />
              Xona sig'imi (o'rin soni) *
            </label>
            <span className="text-[11px] text-slate-400 font-medium">
              o'quvchi o'rni
            </span>
          </div>
          <input
            type="number"
            min="1"
            max="200"
            value={capacity}
            onChange={(e) => {
              setCapacity(e.target.value);
              if (error) setError("");
            }}
            className={INPUT_CLS}
            placeholder="Masalan: 20"
          />

          {/* Quick capacity buttons */}
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <span className="text-[11px] text-slate-400 font-medium mr-1">
              Tezkor:
            </span>
            {QUICK_CAPACITIES.map((cap) => (
              <button
                key={cap}
                type="button"
                onClick={() => setCapacity(String(cap))}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  String(capacity) === String(cap)
                    ? "bg-orange-500 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {cap} o'rin
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}

        <div className="pt-2">
          <PrimaryButton onClick={submit} className="w-full py-2.5">
            {editing ? (
              <>
                <CheckCircle2 size={16} /> Saqlash
              </>
            ) : (
              <>
                <Plus size={16} /> Xonani qo'shish
              </>
            )}
          </PrimaryButton>
        </div>
      </div>
    </Modal>
  );
}

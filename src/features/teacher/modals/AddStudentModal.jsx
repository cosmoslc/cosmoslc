import { useState } from "react";
import { Loader2, UserPlus } from "lucide-react";
import {
  Modal,
  PhoneInput,
  Avatar,
} from "../../../shared/components/primitives";
import {
  INPUT_CLS,
  LABEL_CLS,
  BTN_PRIMARY,
} from "../../../shared/theme/tokens";
import { getStudentGroups } from "../utils/dataHelpers";
import { hashPassword, normalizePhone } from "../utils/helpers";

export function AddStudentModal({
  groupId,
  appData,
  onAddNew,
  onLinkExisting,
  onClose,
}) {
  const group = appData.groups.find((g) => g.id === groupId);
  const [mode, setMode] = useState("new");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");

  const gIdStr = String(groupId);
  const candidates = (appData?.students || []).filter(
    (s) =>
      !(s.groupIds || []).some((id) => String(id) === gIdStr) &&
      (s.name || "").toLowerCase().includes(search.toLowerCase()),
  );

  async function submitNew() {
    if (!name.trim()) {
      setError("O'quvchi ismini kiriting.");
      return;
    }
    if (!phone.trim()) {
      setError("Telefon raqamini kiriting.");
      return;
    }
    if (!password || password.length < 4) {
      setError("Parol kamida 4 belgidan iborat bo'lsin.");
      return;
    }
    const normalized = normalizePhone(phone);
    if (appData.students.some((s) => normalizePhone(s.phone) === normalized)) {
      setError(
        "Bu telefon raqamli o'quvchi allaqachon mavjud — 'Mavjudlardan' bo'limidan foydalaning.",
      );
      return;
    }
    setBusy(true);
    const passwordHash = await hashPassword(password);
    setBusy(false);
    onAddNew({
      name: name.trim(),
      phone,
      birthDate,
      parentName: parentName.trim(),
      parentPhone,
      passwordHash,
      groupIds: [groupId],
      coins: 0,
    });
    onClose();
  }

  return (
    <Modal
      title={`O'quvchi qo'shish${group ? " — " + group.name : ""}`}
      onClose={onClose}
    >
      <div className="flex gap-2 mb-4 bg-slate-50 border border-slate-200 rounded-xl p-1">
        <button
          onClick={() => setMode("new")}
          className={`flex-1 text-sm py-2.5 rounded-xl transition-all ${mode === "new" ? "bg-slate-100 text-slate-900" : "text-slate-500"}`}
        >
          Yangi o'quvchi
        </button>
        <button
          onClick={() => setMode("existing")}
          className={`flex-1 text-sm py-2.5 rounded-xl transition-all ${mode === "existing" ? "bg-slate-100 text-slate-900" : "text-slate-500"}`}
        >
          Mavjudlardan
        </button>
      </div>

      {mode === "new" ? (
        <div className="space-y-4">
          <div>
            <label className={LABEL_CLS}>O'quvchi to'liq ismi</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masalan: Aziz Karimov"
              className={INPUT_CLS}
              autoFocus
            />
          </div>
          <div>
            <label className={LABEL_CLS}>Telefon raqam</label>
            <PhoneInput value={phone} onChange={setPhone} />
          </div>
          <div>
            <label className={LABEL_CLS}>Tug'ilgan sana</label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className={INPUT_CLS}
            />
          </div>
          <div>
            <label className={LABEL_CLS}>
              Parol (o'quvchi shu bilan tizimga kiradi)
            </label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Kamida 4 belgi"
              className={INPUT_CLS}
            />
          </div>
          <div>
            <label className={LABEL_CLS}>Ota-onaning ismi</label>
            <input
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              placeholder="Masalan: Karim Karimov"
              className={INPUT_CLS}
            />
          </div>
          <div>
            <label className={LABEL_CLS}>Ota-ona telefon raqami</label>
            <PhoneInput value={parentPhone} onChange={setParentPhone} />
          </div>
          {error && <p className="text-rose-700 text-xs">{error}</p>}
          <button
            onClick={submitNew}
            disabled={busy}
            className={`${BTN_PRIMARY} w-full`}
          >
            {busy ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <UserPlus size={16} />
            )}{" "}
            Qo'shish
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ism bo'yicha qidirish..."
            className={INPUT_CLS}
            autoFocus
          />
          {candidates.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-4">
              {appData.students.length === 0
                ? "Hali boshqa o'quvchi yo'q."
                : "Mos o'quvchi topilmadi."}
            </p>
          ) : (
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {candidates.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    onLinkExisting(s.id, groupId);
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl p-2.5 transition-colors text-left"
                >
                  <Avatar name={s.name} size={32} />
                  <div className="min-w-0 flex-1">
                    <p className="text-slate-900 text-sm truncate">{s.name}</p>
                    <p className="text-slate-400 text-xs truncate">
                      {getStudentGroups(appData, s.id)
                        .map((g) => g.name)
                        .join(", ") || "Guruhsiz"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

import { useState } from "react";
import { Eye, EyeOff, Lock, Phone } from "lucide-react";
import {
  BTN_GHOST,
  BTN_PRIMARY,
  GLASS,
  INPUT_CLS,
  LABEL_CLS,
} from "../../../shared/theme/tokens";
import { displayPhone, hashPassword } from "../utils/helpers";
import { getStudentGroups } from "../utils/dataHelpers";
import { Avatar, ProfileCategory } from "../../../shared/components/primitives";

export function StudentProfile({ appData, student, updateStudent }) {
  const myGroups = getStudentGroups(appData, student.id);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);

  async function changePassword() {
    setError("");
    setSuccess("");
    if (!currentPw || !newPw || !confirmPw) {
      setError("Barcha maydonlarni to'ldiring.");
      return;
    }
    setBusy(true);
    const hash = await hashPassword(currentPw);
    if (hash !== student.passwordHash) {
      setBusy(false);
      setError("Joriy parol noto'g'ri.");
      return;
    }
    if (newPw !== confirmPw) {
      setBusy(false);
      setError("Yangi parollar mos emas.");
      return;
    }
    if (newPw.length < 4) {
      setBusy(false);
      setError("Parol kamida 4 belgidan iborat bo'lsin.");
      return;
    }
    const newHash = await hashPassword(newPw);
    updateStudent(student.id, { passwordHash: newHash });
    setBusy(false);
    setSuccess("Parol yangilandi.");
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
  }

  return (
    <div className="space-y-5 max-w-xl">
      <div>
        <h2 className="font-display text-2xl font-bold text-slate-900">
          Profil
        </h2>
      </div>

      <div className={`${GLASS} rounded-xl p-6 flex items-center gap-4`}>
        <Avatar name={student.name} color={myGroups[0]?.color} size={72} />
        <div className="min-w-0">
          <p className="font-display text-slate-900 text-lg font-bold truncate">
            {student.name}
          </p>
          <p className="text-slate-500 text-sm truncate">
            {myGroups.map((g) => g.name).join(", ")}
          </p>
          <p className="text-slate-400 text-xs mt-1 flex items-center gap-1">
            <Phone size={11} /> {displayPhone(student.phone)}
          </p>
          <p className="text-amber-700 text-sm mt-1">{student.coins || 0} 🪙</p>
        </div>
      </div>

      <div className="space-y-3">
        <ProfileCategory icon={Lock} title="Parolni o'zgartirish">
          <div>
            <label className={LABEL_CLS}>Joriy parol</label>
            <input
              type={showPw ? "text" : "password"}
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              className={INPUT_CLS}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLS}>Yangi parol</label>
              <input
                type={showPw ? "text" : "password"}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                className={INPUT_CLS}
              />
            </div>
            <div>
              <label className={LABEL_CLS}>Yangi parolni takrorlang</label>
              <input
                type={showPw ? "text" : "password"}
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                className={INPUT_CLS}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className={BTN_GHOST}
          >
            {showPw ? <EyeOff size={14} /> : <Eye size={14} />} Parolni{" "}
            {showPw ? "yashirish" : "ko'rsatish"}
          </button>
          {error && <p className="text-rose-700 text-xs">{error}</p>}
          {success && <p className="text-emerald-700 text-xs">{success}</p>}
          <button
            onClick={changePassword}
            disabled={busy}
            className={BTN_PRIMARY}
          >
            Parolni saqlash
          </button>
        </ProfileCategory>
      </div>
    </div>
  );
}

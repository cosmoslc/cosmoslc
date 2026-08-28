import { useState, useEffect } from "react";
import { Pencil, Camera, Lock, Eye, EyeOff, Check, Phone } from "lucide-react";
import {
  GLASS,
  INPUT_CLS,
  LABEL_CLS,
  BTN_GHOST,
  BTN_PRIMARY,
} from "../../../shared/theme/tokens";
import {
  Avatar,
  PhoneInput,
  ProfileCategory,
} from "../../../shared/components/primitives";
import { hashPassword, displayPhone } from "../utils/helpers";
import { readFileAsDataURL, compressImageDataUrl } from "../../../shared/utils/media";
import { GROUP_COLORS } from "../utils/constants";

export function ProfileView({ teacher, updateTeacher, openModal }) {
  const [form, setForm] = useState({
    name: teacher.name,
    subject: teacher.subject,
    color: teacher.color,
    photo: teacher.photo,
    phone: teacher.phone,
  });
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  useEffect(() => {
    setForm({
      name: teacher.name,
      subject: teacher.subject,
      color: teacher.color,
      photo: teacher.photo,
      phone: teacher.phone,
    });
  }, [teacher]);

  async function handlePhoto(e) {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const raw = await readFileAsDataURL(file);
      const compressed = await compressImageDataUrl(raw, 300, 0.75);
      setForm((f) => ({ ...f, photo: compressed }));
    } catch (err) {
      console.error(err);
    }
  }

  function saveProfile() {
    updateTeacher({ ...teacher, ...form });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function changePassword() {
    setPwError("");
    setPwSuccess("");
    if (!currentPw || !newPw || !confirmPw) {
      setPwError("Barcha maydonlarni to'ldiring.");
      return;
    }
    const hash = await hashPassword(currentPw);
    if (hash !== teacher.passwordHash) {
      setPwError("Joriy parol noto'g'ri.");
      return;
    }
    if (newPw !== confirmPw) {
      setPwError("Yangi parollar mos emas.");
      return;
    }
    if (newPw.length < 4) {
      setPwError("Parol kamida 4 belgidan iborat bo'lsin.");
      return;
    }
    const newHash = await hashPassword(newPw);
    updateTeacher({ ...teacher, passwordHash: newHash });
    setPwSuccess("Parol yangilandi.");
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
        <Avatar
          name={teacher.name}
          color={teacher.color}
          photo={teacher.photo}
          size={72}
        />
        <div className="min-w-0">
          <p className="font-display text-slate-900 text-lg font-bold truncate">
            {teacher.name}
          </p>
          <p className="text-slate-500 text-sm truncate">{teacher.subject}</p>
          <p className="text-slate-400 text-xs mt-1 flex items-center gap-1">
            <Phone size={11} /> {displayPhone(teacher.phone)}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <ProfileCategory icon={Pencil} title="Profilni tahrirlash">
          <div className="flex items-center gap-4">
            <Avatar
              name={form.name}
              color={form.color}
              photo={form.photo}
              size={56}
            />
            <label className={`${BTN_GHOST} cursor-pointer inline-flex`}>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhoto}
              />
              <Camera size={14} /> Rasm yuklash
            </label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLS}>Ism</label>
              <input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                className={INPUT_CLS}
              />
            </div>
            <div>
              <label className={LABEL_CLS}>Fan</label>
              <input
                value={form.subject}
                onChange={(e) =>
                  setForm((f) => ({ ...f, subject: e.target.value }))
                }
                className={INPUT_CLS}
              />
            </div>
          </div>
          <div>
            <label className={LABEL_CLS}>Telefon raqam</label>
            <PhoneInput
              value={form.phone}
              onChange={(p) => setForm((f) => ({ ...f, phone: p }))}
            />
          </div>
          <div>
            <label className={LABEL_CLS}>Rang</label>
            <div className="flex gap-2 flex-wrap">
              {GROUP_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setForm((f) => ({ ...f, color: c }))}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${form.color === c ? "border-slate-900 scale-110" : "border-slate-200"}`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>
          <button onClick={saveProfile} className={BTN_PRIMARY}>
            {saved ? (
              <>
                <Check size={15} /> Saqlandi
              </>
            ) : (
              "Saqlash"
            )}
          </button>
        </ProfileCategory>

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
          {pwError && <p className="text-rose-700 text-xs">{pwError}</p>}
          {pwSuccess && <p className="text-emerald-700 text-xs">{pwSuccess}</p>}
          <button onClick={changePassword} className={BTN_PRIMARY}>
            Parolni saqlash
          </button>
        </ProfileCategory>

        <ProfileCategory title="🪙 Coin tizimi sozlamalari">
          <p className="text-slate-500 text-xs">
            Har bir yulduz bahoga nechta coin berilishini belgilang.
          </p>
          <button
            onClick={() => openModal({ type: "coinSettings" })}
            className={BTN_PRIMARY}
          >
            Sozlamalarni ochish
          </button>
        </ProfileCategory>
      </div>
    </div>
  );
}

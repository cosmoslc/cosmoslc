import { useState } from "react";
import { Icon } from "../components/Icon";
import { Modal, PhoneInput } from "../components/primitives";
import { INPUT_CLS, LABEL_CLS, PrimaryButton } from "../theme/tokens";
import { opGroups } from "../utils/dataHelpers";
import { hashPassword, normalizePhone } from "../utils/helpers";
import { SearchableGroupSelect } from "../../../shared/components/SearchableGroupSelect";

export function AddStudentModal({
  full,
  scopeBranches = [],
  branches = [],
  defaultBranchId,
  directorData = { courses: [] },
  opData = {},
  groups: propGroups,
  initialLead = null,
  editing = null,
  onAdd,
  onSave,
  onSubmit,
  onClose,
}) {
  const allBranchesList = branches.length > 0 ? branches : scopeBranches;
  const safeScopeBranches = (defaultBranchId && defaultBranchId !== "all")
    ? allBranchesList.filter((b) => String(b.id) === String(defaultBranchId))
    : (scopeBranches.length > 0 ? scopeBranches : branches);
  const safeDirectorData = directorData || { courses: [] };
  const safeCourses = safeDirectorData.courses || [];
  const branchIds = safeScopeBranches.map((b) => b.id);
  const courses = safeCourses.filter((c) =>
    branchIds.length === 0 || branchIds.includes(c.branchId),
  );
  const courseIds = courses.map((c) => c.id);
  const allOpGroups = propGroups || opGroups(opData || {});
  const groups =
    courseIds.length > 0
      ? allOpGroups.filter((g) => courseIds.includes(g.courseId))
      : allOpGroups;

  const targetEditing = editing || null;
  const targetLead = initialLead || null;

  // Initial State from editing, lead, or defaults
  const [name, setName] = useState(targetEditing?.name || targetLead?.name || "");
  const [phone, setPhone] = useState(targetEditing?.phone || targetLead?.phone || "");
  const [password, setPassword] = useState("");
  const [birthDate, setBirthDate] = useState(targetEditing?.birthDate || "");
  const [gender, setGender] = useState(targetEditing?.gender || "");
  const [schoolNumber, setSchoolNumber] = useState(targetEditing?.schoolNumber || "");
  const [grade, setGrade] = useState(targetEditing?.grade || "");
  const [streetAddress, setStreetAddress] = useState(targetEditing?.streetAddress || "");
  const [parentName, setParentName] = useState(targetEditing?.parentName || "");
  const [parentPhone, setParentPhone] = useState(targetEditing?.parentPhone || "");
  const [statusNote, setStatusNote] = useState(
    targetEditing?.statusNote || targetEditing?.note || targetLead?.notes || ""
  );
  const [groupId, setGroupId] = useState(targetEditing?.groupIds?.[0] || groups[0]?.id || "");
  const [joinedAt, setJoinedAt] = useState(
    targetEditing?.joinedAt || targetEditing?.createdAt?.slice(0, 10) || new Date().toISOString().slice(0, 10),
  );

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const saveCallback = onAdd || onSave || onSubmit;

  async function submit() {
    setError("");
    if (!name.trim()) {
      setError("O'quvchi ism va familiyasini kiriting.");
      return;
    }
    if (!phone.trim()) {
      setError("Telefon raqamini kiriting.");
      return;
    }
    if (password && password.length < 4) {
      setError("Parol kamida 4 belgidan iborat bo'lsin.");
      return;
    }

    const normalized = normalizePhone(phone);
    const duplicate = (opData?.students || []).find(
      (s) => s.id !== targetEditing?.id && normalizePhone(s.phone) === normalized,
    );
    if (duplicate) {
      setError("Bu telefon raqamli o'quvchi allaqachon mavjud.");
      return;
    }

    setBusy(true);
    const fallbackPassword = phone.replace(/\D/g, "").slice(-4) || "1234";
    const finalPassword = password || fallbackPassword;

    const payload = {
      name: name.trim(),
      phone,
      birthDate,
      gender,
      schoolNumber: schoolNumber.trim(),
      grade: grade.trim(),
      streetAddress: streetAddress.trim(),
      parentName: parentName.trim(),
      parentPhone,
      statusNote: statusNote.trim(),
      joinedAt: joinedAt || new Date().toISOString().slice(0, 10),
      groupIds: groupId ? [groupId] : [],
      groupMemberships: groupId
        ? {
            ...(targetEditing?.groupMemberships || {}),
            [String(groupId)]: targetEditing?.groupMemberships?.[String(groupId)] || {
              groupId: String(groupId),
              status: "trial",
              enrolledAt: new Date().toISOString(),
              activationDate: null,
            },
          }
        : targetEditing?.groupMemberships || {},
      balance: typeof targetEditing?.balance === "number" ? targetEditing.balance : 0,
      coins: targetEditing?.coins ?? 0,
      status: targetEditing?.status || "active",
    };

    if (targetEditing && password) {
      payload.passwordHash = await hashPassword(password);
    } else if (!targetEditing) {
      payload.passwordHash = await hashPassword(finalPassword);
    }

    setBusy(false);
    if (targetEditing) {
      if (onSave) onSave({ ...payload, id: targetEditing.id });
      else if (saveCallback) saveCallback({ ...payload, id: targetEditing.id });
    } else {
      if (onAdd) onAdd(payload);
      else if (saveCallback) saveCallback(payload);
    }
    onClose();
  }

  return (
    <Modal
      title={editing ? "O'quvchini tahrirlash" : "Yangi o'quvchi qo'shish"}
      onClose={onClose}
      side="right"
      wide
    >
      <div className="space-y-4 text-sm">
        {/* Asosiy Ma'lumotlar (Ism, Telefon, Parol, Guruh) */}
        <div>
          <p className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">
            Asosiy Ma'lumotlar
          </p>
          <div className="space-y-3">
            <div>
              <label className={LABEL_CLS}>Ism Familiya *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masalan: Aziz Karimov"
                className={INPUT_CLS}
                autoFocus
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={LABEL_CLS}>Telefon raqam *</label>
                <PhoneInput value={phone} onChange={setPhone} />
              </div>

              <div>
                <label className={LABEL_CLS}>Parol</label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masalan: 1234"
                  className={INPUT_CLS}
                />
              </div>
            </div>

            {/* Guruh Tanlash - Telefon raqam va paroldan keyin */}
            <div>
              <label className={LABEL_CLS}>Guruhga biriktirish</label>
              {groups.length === 0 ? (
                <div>
                  <select
                    value={groupId}
                    onChange={(e) => setGroupId(e.target.value)}
                    className={INPUT_CLS}
                  >
                    <option value="">Guruhsiz</option>
                  </select>
                </div>
              ) : (
                <SearchableGroupSelect
                  groups={groups}
                  courses={courses}
                  students={opData?.students || []}
                  value={groupId}
                  onChange={(gid) => setGroupId(gid)}
                  placeholder="Guruhni tanlang..."
                />
              )}
            </div>
          </div>
        </div>

        {/* Shaxsiy Ma'lumotlar (Tug'ilgan sana, Jinsi, Maktabi, Sinfi) */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <p className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">
            Shaxsiy va Maktab Ma'lumotlari
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
              <label className={LABEL_CLS}>Jinsi</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className={INPUT_CLS}
              >
                <option value="">Tanlanmagan</option>
                <option value="Erkak">Erkak</option>
                <option value="Ayol">Ayol</option>
              </select>
            </div>

            <div>
              <label className={LABEL_CLS}>Maktabi</label>
              <input
                value={schoolNumber}
                onChange={(e) => setSchoolNumber(e.target.value)}
                placeholder="Masalan: 45-maktab"
                className={INPUT_CLS}
              />
            </div>

            <div>
              <label className={LABEL_CLS}>Sinfi</label>
              <input
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="Masalan: 9-A sinf"
                className={INPUT_CLS}
              />
            </div>
          </div>
        </div>

        {/* Manzil */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <p className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">
            Yashash Manzili
          </p>
          <div>
            <label className={LABEL_CLS}>Adresi</label>
            <input
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
              placeholder="Masalan: Toshkent sh., Chilonzor t., 12-uy 4-xonadon"
              className={INPUT_CLS}
            />
          </div>
        </div>

        {/* Ota-ona Ma'lumotlari */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <p className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">
            Ota-ona Ma'lumotlari
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLS}>Ota-ona ismi</label>
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
          </div>
        </div>

        {/* Izoh & Qo'shilgan sana */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLS}>O'qishni boshlagan sana</label>
              <input
                type="date"
                value={joinedAt}
                onChange={(e) => setJoinedAt(e.target.value)}
                className={INPUT_CLS}
              />
            </div>
          </div>

          <div>
            <label className={LABEL_CLS}>Izoh</label>
            <textarea
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              placeholder="O'quvchi bo'yicha maxsus eslatma va izohlar..."
              className={`${INPUT_CLS} min-h-[72px]`}
            />
          </div>
        </div>

        {/* Error notification */}
        {error && <p className="text-rose-500 font-semibold text-xs">{error}</p>}

        {/* Submit button */}
        <PrimaryButton onClick={submit} disabled={busy} className="w-full mt-2">
          {busy ? (
            <Icon name="spinner" size={16} className="animate-spin" />
          ) : (
            <Icon name={editing ? "save" : "user-plus"} size={16} />
          )}{" "}
          {editing ? "Saqlash" : "O'quvchi Qo'shish"}
        </PrimaryButton>
      </div>
    </Modal>
  );
}

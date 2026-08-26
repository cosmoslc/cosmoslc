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
  directorData = { courses: [] },
  opData = {},
  editing = null,
  onAdd,
  onSave,
  onClose,
}) {
  const safeScopeBranches = scopeBranches || [];
  const safeDirectorData = directorData || { courses: [] };
  const safeCourses = safeDirectorData.courses || [];
  const branchIds = safeScopeBranches.map((b) => b.id);
  const courses = safeCourses.filter((c) =>
    branchIds.includes(c.branchId),
  );
  const courseIds = courses.map((c) => c.id);
  const groups = opGroups(opData || {}).filter((g) => courseIds.includes(g.courseId));

  const currentYear = new Date().getFullYear();
  const birthYears = Array.from(
    { length: 80 },
    (_, index) => currentYear - index,
  );
  const birthMonths = Array.from({ length: 12 }, (_, index) => index + 1);
  const birthDays = Array.from({ length: 31 }, (_, index) => index + 1);

  const initialBirth = editing?.birthDate ? editing.birthDate.split("-") : [];
  const [groupId, setGroupId] = useState(
    editing?.groupIds?.[0] || groups[0]?.id || "",
  );
  const [joinedAt, setJoinedAt] = useState(
    editing?.joinedAt || editing?.createdAt?.slice(0, 10) || new Date().toISOString().slice(0, 10),
  );
  const [name, setName] = useState(editing?.name || "");
  const [phone, setPhone] = useState(editing?.phone || "");
  const [gender, setGender] = useState(editing?.gender || "");
  const [birthYear, setBirthYear] = useState(initialBirth[0] || "");
  const [birthMonth, setBirthMonth] = useState(initialBirth[1] || "");
  const [birthDay, setBirthDay] = useState(initialBirth[2] || "");
  const [schoolNumber, setSchoolNumber] = useState(editing?.schoolNumber || "");
  const [grade, setGrade] = useState(editing?.grade || "");
  const [source, setSource] = useState(editing?.source || "");
  const [region, setRegion] = useState(editing?.region || "");
  const [district, setDistrict] = useState(editing?.district || "");
  const [neighborhood, setNeighborhood] = useState(editing?.neighborhood || "");
  const [streetAddress, setStreetAddress] = useState(
    editing?.streetAddress || "",
  );
  const [parentName, setParentName] = useState(editing?.parentName || "");
  const [parentPhone, setParentPhone] = useState(editing?.parentPhone || "");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState(editing?.status || "active");
  const [statusNote, setStatusNote] = useState(editing?.statusNote || "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setError("");
    if (!name.trim()) {
      setError("O'quvchi ismini kiriting.");
      return;
    }
    if (!phone.trim()) {
      setError("Telefon raqamini kiriting.");
      return;
    }
    if (full && password && password.length < 4) {
      setError("Parol kamida 4 belgidan iborat bo'lsin.");
      return;
    }
    const normalized = normalizePhone(phone);
    const duplicate = (opData.students || []).find(
      (s) => s.id !== editing?.id && normalizePhone(s.phone) === normalized,
    );
    if (duplicate) {
      setError("Bu telefon raqamli o'quvchi allaqachon mavjud.");
      return;
    }
    setBusy(true);
    const fallbackPassword = phone.replace(/\D/g, "").slice(-4) || "1234";
    const birthDate = [birthYear, birthMonth, birthDay]
      .filter(Boolean)
      .map((value) => String(value).padStart(2, "0"))
      .join("-");

    const payload = {
      name: name.trim(),
      phone,
      joinedAt: joinedAt || new Date().toISOString().slice(0, 10),
      groupIds: groupId ? [groupId] : [],
      coins: editing?.coins ?? 0,
      status,
      statusNote: statusNote.trim(),
      gender,
      source,
      schoolNumber,
      grade,
      region,
      district,
      neighborhood,
      streetAddress,
    };
    if (full) {
      payload.birthDate = birthDate;
      payload.parentName = parentName.trim();
      payload.parentPhone = parentPhone;
      const finalPassword = password || fallbackPassword;
      if (editing && password)
        payload.passwordHash = await hashPassword(password);
      else if (!editing && finalPassword)
        payload.passwordHash = await hashPassword(finalPassword);
    } else if (!password) {
      payload.passwordHash = await hashPassword(fallbackPassword);
    }
    setBusy(false);
    if (editing) {
      onSave?.({ ...payload, id: editing.id });
    } else {
      onAdd(payload);
    }
    onClose();
  }

  return (
    <Modal
      title={
        editing
          ? "O'quvchini tahrirlash"
          : full
            ? "To'liq o'quvchi qo'shish"
            : "O'quvchi qo'shish"
      }
      onClose={onClose}
      side="right"
      wide
    >
      <div className="space-y-4 text-sm">
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
          <label className={LABEL_CLS}>Guruh (ixtiyoriy, qidirish va tanlash)</label>
          {groups.length === 0 ? (
            <p className="text-slate-500 text-sm bg-slate-50 border border-slate-200 rounded-xl p-3">
              Avval kurs va guruh yarating.
            </p>
          ) : (
            <SearchableGroupSelect
              groups={groups}
              courses={courses}
              students={opData?.students || []}
              value={groupId}
              onChange={(gid) => setGroupId(gid)}
              placeholder="Guruhni qidirish yoki tanlash..."
            />
          )}
        </div>

        <div>
          <label className={LABEL_CLS}>
            O'qishni boshlagan (qo'shilgan) sana <span className="text-indigo-600 font-normal text-[11px]">(oy o'rtasida kelsa to'lov shunga qarab hisoblanadi)</span>
          </label>
          <input
            type="date"
            value={joinedAt}
            onChange={(e) => setJoinedAt(e.target.value)}
            className={INPUT_CLS}
          />
        </div>
        {full && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={LABEL_CLS}>Jins</label>
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
                <label className={LABEL_CLS}>Tug'ilgan sana</label>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={birthYear}
                    onChange={(e) => setBirthYear(e.target.value)}
                    className={INPUT_CLS}
                  >
                    <option value="">Yil</option>
                    {birthYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  <select
                    value={birthMonth}
                    onChange={(e) => setBirthMonth(e.target.value)}
                    className={INPUT_CLS}
                  >
                    <option value="">Oy</option>
                    {birthMonths.map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                  <select
                    value={birthDay}
                    onChange={(e) => setBirthDay(e.target.value)}
                    className={INPUT_CLS}
                  >
                    <option value="">Kun</option>
                    {birthDays.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className={LABEL_CLS}>
                Parol (ixtiyoriy; bo'sh qoldirilsa telefon raqamining oxirgi 4
                raqami bo'ladi)
              </label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masalan: 4321"
                className={INPUT_CLS}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={LABEL_CLS}>Maktab raqami</label>
                <input
                  value={schoolNumber}
                  onChange={(e) => setSchoolNumber(e.target.value)}
                  placeholder="Ixtiyoriy"
                  className={INPUT_CLS}
                />
              </div>
              <div>
                <label className={LABEL_CLS}>Sinf raqami</label>
                <input
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="Ixtiyoriy"
                  className={INPUT_CLS}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={LABEL_CLS}>Tuman</label>
                <input
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="Ixtiyoriy"
                  className={INPUT_CLS}
                />
              </div>
              <div>
                <label className={LABEL_CLS}>Mahalla</label>
                <input
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  placeholder="Ixtiyoriy"
                  className={INPUT_CLS}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={LABEL_CLS}>Ko'cha va uy</label>
                <input
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="Ixtiyoriy"
                  className={`${INPUT_CLS} text-sm`}
                />
              </div>
              <div>
                <label className={LABEL_CLS}>Viloyat</label>
                <input
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="Ixtiyoriy"
                  className={INPUT_CLS}
                />
              </div>
            </div>

            <div>
              <label className={LABEL_CLS}>Qanday kelgani</label>
              <input
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="Ixtiyoriy"
                className={INPUT_CLS}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
            </div>

            {status !== "active" && (
              <div>
                <label className={LABEL_CLS}>Izoh</label>
                <textarea
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Nega bunday holatga keldi?"
                  className={`${INPUT_CLS} min-h-[88px]`}
                />
              </div>
            )}
          </div>
        )}
        {error && <p className="text-red-500 text-xs">{error}</p>}
        <PrimaryButton onClick={submit} disabled={busy} className="w-full">
          {busy ? (
            <Icon name="spinner" size={16} className="animate-spin" />
          ) : (
            <Icon name={editing ? "save" : "user-plus"} size={16} />
          )}{" "}
          {editing ? "Saqlash" : "Qo'shish"}
        </PrimaryButton>
      </div>
    </Modal>
  );
}

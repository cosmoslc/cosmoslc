import React, { useState, useEffect } from "react";
import { Modal, MoneyInput, NumberInput } from "../components/primitives";
import { Tag, Calendar, Users, HelpCircle, Save, X } from "lucide-react";

export function AddDiscountModal({
  isOpen,
  onClose,
  student,
  assignedGroups = [],
  editingDiscount = null,
  onSave,
}) {
  const [groupId, setGroupId] = useState("");
  const [value, setValue] = useState("");
  const [type, setType] = useState("fixed"); // "fixed" | "percent"
  const [startDate, setStartDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [affectsTeacherShare, setAffectsTeacherShare] = useState("true"); // "true" | "false"
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (editingDiscount) {
      setGroupId(editingDiscount.groupId || "");
      setValue(editingDiscount.value || "");
      setType(editingDiscount.type || "fixed");
      setStartDate(
        editingDiscount.startDate || new Date().toISOString().slice(0, 10)
      );
      setEndDate(editingDiscount.endDate || "");
      setAffectsTeacherShare(
        editingDiscount.affectsTeacherShare === false || editingDiscount.affectsTeacherShare === "false"
          ? "false"
          : "true"
      );
      setReason(editingDiscount.reason || "");
    } else {
      setGroupId("");
      setValue("");
      setType("fixed");
      setStartDate(new Date().toISOString().slice(0, 10));
      const d = new Date();
      d.setMonth(d.getMonth() + 1);
      setEndDate(d.toISOString().slice(0, 10));
      setAffectsTeacherShare("true");
      setReason("");
    }
  }, [editingDiscount, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const numVal = Number(value);
    if (!numVal || numVal <= 0) return;

    const selectedGroup = assignedGroups.find((g) => String(g.id) === String(groupId));
    const groupName = selectedGroup ? selectedGroup.name : "Barcha guruhlar";

    const discountPayload = {
      id: editingDiscount?.id || `disc_${Date.now()}`,
      groupId: groupId || "",
      groupName,
      value: numVal,
      type,
      startDate,
      endDate,
      affectsTeacherShare: affectsTeacherShare === "true",
      reason: reason.trim() || "Chegirma",
      createdAt: editingDiscount?.createdAt || new Date().toISOString(),
    };

    onSave(discountPayload);
    onClose();
  };

  const INPUT_CLS =
    "w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors";
  const LABEL_CLS =
    "block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingDiscount ? "Chegirmani tahrirlash" : "Chegirma berish"}
      position="center"
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-1">
        {/* Guruh tanlash */}
        <div>
          <label className={LABEL_CLS}>Guruhni tanlang</label>
          <select
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            className={INPUT_CLS}
          >
            <option value="">Barcha guruhlar uchun</option>
            {assignedGroups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name} {g.course ? `(${g.course})` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Miqdor va Turi */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={LABEL_CLS}>Chegirma miqdori</label>
            {type === "percent" ? (
              <NumberInput
                min={1}
                max={100}
                value={value}
                onChange={setValue}
                placeholder="10"
                className={INPUT_CLS}
                required
              />
            ) : (
              <MoneyInput
                min={0}
                value={value}
                onChange={setValue}
                placeholder="50 000"
                className={INPUT_CLS}
                required
              />
            )}
          </div>
          <div>
            <label className={LABEL_CLS}>Qiymat turi</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className={INPUT_CLS}
            >
              <option value="fixed">Summada so'm</option>
              <option value="percent">Foizda %</option>
            </select>
          </div>
        </div>

        {/* Muddat: Dan va Gacha */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={LABEL_CLS}>Boshlanish sana</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={INPUT_CLS}
              required
            />
          </div>
          <div>
            <label className={LABEL_CLS}>Tugash sana</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={INPUT_CLS}
              required
            />
          </div>
        </div>

        {/* O'qituvchi ulushiga ta'sir qiladimi */}
        <div>
          <label className={LABEL_CLS}>O'qituvchi ulushiga ta'sir qiladimi</label>
          <select
            value={affectsTeacherShare}
            onChange={(e) => setAffectsTeacherShare(e.target.value)}
            className={INPUT_CLS}
          >
            <option value="true">Ta'sir qiladi</option>
            <option value="false">Ta'sir qilmaydi</option>
          </select>
        </div>

        {/* Izoh / Sabab */}
        <div>
          <label className={LABEL_CLS}>Izoh</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Chegirma sababi yoki asos..."
            className={INPUT_CLS}
            required
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
          >
            Bekor qilish
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            <Save size={14} />
            <span>Saqlash</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}

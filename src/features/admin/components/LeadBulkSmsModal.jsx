import React, { useState } from "react";
import {
  MessageSquare,
  Send,
  Users,
  CheckCircle2,
  AlertTriangle,
  X,
  Sparkles,
  Info,
} from "lucide-react";
import { Modal } from "./primitives";

const SMS_TEMPLATES = [
  {
    id: "welcome",
    title: "Yangi lidga xush kelibsiz",
    text: "Assalomu alaykum {ism}! {markaz} o'quv markaziga qiziqish bildirganingiz uchun tashakkur. Siz bilan tez orada mutaxassisimiz bog'lanadi.",
  },
  {
    id: "trial_invite",
    title: "Sinov darsiga taklifnoma",
    text: "Hurmatli {ism}! {markaz} o'quv markazimizda yangi ochiq sinov darsiga taklif qilamiz. Batafsil ma'lumot va joy band qilish uchun bizga yozing.",
  },
  {
    id: "discount",
    title: "Maxsus chegirma aksiyasi",
    text: "Salom {ism}! {markaz}da yangi oqimlar uchun 20% gacha maxsus chegirma e'lon qilindi! Ro'yxatdan o'tishga shoshiling.",
  },
  {
    id: "waiting_group",
    title: "Zaxira guruh ochilishi",
    text: "Assalomu alaykum {ism}! Siz kutgan {kurs} yo'nalishi bo'yicha yangi guruhimiz darslari boshlanmoqda. Birinchi darsga taklif etamiz!",
  },
];

export function LeadBulkSmsModal({
  isOpen,
  onClose,
  leads = [],
  columns = [],
  staffMembers = [],
  reserveGroups = [],
  onSendSms,
  onSendBulkSms,
}) {
  const effectiveSendSms = onSendSms || onSendBulkSms;
  const [recipientFilter, setRecipientFilter] = useState("all");
  const [selectedColumnId, setSelectedColumnId] = useState(columns[0]?.id || "new");
  const [selectedReserveId, setSelectedReserveId] = useState(reserveGroups[0]?.id || "");
  const [smsText, setSmsText] = useState("");
  const [sending, setSending] = useState(false);
  const [successCount, setSuccessCount] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  // Calculate recipients
  const activeLeads = leads.filter(
    (l) => l.status !== "rejected" && l.status !== "lost"
  );

  let targetLeads = [];
  if (recipientFilter === "all") {
    targetLeads = activeLeads;
  } else if (recipientFilter === "column") {
    targetLeads = activeLeads.filter((l) => l.status === selectedColumnId);
  } else if (recipientFilter === "reserve") {
    targetLeads = selectedReserveId
      ? activeLeads.filter((l) => l.reserveGroupId === selectedReserveId)
      : activeLeads.filter((l) => !!l.reserveGroupId);
  }

  // Filter valid phone numbers
  const validRecipients = targetLeads.filter(
    (l) => (l.phone || "").replace(/[^0-9]/g, "").length >= 7
  );

  const charCount = smsText.length;
  const smsSegments = Math.ceil(charCount / 70) || 1;

  const handleApplyTemplate = (tmpl) => {
    setSmsText(tmpl.text);
  };

  const handleInsertVariable = (v) => {
    setSmsText((prev) => prev + ` {${v}}`);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!smsText.trim()) {
      setErrorMsg("SMS matnini kiriting");
      return;
    }
    if (validRecipients.length === 0) {
      setErrorMsg("Xabar yuborish uchun faol telefon raqamli lidlar topilmadi");
      return;
    }

    setSending(true);
    setErrorMsg("");

    setTimeout(() => {
      if (effectiveSendSms) {
        effectiveSendSms({
          recipientsCount: validRecipients.length,
          text: smsText,
          targetType: recipientFilter,
          sentAt: new Date().toISOString(),
        });
      }
      setSending(false);
      setSuccessCount(validRecipients.length);
      setTimeout(() => {
        setSuccessCount(null);
        setSmsText("");
        onClose();
      }, 2000);
    }, 1000);
  };

  return (
    <Modal
      title="Lidlarga Ommaviy SMS Yuborish"
      onClose={onClose}
      position="center"
      wide
    >
      <div className="space-y-4">
        {successCount !== null ? (
          <div className="py-12 text-center space-y-3 my-auto">
            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-300 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 size={30} />
            </div>
            <h4 className="font-bold text-base text-slate-900 dark:text-white">
              {successCount} ta lidga SMS muvaffaqiyatli jo'natildi!
            </h4>
            <p className="text-xs text-slate-500">
              Xabarnomalar navbatga qo'yildi va mijozlarga yetkaziladi
            </p>
          </div>
        ) : (
          <form onSubmit={handleSend} className="space-y-3.5">
            {errorMsg && (
              <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertTriangle size={14} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Recipient scope selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kimlarga yuborilsin?
              </label>
              <div className="grid grid-cols-3 gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setRecipientFilter("all")}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all ${
                    recipientFilter === "all"
                      ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-xs"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                  }`}
                >
                  Barcha lidlar ({activeLeads.length})
                </button>
                <button
                  type="button"
                  onClick={() => setRecipientFilter("column")}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all ${
                    recipientFilter === "column"
                      ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-xs"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                  }`}
                >
                  Ustun bo'yicha
                </button>
                <button
                  type="button"
                  onClick={() => setRecipientFilter("reserve")}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all ${
                    recipientFilter === "reserve"
                      ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-xs"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                  }`}
                >
                  Zaxiradagilar
                </button>
              </div>

              {recipientFilter === "column" && (
                <div className="mt-2">
                  <select
                    value={selectedColumnId}
                    onChange={(e) => setSelectedColumnId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold"
                  >
                    {columns.map((col) => {
                      const count = activeLeads.filter((l) => l.status === col.id).length;
                      return (
                        <option key={col.id} value={col.id}>
                          {col.label} ({count} ta lid)
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {recipientFilter === "reserve" && (
                <div className="mt-2">
                  <select
                    value={selectedReserveId}
                    onChange={(e) => setSelectedReserveId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold"
                  >
                    <option value="">Barcha zaxira guruhlar</option>
                    {reserveGroups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({leads.filter((l) => l.reserveGroupId === g.id).length} ta)
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Recipient summary banner */}
            <div className="p-2.5 bg-slate-100 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400 font-medium">
                Qabul qiluvchilar soni:
              </span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {validRecipients.length} ta telefon raqam
              </span>
            </div>

            {/* Template presets */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Sparkles size={13} className="text-amber-500" />
                Tayyor shablonlar:
              </label>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {SMS_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => handleApplyTemplate(tmpl)}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 rounded-lg shrink-0 border border-slate-200 dark:border-slate-700 transition-colors"
                  >
                    {tmpl.title}
                  </button>
                ))}
              </div>
            </div>

            {/* SMS text */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  SMS matni *
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400">Qo'shish:</span>
                  <button
                    type="button"
                    onClick={() => handleInsertVariable("ism")}
                    className="px-1.5 py-0.5 text-[10px] font-mono bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 rounded font-bold"
                  >
                    {"{ism}"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertVariable("markaz")}
                    className="px-1.5 py-0.5 text-[10px] font-mono bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 rounded font-bold"
                  >
                    {"{markaz}"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertVariable("kurs")}
                    className="px-1.5 py-0.5 text-[10px] font-mono bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 rounded font-bold"
                  >
                    {"{kurs}"}
                  </button>
                </div>
              </div>
              <textarea
                rows={4}
                required
                placeholder="SMS matnini kiriting..."
                value={smsText}
                onChange={(e) => setSmsText(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500 resize-none"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                <span>{charCount} belgi ({smsSegments} ta SMS qismi)</span>
                <span>O'zbekiston bo'ylab 1 SMS = 70 belgi</span>
              </div>
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
                disabled={sending || validRecipients.length === 0 || !smsText.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Send size={13} />
                <span>{sending ? "Yuborilmoqda..." : "SMS Yuborish"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}

import React, { useState, useMemo } from "react";
import {
  FileText,
  Plus,
  Calendar,
  Award,
  Trash2,
  Edit3,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Sparkles,
  Users,
  Check,
  X,
  Calculator,
} from "lucide-react";
import {
  BTN_PRIMARY,
  BTN_GHOST,
  BTN_ICON,
  INPUT_CLS,
} from "../../../shared/theme/tokens";
import { Avatar, EmptyState } from "../../../shared/components/primitives";
import { DEFAULT_EXAM_TEMPLATES } from "../../../shared/api/exams";

function formatDateDisplay(dStr) {
  if (!dStr) return "Belgilanmagan";
  try {
    const d = new Date(dStr);
    if (isNaN(d.getTime())) return dStr;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  } catch {
    return dStr;
  }
}

export function GroupExamsSection({
  group,
  students,
  appData,
  addExam,
  updateExam,
  deleteExam,
  saveExamResults,
  openModal,
}) {
  const [examModalOpen, setExamModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [gradingExam, setGradingExam] = useState(null);

  const groupExams = useMemo(() => {
    const list = (appData?.exams || []).filter(
      (e) => String(e.groupId) === String(group.id)
    );
    return list.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [appData?.exams, group.id]);

  function handleOpenCreate() {
    setEditingExam(null);
    setExamModalOpen(true);
  }

  function handleOpenEdit(exam) {
    setEditingExam(exam);
    setExamModalOpen(true);
  }

  function handleOpenGrading(exam) {
    setGradingExam(exam);
  }

  async function handleDelete(exam) {
    if (window.confirm(`"${exam.title || exam.name}" imtihonini o'chirmoqchimisiz?`)) {
      if (deleteExam) {
        await deleteExam(exam.id);
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Guruh imtihonlari
          </h3>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            {groupExams.length} ta
          </span>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className={BTN_PRIMARY}
        >
          <Plus size={14} />
          <span>Imtihon qo'shish</span>
        </button>
      </div>

      {/* Exams Table */}
      {groupExams.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-white/40 dark:bg-white/[0.02] border border-dashed border-slate-200/80 dark:border-white/10 space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <FileText size={24} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">
              Hali imtihon yaratilmagan
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Ushbu guruh uchun oraliq yoki yakuniy sinov imtihonini qo'shing.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenCreate}
            className={`${BTN_PRIMARY} mx-auto`}
          >
            <Plus size={14} />
            <span>Imtihon qo'shish</span>
          </button>
        </div>
      ) : (
        <div className="relative overflow-x-auto rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/40 dark:bg-white/[0.02] shadow-xs">
          <table className="w-full text-left border-collapse select-none">
            <thead>
              <tr className="border-b border-slate-200/60 dark:border-white/10 bg-slate-50/70 dark:bg-slate-900/60 text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Nomi</th>
                <th className="py-3 px-4">Sana</th>
                <th className="py-3 px-4 text-center">O'tish bali</th>
                <th className="py-3 px-4">Bo'lim</th>
                <th className="py-3 px-4">Hisoblash</th>
                <th className="py-3 px-4 text-right">Harakatlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-white/5 text-sm">
              {groupExams.map((exam) => {
                const results = exam.results || {};
                const gradedCount = Object.keys(results).length;
                const totalStudents = students.length;

                return (
                  <tr
                    key={exam.id}
                    className="hover:bg-blue-500/[0.04] dark:hover:bg-white/[0.03] transition-colors"
                  >
                    {/* 1. Nomi */}
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 dark:text-blue-400 flex items-center justify-center shrink-0">
                          <Award size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {exam.title || exam.name}
                          </p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <span>{gradedCount}/{totalStudents} baholangan</span>
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* 2. Sana */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-600 dark:text-slate-300 font-semibold">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/60 dark:bg-white/10 border border-slate-200/60 dark:border-white/15">
                        <Calendar size={13} className="text-blue-500 shrink-0" />
                        <span>{formatDateDisplay(exam.date)}</span>
                      </div>
                    </td>

                    {/* 3. O'tish bali */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        {exam.passingScore ?? 60} ball
                      </span>
                    </td>

                    {/* 4. Bo'lim */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                        <Layers size={12} />
                        <span>{exam.section || "Asosiy"}</span>
                      </span>
                    </td>

                    {/* 5. Hisoblash */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-600 dark:text-slate-300">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-500/10 text-slate-700 dark:text-slate-300 border border-slate-500/20 font-medium">
                        <Calculator size={12} className="text-slate-400" />
                        <span>{exam.calculationType || "100 ballik tizim"}</span>
                      </span>
                    </td>

                    {/* 6. Harakatlar */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <button
                          type="button"
                          onClick={() => handleOpenGrading(exam)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all"
                        >
                          <CheckCircle2 size={13} />
                          <span>Baholash</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEdit(exam)}
                          title="Tahrirlash"
                          className={BTN_ICON}
                        >
                          <Edit3 size={14} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(exam)}
                          title="O'chirish"
                          className={`${BTN_ICON} text-rose-500 hover:text-rose-600 hover:bg-rose-500/10`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Imtihon qo'shish / tahrirlash */}
      {examModalOpen && (
        <ExamModal
          groupId={group.id}
          exam={editingExam}
          onSave={async (payload) => {
            if (editingExam) {
              if (updateExam) await updateExam(editingExam.id, payload);
            } else {
              if (addExam) await addExam({ ...payload, groupId: group.id });
            }
            setExamModalOpen(false);
          }}
          onClose={() => setExamModalOpen(false)}
        />
      )}

      {/* Modal: Imtihon baholarini kiritish (Grading) */}
      {gradingExam && (
        <ExamGradingModal
          exam={gradingExam}
          students={students}
          onSave={async (results) => {
            if (saveExamResults) {
              await saveExamResults(gradingExam.id, results);
            }
            setGradingExam(null);
          }}
          onClose={() => setGradingExam(null)}
        />
      )}
    </div>
  );
}

// Modal for Creating & Editing Exam
function ExamModal({ groupId, exam, onSave, onClose }) {
  const [templateId, setTemplateId] = useState(exam?.templateId || "");
  const [sana, setSana] = useState(
    exam?.date || new Date().toISOString().slice(0, 10)
  );
  const [nomi, setNomi] = useState(exam?.title || exam?.name || "");
  const [otishBali, setOtishBali] = useState(
    exam?.passingScore !== undefined ? String(exam.passingScore) : "60"
  );
  const [bolim, setBolim] = useState(exam?.section || "1-bo'lim");
  const [hisoblash, setHisoblash] = useState(
    exam?.calculationType || "100 ballik tizim"
  );
  const [maxScore, setMaxScore] = useState(
    exam?.maxScore !== undefined ? String(exam.maxScore) : "100"
  );
  const [saving, setSaving] = useState(false);

  // When a template is selected, pre-fill the form fields
  function handleTemplateChange(e) {
    const tId = e.target.value;
    setTemplateId(tId);
    if (!tId) return;

    const found = DEFAULT_EXAM_TEMPLATES.find((t) => t.id === tId);
    if (found) {
      setNomi(found.title);
      setOtishBali(String(found.passingScore));
      setMaxScore(String(found.maxScore));
      setBolim(found.section);
      setHisoblash(found.calculationType);
    }
  }

  // Strict positive number input handler for passing score
  function handleOtishBaliChange(e) {
    const val = e.target.value.replace(/[^0-9.]/g, "");
    setOtishBali(val);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!nomi.trim()) return;

    setSaving(true);
    try {
      await onSave({
        templateId: templateId || null,
        date: sana,
        title: nomi.trim(),
        name: nomi.trim(),
        passingScore: parseFloat(otishBali) || 0,
        section: bolim.trim() || "Asosiy",
        calculationType: hisoblash,
        maxScore: parseFloat(maxScore) || 100,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-[0_16px_48px_0_rgba(0,0,0,0.3)] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200/70 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Award size={18} />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {exam ? "Imtihonni tahrirlash" : "Imtihon qo'shish"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={BTN_ICON}
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* 1. Imtihon shablonlari */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Imtihon shablonlari
            </label>
            <select
              value={templateId}
              onChange={handleTemplateChange}
              className={INPUT_CLS}
            >
              <option value="">Shablonsiz</option>
              {DEFAULT_EXAM_TEMPLATES.map((tmpl) => (
                <option key={tmpl.id} value={tmpl.id}>
                  {tmpl.title}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Sana & O'tish bali */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Sana
              </label>
              <input
                type="date"
                value={sana}
                onChange={(e) => setSana(e.target.value)}
                required
                className={INPUT_CLS}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                O'tish bali
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={otishBali}
                onChange={handleOtishBaliChange}
                placeholder="60"
                required
                className={INPUT_CLS}
              />
            </div>
          </div>

          {/* 3. Nomi */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Nomi
            </label>
            <input
              type="text"
              value={nomi}
              onChange={(e) => setNomi(e.target.value)}
              placeholder="Oraliq nazorat imtihoni"
              required
              className={INPUT_CLS}
            />
          </div>

          {/* 4. Bo'lim & Hisoblash */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Bo'lim
              </label>
              <input
                type="text"
                value={bolim}
                onChange={(e) => setBolim(e.target.value)}
                placeholder="Unit 1-4"
                className={INPUT_CLS}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Hisoblash
              </label>
              <select
                value={hisoblash}
                onChange={(e) => setHisoblash(e.target.value)}
                className={INPUT_CLS}
              >
                <option value="100 ballik tizim">100 ballik tizim</option>
                <option value="Foiz (%)">Foiz (%)</option>
                <option value="Ballar yig'indisi">Ballar yig'indisi</option>
                <option value="Band score (0-9)">Band score (0-9)</option>
                <option value="75 ballik tizim">75 ballik tizim</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200/70 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              className={BTN_GHOST}
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={saving || !nomi.trim()}
              className={BTN_PRIMARY}
            >
              {saving ? "Saqlanmoqda..." : exam ? "Saqlash" : "Yaratish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal for Grading Student Exam Results
function ExamGradingModal({ exam, students, onSave, onClose }) {
  const passingScore = parseFloat(exam.passingScore) || 60;
  const initialResults = exam.results || {};

  const [scores, setScores] = useState(() => {
    const map = {};
    students.forEach((s) => {
      const existing = initialResults[s.id];
      map[s.id] = {
        score: existing?.score !== undefined ? String(existing.score) : "",
        note: existing?.note || "",
      };
    });
    return map;
  });

  const [saving, setSaving] = useState(false);

  function handleScoreChange(studentId, val) {
    const clean = val.replace(/[^0-9.]/g, "");
    setScores((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        score: clean,
      },
    }));
  }

  function handleNoteChange(studentId, val) {
    setScores((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        note: val,
      },
    }));
  }

  // Quick stats
  const stats = useMemo(() => {
    let totalGraded = 0;
    let totalPassed = 0;
    let sumScores = 0;

    Object.values(scores).forEach((item) => {
      if (item.score !== "" && !isNaN(parseFloat(item.score))) {
        totalGraded++;
        const num = parseFloat(item.score);
        sumScores += num;
        if (num >= passingScore) {
          totalPassed++;
        }
      }
    });

    const avg = totalGraded > 0 ? (sumScores / totalGraded).toFixed(1) : "0";
    const passRate = totalGraded > 0 ? Math.round((totalPassed / totalGraded) * 100) : 0;

    return { totalGraded, totalPassed, avg, passRate };
  }, [scores, passingScore]);

  async function handleSave() {
    setSaving(true);
    try {
      const resultsToSave = {};
      Object.entries(scores).forEach(([studentId, data]) => {
        if (data.score !== "") {
          const numScore = parseFloat(data.score) || 0;
          resultsToSave[studentId] = {
            score: numScore,
            passed: numScore >= passingScore,
            note: data.note || "",
            gradedAt: new Date().toISOString(),
          };
        }
      });
      await onSave(resultsToSave);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-3xl max-h-[90vh] rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-[0_16px_48px_0_rgba(0,0,0,0.3)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200/70 dark:border-white/10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                {exam.title || exam.name}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Sana: {formatDateDisplay(exam.date)} · O'tish bali: {passingScore} · Bo'lim: {exam.section || "Asosiy"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={BTN_ICON}
          >
            <X size={16} />
          </button>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-3 gap-2 p-3 sm:p-4 border-b border-slate-200/50 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/30 text-center text-xs">
          <div className="p-2 rounded-xl bg-white/60 dark:bg-white/5 border border-slate-200/60 dark:border-white/10">
            <span className="text-slate-400 block text-[11px]">Topshirganlar</span>
            <span className="text-sm font-black text-slate-900 dark:text-white">
              {stats.totalGraded}/{students.length}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-white/60 dark:bg-white/5 border border-slate-200/60 dark:border-white/10">
            <span className="text-slate-400 block text-[11px]">O'rtacha ball</span>
            <span className="text-sm font-black text-blue-600 dark:text-blue-400">
              {stats.avg}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-white/60 dark:bg-white/5 border border-slate-200/60 dark:border-white/10">
            <span className="text-slate-400 block text-[11px]">O'tish ko'rsatkichi</span>
            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
              {stats.passRate}% ({stats.totalPassed} kishi)
            </span>
          </div>
        </div>

        {/* Student Scoring Table */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {students.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">
              Guruhda o'quvchilar mavjud emas.
            </p>
          ) : (
            <div className="divide-y divide-slate-200/50 dark:divide-white/5">
              {students.map((student, idx) => {
                const item = scores[student.id] || { score: "", note: "" };
                const numVal = parseFloat(item.score);
                const isGraded = item.score !== "" && !isNaN(numVal);
                const passed = isGraded ? numVal >= passingScore : null;

                return (
                  <div
                    key={student.id}
                    className="py-2.5 flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap"
                  >
                    {/* Student Info */}
                    <div className="flex items-center gap-2.5 min-w-[180px]">
                      <span className="text-xs font-semibold text-slate-400 w-5 text-right">
                        {idx + 1}
                      </span>
                      <Avatar
                        name={student.name}
                        photo={student.avatar || student.photo}
                        size={32}
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {student.name}
                        </p>
                      </div>
                    </div>

                    {/* Inputs & Pass/Fail status */}
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      {/* Score Input */}
                      <div className="w-24">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={item.score}
                          onChange={(e) => handleScoreChange(student.id, e.target.value)}
                          placeholder="Ball"
                          className={`${INPUT_CLS} text-center font-bold text-xs py-1.5`}
                        />
                      </div>

                      {/* Status Badge */}
                      <div className="w-20 text-center">
                        {isGraded ? (
                          passed ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                              <Check size={11} />
                              O'tdi
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                              <X size={11} />
                              O'tmadi
                            </span>
                          )
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">
                            —
                          </span>
                        )}
                      </div>

                      {/* Note Input */}
                      <div className="w-36 hidden md:block">
                        <input
                          type="text"
                          value={item.note}
                          onChange={(e) => handleNoteChange(student.id, e.target.value)}
                          placeholder="Qayd"
                          className={`${INPUT_CLS} text-xs py-1.5`}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200/70 dark:border-white/10 flex items-center justify-end gap-2.5 bg-slate-50/50 dark:bg-slate-950/40">
          <button
            type="button"
            onClick={onClose}
            className={BTN_GHOST}
          >
            Bekor qilish
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className={BTN_PRIMARY}
          >
            {saving ? "Saqlanmoqda..." : "Natijalarni saqlash"}
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import {
  FileSpreadsheet,
  Upload,
  ClipboardList,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Layers,
  Search,
  UserCheck,
  DoorOpen,
  BookOpen,
} from "lucide-react";
import { Modal } from "../components/primitives";
import { INPUT_CLS, LABEL_CLS, PrimaryButton } from "../theme/tokens";
import { opGroups, opRooms } from "../utils/dataHelpers";

function parseCost(val) {
  if (typeof val === "number") return val;
  if (!val) return 0;
  const str = String(val).replace(/[^\d]/g, "");
  return Number(str) || 0;
}

function parseDays(daysStr) {
  if (!daysStr) return ["Du", "Chor", "Jum"];
  if (Array.isArray(daysStr)) return daysStr;
  const str = String(daysStr).trim();
  if (!str) return ["Du", "Chor", "Jum"];
  const parts = str.split(/[,;\/\s]+/).filter(Boolean);
  return parts.length > 0 ? parts : [str];
}

function parseGroupRow(rowArray, courses, teachers, rooms) {
  // Column structure:
  // Name | Course | Teacher | Days | Room | Start Course | Time | Cost | Status
  let rawName = "";
  let rawCourse = "";
  let rawTeacher = "";
  let rawDays = "";
  let rawRoom = "";
  let rawStartDate = "";
  let rawTime = "";
  let rawCost = "";
  let rawStatus = "Faol";

  if (rowArray.length >= 1) rawName = String(rowArray[0] || "").trim();
  if (rowArray.length >= 2) rawCourse = String(rowArray[1] || "").trim();
  if (rowArray.length >= 3) rawTeacher = String(rowArray[2] || "").trim();
  if (rowArray.length >= 4) rawDays = String(rowArray[3] || "").trim();
  if (rowArray.length >= 5) rawRoom = String(rowArray[4] || "").trim();
  if (rowArray.length >= 6) rawStartDate = String(rowArray[5] || "").trim();
  if (rowArray.length >= 7) rawTime = String(rowArray[6] || "").trim();
  if (rowArray.length >= 8) rawCost = String(rowArray[7] || "").trim();
  if (rowArray.length >= 9) rawStatus = String(rowArray[8] || "").trim();

  // Ignore header row
  if (
    rawName.toLowerCase() === "name" ||
    rawName.toLowerCase() === "guruh nomi" ||
    rawName.toLowerCase() === "guruh"
  ) {
    return null;
  }

  // Find course match
  const matchedCourse = courses.find(
    (c) =>
      c.name?.toLowerCase().trim() === rawCourse.toLowerCase().trim() ||
      (c.name && rawCourse && c.name.toLowerCase().includes(rawCourse.toLowerCase())) ||
      (c.name && rawCourse && rawCourse.toLowerCase().includes(c.name.toLowerCase())),
  );

  // Find teacher match
  const matchedTeacher = teachers.find(
    (t) =>
      t.name?.toLowerCase().trim() === rawTeacher.toLowerCase().trim() ||
      (t.name && rawTeacher && t.name.toLowerCase().includes(rawTeacher.toLowerCase())) ||
      (t.name && rawTeacher && rawTeacher.toLowerCase().includes(t.name.toLowerCase())),
  );

  // Find room match
  const matchedRoom = rooms.find(
    (r) =>
      r.name?.toLowerCase().trim() === rawRoom.toLowerCase().trim() ||
      (r.name && rawRoom && r.name.toLowerCase().includes(rawRoom.toLowerCase())) ||
      (r.name && rawRoom && rawRoom.toLowerCase().includes(r.name.toLowerCase())),
  );

  const priceNum = parseCost(rawCost) || matchedCourse?.price || 300000;

  return {
    id: `import_grp_${Math.random().toString(36).substring(2, 9)}`,
    name: rawName || "Yangi guruh",
    rawCourse,
    courseId: matchedCourse ? matchedCourse.id : courses[0]?.id || "",
    rawTeacher,
    teacherId: matchedTeacher
      ? String(matchedTeacher.id)
      : teachers[0]?.id
        ? String(teachers[0].id)
        : "",
    rawDays,
    days: parseDays(rawDays),
    rawRoom,
    roomId: matchedRoom ? matchedRoom.id : rooms[0]?.id || "",
    startDate: rawStartDate || new Date().toISOString().slice(0, 10),
    time: rawTime || "14:00",
    price: priceNum,
    status:
      rawStatus.toLowerCase().includes("faolmas") ||
      rawStatus.toLowerCase().includes("inact")
        ? "inactive"
        : "active",
    isValid: Boolean(rawName && rawName.length > 1),
  };
}

export function ImportGroupsModal({
  opData = {},
  directorData = {},
  onImportSuccess = () => {},
  onClose = () => {},
}) {
  const courses = directorData?.courses || [];
  const teachers =
    directorData?.teachersHR || directorData?.teachers || opData?.teachers || [];
  const rooms = opRooms(opData) || directorData?.rooms || [];

  const [importTab, setImportTab] = useState("text"); // 'text' | 'file'
  const [rawText, setRawText] = useState("");
  const [parsedRows, setParsedRows] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importProgress, setImportProgress] = useState({ done: 0, total: 0 });
  const [errorMessage, setErrorMessage] = useState("");
  const [successBanner, setSuccessBanner] = useState("");

  // Process pasted text
  function handleParseText() {
    setErrorMessage("");
    if (!rawText.trim()) {
      setErrorMessage("Iltimos, Excel'dan nusxalangan matnni kiriting.");
      return;
    }

    const lines = rawText.split("\n").filter((l) => l.trim().length > 0);
    const parsed = [];

    lines.forEach((line) => {
      const columns = line.includes("\t") ? line.split("\t") : line.split(",");
      const item = parseGroupRow(columns, courses, teachers, rooms);
      if (item) parsed.push(item);
    });

    setParsedRows(parsed);
    if (parsed.length === 0) {
      setErrorMessage("Tahlil qilish uchun mos qatorlar topilmadi.");
    }
  }

  // Process uploaded Excel / CSV file
  function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage("");
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const jsonRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const parsed = [];

        jsonRows.forEach((row) => {
          if (
            Array.isArray(row) &&
            row.some((cell) => cell !== null && cell !== undefined && String(cell).trim() !== "")
          ) {
            const item = parseGroupRow(row, courses, teachers, rooms);
            if (item) parsed.push(item);
          }
        });

        setParsedRows(parsed);
        if (parsed.length === 0) {
          setErrorMessage("Fayldan mos guruh ma'lumotlari topilmadi.");
        }
      } catch (err) {
        console.error("Excel parse error:", err);
        setErrorMessage("Excel faylni o'qishda xatolik yuz berdi.");
      }
    };

    reader.readAsBinaryString(file);
  }

  function updateRowField(id, field, value) {
    setParsedRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        return { ...r, [field]: value };
      }),
    );
  }

  function removeRow(id) {
    setParsedRows((prev) => prev.filter((r) => r.id !== id));
  }

  async function executeImport() {
    if (parsedRows.length === 0) return;

    setIsProcessing(true);
    setErrorMessage("");
    setImportProgress({ done: 0, total: parsedRows.length });

    let countAdded = 0;
    try {
      for (let i = 0; i < parsedRows.length; i++) {
        const row = parsedRows[i];
        if (!row.name) continue;

        const payload = {
          name: row.name.trim(),
          courseId: row.courseId,
          teacherHrId: row.teacherId,
          teacherId: row.teacherId,
          roomId: row.roomId,
          days: row.days,
          time: row.time || "14:00",
          startDate: row.startDate || new Date().toISOString().slice(0, 10),
          price: Number(row.price) || 0,
          status: row.status || "active",
          format: "offline",
        };

        await onImportSuccess(payload);
        countAdded++;
        setImportProgress({ done: countAdded, total: parsedRows.length });
      }

      setSuccessBanner(`${countAdded} ta guruh muvaffaqiyatli saqlandi!`);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Import execution error:", err);
      setErrorMessage("Guruhlarni saqlashda xatolik yuz berdi.");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <Modal
      title="Guruhlarni Excel'dan import qilish"
      onClose={onClose}
      className="max-w-4xl w-full"
    >
      <div className="space-y-4">
        {/* Success Banner */}
        {successBanner && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-sm font-bold">
            <CheckCircle2 size={18} /> {successBanner}
          </div>
        )}

        {/* Error Banner */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center gap-2 text-sm font-semibold">
            <AlertCircle size={18} /> {errorMessage}
          </div>
        )}

        {/* Import Mode Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <button
            type="button"
            onClick={() => setImportTab("text")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              importTab === "text"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
            }`}
          >
            <ClipboardList size={15} /> Text nusxa joylash (Paste)
          </button>
          <button
            type="button"
            onClick={() => setImportTab("file")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              importTab === "file"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
            }`}
          >
            <FileSpreadsheet size={15} /> Excel / CSV fayl yuklash
          </button>
        </div>

        {/* MODE 1: Text Paste Area */}
        {importTab === "text" && (
          <div className="space-y-3">
            <div>
              <label className={LABEL_CLS}>
                Excel'dan nusxalangan guruh ma'lumotlarini joylang:
              </label>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder={`Misol uchun:\nName\tCourse\tTeacher\tDays\tRoom\tStart Course\tTime\tCost\tStatus\n5J13- CEFR (PRACTISE)\tENGLISH CEFR 390K\tBobomurod Toshtanov\tSeshanba, Payshanba, Shanba\tROOM 5\t2024-06-06\t13:30 - 15:30\t390,000\tFaol`}
                className={`${INPUT_CLS} min-h-[120px] font-mono text-xs`}
              />
            </div>
            <button
              type="button"
              onClick={handleParseText}
              className="px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs hover:bg-indigo-100 transition-all flex items-center gap-1.5"
            >
              <Search size={14} /> Tahlil qilish (Parse)
            </button>
          </div>
        )}

        {/* MODE 2: File Upload Area */}
        {importTab === "file" && (
          <div className="p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
              <Upload size={22} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Guruhlar uchun Excel (.xlsx, .xls) yoki CSV faylingizni yuklang
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Ustunlar: Name | Course | Teacher | Days | Room | Start Course | Time | Cost | Status
              </p>
            </div>
            <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-all cursor-pointer shadow-xs">
              <FileSpreadsheet size={16} /> Fayl tanlash
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* Parsed Rows Preview Table */}
        {parsedRows.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                Tahlil qilingan guruhlar: {parsedRows.length} ta
              </span>
            </div>

            {/* Preview Table */}
            <div className="max-h-[300px] overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Guruh nomi</th>
                    <th className="py-2.5 px-3">Kurs</th>
                    <th className="py-2.5 px-3">O'qituvchi</th>
                    <th className="py-2.5 px-3">Xona</th>
                    <th className="py-2.5 px-3">Vaqt & Kunlar</th>
                    <th className="py-2.5 px-3">Narxi</th>
                    <th className="py-2.5 px-3 text-right">Amal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {parsedRows.map((row, idx) => (
                    <tr
                      key={row.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    >
                      <td className="py-2 px-3 font-mono text-slate-400">
                        {idx + 1}
                      </td>

                      {/* Name */}
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={row.name}
                          onChange={(e) =>
                            updateRowField(row.id, "name", e.target.value)
                          }
                          className="w-full bg-transparent font-bold text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 px-1 py-0.5 rounded border border-transparent focus:border-slate-300"
                        />
                      </td>

                      {/* Course */}
                      <td className="py-2 px-3">
                        <select
                          value={row.courseId}
                          onChange={(e) =>
                            updateRowField(row.id, "courseId", e.target.value)
                          }
                          className="w-full bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded px-1.5 py-1 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                        >
                          <option value="">Kurs tanlanmagan</option>
                          {courses.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Teacher */}
                      <td className="py-2 px-3">
                        <select
                          value={row.teacherId}
                          onChange={(e) =>
                            updateRowField(row.id, "teacherId", e.target.value)
                          }
                          className="w-full bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded px-1.5 py-1 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                        >
                          <option value="">Ustoz biriktirilmagan</option>
                          {teachers.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Room */}
                      <td className="py-2 px-3">
                        <select
                          value={row.roomId}
                          onChange={(e) =>
                            updateRowField(row.id, "roomId", e.target.value)
                          }
                          className="w-full bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded px-1.5 py-1 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                        >
                          <option value="">Xona tanlanmagan</option>
                          {rooms.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Time & Days */}
                      <td className="py-2 px-3">
                        <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
                          {row.time}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                          {Array.isArray(row.days) ? row.days.join(", ") : row.days}
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-2 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {row.price?.toLocaleString()} so'm
                      </td>

                      {/* Remove */}
                      <td className="py-2 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => removeRow(row.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="O'chirish"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Execute Import Action */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {isProcessing
                  ? `Saqlanmoqda: ${importProgress.done} / ${importProgress.total}...`
                  : `Tizimga saqlashga tayyor`}
              </span>

              <PrimaryButton
                type="button"
                onClick={executeImport}
                disabled={isProcessing || parsedRows.length === 0}
                className="flex items-center gap-2"
              >
                <Layers size={16} /> Guruhlarni saqlash ({parsedRows.length})
              </PrimaryButton>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

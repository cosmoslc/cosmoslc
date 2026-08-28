import { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import {
  FileSpreadsheet,
  Upload,
  ClipboardList,
  CheckCircle2,
  AlertCircle,
  Trash2,
  UserPlus,
  ArrowRight,
  Info,
  Layers,
  Search,
} from "lucide-react";
import { Modal } from "../components/primitives";
import { INPUT_CLS, LABEL_CLS, PrimaryButton } from "../theme/tokens";
import { normalizePhone, displayPhone, hashPassword } from "../utils/helpers";
import { opGroups } from "../utils/dataHelpers";

// Helper to parse key-value string like "Qoshimcha raqam => 998943807400, Sana => 2026-08-21"
function parseKeyValuePairs(str) {
  const result = {};
  if (!str || typeof str !== "string") return result;

  const parts = str.split(/[,;\n]+/);
  for (const part of parts) {
    if (part.includes("=>")) {
      const [key, val] = part.split("=>");
      if (key && val) {
        result[key.trim().toLowerCase()] = val.trim();
      }
    } else if (part.includes(":")) {
      const [key, val] = part.split(":");
      if (key && val) {
        result[key.trim().toLowerCase()] = val.trim();
      }
    }
  }
  return result;
}

// Clean phone string
function extractPhone(str) {
  if (!str) return "";
  const cleaned = String(str).replace(/[^\d+]/g, "");
  if (!cleaned) return "";
  const digits = cleaned.replace(/\D/g, "");
  if (digits.length === 9) return `+998${digits}`;
  if (digits.length === 12 && digits.startsWith("998")) return `+${digits}`;
  return cleaned;
}

// Match extracted group string with database groups
function findMatchingGroup(groupText, groups) {
  if (!groupText || !groups?.length) return null;
  const target = String(groupText).trim().toLowerCase();
  if (!target) return null;

  // 1. Exact match
  let matched = groups.find((g) => g.name?.trim().toLowerCase() === target);
  if (matched) return matched;

  // 2. Partial match
  matched = groups.find(
    (g) =>
      g.name &&
      (target.includes(g.name.trim().toLowerCase()) ||
        g.name.trim().toLowerCase().includes(target)),
  );
  if (matched) return matched;

  // 3. Match code/words
  const words = target.split(/[\s\-_]+/);
  for (const word of words) {
    if (word.length >= 3) {
      matched = groups.find(
        (g) => g.name && g.name.toLowerCase().includes(word),
      );
      if (matched) return matched;
    }
  }

  return null;
}

// Smart row parser for Excel cells array or tab-separated string
function parseRowData(rowArray, existingGroups) {
  let rawName = "";
  let rawPhone = "";
  let rawGroup = "";
  let rawDate = "";
  let rawParentPhone = "";
  let rawGrade = "";
  let rawNotes = [];

  // Check if any item in array is a key-value string (e.g. "Qoshimcha raqam => 998943807400...")
  let kvPairs = {};
  for (const cell of rowArray) {
    if (typeof cell === "string" && (cell.includes("=>") || cell.includes(":"))) {
      const parsedKV = parseKeyValuePairs(cell);
      kvPairs = { ...kvPairs, ...parsedKV };
    }
  }

  // Iterate columns
  rowArray.forEach((cell, idx) => {
    if (!cell) return;
    const cellStr = String(cell).trim();
    if (!cellStr) return;

    // Skip if cell is full KV pair string
    if (cellStr.includes("=>")) return;

    // Is phone number?
    const phoneCandidate = extractPhone(cellStr);
    if (
      phoneCandidate.length >= 9 &&
      (cellStr.includes("+998") ||
        cellStr.startsWith("998") ||
        cellStr.startsWith("+") ||
        /^[\d\s()+-]{9,}$/.test(cellStr))
    ) {
      if (!rawPhone) {
        rawPhone = phoneCandidate;
      } else if (!rawParentPhone) {
        rawParentPhone = phoneCandidate;
      }
      return;
    }

    // Is date format (YYYY-MM-DD or DD.MM.YYYY)?
    if (/^\d{4}-\d{2}-\d{2}$/.test(cellStr) || /^\d{2}\.\d{2}\.\d{4}$/.test(cellStr)) {
      if (!rawDate) {
        rawDate = cellStr;
      }
      return;
    }

    // Column 0 is usually Student Name if not a phone/date
    if (idx === 0 && !rawName) {
      rawName = cellStr;
      return;
    }

    // Column with group name (e.g. "1J8 - KOREAN" or "kares tili")
    if (
      (cellStr.includes("-") || cellStr.toLowerCase().includes("guruh") || cellStr.toLowerCase().includes("korean") || cellStr.toLowerCase().includes("ingliz") || cellStr.toLowerCase().includes("yangi")) &&
      !rawGroup
    ) {
      rawGroup = cellStr;
      return;
    }

    // Name fallback
    if (!rawName && idx < 3 && cellStr.length > 2 && !cellStr.includes(":")) {
      rawName = cellStr;
      return;
    }

    // Other details
    if (cellStr.length > 1) {
      rawNotes.push(cellStr);
    }
  });

  // Extract KV pair fallbacks
  if (kvPairs["ism familiya"] || kvPairs["ism"] || kvPairs["f.i.o"]) {
    if (!rawName) rawName = kvPairs["ism familiya"] || kvPairs["ism"] || kvPairs["f.i.o"];
  }
  if (kvPairs["telefon raqam"] || kvPairs["telefon"] || kvPairs["phone"]) {
    if (!rawPhone) rawPhone = extractPhone(kvPairs["telefon raqam"] || kvPairs["telefon"] || kvPairs["phone"]);
  }
  if (kvPairs["qoshimcha raqam"] || kvPairs["parent phone"]) {
    rawParentPhone = extractPhone(kvPairs["qoshimcha raqam"] || kvPairs["parent phone"]);
  }
  if (kvPairs["sana"] || kvPairs["date"]) {
    if (!rawDate) rawDate = kvPairs["sana"] || kvPairs["date"];
  }
  if (kvPairs["qaysi guruhga kelyapti"] || kvPairs["qaysi kursga kelyapti"]) {
    if (!rawGroup) rawGroup = kvPairs["qaysi guruhga kelyapti"] || kvPairs["qaysi kursga kelyapti"];
  }
  if (kvPairs["sinfi"]) {
    rawGrade = kvPairs["sinfi"];
  }

  // Compile notes
  if (kvPairs["biz haqqimizda qaerdan eshitdingiz"]) {
    rawNotes.push(`Manba: ${kvPairs["biz haqqimizda qaerdan eshitdingiz"]}`);
  }
  if (kvPairs["qaerga murojat qilyapti"]) {
    rawNotes.push(`Murojaat: ${kvPairs["qaerga murojat qilyapti"]}`);
  }

  // Match group
  const matchedGroup = findMatchingGroup(rawGroup, existingGroups);

  return {
    id: `import_${Math.random().toString(36).substring(2, 9)}`,
    name: rawName || "Ismsiz o'quvchi",
    phone: rawPhone || "",
    parentPhone: rawParentPhone || "",
    groupText: rawGroup || "",
    matchedGroupId: matchedGroup ? matchedGroup.id : "",
    matchedGroupName: matchedGroup ? matchedGroup.name : "",
    joinedAt: rawDate || new Date().toISOString().slice(0, 10),
    grade: rawGrade || "",
    notes: rawNotes.join("; "),
    status: "active",
    isValid: Boolean(rawName && rawName !== "Ismsiz o'quvchi" && rawPhone),
  };
}

export function ImportStudentsModal({
  opData = {},
  directorData = {},
  scopeBranches = [],
  onImportSuccess = () => {},
  onClose = () => {},
}) {
  const groups = useMemo(() => opGroups(opData), [opData]);
  const existingStudents = opData?.students || [];

  const [importTab, setImportTab] = useState("text"); // 'text' | 'file'
  const [rawText, setRawText] = useState("");
  const [parsedRows, setParsedRows] = useState([]);
  const [defaultGroupId, setDefaultGroupId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [importProgress, setImportProgress] = useState({ done: 0, total: 0 });
  const [errorMessage, setErrorMessage] = useState("");
  const [successBanner, setSuccessBanner] = useState("");

  // Process pasted raw text into parsed rows
  function handleParseText() {
    setErrorMessage("");
    if (!rawText.trim()) {
      setErrorMessage("Iltimos, Excel'dan nusxalangan ma'lumotlarni matn maydoniga joylang.");
      return;
    }

    const lines = rawText.split("\n").filter((l) => l.trim().length > 0);
    const parsed = [];

    lines.forEach((line) => {
      // Split line by tab (\t) or comma if tab isn't present
      const columns = line.includes("\t") ? line.split("\t") : line.split(",");
      const item = parseRowData(columns, groups);
      parsed.push(item);
    });

    setParsedRows(parsed);
    if (parsed.length === 0) {
      setErrorMessage("Ma'lumotlar aniqlanmadi. Iltimos, ma'lumot formatini tekshiring.");
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

        // Convert worksheet to array of arrays
        const jsonRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const parsed = [];

        jsonRows.forEach((row, idx) => {
          // Skip header row if it contains column titles
          if (
            idx === 0 &&
            (String(row[0]).toLowerCase().includes("ism") ||
              String(row[0]).toLowerCase().includes("f.i.o") ||
              String(row[0]).toLowerCase().includes("name"))
          ) {
            return;
          }

          if (Array.isArray(row) && row.some((cell) => cell !== null && cell !== undefined && String(cell).trim() !== "")) {
            const item = parseRowData(row, groups);
            parsed.push(item);
          }
        });

        setParsedRows(parsed);
        if (parsed.length === 0) {
          setErrorMessage("Fayldan ma'lumotlar o'qib bo'lmadi yoki fayl bo'sh.");
        }
      } catch (err) {
        console.error("Excel parse error:", err);
        setErrorMessage("Excel faylni o'qishda xatolik yuz berdi.");
      }
    };

    reader.readAsBinaryString(file);
  }

  // Update parsed row field manually
  function updateRowField(id, field, value) {
    setParsedRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, [field]: value };
        if (field === "matchedGroupId") {
          const g = groups.find((grp) => String(grp.id) === String(value));
          updated.matchedGroupName = g ? g.name : "";
        }
        updated.isValid = Boolean(
          updated.name &&
            updated.name !== "Ismsiz o'quvchi" &&
            updated.phone,
        );
        return updated;
      }),
    );
  }

  // Delete single parsed row
  function removeRow(id) {
    setParsedRows((prev) => prev.filter((r) => r.id !== id));
  }

  // Perform import to database
  async function executeImport() {
    if (parsedRows.length === 0) return;

    setIsProcessing(true);
    setErrorMessage("");
    setImportProgress({ done: 0, total: parsedRows.length });

    let countAdded = 0;
    try {
      for (let i = 0; i < parsedRows.length; i++) {
        const row = parsedRows[i];
        if (!row.name || !row.phone) continue;

        const normalized = normalizePhone(row.phone);
        // Check duplicate phone in current database
        const duplicate = existingStudents.find(
          (s) => normalizePhone(s.phone) === normalized,
        );

        // Assign group ID (individual matched group OR fallback default group)
        const targetGroupId = row.matchedGroupId || defaultGroupId || "";

        const defaultPassword = row.phone.replace(/\D/g, "").slice(-4) || "1234";
        const passwordHash = await hashPassword(defaultPassword);

        const payload = {
          name: row.name.trim(),
          phone: row.phone,
          parentPhone: row.parentPhone || "",
          grade: row.grade || "",
          statusNote: row.notes || "Excel import orqali qo'shilgan",
          groupIds: targetGroupId ? [targetGroupId] : [],
          status: "active",
          joinedAt: row.joinedAt || new Date().toISOString().slice(0, 10),
          passwordHash,
        };

        if (duplicate) {
          // If student already exists, update their groups
          if (
            targetGroupId &&
            !(duplicate.groupIds || []).includes(targetGroupId)
          ) {
            const newGroupIds = [...(duplicate.groupIds || []), targetGroupId];
            await onImportSuccess({ ...duplicate, groupIds: newGroupIds });
          }
        } else {
          // Add new student
          await onImportSuccess(payload);
        }

        countAdded++;
        setImportProgress({ done: countAdded, total: parsedRows.length });
      }

      setSuccessBanner(
        `${countAdded} ta o'quvchi muvaffaqiyatli import qilindi!`,
      );
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Import execution error:", err);
      setErrorMessage("Import jarayonida kutilmagan xatolik yuz berdi.");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <Modal
      title="O'quvchilarni Excel'dan import qilish"
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
                Excel'dan ko'chirilgan qatorlarni bu yerga joylang:
              </label>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder={`Misol uchun:\nHatamov Azizbek\t+(998) 94-217-26-80\t2026-08-27\t1J8 - KOREAN\tBegmuratova Umida\tQoshimcha raqam => 998943807400, Sinfi => Bitirgan`}
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
                Excel (.xlsx, .xls) yoki CSV faylingizni yuklang
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Ustunlarda ism-familiya, telefon va guruh nomi mavjud bo'lishi lozim.
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  Tahlil qilingan o'quvchilar: {parsedRows.length} ta
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  {parsedRows.filter((r) => r.isValid).length} ta tayyor
                </span>
              </div>

              {/* Default group fallback selector */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 shrink-0">
                  Barchaga standart guruh:
                </label>
                <select
                  value={defaultGroupId}
                  onChange={(e) => setDefaultGroupId(e.target.value)}
                  className={`${INPUT_CLS} text-xs py-1.5 w-auto`}
                >
                  <option value="">Guruh biriktirmaslik</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Preview Table */}
            <div className="max-h-[300px] overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Ism-Familiya</th>
                    <th className="py-2.5 px-3">Telefon</th>
                    <th className="py-2.5 px-3">Biriktiriladigan Guruh</th>
                    <th className="py-2.5 px-3">Qo'shimcha ma'lumotlar</th>
                    <th className="py-2.5 px-3 text-right">Amal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {parsedRows.map((row, idx) => (
                    <tr
                      key={row.id}
                      className={
                        row.isValid
                          ? "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                          : "bg-rose-50/40 dark:bg-rose-950/20"
                      }
                    >
                      <td className="py-2 px-3 font-mono text-slate-400">
                        {idx + 1}
                      </td>

                      {/* Ism */}
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

                      {/* Telefon */}
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={row.phone}
                          onChange={(e) =>
                            updateRowField(row.id, "phone", e.target.value)
                          }
                          className="w-full bg-transparent font-mono text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-800 px-1 py-0.5 rounded border border-transparent focus:border-slate-300"
                        />
                      </td>

                      {/* Guruh select */}
                      <td className="py-2 px-3">
                        <select
                          value={row.matchedGroupId || defaultGroupId}
                          onChange={(e) =>
                            updateRowField(
                              row.id,
                              "matchedGroupId",
                              e.target.value,
                            )
                          }
                          className="w-full bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded px-1.5 py-1 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                        >
                          <option value="">Guruhsiz</option>
                          {groups.map((g) => (
                            <option key={g.id} value={g.id}>
                              {g.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Notes / Grade */}
                      <td className="py-2 px-3 text-slate-500 max-w-[200px] truncate">
                        {row.parentPhone && (
                          <span className="block font-mono text-[10px] text-indigo-600 dark:text-indigo-400">
                            Ota-ona: {row.parentPhone}
                          </span>
                        )}
                        {row.notes}
                      </td>

                      {/* Delete row */}
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
                  ? `Import qilinmoqda: ${importProgress.done} / ${importProgress.total}...`
                  : `Tizimga saqlashga tayyor`}
              </span>

              <PrimaryButton
                type="button"
                onClick={executeImport}
                disabled={isProcessing || parsedRows.length === 0}
                className="flex items-center gap-2"
              >
                <UserPlus size={16} /> Importni boshlash (
                {parsedRows.filter((r) => r.isValid).length})
              </PrimaryButton>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

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
  Search,
  DollarSign,
  Calendar,
  Building2,
} from "lucide-react";
import { Modal } from "../components/primitives";
import { INPUT_CLS, LABEL_CLS, PrimaryButton } from "../theme/tokens";
import { normalizePhone } from "../utils/helpers";

function parseSalary(salaryStr) {
  if (!salaryStr) return { type: "percent", percent: 50, fixed: 0 };
  const str = String(salaryStr).trim().toLowerCase();

  // Extract digits
  const numMatches = str.match(/\d[\d,.]*/);
  let numVal = 0;
  if (numMatches) {
    numVal = Number(numMatches[0].replace(/[,.]/g, ""));
  }

  if (
    str.includes("foiz") ||
    str.includes("%") ||
    str.includes("percent") ||
    str.includes("ulush")
  ) {
    return {
      type: "percent",
      percent: numVal || 50,
      fixed: 0,
    };
  } else if (
    str.includes("fix") ||
    str.includes("belgilangan") ||
    str.includes("so'm") ||
    str.includes("som")
  ) {
    return {
      type: "fixed",
      percent: 0,
      fixed: numVal || 3000000,
    };
  } else if (numVal > 0 && numVal <= 100) {
    return {
      type: "percent",
      percent: numVal,
      fixed: 0,
    };
  } else if (numVal > 100) {
    return {
      type: "fixed",
      percent: 0,
      fixed: numVal,
    };
  }

  return { type: "percent", percent: 50, fixed: 0 };
}

function cleanPhoneStr(phoneStr) {
  if (!phoneStr) return "";
  const digits = String(phoneStr).replace(/\D/g, "");
  if (digits.length === 9) return `+998${digits}`;
  if (digits.length === 12 && digits.startsWith("998")) return `+${digits}`;
  return phoneStr.trim();
}

function parseTeacherRow(rowArray, branches = []) {
  let rawName = "";
  let rawPhone = "";
  let rawSalary = "";
  let rawBirthDate = "";
  let rawGroups = "";

  if (rowArray.length >= 1) rawName = String(rowArray[0] || "").trim();
  if (rowArray.length >= 2) rawPhone = String(rowArray[1] || "").trim();
  if (rowArray.length >= 3) rawSalary = String(rowArray[2] || "").trim();
  if (rowArray.length >= 4) rawBirthDate = String(rowArray[3] || "").trim();
  if (rowArray.length >= 5) rawGroups = String(rowArray[4] || "").trim();

  // Skip header line
  if (
    rawName.toLowerCase() === "name" ||
    rawName.toLowerCase() === "f.i.o" ||
    rawName.toLowerCase() === "ism" ||
    rawName.toLowerCase() === "ism familiya"
  ) {
    return null;
  }

  const phone = cleanPhoneStr(rawPhone);
  const salInfo = parseSalary(rawSalary);

  return {
    id: `import_tch_${Math.random().toString(36).substring(2, 9)}`,
    name: rawName || "Ismsiz o'qituvchi",
    phone: phone,
    rawSalary: rawSalary,
    salaryType: salInfo.type,
    revenueSharePercent: salInfo.percent,
    fixedSalary: salInfo.fixed,
    birthDate: rawBirthDate || "",
    groupsText: rawGroups || "",
    branchId: branches[0]?.id || "",
    isValid: Boolean(rawName && rawName.length > 1),
  };
}

export function ImportTeachersModal({
  directorData = {},
  opData = {},
  scopeBranches = [],
  onImportSuccess = () => {},
  onClose = () => {},
}) {
  const branches = scopeBranches.length > 0 ? scopeBranches : directorData?.branches || [];

  const [importTab, setImportTab] = useState("text"); // 'text' | 'file'
  const [rawText, setRawText] = useState("");
  const [parsedRows, setParsedRows] = useState([]);
  const [defaultBranchId, setDefaultBranchId] = useState(branches[0]?.id || "");
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
      const item = parseTeacherRow(columns, branches);
      if (item) parsed.push(item);
    });

    setParsedRows(parsed);
    if (parsed.length === 0) {
      setErrorMessage("Tahlil qilish uchun mos ustozlar topilmadi.");
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
            const item = parseTeacherRow(row, branches);
            if (item) parsed.push(item);
          }
        });

        setParsedRows(parsed);
        if (parsed.length === 0) {
          setErrorMessage("Fayldan mos ustoz ma'lumotlari topilmadi.");
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
          phone: row.phone || "",
          salaryType: row.salaryType || "percent",
          revenueSharePercent: Number(row.revenueSharePercent) || 50,
          fixedSalary: Number(row.fixedSalary) || 0,
          birthDate: row.birthDate || "",
          branchId: row.branchId || defaultBranchId || branches[0]?.id || "",
          notes: row.groupsText ? `Guruhlar: ${row.groupsText}` : "",
          rating: 5,
        };

        await onImportSuccess(payload);
        countAdded++;
        setImportProgress({ done: countAdded, total: parsedRows.length });
      }

      setSuccessBanner(`${countAdded} ta ustoz muvaffaqiyatli saqlandi!`);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Import execution error:", err);
      setErrorMessage("O'qituvchilarni saqlashda xatolik yuz berdi.");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <Modal
      title="O'qituvchilarni Excel'dan import qilish"
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
                Excel'dan nusxalangan ustozlar ma'lumotlarini joylang:
              </label>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder={`Misol uchun:\nName\tMobile Number\tSalary [type]\tBirth Date\tGroups\nShaxzod Odilov\t+(998) 90-624-02-04\t50 [Foiz]\t2005-04-02\t4J13 - PRE - IELTS , 4J15 - PRE-CEFR boshi`}
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
                Ustozlar uchun Excel (.xlsx, .xls) yoki CSV faylingizni yuklang
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Ustunlar: Name | Mobile Number | Salary [type] | Birth Date | Groups
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
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                Tahlil qilingan ustozlar: {parsedRows.length} ta
              </span>

              {/* Default branch selector */}
              {branches.length > 0 && (
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 shrink-0">
                    Standart filial:
                  </label>
                  <select
                    value={defaultBranchId}
                    onChange={(e) => setDefaultBranchId(e.target.value)}
                    className={`${INPUT_CLS} text-xs py-1.5 w-auto`}
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Preview Table */}
            <div className="max-h-[300px] overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Ism-Familiya</th>
                    <th className="py-2.5 px-3">Telefon</th>
                    <th className="py-2.5 px-3">Ish haqi turi & Qiymati</th>
                    <th className="py-2.5 px-3">Tug'ilgan sana</th>
                    <th className="py-2.5 px-3">Guruhlari</th>
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

                      {/* Phone */}
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

                      {/* Salary Type & Amount */}
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-1.5">
                          <select
                            value={row.salaryType}
                            onChange={(e) =>
                              updateRowField(row.id, "salaryType", e.target.value)
                            }
                            className="bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded px-1.5 py-1 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                          >
                            <option value="percent">Foiz (%)</option>
                            <option value="fixed">Fixed (so'm)</option>
                          </select>
                          {row.salaryType === "percent" ? (
                            <input
                              type="number"
                              value={row.revenueSharePercent}
                              onChange={(e) =>
                                updateRowField(
                                  row.id,
                                  "revenueSharePercent",
                                  e.target.value,
                                )
                              }
                              className="w-16 bg-slate-50 dark:bg-slate-800 font-mono font-bold text-xs px-1.5 py-1 rounded border border-slate-200 dark:border-slate-700"
                            />
                          ) : (
                            <input
                              type="number"
                              value={row.fixedSalary}
                              onChange={(e) =>
                                updateRowField(
                                  row.id,
                                  "fixedSalary",
                                  e.target.value,
                                )
                              }
                              className="w-24 bg-slate-50 dark:bg-slate-800 font-mono font-bold text-xs px-1.5 py-1 rounded border border-slate-200 dark:border-slate-700"
                            />
                          )}
                        </div>
                      </td>

                      {/* Birth Date */}
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={row.birthDate}
                          onChange={(e) =>
                            updateRowField(row.id, "birthDate", e.target.value)
                          }
                          className="w-full bg-transparent font-mono text-xs text-slate-700 dark:text-slate-300 focus:bg-white dark:focus:bg-slate-800 px-1 py-0.5 rounded border border-transparent focus:border-slate-300"
                        />
                      </td>

                      {/* Groups text */}
                      <td className="py-2 px-3 text-slate-500 max-w-[200px] truncate text-[11px]">
                        {row.groupsText}
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
                <UserPlus size={16} /> Ustozlarni saqlash ({parsedRows.length})
              </PrimaryButton>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

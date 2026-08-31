import React, { useState, useRef } from "react";
import {
  FileSpreadsheet,
  Download,
  Upload,
  ChevronRight,
  ChevronDown,
  FileCode2,
} from "lucide-react";
import { BTN_EXCEL } from "../theme/tokens";
import { MorphDropdown } from "../../../shared/components/MorphDropdown";

/**
 * ExcelActionsModal / ExcelDropdown Component
 * Renders Excel dropdown options using exact iOS/HyperOS MorphDropdown animation.
 */
export function ExcelActionsModal({
  isOpen,
  onClose,
  title = "Excel amallari",
  onExport,
  onImport,
  onTemplate,
  exportLabel = "Excel ga eksport qilish",
  importLabel = "Excel'dan import qilish",
  templateLabel = "Shablon yuklab olish",
  buttonRef,
}) {
  return (
    <MorphDropdown
      isOpen={isOpen}
      onClose={onClose}
      triggerRef={buttonRef}
      align="right"
      className="w-72"
    >
      {/* Options List */}
      <div className="p-1.5 space-y-1">
        {onExport && (
          <button
            type="button"
            onClick={() => {
              onExport();
              onClose();
            }}
            className="morph-menu-item w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 hover:bg-emerald-50/80 dark:hover:bg-emerald-950/40 border border-slate-200/60 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-800/80 text-slate-800 dark:text-slate-200 transition-all group cursor-pointer text-left shadow-2xs active:scale-[0.98]"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all">
                <Download size={16} />
              </div>
              <div>
                <div className="font-semibold text-xs text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                  {exportLabel}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  .xlsx shaklida yuklab olish
                </div>
              </div>
            </div>
            <ChevronRight
              size={14}
              className="text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all"
            />
          </button>
        )}

        {onImport && (
          <button
            type="button"
            onClick={() => {
              onImport();
              onClose();
            }}
            className="morph-menu-item w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 hover:bg-teal-50/80 dark:hover:bg-teal-950/40 border border-slate-200/60 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-800/80 text-slate-800 dark:text-slate-200 transition-all group cursor-pointer text-left shadow-2xs active:scale-[0.98]"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white group-hover:border-teal-600 transition-all">
                <Upload size={16} />
              </div>
              <div>
                <div className="font-semibold text-xs text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">
                  {importLabel}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  Excel/CSV faylidan kiritish
                </div>
              </div>
            </div>
            <ChevronRight
              size={14}
              className="text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all"
            />
          </button>
        )}

        {onTemplate && (
          <button
            type="button"
            onClick={() => {
              onTemplate();
              onClose();
            }}
            className="morph-menu-item w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 hover:bg-blue-50/80 dark:hover:bg-blue-950/40 border border-slate-200/60 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-800/80 text-slate-800 dark:text-slate-200 transition-all group cursor-pointer text-left shadow-2xs active:scale-[0.98]"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all">
                <FileCode2 size={16} />
              </div>
              <div>
                <div className="font-semibold text-xs text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                  {templateLabel}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  Kiritish uchun shablon namunasi
                </div>
              </div>
            </div>
            <ChevronRight
              size={14}
              className="text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all"
            />
          </button>
        )}
      </div>
    </MorphDropdown>
  );
}

/**
 * Props-driven ExcelButton Component
 */
export function ExcelButton({
  children,
  className = "",
  onExport,
  onImport,
  onTemplate,
  exportLabel,
  importLabel,
  templateLabel,
  title = "Excel amallari",
  onClick,
  ...props
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const buttonRef = useRef(null);

  const handleClick = (e) => {
    if (onExport || onImport || onTemplate) {
      setModalOpen((prev) => !prev);
    } else if (onClick) {
      onClick(e);
    }
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleClick}
        className={`${BTN_EXCEL} ${
          modalOpen
            ? "ring-2 ring-emerald-500 ring-offset-2 ring-offset-slate-900 scale-[0.98] brightness-110"
            : ""
        } ${className}`}
        {...props}
      >
        {children || (
          <>
            <FileSpreadsheet size={16} />
            <span>Excel</span>
            {(onExport || onImport || onTemplate) && (
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${
                  modalOpen ? "rotate-180" : ""
                }`}
              />
            )}
          </>
        )}
      </button>

      {(onExport || onImport || onTemplate) && (
        <ExcelActionsModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={title}
          onExport={onExport}
          onImport={onImport}
          onTemplate={onTemplate}
          exportLabel={exportLabel}
          importLabel={importLabel}
          templateLabel={templateLabel}
          buttonRef={buttonRef}
        />
      )}
    </>
  );
}

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileSpreadsheet,
  Download,
  Upload,
  X,
  ChevronRight,
  ChevronDown,
  Sparkles,
  FileCode2,
} from "lucide-react";
import { BTN_EXCEL } from "../theme/tokens";

function getButtonTransform(buttonRect) {
  if (!buttonRect) return { x: 0, y: 0, scale: 0.18 };
  const windowWidth = typeof window !== "undefined" ? window.innerWidth : 1000;
  const windowHeight = typeof window !== "undefined" ? window.innerHeight : 800;

  const buttonCenterX = buttonRect.left + buttonRect.width / 2;
  const buttonCenterY = buttonRect.top + buttonRect.height / 2;

  const screenCenterX = windowWidth / 2;
  const screenCenterY = windowHeight / 2;

  return {
    x: buttonCenterX - screenCenterX,
    y: buttonCenterY - screenCenterY,
    scale: 0.18,
  };
}

/**
 * ExcelActionsModal - HyperOS style smooth expanding modal centered on screen
 * Originates smoothly from button position to viewport center without opacity fade.
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
  buttonRect = null,
}) {
  const transform = getButtonTransform(buttonRect);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            onClick={onClose}
          />

          {/* HyperOS Modal Box Centered - Expands smoothly from button position with NO opacity fade */}
          <motion.div
            initial={{
              x: transform.x,
              y: transform.y,
              scale: transform.scale,
              opacity: 1,
            }}
            animate={{
              x: 0,
              y: 0,
              scale: 1,
              opacity: 1,
            }}
            exit={{
              x: transform.x,
              y: transform.y,
              scale: transform.scale,
              opacity: 1,
            }}
            transition={{
              duration: 0.36,
              ease: [0.16, 1, 0.3, 1],
            }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-sm bg-white/95 dark:bg-slate-900/95 border border-emerald-500/20 dark:border-emerald-500/30 rounded-2xl shadow-2xl shadow-emerald-950/20 dark:shadow-emerald-950/50 backdrop-blur-xl overflow-hidden origin-center"
          >
            {/* Top Excel Theme Banner Accent */}
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/20">
              <div className="flex items-center gap-3">
                <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/30 flex items-center justify-center">
                  <FileSpreadsheet size={20} />
                  <span className="absolute -bottom-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {title}
                    </h3>
                    <span className="px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 rounded border border-emerald-200 dark:border-emerald-800">
                      XLSX
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Microsoft Excel fayl amallari
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 flex items-center justify-center transition-all cursor-pointer active:scale-95"
              >
                <X size={16} />
              </button>
            </div>

            {/* Options List with Excel Styling */}
            <div className="p-3 space-y-2">
              {onExport && (
                <button
                  type="button"
                  onClick={() => {
                    onExport();
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 hover:bg-emerald-50/80 dark:hover:bg-emerald-950/40 border border-slate-200/60 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-800/80 text-slate-800 dark:text-slate-200 transition-all group cursor-pointer text-left shadow-xs active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all shadow-xs">
                      <Download size={19} />
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                        {exportLabel}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        Ma'lumotlarni .xlsx shaklida yuklab olish
                      </div>
                    </div>
                  </div>
                  <ChevronRight
                    size={16}
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
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 hover:bg-teal-50/80 dark:hover:bg-teal-950/40 border border-slate-200/60 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-800/80 text-slate-800 dark:text-slate-200 transition-all group cursor-pointer text-left shadow-xs active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white group-hover:border-teal-600 transition-all shadow-xs">
                      <Upload size={19} />
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">
                        {importLabel}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        Excel/CSV faylidan bazaga kiritish
                      </div>
                    </div>
                  </div>
                  <ChevronRight
                    size={16}
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
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 hover:bg-blue-50/80 dark:hover:bg-blue-950/40 border border-slate-200/60 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-800/80 text-slate-800 dark:text-slate-200 transition-all group cursor-pointer text-left shadow-xs active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all shadow-xs">
                      <FileCode2 size={19} />
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                        {templateLabel}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        Kiritish uchun standart shablon namunasi
                      </div>
                    </div>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all"
                  />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
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
  const [buttonRect, setButtonRect] = useState(null);
  const buttonRef = useRef(null);

  const handleClick = (e) => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setButtonRect(rect);
    }
    if (onExport || onImport || onTemplate) {
      setModalOpen(true);
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
          buttonRect={buttonRect}
        />
      )}
    </>
  );
}

const fs = require('fs');
const file = 'src/features/admin/pages/PaymentsPage.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'import { useState, useMemo, useRef } from "react";',
  'import { useState, useMemo, useRef, useEffect } from "react";'
);

content = content.replace(
  'FileText,',
  'FileText,\n  MoreVertical,'
);

// We need a state for the active dropdown
content = content.replace(
  'const [deleting, setDeleting] = useState(false);',
  'const [deleting, setDeleting] = useState(false);\n  const [activeDropdown, setActiveDropdown] = useState(null);\n  const dropdownRef = useRef(null);\n\n  useEffect(() => {\n    function handleClickOutside(event) {\n      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {\n        setActiveDropdown(null);\n      }\n    }\n    document.addEventListener("mousedown", handleClickOutside);\n    return () => document.removeEventListener("mousedown", handleClickOutside);\n  }, []);'
);

const oldActions = `<div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {rec.isPaymentRecord && (
                            <>
                              <button
                                onClick={() => setReceiptModalPayment(rec.raw || rec)}
                                className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                title="Chop etish (Chek)"
                              >
                                <Printer size={14} />
                              </button>
                              <button
                                onClick={() => openModal && openModal("payment", { editMode: true, ...rec })}
                                className="p-1.5 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-colors"
                                title="Tahrirlash"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                              </button>
                              <button
                                onClick={() => setDeleteConfirmPayment(rec)}
                                className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                                title="O'chirish"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                          {!rec.isPaymentRecord && (
                            <button
                              onClick={() => goTo && goTo("debtors")}
                              className="p-1.5 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                              title="To'lov qilish"
                            >
                              <CreditCard size={14} />
                            </button>
                          )}
                        </div>`;

const newActions = `<div className="relative flex justify-end" ref={activeDropdown === rec.id ? dropdownRef : null}>
                          <button
                            onClick={() => setActiveDropdown(activeDropdown === rec.id ? null : rec.id)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <MoreVertical size={16} />
                          </button>
                          
                          {activeDropdown === rec.id && (
                            <div className="absolute right-0 top-8 w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg py-1 z-50 overflow-hidden">
                              {rec.isPaymentRecord ? (
                                <>
                                  <button
                                    onClick={() => { setReceiptModalPayment(rec.raw || rec); setActiveDropdown(null); }}
                                    className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                                  >
                                    <Printer size={14} className="text-blue-500" />
                                    Chop etish
                                  </button>
                                  <button
                                    onClick={() => { if(openModal) openModal("payment", { editMode: true, ...rec }); setActiveDropdown(null); }}
                                    className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                    Tahrirlash
                                  </button>
                                  <div className="h-px bg-slate-100 dark:bg-slate-700 my-1"></div>
                                  <button
                                    onClick={() => { setDeleteConfirmPayment(rec); setActiveDropdown(null); }}
                                    className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center gap-2"
                                  >
                                    <Trash2 size={14} />
                                    O'chirish
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => { if(goTo) goTo("debtors"); setActiveDropdown(null); }}
                                  className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                                >
                                  <CreditCard size={14} className="text-indigo-500" />
                                  To'lov qilish
                                </button>
                              )}
                            </div>
                          )}
                        </div>`;

content = content.replace(oldActions, newActions);

fs.writeFileSync(file, content);

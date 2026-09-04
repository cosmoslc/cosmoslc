const fs = require('fs');
const file = 'src/features/admin/pages/PaymentsPage.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace table headers
content = content.replace(
  /<thead[\s\S]*?<\/thead>/,
  `<thead className="sticky top-0 z-10 bg-slate-50/90 dark:bg-slate-800/90 backdrop-blur-xs">
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold">
                <th className="py-2.5 px-3 w-10 text-center">Tr</th>
                <th className="py-2.5 px-3">Sana</th>
                <th className="py-2.5 px-3">Ism Familiya</th>
                <th className="py-2.5 px-3">Narx</th>
                <th className="py-2.5 px-3">To'lov usuli</th>
                <th className="py-2.5 px-3">O'qituvchilar</th>
                <th className="py-2.5 px-3">Guruh</th>
                <th className="py-2.5 px-3">Xodim</th>
                <th className="py-2.5 px-3 text-right">Amallar</th>
              </tr>
            </thead>`
);

// Replace table body row
content = content.replace(
  /<td className="py-2 px-3 text-center font-mono text-slate-400 text-\[11px\]">[\s\S]*?<\/td>/,
  `<td className="py-2 px-3 text-center font-mono text-slate-400 text-[11px]">{rowNumber}</td>`
);

content = content.replace(
  /<td className="py-2 px-3">[\s\S]*?<div className="flex items-center gap-2">[\s\S]*?<div className="flex-1">[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/td>/,
  `<td className="py-2 px-3 text-slate-900 dark:text-white font-mono text-xs">{rec.date}</td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <div className="font-bold text-[13px] text-slate-900 dark:text-white">
                              {rec.studentName}
                            </div>
                          </div>
                        </div>
                      </td>`
);

// Note: the previous replacement will just work if it matches. It's better to just write a script to replace the whole tbody inner rendering.

fs.writeFileSync('fix_table2.cjs', `
const fs = require('fs');
const file = 'src/features/admin/pages/PaymentsPage.jsx';
let content = fs.readFileSync(file, 'utf8');

const oldTr = \`                    <tr
                      key={rec.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                    >\`;

let newTr = \`                    <tr
                      key={rec.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      <td className="py-2 px-3 text-center font-mono text-slate-400 text-[11px]">
                        {rowNumber}
                      </td>
                      <td className="py-2 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                        {rec.date}
                      </td>
                      <td className="py-2 px-3">
                        <div className="font-bold text-[13px] text-slate-900 dark:text-white">
                          {rec.studentName}
                        </div>
                        {rec.studentPhone && (
                          <div className="text-[10px] text-slate-500">
                            {rec.studentPhone}
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        <div className="font-bold text-[13px] text-emerald-600 dark:text-emerald-400">
                          {money(rec.amount)}
                        </div>
                      </td>
                      <td className="py-2 px-3 text-slate-600 dark:text-slate-300">
                        {METHOD_OPTIONS.find((m) => m.value === rec.method)?.icon || "💵"} {METHOD_OPTIONS.find((m) => m.value === rec.method)?.label || "Naqd"}
                      </td>
                      <td className="py-2 px-3 text-slate-700 dark:text-slate-200 text-xs">
                        {rec.teacherName}
                      </td>
                      <td className="py-2 px-3">
                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {rec.groupName}
                        </div>
                      </td>
                      <td className="py-2 px-3 text-xs text-slate-500 dark:text-slate-400">
                        {rec.staffName}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                        </div>
                      </td>
                    </tr>\`;

let startIndex = content.indexOf(oldTr);
let endIndex = content.indexOf('</tr>', startIndex) + 5;
if (startIndex !== -1) {
  content = content.substring(0, startIndex) + newTr + content.substring(endIndex);
}

fs.writeFileSync(file, content);
`);


import fs from 'fs';
let content = fs.readFileSync('src/features/admin/pages/DebtorsPage.jsx', 'utf8');
content = content.replace(/const allStudents = useMemo[^\n]+\n/g, "");
content = content.replace(
  "  const allPayments = useMemo(() => directorData?.payments || opData?.payments || [], [directorData?.payments, opData?.payments]);",
  "  const allStudents = useMemo(() => opData?.students || directorData?.students || [], [opData?.students, directorData?.students]);\n  const allPayments = useMemo(() => directorData?.payments || opData?.payments || [], [directorData?.payments, opData?.payments]);"
);
fs.writeFileSync('src/features/admin/pages/DebtorsPage.jsx', content);

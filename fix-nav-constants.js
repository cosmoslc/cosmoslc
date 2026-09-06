import fs from 'fs';
let content = fs.readFileSync('src/features/teacher/utils/constants.jsx', 'utf8');

content = content.replace(
/export const NAV_ITEMS = \[[\s\S]*?\];/,
`export const NAV_ITEMS = [
  { id: "dashboard", label: "Asosiy" },
  { id: "groups", label: "Guruhlar" },
  { id: "analytics", label: "Statistika" },
  { id: "students", label: "O'quvchilar" },
];`
);

fs.writeFileSync('src/features/teacher/utils/constants.jsx', content);

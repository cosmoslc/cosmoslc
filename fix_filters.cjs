const fs = require('fs');
const file = 'src/features/admin/pages/PaymentsPage.jsx';
let content = fs.readFileSync(file, 'utf8');

const oldGrid = `<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">`;
const newGrid = `
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-3">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }}
            className={\`\${INPUT_CLS} text-xs\`}
            title="Sanadan"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }}
            className={\`\${INPUT_CLS} text-xs\`}
            title="Sanagacha"
          />
          <select
            value={teacherFilter}
            onChange={(e) => { setTeacherFilter(e.target.value); setCurrentPage(1); }}
            className={\`\${INPUT_CLS} text-xs\`}
          >
            <option value="all">Barcha o'qituvchilar</option>
            {allTeachers.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <select
            value={staffFilter}
            onChange={(e) => { setStaffFilter(e.target.value); setCurrentPage(1); }}
            className={\`\${INPUT_CLS} text-xs\`}
          >
            <option value="all">Barcha xodimlar</option>
            <option value="Admin">Admin</option>
            {allManagers.map((m) => (
              <option key={m.id} value={m.name}>{m.name}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
`;

content = content.replace(oldGrid, newGrid);
fs.writeFileSync(file, content);

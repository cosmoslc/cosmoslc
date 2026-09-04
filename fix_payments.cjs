const fs = require('fs');
const file = 'src/features/admin/pages/PaymentsPage.jsx';
let content = fs.readFileSync(file, 'utf8');

// Add new state variables
content = content.replace(
  'const [groupFilter, setGroupFilter] = useState("all");',
  `const [groupFilter, setGroupFilter] = useState("all");\n  const [teacherFilter, setTeacherFilter] = useState("all");\n  const [staffFilter, setStaffFilter] = useState("all");\n  const [dateFrom, setDateFrom] = useState("");\n  const [dateTo, setDateTo] = useState("");`
);

// Add clear filters
content = content.replace(
  'setGroupFilter("all");',
  `setGroupFilter("all");\n    setTeacherFilter("all");\n    setStaffFilter("all");\n    setDateFrom("");\n    setDateTo("");`
);

// Add allTeachers & allManagers
content = content.replace(
  'const scopeBranchIds = useMemo(() => {',
  `const allTeachers = useMemo(() => directorData?.teachersHR || opData?.teachersHR || [], [directorData?.teachersHR, opData?.teachersHR]);\n  const allManagers = useMemo(() => directorData?.managers || opData?.managers || [], [directorData?.managers, opData?.managers]);\n  const scopeBranchIds = useMemo(() => {`
);

// Add teacherName and staffName to allEnrichedRecords
content = content.replace(
  'courseName: course?.name || "Kurs",',
  `courseName: course?.name || "Kurs",\n        teacherId: group?.teacherHrId || group?.teacherId || null,\n        teacherName: allTeachers.find(t => String(t.id) === String(group?.teacherHrId || group?.teacherId))?.name || "Noma'lum",\n        staffName: "Admin",`
);

// Filter additions
content = content.replace(
  '// 6. Group Filter',
  `// Date From Filter
      if (dateFrom && rec.date < dateFrom) return false;
      // Date To Filter
      if (dateTo && rec.date > dateTo) return false;
      // Search (Name)
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!rec.studentName?.toLowerCase().includes(q)) return false;
      }
      // Teacher Filter
      if (teacherFilter !== "all" && String(rec.teacherId) !== String(teacherFilter)) return false;
      // Staff Filter (Dummy since we hardcoded "Admin")
      if (staffFilter !== "all" && rec.staffName !== staffFilter) return false;

      // 6. Group Filter`
);

// Remove the old Search filter in filteredRecords (because we added name specific, but wait, let's keep the existing one if it is there)
content = content.replace(
  /if \(searchQuery\) \{[\s\S]*?return false;\n\s*\}/g,
  `if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = rec.studentName?.toLowerCase().includes(q);
        const matchesPhone = rec.studentPhone?.toLowerCase().includes(q);
        const matchesNote = rec.comment?.toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesNote) return false;
      }`
);

fs.writeFileSync(file, content);

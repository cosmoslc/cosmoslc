import fs from 'fs';
let content = fs.readFileSync('src/features/admin/pages/DebtorsPage.jsx', 'utf8');

if (!content.includes('calculateStudentGroupFee')) {
  content = content.replace(
    'import { INPUT_CLS, PrimaryButton } from "../theme/tokens";',
    'import { INPUT_CLS, PrimaryButton } from "../theme/tokens";\nimport { calculateStudentGroupFee } from "../../../shared/utils/prorata";'
  );
}

content = content.replace(
/  const allDebtorRows = useMemo\(\(\) => \{[\s\S]*?  \}, \[allStudents, groups, currentDay\]\);/,
`  const allDebtorRows = useMemo(() => {
    const rows = [];
    allStudents.forEach(s => {
      if (s.status === "left") return;

      let totalDebt = 0;
      let totalFee = 0;
      let isPartial = false;
      const studentGroups = groups.filter(g => (s.groupIds || []).includes(g.id));
      
      studentGroups.forEach(g => {
        const membership = s?.groupMemberships?.[g.id] || s?.groupMemberships?.[String(g.id)] || s;
        const prorataInfo = calculateStudentGroupFee({
          fullMonthlyFee: g.price || 0,
          groupDays: g.days || ["Dush", "Chor", "Juma"],
          monthStr: currentMonth,
          membership,
          student: s,
          group: g,
          attendances: opData?.attendance || directorData?.attendance || []
        });

        const fee = prorataInfo.calculatedFee || 0;
        if (fee <= 0) return;

        const groupPayments = allPayments.filter(p => 
          String(p.studentId) === String(s.id) && 
          String(p.groupId) === String(g.id) &&
          String(p.month) === currentMonth
        );
        const paidForGroup = groupPayments.reduce((sum, p) => 
          sum + Number(p.amount || 0) + Number(p.usedBalance || 0) + Number(p.discount || 0), 0
        );
        
        const debtForGroup = Math.max(0, fee - paidForGroup);
        if (debtForGroup > 0) {
          totalDebt += debtForGroup;
          totalFee += fee;
          if (paidForGroup > 0) isPartial = true;
        }
      });

      if (totalDebt > 0) {
        // As per user request, don't show those who have positive overall balance enough to cover
        // the debt, BUT wait, if they have +38 balance they might not show up anyway because we should subtract balance?
        // Wait! The user says "talabalrda balasni 38+ bor". Does that mean their s.balance is 380,000 and we should subtract it from the debt?
        // Yes, currentBalance covers the debt!
        const currentBalance = Number(s.balance || 0);
        let finalDebt = totalDebt;
        if (currentBalance > 0) {
           finalDebt = Math.max(0, totalDebt - currentBalance);
        }
        
        if (finalDebt > 0) {
          const isDueToday = currentDay === 10;
          const isOverdue = currentDay > 10;
          
          let severity = "normal";
          if (isOverdue) severity = "overdue";
          else if (isPartial) severity = "partial";

          rows.push({
            id: s.id,
            studentId: s.id,
            studentName: s.name,
            studentPhone: s.phone || "",
            parentName: s.parentName || "Ota-onasi",
            parentPhone: s.parentPhone || s.phone || "",
            groupNames: studentGroups.map(g => g.name).join(", ") || "Guruhsiz",
            groupIds: studentGroups.map(g => g.id),
            teacherIds: studentGroups.map(g => g.teacherId).filter(Boolean),
            debtAmount: finalDebt,
            debtNote: s.debtNote || null,
            addedDate: s.createdAt || s.added_at || "",
            severity,
            isDueToday,
            isOverdue,
            isPartial,
            groupColor: studentGroups[0]?.color || "#6366f1",
          });
        }
      }
    });
    return rows;
  }, [allStudents, groups, allPayments, currentMonth, currentDay, opData?.attendance, directorData?.attendance]);`
);
fs.writeFileSync('src/features/admin/pages/DebtorsPage.jsx', content);

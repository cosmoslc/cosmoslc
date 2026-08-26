// Verified byte-for-byte identical across director/manager/teacher/student
// before being extracted here.

export const GROUP_COLORS = ["#f43f5e", "#f59e0b", "#10b981", "#0ea5e9", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#84cc16"];

export function nextGroupColor(groups) {
  return GROUP_COLORS[groups.length % GROUP_COLORS.length];
}

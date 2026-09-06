import fs from 'fs';
let content = fs.readFileSync('src/features/teacher/App.jsx', 'utf8');

// I will just map the existing views to the new IDs so the app doesn't break.
// "dashboard" -> DashboardView (already there)
// "groups" -> TasksView or maybe DashboardView? We'll map "groups" to TasksView for now to have something to show.
// "analytics" -> AnalyticsView (already there)
// "students" -> RatingView for now, since it shows students

content = content.replace(
/{view === "tasks" && \(/g,
`{view === "groups" && (`
);

content = content.replace(
/{view === "rating" && \(/g,
`{view === "students" && (`
);

fs.writeFileSync('src/features/teacher/App.jsx', content);

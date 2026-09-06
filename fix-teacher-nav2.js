import fs from 'fs';
let content = fs.readFileSync('src/features/teacher/layout/Layout.jsx', 'utf8');

content = content.replace(
/className={\`main-sidebar \$\{collapsed \? "collapsed" : ""\} \$\{mobileOpen \? "mobile-open" : ""\}\`}/g,
`className={\`main-sidebar \${collapsed ? "collapsed" : ""} \${mobileOpen ? "mobile-open" : ""} hidden md:flex\`}`
);

// We should also remove the mobile hamburger menu icon on the top bar.
content = content.replace(
/<button\s+className="btn-icon mobile-menu-btn md:hidden"\s+onClick=\{.*\}\s+>\s+<Menu size=\{20\} \/>\s+<\/button>/,
`{/* Hamburger hidden on mobile since we use bottom nav */}`
);

fs.writeFileSync('src/features/teacher/layout/Layout.jsx', content);

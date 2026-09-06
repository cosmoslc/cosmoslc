import fs from 'fs';
let content = fs.readFileSync('src/features/teacher/layout/Layout.jsx', 'utf8');

// The replacement above failed because the actual class might be slightly different.
// Let's replace the whole sidebar div line.
content = content.replace(
/className={\`main-sidebar \$\{collapsed \? "collapsed" : ""\} \$\{mobileOpen \? "mobile-open" : ""\}\`}/g,
`className={\`main-sidebar \${collapsed ? "collapsed" : ""} \${mobileOpen ? "mobile-open" : ""} hidden md:flex\`}`
);

fs.writeFileSync('src/features/teacher/layout/Layout.jsx', content);

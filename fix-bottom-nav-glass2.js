import fs from 'fs';
let content = fs.readFileSync('src/styles/global.css', 'utf8');

// Replace light mode background
content = content.replace(
  /background: rgba\(255, 255, 255, 0\.2\); \/\* Slightly more visible on light mode \*\//g,
  'background: rgba(255, 255, 255, 0.05); /* True transparent glass */'
);

// Remove the `saturate` and `contrast` completely and use just blur to prevent blowing out background colors.
// I already did this, so it should be just blur(16px).

// Fix the active state color syntax
content = content.replace(
  /color: #0ea5e9; \/\* Light blue active \*\/ \/\* slate-900 \*\//g,
  'color: #0f172a; /* slate-900 */'
);

content = content.replace(
  /\.glass-bottom-nav button\.active \{\n\s+background: rgba\(0, 0, 0, 0\.08\);\n\s+color: #0ea5e9; \/\* Light blue active \*\//g,
  '.glass-bottom-nav button.active {\n  background: rgba(0, 0, 0, 0.08);\n  color: #0ea5e9;'
);


fs.writeFileSync('src/styles/global.css', content);

import fs from 'fs';

let content = fs.readFileSync('src/styles/global.css', 'utf8');

content = content.replace(
  /backdrop-filter: blur\(12px\) saturate\(180%\) contrast\(200%\);/g,
  'backdrop-filter: blur(16px);'
);
content = content.replace(
  /-webkit-backdrop-filter: blur\(12px\) saturate\(180%\) contrast\(200%\);/g,
  '-webkit-backdrop-filter: blur(16px);'
);

content = content.replace(
  /color: rgba\(15, 23, 42, 0\.7\); \/\* slate-900 with opacity \*\//g,
  'color: #64748b; /* slate-500 */'
);

content = content.replace(
  /color: rgba\(15, 23, 42, 0\.95\);/g,
  'color: #0f172a; /* slate-900 */'
);

content = content.replace(
  /color: #0f172a;/g, // For active state
  'color: #0ea5e9; /* Light blue active */'
);

content = content.replace(
  /background: rgba\(255, 255, 255, 0\.08\); \/\* Transparent glass \*\//g,
  'background: rgba(255, 255, 255, 0.2); /* Slightly more visible on light mode */'
);

// Dark mode overrides
const darkModeOverrides = `

.dark .glass-bottom-nav {
  background: rgba(15, 23, 42, 0.4);
  border-color: rgba(255, 255, 255, 0.1);
}

.dark .glass-bottom-nav button {
  color: rgba(255, 255, 255, 0.5);
}

.dark .glass-bottom-nav button:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.95);
}

.dark .glass-bottom-nav button.active {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
}
`;

if (!content.includes('.dark .glass-bottom-nav')) {
  content += darkModeOverrides;
}

fs.writeFileSync('src/styles/global.css', content);

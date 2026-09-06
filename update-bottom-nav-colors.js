import fs from 'fs';

let content = fs.readFileSync('src/styles/global.css', 'utf8');

// Replace white color with slate/black
content = content.replace(
  /color: rgba\(255, 255, 255, 0\.7\);/g,
  'color: rgba(15, 23, 42, 0.7); /* slate-900 with opacity */'
);

content = content.replace(
  /color: rgba\(255, 255, 255, 0\.95\);/g,
  'color: rgba(15, 23, 42, 0.95);'
);

content = content.replace(
  /color: #fff;/g,
  'color: #0f172a;'
);

// The active background currently is: background: rgba(255, 255, 255, 0.25);
// Let's change it to a subtle dark tint for the active tab so it looks right on white transparent glass.
content = content.replace(
  /background: rgba\(255, 255, 255, 0\.25\);/g,
  'background: rgba(0, 0, 0, 0.08);'
);

// hover background
content = content.replace(
  /background-color: rgba\(255, 255, 255, 0\.15\);/g,
  'background-color: rgba(0, 0, 0, 0.05);'
);

// The drop shadow for active
content = content.replace(
  /box-shadow: inset 0 2px 4px rgba\(0,0,0,0\.1\);/g,
  'box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);'
);

fs.writeFileSync('src/styles/global.css', content);

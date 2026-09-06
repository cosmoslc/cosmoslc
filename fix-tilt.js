import fs from 'fs';
let content = fs.readFileSync('src/styles/global.css', 'utf8');

content = content.replace(
  /transform: rotate\(2deg\);/g,
  'transform: scale(1.05); /* rotate olib tashlandi */'
);

fs.writeFileSync('src/styles/global.css', content);

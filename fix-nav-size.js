import fs from 'fs';
let content = fs.readFileSync('src/styles/global.css', 'utf8');

// Update .menu
content = content.replace(
  /padding: 8px;\s*border-radius: 99rem;\s*display: flex;\s*justify-content: center;\s*gap: 8px;/g,
  'padding: 6px;\n  border-radius: 99rem;\n  display: flex;\n  justify-content: center;\n  gap: 4px;'
);

// Update .menu button
content = content.replace(
  /padding: 10px 6px;/g,
  'padding: 8px 4px;'
);

// Update .menu button svg
content = content.replace(
  /width: 1\.4rem;\s*height: 1\.4rem;/g,
  'width: 1.25rem;\n  height: 1.25rem;'
);

// Update .menu button span
content = content.replace(
  /font-size: 0\.8rem;\s*font-weight: 600;\s*line-height: 1;\s*margin-top: 4px;/g,
  'font-size: 0.7rem;\n  font-weight: 600;\n  line-height: 1;\n  margin-top: 2px;'
);

fs.writeFileSync('src/styles/global.css', content);

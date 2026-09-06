import fs from 'fs';
let content = fs.readFileSync('src/styles/global.css', 'utf8');

// The user provided the exact CSS they want for `.menu`.
// I will append it and remove `.glass-bottom-nav`.

const startIndex = content.indexOf('.glass-bottom-nav {');
let newContent = content;
if (startIndex !== -1) {
  // Find where it ends
  const endIndex = content.indexOf('/*', startIndex); // wait, it might end at the end of file
  // Actually, I'll just remove the whole bottom nav section.
  const commentIndex = content.indexOf('/* ==========================================================================');
  if (commentIndex !== -1) {
    newContent = content.substring(0, commentIndex);
  }
}

newContent += `
/* ==========================================================================
   MOBILE BOTTOM NAV (Uiverse.io by mymiamo)
   ========================================================================== */
.menu {
  width: calc(100% - 20px);
  max-width: 520px;
  backdrop-filter: blur(12px) saturate(140%);
  -webkit-backdrop-filter: blur(12px) saturate(140%);
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
  padding: 8px;
  border-radius: 99rem;
  display: flex;
  justify-content: center;
  gap: 8px;
  z-index: 50;
  margin: 0 auto;
  position: relative;
}

.menu::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow:
    inset 2px 2px 5px -2px rgba(255, 255, 255, 0.5),
    inset -2px -2px 5px 2px rgba(255, 255, 255, 0.5),
    inset 0 -2px 0 rgba(255, 255, 255, 0.3);
  pointer-events: none;
  z-index: -1;
}

.menu button {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1 1 0;
  min-width: 0;
  color: rgba(30, 30, 30, 0.9);
  text-decoration: none;
  padding: 10px 6px;
  border-radius: 999rem;
  -webkit-tap-highlight-color: transparent;
  background: transparent;
  border: none;
  cursor: pointer;
  transition:
    background 0.18s cubic-bezier(0.34, 1.56, 0.64, 1),
    color 0.18s cubic-bezier(0.34, 1.56, 0.64, 1),
    transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.3s ease-in-out;
}

.menu button:hover {
  background-color: rgba(255, 255, 255, 0.3);
  box-shadow:
    inset 2px 2px 5px -2px rgba(255, 255, 255, 0.4),
    inset -2px -1px 5px 0 rgba(255, 255, 255, 0.4),
    inset 0 -2px 0 rgba(255, 255, 255, 0.2);
  transform: rotate(2deg);
  color: rgba(0, 122, 255, 0.7);
}

.menu button svg {
  width: 1.4rem;
  height: 1.4rem;
}

.menu button span {
  font-size: 0.8rem;
  font-weight: 600;
  line-height: 1;
  margin-top: 4px;
}

.menu button.active {
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.5),
    inset 0 -1px 0 rgba(255, 255, 255, 0.1),
    inset 0 0 4px 2px rgba(255, 255, 255, 0.2);
  color: rgba(0, 122, 255, 0.95);
}

.menu button.active::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.8),
    transparent
  );
}

.menu button.active::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 1px;
  height: 100%;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.8),
    transparent,
    rgba(255, 255, 255, 0.3)
  );
}

.menu button:active {
  transform: scale(0.98);
}

.dark .menu button {
  color: rgba(255, 255, 255, 0.8);
}
.dark .menu button.active {
  color: #fff;
}
.dark .menu button:hover {
  color: #fff;
}
`;
fs.writeFileSync('src/styles/global.css', newContent);

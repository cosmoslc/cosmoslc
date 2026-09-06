import fs from 'fs';
let content = fs.readFileSync('src/styles/global.css', 'utf8');

const navStart = content.indexOf('.glass-bottom-nav {');
if (navStart !== -1) {
  content = content.substring(0, navStart) + `
.glass-bottom-nav {
  width: calc(100% - 20px);
  max-width: 520px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 8px;
  border-radius: 99rem;
  display: flex;
  justify-content: center;
  gap: 8px;
  z-index: 50;
  margin: 0 auto;
}

.glass-bottom-nav::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow:
    inset 2px 2px 5px -2px rgba(255, 255, 255, 0.3),
    inset -2px -2px 5px 2px rgba(255, 255, 255, 0.1),
    inset 0 -2px 0 rgba(255, 255, 255, 0.1);
  pointer-events: none;
  z-index: -1;
}

.glass-bottom-nav button {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1 1 0;
  min-width: 0;
  color: #475569; /* slate-600 */
  text-decoration: none;
  padding: 10px 6px;
  border-radius: 999rem;
  -webkit-tap-highlight-color: transparent;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  background: transparent;
  border: none;
  cursor: pointer;
}

.glass-bottom-nav button:hover {
  background-color: rgba(0, 0, 0, 0.03);
  box-shadow:
    inset 2px 2px 5px -2px rgba(255, 255, 255, 0.4),
    inset -2px -1px 5px 0 rgba(255, 255, 255, 0.2),
    inset 0 -2px 0 rgba(255, 255, 255, 0.2);
  transform: rotate(2deg);
  color: #0f172a;
}

.glass-bottom-nav button svg {
  width: 1.4rem;
  height: 1.4rem;
}

.glass-bottom-nav button span {
  font-size: 0.7rem;
  font-weight: 600;
  line-height: 1;
  margin-top: 4px;
}

.glass-bottom-nav button.active {
  background: rgba(0, 0, 0, 0.05);
  color: #0ea5e9; /* Light blue */
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
}

.glass-bottom-nav button:active {
  transform: scale(0.95);
}

.dark .glass-bottom-nav {
  background: rgba(15, 23, 42, 0.2);
  border-color: rgba(255, 255, 255, 0.1);
}

.dark .glass-bottom-nav button {
  color: rgba(255, 255, 255, 0.5);
}

.dark .glass-bottom-nav button:hover {
  background-color: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.95);
}

.dark .glass-bottom-nav button.active {
  background: rgba(255, 255, 255, 0.1);
  color: #38bdf8;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
}
`;
}
fs.writeFileSync('src/styles/global.css', content);

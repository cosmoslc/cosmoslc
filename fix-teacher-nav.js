import fs from 'fs';
let content = fs.readFileSync('src/features/teacher/layout/Layout.jsx', 'utf8');

content = content.replace(
/        <\/main>\n      <\/div>\n    <\/div>\n  \);\n}/,
`        </main>
        
        {/* Liquid Glass Mobile Bottom Nav */}
        <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 w-full px-2 z-[90]">
          <div className="glass-bottom-nav">
             {items.slice(0, 5).map((item) => (
                <button 
                  key={item.id}
                  className={view === item.id ? 'active' : ''}
                  onClick={() => goTo(item.id)}
                >
                  {renderNavIcon(item.icon, 24)}
                  <span>{item.label}</span>
                </button>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}`
);

fs.writeFileSync('src/features/teacher/layout/Layout.jsx', content);

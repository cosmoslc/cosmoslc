import React, { useState, useRef } from "react";
import {
  Building2,
  GraduationCap,
  BookOpen,
  ChevronDown,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { MorphDropdown } from "./MorphDropdown";

export function PortalSwitcher({ currentPortal = "admin" }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);

  const portals = [
    {
      id: "admin",
      label: "Boshqaruv CRM",
      sublabel: "Direktor & Menejer",
      url: "/admin.html",
      icon: Building2,
      color: "from-blue-600 to-indigo-600",
      activeBg: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300",
      accent: "text-indigo-600 dark:text-indigo-400",
    },
    {
      id: "teacher",
      label: "Ustoz Paneli",
      sublabel: "Darslar & Davomat",
      url: "/teacher.html",
      icon: BookOpen,
      color: "from-emerald-600 to-teal-600",
      activeBg: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
      accent: "text-emerald-600 dark:text-emerald-400",
    },
    {
      id: "student",
      label: "O'quvchi Portali",
      sublabel: "Vazifalar & Reyting",
      url: "/student.html",
      icon: GraduationCap,
      color: "from-amber-500 to-orange-600",
      activeBg: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
      accent: "text-amber-600 dark:text-amber-400",
    },
  ];

  const current = portals.find((p) => p.id === currentPortal) || portals[0];
  const CurrentIcon = current.icon;

  return (
    <div className="relative inline-block text-left">
      <button
        ref={btnRef}
        type="button"
        id="portal-switcher-btn"
        onClick={() => setOpen((prev) => !prev)}
        className="h-[38px] px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all flex items-center gap-2 shadow-2xs cursor-pointer group"
        title="Boshqa panelga o'tish"
      >
        <span
          className={`w-5 h-5 rounded-lg flex items-center justify-center text-white text-[11px] font-bold bg-gradient-to-br ${current.color} shadow-2xs shrink-0 group-hover:scale-105 transition-transform`}
        >
          <CurrentIcon size={12} />
        </span>
        <span className="hidden sm:inline font-bold text-slate-800 dark:text-slate-200">
          {current.label}
        </span>
        <ChevronDown
          size={14}
          className={`text-slate-400 dark:text-slate-500 transition-transform duration-200 shrink-0 ${
            open ? "rotate-180 text-indigo-600 dark:text-indigo-400" : ""
          }`}
        />
      </button>

      <MorphDropdown
        isOpen={open}
        onClose={() => setOpen(false)}
        triggerRef={btnRef}
        align="right"
        className="w-72"
      >
        <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/80 mb-1.5 flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Ekotizim Portallari
          </span>
          <a
            href="/index.html"
            className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            Bosh sahifa <ExternalLink size={10} />
          </a>
        </div>

        <div className="space-y-1">
          {portals.map((portal) => {
            const Icon = portal.icon;
            const isSelected = portal.id === currentPortal;
            return (
              <a
                key={portal.id}
                href={portal.url}
                className={`morph-menu-item w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-all no-underline ${
                  isSelected
                    ? `${portal.activeBg} font-bold ring-1 ring-inset ring-slate-300 dark:ring-slate-700`
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-white bg-gradient-to-br ${portal.color} shadow-xs shrink-0`}
                  >
                    <Icon size={14} />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold leading-tight text-slate-900 dark:text-slate-100">
                      {portal.label}
                    </div>
                    <div className="text-[10px] text-slate-400 font-normal leading-tight mt-0.5">
                      {portal.sublabel}
                    </div>
                  </div>
                </div>
                {isSelected ? (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-white/80 dark:bg-slate-800 shadow-2xs">
                    Hozirgi
                  </span>
                ) : (
                  <ArrowRight size={14} className="text-slate-400 opacity-60" />
                )}
              </a>
            );
          })}
        </div>

        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 px-2 py-1 flex items-center justify-between text-[11px] text-slate-400">
          <span>Yagona Supabase bazasi</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
        </div>
      </MorphDropdown>
    </div>
  );
}

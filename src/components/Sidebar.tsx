import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Link2,
  FileSpreadsheet,
  UserPlus,
  History,
  Zap,
  Layers,
  X,
} from "lucide-react";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const navItems = [
    { label: "Dashboard", path: "/", icon: LayoutDashboard },
    { label: "Connections Hub", path: "/connections", icon: Link2 },
    { label: "CSV Ingestion", path: "/csv-ingest", icon: FileSpreadsheet },
    // { label: "Client Invites", path: "/invites", icon: UserPlus },
    // { label: "Sync Operations", path: "/sync-logs", icon: History },
  ];

  return (
    <aside
      className={`w-64 glass-panel border-r border-dark-border flex flex-col h-screen fixed left-0 top-0 z-40 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
      }`}
    >
      {/* Brand Logo & Mobile Close */}
      <div className="p-5 sm:p-6 border-b border-dark-border/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-glow-indigo shrink-0">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-cyan-400">
              Chasr
            </h1>
            <p className="text-[10px] uppercase font-mono tracking-widest text-cyan-400/90 font-bold">
              Sync Engine v1.0
            </p>
          </div>
        </div>

        {/* Mobile Close Button */}
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-dark-hover"
          title="Close Navigation"
          aria-label="Close Navigation"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-mono tracking-wider text-dark-muted uppercase">
          Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => onClose?.()}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-brand-600/30 to-cyan-500/10 text-white border border-brand-500/40 shadow-glow-cyan"
                    : "text-slate-400 hover:text-slate-200 hover:bg-dark-hover/70"
                }`
              }
            >
              <Icon className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer System Status */}
      <div className="p-4 m-4 rounded-xl glass-panel border border-cyan-500/20 flex items-center gap-3">
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
        </span>
        <div className="text-xs min-w-0">
          <div className="font-semibold text-slate-200 flex items-center gap-1 truncate">
            <Layers className="w-3 h-3 text-cyan-400 shrink-0" /> Engine Active
          </div>
          <p className="text-[11px] text-slate-400 font-mono truncate">
            Org Scope Active
          </p>
        </div>
      </div>
    </aside>
  );
};

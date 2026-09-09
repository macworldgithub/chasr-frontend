import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, LogOut, User as UserIcon, ShieldCheck } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 border-b border-dark-border/80 glass-panel sticky top-0 z-20 ml-64 flex items-center justify-between px-8">
      {/* Org Identifier Badge */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-card border border-dark-border text-xs font-medium text-slate-300">
          <Building2 className="w-3.5 h-3.5 text-brand-500" />
          <span className="text-slate-400 
          font-mono">Org:</span>
          <span className="font-semibold text-cyan-300 font-mono">{user?.orgId || 'default-org'}</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400 font-medium">
          <ShieldCheck className="w-3 h-3" />
          JWT Scoped
        </div>
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-dark-card/60 border border-dark-border">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-600 to-cyan-500 flex items-center justify-center text-white text-xs font-bold uppercase">
            {user?.username?.[0] || 'U'}
          </div>
          <div className="text-left text-xs">
            <div className="font-semibold text-slate-200">{user?.username}</div>
            <div className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]">{user?.email}</div>
          </div>
        </div>

        <button
          onClick={logout}
          title="Sign Out"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 transition-all duration-200"
        >
          <LogOut className="w-3.5 h-3.5" />
          Logout
        </button>
      </div>
    </header>
  );
};

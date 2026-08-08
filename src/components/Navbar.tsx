import React from 'react';
import { ShieldCheck, Wallet, Bell, Sparkles, User, LogOut, Calculator } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onOpenCalculator: () => void;
  onOpenAI: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  onOpenDeposit,
  onOpenWithdraw,
  onOpenCalculator,
  onOpenAI,
}) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/80 dark:bg-slate-900/80 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
            <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
              HENS <span className="text-blue-600 font-extrabold">BEDO</span>
            </span>
            <span className="block text-[10px] font-bold text-slate-400 tracking-widest uppercase -mt-1">
              FINTECH CAPITAL V2
            </span>
          </div>
        </div>

        {/* Action Controls & User Badge */}
        <div className="flex items-center gap-2.5">
          {/* AI Advisor Pill */}
          <button
            onClick={onOpenAI}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-indigo-500/10 to-blue-500/10 text-indigo-600 border border-indigo-200/80 hover:bg-indigo-50 transition-all dark:text-indigo-400 dark:border-indigo-800"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            <span>AI Advisor</span>
          </button>

          {/* Calculator Trigger */}
          <button
            onClick={onOpenCalculator}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all dark:bg-slate-800 dark:text-slate-300"
            title="Yield Calculator"
          >
            <Calculator className="w-4 h-4" />
          </button>

          {/* Balance Pill */}
          {user && (
            <div
              onClick={onOpenDeposit}
              className="cursor-pointer flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-md shadow-slate-900/10 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-black tracking-tight">
                Rs {user.balance.toLocaleString()}
              </span>
            </div>
          )}

          {/* Quick Deposit & Withdraw CTAs */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={onOpenDeposit}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white font-extrabold text-xs hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all"
            >
              Deposit
            </button>
            <button
              onClick={onOpenWithdraw}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-800 font-extrabold text-xs hover:bg-slate-200 transition-all dark:bg-slate-800 dark:text-slate-200"
            >
              Withdraw
            </button>
          </div>

          {/* User Profile / Logout */}
          {user ? (
            <button
              onClick={() => onNavigate('profile')}
              className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-50 text-blue-600 font-extrabold text-xs border border-blue-200 hover:bg-blue-100 transition-all dark:bg-slate-800 dark:text-blue-400 dark:border-slate-700"
              title="Profile & Settings"
            >
              {user.username.substring(0, 2).toUpperCase()}
            </button>
          ) : (
            <button
              onClick={() => onNavigate('auth')}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md"
            >
              Log In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  History,
  Gift,
  Users,
  FileCheck,
  User,
  LogOut,
  Sparkles,
  HelpCircle,
  Headphones,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenAI: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onNavigate, onOpenAI }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'plans', label: 'Invest Plans', icon: TrendingUp, badge: 'Hot' },
    { id: 'transactions', label: 'Wallet Ledger', icon: History },
    { id: 'tasks', label: 'Task Rewards', icon: Gift },
    { id: 'referrals', label: 'Team Network', icon: Users },
    { id: 'documents', label: 'Regulatory Docs', icon: FileCheck },
    { id: 'profile', label: 'Account Profile', icon: User },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200/80 bg-slate-50/50 p-4 shrink-0 min-h-[calc(100vh-4rem)] dark:bg-slate-900/50 dark:border-slate-800">
      {/* User Quick Info */}
      {user && (
        <div className="p-3.5 mb-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm dark:bg-slate-800/80 dark:border-slate-700">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Connected Account
          </div>
          <div className="font-extrabold text-slate-900 text-sm truncate dark:text-white mt-0.5">
            @{user.username}
          </div>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
            <span>Ref Code:</span>
            <span className="font-mono text-blue-600 font-bold dark:text-blue-400">{user.referralCode}</span>
          </div>
        </div>
      )}

      {/* Primary Navigation List */}
      <nav className="space-y-1 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    isActive ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* AI Assistant Banner */}
      <div className="my-4 p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span className="text-xs font-bold">Vertex AI Copilot</span>
        </div>
        <p className="text-[11px] text-slate-300 font-medium mb-3">
          Get real-time yield strategy and risk analytics.
        </p>
        <button
          onClick={onOpenAI}
          className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/30"
        >
          Launch Assistant
        </button>
      </div>

      {/* WhatsApp Community Support */}
      <a
        href="https://whatsapp.com/channel/0029Vb8rWApA89MjWfuzM93a"
        target="_blank"
        rel="noopener noreferrer"
        className="p-3 mb-2 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-900 flex items-center gap-2 text-xs font-bold hover:bg-emerald-100 transition-all dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300"
      >
        <Headphones className="w-4 h-4 text-emerald-600" />
        <span>Official Support Channel</span>
      </a>

      {/* Logout */}
      {user && (
        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-bold text-xs text-rose-600 hover:bg-rose-50 transition-all dark:text-rose-400 dark:hover:bg-rose-950/40"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      )}
    </aside>
  );
};

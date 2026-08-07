import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  Plus,
  History,
  Gift,
  Users,
} from 'lucide-react';

interface MobileNavProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onQuickAction: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentTab,
  onNavigate,
  onQuickAction,
}) => {
  return (
    <div className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-md">
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 text-white rounded-2xl px-3 py-2 shadow-2xl flex items-center justify-around">
        <button
          onClick={() => onNavigate('dashboard')}
          className={`flex flex-col items-center gap-1 transition-all ${
            currentTab === 'dashboard' ? 'text-blue-400 font-extrabold scale-105' : 'text-slate-400 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-bold">Home</span>
        </button>

        <button
          onClick={() => onNavigate('plans')}
          className={`flex flex-col items-center gap-1 transition-all ${
            currentTab === 'plans' ? 'text-blue-400 font-extrabold scale-105' : 'text-slate-400 hover:text-white'
          }`}
        >
          <TrendingUp className="w-5 h-5" />
          <span className="text-[10px] font-bold">Plans</span>
        </button>

        {/* Floating Center Deposit Trigger */}
        <button
          onClick={onQuickAction}
          className="relative -top-5 w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-600/40 hover:scale-105 transition-all ring-4 ring-slate-950"
          title="Deposit / Subscribe"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>

        <button
          onClick={() => onNavigate('transactions')}
          className={`flex flex-col items-center gap-1 transition-all ${
            currentTab === 'transactions' ? 'text-blue-400 font-extrabold scale-105' : 'text-slate-400 hover:text-white'
          }`}
        >
          <History className="w-5 h-5" />
          <span className="text-[10px] font-bold">Ledger</span>
        </button>

        <button
          onClick={() => onNavigate('referrals')}
          className={`flex flex-col items-center gap-1 transition-all ${
            currentTab === 'referrals' ? 'text-blue-400 font-extrabold scale-105' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] font-bold">Network</span>
        </button>
      </div>
    </div>
  );
};

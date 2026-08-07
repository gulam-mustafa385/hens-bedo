import React, { useState, useEffect } from 'react';
import {
  Wifi,
  Battery,
  ChevronLeft,
  X,
  Home,
  Clock,
  Plus,
  ArrowUpRight,
  User,
  LogOut,
  Zap,
  Menu,
  ShieldCheck,
  Users,
  Wallet,
  Building2,
  ArrowDown,
  ArrowUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AndroidShellProps {
  children: React.ReactNode;
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onOpenAI: () => void;
}

export const AndroidShell: React.FC<AndroidShellProps> = ({
  children,
  currentTab,
  onNavigate,
  onOpenDeposit,
  onOpenWithdraw,
  onOpenAI,
}) => {
  const { user, logout } = useAuth();
  const [timeStr, setTimeStr] = useState<string>('09:41');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hrs = now.getHours().toString().padStart(2, '0');
      const mins = now.getMinutes().toString().padStart(2, '0');
      setTimeStr(`${hrs}:${mins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const isAuthPage = !user || currentTab === 'auth';

  return (
    <div className="min-h-screen bg-[#111625] flex flex-col items-center justify-center p-0 sm:p-4 md:p-6 font-sans">
      {/* PHONE CONTAINER FRAME */}
      <div className="relative w-full max-w-[430px] min-h-[100vh] sm:min-h-[880px] sm:max-h-[920px] bg-[#f2f5f9] sm:rounded-[44px] shadow-[0_30px_90px_rgba(0,0,0,0.4)] sm:border-[8px] sm:border-[#1e2330] flex flex-col overflow-hidden text-[#222]">
        
        {/* ANDROID PHONE TOP STATUS BAR */}
        <div className="h-9 bg-white border-b border-slate-100 flex items-center justify-between px-6 z-40 select-none flex-shrink-0">
          <span className="text-[12px] font-extrabold text-[#281f41]">{timeStr}</span>

          {/* Camera Notch Punch Hole */}
          <div className="w-16 h-3 bg-[#1e232e] rounded-full flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-[#0d1017]" />
          </div>

          <div className="flex items-center gap-1.5 text-[#281f41]">
            <Wifi className="w-3.5 h-3.5 stroke-[2.5]" />
            <Battery className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>

        {/* TOP APP HEADER (appHeader from HTML) */}
        {!isAuthPage && (
          <div className="h-14 bg-white border-b border-slate-100/80 px-4 flex items-center justify-between z-30 sticky top-0 shadow-sm flex-shrink-0">
            {/* Left Button */}
            <div className="flex items-center gap-2">
              {currentTab !== 'dashboard' ? (
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="w-9 h-9 rounded-full bg-slate-100 text-[#281f41] flex items-center justify-center hover:bg-slate-200 transition-all"
                  title="Back to Dashboard"
                >
                  <i className="fa-solid fa-arrow-left text-sm" />
                </button>
              ) : (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="w-9 h-9 rounded-full bg-slate-100 text-[#281f41] flex items-center justify-center hover:bg-slate-200 transition-all"
                  title="Open Menu"
                >
                  <i className="fa fa-bars text-sm" />
                </button>
              )}
            </div>

            {/* Center Header Copy */}
            <div className="text-center">
              <small className="block text-[10px] font-bold uppercase text-slate-400 tracking-wide leading-none">
                Account Area
              </small>
              <span className="text-xs font-black text-[#281f41] tracking-tight leading-tight block mt-0.5">
                {user?.username || 'muhhabat00786'}
              </span>
            </div>

            {/* Right Logout Button */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={onOpenAI}
                className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center hover:bg-amber-100 transition-all"
                title="AI Advisor"
              >
                <Zap className="w-4 h-4 fill-amber-500" />
              </button>

              <button
                onClick={logout}
                className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-rose-100 transition-all"
                title="Logout"
              >
                <i className="fa-solid fa-right-from-bracket text-xs" />
              </button>
            </div>
          </div>
        )}

        {/* SIDEBAR DRAWER OVERLAY & PANEL */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />

            {/* Drawer */}
            <div className="relative w-72 max-w-[80%] bg-[#1a1f33] text-white h-full flex flex-col p-5 z-10 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-700/80 pb-4">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <i className="fa fa-bars text-[#0098ff]" /> Menu Navigation
                </h3>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 flex-1 overflow-y-auto font-bold text-xs">
                <button
                  onClick={() => {
                    onNavigate('dashboard');
                    setSidebarOpen(false);
                  }}
                  className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-all ${
                    currentTab === 'dashboard'
                      ? 'bg-[#0098ff] text-white shadow-md'
                      : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <i className="fa fa-home text-base w-5 text-center" /> Dashboard
                </button>

                <button
                  onClick={() => {
                    onNavigate('plans');
                    setSidebarOpen(false);
                  }}
                  className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-all ${
                    currentTab === 'plans'
                      ? 'bg-[#0098ff] text-white shadow-md'
                      : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <i className="fa fa-bolt text-base w-5 text-center text-amber-400" /> Buy Plans
                </button>

                <button
                  onClick={() => {
                    onNavigate('transactions');
                    setSidebarOpen(false);
                  }}
                  className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-all ${
                    currentTab === 'transactions'
                      ? 'bg-[#0098ff] text-white shadow-md'
                      : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <i className="fa fa-arrow-down text-base w-5 text-center text-emerald-400" /> Deposit History
                </button>

                <button
                  onClick={() => {
                    onOpenWithdraw();
                    setSidebarOpen(false);
                  }}
                  className="w-full p-3 rounded-2xl flex items-center gap-3 hover:bg-slate-800 text-slate-300 transition-all"
                >
                  <i className="fa fa-arrow-up text-base w-5 text-center text-rose-400" /> Withdraw
                </button>

                <button
                  onClick={() => {
                    onNavigate('referrals');
                    setSidebarOpen(false);
                  }}
                  className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-all ${
                    currentTab === 'referrals'
                      ? 'bg-[#0098ff] text-white shadow-md'
                      : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <i className="fa fa-users text-base w-5 text-center text-indigo-400" /> Team List & Commission
                </button>

                <button
                  onClick={() => {
                    onNavigate('profile');
                    setSidebarOpen(false);
                  }}
                  className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-all ${
                    currentTab === 'profile'
                      ? 'bg-[#0098ff] text-white shadow-md'
                      : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <i className="fa fa-user text-base w-5 text-center text-sky-400" /> Account Profile
                </button>
              </div>

              <div className="border-t border-slate-700/80 pt-4">
                <button
                  onClick={() => {
                    logout();
                    setSidebarOpen(false);
                  }}
                  className="w-full p-3 rounded-2xl bg-rose-600/20 text-rose-400 font-extrabold flex items-center justify-center gap-2 hover:bg-rose-600 hover:text-white transition-all"
                >
                  <i className="fa fa-sign-out-alt" /> Logout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SCROLLABLE SCREEN CONTENT AREA */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 sm:p-4 scrollbar-none">
          {children}
        </div>

        {/* FLOATING BOTTOM NAVBAR (appNavBar) */}
        {!isAuthPage && (
          <div className="sticky bottom-0 inset-x-0 bg-white border-t border-slate-200/80 px-3 py-2 flex items-center justify-around z-30 shadow-[0_-10px_25px_rgba(0,0,0,0.06)] flex-shrink-0">
            {/* Home */}
            <button
              onClick={() => onNavigate('dashboard')}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all ${
                currentTab === 'dashboard' ? 'text-[#0098ff]' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <i className="fa-solid fa-house text-lg" />
              <span className="text-[10px] font-extrabold">Home</span>
            </button>

            {/* History */}
            <button
              onClick={() => onNavigate('transactions')}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all ${
                currentTab === 'transactions' ? 'text-[#0098ff]' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <i className="fa-solid fa-clock-rotate-left text-lg" />
              <span className="text-[10px] font-extrabold">History</span>
            </button>

            {/* CENTER (+) BUTTON */}
            <button
              onClick={onOpenDeposit}
              className="relative -top-5 w-13 h-13 w-12 h-12 rounded-full bg-gradient-to-r from-[#1edac8] to-[#0097f3] text-white flex items-center justify-center shadow-[0_8px_20px_rgba(0,151,243,0.4)] hover:scale-105 active:scale-95 transition-all"
              title="Buy Plan / Deposit"
            >
              <i className="fa-solid fa-plus text-xl stroke-[3]" />
            </button>

            {/* Withdraw */}
            <button
              onClick={onOpenWithdraw}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all ${
                currentTab === 'withdraw' ? 'text-[#0098ff]' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <i className="fa-solid fa-usd text-lg" />
              <span className="text-[10px] font-extrabold">Withdraw</span>
            </button>

            {/* Logout / Team */}
            <button
              onClick={() => onNavigate('referrals')}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all ${
                currentTab === 'referrals' ? 'text-[#0098ff]' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <i className="fa-solid fa-users text-lg" />
              <span className="text-[10px] font-extrabold">Team</span>
            </button>
          </div>
        )}

        {/* BOTTOM ANDROID GESTURE PILL BAR */}
        <div className="h-3 bg-white flex items-center justify-center flex-shrink-0">
          <div className="w-28 h-1 rounded-full bg-slate-300" />
        </div>
      </div>
    </div>
  );
};


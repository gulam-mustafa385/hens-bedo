import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useInvest } from '../context/InvestContext';
import { Transaction } from '../types';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onOpenCalculator: () => void;
  onOpenAI: () => void;
  onSelectTransaction: (tx: Transaction) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenDeposit,
  onOpenWithdraw,
  onOpenCalculator,
  onOpenAI,
  onSelectTransaction,
}) => {
  const { user } = useAuth();
  const {
    activeDepositsTotal,
    pendingWithdrawalsTotal,
    totalTeamDepositTotal,
  } = useInvest();

  const [copiedLink, setCopiedLink] = useState(false);

  const referralLink = `${window.location.origin}/signup?ref=${user?.referralCode || 'B028CB2D'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-4 pb-20 text-[#281f41]">
      {/* 1. HERO BANNER CARD */}
      <section className="relative rounded-[32px] bg-gradient-to-br from-[#ff9d21] via-[#ff7836] to-[#ff6644] text-white p-5 shadow-lg overflow-hidden">
        {/* Subtle decorative bottom arc */}
        <div className="absolute -left-[10%] -right-[10%] -bottom-[35px] h-[65px] bg-[#f2f5f9] rounded-[50%/35%] pointer-events-none" />

        <div className="relative z-10 space-y-4 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-black uppercase text-white tracking-wider flex items-center gap-1">
                <i className="fa-solid fa-shield-halved text-amber-300" /> SECP Verified
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('tasks')}
                className="relative w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-all"
                title="Rewards"
              >
                <i className="fa-regular fa-bell text-sm" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
              </button>

              <button
                onClick={() => onNavigate('profile')}
                className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-all overflow-hidden"
              >
                <span className="text-xs font-black">
                  {user?.username ? user.username.substring(0, 2).toUpperCase() : 'VI'}
                </span>
              </button>
            </div>
          </div>

          <div className="pt-1">
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
              Rs {user?.balance.toLocaleString() || '0'} <span className="text-2xl">👋</span>
            </h1>
            <p className="text-xs font-extrabold text-white/90 mt-1">
              Welcome <span className="underline decoration-amber-300 decoration-2">@{user?.username || 'muhhabat00786'}</span>
            </p>
          </div>

          {/* Quick Action Buttons on Hero */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={onOpenDeposit}
              className="flex-1 py-3 px-4 rounded-2xl bg-white text-[#281f41] font-black text-xs shadow-md hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5"
            >
              <i className="fa-solid fa-plus text-[#0098ff]" /> Add Deposit
            </button>
            <button
              onClick={onOpenWithdraw}
              className="flex-1 py-3 px-4 rounded-2xl bg-[#281f41] text-white font-black text-xs shadow-md hover:bg-[#1f1833] transition-all flex items-center justify-center gap-1.5"
            >
              <i className="fa-solid fa-arrow-up-right-from-square text-emerald-400" /> Withdraw
            </button>
          </div>
        </div>
      </section>

      {/* 2. QUICK ACTION GRID */}
      <div className="space-y-1.5">
        <h3 className="text-xs font-black text-[#281f41] uppercase tracking-wider px-1">
          Quick Actions
        </h3>
        <section className="grid grid-cols-3 gap-2.5">
          <button
            onClick={() => onNavigate('plans')}
            className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-[#0098ff] transition-all flex flex-col items-center text-center group"
          >
            <span className="w-10 h-10 rounded-2xl bg-[#e6f4ff] text-[#0098ff] flex items-center justify-center mb-2 shadow-sm group-hover:scale-105 transition-all">
              <i className="fa fa-chart-pie text-base" />
            </span>
            <strong className="text-xs font-black text-[#281f41]">Buy Plan</strong>
          </button>

          <button
            onClick={() => onNavigate('tasks')}
            className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-emerald-500 transition-all flex flex-col items-center text-center group"
          >
            <span className="w-10 h-10 rounded-2xl bg-[#e6fbf4] text-emerald-600 flex items-center justify-center mb-2 shadow-sm group-hover:scale-105 transition-all">
              <i className="fa fa-wallet text-base" />
            </span>
            <strong className="text-xs font-black text-[#281f41]">Next Profit</strong>
          </button>

          <button
            onClick={onOpenWithdraw}
            className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-amber-500 transition-all flex flex-col items-center text-center group"
          >
            <span className="w-10 h-10 rounded-2xl bg-[#fff2e6] text-[#ff7049] flex items-center justify-center mb-2 shadow-sm group-hover:scale-105 transition-all">
              <i className="fa fa-[#ff7049] fa-arrow-right-arrow-left text-base" />
            </span>
            <strong className="text-xs font-black text-[#281f41]">Withdraw</strong>
          </button>
        </section>
      </div>

      {/* 3. RECENT ACTIVITY ROWS */}
      <section className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-[#281f41] uppercase tracking-wider">
            Recent Activity
          </h3>
          <button
            onClick={() => onNavigate('transactions')}
            className="text-xs font-extrabold text-[#0098ff] hover:underline"
          >
            View All
          </button>
        </div>

        <div className="space-y-2">
          {/* Deposits Row */}
          <button
            onClick={() => onNavigate('transactions')}
            className="w-full p-3 rounded-2xl bg-[#f8fafc] border border-slate-100 flex items-center justify-between hover:bg-slate-100 transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-[#e6f4ff] text-[#0098ff] flex items-center justify-center">
                <i className="fa fa-arrow-trend-up text-sm" />
              </span>
              <div className="text-left">
                <strong className="text-xs font-black text-[#281f41] block">Deposits</strong>
                <small className="text-[10px] font-bold text-slate-400 block">Active funds</small>
              </div>
            </div>
            <div className="text-right">
              <strong className="text-xs font-black text-[#281f41] block">
                Rs {user?.totalDeposited.toLocaleString() || '0'}
              </strong>
              <small className="text-[10px] font-bold text-emerald-600 block">
                <i className="fa fa-arrow-up" /> Pending Rs 0
              </small>
            </div>
          </button>

          {/* Withdraw Row */}
          <button
            onClick={onOpenWithdraw}
            className="w-full p-3 rounded-2xl bg-[#f8fafc] border border-slate-100 flex items-center justify-between hover:bg-slate-100 transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-[#fff2e6] text-[#ff7049] flex items-center justify-center">
                <i className="fa fa-shield-halved text-sm" />
              </span>
              <div className="text-left">
                <strong className="text-xs font-black text-[#281f41] block">Withdraw</strong>
                <small className="text-[10px] font-bold text-slate-400 block">Cash out records</small>
              </div>
            </div>
            <div className="text-right">
              <strong className="text-xs font-black text-[#281f41] block">
                Rs {user?.totalWithdrawn.toLocaleString() || '0'}
              </strong>
              <small className="text-[10px] font-bold text-slate-400 block">
                <i className="fa fa-arrow-up" /> Pending Rs {pendingWithdrawalsTotal}
              </small>
            </div>
          </button>

          {/* Team Row */}
          <button
            onClick={() => onNavigate('referrals')}
            className="w-full p-3 rounded-2xl bg-[#f8fafc] border border-slate-100 flex items-center justify-between hover:bg-slate-100 transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-[#eef2ff] text-indigo-600 flex items-center justify-center">
                <i className="fa fa-users text-sm" />
              </span>
              <div className="text-left">
                <strong className="text-xs font-black text-[#281f41] block">Team</strong>
                <small className="text-[10px] font-bold text-slate-400 block">0 members</small>
              </div>
            </div>
            <div className="text-right">
              <strong className="text-xs font-black text-[#281f41] block">
                Rs {totalTeamDepositTotal.toLocaleString()}
              </strong>
              <small className="text-[10px] font-bold text-indigo-600 block">
                <i className="fa fa-arrow-up" /> Team deposit
              </small>
            </div>
          </button>

          {/* Commission Row */}
          <button
            onClick={() => onNavigate('referrals')}
            className="w-full p-3 rounded-2xl bg-[#f8fafc] border border-slate-100 flex items-center justify-between hover:bg-slate-100 transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-[#f3e8ff] text-purple-600 flex items-center justify-center">
                <i className="fa fa-building-columns text-sm" />
              </span>
              <div className="text-left">
                <strong className="text-xs font-black text-[#281f41] block">Commission</strong>
                <small className="text-[10px] font-bold text-slate-400 block">Team earnings</small>
              </div>
            </div>
            <div className="text-right">
              <strong className="text-xs font-black text-[#281f41] block">
                Rs {user?.totalYieldEarned.toLocaleString() || '0'}
              </strong>
              <small className="text-[10px] font-bold text-purple-600 block">
                <i className="fa fa-arrow-up" /> Referral income
              </small>
            </div>
          </button>
        </div>
      </section>

      {/* 4. EXTRA ACTION PANELS */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onNavigate('tasks')}
          className="p-3.5 rounded-2xl bg-[#281f41] text-white flex items-center gap-3 hover:bg-[#1e1732] transition-all shadow-md text-left"
        >
          <div className="w-9 h-9 rounded-xl bg-white/10 text-amber-300 flex items-center justify-center flex-shrink-0">
            <i className="fa fa-gift text-base" />
          </div>
          <div>
            <span className="text-[10px] text-slate-300 font-bold block">Team Reward</span>
            <strong className="text-xs font-black text-white block">Check List</strong>
          </div>
        </button>

        <button
          onClick={onOpenCalculator}
          className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center gap-3 hover:brightness-105 transition-all shadow-md text-left"
        >
          <div className="w-9 h-9 rounded-xl bg-white/20 text-white flex items-center justify-center flex-shrink-0">
            <i className="fa fa-money-bill text-base" />
          </div>
          <div>
            <span className="text-[10px] text-amber-100 font-bold block">Next Profit</span>
            <strong className="text-xs font-black text-white block">Check Earnings</strong>
          </div>
        </button>
      </div>

      {/* 5. SUPPORT & CONTACTS BLOCK */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-3">
        {/* Task Spotlight Banner */}
        <button
          onClick={() => onNavigate('tasks')}
          className="w-full p-3 rounded-2xl bg-gradient-to-r from-[#0098ff] to-[#00b4ff] text-white flex items-center justify-between shadow-md hover:brightness-105 transition-all"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <i className="fa fa-bolt text-amber-300 text-sm" />
            </span>
            <div className="text-left">
              <small className="text-[10px] font-bold text-white/80 block leading-none">Rewards</small>
              <strong className="text-xs font-black text-white block mt-0.5">Open Tasks</strong>
            </div>
          </div>
          <i className="fa fa-chevron-right text-xs text-white/80" />
        </button>

        <div className="pt-1">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
            Support
          </span>
          <h3 className="text-sm font-black text-[#281f41]">Contacts & Files</h3>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* WhatsApp Channel */}
          <a
            href="https://whatsapp.com/channel/0029Vb8rWApA89MjWfuzM93a"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-2xl bg-[#fff7ed] border border-orange-200/80 flex items-center gap-2.5 hover:bg-orange-100/60 transition-all"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
              <i className="fa-brands fa-whatsapp text-lg" />
            </div>
            <div>
              <small className="text-[10px] font-bold text-slate-500 block leading-none">Updates</small>
              <strong className="text-xs font-black text-[#281f41] block mt-0.5">WhatsApp Channel</strong>
            </div>
          </a>

          {/* Admin */}
          <a
            href="https://wa.me/+923483747208"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-2xl bg-[#fefce8] border border-amber-200/80 flex items-center gap-2.5 hover:bg-amber-100/60 transition-all"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
              <i className="fa-brands fa-whatsapp text-lg" />
            </div>
            <div>
              <small className="text-[10px] font-bold text-slate-500 block leading-none">Support</small>
              <strong className="text-xs font-black text-[#281f41] block mt-0.5">Admin</strong>
            </div>
          </a>

          {/* Owner */}
          <a
            href="https://wa.me/+9233312345671"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-2xl bg-[#f1f5f9] border border-slate-200 flex items-center gap-2.5 hover:bg-slate-200/60 transition-all"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
              <i className="fa-brands fa-whatsapp text-lg" />
            </div>
            <div>
              <small className="text-[10px] font-bold text-slate-500 block leading-none">Contact</small>
              <strong className="text-xs font-black text-[#281f41] block mt-0.5">Owner</strong>
            </div>
          </a>

          {/* Android App */}
          <a
            href="http://localhost/admin2/uploads/android_app_1781424673.apk"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-2xl bg-[#eff6ff] border border-sky-200 flex items-center gap-2.5 hover:bg-sky-100/60 transition-all"
          >
            <div className="w-8 h-8 rounded-xl bg-[#0098ff] text-white flex items-center justify-center flex-shrink-0">
              <i className="fa-brands fa-android text-base" />
            </div>
            <div>
              <small className="text-[10px] font-bold text-slate-500 block leading-none">Download</small>
              <strong className="text-xs font-black text-[#281f41] block mt-0.5">Android App</strong>
            </div>
          </a>

          {/* FBR Document */}
          <button
            onClick={() => onNavigate('documents')}
            className="p-3 rounded-2xl bg-[#fff7ed] border border-orange-200/80 flex items-center gap-2.5 hover:bg-orange-100/60 transition-all text-left"
          >
            <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center flex-shrink-0">
              <i className="fa-solid fa-file-contract text-sm" />
            </div>
            <div>
              <small className="text-[10px] font-bold text-slate-500 block leading-none">Document</small>
              <strong className="text-xs font-black text-[#281f41] block mt-0.5">FBR Cert</strong>
            </div>
          </button>

          {/* SECP Document */}
          <button
            onClick={() => onNavigate('documents')}
            className="p-3 rounded-2xl bg-[#ecfdf5] border border-emerald-200/80 flex items-center gap-2.5 hover:bg-emerald-100/60 transition-all text-left"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
              <i className="fa-solid fa-shield-halved text-sm" />
            </div>
            <div>
              <small className="text-[10px] font-bold text-slate-500 block leading-none">Document</small>
              <strong className="text-xs font-black text-[#281f41] block mt-0.5">SECP Cert</strong>
            </div>
          </button>
        </div>
      </div>

      {/* 6. REFERRAL LINK CARD */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-2">
        <h3 className="text-xs font-black text-[#281f41]">Your Referral Link</h3>
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#f8fafc] border border-slate-200">
          <input
            type="text"
            readOnly
            value={referralLink}
            className="flex-1 bg-transparent px-2 text-xs font-mono font-bold text-[#281f41] focus:outline-none truncate"
          />
          <button
            onClick={handleCopy}
            className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-[#1edac8] to-[#0097f3] text-white font-black text-xs shadow-md flex items-center gap-1.5 hover:brightness-105 transition-all flex-shrink-0"
          >
            <i className={`fa ${copiedLink ? 'fa-check' : 'fa-copy'}`} />
            {copiedLink ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* 7. ACCOUNT SUMMARY CARD */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-3">
        <h3 className="text-xs font-black text-[#281f41] uppercase tracking-wider">
          Account Summary
        </h3>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 block">Team Members</span>
            <strong className="text-base font-black text-[#281f41] block mt-0.5">0</strong>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 block">Total Deposits</span>
            <strong className="text-base font-black text-[#0098ff] block mt-0.5">
              Rs {user?.totalDeposited.toLocaleString() || '0'}
            </strong>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 block">Total Withdraw</span>
            <strong className="text-base font-black text-emerald-600 block mt-0.5">
              Rs {user?.totalWithdrawn.toLocaleString() || '0'}
            </strong>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 block">Total Team Deposit</span>
            <strong className="text-base font-black text-indigo-600 block mt-0.5">
              Rs {totalTeamDepositTotal.toLocaleString()}
            </strong>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 block">Pending Deposits</span>
            <strong className="text-base font-black text-amber-600 block mt-0.5">Rs 0</strong>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 block">Pending Withdraws</span>
            <strong className="text-base font-black text-rose-500 block mt-0.5">
              Rs {pendingWithdrawalsTotal.toLocaleString()}
            </strong>
          </div>
        </div>

        {/* Active Package Button at Bottom */}
        <button
          onClick={() => onNavigate('plans')}
          className="w-full p-3.5 rounded-2xl bg-[#281f41] text-white flex items-center justify-between hover:bg-[#1d1733] transition-all shadow-md mt-1"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-white/10 text-amber-300 flex items-center justify-center">
              <i className="fa fa-box-open text-sm" />
            </span>
            <div className="text-left">
              <small className="text-[10px] font-bold text-slate-300 block leading-none">Package</small>
              <strong className="text-xs font-black text-white block mt-0.5">Active Package</strong>
            </div>
          </div>
          <span className="text-xs font-black text-amber-300">
            Rs {activeDepositsTotal.toLocaleString()}
          </span>
        </button>
      </div>
    </div>
  );
};


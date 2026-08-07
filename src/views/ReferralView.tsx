import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useInvest } from '../context/InvestContext';

export const ReferralView: React.FC = () => {
  const { user } = useAuth();
  const { teamMembers, totalTeamDepositTotal } = useInvest();
  const [activeFilter, setActiveFilter] = useState<'all' | '1'>('all');
  const [copied, setCopied] = useState<boolean>(false);

  const referralLink = `${window.location.origin}/signup?ref=${user?.referralCode || 'B028CB2D'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalCommissions = teamMembers.reduce((sum, m) => sum + m.commissionEarned, 0);

  const filteredMembers = teamMembers.filter((m) => {
    if (activeFilter === 'all') return true;
    return String(m.level) === activeFilter;
  });

  return (
    <div className="space-y-4 pb-20 text-[#281f41]">
      {/* 1. TITLE & SUMMARY CARD */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
        <h2 className="text-base font-black text-[#281f41] text-center">Referral History</h2>

        {/* SUMMARY GRID */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">
              Total Team Investment
            </span>
            <strong className="text-sm font-black text-[#0098ff] block mt-0.5">
              Rs {totalTeamDepositTotal.toLocaleString()}
            </strong>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">
              Total Referral Commission
            </span>
            <strong className="text-sm font-black text-emerald-600 block mt-0.5">
              Rs {totalCommissions.toLocaleString()}
            </strong>
          </div>
        </div>

        {/* LEVEL GRID */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">
              Total Team
            </span>
            <strong className="text-base font-black text-[#281f41] block mt-0.5">
              {teamMembers.length}
            </strong>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">
              Level-1
            </span>
            <strong className="text-base font-black text-indigo-600 block mt-0.5">
              {teamMembers.filter((m) => m.level === 1).length}
            </strong>
          </div>
        </div>
      </div>

      {/* 2. REFERRAL LINK BOX */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-[#281f41]">Referral Link</h3>
          <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
            18% Level 1 Commission
          </span>
        </div>

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
            <i className={`fa ${copied ? 'fa-check' : 'fa-copy'}`} />
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* 3. FILTER BAR */}
      <div className="p-2 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveFilter('all')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all text-center ${
              activeFilter === 'all'
                ? 'bg-gradient-to-r from-[#1edac8] to-[#0097f3] text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Referrals
          </button>
          <button
            onClick={() => setActiveFilter('1')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all text-center ${
              activeFilter === '1'
                ? 'bg-gradient-to-r from-[#1edac8] to-[#0097f3] text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Level-1 Direct
          </button>
        </div>
      </div>

      {/* 4. REFERRALS LIST */}
      <div className="space-y-3">
        {filteredMembers.length > 0 ? (
          filteredMembers.map((member) => (
            <div
              key={member.id}
              className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-xs">
                    L{member.level}
                  </span>
                  <div>
                    <strong className="text-xs font-black text-[#281f41] block">
                      @{member.username}
                    </strong>
                    <small className="text-[10px] font-bold text-slate-400 block">
                      Joined: {member.joinedDate}
                    </small>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-black text-[#0098ff] block">
                    Rs {member.totalDeposit.toLocaleString()}
                  </span>
                  <small className="text-[10px] font-bold text-emerald-600 block">
                    +Rs {member.commissionEarned.toLocaleString()} bonus
                  </small>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm text-center text-xs font-bold text-slate-400">
            No referrals found
          </div>
        )}
      </div>
    </div>
  );
};


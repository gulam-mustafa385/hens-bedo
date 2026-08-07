import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  Smartphone,
  Wallet,
  KeyRound,
  LogOut,
  Copy,
  Check,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ProfileView: React.FC = () => {
  const { user, logout, deviceId, savedAccounts } = useAuth();

  const [copied, setCopied] = useState<boolean>(false);
  const [pin, setPin] = useState<string>('••••');
  const [pinSaved, setPinSaved] = useState<boolean>(false);

  const handleCopyCode = () => {
    if (!user) return;
    navigator.clipboard.writeText(user.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinSaved(true);
    setTimeout(() => setPinSaved(false), 2500);
  };

  const initials = user?.username ? user.username.substring(0, 2).toUpperCase() : 'IN';

  return (
    <div className="space-y-4 pb-20 text-white">
      {/* Top Profile Card */}
      <div className="p-6 rounded-[28px] bg-[#0d1527] text-white shadow-xl border border-slate-800/80 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-[22px] bg-[#0070f3] text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-[#0070f3]/30 flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-black text-[#00d2ff] uppercase tracking-wider">
              Verified Investor Account
            </div>
            <h1 className="text-xl font-black text-white truncate">@{user?.username || 'investor_pro'}</h1>
            <p className="text-xs text-slate-400 font-medium truncate mt-0.5">
              {user?.email || 'investor_pro@vertexinvest.com'}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-auto px-4 py-2.5 rounded-xl bg-rose-950/40 text-rose-400 border border-rose-800/80 font-black text-xs hover:bg-rose-900/60 transition-all flex items-center gap-2"
        >
          <LogOut className="w-4 h-4 stroke-[2.5]" /> Sign Out
        </button>
      </div>

      {/* 2x2 Account Metrics Matrix */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-[#0d1527] border border-slate-800/80 shadow-sm">
          <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block">
            Wallet Balance
          </span>
          <strong className="text-lg font-black text-white block mt-1">
            Rs {user?.balance.toLocaleString() || '9,000'}
          </strong>
        </div>

        <div className="p-4 rounded-2xl bg-[#0d1527] border border-slate-800/80 shadow-sm">
          <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block">
            Total Deposited
          </span>
          <strong className="text-lg font-black text-[#00d2ff] block mt-1">
            Rs {user?.totalDeposited.toLocaleString() || '15,000'}
          </strong>
        </div>

        <div className="p-4 rounded-2xl bg-[#0d1527] border border-slate-800/80 shadow-sm">
          <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block">
            Total Withdrawn
          </span>
          <strong className="text-lg font-black text-emerald-400 block mt-1">
            Rs {user?.totalWithdrawn.toLocaleString() || '5,000'}
          </strong>
        </div>

        <div className="p-4 rounded-2xl bg-[#0d1527] border border-slate-800/80 shadow-sm">
          <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block">
            Referral Code
          </span>
          <div className="flex items-center justify-between mt-1">
            <strong className="text-sm font-mono font-black text-[#818cf8]">
              {user?.referralCode || 'INVE207B'}
            </strong>
            <button
              onClick={handleCopyCode}
              className="text-slate-400 hover:text-indigo-400 transition-colors p-1"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Security & PIN Settings Card */}
      <div className="p-6 rounded-[28px] bg-[#0d1527] border border-slate-800/80 shadow-sm space-y-4">
        <h3 className="text-sm font-black text-white flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-[#00d2ff]" /> Security PIN & Device Verification
        </h3>

        {pinSaved && (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-xs font-black flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Security PIN updated successfully!
          </div>
        )}

        <form onSubmit={handleSavePin} className="space-y-3">
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">
                Withdrawal Security PIN (4-Digits)
              </label>
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-[#182035] border border-slate-700/80 font-mono font-black text-base text-white focus:outline-none focus:border-[#0070f3]"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">
                Active Device Hardware ID
              </label>
              <input
                type="text"
                readOnly
                value={deviceId}
                className="w-full px-4 py-3 rounded-2xl bg-[#182035] border border-slate-700/80 font-mono text-xs font-bold text-slate-400 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="py-3 px-6 rounded-2xl bg-[#0070f3] hover:bg-[#0060d0] text-white font-black text-xs shadow-lg shadow-blue-500/20 transition-all"
          >
            Update Security Settings
          </button>
        </form>
      </div>

      {/* Saved Quick-Login Profiles Card */}
      <div className="p-6 rounded-[28px] bg-[#0d1527] border border-slate-800/80 shadow-sm space-y-3">
        <h3 className="text-sm font-black text-white flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-[#00d2ff]" /> Saved Quick-Login Profiles ({savedAccounts.length})
        </h3>
        <p className="text-xs text-slate-400 font-medium">
          Fast account switching configured on this browser session.
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          {savedAccounts.map((acc) => (
            <span
              key={acc}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black border ${
                acc === user?.username
                  ? 'bg-[#0070f3] text-white border-[#0070f3] shadow-md'
                  : 'bg-[#182035] text-slate-300 border-slate-700/80'
              }`}
            >
              @{acc} {acc === user?.username && ' (Active)'}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};


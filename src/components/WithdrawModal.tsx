import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ArrowUpRight,
  ShieldCheck,
  Smartphone,
  Building2,
  CreditCard,
  Zap,
  Coins,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { PAYMENT_GATEWAYS } from '../data/initialData';
import { useAuth } from '../context/AuthContext';
import { useInvest } from '../context/InvestContext';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { submitWithdrawal } = useInvest();

  const [selectedGatewayId, setSelectedGatewayId] = useState<string>('easypaisa');
  const [amount, setAmount] = useState<number>(1000);
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [accountName, setAccountName] = useState<string>('');
  const [feedback, setFeedback] = useState<{ success?: boolean; message?: string } | null>(null);

  const gateway = PAYMENT_GATEWAYS.find((g) => g.id === selectedGatewayId) || PAYMENT_GATEWAYS[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (amount < 300) {
      setFeedback({ success: false, message: 'Minimum withdrawal amount is Rs 300.' });
      return;
    }

    if (!accountNumber.trim() || !accountName.trim()) {
      setFeedback({ success: false, message: 'Please enter account holder name and number.' });
      return;
    }

    const res = submitWithdrawal(amount, gateway.name, accountNumber.trim(), accountName.trim());
    setFeedback(res);

    if (res.success) {
      setTimeout(() => {
        setAccountNumber('');
        setAccountName('');
      }, 1500);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'easypaisa':
        return <Smartphone className="w-5 h-5 text-emerald-600" />;
      case 'jazzcash':
        return <Zap className="w-5 h-5 text-amber-500" />;
      case 'bank':
        return <Building2 className="w-5 h-5 text-blue-600" />;
      case 'nayapay':
        return <CreditCard className="w-5 h-5 text-orange-500" />;
      case 'sadapay':
        return <ShieldCheck className="w-5 h-5 text-teal-500" />;
      case 'crypto':
        return <Coins className="w-5 h-5 text-indigo-500" />;
      default:
        return <ArrowUpRight className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="w-full max-w-md max-h-[82vh] flex flex-col rounded-3xl bg-[#1a1f33] text-white shadow-2xl border border-slate-700/80 my-auto overflow-hidden"
          >
            {/* Sticky Header - Close Button ALWAYS Visible */}
            <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-slate-700/80 bg-[#1a1f33] z-20">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/20">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Withdraw Earnings</h3>
                  <p className="text-[11px] font-bold text-slate-400">Fast payout to your local account</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setFeedback(null);
                  onClose();
                }}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
                title="Close"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Balance Card */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-white flex justify-between items-center shadow-md">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Available Balance</span>
                  <div className="text-xl font-black text-amber-400 mt-0.5">
                    Rs {user?.balance.toLocaleString() || '0'}
                  </div>
                </div>
                <div className="text-right text-xs text-slate-400">
                  <span>Fee: <strong className="text-emerald-400">0%</strong></span>
                  <span className="block mt-0.5 text-[10px] text-slate-500">Processed in 1-6 hrs</span>
                </div>
              </div>

              {/* Feedback Alert */}
              {feedback && (
                <div>
                  <div
                    className={`p-3 rounded-2xl flex items-start gap-2 text-xs font-bold ${
                      feedback.success
                        ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300'
                        : 'bg-rose-950/80 border border-rose-800 text-rose-300'
                    }`}
                  >
                    {feedback.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <span>{feedback.message}</span>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Method Selector */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
                    Payout Method
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {PAYMENT_GATEWAYS.map((g) => {
                      const isSelected = g.id === selectedGatewayId;
                      return (
                        <button
                          type="button"
                          key={g.id}
                          onClick={() => setSelectedGatewayId(g.id)}
                          className={`flex flex-col items-center p-2 rounded-2xl border text-center transition-all ${
                            isSelected
                              ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500 text-white'
                              : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <div className="mb-0.5">{getIcon(g.type)}</div>
                          <span className="text-[10px] font-black truncate w-full">
                            {g.name.split(' ')[0]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                    Withdrawal Amount (PKR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                      Rs
                    </span>
                    <input
                      type="number"
                      min={300}
                      max={user?.balance || 100000}
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 font-black text-base text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>
                  <div className="flex gap-1.5 mt-2">
                    {[1000, 2500, 5000, 10000].map((val) => (
                      <button
                        type="button"
                        key={val}
                        onClick={() => setAmount(val)}
                        className={`flex-1 py-1 rounded-xl text-[11px] font-black border transition-all ${
                          amount === val
                            ? 'bg-amber-500 text-slate-950 border-amber-500'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        Rs {val >= 1000 ? `${val / 1000}k` : val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Account Details */}
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                      Account Holder Title *
                    </label>
                    <input
                      type="text"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      placeholder="Full name on account"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                      Account / Phone / IBAN Number *
                    </label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="e.g. 03483747208 or PK00MEZN..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-2xl bg-amber-500 text-slate-950 font-black text-sm hover:bg-amber-400 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 mt-2"
                >
                  Confirm Payout Request <ArrowUpRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

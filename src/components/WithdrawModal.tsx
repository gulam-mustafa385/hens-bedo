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
      case 'upaisa':
        return <CreditCard className="w-5 h-5 text-violet-500" />;
      case 'crypto':
        return <Coins className="w-5 h-5 text-indigo-500" />;
      default:
        return <ArrowUpRight className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm overflow-hidden p-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="w-full max-w-[430px] max-h-[90vh] flex flex-col rounded-[28px] bg-[#edf2f6] text-[#1d2436] shadow-2xl border border-slate-200 overflow-hidden"
          >
            <div className="flex-shrink-0 h-[105px] bg-gradient-to-r from-[#fa7b1b] to-[#ffbe17] text-white relative overflow-hidden">
              <div className="absolute left-4 top-3 flex items-center justify-center w-10 h-10 rounded-xl bg-[#2d3241] text-white shadow-md">
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <div className="absolute left-[88px] top-3">
                <h3 className="text-[26px] font-black leading-none tracking-tight">Payment Method</h3>
                <p className="text-[12px] font-semibold text-white/90 mt-2">Choose your preferred withdraw method</p>
              </div>
              <button
                onClick={() => {
                  setFeedback(null);
                  onClose();
                }}
                className="absolute right-4 top-4 flex items-center justify-center w-8 h-8 rounded-full bg-[#15233b] text-slate-100 hover:bg-slate-700 transition-all"
                title="Close"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
              <div className="absolute bottom-[-28px] left-0 right-0 h-[36px] bg-[#eef2f6]
                  rounded-tl-[50%] rounded-tr-[50%] opacity-100" />
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-[#eef2f6]">
              <div className="rounded-[22px] bg-white border border-slate-200 shadow-sm px-4 py-4">
                <h3 className="text-[24px] font-black text-[#1b2436] mb-3">Select Payment Method</h3>

                <div className="space-y-3">
                  {PAYMENT_GATEWAYS.filter((g) => g.id !== 'crypto' && g.id !== 'usdt').map((g) => {
                    const isSelected = g.id === selectedGatewayId;
                    return (
                      <button
                        type="button"
                        key={g.id}
                        onClick={() => {
                          setSelectedGatewayId(g.id);
                          setFeedback(null);
                        }}
                        className={`w-full flex items-center justify-between rounded-2xl border transition-all px-3 py-3 ${
                          isSelected
                            ? 'border-[#f7a105] bg-[#fffaf1] shadow-[inset_0_0_0_2px_#f7a105]'
                            : 'border-slate-200 bg-white hover:bg-[#f8fbfd]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-200">
                            {getIcon(g.type)}
                          </div>
                          <div className="text-left">
                            <div className="text-[15px] font-black text-[#1b2436]">
                              {g.name.split(' ')[0] === 'EasyPaisa' ? 'EasyPaisa' : g.name.split(' ')[0] === 'JazzCash' ? 'JazzCash' : g.name}
                            </div>
                            <div className="text-[10px] font-bold text-slate-500">
                              {g.name.includes('Cash') ? 'Receive easily using your JazzCash account' : g.name.includes('Easy') ? 'Receive easily using your EasyPaisa account' : g.name.includes('Transfer') ? 'Receive payment via bank transfer' : g.name.includes('Pay') ? `Receive securely using your ${g.name} account` : `Receive payment using ${g.name}`}
                            </div>
                            <div className="text-[10px] font-bold text-slate-500 mt-1">
                              Min: Rs {g.minAmount}
                            </div>
                          </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-[#00a2ff] bg-[#00a2ff]' : 'border-slate-400 bg-white'
                        }`}>
                          {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 px-3 py-3 rounded-2xl border border-amber-200 bg-amber-50 text-[#2d3a43] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-[12px] font-black">
                    Your withdraw information is 100% secure and encrypted.
                  </span>
                </div>

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wide text-slate-500 block mb-1">
                      Account Holder Title *
                    </label>
                    <input
                      type="text"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      placeholder="Full name on account"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#eff5f8] border border-slate-300 text-[12px] font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wide text-slate-500 block mb-1">
                      Account / Phone / IBAN Number *
                    </label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="e.g. 03483747208 or PK00MEZN..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#eff5f8] border border-slate-300 text-[12px] font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wide text-slate-500 block mb-1">
                      Withdrawal Amount (PKR)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">
                        Rs
                      </span>
                      <input
                        type="number"
                        min={300}
                        max={user?.balance || 100000}
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-white border border-slate-300 font-black text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                              ? 'bg-[#ff8a00] text-white border-[#ff8a00]'
                              : 'bg-[#f8fafc] text-slate-700 border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          Rs {val >= 1000 ? `${val / 1000}k` : val}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-2xl bg-[#0098ff] text-white font-black text-sm hover:bg-[#088ce1] shadow-lg transition-all flex items-center justify-center gap-2 mt-2"
                  >
                    Confirm Payout Request <ArrowUpRight className="w-4 h-4" />
                  </button>
                </form>

                {feedback && (
                  <div className="mt-4">
                    <div className={`p-3 rounded-2xl flex items-start gap-2 text-xs font-bold ${feedback.success ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300' : 'bg-rose-950/80 border border-rose-800 text-rose-300'}`}> 
                      {feedback.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />}
                      <span>{feedback.message}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

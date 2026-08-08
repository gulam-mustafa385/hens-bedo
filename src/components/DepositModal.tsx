import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Wallet,
  Copy,
  Check,
  Upload,
  ArrowRight,
  ShieldAlert,
  Zap,
  Building2,
  Smartphone,
  CreditCard,
  ShieldCheck,
  Coins,
} from 'lucide-react';
import { PAYMENT_GATEWAYS } from '../data/initialData';
import { useInvest } from '../context/InvestContext';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  presetAmount?: number;
}

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
  presetAmount,
}) => {
  const { submitDeposit, triggerDemoAutoApprove } = useInvest();
  const [selectedGatewayId, setSelectedGatewayId] = useState<string>('easypaisa');
  const [amount, setAmount] = useState<number>(presetAmount || 1000);
  const [txid, setTxid] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [lastSubmittedTxId, setLastSubmittedTxId] = useState<string>('');
  const [autoApproved, setAutoApproved] = useState<boolean>(false);

  const gateway = PAYMENT_GATEWAYS.find((g) => g.id === selectedGatewayId) || PAYMENT_GATEWAYS[0];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount < gateway.minAmount) {
      alert(`Minimum deposit amount for ${gateway.name} is Rs ${gateway.minAmount}`);
      return;
    }

    if (!txid.trim()) {
      alert('Please enter your transaction ID (TXID/TID) or reference number.');
      return;
    }

    submitDeposit(amount, gateway.name, txid.trim(), accountNumber || 'Sender Account');
    setLastSubmittedTxId('tx-dep-' + txid.trim());
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setAutoApproved(false);
    setTxid('');
    setAccountNumber('');
    onClose();
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
        return <Wallet className="w-5 h-5 text-blue-600" />;
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
            <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-slate-700/80 bg-gradient-to-r from-[#f59016] to-[#f9a513] z-20">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-2xl bg-[#1d304b] text-white shadow-md shadow-blue-500/20">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Deposit Funds</h3>
                  <p className="text-[11px] font-bold text-white/80">Instant gateway verification</p>
                </div>
              </div>
              <button
                onClick={handleReset}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
                title="Close"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                {/* Gateway Selector Grid */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                    Select Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {PAYMENT_GATEWAYS.map((g) => {
                      const isSelected = g.id === selectedGatewayId;
                      return (
                        <button
                          type="button"
                          key={g.id}
                          onClick={() => setSelectedGatewayId(g.id)}
                          className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20 dark:bg-blue-950/40 dark:border-blue-500'
                              : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700'
                          }`}
                        >
                          <div className="p-2 rounded-xl bg-white shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
                            {getIcon(g.type)}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-900 truncate dark:text-white">
                              {g.name.split(' ')[0]}
                            </div>
                            <div className="text-[10px] text-slate-500 font-medium">
                              Min: Rs {g.minAmount}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Amount Quick Select & Input */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                    Deposit Amount (PKR)
                  </label>
                  <div className="relative mb-2.5">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                      Rs
                    </span>
                    <input
                      type="number"
                      min={gateway.minAmount}
                      max={gateway.maxAmount}
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 font-extrabold text-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                      placeholder="1,000"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    {[500, 1000, 5000, 10000, 25000].map((val) => (
                      <button
                        type="button"
                        key={val}
                        onClick={() => setAmount(val)}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                          amount === val
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {val >= 1000 ? `${val / 1000}k` : val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Merchant Account Details Box */}
                <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
                  <div className="flex justify-between items-center text-xs text-slate-400 font-semibold border-b border-slate-800 pb-2">
                    <span>Deposit Destination ({gateway.name})</span>
                    <span className="text-emerald-400 font-bold">● Active</span>
                  </div>

                  {gateway.bankName && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Bank Name</span>
                      <span className="font-bold text-white">{gateway.bankName}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Account Title</span>
                    <span className="font-bold text-white">{gateway.accountTitle}</span>
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Account / Wallet Number
                      </span>
                      <div className="text-lg font-mono font-black text-blue-400">
                        {gateway.accountNumber}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(gateway.accountNumber)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-all shadow-md shadow-blue-600/30"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                {/* Proof Verification Inputs */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Your Sender Account / Number (Optional)
                    </label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="e.g. 03001234567 or Usman Ali"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Transaction ID (TXID / TRX Ref No.) *
                    </label>
                    <input
                      type="text"
                      value={txid}
                      onChange={(e) => setTxid(e.target.value)}
                      placeholder="Enter 11-digit TID / Hash"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                      required
                    />
                  </div>
                </div>

                {/* Security Disclaimer */}
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs dark:bg-amber-950/30 dark:border-amber-900/40 dark:text-amber-300">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p>
                    Please verify account details before transferring. Fraudulent transaction IDs will result in account suspension.
                  </p>
                </div>

                {/* Submit CTA */}
                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 text-white font-extrabold text-base hover:bg-blue-700 shadow-xl shadow-blue-600/25 transition-all flex items-center justify-center gap-2"
                >
                  Submit Deposit Request <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            ) : (
              /* Success / Confirmation state */
              <div className="p-8 text-center space-y-5">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>

                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">Deposit Request Received</h3>
                  <p className="text-sm font-medium text-slate-500 mt-1">
                    Your deposit of <span className="font-bold text-slate-900 dark:text-white">Rs {amount.toLocaleString()}</span> via {gateway.name} is currently under verification.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left text-xs space-y-2 dark:bg-slate-800 dark:border-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Transaction ID:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{txid}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status:</span>
                    <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md dark:bg-amber-950/50">
                      {autoApproved ? 'Approved & Credited' : 'Pending Verification'}
                    </span>
                  </div>
                </div>

                {/* Demo Instant Approval Toggle */}
                {!autoApproved && (
                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-center space-y-2 dark:bg-blue-950/40 dark:border-blue-900">
                    <span className="text-xs font-semibold text-blue-900 dark:text-blue-300">
                      Demo Auto-Approval Engine
                    </span>
                    <p className="text-[11px] text-blue-700/80 dark:text-blue-400">
                      Click below to test instant automated credit to your live account balance!
                    </p>
                    <button
                      onClick={() => {
                        triggerDemoAutoApprove(lastSubmittedTxId);
                        setAutoApproved(true);
                      }}
                      className="py-2 px-4 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-md transition-all inline-flex items-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" /> Instant Approve Demo Deposit
                    </button>
                  </div>
                )}

                <button
                  onClick={handleReset}
                  className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 shadow-lg transition-all dark:bg-slate-800 dark:hover:bg-slate-700"
                >
                  Return to Dashboard
                </button>
              </div>
            )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

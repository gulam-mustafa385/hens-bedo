import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, Clock, ShieldCheck, Printer, Copy, Building2 } from 'lucide-react';
import { Transaction } from '../types';

interface ReceiptModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ transaction, onClose }) => {
  if (!transaction) return null;

  const isCompleted = transaction.status === 'completed';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100 dark:bg-slate-900 dark:border-slate-800"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50 dark:bg-slate-800/50 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-900 font-black text-sm tracking-wider uppercase dark:text-white">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              Vertex Digital Proof
            </div>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-200/60 text-slate-500 hover:bg-slate-300 transition-all dark:bg-slate-800 dark:text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Receipt Body */}
          <div className="p-6 space-y-6 text-center">
            {/* Status Icon */}
            <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              {isCompleted ? (
                <CheckCircle2 className="w-9 h-9 text-emerald-600" />
              ) : (
                <Clock className="w-9 h-9 text-amber-500" />
              )}
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {transaction.type.replace('_', ' ')} AMOUNT
              </span>
              <div className="text-3xl font-black text-slate-900 mt-1 dark:text-white">
                Rs {transaction.amount.toLocaleString()}
              </div>
              <span
                className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                  isCompleted
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                }`}
              >
                {transaction.status}
              </span>
            </div>

            {/* Receipt Table */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-3 text-left dark:bg-slate-800/80 dark:border-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction Ref:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{transaction.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date & Time:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{transaction.date}</span>
              </div>
              {transaction.method && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Gateway / Method:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{transaction.method}</span>
                </div>
              )}
              {transaction.txid && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Provider TID / Hash:</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{transaction.txid}</span>
                </div>
              )}
              {transaction.accountNumber && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Account Number:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{transaction.accountNumber}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-slate-500">Description:</span>
                <span className="font-medium text-slate-700 text-right max-w-[180px] dark:text-slate-300">
                  {transaction.description}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-all flex items-center justify-center gap-1.5 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <Printer className="w-4 h-4" /> Print Receipt
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                Done
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

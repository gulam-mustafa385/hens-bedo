import React, { useState } from 'react';
import { useInvest } from '../context/InvestContext';
import { Transaction } from '../types';

interface TransactionsViewProps {
  onSelectTransaction: (tx: Transaction) => void;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  onSelectTransaction,
  onOpenDeposit,
  onOpenWithdraw,
}) => {
  const { transactions } = useInvest();
  const [activeFilter, setActiveFilter] = useState<'all' | 'Completed' | 'Processing' | 'Canceled'>('all');

  const filtered = transactions.filter((tx) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'Completed') return tx.status === 'completed';
    if (activeFilter === 'Processing') return tx.status === 'pending';
    if (activeFilter === 'Canceled') return tx.status === 'failed';
    return true;
  });

  return (
    <div className="space-y-4 pb-20 text-[#281f41]">
      {/* 1. TITLE CARD */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-sm text-center">
        <h2 className="text-base font-black text-[#281f41]">Deposit History</h2>
      </div>

      {/* 2. FILTER BAR */}
      <div className="p-2 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          {[
            { id: 'all', label: 'All' },
            { id: 'Completed', label: 'Approved' },
            { id: 'Processing', label: 'Pending' },
            { id: 'Canceled', label: 'Canceled' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveFilter(item.id as any)}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all text-center whitespace-nowrap ${
                activeFilter === item.id
                  ? 'bg-gradient-to-r from-[#1edac8] to-[#0097f3] text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. HISTORY CARDS LIST */}
      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map((tx) => {
            const isCompleted = tx.status === 'completed';
            const isPending = tx.status === 'pending';

            return (
              <div
                key={tx.id}
                onClick={() => onSelectTransaction(tx)}
                className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-3 cursor-pointer hover:border-[#0098ff] transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <small className="text-[10px] font-bold text-slate-400 block uppercase">
                      Deposit Date
                    </small>
                    <span className="text-xs font-black text-[#281f41] block mt-0.5">
                      {tx.date}
                    </span>
                  </div>

                  <div className="text-right">
                    <small className="text-[10px] font-bold text-slate-400 block uppercase">
                      Amount
                    </small>
                    <span className="text-sm font-black text-emerald-600 block mt-0.5">
                      Rs {tx.amount.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400">
                    {tx.method || tx.description}
                  </span>

                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-700'
                        : isPending
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {isCompleted ? 'Approved' : isPending ? 'Pending' : 'Canceled'}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm text-center text-xs font-bold text-slate-400">
            No records found
          </div>
        )}
      </div>
    </div>
  );
};


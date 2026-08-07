import React, { useState } from 'react';
import { INVESTMENT_PLANS } from '../data/initialData';
import { useInvest } from '../context/InvestContext';
import { useAuth } from '../context/AuthContext';

interface PlansViewProps {
  onOpenCalculator: () => void;
  onOpenDeposit: () => void;
}

export const PlansView: React.FC<PlansViewProps> = ({ onOpenCalculator, onOpenDeposit }) => {
  const { buyPlan } = useInvest();
  const { user } = useAuth();

  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ success?: boolean; message?: string } | null>(null);

  const handleBuy = (planId: string) => {
    setLoadingPlanId(planId);
    setFeedback(null);

    setTimeout(() => {
      const result = buyPlan(planId);
      setLoadingPlanId(null);
      setFeedback(result);

      if (!result.success && result.message.includes('Insufficient')) {
        setTimeout(() => {
          if (confirm('Insufficient balance. Would you like to open Deposit / Payment method?')) {
            onOpenDeposit();
          }
        }, 300);
      }
    }, 400);
  };

  return (
    <div className="space-y-4 pb-20 text-[#281f41]">
      {/* 1. PLAN HERO HEADER */}
      <div className="relative rounded-[32px] bg-gradient-to-br from-[#ff9d21] via-[#ff7836] to-[#ff6644] text-white p-5 shadow-lg overflow-hidden">
        <div className="relative z-10 space-y-1">
          <h2 className="text-2xl font-black text-white tracking-tight">Choose Your Plan</h2>
          <p className="text-xs font-semibold text-white/90">
            Select the perfect plan for your investment needs.
          </p>
        </div>

        {/* Floating badge */}
        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-black uppercase text-amber-200">
          <i className="fa fa-shield-halved text-xs" /> Real package returns & 77-day duration
        </div>
      </div>

      {/* FEEDBACK BANNER */}
      {feedback && (
        <div
          className={`p-3.5 rounded-2xl flex items-center justify-between text-xs font-extrabold ${
            feedback.success
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border border-rose-200 text-rose-900'
          }`}
        >
          <span>{feedback.message}</span>
          {!feedback.success && (
            <button
              onClick={onOpenDeposit}
              className="px-3 py-1.5 rounded-xl bg-amber-500 text-white font-black hover:bg-amber-600 transition-all text-[11px]"
            >
              Deposit Funds
            </button>
          )}
        </div>
      )}

      {/* PLAN CARDS LIST */}
      <div className="space-y-4">
        {INVESTMENT_PLANS.map((plan, index) => {
          const planNumStr = String(index + 1).padStart(2, '0');
          const isLoading = loadingPlanId === plan.id;

          return (
            <div
              key={plan.id}
              className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4 relative overflow-hidden"
            >
              {/* TOP HEADER */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-600 border border-orange-200 text-[10px] font-black uppercase tracking-wider inline-block">
                    Plan-{planNumStr}
                  </span>
                  <div className="text-xs font-bold text-slate-500 mt-1.5">
                    Perfect for growing your earnings.
                  </div>
                </div>
                <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <i className="fa fa-check text-xs" />
                </span>
              </div>

              {/* PRICE */}
              <div className="flex items-baseline gap-1 pt-1">
                <strong className="text-2xl font-black text-[#281f41]">
                  Rs {plan.price.toLocaleString()}
                </strong>
                <small className="text-xs font-bold text-slate-400">/plan</small>
              </div>

              {/* FEATURES LIST */}
              <div className="space-y-2.5 pt-1 border-t border-slate-100">
                <div className="flex items-center gap-2.5 text-xs font-bold text-[#281f41]">
                  <i className="fa fa-check text-emerald-500 text-xs" />
                  <div className="flex-1 flex justify-between">
                    <span className="text-slate-500">Daily Earning</span>
                    <strong className="font-black text-[#281f41]">
                      Rs {plan.dailyReturn.toLocaleString()}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-xs font-bold text-[#281f41]">
                  <i className="fa fa-check text-emerald-500 text-xs" />
                  <div className="flex-1 flex justify-between">
                    <span className="text-slate-500">Total Return</span>
                    <strong className="font-black text-[#0098ff]">
                      Rs {plan.totalReturn.toLocaleString()}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-xs font-bold text-[#281f41]">
                  <i className="fa fa-check text-emerald-500 text-xs" />
                  <div className="flex-1 flex justify-between">
                    <span className="text-slate-500">Duration</span>
                    <strong className="font-black text-[#281f41]">
                      {plan.durationDays} Days
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-xs font-bold text-[#281f41]">
                  <i className="fa fa-check text-emerald-500 text-xs" />
                  <div className="flex-1 flex justify-between">
                    <span className="text-slate-500">Referral Commission</span>
                    <strong className="font-black text-indigo-600">
                      18% / 3% / 0%
                    </strong>
                  </div>
                </div>
              </div>

              {/* BUY BUTTON */}
              <button
                onClick={() => handleBuy(plan.id)}
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#0098ff] hover:bg-[#0086e6] text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-75"
              >
                <span>{isLoading ? 'Processing...' : 'Buy Plan'}</span>
                <i className="fa fa-arrow-right text-xs" />
              </button>
            </div>
          );
        })}
      </div>

      {/* GUARANTEE FOOTER NOTE */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 text-center flex items-center justify-center gap-2 text-xs font-bold text-slate-500">
        <i className="fa fa-shield-halved text-emerald-500 text-sm" />
        <span>All plans show real package returns and duration.</span>
      </div>
    </div>
  );
};


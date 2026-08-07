import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calculator, ArrowRight, ShieldCheck, TrendingUp, DollarSign, Sparkles } from 'lucide-react';
import { INVESTMENT_PLANS } from '../data/initialData';

interface YieldCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan?: (planId: string) => void;
}

export const YieldCalculatorModal: React.FC<YieldCalculatorModalProps> = ({
  isOpen,
  onClose,
  onSelectPlan,
}) => {
  const [selectedPlanIndex, setSelectedPlanIndex] = useState<number>(1); // Default Plan 2
  const plan = INVESTMENT_PLANS[selectedPlanIndex] || INVESTMENT_PLANS[0];

  const totalReturn = plan.totalReturn;
  const netProfit = totalReturn - plan.price;
  const roiPercentage = ((netProfit / plan.price) * 100).toFixed(1);
  const tier1Commission = (plan.price * 0.18).toFixed(0);
  const tier2Commission = (plan.price * 0.03).toFixed(0);

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
            {/* Modal Header */}
            <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-slate-700/80 bg-[#1a1f33] z-20">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-2xl bg-blue-600/20 text-blue-400">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Yield Calculator</h3>
                  <p className="text-[11px] font-bold text-slate-400">Simulate returns across 77-day cycles</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
                title="Close"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Slider Selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Select Plan Tier
                  </label>
                  <span className="text-xs font-black text-blue-400 bg-blue-900/40 px-2.5 py-0.5 rounded-full border border-blue-800">
                    {plan.name}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={INVESTMENT_PLANS.length - 1}
                  value={selectedPlanIndex}
                  onChange={(e) => setSelectedPlanIndex(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-1.5">
                  <span>Plan 01 (Rs 433)</span>
                  <span>Plan 07 (Rs 42,477)</span>
                  <span>Plan 14 (Rs 608k)</span>
                </div>
              </div>

              {/* Principal Card */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-xl relative overflow-hidden">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Required Principal</span>
                    <div className="text-2xl font-black text-white mt-0.5">
                      Rs {plan.price.toLocaleString()}
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <Sparkles className="w-3 h-3" /> +{roiPercentage}% ROI
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-800">
                  <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/50">
                    <span className="text-[10px] font-bold text-slate-400">Daily Payout</span>
                    <div className="text-base font-black text-emerald-400 mt-0.5">
                      Rs {plan.dailyReturn.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">/day</span>
                    </div>
                  </div>

                  <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/50">
                    <span className="text-[10px] font-bold text-slate-400">77-Day Total ROI</span>
                    <div className="text-base font-black text-blue-400 mt-0.5">
                      Rs {plan.totalReturn.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Commission Potential */}
              <div className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-900/60">
                <div className="flex items-center gap-1.5 mb-2 text-xs font-black text-blue-300">
                  <TrendingUp className="w-4 h-4 text-blue-400" /> Multi-Tier Referral Profit Matrix
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between items-center p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-400 font-bold text-[11px]">Tier 1 (18%)</span>
                    <span className="font-black text-blue-400">Rs {Number(tier1Commission).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-400 font-bold text-[11px]">Tier 2 (3%)</span>
                    <span className="font-black text-indigo-400">Rs {Number(tier2Commission).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex-shrink-0 p-4 border-t border-slate-700/80 bg-[#1a1f33] flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-700 text-slate-300 font-bold hover:bg-slate-800 transition-all text-xs"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onClose();
                  if (onSelectPlan) onSelectPlan(plan.id);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 shadow-md transition-all text-xs flex items-center justify-center gap-1.5"
              >
                Subscribe Now <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

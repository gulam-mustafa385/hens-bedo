import React from 'react';
import confetti from 'canvas-confetti';
import { Award, CheckCircle2, Lock, Gift, Sparkles, TrendingUp } from 'lucide-react';
import { useInvest } from '../context/InvestContext';
import { useAuth } from '../context/AuthContext';

export const TasksView: React.FC = () => {
  const { tasks, claimTaskReward } = useInvest();
  const { user } = useAuth();

  const handleClaim = (taskId: string) => {
    const success = claimTaskReward(taskId);
    if (success) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-extrabold uppercase tracking-wider">
            <Gift className="w-3.5 h-3.5" /> Milestone Task Rewards
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Reward Acceleration Engine</h1>
          <p className="text-sm font-medium text-slate-400 max-w-lg">
            Reach volume milestones with your capital deposits and team network to unlock instant cash rewards directly to your wallet!
          </p>
        </div>

        <div className="relative z-10 bg-slate-800/80 p-4 rounded-2xl border border-slate-700 text-right">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Volume Progress</span>
          <div className="text-2xl font-black text-amber-400">
            Rs {((user?.totalDeposited || 0) + (user?.teamDeposits || 0)).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Task Cards Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tasks.map((task) => {
          const percentage = Math.min(100, Math.floor((task.currentDeposit / task.targetDeposit) * 100));
          const isClaimed = task.status === 'claimed';
          const isClaimable = task.status === 'claimable';

          return (
            <div
              key={task.id}
              className={`p-6 rounded-3xl bg-white border shadow-sm transition-all flex flex-col justify-between dark:bg-slate-900 ${
                isClaimable
                  ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-amber-500/10'
                  : 'border-slate-200/80 dark:border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase text-slate-400 tracking-wider">
                    {task.title.split('-')[0]}
                  </span>
                  <span className="text-sm font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full dark:bg-emerald-950/50 dark:text-emerald-400">
                    +Rs {task.rewardAmount.toLocaleString()} Reward
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {task.title.split('-')[1] || task.title}
                </h3>
                <p className="text-xs font-semibold text-slate-500 mt-1">
                  Volume Target: <strong className="text-slate-900 dark:text-white">Rs {task.targetDeposit.toLocaleString()}</strong>
                </p>

                {/* Progress Bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-500">
                    <span>Progress ({percentage}%)</span>
                    <span>
                      Rs {task.currentDeposit.toLocaleString()} / Rs {task.targetDeposit.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden dark:bg-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-5">
                {isClaimed ? (
                  <button
                    disabled
                    className="w-full py-3 px-4 rounded-2xl bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center justify-center gap-2 cursor-not-allowed dark:bg-emerald-950/50 dark:text-emerald-300"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Reward Claimed
                  </button>
                ) : isClaimable ? (
                  <button
                    onClick={() => handleClaim(task.id)}
                    className="w-full py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 animate-pulse"
                  >
                    <Sparkles className="w-4 h-4 fill-slate-950" /> Claim Rs {task.rewardAmount.toLocaleString()} Bonus Now!
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full py-3 px-4 rounded-2xl bg-slate-100 text-slate-400 font-bold text-xs flex items-center justify-center gap-2 cursor-not-allowed dark:bg-slate-800 dark:text-slate-500"
                  >
                    <Lock className="w-3.5 h-3.5" /> In Progress ({percentage}%)
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

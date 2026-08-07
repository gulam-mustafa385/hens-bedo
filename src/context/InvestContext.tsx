import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Transaction,
  UserInvestment,
  TaskReward,
  TeamMember,
  InvestmentPlan,
} from '../types';
import { INITIAL_TASKS, INVESTMENT_PLANS } from '../data/initialData';
import { useAuth } from './AuthContext';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';

interface InvestContextType {
  investments: UserInvestment[];
  transactions: Transaction[];
  tasks: TaskReward[];
  teamMembers: TeamMember[];
  plans: InvestmentPlan[];
  buyPlan: (planId: string) => { success: boolean; message: string };
  submitDeposit: (amount: number, methodId: string, txid: string, accountNumber: string, proofImg?: string) => void;
  submitWithdrawal: (amount: number, methodId: string, accountNumber: string, accountName: string) => { success: boolean; message: string };
  claimTaskReward: (taskId: string) => boolean;
  activeDepositsTotal: number;
  pendingWithdrawalsTotal: number;
  totalTeamDepositTotal: number;
  triggerDemoAutoApprove: (txId: string) => void;
}

const InvestContext = createContext<InvestContextType | undefined>(undefined);

const STORAGE_INVESTMENTS_KEY = 'vertex_user_investments_v2';
const STORAGE_TRANSACTIONS_KEY = 'vertex_user_transactions_v2';
const STORAGE_TASKS_KEY = 'vertex_user_tasks_v2';
const STORAGE_TEAM_KEY = 'vertex_user_team_v2';

const DEMO_INVESTMENTS: UserInvestment[] = [
  {
    id: 'inv-101',
    planId: 'plan-2',
    planName: 'Plan 02 - Growth Tier',
    investedAmount: 977,
    dailyYield: 255,
    totalEarned: 1275,
    maxReturn: 19635,
    startDate: '2026-08-02',
    nextPayoutTimestamp: Date.now() + 18450000, // in ~5 hours
    durationDays: 77,
    daysRemaining: 72,
    status: 'active',
  },
];

const DEMO_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-8921',
    type: 'deposit',
    amount: 977,
    currency: 'PKR',
    status: 'completed',
    date: '2026-08-02 14:22',
    method: 'EasyPaisa',
    txid: 'TXN9823410192',
    description: 'Deposit for Plan 02 subscription',
  },
  {
    id: 'tx-8922',
    type: 'yield',
    amount: 255,
    currency: 'PKR',
    status: 'completed',
    date: '2026-08-06 09:00',
    description: 'Daily yield payout from Plan 02',
  },
  {
    id: 'tx-8923',
    type: 'referral',
    amount: 175,
    currency: 'PKR',
    status: 'completed',
    date: '2026-08-05 18:40',
    description: 'Tier 1 Referral Bonus from user @usman_invest',
  },
  {
    id: 'tx-8924',
    type: 'withdraw',
    amount: 2500,
    currency: 'PKR',
    status: 'completed',
    date: '2026-08-04 11:15',
    method: 'JazzCash',
    accountNumber: '0300****123',
    description: 'Approved payout to JazzCash',
  },
];

const DEMO_TEAM: TeamMember[] = [
  {
    id: 'tm-1',
    username: 'usman_invest',
    email: 'usman@gmail.com',
    level: 1,
    joinedDate: '2026-08-03',
    totalDeposit: 15000,
    commissionEarned: 2700,
  },
  {
    id: 'tm-2',
    username: 'hamza_trader',
    email: 'hamza@outlook.com',
    level: 1,
    joinedDate: '2026-08-04',
    totalDeposit: 30000,
    commissionEarned: 5400,
  },
  {
    id: 'tm-3',
    username: 'ali_reza',
    email: 'ali.reza@gmail.com',
    level: 2,
    joinedDate: '2026-08-05',
    totalDeposit: 10000,
    commissionEarned: 300,
  },
];

export const InvestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, updateProfile } = useAuth();
  const firebaseReady = isFirebaseConfigured();

  const [investments, setInvestments] = useState<UserInvestment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tasks, setTasks] = useState<TaskReward[]>(INITIAL_TASKS);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  // ── Load data from Firestore (or localStorage in demo mode) when user changes ──
  useEffect(() => {
    if (!user) {
      setInvestments([]);
      setTransactions([]);
      setTasks(INITIAL_TASKS);
      setTeamMembers([]);
      return;
    }

    if (firebaseReady) {
      const fDb = db;
      if (fDb) {
        const userDocRef = doc(fDb, 'users', user.uid);
        const unsubscribe = onSnapshot(userDocRef, (snap) => {
          if (!snap.exists()) return;
          const data = snap.data();
          setInvestments(data.investments || []);
          setTransactions(data.transactions || []);
          setTasks(data.tasks || INITIAL_TASKS);
          setTeamMembers(data.teamMembers || []);
        });
        return unsubscribe;
      }
    }

    // Demo mode: load from localStorage
    const load = (key: string, fallback: unknown[]) => {
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse', key, e);
        }
      }
      return fallback;
    };
    setInvestments(load(STORAGE_INVESTMENTS_KEY, DEMO_INVESTMENTS));
    setTransactions(load(STORAGE_TRANSACTIONS_KEY, DEMO_TRANSACTIONS));
    setTasks(load(STORAGE_TASKS_KEY, INITIAL_TASKS));
    setTeamMembers(load(STORAGE_TEAM_KEY, DEMO_TEAM));
  }, [user?.uid, firebaseReady]);

  // ── Persist to Firebase (or localStorage) whenever data changes ──
  const persist = useCallback(
    (patch: Partial<{ investments: UserInvestment[]; transactions: Transaction[]; tasks: TaskReward[]; teamMembers: TeamMember[] }>) => {
      if (!user) return;
      if (firebaseReady) {
        const fDb = db;
        if (fDb) {
          setDoc(doc(fDb, 'users', user.uid), patch, { merge: true }).catch((e) =>
            console.error('Failed to persist to Firestore', e)
          );
        }
      } else {
        if (patch.investments) localStorage.setItem(STORAGE_INVESTMENTS_KEY, JSON.stringify(patch.investments));
        if (patch.transactions) localStorage.setItem(STORAGE_TRANSACTIONS_KEY, JSON.stringify(patch.transactions));
        if (patch.tasks) localStorage.setItem(STORAGE_TASKS_KEY, JSON.stringify(patch.tasks));
        if (patch.teamMembers) localStorage.setItem(STORAGE_TEAM_KEY, JSON.stringify(patch.teamMembers));
      }
    },
    [user, firebaseReady]
  );

  useEffect(() => {
    persist({ investments });
  }, [investments, persist]);

  useEffect(() => {
    persist({ transactions });
  }, [transactions, persist]);

  useEffect(() => {
    persist({ tasks });
  }, [tasks, persist]);

  useEffect(() => {
    persist({ teamMembers });
  }, [teamMembers, persist]);

  // Recalculate tasks progress dynamically based on user's total deposited & team deposits
  useEffect(() => {
    if (!user) return;
    const currentTotal = user.totalDeposited + user.teamDeposits;
    setTasks((prev) =>
      prev.map((t) => {
        const isReached = currentTotal >= t.targetDeposit;
        return {
          ...t,
          currentDeposit: Math.min(currentTotal, t.targetDeposit),
          status: t.status === 'claimed' ? 'claimed' : isReached ? 'claimable' : 'in_progress',
        };
      })
    );
  }, [user?.totalDeposited, user?.teamDeposits]);

  // Totals calculations
  const activeDepositsTotal = investments
    .filter((inv) => inv.status === 'active')
    .reduce((sum, inv) => sum + inv.investedAmount, 0);

  const pendingWithdrawalsTotal = transactions
    .filter((tx) => tx.type === 'withdraw' && tx.status === 'pending')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalTeamDepositTotal = teamMembers.reduce((sum, member) => sum + member.totalDeposit, 0);

  // Subscribe / Buy plan
  const buyPlan = (planId: string): { success: boolean; message: string } => {
    const selectedPlan = INVESTMENT_PLANS.find((p) => p.id === planId);
    if (!selectedPlan) return { success: false, message: 'Plan not found.' };

    if (!user) return { success: false, message: 'Please log in to purchase an investment plan.' };

    if (user.balance < selectedPlan.price) {
      return {
        success: false,
        message: `Insufficient wallet balance (Rs ${user.balance.toLocaleString()}). Please deposit funds first.`,
      };
    }

    // Deduct balance and update user
    const newBalance = user.balance - selectedPlan.price;
    const newTotalDeposited = user.totalDeposited + selectedPlan.price;

    updateProfile({
      balance: newBalance,
      totalDeposited: newTotalDeposited,
      activePlanName: selectedPlan.name,
    });

    // Create investment record
    const newInv: UserInvestment = {
      id: 'inv-' + Math.floor(100000 + Math.random() * 900000),
      planId: selectedPlan.id,
      planName: selectedPlan.name,
      investedAmount: selectedPlan.price,
      dailyYield: selectedPlan.dailyReturn,
      totalEarned: 0,
      maxReturn: selectedPlan.totalReturn,
      startDate: new Date().toISOString().split('T')[0],
      nextPayoutTimestamp: Date.now() + 86400000,
      durationDays: selectedPlan.durationDays,
      daysRemaining: selectedPlan.durationDays,
      status: 'active',
    };

    setInvestments((prev) => [newInv, ...prev]);

    // Record transaction
    const newTx: Transaction = {
      id: 'tx-' + Math.floor(10000 + Math.random() * 90000),
      type: 'deposit',
      amount: selectedPlan.price,
      currency: 'PKR',
      status: 'completed',
      date: new Date().toLocaleString(),
      planName: selectedPlan.name,
      description: `Activated ${selectedPlan.name}`,
    };

    setTransactions((prev) => [newTx, ...prev]);

    return {
      success: true,
      message: `Successfully subscribed to ${selectedPlan.name}!`,
    };
  };

  // Deposit funds request
  const submitDeposit = (
    amount: number,
    methodId: string,
    txid: string,
    accountNumber: string,
    _proofImg?: string
  ) => {
    if (!user) return;

    const newTx: Transaction = {
      id: 'tx-dep-' + Math.floor(10000 + Math.random() * 90000),
      type: 'deposit',
      amount,
      currency: 'PKR',
      status: 'pending',
      date: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
      method: methodId.toUpperCase(),
      accountNumber,
      txid: txid || 'TXID-' + Math.floor(10000000 + Math.random() * 90000000),
      description: `Manual Deposit via ${methodId.toUpperCase()} (TRX: ${txid})`,
    };

    setTransactions((prev) => [newTx, ...prev]);
    updateProfile({
      pendingDepositsCount: (user.pendingDepositsCount || 0) + 1,
    });
  };

  // Trigger demo auto-approve deposit for testing
  const triggerDemoAutoApprove = (txId: string) => {
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id === txId && t.status === 'pending') {
          if (user) {
            updateProfile({
              balance: user.balance + t.amount,
              totalDeposited: user.totalDeposited + t.amount,
              pendingDepositsCount: Math.max(0, (user.pendingDepositsCount || 1) - 1),
            });
          }
          return { ...t, status: 'completed' as const };
        }
        return t;
      })
    );
  };

  // Submit withdrawal request
  const submitWithdrawal = (
    amount: number,
    methodId: string,
    accountNumber: string,
    accountName: string
  ): { success: boolean; message: string } => {
    if (!user) return { success: false, message: 'Please login first.' };

    if (amount <= 0) return { success: false, message: 'Enter a valid amount.' };

    if (user.balance < amount) {
      return { success: false, message: 'Insufficient account balance for this withdrawal.' };
    }

    // Deduct user balance immediately
    const updatedBalance = user.balance - amount;
    updateProfile({
      balance: updatedBalance,
      pendingWithdrawalsCount: (user.pendingWithdrawalsCount || 0) + 1,
    });

    const newTx: Transaction = {
      id: 'tx-wd-' + Math.floor(10000 + Math.random() * 90000),
      type: 'withdraw',
      amount,
      currency: 'PKR',
      status: 'pending',
      date: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
      method: methodId.toUpperCase(),
      accountNumber,
      accountName,
      description: `Withdrawal request to ${methodId.toUpperCase()} (${accountNumber})`,
    };

    setTransactions((prev) => [newTx, ...prev]);

    return {
      success: true,
      message: 'Withdrawal request submitted successfully! Funds will be transferred after processing.',
    };
  };

  // Claim task reward
  const claimTaskReward = (taskId: string): boolean => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status !== 'claimable' || !user) return false;

    // Credit reward
    updateProfile({
      balance: user.balance + task.rewardAmount,
    });

    // Mark task claimed
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: 'claimed' as const } : t))
    );

    // Record transaction
    const newTx: Transaction = {
      id: 'tx-task-' + Math.floor(10000 + Math.random() * 90000),
      type: 'task_reward',
      amount: task.rewardAmount,
      currency: 'PKR',
      status: 'completed',
      date: new Date().toLocaleString(),
      description: `Claimed ${task.title} Reward`,
    };

    setTransactions((prev) => [newTx, ...prev]);

    return true;
  };

  return (
    <InvestContext.Provider
      value={{
        investments,
        transactions,
        tasks,
        teamMembers,
        plans: INVESTMENT_PLANS,
        buyPlan,
        submitDeposit,
        submitWithdrawal,
        claimTaskReward,
        activeDepositsTotal,
        pendingWithdrawalsTotal,
        totalTeamDepositTotal,
        triggerDemoAutoApprove,
      }}
    >
      {children}
    </InvestContext.Provider>
  );
};

export const useInvest = () => {
  const context = useContext(InvestContext);
  if (!context) {
    throw new Error('useInvest must be used within an InvestProvider');
  }
  return context;
};

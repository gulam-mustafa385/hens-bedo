export type TransactionType = 'deposit' | 'withdraw' | 'yield' | 'referral' | 'task_reward';
export type TransactionStatus = 'completed' | 'pending' | 'rejected';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  status: TransactionStatus;
  date: string;
  method?: string;
  accountNumber?: string;
  accountName?: string;
  txid?: string;
  description: string;
  planName?: string;
}

export interface InvestmentPlan {
  id: string;
  name: string;
  tierTag: string; // e.g. 'Starter', 'Popular', 'Pro', 'VIP'
  price: number;
  dailyReturn: number;
  totalReturn: number;
  durationDays: number;
  referralCommission: string;
  badgeColor?: string;
  isPopular?: boolean;
  minDeposit?: number;
  maxDeposit?: number;
}

export interface UserInvestment {
  id: string;
  planId: string;
  planName: string;
  investedAmount: number;
  dailyYield: number;
  totalEarned: number;
  maxReturn: number;
  startDate: string;
  nextPayoutTimestamp: number; // Unix ms
  durationDays: number;
  daysRemaining: number;
  status: 'active' | 'completed';
}

export interface TaskReward {
  id: string;
  title: string;
  targetDeposit: number;
  rewardAmount: number;
  currentDeposit: number;
  status: 'in_progress' | 'claimable' | 'claimed';
}

export interface TeamMember {
  id: string;
  username: string;
  email: string;
  level: 1 | 2 | 3;
  joinedDate: string;
  totalDeposit: number;
  commissionEarned: number;
}

export interface UserProfile {
  uid: string;
  username: string;
  email: string;
  role?: 'admin' | 'user';
  balance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalYieldEarned: number;
  teamDeposits: number;
  referralCode: string;
  referredBy?: string;
  activePlanName?: string;
  pendingWithdrawalsCount: number;
  pendingDepositsCount: number;
  createdAt: string;
  transactions?: Transaction[];
  investments?: UserInvestment[];
  teamMembers?: TeamMember[];
  tasks?: TaskReward[];
}

export interface PaymentGateway {
  id: string;
  name: string;
  type: 'easypaisa' | 'jazzcash' | 'bank' | 'nayapay' | 'sadapay' | 'upaisa' | 'crypto';
  icon: string;
  accountTitle: string;
  accountNumber: string;
  bankName?: string;
  instructions: string;
  minAmount: number;
  maxAmount: number;
}

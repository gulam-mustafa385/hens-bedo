import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  BarChart3,
  Bell,
  Building2,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  CreditCard,
  FileText,
  Landmark,
  LayoutDashboard,
  LineChart,
  LogOut,
  Menu,
  MessageSquare,
  Search,
  Settings,
  ShieldCheck,
  TrendingUp,
  UserRound,
  Users,
  X,
  Wallet,
  Globe,
  Zap,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Eye,
  EyeOff,
  UserCheck,
  UserX,
  Ban,
  Trash2,
  Send,
  Megaphone,
  Database,
  Lock,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { UserProfile, Transaction } from '../types';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  setDoc,
  query,
  orderBy,
  serverTimestamp,
  getDoc,
} from 'firebase/firestore';

interface AdminPanelProps {
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const { user, logout } = useAuth();
  const [section, setSection] = useState('dashboard');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadUsers = async () => {
    if (!isFirebaseConfigured() || !db) {
      setUsers([]);
      setLoading(false);
      return;
    }

    try {
      const snapshot = await getDocs(collection(db, 'users'));
      const arr: UserProfile[] = [];
      snapshot.forEach((snap) => {
        const dt = snap.data() as any;
        arr.push({ ...dt, uid: snap.id, role: dt.role || 'user' } as UserProfile);
      });
      setUsers(arr);
    } catch (e) {
      console.error('Failed to load admin users', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const changeUserRole = async (uid: string, nextRole: 'admin' | 'user') => {
    if (!isFirebaseConfigured() || !db) return;
    try {
      await updateDoc(doc(db, 'users', uid), {
        role: nextRole,
      });
      await loadUsers();
    } catch (e) {
      console.error('Failed to update user role', e);
    }
  };

  const us = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return users;
    return users.filter((item) => {
      return (
        item.username?.toLowerCase().includes(keyword) ||
        item.email?.toLowerCase().includes(keyword) ||
        item.uid?.toLowerCase().includes(keyword)
      );
    });
  }, [users, search]);

  const transactions = useMemo(() => {
    return users.flatMap((u) => {
      const txs: Transaction[] = Array.isArray((u as any).transactions) ? (u as any).transactions : [];
      return txs.map((tx) => ({ ...tx, userName: u.username, userUid: u.uid }));
    });
  }, [users]);

  const analytics = useMemo(() => {
    const totalBalance = users.reduce((sum, u) => sum + Number(u.balance || 0), 0);
    const totalDeposited = users.reduce((sum, u) => sum + Number(u.totalDeposited || 0), 0);
    const totalWithdrawn = users.reduce((sum, u) => sum + Number(u.totalWithdrawn || 0), 0);
    const activeAdmins = users.filter((u) => (u.role || 'user') === 'admin').length;
    const referrals = users.filter((u) => Boolean(u.referredBy || u.referralCode)).length;

    return {
      totalBalance,
      totalDeposited,
      totalWithdrawn,
      activeAdmins,
      referrals,
    };
  }, [users]);

  const deposits = transactions.filter((tx) => tx.type === 'deposit');
  const withdrawals = transactions.filter((tx) => tx.type === 'withdraw');
  const pendingDeposits = deposits.filter((tx) => tx.status === 'pending');
  const approvedDeposits = deposits.filter((tx) => tx.status === 'completed');
  const pendingWithdrawals = withdrawals.filter((tx) => tx.status === 'pending');
  const approvedWithdrawals = withdrawals.filter((tx) => tx.status === 'completed');

  const approveDeposit = async (tx: any) => {
    if (!isFirebaseConfigured() || !db || !tx.userUid) return;

    const userRef = doc(db, 'users', tx.userUid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return;

    const data = snap.data() as any;
    const currentBalance = Number(data.balance || 0);
    const nextBalance = currentBalance + Number(tx.amount || 0);

    await updateDoc(userRef, {
      balance: nextBalance,
      totalDeposited: Number(data.totalDeposited || 0) + Number(tx.amount || 0),
      pendingDepositsCount: Math.max(0, Number(data.pendingDepositsCount || 0) - 1),
      transactions: (Array.isArray(data.transactions) ? data.transactions : []).map((item: any) =>
        item.id === tx.id ? { ...item, status: 'completed' } : item
      ),
    });

    await setDoc(doc(db, 'notifications', `${tx.userUid}-${Date.now()}`), {
      uid: tx.userUid,
      title: 'Deposit Approved',
      message: `Your deposit request of ${tx.amount} PKR has been approved.`,
      createdAt: serverTimestamp(),
      read: false,
    });

    loadUsers();
  };

  const rejectDeposit = async (tx: any) => {
    if (!isFirebaseConfigured() || !db || !tx.userUid) return;
    const userRef = doc(db, 'users', tx.userUid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return;

    const data = snap.data() as any;
    await updateDoc(userRef, {
      pendingDepositsCount: Math.max(0, Number(data.pendingDepositsCount || 0) - 1),
      transactions: (Array.isArray(data.transactions) ? data.transactions : []).map((item: any) =>
        item.id === tx.id ? { ...item, status: 'rejected' } : item
      ),
    });

    await setDoc(doc(db, 'notifications', `${tx.userUid}-${Date.now()}`), {
      uid: tx.userUid,
      title: 'Deposit Rejected',
      message: `Your deposit request of ${tx.amount} PKR was rejected.`,
      createdAt: serverTimestamp(),
      read: false,
    });

    loadUsers();
  };

  const approveWithdrawal = async (tx: any) => {
    if (!isFirebaseConfigured() || !db || !tx.userUid) return;
    const userRef = doc(db, 'users', tx.userUid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return;

    const data = snap.data() as any;
    const currentBalance = Number(data.balance || 0);
    const amount = Number(tx.amount || 0);

    await updateDoc(userRef, {
      balance: Math.max(0, currentBalance - amount),
      totalWithdrawn: Number(data.totalWithdrawn || 0) + amount,
      pendingWithdrawalsCount: Math.max(0, Number(data.pendingWithdrawalsCount || 0) - 1),
      transactions: (Array.isArray(data.transactions) ? data.transactions : []).map((item: any) =>
        item.id === tx.id ? { ...item, status: 'completed' } : item
      ),
    });

    await setDoc(doc(db, 'notifications', `${tx.userUid}-${Date.now()}`), {
      uid: tx.userUid,
      title: 'Withdrawal Approved',
      message: `Your withdrawal of ${amount} PKR has been approved and processed.`,
      createdAt: serverTimestamp(),
      read: false,
    });

    loadUsers();
  };

  const rejectWithdrawal = async (tx: any) => {
    if (!isFirebaseConfigured() || !db || !tx.userUid) return;
    const userRef = doc(db, 'users', tx.userUid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return;

    const data = snap.data() as any;
    await updateDoc(userRef, {
      pendingWithdrawalsCount: Math.max(0, Number(data.pendingWithdrawalsCount || 0) - 1),
      transactions: (Array.isArray(data.transactions) ? data.transactions : []).map((item: any) =>
        item.id === tx.id ? { ...item, status: 'rejected' } : item
      ),
    });

    await setDoc(doc(db, 'notifications', `${tx.userUid}-${Date.now()}`), {
      uid: tx.userUid,
      title: 'Withdrawal Rejected',
      message: `Your withdrawal request of ${tx.amount} PKR was rejected.`,
      createdAt: serverTimestamp(),
      read: false,
    });

    loadUsers();
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'deposits', label: 'Deposits', icon: Landmark },
    { id: 'withdrawals', label: 'Withdrawals', icon: CircleDollarSign },
    { id: 'referral', label: 'Referral', icon: TrendingUp },
    { id: 'transactions', label: 'Transactions', icon: Activity },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'announcements', label: 'Announcements', icon: MessageSquare },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'analytics', label: 'Analytics', icon: LineChart },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'support', label: 'Support', icon: FileText },
  ];

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.substring(0, 2).toUpperCase();
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Approved
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-black border border-amber-200">
            <Clock3 className="w-3 h-3" /> Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-[10px] font-black border border-rose-200">
            <Ban className="w-3 h-3" /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100">
      <div className="flex min-h-screen">
        {/* ─── SIDEBAR ─── */}
        <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-[#1e1b4b] via-[#312e81] to-[#1e1b4b] text-white flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          {/* Brand */}
          <div className="px-6 py-7 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-300">Hens Bedo</div>
                <div className="text-lg font-black tracking-tight">Admin Console</div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = section === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setSection(item.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                    active
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  {item.id === 'deposits' && pendingDeposits.length > 0 && (
                    <span className="ml-auto bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                      {pendingDeposits.length}
                    </span>
                  )}
                  {item.id === 'withdrawals' && pendingWithdrawals.length > 0 && (
                    <span className="ml-auto bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                      {pendingWithdrawals.length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="px-4 py-5 border-t border-white/10">
            <button
              onClick={async () => {
                await logout();
                onClose();
                window.location.assign('/');
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-rose-500/20 text-rose-300 font-black text-sm hover:bg-rose-500 hover:text-white transition-all"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </aside>

        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* ─── MAIN CONTENT ─── */}
        <main className="flex-1 min-w-0 bg-[#f1f5f9] text-slate-900">
          {/* Topbar */}
          <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Control Center</div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {navItems.find((x) => x.id === section)?.label || 'Dashboard'}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden md:flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  className="w-40 outline-none bg-transparent text-xs font-bold text-slate-600 placeholder:text-slate-400"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search users..."
                />
              </div>
              <button className="relative flex items-center justify-center h-10 w-10 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200">
                <Bell className="h-4 w-4" />
                {(pendingDeposits.length + pendingWithdrawals.length) > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
                    {pendingDeposits.length + pendingWithdrawals.length}
                  </span>
                )}
              </button>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center font-black text-xs">
                  {getInitials(user?.username)}
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-black text-slate-900">{user?.username || 'Admin'}</div>
                  <div className="text-[9px] font-black text-violet-600 uppercase">Super Admin</div>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </div>
              <button
                onClick={onClose}
                className="hidden sm:flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 text-white font-black text-xs hover:bg-slate-800 transition-all"
              >
                <X className="h-3.5 w-3.5" /> Close
              </button>
            </div>
          </header>

          <div className="p-4 sm:p-6 lg:p-8">
            {/* ─── DASHBOARD ─── */}
            {section === 'dashboard' && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-slate-400">Total Users</span>
                      <span className="rounded-xl bg-violet-50 text-violet-600 p-2"><Users className="h-4 w-4" /></span>
                    </div>
                    <div className="mt-3 flex items-end justify-between">
                      <div>
                        <div className="text-3xl font-black text-slate-900">{users.length}</div>
                        <div className="text-[10px] font-black text-slate-400 mt-1">Active accounts</div>
                      </div>
                      <span className="text-emerald-600 text-xs font-black flex items-center gap-1">
                        <ArrowUpRight className="h-3 w-3" /> {users.length > 0 ? '+Live' : '0'}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-slate-400">Wallet Value</span>
                      <span className="rounded-xl bg-amber-50 text-amber-600 p-2"><Wallet className="h-4 w-4" /></span>
                    </div>
                    <div className="mt-3 flex items-end justify-between">
                      <div>
                        <div className="text-3xl font-black text-slate-900">PKR {Number(analytics.totalBalance || 0).toLocaleString()}</div>
                        <div className="text-[10px] font-black text-slate-400 mt-1">Total balance</div>
                      </div>
                      <span className="text-emerald-600 text-xs font-black flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-slate-400">Pending Deposits</span>
                      <span className="rounded-xl bg-orange-50 text-orange-600 p-2"><Landmark className="h-4 w-4" /></span>
                    </div>
                    <div className="mt-3 flex items-end justify-between">
                      <div>
                        <div className="text-3xl font-black text-slate-900">{pendingDeposits.length}</div>
                        <div className="text-[10px] font-black text-slate-400 mt-1">Awaiting review</div>
                      </div>
                      <span className={`text-xs font-black ${pendingDeposits.length > 0 ? 'text-orange-600' : 'text-emerald-600'}`}>
                        {pendingDeposits.length > 0 ? 'Needs action' : 'Clear'}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-slate-400">Referral Network</span>
                      <span className="rounded-xl bg-emerald-50 text-emerald-600 p-2"><TrendingUp className="h-4 w-4" /></span>
                    </div>
                    <div className="mt-3 flex items-end justify-between">
                      <div>
                        <div className="text-3xl font-black text-slate-900">{analytics.referrals}</div>
                        <div className="text-[10px] font-black text-slate-400 mt-1">Linked users</div>
                      </div>
                      <span className="text-emerald-600 text-xs font-black">{users.length ? 'Active' : 'No data'}</span>
                    </div>
                  </div>
                </div>

                {/* Performance + Admin Status */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  {/* Performance */}
                  <div className="xl:col-span-2 rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h3 className="text-lg font-black text-slate-900">Performance Overview</h3>
                        <p className="text-[10px] font-black uppercase text-slate-400 mt-1">Investment operations</p>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-slate-500">Deposits</span>
                          <ArrowDownRight className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div className="text-2xl font-black text-slate-900 mt-2">PKR {Number(analytics.totalDeposited || 0).toLocaleString()}</div>
                        <div className="text-[10px] font-black text-slate-400 mt-1">{deposits.length} records</div>
                      </div>
                      <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-slate-500">Withdrawals</span>
                          <ArrowUpRight className="h-4 w-4 text-amber-600" />
                        </div>
                        <div className="text-2xl font-black text-slate-900 mt-2">PKR {Number(analytics.totalWithdrawn || 0).toLocaleString()}</div>
                        <div className="text-[10px] font-black text-slate-400 mt-1">{withdrawals.length} records</div>
                      </div>
                    </div>

                    <div className="mt-5">
                      <div className="flex justify-between text-[10px] font-black text-slate-400 mb-1.5">
                        <span>Platform Growth</span>
                        <span>{users.length ? 'Healthy' : 'Waiting for data'}</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-violet-500 via-indigo-500 to-emerald-500 transition-all duration-500" style={{ width: `${users.length ? Math.min(95, 30 + users.length * 5) : 4}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Admin Status */}
                  <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-lg font-black text-slate-900">Admin Status</h3>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 text-violet-700 text-[10px] font-black border border-violet-200">
                        <ShieldCheck className="w-3 h-3" /> Operational
                      </span>
                    </div>
                    <div className="space-y-4">
                      <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-slate-500">Admin Accounts</span>
                          <ShieldCheck className="h-4 w-4 text-violet-600" />
                        </div>
                        <div className="text-2xl font-black text-slate-900 mt-2">{analytics.activeAdmins}</div>
                      </div>
                      <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-slate-500">Pending Tasks</span>
                          <Zap className="h-4 w-4 text-amber-600" />
                        </div>
                        <div className="text-2xl font-black text-slate-900 mt-2">{pendingDeposits.length + pendingWithdrawals.length}</div>
                      </div>
                      <div className="rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 p-4 text-white">
                        <div className="text-[10px] font-black uppercase text-violet-200">Total Platform Value</div>
                        <div className="text-xl font-black mt-1">PKR {Number(analytics.totalBalance + analytics.totalDeposited).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-black text-slate-900">Recent Activity</h3>
                    <span className="text-[10px] font-black uppercase text-slate-400">Last 24h</span>
                  </div>
                  <div className="space-y-3">
                    {transactions.length > 0 ? transactions.slice(0, 6).map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${tx.type === 'deposit' ? 'bg-emerald-50 text-emerald-600' : tx.type === 'withdraw' ? 'bg-rose-50 text-rose-600' : 'bg-violet-50 text-violet-600'}`}>
                            {tx.type === 'deposit' ? <ArrowDownRight className="h-4 w-4" /> : tx.type === 'withdraw' ? <ArrowUpRight className="h-4 w-4" /> : <Activity className="h-4 w-4" />}
                          </div>
                          <div>
                            <div className="font-black text-sm text-slate-900">{tx.userName || 'User'} • {tx.description}</div>
                            <div className="text-[10px] font-bold text-slate-400">{tx.date || '—'}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-700">PKR {Number(tx.amount || 0).toLocaleString()}</span>
                          {statusBadge(tx.status)}
                        </div>
                      </div>
                    )) : (
                      <div className="rounded-xl bg-slate-50 border border-dashed border-slate-300 p-6 text-sm font-black text-slate-400 text-center">
                        No recent activity yet. User actions and finance records will appear here.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ─── USERS ─── */}
            {section === 'users' && (
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-black text-slate-900">User Management</h2>
                    <p className="text-xs font-bold text-slate-400 mt-0.5">Registered users on the platform</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <Search className="h-4 w-4 text-slate-400" />
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search users..."
                        className="w-40 outline-none bg-transparent text-xs font-bold text-slate-600 placeholder:text-slate-400"
                      />
                    </div>
                    <button className="px-4 py-2 rounded-xl bg-slate-900 text-white font-black text-xs hover:bg-slate-800 transition-all">
                      Filter
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] font-black uppercase text-slate-400">
                        <th className="py-3 px-5">User</th>
                        <th className="py-3 px-5">Role</th>
                        <th className="py-3 px-5">Wallet</th>
                        <th className="py-3 px-5">Referral</th>
                        <th className="py-3 px-5">Deposits</th>
                        <th className="py-3 px-5">Withdrawals</th>
                        <th className="py-3 px-5">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {us.map((item) => (
                        <tr key={item.uid} className="border-t border-slate-100 hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white font-black text-sm shadow-sm">
                                {getInitials(item.username)}
                              </span>
                              <div>
                                <div className="font-black text-sm text-slate-900">{item.username}</div>
                                <div className="text-[10px] font-bold text-slate-400">{item.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-5">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border ${
                              item.role === 'admin'
                                ? 'bg-violet-50 text-violet-700 border-violet-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}>
                              {item.role === 'admin' && <ShieldCheck className="w-3 h-3" />}
                              {item.role || 'user'}
                            </span>
                          </td>
                          <td className="py-4 px-5 font-black text-sm text-slate-900">Rs {Number(item.balance || 0).toLocaleString()}</td>
                          <td className="py-4 px-5">
                            <span className="font-mono font-black text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">{item.referralCode}</span>
                          </td>
                          <td className="py-4 px-5 text-xs font-bold text-slate-600">Rs {Number(item.totalDeposited || 0).toLocaleString()}</td>
                          <td className="py-4 px-5 text-xs font-bold text-slate-600">Rs {Number(item.totalWithdrawn || 0).toLocaleString()}</td>
                          <td className="py-4 px-5">
                            <div className="flex flex-wrap gap-1.5">
                              <button className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-black hover:bg-slate-200 transition-all">
                                <Eye className="w-3 h-3 inline mr-1" />Profile
                              </button>
                              <button
                                onClick={() => changeUserRole(item.uid, item.role === 'admin' ? 'user' : 'admin')}
                                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black transition-all ${
                                  item.role === 'admin'
                                    ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                                    : 'bg-violet-50 text-violet-600 hover:bg-violet-100'
                                }`}
                              >
                                {item.role === 'admin' ? <UserX className="w-3 h-3 inline mr-1" /> : <UserCheck className="w-3 h-3 inline mr-1" />}
                                {item.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                              </button>
                              <button className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-black hover:bg-emerald-100 transition-all">
                                <Check className="w-3 h-3 inline mr-1" />Activate
                              </button>
                              <button className="px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-600 text-[10px] font-black hover:bg-amber-100 transition-all">
                                <Ban className="w-3 h-3 inline mr-1" />Suspend
                              </button>
                              <button className="px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-600 text-[10px] font-black hover:bg-rose-100 transition-all">
                                <Trash2 className="w-3 h-3 inline mr-1" />Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ─── DEPOSITS ─── */}
            {section === 'deposits' && (
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-slate-900">Deposit Management</h2>
                    <p className="text-xs font-bold text-slate-400 mt-0.5">Review and process user deposits</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-black border border-amber-200">
                    <Clock3 className="w-3 h-3" /> {pendingDeposits.length} Pending
                  </span>
                </div>
                <div className="p-5 space-y-3">
                  {deposits.length > 0 ? deposits.map((tx) => (
                    <div key={tx.id} className="border border-slate-100 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 hover:border-slate-200 hover:shadow-sm transition-all">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <ArrowDownRight className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-black text-sm text-slate-900">{tx.userName || 'Unknown User'}</div>
                          <div className="text-[10px] font-bold text-slate-400">{tx.date || '—'}</div>
                          <div className="text-xs font-black text-slate-600 mt-1">
                            PKR {Number(tx.amount || 0).toLocaleString()} • {tx.method || 'Unknown'} • <span className="font-mono">{tx.txid || 'TXN'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {statusBadge(tx.status)}
                        {tx.status === 'pending' && (
                          <>
                            <button
                              onClick={() => approveDeposit(tx)}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white font-black text-xs hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 transition-all"
                            >
                              <Check className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button
                              onClick={() => rejectDeposit(tx)}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 text-white font-black text-xs hover:bg-rose-700 shadow-sm shadow-rose-600/20 transition-all"
                            >
                              <Ban className="w-3.5 h-3.5" /> Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )) : (
                    <div className="rounded-xl bg-slate-50 border border-dashed border-slate-300 p-8 text-sm font-black text-slate-400 text-center">
                      No deposits found yet.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ─── WITHDRAWALS ─── */}
            {section === 'withdrawals' && (
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-slate-900">Withdrawal Management</h2>
                    <p className="text-xs font-bold text-slate-400 mt-0.5">Review and process user withdrawals</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-black border border-rose-200">
                    <Clock3 className="w-3 h-3" /> {pendingWithdrawals.length} Pending
                  </span>
                </div>
                <div className="p-5 space-y-3">
                  {withdrawals.length > 0 ? withdrawals.map((tx) => (
                    <div key={tx.id} className="border border-slate-100 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 hover:border-slate-200 hover:shadow-sm transition-all">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                          <ArrowUpRight className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-black text-sm text-slate-900">{tx.userName || 'Unknown User'}</div>
                          <div className="text-[10px] font-bold text-slate-400">{tx.date || '—'}</div>
                          <div className="text-xs font-black text-slate-600 mt-1">
                            PKR {Number(tx.amount || 0).toLocaleString()} • {tx.method || 'Unknown'} • <span className="font-mono">{tx.accountNumber || '—'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {statusBadge(tx.status)}
                        {tx.status === 'pending' && (
                          <>
                            <button
                              onClick={() => approveWithdrawal(tx)}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white font-black text-xs hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 transition-all"
                            >
                              <Check className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button
                              onClick={() => rejectWithdrawal(tx)}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 text-white font-black text-xs hover:bg-rose-700 shadow-sm shadow-rose-600/20 transition-all"
                            >
                              <Ban className="w-3.5 h-3.5" /> Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )) : (
                    <div className="rounded-xl bg-slate-50 border border-dashed border-slate-300 p-8 text-sm font-black text-slate-400 text-center">
                      No withdrawals found yet.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ─── REFERRAL ─── */}
            {section === 'referral' && (
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
                <h2 className="text-xl font-black text-slate-900">Referral Management</h2>
                <p className="text-xs font-bold text-slate-400 mt-0.5">Track and manage the referral network</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="rounded-xl bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-slate-500">Referral Statistics</span>
                      <TrendingUp className="h-4 w-4 text-violet-600" />
                    </div>
                    <div className="text-3xl font-black text-slate-900 mt-2">{users.length}</div>
                    <div className="text-[10px] font-black text-slate-400 mt-1">Total users in network</div>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-slate-500">Top Referrers</span>
                      <Award className="h-4 w-4 text-amber-600" />
                    </div>
                    <div className="text-3xl font-black text-slate-900 mt-2">—</div>
                    <div className="text-[10px] font-black text-slate-400 mt-1">Leaderboard coming soon</div>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-slate-500">Referral Rewards</span>
                      <Award className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="text-3xl font-black text-slate-900 mt-2">18%</div>
                    <div className="text-[10px] font-black text-slate-400 mt-1">Tier 1 commission rate</div>
                  </div>
                </div>
              </div>
            )}

            {/* ─── TRANSACTIONS ─── */}
            {section === 'transactions' && (
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 sm:p-6 border-b border-slate-100">
                  <h2 className="text-xl font-black text-slate-900">All Transactions</h2>
                  <p className="text-xs font-bold text-slate-400 mt-0.5">Complete transaction history across all users</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] font-black uppercase text-slate-400">
                        <th className="py-3 px-5">User</th>
                        <th className="py-3 px-5">Type</th>
                        <th className="py-3 px-5">Amount</th>
                        <th className="py-3 px-5">Method</th>
                        <th className="py-3 px-5">Date</th>
                        <th className="py-3 px-5">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.length > 0 ? transactions.slice(0, 20).map((tx) => (
                        <tr key={tx.id} className="border-t border-slate-100 hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-5 font-black text-sm text-slate-900">{tx.userName || 'Unknown'}</td>
                          <td className="py-3 px-5">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border ${
                              tx.type === 'deposit' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              tx.type === 'withdraw' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                              tx.type === 'yield' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              tx.type === 'referral' ? 'bg-violet-50 text-violet-700 border-violet-200' :
                              'bg-slate-100 text-slate-600 border-slate-200'
                            }`}>
                              {tx.type}
                            </span>
                          </td>
                          <td className="py-3 px-5 font-black text-sm text-slate-900">PKR {Number(tx.amount || 0).toLocaleString()}</td>
                          <td className="py-3 px-5 text-xs font-bold text-slate-600">{tx.method || '—'}</td>
                          <td className="py-3 px-5 text-xs font-bold text-slate-500">{tx.date || '—'}</td>
                          <td className="py-3 px-5">{statusBadge(tx.status)}</td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-sm font-black text-slate-400">No transactions found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ─── NOTIFICATIONS ─── */}
            {section === 'notifications' && (
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
                <h2 className="text-xl font-black text-slate-900">Send Notification</h2>
                <p className="text-xs font-bold text-slate-400 mt-0.5">Send a notification to a specific user or all users</p>
                <div className="mt-5 space-y-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Recipient</label>
                    <select className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-violet-500 bg-white">
                      <option value="all">All Users</option>
                      {users.map((u) => (
                        <option key={u.uid} value={u.uid}>@{u.username} ({u.email})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Message</label>
                    <textarea
                      className="w-full min-h-[150px] rounded-xl border border-slate-200 p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-violet-500"
                      placeholder="Write your notification message here..."
                    />
                  </div>
                  <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-black text-xs shadow-lg shadow-indigo-600/20 hover:brightness-110 transition-all">
                    <Send className="h-4 w-4" /> Send Notification
                  </button>
                </div>
              </div>
            )}

            {/* ─── ANNOUNCEMENTS ─── */}
            {section === 'announcements' && (
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
                <h2 className="text-xl font-black text-slate-900">Create Announcement</h2>
                <p className="text-xs font-bold text-slate-400 mt-0.5">Broadcast an announcement to all users</p>
                <div className="mt-5 space-y-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Announcement Title</label>
                    <input
                      type="text"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-violet-500"
                      placeholder="e.g. New Plan Launch!"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Announcement Content</label>
                    <textarea
                      className="w-full min-h-[150px] rounded-xl border border-slate-200 p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-violet-500"
                      placeholder="Write your announcement here..."
                    />
                  </div>
                  <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-black text-xs hover:bg-slate-800 transition-all">
                    <Megaphone className="h-4 w-4" /> Send to all users
                  </button>
                </div>
              </div>
            )}

            {/* ─── REPORTS ─── */}
            {section === 'reports' && (
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
                <h2 className="text-xl font-black text-slate-900">Reports</h2>
                <p className="text-sm font-bold text-slate-400 mt-3">Platform reports configuration is available for future expansion.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="rounded-xl bg-slate-50 border border-slate-100 p-5 text-center">
                    <FileText className="h-8 w-8 text-slate-400 mx-auto" />
                    <div className="font-black text-sm text-slate-700 mt-2">Daily Report</div>
                    <div className="text-[10px] font-bold text-slate-400">Coming soon</div>
                  </div>
                  <div className="rounded-xl bg-slate-50 border border-slate-100 p-5 text-center">
                    <BarChart3 className="h-8 w-8 text-slate-400 mx-auto" />
                    <div className="font-black text-sm text-slate-700 mt-2">Monthly Report</div>
                    <div className="text-[10px] font-bold text-slate-400">Coming soon</div>
                  </div>
                  <div className="rounded-xl bg-slate-50 border border-slate-100 p-5 text-center">
                    <Database className="h-8 w-8 text-slate-400 mx-auto" />
                    <div className="font-black text-sm text-slate-700 mt-2">Export Data</div>
                    <div className="text-[10px] font-bold text-slate-400">Coming soon</div>
                  </div>
                </div>
              </div>
            )}

            {/* ─── ANALYTICS ─── */}
            {section === 'analytics' && (
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
                <h2 className="text-xl font-black text-slate-900">Analytics</h2>
                <p className="text-xs font-bold text-slate-400 mt-0.5">Platform performance analytics</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                  <div className="rounded-xl bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 p-5">
                    <div className="text-[10px] font-black uppercase text-slate-500">Total Deposits</div>
                    <div className="text-2xl font-black text-slate-900 mt-1">PKR {Number(analytics.totalDeposited || 0).toLocaleString()}</div>
                    <div className="text-[10px] font-black text-emerald-600 mt-1">{deposits.length} transactions</div>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-100 p-5">
                    <div className="text-[10px] font-black uppercase text-slate-500">Total Withdrawals</div>
                    <div className="text-2xl font-black text-slate-900 mt-1">PKR {Number(analytics.totalWithdrawn || 0).toLocaleString()}</div>
                    <div className="text-[10px] font-black text-rose-600 mt-1">{withdrawals.length} transactions</div>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 p-5">
                    <div className="text-[10px] font-black uppercase text-slate-500">Net Flow</div>
                    <div className="text-2xl font-black text-slate-900 mt-1">PKR {Number((analytics.totalDeposited || 0) - (analytics.totalWithdrawn || 0)).toLocaleString()}</div>
                    <div className="text-[10px] font-black text-emerald-600 mt-1">Platform liquidity</div>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100 p-5">
                    <div className="text-[10px] font-black uppercase text-slate-500">Approval Rate</div>
                    <div className="text-2xl font-black text-slate-900 mt-1">
                      {deposits.length > 0 ? Math.round((approvedDeposits.length / deposits.length) * 100) : 0}%
                    </div>
                    <div className="text-[10px] font-black text-amber-600 mt-1">{approvedDeposits.length} approved</div>
                  </div>
                </div>
              </div>
            )}

            {/* ─── SETTINGS ─── */}
            {section === 'settings' && (
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
                <h2 className="text-xl font-black text-slate-900">Platform Settings</h2>
                <p className="text-xs font-bold text-slate-400 mt-0.5">Configure platform-wide settings</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="rounded-xl bg-slate-50 border border-slate-100 p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-slate-500">Platform Name</span>
                      <Globe className="h-4 w-4 text-violet-600" />
                    </div>
                    <div className="font-black text-lg text-slate-900 mt-2">Hens Bedo</div>
                  </div>
                  <div className="rounded-xl bg-slate-50 border border-slate-100 p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-slate-500">Maintenance Mode</span>
                      <Lock className="h-4 w-4 text-amber-600" />
                    </div>
                    <div className="font-black text-lg text-slate-900 mt-2">Off</div>
                  </div>
                  <div className="rounded-xl bg-slate-50 border border-slate-100 p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-slate-500">Payment Methods</span>
                      <CreditCard className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="font-black text-sm text-slate-900 mt-2">EasyPaisa, JazzCash, Bank Transfer</div>
                  </div>
                  <div className="rounded-xl bg-slate-50 border border-slate-100 p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-slate-500">Referral Commission</span>
                      <TrendingUp className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div className="font-black text-lg text-slate-900 mt-2">18% / 3% / 1%</div>
                  </div>
                </div>
              </div>
            )}

            {/* ─── SUPPORT ─── */}
            {section === 'support' && (
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
                <h2 className="text-xl font-black text-slate-900">Support Center</h2>
                <p className="text-xs font-bold text-slate-400 mt-0.5">Manage support tickets and user queries</p>
                <div className="mt-6 rounded-xl bg-slate-50 border border-dashed border-slate-300 p-8 text-center">
                  <MessageSquare className="h-10 w-10 text-slate-300 mx-auto" />
                  <div className="font-black text-sm text-slate-500 mt-3">No support tickets yet</div>
                  <div className="text-[10px] font-bold text-slate-400 mt-1">User support requests will appear here</div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
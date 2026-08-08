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

  return (
    <div className="admin-panel-root min-h-screen bg-[#F8FAFC] text-slate-900">
      <div className="admin-panel-layout flex min-h-screen">
        <aside className="admin-sidebar w-82 bg-[linear-gradient(180deg,#17213B_0%,#14263C_62%,#102B34_100%)] text-white px-5 py-8 hidden md:flex flex-col">
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#2563EB] flex items-center justify-center shadow-lg shadow-blue-950/40">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-200">HNK</div>
                <div className="text-xl font-black">Admin Console</div>
              </div>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setSection(item.id)}
                  className={`admin-nav-button w-full text-left px-4 py-3 rounded-2xl font-black text-sm transition-all flex items-center gap-3 ${
                    section === item.id
                      ? 'active bg-[#2563EB] text-white shadow-lg shadow-blue-500/20'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              )
            })}

            <button
              onClick={async () => {
                await logout();
                onClose();
                window.location.assign('/');
              }}
              className="admin-logout-button w-full text-left px-4 py-3 rounded-2xl font-black text-sm transition-all flex items-center gap-3 text-rose-300 hover:bg-rose-700 hover:text-white mt-10"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </nav>
        </aside>

        <main className="admin-main flex-1 p-5 lg:p-8 overflow-y-auto">
          <div className="admin-topbar flex items-center justify-between mb-7">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Control Center</div>
              <h1 className="admin-title text-3xl font-black text-[#081A2E] tracking-tight">
                {navItems.find((x) => x.id === section)?.label || 'Dashboard'}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="admin-search hidden lg:flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 shadow-sm">
                <Search className="h-4 w-4 text-slate-400" />
                <input className="w-48 outline-none bg-transparent text-xs font-bold text-slate-600 placeholder:text-slate-400" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search" />
              </div>
              <button className="admin-icon-button flex items-center justify-center h-10 w-10 rounded-2xl bg-white border border-slate-200 shadow-sm text-slate-500 hover:text-blue-600">
                <Bell className="h-4 w-4" />
              </button>
              <div className="admin-profile flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
                <div className="admin-avatar h-9 w-9 rounded-full bg-[#0F6C58] text-white flex items-center justify-center font-black text-xs">AD</div>
                <div className="hidden sm:block">
                  <div className="text-xs font-black text-slate-900">Admin</div>
                  <div className="text-[10px] font-black text-slate-500 uppercase">Super Admin</div>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-500" />
              </div>
              <button
                onClick={onClose}
                className="premium-button secondary px-4 py-2 rounded-2xl bg-white border border-slate-200 font-black text-xs shadow-sm hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>

          {section === 'dashboard' && (
            <div className="admin-dashboard-area space-y-5">
              <section className="dashboard-summary-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="rounded-[28px] bg-gradient-to-br from-[#1a7f69] to-[#1f6a4f] p-[1px] shadow-sm">
                  <div className="rounded-[27px] bg-white/95 p-5 h-full">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-slate-500">Total Users</span>
                      <span className="rounded-full bg-emerald-50 text-[#175b51] p-2"><i className="fa-solid fa-users" /></span>
                    </div>
                    <div className="mt-4 flex items-end justify-between">
                      <div>
                        <div className="text-3xl font-black text-[#183d31]">{users.length}</div>
                        <div className="text-[10px] font-black uppercase text-slate-500 mt-2">Active accounts</div>
                      </div>
                      <span className="text-emerald-700 text-xs font-black">+{users.length}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-[28px] bg-gradient-to-br from-[#eece77] to-[#e9b858] p-[1px] shadow-sm">
                  <div className="rounded-[27px] bg-white/95 p-5 h-full">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-slate-500">Wallet Value</span>
                      <span className="rounded-full bg-amber-50 text-amber-700 p-2"><i className="fa-solid fa-wallet" /></span>
                    </div>
                    <div className="mt-4 flex items-end justify-between">
                      <div>
                        <div className="text-3xl font-black text-[#281f41]">PKR {Number(analytics.totalBalance || 0).toLocaleString()}</div>
                        <div className="text-[10px] font-black uppercase text-slate-500 mt-2">Total balance</div>
                      </div>
                      <span className="text-amber-700 text-xs font-black">Live</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-[28px] bg-gradient-to-br from-[#da8a53] to-[#b76d46] p-[1px] shadow-sm">
                  <div className="rounded-[27px] bg-white/95 p-5 h-full">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-slate-500">Pending Deposits</span>
                      <span className="rounded-full bg-[#fff1e9] text-[#9b572b] p-2"><i className="fa-solid fa-landmark" /></span>
                    </div>
                    <div className="mt-4 flex items-end justify-between">
                      <div>
                        <div className="text-3xl font-black text-[#281f41]">{pendingDeposits.length}</div>
                        <div className="text-[10px] font-black uppercase text-slate-500 mt-2">Awaiting review</div>
                      </div>
                      <span className="text-[#9b572b] text-xs font-black">{pendingDeposits.length > 0 ? 'Needs action' : 'Clear'}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-[28px] bg-gradient-to-br from-[#9cc868] to-[#72af69] p-[1px] shadow-sm">
                  <div className="rounded-[27px] bg-white/95 p-5 h-full">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-slate-500">Referral Network</span>
                      <span className="rounded-full bg-[#edf9e8] text-[#426d36] p-2"><i className="fa-solid fa-share-nodes" /></span>
                    </div>
                    <div className="mt-4 flex items-end justify-between">
                      <div>
                        <div className="text-3xl font-black text-[#281f41]">{analytics.referrals}</div>
                        <div className="text-[10px] font-black uppercase text-slate-500 mt-2">Linked users</div>
                      </div>
                      <span className="text-[#426d36] text-xs font-black">{users.length ? 'Active' : 'No data'}</span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-5">
                <div className="rounded-[28px] bg-white border border-slate-200 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-black text-[#281f41]">Performance Overview</h3>
                      <p className="text-[10px] font-black uppercase text-slate-500 mt-1">Investment operations</p>
                    </div>
                    <span className="rounded-full bg-green-50 px-3 py-1 text-[10px] font-black text-emerald-700">online</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-[#eefaf2] p-4 border border-emerald-100">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-slate-500">Deposits</span>
                        <i className="fa-solid fa-arrow-down text-emerald-700" />
                      </div>
                      <div className="text-2xl font-black text-[#234833] mt-3">PKR {Number(analytics.totalDeposited || 0).toLocaleString()}</div>
                      <div className="text-[10px] font-black text-slate-500 mt-1">{deposits.length} records</div>
                    </div>
                    <div className="rounded-2xl bg-[#fff5ea] p-4 border border-amber-100">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-slate-500">Withdrawals</span>
                        <i className="fa-solid fa-arrow-up text-amber-700" />
                      </div>
                      <div className="text-2xl font-black text-[#4a3421] mt-3">PKR {Number(analytics.totalWithdrawn || 0).toLocaleString()}</div>
                      <div className="text-[10px] font-black text-slate-500 mt-1">{withdrawals.length} records</div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-lime-400" style={{ width: `${users.length ? 78 : 4}%` }} />
                    </div>
                    <div className="flex justify-between mt-2 text-[10px] font-black text-slate-500">
                      <span>Growth</span>
                      <span>{users.length ? 'Healthy' : 'Waiting for data'}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-[28px] bg-white border border-slate-200 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-black text-[#281f41]">Admin Status</h3>
                    <span className="rounded-full bg-[#d6f6da] text-[#275b2a] px-3 py-1 text-[10px] font-black">Operational</span>
                  </div>
                  <div className="space-y-3">
                    <div className="rounded-2xl bg-[#f8fbf6] p-4 border border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-slate-500">Admin Accounts</span>
                        <i className="fa-solid fa-shield-halved text-[#1d6d4e]" />
                      </div>
                      <div className="text-2xl font-black text-[#184c36] mt-2">{analytics.activeAdmins}</div>
                    </div>
                    <div className="rounded-2xl bg-[#fffdf7] p-4 border border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-slate-500">Pending Tasks</span>
                        <i className="fa-solid fa-bolt text-amber-700" />
                      </div>
                      <div className="text-2xl font-black text-[#51441d] mt-2">{pendingDeposits.length + pendingWithdrawals.length}</div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-[24px] bg-white border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-black text-[#281f41]">Recent Activity</h3>
                  <span className="text-[10px] font-black uppercase text-slate-500">Last 24h</span>
                </div>
                <div className="space-y-3">
                  {transactions.length > 0 ? transactions.slice(0, 6).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0">
                      <div>
                        <div className="font-black text-sm text-[#281f41]">{tx.userName || 'User'} • {tx.description}</div>
                        <div className="text-[10px] font-bold text-slate-500">{tx.date || '—'}</div>
                      </div>
                      <span className="text-xs font-black px-2 py-1 rounded-full bg-slate-100 text-slate-700">{tx.type}</span>
                    </div>
                  )) : (
                    <div className="rounded-2xl bg-slate-50 border border-dashed border-slate-300 p-4 text-sm font-black text-slate-500">
                      No recent activity yet. User actions and finance records will appear here.
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}

          {section === 'users' && (
            <section className="rounded-[24px] bg-white border border-slate-200 p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <div>
                  <h2 className="text-2xl font-black text-[#281f41]">User Management</h2>
                  <p className="text-xs font-bold text-slate-500">Registered users</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search users"
                    className="border border-slate-200 rounded-2xl px-4 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-[#0098ff]"
                  />
<button className="admin-filter-button px-4 py-2 rounded-2xl bg-[#281f41] text-white font-black text-xs">Filter</button>
                </div>
              </div>

              <div className="admin-table-wrap overflow-x-auto rounded-[24px] border border-slate-100 bg-white shadow-sm">
                <table className="admin-user-table min-w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-black uppercase text-slate-500">
                      <th className="pb-3 px-4">User</th>
                      <th className="pb-3 px-4">Role</th>
                      <th className="pb-3 px-4">Wallet</th>
                      <th className="pb-3 px-4">Referral</th>
                      <th className="pb-3 px-4">Deposit History</th>
                      <th className="pb-3 px-4">Withdrawal History</th>
                      <th className="pb-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {us.map((item) => (
                      <tr key={item.uid} className="admin-user-row border-t border-slate-100">
                        <td className="py-4 px-4">
                          <div className="user-cell flex items-center gap-3">
                            <span className="avatar-badge inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-lime-500 text-white font-black shadow-sm">{(item.username || 'U').slice(0, 1).toUpperCase()}</span>
                            <div>
                              <div className="font-black text-sm text-[#281f41]">{item.username}</div>
                              <div className="text-[10px] font-bold text-slate-500">{item.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="admin-role-badge px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-black">
                            {item.role || 'user'}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-black text-sm">Rs {Number(item.balance || 0).toLocaleString()}</td>
                        <td className="py-4 px-4 font-black text-sm">{item.referralCode}</td>
                        <td className="py-4 px-4 text-[11px] font-bold text-slate-500">{item.totalDeposited || 0}</td>
                        <td className="py-4 px-4 text-[11px] font-bold text-slate-500">{item.totalWithdrawn || 0}</td>
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-2">
                            <button className="admin-table-button admin-small-button px-2 py-1 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-black">Profile</button>
                            <button
                              onClick={() => changeUserRole(item.uid, item.role === 'admin' ? 'user' : 'admin')}
                              className="admin-table-button admin-row-action admin-small-button px-2 py-1 rounded-lg bg-[#0098ff]/10 text-[#0098ff] text-[10px] font-black"
                            >
                              {item.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                            </button>
                            <button className="admin-table-button admin-small-button px-2 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-[10px] font-black">Activate</button>
                            <button className="admin-table-button admin-small-button px-2 py-1 rounded-lg bg-amber-100 text-amber-700 text-[10px] font-black">Suspend</button>
                            <button className="admin-table-button admin-small-button px-2 py-1 rounded-lg bg-rose-100 text-rose-700 text-[10px] font-black">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {section === 'deposits' && (
            <section className="rounded-[24px] bg-white border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-2xl font-black text-[#281f41]">Deposit Management</h2>
                <span className="text-[10px] font-black uppercase text-slate-500">{pendingDeposits.length} Pending</span>
              </div>

              <div className="space-y-3">
                {deposits.map((tx) => (
                  <div key={tx.id} className="border border-slate-100 rounded-2xl p-4 flex flex-wrap justify-between gap-4">
                    <div>
                      <div className="font-black text-sm text-[#281f41]">{tx.userName || 'Unknown User'}</div>
                      <div className="text-[10px] font-bold text-slate-500">{tx.date || '—'}</div>
                      <div className="text-xs font-black mt-2">PKR {Number(tx.amount || 0).toLocaleString()} • {tx.method || 'Unknown'} • {tx.txid || 'TXN'}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black px-2 py-1 rounded-full bg-slate-100 text-slate-700">{tx.status}</span>
                      <button onClick={() => approveDeposit(tx)} className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-black text-xs">Approve</button>
                      <button onClick={() => rejectDeposit(tx)} className="px-4 py-2 rounded-xl bg-rose-600 text-white font-black text-xs">Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {section === 'withdrawals' && (
            <section className="rounded-[24px] bg-white border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-2xl font-black text-[#281f41]">Withdrawal Management</h2>
                <span className="text-[10px] font-black uppercase text-slate-500">{pendingWithdrawals.length} Pending</span>
              </div>

              <div className="space-y-3">
                {withdrawals.map((tx) => (
                  <div key={tx.id} className="border border-slate-100 rounded-2xl p-4 flex flex-wrap justify-between gap-4">
                    <div>
                      <div className="font-black text-sm text-[#281f41]">{tx.userName || 'Unknown User'}</div>
                      <div className="text-[10px] font-bold text-slate-500">{tx.date || '—'}</div>
                      <div className="text-xs font-black mt-2">PKR {Number(tx.amount || 0).toLocaleString()} • {tx.method || 'Unknown'} • {tx.accountNumber || '—'}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black px-2 py-1 rounded-full bg-slate-100 text-slate-700">{tx.status}</span>
                      <button onClick={() => approveWithdrawal(tx)} className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-black text-xs">Approve</button>
                      <button onClick={() => rejectWithdrawal(tx)} className="px-4 py-2 rounded-xl bg-rose-600 text-white font-black text-xs">Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {section === 'referral' && (
            <section className="rounded-[24px] bg-white border border-slate-200 p-5 shadow-sm">
              <h2 className="text-2xl font-black text-[#281f41]">Referral Management</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  <div className="text-[10px] font-black uppercase text-slate-500">Referral Statistics</div>
                  <div className="text-2xl font-black text-[#281f41] mt-2">{users.length}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  <div className="text-[10px] font-black uppercase text-slate-500">Top Referrers</div>
                  <div className="text-2xl font-black text-[#281f41] mt-2">—</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  <div className="text-[10px] font-black uppercase text-slate-500">Referral Rewards</div>
                  <div className="text-2xl font-black text-[#281f41] mt-2">Configured</div>
                </div>
              </div>
            </section>
          )}

          {section === 'notifications' && (
            <section className="rounded-[24px] bg-white border border-slate-200 p-5 shadow-sm">
              <h2 className="text-2xl font-black text-[#281f41]">Notifications</h2>
              <div className="mt-4">
                <textarea className="w-full min-h-[150px] border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none" placeholder="Notification message" />
                <button className="mt-3 px-5 py-3 rounded-2xl bg-[#0098ff] text-white font-black text-xs">Send Notification</button>
              </div>
            </section>
          )}

          {section === 'announcements' && (
            <section className="rounded-[24px] bg-white border border-slate-200 p-5 shadow-sm">
              <h2 className="text-2xl font-black text-[#281f41]">Announcements</h2>
              <div className="mt-4">
                <textarea className="w-full min-h-[150px] border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none" placeholder="Create announcement" />
                <button className="mt-3 px-5 py-3 rounded-2xl bg-[#281f41] text-white font-black text-xs">Send to all users</button>
              </div>
            </section>
          )}

          {section === 'reports' && (
            <section className="rounded-[24px] bg-white border border-slate-200 p-5 shadow-sm">
              <h2 className="text-2xl font-black text-[#281f41]">Reports</h2>
              <p className="text-sm font-bold text-slate-500 mt-3">Platform reports configuration is available for future expansion.</p>
            </section>
          )}

          {section === 'settings' && (
            <section className="rounded-[24px] bg-white border border-slate-200 p-5 shadow-sm">
              <h2 className="text-2xl font-black text-[#281f41]">Settings</h2>
              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  <div className="text-[10px] font-black uppercase text-slate-500">Platform Name</div>
                  <div className="font-black text-sm mt-2">HNK Traders</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  <div className="text-[10px] font-black uppercase text-slate-500">Maintenance Mode</div>
                  <div className="font-black text-sm mt-2">Off</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  <div className="text-[10px] font-black uppercase text-slate-500">Payment Methods</div>
                  <div className="font-black text-sm mt-2">EasyPaisa, JazzCash, Bank Transfer</div>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

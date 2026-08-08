import React, { useEffect, useMemo, useState } from 'react';
import { AuthView } from '../views/AuthView';
import { AdminPanel } from './AdminPanel';
import { useAuth } from '../context/AuthContext';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { UserProfile } from '../types';

export const AdminProtectedRoute: React.FC = () => {
  const { user } = useAuth();
  const [permission, setPermission] = useState<'checking' | 'allowed' | 'denied'>('checking');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const verify = async () => {
      setIsHydrated(true);

      if (!user) {
        setPermission('denied');
        return;
      }

      if (!isFirebaseConfigured() || !db) {
        setPermission('denied');
        return;
      }

      try {
        const ref = doc(db, 'users', user.uid);
        const snap = await getDoc(ref);
        const data = snap.exists() ? (snap.data() as Partial<UserProfile>) : null;
        const role = data?.role;

        if (role === 'admin') {
          setPermission('allowed');
        } else {
          setPermission('denied');
        }
      } catch (error) {
        console.error('Admin role verification failed', error);
        setPermission('denied');
      }
    };

    verify();
  }, [user?.uid, user?.role]);

  const goToDashboard = () => {
    window.location.assign('/');
  };

  const returnHome = () => {
    window.location.assign('/');
  };

  if (!user) {
    return (
      <AuthView
        onSuccess={() => {
          if (window.location.pathname === '/admin') {
            window.location.assign('/admin');
          } else {
            window.location.assign('/');
          }
        }}
      />
    );
  }

  if (permission === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-900">
        <div className="rounded-[28px] bg-white px-7 py-6 shadow-xl border border-slate-200 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#0098ff] border-t-transparent mx-auto" />
          <div className="mt-4 text-xs font-black uppercase tracking-[0.25em] text-slate-500">Verifying Access</div>
        </div>
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
        <div className="max-w-xl w-full rounded-[32px] bg-white border border-slate-200 shadow-2xl p-8 text-center">
          <div className="mx-auto mb-5 w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center">
            <i className="fa-solid fa-shield-halved text-4xl text-rose-600" />
          </div>
          <div className="text-xs font-black uppercase tracking-[0.24em] text-rose-500">Restricted Area</div>
          <h1 className="text-4xl font-black text-[#281f41] mt-4">Access Denied</h1>
          <p className="mt-5 text-sm font-bold text-slate-600 leading-6">
            You do not have permission to access this page.<br />
            This area is restricted to administrators only.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <button onClick={goToDashboard} className="px-5 py-3 rounded-2xl bg-[#281f41] text-white font-black text-xs shadow-sm hover:bg-[#1d1732] transition-all">
              Go to Dashboard
            </button>
            <button onClick={returnHome} className="px-5 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 font-black text-xs shadow-sm hover:bg-slate-50 transition-all">
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <AdminPanel onClose={() => window.location.assign('/')} />;
};

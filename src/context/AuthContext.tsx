import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  savedAccounts: string[];
  login: (email: string, password: string) => Promise<string | null>;
  register: (username: string, email: string, password: string, referralCode?: string) => Promise<string | null>;
  logout: () => Promise<void>;
  quickLogin: (username: string) => void;
  updateProfile: (updated: Partial<UserProfile>) => void;
  deviceId: string;
  firebaseReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USER_KEY = 'vertex_user_profile_v2';
const SAVED_ACCOUNTS_KEY = 'vertex_saved_usernames';
const DEVICE_ID_KEY = 'vertex_device_id';

const DEMO_USER: UserProfile = {
  uid: 'user_v2_demo',
  username: 'muhhabat00786',
  email: 'muhhabat00786@gmail.com',
  balance: 14850,
  totalDeposited: 25000,
  totalWithdrawn: 12500,
  totalYieldEarned: 3820,
  teamDeposits: 45000,
  referralCode: 'B028CB2D',
  referredBy: 'VERTEX_ADMIN',
  activePlanName: 'Plan 02 - Growth Tier',
  pendingWithdrawalsCount: 0,
  pendingDepositsCount: 0,
  createdAt: '2026-08-01',
};

function generateReferralCode(username: string): string {
  return username.substring(0, 4).toUpperCase() + Math.floor(1000 + Math.random() * 9000);
}

/** Build a fresh profile for a newly registered Firebase user. */
function buildProfileFromFirebaseUser(fbUser: FirebaseUser, username?: string, referralCode?: string): UserProfile {
  const profile: UserProfile = {
    uid: fbUser.uid,
    username: username || fbUser.displayName || fbUser.email?.split('@')[0] || 'investor',
    email: fbUser.email || '',
    balance: 500, // Sign-up bonus!
    totalDeposited: 0,
    totalWithdrawn: 0,
    totalYieldEarned: 0,
    teamDeposits: 0,
    referralCode: generateReferralCode(username || 'INV'),
    createdAt: new Date().toISOString().split('T')[0],
    pendingDepositsCount: 0,
    pendingWithdrawalsCount: 0,
  };
  // Only set referredBy when a real referral code was provided (Firestore rejects undefined)
  if (referralCode && referralCode.trim()) {
    profile.referredBy = referralCode.trim();
  }
  return profile;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const firebaseReady = isFirebaseConfigured();
  const [deviceId, setDeviceId] = useState<string>('');
  const [savedAccounts, setSavedAccounts] = useState<string[]>([]);
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (firebaseReady) return null; // wait for onAuthStateChanged
    const stored = localStorage.getItem(LOCAL_USER_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse stored user profile', e);
      }
    }
    return DEMO_USER;
  });

  useEffect(() => {
    // Generate or fetch device ID
    let devId = localStorage.getItem(DEVICE_ID_KEY);
    if (!devId) {
      devId = 'dev-' + Math.random().toString(36).substring(2, 10);
      localStorage.setItem(DEVICE_ID_KEY, devId);
    }
    setDeviceId(devId);

    // Load saved usernames
    const storedAccounts = localStorage.getItem(SAVED_ACCOUNTS_KEY);
    if (storedAccounts) {
      try {
        setSavedAccounts(JSON.parse(storedAccounts));
      } catch (e) {
        setSavedAccounts(['muhhabat00786']);
      }
    } else {
      setSavedAccounts(['muhhabat00786', 'investor_pro']);
      localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(['muhhabat00786', 'investor_pro']));
    }
  }, []);

  // Persist demo-mode user to localStorage
  useEffect(() => {
    if (firebaseReady) return;
    if (user) {
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_USER_KEY);
    }
  }, [user, firebaseReady]);

  // ── Firebase Auth state listener + Firestore profile sync ──
  useEffect(() => {
    if (!firebaseReady) return;
    const fAuth = auth;
    const fDb = db;
    if (!fAuth || !fDb) return;
    const unsubscribe = onAuthStateChanged(fAuth, async (fbUser) => {
      if (!fbUser) {
        setUser(null);
        return;
      }
      const profileRef = doc(fDb, 'users', fbUser.uid);
      try {
        const snap = await getDoc(profileRef);
        if (snap.exists()) {
          setUser(snap.data() as UserProfile);
        } else {
          const newProfile = buildProfileFromFirebaseUser(fbUser);
          await setDoc(profileRef, { ...newProfile, createdAt: serverTimestamp() });
          setUser(newProfile);
        }
      } catch (e) {
        console.error('Failed to load Firebase profile', e);
      }
    });
    return unsubscribe;
  }, [firebaseReady]);

  // Real-time profile updates from Firestore
  useEffect(() => {
    if (!firebaseReady || !user?.uid) return;
    const fDb = db;
    if (!fDb) return;
    const profileRef = doc(fDb, 'users', user.uid);
    const unsubscribe = onSnapshot(profileRef, (snap) => {
      if (snap.exists()) {
        setUser(snap.data() as UserProfile);
      }
    });
    return unsubscribe;
  }, [firebaseReady, user?.uid]);

  const login = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      if (firebaseReady) {
        const fAuth = auth;
        if (fAuth) {
          try {
            await signInWithEmailAndPassword(fAuth, email, password);
            return null;
          } catch (e: any) {
            console.error('Firebase login failed', e);
            const code = e?.code || '';
            if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
              return 'Invalid email or password.';
            }
            if (code === 'auth/invalid-email') return 'Please enter a valid email address.';
            if (code === 'auth/too-many-requests') return 'Too many attempts. Please try again later.';
            return 'Login failed. Please try again.';
          }
        }
      }

      // Demo mode fallback
      if (!email.trim()) return 'Please enter your email address.';
      const cleanName = email.trim();
      const newProfile: UserProfile = {
        uid: 'uid_' + cleanName,
        username: cleanName,
        email: `${cleanName.toLowerCase()}@vertexinvest.com`,
        balance: 10000,
        totalDeposited: 15000,
        totalWithdrawn: 5000,
        totalYieldEarned: 2400,
        teamDeposits: 12000,
        referralCode: generateReferralCode(cleanName),
        createdAt: new Date().toISOString().split('T')[0],
        pendingDepositsCount: 0,
        pendingWithdrawalsCount: 0,
      };
      setUser(newProfile);
      if (!savedAccounts.includes(cleanName)) {
        const updatedList = [cleanName, ...savedAccounts];
        setSavedAccounts(updatedList);
        localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(updatedList));
      }
      return null;
    },
    [firebaseReady, savedAccounts]
  );

  const register = useCallback(
    async (username: string, email: string, password: string, referralCode?: string): Promise<string | null> => {
      if (!username || !email) return 'Please fill in both username and email address.';

      if (firebaseReady) {
        const fAuth = auth;
        const fDb = db;
        if (fAuth && fDb) {
          try {
            const cred = await createUserWithEmailAndPassword(fAuth, email, password);
            const newProfile = buildProfileFromFirebaseUser(cred.user, username, referralCode);
            await setDoc(doc(fDb, 'users', cred.user.uid), { ...newProfile, createdAt: serverTimestamp() });
            setUser(newProfile);
            return null;
          } catch (e: any) {
            console.error('Firebase registration failed', e);
            const code = e?.code || '';
            if (code === 'auth/email-already-in-use') {
              return 'This email is already registered. Please log in instead.';
            }
            if (code === 'auth/invalid-email') return 'Please enter a valid email address.';
            if (code === 'auth/weak-password') return 'Password is too weak. Use at least 6 characters.';
            if (code === 'permission-denied') {
              return 'Firestore rules are blocking sign-up. Please set your Firestore security rules (see README).';
            }
            return 'Sign up failed. Please try again.';
          }
        }
      }

      // Demo mode fallback
      const cleanName = username.trim();
      const newProfile: UserProfile = {
        uid: 'uid_' + Math.random().toString(36).substring(2, 9),
        username: cleanName,
        email: email.trim(),
        balance: 500, // Sign-up bonus!
        totalDeposited: 0,
        totalWithdrawn: 0,
        totalYieldEarned: 0,
        teamDeposits: 0,
        referralCode: generateReferralCode(cleanName),
        referredBy: referralCode || undefined,
        createdAt: new Date().toISOString().split('T')[0],
        pendingDepositsCount: 0,
        pendingWithdrawalsCount: 0,
      };
      setUser(newProfile);
      if (!savedAccounts.includes(cleanName)) {
        const updatedList = [cleanName, ...savedAccounts];
        setSavedAccounts(updatedList);
        localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(updatedList));
      }
      return null;
    },
    [firebaseReady, savedAccounts]
  );

  const logout = useCallback(async () => {
    if (firebaseReady) {
      const fAuth = auth;
      if (fAuth) {
        await signOut(fAuth);
      }
    }
    setUser(null);
  }, [firebaseReady]);

  const quickLogin = useCallback(
    (username: string) => {
      if (firebaseReady) return; // quick login only in demo mode
      login(username, '');
    },
    [firebaseReady, login]
  );

  const updateProfile = useCallback(
    (updated: Partial<UserProfile>) => {
      setUser((prev) => {
        if (!prev) return prev;
        const next = { ...prev, ...updated };
        if (firebaseReady) {
          const fDb = db;
          if (fDb) {
            updateDoc(doc(fDb, 'users', prev.uid), updated).catch((e) =>
              console.error('Failed to update Firestore profile', e)
            );
          }
        } else {
          localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(next));
        }
        return next;
      });
    },
    [firebaseReady]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        savedAccounts,
        login,
        register,
        logout,
        quickLogin,
        updateProfile,
        deviceId,
        firebaseReady,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

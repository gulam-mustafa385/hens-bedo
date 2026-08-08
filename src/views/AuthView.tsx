import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  User,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  Check,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthViewProps {
  onSuccess: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onSuccess }) => {
  const { login, register, savedAccounts, quickLogin } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [referralCode, setReferralCode] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'login') {
      if (!email.trim()) {
        setError('Please enter your email address.');
        return;
      }
      const err = await login(email.trim(), password);
      if (err) setError(err);
      else onSuccess();
    } else {
      if (!username.trim() || !email.trim()) {
        setError('Please fill in both username and email address.');
        return;
      }
      if (!password || password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      const err = await register(username.trim(), email.trim(), password, referralCode.trim());
      if (err) setError(err);
      else onSuccess();
    }
  };

  const handleQuickSelect = (accountName: string) => {
    if (!accountName) return;
    quickLogin(accountName);
    onSuccess();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="relative w-full max-w-[430px] mx-auto bg-white rounded-[44px] shadow-[0_26px_70px_rgba(20,39,72,0.15)] border-[8px] border-[#e6ebf1] overflow-hidden text-[#2c2550]"
    >
      {/* TOP HERO WAVE BANNER */}
      <div className="relative min-h-[295px] pt-8 px-6 text-center overflow-visible bg-gradient-to-br from-[#ff9d21] to-[#ff6f48] text-white">
        {/* Curved Bottom Wave Overlay */}
        <div className="absolute -left-[10%] -right-[10%] -bottom-[40px] h-[100px] bg-white rounded-[50%/35%] z-10 pointer-events-none" />

        <div className="relative z-20">
          <h1 className="text-[26px] font-black tracking-tight text-white drop-shadow-sm">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-[13px] font-semibold text-white/90 mt-1 max-w-[260px] mx-auto leading-tight">
            {mode === 'login'
              ? 'Login to continue your investment journey'
              : 'Join Vertex Invest & start earning daily compound yields'}
          </p>
        </div>

        {/* VECTOR ILLUSTRATION (Desk, Person, Laptop, Plant, Chat Bubble) */}
        <div className="relative z-20 w-[240px] h-[150px] mx-auto mt-3 scale-95">
          {/* Desk line */}
          <div className="absolute left-2 right-2 bottom-4 h-3 rounded-full bg-[#32135e] shadow-sm" />

          {/* Plant on left */}
          <div className="absolute left-6 bottom-[26px] w-[34px] h-[64px]">
            <div className="absolute bottom-0 w-full h-[30px] rounded-b-xl bg-[#7763d9]" />
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-1 h-8 bg-[#28d6c7] rounded-full" />
            <div className="absolute left-0 top-2 w-3.5 h-5 rounded-tl-full rounded-br-full bg-[#27d8c8] -rotate-45" />
            <div className="absolute right-0 top-4 w-3.5 h-5 rounded-tr-full rounded-bl-full bg-[#27d8c8] rotate-45" />
            <div className="absolute left-1 top-0 w-3.5 h-5 rounded-tl-full rounded-br-full bg-[#27d8c8] -rotate-12" />
            <div className="absolute right-1 top-1 w-3.5 h-5 rounded-tr-full rounded-bl-full bg-[#27d8c8] rotate-20" />
          </div>

          {/* Person in chair */}
          <div className="absolute left-[78px] bottom-[26px] w-[72px] h-[110px]">
            <div className="absolute bottom-0 left-1 w-[66px] h-[72px] rounded-t-[30px] bg-gradient-to-b from-[#2c1471] to-[#39228f]" />
            <div className="absolute top-3 left-7 w-7 h-10 rounded-[12px] bg-[#e7c4ff]" />
            <div className="absolute top-0 left-3 w-[48px] h-[40px] rounded-t-[20px] bg-[#2b115c]" />
            <div className="absolute bottom-7 -right-5 w-12 h-4 rounded-full bg-[#2a176b] -rotate-[50deg]" />
          </div>

          {/* Laptop */}
          <div className="absolute right-8 bottom-[28px] w-[74px] h-[46px] rounded-t-md bg-gradient-to-br from-[#18d2d1] to-[#0099e8] -skew-x-12 flex items-center justify-center shadow-md">
            <div className="w-2 h-2 rounded-full bg-white/90" />
          </div>

          {/* Chat Bubble with checkmark */}
          <div className="absolute right-0 top-2 w-[80px] h-[38px] rounded-full bg-[#22d4c7] flex items-center justify-center gap-1 shadow-md">
            <div className="w-1.5 h-1.5 rounded-full bg-[#4b2aa1]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#4b2aa1]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#4b2aa1]" />
            {/* Check badge */}
            <div className="absolute -right-1 -top-1 w-6 h-6 rounded-full bg-[#4b2aa1] text-white flex items-center justify-center shadow-sm">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </div>
        </div>
      </div>

      {/* FORM PANEL */}
      <div className="relative z-20 px-6 pt-2 pb-24 space-y-4 bg-white">
        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
            {error}
          </div>
        )}

        {/* SAVED ACCOUNT DROPDOWN */}
        {mode === 'login' && (
          <div>
            <label className="block text-[13px] font-extrabold text-[#7e7f86] mb-1.5">
              Saved Account
            </label>
            <div className="relative">
              <select
                onChange={(e) => handleQuickSelect(e.target.value)}
                defaultValue=""
                className="w-full h-[52px] px-4 rounded-2xl bg-[#f7f9fc] border border-slate-200 text-sm font-extrabold text-[#2c2550] appearance-none focus:outline-none focus:ring-2 focus:ring-[#0098ff] shadow-sm"
              >
                <option value="" disabled>
                  Select Account
                </option>
                {savedAccounts.map((acc) => (
                  <option key={acc} value={acc}>
                    @{acc}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* USERNAME FIELD (SIGNUP) */}
          {mode === 'signup' && (
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[13px] font-extrabold text-[#7e7f86]">Username</label>
              </div>
              <div className="relative">
                <User className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#2b135d]" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full h-[54px] pl-11 pr-4 rounded-2xl bg-[#f7f9fc] border border-slate-200 text-sm font-extrabold text-[#141218] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0098ff] shadow-sm"
                  required
                />
              </div>
            </div>
          )}

          {/* EMAIL FIELD (LOGIN + SIGNUP) */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[13px] font-extrabold text-[#7e7f86]">
                Email Address
              </label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => setEmail('')}
                  className="text-xs font-bold text-[#0098ff] hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#2b135d]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={mode === 'login' ? 'Enter your email address' : 'Enter email address'}
                className="w-full h-[54px] pl-11 pr-4 rounded-2xl bg-[#f7f9fc] border border-slate-200 text-sm font-extrabold text-[#141218] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0098ff] shadow-sm"
                required
              />
            </div>
          </div>

          {/* PASSWORD FIELD */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[13px] font-extrabold text-[#7e7f86]">Password</label>
              {mode === 'login' && (
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Please use quick demo login or reset via Admin.'); }} className="text-xs font-bold text-[#0098ff] hover:underline">
                  Forgot password?
                </a>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#2b135d]" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full h-[54px] pl-11 pr-11 rounded-2xl bg-[#f7f9fc] border border-slate-200 text-sm font-extrabold text-[#141218] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0098ff] shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#0098ff]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* REFERRAL CODE (SIGNUP) */}
          {mode === 'signup' && (
            <div>
              <label className="block text-[13px] font-extrabold text-[#7e7f86] mb-1.5">
                Referral Code (Optional)
              </label>
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder="Enter sponsor referral code"
                className="w-full h-[54px] px-4 rounded-2xl bg-[#f7f9fc] border border-slate-200 text-sm font-mono font-extrabold text-[#141218] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0098ff] shadow-sm"
              />
            </div>
          )}

          {/* REMEMBER ME CHECKBOX */}
          {mode === 'login' && (
            <div
              onClick={() => setRememberMe(!rememberMe)}
              className="flex items-center gap-2.5 cursor-pointer py-1 select-none"
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                  rememberMe
                    ? 'bg-gradient-to-br from-[#1fd8c9] to-[#099ef1] text-white shadow-md'
                    : 'bg-slate-200 border border-slate-300'
                }`}
              >
                {rememberMe && <Check className="w-4 h-4 stroke-[3]" />}
              </div>
              <span className="text-xs font-extrabold text-[#7e7f86]">Remember me</span>
            </div>
          )}

          {/* CYAN PILL BUTTON (LOGIN) */}
          <button
            type="submit"
            className="w-full h-[58px] rounded-full bg-gradient-to-r from-[#1edac8] to-[#0097f3] text-white font-extrabold text-lg shadow-[0_16px_30px_rgba(0,151,243,0.3)] hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-between px-8"
          >
            <span>{mode === 'login' ? 'Login' : 'Sign Up'}</span>
            <ArrowRight className="w-6 h-6 stroke-[3]" />
          </button>
        </form>

        {/* ORANGE PILL BUTTON (SWITCH TO CREATE ACCOUNT) */}
        <div className="pt-2">
          {mode === 'login' ? (
            <button
              onClick={() => {
                setMode('signup');
                setError(null);
              }}
              className="w-full h-[54px] rounded-full bg-gradient-to-r from-[#ff9f28] to-[#ff315f] text-white font-extrabold text-base shadow-[0_16px_28px_rgba(255,80,85,0.25)] hover:brightness-105 transition-all flex items-center justify-center gap-2"
            >
              <span>Create an Account</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className="w-full h-[54px] rounded-full bg-gradient-to-r from-[#ff9f28] to-[#ff315f] text-white font-extrabold text-base shadow-[0_16px_28px_rgba(255,80,85,0.25)] hover:brightness-105 transition-all flex items-center justify-center gap-2"
            >
              <span>Already have an account? Login</span>
            </button>
          )}
        </div>

        {/* ONE CLICK DEMO TRIGGER */}
        <div className="text-center pt-2">
          <button
            onClick={() => handleQuickSelect('muhhabat00786')}
            className="text-xs font-extrabold text-[#0098ff] hover:underline inline-flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" /> Direct Demo Login (@muhhabat00786)
          </button>
        </div>
      </div>

      {/* BOTTOM CORNER DECORATIVE SHAPES */}
      <div className="absolute inset-x-0 bottom-0 h-28 pointer-events-none overflow-hidden rounded-b-[44px]">
        {/* Pink Circle */}
        <div className="absolute -left-12 -bottom-10 w-40 h-40 rounded-full bg-gradient-to-tr from-[#ff264c] to-[#ff3b71]" />
        {/* Yellow Semicircle */}
        <div className="absolute left-10 -bottom-16 w-52 h-28 rounded-t-full bg-gradient-to-tr from-[#ffd900] to-[#ffc100] border-[10px] border-white" />
        {/* Teal Shape */}
        <div className="absolute -right-20 -bottom-10 w-56 h-56 rounded-tl-[80%] bg-gradient-to-tr from-[#22d6cf] to-[#7ff0df]" />
      </div>
    </motion.div>
  );
};

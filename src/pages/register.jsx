import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { Mail, Lock, ArrowRight, User, Hash, ArrowLeft } from 'lucide-react';
import { FaFacebook } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import {
  loginUser,
  registerUser,
  sendOTP,
  verifyOTP,
  resetPassword,
  googleLogin
} from '../services/authService';
import { setCredentials } from '../store/authSlice';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { setAuthData } = useAuth();

  const [tab, setTab] = useState('login'); // 'login', 'register', 'forgot'
  const [step, setStep] = useState('email'); // 'email', 'otp', 'details' (for reg), 'reset' (for forgot)

  const [email, setEmail] = useState('');
  const [fullname, setFullname] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [otp, setOtp] = useState('');
  const [sessionRef, setSessionRef] = useState('');
  const [resetToken, setResetToken] = useState('');

  // --- Mutations ---

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      const userWithLive = { ...data.user, is_live: data.is_live !== undefined ? data.is_live : data.user?.is_live };
      dispatch(setCredentials({ access: data.access, user: userWithLive, is_live: userWithLive.is_live }));
      setAuthData(userWithLive, data.access);
      toast.success('Welcome back!', { position: 'top-center' });
      if (data.user?.is_staff) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    },
    onError: (err) => {
      const msg = err.response?.data?.error || err.response?.data?.detail || 'Login failed.';
      toast.error(msg, { position: 'top-center' });
    },
  });

  const sendOtpMutation = useMutation({
    mutationFn: sendOTP,
    onSuccess: (data) => {
      setSessionRef(data.session_ref);
      setStep('otp');
      toast.success('OTP sent to your email', { position: 'top-center' });
    },
    onError: (err) => {
      const msg = err.response?.data?.error || 'Failed to send OTP.';
      toast.error(msg, { position: 'top-center' });
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: verifyOTP,
    onSuccess: (data) => {
      if (tab === 'forgot') {
        setResetToken(data.reset_token);
        setStep('reset');
      } else {
        setStep('details');
      }
      toast.success('OTP verified', { position: 'top-center' });
    },
    onError: (err) => {
      const msg = err.response?.data?.error || 'Invalid or expired OTP.';
      toast.error(msg, { position: 'top-center' });
    },
  });

  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      const userWithLive = { ...data.user, is_live: data.is_live !== undefined ? data.is_live : data.user?.is_live };
      dispatch(setCredentials({ access: data.access, user: userWithLive, is_live: userWithLive.is_live }));
      setAuthData(userWithLive, data.access);
      toast.success('Account created! Welcome to Rentout.', { position: 'top-center' });
      if (data.user?.is_staff) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    },
    onError: (err) => {
      const errors = err.response?.data;
      if (typeof errors === 'object') {
        Object.values(errors).forEach((msgs) =>
          toast.error(Array.isArray(msgs) ? msgs[0] : msgs, { position: 'top-center' })
        );
      } else {
        toast.error('Registration failed.', { position: 'top-center' });
      }
    },
  });

  const resetPwdMutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      toast.success('Password reset successfully! Please login.', { position: 'top-center' });
      setTab('login');
      setStep('email');
      setPassword('');
      setPassword2('');
    },
    onError: (err) => {
      const msg = err.response?.data?.error || 'Failed to reset password.';
      toast.error(msg, { position: 'top-center' });
    },
  });

  const googleAuthMutation = useMutation({
    mutationFn: googleLogin,
    onSuccess: (data) => {
      const userWithLive = { ...data.user, is_live: data.is_live !== undefined ? data.is_live : data.user?.is_live };
      dispatch(setCredentials({ access: data.access, user: userWithLive, is_live: userWithLive.is_live }));
      setAuthData(userWithLive, data.access);
      toast.success('Logged in with Google!', { position: 'top-center' });
      if (data.user?.is_staff) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    },
    onError: (err) => {
      const msg = err.response?.data?.error || 'Google login failed.';
      toast.error(msg, { position: 'top-center' });
    },
  });

  // --- Handlers ---

  const handleSendOtp = (e) => {
    e.preventDefault();
    sendOtpMutation.mutate({
      email,
      purpose: tab === 'forgot' ? 'password_reset' : 'signup'
    });
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    verifyOtpMutation.mutate({ session_ref: sessionRef, otp });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (tab === 'login') {
      loginMutation.mutate({ email, password });
    } else if (tab === 'register') {
      if (password !== password2) {
        toast.error('Passwords do not match');
        return;
      }
      registerMutation.mutate({ username: fullname, email, password, password2 });
    } else if (tab === 'forgot') {
      if (password !== password2) {
        toast.error('Passwords do not match', { position: 'top-center' });
        return;
      }
      resetPwdMutation.mutate({ reset_token: resetToken, password1: password, password2: password2 });
    }
  };

  // Google login is now handled by the <GoogleLogin /> component in the render section

  const isPending =
    loginMutation.isPending ||
    sendOtpMutation.isPending ||
    verifyOtpMutation.isPending ||
    registerMutation.isPending ||
    resetPwdMutation.isPending ||
    googleAuthMutation.isPending;

  const renderForm = () => {
    if (tab === 'login') {
      return (
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Email */}
          <div className="space-y-2">
            <label className="text-[9px] text-white/50 font-bold tracking-[0.15em] uppercase px-1">EMAIL</label>
            <div className="flex items-center bg-white/10 border border-white/10 rounded-2xl px-5 py-3.5 focus-within:border-white/40 transition-all">
              <Mail className="text-white/40 w-4 h-4" />
              <div className="w-px h-5 bg-white/10 mx-4" />
              <input
                type="email"
                placeholder="voyager@rentout.com"
                className="bg-transparent text-white w-full outline-none placeholder:text-white/20 text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-[9px] text-white/50 font-bold tracking-[0.15em] uppercase">PASSWORD</label>
              <button
                type="button"
                onClick={() => { setTab('forgot'); setStep('email'); }}
                className="text-[9px] text-[#CDB4DB] font-bold hover:underline"
              >
                FORGOT?
              </button>
            </div>
            <div className="flex items-center bg-white/10 border border-white/10 rounded-2xl px-5 py-3.5 focus-within:border-white/40 transition-all">
              <Lock className="text-white/40 w-4 h-4" />
              <div className="w-px h-5 bg-white/10 mx-4" />
              <input
                type="password"
                placeholder="********"
                className="bg-transparent text-white w-full outline-none placeholder:text-white/20 text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full mt-2 bg-[#5D5F86] hover:bg-[#4E5075] disabled:opacity-60 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-semibold flex items-center justify-center transition-all shadow-xl active:scale-[0.98]"
          >
            {isPending ? 'Please wait...' : 'Request Your Rental'}
            {!isPending && <ArrowRight className="ml-2 w-4 h-4" />}
          </button>
        </form>
      );
    }

    if (step === 'email') {
      return (
        <form className="space-y-4" onSubmit={handleSendOtp}>
          <div className="space-y-2">
            <label className="text-[9px] text-white/50 font-bold tracking-[0.15em] uppercase px-1">EMAIL FOR VERIFICATION</label>
            <div className="flex items-center bg-white/10 border border-white/10 rounded-2xl px-5 py-3.5 focus-within:border-white/40 transition-all">
              <Mail className="text-white/40 w-4 h-4" />
              <div className="w-px h-5 bg-white/10 mx-4" />
              <input
                type="email"
                placeholder="voyager@rentout.com"
                className="bg-transparent text-white w-full outline-none placeholder:text-white/20 text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="w-full mt-2 bg-[#5D5F86] hover:bg-[#4E5075] disabled:opacity-60 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-semibold flex items-center justify-center transition-all shadow-xl active:scale-[0.98]"
          >
            {isPending ? 'Sending...' : 'Send OTP'}
            {!isPending && <ArrowRight className="ml-2 w-4 h-4" />}
          </button>
        </form>
      );
    }

    if (step === 'otp') {
      return (
        <form className="space-y-4" onSubmit={handleVerifyOtp}>
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-[9px] text-white/50 font-bold tracking-[0.15em] uppercase">ENTER OTP</label>
              <button
                type="button"
                onClick={() => setStep('email')}
                className="text-[9px] text-[#CDB4DB] font-bold flex items-center hover:underline"
              >
                <ArrowLeft className="w-3 h-3 mr-1" /> BACK
              </button>
            </div>
            <div className="flex items-center bg-white/10 border border-white/10 rounded-2xl px-5 py-3.5 focus-within:border-white/40 transition-all">
              <Hash className="text-white/40 w-4 h-4" />
              <div className="w-px h-5 bg-white/10 mx-4" />
              <input
                type="text"
                placeholder="123456"
                className="bg-transparent text-white w-full outline-none placeholder:text-white/20 text-sm tracking-[0.5em]"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength={6}
              />
            </div>
            <p className="text-[10px] text-white/40 px-1">Sent to {email}</p>
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="w-full mt-2 bg-[#5D5F86] hover:bg-[#4E5075] disabled:opacity-60 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-semibold flex items-center justify-center transition-all shadow-xl active:scale-[0.98]"
          >
            {isPending ? 'Verifying...' : 'Verify OTP'}
            {!isPending && <ArrowRight className="ml-2 w-4 h-4" />}
          </button>
        </form>
      );
    }

    if (step === 'details' || step === 'reset') {
      return (
        <form className="space-y-4" onSubmit={handleSubmit}>
          {step === 'details' && (
            <div className="space-y-2">
              <label className="text-[9px] text-white/50 font-bold tracking-[0.15em] uppercase px-1">FULL NAME</label>
              <div className="flex items-center bg-white/10 border border-white/10 rounded-2xl px-5 py-3.5 focus-within:border-white/40 transition-all">
                <User className="text-white/40 w-4 h-4" />
                <div className="w-px h-5 bg-white/10 mx-4" />
                <input
                  type="text"
                  placeholder="John Doe"
                  className="bg-transparent text-white w-full outline-none placeholder:text-white/20 text-sm"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {/* Password */}
          <div className="space-y-2">
            <label className="text-[9px] text-white/50 font-bold tracking-[0.15em] uppercase px-1">
              {step === 'reset' ? 'NEW PASSWORD' : 'PASSWORD'}
            </label>
            <div className="flex items-center bg-white/10 border border-white/10 rounded-2xl px-5 py-3.5 focus-within:border-white/40 transition-all">
              <Lock className="text-white/40 w-4 h-4" />
              <div className="w-px h-5 bg-white/10 mx-4" />
              <input
                type="password"
                placeholder="********"
                className="bg-transparent text-white w-full outline-none placeholder:text-white/20 text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="text-[9px] text-white/50 font-bold tracking-[0.15em] uppercase px-1">CONFIRM PASSWORD</label>
            <div className="flex items-center bg-white/10 border border-white/10 rounded-2xl px-5 py-3.5 focus-within:border-white/40 transition-all">
              <Lock className="text-white/40 w-4 h-4" />
              <div className="w-px h-5 bg-white/10 mx-4" />
              <input
                type="password"
                placeholder="********"
                className="bg-transparent text-white w-full outline-none placeholder:text-white/20 text-sm"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full mt-2 bg-[#5D5F86] hover:bg-[#4E5075] disabled:opacity-60 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-semibold flex items-center justify-center transition-all shadow-xl active:scale-[0.98]"
          >
            {isPending ? 'Processing...' : step === 'reset' ? 'Reset Password' : 'Create Account'}
            {!isPending && <ArrowRight className="ml-2 w-4 h-4" />}
          </button>
        </form>
      );
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-cover bg-center font-sans overflow-y-auto py-10"
      style={{ backgroundImage: "url('/images/heroimage.jpg')" }}
    >
      <div className="w-[450px] p-12 rounded-[2.5rem] bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl mx-4 transition-all duration-500 ease-in-out h-auto self-center">

        {/* Branding */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-1">Rentout.in</h1>
          <p className="text-white/80 text-[11px] tracking-wider uppercase">Access Anything, Stress-Free</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-white/10 rounded-2xl p-1 mb-10">
          {[
            { id: 'login', label: 'Login' },
            { id: 'register', label: 'Register' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTab(t.id);
                setStep('email');
                setOtp('');
              }}
              className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${(tab === t.id || (tab === 'forgot' && t.id === 'login'))
                ? 'bg-[#CDB4DB] text-[#4A4E69] shadow-lg'
                : 'text-white/60 hover:text-white'
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'forgot' && step === 'email' && (
          <p className="text-white/70 text-center text-xs mb-6 font-medium">
            Reset your password via email verification
          </p>
        )}

        {renderForm()}

        {/* Social Logins */}
        <div className="mt-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[9px] text-white/30 font-bold tracking-widest uppercase">OR BEGIN WITH</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>
          <div className="flex justify-center items-center gap-12">
            {/* Hidden Google Button for ID Token functionality */}
            <div id="google-btn" style={{ display: 'none' }}>
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  googleAuthMutation.mutate({
                    token: credentialResponse.credential
                  });
                }}
                onError={() => toast.error('Google Login Failed')}
              />
            </div>

            {/* Custom Google Button Trigger */}
            <button
              onClick={() => {
                const btn = document.querySelector('#google-btn [role="button"]');
                if (btn) btn.click();
              }}
              disabled={isPending}
              className="group flex flex-col items-center gap-2"
            >
              <div className="p-3 bg-white/10 rounded-full border border-white/10 group-hover:bg-white/20 transition-all">
                <FcGoogle size={20} />
              </div>
              <span className="text-[8px] text-white/40 font-bold uppercase">GOOGLE</span>
            </button>
            
            <button className="group flex flex-col items-center gap-2 opacity-50 cursor-not-allowed">
              <div className="p-3 bg-white/10 rounded-full border border-white/10">
                <FaFacebook className="text-white/80 w-4 h-4" />
              </div>
              <span className="text-[8px] text-white/40 font-bold uppercase">FACEBOOK</span>
            </button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 w-full text-center pointer-events-none">
        <p className="text-white/40 text-[9px] tracking-[0.2em] font-medium uppercase">
          Rent out anything. Get what you need.
        </p>
      </div>
    </div>
  );
}

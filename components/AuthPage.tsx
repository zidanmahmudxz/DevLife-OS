
import React, { useState } from 'react';
import { supabase } from '../services/supabase';

type AuthMode = 'login' | 'signup' | 'magic-link' | 'reset-password';

export const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const auth = supabase.auth as any;
      if (mode === 'login') {
        const { error } = await auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (mode === 'signup') {
        const { error } = await auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } }
        });
        if (error) throw error;
        setMessage('Operator registration successful! Check email for verification.');
      } else if (mode === 'magic-link') {
        const { error } = await auth.signInWithOtp({ email });
        if (error) throw error;
        setMessage('Access link transmitted to your inbox.');
      } else if (mode === 'reset-password') {
        const { error } = await auth.resetPasswordForEmail(email);
        if (error) throw error;
        setMessage('Recovery protocol initiated. Check email.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
      <div className="w-full max-w-md glass p-10 rounded-[40px] shadow-2xl space-y-8 animate-in zoom-in-95 duration-500 border-white/5">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-blue-600/10 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-4 border border-blue-500/20">🚀</div>
          <h1 className="text-4xl font-black text-white tracking-tighter">DevLife <span className="text-blue-500">OS</span></h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">
            {mode === 'login' ? 'Secure Terminal Login' : mode === 'signup' ? 'New Operator Setup' : 'Remote Access Protocol'}
          </p>
        </div>

        {error && <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-2xl text-[11px] font-black uppercase text-center">{error}</div>}
        {message && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl text-[11px] font-black uppercase text-center">{message}</div>}

        <form onSubmit={handleAuth} className="space-y-4">
          {mode === 'signup' && (
            <input 
              required
              className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:ring-2 ring-blue-500 outline-none transition-all placeholder:text-slate-600 font-bold"
              placeholder="FULL NAME"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
            />
          )}
          <input 
            required
            type="email"
            className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:ring-2 ring-blue-500 outline-none transition-all placeholder:text-slate-600 font-bold"
            placeholder="EMAIL ADDRESS"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          {(mode === 'login' || mode === 'signup') && (
            <input 
              required
              type="password"
              className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:ring-2 ring-blue-500 outline-none transition-all placeholder:text-slate-600 font-bold"
              placeholder="PASSWORD"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          )}
          <button 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-500/20 active:scale-95 text-white"
          >
            {loading ? 'Authorizing...' : 'Execute Access'}
          </button>
        </form>

        <div className="flex flex-col gap-4 text-center">
            <div className="flex justify-center gap-6">
                <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-[10px] font-black uppercase text-slate-500 hover:text-blue-400 tracking-widest transition-colors">
                    {mode === 'login' ? 'Create Account' : 'Back to Login'}
                </button>
                <button onClick={() => setMode('magic-link')} className="text-[10px] font-black uppercase text-slate-500 hover:text-blue-400 tracking-widest transition-colors">
                    Magic Link
                </button>
            </div>
            {mode === 'login' && (
                <button onClick={() => setMode('reset-password')} className="text-[10px] font-black uppercase text-slate-600 hover:text-rose-400 tracking-widest transition-colors">
                    Forgot Password?
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

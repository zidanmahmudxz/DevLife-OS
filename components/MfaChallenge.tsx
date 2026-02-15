
import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

export const MfaChallenge: React.FC = () => {
  const { checkMfa } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;
    setLoading(true);
    setError(null);

    try {
      const auth = supabase.auth as any;
      const { data: factors } = await auth.mfa.listFactors();
      const factor = factors.all.find((f: any) => f.status === 'verified' && f.factor_type === 'totp');
      
      if (!factor) throw new Error('No verified security factor found.');

      const { data: challenge, error: challengeError } = await auth.mfa.challenge({ factorId: factor.id });
      if (challengeError) throw challengeError;

      const { error: verifyError } = await auth.mfa.verify({
        factorId: factor.id,
        challengeId: challenge.id,
        code
      });

      if (verifyError) throw verifyError;
      
      await checkMfa(); // Refresh context state
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
      <div className="w-full max-w-sm glass p-10 rounded-[40px] text-center space-y-8 border-white/5 shadow-2xl">
        <div className="w-20 h-20 bg-blue-500/10 rounded-[32px] flex items-center justify-center text-4xl mx-auto border border-blue-500/20 shadow-inner">🔐</div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white tracking-tighter">Security Challenge</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">AAL2 Authorization Required</p>
        </div>

        {error && <div className="bg-rose-500/10 text-rose-500 py-3 rounded-xl text-[10px] font-black uppercase border border-rose-500/20">{error}</div>}

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">6-Digit Code</label>
            <input 
              required
              maxLength={6}
              autoFocus
              className="w-full bg-slate-900 border border-white/5 rounded-2xl px-4 py-5 text-center text-4xl font-black tracking-[0.4em] text-blue-500 outline-none focus:ring-4 ring-blue-500/10 shadow-inner"
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
            />
          </div>
          <button 
            disabled={loading || code.length !== 6}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-30 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all active:scale-95"
          >
            {loading ? 'Authorizing...' : 'Authorize Terminal'}
          </button>
        </form>
        <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Operator Session Protection Active</p>
      </div>
    </div>
  );
};

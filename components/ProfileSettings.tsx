
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ProfileSettingsProps {
  onSignOut: () => Promise<void>;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ onSignOut }) => {
  const { user } = useAuth();
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [enrollData, setEnrollData] = useState<{ qr_code: string; factorId: string } | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkMfaStatus();
  }, []);

  const checkMfaStatus = async () => {
    try {
      const auth = supabase.auth as any;
      const { data, error } = await auth.mfa.listFactors();
      if (error) throw error;
      setMfaEnabled(data.all.some((f: any) => f.status === 'verified'));
    } catch (err) {
      console.error("MFA Status Error:", err);
    }
  };

  const startEnrollment = async () => {
    setLoading(true);
    try {
      const auth = supabase.auth as any;
      const { data, error } = await auth.mfa.enroll({ factorType: 'totp' });
      if (error) throw error;
      setEnrollData({ qr_code: data.totp.qr_code, factorId: data.id });
    } catch (err: any) {
      alert(`Enrollment Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const verifyEnrollment = async () => {
    if (!enrollData || verificationCode.length !== 6) return;
    setLoading(true);
    try {
      const auth = supabase.auth as any;
      const { data: challenge, error: challengeError } = await auth.mfa.challenge({ factorId: enrollData.factorId });
      if (challengeError) throw challengeError;

      const { error: verifyError } = await auth.mfa.verify({
        factorId: enrollData.factorId,
        challengeId: challenge.id,
        code: verificationCode
      });
      
      if (verifyError) throw verifyError;

      setMfaEnabled(true);
      setEnrollData(null);
      setVerificationCode('');
      alert('Security Protocol Activated: MFA Enabled.');
    } catch (err: any) {
      alert(`Verification Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const unenrollMfa = async () => {
    if (!confirm("Are you sure? This protocol reduction will decrease terminal security.")) return;
    setLoading(true);
    try {
      const auth = supabase.auth as any;
      const { data: factors } = await auth.mfa.listFactors();
      const verifiedFactor = factors.all.find((f: any) => f.status === 'verified');
      if (verifiedFactor) {
        const { error } = await auth.mfa.unenroll({ factorId: verifiedFactor.id });
        if (error) throw error;
        setMfaEnabled(false);
        alert("Security Protocol Updated: MFA Disabled.");
      }
    } catch (err: any) {
      alert(`Unenrollment Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10 py-6 animate-in slide-in-from-bottom-6 duration-500">
      <div className="flex justify-between items-center px-2">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase">Operator Profile</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">Terminal ID: {user?.id?.slice(0, 8)}</p>
        </div>
        <button 
          onClick={onSignOut} 
          className="bg-rose-500/10 text-rose-500 border border-rose-500/20 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-lg active:scale-95"
        >
          Logout Session
        </button>
      </div>

      <div className="glass p-10 rounded-[40px] space-y-10 border-white/5 relative overflow-hidden group">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/5 blur-[100px] group-hover:bg-blue-500/10 transition-all duration-700"></div>
        
        <div className="flex items-center gap-8">
          <div className="w-28 h-28 rounded-[36px] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-5xl font-black text-white shadow-2xl border border-white/10">
            {user?.email?.[0].toUpperCase()}
          </div>
          <div className="space-y-2">
            <h3 className="text-3xl font-black text-white tracking-tight">{user?.user_metadata?.full_name || 'Operator'}</h3>
            <div className="flex items-center gap-3">
              <span className="bg-slate-900 border border-white/5 px-4 py-1.5 rounded-xl text-xs font-bold text-slate-400 tracking-tight">{user?.email}</span>
              <span className="bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase text-blue-400 tracking-widest">Active Level 1</span>
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-white/5 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h4 className="text-xl font-bold text-white flex items-center gap-3">
                <span className="text-xl">🛡️</span> Multi-Factor Authentication
              </h4>
              <p className="text-sm text-slate-500 font-medium">Verify your identity with an authenticator app for every login attempt.</p>
            </div>
            <div className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border self-start ${mfaEnabled ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-slate-900 text-slate-600 border-white/5'}`}>
              {mfaEnabled ? 'Protocol Enabled' : 'Protocol Inactive'}
            </div>
          </div>

          {!mfaEnabled && !enrollData && (
            <button 
              onClick={startEnrollment}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-2xl shadow-blue-500/20 text-white"
            >
              {loading ? 'Initializing Secure Enrollment...' : 'Enroll Security Protocol'}
            </button>
          )}

          {mfaEnabled && (
            <button 
              onClick={unenrollMfa}
              disabled={loading}
              className="w-full bg-slate-900 border border-white/10 text-slate-500 py-5 rounded-3xl font-black text-xs uppercase tracking-widest hover:text-rose-500 hover:border-rose-500/40 transition-all"
            >
              {loading ? 'Updating Protocols...' : 'Disable Secure Authentication'}
            </button>
          )}

          {enrollData && (
            <div className="p-10 bg-slate-950/80 rounded-[40px] border border-blue-500/20 space-y-10 animate-in zoom-in-95 duration-500 shadow-2xl backdrop-blur-md">
              <div className="text-center space-y-3">
                <h5 className="text-lg font-black text-blue-400 uppercase tracking-tighter">Scan Verification Token</h5>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest leading-relaxed">Scan the code below using Google Authenticator or Authy terminal.</p>
              </div>
              
              <div className="bg-white p-6 rounded-[32px] w-fit mx-auto shadow-[0_0_40px_rgba(255,255,255,0.1)]" dangerouslySetInnerHTML={{ __html: enrollData.qr_code }}></div>
              
              <div className="space-y-6 max-w-sm mx-auto">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-600 tracking-[0.4em] block text-center">Auth Code Confirmation</label>
                  <input 
                    className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-5 outline-none focus:ring-4 ring-blue-500/10 text-center text-4xl font-black tracking-[0.5em] text-white shadow-inner"
                    placeholder="000000"
                    maxLength={6}
                    value={verificationCode}
                    onChange={e => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={verifyEnrollment}
                    disabled={loading || verificationCode.length !== 6}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-30 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20 text-white"
                  >
                    Confirm & Enable
                  </button>
                  <button 
                    onClick={() => setEnrollData(null)}
                    className="px-8 bg-slate-800 text-slate-500 rounded-2xl font-black text-xs uppercase hover:text-white transition-all border border-white/5"
                  >
                    Abort
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="text-center space-y-2 py-4">
        <p className="text-[10px] text-slate-700 font-black uppercase tracking-[0.4em]">DevLife OS v3.4.1 | Secure Workspace Environment</p>
        <p className="text-[9px] text-slate-800 font-bold uppercase tracking-widest">Single Source of Truth Verified</p>
      </div>
    </div>
  );
};

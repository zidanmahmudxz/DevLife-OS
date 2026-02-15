
import React, { useState } from 'react';
import { APIKey } from '../types';
import { encryptData, decryptData } from '../services/crypto';
import { db } from '../services/db';

interface ApiVaultProps {
  vault: APIKey[];
}

export const ApiVault: React.FC<ApiVaultProps> = ({ vault }) => {
  const [service, setService] = useState('');
  const [key, setKey] = useState('');
  const [decryptedValues, setDecryptedValues] = useState<Record<string, string>>({});

  // Fixed: Updated handleSave to use central db.upsert.
  // This automatically handles required BaseEntity properties and fixes the prop-drilling setter error.
  const handleSave = async () => {
    if (!service || !key) return;
    const encrypted = await encryptData(key);
    await db.upsert('vault', {
      id: Math.random().toString(36).substr(2, 9),
      service_name: service,
      encrypted_key: encrypted,
      expiry_date: 'No Expiry'
    });
    setService('');
    setKey('');
  };

  const handleReveal = async (id: string, encrypted: string) => {
    if (decryptedValues[id]) {
      const newVals = { ...decryptedValues };
      delete newVals[id];
      setDecryptedValues(newVals);
    } else {
      const decrypted = await decryptData(encrypted);
      setDecryptedValues({ ...decryptedValues, [id]: decrypted });
    }
  };

  // Fixed: Updated to use central db.delete service
  const handleDelete = async (id: string) => {
    await db.delete('vault', id);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold">API Vault</h2>
          <p className="text-slate-400">Locally encrypted keys. They never leave your device.</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-xl text-xs font-bold border border-emerald-500/20">
            <span>🛡️</span> End-to-End Encrypted
        </div>
      </div>

      <div className="glass p-8 rounded-3xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
                className="bg-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-indigo-500" 
                placeholder="Service Name (e.g., Gemini API)"
                value={service}
                onChange={e => setService(e.target.value)}
            />
            <input 
                type="password"
                className="bg-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-indigo-500" 
                placeholder="API Key / Secret"
                value={key}
                onChange={e => setKey(e.target.value)}
            />
        </div>
        <button 
            onClick={handleSave}
            className="w-full bg-indigo-600 hover:bg-indigo-700 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20"
        >
            Secure Key
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {vault.map(entry => (
          <div key={entry.id} className="glass p-5 rounded-2xl flex items-center justify-between group hover:border-indigo-500/30 transition-all">
            <div className="space-y-1">
                <h4 className="font-bold">{entry.service_name}</h4>
                <div className="flex items-center gap-2">
                    <code className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">
                        {decryptedValues[entry.id] ? decryptedValues[entry.id] : '••••••••••••••••••••'}
                    </code>
                    <button 
                        onClick={() => handleReveal(entry.id, entry.encrypted_key)}
                        className="text-[10px] uppercase font-bold text-indigo-400 hover:underline"
                    >
                        {decryptedValues[entry.id] ? 'Hide' : 'Reveal'}
                    </button>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">AES-GCM-256</span>
                <button onClick={() => handleDelete(entry.id)} className="text-slate-600 hover:text-rose-500 transition-colors">
                    🗑️
                </button>
            </div>
          </div>
        ))}
        {vault.length === 0 && <div className="text-center py-12 text-slate-600 border border-dashed border-slate-800 rounded-3xl">No keys stored in the vault.</div>}
      </div>
    </div>
  );
};

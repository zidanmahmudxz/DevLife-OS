
import React, { useState, useMemo } from 'react';
import { FinanceEntry, FinanceType } from '../types';
import { db } from '../services/db';

interface FinanceTrackerProps {
  finances: FinanceEntry[];
}

export const FinanceTracker: React.FC<FinanceTrackerProps> = ({ finances }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ client: '', amount: '', type: 'income' as FinanceType, date: new Date().toISOString().split('T')[0] });
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeView, setActiveView] = useState<'all' | FinanceType | 'profit' | 'business_balance'>('all');

  const handleSave = async () => {
    if (!form.client || !form.amount) return;
    
    await db.upsert('finances', {
      id: editingId || crypto.randomUUID(),
      type: form.type,
      amount: parseFloat(form.amount),
      client_name: form.client,
      date: form.date
    });
    
    setIsAdding(false);
    setEditingId(null);
    setForm({ client: '', amount: '', type: 'income', date: new Date().toISOString().split('T')[0] });
  };

  const handleEdit = (entry: FinanceEntry) => {
    setEditingId(entry.id);
    setForm({ client: entry.client_name, amount: entry.amount.toString(), type: entry.type, date: entry.date });
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Do you want to delete this record?")) {
      await db.delete('finances', id);
    }
  };

  const filteredFinances = useMemo(() => {
    return finances.filter(f => {
      const matchesDate = (!startDate || f.date >= startDate) && (!endDate || f.date <= endDate);
      const matchesView = activeView === 'all' 
        || (activeView === 'profit' && (f.type === 'income' || f.type === 'expense'))
        || (activeView === 'business_balance' && (f.type === 'business_delivery' || f.type === 'business_payment'))
        || f.type === activeView;
      return matchesDate && matchesView;
    });
  }, [finances, startDate, endDate, activeView]);

  const stats = useMemo(() => {
    const calc = (type: FinanceType) => finances.filter(f => f.type === type).reduce((acc, curr) => acc + curr.amount, 0);
    
    // logic based on user request:
    // Total Income & Profit only from 'income' and 'expense'
    const income = calc('income');
    const expense = calc('expense');
    
    // Business balance: Delivery (+) vs Payment (-)
    const delivered = calc('business_delivery');
    const received = calc('business_payment');
    
    // Loan balance: Loan (+) vs Repayment (-)
    const loans = calc('loan');
    const repaid = calc('repayment');

    return {
      revenue: income, // Business payments don't mix with direct income anymore
      expenses: expense,
      profit: income - expense, // Profit is purely based on general income vs expense
      loanBalance: loans - repaid,
      receivables: delivered - received
    };
  }, [finances]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold">Money Manager</h2>
          <p className="text-slate-400">Track your income, expenses, and loans in BDT (৳).</p>
        </div>
        <button 
          onClick={() => { setIsAdding(true); setEditingId(null); }}
          className="bg-emerald-600 hover:bg-emerald-700 px-6 py-3 rounded-2xl font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
        >
          <span>➕</span> New Record
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard 
          title="Total Income" value={`৳${stats.revenue.toLocaleString()}`} color="emerald" icon="📈" 
          active={activeView === 'income'} onClick={() => setActiveView(activeView === 'income' ? 'all' : 'income')}
        />
        <StatCard 
          title="Total Expense" value={`৳${stats.expenses.toLocaleString()}`} color="rose" icon="📉" 
          active={activeView === 'expense'} onClick={() => setActiveView(activeView === 'expense' ? 'all' : 'expense')}
        />
        <StatCard 
          title="Net Profit" value={`৳${stats.profit.toLocaleString()}`} color="blue" icon="💎" 
          active={activeView === 'profit'} onClick={() => setActiveView(activeView === 'profit' ? 'all' : 'profit')}
        />
        <StatCard 
          title="Total Loans" value={`৳${stats.loanBalance.toLocaleString()}`} color="amber" icon="🤝" 
          active={activeView === 'loan'} onClick={() => setActiveView(activeView === 'loan' ? 'all' : 'loan')}
          subtitle={stats.loanBalance > 0 ? "Pending" : "Cleared"}
        />
        <StatCard 
          title="Receivables" value={`৳${stats.receivables.toLocaleString()}`} color="indigo" icon="📦" 
          active={activeView === 'business_balance'} onClick={() => setActiveView(activeView === 'business_balance' ? 'all' : 'business_balance')}
          subtitle="Client Balance"
        />
      </div>

      <div className="glass p-4 rounded-2xl flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-500 uppercase">Start Date</span>
            <input type="date" className="bg-slate-800 border-white/5 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 ring-emerald-500" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-500 uppercase">End Date</span>
            <input type="date" className="bg-slate-800 border-white/5 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 ring-emerald-500" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
        <button onClick={() => { setStartDate(''); setEndDate(''); setActiveView('all'); }} className="text-[10px] font-black text-rose-400 hover:text-rose-300 transition-colors uppercase ml-auto">Clear Filters</button>
      </div>

      {isAdding && (
        <div className="glass p-8 rounded-3xl border-emerald-500/30 animate-in zoom-in-95 duration-200">
          <h3 className="text-xl font-bold mb-6 text-white">{editingId ? 'Edit Record' : 'Add New Record'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Client / Source Name</label>
                <input className="w-full bg-slate-800 rounded-xl px-4 py-3 outline-none" placeholder="Enter name" value={form.client} onChange={e => setForm({...form, client: e.target.value})} />
            </div>
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Amount (৳)</label>
                <input type="number" className="w-full bg-slate-800 rounded-xl px-4 py-3 outline-none" placeholder="0.00" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
            </div>
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Category</label>
                <select className="w-full bg-slate-800 rounded-xl px-4 py-3 outline-none" value={form.type} onChange={e => setForm({...form, type: e.target.value as FinanceType})}>
                    <option value="income">General Income</option>
                    <option value="expense">General Expense</option>
                    <option value="business_delivery">Work Delivered (Invoice)</option>
                    <option value="business_payment">Payment Received (Collect)</option>
                    <option value="loan">Borrow Money (Loan)</option>
                    <option value="repayment">Pay Back Loan (Repay)</option>
                </select>
            </div>
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Date</label>
                <input type="date" className="w-full bg-slate-800 rounded-xl px-4 py-3 outline-none" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
            </div>
          </div>
          <div className="mt-8 flex gap-3">
            <button onClick={handleSave} className="bg-emerald-600 px-8 py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/20">Save Record</button>
            <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="bg-slate-800 px-8 py-3 rounded-xl text-slate-400 font-bold">Cancel</button>
          </div>
        </div>
      )}

      <div className="glass rounded-3xl overflow-hidden">
        <div className="p-4 border-b border-white/5 bg-slate-900/50 flex justify-between items-center">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">
                Filter: <span className="text-blue-400">{activeView === 'all' ? 'All Records' : activeView.replace('_', ' ')}</span>
            </h3>
            <span className="text-[10px] font-black text-slate-600">DevLife OS Money DB</span>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className="bg-slate-950/50 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Client/Source</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Type</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Value</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredFinances.map(entry => (
                <tr key={entry.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4 text-xs text-slate-400 font-bold tracking-tighter">{entry.date}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-200">
                      <div className="flex items-center gap-2">
                        {entry.client_name}
                        {entry.sync_status === 'pending' && <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" title="Sync Pending"></div>}
                      </div>
                      <div className="flex gap-2 mt-1">
                        {entry.type === 'loan' && (
                          <button 
                            onClick={() => { setForm({ client: entry.client_name, amount: '', type: 'repayment', date: new Date().toISOString().split('T')[0] }); setIsAdding(true); }} 
                            className="text-[9px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-all font-black uppercase tracking-tighter"
                          >
                            REPAY LOAN
                          </button>
                        )}
                        {entry.type === 'business_delivery' && (
                          <button 
                            onClick={() => { setForm({ client: entry.client_name, amount: '', type: 'business_payment', date: new Date().toISOString().split('T')[0] }); setIsAdding(true); }} 
                            className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all font-black uppercase tracking-tighter"
                          >
                            COLLECT MONEY
                          </button>
                        )}
                      </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tighter border ${getTypeStyles(entry.type)}`}>
                      {entry.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-sm font-black text-right ${getValueColor(entry.type)}`}>
                    {getSign(entry.type)}৳{entry.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEdit(entry)} className="p-1.5 hover:bg-white/5 rounded-lg text-blue-400">✏️</button>
                          <button onClick={() => handleDelete(entry.id)} className="p-1.5 hover:bg-rose-500/10 rounded-lg text-rose-500">🗑️</button>
                      </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredFinances.length === 0 && <div className="p-20 text-center text-slate-600 font-bold uppercase tracking-widest italic">No records match the current filter.</div>}
      </div>
    </div>
  );
};

const getTypeStyles = (type: FinanceType) => {
    switch(type) {
        case 'income': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
        case 'expense': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
        case 'loan': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        case 'repayment': return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
        case 'business_delivery': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
        case 'business_payment': return 'bg-emerald-600/10 text-emerald-200 border-emerald-600/20';
        default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
}

const getValueColor = (type: FinanceType) => {
    switch(type) {
        case 'income': case 'loan': case 'business_delivery': return 'text-emerald-400';
        case 'expense': case 'repayment': case 'business_payment': return 'text-rose-400';
    }
}

const getSign = (type: FinanceType) => {
    // income adds to cash, loan adds to liability balance, delivery adds to receivable balance
    if (type === 'income' || type === 'loan' || type === 'business_delivery') return '+';
    // expense removes cash, repayment removes liability, payment removes receivable
    return '-';
}

const StatCard = ({ title, value, color, icon, subtitle, active, onClick }: { title: string, value: string, color: string, icon: string, subtitle?: string, active?: boolean, onClick: () => void }) => (
  <div 
    onClick={onClick}
    className={`glass p-5 rounded-3xl border-white/5 transition-all cursor-pointer select-none relative overflow-hidden ${active ? `ring-2 ring-${color}-500/50 bg-${color}-500/5` : 'hover:border-white/20'}`}
  >
    <div className="flex justify-between items-start mb-3">
        <div className={`w-10 h-10 rounded-xl bg-${color}-500/10 flex items-center justify-center text-lg`}>{icon}</div>
        {subtitle && <span className={`text-[9px] font-black uppercase tracking-widest text-${color}-400 bg-${color}-500/5 px-2 py-0.5 rounded-md`}>{subtitle}</span>}
    </div>
    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{title}</p>
    <h4 className={`text-xl font-black mt-1 text-${color}-400`}>{value}</h4>
    {active && <div className={`absolute bottom-0 left-0 right-0 h-1 bg-${color}-500`}></div>}
  </div>
);

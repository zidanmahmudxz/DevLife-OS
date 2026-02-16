import React, { useState, useMemo } from 'react';
import { FinanceEntry, FinanceType } from '../types';
import { db } from '../services/db';

interface FinanceTrackerProps {
  finances: FinanceEntry[];
}

export const FinanceTracker: React.FC<FinanceTrackerProps> = ({ finances }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    client: '',
    amount: '',
    type: 'income' as FinanceType,
    date: new Date().toISOString().split('T')[0]
  });

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeView, setActiveView] =
    useState<'all' | FinanceType | 'profit' | 'business_balance'>('all');

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
    setForm({
      client: '',
      amount: '',
      type: 'income',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleEdit = (entry: FinanceEntry) => {
    setEditingId(entry.id);
    setForm({
      client: entry.client_name,
      amount: entry.amount.toString(),
      type: entry.type,
      date: entry.date
    });
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Do you want to delete this record?')) {
      await db.delete('finances', id);
    }
  };

  const filteredFinances = useMemo(() => {
    return finances.filter((f) => {
      const matchesDate =
        (!startDate || f.date >= startDate) &&
        (!endDate || f.date <= endDate);

      const matchesView =
        activeView === 'all' ||
        (activeView === 'profit' &&
          (f.type === 'income' || f.type === 'expense')) ||
        (activeView === 'business_balance' &&
          (f.type === 'business_delivery' ||
            f.type === 'business_payment')) ||
        f.type === activeView;

      return matchesDate && matchesView;
    });
  }, [finances, startDate, endDate, activeView]);

  const stats = useMemo(() => {
    const calc = (type: FinanceType) =>
      finances
        .filter((f) => f.type === type)
        .reduce((acc, curr) => acc + curr.amount, 0);

    const income = calc('income');
    const expense = calc('expense');
    const loans = calc('loan');
    const repaid = calc('repayment');
    const delivered = calc('business_delivery');
    const received = calc('business_payment');

    return {
      revenue: income + received,
      expenses: expense,
      profit: income + received - expense,
      loanBalance: loans - repaid,
      receivables: delivered - received
    };
  }, [finances]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold">Money Manager</h2>
          <p className="text-slate-400">
            Track your income, expenses, and loans in BDT (৳).
          </p>
        </div>
        <button
          onClick={() => {
            setIsAdding(true);
            setEditingId(null);
          }}
          className="bg-emerald-600 hover:bg-emerald-700 px-6 py-3 rounded-2xl font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
        >
          <span>➕</span> New Record
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Income"
          value={`৳${stats.revenue.toLocaleString()}`}
          color="emerald"
          icon="📈"
          active={activeView === 'income'}
          onClick={() =>
            setActiveView(activeView === 'income' ? 'all' : 'income')
          }
        />
        <StatCard
          title="Total Expense"
          value={`৳${stats.expenses.toLocaleString()}`}
          color="rose"
          icon="📉"
          active={activeView === 'expense'}
          onClick={() =>
            setActiveView(activeView === 'expense' ? 'all' : 'expense')
          }
        />
        <StatCard
          title="Net Profit"
          value={`৳${stats.profit.toLocaleString()}`}
          color="blue"
          icon="💎"
          active={activeView === 'profit'}
          onClick={() =>
            setActiveView(activeView === 'profit' ? 'all' : 'profit')
          }
        />
        <StatCard
          title="Total Loans"
          value={`৳${stats.loanBalance.toLocaleString()}`}
          color="amber"
          icon="🤝"
          subtitle={stats.loanBalance > 0 ? 'Pending' : 'Cleared'}
          active={activeView === 'loan'}
          onClick={() =>
            setActiveView(activeView === 'loan' ? 'all' : 'loan')
          }
        />
        <StatCard
          title="Receivables"
          value={`৳${stats.receivables.toLocaleString()}`}
          color="indigo"
          icon="📦"
          subtitle="Client Balance"
          active={activeView === 'business_balance'}
          onClick={() =>
            setActiveView(
              activeView === 'business_balance'
                ? 'all'
                : 'business_balance'
            )
          }
        />
      </div>

      {/* Table */}
      <div className="glass rounded-3xl overflow-hidden">
        <div className="p-4 border-b border-white/5 bg-slate-900/50 flex justify-between items-center">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">
            Filter:{' '}
            <span className="text-blue-400">
              {activeView === 'all'
                ? 'All Records'
                : activeView.replace('_', ' ')}
            </span>
          </h3>
          <span className="text-[10px] font-black text-slate-600">
            DevLife OS Money DB
          </span>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className="bg-slate-950/50 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase">
                  Client/Source
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-slate-500 uppercase">
                  Value
                </th>
                <th className="px-6 py-4 text-center text-[10px] font-black text-slate-500 uppercase">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredFinances.map((entry) => (
                <tr
                  key={entry.id}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-6 py-4 text-xs text-slate-400">
                    {entry.date}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-200">
                    {entry.client_name}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase border ${getTypeStyles(
                        entry.type
                      )}`}
                    >
                      {entry.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td
                    className={`px-6 py-4 text-right font-black ${getValueColor(
                      entry.type
                    )}`}
                  >
                    {getSign(entry.type)}৳
                    {entry.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleEdit(entry)}
                      className="mr-2"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ===============================
   Tailwind Safe Color Variants
=================================*/

const colorVariants = {
  emerald: {
    ring: 'ring-emerald-500/50',
    bg: 'bg-emerald-500/5',
    text: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10',
    bar: 'bg-emerald-500'
  },
  rose: {
    ring: 'ring-rose-500/50',
    bg: 'bg-rose-500/5',
    text: 'text-rose-400',
    iconBg: 'bg-rose-500/10',
    bar: 'bg-rose-500'
  },
  blue: {
    ring: 'ring-blue-500/50',
    bg: 'bg-blue-500/5',
    text: 'text-blue-400',
    iconBg: 'bg-blue-500/10',
    bar: 'bg-blue-500'
  },
  amber: {
    ring: 'ring-amber-500/50',
    bg: 'bg-amber-500/5',
    text: 'text-amber-400',
    iconBg: 'bg-amber-500/10',
    bar: 'bg-amber-500'
  },
  indigo: {
    ring: 'ring-indigo-500/50',
    bg: 'bg-indigo-500/5',
    text: 'text-indigo-400',
    iconBg: 'bg-indigo-500/10',
    bar: 'bg-indigo-500'
  }
} as const;

/* ===============================
   Safe StatCard Component
=================================*/

const StatCard = ({
  title,
  value,
  color,
  icon,
  subtitle,
  active,
  onClick
}: {
  title: string;
  value: string;
  color: keyof typeof colorVariants;
  icon: string;
  subtitle?: string;
  active?: boolean;
  onClick: () => void;
}) => {
  const variant = colorVariants[color];

  return (
    <div
      onClick={onClick}
      className={`glass p-5 rounded-3xl border-white/5 transition-all cursor-pointer relative ${
        active
          ? `ring-2 ${variant.ring} ${variant.bg}`
          : 'hover:border-white/20'
      }`}
    >
      <div className="flex justify-between mb-3">
        <div
          className={`w-10 h-10 rounded-xl ${variant.iconBg} flex items-center justify-center text-lg`}
        >
          {icon}
        </div>

        {subtitle && (
          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-white/5">
            {subtitle}
          </span>
        )}
      </div>

      <p className="text-slate-500 text-[10px] font-black uppercase">
        {title}
      </p>

      <h4 className={`text-xl font-black mt-1 ${variant.text}`}>
        {value}
      </h4>

      {active && (
        <div
          className={`absolute bottom-0 left-0 right-0 h-1 ${variant.bar}`}
        ></div>
      )}
    </div>
  );
};

const getTypeStyles = (type: FinanceType) => {
  switch (type) {
    case 'income':
      return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    case 'expense':
      return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
    case 'loan':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'repayment':
      return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
    case 'business_delivery':
      return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    case 'business_payment':
      return 'bg-emerald-600/10 text-emerald-200 border-emerald-600/20';
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  }
};

const getValueColor = (type: FinanceType) => {
  switch (type) {
    case 'income':
    case 'business_payment':
    case 'loan':
      return 'text-emerald-400';
    default:
      return 'text-rose-400';
  }
};

const getSign = (type: FinanceType) => {
  return type === 'income' ||
    type === 'business_payment' ||
    type === 'loan'
    ? '+'
    : '-';
};

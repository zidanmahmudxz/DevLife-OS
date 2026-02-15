
import React, { useState, useEffect } from 'react';
import { AppState, Priority, ProjectStatus } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getFinancialAdvice } from '../services/gemini';

interface DashboardProps {
  state: AppState;
  isSyncing?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ state, isSyncing }) => {
  const [advice, setAdvice] = useState<string>("Analyzing your data...");

  const totalIncome = state.finances.filter(f => f.type === 'income' || f.type === 'business_payment').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = state.finances.filter(f => f.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const profit = totalIncome - totalExpense;
  
  const activeProjects = state.projects.filter(p => p.status === ProjectStatus.IN_PROGRESS || p.status === ProjectStatus.PLANNING).length;
  
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const todayTasks = state.tasks.filter(t => !t.completed && t.due_date === todayStr).length;
  const highPriorityTasks = state.tasks.filter(t => !t.completed && t.priority === Priority.HIGH).length;
  const overdueTasks = state.tasks.filter(t => !t.completed && new Date(t.due_date + 'T23:59:59') < now).length;

  useEffect(() => {
    const fetchAdvice = async () => {
      const res = await getFinancialAdvice(totalIncome, totalExpense);
      setAdvice(res);
    };
    fetchAdvice();
  }, [totalIncome, totalExpense]);

  const chartData = [
    { name: 'W1', income: 1200, expense: 400 },
    { name: 'W2', income: 2100, expense: 800 },
    { name: 'W3', income: 1500, expense: 300 },
    { name: 'W4', income: 3200, expense: 1200 },
  ];

  return (
    <div className="space-y-6 md:space-y-8 animate-in slide-in-from-bottom-2 duration-700">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl md:text-4xl font-black text-white tracking-tighter uppercase md:normal-case">System Status: <span className="text-emerald-500">Live</span></h2>
            {isSyncing && (
              <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></div>
                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Syncing</span>
              </div>
            )}
          </div>
          <p className="text-slate-400 text-xs md:text-sm font-medium">Updated as of {new Date().toLocaleTimeString()}.</p>
        </div>
        <div className="hidden md:flex gap-2">
            <span className="bg-slate-900 border border-white/5 px-3 py-1.5 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest">Build 3.4.1</span>
            <span className="bg-blue-600/10 border border-blue-500/20 px-3 py-1.5 rounded-xl text-[10px] font-black text-blue-400 uppercase tracking-widest">Node 1.2</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard title="Total Balance" value={`৳${profit.toLocaleString()}`} icon="৳" color="emerald" />
        <StatCard title="Active Projects" value={activeProjects.toString()} icon="📁" color="blue" />
        <StatCard 
            title="Urgent Tasks" 
            value={highPriorityTasks.toString()} 
            icon="🔥" 
            color="rose" 
            subtitle={`${overdueTasks} Overdue`} 
            highlight={highPriorityTasks > 0}
            className="col-span-2 md:col-span-1"
        />
        <StatCard title="Today's Work" value={todayTasks.toString()} icon="✅" color="amber" subtitle="Pending" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass p-6 md:p-8 rounded-[30px] md:rounded-[40px] space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-[10px] md:text-sm font-black uppercase tracking-[0.2em] text-slate-500">Money Flow</h3>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div><span className="text-[10px] font-bold text-slate-400">Income</span></div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-700"></div><span className="text-[10px] font-bold text-slate-400">Expense</span></div>
                </div>
            </div>
            <div className="h-56 md:h-72 w-full overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
                    <Tooltip 
                        contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}
                        itemStyle={{ color: '#10b981', fontWeight: 'bold', fontSize: '10px' }}
                    />
                    <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={3} />
                    <Area type="monotone" dataKey="expense" stroke="#1e293b" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
                </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="glass p-6 md:p-8 rounded-[30px] md:rounded-[40px] space-y-6 flex flex-col">
            <div className="flex items-center gap-3 text-indigo-400 font-black uppercase tracking-[0.2em] text-[10px]">
                <span className="animate-pulse">🤖</span> Strategic Insight
            </div>
            <div className="flex-1 p-5 bg-slate-950/50 border border-white/5 rounded-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity"><span className="text-4xl italic font-serif">"</span></div>
                <p className="text-sm leading-relaxed text-indigo-100 italic font-medium relative z-10">
                    {advice}
                </p>
            </div>
            <div className="space-y-4 mt-2">
                <div className="flex justify-between items-center">
                    <p className="text-[10px] uppercase text-slate-500 font-black tracking-widest">Task Priority</p>
                    {overdueTasks > 0 && <span className="text-[9px] bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded font-black">OVERDUE</span>}
                </div>
                <div className="space-y-2">
                    {state.tasks.filter(t => !t.completed && t.priority === Priority.HIGH).slice(0, 2).map(task => (
                        <ActionItem key={task.id} label={task.title} color="rose" date={task.due_date} />
                    ))}
                    {state.tasks.filter(t => !t.completed && t.priority === Priority.HIGH).length === 0 && (
                         <ActionItem label="Status nominal" color="emerald" />
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string, value: string, icon: string, color: string, subtitle?: string, highlight?: boolean, className?: string }> = ({ title, value, icon, color, subtitle, highlight, className }) => (
  <div className={`glass p-5 md:p-7 rounded-[30px] md:rounded-[40px] border transition-all group cursor-default ${highlight ? 'border-rose-500/50 bg-rose-500/5 ring-1 ring-rose-500/20 shadow-lg' : 'border-white/5 hover:border-slate-700'} ${className}`}>
    <div className={`w-10 h-10 md:w-14 md:h-14 rounded-2xl md:rounded-3xl bg-${color}-500/10 flex items-center justify-center text-xl md:text-3xl mb-3 md:mb-5 group-hover:rotate-12 transition-all duration-300`}>
      <span className="font-black">{icon}</span>
    </div>
    <p className="text-slate-500 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] truncate">{title}</p>
    <div className="flex items-baseline gap-2 md:gap-3">
        <h4 className={`text-2xl md:text-4xl font-black mt-1 md:mt-2 tracking-tighter ${highlight ? 'text-rose-500' : 'text-white'}`}>{value}</h4>
        {subtitle && <span className="text-[9px] md:text-[10px] font-black text-slate-600 uppercase tracking-tighter truncate">{subtitle}</span>}
    </div>
  </div>
);

const ActionItem: React.FC<{ label: string, color: string, date?: string }> = ({ label, color, date }) => (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950/50 hover:bg-slate-900 transition-all cursor-pointer text-[11px] font-bold group border border-white/5 hover:border-white/10">
        <div className={`w-1.5 h-1.5 rounded-full bg-${color}-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] ${color === 'rose' ? 'animate-pulse' : ''}`}></div>
        <div className="flex-1 overflow-hidden">
            <p className="text-slate-300 group-hover:text-white transition-colors truncate">{label}</p>
            {date && <p className="text-[8px] text-slate-600 font-black uppercase mt-0.5">{date}</p>}
        </div>
        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-700">→</span>
    </div>
);

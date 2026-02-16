
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

// Custom Unique SVG Icons for a premium feel
const Icons = {
  Dashboard: ({ active }: { active: boolean }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="13" width="7" height="8" rx="2" fill={active ? "url(#grad-blue)" : "currentColor"} fillOpacity={active ? "1" : "0.2"} stroke={active ? "#3b82f6" : "currentColor"} strokeWidth="1.5"/>
      <rect x="14" y="3" width="7" height="10" rx="2" fill={active ? "url(#grad-blue)" : "currentColor"} fillOpacity={active ? "1" : "0.2"} stroke={active ? "#3b82f6" : "currentColor"} strokeWidth="1.5"/>
      <rect x="14" y="17" width="7" height="4" rx="2" fill={active ? "url(#grad-blue)" : "currentColor"} fillOpacity={active ? "1" : "0.2"} stroke={active ? "#3b82f6" : "currentColor"} strokeWidth="1.5"/>
      <rect x="3" y="3" width="7" height="6" rx="2" fill={active ? "url(#grad-blue)" : "currentColor"} fillOpacity={active ? "1" : "0.2"} stroke={active ? "#3b82f6" : "currentColor"} strokeWidth="1.5"/>
      <defs>
        <linearGradient id="grad-blue" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3b82f6" />
          <stop offset="1" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
    </svg>
  ),
  Projects: ({ active }: { active: boolean }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 11V7C2 5.89543 2.89543 5 4 5H7.58579C7.851 5 8.10536 5.10536 8.29289 5.29289L10.7071 7.70711C10.8946 7.89464 11.149 8 11.4142 8H20C21.1046 8 22 8.89543 22 10V11" stroke={active ? "#60a5fa" : "currentColor"} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M2 11C2 10.4477 2.44772 10 3 10H21C21.5523 10 22 10.4477 22 11V17C22 18.1046 21.1046 19 20 19H4C2.89543 19 2 18.1046 2 17V11Z" fill={active ? "url(#grad-indigo)" : "currentColor"} fillOpacity={active ? "1" : "0.2"} stroke={active ? "#60a5fa" : "currentColor"} strokeWidth="1.5"/>
      <defs>
        <linearGradient id="grad-indigo" x1="2" y1="10" x2="22" y2="19" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366f1" />
          <stop offset="1" stopColor="#4338ca" />
        </linearGradient>
      </defs>
    </svg>
  ),
Finance: ({ active }: { active: boolean }) => (
  <svg
    width="26"
    height="26"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="transition-all duration-300"
  >
    {/* Outer Circle */}
    <circle
      cx="12"
      cy="12"
      r="9.5"
      fill={active ? "url(#grad-emerald)" : "currentColor"}
      fillOpacity={active ? "1" : "0.12"}
      stroke={active ? "#10b981" : "currentColor"}
      strokeWidth="1.8"
    />

    {/* Vertical Line */}
    <path
      d="M12 7V17"
      stroke={active ? "#ecfdf5" : "currentColor"}
      strokeWidth="1.8"
      strokeLinecap="round"
    />

    {/* Curved Flow */}
    <path
      d="M12 7C10.5 7 9 8.5 9 10C9 11.5 10.5 13 12 13"
      stroke={active ? "#ecfdf5" : "currentColor"}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Bottom Arrow */}
    <path
      d="M12 13L15 17"
      stroke={active ? "#ecfdf5" : "currentColor"}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Top Bar */}
    <path
      d="M10 7H14"
      stroke={active ? "#ecfdf5" : "currentColor"}
      strokeWidth="1.8"
      strokeLinecap="round"
    />

    <defs>
      <linearGradient
        id="grad-emerald"
        x1="3"
        y1="3"
        x2="21"
        y2="21"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#10b981" />
        <stop offset="1" stopColor="#059669" />
      </linearGradient>
    </defs>
  </svg>
),

  Tasks: ({ active }: { active: boolean }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 5H7C4.79086 5 3 6.79086 3 9V17C3 19.2091 4.79086 21 7 21H17C19.2091 21 21 19.2091 21 17V9C21 6.79086 19.2091 5 17 5H15" stroke={active ? "#8b5cf6" : "currentColor"} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M9 5C9 3.34315 10.3431 2 12 2C13.6569 2 15 3.34315 15 5H9Z" fill={active ? "#8b5cf6" : "transparent"} stroke={active ? "#8b5cf6" : "currentColor"} strokeWidth="1.5"/>
      <path d="M8 13L11 16L16 10" stroke={active ? "#fff" : "currentColor"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Vault: ({ active }: { active: boolean }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 17V14M12 14C11.1716 14 10.5 13.3284 10.5 12.5C10.5 11.6716 11.1716 11 12 11C12.8284 11 13.5 11.6716 13.5 12.5C13.5 13.3284 12.8284 14 12 14Z" stroke={active ? "#f59e0b" : "currentColor"} strokeWidth="1.5" strokeLinecap="round"/>
      <rect x="5" y="10" width="14" height="10" rx="3" fill={active ? "url(#grad-amber)" : "currentColor"} fillOpacity={active ? "1" : "0.2"} stroke={active ? "#f59e0b" : "currentColor"} strokeWidth="1.5"/>
      <path d="M7 10V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V10" stroke={active ? "#f59e0b" : "currentColor"} strokeWidth="1.5" strokeLinecap="round"/>
      <defs>
        <linearGradient id="grad-amber" x1="5" y1="10" x2="19" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fbbf24" />
          <stop offset="1" stopColor="#d97706" />
        </linearGradient>
      </defs>
    </svg>
  )
};

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { user } = useAuth();
  const [isFabOpen, setIsFabOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Home', icon: Icons.Dashboard },
    { id: 'projects', label: 'Projects', icon: Icons.Projects },
    { id: 'finance', label: 'Finance', icon: Icons.Finance },
    { id: 'tasks', label: 'Task List', icon: Icons.Tasks },
    { id: 'vault', label: 'API Vault', icon: Icons.Vault },
  ];

  const quickActions = [
    { label: 'New Task', icon: '✅', tab: 'tasks' },
    { label: 'New Project', icon: '🚀', tab: 'projects' },
    { label: 'New Transaction', icon: '৳', tab: 'finance' },
  ];

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden relative">
      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/50 flex flex-col hidden md:flex">
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            DevLife OS
          </h1>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-semibold">Workspace</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/5' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <span className="text-xl flex items-center justify-center">
                <item.icon active={activeTab === item.id} />
              </span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${activeTab === 'settings' ? 'bg-slate-800 ring-1 ring-white/10' : 'hover:bg-slate-800/50'}`}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white">
              {user?.email?.[0].toUpperCase()}
            </div>
            <div className="text-left overflow-hidden">
              <p className="text-sm font-semibold truncate">{user?.user_metadata?.full_name || 'Operator'}</p>
              <p className="text-[10px] text-slate-500 uppercase font-black">Account Settings</p>
            </div>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 pb-24 md:pb-8">
        <header className="sticky top-0 z-20 glass border-b border-white/5 p-4 md:hidden flex justify-between items-center">
            <h1 className="text-xl font-black tracking-tighter text-white">DevLife <span className="text-blue-500">OS</span></h1>
            <button 
                onClick={() => setActiveTab('settings')}
                className={`w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow-lg ${activeTab === 'settings' ? 'ring-2 ring-white/50' : ''}`}
            >
                {user?.email?.[0].toUpperCase()}
            </button>
        </header>

        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden glass border-t border-white/10 px-4 py-2 flex justify-between items-center h-20 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 relative px-2 ${isActive ? 'w-24' : 'w-12'}`}
            >
              {isActive && (
                <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-full scale-150 animate-pulse"></div>
              )}
              <div className={`transition-transform duration-300 relative z-10 ${isActive ? 'scale-125 -translate-y-1' : 'opacity-40'}`}>
                <item.icon active={isActive} />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest text-blue-400 transition-all duration-300 relative z-10 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-50 h-0 overflow-hidden'}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-0.5 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-24 right-6 z-50 md:hidden">
        {isFabOpen && (
            <div className="absolute bottom-16 right-0 space-y-3 animate-in slide-in-from-bottom-4 fade-in duration-300">
                {quickActions.map((action, idx) => (
                    <button
                        key={idx}
                        onClick={() => {
                            setActiveTab(action.tab);
                            setIsFabOpen(false);
                        }}
                        className="flex items-center gap-3 bg-slate-900 border border-white/10 p-3 rounded-2xl shadow-2xl group active:scale-90 transition-all"
                    >
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 whitespace-nowrap px-1">{action.label}</span>
                        <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center text-lg">{action.icon}</div>
                    </button>
                ))}
            </div>
        )}
        <button 
          onClick={() => setIsFabOpen(!isFabOpen)}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-2xl transition-all duration-300 ${isFabOpen ? 'bg-rose-600 rotate-45' : 'bg-blue-600 animate-glow'}`}
        >
          <span className="text-white">＋</span>
        </button>
      </div>

      {/* FAB Backdrop */}
      {isFabOpen && (
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
            onClick={() => setIsFabOpen(false)}
          ></div>
      )}
    </div>
  );
};

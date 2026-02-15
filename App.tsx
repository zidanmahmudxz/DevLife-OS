
import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ProjectManager } from './components/ProjectManager';
import { FinanceTracker } from './components/FinanceTracker';
import { TaskManager } from './components/TaskManager';
import { ApiVault } from './components/ApiVault';
import { ProfileSettings } from './components/ProfileSettings';
import { AuthPage } from './components/AuthPage';
import { MfaChallenge } from './components/MfaChallenge';
import { db } from './services/db';
import { syncService } from './services/sync';

const MainContent: React.FC = () => {
  const { user, loading, isMfaRequired, signOut: authSignOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'finance' | 'tasks' | 'vault' | 'settings'>('dashboard');
  const [state, setState] = useState(db.getState());
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (user) {
      // Initialize background sync
      syncService.init();

      const unsubscribe = db.subscribe(() => {
        setState(db.getState());
      });

      // Poll for sync status (simple indicator)
      const syncInterval = setInterval(() => {
        const raw = db.getRawData();
        const hasPending = Object.values(raw).some(list => list.some(i => i.sync_status === 'pending'));
        setIsSyncing(hasPending);
      }, 2000);

      return () => {
        unsubscribe();
        clearInterval(syncInterval);
      };
    }
  }, [user]);

  const handleSignOut = async () => {
    db.clear(); // Clear local cache on logout
    await authSignOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  if (isMfaRequired) {
    return <MfaChallenge />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard state={state} isSyncing={isSyncing} />;
      case 'projects': return <ProjectManager projects={state.projects} />;
      case 'finance': return <FinanceTracker finances={state.finances} />;
      case 'tasks': return <TaskManager tasks={state.tasks} />;
      case 'vault': return <ApiVault vault={state.vault} />;
      case 'settings': return <ProfileSettings onSignOut={handleSignOut} />;
      default: return <Dashboard state={state} isSyncing={isSyncing} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {renderContent()}
      </div>
    </Layout>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <MainContent />
  </AuthProvider>
);

export default App;

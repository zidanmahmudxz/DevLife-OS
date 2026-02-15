
import React, { useState, useMemo } from 'react';
import { Project, ProjectStatus } from '../types';
import { generateProjectRoadmap } from '../services/gemini';
import { db } from '../services/db';

interface ProjectManagerProps {
  projects: Project[];
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({ projects }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [newProject, setNewProject] = useState({ 
    name: '', github: '', live: '', notes: '', status: ProjectStatus.PLANNING, deadline: '', progress: 0 
  });
  const [roadmap, setRoadmap] = useState<any[] | null>(null);
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);

  const handleSave = async () => {
    if (!newProject.name) return;
    await db.upsert('projects', {
      id: editingId || crypto.randomUUID(),
      name: newProject.name,
      github_url: newProject.github,
      live_url: newProject.live,
      status: newProject.status as ProjectStatus,
      progress: newProject.progress,
      deadline: newProject.deadline || new Date().toISOString().split('T')[0],
      notes: newProject.notes,
    });
    setIsAdding(false);
    setEditingId(null);
    setNewProject({ name: '', github: '', live: '', notes: '', status: ProjectStatus.PLANNING, deadline: '', progress: 0 });
  };

  const handleEdit = (project: Project) => {
    setEditingId(project.id);
    setNewProject({
      name: project.name,
      github: project.github_url,
      live: project.live_url,
      notes: project.notes,
      status: project.status,
      deadline: project.deadline,
      progress: project.progress
    });
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Move project to archives?")) {
      await db.delete('projects', id);
    }
  };

  const getRoadmap = async (projectName: string, notes: string) => {
    setLoadingRoadmap(true);
    const res = await generateProjectRoadmap(projectName, notes);
    setRoadmap(res);
    setLoadingRoadmap(false);
  };

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === 'All' || p.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [projects, searchQuery, filterStatus]);

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.PLANNING: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case ProjectStatus.IN_PROGRESS: return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case ProjectStatus.COMPLETED: return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case ProjectStatus.ON_HOLD: return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Project List</h2>
          <p className="text-slate-400">Manage all your active digital projects here.</p>
        </div>
        <button 
          onClick={() => { setIsAdding(true); setEditingId(null); }}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-2xl font-bold shadow-xl shadow-blue-500/20 transition-all flex items-center gap-2 group"
        >
          <span className="group-hover:rotate-90 transition-transform duration-300">➕</span> New Project
        </button>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <input 
            type="text"
            placeholder="Search projects..."
            className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-12 py-3 outline-none focus:border-blue-500/50 focus:ring-1 ring-blue-500/20 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
        </div>
        <select 
          className="bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-3 outline-none focus:border-blue-500/50 transition-all cursor-pointer"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="All">All Projects</option>
          {Object.values(ProjectStatus).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {isAdding && (
        <div className="glass p-8 rounded-3xl border-blue-500/30 animate-in slide-in-from-top-4 duration-300">
          <h3 className="text-xl font-bold mb-6 text-white">{editingId ? 'Edit Project' : 'Add New Project'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Project Name</label>
              <input 
                className="w-full bg-slate-800 border-white/5 rounded-xl px-4 py-3 focus:ring-2 ring-blue-500 outline-none" 
                placeholder="Enter name"
                value={newProject.name}
                onChange={e => setNewProject({...newProject, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Status</label>
              <select 
                className="w-full bg-slate-800 border-white/5 rounded-xl px-4 py-3 focus:ring-2 ring-blue-500 outline-none"
                value={newProject.status}
                onChange={e => setNewProject({...newProject, status: e.target.value as ProjectStatus})}
              >
                {Object.values(ProjectStatus).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Deadline</label>
              <input 
                type="date"
                className="w-full bg-slate-800 border-white/5 rounded-xl px-4 py-3 focus:ring-2 ring-blue-500 outline-none text-slate-300" 
                value={newProject.deadline}
                onChange={e => setNewProject({...newProject, deadline: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">GitHub Link</label>
              <input 
                className="w-full bg-slate-800 border-white/5 rounded-xl px-4 py-3 focus:ring-2 ring-blue-500 outline-none" 
                placeholder="Repo URL"
                value={newProject.github}
                onChange={e => setNewProject({...newProject, github: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Live Website URL</label>
              <input 
                className="w-full bg-slate-800 border-white/5 rounded-xl px-4 py-3 focus:ring-2 ring-blue-500 outline-none" 
                placeholder="https://..."
                value={newProject.live}
                onChange={e => setNewProject({...newProject, live: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Progress ({newProject.progress}%)</label>
              <input 
                type="range"
                className="w-full accent-blue-500 mt-2"
                min="0" max="100"
                value={newProject.progress}
                onChange={e => setNewProject({...newProject, progress: parseInt(e.target.value)})}
              />
            </div>
            <div className="md:col-span-2 lg:col-span-3 space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Description</label>
              <textarea 
                className="w-full bg-slate-800 border-white/5 rounded-xl px-4 py-3 focus:ring-2 ring-blue-500 outline-none h-24" 
                placeholder="Describe your project..."
                value={newProject.notes}
                onChange={e => setNewProject({...newProject, notes: e.target.value})}
              />
            </div>
          </div>
          <div className="mt-8 flex gap-3">
            <button onClick={handleSave} className="bg-blue-600 px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:scale-105 transition-transform">Save Project</button>
            <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="bg-slate-800 px-8 py-3 rounded-xl text-slate-400 font-bold">Discard</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map(project => (
          <div key={project.id} className="glass p-6 rounded-3xl space-y-5 hover:border-slate-600 transition-all group flex flex-col relative overflow-hidden">
            {project.sync_status === 'pending' && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Sync Pending"></div>}
            
            <div className="flex justify-between items-start relative z-10">
              <div className="p-3 bg-slate-800/50 rounded-2xl text-2xl group-hover:scale-110 group-hover:bg-slate-700 transition-all duration-300">🚀</div>
              <div className="flex flex-col items-end gap-1">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Deadline: {project.deadline}</span>
              </div>
            </div>

            <div className="flex-1 space-y-2 relative z-10">
              <h4 className="text-xl font-bold group-hover:text-blue-400 transition-colors">{project.name}</h4>
              <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed">{project.notes || 'No description provided.'}</p>
            </div>

            <div className="space-y-1">
                <div className="flex justify-between items-end">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Progress</span>
                    <span className="text-[10px] font-black text-slate-300">{project.progress}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-1000 ease-out rounded-full ${project.progress === 100 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-gradient-to-r from-blue-600 to-indigo-500'}`}
                        style={{ width: `${project.progress}%` }}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 relative z-10">
              <a href={project.github_url} target="_blank" className="text-center bg-slate-800/50 border border-white/5 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-700 transition-all">GitHub</a>
              <a href={project.live_url} target="_blank" className="text-center bg-blue-600/10 border border-blue-500/20 text-blue-400 py-2.5 rounded-xl text-xs font-bold hover:bg-blue-600 hover:text-white transition-all">Live Site</a>
            </div>

            <div className="flex gap-2 pt-2">
                <button 
                onClick={() => getRoadmap(project.name, project.notes)}
                className="flex-1 py-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-[10px] uppercase font-black text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                <span>🧠</span> AI Roadmap
                </button>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(project)} className="px-3 bg-slate-800/50 border border-white/5 rounded-xl hover:bg-blue-500/10 transition-all">✏️</button>
                  <button onClick={() => handleDelete(project.id)} className="px-3 bg-slate-800/50 border border-white/5 rounded-xl hover:bg-rose-500/10 transition-all">🗑️</button>
                </div>
            </div>
          </div>
        ))}
        {filteredProjects.length === 0 && (
          <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-3xl">
             <span className="text-4xl block mb-4 opacity-50">🛰️</span>
             <p className="text-slate-500 font-medium">No projects found.</p>
          </div>
        )}
      </div>

      {loadingRoadmap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
          <div className="glass p-10 rounded-3xl text-center space-y-4 max-w-sm">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <h3 className="text-xl font-bold">Creating Roadmap</h3>
            <p className="text-slate-400 text-sm">Gemini AI is analyzing your project...</p>
          </div>
        </div>
      )}
      
      {roadmap && (
        <div className="glass p-8 rounded-3xl border-indigo-500/30 space-y-6 animate-in zoom-in-95 duration-300">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">🤖</span>
              <h3 className="text-xl font-bold text-slate-100">AI Generated Roadmap</h3>
            </div>
            <button 
              onClick={() => setRoadmap(null)} 
              className="text-slate-500 hover:text-white text-xs uppercase font-black tracking-widest bg-slate-800 px-4 py-2 rounded-xl"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roadmap.map((milestone: any, i: number) => (
              <div key={i} className="p-6 bg-slate-900/50 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all group">
                <h4 className="font-bold text-indigo-300 mb-4 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xs text-indigo-400 font-black">{i+1}</span>
                  {milestone.milestone}
                </h4>
                <ul className="space-y-3">
                  {milestone.tasks.map((task: string, j: number) => (
                    <li key={j} className="text-xs text-slate-400 flex items-start gap-3 group-hover:text-slate-300 transition-colors">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></span> {task}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

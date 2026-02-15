
import React, { useState, useEffect, useMemo } from 'react';
import { Task, Priority, RepeatType } from '../types';
import { requestNotificationPermission } from '../services/notifications';
import { db } from '../services/db';

interface TaskManagerProps {
  tasks: Task[];
}

export const TaskManager: React.FC<TaskManagerProps> = ({ tasks }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('Active');
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: Priority.MEDIUM,
    due_date: new Date().toISOString().split('T')[0],
    reminder_time: '',
    repeat_type: RepeatType.NONE,
  });

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const handleSaveTask = async () => {
    if (!form.title) return;
    
    await db.upsert('tasks', {
      id: editingTask?.id || crypto.randomUUID(),
      ...form,
      reminder_time: form.reminder_time || null,
      completed: editingTask?.completed || false,
    });
    
    setIsAdding(false);
    setEditingTask(null);
    resetForm();
  };

  const handleSnooze = async (task: Task, minutes: number) => {
    const newReminder = new Date(Date.now() + minutes * 60000).toISOString();
    await db.upsert('tasks', {
      id: task.id,
      reminder_time: newReminder
    });
    alert(`Snoozed "${task.title}" until ${new Date(newReminder).toLocaleTimeString()}`);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description,
      priority: task.priority,
      due_date: task.due_date,
      reminder_time: task.reminder_time || '',
      repeat_type: task.repeat_type,
    });
    setIsAdding(true);
  };

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      priority: Priority.MEDIUM,
      due_date: new Date().toISOString().split('T')[0],
      reminder_time: '',
      repeat_type: RepeatType.NONE,
    });
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
      const matchesPriority = filterPriority === 'All' || t.priority === filterPriority;
      
      const now = new Date();
      const dueDate = new Date(t.due_date + 'T23:59:59');
      const isOverdue = !t.completed && dueDate < now;
      
      let matchesStatus = true;
      if (filterStatus === 'Active') matchesStatus = !t.completed && !isOverdue;
      if (filterStatus === 'Completed') matchesStatus = t.completed;
      if (filterStatus === 'Overdue') matchesStatus = isOverdue;
      
      return matchesSearch && matchesPriority && matchesStatus;
    }).sort((a, b) => {
      if (a.priority === Priority.HIGH && b.priority !== Priority.HIGH) return -1;
      if (a.priority !== Priority.HIGH && b.priority === Priority.HIGH) return 1;
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    });
  }, [tasks, search, filterPriority, filterStatus]);

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white">Daily Tasks</h2>
          <p className="text-slate-400 text-sm">Keep track of all your professional tasks here.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setEditingTask(null); setIsAdding(true); }}
          className="bg-blue-600 hover:bg-blue-700 px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-blue-500/20 transition-all active:scale-95"
        >
          <span>➕</span> New Task
        </button>
      </div>

      <div className="glass p-3 rounded-2xl flex flex-col md:flex-row items-center gap-3">
        <div className="flex-1 w-full relative">
          <input 
            type="text" 
            placeholder="Search tasks..." 
            className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-10 py-2.5 text-sm outline-none focus:ring-1 ring-blue-500 transition-all"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30">🔍</span>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
            <select 
                className="flex-1 md:w-40 bg-slate-900/50 border border-white/5 rounded-xl px-3 py-2.5 text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer"
                value={filterPriority}
                onChange={e => setFilterPriority(e.target.value)}
            >
                <option value="All">All Priority</option>
                <option value={Priority.HIGH}>Urgent</option>
                <option value={Priority.MEDIUM}>Medium</option>
                <option value={Priority.LOW}>Low</option>
            </select>
            <select 
                className="flex-1 md:w-40 bg-slate-900/50 border border-white/5 rounded-xl px-3 py-2.5 text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer"
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
            >
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Overdue">Overdue</option>
            </select>
        </div>
      </div>

      {isAdding && (
        <div className="glass p-8 rounded-3xl border-blue-500/30 animate-in zoom-in-95 duration-200">
          <h3 className="text-xl font-black uppercase tracking-tighter text-blue-400 mb-6">{editingTask ? 'Edit Task' : 'Add New Task'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-1">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Task Title</label>
                <input className="w-full bg-slate-900/80 border border-white/5 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-blue-500 font-bold" placeholder="What needs to be done?" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Priority</label>
                <select className="w-full bg-slate-900/80 border border-white/5 rounded-xl px-4 py-3 outline-none" value={form.priority} onChange={e => setForm({...form, priority: e.target.value as Priority})}>
                    <option value={Priority.LOW}>Low - Not Urgent</option>
                    <option value={Priority.MEDIUM}>Medium - Soon</option>
                    <option value={Priority.HIGH}>Urgent - Today</option>
                </select>
            </div>
            <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Description</label>
                <textarea className="w-full bg-slate-900/80 border border-white/5 rounded-xl px-4 py-3 outline-none h-24 resize-none" placeholder="Task details..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Due Date</label>
                <input type="date" className="w-full bg-slate-900/80 border border-white/5 rounded-xl px-4 py-3 outline-none" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} />
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Reminder Time</label>
                <input type="datetime-local" className="w-full bg-slate-900/80 border border-white/5 rounded-xl px-4 py-3 outline-none" value={form.reminder_time} onChange={e => setForm({...form, reminder_time: e.target.value})} />
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Repeat</label>
                <select className="w-full bg-slate-900/80 border border-white/5 rounded-xl px-4 py-3 outline-none" value={form.repeat_type} onChange={e => setForm({...form, repeat_type: e.target.value as RepeatType})}>
                    <option value={RepeatType.NONE}>None</option>
                    <option value={RepeatType.DAILY}>Daily</option>
                    <option value={RepeatType.WEEKLY}>Weekly</option>
                </select>
            </div>
          </div>
          <div className="mt-8 flex gap-3">
            <button onClick={handleSaveTask} className="flex-1 bg-blue-600 hover:bg-blue-700 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 active:scale-95">Save Task</button>
            <button onClick={() => { setIsAdding(false); setEditingTask(null); }} className="px-10 bg-slate-900/80 py-3.5 rounded-xl text-slate-500 font-black text-xs uppercase tracking-widest hover:text-white transition-all">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {filteredTasks.map(task => (
          <TaskItem 
            key={task.id} 
            task={task} 
            onToggle={() => db.upsert('tasks', { id: task.id, completed: !task.completed })}
            onDelete={() => db.delete('tasks', task.id)}
            onEdit={() => handleEdit(task)}
            onSnooze={(min) => handleSnooze(task, min)}
          />
        ))}
        {filteredTasks.length === 0 && (
            <div className="text-center py-24 border-2 border-dashed border-white/5 rounded-[40px] opacity-30">
                <span className="text-4xl block mb-4">🛸</span>
                <p className="text-xs font-black uppercase tracking-[0.3em]">No Tasks Found</p>
            </div>
        )}
      </div>
    </div>
  );
};

const TaskItem: React.FC<{ task: Task, onToggle: () => void, onDelete: () => void, onEdit: () => void, onSnooze: (min: number) => void }> = ({ task, onToggle, onDelete, onEdit, onSnooze }) => {
    const [timeLeft, setTimeLeft] = useState('');
    
    useEffect(() => {
        const updateTimer = () => {
            const now = new Date().getTime();
            const due = new Date(task.due_date + 'T23:59:59').getTime();
            const diff = due - now;
            
            if (diff < 0) {
                setTimeLeft('Time Ended');
            } else {
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                setTimeLeft(`${days > 0 ? days + 'd ' : ''}${hours}h ${mins}m left`);
            }
        };
        updateTimer();
        const interval = setInterval(updateTimer, 60000);
        return () => clearInterval(interval);
    }, [task.due_date]);

    const isHigh = task.priority === Priority.HIGH;
    const isOverdue = timeLeft === 'Time Ended' && !task.completed;

    return (
        <div className={`glass p-6 rounded-[32px] border transition-all duration-500 group relative flex flex-col md:flex-row md:items-center gap-6 
            ${task.completed ? 'opacity-40 grayscale-[0.8] border-white/5' : isOverdue ? 'border-rose-500 bg-rose-500/5 shadow-[0_0_20px_rgba(239,68,68,0.1)] ring-1 ring-rose-500/20' : isHigh ? 'border-amber-500/30 shadow-xl shadow-amber-500/5 bg-slate-900/30' : 'border-white/5 hover:border-slate-700'}`}>
            
            <button 
                onClick={onToggle}
                className={`w-10 h-10 rounded-2xl border-2 shrink-0 flex items-center justify-center transition-all ${task.completed ? 'bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/20' : 'border-slate-700 hover:border-blue-500 active:scale-90'}`}
            >
                {task.completed && <span className="text-white font-black text-xl">✓</span>}
            </button>

            <div className="flex-1 space-y-1 relative z-10">
                <div className="flex flex-wrap items-center gap-3">
                    <h4 className={`text-xl font-bold transition-all tracking-tight ${task.completed ? 'line-through text-slate-500' : 'text-slate-100'}`}>{task.title}</h4>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border 
                        ${task.priority === Priority.HIGH ? 'bg-rose-500 text-white border-rose-400' : task.priority === Priority.MEDIUM ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
                        {task.priority}
                    </span>
                    {task.repeat_type !== RepeatType.NONE && <span className="text-[10px] text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded-md flex items-center gap-1">🔄 {task.repeat_type}</span>}
                    {task.sync_status === 'pending' && <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>}
                </div>
                <p className={`text-sm leading-relaxed ${task.completed ? 'text-slate-600' : 'text-slate-400'} line-clamp-1`}>{task.description || 'No description.'}</p>
            </div>

            <div className="flex flex-wrap items-center gap-8 relative z-10">
                <div className="text-right">
                    <p className={`text-xs font-black uppercase tracking-widest ${isOverdue ? 'text-rose-500 animate-pulse' : 'text-slate-500'}`}>{timeLeft}</p>
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-tighter">Due: {task.due_date}</p>
                </div>

                <div className="flex items-center gap-2 md:opacity-0 group-hover:opacity-100 transition-all duration-300">
                    {!task.completed && (
                        <div className="flex bg-slate-900 border border-white/5 rounded-2xl overflow-hidden p-1.5 gap-1.5 shadow-xl">
                            <button onClick={() => onSnooze(10)} className="px-2.5 py-1 text-[9px] font-black text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">10m</button>
                            <button onClick={() => onSnooze(30)} className="px-2.5 py-1 text-[9px] font-black text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">30m</button>
                            <button onClick={() => onSnooze(60)} className="px-2.5 py-1 text-[9px] font-black text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">1h</button>
                        </div>
                    )}
                    <button onClick={onEdit} className="p-2.5 text-blue-400 hover:bg-blue-400/10 rounded-2xl transition-all active:scale-90">✏️</button>
                    <button onClick={onDelete} className="p-2.5 text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all active:scale-90">🗑️</button>
                </div>
            </div>
        </div>
    );
}

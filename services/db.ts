
import { AppState, BaseEntity, SyncStatus } from '../types';

const STORAGE_KEY = 'devlife_offline_db';

class DatabaseService {
  private data: AppState = {
    projects: [],
    finances: [],
    tasks: [],
    vault: []
  };

  private listeners: Set<() => void> = new Set();

  constructor() {
    this.load();
  }

  private load() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        this.data = JSON.parse(saved);
      } catch (e) {
        console.error("Critical: Database corruption detected, resetting store.", e);
        this.clear();
      }
    }
  }

  private save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    this.notify();
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  getState(): AppState {
    return {
      projects: this.data.projects.filter(i => !i.deleted_at),
      finances: this.data.finances.filter(i => !i.deleted_at),
      tasks: this.data.tasks.filter(i => !i.deleted_at),
      vault: this.data.vault.filter(i => !i.deleted_at)
    };
  }

  getRawData(): AppState {
    return this.data;
  }

  clear() {
    this.data = { projects: [], finances: [], tasks: [], vault: [] };
    localStorage.removeItem(STORAGE_KEY);
    this.notify();
  }

  async upsert<K extends keyof AppState>(collection: K, item: Partial<AppState[K][number]> & { id: string }, isSync = false) {
    const list = this.data[collection] as any[];
    const index = list.findIndex(i => i.id === item.id);
    const now = new Date().toISOString();

    const existing = index > -1 ? list[index] : null;

    // Last-write-wins conflict resolution logic during sync
    if (isSync && existing && existing.updated_at >= (item as any).updated_at) {
        return existing; 
    }

    const newItem = {
      ...(existing || { created_at: now }),
      ...item,
      updated_at: isSync ? ((item as any).updated_at || now) : now,
      sync_status: isSync ? 'synced' : ('pending' as SyncStatus),
      deleted_at: (item as any).deleted_at || (existing ? existing.deleted_at : null)
    };

    if (index > -1) {
      list[index] = newItem;
    } else {
      list.push(newItem);
    }

    this.save();
    return newItem;
  }

  async delete(collection: keyof AppState, id: string) {
    const list = this.data[collection] as any[];
    const index = list.findIndex(i => i.id === id);
    if (index > -1) {
      list[index].deleted_at = new Date().toISOString();
      list[index].sync_status = 'pending';
      this.save();
    }
  }

  markSynced(collection: keyof AppState, id: string) {
    const list = this.data[collection] as any[];
    const index = list.findIndex(i => i.id === id);
    if (index > -1) {
      list[index].sync_status = 'synced';
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    }
  }
}

export const db = new DatabaseService();

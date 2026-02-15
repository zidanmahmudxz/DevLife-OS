
import { supabase } from './supabase';
import { db } from './db';
import { AppState } from '../types';

/**
 * Background Synchronization Service.
 * Implements full bi-directional sync with Supabase.
 */

class SyncService {
  private isSyncing = false;

  async syncAll() {
    if (this.isSyncing) return;
    this.isSyncing = true;
    console.debug('🔄 Sync Sequence Initiated...');

    try {
      const auth = supabase.auth as any;
      const { data: { user } } = await auth.getUser();
      if (!user) {
        console.debug('⚠️ Sync Aborted: User not authenticated');
        this.isSyncing = false;
        return;
      }

      const collections: (keyof AppState)[] = ['projects', 'finances', 'tasks', 'vault'];

      for (const collection of collections) {
        await this.pushPending(collection, user.id);
        await this.pullUpdates(collection, user.id);
      }

      console.debug('✅ Sync Success: All collections updated.');
    } catch (error) {
      console.error('❌ Sync Sequence Failure:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  private async pushPending(collection: keyof AppState, userId: string) {
    const rawData = db.getRawData();
    const pending = rawData[collection].filter(i => i.sync_status === 'pending');

    if (pending.length === 0) return;

    // Clean payload: strip local-only UI fields before pushing to Supabase
    const payload = pending.map(item => {
      const { sync_status, ...rest } = item as any;
      return { ...rest, user_id: userId };
    });

    const { error } = await supabase
      .from(collection)
      .upsert(payload, { onConflict: 'id' });

    if (!error) {
      pending.forEach(item => db.markSynced(collection, item.id));
    } else {
      console.error(`⬆️ Push Error (${collection}):`, error);
    }
  }

  private async pullUpdates(collection: keyof AppState, userId: string) {
    const rawData = db.getRawData();
    
    // Find the latest updated_at in local DB to query only newer items
    const lastSync = rawData[collection].reduce((acc, curr) => {
      return (curr.updated_at > acc) ? curr.updated_at : acc;
    }, '1970-01-01T00:00:00Z');

    const { data, error } = await supabase
      .from(collection)
      .select('*')
      .eq('user_id', userId)
      .gt('updated_at', lastSync);

    if (error) {
      console.error(`⬇️ Pull Error (${collection}):`, error);
      return;
    }

    if (data && data.length > 0) {
      console.debug(`⬇️ Pulled ${data.length} updates for ${collection}`);
      for (const item of data) {
        // Upsert to local db and mark as synced to prevent infinite loops
        await db.upsert(collection, item, true);
      }
    }
  }

  init() {
    this.syncAll();

    // Trigger on reconnection
    window.addEventListener('online', () => {
      console.debug('🌐 Connection Restored: Syncing...');
      this.syncAll();
    });

    // Background heart-beat (every 2 minutes)
    setInterval(() => this.syncAll(), 120000);
  }
}

export const syncService = new SyncService();

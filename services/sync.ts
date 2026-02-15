import { supabase } from './supabase';
import { db } from './db';
import { AppState } from '../types';

/**
 * Background Synchronization Service
 * Full bi-directional sync with Supabase (RLS safe)
 */

class SyncService {
  private isSyncing = false;

  async syncAll() {
    if (this.isSyncing) return;
    this.isSyncing = true;

    console.debug('🔄 Sync Sequence Initiated...');

    try {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data?.user) {
        console.debug('⚠️ Sync Aborted: User not authenticated');
        return;
      }

      const userId = data.user.id;

      const collections: (keyof AppState)[] = [
        'projects',
        'finances',
        'tasks',
        'vault'
      ];

      for (const collection of collections) {
        await this.pushPending(collection, userId);
        await this.pullUpdates(collection, userId);
      }

      console.debug('✅ Sync Success: All collections updated.');
    } catch (error) {
      console.error('❌ Sync Sequence Failure:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * PUSH LOCAL → SUPABASE
   */
  private async pushPending(collection: keyof AppState, userId: string) {
    if (!userId) {
      console.error("❌ Push aborted: No user ID");
      return;
    }

    const rawData = db.getRawData();
    const pending = rawData[collection].filter(
      (i: any) => i.sync_status === 'pending'
    );

    if (pending.length === 0) return;

    const payload = pending.map((item: any) => {
      const { sync_status, ...rest } = item;

      return {
        ...rest,
        user_id: userId, // 🔥 enforce correct user
        updated_at: new Date().toISOString()
      };
    });

    const { error } = await supabase
      .from(collection)
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.error(`⬆️ Push Error (${collection}):`, error);
      return;
    }

    pending.forEach((item: any) =>
      db.markSynced(collection, item.id)
    );

    console.debug(`⬆️ ${collection}: ${pending.length} items pushed`);
  }

  /**
   * PULL SUPABASE → LOCAL
   */
  private async pullUpdates(collection: keyof AppState, userId: string) {
    if (!userId) return;

    const rawData = db.getRawData();

    const lastSync = rawData[collection].reduce(
      (acc: string, curr: any) =>
        curr.updated_at > acc ? curr.updated_at : acc,
      '1970-01-01T00:00:00Z'
    );

    const { data, error } = await supabase
      .from(collection)
      .select('*')
      .eq('user_id', userId)
      .gt('updated_at', lastSync);

    if (error) {
      console.error(`⬇️ Pull Error (${collection}):`, error);
      return;
    }

    if (!data || data.length === 0) return;

    console.debug(`⬇️ Pulled ${data.length} updates for ${collection}`);

    for (const item of data) {
      await db.upsert(collection, item, true);
    }
  }

  /**
   * INIT BACKGROUND SYNC
   */
  init() {
    this.syncAll();

    window.addEventListener('online', () => {
      console.debug('🌐 Connection Restored: Syncing...');
      this.syncAll();
    });

    // every 2 minutes
    setInterval(() => {
      this.syncAll();
    }, 120000);
  }
}

export const syncService = new SyncService();

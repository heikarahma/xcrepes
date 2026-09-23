import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 
  import.meta.env.VITE_SUPABASE_URL || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 
  'https://rmdfylhbooogfrmzznob.supabase.co';

const supabaseAnonKey = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
  'sb_publishable_2BRyDOFOKlgcrPraEakufw_fSGqrVbL';

export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl.trim() !== '' && 
    supabaseAnonKey.trim() !== '' &&
    !supabaseUrl.includes('placeholder')
  );
};

// Singleton Supabase Client
// Menggunakan URL dummy jika belum disetting agar createClient tidak melempar exception fatal
export const supabase = createClient(
  isSupabaseConfigured() ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured() ? supabaseAnonKey : 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
);

/**
 * Helper untuk berlangganan perubahan tabel Supabase secara Realtime (multi-device sync)
 * Menggunakan unique channel identifier agar tidak terjadi konflik callback/collision
 * saat komponen di-remount atau saat Vite Fast Refresh / HMR.
 * 
 * @param {string} table - Nama tabel di Supabase
 * @param {function} callback - Callback function yang dipanggil saat ada INSERT/UPDATE/DELETE
 * @returns {object} Subscription channel yang dapat di-unsubscribe
 */
export const subscribeToTable = (table, callback) => {
  if (!isSupabaseConfigured()) return null;

  try {
    const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const channelName = `realtime_${table}_${uniqueId}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        (payload) => {
          if (typeof callback === 'function') {
            callback(payload);
          }
        }
      )
      .subscribe();

    const rawUnsubscribe = typeof channel.unsubscribe === 'function' 
      ? channel.unsubscribe.bind(channel) 
      : () => {};

    let isUnsubscribed = false;
    channel.unsubscribe = () => {
      if (isUnsubscribed) return;
      isUnsubscribed = true;
      try {
        if (typeof supabase.removeChannel === 'function') {
          supabase.removeChannel(channel).catch(() => {});
        } else {
          rawUnsubscribe();
        }
      } catch {
        rawUnsubscribe();
      }
    };

    return channel;
  } catch (err) {
    console.warn(`[Supabase Realtime] Gagal membuat subscription untuk tabel '${table}':`, err);
    return null;
  }
};

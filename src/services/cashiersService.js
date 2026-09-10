import { supabase, isSupabaseConfigured } from '../lib/supabase';

const TABLE = 'cashier_accounts';

export const cashiersService = {
  async getCashiers() {
    if (!isSupabaseConfigured()) return { data: [], error: null };
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('cashiersService.getCashiers error:', error);
      return { data: [], error };
    }

    return {
      data: (data || []).map(row => ({
        id: row.id,
        nama: row.nama,
        username: row.username,
        password: row.password,
        role: row.role || 'kasir',
        permissions: Array.isArray(row.permissions) ? row.permissions : [],
        isActive: row.is_active !== false,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      })),
      error: null
    };
  },

  async createCashier(cashier) {
    if (!isSupabaseConfigured()) return { data: null, error: new Error('Supabase not configured') };
    const payload = {
      id: cashier.id,
      nama: cashier.nama,
      username: cashier.username,
      password: cashier.password,
      role: cashier.role || 'kasir',
      permissions: Array.isArray(cashier.permissions) ? cashier.permissions : [],
      is_active: cashier.isActive !== false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from(TABLE)
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('cashiersService.createCashier error:', error);
      return { data: null, error };
    }

    return {
      data: {
        id: data.id,
        nama: data.nama,
        username: data.username,
        password: data.password,
        role: data.role,
        permissions: data.permissions || [],
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      },
      error: null
    };
  },

  async updateCashier(id, cashier) {
    if (!isSupabaseConfigured()) return { data: null, error: new Error('Supabase not configured') };
    const payload = {
      updated_at: new Date().toISOString()
    };
    if (cashier.nama !== undefined) payload.nama = cashier.nama;
    if (cashier.username !== undefined) payload.username = cashier.username;
    if (cashier.password !== undefined) payload.password = cashier.password;
    if (cashier.permissions !== undefined) payload.permissions = cashier.permissions;
    if (cashier.isActive !== undefined) payload.is_active = cashier.isActive;

    const { data, error } = await supabase
      .from(TABLE)
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('cashiersService.updateCashier error:', error);
      return { data: null, error };
    }

    return {
      data: {
        id: data.id,
        nama: data.nama,
        username: data.username,
        password: data.password,
        role: data.role,
        permissions: data.permissions || [],
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      },
      error: null
    };
  },

  async deleteCashier(id) {
    if (!isSupabaseConfigured()) return { error: new Error('Supabase not configured') };
    const { error } = await supabase
      .from(TABLE)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('cashiersService.deleteCashier error:', error);
    }
    return { error };
  }
};

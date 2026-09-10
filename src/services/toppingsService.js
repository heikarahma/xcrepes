import { supabase, isSupabaseConfigured } from '../lib/supabase';

const TABLE = 'toppings';

export const toppingsService = {
  async getToppings() {
    if (!isSupabaseConfigured()) return { data: [], error: null };
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('toppingsService.getToppings error:', error);
      return { data: [], error };
    }

    return {
      data: (data || []).map(row => ({
        id: row.id,
        name: row.name,
        price: Number(row.price) || 0,
        description: row.description || '',
        ingredients: Array.isArray(row.ingredients) ? row.ingredients : [],
        createdAt: row.created_at,
        updatedAt: row.updated_at
      })),
      error: null
    };
  },

  async createTopping({ id, name, price = 0, description = '', ingredients = [] }) {
    if (!isSupabaseConfigured()) return { data: null, error: new Error('Supabase not configured') };
    const payload = {
      id,
      name,
      price: Number(price) || 0,
      description,
      ingredients: Array.isArray(ingredients) ? ingredients : [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from(TABLE)
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('toppingsService.createTopping error:', error);
      return { data: null, error };
    }

    return {
      data: {
        id: data.id,
        name: data.name,
        price: Number(data.price) || 0,
        description: data.description || '',
        ingredients: data.ingredients || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at
      },
      error: null
    };
  },

  async updateTopping(id, { name, price, description, ingredients }) {
    if (!isSupabaseConfigured()) return { data: null, error: new Error('Supabase not configured') };
    const payload = {
      updated_at: new Date().toISOString()
    };
    if (name !== undefined) payload.name = name;
    if (price !== undefined) payload.price = Number(price) || 0;
    if (description !== undefined) payload.description = description;
    if (ingredients !== undefined) payload.ingredients = ingredients;

    const { data, error } = await supabase
      .from(TABLE)
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('toppingsService.updateTopping error:', error);
      return { data: null, error };
    }

    return {
      data: {
        id: data.id,
        name: data.name,
        price: Number(data.price) || 0,
        description: data.description || '',
        ingredients: data.ingredients || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at
      },
      error: null
    };
  },

  async deleteTopping(id) {
    if (!isSupabaseConfigured()) return { error: new Error('Supabase not configured') };
    const { error } = await supabase
      .from(TABLE)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('toppingsService.deleteTopping error:', error);
    }
    return { error };
  },

  async deleteToppingsBatch(ids) {
    if (!isSupabaseConfigured()) return { error: new Error('Supabase not configured') };
    const { error } = await supabase
      .from(TABLE)
      .delete()
      .in('id', ids);

    if (error) {
      console.error('toppingsService.deleteToppingsBatch error:', error);
    }
    return { error };
  }
};

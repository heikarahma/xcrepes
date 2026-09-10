import { supabase, isSupabaseConfigured } from '../lib/supabase';

const TABLE = 'categories';

export const categoriesService = {
  async getCategories() {
    if (!isSupabaseConfigured()) return { data: [], error: null };
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('categoriesService.getCategories error:', error);
      return { data: [], error };
    }

    return {
      data: (data || []).map(row => ({
        id: row.id,
        name: row.name,
        description: row.description || '',
        createdAt: row.created_at,
        updatedAt: row.updated_at
      })),
      error: null
    };
  },

  async createCategory({ id, name, description = '' }) {
    if (!isSupabaseConfigured()) return { data: null, error: new Error('Supabase not configured') };
    const payload = {
      id,
      name,
      description,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from(TABLE)
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('categoriesService.createCategory error:', error);
      return { data: null, error };
    }

    return {
      data: {
        id: data.id,
        name: data.name,
        description: data.description,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      },
      error: null
    };
  },

  async updateCategory(id, { name, description = '' }) {
    if (!isSupabaseConfigured()) return { data: null, error: new Error('Supabase not configured') };
    const { data, error } = await supabase
      .from(TABLE)
      .update({
        name,
        description,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('categoriesService.updateCategory error:', error);
      return { data: null, error };
    }

    return {
      data: {
        id: data.id,
        name: data.name,
        description: data.description,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      },
      error: null
    };
  },

  async deleteCategory(id) {
    if (!isSupabaseConfigured()) return { error: new Error('Supabase not configured') };
    const { error } = await supabase
      .from(TABLE)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('categoriesService.deleteCategory error:', error);
    }
    return { error };
  },

  async deleteCategoriesBatch(ids) {
    if (!isSupabaseConfigured()) return { error: new Error('Supabase not configured') };
    const { error } = await supabase
      .from(TABLE)
      .delete()
      .in('id', ids);

    if (error) {
      console.error('categoriesService.deleteCategoriesBatch error:', error);
    }
    return { error };
  }
};

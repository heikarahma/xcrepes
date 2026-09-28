import { supabase, isSupabaseConfigured } from '../lib/supabase';

const TABLE = 'toppings';

const getLocalToppingReceiptSettings = () => {
  try {
    const raw = localStorage.getItem('toppings_receipt_settings');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read toppings_receipt_settings from localStorage', e);
  }
  return {};
};

const saveLocalToppingReceiptSetting = (toppingId, showOnReceipt) => {
  try {
    const settings = getLocalToppingReceiptSettings();
    settings[toppingId] = Boolean(showOnReceipt !== false);
    localStorage.setItem('toppings_receipt_settings', JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to write toppings_receipt_settings to localStorage', e);
  }
};

export const toppingsService = {
  async getToppings() {
    const localReceiptMap = getLocalToppingReceiptSettings();
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
        showOnReceipt: row.show_on_receipt !== undefined 
          ? Boolean(row.show_on_receipt) 
          : (localReceiptMap[row.id] !== undefined ? localReceiptMap[row.id] : true),
        createdAt: row.created_at,
        updatedAt: row.updated_at
      })),
      error: null
    };
  },

  async createTopping({ id, name, price = 0, description = '', ingredients = [], showOnReceipt = true }) {
    if (!isSupabaseConfigured()) return { data: null, error: new Error('Supabase not configured') };
    
    saveLocalToppingReceiptSetting(id, showOnReceipt);

    const basePayload = {
      id,
      name,
      price: Number(price) || 0,
      description,
      ingredients: Array.isArray(ingredients) ? ingredients : [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const fullPayload = {
      ...basePayload,
      show_on_receipt: Boolean(showOnReceipt !== false)
    };

    let { data, error } = await supabase
      .from(TABLE)
      .insert([fullPayload])
      .select()
      .single();

    if (error && (error.code === 'PGRST204' || String(error.message).includes('column'))) {
      const retry = await supabase
        .from(TABLE)
        .insert([basePayload])
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }

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
        showOnReceipt: showOnReceipt !== false,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      },
      error: null
    };
  },

  async updateTopping(id, { name, price, description, ingredients, showOnReceipt }) {
    if (!isSupabaseConfigured()) return { data: null, error: new Error('Supabase not configured') };
    
    if (showOnReceipt !== undefined) {
      saveLocalToppingReceiptSetting(id, showOnReceipt);
    }

    const payload = {
      updated_at: new Date().toISOString()
    };
    if (name !== undefined) payload.name = name;
    if (price !== undefined) payload.price = Number(price) || 0;
    if (description !== undefined) payload.description = description;
    if (ingredients !== undefined) payload.ingredients = ingredients;

    const fullPayload = {
      ...payload,
      ...(showOnReceipt !== undefined ? { show_on_receipt: Boolean(showOnReceipt) } : {})
    };

    let { data, error } = await supabase
      .from(TABLE)
      .update(fullPayload)
      .eq('id', id)
      .select()
      .single();

    if (error && (error.code === 'PGRST204' || String(error.message).includes('column'))) {
      const retry = await supabase
        .from(TABLE)
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }

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
        showOnReceipt: showOnReceipt !== undefined ? Boolean(showOnReceipt) : true,
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

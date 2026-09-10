import { supabase, isSupabaseConfigured } from '../lib/supabase';

const TABLE = 'product_menus';

export const productMenusService = {
  async getProductMenus() {
    if (!isSupabaseConfigured()) return { data: [], error: null };
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('productMenusService.getProductMenus error:', error);
      return { data: [], error };
    }

    return {
      data: (data || []).map(row => ({
        id: row.id,
        name: row.name,
        categoryId: row.category_id,
        categoryName: row.category_name,
        image: row.image || '',
        price: Number(row.price) || 0,
        promoType: row.promo_type || null,
        promoAmount: Number(row.promo_amount) || 0,
        ingredients: Array.isArray(row.ingredients) ? row.ingredients : [],
        toppings: Array.isArray(row.toppings) ? row.toppings : [],
        createdAt: row.created_at,
        updatedAt: row.updated_at
      })),
      error: null
    };
  },

  async createProductMenu(menu) {
    if (!isSupabaseConfigured()) return { data: null, error: new Error('Supabase not configured') };
    const payload = {
      id: menu.id,
      name: menu.name,
      category_id: menu.categoryId,
      category_name: menu.categoryName,
      image: menu.image || '',
      price: Number(menu.price) || 0,
      promo_type: menu.promoType || null,
      promo_amount: Number(menu.promoAmount) || 0,
      ingredients: Array.isArray(menu.ingredients) ? menu.ingredients : [],
      toppings: Array.isArray(menu.toppings) ? menu.toppings : [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from(TABLE)
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('productMenusService.createProductMenu error:', error);
      return { data: null, error };
    }

    return {
      data: {
        id: data.id,
        name: data.name,
        categoryId: data.category_id,
        categoryName: data.category_name,
        image: data.image,
        price: Number(data.price) || 0,
        promoType: data.promo_type,
        promoAmount: Number(data.promo_amount) || 0,
        ingredients: data.ingredients || [],
        toppings: data.toppings || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at
      },
      error: null
    };
  },

  async updateProductMenu(id, menu) {
    if (!isSupabaseConfigured()) return { data: null, error: new Error('Supabase not configured') };
    const payload = {
      updated_at: new Date().toISOString()
    };
    if (menu.name !== undefined) payload.name = menu.name;
    if (menu.categoryId !== undefined) payload.category_id = menu.categoryId;
    if (menu.categoryName !== undefined) payload.category_name = menu.categoryName;
    if (menu.image !== undefined) payload.image = menu.image;
    if (menu.price !== undefined) payload.price = Number(menu.price) || 0;
    if (menu.promoType !== undefined) payload.promo_type = menu.promoType;
    if (menu.promoAmount !== undefined) payload.promo_amount = Number(menu.promoAmount) || 0;
    if (menu.ingredients !== undefined) payload.ingredients = menu.ingredients;
    if (menu.toppings !== undefined) payload.toppings = menu.toppings;

    const { data, error } = await supabase
      .from(TABLE)
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('productMenusService.updateProductMenu error:', error);
      return { data: null, error };
    }

    return {
      data: {
        id: data.id,
        name: data.name,
        categoryId: data.category_id,
        categoryName: data.category_name,
        image: data.image,
        price: Number(data.price) || 0,
        promoType: data.promo_type,
        promoAmount: Number(data.promo_amount) || 0,
        ingredients: data.ingredients || [],
        toppings: data.toppings || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at
      },
      error: null
    };
  },

  async deleteProductMenu(id) {
    if (!isSupabaseConfigured()) return { error: new Error('Supabase not configured') };
    const { error } = await supabase
      .from(TABLE)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('productMenusService.deleteProductMenu error:', error);
    }
    return { error };
  },

  async deleteProductMenusBatch(ids) {
    if (!isSupabaseConfigured()) return { error: new Error('Supabase not configured') };
    const { error } = await supabase
      .from(TABLE)
      .delete()
      .in('id', ids);

    if (error) {
      console.error('productMenusService.deleteProductMenusBatch error:', error);
    }
    return { error };
  }
};

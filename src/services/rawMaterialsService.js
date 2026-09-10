import { supabase, isSupabaseConfigured } from '../lib/supabase';

const TABLE = 'raw_materials';

export const rawMaterialsService = {
  async getRawMaterials() {
    if (!isSupabaseConfigured()) return { data: [], error: null };
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('rawMaterialsService.getRawMaterials error:', error);
      return { data: [], error };
    }

    return {
      data: (data || []).map(row => ({
        id: row.id,
        name: row.name,
        unitName: row.unit_name,
        stock: Number(row.stock) || 0,
        currentStock: Number(row.stock) || 0,
        pricePerUnit: Number(row.price_per_unit) || 0,
        minStock: Number(row.min_stock) || 10,
        note: row.note || '',
        createdAt: row.created_at,
        updatedAt: row.updated_at
      })),
      error: null
    };
  },

  async createRawMaterial({ id, name, unitName, stock = 0, pricePerUnit = 0, minStock = 10, note = '' }) {
    if (!isSupabaseConfigured()) return { data: null, error: new Error('Supabase not configured') };
    const payload = {
      id,
      name,
      unit_name: unitName,
      stock: Number(stock) || 0,
      price_per_unit: Number(pricePerUnit) || 0,
      min_stock: Number(minStock) || 10,
      note,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from(TABLE)
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('rawMaterialsService.createRawMaterial error:', error);
      return { data: null, error };
    }

    return {
      data: {
        id: data.id,
        name: data.name,
        unitName: data.unit_name,
        stock: Number(data.stock) || 0,
        currentStock: Number(data.stock) || 0,
        pricePerUnit: Number(data.price_per_unit) || 0,
        minStock: Number(data.min_stock) || 10,
        note: data.note || '',
        createdAt: data.created_at,
        updatedAt: data.updated_at
      },
      error: null
    };
  },

  async updateRawMaterial(id, { name, unitName, pricePerUnit, minStock, note }) {
    if (!isSupabaseConfigured()) return { data: null, error: new Error('Supabase not configured') };
    const updatePayload = {
      updated_at: new Date().toISOString()
    };
    if (name !== undefined) updatePayload.name = name;
    if (unitName !== undefined) updatePayload.unit_name = unitName;
    if (pricePerUnit !== undefined) updatePayload.price_per_unit = Number(pricePerUnit) || 0;
    if (minStock !== undefined) updatePayload.min_stock = Number(minStock) || 10;
    if (note !== undefined) updatePayload.note = note;

    const { data, error } = await supabase
      .from(TABLE)
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('rawMaterialsService.updateRawMaterial error:', error);
      return { data: null, error };
    }

    return {
      data: {
        id: data.id,
        name: data.name,
        unitName: data.unit_name,
        stock: Number(data.stock) || 0,
        currentStock: Number(data.stock) || 0,
        pricePerUnit: Number(data.price_per_unit) || 0,
        minStock: Number(data.min_stock) || 10,
        note: data.note || '',
        createdAt: data.created_at,
        updatedAt: data.updated_at
      },
      error: null
    };
  },

  async updateStock(id, newStock) {
    if (!isSupabaseConfigured()) return { error: new Error('Supabase not configured') };
    const { data, error } = await supabase
      .from(TABLE)
      .update({
        stock: Number(newStock) || 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('rawMaterialsService.updateStock error:', error);
      return { data: null, error };
    }

    return {
      data: {
        id: data.id,
        name: data.name,
        unitName: data.unit_name,
        stock: Number(data.stock) || 0,
        currentStock: Number(data.stock) || 0,
        pricePerUnit: Number(data.price_per_unit) || 0,
        minStock: Number(data.min_stock) || 10,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      },
      error: null
    };
  },

  async updateStocksBatch(updates) {
    if (!isSupabaseConfigured()) return { error: new Error('Supabase not configured') };
    const promises = updates.map(u => 
      supabase
        .from(TABLE)
        .update({
          stock: Number(u.stock) || 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', u.id)
    );

    const results = await Promise.all(promises);
    const hasError = results.find(r => r.error);
    return { error: hasError ? hasError.error : null };
  },

  async deleteRawMaterial(id) {
    if (!isSupabaseConfigured()) return { error: new Error('Supabase not configured') };
    const { error } = await supabase
      .from(TABLE)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('rawMaterialsService.deleteRawMaterial error:', error);
    }
    return { error };
  },

  async deleteRawMaterialsBatch(ids) {
    if (!isSupabaseConfigured()) return { error: new Error('Supabase not configured') };
    const { error } = await supabase
      .from(TABLE)
      .delete()
      .in('id', ids);

    if (error) {
      console.error('rawMaterialsService.deleteRawMaterialsBatch error:', error);
    }
    return { error };
  }
};

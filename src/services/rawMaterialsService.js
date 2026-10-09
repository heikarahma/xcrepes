import { supabase, isSupabaseConfigured } from '../lib/supabase';

const TABLE = 'raw_materials';
const STOCK_TABLE = 'store_branch_stocks';

const DEFAULT_BRANCH_ID = 'BR-DEFAULT';

const mapMaterialRow = (row, stockOverride = null) => {
  const stockValue = stockOverride !== null && stockOverride !== undefined
    ? Number(stockOverride)
    : Number(row.stock);

  return {
    id: row.id,
    name: row.name,
    unitName: row.unit_name,
    stock: stockValue || 0,
    currentStock: stockValue || 0,
    pricePerUnit: Number(row.price_per_unit) || 0,
    minStock: Number(row.min_stock) || 10,
    note: row.note || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
};

export const rawMaterialsService = {
  async getRawMaterials(branchId = DEFAULT_BRANCH_ID) {
    if (!isSupabaseConfigured()) return { data: [], error: null };
    const { data: materials, error } = await supabase
      .from(TABLE)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('rawMaterialsService.getRawMaterials error:', error);
      return { data: [], error };
    }

    let stockMap = new Map();
    if (branchId) {
      const { data: stockRows, error: stockErr } = await supabase
        .from(STOCK_TABLE)
        .select('raw_material_id, stock')
        .eq('branch_id', branchId);

      if (!stockErr) {
        stockMap = new Map((stockRows || []).map(row => [row.raw_material_id, Number(row.stock) || 0]));
      } else if (stockErr.code !== 'PGRST204' && !String(stockErr.message || '').includes('store_branch_stocks')) {
        console.warn('rawMaterialsService.getRawMaterials branch stock error:', stockErr);
      }
    }

    return {
      data: (materials || []).map(row => mapMaterialRow(row, stockMap.has(row.id) ? stockMap.get(row.id) : (branchId === DEFAULT_BRANCH_ID ? row.stock : 0))),
      error: null
    };
  },

  async createRawMaterial({ id, name, unitName, stock = 0, pricePerUnit = 0, minStock = 10, note = '', branchId = DEFAULT_BRANCH_ID }) {
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

    if (branchId) {
      await this.updateStock(id, Number(stock) || 0, branchId);
    }

    return {
      data: mapMaterialRow(data, stock),
      error: null
    };
  },

  async updateRawMaterial(id, { name, unitName, stock, pricePerUnit, minStock, note, branchId = DEFAULT_BRANCH_ID }) {
    if (!isSupabaseConfigured()) return { data: null, error: new Error('Supabase not configured') };
    const updatePayload = {
      updated_at: new Date().toISOString()
    };
    if (name !== undefined) updatePayload.name = name;
    if (unitName !== undefined) updatePayload.unit_name = unitName;
    if (stock !== undefined) updatePayload.stock = Math.max(0, Number(stock) || 0);
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

    if (stock !== undefined && branchId) {
      await this.updateStock(id, stock, branchId);
    }

    return {
      data: mapMaterialRow(data, stock !== undefined ? stock : data.stock),
      error: null
    };
  },

  async updateStock(id, newStock, branchId = DEFAULT_BRANCH_ID) {
    if (!isSupabaseConfigured()) return { error: new Error('Supabase not configured') };

    if (branchId) {
      const stockPayload = {
        branch_id: branchId,
        raw_material_id: id,
        stock: Number(newStock) || 0,
        updated_at: new Date().toISOString()
      };

      const { error: stockErr } = await supabase
        .from(STOCK_TABLE)
        .upsert(stockPayload, { onConflict: 'branch_id,raw_material_id' });

      if (!stockErr) {
        return { data: { id, stock: Number(newStock) || 0, currentStock: Number(newStock) || 0 }, error: null };
      }

      if (stockErr.code !== 'PGRST204' && !String(stockErr.message || '').includes('store_branch_stocks')) {
        console.error('rawMaterialsService.updateBranchStock error:', stockErr);
        return { data: null, error: stockErr };
      }
    }

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
      data: mapMaterialRow(data),
      error: null
    };
  },

  async updateStocksBatch(updates, branchId = DEFAULT_BRANCH_ID) {
    if (!isSupabaseConfigured()) return { error: new Error('Supabase not configured') };
    if (branchId) {
      const payloads = updates.map(u => ({
        branch_id: branchId,
        raw_material_id: u.id,
        stock: Number(u.stock) || 0,
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from(STOCK_TABLE)
        .upsert(payloads, { onConflict: 'branch_id,raw_material_id' });

      if (!error) return { error: null };
      if (error.code !== 'PGRST204' && !String(error.message || '').includes('store_branch_stocks')) {
        return { error };
      }
    }

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

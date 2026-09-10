import { supabase, isSupabaseConfigured } from '../lib/supabase';

const TABLE = 'inventory_stock_logs';

export const stockLogsService = {
  async getStockLogs() {
    if (!isSupabaseConfigured()) return { data: [], error: null };
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('stockLogsService.getStockLogs error:', error);
      return { data: [], error };
    }

    return {
      data: (data || []).map(row => ({
        id: row.id,
        rawMaterialId: row.raw_material_id,
        rawMaterialName: row.raw_material_name,
        unitName: row.unit_name,
        type: row.type,
        amount: Number(row.amount) || 0,
        previousStock: Number(row.previous_stock) || 0,
        currentStock: Number(row.current_stock) || 0,
        reason: row.reason || '',
        note: row.note || '',
        photo: row.photo || null,
        referenceInvoice: row.reference_invoice || null,
        orderId: row.order_id || null,
        customerName: row.customer_name || null,
        sourceMenu: row.source_menu || null,
        sourceType: row.source_type || null,
        toppingName: row.topping_name || null,
        user: row.user_name || 'Admin',
        createdAt: row.created_at
      })),
      error: null
    };
  },

  async createStockLog(log) {
    if (!isSupabaseConfigured()) return { data: null, error: new Error('Supabase not configured') };
    const payload = {
      id: log.id,
      raw_material_id: log.rawMaterialId,
      raw_material_name: log.rawMaterialName,
      unit_name: log.unitName,
      type: log.type,
      amount: Number(log.amount) || 0,
      previous_stock: Number(log.previousStock) || 0,
      current_stock: Number(log.currentStock) || 0,
      reason: log.reason || null,
      note: log.note || null,
      photo: log.photo || null,
      reference_invoice: log.referenceInvoice || null,
      order_id: log.orderId || null,
      customer_name: log.customerName || null,
      source_menu: log.sourceMenu || null,
      source_type: log.sourceType || null,
      topping_name: log.toppingName || null,
      user_name: log.user || 'Admin',
      created_at: log.createdAt || new Date().toISOString()
    };

    const { data, error } = await supabase
      .from(TABLE)
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('stockLogsService.createStockLog error:', error);
      return { data: null, error };
    }

    return { data, error: null };
  },

  async createStockLogsBatch(logs) {
    if (!isSupabaseConfigured()) return { data: null, error: new Error('Supabase not configured') };
    if (!Array.isArray(logs) || logs.length === 0) return { data: [], error: null };

    const payloads = logs.map(log => ({
      id: log.id,
      raw_material_id: log.rawMaterialId,
      raw_material_name: log.rawMaterialName,
      unit_name: log.unitName,
      type: log.type,
      amount: Number(log.amount) || 0,
      previous_stock: Number(log.previousStock) || 0,
      current_stock: Number(log.currentStock) || 0,
      reason: log.reason || null,
      note: log.note || null,
      photo: log.photo || null,
      reference_invoice: log.referenceInvoice || null,
      order_id: log.orderId || null,
      customer_name: log.customerName || null,
      source_menu: log.sourceMenu || null,
      source_type: log.sourceType || null,
      topping_name: log.toppingName || null,
      user_name: log.user || 'Admin',
      created_at: log.createdAt || new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from(TABLE)
      .insert(payloads);

    if (error) {
      console.error('stockLogsService.createStockLogsBatch error:', error);
      return { data: null, error };
    }

    return { data, error: null };
  }
};

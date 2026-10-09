import { supabase, isSupabaseConfigured } from '../lib/supabase';

const TABLE = 'inventory_stock_logs';
const DEFAULT_BRANCH_ID = 'BR-DEFAULT';
const PAGE_SIZE = 1000;
const STOCK_LOG_COLUMNS = [
  'id',
  'raw_material_id',
  'raw_material_name',
  'unit_name',
  'type',
  'amount',
  'previous_stock',
  'current_stock',
  'reason',
  'note',
  'photo',
  'reference_invoice',
  'order_id',
  'customer_name',
  'source_menu',
  'source_type',
  'topping_name',
  'user_name',
  'branch_id',
  'created_at'
].join(',');

const mapStockLogRow = (row) => ({
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
  branchId: row.branch_id || DEFAULT_BRANCH_ID,
  createdAt: row.created_at
});

const fetchStockLogsPaged = async (branchId, includeBranchFilter = true) => {
  const rows = [];
  let from = 0;

  while (true) {
    let query = supabase
      .from(TABLE)
      .select(STOCK_LOG_COLUMNS)
      .neq('type', 'OPNAME_REPORT')
      .order('created_at', { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    if (includeBranchFilter && branchId) {
      query = query.eq('branch_id', branchId);
    }

    const { data, error } = await query;
    if (error) return { data: rows, error };

    const page = data || [];
    rows.push(...page);
    if (page.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return { data: rows, error: null };
};

export const stockLogsService = {
  async getStockLogs(branchId = DEFAULT_BRANCH_ID) {
    if (!isSupabaseConfigured()) return { data: [], error: null };
    let { data, error } = await fetchStockLogsPaged(branchId, true);

    if (error && (error.code === 'PGRST204' || String(error.message || '').includes('branch_id'))) {
      const retry = await fetchStockLogsPaged(branchId, false);
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      console.error('stockLogsService.getStockLogs error:', error);
      return { data: [], error };
    }

    return {
      data: (data || []).map(mapStockLogRow),
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
      branch_id: log.branchId || DEFAULT_BRANCH_ID,
      created_at: log.createdAt || new Date().toISOString()
    };

    let { data, error } = await supabase
      .from(TABLE)
      .insert([payload])
      .select()
      .single();

    if (error && (error.code === 'PGRST204' || String(error.message || '').includes('branch_id'))) {
      const { branch_id, ...fallbackPayload } = payload;
      const retry = await supabase
        .from(TABLE)
        .insert([fallbackPayload])
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }

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
      branch_id: log.branchId || DEFAULT_BRANCH_ID,
      created_at: log.createdAt || new Date().toISOString()
    }));

    let { data, error } = await supabase
      .from(TABLE)
      .insert(payloads);

    if (error && (error.code === 'PGRST204' || String(error.message || '').includes('branch_id'))) {
      const retry = await supabase
        .from(TABLE)
        .insert(payloads.map(({ branch_id, ...payload }) => payload));
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      console.error('stockLogsService.createStockLogsBatch error:', error);
      return { data: null, error };
    }

    return { data, error: null };
  }
};

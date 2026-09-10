import { supabase, isSupabaseConfigured } from '../lib/supabase';

const TABLE = 'orders';

export const ordersService = {
  async getOrders() {
    if (!isSupabaseConfigured()) return { data: [], error: null };
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('ordersService.getOrders error:', error);
      return { data: [], error };
    }

    return {
      data: (data || []).map(row => ({
        id: row.id,
        invoiceNumber: row.invoice_number,
        date: row.date,
        status: row.status || 'completed',
        cashierName: row.cashier_name || 'Kasir',
        customerName: row.customer_name || 'Pelanggan Umum',
        tableNumber: row.table_number || '',
        items: Array.isArray(row.items) ? row.items : [],
        subtotal: Number(row.subtotal) || 0,
        itemsDiscountTotal: Number(row.items_discount_total) || 0,
        orderDiscountType: row.order_discount_type || 'none',
        orderDiscountValue: Number(row.order_discount_value) || 0,
        orderDiscountAmount: Number(row.order_discount_amount) || 0,
        discount: Number(row.discount) || 0,
        totalAmount: Number(row.total_amount) || 0,
        totalItemsCount: Number(row.total_items_count) || 0,
        paymentMethod: row.payment_method || 'cash',
        cashReceived: Number(row.cash_received) || 0,
        changeAmount: Number(row.change_amount) || 0,
        returnReason: row.return_reason || null,
        returnNote: row.return_note || null,
        returnPhoto: row.return_photo || null,
        returnBy: row.return_by || null,
        returnedAt: row.returned_at || null,
        createdAt: row.created_at
      })),
      error: null
    };
  },

  async createOrder(order) {
    if (!isSupabaseConfigured()) return { data: null, error: new Error('Supabase not configured') };
    const payload = {
      id: order.id,
      invoice_number: order.invoiceNumber,
      date: order.date || new Date().toISOString(),
      status: order.status || 'completed',
      cashier_name: order.cashierName || 'Kasir',
      customer_name: order.customerName || 'Pelanggan Umum',
      table_number: order.tableNumber || '',
      items: Array.isArray(order.items) ? order.items : [],
      subtotal: Number(order.subtotal) || 0,
      items_discount_total: Number(order.itemsDiscountTotal) || 0,
      order_discount_type: order.orderDiscountType || 'none',
      order_discount_value: Number(order.orderDiscountValue) || 0,
      order_discount_amount: Number(order.orderDiscountAmount) || 0,
      discount: Number(order.discount) || 0,
      total_amount: Number(order.totalAmount) || 0,
      total_items_count: Number(order.totalItemsCount) || 0,
      payment_method: order.paymentMethod || 'cash',
      cash_received: Number(order.cashReceived) || 0,
      change_amount: Number(order.changeAmount) || 0,
      return_reason: order.returnReason || null,
      return_note: order.returnNote || null,
      return_photo: order.returnPhoto || null,
      return_by: order.returnBy || null,
      returned_at: order.returnedAt || null,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from(TABLE)
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('ordersService.createOrder error:', error);
      return { data: null, error };
    }

    return {
      data: {
        id: data.id,
        invoiceNumber: data.invoice_number,
        date: data.date,
        status: data.status,
        cashierName: data.cashier_name,
        customerName: data.customer_name,
        tableNumber: data.table_number,
        items: data.items,
        subtotal: Number(data.subtotal) || 0,
        itemsDiscountTotal: Number(data.items_discount_total) || 0,
        orderDiscountType: data.order_discount_type,
        orderDiscountValue: Number(data.order_discount_value) || 0,
        orderDiscountAmount: Number(data.order_discount_amount) || 0,
        discount: Number(data.discount) || 0,
        totalAmount: Number(data.total_amount) || 0,
        totalItemsCount: Number(data.total_items_count) || 0,
        paymentMethod: data.payment_method,
        cashReceived: Number(data.cash_received) || 0,
        changeAmount: Number(data.change_amount) || 0,
        createdAt: data.created_at
      },
      error: null
    };
  },

  async updateOrderReturn(id, { reason, note, photo, user }) {
    if (!isSupabaseConfigured()) return { data: null, error: new Error('Supabase not configured') };
    const { data, error } = await supabase
      .from(TABLE)
      .update({
        status: 'returned',
        return_reason: reason,
        return_note: note || '',
        return_photo: photo || null,
        return_by: user || 'Kasir',
        returned_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('ordersService.updateOrderReturn error:', error);
      return { data: null, error };
    }

    return { data, error: null };
  }
};

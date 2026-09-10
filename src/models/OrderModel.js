/**
 * Order Model (Model Transaksi Kasir POS)
 * Mengelola struktur data keranjang pesanan, histori transaksi, dan status transaksi
 */

export const CART_STORAGE_KEY = 'pos_cart';
export const ORDERS_STORAGE_KEY = 'pos_orders';

export const INITIAL_CART = [];

export const PAYMENT_METHODS = {
  CASH: 'cash',
  QRIS: 'qris',
  CARD: 'card'
};

export const ORDER_STATUS = {
  COMPLETED: 'completed',
  RETURNED: 'returned'
};

export const INITIAL_ORDERS = [];




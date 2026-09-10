/**
 * Data Collections & Reset Utilities
 * Mode: Bersih Tanpa Data Dummy
 */

import {
  DUMMY_UNITS,
  DUMMY_CATEGORIES,
  DUMMY_RAW_MATERIALS,
  DUMMY_TOPPINGS,
  DUMMY_PRODUCT_MENUS,
  DUMMY_CASHIERS,
  DUMMY_ORDERS,
  DUMMY_STOCK_LOGS,
  DUMMY_SETTINGS
} from './dummyData';

export const REAL_UNITS = DUMMY_UNITS;
export const REAL_CATEGORIES = DUMMY_CATEGORIES;
export const REAL_RAW_MATERIALS = DUMMY_RAW_MATERIALS;
export const REAL_TOPPINGS = DUMMY_TOPPINGS;
export const REAL_PRODUCT_MENUS = DUMMY_PRODUCT_MENUS;
export const REAL_CASHIERS = DUMMY_CASHIERS;
export const REAL_ORDERS = DUMMY_ORDERS;
export const REAL_STOCK_LOGS = DUMMY_STOCK_LOGS;
export const REAL_SETTINGS = DUMMY_SETTINGS;

export const injectRealDataToStorage = () => {
  try {
    localStorage.setItem('master_units', '[]');
    localStorage.setItem('master_categories', '[]');
    localStorage.setItem('master_raw_materials', '[]');
    localStorage.setItem('master_toppings', '[]');
    localStorage.setItem('master_product_menus', '[]');
    localStorage.setItem('pos_cashier_accounts', '[]');
    localStorage.setItem('pos_orders', '[]');
    localStorage.setItem('inventory_stock_logs', '[]');
    localStorage.setItem('xcrepes_pos_settings', JSON.stringify(REAL_SETTINGS));
    localStorage.setItem('pos_cart', '[]');
    return { success: true, message: 'Database telah diatur ke kondisi awal bersih!' };
  } catch (e) {
    console.error('Gagal menginjeksi data:', e);
    return { success: false, message: e.message };
  }
};

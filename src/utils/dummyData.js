/**
 * Data Constants & Initial Collections untuk Aplikasi XCrepes POS
 * Mode: Bersih Tanpa Data Dummy (Clean Slate)
 */

export const DUMMY_UNITS = [];

export const DUMMY_CATEGORIES = [];

export const DUMMY_RAW_MATERIALS = [];

export const DUMMY_TOPPINGS = [];

export const DUMMY_PRODUCT_MENUS = [];

export const DUMMY_CASHIERS = [];

export const DUMMY_SETTINGS = {
  appName: 'XCrepes POS',
  storeName: 'XCrepes',
  storeTagline: 'Good Food Good Mood',
  logo: '',
  phone: '',
  address: '',
  email: '',
  receiptTitle: 'XCrepes',
  receiptSubtitle: '',
  receiptPhone: '',
  receiptFooter1: 'Terima Kasih Atas Kunjungan Anda',
  receiptFooter2: '',
  paperSize: '58mm',
  showLogoOnReceipt: false,
  showCashierName: true,
  showCustomerName: true,
  showTableNumber: true,
  showNotes: true
};

export const DUMMY_ORDERS = [];

export const DUMMY_STOCK_LOGS = [];

/**
 * Injeksi data awal (kosong) ke localStorage secara langsung
 */
export const injectDummyDataToStorage = () => {
  try {
    localStorage.setItem('master_units', '[]');
    localStorage.setItem('master_categories', '[]');
    localStorage.setItem('master_raw_materials', '[]');
    localStorage.setItem('master_toppings', '[]');
    localStorage.setItem('master_product_menus', '[]');
    localStorage.setItem('pos_cashier_accounts', '[]');
    localStorage.setItem('pos_orders', '[]');
    localStorage.setItem('inventory_stock_logs', '[]');
    localStorage.setItem('xcrepes_pos_settings', JSON.stringify(DUMMY_SETTINGS));
    localStorage.setItem('pos_cart', '[]');
    return { success: true, message: 'Database telah disiapkan.' };
  } catch (e) {
    console.error('Gagal menyiapkan data:', e);
    return { success: false, message: e.message };
  }
};

/**
 * Mengosongkan seluruh data dari localStorage (Reset ke Database Bersih)
 */
export const clearAllDataFromStorage = () => {
  try {
    localStorage.setItem('master_units', '[]');
    localStorage.setItem('master_categories', '[]');
    localStorage.setItem('master_raw_materials', '[]');
    localStorage.setItem('master_toppings', '[]');
    localStorage.setItem('master_product_menus', '[]');
    localStorage.setItem('pos_cashier_accounts', '[]');
    localStorage.setItem('pos_orders', '[]');
    localStorage.setItem('inventory_stock_logs', '[]');
    localStorage.setItem('pos_cart', '[]');
    localStorage.removeItem('pos_dbotanica_menu_seeded_v1');
    localStorage.removeItem('pos_dbotanica_menu_seeded_v2');
    localStorage.removeItem('pos_dbotanica_menu_seeded_v3');
    return { success: true, message: 'Seluruh data master, pesanan, dan inventori telah dikosongkan.' };
  } catch (e) {
    console.error('Gagal mengosongkan data:', e);
    return { success: false, message: e.message };
  }
};

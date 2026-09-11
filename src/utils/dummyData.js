/**
 * Data Constants & Initial Collections untuk Aplikasi XCrepes POS
 * Mode: Real Data XCrepes D'Botanica
 */

export const DUMMY_UNITS = [
  { id: 'UOM-001', name: 'gram' },
  { id: 'UOM-002', name: 'kg' },
  { id: 'UOM-003', name: 'ml' },
  { id: 'UOM-004', name: 'liter' },
  { id: 'UOM-005', name: 'pcs' },
  { id: 'UOM-006', name: 'lembar' },
  { id: 'UOM-007', name: 'porsi' },
  { id: 'UOM-008', name: 'sachet' }
];

export const DUMMY_CATEGORIES = [
  { id: 'CAT-001', name: 'Crepes Asin', description: 'Aneka crêpes gurih dengan isian daging dan sayur lezat' },
  { id: 'CAT-002', name: 'Crepes Manis', description: 'Crêpes manis lembut dengan pasta cokelat dan buah segar' },
  { id: 'CAT-003', name: 'Crispy Crepes', description: 'Crêpes tipis garing renyah khas dengan aroma butter' },
  { id: 'CAT-004', name: 'Beverages & Drinks', description: 'Minuman dingin segar dan minuman hangat pendamping' },
  { id: 'CAT-005', name: 'Paket Hemat Combo', description: 'Paket hemat crêpes favorit lengkap dengan minuman' }
];

export const DUMMY_RAW_MATERIALS = [
  { id: 'RAW-001', name: 'Tepung Premix Crepes', unit_name: 'gram', stock: 25000, price_per_unit: 20, min_stock: 5000, note: 'Premix adonan crêpes standar' },
  { id: 'RAW-002', name: 'Susu Segar UHT Full Cream', unit_name: 'ml', stock: 12000, price_per_unit: 20, min_stock: 2000, note: 'Campuran adonan basah' },
  { id: 'RAW-003', name: 'Telur Ayam Segar', unit_name: 'pcs', stock: 150, price_per_unit: 2000, min_stock: 30, note: 'Telur ayam negeri grade A' },
  { id: 'RAW-004', name: 'Margarin Olesan Wajan', unit_name: 'gram', stock: 6000, price_per_unit: 45, min_stock: 1000, note: 'Untuk olesan loyang wajan' },
  { id: 'RAW-005', name: 'Cokelat Nutella Original', unit_name: 'gram', stock: 4500, price_per_unit: 140, min_stock: 1000, note: 'Pasta cokelat hazelnut' },
  { id: 'RAW-006', name: 'Keju Cheddar Olahan', unit_name: 'gram', stock: 5000, price_per_unit: 85, min_stock: 1000, note: 'Blok keju untuk diparut' },
  { id: 'RAW-007', name: 'Pisang Raja Matang', unit_name: 'pcs', stock: 60, price_per_unit: 1500, min_stock: 15, note: 'Pisang manis legit segar' },
  { id: 'RAW-008', name: 'Susu Kental Manis Cokelat', unit_name: 'ml', stock: 5000, price_per_unit: 30, min_stock: 1000, note: 'SKM cokelat kental' },
  { id: 'RAW-009', name: 'Oreo Biscuit Crumb', unit_name: 'gram', stock: 3500, price_per_unit: 70, min_stock: 800, note: 'Remahan renyah biskuit oreo' },
  { id: 'RAW-010', name: 'Bubuk Matcha Green Tea', unit_name: 'gram', stock: 2000, price_per_unit: 130, min_stock: 500, note: 'Pure matcha powder premium' },
  { id: 'RAW-011', name: 'Smoked Beef Slice', unit_name: 'lembar', stock: 180, price_per_unit: 2500, min_stock: 30, note: 'Daging sapi asap premium' },
  { id: 'RAW-012', name: 'Sosis Sapi Frankfurter', unit_name: 'pcs', stock: 120, price_per_unit: 3000, min_stock: 25, note: 'Sosis sapi gurih' },
  { id: 'RAW-013', name: 'Saus Mayonaise Creamy', unit_name: 'gram', stock: 4000, price_per_unit: 40, min_stock: 800, note: 'Mayonaise krim gurih' },
  { id: 'RAW-014', name: 'Saus Sambal Pedas', unit_name: 'ml', stock: 5000, price_per_unit: 25, min_stock: 1000, note: 'Saus cabai pedas' },
  { id: 'RAW-015', name: 'Saus Tomat Segar', unit_name: 'ml', stock: 4000, price_per_unit: 25, min_stock: 800, note: 'Saus tomat' },
  { id: 'RAW-016', name: 'Kertas Pembungkus Cone Crepes', unit_name: 'lembar', stock: 600, price_per_unit: 500, min_stock: 100, note: 'Packaging cone resmi XCrepes' },
  { id: 'RAW-017', name: 'Cup Dingin 16oz + Sedotan', unit_name: 'pcs', stock: 300, price_per_unit: 750, min_stock: 50, note: 'Cup takeaway 16oz' }
];

export const DUMMY_TOPPINGS = [
  {
    id: 'TOP-001',
    name: 'Keju Cheddar Parut Ekstra',
    price: 4000,
    description: 'Tambahan parutan keju cheddar melimpah',
    ingredients: [{ materialId: 'RAW-006', materialName: 'Keju Cheddar Olahan', amount: 25, unitName: 'gram' }]
  },
  {
    id: 'TOP-002',
    name: 'Nutella Spread Ekstra',
    price: 6000,
    description: 'Olesan selai hazelnut Nutella premium',
    ingredients: [{ materialId: 'RAW-005', materialName: 'Cokelat Nutella Original', amount: 20, unitName: 'gram' }]
  },
  {
    id: 'TOP-003',
    name: 'Oreo Crunchy Crumb',
    price: 3500,
    description: 'Taburan remahan biskuit Oreo renyah',
    ingredients: [{ materialId: 'RAW-009', materialName: 'Oreo Biscuit Crumb', amount: 20, unitName: 'gram' }]
  },
  {
    id: 'TOP-004',
    name: 'Irisan Pisang Segar',
    price: 3000,
    description: 'Irisan buah pisang manis legit',
    ingredients: [{ materialId: 'RAW-007', materialName: 'Pisang Raja Matang', amount: 1, unitName: 'pcs' }]
  },
  {
    id: 'TOP-005',
    name: 'Smoked Beef Slice Ekstra',
    price: 5000,
    description: '1 lembar daging sapi asap lezat',
    ingredients: [{ materialId: 'RAW-011', materialName: 'Smoked Beef Slice', amount: 1, unitName: 'lembar' }]
  },
  {
    id: 'TOP-006',
    name: 'Sosis Sapi Frankfurter Ekstra',
    price: 4500,
    description: 'Potongan sosis sapi lezat gurih',
    ingredients: [{ materialId: 'RAW-012', materialName: 'Sosis Sapi Frankfurter', amount: 1, unitName: 'pcs' }]
  }
];

export const DUMMY_PRODUCT_MENUS = [
  {
    id: 'PRD-001',
    name: 'Choco Banana Crepes',
    category_id: 'CAT-002',
    category_name: 'Crepes Manis',
    image: 'https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=600&q=80',
    price: 18000,
    promo_type: null,
    promo_amount: 0,
    ingredients: [
      { materialId: 'RAW-001', materialName: 'Tepung Premix Crepes', amount: 60, unitName: 'gram' },
      { materialId: 'RAW-002', materialName: 'Susu Segar UHT Full Cream', amount: 40, unitName: 'ml' },
      { materialId: 'RAW-004', materialName: 'Margarin Olesan Wajan', amount: 10, unitName: 'gram' },
      { materialId: 'RAW-007', materialName: 'Pisang Raja Matang', amount: 1, unitName: 'pcs' },
      { materialId: 'RAW-008', materialName: 'Susu Kental Manis Cokelat', amount: 25, unitName: 'ml' },
      { materialId: 'RAW-016', materialName: 'Kertas Pembungkus Cone Crepes', amount: 1, unitName: 'lembar' }
    ]
  },
  {
    id: 'PRD-002',
    name: 'Nutella Cheese Special',
    category_id: 'CAT-002',
    category_name: 'Crepes Manis',
    image: 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=600&q=80',
    price: 24000,
    promo_type: null,
    promo_amount: 0,
    ingredients: [
      { materialId: 'RAW-001', materialName: 'Tepung Premix Crepes', amount: 60, unitName: 'gram' },
      { materialId: 'RAW-002', materialName: 'Susu Segar UHT Full Cream', amount: 40, unitName: 'ml' },
      { materialId: 'RAW-004', materialName: 'Margarin Olesan Wajan', amount: 10, unitName: 'gram' },
      { materialId: 'RAW-005', materialName: 'Cokelat Nutella Original', amount: 30, unitName: 'gram' },
      { materialId: 'RAW-006', materialName: 'Keju Cheddar Olahan', amount: 25, unitName: 'gram' },
      { materialId: 'RAW-016', materialName: 'Kertas Pembungkus Cone Crepes', amount: 1, unitName: 'lembar' }
    ]
  },
  {
    id: 'PRD-003',
    name: 'Double Cheese Melt Crepes',
    category_id: 'CAT-002',
    category_name: 'Crepes Manis',
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80',
    price: 19000,
    promo_type: null,
    promo_amount: 0,
    ingredients: [
      { materialId: 'RAW-001', materialName: 'Tepung Premix Crepes', amount: 60, unitName: 'gram' },
      { materialId: 'RAW-002', materialName: 'Susu Segar UHT Full Cream', amount: 40, unitName: 'ml' },
      { materialId: 'RAW-004', materialName: 'Margarin Olesan Wajan', amount: 10, unitName: 'gram' },
      { materialId: 'RAW-006', materialName: 'Keju Cheddar Olahan', amount: 40, unitName: 'gram' },
      { materialId: 'RAW-008', materialName: 'Susu Kental Manis Cokelat', amount: 20, unitName: 'ml' },
      { materialId: 'RAW-016', materialName: 'Kertas Pembungkus Cone Crepes', amount: 1, unitName: 'lembar' }
    ]
  },
  {
    id: 'PRD-004',
    name: 'Matcha Oreo Bliss Crepes',
    category_id: 'CAT-002',
    category_name: 'Crepes Manis',
    image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=600&q=80',
    price: 22000,
    promo_type: null,
    promo_amount: 0,
    ingredients: [
      { materialId: 'RAW-001', materialName: 'Tepung Premix Crepes', amount: 60, unitName: 'gram' },
      { materialId: 'RAW-002', materialName: 'Susu Segar UHT Full Cream', amount: 40, unitName: 'ml' },
      { materialId: 'RAW-004', materialName: 'Margarin Olesan Wajan', amount: 10, unitName: 'gram' },
      { materialId: 'RAW-010', materialName: 'Bubuk Matcha Green Tea', amount: 15, unitName: 'gram' },
      { materialId: 'RAW-009', materialName: 'Oreo Biscuit Crumb', amount: 25, unitName: 'gram' },
      { materialId: 'RAW-008', materialName: 'Susu Kental Manis Cokelat', amount: 20, unitName: 'ml' },
      { materialId: 'RAW-016', materialName: 'Kertas Pembungkus Cone Crepes', amount: 1, unitName: 'lembar' }
    ]
  },
  {
    id: 'PRD-005',
    name: 'Smoked Beef & Cheese Crepes',
    category_id: 'CAT-001',
    category_name: 'Crepes Asin',
    image: 'https://images.unsplash.com/photo-1621996346565-e3d5d628169e?auto=format&fit=crop&w=600&q=80',
    price: 25000,
    promo_type: null,
    promo_amount: 0,
    ingredients: [
      { materialId: 'RAW-001', materialName: 'Tepung Premix Crepes', amount: 60, unitName: 'gram' },
      { materialId: 'RAW-002', materialName: 'Susu Segar UHT Full Cream', amount: 40, unitName: 'ml' },
      { materialId: 'RAW-004', materialName: 'Margarin Olesan Wajan', amount: 10, unitName: 'gram' },
      { materialId: 'RAW-011', materialName: 'Smoked Beef Slice', amount: 2, unitName: 'lembar' },
      { materialId: 'RAW-006', materialName: 'Keju Cheddar Olahan', amount: 25, unitName: 'gram' },
      { materialId: 'RAW-013', materialName: 'Saus Mayonaise Creamy', amount: 20, unitName: 'gram' },
      { materialId: 'RAW-014', materialName: 'Saus Sambal Pedas', amount: 15, unitName: 'ml' },
      { materialId: 'RAW-016', materialName: 'Kertas Pembungkus Cone Crepes', amount: 1, unitName: 'lembar' }
    ]
  },
  {
    id: 'PRD-006',
    name: 'Sausage & Egg Deluxe Crepes',
    category_id: 'CAT-001',
    category_name: 'Crepes Asin',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80',
    price: 24000,
    promo_type: null,
    promo_amount: 0,
    ingredients: [
      { materialId: 'RAW-001', materialName: 'Tepung Premix Crepes', amount: 60, unitName: 'gram' },
      { materialId: 'RAW-002', materialName: 'Susu Segar UHT Full Cream', amount: 40, unitName: 'ml' },
      { materialId: 'RAW-004', materialName: 'Margarin Olesan Wajan', amount: 10, unitName: 'gram' },
      { materialId: 'RAW-003', materialName: 'Telur Ayam Segar', amount: 1, unitName: 'pcs' },
      { materialId: 'RAW-012', materialName: 'Sosis Sapi Frankfurter', amount: 1, unitName: 'pcs' },
      { materialId: 'RAW-013', materialName: 'Saus Mayonaise Creamy', amount: 20, unitName: 'gram' },
      { materialId: 'RAW-015', materialName: 'Saus Tomat Segar', amount: 15, unitName: 'ml' },
      { materialId: 'RAW-016', materialName: 'Kertas Pembungkus Cone Crepes', amount: 1, unitName: 'lembar' }
    ]
  },
  {
    id: 'PRD-007',
    name: 'Crispy Choco Crunchy',
    category_id: 'CAT-003',
    category_name: 'Crispy Crepes',
    image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=600&q=80',
    price: 15000,
    promo_type: null,
    promo_amount: 0,
    ingredients: [
      { materialId: 'RAW-001', materialName: 'Tepung Premix Crepes', amount: 50, unitName: 'gram' },
      { materialId: 'RAW-002', materialName: 'Susu Segar UHT Full Cream', amount: 30, unitName: 'ml' },
      { materialId: 'RAW-004', materialName: 'Margarin Olesan Wajan', amount: 10, unitName: 'gram' },
      { materialId: 'RAW-008', materialName: 'Susu Kental Manis Cokelat', amount: 30, unitName: 'ml' },
      { materialId: 'RAW-009', materialName: 'Oreo Biscuit Crumb', amount: 20, unitName: 'gram' },
      { materialId: 'RAW-016', materialName: 'Kertas Pembungkus Cone Crepes', amount: 1, unitName: 'lembar' }
    ]
  },
  {
    id: 'PRD-008',
    name: 'Crispy Cheese Classic',
    category_id: 'CAT-003',
    category_name: 'Crispy Crepes',
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80',
    price: 16000,
    promo_type: null,
    promo_amount: 0,
    ingredients: [
      { materialId: 'RAW-001', materialName: 'Tepung Premix Crepes', amount: 50, unitName: 'gram' },
      { materialId: 'RAW-002', materialName: 'Susu Segar UHT Full Cream', amount: 30, unitName: 'ml' },
      { materialId: 'RAW-004', materialName: 'Margarin Olesan Wajan', amount: 10, unitName: 'gram' },
      { materialId: 'RAW-006', materialName: 'Keju Cheddar Olahan', amount: 30, unitName: 'gram' },
      { materialId: 'RAW-008', materialName: 'Susu Kental Manis Cokelat', amount: 20, unitName: 'ml' },
      { materialId: 'RAW-016', materialName: 'Kertas Pembungkus Cone Crepes', amount: 1, unitName: 'lembar' }
    ]
  },
  {
    id: 'PRD-009',
    name: 'Iced Lemon Tea Segar',
    category_id: 'CAT-004',
    category_name: 'Beverages & Drinks',
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80',
    price: 10000,
    promo_type: null,
    promo_amount: 0,
    ingredients: [
      { materialId: 'RAW-017', materialName: 'Cup Dingin 16oz + Sedotan', amount: 1, unitName: 'pcs' }
    ]
  },
  {
    id: 'PRD-010',
    name: 'Signature Iced Chocolate',
    category_id: 'CAT-004',
    category_name: 'Beverages & Drinks',
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80',
    price: 15000,
    promo_type: null,
    promo_amount: 0,
    ingredients: [
      { materialId: 'RAW-002', materialName: 'Susu Segar UHT Full Cream', amount: 150, unitName: 'ml' },
      { materialId: 'RAW-008', materialName: 'Susu Kental Manis Cokelat', amount: 40, unitName: 'ml' },
      { materialId: 'RAW-017', materialName: 'Cup Dingin 16oz + Sedotan', amount: 1, unitName: 'pcs' }
    ]
  },
  {
    id: 'PRD-011',
    name: 'Paket Combo Manis + Lemon Tea',
    category_id: 'CAT-005',
    category_name: 'Paket Hemat Combo',
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80',
    price: 25000,
    promo_type: 'percent',
    promo_amount: 10,
    ingredients: [
      { materialId: 'RAW-001', materialName: 'Tepung Premix Crepes', amount: 60, unitName: 'gram' },
      { materialId: 'RAW-007', materialName: 'Pisang Raja Matang', amount: 1, unitName: 'pcs' },
      { materialId: 'RAW-008', materialName: 'Susu Kental Manis Cokelat', amount: 25, unitName: 'ml' },
      { materialId: 'RAW-016', materialName: 'Kertas Pembungkus Cone Crepes', amount: 1, unitName: 'lembar' },
      { materialId: 'RAW-017', materialName: 'Cup Dingin 16oz + Sedotan', amount: 1, unitName: 'pcs' }
    ]
  }
];

export const DUMMY_CASHIERS = [
  {
    id: 'KASIR-001',
    nama: 'Siti Rahmawati',
    username: 'kasir1',
    password: 'kasir123',
    role: 'kasir',
    permissions: ['kasir', 'raw-material', 'returns', 'reports-sales'],
    isActive: true
  },
  {
    id: 'KASIR-002',
    nama: 'Budi Pratama',
    username: 'kasir2',
    password: 'kasir123',
    role: 'kasir',
    permissions: ['kasir', 'returns', 'reports-sales'],
    isActive: true
  }
];

export const DUMMY_SETTINGS = {
  appName: 'XCrepes POS',
  storeName: "XCrepes D'Botanica",
  storeTagline: 'Crispy & Tasty Crepes in Town',
  logo: '',
  phone: '0812-3456-7890',
  address: "D'Botanica Mall Bandung, Lt. LG Food Court No. 12",
  email: 'contact@xcrepes.id',
  receiptTitle: "XCrepes D'Botanica",
  receiptSubtitle: "Cabang D'Botanica Mall Bandung",
  receiptPhone: '0812-3456-7890',
  receiptFooter1: 'Terima Kasih Atas Kunjungan Anda!',
  receiptFooter2: 'Follow Instagram @xcrepes.id',
  paperSize: '58mm',
  showLogoOnReceipt: false,
  showCashierName: true,
  showCustomerName: true,
  showTableNumber: true,
  showNotes: true
};

export const DUMMY_ORDERS = [
  {
    id: 'ORD-20260911-001',
    invoiceNumber: 'INV/20260911/001',
    date: new Date().toISOString(),
    status: 'completed',
    cashierName: 'Siti Rahmawati',
    customerName: 'Rian Wijaya',
    tableNumber: 'Meja 04',
    items: [
      {
        id: 'PRD-001',
        name: 'Choco Banana Crepes',
        price: 18000,
        quantity: 2,
        subtotal: 36000,
        selectedToppings: [
          { id: 'TOP-001', name: 'Keju Cheddar Parut Ekstra', price: 4000 }
        ]
      },
      {
        id: 'PRD-009',
        name: 'Iced Lemon Tea Segar',
        price: 10000,
        quantity: 2,
        subtotal: 20000,
        selectedToppings: []
      }
    ],
    subtotal: 60000,
    itemsDiscountTotal: 0,
    orderDiscountType: null,
    orderDiscountValue: 0,
    orderDiscountAmount: 0,
    discount: 0,
    totalAmount: 60000,
    totalItemsCount: 4,
    paymentMethod: 'qris',
    cashReceived: 60000,
    changeAmount: 0,
    createdAt: new Date().toISOString()
  }
];

export const DUMMY_STOCK_LOGS = [];

/**
 * Injeksi data real ke localStorage secara langsung
 */
export const injectDummyDataToStorage = () => {
  try {
    localStorage.setItem('master_units', JSON.stringify(DUMMY_UNITS));
    localStorage.setItem('master_categories', JSON.stringify(DUMMY_CATEGORIES));
    localStorage.setItem('master_raw_materials', JSON.stringify(DUMMY_RAW_MATERIALS));
    localStorage.setItem('master_toppings', JSON.stringify(DUMMY_TOPPINGS));
    localStorage.setItem('master_product_menus', JSON.stringify(DUMMY_PRODUCT_MENUS));
    localStorage.setItem('pos_cashier_accounts', JSON.stringify(DUMMY_CASHIERS));
    localStorage.setItem('pos_orders', JSON.stringify(DUMMY_ORDERS));
    localStorage.setItem('inventory_stock_logs', '[]');
    localStorage.setItem('xcrepes_pos_settings', JSON.stringify(DUMMY_SETTINGS));
    localStorage.setItem('pos_cart', '[]');
    return { success: true, message: 'Database telah disiapkan dengan data real!' };
  } catch (e) {
    console.error('Gagal menyiapkan data:', e);
    return { success: false, message: e.message };
  }
};

/**
 * Mengosongkan seluruh data dari localStorage
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
    return { success: true, message: 'Seluruh data master, pesanan, dan inventori telah dikosongkan.' };
  } catch (e) {
    console.error('Gagal mengosongkan data:', e);
    return { success: false, message: e.message };
  }
};

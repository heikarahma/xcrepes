/**
 * Discount Model (Master Data & Tipe Diskon)
 * Mengelola tipe diskon (Nominal Rp & Persentase %), preset promo, dan fungsi kalkulasi
 */

export const DISCOUNT_TYPES = {
  PERCENT: 'percent', // Persentase (%)
  FIXED: 'fixed'      // Nominal (Rp)
};

export const DISCOUNT_STORAGE_KEY = 'master_discounts';

export const DEFAULT_DISCOUNT_PRESETS = [
  {
    id: 'DISC-001',
    code: 'PROMO10',
    name: 'Diskon Pelanggan Baru (10%)',
    type: 'percent',
    value: 10,
    description: 'Potongan 10% untuk pelanggan baru'
  },
  {
    id: 'DISC-002',
    code: 'MEMBERVIP',
    name: 'Voucher Member VIP (15%)',
    type: 'percent',
    value: 15,
    description: 'Diskon loyalitas member setia 15%'
  },
  {
    id: 'DISC-003',
    code: 'FLASH20',
    name: 'Promo Flash Sale (20%)',
    type: 'percent',
    value: 20,
    description: 'Diskon kilat spesial 20%'
  },
  {
    id: 'DISC-004',
    code: 'HEMAT5K',
    name: 'Kupon Hemat Rp 5.000',
    type: 'fixed',
    value: 5000,
    description: 'Potongan nominal langsung Rp 5.000'
  },
  {
    id: 'DISC-005',
    code: 'ULTAH10K',
    name: 'Voucher Ulang Tahun Rp 10.000',
    type: 'fixed',
    value: 10000,
    description: 'Potongan ultah pelanggan Rp 10.000'
  },
  {
    id: 'DISC-006',
    code: 'STAFF25',
    name: 'Diskon Karyawan / Staff (25%)',
    type: 'percent',
    value: 25,
    description: 'Diskon khusus staf & pegawai 25%'
  },
  {
    id: 'DISC-007',
    code: 'JUMAT3K',
    name: 'Kupon Jumat Berkah Rp 3.000',
    type: 'fixed',
    value: 3000,
    description: 'Potongan khusus Jumat Rp 3.000'
  }
];

export const QUICK_PERCENT_PRESETS = [5, 10, 15, 20, 25, 50];
export const QUICK_NOMINAL_PRESETS = [2000, 3000, 5000, 10000, 15000, 20000];

/**
 * Hitung nominal diskon untuk single item cart
 * @param {number} unitPrice - Harga satuan (termasuk topping)
 * @param {number} quantity - Jumlah item
 * @param {'none'|'fixed'|'percent'} discountType - Tipe diskon
 * @param {number} discountValue - Nilai diskon (nominal atau %)
 * @returns {number} Nilai potongan diskon total untuk item ini
 */
export const calculateItemDiscount = (unitPrice = 0, quantity = 1, discountType = 'none', discountValue = 0) => {
  const gross = Number(unitPrice) * Number(quantity);
  if (gross <= 0 || !discountType || discountType === 'none' || !discountValue || discountValue <= 0) {
    return 0;
  }

  if (discountType === 'percent') {
    const pct = Math.min(100, Math.max(0, Number(discountValue)));
    return Math.round((gross * pct) / 100);
  }

  if (discountType === 'fixed') {
    // Nominal per item cart (flat / tidak dikalikan quantity), dibatasi maksimal sebesar gross line total
    const fixedTotal = Math.max(0, Number(discountValue));
    return Math.min(gross, fixedTotal);
  }

  return 0;
};

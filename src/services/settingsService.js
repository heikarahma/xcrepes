import { supabase, isSupabaseConfigured } from '../lib/supabase';

const TABLE = 'store_settings';
const DEFAULT_SETTINGS_ID = 'store_default';

const DEFAULT_SETTINGS = {
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

export const settingsService = {
  async getSettings() {
    if (!isSupabaseConfigured()) return { data: DEFAULT_SETTINGS, error: null };
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('id', DEFAULT_SETTINGS_ID)
      .maybeSingle();

    if (error) {
      console.error('settingsService.getSettings error:', error);
      return { data: DEFAULT_SETTINGS, error };
    }

    if (!data) {
      return { data: DEFAULT_SETTINGS, error: null };
    }

    return {
      data: {
        appName: data.app_name || DEFAULT_SETTINGS.appName,
        storeName: data.store_name || DEFAULT_SETTINGS.storeName,
        storeTagline: data.store_tagline || DEFAULT_SETTINGS.storeTagline,
        logo: data.logo || '',
        phone: data.phone || '',
        address: data.address || '',
        email: data.email || '',
        receiptTitle: data.receipt_title || DEFAULT_SETTINGS.receiptTitle,
        receiptSubtitle: data.receipt_subtitle || '',
        receiptPhone: data.receipt_phone || '',
        receiptFooter1: data.receipt_footer1 || DEFAULT_SETTINGS.receiptFooter1,
        receiptFooter2: data.receipt_footer2 || '',
        paperSize: data.paper_size || '58mm',
        showLogoOnReceipt: Boolean(data.show_logo_on_receipt),
        showCashierName: data.show_cashier_name !== false,
        showCustomerName: data.show_customer_name !== false,
        showTableNumber: data.show_table_number !== false,
        showNotes: data.show_notes !== false
      },
      error: null
    };
  },

  async saveSettings(settings) {
    if (!isSupabaseConfigured()) return { data: null, error: new Error('Supabase not configured') };
    const payload = {
      id: DEFAULT_SETTINGS_ID,
      app_name: settings.appName,
      store_name: settings.storeName,
      store_tagline: settings.storeTagline,
      logo: settings.logo || '',
      phone: settings.phone || '',
      address: settings.address || '',
      email: settings.email || '',
      receipt_title: settings.receiptTitle,
      receipt_subtitle: settings.receiptSubtitle || '',
      receipt_phone: settings.receiptPhone || '',
      receipt_footer1: settings.receiptFooter1 || '',
      receipt_footer2: settings.receiptFooter2 || '',
      paper_size: settings.paperSize || '58mm',
      show_logo_on_receipt: Boolean(settings.showLogoOnReceipt),
      show_cashier_name: settings.showCashierName !== false,
      show_customer_name: settings.showCustomerName !== false,
      show_table_number: settings.showTableNumber !== false,
      show_notes: settings.showNotes !== false,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from(TABLE)
      .upsert(payload)
      .select()
      .single();

    if (error) {
      console.error('settingsService.saveSettings error:', error);
      return { data: null, error };
    }

    return { data, error: null };
  }
};

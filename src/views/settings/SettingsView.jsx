import React, { useState, useRef, useEffect } from 'react';
import { useSettings } from '../../controllers/SettingsController';
import { useUnit } from '../../controllers/UnitController';
import { useAuth } from '../../controllers/AuthController';
import { Button } from '../components/Button';
import { 
  Store, 
  Receipt, 
  UploadCloud, 
  Trash2, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  Printer, 
  Phone, 
  MapPin, 
  Mail, 
  Check, 
  Sliders,
  FileText,
  Eye,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export const SettingsView = () => {
  const { settings, updateSettings, resetSettings } = useSettings();
  const { showToast } = useUnit();
  const { currentUser, openProfileModal } = useAuth();

  // Active Tab: 'store' | 'receipt'
  const [activeTab, setActiveTab] = useState('store');

  // Form State
  const [formData, setFormData] = useState({ ...settings });
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef(null);
  const addressRef = useRef(null);

  // Auto-resize address textarea dynamically (compact 42px by default, expands as text grows)
  const resizeAddressTextarea = () => {
    if (addressRef.current) {
      addressRef.current.style.height = 'auto';
      const scrollH = addressRef.current.scrollHeight;
      addressRef.current.style.height = `${Math.max(42, scrollH)}px`;
    }
  };

  // Sync form state when global settings change
  useEffect(() => {
    setFormData({ ...settings });
  }, [settings]);

  useEffect(() => {
    // Run after DOM render
    const timeout = setTimeout(resizeAddressTextarea, 20);
    return () => clearTimeout(timeout);
  }, [formData.address, activeTab]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsSaved(false);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      showToast('Format logo harus JPG, PNG, WEBP, atau SVG', 'error', 'Format Tidak Didukung');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast('Ukuran file logo maksimal 2MB', 'error', 'File Terlalu Besar');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      handleChange('logo', reader.result);
      showToast('Logo berhasil dimuat. Klik Simpan untuk menerapkan.', 'success', 'Logo Terpilih');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    handleChange('logo', '');
    if (fileInputRef.current) fileInputRef.current.value = '';
    showToast('Logo dihapus. Klik Simpan untuk menerapkan.', 'info', 'Logo Dihapus');
  };

  const handleSave = (e) => {
    if (e) e.preventDefault();
    updateSettings(formData);
    setIsSaved(true);
    showToast('Konfigurasi aplikasi dan struk berhasil disimpan!', 'success', 'Berhasil Disimpan');
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleReset = () => {
    if (window.confirm('Apakah Anda yakin ingin mengembalikan semua konfigurasi ke pengaturan awal bawaan?')) {
      resetSettings();
      showToast('Semua konfigurasi dikembalikan ke pengaturan awal pabrik.', 'info', 'Reset Pengaturan');
    }
  };

  // Test Print receipt function
  const handleTestPrint = () => {
    const printContent = document.getElementById('test-receipt-paper');
    if (!printContent) return;

    const printWindow = window.open(
      '',
      '_blank',
      'width=460,height=750,top=80,left=100,toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes'
    );

    if (!printWindow) {
      window.print();
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html lang="id">
        <head>
          <meta charset="UTF-8" />
          <title>Uji Coba Struk - ${formData.receiptTitle || formData.storeName}</title>
          <style>
            @page { size: ${formData.paperSize === '80mm' ? '80mm' : '58mm'} auto; margin: 0; }
            body { margin: 0; padding: 10px; font-family: 'Courier New', Courier, monospace; font-size: 8.5pt; color: #000; }
            .receipt-wrap { width: ${formData.paperSize === '80mm' ? '76mm' : '54mm'}; margin: 0 auto; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="receipt-wrap">
            ${printContent.innerHTML}
          </div>
          <script>
            window.addEventListener('load', function() {
              setTimeout(function() { window.print(); }, 250);
            });
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="settings-page animate-fade-in" style={styles.container}>
      {/* Header */}
      <div className="settings-header" style={styles.pageHeader}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={styles.pageTitle}>Konfigurasi Toko & Struk</h1>
            <span style={styles.headerBadge}>Sistem POS</span>
          </div>
          <p style={styles.pageSubtitle}>
            Atur identitas aplikasi, logo brand, nomor kontak, serta kustomisasi format cetak struk kasir.
          </p>
        </div>

        {currentUser?.role === 'superadmin' && (
          <button
            type="button"
            className="btn btn-secondary settings-superadmin-btn"
            onClick={openProfileModal}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '42px', fontWeight: 600 }}
            title="Kelola nama, username, dan kata sandi Super Admin"
          >
            <ShieldCheck size={16} color="var(--blue-600)" />
            <span>Profil & Kredensial Super Admin</span>
          </button>
        )}
      </div>

      {/* Main Grid: Settings Tabs & Live Preview */}
      <div className="settings-main-grid" style={styles.mainGrid}>
        {/* Left / Center: Settings Form */}
        <div className="settings-form-column" style={styles.formColumn}>
          {/* Tab Selector */}
          <div className="settings-tab-bar" style={styles.tabBar}>
            <button
              type="button"
              className={`settings-tab-btn ${activeTab === 'store' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('store')}
              style={{
                ...styles.tabBtn,
                ...(activeTab === 'store' ? styles.tabBtnActive : {})
              }}
            >
              <Store size={16} />
              <span>Profil Toko & Aplikasi</span>
            </button>
            <button
              type="button"
              className={`settings-tab-btn ${activeTab === 'receipt' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('receipt')}
              style={{
                ...styles.tabBtn,
                ...(activeTab === 'receipt' ? styles.tabBtnActive : {})
              }}
            >
              <Receipt size={16} />
              <span>Pengaturan Struk Kasir</span>
            </button>
          </div>

          {/* TAB 1: PROFIL TOKO & APLIKASI */}
          {activeTab === 'store' && (
            <div className="blue-card settings-card" style={styles.card}>
              <div className="settings-card-header" style={styles.cardHeader}>
                <div style={styles.cardIconBox}>
                  <Store size={20} color="var(--blue-600)" />
                </div>
                <div>
                  <h2 style={styles.cardTitle}>Identitas Bisnis & Brand</h2>
                  <p style={styles.cardSubtitle}>Informasi ini akan muncul di sidebar, navbar, dan header dokumen.</p>
                </div>
              </div>

              <div style={styles.formBody}>
                {/* Logo Uploader */}
                <div style={styles.section}>
                  <label style={styles.fieldLabel}>LOGO TOKO / APLIKASI</label>
                  <div className="settings-logo-container" style={styles.logoUploadContainer}>
                    <div style={styles.logoPreviewBox}>
                      {formData.logo ? (
                        <img src={formData.logo} alt="Logo Toko" style={styles.logoImage} />
                      ) : (
                        <div style={styles.logoEmptyIcon}>
                          <Sparkles size={28} color="var(--blue-500)" />
                          <span style={{ fontSize: '0.688rem', color: 'var(--neutral-400)', fontWeight: 600 }}>Default</span>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--neutral-800)' }}>
                        Foto Logo Brand
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', lineHeight: 1.4 }}>
                        Dianjurkan menggunakan logo berformat PNG transparan atau JPG persegi rasio 1:1. Maksimal 2MB.
                      </span>

                      <div className="settings-logo-actions" style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          icon={UploadCloud}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {formData.logo ? 'Ganti Logo' : 'Upload Logo'}
                        </Button>

                        {formData.logo && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            icon={Trash2}
                            onClick={handleRemoveLogo}
                            style={{ color: 'var(--red-600)', borderColor: 'var(--red-200)' }}
                          >
                            Hapus
                          </Button>
                        )}
                      </div>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,.svg"
                        ref={fileInputRef}
                        onChange={handleLogoUpload}
                        style={{ display: 'none' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Nama Toko & Nama Aplikasi */}
                <div className="settings-form-row2" style={styles.formRow2}>
                  <div style={styles.formGroup}>
                    <label style={styles.fieldLabel}>NAMA TOKO / KAFE <span style={{ color: 'var(--red-500)' }}>*</span></label>
                    <input
                      type="text"
                      className="blue-input"
                      value={formData.storeName}
                      onChange={(e) => handleChange('storeName', e.target.value)}
                      placeholder="Contoh: XCrepes & Cafe"
                      style={styles.input}
                    />
                    <span style={styles.inputHint}>Nama utama outlet atau kedai Anda.</span>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.fieldLabel}>NAMA APLIKASI (SIDEBAR)</label>
                    <input
                      type="text"
                      className="blue-input"
                      value={formData.appName}
                      onChange={(e) => handleChange('appName', e.target.value)}
                      placeholder="Contoh: XCrepes POS"
                      style={styles.input}
                    />
                    <span style={styles.inputHint}>Judul aplikasi yang terlihat di menu sidebar.</span>
                  </div>
                </div>

                {/* Slogan / Tagline */}
                <div style={styles.formGroup}>
                  <label style={styles.fieldLabel}>SLOGAN / TAGLINE</label>
                  <input
                    type="text"
                    className="blue-input"
                    value={formData.storeTagline}
                    onChange={(e) => handleChange('storeTagline', e.target.value)}
                    placeholder="Contoh: Crispy Crepes & Modern Beverages"
                    style={styles.input}
                  />
                  <span style={styles.inputHint}>Keterangan singkat bisnis yang tampil di bawah nama aplikasi.</span>
                </div>

                {/* Kontak: Telepon & Email */}
                <div style={styles.formRow2}>
                  <div style={styles.formGroup}>
                    <label style={styles.fieldLabel}>NOMOR TELEPON / WA</label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={15} color="var(--neutral-400)" style={styles.inputIcon} />
                      <input
                        type="text"
                        className="blue-input with-icon"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="Contoh: (021) 555-8989 / 0812-3456-7890"
                        style={styles.input}
                      />
                    </div>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.fieldLabel}>EMAIL TOKO</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={15} color="var(--neutral-400)" style={styles.inputIcon} />
                      <input
                        type="email"
                        className="blue-input with-icon"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="Contoh: halo@xcrepes.com"
                        style={styles.input}
                      />
                    </div>
                  </div>
                </div>

                {/* Alamat Toko */}
                <div style={styles.formGroup}>
                  <label style={styles.fieldLabel}>ALAMAT LENGKAP OUTLET</label>
                  <div style={{ position: 'relative' }}>
                    <MapPin 
                      size={15} 
                      color="var(--neutral-400)" 
                      style={{ ...styles.inputIcon, top: '13px', transform: 'none' }} 
                    />
                    <textarea
                      ref={addressRef}
                      className="blue-input with-icon"
                      rows="1"
                      value={formData.address}
                      onChange={(e) => {
                        handleChange('address', e.target.value);
                      }}
                      placeholder="Contoh: Jl. Raya Kuliner No. 12, Kel. Sukamaju, Jakarta Barat"
                      style={{
                        ...styles.input,
                        minHeight: '42px',
                        height: '42px',
                        paddingTop: '10px',
                        paddingBottom: '10px',
                        lineHeight: 1.45,
                        resize: 'none',
                        overflow: 'hidden',
                        transition: 'height 0.15s ease',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PENGATURAN STRUK */}
          {activeTab === 'receipt' && (
            <div className="blue-card settings-card" style={styles.card}>
              <div className="settings-card-header" style={styles.cardHeader}>
                <div style={styles.cardIconBox}>
                  <Receipt size={20} color="var(--blue-600)" />
                </div>
                <div>
                  <h2 style={styles.cardTitle}>Format & Tata Letak Struk Kasir</h2>
                  <p style={styles.cardSubtitle}>Kustomisasi teks header, footer, ukuran kertas, dan data transaksi struk.</p>
                </div>
              </div>

              <div style={styles.formBody}>
                {/* Ukuran Kertas Thermal */}
                <div style={styles.formGroup}>
                  <label style={styles.fieldLabel}>UKURAN LEBAR KERTAS PRINTER THERMAL</label>
                  <div className="settings-radio-grid" style={styles.radioGrid}>
                    <label
                      style={{
                        ...styles.radioCard,
                        ...(formData.paperSize === '58mm' ? styles.radioCardActive : {})
                      }}
                    >
                      <input
                        type="radio"
                        name="paperSize"
                        value="58mm"
                        checked={formData.paperSize === '58mm'}
                        onChange={() => handleChange('paperSize', '58mm')}
                        style={{ display: 'none' }}
                      />
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--neutral-900)' }}>
                            58 mm (Standar POS)
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', marginTop: '2px' }}>
                            Umum untuk printer Bluetooth portable & kasir kasir mini.
                          </div>
                        </div>
                        {formData.paperSize === '58mm' && <Check size={18} color="var(--blue-600)" />}
                      </div>
                    </label>

                    <label
                      style={{
                        ...styles.radioCard,
                        ...(formData.paperSize === '80mm' ? styles.radioCardActive : {})
                      }}
                    >
                      <input
                        type="radio"
                        name="paperSize"
                        value="80mm"
                        checked={formData.paperSize === '80mm'}
                        onChange={() => handleChange('paperSize', '80mm')}
                        style={{ display: 'none' }}
                      />
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--neutral-900)' }}>
                            80 mm (Thermal Lebar)
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', marginTop: '2px' }}>
                            Untuk printer kasir desktop Epson, Star, Sunmi, dll.
                          </div>
                        </div>
                        {formData.paperSize === '80mm' && <Check size={18} color="var(--blue-600)" />}
                      </div>
                    </label>
                  </div>
                </div>

                {/* Header Struk */}
                <div className="settings-form-row2" style={styles.formRow2}>
                  <div style={styles.formGroup}>
                    <label style={styles.fieldLabel}>JUDUL UTAMA STRUK (HEADER)</label>
                    <input
                      type="text"
                      className="blue-input"
                      value={formData.receiptTitle}
                      onChange={(e) => handleChange('receiptTitle', e.target.value)}
                      placeholder="Contoh: XCrepes & Cafe"
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.fieldLabel}>NO. TELEPON DI STRUK</label>
                    <input
                      type="text"
                      className="blue-input"
                      value={formData.receiptPhone}
                      onChange={(e) => handleChange('receiptPhone', e.target.value)}
                      placeholder="Contoh: Telp: (021) 555-8989"
                      style={styles.input}
                    />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.fieldLabel}>BARIS ALAMAT DI STRUK</label>
                  <input
                    type="text"
                    className="blue-input"
                    value={formData.receiptSubtitle}
                    onChange={(e) => handleChange('receiptSubtitle', e.target.value)}
                    placeholder="Contoh: Jl. Raya Kuliner No. 12, Jakarta"
                    style={styles.input}
                  />
                </div>

                {/* Opsi Tampilan Toggle Checkbox */}
                <div style={styles.formGroup}>
                  <label style={styles.fieldLabel}>OPSI TAMPILAN ELEMEN STRUK</label>
                  <div className="settings-toggle-grid" style={styles.toggleGrid}>
                    <label style={styles.toggleItem}>
                      <input
                        type="checkbox"
                        checked={formData.showCashierName}
                        onChange={(e) => handleChange('showCashierName', e.target.checked)}
                        style={styles.checkbox}
                      />
                      <div>
                        <span style={styles.toggleTitle}>Tampilkan Nama Kasir</span>
                        <span style={styles.toggleDesc}>Mencantumkan nama kasir yang melayani transaksi.</span>
                      </div>
                    </label>

                    <label style={styles.toggleItem}>
                      <input
                        type="checkbox"
                        checked={formData.showTableNumber}
                        onChange={(e) => handleChange('showTableNumber', e.target.checked)}
                        style={styles.checkbox}
                      />
                      <div>
                        <span style={styles.toggleTitle}>Tampilkan Nomor Meja / Order Type</span>
                        <span style={styles.toggleDesc}>Menampilkan nomor meja atau keterangan Takeaway.</span>
                      </div>
                    </label>

                    <label style={styles.toggleItem}>
                      <input
                        type="checkbox"
                        checked={formData.showCustomerName}
                        onChange={(e) => handleChange('showCustomerName', e.target.checked)}
                        style={styles.checkbox}
                      />
                      <div>
                        <span style={styles.toggleTitle}>Tampilkan Nama Pelanggan</span>
                        <span style={styles.toggleDesc}>Mencantumkan nama pembeli jika diisi saat transaksi.</span>
                      </div>
                    </label>

                    <label style={styles.toggleItem}>
                      <input
                        type="checkbox"
                        checked={formData.showNotes}
                        onChange={(e) => handleChange('showNotes', e.target.checked)}
                        style={styles.checkbox}
                      />
                      <div>
                        <span style={styles.toggleTitle}>Tampilkan Catatan Item (*Note)</span>
                        <span style={styles.toggleDesc}>Mencetak catatan khusus pesanan menu pelanggan.</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Footer Struk */}
                <div className="settings-form-row2" style={styles.formRow2}>
                  <div style={styles.formGroup}>
                    <label style={styles.fieldLabel}>PESAN KAKI 1 (TERIMA KASIH)</label>
                    <input
                      type="text"
                      className="blue-input"
                      value={formData.receiptFooter1}
                      onChange={(e) => handleChange('receiptFooter1', e.target.value)}
                      placeholder="Terima kasih atas kunjungan Anda!"
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.fieldLabel}>PESAN KAKI 2 (KETENTUAN / PENUTUP)</label>
                    <input
                      type="text"
                      className="blue-input"
                      value={formData.receiptFooter2}
                      onChange={(e) => handleChange('receiptFooter2', e.target.value)}
                      placeholder="Simpan struk ini sebagai bukti pembayaran sah."
                      style={styles.input}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Footer Bar */}
          <div className="settings-action-card" style={styles.actionCard}>
            <div className="settings-save-btn-wrap" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Button
                type="button"
                variant="primary"
                icon={isSaved ? CheckCircle2 : Save}
                onClick={handleSave}
                size="md"
                className="settings-save-btn"
              >
                {isSaved ? 'Perubahan Tersimpan' : 'Simpan Semua Konfigurasi'}
              </Button>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--neutral-500)' }}>
              Perubahan langsung diterapkan ke menu kasir dan struk cetak.
            </span>
          </div>
        </div>

        {/* Right: Live Interactive Thermal Receipt Preview */}
        <div className="settings-preview-column" style={styles.previewColumn}>
          <div style={styles.previewHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Eye size={16} color="var(--blue-600)" />
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--neutral-800)' }}>
                Pratinjau Struk Kasir
              </span>
            </div>
            <span style={styles.paperBadge}>
              {formData.paperSize} Thermal
            </span>
          </div>

          <p style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', marginBottom: '14px' }}>
            Pratinjau cetak kertas thermal 1:1 yang diperbarui otomatis saat Anda mengubah pengaturan.
          </p>

          {/* Simulated Thermal Paper */}
          <div
            id="test-receipt-paper"
            className="settings-thermal-paper"
            style={{
              ...styles.thermalPaper,
              width: formData.paperSize === '80mm' ? '100%' : 'min(280px, 100%)'
            }}
          >
            {/* Header / Logo */}
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
              {formData.logo && (
                <img
                  src={formData.logo}
                  alt="Logo Struk"
                  style={{
                    maxHeight: '44px',
                    maxWidth: '120px',
                    objectFit: 'contain',
                    marginBottom: '4px',
                    filter: 'grayscale(100%) contrast(150%)'
                  }}
                />
              )}

              <div style={{ fontSize: '0.938rem', fontWeight: 800, color: '#000000', letterSpacing: '-0.01em' }}>
                {formData.receiptTitle || formData.storeName || 'Nama Toko'}
              </div>

              {formData.receiptSubtitle && (
                <div style={{ fontSize: '0.688rem', color: '#333333' }}>
                  {formData.receiptSubtitle}
                </div>
              )}

              {formData.receiptPhone && (
                <div style={{ fontSize: '0.688rem', color: '#333333' }}>
                  {formData.receiptPhone}
                </div>
              )}

              <div style={styles.receiptDashedLine} />

              {/* Meta Info */}
              <div style={styles.receiptMetaRow}>
                <span>No: <strong>INV-260904-001</strong></span>
                <span>04 Sep 2026 19:30</span>
              </div>

              {formData.showCashierName && (
                <div style={styles.receiptMetaRow}>
                  <span>Kasir: Admin Kasir</span>
                  {formData.showTableNumber && <span>Meja: <strong>Meja 05</strong></span>}
                </div>
              )}

              {formData.showCustomerName && (
                <div style={styles.receiptMetaRow}>
                  <span>Pelanggan: <strong>Rahma (VIP)</strong></span>
                </div>
              )}
            </div>

            <div style={styles.receiptDashedLine} />

            {/* Sample Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {/* Item 1 */}
              <div>
                <div style={{ fontSize: '0.813rem', fontWeight: 700, color: '#000000' }}>
                  Crepes Choco Banana Crunch
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                  <span>1 x Rp 28.000</span>
                  <span style={{ fontWeight: 700 }}>Rp 28.000</span>
                </div>
                <div style={{ paddingLeft: '8px', fontSize: '0.688rem', color: '#444444', display: 'flex', justifyContent: 'space-between' }}>
                  <span>+ Keju Parut Kraft</span>
                  <span>Rp 3.000</span>
                </div>
                {formData.showNotes && (
                  <div style={{ paddingLeft: '8px', fontSize: '0.688rem', color: '#666666', fontStyle: 'italic' }}>
                    *Coklat agak banyak
                  </div>
                )}
              </div>

              {/* Item 2 */}
              <div>
                <div style={{ fontSize: '0.813rem', fontWeight: 700, color: '#000000' }}>
                  Es Kopi Susu Aren Gula Aren
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                  <span>2 x Rp 18.000</span>
                  <span style={{ fontWeight: 700 }}>Rp 36.000</span>
                </div>
              </div>
            </div>

            <div style={styles.receiptDashedLine} />

            {/* Billing Summary */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Total Item:</span>
                <span>3 pcs</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal:</span>
                <span>Rp 67.000</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#000000', fontWeight: 600 }}>
                <span>Diskon Promo:</span>
                <span>-Rp 5.000</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.938rem',
                fontWeight: 800,
                borderTop: '1px dashed #000000',
                borderBottom: '1px dashed #000000',
                padding: '4px 0',
                margin: '2px 0'
              }}>
                <span>TOTAL:</span>
                <span>Rp 62.000</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Metode Bayar:</span>
                <span style={{ fontWeight: 700 }}>QRIS BLIBLI</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Status:</span>
                <span style={{ fontWeight: 700 }}>LUNAS</span>
              </div>
            </div>

            <div style={styles.receiptDashedLine} />

            {/* Receipt Footer */}
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.688rem', color: '#444444' }}>
              {formData.receiptFooter1 && <span>{formData.receiptFooter1}</span>}
              {formData.receiptFooter2 && <span>{formData.receiptFooter2}</span>}
            </div>
          </div>

          {/* Test Print Button */}
          <div style={{ marginTop: '14px', width: '100%' }}>
            <Button
              type="button"
              variant="outline"
              icon={Printer}
              onClick={handleTestPrint}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Uji Coba Cetak Struk (PDF / Printer)
            </Button>
          </div>
        </div>
      </div>


      <style>{`
        @media (max-width: 1024px) {
          .settings-page {
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }

          .settings-header {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 14px !important;
            margin-bottom: 16px !important;
          }

          .settings-superadmin-btn {
            width: 100% !important;
            justify-content: center !important;
          }

          .settings-main-grid {
            grid-template-columns: 1fr !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 16px !important;
          }

          .settings-form-column {
            width: 100% !important;
          }

          .settings-tab-bar {
            width: 100% !important;
            display: flex !important;
            gap: 6px !important;
            padding: 4px !important;
            box-sizing: border-box !important;
          }

          .settings-tab-btn {
            flex: 1 !important;
            justify-content: center !important;
            font-size: 0.813rem !important;
            padding: 10px 8px !important;
            text-align: center !important;
          }

          .settings-card {
            padding: 16px !important;
            border-radius: 12px !important;
          }

          .settings-card-header {
            margin-bottom: 16px !important;
            padding-bottom: 14px !important;
          }

          .settings-logo-container {
            flex-direction: column !important;
            align-items: center !important;
            text-align: center !important;
            padding: 14px !important;
            gap: 12px !important;
          }

          .settings-logo-actions {
            justify-content: center !important;
            width: 100% !important;
          }

          .settings-form-row2 {
            grid-template-columns: 1fr !important;
            gap: 14px !important;
          }

          .settings-radio-grid {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }

          .settings-action-card {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 10px !important;
            padding: 14px !important;
            text-align: center !important;
          }

          .settings-save-btn-wrap {
            width: 100% !important;
          }

          .settings-save-btn {
            width: 100% !important;
            justify-content: center !important;
            height: 44px !important;
          }

          .settings-preview-column {
            position: static !important;
            width: 100% !important;
            padding: 16px !important;
            box-sizing: border-box !important;
          }

          .settings-thermal-paper {
            width: 100% !important;
            max-width: 300px !important;
            margin: 0 auto !important;
          }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    padding: '24px',
    maxWidth: '100%',
    margin: '0',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    boxSizing: 'border-box'
  },
  pageHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px'
  },
  pageTitle: {
    fontSize: '1.5rem',
    fontWeight: 800,
    color: 'var(--neutral-900)',
    letterSpacing: '-0.02em',
    lineHeight: 1.2
  },
  pageSubtitle: {
    fontSize: '0.813rem',
    color: 'var(--neutral-500)',
    marginTop: '4px'
  },
  headerBadge: {
    padding: '4px 8px',
    backgroundColor: 'var(--blue-50)',
    color: 'var(--blue-600)',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: 700,
    border: '1px solid var(--blue-200)'
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1.6fr 1.1fr',
    gap: '24px',
    alignItems: 'start'
  },
  formColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  tabBar: {
    display: 'flex',
    gap: '8px',
    backgroundColor: 'var(--neutral-100)',
    padding: '4px',
    borderRadius: '10px',
    border: '1px solid var(--neutral-200)',
    width: 'fit-content'
  },
  tabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'var(--neutral-600)',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  tabBtnActive: {
    backgroundColor: '#ffffff',
    color: 'var(--blue-600)',
    fontWeight: 700,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
  },
  card: {
    padding: '24px',
    borderRadius: '14px',
    border: '1px solid var(--border-color)',
    backgroundColor: '#ffffff',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    paddingBottom: '16px',
    borderBottom: '1px solid var(--border-subtle)',
    marginBottom: '20px'
  },
  cardIconBox: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    backgroundColor: 'var(--blue-50)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid var(--blue-100)'
  },
  cardTitle: {
    fontSize: '1.063rem',
    fontWeight: 800,
    color: 'var(--neutral-900)',
    margin: 0
  },
  cardSubtitle: {
    fontSize: '0.75rem',
    color: 'var(--neutral-500)',
    margin: '2px 0 0 0'
  },
  formBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px'
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  formRow2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px'
  },
  fieldLabel: {
    fontSize: '0.688rem',
    fontWeight: 700,
    color: 'var(--neutral-600)',
    letterSpacing: '0.5px'
  },
  input: {
    width: '100%',
    height: '42px',
    fontSize: '0.875rem'
  },
  inputHint: {
    fontSize: '0.688rem',
    color: 'var(--neutral-400)'
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none'
  },
  logoUploadContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
    padding: '16px',
    backgroundColor: 'var(--neutral-50)',
    borderRadius: '12px',
    border: '1px dashed var(--neutral-300)'
  },
  logoPreviewBox: {
    width: '74px',
    height: '74px',
    borderRadius: '12px',
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
    boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
  },
  logoImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    padding: '4px'
  },
  logoEmptyIcon: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px'
  },
  radioGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px'
  },
  radioCard: {
    padding: '12px 14px',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.15s ease'
  },
  radioCardActive: {
    borderColor: 'var(--blue-500)',
    backgroundColor: 'var(--blue-50)'
  },
  toggleGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    backgroundColor: 'var(--neutral-50)',
    padding: '14px 16px',
    borderRadius: '10px',
    border: '1px solid var(--border-color)'
  },
  toggleItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    cursor: 'pointer'
  },
  checkbox: {
    width: '16px',
    height: '16px',
    marginTop: '2px',
    cursor: 'pointer',
    accentColor: 'var(--blue-600)'
  },
  toggleTitle: {
    display: 'block',
    fontSize: '0.813rem',
    fontWeight: 700,
    color: 'var(--neutral-800)'
  },
  toggleDesc: {
    display: 'block',
    fontSize: '0.688rem',
    color: 'var(--neutral-500)'
  },
  actionCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
    flexWrap: 'wrap',
    gap: '12px'
  },

  // Preview Column
  previewColumn: {
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-color)',
    borderRadius: '14px',
    padding: '20px',
    position: 'sticky',
    top: '80px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  previewHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: '6px'
  },
  paperBadge: {
    fontSize: '0.688rem',
    fontWeight: 700,
    backgroundColor: 'var(--blue-50)',
    color: 'var(--blue-700)',
    padding: '2px 8px',
    borderRadius: '6px',
    border: '1px solid var(--blue-200)'
  },
  thermalPaper: {
    backgroundColor: '#ffffff',
    border: '1px dashed var(--neutral-400)',
    borderRadius: '4px',
    padding: '16px 14px',
    boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
    fontFamily: '"Courier New", Courier, monospace, sans-serif',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    boxSizing: 'border-box'
  },
  receiptDashedLine: {
    borderBottom: '1px dashed #000000',
    margin: '4px 0',
    width: '100%'
  },
  receiptMetaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    fontSize: '0.688rem',
    color: '#000000'
  }
};


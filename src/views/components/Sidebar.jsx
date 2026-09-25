import React, { useState } from 'react';
import { useUnit } from '../../controllers/UnitController';
import { useCategory } from '../../controllers/CategoryController';
import { useRawMaterial } from '../../controllers/RawMaterialController';
import { useTopping } from '../../controllers/ToppingController';
import { useProductMenu } from '../../controllers/ProductMenuController';
import { useSettings } from '../../controllers/SettingsController';
import { useReport } from '../../controllers/ReportController';
import { useAuth } from '../../controllers/AuthController';
import { hasAdminPrivileges, isStoreAdminRole } from '../../models/UserModel';
import { 
  Ruler, 
  Layers, 
  Package, 
  Sparkles, 
  X, 
  Cookie,
  ShoppingBag,
  Sliders,
  BarChart3,
  TrendingUp,
  Receipt,
  ChevronDown,
  Users,
  LogOut,
  ShieldCheck,
  User,
  KeyRound,
  RotateCcw,
  ClipboardCheck
} from 'lucide-react';

export const Sidebar = () => {
  const { 
    totalAllUnits, 
    activeMenu, 
    setActiveMenu, 
    isMobileMenuOpen, 
    setIsMobileMenuOpen 
  } = useUnit();

  const { totalAllCategories } = useCategory();
  const { totalAllRawMaterials, opnameSummary } = useRawMaterial();
  const { totalAllToppings } = useTopping();
  const { totalAllMenus } = useProductMenu();
  const { settings } = useSettings();
  const { activeReportTab, setActiveReportTab, activeSalesSection, setActiveSalesSection } = useReport();
  const { currentUser, hasPermission, logout, cashiers, openProfileModal } = useAuth();

  const isSuperAdmin = currentUser?.role === 'superadmin';
  const isStoreAdmin = isStoreAdminRole(currentUser?.role);
  const hasFullAccess = hasAdminPrivileges(currentUser?.role);
  const hasSales = hasPermission('kasir');
  const hasMasterData = hasPermission('unit') || hasPermission('category') || hasPermission('topping') || hasPermission('product-menu');
  const hasInventory = hasPermission('raw-material') || hasPermission('stock-opname');
  const hasReturns = hasPermission('returns');
  const hasReports = hasPermission('reports') || hasPermission('reports-sales') || hasPermission('reports-materials');
  const hasSettingsGroup = hasPermission('settings') || hasFullAccess;

  const isSummaryActive = activeMenu === 'reports-sales-summary' || 
                          (activeMenu === 'reports-sales' && activeSalesSection === 'products') || 
                          (activeMenu === 'reports' && (activeReportTab === 'sales' ? activeSalesSection === 'products' : false));

  const isTransactionsActive = activeMenu === 'reports-sales-transactions' || 
                              (activeMenu === 'reports-sales' && activeSalesSection === 'transactions') || 
                              (activeMenu === 'reports' && activeReportTab === 'sales' && activeSalesSection === 'transactions');

  const isMaterialsActive = activeMenu === 'reports-materials' || 
                            (activeMenu === 'reports' && activeReportTab === 'materials');

  const handleSelectMenu = (menuKey) => {
    setActiveMenu(menuKey);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop Blur Overlay */}
      {isMobileMenuOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-label="Tutup menu navigasi"
        />
      )}

      <aside
        className={`app-sidebar ${isMobileMenuOpen ? 'sidebar-open' : ''}`}
        style={styles.sidebar}
      >
        {/* Brand Header */}
        <div style={styles.brandContainer}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
            {settings.logo ? (
              <div style={{ ...styles.logoBadge, backgroundColor: '#ffffff', border: '1px solid var(--border-color)', padding: '2px', overflow: 'hidden' }}>
                <img src={settings.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            ) : (
              <div style={styles.logoBadge}>
                <Sparkles size={20} color="#FFFFFF" />
              </div>
            )}
            <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
              <div style={styles.brandTitle} title={settings.appName || settings.storeName}>
                {settings.appName || settings.storeName || 'XCrepes POS'}
              </div>
              <div style={styles.brandSubtitle} title={settings.storeTagline}>
                {settings.storeTagline || 'Sistem Kasir & POS'}
              </div>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            className="mobile-close-btn"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Tutup menu"
            style={styles.closeBtn}
          >
            <X size={20} color="var(--neutral-600)" />
          </button>
        </div>

        {/* Nav List */}
        <nav style={styles.navSection}>
          {/* Kasir & Transaksi */}
          {hasSales && (
            <>
              <div style={styles.navGroupLabel}>PENJUALAN & KASIR</div>
              <div style={styles.navList}>
                <button
                  className={`sidebar-nav-btn ${activeMenu === 'kasir' ? 'is-active' : ''}`}
                  style={{
                    ...styles.navButton,
                    ...(activeMenu === 'kasir' ? styles.navButtonActive : {})
                  }}
                  onClick={() => handleSelectMenu('kasir')}
                  title="Kasir POS"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, overflow: 'hidden' }}>
                    <ShoppingBag size={18} color={activeMenu === 'kasir' ? 'var(--blue-500)' : 'var(--neutral-500)'} style={{ flexShrink: 0 }} />
                    <span style={{ fontWeight: activeMenu === 'kasir' ? 700 : 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                      Kasir POS
                    </span>
                  </div>
                </button>
              </div>
            </>
          )}

          {/* Master Data */}
          {hasMasterData && (
            <>
              <div style={{ ...styles.navGroupLabel, marginTop: '20px' }}>MASTER DATA</div>
              <div style={styles.navList}>
                {/* 1. Satuan Ukur Menu */}
                {hasPermission('unit') && (
                  <button
                    className={`sidebar-nav-btn ${activeMenu === 'unit' ? 'is-active' : ''}`}
                    style={{
                      ...styles.navButton,
                      ...(activeMenu === 'unit' ? styles.navButtonActive : {})
                    }}
                    onClick={() => handleSelectMenu('unit')}
                    title="Satuan Ukur"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, overflow: 'hidden' }}>
                      <Ruler size={18} color={activeMenu === 'unit' ? 'var(--blue-500)' : 'var(--neutral-500)'} style={{ flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                        Satuan Ukur
                      </span>
                    </div>
                    <span style={{ ...(activeMenu === 'unit' ? styles.activeCounterBadge : styles.inactiveCounterBadge), flexShrink: 0 }}>
                      {totalAllUnits}
                    </span>
                  </button>
                )}

                {/* 2. Kategori Produk Menu */}
                {hasPermission('category') && (
                  <button
                    className={`sidebar-nav-btn ${activeMenu === 'category' ? 'is-active' : ''}`}
                    style={{
                      ...styles.navButton,
                      ...(activeMenu === 'category' ? styles.navButtonActive : {})
                    }}
                    onClick={() => handleSelectMenu('category')}
                    title="Kategori Produk"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, overflow: 'hidden' }}>
                      <Layers size={18} color={activeMenu === 'category' ? 'var(--blue-500)' : 'var(--neutral-500)'} style={{ flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                        Kategori Produk
                      </span>
                    </div>
                    <span style={{ ...(activeMenu === 'category' ? styles.activeCounterBadge : styles.inactiveCounterBadge), flexShrink: 0 }}>
                      {totalAllCategories}
                    </span>
                  </button>
                )}

                {/* 3. Data Topping Menu */}
                {hasPermission('topping') && (
                  <button
                    className={`sidebar-nav-btn ${activeMenu === 'topping' ? 'is-active' : ''}`}
                    style={{
                      ...styles.navButton,
                      ...(activeMenu === 'topping' ? styles.navButtonActive : {})
                    }}
                    onClick={() => handleSelectMenu('topping')}
                    title="Data Topping"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, overflow: 'hidden' }}>
                      <Sparkles size={18} color={activeMenu === 'topping' ? 'var(--blue-500)' : 'var(--neutral-500)'} style={{ flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                        Data Topping
                      </span>
                    </div>
                    <span style={{ ...(activeMenu === 'topping' ? styles.activeCounterBadge : styles.inactiveCounterBadge), flexShrink: 0 }}>
                      {totalAllToppings}
                    </span>
                  </button>
                )}

                {/* 4. Menu Produk */}
                {hasPermission('product-menu') && (
                  <button
                    className={`sidebar-nav-btn ${activeMenu === 'product-menu' ? 'is-active' : ''}`}
                    style={{
                      ...styles.navButton,
                      ...(activeMenu === 'product-menu' ? styles.navButtonActive : {})
                    }}
                    onClick={() => handleSelectMenu('product-menu')}
                    title="Menu Produk"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, overflow: 'hidden' }}>
                      <Cookie size={18} color={activeMenu === 'product-menu' ? 'var(--blue-500)' : 'var(--neutral-500)'} style={{ flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                        Menu Produk
                      </span>
                    </div>
                    <span style={{ ...(activeMenu === 'product-menu' ? styles.activeCounterBadge : styles.inactiveCounterBadge), flexShrink: 0 }}>
                      {totalAllMenus}
                    </span>
                  </button>
                )}
              </div>
            </>
          )}

          {/* Inventori & Stok */}
          {hasInventory && (
            <>
              <div style={{ ...styles.navGroupLabel, marginTop: '20px' }}>INVENTORI & STOK</div>
              <div style={styles.navList}>
                {hasPermission('raw-material') && (
                  <button
                    className={`sidebar-nav-btn ${activeMenu === 'raw-material' ? 'is-active' : ''}`}
                    style={{
                      ...styles.navButton,
                      ...(activeMenu === 'raw-material' ? styles.navButtonActive : {})
                    }}
                    onClick={() => handleSelectMenu('raw-material')}
                    title="Stok Bahan Baku"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, overflow: 'hidden' }}>
                      <Package size={18} color={activeMenu === 'raw-material' ? 'var(--blue-500)' : 'var(--neutral-500)'} style={{ flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                        Stok Bahan Baku
                      </span>
                    </div>
                    <span style={{ ...(activeMenu === 'raw-material' ? styles.activeCounterBadge : styles.inactiveCounterBadge), flexShrink: 0 }}>
                      {totalAllRawMaterials}
                    </span>
                  </button>
                )}

                {hasPermission('stock-opname') && (
                  <button
                    className={`sidebar-nav-btn ${activeMenu === 'stock-opname' ? 'is-active' : ''}`}
                    style={{
                      ...styles.navButton,
                      ...(activeMenu === 'stock-opname' ? styles.navButtonActive : {})
                    }}
                    onClick={() => handleSelectMenu('stock-opname')}
                    title="Stock Opname"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, overflow: 'hidden' }}>
                      <ClipboardCheck size={18} color={activeMenu === 'stock-opname' ? 'var(--blue-500)' : 'var(--neutral-500)'} style={{ flexShrink: 0 }} />
                      <span style={{ fontWeight: activeMenu === 'stock-opname' ? 700 : 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                        Stock Opname
                      </span>
                    </div>
                  </button>
                )}
              </div>
            </>
          )}

          {/* Retur & Kerusakan */}
          {hasReturns && (
            <>
              <div style={{ ...styles.navGroupLabel, marginTop: '20px' }}>RETUR & WASTE</div>
              <div style={styles.navList}>
                <button
                  className={`sidebar-nav-btn ${activeMenu === 'returns' ? 'is-active' : ''}`}
                  style={{
                    ...styles.navButton,
                    ...(activeMenu === 'returns' ? styles.navButtonActive : {})
                  }}
                  onClick={() => handleSelectMenu('returns')}
                  title="Retur & Kerusakan"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, overflow: 'hidden' }}>
                    <RotateCcw size={18} color={activeMenu === 'returns' ? 'var(--blue-500)' : 'var(--neutral-500)'} style={{ flexShrink: 0 }} />
                    <span style={{ fontWeight: activeMenu === 'returns' ? 700 : 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                      Retur & Kerusakan
                    </span>
                  </div>
                </button>
              </div>
            </>
          )}

          {/* Laporan & Analitik */}
          {hasReports && (
            <>
              <div style={{ ...styles.navGroupLabel, marginTop: '20px' }}>LAPORAN & ANALITIK</div>
              <div style={styles.navList}>
                {/* 1. Summary Penjualan Menu & Topping */}
                {hasPermission('reports-sales') && (
                  <button
                    className={`sidebar-nav-btn ${isSummaryActive ? 'is-active' : ''}`}
                    style={{
                      ...styles.navButton,
                      ...(isSummaryActive ? styles.navButtonActive : {})
                    }}
                    onClick={() => {
                      handleSelectMenu('reports-sales-summary');
                      setActiveReportTab('sales');
                      setActiveSalesSection('products');
                    }}
                    title="Summary Menu & Topping"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, overflow: 'hidden' }}>
                      <Cookie
                        size={18}
                        color={isSummaryActive ? 'var(--blue-500)' : 'var(--neutral-500)'}
                        style={{ flexShrink: 0 }}
                      />
                      <span
                        style={{
                          fontWeight: isSummaryActive ? 700 : 500,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          minWidth: 0
                        }}
                      >
                        Summary Menu & Topping
                      </span>
                    </div>
                  </button>
                )}

                {/* 2. Riwayat Transaksi Penjualan */}
                {hasPermission('reports-sales') && (
                  <button
                    className={`sidebar-nav-btn ${isTransactionsActive ? 'is-active' : ''}`}
                    style={{
                      ...styles.navButton,
                      ...(isTransactionsActive ? styles.navButtonActive : {})
                    }}
                    onClick={() => {
                      handleSelectMenu('reports-sales-transactions');
                      setActiveReportTab('sales');
                      setActiveSalesSection('transactions');
                    }}
                    title="Riwayat Transaksi"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, overflow: 'hidden' }}>
                      <Receipt
                        size={18}
                        color={isTransactionsActive ? 'var(--blue-500)' : 'var(--neutral-500)'}
                        style={{ flexShrink: 0 }}
                      />
                      <span
                        style={{
                          fontWeight: isTransactionsActive ? 700 : 500,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          minWidth: 0
                        }}
                      >
                        Riwayat Transaksi
                      </span>
                    </div>
                  </button>
                )}

                {/* 3. Laporan Pengurangan Bahan Baku */}
                {hasPermission('reports-materials') && (
                  <button
                    className={`sidebar-nav-btn ${isMaterialsActive ? 'is-active' : ''}`}
                    style={{
                      ...styles.navButton,
                      ...(isMaterialsActive ? styles.navButtonActive : {})
                    }}
                    onClick={() => {
                      handleSelectMenu('reports-materials');
                      setActiveReportTab('materials');
                    }}
                    title="Pengurangan Bahan Baku"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, overflow: 'hidden' }}>
                      <Package
                        size={18}
                        color={isMaterialsActive ? 'var(--blue-500)' : 'var(--neutral-500)'}
                        style={{ flexShrink: 0 }}
                      />
                      <span
                        style={{
                          fontWeight: isMaterialsActive ? 700 : 500,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          minWidth: 0
                        }}
                      >
                        Pengurangan Bahan Baku
                      </span>
                    </div>
                  </button>
                )}
              </div>
            </>
          )}

          {/* Pengaturan & Sistem */}
          {hasSettingsGroup && (
            <>
              <div style={{ ...styles.navGroupLabel, marginTop: '20px' }}>PENGATURAN & SISTEM</div>
              <div style={styles.navList}>
                {hasPermission('settings') && (
                  <button
                    className={`sidebar-nav-btn ${activeMenu === 'settings' ? 'is-active' : ''}`}
                    style={{
                      ...styles.navButton,
                      ...(activeMenu === 'settings' ? styles.navButtonActive : {})
                    }}
                    onClick={() => handleSelectMenu('settings')}
                    title="Pengaturan Struk & Toko"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, overflow: 'hidden' }}>
                      <Sliders size={18} color={activeMenu === 'settings' ? 'var(--blue-500)' : 'var(--neutral-500)'} style={{ flexShrink: 0 }} />
                      <span style={{ fontWeight: activeMenu === 'settings' ? 700 : 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                        Pengaturan Struk & Toko
                      </span>
                    </div>
                  </button>
                )}

                {/* Menu Kelola Akun & Hak Akses (Super Admin & Kepala Toko) */}
                {hasFullAccess && (
                  <button
                    className={`sidebar-nav-btn ${activeMenu === 'cashier-management' ? 'is-active' : ''}`}
                    style={{
                      ...styles.navButton,
                      ...(activeMenu === 'cashier-management' ? styles.navButtonActive : {})
                    }}
                    onClick={() => handleSelectMenu('cashier-management')}
                    title="Kelola Akun & Hak Akses"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, overflow: 'hidden' }}>
                      <Users size={18} color={activeMenu === 'cashier-management' ? 'var(--blue-500)' : 'var(--neutral-500)'} style={{ flexShrink: 0 }} />
                      <span style={{ fontWeight: activeMenu === 'cashier-management' ? 700 : 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                        Kelola Akun & Akses
                      </span>
                    </div>
                    <span style={{ ...(activeMenu === 'cashier-management' ? styles.activeCounterBadge : styles.inactiveCounterBadge), flexShrink: 0 }}>
                      {cashiers.length}
                    </span>
                  </button>
                )}
              </div>
            </>
          )}
        </nav>

        {/* User Session Footer with Quick Logout */}
        <div style={styles.sidebarFooter}>
          <div style={styles.userCardFooter}>
            <div style={styles.userCardAvatar}>
              {isSuperAdmin ? (
                <ShieldCheck size={18} color="#005BC6" />
              ) : isStoreAdmin ? (
                <ShieldCheck size={18} color="#6d28d9" />
              ) : (
                <User size={18} color="#00823F" />
              )}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={styles.userCardName} title={currentUser?.nama}>
                {currentUser?.nama || 'Pengguna'}
              </div>
              <div style={styles.userCardRole}>
                {isSuperAdmin ? (
                  <span style={styles.roleTagSuperAdmin}>SUPER ADMIN</span>
                ) : isStoreAdmin ? (
                  <span style={{ 
                    ...styles.roleTagSuperAdmin, 
                    backgroundColor: '#ede9fe', 
                    color: '#6d28d9', 
                    borderColor: '#ddd6fe' 
                  }}>
                    KEPALA TOKO
                  </span>
                ) : (
                  <span style={styles.roleTagCashier}>KASIR POS</span>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {isSuperAdmin && (
                <button
                  type="button"
                  className="sidebar-profile-icon-btn"
                  style={styles.profileBtn}
                  onClick={openProfileModal}
                  title="Konfigurasi Profil & Sandi Super Admin"
                >
                  <KeyRound size={15} color="var(--blue-600)" />
                </button>
              )}
              <button
                type="button"
                className="sidebar-logout-icon-btn"
                style={styles.logoutBtn}
                onClick={logout}
                title="Keluar dari sistem (Logout)"
              >
                <LogOut size={16} color="var(--red-500)" />
              </button>
            </div>
          </div>
        </div>



        <style>{`
          .sidebar-nav-btn {
            border: none !important;
          }
          .sidebar-nav-btn:hover:not(.is-active) {
            background-color: var(--neutral-100) !important;
            color: var(--neutral-900) !important;
          }
          .sidebar-nav-btn.is-active {
            background-color: var(--blue-50) !important;
            color: var(--blue-600) !important;
            border: 1px solid var(--blue-200) !important;
          }
          .sidebar-subnav-btn {
            border: none !important;
          }
          .sidebar-subnav-btn:hover:not(.is-sub-active) {
            background-color: var(--neutral-100) !important;
            color: var(--neutral-900) !important;
          }
          .sidebar-subnav-btn.is-sub-active {
            background-color: var(--blue-50) !important;
            color: var(--blue-700) !important;
          }
          .sidebar-nav-btn.is-active {
            border: 1px solid var(--blue-200) !important;
          }
          .sidebar-profile-icon-btn:hover {
            background-color: var(--blue-100) !important;
            border-color: var(--blue-300) !important;
          }
          .sidebar-logout-icon-btn:hover {
            background-color: var(--red-50) !important;
            border-color: var(--red-200) !important;
          }
          .mobile-close-btn {
            display: none;
          }
          @media (max-width: 1024px) {
            .app-sidebar {
              transform: translateX(-100%);
              transition: transform var(--transition-smooth);
              box-shadow: var(--shadow-modal);
              z-index: 1000 !important;
            }
            .app-sidebar.sidebar-open {
              transform: translateX(0);
            }
            .mobile-close-btn {
              display: flex;
            }
          }
        `}</style>
      </aside>
    </>
  );
};

const styles = {
  sidebar: {
    position: 'fixed',
    top: 0,
    bottom: 0,
    left: 0,
    width: 'var(--sidebar-width)',
    backgroundColor: 'var(--bg-surface)',
    borderRight: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 100
  },
  brandContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 20px 16px',
    borderBottom: '1px solid var(--border-subtle)'
  },
  logoBadge: {
    width: '38px',
    height: '38px',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--blue-500)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0, 114, 255, 0.35)',
    flexShrink: 0
  },
  brandTitle: {
    fontSize: '1.125rem',
    fontWeight: 800,
    color: 'var(--neutral-900)',
    letterSpacing: '-0.02em',
    lineHeight: 1.2
  },
  brandSubtitle: {
    fontSize: '0.688rem',
    color: 'var(--neutral-500)',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.04em'
  },
  closeBtn: {
    width: '36px',
    height: '36px',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--neutral-100)',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  },
  navSection: {
    flex: 1,
    padding: '20px 14px',
    overflowY: 'auto'
  },
  navGroupLabel: {
    fontSize: '0.688rem',
    fontWeight: 700,
    color: 'var(--neutral-400)',
    letterSpacing: '0.08em',
    padding: '0 12px 10px',
    textTransform: 'uppercase'
  },
  navList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  navButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 14px',
    borderRadius: 'var(--radius-md)',
    color: 'var(--neutral-700)',
    fontSize: '0.875rem',
    fontWeight: 500,
    transition: 'all var(--transition-fast)',
    border: 'none',
    outline: 'none',
    textAlign: 'left',
    width: '100%',
    minHeight: '44px',
    backgroundColor: 'transparent'
  },
  navButtonActive: {
    backgroundColor: 'var(--blue-50)',
    color: 'var(--blue-600)',
    border: '1px solid var(--blue-200)',
    fontWeight: 700
  },
  submenuContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
    marginLeft: '18px',
    paddingLeft: '12px',
    borderLeft: '2px solid var(--neutral-200)',
    marginTop: '4px',
    marginBottom: '6px'
  },
  subnavButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '8px 10px',
    borderRadius: '6px',
    fontSize: '0.813rem',
    fontWeight: 500,
    color: 'var(--neutral-600)',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all var(--transition-fast)'
  },
  subnavButtonActive: {
    backgroundColor: 'var(--blue-50)',
    color: 'var(--blue-700)',
    fontWeight: 700
  },
  subCountBadge: {
    fontSize: '0.688rem',
    fontWeight: 700,
    padding: '1px 6px',
    borderRadius: '10px',
    backgroundColor: 'var(--neutral-100)',
    color: 'var(--neutral-600)'
  },
  subCountBadgeActive: {
    fontSize: '0.688rem',
    fontWeight: 700,
    padding: '1px 6px',
    borderRadius: '10px',
    backgroundColor: 'var(--blue-500)',
    color: '#ffffff'
  },
  activeCounterBadge: {
    fontSize: '0.688rem',
    fontWeight: 700,
    backgroundColor: 'var(--blue-500)',
    color: '#FFFFFF',
    padding: '2px 8px',
    borderRadius: 'var(--radius-full)'
  },
  inactiveCounterBadge: {
    fontSize: '0.688rem',
    fontWeight: 600,
    backgroundColor: 'var(--neutral-100)',
    color: 'var(--neutral-600)',
    padding: '2px 8px',
    borderRadius: 'var(--radius-full)'
  },
  comingSoonBadge: {
    fontSize: '0.625rem',
    fontWeight: 600,
    color: 'var(--neutral-400)',
    backgroundColor: 'var(--neutral-100)',
    padding: '2px 6px',
    borderRadius: 'var(--radius-sm)'
  },
  resetNavBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 14px',
    borderRadius: 'var(--radius-md)',
    color: 'var(--neutral-600)',
    fontSize: '0.813rem',
    fontWeight: 500,
    cursor: 'pointer',
    width: '100%',
    minHeight: '44px',
    transition: 'all var(--transition-fast)',
    backgroundColor: 'var(--neutral-50)',
    border: 'none'
  },
  sidebarFooter: {
    padding: '14px 16px',
    borderTop: '1px solid var(--border-subtle)',
    backgroundColor: 'var(--neutral-50)'
  },
  userCardFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    minWidth: 0
  },
  userCardAvatar: {
    width: '34px',
    height: '34px',
    borderRadius: '10px',
    backgroundColor: '#FFFFFF',
    border: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'var(--shadow-xs)',
    flexShrink: 0
  },
  userCardName: {
    fontSize: '0.813rem',
    fontWeight: 700,
    color: 'var(--neutral-900)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  userCardRole: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '2px'
  },
  roleTagSuperAdmin: {
    fontSize: '0.625rem',
    fontWeight: 800,
    letterSpacing: '0.04em',
    color: 'var(--blue-700)',
    backgroundColor: 'var(--blue-100)',
    padding: '1px 6px',
    borderRadius: '4px'
  },
  roleTagCashier: {
    fontSize: '0.625rem',
    fontWeight: 800,
    letterSpacing: '0.04em',
    color: 'var(--green-700)',
    backgroundColor: 'var(--green-100)',
    padding: '1px 6px',
    borderRadius: '4px'
  },
  profileBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    border: '1px solid var(--blue-200)',
    backgroundColor: 'var(--blue-50)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'all var(--transition-fast)'
  },
  logoutBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    backgroundColor: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'all var(--transition-fast)'
  },
  versionBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'var(--blue-50)',
    border: '1px solid var(--blue-100)',
    borderRadius: 'var(--radius-md)',
    padding: '8px 12px',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--blue-700)'
  }
};

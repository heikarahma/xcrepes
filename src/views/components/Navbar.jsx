import React, { useState, useEffect, useRef } from 'react';
import { useUnit } from '../../controllers/UnitController';
import { useSettings } from '../../controllers/SettingsController';
import { useAuth } from '../../controllers/AuthController';
import { hasAdminPrivileges, isStoreAdminRole } from '../../models/UserModel';
import { 
  Clock, 
  User, 
  ChevronRight, 
  ChevronDown,
  Layers, 
  Ruler, 
  Package, 
  Menu, 
  Sparkles, 
  ShoppingBag, 
  Cookie, 
  Receipt,
  Sliders, 
  BarChart3,
  TrendingUp,
  Users,
  ShieldCheck,
  KeyRound,
  LogOut,
  RotateCcw,
  ClipboardCheck
} from 'lucide-react';

export const Navbar = () => {
  const { activeMenu, isMobileMenuOpen, setIsMobileMenuOpen } = useUnit();
  const { settings } = useSettings();
  const { currentUser, openProfileModal, logout } = useAuth();
  const [time, setTime] = useState(new Date());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isSuperAdmin = currentUser?.role === 'superadmin';
  const isStoreAdmin = isStoreAdminRole(currentUser?.role);
  const hasFullAccess = hasAdminPrivileges(currentUser?.role);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const formattedTime = time.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const getModuleInfo = () => {
    switch (activeMenu) {
      case 'kasir':
        return { group: 'Penjualan & Kasir', title: 'Kasir POS (Buat Pesanan)', icon: ShoppingBag };
      case 'product-menu':
        return { group: 'Master Data', title: 'Menu Produk', icon: Cookie };
      case 'category':
        return { group: 'Master Data', title: 'Kategori Produk', icon: Layers };
      case 'topping':
        return { group: 'Master Data', title: 'Data Topping', icon: Sparkles };
      case 'raw-material':
        return { group: 'Inventori & Stok', title: 'Stok Bahan Baku', icon: Package };
      case 'stock-opname':
        return { group: 'Inventori & Stok', title: 'Stock Opname', icon: ClipboardCheck };
      case 'returns':
        return { group: 'Retur & Kerusakan', title: 'Pusat Retur & Waste', icon: RotateCcw };
      case 'reports':
      case 'reports-sales':
      case 'reports-sales-summary':
        return { group: 'Laporan & Analitik', title: 'Summary Penjualan Menu & Topping', icon: Cookie };
      case 'reports-sales-transactions':
        return { group: 'Laporan & Analitik', title: 'Riwayat Transaksi Penjualan', icon: Receipt };
      case 'reports-materials':
        return { group: 'Laporan & Analitik', title: 'Laporan Pengurangan Bahan Baku', icon: Package };
      case 'settings':
        return { group: 'Pengaturan & Sistem', title: 'Konfigurasi Toko & Struk', icon: Sliders };
      case 'cashier-management':
        return { group: 'Pengaturan & Sistem', title: 'Kelola Akun Kasir & Hak Akses', icon: Users };
      case 'unit':
      default:
        return { group: 'Master Data', title: 'Satuan Ukur', icon: Ruler };
    }
  };

  const moduleInfo = getModuleInfo();
  const appDisplayName = settings.appName || settings.storeName || 'XCrepes POS';

  // Sync browser title and favicon with NAMA APLIKASI & LOGO from Pengaturan Toko
  useEffect(() => {
    document.title = `${appDisplayName} — ${moduleInfo.title}`;

    if (settings.logo) {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = settings.logo;
    }
  }, [appDisplayName, settings.logo, moduleInfo.title]);

  return (
    <header className="app-navbar" style={styles.header}>
      {/* Left Section: Mobile Hamburger + App Brand Page Title (< 1024px only) */}
      <div className="navbar-mobile-brand" style={styles.leftSection}>
        <button
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Buka navigasi menu"
          style={styles.hamburgerBtn}
        >
          <Menu size={20} color="var(--neutral-700)" />
        </button>

        {/* Page Title: Sesuai dengan NAMA APLIKASI (SIDEBAR) & Subtitle Navigasi */}
        <div style={styles.pageTitleWrapper} className="navbar-page-title-wrapper">
          <div style={styles.titleInfoColumn} className="navbar-title-column">
            <span style={styles.pageTitleText} className="navbar-brand-title" title={appDisplayName}>
              {appDisplayName}
            </span>
            <div style={styles.breadcrumbSub} className="navbar-breadcrumb-sub">
              <span className="navbar-breadcrumb-group">{moduleInfo.group}</span>
              <ChevronRight size={11} color="var(--neutral-400)" className="navbar-breadcrumb-sep" style={{ flexShrink: 0 }} />
              <span className="navbar-breadcrumb-title" title={moduleInfo.title}>{moduleInfo.title}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section: Clock & User Profile */}
      <div className="navbar-right-section" style={styles.rightSection}>
        {/* Real-time Clock (Desktop/Tablet) */}
        <div className="navbar-clock" style={styles.clockBox}>
          <Clock size={14} color="var(--blue-500)" />
          <span style={{ fontWeight: 600, fontSize: '0.813rem', color: 'var(--neutral-800)' }}>
            {formattedTime} WIB
          </span>
        </div>

        {/* User Profile Chip with Dropdown */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <div 
            style={{
              ...styles.userChip,
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              borderColor: isDropdownOpen 
                ? (isSuperAdmin ? 'var(--blue-400)' : (isStoreAdmin ? '#a78bfa' : 'var(--green-400)')) 
                : (isSuperAdmin ? 'var(--blue-100)' : (isStoreAdmin ? '#ede9fe' : 'var(--green-100)')),
              backgroundColor: isDropdownOpen 
                ? (isSuperAdmin ? '#e0edff' : (isStoreAdmin ? '#f5f3ff' : '#dcfce7')) 
                : (isSuperAdmin ? 'var(--blue-50)' : (isStoreAdmin ? '#faf5ff' : 'var(--green-50)'))
            }}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            title="Klik untuk membuka menu profil pengguna"
            className={`navbar-user-chip-clickable ${isSuperAdmin ? 'role-superadmin' : (isStoreAdmin ? 'role-storeadmin' : 'role-cashier')}`}
          >
            <div 
              className="navbar-user-avatar"
              style={{
                ...styles.userAvatar,
                backgroundColor: isSuperAdmin ? 'var(--blue-100)' : (isStoreAdmin ? '#ede9fe' : 'var(--green-100)')
              }}
            >
              {isSuperAdmin ? (
                <ShieldCheck size={16} color="var(--blue-600)" />
              ) : isStoreAdmin ? (
                <ShieldCheck size={16} color="#7c3aed" />
              ) : (
                <User size={16} color="var(--green-600)" />
              )}
            </div>
            <div className="navbar-user-info" style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
              <span className="navbar-username" style={{ fontSize: '0.813rem', fontWeight: 700, color: 'var(--neutral-900)' }}>
                {currentUser?.nama || (isSuperAdmin ? 'Super Admin' : (isStoreAdmin ? 'Kepala Toko' : 'Kasir'))}
              </span>
              <span className="navbar-userrole" style={{ 
                fontSize: '0.625rem', 
                fontWeight: 700, 
                color: isSuperAdmin ? 'var(--blue-600)' : (isStoreAdmin ? '#7c3aed' : 'var(--green-600)'),
                letterSpacing: '0.04em'
              }}>
                {isSuperAdmin ? 'SUPER ADMIN' : (isStoreAdmin ? 'KEPALA TOKO' : 'KASIR')}
              </span>
            </div>
            <ChevronDown 
              className="navbar-chevron"
              size={13} 
              color={isSuperAdmin ? 'var(--blue-600)' : (isStoreAdmin ? '#7c3aed' : 'var(--green-600)')} 
              style={{
                marginLeft: '2px',
                transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease'
              }}
            />
          </div>

          {/* Dropdown Menu Popup */}
          {isDropdownOpen && (
            <div style={styles.dropdownMenu} className="navbar-user-dropdown">
              {/* User Summary Header */}
              <div style={styles.dropdownHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    ...styles.userAvatar,
                    backgroundColor: isSuperAdmin ? 'var(--blue-100)' : (isStoreAdmin ? '#ede9fe' : 'var(--green-100)'),
                    width: '32px',
                    height: '32px'
                  }}>
                    {isSuperAdmin ? (
                      <ShieldCheck size={17} color="var(--blue-700)" />
                    ) : isStoreAdmin ? (
                      <ShieldCheck size={17} color="#7c3aed" />
                    ) : (
                      <User size={17} color="var(--green-700)" />
                    )}
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--neutral-900)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                      {currentUser?.nama || (isSuperAdmin ? 'Super Admin' : (isStoreAdmin ? 'Kepala Toko' : 'Kasir'))}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--neutral-500)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                      @{currentUser?.username || 'user'}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '8px' }}>
                  <span style={{
                    display: 'inline-block',
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    backgroundColor: isSuperAdmin ? '#e0edff' : (isStoreAdmin ? '#ede9fe' : 'var(--green-50)'),
                    color: isSuperAdmin ? 'var(--blue-700)' : (isStoreAdmin ? '#6d28d9' : 'var(--green-700)'),
                    border: `1px solid ${isSuperAdmin ? '#bdd7ff' : (isStoreAdmin ? '#ddd6fe' : 'var(--green-200)')}`
                  }}>
                    {isSuperAdmin ? 'SUPER ADMIN (Akses Penuh)' : (isStoreAdmin ? 'KEPALA TOKO (Akses Penuh)' : 'KASIR POS')}
                  </span>
                </div>
              </div>

              <div style={styles.dropdownDivider} />

              {/* Menu Actions */}
              <div style={{ padding: '6px' }}>
                {isSuperAdmin && (
                  <button
                    type="button"
                    className="navbar-dropdown-item"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      openProfileModal();
                    }}
                  >
                    <KeyRound size={15} color="var(--blue-600)" />
                    <span>Ubah Profil</span>
                  </button>
                )}

                <button
                  type="button"
                  className="navbar-dropdown-item navbar-dropdown-logout"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    logout();
                  }}
                >
                  <LogOut size={15} color="var(--red-500)" />
                  <span>Keluar</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .navbar-user-chip-clickable.role-superadmin:hover {
          background-color: #e0edff !important;
          border-color: var(--blue-300) !important;
        }

        .navbar-user-chip-clickable.role-cashier:hover {
          background-color: #dcfce7 !important;
          border-color: var(--green-300) !important;
        }

        .navbar-dropdown-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          border: none;
          background: transparent;
          font-size: 13px;
          font-weight: 500;
          color: var(--neutral-700);
          border-radius: 8px;
          cursor: pointer;
          transition: all var(--transition-fast);
          text-align: left;
        }

        .navbar-dropdown-item:hover {
          background-color: var(--blue-50);
          color: var(--blue-700);
        }

        .navbar-dropdown-logout {
          color: var(--red-600) !important;
        }

        .navbar-dropdown-logout:hover {
          background-color: var(--red-50) !important;
          color: var(--red-700) !important;
        }

        @keyframes dropdownFadeIn {
          from {
            opacity: 0;
            transform: translateY(-6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Breadcrumb default styles */
        .navbar-breadcrumb-group {
          color: var(--neutral-500);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex-shrink: 1;
        }

        .navbar-breadcrumb-title {
          color: var(--blue-600);
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex-shrink: 0;
        }

        /* Layar 1025px ke atas: Sembunyikan hamburger & brand di navbar */
        @media (min-width: 1025px) {
          .navbar-mobile-brand {
            display: none !important;
          }
          .mobile-menu-btn {
            display: none !important;
          }
        }

        /* Layar 1024px ke bawah (Tablet & Mobile): Tampilkan hamburger, sembunyikan jam */
        @media (max-width: 1024px) {
          .navbar-mobile-brand {
            display: flex !important;
          }
          .mobile-menu-btn {
            display: inline-flex !important;
          }
          .navbar-clock {
            display: none !important;
          }
        }

        /* Layar 768px ke bawah (Mobile/Tablet kecil): */
        @media (max-width: 768px) {
          .app-navbar {
            padding: 0 12px !important;
          }
          .navbar-user-info {
            display: none !important;
          }
          .navbar-chevron {
            display: none !important;
          }
          .navbar-user-chip-clickable {
            width: 36px !important;
            height: 36px !important;
            min-width: 36px !important;
            max-width: 36px !important;
            padding: 0 !important;
            border-radius: 50% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08) !important;
            cursor: pointer !important;
            flex-shrink: 0 !important;
            margin: 0 !important;
          }
          .navbar-user-chip-clickable.role-superadmin {
            border: 1.5px solid var(--blue-200) !important;
            background-color: var(--blue-50) !important;
          }
          .navbar-user-chip-clickable.role-cashier {
            border: 1.5px solid var(--green-200) !important;
            background-color: var(--green-50) !important;
          }
          .navbar-user-chip-clickable:active {
            transform: scale(0.93);
          }
          .navbar-user-avatar {
            width: 100% !important;
            height: 100% !important;
            border-radius: 50% !important;
            background-color: transparent !important;
            box-shadow: none !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          .navbar-user-avatar svg {
            width: 18px !important;
            height: 18px !important;
          }
          .navbar-user-chip-clickable.role-superadmin .navbar-user-avatar svg {
            color: var(--blue-600) !important;
          }
          .navbar-user-chip-clickable.role-cashier .navbar-user-avatar svg {
            color: var(--green-600) !important;
          }
          .navbar-user-dropdown {
            right: 0 !important;
            top: calc(100% + 8px) !important;
            width: 220px !important;
          }
        }

        /* Layar 640px ke bawah (Mobile Phone): Sembunyikan kategori group agar judul modul tampil bersih tanpa tumpang tindih */
        @media (max-width: 640px) {
          .app-navbar {
            padding: 0 10px !important;
          }
          .navbar-breadcrumb-group,
          .navbar-breadcrumb-sep {
            display: none !important;
          }
          .navbar-breadcrumb-title {
            font-size: 0.72rem !important;
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
          }
          .navbar-right-section {
            margin-left: 8px !important;
          }
        }

        .navbar-right-section {
          margin-left: auto !important;
          display: flex !important;
          align-items: center !important;
          flex-shrink: 0 !important;
        }
      `}</style>
    </header>
  );
};

const styles = {
  header: {
    height: 'var(--header-height)',
    backgroundColor: 'var(--bg-surface)',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    position: 'sticky',
    top: 0,
    zIndex: 90,
    boxShadow: 'var(--shadow-xs)',
    width: '100%',
    boxSizing: 'border-box'
  },
  leftSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    minWidth: 0,
    flex: '1 1 auto',
    overflow: 'hidden'
  },
  hamburgerBtn: {
    width: '36px',
    height: '36px',
    minWidth: '36px',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--neutral-100)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    border: 'none',
    transition: 'all var(--transition-fast)',
    flexShrink: 0
  },
  pageTitleWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    minWidth: 0,
    flex: '1 1 auto',
    overflow: 'hidden'
  },
  logoBadge: {
    width: '34px',
    height: '34px',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-color)',
    padding: '2px',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'var(--shadow-xs)',
    flexShrink: 0
  },
  logoBadgeFallback: {
    width: '34px',
    height: '34px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, var(--blue-500) 0%, var(--blue-600) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'var(--shadow-xs)',
    flexShrink: 0
  },
  logoImg: {
    width: '100%',
    height: '100%',
    objectFit: 'contain'
  },
  titleInfoColumn: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    minWidth: 0,
    flex: '1 1 auto',
    overflow: 'hidden'
  },
  pageTitleText: {
    fontWeight: 700,
    fontSize: '0.938rem', // 15px
    color: 'var(--neutral-900)',
    letterSpacing: '-0.01em',
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'block'
  },
  breadcrumbSub: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.75rem', // 12px
    color: 'var(--neutral-500)',
    lineHeight: 1.2,
    marginTop: '2px',
    whiteSpace: 'nowrap',
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexShrink: 0,
    marginLeft: 'auto'
  },
  clockBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'var(--neutral-50)',
    border: '1px solid var(--border-color)',
    padding: '5px 12px',
    borderRadius: 'var(--radius-full)'
  },
  userChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '4px 10px 4px 6px',
    backgroundColor: 'var(--blue-50)',
    borderRadius: 'var(--radius-full)',
    border: '1px solid var(--blue-100)'
  },
  userAvatar: {
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    backgroundColor: 'var(--neutral-white)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
  },
  dropdownMenu: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    width: '220px',
    backgroundColor: 'var(--bg-surface)',
    borderRadius: '12px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
    border: '1px solid var(--border-color)',
    zIndex: 100,
    overflow: 'hidden',
    animation: 'dropdownFadeIn 0.15s ease-out'
  },
  dropdownHeader: {
    padding: '12px 14px 10px 14px',
    backgroundColor: 'var(--neutral-50)'
  },
  dropdownDivider: {
    height: '1px',
    backgroundColor: 'var(--border-color)',
    margin: '0'
  }
};

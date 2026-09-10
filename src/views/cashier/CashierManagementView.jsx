import React from 'react';
import { useAuth } from '../../controllers/AuthController';
import { useUnit } from '../../controllers/UnitController';
import { TableSkeleton } from '../components/LoadingSkeleton';
import { ErrorAlert } from '../components/ErrorAlert';
import { 
  Users, 
  UserPlus, 
  Search, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  Trash2, 
  Sliders,
  Calendar
} from 'lucide-react';

export const CashierManagementView = () => {
  const { 
    cashiers, 
    filteredCashiers, 
    isLoading,
    error,
    refetchCashiers,
    searchTerm, 
    setSearchTerm, 
    openAddCashierModal, 
    openEditCashierModal, 
    openDeleteCashierModal,
    toggleCashierStatus,
    navFeatures,
    superAdminProfile
  } = useAuth();
  const { showToast } = useUnit();

  const formatDate = (isoString) => {
    if (!isoString) return '-';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return isoString;
    }
  };

  const totalActive = cashiers.filter(c => c.isActive !== false).length;

  return (
    <div className="cashier-view-container">
      {/* Page Header */}
      <div className="page-header-flex">
        <div>
          <div className="page-breadcrumb">
            <span>PENGATURAN & SISTEM</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Manajemen Hak Akses Kasir</span>
          </div>
          <h1 className="page-main-title">Kelola Akun Kasir & Hak Akses</h1>
          <p className="page-main-subtitle">
            Buat akun kasir, atur password login, dan batasi fitur yang dapat diakses melalui saklar toggle ON / OFF.
          </p>
        </div>

        <div className="header-action-buttons">
          <button 
            type="button" 
            className="btn btn-primary add-cashier-btn"
            onClick={openAddCashierModal}
          >
            <UserPlus size={18} />
            <span>Tambah Kasir Baru</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="cashier-stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper sa-badge">
            <ShieldCheck size={22} color="#005BC6" />
          </div>
          <div className="stat-info">
            <span className="stat-label">SUPER ADMIN (PERMANEN)</span>
            <div className="stat-value-row">
              <span className="stat-number">{superAdminProfile?.nama || 'Super Admin'}</span>
              <span className="stat-tag sa-tag">Akses Penuh</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper ca-badge">
            <Users size={22} color="#00823F" />
          </div>
          <div className="stat-info">
            <span className="stat-label">TOTAL AKUN KASIR</span>
            <div className="stat-value-row">
              <span className="stat-number">{cashiers.length} Akun</span>
              <span className="stat-tag ca-tag">{totalActive} Aktif</span>
            </div>
            <span className="stat-desc">Dapat login sesuai izin yang diatur</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper ft-badge">
            <Sliders size={22} color="#FF7600" />
          </div>
          <div className="stat-info">
            <span className="stat-label">FITUR SIDENAVBAR TERSEDIA</span>
            <div className="stat-value-row">
              <span className="stat-number">{navFeatures.length} Menu</span>
              <span className="stat-tag ft-tag">Toggle Switch</span>
            </div>
            <span className="stat-desc">Dapat di-toggle ON/OFF untuk tiap kasir</span>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="cashier-table-card">
        {/* Table Toolbar */}
        <div className="table-toolbar">
          <div className="search-box-wrapper">
            <Search size={16} color="var(--neutral-400)" className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Cari kasir berdasarkan nama, username, atau ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                type="button" 
                className="search-clear-btn" 
                onClick={() => setSearchTerm('')}
              >
                &times;
              </button>
            )}
          </div>

          <div className="table-count-label">
            Menampilkan <b>{filteredCashiers.length}</b> akun kasir
          </div>
        </div>

        {error && (
          <div style={{ padding: '0 20px 16px' }}>
            <ErrorAlert 
              title="Gagal Memuat Akun Kasir" 
              message={error} 
              onRetry={refetchCashiers} 
            />
          </div>
        )}

        {isLoading ? (
          <div style={{ padding: '20px' }}>
            <TableSkeleton rows={4} cols={5} />
          </div>
        ) : (
          <>
            {/* 1. Desktop Table View (> 768px) */}
            <div className="table-responsive desktop-table-wrapper">
          <table className="cashier-table">
            <thead>
              <tr>
                <th style={{ width: '110px' }}>ID KASIR</th>
                <th>NAMA KASIR</th>
                <th style={{ textAlign: 'center', width: '130px' }}>STATUS</th>
                <th style={{ width: '170px' }}>TANGGAL DIBUAT</th>
                <th style={{ textAlign: 'center', width: '110px' }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {filteredCashiers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-table-cell">
                    <div className="empty-state-box">
                      <Users size={38} color="var(--neutral-300)" />
                      <p className="empty-text">
                        {searchTerm ? `Tidak ditemukan kasir dengan kata kunci "${searchTerm}"` : 'Belum ada akun kasir yang dibuat.'}
                      </p>
                      {searchTerm ? (
                        <button 
                          type="button" 
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSearchTerm('')}
                        >
                          Reset Pencarian
                        </button>
                      ) : (
                        <button 
                          type="button" 
                          className="btn btn-primary btn-sm"
                          onClick={openAddCashierModal}
                        >
                          <UserPlus size={16} />
                          <span>Buat Kasir Pertama</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCashiers.map((c) => {
                  return (
                    <tr key={c.id}>
                      {/* ID */}
                      <td>
                        <span className="cashier-id-badge">{c.id}</span>
                      </td>

                      {/* Nama */}
                      <td>
                        <div className="cashier-name-cell">
                          <div className="avatar-circle">
                            {c.nama ? c.nama.charAt(0).toUpperCase() : 'K'}
                          </div>
                          <div className="name-details">
                            <span className="cashier-full-name">{c.nama}</span>
                            <span className="cashier-role-label">@{c.username || 'user'} • Role: Kasir POS</span>
                          </div>
                        </div>
                      </td>

                      {/* Status Toggle */}
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className={`status-chip-btn ${c.isActive !== false ? 'status-active' : 'status-inactive'}`}
                          onClick={() => {
                            toggleCashierStatus(c.id);
                            const nextState = c.isActive === false;
                            showToast(
                              `Akun kasir "${c.nama}" berhasil di${nextState ? 'aktifkan' : 'nonaktifkan'}.`,
                              nextState ? 'success' : 'info',
                              'Status Akun Diubah'
                            );
                          }}
                          title="Klik untuk mengaktifkan / menonaktifkan kasir"
                        >
                          {c.isActive !== false ? (
                            <>
                              <CheckCircle2 size={13} />
                              <span>Aktif</span>
                            </>
                          ) : (
                            <>
                              <XCircle size={13} />
                              <span>Nonaktif</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Tanggal Dibuat */}
                      <td>
                        <div className="cashier-date-cell">
                          <Calendar size={14} color="var(--neutral-400)" />
                          <span className="cashier-date-text">
                            {formatDate(c.createdAt)}
                          </span>
                        </div>
                      </td>

                      {/* Actions (Edit & Delete) */}
                      <td style={{ textAlign: 'center' }}>
                        <div className="action-btns-row">
                          <button
                            type="button"
                            className="row-action-btn edit-action-btn"
                            onClick={() => openEditCashierModal(c)}
                            title="Edit Akun & Hak Akses"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            type="button"
                            className="row-action-btn delete-action-btn"
                            onClick={() => openDeleteCashierModal(c)}
                            title="Hapus Akun Kasir"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 2. Mobile Cards List View (<= 768px) */}
        <div className="mobile-cashier-cards-wrapper">
          {filteredCashiers.length === 0 ? (
            <div className="empty-state-box mobile-empty-box">
              <Users size={38} color="var(--neutral-300)" />
              <p className="empty-text">
                {searchTerm ? `Tidak ditemukan kasir dengan kata kunci "${searchTerm}"` : 'Belum ada akun kasir yang dibuat.'}
              </p>
              {searchTerm ? (
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSearchTerm('')}
                >
                  Reset Pencarian
                </button>
              ) : (
                <button 
                  type="button" 
                  className="btn btn-primary btn-sm"
                  onClick={openAddCashierModal}
                >
                  <UserPlus size={16} />
                  <span>Buat Kasir Pertama</span>
                </button>
              )}
            </div>
          ) : (
            <div className="mobile-cashier-cards-list">
              {filteredCashiers.map((c) => {
                const userPermissions = Array.isArray(c.permissions) ? c.permissions : [];
                return (
                  <div key={c.id} className="mobile-cashier-card">
                    {/* Header: Avatar, Name, Username, ID, Status Button */}
                    <div className="mobile-card-header">
                      <div className="mobile-card-user-info">
                        <div className="avatar-circle mobile-avatar">
                          {c.nama ? c.nama.charAt(0).toUpperCase() : 'K'}
                        </div>
                        <div className="mobile-user-details">
                          <div className="mobile-user-name-row">
                            <span className="cashier-full-name mobile-title">{c.nama}</span>
                            <span className="cashier-id-badge mobile-badge">{c.id}</span>
                          </div>
                          <span className="mobile-username-sub">@{c.username || 'kasir'} • Role: Kasir POS</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        className={`status-chip-btn mobile-status-btn ${c.isActive !== false ? 'status-active' : 'status-inactive'}`}
                        onClick={() => {
                          toggleCashierStatus(c.id);
                          const nextState = c.isActive === false;
                          showToast(
                            `Akun kasir "${c.nama}" berhasil di${nextState ? 'aktifkan' : 'nonaktifkan'}.`,
                            nextState ? 'success' : 'info',
                            'Status Akun Diubah'
                          );
                        }}
                        title="Klik untuk mengaktifkan / menonaktifkan status kasir"
                      >
                        {c.isActive !== false ? (
                          <>
                            <CheckCircle2 size={13} />
                            <span>Aktif</span>
                          </>
                        ) : (
                          <>
                            <XCircle size={13} />
                            <span>Nonaktif</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Meta & Permissions */}
                    <div className="mobile-card-body">
                      <div className="mobile-meta-row">
                        <div className="mobile-meta-item">
                          <Calendar size={13} color="var(--neutral-400)" />
                          <span>Dibuat: <b>{formatDate(c.createdAt)}</b></span>
                        </div>
                        <div className="mobile-meta-item">
                          <ShieldCheck size={13} color="var(--blue-500)" />
                          <span><b>{userPermissions.length}</b> Hak Akses</span>
                        </div>
                      </div>

                      {userPermissions.length > 0 && (
                        <div className="mobile-permissions-chips">
                          {userPermissions.slice(0, 3).map((permKey) => {
                            const feat = navFeatures.find(f => f.key === permKey);
                            const label = feat ? feat.label.split('(')[0].trim() : permKey;
                            return (
                              <span key={permKey} className="mobile-perm-tag">
                                {label}
                              </span>
                            );
                          })}
                          {userPermissions.length > 3 && (
                            <span className="mobile-perm-more">
                              +{userPermissions.length - 3} lainnya
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions Bar */}
                    <div className="mobile-card-actions">
                      <button
                        type="button"
                        className="mobile-edit-btn"
                        onClick={() => openEditCashierModal(c)}
                      >
                        <Edit3 size={15} />
                        <span>Edit Akun & Hak Akses</span>
                      </button>
                      <button
                        type="button"
                        className="mobile-delete-btn"
                        onClick={() => openDeleteCashierModal(c)}
                        title="Hapus Akun Kasir"
                        aria-label="Hapus Akun Kasir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </>
    )}
      </div>

      <style>{`
        .cashier-view-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding: 24px;
          width: 100%;
          max-width: 100%;
          margin: 0;
        }

        .page-header-flex {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }

        .page-breadcrumb {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.688rem;
          font-weight: 700;
          color: var(--neutral-400);
          letter-spacing: 0.05em;
          margin-bottom: 6px;
        }

        .breadcrumb-separator {
          color: var(--neutral-300);
        }

        .breadcrumb-current {
          color: var(--blue-600);
        }

        .page-main-title {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--neutral-900);
          letter-spacing: -0.02em;
          margin: 0 0 6px 0;
          line-height: 1.2;
        }

        .page-main-subtitle {
          font-size: 0.844rem;
          color: var(--neutral-500);
          margin: 0;
          max-width: 700px;
        }

        .header-action-buttons {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .profile-config-btn {
          height: 44px;
          padding: 0 16px;
          border-radius: var(--radius-md);
          font-weight: 700;
          font-size: 0.844rem;
          color: var(--blue-700);
          background-color: var(--blue-50);
          border: 1px solid var(--blue-200);
        }
        .profile-config-btn:hover {
          background-color: var(--blue-100);
          border-color: var(--blue-300);
        }

        .add-cashier-btn {
          height: 44px;
          padding: 0 20px;
          border-radius: var(--radius-md);
          font-weight: 700;
          font-size: 0.875rem;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        /* Stats Grid */
        .cashier-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        @media (max-width: 1024px) {
          .cashier-stats-grid {
            grid-template-columns: 1fr;
          }
        }

        .stat-card {
          background-color: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 18px 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: var(--shadow-xs);
          transition: all var(--transition-fast);
        }

        .stat-icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .sa-badge {
          background-color: var(--blue-50);
          border: 1px solid var(--blue-100);
        }
        .ca-badge {
          background-color: var(--green-50);
          border: 1px solid var(--green-100);
        }
        .ft-badge {
          background-color: var(--orange-50);
          border: 1px solid var(--orange-100);
        }

        .stat-info {
          display: flex;
          flex-direction: column;
          gap: 3px;
          min-width: 0;
        }

        .stat-label {
          font-size: 0.688rem;
          font-weight: 800;
          color: var(--neutral-400);
          letter-spacing: 0.05em;
        }

        .stat-value-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .stat-number {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--neutral-900);
          line-height: 1.2;
        }

        .stat-tag {
          font-size: 0.688rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 999px;
        }
        .sa-tag {
          background-color: var(--blue-100);
          color: var(--blue-700);
        }
        .ca-tag {
          background-color: var(--green-100);
          color: var(--green-700);
        }
        .ft-tag {
          background-color: var(--orange-100);
          color: var(--orange-700);
        }

        .stat-desc {
          font-size: 0.75rem;
          color: var(--neutral-500);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Table Card */
        .cashier-table-card {
          background-color: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-xs);
          overflow: hidden;
        }

        .table-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-color);
          flex-wrap: wrap;
          gap: 12px;
        }

        .search-box-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
          max-width: 380px;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          pointer-events: none;
        }

        .search-input {
          width: 100%;
          height: 38px;
          padding: 0 32px 0 36px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          background-color: var(--neutral-50);
          font-size: 0.813rem;
          color: var(--neutral-900);
          outline: none;
          transition: all var(--transition-fast);
        }
        .search-input:focus {
          border-color: var(--blue-500);
          background-color: #FFFFFF;
          box-shadow: var(--shadow-focus-ring);
        }

        .search-clear-btn {
          position: absolute;
          right: 8px;
          background: transparent;
          border: none;
          font-size: 1.25rem;
          color: var(--neutral-400);
          cursor: pointer;
          line-height: 1;
        }

        .table-count-label {
          font-size: 0.813rem;
          color: var(--neutral-500);
        }

        /* Table */
        .table-responsive {
          overflow-x: auto;
        }

        .cashier-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.844rem;
        }

        .cashier-table th {
          background-color: var(--neutral-50);
          color: var(--neutral-600);
          font-weight: 700;
          font-size: 0.719rem;
          letter-spacing: 0.04em;
          padding: 12px 18px;
          border-bottom: 1px solid var(--border-color);
          white-space: nowrap;
        }

        .cashier-table td {
          padding: 14px 18px;
          border-bottom: 1px solid var(--border-subtle);
          vertical-align: middle;
        }

        .cashier-table tr:last-child td {
          border-bottom: none;
        }

        .cashier-table tr:hover td {
          background-color: var(--bg-surface-hover);
        }

        .cashier-id-badge {
          font-family: var(--font-family-mono);
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--neutral-700);
          background-color: var(--neutral-100);
          padding: 2px 6px;
          border-radius: 4px;
        }

        .cashier-name-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .avatar-circle {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--blue-500) 0%, var(--blue-700) 100%);
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.875rem;
          flex-shrink: 0;
        }

        .name-details {
          display: flex;
          flex-direction: column;
          line-height: 1.25;
        }

        .cashier-full-name {
          font-weight: 700;
          color: var(--neutral-900);
        }

        .cashier-role-label {
          font-size: 0.719rem;
          color: var(--neutral-400);
        }

        .cashier-date-cell {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--neutral-600);
        }

        .cashier-date-text {
          font-size: 0.813rem;
          color: var(--neutral-600);
          white-space: nowrap;
        }

        /* Status Button */
        .status-chip-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .status-active {
          background-color: var(--green-50);
          color: var(--green-600);
          border: 1px solid var(--green-200);
        }
        .status-active:hover {
          background-color: var(--green-100);
        }

        .status-inactive {
          background-color: var(--red-50);
          color: var(--red-600);
          border: 1px solid var(--red-200);
        }
        .status-inactive:hover {
          background-color: var(--red-100);
        }

        /* Actions */
        .action-btns-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .row-action-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border-color);
          background-color: #FFFFFF;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .edit-action-btn:hover {
          background-color: var(--blue-50);
          border-color: var(--blue-300);
          color: var(--blue-600);
        }

        .delete-action-btn:hover {
          background-color: var(--red-50);
          border-color: var(--red-300);
          color: var(--red-600);
        }

        .empty-table-cell {
          padding: 48px 24px;
          text-align: center;
        }

        .empty-state-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .empty-text {
          font-size: 0.875rem;
          color: var(--neutral-500);
          margin: 0;
        }

        /* Responsive Mobile Specific */
        .mobile-cashier-cards-wrapper {
          display: none;
        }

        @media (max-width: 1024px) {
          .desktop-table-wrapper {
            display: none !important;
          }

          .mobile-cashier-cards-wrapper {
            display: block !important;
          }

          .page-header-flex {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
          }

          .header-action-buttons {
            width: 100% !important;
          }

          .add-cashier-btn {
            width: 100% !important;
            justify-content: center !important;
          }

          .cashier-stats-grid {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }

          .stat-card {
            padding: 14px 16px !important;
          }

          .table-toolbar {
            padding: 14px 16px !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 10px !important;
          }

          .search-box-wrapper {
            max-width: 100% !important;
            width: 100% !important;
          }

          .table-count-label {
            font-size: 0.75rem !important;
          }

          /* Mobile Cards List */
          .mobile-cashier-cards-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
            padding: 14px 16px;
            background-color: var(--neutral-50);
          }

          .mobile-cashier-card {
            background-color: #FFFFFF;
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 14px 14px 12px 14px;
            display: flex;
            flex-direction: column;
            gap: 12px;
            box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
            transition: all var(--transition-fast);
          }

          .mobile-cashier-card:active {
            transform: scale(0.995);
          }

          .mobile-card-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 10px;
          }

          .mobile-card-user-info {
            display: flex;
            align-items: center;
            gap: 10px;
            min-width: 0;
            flex: 1;
          }

          .mobile-avatar {
            width: 38px !important;
            height: 38px !important;
            font-size: 0.938rem !important;
          }

          .mobile-user-details {
            display: flex;
            flex-direction: column;
            min-width: 0;
            flex: 1;
          }

          .mobile-user-name-row {
            display: flex;
            align-items: center;
            gap: 6px;
            flex-wrap: wrap;
          }

          .mobile-title {
            font-size: 0.938rem !important;
            font-weight: 700 !important;
            color: var(--neutral-900) !important;
            line-height: 1.25 !important;
          }

          .mobile-badge {
            font-size: 0.688rem !important;
            padding: 1px 5px !important;
          }

          .mobile-username-sub {
            font-size: 0.75rem;
            color: var(--neutral-500);
            margin-top: 2px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .mobile-status-btn {
            padding: 4px 8px !important;
            font-size: 0.688rem !important;
            flex-shrink: 0 !important;
          }

          .mobile-card-body {
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding: 8px 10px;
            background-color: var(--neutral-50);
            border-radius: 8px;
            border: 1px solid var(--border-subtle);
          }

          .mobile-meta-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 8px;
            font-size: 0.75rem;
            color: var(--neutral-600);
          }

          .mobile-meta-item {
            display: flex;
            align-items: center;
            gap: 5px;
          }

          .mobile-permissions-chips {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: 4px;
          }

          .mobile-perm-tag {
            font-size: 0.688rem;
            font-weight: 600;
            color: var(--blue-700);
            background-color: var(--blue-100);
            padding: 2px 7px;
            border-radius: 6px;
            border: 1px solid var(--blue-200);
            white-space: nowrap;
          }

          .mobile-perm-more {
            font-size: 0.688rem;
            font-weight: 600;
            color: var(--neutral-500);
            background-color: var(--neutral-200);
            padding: 2px 6px;
            border-radius: 6px;
          }

          .mobile-card-actions {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-top: 2px;
          }

          .mobile-edit-btn {
            flex: 1;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            height: 38px;
            padding: 0 12px;
            border-radius: 8px;
            font-size: 0.813rem;
            font-weight: 600;
            background-color: var(--blue-50);
            color: var(--blue-600);
            border: 1px solid var(--blue-200);
            cursor: pointer;
            transition: all var(--transition-fast);
          }
          .mobile-edit-btn:active {
            background-color: var(--blue-100);
          }

          .mobile-delete-btn {
            width: 38px;
            height: 38px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            background-color: var(--red-50);
            color: var(--red-500);
            border: 1px solid var(--red-200);
            cursor: pointer;
            flex-shrink: 0;
            transition: all var(--transition-fast);
          }
          .mobile-delete-btn:active {
            background-color: var(--red-100);
          }

          .mobile-empty-box {
            padding: 36px 16px;
          }
        }
      `}</style>
    </div>
  );
};

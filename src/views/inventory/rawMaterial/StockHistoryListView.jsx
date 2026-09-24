import React from 'react';
import { useRawMaterial } from '../../../controllers/RawMaterialController';
import { useAuth } from '../../../controllers/AuthController';
import { Button } from '../../components/Button';
import { Pagination } from '../../components/Pagination';
import { EmptyState } from '../../components/EmptyState';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import { ErrorAlert } from '../../components/ErrorAlert';
import { 
  History, 
  Search, 
  X, 
  ArrowDownLeft, 
  ArrowUpRight, 
  RefreshCw, 
  User, 
  Clock, 
  PlusCircle, 
  MinusCircle,
  AlertTriangle,
  RotateCcw,
  Camera,
  ZoomIn,
  Layers,
  Calendar,
  FileText
} from 'lucide-react';

export const StockHistoryListView = ({ mobileActionButtons }) => {
  const { currentUser } = useAuth();
  const isCashier = currentUser?.role === 'kasir';

  const {
    stockLogs,
    filteredStockLogs,
    paginatedStockLogs,
    logTotalPages,
    logTotalItems,
    logSearchTerm,
    setLogSearchTerm,
    logTypeFilter,
    setLogTypeFilter,
    logCurrentPage,
    setLogCurrentPage,
    logItemsPerPage,
    setLogItemsPerPage,
    stockLogStats,
    openAdjustModal,
    openWasteModal,
    openPhotoPreviewModal,
    rawMaterials,
    isLoading,
    error,
    refetch
  } = useRawMaterial();

  // Helper format datetime
  const formatDateTime = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) + ' WIB';
    } catch {
      return isoString;
    }
  };

  // Helper type badge
  const renderTypeBadge = (type) => {
    switch (type) {
      case 'IN':
        return (
          <span style={styles.badgeIn}>
            <ArrowDownLeft size={13} style={{ marginRight: '3px' }} /> Stok Masuk
          </span>
        );
      case 'OUT':
        return (
          <span style={styles.badgeOut}>
            <ArrowUpRight size={13} style={{ marginRight: '3px' }} /> Stok Keluar
          </span>
        );
      case 'WASTE':
        return (
          <span style={styles.badgeWaste}>
            <AlertTriangle size={13} style={{ marginRight: '3px' }} /> Bahan Rusak / Expired
          </span>
        );
      case 'RETURN_ORDER':
        return (
          <span style={styles.badgeReturn}>
            <RotateCcw size={13} style={{ marginRight: '3px' }} /> Retur Pesanan Gagal
          </span>
        );
      case 'ADJUST':
      default:
        return (
          <span style={styles.badgeAdjust}>
            <RefreshCw size={12} style={{ marginRight: '3px' }} /> Penyesuaian
          </span>
        );
    }
  };

  return (
    <div className="stock-history-view animate-fade-in">
      {/* 1. Summary Cards */}
      <div className="stock-history-stats-grid" style={styles.statsGrid}>
        {/* Card: Total Log */}
        <div style={styles.statCard}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={styles.statLabel}>Total Aktivitas</span>
            <div style={{ ...styles.statIconWrap, backgroundColor: 'var(--blue-50)', color: 'var(--blue-600)' }}>
              <History size={16} />
            </div>
          </div>
          <div style={{ ...styles.statValue, color: 'var(--neutral-900)' }}>
            {stockLogStats?.total ?? stockLogs?.length ?? 0}
          </div>
          <span style={styles.statSub}>Semua riwayat perubahan</span>
        </div>

        {/* Card: Stok Masuk */}
        <div style={styles.statCard}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={styles.statLabel}>Stok Masuk (Restok)</span>
            <div style={{ ...styles.statIconWrap, backgroundColor: 'var(--green-50)', color: 'var(--green-600)' }}>
              <PlusCircle size={16} />
            </div>
          </div>
          <div style={{ ...styles.statValue, color: 'var(--green-700)' }}>
            {stockLogStats.totalIn}
          </div>
          <span style={styles.statSub}>Penambahan stok</span>
        </div>

        {/* Card: Stok Keluar */}
        <div style={styles.statCard}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={styles.statLabel}>Stok Keluar (Masak)</span>
            <div style={{ ...styles.statIconWrap, backgroundColor: 'var(--red-50)', color: 'var(--red-500)' }}>
              <MinusCircle size={16} />
            </div>
          </div>
          <div style={{ ...styles.statValue, color: 'var(--red-600)' }}>
            {stockLogStats.totalOut}
          </div>
          <span style={styles.statSub}>Pemakaian resep & topping</span>
        </div>

        {/* Card: Waste & Rusak / Expired */}
        <div style={{ ...styles.statCard, borderLeft: '3px solid #ef4444' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={styles.statLabel}>Bahan Rusak / Expired</span>
            <div style={{ ...styles.statIconWrap, backgroundColor: '#fef2f2', color: '#dc2626' }}>
              <AlertTriangle size={16} />
            </div>
          </div>
          <div style={{ ...styles.statValue, color: '#dc2626' }}>
            {stockLogStats.wasteCount || 0}
          </div>
          <span style={styles.statSub}>Waste & retur gagal masak</span>
        </div>

        {/* Card: Penyesuaian Opname */}
        <div style={styles.statCard}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={styles.statLabel}>Penyesuaian Fisik</span>
            <div style={{ ...styles.statIconWrap, backgroundColor: 'var(--neutral-100)', color: 'var(--neutral-700)' }}>
              <RefreshCw size={16} />
            </div>
          </div>
          <div style={styles.statValue}>{stockLogStats.totalAdjust}</div>
          <span style={styles.statSub}>Koreksi stok opname</span>
        </div>
      </div>

      {/* Mobile Action Buttons: Placed below information cards on mobile */}
      {mobileActionButtons && (
        <div className="raw-material-actions-mobile stock-history-mobile-actions">
          {mobileActionButtons}
        </div>
      )}

      {/* 2. Main Table & Toolbar Container */}
      <div className="blue-card stock-history-main-card" style={{ padding: 0 }}>
        {/* Toolbar */}
        <div className="stock-history-toolbar" style={styles.toolbar}>
          {/* Left: Filter Buttons (Hanya untuk Admin/Owner) */}
          {!isCashier && (
            <div className="stock-history-filter-tabs" style={styles.typeFilterTabs}>
              <button
                className={`type-tab-btn ${logTypeFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setLogTypeFilter('ALL')}
                style={{
                  ...styles.typeTabBtn,
                  ...(logTypeFilter === 'ALL' ? styles.typeTabBtnActive : {})
                }}
              >
                Semua ({stockLogs.length})
              </button>
              <button
                className={`type-tab-btn ${logTypeFilter === 'IN' ? 'active' : ''}`}
                onClick={() => setLogTypeFilter('IN')}
                style={{
                  ...styles.typeTabBtn,
                  ...(logTypeFilter === 'IN' ? styles.typeTabBtnActiveIn : {})
                }}
              >
                <ArrowDownLeft size={13} style={{ marginRight: '4px' }} />
                Masuk ({stockLogStats.totalIn})
              </button>
              <button
                className={`type-tab-btn ${logTypeFilter === 'OUT' ? 'active' : ''}`}
                onClick={() => setLogTypeFilter('OUT')}
                style={{
                  ...styles.typeTabBtn,
                  ...(logTypeFilter === 'OUT' ? styles.typeTabBtnActiveOut : {})
                }}
              >
                <ArrowUpRight size={13} style={{ marginRight: '4px' }} />
                Keluar ({stockLogStats.totalOut})
              </button>
              <button
                className={`type-tab-btn ${logTypeFilter === 'WASTE' ? 'active' : ''}`}
                onClick={() => setLogTypeFilter('WASTE')}
                style={{
                  ...styles.typeTabBtn,
                  ...(logTypeFilter === 'WASTE' ? styles.typeTabBtnActiveWaste : {})
                }}
              >
                <AlertTriangle size={13} style={{ marginRight: '4px' }} />
                Bahan Rusak / Waste ({stockLogStats.wasteCount || 0})
              </button>
              <button
                className={`type-tab-btn ${logTypeFilter === 'ADJUST' ? 'active' : ''}`}
                onClick={() => setLogTypeFilter('ADJUST')}
                style={{
                  ...styles.typeTabBtn,
                  ...(logTypeFilter === 'ADJUST' ? styles.typeTabBtnActiveAdjust : {})
                }}
              >
                <RefreshCw size={12} style={{ marginRight: '4px' }} />
                Penyesuaian ({stockLogStats.totalAdjust})
              </button>
            </div>
          )}

          {/* Right: Search Input */}
          <div style={{ ...styles.rightToolbar, justifyContent: isCashier ? 'flex-start' : 'flex-end', minWidth: isCashier ? 'auto' : '240px' }}>
            <div className="stock-history-search-wrap" style={{ ...styles.searchWrapper, maxWidth: isCashier ? '380px' : '320px' }}>
              <Search size={16} color="var(--neutral-400)" style={styles.filterIcon} />
              <input
                type="text"
                className="blue-input"
                style={styles.filterInput}
                placeholder={isCashier ? "Cari riwayat perubahan stok, petugas..." : "Cari riwayat, alasan, petugas..."}
                value={logSearchTerm}
                onChange={(e) => setLogSearchTerm(e.target.value)}
              />
              {logSearchTerm && (
                <button
                  onClick={() => setLogSearchTerm('')}
                  style={styles.clearSearchBtn}
                  title="Hapus pencarian"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div style={{ padding: '0 16px 16px' }}>
            <ErrorAlert 
              title="Gagal Memuat Riwayat Perubahan Stok" 
              message={error} 
              onRetry={refetch} 
            />
          </div>
        )}

        {isLoading ? (
          <div style={{ padding: '16px' }}>
            <TableSkeleton rows={6} cols={isCashier ? 6 : 9} />
          </div>
        ) : (
          <>
            {/* 3. Desktop Table (≥ 768px) */}
            <div className="desktop-history-table-wrapper" style={{ overflowX: 'auto' }}>
          <table className="blue-table">
            <thead>
              <tr>
                <th style={{ width: '50px', textAlign: 'center' }}>No</th>
                <th style={{ width: '150px' }}>Waktu & Tanggal</th>
                <th>Nama Bahan Baku</th>
                <th style={{ width: '150px' }}>Jenis</th>
                <th style={{ width: '120px', textAlign: 'right' }}>Perubahan</th>
                {!isCashier && <th style={{ width: '160px', textAlign: 'center' }}>Alur Stok</th>}
                {!isCashier && <th>Alasan & Catatan</th>}
                {!isCashier && <th style={{ width: '80px', textAlign: 'center' }}>Foto</th>}
                <th style={{ width: '90px', textAlign: 'center' }}>Oleh</th>
              </tr>
            </thead>
            <tbody>
              {paginatedStockLogs.length === 0 ? (
                <tr>
                  <td colSpan={isCashier ? 6 : 9} style={{ padding: 0 }}>
                    <EmptyState
                      icon={History}
                      title={logSearchTerm || logTypeFilter !== 'ALL' ? 'Riwayat Tidak Ditemukan' : 'Belum Ada Riwayat Perubahan'}
                      description={
                        logSearchTerm
                          ? `Tidak ada catatan riwayat dengan kata kunci "${logSearchTerm}".`
                          : logTypeFilter !== 'ALL'
                          ? 'Tidak ada catatan riwayat untuk filter kategori yang dipilih.'
                          : 'Setiap penambahan, pengurangan, atau bahan rusak akan otomatis tercatat di sini.'
                      }
                      actionLabel={logSearchTerm || logTypeFilter !== 'ALL' ? 'Reset Filter' : 'Catat Bahan Rusak'}
                      onAction={
                        (logSearchTerm || logTypeFilter !== 'ALL')
                          ? () => { setLogSearchTerm(''); setLogTypeFilter('ALL'); } 
                          : () => openWasteModal(rawMaterials[0] || null)
                      }
                    />
                  </td>
                </tr>
              ) : (
                paginatedStockLogs.map((log, index) => {
                  const rowNumber = (logCurrentPage - 1) * logItemsPerPage + index + 1;
                  const isPositive = log.type === 'IN';
                  const isNegative = log.type === 'OUT' || log.type === 'WASTE' || log.type === 'RETURN_ORDER';
                  const isWaste = log.type === 'WASTE' || log.type === 'RETURN_ORDER';

                  return (
                    <tr key={log.id}>
                      {/* No */}
                      <td style={{ textAlign: 'center' }}>
                        <span style={styles.rowNumberTag}>#{rowNumber}</span>
                      </td>

                      {/* Waktu */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.781rem', color: 'var(--neutral-600)' }}>
                          <Clock size={12} color="var(--neutral-400)" />
                          <span>{formatDateTime(log.createdAt)}</span>
                        </div>
                      </td>

                      {/* Nama Bahan */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontWeight: 700, color: 'var(--neutral-900)' }}>
                            {log.rawMaterialName}
                          </span>
                          {log.referenceInvoice && (
                            <span style={{ fontSize: '0.688rem', color: 'var(--blue-600)', fontFamily: 'var(--font-family-mono)' }}>
                              #{log.referenceInvoice}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Jenis Perubahan */}
                      <td>
                        {renderTypeBadge(log.type)}
                      </td>

                      {/* Perubahan Qty */}
                      <td style={{ textAlign: 'right' }}>
                        <span
                          style={{
                            fontWeight: 800,
                            fontSize: '0.938rem',
                            color: isPositive ? 'var(--green-700)' : isWaste ? '#dc2626' : isNegative ? 'var(--red-600)' : 'var(--blue-700)'
                          }}
                        >
                          {isPositive ? `+${log.amount}` : `-${log.amount}`}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', marginLeft: '4px' }}>
                          {log.unitName}
                        </span>
                      </td>

                      {/* Alur Stok (Sebelum ➔ Sesudah) */}
                      {!isCashier && (
                        <td style={{ textAlign: 'center' }}>
                          <div style={styles.flowBox}>
                            <span style={{ color: 'var(--neutral-600)', fontWeight: 500 }}>
                              {log.previousStock} {log.unitName}
                            </span>
                            <span style={{ color: 'var(--neutral-400)' }}>➔</span>
                            <span style={{ color: isWaste ? '#dc2626' : 'var(--neutral-900)', fontWeight: 700 }}>
                              {log.currentStock} {log.unitName}
                            </span>
                          </div>
                        </td>
                      )}

                      {/* Keterangan & Alasan */}
                      {!isCashier && (
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            {log.reason && (
                              <span style={styles.reasonTag}>
                                {log.reason}
                              </span>
                            )}
                            <span style={{ fontSize: '0.813rem', color: 'var(--neutral-700)' }}>
                              {log.note || '-'}
                            </span>
                          </div>
                        </td>
                      )}

                      {/* Bukti Foto */}
                      {!isCashier && (
                        <td style={{ textAlign: 'center' }}>
                          {log.photo ? (
                            <div
                              onClick={() => openPhotoPreviewModal(log.photo, `Bukti Foto: ${log.rawMaterialName}`, {
                                rawMaterialName: log.rawMaterialName,
                                amount: log.amount,
                                unitName: log.unitName,
                                reason: log.reason,
                                note: log.note,
                                user: log.user,
                                orderInvoice: log.referenceInvoice,
                                createdAt: formatDateTime(log.createdAt)
                              })}
                              style={styles.thumbnailWrap}
                              title="Klik untuk melihat foto ukuran penuh"
                            >
                              <img src={log.photo} alt="Bukti" style={styles.thumbnailImg} />
                              <div style={styles.thumbnailOverlay}>
                                <ZoomIn size={12} color="#ffffff" />
                              </div>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.688rem', color: 'var(--neutral-400)' }}>-</span>
                          )}
                        </td>
                      )}

                      {/* Oleh / User */}
                      <td style={{ textAlign: 'center' }}>
                        <div style={styles.userBadge}>
                          <User size={12} color="var(--neutral-500)" />
                          <span>{log.user || 'Admin'}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 4. Mobile Card View (< 768px) */}
        <div className="mobile-history-cards-wrapper">
          {paginatedStockLogs.length === 0 ? (
            <EmptyState
              icon={History}
              title={logSearchTerm || logTypeFilter !== 'ALL' ? 'Riwayat Tidak Ditemukan' : 'Belum Ada Riwayat'}
              description={
                logSearchTerm
                  ? `Tidak ada riwayat untuk "${logSearchTerm}".`
                  : logTypeFilter !== 'ALL'
                  ? 'Tidak ada catatan riwayat untuk filter ini.'
                  : 'Catat perubahan stok bahan untuk melihat log.'
              }
              actionLabel={logSearchTerm || logTypeFilter !== 'ALL' ? 'Reset Filter' : 'Catat Stok'}
              onAction={
                (logSearchTerm || logTypeFilter !== 'ALL')
                  ? () => { setLogSearchTerm(''); setLogTypeFilter('ALL'); } 
                  : () => openWasteModal(rawMaterials[0] || null)
              }
            />
          ) : (
            <div style={styles.mobileCardsList}>
              {paginatedStockLogs.map((log, index) => {
                const rowNumber = (logCurrentPage - 1) * logItemsPerPage + index + 1;
                const isPositive = log.type === 'IN';
                const isWaste = log.type === 'WASTE' || log.type === 'RETURN_ORDER';
                const borderAccent = isPositive ? 'var(--green-500)' : isWaste ? '#ef4444' : 'var(--red-500)';

                return (
                  <div
                    key={log.id}
                    style={{
                      ...styles.mobileLogCard,
                      borderLeft: `4px solid ${borderAccent}`
                    }}
                  >
                    {/* Top Row: No, Material Name, Qty Change */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={styles.rowNumberTag}>#{rowNumber}</span>
                        <span style={{ fontWeight: 700, fontSize: '0.938rem', color: 'var(--neutral-900)' }}>
                          {log.rawMaterialName}
                        </span>
                      </div>

                      <span
                        style={{
                          fontWeight: 800,
                          fontSize: '1rem',
                          color: isPositive ? 'var(--green-700)' : isWaste ? '#dc2626' : 'var(--red-600)'
                        }}
                      >
                        {isPositive ? `+${log.amount}` : `-${log.amount}`} {log.unitName}
                      </span>
                    </div>

                    {/* Middle Row: Type Badge + Alur Stok */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                      <div>{renderTypeBadge(log.type)}</div>
                      {!isCashier && (
                        <div style={styles.mobileFlowBox}>
                          <span>{log.previousStock}</span>
                          <span>➔</span>
                          <strong style={{ color: isWaste ? '#dc2626' : undefined }}>{log.currentStock} {log.unitName}</strong>
                        </div>
                      )}
                    </div>

                    {/* Alasan & Catatan */}
                    {!isCashier && (log.reason || log.note) && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', backgroundColor: '#f8fafc', padding: '6px 8px', borderRadius: '4px' }}>
                        {log.reason && (
                          <span style={{ fontSize: '0.688rem', fontWeight: 700, color: '#dc2626' }}>
                            • {log.reason}
                          </span>
                        )}
                        {log.note && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--neutral-600)' }}>
                            {log.note}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Bottom Row: Photo Preview Button & Timestamp */}
                    <div style={styles.mobileBottomMeta}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.719rem', color: 'var(--neutral-500)' }}>
                        <Clock size={11} />
                        <span>{formatDateTime(log.createdAt)}</span>
                        <span>•</span>
                        <span>{log.user || 'Admin'}</span>
                      </div>

                      {!isCashier && log.photo && (
                        <button
                          type="button"
                          onClick={() => openPhotoPreviewModal(log.photo, `Bukti Foto: ${log.rawMaterialName}`, {
                            rawMaterialName: log.rawMaterialName,
                            amount: log.amount,
                            unitName: log.unitName,
                            reason: log.reason,
                            note: log.note,
                            user: log.user,
                            orderInvoice: log.referenceInvoice,
                            createdAt: formatDateTime(log.createdAt)
                          })}
                          style={styles.mobilePhotoBtn}
                        >
                          <Camera size={12} />
                          <span>Lihat Foto Bukti</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </>
    )}

        {/* 5. Pagination Footer */}
        {logTotalItems > 0 && (
          <div style={styles.paginationWrapper}>
            <Pagination
              currentPage={logCurrentPage}
              totalPages={logTotalPages}
              totalItems={logTotalItems}
              itemsPerPage={logItemsPerPage}
              onPageChange={setLogCurrentPage}
              onItemsPerPageChange={setLogItemsPerPage}
              itemsPerPageOptions={[8, 15, 25, 50]}
            />
          </div>
        )}
      </div>

      <style>{`
        .desktop-history-table-wrapper {
          display: block;
        }
        .mobile-history-cards-wrapper {
          display: none;
        }
        .stock-history-mobile-actions {
          display: none;
        }
        .stock-history-main-card {
          margin-top: 16px;
        }
        .stock-history-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
          gap: 12px;
        }
        .stock-history-filter-tabs {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        @media (max-width: 1024px) {
          .stock-history-mobile-actions {
            display: block !important;
            width: 100% !important;
            margin: 16px 0 !important;
            padding: 0 !important;
            box-sizing: border-box !important;
          }
          .stock-history-main-card {
            margin-top: 0 !important;
          }
          .desktop-history-table-wrapper {
            display: none !important;
          }
          .mobile-history-cards-wrapper {
            display: block !important;
          }
          .stock-history-stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 8px !important;
          }
          .stock-history-filter-tabs {
            display: flex !important;
            width: 100% !important;
            overflow-x: auto !important;
            flex-wrap: nowrap !important;
            padding-bottom: 6px !important;
            -webkit-overflow-scrolling: touch;
            gap: 6px !important;
          }
          .type-tab-btn {
            white-space: nowrap !important;
            padding: 6px 11px !important;
            font-size: 0.75rem !important;
            flex-shrink: 0 !important;
          }
          .stock-history-toolbar {
            padding: 12px 14px !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 10px !important;
          }
          .stock-history-search-wrap {
            width: 100% !important;
            max-width: 100% !important;
            min-width: 100% !important;
          }
        }

        @media (max-width: 480px) {
          .stock-history-stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 6px !important;
          }
        }
      `}</style>
    </div>
  );
};

const styles = {
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
    gap: '12px'
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    boxShadow: 'var(--shadow-xs)'
  },
  statLabel: {
    fontSize: '0.75rem',
    color: 'var(--neutral-500)',
    fontWeight: 600
  },
  statIconWrap: {
    width: '32px',
    height: '32px',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  statValue: {
    fontSize: '1.375rem',
    fontWeight: 800,
    color: 'var(--neutral-900)',
    marginTop: '2px'
  },
  statSub: {
    fontSize: '0.688rem',
    color: 'var(--neutral-400)'
  },
  toolbar: {
    padding: '14px 16px',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px'
  },
  typeFilterTabs: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexWrap: 'wrap'
  },
  typeTabBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '7px 12px',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.813rem',
    fontWeight: 600,
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--neutral-50)',
    color: 'var(--neutral-600)',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  typeTabBtnActive: {
    backgroundColor: 'var(--blue-500)',
    borderColor: 'var(--blue-500)',
    color: '#FFFFFF'
  },
  typeTabBtnActiveIn: {
    backgroundColor: 'var(--green-600)',
    borderColor: 'var(--green-600)',
    color: '#FFFFFF'
  },
  typeTabBtnActiveOut: {
    backgroundColor: 'var(--red-500)',
    borderColor: 'var(--red-500)',
    color: '#FFFFFF'
  },
  typeTabBtnActiveWaste: {
    backgroundColor: '#dc2626',
    borderColor: '#dc2626',
    color: '#FFFFFF'
  },
  typeTabBtnActiveAdjust: {
    backgroundColor: 'var(--neutral-800)',
    borderColor: 'var(--neutral-800)',
    color: '#FFFFFF'
  },
  rightToolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flex: 1,
    justifyContent: 'flex-end',
    minWidth: '240px'
  },
  searchWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    minWidth: '220px',
    maxWidth: '320px',
    width: '100%'
  },
  filterIcon: {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
    zIndex: 2
  },
  filterInput: {
    width: '100%',
    paddingLeft: '38px',
    paddingRight: '36px',
    height: '40px',
    fontSize: '0.813rem',
    boxSizing: 'border-box'
  },
  clearSearchBtn: {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--neutral-400)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    width: '24px',
    height: '24px',
    background: 'none',
    border: 'none',
    zIndex: 2
  },
  rowNumberTag: {
    fontFamily: 'var(--font-family-mono)',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: 'var(--blue-600)',
    backgroundColor: 'var(--blue-50)',
    border: '1px solid var(--blue-200)',
    padding: '2px 8px',
    borderRadius: 'var(--radius-xs)',
    display: 'inline-block'
  },
  badgeIn: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '3px 8px',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.75rem',
    fontWeight: 700,
    backgroundColor: 'var(--green-50)',
    color: 'var(--green-700)',
    border: '1px solid var(--green-200)'
  },
  badgeOut: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '3px 8px',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.75rem',
    fontWeight: 700,
    backgroundColor: 'var(--red-50)',
    color: 'var(--red-600)',
    border: '1px solid var(--red-200)'
  },
  badgeWaste: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '3px 8px',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.719rem',
    fontWeight: 700,
    backgroundColor: '#fef2f2',
    color: '#b91c1c',
    border: '1px solid #fecaca'
  },
  badgeReturn: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '3px 8px',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.719rem',
    fontWeight: 700,
    backgroundColor: '#fff7ed',
    color: '#c2410c',
    border: '1px solid #fed7aa'
  },
  badgeAdjust: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '3px 8px',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.75rem',
    fontWeight: 700,
    backgroundColor: 'var(--neutral-100)',
    color: 'var(--neutral-700)',
    border: '1px solid var(--neutral-200)'
  },
  reasonTag: {
    display: 'inline-block',
    fontSize: '0.688rem',
    fontWeight: 700,
    color: '#b91c1c',
    backgroundColor: '#fef2f2',
    border: '1px solid #fee2e2',
    padding: '1px 6px',
    borderRadius: '4px',
    width: 'fit-content'
  },
  thumbnailWrap: {
    position: 'relative',
    width: '36px',
    height: '36px',
    margin: '0 auto',
    borderRadius: '6px',
    overflow: 'hidden',
    border: '1px solid var(--neutral-300)',
    cursor: 'pointer',
    backgroundColor: '#000000'
  },
  thumbnailImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  thumbnailOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
    transition: 'opacity 0.15s ease'
  },
  flowBox: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '3px 8px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--neutral-50)',
    border: '1px solid var(--border-subtle)',
    fontSize: '0.75rem'
  },
  userBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.75rem',
    color: 'var(--neutral-600)',
    fontWeight: 500
  },
  mobileCardsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '12px'
  },
  mobileLogCard: {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    boxShadow: 'var(--shadow-xs)'
  },
  mobileFlowBox: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.75rem',
    color: 'var(--neutral-600)',
    backgroundColor: 'var(--neutral-50)',
    padding: '2px 8px',
    borderRadius: 'var(--radius-xs)'
  },
  mobileBottomMeta: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '6px',
    borderTop: '1px solid var(--border-subtle)',
    gap: '8px',
    flexWrap: 'wrap'
  },
  mobilePhotoBtn: {
    fontSize: '0.719rem',
    fontWeight: 600,
    color: 'var(--blue-600)',
    backgroundColor: 'var(--blue-50)',
    border: '1px solid var(--blue-200)',
    borderRadius: '4px',
    padding: '3px 8px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px'
  },
  paginationWrapper: {
    padding: '12px 16px',
    borderTop: '1px solid var(--border-color)',
    display: 'flex',
    justifyContent: 'center'
  }
};

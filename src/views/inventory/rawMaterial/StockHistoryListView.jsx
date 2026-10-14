import React, { useEffect, useMemo, useState } from 'react';
import { useRawMaterial } from '../../../controllers/RawMaterialController';
import { useAuth } from '../../../controllers/AuthController';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Pagination } from '../../components/Pagination';
import { EmptyState } from '../../components/EmptyState';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import { ErrorAlert } from '../../components/ErrorAlert';
import { SearchSelect } from '../../components/SearchSelect';
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
  Filter,
  CalendarDays,
  Download,
  FileText
} from 'lucide-react';
import { exportStockHistoryToPDF } from '../../../utils/reportExportUtils';

export const StockHistoryListView = ({ mobileActionButtons, tabsSlot }) => {
  const { currentUser } = useAuth();
  const isCashier = currentUser?.role === 'kasir';

  const {
    stockLogs,
    filteredStockLogs,
    paginatedStockLogs,
    logTotalPages,
    logTotalItems,
    fetchStockLogsPage,
    logSearchTerm,
    setLogSearchTerm,
    logTypeFilter,
    setLogTypeFilter,
    logMaterialFilter,
    setLogMaterialFilter,
    logDateFrom,
    setLogDateFrom,
    logDateTo,
    setLogDateTo,
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

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportMode, setExportMode] = useState('all');
  const [exportType, setExportType] = useState(logTypeFilter);
  const [exportMaterial, setExportMaterial] = useState(logMaterialFilter);
  const [exportDate, setExportDate] = useState(logDateFrom || logDateTo);
  const [serverStockLogs, setServerStockLogs] = useState([]);
  const [serverStockLogTotal, setServerStockLogTotal] = useState(0);
  const [serverStockLogLoading, setServerStockLogLoading] = useState(false);
  const [serverStockLogError, setServerStockLogError] = useState(null);
  const materialFilterOptions = [
    { value: 'ALL', label: 'Semua Bahan' },
    ...Array.from(new Set(stockLogs.map(log => log.rawMaterialName).filter(Boolean)))
      .sort((a, b) => a.localeCompare(b, 'id'))
      .map(name => ({ value: name, label: name }))
  ];
  const hasLogFilters = Boolean(logSearchTerm || logTypeFilter !== 'ALL' || logMaterialFilter !== 'ALL' || logDateFrom || logDateTo);
  const resetLogFilters = () => {
    setLogSearchTerm('');
    setLogTypeFilter('ALL');
    setLogMaterialFilter('ALL');
    setLogDateFrom('');
    setLogDateTo('');
  };
  const openExportModal = () => {
    setExportMode('all');
    setExportType(logTypeFilter);
    setExportMaterial(logMaterialFilter);
    setExportDate(logDateFrom || logDateTo);
    setIsExportModalOpen(true);
  };
  const exportCustomLogs = stockLogs.filter(log => {
        const matchesType = exportType === 'ALL' || (exportType === 'WASTE'
          ? log.type === 'WASTE' || log.type === 'RETURN_ORDER'
          : log.type === exportType);
        const matchesMaterial = exportMaterial === 'ALL' || log.rawMaterialName === exportMaterial;
        const date = new Date(log.createdAt);
        const localDate = Number.isNaN(date.getTime()) ? '' : [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
        return matchesType && matchesMaterial && (!exportDate || localDate === exportDate);
      });
  const exportPreviewCount = exportMode === 'all' ? stockLogs.length : exportCustomLogs.length;
  const downloadStockHistoryPDF = () => {
    const exportLogs = exportMode === 'all' ? stockLogs : exportCustomLogs;

    if (!exportLogs.length) return;
    exportStockHistoryToPDF({
      logs: exportLogs,
      storeName: currentUser?.activeBranchName || currentUser?.branchName || 'XCrepes POS',
      filters: exportMode === 'all' ? null : {
        type: exportType,
        material: exportMaterial,
        date: exportDate
      }
    });
    setIsExportModalOpen(false);
  };

  const serverLogDateFilters = useMemo(() => {
    const from = logDateFrom || logDateTo;
    const to = logDateTo || logDateFrom;

    return {
      dateFrom: from ? new Date(`${from}T00:00:00`).toISOString() : '',
      dateTo: to ? new Date(`${to}T23:59:59.999`).toISOString() : ''
    };
  }, [logDateFrom, logDateTo]);

  useEffect(() => {
    let isActive = true;

    const loadStockLogsPage = async () => {
      if (!fetchStockLogsPage) return;

      setServerStockLogLoading(true);
      setServerStockLogError(null);

      const { data, count, error } = await fetchStockLogsPage({
        page: logCurrentPage,
        pageSize: logItemsPerPage,
        filters: {
          search: logSearchTerm,
          type: logTypeFilter,
          material: logMaterialFilter,
          ...serverLogDateFilters
        }
      });

      if (!isActive) return;

      if (error) {
        setServerStockLogError(error.message || 'Gagal memuat halaman riwayat stok.');
        setServerStockLogs([]);
        setServerStockLogTotal(0);
      } else {
        setServerStockLogs(data || []);
        setServerStockLogTotal(count || 0);
      }

      setServerStockLogLoading(false);
    };

    loadStockLogsPage();

    return () => {
      isActive = false;
    };
  }, [
    fetchStockLogsPage,
    logCurrentPage,
    logItemsPerPage,
    logSearchTerm,
    logTypeFilter,
    logMaterialFilter,
    serverLogDateFilters
  ]);

  const displayStockLogs = serverStockLogError ? paginatedStockLogs : serverStockLogs;
  const displayStockLogTotal = serverStockLogError ? logTotalItems : serverStockLogTotal;
  const displayStockLogTotalPages = Math.max(1, Math.ceil(displayStockLogTotal / logItemsPerPage));

  useEffect(() => {
    if (logCurrentPage > displayStockLogTotalPages) {
      setLogCurrentPage(displayStockLogTotalPages);
    }
  }, [logCurrentPage, displayStockLogTotalPages, setLogCurrentPage]);

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

      {tabsSlot}

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
          <div className="stock-history-filter-controls">
            {!isCashier && (
              <div className="stock-history-type-select">
                <SearchSelect
                  options={[
                    { value: 'ALL', label: 'Semua Jenis', badge: stockLogs.length },
                    { value: 'IN', label: 'Stok Masuk', badge: stockLogStats.totalIn },
                    { value: 'OUT', label: 'Stok Keluar', badge: stockLogStats.totalOut },
                    { value: 'WASTE', label: 'Bahan Rusak / Waste', badge: stockLogStats.wasteCount || 0 },
                    { value: 'ADJUST', label: 'Penyesuaian', badge: stockLogStats.totalAdjust }
                  ]}
                  value={logTypeFilter}
                  onChange={setLogTypeFilter}
                  placeholder="Semua Jenis"
                  searchPlaceholder="Cari jenis perubahan..."
                  icon={Filter}
                  clearable={false}
                  size="sm"
                />
              </div>
            )}

            <div className="stock-history-material-select">
              <SearchSelect
                options={materialFilterOptions}
                value={logMaterialFilter}
                onChange={setLogMaterialFilter}
                placeholder="Semua Bahan"
                searchPlaceholder="Cari nama bahan baku..."
                icon={Layers}
                clearable={false}
                size="sm"
              />
            </div>

            <div className="stock-history-date-filter">
              <CalendarDays size={16} aria-hidden="true" />
              <input
                type="date"
                className="blue-input"
                aria-label="Filter tanggal"
                title="Pilih tanggal"
                value={logDateFrom || logDateTo}
                onChange={(e) => { setLogDateFrom(e.target.value); setLogDateTo(e.target.value); }}
              />
              {(logDateFrom || logDateTo) && (
                <button type="button" className="stock-history-date-clear" aria-label="Hapus filter tanggal" title="Hapus tanggal" onClick={() => { setLogDateFrom(''); setLogDateTo(''); }}>
                  <X size={14} />
                </button>
              )}
            </div>

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
            <button type="button" className="stock-history-export-button" onClick={openExportModal} title="Unduh riwayat stok dalam format PDF">
              <Download size={16} />
              <span>Unduh PDF</span>
            </button>
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

        {isLoading || serverStockLogLoading ? (
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
              {displayStockLogs.length === 0 ? (
                <tr>
                  <td colSpan={isCashier ? 6 : 9} style={{ padding: 0 }}>
                    <EmptyState
                      icon={History}
                      title={hasLogFilters ? 'Riwayat Tidak Ditemukan' : 'Belum Ada Riwayat Perubahan'}
                      description={
                        logSearchTerm
                          ? `Tidak ada catatan riwayat dengan kata kunci "${logSearchTerm}".`
                          : hasLogFilters
                          ? 'Coba ubah jenis perubahan atau rentang tanggal yang dipilih.'
                          : 'Setiap penambahan, pengurangan, atau bahan rusak akan otomatis tercatat di sini.'
                      }
                      actionLabel={hasLogFilters ? 'Reset Filter' : 'Catat Bahan Rusak'}
                      onAction={
                        hasLogFilters
                          ? resetLogFilters
                          : () => openWasteModal(rawMaterials[0] || null)
                      }
                    />
                  </td>
                </tr>
              ) : (
                displayStockLogs.map((log, index) => {
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
          {displayStockLogs.length === 0 ? (
            <EmptyState
              icon={History}
              title={hasLogFilters ? 'Riwayat Tidak Ditemukan' : 'Belum Ada Riwayat'}
              description={
                logSearchTerm
                  ? `Tidak ada riwayat untuk "${logSearchTerm}".`
                  : hasLogFilters
                  ? 'Coba ubah jenis perubahan atau rentang tanggal yang dipilih.'
                  : 'Catat perubahan stok bahan untuk melihat log.'
              }
              actionLabel={hasLogFilters ? 'Reset Filter' : 'Catat Stok'}
              onAction={
                hasLogFilters
                  ? resetLogFilters
                  : () => openWasteModal(rawMaterials[0] || null)
              }
            />
          ) : (
            <div style={styles.mobileCardsList}>
              {displayStockLogs.map((log, index) => {
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
        {displayStockLogTotal > 0 && (
          <div style={styles.paginationWrapper}>
            <Pagination
              currentPage={logCurrentPage}
              totalPages={displayStockLogTotalPages}
              totalItems={displayStockLogTotal}
              itemsPerPage={logItemsPerPage}
              onPageChange={setLogCurrentPage}
              onItemsPerPageChange={setLogItemsPerPage}
              itemsPerPageOptions={[8, 15, 25, 50]}
            />
          </div>
        )}
      </div>

      <Modal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Unduh riwayat stok"
        subtitle="Pilih data yang akan dimasukkan ke laporan PDF."
        size="md"
        footer={(
          <>
            <Button variant="secondary" onClick={() => setIsExportModalOpen(false)}>Batal</Button>
            <Button variant="primary" icon={FileText} onClick={downloadStockHistoryPDF} disabled={exportPreviewCount === 0}>
              Unduh {exportPreviewCount} data
            </Button>
          </>
        )}
      >
        <div className="stock-history-export-options">
          <label className={`stock-history-export-option ${exportMode === 'all' ? 'selected' : ''}`}>
            <input type="radio" name="stock-history-export-mode" checked={exportMode === 'all'} onChange={() => setExportMode('all')} />
            <span><strong>Semua data</strong><small>Seluruh riwayat stok, tidak mengikuti filter layar ({stockLogs.length} data).</small></span>
          </label>
          <label className={`stock-history-export-option ${exportMode === 'custom' ? 'selected' : ''}`}>
            <input type="radio" name="stock-history-export-mode" checked={exportMode === 'custom'} onChange={() => setExportMode('custom')} />
            <span><strong>Pilih data tertentu</strong><small>Kriteria mengikuti filter yang sedang aktif dan bisa diubah.</small></span>
          </label>
        </div>

        {exportMode === 'custom' && (
          <div className="stock-history-export-filters">
            {!isCashier && (
              <label className="stock-history-export-field">
                <span>Jenis perubahan</span>
                <SearchSelect
                  options={[
                    { value: 'ALL', label: 'Semua Jenis' },
                    { value: 'IN', label: 'Stok Masuk' },
                    { value: 'OUT', label: 'Stok Keluar' },
                    { value: 'WASTE', label: 'Bahan Rusak / Waste' },
                    { value: 'ADJUST', label: 'Penyesuaian' }
                  ]}
                  value={exportType}
                  onChange={setExportType}
                  placeholder="Semua Jenis"
                  searchPlaceholder="Cari jenis perubahan..."
                  clearable={false}
                  size="sm"
                />
              </label>
            )}
            <label className="stock-history-export-field">
              <span>Nama bahan baku</span>
              <SearchSelect
                options={materialFilterOptions}
                value={exportMaterial}
                onChange={setExportMaterial}
                placeholder="Semua Bahan"
                searchPlaceholder="Cari nama bahan baku..."
                icon={Layers}
                clearable={false}
                size="sm"
              />
            </label>
            <label className="stock-history-export-field">
              <span>Tanggal (opsional)</span>
              <input type="date" className="blue-input" aria-label="Tanggal ekspor PDF" value={exportDate} onChange={(e) => setExportDate(e.target.value)} />
            </label>
            <p className="stock-history-export-count">{exportPreviewCount} data akan dimasukkan ke PDF.</p>
          </div>
        )}
        <style>{`
          .stock-history-export-options { display: grid; gap: 10px; }
          .stock-history-export-option {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            padding: 13px;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            cursor: pointer;
          }
          .stock-history-export-option.selected { border-color: var(--blue-500); background: var(--blue-50); }
          .stock-history-export-option input { margin: 3px 0 0; accent-color: var(--blue-600); }
          .stock-history-export-option span { display: grid; gap: 3px; }
          .stock-history-export-option strong { color: var(--neutral-900); font-size: 0.875rem; }
          .stock-history-export-option small { color: var(--neutral-500); font-size: 0.75rem; line-height: 1.4; }
          .stock-history-export-filters { display: grid; gap: 14px; margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border-color); }
          .stock-history-export-field { display: grid; gap: 6px; color: var(--neutral-700); font-size: 0.75rem; font-weight: 600; }
          .stock-history-export-field > input { height: 40px; padding: 0 10px; }
          .stock-history-export-count { margin: 0; color: var(--blue-700); font-size: 0.8rem; font-weight: 600; }
        `}</style>
      </Modal>

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
          margin-bottom: 12px;
        }
        .stock-history-filter-controls {
          display: grid;
          grid-template-columns: minmax(145px, 0.9fr) minmax(165px, 1fr) minmax(170px, 0.9fr) minmax(190px, 1.2fr) auto;
          align-items: end;
          gap: 12px;
          width: 100%;
          min-width: 0;
        }
        .stock-history-type-select,
        .stock-history-material-select { min-width: 0; }
        .stock-history-date-filter {
          display: flex;
          align-items: center;
          position: relative;
          width: 100%;
          min-width: 0;
          color: var(--blue-600);
        }
        .stock-history-date-filter > svg {
          position: absolute;
          left: 11px;
          z-index: 1;
          pointer-events: none;
        }
        .stock-history-date-filter input {
          width: 100%;
          min-width: 0;
          height: 42px;
          padding: 0 36px;
          box-sizing: border-box;
          font-size: 0.8rem;
        }
        .stock-history-date-clear {
          position: absolute;
          right: 32px;
          display: grid;
          place-items: center;
          width: 24px;
          height: 24px;
          border: 0;
          border-radius: 4px;
          color: var(--neutral-500);
          background: transparent;
          cursor: pointer;
        }
        .stock-history-date-clear:hover { color: var(--red-600); background: var(--red-50); }
        .stock-history-export-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          height: 42px;
          padding: 0 16px;
          border: 1px solid #FECACA;
          border-radius: 8px;
          color: #B91C1C;
          background: #FEF2F2;
          font: inherit;
          font-size: 0.813rem;
          font-weight: 600;
          white-space: nowrap;
          cursor: pointer;
          box-sizing: border-box;
          transition: var(--transition-fast);
        }
        .stock-history-export-button:hover { background: #FEE2E2; border-color: #FCA5A5; transform: translateY(-1px); }
        .stock-history-export-button:focus-visible { outline: 2px solid var(--blue-500); outline-offset: 2px; }

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
          .stock-history-toolbar {
            padding: 0 0 8px !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 10px !important;
          }
          .stock-history-filter-controls {
            grid-template-columns: minmax(0, 1fr);
            gap: 12px;
          }
          .stock-history-type-select,
          .stock-history-material-select,
          .stock-history-date-filter,
          .stock-history-search-wrap,
          .stock-history-export-button { grid-column: 1 / -1; }
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
          .stock-history-filter-controls .search-select-container > [role="button"] {
            height: 44px !important;
          }
          .stock-history-date-filter input { height: 44px; }
          .stock-history-export-button { width: 100%; }
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
    padding: '12px 0 0'
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

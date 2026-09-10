import React from 'react';
import { useRawMaterial } from '../../../controllers/RawMaterialController';
import { useAuth } from '../../../controllers/AuthController';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Pagination } from '../../components/Pagination';
import { EmptyState } from '../../components/EmptyState';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import { ErrorAlert } from '../../components/ErrorAlert';
import { StockHistoryListView } from './StockHistoryListView';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Package, 
  X, 
  ArrowUpDown,
  ChevronDown,
  Coins,
  AlertCircle,
  AlertTriangle,
  History,
  Boxes,
  PlusCircle
} from 'lucide-react';

export const RawMaterialListView = () => {
  const {
    rawMaterials,
    isLoading,
    error,
    refetch,
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    stockStatusFilter,
    setStockStatusFilter,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    paginatedRawMaterials,
    totalPages,
    totalItems,
    totalAllRawMaterials,
    stockLogs,
    stockSummary,
    openAddModal,
    openEditModal,
    openDeleteModal,
    openBatchDeleteModal,
    openAdjustModal,
    openWasteModal
  } = useRawMaterial();
  const { currentUser } = useAuth();
  const isCashier = currentUser?.role === 'kasir';
  const summary = stockSummary || { totalItems: 0, totalInventoryValue: 0, lowCount: 0, emptyCount: 0 };

  const currentPageIds = paginatedRawMaterials.map(c => c.id);
  const isAllCurrentSelected = currentPageIds.length > 0 && currentPageIds.every(id => selectedIds.includes(id));
  const isSomeSelected = selectedIds.length > 0;

  // Currency formatter
  const formatIDR = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  return (
    <div className="raw-material-list-page animate-fade-in" style={styles.container}>
      {/* Top Title & Primary Actions */}
      <div className="raw-material-header-section" style={styles.pageHeader}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h1 className="raw-material-title" style={styles.pageTitle}>Stok Bahan Baku</h1>
            <Badge variant="primary" withDot>
              {totalAllRawMaterials} Bahan Baku
            </Badge>
          </div>
          <p className="raw-material-subtitle" style={styles.pageSubtitle}>
            Pantau sisa stok fisik, harga beli bahan baku dapur, dan riwayat mutasi stok.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="raw-material-header-actions">
          {!isCashier && (
            <Button
              variant="primary"
              icon={Plus}
              onClick={openAddModal}
              size="md"
              className="raw-material-add-btn"
            >
              Tambah Bahan
            </Button>
          )}

          {totalAllRawMaterials > 0 && (
            <div className="raw-material-sub-actions">
              <Button
                variant={isCashier ? "primary" : "outline"}
                icon={PlusCircle}
                onClick={() => openAdjustModal(paginatedRawMaterials[0] || null, 'IN')}
                size="md"
                className="raw-material-adjust-btn"
              >
                {isCashier ? 'Catat Stok Masuk (Restok)' : 'Catat Perubahan Stok'}
              </Button>

              {!isCashier && (
                <Button
                  variant="outline"
                  onClick={() => openWasteModal(paginatedRawMaterials[0] || null)}
                  size="md"
                  style={{ color: 'var(--red-600)', borderColor: 'var(--red-200)', backgroundColor: 'var(--red-50)' }}
                  className="raw-material-waste-btn"
                >
                  Catat Bahan Rusak / Expired
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="raw-material-stats-grid" style={styles.statsGrid}>
        {/* Card 1: Total Master Bahan */}
        <div 
          style={{
            ...styles.statCard,
            ...(stockStatusFilter === 'all' ? styles.statCardActive : {})
          }}
          onClick={() => setStockStatusFilter('all')}
          title="Klik untuk menampilkan semua bahan baku"
        >
          <div style={styles.statHeader}>
            <span style={styles.statTitle}>Total Master Bahan</span>
            <div style={{ ...styles.statIconWrapper, backgroundColor: 'var(--blue-50)', color: 'var(--blue-600)' }}>
              <Boxes size={18} />
            </div>
          </div>
          <div style={styles.statValue}>
            {summary.totalItems} <span style={styles.statUnit}>Jenis</span>
          </div>
          <div style={styles.statFooter}>
            Katalog bahan baku aktif
          </div>
        </div>

        {/* Card 2: Total Nilai Aset Stok */}
        <div 
          style={styles.statCard}
          title="Estimasi total modal seluruh stok bahan saat ini"
        >
          <div style={styles.statHeader}>
            <span style={styles.statTitle}>Total Nilai Aset Stok</span>
            <div style={{ ...styles.statIconWrapper, backgroundColor: '#eff6ff', color: 'var(--blue-600)' }}>
              <Coins size={18} />
            </div>
          </div>
          <div style={{ ...styles.statValue, color: 'var(--blue-600)' }}>
            {formatIDR(summary.totalInventoryValue)}
          </div>
          <div style={styles.statFooter}>
            Akumulasi modal fisik bahan
          </div>
        </div>

        {/* Card 3: Stok Menipis (Kritis) */}
        <div 
          style={{
            ...styles.statCard,
            ...(stockStatusFilter === 'low' ? { ...styles.statCardActive, borderColor: '#f59e0b', backgroundColor: '#fffdf5' } : {})
          }}
          onClick={() => setStockStatusFilter(stockStatusFilter === 'low' ? 'all' : 'low')}
          title="Klik untuk memfilter bahan yang menipis"
        >
          <div style={styles.statHeader}>
            <span style={styles.statTitle}>Stok Menipis (Kritis)</span>
            <div style={{ ...styles.statIconWrapper, backgroundColor: '#fffbeb', color: '#d97706', border: '1px solid #fde68a' }}>
              <AlertCircle size={18} />
            </div>
          </div>
          <div style={{ ...styles.statValue, color: summary.lowCount > 0 ? '#d97706' : 'var(--neutral-900)' }}>
            {summary.lowCount} <span style={styles.statUnit}>Bahan</span>
          </div>
          <div style={styles.statFooter}>
            {summary.lowCount > 0 ? 'Sisa stok ≤ 10 unit (Perlu Restok)' : 'Semua stok dalam batas aman'}
          </div>
        </div>

        {/* Card 4: Stok Habis / Kosong */}
        <div 
          style={{
            ...styles.statCard,
            ...(stockStatusFilter === 'empty' ? { ...styles.statCardActive, borderColor: '#ef4444', backgroundColor: '#fff5f5' } : {})
          }}
          onClick={() => setStockStatusFilter(stockStatusFilter === 'empty' ? 'all' : 'empty')}
          title="Klik untuk memfilter bahan yang habis"
        >
          <div style={styles.statHeader}>
            <span style={styles.statTitle}>Stok Habis (Kosong)</span>
            <div style={{ ...styles.statIconWrapper, backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div style={{ ...styles.statValue, color: summary.emptyCount > 0 ? '#dc2626' : 'var(--neutral-900)' }}>
            {summary.emptyCount} <span style={styles.statUnit}>Bahan</span>
          </div>
          <div style={styles.statFooter}>
            {summary.emptyCount > 0 ? 'Stok 0 (Menu terkait terkunci)' : 'Tidak ada bahan yang habis'}
          </div>
        </div>
      </div>

      {/* Navigation Tabs (Segmented Control) */}
      <div className="raw-material-tab-container">
        <button
          type="button"
          className={`tab-item-btn ${activeTab === 'inventory' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          <Boxes size={15} />
          <span>Daftar Stok Bahan</span>
          <span className={`tab-badge-pill ${activeTab === 'inventory' ? 'is-active' : ''}`}>
            {totalAllRawMaterials}
          </span>
        </button>

        <button
          type="button"
          className={`tab-item-btn ${activeTab === 'history' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <History size={15} />
          <span>Riwayat Perubahan Stok</span>
          <span className={`tab-badge-pill ${activeTab === 'history' ? 'is-active' : ''}`}>
            {stockLogs.length}
          </span>
        </button>
      </div>

      {/* TAB CONTENT 1: DAFTAR BAHAN BAKU */}
      {activeTab === 'inventory' && (
        <div className="blue-card raw-material-card-wrapper" style={{ padding: 0 }}>
          {/* Toolbar (Search, Sort, Batch Delete) */}
          <div className="raw-material-toolbar" style={styles.toolbar}>
            <div className="raw-material-toolbar-inputs" style={styles.leftToolbar}>
              {/* Search Input */}
              <div className="raw-material-search-box" style={styles.searchWrapper}>
                <Search size={16} color="var(--neutral-400)" style={styles.filterIcon} />
                <input
                  type="text"
                  className="blue-input"
                  style={styles.filterInput}
                  placeholder="Cari bahan baku..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    style={styles.clearSearchBtn}
                    title="Hapus pencarian"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* Sort Dropdown dengan Panah Bawah Rapi */}
              <div className="raw-material-sort-box" style={styles.sortWrapper}>
                <ArrowUpDown size={15} color="var(--neutral-400)" style={styles.filterIcon} />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="blue-input"
                  style={styles.filterSelect}
                >
                  <option value="date-desc">Terbaru</option>
                  <option value="date-asc">Terlama</option>
                  <option value="name-asc">Nama (A - Z)</option>
                  <option value="name-desc">Nama (Z - A)</option>
                  <option value="stock-desc">Stok Terbanyak</option>
                  <option value="stock-asc">Stok Paling Sedikit</option>
                  <option value="price-desc">Harga Termahal</option>
                  <option value="price-asc">Harga Termurah</option>
                </select>
                <ChevronDown size={14} color="var(--neutral-400)" style={styles.filterChevron} />
              </div>

              {/* Active Filter Badge */}
              {stockStatusFilter !== 'all' && (
                <div style={styles.activeFilterBadge}>
                  <span style={{ fontSize: '0.75rem', color: '#1e3a8a', fontWeight: 600 }}>
                    Filter: <strong>{stockStatusFilter === 'low' ? 'Stok Menipis' : 'Stok Habis'}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setStockStatusFilter('all')}
                    style={styles.activeFilterRemoveBtn}
                    title="Hapus filter status"
                  >
                    <X size={13} />
                  </button>
                </div>
              )}
            </div>

            {/* Batch Actions Button */}
            {!isCashier && isSomeSelected && (
              <div className="raw-material-batch-bar" style={styles.batchBar}>
                <span style={{ fontSize: '0.813rem', color: 'var(--neutral-700)', fontWeight: 700 }}>
                  {selectedIds.length} data terpilih
                </span>
                <Button
                  variant="danger"
                  size="sm"
                  icon={Trash2}
                  onClick={openBatchDeleteModal}
                >
                  Hapus Terpilih
                </Button>
              </div>
            )}
          </div>
          {error && (
            <div style={{ padding: '0 16px' }}>
              <ErrorAlert 
                title="Gagal Memuat Data Bahan Baku" 
                message={error} 
                onRetry={refetch} 
              />
            </div>
          )}

          {isLoading ? (
            <div style={{ padding: '16px' }}>
              <TableSkeleton rows={6} cols={isCashier ? 4 : 6} />
            </div>
          ) : (
            <>
              {/* 1. DESKTOP & TABLET DATA TABLE (Visible > 768px) */}
              <div className="desktop-table-wrapper" style={{ overflowX: 'auto' }}>
            <table className="blue-table">
              <thead>
                <tr>
                  {!isCashier && (
                    <th style={{ width: '48px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={isAllCurrentSelected}
                        onChange={() => toggleSelectAll(currentPageIds)}
                        disabled={paginatedRawMaterials.length === 0}
                        style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                        title="Pilih Semua Halaman Ini"
                      />
                    </th>
                  )}
                  <th style={{ width: '70px', textAlign: 'center' }}>No</th>
                  <th>Nama Bahan Baku</th>
                  <th style={{ width: '170px', textAlign: 'right' }}>Sisa Stok</th>
                  <th style={{ width: '180px', textAlign: 'right' }}>Harga Beli / Satuan</th>
                  {!isCashier && (
                    <th style={{ width: '150px', textAlign: 'right' }}>Aksi</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {paginatedRawMaterials.length === 0 ? (
                  <tr>
                    <td colSpan={isCashier ? "4" : "6"} style={{ padding: 0 }}>
                      <EmptyState
                        icon={Package}
                        title={searchTerm ? 'Bahan Baku Tidak Ditemukan' : 'Belum Ada Bahan Baku'}
                        description={
                          searchTerm
                            ? `Tidak ditemukan bahan baku dengan kata kunci "${searchTerm}".`
                            : 'Belum ada data bahan baku dalam sistem.'
                        }
                        actionLabel={searchTerm ? 'Reset Pencarian' : (!isCashier ? 'Tambah Bahan' : undefined)}
                        onAction={searchTerm ? () => setSearchTerm('') : (!isCashier ? openAddModal : undefined)}
                      />
                    </td>
                  </tr>
                ) : (
                  paginatedRawMaterials.map((item, index) => {
                    const isSelected = selectedIds.includes(item.id);
                    const rowNumber = (currentPage - 1) * itemsPerPage + index + 1;
                    const stockVal = Number(item.stock ?? item.currentStock ?? 0);
                    const minStockVal = Number(item.minStock) || 10;
                    const isLowStock = stockVal <= minStockVal && stockVal > 0;
                    const isEmpty = stockVal <= 0;

                    return (
                      <tr
                        key={item.id}
                        style={{
                          backgroundColor: (!isCashier && isSelected) ? 'var(--blue-50)' : 'transparent'
                        }}
                      >
                        {/* Checkbox (Super Admin only) */}
                        {!isCashier && (
                          <td style={{ textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelect(item.id)}
                              style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                            />
                          </td>
                        )}
                        {/* Penomoran Format #1 */}
                        <td style={{ textAlign: 'center' }}>
                          <span style={styles.rowNumberTag}>
                            #{rowNumber}
                          </span>
                        </td>

                        {/* Nama Bahan Baku */}
                        <td>
                          <span style={styles.rawMaterialName}>
                            {item.name}
                          </span>
                        </td>

                        {/* Jumlah Stok Saat Ini */}
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            {isEmpty ? (
                              <span title="Stok habis!" style={{ display: 'inline-flex' }}>
                                <AlertCircle size={14} color="#dc2626" />
                              </span>
                            ) : isLowStock ? (
                              <span title="Stok menipis!" style={{ display: 'inline-flex' }}>
                                <AlertCircle size={14} color="var(--amber-500)" />
                              </span>
                            ) : null}
                            <span style={{ 
                              fontWeight: 700, 
                              fontSize: '0.938rem',
                              color: isEmpty ? '#dc2626' : isLowStock ? 'var(--amber-600)' : 'var(--neutral-900)' 
                            }}>
                              {new Intl.NumberFormat('id-ID').format(stockVal)}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', fontWeight: 500 }}>
                              {item.unitName}
                            </span>
                          </div>
                        </td>

                        {/* Harga per Unit Satuan */}
                        <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--neutral-800)' }}>
                          <span>{formatIDR(item.pricePerUnit)}</span>
                          <span style={{ fontSize: '0.688rem', color: 'var(--neutral-400)', display: 'block' }}>
                            per {item.unitName}
                          </span>
                        </td>

                        {/* Actions (Super Admin only) */}
                        {!isCashier && (
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '8px' }}>
                              <button
                                onClick={() => openEditModal(item)}
                                style={styles.actionEditBtn}
                                title="Edit Bahan Baku"
                              >
                                <Edit3 size={15} />
                              </button>
                              <button
                                onClick={() => openDeleteModal(item)}
                                style={styles.actionDeleteBtn}
                                title="Hapus Bahan Baku"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* 2. MOBILE CARD LIST VIEW (Visible <= 768px) */}
          <div className="mobile-raw-materials-wrapper">
            {paginatedRawMaterials.length === 0 ? (
              <EmptyState
                icon={Package}
                title={searchTerm ? 'Bahan Tidak Ditemukan' : 'Belum Ada Bahan Baku'}
                description={
                  searchTerm
                    ? `Tidak ada hasil untuk "${searchTerm}".`
                    : 'Belum ada data bahan baku.'
                }
                actionLabel={searchTerm ? 'Reset Pencarian' : (!isCashier ? 'Tambah Bahan' : undefined)}
                onAction={searchTerm ? () => setSearchTerm('') : (!isCashier ? openAddModal : undefined)}
              />
            ) : (
              <div className="mobile-units-container">
                {/* Cards */}
                {paginatedRawMaterials.map((item, index) => {
                  const isSelected = selectedIds.includes(item.id);
                  const rowNumber = (currentPage - 1) * itemsPerPage + index + 1;
                  const stockVal = Number(item.stock ?? item.currentStock ?? 0);
                  const minStockVal = Number(item.minStock) || 10;
                  const isLowStock = stockVal <= minStockVal && stockVal > 0;
                  const isEmpty = stockVal <= 0;

                  return (
                    <div
                      key={item.id}
                      className={`mobile-unit-card ${(!isCashier && isSelected) ? 'is-selected' : ''}`}
                      onClick={() => !isCashier && toggleSelect(item.id)}
                      style={styles.mobileRawCard}
                    >
                      {/* Top Row: Checkbox, #No, Name, Edit/Delete Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                          {!isCashier && (
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelect(item.id)}
                              onClick={(e) => e.stopPropagation()}
                              style={{ width: '18px', height: '18px', cursor: 'pointer', flexShrink: 0 }}
                            />
                          )}
                          <span style={styles.rowNumberTag}>
                            #{rowNumber}
                          </span>
                          <span style={{ fontSize: '0.938rem', fontWeight: 700, color: 'var(--neutral-900)', wordBreak: 'break-word', lineHeight: 1.25, flex: 1, minWidth: 0 }}>
                            {item.name}
                          </span>
                        </div>

                        {!isCashier && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => openEditModal(item)}
                              style={styles.mobileActionEditBtn}
                              aria-label={`Edit ${item.name}`}
                              title="Edit Bahan"
                            >
                              <Edit3 size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => openDeleteModal(item)}
                              style={styles.mobileActionDeleteBtn}
                              aria-label={`Hapus ${item.name}`}
                              title="Hapus Bahan"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Middle Row: Detail Stats Box */}
                      <div className="mobile-detail-grid" style={styles.mobileDetailGrid}>
                        <div style={styles.mobileDetailBox}>
                          <span style={styles.mobileDetailLabel}>Sisa Stok</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span style={{ 
                              fontWeight: 800, 
                              fontSize: '1rem',
                              color: isEmpty ? '#dc2626' : isLowStock ? '#d97706' : 'var(--neutral-900)' 
                            }}>
                              {new Intl.NumberFormat('id-ID').format(stockVal)} {item.unitName}
                            </span>
                            {isEmpty ? (
                              <span style={{ fontSize: '0.688rem', fontWeight: 700, color: '#dc2626', backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '1px 5px', borderRadius: '4px' }}>
                                Habis (0)
                              </span>
                            ) : isLowStock ? (
                              <span style={{ fontSize: '0.688rem', fontWeight: 700, color: '#d97706', backgroundColor: '#fffbeb', border: '1px solid #fde68a', padding: '1px 5px', borderRadius: '4px' }}>
                                Menipis
                              </span>
                            ) : null}
                          </div>
                        </div>

                        <div style={styles.mobileDetailBox}>
                          <span style={styles.mobileDetailLabel}>Harga Beli Satuan</span>
                          <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--neutral-800)' }}>
                            {formatIDR(item.pricePerUnit)} <span style={{ fontSize: '0.688rem', color: 'var(--neutral-400)', fontWeight: 500 }}>/{item.unitName}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

          {/* Table Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </div>
      )}

      {/* TAB CONTENT 2: RIWAYAT PERUBAHAN STOK */}
      {activeTab === 'history' && (
        <StockHistoryListView />
      )}

      {/* Embedded Mobile Responsive Styles */}
      <style>{`
        .mobile-raw-materials-wrapper {
          display: none;
        }
        .raw-material-tab-container {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-bottom: 16px;
          background-color: var(--neutral-100);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 4px;
          box-sizing: border-box;
          width: 100%;
        }
        .tab-item-btn {
          flex: 1 1 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 9px 12px;
          border-radius: 8px;
          font-size: 0.813rem;
          font-weight: 600;
          color: var(--neutral-600);
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all var(--transition-fast);
          white-space: nowrap;
          box-sizing: border-box;
        }
        .tab-item-btn:hover:not(.is-active) {
          color: var(--neutral-900);
          background-color: rgba(255, 255, 255, 0.5);
        }
        .tab-item-btn.is-active {
          background-color: #ffffff;
          color: var(--blue-600);
          font-weight: 700;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
        }
        .tab-badge-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 0.688rem;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 999px;
          background-color: var(--neutral-200);
          color: var(--neutral-600);
          line-height: 1;
        }
        .tab-badge-pill.is-active {
          background-color: var(--blue-50);
          color: var(--blue-600);
          border: 1px solid var(--blue-200);
        }

        .raw-material-header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .raw-material-sub-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .raw-material-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 20px;
        }

        @media (max-width: 1024px) {
          .raw-material-stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 10px !important;
            margin-bottom: 16px !important;
          }
          .raw-material-list-page {
            padding: 0 !important;
          }
          .raw-material-header-section {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
            margin-bottom: 14px !important;
          }
          .raw-material-title {
            font-size: 1.25rem !important;
          }
          .raw-material-subtitle {
            font-size: 0.781rem !important;
          }
          .raw-material-header-actions {
            display: flex !important;
            flex-direction: column !important;
            gap: 8px !important;
            width: 100% !important;
          }
          .raw-material-add-btn {
            width: 100% !important;
            min-height: 42px !important;
          }
          .raw-material-sub-actions {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 8px !important;
            width: 100% !important;
          }
          .raw-material-adjust-btn,
          .raw-material-waste-btn {
            width: 100% !important;
            min-height: 38px !important;
            font-size: 0.813rem !important;
            padding: 0 8px !important;
            justify-content: center !important;
            white-space: nowrap !important;
          }
          .raw-material-toolbar {
            padding: 12px 14px !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 10px !important;
          }
          .raw-material-toolbar-inputs {
            display: flex !important;
            flex-direction: column !important;
            width: 100% !important;
            gap: 10px !important;
            margin: 0 !important;
          }
          .raw-material-search-box,
          .raw-material-sort-box {
            width: 100% !important;
            max-width: 100% !important;
            min-width: 100% !important;
            margin: 0 !important;
          }
          .raw-material-batch-bar {
            width: 100% !important;
            justify-content: space-between !important;
            margin-top: 4px !important;
          }
          .desktop-table-wrapper {
            display: none !important;
          }
          .mobile-raw-materials-wrapper {
            display: block !important;
          }
          .mobile-units-container {
            padding: 10px 12px 14px 12px !important;
            gap: 10px !important;
          }
        }

        @media (max-width: 640px) {
          .raw-material-stats-grid {
            grid-template-columns: 1fr !important;
            gap: 8px !important;
          }
        }

        @media (max-width: 480px) {
          .tab-item-btn {
            font-size: 0.75rem !important;
            padding: 8px 6px !important;
            gap: 4px !important;
          }
          .tab-badge-pill {
            font-size: 0.625rem !important;
            padding: 1px 5px !important;
          }
          .raw-material-adjust-btn span,
          .raw-material-waste-btn span {
            font-size: 0.75rem !important;
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
    gap: '20px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '14px',
    marginBottom: '4px'
  },
  statCard: {
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    userSelect: 'none'
  },
  statCardActive: {
    borderColor: 'var(--blue-500)',
    boxShadow: '0 0 0 2px var(--blue-100), 0 2px 8px rgba(0,91,198,0.08)',
    backgroundColor: '#f8fbff'
  },
  statHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%'
  },
  statTitle: {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: 'var(--neutral-500)',
    textTransform: 'uppercase',
    letterSpacing: '0.3px'
  },
  statIconWrapper: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  statValue: {
    fontSize: '1.375rem',
    fontWeight: 800,
    color: 'var(--neutral-900)',
    letterSpacing: '-0.02em',
    lineHeight: 1.2
  },
  statUnit: {
    fontSize: '0.813rem',
    fontWeight: 500,
    color: 'var(--neutral-500)',
    marginLeft: '2px'
  },
  statFooter: {
    fontSize: '0.688rem',
    color: 'var(--neutral-400)',
    marginTop: '2px'
  },
  activeFilterBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    backgroundColor: 'var(--blue-50)',
    border: '1px solid var(--blue-200)',
    borderRadius: '8px'
  },
  activeFilterRemoveBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--blue-600)',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  pageHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '18px',
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
  tabContainer: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '16px'
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid var(--border-color)',
    flexWrap: 'wrap',
    gap: '12px',
    backgroundColor: 'var(--bg-surface)'
  },
  leftToolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
    flexWrap: 'wrap'
  },
  searchWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    minWidth: '240px',
    maxWidth: '380px',
    flex: 1,
    width: '100%'
  },
  sortWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    minWidth: '180px',
    maxWidth: '240px',
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
    height: '42px',
    boxSizing: 'border-box'
  },
  filterSelect: {
    width: '100%',
    paddingLeft: '38px',
    paddingRight: '36px',
    height: '42px',
    fontSize: '0.813rem',
    boxSizing: 'border-box',
    cursor: 'pointer',
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    backgroundColor: 'var(--bg-surface)'
  },
  filterChevron: {
    position: 'absolute',
    right: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
    zIndex: 2
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
    zIndex: 2
  },
  batchBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  rawMaterialName: {
    fontSize: '0.938rem',
    fontWeight: 700,
    color: 'var(--neutral-900)'
  },
  actionEditBtn: {
    width: '34px',
    height: '34px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--blue-50)',
    color: 'var(--blue-600)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    border: '1px solid var(--blue-100)',
    transition: 'all var(--transition-fast)'
  },
  actionDeleteBtn: {
    width: '34px',
    height: '34px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--red-50)',
    color: 'var(--red-500)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    border: '1px solid var(--red-100)',
    transition: 'all var(--transition-fast)'
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
  mobileRawCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: '10px',
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    padding: '12px 14px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
  },
  mobileActionEditBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    backgroundColor: 'var(--blue-50)',
    color: 'var(--blue-600)',
    border: '1px solid var(--blue-200)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  },
  mobileActionDeleteBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    backgroundColor: 'var(--red-50)',
    color: 'var(--red-500)',
    border: '1px solid var(--red-200)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  },
  mobileDetailGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '8px',
    padding: '9px 11px',
    backgroundColor: 'var(--neutral-50)',
    borderRadius: '8px',
    border: '1px solid var(--border-subtle)'
  },
  mobileDetailBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    fontSize: '0.813rem'
  },
  mobileDetailLabel: {
    fontSize: '0.688rem',
    color: 'var(--neutral-500)',
    fontWeight: 600,
    textTransform: 'uppercase'
  }
};

import React from 'react';
import { useCategory } from '../../../controllers/CategoryController';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Pagination } from '../../components/Pagination';
import { EmptyState } from '../../components/EmptyState';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import { ErrorAlert } from '../../components/ErrorAlert';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Layers, 
  X, 
  ArrowUpDown, 
  ChevronDown,
  SlidersHorizontal
} from 'lucide-react';

export const CategoryListView = () => {
  const {
    categories,
    isLoading,
    error,
    refetch,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    paginatedCategories,
    totalPages,
    totalItems,
    totalAllCategories,
    openAddModal,
    openEditModal,
    openDeleteModal,
    openBatchDeleteModal,
    openReorderModal
  } = useCategory();

  const currentPageIds = paginatedCategories.map(c => c.id);
  const isAllCurrentSelected = currentPageIds.length > 0 && currentPageIds.every(id => selectedIds.includes(id));
  const isSomeSelected = selectedIds.length > 0;

  return (
    <div className="category-list-page animate-fade-in" style={styles.container}>
      {/* Top Title & Primary Action */}
      <div className="category-header-section" style={styles.pageHeader}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 className="category-title" style={styles.pageTitle}>Kategori Produk</h1>
            <Badge variant="primary" withDot>
              {totalAllCategories} Kategori
            </Badge>
          </div>
          <p className="category-subtitle" style={styles.pageSubtitle}>
            Kelola kelompok menu dan produk untuk memudahkan kasir.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Button
            variant="outline"
            icon={SlidersHorizontal}
            onClick={openReorderModal}
            size="md"
            title="Atur Urutan Tab Kategori di Layar Kasir"
          >
            Atur Urutan Tab
          </Button>
          <Button
            variant="primary"
            icon={Plus}
            onClick={openAddModal}
            size="md"
            className="category-add-btn"
          >
            Tambah Kategori
          </Button>
        </div>
      </div>

      {/* Main Card Container */}
      <div className="blue-card category-card-wrapper" style={{ padding: 0 }}>
        {/* Toolbar (Search, Sort, Batch Delete) */}
        <div className="category-toolbar" style={styles.toolbar}>
          <div className="category-toolbar-inputs" style={styles.leftToolbar}>
            {/* Search Input */}
            <div className="category-search-box" style={styles.searchWrapper}>
              <Search size={16} color="var(--neutral-400)" style={styles.filterIcon} />
              <input
                type="text"
                className="blue-input"
                style={styles.filterInput}
                placeholder="Cari kategori..."
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
            <div className="category-sort-box" style={styles.sortWrapper}>
              <ArrowUpDown size={15} color="var(--neutral-400)" style={styles.filterIcon} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="blue-input"
                style={styles.filterSelect}
              >
                <option value="custom">Urutan Tab Kasir</option>
                <option value="date-desc">Terbaru</option>
                <option value="date-asc">Terlama</option>
                <option value="name-asc">Nama (A - Z)</option>
                <option value="name-desc">Nama (Z - A)</option>
              </select>
              <ChevronDown size={14} color="var(--neutral-400)" style={styles.filterChevron} />
            </div>
          </div>

          {/* Batch Actions Button */}
          {isSomeSelected && (
            <div className="category-batch-bar" style={styles.batchBar}>
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
              title="Gagal Memuat Data Kategori" 
              message={error} 
              onRetry={refetch} 
            />
          </div>
        )}

        {isLoading ? (
          <div style={{ padding: '16px' }}>
            <TableSkeleton rows={5} cols={4} />
          </div>
        ) : (
          <>
            {/* 1. DESKTOP & TABLET DATA TABLE (Visible ≥ 640px) */}
            <div className="desktop-table-wrapper" style={{ overflowX: 'auto' }}>
          <table className="blue-table">
            <thead>
              <tr>
                <th style={{ width: '48px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={isAllCurrentSelected}
                    onChange={() => toggleSelectAll(currentPageIds)}
                    disabled={paginatedCategories.length === 0}
                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                    title="Pilih Semua Halaman Ini"
                  />
                </th>
                <th style={{ width: '80px', textAlign: 'center' }}>No</th>
                <th>Nama Kategori</th>
                <th style={{ width: '120px', textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCategories.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: 0 }}>
                    <EmptyState
                      icon={Layers}
                      title={searchTerm ? 'Kategori Tidak Ditemukan' : 'Belum Ada Kategori'}
                      description={
                        searchTerm
                          ? `Tidak ditemukan kategori dengan kata kunci "${searchTerm}".`
                          : 'Mulai kelompokkan produk Anda dengan menambahkan kategori pertama.'
                      }
                      actionLabel={searchTerm ? 'Reset Pencarian' : 'Tambah Kategori'}
                      onAction={searchTerm ? () => setSearchTerm('') : openAddModal}
                    />
                  </td>
                </tr>
              ) : (
                paginatedCategories.map((item, index) => {
                  const isSelected = selectedIds.includes(item.id);
                  const rowNumber = (currentPage - 1) * itemsPerPage + index + 1;

                  return (
                    <tr
                      key={item.id}
                      style={{
                        backgroundColor: isSelected ? 'var(--blue-50)' : 'transparent'
                      }}
                    >
                      {/* Checkbox */}
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(item.id)}
                          style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                        />
                      </td>

                      {/* Penomoran Format #1 */}
                      <td style={{ textAlign: 'center' }}>
                        <span style={styles.rowNumberTag}>
                          #{rowNumber}
                        </span>
                      </td>

                      {/* Nama Kategori */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={styles.categoryIconCircle}>
                            <Layers size={16} color="var(--blue-600)" />
                          </div>
                          <div>
                            <span style={styles.categoryName}>
                              {item.name}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button
                            onClick={() => openEditModal(item)}
                            style={styles.actionEditBtn}
                            title="Edit Kategori"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => openDeleteModal(item)}
                            style={styles.actionDeleteBtn}
                            title="Hapus Kategori"
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

        {/* 2. MOBILE CARD LIST VIEW (Visible < 640px) */}
        <div className="mobile-categories-wrapper">
          {paginatedCategories.length === 0 ? (
            <EmptyState
              icon={Layers}
              title={searchTerm ? 'Kategori Tidak Ditemukan' : 'Belum Ada Kategori'}
              description={
                searchTerm
                  ? `Tidak ada hasil untuk "${searchTerm}".`
                  : 'Tambahkan kategori pertama Anda.'
              }
              actionLabel={searchTerm ? 'Reset Pencarian' : 'Tambah Kategori'}
              onAction={searchTerm ? () => setSearchTerm('') : openAddModal}
            />
          ) : (
            <div className="mobile-units-container">
              {/* Cards */}
              {paginatedCategories.map((item, index) => {
                const isSelected = selectedIds.includes(item.id);
                const rowNumber = (currentPage - 1) * itemsPerPage + index + 1;

                return (
                  <div
                    key={item.id}
                    className={`mobile-unit-card ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => toggleSelect(item.id)}
                  >
                    <div className="mobile-unit-left">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(item.id)}
                        onClick={(e) => e.stopPropagation()}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <span style={styles.rowNumberTag}>
                        #{rowNumber}
                      </span>
                      <div style={styles.categoryIconCircle}>
                        <Layers size={16} color="var(--blue-600)" />
                      </div>
                      <span className="mobile-unit-name">
                        {item.name}
                      </span>
                    </div>

                    <div className="mobile-unit-actions" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="mobile-action-btn mobile-action-edit"
                        onClick={() => openEditModal(item)}
                        aria-label={`Edit ${item.name}`}
                      >
                        <Edit3 size={17} />
                      </button>
                      <button
                        className="mobile-action-btn mobile-action-delete"
                        onClick={() => openDeleteModal(item)}
                        aria-label={`Hapus ${item.name}`}
                      >
                        <Trash2 size={17} />
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

      {/* Embedded Mobile Responsive Styles */}
      <style>{`
        .mobile-categories-wrapper {
          display: none;
        }

        @media (max-width: 1024px) {
          .category-list-page {
            padding: 0 !important;
          }
          .desktop-table-wrapper {
            display: none !important;
          }
          .mobile-categories-wrapper {
            display: block !important;
          }
          .category-header-section {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 14px !important;
            margin-bottom: 16px !important;
          }
          .category-title {
            font-size: 1.25rem !important;
          }
          .category-subtitle {
            font-size: 0.75rem !important;
          }
          .category-add-btn {
            width: 100% !important;
            min-height: 44px !important;
          }
          .category-toolbar {
            padding: 16px !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
          }
          .category-toolbar-inputs {
            display: flex !important;
            flex-direction: column !important;
            width: 100% !important;
            gap: 12px !important;
            margin: 0 !important;
          }
          .category-search-box,
          .category-sort-box {
            width: 100% !important;
            max-width: 100% !important;
            min-width: 100% !important;
            margin: 0 !important;
          }
          .category-batch-bar {
            width: 100% !important;
            justify-content: space-between !important;
            margin-top: 4px !important;
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
  categoryIconCircle: {
    width: '34px',
    height: '34px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--blue-50)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  categoryName: {
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
  }
};

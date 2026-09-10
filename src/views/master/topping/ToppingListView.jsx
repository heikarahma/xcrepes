import React from 'react';
import { useTopping } from '../../../controllers/ToppingController';
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
  Sparkles, 
  X, 
  ArrowUpDown,
  ChevronDown,
  Layers,
  Coins,
  Package
} from 'lucide-react';

export const ToppingListView = () => {
  const {
    toppings,
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
    paginatedToppings,
    totalPages,
    totalItems,
    totalAllToppings,
    calculateToppingCost,
    openAddModal,
    openEditModal,
    openDeleteModal,
    openBatchDeleteModal
  } = useTopping();

  const currentPageIds = paginatedToppings.map(t => t.id);
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
    <div className="topping-list-page animate-fade-in" style={styles.container}>
      {/* Top Title & Primary Action */}
      <div className="topping-header-section" style={styles.pageHeader}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 className="topping-title" style={styles.pageTitle}>Master Data Topping</h1>
            <Badge variant="primary" withDot>
              {totalAllToppings} Topping
            </Badge>
          </div>
          <p className="topping-subtitle" style={styles.pageSubtitle}>
            Kelola data topping menu dan komposisi takaran bahan baku per porsi.
          </p>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={openAddModal}
          size="md"
          className="topping-add-btn"
        >
          Tambah Topping
        </Button>
      </div>

      {/* Main Card Container */}
      <div className="blue-card topping-card-wrapper" style={{ padding: 0, marginTop: '0px', marginBottom: '0px' }}>
        {/* Toolbar (Search, Sort, Batch Delete) */}
        <div className="topping-toolbar" style={styles.toolbar}>
          <div className="topping-toolbar-inputs" style={styles.leftToolbar}>
            {/* Search Input */}
            <div className="topping-search-box" style={{ ...styles.searchWrapper, flex: 1, minWidth: '200px' }}>
              <Search size={16} color="var(--neutral-400)" style={styles.filterIcon} />
              <input
                type="text"
                className="blue-input"
                style={styles.filterInput}
                placeholder="Cari topping atau komposisi..."
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

            {/* Sort Dropdown Grouped */}
            <div className="topping-sort-box" style={styles.sortWrapper}>
              <ArrowUpDown size={15} color="var(--neutral-400)" style={styles.filterIcon} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="blue-input"
                style={{ ...styles.filterSelect, fontWeight: 600, color: 'var(--neutral-700)' }}
              >
                <optgroup label="Urutkan Data">
                  <option value="date-desc">Terbaru</option>
                  <option value="date-asc">Terlama</option>
                  <option value="name-asc">Nama (A - Z)</option>
                  <option value="name-desc">Nama (Z - A)</option>
                </optgroup>
                <optgroup label="Harga Jual">
                  <option value="price-desc">Tertinggi</option>
                  <option value="price-asc">Terendah</option>
                </optgroup>
              </select>
              <ChevronDown size={14} color="var(--neutral-400)" style={styles.filterChevron} />
            </div>
          </div>

          {/* Batch Actions Button */}
          {isSomeSelected && (
            <div className="topping-batch-bar" style={styles.batchBar}>
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
          <div style={{ padding: '0 16px 16px' }}>
            <ErrorAlert 
              title="Gagal Memuat Data Topping" 
              message={error} 
              onRetry={refetch} 
            />
          </div>
        )}

        {isLoading ? (
          <div style={{ padding: '16px' }}>
            <TableSkeleton rows={5} cols={5} />
          </div>
        ) : (
          <>
            {/* 1. DESKTOP & TABLET DATA TABLE (Visible ≥ 768px) */}
            <div className="desktop-table-wrapper" style={{ overflowX: 'auto' }}>
          <table className="blue-table">
            <thead>
              <tr>
                <th style={{ width: '48px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={isAllCurrentSelected}
                    onChange={() => toggleSelectAll(currentPageIds)}
                    disabled={paginatedToppings.length === 0}
                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                    title="Pilih Semua Halaman Ini"
                  />
                </th>
                <th style={{ width: '70px', textAlign: 'center' }}>No</th>
                <th>Nama Topping</th>
                <th style={{ width: '150px', textAlign: 'right' }}>Harga Jual</th>
                <th style={{ width: '90px', textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedToppings.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: 0 }}>
                    <EmptyState
                      icon={Sparkles}
                      title={searchTerm ? 'Topping Tidak Ditemukan' : 'Belum Ada Topping'}
                      description={
                        searchTerm
                          ? `Tidak ditemukan topping dengan kata kunci "${searchTerm}".`
                          : 'Mulai buat varian topping dan racikan bahan bakunya.'
                      }
                      actionLabel={searchTerm ? 'Reset Pencarian' : 'Tambah Topping'}
                      onAction={searchTerm ? () => setSearchTerm('') : openAddModal}
                    />
                  </td>
                </tr>
              ) : (
                paginatedToppings.map((item, index) => {
                  const isSelected = selectedIds.includes(item.id);
                  const rowNumber = (currentPage - 1) * itemsPerPage + index + 1;
                  const estimatedCost = calculateToppingCost(item.ingredients);

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

                      {/* Nama Topping */}
                      <td>
                        <span style={styles.toppingName}>
                          {item.name}
                        </span>
                      </td>

                      {/* Harga Jual */}
                      <td style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.938rem', color: 'var(--neutral-900)' }}>
                          {formatIDR(item.price || 0)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button
                            onClick={() => openEditModal(item)}
                            style={styles.actionEditBtn}
                            title="Edit Topping"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => openDeleteModal(item)}
                            style={styles.actionDeleteBtn}
                            title="Hapus Topping"
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
        <div className="mobile-toppings-wrapper">
          {paginatedToppings.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title={searchTerm ? 'Topping Tidak Ditemukan' : 'Belum Ada Topping'}
              description={
                searchTerm
                  ? `Tidak ada hasil untuk "${searchTerm}".`
                  : 'Tambahkan topping pertama Anda.'
              }
              actionLabel={searchTerm ? 'Reset Pencarian' : 'Tambah Topping'}
              onAction={searchTerm ? () => setSearchTerm('') : openAddModal}
            />
          ) : (
            <div className="mobile-units-container">
              {/* Cards */}
              {paginatedToppings.map((item, index) => {
                const isSelected = selectedIds.includes(item.id);
                const rowNumber = (currentPage - 1) * itemsPerPage + index + 1;
                const estimatedCost = calculateToppingCost(item.ingredients);

                return (
                  <div
                    key={item.id}
                    className={`mobile-unit-card ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => toggleSelect(item.id)}
                    style={{ flexDirection: 'column', alignItems: 'stretch', gap: '12px' }}
                  >
                    {/* Top Row: Checkbox, #No, Name, Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
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
                        <div>
                          <span className="mobile-unit-name">
                            {item.name}
                          </span>
                        </div>
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

                    {/* Bottom Row: Harga Jual */}
                    <div style={styles.mobileBottomCostRow}>
                      <span style={{ fontSize: '0.813rem', color: 'var(--neutral-700)', fontWeight: 600 }}>
                        Harga Jual:
                      </span>
                      <span style={{ fontWeight: 800, fontSize: '1.063rem', color: 'var(--neutral-900)' }}>
                        {formatIDR(item.price || 0)}
                      </span>
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
        .topping-card-wrapper {
          margin-top: 0px !important;
          margin-bottom: 0px !important;
        }
        .topping-toolbar {
          margin-top: 0px !important;
          margin-bottom: 0px !important;
        }
        .mobile-toppings-wrapper {
          display: none;
        }

        @media (max-width: 1024px) {
          .topping-list-page {
            padding: 0 !important;
          }
          .desktop-table-wrapper {
            display: none !important;
          }
          .mobile-toppings-wrapper {
            display: block !important;
          }
          .topping-header-section {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 14px !important;
            margin-bottom: 16px !important;
          }
          .topping-title {
            font-size: 1.25rem !important;
          }
          .topping-subtitle {
            font-size: 0.75rem !important;
          }
          .topping-add-btn {
            width: 100% !important;
            min-height: 44px !important;
          }
          .topping-toolbar {
            padding: 16px !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
          }
          .topping-toolbar-inputs {
            display: flex !important;
            flex-direction: column !important;
            width: 100% !important;
            gap: 12px !important;
            margin: 0 !important;
          }
          .topping-search-box,
          .topping-sort-box {
            width: 100% !important;
            max-width: 100% !important;
            min-width: 100% !important;
            margin: 0 !important;
          }
          .topping-batch-bar {
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
    marginTop: '0px',
    marginBottom: '0px',
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
    minWidth: '200px',
    maxWidth: '260px',
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
  toppingName: {
    fontSize: '0.938rem',
    fontWeight: 700,
    color: 'var(--neutral-900)',
    display: 'block'
  },
  toppingDescription: {
    fontSize: '0.75rem',
    color: 'var(--neutral-500)',
    marginTop: '2px',
    display: 'block'
  },
  ingredientChipsWrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px'
  },
  ingredientChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '3px 8px',
    backgroundColor: 'var(--blue-50)',
    border: '1px solid var(--blue-200)',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.75rem',
    color: 'var(--blue-900)'
  },
  ingredientChipName: {
    fontWeight: 500
  },
  ingredientChipQty: {
    fontWeight: 700,
    color: 'var(--blue-700)',
    backgroundColor: 'rgba(0, 114, 255, 0.12)',
    padding: '1px 5px',
    borderRadius: 'var(--radius-xs)'
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
  mobileIngredientsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    backgroundColor: 'var(--neutral-50)',
    padding: '10px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-subtle)'
  },
  mobileBottomCostRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '6px',
    borderTop: '1px solid var(--border-subtle)'
  }
};

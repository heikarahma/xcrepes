import React, { useState } from 'react';
import { useProductMenu } from '../../../controllers/ProductMenuController';
import { useCategory } from '../../../controllers/CategoryController';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Pagination } from '../../components/Pagination';
import { EmptyState } from '../../components/EmptyState';
import { TableSkeleton, CardSkeleton } from '../../components/LoadingSkeleton';
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
  Tag, 
  Image as ImageIcon,
  List as ListIcon,
  LayoutGrid
} from 'lucide-react';

export const ProductMenuListView = () => {
  const {
    productMenus,
    isLoading,
    error,
    refetch,
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    sortBy,
    setSortBy,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    paginatedMenus,
    totalPages,
    totalItems,
    totalAllMenus,
    openAddModal,
    openEditModal,
    openDeleteModal
  } = useProductMenu();

  const { categories } = useCategory();

  // View Mode: 'list' (default) vs 'grid'
  const [viewMode, setViewMode] = useState('list');

  // Currency formatter
  const formatIDR = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const renderPromoBadge = (type, amount) => {
    if (type === 'none' || !type) return null;
    
    if (type === 'discount') {
      return (
        <div style={styles.promoBadge}>
          <Tag size={12} />
          <span>Diskon {formatIDR(amount)}</span>
        </div>
      );
    }
    if (type === 'buy2_discount') {
      return (
        <div style={{ ...styles.promoBadge, backgroundColor: 'var(--amber-100)', color: 'var(--amber-800)', border: '1px solid var(--amber-200)' }}>
          <Tag size={12} />
          <span>Beli 2 Diskon {formatIDR(amount)}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="product-menu-list-page animate-fade-in" style={styles.container}>
      {/* Top Title & Primary Action */}
      <div className="page-header-section" style={styles.pageHeader}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={styles.pageTitle}>Daftar Menu Produk</h1>
            <Badge variant="primary" withDot>
              {totalAllMenus} Menu
            </Badge>
          </div>
          <p style={styles.pageSubtitle}>
            Kelola daftar menu produk, foto, harga, dan komposisi bahan baku.
          </p>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={openAddModal}
          size="md"
        >
          Tambah Menu
        </Button>
      </div>

      {/* Main Card Container */}
      <div className="blue-card product-menu-main-card" style={{ padding: 0 }}>
        {/* Toolbar (Search, Category Fill-Content, Sort & List/Grid Row) */}
        <div className="product-menu-toolbar" style={styles.toolbar}>
          <div className="product-menu-toolbar-inner">
            {/* 1. Search Input */}
            <div className="product-menu-search-wrapper" style={styles.searchWrapper}>
              <Search size={16} color="var(--neutral-400)" style={styles.filterIcon} />
              <input
                type="text"
                className="blue-input"
                style={styles.filterInput}
                placeholder="Cari menu produk..."
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

            {/* 2. Category Filter Dropdown (Fill Content on Mobile) */}
            <div className="product-menu-category-wrapper">
              <div style={styles.relativeField}>
                <Layers size={15} color="var(--neutral-400)" style={styles.filterIcon} />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="blue-input product-menu-select"
                  style={{ ...styles.filterSelect, fontWeight: 600, color: 'var(--neutral-700)' }}
                >
                  <option value="all">Semua Kategori ({totalAllMenus})</option>
                  {categories.map(cat => {
                    const count = productMenus.filter(m => m.categoryId === cat.id).length;
                    return (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} ({count})
                      </option>
                    );
                  })}
                </select>
                <ChevronDown size={14} color="var(--neutral-400)" style={styles.filterChevron} />
              </div>
            </div>

            {/* 3. Satu Jajar: Dropdown Urutkan & List/Grid Switcher (Both Fill Content 50%-50%) */}
            <div className="product-menu-sort-and-view-row">
              {/* Sort Dropdown */}
              <div className="product-menu-sort-wrapper">
                <div style={styles.relativeField}>
                  <ArrowUpDown size={15} color="var(--neutral-400)" style={styles.filterIcon} />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="blue-input product-menu-select"
                    style={{ ...styles.filterSelect, fontWeight: 600, color: 'var(--neutral-700)' }}
                  >
                    <optgroup label="Urutkan Kategori">
                      <option value="category-asc">Kategori (A - Z)</option>
                      <option value="category-desc">Kategori (Z - A)</option>
                    </optgroup>
                    <optgroup label="Urutkan Menu & Waktu">
                      <option value="date-desc">Terbaru</option>
                      <option value="date-asc">Terlama</option>
                      <option value="name-asc">Nama (A - Z)</option>
                      <option value="name-desc">Nama (Z - A)</option>
                    </optgroup>
                    <optgroup label="Harga Jual">
                      <option value="price-desc">Harga Tertinggi</option>
                      <option value="price-asc">Harga Terendah</option>
                    </optgroup>
                  </select>
                  <ChevronDown size={14} color="var(--neutral-400)" style={styles.filterChevron} />
                </div>
              </div>

              {/* View Mode Toggle (List vs Grid) */}
              <div className="product-menu-view-wrapper">
                <div className="product-menu-view-switcher">
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`product-menu-view-btn ${viewMode === 'list' ? 'is-active' : ''}`}
                    title="Tampilan List"
                  >
                    <ListIcon size={15} />
                    <span>List</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`product-menu-view-btn ${viewMode === 'grid' ? 'is-active' : ''}`}
                    title="Tampilan Grid"
                  >
                    <LayoutGrid size={15} />
                    <span>Grid</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div style={{ marginBottom: '16px' }}>
            <ErrorAlert 
              title="Gagal Memuat Menu Produk" 
              message={error} 
              onRetry={refetch} 
            />
          </div>
        )}

        {isLoading ? (
          viewMode === 'list' ? (
            <div style={{ padding: '16px 0' }}>
              <TableSkeleton rows={5} cols={4} />
            </div>
          ) : (
            <CardSkeleton count={8} />
          )
        ) : (
          /* List View vs Card Grid View */
          viewMode === 'list' ? (
          <div className="product-menu-list-container" style={styles.listContainer}>
            {paginatedMenus.length === 0 ? (
              <div style={{ padding: '40px 0' }}>
                <EmptyState
                  icon={Sparkles}
                  title={searchTerm || categoryFilter !== 'all' ? 'Menu Tidak Ditemukan' : 'Belum Ada Menu'}
                  description={
                    searchTerm || categoryFilter !== 'all'
                      ? 'Coba sesuaikan kata kunci pencarian atau filter kategori.'
                      : 'Mulai buat menu produk pertama Anda beserta fotonya.'
                  }
                  actionLabel={searchTerm || categoryFilter !== 'all' ? 'Reset Pencarian' : 'Tambah Menu'}
                  onAction={searchTerm || categoryFilter !== 'all' ? () => { setSearchTerm(''); setCategoryFilter('all'); } : openAddModal}
                />
              </div>
            ) : (
              paginatedMenus.map((item) => (
                <div key={item.id} className="product-menu-list-card" style={styles.listCard}>
                  {/* Left Column: Image (clean, no badge overlay) */}
                  <div style={styles.listCardLeft}>
                    <div style={styles.listImageWrapper}>
                      {item.image ? (
                        <img src={item.image} alt={item.name} style={styles.listImage} />
                      ) : (
                        <div style={styles.listImagePlaceholder}>
                          <ImageIcon size={24} color="var(--neutral-400)" />
                        </div>
                      )}
                    </div>

                    {/* Middle Column: Title with Promo Badge on right side, Details, Price */}
                    <div style={styles.listInfo}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', minWidth: 0 }}>
                        <h3 className="product-menu-list-title" style={styles.listMenuName} title={item.name}>
                          {item.name}
                        </h3>
                        {renderPromoBadge(item.promoType, item.promoAmount)}
                      </div>

                      {item.toppings?.length > 0 && (
                        <div style={styles.listDetailsRow}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Sparkles size={13} color="var(--amber-500)" />
                            <span>{item.toppings.length} topping</span>
                          </div>
                        </div>
                      )}

                      <div className="product-menu-list-price" style={styles.listPriceTag}>
                        {formatIDR(item.price)}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="product-menu-list-actions" style={styles.listCardActions}>
                    <button 
                      type="button"
                      className="product-menu-action-btn"
                      style={{ ...styles.listBtn, color: 'var(--blue-600)', backgroundColor: 'var(--blue-50)', borderColor: 'var(--blue-100)' }}
                      onClick={() => openEditModal(item)}
                      title="Edit Menu"
                    >
                      <Edit3 size={15} /> <span>Edit</span>
                    </button>
                    <button 
                      type="button"
                      className="product-menu-action-btn"
                      style={{ ...styles.listBtn, color: 'var(--red-600)', backgroundColor: 'var(--red-50)', borderColor: 'var(--red-100)' }}
                      onClick={() => openDeleteModal(item)}
                      title="Hapus Menu"
                    >
                      <Trash2 size={15} /> <span>Hapus</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Card Grid View */
          <div className="product-menu-grid" style={styles.gridContainer}>
            {paginatedMenus.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', padding: '40px 0' }}>
                <EmptyState
                  icon={Sparkles}
                  title={searchTerm || categoryFilter !== 'all' ? 'Menu Tidak Ditemukan' : 'Belum Ada Menu'}
                  description={
                    searchTerm || categoryFilter !== 'all'
                      ? 'Coba sesuaikan kata kunci pencarian atau filter kategori.'
                      : 'Mulai buat menu produk pertama Anda beserta fotonya.'
                  }
                  actionLabel={searchTerm || categoryFilter !== 'all' ? 'Reset Pencarian' : 'Tambah Menu'}
                  onAction={searchTerm || categoryFilter !== 'all' ? () => { setSearchTerm(''); setCategoryFilter('all'); } : openAddModal}
                />
              </div>
            ) : (
              paginatedMenus.map((item) => (
                <div key={item.id} className="product-menu-card" style={styles.card}>
                  {/* Card Image Wrapper */}
                  <div style={styles.cardImageWrapper}>
                    {item.image ? (
                      <img src={item.image} alt={item.name} style={styles.cardImage} />
                    ) : (
                      <div style={styles.cardImagePlaceholder}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                          <div style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '10px',
                            backgroundColor: 'var(--neutral-200)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <ImageIcon size={22} color="var(--neutral-400)" />
                          </div>
                          <span style={{ fontSize: '0.688rem', fontWeight: 600, color: 'var(--neutral-400)' }}>
                            Belum ada foto
                          </span>
                        </div>
                      </div>
                    )}
                    {/* Promo Badge Positioned Over Image */}
                    <div style={styles.promoBadgeContainer}>
                      {renderPromoBadge(item.promoType, item.promoAmount)}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="product-menu-card-content" style={styles.cardContent}>
                    <h3 className="product-menu-card-name" style={styles.menuName}>{item.name}</h3>
                    
                    {item.toppings?.length > 0 && (
                      <div style={styles.ingredientsInfo}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Sparkles size={14} color="var(--amber-500)" />
                          <span>{item.toppings.length} topping opsi</span>
                        </div>
                      </div>
                    )}

                    <div style={styles.priceRow}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.688rem', color: 'var(--neutral-500)', fontWeight: 600 }}>Harga Jual</span>
                        <span className="product-menu-card-price" style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--blue-600)' }}>
                          {formatIDR(item.price)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="product-menu-card-actions" style={styles.cardActions}>
                    <button 
                      style={{ ...styles.actionBtn, color: 'var(--blue-600)', backgroundColor: 'var(--blue-50)', border: '1px solid var(--blue-100)' }}
                      onClick={() => openEditModal(item)}
                    >
                      <Edit3 size={15} /> Edit
                    </button>
                    <button 
                      style={{ ...styles.actionBtn, color: 'var(--red-600)', backgroundColor: 'var(--red-50)', border: '1px solid var(--red-100)' }}
                      onClick={() => openDeleteModal(item)}
                    >
                      <Trash2 size={15} /> Hapus
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )
      )}

        {/* Responsive Styling for List & Grid */}
        <style>{`
          .product-menu-list-card:hover {
            border-color: var(--blue-200) !important;
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08) !important;
            transform: translateY(-1px);
          }
          @media (max-width: 1024px) {
            .product-menu-list-page .blue-card,
            .product-menu-main-card {
              margin: 16px 0 !important;
              padding: 16px !important;
              border-radius: 12px !important;
              box-sizing: border-box !important;
            }
            .product-menu-toolbar {
              padding: 0 0 14px 0 !important;
            }
            .product-menu-list-container {
              padding: 14px 0 0 0 !important;
              gap: 10px !important;
            }
            .product-menu-list-card {
              padding: 12px 14px !important;
              border-radius: 12px !important;
            }
            .product-menu-grid {
              grid-template-columns: repeat(2, 1fr) !important;
              gap: 12px !important;
              padding: 14px 0 0 0 !important;
            }
            .product-menu-card {
              border-radius: 10px !important;
            }
            .product-menu-card-content {
              padding: 10px 10px 8px !important;
            }
            .product-menu-card-name {
              font-size: 0.813rem !important;
              line-height: 1.25 !important;
            }
            .product-menu-card-price {
              font-size: 0.938rem !important;
            }
            .product-menu-card-actions {
              padding: 8px 8px !important;
              gap: 6px !important;
            }
            .product-menu-card-actions button {
              padding: 6px 4px !important;
              font-size: 0.75rem !important;
              gap: 4px !important;
            }
            .product-menu-card-actions button svg {
              width: 13px !important;
              height: 13px !important;
            }
          }
          @media (max-width: 540px) {
            .product-menu-list-card {
              flex-direction: column !important;
              align-items: stretch !important;
              gap: 12px !important;
            }
            .product-menu-list-actions {
              display: flex !important;
              width: 100% !important;
              padding-top: 10px !important;
              border-top: 1px dashed var(--neutral-200) !important;
              gap: 8px !important;
            }
            .product-menu-action-btn {
              flex: 1 !important;
              justify-content: center !important;
            }
          }
        `}</style>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>

      <style>{`
        /* Desktop layout (> 768px) */
        .product-menu-toolbar-inner {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          width: 100%;
        }

        .product-menu-search-wrapper {
          flex: 1;
          min-width: 200px;
        }

        .product-menu-search-wrapper input {
          height: 42px !important;
          min-height: 42px !important;
          max-height: 42px !important;
          padding: 0 36px 0 38px !important;
          font-size: 0.813rem !important;
          line-height: 42px !important;
          border-radius: 8px !important;
          box-sizing: border-box !important;
        }

        .product-menu-category-wrapper {
          width: auto;
          min-width: 180px;
        }

        .product-menu-category-wrapper select {
          height: 42px !important;
          min-height: 42px !important;
          max-height: 42px !important;
          padding: 0 32px 0 38px !important;
          font-size: 0.813rem !important;
          border-radius: 8px !important;
          box-sizing: border-box !important;
        }

        .product-menu-sort-and-view-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .product-menu-sort-wrapper {
          width: auto;
          min-width: 170px;
        }

        .product-menu-sort-wrapper select {
          height: 42px !important;
          min-height: 42px !important;
          max-height: 42px !important;
          padding: 0 32px 0 38px !important;
          font-size: 0.813rem !important;
          border-radius: 8px !important;
          box-sizing: border-box !important;
        }

        .product-menu-view-wrapper {
          flex-shrink: 0;
          display: flex;
          align-items: center;
        }

        .product-menu-view-switcher {
          display: flex !important;
          align-items: stretch !important;
          height: 42px !important;
          min-height: 42px !important;
          max-height: 42px !important;
          background-color: var(--neutral-100) !important;
          border-radius: 8px !important;
          padding: 3px !important;
          border: 1px solid var(--neutral-200) !important;
          box-sizing: border-box !important;
        }

        .product-menu-view-btn {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 6px !important;
          height: 100% !important;
          min-height: 100% !important;
          max-height: 100% !important;
          padding: 0 14px !important;
          border-radius: 6px !important;
          border: none !important;
          font-size: 0.813rem !important;
          font-weight: 600 !important;
          cursor: pointer !important;
          background-color: transparent !important;
          color: var(--neutral-600) !important;
          transition: all 0.15s ease !important;
          box-sizing: border-box !important;
        }

        .product-menu-view-btn.is-active {
          background-color: #ffffff !important;
          color: var(--blue-600) !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08) !important;
          font-weight: 700 !important;
        }

        /* Tablet & Mobile layout (<= 1024px) */
        @media (max-width: 1024px) {
          .product-menu-list-page {
            padding: 0 !important;
            margin: 0 !important;
          }

          .product-menu-main-card {
            border-radius: 14px !important;
            overflow: hidden !important;
            margin: 12px 0 24px 0 !important;
            box-shadow: var(--shadow-sm) !important;
          }

          .product-menu-toolbar {
            padding: 12px 14px !important;
          }

          .product-menu-toolbar-inner {
            display: flex !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 10px !important;
            width: 100% !important;
          }

          /* Baris 1: Pencarian Penuh (Uniform 42px height) */
          .product-menu-search-wrapper {
            width: 100% !important;
            min-width: 100% !important;
            flex: none !important;
          }

          .product-menu-search-wrapper input {
            height: 42px !important;
            min-height: 42px !important;
            max-height: 42px !important;
            padding: 0 36px 0 38px !important;
            font-size: 13.5px !important;
            line-height: 42px !important;
            border-radius: 8px !important;
            width: 100% !important;
            box-sizing: border-box !important;
          }

          /* Baris 2: Dropdown Kategori Fill Content (Uniform 42px height) */
          .product-menu-category-wrapper {
            width: 100% !important;
            min-width: 100% !important;
          }

          .product-menu-category-wrapper select {
            width: 100% !important;
            height: 42px !important;
            min-height: 42px !important;
            max-height: 42px !important;
            padding: 0 32px 0 38px !important;
            font-size: 13px !important;
            border-radius: 8px !important;
            text-overflow: ellipsis !important;
            background-color: var(--bg-surface) !important;
            box-sizing: border-box !important;
          }

          /* Baris 3: Satu Jajar Dropdown Urutkan & List/Grid (Sama-sama 42px height) */
          .product-menu-sort-and-view-row {
            display: flex !important;
            flex-direction: row !important;
            width: 100% !important;
            gap: 10px !important;
            align-items: stretch !important;
          }

          /* Dropdown Urutkan (42px height) */
          .product-menu-sort-wrapper {
            flex: 1 1 0 !important;
            width: 50% !important;
            min-width: 0 !important;
          }

          .product-menu-sort-wrapper select {
            width: 100% !important;
            min-width: 0 !important;
            height: 42px !important;
            min-height: 42px !important;
            max-height: 42px !important;
            padding: 0 32px 0 38px !important;
            font-size: 13px !important;
            border-radius: 8px !important;
            text-overflow: ellipsis !important;
            background-color: var(--bg-surface) !important;
            box-sizing: border-box !important;
          }

          /* List/Grid Switcher (42px height matching dropdown) */
          .product-menu-view-wrapper {
            flex: 1 1 0 !important;
            width: 50% !important;
            min-width: 0 !important;
            display: flex !important;
          }

          .product-menu-view-switcher {
            width: 100% !important;
            height: 42px !important;
            min-height: 42px !important;
            max-height: 42px !important;
            display: flex !important;
            align-items: stretch !important;
            border-radius: 8px !important;
            padding: 3px !important;
            background-color: var(--neutral-100) !important;
            border: 1px solid var(--border-color) !important;
            box-sizing: border-box !important;
          }

          .product-menu-view-btn {
            flex: 1 1 0 !important;
            width: 50% !important;
            height: 100% !important;
            min-height: unset !important;
            max-height: 100% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 5px !important;
            font-size: 13px !important;
            font-weight: 600 !important;
            border-radius: 6px !important;
            padding: 0 4px !important;
            box-sizing: border-box !important;
          }

          .product-menu-search-wrapper button {
            min-height: unset !important;
            height: 24px !important;
            width: 24px !important;
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
    padding: '16px 20px',
    borderBottom: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-surface)'
  },
  searchWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%'
  },
  relativeField: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%'
  },
  sortWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    minWidth: '180px'
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
    fontSize: '0.813rem',
    boxSizing: 'border-box'
  },
  filterSelect: {
    width: '100%',
    paddingLeft: '38px',
    paddingRight: '30px',
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
    zIndex: 2,
    border: 'none',
    background: 'none'
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px',
    padding: '20px'
  },
  card: {
    backgroundColor: '#fff',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    cursor: 'default'
  },
  cardImageWrapper: {
    position: 'relative',
    width: '100%',
    paddingTop: '75%', // 4:3 Aspect Ratio
    backgroundColor: 'var(--neutral-100)',
    overflow: 'hidden'
  },
  cardImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  cardImagePlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  promoBadgeContainer: {
    position: 'absolute',
    top: '10px',
    left: '10px',
    zIndex: 1
  },
  categoryBadgeContainer: {
    position: 'absolute',
    bottom: '10px',
    right: '10px',
    zIndex: 1
  },
  promoBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    backgroundColor: 'var(--red-500)',
    color: '#fff',
    borderRadius: '4px',
    fontSize: '0.688rem',
    fontWeight: 700,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    flexShrink: 0
  },
  categoryBadge: {
    display: 'inline-block',
    padding: '4px 8px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    color: 'var(--neutral-800)',
    borderRadius: '4px',
    fontSize: '0.688rem',
    fontWeight: 600,
    backdropFilter: 'blur(4px)'
  },
  cardContent: {
    padding: '16px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  menuName: {
    fontSize: '1rem',
    fontWeight: 700,
    color: 'var(--neutral-900)',
    margin: '0 0 8px 0',
    lineHeight: 1.3
  },
  ingredientsInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    fontSize: '0.75rem',
    color: 'var(--neutral-500)',
    marginBottom: '16px'
  },
  priceRow: {
    marginTop: 'auto',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between'
  },
  cardActions: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1px',
    borderTop: '1px solid var(--border-color)',
    backgroundColor: 'var(--border-color)'
  },
  actionBtn: {
    padding: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    fontSize: '0.813rem',
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    backgroundColor: '#fff'
  },

  // List View Styles
  listContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '20px'
  },
  listCard: {
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-color)',
    borderRadius: '14px',
    padding: '14px 18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    transition: 'all 0.18s ease',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
    boxSizing: 'border-box'
  },
  listCardLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flex: 1,
    minWidth: 0
  },
  listImageWrapper: {
    position: 'relative',
    width: '76px',
    height: '76px',
    borderRadius: '12px',
    overflow: 'hidden',
    flexShrink: 0,
    backgroundColor: 'var(--neutral-100)',
    border: '1px solid var(--border-subtle)'
  },
  listImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  listImagePlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--neutral-100)'
  },
  listPromoBadgeOverlay: {
    position: 'absolute',
    top: '4px',
    left: '4px',
    backgroundColor: 'var(--red-500)',
    color: '#ffffff',
    padding: '2px 5px',
    borderRadius: '4px',
    fontSize: '0.625rem',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center'
  },
  listInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
    minWidth: 0
  },
  listMetaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap'
  },
  listCategoryBadge: {
    fontSize: '0.688rem',
    fontWeight: 700,
    color: 'var(--neutral-600)',
    backgroundColor: 'var(--neutral-100)',
    padding: '2px 8px',
    borderRadius: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.4px'
  },
  listMenuName: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 700,
    color: 'var(--neutral-900)',
    lineHeight: 1.3,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  listDetailsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '0.75rem',
    color: 'var(--neutral-500)',
    flexWrap: 'wrap'
  },
  listPriceTag: {
    fontSize: '1.063rem',
    fontWeight: 800,
    color: 'var(--blue-600)',
    marginTop: '2px'
  },
  listCardActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0
  },
  listBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    fontSize: '0.813rem',
    fontWeight: 600,
    borderRadius: '8px',
    border: '1px solid',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  viewSwitcher: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'var(--neutral-100)',
    borderRadius: '8px',
    padding: '3px',
    border: '1px solid var(--neutral-200)',
    flexShrink: 0
  },
  viewSwitchBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px',
    padding: '6px 12px',
    borderRadius: '6px',
    border: 'none',
    fontSize: '0.813rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  viewSwitchBtnActive: {
    backgroundColor: '#ffffff',
    color: 'var(--blue-600)',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
    fontWeight: 700
  },
  viewSwitchBtnInactive: {
    backgroundColor: 'transparent',
    color: 'var(--neutral-600)'
  }
};

import React, { useState } from 'react';
import { useProductMenu } from '../../controllers/ProductMenuController';
import { useCategory } from '../../controllers/CategoryController';
import { useOrder } from '../../controllers/OrderController';
import { useRawMaterial } from '../../controllers/RawMaterialController';
import { useUnit } from '../../controllers/UnitController';
import { useAuth } from '../../controllers/AuthController';
import { calculateItemDiscount, QUICK_PERCENT_PRESETS, QUICK_NOMINAL_PRESETS, checkMenuAvailability } from '../../models';
import { InitialsAvatar } from '../components/InitialsAvatar';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { ErrorAlert } from '../components/ErrorAlert';
import {
  Search,
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Sparkles,
  Tag,
  ArrowRight,
  RotateCcw,
  User,
  Coffee,
  Utensils,
  Package,
  Layers,
  Store,
  Layers as LayersIcon,
  Percent,
  Coins,
  Ticket,
  PercentCircle,
  Gift,
  ChevronDown,
  Ban,
  AlertCircle,
  SlidersHorizontal
} from 'lucide-react';

export const KasirOrderView = () => {
  const { 
    productMenus, 
    menus: contextMenus, 
    isLoading: isMenusLoading, 
    error: menusError, 
    refetch: refetchMenus 
  } = useProductMenu();
  const menus = Array.isArray(productMenus) ? productMenus : (Array.isArray(contextMenus) ? contextMenus : []);
  const { categories: contextCategories = [], openReorderModal } = useCategory();
  const categories = Array.isArray(contextCategories) ? contextCategories : [];
  const { currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === 'superadmin';
  const { rawMaterials = [] } = useRawMaterial();
  const { showToast } = useUnit();
  const {
    cart = [],
    customerName,
    setCustomerName,
    tableNumber,
    setTableNumber,
    subtotal,
    grossSubtotal,
    itemsDiscountTotal,
    subtotalAfterItemDiscount,
    orderDiscountType,
    setOrderDiscountType,
    orderDiscountValue,
    setOrderDiscountValue,
    orderDiscountAmount,
    selectedDiscountPreset,
    discountPresets = [],
    applyDiscountPreset,
    clearDiscount,
    setItemDiscount,
    discount,
    setDiscount,
    totalAmount,
    totalItemsCount,
    updateQuantity,
    removeFromCart,
    clearCart,
    openToppingModal,
    openEditModal,
    openPaymentModal
  } = useOrder();

  const safeCart = Array.isArray(cart) ? cart : [];

  // Search & Category Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Order Preset Dropdown state & Global Discount Accordion state
  const [showPresetDropdown, setShowPresetDropdown] = useState(false);
  const [isGlobalDiscountOpen, setIsGlobalDiscountOpen] = useState(false);

  // Currency formatter
  const formatIDR = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  // Filtered menus
  const filteredMenus = menus.filter(menu => {
    const matchesSearch = !searchTerm.trim() ||
      menu.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (menu.categoryName && menu.categoryName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = selectedCategory === 'all' || menu.categoryId === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="kasir-order-page animate-fade-in" style={styles.pageLayout}>
      {/* LEFT SECTION: MENU CATALOG */}
      <div className="kasir-catalog-section" style={styles.catalogSection}>
        {/* Catalog Header & Filters */}
        <div className="kasir-catalog-header" style={styles.catalogHeader}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 className="kasir-section-title" style={styles.sectionTitle}>Menu Kasir POS</h1>
              <Badge variant="primary">
                {menus.length} Menu
              </Badge>
            </div>
            <p style={styles.sectionSubtitle}>
              Pilih menu yang dipesan pembeli, lalu tawarkan extra topping.
            </p>
          </div>

          {/* Right Header Actions: Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* Search Bar */}
            <div className="kasir-search-wrapper" style={styles.searchWrapper}>
              <Search size={16} color="var(--neutral-400)" style={styles.searchIcon} />
              <input
                type="text"
                className="blue-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari menu pesanan..."
                style={styles.searchInput}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  style={styles.clearBtn}
                  title="Hapus pencarian"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="kasir-category-scroll" style={styles.categoryScroll}>
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            style={{
              ...styles.categoryPill,
              ...(selectedCategory === 'all' ? styles.categoryPillActive : styles.categoryPillInactive)
            }}
          >
            <LayersIcon size={14} />
            <span>Semua ({menus.length})</span>
          </button>

          {categories.map(cat => {
            const count = menus.filter(m => m.categoryId === cat.id).length;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  ...styles.categoryPill,
                  ...(isSelected ? styles.categoryPillActive : styles.categoryPillInactive)
                }}
              >
                <span>{cat.name}</span>
                <span style={{
                  fontSize: '0.688rem',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : 'var(--neutral-200)',
                  color: isSelected ? '#ffffff' : 'var(--neutral-600)'
                }}>
                  {count}
                </span>
              </button>
            );
          })}

          {/* Tombol Atur Urutan Khusus Super Admin */}
          {isSuperAdmin && (
            <button
              type="button"
              onClick={openReorderModal}
              style={{
                ...styles.categoryPill,
                ...styles.categoryPillInactive,
                borderStyle: 'dashed',
                borderColor: 'var(--blue-400)',
                color: 'var(--blue-600)',
                backgroundColor: 'var(--blue-50)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                marginLeft: '4px',
                cursor: 'pointer'
              }}
              title="Atur Urutan Posisi Tab Kategori (Super Admin)"
            >
              <SlidersHorizontal size={13} />
              <span>Atur Urutan</span>
            </button>
          )}
        </div>

        {/* Error State */}
        {menusError && (
          <div style={{ marginBottom: '16px' }}>
            <ErrorAlert 
              title="Gagal Memuat Menu POS" 
              message={menusError} 
              onRetry={refetchMenus} 
            />
          </div>
        )}

        {/* Menu Grid */}
        {isMenusLoading ? (
          <div style={{ padding: '8px 0' }}>
            <CardSkeleton count={8} />
          </div>
        ) : filteredMenus.length === 0 ? (
          <div style={styles.emptyCatalog}>
            <Store size={44} color="var(--neutral-300)" />
            <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--neutral-700)' }}>
              Menu Tidak Ditemukan
            </span>
            <span style={{ fontSize: '0.813rem', color: 'var(--neutral-500)' }}>
              Coba gunakan kata kunci pencarian atau kategori lain.
            </span>
          </div>
        ) : (
          <div className="kasir-menu-grid" style={styles.menuGrid}>
            {filteredMenus.map(menu => {
              const availability = checkMenuAvailability(menu, rawMaterials);
              const isOutOfStock = !availability.isAvailable;

              const handleCardClick = () => {
                if (isOutOfStock) {
                  showToast(
                    `Menu "${menu.name}" tidak dapat dipesan: ${availability.reason}`,
                    'error',
                    'Stok Bahan Baku Habis'
                  );
                  return;
                }
                openToppingModal(menu);
              };

              return (
                <div
                  key={menu.id}
                  onClick={handleCardClick}
                  className={`kasir-menu-card ${isOutOfStock ? 'kasir-menu-card-disabled' : ''}`}
                  style={{
                    ...styles.menuCard,
                    ...(isOutOfStock ? styles.menuCardDisabled : {})
                  }}
                  title={isOutOfStock ? `Stok bahan baku habis: ${availability.emptyIngredients.map(e => e.rawMaterialName).join(', ')}` : menu.name}
                >
                  {/* Thumbnail / Avatar */}
                  <div style={styles.cardImageContainer}>
                    {menu.image ? (
                      <img
                        src={menu.image}
                        alt={menu.name}
                        style={{
                          ...styles.cardImage,
                          ...(isOutOfStock ? { filter: 'grayscale(80%) opacity(0.55)' } : {})
                        }}
                      />
                    ) : (
                      <InitialsAvatar name={menu.name} size="100%" borderRadius="0" />
                    )}

                    {/* Out of Stock Banner / Badge */}
                    {isOutOfStock ? (
                      <div style={styles.cardOverlayOutOfStock}>
                        <Ban size={12} style={{ flexShrink: 0 }} />
                        <span>STOK BAHAN HABIS</span>
                      </div>
                    ) : (
                      menu.promoType && menu.promoType !== 'none' && (
                        <div style={styles.cardOverlayPromo}>
                          <Tag size={11} />
                          <span>Promo</span>
                        </div>
                      )
                    )}

                    {/* Low Stock Indicator if available but <= 5 portions */}
                    {!isOutOfStock && availability.maxPortions <= 5 && availability.maxPortions < 9999 && (
                      <div style={styles.cardOverlayLowStock}>
                        <span>Sisa {availability.maxPortions} porsi</span>
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="kasir-card-content" style={styles.cardContent}>
                    <h3
                      className="kasir-card-title"
                      style={{
                        ...styles.cardTitle,
                        ...(isOutOfStock ? { color: 'var(--neutral-400)' } : {})
                      }}
                    >
                      {menu.name}
                    </h3>

                    {/* Missing Ingredients Warning Pill */}
                    {isOutOfStock && availability.emptyIngredients.length > 0 && (
                      <div style={styles.missingIngredientWarning}>
                        <AlertCircle size={11} style={{ flexShrink: 0 }} />
                        <span style={styles.missingIngredientText}>
                          {availability.emptyIngredients.map(e => `${e.rawMaterialName} (0)`).join(', ')}
                        </span>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '8px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.688rem', color: 'var(--neutral-500)', fontWeight: 600 }}>Harga</span>
                        <span style={{
                          fontSize: '1.063rem',
                          fontWeight: 800,
                          color: isOutOfStock ? 'var(--neutral-400)' : 'var(--blue-600)'
                        }}>
                          {formatIDR(menu.price)}
                        </span>
                      </div>

                      {isOutOfStock ? (
                        <div style={styles.disabledAddIconPill} title="Tidak dapat dipesan (Stok bahan kosong)">
                          <Ban size={15} />
                        </div>
                      ) : (
                        <div style={styles.addIconPill} title="Pilih Menu & Topping">
                          <Plus size={16} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* RIGHT SECTION: CART / ORDER SUMMARY */}
      <div className="kasir-cart-section" style={styles.cartSection}>
        <div className="blue-card kasir-cart-card" style={styles.cartCard}>
          {/* Cart Header */}
          <div style={styles.cartHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingBag size={20} color="var(--blue-600)" />
              <h2 style={styles.cartTitle}>Pesanan Pembeli</h2>
            </div>
            {safeCart.length > 0 && (
              <Badge variant="primary">
                {totalItemsCount} Item
              </Badge>
            )}
          </div>

          {/* Customer & Table Input Form */}
          <div className="kasir-customer-inputs" style={styles.customerInputRow}>
            <div style={{ flex: 1.3, position: 'relative' }}>
              <input
                type="text"
                className="blue-input"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nama Pembeli (opsional)"
                style={{ width: '100%', height: '36px', fontSize: '0.813rem' }}
              />
            </div>
            <div style={{ flex: 0.8, position: 'relative' }}>
              <input
                type="text"
                className="blue-input"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="No. Meja"
                style={{ width: '100%', height: '36px', fontSize: '0.813rem' }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="kasir-cart-items-scroll" style={styles.cartItemsScroll}>
            {safeCart.length === 0 ? (
              <div style={styles.emptyCartState}>
                <ShoppingBag size={48} color="var(--neutral-300)" />
                <span style={{ fontSize: '0.938rem', fontWeight: 700, color: 'var(--neutral-700)', marginTop: '8px' }}>
                  Keranjang Kosong
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--neutral-400)', textAlign: 'center', maxWidth: '200px' }}>
                  Klik salah satu menu di sebelah kiri untuk menambahkan pesanan.
                </span>
              </div>
            ) : (
              safeCart.map((item) => (
                <div key={item.cartItemId} className="kasir-cart-item-card" style={styles.cartItemCard}>
                  {/* Top Item Row: Title, Toppings, and Price */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                      <span
                        style={{ ...styles.cartItemName, cursor: 'pointer' }}
                        onClick={() => openEditModal(item)}
                        title="Klik untuk ubah pesanan (topping, porsi, catatan)"
                      >
                        {item.name}
                      </span>

                      {/* Topping Labels List */}
                      {item.toppings && item.toppings.length > 0 ? (
                        <div
                          style={{ ...styles.cartToppingBadges, cursor: 'pointer' }}
                          onClick={() => openEditModal(item)}
                          title="Klik untuk ubah extra topping"
                        >
                          {item.toppings.map((top, idx) => {
                            const topQty = Number(top.quantity) || 1;
                            const topUnitPrice = Number(top.price) || 0;
                            return (
                              <span key={idx} style={styles.cartToppingPill}>
                                + {top.name} {topQty > 1 ? `(${topQty}x) ` : ''}({formatIDR(topUnitPrice)})
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <span
                          style={{ ...styles.cartNoToppingPill, cursor: 'pointer' }}
                          onClick={() => openEditModal(item)}
                          title="Klik untuk tambah extra topping"
                        >
                          Tanpa Topping
                        </span>
                      )}

                      {/* Notes if any */}
                      {item.note && (
                        <span
                          style={{ ...styles.cartItemNote, cursor: 'pointer' }}
                          onClick={() => openEditModal(item)}
                          title="Klik untuk ubah catatan"
                        >
                          "{item.note}"
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
                      {item.itemDiscountAmount > 0 ? (
                        <>
                          <span style={{ fontSize: '0.75rem', color: 'var(--neutral-400)', textDecoration: 'line-through' }}>
                            {formatIDR(item.unitPrice * item.quantity)}
                          </span>
                          <span style={{ ...styles.cartItemPrice, color: 'var(--emerald-600)' }}>
                            {formatIDR((item.unitPrice * item.quantity) - item.itemDiscountAmount)}
                          </span>
                        </>
                      ) : (
                        <span style={styles.cartItemPrice}>
                          {formatIDR(item.unitPrice * item.quantity)}
                        </span>
                      )}
                      {item.toppings && item.toppings.length > 0 && item.quantity > 1 && (
                        <span style={{ fontSize: '0.688rem', color: 'var(--blue-600)', fontWeight: 600 }}>
                          (Inc. Topping {formatIDR((item.toppingsTotal || 0) * item.quantity)})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Inline Item Discount */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    marginTop: '2px'
                  }}>
                    {/* Header: Label Diskon Item + Live Hemat Badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px', marginBottom: '2px' }}>
                      <label style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--neutral-800)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        margin: 0
                      }}>
                        <div style={{ width: '18px', height: '18px', borderRadius: '4px', backgroundColor: 'var(--emerald-100)', color: 'var(--emerald-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Tag size={11} />
                        </div>
                        <span>Diskon</span>
                      </label>
                      {item.itemDiscountAmount > 0 && (
                        <span style={{
                          fontSize: '0.656rem',
                          fontWeight: 800,
                          color: '#065f46',
                          backgroundColor: '#d1fae5',
                          border: '1px solid #a7f3d0',
                          padding: '1px 6px',
                          borderRadius: '9999px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}>
                          <Sparkles size={9} /> Hemat -{formatIDR(item.itemDiscountAmount)}
                        </span>
                      )}
                    </div>

                    {/* Dropdown Tipe + Input Besaran Nilai */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1.05fr 0.95fr',
                      gap: '6px',
                      alignItems: 'center',
                      padding: '3px 6px',
                      backgroundColor: '#ffffff',
                      borderRadius: '6px',
                      border: (item.itemDiscountValue > 0) ? '1px solid var(--emerald-400)' : '1px solid var(--neutral-200)'
                    }}>
                      {/* Left Dropdown: Tipe Diskon Item */}
                      <div style={{ position: 'relative' }}>
                        <select
                          value={item.itemDiscountType === 'none' ? 'percent' : (item.itemDiscountType || 'percent')}
                          onChange={(e) => {
                            const newType = e.target.value;
                            setItemDiscount(item.cartItemId, {
                              type: newType,
                              value: item.itemDiscountValue || 0
                            });
                          }}
                          className="blue-input"
                          style={{
                            width: '100%',
                            height: '28px',
                            fontSize: '0.719rem',
                            fontWeight: 600,
                            paddingLeft: '6px',
                            paddingRight: '20px',
                            paddingTop: 0,
                            paddingBottom: 0,
                            appearance: 'none',
                            WebkitAppearance: 'none',
                            MozAppearance: 'none',
                            cursor: 'pointer',
                            backgroundColor: '#ffffff',
                            border: 'none'
                          }}
                          title="Tipe Diskon Item"
                        >
                          <option value="percent">Persentase (%)</option>
                          <option value="fixed">Nominal (Rp)</option>
                        </select>
                        <ChevronDown size={12} color="var(--neutral-400)" style={{ position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                      </div>

                      {/* Right Input: Besaran Diskon Item */}
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <span style={{
                          position: 'absolute',
                          left: '6px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          fontSize: '0.719rem',
                          fontWeight: 700,
                          color: (item.itemDiscountValue > 0) ? 'var(--emerald-600)' : 'var(--neutral-400)',
                          pointerEvents: 'none',
                          zIndex: 1
                        }}>
                          {(item.itemDiscountType === 'fixed') ? 'Rp' : '%'}
                        </span>
                        <input
                          type="number"
                          min="0"
                          max={item.itemDiscountType === 'fixed' ? (item.unitPrice * item.quantity) : 100}
                          value={item.itemDiscountValue === 0 ? '' : item.itemDiscountValue}
                          onChange={(e) => {
                            const val = Math.max(0, Number(e.target.value) || 0);
                            const currentType = (item.itemDiscountType === 'none' || !item.itemDiscountType) ? 'percent' : item.itemDiscountType;
                            const maxVal = currentType === 'fixed' ? (item.unitPrice * item.quantity) : 100;
                            setItemDiscount(item.cartItemId, {
                              type: currentType,
                              value: Math.min(maxVal, val)
                            });
                          }}
                          placeholder="0"
                          className="blue-input"
                          style={{
                            width: '100%',
                            height: '28px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            paddingLeft: (item.itemDiscountType === 'fixed') ? '24px' : '18px',
                            paddingRight: (item.itemDiscountValue > 0) ? '22px' : '6px',
                            paddingTop: 0,
                            paddingBottom: 0,
                            backgroundColor: '#ffffff',
                            border: 'none',
                            color: (item.itemDiscountAmount > 0) ? 'var(--emerald-700)' : 'var(--neutral-900)'
                          }}
                          title="Besaran Diskon Item"
                        />
                        {item.itemDiscountValue > 0 && (
                          <button
                            type="button"
                            onClick={() => setItemDiscount(item.cartItemId, { type: 'none', value: 0 })}
                            style={{
                              position: 'absolute',
                              right: '4px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'none',
                              border: 'none',
                              color: 'var(--neutral-400)',
                              cursor: 'pointer',
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title="Hapus Diskon Item"
                          >
                            <X size={12} strokeWidth={2} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Item Row: Quantity Stepper & Delete */}
                  <div style={styles.cartItemControls}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--neutral-500)' }}>
                        @{formatIDR(item.unitPrice)} / porsi
                      </span>
                      {item.itemDiscountAmount > 0 && (
                        <span style={{ fontSize: '0.688rem', color: 'var(--emerald-600)', fontWeight: 700 }}>
                          Hemat -{formatIDR(item.itemDiscountAmount)}
                        </span>
                      )}
                      {item.toppings && item.toppings.length > 0 && (
                        <span style={{ fontSize: '0.688rem', color: 'var(--neutral-400)' }}>
                          (Menu {formatIDR(item.basePrice)} + Top {formatIDR(item.toppingsTotal)})
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={styles.cartStepper}>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.cartItemId, -1)}
                          style={styles.cartStepperBtn}
                          title="Kurangi"
                        >
                          <Minus size={13} />
                        </button>
                        <span style={styles.cartStepperNumber}>{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.cartItemId, 1)}
                          style={styles.cartStepperBtn}
                          title="Tambah"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.cartItemId)}
                        style={styles.cartDeleteBtn}
                        title="Hapus dari pesanan"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Billing & Action Footer */}
          {safeCart.length > 0 && (
            <div style={styles.cartFooter}>
              {/* Calculations */}
              <div style={styles.billingRows}>
                {/* 1. Gross Subtotal */}
                <div style={styles.billingRow}>
                  <span style={styles.billingLabel}>Subtotal Item:</span>
                  <span style={styles.billingValue}>{formatIDR(grossSubtotal)}</span>
                </div>

                {/* 2. Total Item-level Discounts */}
                {itemsDiscountTotal > 0 && (
                  <div style={{ ...styles.billingRow, color: 'var(--emerald-700)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Tag size={12} color="var(--emerald-600)" />
                      <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Total Diskon Item:</span>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '0.813rem' }}>-{formatIDR(itemsDiscountTotal)}</span>
                  </div>
                )}

                {/* 3. Order-Level Global Discount Section (Collapsible Accordion) */}
                <div className="kasir-order-discount-box" style={{
                  backgroundColor: '#f8fafc',
                  border: orderDiscountValue > 0 ? '1px solid var(--emerald-300)' : '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '9px 11px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: isGlobalDiscountOpen ? '8px' : '0px',
                  margin: '4px 0',
                  transition: 'all 0.2s ease'
                }}>
                  {/* Header: Label Diskon Global + Live Hemat Badge + Toggle Chevron */}
                  <div
                    onClick={() => setIsGlobalDiscountOpen(prev => !prev)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                    title={isGlobalDiscountOpen ? 'Klik untuk tutup input diskon' : 'Klik untuk buka input diskon'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '5px', backgroundColor: 'var(--emerald-100)', color: 'var(--emerald-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Tag size={12} />
                      </div>
                      <span style={{ fontSize: '0.781rem', fontWeight: 700, color: 'var(--neutral-800)' }}>
                        Diskon Global
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {orderDiscountAmount > 0 && (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.719rem',
                          fontWeight: 800,
                          color: '#065f46',
                          backgroundColor: '#d1fae5',
                          border: '1px solid #a7f3d0',
                          padding: '2px 8px',
                          borderRadius: '9999px'
                        }}>
                          <Sparkles size={11} /> Hemat -{formatIDR(orderDiscountAmount)}
                        </span>
                      )}
                      <ChevronDown
                        size={14}
                        color="var(--neutral-500)"
                        style={{
                          transform: isGlobalDiscountOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s ease'
                        }}
                      />
                    </div>
                  </div>

                  {/* Dropdown Type & Value Input in Clean Grid (Collapsible Content) */}
                  {isGlobalDiscountOpen && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', alignItems: 'center', marginTop: '2px' }}>
                      {/* Left Dropdown */}
                      <div style={{ position: 'relative' }}>
                        <select
                          value={orderDiscountType}
                          onChange={(e) => setOrderDiscountType(e.target.value)}
                          className="blue-input"
                          style={{
                            width: '100%',
                            height: '36px',
                            fontSize: '0.781rem',
                            fontWeight: 600,
                            paddingLeft: '10px',
                            paddingRight: '26px',
                            appearance: 'none',
                            WebkitAppearance: 'none',
                            MozAppearance: 'none',
                            cursor: 'pointer',
                            backgroundColor: '#ffffff'
                          }}
                        >
                          <option value="percent">Persentase (%)</option>
                          <option value="fixed">Nominal (Rp)</option>
                        </select>
                        <ChevronDown size={14} color="var(--neutral-400)" style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                      </div>

                      {/* Right Value Input */}
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <span style={{
                          position: 'absolute',
                          left: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          fontSize: '0.781rem',
                          fontWeight: 700,
                          color: orderDiscountValue > 0 ? 'var(--emerald-600)' : 'var(--neutral-400)',
                          pointerEvents: 'none',
                          zIndex: 1
                        }}>
                          {orderDiscountType === 'percent' ? '%' : 'Rp'}
                        </span>
                        <input
                          type="number"
                          min="0"
                          max={orderDiscountType === 'percent' ? 100 : subtotalAfterItemDiscount}
                          value={orderDiscountValue === 0 ? '' : orderDiscountValue}
                          onChange={(e) => {
                            const val = Math.max(0, Number(e.target.value) || 0);
                            const maxVal = orderDiscountType === 'percent' ? 100 : subtotalAfterItemDiscount;
                            setOrderDiscountValue(Math.min(maxVal, val));
                          }}
                          placeholder="0"
                          className="blue-input"
                          style={{
                            width: '100%',
                            height: '36px',
                            fontSize: '0.813rem',
                            fontWeight: 700,
                            paddingLeft: orderDiscountType === 'percent' ? '26px' : '32px',
                            paddingRight: orderDiscountValue > 0 ? '28px' : '10px',
                            backgroundColor: '#ffffff',
                            color: orderDiscountValue > 0 ? 'var(--emerald-700)' : 'var(--neutral-900)'
                          }}
                        />
                        {orderDiscountValue > 0 && (
                          <button
                            type="button"
                            onClick={() => setOrderDiscountValue(0)}
                            style={{
                              position: 'absolute',
                              right: '8px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'none',
                              border: 'none',
                              color: 'var(--neutral-400)',
                              cursor: 'pointer',
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title="Hapus Diskon"
                          >
                            <X size={13} strokeWidth={2} />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Total Discount Row */}
                {discount > 0 && (
                  <div style={{ ...styles.billingRow, color: 'var(--emerald-700)', backgroundColor: 'var(--emerald-50)', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--emerald-200)' }}>
                    <span style={{ ...styles.billingLabel, color: 'var(--emerald-800)', fontWeight: 700 }}>
                      Total Potongan Hemat:
                    </span>
                    <span style={{ fontWeight: 800, fontSize: '0.938rem', color: 'var(--emerald-700)' }}>
                      -{formatIDR(discount)}
                    </span>
                  </div>
                )}

                {/* 5. Total Net to Pay */}
                <div style={styles.totalRow}>
                  <span style={styles.totalLabel}>TOTAL BAYAR:</span>
                  <span style={styles.totalValue}>{formatIDR(totalAmount)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={styles.cartActionBtns}>
                <Button
                  type="button"
                  variant="outline"
                  icon={RotateCcw}
                  onClick={clearCart}
                  style={{ padding: '12px 16px', color: 'var(--red-600)', borderColor: 'var(--red-200)' }}
                  title="Kosongkan Pesanan"
                >
                  Reset
                </Button>

                <Button
                  type="button"
                  variant="primary"
                  icon={ArrowRight}
                  onClick={openPaymentModal}
                  style={{ flex: 1, padding: '12px 0', fontSize: '1rem', fontWeight: 800 }}
                >
                  Bayar ({formatIDR(totalAmount)})
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>


      <style>{`
        @media (max-width: 1024px) {
          .kasir-order-page {
            flex-direction: column !important;
            padding: 0 0 16px 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            gap: 14px !important;
          }
          .kasir-order-page > div,
          .kasir-catalog-section,
          .kasir-cart-section {
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            flex: 1 1 100% !important;
            position: static !important;
          }
          .kasir-catalog-header {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 10px !important;
          }
          .kasir-search-wrapper {
            width: 100% !important;
          }
          .kasir-menu-grid {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)) !important;
            gap: 12px !important;
          }
          .kasir-menu-card {
            border-radius: 10px !important;
          }
          .kasir-menu-card img,
          .kasir-menu-card > div:first-child {
            height: 110px !important;
          }
          .kasir-cart-card {
            padding: 14px 16px !important;
          }
          .kasir-cart-items-scroll {
            max-height: 320px !important;
          }
        }
        @media (max-width: 600px) {
          .kasir-menu-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 10px !important;
          }
          .kasir-menu-card img,
          .kasir-menu-card > div:first-child {
            height: 105px !important;
          }
        }
        @media (max-width: 480px) {
          .kasir-order-page {
            padding: 0 0 20px 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            gap: 12px !important;
          }
          .kasir-section-title {
            font-size: 1.25rem !important;
          }
          .kasir-menu-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 8px !important;
          }
          .kasir-menu-card img,
          .kasir-menu-card > div:first-child {
            height: 90px !important;
          }
          .kasir-card-content {
            padding: 8px 10px !important;
          }
          .kasir-card-title {
            font-size: 0.813rem !important;
            line-height: 1.2 !important;
          }
          .kasir-cart-card {
            padding: 10px !important;
            border-radius: 10px !important;
          }
          .kasir-customer-inputs {
            gap: 6px !important;
          }
          .kasir-customer-inputs input {
            height: 34px !important;
            font-size: 0.75rem !important;
            padding: 0 8px !important;
          }
          .kasir-cart-items-scroll {
            max-height: 230px !important;
            gap: 6px !important;
          }
          .kasir-cart-item-card {
            padding: 7px 9px !important;
            gap: 5px !important;
          }
          .kasir-order-discount-box {
            padding: 7px 9px !important;
          }
          .discount-unified-group {
            height: 34px !important;
          }
          .discount-unified-group select {
            font-size: 0.7rem !important;
            padding-right: 14px !important;
          }
          .discount-unified-group input {
            font-size: 0.813rem !important;
          }
          .discount-presets-row button {
            padding: 2px 5px !important;
            font-size: 0.625rem !important;
          }
          .kasir-modal-content {
            max-width: calc(100vw - 20px) !important;
            border-radius: 12px !important;
          }
        }
        @media (max-width: 390px) {
          .kasir-order-page {
            padding: 8px 6px 16px 6px !important;
          }
          .kasir-menu-grid {
            gap: 6px !important;
          }
          .kasir-menu-card img,
          .kasir-menu-card > div:first-child {
            height: 85px !important;
          }
          .kasir-card-title {
            font-size: 0.75rem !important;
          }
          .discount-unified-group select {
            font-size: 0.65rem !important;
          }
        }
      `}</style>
    </div>
  );
};

const styles = {
  pageLayout: {
    display: 'flex',
    gap: '24px',
    maxWidth: '100%',
    margin: '0',
    padding: '24px',
    alignItems: 'flex-start'
  },
  catalogSection: {
    flex: '1 1 65%',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    minWidth: 0
  },
  catalogHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '16px'
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: 800,
    color: 'var(--neutral-900)',
    margin: 0
  },
  sectionSubtitle: {
    fontSize: '0.875rem',
    color: 'var(--neutral-500)',
    margin: '4px 0 0 0'
  },
  searchWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '280px'
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    pointerEvents: 'none'
  },
  searchInput: {
    width: '100%',
    height: '42px',
    paddingLeft: '38px',
    paddingRight: '32px',
    fontSize: '0.875rem'
  },
  clearBtn: {
    position: 'absolute',
    right: '10px',
    background: 'none',
    border: 'none',
    color: 'var(--neutral-400)',
    cursor: 'pointer',
    padding: '2px',
    display: 'flex',
    alignItems: 'center'
  },
  categoryScroll: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
    paddingBottom: '4px'
  },
  categoryPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 14px',
    borderRadius: '8px',
    fontSize: '0.813rem',
    fontWeight: 600,
    border: '1px solid',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap'
  },
  categoryPillActive: {
    backgroundColor: 'var(--blue-600)',
    borderColor: 'var(--blue-600)',
    color: '#ffffff'
  },
  categoryPillInactive: {
    backgroundColor: '#ffffff',
    borderColor: 'var(--border-color)',
    color: 'var(--neutral-700)'
  },
  menuGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px'
  },
  menuCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
    overflow: 'hidden',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
    boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
  },
  menuCardDisabled: {
    backgroundColor: '#fafafa',
    borderColor: '#e2e8f0',
    cursor: 'not-allowed',
    boxShadow: 'none',
    opacity: 0.88
  },
  cardImageContainer: {
    height: '130px',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'var(--neutral-100)'
  },
  cardImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  cardOverlayCategory: {
    position: 'absolute',
    bottom: '8px',
    left: '8px'
  },
  cardCategoryBadge: {
    fontSize: '0.688rem',
    fontWeight: 700,
    padding: '3px 8px',
    borderRadius: '4px',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    color: 'var(--neutral-800)',
    backdropFilter: 'blur(4px)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  cardOverlayPromo: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.688rem',
    fontWeight: 700,
    padding: '3px 8px',
    borderRadius: '4px',
    backgroundColor: 'var(--amber-500)',
    color: '#ffffff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
  },
  cardOverlayOutOfStock: {
    position: 'absolute',
    top: '8px',
    left: '8px',
    right: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px',
    fontSize: '0.688rem',
    fontWeight: 800,
    padding: '4px 8px',
    borderRadius: '6px',
    backgroundColor: '#dc2626',
    color: '#ffffff',
    boxShadow: '0 2px 6px rgba(220, 38, 38, 0.45)',
    letterSpacing: '0.3px',
    zIndex: 2
  },
  cardOverlayLowStock: {
    position: 'absolute',
    bottom: '8px',
    right: '8px',
    fontSize: '0.688rem',
    fontWeight: 700,
    padding: '2px 7px',
    borderRadius: '4px',
    backgroundColor: 'rgba(245, 158, 11, 0.92)',
    color: '#ffffff',
    backdropFilter: 'blur(4px)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  cardContent: {
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1
  },
  cardTitle: {
    margin: 0,
    fontSize: '0.938rem',
    fontWeight: 700,
    color: 'var(--neutral-900)',
    lineHeight: 1.3
  },
  missingIngredientWarning: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginTop: '5px',
    padding: '3px 6px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '4px',
    color: '#b91c1c',
    fontSize: '0.688rem',
    fontWeight: 600
  },
  missingIngredientText: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  addIconPill: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: 'var(--blue-50)',
    color: 'var(--blue-600)',
    border: '1px solid var(--blue-200)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.15s'
  },
  disabledAddIconPill: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: '#f1f5f9',
    color: '#94a3b8',
    border: '1px solid #cbd5e1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'not-allowed'
  },
  emptyCatalog: {
    padding: '60px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px dashed var(--border-color)',
    gap: '8px'
  },

  // Cart Panel Styles
  cartSection: {
    flex: '0 0 380px',
    position: 'sticky',
    top: '80px',
    width: '380px'
  },
  cartCard: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: 'calc(100vh - 100px)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.06)'
  },
  cartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '12px',
    borderBottom: '1px solid var(--border-color)'
  },
  cartTitle: {
    margin: 0,
    fontSize: '1.125rem',
    fontWeight: 800,
    color: 'var(--neutral-900)'
  },
  customerInputRow: {
    display: 'flex',
    gap: '8px',
    padding: '12px 0',
    borderBottom: '1px solid var(--border-color)'
  },
  cartItemsScroll: {
    flex: 1,
    overflowY: 'auto',
    padding: '10px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    minHeight: '220px',
    maxHeight: '380px'
  },
  emptyCartState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 10px',
    gap: '4px'
  },
  cartItemCard: {
    padding: '10px 12px',
    backgroundColor: 'var(--neutral-50)',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  cartItemName: {
    fontSize: '0.875rem',
    fontWeight: 700,
    color: 'var(--neutral-900)'
  },
  cartToppingBadges: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    marginTop: '4px'
  },
  cartToppingPill: {
    fontSize: '0.688rem',
    color: 'var(--blue-700)',
    fontWeight: 600
  },
  cartNoToppingPill: {
    fontSize: '0.688rem',
    color: 'var(--neutral-500)',
    fontStyle: 'italic',
    marginTop: '2px'
  },
  cartItemNote: {
    fontSize: '0.688rem',
    fontStyle: 'italic',
    color: 'var(--amber-700)',
    marginTop: '2px'
  },
  cartItemPrice: {
    fontSize: '0.875rem',
    fontWeight: 700,
    color: 'var(--neutral-900)'
  },
  cartItemControls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '6px',
    borderTop: '1px dashed var(--neutral-200)'
  },
  cartStepper: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-color)',
    borderRadius: '6px'
  },
  cartStepperBtn: {
    width: '26px',
    height: '26px',
    border: 'none',
    backgroundColor: 'transparent',
    color: 'var(--neutral-700)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  },
  cartStepperNumber: {
    width: '24px',
    textAlign: 'center',
    fontSize: '0.813rem',
    fontWeight: 700,
    color: 'var(--neutral-900)'
  },
  cartDeleteBtn: {
    width: '26px',
    height: '26px',
    border: '1px solid var(--red-200)',
    backgroundColor: '#ffffff',
    color: 'var(--red-500)',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background-color 0.15s'
  },
  cartFooter: {
    borderTop: '1px solid var(--border-color)',
    paddingTop: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  billingRows: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  billingRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.813rem'
  },
  billingLabel: {
    color: 'var(--neutral-600)'
  },
  billingValue: {
    color: 'var(--neutral-900)',
    fontWeight: 600
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '6px',
    borderTop: '1px solid var(--border-color)'
  },
  totalLabel: {
    fontSize: '0.875rem',
    fontWeight: 800,
    color: 'var(--neutral-900)'
  },
  totalValue: {
    fontSize: '1.25rem',
    fontWeight: 800,
    color: 'var(--blue-600)'
  },
  cartActionBtns: {
    display: 'flex',
    gap: '8px'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '16px',
    backdropFilter: 'blur(3px)'
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '440px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    overflow: 'hidden'
  },
  modalHeader: {
    padding: '14px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid var(--border-color)',
    backgroundColor: 'var(--neutral-50)'
  }
};

import React, { useState, useEffect } from 'react';
import { useOrder } from '../../controllers/OrderController';
import { useTopping } from '../../controllers/ToppingController';
import { useRawMaterial } from '../../controllers/RawMaterialController';
import { calculateItemDiscount, QUICK_PERCENT_PRESETS, QUICK_NOMINAL_PRESETS, checkMenuAvailability, checkToppingAvailability } from '../../models';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { InitialsAvatar } from '../components/InitialsAvatar';
import { 
  Plus, 
  Minus, 
  Sparkles, 
  Check, 
  Tag, 
  MessageSquareQuote,
  ShoppingBag,
  Edit3,
  Percent,
  Coins,
  ChevronDown,
  X,
  Ban,
  AlertCircle,
  AlertTriangle
} from 'lucide-react';

export const ToppingSelectionModal = () => {
  const { toppingModalState, closeToppingModal, addToCart, updateCartItem } = useOrder();
  const { toppings: masterToppings } = useTopping();
  const { rawMaterials = [] } = useRawMaterial();

  const { isOpen, menu, cartItem } = toppingModalState;

  const [selectedToppings, setSelectedToppings] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [itemDiscountType, setItemDiscountType] = useState('none'); // 'none' | 'percent' | 'fixed'
  const [itemDiscountValue, setItemDiscountValue] = useState(0);

  // Check menu portions limit based on available raw materials
  const menuAvailability = checkMenuAvailability(menu, rawMaterials);
  const maxAllowedPortions = menuAvailability.maxPortions < 9999 ? Math.max(1, menuAvailability.maxPortions) : 999;

  // Currency formatter
  const formatIDR = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  // Reset or pre-populate states on open
  useEffect(() => {
    if (isOpen && menu) {
      if (cartItem) {
        // Filter out toppings that are out of stock
        const validExistingToppings = (Array.isArray(cartItem.toppings) ? cartItem.toppings : []).filter(t => {
          const avail = checkToppingAvailability(t, rawMaterials, masterToppings);
          return avail.isAvailable;
        });
        setSelectedToppings(validExistingToppings);
        setQuantity(Math.min(maxAllowedPortions, Math.max(1, Number(cartItem.quantity) || 1)));
        setNote(cartItem.note || '');
        setItemDiscountType(cartItem.itemDiscountType || 'none');
        setItemDiscountValue(Number(cartItem.itemDiscountValue) || 0);
      } else {
        setSelectedToppings([]);
        setQuantity(1);
        setNote('');
        setItemDiscountType('none');
        setItemDiscountValue(0);
      }
    }
  }, [isOpen, menu, cartItem, rawMaterials]);

  if (!isOpen || !menu) return null;

  // Resolve available toppings:
  // If menu has specific configured toppings, use those and cross-reference price from masterToppings
  // If menu has none configured, show all available master toppings so cashier can offer any available topping
  const menuConfiguredToppings = (menu.toppings && menu.toppings.length > 0)
    ? menu.toppings.map(t => {
        const master = masterToppings.find(mt => mt.id === (t.toppingId || t.id));
        return {
          id: t.toppingId || t.id,
          name: t.toppingName || t.name,
          price: master ? master.price : (t.price || 0),
          ingredients: master ? master.ingredients : t.ingredients
        };
      })
    : masterToppings.map(t => ({
        id: t.id,
        name: t.name,
        price: t.price || 0,
        ingredients: t.ingredients
      }));

  const handleToggleTopping = (topping) => {
    const topAvail = checkToppingAvailability(topping, rawMaterials, masterToppings);
    if (!topAvail.isAvailable) {
      return; // Tidak dapat dipilih jika stok bahan baku topping bernilai 0 / kosong
    }

    setSelectedToppings(prev => {
      const isSelected = prev.some(t => t.id === topping.id);
      if (isSelected) {
        return prev.filter(t => t.id !== topping.id);
      } else {
        return [...prev, topping];
      }
    });
  };

  const toppingsTotal = selectedToppings.reduce((sum, t) => sum + (Number(t.price) || 0), 0);
  const basePrice = Number(menu.price ?? menu.basePrice) || 0;
  const unitPrice = basePrice + toppingsTotal;
  const grossTotalPrice = unitPrice * quantity;
  const itemDiscountAmount = calculateItemDiscount(unitPrice, quantity, itemDiscountType, itemDiscountValue);
  const netTotalPrice = Math.max(0, grossTotalPrice - itemDiscountAmount);

  const handleAddWithToppings = () => {
    if (cartItem) {
      updateCartItem({
        cartItemId: cartItem.cartItemId,
        menu,
        selectedToppings,
        quantity,
        note,
        itemDiscountType,
        itemDiscountValue
      });
    } else {
      addToCart({
        menu,
        selectedToppings,
        quantity,
        note,
        itemDiscountType,
        itemDiscountValue
      });
    }
    closeToppingModal();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeToppingModal}
      title={cartItem ? `Edit Pesanan: ${menu.name}` : "Pilihan Topping Menu"}
      subtitle={cartItem ? `Sesuaikan porsi, extra topping, dan catatan pesanan` : `Tawarkan topping extra untuk ${menu.name}`}
      size="md"
    >
      <div style={styles.container}>
        {/* Menu Summary Header */}
        <div style={styles.menuHeaderCard}>
          {menu.image ? (
            <img src={menu.image} alt={menu.name} style={styles.menuThumbnail} />
          ) : (
            <InitialsAvatar name={menu.name} size={64} borderRadius="10px" />
          )}

          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={styles.categoryBadge}>{menu.categoryName || 'Menu'}</span>
              {cartItem && (
                <span style={styles.editModeBadge}>
                  <Edit3 size={11} />
                  <span>Edit Keranjang</span>
                </span>
              )}
              {menu.promoType && menu.promoType !== 'none' && (
                <span style={styles.promoBadge}>
                  <Tag size={11} />
                  <span>Promo</span>
                </span>
              )}
            </div>
            <h3 style={styles.menuTitle}>{menu.name}</h3>
            <span style={styles.menuBasePrice}>
              Harga Dasar: <strong>{formatIDR(basePrice)}</strong>
            </span>
          </div>
        </div>

        {/* Toppings Selection List */}
        <div style={styles.section}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={styles.sectionLabel}>
              <Sparkles size={14} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> PILIH EXTRA TOPPING:
            </label>
            <span style={{ fontSize: '0.75rem', color: 'var(--neutral-500)' }}>
              {selectedToppings.length} dipilih
            </span>
          </div>

          {menuConfiguredToppings.length === 0 ? (
            <div style={styles.emptyToppingsAlert}>
              Tidak ada data master topping yang tersedia.
            </div>
          ) : (
            <div style={styles.toppingList}>
              {menuConfiguredToppings.map(topping => {
                const isSelected = selectedToppings.some(t => t.id === topping.id);
                const toppingAvailability = checkToppingAvailability(topping, rawMaterials, masterToppings);
                const isToppingOutOfStock = !toppingAvailability.isAvailable;

                return (
                  <div
                    key={topping.id}
                    onClick={() => !isToppingOutOfStock && handleToggleTopping(topping)}
                    style={{
                      ...styles.toppingCard,
                      ...(isToppingOutOfStock
                        ? styles.toppingCardDisabled
                        : (isSelected ? styles.toppingCardActive : styles.toppingCardInactive)
                      )
                    }}
                    title={isToppingOutOfStock ? `Stok bahan topping habis: ${toppingAvailability.emptyIngredients.map(e => e.rawMaterialName).join(', ')}` : topping.name}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                      <div style={{
                        ...styles.checkboxCircle,
                        backgroundColor: isToppingOutOfStock ? '#f1f5f9' : (isSelected ? 'var(--blue-600)' : '#ffffff'),
                        borderColor: isToppingOutOfStock ? '#cbd5e1' : (isSelected ? 'var(--blue-600)' : 'var(--neutral-300)')
                      }}>
                        {isToppingOutOfStock ? (
                          <Ban size={11} color="#94a3b8" />
                        ) : (
                          isSelected && <Check size={12} color="#ffffff" strokeWidth={3} />
                        )}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        <span style={{
                          fontSize: '0.875rem',
                          fontWeight: isSelected ? 700 : 500,
                          color: isToppingOutOfStock ? 'var(--neutral-400)' : (isSelected ? 'var(--blue-900)' : 'var(--neutral-800)'),
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {topping.name}
                        </span>
                        {isToppingOutOfStock && (
                          <span style={{ fontSize: '0.688rem', color: '#dc2626', fontWeight: 600 }}>
                            Stok Bahan Habis ({toppingAvailability.emptyIngredients.map(e => e.rawMaterialName).join(', ')})
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
                      {isToppingOutOfStock ? (
                        <span style={{
                          fontSize: '0.719rem',
                          fontWeight: 700,
                          color: '#dc2626',
                          backgroundColor: '#fef2f2',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          border: '1px solid #fecaca'
                        }}>
                          Habis (0)
                        </span>
                      ) : (
                        <>
                          <span style={{
                            fontSize: '0.813rem',
                            fontWeight: 700,
                            color: isSelected ? 'var(--blue-700)' : 'var(--neutral-600)'
                          }}>
                            +{formatIDR((Number(topping.price) || 0) * quantity)}
                          </span>
                          {quantity > 1 && (
                            <span style={{
                              fontSize: '0.688rem',
                              color: isSelected ? 'var(--blue-600)' : 'var(--neutral-400)',
                              fontWeight: 500
                            }}>
                              ({quantity}x @{formatIDR(topping.price)})
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quantity & Notes Controls */}
        <div className="topping-qty-notes-row" style={{ display: 'grid', gridTemplateColumns: '125px 1fr', gap: '10px', alignItems: 'flex-start' }}>
          {/* Quantity Stepper */}
          <div style={styles.section}>
            <label style={{ ...styles.sectionLabel, display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '18px', margin: '0 0 6px 0', fontSize: '0.719rem' }}>
              <span>JUMLAH PORSI</span>
              {maxAllowedPortions < 999 && (
                <span style={{ fontSize: '0.688rem', color: maxAllowedPortions <= 5 ? '#b91c1c' : 'var(--neutral-400)' }}>
                  (Maks: {maxAllowedPortions})
                </span>
              )}
            </label>
            <div style={styles.stepperContainer}>
              <button
                type="button"
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                style={styles.stepperBtn}
                title="Kurang"
              >
                <Minus size={13} />
              </button>
              <span style={styles.stepperValue}>{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(prev => Math.min(maxAllowedPortions, prev + 1))}
                style={{
                  ...styles.stepperBtn,
                  opacity: quantity >= maxAllowedPortions ? 0.4 : 1,
                  cursor: quantity >= maxAllowedPortions ? 'not-allowed' : 'pointer'
                }}
                disabled={quantity >= maxAllowedPortions}
                title={quantity >= maxAllowedPortions ? `Maksimal ${maxAllowedPortions} porsi sesuai stok bahan` : "Tambah"}
              >
                <Plus size={13} />
              </button>
            </div>
          </div>

          {/* Notes Input */}
          <div style={styles.section}>
            <label style={{ ...styles.sectionLabel, display: 'flex', alignItems: 'center', gap: '4px', height: '18px', margin: '0 0 6px 0', fontSize: '0.719rem' }}>
              <MessageSquareQuote size={13} color="var(--neutral-400)" />
              <span>CATATAN (OPSIONAL)</span>
            </label>
            <input
              type="text"
              className="blue-input"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Cth: tidak terlalu manis"
              style={{ width: '100%', height: '38px', fontSize: '0.813rem', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* Item Discount Section - Modern Unified Input Group */}
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '9px 11px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ ...styles.sectionLabel, marginBottom: 0, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.781rem', color: 'var(--neutral-800)' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '5px', backgroundColor: 'var(--emerald-100)', color: 'var(--emerald-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Tag size={12} />
              </div>
              <span>Diskon</span>
            </label>
            {itemDiscountAmount > 0 && (
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
                <Sparkles size={11} /> Hemat -{formatIDR(itemDiscountAmount)}
              </span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', alignItems: 'center' }}>
            {/* Dropdown Tipe Diskon */}
            <div style={{ position: 'relative' }}>
              <select
                value={itemDiscountType === 'none' ? 'percent' : itemDiscountType}
                onChange={(e) => {
                  setItemDiscountType(e.target.value);
                }}
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

            {/* Direct Number Input */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '0.781rem',
                fontWeight: 700,
                color: itemDiscountValue > 0 ? 'var(--emerald-600)' : 'var(--neutral-400)',
                pointerEvents: 'none',
                zIndex: 1
              }}>
                {itemDiscountType === 'fixed' ? 'Rp' : '%'}
              </span>
              <input
                type="number"
                min="0"
                max={itemDiscountType === 'fixed' ? grossTotalPrice : 100}
                value={itemDiscountValue === 0 ? '' : itemDiscountValue}
                onChange={(e) => {
                  const val = Math.max(0, Number(e.target.value) || 0);
                  const maxVal = itemDiscountType === 'fixed' ? grossTotalPrice : 100;
                  if (itemDiscountType === 'none') {
                    setItemDiscountType('percent');
                  }
                  setItemDiscountValue(Math.min(maxVal, val));
                }}
                placeholder="0"
                className="blue-input"
                style={{
                  width: '100%',
                  height: '36px',
                  fontSize: '0.813rem',
                  fontWeight: 700,
                  paddingLeft: itemDiscountType === 'fixed' ? '32px' : '26px',
                  paddingRight: itemDiscountValue > 0 ? '28px' : '10px',
                  backgroundColor: '#ffffff',
                  color: itemDiscountAmount > 0 ? 'var(--emerald-700)' : 'var(--neutral-900)'
                }}
              />
              {itemDiscountValue > 0 && (
                <button
                  type="button"
                  onClick={() => setItemDiscountValue(0)}
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
        </div>

        {/* Live Calculation Banner */}
        <div style={styles.calcBanner}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', fontWeight: 600 }}>Total Pesanan Item</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              {itemDiscountAmount > 0 ? (
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--emerald-600)' }}>
                    {formatIDR(netTotalPrice)}
                  </span>
                  <span style={{ fontSize: '0.813rem', color: 'var(--neutral-400)', textDecoration: 'line-through' }}>
                    {formatIDR(grossTotalPrice)}
                  </span>
                </div>
              ) : (
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--blue-700)' }}>
                  {formatIDR(grossTotalPrice)}
                </span>
              )}
              <span style={{ fontSize: '0.75rem', color: 'var(--neutral-500)' }}>
                ({quantity}x @ {formatIDR(unitPrice)})
              </span>
            </div>
            {quantity > 1 && (
              <span style={{ fontSize: '0.688rem', color: 'var(--neutral-500)', marginTop: '2px' }}>
                Menu: {quantity}x {formatIDR(menu.price)} = {formatIDR(menu.price * quantity)}
                {selectedToppings.length > 0 && ` • Topping: ${quantity}x ${formatIDR(toppingsTotal)} = ${formatIDR(toppingsTotal * quantity)}`}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
            {selectedToppings.length > 0 && (
              <span style={{ fontSize: '0.688rem', color: 'var(--blue-700)', fontWeight: 700, backgroundColor: 'var(--blue-50)', padding: '3px 6px', borderRadius: '4px' }}>
                +{formatIDR(toppingsTotal * quantity)} Topping
              </span>
            )}
            {itemDiscountAmount > 0 && (
              <span style={{ fontSize: '0.688rem', color: 'var(--emerald-700)', fontWeight: 700, backgroundColor: 'var(--emerald-50)', padding: '3px 6px', borderRadius: '4px' }}>
                -{formatIDR(itemDiscountAmount)} Diskon Item
              </span>
            )}
          </div>
        </div>

        {/* Actions Footer */}
        <div style={styles.footerActions}>
          <Button
            type="button"
            variant="primary"
            icon={cartItem ? Check : ShoppingBag}
            onClick={handleAddWithToppings}
            style={{ width: '100%', padding: '12px 0', fontSize: '0.938rem', borderRadius: '8px' }}
          >
            {cartItem
              ? `Simpan Perubahan (${formatIDR(netTotalPrice)})`
              : (selectedToppings.length > 0 ? `Tambah (+${selectedToppings.length} Topping)` : 'Tambah ke Pesanan')}
          </Button>
        </div>

        <style>{`
          @media (max-width: 1024px) {
            .topping-qty-notes-row {
              grid-template-columns: 120px 1fr !important;
              gap: 8px !important;
            }
          }
          @media (max-width: 480px) {
            .topping-qty-notes-row {
              grid-template-columns: 110px 1fr !important;
              gap: 8px !important;
            }
          }
          @media (max-width: 360px) {
            .topping-qty-notes-row {
              grid-template-columns: 100px 1fr !important;
              gap: 6px !important;
            }
          }
        `}</style>
      </div>
    </Modal>
  );
};


const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '0 4px 8px 4px'
  },
  menuHeaderCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '12px',
    backgroundColor: 'var(--neutral-50)',
    borderRadius: '10px',
    border: '1px solid var(--border-color)'
  },
  menuThumbnail: {
    width: '64px',
    height: '64px',
    borderRadius: '10px',
    objectFit: 'cover',
    border: '1px solid var(--border-color)',
    flexShrink: 0
  },
  categoryBadge: {
    fontSize: '0.688rem',
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: '4px',
    backgroundColor: 'var(--neutral-200)',
    color: 'var(--neutral-700)'
  },
  editModeBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.688rem',
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: '4px',
    backgroundColor: 'var(--amber-100)',
    color: 'var(--amber-800)'
  },
  promoBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.688rem',
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: '4px',
    backgroundColor: 'var(--amber-100)',
    color: 'var(--amber-800)'
  },
  menuTitle: {
    margin: '4px 0 2px 0',
    fontSize: '1rem',
    fontWeight: 700,
    color: 'var(--neutral-900)'
  },
  menuBasePrice: {
    fontSize: '0.813rem',
    color: 'var(--neutral-600)'
  },
  section: {
    display: 'flex',
    flexDirection: 'column'
  },
  sectionLabel: {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: 'var(--neutral-500)',
    marginBottom: '6px',
    letterSpacing: '0.5px'
  },
  toppingList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxHeight: '220px',
    overflowY: 'auto',
    padding: '2px 4px 2px 2px'
  },
  toppingCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '11px 14px',
    borderRadius: '8px',
    cursor: 'pointer',
    border: '1px solid',
    transition: 'all 0.15s ease',
    userSelect: 'none',
    width: '100%',
    boxSizing: 'border-box'
  },
  toppingCardActive: {
    backgroundColor: 'var(--blue-50)',
    borderColor: 'var(--blue-500)'
  },
  toppingCardInactive: {
    backgroundColor: '#ffffff',
    borderColor: 'var(--border-color)'
  },
  toppingCardDisabled: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    cursor: 'not-allowed',
    opacity: 0.68,
    boxShadow: 'none'
  },
  checkboxCircle: {
    width: '18px',
    height: '18px',
    borderRadius: '4px',
    border: '1.5px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  emptyToppingsAlert: {
    padding: '14px',
    textAlign: 'center',
    backgroundColor: 'var(--neutral-50)',
    borderRadius: '8px',
    color: 'var(--neutral-500)',
    fontSize: '0.813rem'
  },
  stepperContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '38px',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    padding: '0 3px',
    boxSizing: 'border-box'
  },
  stepperBtn: {
    width: '30px',
    height: '30px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: 'var(--neutral-100)',
    color: 'var(--neutral-700)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'background-color 0.15s'
  },
  stepperValue: {
    fontSize: '0.938rem',
    fontWeight: 700,
    color: 'var(--neutral-900)',
    textAlign: 'center',
    flex: 1
  },
  calcBanner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: 'var(--blue-50)',
    borderRadius: '8px',
    border: '1px solid var(--blue-100)'
  },
  footerActions: {
    display: 'flex',
    gap: '10px',
    marginTop: '4px'
  }
};

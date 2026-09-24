import React, { useState, useEffect } from 'react';
import { useOrder } from '../../controllers/OrderController';
import { useProductMenu } from '../../controllers/ProductMenuController';
import { useTopping } from '../../controllers/ToppingController';
import { useCategory } from '../../controllers/CategoryController';
import { useAuth } from '../../controllers/AuthController';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { 
  Plus, 
  Minus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  AlertCircle, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Sparkles, 
  ShoppingBag, 
  Search,
  Printer,
  ChevronDown,
  ChevronUp,
  Tag
} from 'lucide-react';

export const OrderRevisionModal = () => {
  const { 
    orderRevisionModalState, 
    closeOrderRevisionModal, 
    reviseOrder 
  } = useOrder();

  const { productMenus = [] } = useProductMenu();
  const { toppings: masterToppings = [] } = useTopping();
  const { categories = [] } = useCategory();
  const { currentUser } = useAuth();

  const { isOpen, order } = orderRevisionModalState;

  // Local state for items being edited
  const [items, setItems] = useState([]);
  const [revisionReason, setRevisionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // UI state for adding new menu
  const [isAddingMenu, setIsAddingMenu] = useState(false);
  const [menuSearchTerm, setMenuSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');

  // UI state for editing toppings on a specific item (index)
  const [editingToppingItemIndex, setEditingToppingItemIndex] = useState(null);

  // Currency formatter
  const formatIDR = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  // Initialize or reset state when modal opens
  useEffect(() => {
    if (isOpen && order) {
      const clonedItems = (order.items || []).map((item, idx) => {
        const toppings = Array.isArray(item.toppings) ? [...item.toppings.map(t => ({ ...t }))] : [];
        const toppingsTotal = toppings.reduce((sum, t) => sum + ((Number(t.price) || 0) * (Number(t.quantity) || 1)), 0);
        const basePrice = Number(item.basePrice ?? (Number(item.unitPrice || 0) - toppingsTotal));

        return {
          ...item,
          cartItemId: item.cartItemId || `REV-ITEM-${Date.now()}-${idx}`,
          basePrice: Math.max(0, basePrice),
          quantity: Math.max(1, Number(item.quantity) || 1),
          toppings,
          toppingsTotal,
          note: item.note || '',
          itemDiscountType: item.itemDiscountType || 'none',
          itemDiscountValue: Number(item.itemDiscountValue) || 0,
          itemDiscountAmount: Number(item.itemDiscountAmount) || 0
        };
      });

      setItems(clonedItems);
      setRevisionReason('');
      setIsAddingMenu(false);
      setMenuSearchTerm('');
      setSelectedCategoryFilter('ALL');
      setEditingToppingItemIndex(null);
      setIsSubmitting(false);
      setErrorMsg('');
    }
  }, [isOpen, order]);

  if (!isOpen || !order) return null;

  // 1. Calculations
  const calculateItemTotals = (item) => {
    const qty = Math.max(1, Number(item.quantity) || 1);
    const toppingsTotal = (item.toppings || []).reduce(
      (sum, t) => sum + ((Number(t.price) || 0) * (Number(t.quantity) || 1)), 
      0
    );
    const unitPrice = (Number(item.basePrice) || 0) + toppingsTotal;
    const grossTotal = unitPrice * qty;
    let discAmount = 0;
    if (item.itemDiscountType === 'percent') {
      discAmount = Math.round((grossTotal * (Number(item.itemDiscountValue) || 0)) / 100);
    } else if (item.itemDiscountType === 'fixed') {
      discAmount = Math.min(grossTotal, Number(item.itemDiscountValue) || 0);
    }
    const netTotal = Math.max(0, grossTotal - discAmount);

    return { toppingsTotal, unitPrice, grossTotal, discAmount, netTotal };
  };

  let newSubtotal = 0;
  let newItemsDiscountTotal = 0;
  items.forEach(it => {
    const { grossTotal, discAmount } = calculateItemTotals(it);
    newSubtotal += grossTotal;
    newItemsDiscountTotal += discAmount;
  });

  // Global order discount
  const orderDiscountType = order.orderDiscountType || 'none';
  const orderDiscountValue = Number(order.orderDiscountValue) || 0;
  const netSubtotalAfterItems = Math.max(0, newSubtotal - newItemsDiscountTotal);
  let orderDiscountAmount = 0;
  if (orderDiscountType === 'percent') {
    orderDiscountAmount = Math.round((netSubtotalAfterItems * orderDiscountValue) / 100);
  } else if (orderDiscountType === 'fixed') {
    orderDiscountAmount = Math.min(netSubtotalAfterItems, orderDiscountValue);
  }
  const totalDiscount = newItemsDiscountTotal + orderDiscountAmount;
  const newTotalAmount = Math.max(0, newSubtotal - totalDiscount);

  const originalTotal = Number(order.totalAmount) || 0;
  const priceDifference = newTotalAmount - originalTotal; // positive: customer owes, negative: refund to customer

  // Handlers for Items
  const handleIncreaseQty = (index) => {
    setItems(prev => prev.map((it, idx) => idx === index ? { ...it, quantity: it.quantity + 1 } : it));
  };

  const handleDecreaseQty = (index) => {
    setItems(prev => {
      const target = prev[index];
      if (target.quantity > 1) {
        return prev.map((it, idx) => idx === index ? { ...it, quantity: it.quantity - 1 } : it);
      }
      // If 1 and multiple items exist, remove item
      if (prev.length > 1) {
        return prev.filter((_, idx) => idx !== index);
      }
      return prev;
    });
  };

  const handleRemoveItem = (index) => {
    if (items.length <= 1) {
      setErrorMsg('Minimal harus tersisa 1 menu dalam struk. Jika ingin membatalkan transaksi sepenuhnya, gunakan tombol Batalkan Transaksi.');
      return;
    }
    setErrorMsg('');
    setItems(prev => prev.filter((_, idx) => idx !== index));
    if (editingToppingItemIndex === index) {
      setEditingToppingItemIndex(null);
    }
  };

  // Handlers for Toppings
  const handleRemoveTopping = (itemIndex, toppingId) => {
    setItems(prev => prev.map((it, idx) => {
      if (idx !== itemIndex) return it;
      const updatedToppings = (it.toppings || []).filter(t => (t.id || t.toppingId) !== toppingId);
      const toppingsTotal = updatedToppings.reduce((sum, t) => sum + ((Number(t.price) || 0) * (Number(t.quantity) || 1)), 0);
      return {
        ...it,
        toppings: updatedToppings,
        toppingsTotal
      };
    }));
  };

  const handleToggleTopping = (itemIndex, topping) => {
    setItems(prev => prev.map((it, idx) => {
      if (idx !== itemIndex) return it;
      const currentToppings = it.toppings || [];
      const exists = currentToppings.some(t => (t.id || t.toppingId) === topping.id);

      let updatedToppings;
      if (exists) {
        updatedToppings = currentToppings.filter(t => (t.id || t.toppingId) !== topping.id);
      } else {
        updatedToppings = [
          ...currentToppings,
          {
            id: topping.id,
            toppingId: topping.id,
            name: topping.name,
            price: Number(topping.price) || 0,
            quantity: 1
          }
        ];
      }

      const toppingsTotal = updatedToppings.reduce((sum, t) => sum + ((Number(t.price) || 0) * (Number(t.quantity) || 1)), 0);
      return {
        ...it,
        toppings: updatedToppings,
        toppingsTotal
      };
    }));
  };

  // Handler for Adding New Menu
  const handleAddMenuToOrder = (menu) => {
    const newItem = {
      cartItemId: `REV-NEW-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      menuId: menu.id,
      name: menu.name,
      image: menu.image || null,
      categoryName: menu.categoryName || '',
      basePrice: Number(menu.price) || 0,
      quantity: 1,
      toppings: [],
      toppingsTotal: 0,
      unitPrice: Number(menu.price) || 0,
      note: '',
      itemDiscountType: 'none',
      itemDiscountValue: 0,
      itemDiscountAmount: 0
    };

    setItems(prev => [...prev, newItem]);
    setIsAddingMenu(false);
    setMenuSearchTerm('');
    setErrorMsg('');
  };

  // Submit Revision
  const handleSubmit = async () => {
    if (items.length === 0) {
      setErrorMsg('Struk harus memiliki minimal 1 menu.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await reviseOrder({
        orderId: order.id,
        updatedItems: items,
        reason: revisionReason.trim() || 'Penyesuaian menu/topping struk oleh kasir',
        actor: currentUser?.nama || currentUser?.name || currentUser?.username || 'Kasir'
      });

      if (!res?.success && res?.error) {
        setErrorMsg(res.error);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Gagal menyimpan revisi transaksi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered menus for "+ Tambah Menu Lain"
  const filteredAvailableMenus = productMenus.filter(m => {
    const matchesSearch = !menuSearchTerm || 
      m.name.toLowerCase().includes(menuSearchTerm.toLowerCase()) ||
      (m.categoryName && m.categoryName.toLowerCase().includes(menuSearchTerm.toLowerCase()));

    const matchesCategory = selectedCategoryFilter === 'ALL' || 
      String(m.categoryId) === String(selectedCategoryFilter) ||
      m.categoryName === selectedCategoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeOrderRevisionModal}
      title="Revisi & Ubah Pesanan"
      subtitle={`No. Faktur #${order.invoiceNumber} • Pelanggan: ${order.customerName || 'Umum'} • Meja: ${order.tableNumber || '-'}`}
      size="lg"
      footer={
        <div className="rev-modal-footer">
          <Button 
            variant="outline" 
            onClick={closeOrderRevisionModal} 
            disabled={isSubmitting}
            className="rev-footer-btn-cancel"
          >
            Batal
          </Button>

          <Button
            variant="primary"
            icon={Printer}
            onClick={handleSubmit}
            disabled={isSubmitting || items.length === 0}
            className="rev-footer-btn-submit"
          >
            {isSubmitting ? 'Menyimpan Revisi & Cetak...' : 'Simpan & Cetak Struk'}
          </Button>
        </div>
      }
    >
      <div className="rev-modal-body">
        {/* Scoped CSS for Ultra-Ergonomic Mobile & Desktop POS Experience */}
        <style>{`
          .rev-modal-body {
            display: flex;
            flex-direction: column;
            gap: 14px;
            padding-bottom: 8px;
          }

          /* Alert Message */
          .rev-alert-box {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 14px;
            border-radius: 10px;
            background-color: #fef2f2;
            border: 1px solid #fecaca;
            color: #991b1b;
            font-size: 0.813rem;
            font-weight: 600;
          }

          /* Header Actions */
          .rev-top-actions {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            padding-bottom: 10px;
            border-bottom: 1px solid var(--neutral-200);
          }
          .rev-top-title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.938rem;
            font-weight: 700;
            color: var(--neutral-800);
          }

          /* Menu Picker Collapsible Box */
          .rev-menu-picker-card {
            background-color: var(--blue-50);
            border: 1px solid var(--blue-200);
            border-radius: 12px;
            padding: 12px;
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          .rev-menu-search-input {
            width: 100%;
            height: 38px;
            border-radius: 8px;
            border: 1px solid var(--neutral-300);
            background: #ffffff;
            padding: 0 34px 0 34px;
            font-size: 0.813rem;
          }
          .rev-category-pills-scroll {
            display: flex;
            align-items: center;
            gap: 6px;
            overflow-x: auto;
            padding-bottom: 4px;
            scrollbar-width: none;
            -webkit-overflow-scrolling: touch;
          }
          .rev-category-pills-scroll::-webkit-scrollbar {
            display: none;
          }
          .rev-category-pill {
            flex-shrink: 0;
            padding: 5px 12px;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 600;
            border: 1px solid var(--neutral-300);
            background-color: #ffffff;
            color: var(--neutral-700);
            cursor: pointer;
            transition: all 0.15s ease;
          }
          .rev-category-pill.active {
            background-color: var(--blue-600);
            border-color: var(--blue-600);
            color: #ffffff;
          }
          .rev-menu-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
            gap: 8px;
            max-height: 200px;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
          }
          .rev-menu-item-tile {
            background: #ffffff;
            border: 1px solid var(--neutral-200);
            border-radius: 8px;
            padding: 9px 11px;
            cursor: pointer;
            transition: all 0.15s ease;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          .rev-menu-item-tile:active {
            transform: scale(0.97);
            border-color: var(--blue-500);
          }

          /* Items List */
          .rev-items-container {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          /* Item Card - Mobile Ergonomic Design */
          .rev-cart-card {
            background: #ffffff;
            border: 1px solid var(--neutral-200);
            border-radius: 12px;
            padding: 12px 14px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
            transition: border-color 0.15s ease;
          }
          .rev-cart-card:focus-within {
            border-color: var(--blue-300);
          }

          /* Row 1: Header (Name + Delete Trash Button) */
          .rev-card-header-row {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 10px;
          }
          .rev-card-title-wrap {
            display: flex;
            flex-direction: column;
            gap: 2px;
            flex: 1;
            min-width: 0;
          }
          .rev-card-title-line {
            display: flex;
            align-items: center;
            gap: 6px;
            flex-wrap: wrap;
          }
          .rev-item-index-badge {
            font-size: 0.688rem;
            font-weight: 700;
            color: var(--neutral-500);
            background: var(--neutral-100);
            padding: 2px 6px;
            border-radius: 4px;
          }
          .rev-item-name-text {
            font-size: 0.938rem;
            font-weight: 700;
            color: var(--neutral-900);
            line-height: 1.3;
          }
          .rev-item-unit-price {
            font-size: 0.781rem;
            font-weight: 600;
            color: var(--neutral-500);
          }

          /* Delete Button (Touch-Friendly) */
          .rev-btn-delete {
            width: 36px;
            height: 36px;
            border-radius: 8px;
            border: 1px solid #fee2e2;
            background-color: #fef2f2;
            color: #dc2626;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            flex-shrink: 0;
            transition: all 0.15s ease;
          }
          .rev-btn-delete:active {
            transform: scale(0.92);
            background-color: #fee2e2;
          }

          /* Row 2: Toppings & Topping Action */
          .rev-toppings-bar {
            display: flex;
            align-items: center;
            gap: 6px;
            flex-wrap: wrap;
            padding: 2px 0;
          }
          .rev-topping-pill {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 3px 8px 3px 10px;
            border-radius: 9999px;
            background-color: var(--blue-50);
            border: 1px solid var(--blue-200);
            color: var(--blue-700);
            font-size: 0.75rem;
            font-weight: 600;
          }
          .rev-topping-remove-btn {
            border: none;
            background: transparent;
            color: var(--blue-500);
            width: 18px;
            height: 18px;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            padding: 0;
            transition: background 0.15s ease;
          }
          .rev-topping-remove-btn:hover {
            background-color: rgba(37, 99, 235, 0.15);
            color: var(--blue-700);
          }
          .rev-no-topping-text {
            font-size: 0.75rem;
            font-style: italic;
            color: var(--neutral-400);
            font-weight: 500;
          }
          .rev-modify-topping-btn {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            padding: 4px 10px;
            border-radius: 6px;
            border: 1px dashed var(--blue-300);
            background-color: #ffffff;
            color: var(--blue-600);
            font-size: 0.719rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.15s ease;
          }
          .rev-modify-topping-btn:active {
            background-color: var(--blue-50);
          }

          /* Topping Selector Drawer */
          .rev-topping-drawer {
            margin-top: 4px;
            padding: 10px 12px;
            background-color: #f8fafc;
            border-radius: 8px;
            border: 1px solid var(--neutral-200);
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .rev-topping-drawer-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            gap: 6px;
          }
          .rev-topping-tile {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 10px;
            border-radius: 6px;
            border: 1px solid var(--neutral-200);
            background-color: #ffffff;
            cursor: pointer;
            transition: all 0.12s ease;
            text-align: left;
          }
          .rev-topping-tile:active {
            transform: scale(0.96);
          }
          .rev-topping-tile.active {
            border-color: var(--blue-500);
            background-color: var(--blue-50);
          }

          /* Row 3: Bottom Stepper & Subtotal (Mobile Optimized) */
          .rev-card-bottom-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding-top: 8px;
            border-top: 1px dashed var(--neutral-100);
          }

          /* Big Touch Stepper */
          .rev-stepper-box {
            display: inline-flex;
            align-items: center;
            border: 1px solid var(--neutral-300);
            border-radius: 8px;
            background-color: var(--neutral-50);
            overflow: hidden;
          }
          .rev-stepper-touch-btn {
            width: 38px;
            height: 38px;
            border: none;
            background: transparent;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--neutral-700);
            cursor: pointer;
            transition: background 0.12s ease;
          }
          .rev-stepper-touch-btn:active {
            background-color: var(--neutral-200);
          }
          .rev-stepper-touch-val {
            min-width: 32px;
            text-align: center;
            font-size: 0.938rem;
            font-weight: 800;
            color: var(--neutral-900);
          }

          /* Subtotal on Item */
          .rev-item-subtotal-area {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
          }
          .rev-item-subtotal-number {
            font-size: 1rem;
            font-weight: 800;
            color: var(--neutral-900);
          }

          /* 4. Financial Difference Box */
          .rev-financial-box {
            background: var(--neutral-50);
            border: 1px solid var(--neutral-200);
            border-radius: 12px;
            padding: 12px 14px;
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          .rev-comparison-grid {
            display: grid;
            grid-template-columns: 1fr auto 1fr;
            align-items: center;
            gap: 8px;
          }
          .rev-comp-col {
            display: flex;
            flex-direction: column;
            text-align: center;
            padding: 6px;
            border-radius: 8px;
            background-color: #ffffff;
            border: 1px solid var(--neutral-200);
          }
          .rev-comp-label {
            font-size: 0.688rem;
            font-weight: 600;
            color: var(--neutral-500);
            text-transform: uppercase;
            letter-spacing: 0.3px;
          }
          .rev-comp-val-old {
            font-size: 0.938rem;
            font-weight: 700;
            color: var(--neutral-700);
            margin-top: 2px;
          }
          .rev-comp-val-new {
            font-size: 1.063rem;
            font-weight: 800;
            color: var(--blue-600);
            margin-top: 2px;
          }
          .rev-comp-arrow {
            font-size: 1.125rem;
            color: var(--neutral-300);
            text-align: center;
          }

          /* Financial Diff Banner */
          .rev-diff-banner {
            padding: 10px 12px;
            border-radius: 8px;
            border: 1px solid;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .rev-diff-banner-refund {
            background-color: #ecfdf5;
            border-color: #a7f3d0;
          }
          .rev-diff-banner-charge {
            background-color: #fffbeb;
            border-color: #fde68a;
          }
          .rev-diff-banner-equal {
            background-color: #eef2ff;
            border-color: #c7d2fe;
          }
          .rev-diff-banner-equal .rev-diff-icon-circle {
            display: none !important;
          }
          .rev-diff-icon-circle {
            width: 34px;
            height: 34px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          /* Footer Buttons (50:50 Equal Width & Height) */
          .rev-modal-footer {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 12px !important;
            width: 100% !important;
            align-items: center !important;
          }
          .rev-footer-btn-cancel {
            width: 100% !important;
            height: 44px !important;
            font-size: 0.875rem !important;
            font-weight: 600 !important;
            justify-content: center !important;
          }
          .rev-footer-btn-submit {
            width: 100% !important;
            height: 44px !important;
            font-size: 0.875rem !important;
            font-weight: 700 !important;
            justify-content: center !important;
          }

          /* Specific Mobile Breakpoint (<= 640px) */
          @media (max-width: 640px) {
            .rev-modal-body {
              gap: 12px;
            }
            .rev-cart-card {
              padding: 10px 12px;
            }
            .rev-card-title-line {
              gap: 4px;
            }
            .rev-item-name-text {
              font-size: 0.875rem;
            }
            .rev-btn-delete {
              width: 34px;
              height: 34px;
            }
            .rev-stepper-touch-btn {
              width: 36px;
              height: 36px;
            }
            .rev-stepper-touch-val {
              min-width: 28px;
              font-size: 0.875rem;
            }
            .rev-topping-drawer-grid {
              grid-template-columns: 1fr 1fr;
              gap: 6px;
            }
            .rev-menu-grid {
              grid-template-columns: 1fr;
            }
            .rev-modal-footer {
              display: grid !important;
              grid-template-columns: 1fr 1fr !important;
              gap: 10px !important;
            }
            .rev-footer-btn-cancel,
            .rev-footer-btn-submit {
              width: 100% !important;
              height: 44px !important;
            }
          }
        `}</style>

        {/* Error Alert */}
        {errorMsg && (
          <div className="rev-alert-box">
            <AlertCircle size={16} color="#dc2626" style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1. Header Action Bar: Add Menu Button */}
        <div className="rev-top-actions">
          <div className="rev-top-title">
            <ShoppingBag size={18} color="var(--blue-600)" />
            <span>Menu di Struk Ini ({items.length})</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={isAddingMenu ? X : Plus}
            onClick={() => {
              setIsAddingMenu(prev => !prev);
              setMenuSearchTerm('');
              setSelectedCategoryFilter('ALL');
            }}
            style={{ fontSize: '0.813rem', height: '34px' }}
          >
            {isAddingMenu ? 'Tutup Pilihan' : 'Tambah Menu'}
          </Button>
        </div>

        {/* 2. Menu Picker with Category Pills (Mobile Ergonomic) */}
        {isAddingMenu && (
          <div className="rev-menu-picker-card animate-fade-in">
            {/* Search Input */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={15} color="var(--neutral-400)" style={{ position: 'absolute', left: '10px' }} />
              <input
                type="text"
                className="rev-menu-search-input"
                placeholder="Cari menu crepes..."
                value={menuSearchTerm}
                onChange={(e) => setMenuSearchTerm(e.target.value)}
                autoFocus
              />
              {menuSearchTerm && (
                <button
                  type="button"
                  onClick={() => setMenuSearchTerm('')}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: 'var(--neutral-400)',
                    padding: 0
                  }}
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Category Filter Pills (Fast 1-tap filtering for mobile) */}
            <div className="rev-category-pills-scroll">
              <button
                type="button"
                className={`rev-category-pill ${selectedCategoryFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setSelectedCategoryFilter('ALL')}
              >
                Semua Kategori
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  className={`rev-category-pill ${selectedCategoryFilter === cat.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategoryFilter(cat.id)}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Grid of Menus */}
            <div className="rev-menu-grid">
              {filteredAvailableMenus.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--neutral-500)', fontSize: '0.813rem' }}>
                  Tidak ada menu yang sesuai pencarian / kategori.
                </div>
              ) : (
                filteredAvailableMenus.map(menu => (
                  <div
                    key={menu.id}
                    onClick={() => handleAddMenuToOrder(menu)}
                    className="rev-menu-item-tile"
                    title="Klik untuk menambahkan menu ini"
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.844rem', color: 'var(--neutral-900)' }}>
                        {menu.name}
                      </div>
                      <div style={{ fontSize: '0.719rem', color: 'var(--neutral-500)', marginTop: '2px' }}>
                        {menu.categoryName || 'Menu'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.813rem', color: 'var(--blue-600)' }}>
                        {formatIDR(menu.price)}
                      </span>
                      <span style={{
                        fontSize: '0.688rem',
                        fontWeight: 700,
                        color: 'var(--blue-700)',
                        backgroundColor: 'var(--blue-50)',
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}>
                        + Tambah
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 3. Items List (Mobile-Optimized Cart Card) */}
        <div className="rev-items-container">
          {items.map((item, index) => {
            const { unitPrice, netTotal, discAmount } = calculateItemTotals(item);
            const isEditingTopping = editingToppingItemIndex === index;

            return (
              <div key={item.cartItemId || index} className="rev-cart-card">
                {/* Header Row: Title, Unit Price, and Delete Button */}
                <div className="rev-card-header-row">
                  <div className="rev-card-title-wrap">
                    <div className="rev-card-title-line">
                      <span className="rev-item-index-badge">#{index + 1}</span>
                      <span className="rev-item-name-text">{item.name}</span>
                    </div>
                    <div className="rev-item-unit-price">
                      @{formatIDR(item.basePrice)} / porsi {item.categoryName ? `• ${item.categoryName}` : ''}
                    </div>
                  </div>

                  {/* Prominent Trash Button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="rev-btn-delete"
                    title="Batalkan menu ini dari struk"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Toppings Row: Chips & Modify Action */}
                <div className="rev-toppings-bar">
                  {item.toppings && item.toppings.length > 0 ? (
                    item.toppings.map(top => {
                      const topId = top.id || top.toppingId;
                      return (
                        <span key={topId} className="rev-topping-pill">
                          <span>+ {top.name} ({formatIDR(top.price)})</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTopping(index, topId)}
                            className="rev-topping-remove-btn"
                            title={`Hapus topping ${top.name}`}
                          >
                            <X size={12} />
                          </button>
                        </span>
                      );
                    })
                  ) : (
                    <span className="rev-no-topping-text">Tanpa Topping (Porsi Polos)</span>
                  )}

                  <button
                    type="button"
                    onClick={() => setEditingToppingItemIndex(isEditingTopping ? null : index)}
                    className="rev-modify-topping-btn"
                    title="Ubah atau pilih topping"
                  >
                    <Edit3 size={11} />
                    <span>{isEditingTopping ? 'Tutup Pilihan' : 'Ubah / + Topping'}</span>
                    {isEditingTopping ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                  </button>
                </div>

                {/* Optional Note */}
                {item.note && (
                  <div style={{ fontSize: '0.719rem', color: 'var(--neutral-500)', fontStyle: 'italic' }}>
                    "{item.note}"
                  </div>
                )}

                {/* Inline Topping Picker Drawer */}
                {isEditingTopping && (
                  <div className="rev-topping-drawer animate-fade-in">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.781rem', fontWeight: 700, color: 'var(--neutral-800)' }}>
                        Pilih Extra Topping:
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditingToppingItemIndex(null)}
                        style={{ border: 'none', background: 'transparent', color: 'var(--blue-600)', fontSize: '0.719rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Selesai
                      </button>
                    </div>

                    <div className="rev-topping-drawer-grid">
                      {masterToppings.length === 0 ? (
                        <span style={{ fontSize: '0.75rem', color: 'var(--neutral-400)' }}>Belum ada master topping.</span>
                      ) : (
                        masterToppings.map(t => {
                          const isChecked = (item.toppings || []).some(sel => (sel.id || sel.toppingId) === t.id);
                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => handleToggleTopping(index, t)}
                              className={`rev-topping-tile ${isChecked ? 'active' : ''}`}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{
                                  width: '15px',
                                  height: '15px',
                                  borderRadius: '3px',
                                  border: isChecked ? '1px solid var(--blue-600)' : '1px solid var(--neutral-300)',
                                  backgroundColor: isChecked ? 'var(--blue-600)' : '#ffffff',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#ffffff',
                                  flexShrink: 0
                                }}>
                                  {isChecked && <Check size={10} />}
                                </div>
                                <span style={{ fontWeight: isChecked ? 700 : 500, fontSize: '0.781rem', color: isChecked ? 'var(--blue-800)' : 'var(--neutral-800)' }}>
                                  {t.name}
                                </span>
                              </div>
                              <span style={{ fontSize: '0.719rem', fontWeight: 700, color: isChecked ? 'var(--blue-700)' : 'var(--neutral-500)' }}>
                                +{formatIDR(t.price)}
                              </span>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {/* Bottom Row: Large Stepper & Subtotal */}
                <div className="rev-card-bottom-row">
                  {/* Stepper with Large Hit Areas */}
                  <div className="rev-stepper-box">
                    <button
                      type="button"
                      onClick={() => handleDecreaseQty(index)}
                      className="rev-stepper-touch-btn"
                      title="Kurangi porsi"
                    >
                      <Minus size={15} />
                    </button>
                    <span className="rev-stepper-touch-val">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => handleIncreaseQty(index)}
                      className="rev-stepper-touch-btn"
                      title="Tambah porsi"
                    >
                      <Plus size={15} />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="rev-item-subtotal-area">
                    <span style={{ fontSize: '0.688rem', color: 'var(--neutral-500)', fontWeight: 600 }}>
                      Total Item:
                    </span>
                    <span className="rev-item-subtotal-number">
                      {formatIDR(netTotal)}
                    </span>
                    {discAmount > 0 && (
                      <span style={{ fontSize: '0.688rem', color: '#059669', fontWeight: 600 }}>
                        Hemat -{formatIDR(discAmount)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 4. Financial Difference & Comparison Box */}
        <div className="rev-financial-box">
          {/* Comparison Row */}
          <div className="rev-comparison-grid">
            <div className="rev-comp-col">
              <span className="rev-comp-label">Total Awal</span>
              <span className="rev-comp-val-old">{formatIDR(originalTotal)}</span>
            </div>

            <div className="rev-comp-arrow">➔</div>

            <div className="rev-comp-col">
              <span className="rev-comp-label">Total Baru</span>
              <span className="rev-comp-val-new">{formatIDR(newTotalAmount)}</span>
            </div>
          </div>

          {/* Difference Banner */}
          <div className={`rev-diff-banner ${
            priceDifference < 0 ? 'rev-diff-banner-refund' : priceDifference > 0 ? 'rev-diff-banner-charge' : 'rev-diff-banner-equal'
          }`}>
            {priceDifference !== 0 && (
              <div 
                className="rev-diff-icon-circle"
                style={{
                  backgroundColor: priceDifference < 0 ? '#d1fae5' : '#fef3c7',
                  color: priceDifference < 0 ? '#059669' : '#d97706'
                }}
              >
                {priceDifference < 0 ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
              </div>
            )}

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: '0.906rem',
                fontWeight: 800,
                color: priceDifference < 0 ? '#065f46' : priceDifference > 0 ? '#92400e' : '#3730a3'
              }}>
                {priceDifference < 0 
                  ? `💸 Kembalikan Uang: ${formatIDR(Math.abs(priceDifference))}`
                  : priceDifference > 0 
                    ? `⚠️ Kurang Bayar: ${formatIDR(priceDifference)}`
                    : '✓ Nilai Total Sama (Tanpa Selisih Uang)'}
              </div>
              <div style={{
                fontSize: '0.719rem',
                color: priceDifference < 0 ? '#047857' : priceDifference > 0 ? '#b45309' : '#4f46e5',
                marginTop: '2px'
              }}>
                {priceDifference < 0
                  ? 'Kembalikan uang selisih kepada pelanggan dari kasir.'
                  : priceDifference > 0
                    ? 'Pelanggan membayar kekurangan sebelum struk baru dicetak.'
                    : 'Komposisi menu/topping diperbarui tanpa perubahan total pembayaran.'}
              </div>
            </div>
          </div>

          {/* 5. Revision Reason Input */}
          <div style={{ marginTop: '4px' }}>
            <label style={{ fontSize: '0.781rem', fontWeight: 700, color: 'var(--neutral-700)', display: 'block', marginBottom: '4px' }}>
              Alasan Revisi:
            </label>
            <input
              type="text"
              className="blue-input"
              placeholder="Contoh: Ganti topping / batal 1 menu / salah input kasir"
              value={revisionReason}
              onChange={(e) => setRevisionReason(e.target.value)}
              style={{ fontSize: '0.813rem', height: '38px', width: '100%', borderRadius: '8px' }}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};


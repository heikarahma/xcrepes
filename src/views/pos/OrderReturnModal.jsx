import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useOrder } from '../../controllers/OrderController';
import { useAuth } from '../../controllers/AuthController';
import { useRawMaterial } from '../../controllers/RawMaterialController';
import { useProductMenu } from '../../controllers/ProductMenuController';
import { useTopping } from '../../controllers/ToppingController';
import { Modal } from '../components/Modal';
import { 
  RotateCcw, 
  Search, 
  ChevronDown, 
  Check, 
  X, 
  ShoppingBag, 
  Clock, 
  Edit3, 
  User,
  Receipt,
  RefreshCw,
  Minus,
  Plus,
  Layers,
  DollarSign,
  AlertTriangle,
  Package
} from 'lucide-react';

const QUICK_REASONS = [
  'Adonan Gosong',
  'Kulit Crepes Robek / Pecah',
  'Salah Topping / Isian',
  'Jatuh / Terkontaminasi',
  'Komplain Kematangan / Rasa'
];

export const OrderReturnModal = () => {
  const { 
    orderReturnModalState, 
    closeOrderReturnModal, 
    recordOrderReturn,
    orders = []
  } = useOrder();
  const { currentUser } = useAuth();
  const { calculateIngredientsForItems, rawMaterials = [] } = useRawMaterial();
  const { productMenus = [] } = useProductMenu();
  const { toppings = [] } = useTopping();
  
  const isCashier = currentUser?.role === 'kasir';
  const { isOpen, order: initialOrder } = orderReturnModalState;

  useEffect(() => {
    if (isOpen && isCashier) {
      closeOrderReturnModal();
    }
  }, [isOpen, isCashier, closeOrderReturnModal]);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [returnAction, setReturnAction] = useState('remake'); // 'remake' | 'refund'
  const [selectedItemsMap, setSelectedItemsMap] = useState({});
  const [reasonText, setReasonText] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Searchable Dropdown State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchOrderQuery, setSearchOrderQuery] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Filter completed non-returned orders for selection
  const eligibleOrders = useMemo(() => {
    return orders.filter(o => {
      if (o.status === 'cancelled' || o.status === 'returned') return false;
      if (Array.isArray(o.items) && o.items.length > 0) {
        const hasUnreturnedItems = o.items.some(it => {
          const qty = Number(it.quantity) || 1;
          const ret = Number(it.returnedQty) || 0;
          return ret < qty;
        });
        return hasUnreturnedItems;
      }
      return true;
    });
  }, [orders]);

  // Initial order selection when opened
  useEffect(() => {
    if (isOpen) {
      if (initialOrder && initialOrder.status !== 'returned' && initialOrder.status !== 'cancelled') {
        setSelectedOrder(initialOrder);
      } else if (eligibleOrders.length > 0) {
        setSelectedOrder(eligibleOrders[0]);
      } else {
        setSelectedOrder(null);
      }

      setReturnAction('remake');
      setReasonText('');
      setSearchOrderQuery('');
      setIsDropdownOpen(false);
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, initialOrder, eligibleOrders]);

  // Synchronize items map when selectedOrder changes
  useEffect(() => {
    if (selectedOrder && Array.isArray(selectedOrder.items)) {
      const map = {};
      selectedOrder.items.forEach((item, index) => {
        const totalQty = Number(item.quantity) || 1;
        const returnedQty = Number(item.returnedQty) || 0;
        const availableQty = Math.max(0, totalQty - returnedQty);
        const itemKey = item.id || `item_${index}`;

        if (availableQty > 0) {
          map[itemKey] = {
            selected: true,
            qty: 1,
            maxQty: availableQty,
            item
          };
        }
      });
      setSelectedItemsMap(map);
    } else {
      setSelectedItemsMap({});
    }
  }, [selectedOrder]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isDropdownOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isDropdownOpen]);

  // Active items marked for return
  const activeReturnItems = useMemo(() => {
    return Object.values(selectedItemsMap)
      .filter(entry => entry.selected && entry.qty > 0)
      .map(entry => ({
        ...entry.item,
        quantity: entry.qty
      }));
  }, [selectedItemsMap]);

  // Calculate live ingredient deduction preview
  const calculatedIngredients = useMemo(() => {
    if (activeReturnItems.length === 0) return [];
    if (typeof calculateIngredientsForItems === 'function') {
      return calculateIngredientsForItems(activeReturnItems, productMenus, toppings);
    }
    return [];
  }, [activeReturnItems, calculateIngredientsForItems, productMenus, toppings]);

  if (!isOpen) return null;

  const formatIDR = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const formatDate = (isoString) => {
    if (!isoString) return '-';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('id-ID', {
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

  // Filtered eligible orders for dropdown
  const filteredEligible = eligibleOrders.filter(o => {
    if (!searchOrderQuery.trim()) return true;
    const q = searchOrderQuery.toLowerCase().trim();
    const matchInv = (o.invoiceNumber || '').toLowerCase().includes(q);
    const matchCust = (o.customerName || '').toLowerCase().includes(q);
    const matchTable = (o.tableNumber || '').toLowerCase().includes(q);
    const matchItems = (o.items || []).some(it => 
      (it.name || '').toLowerCase().includes(q) ||
      (it.toppings || []).some(t => (t.name || '').toLowerCase().includes(q))
    );
    return matchInv || matchCust || matchTable || matchItems;
  });

  const handleToggleItem = (itemKey) => {
    setSelectedItemsMap(prev => {
      const current = prev[itemKey];
      if (!current) return prev;
      return {
        ...prev,
        [itemKey]: {
          ...current,
          selected: !current.selected
        }
      };
    });
    if (errors.items) setErrors(prev => ({ ...prev, items: '' }));
  };

  const handleQuantityChange = (itemKey, delta) => {
    setSelectedItemsMap(prev => {
      const current = prev[itemKey];
      if (!current) return prev;
      const newQty = Math.max(1, Math.min(current.maxQty, current.qty + delta));
      return {
        ...prev,
        [itemKey]: {
          ...current,
          qty: newQty
        }
      };
    });
  };

  const validate = () => {
    const err = {};
    if (!selectedOrder) {
      err.order = 'Pilih pesanan yang akan diretur terlebih dahulu.';
    }
    if (activeReturnItems.length === 0) {
      err.items = 'Pilih minimal satu menu/porsi yang diretur.';
    }
    if (!reasonText.trim()) {
      err.reason = 'Alasan retur pesanan wajib diisi.';
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validate()) return;

    const currentUserName = currentUser?.nama || currentUser?.name || currentUser?.username || 'Kepala Toko';

    setIsSubmitting(true);
    let result;
    try {
      result = await recordOrderReturn({
        orderId: selectedOrder.id,
        returnAction,
        returnedItems: activeReturnItems,
        reasonCategory: reasonText.trim(),
        note: '',
        photo: null,
        user: currentUserName
      });
    } catch (err) {
      result = { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }

    if (result && result.success) {
      setSelectedOrder(null);
      setReasonText('');
      setSearchOrderQuery('');
      setIsDropdownOpen(false);
      setErrors({});
      closeOrderReturnModal();
    } else {
      setErrors({ form: result?.error || 'Gagal memproses retur pesanan.' });
    }
  };

  const handleClose = () => {
    setSelectedOrder(null);
    setReasonText('');
    setSearchOrderQuery('');
    setIsDropdownOpen(false);
    setErrors({});
    closeOrderReturnModal();
  };

  return (
    <Modal
      isOpen={isOpen && !isCashier}
      onClose={handleClose}
      title="Form Retur & Remake Pesanan Gagal"
      subtitle="Kelola pesanan gosong/robek, porsi pengganti baru (remake), atau pengembalian dana (refund)."
      size="lg"
      footer={
        <div className="order-return-footer-root">
          <div className="order-return-footer-btn-group">
            <button
              type="button"
              className="btn-return-cancel-touch"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Batal
            </button>
            <button
              type="button"
              className={`btn-return-confirm-touch ${returnAction}`}
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedOrder || activeReturnItems.length === 0}
            >
              {returnAction === 'remake' ? <RefreshCw size={16} /> : <RotateCcw size={16} />}
              <span>
                {isSubmitting 
                  ? 'Memproses...' 
                  : returnAction === 'remake' 
                    ? `Konfirmasi (${activeReturnItems.reduce((acc, it) => acc + (it.quantity || 1), 0)} Porsi)`
                    : `Konfirmasi Refund`
                }
              </span>
            </button>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="order-return-form-container">
        {/* Scoped CSS for Thumb-Friendly One-Handed Mobile UX */}
        <style>{`
          .order-return-form-container {
            display: flex;
            flex-direction: column;
            gap: 14px;
            padding-bottom: 8px;
          }

          /* 1. Trigger Pesanan Dropdown */
          .order-return-trigger-card {
            border: 1.5px solid var(--border-color, #e2e8f0);
            border-radius: 12px;
            background-color: #ffffff;
            padding: 10px 14px;
            cursor: pointer;
            transition: all 0.15s ease;
            user-select: none;
            -webkit-tap-highlight-color: transparent;
            min-height: 52px;
            display: flex;
            align-items: center;
          }
          .order-return-trigger-card:active {
            background-color: #f8fafc;
          }
          .trigger-layout {
            display: flex;
            flex-direction: column;
            gap: 4px;
            width: 100%;
          }
          .trigger-top-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
          }
          .trigger-inv-badge {
            font-size: 0.75rem;
            font-weight: 800;
            background-color: #eff6ff;
            color: var(--blue-700, #1d4ed8);
            border: 1px solid #bfdbfe;
            padding: 2px 7px;
            border-radius: 6px;
            flex-shrink: 0;
          }
          .trigger-cust-name {
            font-size: 0.875rem;
            font-weight: 700;
            color: var(--neutral-900, #0f172a);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            flex: 1;
            text-align: left;
          }
          .trigger-price-badge {
            font-size: 0.813rem;
            font-weight: 700;
            color: #15803d;
            background-color: #f0fdf4;
            border: 1px solid #bbf7d0;
            padding: 2px 8px;
            border-radius: 6px;
            flex-shrink: 0;
          }
          .trigger-bottom-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
          }
          .trigger-items-summary {
            font-size: 0.75rem;
            color: var(--neutral-500, #64748b);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            flex: 1;
            text-align: left;
          }

          /* 2. Action Selector Buttons (Segmented Touch Control) */
          .order-return-action-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }
          .order-return-action-btn {
            border: 1.5px solid #e2e8f0;
            border-radius: 12px;
            padding: 10px 12px;
            background-color: #ffffff;
            cursor: pointer;
            transition: all 0.15s ease;
            text-align: left;
            min-height: 52px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            user-select: none;
            -webkit-tap-highlight-color: transparent;
          }
          .order-return-action-btn:active {
            transform: scale(0.97);
          }
          .order-return-action-btn.active-remake {
            border-color: var(--blue-600, #2563eb);
            background-color: #f0f7ff;
            box-shadow: 0 2px 8px rgba(37, 99, 235, 0.12);
          }
          .order-return-action-btn.active-refund {
            border-color: #ef4444;
            background-color: #fef2f2;
            box-shadow: 0 2px 8px rgba(239, 68, 68, 0.12);
          }
          .action-icon-circle {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            transition: all 0.15s ease;
          }
          .action-icon-circle.remake {
            background-color: #eff6ff;
            color: var(--blue-600, #2563eb);
          }
          .order-return-action-btn.active-remake .action-icon-circle.remake {
            background-color: var(--blue-600, #2563eb);
            color: #ffffff;
          }
          .action-icon-circle.refund {
            background-color: #fef2f2;
            color: #ef4444;
          }
          .order-return-action-btn.active-refund .action-icon-circle.refund {
            background-color: #ef4444;
            color: #ffffff;
          }
          .action-text-wrap {
            display: flex;
            flex-direction: column;
            min-width: 0;
            flex: 1;
          }
          .action-title {
            font-size: 0.844rem;
            font-weight: 700;
            color: var(--neutral-900, #0f172a);
            line-height: 1.2;
          }
          .action-sub-badge {
            font-size: 0.688rem;
            font-weight: 600;
            margin-top: 2px;
          }
          .action-sub-badge.remake {
            color: var(--blue-700, #1d4ed8);
          }
          .action-sub-badge.refund {
            color: #dc2626;
          }
          .action-radio-dot {
            width: 18px;
            height: 18px;
            border-radius: 50%;
            border: 2px solid #cbd5e1;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          .order-return-action-btn.active-remake .action-radio-dot {
            border-color: var(--blue-600, #2563eb);
          }
          .order-return-action-btn.active-refund .action-radio-dot {
            border-color: #ef4444;
          }
          .action-radio-inner {
            width: 8px;
            height: 8px;
            border-radius: 50%;
          }
          .action-radio-inner.remake {
            background-color: var(--blue-600, #2563eb);
          }
          .action-radio-inner.refund {
            background-color: #ef4444;
          }

          /* 3. Items Checklist & Stepper */
          .order-return-items-box {
            border: 1px solid var(--border-color, #e2e8f0);
            border-radius: 12px;
            background-color: #ffffff;
            padding: 12px 14px;
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          .item-card-touch {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px 12px;
            border-radius: 10px;
            border: 1.5px solid #e2e8f0;
            gap: 10px;
            transition: all 0.1s ease;
            user-select: none;
            -webkit-tap-highlight-color: transparent;
          }
          .item-card-touch.selected {
            background-color: #f0f7ff;
            border-color: #bfdbfe;
          }
          .item-card-touch.disabled {
            background-color: #f8fafc;
            opacity: 0.6;
          }
          .item-left-tap-zone {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            flex: 1;
            min-width: 0;
            cursor: pointer;
          }
          .custom-checkbox-touch {
            width: 20px;
            height: 20px;
            margin-top: 2px;
            cursor: pointer;
            accent-color: var(--blue-600, #2563eb);
            flex-shrink: 0;
          }
          .stepper-touch-group {
            display: flex;
            align-items: center;
            gap: 2px;
            background-color: #ffffff;
            border: 1.5px solid #cbd5e1;
            border-radius: 8px;
            padding: 2px;
            flex-shrink: 0;
          }
          .stepper-touch-btn {
            width: 38px;
            height: 38px;
            border-radius: 6px;
            border: none;
            background-color: #f1f5f9;
            color: var(--neutral-800, #1e293b);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.1s ease;
            user-select: none;
            -webkit-tap-highlight-color: transparent;
          }
          .stepper-touch-btn:active:not(:disabled) {
            background-color: #e2e8f0;
            transform: scale(0.92);
          }
          .stepper-touch-btn:disabled {
            opacity: 0.35;
            cursor: not-allowed;
          }
          .stepper-number-val {
            font-size: 0.938rem;
            font-weight: 800;
            color: var(--neutral-900, #0f172a);
            min-width: 28px;
            text-align: center;
          }

          /* 4. Quick Reason Chips (One-Thumb Tap) */
          .quick-reasons-wrap {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: 6px;
          }
          .quick-reason-pill {
            padding: 8px 14px;
            border-radius: 20px;
            font-size: 0.781rem;
            font-weight: 600;
            border: 1px solid #e2e8f0;
            background-color: #f8fafc;
            color: var(--neutral-700, #334155);
            cursor: pointer;
            transition: all 0.12s ease;
            user-select: none;
            -webkit-tap-highlight-color: transparent;
            min-height: 38px;
            display: inline-flex;
            align-items: center;
            gap: 4px;
          }
          .quick-reason-pill:active {
            transform: scale(0.96);
          }
          .quick-reason-pill.active {
            background-color: var(--blue-600, #2563eb);
            color: #ffffff;
            border-color: var(--blue-600, #2563eb);
            box-shadow: 0 2px 6px rgba(37, 99, 235, 0.25);
          }

          /* 5. Sticky Bottom Footer (Thumb Zone) */
          .order-return-footer-root {
            display: flex;
            flex-direction: column;
            width: 100%;
          }

          .order-return-footer-btn-group {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 10px;
            width: 100%;
            box-sizing: border-box;
          }
          .btn-return-cancel-touch {
            height: 48px;
            width: 100% !important;
            border-radius: 12px;
            border: 1.5px solid #cbd5e1;
            background-color: #ffffff;
            color: var(--neutral-700, #334155);
            font-size: 0.875rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.15s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            user-select: none;
            -webkit-tap-highlight-color: transparent;
            box-sizing: border-box;
          }
          .btn-return-cancel-touch:active {
            background-color: #f1f5f9;
            transform: scale(0.97);
          }
          .btn-return-confirm-touch {
            height: 48px;
            width: 100% !important;
            border-radius: 12px;
            border: none;
            color: #ffffff;
            font-size: 0.875rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.15s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            user-select: none;
            -webkit-tap-highlight-color: transparent;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.12);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            padding: 0 8px;
            box-sizing: border-box;
          }
          .btn-return-confirm-touch.remake {
            background-color: var(--blue-600, #2563eb);
          }
          .btn-return-confirm-touch.remake:active:not(:disabled) {
            background-color: var(--blue-700, #1d4ed8);
            transform: scale(0.98);
          }
          .btn-return-confirm-touch.refund {
            background-color: #dc2626;
          }
          .btn-return-confirm-touch.refund:active:not(:disabled) {
            background-color: #b91c1c;
            transform: scale(0.98);
          }
          .btn-return-confirm-touch:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            box-shadow: none;
          }

          /* Mobile Screen Adjustments (<= 480px) */
          @media (max-width: 480px) {
            .order-return-action-grid {
              gap: 8px;
            }
            .order-return-action-btn {
              padding: 10px 8px;
              min-height: 50px;
            }
            .action-icon-circle {
              width: 28px;
              height: 28px;
            }
            .action-title {
              font-size: 0.781rem;
            }
            .action-sub-badge {
              font-size: 0.625rem;
            }
            .stepper-touch-btn {
              width: 36px;
              height: 36px;
            }
            .quick-reason-pill {
              padding: 7px 12px;
              font-size: 0.75rem;
              min-height: 36px;
            }
            .order-return-footer-btn-group {
              gap: 8px;
            }
            .btn-return-cancel-touch {
              height: 48px;
              font-size: 0.844rem;
            }
            .btn-return-confirm-touch {
              height: 48px;
              font-size: 0.813rem;
              padding: 0 4px;
            }
          }
        `}</style>

        {errors.form && (
          <div style={styles.errorAlert}>
            {errors.form}
          </div>
        )}

        {/* 1. SEARCHABLE DROPDOWN: PILIH PESANAN TRANSAKSI */}
        <div className="blue-input-group" ref={dropdownRef} style={{ position: 'relative' }}>
          <label className="blue-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Receipt size={14} color="var(--blue-600)" />
              <span>Pilih Pesanan Transaksi <span style={{ color: 'var(--red-500)' }}>*</span></span>
            </span>
            <span style={{ fontSize: '0.719rem', color: 'var(--neutral-500)' }}>
              {eligibleOrders.length} transaksi aktif
            </span>
          </label>

          {eligibleOrders.length === 0 ? (
            <div style={styles.emptyOrdersNotice}>
              Tidak ada pesanan aktif yang dapat diretur saat ini.
            </div>
          ) : (
            <>
              {/* Trigger Card (Multi-line layout for complete legibility on mobile) */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => setIsDropdownOpen(prev => !prev)}
                className="order-return-trigger-card"
                style={{
                  borderColor: errors.order ? 'var(--red-500)' : isDropdownOpen ? 'var(--blue-500)' : '#e2e8f0',
                  boxShadow: isDropdownOpen ? '0 0 0 3px rgba(37, 99, 235, 0.15)' : 'none'
                }}
              >
                {selectedOrder ? (
                  <div className="trigger-layout">
                    <div className="trigger-top-row">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                        <span className="trigger-inv-badge">
                          #{selectedOrder.invoiceNumber}
                        </span>
                        <span className="trigger-cust-name">
                          {selectedOrder.customerName || 'Pelanggan Walk-In'}
                        </span>
                      </div>
                      <span className="trigger-price-badge">
                        {formatIDR(selectedOrder.totalAmount)}
                      </span>
                    </div>

                    <div className="trigger-bottom-row">
                      <span className="trigger-items-summary">
                        • {(selectedOrder.items || []).map(it => `${it.quantity}x ${it.name}`).join(', ')}
                      </span>
                      <ChevronDown 
                        size={16} 
                        color="var(--neutral-400)" 
                        style={{ 
                          transform: isDropdownOpen ? 'rotate(180deg)' : 'none', 
                          transition: 'transform 0.15s ease',
                          flexShrink: 0
                        }} 
                      />
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <span style={{ color: 'var(--neutral-400)', fontSize: '0.844rem' }}>
                      Cari no. invoice, nama pelanggan, atau menu pesanan...
                    </span>
                    <ChevronDown size={16} color="var(--neutral-400)" />
                  </div>
                )}
              </div>

              {/* Dropdown Menu with Live Search */}
              {isDropdownOpen && (
                <div style={styles.dropdownMenu}>
                  {/* Search Input Box */}
                  <div style={styles.searchBoxWrapper}>
                    <div style={styles.searchInputInnerWrap}>
                      <Search size={15} color="var(--neutral-400)" style={styles.searchIconInside} />
                      <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Ketik invoice (#INV...), nama pelanggan, meja..."
                        value={searchOrderQuery}
                        onChange={(e) => setSearchOrderQuery(e.target.value)}
                        style={styles.dropdownSearchInput}
                        onClick={(e) => e.stopPropagation()}
                      />
                      {searchOrderQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchOrderQuery('')}
                          style={styles.clearSearchBtn}
                          title="Hapus pencarian"
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* List of Orders */}
                  <div style={styles.ordersListContainer}>
                    {filteredEligible.length === 0 ? (
                      <div style={styles.emptySearchResult}>
                        <Search size={20} color="var(--neutral-300)" />
                        <span>Tidak ditemukan transaksi yang cocok dengan "{searchOrderQuery}"</span>
                      </div>
                    ) : (
                      filteredEligible.map((order) => {
                        const isSelected = selectedOrder?.id === order.id;
                        return (
                          <div
                            key={order.id}
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsDropdownOpen(false);
                              if (errors.order) setErrors(prev => ({ ...prev, order: '' }));
                            }}
                            style={{
                              ...styles.orderOptionItem,
                              backgroundColor: isSelected ? '#eff6ff' : 'transparent',
                              borderColor: isSelected ? '#bfdbfe' : '#f1f5f9'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={styles.optionInvoiceBadge}>
                                  #{order.invoiceNumber}
                                </span>
                                <span style={{ fontSize: '0.844rem', fontWeight: 700, color: 'var(--neutral-900)' }}>
                                  {order.customerName || 'Pelanggan Walk-In'}
                                </span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--neutral-500)' }}>
                                  ({order.tableNumber || 'Takeaway'})
                                </span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={styles.optionPriceBadge}>
                                  {formatIDR(order.totalAmount)}
                                </span>
                                {isSelected && <Check size={16} color="var(--blue-600)" />}
                              </div>
                            </div>

                            {/* Item Menu Summary */}
                            <div style={styles.optionItemsList}>
                              {(order.items || []).map((it, idx) => (
                                <span key={idx} style={{ fontSize: '0.75rem', color: 'var(--neutral-700)' }}>
                                  <strong style={{ color: 'var(--neutral-900)' }}>{it.quantity}x</strong> {it.name}
                                  {it.toppings && it.toppings.length > 0 && (
                                    <span style={{ fontSize: '0.688rem', color: 'var(--orange-600)', marginLeft: '3px' }}>
                                      (+{it.toppings.map(t => `${t.name}${t.quantity > 1 ? ` (${t.quantity}x)` : ''}`).join(', ')})
                                    </span>
                                  )}
                                  {idx < (order.items.length - 1) && <span style={{ color: 'var(--neutral-300)', margin: '0 4px' }}>•</span>}
                                </span>
                              ))}
                            </div>

                            {/* Time & Cashier */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.688rem', color: 'var(--neutral-400)', marginTop: '2px' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <Clock size={10} /> {formatDate(order.date)}
                              </span>
                              <span>•</span>
                              <span>Kasir: {order.cashierName || 'Kasir'}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </>
          )}
          {errors.order && <span style={styles.errorText}>{errors.order}</span>}
        </div>

        {/* 2. PILIHAN AKSI: BUAT BARU (REMAKE) VS REFUND / BATAL */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label className="blue-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Layers size={14} color="var(--blue-600)" />
            <span>Tindakan / Solusi Retur <span style={{ color: 'var(--red-500)' }}>*</span></span>
          </label>

          <div className="order-return-action-grid">
            {/* Opsi 1: Remake / Buat Baru */}
            <div 
              role="button"
              tabIndex={0}
              onClick={() => setReturnAction('remake')}
              className={`order-return-action-btn ${returnAction === 'remake' ? 'active-remake' : ''}`}
            >
              <div className="action-icon-circle remake">
                <RefreshCw size={15} />
              </div>
              <div className="action-text-wrap">
                <div className="action-title">Buat Baru</div>
                <div className="action-sub-badge remake">Rekomendasi</div>
              </div>
              <div className="action-radio-dot">
                {returnAction === 'remake' && <div className="action-radio-inner remake" />}
              </div>
            </div>

            {/* Opsi 2: Refund / Batal */}
            <div 
              role="button"
              tabIndex={0}
              onClick={() => setReturnAction('refund')}
              className={`order-return-action-btn ${returnAction === 'refund' ? 'active-refund' : ''}`}
            >
              <div className="action-icon-circle refund">
                <DollarSign size={15} />
              </div>
              <div className="action-text-wrap">
                <div className="action-title">Refund Item</div>
                <div className="action-sub-badge refund">Uang Kembali</div>
              </div>
              <div className="action-radio-dot">
                {returnAction === 'refund' && <div className="action-radio-inner refund" />}
              </div>
            </div>
          </div>
        </div>

        {/* 3. ITEM SELECTION & PARTIAL QTY STEPPER */}
        {selectedOrder && (
          <div className="order-return-items-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShoppingBag size={15} color="var(--blue-600)" />
                <span style={{ fontSize: '0.844rem', fontWeight: 700, color: 'var(--neutral-900)' }}>
                  Pilih Menu & Porsi ({activeReturnItems.length} terpilih):
                </span>
              </div>
              <span style={{ fontSize: '0.719rem', color: 'var(--neutral-500)' }}>
                Bisa retur sebagian
              </span>
            </div>

            <div style={styles.itemsListContainer}>
              {(selectedOrder.items || []).map((item, idx) => {
                const itemKey = item.id || `item_${idx}`;
                const entry = selectedItemsMap[itemKey];
                const totalQty = Number(item.quantity) || 1;
                const previouslyReturned = Number(item.returnedQty) || 0;
                const availableQty = Math.max(0, totalQty - previouslyReturned);
                const isFullyReturned = availableQty <= 0;
                const isSelected = Boolean(entry?.selected && !isFullyReturned);

                return (
                  <div 
                    key={itemKey} 
                    className={`item-card-touch ${isSelected ? 'selected' : ''} ${isFullyReturned ? 'disabled' : ''}`}
                  >
                    {/* Checkbox & Item Info (tapping anywhere toggles selection) */}
                    <div 
                      className="item-left-tap-zone"
                      onClick={() => !isFullyReturned && handleToggleItem(itemKey)}
                    >
                      <input 
                        type="checkbox"
                        checked={isSelected}
                        disabled={isFullyReturned}
                        onChange={() => handleToggleItem(itemKey)}
                        className="custom-checkbox-touch"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, color: 'var(--neutral-900)', fontSize: '0.875rem' }}>
                            {item.name}
                          </span>
                          <span style={styles.orderedQtyBadge}>
                            Order: {totalQty}
                          </span>
                          {previouslyReturned > 0 && (
                            <span style={styles.prevReturnedBadge}>
                              Retur: {previouslyReturned}
                            </span>
                          )}
                          {isFullyReturned && (
                            <span style={styles.fullyReturnedBadge}>
                              Sudah Habis
                            </span>
                          )}
                        </div>

                        {/* Toppings Detail */}
                        {item.toppings && item.toppings.length > 0 && (
                          <div style={{ fontSize: '0.719rem', color: 'var(--orange-600)', marginTop: '2px' }}>
                            Topping: +{item.toppings.map(t => `${t.name}${t.quantity > 1 ? ` (${t.quantity}x)` : ''}`).join(', ')}
                          </div>
                        )}

                        <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', marginTop: '2px' }}>
                          {formatIDR(item.unitPrice || item.price || 0)} / porsi
                        </div>
                      </div>
                    </div>

                    {/* Qty Stepper (Large friendly touch target) */}
                    {!isFullyReturned && entry?.selected && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px', flexShrink: 0 }}>
                        <span style={{ fontSize: '0.688rem', color: 'var(--neutral-500)', fontWeight: 600 }}>
                          Qty Retur:
                        </span>
                        <div className="stepper-touch-group">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuantityChange(itemKey, -1);
                            }}
                            disabled={entry.qty <= 1}
                            className="stepper-touch-btn"
                            title="Kurangi porsi"
                          >
                            <Minus size={15} />
                          </button>
                          <span className="stepper-number-val">
                            {entry.qty}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuantityChange(itemKey, 1);
                            }}
                            disabled={entry.qty >= entry.maxQty}
                            className="stepper-touch-btn"
                            title="Tambah porsi"
                          >
                            <Plus size={15} />
                          </button>
                        </div>
                        <span style={{ fontSize: '0.688rem', color: 'var(--neutral-400)' }}>
                          (maks {entry.maxQty})
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {errors.items && <span style={styles.errorText}>{errors.items}</span>}
          </div>
        )}

        {/* 4. LIVE PREVIEW: BAHAN BAKU DAPUR YANG BERKURANG (REMAKE) */}
        {returnAction === 'remake' && activeReturnItems.length > 0 && (
          <div style={styles.ingredientsPreviewCard}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Package size={15} color="var(--blue-600)" />
                <span style={{ fontSize: '0.813rem', fontWeight: 700, color: 'var(--blue-900)' }}>
                  Bahan Baku Dapur Terpotong ({calculatedIngredients.length} Bahan):
                </span>
              </div>
              <span style={{ fontSize: '0.688rem', color: 'var(--blue-700)', fontWeight: 600 }}>
                Resep Otomatis Termasuk Topping
              </span>
            </div>

            {calculatedIngredients.length === 0 ? (
              <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', fontStyle: 'italic', padding: '6px 0' }}>
                Menu yang dipilih belum terhubung dengan formula resep bahan baku di Master Data.
              </div>
            ) : (
              <div style={styles.ingredientsListGrid}>
                {calculatedIngredients.map((ing) => {
                  const remaining = Math.round((ing.currentStock - ing.amount) * 1000) / 1000;
                  const isStockDeficit = remaining < 0;

                  return (
                    <div key={ing.rawMaterialId} style={styles.ingredientRow}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.781rem', color: 'var(--neutral-800)' }}>
                          {ing.rawMaterialName}
                        </span>
                        {isStockDeficit && (
                          <span style={styles.stockAlertBadge} title="Stok di dapur kurang dari kebutuhan remake">
                            <AlertTriangle size={10} /> Stok Menipis
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.781rem', fontWeight: 700, color: '#dc2626' }}>
                          -{ing.amount} {ing.unitName}
                        </span>
                        <span style={{ fontSize: '0.688rem', color: 'var(--neutral-400)' }}>
                          (Sisa: {remaining})
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 5. ALASAN RETUR & QUICK TAGS */}
        <div className="blue-input-group">
          <label className="blue-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Edit3 size={14} color="var(--blue-600)" />
            <span>Alasan Retur / Kegagalan Pembuatan <span style={{ color: 'var(--red-500)' }}>*</span></span>
          </label>

          {/* Quick Reason Suggestion Tags (Thumb-friendly touch pills) */}
          <div className="quick-reasons-wrap">
            {QUICK_REASONS.map((tag) => {
              const isSelected = reasonText === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setReasonText(tag);
                    if (errors.reason) setErrors(prev => ({ ...prev, reason: '' }));
                  }}
                  className={`quick-reason-pill ${isSelected ? 'active' : ''}`}
                >
                  {isSelected && <Check size={13} />}
                  <span>{tag}</span>
                </button>
              );
            })}
          </div>

          <input
            type="text"
            className="blue-input"
            value={reasonText}
            onChange={(e) => {
              setReasonText(e.target.value);
              if (errors.reason) setErrors(prev => ({ ...prev, reason: '' }));
            }}
            placeholder="Atau ketik alasan lain secara spesifik..."
            style={{ height: '44px', fontSize: '0.844rem', borderRadius: '8px' }}
            required
          />
          {errors.reason && <span style={styles.errorText}>{errors.reason}</span>}
        </div>
      </form>
    </Modal>
  );
};

const styles = {
  errorAlert: {
    padding: '8px 12px',
    borderRadius: '6px',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    fontSize: '0.813rem',
    border: '1px solid #fecaca'
  },
  emptyOrdersNotice: {
    padding: '12px',
    backgroundColor: 'var(--neutral-50)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    fontSize: '0.813rem',
    color: 'var(--neutral-500)'
  },
  dropdownMenu: {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    zIndex: 99,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  searchBoxWrapper: {
    padding: '10px 12px',
    borderBottom: '1px solid #f1f5f9',
    backgroundColor: '#f8fafc'
  },
  searchInputInnerWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%'
  },
  searchIconInside: {
    position: 'absolute',
    left: '11px',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
    zIndex: 2
  },
  dropdownSearchInput: {
    width: '100%',
    height: '38px',
    padding: '0 32px 0 34px',
    borderRadius: '7px',
    border: '1px solid #cbd5e1',
    fontSize: '0.813rem',
    backgroundColor: '#ffffff',
    outline: 'none',
    color: 'var(--neutral-900)',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
    transition: 'all 0.15s ease'
  },
  clearSearchBtn: {
    position: 'absolute',
    right: '8px',
    top: '50%',
    transform: 'translateY(-50%)',
    border: 'none',
    backgroundColor: '#f1f5f9',
    color: 'var(--neutral-500)',
    cursor: 'pointer',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    zIndex: 2
  },
  ordersListContainer: {
    maxHeight: '240px',
    overflowY: 'auto',
    padding: '8px 10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  emptySearchResult: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '24px 12px',
    fontSize: '0.813rem',
    color: 'var(--neutral-500)',
    textAlign: 'center'
  },
  orderOptionItem: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #f1f5f9',
    cursor: 'pointer',
    transition: 'all 0.1s ease',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  optionInvoiceBadge: {
    fontSize: '0.719rem',
    fontWeight: 800,
    backgroundColor: '#f1f5f9',
    color: 'var(--neutral-800)',
    padding: '1px 5px',
    borderRadius: '4px'
  },
  optionPriceBadge: {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: 'var(--blue-700)',
    backgroundColor: '#eff6ff',
    padding: '2px 6px',
    borderRadius: '4px'
  },
  optionItemsList: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: '2px'
  },
  itemsListContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxHeight: '200px',
    overflowY: 'auto',
    paddingRight: '4px'
  },
  orderedQtyBadge: {
    fontSize: '0.688rem',
    fontWeight: 600,
    color: 'var(--neutral-600)',
    backgroundColor: '#f1f5f9',
    padding: '1px 6px',
    borderRadius: '4px'
  },
  prevReturnedBadge: {
    fontSize: '0.688rem',
    fontWeight: 600,
    color: '#b45309',
    backgroundColor: '#fef3c7',
    padding: '1px 6px',
    borderRadius: '4px'
  },
  fullyReturnedBadge: {
    fontSize: '0.688rem',
    fontWeight: 700,
    color: '#991b1b',
    backgroundColor: '#fee2e2',
    padding: '1px 6px',
    borderRadius: '4px'
  },
  ingredientsPreviewCard: {
    padding: '12px 14px',
    backgroundColor: '#f0f9ff',
    border: '1px solid #bae6fd',
    borderRadius: '10px'
  },
  ingredientsListGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  ingredientRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '5px 0',
    borderBottom: '1px dashed #e0f2fe'
  },
  stockAlertBadge: {
    fontSize: '0.625rem',
    fontWeight: 700,
    color: '#b91c1c',
    backgroundColor: '#fee2e2',
    padding: '1px 5px',
    borderRadius: '4px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px'
  },
  errorText: {
    fontSize: '0.75rem',
    color: 'var(--red-500)',
    marginTop: '3px',
    display: 'block'
  }
};

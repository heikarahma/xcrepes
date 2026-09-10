import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { ordersService } from '../services/ordersService';
import { subscribeToTable } from '../lib/supabase';
import { 
  DEFAULT_DISCOUNT_PRESETS,
  calculateItemDiscount,
  checkMenuAvailability,
  checkToppingAvailability
} from '../models';
import { useRawMaterial } from './RawMaterialController';
import { useProductMenu } from './ProductMenuController';
import { useTopping } from './ToppingController';
import { useUnit } from './UnitController';
import { useAuth } from './AuthController';

const OrderContext = createContext();

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};

export const useOrderController = useOrder;

export const OrderProvider = ({ children }) => {
  const { rawMaterials = [], deductMaterialsForOrder, recordOrderReturnLog } = useRawMaterial();
  const { productMenus } = useProductMenu();
  const { toppings } = useTopping();
  const { showToast } = useUnit();
  const { currentUser } = useAuth();

  // 1. Cloud Database State via Supabase (Historical Completed Orders)
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 2. Active Register Local Cart Items State (Maintained on active cashier device)
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('pos_cart');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      return parsed.map(item => {
        const itemDiscountType = item.itemDiscountType || 'none';
        const itemDiscountValue = Number(item.itemDiscountValue) || 0;
        const itemDiscountAmount = calculateItemDiscount(item.unitPrice, item.quantity, itemDiscountType, itemDiscountValue);
        return {
          ...item,
          itemDiscountType,
          itemDiscountValue,
          itemDiscountAmount
        };
      });
    } catch {
      return [];
    }
  });

  // Customer / Table info for active cart
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('');

  // Order-level Discount State (Nominal vs Persentase)
  const [orderDiscountType, setOrderDiscountType] = useState('fixed'); // 'fixed' (Rp) | 'percent' (%)
  const [orderDiscountValue, setOrderDiscountValue] = useState(0);
  const [selectedDiscountPreset, setSelectedDiscountPreset] = useState(null);

  // Modals state
  const [toppingModalState, setToppingModalState] = useState({
    isOpen: false,
    menu: null,
    cartItem: null
  });

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [completedReceipt, setCompletedReceipt] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Order Return Modal State
  const [orderReturnModalState, setOrderReturnModalState] = useState({
    isOpen: false,
    order: null
  });

  // Sync active cart with local device storage
  useEffect(() => {
    try {
      localStorage.setItem('pos_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save pos_cart to localStorage', e);
    }
  }, [cart]);

  // Fetch Orders from Supabase
  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await ordersService.getOrders();
      if (fetchErr) {
        setError(fetchErr.message || 'Gagal memuat transaksi pesanan dari cloud.');
      } else {
        setOrders(data || []);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError(err.message || 'Terjadi kesalahan jaringan.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch and Realtime sync
  useEffect(() => {
    fetchOrders();

    const channel = subscribeToTable('orders', () => {
      fetchOrders();
    });

    return () => {
      if (channel) channel.unsubscribe();
    };
  }, [fetchOrders]);

  // Helper to generate unique key matching menu + sorted toppings
  const getCartItemKey = (menuId, toppings = []) => {
    const toppingIds = toppings
      .map(t => t.id || t.toppingId)
      .filter(Boolean)
      .sort()
      .join('-');
    return `${menuId}__${toppingIds}`;
  };

  // Add Item to Cart
  const addToCart = (menu, selectedToppings = [], note = '', customQty = 1) => {
    const availability = checkMenuAvailability(menu, rawMaterials);
    if (!availability.isAvailable) {
      showToast(`Menu "${menu.name}" tidak dapat dipesan: ${availability.reason}`, 'error', 'Stok Habis');
      return { success: false, reason: availability.reason };
    }

    if (Array.isArray(selectedToppings) && selectedToppings.length > 0) {
      for (const t of selectedToppings) {
        const topAvail = checkToppingAvailability(t, rawMaterials, toppings);
        if (!topAvail.isAvailable) {
          showToast(`Topping "${t.name}" tidak dapat dipilih: ${topAvail.reason}`, 'error', 'Topping Habis');
          return { success: false, reason: topAvail.reason };
        }
      }
    }

    const toppingsCost = selectedToppings.reduce((sum, t) => sum + (Number(t.price) || 0), 0);
    const unitPrice = Number(menu.price) + toppingsCost;
    const itemKey = getCartItemKey(menu.id, selectedToppings);

    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.itemKey === itemKey);

      if (existingIndex > -1) {
        return prev.map((item, index) => {
          if (index === existingIndex) {
            const newQty = item.quantity + customQty;
            const newDiscAmt = calculateItemDiscount(
              item.unitPrice, 
              newQty, 
              item.itemDiscountType || 'none', 
              item.itemDiscountValue || 0
            );
            return {
              ...item,
              quantity: newQty,
              note: note ? note.trim() : item.note,
              itemDiscountAmount: newDiscAmt
            };
          }
          return item;
        });
      }

      const cartItemId = `CART-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const initialDiscAmt = calculateItemDiscount(unitPrice, customQty, 'none', 0);
      const newCartItem = {
        cartItemId,
        itemKey,
        menuId: menu.id,
        name: menu.name,
        image: menu.image,
        categoryName: menu.categoryName,
        basePrice: Number(menu.price),
        toppings: selectedToppings,
        toppingsCost,
        unitPrice,
        quantity: customQty,
        note: note ? note.trim() : '',
        itemDiscountType: 'none',
        itemDiscountValue: 0,
        itemDiscountAmount: initialDiscAmt
      };

      return [newCartItem, ...prev];
    });

    return { success: true };
  };

  // Update Cart Item
  const updateCartItem = (cartItemId, selectedToppings = [], note = '', quantity = null, discountInfo = null) => {
    setCart(prev => {
      const targetItem = prev.find(item => item.cartItemId === cartItemId);
      if (!targetItem) return prev;

      const matchedMenu = (productMenus || []).find(m => m.id === targetItem.menuId) || {
        id: targetItem.menuId,
        name: targetItem.name,
        price: targetItem.basePrice
      };

      const toppingsCost = selectedToppings.reduce((sum, t) => sum + (Number(t.price) || 0), 0);
      const unitPrice = Number(matchedMenu.price) + toppingsCost;
      const newItemKey = getCartItemKey(targetItem.menuId, selectedToppings);
      const qty = quantity !== null ? Math.max(1, quantity) : targetItem.quantity;

      const dType = discountInfo?.type !== undefined ? discountInfo.type : (targetItem.itemDiscountType || 'none');
      const dVal = discountInfo?.value !== undefined ? Math.max(0, Number(discountInfo.value) || 0) : (targetItem.itemDiscountValue || 0);
      const dAmt = calculateItemDiscount(unitPrice, qty, dType, dVal);

      const isCollision = prev.some(item => item.cartItemId !== cartItemId && item.itemKey === newItemKey);

      if (isCollision) {
        return prev
          .map(item => {
            if (item.itemKey === newItemKey && item.cartItemId !== cartItemId) {
              const combinedQty = item.quantity + qty;
              const combinedDiscAmt = calculateItemDiscount(item.unitPrice, combinedQty, item.itemDiscountType || 'none', item.itemDiscountValue || 0);
              return {
                ...item,
                quantity: combinedQty,
                note: note ? note.trim() : item.note,
                itemDiscountAmount: combinedDiscAmt
              };
            }
            return item;
          })
          .filter(item => item.cartItemId !== cartItemId);
      } else {
        return prev.map(item => {
          if (item.cartItemId === cartItemId) {
            return {
              ...item,
              itemKey: newItemKey,
              toppings: selectedToppings,
              toppingsCost,
              unitPrice,
              quantity: qty,
              note: note ? note.trim() : '',
              itemDiscountType: dType,
              itemDiscountValue: dVal,
              itemDiscountAmount: dAmt
            };
          }
          return item;
        });
      }
    });
  };

  const setItemDiscount = (cartItemId, { type = 'none', value = 0 }) => {
    setCart(prev => prev.map(item => {
      if (item.cartItemId === cartItemId) {
        const discType = type || 'none';
        const discVal = Math.max(0, Number(value) || 0);
        const discAmt = calculateItemDiscount(item.unitPrice, item.quantity, discType, discVal);
        return {
          ...item,
          itemDiscountType: discType,
          itemDiscountValue: discVal,
          itemDiscountAmount: discAmt
        };
      }
      return item;
    }));
  };

  const updateQuantity = (cartItemId, delta) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            const newDiscAmt = calculateItemDiscount(
              item.unitPrice, 
              newQty, 
              item.itemDiscountType || 'none', 
              item.itemDiscountValue || 0
            );
            return { 
              ...item, 
              quantity: newQty,
              itemDiscountAmount: newDiscAmt
            };
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const setQuantity = (cartItemId, qty) => {
    const validQty = parseInt(qty, 10);
    if (isNaN(validQty) || validQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    const finalQty = Math.min(999, validQty);
    setCart(prev =>
      prev.map(item => {
        if (item.cartItemId === cartItemId) {
          const newDiscAmt = calculateItemDiscount(
            item.unitPrice, 
            finalQty, 
            item.itemDiscountType || 'none', 
            item.itemDiscountValue || 0
          );
          return {
            ...item,
            quantity: finalQty,
            itemDiscountAmount: newDiscAmt
          };
        }
        return item;
      })
    );
  };

  const removeFromCart = (cartItemId) => {
    setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
    setCustomerName('');
    setTableNumber('');
    setOrderDiscountType('fixed');
    setOrderDiscountValue(0);
    setSelectedDiscountPreset(null);
  };

  const safeCart = Array.isArray(cart) ? cart : [];

  // Financial Calculations
  const grossSubtotal = useMemo(() => {
    return safeCart.reduce((sum, item) => {
      const price = Number(item?.unitPrice) || 0;
      const qty = Number(item?.quantity) || 1;
      return sum + (price * qty);
    }, 0);
  }, [safeCart]);

  const itemsDiscountTotal = useMemo(() => {
    return safeCart.reduce((sum, item) => {
      return sum + (Number(item?.itemDiscountAmount) || 0);
    }, 0);
  }, [safeCart]);

  const subtotalAfterItemDiscount = Math.max(0, grossSubtotal - itemsDiscountTotal);

  const orderDiscountAmount = useMemo(() => {
    const val = Math.max(0, Number(orderDiscountValue) || 0);
    if (val <= 0) return 0;
    if (orderDiscountType === 'percent') {
      const pct = Math.min(100, val);
      return Math.round((subtotalAfterItemDiscount * pct) / 100);
    }
    return Math.min(subtotalAfterItemDiscount, val);
  }, [orderDiscountType, orderDiscountValue, subtotalAfterItemDiscount]);

  const discount = itemsDiscountTotal + orderDiscountAmount;
  const totalAmount = Math.max(0, grossSubtotal - discount);
  const totalItemsCount = safeCart.reduce((sum, item) => sum + (Number(item?.quantity) || 1), 0);
  const subtotal = grossSubtotal;

  const setDiscount = (val, type = null) => {
    if (type) setOrderDiscountType(type);
    setOrderDiscountValue(Math.max(0, Number(val) || 0));
    setSelectedDiscountPreset(null);
  };

  const clearDiscount = () => {
    setOrderDiscountType('percent');
    setOrderDiscountValue(0);
    setSelectedDiscountPreset(null);
  };

  const applyDiscountPreset = (preset) => {
    if (!preset) {
      clearDiscount();
      return;
    }
    setOrderDiscountType(preset.type);
    setOrderDiscountValue(preset.value);
    setSelectedDiscountPreset(preset);
  };

  // Modal handlers
  const openToppingModal = (menu, cartItem = null) => {
    setToppingModalState({ isOpen: true, menu, cartItem });
  };

  const openEditModal = (cartItem) => {
    if (!cartItem) return;
    const matchedMenu = (productMenus || []).find(m => m.id === cartItem.menuId) || {
      id: cartItem.menuId,
      name: cartItem.name,
      price: cartItem.basePrice,
      image: cartItem.image,
      categoryName: cartItem.categoryName,
      promoType: cartItem.promoType,
      promoAmount: cartItem.promoAmount,
      toppings: []
    };

    setToppingModalState({ isOpen: true, menu: matchedMenu, cartItem });
  };

  const closeToppingModal = () => {
    setToppingModalState({ isOpen: false, menu: null, cartItem: null });
  };

  const openPaymentModal = () => {
    if (cart.length === 0) return;
    setIsPaymentModalOpen(true);
  };

  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
  };

  const openReceiptModal = (receipt) => {
    setCompletedReceipt(receipt);
    setIsReceiptModalOpen(true);
  };

  const closeReceiptModal = () => {
    setIsReceiptModalOpen(false);
    setCompletedReceipt(null);
  };

  // Complete Order (Commit to Supabase cloud)
  const completeOrder = async ({ paymentMethod = 'cash', cashReceived = 0, changeAmount = 0 }) => {
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    const cashierDisplayName = currentUser?.nama || currentUser?.name || 'Kasir';

    const orderData = {
      id: `ORD-${Date.now()}`,
      invoiceNumber,
      date: new Date().toISOString(),
      status: 'completed',
      cashierName: cashierDisplayName,
      customerName: customerName.trim() || 'Pelanggan Umum',
      tableNumber: tableNumber.trim() && tableNumber.trim() !== '-' ? tableNumber.trim() : 'Takeaway',
      items: safeCart.map(item => ({
        ...item,
        lineGross: item.unitPrice * item.quantity,
        lineDiscount: item.itemDiscountAmount || 0,
        lineTotal: (item.unitPrice * item.quantity) - (item.itemDiscountAmount || 0)
      })),
      subtotal: grossSubtotal,
      itemsDiscountTotal,
      orderDiscountType,
      orderDiscountValue,
      orderDiscountAmount,
      discount,
      totalAmount,
      totalItemsCount: totalItemsCount || safeCart.reduce((sum, item) => sum + (Number(item?.quantity) || 1), 0),
      paymentMethod,
      cashReceived: paymentMethod === 'cash' ? Number(cashReceived) : totalAmount,
      changeAmount: paymentMethod === 'cash' ? Math.max(0, Number(changeAmount)) : 0
    };

    setIsSubmitting(true);
    try {
      const { data: createdOrder, error: orderErr } = await ordersService.createOrder(orderData);
      if (orderErr) {
        showToast(`Gagal menyimpan pesanan: ${orderErr.message}`, 'error', 'Error Database');
        return null;
      }

      setOrders(prev => [createdOrder || orderData, ...prev]);

      // Auto-deduct raw materials based on recipes & toppings in cloud database
      try {
        if (typeof deductMaterialsForOrder === 'function') {
          await deductMaterialsForOrder(orderData, productMenus || [], toppings || []);
        }
      } catch (e) {
        console.error('Failed to deduct raw materials for order', e);
      }

      // Reset current active cart
      clearCart();
      closePaymentModal();
      openReceiptModal(orderData);

      showToast(`Pesanan #${orderData.invoiceNumber} berhasil disimpan ke cloud database.`, 'success', 'Transaksi Selesai');
      return orderData;
    } catch (err) {
      showToast(err.message, 'error', 'Error');
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Record Order Return (Retur Pesanan Gagal Buat)
  const recordOrderReturn = async ({ orderId, reasonCategory, note = '', photo = null, user = 'Kasir' }) => {
    const targetOrder = orders.find(o => o.id === orderId || o.invoiceNumber === orderId);
    if (!targetOrder) {
      return { success: false, error: 'Pesanan tidak ditemukan.' };
    }

    setIsSubmitting(true);
    try {
      const { error: returnErr } = await ordersService.updateOrderReturn(targetOrder.id, {
        reason: reasonCategory || 'Adonan Gosong / Kesalahan Pembuatan',
        note,
        photo,
        user: user || targetOrder.cashierName || 'Kasir'
      });

      if (returnErr) {
        showToast(`Gagal meretur pesanan: ${returnErr.message}`, 'error', 'Error Database');
        return { success: false, error: returnErr.message };
      }

      const returnTimestamp = new Date().toISOString();
      setOrders(prev => prev.map(o => {
        if (o.id === targetOrder.id) {
          return {
            ...o,
            status: 'returned',
            returnReason: reasonCategory || 'Adonan Gosong / Kesalahan Pembuatan',
            returnNote: note.trim() || '',
            returnPhoto: photo || null,
            returnBy: user || o.cashierName || 'Kasir',
            returnedAt: returnTimestamp
          };
        }
        return o;
      }));

      try {
        if (typeof recordOrderReturnLog === 'function') {
          await recordOrderReturnLog({
            order: targetOrder,
            reason: reasonCategory,
            note,
            photo,
            user
          });
        }
      } catch (e) {
        console.error('Failed to log order return in stockLogs', e);
      }

      showToast(
        `Pesanan #${targetOrder.invoiceNumber} berhasil diretur di database cloud.`,
        'info',
        'Pesanan Diretur'
      );
      return { success: true };
    } catch (err) {
      showToast(err.message, 'error', 'Error');
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  };

  const openOrderReturnModal = (order) => {
    setOrderReturnModalState({ isOpen: true, order });
  };

  const closeOrderReturnModal = () => {
    setOrderReturnModalState({ isOpen: false, order: null });
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        isLoading,
        error,
        isSubmitting,
        refetch: fetchOrders,
        cart,
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
        discountPresets: DEFAULT_DISCOUNT_PRESETS,
        discount,
        setDiscount,
        applyDiscountPreset,
        clearDiscount,
        setItemDiscount,
        totalAmount,
        totalItemsCount,
        addToCart,
        updateCartItem,
        updateQuantity,
        setQuantity,
        removeFromCart,
        clearCart,
        toppingModalState,
        openToppingModal,
        openEditModal,
        closeToppingModal,
        isPaymentModalOpen,
        openPaymentModal,
        closePaymentModal,
        completedReceipt,
        isReceiptModalOpen,
        openReceiptModal,
        closeReceiptModal,
        orderReturnModalState,
        openOrderReturnModal,
        closeOrderReturnModal,
        completeOrder,
        recordOrderReturn
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const OrderController = OrderProvider;

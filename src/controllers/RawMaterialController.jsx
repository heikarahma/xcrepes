import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { rawMaterialsService } from '../services/rawMaterialsService';
import { stockLogsService } from '../services/stockLogsService';
import { opnameReportsService } from '../services/opnameReportsService';
import { getLocalDateStr, formatDateIndonesian } from '../utils/dateUtils';
import { subscribeToTable } from '../lib/supabase';
import { useUnit } from './UnitController';
import { useAuth } from './AuthController';

const RawMaterialContext = createContext();

export const useRawMaterial = () => {
  const context = useContext(RawMaterialContext);
  if (!context) {
    throw new Error('useRawMaterial must be used within a RawMaterialProvider');
  }
  return context;
};

export const useRawMaterialController = useRawMaterial;

export const RawMaterialProvider = ({ children }) => {
  const { showToast, units } = useUnit();
  const { currentUser } = useAuth();
  const isCashier = currentUser?.role === 'kasir';

  // 1. Cloud Database State via Supabase
  const [rawMaterials, setRawMaterials] = useState([]);
  const [stockLogs, setStockLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 2. Active Tab: 'inventory' | 'history'
  const [activeTab, setActiveTab] = useState('inventory');

  // 3. Search, Filter & Sorting State for Raw Materials
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date-desc'); // 'name-asc' | 'name-desc' | 'date-desc' | 'date-asc' | 'stock-desc' | 'stock-asc' | 'price-desc' | 'price-asc'
  const [stockStatusFilter, setStockStatusFilter] = useState('all'); // 'all' | 'safe' | 'low' | 'empty'
  
  // 4. Pagination State for Raw Materials
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  // 5. Selection State (for Batch Actions)
  const [selectedIds, setSelectedIds] = useState([]);

  // 6. Search, Filter & Pagination for Stock History Logs
  const [logSearchTerm, setLogSearchTerm] = useState('');
  const [logTypeFilter, setLogTypeFilter] = useState('ALL'); // 'ALL' | 'IN' | 'OUT' | 'ADJUST'
  const [logCurrentPage, setLogCurrentPage] = useState(1);
  const [logItemsPerPage, setLogItemsPerPage] = useState(8);

  // 7. Modals State
  const [formModalState, setFormModalState] = useState({
    isOpen: false,
    mode: 'add', // 'add' | 'edit'
    item: null
  });

  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    item: null,
    isBatch: false
  });

  const [adjustModalState, setAdjustModalState] = useState({
    isOpen: false,
    item: null,
    type: 'IN'
  });

  const [wasteModalState, setWasteModalState] = useState({
    isOpen: false,
    item: null
  });

  const [photoPreviewModalState, setPhotoPreviewModalState] = useState({
    isOpen: false,
    photoUrl: '',
    title: 'Pratinjau Bukti Foto',
    meta: {}
  });

  // 8. Stock Opname State & Persisted Draft & Reports
  const OPNAME_STORAGE_KEY = 'xcrepes_stock_opname_draft';
  const DAILY_REPORTS_STORAGE_KEY = 'xcrepes_daily_opname_reports';

  const [opnameItems, setOpnameItems] = useState(() => {
    try {
      const saved = localStorage.getItem(OPNAME_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load opname draft:', e);
    }
    return {};
  });

  const [dailyOpnameReports, setDailyOpnameReports] = useState(() => {
    try {
      const saved = localStorage.getItem(DAILY_REPORTS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load daily opname reports:', e);
    }
    return [];
  });

  const [opnameFilter, setOpnameFilter] = useState('ALL'); // 'ALL' | 'DIFFERENCE' | 'MATCH' | 'UNCOUNTED'
  const [opnameSearchTerm, setOpnameSearchTerm] = useState('');

  // Realtime cross-tab sync between Kasir & Super Admin
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === OPNAME_STORAGE_KEY) {
        try {
          const newDraft = e.newValue ? JSON.parse(e.newValue) : {};
          setOpnameItems(newDraft);
        } catch (err) {
          console.error('Error syncing opnameItems from storage event:', err);
        }
      }
      if (e.key === DAILY_REPORTS_STORAGE_KEY) {
        try {
          const newReports = e.newValue ? JSON.parse(e.newValue) : [];
          setDailyOpnameReports(newReports);
        } catch (err) {
          console.error('Error syncing dailyOpnameReports from storage event:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Fetch all materials, stock logs, and stock opname daily reports from Supabase
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [matRes, logsRes, opnameRes] = await Promise.all([
        rawMaterialsService.getRawMaterials(),
        stockLogsService.getStockLogs(),
        opnameReportsService.getOpnameReports()
      ]);

      if (matRes.error) {
        setError(matRes.error.message || 'Gagal memuat data bahan baku.');
      } else {
        setRawMaterials(matRes.data || []);
      }

      if (logsRes.error) {
        console.error('Failed to fetch stock logs:', logsRes.error);
      } else {
        setStockLogs(logsRes.data || []);
      }

      // Synchronize Daily Opname Reports (Supabase Cloud + LocalStorage Fallback)
      if (opnameRes.data) {
        setDailyOpnameReports(prevLocal => {
          const remoteReports = opnameRes.data || [];
          const mergedMap = new Map();

          // 1. Load all remote reports from Supabase cloud
          remoteReports.forEach(r => {
            if (r && r.id) mergedMap.set(r.id, r);
            else if (r && r.date) mergedMap.set(`date-${r.date}`, r);
          });

          // 2. Keep local reports not yet in remote, and sync them to Supabase in the background
          (prevLocal || []).forEach(localR => {
            if (!localR) return;
            const key = localR.id || `date-${localR.date}`;
            if (!mergedMap.has(key)) {
              mergedMap.set(key, localR);
              opnameReportsService.saveOpnameReport(localR).catch(e => {
                console.warn('Background sync of local opname report to Supabase:', e);
              });
            }
          });

          const mergedList = Array.from(mergedMap.values()).sort((a, b) => {
            const timeA = new Date(a.closedAt || a.date).getTime() || 0;
            const timeB = new Date(b.closedAt || b.date).getTime() || 0;
            return timeB - timeA;
          });

          try {
            localStorage.setItem(DAILY_REPORTS_STORAGE_KEY, JSON.stringify(mergedList));
          } catch (e) {}

          return mergedList;
        });
      }
    } catch (err) {
      console.error('Failed to fetch inventory data:', err);
      setError(err.message || 'Terjadi kesalahan jaringan.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch and Realtime sync
  useEffect(() => {
    fetchData();

    const channel1 = subscribeToTable('raw_materials', () => {
      fetchData();
    });
    const channel2 = subscribeToTable('inventory_stock_logs', () => {
      fetchData();
    });

    return () => {
      if (channel1) channel1.unsubscribe();
      if (channel2) channel2.unsubscribe();
    };
  }, [fetchData]);

  // Reset pagination when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]);
  }, [searchTerm, sortBy, stockStatusFilter]);

  useEffect(() => {
    setLogCurrentPage(1);
  }, [logSearchTerm, logTypeFilter]);

  // Available units from UnitController
  const availableUnits = useMemo(() => units, [units]);

  // CRUD Actions:
  // A. Create Raw Material
  const addRawMaterial = async ({ name, unitName, stock = 0, pricePerUnit = 0, minStock = 10, note = '' }) => {
    if (isCashier) {
      return { success: false, error: 'Akses Ditolak: Kasir tidak memiliki izin untuk menambah bahan baku baru.' };
    }
    const trimmedName = name.trim();
    if (!trimmedName) {
      return { success: false, error: 'Nama bahan baku wajib diisi.' };
    }
    if (!unitName) {
      return { success: false, error: 'Satuan ukur wajib dipilih.' };
    }

    const isDuplicate = rawMaterials.some(
      r => r.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (isDuplicate) {
      return { success: false, error: `Bahan baku "${trimmedName}" sudah ada.` };
    }

    const nextNumber = rawMaterials.length > 0
      ? Math.max(...rawMaterials.map(r => parseInt(r.id.replace('RAW-', '')) || 0)) + 1
      : 1;
    const formattedId = `RAW-${String(nextNumber).padStart(3, '0')}`;
    const parsedStock = Math.max(0, Number(stock) || 0);
    const parsedPrice = Math.max(0, Number(pricePerUnit) || 0);

    setIsSubmitting(true);
    try {
      const { data: newMat, error: err } = await rawMaterialsService.createRawMaterial({
        id: formattedId,
        name: trimmedName,
        unitName,
        stock: parsedStock,
        pricePerUnit: parsedPrice,
        minStock: Number(minStock) || 10,
        note
      });

      if (err) {
        showToast(`Gagal menambahkan bahan baku: ${err.message}`, 'error', 'Error Database');
        return { success: false, error: err.message };
      }

      setRawMaterials(prev => [newMat, ...prev]);

      // Add initial log if stock > 0
      if (parsedStock > 0) {
        const initialLog = {
          id: `LOG-${Date.now()}`,
          rawMaterialId: formattedId,
          rawMaterialName: trimmedName,
          unitName,
          type: 'IN',
          amount: parsedStock,
          previousStock: 0,
          currentStock: parsedStock,
          note: 'Saldo awal penambahan bahan baku baru',
          user: 'Admin',
          createdAt: new Date().toISOString()
        };
        await stockLogsService.createStockLog(initialLog);
        setStockLogs(prev => [initialLog, ...prev]);
      }

      showToast(`Bahan baku "${trimmedName}" berhasil ditambahkan ke cloud.`, 'success', 'Berhasil Disimpan');
      return { success: true };
    } catch (err) {
      showToast(err.message, 'error', 'Error');
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  };

  // B. Update Raw Material
  const updateRawMaterial = async (id, { name, unitName, stock, pricePerUnit, minStock, note }) => {
    if (isCashier) {
      return { success: false, error: 'Akses Ditolak: Kasir tidak memiliki izin untuk mengubah data master bahan baku.' };
    }
    const trimmedName = name.trim();
    if (!trimmedName) {
      return { success: false, error: 'Nama bahan baku wajib diisi.' };
    }
    if (!unitName) {
      return { success: false, error: 'Satuan ukur wajib dipilih.' };
    }

    const isDuplicate = rawMaterials.some(
      r => r.id !== id && r.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (isDuplicate) {
      return { success: false, error: `Bahan baku "${trimmedName}" sudah dipakai.` };
    }

    const target = rawMaterials.find(r => r.id === id);
    const prevStock = target ? (Number(target.stock ?? target.currentStock ?? 0) || 0) : 0;
    const parsedStock = stock !== undefined ? Math.max(0, Number(stock) || 0) : prevStock;
    const parsedPrice = Math.max(0, Number(pricePerUnit) || 0);

    setIsSubmitting(true);
    try {
      const { data: updatedMat, error: err } = await rawMaterialsService.updateRawMaterial(id, {
        name: trimmedName,
        unitName,
        stock: parsedStock,
        pricePerUnit: parsedPrice,
        minStock,
        note
      });

      if (err) {
        showToast(`Gagal mengubah data: ${err.message}`, 'error', 'Error Database');
        return { success: false, error: err.message };
      }

      setRawMaterials(prev => prev.map(r => r.id === id ? updatedMat : r));

      // Jika sisa stok diubah langsung saat edit bahan, catat audit log ADJUST
      if (stock !== undefined && parsedStock !== prevStock) {
        const actor = currentUser?.nama || 'Admin';
        const newLog = {
          id: `LOG-${Date.now()}`,
          rawMaterialId: id,
          rawMaterialName: trimmedName,
          unitName,
          type: 'ADJUST',
          amount: Math.abs(parsedStock - prevStock),
          previousStock: prevStock,
          currentStock: parsedStock,
          note: (note && note.trim()) || `Penyesuaian sisa stok dari edit bahan (${prevStock} -> ${parsedStock})`,
          user: actor,
          createdAt: new Date().toISOString()
        };
        await stockLogsService.createStockLog(newLog);
        setStockLogs(prev => [newLog, ...prev]);
      }

      showToast(`Data bahan baku "${trimmedName}" berhasil diperbarui.`, 'success', 'Perubahan Disimpan');
      return { success: true };
    } catch (err) {
      showToast(err.message, 'error', 'Error');
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  };

  // C. Adjust Stock (IN, OUT, ADJUST)
  const adjustStock = async (idOrParams, options = {}) => {
    let id, type, amount, note, user;
    if (typeof idOrParams === 'object' && idOrParams !== null) {
      id = idOrParams.rawMaterialId || idOrParams.id;
      type = idOrParams.type;
      amount = idOrParams.amount;
      note = idOrParams.note;
      user = idOrParams.user;
    } else {
      id = idOrParams;
      type = options.type;
      amount = options.amount;
      note = options.note;
      user = options.user;
    }

    if (isCashier && type !== 'IN') {
      return { success: false, error: 'Akses Ditolak: Kasir hanya diizinkan mencatat Stok Masuk (+).' };
    }

    const target = rawMaterials.find(r => r.id === id);
    if (!target) return { success: false, error: 'Bahan baku tidak ditemukan.' };

    const parsedAmount = Math.max(0, Number(amount) || 0);
    if (type !== 'ADJUST' && parsedAmount <= 0) {
      return { success: false, error: 'Jumlah penyesuaian harus lebih besar dari 0.' };
    }

    const prevStock = Number(target.stock ?? target.currentStock ?? 0) || 0;
    let newStock = prevStock;

    if (type === 'IN') {
      newStock = prevStock + parsedAmount;
    } else if (type === 'OUT') {
      if (parsedAmount > prevStock) {
        return { success: false, error: `Stok tidak cukup! Pengurangan (${parsedAmount}) melebihi stok saat ini (${prevStock}).` };
      }
      newStock = prevStock - parsedAmount;
    } else if (type === 'ADJUST') {
      newStock = parsedAmount;
    }

    setIsSubmitting(true);
    try {
      const { error: stockErr } = await rawMaterialsService.updateStock(id, newStock);
      if (stockErr) {
        showToast(`Gagal update stok: ${stockErr.message}`, 'error', 'Error Database');
        return { success: false, error: stockErr.message };
      }

      setRawMaterials(prev => prev.map(r => r.id === id ? { ...r, stock: newStock, currentStock: newStock } : r));

      const actor = user || currentUser?.nama || (isCashier ? 'Kasir' : 'Admin');
      const newLog = {
        id: `LOG-${Date.now()}`,
        rawMaterialId: target.id,
        rawMaterialName: target.name,
        unitName: target.unitName,
        type,
        amount: type === 'ADJUST' ? Math.abs(newStock - prevStock) : parsedAmount,
        previousStock: prevStock,
        currentStock: newStock,
        note: (note && note.trim()) || (type === 'IN' ? 'Stok masuk manual' : type === 'OUT' ? 'Pemakaian manual' : 'Penyesuaian stok opname'),
        user: actor,
        createdAt: new Date().toISOString()
      };

      await stockLogsService.createStockLog(newLog);
      setStockLogs(prev => [newLog, ...prev]);

      showToast(`Stok "${target.name}" berhasil disesuaikan (${prevStock} -> ${newStock} ${target.unitName}).`, 'success', 'Stok Diperbarui');
      return { success: true };
    } catch (err) {
      showToast(err.message, 'error', 'Error');
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  };

  // C.3 Record Material Waste (Bahan Rusak / Expired / Tumpah)
  const recordMaterialWaste = async ({ rawMaterialId, amount, reasonCategory = 'Bahan Kedaluwarsa / Expired', note = '', photo = null, user = 'Admin' }) => {
    const target = rawMaterials.find(r => r.id === rawMaterialId);
    if (!target) return { success: false, error: 'Bahan baku tidak ditemukan.' };

    const parsedAmount = Math.max(0, Number(amount) || 0);
    if (parsedAmount <= 0) {
      return { success: false, error: 'Jumlah bahan terbuang harus lebih besar dari 0.' };
    }

    const prevStock = Number(target.stock ?? target.currentStock ?? 0) || 0;
    const newStock = Math.max(0, Math.round((prevStock - parsedAmount) * 1000) / 1000);

    setIsSubmitting(true);
    try {
      const { error: stockErr } = await rawMaterialsService.updateStock(rawMaterialId, newStock);
      if (stockErr) {
        showToast(`Gagal mencatat bahan rusak: ${stockErr.message}`, 'error', 'Error Database');
        return { success: false, error: stockErr.message };
      }

      setRawMaterials(prev => prev.map(r => r.id === rawMaterialId ? { ...r, stock: newStock, currentStock: newStock } : r));

      const newLog = {
        id: `LOG-WASTE-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        rawMaterialId: target.id,
        rawMaterialName: target.name,
        unitName: target.unitName,
        type: 'WASTE',
        amount: parsedAmount,
        previousStock: prevStock,
        currentStock: newStock,
        reason: reasonCategory,
        note: note.trim() || reasonCategory,
        photo: photo || null,
        user: user || 'Admin',
        createdAt: new Date().toISOString()
      };

      await stockLogsService.createStockLog(newLog);
      setStockLogs(prev => [newLog, ...prev]);

      showToast(`Pencatatan bahan rusak "${target.name}" (${parsedAmount} ${target.unitName}) berhasil disimpan ke cloud.`, 'success', 'Bahan Rusak Dicatat');
      return { success: true };
    } catch (err) {
      showToast(err.message, 'error', 'Error');
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  };

  // C.4 Deduct Materials for Completed Order
  const deductMaterialsForOrder = async (orderData, menus = [], toppings = []) => {
    if (!orderData || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      return { success: false, deductionsCount: 0 };
    }

    const deductionsToApply = [];

    orderData.items.forEach(item => {
      const itemQty = Number(item.quantity) || 1;
      const matchedMenu = menus.find(m => m.id === item.menuId);
      const menuIngredients = (matchedMenu && matchedMenu.ingredients) || (item.ingredients) || [];

      menuIngredients.forEach(ing => {
        const requiredQty = (Number(ing.quantity) || 0) * itemQty;
        if (requiredQty > 0 && ing.rawMaterialId) {
          deductionsToApply.push({
            rawMaterialId: ing.rawMaterialId,
            amount: requiredQty,
            item,
            isTopping: false,
            toppingName: null
          });
        }
      });

      if (Array.isArray(item.toppings)) {
        item.toppings.forEach(t => {
          const matchedTopping = toppings.find(top => top.id === (t.id || t.toppingId));
          const toppingIngredients = (matchedTopping && matchedTopping.ingredients) || [];
          const toppingQty = Number(t.quantity) || 1;

          toppingIngredients.forEach(ting => {
            const requiredQty = (Number(ting.quantity) || 0) * toppingQty * itemQty;
            if (requiredQty > 0 && ting.rawMaterialId) {
              deductionsToApply.push({
                rawMaterialId: ting.rawMaterialId,
                amount: requiredQty,
                item,
                isTopping: true,
                toppingName: t.name || matchedTopping?.name || 'Extra Topping'
              });
            }
          });
        });
      }
    });

    if (deductionsToApply.length === 0) {
      return { success: true, deductionsCount: 0 };
    }

    const newLogs = [];
    const stockUpdates = [];
    let updatedMaterials = [...rawMaterials];

    deductionsToApply.forEach(ded => {
      const matIndex = updatedMaterials.findIndex(m => m.id === ded.rawMaterialId);
      if (matIndex !== -1) {
        const mat = updatedMaterials[matIndex];
        const prevStock = Number(mat.stock ?? mat.currentStock ?? 0) || 0;
        const deductionAmt = Math.round(Number(ded.amount) * 1000) / 1000;
        const newStock = Math.max(0, Math.round((prevStock - deductionAmt) * 1000) / 1000);

        updatedMaterials[matIndex] = {
          ...mat,
          stock: newStock,
          currentStock: newStock,
          updatedAt: new Date().toISOString()
        };

        stockUpdates.push({ id: mat.id, stock: newStock });

        newLogs.push({
          id: `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          rawMaterialId: mat.id,
          rawMaterialName: mat.name,
          unitName: mat.unitName,
          type: 'OUT',
          amount: deductionAmt,
          previousStock: prevStock,
          currentStock: newStock,
          note: ded.isTopping
            ? `Pemakaian extra topping "${ded.toppingName}" pada "${ded.item.name}" (Pesanan #${orderData.invoiceNumber})`
            : `Pemakaian resep menu "${ded.item.name}" (${ded.item.quantity}x) - Pesanan #${orderData.invoiceNumber}`,
          referenceInvoice: orderData.invoiceNumber,
          orderId: orderData.id,
          customerName: orderData.customerName || 'Pelanggan Umum',
          sourceMenu: ded.item.name,
          sourceType: ded.isTopping ? 'TOPPING' : 'MENU',
          toppingName: ded.isTopping ? ded.toppingName : null,
          user: orderData.cashierName || 'Kasir',
          createdAt: orderData.date || new Date().toISOString()
        });
      }
    });

    try {
      await Promise.all([
        rawMaterialsService.updateStocksBatch(stockUpdates),
        stockLogsService.createStockLogsBatch(newLogs)
      ]);

      setRawMaterials(updatedMaterials);
      setStockLogs(prev => [...newLogs, ...prev]);

      return { success: true, deductionsCount: newLogs.length };
    } catch (err) {
      console.error('Failed to apply order stock deductions:', err);
      return { success: false, deductionsCount: 0, error: err.message };
    }
  };

  // C.5 Record Order Return Log
  const recordOrderReturnLog = async ({ order, reason, note, photo, user }) => {
    if (!order || !Array.isArray(order.items)) return { success: false };

    const returnLogs = [];
    order.items.forEach(item => {
      const log = {
        id: `LOG-RET-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        rawMaterialId: item.menuId || null,
        rawMaterialName: item.name,
        unitName: 'porsi',
        type: 'RETURN_ORDER',
        amount: Number(item.quantity) || 1,
        previousStock: 0,
        currentStock: 0,
        reason,
        note: note || reason,
        photo: photo || null,
        referenceInvoice: order.invoiceNumber,
        orderId: order.id,
        customerName: order.customerName,
        sourceMenu: item.name,
        sourceType: 'ORDER_RETURN',
        user: user || 'Kasir',
        createdAt: new Date().toISOString()
      };
      returnLogs.push(log);
    });

    try {
      await stockLogsService.createStockLogsBatch(returnLogs);
      setStockLogs(prev => [...returnLogs, ...prev]);
      return { success: true };
    } catch (err) {
      console.error('Failed to log order return:', err);
      return { success: false, error: err.message };
    }
  };

  // C.6 Restore Materials for Cancelled Order
  const restoreMaterialsForOrder = async (orderData, menus = [], toppings = [], note = '', user = 'Super Admin') => {
    if (!orderData || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      return { success: false, restoredCount: 0 };
    }

    const restorationsToApply = [];

    orderData.items.forEach(item => {
      const itemQty = Number(item.quantity) || 1;
      const matchedMenu = menus.find(m => m.id === item.menuId);
      const menuIngredients = (matchedMenu && matchedMenu.ingredients) || (item.ingredients) || [];

      menuIngredients.forEach(ing => {
        const requiredQty = (Number(ing.quantity) || 0) * itemQty;
        if (requiredQty > 0 && ing.rawMaterialId) {
          restorationsToApply.push({
            rawMaterialId: ing.rawMaterialId,
            amount: requiredQty,
            item,
            isTopping: false,
            toppingName: null
          });
        }
      });

      if (Array.isArray(item.toppings)) {
        item.toppings.forEach(t => {
          const matchedTopping = toppings.find(top => top.id === (t.id || t.toppingId));
          const toppingIngredients = (matchedTopping && matchedTopping.ingredients) || [];
          const toppingQty = Number(t.quantity) || 1;

          toppingIngredients.forEach(ting => {
            const requiredQty = (Number(ting.quantity) || 0) * toppingQty * itemQty;
            if (requiredQty > 0 && ting.rawMaterialId) {
              restorationsToApply.push({
                rawMaterialId: ting.rawMaterialId,
                amount: requiredQty,
                item,
                isTopping: true,
                toppingName: t.name || matchedTopping?.name || 'Extra Topping'
              });
            }
          });
        });
      }
    });

    if (restorationsToApply.length === 0) {
      return { success: true, restoredCount: 0 };
    }

    const newLogs = [];
    const stockUpdates = [];
    let updatedMaterials = [...rawMaterials];

    restorationsToApply.forEach(res => {
      const matIndex = updatedMaterials.findIndex(m => m.id === res.rawMaterialId);
      if (matIndex !== -1) {
        const mat = updatedMaterials[matIndex];
        const prevStock = Number(mat.stock ?? mat.currentStock ?? 0) || 0;
        const restoreAmt = Math.round(Number(res.amount) * 1000) / 1000;
        const newStock = Math.round((prevStock + restoreAmt) * 1000) / 1000;

        updatedMaterials[matIndex] = {
          ...mat,
          stock: newStock,
          currentStock: newStock,
          updatedAt: new Date().toISOString()
        };

        const existingStockUpdate = stockUpdates.find(s => s.id === mat.id);
        if (existingStockUpdate) {
          existingStockUpdate.stock = newStock;
        } else {
          stockUpdates.push({ id: mat.id, stock: newStock });
        }

        newLogs.push({
          id: `LOG-CAN-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          rawMaterialId: mat.id,
          rawMaterialName: mat.name,
          unitName: mat.unitName,
          type: 'IN',
          amount: restoreAmt,
          previousStock: prevStock,
          currentStock: newStock,
          reason: 'Pembatalan Transaksi',
          note: note 
            ? `Pengembalian stok pembatalan invoice #${orderData.invoiceNumber} (${res.item.name}): ${note}`
            : `Pengembalian stok pembatalan invoice #${orderData.invoiceNumber} (${res.item.name})`,
          referenceInvoice: orderData.invoiceNumber,
          orderId: orderData.id,
          customerName: orderData.customerName || 'Pelanggan Umum',
          sourceMenu: res.item.name,
          sourceType: res.isTopping ? 'TOPPING' : 'MENU',
          toppingName: res.isTopping ? res.toppingName : null,
          user: user || 'Super Admin',
          createdAt: new Date().toISOString()
        });
      }
    });

    try {
      await Promise.all([
        rawMaterialsService.updateStocksBatch(stockUpdates),
        stockLogsService.createStockLogsBatch(newLogs)
      ]);

      setRawMaterials(updatedMaterials);
      setStockLogs(prev => [...newLogs, ...prev]);

      return { success: true, restoredCount: newLogs.length };
    } catch (err) {
      console.error('Failed to restore order stock:', err);
      return { success: false, restoredCount: 0, error: err.message };
    }
  };

  // D. Delete Raw Material
  const deleteRawMaterial = async (id) => {
    if (isCashier) {
      return { success: false, error: 'Akses Ditolak: Kasir tidak memiliki izin untuk menghapus bahan baku.' };
    }
    const target = rawMaterials.find(r => r.id === id);
    setIsSubmitting(true);
    try {
      const { error: err } = await rawMaterialsService.deleteRawMaterial(id);
      if (err) {
        showToast(`Gagal menghapus bahan baku: ${err.message}`, 'error', 'Error Database');
        return { success: false, error: err.message };
      }
      setRawMaterials(prev => prev.filter(r => r.id !== id));
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
      showToast(`Bahan baku "${target ? target.name : id}" telah dihapus dari cloud.`, 'info', 'Data Dihapus');
      return { success: true };
    } catch (err) {
      showToast(err.message, 'error', 'Error');
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  };

  // E. Batch Delete
  const deleteBatchRawMaterials = async (ids) => {
    if (isCashier) {
      return { success: false, error: 'Akses Ditolak: Kasir tidak memiliki izin untuk menghapus bahan baku.' };
    }
    setIsSubmitting(true);
    try {
      const { error: err } = await rawMaterialsService.deleteRawMaterialsBatch(ids);
      if (err) {
        showToast(`Gagal menghapus masal: ${err.message}`, 'error', 'Error Database');
        return { success: false, error: err.message };
      }
      setRawMaterials(prev => prev.filter(r => !ids.includes(r.id)));
      setSelectedIds([]);
      showToast(`${ids.length} bahan baku telah dihapus dari cloud.`, 'info', 'Hapus Masal');
      return { success: true };
    } catch (err) {
      showToast(err.message, 'error', 'Error');
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // F. STOCK OPNAME LOGIC & STORE CLOSING HANDLERS
  // -------------------------------------------------------------
  const addOrUpdateCountedItem = (rawMaterialId, actualStock, user = null) => {
    setOpnameItems(prev => {
      const updated = {
        ...prev,
        [rawMaterialId]: {
          actualStock: actualStock === '' ? '' : Number(actualStock),
          countedAt: new Date().toISOString(),
          countedBy: user || currentUser?.nama || (isCashier ? 'Kasir' : 'Super Admin')
        }
      };
      try {
        localStorage.setItem(OPNAME_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed saving opname draft:', e);
      }
      return updated;
    });
  };

  const removeCountedItem = (rawMaterialId) => {
    setOpnameItems(prev => {
      const updated = { ...prev };
      delete updated[rawMaterialId];
      try {
        localStorage.setItem(OPNAME_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed saving opname draft:', e);
      }
      return updated;
    });
  };

  const updateOpnameItem = (rawMaterialId, actualStock, note) => {
    addOrUpdateCountedItem(rawMaterialId, actualStock);
  };

  const fillAllMatching = () => {
    setOpnameItems(prev => {
      const updated = { ...prev };
      rawMaterials.forEach(m => {
        const sysStock = Number(m.stock ?? m.currentStock ?? 0) || 0;
        const entry = updated[m.id];
        if (!entry || entry.actualStock === '' || entry.actualStock === undefined || entry.actualStock === null) {
          updated[m.id] = {
            actualStock: sysStock,
            countedAt: new Date().toISOString()
          };
        }
      });
      try {
        localStorage.setItem(OPNAME_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    showToast('Semua bahan baku yang belum dihitung otomatis diisi sesuai stok sistem.', 'info', 'Auto-fill Sesuai');
  };

  const resetOpnameDraft = () => {
    setOpnameItems({});
    try {
      localStorage.removeItem(OPNAME_STORAGE_KEY);
    } catch (e) {}
    showToast('Draft hitungan Stock Opname berhasil direset.', 'info', 'Draft Direset');
  };

  const completeStoreClosing = async ({ closedBy = 'Kasir', outlet = 'XCrepes Main Outlet' } = {}) => {
    const todayStr = getLocalDateStr();
    const displayDate = formatDateIndonesian();

    const reportItems = rawMaterials.map(m => {
      const sysStock = Number(m.stock ?? m.currentStock ?? 0) || 0;
      const entry = opnameItems[m.id];
      const hasActual = Boolean(entry && entry.actualStock !== '' && entry.actualStock !== undefined && entry.actualStock !== null);
      const actualStock = hasActual ? Number(entry.actualStock) : null;
      const diff = hasActual ? Math.round((Number(entry.actualStock) - sysStock) * 1000) / 1000 : null;
      let status = 'UNCOUNTED';
      if (hasActual) {
        if (diff > 0) status = 'SURPLUS';
        else if (diff < 0) status = 'DEFICIT';
        else status = 'MATCH';
      }
      return {
        id: m.id,
        rawMaterialId: m.id,
        name: m.name,
        unitName: m.unitName || m.unit_name || 'Unit',
        categoryName: m.categoryName || '-',
        systemStock: sysStock,
        actualStock,
        hasActual,
        difference: diff,
        status,
        countedBy: hasActual ? (entry?.countedBy || closedBy || 'Kasir') : '-',
        pricePerUnit: Number(m.pricePerUnit || m.price_per_unit || 0),
        adminNote: ''
      };
    });

    const totalCounted = reportItems.filter(i => i.hasActual).length;
    const matchCount = reportItems.filter(i => i.hasActual && i.status === 'MATCH').length;
    const deficitCount = reportItems.filter(i => i.hasActual && i.status === 'DEFICIT').length;
    const surplusCount = reportItems.filter(i => i.hasActual && i.status === 'SURPLUS').length;
    const uncountedCount = reportItems.filter(i => !i.hasActual).length;
    const totalDifferenceValue = reportItems.reduce((acc, i) => {
      if (!i.hasActual) return acc;
      return acc + ((i.difference || 0) * (i.pricePerUnit || 0));
    }, 0);

    const newReport = {
      id: `OPNAME-${todayStr}-${Date.now().toString().slice(-4)}`,
      date: todayStr,
      displayDate,
      outlet,
      closedBy,
      closedAt: new Date().toISOString(),
      status: 'COMPLETED',
      summary: {
        totalMaterials: rawMaterials.length,
        totalCounted,
        matchCount,
        deficitCount,
        surplusCount,
        totalDifferenceValue
      },
      items: reportItems,
      appliedToInventory: false
    };

    setDailyOpnameReports(prev => {
      const filtered = prev.filter(r => r.date !== todayStr && r.id !== newReport.id);
      const updated = [newReport, ...filtered];
      try {
        localStorage.setItem(DAILY_REPORTS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed saving daily opname report to localStorage:', e);
      }
      return updated;
    });

    // Persist to Supabase Cloud Database for cross-device/browser synchronization
    opnameReportsService.saveOpnameReport(newReport).catch(err => {
      console.error('Failed saving daily opname report to Supabase:', err);
    });

    showToast(`Store Closing berhasil! Laporan Stock Opname hari ini telah dikirim ke Superadmin.`, 'success', 'Store Closing Berhasil');
    return { success: true, report: newReport };
  };

  const updateAdminOpnameItem = (reportId, materialId, { actualStock, adminNote, user } = {}) => {
    const todayStr = getLocalDateStr();
    const hasActualStockInput = actualStock !== undefined && actualStock !== '' && actualStock !== null;
    const recorderName = user || currentUser?.nama || 'Super Admin';

    // If report is today's report or active preview, keep active opnameItems draft in sync
    if (hasActualStockInput) {
      if (!reportId || reportId.startsWith('PREVIEW-') || reportId.includes(todayStr)) {
        addOrUpdateCountedItem(materialId, actualStock, recorderName);
      }
    }

    setDailyOpnameReports(prev => {
      const exists = prev.some(r => r.id === reportId || (!reportId && r.date === todayStr));

      let updated;
      if (exists) {
        updated = prev.map(report => {
          if (report.id === reportId || (!reportId && report.date === todayStr)) {
            const updatedItems = (report.items || []).map(item => {
              if (item.id === materialId || item.rawMaterialId === materialId) {
                const sysStock = Number(item.systemStock ?? 0);
                const hasActual = hasActualStockInput || Boolean(item.hasActual && item.actualStock !== null && item.actualStock !== undefined && item.actualStock !== '');
                const newActual = hasActualStockInput 
                  ? Number(actualStock) 
                  : (hasActual ? Number(item.actualStock) : null);
                const diff = hasActual ? Math.round((newActual - sysStock) * 1000) / 1000 : null;
                let status = 'UNCOUNTED';
                if (hasActual) {
                  if (diff > 0) status = 'SURPLUS';
                  else if (diff < 0) status = 'DEFICIT';
                  else status = 'MATCH';
                }

                return {
                  ...item,
                  actualStock: newActual,
                  hasActual,
                  difference: diff,
                  status,
                  countedBy: hasActualStockInput ? recorderName : (item.countedBy || report.closedBy || 'Kasir'),
                  adminNote: adminNote !== undefined ? adminNote : (item.adminNote || '')
                };
              }
              return item;
            });

            // Recompute report summary metrics
            const totalMaterials = report.summary?.totalMaterials || updatedItems.length;
            const totalCounted = updatedItems.filter(i => i.hasActual).length;
            const matchCount = updatedItems.filter(i => i.hasActual && i.status === 'MATCH').length;
            const deficitCount = updatedItems.filter(i => i.hasActual && i.status === 'DEFICIT').length;
            const surplusCount = updatedItems.filter(i => i.hasActual && i.status === 'SURPLUS').length;
            const uncountedCount = updatedItems.filter(i => !i.hasActual).length;
            const totalDifferenceValue = updatedItems.reduce((acc, i) => {
              if (!i.hasActual) return acc;
              return acc + ((i.difference || 0) * (i.pricePerUnit || 0));
            }, 0);

            return {
              ...report,
              summary: {
                ...report.summary,
                totalMaterials,
                totalCounted,
                matchCount,
                deficitCount,
                surplusCount,
                uncountedCount,
                totalDifferenceValue
              },
              items: updatedItems,
              // If actual stock changed on an applied report, allow re-applying
              appliedToInventory: hasActualStockInput ? false : report.appliedToInventory
            };
          }
          return report;
        });
      } else {
        // If not in completed reports yet, state is updated via addOrUpdateCountedItem draft
        updated = prev;
      }

      try {
        localStorage.setItem(DAILY_REPORTS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed saving opname item update:', e);
      }

      // Sync changes to Supabase cloud
      if (updated) {
        const targetReport = updated.find(r => r.id === reportId || (!reportId && r.date === todayStr));
        if (targetReport) {
          opnameReportsService.saveOpnameReport(targetReport).catch(err => {
            console.error('Failed updating opname report in Supabase:', err);
          });
        }
      }

      return updated;
    });

    showToast('Stok fisik aktual dan catatan Superadmin berhasil disimpan.', 'success', 'Perubahan Disimpan');
  };

  const updateAdminOpnameNote = (reportId, materialId, note) => {
    updateAdminOpnameItem(reportId, materialId, { adminNote: note });
  };

  const reopenStoreClosing = (reportId) => {
    const todayStr = getLocalDateStr();
    setDailyOpnameReports(prev => {
      const target = prev.find(r => r.id === reportId || r.date === todayStr);
      if (target) {
        const restored = {};
        (target.items || []).forEach(item => {
          if (item.hasActual) {
            restored[item.id] = { actualStock: item.actualStock, countedAt: target.closedAt };
          }
        });
        setOpnameItems(restored);
        try {
          localStorage.setItem(OPNAME_STORAGE_KEY, JSON.stringify(restored));
        } catch (e) {}
      }
      const updated = prev.filter(r => r.id !== reportId && r.date !== todayStr);
      try {
        localStorage.setItem(DAILY_REPORTS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}

      // Delete/reopen in Supabase cloud
      const targetId = reportId || (target ? target.id : null);
      if (targetId) {
        opnameReportsService.deleteOpnameReport(targetId).catch(err => {
          console.error('Failed deleting opname report from Supabase on reopen:', err);
        });
      }

      return updated;
    });
    showToast('Sesi Stock Opname dibuka kembali untuk penghitungan kasir.', 'info', 'Opname Dibuka');
  };

  const applyReportToInventory = async (reportId, user = 'Super Admin') => {
    if (isCashier) {
      showToast('Akses Ditolak: Hanya Super Admin yang berhak menerapkan penyesuaian ke stok sistem.', 'error', 'Akses Ditolak');
      return { success: false, error: 'Akses Ditolak' };
    }

    const report = dailyOpnameReports.find(r => r.id === reportId);
    if (!report) {
      showToast('Laporan tidak ditemukan.', 'error', 'Error');
      return { success: false, error: 'Laporan tidak ditemukan' };
    }

    const adjustments = (report.items || []).filter(item => item.hasActual && item.difference !== 0);
    if (adjustments.length === 0) {
      showToast('Tidak ada selisih stok pada laporan ini untuk disesuaikan.', 'info', 'Stok Sesuai');
      return { success: true };
    }

    setIsSubmitting(true);
    try {
      const stockUpdates = [];
      const newLogs = [];
      let updatedMaterials = [...rawMaterials];

      adjustments.forEach(adj => {
        const matIndex = updatedMaterials.findIndex(r => r.id === adj.id || r.id === adj.rawMaterialId);
        if (matIndex !== -1) {
          updatedMaterials[matIndex] = {
            ...updatedMaterials[matIndex],
            stock: adj.actualStock,
            currentStock: adj.actualStock,
            updatedAt: new Date().toISOString()
          };
        }

        stockUpdates.push({ id: adj.id || adj.rawMaterialId, stock: adj.actualStock });

        newLogs.push({
          id: `LOG-OPNAME-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          rawMaterialId: adj.id || adj.rawMaterialId,
          rawMaterialName: adj.name,
          unitName: adj.unitName,
          type: 'ADJUST',
          amount: Math.abs(adj.difference),
          previousStock: adj.systemStock,
          currentStock: adj.actualStock,
          note: adj.adminNote || 'Penyesuaian Store Closing Stock Opname',
          user,
          createdAt: new Date().toISOString()
        });
      });

      await Promise.all([
        rawMaterialsService.updateStocksBatch(stockUpdates),
        stockLogsService.createStockLogsBatch(newLogs)
      ]);

      setRawMaterials(updatedMaterials);
      setStockLogs(prev => [...newLogs, ...prev]);

      const appliedReport = { ...report, appliedToInventory: true };
      setDailyOpnameReports(prev => {
        const updated = prev.map(r => r.id === reportId ? appliedReport : r);
        try {
          localStorage.setItem(DAILY_REPORTS_STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });

      // Update applied status in Supabase cloud
      opnameReportsService.saveOpnameReport(appliedReport).catch(err => {
        console.error('Failed updating appliedToInventory in Supabase:', err);
      });

      showToast(`Berhasil menerapkan penyesuaian ${adjustments.length} bahan baku ke sistem.`, 'success', 'Sinkronisasi Berhasil');
      return { success: true };
    } catch (err) {
      showToast(`Gagal menerapkan Stock Opname: ${err.message}`, 'error', 'Error Database');
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  };

  const applyStockOpname = async ({ notes = '', user = 'Super Admin' } = {}) => {
    if (isCashier) {
      showToast('Akses Ditolak: Hanya Super Admin yang berhak menerapkan penyesuaian stok sistem.', 'error', 'Akses Ditolak');
      return { success: false, error: 'Akses Ditolak' };
    }

    const adjustments = [];
    const stockUpdates = [];
    const newLogs = [];
    let updatedMaterials = [...rawMaterials];

    rawMaterials.forEach(m => {
      const entry = opnameItems[m.id];
      if (entry && entry.actualStock !== '' && entry.actualStock !== undefined && entry.actualStock !== null) {
        const actStock = Number(entry.actualStock);
        const sysStock = Number(m.stock ?? m.currentStock ?? 0) || 0;
        const diff = Math.round((actStock - sysStock) * 1000) / 1000;

        if (diff !== 0) {
          adjustments.push({
            material: m,
            prevStock: sysStock,
            newStock: actStock,
            diff,
            note: entry.note || notes || 'Penyesuaian hasil Stock Opname fisik'
          });
        }
      }
    });

    if (adjustments.length === 0) {
      showToast('Tidak ada selisih stok yang perlu disesuaikan ke sistem.', 'info', 'Stok Sudah Sesuai');
      return { success: true, adjustedCount: 0 };
    }

    setIsSubmitting(true);
    try {
      adjustments.forEach(adj => {
        const matIndex = updatedMaterials.findIndex(r => r.id === adj.material.id);
        if (matIndex !== -1) {
          updatedMaterials[matIndex] = {
            ...updatedMaterials[matIndex],
            stock: adj.newStock,
            currentStock: adj.newStock,
            updatedAt: new Date().toISOString()
          };
        }

        stockUpdates.push({ id: adj.material.id, stock: adj.newStock });

        newLogs.push({
          id: `LOG-OPNAME-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          rawMaterialId: adj.material.id,
          rawMaterialName: adj.material.name,
          unitName: adj.material.unitName,
          type: 'ADJUST',
          amount: Math.abs(adj.diff),
          previousStock: adj.prevStock,
          currentStock: adj.newStock,
          note: adj.note,
          user: user || currentUser?.nama || 'Super Admin',
          createdAt: new Date().toISOString()
        });
      });

      await Promise.all([
        rawMaterialsService.updateStocksBatch(stockUpdates),
        stockLogsService.createStockLogsBatch(newLogs)
      ]);

      setRawMaterials(updatedMaterials);
      setStockLogs(prev => [...newLogs, ...prev]);

      // Reset opname draft after commit
      resetOpnameDraft();

      showToast(`Berhasil menerapkan penyesuaian ${adjustments.length} bahan baku ke sistem.`, 'success', 'Sinkronisasi Berhasil');
      return { success: true, adjustedCount: adjustments.length };
    } catch (err) {
      showToast(`Gagal menerapkan Stock Opname: ${err.message}`, 'error', 'Error Database');
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  };

  // Enriched Stock Opname List
  const enrichedOpnameList = useMemo(() => {
    return rawMaterials.map(m => {
      const sysStock = Number(m.stock ?? m.currentStock ?? 0) || 0;
      const entry = opnameItems[m.id];
      const hasActual = entry && entry.actualStock !== '' && entry.actualStock !== undefined && entry.actualStock !== null;
      const actualStock = hasActual ? entry.actualStock : '';
      const diff = hasActual ? Math.round((Number(entry.actualStock) - sysStock) * 1000) / 1000 : null;
      const price = Number(m.pricePerUnit || m.price_per_unit || 0) || 0;
      const diffValue = hasActual ? Math.round(diff * price) : 0;
      const note = entry?.note || '';

      let status = 'UNCOUNTED';
      if (hasActual) {
        if (diff === 0) status = 'MATCH';
        else if (diff > 0) status = 'SURPLUS';
        else status = 'DEFICIT';
      }

      return {
        ...m,
        rawMaterialId: m.id,
        systemStock: sysStock,
        actualStock,
        hasActual,
        difference: diff,
        differenceValue: diffValue,
        status,
        countedBy: hasActual ? (entry?.countedBy || (isCashier ? (currentUser?.nama || 'Kasir') : 'Super Admin')) : '-',
        note
      };
    });
  }, [rawMaterials, opnameItems, isCashier, currentUser]);

  // Filtered Stock Opname List by Search & Status Filter
  const filteredOpnameList = useMemo(() => {
    let list = enrichedOpnameList;

    if (opnameFilter === 'DIFFERENCE') {
      list = list.filter(item => item.hasActual && item.difference !== 0);
    } else if (opnameFilter === 'MATCH') {
      list = list.filter(item => item.hasActual && item.difference === 0);
    } else if (opnameFilter === 'UNCOUNTED') {
      list = list.filter(item => !item.hasActual);
    }

    if (opnameSearchTerm.trim()) {
      const q = opnameSearchTerm.toLowerCase().trim();
      list = list.filter(item => 
        (item.name || '').toLowerCase().includes(q) ||
        (item.id || '').toLowerCase().includes(q) ||
        (item.categoryName || '').toLowerCase().includes(q) ||
        (item.unitName || '').toLowerCase().includes(q)
      );
    }

    return list;
  }, [enrichedOpnameList, opnameFilter, opnameSearchTerm]);

  // Stock Opname Summary Statistics
  const opnameSummary = useMemo(() => {
    let totalCounted = 0;
    let matchCount = 0;
    let deficitCount = 0;
    let surplusCount = 0;
    let uncountedCount = 0;
    let totalDifferenceQty = 0;
    let totalDifferenceValue = 0;

    enrichedOpnameList.forEach(item => {
      if (item.hasActual) {
        totalCounted++;
        totalDifferenceQty += (item.difference || 0);
        totalDifferenceValue += (item.differenceValue || 0);
        if (item.status === 'MATCH') matchCount++;
        else if (item.status === 'DEFICIT') deficitCount++;
        else if (item.status === 'SURPLUS') surplusCount++;
      } else {
        uncountedCount++;
      }
    });

    return {
      totalMaterials: rawMaterials.length,
      totalCounted,
      countedCount: totalCounted,
      matchCount,
      deficitCount,
      surplusCount,
      uncountedCount,
      totalDifferenceQty,
      totalDifferenceValue,
      hasDraft: totalCounted > 0,
      progressPercent: rawMaterials.length > 0 ? Math.round((totalCounted / rawMaterials.length) * 100) : 0
    };
  }, [enrichedOpnameList, rawMaterials.length]);

  const todayStr = getLocalDateStr();
  const todayReport = useMemo(() => {
    return dailyOpnameReports.find(r => 
      r.date === todayStr || 
      r.id?.includes(todayStr) ||
      (r.closedAt && getLocalDateStr(new Date(r.closedAt)) === todayStr)
    ) || null;
  }, [dailyOpnameReports, todayStr]);
  const todayStoreClosed = Boolean(todayReport);

  // Selection Handlers
  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = (currentPageIds) => {
    const allSelected = currentPageIds.every(id => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !currentPageIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...currentPageIds])));
    }
  };

  // Filtered & Sorted Raw Materials (Memoized)
  const filteredRawMaterials = useMemo(() => {
    let result = [...rawMaterials];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(r => 
        r.name.toLowerCase().includes(q) || 
        r.id.toLowerCase().includes(q) ||
        (r.unitName || r.unit_name || '').toLowerCase().includes(q)
      );
    }

    if (stockStatusFilter !== 'all') {
      if (stockStatusFilter === 'empty') {
        result = result.filter(r => (Number(r.stock ?? r.currentStock) || 0) <= 0);
      } else if (stockStatusFilter === 'low') {
        result = result.filter(r => {
          const s = Number(r.stock ?? r.currentStock) || 0;
          const min = Number(r.minStock ?? r.min_stock) || 10;
          return s > 0 && s <= min;
        });
      } else if (stockStatusFilter === 'safe') {
        result = result.filter(r => {
          const s = Number(r.stock ?? r.currentStock) || 0;
          const min = Number(r.minStock ?? r.min_stock) || 10;
          return s > min;
        });
      }
    }

    result.sort((a, b) => {
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name, 'id');
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name, 'id');
      const stockA = Number(a.stock ?? a.currentStock ?? 0);
      const stockB = Number(b.stock ?? b.currentStock ?? 0);
      if (sortBy === 'stock-asc') return stockA - stockB;
      if (sortBy === 'stock-desc') return stockB - stockA;
      const priceA = Number(a.pricePerUnit || a.price_per_unit || 0);
      const priceB = Number(b.pricePerUnit || b.price_per_unit || 0);
      if (sortBy === 'price-desc') return priceB - priceA;
      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'date-asc') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      if (sortBy === 'date-desc') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      return 0;
    });

    return result;
  }, [rawMaterials, searchTerm, sortBy, stockStatusFilter]);

  // Paginated Raw Materials
  const paginatedRawMaterials = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredRawMaterials.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRawMaterials, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredRawMaterials.length / itemsPerPage) || 1;

  // Filtered Stock Logs
  const filteredStockLogs = useMemo(() => {
    let result = [...stockLogs];

    if (logSearchTerm.trim()) {
      const q = logSearchTerm.toLowerCase().trim();
      result = result.filter(log =>
        (log.rawMaterialName && log.rawMaterialName.toLowerCase().includes(q)) ||
        (log.note && log.note.toLowerCase().includes(q)) ||
        (log.reason && log.reason.toLowerCase().includes(q)) ||
        (log.referenceInvoice && log.referenceInvoice.toLowerCase().includes(q)) ||
        (log.user && log.user.toLowerCase().includes(q))
      );
    }

    if (logTypeFilter !== 'ALL') {
      result = result.filter(log => log.type === logTypeFilter);
    }

    return result;
  }, [stockLogs, logSearchTerm, logTypeFilter]);

  const paginatedStockLogs = useMemo(() => {
    const startIndex = (logCurrentPage - 1) * logItemsPerPage;
    return filteredStockLogs.slice(startIndex, startIndex + logItemsPerPage);
  }, [filteredStockLogs, logCurrentPage, logItemsPerPage]);

  const totalLogPages = Math.ceil(filteredStockLogs.length / logItemsPerPage) || 1;

  // Inventory Stock Statistics
  const inventoryStats = useMemo(() => {
    const totalMaterials = rawMaterials.length;
    const emptyCount = rawMaterials.filter(r => (Number(r.stock ?? r.currentStock) || 0) <= 0).length;
    const lowCount = rawMaterials.filter(r => {
      const s = Number(r.stock ?? r.currentStock) || 0;
      const min = Number(r.minStock) || 10;
      return s > 0 && s <= min;
    }).length;
    const safeCount = rawMaterials.filter(r => {
      const s = Number(r.stock ?? r.currentStock) || 0;
      const min = Number(r.minStock) || 10;
      return s > min;
    }).length;
    const totalInventoryValue = rawMaterials.reduce((sum, r) => {
      const s = Number(r.stock ?? r.currentStock) || 0;
      const p = Number(r.pricePerUnit) || 0;
      return sum + (s * p);
    }, 0);

    return {
      totalItems: totalMaterials,
      totalMaterials,
      safeCount,
      lowCount,
      emptyCount,
      totalInventoryValue
    };
  }, [rawMaterials]);

  // Stock Logs Statistics
  const stockLogStats = useMemo(() => {
    const totalIn = (stockLogs || []).filter(l => l.type === 'IN').length;
    const totalOut = (stockLogs || []).filter(l => l.type === 'OUT').length;
    const totalAdjust = (stockLogs || []).filter(l => l.type === 'ADJUST').length;
    const wasteCount = (stockLogs || []).filter(l => l.type === 'WASTE' || l.type === 'RETURN_ORDER').length;
    return {
      totalIn,
      totalOut,
      totalAdjust,
      wasteCount
    };
  }, [stockLogs]);

  // Modal Control Helpers
  const openAddModal = () => {
    setFormModalState({ isOpen: true, mode: 'add', item: null });
  };

  const openEditModal = (item) => {
    setFormModalState({ isOpen: true, mode: 'edit', item });
  };

  const closeFormModal = () => {
    setFormModalState({ isOpen: false, mode: 'add', item: null });
  };

  const openDeleteModal = (item) => {
    setDeleteModalState({ isOpen: true, item, isBatch: false });
  };

  const openBatchDeleteModal = () => {
    setDeleteModalState({ isOpen: true, item: null, isBatch: true });
  };

  const closeDeleteModal = () => {
    setDeleteModalState({ isOpen: false, item: null, isBatch: false });
  };

  const openAdjustModal = (item, type = 'IN') => {
    setAdjustModalState({ isOpen: true, item, type });
  };

  const closeAdjustModal = () => {
    setAdjustModalState({ isOpen: false, item: null, type: 'IN' });
  };

  const openWasteModal = (item = null) => {
    setWasteModalState({ isOpen: true, item });
  };

  const closeWasteModal = () => {
    setWasteModalState({ isOpen: false, item: null });
  };

  const openPhotoPreviewModal = (photoUrl, title = 'Bukti Foto', meta = {}) => {
    setPhotoPreviewModalState({ isOpen: true, photoUrl, title, meta });
  };

  const closePhotoPreviewModal = () => {
    setPhotoPreviewModalState({ isOpen: false, photoUrl: '', title: '', meta: {} });
  };

  return (
    <RawMaterialContext.Provider
      value={{
        rawMaterials,
        stockLogs,
        isLoading,
        error,
        isSubmitting,
        refetch: fetchData,
        availableUnits,
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
        filteredRawMaterials,
        paginatedRawMaterials,
        totalPages,
        totalItems: filteredRawMaterials.length,
        totalAllMaterials: rawMaterials.length,
        totalAllRawMaterials: rawMaterials.length,
        logSearchTerm,
        setLogSearchTerm,
        logTypeFilter,
        setLogTypeFilter,
        logCurrentPage,
        setLogCurrentPage,
        logItemsPerPage,
        setLogItemsPerPage,
        filteredStockLogs,
        paginatedStockLogs,
        totalLogPages,
        logTotalPages: totalLogPages,
        totalLogItems: filteredStockLogs.length,
        logTotalItems: filteredStockLogs.length,
        inventoryStats,
        stockSummary: inventoryStats,
        stockLogStats,
        addRawMaterial,
        updateRawMaterial,
        deleteRawMaterial,
        deleteBatchRawMaterials,
        adjustStock,
        recordMaterialWaste,
        deductMaterialsForOrder,
        restoreMaterialsForOrder,
        recordOrderReturnLog,
        formModalState,
        openAddModal,
        openEditModal,
        closeFormModal,
        deleteModalState,
        openDeleteModal,
        openBatchDeleteModal,
        closeDeleteModal,
        adjustModalState,
        openAdjustModal,
        closeAdjustModal,
        wasteModalState,
        openWasteModal,
        closeWasteModal,
        photoPreviewModalState,
        openPhotoPreviewModal,
        closePhotoPreviewModal,
        // Stock Opname & Store Closing
        opnameItems,
        dailyOpnameReports,
        todayReport,
        todayStoreClosed,
        opnameFilter,
        setOpnameFilter,
        opnameSearchTerm,
        setOpnameSearchTerm,
        addOrUpdateCountedItem,
        removeCountedItem,
        updateOpnameItem,
        fillAllMatching,
        resetOpnameDraft,
        completeStoreClosing,
        updateAdminOpnameNote,
        updateAdminOpnameItem,
        reopenStoreClosing,
        applyReportToInventory,
        applyStockOpname,
        enrichedOpnameList,
        filteredOpnameList,
        opnameSummary
      }}
    >
      {children}
    </RawMaterialContext.Provider>
  );
};

export const RawMaterialController = RawMaterialProvider;

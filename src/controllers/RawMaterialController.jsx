import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { rawMaterialsService } from '../services/rawMaterialsService';
import { stockLogsService } from '../services/stockLogsService';
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

  // Fetch all materials and stock logs from Supabase
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [matRes, logsRes] = await Promise.all([
        rawMaterialsService.getRawMaterials(),
        stockLogsService.getStockLogs()
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
  const updateRawMaterial = async (id, { name, unitName, pricePerUnit, minStock, note }) => {
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

    const parsedPrice = Math.max(0, Number(pricePerUnit) || 0);

    setIsSubmitting(true);
    try {
      const { data: updatedMat, error: err } = await rawMaterialsService.updateRawMaterial(id, {
        name: trimmedName,
        unitName,
        pricePerUnit: parsedPrice,
        minStock,
        note
      });

      if (err) {
        showToast(`Gagal mengubah data: ${err.message}`, 'error', 'Error Database');
        return { success: false, error: err.message };
      }

      setRawMaterials(prev => prev.map(r => r.id === id ? updatedMat : r));
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
    if (parsedAmount <= 0) {
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

          toppingIngredients.forEach(ting => {
            const requiredQty = (Number(ting.quantity) || 0) * itemQty;
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
        r.unitName.toLowerCase().includes(q)
      );
    }

    if (stockStatusFilter !== 'all') {
      if (stockStatusFilter === 'empty') {
        result = result.filter(r => (Number(r.stock) || 0) <= 0);
      } else if (stockStatusFilter === 'low') {
        result = result.filter(r => (Number(r.stock) || 0) > 0 && (Number(r.stock) || 0) <= (Number(r.minStock) || 10));
      } else if (stockStatusFilter === 'safe') {
        result = result.filter(r => (Number(r.stock) || 0) > (Number(r.minStock) || 10));
      }
    }

    result.sort((a, b) => {
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name, 'id');
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name, 'id');
      if (sortBy === 'stock-asc') return a.stock - b.stock;
      if (sortBy === 'stock-desc') return b.stock - a.stock;
      if (sortBy === 'price-desc') return (b.pricePerUnit || 0) - (a.pricePerUnit || 0);
      if (sortBy === 'price-asc') return (a.pricePerUnit || 0) - (b.pricePerUnit || 0);
      if (sortBy === 'date-asc') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'date-desc') return new Date(b.createdAt) - new Date(a.createdAt);
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
        closePhotoPreviewModal
      }}
    >
      {children}
    </RawMaterialContext.Provider>
  );
};

export const RawMaterialController = RawMaterialProvider;

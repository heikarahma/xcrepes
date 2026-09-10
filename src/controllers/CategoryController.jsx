import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { categoriesService } from '../services/categoriesService';
import { subscribeToTable } from '../lib/supabase';
import { useUnit } from './UnitController';

const CategoryContext = createContext();

export const useCategory = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategory must be used within a CategoryProvider');
  }
  return context;
};

export const useCategoryController = useCategory;

export const CategoryProvider = ({ children }) => {
  const { showToast } = useUnit();

  // 1. Master Categories State (Cloud Database via Supabase)
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 2. Search, Filter & Sorting State
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date-desc'); // 'name-asc' | 'name-desc' | 'date-desc' | 'date-asc'
  
  // 3. Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  // 4. Selection State (for Batch Actions)
  const [selectedIds, setSelectedIds] = useState([]);

  // 5. Modals State
  const [formModalState, setFormModalState] = useState({
    isOpen: false,
    mode: 'add', // 'add' | 'edit'
    category: null
  });

  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    category: null,
    isBatch: false
  });

  // Fetch Categories from Supabase
  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await categoriesService.getCategories();
      if (fetchErr) {
        setError(fetchErr.message || 'Gagal memuat kategori dari server.');
      } else {
        setCategories(data || []);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setError(err.message || 'Terjadi kesalahan jaringan.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch and Realtime sync
  useEffect(() => {
    fetchCategories();

    const channel = subscribeToTable('categories', () => {
      fetchCategories();
    });

    return () => {
      if (channel) channel.unsubscribe();
    };
  }, [fetchCategories]);

  // Reset pagination when search changes
  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]);
  }, [searchTerm, sortBy]);

  // CRUD Actions:
  // A. Create Category
  const addCategory = async (name, description = '') => {
    const trimmed = name.trim();
    if (!trimmed) {
      return { success: false, error: 'Nama kategori wajib diisi.' };
    }

    const isDuplicate = categories.some(c => c.name.toLowerCase() === trimmed.toLowerCase());
    if (isDuplicate) {
      return { success: false, error: `Kategori "${trimmed}" sudah ada.` };
    }

    const nextNumber = categories.length > 0 
      ? Math.max(...categories.map(c => parseInt(c.id.replace('CAT-', '')) || 0)) + 1 
      : 1;
    const formattedId = `CAT-${String(nextNumber).padStart(3, '0')}`;

    setIsSubmitting(true);
    try {
      const { data, error: err } = await categoriesService.createCategory({
        id: formattedId,
        name: trimmed,
        description
      });
      if (err) {
        showToast(`Gagal menambahkan kategori: ${err.message}`, 'error', 'Error Database');
        return { success: false, error: err.message };
      }
      setCategories(prev => [data, ...prev]);
      showToast(`Kategori "${trimmed}" berhasil ditambahkan ke cloud.`, 'success', 'Berhasil Disimpan');
      return { success: true };
    } catch (err) {
      showToast(err.message, 'error', 'Error');
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  };

  // B. Update Category
  const updateCategory = async (id, name, description = '') => {
    const trimmed = name.trim();
    if (!trimmed) {
      return { success: false, error: 'Nama kategori wajib diisi.' };
    }

    const isDuplicate = categories.some(c => c.id !== id && c.name.toLowerCase() === trimmed.toLowerCase());
    if (isDuplicate) {
      return { success: false, error: `Kategori "${trimmed}" sudah dipakai.` };
    }

    setIsSubmitting(true);
    try {
      const { data, error: err } = await categoriesService.updateCategory(id, {
        name: trimmed,
        description
      });
      if (err) {
        showToast(`Gagal mengubah kategori: ${err.message}`, 'error', 'Error Database');
        return { success: false, error: err.message };
      }
      setCategories(prev => prev.map(c => c.id === id ? data : c));
      showToast(`Kategori "${trimmed}" berhasil diperbarui.`, 'success', 'Perubahan Disimpan');
      return { success: true };
    } catch (err) {
      showToast(err.message, 'error', 'Error');
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  };

  // C. Delete Category
  const deleteCategory = async (id) => {
    const target = categories.find(c => c.id === id);
    setIsSubmitting(true);
    try {
      const { error: err } = await categoriesService.deleteCategory(id);
      if (err) {
        showToast(`Gagal menghapus kategori: ${err.message}`, 'error', 'Error Database');
        return { success: false, error: err.message };
      }
      setCategories(prev => prev.filter(c => c.id !== id));
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
      showToast(`Kategori "${target ? target.name : id}" telah dihapus dari cloud.`, 'info', 'Data Dihapus');
      return { success: true };
    } catch (err) {
      showToast(err.message, 'error', 'Error');
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  };

  // D. Batch Delete Categories
  const deleteBatchCategories = async (ids) => {
    setIsSubmitting(true);
    try {
      const { error: err } = await categoriesService.deleteCategoriesBatch(ids);
      if (err) {
        showToast(`Gagal menghapus masal: ${err.message}`, 'error', 'Error Database');
        return { success: false, error: err.message };
      }
      setCategories(prev => prev.filter(c => !ids.includes(c.id)));
      setSelectedIds([]);
      showToast(`${ids.length} kategori telah dihapus dari cloud.`, 'info', 'Hapus Masal');
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

  // Filtered & Sorted Categories (Memoized)
  const filteredCategories = useMemo(() => {
    let result = [...categories];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(c => 
        c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name, 'id');
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name, 'id');
      if (sortBy === 'date-asc') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'date-desc') return new Date(b.createdAt) - new Date(a.createdAt);
      return 0;
    });

    return result;
  }, [categories, searchTerm, sortBy]);

  // Paginated Categories
  const paginatedCategories = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCategories.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCategories, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage) || 1;

  // Modal Control Helpers
  const openAddModal = () => {
    setFormModalState({ isOpen: true, mode: 'add', category: null });
  };

  const openEditModal = (category) => {
    setFormModalState({ isOpen: true, mode: 'edit', category });
  };

  const closeFormModal = () => {
    setFormModalState({ isOpen: false, mode: 'add', category: null });
  };

  const openDeleteModal = (category) => {
    setDeleteModalState({ isOpen: true, category, isBatch: false });
  };

  const openBatchDeleteModal = () => {
    setDeleteModalState({ isOpen: true, category: null, isBatch: true });
  };

  const closeDeleteModal = () => {
    setDeleteModalState({ isOpen: false, category: null, isBatch: false });
  };

  return (
    <CategoryContext.Provider
      value={{
        categories,
        isLoading,
        error,
        isSubmitting,
        refetch: fetchCategories,
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
        filteredCategories,
        paginatedCategories,
        totalPages,
        totalItems: filteredCategories.length,
        totalAllCategories: categories.length,
        addCategory,
        updateCategory,
        deleteCategory,
        deleteBatchCategories,
        formModalState,
        openAddModal,
        openEditModal,
        closeFormModal,
        deleteModalState,
        openDeleteModal,
        openBatchDeleteModal,
        closeDeleteModal
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

export const CategoryController = CategoryProvider;

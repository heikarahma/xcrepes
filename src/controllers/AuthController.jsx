import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { cashiersService } from '../services/cashiersService';
import { authService } from '../services/authService';
import { subscribeToTable } from '../lib/supabase';
import { 
  AUTH_USER_STORAGE_KEY, 
  DEFAULT_SUPERADMIN, 
  NAV_FEATURES 
} from '../models/UserModel';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthController = useAuth;

export const AuthProvider = ({ children }) => {
  // 1. Current Authenticated User Session (Session state in localStorage)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(AUTH_USER_STORAGE_KEY);
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      if (parsed && parsed.role === 'kasir') {
        const perms = Array.isArray(parsed.permissions) ? parsed.permissions : [];
        if (!perms.includes('stock-opname')) {
          parsed.permissions = [...perms, 'stock-opname'];
        }
      }
      return parsed;
    } catch (e) {
      console.error('Gagal membaca sesi user dari localStorage', e);
      return null;
    }
  });

  // 2. Super Admin Profile (Cloud Database via Supabase)
  const [superAdminProfile, setSuperAdminProfile] = useState(DEFAULT_SUPERADMIN);

  // 3. Cashiers List (Cloud Database via Supabase)
  const [cashiers, setCashiers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 4. Search Term for Cashier Management Table
  const [searchTerm, setSearchTerm] = useState('');

  // 5. Modals State for Cashier CRUD
  const [formModalState, setFormModalState] = useState({
    isOpen: false,
    mode: 'add', // 'add' | 'edit'
    cashier: null
  });

  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    cashier: null
  });

  // 6. Modal State for Super Admin Profile Configuration
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const openProfileModal = () => setIsProfileModalOpen(true);
  const closeProfileModal = () => setIsProfileModalOpen(false);

  // Fetch profiles and cashier accounts from Supabase
  const fetchAuthData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [adminRes, cashiersRes] = await Promise.all([
        authService.getSuperAdminProfile(),
        cashiersService.getCashiers()
      ]);

      if (adminRes.data) {
        setSuperAdminProfile(adminRes.data);
      }

      if (cashiersRes.data) {
        setCashiers(cashiersRes.data);
      }
    } catch (e) {
      console.error('Failed to fetch auth data from Supabase:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuthData();

    const channel1 = subscribeToTable('superadmin_profile', () => {
      fetchAuthData();
    });
    const channel2 = subscribeToTable('cashier_accounts', () => {
      fetchAuthData();
    });

    return () => {
      if (channel1) channel1.unsubscribe();
      if (channel2) channel2.unsubscribe();
    };
  }, [fetchAuthData]);

  // Save auth user to localStorage when session changes
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(AUTH_USER_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Gagal menyimpan sesi login', e);
    }
  }, [currentUser]);

  // -------------------------------------------------------------
  // AUTHENTICATION LOGIC
  // -------------------------------------------------------------
  const login = (usernameInput, passwordInput) => {
    const trimmedUser = (usernameInput || '').trim();
    const trimmedPass = (passwordInput || '').trim();

    if (!trimmedUser || !trimmedPass) {
      return { success: false, error: 'Username dan kata sandi wajib diisi.' };
    }

    // A. Cek Kredensial Super Admin
    if (
      trimmedUser.toLowerCase() === superAdminProfile.username.toLowerCase() &&
      trimmedPass === superAdminProfile.password
    ) {
      const superAdminUser = {
        id: superAdminProfile.id,
        nama: superAdminProfile.nama,
        username: superAdminProfile.username,
        role: 'superadmin',
        loggedInAt: new Date().toISOString()
      };
      setCurrentUser(superAdminUser);
      return { success: true, user: superAdminUser };
    }

    // B. Cek Kredensial Kasir dari database cloud
    const matchedCashier = cashiers.find(
      c => c.username.toLowerCase() === trimmedUser.toLowerCase()
    );

    if (!matchedCashier) {
      return { success: false, error: 'Username atau kata sandi tidak sesuai.' };
    }

    if (matchedCashier.password !== trimmedPass) {
      return { success: false, error: 'Username atau kata sandi tidak sesuai.' };
    }

    if (matchedCashier.isActive === false) {
      return { 
        success: false, 
        error: 'Akun kasir ini sedang dinonaktifkan. Silakan hubungi Super Admin.' 
      };
    }

    const cashierUser = {
      id: matchedCashier.id,
      nama: matchedCashier.nama,
      username: matchedCashier.username,
      role: 'kasir',
      permissions: Array.from(new Set([...(matchedCashier.permissions || []), 'stock-opname'])),
      loggedInAt: new Date().toISOString()
    };

    setCurrentUser(cashierUser);
    return { success: true, user: cashierUser };
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
  };

  const hasPermission = (featureKey) => {
    if (!currentUser) return false;
    if (currentUser.role === 'superadmin') return true;
    if (featureKey === 'cashier-management') return false;

    if (featureKey === 'reports') {
      const perms = currentUser.permissions || [];
      return perms.includes('reports-sales') || perms.includes('reports-materials');
    }

    if (featureKey === 'reports-sales-summary' || featureKey === 'reports-sales-transactions') {
      const perms = currentUser.permissions || [];
      return perms.includes('reports-sales') || perms.includes(featureKey);
    }

    // Fitur Stock Opname selalu dapat diakses oleh Kasir (tutup toko fisik harian kasir)
    if (featureKey === 'stock-opname') {
      return true;
    }

    const perms = currentUser.permissions || [];
    return perms.includes(featureKey);
  };

  // -------------------------------------------------------------
  // CASHIER CRUD LOGIC
  // -------------------------------------------------------------
  const addCashier = async ({ nama, username, password, permissions = [], isActive = true }) => {
    const trimmedNama = (nama || '').trim();
    const trimmedUser = (username || '').trim().toLowerCase();
    const trimmedPass = (password || '').trim();

    if (!trimmedNama) return { success: false, error: 'Nama kasir wajib diisi.' };
    if (!trimmedUser) return { success: false, error: 'Username kasir wajib diisi.' };
    if (!trimmedPass) return { success: false, error: 'Kata sandi kasir wajib diisi.' };

    if (trimmedUser === superAdminProfile.username.toLowerCase()) {
      return { success: false, error: 'Username tersebut merupakan akun khusus Super Admin.' };
    }

    const isDuplicate = cashiers.some(c => c.username.toLowerCase() === trimmedUser);
    if (isDuplicate) {
      return { success: false, error: `Username "${trimmedUser}" sudah digunakan kasir lain.` };
    }

    const nextNumber = cashiers.length > 0
      ? Math.max(...cashiers.map(c => parseInt(c.id.replace('KASIR-', '')) || 0)) + 1
      : 1;
    const formattedId = `KASIR-${String(nextNumber).padStart(3, '0')}`;

    const newCashier = {
      id: formattedId,
      nama: trimmedNama,
      username: trimmedUser,
      password: trimmedPass,
      role: 'kasir',
      permissions: Array.isArray(permissions) ? permissions : [],
      isActive: Boolean(isActive),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      const { data, error } = await cashiersService.createCashier(newCashier);
      if (error) {
        return { success: false, error: error.message };
      }
      setCashiers(prev => [data, ...prev]);
      return { success: true, cashier: data };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  const updateCashier = async (id, { nama, username, password, permissions, isActive }) => {
    const trimmedNama = (nama || '').trim();
    const trimmedUser = (username || '').trim().toLowerCase();
    const trimmedPass = (password || '').trim();

    if (!trimmedNama) return { success: false, error: 'Nama kasir wajib diisi.' };
    if (!trimmedUser) return { success: false, error: 'Username kasir wajib diisi.' };
    if (!trimmedPass) return { success: false, error: 'Kata sandi kasir wajib diisi.' };

    if (trimmedUser === superAdminProfile.username.toLowerCase()) {
      return { success: false, error: 'Username tersebut khusus Super Admin.' };
    }

    const isDuplicate = cashiers.some(c => c.id !== id && c.username.toLowerCase() === trimmedUser);
    if (isDuplicate) {
      return { success: false, error: `Username "${trimmedUser}" sudah digunakan.` };
    }

    try {
      const { data: updatedRecord, error } = await cashiersService.updateCashier(id, {
        nama: trimmedNama,
        username: trimmedUser,
        password: trimmedPass,
        permissions,
        isActive
      });

      if (error) {
        return { success: false, error: error.message };
      }

      setCashiers(prev => prev.map(c => c.id === id ? updatedRecord : c));

      if (currentUser && currentUser.id === id && updatedRecord) {
        setCurrentUser(prev => ({
          ...prev,
          nama: updatedRecord.nama,
          username: updatedRecord.username,
          permissions: updatedRecord.permissions
        }));
      }

      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  const deleteCashier = async (id) => {
    try {
      const { error } = await cashiersService.deleteCashier(id);
      if (error) {
        return { success: false, error: error.message };
      }
      setCashiers(prev => prev.filter(c => c.id !== id));
      if (currentUser && currentUser.id === id) {
        logout();
      }
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  const toggleCashierStatus = async (id) => {
    const target = cashiers.find(c => c.id === id);
    if (!target) return;
    const nextActive = !target.isActive;

    try {
      const { error } = await cashiersService.updateCashier(id, {
        isActive: nextActive
      });
      if (!error) {
        setCashiers(prev => prev.map(c => c.id === id ? { ...c, isActive: nextActive } : c));
        if (!nextActive && currentUser && currentUser.id === id) {
          setTimeout(() => logout(), 100);
        }
      }
    } catch (e) {
      console.error('Failed to toggle cashier status:', e);
    }
  };

  const updateSuperAdminProfile = async ({ nama, username, password }) => {
    const trimmedNama = (nama || '').trim();
    const trimmedUser = (username || '').trim().toLowerCase();
    const trimmedPass = (password || '').trim();

    if (!trimmedNama) return { success: false, error: 'Nama Super Admin wajib diisi.' };
    if (!trimmedUser) return { success: false, error: 'Username wajib diisi.' };
    if (/\s/.test(trimmedUser)) return { success: false, error: 'Username tidak boleh mengandung spasi.' };
    if (trimmedUser.length < 3) return { success: false, error: 'Username minimal 3 karakter.' };

    const cashierWithSameUser = cashiers.find(c => c.username.toLowerCase() === trimmedUser);
    if (cashierWithSameUser) {
      return { 
        success: false, 
        error: `Username "${trimmedUser}" sudah digunakan oleh kasir "${cashierWithSameUser.nama}".` 
      };
    }

    if (!trimmedPass) return { success: false, error: 'Kata sandi wajib diisi.' };
    if (trimmedPass.length < 6) return { success: false, error: 'Kata sandi minimal 6 karakter.' };

    const updated = {
      ...superAdminProfile,
      nama: trimmedNama,
      username: trimmedUser,
      password: trimmedPass,
      updatedAt: new Date().toISOString()
    };

    try {
      const { error } = await authService.saveSuperAdminProfile(updated);
      if (error) {
        return { success: false, error: error.message };
      }

      setSuperAdminProfile(updated);

      if (currentUser?.role === 'superadmin') {
        setCurrentUser(prev => ({
          ...prev,
          nama: trimmedNama,
          username: trimmedUser
        }));
      }

      return { success: true, profile: updated };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  // Modal helpers
  const openAddCashierModal = () => {
    setFormModalState({ isOpen: true, mode: 'add', cashier: null });
  };

  const openEditCashierModal = (cashier) => {
    setFormModalState({ isOpen: true, mode: 'edit', cashier });
  };

  const closeFormCashierModal = () => {
    setFormModalState({ isOpen: false, mode: 'add', cashier: null });
  };

  const openDeleteCashierModal = (cashier) => {
    setDeleteModalState({ isOpen: true, cashier });
  };

  const closeDeleteCashierModal = () => {
    setDeleteModalState({ isOpen: false, cashier: null });
  };

  const filteredCashiers = useMemo(() => {
    if (!searchTerm.trim()) return cashiers;
    const q = searchTerm.toLowerCase().trim();
    return cashiers.filter(c => 
      (c.nama && c.nama.toLowerCase().includes(q)) ||
      (c.username && c.username.toLowerCase().includes(q)) ||
      (c.id && c.id.toLowerCase().includes(q))
    );
  }, [cashiers, searchTerm]);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        login,
        logout,
        hasPermission,
        navFeatures: NAV_FEATURES,
        superAdminProfile,
        updateSuperAdminProfile,
        isProfileModalOpen,
        openProfileModal,
        closeProfileModal,
        cashiers,
        filteredCashiers,
        searchTerm,
        setSearchTerm,
        addCashier,
        updateCashier,
        deleteCashier,
        toggleCashierStatus,
        formModalState,
        openAddCashierModal,
        openEditCashierModal,
        closeFormCashierModal,
        deleteModalState,
        openDeleteCashierModal,
        closeDeleteCashierModal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

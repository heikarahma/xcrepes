import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

/**
 * [C] UIController
 * Controller global untuk antarmuka pengguna:
 * - Navigasi modul aktif (activeMenu)
 * - Sidebar drawer mobile (isMobileMenuOpen)
 * - Sistem notifikasi Toast global (toasts, showToast, removeToast)
 */
const UIContext = createContext();

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};

// Hook praktis untuk komponen yang hanya membutuhkan notifikasi Toast
export const useToast = () => {
  const { showToast, removeToast, toasts } = useUI();
  return { showToast, removeToast, toasts };
};

// Hook praktis untuk komponen yang hanya membutuhkan navigasi
export const useNavigation = () => {
  const { activeMenu, setActiveMenu, isMobileMenuOpen, setIsMobileMenuOpen } = useUI();
  return { activeMenu, setActiveMenu, isMobileMenuOpen, setIsMobileMenuOpen };
};

export const UIProvider = ({ children }) => {
  // 1. Navigation Active Menu State (tersimpan di localStorage)
  const [activeMenu, setActiveMenuState] = useState(() => {
    try {
      const saved = localStorage.getItem('pos_active_nav_menu');
      const validMenus = [
        'kasir', 'product-menu', 'category', 'topping', 
        'raw-material', 'stock-opname', 'returns', 'unit', 
        'settings', 'branch-management', 'reports', 'reports-sales', 
        'reports-sales-summary', 'reports-sales-transactions', 
        'reports-materials', 'cashier-management'
      ];
      return validMenus.includes(saved) ? saved : 'kasir';
    } catch {
      return 'kasir';
    }
  });

  const setActiveMenu = useCallback((menu) => {
    setActiveMenuState(menu);
    try {
      localStorage.setItem('pos_active_nav_menu', menu);
    } catch {
      // ignore
    }
  }, []);

  // 2. Mobile Drawer Sidebar State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 3. Global Toast Notifications State
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', title = '') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, title }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const value = useMemo(() => ({
    activeMenu,
    setActiveMenu,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    toasts,
    showToast,
    removeToast
  }), [activeMenu, setActiveMenu, isMobileMenuOpen, toasts, showToast, removeToast]);

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
};

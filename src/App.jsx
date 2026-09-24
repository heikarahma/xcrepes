import React, { useEffect } from 'react';

// Controllers [C]
import { 
  AuthProvider,
  useAuth,
  UnitProvider, 
  useUnit, 
  CategoryProvider, 
  RawMaterialProvider, 
  ToppingProvider, 
  ProductMenuProvider, 
  OrderProvider,
  SettingsProvider,
  ReportProvider,
  StockOpnameProvider
} from './controllers';

// Views [V] - Auth
import { LoginView } from './views/auth/LoginView';

// Views [V] - Layout & Common
import { Sidebar } from './views/components/Sidebar';
import { Navbar } from './views/components/Navbar';
import { ToastContainer } from './views/components/Toast';

// Views [V] - POS Kasir
import { KasirOrderView } from './views/pos/KasirOrderView';
import { ToppingSelectionModal } from './views/pos/ToppingSelectionModal';
import { PaymentModal } from './views/pos/PaymentModal';
import { ReceiptModal } from './views/pos/ReceiptModal';

// Views [V] - Master Data
import { UnitListView } from './views/master/unit/UnitListView';
import { UnitFormModal } from './views/master/unit/UnitFormModal';
import { UnitDeleteModal } from './views/master/unit/UnitDeleteModal';

import { CategoryListView } from './views/master/category/CategoryListView';
import { CategoryFormModal } from './views/master/category/CategoryFormModal';
import { CategoryDeleteModal } from './views/master/category/CategoryDeleteModal';
import { CategoryReorderModal } from './views/master/category/CategoryReorderModal';

import { ToppingListView } from './views/master/topping/ToppingListView';
import { ToppingFormModal } from './views/master/topping/ToppingFormModal';
import { ToppingDeleteModal } from './views/master/topping/ToppingDeleteModal';

import { ProductMenuListView } from './views/master/productMenu/ProductMenuListView';
import { ProductMenuFormModal } from './views/master/productMenu/ProductMenuFormModal';
import { ProductMenuDeleteModal } from './views/master/productMenu/ProductMenuDeleteModal';

// Views [V] - Inventori & Stok
import { RawMaterialListView } from './views/inventory/rawMaterial/RawMaterialListView';
import { StockOpnameView } from './views/inventory/rawMaterial/StockOpnameView';
import { RawMaterialFormModal } from './views/inventory/rawMaterial/RawMaterialFormModal';
import { RawMaterialDeleteModal } from './views/inventory/rawMaterial/RawMaterialDeleteModal';
import { StockAdjustModal } from './views/inventory/rawMaterial/StockAdjustModal';
import { WasteRecordModal } from './views/inventory/rawMaterial/WasteRecordModal';

// Views [V] - Retur Pesanan POS & Preview Foto & Revisi
import { OrderReturnModal } from './views/pos/OrderReturnModal';
import { OrderCancelModal } from './views/pos/OrderCancelModal';
import { OrderRevisionModal } from './views/pos/OrderRevisionModal';
import { ReturnsManagementView } from './views/returns/ReturnsManagementView';
import { ImagePreviewModal } from './views/components/ImagePreviewModal';
import { useRawMaterial } from './controllers/RawMaterialController';

// Views [V] - Konfigurasi & Pengaturan
import { SettingsView } from './views/settings/SettingsView';

// Views [V] - Laporan & Analitik
import { ReportsView } from './views/reports/ReportsView';

// Views [V] - Kelola Akun Kasir & Hak Akses (Super Admin)
import { CashierManagementView } from './views/cashier/CashierManagementView';
import { CashierFormModal } from './views/cashier/CashierFormModal';
import { CashierDeleteModal } from './views/cashier/CashierDeleteModal';

// Views [V] - Profil & Konfigurasi Super Admin
import { SuperAdminProfileModal } from './views/profile/SuperAdminProfileModal';

// Views [V] - Supabase Status Banner
import { SupabaseConfigBanner } from './views/components/SupabaseConfigBanner';

function MainLayout() {
  const { activeMenu, setActiveMenu } = useUnit();
  const { currentUser, hasPermission } = useAuth();
  const { photoPreviewModalState, closePhotoPreviewModal } = useRawMaterial();

  // Route Guard: Pastikan kasir tidak membuka menu yang hak aksesnya dinonaktifkan
  useEffect(() => {
    if (currentUser?.role === 'kasir') {
      let isAllowed = false;
      if (activeMenu === 'reports' || activeMenu === 'reports-sales' || activeMenu === 'reports-sales-summary' || activeMenu === 'reports-sales-transactions' || activeMenu === 'reports-materials') {
        isAllowed = hasPermission('reports-sales') || hasPermission('reports-materials');
      } else {
        isAllowed = hasPermission(activeMenu);
      }

      // Jika menu yang aktif saat ini tidak diizinkan, arahkan ke menu pertama yang diizinkan
      if (!isAllowed) {
        const candidateMenus = ['kasir', 'product-menu', 'category', 'topping', 'raw-material', 'stock-opname', 'returns', 'reports-sales-summary', 'reports-sales-transactions', 'reports-materials', 'settings', 'unit'];
        const firstPermitted = candidateMenus.find(m => hasPermission(m));
        if (firstPermitted) {
          setActiveMenu(firstPermitted);
        }
      }
    }
  }, [activeMenu, currentUser, hasPermission, setActiveMenu]);

  const renderActiveModule = () => {
    switch (activeMenu) {
      case 'kasir':
        return <KasirOrderView />;
      case 'product-menu':
        return <ProductMenuListView />;
      case 'category':
        return <CategoryListView />;
      case 'topping':
        return <ToppingListView />;
      case 'raw-material':
        return <RawMaterialListView />;
      case 'stock-opname':
        return <StockOpnameView />;
      case 'returns':
        return <ReturnsManagementView />;
      case 'settings':
        return <SettingsView />;
      case 'reports':
      case 'reports-sales':
      case 'reports-sales-summary':
      case 'reports-sales-transactions':
      case 'reports-materials':
        return <ReportsView />;
      case 'cashier-management':
        return currentUser?.role === 'superadmin' ? <CashierManagementView /> : <KasirOrderView />;
      case 'unit':
      default:
        return <UnitListView />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Nav */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="app-main">
        <SupabaseConfigBanner />
        <Navbar />
        
        <main className={`app-content ${activeMenu === 'returns' ? 'app-content-returns' : ''}`}>
          {renderActiveModule()}
        </main>
      </div>

      {/* Modals for Satuan Ukur */}
      <UnitFormModal />
      <UnitDeleteModal />

      {/* Modals for Kategori */}
      <CategoryFormModal />
      <CategoryDeleteModal />
      <CategoryReorderModal />

      {/* Modals for Topping */}
      <ToppingFormModal />
      <ToppingDeleteModal />

      {/* Modals for Menu Produk */}
      <ProductMenuFormModal />
      <ProductMenuDeleteModal />

      {/* Modals for Stok Bahan Baku & Waste */}
      <RawMaterialFormModal />
      <RawMaterialDeleteModal />
      <StockAdjustModal />
      <WasteRecordModal />

      {/* Modals for Kasir POS & Retur Pesanan & Pembatalan & Revisi */}
      <ToppingSelectionModal />
      <PaymentModal />
      <ReceiptModal />
      <OrderReturnModal />
      <OrderCancelModal />
      <OrderRevisionModal />

      {/* Modal Zoom / Preview Bukti Foto */}
      <ImagePreviewModal
        isOpen={photoPreviewModalState?.isOpen}
        onClose={closePhotoPreviewModal}
        photoUrl={photoPreviewModalState?.photoUrl}
        title={photoPreviewModalState?.title}
        meta={photoPreviewModalState?.meta}
      />

      {/* Modals for Manajemen Kasir (Super Admin) */}
      <CashierFormModal />
      <CashierDeleteModal />

      {/* Modal Konfigurasi Profil Super Admin */}
      <SuperAdminProfileModal />

      {/* Global Toast */}
      <ToastContainer />
    </div>
  );
}

function AuthenticatedApp() {
  const { currentUser } = useAuth();

  // Jika pengguna belum login, tampilkan Halaman Login
  if (!currentUser) {
    return (
      <>
        <LoginView />
        <ToastContainer />
      </>
    );
  }

  // Jika sudah login, tampilkan Layout Aplikasi Utama
  return <MainLayout />;
}

function App() {
  return (
    <AuthProvider>
      <UnitProvider>
        <SettingsProvider>
          <CategoryProvider>
            <RawMaterialProvider>
              <StockOpnameProvider>
                <ToppingProvider>
                  <ProductMenuProvider>
                    <OrderProvider>
                      <ReportProvider>
                        <AuthenticatedApp />
                      </ReportProvider>
                    </OrderProvider>
                  </ProductMenuProvider>
                </ToppingProvider>
              </StockOpnameProvider>
            </RawMaterialProvider>
          </CategoryProvider>
        </SettingsProvider>
      </UnitProvider>
    </AuthProvider>
  );
}

export default App;

import React, { useState } from 'react';
import { useAuth } from '../../../controllers/AuthController';
import { KasirStockOpnameView } from '../stockOpname/KasirStockOpnameView';
import { AdminOpnameMainView } from '../stockOpname/AdminOpnameMainView';
import { AdminOpnameDetailView } from '../stockOpname/AdminOpnameDetailView';

export const StockOpnameView = () => {
  const { currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === 'superadmin';

  // Navigation states for Admin
  const [selectedReport, setSelectedReport] = useState(null);
  const [isAdminCreatingOpname, setIsAdminCreatingOpname] = useState(false);

  // 1. Kasir Flow (Section 3, 4, 5)
  // Kasir langsung masuk ke input stok aktual harian
  if (!isSuperAdmin) {
    return <KasirStockOpnameView />;
  }

  // 2. Admin Detail Report Screen (Section 7, 8, 9, 10, 11, 12, 13, 14)
  if (selectedReport) {
    return (
      <AdminOpnameDetailView
        report={selectedReport}
        onBack={() => setSelectedReport(null)}
      />
    );
  }

  // 3. Admin Create Today's Opname (Section 15, 23)
  if (isAdminCreatingOpname) {
    return (
      <KasirStockOpnameView
        isAdminCreating={true}
        onBack={() => setIsAdminCreatingOpname(false)}
      />
    );
  }

  // 4. Admin Main Screen (Section 6, 16, 17, 18, 19)
  return (
    <AdminOpnameMainView
      onOpenReport={(report) => setSelectedReport(report)}
      onCreateTodayOpname={() => setIsAdminCreatingOpname(true)}
    />
  );
};

// Test cashier stock opname permission
const fs = require('fs');
const path = require('path');

console.log('--- TESTING CASHIER STOCK OPNAME PERMISSION & ACCESS ---');

// Read AuthController.jsx
const authControllerCode = fs.readFileSync(
  path.join(__dirname, '../src/controllers/AuthController.jsx'),
  'utf8'
);

// Verify hasPermission definition in AuthController
if (!authControllerCode.includes("if (featureKey === 'stock-opname') {\n      return true;\n    }")) {
  console.error('FAIL: AuthController does not have unconditional stock-opname return true');
  process.exit(1);
}
console.log('PASS: AuthController hasPermission unconditionally returns true for stock-opname');

// Simulate AuthController hasPermission
const simulateHasPermission = (currentUser, featureKey) => {
  if (!currentUser) return false;
  if (currentUser.role === 'superadmin') return true;
  if (featureKey === 'cashier-management') return false;

  if (featureKey === 'reports') {
    const perms = currentUser.permissions || [];
    return perms.includes('reports-sales') || perms.includes('reports-materials');
  }

  // Stock Opname selalu dapat diakses oleh Kasir (tutup toko fisik harian kasir)
  if (featureKey === 'stock-opname') {
    return true;
  }

  const perms = currentUser.permissions || [];
  return perms.includes(featureKey);
};

// Case 1: Cashier with minimal permissions (e.g. only 'kasir')
const cashierUser1 = { id: 'c1', nama: 'Kasir Satu', role: 'kasir', permissions: ['kasir'] };
console.log('Case 1 - Cashier with [kasir] only:');
console.log('  hasPermission("stock-opname"):', simulateHasPermission(cashierUser1, 'stock-opname'));
if (simulateHasPermission(cashierUser1, 'stock-opname') !== true) {
  console.error('FAIL: Cashier with [kasir] only should have stock-opname permission');
  process.exit(1);
}

// Case 2: Cashier with empty permissions []
const cashierUser2 = { id: 'c2', nama: 'Kasir Dua', role: 'kasir', permissions: [] };
console.log('Case 2 - Cashier with empty permissions []:');
console.log('  hasPermission("stock-opname"):', simulateHasPermission(cashierUser2, 'stock-opname'));
if (simulateHasPermission(cashierUser2, 'stock-opname') !== true) {
  console.error('FAIL: Cashier with empty permissions should have stock-opname permission');
  process.exit(1);
}

// Case 3: Super Admin
const superAdminUser = { id: 'sa', nama: 'Super Admin', role: 'superadmin' };
console.log('Case 3 - Super Admin:');
console.log('  hasPermission("stock-opname"):', simulateHasPermission(superAdminUser, 'stock-opname'));
if (simulateHasPermission(superAdminUser, 'stock-opname') !== true) {
  console.error('FAIL: Super Admin should have stock-opname permission');
  process.exit(1);
}

// Case 4: Sidebar check for inventory group
const hasInventory1 = simulateHasPermission(cashierUser1, 'raw-material') || simulateHasPermission(cashierUser1, 'stock-opname');
console.log('Sidebar hasInventory for cashierUser1:', hasInventory1);
if (!hasInventory1) {
  console.error('FAIL: Sidebar hasInventory should be true for cashier');
  process.exit(1);
}

// Case 5: CashierFormModal default permissions
const cashierModalCode = fs.readFileSync(
  path.join(__dirname, '../src/views/cashier/CashierFormModal.jsx'),
  'utf8'
);
if (!cashierModalCode.includes("['kasir', 'raw-material', 'stock-opname', 'returns']")) {
  console.error('FAIL: CashierFormModal does not include stock-opname in defaults');
  process.exit(1);
}
console.log('PASS: CashierFormModal includes stock-opname in default permissions');

console.log('ALL TESTS PASSED SUCCESSFULLY!');

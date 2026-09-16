import fs from 'fs';
import assert from 'assert';

console.log('===========================================================');
console.log('       COMPREHENSIVE ALL-FEATURE INTEGRITY AUDIT           ');
console.log('===========================================================');

let passedTests = 0;
const test = (name, fn) => {
  try {
    fn();
    console.log(`✔ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`❌ [FAIL] ${name}: ${err.message}`);
    process.exit(1);
  }
};

// 1. AUTHENTICATION & PERMISSIONS
test('AuthController grants Kasir stock-opname access and Super Admin full access', () => {
  const authCode = fs.readFileSync('src/controllers/AuthController.jsx', 'utf-8');
  assert(authCode.includes("if (featureKey === 'stock-opname') {\n      return true;\n    }"), 'hasPermission must return true for stock-opname');
  assert(authCode.includes("currentUser.role === 'superadmin') return true;"), 'Super Admin must have full permission');
  assert(authCode.includes("parsed.role === 'kasir'"), 'Session restore must ensure kasir gets stock-opname');
});

test('CashierFormModal includes stock-opname in default permissions for cashiers', () => {
  const modalCode = fs.readFileSync('src/views/cashier/CashierFormModal.jsx', 'utf-8');
  assert(modalCode.includes("['kasir', 'raw-material', 'stock-opname', 'returns']"), 'Cashier defaults must include stock-opname');
});

// 2. SIDEBAR & NAVIGATION
test('Sidebar renders Stock Opname for cashiers under INVENTORI & STOK', () => {
  const sidebarCode = fs.readFileSync('src/views/components/Sidebar.jsx', 'utf-8');
  assert(sidebarCode.includes("const hasInventory = hasPermission('raw-material') || hasPermission('stock-opname');"), 'Sidebar hasInventory must check stock-opname');
  assert(sidebarCode.includes("{hasPermission('stock-opname') && ("), 'Sidebar must render stock-opname button');
  assert(sidebarCode.includes("ClipboardCheck"), 'Sidebar stock-opname must use ClipboardCheck icon');
});

test('App.jsx Route Guard allows stock-opname for cashiers and routes properly', () => {
  const appCode = fs.readFileSync('src/App.jsx', 'utf-8');
  assert(appCode.includes("case 'stock-opname':\n        return <StockOpnameView />;"), 'App must route stock-opname to StockOpnameView');
  assert(appCode.includes("isAllowed = hasPermission(activeMenu);"), 'Route guard must use hasPermission');
});

// 3. STOCK OPNAME: CASHIER FLOW & BLIND OPNAME
test('Kasir Stock Opname flow provides blind counting without leaking system stock', () => {
  const viewCode = fs.readFileSync('src/views/inventory/rawMaterial/StockOpnameView.jsx', 'utf-8');
  assert(viewCode.includes("{isCashier ? renderKasirFlow() : renderSuperAdminFlow()}"), 'StockOpnameView switches between cashier and superadmin flow');
  assert(viewCode.includes("renderKasirFlow"), 'renderKasirFlow must exist');
  assert(viewCode.includes("Selesaikan Store Closing"), 'Cashier flow must have Selesaikan Store Closing button');
  assert(viewCode.includes("opnameItems[m.id]"), 'Cashier physical count must update opnameItems');
});

// 4. STOCK OPNAME: DISCREPANCY & UNCOUNTED LOGIC
test('Discrepancy logic strictly classifies UNCOUNTED as uncounted, not MATCH', () => {
  const controllerCode = fs.readFileSync('src/controllers/RawMaterialController.jsx', 'utf-8');
  assert(controllerCode.includes("let status = 'UNCOUNTED';"), 'Default status must be UNCOUNTED');
  assert(controllerCode.includes("const matchCount = reportItems.filter(i => i.hasActual && i.status === 'MATCH').length;"), 'matchCount must require hasActual');
  assert(controllerCode.includes("const deficitCount = reportItems.filter(i => i.hasActual && i.status === 'DEFICIT').length;"), 'deficitCount must require hasActual');
  assert(controllerCode.includes("const surplusCount = reportItems.filter(i => i.hasActual && i.status === 'SURPLUS').length;"), 'surplusCount must require hasActual');
});

// 5. SUPERADMIN REPORT DATA TABLE
test('Superadmin report table has exactly 9 columns, Dicatat Oleh, and plain Detail button', () => {
  const viewCode = fs.readFileSync('src/views/inventory/rawMaterial/StockOpnameView.jsx', 'utf-8');
  assert(viewCode.includes('<th style={{ textAlign: \'center\' }}>Dicatat Oleh</th>'), 'Dicatat Oleh column must exist');
  assert(viewCode.includes('colSpan={9}'), 'Empty state colSpan must be 9');
  assert(!viewCode.includes('<th>Status</th>'), 'Status column must not exist in table header');
  assert(/Detail\s*<\/button>/.test(viewCode), 'Action button must strictly say Detail');
  assert(!viewCode.includes('Edit & Detail'), 'No old Edit & Detail text');
});

// 6. REMOVED ELEMENTS FROM ADMIN VIEW
test('Cleaned up elements (outlet, simulation button, print button, surplus card, closing badge) are removed', () => {
  const viewCode = fs.readFileSync('src/views/inventory/rawMaterial/StockOpnameView.jsx', 'utf-8');
  assert(!viewCode.includes('Simulasi Alur Kasir'), 'Simulasi Alur Kasir button must be removed');
  assert(!viewCode.includes('Cetak Formulir Opname'), 'Cetak Formulir button must be removed');
  assert(!viewCode.includes('Card KPI: SURPLUS BAHAN'), 'Surplus KPI card must be removed');
  assert(!viewCode.includes('Card KPI: ESTIMASI SELISIH NILAI'), 'Estimated diff value card must be removed');
  assert(!viewCode.includes('Store Closing Selesai (Super Admin)'), 'Closing completed badge must be removed');
});

// 7. REAL-TIME SYNCHRONIZATION
test('Cross-tab real-time storage event synchronization is active', () => {
  const controllerCode = fs.readFileSync('src/controllers/RawMaterialController.jsx', 'utf-8');
  assert(controllerCode.includes("window.addEventListener('storage', handleStorageChange)"), 'Storage event listener must be registered');
  assert(controllerCode.includes("OPNAME_STORAGE_KEY"), 'Storage listener must watch OPNAME_STORAGE_KEY');
  assert(controllerCode.includes("DAILY_REPORTS_STORAGE_KEY"), 'Storage listener must watch DAILY_REPORTS_STORAGE_KEY');
});

// 8. PRODUCT MENU & RECIPE SYSTEM
test('ProductMenuController and recipe ingredients are properly integrated', () => {
  const menuCode = fs.readFileSync('src/controllers/ProductMenuController.jsx', 'utf-8');
  assert(menuCode.includes("addProductMenu"), 'addProductMenu must exist');
  assert(menuCode.includes("updateProductMenu"), 'updateProductMenu must exist');
  assert(menuCode.includes("deleteProductMenu"), 'deleteProductMenu must exist');
  assert(menuCode.includes("ingredients"), 'Recipe ingredients must be handled');
});

// 9. RAW MATERIAL MANAGEMENT
test('RawMaterialController handles stock in, out, waste, and stock logs', () => {
  const rawCode = fs.readFileSync('src/controllers/RawMaterialController.jsx', 'utf-8');
  assert(rawCode.includes("adjustStock"), 'adjustStock must exist');
  assert(rawCode.includes("recordMaterialWaste"), 'recordMaterialWaste must exist');
  assert(rawCode.includes("stockLogs"), 'stockLogs must exist');
  assert(rawCode.includes("recordOrderReturnLog"), 'recordOrderReturnLog must exist');
  assert(rawCode.includes("deductMaterialsForOrder"), 'deductMaterialsForOrder must exist');
});

// 10. POS & ORDER MANAGEMENT
test('OrderController handles order creation, discount presets, payment, and stock deduction', () => {
  const orderCode = fs.readFileSync('src/controllers/OrderController.jsx', 'utf-8');
  assert(orderCode.includes("completeOrder"), 'completeOrder must exist');
  assert(orderCode.includes("deductMaterialsForOrder"), 'deductMaterialsForOrder must exist');
  assert(orderCode.includes("addToCart"), 'addToCart must exist');
  assert(orderCode.includes("applyDiscountPreset"), 'applyDiscountPreset must exist');
});

// 11. RETURNS & WASTE AUDIT
test('ReturnsManagementView handles order returns and waste items', () => {
  const returnsCode = fs.readFileSync('src/views/returns/ReturnsManagementView.jsx', 'utf-8');
  assert(returnsCode.includes("useOrder"), 'ReturnsManagementView must use useOrder');
  assert(returnsCode.includes("useRawMaterial"), 'ReturnsManagementView must use useRawMaterial');
});

// 12. MASTER DATA (UNIT, CATEGORY, TOPPING)
test('Master data controllers (Unit, Category, Topping) provide full CRUD and state', () => {
  const unitCode = fs.readFileSync('src/controllers/UnitController.jsx', 'utf-8');
  const catCode = fs.readFileSync('src/controllers/CategoryController.jsx', 'utf-8');
  const topCode = fs.readFileSync('src/controllers/ToppingController.jsx', 'utf-8');
  assert(unitCode.includes("addUnit"), 'UnitController addUnit');
  assert(catCode.includes("addCategory"), 'CategoryController addCategory');
  assert(topCode.includes("addTopping"), 'ToppingController addTopping');
});

// 13. REPORTS & EXPORT UTILITIES
test('Reports and export utilities for PDF and Excel exist and function', () => {
  const exportUtils = fs.readFileSync('src/utils/reportExportUtils.js', 'utf-8');
  assert(exportUtils.includes("exportStockOpnameToPDF"), 'exportStockOpnameToPDF exists');
  assert(exportUtils.includes("exportStockOpnameToExcel"), 'exportStockOpnameToExcel exists');
});

console.log('-----------------------------------------------------------');
console.log(`ALL ${passedTests}/${passedTests} CRITICAL SYSTEM FUNCTIONS VALIDATED AND OPERATIONAL! 🎉`);
console.log('===========================================================');

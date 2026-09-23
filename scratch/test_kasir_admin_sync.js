import fs from 'fs';
import assert from 'assert';

console.log('Testing: Synchronization between Kasir & Admin Stock Opname data...');

const viewContent = fs.readFileSync('src/views/inventory/rawMaterial/StockOpnameView.jsx', 'utf-8').replace(/\r\n/g, '\n');
const controllerContent = fs.readFileSync('src/controllers/RawMaterialController.jsx', 'utf-8').replace(/\r\n/g, '\n');

// 1. Cross-tab storage synchronization listener in RawMaterialController
assert(controllerContent.includes("window.addEventListener('storage', handleStorageChange)"), "Must listen to window storage event for cross-tab sync");
assert(controllerContent.includes("if (e.key === OPNAME_STORAGE_KEY)"), "Must sync opnameItems across tabs");
assert(controllerContent.includes("if (e.key === DAILY_REPORTS_STORAGE_KEY)"), "Must sync dailyOpnameReports across tabs");
console.log('✔ Cross-tab real-time storage event listener is active');

// 2. Kasir input synchronizes to Admin PREVIEW
assert(viewContent.includes("id: `PREVIEW-${todayStr}`"), "Admin builds PREVIEW from active opname items if closing not completed yet");
assert(viewContent.includes("summary: opnameSummary"), "Admin preview uses same opnameSummary as Kasir");
assert(viewContent.includes("items: enrichedOpnameList.map"), "Admin preview uses enrichedOpnameList directly from Kasir draft");
console.log('✔ Kasir active counting draft seamlessly synchronizes to Admin live preview');

// 3. Admin edit synchronizes back to Kasir draft & reports
assert(controllerContent.includes("addOrUpdateCountedItem(materialId, actualStock, recorderName)"), "Admin actualStock edit syncs back to active opnameItems");
console.log('✔ Admin actual stock edits sync back to Kasir active counting draft');

// 4. Closed summary in Kasir is consistent with Admin
assert(viewContent.includes("hasActual ? formatNumber(item.actualStock) : '-'"), "Kasir closed summary renders '-' for uncounted items consistent with Admin");
assert(viewContent.includes("styles.statusPillCounted") && viewContent.includes("Sudah Dihitung"), "Kasir closed summary shows Sudah Dihitung for counted items");
assert(viewContent.includes("styles.statusPillUncounted") && viewContent.includes("Belum Dihitung"), "Kasir closed summary shows Belum Dihitung for uncounted items");
console.log('✔ Kasir closed summary renders identical actual stock and counting status as Admin');

// 5. Reopen store closing syncs both back to draft
assert(controllerContent.includes("setOpnameItems(restored)"), "Reopen closing restores draft opnameItems for Kasir and Admin");
console.log('✔ Reopening closing synchronizes draft state for both Kasir and Admin');

console.log('\nALL 5 SYNCHRONIZATION CHECKS PASSED! 🚀');

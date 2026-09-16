import fs from 'fs';
import assert from 'assert';

console.log('Testing: Data can ONLY be MATCH/DEFICIT/SURPLUS when counted (hasActual = true)...');

const viewContent = fs.readFileSync('src/views/inventory/rawMaterial/StockOpnameView.jsx', 'utf-8');
const controllerContent = fs.readFileSync('src/controllers/RawMaterialController.jsx', 'utf-8');

// 1. Controller: completeStoreClosing must default uncounted items to UNCOUNTED, not MATCH
assert(controllerContent.includes("let status = 'UNCOUNTED';"), "completeStoreClosing must initialize status to UNCOUNTED");
assert(!controllerContent.includes("let status = 'MATCH';\n      if (hasActual)"), "completeStoreClosing must not default status to MATCH when uncounted");
console.log('✔ completeStoreClosing initializes status to UNCOUNTED');

// 2. Controller: matchCount, deficitCount, surplusCount must require item.hasActual
assert(controllerContent.includes("const matchCount = reportItems.filter(i => i.hasActual && i.status === 'MATCH').length;"), "matchCount in completeStoreClosing must require i.hasActual");
assert(controllerContent.includes("const deficitCount = reportItems.filter(i => i.hasActual && i.status === 'DEFICIT').length;"), "deficitCount in completeStoreClosing must require i.hasActual");
assert(controllerContent.includes("const surplusCount = reportItems.filter(i => i.hasActual && i.status === 'SURPLUS').length;"), "surplusCount in completeStoreClosing must require i.hasActual");
console.log('✔ completeStoreClosing only counts items into match/deficit/surplus if i.hasActual is true');

// 3. Controller: updateAdminOpnameItem must also initialize status to UNCOUNTED
assert(controllerContent.includes("const matchCount = updatedItems.filter(i => i.hasActual && i.status === 'MATCH').length;"), "updateAdminOpnameItem matchCount must require i.hasActual");
console.log('✔ updateAdminOpnameItem correctly guards counts with i.hasActual');

// 4. View: currentAdminReport sanitization
assert(viewContent.includes("let status = 'UNCOUNTED';"), "currentAdminReport must normalize items with status UNCOUNTED if not counted");
assert(viewContent.includes("const matchCount = sanitizedItems.filter(i => i.hasActual && i.status === 'MATCH').length;"), "Sanitized matchCount must require i.hasActual");
console.log('✔ currentAdminReport normalizes existing/cached data to ensure uncounted items are not MATCH');

// 5. View: filteredAdminItems
assert(viewContent.includes("items.filter(i => i.hasActual && i.status === 'MATCH')"), "MATCH filter must require i.hasActual");
assert(viewContent.includes("items.filter(i => i.hasActual && (i.status === 'DEFICIT' || i.status === 'SURPLUS'))"), "DISCREPANCY filter must require i.hasActual");
assert(viewContent.includes("items.filter(i => !i.hasActual)"), "UNCOUNTED filter must filter !i.hasActual");
console.log('✔ Table filter tabs strictly distinguish counted vs uncounted');

// 6. View: Row rendering booleans
assert(viewContent.includes("const isMatch = Boolean(item.hasActual && item.status === 'MATCH');"), "Row isMatch must require item.hasActual");
assert(viewContent.includes("const isDeficit = Boolean(item.hasActual && item.status === 'DEFICIT');"), "Row isDeficit must require item.hasActual");
assert(viewContent.includes("const isSurplus = Boolean(item.hasActual && item.status === 'SURPLUS');"), "Row isSurplus must require item.hasActual");
console.log('✔ Row rendering booleans are strictly false for uncounted items');

// 7. View: Belum Dihitung quick filter tab is present
assert(viewContent.includes("Belum Dihitung ({currentAdminReport?.summary?.uncountedCount || 0})"), "Quick filter tab for Belum Dihitung is present");
console.log('✔ Quick filter tab for Belum Dihitung is rendered when uncounted items exist');

console.log('\nALL 7 VERIFICATION CHECKS PASSED! 🎯');

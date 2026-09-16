import fs from 'fs';
import assert from 'assert';

console.log('Testing: Store Closing Selesai badge removed from Superadmin view...');

const viewContent = fs.readFileSync('src/views/inventory/rawMaterial/StockOpnameView.jsx', 'utf-8');
const superAdminSection = viewContent.split('renderSuperAdminFlow = () =>')[1].split('return (')[0];

assert(!superAdminSection.includes('Store Closing Selesai ('), 'Store Closing Selesai (closedBy) badge must be removed from superadmin flow');
assert(!superAdminSection.includes('Sedang Berjalan (Draft Belum Closing)'), 'Draft Belum Closing badge must be removed from superadmin flow');
console.log('✔ Store Closing status indicator badge successfully removed from Superadmin view');

console.log('\nALL CHECKS PASSED! 🎉');

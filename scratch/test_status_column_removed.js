import fs from 'fs';
import assert from 'assert';

console.log('Testing: Status column removed from Superadmin report data table...');

const viewContent = fs.readFileSync('src/views/inventory/rawMaterial/StockOpnameView.jsx', 'utf-8');

const superAdminSection = viewContent.split('renderSuperAdminFlow = () =>')[1].split('return (')[0];

// 1. Table header should NOT contain Status column in Superadmin table
assert(!superAdminSection.includes('<th style={{ textAlign: \'center\' }}>Status</th>'), 'Superadmin table header should NOT contain Status column');
console.log('✔ Status column is NOT in Superadmin table header');

// 2. Table rows should NOT render status pills in Superadmin table
assert(!superAdminSection.includes('title="Sesuai dengan sisa sistem hasil penjualan menu ke customer"'), 'Superadmin table row should NOT render Sesuai pill');
console.log('✔ Status pills are NOT rendered in Superadmin table rows');

// 3. ColSpan must be 9
assert(viewContent.includes('colSpan={9}'), 'Empty state colSpan must be 9');
console.log('✔ Empty state colSpan is 9');

// 4. Action button still has purely text "Detail"
assert(viewContent.includes('>Detail</button>') || viewContent.includes('>\r\n                        Detail\r\n                      </button>') || viewContent.includes('>\n                        Detail\n                      </button>'), 'Action button must contain text Detail');
console.log('✔ Action button strictly contains text "Detail"');

console.log('\nALL CHECKS PASSED SUCCESSFULLY! 🎉');

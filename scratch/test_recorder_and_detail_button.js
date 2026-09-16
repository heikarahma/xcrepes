import fs from 'fs';
import assert from 'assert';

console.log('Testing: Dicatat Oleh & Button Detail tanpa icon in StockOpnameView.jsx...');

const viewContent = fs.readFileSync('src/views/inventory/rawMaterial/StockOpnameView.jsx', 'utf-8');
const controllerContent = fs.readFileSync('src/controllers/RawMaterialController.jsx', 'utf-8');

// 1. Check Table Header for Dicatat Oleh
assert(viewContent.includes('<th style={{ textAlign: \'center\' }}>Dicatat Oleh</th>'), 'Header must include Dicatat Oleh column');
console.log('✔ Table Header has "Dicatat Oleh" column');

// 2. Check Table Row for item.countedBy
assert(viewContent.includes('item.countedBy || currentAdminReport?.closedBy || \'Kasir\''), 'Row must display item.countedBy or closedBy fallback');
console.log('✔ Table Row displays recorder info (countedBy)');

// 3. Check Action Button: text must be "Detail" without Edit3 icon
assert(viewContent.includes('>Detail</button>') || viewContent.includes('>\r\n                        Detail\r\n                      </button>') || viewContent.includes('>\n                        Detail\n                      </button>'), 'Action button must contain text Detail');
assert(!viewContent.includes('<Edit3 size={12} style={{ marginRight: \'4px\', verticalAlign: \'text-bottom\' }} />'), 'Edit3 icon in action button must be removed');
console.log('✔ Action button strictly contains text "Detail" without any icon');

// 4. Verify no other "Edit & Detail" or "Edit &amp; Detail" in view
assert(!viewContent.includes('Edit &amp; Detail'), 'No "Edit &amp; Detail" should remain');
assert(!viewContent.includes('Edit & Detail'), 'No "Edit & Detail" should remain');
console.log('✔ No old "Edit & Detail" text remaining');

// 5. Verify Modal Detail Card contains Dicatat Oleh
assert(viewContent.includes('<span style={styles.detailLabel}>Dicatat Oleh:</span>'), 'Detail modal card must include Dicatat Oleh');
console.log('✔ Modal Detail card includes "Dicatat Oleh" row');

// 6. Verify table colSpan is 10 for empty state
assert(viewContent.includes('colSpan={10}'), 'Empty state colSpan must be 10');
console.log('✔ Empty state colSpan is 10');

// 7. Verify RawMaterialController has countedBy tracking
assert(controllerContent.includes('countedBy: hasActual ? (entry?.countedBy || closedBy || \'Kasir\') : \'-\''), 'completeStoreClosing preserves countedBy');
assert(controllerContent.includes('countedBy: hasActualStockInput ? recorderName : (item.countedBy || report.closedBy || \'Kasir\')'), 'updateAdminOpnameItem updates countedBy');
console.log('✔ Controller correctly tracks and saves countedBy');

console.log('\nALL CHECKS PASSED SUCCESSFULLY! 🎉');

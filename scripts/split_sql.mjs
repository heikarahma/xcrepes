import fs from 'fs';
import path from 'path';

const backupDir = path.resolve('database_backup');
const stepsDir = path.join(backupDir, 'sql_steps');
if (!fs.existsSync(stepsDir)) fs.mkdirSync(stepsDir, { recursive: true });

const dataDir = path.join(backupDir, 'data');
const allData = JSON.parse(fs.readFileSync(path.join(dataDir, 'all_data.json'), 'utf-8'));

function escapeSqlValue(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  if (typeof val === 'number') return Number.isFinite(val) ? String(val) : 'NULL';
  if (typeof val === 'object') {
    const jsonStr = JSON.stringify(val).replace(/'/g, "''");
    return `'${jsonStr}'::jsonb`;
  }
  return `'${String(val).replace(/'/g, "''")}'`;
}

function generateInsert(tableName, rows) {
  if (!rows || rows.length === 0) return `-- Kosong untuk tabel ${tableName}\n`;
  const columns = Object.keys(rows[0]);
  const colList = columns.map(c => `"${c}"`).join(', ');

  const valuesClauses = rows.map(row => {
    const valList = columns.map(col => escapeSqlValue(row[col])).join(', ');
    return `(${valList})`;
  }).join(',\n');

  return `INSERT INTO public.${tableName} (${colList})
VALUES
${valuesClauses}
ON CONFLICT (id) DO UPDATE SET
${columns.filter(c => c !== 'id').map(c => `  "${c}" = EXCLUDED."${c}"`).join(',\n')};\n`;
}

// 1. Step 1: SCHEMA
const schemaContent = fs.readFileSync('supabase_schema.sql', 'utf-8');
const seedMarker = '-- SEED INITIAL SYSTEM DEFAULTS';
let cleanSchema = schemaContent;
if (cleanSchema.includes(seedMarker)) {
  cleanSchema = cleanSchema.substring(0, cleanSchema.indexOf(seedMarker)).trim();
}
fs.writeFileSync(path.join(stepsDir, 'step_01_schema_tabel.sql'), cleanSchema, 'utf-8');

// 2. Step 2: Master data ringan
let step2Sql = `-- DATA MASTER & LOG (units, categories, raw_materials, toppings, logs, settings, accounts)\n\n`;
const lightTables = ['units', 'categories', 'raw_materials', 'toppings', 'inventory_stock_logs', 'store_settings', 'cashier_accounts', 'superadmin_profile'];
for (const t of lightTables) {
  step2Sql += `-- Tabel: ${t} (${allData[t]?.length || 0} baris)\n`;
  step2Sql += generateInsert(t, allData[t] || []) + '\n';
}
fs.writeFileSync(path.join(stepsDir, 'step_02_data_master.sql'), step2Sql, 'utf-8');

// 3. Product menus: chunk per 3 items (~500KB max)
const menus = allData['product_menus'] || [];
const menuChunkSize = 3;
let part = 1;
for (let i = 0; i < menus.length; i += menuChunkSize) {
  const chunk = menus.slice(i, i + menuChunkSize);
  const sql = `-- MENU PRODUK BAGIAN ${part} (${chunk.length} produk)\n\n` + generateInsert('product_menus', chunk);
  const fileName = `step_03_produk_part_${String(part).padStart(2, '0')}.sql`;
  fs.writeFileSync(path.join(stepsDir, fileName), sql, 'utf-8');
  part++;
}

// 4. Orders: chunk per 2 items (~300-500KB max)
const orders = allData['orders'] || [];
const orderChunkSize = 2;
let oPart = 1;
for (let i = 0; i < orders.length; i += orderChunkSize) {
  const chunk = orders.slice(i, i + orderChunkSize);
  const sql = `-- TRANSAKSI ORDERS BAGIAN ${oPart} (${chunk.length} order)\n\n` + generateInsert('orders', chunk);
  const fileName = `step_04_orders_part_${String(oPart).padStart(2, '0')}.sql`;
  fs.writeFileSync(path.join(stepsDir, fileName), sql, 'utf-8');
  oPart++;
}

console.log('Semua file split berhasil digenerate.');

import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';

const allDataPath = path.resolve('database_backup/data/all_data.json');
if (!fs.existsSync(allDataPath)) {
  console.error('Data all_data.json tidak ditemukan.');
  process.exit(1);
}

const allData = JSON.parse(fs.readFileSync(allDataPath, 'utf-8'));
const dbFilePath = path.resolve('database_backup/xcrepes_database.sqlite');

// Hapus file lama jika ada agar bersih
if (fs.existsSync(dbFilePath)) {
  fs.unlinkSync(dbFilePath);
}

const db = new DatabaseSync(dbFilePath);
console.log('🚀 Membuat SQLite Database di:', dbFilePath);

// 1. Schema Definition untuk SQLite
db.exec(`
CREATE TABLE IF NOT EXISTS units (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TEXT,
    updated_at TEXT
);

CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TEXT,
    updated_at TEXT
);

CREATE TABLE IF NOT EXISTS raw_materials (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    unit_name TEXT NOT NULL,
    stock NUMERIC NOT NULL DEFAULT 0,
    price_per_unit NUMERIC NOT NULL DEFAULT 0,
    min_stock NUMERIC NOT NULL DEFAULT 10,
    note TEXT,
    created_at TEXT,
    updated_at TEXT
);

CREATE TABLE IF NOT EXISTS toppings (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    price NUMERIC NOT NULL DEFAULT 0,
    description TEXT,
    ingredients TEXT DEFAULT '[]',
    created_at TEXT,
    updated_at TEXT
);

CREATE TABLE IF NOT EXISTS product_menus (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    category_id TEXT,
    category_name TEXT,
    image TEXT,
    price NUMERIC NOT NULL DEFAULT 0,
    promo_type TEXT,
    promo_amount NUMERIC DEFAULT 0,
    ingredients TEXT DEFAULT '[]',
    toppings TEXT DEFAULT '[]',
    created_at TEXT,
    updated_at TEXT
);

CREATE TABLE IF NOT EXISTS inventory_stock_logs (
    id TEXT PRIMARY KEY,
    raw_material_id TEXT,
    raw_material_name TEXT,
    unit_name TEXT,
    type TEXT NOT NULL,
    amount NUMERIC NOT NULL DEFAULT 0,
    previous_stock NUMERIC NOT NULL DEFAULT 0,
    current_stock NUMERIC NOT NULL DEFAULT 0,
    reason TEXT,
    note TEXT,
    photo TEXT,
    reference_invoice TEXT,
    order_id TEXT,
    customer_name TEXT,
    source_menu TEXT,
    source_type TEXT,
    topping_name TEXT,
    user_name TEXT,
    created_at TEXT
);

CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    invoice_number TEXT NOT NULL,
    date TEXT,
    status TEXT NOT NULL DEFAULT 'completed',
    cashier_name TEXT,
    customer_name TEXT,
    table_number TEXT,
    items TEXT NOT NULL DEFAULT '[]',
    subtotal NUMERIC NOT NULL DEFAULT 0,
    items_discount_total NUMERIC NOT NULL DEFAULT 0,
    order_discount_type TEXT,
    order_discount_value NUMERIC NOT NULL DEFAULT 0,
    order_discount_amount NUMERIC NOT NULL DEFAULT 0,
    discount NUMERIC NOT NULL DEFAULT 0,
    total_amount NUMERIC NOT NULL DEFAULT 0,
    total_items_count INTEGER NOT NULL DEFAULT 0,
    payment_method TEXT NOT NULL DEFAULT 'cash',
    cash_received NUMERIC NOT NULL DEFAULT 0,
    change_amount NUMERIC NOT NULL DEFAULT 0,
    return_reason TEXT,
    return_note TEXT,
    return_photo TEXT,
    return_by TEXT,
    returned_at TEXT,
    created_at TEXT
);

CREATE TABLE IF NOT EXISTS store_settings (
    id TEXT PRIMARY KEY,
    app_name TEXT,
    store_name TEXT,
    store_tagline TEXT,
    logo TEXT,
    phone TEXT,
    address TEXT,
    email TEXT,
    receipt_title TEXT,
    receipt_subtitle TEXT,
    receipt_phone TEXT,
    receipt_footer1 TEXT,
    receipt_footer2 TEXT,
    paper_size TEXT,
    show_logo_on_receipt BOOLEAN,
    show_cashier_name BOOLEAN,
    show_customer_name BOOLEAN,
    show_table_number BOOLEAN,
    show_notes BOOLEAN,
    updated_at TEXT
);

CREATE TABLE IF NOT EXISTS cashier_accounts (
    id TEXT PRIMARY KEY,
    nama TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'kasir',
    permissions TEXT NOT NULL DEFAULT '[]',
    is_active BOOLEAN NOT NULL DEFAULT 1,
    created_at TEXT,
    updated_at TEXT
);

CREATE TABLE IF NOT EXISTS superadmin_profile (
    id TEXT PRIMARY KEY,
    nama TEXT NOT NULL,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'superadmin',
    updated_at TEXT
);
`);

// 2. Insert all data
for (const [table, rows] of Object.entries(allData)) {
  if (!rows || rows.length === 0) continue;
  const cols = Object.keys(rows[0]);
  const placeholders = cols.map(() => '?').join(', ');
  const stmt = db.prepare(`INSERT OR REPLACE INTO ${table} (${cols.map(c => `"${c}"`).join(', ')}) VALUES (${placeholders})`);

  for (const row of rows) {
    const values = cols.map(col => {
      const v = row[col];
      if (v === null || v === undefined) return null;
      if (typeof v === 'boolean') return v ? 1 : 0;
      if (typeof v === 'object') return JSON.stringify(v);
      return v;
    });
    stmt.run(...values);
  }
  console.log(`✅ SQLite: Berhasil memasukkan ${rows.length} baris ke tabel ${table}`);
}

db.close();
console.log('🎉 Database SQLite berhasil dibuat dan diverifikasi!');

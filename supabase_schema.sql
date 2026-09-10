-- ==============================================================================
-- SUPABASE POSTGRESQL SCHEMA FOR XCREPES POS
-- Multi-device POS System Database Schema
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. MASTER SATUAN UKUR (units)
CREATE TABLE IF NOT EXISTS units (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. MASTER KATEGORI MENU (categories)
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MASTER BAHAN BAKU (raw_materials)
CREATE TABLE IF NOT EXISTS raw_materials (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    unit_name TEXT NOT NULL,
    stock NUMERIC NOT NULL DEFAULT 0,
    price_per_unit NUMERIC NOT NULL DEFAULT 0,
    min_stock NUMERIC NOT NULL DEFAULT 10,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. MASTER TOPPING (toppings)
CREATE TABLE IF NOT EXISTS toppings (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    price NUMERIC NOT NULL DEFAULT 0,
    description TEXT,
    ingredients JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. MASTER MENU PRODUK (product_menus)
CREATE TABLE IF NOT EXISTS product_menus (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    category_id TEXT,
    category_name TEXT,
    image TEXT,
    price NUMERIC NOT NULL DEFAULT 0,
    promo_type TEXT,
    promo_amount NUMERIC DEFAULT 0,
    ingredients JSONB DEFAULT '[]'::JSONB,
    toppings JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. AUDIT LOG MUTASI STOK INVENTORI (inventory_stock_logs)
CREATE TABLE IF NOT EXISTS inventory_stock_logs (
    id TEXT PRIMARY KEY,
    raw_material_id TEXT,
    raw_material_name TEXT,
    unit_name TEXT,
    type TEXT NOT NULL, -- 'IN', 'OUT', 'ADJUST', 'WASTE', 'RETURN_ORDER'
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
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TRANSAKSI PENJUALAN KASIR (orders)
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    invoice_number TEXT NOT NULL,
    date TIMESTAMPTZ DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'completed', -- 'completed' | 'returned'
    cashier_name TEXT,
    customer_name TEXT,
    table_number TEXT,
    items JSONB NOT NULL DEFAULT '[]'::JSONB,
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
    returned_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. PENGATURAN TOKO & STRUK (store_settings)
CREATE TABLE IF NOT EXISTS store_settings (
    id TEXT PRIMARY KEY DEFAULT 'store_default',
    app_name TEXT DEFAULT 'XCrepes POS',
    store_name TEXT DEFAULT 'XCrepes',
    store_tagline TEXT DEFAULT 'Good Food Good Mood',
    logo TEXT,
    phone TEXT,
    address TEXT,
    email TEXT,
    receipt_title TEXT DEFAULT 'XCrepes',
    receipt_subtitle TEXT,
    receipt_phone TEXT,
    receipt_footer1 TEXT DEFAULT 'Terima Kasih Atas Kunjungan Anda',
    receipt_footer2 TEXT,
    paper_size TEXT DEFAULT '58mm',
    show_logo_on_receipt BOOLEAN DEFAULT false,
    show_cashier_name BOOLEAN DEFAULT true,
    show_customer_name BOOLEAN DEFAULT true,
    show_table_number BOOLEAN DEFAULT true,
    show_notes BOOLEAN DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. AKUN KASIR (cashier_accounts)
CREATE TABLE IF NOT EXISTS cashier_accounts (
    id TEXT PRIMARY KEY,
    nama TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'kasir',
    permissions JSONB NOT NULL DEFAULT '[]'::JSONB,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. PROFIL SUPER ADMIN (superadmin_profile)
CREATE TABLE IF NOT EXISTS superadmin_profile (
    id TEXT PRIMARY KEY DEFAULT 'usr_superadmin',
    nama TEXT NOT NULL DEFAULT 'Super Admin',
    username TEXT NOT NULL DEFAULT 'superadmin',
    password TEXT NOT NULL DEFAULT 'superadminxcrepes123*',
    role TEXT NOT NULL DEFAULT 'superadmin',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR HIGH-PERFORMANCE SEARCH & SORTING
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_raw_materials_name ON raw_materials(name);
CREATE INDEX IF NOT EXISTS idx_product_menus_name ON product_menus(name);
CREATE INDEX IF NOT EXISTS idx_product_menus_cat ON product_menus(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(date DESC);
CREATE INDEX IF NOT EXISTS idx_orders_invoice ON orders(invoice_number);
CREATE INDEX IF NOT EXISTS idx_stock_logs_date ON inventory_stock_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stock_logs_mat ON inventory_stock_logs(raw_material_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Buka akses full bagi anon/authenticated untuk client-side POS
-- ==============================================================================
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE toppings ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_stock_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE cashier_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE superadmin_profile ENABLE ROW LEVEL SECURITY;

-- Allow all operations for public/anon in POS
DROP POLICY IF EXISTS "Enable all access for units" ON units;
CREATE POLICY "Enable all access for units" ON units FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for categories" ON categories;
CREATE POLICY "Enable all access for categories" ON categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for raw_materials" ON raw_materials;
CREATE POLICY "Enable all access for raw_materials" ON raw_materials FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for toppings" ON toppings;
CREATE POLICY "Enable all access for toppings" ON toppings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for product_menus" ON product_menus;
CREATE POLICY "Enable all access for product_menus" ON product_menus FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for inventory_stock_logs" ON inventory_stock_logs;
CREATE POLICY "Enable all access for inventory_stock_logs" ON inventory_stock_logs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for orders" ON orders;
CREATE POLICY "Enable all access for orders" ON orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for store_settings" ON store_settings;
CREATE POLICY "Enable all access for store_settings" ON store_settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for cashier_accounts" ON cashier_accounts;
CREATE POLICY "Enable all access for cashier_accounts" ON cashier_accounts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for superadmin_profile" ON superadmin_profile;
CREATE POLICY "Enable all access for superadmin_profile" ON superadmin_profile FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- REALTIME PUBLICATIONS
-- ==============================================================================
-- Publish tables to supabase_realtime channel for instantaneous multi-device updates
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE 
        units, 
        categories, 
        raw_materials, 
        toppings, 
        product_menus, 
        inventory_stock_logs, 
        orders, 
        store_settings, 
        cashier_accounts, 
        superadmin_profile;
    EXCEPTION WHEN duplicate_object THEN
      NULL; -- Tabel sudah ada di publication
    WHEN OTHERS THEN
      NULL;
    END;
  END IF;
END $$;

-- ==============================================================================
-- SEED INITIAL SYSTEM DEFAULTS (Super Admin & Default Store Settings)
-- ==============================================================================
INSERT INTO superadmin_profile (id, nama, username, password, role, updated_at)
VALUES ('usr_superadmin', 'Super Admin', 'superadmin', 'superadminxcrepes123*', 'superadmin', NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO store_settings (
    id, app_name, store_name, store_tagline, phone, address, email,
    receipt_title, receipt_footer1, paper_size, show_logo_on_receipt,
    show_cashier_name, show_customer_name, show_table_number, show_notes, updated_at
) VALUES (
    'store_default', 'XCrepes POS', 'XCrepes', 'Good Food Good Mood', '', '', '',
    'XCrepes', 'Terima Kasih Atas Kunjungan Anda', '58mm', false,
    true, true, true, true, NOW()
)
ON CONFLICT (id) DO NOTHING;

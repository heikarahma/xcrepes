-- Rollback semua entry yang masuk pada 14 Oktober 2026 waktu Indonesia (Asia/Jakarta).
--
-- Yang dilakukan:
-- 1. Backup baris yang akan diubah/dihapus ke schema rollback_backup.
-- 2. Kembalikan stok bahan ke posisi sebelum entry pertama tanggal 14 Oktober 2026.
-- 3. Hapus order, stock log, dan master data yang created_at/date-nya masuk 14 Oktober 2026.
--
-- Catatan penting:
-- - Script ini bisa menghapus data sungguhan. Jalankan preview_oct14_2026_entries.sql dulu.
-- - Revert update field selain stok hanya bisa dilakukan kalau ada backup historis sebelumnya.

BEGIN;

CREATE SCHEMA IF NOT EXISTS rollback_backup;

CREATE TEMP TABLE _rollback_window AS
SELECT
  TIMESTAMPTZ '2026-10-14 00:00:00+07' AS start_at,
  TIMESTAMPTZ '2026-10-15 00:00:00+07' AS end_at,
  'rollback_20261014_' || TO_CHAR(NOW(), 'YYYYMMDD_HH24MISS') AS run_id;

CREATE TEMP TABLE _new_raw_materials AS
SELECT rm.*
FROM public.raw_materials rm, _rollback_window w
WHERE rm.created_at >= w.start_at
  AND rm.created_at < w.end_at;

CREATE TEMP TABLE _new_store_branches AS
SELECT sb.*
FROM public.store_branches sb, _rollback_window w
WHERE sb.created_at >= w.start_at
  AND sb.created_at < w.end_at;

CREATE TEMP TABLE _first_stock_log AS
SELECT DISTINCT ON (l.branch_id, l.raw_material_id)
  l.branch_id,
  l.raw_material_id,
  l.raw_material_name,
  l.previous_stock,
  l.current_stock,
  l.created_at
FROM public.inventory_stock_logs l, _rollback_window w
WHERE l.created_at >= w.start_at
  AND l.created_at < w.end_at
  AND l.raw_material_id IS NOT NULL
  AND l.raw_material_id NOT IN (SELECT id FROM _new_raw_materials)
ORDER BY l.branch_id, l.raw_material_id, l.created_at ASC;

-- Backup tables. Re-running creates no duplicate table definitions; rows may be inserted again with a new backup_run_id.
CREATE TABLE IF NOT EXISTS rollback_backup.orders AS SELECT NULL::TEXT AS backup_run_id, NOW() AS backup_at, * FROM public.orders WHERE false;
CREATE TABLE IF NOT EXISTS rollback_backup.inventory_stock_logs AS SELECT NULL::TEXT AS backup_run_id, NOW() AS backup_at, * FROM public.inventory_stock_logs WHERE false;
CREATE TABLE IF NOT EXISTS rollback_backup.raw_materials AS SELECT NULL::TEXT AS backup_run_id, NOW() AS backup_at, * FROM public.raw_materials WHERE false;
CREATE TABLE IF NOT EXISTS rollback_backup.store_branch_stocks AS SELECT NULL::TEXT AS backup_run_id, NOW() AS backup_at, * FROM public.store_branch_stocks WHERE false;
CREATE TABLE IF NOT EXISTS rollback_backup.toppings AS SELECT NULL::TEXT AS backup_run_id, NOW() AS backup_at, * FROM public.toppings WHERE false;
CREATE TABLE IF NOT EXISTS rollback_backup.product_menus AS SELECT NULL::TEXT AS backup_run_id, NOW() AS backup_at, * FROM public.product_menus WHERE false;
CREATE TABLE IF NOT EXISTS rollback_backup.categories AS SELECT NULL::TEXT AS backup_run_id, NOW() AS backup_at, * FROM public.categories WHERE false;
CREATE TABLE IF NOT EXISTS rollback_backup.units AS SELECT NULL::TEXT AS backup_run_id, NOW() AS backup_at, * FROM public.units WHERE false;
CREATE TABLE IF NOT EXISTS rollback_backup.cashier_accounts AS SELECT NULL::TEXT AS backup_run_id, NOW() AS backup_at, * FROM public.cashier_accounts WHERE false;
CREATE TABLE IF NOT EXISTS rollback_backup.store_branches AS SELECT NULL::TEXT AS backup_run_id, NOW() AS backup_at, * FROM public.store_branches WHERE false;

-- Backup affected rows.
INSERT INTO rollback_backup.orders
SELECT w.run_id, NOW(), o.*
FROM public.orders o, _rollback_window w
WHERE (o.created_at >= w.start_at AND o.created_at < w.end_at)
   OR (o.date >= w.start_at AND o.date < w.end_at);

INSERT INTO rollback_backup.inventory_stock_logs
SELECT w.run_id, NOW(), l.*
FROM public.inventory_stock_logs l, _rollback_window w
WHERE l.created_at >= w.start_at
  AND l.created_at < w.end_at;

INSERT INTO rollback_backup.raw_materials
SELECT w.run_id, NOW(), rm.*
FROM public.raw_materials rm, _rollback_window w
WHERE rm.created_at >= w.start_at
  AND rm.created_at < w.end_at;

INSERT INTO rollback_backup.store_branch_stocks
SELECT DISTINCT w.run_id, NOW(), s.*
FROM public.store_branch_stocks s
CROSS JOIN _rollback_window w
LEFT JOIN _first_stock_log f
  ON f.branch_id = s.branch_id
 AND f.raw_material_id = s.raw_material_id
WHERE f.raw_material_id IS NOT NULL
   OR s.raw_material_id IN (SELECT id FROM _new_raw_materials)
   OR s.branch_id IN (SELECT id FROM _new_store_branches);

INSERT INTO rollback_backup.toppings
SELECT w.run_id, NOW(), t.*
FROM public.toppings t, _rollback_window w
WHERE t.created_at >= w.start_at
  AND t.created_at < w.end_at;

INSERT INTO rollback_backup.product_menus
SELECT w.run_id, NOW(), pm.*
FROM public.product_menus pm, _rollback_window w
WHERE pm.created_at >= w.start_at
  AND pm.created_at < w.end_at;

INSERT INTO rollback_backup.categories
SELECT w.run_id, NOW(), c.*
FROM public.categories c, _rollback_window w
WHERE c.created_at >= w.start_at
  AND c.created_at < w.end_at;

INSERT INTO rollback_backup.units
SELECT w.run_id, NOW(), u.*
FROM public.units u, _rollback_window w
WHERE u.created_at >= w.start_at
  AND u.created_at < w.end_at;

INSERT INTO rollback_backup.cashier_accounts
SELECT w.run_id, NOW(), ca.*
FROM public.cashier_accounts ca, _rollback_window w
WHERE ca.created_at >= w.start_at
  AND ca.created_at < w.end_at;

INSERT INTO rollback_backup.store_branches
SELECT w.run_id, NOW(), sb.*
FROM public.store_branches sb, _rollback_window w
WHERE sb.created_at >= w.start_at
  AND sb.created_at < w.end_at;

-- Restore stok bahan ke posisi sebelum entry pertama 14 Oktober 2026.
INSERT INTO public.store_branch_stocks (branch_id, raw_material_id, stock, updated_at)
SELECT branch_id, raw_material_id, previous_stock, NOW()
FROM _first_stock_log
ON CONFLICT (branch_id, raw_material_id)
DO UPDATE SET
  stock = EXCLUDED.stock,
  updated_at = EXCLUDED.updated_at;

UPDATE public.raw_materials rm
SET stock = f.previous_stock,
    updated_at = NOW()
FROM _first_stock_log f
WHERE rm.id = f.raw_material_id;

-- Delete entry tanggal 14 Oktober 2026.
DELETE FROM public.orders o
USING _rollback_window w
WHERE (o.created_at >= w.start_at AND o.created_at < w.end_at)
   OR (o.date >= w.start_at AND o.date < w.end_at);

DELETE FROM public.inventory_stock_logs l
USING _rollback_window w
WHERE l.created_at >= w.start_at
  AND l.created_at < w.end_at;

DELETE FROM public.store_branch_stocks s
WHERE s.raw_material_id IN (SELECT id FROM _new_raw_materials)
   OR s.branch_id IN (SELECT id FROM _new_store_branches);

DELETE FROM public.product_menus pm
USING _rollback_window w
WHERE pm.created_at >= w.start_at
  AND pm.created_at < w.end_at;

DELETE FROM public.toppings t
USING _rollback_window w
WHERE t.created_at >= w.start_at
  AND t.created_at < w.end_at;

DELETE FROM public.raw_materials rm
USING _rollback_window w
WHERE rm.created_at >= w.start_at
  AND rm.created_at < w.end_at;

DELETE FROM public.categories c
USING _rollback_window w
WHERE c.created_at >= w.start_at
  AND c.created_at < w.end_at;

DELETE FROM public.units u
USING _rollback_window w
WHERE u.created_at >= w.start_at
  AND u.created_at < w.end_at;

DELETE FROM public.cashier_accounts ca
USING _rollback_window w
WHERE ca.created_at >= w.start_at
  AND ca.created_at < w.end_at;

DELETE FROM public.store_branches sb
USING _rollback_window w
WHERE sb.created_at >= w.start_at
  AND sb.created_at < w.end_at;

-- Summary hasil setelah rollback.
SELECT
  'rollback_run_id' AS info,
  run_id AS value
FROM _rollback_window
UNION ALL
SELECT 'remaining_orders_on_2026_10_14', COUNT(*)::TEXT
FROM public.orders o, _rollback_window w
WHERE (o.created_at >= w.start_at AND o.created_at < w.end_at)
   OR (o.date >= w.start_at AND o.date < w.end_at)
UNION ALL
SELECT 'remaining_stock_logs_on_2026_10_14', COUNT(*)::TEXT
FROM public.inventory_stock_logs l, _rollback_window w
WHERE l.created_at >= w.start_at
  AND l.created_at < w.end_at;

COMMIT;

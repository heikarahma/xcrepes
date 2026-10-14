-- Preview data yang masuk pada 14 Oktober 2026 waktu Indonesia (Asia/Jakarta).
-- Jalankan ini dulu di Supabase SQL Editor sebelum menjalankan rollback_oct14_2026_entries.sql.

WITH rollback_window AS (
  SELECT
    TIMESTAMPTZ '2026-10-14 00:00:00+07' AS start_at,
    TIMESTAMPTZ '2026-10-15 00:00:00+07' AS end_at
),
new_raw_materials AS (
  SELECT id FROM public.raw_materials, rollback_window
  WHERE created_at >= start_at AND created_at < end_at
),
new_branches AS (
  SELECT id FROM public.store_branches, rollback_window
  WHERE created_at >= start_at AND created_at < end_at
),
first_stock_log AS (
  SELECT DISTINCT ON (branch_id, raw_material_id)
    branch_id,
    raw_material_id,
    previous_stock,
    current_stock,
    created_at
  FROM public.inventory_stock_logs, rollback_window
  WHERE created_at >= start_at
    AND created_at < end_at
    AND raw_material_id IS NOT NULL
    AND raw_material_id NOT IN (SELECT id FROM new_raw_materials)
  ORDER BY branch_id, raw_material_id, created_at ASC
)
SELECT 'orders' AS target, COUNT(*) AS rows_affected
FROM public.orders, rollback_window
WHERE (created_at >= start_at AND created_at < end_at)
   OR (date >= start_at AND date < end_at)

UNION ALL
SELECT 'inventory_stock_logs', COUNT(*)
FROM public.inventory_stock_logs, rollback_window
WHERE created_at >= start_at AND created_at < end_at

UNION ALL
SELECT 'raw_materials', COUNT(*)
FROM public.raw_materials, rollback_window
WHERE created_at >= start_at AND created_at < end_at

UNION ALL
SELECT 'store_branch_stocks_for_new_materials_or_branches', COUNT(*)
FROM public.store_branch_stocks
WHERE raw_material_id IN (SELECT id FROM new_raw_materials)
   OR branch_id IN (SELECT id FROM new_branches)

UNION ALL
SELECT 'store_branch_stocks_to_restore', COUNT(*)
FROM public.store_branch_stocks s
JOIN first_stock_log f
  ON f.branch_id = s.branch_id
 AND f.raw_material_id = s.raw_material_id

UNION ALL
SELECT 'toppings', COUNT(*)
FROM public.toppings, rollback_window
WHERE created_at >= start_at AND created_at < end_at

UNION ALL
SELECT 'product_menus', COUNT(*)
FROM public.product_menus, rollback_window
WHERE created_at >= start_at AND created_at < end_at

UNION ALL
SELECT 'categories', COUNT(*)
FROM public.categories, rollback_window
WHERE created_at >= start_at AND created_at < end_at

UNION ALL
SELECT 'units', COUNT(*)
FROM public.units, rollback_window
WHERE created_at >= start_at AND created_at < end_at

UNION ALL
SELECT 'cashier_accounts', COUNT(*)
FROM public.cashier_accounts, rollback_window
WHERE created_at >= start_at AND created_at < end_at

UNION ALL
SELECT 'store_branches', COUNT(*)
FROM public.store_branches, rollback_window
WHERE created_at >= start_at AND created_at < end_at;

-- Detail bahan yang stoknya akan dikembalikan ke stok sebelum entry pertama tanggal 14 Oktober 2026.
WITH rollback_window AS (
  SELECT
    TIMESTAMPTZ '2026-10-14 00:00:00+07' AS start_at,
    TIMESTAMPTZ '2026-10-15 00:00:00+07' AS end_at
),
new_raw_materials AS (
  SELECT id FROM public.raw_materials, rollback_window
  WHERE created_at >= start_at AND created_at < end_at
),
first_stock_log AS (
  SELECT DISTINCT ON (branch_id, raw_material_id)
    branch_id,
    raw_material_id,
    raw_material_name,
    previous_stock,
    current_stock,
    created_at
  FROM public.inventory_stock_logs, rollback_window
  WHERE created_at >= start_at
    AND created_at < end_at
    AND raw_material_id IS NOT NULL
    AND raw_material_id NOT IN (SELECT id FROM new_raw_materials)
  ORDER BY branch_id, raw_material_id, created_at ASC
)
SELECT
  branch_id,
  raw_material_id,
  raw_material_name,
  previous_stock AS stock_sebelum_14_okt,
  current_stock AS stock_setelah_entry_pertama_14_okt,
  created_at AS entry_pertama_14_okt
FROM first_stock_log
ORDER BY branch_id, raw_material_name;

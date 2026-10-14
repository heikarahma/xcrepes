-- Performance indexes for large POS datasets.
-- Run this in Supabase SQL Editor after verifying table names match production.

create index if not exists idx_orders_branch_date
  on public.orders (branch_id, date desc);

create index if not exists idx_orders_branch_payment_date
  on public.orders (branch_id, payment_method, date desc);

create index if not exists idx_orders_branch_status_date
  on public.orders (branch_id, status, date desc);

create index if not exists idx_orders_invoice_number
  on public.orders (invoice_number);

create index if not exists idx_inventory_stock_logs_branch_created
  on public.inventory_stock_logs (branch_id, created_at desc);

create index if not exists idx_inventory_stock_logs_branch_type_created
  on public.inventory_stock_logs (branch_id, type, created_at desc);

create index if not exists idx_inventory_stock_logs_branch_material_created
  on public.inventory_stock_logs (branch_id, raw_material_name, created_at desc);

create index if not exists idx_inventory_stock_logs_reference_invoice
  on public.inventory_stock_logs (reference_invoice);

create index if not exists idx_product_menus_created
  on public.product_menus (created_at desc);

create index if not exists idx_raw_materials_created
  on public.raw_materials (created_at desc);

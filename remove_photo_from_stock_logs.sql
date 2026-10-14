-- ==============================================================================
-- MIGRATION: Hapus Kolom Foto dari Data Stok Bahan Baku (inventory_stock_logs)
-- Jalankan query ini di SQL Editor Supabase untuk menghapus kolom 'photo'.
-- ==============================================================================

ALTER TABLE IF EXISTS public.inventory_stock_logs 
DROP COLUMN IF EXISTS photo;

# 📦 Backup & Panduan Kloning Database XCrepes POS

Seluruh struktur skema dan data real/live dari database Supabase XCrepes telah berhasil disalin dan disiapkan dalam beberapa format yang siap pakai.

---

## 📁 Daftar Berkas yang Telah Disediakan

1. **`new_database_full_with_data.sql`** (Tersedia di root folder & folder `database_backup/`):
   - Berisi seluruh definisi tabel (`CREATE TABLE`), indeks, Row Level Security (RLS) policies, Realtime Publication, serta seluruh perintah `INSERT` data asli dari database Supabase sumber.
   - **Ukuran**: Lengkap beserta seluruh foto/gambar base64 produk, catatan stok, akun kasir, dan histori order.
   - **Siap dieksekusi 1-klik** di project Supabase baru ataupun PostgreSQL.

2. **`database_backup/xcrepes_database.sqlite`**:
   - Berkas database lokal SQLite mandiri (*standalone*) yang sudah berisi seluruh tabel dan seluruh data live.
   - Bisa langsung dibuka dengan software SQLite Viewer, DBeaver, DB Browser for SQLite, atau backend lokal.

3. **`database_backup/data/*.json`**:
   - Salinan data dalam format JSON murni:
     - `all_data.json` (Semua tabel digabung)
     - `units.json` (5 data satuan ukur)
     - `categories.json` (5 data kategori menu)
     - `raw_materials.json` (43 data bahan baku & stok)
     - `toppings.json` (30 data topping & resep)
     - `product_menus.json` (37 data produk menu & gambar)
     - `inventory_stock_logs.json` (84 catatan mutasi stok)
     - `orders.json` (8 riwayat transaksi order)
     - `store_settings.json` (1 pengaturan toko & struk)
     - `cashier_accounts.json` (1 data kasir)
     - `superadmin_profile.json` (1 profil superadmin)

4. **`scripts/clone_to_new_supabase.mjs`**:
   - Skrip otomatis untuk menyalin seluruh data ke project Supabase baru langsung lewat koneksi API.

---

## 🚀 Cara Menggunakan di Database Baru

### Opsi 1: Menggunakan Supabase Project Baru (Direkomendasikan & Paling Mudah)
1. Buat project baru di [supabase.com](https://supabase.com).
2. Buka dashboard project baru Anda, lalu pilih menu **SQL Editor** di sidebar kiri.
3. Buka berkas `new_database_full_with_data.sql`, lalu salin (*copy*) seluruh isinya.
4. Tempel (*paste*) ke dalam **SQL Editor** Supabase, lalu klik tombol **Run**.
5. Selesai! Seluruh tabel, index, RLS policy, realtime sync, dan seluruh data asli langsung aktif 100%.
6. Perbarui file `.env` di aplikasi Anda dengan URL & Anon Key project Supabase yang baru:
   ```env
   VITE_SUPABASE_URL=https://<project-id-baru>.supabase.co
   VITE_SUPABASE_ANON_KEY=<anon-key-baru>
   VITE_SUPABASE_PUBLISHABLE_KEY=<anon-key-baru>
   ```

---

### Opsi 2: Menggunakan Skrip Kloning Otomatis (Node.js)
Jika Anda sudah membuat tabel di Supabase baru (menggunakan `supabase_schema.sql`) dan ingin mengunggah datanya secara otomatis:
```bash
node scripts/clone_to_new_supabase.mjs <TARGET_SUPABASE_URL> <TARGET_SUPABASE_KEY>
```
Contoh:
```bash
node scripts/clone_to_new_supabase.mjs https://abcdefghijklm.supabase.co eyJhbGciOi...
```

---

### Opsi 3: Menggunakan Database Lokal SQLite
Jika Anda ingin menggunakan database offline / lokal berbasis SQLite:
- Berkas database sudah tersedia di: `database_backup/xcrepes_database.sqlite`.
- Berkas ini siap diintegrasikan atau dibuka dengan DB Browser for SQLite.

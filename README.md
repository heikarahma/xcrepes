# XCrepes POS

Aplikasi kasir dan pengelolaan stok berbasis React, Vite, dan Supabase. Mencakup master data, transaksi, retur, stock opname, laporan, dan pengaturan cabang.

## Menjalankan aplikasi

1. Instal dependensi dengan `npm install`.
2. Salin `.env.example` menjadi `.env`, lalu sesuaikan konfigurasi Supabase dengan project tujuan.
3. Jalankan `npm run dev` dan buka `http://localhost:5173`.

Untuk akses development dari perangkat lain di jaringan, gunakan `npm run dev:host` pada port 5174. Buat build produksi dengan `npm run build`, lalu periksa hasilnya menggunakan `npm run preview`.

## Struktur repo

```text
src/
  controllers/       State, context, dan alur fitur
  models/            Model serta transformasi data
  services/          Akses data Supabase
  lib/               Konfigurasi client dan subscription realtime
  utils/             Utilitas data, tanggal, dan ekspor laporan
  views/             Halaman dan komponen antarmuka
  styles/            Stylesheet dan design tokens
public/              Aset statis aplikasi
scripts/             Utilitas ekspor dan migrasi database
database_backup/     Snapshot database dan panduan pemulihan
docs/                Dokumentasi tambahan
output/pdf/          Panduan penggunaan aplikasi
```

## Database dan utilitas

- `supabase_schema.sql`: struktur dan konfigurasi awal database Supabase.
- `supabase_performance_indexes.sql`: indeks tambahan untuk performa query.
- `remove_photo_from_stock_logs.sql`: utilitas penghapusan foto pada catatan stok.
- `preview_oct14_2026_entries.sql` dan `rollback_oct14_2026_entries.sql`: utilitas pemeriksaan dan pembatalan data tanggal 14 Oktober 2026.
- [Panduan backup dan migrasi](database_backup/README_MIGRATION.md): lokasi snapshot serta cara pemulihan dan kloning database.

Skrip ekspor menyimpan SQL lengkap di `database_backup/new_database_full_with_data.sql`. Gunakan satu salinan ini agar tidak ada duplikasi di root repo. Snapshot merupakan data pada saat ekspor, bukan backup yang diperbarui otomatis.

Data dummy di `src/utils/dummyData.js` masih digunakan model aplikasi. Folder `node_modules/`, hasil build `dist/`, dan konfigurasi lokal `.env` tidak dilacak Git.

## Deployment

Build menghasilkan folder `dist/` untuk hosting frontend seperti Vercel. Atur environment variable Supabase sesuai project tujuan sebelum build. Konfigurasi Netlify yang tersedia disimpan di `netlify.toml` dan `public/_redirects`.

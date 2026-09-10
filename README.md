# 📏 Master Data Satuan Ukur — Blibli BLUE Design System (MVP)

Aplikasi web responsif modern untuk pengelolaan **Master Data Satuan Ukur (Unit of Measurement / UOM)** dengan antarmuka berbasis standar resmi **[Blibli BLUE Design System (BLUE 3)](https://blue.blibli.com/blue3/)**.

---

## 🌟 Fitur Utama

1. **CRUD Master Data Satuan Ukur Lengkap**:
   - **Tambah Satuan Ukur (Create)**: Input nama satuan ukur melalui modal dialog modern dengan validasi nama wajib diisi dan anti-duplikasi (*case-insensitive*).
   - **Lihat & Cari (Read)**: Menampilkan tabel data yang rapi dengan instant search bar, filter sorting (A-Z, Z-A, Terbaru, Terlama), dan paginasi interaktif.
   - **Ubah Satuan Ukur (Update)**: Edit nama satuan ukur yang sudah ada langsung dari modal dialog.
   - **Hapus Satuan Ukur (Delete)**: Modal konfirmasi penghapusan aman untuk menghapus satuan ukur tunggal atau hapus massal (*batch delete*).

2. **Desain Blibli BLUE 3**:
   - Palet warna Blibli Blue Signature (`#0072FF`), Blue Dark (`#005BC6`), Blue Light (`#F0F7FF`), dan Warm Orange (`#FF7600`).
   - Tipografi *Plus Jakarta Sans*.
   - Elevasi halus, border modern, dan animasi transisi responsif.

3. **Data Persistence**:
   - Data otomatis tersimpan di `localStorage` browser sehingga perubahan tetap tersimpan saat halaman di-refresh.
   - Tersedia tombol **"Reset Data Bawaan"** untuk mengembalikan data awal jika diperlukan.

---

## 🚀 Cara Menjalankan Aplikasi

### Prasyarat:
- Node.js versi 18 atau lebih baru.
- npm atau yarn.

### Langkah-langkah:
1. **Masuk ke folder proyek**:
   ```bash
   cd /Users/heyrahma/Documents/XcrpesPOS
   ```

2. **Instal dependensi**:
   ```bash
   npm install
   ```

3. **Jalankan development server**:
   ```bash
   npm run dev
   ```
   Buka browser pada alamat: `http://localhost:5173`.

4. **Build untuk produksi**:
   ```bash
   npm run build
   ```

---

## 📂 Struktur Proyek MVP

```
src/
├── components/
│   ├── common/              # Komponen Reusable Blibli BLUE 3
│   │   ├── Navbar.jsx       # Header & status sistem
│   │   ├── Sidebar.jsx      # Navigasi Master Data
│   │   ├── Button.jsx       # Tombol varian (Primary, Secondary, Outline, Danger)
│   │   ├── Badge.jsx        # Tag status dengan titik indikator
│   │   ├── Input.jsx        # Form input dengan prefix icon & validasi error
│   │   ├── Modal.jsx        # Dialog popup dengan backdrop blur
│   │   ├── Pagination.jsx   # Kontrol paginasi tabel data
│   │   ├── Toast.jsx        # Notifikasi sistem real-time
│   │   └── EmptyState.jsx   # State saat data kosong / tidak ditemukan
│   └── master/
│       └── unit/            # Modul Satuan Ukur
│           ├── UnitListView.jsx       # Tampilan tabel master data
│           ├── UnitFormModal.jsx      # Modal input tambah/ubah
│           └── UnitDeleteModal.jsx    # Modal konfirmasi hapus
├── context/
│   └── UnitContext.jsx      # Central Store CRUD & LocalStorage sync
├── data/
│   └── initialUnits.js      # Data preset satuan ukur standar Indonesia
├── styles/
│   ├── tokens.css           # Design tokens Blibli BLUE 3
│   ├── components.css       # Styling komponen UI BLUE
│   └── index.css            # Base stylesheet & responsivitas
├── App.jsx
└── main.jsx
```

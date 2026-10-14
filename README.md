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

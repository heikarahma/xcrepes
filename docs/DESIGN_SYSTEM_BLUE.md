# 🎨 Spesifikasi Blibli BLUE Design System (BLUE 3)

Dokumentasi ini merangkum mapping token desain dan komponen UI yang digunakan dalam aplikasi sesuai pedoman **[Blibli BLUE 3](https://blue.blibli.com/blue3/)**.

---

## 1. Design Tokens (Variabel CSS)

Didefinisikan di [`src/styles/tokens.css`](file:///Users/heyrahma/Documents/XcrpesPOS/src/styles/tokens.css).

### Palet Warna Utama (Primary Colors)
- `--blue-500` (`#0072FF`): Warna biru signature Blibli untuk aksi primer dan tombol utama.
- `--blue-600` (`#005BC6`): Warna hover tombol primer dan teks link aktif.
- `--blue-50` (`#F0F7FF`): Warna latar belakang kontainer subtle dan hover baris tabel.
- `--blue-100` (`#E0EFFF`): Border lembut untuk kartu dan badge biru.
- `--orange-500` (`#FF7600`): Aksen hangat khas Blibli untuk badge sorotan.
- `--green-500` (`#009B4C`): Status sukses dan indikator aktif.
- `--red-500` (`#E02020`): Status bahaya dan tombol hapus.

### Tipografi (Typography)
- **Font Family**: `'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif`
- **Font Mono**: `'JetBrains Mono', monospace` (untuk format ID kode `UOM-001`)

### Elevasi & Sudut Lengkung
- **Border Radius**: `8px` (kecil), `12px` (input/tombol), `16px` (kartu), `20px` (modal), `9999px` (pill badges).
- **Box Shadows**:
  - Small: `0 2px 6px rgba(0, 114, 255, 0.05), 0 1px 3px rgba(15, 23, 42, 0.04)`
  - Primary Button Glow: `0 4px 14px rgba(0, 114, 255, 0.35)`
  - Modal Elevation: `0 20px 48px rgba(8, 33, 66, 0.22), 0 8px 16px rgba(0, 0, 0, 0.06)`

---

## 2. Komponen UI Reusable

### A. `<Button />`
```jsx
import { Button } from './components/common/Button';
import { Plus } from 'lucide-react';

<Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
  Tambah Satuan Ukur
</Button>
```

### B. `<Input />`
```jsx
import { Input } from './components/common/Input';
import { Ruler } from 'lucide-react';

<Input
  label="Nama Satuan Ukur"
  placeholder="Contoh: Kilogram"
  value={name}
  onChange={(e) => setName(e.target.value)}
  icon={Ruler}
  error={errorMessage}
  required
/>
```

### C. `<Badge />`
```jsx
import { Badge } from './components/common/Badge';

<Badge variant="success" withDot>Aktif</Badge>
```

### D. `<Pagination />`
```jsx
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  totalItems={totalItems}
  itemsPerPage={itemsPerPage}
  onPageChange={setCurrentPage}
  onItemsPerPageChange={setItemsPerPage}
/>
```

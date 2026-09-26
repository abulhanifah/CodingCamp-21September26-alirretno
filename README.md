# 💰 Expense & Budget Visualizer

Aplikasi web sederhana untuk mencatat pengeluaran, mengatur anggaran bulanan, dan memvisualisasikan data keuangan — langsung di browser tanpa perlu server atau instalasi apapun.

---

## ✨ Fitur

- **Atur Anggaran Bulanan** — tentukan batas pengeluaran dan pantau lewat progress bar berwarna
- **Catat Pengeluaran** — tambahkan transaksi dengan deskripsi, nominal, kategori, dan tanggal
- **Ringkasan Keuangan** — 4 kartu statistik: Total Anggaran, Total Terpakai, Sisa, dan Jumlah Transaksi
- **Grafik Donat** — breakdown pengeluaran per kategori (Canvas API, tanpa library)
- **Grafik Batang** — tren pengeluaran harian 14 hari terakhir (Canvas API, tanpa library)
- **Filter & Urutkan** — saring daftar berdasarkan kategori, urutkan berdasarkan tanggal atau nominal
- **Hapus Transaksi** — dengan konfirmasi modal sebelum data dihapus
- **Reset Semua Data** — mulai dari awal kapan saja
- **Notifikasi Toast** — feedback real-time setiap aksi pengguna
- **Responsif** — tampilan menyesuaikan di mobile, tablet, dan desktop
- **Penyimpanan Lokal** — semua data tersimpan di browser via `localStorage`, tidak ada data yang dikirim ke server

---

## 🚀 Cara Menjalankan

Tidak perlu instalasi atau server. Cukup:

1. Clone atau download repository ini
2. Buka file `index.html` langsung di browser

```bash
# Clone repository
git clone <url-repository>
cd CodingCamp-21September26-alirretno

# Buka di browser (macOS)
open index.html

# Buka di browser (Linux)
xdg-open index.html

# Buka di browser (Windows)
start index.html
```

---

## 📁 Struktur File

```
project/
├── index.html       # Struktur halaman (HTML)
├── css/
│   └── style.css    # Semua styling (CSS)
├── js/
│   └── app.js       # Semua logika aplikasi (Vanilla JS)
└── README.md
```

> ⚠️ Hanya boleh ada 1 file CSS di dalam `css/` dan 1 file JS di dalam `js/`.

---

## 📖 Tutorial Penggunaan

### 1. Atur Anggaran Bulanan

1. Pada bagian **"Monthly Budget"** di bagian atas halaman, ketik nominal anggaran di kolom input (contoh: `5000000` untuk Rp 5.000.000)
2. Klik tombol **"Set Budget"** atau tekan **Enter**
3. Progress bar dan kartu statistik akan langsung terupdate

> 💡 Anggaran tersimpan otomatis dan tetap ada setelah halaman di-refresh.

---

### 2. Menambahkan Pengeluaran

1. Scroll ke bagian **"Add Expense"**
2. Isi keempat kolom:
   - **Description** — nama transaksi, contoh: `Belanja mingguan`
   - **Amount** — nominal dalam Rupiah, contoh: `150000`
   - **Category** — pilih salah satu dari 8 kategori:

     | Kategori | Ikon |
     |----------|------|
     | Food | 🍔 |
     | Transport | 🚗 |
     | Housing | 🏠 |
     | Health | 💊 |
     | Entertainment | 🎬 |
     | Shopping | 🛍️ |
     | Utilities | ⚡ |
     | Other | 📦 |

   - **Date** — pilih tanggal transaksi (default: hari ini)
3. Klik tombol **"+ Add Expense"**
4. Transaksi baru akan muncul di bagian atas daftar

> ⚠️ Semua kolom wajib diisi. Pesan error akan muncul jika ada yang kosong atau tidak valid.

---

### 3. Membaca Progress Bar Anggaran

Progress bar menunjukkan seberapa banyak anggaran yang sudah terpakai:

| Warna | Kondisi | Keterangan |
|-------|---------|------------|
| 🔵 Biru | < 80% | Pengeluaran masih aman |
| 🟡 Kuning | 80% – 99% | Mendekati batas anggaran |
| 🔴 Merah | ≥ 100% | Anggaran sudah terlampaui |

Teks di bawah progress bar menampilkan sisa anggaran atau peringatan jika sudah melebihi batas.

---

### 4. Membaca Grafik

**Grafik Donat (Spending by Category)**
- Setiap irisan mewakili satu kategori pengeluaran
- Ukuran irisan proporsional dengan total pengeluaran kategori tersebut
- Legenda di sebelah kanan menampilkan nama kategori dan persentasenya
- Angka di tengah donat adalah total seluruh pengeluaran

**Grafik Batang (Daily Spending)**
- Menampilkan pengeluaran harian untuk 14 hari terakhir yang ada transaksinya
- Sumbu X: tanggal (format hari/bulan)
- Sumbu Y: nominal pengeluaran
- Grafik otomatis menyesuaikan lebar layar

---

### 5. Filter dan Urutkan Daftar

Di bagian **"Expenses"**, terdapat dua kontrol:

- **Filter kategori** — tampilkan hanya transaksi dari kategori tertentu, atau pilih *"All Categories"* untuk melihat semua
- **Urutkan** — pilih salah satu:
  - Newest First — terbaru di atas
  - Oldest First — terlama di atas
  - Highest Amount — nominal terbesar di atas
  - Lowest Amount — nominal terkecil di atas

---

### 6. Menghapus Pengeluaran

1. Temukan transaksi yang ingin dihapus di daftar pengeluaran
2. Klik ikon 🗑️ di sebelah kanan transaksi tersebut
3. Sebuah modal konfirmasi akan muncul dengan detail transaksi
4. Klik **"Delete"** untuk konfirmasi, atau **"Cancel"** untuk membatalkan

---

### 7. Reset Semua Data

> ⚠️ **Tindakan ini tidak dapat dibatalkan.** Semua pengeluaran dan anggaran akan terhapus permanen.

1. Klik tombol **"Reset"** di pojok kanan atas halaman
2. Baca peringatan di modal konfirmasi
3. Klik **"Reset"** untuk melanjutkan, atau **"Cancel"** untuk membatalkan

---

## 🛠️ Stack Teknologi

| Teknologi | Kegunaan |
|-----------|---------|
| HTML5 | Struktur halaman |
| CSS3 | Styling, layout responsif, animasi |
| Vanilla JavaScript (ES6+) | Logika aplikasi, manipulasi DOM, chart |
| Canvas 2D API | Rendering grafik donat dan batang |
| LocalStorage API | Penyimpanan data di browser |

Tidak ada framework, library, atau build tool yang digunakan.

---

## 💾 Data & Privasi

Semua data disimpan **hanya di browser kamu** menggunakan `localStorage` dengan dua key:

- `ebv_expenses` — daftar pengeluaran
- `ebv_budget` — anggaran bulanan

Data tidak pernah dikirim ke server manapun. Menghapus data browser / cache akan menghapus semua data aplikasi.

---

## 🌐 Kompatibilitas Browser

| Browser | Status |
|---------|--------|
| Chrome (latest) | ✅ |
| Firefox (latest) | ✅ |
| Edge (latest) | ✅ |
| Safari (latest) | ✅ |

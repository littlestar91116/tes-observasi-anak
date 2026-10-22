# DAFTAR PERIKSA KEAMANAN & KEPATUHAN PRIVASI
## UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP)
### Little Star School Pamekasan

---

### 1. Landasan Hukum & Prinsip Utama
Berdasarkan **Undang-Undang Republik Indonesia Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP)**, data tumbuh kembang, riwayat sensori, catatan asesmen psikologis, dan kondisi medis anak berkebutuhan khusus (ABK) diklasifikasikan sebagai **Data Pribadi yang Bersifat Spesifik** (Pasal 4 Ayat 2 huruf b dan huruf e) yang memerlukan tingkat pengamanan dan kehati-hatian tertinggi.

---

### 2. Matriks Pemenuhan Prinsip UU PDP

| No | Prinsip UU PDP | Implementasi di Little Star School Pamekasan | Status |
|---|---|---|---|
| 1 | **Persetujuan Eksplisit (Consent)** | Formulir pendaftaran mewajibkan checklist persetujuan pemrosesan data, observasi ramah anak, dan konfirmasi kebenaran data oleh orang tua/wali (Pasal 20–22). | **TERPENUHI** |
| 2 | **Tujuan Terbatas & Spesifik** | Data observasi hanya digunakan untuk penyusunan Program Pembelajaran Individual (PPI) dan akomodasi belajar anak. | **TERPENUHI** |
| 3 | **Minimisasi Data pada Tampilan Publik** | Halaman publik, diagram ringkasan, dan statistik agregat sama sekali tidak mengekspos nama lengkap dengan diagnosis klinis anak (Pasal 16). | **TERPENUHI** |
| 4 | **Kontrol Akses Berbasis Peran (RBAC)** | Pembagian peran ketat: Super Admin, Kepala Sekolah, Guru Observer, dan Admin Pendaftaran dengan pembatasan hak akses berbasis server (Firestore Rules & RLS). | **TERPENUHI** |
| 5 | **Jejak Audit Permanen (Immutable Trail)** | Seluruh aksi krusial (login, perubahan asesmen, pengesahan laporan, penetapan keputusan admisi, dan ekspor) dicatat permanen dalam tabel `audit_logs` dan dilindungi pemicu anti-ubah/anti-hapus. | **TERPENUHI** |
| 6 | **Pencegahan Diskriminasi Algoritmik** | Keputusan penerimaan murid ABK dilakukan secara manual dan terpisah oleh pimpinan sekolah, bukan dieliminasi otomatis oleh kalkulator skor asesmen. | **TERPENUHI** |
| 7 | **Opsi Sensor pada Ekspor CSV** | Ekspor data untuk administrasi luar/dinas menyediakan tombol toggle untuk mengecualikan kolom klinis/sensori sensitif anak secara otomatis. | **TERPENUHI** |

---

### 3. Matriks Peran & Izin Akses (RBAC Matrix)

| Modul & Fitur | Super Admin | Kepala Sekolah | Guru Observer | Admin Pendaftaran |
|---|:---:|:---:|:---:|:---:|
| Mengisi Formulir Pendaftaran | ✅ | ✅ | ❌ | ✅ |
| Mengatur Jadwal Observasi & Ruangan | ✅ | ✅ | ❌ | ✅ |
| Menugaskan Guru Observer | ✅ | ✅ | ❌ | ✅ |
| Melakukan Observasi 7 Domain & Penilaian | ✅ | ❌ | ✅ (Tugasnya) | ❌ |
| Menyusun Rekomendasi PPI Awal | ✅ | ❌ | ✅ | ❌ |
| Mengajukan Laporan untuk Ditelaah | ❌ | ❌ | ✅ | ❌ |
| Menelaah, Meminta Revisi, & Mengesahkan Laporan | ✅ | ✅ | ❌ | ❌ |
| Menetapkan Keputusan Penerimaan Siswa | ✅ | ✅ | ❌ | ❌ |
| Mengelola Akun Staf & Reset Password | ✅ | ❌ | ❌ | ❌ |
| Mengubah Pengaturan Resmi Sekolah | ✅ | ❌ | ❌ | ❌ |
| Melihat Jejak Audit Lengkap | ✅ | ✅ | ❌ | ❌ |
| Ekspor Data & Pencadangan Sistem Penuh | ✅ | ✅ | ❌ | ❌ |

---

### 4. Tindakan Pengamanan Teknis yang Diterapkan
1. **Aturan Firestore Server-Side (`firestore.rules`)**:
   - Menolak seluruh permintaan yang tidak memenuhi otentikasi atau izin peran.
   - Melindungi koleksi `audit_logs` dari modifikasi (`allow update, delete: if false`).
2. **Ketiadaan Rahasia di Sisi Klien**:
   - Tidak ada token rahasia admin atau kata sandi database hardcoded di repositori frontend.
3. **Penyimpanan Lokal Terisolasi**:
   - Cache lokal menggunakan kunci khusus terstruktur dan tersinkronisasi dua arah ke Firestore.

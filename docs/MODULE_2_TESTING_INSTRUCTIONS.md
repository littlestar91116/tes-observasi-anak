# PANDUAN PENGUJIAN MODUL 2: OBSERVASI & ASESMEN SISWA ABK
## Little Star School Pamekasan

Dokumen ini memandu pengujian menyeluruh untuk **Modul 2 (Observasi & Asesmen Guru)** yang terintegrasi secara mulus di atas **Modul 1 (Pendaftaran & Penjadwalan)** tanpa merusak sistem yang sudah berjalan.

---

### 1. Cara Mengakses Modul 2
1. Di halaman utama, klik tombol **"Staf Internal"** di pojok kanan atas bilah navigasi (Top Bar).
2. Masuk menggunakan:
   - **PIN Akses Cepat**: Cukup tekan tombol *"Masuk sebagai Staf Internal"* (PIN default `1234` atau kosongkan), **ATAU**
   - **Google Firebase Auth**: Klik tombol *"Masuk dengan Google (Firebase Auth)"*.
3. Pada bilah atas Dashboard Staf, Anda akan melihat dua tab utama:
   - **Pendaftaran & Jadwal (Modul 1)**: Manajemen berkas registrasi, pencarian siswa, dan penjadwalan observasi anti-tabrakan.
   - **Observasi & Asesmen ABK (Modul 2)**: Stasiun kerja guru observasi, pengisian skor 7 domain, dan telaah Kepala Sekolah.

---

### 2. Pengujian Simulasi 4 Peran Pengguna (RBAC)
Di bagian atas panel staf terdapat **"Simulasi Peran"** interaktif untuk menguji hak akses masing-masing persona:

#### A. Peran: Guru Observer (`observer`)
- **Tugas**: Melakukan observasi langsung terhadap siswa ABK yang dijadwalkan, mencatat perilaku nyata, tingkat bantuan (*prompting*), dan mensintesis kebutuhan individual.
- **Langkah Uji**:
  1. Pilih peran **"Guru Observer"**.
  2. Klik tab **"Observasi & Asesmen ABK (Modul 2)"**.
  3. Pilih sesi contoh siswa **"Muhammad Rayyan Al-Farizi"** atau klik **"Mulai Observasi Baru"**.
  4. Anda akan masuk ke **Lembar Kerja Observasi Guru**:
     - Isi data konteks sesi: Jam observasi, ruang sensori, observer pendamping.
     - Telusuri **7 Domain Observasi**:
       - *Domain A*: Komunikasi & Interaksi Bahasa (COMM-01 s/d COMM-06)
       - *Domain B*: Perkembangan Sosial & Emosional (SOC-01 s/d SOC-07)
       - *Domain C*: Kognitif & Pra-Akademik (COG-01 s/d COG-08)
       - *Domain D*: Perkembangan Motorik Kasar & Halus (MOT-01 s/d MOT-06)
       - *Domain E*: Kemandirian Sehari-hari (DLS-01 s/d DLS-06)
       - *Domain F*: Kesiapan Bermain & Belajar (PLAY-01 s/d PLAY-05)
       - *Domain G*: Dukungan Sensori & Lingkungan (SENS-01 s/d SENS-06)
     - Klik skor penilaian **0, 1, 2, atau 3**, atau pilih opsi non-punitif **"Belum Diamati" / "Tidak Relevan"**.
     - Isi perilaku teramati, tingkat bantuan (*prompting level*), dan aktivitas stimulus.
  5. Masuk ke tab **"Ringkasan & Narasi"**:
     - Klik tombol **"Ekstrak Otomatis dari Butir yang Dinilai"** untuk menyalin otomatis butir mandiri (Skor 3), butir muncul (Skor 2), dan butir bantuan (Skor 0-1) ke dalam narasi.
     - Tuliskan rekomendasi akomodasi lingkungan dan tindak lanjut.
  6. Klik **"Simpan Draf"** atau **"Kirim ke Kepala Sekolah"**.

#### B. Peran: Kepala Sekolah (`principal`)
- **Tugas**: Menelaah hasil observasi yang telah diselesaikan oleh Guru Observer, memberikan catatan kebijakan penempatan kelas/terapi, dan menyetujui laporan resmi.
- **Langkah Uji**:
  1. Alihkan peran ke **"Kepala Sekolah"**.
  2. Buka sesi observasi siswa yang berstatus *"Selesai Observasi"* atau *"Disetujui Kepala Sekolah"*.
  3. Di halaman **Laporan & Telaah Evaluasi Siswa**, Kepala Sekolah dapat:
     - Melihat kartu capaian 7 domain (rata-rata skor, tingkat kemandirian, dan persentase butir yang teramati).
     - Membaca sintesis profil belajar dan dukungan sensori.
     - Mengisi kolom **"Catatan & Rekomendasi Kepala Sekolah"** (misal: penempatan di Kelas Transisi Ramah Sensori).
     - Menekan tombol **"Setujui & Sahkan Laporan Observasi"**.
     - Setelah disetujui, stempel resmi digital muncul dan lembar kerja terkunci (*read-only*).

#### C. Peran: Admin Admisi (`staff`)
- **Tugas**: Mengelola alur pendaftaran, memverifikasi dokumen orang tua, dan menjadwalkan tanggal observasi tanpa mengubah skor penilaian psikologis/guru.
- **Langkah Uji**:
  1. Alihkan peran ke **"Admin Admisi"**.
  2. Buka sesi observasi atau detail siswa: Admin dapat melihat data lengkap dan mencetak laporan, namun formulir pengisian skor berada dalam status baca saja (*read-only*).

#### D. Peran: Super Admin (`admin`)
- **Tugas**: Mengelola hak akses penuh serta menyesuaikan daftar indikator/instrumen penilaian (38 butir baku).
- **Langkah Uji**:
  1. Alihkan peran ke **"Super Admin"**.
  2. Klik tombol **"Konfigurasi Instrumen (38 Butir)"** pada tab Observasi.
  3. Muncul modal konfigurasi:
     - Filter butir berdasarkan domain A–G.
     - Non-aktifkan butir tertentu (toggle switch) jika sekolah tidak memerlukannya pada periode tertentu.
     - Klik **"Edit"** untuk mengubah kalimat stimulasi atau kriteria penilaian.
     - Klik **"Tambah Indikator"** untuk mendaftarkan butir kustom baru.
     - Tombol **"Reset ke Instrumen Baku"** untuk memulihkan 38 butir instrumen baku Little Star School.

---

### 3. Pengujian Skala Skor Non-Punitif
Sesuai prinsip asesmen anak berkebutuhan khusus (ABK):
1. **Skala Nilai 0–3**:
   - `0` = Belum ditunjukkan (memerlukan kesempatan observasi nyata).
   - `1` = Ditunjukkan dengan bantuan penuh (*Full physical / full verbal*).
   - `2` = Ditunjukkan dengan bantuan sebagian (*Partial physical / gestural*).
   - `3` = Ditunjukkan secara mandiri (*Independent*).
2. **Opsi Bebas Penalti**:
   - Memilih **"Belum Diamati"** (*Not Observed*) atau **"Tidak Relevan"** (*Not Applicable*) **TIDAK** dihitung sebagai nilai 0. Sistem secara matematis mengecualikan butir ini dari pembagi rata-rata skor domain (*non-punitive denominator*), sehingga anak tidak dirugikan atas hal yang belum sempat diobservasi.
3. **Tanpa Vonis Diagnosis Otomatis**:
   - Sistem tidak mengeluarkan vonis tunggal "Lulus/Gagal" (*pass/fail*) atau diagnosis klinis kaku, melainkan menghasilkan **Profil Kebutuhan Belajar & Rekomendasi Akomodasi Sensori**.

---

### 4. Cetak Laporan Observasi Resmi
1. Di halaman telaah laporan siswa, klik tombol **"Cetak Laporan Observasi"**.
2. Format cetak telah disesuaikan dengan CSS media print:
   - Navigasi dan tombol aksi disembunyikan otomatis.
   - Kop surat resmi Little Star School Pamekasan tampil rapi.
   - Matriks capaian 7 domain dan tanda tangan Kepala Sekolah tertata proporsional untuk dokumentasi fisik sekolah maupun arsip wali murid.

---

### 5. Struktur Database & Ekstensibilitas (Menuju Modul 3 & 4)
- Skema terintegrasi dalam koleksi Google Cloud Firebase Firestore:
  - Database ID: `ai-studio-littlestarportal-66f15408-2c3f-41a2-bfce-fa6e50fd3f4d`
  - Koleksi: `/observation_sessions/{sessionId}` (lembar kerja observasi 7 domain)
  - Aturan keamanan: `/firestore.rules` dan `/firebase-blueprint.json`
- Fondasi ini digunakan langsung oleh **Modul 3 (Laporan Observasi 23 Bagian & Rekomendasi PPI Awal)** dan **Modul 4 (Admin Dashboard & Admisi Terpadu)**.

# PANDUAN PENGUJIAN MODUL 3: LAPORAN OBSERVASI & REKOMENDASI PEMBELAJARAN INDIVIDUAL (PPI AWAL)
## Little Star School Pamekasan

Dokumen ini memandu pengujian fungsional untuk **Modul 3 (Laporan Observasi Resmi & Rekomendasi Pembelajaran Individual)** yang terintegrasi secara harmonis bersama Modul 1 dan Modul 2.

---

### 1. Cara Mengakses Modul 3
1. Buka aplikasi dan klik tombol **"Staf Internal"** di bilah navigasi atas (Top Bar).
2. Masuk menggunakan PIN cepat (tekan langsung tombol *"Masuk sebagai Staf Internal"*) atau tombol *"Masuk dengan Google (Firebase Auth)"*.
3. Pada bilah atas Dashboard Staf, kini tersedia 3 modul utama:
   - **Pendaftaran (Modul 1)**: Berkas pendaftaran orang tua & jadwal observasi.
   - **Observasi Guru (Modul 2)**: Instrumen penilaian 7 domain (38 butir) & skala 0–3 non-punitif.
   - **Laporan & PPI (Modul 3)**: Arsip dokumen resmi 23 bagian, matriks rekomendasi pembelajaran individual, dan pengesahan Kepala Sekolah.

---

### 2. Fitur 1: Pratinjau Dokumen Laporan Resmi (23 Bagian)
1. Pilih tab **"Laporan & PPI (Modul 3)"** atau klik tombol **"Laporan"** pada siswa terdaftar (contoh: Muhammad Rayyan Al-Farizi).
2. Sistem akan menampilkan format dokumen resmi A4 dengan struktur lengkap 23 bagian:
   - **Bagian 1**: Kop surat resmi Little Star School Pamekasan, logo bintang, akreditasi, dan kontak lengkap.
   - **Bagian 2**: Nomor laporan resmi (contoh: `LSS-OBS/2026/X/001`).
   - **Bagian 3**: Identitas lengkap murid (nama lengkap, panggilan, TTL, usia kalkulasi, jenis kelamin, wali).
   - **Bagian 4**: Tanggal pelaksanaan observasi, durasi waktu, ruang sensori, dan identitas observer.
   - **Bagian 5**: Tujuan observasi diagnostik-edukatif awal.
   - **Bagian 6**: Aktivitas stimulus dan metode yang digunakan.
   - **Bagian 7**: Tabel ringkasan capaian 7 domain (persentase butir teramati, rata-rata skor non-punitif, dan level kemandirian).
   - **Bagian 8**: Kekuatan dan minat khusus anak (*strengths & interests*).
   - **Bagian 9**: Keterampilan mandiri (Skor 3).
   - **Bagian 10**: Keterampilan dengan bantuan / tahap berkembang (Skor 1–2).
   - **Bagian 11**: Keterampilan yang belum ditunjukkan pada kesempatan yang memadai (Skor 0).
   - **Bagian 12**: Keterampilan yang belum sempat diamati (tidak dipenalti 0).
   - **Bagian 13–17**: Analisis kebutuhan dukungan per area spesifik (Komunikasi & Bahasa, Sosial-Emosional, Kognitif & Pra-Akademik, Motorik & Kemandirian, serta Akomodasi Sensori Lingkungan).
   - **Bagian 18**: Rekomendasi sasaran belajar tahap awal (Tabel PPI Awal).
   - **Bagian 19**: Saran strategi pengajaran adaptif umum.
   - **Bagian 20**: Rekomendasi tindak lanjut & rujukan terapi spesifik.
   - **Bagian 21**: Tanda tangan digital Guru Observer / Psikolog.
   - **Bagian 22**: Kolom pengesahan & stempel digital Kepala Sekolah.
   - **Bagian 23**: Lembar konfirmasi diskusi bersama Orang Tua / Wali Murid.

3. **Pembedaan Sumber Informasi Baku**:
   Setiap blok temuan diberi lencana pembeda yang jelas:
   - `[Observasi Langsung Guru]`
   - `[Laporan Orang Tua / Riwayat]`
   - `[Interpretasi Edukasi Profesional]`
   - `[Rekomendasi Asesmen Lanjutan]`

---

### 3. Fitur 2: Pengelolaan Rekomendasi Pembelajaran Individual (PPI Awal)
1. Di halaman dokumen laporan, klik tombol **"Kelola Rekomendasi PPI"**.
2. Anda akan diarahkan ke antarmuka **Matriks Sasaran Belajar & Intervensi Adaptif**:
   - Menampilkan daftar rekomendasi yang mencakup 11 kategori intervensi ABK.
   - Setiap butir rekomendasi memuat 7 parameter wajib:
     1. *Target Skill* (Keterampilan Sasaran)
     2. *Baseline Observation* (Observasi Awal)
     3. *Suggested Strategy* (Strategi Pembelajaran Adaptif)
     4. *Required Materials* (Media / Alat yang Dibutuhkan)
     5. *Assistance Level* (Tingkat Bantuan / Prompting)
     6. *Success Indicator* (Indikator Ketercapaian Terukur)
     7. *Review Period* (Periode Evaluasi, misal 4 Minggu / 1 Semester)
3. **Pengeditan & Penambahan**:
   - Guru Observer dan Super Admin dapat mengklik **"Edit"** untuk menyesuaikan kalimat intervensi.
   - Klik **"Tambah Rekomendasi"** untuk membuat target pembelajaran baru.
4. **Bantuan Draf Asisten AI**:
   - Klik tombol **"Bantuan Draf AI"**.
   - Sistem akan menyusun draf rekomendasi adaptif yang disesuaikan dengan skor aktual dan kekuatan anak.
   - Draf secara otomatis diberi lencana khusus **"Draf AI"** disertai pemberitahuan etika bahwa guru observer wajib menelaah sebelum disahkan.

---

### 4. Fitur 3: Alur Telaah Kepala Sekolah (Principal Review Workflow)
1. Alihkan peran di bilah atas ke **"Kepala Sekolah"**.
2. Buka laporan berstatus *"Diajukan untuk Telaah"* atau *"Draf Laporan"*.
3. Klik tombol **"Telaah Kepala Sekolah"**:
   - Opsi 1: **"Setujui Laporan Resmi"** -> Mengesahkan laporan, memasang stempel digital resmi *"DISETUJUI RESMI"*, mencatat tanggal dan nama penelaah, serta mengunci dokumen dari pengeditan diam-diam (*silent editing protection*).
   - Opsi 2: **"Minta Revisi ke Observer"** -> Mengembalikan status laporan menjadi *"Perlu Revisi"* dan mewajibkan catatan perbaikan tertulis bagi guru observer.
4. **Riwayat Versi Terlacak (Traceable Versioning)**:
   - Jika laporan yang telah disetujui diubah kembali oleh staf, sistem otomatis menaikkan nomor versi (`v1` → `v2`) dan mencatat riwayat snapshot perubahan pada tabel `report_versions`.

---

### 5. Fitur 4: Ekspor PDF & Cetak A4 Standar
1. Pada pratinjau dokumen laporan, klik tombol **"Cetak Dokumen (A4)"**.
2. Tampilan cetak telah dioptimalkan dengan CSS `@media print`:
   - Ukuran A4 dengan batas tepi rapi (margins 15-20mm).
   - Bilah navigasi, tombol aplikasi, dan footer layar disembunyikan secara otomatis.
   - Banner keamanan *"DOKUMEN RAHASIA — INFORMASI PERKEMBANGAN ANAK"* tampil di bagian atas halaman.
   - Mencegah pemotongan tabel atau tanda tangan di tengah halaman (*page-break protection*).
3. Klik **"Unduh Dokumen"** untuk mengunduh berkas salinan HTML mandiri yang siap dibuka dan dicetak secara luring (*offline*).

---

### 6. Fitur 5: Arsip Laporan (Report Archive)
1. Buka tab **"Laporan & PPI (Modul 3)"**.
2. **Pencarian Cepat**: Cari dokumen berdasarkan nama anak, nama panggilan, atau nomor laporan resmi.
3. **Penyaringan Multi-Kriteria**:
   - Filter berdasarkan status: *Semua Status*, *Draf Laporan*, *Diajukan*, *Perlu Revisi*, *Disetujui Resmi*.
   - Filter berdasarkan Guru Observer penanggung jawab.
4. **Log Audit & Riwayat Versi**:
   - Klik ikon jam (*History*) di kolom aksi untuk melihat riwayat perubahan versi dan catatan telaah Kepala Sekolah terdahulu.

---

### 7. Skema Basis Data Google Cloud Firebase Firestore
Data laporan dan rekomendasi tersimpan secara persisten pada koleksi Firestore:
- Database ID: `ai-studio-littlestarportal-66f15408-2c3f-41a2-bfce-fa6e50fd3f4d`
- Koleksi:
  - `/reports/{reportId}`: Dokumen laporan resmi 23 bagian dengan versioning & approval log
  - `/learning_recommendations/{recId}`: Butir rekomendasi individual PPI/IEP
- Aturan keamanan teruji dan aktif di `firestore.rules` serta skema didefinisikan di `firebase-blueprint.json`.
- Seluruh jejak audit perubahan laporan tersinkronisasi ke `/audit_logs/`.

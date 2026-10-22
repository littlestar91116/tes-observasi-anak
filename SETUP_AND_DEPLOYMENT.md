# Panduan Instalasi dan Deployment
## Little Star School Pamekasan — Modul 1 – 4 (Full Google Cloud Firebase Architecture)

Dokumen ini berisi panduan teknis langkah demi langkah untuk menjalankan aplikasi di lingkungan pengembangan lokal (*development*) dan menerapkan (*deploy*) ke produksi dengan **Google Cloud Firebase (Firestore & Authentication)**.

---

### 1. Status Provisi Firebase (Aktif)
Proyek telah berhasil diprovisi ke layanan **Google Cloud Firebase**:
- **Project ID**: `rare-entity-88f9p`
- **Firestore Database ID**: `ai-studio-littlestarportal-66f15408-2c3f-41a2-bfce-fa6e50fd3f4d`
- **Authentication**: Firebase Authentication terintegrasi dengan Google Sign-In & PIN staf.
- **Security Rules**: `firestore.rules` telah dibuat dan disebarkan (*deployed*) dengan prinsip Zero-Trust ABAC.
- **Intermediate Blueprint**: `firebase-blueprint.json` memuat spesifikasi seluruh 13 entitas data.
- **Konfigurasi Klien**: Tersimpan di `firebase-applet-config.json`.

---

### 2. Prasyarat Lingkungan
- **Node.js**: Versi 20.x atau lebih baru (LTS direkomendasikan)
- **NPM** atau **PNPM** / **Yarn**

---

### 3. Struktur 13 Koleksi Firestore
Aplikasi menggunakan 13 koleksi Firestore:
1. `students`: Profil calon murid dengan kebutuhan khusus (nama lengkap, tempat/tanggal lahir, usia kalkulasi otomatis, riwayat pendidikan).
2. `guardians`: Kontak orang tua/wali serta kontak darurat cadangan.
3. `registrations`: Berkas utama pendaftaran dengan alur 9-tahap admisi.
4. `appointments`: Jadwal observasi dengan pencegahan bentrok waktu & ruangan (*anti-double booking*).
5. `consents`: Catatan persetujuan hukum orang tua dan verifikasi privasi data medis (UU PDP No. 27/2022).
6. `settings`: Konfigurasi profil sekolah dinamis (*alamat, telepon, WhatsApp, akreditasi, visi & misi*).
7. `admins`: Identitas otentikasi tim internal Little Star School.
8. `observation_sessions`: Lembar kerja guru 7-domain dengan 38 indikator tumbuh kembang terstruktur.
9. `reports`: Laporan resmi observasi 23 bagian dengan versioning & approval log.
10. `learning_recommendations`: Rekomendasi PPI/IEP awal individual yang dapat disesuaikan pengajar.
11. `admission_decisions`: Pencatatan keputusan penerimaan administratif manual terpisah dari skor observasi.
12. `staff_users`: Manajemen akun pengajar, kepala sekolah, dan observer dengan role-based control.
13. `audit_logs`: Jejak audit kepatuhan & akses data yang tidak dapat diubah (immutable).

---

### 4. Menjalankan di Lingkungan Lokal
Jalankan perintah berikut pada terminal:
```bash
# Instal dependensi
npm install

# Jalankan server pengembangan
npm run dev
```
Akses aplikasi melalui peramban di `http://localhost:3000`.

---

### 5. Pengujian Fitur Utama
1. **Pendaftaran Observasi Siswa**:
   - Klik tombol **Daftar Observasi** di halaman depan.
   - Lengkapi 4 tahap formulir:
     - Tahap A: Data anak (usia terhitung otomatis, riwayat sekolah/terapi).
     - Tahap B: Data orang tua / kontak darurat.
     - Tahap C: Riwayat perkembangan & profil sensori anak.
     - Tahap D: Persetujuan privasi & kebenaran data.
   - Kirim formulir dan amati kartu konfirmasi pendaftaran ber-ID unik (misal: `LSS-2026-0004`).
   - Coba tombol **Cetak / Simpan Bukti Pendaftaran**.
2. **Dashboard Administrasi**:
   - Klik tombol **Portal Staf / Admin** di navigasi atas atau footer.
   - Masuk menggunakan **Google Sign-In (Firebase Auth)** atau PIN staf default (`1234`).
   - Telusuri pendaftar dengan pencarian nama atau nomor registrasi.
   - Filter berdasarkan status: `Pendaftaran Baru`, `Menunggu Jadwal`, `Jadwal Terkonfirmasi`, `Dibatalkan`.
   - Buka **Detail Siswa** untuk meninjau profil lengkap anak dan riwayat medis.
   - Buka **Atur Jadwal Observasi** untuk menetapkan tanggal, slot jam, ruangan, dan psikolog observer (dilengkapi proteksi anti-double booking).
   - Buka **Pengaturan Sekolah** untuk menyesuaikan alamat resmi, nomor WhatsApp, kontak, serta visi & misi sekolah tanpa menyunting kode sumber.

---

### 6. Build Produksi
Untuk membangun artefak statis produksi:
```bash
npm run build
```
Hasil build akan tersimpan di direktori `/dist` dan siap di-deploy.

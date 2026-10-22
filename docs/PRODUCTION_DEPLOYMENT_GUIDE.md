# PANDUAN DEPLOYMENT PRODUKSI
## Little Star School Pamekasan (Modul 1 – 4)

Dokumen ini memandu langkah-langkah deployment sistem informasi pendaftaran, observasi tumbuh kembang anak berkebutuhan khusus (ABK), penyusunan laporan PPI, dan panel administrasi terpadu Little Star School Pamekasan ke lingkungan produksi berkinerja tinggi.

---

### 1. Spesifikasi Sistem & Arsitektur
- **Frontend Framework**: React 18 / 19 + TypeScript + Vite
- **Styling Engine**: Tailwind CSS
- **Icon Set**: Lucide React
- **Basis Data & Autentikasi Cloud**: Google Cloud Firebase Firestore + Firebase Authentication
- **Firestore Database ID**: `ai-studio-littlestarportal-66f15408-2c3f-41a2-bfce-fa6e50fd3f4d`
- **Aturan Keamanan**: Terintegrasi di `firestore.rules` dan `firebase-blueprint.json`
- **Port Pengembangan Lokal**: `3000` (atau port default Vite)

---

### 2. Konfigurasi Variabel Lingkungan (`.env`)

Buat berkas `.env` pada direktori root proyek berdasarkan templat `.env.example`:

```env
# Google Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=rare-entity-88f9p.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=rare-entity-88f9p
VITE_FIREBASE_STORAGE_BUCKET=rare-entity-88f9p.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# Optional: Gemini API Key untuk AI Recommendation Drafts
VITE_GEMINI_API_KEY=AIzaSy...

# Identitas & Kontak Default Sekolah
VITE_SCHOOL_PHONE=082199988769
VITE_SCHOOL_EMAIL=littlestar91116@gmail.com
VITE_SCHOOL_ADDRESS="Perum Royal Pademawu, Blok B No.18 - 19, Dasok - Pademawu - Pamekasan"
```

---

### 3. Langkah Kompilasi & Build Produksi

1. **Instalasi Dependensi**:
   ```bash
   npm install
   ```

2. **Pemeriksaan Type & Linter**:
   ```bash
   npm run lint
   ```

3. **Build Bundel Aset Produksi**:
   ```bash
   npm run build
   ```
   Hasil build berupa berkas statis teroptimasi berukuran ringkas pada direktori `/dist`.

4. **Uji Coba Lokal Bundel Build (Preview)**:
   ```bash
   npm run preview
   ```

---

### 4. Panduan Deployment ke Vercel

1. Buka dashboard [Vercel](https://vercel.com) dan buat proyek baru dengan menghubungkan repositori Git.
2. Atur **Framework Preset**: `Vite`.
3. Atur **Build Command**: `npm run build`.
4. Atur **Output Directory**: `dist`.
5. Masukkan seluruh variabel lingkungan (`VITE_FIREBASE_*`) pada menu **Project Settings > Environment Variables**.
6. Klik **Deploy**.

#### Konfigurasi `vercel.json` (SPA Routing & Security Headers)
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

---

### 5. Konfigurasi Domain Kustom & Sertifikat SSL/HTTPS
1. Pada menu Vercel atau penyedia hosting, tambahkan domain resmi sekolah (contoh: `pendaftaran.littlestarpamekasan.sch.id`).
2. Konfigurasikan catatan DNS pada registrar domain:
   - **Type**: `CNAME`
   - **Name**: `pendaftaran` (subdomain)
   - **Target**: `cname.vercel-dns.com`
3. Sertifikat SSL/TLS diterbitkan dan diperbarui secara otomatis gratis melalui Let's Encrypt dengan enkripsi TLS 1.3.

---

### 6. Pemeliharaan & Jadwal Pencadangan (Backup Policy)
1. **Pencadangan Bulanan**: Administrator wajib mengunduh cadangan sistem penuh (format JSON) melalui menu **Ekspor & Cadangan** di panel admin tiap akhir bulan.
2. **Penyimpanan Aman**: Berkas cadangan diarsipkan dalam media penyimpanan terenkripsi sekolah.

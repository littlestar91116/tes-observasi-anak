# Panduan Integrasi dan Ekstensi Sistem
## Little Star School Pamekasan — Menuju Modul 2

### 1. Rekapitulasi Fondasi Modul 1
Modul 1 telah mengimplementasikan:
1. **Portal Publik & Pengenalan Sekolah**: Profil Little Star School Pamekasan, visi & misi yang dapat disesuaikan di admin settings, alur pendaftaran, dan FAQ ramah orang tua.
2. **Formulir Pendaftaran Multi-Tahap (Zod + React Hook Form)**:
   - Tahap A: Data Anak (identitas, perhitungan usia otomatis, riwayat pendidikan/terapi).
   - Tahap B: Orang Tua/Wali & Kontak Darurat.
   - Tahap C: Latar Belakang Perkembangan (kekuatan/minat, komunikasi, kemandirian makan/toilet/berpakaian, sensori, riwayat medis).
   - Tahap D: Persetujuan, Privasi, dan Pernyataan Kebenaran Data.
3. **Konfirmasi & Bukti Pendaftaran Cetak**: Menghasilkan kode unik `LSS-YYYY-XXXX`, panduan langkah berikutnya, dan status jadwal observasi.
4. **Fondasi Penjadwalan Observasi**: Manajemen slot waktu, pencegahan double booking, dan penetapan observer.
5. **Dashboard Administrasi Internal**: Filter status, pencarian, detail siswa menyeluruh, dan pengubah pengaturan sekolah.

---

### 2. Gambaran Besar Arsitektur 4 Modul
- **Modul 1 (Selesai)**: *Public Website, Online Registration & Scheduling Foundation*
- **Modul 2 (Berikutnya)**: *Observation Assessment Instruments, Scoring Rubrics & Observer Workstation*
- **Modul 3**: *Individualized Education Plan (IEP / Program Pembelajaran Individual - PPI)*
- **Modul 4**: *Student Progress Tracking, Therapy Logs & Parent Collaborative Portal*

---

### 3. Skema Basis Data Lanjutan untuk Modul 2

Untuk menyambung secara mulus dari `registrations` dan `observation_appointments` Modul 1, migrasi Modul 2 akan menambahkan tabel-tabel berikut:

```sql
-- 1. Instrumen Asesmen Observasi (Template Indikator Perkembangan)
CREATE TABLE public.assessment_instruments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'INS-SENSORY-01', 'INS-COMM-01'
    title VARCHAR(150) NOT NULL,
    domain VARCHAR(50) NOT NULL CHECK (domain IN ('Motorik Kasar', 'Motorik Halus', 'Bahasa & Komunikasi', 'Kognitif & Bermain', 'Sosial-Emosional', 'Sensori & Regulasi Diri', 'Kemandirian')),
    age_group_min_months INT DEFAULT 24,
    age_group_max_months INT DEFAULT 144,
    rubric_criteria JSONB NOT NULL, -- Matriks level pencapaian (1: Perlu Bantuan Penuh, 2: Bantuan Sebagian, 3: Berkembang Sesuai Ekspektasi, 4: Mandiri)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Lembar Kerja Observasi (Observation Session Assessment)
CREATE TABLE public.observation_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL REFERENCES public.observation_appointments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE RESTRICT,
    observer_id UUID NOT NULL REFERENCES public.users(id),
    session_date DATE NOT NULL,
    scores JSONB NOT NULL, -- Skor per indikator instrumen
    clinical_observations TEXT NOT NULL, -- Catatan kualitatif psikolog/terapis
    sensory_profile_summary TEXT, -- Analisis profil sensori (hiper/hipo responsif)
    learning_style_summary TEXT, -- Gaya belajar dominan (visual, kinestetik, auditori)
    strengths_identified TEXT NOT NULL,
    growth_areas_identified TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Draft' CHECK (status IN ('Draft', 'Reviewed', 'Finalized')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Rekomendasi Hasil Observasi (Observation Outcome & Placement Recommendation)
CREATE TABLE public.observation_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES public.observation_assessments(id) ON DELETE CASCADE,
    placement_recommendation VARCHAR(100) NOT NULL, -- 'Kelas Transisi', 'Kelas Inklusi Reguler dengan Shadow', 'Kelas Layanan Khusus Intensif', 'Intervensi Terapi Terlebih Dahulu'
    recommended_therapies JSONB, -- ['Terapi Wicara 2x/minggu', 'Sensori Integrasi 2x/minggu']
    iep_priority_goals JSONB, -- Target awal untuk Modul 3 (PPI)
    consultation_date DATE,
    parent_feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 4. Peta Integrasi Komponen UI
1. **Tombol "Mulai Observasi" di Admin Dashboard**:
   - Di tab `Log Observasi & Jadwal` pada kartu siswa yang berstatus `Jadwal Terkonfirmasi`, tambahkan tombol:
   ```tsx
   <button onClick={() => navigateToAssessment(student.id, appointment.id)}>
     Buka Lembar Kerja Observasi (Modul 2)
   </button>
   ```
2. **Workstation Observer**:
   - Komponen observasi real-time berbasis tablet/laptop yang ramah sentuh untuk mencatat respons anak saat bermain dengan rubrik 4-level.
3. **Ekspor Hasil Laporan ke PDF**:
   - Generator laporan resmi hasil observasi bertanda tangan psikolog dan kepala sekolah Little Star School Pamekasan untuk diberikan kepada orang tua.

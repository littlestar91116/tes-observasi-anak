# Skema Basis Data Google Firebase Firestore
## Little Star School Pamekasan (Modul 1, 2, 3, dan 4)

### Ringkasan Arsitektur
Sistem Little Star School Pamekasan menggunakan basis data **Google Cloud Firebase Firestore (NoSQL Document Store)** dengan database ID:
`ai-studio-littlestarportal-66f15408-2c3f-41a2-bfce-fa6e50fd3f4d`
serta **Firebase Authentication** untuk manajemen otentikasi staf, observer, dan pimpinan sekolah.

Sistem dirancang dengan prinsip **Privasi Data Tumbuh Kembang Anak (UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi / PDP)**, memisahkan data klinis observasi dari keputusan administratif penerimaan, serta mencatat seluruh riwayat telaah dan perubahan versi dokumen secara berkesinambungan.

---

### Struktur Koleksi Firestore (Firestore Collections)

```text
├── students/ {studentId}                     -> Identitas profil anak berkebutuhan khusus
├── guardians/ {guardianId}                   -> Data orang tua/wali & kontak darurat
├── registrations/ {registrationId}           -> Rekam pendaftaran admisi & riwayat tumbuh kembang
├── appointments/ {appointmentId}             -> Slot jadwal observasi & alokasi ruangan
├── consents/ {consentId}                     -> Rekam persetujuan orang tua & privasi data
├── settings/ default                         -> Pengaturan profil sekolah & visi misi
├── admins/ {adminId}                         -> Identitas verifikasi hak akses administrator
├── observation_sessions/ {sessionId}         -> Lembar observasi 7-domain dengan 38 butir indikator
├── reports/ {reportId}                       -> Dokumen resmi laporan hasil observasi (23 bagian)
├── learning_recommendations/ {recId}         -> Rekomendasi PPI/IEP awal yang dapat diedit
├── admission_decisions/ {decisionId}         -> Keputusan administratif penerimaan manual
├── staff_users/ {userId}                     -> Manajemen akun staf pengajar, kepala sekolah, dan observer
└── audit_logs/ {logId}                       -> Catatan audit keamanan & akses yang tidak dapat diubah (immutable)
```

---

### Rincian Koleksi

#### 1. `students` (`/students/{studentId}`)
Menyimpan identitas anak yang didaftarkan untuk observasi:
- `id`: string (UUID / identifier unik)
- `fullName`: string (Nama lengkap anak)
- `preferredName`: string (Nama panggilan)
- `birthPlace`: string (Tempat lahir)
- `birthDate`: string (Format YYYY-MM-DD)
- `calculatedAge`: string (Usia otomatis dalam tahun & bulan)
- `gender`: string (`'Laki-laki'` | `'Perempuan'`)
- `address`: string (Alamat tempat tinggal)
- `previousEducation`: string (Riwayat sekolah/terapi sebelumnya)
- `createdAt`, `updatedAt`: ISO 8601 string

#### 2. `guardians` (`/guardians/{guardianId}`)
Data orang tua atau wali murid:
- `id`: string
- `fullName`: string (Nama lengkap orang tua/wali)
- `relationship`: string (`'Ayah'`, `'Ibu'`, `'Wali'`, `'Kakek/Nenek'`, `'Lainnya'`)
- `phoneNumber`: string (Nomor telepon aktif)
- `whatsappNumber`: string (Nomor WhatsApp)
- `email`: string (Alamat surel aktif)
- `emergencyContactName`: string (Nama kontak darurat alternatif)
- `emergencyContactPhone`: string (Nomor telepon kontak darurat)
- `createdAt`, `updatedAt`: ISO 8601 string

#### 3. `registrations` (`/registrations/{registrationId}`)
Rekam berkas pendaftaran calon siswa:
- `id`: string
- `registrationNumber`: string (Format unik: `LSS-YYYY-XXXX`)
- `studentId`: string (Relasi ke dokumen student)
- `guardianId`: string (Relasi ke dokumen guardian)
- `status`: string (`'Pendaftaran Baru'`, `'Menunggu Jadwal'`, `'Jadwal Terkonfirmasi'`, `'Observasi Berlangsung'`, `'Observasi Selesai'`, `'Menunggu Review'`, `'Laporan Disetujui'`, `'Tindak Lanjut'`, `'Keputusan Penerimaan Dicatat'`, `'Dibatalkan'`)
- `submissionDate`: ISO 8601 string
- `developmentalBackground`: map/object (Riwayat sensori, komunikasi, motorik, dan kemandirian yang dilaporkan orang tua)
- `adminNotes`: string
- `createdAt`, `updatedAt`: ISO 8601 string

#### 4. `appointments` (`/appointments/{appointmentId}`)
Penjadwalan sesi observasi ramah anak:
- `id`: string
- `registrationId`: string
- `appointmentDate`: string (YYYY-MM-DD)
- `timeSlot`: string (`'08:30 - 10:00 WIB'`, `'10:30 - 12:00 WIB'`, `'13:00 - 14:30 WIB'`)
- `locationRoom`: string (`'Ruang Sensori & Gerak'`, `'Ruang Observasi Individual A'`, `'Ruang Observasi Individual B'`, `'Taman Eksplorasi Luar'`)
- `observerId`: string (ID staf pengajar yang ditugaskan)
- `observerName`: string (Nama pengajar/psikolog yang bertugas)
- `status`: string (`'Menunggu Konfirmasi'`, `'Dikonfirmasi'`, `'Selesai'`, `'Rescheduled'`, `'Dibatalkan'`)
- `notes`: string
- `rescheduleReason`: string

#### 5. `consents` (`/consents/{consentId}`)
Persetujuan resmi orang tua terhadap prosedur observasi dan privasi:
- `id`: string
- `registrationId`: string
- `guardianName`: string
- `consentObservation`: boolean
- `consentPrivacyPolicy`: boolean
- `dataAccuracyConfirmed`: boolean
- `consentedAt`: ISO 8601 string

#### 6. `settings` (`/settings/default`)
Konfigurasi profil kelembagaan Little Star School:
- `id`: `'default'`
- `schoolName`: string (Default: `Little Star School Pamekasan`)
- `tagline`: string
- `address`: string (`Perum Royal Pademawu, Blok B No.18 - 19, Dasok - Pademawu - Pamekasan`)
- `phone`: string (`082199988769`)
- `whatsappNumber`: string (`082199988769`)
- `email`: string (`littlestar91116@gmail.com`)
- `accreditation`: string
- `vision`: string
- `mission`: array of string
- `observationGuidelines`: string
- `faqList`: array of question/answer objects
- `updatedAt`: ISO 8601 string

#### 7. `observation_sessions` (`/observation_sessions/{sessionId}`)
Lembar kerja 7-domain observasi guru (Modul 2):
- `id`: string
- `student_id`: string
- `registration_id`: string
- `appointment_id`: string
- `observer_id`, `observer_name`: string
- `session_date`: string
- `start_time`, `end_time`: string
- `room_location`: string
- `context_description`: string
- `status`: string (`'Sedang Berlangsung'`, `'Selesai (Menunggu Telaah)'`, `'Disetujui Kepala Sekolah'`)
- `responses`: map of indicator items (skor 0-3, tingkatan prompt, deskripsi perilaku, metode/aktivitas, sumber)
- `synthesis`: rangkuman kekuatan, keterampilan mandiri, dukungan komunikasi, dan rekomendasi tindak lanjut

#### 8. `reports` (`/reports/{reportId}`)
Dokumen laporan observasi 23 bagian (Modul 3):
- `id`: string
- `report_number`: string (Contoh: `LSS-OBS/2026/10/001`)
- `session_id`, `student_id`, `student_name`: string
- `status`: string (`'Draft'`, `'Diajukan untuk Telaah'`, `'Perlu Revisi'`, `'Disetujui Kepala Sekolah'`)
- `current_version`: number
- `versions`: array of revision snapshots
- `review_logs`: array of review logs (telaah kepala sekolah)
- `headmaster_name`, `headmaster_approved_at`, `headmaster_approval_notes`: string
- `created_at`, `updated_at`: ISO 8601 string

#### 9. `learning_recommendations` (`/learning_recommendations/{recId}`)
Rekomendasi individual (PPI/IEP awal) yang dapat disesuaikan guru:
- `id`: string
- `report_id`: string
- `category`: string (Komunikasi, Sensori, Kemandirian, dll.)
- `target_skill`: string
- `baseline_observation`: string
- `suggested_strategy`: string
- `required_materials`: string
- `assistance_level`: string
- `success_indicator`: string
- `review_period`: string
- `is_ai_generated`: boolean
- `order_index`: number

#### 10. `admission_decisions` (`/admission_decisions/{decisionId}`)
Keputusan penerimaan manual oleh pimpinan/panitia admisi (Modul 4):
- `id`: string
- `registration_id`: string
- `student_id`: string
- `student_name`: string
- `decision_status`: string (`'Diterima'`, `'Menunggu Diskusi'`, `'Perlu Observasi Lanjutan'`, `'Daftar Tunggu'`, `'Rujukan Luar'`, `'Ditolak'`)
- `decision_date`: string
- `decision_maker`: string
- `decision_maker_role`: string
- `decision_notes`: string
- `recommended_program`: string
- `follow_up_action`: string
- `target_entry_term`: string

#### 11. `staff_users` (`/staff_users/{userId}`)
Akun staf dan pembagian wewenang role-based:
- `id`: string
- `full_name`: string
- `email`: string
- `role`: string (`'admin'`, `'principal'`, `'observer'`, `'staff'`)
- `role_title`: string
- `is_active`: boolean
- `assigned_student_count`: number

#### 12. `audit_logs` (`/audit_logs/{logId}`)
Jejak audit keamanan tidak dapat diubah (immutable):
- `id`: string
- `timestamp`: ISO 8601 string
- `actor_name`: string
- `actor_role`: string
- `action_type`: string (`USER_LOGIN`, `USER_CREATE`, `USER_ROLE_UPDATE`, `REPORT_APPROVED`, `ADMISSION_DECISION`, `DATA_EXPORT`, dll.)
- `record_type`: string
- `record_id`: string
- `details`: string
- `security_hash`: string

---

### Keamanan dan Aturan Akses (Security Rules)
Aturan keamanan didefinisikan secara deklaratif di `firestore.rules` dan telah dideploy secara otomatis ke Firebase Cloud:
1. Prinsip *Default-Deny*: Semua dokumen tertutup kecuali yang memiliki izin eksplisit.
2. Perlindungan Data Anak: Laporan diagnostik, lembar observasi, dan keputusan admisi hanya dapat diakses oleh staf terotentikasi (`isAdmin()`).
3. Imutabilitas Jejak Audit: Koleksi `/audit_logs/` mengizinkan pembuatan log baru, tetapi melarang keras tindakan perbaruan (`update`) dan penghapusan (`delete`).

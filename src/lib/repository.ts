import { 
  Registration, 
  Student, 
  Guardian, 
  ConsentRecord, 
  ObservationAppointment, 
  SchoolSettings,
  RegistrationStatus,
  AppointmentStatus,
  UserProfile
} from '../types/database';
import { DEFAULT_SCHOOL_SETTINGS, TIME_SLOTS, OBSERVATION_ROOMS } from './constants';
import { generateRegistrationNumber } from './utils';
import { firebaseService, testFirestoreConnection } from './firebase';

import { ObservationSession, ObservationItem } from '../types/observation';
import { DEFAULT_OBSERVATION_ITEMS } from './observationData';
import { ObservationReport, LearningRecommendation, ReportVersion, ReportReviewLog } from '../types/report';
import { StaffUser, AdmissionDecision, AuditLogEntry } from '../types/admin';
import { AuditLogger } from './auditLogger';

// Automatically test Firestore connection on boot
testFirestoreConnection();

// Local storage keys for persistent fallback repository
const STORAGE_KEYS = {
  REGISTRATIONS: 'lss_registrations_v1',
  STUDENTS: 'lss_students_v1',
  GUARDIANS: 'lss_guardians_v1',
  APPOINTMENTS: 'lss_appointments_v1',
  CONSENTS: 'lss_consents_v1',
  SETTINGS: 'lss_settings_v1',
  COUNTER: 'lss_counter_v1',
  CURRENT_USER: 'lss_current_user_v1',
  OBSERVATION_SESSIONS: 'lss_obs_sessions_v1',
  OBSERVATION_ITEMS: 'lss_obs_items_v1',
  OBSERVATION_REPORTS: 'lss_obs_reports_v1',
  LEARNING_RECOMMENDATIONS: 'lss_learning_recs_v1',
  STAFF_USERS: 'lss_staff_users_v1',
  ADMISSION_DECISIONS: 'lss_admission_decisions_v1',
};

// Realistic initial seed data for development and preview demonstration
const INITIAL_STUDENTS: Student[] = [
  {
    id: 'std-001',
    full_name: 'Muhammad Rayyan Al-Farizi',
    preferred_name: 'Rayyan',
    birth_place: 'Pamekasan',
    birth_date: '2021-04-12',
    calculated_age: '5 tahun 6 bulan',
    gender: 'Laki-laki',
    address: 'Jl. Jokotole No. 45, Barurambat Kota, Pamekasan',
    previous_education: 'Pernah PAUD 6 bulan, sering merasa kewalahan di kelas ramai',
    created_at: '2026-10-18T09:30:00Z',
    updated_at: '2026-10-18T09:30:00Z',
  },
  {
    id: 'std-002',
    full_name: 'Alya Salsabila Putri',
    preferred_name: 'Alya',
    birth_place: 'Sampang',
    birth_date: '2022-01-20',
    calculated_age: '4 tahun 9 bulan',
    gender: 'Perempuan',
    address: 'Jl. Segara No. 12, Pamekasan',
    previous_education: 'Belum pernah sekolah formal',
    created_at: '2026-10-19T14:15:00Z',
    updated_at: '2026-10-19T14:15:00Z',
  },
  {
    id: 'std-003',
    full_name: 'Kenzo Alvaro Pratama',
    preferred_name: 'Kenzo',
    birth_place: 'Pamekasan',
    birth_date: '2020-08-05',
    calculated_age: '6 tahun 2 bulan',
    gender: 'Laki-laki',
    address: 'Desa Pademawu Barat, Kec. Pademawu, Pamekasan',
    previous_education: 'TK A di Pamekasan, disarankan guru untuk observasi tumbuh kembang',
    created_at: '2026-10-20T10:00:00Z',
    updated_at: '2026-10-20T10:00:00Z',
  },
];

const INITIAL_GUARDIANS: Guardian[] = [
  {
    id: 'grd-001',
    full_name: 'Budi Santoso, S.T.',
    relationship: 'Ayah',
    phone_number: '081234567801',
    whatsapp_number: '6281234567801',
    email: 'budi.santoso@example.com',
    emergency_contact_name: 'Siti Rahmawati (Ibu)',
    emergency_contact_phone: '081234567802',
    created_at: '2026-10-18T09:30:00Z',
    updated_at: '2026-10-18T09:30:00Z',
  },
  {
    id: 'grd-002',
    full_name: 'Nurul Hidayati',
    relationship: 'Ibu',
    phone_number: '085712349911',
    whatsapp_number: '6285712349911',
    email: 'nurul.hidayati@example.com',
    emergency_contact_name: 'Drs. Supriyanto (Kakek)',
    emergency_contact_phone: '081399887766',
    created_at: '2026-10-19T14:15:00Z',
    updated_at: '2026-10-19T14:15:00Z',
  },
  {
    id: 'grd-003',
    full_name: 'Fandi Kurniawan',
    relationship: 'Ayah',
    phone_number: '087811223344',
    whatsapp_number: '6287811223344',
    email: 'fandi.k@example.com',
    emergency_contact_name: 'Lestari Handayani (Ibu)',
    emergency_contact_phone: '087811223345',
    created_at: '2026-10-20T10:00:00Z',
    updated_at: '2026-10-20T10:00:00Z',
  },
];

const INITIAL_REGISTRATIONS: Registration[] = [
  {
    id: 'reg-001',
    registration_number: 'LSS-2026-0001',
    student_id: 'std-001',
    guardian_id: 'grd-001',
    status: 'Jadwal Terkonfirmasi',
    submission_date: '2026-10-18T09:30:00Z',
    developmental_background: {
      strengths_and_interests: 'Sangat menyukai puzzle angka, menyusun balok lego dengan rapi, dan senang alunan musik klasik',
      communication_method: ['Kata tunggal', 'Bahasa Isyarat/Gestur'],
      daily_living_skills: {
        eating: 'Mandiri',
        toileting: 'Perlu Diingatkan',
        dressing: 'Bantuan Sebagian',
        notes: 'Kadang kesulitan memakai kancing baju sendiri',
      },
      social_interaction: 'Lebih senang bermain sendiri (parallel play), kontak mata singkat namun merespons saat dipanggil namanya',
      sensory_preferences: ['Sensitif suara bising', 'Pencarian gerak/vestibular'],
      previous_therapy_support: ['Terapi Wicara', 'Sensori Integrasi (SI)'],
      developmental_history: 'Lahir cukup bulan secara caesar. Mulai berjalan usia 14 bulan. Kosakata aktif terlambat muncul pada usia 2.5 tahun.',
      parent_concerns_expectations: 'Ingin Rayyan lebih nyaman berinteraksi di lingkungan sosial dan menambah kemampuan komunikasi dua arah.',
      has_professional_assessment: true,
      professional_assessment_details: 'Diagnosis awal Speech Delay & Suspek ASD dari Dokter Spesialis Tumbuh Kembang Anak RSUD Smart Pamekasan (Juni 2026)',
    },
    admin_notes: 'Berkas lengkap. Orang tua ramah dan sangat kooperatif. Ruang sensori disiapkan minim distraksi audio.',
    created_at: '2026-10-18T09:30:00Z',
    updated_at: '2026-10-19T10:00:00Z',
  },
  {
    id: 'reg-002',
    registration_number: 'LSS-2026-0002',
    student_id: 'std-002',
    guardian_id: 'grd-002',
    status: 'Menunggu Jadwal',
    submission_date: '2026-10-19T14:15:00Z',
    developmental_background: {
      strengths_and_interests: 'Senang mewarnai dengan jari, mendengarkan dongeng bergambar, dan sangat peka terhadap nada suara',
      communication_method: ['PECS/Visual', 'Bahasa Isyarat/Gestur'],
      daily_living_skills: {
        eating: 'Bantuan Sebagian',
        toileting: 'Memakai Popok/Bantuan Penuh',
        dressing: 'Bantuan Penuh',
        notes: 'Sedang proses toilet training mandiri',
      },
      social_interaction: 'Sangat menyayangi orang terdekat, cemas saat bertemu orang asing di 15 menit pertama',
      sensory_preferences: ['Sensitif sentuhan/tekstur', 'Pilih-pilih makanan (picky eating)'],
      previous_therapy_support: ['Terapi Okupasi'],
      developmental_history: 'Lahir premature 35 minggu. Berat badan lahir 2.1 kg. Sudah mengejar milestone motorik kasar dengan baik.',
      parent_concerns_expectations: 'Harapan kami Alya mendapatkan pendampingan sensori dan stimulasi komunikasi yang tepat sejak dini.',
      has_professional_assessment: false,
    },
    admin_notes: 'Menunggu konfirmasi ketersediaan orang tua di sesi hari Sabtu pagi.',
    created_at: '2026-10-19T14:15:00Z',
    updated_at: '2026-10-19T14:15:00Z',
  },
  {
    id: 'reg-003',
    registration_number: 'LSS-2026-0003',
    student_id: 'std-003',
    guardian_id: 'grd-003',
    status: 'Pendaftaran Baru',
    submission_date: '2026-10-20T10:00:00Z',
    developmental_background: {
      strengths_and_interests: 'Sangat aktif secara fisik, mahir berlari dan memanjat, antusias dengan kendaraan mobil dan roda',
      communication_method: ['Verbal lancar'],
      daily_living_skills: {
        eating: 'Mandiri',
        toileting: 'Mandiri',
        dressing: 'Mandiri',
        notes: 'Mandiri dalam rutinitas makan dan toilet',
      },
      social_interaction: 'Sangat antusias dengan teman sebaya tetapi kesulitan menunggu giliran dan mudah terdistraksi',
      sensory_preferences: ['Pencarian gerak/vestibular'],
      previous_therapy_support: ['Belum Pernah Terapi'],
      developmental_history: 'Tumbuh kembang fisik sesuai usia. Konsentrasi rentang pendek saat diminta duduk tenang.',
      parent_concerns_expectations: 'Kekhawatiran regulasi emosi saat di kelas sekolah dasar. Kami ingin rekomendasi strategi fokus yang positif.',
      has_professional_assessment: false,
    },
    created_at: '2026-10-20T10:00:00Z',
    updated_at: '2026-10-20T10:00:00Z',
  },
];

const INITIAL_APPOINTMENTS: ObservationAppointment[] = [
  {
    id: 'apt-001',
    registration_id: 'reg-001',
    appointment_date: '2026-10-24', // Saturday
    time_slot: '08:30 - 10:00 WIB',
    location_room: 'Ruang Sensori & Gerak',
    observer_id: 'obs-01',
    observer_name: 'Rina Kusumawati, S.Psi., M.Psi., Psikolog',
    status: 'Dikonfirmasi',
    notes: 'Sesi ramah anak disiapkan dengan mainan visual puzzle dan sensorik lembut.',
    created_at: '2026-10-19T10:00:00Z',
    updated_at: '2026-10-19T10:00:00Z',
  },
];

const INITIAL_CONSENTS: ConsentRecord[] = [
  {
    id: 'cst-001',
    registration_id: 'reg-001',
    guardian_name: 'Budi Santoso, S.T.',
    consent_observation: true,
    consent_privacy_policy: true,
    data_accuracy_confirmed: true,
    consented_at: '2026-10-18T09:30:00Z',
  },
  {
    id: 'cst-002',
    registration_id: 'reg-002',
    guardian_name: 'Nurul Hidayati',
    consent_observation: true,
    consent_privacy_policy: true,
    data_accuracy_confirmed: true,
    consented_at: '2026-10-19T14:15:00Z',
  },
  {
    id: 'cst-003',
    registration_id: 'reg-003',
    guardian_name: 'Fandi Kurniawan',
    consent_observation: true,
    consent_privacy_policy: true,
    data_accuracy_confirmed: true,
    consented_at: '2026-10-20T10:00:00Z',
  },
];

const INITIAL_STAFF_USERS: StaffUser[] = [
  {
    id: 'usr-admin-01',
    full_name: 'Dra. Hj. Siti Fatimah, M.Pd.',
    email: 'admin@littlestarpamekasan.sch.id',
    role: 'admin',
    role_title: 'Super Administrator & IT Koordinator',
    phone: '082199988769',
    is_active: true,
    assigned_student_count: 0,
    last_login_at: '2026-10-21T08:00:00Z',
    created_at: '2026-10-01T00:00:00Z',
    updated_at: '2026-10-21T08:00:00Z',
  },
  {
    id: 'usr-principal-01',
    full_name: 'Dra. Hj. Nurul Hidayati',
    email: 'kepsek@littlestarpamekasan.sch.id',
    role: 'principal',
    role_title: 'Kepala Sekolah Little Star School',
    phone: '081234567891',
    is_active: true,
    assigned_student_count: 0,
    last_login_at: '2026-10-21T09:30:00Z',
    created_at: '2026-10-01T00:00:00Z',
    updated_at: '2026-10-21T09:30:00Z',
  },
  {
    id: 'obs-01',
    full_name: 'Rina Kusumawati, S.Psi., M.Psi., Psikolog',
    email: 'rina.observer@littlestarpamekasan.sch.id',
    role: 'observer',
    role_title: 'Psikolog Perkembangan & Guru Observer',
    phone: '085233445566',
    is_active: true,
    assigned_student_count: 2,
    last_login_at: '2026-10-21T11:45:00Z',
    created_at: '2026-10-01T00:00:00Z',
    updated_at: '2026-10-21T11:45:00Z',
  },
  {
    id: 'obs-02',
    full_name: 'Ahmad Fauzi, S.Pd., Gr.',
    email: 'fauzi.observer@littlestarpamekasan.sch.id',
    role: 'observer',
    role_title: 'Spesialis Pendidikan Khusus (ABK)',
    phone: '087812345678',
    is_active: true,
    assigned_student_count: 1,
    last_login_at: '2026-10-20T16:00:00Z',
    created_at: '2026-10-01T00:00:00Z',
    updated_at: '2026-10-20T16:00:00Z',
  },
  {
    id: 'obs-03',
    full_name: 'Dewi Anggraini, A.Md.OT',
    email: 'dewi.terapis@littlestarpamekasan.sch.id',
    role: 'observer',
    role_title: 'Terapis Okupasi & Sensori Integrasi',
    phone: '081987654321',
    is_active: true,
    assigned_student_count: 1,
    last_login_at: '2026-10-19T14:00:00Z',
    created_at: '2026-10-01T00:00:00Z',
    updated_at: '2026-10-19T14:00:00Z',
  },
  {
    id: 'usr-staff-01',
    full_name: 'Siti Aminah, S.Kom.',
    email: 'admisi@littlestarpamekasan.sch.id',
    role: 'staff',
    role_title: 'Staf Administrasi & Pendaftaran Siswa',
    phone: '082199988769',
    is_active: true,
    assigned_student_count: 0,
    last_login_at: '2026-10-21T13:10:00Z',
    created_at: '2026-10-01T00:00:00Z',
    updated_at: '2026-10-21T13:10:00Z',
  },
];

const INITIAL_ADMISSION_DECISIONS: AdmissionDecision[] = [
  {
    id: 'adm-dec-001',
    registration_id: 'reg-001',
    student_id: 'std-001',
    student_name: 'Muhammad Rayyan Al-Farizi',
    decision_status: 'Diterima',
    decision_date: '2026-10-21',
    decision_maker: 'Dra. Hj. Nurul Hidayati (Kepala Sekolah)',
    decision_maker_role: 'principal',
    decision_notes: 'Berdasarkan hasil observasi dan wawancara orang tua, ananda memiliki kemandirian dasar baik dan fokus visual kuat. Direkomendasikan masuk kelas transisi dengan akomodasi sensori suara dan bimbingan interaksi bergantian.',
    recommended_program: 'Kelas Transisi Mandiri & Pengayaan Sensori',
    follow_up_action: 'Konsultasi bersama orang tua dijadwalkan tanggal 26 Oktober 2026 untuk penandatanganan kesepakatan PPI Awal.',
    target_entry_term: 'Semester Ganjil 2026/2027',
    created_at: '2026-10-21T14:35:00Z',
    updated_at: '2026-10-21T14:35:00Z',
  },
];

// In-Memory & LocalStorage Data Access Layer (Repository Pattern)
class DataRepository {
  private getStorage<T>(key: string, defaultVal: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) {
        localStorage.setItem(key, JSON.stringify(defaultVal));
        return defaultVal;
      }
      return JSON.parse(data);
    } catch {
      return defaultVal;
    }
  }

  private setStorage<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('Storage set failed', e);
    }
  }

  public getSettings(): SchoolSettings {
    return this.getStorage<SchoolSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SCHOOL_SETTINGS);
  }

  public updateSettings(settings: Partial<SchoolSettings>): SchoolSettings {
    const current = this.getSettings();
    const updated = { ...current, ...settings, updated_at: new Date().toISOString() };
    this.setStorage(STORAGE_KEYS.SETTINGS, updated);
    firebaseService.saveSchoolSettings(updated).catch(console.warn);
    return updated;
  }

  public getRegistrations(): Registration[] {
    const registrations = this.getStorage<Registration[]>(STORAGE_KEYS.REGISTRATIONS, INITIAL_REGISTRATIONS);
    const students = this.getStorage<Student[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    const guardians = this.getStorage<Guardian[]>(STORAGE_KEYS.GUARDIANS, INITIAL_GUARDIANS);
    const appointments = this.getStorage<ObservationAppointment[]>(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
    const consents = this.getStorage<ConsentRecord[]>(STORAGE_KEYS.CONSENTS, INITIAL_CONSENTS);

    // Join entities
    return registrations.map(reg => ({
      ...reg,
      student: students.find(s => s.id === reg.student_id),
      guardian: guardians.find(g => g.id === reg.guardian_id),
      appointment: appointments.find(a => a.registration_id === reg.id),
      consent: consents.find(c => c.registration_id === reg.id),
    }));
  }

  public getRegistrationById(idOrNumber: string): Registration | null {
    const all = this.getRegistrations();
    return all.find(r => r.id === idOrNumber || r.registration_number === idOrNumber) || null;
  }

  public async submitNewRegistration(payload: {
    student: Omit<Student, 'id' | 'created_at' | 'updated_at'>;
    guardian: Omit<Guardian, 'id' | 'created_at' | 'updated_at'>;
    developmental: Registration['developmental_background'];
    consent: {
      consent_observation: boolean;
      consent_privacy_policy: boolean;
      data_accuracy_confirmed: boolean;
    };
  }): Promise<Registration> {
    const counter = this.getStorage<number>(STORAGE_KEYS.COUNTER, 4);
    const registrationNumber = generateRegistrationNumber(counter);
    this.setStorage(STORAGE_KEYS.COUNTER, counter + 1);

    const now = new Date().toISOString();
    const studentId = `std-${Date.now()}`;
    const guardianId = `grd-${Date.now()}`;
    const registrationId = `reg-${Date.now()}`;
    const consentId = `cst-${Date.now()}`;

    const newStudent: Student = {
      ...payload.student,
      id: studentId,
      created_at: now,
      updated_at: now,
    };

    const newGuardian: Guardian = {
      ...payload.guardian,
      id: guardianId,
      created_at: now,
      updated_at: now,
    };

    const newRegistration: Registration = {
      id: registrationId,
      registration_number: registrationNumber,
      student_id: studentId,
      guardian_id: guardianId,
      status: 'Pendaftaran Baru',
      submission_date: now,
      developmental_background: payload.developmental,
      created_at: now,
      updated_at: now,
    };

    const newConsent: ConsentRecord = {
      id: consentId,
      registration_id: registrationId,
      guardian_name: payload.guardian.full_name,
      consent_observation: payload.consent.consent_observation,
      consent_privacy_policy: payload.consent.consent_privacy_policy,
      data_accuracy_confirmed: payload.consent.data_accuracy_confirmed,
      consented_at: now,
    };

    // Save to persistent storage
    const students = this.getStorage<Student[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    const guardians = this.getStorage<Guardian[]>(STORAGE_KEYS.GUARDIANS, INITIAL_GUARDIANS);
    const registrations = this.getStorage<Registration[]>(STORAGE_KEYS.REGISTRATIONS, INITIAL_REGISTRATIONS);
    const consents = this.getStorage<ConsentRecord[]>(STORAGE_KEYS.CONSENTS, INITIAL_CONSENTS);

    this.setStorage(STORAGE_KEYS.STUDENTS, [newStudent, ...students]);
    this.setStorage(STORAGE_KEYS.GUARDIANS, [newGuardian, ...guardians]);
    this.setStorage(STORAGE_KEYS.REGISTRATIONS, [newRegistration, ...registrations]);
    this.setStorage(STORAGE_KEYS.CONSENTS, [newConsent, ...consents]);

    // Asynchronously push to Firebase Firestore
    firebaseService.createStudent(newStudent).catch(console.warn);
    firebaseService.createGuardian(newGuardian).catch(console.warn);
    firebaseService.createRegistration(newRegistration).catch(console.warn);
    firebaseService.createConsent(newConsent).catch(console.warn);

    // Return joined object
    return {
      ...newRegistration,
      student: newStudent,
      guardian: newGuardian,
      consent: newConsent,
    };
  }

  public updateRegistrationStatus(id: string, status: RegistrationStatus, adminNotes?: string): Registration | null {
    const registrations = this.getStorage<Registration[]>(STORAGE_KEYS.REGISTRATIONS, INITIAL_REGISTRATIONS);
    const index = registrations.findIndex(r => r.id === id);
    if (index === -1) return null;

    registrations[index].status = status;
    if (adminNotes !== undefined) {
      registrations[index].admin_notes = adminNotes;
    }
    registrations[index].updated_at = new Date().toISOString();
    this.setStorage(STORAGE_KEYS.REGISTRATIONS, registrations);

    firebaseService.updateRegistrationStatus(id, status, adminNotes).catch(console.warn);

    return this.getRegistrationById(id);
  }

  public scheduleAppointment(payload: {
    registration_id: string;
    appointment_date: string;
    time_slot: string;
    location_room: string;
    observer_id?: string;
    observer_name?: string;
    notes?: string;
  }): { success: boolean; appointment?: ObservationAppointment; error?: string } {
    const appointments = this.getStorage<ObservationAppointment[]>(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);

    // Double-booking check: same date, same time slot, same room
    const conflict = appointments.find(
      a =>
        a.appointment_date === payload.appointment_date &&
        a.time_slot === payload.time_slot &&
        a.location_room === payload.location_room &&
        a.status !== 'Dibatalkan' &&
        a.registration_id !== payload.registration_id
    );

    if (conflict) {
      return {
        success: false,
        error: `Slot jadwal tersebut pada ${payload.location_room} sudah terisi oleh pendaftar lain. Silakan pilih waktu atau ruangan lain.`,
      };
    }

    const now = new Date().toISOString();
    const existingIndex = appointments.findIndex(a => a.registration_id === payload.registration_id);

    let apt: ObservationAppointment;
    if (existingIndex >= 0) {
      // Rescheduling existing
      apt = {
        ...appointments[existingIndex],
        ...payload,
        status: 'Dikonfirmasi',
        updated_at: now,
      };
      appointments[existingIndex] = apt;
    } else {
      // New appointment
      apt = {
        id: `apt-${Date.now()}`,
        registration_id: payload.registration_id,
        appointment_date: payload.appointment_date,
        time_slot: payload.time_slot,
        location_room: payload.location_room,
        observer_id: payload.observer_id,
        observer_name: payload.observer_name,
        status: 'Dikonfirmasi',
        notes: payload.notes,
        created_at: now,
        updated_at: now,
      };
      appointments.push(apt);
    }

    this.setStorage(STORAGE_KEYS.APPOINTMENTS, appointments);
    firebaseService.saveAppointment(apt).catch(console.warn);

    // Automatically update registration status to "Jadwal Terkonfirmasi"
    this.updateRegistrationStatus(payload.registration_id, 'Jadwal Terkonfirmasi');

    return { success: true, appointment: apt };
  }

  public cancelAppointment(registrationId: string, reason?: string): boolean {
    const appointments = this.getStorage<ObservationAppointment[]>(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
    const existingIndex = appointments.findIndex(a => a.registration_id === registrationId);
    if (existingIndex < 0) return false;

    appointments[existingIndex].status = 'Dibatalkan';
    if (reason) {
      appointments[existingIndex].notes = `${appointments[existingIndex].notes || ''} [Dibatalkan: ${reason}]`;
    }
    appointments[existingIndex].updated_at = new Date().toISOString();
    this.setStorage(STORAGE_KEYS.APPOINTMENTS, appointments);

    this.updateRegistrationStatus(registrationId, 'Menunggu Jadwal');
    return true;
  }

  public getCurrentUser(): UserProfile | null {
    return this.getStorage<UserProfile | null>(STORAGE_KEYS.CURRENT_USER, {
      id: 'usr-admin-01',
      email: 'admin@littlestarschool.sch.id',
      full_name: 'Dra. Hj. Nurul Komariyah',
      role: 'admin',
      created_at: '2026-01-01T00:00:00Z',
    });
  }

  public setCurrentUser(user: UserProfile | null): void {
    this.setStorage(STORAGE_KEYS.CURRENT_USER, user);
  }

  // --- MODULE 2: OBSERVATION METHODS ---

  public getObservationItems(): ObservationItem[] {
    return this.getStorage<ObservationItem[]>(STORAGE_KEYS.OBSERVATION_ITEMS, DEFAULT_OBSERVATION_ITEMS);
  }

  public saveObservationItem(item: ObservationItem): ObservationItem {
    const items = this.getObservationItems();
    const index = items.findIndex(i => i.id === item.id);
    if (index >= 0) {
      items[index] = item;
    } else {
      items.push(item);
    }
    this.setStorage(STORAGE_KEYS.OBSERVATION_ITEMS, items);
    return item;
  }

  public deleteObservationItem(itemId: string): boolean {
    const items = this.getObservationItems();
    const updated = items.filter(i => i.id !== itemId);
    this.setStorage(STORAGE_KEYS.OBSERVATION_ITEMS, updated);
    return true;
  }

  public getObservationSessions(studentId?: string): ObservationSession[] {
    const sessions = this.getStorage<ObservationSession[]>(STORAGE_KEYS.OBSERVATION_SESSIONS, INITIAL_OBSERVATION_SESSIONS);
    if (studentId) {
      return sessions.filter(s => s.student_id === studentId);
    }
    return sessions;
  }

  public getObservationSessionById(id: string): ObservationSession | null {
    const sessions = this.getObservationSessions();
    return sessions.find(s => s.id === id) || null;
  }

  public saveObservationSession(session: ObservationSession): ObservationSession {
    const sessions = this.getObservationSessions();
    const index = sessions.findIndex(s => s.id === session.id);
    const now = new Date().toISOString();
    const updatedSession = { ...session, updated_at: now };

    if (index >= 0) {
      sessions[index] = updatedSession;
    } else {
      sessions.unshift(updatedSession);
    }

    this.setStorage(STORAGE_KEYS.OBSERVATION_SESSIONS, sessions);

    // Sync to Firebase
    firebaseService.saveObservationSession(updatedSession).catch(console.warn);

    return updatedSession;
  }

  public reviewObservationSession(sessionId: string, notes: string, reviewerName: string): ObservationSession | null {
    const sessions = this.getObservationSessions();
    const index = sessions.findIndex(s => s.id === sessionId);
    if (index < 0) return null;

    const session = sessions[index];
    session.status = 'Disetujui Kepala Sekolah';
    session.headmaster_review_notes = notes;
    session.reviewed_by = reviewerName;
    session.reviewed_at = new Date().toISOString();
    session.updated_at = new Date().toISOString();

    sessions[index] = session;
    this.setStorage(STORAGE_KEYS.OBSERVATION_SESSIONS, sessions);
    firebaseService.saveObservationSession(session).catch(console.warn);

    return session;
  }

  // --- MODULE 3: OBSERVATION REPORTS & LEARNING RECOMMENDATIONS ---

  public getObservationReports(studentId?: string): ObservationReport[] {
    const reports = this.getStorage<ObservationReport[]>(STORAGE_KEYS.OBSERVATION_REPORTS, INITIAL_OBSERVATION_REPORTS);
    if (studentId) {
      return reports.filter(r => r.student_id === studentId);
    }
    return reports;
  }

  public getObservationReportById(id: string): ObservationReport | null {
    const reports = this.getObservationReports();
    return reports.find(r => r.id === id) || null;
  }

  public getObservationReportBySessionId(sessionId: string): ObservationReport | null {
    const reports = this.getObservationReports();
    return reports.find(r => r.session_id === sessionId) || null;
  }

  public saveObservationReport(
    report: ObservationReport, 
    changeSummary: string = 'Pembaruan data laporan observasi',
    authorName: string = 'Staf Pengajar',
    authorRole: string = 'observer'
  ): ObservationReport {
    const reports = this.getObservationReports();
    const index = reports.findIndex(r => r.id === report.id);
    const now = new Date().toISOString();

    let updatedReport: ObservationReport;

    if (index >= 0) {
      const existing = reports[index];
      const isPostApprovalEdit = existing.status === 'Disetujui Kepala Sekolah';
      const newVersionNum = isPostApprovalEdit ? existing.current_version + 1 : existing.current_version;

      const newVersion: ReportVersion = {
        version_number: newVersionNum,
        created_at: now,
        created_by_name: authorName,
        created_by_role: authorRole,
        change_summary: isPostApprovalEdit ? `[Revisi Pasca-Persetujuan] ${changeSummary}` : changeSummary,
        snapshot: JSON.parse(JSON.stringify(report)),
      };

      const existingVersions = existing.versions || [];
      const updatedVersions = isPostApprovalEdit ? [newVersion, ...existingVersions] : existingVersions;

      updatedReport = {
        ...report,
        current_version: newVersionNum,
        versions: updatedVersions,
        updated_at: now,
      };
      reports[index] = updatedReport;
    } else {
      updatedReport = {
        ...report,
        created_at: now,
        updated_at: now,
      };
      reports.unshift(updatedReport);
    }

    this.setStorage(STORAGE_KEYS.OBSERVATION_REPORTS, reports);
    firebaseService.saveObservationReport(updatedReport).catch(console.warn);

    return updatedReport;
  }

  public getLearningRecommendations(reportId: string): LearningRecommendation[] {
    const all = this.getStorage<LearningRecommendation[]>(STORAGE_KEYS.LEARNING_RECOMMENDATIONS, INITIAL_LEARNING_RECOMMENDATIONS);
    return all.filter(r => r.report_id === reportId).sort((a, b) => a.order_index - b.order_index);
  }

  public saveLearningRecommendations(reportId: string, recs: LearningRecommendation[]): LearningRecommendation[] {
    const all = this.getStorage<LearningRecommendation[]>(STORAGE_KEYS.LEARNING_RECOMMENDATIONS, INITIAL_LEARNING_RECOMMENDATIONS);
    const others = all.filter(r => r.report_id !== reportId);
    const merged = [...others, ...recs];
    this.setStorage(STORAGE_KEYS.LEARNING_RECOMMENDATIONS, merged);

    recs.forEach(rec => {
      firebaseService.saveLearningRecommendation(rec).catch(console.warn);
    });

    return recs;
  }

  public reviewReport(
    reportId: string,
    action: 'submit' | 'request_revision' | 'approve',
    notes: string,
    reviewerName: string,
    reviewerRole: string
  ): ObservationReport | null {
    const reports = this.getObservationReports();
    const index = reports.findIndex(r => r.id === reportId);
    if (index < 0) return null;

    const report = reports[index];
    const now = new Date().toISOString();

    const reviewLog: ReportReviewLog = {
      id: `rev-${Date.now()}`,
      report_id: reportId,
      reviewer_name: reviewerName,
      reviewer_role: reviewerRole,
      action,
      notes,
      timestamp: now,
    };

    report.review_logs = [reviewLog, ...(report.review_logs || [])];

    if (action === 'submit') {
      report.status = 'Diajukan untuk Telaah';
    } else if (action === 'request_revision') {
      report.status = 'Perlu Revisi';
      report.revision_requested_notes = notes;
    } else if (action === 'approve') {
      report.status = 'Disetujui Kepala Sekolah';
      report.headmaster_name = reviewerName;
      report.headmaster_approved_at = now;
      report.headmaster_approval_notes = notes;

      // Synchronize linked session status
      this.reviewObservationSession(report.session_id, notes, reviewerName);
    }

    report.updated_at = now;
    reports[index] = report;
    this.setStorage(STORAGE_KEYS.OBSERVATION_REPORTS, reports);
    firebaseService.saveObservationReport(report).catch(console.warn);

    AuditLogger.log(
      action === 'approve' ? 'REPORT_APPROVED' : action === 'request_revision' ? 'REPORT_REVISION' : 'REPORT_SUBMIT',
      'Laporan',
      reportId,
      `Telaah laporan: status diubah menjadi "${report.status}" oleh ${reviewerName} (${reviewerRole}). Catatan: ${notes || '-'}`,
      reviewerName,
      (reviewerRole === 'principal' ? 'principal' : reviewerRole === 'observer' ? 'observer' : 'admin')
    );

    return report;
  }

  // ==========================================
  // MODULE 4: USER & STAFF MANAGEMENT
  // ==========================================
  public getStaffUsers(): StaffUser[] {
    return this.getStorage<StaffUser[]>(STORAGE_KEYS.STAFF_USERS, INITIAL_STAFF_USERS);
  }

  public saveStaffUser(user: StaffUser, actorName: string = 'Super Admin'): StaffUser {
    const users = this.getStaffUsers();
    const existingIndex = users.findIndex(u => u.id === user.id);
    const now = new Date().toISOString();

    let savedUser: StaffUser;
    if (existingIndex >= 0) {
      savedUser = { ...user, updated_at: now };
      users[existingIndex] = savedUser;
      AuditLogger.log('USER_ROLE_UPDATE', 'Pengguna', savedUser.id, `Memperbarui akun staf: ${savedUser.full_name} (${savedUser.role_title}, peran: ${savedUser.role})`, actorName, 'admin');
    } else {
      savedUser = {
        ...user,
        id: user.id || `usr-${Date.now()}`,
        created_at: now,
        updated_at: now,
      };
      users.push(savedUser);
      AuditLogger.log('USER_CREATE', 'Pengguna', savedUser.id, `Membuat akun staf baru: ${savedUser.full_name} sebagai ${savedUser.role_title}`, actorName, 'admin');
    }

    this.setStorage(STORAGE_KEYS.STAFF_USERS, users);
    firebaseService.saveStaffUser(savedUser).catch(console.warn);
    return savedUser;
  }

  public toggleStaffUserStatus(userId: string, actorName: string = 'Super Admin'): StaffUser | null {
    const users = this.getStaffUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index < 0) return null;

    users[index].is_active = !users[index].is_active;
    users[index].updated_at = new Date().toISOString();
    this.setStorage(STORAGE_KEYS.STAFF_USERS, users);
    firebaseService.saveStaffUser(users[index]).catch(console.warn);

    AuditLogger.log(
      'USER_STATUS_TOGGLE',
      'Pengguna',
      userId,
      `Status akun ${users[index].full_name} diubah menjadi: ${users[index].is_active ? 'AKTIF' : 'NONAKTIF'}`,
      actorName,
      'admin'
    );

    return users[index];
  }

  public resetStaffPassword(userId: string, actorName: string = 'Super Admin'): { success: boolean; tempPasswordCode: string } {
    const users = this.getStaffUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return { success: false, tempPasswordCode: '' };

    const tempPasswordCode = `LSS-${Math.floor(100000 + Math.random() * 900000)}`;
    AuditLogger.log(
      'PASSWORD_RESET',
      'Pengguna',
      userId,
      `Inisiasi reset password sementara untuk ${user.full_name} (${user.email}). Kode reset sementara diterbitkan.`,
      actorName,
      'admin'
    );

    return { success: true, tempPasswordCode };
  }

  public assignObserverToStudent(
    registrationId: string,
    observerId: string,
    observerName: string,
    actorName: string = 'Staf Pendaftaran'
  ): boolean {
    const appointments = this.getStorage<ObservationAppointment[]>(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
    const aptIndex = appointments.findIndex(a => a.registration_id === registrationId);

    if (aptIndex >= 0) {
      appointments[aptIndex].observer_id = observerId;
      appointments[aptIndex].observer_name = observerName;
      appointments[aptIndex].updated_at = new Date().toISOString();
      this.setStorage(STORAGE_KEYS.APPOINTMENTS, appointments);

      // Also update linked observation session observer if one exists
      const sessions = this.getObservationSessions();
      const sess = sessions.find(s => s.registration_id === registrationId);
      if (sess) {
        sess.observer_id = observerId;
        sess.observer_name = observerName;
        sess.updated_at = new Date().toISOString();
        this.saveObservationSession(sess);
      }

      AuditLogger.log(
        'SCHEDULE_UPDATE',
        'Jadwal',
        registrationId,
        `Penetapan Guru Observer: ${observerName} ditugaskan untuk pendaftaran ${registrationId}.`,
        actorName,
        'staff'
      );
      return true;
    }
    return false;
  }

  // ==========================================
  // MODULE 4: ADMISSION DECISIONS MANAGEMENT
  // ==========================================
  public getAdmissionDecisions(): AdmissionDecision[] {
    return this.getStorage<AdmissionDecision[]>(STORAGE_KEYS.ADMISSION_DECISIONS, INITIAL_ADMISSION_DECISIONS);
  }

  public getAdmissionDecisionByRegistrationId(regId: string): AdmissionDecision | null {
    const all = this.getAdmissionDecisions();
    return all.find(d => d.registration_id === regId) || null;
  }

  public saveAdmissionDecision(
    payload: Omit<AdmissionDecision, 'id' | 'created_at' | 'updated_at'> & { id?: string },
    actorName: string = 'Dra. Hj. Nurul Hidayati (Kepala Sekolah)',
    actorRole: 'principal' | 'admin' = 'principal'
  ): AdmissionDecision {
    const decisions = this.getAdmissionDecisions();
    const existingIndex = decisions.findIndex(d => d.registration_id === payload.registration_id);
    const now = new Date().toISOString();

    let decision: AdmissionDecision;
    if (existingIndex >= 0) {
      decision = {
        ...decisions[existingIndex],
        ...payload,
        updated_at: now,
      };
      decisions[existingIndex] = decision;
    } else {
      decision = {
        ...payload,
        id: payload.id || `adm-dec-${Date.now()}`,
        created_at: now,
        updated_at: now,
      };
      decisions.push(decision);
    }

    this.setStorage(STORAGE_KEYS.ADMISSION_DECISIONS, decisions);
    firebaseService.saveAdmissionDecision(decision).catch(console.warn);

    AuditLogger.log(
      'ADMISSION_DECISION',
      'Keputusan Admisi',
      decision.id,
      `Keputusan Penerimaan: Siswa "${decision.student_name}" status ditetapkan sebagai "${decision.decision_status}". Program: ${decision.recommended_program}. Oleh: ${decision.decision_maker}.`,
      actorName,
      actorRole
    );

    return decision;
  }

  public deleteAdmissionDecision(decisionId: string, actorName: string = 'Super Admin'): boolean {
    const decisions = this.getAdmissionDecisions();
    const target = decisions.find(d => d.id === decisionId);
    if (!target) return false;

    const remaining = decisions.filter(d => d.id !== decisionId);
    this.setStorage(STORAGE_KEYS.ADMISSION_DECISIONS, remaining);
    firebaseService.deleteAdmissionDecision(decisionId).catch(console.warn);

    AuditLogger.log(
      'ADMISSION_DECISION',
      'Keputusan Admisi',
      decisionId,
      `Menghapus keputusan penerimaan siswa "${target.student_name}".`,
      actorName,
      'admin'
    );

    return true;
  }

  // ==========================================
  // MODULE 4: AUDIT LOGS RETRIEVAL
  // ==========================================
  public getAuditLogs(): AuditLogEntry[] {
    return AuditLogger.getLogs();
  }
}


// Initial realistic observation session for Rayyan
const INITIAL_OBSERVATION_SESSIONS: ObservationSession[] = [
  {
    id: 'obs-sess-001',
    student_id: 'std-001',
    registration_id: 'reg-001',
    appointment_id: 'apt-001',
    observer_id: 'obs-01',
    observer_name: 'Rina Kusumawati, S.Psi., M.Psi., Psikolog',
    session_date: '2026-10-21',
    start_time: '08:45',
    end_time: '09:50',
    room_location: 'Ruang Sensori & Gerak',
    context_description: 'Anak tiba didampingi kedua orang tua. Kondisi fisik segar. Awalnya memegang mobil mainan dari rumah dan butuh 5 menit adaptasi sebelum berani menjelajah ruangan.',
    status: 'Selesai (Menunggu Telaah)',
    responses: {
      'item-a1': {
        item_id: 'item-a1',
        domain_id: 'A',
        score: 2,
        behavior_observed: 'Merespons panggilan nama pada panggilan ke-2 atau ke-3 dengan menoleh dan kontak mata 1-2 detik.',
        prompting_level: 'Bantuan Verbal / Isyarat Lisan',
        activity_used: 'Memanggil nama sambil meniup gelembung sabun warna-warni.',
        source: 'Observasi Langsung di Kelas',
        recorded_at: '2026-10-21T09:00:00Z'
      },
      'item-a2': {
        item_id: 'item-a2',
        domain_id: 'A',
        score: 2,
        behavior_observed: 'Memahami instruksi "ambil bolanya" saat disertai gesture telunjuk.',
        prompting_level: 'Bantuan Gestur / Penunjuk',
        activity_used: 'Keranjang bola sensori.',
        source: 'Observasi Langsung di Kelas',
        recorded_at: '2026-10-21T09:05:00Z'
      },
      'item-a3': {
        item_id: 'item-a3',
        domain_id: 'A',
        score: 2,
        behavior_observed: 'Menarik tangan observer menuju lemari mainan saat menginginkan balok angka.',
        prompting_level: 'Bantuan Visual / Kartu Gambar',
        activity_used: 'Temptation protocol balok kayu.',
        source: 'Observasi Langsung di Kelas',
        recorded_at: '2026-10-21T09:10:00Z'
      },
      'item-a4': {
        item_id: 'item-a4',
        domain_id: 'A',
        score: 1,
        behavior_observed: 'Menggunakan kata tunggal "mobil", "buka". Belum merangkai 2 kata spontan.',
        prompting_level: 'Bantuan Verbal / Isyarat Lisan',
        activity_used: 'Bermain mobil-mobilan dan puzzle.',
        source: 'Observasi Langsung di Kelas',
        recorded_at: '2026-10-21T09:12:00Z'
      },
      'item-c1': {
        item_id: 'item-c1',
        domain_id: 'C',
        score: 3,
        behavior_observed: 'Sangat cepat mencocokkan gambar hewan dan angka 1-10 secara mandiri tanpa salah.',
        prompting_level: 'Mandiri (Tanpa Bantuan)',
        activity_used: 'Flashcard dan balok kayu angka.',
        source: 'Observasi Langsung di Kelas',
        recorded_at: '2026-10-21T09:20:00Z'
      },
      'item-c2': {
        item_id: 'item-c2',
        domain_id: 'C',
        score: 3,
        behavior_observed: 'Mengenali warna merah, kuning, hijau, biru dengan tepat dan konsisten.',
        prompting_level: 'Mandiri (Tanpa Bantuan)',
        activity_used: 'Shape sorter dan mangkok warna.',
        source: 'Observasi Langsung di Kelas',
        recorded_at: '2026-10-21T09:25:00Z'
      },
      'item-c5': {
        item_id: 'item-c5',
        domain_id: 'C',
        score: 3,
        behavior_observed: 'Mampu duduk fokus menyusun balok bertingkat lebih dari 8 menit.',
        prompting_level: 'Mandiri (Tanpa Bantuan)',
        activity_used: 'Balok kayu susun.',
        source: 'Observasi Langsung di Kelas',
        recorded_at: '2026-10-21T09:30:00Z'
      },
      'item-d3': {
        item_id: 'item-d3',
        domain_id: 'D',
        score: 2,
        behavior_observed: 'Pincer grasp sudah muncul, mampu menjepit pompom dengan jari jempol dan telunjuk.',
        prompting_level: 'Bantuan Fisik Sebagian (Hand-under-hand)',
        activity_used: 'Pompom dan mangkok sensori.',
        source: 'Observasi Langsung di Kelas',
        recorded_at: '2026-10-21T09:35:00Z'
      },
      'item-g1': {
        item_id: 'item-g1',
        domain_id: 'G',
        score: 1,
        behavior_observed: 'Tampak cemas dan menutup telinga saat ada suara pintu tertutup kencang di luar ruangan.',
        prompting_level: 'Bantuan Fisik Sebagian (Hand-under-hand)',
        activity_used: 'Eksplorasi audio ruangan.',
        source: 'Observasi Langsung di Kelas',
        recorded_at: '2026-10-21T09:40:00Z'
      }
    },
    synthesis: {
      strengths_and_interests: 'Ketertarikan visual yang sangat tinggi terhadap angka, puzzle bentuk, dan keteraturan balok. Daya konsentrasi visual sangat baik.',
      skills_demonstrated_independently: ['Mencocokkan bentuk dan angka (COG-01)', 'Pengenalan warna dasar (COG-02)', 'Atensi pada tugas visual (COG-05)'],
      emerging_skills: ['Respon terhadap panggilan nama (COMM-01)', 'Pemahaman instruksi satu langkah dengan gestur (COMM-02)', 'Koordinasi motorik halus pincer grasp (MOT-03)'],
      skills_requiring_assistance: ['Ekspresi verbal kalimat dua arah (COMM-04)', 'Regulasi sensori auditori terhadap suara bising (SENS-01)'],
      communication_supports: 'Penggunaan kartu visual PECS dan jadwal bergambar sangat dianjurkan untuk mendampingi instruksi lisan singkat.',
      environmental_accommodations: 'Ruangan belajar dengan tingkat kebisingan rendah, pencahayaan alami/hangat, dan penyediaan sudut tenang (calm corner) jika anak merasa kewalahan.',
      preferred_teaching_strategies: 'Pendekatan berbasis minat (memanfaatkan balok dan angka sebagai jembatan interaksi sosial) dengan transisi terstruktur bertahap.',
      further_observation_needs: 'Observasi lanjutan dalam setting kelompok kecil 2-3 anak untuk mengevaluasi toleransi berbagi mainan.',
      recommended_follow_up: 'Direkomendasikan masuk kelas transisi ramah sensori dengan kombinasi sesi terapi wicara dan stimulasi sensori integrasi 2x per minggu.'
    },
    headmaster_review_notes: '',
    created_at: '2026-10-21T08:45:00Z',
    updated_at: '2026-10-21T10:00:00Z'
  }
];

const INITIAL_OBSERVATION_REPORTS: ObservationReport[] = [
  {
    id: 'rep-obs-sess-001',
    report_number: 'LSS-OBS/2026/X/001',
    session_id: 'obs-sess-001',
    student_id: 'std-001',
    registration_id: 'reg-001',
    purpose_of_observation: 'Asesmen observasi diagnostik-edukatif awal untuk memetakan profil kekuatan, kebutuhan belajar individual, toleransi sensori, serta menyusun rekomendasi akomodasi pembelajaran ramah anak berkebutuhan khusus (ABK) di Little Star School Pamekasan.',
    activities_and_methods: 'Observasi terstruktur dan bermain fungsional di Ruang Sensori & Gerak, instrumen indikator 7 domain, teknik stimulus mainan sensori/puzzle balok angka, serta wawancara konfirmasi bersama orang tua murid (Fandi Kurniawan).',
    observation_date: '2026-10-21',
    observer_name: 'Rina Kusumawati, S.Psi., M.Psi., Psikolog',
    observer_title: 'Psikolog & Tim Asesmen Khusus ABK',
    communication_support_needs: 'Anak memerlukan kombinasi instruksi lisan singkat yang didampingi kartu visual PECS serta penunjuk gestur untuk memperjelas pesan.',
    social_emotional_support_needs: 'Memerlukan pendampingan transisi bertahap saat berpindah kegiatan, dukungan regulasi emosi di lingkungan baru, serta pemodelan bertahap untuk antre dan berbagi mainan.',
    cognitive_preacademic_needs: 'Memiliki daya tangkap visual yang sangat baik pada pengenalan warna dan bentuk geometris. Membutuhkan pemecahan tugas (task-chunking) menjadi 2-3 langkah agar atensi tetap terjaga optimal.',
    motor_and_daily_living_needs: 'Penguatan koordinasi motorik halus pincer grasp untuk memegang alat tulis serta pembiasaan rutin cuci tangan dan merapikan mainan dengan poster langkah terarah.',
    sensory_environmental_accommodations: 'Ruangan belajar dengan pencahayaan hangat dan tingkat kebisingan rendah. Akses ke sudut tenang (calm corner) dan bantal pemberat saat mengalami kelelahan sensori.',
    recommended_initial_learning_goals: '1. Meningkatkan respon kontak mata dan pemahaman instruksi 1-langkah hingga 80% ketercapaian.\n2. Menerapkan jadwal visual First-Then untuk adaptasi transisi mandiri.\n3. Menuntaskan klasifikasi 3 warna dan bentuk geometri secara mandiri.',
    suggested_teaching_strategies: 'Penerapan struktur TEACCH, prompting hierarki (dari gestur hingga mandiri), pemberian penguatan positif (positive reinforcement) langsung berbasis minat khusus anak pada angka dan balok.',
    follow_up_recommendations: 'Direkomendasikan masuk Kelas Transisi Ramah Sensori Little Star School dengan pendampingan terapi sensori integrasi dan terapi wicara 2x per minggu.',
    observer_signed_at: '2026-10-21T10:00:00Z',
    headmaster_name: 'Dra. Hj. Nurul Komariyah',
    headmaster_approved_at: '2026-10-21T11:00:00Z',
    headmaster_approval_notes: 'Laporan observasi telah ditelaah dengan cermat. Disetujui untuk penempatan di Kelas Transisi Ramah Sensori dengan modul pembelajaran individual adaptif.',
    parent_acknowledgment: {
      parent_name: 'Fandi Kurniawan',
      discussed_date: '2026-10-21',
      is_acknowledged: true,
      signature_type: 'Manual Diketahui',
      parent_notes: 'Orang tua menyetujui hasil observasi dan siap berkolaborasi menerapkan strategi jadwal visual First-Then di rumah.',
    },
    status: 'Disetujui Kepala Sekolah',
    current_version: 1,
    versions: [
      {
        version_number: 1,
        created_at: '2026-10-21T10:00:00Z',
        created_by_name: 'Rina Kusumawati, S.Psi., M.Psi., Psikolog',
        created_by_role: 'observer',
        change_summary: 'Penyusunan naskah laporan observasi resmi awal berdasarkan temuan 7 domain.',
        snapshot: null,
      }
    ],
    review_logs: [
      {
        id: 'rev-001',
        report_id: 'rep-obs-sess-001',
        reviewer_name: 'Dra. Hj. Nurul Komariyah',
        reviewer_role: 'principal',
        action: 'approve',
        notes: 'Disetujui untuk penempatan di Kelas Transisi Ramah Sensori.',
        timestamp: '2026-10-21T11:00:00Z',
      }
    ],
    created_at: '2026-10-21T10:00:00Z',
    updated_at: '2026-10-21T11:00:00Z',
  }
];

const INITIAL_LEARNING_RECOMMENDATIONS: LearningRecommendation[] = [
  {
    id: 'rec-001',
    report_id: 'rep-obs-sess-001',
    category: 'Komunikasi & Bahasa',
    target_skill: 'Merespons panggilan nama dan instruksi 1-langkah secara konsisten dalam 3 detik',
    baseline_observation: 'Rayyan merespons panggilan nama pada panggilan ke-2 atau ke-3 dengan menoleh dan kontak mata 1-2 detik.',
    suggested_strategy: 'Gunakan isyarat visual kartu PECS bersamaan dengan kontak mata lembut dan panggilan nama maksimal 2 kali sebelum memberi prompt fisik sentuhan lembut.',
    required_materials: 'Kartu visual PECS ukuran 5x5 cm, kartu foto anak, mainan pemantik atensi (gelembung sabun/mainan putar)',
    assistance_level: 'Bantuan Gestur / Penunjuk',
    success_indicator: 'Mampu merespons nama dan melihat ke arah komunikator dalam 8 dari 10 kesempatan selama 3 hari berturut-turut.',
    review_period: '4 Minggu',
    is_ai_generated: false,
    order_index: 1,
    created_at: '2026-10-21T10:00:00Z',
    updated_at: '2026-10-21T10:00:00Z',
  },
  {
    id: 'rec-002',
    report_id: 'rep-obs-sess-001',
    category: 'Jadwal Visual & Instruksi',
    target_skill: 'Mengikuti transisi antar aktivitas menggunakan papan jadwal bergambar (First-Then Board)',
    baseline_observation: 'Rayyan memerlukan kepastian visual sebelum berpindah dari kegiatan bermain ke kegiatan terstruktur.',
    suggested_strategy: 'Terapkan konsep "Pertama (Aktivitas Belajar), Lalu (Aktivitas Favorit/Reward)" dengan papan jadwal First-Then yang ditempel velcro.',
    required_materials: 'Papan First-Then velcro berlapis plastik tebal, simbol visual PCS/Boardmaker berwarna, timer visual countdown',
    assistance_level: 'Bantuan Visual / Kartu Gambar',
    success_indicator: 'Anak mampu melepas simbol aktivitas selesai dan berpindah ke stasiun berikutnya secara mandiri dengan toleransi transisi baik.',
    review_period: '4 Minggu',
    is_ai_generated: false,
    order_index: 2,
    created_at: '2026-10-21T10:00:00Z',
    updated_at: '2026-10-21T10:00:00Z',
  },
  {
    id: 'rec-003',
    report_id: 'rep-obs-sess-001',
    category: 'Target Pembelajaran Individual (PPI Awal)',
    target_skill: 'Menyelesaikan tugas klasifikasi objek/warna 3 kategori dengan rentang atensi mandiri minimal 8 menit',
    baseline_observation: 'Rayyan sangat cepat mencocokkan gambar hewan dan angka 1-10 serta mengenali warna dasar merah, kuning, hijau, biru secara mandiri.',
    suggested_strategy: 'Penerapan metode TEACCH (struktur fisik jelas dan wadah kerja kiri-ke-kanan). Berikan apresiasi langsung segera setelah tugas tuntas.',
    required_materials: 'Keranjang tugas berlabel warna, balok geometri kayu halus, wadah transparan tersekat',
    assistance_level: 'Mandiri (Tanpa Bantuan)',
    success_indicator: 'Dapat menyelesaikan sorting 3 warna tanpa meninggalkan tempat duduk dan merapikan alat ke keranjang selesai.',
    review_period: '8 Minggu',
    is_ai_generated: false,
    order_index: 3,
    created_at: '2026-10-21T10:00:00Z',
    updated_at: '2026-10-21T10:00:00Z',
  },
  {
    id: 'rec-004',
    report_id: 'rep-obs-sess-001',
    category: 'Interaksi Sosial',
    target_skill: 'Bergiliran main (turn-taking) dengan 1 teman sebaya didampingi guru selama 3 putaran',
    baseline_observation: 'Rayyan cenderung bermain soliter dan membutuhkan panduan saat berbagi mainan balok angka yang disukai.',
    suggested_strategy: 'Gunakan kartu visual penanda giliran ("Giliran Saya" / "Giliran Teman") disertai hitungan ritmik 1-2-3 bergantian melempar bola ke keranjang.',
    required_materials: 'Kartu giliran bergambar anak & teman, boneka sensori, lintasan mobil kayu bersama',
    assistance_level: 'Bantuan Verbal / Isyarat Lisan',
    success_indicator: 'Anak menunggu giliran tanpa tantrum atau merebut mainan selama 3 siklus bergantian.',
    review_period: '6 Minggu',
    is_ai_generated: false,
    order_index: 4,
    created_at: '2026-10-21T10:00:00Z',
    updated_at: '2026-10-21T10:00:00Z',
  },
  {
    id: 'rec-005',
    report_id: 'rep-obs-sess-001',
    category: 'Akomodasi Sensori & Lingkungan',
    target_skill: 'Melakukan regulasi mandiri di sudut tenang (Calm Corner) saat merasa lelah atau overstimulasi sensori',
    baseline_observation: 'Rayyan peka terhadap suara bising pintu tertutup kencang dan tampak cemas menutup telinga.',
    suggested_strategy: 'Sediakan area tenang dengan karpet busa lembut, bean bag, bantal pemberat (weighted lap pad), dan headphone peredam bising jika ada suara bising mendadak.',
    required_materials: 'Noise-canceling ear muff anak, sensory bottle glitter, weighted lap pad 1.5 kg, lampu warm-light redup',
    assistance_level: 'Bantuan Fisik Sebagian (Hand-under-hand)',
    success_indicator: 'Anak dapat menunjuk kartu "Istirahat" dan duduk tenang selama 5 menit hingga ritme nafas tenang kembali.',
    review_period: '4 Minggu',
    is_ai_generated: false,
    order_index: 5,
    created_at: '2026-10-21T10:00:00Z',
    updated_at: '2026-10-21T10:00:00Z',
  },
  {
    id: 'rec-006',
    report_id: 'rep-obs-sess-001',
    category: 'Kemandirian Sehari-hari',
    target_skill: 'Mencuci tangan dan mengeringkan dengan handuk mengikuti 4 langkah visual',
    baseline_observation: 'Rayyan mampu membasahi tangan namun membutuhkan bantuan untuk menggosok sabun dan mengeringkan tangan tuntas.',
    suggested_strategy: 'Gunakan teknik Backward Chaining: anak menyelesaikan langkah terakhir (mengeringkan tangan) secara mandiri lalu secara bertahap memundurkan langkah ke cuci sabun.',
    required_materials: 'Poster visual cuci tangan 4 langkah di atas wastafel, sabun busa ramah anak (foam soap), handuk pribadi bermotif bintang',
    assistance_level: 'Bantuan Gestur / Penunjuk',
    success_indicator: 'Anak menyelesaikan seluruh rangkaian 4 tahap cuci tangan dengan maksimal 1 prompt gestur.',
    review_period: '8 Minggu',
    is_ai_generated: false,
    order_index: 6,
    created_at: '2026-10-21T10:00:00Z',
    updated_at: '2026-10-21T10:00:00Z',
  },
  {
    id: 'rec-007',
    report_id: 'rep-obs-sess-001',
    category: 'Kolaborasi Orang Tua & Guru',
    target_skill: 'Penerapan konsisten jadwal visual dan protokol sensori di rumah dan di sekolah',
    baseline_observation: 'Orang tua sangat kooperatif dan mengharapkan keselarasan strategi penanganan di rumah dengan program sekolah.',
    suggested_strategy: 'Buku penghubung harian dan sharing mingguan via WhatsApp mengenai keberhasilan strategi First-Then serta respon sensori anak.',
    required_materials: 'Buku komunikasi harian Little Star, salinan cetak kartu visual First-Then untuk dipasang di lemari es rumah',
    assistance_level: 'Mandiri (Tanpa Bantuan)',
    success_indicator: 'Terpenuhinya evaluasi berkala 2 minggu sekali antara guru wali dan orang tua dengan keselarasan respon anak.',
    review_period: '1 Semester',
    is_ai_generated: false,
    order_index: 7,
    created_at: '2026-10-21T10:00:00Z',
    updated_at: '2026-10-21T10:00:00Z',
  }
];

export const repository = new DataRepository();

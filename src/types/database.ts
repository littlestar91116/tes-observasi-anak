/**
 * Database schema types for Little Star School Pamekasan.
 * Matches Google Cloud Firebase Firestore collections and document data models.
 */

export type UserRole = 'admin' | 'principal' | 'staff' | 'observer' | 'parent';

export interface Role {
  id: string;
  name: UserRole;
  description: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

export type Gender = 'Laki-laki' | 'Perempuan';

export interface Student {
  id: string;
  full_name: string;
  preferred_name: string;
  birth_place: string;
  birth_date: string; // YYYY-MM-DD
  calculated_age?: string; // e.g. "5 tahun 4 bulan"
  gender: Gender;
  address: string;
  previous_education?: string; // Previous school, PAUD, or daycare experience
  created_at: string;
  updated_at: string;
}

export type GuardianRelation = 'Ayah' | 'Ibu' | 'Wali' | 'Kakek/Nenek' | 'Lainnya';

export interface Guardian {
  id: string;
  full_name: string;
  relationship: GuardianRelation;
  phone_number: string;
  whatsapp_number: string;
  email?: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  created_at: string;
  updated_at: string;
}

export interface DevelopmentalBackground {
  strengths_and_interests: string;
  communication_method: string[]; // ['Verbal lancar', 'Kata tunggal', 'Bahasa Isyarat/Gestur', 'PECS/Visual', 'Non-verbal']
  daily_living_skills: {
    eating: 'Mandiri' | 'Bantuan Sebagian' | 'Bantuan Penuh';
    toileting: 'Mandiri' | 'Perlu Diingatkan' | 'Memakai Popok/Bantuan Penuh';
    dressing: 'Mandiri' | 'Bantuan Sebagian' | 'Bantuan Penuh';
    notes?: string;
  };
  social_interaction: string;
  sensory_preferences: string[]; // ['Sensitif suara bising', 'Sensitif sentuhan/tekstur', 'Pencarian gerak/vestibular', 'Sensitif cahaya', 'Pilih-pilih makanan (picky eating)']
  previous_therapy_support: string[]; // ['Terapi Wicara', 'Terapi Okupasi', 'Sensori Integrasi (SI)', 'Fisioterapi', 'Belum Pernah Terapi']
  developmental_history: string;
  parent_concerns_expectations: string;
  has_professional_assessment: boolean;
  professional_assessment_details?: string;
}

export type RegistrationStatus = 
  | 'Pendaftaran Baru'
  | 'Menunggu Jadwal'
  | 'Jadwal Terkonfirmasi'
  | 'Dibatalkan';

export interface Registration {
  id: string;
  registration_number: string; // e.g. "LSS-2026-0042"
  student_id: string;
  guardian_id: string;
  status: RegistrationStatus;
  submission_date: string;
  developmental_background: DevelopmentalBackground;
  admin_notes?: string;
  created_at: string;
  updated_at: string;

  // Joined relations for UI convenience
  student?: Student;
  guardian?: Guardian;
  appointment?: ObservationAppointment;
  consent?: ConsentRecord;
}

export type AppointmentStatus = 
  | 'Menunggu Konfirmasi'
  | 'Dikonfirmasi'
  | 'Selesai'
  | 'Rescheduled'
  | 'Dibatalkan';

export interface ObservationAppointment {
  id: string;
  registration_id: string;
  appointment_date: string; // YYYY-MM-DD
  time_slot: string; // e.g. "08:30 - 10:00 WIB"
  location_room: string; // e.g. "Ruang Sensori 1" or "Ruang Observasi Ramah Anak"
  observer_id?: string;
  observer_name?: string; // Assigned psychologist/special educator
  status: AppointmentStatus;
  notes?: string;
  rescheduled_from_id?: string;
  reschedule_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface ConsentRecord {
  id: string;
  registration_id: string;
  guardian_name: string;
  consent_observation: boolean;
  consent_privacy_policy: boolean;
  data_accuracy_confirmed: boolean;
  ip_address?: string;
  consented_at: string;
}

export interface SchoolSettings {
  id: string;
  school_name: string;
  tagline: string;
  address: string;
  phone: string;
  whatsapp_number: string;
  email: string;
  accreditation: string;
  vision: string;
  mission: string[];
  observation_guidelines: string;
  faq_list: Array<{ question: string; answer: string }>;
  logo_url?: string;
  report_header?: string;
  report_footer?: string;
  report_number_format?: string;
  calendar_schedule?: string;
  scoring_labels?: {
    score_0: string;
    score_1: string;
    score_2: string;
    score_3: string;
  };
  updated_at: string;
}


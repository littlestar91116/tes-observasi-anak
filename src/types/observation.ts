/**
 * Module 2: Student Observation & Assessment Types
 * Little Star School Pamekasan (Special Education / ABK)
 */

export type ObservationScoreValue = 
  | 0 // Belum ditunjukkan
  | 1 // Ditunjukkan dengan bantuan penuh
  | 2 // Ditunjukkan dengan bantuan sebagian
  | 3 // Ditunjukkan secara mandiri
  | 'not_observed' // Belum diamati (Excluded from calculation)
  | 'not_applicable'; // Tidak relevan untuk observasi ini (Excluded from calculation)

export type PromptingLevel = 
  | 'Mandiri (Tanpa Bantuan)'
  | 'Bantuan Verbal / Isyarat Lisan'
  | 'Bantuan Visual / Kartu Gambar'
  | 'Bantuan Gestur / Penunjuk'
  | 'Bantuan Fisik Sebagian (Hand-under-hand)'
  | 'Bantuan Fisik Penuh';

export type InformationSource = 
  | 'Observasi Langsung di Kelas'
  | 'Laporan Orang Tua / Riwayat'
  | 'Kombinasi Observasi & Orang Tua';

export type ObservationSessionStatus = 
  | 'Draf (Sedang Berjalan)'
  | 'Selesai (Menunggu Telaah)'
  | 'Disetujui Kepala Sekolah'
  | 'Perlu Revisi';

export interface ObservationItem {
  id: string;
  domain_id: string; // 'A' through 'G'
  code: string; // e.g. 'COMM-01'
  title: string;
  description: string;
  suggested_activity?: string; // Suggested play activity or prompt
  is_active: boolean;
  order_index: number;
}

export interface ObservationDomain {
  id: string; // 'A' through 'G'
  name: string;
  label: string; // e.g. "A. Komunikasi"
  description: string;
  icon_name: string;
  order_index: number;
}

export interface ObservationResponse {
  item_id: string;
  domain_id: string;
  score: ObservationScoreValue;
  behavior_observed?: string; // Catatan perilaku aktual yang tampak
  prompting_level?: PromptingLevel;
  activity_used?: string; // Aktivitas atau mainan yang digunakan
  source: InformationSource;
  notes?: string;
  recorded_at: string;
}

export interface DomainScoreSummary {
  domain_id: string;
  domain_name: string;
  total_items: number;
  observed_items: number;
  not_applicable_items: number;
  coverage_percentage: number; // e.g. 85%
  average_score: number | null; // scale 0-3 (null if no valid scores)
  level_label: string; // e.g. "Muncul dengan Bantuan" atau "Mandiri"
}

export interface StudentObservationSynthesis {
  strengths_and_interests: string;
  skills_demonstrated_independently: string[];
  emerging_skills: string[];
  skills_requiring_assistance: string[];
  communication_supports: string;
  environmental_accommodations: string;
  preferred_teaching_strategies: string;
  further_observation_needs: string;
  recommended_follow_up: string;
}

export interface ObservationSession {
  id: string;
  student_id: string;
  registration_id: string;
  appointment_id?: string;
  observer_id: string;
  observer_name: string;
  session_date: string; // YYYY-MM-DD
  start_time: string; // e.g. "08:30"
  end_time?: string; // e.g. "10:00"
  room_location: string;
  context_description: string; // Kondisi anak saat tiba, kehadiran orang tua, dll.
  status: ObservationSessionStatus;
  
  // Responses dictionary keyed by item_id
  responses: Record<string, ObservationResponse>;
  
  // Qualitative synthesis & recommendations
  synthesis?: StudentObservationSynthesis;
  
  // Review notes from Kepala Sekolah
  headmaster_review_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  
  created_at: string;
  updated_at: string;
}

export type UserRoleModule2 = 'observer' | 'principal' | 'staff' | 'admin';

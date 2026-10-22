/**
 * Module 3: Observation Reports and Individualized Learning Recommendations
 * Little Star School Pamekasan (Special Education / ABK)
 */

import { ObservationScoreValue, PromptingLevel, InformationSource } from './observation';

export type ReportStatus = 
  | 'Draf Laporan'
  | 'Diajukan untuk Telaah'
  | 'Perlu Revisi'
  | 'Disetujui Kepala Sekolah';

export type RecommendationCategory = 
  | 'Komunikasi & Bahasa'
  | 'Jadwal Visual & Instruksi'
  | 'Pemecahan Tugas & Prompting'
  | 'Interaksi Sosial'
  | 'Motorik Halus & Kasar'
  | 'Kemandirian Sehari-hari'
  | 'Akomodasi Sensori & Lingkungan'
  | 'Media & Materi Belajar'
  | 'Target Pembelajaran Individual (PPI Awal)'
  | 'Kolaborasi Orang Tua & Guru'
  | 'Observasi Lanjutan';

export interface LearningRecommendation {
  id: string;
  report_id: string;
  category: RecommendationCategory;
  target_skill: string;             // Keterampilan sasaran
  baseline_observation: string;     // Observasi awal / baseline anak
  suggested_strategy: string;       // Strategi pembelajaran yang disarankan
  required_materials: string;       // Alat / media yang dibutuhkan (misal: kartu visual, balok)
  assistance_level: PromptingLevel | string; // Tingkat bantuan yang direncanakan
  success_indicator: string;        // Indikator ketercapaian (kriteria sukses)
  review_period: string;            // Periode evaluasi (misal: "4 Minggu", "8 Minggu", "1 Semester")
  is_ai_generated?: boolean;        // Penanda jika diusulkan oleh draf kecerdasan buatan
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface ReportVersion {
  version_number: number;
  created_at: string;
  created_by_name: string;
  created_by_role: string;
  change_summary: string;
  snapshot: any; // Serialized snapshot of report & recommendations at that point
}

export interface ReportReviewLog {
  id: string;
  report_id: string;
  reviewer_name: string;
  reviewer_role: string;
  action: 'submit' | 'request_revision' | 'approve';
  notes: string;
  timestamp: string;
}

export interface ParentAcknowledgment {
  parent_name: string;
  discussed_date: string;
  parent_notes?: string;
  is_acknowledged: boolean;
  signature_type: 'Digital' | 'Manual Diketahui';
}

export interface ObservationReport {
  id: string;
  report_number: string;            // Format: e.g. "LSS-OBS/2026/X/001"
  session_id: string;               // Foreign Key to observation_sessions
  student_id: string;               // Foreign Key to students
  registration_id: string;          // Foreign Key to registrations
  
  // Header & Metadata
  purpose_of_observation: string;   // Tujuan observasi asesmen kesiapan belajar
  activities_and_methods: string;   // Aktivitas stimulus & instrumen yang digunakan
  observation_date: string;
  observer_name: string;
  observer_title: string;
  
  // Categorized Specific Needs (Section 13-17)
  communication_support_needs: string;
  social_emotional_support_needs: string;
  cognitive_preacademic_needs: string;
  motor_and_daily_living_needs: string;
  sensory_environmental_accommodations: string;
  
  // High-Level Direction (Section 18-20)
  recommended_initial_learning_goals: string;
  suggested_teaching_strategies: string;
  follow_up_recommendations: string;

  // Signatures & Reviews (Section 21-23)
  observer_signed_at?: string;
  headmaster_name: string;
  headmaster_approved_at?: string;
  headmaster_approval_notes?: string;
  parent_acknowledgment?: ParentAcknowledgment;

  // Workflow & Versioning
  status: ReportStatus;
  current_version: number;
  revision_requested_notes?: string;
  versions: ReportVersion[];
  review_logs: ReportReviewLog[];

  created_at: string;
  updated_at: string;
}

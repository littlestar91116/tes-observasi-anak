/**
 * Types for Module 4 — Admin Dashboard, User Management, Admission Management,
 * Audit Logs, Security & Production Deployment.
 * Aligned with Indonesian Personal Data Protection Law (UU No. 27 Tahun 2022).
 */

export type AdmissionDecisionStatus = 
  | 'Diterima'
  | 'Ditunda / Diskusi Lanjutan'
  | 'Butuh Observasi Lanjutan'
  | 'Catatan Khusus / Lainnya';

export type AdmissionWorkflowStage =
  | 'Pendaftaran Baru'
  | 'Menunggu Jadwal'
  | 'Jadwal Terkonfirmasi'
  | 'Observasi Berlangsung'
  | 'Observasi Selesai'
  | 'Menunggu Review'
  | 'Laporan Disetujui'
  | 'Tindak Lanjut'
  | 'Keputusan Penerimaan Dicatat';

export interface AdmissionDecision {
  id: string;
  registration_id: string;
  student_id: string;
  student_name: string;
  decision_status: AdmissionDecisionStatus;
  decision_date: string; // YYYY-MM-DD
  decision_maker: string; // e.g. "Dra. Hj. Nurul Hidayati (Kepala Sekolah)"
  decision_maker_role: 'principal' | 'admin';
  decision_notes: string;
  recommended_program: string;
  follow_up_action: string;
  target_entry_term: string; // e.g. "Semester Ganjil 2026/2027"
  created_at: string;
  updated_at: string;
}

export type StaffRole = 'admin' | 'principal' | 'observer' | 'staff';

export interface StaffUser {
  id: string;
  full_name: string;
  email: string;
  role: StaffRole;
  role_title: string;
  phone: string;
  is_active: boolean;
  assigned_student_count: number;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export type AuditActionType =
  | 'LOGIN'
  | 'LOGOUT'
  | 'REGISTRATION_UPDATE'
  | 'SCHEDULE_UPDATE'
  | 'OBSERVATION_CREATE'
  | 'OBSERVATION_SAVE'
  | 'REPORT_SUBMIT'
  | 'REPORT_APPROVED'
  | 'REPORT_REVISION'
  | 'ADMISSION_DECISION'
  | 'USER_CREATE'
  | 'USER_ROLE_UPDATE'
  | 'USER_STATUS_TOGGLE'
  | 'PASSWORD_RESET'
  | 'SETTINGS_UPDATE'
  | 'DATA_EXPORT';

export type AuditRecordType =
  | 'Pendaftaran'
  | 'Jadwal'
  | 'Observasi'
  | 'Laporan'
  | 'Keputusan Admisi'
  | 'Pengguna'
  | 'Pengaturan'
  | 'Ekspor Data';

export interface AuditLogEntry {
  id: string;
  timestamp: string; // ISO string
  actor_name: string;
  actor_role: StaffRole | 'system';
  action_type: AuditActionType;
  record_type: AuditRecordType;
  record_id: string;
  details: string;
  ip_address?: string;
  security_hash?: string; // Tamper-evident check
}

export interface ExportDataOptions {
  scope: 'all' | 'admissions' | 'observations' | 'reports';
  dateFrom?: string;
  dateTo?: string;
  includeSensitiveSensoryData: boolean; // Privacy compliance with UU PDP 27/2022
  format: 'csv' | 'json';
}

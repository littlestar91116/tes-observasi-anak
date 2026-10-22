import { AuditLogEntry, AuditActionType, AuditRecordType, StaffRole } from '../types/admin';
import { firebaseService } from './firebase';

const AUDIT_STORAGE_KEY = 'lss_audit_logs_v1';

// Seed sample initial audit entries representing standard school operations
const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud-001',
    timestamp: '2026-10-18T09:30:15Z',
    actor_name: 'Budi Santoso, S.T. (Wali Murid)',
    actor_role: 'system',
    action_type: 'REGISTRATION_UPDATE',
    record_type: 'Pendaftaran',
    record_id: 'reg-001',
    details: 'Pengajuan formulir pendaftaran baru untuk calon murid Muhammad Rayyan Al-Farizi (No. Reg: LSS-2026-0001).',
  },
  {
    id: 'aud-002',
    timestamp: '2026-10-19T10:00:00Z',
    actor_name: 'Siti Aminah, S.Kom (Admin Pendaftaran)',
    actor_role: 'staff',
    action_type: 'SCHEDULE_UPDATE',
    record_type: 'Jadwal',
    record_id: 'apt-001',
    details: 'Penetapan jadwal observasi calon murid Rayyan pada Sabtu, 24 Okt 2026, 08:30 WIB di Ruang Sensori & Gerak bersama Observer Rina Kusumawati, M.Psi.',
  },
  {
    id: 'aud-003',
    timestamp: '2026-10-21T09:15:00Z',
    actor_name: 'Rina Kusumawati, S.Psi., M.Psi., Psikolog',
    actor_role: 'observer',
    action_type: 'OBSERVATION_CREATE',
    record_type: 'Observasi',
    record_id: 'obs-sess-001',
    details: 'Memulai sesi observasi diagnostik tumbuh kembang 7 domain untuk calon siswa Rayyan.',
  },
  {
    id: 'aud-004',
    timestamp: '2026-10-21T11:45:00Z',
    actor_name: 'Rina Kusumawati, S.Psi., M.Psi., Psikolog',
    actor_role: 'observer',
    action_type: 'REPORT_SUBMIT',
    record_type: 'Laporan',
    record_id: 'rep-obs-sess-001',
    details: 'Menyelesaikan laporan hasil observasi dan 7 butir rekomendasi awal PPI. Mengirimkan berkas ke Kepala Sekolah untuk review.',
  },
  {
    id: 'aud-005',
    timestamp: '2026-10-21T14:30:00Z',
    actor_name: 'Dra. Hj. Nurul Hidayati (Kepala Sekolah)',
    actor_role: 'principal',
    action_type: 'REPORT_APPROVED',
    record_type: 'Laporan',
    record_id: 'rep-obs-sess-001',
    details: 'Laporan observasi No. LSS-OBS/2026/10/001 telah ditelaah dan disetujui resmi untuk pembahasan bersama orang tua.',
  },
];

export class AuditLogger {
  private static getStoredLogs(): AuditLogEntry[] {
    try {
      const stored = localStorage.getItem(AUDIT_STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(INITIAL_AUDIT_LOGS));
        return INITIAL_AUDIT_LOGS;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  }

  private static saveLogs(logs: AuditLogEntry[]): void {
    try {
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(logs));
    } catch (e) {
      console.warn('Failed to save audit logs to storage', e);
    }
  }

  public static getLogs(): AuditLogEntry[] {
    return this.getStoredLogs().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public static log(
    actionType: AuditActionType,
    recordType: AuditRecordType,
    recordId: string,
    details: string,
    actorName: string = 'Super Admin',
    actorRole: StaffRole | 'system' = 'admin'
  ): AuditLogEntry {
    const entry: AuditLogEntry = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      actor_name: actorName,
      actor_role: actorRole,
      action_type: actionType,
      record_type: recordType,
      record_id: recordId,
      details,
      security_hash: `hash-${Math.random().toString(36).substring(2, 10)}`,
    };

    const current = this.getStoredLogs();
    const updated = [entry, ...current];
    this.saveLogs(updated);

    // Sync to Firestore audit_logs collection
    firebaseService.logAuditEvent(entry).catch(console.warn);

    return entry;
  }
}

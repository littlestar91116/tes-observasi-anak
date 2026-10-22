import React, { useState } from 'react';
import { repository } from '../../lib/repository';
import { exportAdmissionsToCsv, exportObservationsToCsv, downloadFile } from '../../lib/exportUtils';
import { AuditLogger } from '../../lib/auditLogger';
import { 
  X, 
  Download, 
  FileSpreadsheet, 
  Database, 
  ShieldAlert, 
  CheckCircle2, 
  Upload, 
  Lock, 
  AlertTriangle,
  Info,
  Calendar,
  Layers
} from 'lucide-react';

interface ExportBackupModalProps {
  onClose: () => void;
  currentRole: 'admin' | 'principal' | 'observer' | 'staff';
}

export const ExportBackupModal: React.FC<ExportBackupModalProps> = ({ onClose, currentRole }) => {
  const isAuthorized = currentRole === 'admin' || currentRole === 'principal';

  const [includeSensitiveData, setIncludeSensitiveData] = useState(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  const handleExportAdmissions = () => {
    const regs = repository.getRegistrations();
    const decs = repository.getAdmissionDecisions();
    const csv = exportAdmissionsToCsv(regs, decs, { includeSensitiveClinicalData: includeSensitiveData });
    const filename = `LittleStar_Data_Admisi_${new Date().toISOString().substring(0, 10)}.csv`;
    downloadFile(csv, filename, 'text/csv;charset=utf-8;');

    AuditLogger.log(
      'DATA_EXPORT',
      'Ekspor Data',
      'export-csv-admissions',
      `Mengekspor data pendaftaran dan admisi (${regs.length} siswa). Status data sensitif sensori: ${includeSensitiveData ? 'Disertakan' : 'Dikecualikan (Anonymized)'}`,
      currentRole === 'principal' ? 'Dra. Hj. Nurul Hidayati (Kepala Sekolah)' : 'Super Admin',
      currentRole === 'principal' ? 'principal' : 'admin'
    );

    setExportSuccessMsg(`Berkas ${filename} berhasil diunduh.`);
  };

  const handleExportObservations = () => {
    const sess = repository.getObservationSessions();
    const reps = repository.getObservationReports();
    const csv = exportObservationsToCsv(sess, reps, { includeSensitiveClinicalData: includeSensitiveData });
    const filename = `LittleStar_Hasil_Observasi_${new Date().toISOString().substring(0, 10)}.csv`;
    downloadFile(csv, filename, 'text/csv;charset=utf-8;');

    AuditLogger.log(
      'DATA_EXPORT',
      'Ekspor Data',
      'export-csv-observations',
      `Mengekspor data observasi asesmen 7 domain (${sess.length} sesi). Status data sensitif sensori: ${includeSensitiveData ? 'Disertakan' : 'Dikecualikan (Anonymized)'}`,
      currentRole === 'principal' ? 'Dra. Hj. Nurul Hidayati (Kepala Sekolah)' : 'Super Admin',
      currentRole === 'principal' ? 'principal' : 'admin'
    );

    setExportSuccessMsg(`Berkas ${filename} berhasil diunduh.`);
  };

  const handleExportFullBackup = () => {
    const backupData = {
      version: '1.0',
      exported_at: new Date().toISOString(),
      school_name: 'Little Star School Pamekasan',
      registrations: repository.getRegistrations(),
      observation_sessions: repository.getObservationSessions(),
      observation_reports: repository.getObservationReports(),
      admission_decisions: repository.getAdmissionDecisions(),
      staff_users: repository.getStaffUsers(),
      school_settings: repository.getSettings(),
    };

    const json = JSON.stringify(backupData, null, 2);
    const filename = `LittleStar_Full_System_Backup_${new Date().toISOString().substring(0, 10)}.json`;
    downloadFile(json, filename, 'application/json');

    AuditLogger.log(
      'DATA_EXPORT',
      'Ekspor Data',
      'backup-full-json',
      `Cadangan sistem lengkap (Full System Backup JSON) berhasil diunduh oleh ${currentRole}.`,
      currentRole === 'principal' ? 'Dra. Hj. Nurul Hidayati (Kepala Sekolah)' : 'Super Admin',
      currentRole === 'principal' ? 'principal' : 'admin'
    );

    setExportSuccessMsg(`Cadangan sistem lengkap ${filename} berhasil diunduh.`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <Download className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-base">Ekspor Data & Pencadangan Sistem (Backup)</h3>
              <p className="text-xs text-blue-100">Little Star School Pamekasan • Modul 4</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-blue-200 hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs text-slate-600">
          
          {/* Privacy Switch Notice (UU PDP No. 27/2022) */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-amber-950">
            <div className="flex items-center gap-2 font-bold">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Kepatuhan Kerahasiaan Data ABK (UU PDP No. 27/2022)</span>
            </div>
            <p className="text-amber-800 text-xs leading-relaxed">
              Data sensori dan riwayat tumbuh kembang anak berkebutuhan khusus tergolong data spesifik yang dilindungi. Pastikan Anda hanya menyertakan data klinis jika peruntukannya resmi dan terotorisasi.
            </p>
            <label className="flex items-center gap-2.5 pt-2 border-t border-amber-200 cursor-pointer font-bold text-xs text-amber-900">
              <input
                type="checkbox"
                checked={includeSensitiveData}
                onChange={(e) => setIncludeSensitiveData(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Sertakan kolom sensitif (Kebutuhan sensori, riwayat terapi, dan kemandirian detail)</span>
            </label>
          </div>

          {/* Export Options Cards */}
          <div className="space-y-3">
            <div className="p-4 bg-slate-50 hover:bg-blue-50/50 transition-colors border border-slate-200 rounded-xl flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-lg shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Ekspor Data Admisi & Siswa (CSV)</h4>
                  <p className="text-slate-500 text-xs">
                    Daftar calon murid, nomor pendaftaran, kontak wali, status alur admisi, dan keputusan penerimaan.
                  </p>
                </div>
              </div>
              <button
                onClick={handleExportAdmissions}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-xs shrink-0 cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh CSV</span>
              </button>
            </div>

            <div className="p-4 bg-slate-50 hover:bg-blue-50/50 transition-colors border border-slate-200 rounded-xl flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-blue-100 text-blue-800 rounded-lg shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Ekspor Hasil Observasi 7 Domain (CSV)</h4>
                  <p className="text-slate-500 text-xs">
                    Ringkasan skor persentase tiap domain (komunikasi, kognitif, motorik, sensori, dsb.) dan status laporan PPI.
                  </p>
                </div>
              </div>
              <button
                onClick={handleExportObservations}
                className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold text-xs shadow-xs shrink-0 cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh CSV</span>
              </button>
            </div>

            <div className="p-4 bg-slate-50 hover:bg-purple-50/50 transition-colors border border-slate-200 rounded-xl flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-purple-100 text-purple-800 rounded-lg shrink-0">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Cadangan Penuh Sistem (Full JSON Backup)</h4>
                  <p className="text-slate-500 text-xs">
                    Seluruh entitas pendaftaran, jadwal, sesi observasi, butir instrumen, laporan, rekomendasi PPI, dan pengaturan.
                  </p>
                </div>
              </div>
              <button
                onClick={handleExportFullBackup}
                disabled={!isAuthorized}
                className="px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold text-xs shadow-xs shrink-0 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh JSON</span>
              </button>
            </div>
          </div>

          {exportSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{exportSuccessMsg}</span>
            </div>
          )}

          {/* Retention Policy Guidance */}
          <div className="p-3 bg-slate-100 rounded-xl text-slate-600 text-xs space-y-1">
            <span className="font-bold text-slate-800">Kebijakan Retensi Data Sekolah:</span>
            <p>
              Data berkas observasi dan laporan PPI disimpan minimal selama 5 tahun sejak kelulusan/perpindahan murid sesuai standar akreditasi pendidikan khusus. Cadangan dianjurkan diunduh secara berkala tiap akhir bulan.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs cursor-pointer"
            >
              Selesai
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

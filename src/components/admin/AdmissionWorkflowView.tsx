import React, { useState } from 'react';
import { Registration, Student } from '../../types/database';
import { ObservationSession } from '../../types/observation';
import { ObservationReport } from '../../types/report';
import { AdmissionDecision, AdmissionWorkflowStage } from '../../types/admin';
import { 
  Award, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  AlertCircle, 
  UserCheck, 
  FileCheck2, 
  ChevronRight, 
  Info,
  Filter,
  Search,
  Sparkles,
  Building,
  HelpCircle,
  FileText
} from 'lucide-react';
import { formatIndonesianDate, formatShortDate } from '../../lib/utils';

interface AdmissionWorkflowViewProps {
  registrations: Registration[];
  observationSessions: ObservationSession[];
  observationReports: ObservationReport[];
  admissionDecisions: AdmissionDecision[];
  onOpenDecisionModal: (reg: Registration) => void;
  onOpenDetail: (reg: Registration) => void;
  onOpenReport: (student: Student, reg: Registration) => void;
  currentRole: 'admin' | 'principal' | 'observer' | 'staff';
}

const ALL_STAGES: { id: AdmissionWorkflowStage; label: string; desc: string }[] = [
  { id: 'Pendaftaran Baru', label: '1. Pendaftaran Baru', desc: 'Formulir daring masuk' },
  { id: 'Menunggu Jadwal', label: '2. Menunggu Jadwal', desc: 'Verifikasi berkas' },
  { id: 'Jadwal Terkonfirmasi', label: '3. Jadwal Terkonfirmasi', desc: 'Slot observasi siap' },
  { id: 'Observasi Berlangsung', label: '4. Observasi Berlangsung', desc: 'Sesi di ruang sensori' },
  { id: 'Observasi Selesai', label: '5. Observasi Selesai', desc: 'Skor 7 domain terisi' },
  { id: 'Menunggu Review', label: '6. Menunggu Review', desc: 'Laporan dikirim ke Kepsek' },
  { id: 'Laporan Disetujui', label: '7. Laporan Disetujui', desc: 'Disahkan Kepsek' },
  { id: 'Tindak Lanjut', label: '8. Tindak Lanjut', desc: 'Konsultasi ortu & PPI' },
  { id: 'Keputusan Penerimaan Dicatat', label: '9. Keputusan Dicatat', desc: 'Status admisi final' },
];

export const AdmissionWorkflowView: React.FC<AdmissionWorkflowViewProps> = ({
  registrations,
  observationSessions,
  observationReports,
  admissionDecisions,
  onOpenDecisionModal,
  onOpenDetail,
  onOpenReport,
  currentRole,
}) => {
  const isAuthorizedToDecide = currentRole === 'admin' || currentRole === 'principal';
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Determine an applicant's current stage index (1-9)
  const getApplicantStage = (reg: Registration): { stage: AdmissionWorkflowStage; stepIndex: number } => {
    const decision = admissionDecisions.find(d => d.registration_id === reg.id);
    if (decision) {
      return { stage: 'Keputusan Penerimaan Dicatat', stepIndex: 9 };
    }

    const sess = observationSessions.find(s => s.registration_id === reg.id || s.student_id === reg.student_id);
    const rep = observationReports.find(r => r.student_id === reg.student_id || r.session_id === sess?.id);

    if (rep?.status === 'Disetujui Kepala Sekolah') {
      return { stage: 'Tindak Lanjut', stepIndex: 8 };
    }
    if (rep?.status === 'Diajukan untuk Telaah') {
      return { stage: 'Menunggu Review', stepIndex: 6 };
    }
    if (sess?.status.includes('Selesai')) {
      return { stage: 'Observasi Selesai', stepIndex: 5 };
    }
    if (sess?.status.includes('Draf') || sess?.status.includes('Berjalan')) {
      return { stage: 'Observasi Berlangsung', stepIndex: 4 };
    }
    if (reg.appointment && reg.appointment.status === 'Dikonfirmasi') {
      return { stage: 'Jadwal Terkonfirmasi', stepIndex: 3 };
    }
    if (reg.status === 'Menunggu Jadwal') {
      return { stage: 'Menunggu Jadwal', stepIndex: 2 };
    }

    return { stage: 'Pendaftaran Baru', stepIndex: 1 };
  };

  const filteredRegistrations = registrations.filter((reg) => {
    const stageInfo = getApplicantStage(reg);
    if (selectedStageFilter !== 'all' && stageInfo.stage !== selectedStageFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const studentName = reg.student?.full_name?.toLowerCase() || '';
      const regNum = reg.registration_number?.toLowerCase() || '';
      return studentName.includes(q) || regNum.includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Alur Admisi 9-Tahap & Keputusan Manual</h2>
              <p className="text-xs text-slate-500">
                Pemantauan alur penerimaan komprehensif dari pendaftaran hingga penetapan keputusan admisi murid ABK.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-semibold">Total Terdata:</span>
          <span className="font-mono font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg border border-blue-200">
            {registrations.length} Siswa
          </span>
        </div>
      </div>

      {/* Principle of Separate Assessment Notice */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-amber-950">
            Prinsip Pemisahan Asesmen & Keputusan Admisi (Human-Centered Decision)
          </p>
          <p className="text-amber-800 leading-relaxed">
            Sesuai pedoman Little Star School, skor asesmen observasi tidak pernah digunakan sebagai filter otomatis penerimaan. Asesmen berfungsi memahami gaya belajar, sensori, dan kebutuhan akomodasi anak. Keputusan admisi ditetapkan secara terpisah oleh Kepala Sekolah dan Komite Pendidikan.
          </p>
        </div>
      </div>

      {/* 9-Stage Visual Pipeline Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
        <div className="min-w-[850px]">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-3">
            Tahapan Siklus Admisi Little Star School (1 s/d 9):
          </span>
          <div className="grid grid-cols-9 gap-1.5 text-center">
            {ALL_STAGES.map((s, idx) => {
              const countInStage = registrations.filter(r => getApplicantStage(r).stage === s.id).length;
              const isSelected = selectedStageFilter === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedStageFilter(isSelected ? 'all' : s.id)}
                  className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-blue-700 text-white border-blue-800 ring-2 ring-blue-500/20 shadow-xs'
                      : 'bg-slate-50 hover:bg-blue-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <div>
                    <span className={`text-[10px] font-bold block ${isSelected ? 'text-amber-300' : 'text-blue-600'}`}>
                      Tahap {idx + 1}
                    </span>
                    <span className="font-extrabold text-[11px] leading-tight block mt-0.5">
                      {s.id}
                    </span>
                  </div>
                  <div className="mt-2 pt-1 border-t border-slate-200/50 flex items-center justify-between text-[10px]">
                    <span className={isSelected ? 'text-blue-100' : 'text-slate-400'}>Jumlah:</span>
                    <span className={`font-mono font-bold px-1.5 py-0.2 rounded ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800'
                    }`}>
                      {countInStage}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Search and Stage Reset */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="font-bold text-slate-700">Filter Aktif:</span>
          <span className="font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg border border-blue-200">
            {selectedStageFilter === 'all' ? 'Semua Tahapan' : selectedStageFilter}
          </span>
          {selectedStageFilter !== 'all' && (
            <button
              onClick={() => setSelectedStageFilter('all')}
              className="text-blue-600 hover:text-blue-800 underline font-semibold cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama calon siswa..."
            className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Applicants List in Workflow */}
      <div className="space-y-4">
        {filteredRegistrations.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 text-xs">
            Tidak ada calon siswa pada kriteria tahapan ini.
          </div>
        ) : (
          filteredRegistrations.map((reg) => {
            const student = reg.student;
            const stageInfo = getApplicantStage(reg);
            const decision = admissionDecisions.find(d => d.registration_id === reg.id);
            const sess = observationSessions.find(s => s.registration_id === reg.id || s.student_id === reg.student_id);
            const rep = observationReports.find(r => r.student_id === reg.student_id || r.session_id === sess?.id);

            return (
              <div
                key={reg.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 transition-all space-y-4"
              >
                
                {/* Header Row: Identity & Current Stage */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-sm border border-blue-200">
                      {stageInfo.stepIndex}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-slate-900 text-base">{student?.full_name}</h3>
                        <span className="text-xs text-slate-500 font-mono">({reg.registration_number})</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Wali: <strong>{reg.guardian?.full_name}</strong> • Kontak: {reg.guardian?.whatsapp_number}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">Tahap Saat Ini:</span>
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-blue-800 border border-blue-200">
                      {stageInfo.stage}
                    </span>
                  </div>
                </div>

                {/* 9-Step Progress Bar Dots */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                  {ALL_STAGES.map((s, idx) => {
                    const isPassed = idx + 1 <= stageInfo.stepIndex;
                    return (
                      <div
                        key={idx}
                        className={`flex-1 h-full border-r border-white/50 transition-colors ${
                          isPassed ? 'bg-blue-600' : 'bg-slate-200'
                        }`}
                        title={`Tahap ${idx + 1}: ${s.id}`}
                      />
                    );
                  })}
                </div>

                {/* Decision Details or Action Strip */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  {decision ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">Keputusan Resmi:</span>
                        <span className={`px-2.5 py-0.5 rounded-full font-bold border ${
                          decision.decision_status === 'Diterima' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                          decision.decision_status === 'Ditunda / Diskusi Lanjutan' ? 'bg-amber-50 text-amber-800 border-amber-300' :
                          decision.decision_status === 'Butuh Observasi Lanjutan' ? 'bg-blue-50 text-blue-800 border-blue-300' :
                          'bg-purple-50 text-purple-800 border-purple-300'
                        }`}>
                          {decision.decision_status}
                        </span>
                        <span className="text-slate-400">• Program: <strong>{decision.recommended_program}</strong></span>
                      </div>
                      <p className="text-slate-600 line-clamp-1 italic">
                        "{decision.decision_notes}"
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Ditetapkan oleh: <strong>{decision.decision_maker}</strong> pada {formatIndonesianDate(decision.decision_date)}
                      </p>
                    </div>
                  ) : (
                    <div className="text-slate-500">
                      <span>Status Keputusan Admisi: </span>
                      <strong className="text-slate-700">Belum Dicatat</strong>
                      <span className="block text-[11px] text-slate-400">
                        {stageInfo.stepIndex >= 7 ? 'Laporan telah disetujui, siap untuk penetapan keputusan pimpinan.' : 'Masih dalam proses observasi atau telaah laporan.'}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onOpenDecisionModal(reg)}
                      className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>{decision ? 'Ubah Keputusan' : 'Catat Keputusan Admisi'}</span>
                    </button>

                    {student && rep && (
                      <button
                        onClick={() => onOpenReport(student, reg)}
                        className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl font-bold text-xs cursor-pointer flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-600" />
                        <span>Laporan PPI</span>
                      </button>
                    )}

                    <button
                      onClick={() => onOpenDetail(reg)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs cursor-pointer"
                    >
                      Detail Siswa
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

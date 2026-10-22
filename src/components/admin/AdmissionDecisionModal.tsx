import React, { useState } from 'react';
import { Registration } from '../../types/database';
import { AdmissionDecision, AdmissionDecisionStatus } from '../../types/admin';
import { repository } from '../../lib/repository';
import { formatIndonesianDate } from '../../lib/utils';
import { 
  X, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  FileCheck2, 
  UserCheck, 
  Clock, 
  Calendar,
  Sparkles,
  ShieldCheck,
  Building,
  Info
} from 'lucide-react';

interface AdmissionDecisionModalProps {
  registration: Registration;
  existingDecision?: AdmissionDecision | null;
  onClose: () => void;
  onSaved: (decision: AdmissionDecision) => void;
  currentRole: 'admin' | 'principal' | 'observer' | 'staff';
}

export const AdmissionDecisionModal: React.FC<AdmissionDecisionModalProps> = ({
  registration,
  existingDecision,
  onClose,
  onSaved,
  currentRole,
}) => {
  const isAuthorized = currentRole === 'admin' || currentRole === 'principal';

  const [decisionStatus, setDecisionStatus] = useState<AdmissionDecisionStatus>(
    existingDecision?.decision_status || 'Diterima'
  );
  const [decisionDate, setDecisionDate] = useState<string>(
    existingDecision?.decision_date || new Date().toISOString().substring(0, 10)
  );
  const [decisionMaker, setDecisionMaker] = useState<string>(
    existingDecision?.decision_maker || (currentRole === 'principal' ? 'Dra. Hj. Nurul Hidayati (Kepala Sekolah)' : 'Dra. Hj. Siti Fatimah, M.Pd. (Super Admin)')
  );
  const [recommendedProgram, setRecommendedProgram] = useState<string>(
    existingDecision?.recommended_program || 'Kelas Transisi Mandiri & Pengayaan Sensori'
  );
  const [targetEntryTerm, setTargetEntryTerm] = useState<string>(
    existingDecision?.target_entry_term || 'Semester Ganjil 2026/2027'
  );
  const [decisionNotes, setDecisionNotes] = useState<string>(
    existingDecision?.decision_notes || ''
  );
  const [followUpAction, setFollowUpAction] = useState<string>(
    existingDecision?.follow_up_action || 'Konsultasi bersama orang tua dan penyusunan draf PPI Awal.'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Suggested programs in Little Star School
  const PROGRAM_OPTIONS = [
    'Kelas Transisi Mandiri & Pengayaan Sensori',
    'Program Intervensi Individual (1-on-1 Focused)',
    'Kelas Bermain & Interaksi Sosial Terpadu',
    'PAUD Inklusi Adaptif Little Star',
    'Program Terapi & Sensori Integrasi Terstruktur',
    'Konsultasi Lanjutan / Rekomendasi Terapi Luar Dahulu',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthorized) {
      setError('Hanya Kepala Sekolah atau Super Administrator yang berwenang menetapkan keputusan penerimaan.');
      return;
    }

    if (!decisionNotes.trim()) {
      setError('Harap cantumkan pertimbangan atau catatan keputusan.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const decisionPayload = {
        id: existingDecision?.id,
        registration_id: registration.id,
        student_id: registration.student_id,
        student_name: registration.student?.full_name || 'Calon Siswa',
        decision_status: decisionStatus,
        decision_date: decisionDate,
        decision_maker: decisionMaker,
        decision_maker_role: (currentRole === 'principal' ? 'principal' : 'admin') as 'principal' | 'admin',
        decision_notes: decisionNotes,
        recommended_program: recommendedProgram,
        follow_up_action: followUpAction,
        target_entry_term: targetEntryTerm,
      };

      const saved = repository.saveAdmissionDecision(
        decisionPayload,
        decisionMaker,
        currentRole === 'principal' ? 'principal' : 'admin'
      );

      // If registered status can progress, set to decision recorded
      repository.updateRegistrationStatus(registration.id, 'Jadwal Terkonfirmasi', `Keputusan penerimaan dicatat: ${decisionStatus}`);

      onSaved(saved);
    } catch (err: any) {
      setError(err?.message || 'Gagal menyimpan keputusan admisi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-sm">
              <Award className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Penetapan Keputusan Penerimaan (Admisi)</h2>
              <p className="text-xs text-blue-100">
                Little Star School Pamekasan • Modul 4 Manajemen Admisi ABK
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Student Overview Strip */}
        <div className="bg-blue-50/70 border-b border-blue-100 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-blue-900">
          <div>
            <span className="text-blue-600 font-medium">Calon Murid:</span>{' '}
            <strong className="text-sm font-bold text-blue-950">{registration.student?.full_name}</strong> ({registration.student?.preferred_name || '-'})
          </div>
          <div>
            <span className="text-blue-600 font-medium">No. Registrasi:</span>{' '}
            <span className="font-mono font-semibold bg-white px-2 py-0.5 rounded border border-blue-200">{registration.registration_number}</span>
          </div>
          <div>
            <span className="text-blue-600 font-medium">Wali:</span>{' '}
            <span className="font-semibold">{registration.guardian?.full_name}</span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-sm">

          {/* Principle of Ethical Assessment Notice */}
          <div className="flex items-start gap-3 p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-950 mb-0.5">Prinsip Asesmen Non-Diskriminatif ABK</p>
              <p className="text-amber-800 leading-relaxed">
                Skor observasi digunakan untuk memetakan profil belajar dan kebutuhan akomodasi sensori, bukan untuk diskualifikasi otomatis. Keputusan penerimaan diputuskan secara musyawarah profesional oleh pimpinan sekolah.
              </p>
            </div>
          </div>

          {/* Status Decision Selector */}
          <div>
            <label className="block font-bold text-slate-800 mb-2">
              Status Keputusan Penerimaan <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                {
                  id: 'Diterima',
                  label: 'Diterima',
                  desc: 'Memenuhi kesiapan program Little Star School',
                  badgeColor: 'border-emerald-500 bg-emerald-50 text-emerald-900',
                  icon: CheckCircle2,
                  iconColor: 'text-emerald-600'
                },
                {
                  id: 'Ditunda / Diskusi Lanjutan',
                  label: 'Ditunda / Diskusi Lanjutan',
                  desc: 'Perlu rapat komite / konsultasi orang tua lanjutan',
                  badgeColor: 'border-amber-500 bg-amber-50 text-amber-900',
                  icon: Clock,
                  iconColor: 'text-amber-600'
                },
                {
                  id: 'Butuh Observasi Lanjutan',
                  label: 'Butuh Observasi Lanjutan',
                  desc: 'Perlu sesi eksplorasi tambahan atau laporan medis',
                  badgeColor: 'border-blue-500 bg-blue-50 text-blue-900',
                  icon: HelpCircle,
                  iconColor: 'text-blue-600'
                },
                {
                  id: 'Catatan Khusus / Lainnya',
                  label: 'Catatan Khusus / Lainnya',
                  desc: 'Kondisi khusus dengan kesepakatan tertulis',
                  badgeColor: 'border-purple-500 bg-purple-50 text-purple-900',
                  icon: Sparkles,
                  iconColor: 'text-purple-600'
                },
              ].map((opt) => {
                const Icon = opt.icon;
                const isSelected = decisionStatus === opt.id;
                return (
                  <label
                    key={opt.id}
                    onClick={() => setDecisionStatus(opt.id as AdmissionDecisionStatus)}
                    className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? `${opt.badgeColor} ring-2 ring-blue-500/20 shadow-xs`
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="decision_status"
                      value={opt.id}
                      checked={isSelected}
                      onChange={() => setDecisionStatus(opt.id as AdmissionDecisionStatus)}
                      className="mt-1 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-sm">
                        <Icon className={`w-4 h-4 ${opt.iconColor}`} />
                        <span>{opt.label}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Program Recommendation & Target Term */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Rekomendasi Penempatan Kelas / Program
              </label>
              <select
                value={recommendedProgram}
                onChange={(e) => setRecommendedProgram(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-800 text-sm focus:ring-2 focus:ring-blue-500"
              >
                {PROGRAM_OPTIONS.map((prog, i) => (
                  <option key={i} value={prog}>{prog}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target Periode Masuk
              </label>
              <input
                type="text"
                value={targetEntryTerm}
                onChange={(e) => setTargetEntryTerm(e.target.value)}
                placeholder="Contoh: Semester Ganjil 2026/2027"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-800 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Decision Maker & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pengambil Keputusan Resmi <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={decisionMaker}
                onChange={(e) => setDecisionMaker(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-800 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tanggal Penetapan Keputusan <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={decisionDate}
                onChange={(e) => setDecisionDate(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-800 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Decision Notes & Justifications */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Catatan Pertimbangan & Kesimpulan Pimpinan <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={decisionNotes}
              onChange={(e) => setDecisionNotes(e.target.value)}
              placeholder="Jelaskan alasan penetapan keputusan, kesiapan lingkungan sekolah, dan akomodasi awal yang disepakati..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-800 text-sm focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Follow Up Actions */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Langkah Tindak Lanjut Pasca Keputusan
            </label>
            <input
              type="text"
              value={followUpAction}
              onChange={(e) => setFollowUpAction(e.target.value)}
              placeholder="Contoh: Konsultasi penandatanganan PPI pada 26 Oktober 2026..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-800 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Footer actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Akses Berwenang: Kepala Sekolah & Super Admin</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-xl font-semibold text-slate-700 text-sm cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !isAuthorized}
                className="px-5 py-2 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white rounded-xl font-bold text-sm shadow-md transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                {isSubmitting ? (
                  <span>Menyimpan...</span>
                ) : (
                  <>
                    <FileCheck2 className="w-4 h-4" />
                    <span>Simpan Keputusan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};

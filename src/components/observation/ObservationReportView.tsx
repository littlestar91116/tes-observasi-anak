import React, { useState } from 'react';
import { ObservationSession, ObservationItem } from '../../types/observation';
import { Student, Registration, SchoolSettings } from '../../types/database';
import { OBSERVATION_DOMAINS } from '../../lib/observationData';
import { calculateAllDomainsSummary, SCORING_EXPLANATIONS } from '../../lib/scoringEngine';
import { repository } from '../../lib/repository';
import { formatIndonesianDate, formatShortDate } from '../../lib/utils';
import { StarLogo } from '../common/StarLogo';
import { 
  ArrowLeft, 
  Printer, 
  CheckCircle2, 
  Award, 
  User, 
  Calendar, 
  Clock, 
  MapPin, 
  FileCheck2, 
  Sparkles,
  ShieldCheck,
  Edit,
  AlertCircle
} from 'lucide-react';

interface ObservationReportViewProps {
  session: ObservationSession;
  student: Student;
  registration: Registration;
  settings: SchoolSettings;
  userRole: 'observer' | 'principal' | 'staff' | 'admin';
  onBack: () => void;
  onEditSession?: () => void;
  onReviewApproved: (updatedSession: ObservationSession) => void;
  onOpenModule3Report?: (session: ObservationSession) => void;
}

export const ObservationReportView: React.FC<ObservationReportViewProps> = ({
  session,
  student,
  registration,
  settings,
  userRole,
  onBack,
  onEditSession,
  onReviewApproved,
  onOpenModule3Report,
}) => {
  const [headmasterNotes, setHeadmasterNotes] = useState(session.headmaster_review_notes || '');
  const [isApproving, setIsApproving] = useState(false);
  const [approvalFeedback, setApprovalFeedback] = useState<string | null>(null);

  const observationItems = repository.getObservationItems();
  const summary = calculateAllDomainsSummary(OBSERVATION_DOMAINS, observationItems, session.responses);
  const synth = session.synthesis;

  const isApproved = session.status === 'Disetujui Kepala Sekolah';
  const canApprove = (userRole === 'principal' || userRole === 'admin') && !isApproved;

  const handleApprove = () => {
    setIsApproving(true);
    const updated = repository.reviewObservationSession(
      session.id,
      headmasterNotes || 'Laporan telah ditelaah dan disetujui untuk diteruskan ke tim Program Pembelajaran Individual (PPI).',
      'Dra. Hj. Nurul Komariyah (Kepala Sekolah)'
    );
    setIsApproving(false);
    if (updated) {
      setApprovalFeedback('Laporan observasi berhasil disetujui dan ditandatangani secara digital.');
      onReviewApproved(updated);
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6">
      
      {/* Top Controls (Hidden on print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>

        <div className="flex items-center gap-2.5">
          {onEditSession && (!isApproved || userRole === 'admin') && (
            <button
              onClick={onEditSession}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5 text-amber-500" />
              <span>Edit Sesi</span>
            </button>
          )}

          {onOpenModule3Report && (
            <button
              onClick={() => onOpenModule3Report(session)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Buka Laporan Resmi (Modul 3)</span>
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Cepat</span>
          </button>
        </div>
      </div>

      {/* Main Report Document Card */}
      <div className="print-card bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-10 space-y-8 relative overflow-hidden">
        
        {/* Decorative Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-sky-400 to-emerald-400" />

        {/* Header Lockup */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div className="flex items-center gap-3.5">
            <StarLogo size={48} />
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {settings.school_name}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Pusat Observasi & Layanan Khusus Anak Berkebutuhan Khusus (ABK)
              </p>
              <p className="text-[11px] text-slate-400">
                {settings.address} · Telp/WA: +{settings.whatsapp_number}
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 block sm:inline-block">
              Laporan Hasil Observasi (Modul 2)
            </span>
            <span className="text-xs text-slate-500 block mt-1">
              Tanggal Sesi: {formatIndonesianDate(session.session_date)}
            </span>
          </div>
        </div>

        {/* Student & Session Information Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-50/80 border border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Nama Lengkap Anak:</span>
            <span className="font-extrabold text-slate-900 text-sm">{student.full_name}</span>
            <span className="text-slate-500 block text-[11px]">"{student.preferred_name}" ({student.gender})</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px]">Usia & Tanggal Lahir:</span>
            <span className="font-bold text-slate-800">{student.calculated_age || '-'}</span>
            <span className="text-slate-500 block text-[11px]">{student.birth_place}, {student.birth_date}</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px]">Nomor Registrasi:</span>
            <span className="font-mono font-extrabold text-amber-800 text-sm">{registration.registration_number}</span>
            <span className="text-slate-500 block text-[11px]">Wali: {registration.guardian?.full_name}</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px]">Observer & Lokasi:</span>
            <span className="font-bold text-slate-800">{session.observer_name}</span>
            <span className="text-slate-500 block text-[11px]">{session.room_location} ({session.start_time} - {session.end_time || 'Selesai'})</span>
          </div>
        </div>

        {/* Observation Context Narrative */}
        {session.context_description && (
          <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 text-xs text-amber-950 space-y-1">
            <span className="font-bold uppercase tracking-wider text-[11px] text-amber-900 block">
              Konteks Awal & Kondisi Ketibaan Anak:
            </span>
            <p className="leading-relaxed text-slate-700">
              {session.context_description}
            </p>
          </div>
        )}

        {/* Overall Coverage & Scoring Method Banner */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-50 via-white to-emerald-50 border border-sky-200 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Cakupan Indikator Perkembangan yang Diobservasi
              </h3>
              <p className="text-xs text-slate-600">
                {summary.overallObservedItems} dari total {summary.overallTotalItems} indikator telah diamati ({summary.overallCoveragePercentage}% cakupan)
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-mono font-extrabold text-2xl text-sky-800">
                {summary.overallCoveragePercentage}%
              </span>
            </div>
          </div>

          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-sky-600 h-full rounded-full transition-all"
              style={{ width: `${summary.overallCoveragePercentage}%` }}
            />
          </div>
        </div>

        {/* Domain Scores Breakdown Table */}
        <div className="space-y-3">
          <h3 className="font-extrabold text-slate-900 text-base">
            Pemetaan Capaian Per Domain (Skala 0–3 Non-Punitif)
          </h3>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Domain Observasi</th>
                  <th className="p-3.5 text-center">Butir Selesai</th>
                  <th className="p-3.5 text-center">Cakupan</th>
                  <th className="p-3.5 text-center">Rata-Rata Skor (0-3)</th>
                  <th className="p-3.5">Kategori Kemandirian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {summary.domainSummaries.map((s) => (
                  <tr key={s.domain_id} className="hover:bg-amber-50/20">
                    <td className="p-3.5 font-bold text-slate-900">
                      {s.domain_id}. {s.domain_name}
                    </td>
                    <td className="p-3.5 text-center font-mono">
                      {s.observed_items} / {s.total_items}
                    </td>
                    <td className="p-3.5 text-center font-mono font-semibold">
                      {s.coverage_percentage}%
                    </td>
                    <td className="p-3.5 text-center font-mono font-extrabold text-amber-800 text-sm">
                      {s.average_score !== null ? s.average_score : '—'}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                        {s.level_label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Scoring Scale Reference (Anti-Slop transparency) */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
          <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider">
            Pedoman Skala Penilaian:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600">
            <div><strong>3:</strong> Mandiri (tanpa bantuan)</div>
            <div><strong>2:</strong> Bantuan sebagian (isyarat)</div>
            <div><strong>1:</strong> Bantuan penuh (hand-under-hand)</div>
            <div><strong>0:</strong> Belum ditunjukkan</div>
          </div>
          <span className="text-[10px] text-slate-400 block pt-1 border-t border-slate-200">
            *Catatan: Item "Belum Diamati" tidak dihitung sebagai nol untuk menghindari diskriminasi terhadap keterampilan yang belum sempat diuji.
          </span>
        </div>

        {/* Narrative Synthesis & IEP Foundations */}
        {synth && (
          <div className="space-y-6 pt-2">
            
            {/* Strengths & Interests */}
            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Kekuatan & Minat Spesifik Anak (*Strengths & Motivators*)</span>
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed bg-amber-50/40 p-4 rounded-2xl border border-amber-100">
                {synth.strengths_and_interests || 'Belum diisi catatan kekuatan spesifik.'}
              </p>
            </div>

            {/* 3 Columns: Independent vs Emerging vs Assisted Skills */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                <span className="font-extrabold text-emerald-950 uppercase tracking-wider text-[11px] block">
                  Keterampilan Mandiri (Kekuatan)
                </span>
                {synth.skills_demonstrated_independently.length > 0 ? (
                  <ul className="space-y-1 text-slate-700 list-disc list-inside">
                    {synth.skills_demonstrated_independently.map((item, i) => (
                      <li key={i} className="leading-snug">{item}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-slate-400 italic">Belum ada item mandiri.</span>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-200 space-y-2">
                <span className="font-extrabold text-sky-950 uppercase tracking-wider text-[11px] block">
                  Keterampilan Sedang Berkembang
                </span>
                {synth.emerging_skills.length > 0 ? (
                  <ul className="space-y-1 text-slate-700 list-disc list-inside">
                    {synth.emerging_skills.map((item, i) => (
                      <li key={i} className="leading-snug">{item}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-slate-400 italic">Belum ada item sedang berkembang.</span>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                <span className="font-extrabold text-amber-950 uppercase tracking-wider text-[11px] block">
                  Target Bantuan & Intervensi
                </span>
                {synth.skills_requiring_assistance.length > 0 ? (
                  <ul className="space-y-1 text-slate-700 list-disc list-inside">
                    {synth.skills_requiring_assistance.map((item, i) => (
                      <li key={i} className="leading-snug">{item}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-slate-400 italic">Belum ada item bantuan.</span>
                )}
              </div>

            </div>

            {/* Environmental & Communication Supports */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
                  Dukungan Komunikasi yang Disarankan:
                </span>
                <p className="text-slate-700 leading-relaxed">
                  {synth.communication_supports || 'Belum ada catatan khusus.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
                  Akomodasi Lingkungan & Sensori:
                </span>
                <p className="text-slate-700 leading-relaxed">
                  {synth.environmental_accommodations || 'Belum ada catatan khusus.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
                  Strategi Pengajaran Efektif:
                </span>
                <p className="text-slate-700 leading-relaxed">
                  {synth.preferred_teaching_strategies || 'Belum ada catatan khusus.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
                  Kebutuhan Observasi Lanjutan:
                </span>
                <p className="text-slate-700 leading-relaxed">
                  {synth.further_observation_needs || 'Tidak ada observasi lanjutan yang mendesak.'}
                </p>
              </div>
            </div>

            {/* Recommended Follow-up */}
            <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-2">
              <span className="font-extrabold text-emerald-950 uppercase tracking-wider text-xs block">
                Rekomendasi Penempatan & Kolaborasi Layanan (Fondasi Modul 3 PPI)
              </span>
              <p className="text-xs sm:text-sm font-medium text-emerald-950 leading-relaxed">
                {synth.recommended_follow_up || 'Menunggu penetapan rapat koordinasi tim pendidik.'}
              </p>
            </div>

          </div>
        )}

        {/* Headmaster Review & Approval Section */}
        <div className="pt-6 border-t border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Pengesahan & Telaah Kepala Sekolah</span>
            </h4>
            <span className={`px-2.5 py-0.5 rounded-md font-bold text-xs border ${
              isApproved
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-sky-50 text-sky-800 border-sky-200'
            }`}>
              {session.status}
            </span>
          </div>

          {approvalFeedback && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{approvalFeedback}</span>
            </div>
          )}

          {isApproved ? (
            <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200 text-xs text-slate-700 space-y-2">
              <div className="flex items-center justify-between font-bold text-emerald-950">
                <span>Disetujui oleh: {session.reviewed_by}</span>
                <span className="text-slate-400 font-normal">{session.reviewed_at ? formatIndonesianDate(session.reviewed_at, true) : ''}</span>
              </div>
              <p className="leading-relaxed bg-white p-3 rounded-xl border border-emerald-100">
                "{session.headmaster_review_notes}"
              </p>
            </div>
          ) : canApprove ? (
            <div className="no-print p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <label className="block text-xs font-bold text-slate-800">
                Catatan Telaah Kepala Sekolah:
              </label>
              <textarea
                rows={2}
                value={headmasterNotes}
                onChange={(e) => setHeadmasterNotes(e.target.value)}
                placeholder="Tuliskan catatan arahan Kepala Sekolah untuk penyusunan PPI atau rujukan spesifik..."
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-900"
              />
              <button
                type="button"
                disabled={isApproving}
                onClick={handleApprove}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isApproving ? 'Menyimpan...' : 'Setujui & Sahkan Laporan Observasi'}</span>
              </button>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">
              Laporan sedang menunggu proses telaah dan pengesahan resmi dari Kepala Sekolah Little Star School.
            </p>
          )}

          {/* Signatures Row */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs text-slate-600">
            <div className="space-y-12">
              <span>Observer Penilai,</span>
              <div>
                <p className="font-bold text-slate-900 underline">{session.observer_name}</p>
                <p className="text-[11px] text-slate-400">Guru / Psikolog Khusus</p>
              </div>
            </div>

            <div className="space-y-12">
              <span>Mengetahui & Menyetujui,</span>
              <div>
                <p className="font-bold text-slate-900 underline">
                  {session.reviewed_by || 'Dra. Hj. Nurul Komariyah'}
                </p>
                <p className="text-[11px] text-slate-400">Kepala Little Star School Pamekasan</p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

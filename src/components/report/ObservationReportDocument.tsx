import React from 'react';
import { ObservationReport, LearningRecommendation } from '../../types/report';
import { Student, Registration, SchoolSettings } from '../../types/database';
import { ObservationSession, ObservationItem } from '../../types/observation';
import { OBSERVATION_DOMAINS } from '../../lib/observationData';
import { calculateAllDomainsSummary, SCORING_EXPLANATIONS } from '../../lib/scoringEngine';
import { repository } from '../../lib/repository';
import { formatIndonesianDate, formatShortDate } from '../../lib/utils';
import { StarLogo } from '../common/StarLogo';
import { 
  Printer, 
  Download, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  AlertCircle, 
  Clock, 
  User, 
  FileCheck2, 
  Award,
  Layers,
  ArrowLeft
} from 'lucide-react';

interface ObservationReportDocumentProps {
  report: ObservationReport;
  session: ObservationSession;
  student: Student;
  registration: Registration;
  settings: SchoolSettings;
  recommendations?: LearningRecommendation[];
  onBack?: () => void;
  onEditRecommendations?: () => void;
  onOpenReviewModal?: () => void;
  canReview?: boolean;
}

export const ObservationReportDocument: React.FC<ObservationReportDocumentProps> = ({
  report,
  session,
  student,
  registration,
  settings,
  recommendations = [],
  onBack,
  onEditRecommendations,
  onOpenReviewModal,
  canReview = false,
}) => {
  const observationItems = repository.getObservationItems();
  const { domainSummaries } = calculateAllDomainsSummary(OBSERVATION_DOMAINS, observationItems, session.responses);
  const responses = session.responses || {};

  // Group items by score
  const independentItems: { item: ObservationItem; resp: any }[] = [];
  const assistedItems: { item: ObservationItem; resp: any }[] = [];
  const notDemonstratedItems: { item: ObservationItem; resp: any }[] = [];
  const notObservedItems: ObservationItem[] = [];

  observationItems.filter(i => i.is_active).forEach((item) => {
    const resp = responses[item.id] || responses[item.code];
    if (!resp || resp.score === 'not_observed') {
      notObservedItems.push(item);
    } else if (resp.score === 3) {
      independentItems.push({ item, resp });
    } else if (resp.score === 1 || resp.score === 2) {
      assistedItems.push({ item, resp });
    } else if (resp.score === 0) {
      notDemonstratedItems.push({ item, resp });
    }
  });

  const isApproved = report.status === 'Disetujui Kepala Sekolah';

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadStandaloneHtml = () => {
    const el = document.getElementById('printable-report-content');
    if (!el) return;

    const htmlContent = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Laporan Observasi - ${student.full_name} (${report.report_number})</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @media print {
      @page { size: A4; margin: 15mm; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }
      .page-break { page-break-before: always; }
      .avoid-break { break-inside: avoid; page-break-inside: avoid; }
    }
    body { font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
  </style>
</head>
<body class="bg-white text-slate-800 p-8 max-w-4xl mx-auto">
  ${el.innerHTML}
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Laporan_Observasi_${student.preferred_name}_${report.report_number.replace(/[\/\\?%*:|"<>]/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Action Toolbar (Hidden during print) */}
      <div className="no-print bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              title="Kembali"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                isApproved 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                  : report.status === 'Perlu Revisi'
                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                  : report.status === 'Diajukan untuk Telaah'
                  ? 'bg-sky-50 text-sky-800 border-sky-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
                {report.status} (v{report.current_version})
              </span>
              <span className="font-mono text-xs text-slate-500 font-bold">
                {report.report_number}
              </span>
            </div>
            <h2 className="text-base font-extrabold text-slate-900 mt-0.5">
              Pratinjau Dokumen Resmi Hasil Observasi ABK
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onEditRecommendations && (
            <button
              onClick={onEditRecommendations}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-bold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Kelola Rekomendasi PPI</span>
            </button>
          )}

          {canReview && onOpenReviewModal && (
            <button
              onClick={onOpenReviewModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Telaah Kepala Sekolah</span>
            </button>
          )}

          <button
            onClick={handleDownloadStandaloneHtml}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
            title="Unduh file dokumen HTML mandiri yang siap dibuka offline"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Unduh Dokumen</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Dokumen (A4)</span>
          </button>
        </div>
      </div>

      {/* Main Printable A4 Document Sheet */}
      <div 
        id="printable-report-content"
        className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-md max-w-4xl mx-auto space-y-8 text-slate-800 leading-relaxed print:p-0 print:border-none print:shadow-none print:max-w-none"
      >
        
        {/* Confidential Security Watermark & Header */}
        <div className="border-b-2 border-slate-900 pb-5 space-y-2">
          
          <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-widest text-rose-700 bg-rose-50 px-3 py-1 rounded-md border border-rose-200 avoid-break">
            <span>DOKUMEN RAHASIA — INFORMASI PERKEMBANGAN ANAK</span>
            <span className="font-mono">{report.report_number}</span>
          </div>

          {/* Section 1: School Header & Logo */}
          <div className="flex items-center justify-between gap-6 pt-3">
            <div className="flex items-center gap-4">
              <StarLogo size={52} className="shrink-0 text-amber-500" />
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight uppercase">
                  {settings.school_name}
                </h1>
                <p className="text-xs text-amber-700 font-bold">
                  {settings.tagline}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {settings.address} · Telp: {settings.phone} · WA: {settings.whatsapp_number} · Email: {settings.email}
                </p>
              </div>
            </div>

            <div className="text-right hidden sm:block">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Status Akreditasi
              </span>
              <span className="text-xs font-black text-slate-800 font-mono">
                {settings.accreditation}
              </span>
            </div>
          </div>
        </div>

        {/* Report Title */}
        <div className="text-center space-y-1 pb-2 avoid-break">
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-950 uppercase tracking-wide">
            LAPORAN OBSERVASI & ASESMEN KESIAPAN BELAJAR
          </h2>
          <p className="text-xs text-slate-500">
            Pemetaan Kebutuhan Belajar & Profil Perkembangan Anak Berkebutuhan Khusus (ABK)
          </p>
          <div className="w-16 h-1 bg-amber-500 mx-auto rounded-full mt-2" />
        </div>

        {/* Section 2, 3, 4: Metadata, Student Identity, Observation Date & Observer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs avoid-break">
          
          {/* Identity */}
          <div className="space-y-1.5">
            <div className="font-extrabold text-slate-900 uppercase text-[11px] pb-1 border-b border-slate-200">
              Identitas Peserta Didik
            </div>
            <div className="grid grid-cols-3 gap-1">
              <span className="text-slate-500">Nama Lengkap:</span>
              <span className="col-span-2 font-bold text-slate-900">{student.full_name}</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <span className="text-slate-500">Nama Panggilan:</span>
              <span className="col-span-2 font-bold text-slate-800">"{student.preferred_name}"</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <span className="text-slate-500">TTL / Usia:</span>
              <span className="col-span-2 text-slate-800">{student.birth_place}, {formatIndonesianDate(student.birth_date)} ({student.calculated_age || '-'})</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <span className="text-slate-500">Jenis Kelamin:</span>
              <span className="col-span-2 text-slate-800">{student.gender}</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <span className="text-slate-500">Orang Tua / Wali:</span>
              <span className="col-span-2 font-semibold text-slate-800">{registration.guardian?.full_name} ({registration.guardian?.relationship})</span>
            </div>
          </div>

          {/* Observation Details */}
          <div className="space-y-1.5">
            <div className="font-extrabold text-slate-900 uppercase text-[11px] pb-1 border-b border-slate-200">
              Keterangan Pelaksanaan
            </div>
            <div className="grid grid-cols-3 gap-1">
              <span className="text-slate-500">No. Laporan:</span>
              <span className="col-span-2 font-mono font-bold text-amber-800">{report.report_number}</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <span className="text-slate-500">Tanggal Observasi:</span>
              <span className="col-span-2 font-semibold text-slate-800">{formatIndonesianDate(report.observation_date)}</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <span className="text-slate-500">Waktu & Tempat:</span>
              <span className="col-span-2 text-slate-800">{session.start_time} - {session.end_time || 'Selesai'} WIB · {session.room_location}</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <span className="text-slate-500">Guru Observer:</span>
              <span className="col-span-2 font-bold text-slate-900">{report.observer_name}</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <span className="text-slate-500">Status Dokumen:</span>
              <span className="col-span-2 font-bold text-emerald-800">{report.status}</span>
            </div>
          </div>

        </div>

        {/* Section 5 & 6: Purpose of Observation & Activities / Methods Used */}
        <div className="space-y-4 text-xs avoid-break">
          <div className="p-4 rounded-2xl border border-slate-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900 uppercase text-[11px]">
                5. Tujuan Observasi & Asesmen
              </span>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                [Interpretasi Edukasi Profesional]
              </span>
            </div>
            <p className="text-slate-700 leading-relaxed text-[11px]">
              {report.purpose_of_observation}
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900 uppercase text-[11px]">
                6. Aktivitas & Metode yang Digunakan
              </span>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                [Observasi Langsung Guru] + [Wawancara Orang Tua]
              </span>
            </div>
            <p className="text-slate-700 leading-relaxed text-[11px]">
              {report.activities_and_methods}
            </p>
          </div>
        </div>

        {/* Section 7: Observation Category Summaries (7 Domains Table) */}
        <div className="space-y-2 avoid-break">
          <div className="flex items-center justify-between pb-1 border-b border-slate-200">
            <span className="font-extrabold text-slate-900 uppercase text-xs">
              7. Ringkasan Capaian 7 Domain Perkembangan
            </span>
            <span className="text-[10px] text-slate-500 italic">
              Skala 0–3 Non-Punitif (Belum diamati tidak dihitung 0)
            </span>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 font-bold text-slate-700 text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Domain Perkembangan</th>
                  <th className="py-2.5 px-3 text-center">Cakupan Indikator</th>
                  <th className="py-2.5 px-3 text-center">Rata-rata Skor</th>
                  <th className="py-2.5 px-3">Tingkat Kemandirian / Deskripsi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {domainSummaries.map((summary) => (
                  <tr key={summary.domain_id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      Domain {summary.domain_id}: {summary.domain_name}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">
                      {summary.observed_items}/{summary.total_items} ({summary.coverage_percentage}%)
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-amber-800">
                      {summary.average_score !== null ? `${summary.average_score} / 3.0` : '-'}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-semibold text-slate-800 text-[11px] bg-slate-100 px-2 py-0.5 rounded">
                        {summary.level_label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 8: Child's Strengths and Interests */}
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5 avoid-break">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-amber-950 uppercase text-xs flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>8. Kekuatan & Minat Khusus Anak (Strengths & Interests)</span>
            </span>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
              [Observasi Langsung Guru]
            </span>
          </div>
          <p className="text-amber-950 leading-relaxed text-xs">
            {session.synthesis?.strengths_and_interests || 'Ketertarikan visual yang sangat tinggi terhadap angka, puzzle bentuk, dan keteraturan balok. Daya konsentrasi visual sangat baik saat terlibat pada aktivitas yang diminati.'}
          </p>
        </div>

        {/* Section 9, 10, 11, 12: Skill Categorization Grids */}
        <div className="space-y-3 avoid-break">
          <div className="font-extrabold text-slate-900 uppercase text-xs pb-1 border-b border-slate-200">
            Klasifikasi Keterampilan Berdasarkan Hasil Pengamatan
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            
            {/* Section 9: Independently demonstrated skills (Skor 3) */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-950 text-[11px]">
                  9. Keterampilan Mandiri (Skor 3)
                </span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  {independentItems.length} Butir
                </span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-emerald-900 text-[11px]">
                {independentItems.length === 0 ? (
                  <li className="italic text-emerald-700">Belum ada butir yang tercatat mandiri penuh.</li>
                ) : (
                  independentItems.map(({ item }) => (
                    <li key={item.id}>
                      <strong>{item.code}:</strong> {item.title}
                    </li>
                  ))
                )}
              </ul>
            </div>

            {/* Section 10: Skills demonstrated with assistance (Skor 1-2) */}
            <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sky-950 text-[11px]">
                  10. Keterampilan dengan Bantuan / Muncul (Skor 1–2)
                </span>
                <span className="text-[10px] font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded">
                  {assistedItems.length} Butir
                </span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-sky-900 text-[11px]">
                {assistedItems.length === 0 ? (
                  <li className="italic text-sky-700">Tidak ada butir dalam kategori ini.</li>
                ) : (
                  assistedItems.map(({ item, resp }) => (
                    <li key={item.id}>
                      <strong>{item.code}:</strong> {item.title} <span className="text-[10px] text-sky-700 italic">({resp.prompting_level || 'Dengan bantuan'})</span>
                    </li>
                  ))
                )}
              </ul>
            </div>

            {/* Section 11: Skills not yet demonstrated (Skor 0) */}
            <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-950 text-[11px]">
                  11. Belum Ditunjukkan pada Kesempatan (Skor 0)
                </span>
                <span className="text-[10px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded">
                  {notDemonstratedItems.length} Butir
                </span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-rose-900 text-[11px]">
                {notDemonstratedItems.length === 0 ? (
                  <li className="italic text-rose-700">Seluruh butir yang diuji menunjukkan respon positif.</li>
                ) : (
                  notDemonstratedItems.map(({ item }) => (
                    <li key={item.id}>
                      <strong>{item.code}:</strong> {item.title}
                    </li>
                  ))
                )}
              </ul>
            </div>

            {/* Section 12: Skills not yet observed */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 text-[11px]">
                  12. Belum Sempat Diamati (Non-Punitif)
                </span>
                <span className="text-[10px] font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded">
                  {notObservedItems.length} Butir
                </span>
              </div>
              <p className="text-[11px] text-slate-500 italic">
                {notObservedItems.length} indikator belum dieksplorasi karena keterbatasan waktu sesi awal atau anak belum siap; akan diobservasi berkala saat masa adaptasi kelas.
              </p>
            </div>

          </div>
        </div>

        {/* Section 13-17: Specific Needs by Area */}
        <div className="space-y-3 avoid-break">
          <div className="font-extrabold text-slate-900 uppercase text-xs pb-1 border-b border-slate-200">
            Analisis Kebutuhan Dukungan Khusus (Domain Spesifik)
          </div>

          <div className="space-y-2 text-xs">
            
            <div className="p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-start justify-between gap-2">
              <div className="space-y-0.5 flex-1">
                <span className="font-bold text-slate-900 block text-[11px]">
                  13. Kebutuhan Dukungan Komunikasi & Bahasa:
                </span>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  {report.communication_support_needs}
                </p>
              </div>
              <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-bold self-start">
                [Interpretasi Edukasi]
              </span>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-start justify-between gap-2">
              <div className="space-y-0.5 flex-1">
                <span className="font-bold text-slate-900 block text-[11px]">
                  14. Kebutuhan Dukungan Sosial-Emosional:
                </span>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  {report.social_emotional_support_needs}
                </p>
              </div>
              <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-bold self-start">
                [Interpretasi Edukasi]
              </span>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-start justify-between gap-2">
              <div className="space-y-0.5 flex-1">
                <span className="font-bold text-slate-900 block text-[11px]">
                  15. Kebutuhan Belajar Kognitif & Pra-Akademik:
                </span>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  {report.cognitive_preacademic_needs}
                </p>
              </div>
              <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-bold self-start">
                [Interpretasi Edukasi]
              </span>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-start justify-between gap-2">
              <div className="space-y-0.5 flex-1">
                <span className="font-bold text-slate-900 block text-[11px]">
                  16. Keterampilan Motorik & Kemandirian Sehari-hari:
                </span>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  {report.motor_and_daily_living_needs}
                </p>
              </div>
              <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-bold self-start">
                [Observasi + Laporan Ortu]
              </span>
            </div>

            <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/40 flex flex-col sm:flex-row sm:items-start justify-between gap-2">
              <div className="space-y-0.5 flex-1">
                <span className="font-bold text-amber-950 block text-[11px]">
                  17. Akomodasi Sensori & Penataan Lingkungan Belajar:
                </span>
                <p className="text-slate-700 leading-relaxed text-[11px]">
                  {report.sensory_environmental_accommodations}
                </p>
              </div>
              <span className="text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded font-bold self-start">
                [Akomodasi Wajib]
              </span>
            </div>

          </div>
        </div>

        {/* Section 18-20: Direction & Learning Recommendations Table */}
        <div className="space-y-3 avoid-break">
          <div className="font-extrabold text-slate-900 uppercase text-xs pb-1 border-b border-slate-200">
            18. Rekomendasi Sasaran Belajar & Program Pembelajaran Individual (PPI Awal)
          </div>

          {recommendations.length > 0 && (
            <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 font-bold text-slate-700 text-[11px]">
                  <tr>
                    <th className="py-2 px-3">No</th>
                    <th className="py-2 px-3">Kategori</th>
                    <th className="py-2 px-3">Keterampilan Sasaran & Strategi</th>
                    <th className="py-2 px-3">Tingkat Bantuan</th>
                    <th className="py-2 px-3">Evaluasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {recommendations.map((rec, idx) => (
                    <tr key={rec.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-mono font-bold text-slate-500">{idx + 1}</td>
                      <td className="py-2 px-3 font-semibold text-amber-800">{rec.category}</td>
                      <td className="py-2 px-3">
                        <span className="font-bold text-slate-900 block">{rec.target_skill}</span>
                        <span className="text-slate-500 text-[10px] block mt-0.5">{rec.suggested_strategy}</span>
                      </td>
                      <td className="py-2 px-3 text-slate-700">{rec.assistance_level}</td>
                      <td className="py-2 px-3 text-slate-600 font-mono text-[10px]">{rec.review_period}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Section 19 & 20 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 block text-[11px]">
                19. Saran Strategi Pengajaran Umum:
              </span>
              <p className="text-slate-600 text-[11px] leading-relaxed whitespace-pre-line">
                {report.suggested_teaching_strategies}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 block text-[11px]">
                20. Rekomendasi Tindak Lanjut & Rujukan Terapi:
              </span>
              <p className="text-slate-600 text-[11px] leading-relaxed whitespace-pre-line">
                {report.follow_up_recommendations}
              </p>
            </div>
          </div>
        </div>

        {/* Section 21, 22, 23: Signatures & Approvals */}
        <div className="pt-6 border-t-2 border-slate-900 space-y-6 avoid-break">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-xs">
            
            {/* Section 21: Observer Signature */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">
                21. Guru Observer / Asesor
              </span>
              
              <div className="py-4">
                <span className="font-script text-2xl text-slate-700 italic select-none">
                  {report.observer_name.split(',')[0]}
                </span>
                <span className="text-[10px] text-emerald-700 font-bold block mt-1">
                  ✓ Ditandatangani Digital ({formatShortDate(report.observer_signed_at || report.created_at)})
                </span>
              </div>

              <div>
                <strong className="block text-slate-900">{report.observer_name}</strong>
                <span className="text-[11px] text-slate-500">{report.observer_title}</span>
              </div>
            </div>

            {/* Section 22: Headmaster Approval */}
            <div className="p-4 rounded-2xl border-2 border-amber-300 bg-amber-50/40 space-y-3 relative">
              <span className="text-[11px] font-bold text-amber-900 uppercase block">
                22. Mengetahui & Menyetujui
              </span>

              <div className="py-4 relative">
                {isApproved ? (
                  <div className="inline-block border-2 border-emerald-600 rounded-xl px-3 py-1 bg-white/90 rotate-[-3deg] shadow-2xs">
                    <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest block">
                      DISETUJUI RESMI
                    </span>
                    <span className="text-[9px] text-emerald-600 block">
                      {formatShortDate(report.headmaster_approved_at || report.updated_at)}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-amber-800 italic block py-2">
                    Menunggu Telaah Kepala Sekolah
                  </span>
                )}
              </div>

              <div>
                <strong className="block text-slate-900">{report.headmaster_name}</strong>
                <span className="text-[11px] text-slate-500">Kepala Sekolah Little Star School</span>
              </div>
            </div>

            {/* Section 23: Parent Acknowledgment */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">
                23. Lembar Diketahui Orang Tua
              </span>

              <div className="py-4">
                {report.parent_acknowledgment?.is_acknowledged ? (
                  <span className="text-xs font-bold text-emerald-700 block">
                    ✓ Telah Didiskusikan Bersama
                  </span>
                ) : (
                  <div className="h-8 border-b border-dashed border-slate-400 mx-6" />
                )}
                <span className="text-[10px] text-slate-400 block mt-1">
                  Tanda Tangan / Konfirmasi Orang Tua
                </span>
              </div>

              <div>
                <strong className="block text-slate-900">
                  {report.parent_acknowledgment?.parent_name || registration.guardian?.full_name}
                </strong>
                <span className="text-[11px] text-slate-500">Orang Tua / Wali Murid</span>
              </div>
            </div>

          </div>

          {/* Footer Official Notice */}
          <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-slate-100">
            Laporan ini merupakan bagian integral dari Sistem Admisi & Observasi Perkembangan Little Star School Pamekasan. Dilarang menggandakan dokumen ini tanpa izin resmi sekolah dan wali murid yang bersangkutan.
          </div>

        </div>

      </div>

    </div>
  );
};

import { Registration } from '../types/database';
import { ObservationSession } from '../types/observation';
import { ObservationReport } from '../types/report';
import { AdmissionDecision } from '../types/admin';
import { OBSERVATION_DOMAINS, DEFAULT_OBSERVATION_ITEMS } from './observationData';
import { calculateDomainSummary } from './scoringEngine';

export interface CsvExportOptions {
  includeSensitiveClinicalData: boolean; // UU PDP No. 27/2022 compliance
}

/**
 * Escapes CSV values for spreadsheet compatibility (Excel, Google Sheets).
 */
function escapeCsv(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Exports Admissions & Registrations into standard CSV.
 */
export function exportAdmissionsToCsv(
  registrations: Registration[],
  decisions: AdmissionDecision[],
  options: CsvExportOptions
): string {
  const headers = [
    'No. Pendaftaran',
    'Tanggal Daftar',
    'Nama Lengkap Siswa',
    'Nama Panggilan',
    'Usia',
    'Jenis Kelamin',
    'Status Alur Admisi',
    'Keputusan Akhir Admisi',
    'Tanggal Keputusan',
    'Pengambil Keputusan',
    'Rekomendasi Program',
    'Tindak Lanjut',
    'Nama Wali / Orang Tua',
    'Kontak WhatsApp Wali',
    'Status Jadwal Observasi',
    'Tanggal Jadwal',
    'Observer Ditugaskan',
  ];

  if (options.includeSensitiveClinicalData) {
    headers.push('Preferensi Sensori (Sensitif)', 'Riwayat Terapi (Sensitif)', 'Catatan Kemandirian Harian (Sensitif)');
  }

  const rows: string[][] = [];

  for (const reg of registrations) {
    const decision = decisions.find(d => d.registration_id === reg.id);
    const row = [
      reg.registration_number,
      reg.submission_date ? reg.submission_date.substring(0, 10) : '-',
      reg.student?.full_name || '-',
      reg.student?.preferred_name || '-',
      reg.student?.calculated_age || '-',
      reg.student?.gender || '-',
      reg.status,
      decision ? decision.decision_status : 'Belum Dicatat',
      decision?.decision_date || '-',
      decision?.decision_maker || '-',
      decision?.recommended_program || '-',
      decision?.follow_up_action || '-',
      reg.guardian?.full_name || '-',
      reg.guardian?.whatsapp_number || '-',
      reg.appointment?.status || 'Belum Dijadwalkan',
      reg.appointment?.appointment_date || '-',
      reg.appointment?.observer_name || '-',
    ];

    if (options.includeSensitiveClinicalData) {
      row.push(
        reg.developmental_background?.sensory_preferences?.join('; ') || '-',
        reg.developmental_background?.previous_therapy_support?.join('; ') || '-',
        `Makan: ${reg.developmental_background?.daily_living_skills?.eating || '-'}, Toilet: ${reg.developmental_background?.daily_living_skills?.toileting || '-'}`
      );
    }

    rows.push(row);
  }

  // UTF-8 BOM ensures Excel decodes special accents and Indonesian characters correctly
  const csvContent = '\uFEFF' + [
    headers.map(escapeCsv).join(','),
    ...rows.map(row => row.map(escapeCsv).join(',')),
  ].join('\r\n');

  return csvContent;
}

/**
 * Exports Observations & Reports summary to CSV.
 */
export function exportObservationsToCsv(
  sessions: ObservationSession[],
  reports: ObservationReport[],
  options: CsvExportOptions
): string {
  const headers = [
    'ID Sesi',
    'ID Registrasi',
    'ID Siswa',
    'Tanggal Sesi',
    'Nama Guru Observer',
    'Status Sesi Observasi',
    'Rerata Skor Komunikasi (0-3)',
    'Rerata Skor Sosial-Emosional (0-3)',
    'Rerata Skor Kognitif (0-3)',
    'Rerata Skor Motorik (0-3)',
    'Rerata Skor Kemandirian (0-3)',
    'Rerata Skor Kesiapan Belajar (0-3)',
    'Rerata Skor Sensori (0-3)',
    'Status Laporan Kepala Sekolah',
    'Nomor Laporan Resmi',
  ];

  if (options.includeSensitiveClinicalData) {
    headers.push('Akomodasi Sensori & Lingkungan (Sensitif)', 'Deskripsi Konteks Kedatangan (Sensitif)');
  }

  const rows: string[][] = [];

  for (const sess of sessions) {
    const rep = reports.find(r => r.session_id === sess.id || r.student_id === sess.student_id);
    const domainSummaries = OBSERVATION_DOMAINS.map(d => calculateDomainSummary(d, DEFAULT_OBSERVATION_ITEMS, sess.responses || {}));

    const getScoreStr = (index: number) => {
      const summary = domainSummaries[index];
      return summary?.average_score !== null && summary?.average_score !== undefined
        ? `${summary.average_score} / 3.0`
        : 'Belum Dinilai';
    };

    const row = [
      sess.id,
      sess.registration_id,
      sess.student_id,
      sess.session_date,
      sess.observer_name,
      sess.status,
      getScoreStr(0), // Komunikasi
      getScoreStr(1), // Sosial & Emosional
      getScoreStr(2), // Kognitif
      getScoreStr(3), // Motorik
      getScoreStr(4), // Kemandirian
      getScoreStr(5), // Bermain & Kesiapan Belajar
      getScoreStr(6), // Sensori & Lingkungan
      rep?.status || 'Belum Dibuat',
      rep?.report_number || '-',
    ];

    if (options.includeSensitiveClinicalData) {
      row.push(
        rep?.sensory_environmental_accommodations || '-',
        sess.context_description || '-'
      );
    }

    rows.push(row);
  }

  const csvContent = '\uFEFF' + [
    headers.map(escapeCsv).join(','),
    ...rows.map(row => row.map(escapeCsv).join(',')),
  ].join('\r\n');

  return csvContent;
}

/**
 * Triggers browser download for generated file.
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/csv;charset=utf-8;'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

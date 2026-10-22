import React, { useState, useMemo } from 'react';
import { ObservationReport, ReportVersion, ReportStatus } from '../../types/report';
import { Registration, Student, SchoolSettings } from '../../types/database';
import { repository } from '../../lib/repository';
import { formatIndonesianDate, formatShortDate } from '../../lib/utils';
import { 
  Search, 
  Filter, 
  FileText, 
  Calendar, 
  User, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  Printer, 
  Download, 
  History, 
  Sparkles, 
  ShieldCheck, 
  RotateCcw,
  BookOpen,
  ChevronRight,
  X
} from 'lucide-react';
import { StarLogo } from '../common/StarLogo';

interface ReportArchiveViewProps {
  reports: ObservationReport[];
  registrations: Registration[];
  settings: SchoolSettings;
  currentRole: 'observer' | 'principal' | 'staff' | 'admin';
  onOpenReportDocument: (report: ObservationReport) => void;
  onOpenRecommendations: (report: ObservationReport) => void;
  onReviewReport: (report: ObservationReport) => void;
}

export const ReportArchiveView: React.FC<ReportArchiveViewProps> = ({
  reports,
  registrations,
  settings,
  currentRole,
  onOpenReportDocument,
  onOpenRecommendations,
  onReviewReport,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedObserver, setSelectedObserver] = useState<string>('all');
  const [selectedVersionHistoryReport, setSelectedVersionHistoryReport] = useState<ObservationReport | null>(null);

  // Distinct observer names
  const observersList = useMemo(() => {
    const set = new Set<string>();
    reports.forEach(r => {
      if (r.observer_name) set.add(r.observer_name);
    });
    return Array.from(set);
  }, [reports]);

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      const student = registrations.find(reg => reg.student_id === r.student_id)?.student;
      const studentName = student?.full_name?.toLowerCase() || '';
      const preferredName = student?.preferred_name?.toLowerCase() || '';
      const reportNum = r.report_number.toLowerCase();
      const observerName = r.observer_name.toLowerCase();

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches = studentName.includes(q) || preferredName.includes(q) || reportNum.includes(q) || observerName.includes(q);
        if (!matches) return false;
      }

      // Status
      if (selectedStatus !== 'all' && r.status !== selectedStatus) {
        return false;
      }

      // Observer
      if (selectedObserver !== 'all' && r.observer_name !== selectedObserver) {
        return false;
      }

      return true;
    });
  }, [reports, registrations, searchQuery, selectedStatus, selectedObserver]);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <StarLogo size={22} />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
              Modul 3: Arsip & Laporan Observasi Resmi
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">
            Arsip Laporan Observasi & Rekomendasi PPI
          </h2>
          <p className="text-xs text-slate-500">
            Pusat penyimpanan laporan resmi, pelacakan riwayat versi telaah Kepala Sekolah, dan ekspor dokumen A4.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-xs font-bold text-slate-700">
            Total {reports.length} Laporan Terarsip
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama siswa / nomor laporan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Observer Filter */}
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-slate-400" />
              <select
                value={selectedObserver}
                onChange={(e) => setSelectedObserver(e.target.value)}
                className="p-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700"
              >
                <option value="all">Semua Observer</option>
                {observersList.map(obs => (
                  <option key={obs} value={obs}>{obs}</option>
                ))}
              </select>
            </div>
          </div>

        </div>

        {/* Status Segmented Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto text-xs">
          {[
            { id: 'all', label: 'Semua Status' },
            { id: 'Draf Laporan', label: 'Draf Laporan' },
            { id: 'Diajukan untuk Telaah', label: 'Diajukan' },
            { id: 'Perlu Revisi', label: 'Perlu Revisi' },
            { id: 'Disetujui Kepala Sekolah', label: 'Disetujui Resmi' },
          ].map(st => (
            <button
              key={st.id}
              onClick={() => setSelectedStatus(st.id)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedStatus === st.id
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Table / Card List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">No. Laporan</th>
                <th className="py-3.5 px-4">Nama Siswa</th>
                <th className="py-3.5 px-4">Guru Observer</th>
                <th className="py-3.5 px-4">Status & Versi</th>
                <th className="py-3.5 px-4">Tanggal Observasi</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 space-y-2">
                    <p className="font-semibold text-sm">Tidak ada laporan yang sesuai dengan filter.</p>
                    <button
                      onClick={() => { setSearchQuery(''); setSelectedStatus('all'); setSelectedObserver('all'); }}
                      className="text-xs text-amber-600 font-bold hover:underline"
                    >
                      Reset Filter
                    </button>
                  </td>
                </tr>
              ) : (
                filteredReports.map((rep) => {
                  const student = registrations.find(r => r.student_id === rep.student_id)?.student;
                  const isApproved = rep.status === 'Disetujui Kepala Sekolah';
                  const recCount = repository.getLearningRecommendations(rep.id).length;

                  return (
                    <tr key={rep.id} className="hover:bg-amber-50/20 transition-colors">
                      
                      {/* Report Number */}
                      <td className="py-4 px-4 sm:px-6 font-mono font-bold text-amber-900 whitespace-nowrap">
                        {rep.report_number}
                      </td>

                      {/* Student Name */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900 text-sm">{student?.full_name}</div>
                        <div className="text-slate-500 text-xs">
                          "{student?.preferred_name}" · Usia: {student?.calculated_age || '-'}
                        </div>
                      </td>

                      {/* Observer */}
                      <td className="py-4 px-4 text-xs font-semibold text-slate-800">
                        {rep.observer_name}
                      </td>

                      {/* Status & Version */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-block border ${
                          isApproved
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : rep.status === 'Perlu Revisi'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : rep.status === 'Diajukan untuk Telaah'
                            ? 'bg-sky-50 text-sky-800 border-sky-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {rep.status}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1 font-mono">
                          <span>Versi {rep.current_version}</span>
                          <span>· {recCount} Rekomendasi</span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 text-xs text-slate-600 whitespace-nowrap">
                        {formatShortDate(rep.observation_date)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* View / Print Full Report */}
                          <button
                            onClick={() => onOpenReportDocument(rep)}
                            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                            title="Pratinjau & Cetak Dokumen Resmi A4"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Lihat & Cetak</span>
                          </button>

                          {/* Learning Recommendations */}
                          <button
                            onClick={() => onOpenRecommendations(rep)}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                            title="Kelola Rekomendasi PPI Individual"
                          >
                            Rekomendasi ({recCount})
                          </button>

                          {/* Version History */}
                          <button
                            onClick={() => setSelectedVersionHistoryReport(rep)}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs transition-colors cursor-pointer"
                            title="Lihat Riwayat Versi & Audit Log"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>

                          {/* Headmaster Review */}
                          {(currentRole === 'principal' || currentRole === 'admin') && !isApproved && (
                            <button
                              onClick={() => onReviewReport(rep)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
                              title="Telaah Kepala Sekolah"
                            >
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Telaah</span>
                            </button>
                          )}

                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Menampilkan {filteredReports.length} dari {reports.length} laporan observasi</span>
          <span className="font-semibold text-slate-600">Little Star School Assessment Archive</span>
        </div>

      </div>

      {/* Version History Modal */}
      {selectedVersionHistoryReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative my-6 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Riwayat Versi Dokumen & Audit Log
                </h3>
              </div>
              <button
                onClick={() => setSelectedVersionHistoryReport(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-500 font-mono">
              Laporan #{selectedVersionHistoryReport.report_number}
            </div>

            {/* Versions timeline */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {(selectedVersionHistoryReport.versions || []).map((ver) => (
                <div key={ver.version_number} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-amber-800">Versi {ver.version_number}</span>
                    <span className="text-slate-400 text-[10px]">{formatIndonesianDate(ver.created_at)}</span>
                  </div>
                  <div className="text-slate-700">
                    Oleh: <strong>{ver.created_by_name}</strong> ({ver.created_by_role})
                  </div>
                  <p className="text-slate-500 text-[11px] italic bg-white p-2 rounded-lg border border-slate-100">
                    "{ver.change_summary}"
                  </p>
                </div>
              ))}
            </div>

            {/* Review audit trail */}
            {selectedVersionHistoryReport.review_logs && selectedVersionHistoryReport.review_logs.length > 0 && (
              <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
                <span className="font-bold text-slate-800 block text-[11px]">
                  Log Tindakan Telaah & Persetujuan:
                </span>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {selectedVersionHistoryReport.review_logs.map(log => (
                    <div key={log.id} className="p-2 rounded-xl bg-amber-50/50 border border-amber-200/60 text-[11px] space-y-0.5">
                      <div className="flex items-center justify-between font-semibold text-slate-800">
                        <span>{log.reviewer_name} ({log.action})</span>
                        <span className="text-slate-400 text-[10px]">{formatShortDate(log.timestamp)}</span>
                      </div>
                      <p className="text-slate-600">"{log.notes}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedVersionHistoryReport(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

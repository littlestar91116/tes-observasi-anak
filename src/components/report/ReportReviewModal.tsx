import React, { useState } from 'react';
import { ObservationReport } from '../../types/report';
import { repository } from '../../lib/repository';
import { formatIndonesianDate, formatShortDate } from '../../lib/utils';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  Send, 
  FileText, 
  History,
  Sparkles,
  Award
} from 'lucide-react';
import { StarLogo } from '../common/StarLogo';

interface ReportReviewModalProps {
  report: ObservationReport;
  isOpen: boolean;
  onClose: () => void;
  onReviewed: (updatedReport: ObservationReport) => void;
}

export const ReportReviewModal: React.FC<ReportReviewModalProps> = ({
  report,
  isOpen,
  onClose,
  onReviewed,
}) => {
  const [action, setAction] = useState<'approve' | 'request_revision'>('approve');
  const [reviewNotes, setReviewNotes] = useState(report.headmaster_approval_notes || '');
  const [reviewerName, setReviewerName] = useState('Dra. Hj. Nurul Komariyah');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewNotes.trim() && action === 'request_revision') {
      alert('Wajib mencantumkan catatan perbaikan jika meminta revisi kepada guru observer.');
      return;
    }

    setIsSubmitting(true);
    const updated = repository.reviewReport(
      report.id,
      action,
      reviewNotes.trim(),
      reviewerName.trim(),
      'principal'
    );
    setIsSubmitting(false);

    if (updated) {
      setFeedback(action === 'approve' ? 'Laporan berhasil disetujui & disahkan.' : 'Permintaan revisi telah dikirim ke observer.');
      setTimeout(() => {
        onReviewed(updated);
        onClose();
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-6 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 pr-8">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 block">
              Alur Verifikasi Kepala Sekolah
            </span>
            <h3 className="text-lg font-extrabold text-slate-900">
              Telaah & Pengesahan Laporan Observasi
            </h3>
            <p className="text-xs text-slate-500 font-mono">
              {report.report_number}
            </p>
          </div>
        </div>

        {feedback && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Action Choice Tabs */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-5">
          
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setAction('approve')}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                action === 'approve'
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-950 ring-2 ring-emerald-500 shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className={`w-4 h-4 ${action === 'approve' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span className="font-bold text-xs">Setujui Laporan Resmi</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Sahkan laporan, pasang stempel digital, dan kunci dokumen dari pengeditan diam-diam.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setAction('request_revision')}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                action === 'request_revision'
                  ? 'bg-rose-50 border-rose-400 text-rose-950 ring-2 ring-rose-500 shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <RotateCcw className={`w-4 h-4 ${action === 'request_revision' ? 'text-rose-600' : 'text-slate-400'}`} />
                <span className="font-bold text-xs">Minta Revisi ke Observer</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Kembalikan status laporan ke observer dengan catatan arahan perbaikan terperinci.
              </p>
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Kepala Sekolah / Penelaah Resmi:
            </label>
            <input
              type="text"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 bg-slate-50 focus:bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {action === 'approve' ? 'Catatan & Rekomendasi Pengesahan Kepala Sekolah:' : 'Instruksi Poin-Poin Revisi:'}
            </label>
            <textarea
              rows={4}
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder={
                action === 'approve'
                  ? 'Contoh: Laporan disetujui. Direkomendasikan masuk Kelas Transisi Ramah Sensori dengan pendampingan modul TEACCH...'
                  : 'Tuliskan poin-poin yang perlu diperbaiki oleh Guru Observer...'
              }
              className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-amber-500"
              required={action === 'request_revision'}
            />
          </div>

          {/* Previous Review History Log */}
          {report.review_logs && report.review_logs.length > 0 && (
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 max-h-32 overflow-y-auto">
              <span className="font-bold text-slate-700 text-[11px] flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-slate-400" />
                <span>Riwayat Telaah Sebelumnya ({report.review_logs.length}):</span>
              </span>
              <div className="space-y-1 divide-y divide-slate-100">
                {report.review_logs.map((log) => (
                  <div key={log.id} className="pt-1 text-[11px]">
                    <div className="flex items-center justify-between text-slate-500">
                      <strong>{log.reviewer_name} ({log.action})</strong>
                      <span>{formatShortDate(log.timestamp)}</span>
                    </div>
                    <p className="text-slate-700 italic">"{log.notes}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2 text-white font-bold text-xs rounded-xl shadow-2xs cursor-pointer flex items-center gap-1.5 ${
                action === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Memproses...' : action === 'approve' ? 'Sahkan Laporan' : 'Kirim Permintaan Revisi'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

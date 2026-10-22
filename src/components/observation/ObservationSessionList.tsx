import React, { useState } from 'react';
import { ObservationSession, ObservationSessionStatus } from '../../types/observation';
import { Registration, Student } from '../../types/database';
import { repository } from '../../lib/repository';
import { formatIndonesianDate, formatShortDate } from '../../lib/utils';
import { 
  FileText, 
  Calendar, 
  User, 
  Clock, 
  CheckCircle2, 
  PlusCircle, 
  Eye, 
  Edit3, 
  Search, 
  Filter, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { StarLogo } from '../common/StarLogo';
import { calculateAllDomainsSummary } from '../../lib/scoringEngine';
import { OBSERVATION_DOMAINS } from '../../lib/observationData';

interface ObservationSessionListProps {
  sessions: ObservationSession[];
  registrations: Registration[];
  currentRole: 'observer' | 'principal' | 'staff' | 'admin';
  onStartNewSession: (student: Student, registration: Registration) => void;
  onOpenSession: (session: ObservationSession, mode: 'edit' | 'view') => void;
  onOpenConfigModal?: () => void;
}

export const ObservationSessionList: React.FC<ObservationSessionListProps> = ({
  sessions,
  registrations,
  currentRole,
  onStartNewSession,
  onOpenSession,
  onOpenConfigModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isNewSessionModalOpen, setIsNewSessionModalOpen] = useState(false);
  const [selectedRegIdForNew, setSelectedRegIdForNew] = useState<string>(
    registrations[0]?.id || ''
  );

  const observationItems = repository.getObservationItems();

  const filteredSessions = sessions.filter((sess) => {
    const student = registrations.find((r) => r.student_id === sess.student_id)?.student;
    const studentName = student?.full_name?.toLowerCase() || '';
    const observerName = sess.observer_name.toLowerCase();
    const query = searchQuery.toLowerCase().trim();

    if (query && !studentName.includes(query) && !observerName.includes(query)) {
      return false;
    }

    if (selectedStatus !== 'all' && sess.status !== selectedStatus) {
      return false;
    }

    return true;
  });

  const handleLaunchNew = () => {
    const reg = registrations.find((r) => r.id === selectedRegIdForNew);
    if (reg && reg.student) {
      setIsNewSessionModalOpen(false);
      onStartNewSession(reg.student, reg);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Action */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
              Modul 2: Observasi & Asesmen Guru
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-semibold">
              Peran Aktif: <strong className="text-slate-800 capitalize">{currentRole === 'observer' ? 'Guru Observer' : currentRole === 'principal' ? 'Kepala Sekolah' : currentRole}</strong>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Workstation Observasi Tumbuh Kembang Siswa
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Instrumen penilaian berbasis bermain (*play-based*) meliputi 7 domain perkembangan anak berkebutuhan khusus dengan sistem skoring 0-3 non-punitif.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {currentRole === 'admin' && onOpenConfigModal && (
            <button
              onClick={onOpenConfigModal}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Kelola Butir Asesmen
            </button>
          )}

          {(currentRole === 'observer' || currentRole === 'admin') && (
            <button
              onClick={() => setIsNewSessionModalOpen(true)}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Mulai Observasi Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari siswa atau nama observer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="p-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700"
          >
            <option value="all">Semua Status Sesi</option>
            <option value="Draf (Sedang Berjalan)">Draf (Sedang Berjalan)</option>
            <option value="Selesai (Menunggu Telaah)">Selesai (Menunggu Telaah)</option>
            <option value="Disetujui Kepala Sekolah">Disetujui Kepala Sekolah</option>
            <option value="Perlu Revisi">Perlu Revisi</option>
          </select>
        </div>
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSessions.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">Belum Ada Sesi Observasi yang Cocok</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Pilih siswa dari daftar pendaftaran di atas untuk memulai lembar kerja observasi bermain anak.
            </p>
          </div>
        ) : (
          filteredSessions.map((sess) => {
            const reg = registrations.find((r) => r.student_id === sess.student_id);
            const student = reg?.student;

            // Calculate live coverage & score
            const summary = calculateAllDomainsSummary(OBSERVATION_DOMAINS, observationItems, sess.responses);

            const isApproved = sess.status === 'Disetujui Kepala Sekolah';
            const isPendingReview = sess.status === 'Selesai (Menunggu Telaah)';
            const isDraft = sess.status === 'Draf (Sedang Berjalan)';

            return (
              <div
                key={sess.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all p-5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Status & Date */}
                  <div className="flex items-center justify-between text-xs">
                    <span className={`px-2.5 py-0.5 rounded-md font-bold border text-[11px] ${
                      isApproved
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : isPendingReview
                        ? 'bg-sky-50 text-sky-800 border-sky-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {sess.status}
                    </span>
                    <span className="text-slate-400 font-medium">
                      {formatShortDate(sess.session_date)}
                    </span>
                  </div>

                  {/* Student Title */}
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">
                      {student?.full_name || 'Calon Siswa'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Panggilan: "{student?.preferred_name}" · {student?.gender} · Usia: {student?.calculated_age || '-'}
                    </p>
                  </div>

                  {/* Observer and Location */}
                  <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5 font-medium">
                      <User className="w-3.5 h-3.5 text-amber-500" />
                      <span>{sess.observer_name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-sky-500" />
                      <span>{sess.start_time} - {sess.end_time || 'Selesai'} · {sess.room_location}</span>
                    </div>
                  </div>

                  {/* Coverage Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium text-[11px]">Cakupan Indikator:</span>
                      <span className="font-mono font-bold text-slate-800 text-xs">
                        {summary.overallObservedItems} / {summary.overallTotalItems} ({summary.overallCoveragePercentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all"
                        style={{ width: `${summary.overallCoveragePercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onOpenSession(sess, 'view')}
                    className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{isApproved ? 'Laporan Resmi' : 'Telaah'}</span>
                  </button>

                  {/* Edit button: available for observer or admin when not approved */}
                  {(!isApproved || currentRole === 'admin') && (
                    <button
                      onClick={() => onOpenSession(sess, 'edit')}
                      className="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{isDraft ? 'Lanjutkan' : 'Edit Skor'}</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Modal: Start New Observation Session */}
      {isNewSessionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">Mulai Sesi Observasi Baru</h3>
                <p className="text-xs text-slate-500">Pilih calon murid yang telah terdaftar.</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Pilih Calon Murid:</label>
              <select
                value={selectedRegIdForNew}
                onChange={(e) => setSelectedRegIdForNew(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white"
              >
                {registrations.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.student?.full_name} ({r.registration_number}) — {r.status}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 text-amber-900 text-xs leading-relaxed border border-amber-200">
              Sesi observasi akan memuat instrumen 7 domain perkembangan: Komunikasi, Sosial-Emosional, Kognitif, Motorik, Kemandirian, Kesiapan Bermain, dan Sensori.
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsNewSessionModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleLaunchNew}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Buka Lembar Kerja Observasi
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

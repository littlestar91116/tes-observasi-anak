import React, { useState, useMemo } from 'react';
import { Registration, RegistrationStatus, Student } from '../../types/database';
import { ObservationSession } from '../../types/observation';
import { ObservationReport } from '../../types/report';
import { AdmissionDecision } from '../../types/admin';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  FileCheck2, 
  AlertTriangle, 
  Award, 
  HelpCircle, 
  Filter, 
  Search, 
  Sparkles, 
  Eye, 
  FileText, 
  TrendingUp,
  BarChart3,
  ShieldCheck,
  ChevronRight,
  UserPlus
} from 'lucide-react';
import { formatShortDate } from '../../lib/utils';
import { AVAILABLE_OBSERVERS } from '../../lib/constants';

interface AnalyticsDashboardProps {
  metrics: {
    totalApplicants: number;
    newRegistrations: number;
    upcomingAppointments: number;
    completedObservations: number;
    incompleteObservations: number;
    reportsAwaitingReview: number;
    approvedReports: number;
    applicantsRequiringFollowUp: number;
    recordedAdmissionDecisions: number;
  };
  registrations: Registration[];
  observationSessions: ObservationSession[];
  observationReports: ObservationReport[];
  admissionDecisions: AdmissionDecision[];
  onOpenDetail: (reg: Registration) => void;
  onOpenScheduler: (reg: Registration) => void;
  onOpenObservation: (student: Student, reg: Registration) => void;
  onOpenReport: (student: Student, reg: Registration) => void;
  onRecordDecision: (reg: Registration) => void;
  currentRole: 'admin' | 'principal' | 'observer' | 'staff';
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  metrics,
  registrations,
  observationSessions,
  observationReports,
  admissionDecisions,
  onOpenDetail,
  onOpenScheduler,
  onOpenObservation,
  onOpenReport,
  onRecordDecision,
  currentRole,
}) => {
  // Multi-Criteria Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'this_week' | 'this_month'>('all');
  const [registrationStatusFilter, setRegistrationStatusFilter] = useState<'All' | RegistrationStatus>('All');
  const [observationStatusFilter, setObservationStatusFilter] = useState<string>('all');
  const [observerFilter, setObserverFilter] = useState<string>('all');
  const [reportApprovalFilter, setReportApprovalFilter] = useState<string>('all');

  // Filter logic
  const filteredApplicants = useMemo(() => {
    return registrations.filter((reg) => {
      // 1. Text Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const studentName = reg.student?.full_name?.toLowerCase() || '';
        const prefName = reg.student?.preferred_name?.toLowerCase() || '';
        const regNum = reg.registration_number?.toLowerCase() || '';
        const guardianName = reg.guardian?.full_name?.toLowerCase() || '';
        if (!studentName.includes(q) && !prefName.includes(q) && !regNum.includes(q) && !guardianName.includes(q)) {
          return false;
        }
      }

      // 2. Date Filter
      if (dateFilter !== 'all') {
        const regDate = new Date(reg.submission_date);
        const today = new Date();
        if (dateFilter === 'today') {
          if (regDate.toDateString() !== today.toDateString()) return false;
        } else if (dateFilter === 'this_week') {
          const diffDays = (today.getTime() - regDate.getTime()) / (1000 * 3600 * 24);
          if (diffDays > 7) return false;
        } else if (dateFilter === 'this_month') {
          if (regDate.getMonth() !== today.getMonth() || regDate.getFullYear() !== today.getFullYear()) return false;
        }
      }

      // 3. Registration Status
      if (registrationStatusFilter !== 'All' && reg.status !== registrationStatusFilter) {
        return false;
      }

      // 4. Observation Status
      const sess = observationSessions.find(s => s.registration_id === reg.id || s.student_id === reg.student_id);
      if (observationStatusFilter !== 'all') {
        if (observationStatusFilter === 'Selesai' && (!sess || !sess.status.includes('Selesai'))) return false;
        if (observationStatusFilter === 'Draf' && (!sess || (!sess.status.includes('Draf') && !sess.status.includes('Berjalan')))) return false;
        if (observationStatusFilter === 'Belum Ada Sesi' && sess) return false;
      }

      // 5. Assigned Observer
      if (observerFilter !== 'all') {
        const assignedObs = reg.appointment?.observer_name || sess?.observer_name || '';
        if (!assignedObs.toLowerCase().includes(observerFilter.toLowerCase())) return false;
      }

      // 6. Report Approval Status
      const rep = observationReports.find(r => r.student_id === reg.student_id || r.session_id === sess?.id);
      if (reportApprovalFilter !== 'all') {
        if (reportApprovalFilter === 'Disetujui' && (!rep || rep.status !== 'Disetujui Kepala Sekolah')) return false;
        if (reportApprovalFilter === 'Menunggu Review' && (!rep || rep.status !== 'Diajukan untuk Telaah')) return false;
        if (reportApprovalFilter === 'Perlu Revisi' && (!rep || rep.status !== 'Perlu Revisi')) return false;
        if (reportApprovalFilter === 'Belum Ada Laporan' && rep) return false;
      }

      return true;
    });
  }, [
    registrations,
    observationSessions,
    observationReports,
    searchQuery,
    dateFilter,
    registrationStatusFilter,
    observationStatusFilter,
    observerFilter,
    reportApprovalFilter,
  ]);

  // Observer list for dropdown
  const observerList = useMemo(() => {
    const list = new Set<string>();
    AVAILABLE_OBSERVERS.forEach(o => list.add(o.name));
    observationSessions.forEach(s => {
      if (s.observer_name) list.add(s.observer_name);
    });
    return Array.from(list);
  }, [observationSessions]);

  return (
    <div className="space-y-6">
      
      {/* 9 Executive Metric Cards (Module 4 Feature 1) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4">
        
        {/* Card 1: Total Pendaftar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">1. Total Pendaftar</span>
            <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
            {metrics.totalApplicants}
          </div>
          <p className="text-[11px] text-slate-400">Seluruh calon murid terdaftar</p>
        </div>

        {/* Card 2: Pendaftaran Baru */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-2xs space-y-1.5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700">2. Pendaftaran Baru</span>
            <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
              <UserPlus className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 font-mono tabular-nums">
            {metrics.newRegistrations}
          </div>
          <p className="text-[11px] text-amber-600/70">Perlu verifikasi & kontak awal</p>
        </div>

        {/* Card 3: Jadwal Observasi Mendatang */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-2xs space-y-1.5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700">3. Jadwal Terkonfirmasi</span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono tabular-nums">
            {metrics.upcomingAppointments}
          </div>
          <p className="text-[11px] text-emerald-600/70">Slot tanggal & ruangan siap</p>
        </div>

        {/* Card 4: Observasi Selesai */}
        <div className="bg-white p-5 rounded-2xl border border-blue-200 shadow-2xs space-y-1.5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-700">4. Observasi Selesai</span>
            <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 font-mono tabular-nums">
            {metrics.completedObservations}
          </div>
          <p className="text-[11px] text-blue-600/70">7 domain asesmen tuntas dinilai</p>
        </div>

        {/* Card 5: Observasi Belum Selesai / Draf */}
        <div className="bg-white p-5 rounded-2xl border border-orange-200 shadow-2xs space-y-1.5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-orange-700">5. Observasi Berlangsung / Draf</span>
            <div className="p-2 bg-orange-50 text-orange-700 rounded-xl">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-orange-600 font-mono tabular-nums">
            {metrics.incompleteObservations}
          </div>
          <p className="text-[11px] text-orange-600/70">Sesi masih perlu kelengkapan data</p>
        </div>

        {/* Card 6: Laporan Menunggu Telaah */}
        <div className="bg-white p-5 rounded-2xl border border-indigo-200 shadow-2xs space-y-1.5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-700">6. Laporan Menunggu Review</span>
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600 font-mono tabular-nums">
            {metrics.reportsAwaitingReview}
          </div>
          <p className="text-[11px] text-indigo-600/70">Antrean telaah Kepala Sekolah</p>
        </div>

        {/* Card 7: Laporan Disetujui */}
        <div className="bg-white p-5 rounded-2xl border border-teal-200 shadow-2xs space-y-1.5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-700">7. Laporan Disetujui</span>
            <div className="p-2 bg-teal-50 text-teal-700 rounded-xl">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-teal-600 font-mono tabular-nums">
            {metrics.approvedReports}
          </div>
          <p className="text-[11px] text-teal-600/70">Resmi siap dibahas bersama ortu</p>
        </div>

        {/* Card 8: Murid Perlu Tindak Lanjut */}
        <div className="bg-white p-5 rounded-2xl border border-purple-200 shadow-2xs space-y-1.5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-700">8. Perlu Tindak Lanjut</span>
            <div className="p-2 bg-purple-50 text-purple-700 rounded-xl">
              <HelpCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-purple-600 font-mono tabular-nums">
            {metrics.applicantsRequiringFollowUp}
          </div>
          <p className="text-[11px] text-purple-600/70">Diskusi lanjutan / jadwal pending</p>
        </div>

        {/* Card 9: Keputusan Penerimaan Dicatat */}
        <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-2xs space-y-1.5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700">9. Keputusan Admisi Dicatat</span>
            <div className="p-2 bg-rose-50 text-rose-700 rounded-xl">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 font-mono tabular-nums">
            {metrics.recordedAdmissionDecisions}
          </div>
          <p className="text-[11px] text-rose-600/70">Keputusan manual pimpinan resmi</p>
        </div>

      </div>

      {/* Aggregate Pipeline & Privacy Notice */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Pipeline Distribution Chart (Privacy-Preserving) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-700" />
              <h3 className="font-bold text-slate-900 text-sm">Distribusi Tahapan Alur Admisi Siswa</h3>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Data Agregat Terkini</span>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { label: 'Pendaftaran Baru', count: metrics.newRegistrations, total: metrics.totalApplicants, color: 'bg-amber-500' },
              { label: 'Jadwal Terkonfirmasi', count: metrics.upcomingAppointments, total: metrics.totalApplicants, color: 'bg-emerald-500' },
              { label: 'Observasi Selesai', count: metrics.completedObservations, total: metrics.totalApplicants, color: 'bg-blue-600' },
              { label: 'Laporan Disetujui Kepala Sekolah', count: metrics.approvedReports, total: metrics.totalApplicants, color: 'bg-teal-600' },
              { label: 'Keputusan Admisi Dicatat', count: metrics.recordedAdmissionDecisions, total: metrics.totalApplicants, color: 'bg-indigo-600' },
            ].map((bar, i) => {
              const pct = bar.total > 0 ? Math.round((bar.count / bar.total) * 100) : 0;
              return (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{bar.label}</span>
                    <span className="font-mono text-slate-500">
                      <strong>{bar.count}</strong> / {bar.total} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${bar.color}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 flex items-center justify-between">
            <span>Standar Operasional: Little Star School Pamekasan</span>
            <span className="font-semibold text-blue-700">Modul 4 • Analisis Sistem</span>
          </div>
        </div>

        {/* Child Privacy & Data Protection Compliance Card */}
        <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white p-6 rounded-2xl shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-amber-300">
              <ShieldCheck className="w-6 h-6" />
              <span className="text-xs font-bold uppercase tracking-wider">Perlindungan Data ABK</span>
            </div>
            <h4 className="text-base font-bold">Kepatuhan UU PDP No. 27 Tahun 2022</h4>
            <p className="text-xs text-blue-100 leading-relaxed">
              Ringkasan statistik publik dan visualisasi agregat di Little Star School Pamekasan tidak menampilkan diagnosis medis individual atau data klinis sensitif anak. Informasi personal hanya dapat diakses staf berwenang sesuai peran.
            </p>
          </div>

          <div className="p-3.5 bg-white/10 rounded-xl text-xs space-y-1.5 border border-white/10">
            <div className="flex items-center justify-between text-blue-200">
              <span>Keamanan Server</span>
              <span className="font-bold text-emerald-300">Firestore Rules Aktif</span>
            </div>
            <div className="flex items-center justify-between text-blue-200">
              <span>Akses Kontrol (RBAC)</span>
              <span className="font-bold text-amber-300">4 Peran Terpisah</span>
            </div>
            <div className="flex items-center justify-between text-blue-200">
              <span>Jejak Audit</span>
              <span className="font-bold text-white">Immutable Trail</span>
            </div>
          </div>
        </div>

      </div>

      {/* Multi-Criteria Filters Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="relative w-full lg:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama calon siswa, no. registrasi, wali..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto text-xs">
            {/* Filter Date */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="p-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Tanggal</option>
              <option value="today">Hari Ini</option>
              <option value="this_week">7 Hari Terakhir</option>
              <option value="this_month">Bulan Ini</option>
            </select>

            {/* Filter Registration Status */}
            <select
              value={registrationStatusFilter}
              onChange={(e) => setRegistrationStatusFilter(e.target.value as any)}
              className="p-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">Semua Status Pendaftaran</option>
              <option value="Pendaftaran Baru">Pendaftaran Baru</option>
              <option value="Menunggu Jadwal">Menunggu Jadwal</option>
              <option value="Jadwal Terkonfirmasi">Jadwal Terkonfirmasi</option>
              <option value="Dibatalkan">Dibatalkan</option>
            </select>

            {/* Filter Observation Status */}
            <select
              value={observationStatusFilter}
              onChange={(e) => setObservationStatusFilter(e.target.value)}
              className="p-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Status Observasi</option>
              <option value="Selesai">Observasi Selesai</option>
              <option value="Draf">Observasi Draf / Berjalan</option>
              <option value="Belum Ada Sesi">Belum Ada Sesi</option>
            </select>

            {/* Filter Assigned Observer */}
            <select
              value={observerFilter}
              onChange={(e) => setObserverFilter(e.target.value)}
              className="p-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Guru Observer</option>
              {observerList.map((obs, i) => (
                <option key={i} value={obs}>{obs}</option>
              ))}
            </select>

            {/* Filter Report Approval Status */}
            <select
              value={reportApprovalFilter}
              onChange={(e) => setReportApprovalFilter(e.target.value)}
              className="p-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Status Laporan</option>
              <option value="Disetujui">Laporan Disetujui</option>
              <option value="Menunggu Review">Menunggu Review</option>
              <option value="Perlu Revisi">Perlu Revisi</option>
              <option value="Belum Ada Laporan">Belum Ada Laporan</option>
            </select>
          </div>
        </div>

        {/* Filtered Results Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Calon Murid</th>
                <th className="py-3 px-4">Status Pendaftaran</th>
                <th className="py-3 px-4">Status Observasi</th>
                <th className="py-3 px-4">Laporan & PPI</th>
                <th className="py-3 px-4">Keputusan Admisi</th>
                <th className="py-3 px-4 text-right">Aksi Tindak Lanjut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApplicants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    Tidak ada pendaftar yang memenuhi kriteria filter.
                  </td>
                </tr>
              ) : (
                filteredApplicants.map((reg) => {
                  const student = reg.student;
                  const sess = observationSessions.find(s => s.registration_id === reg.id || s.student_id === reg.student_id);
                  const rep = observationReports.find(r => r.student_id === reg.student_id || r.session_id === sess?.id);
                  const decision = admissionDecisions.find(d => d.registration_id === reg.id);

                  return (
                    <tr key={reg.id} className="hover:bg-slate-50 transition-colors">
                      
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 text-sm">{student?.full_name}</div>
                        <div className="text-[11px] text-slate-500">
                          {reg.registration_number} • {student?.calculated_age || '-'}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          reg.status === 'Pendaftaran Baru' ? 'bg-amber-100 text-amber-800' :
                          reg.status === 'Jadwal Terkonfirmasi' ? 'bg-emerald-100 text-emerald-800' :
                          reg.status === 'Menunggu Jadwal' ? 'bg-sky-100 text-sky-800' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {reg.status}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {sess ? (
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            sess.status.includes('Selesai') ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                          }`}>
                            {sess.status}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Belum dimulai</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {rep ? (
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            rep.status === 'Disetujui Kepala Sekolah' ? 'bg-teal-100 text-teal-800' :
                            rep.status === 'Diajukan untuk Telaah' ? 'bg-indigo-100 text-indigo-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {rep.status}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Belum ada</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {decision ? (
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                            decision.decision_status === 'Diterima' ? 'bg-emerald-50 text-emerald-900 border-emerald-300' :
                            decision.decision_status === 'Ditunda / Diskusi Lanjutan' ? 'bg-amber-50 text-amber-900 border-amber-300' :
                            decision.decision_status === 'Butuh Observasi Lanjutan' ? 'bg-blue-50 text-blue-900 border-blue-300' :
                            'bg-purple-50 text-purple-900 border-purple-300'
                          }`}>
                            {decision.decision_status}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Belum Dicatat</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onRecordDecision(reg)}
                            className="px-2.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                            title="Catat atau Perbarui Keputusan Admisi"
                          >
                            <Award className="w-3.5 h-3.5" />
                            <span>Admisi</span>
                          </button>

                          {student && rep && (
                            <button
                              onClick={() => onOpenReport(student, reg)}
                              className="px-2 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg font-bold text-xs transition-colors cursor-pointer"
                              title="Buka Laporan PPI"
                            >
                              Laporan
                            </button>
                          )}

                          <button
                            onClick={() => onOpenDetail(reg)}
                            className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs transition-colors cursor-pointer"
                          >
                            Detail
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>Menampilkan {filteredApplicants.length} dari {registrations.length} data pendaftar</span>
          <span className="font-semibold text-slate-700">Little Star School Pamekasan</span>
        </div>
      </div>

    </div>
  );
};

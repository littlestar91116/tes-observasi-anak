import React, { useState, useMemo } from 'react';
import { Registration, RegistrationStatus, SchoolSettings, UserProfile, Student } from '../../types/database';
import { ObservationSession } from '../../types/observation';
import { ObservationReport, LearningRecommendation } from '../../types/report';
import { repository } from '../../lib/repository';
import { StudentDetailModal } from './StudentDetailModal';
import { AppointmentSchedulerModal } from './AppointmentSchedulerModal';
import { SchoolSettingsModal } from './SchoolSettingsModal';
import { ObservationSessionList } from '../observation/ObservationSessionList';
import { ObservationWorkstation } from '../observation/ObservationWorkstation';
import { ObservationReportView } from '../observation/ObservationReportView';
import { ConfigurableItemsModal } from '../observation/ConfigurableItemsModal';
import { ObservationReportDocument } from '../report/ObservationReportDocument';
import { LearningRecommendationsManager } from '../report/LearningRecommendationsManager';
import { ReportReviewModal } from '../report/ReportReviewModal';
import { ReportArchiveView } from '../report/ReportArchiveView';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { AdmissionWorkflowView } from './AdmissionWorkflowView';
import { AdmissionDecisionModal } from './AdmissionDecisionModal';
import { UserManagementView } from './UserManagementView';
import { AuditLogView } from './AuditLogView';
import { ExportBackupModal } from './ExportBackupModal';
import { AdmissionDecision } from '../../types/admin';
import { buildReportFromSession, generateDefaultRecommendations } from '../../lib/recommendationEngine';
import { formatIndonesianDate, formatShortDate } from '../../lib/utils';
import { signInWithGoogle, logOutFromFirebase } from '../../lib/firebase';
import { 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  User, 
  Settings2, 
  ChevronRight, 
  PlusCircle, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  CalendarCheck, 
  Users, 
  ArrowLeft,
  LogOut,
  RefreshCw,
  Sparkles,
  ClipboardList,
  Sliders,
  UserCheck,
  FileCheck2,
  BookOpen,
  BarChart3,
  Award,
  Download,
  HelpCircle,
  Activity,
  Layers,
  TrendingUp,
  FileText
} from 'lucide-react';
import { StarLogo } from '../common/StarLogo';

interface AdminDashboardProps {
  settings: SchoolSettings;
  onUpdateSettings: (updated: SchoolSettings) => void;
  onBackToHome: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  settings,
  onUpdateSettings,
  onBackToHome,
}) => {
  // Authentication & Staff Access State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(repository.getCurrentUser());
  const [authPin, setAuthPin] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Active Main Admin Tab
  const [adminTab, setAdminTab] = useState<'analytics' | 'admissions' | 'registrations' | 'observations' | 'reports' | 'users' | 'audit'>('analytics');

  // Multi-Role Simulation Selector for Testing & Staff Personas
  // Roles: 'observer' (Guru Observer), 'principal' (Kepala Sekolah), 'staff' (Admin Pendaftaran), 'admin' (Super Admin)
  const [activeRole, setActiveRole] = useState<'observer' | 'principal' | 'staff' | 'admin'>('admin');

  // Registrations state
  const [registrations, setRegistrations] = useState<Registration[]>(() => repository.getRegistrations());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'All' | RegistrationStatus>('All');
  const [selectedDateFilter, setSelectedDateFilter] = useState<'all' | 'today' | 'this_week' | 'this_month'>('all');
  const [selectedObserverFilter, setSelectedObserverFilter] = useState<string>('all');
  const [selectedObservationStatusFilter, setSelectedObservationStatusFilter] = useState<string>('all');
  const [selectedReportApprovalFilter, setSelectedReportApprovalFilter] = useState<string>('all');

  // Admission Decisions state (Module 4)
  const [admissionDecisions, setAdmissionDecisions] = useState<AdmissionDecision[]>(() => repository.getAdmissionDecisions());
  const [selectedRegForAdmissionDecision, setSelectedRegForAdmissionDecision] = useState<Registration | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Observation state (Module 2)
  const [observationSessions, setObservationSessions] = useState<ObservationSession[]>(() => repository.getObservationSessions());
  const [activeObservationSession, setActiveObservationSession] = useState<ObservationSession | null>(null);
  const [observationMode, setObservationMode] = useState<'edit' | 'view'>('edit');
  const [activeObservationStudent, setActiveObservationStudent] = useState<Student | null>(null);
  const [activeObservationReg, setActiveObservationReg] = useState<Registration | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  // Report & Recommendation state (Module 3)
  const [observationReports, setObservationReports] = useState<ObservationReport[]>(() => repository.getObservationReports());
  const [activeReportForDocument, setActiveReportForDocument] = useState<ObservationReport | null>(null);
  const [activeReportForRecommendations, setActiveReportForRecommendations] = useState<ObservationReport | null>(null);
  const [reportToReview, setReportToReview] = useState<ObservationReport | null>(null);

  // Modals state
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<Registration | null>(null);
  const [selectedStudentForScheduler, setSelectedStudentForScheduler] = useState<Registration | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Refresh data from repository
  const refreshData = () => {
    setRegistrations(repository.getRegistrations());
    setObservationSessions(repository.getObservationSessions());
    setObservationReports(repository.getObservationReports());
    setAdmissionDecisions(repository.getAdmissionDecisions());
  };

  // Comprehensive Metrics summary (Module 4 Feature 1)
  const metrics = useMemo(() => {
    const totalApplicants = registrations.length;
    const newRegistrations = registrations.filter((r) => r.status === 'Pendaftaran Baru').length;
    const upcomingAppointments = registrations.filter((r) => r.appointment && r.appointment.status === 'Dikonfirmasi').length;
    const completedObservations = observationSessions.filter((s) => s.status.includes('Selesai')).length;
    const incompleteObservations = observationSessions.filter((s) => s.status.includes('Draf') || s.status.includes('Sedang Berjalan')).length;
    const reportsAwaitingReview = observationReports.filter((r) => r.status === 'Diajukan untuk Telaah').length;
    const approvedReports = observationReports.filter((r) => r.status === 'Disetujui Kepala Sekolah').length;
    
    // Applicants requiring follow-up (pending decisions, further observation needed, or waiting schedule)
    const applicantsRequiringFollowUp = 
      admissionDecisions.filter(d => d.decision_status === 'Ditunda / Diskusi Lanjutan' || d.decision_status === 'Butuh Observasi Lanjutan').length +
      registrations.filter(r => r.status === 'Menunggu Jadwal').length;

    const recordedAdmissionDecisions = admissionDecisions.length;

    const waitingSchedule = registrations.filter((r) => r.status === 'Menunggu Jadwal').length;
    const cancelled = registrations.filter((r) => r.status === 'Dibatalkan').length;

    return {
      total: totalApplicants,
      newReg: newRegistrations,
      waitingSchedule,
      confirmed: upcomingAppointments,
      cancelled,
      totalApplicants,
      newRegistrations,
      upcomingAppointments,
      completedObservations,
      incompleteObservations,
      reportsAwaitingReview,
      approvedReports,
      applicantsRequiringFollowUp,
      recordedAdmissionDecisions,
    };
  }, [registrations, observationSessions, observationReports, admissionDecisions]);

  // Filtered registrations
  const filteredRegistrations = useMemo(() => {
    return registrations.filter((reg) => {
      if (selectedStatus !== 'All' && reg.status !== selectedStatus) {
        return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const studentName = reg.student?.full_name?.toLowerCase() || '';
        const prefName = reg.student?.preferred_name?.toLowerCase() || '';
        const regNum = reg.registration_number?.toLowerCase() || '';
        const guardianName = reg.guardian?.full_name?.toLowerCase() || '';

        if (!studentName.includes(query) && !prefName.includes(query) && !regNum.includes(query) && !guardianName.includes(query)) {
          return false;
        }
      }

      if (selectedDateFilter !== 'all') {
        const regDate = new Date(reg.submission_date);
        const today = new Date();
        if (selectedDateFilter === 'today') {
          return regDate.toDateString() === today.toDateString();
        }
        if (selectedDateFilter === 'this_week') {
          const diffDays = (today.getTime() - regDate.getTime()) / (1000 * 3600 * 24);
          return diffDays <= 7;
        }
        if (selectedDateFilter === 'this_month') {
          return regDate.getMonth() === today.getMonth() && regDate.getFullYear() === today.getFullYear();
        }
      }

      return true;
    });
  }, [registrations, selectedStatus, searchQuery, selectedDateFilter]);

  // Staff pass check
  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (authPin === '1234' || authPin === 'admin' || authPin === '') {
      const user: UserProfile = {
        id: 'usr-admin-01',
        email: 'admin@littlestarschool.sch.id',
        full_name: 'Dra. Hj. Nurul Komariyah',
        role: 'admin',
        created_at: new Date().toISOString(),
      };
      repository.setCurrentUser(user);
      setCurrentUser(user);
      setAuthError(null);
    } else {
      setAuthError('Kredensial atau PIN staf salah. (Gunakan PIN default: 1234 atau kosongkan)');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const fbUser = await signInWithGoogle();
      if (fbUser) {
        const user: UserProfile = {
          id: fbUser.uid,
          email: fbUser.email || 'admin@littlestarschool.sch.id',
          full_name: fbUser.displayName || 'Staf Little Star School',
          role: 'admin',
          avatar_url: fbUser.photoURL || undefined,
          created_at: new Date().toISOString(),
        };
        repository.setCurrentUser(user);
        setCurrentUser(user);
        setAuthError(null);
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Gagal masuk dengan Google');
    }
  };

  const handleLogout = () => {
    logOutFromFirebase();
    repository.setCurrentUser(null);
    setCurrentUser(null);
  };

  // Launch observation from session list or student modal
  const handleStartObservationSession = (student: Student, reg: Registration) => {
    const existing = observationSessions.find((s) => s.student_id === student.id);
    if (existing) {
      setActiveObservationSession(existing);
      setActiveObservationStudent(student);
      setActiveObservationReg(reg);
      setObservationMode('edit');
      setAdminTab('observations');
      return;
    }

    const newSession: ObservationSession = {
      id: `sess-${Date.now()}`,
      student_id: student.id,
      registration_id: reg.id,
      observer_id: currentUser?.id || 'usr-obs-01',
      observer_name: activeRole === 'observer' ? 'Ustadzah Siti Rahma, S.Psi' : (currentUser?.full_name || 'Ustadzah Siti Rahma, S.Psi'),
      session_date: new Date().toISOString().split('T')[0],
      start_time: '08:30',
      room_location: reg.appointment?.location_room || 'Ruang Observasi Sensori A (Lantai 1)',
      context_description: 'Siswa hadir didampingi orang tua. Sesi observasi awal komprehensif.',
      status: 'Draf (Sedang Berjalan)',
      responses: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const saved = repository.saveObservationSession(newSession);
    refreshData();
    setActiveObservationSession(saved);
    setActiveObservationStudent(student);
    setActiveObservationReg(reg);
    setObservationMode('edit');
    setAdminTab('observations');
  };

  const handleOpenExistingSession = (session: ObservationSession, mode: 'edit' | 'view') => {
    const reg = registrations.find((r) => r.id === session.registration_id);
    const student = reg?.student || registrations.find((r) => r.student_id === session.student_id)?.student;

    if (student && reg) {
      setActiveObservationSession(session);
      setActiveObservationStudent(student);
      setActiveObservationReg(reg);
      setObservationMode(mode);
      setAdminTab('observations');
    }
  };

  // Open or Generate Module 3 Report
  const handleOpenModule3Report = (student: Student, reg: Registration) => {
    let report = repository.getObservationReports(student.id)[0];
    let session = repository.getObservationSessions(student.id)[0];

    if (!session) {
      // create session first
      const newSess: ObservationSession = {
        id: `sess-${Date.now()}`,
        student_id: student.id,
        registration_id: reg.id,
        observer_id: currentUser?.id || 'obs-01',
        observer_name: 'Ustadzah Siti Rahma, S.Psi',
        session_date: new Date().toISOString().split('T')[0],
        start_time: '08:30',
        room_location: 'Ruang Sensori & Gerak',
        context_description: 'Observasi kesiapan belajar dan respon sensori.',
        status: 'Draf (Sedang Berjalan)',
        responses: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      session = repository.saveObservationSession(newSess);
    }

    if (!report) {
      report = buildReportFromSession(session, student, reg);
      repository.saveObservationReport(report, 'Pembuatan naskah laporan observasi otomatis awal');
      
      // Seed default recommendations
      const items = repository.getObservationItems();
      const recs = generateDefaultRecommendations(session, student, items);
      repository.saveLearningRecommendations(report.id, recs);
    }

    refreshData();
    setActiveReportForDocument(report);
  };

  const handleOpenModule3ReportFromSession = (session: ObservationSession) => {
    const reg = registrations.find(r => r.id === session.registration_id) || registrations.find(r => r.student_id === session.student_id);
    const student = reg?.student || registrations.find(r => r.student_id === session.student_id)?.student;

    if (student && reg) {
      handleOpenModule3Report(student, reg);
    }
  };

  // If not logged in as staff, show protected access screen
  if (!currentUser) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6 text-center">
          <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-slate-900">Portal Akses Staf Internal</h2>
            <p className="text-xs text-slate-500">
              Khusus guru observer, kepala sekolah, dan tim admisi Little Star School Pamekasan.
            </p>
          </div>

          {authError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
              {authError}
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-3 transition-colors shadow-2xs cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Masuk dengan Google (Firebase Auth)</span>
          </button>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <div className="flex-1 h-px bg-slate-200" />
            <span>atau masuk dengan PIN</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <form onSubmit={handleStaffLogin} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                PIN Keamanan / Akses Cepat:
              </label>
              <input
                type="password"
                placeholder="Masukkan PIN staf (Default: 1234)"
                value={authPin}
                onChange={(e) => setAuthPin(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-[11px] text-slate-400">
                Tekan tombol Masuk langsung untuk verifikasi mode staf.
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-all cursor-pointer"
            >
              Masuk sebagai Staf Internal
            </button>
          </form>

          <div className="pt-2">
            <button
              onClick={onBackToHome}
              className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
            >
              ← Kembali ke Beranda Publik
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active observation workstation view (Module 2)
  if (adminTab === 'observations' && activeObservationSession && activeObservationStudent && activeObservationReg) {
    if (observationMode === 'view') {
      return (
        <ObservationReportView
          session={activeObservationSession}
          student={activeObservationStudent}
          registration={activeObservationReg}
          settings={settings}
          userRole={activeRole}
          onBack={() => {
            setActiveObservationSession(null);
            refreshData();
          }}
          onEditSession={() => setObservationMode('edit')}
          onReviewApproved={(updated) => {
            setActiveObservationSession(updated);
            refreshData();
          }}
          onOpenModule3Report={handleOpenModule3ReportFromSession}
        />
      );
    }

    return (
      <ObservationWorkstation
        session={activeObservationSession}
        student={activeObservationStudent}
        registration={activeObservationReg}
        userRole={activeRole}
        isReadOnly={activeRole === 'staff'}
        onBack={() => {
          setActiveObservationSession(null);
          refreshData();
        }}
        onSaved={(updated) => {
          setActiveObservationSession(updated);
          refreshData();
        }}
        onSubmitForReview={(updated) => {
          setActiveObservationSession(updated);
          setObservationMode('view');
          refreshData();
        }}
      />
    );
  }

  // Active Report Document View (Module 3)
  if (activeReportForDocument) {
    const reg = registrations.find(r => r.student_id === activeReportForDocument.student_id) || registrations[0];
    const student = reg?.student || registrations[0]?.student;
    const session = repository.getObservationSessionById(activeReportForDocument.session_id) || observationSessions[0];
    const recs = repository.getLearningRecommendations(activeReportForDocument.id);

    if (student && reg && session) {
      return (
        <div className="min-h-screen bg-[#FDFBF7] py-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto space-y-4">
            <ObservationReportDocument
              report={activeReportForDocument}
              session={session}
              student={student}
              registration={reg}
              settings={settings}
              recommendations={recs}
              canReview={activeRole === 'principal' || activeRole === 'admin'}
              onBack={() => {
                setActiveReportForDocument(null);
                refreshData();
              }}
              onEditRecommendations={() => {
                setActiveReportForRecommendations(activeReportForDocument);
              }}
              onOpenReviewModal={() => {
                setReportToReview(activeReportForDocument);
              }}
            />
          </div>

          {reportToReview && (
            <ReportReviewModal
              report={reportToReview}
              isOpen={Boolean(reportToReview)}
              onClose={() => setReportToReview(null)}
              onReviewed={(updated) => {
                setActiveReportForDocument(updated);
                refreshData();
              }}
            />
          )}
        </div>
      );
    }
  }

  // Active Learning Recommendations Manager (Module 3)
  if (activeReportForRecommendations) {
    const reg = registrations.find(r => r.student_id === activeReportForRecommendations.student_id) || registrations[0];
    const student = reg?.student || registrations[0]?.student;

    if (student) {
      return (
        <div className="min-h-screen bg-[#FDFBF7] py-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <button
                onClick={() => setActiveReportForRecommendations(null)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke Laporan</span>
              </button>
              <span className="font-mono text-xs font-bold text-amber-800">
                Laporan #{activeReportForRecommendations.report_number}
              </span>
            </div>

            <LearningRecommendationsManager
              report={activeReportForRecommendations}
              student={student}
              userRole={activeRole}
              onUpdated={() => {
                refreshData();
              }}
            />
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHome}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-2xs"
              title="Kembali ke Beranda"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <StarLogo size={22} />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                  Panel Administrasi Terintegrasi
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Little Star School Pamekasan
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {currentUser && (
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-xs">
                {currentUser.avatar_url ? (
                  <img src={currentUser.avatar_url} alt="" className="w-5 h-5 rounded-full" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-amber-400 text-amber-900 font-bold flex items-center justify-center text-[10px]">
                    {currentUser.full_name.charAt(0)}
                  </div>
                )}
                <span className="font-semibold text-slate-800">{currentUser.full_name}</span>
                <span className="text-[10px] text-amber-800 font-bold uppercase bg-amber-200/80 px-1.5 py-0.2 rounded">
                  Firebase
                </span>
              </div>
            )}

            <button
              onClick={() => setIsExportModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Ekspor & Cadangan</span>
            </button>

            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer"
            >
              <Settings2 className="w-3.5 h-3.5 text-amber-500" />
              <span>Pengaturan</span>
            </button>

            <button
              onClick={refreshData}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-2xs"
              title="Perbarui Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              title="Keluar dari sesi staf"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>

        {/* Role & Module Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Main Module Switcher */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto">
            <button
              onClick={() => setAdminTab('analytics')}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                adminTab === 'analytics'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Ringkasan & Metrik</span>
            </button>

            <button
              onClick={() => setAdminTab('admissions')}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                adminTab === 'admissions'
                  ? 'bg-indigo-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Alur Admisi</span>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-mono">
                {admissionDecisions.length}
              </span>
            </button>

            <button
              onClick={() => setAdminTab('registrations')}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                adminTab === 'registrations'
                  ? 'bg-white text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ClipboardList className="w-4 h-4 text-amber-600" />
              <span>Pendaftaran (Modul 1)</span>
              <span className="text-[10px] bg-slate-200 px-1.5 py-0.2 rounded font-mono">
                {registrations.length}
              </span>
            </button>

            <button
              onClick={() => setAdminTab('observations')}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                adminTab === 'observations'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Observasi Guru (Modul 2)</span>
              <span className="text-[10px] bg-black/10 px-1.5 py-0.2 rounded font-mono">
                {observationSessions.length}
              </span>
            </button>

            <button
              onClick={() => setAdminTab('reports')}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                adminTab === 'reports'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCheck2 className="w-4 h-4 text-amber-400" />
              <span>Laporan & PPI (Modul 3)</span>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-mono">
                {observationReports.length}
              </span>
            </button>

            <button
              onClick={() => setAdminTab('users')}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                adminTab === 'users'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Staf & Akses</span>
            </button>

            <button
              onClick={() => setAdminTab('audit')}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                adminTab === 'audit'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Jejak Audit</span>
            </button>
          </div>

          {/* Role Persona Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-amber-500" />
              <span>Simulasi Peran:</span>
            </span>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
              <button
                onClick={() => setActiveRole('observer')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  activeRole === 'observer'
                    ? 'bg-amber-100 text-amber-950 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Guru Observer: Menyusun observasi & rekomendasi PPI"
              >
                Guru Observer
              </button>
              <button
                onClick={() => setActiveRole('principal')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  activeRole === 'principal'
                    ? 'bg-emerald-100 text-emerald-950 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Kepala Sekolah: Menelaah, memberi catatan revisi, dan mengesahkan laporan"
              >
                Kepala Sekolah
              </button>
              <button
                onClick={() => setActiveRole('staff')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  activeRole === 'staff'
                    ? 'bg-sky-100 text-sky-950 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Admin Admisi: Melihat jadwal & status pendaftaran"
              >
                Admin Admisi
              </button>
              <button
                onClick={() => setActiveRole('admin')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  activeRole === 'admin'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Super Admin: Pengaturan instrumen dan izin penuh"
              >
                Super Admin
              </button>
            </div>
          </div>

        </div>

        {/* TAB 0: RINGKASAN EKSEKUTIF & METRIK (MODUL 4 FEATURE 1) */}
        {adminTab === 'analytics' && (
          <AnalyticsDashboard
            metrics={metrics}
            registrations={registrations}
            observationSessions={observationSessions}
            observationReports={observationReports}
            admissionDecisions={admissionDecisions}
            currentRole={activeRole}
            onOpenDetail={(reg) => setSelectedStudentForDetail(reg)}
            onOpenScheduler={(reg) => setSelectedStudentForScheduler(reg)}
            onOpenObservation={(student, reg) => {
              const existing = observationSessions.find((s) => s.student_id === student.id);
              if (existing) {
                handleOpenExistingSession(existing, 'edit');
              } else {
                handleStartObservationSession(student, reg);
              }
            }}
            onOpenReport={(student, reg) => handleOpenModule3Report(student, reg)}
            onRecordDecision={(reg) => setSelectedRegForAdmissionDecision(reg)}
          />
        )}

        {/* TAB 0.5: ALUR ADMISI 9-TAHAP & KEPUTUSAN MANUAL (MODUL 4 FEATURE 3) */}
        {adminTab === 'admissions' && (
          <AdmissionWorkflowView
            registrations={registrations}
            observationSessions={observationSessions}
            observationReports={observationReports}
            admissionDecisions={admissionDecisions}
            currentRole={activeRole}
            onOpenDecisionModal={(reg) => setSelectedRegForAdmissionDecision(reg)}
            onOpenDetail={(reg) => setSelectedStudentForDetail(reg)}
            onOpenReport={(student, reg) => handleOpenModule3Report(student, reg)}
          />
        )}

        {/* TAB 1: REGISTRASI & JADWAL (MODUL 1) */}
        {adminTab === 'registrations' && (
          <div className="space-y-6">
            
            {/* Metrics Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
                <span className="text-xs font-semibold text-slate-500">Total Pendaftar</span>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
                  {metrics.total}
                </div>
                <span className="text-[11px] text-slate-400 block">Siswa terdata di sistem</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-2xs space-y-1">
                <span className="text-xs font-semibold text-amber-700">Pendaftaran Baru</span>
                <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 font-mono tabular-nums">
                  {metrics.newReg}
                </div>
                <span className="text-[11px] text-amber-600/70 block">Perlu verifikasi awal</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-sky-200/80 shadow-2xs space-y-1">
                <span className="text-xs font-semibold text-sky-700">Menunggu Jadwal</span>
                <div className="text-2xl sm:text-3xl font-extrabold text-sky-600 font-mono tabular-nums">
                  {metrics.waitingSchedule}
                </div>
                <span className="text-[11px] text-sky-600/70 block">Menunggu slot waktu</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-emerald-200/80 shadow-2xs space-y-1">
                <span className="text-xs font-semibold text-emerald-700">Jadwal Terkonfirmasi</span>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono tabular-nums">
                  {metrics.confirmed}
                </div>
                <span className="text-[11px] text-emerald-600/70 block">Siap sesi observasi</span>
              </div>
            </div>

            {/* Filters & Search Bar */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari nama anak / nomor registrasi..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <select
                    value={selectedDateFilter}
                    onChange={(e) => setSelectedDateFilter(e.target.value as any)}
                    className="p-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="all">Semua Tanggal Pendaftaran</option>
                    <option value="today">Hari Ini</option>
                    <option value="this_week">7 Hari Terakhir</option>
                    <option value="this_month">Bulan Ini</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto">
                {(['All', 'Pendaftaran Baru', 'Menunggu Jadwal', 'Jadwal Terkonfirmasi', 'Dibatalkan'] as const).map((status) => {
                  const isActive = selectedStatus === status;
                  return (
                    <button
                      key={status}
                      onClick={() => setSelectedStatus(status)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                        isActive
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {status === 'All' ? 'Semua Status' : status}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Registrations Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3.5 px-4 sm:px-6">No. Registrasi</th>
                      <th className="py-3.5 px-4">Nama Siswa & Usia</th>
                      <th className="py-3.5 px-4">Orang Tua / Wali</th>
                      <th className="py-3.5 px-4">Status Pendaftaran</th>
                      <th className="py-3.5 px-4">Jadwal Observasi</th>
                      <th className="py-3.5 px-4 sm:px-6 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRegistrations.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-500 space-y-2">
                          <p className="font-semibold text-sm">Tidak ada pendaftar yang cocok dengan filter.</p>
                          <button
                            onClick={() => {
                              setSearchQuery('');
                              setSelectedStatus('All');
                              setSelectedDateFilter('all');
                            }}
                            className="text-xs text-amber-600 font-bold hover:underline"
                          >
                            Reset Filter
                          </button>
                        </td>
                      </tr>
                    ) : (
                      filteredRegistrations.map((reg) => {
                        const student = reg.student;
                        const guardian = reg.guardian;
                        const apt = reg.appointment;

                        return (
                          <tr key={reg.id} className="hover:bg-amber-50/20 transition-colors">
                            <td className="py-4 px-4 sm:px-6 font-mono font-bold text-amber-800 whitespace-nowrap">
                              {reg.registration_number}
                            </td>

                            <td className="py-4 px-4">
                              <div className="font-bold text-slate-900 text-sm">{student?.full_name}</div>
                              <div className="text-slate-500 text-xs">
                                "{student?.preferred_name}" · {student?.gender} · <span className="text-slate-700 font-medium">{student?.calculated_age || '-'}</span>
                              </div>
                            </td>

                            <td className="py-4 px-4">
                              <div className="font-semibold text-slate-800">{guardian?.full_name}</div>
                              <a
                                href={`https://wa.me/${guardian?.whatsapp_number.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-emerald-700 font-bold hover:underline"
                              >
                                {guardian?.whatsapp_number}
                              </a>
                            </td>

                            <td className="py-4 px-4 whitespace-nowrap">
                              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md inline-block border ${
                                reg.status === 'Jadwal Terkonfirmasi'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : reg.status === 'Menunggu Jadwal'
                                  ? 'bg-sky-50 text-sky-800 border-sky-200'
                                  : reg.status === 'Dibatalkan'
                                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}>
                                {reg.status}
                              </span>
                              <div className="text-[11px] text-slate-400 mt-1">
                                {formatShortDate(reg.submission_date)}
                              </div>
                            </td>

                            <td className="py-4 px-4 text-xs">
                              {apt && apt.status !== 'Dibatalkan' ? (
                                <div className="space-y-0.5">
                                  <span className="font-bold text-slate-900 block">
                                    {formatShortDate(apt.appointment_date)} · {apt.time_slot}
                                  </span>
                                  <span className="text-slate-500 block text-[11px]">
                                    {apt.location_room}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-slate-400 italic text-xs">Belum dijadwalkan</span>
                              )}
                            </td>

                            <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                {student && (
                                  <button
                                    onClick={() => handleOpenModule3Report(student, reg)}
                                    className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                                    title="Buka Laporan Resmi & Rekomendasi PPI (Modul 3)"
                                  >
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>Laporan</span>
                                  </button>
                                )}
                                <button
                                  onClick={() => setSelectedStudentForScheduler(reg)}
                                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                                  title="Atur atau Reschedule Jadwal"
                                >
                                  Jadwal
                                </button>
                                <button
                                  onClick={() => setSelectedStudentForDetail(reg)}
                                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
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

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <span>Menampilkan {filteredRegistrations.length} dari {registrations.length} data pendaftar</span>
                <span className="font-semibold text-slate-600">Little Star School Admission System</span>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: OBSERVASI GURU (MODUL 2) */}
        {adminTab === 'observations' && (
          <div className="space-y-6">
            <ObservationSessionList
              sessions={observationSessions}
              registrations={registrations}
              currentRole={activeRole}
              onStartNewSession={handleStartObservationSession}
              onOpenSession={handleOpenExistingSession}
              onOpenConfigModal={() => setIsConfigModalOpen(true)}
            />
          </div>
        )}

        {/* TAB 3: LAPORAN RESMI & REKOMENDASI PPI (MODUL 3) */}
        {adminTab === 'reports' && (
          <div className="space-y-6">
            <ReportArchiveView
              reports={observationReports}
              registrations={registrations}
              settings={settings}
              currentRole={activeRole}
              onOpenReportDocument={(rep) => {
                setActiveReportForDocument(rep);
              }}
              onOpenRecommendations={(rep) => {
                setActiveReportForRecommendations(rep);
              }}
              onReviewReport={(rep) => {
                setReportToReview(rep);
              }}
            />
          </div>
        )}

        {/* TAB 4: MANAJEMEN PENGGUNA & PENUGASAN OBSERVER (MODUL 4 FEATURE 2) */}
        {adminTab === 'users' && (
          <UserManagementView
            currentRole={activeRole}
            registrations={registrations}
            onRefreshData={refreshData}
          />
        )}

        {/* TAB 5: JEJAK AUDIT SISTEM (MODUL 4 FEATURE 5) */}
        {adminTab === 'audit' && (
          <AuditLogView currentRole={activeRole} />
        )}

      </div>

      {/* Student Detail Modal */}
      {selectedStudentForDetail && (
        <StudentDetailModal
          registration={selectedStudentForDetail}
          onClose={() => setSelectedStudentForDetail(null)}
          onUpdate={(updated) => {
            refreshData();
            setSelectedStudentForDetail(updated);
          }}
          onOpenScheduler={(reg) => {
            setSelectedStudentForDetail(null);
            setSelectedStudentForScheduler(reg);
          }}
          onOpenObservation={(student, reg, mode) => {
            setSelectedStudentForDetail(null);
            const existing = observationSessions.find((s) => s.student_id === student.id);
            if (existing) {
              handleOpenExistingSession(existing, mode || 'edit');
            } else {
              handleStartObservationSession(student, reg);
            }
          }}
          onOpenReport={(student, reg) => {
            setSelectedStudentForDetail(null);
            handleOpenModule3Report(student, reg);
          }}
        />
      )}

      {/* Appointment Scheduler Modal */}
      {selectedStudentForScheduler && (
        <AppointmentSchedulerModal
          registration={selectedStudentForScheduler}
          onClose={() => setSelectedStudentForScheduler(null)}
          onScheduled={(updated) => {
            refreshData();
            setSelectedStudentForScheduler(null);
          }}
        />
      )}

      {/* School Settings Modal */}
      {isSettingsModalOpen && (
        <SchoolSettingsModal
          settings={settings}
          onClose={() => setIsSettingsModalOpen(false)}
          onSaved={(updated) => {
            onUpdateSettings(updated);
            setIsSettingsModalOpen(false);
          }}
        />
      )}

      {/* Configurable Observation Items Modal */}
      <ConfigurableItemsModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onItemsUpdated={() => {
          refreshData();
        }}
      />

      {/* Admission Decision Modal (Module 4) */}
      {selectedRegForAdmissionDecision && (
        <AdmissionDecisionModal
          registration={selectedRegForAdmissionDecision}
          existingDecision={admissionDecisions.find(d => d.registration_id === selectedRegForAdmissionDecision.id)}
          currentRole={activeRole}
          onClose={() => setSelectedRegForAdmissionDecision(null)}
          onSaved={() => {
            refreshData();
            setSelectedRegForAdmissionDecision(null);
          }}
        />
      )}

      {/* Export & Backup Modal (Module 4) */}
      {isExportModalOpen && (
        <ExportBackupModal
          currentRole={activeRole}
          onClose={() => setIsExportModalOpen(false)}
        />
      )}

    </div>
  );
};

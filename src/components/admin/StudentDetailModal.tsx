import React, { useState } from 'react';
import { Registration, RegistrationStatus, Student } from '../../types/database';
import { repository } from '../../lib/repository';
import { formatIndonesianDate } from '../../lib/utils';
import { 
  X, 
  User, 
  Phone, 
  MapPin, 
  Activity, 
  Calendar, 
  Clock, 
  FileText, 
  AlertCircle, 
  Save, 
  Sparkles,
  CheckCircle2,
  CalendarPlus,
  Plus
} from 'lucide-react';

interface StudentDetailModalProps {
  registration: Registration;
  onClose: () => void;
  onUpdate: (updated: Registration) => void;
  onOpenScheduler: (reg: Registration) => void;
  onOpenObservation?: (student: Student, registration: Registration, mode?: 'edit' | 'view') => void;
  onOpenReport?: (student: Student, registration: Registration) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  registration,
  onClose,
  onUpdate,
  onOpenScheduler,
  onOpenObservation,
  onOpenReport,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'developmental' | 'medical' | 'schedule' | 'observation'>('profile');
  const [currentStatus, setCurrentStatus] = useState<RegistrationStatus>(registration.status);
  const [adminNotes, setAdminNotes] = useState(registration.admin_notes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const student = registration.student;
  const guardian = registration.guardian;
  const dev = registration.developmental_background;
  const appointment = registration.appointment;

  const handleSaveStatusAndNotes = () => {
    setIsSaving(true);
    const updated = repository.updateRegistrationStatus(registration.id, currentStatus, adminNotes);
    setIsSaving(false);
    if (updated) {
      onUpdate(updated);
      setFeedback('Status dan catatan internal berhasil diperbarui.');
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleCancelAppointment = () => {
    if (confirm('Batalkan janji observasi untuk pendaftar ini? Status akan dikembalikan ke "Menunggu Jadwal".')) {
      repository.cancelAppointment(registration.id, 'Dibatalkan oleh staf admin');
      const updated = repository.getRegistrationById(registration.id);
      if (updated) {
        onUpdate(updated);
        setCurrentStatus(updated.status);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-6 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100 pr-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                {registration.registration_number}
              </span>
              <span className="text-xs text-slate-400">
                Diajukan {formatIndonesianDate(registration.submission_date)}
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mt-1">
              {student?.full_name}
            </h3>
            <p className="text-xs text-slate-500">
              Panggilan: <strong className="text-slate-700">"{student?.preferred_name}"</strong> · {student?.gender} · Usia: {student?.calculated_age || '-'}
            </p>
          </div>

          <div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full border inline-block ${
              currentStatus === 'Jadwal Terkonfirmasi'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : currentStatus === 'Menunggu Jadwal'
                ? 'bg-sky-50 text-sky-800 border-sky-200'
                : currentStatus === 'Dibatalkan'
                ? 'bg-rose-50 text-rose-800 border-rose-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}>
              {currentStatus}
            </span>
          </div>
        </div>

        {/* Notification Feedback */}
        {feedback && (
          <div className="my-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 mt-4 mb-5 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'profile' ? 'bg-amber-100/70 text-amber-900' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Identitas & Wali
          </button>
          <button
            onClick={() => setActiveTab('developmental')}
            className={`px-3 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'developmental' ? 'bg-amber-100/70 text-amber-900' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Profil Sensori & Minat
          </button>
          <button
            onClick={() => setActiveTab('medical')}
            className={`px-3 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'medical' ? 'bg-amber-100/70 text-amber-900' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Riwayat Asesmen Luar
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-3 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'schedule' ? 'bg-amber-100/70 text-amber-900' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Jadwal & Catatan Admin
          </button>
          <button
            onClick={() => setActiveTab('observation')}
            className={`px-3 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'observation' ? 'bg-amber-500 text-slate-950 font-extrabold shadow-2xs' : 'text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Observasi ABK (Modul 2)</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
          
          {/* TAB 1: Profile & Wali */}
          {activeTab === 'profile' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 uppercase tracking-wider block text-[11px]">
                  Data Murid
                </span>
                <div className="grid grid-cols-2 gap-3 text-slate-700">
                  <div>
                    <span className="text-slate-400 block">Tempat, Tanggal Lahir:</span>
                    <span className="font-semibold text-slate-900">{student?.birth_place}, {student?.birth_date}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Usia Saat Mendaftar:</span>
                    <span className="font-semibold text-slate-900">{student?.calculated_age || '-'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block">Alamat Domisili:</span>
                    <span className="font-semibold text-slate-900">{student?.address}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block">Riwayat Pendidikan Sebelumnya:</span>
                    <span className="text-slate-800">{student?.previous_education || 'Belum pernah mengikuti sekolah formal.'}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/70 space-y-2">
                <span className="font-bold text-amber-900 uppercase tracking-wider block text-[11px]">
                  Kontak Orang Tua / Wali
                </span>
                <div className="grid grid-cols-2 gap-3 text-slate-700">
                  <div>
                    <span className="text-slate-400 block">Nama Wali:</span>
                    <span className="font-semibold text-slate-900">{guardian?.full_name} ({guardian?.relationship})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Nomor WhatsApp:</span>
                    <a
                      href={`https://wa.me/${guardian?.whatsapp_number.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-emerald-700 hover:underline"
                    >
                      {guardian?.whatsapp_number}
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Email:</span>
                    <span className="text-slate-800">{guardian?.email || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Kontak Darurat:</span>
                    <span className="font-semibold text-slate-900">{guardian?.emergency_contact_name} ({guardian?.emergency_contact_phone})</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Developmental Profile */}
          {activeTab === 'developmental' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block">Kekuatan & Minat Spesifik:</span>
                <p className="text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                  {dev?.strengths_and_interests}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-200 space-y-2">
                <span className="font-bold text-sky-950 block">Metode Komunikasi Aktif:</span>
                <div className="flex flex-wrap gap-1.5">
                  {dev?.communication_method.map((m, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-md bg-white border border-sky-300 text-sky-900 font-semibold text-xs">
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200 space-y-2">
                <span className="font-bold text-amber-950 block">Kemandirian Harian:</span>
                <div className="grid grid-cols-3 gap-2 text-slate-800 text-[11px]">
                  <div className="bg-white p-2 rounded-lg border border-amber-100">
                    <span className="text-slate-400 block">Makan/Minum:</span>
                    <strong>{dev?.daily_living_skills.eating}</strong>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-amber-100">
                    <span className="text-slate-400 block">Toilet:</span>
                    <strong>{dev?.daily_living_skills.toileting}</strong>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-amber-100">
                    <span className="text-slate-400 block">Berpakaian:</span>
                    <strong>{dev?.daily_living_skills.dressing}</strong>
                  </div>
                </div>
                {dev?.daily_living_skills.notes && (
                  <p className="text-slate-600 text-[11px] pt-1">Catatan: {dev.daily_living_skills.notes}</p>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200 space-y-2">
                <span className="font-bold text-emerald-950 block">Sensitivitas & Preferensi Sensori:</span>
                <div className="flex flex-wrap gap-1.5">
                  {dev?.sensory_preferences.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-white border border-emerald-300 text-emerald-900 font-medium text-xs">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block">Interaksi Sosial & Respon Lingkungan Baru:</span>
                <p className="text-slate-700 leading-relaxed">{dev?.social_interaction}</p>
              </div>
            </div>
          )}

          {/* TAB 3: Medical / Professional Assessment */}
          {activeTab === 'medical' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block">Riwayat Terapi Sebelumnya:</span>
                <div className="flex flex-wrap gap-1.5">
                  {dev?.previous_therapy_support.map((t, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-md bg-white border border-slate-300 text-slate-800 font-semibold text-xs">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-200 space-y-2">
                <span className="font-bold text-purple-950 block">Status Asesmen Medis / Psikolog Luar:</span>
                {dev?.has_professional_assessment ? (
                  <div className="space-y-1.5 text-purple-900">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-purple-200 text-purple-900 font-bold text-xs">
                      Sudah Ada Asesmen
                    </span>
                    <p className="bg-white p-3 rounded-xl border border-purple-200 leading-relaxed text-slate-800">
                      {dev.professional_assessment_details || 'Tidak ada catatan detail.'}
                    </p>
                  </div>
                ) : (
                  <p className="text-slate-500 italic">
                    Belum ada diagnosis atau asesmen resmi sebelumnya. Anak akan dievaluasi secara menyeluruh mulai dari sesi observasi awal Little Star School.
                  </p>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block">Riwayat Tumbuh Kembang & Harapan Orang Tua:</span>
                <p className="text-slate-700 leading-relaxed mb-2"><strong>Riwayat:</strong> {dev?.developmental_history}</p>
                <p className="text-slate-700 leading-relaxed"><strong>Harapan:</strong> {dev?.parent_concerns_expectations}</p>
              </div>
            </div>
          )}

          {/* TAB 4: Scheduling & Admin Notes */}
          {activeTab === 'schedule' && (
            <div className="space-y-4 text-xs">
              
              {/* Existing Appointment Box */}
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-950 uppercase tracking-wider text-[11px]">
                    Status Janji Observasi
                  </span>
                  {appointment && appointment.status !== 'Dibatalkan' ? (
                    <button
                      onClick={handleCancelAppointment}
                      className="text-rose-600 hover:text-rose-800 font-bold underline text-xs cursor-pointer"
                    >
                      Batalkan Janji Ini
                    </button>
                  ) : null}
                </div>

                {appointment && appointment.status !== 'Dibatalkan' ? (
                  <div className="space-y-2 bg-white p-4 rounded-xl border border-sky-200">
                    <div className="grid grid-cols-2 gap-2 text-slate-800 font-semibold">
                      <div>Tanggal: {formatIndonesianDate(appointment.appointment_date)}</div>
                      <div>Waktu: {appointment.time_slot}</div>
                      <div>Ruang: {appointment.location_room}</div>
                      <div>Observer: {appointment.observer_name || 'Belum ditentukan'}</div>
                    </div>
                    {appointment.notes && (
                      <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                        Catatan: {appointment.notes}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-600 italic">
                    Belum ada jadwal observasi yang ditentukan untuk pendaftar ini.
                  </p>
                )}

                <div className="pt-2">
                  <button
                    onClick={() => onOpenScheduler(registration)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                  >
                    <CalendarPlus className="w-4 h-4" />
                    <span>{appointment && appointment.status !== 'Dibatalkan' ? 'Reschedule Jadwal' : 'Atur Jadwal Observasi'}</span>
                  </button>
                </div>
              </div>

              {/* Status Selector & Internal Notes */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
                  Perbarui Status & Catatan Staf
                </span>

                <div className="space-y-1.5">
                  <label className="block text-slate-700 font-semibold">Status Pendaftaran:</label>
                  <select
                    value={currentStatus}
                    onChange={(e) => setCurrentStatus(e.target.value as RegistrationStatus)}
                    className="w-full p-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900"
                  >
                    <option value="Pendaftaran Baru">Pendaftaran Baru</option>
                    <option value="Menunggu Jadwal">Menunggu Jadwal</option>
                    <option value="Jadwal Terkonfirmasi">Jadwal Terkonfirmasi</option>
                    <option value="Dibatalkan">Dibatalkan</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-700 font-semibold">Catatan Administrasi Internal:</label>
                  <textarea
                    rows={3}
                    placeholder="Tuliskan catatan internal tim (misal: orang tua meminta sesi pagi, berkas medis lengkap)..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900"
                  />
                </div>

                <button
                  onClick={handleSaveStatusAndNotes}
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                </button>
              </div>

            </div>
          )}

          {/* TAB 5: Modul Observasi ABK */}
          {activeTab === 'observation' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-amber-950 text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>Sesi Observasi & Asesmen Khusus ABK</span>
                    </h4>
                    <p className="text-[11px] text-amber-900 mt-0.5">
                      Asesmen 7 domain perkembangan anak berkebutuhan khusus dengan skala 0–3 non-punitif.
                    </p>
                  </div>

                  {student && onOpenObservation && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenObservation(student, registration, 'edit');
                      }}
                      className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5 text-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Mulai Sesi Baru</span>
                    </button>
                  )}
                </div>

                {/* Existing Sessions for this student */}
                {(() => {
                  const studentSessions = repository.getObservationSessions(student?.id);
                  if (studentSessions.length === 0) {
                    return (
                      <div className="p-4 rounded-xl bg-white border border-amber-200 text-center space-y-2">
                        <p className="text-slate-500 text-xs">
                          Belum ada sesi observasi yang dicatat untuk <strong>{student?.full_name}</strong>.
                        </p>
                        {student && onOpenObservation && (
                          <button
                            onClick={() => {
                              onClose();
                              onOpenObservation(student, registration, 'edit');
                            }}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span>Buka Lembar Kerja Observasi Guru</span>
                          </button>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-2.5">
                      {studentSessions.map((sess) => {
                        const isApproved = sess.status === 'Disetujui Kepala Sekolah';
                        return (
                          <div
                            key={sess.id}
                            className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                Sesi #{sess.id}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isApproved 
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : sess.status === 'Selesai (Menunggu Telaah)'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {sess.status}
                              </span>
                            </div>

                            <div className="text-[11px] text-slate-600 space-y-0.5">
                              <div>Observer: <strong className="text-slate-900">{sess.observer_name}</strong></div>
                              <div>Waktu: {sess.session_date} ({sess.start_time} - {sess.end_time || 'berlangsung'}) · Ruang: {sess.room_location}</div>
                            </div>

                            {sess.synthesis?.strengths_and_interests && (
                              <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                                "{sess.synthesis.strengths_and_interests.slice(0, 110)}..."
                              </p>
                            )}

                            <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                              {student && onOpenObservation && (
                                <>
                                  {onOpenReport && (
                                    <button
                                      onClick={() => {
                                        onClose();
                                        onOpenReport(student, registration);
                                      }}
                                      className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                                    >
                                      <Sparkles className="w-3 h-3 text-slate-950" />
                                      <span>Laporan Resmi (Modul 3)</span>
                                    </button>
                                  )}
                                  <button
                                    onClick={() => {
                                      onClose();
                                      onOpenObservation(student, registration, 'view');
                                    }}
                                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                                  >
                                    Ringkasan
                                  </button>
                                  <button
                                    onClick={() => {
                                      onClose();
                                      onOpenObservation(student, registration, 'edit');
                                    }}
                                    className="px-3 py-1 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                                  >
                                    Lembar Kerja
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Actions */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};

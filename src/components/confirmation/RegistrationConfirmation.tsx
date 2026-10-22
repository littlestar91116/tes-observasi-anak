import React from 'react';
import { Registration, SchoolSettings } from '../../types/database';
import { StarLogo } from '../common/StarLogo';
import { formatIndonesianDate, createWhatsAppLink } from '../../lib/utils';
import { 
  Printer, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  MapPin, 
  MessageCircle, 
  ArrowLeft, 
  FileText, 
  User, 
  Sparkles,
  Info
} from 'lucide-react';

interface RegistrationConfirmationProps {
  registration: Registration;
  settings: SchoolSettings;
  onBackToHome: () => void;
}

export const RegistrationConfirmation: React.FC<RegistrationConfirmationProps> = ({
  registration,
  settings,
  onBackToHome,
}) => {
  const student = registration.student;
  const guardian = registration.guardian;
  const appointment = registration.appointment;

  const handlePrint = () => {
    window.print();
  };

  const whatsappInquiryUrl = createWhatsAppLink(
    settings.whatsapp_number,
    `Halo Little Star School, saya ingin mengonfirmasi pendaftaran observasi atas nama ${student?.full_name || 'anak kami'} dengan Nomor Registrasi: ${registration.registration_number}.`
  );

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      
      {/* Action Bar (Hidden when printing) */}
      <div className="no-print flex items-center justify-between mb-6">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </button>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak / Simpan Bukti PDF</span>
        </button>
      </div>

      {/* Official Registration Receipt Card */}
      <div className="print-card bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-10 space-y-8 relative overflow-hidden">
        
        {/* Decorative Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-sky-400 to-emerald-400" />

        {/* School Header Lockup */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <StarLogo size={42} />
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {settings.school_name}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Pusat Observasi & Tumbuh Kembang Anak Berkebutuhan Khusus
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Bukti Pendaftaran Observasi
            </span>
            <span className="text-xs text-slate-500 block">
              {formatIndonesianDate(registration.submission_date, true)}
            </span>
          </div>
        </div>

        {/* Prominent Success Notification & Unique Registration Number */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50/80 via-white to-amber-50/40 border border-emerald-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          
          <h3 className="text-lg sm:text-xl font-extrabold text-emerald-950">
            Pendaftaran Observasi Berhasil Diterima
          </h3>
          
          <p className="text-xs sm:text-sm text-emerald-900/80 max-w-md mx-auto leading-relaxed">
            Data pendaftaran dan profil tumbuh kembang calon murid telah tercatat aman dalam sistem Little Star School Pamekasan.
          </p>

          <div className="pt-2">
            <div className="inline-block bg-white px-6 py-3 rounded-2xl border-2 border-emerald-500/40 shadow-xs">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Nomor Registrasi Resmi
              </span>
              <span className="text-2xl sm:text-3xl font-mono font-extrabold text-emerald-800 tracking-wider">
                {registration.registration_number}
              </span>
            </div>
          </div>
        </div>

        {/* Registered Student & Parent Details Grid */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <User className="w-4 h-4 text-amber-500" />
            <span>Identitas Pendaftar</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm bg-slate-50/80 p-5 rounded-2xl border border-slate-200">
            <div>
              <span className="text-slate-400 block text-xs">Nama Lengkap Anak:</span>
              <span className="font-bold text-slate-900 text-base">{student?.full_name}</span>
            </div>

            <div>
              <span className="text-slate-400 block text-xs">Nama Panggilan:</span>
              <span className="font-semibold text-slate-800">"{student?.preferred_name}" ({student?.gender})</span>
            </div>

            <div>
              <span className="text-slate-400 block text-xs">Tempat, Tanggal Lahir:</span>
              <span className="font-semibold text-slate-850">{student?.birth_place}, {student?.birth_date}</span>
            </div>

            <div>
              <span className="text-slate-400 block text-xs">Status Pendaftaran:</span>
              <span className="font-bold text-amber-700 bg-amber-100/80 px-2.5 py-0.5 rounded-md inline-block">
                {registration.status}
              </span>
            </div>

            <div className="sm:col-span-2 pt-2 border-t border-slate-200">
              <span className="text-slate-400 block text-xs">Orang Tua / Wali:</span>
              <span className="font-semibold text-slate-800">{guardian?.full_name} ({guardian?.relationship}) — WhatsApp: {guardian?.whatsapp_number}</span>
            </div>
          </div>
        </div>

        {/* APPOINTMENT SECTION: Only when an appointment has actually been scheduled */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-sky-600" />
            <span>Jadwal Sesi Observasi</span>
          </h4>

          {appointment && appointment.status !== 'Dibatalkan' ? (
            /* Scheduled State */
            <div className="p-5 rounded-2xl bg-sky-50 border border-sky-200 space-y-3">
              <div className="flex items-center gap-2 text-sky-900 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-sky-600" />
                <span>Jadwal Observasi Terkonfirmasi</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
                <div>
                  <span className="text-sky-700 block text-xs">Hari & Tanggal:</span>
                  <span className="font-bold text-slate-900">{formatIndonesianDate(appointment.appointment_date)}</span>
                </div>
                <div>
                  <span className="text-sky-700 block text-xs">Waktu:</span>
                  <span className="font-bold text-slate-900">{appointment.time_slot}</span>
                </div>
                <div>
                  <span className="text-sky-700 block text-xs">Lokasi Ruangan:</span>
                  <span className="font-bold text-slate-900">{appointment.location_room}</span>
                </div>
              </div>
              {appointment.observer_name && (
                <div className="pt-2 border-t border-sky-200 text-xs text-sky-900">
                  <span className="font-semibold">Observer Pendamping:</span> {appointment.observer_name}
                </div>
              )}
            </div>
          ) : (
            /* Pending Schedule State */
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold block">Menunggu Penetapan Jadwal oleh Tim Sekolah</span>
                <p className="leading-relaxed text-slate-600">
                  Jadwal observasi belum ditetapkan. Tim administrasi Little Star School akan menghubungi nomor WhatsApp Anda dalam 1-2 hari kerja untuk menyepakati tanggal dan jam yang paling nyaman bagi anak.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Next Steps Guide for Parents */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>Langkah Selanjutnya untuk Orang Tua</span>
          </h4>

          <ol className="space-y-2 text-xs sm:text-sm text-slate-600 list-decimal list-inside bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <li className="leading-relaxed">
              <span className="font-semibold text-slate-800">Simpan Nomor Registrasi:</span> Gunakan kode <strong className="text-amber-700">{registration.registration_number}</strong> untuk verifikasi saat berkomunikasi dengan admin.
            </li>
            <li className="leading-relaxed">
              <span className="font-semibold text-slate-800">Pastikan WhatsApp Aktif:</span> Tim kami akan mengirimkan pengingat (*reminder*) dan panduan observasi sebelum jadwal berlangsung.
            </li>
            <li className="leading-relaxed">
              <span className="font-semibold text-slate-800">Persiapan Anak:</span> Pastikan anak dalam kondisi istirahat cukup, sudah sarapan/makan, dan kenakan pakaian yang nyaman untuk bergerak bebas.
            </li>
            <li className="leading-relaxed">
              <span className="font-semibold text-slate-800">Membawa Berkas (Bila Ada):</span> Bawa salinan asesmen tumbuh kembang, resume medis dokter, atau contoh hasil karya gambar anak.
            </li>
          </ol>
        </div>

        {/* Footer info in receipt */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div>
            <span>Alamat: {settings.address}</span>
          </div>
          <div className="no-print">
            <a
              href={whatsappInquiryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-bold"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Konfirmasi via WhatsApp</span>
            </a>
          </div>
        </div>

      </div>

    </div>
  );
};

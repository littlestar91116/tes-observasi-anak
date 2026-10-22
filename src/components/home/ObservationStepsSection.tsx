import React from 'react';
import { PlayObservationIllustration } from '../common/Illustrations';
import { FileText, CalendarCheck, Sparkles, Award } from 'lucide-react';

interface ObservationStepsSectionProps {
  onRegisterClick: () => void;
}

export const ObservationStepsSection: React.FC<ObservationStepsSectionProps> = ({ onRegisterClick }) => {
  const steps = [
    {
      step: '01',
      title: 'Pendaftaran & Riwayat Perkembangan',
      desc: 'Orang tua mengisi formulir online mengenai kekuatan, preferensi sensori, metode komunikasi, serta riwayat terapi anak.',
      icon: <FileText className="w-5 h-5 text-amber-600" />,
      color: 'bg-amber-50 border-amber-200 text-amber-900',
    },
    {
      step: '02',
      title: 'Konfirmasi Jadwal Sesi Ramah Anak',
      desc: 'Tim admisi Little Star School memverifikasi data dan mengonfirmasi waktu observasi yang disesuaikan dengan jam aktif nyaman anak.',
      icon: <CalendarCheck className="w-5 h-5 text-sky-600" />,
      color: 'bg-sky-50 border-sky-200 text-sky-900',
    },
    {
      step: '03',
      title: 'Observasi Berbasis Bermain (Play-Based)',
      desc: 'Anak diajak berinteraksi dengan mainan sensori dan media edukatif didampingi psikolog dan guru khusus tanpa ada tekanan tes.',
      icon: <Sparkles className="w-5 h-5 text-emerald-600" />,
      color: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    },
    {
      step: '04',
      title: 'Konsultasi Hasil & Rencana Program (PPI)',
      desc: 'Diskusi tatap muka dengan orang tua untuk menguraikan profil perkembangan anak dan menyusun Program Pembelajaran Individual.',
      icon: <Award className="w-5 h-5 text-purple-600" />,
      color: 'bg-purple-50 border-purple-200 text-purple-900',
    },
  ];

  return (
    <section id="tahapan-observasi" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <span className="text-xs font-bold tracking-wider uppercase text-amber-600">
            Metodologi Asesmen Kami
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Bagaimana Proses Observasi Dilaksanakan?
          </h2>
          <p className="text-slate-600 text-base leading-relaxed">
            Observasi bukan ujian kelulusan. Ini adalah jembatan hangat bagi kami untuk memahami dunia buah hati Anda dan merancang dukungan yang paling tepat.
          </p>
        </div>

        {/* Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Numbered Editorial Steps */}
          <div className="lg:col-span-7 space-y-4">
            {steps.map((item) => (
              <div
                key={item.step}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-300 transition-colors shadow-2xs flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center font-bold text-slate-800 text-base shrink-0">
                  {item.step}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-base">{item.title}</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Illustration & Quick CTA Card */}
          <div className="lg:col-span-5 space-y-6">
            <PlayObservationIllustration />
            
            <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 space-y-4">
              <h4 className="font-bold text-amber-950 text-base">Siap Memulai Observasi?</h4>
              <p className="text-xs text-amber-900/90 leading-relaxed">
                Pendaftaran observasi tahap awal memerlukan waktu pengisian sekitar 5-7 menit. Siapkan catatan kebiasaan atau berkas asesmen bila ada.
              </p>
              <button
                onClick={onRegisterClick}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 active:scale-98 text-white font-bold text-sm rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Daftar Observasi Sekarang
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

import React from 'react';
import { HeroStarIllustration } from '../common/Illustrations';
import { StarLogo } from '../common/StarLogo';
import { ArrowRight, Sparkles, HeartHandshake, ShieldCheck } from 'lucide-react';

interface HeroSectionProps {
  schoolName: string;
  tagline: string;
  onRegisterClick: () => void;
  onLearnMoreClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  schoolName,
  tagline,
  onRegisterClick,
  onLearnMoreClick,
}) => {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:py-20 bg-gradient-to-b from-amber-50/40 via-[#FDFBF7] to-white border-b border-amber-100/50">
      
      {/* Subtle background ambient blur */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-sky-100/50 via-amber-100/40 to-emerald-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Heading, Value Proposition & Dual CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Child-friendly gentle kicker */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/80 border border-amber-200/70 text-amber-900 text-xs sm:text-sm font-semibold shadow-xs">
              <StarLogo size={20} className="shrink-0" />
              <span>Sekolah Khusus & Pusat Tumbuh Kembang Ramah Anak</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.18] text-balance">
              {schoolName}
            </h1>

            <p className="text-xl sm:text-2xl font-bold text-amber-600/90 leading-snug">
              "{tagline}"
            </p>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
              Membuka ruang belajar yang aman, penuh kasih, dan adaptif bagi anak-anak dengan kebutuhan khusus (ABK) di Pamekasan. Melalui asesmen observasi berbasis bermain, kami menggali potensi terbaik setiap bintang kecil Anda.
            </p>

            {/* Trust and Key Strengths row */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              <div className="bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-sky-100 shadow-2xs">
                <div className="flex items-center gap-2 text-sky-700 font-bold text-xs mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Observasi Ramah Anak</span>
                </div>
                <p className="text-xs text-slate-500 leading-snug">Tanpa tekanan tes formal, berpusat pada stimulasi bermain menyenangkan.</p>
              </div>

              <div className="bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-emerald-100 shadow-2xs">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs mb-1">
                  <HeartHandshake className="w-3.5 h-3.5" />
                  <span>Program Individual (PPI)</span>
                </div>
                <p className="text-xs text-slate-500 leading-snug">Kurikulum disesuaikan dengan profil sensori & minat unik tiap anak.</p>
              </div>

              <div className="bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-amber-100 shadow-2xs">
                <div className="flex items-center gap-2 text-amber-700 font-bold text-xs mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Kolaborasi Ahli</span>
                </div>
                <p className="text-xs text-slate-500 leading-snug">Didampingi psikolog, spesialis pendidikan khusus, & terapis berpengalaman.</p>
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={onRegisterClick}
                className="w-full sm:w-auto px-7 py-3.5 bg-amber-500 hover:bg-amber-600 active:scale-98 text-white font-bold text-base rounded-2xl shadow-md shadow-amber-200 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <span>Daftar Observasi</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={onLearnMoreClick}
                className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-50 active:scale-98 text-slate-700 hover:text-slate-900 font-semibold text-base rounded-2xl border border-slate-200/90 shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Informasi Pendaftaran</span>
              </button>
            </div>

            {/* Quiet metadata */}
            <p className="text-xs text-slate-500 pt-1">
              Pendaftaran Observasi Terbuka · Tahun Ajaran Berjalan · Kuota Terbatas untuk Pendampingan Optimal
            </p>

          </div>

          {/* Right Column: Hero Star Illustration */}
          <div className="lg:col-span-5 flex justify-center">
            <HeroStarIllustration className="w-full max-w-lg lg:max-w-none shadow-sm" />
          </div>

        </div>
      </div>
    </section>
  );
};

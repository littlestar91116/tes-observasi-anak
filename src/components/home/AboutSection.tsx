import React from 'react';
import { SensoryRoomIllustration } from '../common/Illustrations';
import { CheckCircle2, Heart, Smile, Sparkles } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section id="tentang-sekolah" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Visual Column */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <SensoryRoomIllustration />
            <div className="mt-4 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/50 text-xs text-amber-900 leading-relaxed flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Lingkungan Sensori-Adaptif:</span> Dirancang khusus agar anak merasa tenang, diterima, dan bebas dari kelebihan beban sensori (*sensory overload*).
              </div>
            </div>
          </div>

          {/* Text Column */}
          <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold tracking-wider uppercase text-amber-600">
                Mengenal Little Star School Pamekasan
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Ruang Belajar yang Menghargai Keunikan Setiap Anak
              </h2>
            </div>

            <p className="text-slate-600 leading-relaxed text-base">
              Little Star School Pamekasan hadir sebagai wujud kepedulian terhadap anak-anak berkebutuhan khusus (ABK) di Kabupaten Pamekasan dan sekitarnya. Kami meyakini bahwa setiap anak memiliki cara belajar, kecepatan, dan potensi berharga yang tidak dapat diukur dengan standar kaku semata.
            </p>

            <p className="text-slate-600 leading-relaxed text-base">
              Dengan pendekatan multidisiplin yang memadukan pendidikan khusus, penguatan sensori integrasi, terapi wicara, serta pembentukan kemandirian harian (*daily living skills*), kami merangkul anak dan keluarga dalam perjalanan tumbuh kembang yang menggembirakan.
            </p>

            {/* Core Values Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <span className="font-bold text-slate-800">Pendekatan Ramah Emosi</span>
                  <p className="text-xs text-slate-500">Membangun rasa aman (*secure attachment*) sebelum melatih keterampilan.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <span className="font-bold text-slate-800">Kemitraan Orang Tua</span>
                  <p className="text-xs text-slate-500">Orang tua adalah mitra utama dalam keberhasilan intervensi anak di rumah.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <span className="font-bold text-slate-800">Rasio Pengajar Optimal</span>
                  <p className="text-xs text-slate-500">Jumlah murid per kelas dibatasi demi pendampingan intensif & personal.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <span className="font-bold text-slate-800">Fasilitas Ramah Sensori</span>
                  <p className="text-xs text-slate-500">Peralatan motorik kasar, ayunan sensori, dan sudut relaksasi yang aman.</p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

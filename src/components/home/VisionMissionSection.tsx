import React from 'react';
import { SchoolSettings } from '../../types/database';
import { Compass, Target, Settings2 } from 'lucide-react';

interface VisionMissionSectionProps {
  settings: SchoolSettings;
  onOpenSettings?: () => void;
}

export const VisionMissionSection: React.FC<VisionMissionSectionProps> = ({
  settings,
  onOpenSettings,
}) => {
  return (
    <section className="py-20 bg-gradient-to-b from-[#FDFBF7] to-amber-50/30 border-y border-amber-100/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <span className="text-xs font-bold tracking-wider uppercase text-amber-600">
            Arah & Komitmen Pendidikan
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Visi dan Misi Sekolah
          </h2>
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
            <span>Konten dapat disesuaikan resmi melalui Pengaturan Administrator</span>
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-700 font-semibold underline cursor-pointer"
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span>Sesuaikan</span>
              </button>
            )}
          </div>
        </div>

        {/* Vision & Mission Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Visi Card */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-8 border border-amber-200/80 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Visi Sekolah</h3>
              <p className="text-slate-600 text-base leading-relaxed italic bg-amber-50/60 p-5 rounded-2xl border border-amber-100">
                "{settings.vision}"
              </p>
            </div>

            <div className="pt-6 border-t border-slate-100 text-xs text-slate-400">
              *Tercatat dalam Pengaturan Basis Data Sekolah (ID: {settings.id})
            </div>
          </div>

          {/* Misi Card */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-8 border border-sky-200/80 shadow-xs flex flex-col justify-between">
            <div className="space-y-5">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-600">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Misi Utama Little Star School</h3>
              
              <ul className="space-y-3.5 text-sm sm:text-base text-slate-700">
                {settings.mission.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-6 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between">
              <span>Fokus: Kebutuhan Khusus & Tumbuh Kembang Holistik</span>
              <span className="text-slate-400">Pamekasan, Madura</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

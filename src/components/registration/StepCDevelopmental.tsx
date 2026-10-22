import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FullRegistrationFormData } from '../../types/registration';
import { Heart, Activity, Ear, MessageCircle, FileCheck2, Lightbulb } from 'lucide-react';

interface StepCDevelopmentalProps {
  form: UseFormReturn<FullRegistrationFormData, any, any>;
}

const COMMUNICATION_OPTIONS = [
  'Verbal lancar & dua arah',
  'Kata tunggal / frasa pendek',
  'Bahasa Isyarat / Gestur alami',
  'PECS / Kartu Gambar Visual',
  'Vokalisasi / Nada suara non-kata',
  'Non-verbal (menggandeng tangan saat menginginkan sesuatu)',
];

const SENSORY_OPTIONS = [
  'Sensitif terhadap suara bising / keramaian',
  'Sensitif terhadap tekstur baju / sentuhan',
  'Pilih-pilih makanan ekstrem (picky eater / tekstur tertentu)',
  'Mencari stimulasi gerak (aktif melompat / berputar / vestibular)',
  'Sensitif terhadap pencahayaan terang',
  'Menyukai pelukan erat / sensasi tekanan dalam (proprioceptif)',
  'Tidak ada sensitivitas sensori yang menonjol',
];

const THERAPY_OPTIONS = [
  'Belum Pernah Terapi',
  'Terapi Wicara (Speech Therapy)',
  'Terapi Okupasi (Occupational Therapy)',
  'Sensori Integrasi (SI)',
  'Fisioterapi',
  'Behavior Therapy / ABA',
];

export const StepCDevelopmental: React.FC<StepCDevelopmentalProps> = ({ form }) => {
  const { register, watch, setValue, formState: { errors } } = form;

  const currentComm = watch('communication_method') || [];
  const currentSensory = watch('sensory_preferences') || [];
  const currentTherapy = watch('previous_therapy_support') || [];
  const hasAssessment = watch('has_professional_assessment');

  const toggleArrayItem = (fieldName: 'communication_method' | 'sensory_preferences' | 'previous_therapy_support', item: string) => {
    const list = watch(fieldName) || [];
    if (item === 'Belum Pernah Terapi' && fieldName === 'previous_therapy_support') {
      setValue(fieldName, ['Belum Pernah Terapi'], { shouldValidate: true });
      return;
    }

    let updated: string[];
    if (list.includes(item)) {
      updated = list.filter((i) => i !== item);
    } else {
      if (fieldName === 'previous_therapy_support') {
        updated = [...list.filter((i) => i !== 'Belum Pernah Terapi'), item];
      } else {
        updated = [...list, item];
      }
    }
    setValue(fieldName, updated, { shouldValidate: true });
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="border-b border-slate-100 pb-4">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Activity className="w-5 h-5 text-amber-500" />
          <span>Tahap C: Riwayat Perkembangan & Kebutuhan Khusus</span>
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Informasi ini membantu psikolog dan tim observasi Little Star School menyiapkan media bermain dan lingkungan sensori yang aman bagi anak Anda.
        </p>
      </div>

      <div className="space-y-6">

        {/* 1. Kekuatan & Minat Anak */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span>Kekuatan, Minat & Hal yang Disukai Anak <span className="text-rose-500">*</span></span>
          </label>
          <textarea
            rows={2}
            placeholder="Contoh: Sangat senang menyusun balok lego, menyukai alunan musik atau instrumen piano, hafal huruf angka, antusias dengan kendaraan mobil..."
            {...register('strengths_and_interests')}
            className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition-all ${
              errors.strengths_and_interests ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 bg-white'
            }`}
          />
          {errors.strengths_and_interests && (
            <p className="text-xs text-rose-500 font-medium">{errors.strengths_and_interests.message}</p>
          )}
          <span className="text-[11px] text-slate-400">Media favorit anak akan kami siapkan sebagai pemecah suasana (*ice breaker*) saat observasi.</span>
        </div>

        {/* 2. Metode Komunikasi (Multi-Select) */}
        <div className="space-y-2.5">
          <label className="block text-xs font-bold text-slate-700 flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-sky-500" />
            <span>Metode Komunikasi Anak Saat Ini <span className="text-rose-500">*</span></span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {COMMUNICATION_OPTIONS.map((opt) => {
              const isChecked = currentComm.includes(opt);
              return (
                <button
                  type="button"
                  key={opt}
                  onClick={() => toggleArrayItem('communication_method', opt)}
                  className={`p-3 rounded-xl border text-xs font-medium text-left transition-all flex items-center justify-between cursor-pointer ${
                    isChecked
                      ? 'bg-sky-50 border-sky-400 text-sky-900 shadow-2xs font-semibold'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span>{opt}</span>
                  <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ml-2 ${
                    isChecked ? 'bg-sky-600 border-sky-600 text-white' : 'border-slate-300'
                  }`}>
                    {isChecked && '✓'}
                  </span>
                </button>
              );
            })}
          </div>
          {errors.communication_method && (
            <p className="text-xs text-rose-500 font-medium">{errors.communication_method.message}</p>
          )}
        </div>

        {/* 3. Kemandirian Sehari-hari (Daily Living Skills) */}
        <div className="space-y-3 p-5 rounded-2xl bg-amber-50/40 border border-amber-100">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
            Kemandirian Harian Dasar (*Daily Living Skills*)
          </label>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Makan */}
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-700">Makan & Minum:</span>
              <select
                {...register('eating_skill')}
                className="w-full p-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-900"
              >
                <option value="Mandiri">Mandiri</option>
                <option value="Bantuan Sebagian">Bantuan Sebagian</option>
                <option value="Bantuan Penuh">Bantuan Penuh</option>
              </select>
            </div>

            {/* Toilet Training */}
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-700">Buang Air (Toilet):</span>
              <select
                {...register('toileting_skill')}
                className="w-full p-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-900"
              >
                <option value="Mandiri">Mandiri</option>
                <option value="Perlu Diingatkan">Perlu Diingatkan</option>
                <option value="Memakai Popok/Bantuan Penuh">Memakai Popok / Penuh</option>
              </select>
            </div>

            {/* Berpakaian */}
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-700">Berpakaian / Sepatu:</span>
              <select
                {...register('dressing_skill')}
                className="w-full p-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-900"
              >
                <option value="Mandiri">Mandiri</option>
                <option value="Bantuan Sebagian">Bantuan Sebagian</option>
                <option value="Bantuan Penuh">Bantuan Penuh</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <input
              type="text"
              placeholder="Catatan tambahan kemandirian (misal: perlu dibantu melepas sepatu bertali)"
              {...register('daily_living_notes')}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-900"
            />
          </div>
        </div>

        {/* 4. Interaksi Sosial & Regulasi Emosi */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            Interaksi Sosial & Respon terhadap Orang/Lingkungan Baru <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={2}
            placeholder="Contoh: Butuh waktu adaptasi sekitar 10 menit saat di ruangan baru, kontak mata baik dengan keluarga, belum terbiasa berbagi mainan dengan teman..."
            {...register('social_interaction')}
            className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition-all ${
              errors.social_interaction ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 bg-white'
            }`}
          />
          {errors.social_interaction && (
            <p className="text-xs text-rose-500 font-medium">{errors.social_interaction.message}</p>
          )}
        </div>

        {/* 5. Sensitivitas Sensori */}
        <div className="space-y-2.5">
          <label className="block text-xs font-bold text-slate-700 flex items-center gap-2">
            <Ear className="w-4 h-4 text-emerald-600" />
            <span>Preferensi & Sensitivitas Sensori (Pilih yang sesuai)</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SENSORY_OPTIONS.map((opt) => {
              const isChecked = currentSensory.includes(opt);
              return (
                <button
                  type="button"
                  key={opt}
                  onClick={() => toggleArrayItem('sensory_preferences', opt)}
                  className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all flex items-center justify-between cursor-pointer ${
                    isChecked
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span>{opt}</span>
                  <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ml-2 text-[10px] ${
                    isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300'
                  }`}>
                    {isChecked && '✓'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 6. Riwayat Terapi Sebelumnya */}
        <div className="space-y-2.5">
          <label className="block text-xs font-bold text-slate-700">
            Dukungan Pendidikan Khusus / Terapi Sebelumnya <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {THERAPY_OPTIONS.map((opt) => {
              const isChecked = currentTherapy.includes(opt);
              return (
                <button
                  type="button"
                  key={opt}
                  onClick={() => toggleArrayItem('previous_therapy_support', opt)}
                  className={`p-2.5 rounded-xl border text-xs text-center transition-all cursor-pointer ${
                    isChecked
                      ? 'bg-amber-100/80 border-amber-400 text-amber-900 font-bold shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {errors.previous_therapy_support && (
            <p className="text-xs text-rose-500 font-medium">{errors.previous_therapy_support.message}</p>
          )}
        </div>

        {/* 7. Riwayat Tumbuh Kembang & Kekhawatiran Orang Tua */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Riwayat Tumbuh Kembang Singkat <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              placeholder="Contoh: Riwayat kelahiran cukup bulan/prematur, usia mulai bicara kata pertama, berjalan..."
              {...register('developmental_history')}
              className={`w-full px-4 py-2 rounded-xl border text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 ${
                errors.developmental_history ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 bg-white'
              }`}
            />
            {errors.developmental_history && (
              <p className="text-xs text-rose-500 font-medium">{errors.developmental_history.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Kekhawatiran Utama & Harapan Orang Tua <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              placeholder="Contoh: Kami berharap anak dapat berkomunikasi dua arah dan memiliki teman bermain yang suportif..."
              {...register('parent_concerns_expectations')}
              className={`w-full px-4 py-2 rounded-xl border text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 ${
                errors.parent_concerns_expectations ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 bg-white'
              }`}
            />
            {errors.parent_concerns_expectations && (
              <p className="text-xs text-rose-500 font-medium">{errors.parent_concerns_expectations.message}</p>
            )}
          </div>
        </div>

        {/* 8. Diagnosis atau Asesmen Profesional Terdahulu (Opsional) */}
        <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register('has_professional_assessment')}
              className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
            />
            <span className="text-xs font-bold text-slate-800">
              Anak sudah memiliki hasil asesmen / diagnosis dari dokter spesialis anak / psikolog / psikiater
            </span>
          </label>

          {hasAssessment && (
            <div className="pt-2 space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Detail Asesmen / Nama Dokter / Klinik / Rumah Sakit:
              </label>
              <textarea
                rows={2}
                placeholder="Contoh: Diagnosis Speech Delay dari Dokter Tumbuh Kembang RSUD Pamekasan (Mei 2026), resume terlampir..."
                {...register('professional_assessment_details')}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm text-slate-900"
              />
              <span className="text-[11px] text-slate-400">
                Berkas fisik atau hasil scan dapat dibawa saat sesi observasi tatap muka.
              </span>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

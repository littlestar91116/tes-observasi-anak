import React, { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FullRegistrationFormData } from '../../types/registration';
import { calculateAgeIndonesian } from '../../lib/utils';
import { User, Calendar, MapPin, School, Sparkles } from 'lucide-react';

interface StepAChildInfoProps {
  form: UseFormReturn<FullRegistrationFormData, any, any>;
}

export const StepAChildInfo: React.FC<StepAChildInfoProps> = ({ form }) => {
  const { register, watch, setValue, formState: { errors } } = form;
  const birthDateValue = watch('birth_date');
  const calculatedAge = calculateAgeIndonesian(birthDateValue);

  return (
    <div className="space-y-6">
      
      {/* Step Header */}
      <div className="border-b border-slate-100 pb-4">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <User className="w-5 h-5 text-amber-500" />
          <span>Tahap A: Data & Identitas Anak</span>
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Lengkapi identitas calon murid yang akan mengikuti observasi tumbuh kembang.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Nama Lengkap */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="block text-xs font-bold text-slate-700">
            Nama Lengkap Anak <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Contoh: Muhammad Rayyan Al-Farizi"
            {...register('full_name')}
            className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition-all ${
              errors.full_name ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 bg-white'
            }`}
          />
          {errors.full_name && (
            <p className="text-xs text-rose-500 font-medium">{errors.full_name.message}</p>
          )}
        </div>

        {/* Nama Panggilan */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            Nama Panggilan / Sebutan Nyaman <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Contoh: Rayyan"
            {...register('preferred_name')}
            className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition-all ${
              errors.preferred_name ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 bg-white'
            }`}
          />
          {errors.preferred_name && (
            <p className="text-xs text-rose-500 font-medium">{errors.preferred_name.message}</p>
          )}
          <span className="text-[11px] text-slate-400">Panggilan yang biasa digunakan di rumah agar anak merasa akrab.</span>
        </div>

        {/* Jenis Kelamin */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            Jenis Kelamin <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3 pt-0.5">
            <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:border-amber-400 cursor-pointer bg-white">
              <input
                type="radio"
                value="Laki-laki"
                {...register('gender')}
                className="text-amber-500 focus:ring-amber-500"
              />
              <span className="text-xs font-semibold text-slate-800">Laki-laki</span>
            </label>
            <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:border-amber-400 cursor-pointer bg-white">
              <input
                type="radio"
                value="Perempuan"
                {...register('gender')}
                className="text-amber-500 focus:ring-amber-500"
              />
              <span className="text-xs font-semibold text-slate-800">Perempuan</span>
            </label>
          </div>
          {errors.gender && (
            <p className="text-xs text-rose-500 font-medium">{errors.gender.message}</p>
          )}
        </div>

        {/* Tempat Lahir */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            Tempat Lahir <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Contoh: Pamekasan"
            {...register('birth_place')}
            className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition-all ${
              errors.birth_place ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 bg-white'
            }`}
          />
          {errors.birth_place && (
            <p className="text-xs text-rose-500 font-medium">{errors.birth_place.message}</p>
          )}
        </div>

        {/* Tanggal Lahir & Live Age Calculation */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            Tanggal Lahir <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="date"
              max={new Date().toISOString().split('T')[0]}
              {...register('birth_date')}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition-all ${
                errors.birth_date ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 bg-white'
              }`}
            />
          </div>
          {errors.birth_date && (
            <p className="text-xs text-rose-500 font-medium">{errors.birth_date.message}</p>
          )}

          {/* Automatic Age Calculation Callout */}
          {calculatedAge && calculatedAge !== 'Tanggal tidak valid' && (
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Usia Terhitung Otomatis: {calculatedAge}</span>
            </div>
          )}
        </div>

        {/* Alamat Rumah Lengkap */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="block text-xs font-bold text-slate-700">
            Alamat Domisili Lengkap <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={2}
            placeholder="Contoh: Jl. Jokotole No. 45, RT 02 / RW 04, Kel. Barurambat Kota, Kec. Kota Pamekasan"
            {...register('address')}
            className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition-all ${
              errors.address ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 bg-white'
            }`}
          />
          {errors.address && (
            <p className="text-xs text-rose-500 font-medium">{errors.address.message}</p>
          )}
        </div>

        {/* Riwayat Sekolah / PAUD / Pengalaman Edukasi */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="block text-xs font-bold text-slate-700">
            Riwayat Sekolah / Pengalaman Pendidikan Sebelumnya (Opsional)
          </label>
          <textarea
            rows={2}
            placeholder="Contoh: Pernah mengikuti PAUD/TK selama 6 bulan, atau belum pernah sekolah formal..."
            {...register('previous_education')}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition-all"
          />
          <span className="text-[11px] text-slate-400">
            Bantu kami memahami bagaimana adaptasi anak di lingkungan kelas sebelumnya bila ada.
          </span>
        </div>

      </div>

    </div>
  );
};

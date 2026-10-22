import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FullRegistrationFormData } from '../../types/registration';
import { Shield, CheckSquare, FileLock, UserCheck, AlertCircle } from 'lucide-react';
import { calculateAgeIndonesian } from '../../lib/utils';

interface StepDConsentProps {
  form: UseFormReturn<FullRegistrationFormData, any, any>;
  isSubmitting: boolean;
}

export const StepDConsent: React.FC<StepDConsentProps> = ({ form, isSubmitting }) => {
  const { register, watch, formState: { errors } } = form;
  const values = watch();
  const calculatedAge = calculateAgeIndonesian(values.birth_date);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="border-b border-slate-100 pb-4">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Shield className="w-5 h-5 text-amber-500" />
          <span>Tahap D: Persetujuan, Privasi & Pengiriman</span>
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Tinjau kembali ringkasan data anak Anda dan berikan persetujuan pelaksanaan observasi.
        </p>
      </div>

      {/* Summary Review Card */}
      <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
            Ringkasan Berkas Pendaftaran
          </h4>
          <span className="text-[11px] text-amber-700 font-semibold bg-amber-100/80 px-2 py-0.5 rounded-md">
            Siap Dikirim
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700 bg-white p-4 rounded-xl border border-amber-100">
          <div>
            <span className="text-slate-400 block text-[11px]">Nama Lengkap Anak:</span>
            <span className="font-bold text-slate-900 text-sm">{values.full_name || '-'}</span>
            <span className="text-slate-500 block text-xs">Panggilan: "{values.preferred_name || '-'}" ({values.gender || '-'})</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px]">Usia & Tanggal Lahir:</span>
            <span className="font-semibold text-slate-900">{calculatedAge || '-'}</span>
            <span className="text-slate-500 block text-xs">{values.birth_place || '-'}, {values.birth_date || '-'}</span>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <span className="text-slate-400 block text-[11px]">Orang Tua / Wali:</span>
            <span className="font-semibold text-slate-900">{values.parent_name || '-'} ({values.relationship || '-'})</span>
            <span className="text-slate-500 block text-xs">WhatsApp: {values.whatsapp_number || '-'}</span>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <span className="text-slate-400 block text-[11px]">Kontak Darurat:</span>
            <span className="font-semibold text-slate-900">{values.emergency_contact_name || '-'}</span>
            <span className="text-slate-500 block text-xs">{values.emergency_contact_phone || '-'}</span>
          </div>
        </div>
      </div>

      {/* Privacy Notice Notice Box */}
      <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-200 text-xs text-sky-950 space-y-2">
        <div className="flex items-center gap-2 font-bold text-sky-900">
          <FileLock className="w-4 h-4 text-sky-600 shrink-0" />
          <span>Pernyataan Keamanan & Kerahasiaan Data (Privasi Medis/Pendidikan)</span>
        </div>
        <p className="leading-relaxed text-slate-600 text-xs">
          Little Star School Pamekasan berkomitmen penuh melindungi hak privasi anak dan keluarga. Seluruh data riwayat tumbuh kembang, sensori, maupun diagnosis dokter disimpan secara rahasia dan hanya dapat diakses oleh tim profesional observasi (psikolog, kepala sekolah, dan guru pendamping khusus terkait). Data ini tidak akan pernah dibagikan kepada pihak ketiga untuk kepentingan komersial.
        </p>
      </div>

      {/* Checkboxes for Legal & Informed Consent */}
      <div className="space-y-4 pt-2">
        
        {/* Consent 1: Observasi */}
        <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-amber-400 cursor-pointer bg-white transition-all">
          <input
            type="checkbox"
            {...register('consent_observation')}
            className="mt-0.5 w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
          />
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-800 block">
              Persetujuan Pelaksanaan Observasi Ramah Anak <span className="text-rose-500">*</span>
            </span>
            <span className="text-xs text-slate-500 leading-relaxed block">
              Saya menyetujui anak saya mengikuti sesi observasi tumbuh kembang berbasis bermain di Little Star School Pamekasan dengan pendampingan tim ahli.
            </span>
            {errors.consent_observation && (
              <p className="text-xs text-rose-500 font-medium pt-1">{errors.consent_observation.message}</p>
            )}
          </div>
        </label>

        {/* Consent 2: Kebijakan Privasi */}
        <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-amber-400 cursor-pointer bg-white transition-all">
          <input
            type="checkbox"
            {...register('consent_privacy_policy')}
            className="mt-0.5 w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
          />
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-800 block">
              Persetujuan Kebijakan Privasi Data Siswa <span className="text-rose-500">*</span>
            </span>
            <span className="text-xs text-slate-500 leading-relaxed block">
              Saya memahami bahwa informasi yang saya berikan akan disimpan secara aman dan digunakan semata-mata untuk perancangan dukungan belajar anak.
            </span>
            {errors.consent_privacy_policy && (
              <p className="text-xs text-rose-500 font-medium pt-1">{errors.consent_privacy_policy.message}</p>
            )}
          </div>
        </label>

        {/* Consent 3: Kebenaran Data */}
        <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-amber-400 cursor-pointer bg-white transition-all">
          <input
            type="checkbox"
            {...register('data_accuracy_confirmed')}
            className="mt-0.5 w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
          />
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-800 block">
              Pernyataan Kebenaran Data <span className="text-rose-500">*</span>
            </span>
            <span className="text-xs text-slate-500 leading-relaxed block">
              Saya menyatakan dengan sesungguhnya bahwa seluruh informasi riwayat anak yang saya berikan dalam formulir ini adalah benar dan dapat dipertanggungjawabkan.
            </span>
            {errors.data_accuracy_confirmed && (
              <p className="text-xs text-rose-500 font-medium pt-1">{errors.data_accuracy_confirmed.message}</p>
            )}
          </div>
        </label>

      </div>

    </div>
  );
};

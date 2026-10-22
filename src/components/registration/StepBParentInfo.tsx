import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FullRegistrationFormData } from '../../types/registration';
import { Users, Phone, MessageSquare, Mail, AlertCircle, Copy } from 'lucide-react';

interface StepBParentInfoProps {
  form: UseFormReturn<FullRegistrationFormData, any, any>;
}

export const StepBParentInfo: React.FC<StepBParentInfoProps> = ({ form }) => {
  const { register, watch, setValue, formState: { errors } } = form;
  const phoneNumber = watch('phone_number');

  const copyPhoneToWhatsApp = () => {
    if (phoneNumber) {
      setValue('whatsapp_number', phoneNumber, { shouldValidate: true });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Step Header */}
      <div className="border-b border-slate-100 pb-4">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-amber-500" />
          <span>Tahap B: Data Orang Tua / Wali</span>
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Informasi kontak orang tua atau wali resmi untuk koordinasi jadwal dan hasil observasi.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Nama Lengkap Orang Tua/Wali */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="block text-xs font-bold text-slate-700">
            Nama Lengkap Orang Tua / Wali <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Contoh: Budi Santoso, S.T."
            {...register('parent_name')}
            className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition-all ${
              errors.parent_name ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 bg-white'
            }`}
          />
          {errors.parent_name && (
            <p className="text-xs text-rose-500 font-medium">{errors.parent_name.message}</p>
          )}
        </div>

        {/* Hubungan dengan Anak */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            Hubungan dengan Anak <span className="text-rose-500">*</span>
          </label>
          <select
            {...register('relationship')}
            className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition-all ${
              errors.relationship ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 bg-white'
            }`}
          >
            <option value="Ibu">Ibu Kandung</option>
            <option value="Ayah">Ayah Kandung</option>
            <option value="Wali">Wali Resmi</option>
            <option value="Kakek/Nenek">Kakek / Nenek</option>
            <option value="Lainnya">Keluarga Lainnya</option>
          </select>
          {errors.relationship && (
            <p className="text-xs text-rose-500 font-medium">{errors.relationship.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            Alamat Email (Opsional)
          </label>
          <input
            type="email"
            placeholder="nama@email.com"
            {...register('email')}
            className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition-all ${
              errors.email ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 bg-white'
            }`}
          />
          {errors.email && (
            <p className="text-xs text-rose-500 font-medium">{errors.email.message}</p>
          )}
        </div>

        {/* Nomor Telepon */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            Nomor Telepon Seluler <span className="text-rose-500">*</span>
          </label>
          <input
            type="tel"
            placeholder="Contoh: 081234567890"
            {...register('phone_number')}
            className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition-all ${
              errors.phone_number ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 bg-white'
            }`}
          />
          {errors.phone_number && (
            <p className="text-xs text-rose-500 font-medium">{errors.phone_number.message}</p>
          )}
        </div>

        {/* Nomor WhatsApp */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-700">
              Nomor WhatsApp Aktif <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              onClick={copyPhoneToWhatsApp}
              className="text-[11px] text-amber-600 hover:text-amber-700 font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <Copy className="w-3 h-3" />
              <span>Samakan dengan Nomor Telp</span>
            </button>
          </div>
          <input
            type="tel"
            placeholder="Contoh: 081234567890"
            {...register('whatsapp_number')}
            className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition-all ${
              errors.whatsapp_number ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 bg-white'
            }`}
          />
          {errors.whatsapp_number && (
            <p className="text-xs text-rose-500 font-medium">{errors.whatsapp_number.message}</p>
          )}
          <span className="text-[11px] text-slate-400">Jadwal observasi dan konfirmasi akan dikirim melalui WhatsApp ini.</span>
        </div>

        {/* Emergency Contact Section */}
        <div className="md:col-span-2 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Kontak Darurat Tambahan (Wajib Diisi)
            </h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-amber-50/40 p-4 rounded-2xl border border-amber-100">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Nama Kontak Darurat <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Siti Rahmawati (Ibu/Tante)"
                {...register('emergency_contact_name')}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition-all ${
                  errors.emergency_contact_name ? 'border-rose-400 bg-white' : 'border-slate-200 bg-white'
                }`}
              />
              {errors.emergency_contact_name && (
                <p className="text-xs text-rose-500 font-medium">{errors.emergency_contact_name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Nomor Telepon Kontak Darurat <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                placeholder="Contoh: 081234567802"
                {...register('emergency_contact_phone')}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition-all ${
                  errors.emergency_contact_phone ? 'border-rose-400 bg-white' : 'border-slate-200 bg-white'
                }`}
              />
              {errors.emergency_contact_phone && (
                <p className="text-xs text-rose-500 font-medium">{errors.emergency_contact_phone.message}</p>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  fullRegistrationSchema, 
  FullRegistrationFormData,
  childInfoSchema,
  parentInfoSchema,
  developmentalSchema,
  consentSchema
} from '../../types/registration';
import { StepAChildInfo } from './StepAChildInfo';
import { StepBParentInfo } from './StepBParentInfo';
import { StepCDevelopmental } from './StepCDevelopmental';
import { StepDConsent } from './StepDConsent';
import { repository } from '../../lib/repository';
import { Registration } from '../../types/database';
import { ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { StarLogo } from '../common/StarLogo';

interface RegistrationWizardProps {
  onSuccess: (registration: Registration) => void;
  onCancel: () => void;
}

const STEPS = [
  { id: 'A', title: 'Data Anak', subtitle: 'Identitas & Usia' },
  { id: 'B', title: 'Orang Tua / Wali', subtitle: 'Kontak & WhatsApp' },
  { id: 'C', title: 'Riwayat Perkembangan', subtitle: 'Profil Sensori & Minat' },
  { id: 'D', title: 'Persetujuan & Kirim', subtitle: 'Verifikasi & Privasi' },
];

export const RegistrationWizard: React.FC<RegistrationWizardProps> = ({ onSuccess, onCancel }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<FullRegistrationFormData>({
    resolver: zodResolver(fullRegistrationSchema) as any,
    mode: 'onTouched',
    defaultValues: {
      full_name: '',
      preferred_name: '',
      birth_place: '',
      birth_date: '',
      gender: 'Laki-laki',
      address: '',
      previous_education: '',
      parent_name: '',
      relationship: 'Ibu',
      phone_number: '',
      whatsapp_number: '',
      email: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      strengths_and_interests: '',
      communication_method: ['Kata tunggal / frasa pendek'],
      eating_skill: 'Bantuan Sebagian',
      toileting_skill: 'Perlu Diingatkan',
      dressing_skill: 'Bantuan Sebagian',
      daily_living_notes: '',
      social_interaction: '',
      sensory_preferences: ['Sensitif terhadap suara bising / keramaian'],
      previous_therapy_support: ['Belum Pernah Terapi'],
      developmental_history: '',
      parent_concerns_expectations: '',
      has_professional_assessment: false,
      professional_assessment_details: '',
      consent_observation: true,
      consent_privacy_policy: true,
      data_accuracy_confirmed: true,
    },
  });

  const { trigger, getValues } = form;

  // Validate only the current step before advancing
  const handleNextStep = async () => {
    setSubmitError(null);
    let isValid = false;

    if (currentStepIndex === 0) {
      isValid = await trigger(['full_name', 'preferred_name', 'birth_place', 'birth_date', 'gender', 'address']);
    } else if (currentStepIndex === 1) {
      isValid = await trigger(['parent_name', 'relationship', 'phone_number', 'whatsapp_number', 'emergency_contact_name', 'emergency_contact_phone']);
    } else if (currentStepIndex === 2) {
      isValid = await trigger(['strengths_and_interests', 'communication_method', 'social_interaction', 'previous_therapy_support', 'developmental_history', 'parent_concerns_expectations']);
    } else {
      isValid = true;
    }

    if (isValid) {
      setCurrentStepIndex((prev) => Math.min(prev + 1, STEPS.length - 1));
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setSubmitError(null);
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  // Final submission handler
  const handleFinalSubmit = async (data: FullRegistrationFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const newRegistration = await repository.submitNewRegistration({
        student: {
          full_name: data.full_name,
          preferred_name: data.preferred_name,
          birth_place: data.birth_place,
          birth_date: data.birth_date,
          gender: data.gender,
          address: data.address,
          previous_education: data.previous_education || undefined,
        },
        guardian: {
          full_name: data.parent_name,
          relationship: data.relationship,
          phone_number: data.phone_number,
          whatsapp_number: data.whatsapp_number,
          email: data.email || undefined,
          emergency_contact_name: data.emergency_contact_name,
          emergency_contact_phone: data.emergency_contact_phone,
        },
        developmental: {
          strengths_and_interests: data.strengths_and_interests,
          communication_method: data.communication_method,
          daily_living_skills: {
            eating: data.eating_skill,
            toileting: data.toileting_skill,
            dressing: data.dressing_skill,
            notes: data.daily_living_notes,
          },
          social_interaction: data.social_interaction,
          sensory_preferences: data.sensory_preferences,
          previous_therapy_support: data.previous_therapy_support,
          developmental_history: data.developmental_history,
          parent_concerns_expectations: data.parent_concerns_expectations,
          has_professional_assessment: data.has_professional_assessment,
          professional_assessment_details: data.professional_assessment_details,
        },
        consent: {
          consent_observation: data.consent_observation,
          consent_privacy_policy: data.consent_privacy_policy,
          data_accuracy_confirmed: data.data_accuracy_confirmed,
        },
      });

      setIsSubmitting(false);
      onSuccess(newRegistration);
    } catch (err: any) {
      setIsSubmitting(false);
      setSubmitError(err?.message || 'Terjadi kendala saat menyimpan pendaftaran. Silakan periksa koneksi atau coba lagi.');
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      
      {/* Top Breadcrumb & Cancel button */}
      <div className="flex items-center justify-between mb-8">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </button>

        <div className="flex items-center gap-2">
          <StarLogo size={24} />
          <span className="text-xs font-bold text-slate-800">Pendaftaran Observasi Siswa Baru</span>
        </div>
      </div>

      {/* Multi-Step Indicator Bar */}
      <div className="mb-10 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {STEPS.map((s, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;

            return (
              <div
                key={s.id}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  isCurrent
                    ? 'border-amber-400 bg-amber-50/70 shadow-xs'
                    : isCompleted
                    ? 'border-emerald-200 bg-emerald-50/40'
                    : 'border-slate-100 bg-slate-50/50 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isCompleted ? '✓' : s.id}
                  </span>
                  <span className="font-bold text-xs text-slate-900 truncate">
                    {s.title}
                  </span>
                </div>
                <div className="hidden sm:block text-[10px] text-slate-500 mt-1 pl-8 truncate">
                  {s.subtitle}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Progress track */}
        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
          <div
            className="bg-amber-500 h-full transition-all duration-300 rounded-full"
            style={{ width: `${((currentStepIndex + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Wizard Form Container */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 md:p-10 shadow-xs">
        
        {submitError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Gagal Menyimpan Data:</span> {submitError}
            </div>
          </div>
        )}

        <form onSubmit={form.handleSubmit(handleFinalSubmit as any)}>
          
          {/* Step Views */}
          {currentStepIndex === 0 && <StepAChildInfo form={form} />}
          {currentStepIndex === 1 && <StepBParentInfo form={form} />}
          {currentStepIndex === 2 && <StepCDevelopmental form={form} />}
          {currentStepIndex === 3 && <StepDConsent form={form} isSubmitting={isSubmitting} />}

          {/* Action Navigation Buttons */}
          <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
            
            {currentStepIndex > 0 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Tahap Sebelumnya</span>
              </button>
            ) : (
              <div />
            )}

            {currentStepIndex < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <span>Lanjutkan ke Tahap {STEPS[currentStepIndex + 1].id}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-md shadow-emerald-200 flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan ke Basis Data...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Kirim Pendaftaran Observasi</span>
                  </>
                )}
              </button>
            )}

          </div>

        </form>

      </div>

    </div>
  );
};

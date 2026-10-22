import { z } from 'zod';

export const GENDERS = ['Laki-laki', 'Perempuan'] as const;
export const RELATIONSHIPS = ['Ayah', 'Ibu', 'Wali', 'Kakek/Nenek', 'Lainnya'] as const;
export const LIVING_SKILLS = ['Mandiri', 'Bantuan Sebagian', 'Bantuan Penuh'] as const;
export const TOILETING_SKILLS = ['Mandiri', 'Perlu Diingatkan', 'Memakai Popok/Bantuan Penuh'] as const;

export const childInfoSchema = z.object({
  full_name: z.string().min(2, 'Nama lengkap minimal 2 karakter').max(100, 'Maksimal 100 karakter'),
  preferred_name: z.string().min(1, 'Nama panggilan wajib diisi').max(30, 'Maksimal 30 karakter'),
  birth_place: z.string().min(2, 'Tempat lahir wajib diisi'),
  birth_date: z.string().refine((val) => {
    if (!val) return false;
    const date = new Date(val);
    const now = new Date();
    return date < now && date > new Date('2000-01-01');
  }, { message: 'Tanggal lahir tidak valid' }),
  gender: z.enum(GENDERS),
  address: z.string().min(5, 'Alamat domisili lengkap wajib diisi minimal 5 karakter'),
  previous_education: z.string().optional(),
});

export const parentInfoSchema = z.object({
  parent_name: z.string().min(2, 'Nama orang tua/wali minimal 2 karakter'),
  relationship: z.enum(RELATIONSHIPS),
  phone_number: z.string().min(8, 'Nomor telepon minimal 8 digit').regex(/^[0-9+ -]+$/, 'Format nomor tidak valid'),
  whatsapp_number: z.string().min(8, 'Nomor WhatsApp minimal 8 digit').regex(/^[0-9+ -]+$/, 'Format nomor tidak valid'),
  email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
  emergency_contact_name: z.string().min(2, 'Nama kontak darurat wajib diisi'),
  emergency_contact_phone: z.string().min(8, 'Nomor kontak darurat minimal 8 digit').regex(/^[0-9+ -]+$/, 'Format nomor tidak valid'),
});

export const developmentalSchema = z.object({
  strengths_and_interests: z.string().min(3, 'Tuliskan minat atau hal yang disukai anak'),
  communication_method: z.array(z.string()).min(1, 'Pilih minimal satu metode komunikasi'),
  eating_skill: z.enum(LIVING_SKILLS),
  toileting_skill: z.enum(TOILETING_SKILLS),
  dressing_skill: z.enum(LIVING_SKILLS),
  daily_living_notes: z.string().optional(),
  social_interaction: z.string().min(3, 'Deskripsikan interaksi sosial & respon emosi anak'),
  sensory_preferences: z.array(z.string()),
  previous_therapy_support: z.array(z.string()).min(1, 'Pilih riwayat terapi atau pilih Belum Pernah'),
  developmental_history: z.string().min(5, 'Mohon ceritakan riwayat tumbuh kembang secara singkat'),
  parent_concerns_expectations: z.string().min(5, 'Tuliskan harapan atau kekhawatiran utama'),
  has_professional_assessment: z.boolean().default(false),
  professional_assessment_details: z.string().optional(),
});

export const consentSchema = z.object({
  consent_observation: z.boolean().refine((val) => val === true, {
    message: 'Anda harus menyetujui proses observasi',
  }),
  consent_privacy_policy: z.boolean().refine((val) => val === true, {
    message: 'Anda harus menyetujui kebijakan privasi data',
  }),
  data_accuracy_confirmed: z.boolean().refine((val) => val === true, {
    message: 'Konfirmasi bahwa seluruh data yang diisi adalah benar',
  }),
});

export const fullRegistrationSchema = z.object({
  ...childInfoSchema.shape,
  ...parentInfoSchema.shape,
  ...developmentalSchema.shape,
  ...consentSchema.shape,
});

export type ChildInfoFormData = z.infer<typeof childInfoSchema>;
export type ParentInfoFormData = z.infer<typeof parentInfoSchema>;
export type DevelopmentalFormData = z.infer<typeof developmentalSchema>;
export type ConsentFormData = z.infer<typeof consentSchema>;
export type FullRegistrationFormData = z.infer<typeof fullRegistrationSchema>;

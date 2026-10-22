import { SchoolSettings } from '../types/database';

export const DEFAULT_SCHOOL_SETTINGS: SchoolSettings = {
  id: 'settings-default-01',
  school_name: 'Little Star School Pamekasan',
  tagline: 'Setiap Anak Istimewa, Setiap Potensi Berharga',
  address: 'Perum Royal Pademawu, Blok B No.18 - 19, Dasok - Pademawu - Pamekasan',
  phone: '082199988769',
  whatsapp_number: '082199988769',
  email: 'littlestar91116@gmail.com',
  logo_url: '/assets/aistudio/Logo_Little_Star_Learning_-_full_color_e3de3950.png',
  accreditation: 'Terakreditasi B / Layanan Khusus Terdaftar',
  vision: 'Menjadi pusat pendidikan khusus dan tumbuh kembang terdepan yang hangat, adaptif, dan memberdayakan setiap anak dengan kebutuhan khusus agar mandiri, percaya diri, dan berkembang sesuai potensi uniknya.',
  mission: [
    'Menyelenggarakan asesmen dan observasi perkembangan holistik berbasis bermain yang ramah anak dan tanpa tekanan.',
    'Menyusun Program Pembelajaran Individual (PPI) yang berpusat pada kekuatan, gaya belajar, dan kebutuhan sensori setiap murid.',
    'Menjalin kemitraan erat dengan orang tua dan tenaga profesional (psikolog, terapis wicara, okupasi, dan dokter tumbuh kembang).',
    'Menyediakan lingkungan belajar yang inklusif, aman, sensori-adaptif, dan menumbuhkan rasa percaya diri anak.'
  ],
  observation_guidelines: 'Observasi dilaksanakan dalam durasi 60-90 menit dengan pendekatan ramah anak (child-led play). Orang tua diperkenankan mendampingi di ruang tunggu atau area yang telah disepakati.',
  faq_list: [
    {
      question: 'Apa itu proses observasi di Little Star School Pamekasan?',
      answer: 'Observasi adalah sesi pengenalan awal yang dirancang hangat dan menyenangkan tanpa intimidasi tes akademis. Tim kami mengamati cara anak berkomunikasi, merespons sensori, berinteraksi sosial, dan kemandirian dasar untuk memahami profil tumbuh kembangnya.'
    },
    {
      question: 'Berapa usia anak yang dapat mendaftar observasi?',
      answer: 'Kami melayani anak usia dini hingga jenjang sekolah dasar (rentang 2 hingga 12 tahun) dengan berbagai spektrum kebutuhan khusus, seperti keterlambatan bicara (speech delay), autisme (ASD), ADHD, down syndrome, dan kesulitan belajar.'
    },
    {
      question: 'Apakah orang tua perlu mendampingi selama sesi observasi?',
      answer: 'Ya, orang tua wajib hadir. Sesi observasi juga mencakup wawancara mendalam dengan orang tua mengenai kebiasaan harian, preferensi sensori, dan harapan orang tua terhadap tumbuh kembang anak.'
    },
    {
      question: 'Apa langkah selanjutnya setelah observasi selesai?',
      answer: 'Dalam 3-5 hari kerja setelah observasi, tim kami akan menjadwalkan sesi konsultasi hasil observasi untuk memaparkan rekomendasi program, baik berupa kelas transisi, kelas individual, intervensi sensori, maupun kolaborasi terapi.'
    },
    {
      question: 'Bagaimana jika anak belum pernah memiliki diagnosis medis?',
      answer: 'Tidak masalah. Sesi observasi kami terbuka untuk anak yang sudah maupun belum memiliki diagnosis dokter/psikolog. Jika diperlukan asesmen lanjutan, tim kami akan memberikan rujukan yang tepat.'
    }
  ],
  updated_at: new Date().toISOString(),
};

export const TIME_SLOTS = [
  '08:30 - 10:00 WIB',
  '10:30 - 12:00 WIB',
  '13:00 - 14:30 WIB',
  '15:00 - 16:30 WIB',
];

export const OBSERVATION_ROOMS = [
  'Ruang Sensori & Gerak',
  'Ruang Bermain Eksplorasi A',
  'Ruang Interaksi Edukatif B',
];

export const AVAILABLE_OBSERVERS = [
  { id: 'obs-01', name: 'Rina Kusumawati, S.Psi., M.Psi., Psikolog', role: 'Psikolog Perkembangan Anak' },
  { id: 'obs-02', name: 'Ahmad Fauzi, S.Pd., Gr.', role: 'Spesialis Pendidikan Khusus' },
  { id: 'obs-03', name: 'Dewi Anggraini, A.Md.OT', role: 'Terapis Okupasi & Sensori Integrasi' },
];

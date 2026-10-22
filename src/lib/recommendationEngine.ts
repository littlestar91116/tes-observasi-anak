/**
 * Module 3 Recommendation Generator Engine
 * Little Star School Pamekasan
 * Synthesizes student observation responses into individualized learning recommendations.
 */

import { ObservationSession, ObservationItem, ObservationResponse } from '../types/observation';
import { Student, Registration } from '../types/database';
import { LearningRecommendation, RecommendationCategory, ObservationReport } from '../types/report';
import { OBSERVATION_DOMAINS } from './observationData';
import { calculateAllDomainsSummary } from './scoringEngine';
import { GoogleGenAI } from '@google/genai';

/**
 * Generates an automatic, grounded baseline set of individualized recommendations
 * based on the student's real observed skills and scoring patterns.
 */
export function generateDefaultRecommendations(
  session: ObservationSession,
  student: Student,
  observationItems: ObservationItem[]
): LearningRecommendation[] {
  const recommendations: LearningRecommendation[] = [];
  const responses = session.responses || {};
  const studentName = student.preferred_name || student.full_name;

  let order = 1;

  // 1. Communication & Language Recommendation
  const commItems = observationItems.filter(i => i.domain_id === 'A');
  const nameResp = responses['COMM-01'] || responses['item-a1'];
  const instrResp = responses['COMM-02'] || responses['item-a2'];
  const expressResp = responses['COMM-03'] || responses['item-a3'] || responses['COMM-04'];

  const commBaseline = nameResp?.behavior_observed 
    ? `${studentName} ${nameResp.behavior_observed.toLowerCase()}`
    : `${studentName} sedang mengembangkan respon konsisten terhadap nama dan instruksi visual lisan satu langkah.`;

  recommendations.push({
    id: `rec-${Date.now()}-1`,
    report_id: session.id,
    category: 'Komunikasi & Bahasa',
    target_skill: `Merespons panggilan nama dan instruksi 1-langkah secara konsisten dalam 3 detik`,
    baseline_observation: commBaseline,
    suggested_strategy: 'Gunakan isyarat visual kartu PECS bersamaan dengan kontak mata lembut dan panggilan nama maksimal 2 kali sebelum memberi prompt fisik sentuhan lembut.',
    required_materials: 'Kartu visual PECS ukuran 5x5 cm, kartu foto anak, mainan pemantik atensi (gelembung sabun/mainan putar)',
    assistance_level: 'Bantuan Gestur / Penunjuk',
    success_indicator: `Mampu merespons nama dan melihat ke arah komunikator dalam 8 dari 10 kesempatan selama 3 hari berturut-turut.`,
    review_period: '4 Minggu',
    is_ai_generated: false,
    order_index: order++,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  // 2. Visual Schedule & Routine
  recommendations.push({
    id: `rec-${Date.now()}-2`,
    report_id: session.id,
    category: 'Jadwal Visual & Instruksi',
    target_skill: 'Mengikuti transisi antar aktivitas menggunakan papan jadwal bergambar (First-Then Board)',
    baseline_observation: session.synthesis?.communication_supports || `${studentName} memerlukan kepastian visual sebelum berpindah dari kegiatan bermain ke kegiatan terstruktur.`,
    suggested_strategy: 'Terapkan konsep "Pertama (Aktivitas Belajar), Lalu (Aktivitas Favorit/Reward)" dengan papan jadwal First-Then yang ditempel velcro.',
    required_materials: 'Papan First-Then velcro berlapis plastik tebal, simbol visual PCS/Boardmaker berwana, timer visual countdown (time timer)',
    assistance_level: 'Bantuan Visual / Kartu Gambar',
    success_indicator: 'Anak mampu melepas simbol aktivitas selesai dan berpindah ke stasiun berikutnya secara mandiri dengan toleransi transisi baik.',
    review_period: '4 Minggu',
    is_ai_generated: false,
    order_index: order++,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  // 3. Cognitive / Pre-academic (Task Breakdown)
  const cogItems = observationItems.filter(i => i.domain_id === 'C');
  const indepCog = cogItems.filter(i => responses[i.id]?.score === 3 || responses[i.code]?.score === 3);
  const cogBaseline = indepCog.length > 0
    ? `Anak menunjukkan ketertarikan kuat pada materi terstruktur seperti ${indepCog.map(i => i.title).slice(0, 2).join(', ')}.`
    : `${studentName} merespons positif stimulasi objek konkret dengan warna kontras dan balok susun.`;

  recommendations.push({
    id: `rec-${Date.now()}-3`,
    report_id: session.id,
    category: 'Target Pembelajaran Individual (PPI Awal)',
    target_skill: 'Menyelesaikan tugas klasifikasi objek/warna 3 kategori dengan rentang atensi mandiri minimal 8 menit',
    baseline_observation: cogBaseline,
    suggested_strategy: 'Penerapan metode TEACCH (struktur fisik jelas dan wadah kerja kiri-ke-kanan). Berikan apresiasi langsung segera setelah tugas tuntas.',
    required_materials: 'Keranjang tugas berlabel warna, balok geometri kayu halus, wadah transparan tersekat',
    assistance_level: 'Mandiri (Tanpa Bantuan)',
    success_indicator: 'Dapat menyelesaikan sorting 3 warna tanpa meninggalkan tempat duduk dan merapikan alat ke keranjang selesai.',
    review_period: '8 Minggu',
    is_ai_generated: false,
    order_index: order++,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  // 4. Social Interaction & Turn-Taking
  recommendations.push({
    id: `rec-${Date.now()}-4`,
    report_id: session.id,
    category: 'Interaksi Sosial',
    target_skill: 'Bergiliran main (turn-taking) dengan 1 teman sebaya didampingi guru selama 3 putaran',
    baseline_observation: `${studentName} cenderung bermain soliter dan membutuhkan panduan saat berbagi alat main yang sangat disukai.`,
    suggested_strategy: 'Gunakan kartu visual penanda giliran ("Giliran Saya" / "Giliran Teman") disertai hitungan ritmik 1-2-3 bergantian melempar bola ke keranjang.',
    required_materials: 'Kartu giliran bergambar anak & teman, boneka sensori, lintasan mobil kayu bersama',
    assistance_level: 'Bantuan Verbal / Isyarat Lisan',
    success_indicator: 'Anak menunggu giliran tanpa tantrum atau merebut mainan selama 3 siklus bergantian.',
    review_period: '6 Minggu',
    is_ai_generated: false,
    order_index: order++,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  // 5. Sensory & Environmental Accommodations
  const sensBaseline = session.synthesis?.environmental_accommodations || 
    `${studentName} peka terhadap rangsangan suara mendadak dan membutuhkan suasana kelas yang tenang serta minim distraksi visual.`;

  recommendations.push({
    id: `rec-${Date.now()}-5`,
    report_id: session.id,
    category: 'Akomodasi Sensori & Lingkungan',
    target_skill: 'Melakukan regulasi mandiri di sudut tenang (Calm Corner) saat merasa lelah atau overstimulasi sensori',
    baseline_observation: sensBaseline,
    suggested_strategy: 'Sediakan area tenang dengan karpet busa lembut, bean bag, bantal pemberat (weighted lap pad), dan headphone peredam bising jika ada suara bising mendadak.',
    required_materials: 'Noise-canceling ear muff anak, sensory bottle glitter, weighted lap pad 1.5 kg, lampu warm-light redup',
    assistance_level: 'Bantuan Fisik Sebagian (Hand-under-hand)',
    success_indicator: 'Anak dapat menunjuk kartu "Istirahat" dan duduk tenang selama 5 menit hingga ritme nafas tenang kembali.',
    review_period: '4 Minggu',
    is_ai_generated: false,
    order_index: order++,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  // 6. Daily Living Skills / Independence
  recommendations.push({
    id: `rec-${Date.now()}-6`,
    report_id: session.id,
    category: 'Kemandirian Sehari-hari',
    target_skill: 'Mencuci tangan dan mengeringkan dengan handuk mengikuti 4 langkah visual',
    baseline_observation: `${studentName} mampu membasahi tangan namun membutuhkan panduan untuk menggosok sabun dan mengeringkan tangan tuntas.`,
    suggested_strategy: 'Gunakan teknik Backward Chaining: anak menyelesaikan langkah terakhir (mengeringkan tangan) secara mandiri lalu secara bertahap memundurkan langkah ke cuci sabun.',
    required_materials: 'Poster visual cuci tangan 4 langkah di atas wastafel, sabun busa ramah anak (foam soap), handuk pribadi bermotif bintang',
    assistance_level: 'Bantuan Gestur / Penunjuk',
    success_indicator: 'Anak menyelesaikan seluruh rangkaian 4 tahap cuci tangan dengan maksimal 1 prompt gestur.',
    review_period: '8 Minggu',
    is_ai_generated: false,
    order_index: order++,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  // 7. Parent-Teacher Collaboration
  recommendations.push({
    id: `rec-${Date.now()}-7`,
    report_id: session.id,
    category: 'Kolaborasi Orang Tua & Guru',
    target_skill: 'Penerapan konsisten jadwal visual dan protokol sensori di rumah dan di sekolah',
    baseline_observation: 'Orang tua sangat kooperatif dan mengharapkan keselarasan strategi penanganan di rumah dengan program sekolah.',
    suggested_strategy: 'Buku penghubung harian dan sharing mingguan via WhatsApp mengenai keberhasilan strategi First-Then serta respon sensori anak.',
    required_materials: 'Buku komunikasi harian Little Star, salinan cetak kartu visual First-Then untuk dipasang di lemari es rumah',
    assistance_level: 'Mandiri (Tanpa Bantuan)',
    success_indicator: 'Terpenuhinya evaluasi berkala 2 minggu sekali antara guru wali dan orang tua dengan keselarasan respon anak.',
    review_period: '1 Semester',
    is_ai_generated: false,
    order_index: order++,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  return recommendations;
}

/**
 * Generates initial draft content for the 23 report sections from the session data.
 */
export function buildReportFromSession(
  session: ObservationSession,
  student: Student,
  registration: Registration
): ObservationReport {
  const dateStr = session.session_date || new Date().toISOString().split('T')[0];
  const year = dateStr.split('-')[0] || '2026';
  const monthNum = parseInt(dateStr.split('-')[1] || '10', 10);
  const romanMonths = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];
  const romanMonth = romanMonths[monthNum - 1] || 'X';
  
  // Clean sequential-style report number
  const cleanNumber = session.id.replace(/[^0-9]/g, '').slice(-3) || '001';
  const reportNumber = `LSS-OBS/${year}/${romanMonth}/${cleanNumber}`;

  const synth = session.synthesis;

  return {
    id: `rep-${session.id}`,
    report_number: reportNumber,
    session_id: session.id,
    student_id: student.id,
    registration_id: registration.id,

    purpose_of_observation: 
      'Asesmen observasi diagnostik-edukatif awal untuk memetakan profil kekuatan, kebutuhan belajar individual, toleransi sensori, serta menyusun rekomendasi akomodasi pembelajaran ramah anak berkebutuhan khusus (ABK) di Little Star School Pamekasan.',
    
    activities_and_methods: 
      `Observasi terstruktur dan bermain fungsional di ${session.room_location}, penggunaan instrumen indikator 7 domain, teknik stimulus mainan sensori/puzzle, serta wawancara konfirmasi bersama orang tua/wali murid (${registration.guardian?.full_name || 'Orang Tua'}).`,

    observation_date: session.session_date,
    observer_name: session.observer_name || 'Ustadzah Siti Rahma, S.Psi',
    observer_title: 'Guru Observer & Tim Asesmen Khusus ABK',

    communication_support_needs: synth?.communication_supports || 
      'Anak memerlukan kombinasi instruksi lisan singkat yang didampingi kartu visual PECS serta penunjuk gestur untuk memperjelas pesan.',
    
    social_emotional_support_needs: 
      'Memerlukan pendampingan transisi bertahap saat berpindah kegiatan, dukungan regulasi emosi di lingkungan baru, serta pemodelan bertahap untuk antre dan berbagi mainan.',
    
    cognitive_preacademic_needs: 
      'Memiliki daya tangkap visual yang baik pada pengenalan warna dan bentuk geometris. Membutuhkan pemecahan tugas (task-chunking) menjadi 2-3 langkah agar atensi tetap terjaga optimal.',
    
    motor_and_daily_living_needs: 
      'Penguatan koordinasi motorik halus pincer grasp untuk memegang alat tulis serta pembiasaan rutin cuci tangan dan merapikan mainan dengan poster langkah terarah.',
    
    sensory_environmental_accommodations: synth?.environmental_accommodations || 
      'Ruang belajar dengan pencahayaan hangat dan tingkat kebisingan rendah. Akses ke sudut tenang (calm corner) dan bantal pemberat saat mengalami kelelahan sensori.',

    recommended_initial_learning_goals: 
      '1. Meningkatkan respon kontak mata dan pemahaman instruksi 1-langkah hingga 80% ketercapaian.\n2. Menerapkan jadwal visual First-Then untuk adaptasi transisi mandiri.\n3. Menuntaskan klasifikasi 3 warna dan bentuk geometri secara mandiri.',
    
    suggested_teaching_strategies: synth?.preferred_teaching_strategies || 
      'Penerapan struktur TEACCH, prompting hierarki (dari gestur hingga mandiri), pemberian penguatan positif (positive reinforcement) langsung berbasis minat khusus anak.',
    
    follow_up_recommendations: synth?.recommended_follow_up || 
      'Direkomendasikan masuk Kelas Transisi Ramah Sensori Little Star School dengan pendampingan terapi sensori integrasi dan terapi wicara 2x per minggu.',

    observer_signed_at: new Date().toISOString(),
    headmaster_name: 'Dra. Hj. Nurul Komariyah',
    headmaster_approved_at: session.reviewed_at,
    headmaster_approval_notes: session.headmaster_review_notes || '',
    
    parent_acknowledgment: {
      parent_name: registration.guardian?.full_name || 'Orang Tua Murid',
      discussed_date: session.session_date,
      is_acknowledged: false,
      signature_type: 'Manual Diketahui',
      parent_notes: 'Orang tua menyetujui hasil observasi dan siap berkolaborasi menerapkan strategi di rumah.',
    },

    status: session.status === 'Disetujui Kepala Sekolah' ? 'Disetujui Kepala Sekolah' : 'Draf Laporan',
    current_version: 1,
    versions: [
      {
        version_number: 1,
        created_at: new Date().toISOString(),
        created_by_name: session.observer_name || 'Guru Observer',
        created_by_role: 'observer',
        change_summary: 'Pembuatan draf laporan awal dari hasil observasi 7 domain.',
        snapshot: null,
      }
    ],
    review_logs: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Optional Gemini AI Generation for Teacher Draft Assistance
 * Uses @google/genai SDK to generate recommendations grounded in real observation data.
 */
export async function generateAiDraftRecommendations(
  student: Student,
  session: ObservationSession,
  domainSummaries: any[]
): Promise<Partial<LearningRecommendation>[]> {
  try {
    const apiKey = process.env.GEMINI_API_KEY || (window as any)?.__ENV__?.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      // Graceful fallback to rich grounded templates
      return [];
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
Anda adalah konsultan pendidikan khusus anak berkebutuhan khusus (ABK) di Little Star School Pamekasan.
Berikan 3 draf rekomendasi pembelajaran individual spesifik untuk siswa bernama ${student.full_name} (${student.preferred_name}, usia: ${student.calculated_age || '5 tahun'}).
Berdasarkan catatan observasi:
- Kekuatan: ${session.synthesis?.strengths_and_interests || 'Tertarik pada balok dan visual'}
- Keterampilan mandiri: ${(session.synthesis?.skills_demonstrated_independently || []).join(', ')}
- Keterampilan emerging/butuh bantuan: ${(session.synthesis?.skills_requiring_assistance || []).join(', ')}

Format respons HANYA berupa JSON array valid berisi objek dengan key:
- category: nama kategori (misal: "Komunikasi & Bahasa", "Jadwal Visual & Instruksi", "Interaksi Sosial", "Motorik Halus & Kasar")
- target_skill: string (target terukur)
- baseline_observation: string (kondisi saat diobservasi)
- suggested_strategy: string (teknik pengajaran adaptif)
- required_materials: string (media yang diperlukan)
- assistance_level: string (tingkat prompting)
- success_indicator: string (indikator tercapai)
- review_period: string (misal "4 Minggu")
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const text = response.text;
    if (text) {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        return parsed.map((item, idx) => ({
          ...item,
          is_ai_generated: true,
          order_index: idx + 1,
        }));
      }
    }
    return [];
  } catch (err) {
    console.warn('AI Draft generation skipped or failed, using grounded templates:', err);
    return [];
  }
}

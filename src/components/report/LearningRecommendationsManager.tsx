import React, { useState } from 'react';
import { LearningRecommendation, RecommendationCategory, ObservationReport } from '../../types/report';
import { Student, SchoolSettings } from '../../types/database';
import { PromptingLevel } from '../../types/observation';
import { repository } from '../../lib/repository';
import { 
  Sparkles, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  Save, 
  AlertCircle, 
  HelpCircle, 
  Info, 
  Clock, 
  Layers, 
  Target, 
  BookOpen, 
  Wrench, 
  Bot,
  UserCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { StarLogo } from '../common/StarLogo';
import { generateAiDraftRecommendations } from '../../lib/recommendationEngine';

interface LearningRecommendationsManagerProps {
  report: ObservationReport;
  student: Student;
  userRole: 'observer' | 'principal' | 'staff' | 'admin';
  isReadOnly?: boolean;
  onUpdated: (updatedRecs: LearningRecommendation[]) => void;
}

const CATEGORY_OPTIONS: RecommendationCategory[] = [
  'Komunikasi & Bahasa',
  'Jadwal Visual & Instruksi',
  'Pemecahan Tugas & Prompting',
  'Interaksi Sosial',
  'Motorik Halus & Kasar',
  'Kemandirian Sehari-hari',
  'Akomodasi Sensori & Lingkungan',
  'Media & Materi Belajar',
  'Target Pembelajaran Individual (PPI Awal)',
  'Kolaborasi Orang Tua & Guru',
  'Observasi Lanjutan'
];

const PROMPTING_OPTIONS: PromptingLevel[] = [
  'Mandiri (Tanpa Bantuan)',
  'Bantuan Verbal / Isyarat Lisan',
  'Bantuan Visual / Kartu Gambar',
  'Bantuan Gestur / Penunjuk',
  'Bantuan Fisik Sebagian (Hand-under-hand)',
  'Bantuan Fisik Penuh'
];

const REVIEW_PERIOD_OPTIONS = [
  '2 Minggu (Evaluasi Cepat)',
  '4 Minggu (1 Bulan)',
  '6 Minggu',
  '8 Minggu (2 Bulan)',
  '12 Minggu (Tengah Semester)',
  '1 Semester (6 Bulan)'
];

export const LearningRecommendationsManager: React.FC<LearningRecommendationsManagerProps> = ({
  report,
  student,
  userRole,
  isReadOnly = false,
  onUpdated,
}) => {
  const [recommendations, setRecommendations] = useState<LearningRecommendation[]>(() => 
    repository.getLearningRecommendations(report.id)
  );

  const [editingRec, setEditingRec] = useState<LearningRecommendation | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Form states
  const [formCategory, setFormCategory] = useState<RecommendationCategory>('Komunikasi & Bahasa');
  const [formTargetSkill, setFormTargetSkill] = useState('');
  const [formBaseline, setFormBaseline] = useState('');
  const [formStrategy, setFormStrategy] = useState('');
  const [formMaterials, setFormMaterials] = useState('');
  const [formAssistance, setFormAssistance] = useState<string>('Bantuan Visual / Kartu Gambar');
  const [formSuccessIndicator, setFormSuccessIndicator] = useState('');
  const [formReviewPeriod, setFormReviewPeriod] = useState('4 Minggu (1 Bulan)');

  const canEdit = !isReadOnly && (userRole === 'observer' || userRole === 'admin' || userRole === 'principal');

  const startCreate = () => {
    setEditingRec(null);
    setIsCreating(true);
    setFormCategory('Komunikasi & Bahasa');
    setFormTargetSkill('');
    setFormBaseline(`Berdasarkan hasil observasi awal terhadap ${student.preferred_name}...`);
    setFormStrategy('');
    setFormMaterials('');
    setFormAssistance('Bantuan Visual / Kartu Gambar');
    setFormSuccessIndicator('');
    setFormReviewPeriod('4 Minggu (1 Bulan)');
  };

  const startEdit = (rec: LearningRecommendation) => {
    setIsCreating(false);
    setEditingRec(rec);
    setFormCategory(rec.category);
    setFormTargetSkill(rec.target_skill);
    setFormBaseline(rec.baseline_observation);
    setFormStrategy(rec.suggested_strategy);
    setFormMaterials(rec.required_materials);
    setFormAssistance(rec.assistance_level);
    setFormSuccessIndicator(rec.success_indicator);
    setFormReviewPeriod(rec.review_period);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTargetSkill.trim() || !formStrategy.trim()) {
      alert('Keterampilan sasaran dan strategi pembelajaran wajib diisi.');
      return;
    }

    const now = new Date().toISOString();
    let updatedList: LearningRecommendation[];

    if (editingRec) {
      updatedList = recommendations.map(r => {
        if (r.id === editingRec.id) {
          return {
            ...r,
            category: formCategory,
            target_skill: formTargetSkill.trim(),
            baseline_observation: formBaseline.trim(),
            suggested_strategy: formStrategy.trim(),
            required_materials: formMaterials.trim() || 'Materi kelas standar',
            assistance_level: formAssistance,
            success_indicator: formSuccessIndicator.trim() || 'Ketercapaian 80% dalam 3 hari pengamatan',
            review_period: formReviewPeriod,
            is_ai_generated: false, // Once edited and approved by teacher, mark as finalized
            updated_at: now,
          };
        }
        return r;
      });
    } else {
      const newRec: LearningRecommendation = {
        id: `rec-${Date.now()}`,
        report_id: report.id,
        category: formCategory,
        target_skill: formTargetSkill.trim(),
        baseline_observation: formBaseline.trim(),
        suggested_strategy: formStrategy.trim(),
        required_materials: formMaterials.trim() || 'Materi kelas standar',
        assistance_level: formAssistance,
        success_indicator: formSuccessIndicator.trim() || 'Ketercapaian 80% dalam 3 hari pengamatan',
        review_period: formReviewPeriod,
        is_ai_generated: false,
        order_index: recommendations.length + 1,
        created_at: now,
        updated_at: now,
      };
      updatedList = [...recommendations, newRec];
    }

    repository.saveLearningRecommendations(report.id, updatedList);
    setRecommendations(updatedList);
    onUpdated(updatedList);
    setIsCreating(false);
    setEditingRec(null);
    setFeedback('Rekomendasi pembelajaran individual berhasil disimpan.');
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleDelete = (id: string, skill: string) => {
    if (confirm(`Hapus rekomendasi "${skill}"?`)) {
      const updated = recommendations.filter(r => r.id !== id);
      repository.saveLearningRecommendations(report.id, updated);
      setRecommendations(updated);
      onUpdated(updated);
      setFeedback('Rekomendasi berhasil dihapus.');
      setTimeout(() => setFeedback(null), 2500);
    }
  };

  const handleGenerateAiDrafts = async () => {
    const session = repository.getObservationSessionById(report.session_id);
    if (!session) return;

    setIsAiLoading(true);
    try {
      const drafts = await generateAiDraftRecommendations(student, session, []);
      if (drafts.length > 0) {
        const now = new Date().toISOString();
        const newRecs: LearningRecommendation[] = drafts.map((d, i) => ({
          id: `rec-ai-${Date.now()}-${i}`,
          report_id: report.id,
          category: (d.category as any) || 'Target Pembelajaran Individual (PPI Awal)',
          target_skill: d.target_skill || 'Peningkatan respon adaptif',
          baseline_observation: d.baseline_observation || 'Berdasarkan observasi 7 domain',
          suggested_strategy: d.suggested_strategy || 'Pendekatan visual berulang',
          required_materials: d.required_materials || 'Media visual dan sensori',
          assistance_level: d.assistance_level || 'Bantuan Visual / Kartu Gambar',
          success_indicator: d.success_indicator || '80% respon mandiri',
          review_period: d.review_period || '4 Minggu',
          is_ai_generated: true,
          order_index: recommendations.length + i + 1,
          created_at: now,
          updated_at: now,
        }));

        const merged = [...recommendations, ...newRecs];
        repository.saveLearningRecommendations(report.id, merged);
        setRecommendations(merged);
        onUpdated(merged);
        setFeedback(`Berhasil menambahkan ${newRecs.length} draf usulan AI. Harap telaah dan sesuaikan sebelum disahkan.`);
      } else {
        setFeedback('Draf rekomendasi terstruktur telah tersedia dari temuan observasi guru.');
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setIsAiLoading(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  return (
    <div className="space-y-5">
      
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
              FEATURE 2: REKOMENDASI PEMBELAJARAN INDIVIDUAL
            </span>
            <span className="text-xs text-slate-500">
              Total {recommendations.length} Rekomendasi Terdaftar
            </span>
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 mt-1">
            Matriks Sasaran Belajar & Intervensi Adaptif ({student.full_name})
          </h3>
          <p className="text-xs text-slate-500">
            Setiap butir dilengkapi baseline observasi, strategi pengajaran, alat bantu, tingkat bantuan, dan indikator sukses.
          </p>
        </div>

        {canEdit && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerateAiDrafts}
              disabled={isAiLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-bold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
              title="Gunakan asisten kecerdasan buatan untuk menyusun draf rekomendasi adaptif berdasarkan catatan observasi"
            >
              <Bot className="w-4 h-4 text-amber-600" />
              <span>{isAiLoading ? 'Menyusun Draf...' : 'Bantuan Draf AI'}</span>
            </button>

            <button
              onClick={startCreate}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Rekomendasi</span>
            </button>
          </div>
        )}
      </div>

      {/* AI Draft Disclaimer Notice */}
      <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-xs text-amber-950 flex items-start gap-3">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-extrabold block">Standar Etika & Kualitas Asesmen ABK:</span>
          <p className="text-amber-900 leading-relaxed text-[11px]">
            Semua rekomendasi dapat disesuaikan dan ditelaah langsung oleh Guru Observer. Rekomendasi bertanda <strong className="bg-amber-200/80 px-1 rounded text-amber-950 font-bold">Draf AI</strong> merupakan bahan pertimbangan awal dan wajib diverifikasi oleh psikolog/guru sebelum disahkan oleh Kepala Sekolah.
          </p>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Add / Edit Form Modal or In-Line Container */}
      {(isCreating || editingRec) && (
        <form onSubmit={handleSaveForm} className="bg-white p-6 rounded-3xl border-2 border-amber-300 shadow-md space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>{editingRec ? 'Edit Rekomendasi Pembelajaran' : 'Tambah Rekomendasi Pembelajaran Baru'}</span>
            </span>
            <button
              type="button"
              onClick={() => { setIsCreating(false); setEditingRec(null); }}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              Batal
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kategori Intervensi:
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as RecommendationCategory)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900"
              >
                {CATEGORY_OPTIONS.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Periode Evaluasi / Review Period:
              </label>
              <select
                value={formReviewPeriod}
                onChange={(e) => setFormReviewPeriod(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900"
              >
                {REVIEW_PERIOD_OPTIONS.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              1. Keterampilan Sasaran (Target Skill):
            </label>
            <input
              type="text"
              value={formTargetSkill}
              onChange={(e) => setFormTargetSkill(e.target.value)}
              placeholder="Contoh: Merespons panggilan nama dan instruksi 1-langkah dalam 3 detik"
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              2. Observasi Awal / Baseline:
            </label>
            <textarea
              rows={2}
              value={formBaseline}
              onChange={(e) => setFormBaseline(e.target.value)}
              placeholder="Deskripsikan kondisi aktual yang teramati pada siswa sebelum intervensi..."
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              3. Strategi Pembelajaran Adaptif yang Disarankan:
            </label>
            <textarea
              rows={3}
              value={formStrategy}
              onChange={(e) => setFormStrategy(e.target.value)}
              placeholder="Jelaskan teknik pengajaran spesifik (misal: First-Then, kartu PECS, TEACCH, prompting bertahap)..."
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                4. Media / Alat yang Dibutuhkan:
              </label>
              <input
                type="text"
                value={formMaterials}
                onChange={(e) => setFormMaterials(e.target.value)}
                placeholder="Contoh: Kartu visual PECS 5x5cm, papan First-Then, timer"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                5. Tingkat Bantuan / Prompting Level:
              </label>
              <select
                value={formAssistance}
                onChange={(e) => setFormAssistance(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900"
              >
                {PROMPTING_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              6. Indikator Ketercapaian (Success Indicator):
            </label>
            <input
              type="text"
              value={formSuccessIndicator}
              onChange={(e) => setFormSuccessIndicator(e.target.value)}
              placeholder="Contoh: Mampu merespons nama dalam 8 dari 10 kesempatan selama 3 hari berturut-turut"
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => { setIsCreating(false); setEditingRec(null); }}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-2xs cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Rekomendasi</span>
            </button>
          </div>
        </form>
      )}

      {/* List of Recommendations */}
      <div className="space-y-4">
        {recommendations.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs space-y-2">
            <BookOpen className="w-8 h-8 mx-auto text-slate-300" />
            <p className="font-semibold text-slate-600">Belum ada rekomendasi pembelajaran yang dibuat.</p>
            {canEdit && (
              <button
                onClick={startCreate}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-2xs"
              >
                Buat Rekomendasi Pertama
              </button>
            )}
          </div>
        ) : (
          recommendations.map((rec, index) => (
            <div
              key={rec.id}
              className={`bg-white rounded-3xl border transition-all p-5 sm:p-6 shadow-2xs space-y-3.5 ${
                rec.is_ai_generated ? 'border-amber-300/80 bg-amber-50/20' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center font-mono">
                    {index + 1}
                  </span>
                  <span className="font-bold text-xs text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                    {rec.category}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Review: {rec.review_period}</span>
                  </span>
                  {rec.is_ai_generated && (
                    <span className="text-[10px] font-extrabold text-amber-900 bg-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Draf AI</span>
                    </span>
                  )}
                </div>

                {canEdit && (
                  <div className="flex items-center gap-1 self-end sm:self-auto">
                    <button
                      onClick={() => startEdit(rec)}
                      className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer flex items-center gap-1"
                      title="Edit rekomendasi"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(rec.id, rec.target_skill)}
                      className="p-1.5 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs cursor-pointer"
                      title="Hapus rekomendasi"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Target Skill Title */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Keterampilan Sasaran (Target Skill):
                </span>
                <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                  {rec.target_skill}
                </h4>
              </div>

              {/* Two Column Grid: Baseline & Strategy */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                
                {/* Baseline Observation */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5 text-[11px]">
                    <Target className="w-3.5 h-3.5 text-slate-500" />
                    <span>Observasi Awal / Baseline:</span>
                  </span>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    {rec.baseline_observation}
                  </p>
                </div>

                {/* Suggested Strategy */}
                <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-1">
                  <span className="font-bold text-amber-900 flex items-center gap-1.5 text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Strategi Pembelajaran:</span>
                  </span>
                  <p className="text-slate-700 leading-relaxed text-[11px]">
                    {rec.suggested_strategy}
                  </p>
                </div>

              </div>

              {/* Footer Meta: Materials, Assistance Level, Success Indicator */}
              <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-slate-600">
                <div>
                  <span className="font-bold text-slate-500 block">Media / Alat:</span>
                  <span className="text-slate-800">{rec.required_materials}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-500 block">Tingkat Bantuan:</span>
                  <span className="font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60 inline-block">
                    {rec.assistance_level}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-slate-500 block">Indikator Sukses:</span>
                  <span className="text-slate-800 font-medium">{rec.success_indicator}</span>
                </div>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
};

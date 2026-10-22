import React, { useState, useMemo } from 'react';
import { 
  ObservationSession, 
  ObservationItem, 
  ObservationDomain, 
  ObservationResponse, 
  ObservationScoreValue,
  PromptingLevel,
  InformationSource,
  StudentObservationSynthesis
} from '../../types/observation';
import { Student, Registration } from '../../types/database';
import { OBSERVATION_DOMAINS } from '../../lib/observationData';
import { 
  calculateDomainSummary, 
  calculateAllDomainsSummary, 
  extractSkillsBreakdown,
  SCORING_EXPLANATIONS 
} from '../../lib/scoringEngine';
import { repository } from '../../lib/repository';
import { formatIndonesianDate } from '../../lib/utils';
import { 
  ArrowLeft, 
  Save, 
  Send, 
  Sparkles, 
  User, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Info, 
  ChevronRight, 
  ChevronLeft,
  FileCheck2,
  Award,
  BookOpen,
  Heart,
  Eye
} from 'lucide-react';
import { StarLogo } from '../common/StarLogo';

interface ObservationWorkstationProps {
  session: ObservationSession;
  student: Student;
  registration: Registration;
  userRole: 'observer' | 'principal' | 'staff' | 'admin';
  isReadOnly?: boolean;
  onBack: () => void;
  onSaved: (session: ObservationSession) => void;
  onSubmitForReview: (session: ObservationSession) => void;
}

const PROMPTING_OPTIONS: PromptingLevel[] = [
  'Mandiri (Tanpa Bantuan)',
  'Bantuan Verbal / Isyarat Lisan',
  'Bantuan Visual / Kartu Gambar',
  'Bantuan Gestur / Penunjuk',
  'Bantuan Fisik Sebagian (Hand-under-hand)',
  'Bantuan Fisik Penuh',
];

const SOURCE_OPTIONS: InformationSource[] = [
  'Observasi Langsung di Kelas',
  'Laporan Orang Tua / Riwayat',
  'Kombinasi Observasi & Orang Tua',
];

export const ObservationWorkstation: React.FC<ObservationWorkstationProps> = ({
  session: initialSession,
  student,
  registration,
  userRole,
  isReadOnly = false,
  onBack,
  onSaved,
  onSubmitForReview,
}) => {
  const [session, setSession] = useState<ObservationSession>(initialSession);
  const [activeTab, setActiveTab] = useState<string>('A'); // 'A' through 'G', or 'SUMMARY'
  const [contextDescription, setContextDescription] = useState(session.context_description || '');
  const [startTime, setStartTime] = useState(session.start_time || '08:30');
  const [endTime, setEndTime] = useState(session.end_time || '10:00');
  const [roomLocation, setRoomLocation] = useState(session.room_location || 'Ruang Sensori & Gerak');
  const [observerName, setObserverName] = useState(session.observer_name || 'Observer Guru');

  // Qualitative Synthesis State
  const defaultSynthesis: StudentObservationSynthesis = {
    strengths_and_interests: session.synthesis?.strengths_and_interests || registration.developmental_background?.strengths_and_interests || '',
    skills_demonstrated_independently: session.synthesis?.skills_demonstrated_independently || [],
    emerging_skills: session.synthesis?.emerging_skills || [],
    skills_requiring_assistance: session.synthesis?.skills_requiring_assistance || [],
    communication_supports: session.synthesis?.communication_supports || '',
    environmental_accommodations: session.synthesis?.environmental_accommodations || '',
    preferred_teaching_strategies: session.synthesis?.preferred_teaching_strategies || '',
    further_observation_needs: session.synthesis?.further_observation_needs || '',
    recommended_follow_up: session.synthesis?.recommended_follow_up || '',
  };

  const [synthesis, setSynthesis] = useState<StudentObservationSynthesis>(defaultSynthesis);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [saveBanner, setSaveBanner] = useState<string | null>(null);

  const observationItems = useMemo(() => repository.getObservationItems(), []);

  // Compute live scores and coverage across all 7 domains
  const summaryMetrics = useMemo(() => {
    return calculateAllDomainsSummary(OBSERVATION_DOMAINS, observationItems, session.responses);
  }, [observationItems, session.responses]);

  // Current domain items
  const currentDomain = OBSERVATION_DOMAINS.find((d) => d.id === activeTab);
  const currentDomainItems = useMemo(() => {
    if (!currentDomain) return [];
    return observationItems.filter((i) => i.domain_id === currentDomain.id && i.is_active);
  }, [currentDomain, observationItems]);

  const currentDomainScore = useMemo(() => {
    if (!currentDomain) return null;
    return calculateDomainSummary(currentDomain, observationItems, session.responses);
  }, [currentDomain, observationItems, session.responses]);

  // Handle Response Update per Item
  const handleUpdateItemScore = (itemId: string, score: ObservationScoreValue) => {
    if (isReadOnly) return;
    const now = new Date().toISOString();
    const existingResp = session.responses[itemId] || {
      item_id: itemId,
      domain_id: activeTab,
      source: 'Observasi Langsung di Kelas',
      recorded_at: now,
    };

    const updatedResp: ObservationResponse = {
      ...existingResp,
      score,
      recorded_at: now,
    };

    setSession((prev) => ({
      ...prev,
      responses: {
        ...prev.responses,
        [itemId]: updatedResp,
      },
    }));
  };

  const handleUpdateItemField = (
    itemId: string, 
    field: 'behavior_observed' | 'prompting_level' | 'activity_used' | 'source' | 'notes',
    value: any
  ) => {
    if (isReadOnly) return;
    const now = new Date().toISOString();
    const existingResp = session.responses[itemId] || {
      item_id: itemId,
      domain_id: activeTab,
      score: 'not_observed',
      source: 'Observasi Langsung di Kelas',
      recorded_at: now,
    };

    const updatedResp: ObservationResponse = {
      ...existingResp,
      [field]: value,
      recorded_at: now,
    };

    setSession((prev) => ({
      ...prev,
      responses: {
        ...prev.responses,
        [itemId]: updatedResp,
      },
    }));
  };

  // Save Draft
  const handleSaveDraft = () => {
    const updated: ObservationSession = {
      ...session,
      start_time: startTime,
      end_time: endTime,
      room_location: roomLocation,
      observer_name: observerName,
      context_description: contextDescription,
      synthesis,
      updated_at: new Date().toISOString(),
    };

    const saved = repository.saveObservationSession(updated);
    setSession(saved);
    onSaved(saved);
    setSaveBanner('Draf observasi berhasil disimpan ke basis data.');
    setTimeout(() => setSaveBanner(null), 3000);
  };

  // Auto-populate synthesis skills from responses
  const handleAutoExtractSkills = () => {
    const extracted = extractSkillsBreakdown(observationItems, session.responses);
    setSynthesis((prev) => ({
      ...prev,
      skills_demonstrated_independently: extracted.independentSkills,
      emerging_skills: extracted.emergingSkills,
      skills_requiring_assistance: extracted.assistedSkills,
    }));
  };

  // Submit Completed Observation
  const handleFinalSubmit = () => {
    const completedSession: ObservationSession = {
      ...session,
      start_time: startTime,
      end_time: endTime,
      room_location: roomLocation,
      observer_name: observerName,
      context_description: contextDescription,
      status: 'Selesai (Menunggu Telaah)',
      synthesis,
      updated_at: new Date().toISOString(),
    };

    const saved = repository.saveObservationSession(completedSession);
    setIsSubmitModalOpen(false);
    onSubmitForReview(saved);
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      
      {/* Top Navigation & Action Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Sesi</span>
        </button>

        <div className="flex items-center gap-3">
          {saveBanner && (
            <div className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{saveBanner}</span>
            </div>
          )}

          {!isReadOnly && (
            <>
              <button
                onClick={handleSaveDraft}
                className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5 text-amber-500" />
                <span>Simpan Draf</span>
              </button>

              <button
                onClick={() => setIsSubmitModalOpen(true)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim Hasil Observasi</span>
              </button>
            </>
          )}

          {isReadOnly && (
            <div className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              <span>Mode Pratinjau / Hanya Baca</span>
            </div>
          )}
        </div>
      </div>

      {/* Student Profile Header & Progress Dashboard */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Student Info */}
          <div className="lg:col-span-7 space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                {registration.registration_number}
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-500">
                Tanggal: <strong className="text-slate-800">{formatIndonesianDate(session.session_date)}</strong>
              </span>
            </div>

            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {student.full_name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600">
              Panggilan: <strong className="text-slate-800">"{student.preferred_name}"</strong> · {student.gender} · Usia: {student.calculated_age || '-'} · Wali: {registration.guardian?.full_name} ({registration.guardian?.whatsapp_number})
            </p>
          </div>

          {/* Observer, Time & Coverage Overview */}
          <div className="lg:col-span-5 bg-amber-50/50 p-4 rounded-2xl border border-amber-200/60 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Observer:</span>
              <span className="font-bold text-slate-900">{observerName}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Ruangan:</span>
              <span className="font-semibold text-slate-800">{roomLocation}</span>
            </div>

            {/* Overall Coverage Meter */}
            <div className="space-y-1 pt-1 border-t border-amber-200/60">
              <div className="flex items-center justify-between text-xs">
                <span className="text-amber-950 font-bold text-[11px] uppercase tracking-wider">Cakupan Observasi:</span>
                <span className="font-mono font-bold text-amber-900 text-xs">
                  {summaryMetrics.overallObservedItems} / {summaryMetrics.overallTotalItems} ({summaryMetrics.overallCoveragePercentage}%)
                </span>
              </div>
              <div className="w-full bg-amber-200/60 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${summaryMetrics.overallCoveragePercentage}%` }}
                />
              </div>
            </div>
          </div>

        </div>

        {/* Context and Pre-Observation Activity Collapsible */}
        <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="space-y-1">
            <label className="block font-semibold text-slate-600">Jam Mulai - Selesai:</label>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                disabled={isReadOnly}
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-20 p-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold text-slate-800"
              />
              <span>-</span>
              <input
                type="text"
                disabled={isReadOnly}
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-20 p-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold text-slate-800"
              />
            </div>
          </div>

          <div className="space-y-1 sm:col-span-3">
            <label className="block font-semibold text-slate-600">
              Kondisi Awal / Konteks Ketibaan Anak:
            </label>
            <input
              type="text"
              disabled={isReadOnly}
              placeholder="Contoh: Anak tiba segar didampingi ibu, awalnya memegang mainan mobil dan perlu 5 menit adaptasi..."
              value={contextDescription}
              onChange={(e) => setContextDescription(e.target.value)}
              className="w-full p-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Category Tabs: Domains A to G + Ringkasan & Rekomendasi */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
        {OBSERVATION_DOMAINS.map((dom) => {
          const domSummary = calculateDomainSummary(dom, observationItems, session.responses);
          const isSelected = activeTab === dom.id;
          const isComplete = domSummary.coverage_percentage === 100;

          return (
            <button
              key={dom.id}
              onClick={() => setActiveTab(dom.id)}
              className={`p-3 rounded-2xl border text-left transition-all whitespace-nowrap shrink-0 flex items-center gap-3 cursor-pointer ${
                isSelected
                  ? 'bg-amber-500 border-amber-500 text-white shadow-xs font-bold'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="space-y-0.5">
                <div className="text-xs font-extrabold flex items-center gap-1.5">
                  <span>{dom.label}</span>
                  {isComplete && <span className={`text-[10px] ${isSelected ? 'text-amber-100' : 'text-emerald-600'}`}>✓</span>}
                </div>
                <div className={`text-[10px] font-mono ${isSelected ? 'text-amber-100' : 'text-slate-400'}`}>
                  {domSummary.observed_items}/{domSummary.total_items} butir · {domSummary.average_score !== null ? `Skor: ${domSummary.average_score}` : 'Belum dinilai'}
                </div>
              </div>
            </button>
          );
        })}

        {/* Tab 8: Ringkasan & Rekomendasi */}
        <button
          onClick={() => setActiveTab('SUMMARY')}
          className={`p-3 rounded-2xl border text-left transition-all whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer ${
            activeTab === 'SUMMARY'
              ? 'bg-slate-900 border-slate-900 text-white shadow-xs font-bold'
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
          }`}
        >
          <Award className="w-4 h-4 text-amber-400" />
          <div className="space-y-0.5">
            <span className="text-xs font-extrabold block">Ringkasan & Rekomendasi</span>
            <span className={`text-[10px] block ${activeTab === 'SUMMARY' ? 'text-slate-300' : 'text-slate-400'}`}>
              Sintesis Profil & Fondasi PPI
            </span>
          </div>
        </button>
      </div>

      {/* MAIN DOMAIN ITEMS VIEW (Domains A to G) */}
      {activeTab !== 'SUMMARY' && currentDomain && (
        <div className="space-y-6">
          
          {/* Domain Header Card */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                Domain Asesmen
              </span>
              <h2 className="text-xl font-extrabold text-slate-900">
                {currentDomain.label}
              </h2>
              <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
                {currentDomain.description}
              </p>
            </div>

            {currentDomainScore && (
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-right space-y-1 shrink-0">
                <span className="text-[11px] text-slate-400 block font-semibold">Cakupan Domain:</span>
                <div className="font-mono font-bold text-slate-900 text-base">
                  {currentDomainScore.observed_items} / {currentDomainScore.total_items} ({currentDomainScore.coverage_percentage}%)
                </div>
                <span className="text-[10px] text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md font-bold block">
                  {currentDomainScore.level_label}
                </span>
              </div>
            )}
          </div>

          {/* Assessment Items List */}
          <div className="space-y-4">
            {currentDomainItems.map((item, index) => {
              const resp = session.responses[item.id];
              const currentScore = resp?.score ?? 'not_observed';

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4 hover:border-amber-200 transition-colors"
                >
                  
                  {/* Item Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {item.code}
                        </span>
                        <h3 className="font-extrabold text-slate-900 text-base">
                          {item.title}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                        {item.description}
                      </p>
                      {item.suggested_activity && (
                        <div className="inline-flex items-center gap-1.5 text-[11px] text-amber-800 bg-amber-50/70 px-2.5 py-1 rounded-lg border border-amber-100/80 mt-1">
                          <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
                          <span><strong>Saran Aktivitas Bermain:</strong> {item.suggested_activity}</span>
                        </div>
                      )}
                    </div>

                    {/* Active Score Badge */}
                    <div className="shrink-0">
                      {typeof currentScore === 'number' ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          Skor: {currentScore}
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                          {currentScore === 'not_observed' ? 'Belum Diamati' : 'Tidak Relevan'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 0-3 Scoring Buttons Strip */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Tingkat Keterampilan yang Ditunjukkan (Skala 0–3):
                    </label>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                      {/* 0: Belum ditunjukkan */}
                      <button
                        type="button"
                        disabled={isReadOnly}
                        onClick={() => handleUpdateItemScore(item.id, 0)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          currentScore === 0
                            ? 'bg-rose-50 border-rose-400 text-rose-950 ring-2 ring-rose-400/30 font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <span className="font-bold text-xs block">0. Belum Ditunjukkan</span>
                        <span className="text-[10px] text-slate-500 block leading-tight">Belum muncul saat distimulasi</span>
                      </button>

                      {/* 1: Bantuan penuh */}
                      <button
                        type="button"
                        disabled={isReadOnly}
                        onClick={() => handleUpdateItemScore(item.id, 1)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          currentScore === 1
                            ? 'bg-amber-100 border-amber-400 text-amber-950 ring-2 ring-amber-400/30 font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <span className="font-bold text-xs block">1. Bantuan Penuh</span>
                        <span className="text-[10px] text-slate-500 block leading-tight">Perlu bantuan fisik/ulang</span>
                      </button>

                      {/* 2: Bantuan sebagian */}
                      <button
                        type="button"
                        disabled={isReadOnly}
                        onClick={() => handleUpdateItemScore(item.id, 2)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          currentScore === 2
                            ? 'bg-sky-50 border-sky-400 text-sky-950 ring-2 ring-sky-400/30 font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <span className="font-bold text-xs block">2. Bantuan Sebagian</span>
                        <span className="text-[10px] text-slate-500 block leading-tight">Isyarat verbal / visual</span>
                      </button>

                      {/* 3: Mandiri */}
                      <button
                        type="button"
                        disabled={isReadOnly}
                        onClick={() => handleUpdateItemScore(item.id, 3)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          currentScore === 3
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-950 ring-2 ring-emerald-400/30 font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <span className="font-bold text-xs block">3. Mandiri</span>
                        <span className="text-[10px] text-slate-500 block leading-tight">Spontan tanpa arahan</span>
                      </button>

                      {/* Belum Diamati */}
                      <button
                        type="button"
                        disabled={isReadOnly}
                        onClick={() => handleUpdateItemScore(item.id, 'not_observed')}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          currentScore === 'not_observed'
                            ? 'bg-slate-100 border-slate-400 text-slate-900 ring-2 ring-slate-300 font-bold'
                            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        <span className="font-bold text-xs block">Belum Diamati</span>
                        <span className="text-[10px] text-slate-400 block leading-tight">Dikecualikan dari skor</span>
                      </button>

                      {/* Tidak Relevan */}
                      <button
                        type="button"
                        disabled={isReadOnly}
                        onClick={() => handleUpdateItemScore(item.id, 'not_applicable')}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          currentScore === 'not_applicable'
                            ? 'bg-purple-50 border-purple-400 text-purple-950 ring-2 ring-purple-300 font-bold'
                            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        <span className="font-bold text-xs block">Tidak Relevan</span>
                        <span className="text-[10px] text-slate-400 block leading-tight">Tidak diuji pada anak</span>
                      </button>
                    </div>
                  </div>

                  {/* Contextual Observation Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="space-y-1">
                      <label className="block font-semibold text-slate-700">
                        Perilaku Aktual yang Teramati:
                      </label>
                      <input
                        type="text"
                        disabled={isReadOnly}
                        placeholder="Deskripsikan respon spesifik anak..."
                        value={resp?.behavior_observed || ''}
                        onChange={(e) => handleUpdateItemField(item.id, 'behavior_observed', e.target.value)}
                        className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-900 focus:bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block font-semibold text-slate-700">
                        Aktivitas / Media Mainan yang Digunakan:
                      </label>
                      <input
                        type="text"
                        disabled={isReadOnly}
                        placeholder="Contoh: Balok angka, gelembung sabun, puzzle..."
                        value={resp?.activity_used || ''}
                        onChange={(e) => handleUpdateItemField(item.id, 'activity_used', e.target.value)}
                        className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-900 focus:bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block font-semibold text-slate-700">
                        Tingkat Bantuan (*Prompting Level*):
                      </label>
                      <select
                        disabled={isReadOnly}
                        value={resp?.prompting_level || PROMPTING_OPTIONS[0]}
                        onChange={(e) => handleUpdateItemField(item.id, 'prompting_level', e.target.value as any)}
                        className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-900 focus:bg-white"
                      >
                        {PROMPTING_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block font-semibold text-slate-700">
                        Sumber Informasi:
                      </label>
                      <select
                        disabled={isReadOnly}
                        value={resp?.source || SOURCE_OPTIONS[0]}
                        onChange={(e) => handleUpdateItemField(item.id, 'source', e.target.value as any)}
                        className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-900 focus:bg-white"
                      >
                        {SOURCE_OPTIONS.map((src) => (
                          <option key={src} value={src}>
                            {src}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Bottom Next/Prev Domain Navigation */}
          <div className="flex items-center justify-between pt-4">
            <button
              onClick={() => {
                const currentIndex = OBSERVATION_DOMAINS.findIndex((d) => d.id === activeTab);
                if (currentIndex > 0) {
                  setActiveTab(OBSERVATION_DOMAINS[currentIndex - 1].id);
                  window.scrollTo({ top: 180, behavior: 'smooth' });
                }
              }}
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Domain Sebelumnya</span>
            </button>

            <button
              onClick={() => {
                const currentIndex = OBSERVATION_DOMAINS.findIndex((d) => d.id === activeTab);
                if (currentIndex < OBSERVATION_DOMAINS.length - 1) {
                  setActiveTab(OBSERVATION_DOMAINS[currentIndex + 1].id);
                } else {
                  setActiveTab('SUMMARY');
                }
                window.scrollTo({ top: 180, behavior: 'smooth' });
              }}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span>Lanjutkan ke Domain Berikutnya</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* TAB 8: RINGKASAN & REKOMENDASI (SINTESIS & FONDASI PPI) */}
      {activeTab === 'SUMMARY' && (
        <div className="space-y-6">
          
          {/* Summary Scorecard Across 7 Domains */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Ringkasan Skor Observasi Per Domain (Skala 0–3)
                </h3>
                <p className="text-xs text-slate-500">
                  Kalkulasi otomatis mengecualikan item yang "Belum Diamati" atau "Tidak Relevan".
                </p>
              </div>

              <button
                type="button"
                onClick={handleAutoExtractSkills}
                className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Tarik Keterampilan Otomatis dari Skor</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Domain Perkembangan</th>
                    <th className="p-3 text-center">Butir Selesai</th>
                    <th className="p-3 text-center">Cakupan (%)</th>
                    <th className="p-3 text-center">Rata-rata Skor (0-3)</th>
                    <th className="p-3">Kategori Kesiapan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {summaryMetrics.domainSummaries.map((s) => (
                    <tr key={s.domain_id} className="hover:bg-amber-50/20">
                      <td className="p-3 font-bold text-slate-900">
                        {s.domain_id}. {s.domain_name}
                      </td>
                      <td className="p-3 text-center font-mono">
                        {s.observed_items} / {s.total_items}
                      </td>
                      <td className="p-3 text-center font-mono font-bold">
                        {s.coverage_percentage}%
                      </td>
                      <td className="p-3 text-center font-mono font-extrabold text-amber-800">
                        {s.average_score !== null ? s.average_score : '—'}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                          {s.level_label}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Non-punitive notice */}
            <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-sky-950 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong>Catatan Metodologi Asesmen:</strong> Little Star School tidak menghasilkan skor kelulusan tunggal (*pass/fail*) dan tidak melakukan diagnosis medis otomatis. Observasi bertujuan memetakan profil fungsional anak untuk merancang Program Pembelajaran Individual (PPI) pada Modul 3.
              </div>
            </div>
          </div>

          {/* Qualitative Synthesis Inputs */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
            <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3">
              Catatan Naratif & Fondasi Program Pembelajaran Individual (PPI)
            </h3>

            {/* Strengths & Interests */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                1. Kekuatan & Minat Utama Anak (*Strengths & Motivators*):
              </label>
              <textarea
                rows={2}
                disabled={isReadOnly}
                value={synthesis.strengths_and_interests}
                onChange={(e) => setSynthesis({ ...synthesis, strengths_and_interests: e.target.value })}
                placeholder="Contoh: Sangat menyukai angka, menyusun balok bertingkat, dan responsif terhadap musik klasik lembut..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900"
              />
            </div>

            {/* Skills demonstrated independently vs Emerging vs Assistance */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div className="space-y-1.5 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200">
                <span className="text-xs font-bold text-emerald-950 block">
                  Keterampilan Mandiri (Skor 3):
                </span>
                <textarea
                  rows={4}
                  disabled={isReadOnly}
                  value={synthesis.skills_demonstrated_independently.join('\n')}
                  onChange={(e) => setSynthesis({
                    ...synthesis,
                    skills_demonstrated_independently: e.target.value.split('\n').filter(Boolean)
                  })}
                  placeholder="Satu per baris..."
                  className="w-full p-2 rounded-xl border border-emerald-300 bg-white text-xs text-slate-800"
                />
              </div>

              <div className="space-y-1.5 bg-sky-50/50 p-4 rounded-2xl border border-sky-200">
                <span className="text-xs font-bold text-sky-950 block">
                  Keterampilan Muncul (Skor 2):
                </span>
                <textarea
                  rows={4}
                  disabled={isReadOnly}
                  value={synthesis.emerging_skills.join('\n')}
                  onChange={(e) => setSynthesis({
                    ...synthesis,
                    emerging_skills: e.target.value.split('\n').filter(Boolean)
                  })}
                  placeholder="Satu per baris..."
                  className="w-full p-2 rounded-xl border border-sky-300 bg-white text-xs text-slate-800"
                />
              </div>

              <div className="space-y-1.5 bg-amber-50/50 p-4 rounded-2xl border border-amber-200">
                <span className="text-xs font-bold text-amber-950 block">
                  Perlu Bantuan Intensif (Skor 0-1):
                </span>
                <textarea
                  rows={4}
                  disabled={isReadOnly}
                  value={synthesis.skills_requiring_assistance.join('\n')}
                  onChange={(e) => setSynthesis({
                    ...synthesis,
                    skills_requiring_assistance: e.target.value.split('\n').filter(Boolean)
                  })}
                  placeholder="Satu per baris..."
                  className="w-full p-2 rounded-xl border border-amber-300 bg-white text-xs text-slate-800"
                />
              </div>

            </div>

            {/* Environmental & Communication Support */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  2. Dukungan Komunikasi yang Disarankan:
                </label>
                <textarea
                  rows={2}
                  disabled={isReadOnly}
                  value={synthesis.communication_supports}
                  onChange={(e) => setSynthesis({ ...synthesis, communication_supports: e.target.value })}
                  placeholder="Contoh: Kartu visual PECS, instruksi lisan singkat 1-2 kata, demonstrasi langsung..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  3. Akomodasi Lingkungan & Sensori:
                </label>
                <textarea
                  rows={2}
                  disabled={isReadOnly}
                  value={synthesis.environmental_accommodations}
                  onChange={(e) => setSynthesis({ ...synthesis, environmental_accommodations: e.target.value })}
                  placeholder="Contoh: Ruang dengan pencahayaan hangat, headphone peredam bising jika ada suara keras..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  4. Strategi Pengajaran yang Disukai:
                </label>
                <textarea
                  rows={2}
                  disabled={isReadOnly}
                  value={synthesis.preferred_teaching_strategies}
                  onChange={(e) => setSynthesis({ ...synthesis, preferred_teaching_strategies: e.target.value })}
                  placeholder="Contoh: Pembelajaran berbasis minat balok kayu, transisi dengan aba-aba visual..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  5. Kebutuhan Observasi Lanjutan:
                </label>
                <textarea
                  rows={2}
                  disabled={isReadOnly}
                  value={synthesis.further_observation_needs}
                  onChange={(e) => setSynthesis({ ...synthesis, further_observation_needs: e.target.value })}
                  placeholder="Contoh: Observasi saat berada di kelompok kecil bersama 2 anak lain..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900"
                />
              </div>
            </div>

            {/* Recommended Follow-up */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-900">
                6. Rekomendasi Tindak Lanjut Penempatan & Kolaborasi Terapi:
              </label>
              <textarea
                rows={2}
                disabled={isReadOnly}
                value={synthesis.recommended_follow_up}
                onChange={(e) => setSynthesis({ ...synthesis, recommended_follow_up: e.target.value })}
                placeholder="Contoh: Direkomendasikan kelas transisi adaptif Little Star School dengan kombinasi terapi wicara 2x per minggu..."
                className="w-full p-3 rounded-xl border border-slate-300 bg-amber-50/20 text-xs sm:text-sm text-slate-900 font-medium"
              />
            </div>

          </div>

        </div>
      )}

      {/* Confirmation Modal Before Submission */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Send className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">
                  Kirim Hasil Observasi untuk Telaah?
                </h3>
                <p className="text-xs text-slate-500">
                  Siswa: {student.full_name} ({registration.registration_number})
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs text-slate-700">
              <div className="flex justify-between">
                <span>Total Butir Diamati:</span>
                <strong className="font-mono">{summaryMetrics.overallObservedItems} / {summaryMetrics.overallTotalItems} ({summaryMetrics.overallCoveragePercentage}%)</strong>
              </div>
              <div className="flex justify-between">
                <span>Status Setelah Kirim:</span>
                <strong className="text-sky-700">Selesai (Menunggu Telaah Kepala Sekolah)</strong>
              </div>
              <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                Setelah dikirim, lembar kerja akan berstatus siap telaah oleh Kepala Sekolah untuk persiapan laporan resmi kepada orang tua.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
              >
                Kembali Periksa
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Ya, Kirim Hasil Observasi</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

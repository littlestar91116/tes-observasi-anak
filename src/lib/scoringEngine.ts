import { 
  ObservationItem, 
  ObservationResponse, 
  DomainScoreSummary, 
  ObservationScoreValue,
  ObservationDomain,
  StudentObservationSynthesis
} from '../types/observation';

/**
 * Scoring Calculation Engine for Little Star School Pamekasan (Module 2)
 * 
 * Rules:
 * 1. Score scale: 0 (Belum ditunjukkan), 1 (Bantuan Penuh), 2 (Bantuan Sebagian), 3 (Mandiri).
 * 2. Exclude 'not_observed' (Belum diamati) and 'not_applicable' (Tidak relevan) from numeric averages.
 * 3. Never assign zero for missing observation data.
 * 4. No single pass/fail score and no automated diagnosis.
 */

export function calculateDomainSummary(
  domain: ObservationDomain,
  items: ObservationItem[],
  responses: Record<string, ObservationResponse>
): DomainScoreSummary {
  const domainItems = items.filter((item) => item.domain_id === domain.id && item.is_active);
  const totalItems = domainItems.length;

  let observedCount = 0;
  let naCount = 0;
  let numericSum = 0;
  let numericCount = 0;

  for (const item of domainItems) {
    const resp = responses[item.id];
    if (!resp) continue;

    if (resp.score === 'not_applicable') {
      naCount++;
      observedCount++;
    } else if (resp.score === 'not_observed') {
      // Excluded from both calculation and observed count
    } else if (typeof resp.score === 'number') {
      observedCount++;
      numericSum += resp.score;
      numericCount++;
    }
  }

  const coveragePercentage = totalItems > 0 ? Math.round((observedCount / totalItems) * 100) : 0;
  const averageScore = numericCount > 0 ? Number((numericSum / numericCount).toFixed(2)) : null;

  let levelLabel = 'Belum Ada Data Observasi';
  if (averageScore !== null) {
    if (averageScore >= 2.5) {
      levelLabel = 'Mandiri / Kuat';
    } else if (averageScore >= 1.6) {
      levelLabel = 'Sedang Berkembang (Bantuan Sebagian)';
    } else if (averageScore >= 0.8) {
      levelLabel = 'Memerlukan Bantuan Penuh';
    } else {
      levelLabel = 'Belum Muncul dalam Observasi';
    }
  }

  return {
    domain_id: domain.id,
    domain_name: domain.name,
    total_items: totalItems,
    observed_items: observedCount,
    not_applicable_items: naCount,
    coverage_percentage: coveragePercentage,
    average_score: averageScore,
    level_label: levelLabel,
  };
}

export function calculateAllDomainsSummary(
  domains: ObservationDomain[],
  items: ObservationItem[],
  responses: Record<string, ObservationResponse>
): {
  domainSummaries: DomainScoreSummary[];
  overallTotalItems: number;
  overallObservedItems: number;
  overallCoveragePercentage: number;
} {
  const domainSummaries = domains.map((d) => calculateDomainSummary(d, items, responses));

  let totalItemsAll = 0;
  let totalObservedAll = 0;

  for (const s of domainSummaries) {
    totalItemsAll += s.total_items;
    totalObservedAll += s.observed_items;
  }

  const overallCoverage = totalItemsAll > 0 ? Math.round((totalObservedAll / totalItemsAll) * 100) : 0;

  return {
    domainSummaries,
    overallTotalItems: totalItemsAll,
    overallObservedItems: totalObservedAll,
    overallCoveragePercentage: overallCoverage,
  };
}

/**
 * Automatically extracts demonstrated strengths, emerging skills, and support areas from responses
 */
export function extractSkillsBreakdown(
  items: ObservationItem[],
  responses: Record<string, ObservationResponse>
): {
  independentSkills: string[];
  emergingSkills: string[];
  assistedSkills: string[];
} {
  const independentSkills: string[] = [];
  const emergingSkills: string[] = [];
  const assistedSkills: string[] = [];

  for (const item of items) {
    const resp = responses[item.id];
    if (!resp || typeof resp.score !== 'number') continue;

    const label = `${item.title} (${item.code})`;
    if (resp.score === 3) {
      independentSkills.push(label);
    } else if (resp.score === 2) {
      emergingSkills.push(label);
    } else if (resp.score <= 1) {
      assistedSkills.push(label);
    }
  }

  return {
    independentSkills,
    emergingSkills,
    assistedSkills,
  };
}

export const SCORING_EXPLANATIONS = [
  {
    score: '3',
    label: 'Ditunjukkan secara Mandiri',
    desc: 'Anak mendemonstrasikan keterampilan secara spontan, konsisten, dan mandiri tanpa bantuan fisik atau verbal pengarah.',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  {
    score: '2',
    label: 'Ditunjukkan dengan Bantuan Sebagian',
    desc: 'Anak mampu melakukan dengan bantuan ringan, seperti isyarat verbal, penunjuk gestur, atau kartu visual pendukung.',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
  },
  {
    score: '1',
    label: 'Ditunjukkan dengan Bantuan Penuh',
    desc: 'Anak memerlukan stimulasi fisik langsung (*hand-under-hand*) atau demonstrasi berulang langkah demi langkah.',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  {
    score: '0',
    label: 'Belum Ditunjukkan',
    desc: 'Anak belum memunculkan keterampilan meskipun kesempatan nyata dan stimulasi bermain telah disediakan selama observasi.',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
  },
  {
    score: 'not_observed',
    label: 'Belum Diamati',
    desc: 'Keterampilan belum sempat diamati karena keterbatasan waktu atau minat anak. Tidak dihitung nol dan dikecualikan dari kalkulasi skor.',
    badgeColor: 'bg-slate-50 text-slate-500 border-slate-200',
  },
  {
    score: 'not_applicable',
    label: 'Tidak Relevan',
    desc: 'Keterampilan tidak relevan untuk profil atau usia anak pada sesi ini. Dikecualikan dari perhitungan.',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
  },
];

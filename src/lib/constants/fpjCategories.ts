/**
 * =====================================================
 * VERIFY AGAINST THE CURRENT FPJ REGULAMENTO (fpj.pt) BEFORE USE
 * =====================================================
 * FILE: fpjCategories.ts
 * PURPOSE: Starting data for age classes, weights and
 *          rules. Copied into the database once, on the
 *          first launch, and editable in the app after that.
 * SOURCE: FPJ "Regulamento de Organizacao de Provas 2026",
 *         Articles 3, 14, 15 and 17, and IJF refereeing rules.
 * USED BY: seedFpjDataMigration.ts
 * =====================================================
 */

// ---------------------------------------------
// SECTION: Types
// ---------------------------------------------

export type FpjAgeClass = {
  id: string;
  name: string;
  minAge: number | null;
  maxAge: number | null;
  matchSeconds: number;
  goldenScoreMaxSeconds: number | null;
  weightToleranceGrams: number;
  // False means the regulation gave us no value, so it is only our suggestion.
  isVerified: boolean;
  // Empty lists mean free grouping: athletes are grouped after the weigh-in.
  maleWeightsKg: readonly number[];
  femaleWeightsKg: readonly number[];
};

// ---------------------------------------------
// SECTION: Rules
// ---------------------------------------------

export const DEFAULT_RULE_SET = {
  id: 'fpj-ijf-default',
  name: 'FPJ / IJF',
  hasWazaAriAwaseteIppon: true,
  shidosForHansokuMake: 3,
  osaekomiSecondsYuko: 5,
  osaekomiSecondsWazaAri: 10,
  osaekomiSecondsIppon: 20,
  goldenScoreWonByShido: false,
} as const;

// ---------------------------------------------
// SECTION: Weights
// ---------------------------------------------

// Each number is an upper limit in kg. The last one also creates a "+" category,
// so [60, 66] becomes -60 kg, -66 kg and +66 kg.
const SENIOR_MALE_WEIGHTS = [60, 66, 73, 81, 90, 100];
const SENIOR_FEMALE_WEIGHTS = [48, 52, 57, 63, 70, 78];
const YOUTH_FEMALE_WEIGHTS = [40, 44, 48, 52, 57, 63, 70];
const NO_WEIGHTS: readonly number[] = [];

// Article 17: up to Cadetes, athletes get 200 g of tolerance at the weigh-in.
const YOUTH_TOLERANCE_GRAMS = 200;

// ---------------------------------------------
// SECTION: Age classes (age on 31 December of the competition year)
// ---------------------------------------------

export const FPJ_AGE_CLASSES: readonly FpjAgeClass[] = [
  // The regulation gives these three classes an age but no time or weights.
  // These are marked unverified here, and migration 3 marks them as confirmed. Earlier
  // migrations must not change, because existing databases have already run them.
  {
    id: 'fpj-benjamins',
    name: 'Benjamins',
    minAge: null,
    maxAge: 10,
    matchSeconds: 120,
    goldenScoreMaxSeconds: null,
    weightToleranceGrams: YOUTH_TOLERANCE_GRAMS,
    isVerified: false,
    maleWeightsKg: NO_WEIGHTS,
    femaleWeightsKg: NO_WEIGHTS,
  },
  {
    id: 'fpj-infantis',
    name: 'Infantis',
    minAge: 11,
    maxAge: 11,
    matchSeconds: 120,
    goldenScoreMaxSeconds: null,
    weightToleranceGrams: YOUTH_TOLERANCE_GRAMS,
    isVerified: false,
    maleWeightsKg: NO_WEIGHTS,
    femaleWeightsKg: NO_WEIGHTS,
  },
  {
    id: 'fpj-iniciados',
    name: 'Iniciados',
    minAge: 12,
    maxAge: 12,
    matchSeconds: 120,
    goldenScoreMaxSeconds: null,
    weightToleranceGrams: YOUTH_TOLERANCE_GRAMS,
    isVerified: false,
    maleWeightsKg: NO_WEIGHTS,
    femaleWeightsKg: NO_WEIGHTS,
  },
  {
    id: 'fpj-juvenis',
    name: 'Juvenis',
    minAge: 13,
    maxAge: 14,
    matchSeconds: 180,
    goldenScoreMaxSeconds: null,
    weightToleranceGrams: YOUTH_TOLERANCE_GRAMS,
    isVerified: true,
    maleWeightsKg: [38, 42, 46, 50, 55, 60, 66, 73, 81],
    femaleWeightsKg: YOUTH_FEMALE_WEIGHTS,
  },
  {
    id: 'fpj-cadetes',
    name: 'Cadetes',
    minAge: 15,
    maxAge: 17,
    matchSeconds: 240,
    goldenScoreMaxSeconds: null,
    weightToleranceGrams: YOUTH_TOLERANCE_GRAMS,
    isVerified: true,
    maleWeightsKg: [50, 55, 60, 66, 73, 81, 90],
    femaleWeightsKg: YOUTH_FEMALE_WEIGHTS,
  },
  {
    id: 'fpj-juniores',
    name: 'Juniores',
    minAge: 18,
    maxAge: 20,
    matchSeconds: 240,
    goldenScoreMaxSeconds: null,
    weightToleranceGrams: 0,
    isVerified: true,
    maleWeightsKg: SENIOR_MALE_WEIGHTS,
    femaleWeightsKg: SENIOR_FEMALE_WEIGHTS,
  },
  {
    id: 'fpj-sub23',
    name: 'Sub23',
    minAge: 21,
    maxAge: 22,
    matchSeconds: 240,
    goldenScoreMaxSeconds: null,
    weightToleranceGrams: 0,
    isVerified: true,
    maleWeightsKg: SENIOR_MALE_WEIGHTS,
    femaleWeightsKg: SENIOR_FEMALE_WEIGHTS,
  },
  {
    id: 'fpj-seniores',
    name: 'Seniores',
    minAge: 21,
    maxAge: null,
    matchSeconds: 240,
    goldenScoreMaxSeconds: null,
    weightToleranceGrams: 0,
    isVerified: true,
    maleWeightsKg: SENIOR_MALE_WEIGHTS,
    femaleWeightsKg: SENIOR_FEMALE_WEIGHTS,
  },
  {
    id: 'fpj-veteranos',
    name: 'Veteranos',
    minAge: 30,
    maxAge: 59,
    matchSeconds: 180,
    goldenScoreMaxSeconds: null,
    weightToleranceGrams: 0,
    isVerified: true,
    maleWeightsKg: SENIOR_MALE_WEIGHTS,
    femaleWeightsKg: SENIOR_FEMALE_WEIGHTS,
  },
  // Articles 14.2 and 15.2: shorter match and a 1-minute golden score from age 60.
  {
    id: 'fpj-veteranos-60',
    name: 'Veteranos 60+',
    minAge: 60,
    maxAge: null,
    matchSeconds: 150,
    goldenScoreMaxSeconds: 60,
    weightToleranceGrams: 0,
    isVerified: true,
    maleWeightsKg: SENIOR_MALE_WEIGHTS,
    femaleWeightsKg: SENIOR_FEMALE_WEIGHTS,
  },
];

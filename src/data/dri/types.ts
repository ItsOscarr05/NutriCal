import { Sex } from '../../types/profile';

export type NutrientCategory = 'vitamin' | 'mineral';

/**
 * Full micronutrient set from PRD §8.3.
 */
export type NutrientKey =
  | 'vitamin_a'
  | 'vitamin_c'
  | 'vitamin_d'
  | 'vitamin_e'
  | 'vitamin_k'
  | 'vitamin_b6'
  | 'vitamin_b12'
  | 'thiamin'
  | 'riboflavin'
  | 'niacin'
  | 'folate'
  | 'calcium'
  | 'iron'
  | 'magnesium'
  | 'phosphorus'
  | 'potassium'
  | 'sodium'
  | 'zinc'
  | 'selenium'
  | 'iodine';

export interface NutrientInfo {
  key: NutrientKey;
  category: NutrientCategory;
  displayName: string;
  unit: 'mg' | 'mcg' | 'mcg_dfe' | 'mcg_rae' | 'mg_ne' | 'mg_ate';
}

/**
 * A single age/sex bracket as defined by the National Academies DRI tables
 * (PRD §10). `maxAge: null` means "and older" (open-ended top bracket).
 * `lifeStage` defaults to 'standard'; 'pregnant' / 'lactating' are modeled
 * now so the schema doesn't need to change when those brackets are added
 * (PRD §12 "data model built for extension").
 */
export interface AgeSexBracket {
  sex: Sex;
  lifeStage: 'standard' | 'pregnant' | 'lactating';
  minAge: number;
  maxAge: number | null;
}

/** RDA (or AI, where no RDA is established) plus the Tolerable Upper Intake Level. */
export interface DRIValue {
  /** RDA if established; AI (Adequate Intake) otherwise — see `isAI`. */
  amount: number;
  isAI: boolean;
  /** Tolerable Upper Intake Level. `null` means no UL has been established. */
  ul: number | null;
}

export interface DRIBracketEntry {
  bracket: AgeSexBracket;
  values: Partial<Record<NutrientKey, DRIValue>>;
}

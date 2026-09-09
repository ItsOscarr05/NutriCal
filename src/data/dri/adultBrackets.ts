import { DRIBracketEntry } from './types';

/**
 * DRI reference data — SEED / EXAMPLE BRACKET ONLY.
 *
 * This file currently populates a single, well-established bracket (adults
 * age 19-30, standard life stage, both sexes) to prove out the data model
 * end-to-end. Values below are the commonly published RDA/AI and UL figures
 * from the National Academies DRI summary tables as compiled by the NIH
 * Office of Dietary Supplements (PRD §10).
 *
 * IMPORTANT — this is NOT yet a complete dataset. Before this can back the
 * real premium micronutrient engine (PRD §8.3), someone needs to:
 *   1. Cross-check every value below against the current NIH ODS DRI
 *      tables (https://ods.od.nih.gov/HealthInformation/Dietary_Reference_Intakes.aspx),
 *      since these are periodically revised (PRD §14).
 *   2. Add the remaining adult brackets: 31-50, 51-70, 71+.
 *   3. Add child/adolescent brackets (this app collects age with no floor
 *      restriction yet — a real min-age gate belongs in onboarding).
 *   4. Decide whether pregnant/lactating life stages are in scope (PRD §16
 *      flags this as a nuance risk) — the schema already supports it.
 *
 * Treat this as the "one clear technical task for the engineering phase"
 * called out in PRD §10, not a finished reference table.
 */
export const SEED_DRI_BRACKETS: DRIBracketEntry[] = [
  {
    bracket: { sex: 'male', lifeStage: 'standard', minAge: 19, maxAge: 30 },
    values: {
      vitamin_a: { amount: 900, isAI: false, ul: 3000 },
      vitamin_c: { amount: 90, isAI: false, ul: 2000 },
      vitamin_d: { amount: 15, isAI: false, ul: 100 },
      vitamin_e: { amount: 15, isAI: false, ul: 1000 },
      vitamin_k: { amount: 120, isAI: true, ul: null },
      vitamin_b6: { amount: 1.3, isAI: false, ul: 100 },
      vitamin_b12: { amount: 2.4, isAI: false, ul: null },
      thiamin: { amount: 1.2, isAI: false, ul: null },
      riboflavin: { amount: 1.3, isAI: false, ul: null },
      niacin: { amount: 16, isAI: false, ul: 35 },
      folate: { amount: 400, isAI: false, ul: 1000 },
      calcium: { amount: 1000, isAI: false, ul: 2500 },
      iron: { amount: 8, isAI: false, ul: 45 },
      magnesium: { amount: 400, isAI: false, ul: 350 },
      phosphorus: { amount: 700, isAI: false, ul: 4000 },
      potassium: { amount: 3400, isAI: true, ul: null },
      sodium: { amount: 1500, isAI: true, ul: 2300 },
      zinc: { amount: 11, isAI: false, ul: 40 },
      selenium: { amount: 55, isAI: false, ul: 400 },
      iodine: { amount: 150, isAI: false, ul: 1100 },
    },
  },
  {
    bracket: { sex: 'female', lifeStage: 'standard', minAge: 19, maxAge: 30 },
    values: {
      vitamin_a: { amount: 700, isAI: false, ul: 3000 },
      vitamin_c: { amount: 75, isAI: false, ul: 2000 },
      vitamin_d: { amount: 15, isAI: false, ul: 100 },
      vitamin_e: { amount: 15, isAI: false, ul: 1000 },
      vitamin_k: { amount: 90, isAI: true, ul: null },
      vitamin_b6: { amount: 1.3, isAI: false, ul: 100 },
      vitamin_b12: { amount: 2.4, isAI: false, ul: null },
      thiamin: { amount: 1.1, isAI: false, ul: null },
      riboflavin: { amount: 1.1, isAI: false, ul: null },
      niacin: { amount: 14, isAI: false, ul: 35 },
      folate: { amount: 400, isAI: false, ul: 1000 },
      calcium: { amount: 1000, isAI: false, ul: 2500 },
      iron: { amount: 18, isAI: false, ul: 45 },
      magnesium: { amount: 310, isAI: false, ul: 350 },
      phosphorus: { amount: 700, isAI: false, ul: 4000 },
      potassium: { amount: 2600, isAI: true, ul: null },
      sodium: { amount: 1500, isAI: true, ul: 2300 },
      zinc: { amount: 8, isAI: false, ul: 40 },
      selenium: { amount: 55, isAI: false, ul: 400 },
      iodine: { amount: 150, isAI: false, ul: 1100 },
    },
  },
];

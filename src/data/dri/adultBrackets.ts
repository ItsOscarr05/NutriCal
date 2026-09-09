import { DRIBracketEntry } from './types';

/**
 * DRI reference data — adult brackets, standard life stage.
 *
 * Populates all four standard adult age brackets (19-30, 31-50, 51-70, 71+)
 * for both sexes, using the commonly published RDA/AI and UL figures from
 * the National Academies DRI summary tables as compiled by the NIH Office
 * of Dietary Supplements (PRD §10).
 *
 * IMPORTANT — this is NOT yet a complete dataset. Before this can back the
 * real premium micronutrient engine (PRD §8.3), someone needs to:
 *   1. Cross-check every value below against the current NIH ODS DRI
 *      tables (https://ods.od.nih.gov/HealthInformation/Dietary_Reference_Intakes.aspx),
 *      since these are periodically revised (PRD §14).
 *   2. Add child/adolescent brackets (this app collects age with no floor
 *      restriction yet — a real min-age gate belongs in onboarding).
 *   3. Decide whether pregnant/lactating life stages are in scope (PRD §16
 *      flags this as a nuance risk) — the schema already supports it.
 *
 * Treat this as an in-progress pass on the "one clear technical task for
 * the engineering phase" called out in PRD §10, not a finished, audited
 * reference table.
 *
 * Notes on values that shift across adult brackets (everything else is flat
 * across 19-70 or 19+):
 *   - Vitamin D:   15 mcg (19-70) -> 20 mcg (71+), both sexes.
 *   - Vitamin B6:  1.3 mg (19-50) -> male 1.7 mg / female 1.5 mg (51+).
 *   - Calcium:     1000 mg (19-50, both) -> female 1200 mg (51+);
 *                  male stays 1000 mg until 71+, then 1200 mg.
 *                  UL drops from 2500 mg (19-50) to 2000 mg (51+).
 *   - Iron:        female 18 mg (19-50) -> 8 mg (51+, post-menopausal,
 *                  matching male); male is flat at 8 mg for all adult brackets.
 *   - Magnesium:   male 400 mg (19-30) -> 420 mg (31+);
 *                  female 310 mg (19-30) -> 320 mg (31+).
 *   - Phosphorus:  RDA flat at 700 mg for all adult brackets/sexes;
 *                  UL drops from 4000 mg (19-70) to 3000 mg (71+).
 *   - Sodium (AI): 1500 mg (19-50) -> 1300 mg (51-70) -> 1200 mg (71+),
 *                  both sexes. The 2300 mg figure stored as `ul` here is
 *                  technically the Chronic Disease Risk Reduction (CDRR)
 *                  intake, not a true UL — flagged for the education layer.
 */

const MALE_19_30: DRIBracketEntry = {
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
};

const MALE_31_50: DRIBracketEntry = {
  bracket: { sex: 'male', lifeStage: 'standard', minAge: 31, maxAge: 50 },
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
    magnesium: { amount: 420, isAI: false, ul: 350 },
    phosphorus: { amount: 700, isAI: false, ul: 4000 },
    potassium: { amount: 3400, isAI: true, ul: null },
    sodium: { amount: 1500, isAI: true, ul: 2300 },
    zinc: { amount: 11, isAI: false, ul: 40 },
    selenium: { amount: 55, isAI: false, ul: 400 },
    iodine: { amount: 150, isAI: false, ul: 1100 },
  },
};

const MALE_51_70: DRIBracketEntry = {
  bracket: { sex: 'male', lifeStage: 'standard', minAge: 51, maxAge: 70 },
  values: {
    vitamin_a: { amount: 900, isAI: false, ul: 3000 },
    vitamin_c: { amount: 90, isAI: false, ul: 2000 },
    vitamin_d: { amount: 15, isAI: false, ul: 100 },
    vitamin_e: { amount: 15, isAI: false, ul: 1000 },
    vitamin_k: { amount: 120, isAI: true, ul: null },
    vitamin_b6: { amount: 1.7, isAI: false, ul: 100 },
    vitamin_b12: { amount: 2.4, isAI: false, ul: null },
    thiamin: { amount: 1.2, isAI: false, ul: null },
    riboflavin: { amount: 1.3, isAI: false, ul: null },
    niacin: { amount: 16, isAI: false, ul: 35 },
    folate: { amount: 400, isAI: false, ul: 1000 },
    calcium: { amount: 1000, isAI: false, ul: 2000 },
    iron: { amount: 8, isAI: false, ul: 45 },
    magnesium: { amount: 420, isAI: false, ul: 350 },
    phosphorus: { amount: 700, isAI: false, ul: 4000 },
    potassium: { amount: 3400, isAI: true, ul: null },
    sodium: { amount: 1300, isAI: true, ul: 2300 },
    zinc: { amount: 11, isAI: false, ul: 40 },
    selenium: { amount: 55, isAI: false, ul: 400 },
    iodine: { amount: 150, isAI: false, ul: 1100 },
  },
};

const MALE_71_PLUS: DRIBracketEntry = {
  bracket: { sex: 'male', lifeStage: 'standard', minAge: 71, maxAge: null },
  values: {
    vitamin_a: { amount: 900, isAI: false, ul: 3000 },
    vitamin_c: { amount: 90, isAI: false, ul: 2000 },
    vitamin_d: { amount: 20, isAI: false, ul: 100 },
    vitamin_e: { amount: 15, isAI: false, ul: 1000 },
    vitamin_k: { amount: 120, isAI: true, ul: null },
    vitamin_b6: { amount: 1.7, isAI: false, ul: 100 },
    vitamin_b12: { amount: 2.4, isAI: false, ul: null },
    thiamin: { amount: 1.2, isAI: false, ul: null },
    riboflavin: { amount: 1.3, isAI: false, ul: null },
    niacin: { amount: 16, isAI: false, ul: 35 },
    folate: { amount: 400, isAI: false, ul: 1000 },
    calcium: { amount: 1200, isAI: false, ul: 2000 },
    iron: { amount: 8, isAI: false, ul: 45 },
    magnesium: { amount: 420, isAI: false, ul: 350 },
    phosphorus: { amount: 700, isAI: false, ul: 3000 },
    potassium: { amount: 3400, isAI: true, ul: null },
    sodium: { amount: 1200, isAI: true, ul: 2300 },
    zinc: { amount: 11, isAI: false, ul: 40 },
    selenium: { amount: 55, isAI: false, ul: 400 },
    iodine: { amount: 150, isAI: false, ul: 1100 },
  },
};

const FEMALE_19_30: DRIBracketEntry = {
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
};

const FEMALE_31_50: DRIBracketEntry = {
  bracket: { sex: 'female', lifeStage: 'standard', minAge: 31, maxAge: 50 },
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
    magnesium: { amount: 320, isAI: false, ul: 350 },
    phosphorus: { amount: 700, isAI: false, ul: 4000 },
    potassium: { amount: 2600, isAI: true, ul: null },
    sodium: { amount: 1500, isAI: true, ul: 2300 },
    zinc: { amount: 8, isAI: false, ul: 40 },
    selenium: { amount: 55, isAI: false, ul: 400 },
    iodine: { amount: 150, isAI: false, ul: 1100 },
  },
};

const FEMALE_51_70: DRIBracketEntry = {
  bracket: { sex: 'female', lifeStage: 'standard', minAge: 51, maxAge: 70 },
  values: {
    vitamin_a: { amount: 700, isAI: false, ul: 3000 },
    vitamin_c: { amount: 75, isAI: false, ul: 2000 },
    vitamin_d: { amount: 15, isAI: false, ul: 100 },
    vitamin_e: { amount: 15, isAI: false, ul: 1000 },
    vitamin_k: { amount: 90, isAI: true, ul: null },
    vitamin_b6: { amount: 1.5, isAI: false, ul: 100 },
    vitamin_b12: { amount: 2.4, isAI: false, ul: null },
    thiamin: { amount: 1.1, isAI: false, ul: null },
    riboflavin: { amount: 1.1, isAI: false, ul: null },
    niacin: { amount: 14, isAI: false, ul: 35 },
    folate: { amount: 400, isAI: false, ul: 1000 },
    calcium: { amount: 1200, isAI: false, ul: 2000 },
    iron: { amount: 8, isAI: false, ul: 45 },
    magnesium: { amount: 320, isAI: false, ul: 350 },
    phosphorus: { amount: 700, isAI: false, ul: 4000 },
    potassium: { amount: 2600, isAI: true, ul: null },
    sodium: { amount: 1300, isAI: true, ul: 2300 },
    zinc: { amount: 8, isAI: false, ul: 40 },
    selenium: { amount: 55, isAI: false, ul: 400 },
    iodine: { amount: 150, isAI: false, ul: 1100 },
  },
};

const FEMALE_71_PLUS: DRIBracketEntry = {
  bracket: { sex: 'female', lifeStage: 'standard', minAge: 71, maxAge: null },
  values: {
    vitamin_a: { amount: 700, isAI: false, ul: 3000 },
    vitamin_c: { amount: 75, isAI: false, ul: 2000 },
    vitamin_d: { amount: 20, isAI: false, ul: 100 },
    vitamin_e: { amount: 15, isAI: false, ul: 1000 },
    vitamin_k: { amount: 90, isAI: true, ul: null },
    vitamin_b6: { amount: 1.5, isAI: false, ul: 100 },
    vitamin_b12: { amount: 2.4, isAI: false, ul: null },
    thiamin: { amount: 1.1, isAI: false, ul: null },
    riboflavin: { amount: 1.1, isAI: false, ul: null },
    niacin: { amount: 14, isAI: false, ul: 35 },
    folate: { amount: 400, isAI: false, ul: 1000 },
    calcium: { amount: 1200, isAI: false, ul: 2000 },
    iron: { amount: 8, isAI: false, ul: 45 },
    magnesium: { amount: 320, isAI: false, ul: 350 },
    phosphorus: { amount: 700, isAI: false, ul: 3000 },
    potassium: { amount: 2600, isAI: true, ul: null },
    sodium: { amount: 1200, isAI: true, ul: 2300 },
    zinc: { amount: 8, isAI: false, ul: 40 },
    selenium: { amount: 55, isAI: false, ul: 400 },
    iodine: { amount: 150, isAI: false, ul: 1100 },
  },
};

export const SEED_DRI_BRACKETS: DRIBracketEntry[] = [
  MALE_19_30,
  MALE_31_50,
  MALE_51_70,
  MALE_71_PLUS,
  FEMALE_19_30,
  FEMALE_31_50,
  FEMALE_51_70,
  FEMALE_71_PLUS,
];

import { DRIBracketEntry } from './types';

/**
 * DRI reference data — adolescent brackets (9-13, 14-18), standard life stage.
 *
 * NutriCal v1 is scoped to users who enter their own body metrics
 * (PRD §8.1), so the youngest brackets included here are 9-13 and 14-18 —
 * the standard National Academies "child" and "adolescent" brackets. Ages
 * younger than 9 (infant/toddler DRI brackets) are intentionally NOT seeded:
 * those DRI values are typically applied by a caregiver, not entered by the
 * child themselves, which is a different product/UX problem than "someone
 * enters their own height/weight and gets a target" — see `MIN_SUPPORTED_AGE`
 * in `index.ts`, which onboarding should enforce as a hard floor once an age
 * input step exists.
 *
 * IMPORTANT — same caveat as `adultBrackets.ts`: these values need a direct
 * cross-check against the current NIH ODS DRI tables
 * (https://ods.od.nih.gov/HealthInformation/Dietary_Reference_Intakes.aspx)
 * before this backs the real premium micronutrient engine (PRD §8.3, §14).
 * The sodium AI/CDRR figures for these two brackets in particular are the
 * least confident values in this file and should be prioritized in that
 * cross-check.
 */

const MALE_9_13: DRIBracketEntry = {
  bracket: { sex: 'male', lifeStage: 'standard', minAge: 9, maxAge: 13 },
  values: {
    vitamin_a: { amount: 600, isAI: false, ul: 1700 },
    vitamin_c: { amount: 45, isAI: false, ul: 1200 },
    vitamin_d: { amount: 15, isAI: false, ul: 100 },
    vitamin_e: { amount: 11, isAI: false, ul: 600 },
    vitamin_k: { amount: 60, isAI: true, ul: null },
    vitamin_b6: { amount: 1.0, isAI: false, ul: 60 },
    vitamin_b12: { amount: 1.8, isAI: false, ul: null },
    thiamin: { amount: 0.9, isAI: false, ul: null },
    riboflavin: { amount: 0.9, isAI: false, ul: null },
    niacin: { amount: 12, isAI: false, ul: 20 },
    folate: { amount: 300, isAI: false, ul: 600 },
    calcium: { amount: 1300, isAI: false, ul: 3000 },
    iron: { amount: 8, isAI: false, ul: 40 },
    magnesium: { amount: 240, isAI: false, ul: 350 },
    phosphorus: { amount: 1250, isAI: false, ul: 4000 },
    potassium: { amount: 2600, isAI: true, ul: null },
    sodium: { amount: 1800, isAI: true, ul: 2200 },
    zinc: { amount: 8, isAI: false, ul: 23 },
    selenium: { amount: 40, isAI: false, ul: 280 },
    iodine: { amount: 120, isAI: false, ul: 600 },
  },
};

const MALE_14_18: DRIBracketEntry = {
  bracket: { sex: 'male', lifeStage: 'standard', minAge: 14, maxAge: 18 },
  values: {
    vitamin_a: { amount: 900, isAI: false, ul: 2800 },
    vitamin_c: { amount: 75, isAI: false, ul: 1800 },
    vitamin_d: { amount: 15, isAI: false, ul: 100 },
    vitamin_e: { amount: 15, isAI: false, ul: 800 },
    vitamin_k: { amount: 75, isAI: true, ul: null },
    vitamin_b6: { amount: 1.3, isAI: false, ul: 80 },
    vitamin_b12: { amount: 2.4, isAI: false, ul: null },
    thiamin: { amount: 1.2, isAI: false, ul: null },
    riboflavin: { amount: 1.3, isAI: false, ul: null },
    niacin: { amount: 16, isAI: false, ul: 30 },
    folate: { amount: 400, isAI: false, ul: 800 },
    calcium: { amount: 1300, isAI: false, ul: 3000 },
    iron: { amount: 11, isAI: false, ul: 45 },
    magnesium: { amount: 410, isAI: false, ul: 350 },
    phosphorus: { amount: 1250, isAI: false, ul: 4000 },
    potassium: { amount: 3000, isAI: true, ul: null },
    sodium: { amount: 2300, isAI: true, ul: 2300 },
    zinc: { amount: 11, isAI: false, ul: 34 },
    selenium: { amount: 55, isAI: false, ul: 400 },
    iodine: { amount: 150, isAI: false, ul: 900 },
  },
};

const FEMALE_9_13: DRIBracketEntry = {
  bracket: { sex: 'female', lifeStage: 'standard', minAge: 9, maxAge: 13 },
  values: {
    vitamin_a: { amount: 600, isAI: false, ul: 1700 },
    vitamin_c: { amount: 45, isAI: false, ul: 1200 },
    vitamin_d: { amount: 15, isAI: false, ul: 100 },
    vitamin_e: { amount: 11, isAI: false, ul: 600 },
    vitamin_k: { amount: 60, isAI: true, ul: null },
    vitamin_b6: { amount: 1.0, isAI: false, ul: 60 },
    vitamin_b12: { amount: 1.8, isAI: false, ul: null },
    thiamin: { amount: 0.9, isAI: false, ul: null },
    riboflavin: { amount: 0.9, isAI: false, ul: null },
    niacin: { amount: 12, isAI: false, ul: 20 },
    folate: { amount: 300, isAI: false, ul: 600 },
    calcium: { amount: 1300, isAI: false, ul: 3000 },
    iron: { amount: 8, isAI: false, ul: 40 },
    magnesium: { amount: 240, isAI: false, ul: 350 },
    phosphorus: { amount: 1250, isAI: false, ul: 4000 },
    potassium: { amount: 2300, isAI: true, ul: null },
    sodium: { amount: 1800, isAI: true, ul: 2200 },
    zinc: { amount: 8, isAI: false, ul: 23 },
    selenium: { amount: 40, isAI: false, ul: 280 },
    iodine: { amount: 120, isAI: false, ul: 600 },
  },
};

const FEMALE_14_18: DRIBracketEntry = {
  bracket: { sex: 'female', lifeStage: 'standard', minAge: 14, maxAge: 18 },
  values: {
    vitamin_a: { amount: 700, isAI: false, ul: 2800 },
    vitamin_c: { amount: 65, isAI: false, ul: 1800 },
    vitamin_d: { amount: 15, isAI: false, ul: 100 },
    vitamin_e: { amount: 15, isAI: false, ul: 800 },
    vitamin_k: { amount: 75, isAI: true, ul: null },
    vitamin_b6: { amount: 1.2, isAI: false, ul: 80 },
    vitamin_b12: { amount: 2.4, isAI: false, ul: null },
    thiamin: { amount: 1.0, isAI: false, ul: null },
    riboflavin: { amount: 1.0, isAI: false, ul: null },
    niacin: { amount: 14, isAI: false, ul: 30 },
    folate: { amount: 400, isAI: false, ul: 800 },
    calcium: { amount: 1300, isAI: false, ul: 3000 },
    iron: { amount: 15, isAI: false, ul: 45 },
    magnesium: { amount: 360, isAI: false, ul: 350 },
    phosphorus: { amount: 1250, isAI: false, ul: 4000 },
    potassium: { amount: 2300, isAI: true, ul: null },
    sodium: { amount: 2300, isAI: true, ul: 2300 },
    zinc: { amount: 9, isAI: false, ul: 34 },
    selenium: { amount: 55, isAI: false, ul: 400 },
    iodine: { amount: 150, isAI: false, ul: 900 },
  },
};

export const ADOLESCENT_DRI_BRACKETS: DRIBracketEntry[] = [MALE_9_13, MALE_14_18, FEMALE_9_13, FEMALE_14_18];

import { NutrientInfo, NutrientKey } from './types';

/**
 * Display metadata for every nutrient in the v1 set (PRD §8.3). Units follow
 * NIH Office of Dietary Supplements conventions:
 *   mcg_rae = micrograms Retinol Activity Equivalents (vitamin A)
 *   mcg_dfe = micrograms Dietary Folate Equivalents (folate)
 *   mg_ne   = milligrams Niacin Equivalents (niacin)
 *   mg_ate  = milligrams Alpha-Tocopherol Equivalents (vitamin E)
 */
export const NUTRIENT_INFO: Record<NutrientKey, NutrientInfo> = {
  vitamin_a: { key: 'vitamin_a', category: 'vitamin', displayName: 'Vitamin A', unit: 'mcg_rae' },
  vitamin_c: { key: 'vitamin_c', category: 'vitamin', displayName: 'Vitamin C', unit: 'mg' },
  vitamin_d: { key: 'vitamin_d', category: 'vitamin', displayName: 'Vitamin D', unit: 'mcg' },
  vitamin_e: { key: 'vitamin_e', category: 'vitamin', displayName: 'Vitamin E', unit: 'mg_ate' },
  vitamin_k: { key: 'vitamin_k', category: 'vitamin', displayName: 'Vitamin K', unit: 'mcg' },
  vitamin_b6: { key: 'vitamin_b6', category: 'vitamin', displayName: 'Vitamin B6', unit: 'mg' },
  vitamin_b12: { key: 'vitamin_b12', category: 'vitamin', displayName: 'Vitamin B12', unit: 'mcg' },
  thiamin: { key: 'thiamin', category: 'vitamin', displayName: 'Thiamin (B1)', unit: 'mg' },
  riboflavin: { key: 'riboflavin', category: 'vitamin', displayName: 'Riboflavin (B2)', unit: 'mg' },
  niacin: { key: 'niacin', category: 'vitamin', displayName: 'Niacin (B3)', unit: 'mg_ne' },
  folate: { key: 'folate', category: 'vitamin', displayName: 'Folate', unit: 'mcg_dfe' },
  calcium: { key: 'calcium', category: 'mineral', displayName: 'Calcium', unit: 'mg' },
  iron: { key: 'iron', category: 'mineral', displayName: 'Iron', unit: 'mg' },
  magnesium: { key: 'magnesium', category: 'mineral', displayName: 'Magnesium', unit: 'mg' },
  phosphorus: { key: 'phosphorus', category: 'mineral', displayName: 'Phosphorus', unit: 'mg' },
  potassium: { key: 'potassium', category: 'mineral', displayName: 'Potassium', unit: 'mg' },
  sodium: { key: 'sodium', category: 'mineral', displayName: 'Sodium', unit: 'mg' },
  zinc: { key: 'zinc', category: 'mineral', displayName: 'Zinc', unit: 'mg' },
  selenium: { key: 'selenium', category: 'mineral', displayName: 'Selenium', unit: 'mcg' },
  iodine: { key: 'iodine', category: 'mineral', displayName: 'Iodine', unit: 'mcg' },
};

export const NUTRIENT_KEYS = Object.keys(NUTRIENT_INFO) as NutrientKey[];

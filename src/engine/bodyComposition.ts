import { BodyFatCategory, Sex } from '../types/profile';

/**
 * Representative body fat % for each self-estimated category, by sex.
 * Bands follow the American Council on Exercise body fat chart (athletes /
 * fitness / average / above average), using a point inside each band:
 *   men:   very lean ~6-10, lean 11-15, average 16-21, soft 22-26, higher 27+
 *   women: very lean ~14-18, lean 19-23, average 24-29, soft 30-34, higher 35+
 */
export const BODY_FAT_PERCENT: Record<Sex, Record<BodyFatCategory, number>> = {
  male: { very_lean: 8, lean: 13, average: 19, soft: 24, higher: 30 },
  female: { very_lean: 16, lean: 21, average: 27, soft: 32, higher: 38 },
};

export function estimateLeanMassKg(weightKg: number, sex: Sex, category: BodyFatCategory): number {
  return weightKg * (1 - BODY_FAT_PERCENT[sex][category] / 100);
}

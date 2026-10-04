import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { ActivityLevel, BodyFatCategory, Goal, Sex } from '../types/profile';

export const ACTIVITY_OPTIONS: {
  value: ActivityLevel;
  label: string;
  description: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}[] = [
  { value: 'inactive', label: 'Couch Potato', description: 'Mostly sitting or resting', icon: 'sofa-outline' },
  { value: 'sedentary', label: 'Desk Duty', description: 'Seated job, little exercise', icon: 'laptop' },
  { value: 'lightly_active', label: 'Light Active', description: 'Walks & light exercise', icon: 'walk' },
  { value: 'moderately_active', label: 'Active', description: 'Workouts 3-5x/wk', icon: 'run' },
  { value: 'very_active', label: 'Very Active', description: 'Hard training 6-7x/wk', icon: 'lightning-bolt-outline' },
  { value: 'extremely_active', label: 'Manual Labor/Athlete', description: 'Physical job or elite training', icon: 'account-hard-hat-outline' },
];

// The Stitch mockup only offered 3 goal pills and no "gain_weight" option.
// Each pill maps onto the engine's 4-goal `GOAL_CALORIE_DELTA`
// (`src/engine/bmr.ts`) and `PROTEIN_G_PER_LB` (`src/engine/macros.ts`) —
// see AGENTS.md's "calculation engine must stay pure" rule.
export const GOAL_OPTIONS: {
  value: Goal;
  label: string;
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  badge?: string;
}[] = [
  { value: 'build_muscle', label: 'Lean Hypertrophy', description: 'Higher protein + a modest surplus', icon: 'fitness-center' },
  { value: 'lose_weight', label: 'Fat Loss & Vital Energy', description: 'A gentle, sustainable deficit', icon: 'local-fire-department', badge: 'Popular' },
  { value: 'maintain', label: 'Longevity & Maintenance', description: 'Nutrient density, no calorie change', icon: 'self-improvement' },
  { value: 'gain_weight', label: 'Healthy Weight Gain', description: 'A gradual, steady calorie surplus', icon: 'trending-up' },
];

/**
 * Body fat estimate cards, lightest to highest. `range` mirrors the bands
 * documented on `BODY_FAT_PERCENT` (`src/engine/bodyComposition.ts`).
 * Labels stay descriptive rather than judgmental (PRD §11.1).
 */
export const BODY_FAT_OPTIONS: {
  value: BodyFatCategory;
  label: string;
  range: Record<Sex, string>;
}[] = [
  { value: 'very_lean', label: 'Very lean', range: { male: '6-10%', female: '14-18%' } },
  { value: 'lean', label: 'Lean & athletic', range: { male: '11-15%', female: '19-23%' } },
  { value: 'average', label: 'Average', range: { male: '16-21%', female: '24-29%' } },
  { value: 'soft', label: 'Soft (skinny-fat)', range: { male: '22-26%', female: '30-34%' } },
  { value: 'higher', label: 'Higher body fat', range: { male: '27%+', female: '35%+' } },
];

/** Starting values for a brand-new assessment (no saved profile yet). */
export const DEFAULT_ASSESSMENT = {
  age: 28,
  heightCm: 173,
  weightKg: 70,
  activityLevel: 'lightly_active' as ActivityLevel,
  goal: 'lose_weight' as Goal,
};

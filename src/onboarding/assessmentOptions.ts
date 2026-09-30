import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { ActivityLevel, Goal } from '../types/profile';

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

// The Stitch mockup only offered 3 goal pills with flat kcal deltas
// (-400/+250/0) and no "gain_weight" option. Mapped onto the engine's real
// 4-goal, %-based `GOAL_ADJUSTMENT_FACTOR` (`src/engine/bmr.ts`) instead —
// see AGENTS.md's "calculation engine must stay pure" rule.
export const GOAL_OPTIONS: {
  value: Goal;
  label: string;
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  badge?: string;
}[] = [
  { value: 'lose_weight', label: 'Fat Loss & Vital Energy', description: 'A gentle, sustainable deficit', icon: 'local-fire-department', badge: 'Popular' },
  { value: 'build_muscle', label: 'Lean Hypertrophy', description: 'Higher protein + a modest surplus', icon: 'fitness-center' },
  { value: 'maintain', label: 'Longevity & Maintenance', description: 'Nutrient density, no calorie change', icon: 'self-improvement' },
  { value: 'gain_weight', label: 'Healthy Weight Gain', description: 'A gradual, steady calorie surplus', icon: 'trending-up' },
];

/** Starting values for a brand-new assessment (no saved profile yet). */
export const DEFAULT_ASSESSMENT = {
  age: 28,
  heightCm: 173,
  weightKg: 70,
  activityLevel: 'lightly_active' as ActivityLevel,
  goal: 'lose_weight' as Goal,
};

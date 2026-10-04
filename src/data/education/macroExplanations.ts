import { Goal } from '../../types/profile';

export type MacroKey = 'protein' | 'carbs' | 'fat';

export const MACRO_KEYS: MacroKey[] = ['protein', 'carbs', 'fat'];

export interface MacroExplanation {
  displayName: string;
  /** What this macro does in the body — the "translation" layer (PRD §8.5). */
  what: string;
  /** Why *this user's* number is set the way it is, one line per goal (PRD §8.4/§11.1). */
  whyByGoal: Record<Goal, string>;
  /** What happens with too little, drawing on general nutrition guidance (PRD §8.5). */
  tooLittle: string;
  /** What happens with too much. Deliberately non-alarmist (PRD §11.1) — informational, not a warning label. */
  tooMuch: string;
}

/**
 * Plain-language education content for the three free-tier macros (PRD
 * §8.4, §8.5). Kept as static data (rather than templated strings computed
 * from raw numbers) so the tone can be reviewed/edited as copy, independent
 * of the calculation engine in `src/engine`. The `whyByGoal` line is meant
 * to read naturally as a follow-on sentence after showing the user's grams
 * and percent-of-calories value — see `MacroDetailScreen`.
 *
 * Content here is v1 wellness-tool copy, not medical advice (PRD §13) —
 * kept general rather than citing specific clinical thresholds. The
 * `whyByGoal` lines mirror the engine's order of operations (protein from
 * body weight or lean mass, carbs from activity level, fat fills the
 * rest) — update them together.
 */
export const MACRO_EXPLANATIONS: Record<MacroKey, MacroExplanation> = {
  protein: {
    displayName: 'Protein',
    what: 'Protein builds and repairs muscle, skin, and other tissues, and helps you feel full after eating.',
    whyByGoal: {
      maintain:
        "Your protein is based on your body weight (or your lean mass, if you shared a body fat estimate), at a moderate level that covers your body's everyday repair and maintenance needs.",
      lose_weight:
        "Your protein is based on your body weight (or your lean mass, if you shared a body fat estimate) and set toward the top of the recommended range, since it helps preserve muscle and keep you full in a calorie deficit.",
      gain_weight:
        'Your protein is based on your body weight (or your lean mass, if you shared a body fat estimate) at a moderate level, giving your body the building blocks it needs as you gain.',
      build_muscle:
        "Your protein is based on your body weight (or your lean mass, if you shared a body fat estimate), in the range sports nutrition research supports for building muscle — enough to repair and grow without overdoing it.",
    },
    tooLittle: 'Getting too little protein over time can lead to muscle loss, slower recovery, and feeling hungry more often.',
    tooMuch:
      "Very high protein intake over a long period can put extra strain on the kidneys, especially if you already have kidney concerns — worth a conversation with a doctor if you're aiming far above this target.",
  },
  carbs: {
    displayName: 'Carbs',
    what: "Carbohydrates are your body's main energy source, fueling your brain and muscles throughout the day.",
    whyByGoal: {
      maintain: 'Your carbs are set by your activity level — the more you move, the more fuel you need — so you get steady energy without overdoing it.',
      lose_weight: "Your carbs are set by your activity level, trimmed if needed to fit your deficit, while never dropping below the minimum your brain relies on.",
      gain_weight: 'Your carbs are set by your activity level, giving you dependable energy while your surplus builds.',
      build_muscle: 'Your carbs are set by your activity level to fuel your training and recovery, without loading you up beyond what your workouts actually use.',
    },
    tooLittle: 'Consistently low carbs can leave you low on energy, irritable, or make it harder to push through workouts.',
    tooMuch: 'Eating far more carbs than you burn, especially from added sugars, can contribute to weight gain over time.',
  },
  fat: {
    displayName: 'Fat',
    what: 'Fat supports hormone production, helps you absorb certain vitamins, and provides long-lasting energy.',
    whyByGoal: {
      maintain: 'Fat fills the rest of your calories once protein and carbs are set, kept within the range most nutrition guidelines recommend for general health.',
      lose_weight: 'Fat fills the rest of your calories, with a minimum that keeps hormone health supported even while you eat in a deficit.',
      gain_weight: 'Fat fills the rest of your calories, carrying much of your surplus while staying within guideline ranges.',
      build_muscle: 'Fat fills the rest of your calories, carrying much of your lean-bulk surplus while staying within guideline ranges for hormone health.',
    },
    tooLittle: 'Too little fat over time can affect hormone production and make it harder to absorb vitamins A, D, E, and K.',
    tooMuch: 'Consistently high fat intake, especially from saturated sources, can affect heart health over time.',
  },
};

export function getMacroExplanation(macro: MacroKey): MacroExplanation {
  return MACRO_EXPLANATIONS[macro];
}

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
 * kept general rather than citing specific clinical thresholds.
 */
export const MACRO_EXPLANATIONS: Record<MacroKey, MacroExplanation> = {
  protein: {
    displayName: 'Protein',
    what: 'Protein builds and repairs muscle, skin, and other tissues, and helps you feel full after eating.',
    whyByGoal: {
      maintain:
        "We set protein at a moderate share of your calories — enough to support your body's everyday repair and maintenance needs without swinging your diet in any particular direction.",
      lose_weight:
        "We set protein higher than usual because it helps preserve muscle and keep you feeling full while you're eating in a calorie deficit.",
      gain_weight:
        'We kept protein steady, giving your body the building blocks it needs while most of your extra calories come from carbs.',
      build_muscle:
        "We set protein higher than usual since it's the main nutrient your muscles use to repair and grow after training.",
    },
    tooLittle: 'Getting too little protein over time can lead to muscle loss, slower recovery, and feeling hungry more often.',
    tooMuch:
      "Very high protein intake over a long period can put extra strain on the kidneys, especially if you already have kidney concerns — worth a conversation with a doctor if you're aiming far above this target.",
  },
  carbs: {
    displayName: 'Carbs',
    what: "Carbohydrates are your body's main energy source, fueling your brain and muscles throughout the day.",
    whyByGoal: {
      maintain: 'Carbs make up about half your calories — enough steady energy for daily activity without a deficit or surplus.',
      lose_weight: 'We lowered carbs to help create the calorie deficit weight loss needs, while still leaving room for energy.',
      gain_weight: 'We raised carbs — an easy, well-tolerated way to add the extra energy needed to gain weight.',
      build_muscle: 'Carbs stay in a solid range to fuel your workouts and recovery without crowding out the extra protein you need.',
    },
    tooLittle: 'Consistently low carbs can leave you low on energy, irritable, or make it harder to push through workouts.',
    tooMuch: 'Eating far more carbs than you burn, especially from added sugars, can contribute to weight gain over time.',
  },
  fat: {
    displayName: 'Fat',
    what: 'Fat supports hormone production, helps you absorb certain vitamins, and provides long-lasting energy.',
    whyByGoal: {
      maintain: 'Fat makes up a moderate share of your calories, within the range most nutrition guidelines recommend for general health.',
      lose_weight: 'Fat stays at a moderate share of your calories — enough for hormone health while carbs take a bigger cut for your deficit.',
      gain_weight: 'We eased fat back slightly, freeing up more room for the carbs driving your calorie surplus.',
      build_muscle: 'Fat sits at a moderate share of your calories, balanced against the extra protein your muscles need to recover.',
    },
    tooLittle: 'Too little fat over time can affect hormone production and make it harder to absorb vitamins A, D, E, and K.',
    tooMuch: 'Consistently high fat intake, especially from saturated sources, can affect heart health over time.',
  },
};

export function getMacroExplanation(macro: MacroKey): MacroExplanation {
  return MACRO_EXPLANATIONS[macro];
}

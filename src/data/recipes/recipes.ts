/**
 * Hand-written local recipe set for the Recipes tab — no food API, no
 * backend (AGENTS.md). Per-serving macros are rounded estimates; the
 * recipe test only checks they're internally consistent (calories ≈
 * 4 kcal/g protein + 4 kcal/g carbs + 9 kcal/g fat), not lab-accurate.
 *
 * Deliberately no micronutrient claims ("rich in magnesium", etc.):
 * micronutrient content stays premium-gated (PRD §7, §8.4).
 */
export type GroceryGroup = 'Protein' | 'Produce' | 'Grains & legumes' | 'Dairy & eggs' | 'Pantry';

export interface RecipeIngredient {
  item: string;
  group: GroceryGroup;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  /** Decorative tile, in place of the mockup's remote photos (the app is offline-only). */
  emoji: string;
  prepMinutes: number;
  difficulty: 'Easy' | 'Medium';
  plantForward: boolean;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: RecipeIngredient[];
  steps: string[];
}

export const RECIPES: Recipe[] = [
  {
    id: 'salmon-quinoa-bowl',
    name: 'Mediterranean Salmon & Quinoa Bowl',
    description: 'Seared salmon over herby quinoa with cucumber, cherry tomatoes, olives, and a squeeze of lemon.',
    emoji: '🐟',
    prepMinutes: 22,
    difficulty: 'Easy',
    plantForward: false,
    calories: 525,
    protein: 42,
    carbs: 48,
    fat: 18,
    ingredients: [
      { item: 'Salmon fillet (150 g)', group: 'Protein' },
      { item: 'Quinoa', group: 'Grains & legumes' },
      { item: 'Cucumber', group: 'Produce' },
      { item: 'Cherry tomatoes', group: 'Produce' },
      { item: 'Lemon', group: 'Produce' },
      { item: 'Fresh dill', group: 'Produce' },
      { item: 'Kalamata olives', group: 'Pantry' },
      { item: 'Olive oil', group: 'Pantry' },
    ],
    steps: [
      'Rinse ½ cup quinoa and simmer in 1 cup water for 15 minutes, then fluff.',
      'Season the salmon and sear skin-side down in 1 tsp olive oil, about 4 minutes per side.',
      'Dice the cucumber and halve the tomatoes; toss with the quinoa, olives, dill, and lemon juice.',
      'Flake the salmon over the bowl and serve.',
    ],
  },
  {
    id: 'turmeric-tofu-saute',
    name: 'Golden Turmeric Tofu & Edamame Sauté',
    description: 'Crisp tofu with a ginger-soy glaze, edamame, and wilted spinach.',
    emoji: '🥢',
    prepMinutes: 16,
    difficulty: 'Easy',
    plantForward: true,
    calories: 405,
    protein: 30,
    carbs: 26,
    fat: 20,
    ingredients: [
      { item: 'Firm tofu (200 g)', group: 'Protein' },
      { item: 'Shelled edamame', group: 'Grains & legumes' },
      { item: 'Baby spinach', group: 'Produce' },
      { item: 'Fresh ginger', group: 'Produce' },
      { item: 'Garlic', group: 'Produce' },
      { item: 'Ground turmeric', group: 'Pantry' },
      { item: 'Soy sauce', group: 'Pantry' },
      { item: 'Sesame seeds', group: 'Pantry' },
    ],
    steps: [
      'Press the tofu dry, cube it, and toss with a pinch of turmeric.',
      'Pan-fry in 1 tsp oil until golden on all sides, about 8 minutes.',
      'Add grated ginger, garlic, ¾ cup edamame, and a splash of soy sauce; cook 2 minutes.',
      'Fold in two handfuls of spinach until wilted, then top with sesame seeds.',
    ],
  },
  {
    id: 'herb-chicken-sweet-potato',
    name: 'Herb-Roasted Chicken & Sweet Potato Mash',
    description: 'Rosemary chicken breast with creamy sweet potato mash and charred broccolini.',
    emoji: '🍗',
    prepMinutes: 25,
    difficulty: 'Medium',
    plantForward: false,
    calories: 450,
    protein: 46,
    carbs: 44,
    fat: 10,
    ingredients: [
      { item: 'Chicken breast (170 g)', group: 'Protein' },
      { item: 'Sweet potato', group: 'Produce' },
      { item: 'Broccolini', group: 'Produce' },
      { item: 'Fresh rosemary', group: 'Produce' },
      { item: 'Olive oil', group: 'Pantry' },
    ],
    steps: [
      'Heat the oven to 220 °C / 425 °F.',
      'Rub the chicken with chopped rosemary, salt, and 1 tsp olive oil; roast 18–20 minutes.',
      'Meanwhile, cube and boil the sweet potato until soft, about 12 minutes, then mash.',
      'Roast the broccolini on the same tray for the last 8 minutes and serve together.',
    ],
  },
  {
    id: 'greek-yogurt-parfait',
    name: 'Greek Yogurt Berry Parfait with Chia',
    description: 'Thick Greek yogurt layered with mixed berries, chia seeds, and a drizzle of honey.',
    emoji: '🫐',
    prepMinutes: 5,
    difficulty: 'Easy',
    plantForward: false,
    calories: 310,
    protein: 26,
    carbs: 34,
    fat: 8,
    ingredients: [
      { item: 'Plain Greek yogurt (250 g)', group: 'Dairy & eggs' },
      { item: 'Mixed berries', group: 'Produce' },
      { item: 'Chia seeds', group: 'Pantry' },
      { item: 'Honey', group: 'Pantry' },
    ],
    steps: [
      'Spoon half the yogurt into a glass.',
      'Add half the berries and half a tablespoon of chia seeds.',
      'Repeat the layers and finish with 1 tsp honey.',
    ],
  },
  {
    id: 'black-bean-burrito-bowl',
    name: 'Black Bean & Sweet Potato Burrito Bowl',
    description: 'Roasted sweet potato, black beans, brown rice, corn, and salsa with a lime kick.',
    emoji: '🌯',
    prepMinutes: 20,
    difficulty: 'Easy',
    plantForward: true,
    calories: 520,
    protein: 20,
    carbs: 78,
    fat: 14,
    ingredients: [
      { item: 'Black beans (1 can)', group: 'Grains & legumes' },
      { item: 'Brown rice', group: 'Grains & legumes' },
      { item: 'Sweet potato', group: 'Produce' },
      { item: 'Corn kernels', group: 'Produce' },
      { item: 'Lime', group: 'Produce' },
      { item: 'Avocado', group: 'Produce' },
      { item: 'Salsa', group: 'Pantry' },
    ],
    steps: [
      'Cube the sweet potato and roast or air-fry until tender, about 15 minutes.',
      'Warm 1 cup rinsed black beans with the corn.',
      'Build the bowl on ½ cup cooked brown rice and top with salsa, a few avocado slices, and lime juice.',
    ],
  },
  {
    id: 'turkey-stir-fry',
    name: 'Turkey & Veggie Stir-Fry with Rice',
    description: 'Lean ground turkey with peppers, snap peas, and a garlic-ginger sauce over jasmine rice.',
    emoji: '🥘',
    prepMinutes: 18,
    difficulty: 'Easy',
    plantForward: false,
    calories: 475,
    protein: 40,
    carbs: 52,
    fat: 12,
    ingredients: [
      { item: 'Lean ground turkey (150 g)', group: 'Protein' },
      { item: 'Jasmine rice', group: 'Grains & legumes' },
      { item: 'Bell pepper', group: 'Produce' },
      { item: 'Snap peas', group: 'Produce' },
      { item: 'Garlic', group: 'Produce' },
      { item: 'Fresh ginger', group: 'Produce' },
      { item: 'Soy sauce', group: 'Pantry' },
    ],
    steps: [
      'Cook ½ cup jasmine rice.',
      'Brown the turkey in a hot pan, breaking it up as it cooks.',
      'Add sliced pepper, snap peas, garlic, and ginger; stir-fry 4 minutes.',
      'Splash in soy sauce, toss, and serve over the rice.',
    ],
  },
  {
    id: 'lentil-spinach-curry',
    name: 'Red Lentil & Spinach Curry',
    description: 'A cozy one-pot curry of red lentils, tomatoes, and spinach with warm spices.',
    emoji: '🍛',
    prepMinutes: 30,
    difficulty: 'Medium',
    plantForward: true,
    calories: 450,
    protein: 24,
    carbs: 62,
    fat: 12,
    ingredients: [
      { item: 'Red lentils', group: 'Grains & legumes' },
      { item: 'Canned tomatoes', group: 'Pantry' },
      { item: 'Light coconut milk', group: 'Pantry' },
      { item: 'Curry powder', group: 'Pantry' },
      { item: 'Onion', group: 'Produce' },
      { item: 'Garlic', group: 'Produce' },
      { item: 'Baby spinach', group: 'Produce' },
    ],
    steps: [
      'Soften a diced onion and garlic in a pot, then stir in 1 tbsp curry powder.',
      'Add ¾ cup rinsed red lentils, the tomatoes, and 2 cups water; simmer 20 minutes.',
      'Stir in a splash of coconut milk and the spinach until wilted. Serves two.',
    ],
  },
  {
    id: 'egg-avocado-toast',
    name: 'Egg & Avocado Breakfast Toast',
    description: 'Whole-grain toast with smashed avocado, two jammy eggs, and chili flakes.',
    emoji: '🥑',
    prepMinutes: 10,
    difficulty: 'Easy',
    plantForward: false,
    calories: 415,
    protein: 22,
    carbs: 32,
    fat: 22,
    ingredients: [
      { item: 'Eggs (2)', group: 'Dairy & eggs' },
      { item: 'Whole-grain bread', group: 'Grains & legumes' },
      { item: 'Avocado', group: 'Produce' },
      { item: 'Lemon', group: 'Produce' },
      { item: 'Chili flakes', group: 'Pantry' },
    ],
    steps: [
      'Boil the eggs for 6½ minutes, then cool in cold water and peel.',
      'Toast two slices of bread.',
      'Smash half an avocado with lemon juice and salt, spread it on the toast, and top with the halved eggs and chili flakes.',
    ],
  },
  {
    id: 'tuna-white-bean-salad',
    name: 'Tuna & White Bean Salad',
    description: 'No-cook salad of tuna, cannellini beans, red onion, parsley, and a lemon-olive oil dressing.',
    emoji: '🥗',
    prepMinutes: 10,
    difficulty: 'Easy',
    plantForward: false,
    calories: 400,
    protein: 38,
    carbs: 30,
    fat: 14,
    ingredients: [
      { item: 'Canned tuna (1 can)', group: 'Protein' },
      { item: 'Cannellini beans (1 can)', group: 'Grains & legumes' },
      { item: 'Red onion', group: 'Produce' },
      { item: 'Fresh parsley', group: 'Produce' },
      { item: 'Lemon', group: 'Produce' },
      { item: 'Olive oil', group: 'Pantry' },
    ],
    steps: [
      'Drain the tuna and rinse ¾ cup of the beans.',
      'Finely slice a little red onion and chop a handful of parsley.',
      'Toss everything with lemon juice, 1 tsp olive oil, salt, and pepper.',
    ],
  },
];

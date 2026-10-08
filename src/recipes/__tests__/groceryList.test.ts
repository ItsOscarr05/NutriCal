import { Recipe } from '../../data/recipes/recipes';
import { buildGroceryList, groceryListToText } from '../groceryList';

const make = (id: string, name: string, ingredients: Recipe['ingredients']): Recipe => ({
  id,
  name,
  description: '',
  emoji: '🥣',
  prepMinutes: 10,
  difficulty: 'Easy',
  plantForward: false,
  calories: 400,
  protein: 30,
  carbs: 40,
  fat: 13,
  ingredients,
  steps: ['Cook.'],
});

const a = make('a', 'Bowl A', [
  { item: 'Olive oil', group: 'Pantry' },
  { item: 'Chicken breast', group: 'Protein' },
  { item: 'Lemon', group: 'Produce' },
]);
const b = make('b', 'Bowl B', [
  { item: 'lemon', group: 'Produce' },
  { item: 'Rice', group: 'Grains & legumes' },
]);

describe('buildGroceryList', () => {
  it('returns nothing when no recipes are selected', () => {
    expect(buildGroceryList([a, b], [])).toEqual([]);
  });

  it('groups by store section in a fixed order and merges duplicates', () => {
    const list = buildGroceryList([a, b], ['a', 'b', 'missing']);
    expect(list.map((s) => s.group)).toEqual(['Protein', 'Produce', 'Grains & legumes', 'Pantry']);
    const produce = list.find((s) => s.group === 'Produce')!;
    expect(produce.items).toEqual([{ item: 'Lemon', recipes: ['Bowl A', 'Bowl B'] }]);
  });
});

describe('groceryListToText', () => {
  it('renders one bulleted block per section', () => {
    expect(groceryListToText(buildGroceryList([b], ['b']))).toBe('Produce:\n• lemon\n\nGrains & legumes:\n• Rice');
  });
});

import { GroceryGroup, Recipe } from '../data/recipes/recipes';

export const GROCERY_GROUP_ORDER: GroceryGroup[] = ['Protein', 'Produce', 'Grains & legumes', 'Dairy & eggs', 'Pantry'];

export interface GroceryItem {
  item: string;
  /** Names of the selected recipes that use this item. */
  recipes: string[];
}

export interface GrocerySection {
  group: GroceryGroup;
  items: GroceryItem[];
}

/**
 * Merges the selected recipes' ingredients into one list, grouped by
 * store section in `GROCERY_GROUP_ORDER`. Items with the same name
 * (case-insensitive) are listed once. Unknown ids are ignored.
 */
export function buildGroceryList(recipes: Recipe[], selectedIds: string[]): GrocerySection[] {
  const selected = recipes.filter((r) => selectedIds.includes(r.id));
  const byGroup = new Map<GroceryGroup, Map<string, GroceryItem>>();

  for (const recipe of selected) {
    for (const { item, group } of recipe.ingredients) {
      const items = byGroup.get(group) ?? new Map<string, GroceryItem>();
      byGroup.set(group, items);
      const key = item.toLowerCase();
      const existing = items.get(key);
      if (existing) {
        if (!existing.recipes.includes(recipe.name)) existing.recipes.push(recipe.name);
      } else {
        items.set(key, { item, recipes: [recipe.name] });
      }
    }
  }

  return GROCERY_GROUP_ORDER.filter((g) => byGroup.has(g)).map((group) => ({
    group,
    items: [...byGroup.get(group)!.values()],
  }));
}

/** Plain-text version for the native share sheet. */
export function groceryListToText(sections: GrocerySection[]): string {
  return sections
    .map((s) => [`${s.group}:`, ...s.items.map((i) => `• ${i.item}`)].join('\n'))
    .join('\n\n');
}

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * On-device list of recipe ids the user added to their grocery checklist
 * on the Recipes tab. Local-only like everything else (no account, no
 * sync); cleared by Settings → "Delete my data".
 */
const GROCERY_SELECTION_KEY = '@nutrical/grocery_selection';

export async function loadGrocerySelection(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(GROCERY_SELECTION_KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

export async function saveGrocerySelection(ids: string[]): Promise<void> {
  await AsyncStorage.setItem(GROCERY_SELECTION_KEY, JSON.stringify(ids));
}

export async function clearGrocerySelection(): Promise<void> {
  await AsyncStorage.removeItem(GROCERY_SELECTION_KEY);
}

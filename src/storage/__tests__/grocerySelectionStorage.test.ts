import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearGrocerySelection, loadGrocerySelection, saveGrocerySelection } from '../grocerySelectionStorage';

describe('grocerySelectionStorage', () => {
  afterEach(async () => {
    await AsyncStorage.clear();
  });

  it('returns an empty list when nothing is saved', async () => {
    expect(await loadGrocerySelection()).toEqual([]);
  });

  it('round-trips selected recipe ids', async () => {
    await saveGrocerySelection(['a', 'b']);
    expect(await loadGrocerySelection()).toEqual(['a', 'b']);
  });

  it('ignores corrupt or non-string data', async () => {
    await AsyncStorage.setItem('@nutrical/grocery_selection', 'not json');
    expect(await loadGrocerySelection()).toEqual([]);
    await AsyncStorage.setItem('@nutrical/grocery_selection', JSON.stringify(['a', 3, null]));
    expect(await loadGrocerySelection()).toEqual(['a']);
  });

  it('clears the selection', async () => {
    await saveGrocerySelection(['a']);
    await clearGrocerySelection();
    expect(await loadGrocerySelection()).toEqual([]);
  });
});

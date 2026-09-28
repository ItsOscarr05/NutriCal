import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, DEFAULT_APP_SETTINGS } from '../../settings/appSettings';
import { clearAppSettings, loadAppSettings, saveAppSettings } from '../appSettingsStorage';

const customSettings: AppSettings = { units: 'metric', appearance: 'dark' };

describe('appSettingsStorage', () => {
  afterEach(async () => {
    await AsyncStorage.clear();
  });

  it('returns DEFAULT_APP_SETTINGS when nothing has been saved yet', async () => {
    expect(await loadAppSettings()).toEqual(DEFAULT_APP_SETTINGS);
  });

  it('round-trips saved settings exactly', async () => {
    await saveAppSettings(customSettings);
    expect(await loadAppSettings()).toEqual(customSettings);
  });

  it('overwrites the previous settings on a later save', async () => {
    await saveAppSettings(customSettings);
    const updated: AppSettings = { units: 'imperial', appearance: 'light' };
    await saveAppSettings(updated);
    expect(await loadAppSettings()).toEqual(updated);
  });

  it('falls back to DEFAULT_APP_SETTINGS instead of throwing when stored data is corrupted JSON', async () => {
    await AsyncStorage.setItem('@nutrical/app_settings', '{not valid json');
    expect(await loadAppSettings()).toEqual(DEFAULT_APP_SETTINGS);
  });

  it('falls back to DEFAULT_APP_SETTINGS when stored data no longer matches the AppSettings shape', async () => {
    await AsyncStorage.setItem('@nutrical/app_settings', JSON.stringify({ units: 'metric' }));
    expect(await loadAppSettings()).toEqual(DEFAULT_APP_SETTINGS);
  });

  it('removes the stored settings on clearAppSettings, reverting to defaults', async () => {
    await saveAppSettings(customSettings);
    await clearAppSettings();
    expect(await loadAppSettings()).toEqual(DEFAULT_APP_SETTINGS);
  });
});

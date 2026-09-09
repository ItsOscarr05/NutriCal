import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearDismissedNudgeTimestamp, getDismissedNudgeTimestamp, setDismissedNudgeTimestamp } from '../nudgeStorage';

describe('nudgeStorage', () => {
  afterEach(async () => {
    await AsyncStorage.clear();
  });

  it('returns null when nothing has been dismissed yet', async () => {
    expect(await getDismissedNudgeTimestamp()).toBeNull();
  });

  it('round-trips a dismissed timestamp', async () => {
    await setDismissedNudgeTimestamp('2026-01-01T00:00:00.000Z');
    expect(await getDismissedNudgeTimestamp()).toBe('2026-01-01T00:00:00.000Z');
  });

  it('overwrites the previous dismissal on a later dismiss (e.g. after editing the profile)', async () => {
    await setDismissedNudgeTimestamp('2026-01-01T00:00:00.000Z');
    await setDismissedNudgeTimestamp('2026-02-01T00:00:00.000Z');
    expect(await getDismissedNudgeTimestamp()).toBe('2026-02-01T00:00:00.000Z');
  });

  it('removes the dismissal on clearDismissedNudgeTimestamp', async () => {
    await setDismissedNudgeTimestamp('2026-01-01T00:00:00.000Z');
    await clearDismissedNudgeTimestamp();
    expect(await getDismissedNudgeTimestamp()).toBeNull();
  });
});

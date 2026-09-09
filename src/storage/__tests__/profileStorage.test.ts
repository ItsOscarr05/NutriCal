import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../../types/profile';
import { clearProfile, isValidUserProfile, loadProfile, saveProfile } from '../profileStorage';

const validProfile: UserProfile = {
  sex: 'female',
  age: 28,
  heightCm: 165,
  weightKg: 62,
  activityLevel: 'moderately_active',
  goal: 'lose_weight',
  updatedAt: '2026-09-09T12:00:00.000Z',
};

describe('profileStorage', () => {
  afterEach(async () => {
    await AsyncStorage.clear();
  });

  it('returns null when no profile has been saved yet', async () => {
    expect(await loadProfile()).toBeNull();
  });

  it('round-trips a saved profile exactly', async () => {
    await saveProfile(validProfile);
    expect(await loadProfile()).toEqual(validProfile);
  });

  it('overwrites the previous profile on subsequent saves (editable profile, PRD §8.1)', async () => {
    await saveProfile(validProfile);
    const updated: UserProfile = { ...validProfile, weightKg: 60, updatedAt: '2026-10-01T00:00:00.000Z' };
    await saveProfile(updated);
    expect(await loadProfile()).toEqual(updated);
  });

  it('removes the profile on clearProfile', async () => {
    await saveProfile(validProfile);
    await clearProfile();
    expect(await loadProfile()).toBeNull();
  });

  it('returns null instead of throwing when stored data is corrupted JSON', async () => {
    await AsyncStorage.setItem('@nutrical/profile', '{not valid json');
    expect(await loadProfile()).toBeNull();
  });

  it('returns null when stored data no longer matches the UserProfile shape', async () => {
    await AsyncStorage.setItem('@nutrical/profile', JSON.stringify({ sex: 'female' }));
    expect(await loadProfile()).toBeNull();
  });
});

describe('isValidUserProfile', () => {
  it('accepts a well-formed profile', () => {
    expect(isValidUserProfile(validProfile)).toBe(true);
  });

  it.each([
    ['null', null],
    ['a string', 'not an object'],
    ['an invalid sex', { ...validProfile, sex: 'other' }],
    ['a negative age', { ...validProfile, age: -1 }],
    ['a zero height', { ...validProfile, heightCm: 0 }],
    ['a non-numeric weight', { ...validProfile, weightKg: '62' }],
    ['an invalid activity level', { ...validProfile, activityLevel: 'super_active' }],
    ['an invalid goal', { ...validProfile, goal: 'bulk' }],
    ['a missing updatedAt', (() => {
      const { updatedAt, ...rest } = validProfile;
      return rest;
    })()],
  ])('rejects %s', (_label, value) => {
    expect(isValidUserProfile(value)).toBe(false);
  });
});

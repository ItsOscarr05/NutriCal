import { UserProfile } from '../../../types/profile';
import { findBracketForProfile, getAllMicronutrientTargets, getMicronutrientTarget } from '../index';

const baseProfile: UserProfile = {
  sex: 'male',
  age: 25,
  heightCm: 180,
  weightKg: 80,
  activityLevel: 'sedentary',
  goal: 'maintain',
  updatedAt: new Date().toISOString(),
};

describe('DRI bracket lookup', () => {
  it('finds the seeded 19-30 male bracket', () => {
    const bracket = findBracketForProfile(baseProfile);
    expect(bracket).not.toBeNull();
    expect(bracket?.bracket).toMatchObject({ sex: 'male', minAge: 19, maxAge: 30 });
  });

  it('finds the seeded 19-30 female bracket', () => {
    const bracket = findBracketForProfile({ ...baseProfile, sex: 'female' });
    expect(bracket?.bracket).toMatchObject({ sex: 'female', minAge: 19, maxAge: 30 });
  });

  it('returns null for a bracket not yet seeded (e.g. age 45)', () => {
    const bracket = findBracketForProfile({ ...baseProfile, age: 45 });
    expect(bracket).toBeNull();
  });

  it('returns the correct iron RDA for the female bracket (higher than male, pre-menopause)', () => {
    const maleIron = getMicronutrientTarget(baseProfile, 'iron');
    const femaleIron = getMicronutrientTarget({ ...baseProfile, sex: 'female' }, 'iron');
    expect(maleIron?.amount).toBe(8);
    expect(femaleIron?.amount).toBe(18);
  });

  it('returns an empty object for an unseeded bracket rather than throwing', () => {
    expect(getAllMicronutrientTargets({ ...baseProfile, age: 60 })).toEqual({});
  });
});

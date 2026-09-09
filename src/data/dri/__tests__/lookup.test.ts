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
  it('finds the 19-30 male bracket', () => {
    const bracket = findBracketForProfile(baseProfile);
    expect(bracket?.bracket).toMatchObject({ sex: 'male', minAge: 19, maxAge: 30 });
  });

  it('finds the 19-30 female bracket', () => {
    const bracket = findBracketForProfile({ ...baseProfile, sex: 'female' });
    expect(bracket?.bracket).toMatchObject({ sex: 'female', minAge: 19, maxAge: 30 });
  });

  it.each([
    [30, 19, 30],
    [31, 31, 50],
    [50, 31, 50],
    [51, 51, 70],
    [70, 51, 70],
    [71, 71, null],
    [95, 71, null],
  ])('buckets age %i into the %i-%s bracket (not interpolated)', (age, expectedMin, expectedMax) => {
    const bracket = findBracketForProfile({ ...baseProfile, age });
    expect(bracket?.bracket.minAge).toBe(expectedMin);
    expect(bracket?.bracket.maxAge).toBe(expectedMax);
  });

  it('returns null below the youngest seeded bracket', () => {
    expect(findBracketForProfile({ ...baseProfile, age: 10 })).toBeNull();
  });

  it('returns the correct iron RDA for the female bracket (higher than male, pre-menopause)', () => {
    const maleIron = getMicronutrientTarget(baseProfile, 'iron');
    const femaleIron = getMicronutrientTarget({ ...baseProfile, sex: 'female' }, 'iron');
    expect(maleIron?.amount).toBe(8);
    expect(femaleIron?.amount).toBe(18);
  });

  it('drops female iron RDA to match male at the 51+ bracket (post-menopausal)', () => {
    const female50 = getMicronutrientTarget({ ...baseProfile, sex: 'female', age: 50 }, 'iron');
    const female51 = getMicronutrientTarget({ ...baseProfile, sex: 'female', age: 51 }, 'iron');
    expect(female50?.amount).toBe(18);
    expect(female51?.amount).toBe(8);
  });

  it('raises calcium RDA for females at 51+ but not for males until 71+', () => {
    const maleCalcium60 = getMicronutrientTarget({ ...baseProfile, age: 60 }, 'calcium');
    const femaleCalcium60 = getMicronutrientTarget({ ...baseProfile, sex: 'female', age: 60 }, 'calcium');
    expect(maleCalcium60?.amount).toBe(1000);
    expect(femaleCalcium60?.amount).toBe(1200);

    const maleCalcium75 = getMicronutrientTarget({ ...baseProfile, age: 75 }, 'calcium');
    expect(maleCalcium75?.amount).toBe(1200);
  });

  it('raises vitamin D RDA to 20mcg only at the 71+ bracket', () => {
    const vitD70 = getMicronutrientTarget({ ...baseProfile, age: 70 }, 'vitamin_d');
    const vitD71 = getMicronutrientTarget({ ...baseProfile, age: 71 }, 'vitamin_d');
    expect(vitD70?.amount).toBe(15);
    expect(vitD71?.amount).toBe(20);
  });

  it('lowers sodium AI at 51 and again at 71', () => {
    expect(getMicronutrientTarget({ ...baseProfile, age: 40 }, 'sodium')?.amount).toBe(1500);
    expect(getMicronutrientTarget({ ...baseProfile, age: 60 }, 'sodium')?.amount).toBe(1300);
    expect(getMicronutrientTarget({ ...baseProfile, age: 80 }, 'sodium')?.amount).toBe(1200);
  });

  it('returns a full 20-nutrient set for every seeded bracket', () => {
    const targets = getAllMicronutrientTargets(baseProfile);
    expect(Object.keys(targets)).toHaveLength(20);
  });

  it('returns an empty object for an age below the youngest seeded bracket', () => {
    expect(getAllMicronutrientTargets({ ...baseProfile, age: 5 })).toEqual({});
  });
});

import { BODY_FAT_PERCENT, estimateLeanMassKg } from '../bodyComposition';

describe('BODY_FAT_PERCENT', () => {
  it('rises with each category, for both sexes', () => {
    for (const sex of ['male', 'female'] as const) {
      const values = ['very_lean', 'lean', 'average', 'soft', 'higher'].map(
        (c) => BODY_FAT_PERCENT[sex][c as keyof (typeof BODY_FAT_PERCENT)['male']],
      );
      expect([...values].sort((a, b) => a - b)).toEqual(values);
    }
  });

  it('places women higher than men in every category (essential fat differs by sex)', () => {
    for (const category of Object.keys(BODY_FAT_PERCENT.male) as (keyof (typeof BODY_FAT_PERCENT)['male'])[]) {
      expect(BODY_FAT_PERCENT.female[category]).toBeGreaterThan(BODY_FAT_PERCENT.male[category]);
    }
  });
});

describe('estimateLeanMassKg', () => {
  it('subtracts the category body fat % from total weight', () => {
    expect(estimateLeanMassKg(100, 'male', 'average')).toBeCloseTo(81, 5); // 19%
    expect(estimateLeanMassKg(100, 'female', 'higher')).toBeCloseTo(62, 5); // 38%
  });
});

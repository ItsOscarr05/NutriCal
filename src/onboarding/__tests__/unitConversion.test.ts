import { cmToFeetInches, feetInchesToCm, kgToLb, lbToKg } from '../unitConversion';

describe('height conversions', () => {
  it('converts 180cm to approximately 5\'11"', () => {
    expect(cmToFeetInches(180)).toEqual({ feet: 5, inches: 11 });
  });

  it('round-trips feet/inches -> cm -> feet/inches', () => {
    const cm = feetInchesToCm(5, 10);
    expect(cmToFeetInches(cm)).toEqual({ feet: 5, inches: 10 });
  });

  it('rolls inches over into an extra foot instead of showing 12 inches', () => {
    // 71.6 inches -> feet=5, raw inches=round(11.6)=12 -> should correct to 6'0"
    const cm = 71.6 * 2.54;
    const { feet, inches } = cmToFeetInches(cm);
    expect(inches).toBeLessThan(12);
    expect(feet).toBe(6);
    expect(inches).toBe(0);
  });
});

describe('weight conversions', () => {
  it('converts kg to lb using the standard factor', () => {
    expect(kgToLb(80)).toBeCloseTo(176.4, 1);
  });

  it('converts lb to kg using the standard factor', () => {
    expect(lbToKg(176.4)).toBeCloseTo(80, 0);
  });

  it('round-trips kg -> lb -> kg within rounding tolerance', () => {
    const lb = kgToLb(70);
    expect(lbToKg(lb)).toBeCloseTo(70, 0);
  });
});

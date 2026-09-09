import {
  isValidAge,
  isValidHeightCm,
  isValidWeightKg,
  MAX_HEIGHT_CM,
  MAX_SUPPORTED_AGE,
  MAX_WEIGHT_KG,
  MIN_HEIGHT_CM,
  MIN_SUPPORTED_AGE,
  MIN_WEIGHT_KG,
} from '../validation';

describe('isValidAge', () => {
  it('accepts the supported age range boundaries', () => {
    expect(isValidAge(MIN_SUPPORTED_AGE)).toBe(true);
    expect(isValidAge(MAX_SUPPORTED_AGE)).toBe(true);
  });

  it('rejects ages outside the supported range', () => {
    expect(isValidAge(MIN_SUPPORTED_AGE - 1)).toBe(false);
    expect(isValidAge(MAX_SUPPORTED_AGE + 1)).toBe(false);
  });

  it('rejects non-finite input', () => {
    expect(isValidAge(NaN)).toBe(false);
    expect(isValidAge(Infinity)).toBe(false);
  });
});

describe('isValidHeightCm', () => {
  it('accepts the boundary values', () => {
    expect(isValidHeightCm(MIN_HEIGHT_CM)).toBe(true);
    expect(isValidHeightCm(MAX_HEIGHT_CM)).toBe(true);
  });

  it('rejects out-of-range and non-finite values', () => {
    expect(isValidHeightCm(MIN_HEIGHT_CM - 1)).toBe(false);
    expect(isValidHeightCm(MAX_HEIGHT_CM + 1)).toBe(false);
    expect(isValidHeightCm(NaN)).toBe(false);
  });
});

describe('isValidWeightKg', () => {
  it('accepts the boundary values', () => {
    expect(isValidWeightKg(MIN_WEIGHT_KG)).toBe(true);
    expect(isValidWeightKg(MAX_WEIGHT_KG)).toBe(true);
  });

  it('rejects out-of-range and non-finite values', () => {
    expect(isValidWeightKg(0)).toBe(false);
    expect(isValidWeightKg(MAX_WEIGHT_KG + 1)).toBe(false);
    expect(isValidWeightKg(Infinity)).toBe(false);
  });
});

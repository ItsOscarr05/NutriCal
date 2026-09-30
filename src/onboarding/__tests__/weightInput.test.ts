import { convertWeightText, parseWeightInput, sanitizeWeightText, WEIGHT_INPUT_MAX_LENGTH } from '../weightInput';
import { MAX_WEIGHT_KG, MIN_WEIGHT_KG } from '../validation';
import { kgToLb } from '../unitConversion';

describe('sanitizeWeightText', () => {
  it('keeps only digits', () => {
    expect(sanitizeWeightText('1a50 ')).toBe('150');
    expect(sanitizeWeightText('-70.5')).toBe('705');
  });

  it('caps the length', () => {
    expect(sanitizeWeightText('12345')).toHaveLength(WEIGHT_INPUT_MAX_LENGTH);
  });
});

describe('parseWeightInput', () => {
  it('parses metric kilograms within the supported range', () => {
    expect(parseWeightInput('70', 'metric')).toBe(70);
    expect(parseWeightInput(String(MIN_WEIGHT_KG), 'metric')).toBe(MIN_WEIGHT_KG);
    expect(parseWeightInput(String(MAX_WEIGHT_KG), 'metric')).toBe(MAX_WEIGHT_KG);
  });

  it('parses imperial pounds into kilograms', () => {
    const kg = parseWeightInput('150', 'imperial');
    expect(kg).not.toBeNull();
    expect(kg).toBeGreaterThan(65);
    expect(kg).toBeLessThan(70);
  });

  it('returns null for empty or non-numeric text', () => {
    expect(parseWeightInput('', 'metric')).toBeNull();
    expect(parseWeightInput('abc', 'imperial')).toBeNull();
  });

  it('returns null outside the supported range', () => {
    expect(parseWeightInput(String(MIN_WEIGHT_KG - 1), 'metric')).toBeNull();
    expect(parseWeightInput(String(MAX_WEIGHT_KG + 1), 'metric')).toBeNull();
    expect(parseWeightInput('0', 'imperial')).toBeNull();
  });
});

describe('convertWeightText', () => {
  it('converts a valid imperial entry to rounded kilograms', () => {
    expect(convertWeightText('150', 'imperial', 'metric')).toBe(String(Math.round(parseWeightInput('150', 'imperial')!)));
  });

  it('converts a valid metric entry to rounded pounds', () => {
    expect(convertWeightText('70', 'metric', 'imperial')).toBe(String(Math.round(kgToLb(70))));
  });

  it('leaves incomplete text unchanged', () => {
    expect(convertWeightText('', 'imperial', 'metric')).toBe('');
    expect(convertWeightText('1', 'metric', 'imperial')).toBe('1');
  });
});

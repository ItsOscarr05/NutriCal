import { AGE_INPUT_MAX_LENGTH, parseAgeInput, sanitizeAgeText } from '../ageInput';
import { MAX_SUPPORTED_AGE, MIN_SUPPORTED_AGE } from '../validation';

describe('sanitizeAgeText', () => {
  it('keeps only digits', () => {
    expect(sanitizeAgeText('2a8 ')).toBe('28');
    expect(sanitizeAgeText('-30.5')).toBe('305');
  });

  it('caps the length', () => {
    expect(sanitizeAgeText('12345')).toHaveLength(AGE_INPUT_MAX_LENGTH);
  });
});

describe('parseAgeInput', () => {
  it('parses whole-year ages within the supported range', () => {
    expect(parseAgeInput('28')).toBe(28);
    expect(parseAgeInput(String(MIN_SUPPORTED_AGE))).toBe(MIN_SUPPORTED_AGE);
    expect(parseAgeInput(String(MAX_SUPPORTED_AGE))).toBe(MAX_SUPPORTED_AGE);
  });

  it('returns null for empty or non-numeric text', () => {
    expect(parseAgeInput('')).toBeNull();
    expect(parseAgeInput('abc')).toBeNull();
    expect(parseAgeInput('2.5')).toBeNull();
  });

  it('returns null outside the supported range', () => {
    expect(parseAgeInput(String(MIN_SUPPORTED_AGE - 1))).toBeNull();
    expect(parseAgeInput(String(MAX_SUPPORTED_AGE + 1))).toBeNull();
    expect(parseAgeInput('0')).toBeNull();
  });
});

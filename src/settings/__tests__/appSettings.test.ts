import { AppSettings, DEFAULT_APP_SETTINGS, isValidAppSettings } from '../appSettings';

const validSettings: AppSettings = { units: 'metric', appearance: 'dark' };

describe('DEFAULT_APP_SETTINGS', () => {
  it('matches today\'s de-facto behavior (imperial onboarding, system-following theme)', () => {
    expect(DEFAULT_APP_SETTINGS).toEqual({ units: 'imperial', appearance: 'system' });
  });
});

describe('isValidAppSettings', () => {
  it('accepts a well-formed settings object', () => {
    expect(isValidAppSettings(validSettings)).toBe(true);
  });

  it('accepts the default settings object', () => {
    expect(isValidAppSettings(DEFAULT_APP_SETTINGS)).toBe(true);
  });

  it.each([
    ['null', null],
    ['a string', 'not an object'],
    ['an invalid units value', { ...validSettings, units: 'furlongs' }],
    ['an invalid appearance value', { ...validSettings, appearance: 'sepia' }],
    ['a missing units field', (() => {
      const { units, ...rest } = validSettings;
      return rest;
    })()],
    ['a missing appearance field', (() => {
      const { appearance, ...rest } = validSettings;
      return rest;
    })()],
  ])('rejects %s', (_label, value) => {
    expect(isValidAppSettings(value)).toBe(false);
  });
});

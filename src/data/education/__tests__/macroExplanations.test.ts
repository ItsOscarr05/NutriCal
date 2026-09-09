import { Goal } from '../../../types/profile';
import { getMacroExplanation, MACRO_EXPLANATIONS, MACRO_KEYS, MacroKey } from '../macroExplanations';

const ALL_GOALS: Goal[] = ['maintain', 'lose_weight', 'gain_weight', 'build_muscle'];

describe('macroExplanations content (PRD §8.4, §8.5)', () => {
  it.each(MACRO_KEYS)('has non-empty displayName, what, tooLittle, and tooMuch for %s', (macro) => {
    const entry = getMacroExplanation(macro);
    expect(entry.displayName.trim().length).toBeGreaterThan(0);
    expect(entry.what.trim().length).toBeGreaterThan(0);
    expect(entry.tooLittle.trim().length).toBeGreaterThan(0);
    expect(entry.tooMuch.trim().length).toBeGreaterThan(0);
  });

  it.each(MACRO_KEYS)('has a non-empty whyByGoal line for every Goal for %s', (macro) => {
    const entry = getMacroExplanation(macro);
    for (const goal of ALL_GOALS) {
      expect(entry.whyByGoal[goal].trim().length).toBeGreaterThan(0);
    }
  });

  it('covers exactly the three free-tier macros', () => {
    expect(MACRO_KEYS.sort()).toEqual(['carbs', 'fat', 'protein']);
    expect(Object.keys(MACRO_EXPLANATIONS).sort()).toEqual(['carbs', 'fat', 'protein']);
  });

  it('getMacroExplanation returns the matching entry for each key', () => {
    const macros: MacroKey[] = ['protein', 'carbs', 'fat'];
    for (const macro of macros) {
      expect(getMacroExplanation(macro)).toBe(MACRO_EXPLANATIONS[macro]);
    }
  });

  it('avoids clinical-sounding colons/units in displayName (plain language, PRD §11.1)', () => {
    for (const macro of MACRO_KEYS) {
      expect(getMacroExplanation(macro).displayName).not.toMatch(/[0-9]/);
    }
  });
});

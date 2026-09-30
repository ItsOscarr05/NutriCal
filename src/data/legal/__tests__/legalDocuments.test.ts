import { LEGAL_KINDS, getLegalDocument } from '../legalDocuments';

describe('legal documents', () => {
  it.each(LEGAL_KINDS)('%s has a title, effective date, intro, and at least one section', (kind) => {
    const doc = getLegalDocument(kind);
    expect(doc.title.trim().length).toBeGreaterThan(0);
    expect(doc.effectiveDate.trim().length).toBeGreaterThan(0);
    expect(doc.intro.trim().length).toBeGreaterThan(0);
    expect(doc.sections.length).toBeGreaterThan(0);
  });

  it.each(LEGAL_KINDS)('%s sections all have a heading and body', (kind) => {
    for (const section of getLegalDocument(kind).sections) {
      expect(section.heading.trim().length).toBeGreaterThan(0);
      expect(section.body.trim().length).toBeGreaterThan(0);
    }
  });

  it('covers both privacy and terms', () => {
    expect(LEGAL_KINDS.sort()).toEqual(['privacy', 'terms']);
  });
});

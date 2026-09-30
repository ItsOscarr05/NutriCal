export type LegalKind = 'privacy' | 'terms';

export interface LegalSection {
  heading: string;
  body: string;
}

export interface LegalDocument {
  title: string;
  effectiveDate: string;
  intro: string;
  sections: LegalSection[];
}

/** Shown in-app and in the document header. Update when the copy is revised. */
export const LEGAL_EFFECTIVE_DATE = 'September 30, 2026';

const PRIVACY_POLICY: LegalDocument = {
  title: 'Privacy Policy',
  effectiveDate: LEGAL_EFFECTIVE_DATE,
  intro:
    'This Privacy Policy describes information stored by the NutriCal mobile application. “We” means the developer of NutriCal. This version of the application does not operate user accounts or a server that receives your profile.',
  sections: [
    {
      heading: 'Information stored',
      body: 'Upon completing setup, NutriCal stores on this device: sex, age, height, weight, activity level, goal, and the time the profile was last saved; unit and appearance preferences; and, if applicable, a timestamp recording dismissal of the in-app change reminder.',
    },
    {
      heading: 'Purpose',
      body: 'That information is used solely to calculate and display nutrient targets on this device. We do not sell it or use it for advertising.',
    },
    {
      heading: 'Information not collected',
      body: 'We do not request your name, contact details, payment information, or location. We do not operate analytics or advertising that transmits your profile to us.',
    },
    {
      heading: 'Disclosure',
      body: 'Your profile is not uploaded to NutriCal. If you use Share, the operating system transmits only the content you elect to share, to the destination you select. Apple, Google, and the device operating system may collect information under their own policies.',
    },
    {
      heading: 'Retention',
      body: 'Data remain on the device until you delete them or uninstall the application. “Delete my data” permanently removes the profile and reminder timestamp from this device. It does not reset unit or appearance preferences. NutriCal retains no copy from which a deleted profile can be restored.',
    },
    {
      heading: 'Security',
      body: 'Protection of locally stored data depends on the security of your device and any backups you enable. We cannot access your profile remotely.',
    },
    {
      heading: 'Children',
      body: 'The application accepts ages 9 and older. Users under 13 should use NutriCal only with a parent or guardian.',
    },
    {
      heading: 'Changes',
      body: 'We may revise this Policy. The effective date will be updated accordingly. Continued use of the application constitutes acceptance of the revised Policy.',
    },
    {
      heading: 'Contact',
      body: 'There is no in-app support address. When NutriCal is listed on an app store, use the developer contact provided on that listing.',
    },
  ],
};

const TERMS_OF_SERVICE: LegalDocument = {
  title: 'Terms of Service',
  effectiveDate: LEGAL_EFFECTIVE_DATE,
  intro:
    'These Terms of Service govern your use of the NutriCal mobile application. By installing or using NutriCal, you agree to these Terms and the Privacy Policy. If you do not agree, do not use the application.',
  sections: [
    {
      heading: 'The application',
      body: 'NutriCal estimates daily calorie and nutrient targets from information you enter, using formulas and reference tables bundled in the application. It does not provide accounts, cloud storage, or food logging.',
    },
    {
      heading: 'Eligibility',
      body: 'You represent that you have capacity to enter this agreement. The application may record ages 9 and older. Use by persons under 13 shall be supervised by a parent or guardian.',
    },
    {
      heading: 'No medical advice',
      body: 'NutriCal is a wellness tool, not a medical device. It does not diagnose, treat, or prevent any condition. Estimates are not a substitute for professional advice. Do not rely on the application in a medical emergency.',
    },
    {
      heading: 'License',
      body: 'We grant you a personal, non-exclusive, non-transferable, revocable license to use NutriCal on devices you control, for non-commercial purposes. All rights in the application remain with us and our licensors.',
    },
    {
      heading: 'Local data',
      body: 'Profile data are stored on this device as described in the Privacy Policy. We are not responsible for loss of local data.',
    },
    {
      heading: 'Disclaimer of warranties',
      body: 'The application is provided “as is,” without warranties of any kind, express or implied, including merchantability and fitness for a particular purpose, to the maximum extent permitted by law.',
    },
    {
      heading: 'Limitation of liability',
      body: 'To the maximum extent permitted by law, we shall not be liable for indirect, incidental, or consequential damages, or for loss of data or health outcomes, arising from use of the application. Our aggregate liability shall not exceed amounts, if any, you paid to us for NutriCal. Mandatory consumer rights are not excluded.',
    },
    {
      heading: 'Changes',
      body: 'We may modify these Terms or discontinue the application. You may stop using NutriCal by uninstalling it. Disclaimers and limitations of liability survive termination.',
    },
    {
      heading: 'General',
      body: 'These Terms are governed by the laws of your place of residence, without prejudice to mandatory consumer protections. Together with the Privacy Policy, they constitute the entire agreement concerning NutriCal. If any provision is unenforceable, the remainder remains in effect.',
    },
    {
      heading: 'Contact',
      body: 'There is no in-app support address. When NutriCal is listed on an app store, use the developer contact provided on that listing.',
    },
  ],
};

const DOCUMENTS: Record<LegalKind, LegalDocument> = {
  privacy: PRIVACY_POLICY,
  terms: TERMS_OF_SERVICE,
};

export function getLegalDocument(kind: LegalKind): LegalDocument {
  return DOCUMENTS[kind];
}

export const LEGAL_KINDS: LegalKind[] = ['privacy', 'terms'];

/**
 * Published sources behind NutriCal's formulas and defaults, shown on the
 * Science tab for transparency. Every URL here was checked to resolve when
 * added — re-check any you add or change (DOIs via https://doi.org/).
 */
export interface Reference {
  title: string;
  source: string;
  /** Omitted for living web resources that have no fixed publication year. */
  year?: number;
  url: string;
  usedFor: string;
}

export const REFERENCES: Reference[] = [
  {
    title: 'A new predictive equation for resting energy expenditure in healthy individuals',
    source: 'Mifflin et al., American Journal of Clinical Nutrition',
    year: 1990,
    url: 'https://doi.org/10.1093/ajcn/51.2.241',
    usedFor: 'Your basal metabolic rate (BMR) equation.',
  },
  {
    title: 'Comparison of predictive equations for resting metabolic rate in healthy nonobese and obese adults',
    source: 'Frankenfield et al., Journal of the American Dietetic Association',
    year: 2005,
    url: 'https://doi.org/10.1016/j.jada.2005.02.005',
    usedFor: 'Why Mifflin-St Jeor was chosen over other BMR equations.',
  },
  {
    title: 'Dietary Reference Intakes for Energy, Carbohydrate, Fiber, Fat, Fatty Acids, Cholesterol, Protein, and Amino Acids',
    source: 'Institute of Medicine (National Academies)',
    year: 2005,
    url: 'https://nap.nationalacademies.org/catalog/10490',
    usedFor: 'Activity multipliers, the 0.8 g/kg protein minimum, the 130 g carb minimum, and fat ranges.',
  },
  {
    title: 'Nutrition and Athletic Performance (joint position statement)',
    source: 'Academy of Nutrition and Dietetics, Dietitians of Canada & ACSM',
    year: 2016,
    url: 'https://doi.org/10.1016/j.jand.2015.12.006',
    usedFor: 'Carbs scaled to activity level and protein ranges for active people.',
  },
  {
    title: 'Carbohydrates for training and competition',
    source: 'Burke et al., Journal of Sports Sciences',
    year: 2011,
    url: 'https://doi.org/10.1080/02640414.2011.585473',
    usedFor: 'Carb grams per kilogram for each activity level.',
  },
  {
    title: 'International Society of Sports Nutrition position stand: protein and exercise',
    source: 'Jäger et al., Journal of the International Society of Sports Nutrition',
    year: 2017,
    url: 'https://doi.org/10.1186/s12970-017-0177-8',
    usedFor: 'Protein ranges by goal and spreading protein across meals.',
  },
  {
    title: 'Protein supplementation and resistance training-induced gains in muscle mass and strength (meta-analysis)',
    source: 'Morton et al., British Journal of Sports Medicine',
    year: 2018,
    url: 'https://doi.org/10.1136/bjsports-2017-097608',
    usedFor: 'The protein level beyond which extra protein stops adding muscle.',
  },
  {
    title: 'Evidence-based recommendations for natural bodybuilding contest preparation',
    source: 'Helms et al., Journal of the International Society of Sports Nutrition',
    year: 2014,
    url: 'https://doi.org/10.1186/1550-2783-11-20',
    usedFor: 'Higher protein while losing weight and the lean-mass protein rule.',
  },
  {
    title: 'How much protein can the body use in a single meal for muscle-building?',
    source: 'Schoenfeld & Aragon, Journal of the International Society of Sports Nutrition',
    year: 2018,
    url: 'https://doi.org/10.1186/s12970-018-0215-1',
    usedFor: 'The protein-per-meal tip (about 0.4 g/kg per meal).',
  },
  {
    title: 'Nutrition recommendations for bodybuilders in the off-season',
    source: 'Iraki et al., Sports',
    year: 2019,
    url: 'https://doi.org/10.3390/sports7070154',
    usedFor: 'Muscle-building surplus size and fat minimums.',
  },
  {
    title: 'Managing Overweight and Obesity in Adults: Systematic Evidence Review from the Obesity Expert Panel',
    source: 'National Heart, Lung, and Blood Institute (NIH)',
    year: 2013,
    url: 'https://www.nhlbi.nih.gov/health-topics/managing-overweight-obesity-in-adults',
    usedFor: 'Moderate weight-loss deficits and minimum calorie floors.',
  },
  {
    title: 'Percent Body Fat Calculator & norms chart',
    source: 'American Council on Exercise',
    url: 'https://www.acefitness.org/resources/everyone/tools-calculators/percent-body-fat-calculator/',
    usedFor: 'The body fat ranges behind each body fat estimate card.',
  },
  {
    title: 'Nutrient Recommendations and Databases (DRI tables)',
    source: 'NIH Office of Dietary Supplements',
    url: 'https://ods.od.nih.gov/HealthInformation/nutrientrecommendations.aspx',
    usedFor: 'Vitamin and mineral targets by age and sex.',
  },
];

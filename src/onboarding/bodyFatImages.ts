import { ImageSourcePropType } from 'react-native';
import { BodyFatCategory, Sex } from '../types/profile';

/** Illustrated body fat estimate cards (`assets/illustrations/body-fat/`). */
export const BODY_FAT_IMAGES: Record<Sex, Record<BodyFatCategory, ImageSourcePropType>> = {
  male: {
    very_lean: require('../../assets/illustrations/body-fat/male-very_lean.png'),
    lean: require('../../assets/illustrations/body-fat/male-lean.png'),
    average: require('../../assets/illustrations/body-fat/male-average.png'),
    soft: require('../../assets/illustrations/body-fat/male-soft.png'),
    higher: require('../../assets/illustrations/body-fat/male-higher.png'),
  },
  female: {
    very_lean: require('../../assets/illustrations/body-fat/female-very_lean.png'),
    lean: require('../../assets/illustrations/body-fat/female-lean.png'),
    average: require('../../assets/illustrations/body-fat/female-average.png'),
    soft: require('../../assets/illustrations/body-fat/female-soft.png'),
    higher: require('../../assets/illustrations/body-fat/female-higher.png'),
  },
};

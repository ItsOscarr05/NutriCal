import { Image, ImageStyle, StyleProp } from 'react-native';

const LOGO = require('../../assets/logo.png');

interface LogoProps {
  size?: number;
  style?: StyleProp<ImageStyle>;
}

/**
 * The NutriCal brand mark (isometric calculator with sprouting leaves).
 * The app's only brand character — used on Welcome, Settings, `AppHeader`,
 * and the Home/Science/Profile/Metabolic Forecast cards. The same artwork is also the Expo app
 * icon / splash / favicon under `assets/`.
 */
export function Logo({ size = 120, style }: LogoProps) {
  return (
    <Image
      source={LOGO}
      style={[{ width: size, height: size }, style]}
      resizeMode="contain"
      accessibilityIgnoresInvertColors
      accessibilityLabel="NutriCal logo"
    />
  );
}

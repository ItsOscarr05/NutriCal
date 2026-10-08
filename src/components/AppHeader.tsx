import { MaterialIcons } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/types';
import { useAppSettings } from '../settings/AppSettingsContext';
import { darkTheme, radii, spacing, useTheme } from '../theme';
import { Logo } from './Logo';

/**
 * Shared top bar for the main tabs (v2 Stitch redesign): brand mark,
 * "Science-backed" pill, a light/dark toggle, and the Settings entry
 * point. The mockup's streak counter and avatar photo are deliberately
 * left out — the app has no logging or account data behind them.
 */
export function AppHeader() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { setAppearance } = useAppSettings();
  const isDark = theme === darkTheme;

  return (
    <View style={[styles.bar, { paddingTop: insets.top, backgroundColor: theme.background, borderBottomColor: theme.surfaceContainer }]}>
      <View style={styles.row}>
        <View style={styles.brand}>
          <Logo size={32} />
          <Text style={[styles.brandName, { color: theme.textPrimary }]}>NutriCal</Text>
          <View style={[styles.pill, { backgroundColor: theme.accentFixed }]}>
            <View style={[styles.pillDot, { backgroundColor: theme.accent }]} />
            <Text style={[styles.pillText, { color: theme.onAccentFixed }]}>Science-backed</Text>
          </View>
        </View>
        <View style={styles.actions}>
          <IconButton
            icon={isDark ? 'light-mode' : 'dark-mode'}
            label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            onPress={() => setAppearance(isDark ? 'light' : 'dark')}
          />
          <IconButton icon="settings" label="Settings" onPress={() => navigation.navigate('Settings')} />
        </View>
      </View>
    </View>
  );
}

function IconButton({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={4}
      style={({ pressed }) => [styles.iconButton, { backgroundColor: theme.surfaceContainerLow }, pressed && styles.pressed]}
    >
      <MaterialIcons name={icon} size={20} color={theme.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: { borderBottomWidth: StyleSheet.hairlineWidth },
  row: { height: 60, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 },
  brandName: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing.xs + 2, paddingVertical: 2, borderRadius: radii.pill },
  pillDot: { width: 6, height: 6, borderRadius: 3 },
  pillText: { fontSize: 10, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: spacing.xs },
  iconButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.6 },
});

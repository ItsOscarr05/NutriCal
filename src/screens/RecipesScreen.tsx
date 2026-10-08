import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader } from '../components/AppHeader';
import { FadeInView } from '../components/FadeInView';
import { Recipe, RECIPES } from '../data/recipes/recipes';
import { calculateNutrientTargets } from '../engine';
import { useProfile } from '../profile/ProfileContext';
import { buildGroceryList, groceryListToText } from '../recipes/groceryList';
import { HIGH_PROTEIN_GRAMS, mealTarget, QUICK_MINUTES, rankRecipes, RecipeFilter } from '../recipes/recipeMatching';
import { loadGrocerySelection, saveGrocerySelection } from '../storage/grocerySelectionStorage';
import { radii, spacing, ThemeColors, useTheme } from '../theme';

const FILTERS: { key: RecipeFilter; label: string }[] = [
  { key: 'all', label: 'All meals' },
  { key: 'high_protein', label: `High protein (${HIGH_PROTEIN_GRAMS}g+)` },
  { key: 'quick', label: `Quick (<${QUICK_MINUTES} min)` },
  { key: 'plant', label: 'Plant-forward' },
];

/**
 * The `Recipes` tab (v2 Stitch "Target-Matched Meals" mockup): a small,
 * hand-written local recipe set (`src/data/recipes`) ranked by how well
 * one serving fits one meal's share of the user's real targets
 * (`src/recipes/recipeMatching.ts`), with search, filters, inline steps,
 * and a grocery checklist saved on-device and shareable via the native
 * share sheet. No food API or backend.
 *
 * Omitted from the mockup: remote food photos (emoji tiles instead —
 * offline app), bookmarks, and micronutrient tags/filters (micros stay
 * premium-gated, PRD §7, §8.4).
 */
export function RecipesScreen() {
  const theme = useTheme();
  const { profile } = useProfile();
  const [filter, setFilter] = useState<RecipeFilter>('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showGrocery, setShowGrocery] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadGrocerySelection().then((ids) => {
      if (!cancelled) setSelected(ids.filter((id) => RECIPES.some((r) => r.id === id)));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const targets = useMemo(() => (profile ? calculateNutrientTargets(profile) : null), [profile]);
  const ranked = useMemo(() => (targets ? rankRecipes(RECIPES, targets, filter, query) : []), [targets, filter, query]);

  if (!profile || !targets) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.textPrimary }}>No profile found yet.</Text>
      </View>
    );
  }

  const meal = mealTarget(targets);
  const [star, ...rest] = ranked;

  const toggleSelected = (id: string) => {
    const next = selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id];
    setSelected(next);
    void saveGrocerySelection(next);
  };
  const toggleExpanded = (id: string) => setExpanded((current) => (current === id ? null : id));

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <AppHeader />
      <ScrollView contentContainerStyle={[styles.content, selected.length > 0 && styles.contentWithBar]} keyboardShouldPersistTaps="handled">
        <View>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: theme.textPrimary }]}>Target-Matched Meals</Text>
            <View style={[styles.pill, { backgroundColor: theme.accentFixed }]}>
              <MaterialIcons name="eco" size={14} color={theme.onAccentFixed} />
              <Text style={[styles.pillText, { color: theme.onAccentFixed }]}>Target fit</Text>
            </View>
          </View>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Real-food meal ideas ranked against your {targets.calorieTarget.toLocaleString()} kcal day.
          </Text>
        </View>

        <View style={[styles.search, { backgroundColor: theme.surfaceContainerLow }]}>
          <MaterialIcons name="search" size={20} color={theme.textSecondary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search meals or ingredients"
            placeholderTextColor={theme.textSecondary}
            accessibilityLabel="Search recipes"
            returnKeyType="search"
            style={[styles.searchInput, { color: theme.textPrimary }]}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} accessibilityRole="button" accessibilityLabel="Clear search" hitSlop={8}>
              <MaterialIcons name="close" size={18} color={theme.textSecondary} />
            </Pressable>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {FILTERS.map((f) => {
            const active = f.key === filter;
            return (
              <Pressable
                key={f.key}
                onPress={() => setFilter(f.key)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={[styles.filterChip, { backgroundColor: active ? theme.buttonFill : theme.surfaceContainer }]}
              >
                <Text style={[styles.filterText, { color: active ? theme.onButtonFill : theme.textSecondary }]}>{f.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={[styles.matchBanner, { backgroundColor: theme.surface }]}>
          <View style={[styles.matchIcon, { backgroundColor: theme.accentFixed }]}>
            <MaterialIcons name="auto-awesome" size={20} color={theme.onAccentFixed} />
          </View>
          <View style={styles.flexShrink}>
            <Text style={[styles.matchTitle, { color: theme.textPrimary }]}>Target smart match</Text>
            <Text style={[styles.matchBody, { color: theme.textSecondary }]}>
              Each serving is scored against about a quarter of your day:{' '}
              <Text style={[styles.bold, { color: theme.textPrimary }]}>
                ~{meal.calories} kcal, {meal.protein}g protein, {meal.carbs}g carbs, {meal.fat}g fat
              </Text>
              .
            </Text>
          </View>
        </View>

        {!star ? (
          <View style={[styles.empty, { backgroundColor: theme.surfaceContainerLow }]}>
            <MaterialIcons name="search-off" size={28} color={theme.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No meals match that search. Try another ingredient or filter.</Text>
          </View>
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Today's star match</Text>
              <Text style={[styles.sectionHint, { color: theme.accent }]}>Best fit</Text>
            </View>
            <FadeInView>
              <StarCard
                theme={theme}
                recipe={star.recipe}
                fit={star.fit}
                selected={selected.includes(star.recipe.id)}
                expanded={expanded === star.recipe.id}
                onToggleSelected={() => toggleSelected(star.recipe.id)}
                onToggleExpanded={() => toggleExpanded(star.recipe.id)}
              />
            </FadeInView>

            {rest.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>More matches</Text>
                  <Text style={[styles.sectionHint, { color: theme.textSecondary }]}>{rest.length} more</Text>
                </View>
                {rest.map(({ recipe, fit }, i) => (
                  <FadeInView key={recipe.id} delay={Math.min(i, 5) * 60}>
                    <RecipeRow
                      theme={theme}
                      recipe={recipe}
                      fit={fit}
                      selected={selected.includes(recipe.id)}
                      expanded={expanded === recipe.id}
                      onToggleSelected={() => toggleSelected(recipe.id)}
                      onToggleExpanded={() => toggleExpanded(recipe.id)}
                    />
                  </FadeInView>
                ))}
              </>
            )}
          </>
        )}

        <Text style={[styles.disclaimer, { color: theme.textSecondary }]}>
          Macros are per-serving estimates. Check labels if you track closely or have allergies.
        </Text>
      </ScrollView>

      {selected.length > 0 && (
        <View style={styles.groceryBarWrap} pointerEvents="box-none">
          <Pressable
            onPress={() => setShowGrocery(true)}
            accessibilityRole="button"
            style={({ pressed }) => [styles.groceryBar, { backgroundColor: theme.buttonFill }, pressed && { backgroundColor: theme.buttonFillPressed }]}
          >
            <View style={styles.groceryBarLeft}>
              <MaterialIcons name="shopping-cart" size={20} color={theme.onButtonFill} />
              <Text style={[styles.groceryBarText, { color: theme.onButtonFill }]}>Grocery checklist</Text>
            </View>
            <View style={[styles.groceryCount, { backgroundColor: theme.surface }]}>
              <Text style={[styles.groceryCountText, { color: theme.textPrimary }]}>
                {`${selected.length} ${selected.length === 1 ? 'meal' : 'meals'}`}
              </Text>
              <MaterialIcons name="arrow-forward" size={14} color={theme.textPrimary} />
            </View>
          </Pressable>
        </View>
      )}

      <GrocerySheet theme={theme} visible={showGrocery} selectedIds={selected} onClose={() => setShowGrocery(false)} />
    </View>
  );
}

interface CardProps {
  theme: ThemeColors;
  recipe: Recipe;
  fit: number;
  selected: boolean;
  expanded: boolean;
  onToggleSelected: () => void;
  onToggleExpanded: () => void;
}

function StarCard({ theme, recipe, fit, selected, expanded, onToggleSelected, onToggleExpanded }: CardProps) {
  return (
    <View style={[styles.starCard, { backgroundColor: theme.surface }]}>
      <View style={[styles.starHero, { backgroundColor: theme.accentFixed }]}>
        <Text style={styles.starEmoji}>{recipe.emoji}</Text>
        <View style={[styles.heroBadge, styles.heroBadgeLeft, { backgroundColor: theme.surface }]}>
          <View style={[styles.fitDot, { backgroundColor: theme.accent }]} />
          <Text style={[styles.heroBadgeText, { color: theme.textPrimary }]}>{fit}% target fit</Text>
        </View>
        <View style={[styles.heroBadge, styles.heroBadgeRight, { backgroundColor: theme.surface }]}>
          <MaterialIcons name="schedule" size={14} color={theme.textSecondary} />
          <Text style={[styles.heroBadgeText, { color: theme.textPrimary }]}>
            {recipe.prepMinutes} min · {recipe.difficulty}
          </Text>
        </View>
      </View>
      <View style={styles.starBody}>
        <Text style={[styles.starName, { color: theme.textPrimary }]}>{recipe.name}</Text>
        <Text style={[styles.description, { color: theme.textSecondary }]}>{recipe.description}</Text>
        <View style={styles.capsules}>
          <Capsule label="Calories" value={`${recipe.calories}`} bg={theme.surfaceContainer} fg={theme.textPrimary} />
          <Capsule label="Protein" value={`${recipe.protein}g`} bg={theme.tertiaryFixed} fg={theme.onTertiaryFixed} />
          <Capsule label="Carbs" value={`${recipe.carbs}g`} bg={theme.secondaryFixed} fg={theme.onSecondaryFixed} />
          <Capsule label="Fats" value={`${recipe.fat}g`} bg={theme.accentFixed} fg={theme.onAccentFixed} />
        </View>
        <View style={styles.actionRow}>
          <AddToggle theme={theme} selected={selected} onPress={onToggleSelected} label="Add to grocery list" />
          <Pressable
            onPress={onToggleExpanded}
            accessibilityRole="button"
            accessibilityState={{ expanded }}
            style={({ pressed }) => [styles.stepsButton, { backgroundColor: theme.accentFixed }, pressed && styles.pressed]}
          >
            <Text style={[styles.stepsButtonText, { color: theme.onAccentFixed }]}>{expanded ? 'Hide steps' : 'View steps'}</Text>
            <MaterialIcons name={expanded ? 'expand-less' : 'arrow-forward'} size={16} color={theme.onAccentFixed} />
          </Pressable>
        </View>
        {expanded && <Steps theme={theme} recipe={recipe} />}
      </View>
    </View>
  );
}

function RecipeRow({ theme, recipe, fit, selected, expanded, onToggleSelected, onToggleExpanded }: CardProps) {
  return (
    <View style={[styles.rowCard, { backgroundColor: theme.surface }]}>
      <Pressable
        onPress={onToggleExpanded}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={`${recipe.name}, ${fit}% target fit. ${expanded ? 'Hide' : 'Show'} steps.`}
        style={({ pressed }) => [styles.rowTop, pressed && styles.pressed]}
      >
        <View style={[styles.rowTile, { backgroundColor: theme.surfaceContainerLow }]}>
          <Text style={styles.rowEmoji}>{recipe.emoji}</Text>
          <View style={[styles.rowFit, { backgroundColor: theme.accentFixed }]}>
            <Text style={[styles.rowFitText, { color: theme.onAccentFixed }]}>{fit}%</Text>
          </View>
        </View>
        <View style={styles.flexShrink}>
          <Text style={[styles.rowName, { color: theme.textPrimary }]} numberOfLines={2}>
            {recipe.name}
          </Text>
          <Text style={[styles.description, { color: theme.textSecondary }]} numberOfLines={expanded ? undefined : 2}>
            {recipe.description}
          </Text>
          <View style={styles.rowMeta}>
            <MaterialIcons name="schedule" size={13} color={theme.textSecondary} />
            <Text style={[styles.rowMetaText, { color: theme.textSecondary }]}>{recipe.prepMinutes} min prep</Text>
            {recipe.plantForward && (
              <View style={[styles.tag, { backgroundColor: theme.accentFixed }]}>
                <Text style={[styles.tagText, { color: theme.onAccentFixed }]}>Plant-forward</Text>
              </View>
            )}
          </View>
        </View>
      </Pressable>
      <View style={[styles.rowFooter, { borderTopColor: theme.surfaceContainer }]}>
        <Text style={[styles.rowMacros, { color: theme.textPrimary }]}>
          {recipe.calories} <Text style={{ color: theme.textSecondary }}>kcal</Text>
          {'   '}
          <Text style={{ color: theme.tertiary }}>{recipe.protein}g</Text> <Text style={{ color: theme.textSecondary }}>protein</Text>
          {'   '}
          <Text style={{ color: theme.secondary }}>{recipe.carbs}g</Text> <Text style={{ color: theme.textSecondary }}>carbs</Text>
          {'   '}
          <Text style={{ color: theme.accent }}>{recipe.fat}g</Text> <Text style={{ color: theme.textSecondary }}>fat</Text>
        </Text>
        <AddToggle theme={theme} selected={selected} onPress={onToggleSelected} label="Add" compact />
      </View>
      {expanded && (
        <View style={styles.rowSteps}>
          <Steps theme={theme} recipe={recipe} />
        </View>
      )}
    </View>
  );
}

function Capsule({ label, value, bg, fg }: { label: string; value: string; bg: string; fg: string }) {
  return (
    <View style={[styles.capsule, { backgroundColor: bg }]}>
      <Text style={[styles.capsuleLabel, { color: fg }]}>{label}</Text>
      <Text style={[styles.capsuleValue, { color: fg }]}>{value}</Text>
    </View>
  );
}

function AddToggle({
  theme,
  selected,
  onPress,
  label,
  compact,
}: {
  theme: ThemeColors;
  selected: boolean;
  onPress: () => void;
  label: string;
  compact?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      hitSlop={6}
      style={[styles.addToggle, compact && styles.addToggleCompact]}
    >
      <View
        style={[
          styles.checkbox,
          { borderColor: selected ? theme.accentFill : theme.textSecondary, backgroundColor: selected ? theme.accentFill : 'transparent' },
        ]}
      >
        {selected && <MaterialIcons name="check" size={14} color={theme.onAccentFill} />}
      </View>
      <Text style={[styles.addLabel, { color: theme.textPrimary }]}>{label}</Text>
    </Pressable>
  );
}

function Steps({ theme, recipe }: { theme: ThemeColors; recipe: Recipe }) {
  return (
    <View style={[styles.steps, { backgroundColor: theme.surfaceContainerLow }]}>
      <Text style={[styles.stepsHeading, { color: theme.textPrimary }]}>Ingredients</Text>
      <Text style={[styles.stepText, { color: theme.textSecondary }]}>{recipe.ingredients.map((i) => i.item).join(' • ')}</Text>
      <Text style={[styles.stepsHeading, { color: theme.textPrimary }]}>Steps</Text>
      {recipe.steps.map((step, i) => (
        <View key={i} style={styles.stepRow}>
          <View style={[styles.stepNumber, { backgroundColor: theme.accentFixed }]}>
            <Text style={[styles.stepNumberText, { color: theme.onAccentFixed }]}>{i + 1}</Text>
          </View>
          <Text style={[styles.stepText, styles.flexShrink, { color: theme.textSecondary }]}>{step}</Text>
        </View>
      ))}
    </View>
  );
}

function GrocerySheet({
  theme,
  visible,
  selectedIds,
  onClose,
}: {
  theme: ThemeColors;
  visible: boolean;
  selectedIds: string[];
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const sections = useMemo(() => buildGroceryList(RECIPES, selectedIds), [selectedIds]);
  const [checked, setChecked] = useState<string[]>([]);
  const toggle = (item: string) => setChecked((c) => (c.includes(item) ? c.filter((x) => x !== item) : [...c, item]));

  const handleShare = () => {
    void Share.share({ message: `NutriCal grocery list\n\n${groceryListToText(sections)}` });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.scrim} onPress={onClose} accessibilityLabel="Close grocery checklist" />
      <View style={[styles.sheet, { backgroundColor: theme.surface, paddingBottom: insets.bottom + spacing.md }]}>
        <View style={styles.sheetHeader}>
          <View style={styles.sheetTitleRow}>
            <MaterialIcons name="checklist" size={22} color={theme.accent} />
            <Text style={[styles.sheetTitle, { color: theme.textPrimary }]}>Grocery checklist</Text>
          </View>
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" hitSlop={8}>
            <MaterialIcons name="close" size={22} color={theme.textSecondary} />
          </Pressable>
        </View>
        <Text style={[styles.description, { color: theme.textSecondary }]}>
          {`Everything for your ${selectedIds.length} selected ${selectedIds.length === 1 ? 'meal' : 'meals'}, grouped by store section.`}
        </Text>
        <ScrollView style={styles.sheetList} contentContainerStyle={styles.sheetListContent}>
          {sections.map((section) => (
            <View key={section.group} style={styles.sheetSection}>
              <Text style={[styles.sheetGroup, { color: theme.textSecondary }]}>{section.group}</Text>
              {section.items.map(({ item, recipes }) => {
                const isChecked = checked.includes(item);
                return (
                  <Pressable
                    key={item}
                    onPress={() => toggle(item)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isChecked }}
                    style={[styles.sheetItem, { backgroundColor: theme.surfaceContainerLow }]}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        { borderColor: isChecked ? theme.accentFill : theme.textSecondary, backgroundColor: isChecked ? theme.accentFill : 'transparent' },
                      ]}
                    >
                      {isChecked && <MaterialIcons name="check" size={14} color={theme.onAccentFill} />}
                    </View>
                    <Text style={[styles.sheetItemText, { color: theme.textPrimary }, isChecked && styles.struck]}>{item}</Text>
                    {recipes.length > 1 && <Text style={[styles.sheetItemCount, { color: theme.textSecondary }]}>×{recipes.length} meals</Text>}
                  </Pressable>
                );
              })}
            </View>
          ))}
        </ScrollView>
        <Pressable
          onPress={handleShare}
          accessibilityRole="button"
          style={({ pressed }) => [styles.shareButton, { backgroundColor: theme.buttonFill }, pressed && { backgroundColor: theme.buttonFillPressed }]}
        >
          <MaterialIcons name="ios-share" size={18} color={theme.onButtonFill} />
          <Text style={[styles.shareText, { color: theme.onButtonFill }]}>Share list</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.md + 4, gap: spacing.md, paddingBottom: spacing.xl },
  contentWithBar: { paddingBottom: 96 },
  flexShrink: { flex: 1, minWidth: 0 },
  pressed: { opacity: 0.75 },
  bold: { fontWeight: '800' },

  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  title: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5, flexShrink: 1 },
  subtitle: { fontSize: 13, lineHeight: 19, marginTop: 4 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radii.pill },
  pillText: { fontSize: 11, fontWeight: '800' },

  search: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderRadius: radii.pill, paddingHorizontal: spacing.md, height: 48 },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: 0 },
  filterRow: { gap: spacing.xs + 2, paddingRight: spacing.md },
  filterChip: { paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radii.pill },
  filterText: { fontSize: 13, fontWeight: '700' },

  matchBanner: { flexDirection: 'row', gap: spacing.sm + 4, borderRadius: radii.lg, padding: spacing.md, alignItems: 'flex-start' },
  matchIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  matchTitle: { fontSize: 14, fontWeight: '800' },
  matchBody: { fontSize: 12, lineHeight: 18, marginTop: 2 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingHorizontal: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  sectionHint: { fontSize: 12, fontWeight: '700' },

  empty: { alignItems: 'center', gap: spacing.sm, borderRadius: radii.lg, padding: spacing.lg },
  emptyText: { fontSize: 13, textAlign: 'center' },

  starCard: { borderRadius: radii.lg, overflow: 'hidden' },
  starHero: { height: 170, alignItems: 'center', justifyContent: 'center' },
  starEmoji: { fontSize: 76 },
  heroBadge: { position: 'absolute', top: spacing.sm + 4, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radii.pill },
  heroBadgeLeft: { left: spacing.sm + 4 },
  heroBadgeRight: { right: spacing.sm + 4 },
  heroBadgeText: { fontSize: 11, fontWeight: '800' },
  fitDot: { width: 7, height: 7, borderRadius: 4 },
  starBody: { padding: spacing.md + 4, gap: spacing.sm + 2 },
  starName: { fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  description: { fontSize: 12, lineHeight: 17 },
  capsules: { flexDirection: 'row', gap: spacing.xs + 2 },
  capsule: { flex: 1, alignItems: 'center', borderRadius: radii.md, paddingVertical: spacing.sm },
  capsuleLabel: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.4 },
  capsuleValue: { fontSize: 16, fontWeight: '800', marginTop: 2 },
  actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  stepsButton: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radii.pill },
  stepsButtonText: { fontSize: 12, fontWeight: '800' },

  addToggle: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs + 2, flexShrink: 1 },
  addToggleCompact: { gap: 4 },
  checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  addLabel: { fontSize: 12, fontWeight: '700', flexShrink: 1 },

  steps: { borderRadius: radii.md, padding: spacing.sm + 4, gap: spacing.xs + 2 },
  stepsHeading: { fontSize: 12, fontWeight: '800', marginTop: 2 },
  stepRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  stepNumber: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  stepNumberText: { fontSize: 11, fontWeight: '800' },
  stepText: { fontSize: 12, lineHeight: 18 },

  rowCard: { borderRadius: radii.lg, padding: spacing.sm + 4, gap: spacing.sm },
  rowTop: { flexDirection: 'row', gap: spacing.sm + 4 },
  rowTile: { width: 84, height: 84, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  rowEmoji: { fontSize: 40 },
  rowFit: { position: 'absolute', bottom: 6, left: 6, paddingHorizontal: 6, paddingVertical: 1, borderRadius: radii.pill },
  rowFitText: { fontSize: 10, fontWeight: '800' },
  rowName: { fontSize: 15, fontWeight: '800' },
  rowMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, flexWrap: 'wrap' },
  rowMetaText: { fontSize: 11, fontWeight: '600' },
  tag: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: radii.pill, marginLeft: 4 },
  tagText: { fontSize: 10, fontWeight: '800' },
  rowFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, paddingTop: spacing.sm, gap: spacing.sm },
  rowMacros: { fontSize: 12, fontWeight: '800', flexShrink: 1 },
  rowSteps: { marginTop: 2 },

  disclaimer: { fontSize: 11, textAlign: 'center', paddingHorizontal: spacing.md },

  groceryBarWrap: { position: 'absolute', left: spacing.md, right: spacing.md, bottom: spacing.md },
  groceryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radii.pill,
    paddingLeft: spacing.md + 4,
    paddingRight: spacing.sm,
    height: 56,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  groceryBarLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  groceryBarText: { fontSize: 15, fontWeight: '800' },
  groceryCount: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing.sm + 4, paddingVertical: 6, borderRadius: radii.pill },
  groceryCountText: { fontSize: 12, fontWeight: '800' },

  scrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: { borderTopLeftRadius: radii.lg, borderTopRightRadius: radii.lg, padding: spacing.md + 4, gap: spacing.sm, maxHeight: '80%' },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sheetTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  sheetTitle: { fontSize: 18, fontWeight: '800' },
  sheetList: { flexGrow: 0 },
  sheetListContent: { gap: spacing.md, paddingVertical: spacing.sm },
  sheetSection: { gap: spacing.xs + 2 },
  sheetGroup: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  sheetItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm + 2, borderRadius: radii.md },
  sheetItemText: { flex: 1, fontSize: 14, fontWeight: '600' },
  struck: { textDecorationLine: 'line-through', opacity: 0.6 },
  sheetItemCount: { fontSize: 11 },
  shareButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, height: 50, borderRadius: radii.pill, marginTop: spacing.xs },
  shareText: { fontSize: 15, fontWeight: '800' },
});

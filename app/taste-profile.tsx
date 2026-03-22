import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useRecipes } from '@/components/recipes-provider';
import { DietaryFocus, SpiceLevel, useSettings } from '@/components/settings-provider';

const SPICE_OPTIONS: { key: SpiceLevel; label: string; note: string }[] = [
  { key: 'mild', label: 'Mild', note: 'Comfort-first and less heat' },
  { key: 'medium', label: 'Medium', note: 'Balanced spice and versatility' },
  { key: 'bold', label: 'Bold', note: 'Turn up spice-forward picks' },
];

const DIETARY_OPTIONS: { key: DietaryFocus; label: string; note: string }[] = [
  { key: 'balanced', label: 'Balanced', note: 'A little bit of everything' },
  { key: 'vegetarian', label: 'Vegetarian', note: 'Boost plant-forward recipes' },
  { key: 'high-protein', label: 'High protein', note: 'Favor more filling protein picks' },
];

const CUISINES = ['Korean-inspired', 'Italian-inspired', 'Mexican-inspired', 'Asian-inspired', 'Modern fusion', 'Cafe-style'];

export default function TasteProfileScreen() {
  const insets = useSafeAreaInsets();
  const { tasteProfile } = useRecipes();
  const { settings, theme, setDietaryFocus, setSpiceLevel, togglePreferredCuisine } = useSettings();
  const topCuisine = Object.entries(tasteProfile.cuisines).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Still learning';
  const topTag = Object.entries(tasteProfile.tags).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Exploration';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.appBackground }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 10) + 6 }]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.shell}>
          <Pressable style={[styles.backButton, { backgroundColor: theme.cardBackground, borderColor: theme.border }]} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={20} color="#251712" />
            <Text style={styles.backText}>Back</Text>
          </Pressable>

          <View style={styles.header}>
            <Text style={styles.title}>Taste profile</Text>
            <Text style={styles.subtitle}>Tune the app to your kitchen instincts and let recommendations adapt.</Text>
          </View>

          <View style={[styles.heroCard, { backgroundColor: theme.heroBackground }]}>
            <Text style={[styles.heroEyebrow, { color: theme.heroAccent }]}>Learned profile</Text>
            <Text style={styles.heroTitle}>{topCuisine}</Text>
            <Text style={styles.heroCopy}>Right now your strongest taste signal is {topTag.toLowerCase()}.</Text>
          </View>

          <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <Text style={styles.sectionTitle}>Spice level</Text>
            {SPICE_OPTIONS.map((option, index) => (
              <Pressable
                key={option.key}
                style={[styles.choiceRow, index > 0 && [styles.rowBorder, { borderTopColor: theme.border }]]}
                onPress={() => setSpiceLevel(option.key)}>
                <View style={styles.choiceBody}>
                  <Text style={styles.choiceTitle}>{option.label}</Text>
                  <Text style={styles.choiceSubtitle}>{option.note}</Text>
                </View>
                <View style={[styles.choiceDot, settings.spiceLevel === option.key && { backgroundColor: theme.accent, borderColor: theme.accent }]} />
              </Pressable>
            ))}
          </View>

          <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <Text style={styles.sectionTitle}>Dietary focus</Text>
            {DIETARY_OPTIONS.map((option, index) => (
              <Pressable
                key={option.key}
                style={[styles.choiceRow, index > 0 && [styles.rowBorder, { borderTopColor: theme.border }]]}
                onPress={() => setDietaryFocus(option.key)}>
                <View style={styles.choiceBody}>
                  <Text style={styles.choiceTitle}>{option.label}</Text>
                  <Text style={styles.choiceSubtitle}>{option.note}</Text>
                </View>
                <View style={[styles.choiceDot, settings.dietaryFocus === option.key && { backgroundColor: theme.accent, borderColor: theme.accent }]} />
              </Pressable>
            ))}
          </View>

          <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <Text style={styles.sectionTitle}>Preferred cuisines</Text>
            <View style={styles.cuisineGrid}>
              {CUISINES.map((cuisine) => {
                const selected = settings.preferredCuisines.includes(cuisine);

                return (
                  <Pressable
                    key={cuisine}
                    style={[
                      styles.cuisineChip,
                      {
                        backgroundColor: selected ? theme.accentSoft : theme.appBackground,
                        borderColor: selected ? theme.accent : theme.border,
                      },
                    ]}
                    onPress={() => togglePreferredCuisine(cuisine)}>
                    <Text style={[styles.cuisineChipText, { color: selected ? theme.accent : '#4D4038' }]}>{cuisine}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { paddingHorizontal: 18, paddingBottom: 36, flexGrow: 1 },
  shell: { width: '100%', maxWidth: 460, alignSelf: 'center' },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  backText: { color: '#251712', fontSize: 14, fontWeight: '700' },
  header: { marginTop: 18, marginBottom: 18 },
  title: { color: '#251712', fontSize: 30, fontWeight: '900' },
  subtitle: { marginTop: 8, color: '#6D5D55', fontSize: 14, lineHeight: 20 },
  heroCard: { borderRadius: 30, padding: 20 },
  heroEyebrow: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.4 },
  heroTitle: { marginTop: 8, color: '#FFF6F0', fontSize: 28, fontWeight: '900' },
  heroCopy: { marginTop: 12, color: '#E6D7D1', fontSize: 14, lineHeight: 20 },
  card: { marginTop: 16, borderRadius: 28, borderWidth: 1, padding: 18 },
  sectionTitle: { color: '#241611', fontSize: 21, fontWeight: '900', marginBottom: 10 },
  choiceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 },
  rowBorder: { borderTopWidth: 1 },
  choiceBody: { flex: 1, paddingRight: 12 },
  choiceTitle: { color: '#241611', fontSize: 16, fontWeight: '800' },
  choiceSubtitle: { marginTop: 4, color: '#7B6C63', fontSize: 13, lineHeight: 18 },
  choiceDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#D9C9BC',
    backgroundColor: 'transparent',
  },
  cuisineGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  cuisineChip: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10 },
  cuisineChipText: { fontSize: 13, fontWeight: '700' },
});

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  APP_THEMES,
  type AppLanguage,
  type MeasurementSystem,
  useSettings,
} from '@/components/settings-provider';

const LANGUAGE_OPTIONS: { key: AppLanguage; label: string; note: string }[] = [
  { key: 'en', label: 'English', note: 'Default app copy' },
  { key: 'es', label: 'Spanish', note: 'Useful for bilingual households' },
  { key: 'fr', label: 'French', note: 'Great for recipe-first browsing' },
  { key: 'fil', label: 'Filipino', note: 'Friendly for local kitchen use' },
];

const MEASUREMENT_OPTIONS: { key: MeasurementSystem; label: string; note: string }[] = [
  { key: 'metric', label: 'Metric', note: 'Grams, liters, and Celsius' },
  { key: 'imperial', label: 'Imperial', note: 'Cups, ounces, and Fahrenheit' },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const {
    settings,
    theme,
    setHapticsEnabled,
    setLanguage,
    setMeasurementSystem,
    setPushAlerts,
    setSmartSuggestions,
    setTheme,
  } = useSettings();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.appBackground }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Math.max(insets.top, 10) + 6,
          },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.shell}>
          <Pressable style={[styles.backButton, { backgroundColor: theme.cardBackground, borderColor: theme.border }]} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={20} color="#251712" />
            <Text style={styles.backText}>Back</Text>
          </Pressable>

          <View style={styles.header}>
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.subtitle}>Personalize the app feel, language, and kitchen defaults.</Text>
          </View>

          <View style={[styles.heroCard, { backgroundColor: theme.heroBackground }]}>
            <Text style={[styles.heroEyebrow, { color: theme.heroAccent }]}>Current style</Text>
            <Text style={styles.heroTitle}>{theme.label}</Text>
            <Text style={styles.heroCopy}>
              Your theme updates the app accents and navigation surfaces so Savorly feels more like your space.
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <Text style={styles.sectionTitle}>App theme</Text>
            <View style={styles.themeGrid}>
              {APP_THEMES.map((option) => {
                const isSelected = option.key === settings.theme;

                return (
                  <Pressable
                    key={option.key}
                    style={[
                      styles.themeOption,
                      {
                        backgroundColor: option.appBackground,
                        borderColor: isSelected ? option.accent : option.border,
                      },
                    ]}
                    onPress={() => setTheme(option.key)}>
                    <View style={styles.themeSwatches}>
                      <View style={[styles.themeSwatchLarge, { backgroundColor: option.heroBackground }]} />
                      <View style={[styles.themeSwatchSmall, { backgroundColor: option.accent }]} />
                    </View>
                    <Text style={styles.themeLabel}>{option.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <Text style={styles.sectionTitle}>Language</Text>
            {LANGUAGE_OPTIONS.map((option, index) => (
              <Pressable
                key={option.key}
                style={[styles.choiceRow, index > 0 && styles.rowBorder]}
                onPress={() => setLanguage(option.key)}>
                <View style={styles.choiceBody}>
                  <Text style={styles.choiceTitle}>{option.label}</Text>
                  <Text style={styles.choiceSubtitle}>{option.note}</Text>
                </View>
                <View
                  style={[
                    styles.choiceDot,
                    settings.language === option.key && { backgroundColor: theme.accent, borderColor: theme.accent },
                  ]}
                />
              </Pressable>
            ))}
          </View>

          <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <Text style={styles.sectionTitle}>Cooking defaults</Text>
            {MEASUREMENT_OPTIONS.map((option, index) => (
              <Pressable
                key={option.key}
                style={[styles.choiceRow, index > 0 && styles.rowBorder]}
                onPress={() => setMeasurementSystem(option.key)}>
                <View style={styles.choiceBody}>
                  <Text style={styles.choiceTitle}>{option.label}</Text>
                  <Text style={styles.choiceSubtitle}>{option.note}</Text>
                </View>
                <View
                  style={[
                    styles.choiceDot,
                    settings.measurementSystem === option.key && { backgroundColor: theme.accent, borderColor: theme.accent },
                  ]}
                />
              </Pressable>
            ))}
          </View>

          <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <Text style={styles.sectionTitle}>Experience</Text>

            <View style={styles.preferenceRow}>
              <View style={styles.preferenceBody}>
                <Text style={styles.choiceTitle}>Smart suggestions</Text>
                <Text style={styles.choiceSubtitle}>Recommend recipes based on what you save and search.</Text>
              </View>
              <Switch
                trackColor={{ false: theme.border, true: theme.accentSoft }}
                thumbColor={settings.smartSuggestions ? theme.accent : '#FFF8F2'}
                value={settings.smartSuggestions}
                onValueChange={setSmartSuggestions}
              />
            </View>

            <View style={[styles.preferenceRow, styles.rowBorder]}>
              <View style={styles.preferenceBody}>
                <Text style={styles.choiceTitle}>Push alerts</Text>
                <Text style={styles.choiceSubtitle}>Get notified when new collections and reminders arrive.</Text>
              </View>
              <Switch
                trackColor={{ false: theme.border, true: theme.accentSoft }}
                thumbColor={settings.pushAlerts ? theme.accent : '#FFF8F2'}
                value={settings.pushAlerts}
                onValueChange={setPushAlerts}
              />
            </View>

            <View style={[styles.preferenceRow, styles.rowBorder]}>
              <View style={styles.preferenceBody}>
                <Text style={styles.choiceTitle}>Haptics</Text>
                <Text style={styles.choiceSubtitle}>Keep taps and saved actions feeling tactile.</Text>
              </View>
              <Switch
                trackColor={{ false: theme.border, true: theme.accentSoft }}
                thumbColor={settings.hapticsEnabled ? theme.accent : '#FFF8F2'}
                value={settings.hapticsEnabled}
                onValueChange={setHapticsEnabled}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 18,
    paddingBottom: 36,
    flexGrow: 1,
  },
  shell: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
  },
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
  backText: {
    color: '#251712',
    fontSize: 14,
    fontWeight: '700',
  },
  header: {
    marginTop: 18,
    marginBottom: 18,
  },
  title: {
    color: '#251712',
    fontSize: 30,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 8,
    color: '#6D5D55',
    fontSize: 14,
    lineHeight: 20,
  },
  heroCard: {
    borderRadius: 30,
    padding: 20,
  },
  heroEyebrow: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  heroTitle: {
    marginTop: 8,
    color: '#FFF6F0',
    fontSize: 28,
    fontWeight: '900',
  },
  heroCopy: {
    marginTop: 12,
    color: '#E6D7D1',
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    marginTop: 16,
    borderRadius: 28,
    borderWidth: 1,
    padding: 18,
  },
  sectionTitle: {
    color: '#241611',
    fontSize: 21,
    fontWeight: '900',
    marginBottom: 10,
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
    marginTop: 4,
  },
  themeOption: {
    width: '48%',
    borderRadius: 22,
    borderWidth: 2,
    padding: 14,
  },
  themeSwatches: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  themeSwatchLarge: {
    flex: 1,
    height: 52,
    borderRadius: 16,
  },
  themeSwatchSmall: {
    width: 30,
    height: 30,
    borderRadius: 10,
  },
  themeLabel: {
    marginTop: 10,
    color: '#241611',
    fontSize: 14,
    fontWeight: '800',
  },
  choiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: '#F0E1D6',
  },
  choiceBody: {
    flex: 1,
    paddingRight: 12,
  },
  choiceTitle: {
    color: '#241611',
    fontSize: 16,
    fontWeight: '800',
  },
  choiceSubtitle: {
    marginTop: 4,
    color: '#7B6C63',
    fontSize: 13,
    lineHeight: 18,
  },
  choiceDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#D9C9BC',
    backgroundColor: 'transparent',
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 16,
  },
  preferenceBody: {
    flex: 1,
  },
});

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  APP_THEMES,
  type AppLanguage,
  type MeasurementSystem,
  useSettings,
} from '@/components/settings-provider';

type SettingsScreenCopy = {
  back: string;
  title: string;
  subtitle: string;
  currentStyle: string;
  currentStyleCopy: string;
  appTheme: string;
  language: string;
  cookingDefaults: string;
  experience: string;
  smartSuggestions: string;
  smartSuggestionsCopy: string;
  pushAlerts: string;
  pushAlertsCopy: string;
  haptics: string;
  hapticsCopy: string;
  metricNote: string;
  imperialNote: string;
};

const SETTINGS_COPY: Record<AppLanguage, SettingsScreenCopy> = {
  en: {
    back: 'Back',
    title: 'Settings',
    subtitle: 'Personalize the app feel, language, and kitchen defaults.',
    currentStyle: 'Current style',
    currentStyleCopy: 'Your theme updates the app accents and navigation surfaces so Savorly feels more like your space.',
    appTheme: 'App theme',
    language: 'Language',
    cookingDefaults: 'Cooking defaults',
    experience: 'Experience',
    smartSuggestions: 'Smart suggestions',
    smartSuggestionsCopy: 'Recommend recipes based on what you save and search.',
    pushAlerts: 'Push alerts',
    pushAlertsCopy: 'Get notified when new collections and reminders arrive.',
    haptics: 'Haptics',
    hapticsCopy: 'Keep taps and saved actions feeling tactile.',
    metricNote: 'Grams, liters, and Celsius',
    imperialNote: 'Cups, ounces, and Fahrenheit',
  },
  es: {
    back: 'Volver',
    title: 'Configuracion',
    subtitle: 'Personaliza el estilo de la app, el idioma y los ajustes de cocina.',
    currentStyle: 'Estilo actual',
    currentStyleCopy: 'Tu tema cambia los acentos y las superficies de navegacion para que Savorly se sienta mas tuyo.',
    appTheme: 'Tema',
    language: 'Idioma',
    cookingDefaults: 'Preferencias de cocina',
    experience: 'Experiencia',
    smartSuggestions: 'Sugerencias inteligentes',
    smartSuggestionsCopy: 'Recomienda recetas segun lo que guardas y buscas.',
    pushAlerts: 'Alertas',
    pushAlertsCopy: 'Recibe avisos cuando lleguen recordatorios y colecciones.',
    haptics: 'Hapticos',
    hapticsCopy: 'Mantiene una sensacion tactil al tocar y guardar.',
    metricNote: 'Gramos, litros y Celsius',
    imperialNote: 'Tazas, onzas y Fahrenheit',
  },
  fr: {
    back: 'Retour',
    title: 'Parametres',
    subtitle: 'Personnalisez le style de l app, la langue et les reglages de cuisine.',
    currentStyle: 'Style actuel',
    currentStyleCopy: 'Votre theme met a jour les accents et la navigation pour que Savorly vous ressemble davantage.',
    appTheme: 'Theme',
    language: 'Langue',
    cookingDefaults: 'Reglages cuisine',
    experience: 'Experience',
    smartSuggestions: 'Suggestions intelligentes',
    smartSuggestionsCopy: 'Recommande des recettes selon vos recherches et sauvegardes.',
    pushAlerts: 'Alertes',
    pushAlertsCopy: 'Recevez des rappels et des notifications de collections.',
    haptics: 'Haptiques',
    hapticsCopy: 'Garde une sensation tactile lors des appuis et sauvegardes.',
    metricNote: 'Grammes, litres et Celsius',
    imperialNote: 'Tasses, onces et Fahrenheit',
  },
  fil: {
    back: 'Bumalik',
    title: 'Settings',
    subtitle: 'I-personalize ang itsura ng app, wika, at kitchen defaults.',
    currentStyle: 'Current style',
    currentStyleCopy: 'Binabago ng theme ang accents at navigation surfaces para mas maging parang sa iyo ang Savorly.',
    appTheme: 'App theme',
    language: 'Wika',
    cookingDefaults: 'Cooking defaults',
    experience: 'Experience',
    smartSuggestions: 'Smart suggestions',
    smartSuggestionsCopy: 'Magrekomenda ng recipes base sa sine-save at hinahanap mo.',
    pushAlerts: 'Push alerts',
    pushAlertsCopy: 'Makakuha ng reminders at collection alerts.',
    haptics: 'Haptics',
    hapticsCopy: 'Panatilihing may tactile feel ang taps at saves.',
    metricNote: 'Grams, liters, at Celsius',
    imperialNote: 'Cups, ounces, at Fahrenheit',
  },
  ko: {
    back: '뒤로',
    title: '설정',
    subtitle: '앱 분위기, 언어, 그리고 기본 요리 설정을 내 취향에 맞게 바꾸세요.',
    currentStyle: '현재 스타일',
    currentStyleCopy: '테마를 바꾸면 앱의 포인트 색과 탐색 화면이 함께 바뀌어 Savorly가 더 내 공간처럼 느껴져요.',
    appTheme: '앱 테마',
    language: '언어',
    cookingDefaults: '기본 조리 설정',
    experience: '사용 경험',
    smartSuggestions: '스마트 추천',
    smartSuggestionsCopy: '저장한 레시피와 검색 기록을 바탕으로 추천해요.',
    pushAlerts: '푸시 알림',
    pushAlertsCopy: '새 컬렉션과 리마인더가 도착하면 알려줘요.',
    haptics: '햅틱',
    hapticsCopy: '탭과 저장 동작에 손맛을 유지해요.',
    metricNote: '그램, 리터, 섭씨',
    imperialNote: '컵, 온스, 화씨',
  },
  ja: {
    back: '戻る',
    title: '設定',
    subtitle: 'アプリの雰囲気、言語、料理の基本設定を自分向けに整えましょう。',
    currentStyle: '現在のスタイル',
    currentStyleCopy: 'テーマを変えると、アクセントカラーやナビゲーションの見た目も変わり、Savorly がより自分らしくなります。',
    appTheme: 'アプリテーマ',
    language: '言語',
    cookingDefaults: '調理の基本設定',
    experience: '使い心地',
    smartSuggestions: 'スマート提案',
    smartSuggestionsCopy: '保存や検索の内容をもとにレシピをおすすめします。',
    pushAlerts: 'プッシュ通知',
    pushAlertsCopy: '新しいコレクションやリマインダーを知らせます。',
    haptics: '触覚フィードバック',
    hapticsCopy: 'タップや保存操作に手応えを残します。',
    metricNote: 'グラム、リットル、摂氏',
    imperialNote: 'カップ、オンス、華氏',
  },
};

const LANGUAGE_OPTIONS: { key: AppLanguage; label: string; note: string }[] = [
  { key: 'en', label: 'English', note: 'Default English UI' },
  { key: 'es', label: 'Espanol', note: 'Interfaz en espanol' },
  { key: 'fr', label: 'Francais', note: 'Interface en francais' },
  { key: 'fil', label: 'Filipino', note: 'UI sa Filipino' },
  { key: 'ko', label: '한국어', note: '한국어 인터페이스' },
  { key: 'ja', label: '日本語', note: '日本語インターフェース' },
];

function getMeasurementOptions(copy: SettingsScreenCopy): { key: MeasurementSystem; label: string; note: string }[] {
  return [
    { key: 'metric', label: 'Metric', note: copy.metricNote },
    { key: 'imperial', label: 'Imperial', note: copy.imperialNote },
  ];
}

export default function SettingsScreen() {
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
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
  const copy = SETTINGS_COPY[settings.language];
  const measurementOptions = getMeasurementOptions(copy);
  const activeLanguage = LANGUAGE_OPTIONS.find((option) => option.key === settings.language) ?? LANGUAGE_OPTIONS[0];

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
            <Text style={styles.backText}>{copy.back}</Text>
          </Pressable>

          <View style={styles.header}>
            <Text style={styles.title}>{copy.title}</Text>
            <Text style={styles.subtitle}>{copy.subtitle}</Text>
          </View>

          <View style={[styles.heroCard, { backgroundColor: theme.heroBackground }]}>
            <Text style={[styles.heroEyebrow, { color: theme.heroAccent }]}>{copy.currentStyle}</Text>
            <Text style={styles.heroTitle}>{theme.label}</Text>
            <Text style={styles.heroCopy}>{copy.currentStyleCopy}</Text>
          </View>

          <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <Text style={styles.sectionTitle}>{copy.appTheme}</Text>
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
            <Text style={styles.sectionTitle}>{copy.language}</Text>
            <Pressable
              style={[styles.languageTrigger, { backgroundColor: theme.accentSoft, borderColor: theme.border }]}
              onPress={() => setIsLanguageMenuOpen((current) => !current)}>
              <View style={[styles.languageTriggerIcon, { backgroundColor: theme.cardBackground }]}>
                <MaterialIcons name="translate" size={20} color={theme.accent} />
              </View>
              <View style={styles.languageTriggerBody}>
                <Text style={styles.languageTriggerTitle}>{activeLanguage.label}</Text>
                <Text style={styles.languageTriggerSubtitle}>{activeLanguage.note}</Text>
              </View>
              <View style={[styles.languageTriggerArrow, { backgroundColor: theme.cardBackground }]}>
                <MaterialIcons
                  name={isLanguageMenuOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                  size={22}
                  color={theme.accent}
                />
              </View>
            </Pressable>

            {isLanguageMenuOpen ? (
              <View style={[styles.languageMenu, { borderColor: theme.border }]}>
                {LANGUAGE_OPTIONS.map((option, index) => {
                  const isSelected = settings.language === option.key;

                  return (
                    <Pressable
                      key={option.key}
                      style={[
                        styles.languageOption,
                        index > 0 && [styles.rowBorder, { borderTopColor: theme.border }],
                        isSelected && { backgroundColor: theme.accentSoft },
                      ]}
                      onPress={() => {
                        setLanguage(option.key);
                        setIsLanguageMenuOpen(false);
                      }}>
                      <View style={styles.choiceBody}>
                        <Text style={styles.choiceTitle}>{option.label}</Text>
                        <Text style={styles.choiceSubtitle}>{option.note}</Text>
                      </View>
                      {isSelected ? (
                        <View style={[styles.languageSelectedBadge, { backgroundColor: theme.accent }]}>
                          <MaterialIcons name="check" size={15} color="#FFFFFF" />
                        </View>
                      ) : (
                        <MaterialIcons name="chevron-right" size={20} color={theme.accent} />
                      )}
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
          </View>

          <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <Text style={styles.sectionTitle}>{copy.cookingDefaults}</Text>
            {measurementOptions.map((option, index) => (
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
            <Text style={styles.sectionTitle}>{copy.experience}</Text>

            <View style={styles.preferenceRow}>
              <View style={styles.preferenceBody}>
                <Text style={styles.choiceTitle}>{copy.smartSuggestions}</Text>
                <Text style={styles.choiceSubtitle}>{copy.smartSuggestionsCopy}</Text>
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
                <Text style={styles.choiceTitle}>{copy.pushAlerts}</Text>
                <Text style={styles.choiceSubtitle}>{copy.pushAlertsCopy}</Text>
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
                <Text style={styles.choiceTitle}>{copy.haptics}</Text>
                <Text style={styles.choiceSubtitle}>{copy.hapticsCopy}</Text>
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
  languageTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 24,
    padding: 14,
  },
  languageTriggerIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  languageTriggerBody: {
    flex: 1,
    paddingRight: 12,
  },
  languageTriggerTitle: {
    color: '#241611',
    fontSize: 16,
    fontWeight: '800',
  },
  languageTriggerSubtitle: {
    marginTop: 4,
    color: '#7B6C63',
    fontSize: 13,
    lineHeight: 18,
  },
  languageTriggerArrow: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageMenu: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 24,
    overflow: 'hidden',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  languageSelectedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
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

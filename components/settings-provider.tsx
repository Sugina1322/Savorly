import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

export type AppThemeKey = 'terracotta' | 'forest' | 'citrus' | 'berry';
export type AppLanguage = 'en' | 'es' | 'fr' | 'fil';
export type MeasurementSystem = 'metric' | 'imperial';
export type SpiceLevel = 'mild' | 'medium' | 'bold';
export type DietaryFocus = 'balanced' | 'vegetarian' | 'high-protein';

export type AppTheme = {
  key: AppThemeKey;
  label: string;
  accent: string;
  accentSoft: string;
  appBackground: string;
  cardBackground: string;
  border: string;
  tabBarBackground: string;
  tabBarBorder: string;
  heroBackground: string;
  heroAccent: string;
};

type SettingsState = {
  theme: AppThemeKey;
  language: AppLanguage;
  measurementSystem: MeasurementSystem;
  smartSuggestions: boolean;
  pushAlerts: boolean;
  hapticsEnabled: boolean;
  spiceLevel: SpiceLevel;
  dietaryFocus: DietaryFocus;
  preferredCuisines: string[];
};

type SettingsContextValue = {
  settings: SettingsState;
  isReady: boolean;
  theme: AppTheme;
  setTheme: (theme: AppThemeKey) => void;
  setLanguage: (language: AppLanguage) => void;
  setMeasurementSystem: (system: MeasurementSystem) => void;
  setSmartSuggestions: (enabled: boolean) => void;
  setPushAlerts: (enabled: boolean) => void;
  setHapticsEnabled: (enabled: boolean) => void;
  setSpiceLevel: (level: SpiceLevel) => void;
  setDietaryFocus: (focus: DietaryFocus) => void;
  togglePreferredCuisine: (cuisine: string) => void;
};

const STORAGE_KEY = 'savorly.app-settings.v1';

const DEFAULT_SETTINGS: SettingsState = {
  theme: 'terracotta',
  language: 'en',
  measurementSystem: 'metric',
  smartSuggestions: true,
  pushAlerts: false,
  hapticsEnabled: true,
  spiceLevel: 'medium',
  dietaryFocus: 'balanced',
  preferredCuisines: [],
};

export const APP_THEMES: AppTheme[] = [
  {
    key: 'terracotta',
    label: 'Terracotta',
    accent: '#C7512D',
    accentSoft: '#FBE8DB',
    appBackground: '#FCF5EE',
    cardBackground: '#FFFFFF',
    border: '#F0DDD0',
    tabBarBackground: '#FFF8F2',
    tabBarBorder: '#F0DED0',
    heroBackground: '#201612',
    heroAccent: '#FFB28B',
  },
  {
    key: 'forest',
    label: 'Forest',
    accent: '#3E7A4C',
    accentSoft: '#E3F0E4',
    appBackground: '#F3F8F1',
    cardBackground: '#FFFFFF',
    border: '#D8E6D7',
    tabBarBackground: '#F8FCF7',
    tabBarBorder: '#D8E6D7',
    heroBackground: '#173122',
    heroAccent: '#B4E0A9',
  },
  {
    key: 'citrus',
    label: 'Citrus',
    accent: '#D48B12',
    accentSoft: '#FFF0C8',
    appBackground: '#FFF9EC',
    cardBackground: '#FFFFFF',
    border: '#F2E0B2',
    tabBarBackground: '#FFFDF7',
    tabBarBorder: '#F2E0B2',
    heroBackground: '#39260C',
    heroAccent: '#FFD670',
  },
  {
    key: 'berry',
    label: 'Berry',
    accent: '#B54563',
    accentSoft: '#F9DDE5',
    appBackground: '#FFF3F6',
    cardBackground: '#FFFFFF',
    border: '#F1D2DB',
    tabBarBackground: '#FFF9FA',
    tabBarBorder: '#F1D2DB',
    heroBackground: '#311420',
    heroAccent: '#F6A9BD',
  },
];

const SettingsContext = createContext<SettingsContextValue | null>(null);

function getTheme(themeKey: AppThemeKey) {
  return APP_THEMES.find((theme) => theme.key === themeKey) ?? APP_THEMES[0];
}

export function SettingsProvider({ children }: PropsWithChildren) {
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        if (!value) {
          setIsReady(true);
          return;
        }

        try {
          const parsed = JSON.parse(value) as Partial<SettingsState>;
          setSettings({
            ...DEFAULT_SETTINGS,
            ...parsed,
          });
        } catch (error) {
          console.warn('Failed to parse app settings', error);
        } finally {
          setIsReady(true);
        }
      })
      .catch((error) => {
        console.warn('Failed to load app settings', error);
        setIsReady(true);
      });
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings)).catch((error) => {
      console.warn('Failed to save app settings', error);
    });
  }, [isReady, settings]);

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      isReady,
      theme: getTheme(settings.theme),
      setTheme(theme) {
        setSettings((current) => ({ ...current, theme }));
      },
      setLanguage(language) {
        setSettings((current) => ({ ...current, language }));
      },
      setMeasurementSystem(measurementSystem) {
        setSettings((current) => ({ ...current, measurementSystem }));
      },
      setSmartSuggestions(smartSuggestions) {
        setSettings((current) => ({ ...current, smartSuggestions }));
      },
      setPushAlerts(pushAlerts) {
        setSettings((current) => ({ ...current, pushAlerts }));
      },
      setHapticsEnabled(hapticsEnabled) {
        setSettings((current) => ({ ...current, hapticsEnabled }));
      },
      setSpiceLevel(spiceLevel) {
        setSettings((current) => ({ ...current, spiceLevel }));
      },
      setDietaryFocus(dietaryFocus) {
        setSettings((current) => ({ ...current, dietaryFocus }));
      },
      togglePreferredCuisine(cuisine) {
        setSettings((current) => {
          const exists = current.preferredCuisines.includes(cuisine);
          return {
            ...current,
            preferredCuisines: exists
              ? current.preferredCuisines.filter((item) => item !== cuisine)
              : [...current.preferredCuisines, cuisine],
          };
        });
      },
    }),
    [isReady, settings]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error('useSettings must be used inside SettingsProvider');
  }

  return context;
}

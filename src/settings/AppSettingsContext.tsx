import React, { createContext, useContext, useEffect, useState } from 'react';
import { loadAppSettings, saveAppSettings } from '../storage/appSettingsStorage';
import { Appearance, AppSettings, DEFAULT_APP_SETTINGS, Units } from './appSettings';

/**
 * App-level preferences (units, appearance) — a second top-level context
 * alongside `ProfileContext` (the saved profile). Reads from
 * `appSettingsStorage` once on mount, defaulting optimistically to
 * `DEFAULT_APP_SETTINGS` in the
 * meantime (a one-frame "system theme" flash at worst if a user has
 * actually overridden appearance — an acceptable v1 tradeoff, unlike
 * `ProfileContext.isLoading`, which genuinely gates the first route).
 *
 * Not unit-tested directly — thin React/storage glue, same as
 * `ProfileContext`. The logic it depends on is tested in
 * `src/settings/__tests__/appSettings.test.ts` and
 * `src/storage/__tests__/appSettingsStorage.test.ts`.
 */
interface AppSettingsContextValue {
  settings: AppSettings;
  isLoading: boolean;
  setUnits: (units: Units) => void;
  setAppearance: (appearance: Appearance) => void;
}

const AppSettingsContext = createContext<AppSettingsContextValue | undefined>(undefined);

export function AppSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    loadAppSettings().then((loaded) => {
      if (!cancelled) {
        setSettings(loaded);
        setIsLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = (next: AppSettings) => {
    setSettings(next);
    void saveAppSettings(next);
  };

  const value: AppSettingsContextValue = {
    settings,
    isLoading,
    setUnits: (units) => persist({ ...settings, units }),
    setAppearance: (appearance) => persist({ ...settings, appearance }),
  };

  return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>;
}

export function useAppSettings(): AppSettingsContextValue {
  const ctx = useContext(AppSettingsContext);
  if (!ctx) {
    throw new Error('useAppSettings must be used within an AppSettingsProvider');
  }
  return ctx;
}

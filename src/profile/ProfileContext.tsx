import React, { createContext, useContext, useEffect, useState } from 'react';
import { clearProfile as clearStoredProfile, loadProfile, saveProfile as persistProfile } from '../storage/profileStorage';
import { UserProfile } from '../types/profile';

/**
 * App-level "current saved profile" state. This is the single source of
 * truth the navigator uses to decide whether to show onboarding or the
 * results dashboard on launch (PRD §9, step 5 — "user can return anytime
 * to view their dashboard"). Reads from `profileStorage` once on mount;
 * after that, `saveProfile`/`clearProfile` here keep this in sync with disk
 * so screens don't need to re-read storage after every change.
 */
interface ProfileContextValue {
  profile: UserProfile | null;
  isLoading: boolean;
  saveProfile: (profile: UserProfile) => Promise<void>;
  clearProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    loadProfile().then((loaded) => {
      if (!cancelled) {
        setProfile(loaded);
        setIsLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const value: ProfileContextValue = {
    profile,
    isLoading,
    saveProfile: async (next) => {
      await persistProfile(next);
      setProfile(next);
    },
    clearProfile: async () => {
      await clearStoredProfile();
      setProfile(null);
    },
  };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return ctx;
}

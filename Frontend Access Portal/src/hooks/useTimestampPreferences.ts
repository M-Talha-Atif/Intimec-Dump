"use client";

import { useState, useEffect } from "react";

export interface TimestampPreferences {
  format: 'short' | 'medium' | 'long' | 'full';
  includeTimezone: boolean;
  showRelativeTime: boolean;
  locale: string;
}

const DEFAULT_PREFERENCES: TimestampPreferences = {
  format: 'medium',
  includeTimezone: true,
  showRelativeTime: true,
  locale: 'en-US'
};

const STORAGE_KEY = 'timestamp_preferences';

export function useTimestampPreferences() {
  const [preferences, setPreferences] = useState<TimestampPreferences>(DEFAULT_PREFERENCES);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
      }
    } catch (error) {
      console.warn('Failed to load timestamp preferences:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save preferences to localStorage when they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
      } catch (error) {
        console.warn('Failed to save timestamp preferences:', error);
      }
    }
  }, [preferences, isLoaded]);

  const updatePreferences = (updates: Partial<TimestampPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  };

  const resetPreferences = () => {
    setPreferences(DEFAULT_PREFERENCES);
  };

  return {
    preferences,
    updatePreferences,
    resetPreferences,
    isLoaded
  };
}

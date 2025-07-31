import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PaletteMode } from '@mui/material';

interface ThemeStore {
  mode: PaletteMode;
  variant: string;
  autoDetect: boolean;
  
  // Actions
  setMode: (mode: PaletteMode) => void;
  setVariant: (variant: string) => void;
  toggleMode: () => void;
  setAutoDetect: (auto: boolean) => void;
  resetToDefaults: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      mode: 'light',
      variant: 'blue',
      autoDetect: true,

      setMode: (mode: PaletteMode) => {
        set({ mode, autoDetect: false });
        document.documentElement.setAttribute('data-theme', mode);
      },

      setVariant: (variant: string) => {
        set({ variant });
      },

      toggleMode: () => {
        const currentMode = get().mode;
        const newMode = currentMode === 'light' ? 'dark' : 'light';
        get().setMode(newMode);
      },

      setAutoDetect: (auto: boolean) => {
        set({ autoDetect: auto });
        if (auto) {
          const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          get().setMode(systemPrefersDark ? 'dark' : 'light');
        }
      },

      resetToDefaults: () => {
        set({ mode: 'light', variant: 'blue', autoDetect: true });
        document.documentElement.setAttribute('data-theme', 'light');
      },
    }),
    {
      name: 'theme-settings',
      partialize: (state) => ({
        mode: state.mode,
        variant: state.variant,
        autoDetect: state.autoDetect,
      }),
    }
  )
);

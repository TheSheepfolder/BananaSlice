// BananaSlice - Settings Store
// Manages application settings and API configuration

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AIModel, GenerationSettings } from '../types';

interface SettingsState {
    // API settings
    apiKey: string | null;
    apiKeySet: boolean; // True if key is stored in OS keychain

    // Default generation settings
    defaultModel: AIModel;
    defaultStrength: number;
    defaultGuidance: number;

    // Current generation settings
    currentSettings: GenerationSettings;

    // Actions
    setApiKeySet: (set: boolean) => void;
    setDefaultModel: (model: AIModel) => void;
    setDefaultStrength: (strength: number) => void;
    setDefaultGuidance: (guidance: number) => void;
    updateCurrentSettings: (settings: Partial<GenerationSettings>) => void;
    resetToDefaults: () => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set, get) => ({
            // Initial state
            apiKey: null,
            apiKeySet: false,

            defaultModel: 'nano-banana-pro',
            defaultStrength: 75,
            defaultGuidance: 7,

            currentSettings: {
                model: 'nano-banana-pro',
                prompt: '',
                strength: 75,
                guidance: 7,
            },

            // Actions
            setApiKeySet: (apiKeySet) => set({ apiKeySet }),

            setDefaultModel: (defaultModel) => set({ defaultModel }),

            setDefaultStrength: (defaultStrength) => set({ defaultStrength }),

            setDefaultGuidance: (defaultGuidance) => set({ defaultGuidance }),

            updateCurrentSettings: (settings) =>
                set((state) => ({
                    currentSettings: { ...state.currentSettings, ...settings },
                })),

            resetToDefaults: () => {
                const { defaultModel, defaultStrength, defaultGuidance } = get();
                set({
                    currentSettings: {
                        model: defaultModel,
                        prompt: '',
                        strength: defaultStrength,
                        guidance: defaultGuidance,
                    },
                });
            },
        }),
        {
            name: 'bananaslice-settings',
            partialize: (state) => ({
                defaultModel: state.defaultModel,
                defaultStrength: state.defaultStrength,
                defaultGuidance: state.defaultGuidance,
                apiKeySet: state.apiKeySet,
            }),
        }
    )
);

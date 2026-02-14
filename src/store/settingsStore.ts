// Settings Store
// Manages application settings

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AIModel } from '../types';

interface SettingsState {
    // API settings
    apiKeySet: boolean; // True if key is stored in OS keychain

    // Default model
    defaultModel: AIModel;

    // Generation context behavior
    useFullImageContext: boolean;

    // Actions
    setApiKeySet: (set: boolean) => void;
    setDefaultModel: (model: AIModel) => void;
    setUseFullImageContext: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            // Initial state
            apiKeySet: false,
            defaultModel: 'nano-banana-pro',
            useFullImageContext: false,

            // Actions
            setApiKeySet: (apiKeySet) => set({ apiKeySet }),
            setDefaultModel: (defaultModel) => set({ defaultModel }),
            setUseFullImageContext: (useFullImageContext) => set({ useFullImageContext }),
        }),
        {
            name: 'bananaslice-settings',
            partialize: (state) => ({
                defaultModel: state.defaultModel,
                apiKeySet: state.apiKeySet,
                useFullImageContext: state.useFullImageContext,
            }),
        }
    )
);

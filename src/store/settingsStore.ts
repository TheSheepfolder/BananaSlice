// Settings Store
// Manages application settings

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AIModel, ImageSize } from '../types';

interface SettingsState {
    // API settings
    apiKeySet: boolean; // True if key is stored in OS keychain

    // Default model
    defaultModel: AIModel;

    // Default image size for Nano Banana Pro
    defaultImageSize: ImageSize;

    // Generation context behavior
    useFullImageContext: boolean;

    // Actions
    setApiKeySet: (set: boolean) => void;
    setDefaultModel: (model: AIModel) => void;
    setDefaultImageSize: (size: ImageSize) => void;
    setUseFullImageContext: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            // Initial state
            apiKeySet: false,
            defaultModel: 'nano-banana-pro',
            defaultImageSize: '2K',
            useFullImageContext: false,

            // Actions
            setApiKeySet: (apiKeySet) => set({ apiKeySet }),
            setDefaultModel: (defaultModel) => set({ defaultModel }),
            setDefaultImageSize: (defaultImageSize) => set({ defaultImageSize }),
            setUseFullImageContext: (useFullImageContext) => set({ useFullImageContext }),
        }),
        {
            name: 'bananaslice-settings',
            partialize: (state) => ({
                defaultModel: state.defaultModel,
                defaultImageSize: state.defaultImageSize,
                apiKeySet: state.apiKeySet,
                useFullImageContext: state.useFullImageContext,
            }),
        }
    )
);

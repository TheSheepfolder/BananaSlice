// BananaSlice - Tool Store
// Manages active tool and tool settings

import { create } from 'zustand';
import type { Tool, BrushSettings } from '../types';

interface ToolState {
    // Active tool
    activeTool: Tool;

    // Brush settings
    brushSettings: BrushSettings;

    // Actions
    setTool: (tool: Tool) => void;
    setBrushSize: (size: number) => void;
    setBrushHardness: (hardness: number) => void;
    setBrushFeather: (feather: number) => void;
}

export const useToolStore = create<ToolState>((set) => ({
    // Initial state
    activeTool: 'move',

    brushSettings: {
        size: 50,
        hardness: 100,
        feather: 10,
    },

    // Actions
    setTool: (tool) => set({ activeTool: tool }),

    setBrushSize: (size) =>
        set((state) => ({
            brushSettings: { ...state.brushSettings, size },
        })),

    setBrushHardness: (hardness) =>
        set((state) => ({
            brushSettings: { ...state.brushSettings, hardness },
        })),

    setBrushFeather: (feather) =>
        set((state) => ({
            brushSettings: { ...state.brushSettings, feather },
        })),
}));

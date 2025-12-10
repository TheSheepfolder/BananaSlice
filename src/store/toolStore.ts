// BananaSlice - Tool Store
// Manages active tool

import { create } from 'zustand';
import type { Tool } from '../types';

interface ToolState {
    // Active tool
    activeTool: Tool;

    // Actions
    setTool: (tool: Tool) => void;
    setActiveTool: (tool: Tool) => void;
}

export const useToolStore = create<ToolState>((set) => ({
    // Initial state
    activeTool: 'move',

    // Actions
    setTool: (tool) => set({ activeTool: tool }),
    setActiveTool: (tool) => set({ activeTool: tool }),
}));

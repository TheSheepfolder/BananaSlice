// BananaSlice - Canvas Store
// Manages canvas state, image loading, and viewport

import { create } from 'zustand';
import type { CanvasState, ImageData } from '../types';

interface CanvasStoreState extends CanvasState {
    // Image data
    baseImage: ImageData | null;
    imagePath: string | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    setBaseImage: (image: ImageData, path: string) => void;
    clearImage: () => void;
    setZoom: (zoom: number) => void;
    setPan: (x: number, y: number) => void;
    setCursor: (x: number, y: number) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;

    // Zoom helpers
    zoomIn: () => void;
    zoomOut: () => void;
    resetZoom: () => void;
    fitToScreen: (canvasWidth: number, canvasHeight: number) => void;
}

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 10;
const ZOOM_STEP = 0.25;

export const useCanvasStore = create<CanvasStoreState>((set, get) => ({
    // Initial state
    baseImage: null,
    imagePath: null,
    isLoading: false,
    error: null,
    zoom: 1,
    panX: 0,
    panY: 0,
    cursorX: 0,
    cursorY: 0,

    // Actions
    setBaseImage: (image, path) =>
        set({
            baseImage: image,
            imagePath: path,
            error: null,
            zoom: 1,
            panX: 0,
            panY: 0,
        }),

    clearImage: () =>
        set({
            baseImage: null,
            imagePath: null,
            zoom: 1,
            panX: 0,
            panY: 0,
        }),

    setZoom: (zoom) =>
        set({ zoom: Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom)) }),

    setPan: (panX, panY) => set({ panX, panY }),

    setCursor: (cursorX, cursorY) => set({ cursorX, cursorY }),

    setLoading: (isLoading) => set({ isLoading }),

    setError: (error) => set({ error }),

    // Zoom helpers
    zoomIn: () => {
        const { zoom } = get();
        set({ zoom: Math.min(MAX_ZOOM, zoom + ZOOM_STEP) });
    },

    zoomOut: () => {
        const { zoom } = get();
        set({ zoom: Math.max(MIN_ZOOM, zoom - ZOOM_STEP) });
    },

    resetZoom: () => set({ zoom: 1, panX: 0, panY: 0 }),

    fitToScreen: (canvasWidth, canvasHeight) => {
        const { baseImage } = get();
        if (!baseImage) return;

        const scaleX = canvasWidth / baseImage.width;
        const scaleY = canvasHeight / baseImage.height;
        const zoom = Math.min(scaleX, scaleY) * 0.9; // 90% of available space

        set({ zoom, panX: 0, panY: 0 });
    },
}));

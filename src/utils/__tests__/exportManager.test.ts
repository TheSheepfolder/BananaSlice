import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Layer } from '../../types';
import { useCanvasStore } from '../../store/canvasStore';
import { useLayerStore } from '../../store/layerStore';

vi.mock('@tauri-apps/plugin-dialog', () => ({
    save: vi.fn(),
}));

vi.mock('@tauri-apps/plugin-fs', () => ({
    writeFile: vi.fn(),
}));

vi.mock('../layerCompositor', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../layerCompositor')>();
    return {
        ...actual,
        applyLayerFeathering: vi.fn(),
        applySharpPolygonMask: vi.fn(),
    };
});

describe('Export Manager - Feathered Layers', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useCanvasStore.getState().clearImage();
        useLayerStore.getState().clearLayers();
    });

    it('uses feathered data when exporting layers with feather radius', async () => {
        const { save } = await import('@tauri-apps/plugin-dialog');
        const { writeFile } = await import('@tauri-apps/plugin-fs');
        const compositor = await import('../layerCompositor');
        const { exportImage } = await import('../exportManager');

        (save as any).mockResolvedValue('/tmp/export.png');
        (compositor.applyLayerFeathering as any).mockResolvedValue('FEATHERED_DATA');

        const baseImage = { data: 'BASE_DATA', width: 200, height: 150, format: 'png' };
        useCanvasStore.getState().setBaseImage(baseImage, '/tmp/source.png');

        const baseLayer: Layer = {
            id: 'base',
            name: 'Background',
            type: 'base',
            imageData: 'BASE_DATA',
            visible: true,
            opacity: 100,
            order: 0,
            x: 0,
            y: 0,
            width: 200,
            height: 150,
        };

        const featherLayer: Layer = {
            id: 'layer-1',
            name: 'Generative Fill',
            type: 'edit',
            imageData: 'RAW_DATA',
            originalImageData: 'ORIGINAL_DATA',
            featherRadius: 12,
            polygonPoints: [
                { x: 0, y: 0 },
                { x: 50, y: 0 },
                { x: 0, y: 50 },
            ],
            visible: true,
            opacity: 100,
            order: 1,
            x: 10,
            y: 20,
            width: 50,
            height: 50,
        };

        useLayerStore.getState().restoreLayers([baseLayer, featherLayer], null);

        const originalImage = globalThis.Image;
        const srcValues: string[] = [];
        class TestImage {
            onload: (() => void) | null = null;
            onerror: (() => void) | null = null;
            private _src = '';
            width = 100;
            height = 100;

            get src() {
                return this._src;
            }

            set src(value: string) {
                this._src = value;
                srcValues.push(value);
                setTimeout(() => {
                    if (this.onload) this.onload();
                }, 0);
            }
        }

        globalThis.Image = TestImage as any;

        await exportImage({ format: 'png' });

        expect(compositor.applyLayerFeathering).toHaveBeenCalledWith(
            expect.objectContaining({ id: 'layer-1' })
        );
        expect(compositor.applySharpPolygonMask).not.toHaveBeenCalled();
        expect(srcValues).toContain('data:image/png;base64,FEATHERED_DATA');
        expect(writeFile).toHaveBeenCalled();

        globalThis.Image = originalImage;
    });
});

// Selection processing utilities for API preparation

export interface SelectionBounds {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface ImageTransform {
    // Position of image on canvas
    left: number;
    top: number;
    // Scale applied to image
    scaleX: number;
    scaleY: number;
}

export interface ProcessedSelection {
    bounds: SelectionBounds;
    croppedImageBase64: string;
    maskBase64: string;
}

/**
 * Get bounding box from a Fabric.js selection object
 * Returns coordinates in CANVAS space
 */
export function getSelectionBoundsCanvas(selectionObject: any): SelectionBounds | null {
    if (!selectionObject) return null;

    // Get the bounding rect of the selection
    const boundingRect = selectionObject.getBoundingRect();

    return {
        x: Math.floor(boundingRect.left),
        y: Math.floor(boundingRect.top),
        width: Math.ceil(boundingRect.width),
        height: Math.ceil(boundingRect.height),
    };
}

/**
 * Transform selection bounds from canvas space to original image space
 */
export function transformToImageSpace(
    canvasBounds: SelectionBounds,
    imageTransform: ImageTransform,
    imageWidth: number,
    imageHeight: number
): SelectionBounds {
    // Subtract image position, then divide by scale
    const x = Math.floor((canvasBounds.x - imageTransform.left) / imageTransform.scaleX);
    const y = Math.floor((canvasBounds.y - imageTransform.top) / imageTransform.scaleY);
    const width = Math.ceil(canvasBounds.width / imageTransform.scaleX);
    const height = Math.ceil(canvasBounds.height / imageTransform.scaleY);

    // Clamp to image bounds
    return {
        x: Math.max(0, Math.min(x, imageWidth - 1)),
        y: Math.max(0, Math.min(y, imageHeight - 1)),
        width: Math.min(width, imageWidth - x),
        height: Math.min(height, imageHeight - y),
    };
}

/**
 * Crop a base64 image to the specified bounds
 */
export async function cropImageToBounds(
    imageBase64: string,
    bounds: SelectionBounds,
    format: string = 'png'
): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = bounds.width;
            canvas.height = bounds.height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Could not get canvas context'));
                return;
            }

            // Draw the cropped region
            ctx.drawImage(
                img,
                bounds.x, bounds.y, bounds.width, bounds.height,
                0, 0, bounds.width, bounds.height
            );

            // Convert to base64 (strip data URL prefix)
            const dataUrl = canvas.toDataURL(`image/${format}`);
            const base64 = dataUrl.split(',')[1];
            resolve(base64);
        };

        img.onerror = () => reject(new Error('Failed to load image'));

        // Handle both raw base64 and data URLs
        if (imageBase64.startsWith('data:')) {
            img.src = imageBase64;
        } else {
            img.src = `data:image/${format};base64,${imageBase64}`;
        }
    });
}

/**
 * Create a binary mask from bounds
 * White (255) = selected area, Black (0) = keep area
 */
export async function createMaskFromBounds(
    bounds: SelectionBounds
): Promise<string> {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = bounds.width;
        canvas.height = bounds.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            resolve('');
            return;
        }

        // For rectangle selection, entire mask is white (inpaint entire region)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, bounds.width, bounds.height);

        // Convert to base64 (strip data URL prefix)
        const dataUrl = canvas.toDataURL('image/png');
        const base64 = dataUrl.split(',')[1];
        resolve(base64);
    });
}

/**
 * Process a selection for API submission
 * Returns cropped image and mask as base64
 */
export async function processSelectionForAPI(
    selectionObject: any,
    imageBase64: string,
    imageFormat: string,
    imageTransform: ImageTransform,
    imageWidth: number,
    imageHeight: number
): Promise<ProcessedSelection | null> {
    // Get canvas-space bounds
    const canvasBounds = getSelectionBoundsCanvas(selectionObject);
    if (!canvasBounds || canvasBounds.width <= 0 || canvasBounds.height <= 0) {
        return null;
    }

    console.log('Canvas bounds:', canvasBounds);
    console.log('Image transform:', imageTransform);
    console.log('Image dimensions:', imageWidth, imageHeight);

    // Transform to image space
    const imageBounds = transformToImageSpace(
        canvasBounds,
        imageTransform,
        imageWidth,
        imageHeight
    );

    console.log('Image bounds:', imageBounds);

    if (imageBounds.width <= 0 || imageBounds.height <= 0) {
        console.error('Selection is outside image bounds');
        return null;
    }

    // Crop the source image using IMAGE coordinates
    const croppedImageBase64 = await cropImageToBounds(imageBase64, imageBounds, imageFormat);

    // Create the mask (simple white rectangle for now)
    const maskBase64 = await createMaskFromBounds(imageBounds);

    return {
        bounds: imageBounds,
        croppedImageBase64,
        maskBase64,
    };
}


// Selection processing utilities for API preparation

export interface SelectionBounds {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface ProcessedSelection {
    bounds: SelectionBounds;
    croppedImageBase64: string;
    maskBase64: string;
}

/**
 * Get bounding box from a Fabric.js selection object
 */
export function getSelectionBounds(selectionObject: any): SelectionBounds | null {
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
 * Create a binary mask from a Fabric.js selection object
 * White (255) = selected area, Black (0) = keep area
 */
export async function createMaskFromSelection(
    selectionObject: any,
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

        // Fill with black (keep area)
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, bounds.width, bounds.height);

        // Fill selection area with white (selected = inpaint area)
        ctx.fillStyle = '#FFFFFF';

        // Get the selection type and draw accordingly
        const type = selectionObject.type;

        if (type === 'rect') {
            // Rectangle selection - fill entire mask with white since it IS the bounds
            ctx.fillRect(0, 0, bounds.width, bounds.height);
        } else if (type === 'polyline' || type === 'polygon') {
            // Lasso selection - draw the polygon path
            const points = selectionObject.points;
            if (points && points.length > 0) {
                ctx.beginPath();
                // Offset points relative to bounds
                ctx.moveTo(points[0].x - bounds.x, points[0].y - bounds.y);
                for (let i = 1; i < points.length; i++) {
                    ctx.lineTo(points[i].x - bounds.x, points[i].y - bounds.y);
                }
                ctx.closePath();
                ctx.fill();
            }
        }

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
    imageFormat: string
): Promise<ProcessedSelection | null> {
    // Get bounds
    const bounds = getSelectionBounds(selectionObject);
    if (!bounds || bounds.width <= 0 || bounds.height <= 0) {
        return null;
    }

    // Crop the source image
    const croppedImageBase64 = await cropImageToBounds(imageBase64, bounds, imageFormat);

    // Create the mask
    const maskBase64 = await createMaskFromSelection(
        selectionObject,
        bounds
    );

    return {
        bounds,
        croppedImageBase64,
        maskBase64,
    };
}

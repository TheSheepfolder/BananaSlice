// Reference Images Upload Slots Component
// Three fixed slots for uploading reference images with drag-and-drop support

import { useState } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { readFile } from '@tauri-apps/plugin-fs';
import './ReferenceImages.css';

interface ReferenceImagesProps {
    images: string[];
    onChange: (images: string[]) => void;
    maxImages?: number;
    externalDragHoverIndex?: number | null;
}

export function ReferenceImages({ images, onChange, maxImages = 3, externalDragHoverIndex }: ReferenceImagesProps) {
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    // Handle file selection via dialog
    const handleSlotClick = async (index: number) => {
        // If slot is filled, don't open dialog (use remove button instead)
        if (images[index]) return;

        try {
            const selected = await open({
                multiple: false,
                filters: [{
                    name: 'Image',
                    extensions: ['png', 'jpg', 'jpeg', 'webp']
                }]
            });

            if (selected && typeof selected === 'string') {
                await loadImageToSlot(selected, index);
            }
        } catch (error) {
            console.error('Failed to open file dialog:', error);
        }
    };

    const loadImageToSlot = async (path: string, index: number) => {
        try {
            const bytes = await readFile(path);
            const base64 = btoa(
                Array.from(bytes)
                    .map(byte => String.fromCharCode(byte))
                    .join('')
            );

            const newImages = [...images];
            while (newImages.length < maxImages) {
                newImages.push('');
            }
            newImages[index] = base64;
            onChange(newImages);
        } catch (err) {
            console.error('Failed to read image:', path, err);
        }
    };

    const handleRemove = (index: number, e: React.MouseEvent) => {
        e.stopPropagation();
        const newImages = [...images];
        while (newImages.length < maxImages) {
            newImages.push('');
        }
        newImages[index] = '';
        onChange(newImages);
    };

    // Drag and drop handlers
    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        e.stopPropagation();
        if (!images[index]) {
            setDragOverIndex(index);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOverIndex(null);
    };

    const handleDrop = async (e: React.DragEvent, index: number) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOverIndex(null);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = () => {
                    const result = reader.result as string;
                    const base64 = result.split(',')[1];

                    const newImages = [...images];
                    while (newImages.length < maxImages) {
                        newImages.push('');
                    }
                    newImages[index] = base64;
                    onChange(newImages);
                };
                reader.readAsDataURL(file);
            }
        }
    };

    const renderSlot = (index: number) => {
        const image = images[index];
        const isDragOver = dragOverIndex === index || externalDragHoverIndex === index;

        return (
            <div
                key={index}
                className={`reference-slot ${image ? 'filled' : ''} ${isDragOver ? 'drag-over' : ''}`}
                data-reference-slot={index}
                onClick={() => handleSlotClick(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
            >
                {image ? (
                    <>
                        <img
                            src={`data:image/png;base64,${image}`}
                            alt={`Reference ${index + 1}`}
                            className="reference-slot-image"
                        />
                        <button
                            className="reference-slot-remove"
                            onClick={(e) => handleRemove(index, e)}
                            type="button"
                            aria-label="Remove image"
                        >
                            ×
                        </button>
                    </>
                ) : (
                    <div className="reference-slot-empty">
                        <span className="reference-slot-icon">+</span>
                    </div>
                )}
                <span className="reference-slot-number">{index + 1}</span>
            </div>
        );
    };

    return (
        <div className="reference-images">
            <span className="input-label">Reference Images (optional)</span>
            <div className="reference-images-slots">
                {Array.from({ length: maxImages }, (_, i) => renderSlot(i))}
            </div>
        </div>
    );
}

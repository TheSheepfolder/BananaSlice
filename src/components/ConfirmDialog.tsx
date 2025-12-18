// Confirmation Dialog Component
// Reusable dialog for confirming user actions

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import './Modal.css';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'default' | 'danger';
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'default',
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    const confirmButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (isOpen) {
            // Focus the confirm button when dialog opens
            confirmButtonRef.current?.focus();

            // Handle escape key
            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                    onCancel();
                }
            };
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    return createPortal(
        <div className="modal-overlay" onClick={onCancel}>
            <div
                className="modal-content sm"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-dialog-title"
            >
                <div className="modal-header">
                    <h3 className="modal-title" id="confirm-dialog-title">{title}</h3>
                </div>
                <div className="modal-body">
                    <p className="modal-text pre-wrap">{message}</p>
                </div>
                <div className="modal-footer">
                    <button
                        className="modal-btn secondary"
                        onClick={onCancel}
                    >
                        {cancelText}
                    </button>
                    <button
                        ref={confirmButtonRef}
                        className={`modal-btn ${variant === 'danger' ? 'danger' : 'primary'}`}
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

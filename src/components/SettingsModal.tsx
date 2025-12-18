// Settings Modal Component
import { useState, useEffect } from 'react';
import { setApiKey, hasApiKey, deleteApiKey } from '../api';
import './Modal.css';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const [apiKey, setApiKeyValue] = useState('');
    const [hasKey, setHasKey] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        if (isOpen) {
            checkApiKey();
        }
    }, [isOpen]);

    const checkApiKey = async () => {
        const exists = await hasApiKey();
        setHasKey(exists);
    };

    const handleSave = async () => {
        if (!apiKey.trim()) {
            setMessage({ type: 'error', text: 'Please enter an API key' });
            return;
        }

        setIsSaving(true);
        try {
            await setApiKey(apiKey.trim());
            setMessage({ type: 'success', text: 'API key saved successfully!' });
            setHasKey(true);
            setApiKeyValue('');
        } catch (error) {
            setMessage({ type: 'error', text: `Failed to save: ${error}` });
        }
        setIsSaving(false);
    };

    const handleDelete = async () => {
        try {
            await deleteApiKey();
            setMessage({ type: 'success', text: 'API key deleted' });
            setHasKey(false);
        } catch (error) {
            setMessage({ type: 'error', text: `Failed to delete: ${error}` });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content md" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Settings</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    <div className="settings-section">
                        <h3>Gemini API Key</h3>
                        <p className="settings-description">
                            Get your API key from{' '}
                            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">
                                Google AI Studio
                            </a>
                        </p>

                        <div className="api-key-status">
                            Status: {hasKey ? (
                                <span className="status-configured">✓ Configured</span>
                            ) : (
                                <span className="status-missing">✗ Not configured</span>
                            )}
                        </div>

                        <div className="api-key-input-group">
                            <input
                                type="password"
                                placeholder="Enter your Gemini API key..."
                                value={apiKey}
                                onChange={(e) => setApiKeyValue(e.target.value)}
                                className="api-key-input"
                            />
                            <button
                                className="modal-btn primary"
                                onClick={handleSave}
                                disabled={isSaving}
                            >
                                {isSaving ? 'Saving...' : 'Save'}
                            </button>
                        </div>

                        {hasKey && (
                            <button className="modal-btn danger" style={{ background: 'transparent', color: '#ef4444', border: '1px solid currentColor', marginTop: '12px' }} onClick={handleDelete}>
                                Delete API Key
                            </button>
                        )}

                        {message && (
                            <div className={`message ${message.type}`}>
                                {message.text}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

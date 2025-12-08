import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import './styles/index.css';

interface AppInfo {
    name: string;
    version: string;
}

function App() {
    const [appInfo, setAppInfo] = useState<AppInfo | null>(null);

    useEffect(() => {
        // Get app info from backend
        invoke<AppInfo>('get_app_info').then(setAppInfo).catch(console.error);
    }, []);

    return (
        <div className="app">
            {/* Top Bar */}
            <header className="top-bar">
                <div className="top-bar-left">
                    <span className="app-logo">🍌</span>
                    <span className="app-title">
                        {appInfo?.name || 'BananaSlice'}
                    </span>
                    <span className="app-version">v{appInfo?.version || '0.1.0'}</span>
                </div>
                <div className="top-bar-center">
                    <button className="top-bar-btn">File</button>
                    <button className="top-bar-btn">Edit</button>
                    <button className="top-bar-btn">View</button>
                    <button className="top-bar-btn">Help</button>
                </div>
                <div className="top-bar-right">
                    <button className="top-bar-btn icon-btn" title="Undo">↩</button>
                    <button className="top-bar-btn icon-btn" title="Redo">↪</button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="main-content">
                {/* Left Toolbar */}
                <aside className="toolbar left-toolbar">
                    <div className="tool-group">
                        <button className="tool-btn active" title="Move Tool (V)">
                            <span className="tool-icon">✥</span>
                        </button>
                        <button className="tool-btn" title="Brush Select (B)">
                            <span className="tool-icon">🖌</span>
                        </button>
                        <button className="tool-btn" title="Lasso Select (L)">
                            <span className="tool-icon">◯</span>
                        </button>
                        <button className="tool-btn" title="Eraser (E)">
                            <span className="tool-icon">◻</span>
                        </button>
                    </div>
                    <div className="tool-divider"></div>
                    <div className="tool-group">
                        <button className="tool-btn" title="Zoom In (+)">
                            <span className="tool-icon">🔍+</span>
                        </button>
                        <button className="tool-btn" title="Zoom Out (-)">
                            <span className="tool-icon">🔍-</span>
                        </button>
                    </div>
                </aside>

                {/* Canvas Area */}
                <div className="canvas-container">
                    <div className="canvas-wrapper">
                        <div className="empty-state">
                            <div className="empty-icon">🖼️</div>
                            <h2>Welcome to BananaSlice</h2>
                            <p>Open an image to get started with AI-powered generative fill</p>
                            <button className="primary-btn">Open Image</button>
                        </div>
                    </div>
                </div>

                {/* Right Panel */}
                <aside className="panel right-panel">
                    <div className="panel-section">
                        <h3 className="panel-title">AI Generation</h3>
                        <div className="panel-content">
                            <label className="input-label">
                                Prompt
                                <textarea
                                    className="prompt-input"
                                    placeholder="Describe what you want to generate..."
                                    rows={4}
                                />
                            </label>

                            <div className="model-selector">
                                <label className="input-label">Model</label>
                                <select className="select-input">
                                    <option value="nano-banana-pro">Nano Banana Pro</option>
                                    <option value="nano-banana">Nano Banana</option>
                                </select>
                            </div>

                            <label className="input-label">
                                Strength
                                <input type="range" min="0" max="100" defaultValue="75" className="slider" />
                            </label>

                            <label className="input-label">
                                Guidance
                                <input type="range" min="1" max="20" defaultValue="7" className="slider" />
                            </label>

                            <button className="generate-btn" disabled>
                                Generate Fill
                            </button>
                        </div>
                    </div>

                    <div className="panel-section">
                        <h3 className="panel-title">Brush Settings</h3>
                        <div className="panel-content">
                            <label className="input-label">
                                Size
                                <input type="range" min="1" max="200" defaultValue="50" className="slider" />
                            </label>
                            <label className="input-label">
                                Feather
                                <input type="range" min="0" max="100" defaultValue="10" className="slider" />
                            </label>
                        </div>
                    </div>
                </aside>
            </main>

            {/* Bottom Bar */}
            <footer className="bottom-bar">
                <div className="bottom-bar-left">
                    <span className="status-text">Ready</span>
                </div>
                <div className="bottom-bar-center">
                    <span className="coordinates">X: 0, Y: 0</span>
                </div>
                <div className="bottom-bar-right">
                    <div className="zoom-controls">
                        <button className="zoom-btn">−</button>
                        <span className="zoom-level">100%</span>
                        <button className="zoom-btn">+</button>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default App;

# Changelog

All notable changes to BananaSlice will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-12-20

### Added
- Initial release of BananaSlice
- AI-powered generative fill using Google Gemini (Nano Banana and Nano Banana Pro models)
- Layer-based editing system with visibility, opacity, and drag-to-reorder
- Layer edge feathering control (contextual toolbar appears when layer selected)
- Selection tools: Rectangle, Lasso, and Shape (rectangle/ellipse)
- Move tool for repositioning and transforming layers
- Project file format (`.banslice`) for saving and loading complete projects
- Multi-format export support (PNG, JPG, WEBP, BMP)
- Reference image support for guiding AI generation
- Full undo/redo history
- Keyboard shortcuts for efficient workflow
- Secure API key storage using OS native keychain
- Canvas zoom and pan controls
- Layer panel with drag-and-drop reordering
- Settings modal for API key management
- Toast notifications for user feedback
- Error boundaries for graceful error handling
- Cross-platform support (Windows, macOS, Linux)
- Automated release workflow via GitHub Actions

### Security
- API keys encrypted and stored in OS native keychain (Keychain on macOS, Credential Manager on Windows, Secret Service on Linux)

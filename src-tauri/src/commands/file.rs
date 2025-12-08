// BananaSlice - File I/O Commands
// Handles image loading and saving operations

use base64::{engine::general_purpose::STANDARD, Engine};
use image::ImageFormat;
use serde::Serialize;
use std::fs;
use std::path::Path;

/// Application info response
#[derive(Debug, Serialize)]
pub struct AppInfo {
    pub name: String,
    pub version: String,
}

/// Image data response
#[derive(Debug, Serialize)]
pub struct ImageData {
    pub data: String, // Base64 encoded
    pub width: u32,
    pub height: u32,
    pub format: String,
}

/// Get application info
#[tauri::command]
pub fn get_app_info() -> AppInfo {
    AppInfo {
        name: "BananaSlice".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
    }
}

/// Open and read an image file, returning base64 encoded data
#[tauri::command]
pub async fn open_image(path: String) -> Result<ImageData, String> {
    let path = Path::new(&path);
    
    // Read the image file
    let img = image::open(path).map_err(|e| format!("Failed to open image: {}", e))?;
    
    let width = img.width();
    let height = img.height();
    
    // Determine format from extension
    let format = path
        .extension()
        .and_then(|ext| ext.to_str())
        .unwrap_or("png")
        .to_lowercase();
    
    // Read raw bytes for base64 encoding
    let bytes = fs::read(path).map_err(|e| format!("Failed to read file: {}", e))?;
    let data = STANDARD.encode(&bytes);
    
    Ok(ImageData {
        data,
        width,
        height,
        format,
    })
}

/// Save image data to a file
#[tauri::command]
pub async fn save_image(path: String, data: String, format: String) -> Result<(), String> {
    // Decode base64 data
    let bytes = STANDARD
        .decode(&data)
        .map_err(|e| format!("Failed to decode image data: {}", e))?;
    
    // Determine image format
    let img_format = match format.to_lowercase().as_str() {
        "png" => ImageFormat::Png,
        "jpg" | "jpeg" => ImageFormat::Jpeg,
        "webp" => ImageFormat::WebP,
        _ => ImageFormat::Png,
    };
    
    // Load and save the image
    let img = image::load_from_memory(&bytes)
        .map_err(|e| format!("Failed to parse image: {}", e))?;
    
    img.save_with_format(&path, img_format)
        .map_err(|e| format!("Failed to save image: {}", e))?;
    
    Ok(())
}

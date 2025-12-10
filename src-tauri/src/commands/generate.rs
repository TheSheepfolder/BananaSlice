// BananaSlice - Generation Commands
// Tauri commands for AI image generation

use crate::api::{Model, NanoBananaClient};
use crate::keystore;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct GenerateRequest {
    pub model: String,
    pub prompt: String,
    pub image_base64: String,
    pub mask_base64: String,
}

#[derive(Debug, Serialize)]
pub struct GenerateResponse {
    pub success: bool,
    pub image_base64: Option<String>,
    pub error: Option<String>,
}

/// Generate fill for a selected region
#[tauri::command]
pub async fn generate_fill(request: GenerateRequest) -> GenerateResponse {
    // Get API key from secure storage
    let api_key = match keystore::get_api_key() {
        Ok(key) => key,
        Err(_) => {
            return GenerateResponse {
                success: false,
                image_base64: None,
                error: Some("API key not configured. Please set your Gemini API key in Settings.".to_string()),
            };
        }
    };

    // Parse model
    let model = match request.model.as_str() {
        "nano-banana-pro" => Model::NanoBananaPro,
        "nano-banana" | _ => Model::NanoBanana,
    };

    // Create client and make request
    let client = NanoBananaClient::new(api_key);
    
    match client
        .generate_fill(model, &request.prompt, &request.image_base64, &request.mask_base64)
        .await
    {
        Ok(image_base64) => GenerateResponse {
            success: true,
            image_base64: Some(image_base64),
            error: None,
        },
        Err(e) => GenerateResponse {
            success: false,
            image_base64: None,
            error: Some(e.to_string()),
        },
    }
}

/// Store the API key securely
#[tauri::command]
pub fn set_api_key(api_key: String) -> Result<(), String> {
    keystore::store_api_key(&api_key).map_err(|e| e.to_string())
}

/// Check if API key is configured
#[tauri::command]
pub fn has_api_key() -> bool {
    keystore::has_api_key()
}

/// Delete the stored API key
#[tauri::command]
pub fn delete_api_key() -> Result<(), String> {
    keystore::delete_api_key().map_err(|e| e.to_string())
}

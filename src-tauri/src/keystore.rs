// BananaSlice - Secure API Key Storage
// Uses file-based storage in app data directory

use std::fs;
use std::path::PathBuf;
use thiserror::Error;

const APP_NAME: &str = "bananaslice";
const KEY_FILENAME: &str = "api_key.txt";

#[derive(Error, Debug)]
pub enum KeyringError {
    #[error("Failed to access storage: {0}")]
    AccessError(String),
    
    #[error("API key not found")]
    KeyNotFound,
}

/// Get the app data directory
fn get_app_data_dir() -> Result<PathBuf, KeyringError> {
    let base_dirs = directories::BaseDirs::new()
        .ok_or_else(|| KeyringError::AccessError("Could not find app data directory".to_string()))?;
    
    let app_data = base_dirs.data_local_dir().join(APP_NAME);
    
    // Create directory if it doesn't exist
    if !app_data.exists() {
        fs::create_dir_all(&app_data)
            .map_err(|e| KeyringError::AccessError(format!("Could not create app data dir: {}", e)))?;
    }
    
    Ok(app_data)
}

/// Get the path to the API key file
fn get_key_path() -> Result<PathBuf, KeyringError> {
    Ok(get_app_data_dir()?.join(KEY_FILENAME))
}

/// Store the API key
pub fn store_api_key(api_key: &str) -> Result<(), KeyringError> {
    let key_path = get_key_path()?;
    
    fs::write(&key_path, api_key)
        .map_err(|e| KeyringError::AccessError(format!("Could not write API key: {}", e)))?;
    
    log::info!("API key saved to {:?}", key_path);
    Ok(())
}

/// Retrieve the API key
pub fn get_api_key() -> Result<String, KeyringError> {
    let key_path = get_key_path()?;
    
    if !key_path.exists() {
        return Err(KeyringError::KeyNotFound);
    }
    
    let key = fs::read_to_string(&key_path)
        .map_err(|e| KeyringError::AccessError(format!("Could not read API key: {}", e)))?;
    
    let key = key.trim().to_string();
    
    if key.is_empty() {
        return Err(KeyringError::KeyNotFound);
    }
    
    Ok(key)
}

/// Delete the API key
pub fn delete_api_key() -> Result<(), KeyringError> {
    let key_path = get_key_path()?;
    
    if key_path.exists() {
        fs::remove_file(&key_path)
            .map_err(|e| KeyringError::AccessError(format!("Could not delete API key: {}", e)))?;
    }
    
    Ok(())
}

/// Check if an API key is stored
pub fn has_api_key() -> bool {
    get_api_key().is_ok()
}

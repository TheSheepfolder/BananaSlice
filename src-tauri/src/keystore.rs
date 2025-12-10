// BananaSlice - Secure API Key Storage
// Uses OS keychain for secure storage of API keys

use keyring::Entry;
use thiserror::Error;

const SERVICE_NAME: &str = "bananaslice";
const KEY_NAME: &str = "gemini_api_key";

#[derive(Error, Debug)]
pub enum KeyringError {
    #[error("Failed to access keyring: {0}")]
    AccessError(String),
    
    #[error("API key not found")]
    KeyNotFound,
}

/// Store the API key securely in the OS keychain
pub fn store_api_key(api_key: &str) -> Result<(), KeyringError> {
    let entry = Entry::new(SERVICE_NAME, KEY_NAME)
        .map_err(|e| KeyringError::AccessError(e.to_string()))?;
    
    entry
        .set_password(api_key)
        .map_err(|e| KeyringError::AccessError(e.to_string()))?;
    
    Ok(())
}

/// Retrieve the API key from the OS keychain
pub fn get_api_key() -> Result<String, KeyringError> {
    let entry = Entry::new(SERVICE_NAME, KEY_NAME)
        .map_err(|e| KeyringError::AccessError(e.to_string()))?;
    
    entry
        .get_password()
        .map_err(|e| match e {
            keyring::Error::NoEntry => KeyringError::KeyNotFound,
            _ => KeyringError::AccessError(e.to_string()),
        })
}

/// Delete the API key from the OS keychain
pub fn delete_api_key() -> Result<(), KeyringError> {
    let entry = Entry::new(SERVICE_NAME, KEY_NAME)
        .map_err(|e| KeyringError::AccessError(e.to_string()))?;
    
    entry
        .delete_credential()
        .map_err(|e| KeyringError::AccessError(e.to_string()))?;
    
    Ok(())
}

/// Check if an API key is stored
pub fn has_api_key() -> bool {
    get_api_key().is_ok()
}
